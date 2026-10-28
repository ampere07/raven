import type { CommonRoomQuestion } from '../../../shared/commonRoom'

type Props = {
  questions: readonly CommonRoomQuestion[]
  answered: ReadonlySet<string>
  index: number
  onJump: (index: number) => void
}

// The page counter, an enchanted bookmark that lengthens as the book is read, and one jewel per question:
// gold once it has an answer, hollow while it does not.
export function QuestionProgress({ questions, answered, index, onJump }: Props) {
  const total = questions.length

  return (
    <nav aria-label="Pages of the chapter" className="mb-5">
      <p className="mb-2 flex justify-between font-book text-base tracking-wide text-gold-soft/90">
        <span>Page {index + 1} of {total}</span>
      </p>

      <div className="h-2.5 w-full rounded-sm bg-black/45 ring-1 ring-gold/25" aria-hidden>
        <div className="cr-ribbon h-full" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      <ol className="mt-3 flex flex-wrap justify-center gap-x-0.5">
        {questions.map((question, i) => {
          const done = answered.has(question.id)
          const current = i === index
          return (
            <li key={question.id}>
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-current={current ? 'step' : undefined}
                aria-label={`Question ${i + 1}, ${done ? 'answered' : 'not answered yet'}`}
                className="group flex size-7 items-center justify-center"
              >
                <span
                  aria-hidden
                  className={`block size-2.5 rotate-45 border transition-all ${
                    done ? 'border-gold bg-gold' : 'border-gold/60 bg-transparent'
                  } ${current ? 'scale-150 shadow-[0_0_10px_2px_rgba(224,195,130,0.7)]' : 'group-hover:scale-125'}`}
                />
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
