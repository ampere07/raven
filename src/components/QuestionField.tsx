import { Check } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { LIMITS, NO_FAVORITE, type Question } from '../../shared/questionnaire'
import { Combobox } from './Combobox'
import { MultiCombobox } from './MultiCombobox'

type Props = {
  question: Question
  value: string
  onChange: (value: string) => void
  onEnter: () => void
}

const underline =
  'mt-8 w-full border-0 border-b border-line bg-transparent pb-3 font-serif text-2xl text-ink placeholder:italic placeholder:text-ink-soft/40 transition-colors focus:border-rose'

export function QuestionField({ question, value, onChange, onEnter }: Props) {
  const id = `q-${question.id}`
  const prompt = (
    <>
      <h2 id={`${id}-label`} className="font-serif text-3xl leading-tight sm:text-4xl">
        {question.prompt}
      </h2>
      {question.hint && <p className="mt-3 text-sm text-ink-soft">{question.hint}</p>}
    </>
  )

  if (question.kind === 'multiselect') {
    return (
      <div>
        {prompt}
        <MultiCombobox
          labelledBy={`${id}-label`}
          options={question.options}
          value={value}
          max={question.max}
          exclusive={NO_FAVORITE}
          onChange={onChange}
          onEnter={onEnter}
        />
      </div>
    )
  }

  if (question.kind === 'select') {
    return (
      <div>
        {prompt}
        <Combobox
          labelledBy={`${id}-label`}
          options={question.options}
          value={value}
          onChange={onChange}
          onEnter={onEnter}
        />
      </div>
    )
  }

  if (question.kind === 'choice') {
    return (
      <div role="group" aria-labelledby={`${id}-label`}>
        {prompt}
        <div className="mt-8 grid gap-3">
          {question.options.map((option) => {
            const selected = value === option
            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(selected ? '' : option)}
                className={`flex items-center justify-between rounded-md border px-5 py-4 text-left transition-all duration-300 ${
                  selected
                    ? 'border-sage bg-sage-soft/70 text-ink'
                    : 'border-line text-ink-soft hover:border-sage/60 hover:text-ink'
                }`}
              >
                {option}
                <Check
                  aria-hidden
                  size={18}
                  className={`text-sage transition-all duration-300 ${selected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                />
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const submitOnEnter = (event: KeyboardEvent) => {
    const wantsNext = question.kind === 'short' ? event.key === 'Enter' : event.key === 'Enter' && (event.ctrlKey || event.metaKey)
    if (!wantsNext) return
    event.preventDefault()
    onEnter()
  }

  return (
    <div>
      <label htmlFor={id}>{prompt}</label>
      {question.kind === 'long' ? (
        <textarea
          id={id}
          autoFocus
          rows={5}
          maxLength={LIMITS.answer}
          placeholder="Take your time…"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={submitOnEnter}
          className="mt-8 w-full resize-none rounded-md border border-line bg-cream/40 p-4 leading-relaxed text-ink transition-colors placeholder:italic placeholder:text-ink-soft/40 focus:border-rose"
        />
      ) : (
        <input
          id={id}
          autoFocus
          type="text"
          maxLength={LIMITS.answer}
          placeholder="Type your answer…"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={submitOnEnter}
          className={underline}
        />
      )}
    </div>
  )
}
