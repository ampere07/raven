import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { ANSWER_LIMIT, COMMON_ROOM_COPY, type CommonRoomQuestion } from '../../../shared/commonRoom'
import { FollowUpPrompt } from './FollowUpPrompt'
import { inkButton, primaryButton } from './ui'

type Props = {
  question: CommonRoomQuestion
  number: number
  total: number
  draft: string
  direction: 'forward' | 'back'
  canGoBack: boolean
  onDraftChange: (text: string) => void
  onPrevious: () => void
  onNext: () => void
}

// One question on one page. It is remounted for every question so that each arrives as a turned page.
// Nothing is saved here: the answers are kept in the open page and sent together at the very end.
export function QuestionCard(props: Props) {
  const { question, number, total, draft, direction, canGoBack } = props
  const heading = useRef<HTMLHeadingElement>(null)
  const fieldId = useId()

  // Move keyboard and screen reader focus to the new question without popping up a phone keyboard.
  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className="cr-turn">
      <article
        aria-labelledby="question-text"
        className={`cr-parchment cr-book px-5 py-7 sm:px-10 sm:py-10 ${
          direction === 'forward' ? 'cr-page-next' : 'cr-page-back'
        }`}
      >
        <p className="font-display text-base tracking-wide text-burgundy/90">
          Chapter {COMMON_ROOM_COPY.number}: {COMMON_ROOM_COPY.title}
        </p>
        <p className="mt-1 font-book text-lg italic text-leather-soft">
          Tanong {number} sa {total}.
        </p>

        <h2
          id="question-text"
          ref={heading}
          tabIndex={-1}
          className="mt-4 mb-7 font-display text-3xl leading-tight text-leather outline-none sm:text-4xl"
        >
          {question.text}
        </h2>

        <label htmlFor={fieldId} className="font-book text-base uppercase tracking-[0.18em] text-leather-soft">
          Sagot mo
        </label>
        <textarea
          id={fieldId}
          rows={4}
          maxLength={ANSWER_LIMIT}
          value={draft}
          onChange={(event) => props.onDraftChange(event.target.value)}
          placeholder="Sulat ka lang kahit konti, o i-skip mo na lang…"
          className="mt-2 w-full resize-none rounded-sm border border-leather-soft/40 bg-parchment/50 px-3 py-2.5 font-book text-xl leading-snug text-leather transition-colors placeholder:italic placeholder:text-leather-soft/60 focus:border-burgundy focus:bg-parchment/70"
        />
        <p aria-hidden className="mt-1 text-right font-book text-sm text-leather-soft/70">
          {draft.length} / {ANSWER_LIMIT}
        </p>

        <FollowUpPrompt key={question.id} prompt={question.followUp} />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-leather/25 pt-5">
          <div>
            {canGoBack && (
              <button type="button" onClick={props.onPrevious} className={inkButton}>
                <ArrowLeft aria-hidden size={16} /> Balik
              </button>
            )}
          </div>
          <button type="button" onClick={props.onNext} className={primaryButton}>
            Susunod <ArrowRight aria-hidden size={16} />
          </button>
        </div>
      </article>
    </div>
  )
}
