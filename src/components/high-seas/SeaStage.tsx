import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { hrefFor } from '../../utils/route'
import { JackMonkey } from './JackMonkey'

// The sea itself: a starry night, rolling waves, and pages that look like a weathered map on top.
export function SeaStage({ children }: { children: ReactNode }) {
  return (
    <div className="sea-stage">
      <span aria-hidden className="sea-wave back" />
      <span aria-hidden className="sea-wave" />
      <JackMonkey />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-6 sm:px-6 sm:py-10">
        <a
          href={hrefFor('chapters')}
          className="inline-flex w-fit items-center gap-2 py-2.5 font-book text-base text-gold-soft/80 transition-colors hover:text-gold-soft"
        >
          <ArrowLeft aria-hidden size={16} /> Chapters
        </a>
        <main className="flex flex-1 flex-col justify-center py-6">{children}</main>
      </div>
    </div>
  )
}
