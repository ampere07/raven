import { joinChoices, LIMITS, QUESTIONS, splitChoices, type Answer, type Submission } from './questionnaire.js'

export type ValidationResult = { ok: true; value: Submission } | { ok: false; error: string }

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const invalid = (error: string): ValidationResult => ({ ok: false, error })

// Unknown question ids are ignored so an old draft never blocks sending.
export function validateSubmission(input: unknown): ValidationResult {
  if (!isRecord(input) || !isRecord(input.answers)) return invalid('The answers could not be read.')
  if (input.name !== undefined && typeof input.name !== 'string') return invalid('The name could not be read.')

  const name = input.name?.trim() ?? ''
  if (name.length > LIMITS.name) return invalid(`Your name can be up to ${LIMITS.name} characters.`)

  const answers: Answer[] = []
  for (const question of QUESTIONS) {
    const raw = input.answers[question.id]
    if (raw === undefined) continue
    if (typeof raw !== 'string') return invalid('One of the answers could not be read.')

    const answer = raw.trim()
    if (!answer) continue
    if (answer.length > LIMITS.answer) {
      return invalid(`Each answer can be up to ${LIMITS.answer} characters.`)
    }
    if (question.kind === 'multiselect') {
      const choices = splitChoices(answer)
      if (choices.length > question.max) {
        return invalid(`Please pick up to ${question.max} for “${question.prompt}”`)
      }
      if (new Set(choices).size !== choices.length || !choices.every((choice) => question.options.includes(choice))) {
        return invalid(`Please pick from the list for “${question.prompt}”`)
      }
      answers.push({ questionId: question.id, question: question.prompt, answer: joinChoices(choices) })
      continue
    }
    if ('options' in question && !question.options.includes(answer)) {
      return invalid(`Please pick one of the options for “${question.prompt}”`)
    }
    answers.push({ questionId: question.id, question: question.prompt, answer })
  }

  if (answers.length === 0) return invalid('Answer at least one question before sending.')
  return { ok: true, value: name ? { name, answers } : { answers } }
}
