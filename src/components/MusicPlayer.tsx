import { useEffect, useRef } from 'react'
import chapterTwoTheme from '../chapter2.mp3'
import chapterThreeTheme from '../chapter3.mp3'
import chapterOneSong from '../song.mp3'
import type { Route } from '../utils/route'
import { useSceneTrack } from '../utils/sceneMusic'

const VOLUME = 0.35

// Each chapter has its own music. Moving between chapters swaps the track; the player itself stays mounted.
const TRACKS: Record<Route, string> = {
  chapters: chapterOneSong,
  'little-things': chapterOneSong,
  'common-room': chapterTwoTheme,
  'high-seas': chapterThreeTheme,
}

// Browsers refuse to play sound before the visitor has touched the page, so if playing on load is blocked
// the music starts on the first tap or key press instead.
export function MusicPlayer({ route }: { route: Route }) {
  const audio = useRef<HTMLAudioElement>(null)
  const src = useSceneTrack() ?? TRACKS[route]

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
  }, [src])

  return <audio ref={audio} src={src} loop autoPlay preload="auto" />
}
