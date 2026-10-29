type Pose = 'guard' | 'ask'

const SHIRT = '#8a2a3a'
const SKIN = '#f2cfa6'

// The figure standing at the bottom centre of the finale scene (an SVG group, drawn in scene coordinates). It has a
// solid body: a shirt with a belt, trousers, shoes, a neck and a head with hair. Its name hangs above its head.
// `guard` has a wand raised against an attack and a hand held up in front; `ask` turns to face the viewer, smiling,
// with an open hand held out.
export function Stickman({ name, pose, hat = false }: { name: string; pose: Pose; hat?: boolean }) {
  const guard = pose === 'guard'

  return (
    <g>
      <g style={{ filter: 'drop-shadow(0 0 5px rgba(255,233,168,0.45))' }} strokeLinecap="round" strokeLinejoin="round">
        {/* Legs and shoes. */}
        <g fill="none">
          <path d="M170 412 L160 450 M190 412 L200 450" stroke="#aab4d0" strokeWidth="17" />
          <path d="M170 412 L160 450 M190 412 L200 450" stroke="#46506b" strokeWidth="14" />
        </g>
        <ellipse cx="155" cy="455" rx="13" ry="6" fill="#2a1a10" stroke="#c9a46a" strokeWidth="1.5" />
        <ellipse cx="205" cy="455" rx="13" ry="6" fill="#2a1a10" stroke="#c9a46a" strokeWidth="1.5" />

        {/* The arm on the left, behind the torso. */}
        {guard ? (
          <>
            <path d="M162 368 L140 380 L138 352" fill="none" stroke={SHIRT} strokeWidth="12" />
            <circle cx="138" cy="347" r="7" fill={SKIN} />
          </>
        ) : (
          <>
            <path d="M162 368 L150 396 L154 420" fill="none" stroke={SHIRT} strokeWidth="12" />
            <circle cx="154" cy="423" r="6" fill={SKIN} />
          </>
        )}

        {/* Torso and belt. */}
        <path
          d="M156 368 Q156 354 172 354 H188 Q204 354 204 368 L198 414 Q180 422 162 414 Z"
          fill={SHIRT}
          stroke="#e7c27a"
          strokeWidth="1.8"
        />
        <rect x="160" y="408" width="40" height="7" rx="3" fill="#2a1a10" />

        {/* The arm on the right, in front of the torso. */}
        {guard ? (
          <>
            <path d="M200 368 L226 354 L232 326" fill="none" stroke={SHIRT} strokeWidth="12" />
            <circle cx="233" cy="322" r="7" fill={SKIN} />
            <path d="M233 322 L246 292" stroke="#c9a46a" strokeWidth="4.5" />
            <circle cx="247" cy="289" r="4.5" fill="#ffe9a8" />
          </>
        ) : (
          <>
            <path d="M200 368 L226 384 L248 374" fill="none" stroke={SHIRT} strokeWidth="12" />
            <circle cx="253" cy="372" r="7" fill={SKIN} />
          </>
        )}

        {/* Neck, head, hair and face. */}
        <rect x="175" y="344" width="10" height="14" rx="4" fill={SKIN} />
        <circle cx="180" cy="330" r="17" fill={SKIN} />
        <path d="M162.5 328 A17.5 17.5 0 0 1 197.5 328 Q192 316 180 317 Q168 316 162.5 328 Z" fill="#4a2f22" />
        <g fill="#2a1a10">
          <circle cx="174" cy="330" r="2.4" />
          <circle cx="186" cy="330" r="2.4" />
        </g>
        {guard ? (
          <>
            <path d="M170 324 L177 326 M190 324 L183 326" fill="none" stroke="#2a1a10" strokeWidth="2" />
            <path d="M175 339 H185" fill="none" stroke="#2a1a10" strokeWidth="2" />
          </>
        ) : (
          <path d="M174 338 Q180 343 186 338" fill="none" stroke="#2a1a10" strokeWidth="2" />
        )}
        {hat && (
          <g>
            <path d="M158 322 C166 306 194 306 202 322 C192 318 168 318 158 322 Z" fill="#1a1d26" stroke="#d9b25c" strokeWidth="1.6" />
            <path d="M166 318 C168 302 192 302 194 318 Z" fill="#232733" stroke="#d9b25c" strokeWidth="1.4" />
            <circle cx="180" cy="308" r="2.6" fill="#d9b25c" />
          </g>
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
