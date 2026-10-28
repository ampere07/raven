// A small ornamental rule: two fine lines meeting at a diamond.
export function Flourish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 12" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M2 6 H64 M96 6 H158" />
      <path d="M64 6 C70 1 74 1 80 6 C86 11 90 11 96 6" />
      <path d="M80 2 L84 6 L80 10 L76 6 Z" fill="currentColor" />
    </svg>
  )
}
