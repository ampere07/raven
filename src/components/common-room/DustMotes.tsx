import type { CSSProperties } from 'react'

// Fixed arithmetic rather than random numbers, so the room always starts from the same quiet pattern.
const MOTES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37 + 5) % 100,
  size: 2 + (i % 4),
  duration: 28 + ((i * 7) % 24),
  delay: -((i * 5.3) % 44),
  sway: (i % 2 ? 1 : -1) * (18 + ((i * 11) % 34)),
  glow: 0.35 + ((i * 13) % 5) / 10,
}))

export function DustMotes() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {MOTES.map((mote, i) => (
        <span
          key={i}
          className="cr-mote"
          style={
            {
              '--left': `${mote.left}%`,
              '--size': `${mote.size}px`,
              '--duration': `${mote.duration}s`,
              '--delay': `${mote.delay}s`,
              '--sway': `${mote.sway}px`,
              '--glow': mote.glow,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
