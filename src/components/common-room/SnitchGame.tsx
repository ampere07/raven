import { ArrowRight } from 'lucide-react'
import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { COMMON_ROOM_COPY, SNITCH_TARGET, type FinaleBeat } from '../../../shared/commonRoom'
import handTheme from '../../hand.mp3'
import { setSceneTrack } from '../../utils/sceneMusic'
import { SpeechBubble } from './SpeechBubble'
import { primaryButton, textButton } from './ui'

type Phase = 'play' | 'grab' | 'turn' | 'talk'
type Point = { x: number; y: number }

// Scene coordinates, the same 360 x 480 the other scenes are drawn in. Positions are turned into percentages.
const W = 360
const H = 480
const SHOULDER: Point = { x: 200, y: 368 }
const ELBOW: Point = { x: 246, y: 352 }

// Where a snitch may wander, and where the very last one stays so Raven's arm can reach it.
const ROAM = { x: [50, 310], y: [70, 320] } as const
const REACHABLE = { x: [226, 282], y: [140, 220] } as const

// From the final tap: Raven reaches in, then slowly turns his face to her (the music begins), then he speaks.
const TURN_AT = 1500
const TALK_AT = 4600

const between = (range: readonly [number, number]) => range[0] + Math.random() * (range[1] - range[0])

// A new spot for the snitch, far enough from the last one that it visibly darts away.
function pickSpot(from: Point, last: boolean): Point {
  const box = last ? REACHABLE : ROAM
  let spot = { x: between(box.x), y: between(box.y) }
  for (let tries = 0; tries < 8 && Math.hypot(spot.x - from.x, spot.y - from.y) < 90; tries++) {
    spot = { x: between(box.x), y: between(box.y) }
  }
  return spot
}

const percent = (value: number, total: number) => `${(value / total) * 100}%`

type Props = { onDone: () => void }

// A short Quidditch game: a golden snitch darts around and she has to tap it ten times. The last catch is shared:
// Raven's hand closes on it at the same moment, he turns to look at her, and they talk. Nothing here is stored.
export function SnitchGame({ onDone }: Props) {
  // hand.mp3 belongs to this scene only: leaving it hands the music back to the chapter.
  const finish = () => {
    setSceneTrack(null)
    onDone()
  }
  const [phase, setPhase] = useState<Phase>('play')
  const [caught, setCaught] = useState(0)
  const [spot, setSpot] = useState<Point>({ x: 180, y: 180 })
  const [burst, setBurst] = useState<(Point & { key: number }) | null>(null)
  const [beat, setBeat] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)

  // Each catch makes the next one a little quicker.
  const hop = Math.max(1700 - caught * 100, 750)

  useEffect(() => {
    if (phase !== 'play') return
    const id = window.setInterval(
      () => setSpot((from) => pickSpot(from, caught === SNITCH_TARGET - 1)),
      hop,
    )
    return () => window.clearInterval(id)
  }, [phase, caught, hop])

  // Each stage of the shared catch hands over to the next by itself.
  useEffect(() => {
    if (phase !== 'grab') return
    const id = window.setTimeout(() => {
      setPhase('turn')
      setSceneTrack(handTheme)
    }, TURN_AT)
    return () => window.clearTimeout(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'turn') return
    const id = window.setTimeout(() => setPhase('talk'), TALK_AT - TURN_AT)
    return () => window.clearTimeout(id)
  }, [phase])

  const catchIt = useCallback(() => {
    if (phase !== 'play') return
    const total = caught + 1
    setBurst({ ...spot, key: total })
    setCaught(total)
    if (total >= SNITCH_TARGET) {
      setPhase('grab')
    } else {
      setSpot(pickSpot(spot, total === SNITCH_TARGET - 1))
    }
  }, [phase, caught, spot])

  const talk = COMMON_ROOM_COPY.snitch.conversation as readonly FinaleBeat[]
  const current = talk[beat]
  const chosen = picked !== null ? current.choices?.[picked] : undefined
  const lastBeat = beat === talk.length - 1
  const waitingForChoice = Boolean(current.choices) && picked === null
  const advance = () => {
    if (lastBeat) return finish()
    setBeat(beat + 1)
    setPicked(null)
  }

  const playing = phase === 'play'
  const hero = COMMON_ROOM_COPY.snitch.heroName
  const facing = phase === 'turn' || phase === 'talk'

  const snitchStyle: CSSProperties = {
    left: percent(spot.x, W),
    top: percent(spot.y, H),
    transition: playing ? `left ${hop * 0.85}ms ease-in-out, top ${hop * 0.85}ms ease-in-out` : 'none',
  }

  return (
    <section aria-labelledby="snitch-title" className="cr-parchment cr-unfurl px-5 py-8 text-center sm:px-10 sm:py-12">
      <h2 id="snitch-title" className="font-display text-sm uppercase tracking-[0.3em] text-burgundy">
        {COMMON_ROOM_COPY.snitch.title}
      </h2>
      <p className="mx-auto mt-2 max-w-sm font-book text-lg italic leading-snug text-leather-soft">
        {COMMON_ROOM_COPY.snitch.guidance}
      </p>
      <p className="sr-only" role="status" aria-live="polite">
        Nahuli: {caught} sa {SNITCH_TARGET}
      </p>

      <div className="cr-arena relative mx-auto mt-5 aspect-[3/4] w-full max-w-sm overflow-hidden rounded-sm">
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden className="absolute inset-0 block h-full w-full">
          <g fill="none" stroke="rgba(193,154,75,0.28)" strokeWidth="3">
            {[70, 180, 290].map((x) => (
              <g key={x}>
                <path d={`M${x} 190 V96`} />
                <ellipse cx={x} cy="84" rx="22" ry="9" />
              </g>
            ))}
          </g>

          {!playing && (
            <g className="cr-fade">
              <g style={{ filter: 'drop-shadow(0 0 5px rgba(255,233,168,0.45))' }} strokeLinecap="round" strokeLinejoin="round">
                {/* Legs and shoes. */}
                <g fill="none">
                  <path d="M170 412 L162 450 M190 412 L198 450" stroke="#aab4d0" strokeWidth="17" />
                  <path d="M170 412 L162 450 M190 412 L198 450" stroke="#46506b" strokeWidth="14" />
                </g>
                <ellipse cx="158" cy="455" rx="13" ry="6" fill="#2a1a10" stroke="#c9a46a" strokeWidth="1.5" />
                <ellipse cx="202" cy="455" rx="13" ry="6" fill="#2a1a10" stroke="#c9a46a" strokeWidth="1.5" />
                {/* Resting arm, then the torso on top of it. */}
                <path d="M162 368 L150 396 L154 420" fill="none" stroke="#8a2a3a" strokeWidth="12" />
                <circle cx="154" cy="423" r="6" fill="#f2cfa6" />
                <path
                  d="M156 368 Q156 354 172 354 H188 Q204 354 204 368 L198 414 Q180 422 162 414 Z"
                  fill="#8a2a3a"
                  stroke="#e7c27a"
                  strokeWidth="1.8"
                />
                <rect x="160" y="408" width="40" height="7" rx="3" fill="#2a1a10" />
                {/* Neck and head. */}
                <rect x="175" y="344" width="10" height="14" rx="4" fill="#f2cfa6" />
                <circle cx="180" cy="330" r="17" fill="#f2cfa6" />
                <path d="M162.5 328 A17.5 17.5 0 0 1 197.5 328 Q192 316 180 317 Q168 316 162.5 328 Z" fill="#4a2f22" />
                {/* The reaching arm leaves the shoulder to the side, so it never crosses his face. */}
                <path
                  d={`M${SHOULDER.x} ${SHOULDER.y} L${ELBOW.x} ${ELBOW.y} L${spot.x} ${spot.y + 8}`}
                  pathLength={1}
                  fill="none"
                  stroke="#8a2a3a"
                  strokeWidth="12"
                  className="cr-reach"
                />
                <circle cx={spot.x} cy={spot.y + 10} r="6.5" fill="#f2cfa6" className="cr-fade" />
                {/* Face. */}
                <g
                  fill="#2a1a10"
                  style={{
                    transform: `translateX(${facing ? 0 : 7}px)`,
                    transition: 'transform 2.8s ease-in-out',
                  }}
                >
                  <circle cx="174" cy="330" r="2.4" />
                  <circle cx="186" cy="330" r="2.4" />
                </g>
                <path
                  d="M174 338 Q180 343 186 338"
                  fill="none"
                  stroke="#2a1a10"
                  strokeWidth="2"
                  style={{ opacity: facing ? 1 : 0, transition: 'opacity 1s ease 2s' }}
                />
              </g>
              <rect x="140" y="276" width="80" height="28" rx="2" fill="rgba(20,12,8,0.88)" stroke="rgba(193,154,75,0.75)" />
              <text x="180" y="296" textAnchor="middle" fontSize="19" fill="#ffe9a8" style={{ fontFamily: 'var(--font-display)' }}>
                {hero}
              </text>
            </g>
          )}
        </svg>

        {burst && (
          <span
            key={burst.key}
            aria-hidden
            className="cr-catch"
            style={{ left: percent(burst.x, W), top: percent(burst.y, H) }}
          />
        )}

        <button
          type="button"
          onClick={catchIt}
          disabled={!playing}
          aria-label="Hulihin ang Golden Snitch"
          tabIndex={playing ? 0 : -1}
          className="absolute size-20 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-soft"
          style={{ ...snitchStyle, pointerEvents: playing ? 'auto' : 'none', touchAction: 'manipulation' }}
        >
          <svg viewBox="-30 -22 60 44" aria-hidden className="h-full w-full overflow-visible">
            <g style={{ filter: 'drop-shadow(0 0 7px rgba(255,217,122,0.95))' }}>
              <path className="cr-snitch-wing left" d="M-6 -1 C-24 -20 -34 -12 -28 2 C-22 6 -12 4 -6 1 Z" fill="#fff7dc" opacity="0.92" />
              <path className="cr-snitch-wing right" d="M6 -1 C24 -20 34 -12 28 2 C22 6 12 4 6 1 Z" fill="#fff7dc" opacity="0.92" />
              <circle r="8.5" fill="#f1c24b" stroke="#c99a1e" strokeWidth="1.5" />
              <circle cx="-2.5" cy="-2.5" r="2.4" fill="#fff4c2" />
            </g>
          </svg>
        </button>
      </div>

      {phase === 'talk' ? (
        <div className="mt-6 flex flex-col items-center gap-3">
          {chosen && (
            <p key={`you-${beat}`} className="cr-fade font-book text-lg italic text-leather-soft">
              Ikaw: “{chosen.label}”
            </p>
          )}
          <SpeechBubble key={`${beat}-${picked}`} name={hero} className="cr-fade w-full max-w-xs">
            {chosen ? chosen.answer : current.say}
          </SpeechBubble>

          {waitingForChoice ? (
            <div className="cr-fade flex flex-wrap justify-center gap-3">
              {current.choices?.map((option, index) => (
                <button key={option.label} type="button" onClick={() => setPicked(index)} className={primaryButton}>
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <button type="button" onClick={advance} className={`${primaryButton} cr-fade !px-8`} autoFocus>
              {lastBeat ? 'Tuloy' : 'Susunod'} <ArrowRight aria-hidden size={16} />
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mt-4 flex justify-center gap-1.5" aria-hidden>
            {Array.from({ length: SNITCH_TARGET }, (_, i) => (
              <span
                key={i}
                className={`size-3 rounded-full border border-gold transition-colors ${i < caught ? 'bg-gold' : 'bg-transparent'}`}
              />
            ))}
          </div>
          <p className="mt-2 font-book text-lg text-leather-soft">
            Nahuli: {caught} / {SNITCH_TARGET}
          </p>
          <div className="mt-2 flex justify-center">
            <button type="button" onClick={finish} className={textButton}>
              Skip na lang ’to
            </button>
          </div>
        </>
      )}
    </section>
  )
}
