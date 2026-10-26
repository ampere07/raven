import { useMemo, type CSSProperties } from 'react'
import { splitChoices } from '../../shared/questionnaire'
import { drawFlower, type Hue, type Part } from '../utils/flowers'

const HUE_CLASS: Record<Hue, string> = {
  rose: 'text-rose-deep',
  ochre: 'text-ochre',
  lilac: 'text-lilac',
  blue: 'text-dusk',
  ivory: 'text-ivory-ink',
}

const ROLE_CLASS: Record<Part['role'], string> = {
  stem: 'stroke-draw text-sage',
  leaf: 'stroke-draw tint text-sage',
  petal: 'stroke-draw tint',
  detail: 'stroke-draw',
  dot: 'stroke-draw dot',
}

const STROKE = 1.3
const FLOWER_SECONDS = 5
const STAGGER = 1.4
const RIBBON_SECONDS = 1.6

type Timed = { part: Part; hue: Hue; delay: number; duration: number }
type Placed = { transform: string; strokeWidth: number; timed: Timed[] }

// Each flower is drawn about its own stem base, so tilting them about that point fans the stems into a bouquet.
const BASE: [number, number] = [100, 258]
const layoutFor = (count: number): { angle: number; scale: number }[] => {
  if (count === 1) return [{ angle: 0, scale: 1 }]
  if (count === 2) return [{ angle: -17, scale: 0.88 }, { angle: 17, scale: 0.88 }]
  return [{ angle: 0, scale: 0.92 }, { angle: -27, scale: 0.78 }, { angle: 27, scale: 0.78 }]
}

const RIBBON: Part[] = [
  { role: 'detail', d: 'M80,228 C92,237 108,237 120,228' },
  { role: 'detail', d: 'M79,237 C92,246 108,246 121,237' },
  { role: 'detail', d: 'M100,242 C82,226 68,238 82,248 C92,254 100,246 100,242' },
  { role: 'detail', d: 'M100,242 C118,226 132,238 118,248 C108,254 100,246 100,242' },
  { role: 'detail', d: 'M100,244 C97,252 94,258 90,264' },
  { role: 'detail', d: 'M100,244 C103,252 106,258 110,264' },
]

function schedule(parts: Part[], hue: Hue, offset: number): Timed[] {
  const headCount = parts.filter(({ role }) => role !== 'stem' && role !== 'leaf').length
  const gap = Math.min(0.14, 3 / Math.max(headCount, 1))
  const seen = { stem: 0, leaf: 0, head: 0 }

  return parts.map((part) => {
    const timing =
      part.role === 'stem'
        ? { delay: 0.2 + 0.15 * seen.stem++, duration: 1.8 }
        : part.role === 'leaf'
          ? { delay: 1.1 + 0.3 * seen.leaf++, duration: 0.9 }
          : { delay: 2.2 + gap * seen.head++, duration: 0.9 }
    return { part, hue: part.hue ?? hue, delay: timing.delay + offset, duration: timing.duration }
  })
}

export const drawingSeconds = (count: number) =>
  FLOWER_SECONDS + STAGGER * (Math.max(count, 1) - 1) + (count > 1 ? RIBBON_SECONDS : 0)

type Props = { flowers: string; className?: string }

// `flowers` is the stored answer: one flower, or several joined with commas, drawn as a bouquet.
export function FlowerDrawing({ flowers, className }: Props) {
  const { names, placed, ribbon } = useMemo(() => {
    const names = splitChoices(flowers)
    const layout = layoutFor(names.length)

    const placed = names.map((name, i): Placed => {
      const drawing = drawFlower(name)
      const { angle, scale } = layout[i]
      const [bx, by] = BASE
      return {
        transform: `translate(${bx} ${by}) rotate(${angle}) scale(${scale}) translate(${-bx} ${-by})`,
        strokeWidth: STROKE / scale,
        timed: schedule(drawing.parts.filter((part) => i === 0 || !part.foliage), drawing.hue, i * STAGGER),
      }
    })

    const start = FLOWER_SECONDS + STAGGER * (names.length - 1)
    const ribbon: Timed[] =
      names.length > 1
        ? RIBBON.map((part, i) => ({ part, hue: 'rose', delay: start + i * 0.18, duration: 0.8 }))
        : []
    return { names, placed, ribbon }
  }, [flowers])

  const draw = ({ part, hue, delay, duration }: Timed, index: number) => (
    <path
      key={index}
      d={part.d}
      pathLength={1}
      className={`${ROLE_CLASS[part.role]} ${part.role === 'stem' || part.role === 'leaf' ? '' : HUE_CLASS[hue]}`}
      style={{ '--delay': `${delay}s`, '--duration': `${duration}s` } as CSSProperties}
    />
  )

  return (
    <svg
      viewBox="0 0 200 270"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={`A line drawing of ${names.length > 1 ? 'a bouquet of ' : ''}${names.join(', ').toLowerCase()}`}
      className={className}
    >
      {placed.map(({ transform, strokeWidth, timed }, i) => (
        <g key={i} transform={transform} strokeWidth={strokeWidth}>
          {timed.map(draw)}
        </g>
      ))}
      {ribbon.map(draw)}
    </svg>
  )
}
