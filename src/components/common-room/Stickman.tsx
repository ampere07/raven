type Pose = 'guard' | 'ask'

const LINE = {
  stroke: '#f4ead0',
  strokeWidth: 5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
} as const

// A stick figure standing at the bottom centre of the finale scene (an SVG group, drawn in scene coordinates).
// Its name hangs above its head. `guard` has a wand raised against an attack; `ask` turns to face the viewer with an
// open hand held out.
export function Stickman({ name, pose }: { name: string; pose: Pose }) {
  return (
    <g>
      <g style={{ filter: 'drop-shadow(0 0 5px rgba(255,233,168,0.55))' }}>
        <circle cx="180" cy="330" r="16" {...LINE} />
        <path d="M180 346 L180 410 M180 410 L160 452 M180 410 L204 450" {...LINE} />
        {pose === 'guard' ? (
          <>
            <path d="M180 360 L152 392" {...LINE} />
            <path d="M180 360 L216 324" {...LINE} />
            <path d="M216 324 L232 296" stroke="#c9a46a" strokeWidth="4" strokeLinecap="round" />
            <circle cx="233" cy="294" r="4" fill="#ffe9a8" />
          </>
        ) : (
          <>
            <path d="M180 360 L160 378 L174 392" {...LINE} />
            <path d="M180 360 L212 380 L228 372" {...LINE} />
            <circle cx="232" cy="370" r="4" {...LINE} strokeWidth={3} />
          </>
        )}
      </g>

      <rect x="140" y="276" width="80" height="28" rx="2" fill="rgba(20,12,8,0.88)" stroke="rgba(193,154,75,0.75)" />
      <text
        x="180"
        y="296"
        textAnchor="middle"
        fontSize="19"
        fill="#ffe9a8"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {name}
      </text>
    </g>
  )
}
