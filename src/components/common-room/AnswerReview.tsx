import { COMMON_ROOM_COPY, type CommonRoomQuestion, type StoredAnswer } from '../../../shared/commonRoom'
import { hrefFor } from '../../utils/route'
import { Flourish } from './Flourish'
import { inkButton, primaryButton } from './ui'

type Props = {
  questions: readonly CommonRoomQuestion[]
  answers: Readonly<Record<string, StoredAnswer>>
  onEdit: (index: number) => void
  onBack: () => void
}

export function AnswerReview({ questions, answers, onEdit, onBack }: Props) {
  return (
    <section aria-labelledby="review-title" className="cr-parchment cr-unfurl px-5 py-8 sm:px-10 sm:py-12">
      <div className="text-center">
        <h2 id="review-title" className="font-display text-3xl text-burgundy sm:text-4xl">
          Review Answers
        </h2>
        <Flourish className="mx-auto mt-4 w-40 text-gold" />
        <p className="mx-auto mt-4 max-w-md font-book text-base italic leading-snug text-leather-soft">
          {COMMON_ROOM_COPY.privacy}
        </p>
      </div>

      <ol className="mt-8 divide-y divide-leather/20">
        {questions.map((question, index) => {
          const answer = answers[question.id]
          return (
            <li key={question.id} className="py-5">
              <p className="font-book text-base text-leather-soft">Question {index + 1}</p>
              <p className="font-display text-xl leading-snug">{question.text}</p>
              {answer ? (
                <p className="mt-2 whitespace-pre-wrap break-words font-book text-xl leading-snug text-forest">
                  {answer.answer}
                </p>
              ) : (
                <p className="mt-2 font-book text-lg italic text-leather-soft/80">Not answered yet.</p>
              )}
              <button
                type="button"
                onClick={() => onEdit(index)}
                aria-label={`${answer ? 'Edit' : 'Answer'} question ${index + 1}`}
                className={`${inkButton} mt-3 !py-1.5 !text-base`}
              >
                {answer ? 'Edit' : 'Answer'}
              </button>
            </li>
          )
        })}
      </ol>

      <div className="mt-6 flex flex-wrap justify-center gap-3 border-t border-leather/25 pt-6">
        <button type="button" onClick={onBack} className={primaryButton}>
          Back to the Questions
        </button>
        <a href={hrefFor('chapters')} className={inkButton}>
          Return to the Chapter List
        </a>
      </div>
    </section>
  )
}
