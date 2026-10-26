export function Sprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path className="draw" pathLength={1} d="M4 31 C 32 29, 62 23, 116 9" />
      <path className="draw delay-1" pathLength={1} d="M30 28 C 27 19, 34 14, 40 14 C 41 22, 37 27, 30 28" />
      <path className="draw delay-2" pathLength={1} d="M58 23 C 56 33, 63 36, 69 35 C 70 28, 65 24, 58 23" />
      <path className="draw delay-3" pathLength={1} d="M82 17 C 80 8, 87 4, 93 4 C 94 11, 90 16, 82 17" />
    </svg>
  )
}
