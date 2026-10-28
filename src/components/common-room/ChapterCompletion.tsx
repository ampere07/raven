import { Loader2, RotateCw } from 'lucide-react'
import { COMMON_ROOM_COPY } from '../../../shared/commonRoom'
import { hrefFor } from '../../utils/route'
import { Flourish } from './Flourish'
import { inkButton } from './ui'

export type SaveState = { status: 'saving' } | { status: 'saved' } | { status: 'failed'; message: string }

type Props = {
  save: SaveState
  onRetry: () => void
}

// Shown after the last scene. Every answer is sent together while this is on screen, and "saved" is only ever
// shown once the server has confirmed all of them.
export function ChapterCompletion({ save, onRetry }: Props) {
  return (
    <section aria-labelledby="complete-title" className="cr-parchment cr-unfurl px-6 py-10 text-center sm:px-12 sm:py-14">
      <Flourish className="mx-auto w-40 text-gold" />
      <h2 id="complete-title" className="mt-5 font-display text-3xl leading-tight text-burgundy sm:text-4xl">
        {COMMON_ROOM_COPY.completeTitle}
      </h2>
      <p className="mx-auto mt-4 max-w-md font-display text-xl italic leading-snug text-leather-soft">
        {COMMON_ROOM_COPY.completeSubtitle}
      </p>

      <div aria-live="polite" className="mx-auto mt-7 min-h-7 max-w-sm font-book text-lg">
        {save.status === 'saving' && (
          <span className="inline-flex items-center gap-2 italic text-leather-soft">
            <Loader2 aria-hidden size={16} className="animate-spin" /> Sine-save yung mga sagot mo…
          </span>
        )}
        {save.status === 'saved' && <span className="text-forest">Na-save na lahat ng sagot mo.</span>}
      </div>

      {save.status === 'failed' && (
        <div role="alert" className="mx-auto mt-4 max-w-sm rounded-sm border border-burgundy/50 bg-burgundy/10 px-4 py-3 text-burgundy">
          <p className="font-book text-lg leading-snug">Hindi na-save yung mga sagot mo. {save.message}</p>
          <button type="button" onClick={onRetry} className={`${inkButton} mt-3 !py-1.5`}>
            <RotateCw aria-hidden size={15} /> Subukan ulit
          </button>
        </div>
      )}

      <div className="mx-auto mt-8 flex max-w-xs flex-col gap-3">
        <a href={hrefFor('chapters')} className={inkButton}>
          Balik sa listahan ng chapters
        </a>
      </div>
    </section>
  )
}
