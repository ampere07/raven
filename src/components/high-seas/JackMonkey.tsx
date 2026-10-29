import { useEffect, useRef } from 'react'

const WIDTH = 84
const HEIGHT = 84

// Where Jack is, as the middle of his box: how far it is turned (degrees) and whether he faces left (-1) or right (1).
type Pose = { x: number; y: number; rot: number; flip: 1 | -1 }
type Leg = { mode: 'run' | 'climb' | 'hang'; from: Pose; to: Pose; speed: number }

// The edges of the screen and the two wooden rods of the scroll, as they are right now.
function surroundings() {
  const W = document.documentElement.clientWidth
  const H = window.innerHeight
  const top = document.querySelector('.sea-roll.top')?.getBoundingClientRect()
  const bottom = document.querySelector('.sea-roll.bottom')?.getBoundingClientRect()
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)
  return {
    W,
    floor: H - HEIGHT / 2 - 4,
    // Hanging from the top rod, his feet on its underside.
    hangY: clamp(top ? top.bottom + HEIGHT / 2 - 6 : 90, HEIGHT / 2 + 4, H - 120),
    hangFrom: clamp(top ? top.right - 36 : W - 40, 44, W - 44),
    hangTo: clamp(top ? top.left + 36 : 44, 44, W - 44),
    // Standing on the bottom rod.
    perchY: clamp(bottom ? bottom.top - HEIGHT / 2 + 6 : H - 130, 140, H - HEIGHT / 2 - 4),
  }
}

const wallRight = (W: number) => W - HEIGHT / 2 - 2
const wallLeft = HEIGHT / 2 + 2

// One lap of the screen: along the floor, up the right wall, hanging from the top rod all the way across, down the left
// wall to the bottom rod, along it, down the right wall, and back along the floor.
const LAP: readonly (() => Leg)[] = [
  () => {
    const s = surroundings()
    return {
      mode: 'run',
      from: { x: -WIDTH, y: s.floor, rot: 0, flip: 1 },
      to: { x: s.W + WIDTH, y: s.floor, rot: 0, flip: 1 },
      speed: 150,
    }
  },
  () => {
    const s = surroundings()
    return {
      mode: 'climb',
      from: { x: wallRight(s.W), y: s.floor, rot: -90, flip: 1 },
      to: { x: wallRight(s.W), y: s.hangY, rot: -90, flip: 1 },
      speed: 120,
    }
  },
  () => {
    const s = surroundings()
    return {
      mode: 'hang',
      from: { x: s.hangFrom, y: s.hangY, rot: 0, flip: 1 },
      to: { x: s.hangTo, y: s.hangY, rot: 0, flip: 1 },
      speed: 70,
    }
  },
  () => {
    const s = surroundings()
    return {
      mode: 'climb',
      from: { x: wallLeft, y: s.hangY, rot: 90, flip: 1 },
      to: { x: wallLeft, y: s.perchY, rot: 90, flip: 1 },
      speed: 120,
    }
  },
  () => {
    const s = surroundings()
    return { mode: 'run', from: { x: 44, y: s.perchY, rot: 0, flip: 1 }, to: { x: s.W - 44, y: s.perchY, rot: 0, flip: 1 }, speed: 110 }
  },
  () => {
    const s = surroundings()
    return {
      mode: 'climb',
      from: { x: wallRight(s.W), y: s.perchY, rot: -90, flip: -1 },
      to: { x: wallRight(s.W), y: s.floor, rot: -90, flip: -1 },
      speed: 130,
    }
  },
  () => {
    const s = surroundings()
    return {
      mode: 'run',
      from: { x: s.W + WIDTH, y: s.floor, rot: 0, flip: -1 },
      to: { x: -WIDTH, y: s.floor, rot: 0, flip: -1 },
      speed: 150,
    }
  },
]

const place = (p: Pose) => `translate(${p.x - WIDTH / 2}px, ${p.y - HEIGHT / 2}px) rotate(${p.rot}deg) scaleX(${p.flip})`

// Turn to whichever of the equivalent angles is nearest, so he never spins the long way round.
const nearest = (rot: number, reference: number) => {
  let r = rot
  while (r - reference > 180) r -= 360
  while (r - reference < -180) r += 360
  return r
}

// A little capuchin in a red vest, running round the edges of every Chapter III page: across the floor, up the wall,
// hanging from the top rod of the scroll, down the other wall and along its bottom rod. Original art: a cartoon, not a
// still from the film. He never takes taps, so he cannot get in the way of a button. Positions are worked out again at
// the start of every stretch, so he follows the scroll as it unrolls or changes size.
export function JackMonkey() {
  const body = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = body.current
    if (!element || !element.animate) return
    let alive = true
    let previous: Animation | null = null
    let at: Pose | null = null

    const roam = async () => {
      for (let lap = 0; alive; lap = (lap + 1) % LAP.length) {
        const leg = LAP[lap]()
        const from = at ? { ...leg.from, rot: nearest(leg.from.rot, at.rot) } : leg.from
        const to = { ...leg.to, rot: nearest(leg.to.rot, from.rot) }
        const duration = (Math.hypot(to.x - from.x, to.y - from.y) / leg.speed) * 1000
        const turn = Math.min(0.3, 400 / duration)

        element.dataset.mode = leg.mode
        const frames: Keyframe[] = at
          ? [
              { transform: place(at), offset: 0 },
              { transform: place(from), offset: turn },
              { transform: place(to), offset: 1 },
            ]
          : [
              { transform: place(from), offset: 0 },
              { transform: place(to), offset: 1 },
            ]
        const running = element.animate(frames, { duration, easing: 'linear', fill: 'forwards' })
        previous?.cancel()
        previous = running
        at = to
        try {
          await running.finished
        } catch {
          return
        }
      }
    }
    void roam()

    return () => {
      alive = false
      previous?.cancel()
    }
  }, [])

  return (
    <>
      <div aria-hidden className="sea-jack" ref={body}>
        <div className="sea-jack-hop">
          {/* Side view, facing right: running along a floor, or climbing with his belly to the wall. */}
          <svg viewBox="0 0 120 80" width="84" height="56" className="mk mk-run">
            <path
              className="mk-tail"
              d="M24 44C4 46 2 22 16 14C22 11 28 16 24 22"
              fill="none"
              stroke="#2e2019"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              className="mk-leg back far"
              d="M44 52L40 64L34 76"
              fill="none"
              stroke="#2a1d16"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="mk-leg front far"
              d="M80 52L84 64L90 76"
              fill="none"
              stroke="#2a1d16"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <ellipse cx="60" cy="44" rx="30" ry="16" fill="#3b2b22" />
            <path d="M44 32C52 28 72 28 78 34L76 56C66 62 54 62 46 56Z" fill="#8a2a3a" stroke="#e7c27a" strokeWidth="1.5" />
            <circle cx="60" cy="52" r="1.6" fill="#e7c27a" />
            <circle cx="68" cy="52" r="1.6" fill="#e7c27a" />
            <path
              className="mk-leg back"
              d="M42 54L38 66L30 77"
              fill="none"
              stroke="#4a362b"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="mk-leg front"
              d="M78 54L82 66L89 77"
              fill="none"
              stroke="#4a362b"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <ellipse cx="84" cy="38" rx="9" ry="8" fill="#3b2b22" />
            <circle cx="92" cy="22" r="5" fill="#3b2b22" />
            <circle cx="92" cy="22" r="2.5" fill="#d9b9a0" />
            <circle cx="96" cy="32" r="15" fill="#3b2b22" />
            <ellipse cx="103" cy="36" rx="10" ry="11" fill="#ecd9c4" />
            <circle cx="105" cy="31" r="2.6" fill="#1d130e" />
            <circle cx="106" cy="30" r="0.9" fill="#fff" />
            <ellipse cx="112" cy="38" rx="2.6" ry="2" fill="#8a6a58" />
            <path d="M104 43Q108 45 111 42" fill="none" stroke="#6a4a3a" strokeWidth="1.4" strokeLinecap="round" />
          </svg>

          {/* Hanging by both hands from the scroll's rod, legs dangling. */}
          <svg viewBox="0 0 80 100" width="66" height="84" className="mk mk-hang">
            <path d="M28 42C20 30 22 16 28 6M52 42C60 30 58 16 52 6" fill="none" stroke="#3b2b22" strokeWidth="7" strokeLinecap="round" />
            <circle cx="28" cy="5" r="4.5" fill="#2e2019" />
            <circle cx="52" cy="5" r="4.5" fill="#2e2019" />
            <path className="mk-curl" d="M40 70C30 84 46 94 54 88" fill="none" stroke="#2e2019" strokeWidth="5" strokeLinecap="round" />
            <path
              className="mk-dangle a"
              d="M34 66L30 82L28 94"
              fill="none"
              stroke="#3b2b22"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="mk-dangle b"
              d="M46 66L50 82L52 94"
              fill="none"
              stroke="#3b2b22"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <ellipse cx="40" cy="52" rx="15" ry="20" fill="#3b2b22" />
            <path d="M27 44C32 38 48 38 53 44L51 68C45 72 35 72 29 68Z" fill="#8a2a3a" stroke="#e7c27a" strokeWidth="1.5" />
            <path d="M40 42V70" stroke="#e7c27a" strokeWidth="1.1" />
            <circle cx="36" cy="52" r="1.5" fill="#e7c27a" />
            <circle cx="44" cy="52" r="1.5" fill="#e7c27a" />
            <circle cx="36" cy="60" r="1.5" fill="#e7c27a" />
            <circle cx="44" cy="60" r="1.5" fill="#e7c27a" />
            <circle cx="27" cy="26" r="5" fill="#3b2b22" />
            <circle cx="53" cy="26" r="5" fill="#3b2b22" />
            <circle cx="27" cy="26" r="2.4" fill="#d9b9a0" />
            <circle cx="53" cy="26" r="2.4" fill="#d9b9a0" />
            <circle cx="40" cy="28" r="14" fill="#3b2b22" />
            <path d="M40 17C33 17 29 22 30 29C31 36 36 40 40 40C44 40 49 36 50 29C51 22 47 17 40 17Z" fill="#ecd9c4" />
            <ellipse cx="35.5" cy="28" rx="2.4" ry="2.8" fill="#1d130e" />
            <ellipse cx="44.5" cy="28" rx="2.4" ry="2.8" fill="#1d130e" />
            <circle cx="36.3" cy="27" r="0.8" fill="#fff" />
            <circle cx="45.3" cy="27" r="0.8" fill="#fff" />
            <ellipse cx="40" cy="34" rx="2" ry="1.4" fill="#8a6a58" />
            <path d="M37 37Q40 39 43 37" fill="none" stroke="#6a4a3a" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </>
  )
}
