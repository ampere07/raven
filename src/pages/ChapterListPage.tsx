import { ArrowRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import { COMMON_ROOM_COPY } from '../../shared/commonRoom'
import { Paw, Pup } from '../components/dog/Pup'
import { hrefFor } from '../utils/route'

const CHAPTERS = [
  {
    number: 'I',
    title: 'The Little Things',
    blurb: 'Yung mga unang tanong: food, kanta, chill days, at flowers.',
    href: hrefFor('little-things'),
  },
  {
    number: COMMON_ROOM_COPY.number,
    title: COMMON_ROOM_COPY.title,
    blurb: 'Hobbies, humor, at yung mga maliliit na bagay na gusto mo.',
    href: hrefFor('common-room'),
  },
] as const

// Paw prints trotting across the bottom: left to right, alternating up and down like real steps.
const STEPS = Array.from({ length: 9 }, (_, i) => ({
  x: `${6 + i * 10.5}%`,
  y: i % 2 ? '-10px' : '6px',
  turn: i % 2 ? '84deg' : '96deg',
  delay: `${i * 0.55}s`,
}))

export function ChapterListPage() {
  return (
    <div className="dog-stage">
      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-5 pb-28 pt-10 sm:px-8">
        <header className="text-center">
          <h1 className="sr-only">Chapters</h1>
          <Pup className="dog-bounce mx-auto w-56 sm:w-64" />
        </header>

        <ol className="mt-9 space-y-5">
          {CHAPTERS.map((chapter) => (
            <li key={chapter.number}>
              <a href={chapter.href} className="dog-tag py-5 pl-14 pr-5 sm:pl-16">
                <span className="dog-tag-hole" aria-hidden />
                <span className="flex items-center gap-4">
                  <span className="dog-number" aria-hidden>
                    {chapter.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium uppercase tracking-[0.18em] text-[#b27d3c]">
                      Chapter {chapter.number}
                    </span>
                    <span className="dog-heading block text-2xl leading-snug">{chapter.title}</span>
                    <span className="mt-0.5 block text-base leading-snug text-[#7a4a28]">{chapter.blurb}</span>
                  </span>
                  <ArrowRight aria-hidden size={22} className="flex-none text-[#d9722f]" />
                </span>
              </a>
            </li>
          ))}
        </ol>
      </main>

      {STEPS.map((step, i) => (
        <Paw
          key={i}
          className="dog-trail"
          style={{ '--x': step.x, '--y': step.y, '--turn': step.turn, '--delay': step.delay } as CSSProperties}
        />
      ))}
    </div>
  )
}
