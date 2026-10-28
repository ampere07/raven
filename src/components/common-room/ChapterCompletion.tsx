import { COMMON_ROOM_COPY } from '../../../shared/commonRoom'
import { hrefFor } from '../../utils/route'
import { Flourish } from './Flourish'
import { inkButton, primaryButton } from './ui'

type Props = {
  unansweredCount: number
  onReview: () => void
  onRevisit: () => void
}

// Shown once the last page has been turned. Nothing here says every question had to be answered.
export function ChapterCompletion({ unansweredCount, onReview, onRevisit }: Props) {
  return (
    <section aria-labelledby="complete-title" className="cr-parchment cr-unfurl px-6 py-10 text-center sm:px-12 sm:py-14">
      <Flourish className="mx-auto w-40 text-gold" />
      <h2 id="complete-title" className="mt-5 font-display text-3xl leading-tight text-burgundy sm:text-4xl">
        {COMMON_ROOM_COPY.completeTitle}
      </h2>
      <p className="mx-auto mt-4 max-w-md font-display text-xl italic leading-snug text-leather-soft">
        {COMMON_ROOM_COPY.completeSubtitle}
      </p>

      <div className="mx-auto mt-9 flex max-w-xs flex-col gap-3">
        <button type="button" onClick={onReview} className={primaryButton}>
          Review Answers
        </button>
        <button type="button" onClick={onRevisit} disabled={unansweredCount === 0} className={inkButton}>
          Revisit Unanswered Questions
        </button>
        <a href={hrefFor('chapters')} className={inkButton}>
          Return to the Chapter List
        </a>
      </div>

      {unansweredCount === 0 && (
        <p className="mt-5 font-book text-base italic text-leather-soft">There are no unanswered questions left.</p>
      )}
    </section>
  )
}
