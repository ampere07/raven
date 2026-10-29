import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { COMMON_ROOM_COPY, type FinaleBeat } from '../../../shared/commonRoom'
import handTheme from '../../hand.mp3'
import { setSceneTrack } from '../../utils/sceneMusic'
import { DarkLord } from './DarkLord'
import { SpeechBubble } from './SpeechBubble'
import { Stickman } from './Stickman'
import { FinaleTalk } from './FinaleTalk'
import { textButton } from './ui'

type Phase = 'appear' | 'charge' | 'throw' | 'pause' | 'save' | 'ask'

// When each stage begins, in milliseconds from the start of the scene.
const SCHEDULE: readonly (readonly [Phase, number])[] = [
  ['charge', 3400],
  ['throw', 6000],
  ['pause', 7100],
  ['save', 8800],
  ['ask', 10400],
]

const narrationFor = (villainName: string, heroName: string): Record<Phase, string> => ({
  appear: `Bumalik si ${villainName}.`,
  charge: 'Nagcha-charge siya ng malakas na spell.',
  throw: 'Binato niya ’to diretso sa’yo!',
  pause: 'Parang huminto yung oras.',
  save: `Si ${heroName}, isang stick figure, tumalon sa harap mo at hinarang yung spell.`,
  ask: `Humarap sa’yo si ${heroName}.`,
})

// Who is in the scene and what they say. Chapter II's is the default; another chapter can bring its own.
export type ReturnCopy = {
  villainName: string
  villainLine: string
  heroName: string
  conversation: readonly FinaleBeat[]
}

const DEFAULT_COPY: ReturnCopy = {
  villainName: COMMON_ROOM_COPY.villainName,
  villainLine: COMMON_ROOM_COPY.finale.villainLine,
  heroName: COMMON_ROOM_COPY.finale.heroName,
  conversation: COMMON_ROOM_COPY.finale.conversation as readonly FinaleBeat[],
}

const TIP = { x: 225, y: 78 } as const
const HOLD = { x: 180, y: 235 } as const
const COLLISION = { x: 180, y: 282 } as const

const BURST = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * 2 * Math.PI
  const reach = 90 + (i % 3) * 30
  return { r: 3 + (i % 2) * 2, dx: Math.round(Math.cos(angle) * reach), dy: Math.round(Math.sin(angle) * reach) }
})

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

type Props = {
  onFinished: () => void
  copy?: ReturnCopy
  /** The villain's art, drawn in the scene's own 360 x 480 space. */
  villain?: ReactNode
  /** Puts a pirate hat on the hero. */
  hat?: boolean
}

// Seen from the viewer's own eyes. The spell is thrown at the screen, everything freezes, and a stick figure steps in
// front to take it. Nothing here is stored.
export function ReturnScene({ onFinished, copy = DEFAULT_COPY, villain: villainArt, hat }: Props) {
  const NARRATION = narrationFor(copy.villainName, copy.heroName)
  const [phase, setPhase] = useState<Phase>('appear')
  const [shown, setShown] = useState(false)
  const calm = prefersReducedMotion()

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setShown(true))
    const timers = SCHEDULE.map(([next, at]) => window.setTimeout(() => setPhase(next), at))
    return () => {
      window.cancelAnimationFrame(frame)
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  // The moment Raven steps in front of her, the chapter's music gives way to hand.mp3. The page hands it back when
  // she leaves the chapter.
  useEffect(() => {
    if (phase === 'save') setSceneTrack(handTheme)
  }, [phase])

  const move = (duration: string, curve = 'ease') =>
    calm ? 'opacity 0.4s ease' : `transform ${duration} ${curve}, opacity ${duration} ${curve}`

  const orb: CSSProperties =
    phase === 'appear'
      ? { transform: `translate(${TIP.x}px, ${TIP.y}px) scale(0.1)`, opacity: 0 }
      : phase === 'charge'
        ? { transform: `translate(${TIP.x}px, ${TIP.y}px) scale(3.4)`, opacity: 1, transition: move('2.4s', 'ease-in') }
        : phase === 'throw'
          ? { transform: `translate(${HOLD.x}px, ${HOLD.y}px) scale(12)`, opacity: 1, transition: move('1s', 'cubic-bezier(0.5, 0, 1, 0.5)') }
          : phase === 'pause'
            ? { transform: `translate(${HOLD.x}px, ${HOLD.y}px) scale(12)`, opacity: 1 }
            : { transform: `translate(${HOLD.x}px, ${HOLD.y}px) scale(14)`, opacity: 0, transition: move('0.45s', 'ease-out') }

  const villain: CSSProperties =
    phase === 'appear'
      ? { opacity: shown ? 1 : 0, transform: `scale(${shown ? 1 : 0.7})`, transition: move('1.2s', 'ease-out') }
      : phase === 'save' || phase === 'ask'
        ? { opacity: 0, transform: 'translateY(-18px) scale(0.85)', transition: move('1.2s', 'ease-in') }
        : { opacity: 1, transform: 'scale(1.08)', transition: move('1s') }

  const hero: CSSProperties =
    phase === 'save' || phase === 'ask'
      ? { transform: 'translate(0px, 0px)', transition: move('0.5s', 'cubic-bezier(0.22, 1, 0.36, 1)') }
      : { transform: 'translate(-260px, 0px)' }

  const rumbling = phase === 'charge' || phase === 'throw'
  return (
    <section aria-labelledby="finale-title" className="cr-parchment cr-unfurl px-5 py-8 text-center sm:px-10 sm:py-12">
      <h2 id="finale-title" className="sr-only">
        Bumalik si {copy.villainName}
      </h2>
      <p className="sr-only" role="status" aria-live="polite">
        {NARRATION[phase]}
      </p>

      <div
        className="cr-arena relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-sm"
        style={{
          filter: phase === 'pause' ? 'grayscale(0.75) contrast(1.1) brightness(0.9)' : 'none',
          transition: 'filter 0.3s ease',
        }}
      >
        <div className={`h-full w-full ${rumbling && !calm ? 'cr-rumble' : ''}`}>
          <svg viewBox="0 0 360 480" aria-hidden className="block h-full w-full">
            <defs>
              <radialGradient id="ret-orb" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#fff6e0" />
                <stop offset="0.35" stopColor="#ff5a6a" />
                <stop offset="0.75" stopColor="#6a1c80" />
                <stop offset="1" stopColor="#3a0f55" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="ret-blast" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#fff" />
                <stop offset="0.5" stopColor="#ffd98a" stopOpacity="0.55" />
                <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="ret-shield" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#ffe9a8" />
                <stop offset="0.5" stopColor="#bfeaff" />
                <stop offset="1" stopColor="#ffe9a8" />
              </linearGradient>
            </defs>

            <g stroke="rgba(193,154,75,0.13)" strokeWidth="1">
              {[-120, -20, 80, 180, 280, 380, 480].map((x) => (
                <path key={x} d={`M180 250 L${x} 480`} />
              ))}
              {[290, 330, 380, 440].map((y) => (
                <path key={y} d={`M0 ${y} H360`} />
              ))}
            </g>

            <g style={{ ...villain, transformOrigin: '180px 90px' }}>
              {villainArt ?? <DarkLord x="130" y="26" width="100" height="112" />}
            </g>

            {phase === 'charge' &&
              [0, 0.37, 0.74].map((delay) => (
                <circle
                  key={delay}
                  className="cr-ring"
                  cx={TIP.x}
                  cy={TIP.y}
                  r="40"
                  fill="none"
                  stroke="#ff7a8a"
                  strokeWidth="2"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}

            <g style={{ ...orb, filter: 'drop-shadow(0 0 8px rgba(255,70,90,0.9))' }}>
              <circle r="6" fill="url(#ret-orb)" />
            </g>

            <path
              d="M104 344 A76 76 0 0 1 256 344"
              pathLength={1}
              fill="none"
              stroke="url(#ret-shield)"
              strokeWidth="5"
              strokeLinecap="round"
              style={{
                strokeDasharray: '1 3',
                strokeDashoffset: phase === 'save' || phase === 'ask' ? 0 : 1.02,
                opacity: phase === 'ask' ? 0 : 1,
                filter: 'drop-shadow(0 0 6px rgba(191,234,255,0.9))',
                transition: phase === 'ask' ? 'opacity 0.8s ease' : calm ? 'none' : 'stroke-dashoffset 0.35s ease-out',
              }}
            />

            {phase === 'save' && (
              <g>
                <circle cx={COLLISION.x} cy={COLLISION.y} r="110" fill="url(#ret-blast)" className="cr-blast" />
                {BURST.map((spark, i) => (
                  <circle
                    key={i}
                    cx={COLLISION.x}
                    cy={COLLISION.y}
                    r={spark.r}
                    fill="#ffd27a"
                    className="cr-burst"
                    style={{ '--dx': `${spark.dx}px`, '--dy': `${spark.dy}px` } as CSSProperties}
                  />
                ))}
              </g>
            )}

            <g style={hero}>
              <Stickman name={copy.heroName} pose={phase === 'ask' ? 'ask' : 'guard'} hat={hat} />
            </g>
          </svg>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, transparent 35%, rgba(150, 10, 30, 0.55) 100%)',
            opacity: rumbling ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}
        />

        {phase === 'appear' && (
          <SpeechBubble
            name={copy.villainName}
            accent="text-red-300"
            tail="up"
            className="cr-fade absolute left-1/2 top-[33%] w-[82%] -translate-x-1/2"
            style={{ animationDelay: '1.3s' }}
          >
            {copy.villainLine}
          </SpeechBubble>
        )}
      </div>

      {phase === 'ask' && <FinaleTalk heroName={copy.heroName} conversation={copy.conversation} onFinished={onFinished} />}

      <div className="mt-4 flex justify-center">
        <button type="button" onClick={onFinished} className={textButton}>
          Skip na lang ’to
        </button>
      </div>
    </section>
  )
}
