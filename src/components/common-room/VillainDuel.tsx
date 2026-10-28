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

// He takes five hits. Each lands a different spell, and the last one is the classic duelling finish.
const HEALTH = 5
const SPELLS = ['Stupefy!', 'Impedimenta!', 'Petrificus Totalus!', 'Protego!', 'Expelliarmus!']
// The wand is back in her hand this long after a spell leaves it.
const RELOAD_MS = 650
const BOLT_MS = 430
// How long his last words stay on screen before she can move on.
const READ_MS = 2200

const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * 2 * Math.PI
  const reach = 70 + (i % 3) * 22
  return { dx: Math.round(Math.cos(angle) * reach), dy: Math.round(Math.sin(angle) * reach), delay: (i % 4) * 0.06 }
})

const GUIDANCE: Record<SensorState, string> = {
  idle: 'I-drag mo yung wand kay Voldemort para mag-cast ng spell.',
  asking: 'Humihingi ng permission sa phone mo para sa motion…',
  checking: 'Nakikinig din yung phone mo. I-flick mo parang wand!',
  motion: 'Ready na rin yung phone mo. I-flick mo yung wrist mo!',
  none: 'Hindi nagse-share ng motion yung device mo. I-drag mo na lang yung wand sa screen.',
  denied: 'Hindi pinayagan yung motion. I-drag mo na lang yung wand sa screen.',
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
  const [hits, setHits] = useState(0)
  const hitsRef = useRef(0)
  const [spell, setSpell] = useState<{ id: number; name: string } | null>(null)

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

  // Every spell that reaches him costs him some health. It flies from the wand (or from the bottom of the arena when
  // cast by phone or button), and the wand comes back to be dragged again until he has none left.
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
        hitsRef.current += 1
        setHits(hitsRef.current)
        setSpell({ id: hitsRef.current, name: SPELLS[hitsRef.current - 1] })
        setBolt(null)

        if (hitsRef.current >= HEALTH) {
          phaseRef.current = 'defeated'
          setPhase('defeated')
          later(() => setMayContinue(true), READ_MS)
        } else {
          later(() => {
            phaseRef.current = 'ready'
            setPhase('ready')
          }, RELOAD_MS)
        }
      }, BOLT_MS)
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
  const left = HEALTH - hits

  return (
    <section aria-labelledby="duel-title" className="cr-parchment cr-unfurl px-5 py-8 text-center sm:px-10 sm:py-12">
      <h2 id="duel-title" className="font-display text-3xl leading-tight text-burgundy sm:text-4xl">
        {beaten ? `Wala na si ${COMMON_ROOM_COPY.villainName}… for now.` : `Nasa Common Room si ${COMMON_ROOM_COPY.villainName}`}
      </h2>
      <Flourish className="mx-auto mt-4 w-40 text-gold" />
      <p className="mx-auto mt-4 max-w-md font-book text-xl leading-snug text-leather-soft">
        {beaten
          ? 'Okay na ulit dito.'
          : 'Nakapasok siya sa Common Room at ayaw ka niyang paabutin sa susunod na tanong. Kunin mo yung wand tapos paulit-ulit mo siyang i-spell hanggang maubos yung health niya!'}
      </p>

      <div ref={arena} className="cr-arena relative mx-auto mt-6 h-96 w-full max-w-sm overflow-hidden rounded-sm sm:h-[26rem]">
        {!beaten && (
          <div
            className="absolute inset-x-6 top-3 z-10"
            role="progressbar"
            aria-label={`Health ni ${COMMON_ROOM_COPY.villainName}`}
            aria-valuemin={0}
            aria-valuemax={HEALTH}
            aria-valuenow={left}
          >
            <p className="mb-1 flex justify-between font-book text-sm tracking-wide text-red-200/90">
              <span>{COMMON_ROOM_COPY.villainName}</span>
              <span aria-hidden>{left} / {HEALTH}</span>
            </p>
            <div className="h-2.5 overflow-hidden rounded-sm bg-black/60 ring-1 ring-red-300/40">
              <div
                className="h-full bg-gradient-to-r from-red-800 to-red-500 transition-[width] duration-500 ease-out"
                style={{ width: `${(left / HEALTH) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="absolute left-1/2 top-12 -translate-x-1/2">
          <div
            ref={villain}
            className={beaten ? undefined : 'cr-sway'}
            style={{ '--sway-time': `${Math.max(1.4, 3.2 - hits * 0.45)}s` } as CSSProperties}
          >
            {!beaten ? (
              <DarkLord className={`h-44 w-auto sm:h-52 ${phase === 'casting' ? 'cr-villain-hit' : 'cr-villain'}`} />
            ) : (
              <DarkLord className="cr-villain-vanish h-44 w-auto sm:h-52" />
            )}
          </div>
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
        {spell && (
          <span key={spell.id} aria-hidden className="cr-spell">
            {spell.name}
          </span>
        )}

        {/* The wand: it rises into view at the bottom, and is dragged onto him. */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Wand. I-drag mo kay Voldemort para mag-cast ng spell, o pindutin ang Enter."
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
              Tuloy <ArrowRight aria-hidden size={16} />
            </button>
          )
        ) : (
          <>
            {(state === 'idle' || state === 'asking') && (
              <button type="button" onClick={() => void enable()} disabled={state === 'asking'} className={inkButton}>
                <Wand2 aria-hidden size={18} /> O i-wave mo yung phone mo parang wand
              </button>
            )}
            <button type="button" onClick={() => cast()} className={textButton}>
              I-tap na lang para mag-cast
            </button>
            <button type="button" onClick={onBack} className={`${textButton} inline-flex items-center gap-2`}>
              <ArrowLeft aria-hidden size={15} /> Balik sa tanong
            </button>
          </>
        )}
      </div>
    </section>
  )
}
