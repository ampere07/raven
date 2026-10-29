import { useEffect, useState, type CSSProperties } from 'react'
import { HIGH_SEAS_COPY } from '../../../shared/highSeas'
import handTheme from '../../hand.mp3'
import { setSceneTrack } from '../../utils/sceneMusic'
import { FinaleTalk } from '../common-room/FinaleTalk'
import { SpeechBubble } from '../common-room/SpeechBubble'
import { Stickman } from '../common-room/Stickman'
import { textButton } from '../common-room/ui'
import { DavyJones } from './DavyJones'

type Phase = 'trap' | 'cell' | 'raven' | 'open' | 'boat' | 'sail' | 'ask'

// When each stage begins, in milliseconds from the start of the scene.
const SCHEDULE: readonly (readonly [Phase, number])[] = [
  ['cell', 3800],
  ['raven', 6200],
  ['open', 9000],
  ['boat', 11400],
  ['sail', 13400],
  ['ask', 15200],
]
const ORDER: readonly Phase[] = ['trap', 'cell', 'raven', 'open', 'boat', 'sail', 'ask']

const NARRATION: Record<Phase, string> = {
  trap: `Lumabas si ${HIGH_SEAS_COPY.villainName} mula sa dilim.`,
  cell: 'Bumagsak yung mga rehas. Nakakulong ka na.',
  raven: `Dumating si ${HIGH_SEAS_COPY.finale.heroName}, isang stick figure, sa labas ng selda mo.`,
  open: 'Nabuksan yung kandado.',
  boat: 'Sumakay kayo sa maliit na bangka.',
  sail: `Lumayo kayo sa barko ni ${HIGH_SEAS_COPY.villainName}.`,
  ask: `Humarap sa’yo si ${HIGH_SEAS_COPY.finale.heroName}.`,
}

const BARS = Array.from({ length: 10 }, (_, i) => 14 + i * 36)
const STARS = [
  [30, 40], [90, 120], [150, 60], [210, 30], [300, 150], [330, 60], [60, 220], [120, 20], [250, 110],
] as const

const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * 2 * Math.PI
  const reach = 40 + (i % 3) * 18
  return { dx: Math.round(Math.cos(angle) * reach), dy: Math.round(Math.sin(angle) * reach), r: 2.5 + (i % 2) * 1.5 }
})

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

type Props = { onFinished: () => void }

// Davy Jones's trap has sprung. The viewer is in a cell, looking out through the bars. Raven comes to the other side
// of them, the lock breaks, and the two of them leave in a small boat; then they talk. Nothing here is stored.
export function JailEscape({ onFinished }: Props) {
  const { heroName } = HIGH_SEAS_COPY.finale
  const [phase, setPhase] = useState<Phase>('trap')
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

  // The moment Raven appears, the chapter's music gives way to hand.mp3. The page hands it back when she leaves.
  useEffect(() => {
    if (phase === 'raven') setSceneTrack(handTheme)
  }, [phase])

  const reached = (stage: Phase) => ORDER.indexOf(phase) >= ORDER.indexOf(stage)
  const move = (duration: string, curve = 'ease', delay = '0s') =>
    calm ? 'opacity 0.4s ease' : `transform ${duration} ${curve} ${delay}, opacity ${duration} ${curve} ${delay}`

  const villain: CSSProperties =
    phase === 'trap'
      ? { opacity: shown ? 1 : 0, transform: `scale(${shown ? 1 : 0.7})`, transition: move('1.2s', 'ease-out') }
      : { opacity: 0, transform: 'translateY(-18px) scale(0.85)', transition: move('1s', 'ease-in') }

  const slammed = reached('cell') && !reached('open')
  const bars: CSSProperties = {
    transform: `translateY(${slammed ? 0 : -540}px)`,
    transition: slammed ? move('0.45s', 'cubic-bezier(0.6, 0, 1, 0.6)') : reached('open') ? move('1.6s', 'cubic-bezier(0.5, 0, 0.2, 1)', '0.7s') : 'none',
  }

  const hero: CSSProperties = reached('raven')
    ? { transform: 'translate(0px, 0px)', transition: move('1.1s', 'cubic-bezier(0.22, 1, 0.36, 1)') }
    : { transform: 'translate(-280px, 0px)' }

  const boat: CSSProperties = {
    transform: `translateY(${reached('boat') ? 0 : 110}px)`,
    transition: move('1.6s', 'cubic-bezier(0.22, 1, 0.36, 1)'),
  }

  const wall: CSSProperties = { opacity: reached('sail') ? 0 : 1, transition: calm ? 'opacity 0.4s ease' : 'opacity 1.8s ease' }

  const caption = phase === 'raven' ? HIGH_SEAS_COPY.escape.heroLine : phase === 'open' ? HIGH_SEAS_COPY.escape.openLine : null

  return (
    <section aria-labelledby="escape-title" className="cr-parchment cr-unfurl px-5 py-8 text-center sm:px-10 sm:py-12">
      <h2 id="escape-title" className="sr-only">
        Nahulog ka sa bitag ni {HIGH_SEAS_COPY.villainName}
      </h2>

      <div className="cr-arena relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-sm">
        <svg viewBox="0 0 360 480" aria-hidden className="block h-full w-full">
          <defs>
            <pattern id="jl-brick" width="60" height="32" patternUnits="userSpaceOnUse">
              <rect width="60" height="32" fill="#18212c" />
              <path d="M0 0H60M0 16H60M0 32H60M30 0V16M0 16V32M60 16V32" stroke="#0a0f16" strokeWidth="2" fill="none" />
              <path d="M2 2H28M32 18H58" stroke="#2a3644" strokeWidth="1" fill="none" />
            </pattern>
            <linearGradient id="jl-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#050b1a" />
              <stop offset="1" stopColor="#0f3a52" />
            </linearGradient>
            <linearGradient id="jl-iron" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#1b1f27" />
              <stop offset="0.35" stopColor="#59606e" />
              <stop offset="1" stopColor="#14171d" />
            </linearGradient>
            <linearGradient id="jl-wood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a9743a" />
              <stop offset="1" stopColor="#4f2f14" />
            </linearGradient>
            <radialGradient id="jl-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#ffb347" stopOpacity="0.55" />
              <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="jl-blast" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.5" stopColor="#ffd98a" stopOpacity="0.55" />
              <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
            </radialGradient>
            <mask id="jl-arch">
              <rect width="360" height="480" fill="#fff" />
              <path d="M100 440V230A80 80 0 0 1 260 230V440Z" fill="#000" />
            </mask>
          </defs>

          {/* The open sea, seen through the sea-gate and, later, all around. */}
          <rect width="360" height="480" fill="url(#jl-sky)" />
          <circle cx="205" cy="150" r="46" fill="#fff6d6" opacity="0.14" />
          <circle cx="205" cy="150" r="22" fill="#fff0c4" opacity="0.95" />
          <g fill="#dfefff">
            {STARS.map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" opacity="0.8" />
            ))}
          </g>
          <g className="sea-drift" fill="#123f52" opacity="0.8">
            <path d="M0 392Q30 374 60 392T120 392T180 392T240 392T300 392T360 392T420 392T480 392V480H0Z" />
          </g>
          <g className="sea-drift slow" fill="#0c2c3d">
            <path d="M0 418Q30 402 60 418T120 418T180 418T240 418T300 418T360 418T420 418T480 418V480H0Z" />
          </g>

          {/* The dungeon wall, with a torch on each side, a stone dock, and the sea-gate cut out of it. */}
          <g style={wall}>
            <g mask="url(#jl-arch)">
              <rect width="360" height="480" fill="url(#jl-brick)" />
            </g>
            <path d="M100 440V230A80 80 0 0 1 260 230V440" fill="none" stroke="#2b3947" strokeWidth="6" />
            <rect y="440" width="360" height="40" fill="#10171f" />
            <rect y="440" width="360" height="3" fill="#2b3947" />
            {[44, 316].map((x) => (
              <g key={x}>
                <circle cx={x} cy="176" r="62" fill="url(#jl-glow)" className="sea-flame" />
                <rect x={x - 3} y="184" width="6" height="30" fill="#3a2a1a" />
                <path className="sea-flame" d={`M${x} 150C${x - 12} 166 ${x - 8} 182 ${x} 184C${x + 8} 182 ${x + 12} 166 ${x} 150Z`} fill="#ffb347" />
              </g>
            ))}
          </g>

          <g style={{ ...villain, transformOrigin: '180px 90px' }}>
            <DavyJones x="130" y="26" width="100" height="112" />
          </g>

          <g className={reached('sail') && !calm ? 'sea-bob' : undefined}>
            <g style={hero}>
              <Stickman name={heroName} pose="ask" hat />
            </g>

            {/* The boat: only its near rim is in view, as if the viewer were sitting in it. */}
            <g style={boat}>
              <path d="M12 436H348Q330 484 268 484H92Q30 484 12 436Z" fill="url(#jl-wood)" stroke="#2a1608" strokeWidth="2.5" />
              <path d="M12 436H348" stroke="#d8a566" strokeWidth="5" strokeLinecap="round" />
              <path d="M40 456H320M70 470H290" stroke="#2a1608" strokeWidth="1.5" opacity="0.5" fill="none" />
            </g>
          </g>

          {/* The cell's bars, slammed down in front of everything and lifted when the lock breaks. */}
          <g style={bars}>
            {BARS.map((x) => (
              <rect key={x} x={x} y="-20" width="9" height="520" rx="3" fill="url(#jl-iron)" />
            ))}
            <rect x="6" y="90" width="348" height="9" rx="3" fill="url(#jl-iron)" />
            <rect x="6" y="236" width="348" height="9" rx="3" fill="url(#jl-iron)" />
            <path d="M174 232V224A6 6 0 0 1 186 224V232" fill="none" stroke="#d9b25c" strokeWidth="3" />
            <rect x="170" y="232" width="20" height="20" rx="3" fill="#d9b25c" stroke="#7a5a1a" strokeWidth="1.5" />
            <circle cx="180" cy="240" r="2.5" fill="#3a2a10" />
          </g>

          {phase === 'open' && (
            <g>
              <circle cx="180" cy="242" r="60" fill="url(#jl-blast)" className="cr-blast" />
              {SPARKS.map((spark, i) => (
                <circle
                  key={i}
                  cx="180"
                  cy="242"
                  r={spark.r}
                  fill="#ffd27a"
                  className="cr-burst"
                  style={{ '--dx': `${spark.dx}px`, '--dy': `${spark.dy}px` } as CSSProperties}
                />
              ))}
            </g>
          )}
        </svg>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0, 0, 0, 0.55) 100%)' }}
        />

        {phase === 'trap' && (
          <SpeechBubble
            name={HIGH_SEAS_COPY.villainName}
            accent="text-red-300"
            tail="up"
            className="cr-fade absolute left-1/2 top-[33%] w-[82%] -translate-x-1/2"
            style={{ animationDelay: '1.3s' }}
          >
            {HIGH_SEAS_COPY.escape.villainLine}
          </SpeechBubble>
        )}

        {caption && (
          <SpeechBubble
            key={phase}
            name={heroName}
            tail="down"
            className="cr-fade absolute left-1/2 top-[22%] w-[82%] -translate-x-1/2"
            style={{ animationDelay: '0.9s' }}
          >
            {caption}
          </SpeechBubble>
        )}
      </div>

      {phase !== 'ask' ? (
        <p className="mx-auto mt-5 max-w-sm font-book text-lg italic leading-snug text-leather-soft" role="status" aria-live="polite">
          {NARRATION[phase]}
        </p>
      ) : (
        <FinaleTalk heroName={heroName} conversation={HIGH_SEAS_COPY.finale.conversation} onFinished={onFinished} />
      )}

      <div className="mt-4 flex justify-center">
        <button type="button" onClick={onFinished} className={textButton}>
          Skip na lang ’to
        </button>
      </div>
    </section>
  )
}
