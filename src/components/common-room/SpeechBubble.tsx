import type { CSSProperties, ReactNode } from 'react'

type Props = {
  name: string
  children: ReactNode
  /** Colour of the speaker's name. */
  accent?: string
  /** Draws a small pointer toward the speaker, below or above the box. Give the bubble a position (relative or
   * absolute) through className so the pointer can attach to it. */
  tail?: 'down' | 'up'
  className?: string
  style?: CSSProperties
}

// A chat box: a dark panel with the speaker's name above what they say.
export function SpeechBubble({ name, children, accent = 'text-gold-soft', tail, className = '', style }: Props) {
  return (
    <div
      style={style}
      className={`rounded-sm border border-gold/60 bg-[#150d0a]/95 px-4 py-3 text-left shadow-lg ${className}`}
    >
      <p className={`font-display text-sm uppercase tracking-[0.18em] ${accent}`}>{name}</p>
      <p className="mt-1 font-book text-xl leading-snug text-parchment">{children}</p>
      {tail && (
        <span
          aria-hidden
          className={`absolute left-1/2 size-3.5 -translate-x-1/2 rotate-45 bg-[#150d0a] ${
            tail === 'down' ? '-bottom-2 border-b border-r border-gold/60' : '-top-2 border-l border-t border-gold/60'
          }`}
        />
      )}
    </div>
  )
}
