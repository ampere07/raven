import type { SVGProps } from 'react'

// Voldemort, drawn from scratch as a stylised figure: a pale, hairless head with slit nostrils and red slit-pupilled
// eyes above high-collared black robes, wand in hand. It is an original illustration, not artwork from any film or book.
export function DarkLord(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 240 270" aria-hidden {...props}>
      <defs>
        <radialGradient id="dl-skin" cx="50%" cy="34%" r="72%">
          <stop offset="0" stopColor="#e0dccd" />
          <stop offset="1" stopColor="#979484" />
        </radialGradient>
        <linearGradient id="dl-robe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d1722" />
          <stop offset="1" stopColor="#08050a" />
        </linearGradient>
      </defs>

      <path
        d="M14 270 C20 208 54 180 92 170 L148 170 C186 180 220 208 226 270 Z"
        fill="url(#dl-robe)"
        stroke="rgba(193,154,75,0.35)"
        strokeWidth="1.5"
      />
      <path d="M92 170 L104 140 L136 140 L148 170 L120 198 Z" fill="#0d0911" stroke="rgba(193,154,75,0.25)" />
      <path d="M106 138 C108 156 112 168 120 178 C128 168 132 156 134 138 Z" fill="#a4a193" />

      <path
        d="M120 14 C84 14 68 46 70 84 C72 112 86 138 104 152 C112 158 128 158 136 152 C154 138 168 112 170 84 C172 46 156 14 120 14 Z"
        fill="url(#dl-skin)"
        stroke="#6b685b"
        strokeWidth="1.5"
      />
      <path
        d="M78 96 C82 118 92 134 104 146 M162 96 C158 118 148 134 136 146 M86 77 Q102 69 114 79 M154 77 Q138 69 126 79"
        fill="none"
        stroke="rgba(58,54,46,0.45)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <g style={{ filter: 'drop-shadow(0 0 6px rgba(255,45,45,0.95))' }}>
        <path d="M90 88 Q101 78 114 88 Q101 98 90 88 Z" fill="#c8141d" />
        <path d="M126 88 Q139 78 150 88 Q139 98 126 88 Z" fill="#c8141d" />
      </g>
      <ellipse cx="102" cy="88" rx="1.8" ry="7" fill="#150508" />
      <ellipse cx="138" cy="88" rx="1.8" ry="7" fill="#150508" />
      <path d="M115 106 L117 117 M125 106 L123 117" stroke="#3a362e" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M105 133 Q120 139 135 133" fill="none" stroke="#4a3a38" strokeWidth="2.4" strokeLinecap="round" />

      <path d="M178 206 L226 128" stroke="#b98f58" strokeWidth="4.5" strokeLinecap="round" />
      <ellipse cx="177" cy="208" rx="11" ry="8" transform="rotate(-32 177 208)" fill="#b5b2a3" stroke="#6b685b" />
      <circle cx="227" cy="125" r="4" fill="#ffd27a" style={{ filter: 'drop-shadow(0 0 6px rgba(255,210,122,0.95))' }} />
    </svg>
  )
}
