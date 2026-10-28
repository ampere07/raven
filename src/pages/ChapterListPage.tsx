import { COMMON_ROOM_COPY } from '../../shared/commonRoom'
import { Flourish } from '../components/common-room/Flourish'
import { Stage } from '../components/common-room/Stage'
import { hrefFor } from '../utils/route'

const CHAPTERS = [
  {
    number: 'I',
    title: 'The Little Things',
    blurb: 'The first small questions: food, songs, quiet days and flowers.',
    href: hrefFor('home'),
  },
  {
    number: COMMON_ROOM_COPY.number,
    title: COMMON_ROOM_COPY.title,
    blurb: 'Hobbies, humor and the little worlds people carry around with them.',
    href: hrefFor('common-room'),
  },
] as const

export function ChapterListPage() {
  return (
    <Stage showChapters={false}>
      <section aria-labelledby="chapters-title" className="cr-parchment cr-unfurl px-6 py-10 sm:px-12 sm:py-14">
        <div className="text-center">
          <h1 id="chapters-title" className="font-display text-4xl text-burgundy sm:text-5xl">
            The Chapters
          </h1>
          <Flourish className="mx-auto mt-5 w-40 text-gold" />
        </div>

        <ol className="mt-8 divide-y divide-leather/20">
          {CHAPTERS.map((chapter) => (
            <li key={chapter.number}>
              <a
                href={chapter.href}
                className="group block py-5 transition-colors hover:text-burgundy"
              >
                <span className="font-book text-base tracking-[0.18em] text-leather-soft">CHAPTER {chapter.number}</span>
                <span className="mt-1 block font-display text-2xl leading-snug sm:text-3xl">{chapter.title}</span>
                <span className="mt-1 block font-book text-lg italic text-leather-soft">{chapter.blurb}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>
    </Stage>
  )
}
