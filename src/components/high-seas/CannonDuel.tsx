import { ArrowLeft, ArrowRight, Crosshair } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { CANNON_HEALTH, HIGH_SEAS_COPY } from '../../../shared/highSeas'
import { SpeechBubble } from '../common-room/SpeechBubble'
import { primaryButton, textButton } from '../common-room/ui'
import { DavyJones } from './DavyJones'
import { ReactionGif } from './ReactionGif'

type Phase = 'ready' | 'firing' | 'defeated'
type Shot = { sx: number; sy: number; ex: number; ey: number }
type Splash = { id: number; x: number; y: number }

// The cannonball takes this long to arrive, and the cannon needs a moment before it can fire again.
const FLIGHT_MS = 430
const RELOAD_MS = 450
// How long his last words stay on screen before she can move on.
const READ_MS = 2200

const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * 2 * Math.PI
  const reach = 70 + (i % 3) * 22
  return { dx: Math.round(Math.cos(angle) * reach), dy: Math.round(Math.sin(angle) * reach), delay: (i % 4) * 0.06 }
})

type Props = { onDefeated: () => void; onBack: () => void }

// A cannon fight. Davy Jones sweeps from side to side above a stormy sea; tapping the water fires a cannonball at that
// spot, and it only hits if he is still there when it arrives. Five hits sink him, and every hit makes him faster.
// The "Fire" button always hits, so the chapter can be finished without aiming. Nothing here is stored.
export function CannonDuel({ onDefeated, onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('ready')
  const phaseRef = useRef<Phase>('ready')
  const [hits, setHits] = useState(0)
  const hitsRef = useRef(0)
  const [shot, setShot] = useState<Shot | null>(null)
  const [splash, setSplash] = useState<Splash | null>(null)
  const [message, setMessage] = useState<string>(HIGH_SEAS_COPY.duel.guidance)
  const [mayContinue, setMayContinue] = useState(false)

  const arena = useRef<HTMLDivElement>(null)
  const villain = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const splashId = useRef(0)

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
  }, [])

  const later = useCallback((work: () => void, ms: number) => {
    timers.current.push(window.setTimeout(work, ms))
  }, [])

  // `x` is where she tapped, in the arena's own coordinates. Without it the ball is aimed straight at him.
  const fire = useCallback(
    (x?: number) => {
      if (phaseRef.current !== 'ready') return
      const box = arena.current?.getBoundingClientRect()
      const target = villain.current?.getBoundingClientRect()
      if (!box || !target) return

      phaseRef.current = 'firing'
      setPhase('firing')

      const centre = target.left + target.width / 2 - box.left
      const aim = x ?? centre
      const ey = target.top + target.height * 0.5 - box.top
      setShot({ sx: box.width / 2, sy: box.height - 34, ex: aim, ey })
      navigator.vibrate?.(40)

      later(() => {
        setShot(null)
        const now = villain.current?.getBoundingClientRect()
        const reached = now ? now.left + now.width / 2 - box.left : centre
        const landed = x === undefined || Math.abs(aim - reached) <= (now?.width ?? 120) * 0.38

        if (!landed) {
          splashId.current += 1
          setSplash({ id: splashId.current, x: aim, y: ey })
          setMessage(HIGH_SEAS_COPY.duel.miss)
          later(() => {
            phaseRef.current = 'ready'
            setPhase('ready')
          }, RELOAD_MS - 150)
          return
        }

        hitsRef.current += 1
        setHits(hitsRef.current)
        setMessage(HIGH_SEAS_COPY.duel.hit[hitsRef.current - 1] ?? '')

        if (hitsRef.current >= CANNON_HEALTH) {
          phaseRef.current = 'defeated'
          setPhase('defeated')
          later(() => setMayContinue(true), READ_MS)
        } else {
          later(() => {
            phaseRef.current = 'ready'
            setPhase('ready')
          }, RELOAD_MS)
        }
      }, FLIGHT_MS)
    },
    [later],
  )

  const onArenaDown = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    fire(event.clientX - box.left)
  }

  const beaten = phase === 'defeated'
  const left = CANNON_HEALTH - hits

  return (
    <section aria-labelledby="duel-title" className="cr-parchment cr-unfurl px-5 py-8 text-center sm:px-10 sm:py-12">
      <h2 id="duel-title" className="font-display text-sm uppercase tracking-[0.3em] text-burgundy">
        {HIGH_SEAS_COPY.villainName}
      </h2>

      <div
        ref={arena}
        onPointerDown={onArenaDown}
        className="cr-arena relative mx-auto mt-4 h-96 w-full max-w-sm cursor-crosshair overflow-hidden rounded-sm sm:h-[26rem]"
        style={{ background: 'linear-gradient(180deg, #0a1a2c 0%, #0d3040 62%, #14566a 100%)' }}
      >
        {!beaten && (
          <div
            className="absolute inset-x-4 top-3"
            role="progressbar"
            aria-label={`Lakas ni ${HIGH_SEAS_COPY.villainName}`}
            aria-valuemin={0}
            aria-valuemax={CANNON_HEALTH}
            aria-valuenow={left}
          >
            <p className="mb-1 flex justify-between font-book text-sm tracking-wide text-teal-100/90">
              <span>{HIGH_SEAS_COPY.villainName}</span>
              <span aria-hidden>
                {left} / {CANNON_HEALTH}
              </span>
            </p>
            <div className="h-2.5 overflow-hidden rounded-sm bg-black/60 ring-1 ring-teal-200/40">
              <div
                className="h-full bg-gradient-to-r from-emerald-800 to-lime-400 transition-[width] duration-500 ease-out"
                style={{ width: `${(left / CANNON_HEALTH) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="absolute left-1/2 top-12 -translate-x-1/2">
          <div
            ref={villain}
            className={beaten ? undefined : 'sea-sweep'}
            style={{ '--sweep-time': `${Math.max(0.9, 3.2 - hits * 0.55).toFixed(2)}s`, '--sweep': 'min(104px, 26vw)' } as CSSProperties}
          >
            <DavyJones className={`h-32 w-auto sm:h-36 ${beaten ? 'cr-villain-vanish' : phase === 'firing' ? 'cr-villain-hit' : 'cr-villain'}`} />
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

        {shot && (
          <span
            aria-hidden
            className="sea-ball"
            style={{ '--sx': `${shot.sx}px`, '--sy': `${shot.sy}px`, '--ex': `${shot.ex}px`, '--ey': `${shot.ey}px` } as CSSProperties}
          />
        )}
        {splash && <span key={splash.id} aria-hidden className="sea-splash" style={{ left: splash.x, top: splash.y }} />}

        {/* The cannon, on the deck at the bottom. */}
        <svg viewBox="0 0 80 50" aria-hidden className="pointer-events-none absolute bottom-1 left-1/2 h-14 w-24 -translate-x-1/2">
          <path d="M8 34 L52 18 L58 30 L14 44 Z" fill="#2a2a31" stroke="#6b6b76" strokeWidth="2" />
          <circle cx="58" cy="24" r="9" fill="#1a1a1f" stroke="#6b6b76" strokeWidth="2" />
          <circle cx="24" cy="42" r="8" fill="#6b4a2a" stroke="#c19a4b" strokeWidth="2" />
          <circle cx="24" cy="42" r="2.5" fill="#c19a4b" />
        </svg>
      </div>

      {!beaten ? (
        <p className="mx-auto mt-5 max-w-sm font-book text-lg italic leading-snug text-leather-soft" role="status" aria-live="polite">
          {message}
        </p>
      ) : (
        <>
          <SpeechBubble
            name={HIGH_SEAS_COPY.villainName}
            accent="text-teal-200"
            tail="up"
            className="cr-fade relative mx-auto mt-7 max-w-xs"
            style={{ animationDelay: '0.9s' }}
          >
            {HIGH_SEAS_COPY.villainDefeatLine}
          </SpeechBubble>
          <ReactionGif reaction="boss" className="mt-5" />
        </>
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
            <button type="button" onClick={() => fire()} disabled={phase !== 'ready'} className={primaryButton}>
              <Crosshair aria-hidden size={18} /> Fire!
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
