import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { hrefFor } from '../../utils/route'
import { DustMotes } from './DustMotes'

type Props = { children: ReactNode; showChapters?: boolean }

// The room itself: dark wood, two flickering candles, drifting dust. Pages sit on top of it.
export function Stage({ children, showChapters = true }: Props) {
  return (
    <div className="cr-stage">
      <span aria-hidden className="cr-candle left" />
      <span aria-hidden className="cr-candle right" />
      <DustMotes />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-6 sm:px-6 sm:py-10">
        {showChapters && (
          <a
            href={hrefFor('chapters')}
            className="inline-flex w-fit items-center gap-2 py-2.5 font-book text-base text-gold-soft/80 transition-colors hover:text-gold-soft"
          >
            <ArrowLeft aria-hidden size={16} /> Chapters
          </a>
        )}
        <main className="flex flex-1 flex-col justify-center py-6">{children}</main>
      </div>
    </div>
  )
}
