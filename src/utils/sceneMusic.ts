import { useSyncExternalStore } from 'react'

// A scene inside a chapter can take over the music for a while. While a track is set here it plays instead of the
// chapter's own; setting null hands the music back.
let track: string | null = null
const listeners = new Set<() => void>()

export function setSceneTrack(next: string | null) {
  if (track === next) return
  track = next
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const useSceneTrack = () => useSyncExternalStore(subscribe, () => track)
