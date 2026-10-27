import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { FLOWER_QUESTION_ID, LIMITS } from '../shared/questionnaire'
import { QuestionField } from './components/QuestionField'
import { Sprig } from './components/Sprig'
import { TITLE_SECONDS, WrittenTitle } from './components/WrittenTitle'
import { ThankYou } from './components/ThankYou'
import { useQuestionnaire } from './hooks/useQuestionnaire'
import { STEPS, TOTAL_QUESTIONS } from './utils/steps'

type Direction = 'forward' | 'back'

const primaryButton =
  'inline-flex items-center gap-2 rounded-full bg-rose px-7 py-3 text-white transition-colors hover:bg-rose-deep disabled:opacity-70'

export default function App() {
  const { values, status, error, sent, setName, setAnswer, submit } = useQuestionnaire()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<Direction>('forward')

  const step = STEPS[index]
  const last = STEPS.length - 1

  const go = (next: number) => {
    setDirection(next > index ? 'forward' : 'back')
    setIndex(Math.min(Math.max(next, 0), last))
  }
  const next = () => go(index + 1)

  if (status === 'sent') {
    return (
      <Shell>
        <ThankYou flowers={sent?.answers.find((answer) => answer.questionId === FLOWER_QUESTION_ID)?.answer} />
      </Shell>
    )
  }

  return (
    <Shell progress={index / last}>
      {step.kind === 'question' && (
        <p className="rise text-xs uppercase tracking-[0.2em] text-sage">
          {`${step.group} · ${step.number} of ${TOTAL_QUESTIONS}`}
        </p>
      )}

      <div key={index} className={`${direction === 'forward' ? 'step-forward' : 'step-back'} ${step.kind === 'welcome' ? '' : 'mt-6'}`}>
        {step.kind === 'welcome' && (
          <div>
            <Sprig className="w-28 text-sage" />
            <WrittenTitle className="mt-8 max-w-[34rem] text-ink" />
            <p
              className="rise mt-5 font-serif text-xl italic leading-relaxed text-ink-soft"
              style={{ animationDelay: `${TITLE_SECONDS - 0.6}s` }}
            >
              A little space para mas makilala pa kita, one conversation at a time.
            </p>
            <p
              className="rise mt-8 max-w-md leading-relaxed text-ink-soft"
              style={{ animationDelay: `${TITLE_SECONDS - 0.1}s` }}
            >
              No pressure naman, sagot ka lang kung ano yung comfy ka i-share. Gusto lang kitang makilala pa, little by little.
            </p>
            <div className="rise mt-10" style={{ animationDelay: `${TITLE_SECONDS + 0.4}s` }}>
              <label htmlFor="name" className="text-sm text-ink-soft">
                What should I call you?
              </label>
              <input
                id="name"
                type="text"
                autoComplete="given-name"
                maxLength={LIMITS.name}
                value={values.name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && next()}
                className="mt-2 w-full border-0 border-b border-line bg-transparent pb-3 font-serif text-2xl transition-colors focus:border-rose"
              />
            </div>
          </div>
        )}

        {step.kind === 'question' && (
          <QuestionField
            question={step.question}
            value={values.answers[step.question.id] ?? ''}
            onChange={(value) => setAnswer(step.question.id, value)}
            onEnter={next}
          />
        )}

      </div>

      {error && (
        <p role="alert" className="mt-8 rounded-md bg-blush/60 px-4 py-3 text-sm text-rose-deep">
          {error}
        </p>
      )}

      <nav className="mt-12 flex items-center justify-between">
        {step.kind === 'welcome' ? (
          <span />
        ) : (
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={status === 'sending'}
            className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink disabled:opacity-50"
          >
            <ArrowLeft aria-hidden size={16} /> Back
          </button>
        )}

        {index === last ? (
          <button type="button" onClick={() => void submit()} disabled={status === 'sending'} className={primaryButton}>
            {status === 'sending' && <Loader2 aria-hidden size={16} className="animate-spin" />}
            {status === 'sending' ? 'Sending…' : 'Submit'}
          </button>
        ) : step.kind === 'welcome' ? (
          <button type="button" onClick={next} className={primaryButton}>
            Begin <ArrowRight aria-hidden size={16} />
          </button>
        ) : (
          <button type="button" onClick={next} className={primaryButton}>
            Next <ArrowRight aria-hidden size={16} />
          </button>
        )}
      </nav>
    </Shell>
  )
}

function Shell({ children, progress }: { children: React.ReactNode; progress?: number }) {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col">
      <div className="h-0.5 w-full bg-line/60" aria-hidden>
        <div
          className="h-full bg-rose transition-[width] duration-700 ease-out"
          style={{ width: `${(progress ?? 1) * 100}%` }}
        />
      </div>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-12">{children}</main>
    </div>
  )
}
