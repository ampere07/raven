import { useEffect, useRef } from 'react'
import song from '../song.mp3'

const VOLUME = 0.35

// Browsers refuse to play sound before the visitor has touched the page, so if playing on load is blocked
// the song starts on the first tap or key press instead.
export function MusicPlayer() {
  const audio = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const element = audio.current
    if (!element) return
    element.volume = VOLUME

    const events = ['pointerdown', 'keydown'] as const
    const removeListeners = () => events.forEach((name) => window.removeEventListener(name, start))
    function start() {
      element?.play().then(removeListeners, () => undefined)
    }

    events.forEach((name) => window.addEventListener(name, start))
    start()
    return removeListeners
  }, [])

  return <audio ref={audio} src={song} loop autoPlay preload="auto" />
}
