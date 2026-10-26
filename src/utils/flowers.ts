import { NO_FAVORITE, type FlowerName } from '../../shared/questionnaire'

export type Hue = 'rose' | 'ochre' | 'lilac' | 'blue' | 'ivory'
export type Role = 'stem' | 'leaf' | 'petal' | 'detail' | 'dot'
export type Part = { d: string; role: Role; hue?: Hue; foliage?: boolean }
export type Drawing = { hue: Hue; parts: Part[] }

type Shape = 'oval' | 'pointed' | 'notched' | 'ruffled' | 'paddle'
type Center =
  | 'none' | 'disc' | 'seeds' | 'dots' | 'stamens' | 'anthers' | 'spiral' | 'trumpet' | 'ruffle' | 'ringdots' | 'dot'
type LeafStyle = 'oval' | 'strap' | 'sword' | 'needle' | 'broad' | 'heart' | 'compound' | 'pinnate' | 'lance' | 'palmate' | 'pad' | 'upright'
type Point = [number, number]

type Radial = {
  count: number
  length: number
  width: number
  shape: Shape
  layers?: number
  shrink?: number
  r0?: number
  alt?: number
  veins?: boolean
  speckles?: boolean
  seeds?: number
  center?: Center
  centerR?: number
  centerHue?: Hue
}

// Everything is drawn in a 200 x 270 box; the head sits around (100, 85) and the stem ends at y = 258.
const HEAD_X = 100
const HEAD_Y = 85
const GROUND = 258

const f = (n: number) => Math.round(n * 10) / 10
const rad = (degrees: number) => (degrees * Math.PI) / 180
const polar = (cx: number, cy: number, r: number, angle: number): Point => [
  cx + r * Math.sin(rad(angle)),
  cy - r * Math.cos(rad(angle)),
]
const xy = ([x, y]: Point) => `${f(x)},${f(y)}`

function petal(cx: number, cy: number, r0: number, length: number, width: number, shape: Shape, angle: number) {
  const a = rad(angle)
  const pt = (x: number, y: number) => {
    const out = y + r0
    return `${f(cx + x * Math.cos(a) + out * Math.sin(a))},${f(cy + x * Math.sin(a) - out * Math.cos(a))}`
  }
  const L = length
  const w = width
  switch (shape) {
    case 'oval':
      return `M${pt(0, 0)} C${pt(-w, 0.3 * L)} ${pt(-w, 0.8 * L)} ${pt(0, L)} C${pt(w, 0.8 * L)} ${pt(w, 0.3 * L)} ${pt(0, 0)}`
    case 'pointed':
      return `M${pt(0, 0)} C${pt(-w, 0.25 * L)} ${pt(-0.35 * w, 0.7 * L)} ${pt(0, L)} C${pt(0.35 * w, 0.7 * L)} ${pt(w, 0.25 * L)} ${pt(0, 0)}`
    case 'notched':
      return `M${pt(0, 0)} C${pt(-w, 0.3 * L)} ${pt(-w, 0.85 * L)} ${pt(-0.3 * w, L)} L${pt(0, 0.88 * L)} L${pt(0.3 * w, L)} C${pt(w, 0.85 * L)} ${pt(w, 0.3 * L)} ${pt(0, 0)}`
    case 'paddle':
      return `M${pt(0, 0)} C${pt(-0.15 * w, 0.3 * L)} ${pt(-w, 0.55 * L)} ${pt(-0.85 * w, 0.88 * L)} C${pt(-0.6 * w, 1.02 * L)} ${pt(0.6 * w, 1.02 * L)} ${pt(0.85 * w, 0.88 * L)} C${pt(w, 0.55 * L)} ${pt(0.15 * w, 0.3 * L)} ${pt(0, 0)}`
    case 'ruffled':
      return `M${pt(0, 0)} C${pt(-w, 0.3 * L)} ${pt(-w, 0.72 * L)} ${pt(-0.75 * w, 0.9 * L)} Q${pt(-0.55 * w, 1.04 * L)} ${pt(-0.35 * w, 0.96 * L)} Q${pt(-0.18 * w, 1.06 * L)} ${pt(0, 0.97 * L)} Q${pt(0.18 * w, 1.06 * L)} ${pt(0.35 * w, 0.96 * L)} Q${pt(0.55 * w, 1.04 * L)} ${pt(0.75 * w, 0.9 * L)} C${pt(w, 0.72 * L)} ${pt(w, 0.3 * L)} ${pt(0, 0)}`
  }
}

const circle = (cx: number, cy: number, r: number) =>
  `M${f(cx - r)},${f(cy)} a${f(r)},${f(r)} 0 1,0 ${f(2 * r)},0 a${f(r)},${f(r)} 0 1,0 ${f(-2 * r)},0`

const line = (a: Point, b: Point) => `M${xy(a)} L${xy(b)}`

const branch = (x0: number, y0: number, x1: number, y1: number) => {
  const mid = f((y0 + y1) / 2)
  return `M${f(x0)},${f(y0)} C${f(x0)},${mid} ${f(x1)},${mid} ${f(x1)},${f(y1)}`
}

function centerParts(cx: number, cy: number, s: number, o: Radial): Part[] {
  const hue = o.centerHue
  const size = (o.centerR ?? 8) * s
  switch (o.center ?? 'none') {
    case 'none':
      return []
    case 'dot':
      return [{ d: circle(cx, cy, 2.2 * s), role: 'dot', hue }]
    case 'disc':
      return [{ d: circle(cx, cy, size), role: 'detail', hue }]
    case 'trumpet':
      return [
        { d: circle(cx, cy, size), role: 'detail', hue },
        { d: circle(cx, cy, size * 0.55), role: 'detail', hue },
      ]
    case 'ruffle': {
      const points = Array.from({ length: 49 }, (_, i) => {
        const t = (i / 48) * 2 * Math.PI
        const r = size * (1 + 0.12 * Math.sin(8 * t))
        return `${i === 0 ? 'M' : 'L'}${f(cx + r * Math.cos(t))},${f(cy + r * Math.sin(t))}`
      })
      return [
        { d: points.join(' '), role: 'detail', hue },
        { d: circle(cx, cy, size * 0.62), role: 'detail', hue },
      ]
    }
    case 'ringdots': {
      const ring = Array.from({ length: 18 }, (_, i): Part => {
        const t = rad((i * 360) / 18)
        return { d: circle(cx + size * Math.cos(t), cy + size * Math.sin(t), 1), role: 'dot', hue }
      })
      return [{ d: circle(cx, cy, size * 0.45), role: 'detail', hue }, ...ring]
    }
    case 'seeds': {
      const count = o.seeds ?? 18
      const seeds = Array.from({ length: count }, (_, i): Part => {
        const r = size * 0.88 * Math.sqrt((i + 1) / count)
        const t = rad((i + 1) * 137.5)
        return { d: circle(cx + r * Math.cos(t), cy + r * Math.sin(t), count > 30 ? 0.9 : 1), role: 'dot', hue }
      })
      return [{ d: circle(cx, cy, size), role: 'detail', hue }, ...seeds]
    }
    case 'dots': {
      const ring = Array.from({ length: 7 }, (_, i): Part => {
        const t = rad((i * 360) / 7)
        return { d: circle(cx + size * 0.7 * Math.cos(t), cy + size * 0.7 * Math.sin(t), 1.2 * s), role: 'dot', hue }
      })
      return [...ring, { d: circle(cx, cy, 1.4 * s), role: 'dot', hue }]
    }
    case 'stamens': {
      const length = (o.centerR ?? 14) * s
      return Array.from({ length: 6 }, (_, i): Part[] => {
        const [x, y] = polar(cx, cy, length, i * 60 + 20)
        return [
          { d: line([cx, cy], [x, y]), role: 'detail', hue },
          { d: circle(x, y, 1.5 * s), role: 'dot', hue },
        ]
      }).flat()
    }
    case 'anthers': {
      const length = (o.centerR ?? 22) * s
      const filaments = Array.from({ length: 6 }, (_, i): Part[] => {
        const angle = i * 60 + 30
        const [x, y] = polar(cx, cy, length, angle)
        return [
          { d: line([cx, cy], [x, y]), role: 'detail', hue },
          { d: petal(x, y, 0, 8 * s, 2.8 * s, 'oval', angle + 90), role: 'dot', hue },
        ]
      }).flat()
      const [px, py] = polar(cx, cy, length * 1.15, 12)
      return [...filaments, { d: line([cx, cy], [px, py]), role: 'detail' }, { d: circle(px, py, 1.8 * s), role: 'dot' }]
    }
    case 'spiral': {
      const points = Array.from({ length: 41 }, (_, i) => {
        const t = i / 40
        const a = t * 3.2 * 2 * Math.PI
        return `L${f(cx + size * t * Math.cos(a))},${f(cy + size * t * Math.sin(a))}`
      })
      return [{ d: `M${f(cx)},${f(cy)} ${points.join(' ')}`, role: 'detail', hue }]
    }
  }
}

function radial(cx: number, cy: number, s: number, o: Radial): { parts: Part[]; bottom: number } {
  const layers = o.layers ?? 1
  const shrink = o.shrink ?? 0.65
  const r0 = (o.r0 ?? 0) * s
  const parts: Part[] = []

  for (let layer = 0; layer < layers; layer++) {
    const k = layers === 1 ? 1 : 1 - (layer * shrink) / (layers - 1)
    const offset = (layer % 2) * (180 / o.count)
    for (let i = 0; i < o.count; i++) {
      const alt = o.alt && i % 2 ? o.alt : 1
      const angle = (i * 360) / o.count + offset
      const length = o.length * s * k * alt
      parts.push({ d: petal(cx, cy, r0 * k, length, o.width * s * k, o.shape, angle), role: 'petal' })

      if (layer !== 0) continue
      if (o.veins) {
        parts.push({ d: line(polar(cx, cy, r0, angle), polar(cx, cy, r0 + 0.8 * length, angle)), role: 'detail' })
      }
      if (o.speckles) {
        ;[0.36, 0.5, 0.64].forEach((fraction, j) => {
          const [x, y] = polar(cx, cy, r0 + fraction * length, angle)
          const lateral = (j % 2 ? 1 : -1) * 0.12 * o.width * s
          const nudge = polar(0, 0, lateral, angle + 90)
          parts.push({ d: circle(x + nudge[0], y + nudge[1], 0.9 * s), role: 'dot', hue: o.centerHue })
        })
      }
    }
  }

  return { parts: [...parts, ...centerParts(cx, cy, s, o)], bottom: cy + ((o.r0 ?? 0) + o.length) * s }
}

const heartLeaf = (x: number, y: number, side: number, size: number): Part[] => {
  const tx = x + side * size
  const ty = y - 0.25 * size
  return [
    {
      role: 'leaf',
      d: `M${f(x)},${f(y)} C${f(x + side * 0.15 * size)},${f(y + 0.28 * size)} ${f(x + side * 0.68 * size)},${f(y + 0.32 * size)} ${f(tx)},${f(ty)} C${f(x + side * 0.6 * size)},${f(y - 0.62 * size)} ${f(x + side * 0.2 * size)},${f(y - 0.48 * size)} ${f(x)},${f(y)}`,
    },
    { role: 'stem', d: line([x, y], [tx, ty]) },
  ]
}

function compoundLeaf(x: number, y: number, side: number, pairs: number, reach: number, size: number, width: number): Part[] {
  const angle = side * 62
  const [ex, ey] = polar(x, y, reach, angle)
  const parts: Part[] = [{ role: 'stem', d: line([x, y], [ex, ey]) }]
  for (let k = 0; k < pairs; k++) {
    const fraction = pairs === 1 ? 0.5 : 0.25 + (0.5 * k) / (pairs - 1)
    const [mx, my] = polar(x, y, reach * fraction, angle)
    parts.push(
      { role: 'leaf', d: petal(mx, my, 0, size, width, 'pointed', angle - 60) },
      { role: 'leaf', d: petal(mx, my, 0, size, width, 'pointed', angle + 60) },
    )
  }
  parts.push({ role: 'leaf', d: petal(ex, ey, 0, size * 1.15, width * 1.1, 'pointed', angle) })
  return parts
}

// Leaves are flagged so a bouquet can keep the foliage of just one flower.
const leafParts = (style: LeafStyle): Part[] => rawLeafParts(style).map((part) => ({ ...part, foliage: true }))

function rawLeafParts(style: LeafStyle): Part[] {
  switch (style) {
    case 'oval':
      return [
        { role: 'leaf', d: 'M98,214 C72,212 54,196 48,176 C74,176 94,192 98,214' },
        { role: 'stem', d: 'M98,214 C82,200 66,188 52,180' },
        { role: 'leaf', d: 'M102,188 C128,186 146,170 152,150 C126,150 106,166 102,188' },
        { role: 'stem', d: 'M102,188 C118,174 136,162 148,154' },
      ]
    case 'strap':
      return [
        { role: 'leaf', d: 'M94,258 C80,212 60,174 46,136 C68,172 92,212 106,258' },
        { role: 'leaf', d: 'M96,258 C112,220 134,186 156,150 C130,184 110,220 106,258' },
        { role: 'leaf', d: 'M98,258 C92,226 78,198 70,172 C86,196 102,224 104,258' },
      ]
    case 'sword':
      return [
        { role: 'leaf', d: 'M92,258 C88,214 90,160 100,116 C104,160 104,214 106,258' },
        { role: 'leaf', d: 'M96,258 C104,220 118,176 136,136 C126,184 114,224 108,258' },
      ]
    case 'needle':
      return [
        'M98,258 C84,226 70,196 58,164',
        'M100,258 C94,224 90,196 84,168',
        'M102,258 C110,226 124,198 138,170',
        'M100,258 C108,230 112,204 112,176',
        'M99,258 C74,244 56,226 42,200',
      ].map((d): Part => ({ role: 'stem', d }))
    case 'broad':
      return [
        { role: 'leaf', d: 'M100,258 C70,258 38,244 24,220 C56,212 92,226 100,258' },
        { role: 'stem', d: 'M100,256 C80,244 52,228 30,222' },
        { role: 'leaf', d: 'M100,258 C130,258 162,244 176,220 C144,212 108,226 100,258' },
        { role: 'stem', d: 'M100,256 C120,244 148,228 170,222' },
      ]
    case 'heart':
      return [...heartLeaf(98, 214, -1, 54), ...heartLeaf(102, 186, 1, 54)]
    case 'compound':
      return [...compoundLeaf(98, 214, -1, 1, 46, 22, 8), ...compoundLeaf(102, 186, 1, 1, 46, 22, 8)]
    case 'pinnate':
      return [...compoundLeaf(98, 214, -1, 3, 52, 14, 4.5), ...compoundLeaf(102, 186, 1, 3, 52, 14, 4.5)]
    case 'palmate': {
      const cluster = (px: number, py: number, side: number): Part[] => [
        { role: 'stem', d: line([side < 0 ? 98 : 102, side < 0 ? 214 : 190], [px, py]) },
        ...[-60, -30, 0, 30, 60].map((a): Part => ({ role: 'leaf', d: petal(px, py, 0, 28, 5.5, 'pointed', side * 70 + a) })),
      ]
      return [...cluster(66, 196, -1), ...cluster(136, 172, 1)]
    }
    case 'pad': {
      const pad = (cx: number, cy: number, rx: number, ry: number): Part[] => [
        { role: 'leaf', d: ellipse(cx, cy, rx, ry) },
        ...Array.from({ length: 9 }, (_, i): Part => {
          const t = rad(i * 40)
          return { role: 'stem', d: line([cx, cy], [cx + rx * 0.92 * Math.cos(t), cy + ry * 0.92 * Math.sin(t)]) }
        }),
      ]
      return [
        { role: 'stem', d: 'M99,222 C86,214 72,206 60,198' },
        ...pad(54, 196, 30, 22),
        { role: 'stem', d: 'M101,194 C116,188 128,182 140,176' },
        ...pad(146, 172, 24, 18),
      ]
    }
    case 'upright':
      return [
        { role: 'leaf', d: 'M98,258 C62,246 48,196 70,150 C84,186 98,220 100,258' },
        { role: 'stem', d: 'M98,256 C84,222 74,186 70,154' },
        { role: 'leaf', d: 'M102,258 C140,244 154,200 134,160 C118,194 104,224 100,258' },
        { role: 'stem', d: 'M102,256 C118,224 130,192 134,164' },
      ]
    case 'lance':
      return Array.from({ length: 5 }, (_, i): Part => {
        const side = i % 2 ? 1 : -1
        return { role: 'leaf', d: petal(HEAD_X, 232 - i * 26, 0, 46 - i * 3, 7, 'pointed', side * 64) }
      })
  }
}

const stem = (bottom: number): Part => ({
  role: 'stem',
  d: `M${HEAD_X},${GROUND} C93,230 108,${f(bottom + 40)} ${HEAD_X},${f(bottom)}`,
})

const plant = (hue: Hue, head: Part[], bottom: number, leaf: LeafStyle = 'oval'): Drawing => ({
  hue,
  parts: [stem(bottom), ...leafParts(leaf), ...head],
})

const bloom = (hue: Hue, options: Radial, leaf: LeafStyle = 'oval') => (): Drawing => {
  const head = radial(HEAD_X, HEAD_Y, 1, options)
  return plant(hue, head.parts, head.bottom, leaf)
}

const floret = (cx: number, cy: number, s: number): Part => ({
  role: 'petal',
  d: [0, 90, 180, 270].map((angle) => petal(cx, cy, 1.5 * s, 9 * s, 4.5 * s, 'oval', angle)).join(' '),
})

const cup = (hue: Hue, leaf: LeafStyle = 'oval', extras: Part[] = []) => (): Drawing => {
  const head: Part[] = [
    { role: 'petal', d: 'M100,128 C76,124 68,92 76,56 C90,70 98,92 100,128' },
    { role: 'petal', d: 'M100,128 C124,124 132,92 124,56 C110,70 102,92 100,128' },
    { role: 'petal', d: 'M100,128 C86,102 90,72 100,50 C110,72 114,102 100,128' },
  ]
  return plant(hue, [...head, ...extras], 128, leaf)
}

function rose(): Drawing {
  const head: Part[] = [
    { role: 'petal', d: 'M60,80 C56,56 76,44 100,46 C124,44 144,56 140,80 C142,106 122,130 100,130 C78,130 58,106 60,80' },
    { role: 'petal', d: 'M60,84 C66,104 82,122 100,126 C92,108 86,92 90,78 C80,86 68,88 60,84' },
    { role: 'petal', d: 'M140,84 C134,104 118,122 100,126 C108,108 114,92 110,78 C120,86 132,88 140,84' },
    { role: 'petal', d: 'M80,84 C72,66 78,52 96,50 C92,62 94,74 100,84' },
    { role: 'petal', d: 'M120,84 C128,66 122,52 104,50 C108,62 106,74 100,84' },
    { role: 'detail', d: 'M95,64 C95,54 108,54 108,63 C108,71 98,71 98,64' },
    { role: 'leaf', d: 'M100,130 C86,132 76,140 70,152 C86,150 96,142 100,130' },
    { role: 'leaf', d: 'M100,130 C114,132 124,140 130,152 C114,150 104,142 100,130' },
  ]
  return plant('rose', head, 130, 'compound')
}

function iris(): Drawing {
  const cy = 92
  const standards: Part[] = [
    { role: 'petal', d: petal(HEAD_X, cy, 2, 44, 21, 'oval', -22) },
    { role: 'petal', d: petal(HEAD_X, cy, 2, 44, 21, 'oval', 22) },
    { role: 'petal', d: petal(HEAD_X, cy, 2, 48, 17, 'oval', 0) },
  ]
  const falls = [-128, 128, 180].map((angle): Part => ({
    role: 'petal',
    d: petal(HEAD_X, cy, 4, angle === 180 ? 38 : 46, angle === 180 ? 18 : 24, 'oval', angle),
  }))
  const beard = [-128, 128, 180].flatMap((angle) => [
    { role: 'detail', d: line(polar(HEAD_X, cy, 8, angle), polar(HEAD_X, cy, 32, angle)), hue: 'ochre' } satisfies Part,
    ...[14, 20, 26].map((r): Part => ({ role: 'dot', d: circle(...polar(HEAD_X, cy, r, angle), 1), hue: 'ochre' })),
  ])
  return plant('lilac', [...standards, ...falls, ...beard], 138, 'sword')
}

function hibiscus(): Drawing {
  const head = radial(HEAD_X, HEAD_Y, 1, {
    count: 5, length: 44, width: 29, shape: 'ruffled', center: 'trumpet', centerR: 8, centerHue: 'lilac',
  })
  const tip: Point = [121, 50]
  const column: Part[] = [
    { role: 'detail', d: `M${HEAD_X},${HEAD_Y} C106,74 113,62 ${xy(tip)}` },
    ...Array.from({ length: 8 }, (_, i): Part => {
      const [x, y] = polar(116, 58, 6, i * 45)
      return { role: 'dot', d: circle(x, y, 1.1), hue: 'ochre' }
    }),
    ...Array.from({ length: 5 }, (_, i): Part => {
      const [x, y] = polar(tip[0] + 3, tip[1] - 2, 4, i * 72)
      return { role: 'dot', d: circle(x, y, 1.2) }
    }),
  ]
  return plant('rose', [...head.parts, ...column], head.bottom, 'heart')
}

function phalaenopsis(cx: number, cy: number): Part[] {
  return [
    { role: 'petal', d: petal(cx, cy, 3, 36, 15, 'oval', -142) },
    { role: 'petal', d: petal(cx, cy, 3, 36, 15, 'oval', 142) },
    { role: 'petal', d: petal(cx, cy, 3, 36, 16, 'oval', 0) },
    { role: 'petal', d: petal(cx, cy, 3, 40, 28, 'oval', -76) },
    { role: 'petal', d: petal(cx, cy, 3, 40, 28, 'oval', 76) },
    { role: 'petal', d: petal(cx, cy, 2, 14, 6, 'oval', 140) },
    { role: 'petal', d: petal(cx, cy, 2, 14, 6, 'oval', 220) },
    { role: 'petal', d: petal(cx, cy, 2, 24, 10, 'pointed', 180) },
    { role: 'dot', d: circle(cx, cy, 2.6) },
  ]
}

type Bezier = [Point, Point, Point, Point]
const along = ([p0, p1, p2, p3]: Bezier, t: number): Point => {
  const u = 1 - t
  const [a, b, c, d] = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t]
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]
}

type SprayItem = { t: number; dx: number; dy: number; s?: number; bud?: boolean }

// A flowering branch: blooms and buds hang off a curved stem on short stalks.
function spray(
  hue: Hue,
  curve: Bezier,
  flower: Radial,
  items: SprayItem[],
  options: { leaf?: LeafStyle; extra?: Part[] } = {},
): Drawing {
  const stalks: Part[] = []
  const heads: Part[] = []

  for (const { t, dx, dy, s = 0.55, bud } of items) {
    const [bx, by] = along(curve, t)
    const cx = bx + dx
    const cy = by + dy
    if (bud) {
      stalks.push({ role: 'stem', d: branch(bx, by, cx, cy + 9) })
      heads.push({ role: 'petal', d: petal(cx, cy + 9, 0, 17, 6.5, 'oval', dx > 0 ? 16 : -16) })
    } else {
      const { parts, bottom } = radial(cx, cy, s, flower)
      stalks.push({ role: 'stem', d: branch(bx, by, cx, bottom) })
      heads.push(...parts)
    }
  }

  const [p0, p1, p2, p3] = curve
  return {
    hue,
    parts: [
      { role: 'stem', d: `M${xy(p0)} C${xy(p1)} ${xy(p2)} ${xy(p3)}` },
      ...stalks,
      ...leafParts(options.leaf ?? 'oval'),
      ...(options.extra ?? []),
      ...heads,
    ],
  }
}

const cherryBlossom = () =>
  spray(
    'rose',
    [[100, 258], [70, 190], [76, 110], [150, 52]],
    { count: 5, length: 38, width: 20, shape: 'notched', center: 'stamens', centerR: 13, centerHue: 'ochre' },
    [
      { t: 0.4, dx: -30, dy: -22 },
      { t: 0.62, dx: 34, dy: -18 },
      { t: 0.8, dx: -26, dy: -30, s: 0.5 },
      { t: 1, dx: 0, dy: -6, s: 0.5 },
      { t: 0.72, dx: 24, dy: -34, bud: true },
    ],
  )

const jasmine = () =>
  spray(
    'ivory',
    [[100, 258], [104, 200], [96, 140], [118, 60]],
    { count: 5, length: 34, width: 9, shape: 'pointed', center: 'dot', centerHue: 'ochre' },
    [
      { t: 0.45, dx: -28, dy: -14 },
      { t: 0.62, dx: 30, dy: -14 },
      { t: 0.8, dx: -26, dy: -16 },
      { t: 1, dx: 0, dy: -4, s: 0.5 },
      { t: 0.7, dx: 26, dy: -30, bud: true },
    ],
    { leaf: 'pinnate' },
  )

const orchid = () =>
  spray(
    'lilac',
    [[100, 250], [102, 190], [92, 150], [100, 124]],
    { count: 1, length: 1, width: 1, shape: 'oval' },
    [
      { t: 0.42, dx: -22, dy: -6, bud: true },
      { t: 0.68, dx: 22, dy: -8, bud: true },
    ],
    { leaf: 'broad', extra: phalaenopsis(HEAD_X, 86) },
  )

function spike(hue: Hue, levels: number, size: number, leaf: LeafStyle = 'oval'): () => Drawing {
  return () => {
    const top = 34
    const base = 140
    const step = (base - top) / levels
    const head: Part[] = Array.from({ length: levels }, (_, i): Part => {
      const y = base - i * step
      const k = 1 - (i / levels) * 0.45
      const d = [-40, 40].map((angle) => petal(HEAD_X, y, 2, size * k * 2.2, size * k * 0.9, 'oval', angle)).join(' ')
      return { role: 'petal', d }
    })
    head.push({ role: 'petal', d: petal(HEAD_X, top, 0, size * 1.4, size * 0.6, 'oval', 0) })
    return {
      hue,
      parts: [{ role: 'stem', d: `M${HEAD_X},${GROUND} C94,220 106,150 ${HEAD_X},${top + size}` }, ...leafParts(leaf), ...head],
    }
  }
}

function lilac(): Drawing {
  const rows = [1, 2, 3, 4, 5, 6, 5, 3]
  const head = rows.flatMap((count, row) =>
    Array.from({ length: count }, (_, j): Part =>
      floret(HEAD_X + (j - (count - 1) / 2) * 15 + Math.sin(row * 3 + j * 5) * 1.5, 38 + row * 12, 0.7),
    ),
  )
  return plant('lilac', head, 134, 'heart')
}

const ball = (hue: Hue, s: number, leaf: LeafStyle = 'oval', star = false) => (): Drawing => {
  const ring = (count: number, radius: number) =>
    Array.from({ length: count }, (_, i): Point => {
      const a = rad((i * 360) / count)
      return [HEAD_X + radius * Math.cos(a), HEAD_Y + radius * Math.sin(a)]
    })
  const centers: Point[] = [[HEAD_X, HEAD_Y], ...ring(6, 22), ...ring(12, 42)]
  return plant(hue, centers.map(([x, y]) => (star ? starFloret : floret)(x, y, s)), 134, leaf)
}

function babysBreath(): Drawing {
  const tips: Point[] = [[60, 92], [84, 58], [116, 50], [142, 84], [100, 104], [72, 124]]
  const twigs = tips.map(([x, y]): Part => ({ role: 'stem', d: branch(HEAD_X, 150, x, y + 6) }))
  const dots = tips.flatMap(([x, y]): Part[] => [
    { role: 'dot', d: circle(x, y, 3.4) },
    { role: 'dot', d: circle(x - 7, y + 3, 2.2) },
    { role: 'dot', d: circle(x + 7, y + 1, 2.2) },
  ])
  return {
    hue: 'ivory',
    parts: [{ role: 'stem', d: `M${HEAD_X},${GROUND} C93,230 108,200 ${HEAD_X},150` }, ...twigs, ...leafParts('needle'), ...dots],
  }
}

function wildflowers(): Drawing {
  const flowers = [
    { x: 62, y: 112, s: 1, o: { count: 10, length: 18, width: 4, shape: 'oval', center: 'disc', centerR: 4, centerHue: 'ochre' } },
    { x: 100, y: 78, s: 1, o: { count: 5, length: 22, width: 14, shape: 'oval', center: 'dot', centerHue: 'ochre' } },
    { x: 140, y: 120, s: 1, o: { count: 8, length: 16, width: 5, shape: 'pointed', center: 'disc', centerR: 3.5 } },
  ] satisfies { x: number; y: number; s: number; o: Radial }[]
  const hues: Hue[] = ['ivory', 'rose', 'blue']
  const built = flowers.map(({ x, y, s, o }, i) => {
    const head = radial(x, y, s, o)
    return { ...head, parts: head.parts.map((part): Part => ({ ...part, hue: part.hue ?? hues[i] })), x }
  })
  const stems = built.map(({ x, bottom }): Part => ({ role: 'stem', d: branch(HEAD_X, GROUND, x, bottom) }))
  return { hue: 'rose', parts: [...stems, ...leafParts('oval'), ...built.flatMap((b) => b.parts)] }
}

function bud(): Drawing {
  const head: Part[] = [
    { role: 'petal', d: 'M100,120 C82,104 84,72 100,50 C116,72 118,104 100,120' },
    { role: 'detail', d: 'M100,118 C96,96 98,72 100,54' },
    { role: 'leaf', d: 'M100,120 C90,116 86,108 84,98 C94,100 99,108 100,120' },
    { role: 'leaf', d: 'M100,120 C110,116 114,108 116,98 C106,100 101,108 100,120' },
  ]
  return plant('rose', head, 120)
}

const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${f(cx - rx)},${f(cy)} a${f(rx)},${f(ry)} 0 1,0 ${f(2 * rx)},0 a${f(rx)},${f(ry)} 0 1,0 ${f(-2 * rx)},0`

const scallop = (cx: number, cy: number, r: number, lobes: number, amp: number) =>
  Array.from({ length: 73 }, (_, i) => {
    const t = (i / 72) * 2 * Math.PI
    const radius = r * (1 + amp * Math.cos(lobes * t))
    return `${i === 0 ? 'M' : 'L'}${f(cx + radius * Math.cos(t))},${f(cy + radius * Math.sin(t))}`
  }).join(' ') + ' Z'

const starFloret = (cx: number, cy: number, s: number): Part => ({
  role: 'petal',
  d: [0, 60, 120, 180, 240, 300].map((angle) => petal(cx, cy, 0.5 * s, 11 * s, 3 * s, 'pointed', angle)).join(' '),
})

const radialMake = (options: Radial) => (x: number, y: number, s: number) => radial(x, y, s, options).parts

type Raceme = {
  make: (x: number, y: number, s: number, side: number) => Part[]
  count: number
  big: number
  small: number
  spread: number
  side?: 1 | -1
  leaf?: LeafStyle
}

// Florets climb a straight stem, large at the bottom and small near the tip.
const raceme = (hue: Hue, o: Raceme) => (): Drawing => {
  const top = 40
  const base = 150
  const stalks: Part[] = []
  const heads: Part[] = []

  for (let i = 0; i < o.count; i++) {
    const u = o.count === 1 ? 0 : i / (o.count - 1)
    const y = base - u * (base - top)
    const s = o.big + (o.small - o.big) * u
    const side = o.side ?? (i % 2 ? 1 : -1)
    const x = HEAD_X + side * o.spread * (1 - 0.4 * u)
    stalks.push({ role: 'stem', d: line([HEAD_X, y + 4], [x, y]) })
    heads.push(...o.make(x, y, s, side))
  }
  heads.push({ role: 'petal', d: petal(HEAD_X, top + 2, 0, 12 * o.small + 6, 5 * o.small + 3, 'oval', 0) })

  return {
    hue,
    parts: [
      { role: 'stem', d: `M${HEAD_X},${GROUND} C94,220 106,150 ${HEAD_X},${top}` },
      ...stalks,
      ...leafParts(o.leaf ?? 'oval'),
      ...heads,
    ],
  }
}

const snap = (x: number, y: number, s: number, side: number): Part[] => [
  { role: 'petal', d: petal(x, y, 0, 14 * s, 6 * s, 'oval', -side * 95) },
  { role: 'petal', d: petal(x, y, 0, 24 * s, 10 * s, 'oval', side * 72) },
  { role: 'petal', d: petal(x, y, 0, 21 * s, 9.5 * s, 'oval', side * 118) },
]

type Anchor = [number, number, number]
type Pendant = (x: number, y: number, s: number) => Part[]

const at = (x: number, y: number, s: number) => (a: number, b: number) => `${f(x + a * s)},${f(y + b * s)}`

const roundBell: Pendant = (x, y, s) => {
  const p = at(x, y, s)
  return [
    {
      role: 'petal',
      d: `M${p(0, 0)} C${p(-9, 1)} ${p(-11, 10)} ${p(-10, 17)} Q${p(-6, 21)} ${p(-3.3, 17.5)} Q${p(0, 21)} ${p(3.3, 17.5)} Q${p(6, 21)} ${p(10, 17)} C${p(11, 10)} ${p(9, 1)} ${p(0, 0)}`,
    },
  ]
}

const flaredBell: Pendant = (x, y, s) => {
  const p = at(x, y, s)
  return [
    {
      role: 'petal',
      d: `M${p(0, 0)} C${p(-5, 2)} ${p(-6, 12)} ${p(-8, 18)} C${p(-11, 22)} ${p(-15, 22)} ${p(-16, 20)} C${p(-12, 26)} ${p(-6, 27)} ${p(0, 26)} C${p(6, 27)} ${p(12, 26)} ${p(16, 20)} C${p(15, 22)} ${p(11, 22)} ${p(8, 18)} C${p(6, 12)} ${p(5, 2)} ${p(0, 0)}`,
    },
  ]
}

const tubeBell: Pendant = (x, y, s) => {
  const p = at(x, y, s)
  return [
    { role: 'petal', d: `M${p(0, 0)} C${p(-8, 2)} ${p(-11, 14)} ${p(-11, 24)} C${p(-11, 30)} ${p(11, 30)} ${p(11, 24)} C${p(11, 14)} ${p(8, 2)} ${p(0, 0)}` },
    { role: 'detail', d: ellipse(x, y + 25 * s, 9 * s, 3.5 * s) },
    ...[-3.5, 0, 3.5].map((dx, i): Part => ({ role: 'dot', d: circle(x + dx * s, y + (25.5 + (i % 2)) * s, 0.9) })),
  ]
}

const heartBell: Pendant = (x, y, s) => {
  const p = at(x, y, s)
  return [
    { role: 'petal', d: `M${p(0, 3)} C${p(-9, -6)} ${p(-18, 6)} ${p(-10, 15)} C${p(-6, 19)} ${p(-2, 22)} ${p(0, 26)} C${p(2, 22)} ${p(6, 19)} ${p(10, 15)} C${p(18, 6)} ${p(9, -6)} ${p(0, 3)}` },
    { role: 'petal', hue: 'ivory', d: `M${p(0, 26)} C${p(-3, 30)} ${p(-3, 34)} ${p(0, 37)} C${p(3, 34)} ${p(3, 30)} ${p(0, 26)}` },
  ]
}

const fuchsiaBell: Pendant = (x, y, s) => {
  const p = at(x, y, s)
  return [
    { role: 'petal', d: ellipse(x, y + 6 * s, 3 * s, 4 * s) },
    ...[140, 165, 195, 220].map((angle): Part => ({ role: 'petal', d: petal(x, y + 9 * s, 0, 19 * s, 4.5 * s, 'pointed', angle) })),
    { role: 'petal', hue: 'lilac', d: `M${p(-5, 10)} C${p(-11, 16)} ${p(-11, 28)} ${p(-5, 32)} C${p(-2, 34)} ${p(2, 34)} ${p(5, 32)} C${p(11, 28)} ${p(11, 16)} ${p(5, 10)}` },
    ...[-3, 0, 3].flatMap((dx): Part[] => [
      { role: 'detail', d: line([x + dx * s, y + 22 * s], [x + dx * 1.6 * s, y + 46 * s]) },
      { role: 'dot', d: circle(x + dx * 1.6 * s, y + 46 * s, 1.2) },
    ]),
  ]
}

const snowdropBell: Pendant = (x, y, s) => [
  { role: 'petal', d: petal(x, y, 0, 30 * s, 9 * s, 'oval', 180) },
  { role: 'petal', d: petal(x, y, 0, 28 * s, 8 * s, 'oval', 160) },
  { role: 'petal', d: petal(x, y, 0, 28 * s, 8 * s, 'oval', 200) },
  { role: 'petal', hue: 'ochre', d: petal(x, y + 3 * s, 0, 12 * s, 4.5 * s, 'oval', 180) },
]

const ANCHORS: Anchor[] = [[97, 165, -1], [99, 135, 1], [103, 105, -1], [112, 63, 1], [146, 44, -1]]

// Nodding flowers hang from short stalks along an arching stem.
const pendants =
  (hue: Hue, shape: Pendant, scale: number, leaf: LeafStyle = 'oval', anchors: Anchor[] = ANCHORS) =>
  (): Drawing => {
    const head = anchors.flatMap(([ax, ay, side]): Part[] => {
      const bx = ax + side * 12 * scale
      const by = ay + 6
      return [{ role: 'detail', d: `M${ax},${ay} Q${f(ax + side * 8)},${ay - 1} ${f(bx)},${by}` }, ...shape(bx, by, scale)]
    })
    return {
      hue,
      parts: [{ role: 'stem', d: `M${HEAD_X},${GROUND} C97,200 95,130 104,86 C110,56 128,40 146,44` }, ...leafParts(leaf), ...head],
    }
  }

const face = (hue: Hue, s: number, blotch: number, leaf: LeafStyle) => (): Drawing => {
  const cx = HEAD_X
  const cy = 84
  const petals: Part[] = [
    ...[-82, 82].map((a): Part => ({ role: 'petal', d: petal(cx, cy, 1, 32 * s, 17 * s, 'oval', a) })),
    ...[-30, 30].map((a): Part => ({ role: 'petal', d: petal(cx, cy, 1, 34 * s, 20 * s, 'oval', a) })),
    { role: 'petal', d: petal(cx, cy, 1, 38 * s, 24 * s, 'oval', 180) },
  ]
  const whiskers = [110, 140, 180, 220, 250].map((a): Part => ({
    role: 'detail',
    hue: 'ochre',
    d: line(polar(cx, cy, 5 * s, a), polar(cx, cy, 22 * s, a)),
  }))
  const eye: Part[] = [
    { role: 'detail', hue: 'ochre', d: circle(cx, cy, blotch * s) },
    { role: 'dot', hue: 'ochre', d: circle(cx, cy, 2 * s) },
  ]
  return plant(hue, [...petals, ...whiskers, ...eye], cy + 39 * s, leaf)
}

const umbel = (hue: Hue, flower: Radial, s: number, leaf: LeafStyle, positions: Point[]) => (): Drawing => {
  const blooms = positions.map(([x, y]) => radial(x, y, s, flower))
  const stalks = blooms.map(({ bottom }, i): Part => ({ role: 'stem', d: branch(HEAD_X, 150, positions[i][0], bottom) }))
  return {
    hue,
    parts: [
      { role: 'stem', d: `M${HEAD_X},${GROUND} C93,230 108,200 ${HEAD_X},150` },
      ...stalks,
      ...leafParts(leaf),
      ...blooms.flatMap((b) => b.parts),
    ],
  }
}

function magnolia(): Drawing {
  const fan = (angles: number[], length: number, width: number): Part[] =>
    angles.map((a): Part => ({ role: 'petal', d: petal(HEAD_X, 126, 0, length, width, 'oval', a) }))
  const head = [...fan([-66, 66], 48, 17), ...fan([-44, 44], 56, 18), ...fan([-22, 22], 62, 18), ...fan([0], 64, 17)]
  return plant('ivory', head, 126)
}

function petunia(): Drawing {
  const cy = 86
  const pleats = [0, 1, 2, 3, 4].map((i) => 90 + i * 72)
  const head: Part[] = [
    { role: 'petal', d: scallop(HEAD_X, cy, 38, 5, 0.06) },
    ...pleats.map((a): Part => ({ role: 'detail', d: line(polar(HEAD_X, cy, 11, a), polar(HEAD_X, cy, 34, a)) })),
    { role: 'detail', d: circle(HEAD_X, cy, 11) },
    { role: 'dot', hue: 'ochre', d: circle(HEAD_X, cy, 4) },
  ]
  return plant('lilac', head, cy + 40)
}

function sweetPea(): Drawing {
  const head: Part[] = [
    { role: 'petal', d: petal(HEAD_X, 100, 0, 24, 15, 'oval', 180) },
    { role: 'petal', d: petal(HEAD_X, 100, 0, 32, 18, 'oval', -64) },
    { role: 'petal', d: petal(HEAD_X, 100, 0, 32, 18, 'oval', 64) },
    { role: 'petal', d: petal(HEAD_X, 100, 0, 46, 36, 'ruffled', 0) },
    { role: 'stem', d: 'M98,212 C70,208 58,188 68,176 C76,168 88,174 84,184 C81,190 74,188 75,183' },
  ]
  return plant('rose', head, 124)
}

function coneflower(): Drawing {
  const cy = 86
  const rays = Array.from({ length: 13 }, (_, i): Part => ({
    role: 'petal',
    d: petal(HEAD_X, cy, 14, 34, 7, 'oval', 60 + i * 20),
  }))
  const cone: Part[] = [
    { role: 'petal', hue: 'ochre', d: `M76,${cy + 2} C76,${cy - 40} 124,${cy - 40} 124,${cy + 2} Z` },
    ...Array.from({ length: 22 }, (_, i): Part => {
      const row = Math.floor(i / 5)
      const x = 84 + (i % 5) * 8 + (row % 2) * 4
      return { role: 'dot', hue: 'ochre', d: circle(x, cy - 4 - row * 7, 1) }
    }),
  ]
  return plant('rose', [...rays, ...cone], cy + 48, 'lance')
}

function crocus(): Drawing {
  const stamens = [96, 100, 104].flatMap((x): Part[] => [
    { role: 'detail', hue: 'ochre', d: `M100,104 C${x},90 ${x},78 ${x},68` },
    { role: 'dot', hue: 'ochre', d: circle(x, 68, 1.6) },
  ])
  return cup('lilac', 'strap', stamens)()
}

function protea(): Drawing {
  const fan = (angles: number[], length: number, width: number): Part[] =>
    angles.map((a): Part => ({ role: 'petal', d: petal(HEAD_X, 126, 0, length, width, 'pointed', a) }))
  const plume: Part[] = Array.from({ length: 15 }, (_, i): Part => {
    const a = -70 + i * 10
    return { role: 'detail', hue: 'ivory', d: line(polar(HEAD_X, 92, 5, a), polar(HEAD_X, 92, 20, a)) }
  })
  const head = [
    ...fan([-70, -50, -30, 30, 50, 70], 60, 12),
    ...fan([-60, -40, -20, 0, 20, 40, 60], 52, 11),
    ...fan([-45, -22, 0, 22, 45], 42, 10),
    ...plume,
  ]
  return plant('rose', head, 126, 'lance')
}

function lotus(): Drawing {
  const fan = (angles: number[], length: number, width: number): Part[] =>
    angles.map((a): Part => ({ role: 'petal', d: petal(HEAD_X, 126, 0, length, width, 'pointed', a) }))
  const head = [
    ...fan([-72, -50, 50, 72], 48, 15),
    ...fan([-34, -12, 12, 34], 56, 15),
    ...fan([-16, 0, 16], 48, 13),
    { role: 'dot', hue: 'ochre', d: circle(HEAD_X, 96, 2) } satisfies Part,
  ]
  return plant('rose', head, 126, 'pad')
}

function waterLily(): Drawing {
  const cx = HEAD_X
  const cy = 212
  const rim = Array.from({ length: 32 }, (_, i) => {
    const t = rad(25 + i * 10)
    return `L${f(cx + 78 * Math.cos(t))},${f(cy + 20 * Math.sin(t))}`
  })
  const veins = Array.from({ length: 8 }, (_, i): Part => {
    const t = rad(45 + i * 38)
    return { role: 'stem', d: line([cx, cy], [cx + 68 * Math.cos(t), cy + 17 * Math.sin(t)]) }
  })
  const fan = (angles: number[], length: number, width: number): Part[] =>
    angles.map((a): Part => ({ role: 'petal', d: petal(cx, 206, 0, length, width, 'pointed', a) }))
  return {
    hue: 'ivory',
    parts: [
      { role: 'stem', d: 'M14,240 Q40,233 66,240' },
      { role: 'stem', d: 'M134,240 Q160,233 186,240' },
      { role: 'leaf', d: `M${cx},${cy} ${rim.join(' ')} Z` },
      ...veins,
      ...fan([-80, -58, 58, 80], 38, 12),
      ...fan([-36, -12, 12, 36], 46, 13),
      ...fan([-16, 0, 16], 40, 11),
      { role: 'dot', hue: 'ochre', d: circle(cx - 5, 176, 1.4) },
      { role: 'dot', hue: 'ochre', d: circle(cx, 172, 1.4) },
      { role: 'dot', hue: 'ochre', d: circle(cx + 5, 176, 1.4) },
    ],
  }
}

function morningGlory(): Drawing {
  const cy = 88
  const star = Array.from({ length: 10 }, (_, i) => `${i === 0 ? 'M' : 'L'}${xy(polar(HEAD_X, cy, i % 2 ? 36 : 11, i * 36))}`).join(' ') + ' Z'
  const head: Part[] = [
    { role: 'petal', d: scallop(HEAD_X, cy, 38, 5, 0.03) },
    { role: 'detail', hue: 'ivory', d: star },
    ...[0, 72, 144, 216, 288].map((a): Part => ({ role: 'detail', d: line(polar(HEAD_X, cy, 12, a + 36), polar(HEAD_X, cy, 37, a + 36)) })),
    { role: 'dot', hue: 'ivory', d: circle(HEAD_X, cy, 5) },
  ]
  return plant('blue', head, cy + 40, 'heart')
}

function nasturtium(): Drawing {
  const cx = HEAD_X
  const cy = 84
  const head: Part[] = [
    { role: 'detail', d: 'M100,90 C122,72 142,62 152,68 C144,72 128,82 106,96' },
    ...[-38, 38].map((a): Part => ({ role: 'petal', d: petal(cx, cy, 2, 28, 14, 'oval', a) })),
    ...[150, 180, 210].map((a): Part => ({ role: 'petal', d: petal(cx, cy, 2, 38, 20, 'ruffled', a) })),
    ...[150, 180, 210].map((a): Part => ({ role: 'detail', hue: 'rose', d: line(polar(cx, cy, 6, a), polar(cx, cy, 26, a)) })),
    { role: 'dot', hue: 'rose', d: circle(cx, cy, 2.4) },
  ]
  return plant('ochre', head, cy + 40, 'pad')
}

function honeysuckle(): Drawing {
  const flower = (bx: number, by: number, angle: number): Part[] => {
    const length = 46
    const [mx, my] = polar(bx, by, length, angle)
    return [
      { role: 'petal', d: petal(mx, my, 0, length, 4.5, 'pointed', angle + 180) },
      ...[-1, 0, 1].map((k): Part => ({ role: 'petal', d: petal(mx, my, 0, 12, 5, 'oval', angle + k * 38) })),
      { role: 'petal', d: petal(mx, my, 0, 16, 4.5, 'oval', angle + 150) },
      ...[-14, -5, 5, 14].flatMap((k): Part[] => {
        const tip = polar(mx, my, 20, angle + k)
        return [
          { role: 'detail', d: line([mx, my], tip) },
          { role: 'dot', hue: 'rose', d: circle(tip[0], tip[1], 1.3) },
        ]
      }),
    ]
  }
  return plant('ochre', [...flower(96, 122, -34), ...flower(104, 128, 40)], 130)
}

const forgetMeNot = () =>
  spray(
    'blue',
    [[100, 258], [96, 200], [108, 150], [120, 100]],
    { count: 5, length: 12, width: 8, shape: 'oval', center: 'dot', centerHue: 'ochre' },
    [
      { t: 0.5, dx: -22, dy: -10, s: 1 },
      { t: 0.65, dx: 22, dy: -12, s: 1 },
      { t: 0.8, dx: -20, dy: -14, s: 1 },
      { t: 1, dx: 0, dy: -8, s: 1 },
      { t: 0.72, dx: 22, dy: -28, bud: true },
    ],
    { leaf: 'lance' },
  )

const freesia = () =>
  spray(
    'ochre',
    [[100, 258], [92, 200], [104, 140], [130, 90]],
    { count: 6, length: 28, width: 11, shape: 'pointed', center: 'dot', centerHue: 'rose' },
    [
      { t: 0.3, dx: 26, dy: -8, s: 0.8 },
      { t: 0.5, dx: 26, dy: -10, s: 0.8 },
      { t: 0.7, dx: 24, dy: -12, s: 0.75 },
      { t: 0.86, dx: 16, dy: -24, bud: true },
      { t: 1, dx: 8, dy: -16, bud: true },
    ],
    { leaf: 'sword' },
  )

const bougainvillea = () =>
  spray(
    'rose',
    [[100, 258], [80, 200], [90, 140], [130, 70]],
    { count: 3, length: 30, width: 22, shape: 'oval', r0: 2, center: 'dots', centerR: 5, centerHue: 'ivory' },
    [
      { t: 0.5, dx: -26, dy: -14, s: 0.8 },
      { t: 0.7, dx: 28, dy: -10, s: 0.8 },
      { t: 0.9, dx: -18, dy: -24, s: 0.75 },
      { t: 1, dx: 10, dy: -12, s: 0.7 },
    ],
  )

const DRAWINGS: Record<FlowerName, () => Drawing> = {
  // The twenty most common flowers have hand-built drawings.
  Rose: rose,
  Sunflower: bloom('ochre', {
    count: 16, length: 30, width: 9, shape: 'pointed', layers: 2, shrink: 0.12, r0: 18,
    center: 'seeds', centerR: 19, seeds: 60, centerHue: 'rose',
  }, 'heart'),
  Tulip: cup('rose', 'strap'),
  Daisy: bloom('ivory', {
    count: 21, length: 34, width: 4.2, shape: 'oval', r0: 4, center: 'seeds', centerR: 9, seeds: 26, centerHue: 'ochre',
  }),
  Lily: bloom('rose', {
    count: 6, length: 46, width: 15, shape: 'pointed', veins: true, speckles: true,
    center: 'anthers', centerR: 24, centerHue: 'ochre',
  }, 'lance'),
  Orchid: orchid,
  Peony: bloom('rose', { count: 8, length: 44, width: 26, shape: 'ruffled', layers: 5, shrink: 0.6 }, 'compound'),
  Lavender: spike('lilac', 14, 4.5, 'needle'),
  Carnation: bloom('rose', { count: 9, length: 40, width: 15, shape: 'ruffled', layers: 4, shrink: 0.55 }, 'needle'),
  Hydrangea: ball('blue', 1.25, 'heart'),
  Daffodil: bloom('ochre', {
    count: 6, length: 38, width: 17, shape: 'pointed', center: 'ruffle', centerR: 12, centerHue: 'ochre',
  }, 'strap'),
  'Cherry blossom': cherryBlossom,
  Marigold: bloom('ochre', { count: 14, length: 34, width: 12, shape: 'ruffled', layers: 5, shrink: 0.6 }, 'pinnate'),
  Chrysanthemum: bloom('ochre', { count: 22, length: 40, width: 4, shape: 'oval', layers: 4, shrink: 0.45 }, 'pinnate'),
  Iris: iris,
  Jasmine: jasmine,
  Lilac: lilac,
  Dahlia: bloom('rose', { count: 12, length: 40, width: 10, shape: 'oval', layers: 6, shrink: 0.8 }, 'pinnate'),
  Poppy: bloom('rose', {
    count: 4, length: 38, width: 34, shape: 'ruffled', layers: 2, shrink: 0.1,
    center: 'ringdots', centerR: 14, centerHue: 'lilac',
  }, 'pinnate'),
  Hibiscus: hibiscus,

  Alstroemeria: bloom('rose', { count: 6, length: 38, width: 15, shape: 'pointed', alt: 0.78, veins: true, speckles: true, center: 'anthers', centerR: 20, centerHue: 'ochre' }, 'lance'),
  Anemone: bloom('ivory', { count: 7, length: 32, width: 20, shape: 'oval', r0: 8, center: 'ringdots', centerR: 11, centerHue: 'lilac' }, 'pinnate'),
  Aster: bloom('lilac', { count: 28, length: 38, width: 4, shape: 'oval', r0: 6, layers: 2, shrink: 0.15, center: 'seeds', centerR: 9, seeds: 22, centerHue: 'ochre' }, 'lance'),
  Azalea: bloom('rose', { count: 5, length: 36, width: 21, shape: 'oval', speckles: true, center: 'anthers', centerR: 30, centerHue: 'rose' }),
  'Baby’s breath': babysBreath,
  Begonia: bloom('rose', { count: 4, length: 30, width: 21, shape: 'oval', alt: 0.65, center: 'dots', centerR: 9, centerHue: 'ochre' }, 'heart'),
  Bluebell: pendants('blue', flaredBell, 1, 'strap'),
  Camellia: bloom('rose', { count: 6, length: 40, width: 22, shape: 'oval', layers: 4, shrink: 0.55, center: 'dots', centerR: 9, centerHue: 'ochre' }),
  Cosmos: bloom('rose', { count: 8, length: 40, width: 17, shape: 'notched', center: 'disc', centerR: 6, centerHue: 'ochre' }, 'pinnate'),
  Delphinium: raceme('blue', { make: radialMake({ count: 5, length: 13, width: 9, shape: 'oval', center: 'dot', centerHue: 'ivory' }), count: 9, big: 1.1, small: 0.5, spread: 15, leaf: 'palmate' }),
  'Forget-me-not': forgetMeNot,
  Freesia: freesia,
  Gardenia: bloom('ivory', { count: 7, length: 38, width: 20, shape: 'oval', layers: 3, shrink: 0.5, center: 'spiral', centerR: 9 }),
  'Gerbera daisy': bloom('rose', { count: 26, length: 40, width: 6, shape: 'oval', r0: 12, layers: 2, shrink: 0.12, center: 'ringdots', centerR: 10, centerHue: 'ochre' }, 'pinnate'),
  'Lily of the valley': pendants('ivory', roundBell, 0.9, 'upright'),
  Magnolia: magnolia,
  Petunia: petunia,
  Plumeria: bloom('ivory', { count: 5, length: 44, width: 18, shape: 'paddle', center: 'disc', centerR: 4, centerHue: 'ochre' }, 'lance'),
  Ranunculus: bloom('rose', { count: 10, length: 36, width: 20, shape: 'oval', layers: 8, shrink: 0.85, center: 'spiral', centerR: 5 }, 'compound'),
  Snapdragon: raceme('rose', { make: snap, count: 6, big: 1.6, small: 0.9, spread: 6, leaf: 'lance' }),
  'Sweet pea': sweetPea,
  Violet: face('lilac', 0.8, 4.5, 'heart'),
  Wildflowers: wildflowers,
  Zinnia: bloom('rose', { count: 12, length: 38, width: 14, shape: 'oval', layers: 4, shrink: 0.5, center: 'disc', centerR: 5, centerHue: 'ochre' }),

  Allium: ball('lilac', 0.9, 'strap', true),
  Amaryllis: bloom('rose', { count: 6, length: 46, width: 22, shape: 'pointed', veins: true, center: 'anthers', centerR: 26, centerHue: 'ochre' }, 'strap'),
  Bellflower: raceme('blue', { make: radialMake({ count: 5, length: 16, width: 8, shape: 'pointed', center: 'dot', centerHue: 'ivory' }), count: 5, big: 1.2, small: 0.7, spread: 20, leaf: 'lance' }),
  'Black-eyed Susan': bloom('ochre', { count: 14, length: 30, width: 7, shape: 'oval', r0: 10, layers: 2, shrink: 0.1, center: 'seeds', centerR: 11, seeds: 28, centerHue: 'lilac' }, 'lance'),
  'Bleeding heart': pendants('rose', heartBell, 0.9, 'pinnate'),
  Bougainvillea: bougainvillea,
  Buttercup: bloom('ochre', { count: 5, length: 24, width: 17, shape: 'oval', r0: 2, center: 'dots', centerR: 8 }, 'pinnate'),
  Chamomile: bloom('ivory', { count: 15, length: 28, width: 6, shape: 'oval', r0: 7, center: 'seeds', centerR: 8, seeds: 16, centerHue: 'ochre' }, 'pinnate'),
  Clematis: bloom('lilac', { count: 6, length: 42, width: 17, shape: 'pointed', veins: true, center: 'anthers', centerR: 12, centerHue: 'ochre' }, 'compound'),
  Coneflower: coneflower,
  Cornflower: bloom('blue', { count: 8, length: 32, width: 7, shape: 'notched', layers: 2, shrink: 0.45, center: 'dots', centerR: 6, centerHue: 'lilac' }, 'needle'),
  Crocus: crocus,
  Dandelion: bloom('ochre', { count: 30, length: 26, width: 3.5, shape: 'notched', r0: 3, layers: 3, shrink: 0.35 }, 'strap'),
  Dianthus: bloom('rose', { count: 5, length: 30, width: 17, shape: 'notched', layers: 2, shrink: 0.3, center: 'trumpet', centerR: 5, centerHue: 'ivory' }, 'needle'),
  Dogwood: bloom('ivory', { count: 4, length: 38, width: 24, shape: 'notched', r0: 4, center: 'dots', centerR: 7, centerHue: 'ochre' }),
  Edelweiss: bloom('ivory', { count: 8, length: 28, width: 8, shape: 'pointed', layers: 2, shrink: 0.2, center: 'seeds', centerR: 6, seeds: 7, centerHue: 'ochre' }, 'lance'),
  Foxglove: raceme('rose', { make: (x, y, s) => tubeBell(x + 4, y + 2, s), count: 8, big: 1.1, small: 0.5, spread: 4, side: 1, leaf: 'broad' }),
  Fuchsia: pendants('rose', fuchsiaBell, 1),
  Geranium: umbel('rose', { count: 5, length: 30, width: 18, shape: 'oval', veins: true, center: 'dots', centerR: 6, centerHue: 'ochre' }, 0.6, 'heart', [[100, 56], [64, 80], [136, 80], [80, 110], [120, 110]]),
  Gladiolus: raceme('rose', { make: radialMake({ count: 6, length: 22, width: 12, shape: 'pointed', center: 'dot', centerHue: 'ochre' }), count: 6, big: 1.1, small: 0.55, spread: 22, side: 1, leaf: 'sword' }),
  Heather: spike('lilac', 11, 4, 'needle'),
  Hellebore: bloom('ivory', { count: 5, length: 34, width: 22, shape: 'oval', center: 'dots', centerR: 12, centerHue: 'ochre' }, 'palmate'),
  Hollyhock: raceme('rose', { make: radialMake({ count: 5, length: 22, width: 20, shape: 'ruffled', center: 'dots', centerR: 6, centerHue: 'ochre' }), count: 5, big: 1.1, small: 0.5, spread: 18, leaf: 'heart' }),
  Honeysuckle: honeysuckle,
  Hyacinth: raceme('blue', { make: radialMake({ count: 6, length: 10, width: 4, shape: 'pointed', center: 'dot' }), count: 14, big: 1, small: 0.55, spread: 9, leaf: 'strap' }),
  Larkspur: raceme('lilac', { make: radialMake({ count: 5, length: 12, width: 6, shape: 'pointed', center: 'dot', centerHue: 'ivory' }), count: 11, big: 1.1, small: 0.5, spread: 13, leaf: 'pinnate' }),
  Lisianthus: bloom('lilac', { count: 6, length: 40, width: 24, shape: 'ruffled', layers: 2, shrink: 0.1, center: 'dots', centerR: 6, centerHue: 'ochre' }, 'lance'),
  Lotus: lotus,
  Lupine: raceme('lilac', { make: radialMake({ count: 4, length: 10, width: 7, shape: 'oval' }), count: 16, big: 1.1, small: 0.5, spread: 9, leaf: 'palmate' }),
  'Morning glory': morningGlory,
  Narcissus: bloom('ivory', { count: 6, length: 34, width: 16, shape: 'oval', center: 'ruffle', centerR: 7, centerHue: 'ochre' }, 'strap'),
  Nasturtium: nasturtium,
  Pansy: face('lilac', 1.05, 7, 'heart'),
  Primrose: bloom('rose', { count: 5, length: 34, width: 20, shape: 'notched', center: 'trumpet', centerR: 6, centerHue: 'ochre' }),
  Protea: protea,
  Rhododendron: umbel('rose', { count: 5, length: 36, width: 22, shape: 'oval', speckles: true, center: 'anthers', centerR: 22, centerHue: 'ochre' }, 0.55, 'oval', [[100, 52], [134, 72], [122, 108], [78, 108], [66, 72], [100, 82]]),
  Snowdrop: pendants('ivory', snowdropBell, 1, 'strap', [[112, 63, 1], [146, 44, -1]]),
  'Tiger lily': bloom('ochre', { count: 6, length: 44, width: 11, shape: 'pointed', veins: true, speckles: true, center: 'anthers', centerR: 26, centerHue: 'rose' }, 'lance'),
  Tuberose: raceme('ivory', { make: radialMake({ count: 5, length: 16, width: 6, shape: 'pointed', center: 'dot', centerHue: 'ochre' }), count: 9, big: 1, small: 0.5, spread: 12, leaf: 'strap' }),
  'Water lily': waterLily,
  [NO_FAVORITE]: bud,
}

export function drawFlower(name: string): Drawing {
  return name in DRAWINGS ? DRAWINGS[name as FlowerName]() : wildflowers()
}
