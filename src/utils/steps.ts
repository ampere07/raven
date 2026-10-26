import { QUESTION_GROUPS, QUESTIONS, type Question } from '../../shared/questionnaire'

export type Step =
  | { kind: 'welcome' }
  | { kind: 'question'; question: Question; group: string; number: number }

export const TOTAL_QUESTIONS = QUESTIONS.length

export const STEPS: readonly Step[] = [
  { kind: 'welcome' },
  ...QUESTION_GROUPS.flatMap((group) =>
    group.questions.map((question): Step => ({
      kind: 'question',
      question,
      group: group.title,
      number: QUESTIONS.indexOf(question) + 1,
    })),
  ),
]
