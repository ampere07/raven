import type { CSSProperties } from 'react'

// A chubby cartoon puppy: big head, huge shiny eyes, pink cheeks, floppy ears, a red collar with a tag, and a tail that wags.
export function Pup({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 230" aria-hidden className={className}>
      <ellipse cx="130" cy="224" rx="74" ry="6" fill="#8f5a2c" opacity="0.15" />

      <g className="dog-tail">
        <path d="M200 176 C236 168 248 132 228 108" fill="none" stroke="#e0a05a" strokeWidth="18" strokeLinecap="round" />
        <circle cx="228" cy="108" r="9" fill="#fff1d6" />
      </g>

      <ellipse cx="130" cy="188" rx="56" ry="36" fill="#f0b36b" />
      <ellipse cx="130" cy="196" rx="32" ry="24" fill="#fff1d6" />
      <ellipse cx="102" cy="217" rx="21" ry="11" fill="#fff1d6" />
      <ellipse cx="158" cy="217" rx="21" ry="11" fill="#fff1d6" />
      <path d="M95 213 V220 M103 211 V220 M151 213 V220 M159 211 V220" stroke="#e0a05a" strokeWidth="2" strokeLinecap="round" />

      <g className="dog-ear-left">
        <path d="M72 46 C34 38 16 92 34 130 C56 134 78 106 84 70 Z" fill="#a8652f" />
        <path d="M66 62 C48 62 38 94 46 112 C58 108 68 92 72 72 Z" fill="#c98250" />
      </g>
      <g className="dog-ear-right">
        <path d="M188 46 C226 38 244 92 226 130 C204 134 182 106 176 70 Z" fill="#a8652f" />
        <path d="M194 62 C212 62 222 94 214 112 C202 108 192 92 188 72 Z" fill="#c98250" />
      </g>

      <ellipse cx="130" cy="108" rx="82" ry="66" fill="#f5c07f" />
      <path d="M130 48 C114 58 114 82 130 90 C146 82 146 58 130 48 Z" fill="#fff1d6" />
      <ellipse cx="130" cy="136" rx="38" ry="27" fill="#fff1d6" />

      <ellipse cx="76" cy="132" rx="15" ry="9" fill="#ff9aa8" opacity="0.55" />
      <ellipse cx="184" cy="132" rx="15" ry="9" fill="#ff9aa8" opacity="0.55" />

      <g className="dog-eyes">
        <ellipse cx="96" cy="110" rx="13" ry="15" fill="#2a1a10" />
        <ellipse cx="164" cy="110" rx="13" ry="15" fill="#2a1a10" />
        <circle cx="101" cy="104" r="5.5" fill="#fff" />
        <circle cx="169" cy="104" r="5.5" fill="#fff" />
        <circle cx="92" cy="116" r="2.6" fill="#fff" opacity="0.9" />
        <circle cx="160" cy="116" r="2.6" fill="#fff" opacity="0.9" />
      </g>
      <path d="M82 86 Q96 79 110 85 M150 85 Q164 79 178 86" fill="none" stroke="#a8652f" strokeWidth="4" strokeLinecap="round" />

      <path d="M119 123 Q130 118 141 123 Q141 134 130 136 Q119 134 119 123 Z" fill="#2a1a10" />
      <ellipse cx="127" cy="125" rx="4.5" ry="2.2" fill="#fff" opacity="0.55" />
      <path d="M130 136 V142 M130 142 C124 152 112 150 110 143 M130 142 C136 152 148 150 150 143" fill="none" stroke="#2a1a10" strokeWidth="3.5" strokeLinecap="round" />
      <path className="dog-tongue" d="M123 146 C123 162 137 162 137 146 Z" fill="#ff7b92" />
      <path d="M130 148 V156" stroke="#e0566f" strokeWidth="2" strokeLinecap="round" />

      <path d="M86 162 C110 180 150 180 174 162" fill="none" stroke="#d93f3f" strokeWidth="11" strokeLinecap="round" />
      <circle cx="130" cy="177" r="10" fill="#ffd45c" stroke="#e0a91e" strokeWidth="2.5" />
      <path d="M126 177 L129 180 L135 173" fill="none" stroke="#e0a91e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Paw({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className} style={style} fill="currentColor">
      <ellipse cx="16" cy="21" rx="8" ry="6.5" />
      <ellipse cx="6.5" cy="13" rx="3" ry="4" transform="rotate(-18 6.5 13)" />
      <ellipse cx="12.5" cy="7" rx="3" ry="4.2" />
      <ellipse cx="19.5" cy="7" rx="3" ry="4.2" />
      <ellipse cx="25.5" cy="13" rx="3" ry="4" transform="rotate(18 25.5 13)" />
    </svg>
  )
}
