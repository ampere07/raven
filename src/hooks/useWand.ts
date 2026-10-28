import { useCallback, useEffect, useRef, useState } from 'react'

export type SensorState = 'idle' | 'asking' | 'checking' | 'motion' | 'none' | 'denied'

const COOLDOWN_MS = 450
// A wrist flick pushes a phone with roughly 10 to 25 m/s² of acceleration, or spins it faster than about 250°/s.
// Walking or carrying it stays well under both.
const ACCELERATION_THRESHOLD = 11
const SPIN_THRESHOLD = 260
const GRAVITY = 9.81
const CHECK_MS = 1600

type MotionPermission = { requestPermission?: () => Promise<'granted' | 'denied'> }

const known = (value: number | null | undefined): value is number => typeof value === 'number'

// Turns the phone into a wand. `flick` fires once for every sharp swing and, at most, once every 450 ms.
// It is also returned so that a swipe or a button press can cast the same spell where there is no motion sensor.
export function useWand(onFlick: () => void) {
  const [state, setState] = useState<SensorState>('idle')
  const [listening, setListening] = useState(false)
  const lastFlick = useRef(Number.NEGATIVE_INFINITY)
  const callback = useRef(onFlick)

  useEffect(() => {
    callback.current = onFlick
  })

  const flick = useCallback(() => {
    const now = performance.now()
    if (now - lastFlick.current < COOLDOWN_MS) return false
    lastFlick.current = now
    callback.current()
    return true
  }, [])

  // iPhones only share motion after a tap and a yes to a permission prompt, so this must be called from a click.
  const enable = useCallback(async () => {
    const request = (window.DeviceMotionEvent as unknown as MotionPermission | undefined)?.requestPermission
    if (request) {
      setState('asking')
      try {
        if ((await request.call(window.DeviceMotionEvent)) !== 'granted') {
          setState('denied')
          return
        }
      } catch {
        setState('denied')
        return
      }
    }
    setState('checking')
    setListening(true)
  }, [])

  useEffect(() => {
    if (!listening) return

    let receivedData = false
    const onMotion = (event: DeviceMotionEvent) => {
      const { acceleration, accelerationIncludingGravity: withGravity, rotationRate } = event

      let push = 0
      if (acceleration && known(acceleration.x)) {
        push = Math.hypot(acceleration.x, acceleration.y ?? 0, acceleration.z ?? 0)
      } else if (withGravity && known(withGravity.x)) {
        push = Math.abs(Math.hypot(withGravity.x, withGravity.y ?? 0, withGravity.z ?? 0) - GRAVITY)
      }
      const spin = rotationRate && known(rotationRate.alpha) ? Math.hypot(rotationRate.alpha, rotationRate.beta ?? 0, rotationRate.gamma ?? 0) : 0

      // Computers fire one empty reading; a real sensor reports numbers.
      if (!receivedData && (push > 0 || spin > 0 || known(acceleration?.x) || known(withGravity?.x))) {
        receivedData = true
        setState('motion')
      }
      if (push > ACCELERATION_THRESHOLD || spin > SPIN_THRESHOLD) flick()
    }

    window.addEventListener('devicemotion', onMotion)
    const timer = window.setTimeout(() => {
      if (!receivedData) setState('none')
    }, CHECK_MS)

    return () => {
      window.removeEventListener('devicemotion', onMotion)
      window.clearTimeout(timer)
    }
  }, [listening, flick])

  return { state, enable, flick }
}
