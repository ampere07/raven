import type { CSSProperties } from 'react'

const HUES = ['text-blush', 'text-rose/60', 'text-blush', 'text-sage/50', 'text-rose/45'] as const

// Spread by fixed arithmetic rather than random numbers, so every load starts from the same calm pattern.
const PETALS = Array.from({ length: 12 }, (_, i) => ({
  left: (i * 29 + 7) % 96,
  width: 13 + ((i * 7) % 11),
  fall: 17 + ((i * 5) % 11),
  sway: 16 + ((i * 3) % 4),
  drift: 22 + ((i * 13) % 34),
  delay: -((i * 2.9) % 24),
  hue: HUES[i % HUES.length],
}))

export function PetalRain() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {PETALS.map((petal, i) => (
        <span
          key={i}
          className={`petal ${i >= 7 ? 'max-sm:hidden' : ''}`}
          style={
            {
              '--left': `${petal.left}%`,
              '--fall': `${petal.fall}s`,
              '--sway': `${petal.sway * 0.3}s`,
              '--drift': `${petal.drift}px`,
              '--delay': `${petal.delay}s`,
            } as CSSProperties
          }
        >
          <svg viewBox="0 0 20 28" width={petal.width} className={petal.hue}>
            <path d="M10 0 C18 6 18 20 10 28 C2 20 2 6 10 0 Z" fill="currentColor" />
            <path d="M10 4 C11 12 11 18 10 25" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
          </svg>
        </span>
      ))}
    </div>
  )
}
