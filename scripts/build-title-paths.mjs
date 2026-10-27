// Regenerates src/utils/titlePaths.ts for the written-out welcome title.
//
//   node scripts/build-title-paths.mjs path/to/font.ttf '{"wght":600}'
//
// For every letter it keeps the real outline from the font (what gets filled in) and works out the letter's
// centre line, the path a pen would follow. The page moves a pen along those centre lines and uncovers the
// outline underneath, so the title looks hand-written in the font's own letterforms.
//
// The second argument sets the font's variation axes (leave it out for a static font).
import { readFileSync, writeFileSync } from 'node:fs'
import { create } from 'fontkit'

const [fontFile, axes = '{}'] = process.argv.slice(2)
if (!fontFile) throw new Error('Pass the path to the title font.')

const TEXT = 'Little Things About You'
const SIZE = 100
const PAD = 8
const PEN = 14
const RES = 4 // raster pixels per unit while finding centre lines
const CURVE_STEPS = 10

const font = create(readFileSync(fontFile)).getVariation(JSON.parse(axes))
const scale = SIZE / font.unitsPerEm
const round = (n) => Math.round(n * 10) / 10

// Outline -> closed polygons in page units (y down).
function polygons(path, ox, baseline) {
  const to = (x, y) => [ox + x * scale, baseline - y * scale]
  const polys = []
  let current = []
  let last = [0, 0]

  for (const { command, args } of path.commands) {
    if (command === 'moveTo') {
      if (current.length > 1) polys.push(current)
      last = args
      current = [to(...args)]
    } else if (command === 'lineTo') {
      last = args
      current.push(to(...args))
    } else if (command === 'quadraticCurveTo') {
      const [cx, cy, x, y] = args
      for (let s = 1; s <= CURVE_STEPS; s++) {
        const t = s / CURVE_STEPS
        const u = 1 - t
        current.push(to(u * u * last[0] + 2 * u * t * cx + t * t * x, u * u * last[1] + 2 * u * t * cy + t * t * y))
      }
      last = [x, y]
    } else if (command === 'bezierCurveTo') {
      const [c1x, c1y, c2x, c2y, x, y] = args
      for (let s = 1; s <= CURVE_STEPS; s++) {
        const t = s / CURVE_STEPS
        const u = 1 - t
        current.push(
          to(
            u ** 3 * last[0] + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t ** 3 * x,
            u ** 3 * last[1] + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t ** 3 * y,
          ),
        )
      }
      last = [x, y]
    } else if (command === 'closePath') {
      if (current.length > 1) polys.push(current)
      current = []
    }
  }
  if (current.length > 1) polys.push(current)
  return polys
}

// Scanline fill with the non-zero rule.
function rasterize(polys) {
  const points = polys.flat()
  const minX = Math.min(...points.map((p) => p[0])) - 1
  const minY = Math.min(...points.map((p) => p[1])) - 1
  const width = Math.ceil((Math.max(...points.map((p) => p[0])) + 1 - minX) * RES)
  const height = Math.ceil((Math.max(...points.map((p) => p[1])) + 1 - minY) * RES)
  const image = new Uint8Array(width * height)

  for (let row = 0; row < height; row++) {
    const y = (row + 0.5) / RES + minY
    const crossings = []
    for (const poly of polys) {
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i]
        const b = poly[(i + 1) % poly.length]
        if (a[1] <= y && b[1] > y) crossings.push([a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]), 1])
        else if (b[1] <= y && a[1] > y) crossings.push([a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]), -1])
      }
    }
    crossings.sort((p, q) => p[0] - q[0])
    let winding = 0
    let from = 0
    for (const [x, direction] of crossings) {
      const before = winding
      winding += direction
      if (before === 0 && winding !== 0) from = x
      if (before !== 0 && winding === 0) {
        const start = Math.max(0, Math.ceil((from - minX) * RES - 0.5))
        const end = Math.min(width - 1, Math.floor((x - minX) * RES - 0.5))
        for (let col = start; col <= end; col++) image[row * width + col] = 1
      }
    }
  }
  return { image, width, height, minX, minY }
}

// Zhang-Suen thinning down to a one-pixel-wide skeleton.
function thin(image, width, height) {
  const at = (x, y) => image[y * width + x]
  let changed = true
  while (changed) {
    changed = false
    for (const step of [0, 1]) {
      const remove = []
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          if (!at(x, y)) continue
          const n = [at(x, y - 1), at(x + 1, y - 1), at(x + 1, y), at(x + 1, y + 1), at(x, y + 1), at(x - 1, y + 1), at(x - 1, y), at(x - 1, y - 1)]
          const neighbours = n.reduce((a, b) => a + b, 0)
          if (neighbours < 2 || neighbours > 6) continue
          let transitions = 0
          for (let i = 0; i < 8; i++) if (n[i] === 0 && n[(i + 1) % 8] === 1) transitions++
          if (transitions !== 1) continue
          const [p2, , p4, , p6, , p8] = n
          const ok = step === 0 ? p2 * p4 * p6 === 0 && p4 * p6 * p8 === 0 : p2 * p4 * p8 === 0 && p2 * p6 * p8 === 0
          if (ok) remove.push(y * width + x)
        }
      }
      if (remove.length) changed = true
      for (const index of remove) image[index] = 0
    }
  }
}

const DIRS = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]]

// Cover the skeleton with pen strokes: walk from line ends, always carrying straight on where there is a choice.
function strokesOf(image, width, height) {
  const alive = (x, y) => x >= 0 && y >= 0 && x < width && y < height && image[y * width + x] === 1
  const neighbours = (i) => {
    const x = i % width
    const y = Math.floor(i / width)
    return DIRS.filter(([dx, dy]) => alive(x + dx, y + dy)).map(([dx, dy]) => (y + dy) * width + x + dx)
  }

  // Drop staircase corners so a bend is not mistaken for a fork.
  for (let i = 0; i < image.length; i++) {
    if (!image[i]) continue
    const around = neighbours(i)
    if (around.length === 2) {
      const [a, b] = around
      const close = Math.abs((a % width) - (b % width)) <= 1 && Math.abs(Math.floor(a / width) - Math.floor(b / width)) <= 1
      if (close) image[i] = 0
    }
  }

  const pixels = []
  for (let i = 0; i < image.length; i++) if (image[i]) pixels.push(i)
  const adjacency = new Map(pixels.map((i) => [i, neighbours(i)]))
  const used = new Set()
  const key = (a, b) => (a < b ? a * image.length + b : b * image.length + a)
  const free = (i) => adjacency.get(i).filter((j) => !used.has(key(i, j)))
  const byX = (a, b) => (a % width) - (b % width) || a - b
  const ends = pixels.filter((i) => adjacency.get(i).length === 1).sort(byX)
  const rest = [...pixels].sort(byX)

  const chains = []
  for (const start of [...ends, ...rest]) {
    while (free(start).length > 0) {
      const chain = [start]
      let current = start
      let heading = null
      for (;;) {
        const options = free(current)
        if (options.length === 0) break
        const dir = (a, b) => [(b % width) - (a % width), Math.floor(b / width) - Math.floor(a / width)]
        const next = heading
          ? options.reduce((best, o) => {
              const [dx, dy] = dir(current, o)
              const [bx, by] = dir(current, best)
              return dx * heading[0] + dy * heading[1] > bx * heading[0] + by * heading[1] ? o : best
            })
          : options[0]
        used.add(key(current, next))
        heading = dir(current, next)
        chain.push(next)
        current = next
      }
      chains.push(chain)
    }
  }
  for (const i of pixels) if (adjacency.get(i).length === 0) chains.push([i, i])
  return chains
}

function simplify(points, tolerance) {
  if (points.length < 3) return points
  const [a, b] = [points[0], points[points.length - 1]]
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
  let worst = 0
  let index = 0
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i]
    const distance = Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / length
    if (distance > worst) {
      worst = distance
      index = i
    }
  }
  if (worst <= tolerance) return [a, b]
  return [...simplify(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplify(points.slice(index), tolerance)]
}

// Catmull-Rom through the points, as cubic curves.
function smooth(points) {
  if (points.length === 2) return `M${round(points[0][0])},${round(points[0][1])} L${round(points[1][0])},${round(points[1][1])}`
  let d = `M${round(points[0][0])},${round(points[0][1])}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${round(c1[0])},${round(c1[1])} ${round(c2[0])},${round(c2[1])} ${round(p2[0])},${round(p2[1])}`
  }
  return d
}

const run = font.layout(TEXT)
const baseline = PAD + SIZE * 0.85
const glyphs = []
let x = PAD
let minY = Infinity
let maxY = -Infinity

run.glyphs.forEach((glyph, i) => {
  const position = run.positions[i]
  const origin = x + position.xOffset * scale
  const base = baseline - position.yOffset * scale
  x += position.xAdvance * scale

  const polys = polygons(glyph.path, origin, base)
  if (polys.length === 0) return
  for (const [, y] of polys.flat()) {
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }

  const { image, width, height, minX, minY: top } = rasterize(polys)
  thin(image, width, height)
  const chains = strokesOf(image, width, height)

  const strokes = chains
    .map((chain) => {
      let points = chain.map((p) => [minX + ((p % width) + 0.5) / RES, top + (Math.floor(p / width) + 0.5) / RES])
      if (points[0][0] > points[points.length - 1][0]) points = points.reverse()
      const simple = simplify(points, 0.7)
      let length = 0
      for (let k = 1; k < simple.length; k++) length += Math.hypot(simple[k][0] - simple[k - 1][0], simple[k][1] - simple[k - 1][1])
      return { points: simple, length, start: simple[0][0] }
    })
    .filter((stroke, _, all) => stroke.length >= 2 || all.length === 1 || stroke.points[0] === stroke.points[1])
    .sort((a, b) => a.start - b.start)
    .map((stroke) => ({ d: smooth(stroke.points), length: round(Math.max(stroke.length, 1)) }))

  const fill = glyph.path
    .scale(scale, -scale)
    .translate(origin, base)
    .toSVG()
    .replace(/-?\d+\.?\d*(?:e-?\d+)?/g, (n) => String(round(Number(n))))
  glyphs.push({ fill, strokes })
})

const top = Math.floor(minY - PEN / 2)
const height = Math.ceil(maxY + PEN / 2) - top
const out = `// Generated by scripts/build-title-paths.mjs. Do not edit by hand.
export const TITLE_TEXT = ${JSON.stringify(TEXT)}
export const TITLE_VIEWBOX = '0 ${top} ${round(x + PAD)} ${height}'
export const TITLE_PEN = ${PEN}

export type TitleGlyph = {
  fill: string
  strokes: readonly { d: string; length: number }[]
}

export const TITLE_GLYPHS: readonly TitleGlyph[] = ${JSON.stringify(glyphs)}
`
writeFileSync(new URL('../src/utils/titlePaths.ts', import.meta.url), out)
console.log(`${glyphs.length} letters, ${glyphs.reduce((n, g) => n + g.strokes.length, 0)} pen strokes, viewBox 0 ${top} ${round(x + PAD)} ${height}`)
