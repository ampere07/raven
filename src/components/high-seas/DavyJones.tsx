import type { SVGProps } from 'react'

// A sea captain with a beard of tentacles, drawn from scratch: a barnacled grey-green face under a battered tricorn,
// glowing eyes, and a long coat with brass buttons. It is an original illustration, not artwork from any film.
export function DavyJones(props: SVGProps<SVGSVGElement>) {
  const tentacles = [
    'M96 150 C80 176 90 200 74 216 C68 224 76 232 84 226',
    'M106 156 C98 184 112 204 102 228 C99 238 110 240 112 232',
    'M118 158 C116 190 126 206 120 236 C118 246 130 246 130 236',
    'M130 158 C134 190 124 208 136 236 C138 246 148 244 146 234',
    'M142 156 C152 184 140 204 152 226 C156 236 166 232 162 224',
    'M154 150 C168 176 156 198 172 214 C178 222 170 232 162 226',
  ]

  return (
    <svg viewBox="0 0 240 270" aria-hidden {...props}>
      <defs>
        <radialGradient id="dj-skin" cx="50%" cy="38%" r="70%">
          <stop offset="0" stopColor="#9fb59a" />
          <stop offset="1" stopColor="#4f6a58" />
        </radialGradient>
        <linearGradient id="dj-coat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14324a" />
          <stop offset="1" stopColor="#081521" />
        </linearGradient>
        <radialGradient id="dj-eye" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f6ffb0" />
          <stop offset="1" stopColor="#8fd13a" />
        </radialGradient>
      </defs>

      {/* Coat and shoulders. */}
      <path
        d="M8 270 C14 214 46 186 84 176 L156 176 C194 186 226 214 232 270 Z"
        fill="url(#dj-coat)"
        stroke="rgba(224,195,130,0.5)"
        strokeWidth="2"
      />
      <path d="M84 176 L120 232 L156 176" fill="none" stroke="rgba(224,195,130,0.55)" strokeWidth="3" />
      {[206, 226, 246].map((y) => (
        <circle key={y} cx="120" cy={y} r="4" fill="#d9b25c" stroke="#9a7a2c" />
      ))}
      <path d="M22 214 C32 200 48 192 62 190 M218 214 C208 200 192 192 178 190" fill="none" stroke="#d9b25c" strokeWidth="5" strokeLinecap="round" />

      {/* Head and tentacle beard. */}
      <path
        d="M120 52 C86 52 72 84 76 114 C80 140 96 160 120 162 C144 160 160 140 164 114 C168 84 154 52 120 52 Z"
        fill="url(#dj-skin)"
        stroke="#2c4034"
        strokeWidth="2"
      />
      {tentacles.map((d) => (
        <path key={d} d={d} fill="none" stroke="#3d5a4a" strokeWidth="11" strokeLinecap="round" />
      ))}
      {tentacles.map((d) => (
        <path key={`light-${d}`} d={d} fill="none" stroke="#7d9b83" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 9" />
      ))}

      {/* Barnacles, brow and nose. */}
      <g fill="#c9d6c0" opacity="0.75">
        <circle cx="92" cy="96" r="3" />
        <circle cx="150" cy="92" r="2.4" />
        <circle cx="86" cy="118" r="2.2" />
        <circle cx="156" cy="120" r="3" />
      </g>
      <path d="M92 100 Q104 92 114 100 M126 100 Q136 92 148 100" fill="none" stroke="#243428" strokeWidth="4" strokeLinecap="round" />
      <circle cx="104" cy="108" r="7" fill="url(#dj-eye)" style={{ filter: 'drop-shadow(0 0 6px rgba(150,230,60,0.9))' }} />
      <circle cx="136" cy="108" r="7" fill="url(#dj-eye)" style={{ filter: 'drop-shadow(0 0 6px rgba(150,230,60,0.9))' }} />
      <circle cx="104" cy="108" r="2.2" fill="#1c2a10" />
      <circle cx="136" cy="108" r="2.2" fill="#1c2a10" />
      <path d="M120 112 C116 124 114 130 120 134 C126 130 124 124 120 112 Z" fill="#587462" />

      {/* The tricorn hat. */}
      <path d="M52 66 C74 46 100 36 120 36 C140 36 166 46 188 66 C164 58 142 54 120 54 C98 54 76 58 52 66 Z" fill="#0c0f14" stroke="#d9b25c" strokeWidth="2.5" />
      <path d="M82 58 C84 30 100 14 120 14 C140 14 156 30 158 58 C146 52 134 50 120 50 C106 50 94 52 82 58 Z" fill="#161b24" stroke="#d9b25c" strokeWidth="2" />
      <circle cx="120" cy="40" r="6" fill="#d9b25c" stroke="#9a7a2c" />
    </svg>
  )
}
