import { ArrowLeft, ArrowRight, Wand2 } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { COMMON_ROOM_COPY } from '../../../shared/commonRoom'
import { useWand, type SensorState } from '../../hooks/useWand'
import { DarkLord } from './DarkLord'
import { Flourish } from './Flourish'
import { SpeechBubble } from './SpeechBubble'
import { inkButton, primaryButton, textButton } from './ui'

type Phase = 'ready' | 'casting' | 'defeated'
type Point = { x: number; y: number }

const SPELL = 'Expelliarmus!'
const BOLT_MS = 430
// How long his last words stay on screen before she can move on.
const READ_MS = 2200

const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * 2 * Math.PI
  const reach = 70 + (i % 3) * 22
  return { dx: Math.round(Math.cos(angle) * reach), dy: Math.round(Math.sin(angle) * reach), delay: (i % 4) * 0.06 }
})

const GUIDANCE: Record<SensorState, string> = {
  idle: 'Drag the wand onto Voldemort to cast a spell.',
  asking: 'Asking your phone for permission to feel its motion…',
  checking: 'Your phone is listening too. Flick it like a wand!',
  motion: 'Your phone is ready too. Flick your wrist!',
  none: 'Your device is not sharing its motion. Drag the wand on screen instead.',
  denied: 'Motion was not allowed. Drag the wand on screen instead.',
}

type Props = { onDefeated: () => void; onBack: () => void }

export function VillainDuel({ onDefeated, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('ready')
  const phaseRef = useRef<Phase>('ready')
  const [bolt, setBolt] = useState<{ sx: number; sy: number; ex: number; ey: number } | null>(null)
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [trail, setTrail] = useState<(Point & { id: number })[]>([])
  const [mayContinue, setMayContinue] = useState(false)

  const arena = useRef<HTMLDivElement>(null)
  const villain = useRef<HTMLDivElement>(null)
  const wandArt = useRef<SVGSVGElement>(null)
  const tipFromPointer = useRef<Point>({ x: 0, y: 0 })
  const grabbedAt = useRef<Point>({ x: 0, y: 0 })
  const lastSpark = useRef<Point | null>(null)
  const sparkId = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
  }, [])

  const later = useCallback((work: () => void, ms: number) => {
    timers.current.push(window.setTimeout(work, ms))
  }, [])

  // One spell is all it takes. It flies from the wand (or from the bottom of the arena when cast by phone or button).
  const cast = useCallback(
    (tip?: Point) => {
      if (phaseRef.current !== 'ready') return
      phaseRef.current = 'casting'

      const box = arena.current?.getBoundingClientRect()
      const target = villain.current?.getBoundingClientRect()
      if (box && target) {
        const from = tip ?? { x: box.left + box.width / 2, y: box.bottom - 40 }
        setBolt({
          sx: from.x - box.left,
          sy: from.y - box.top,
          ex: target.left + target.width / 2 - box.left,
          ey: target.top + target.height * 0.45 - box.top,
        })
      }
      setPhase('casting')
      setDragging(false)
      setOffset({ x: 0, y: 0 })
      navigator.vibrate?.(60)

      later(() => {
        phaseRef.current = 'defeated'
        setPhase('defeated')
        setBolt(null)
      }, BOLT_MS)
      later(() => setMayContinue(true), BOLT_MS + READ_MS)
    },
    [later],
  )

  // A single flick of the phone casts it too.
  const { state, enable } = useWand(() => cast())

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (phaseRef.current !== 'ready') return
    event.currentTarget.setPointerCapture(event.pointerId)
    const art = wandArt.current?.getBoundingClientRect()
    grabbedAt.current = { x: event.clientX, y: event.clientY }
    lastSpark.current = null
    // Where the wand's tip sits compared with the finger, so the tip (not the finger) is what has to reach him.
    tipFromPointer.current = art
      ? { x: art.left + art.width * 0.78 - event.clientX, y: art.top + art.height * 0.08 - event.clientY }
      : { x: 0, y: -60 }
    setDragging(true)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging || phaseRef.current !== 'ready') return
    setOffset({ x: event.clientX - grabbedAt.current.x, y: event.clientY - grabbedAt.current.y })

    const box = arena.current?.getBoundingClientRect()
    if (box) {
      const previous = lastSpark.current
      if (!previous || Math.hypot(event.clientX - previous.x, event.clientY - previous.y) > 14) {
        lastSpark.current = { x: event.clientX, y: event.clientY }
        const id = sparkId.current++
        setTrail((current) => [...current.slice(-14), { id, x: event.clientX - box.left, y: event.clientY - box.top }])
        later(() => setTrail((current) => current.filter((spark) => spark.id !== id)), 700)
      }
    }

    const target = villain.current?.getBoundingClientRect()
    const tip = { x: event.clientX + tipFromPointer.current.x, y: event.clientY + tipFromPointer.current.y }
    if (
      target &&
      tip.x > target.left + target.width * 0.12 &&
      tip.x < target.right - target.width * 0.12 &&
      tip.y > target.top + target.height * 0.12 &&
      tip.y < target.bottom - target.height * 0.12
    ) {
      cast(tip)
    }
  }

  // Let go anywhere else and the wand springs back to be picked up again.
  const onPointerEnd = () => {
    setDragging(false)
    if (phaseRef.current === 'ready') setOffset({ x: 0, y: 0 })
  }

  const onWandKey = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      cast()
    }
  }

  const beaten = phase === 'defeated'

  return (
    <section aria-labelledby="duel-title" className="cr-parchment cr-unfurl px-5 py-8 text-center sm:px-10 sm:py-12">
      <h2 id="duel-title" className="font-display text-3xl leading-tight text-burgundy sm:text-4xl">
        {beaten ? `${COMMON_ROOM_COPY.villainName} is gone… for now.` : `${COMMON_ROOM_COPY.villainName} is in the room`}
      </h2>
      <Flourish className="mx-auto mt-4 w-40 text-gold" />
      <p className="mx-auto mt-4 max-w-md font-book text-xl leading-snug text-leather-soft">
        {beaten
          ? 'The candles burn steady again.'
          : 'He has slipped into the Common Room and will not let you turn the page. Take up the wand and cast a spell!'}
      </p>

      <div ref={arena} className="cr-arena relative mx-auto mt-6 h-80 w-full max-w-sm overflow-hidden rounded-sm sm:h-96">
        <div ref={villain} className="absolute left-1/2 top-4 -translate-x-1/2">
          {!beaten ? (
            <DarkLord className={`h-48 w-auto sm:h-56 ${phase === 'casting' ? 'cr-villain-hit' : 'cr-villain'}`} />
          ) : (
            <DarkLord className="cr-villain-vanish h-48 w-auto sm:h-56" />
          )}
        </div>

        {beaten &&
          SPARKS.map((spark, i) => (
            <span
              key={i}
              aria-hidden
              className="cr-spark"
              style={{ '--dx': `${spark.dx}px`, '--dy': `${spark.dy}px`, '--delay': `${spark.delay}s` } as CSSProperties}
            />
          ))}

        {trail.map((spark) => (
          <span key={spark.id} aria-hidden className="cr-trail" style={{ left: spark.x, top: spark.y }} />
        ))}

        {bolt && (
          <span
            aria-hidden
            className="cr-bolt"
            style={{ '--sx': `${bolt.sx}px`, '--sy': `${bolt.sy}px`, '--ex': `${bolt.ex}px`, '--ey': `${bolt.ey}px` } as CSSProperties}
          />
        )}
        {phase !== 'ready' && <span aria-hidden className="cr-flash" style={{ animationDelay: `${BOLT_MS - 40}ms` }} />}
        {beaten && (
          <span aria-hidden className="cr-spell">
            {SPELL}
          </span>
        )}

        {/* The wand: it rises into view at the bottom, and is dragged onto him. */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Wand. Drag it onto Voldemort to cast a spell, or press Enter."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onKeyDown={onWandKey}
          className="absolute bottom-3 left-1/2 -ml-7 flex h-32 w-14 cursor-grab touch-none items-end justify-center outline-offset-4 active:cursor-grabbing"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s',
            opacity: phase === 'ready' ? 1 : 0,
            pointerEvents: phase === 'ready' ? 'auto' : 'none',
          }}
        >
          <span className={`cr-wand-in block ${dragging ? '' : 'cr-wand-idle'}`}>
            <svg ref={wandArt} viewBox="0 0 36 120" className="h-28 w-9" aria-hidden>
              <path d="M8 112 L28 10" stroke="#b98f58" strokeWidth="5" strokeLinecap="round" />
              <path d="M8 112 L14 84" stroke="#5e3f22" strokeWidth="8" strokeLinecap="round" />
              <circle cx="28" cy="10" r="5" fill="#ffe9a8" style={{ filter: 'drop-shadow(0 0 7px rgba(255,214,120,0.95))' }} />
            </svg>
          </span>
        </div>
      </div>

      {!beaten && (
        <p className="mx-auto mt-5 max-w-sm font-book text-lg italic leading-snug text-leather-soft" role="status" aria-live="polite">
          {GUIDANCE[state]}
        </p>
      )}

      {beaten && (
        <SpeechBubble
          name={COMMON_ROOM_COPY.villainName}
          accent="text-red-300"
          tail="up"
          className="cr-fade relative mx-auto mt-7 max-w-xs"
          style={{ animationDelay: '0.9s' }}
        >
          {COMMON_ROOM_COPY.villainDefeatLine}
        </SpeechBubble>
      )}

      <div className="mt-6 flex flex-col items-center gap-2">
        {beaten ? (
          mayContinue && (
            <button type="button" onClick={onDefeated} className={`${primaryButton} cr-fade !px-8`} autoFocus>
              Continue <ArrowRight aria-hidden size={16} />
            </button>
          )
        ) : (
          <>
            {(state === 'idle' || state === 'asking') && (
              <button type="button" onClick={() => void enable()} disabled={state === 'asking'} className={inkButton}>
                <Wand2 aria-hidden size={18} /> Or wave your phone like a wand
              </button>
            )}
            <button type="button" onClick={() => cast()} className={textButton}>
              Cast the spell with a tap instead
            </button>
            <button type="button" onClick={onBack} className={`${textButton} inline-flex items-center gap-2`}>
              <ArrowLeft aria-hidden size={15} /> Back to the question
            </button>
          </>
        )}
      </div>
    </section>
  )
}
