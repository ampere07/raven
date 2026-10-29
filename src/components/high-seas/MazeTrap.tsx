import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { HIGH_SEAS_COPY } from '../../../shared/highSeas'
import { textButton } from '../common-room/ui'

const SIZE = 20
const CELL = 18
const PAD = 10
const BOARD = SIZE * CELL + PAD * 2
const GOAL = SIZE * SIZE - 1

// A passage is stored as a bit per side of a cell: the side is open when its bit is set.
const N = 1
const E = 2
const S = 4
const W = 8

type Dir = { name: string; bit: number; back: number; dx: number; dy: number }
const UP: Dir = { name: 'Pataas', bit: N, back: S, dx: 0, dy: -1 }
const RIGHT: Dir = { name: 'Pakanan', bit: E, back: W, dx: 1, dy: 0 }
const DOWN: Dir = { name: 'Pababa', bit: S, back: N, dx: 0, dy: 1 }
const LEFT: Dir = { name: 'Pakaliwa', bit: W, back: E, dx: -1, dy: 0 }
const DIRS = [UP, RIGHT, DOWN, LEFT]

const KEYS: Record<string, Dir> = {
  ArrowUp: UP,
  w: UP,
  ArrowRight: RIGHT,
  d: RIGHT,
  ArrowDown: DOWN,
  s: DOWN,
  ArrowLeft: LEFT,
  a: LEFT,
}

// A new maze every time, carved by walking and backtracking, so there is exactly one way from the start to the end.
function carve(): Uint8Array {
  const cells = new Uint8Array(SIZE * SIZE)
  const seen = new Uint8Array(SIZE * SIZE)
  const stack = [0]
  seen[0] = 1
  while (stack.length > 0) {
    const here = stack[stack.length - 1]
    const x = here % SIZE
    const y = Math.floor(here / SIZE)
    const options = DIRS.filter((d) => {
      const nx = x + d.dx
      const ny = y + d.dy
      return nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE && !seen[ny * SIZE + nx]
    })
    if (options.length === 0) {
      stack.pop()
      continue
    }
    const d = options[Math.floor(Math.random() * options.length)]
    const next = (y + d.dy) * SIZE + (x + d.dx)
    cells[here] |= d.bit
    cells[next] |= d.back
    seen[next] = 1
    stack.push(next)
  }
  return cells
}

// Every closed side of every cell, as one path.
function wallsOf(cells: Uint8Array): string {
  const parts: string[] = []
  const line = (x1: number, y1: number, x2: number, y2: number) =>
    parts.push(`M${PAD + x1 * CELL} ${PAD + y1 * CELL}L${PAD + x2 * CELL} ${PAD + y2 * CELL}`)
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const open = cells[y * SIZE + x]
      if (y === 0 && !(open & N)) line(x, y, x + 1, y)
      if (x === 0 && !(open & W)) line(x, y, x, y + 1)
      if (!(open & S)) line(x, y + 1, x + 1, y + 1)
      if (!(open & E)) line(x + 1, y, x + 1, y + 1)
    }
  }
  return parts.join('')
}

const centre = (index: number) => ({
  x: PAD + (index % SIZE) * CELL + CELL / 2,
  y: PAD + Math.floor(index / SIZE) * CELL + CELL / 2,
})

type Props = { onSolved: () => void; onSkip: () => void }

// The last part of Chapter III. A 20 by 20 maze under Davy Jones's ship, walked with four arrow buttons (or the arrow
// keys). Holding a button keeps walking. Reaching the glowing end springs his trap. Nothing here is stored.
export function MazeTrap({ onSolved, onSkip }: Props) {
  const [maze] = useState(carve)
  const walls = useMemo(() => wallsOf(maze), [maze])
  const [pos, setPos] = useState(0)
  const [visited, setVisited] = useState<ReadonlySet<number>>(() => new Set([0]))
  const [solved, setSolved] = useState(false)
  const posRef = useRef(0)
  const solvedRef = useRef(false)
  const holding = useRef<number | null>(null)

  const step = useCallback(
    (d: Dir) => {
      if (solvedRef.current) return
      const here = posRef.current
      if (!(maze[here] & d.bit)) return
      const next = (Math.floor(here / SIZE) + d.dy) * SIZE + (here % SIZE) + d.dx
      posRef.current = next
      setPos(next)
      setVisited((seen) => (seen.has(next) ? seen : new Set(seen).add(next)))
      if (next === GOAL) {
        solvedRef.current = true
        setSolved(true)
      }
    },
    [maze],
  )

  const stop = useCallback(() => {
    if (holding.current !== null) window.clearInterval(holding.current)
    holding.current = null
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const d = KEYS[event.key] ?? KEYS[event.key.toLowerCase()]
      if (!d || event.ctrlKey || event.metaKey || event.altKey) return
      event.preventDefault()
      step(d)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      stop()
    }
  }, [step, stop])

  // A moment on the glowing end before the trap springs.
  useEffect(() => {
    if (!solved) return
    stop()
    const id = window.setTimeout(onSolved, 1300)
    return () => window.clearTimeout(id)
  }, [solved, stop, onSolved])

  const press = (d: Dir) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    stop()
    step(d)
    holding.current = window.setInterval(() => step(d), 120)
  }

  const player = centre(pos)
  const exit = centre(GOAL)

  const pad = (d: Dir, icon: ReactNode, className: string) => (
    <button
      type="button"
      aria-label={d.name}
      disabled={solved}
      onPointerDown={press(d)}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(event) => event.preventDefault()}
      // A keyboard press arrives as a click with no pointer; a pointer press has already been handled above.
      onClick={(event) => event.detail === 0 && step(d)}
      className={`flex h-14 w-14 touch-manipulation select-none items-center justify-center rounded-sm border border-gold bg-burgundy text-parchment shadow-sm transition-colors hover:bg-burgundy-deep active:bg-burgundy-deep disabled:opacity-45 ${className}`}
    >
      {icon}
    </button>
  )

  return (
    <section aria-labelledby="maze-title" className="cr-parchment cr-unfurl px-5 py-8 text-center sm:px-10 sm:py-12">
      <h2 id="maze-title" className="font-display text-sm uppercase tracking-[0.3em] text-burgundy">
        Ang Dungeon ni {HIGH_SEAS_COPY.villainName}
      </h2>

      <div
        className="mx-auto mt-4 w-full max-w-sm overflow-hidden rounded-sm"
        style={{ background: 'radial-gradient(circle at 50% 50%, #12303a 0%, #08141c 80%)' }}
      >
        <svg viewBox={`0 0 ${BOARD} ${BOARD}`} role="img" aria-label="Maze na 20 by 20" className="block w-full">
          {Array.from(visited).map((cell) => {
            const at = centre(cell)
            return <rect key={cell} x={at.x - CELL / 2} y={at.y - CELL / 2} width={CELL} height={CELL} fill="#e7c27a" opacity="0.14" />
          })}

          <circle className="sea-pulse" cx={exit.x} cy={exit.y} r="7.5" fill="#ffd27a" style={{ filter: 'drop-shadow(0 0 6px #ffb347)' }} />
          <path d={walls} fill="none" stroke="#79b6c4" strokeWidth="2.2" strokeLinecap="round" />

          <g style={{ transform: `translate(${player.x}px, ${player.y}px)`, transition: 'transform 0.1s linear' }}>
            <circle r="5.6" fill="#8fe6ff" stroke="#fff" strokeWidth="1.4" style={{ filter: 'drop-shadow(0 0 5px #8fe6ff)' }} />
          </g>
        </svg>
      </div>

      <p className="mx-auto mt-4 max-w-sm font-book text-lg italic leading-snug text-leather-soft" role="status" aria-live="polite">
        {solved ? HIGH_SEAS_COPY.maze.found : HIGH_SEAS_COPY.maze.guidance}
      </p>

      <div className="mx-auto mt-4 grid w-fit grid-cols-3 gap-2" role="group" aria-label="Mga arrow">
        {pad(UP, <ArrowUp aria-hidden size={24} />, 'col-start-2')}
        {pad(LEFT, <ArrowLeft aria-hidden size={24} />, 'col-start-1 row-start-2')}
        {pad(RIGHT, <ArrowRight aria-hidden size={24} />, 'col-start-3 row-start-2')}
        {pad(DOWN, <ArrowDown aria-hidden size={24} />, 'col-start-2 row-start-3')}
      </div>

      <div className="mt-4 flex justify-center">
        <button type="button" onClick={onSkip} className={textButton}>
          Skip na lang ’to
        </button>
      </div>
    </section>
  )
}
