import { useId, type CSSProperties } from 'react'
import { TITLE_GLYPHS, TITLE_PEN, TITLE_TEXT, TITLE_VIEWBOX } from '../utils/titlePaths'

const START = 0.1
const WRITING_SECONDS = 1.1
const PAUSE = 0.015
const MIN_STROKE = 0.02

const [, viewTop, viewWidth, viewHeight] = TITLE_VIEWBOX.split(' ').map(Number)

const totalLength = TITLE_GLYPHS.reduce((sum, glyph) => sum + glyph.strokes.reduce((n, s) => n + s.length, 0), 0)
const speed = totalLength / WRITING_SECONDS

type Timed = { d: string; delay: number; duration: number }
type Written = { fill: string; strokes: Timed[]; done: number }

// The pen travels at one steady speed, letter after letter, so longer strokes take longer.
let clock = START
const WRITTEN: Written[] = TITLE_GLYPHS.map(({ fill, strokes }) => {
  const timed = strokes.map(({ d, length }): Timed => {
    const duration = Math.max(MIN_STROKE, length / speed)
    const stroke = { d, delay: clock, duration }
    clock += duration
    return stroke
  })
  const done = clock
  clock += PAUSE
  return { fill, strokes: timed, done }
})

export const TITLE_SECONDS = clock + 0.2

// A pen moves along each letter's centre line and uncovers the real letter shape beneath it.
export function WrittenTitle({ className }: { className?: string }) {
  const id = useId()

  return (
    <h1 className={className}>
      <span className="sr-only">{TITLE_TEXT}</span>
      <svg viewBox={TITLE_VIEWBOX} aria-hidden className="block h-auto w-full">
        <defs>
          {WRITTEN.map(({ strokes, done }, i) => (
            <mask key={i} id={`${id}-${i}`} maskUnits="userSpaceOnUse" x="0" y={viewTop} width={viewWidth} height={viewHeight}>
              {strokes.map((stroke, k) => (
                <path
                  key={k}
                  d={stroke.d}
                  pathLength={1}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={TITLE_PEN}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="pen"
                  style={{ '--delay': `${stroke.delay}s`, '--duration': `${stroke.duration}s` } as CSSProperties}
                />
              ))}
              <rect
                x="0"
                y={viewTop}
                width={viewWidth}
                height={viewHeight}
                fill="#fff"
                className="pen-done"
                style={{ '--delay': `${done}s` } as CSSProperties}
              />
            </mask>
          ))}
        </defs>
        {WRITTEN.map(({ fill }, i) => (
          <path key={i} d={fill} fill="currentColor" mask={`url(#${id}-${i})`} />
        ))}
      </svg>
    </h1>
  )
}
