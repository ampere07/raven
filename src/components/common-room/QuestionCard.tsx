import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { COMMON_ROOM_COPY, type CommonRoomQuestion, type StoredAnswer } from '../../../shared/commonRoom'
import { AnswerForm } from './AnswerForm'
import { FollowUpPrompt } from './FollowUpPrompt'
import { inkButton, primaryButton } from './ui'

type Props = {
  question: CommonRoomQuestion
  number: number
  total: number
  saved?: StoredAnswer
  draft: string
  skipped: boolean
  revisiting: boolean
  direction: 'forward' | 'back'
  canGoBack: boolean
  onDraftChange: (text: string) => void
  onSave: (text: string) => Promise<void>
  onDelete: () => Promise<void>
  onPrevious: () => void
  onSkip: () => void
  onNext: () => void
}

// One question on one page. It is remounted for every question so that each arrives as a turned page.
export function QuestionCard(props: Props) {
  const { question, number, total, saved, draft, skipped, revisiting, direction, canGoBack } = props
  const heading = useRef<HTMLHeadingElement>(null)

  // Move keyboard and screen reader focus to the new question without popping up a phone keyboard.
  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [])

  const settled = (saved !== undefined && draft.trim() === saved.answer) || skipped

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
          Question {number} of {total}.
          {revisiting && <span className="ml-2 text-forest">Revisiting the unanswered ones.</span>}
        </p>

        <h2
          id="question-text"
          ref={heading}
          tabIndex={-1}
          className="mt-4 mb-7 font-display text-3xl leading-tight text-leather outline-none sm:text-4xl"
        >
          {question.text}
        </h2>

        <AnswerForm
          saved={saved}
          draft={draft}
          onDraftChange={props.onDraftChange}
          onSave={props.onSave}
          onDelete={props.onDelete}
        />

        <FollowUpPrompt key={question.id} prompt={question.followUp} />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-leather/25 pt-5">
          <div>
            {canGoBack && (
              <button type="button" onClick={props.onPrevious} className={inkButton}>
                <ArrowLeft aria-hidden size={16} /> Previous Question
              </button>
            )}
          </div>
          {settled ? (
            <button type="button" onClick={props.onNext} className={primaryButton}>
              Next Question <ArrowRight aria-hidden size={16} />
            </button>
          ) : (
            <button type="button" onClick={props.onSkip} className={inkButton}>
              Skip for Now
            </button>
          )}
        </div>
      </article>
    </div>
  )
}
