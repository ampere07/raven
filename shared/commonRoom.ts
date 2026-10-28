import { isRecord } from './validation.js'

export type CommonRoomQuestion = {
  /** Stable identifier stored with every answer. Never reuse or renumber these. */
  id: string
  text: string
  /** One gentle, optional follow-up shown under "A Little More Magic". It is never stored. */
  followUp: string
}

// Everything the chapter says in its own voice lives here, so it can be edited in one place.
export const COMMON_ROOM_COPY = {
  number: 'II',
  title: 'The Common Room',
  subtitle: 'Every person has a little world of their own. Let’s discover yours.',
  introduction:
    'Some things are better discovered one conversation at a time. These are little questions about the things you enjoy, the things that make you laugh, and the little details that make you, you.',
  enter: 'Enter the Common Room',
  privacy:
    'Every question is optional. What you write is saved so that I can read it, and no one else can. You can change or delete any answer whenever you like. Your answers stay linked to this browser, so you will find them again here.',
  moreMagic: 'A Little More Magic',
  completeTitle: 'You have explored the Common Room.',
  completeSubtitle: 'Every little detail is another piece of someone’s story.',

  // The villain and the scene after the last question. None of this is stored.
  villainName: 'Voldemort',
  villainDefeatLine: 'I will come back.',
  finale: {
    villainLine: 'I told you I would come back.',
    heroName: 'Raven',
    askLine: 'Are you okay?',
    replies: [
      { label: 'Yes, I’m okay', answer: 'Good. You’re safe now.' },
      { label: 'A little scared', answer: 'It’s okay. I’ve got you.' },
    ],
  },
} as const

export const COMMON_ROOM_QUESTIONS: readonly CommonRoomQuestion[] = [
  {
    id: 'ideal-weekend',
    text: 'What does your ideal weekend look like?',
    followUp: 'Would you rather spend it somewhere new or somewhere familiar?',
  },
  {
    id: 'humor',
    text: 'What kind of humor makes you laugh the hardest?',
    followUp: 'What is the funniest thing that happened to you recently?',
  },
  {
    id: 'first-impression',
    text: 'What kind of person usually catches your attention, even before you get to know them?',
    followUp: 'Is it something in how they carry themselves, or more in their energy?',
  },
  {
    id: 'spontaneous-or-routine',
    text: 'Do you enjoy spontaneous adventures or comfortable routines more?',
    followUp: 'Is there a small routine you would never give up?',
  },
  {
    id: 'hobby-to-try',
    text: 'What hobby have you always wanted to try?',
    followUp: 'What has stopped you from trying it so far?',
  },
  {
    id: 'talk-for-hours',
    text: 'What is something you can talk about for hours without getting bored?',
    followUp: 'How did you first fall in love with it?',
  },
  {
    id: 'slowly-liking',
    text: 'What little things can someone do that make you slowly start liking them?',
    followUp: 'Is there one small gesture you still remember?',
  },
  {
    id: 'surprising-fact',
    text: 'What is something people would be surprised to learn about you?',
    followUp: 'Is there a story behind it you would enjoy telling someday?',
  },
  {
    id: 'guilty-pleasure',
    text: 'What is your guilty pleasure?',
    followUp: 'Is there a favorite way to enjoy it, like a time, a place, or a snack to go with it?',
  },
  {
    id: 'free-day',
    text: 'If you could spend a whole day doing anything, with no responsibilities, what would you do?',
    followUp: 'Would you rather spend that day alone or with people you enjoy being around?',
  },
  {
    id: 'group-size',
    text: 'Are you more comfortable in a small group or a big crowd?',
    followUp: 'What makes a gathering feel comfortable for you?',
  },
  {
    id: 'your-type',
    text: 'If you had to describe your type in three words, what would they be?',
    followUp: 'Which of those three words matters most to you?',
  },
]

/** The villain waits right after this question. It is named by id, so reordering questions keeps it in place. */
export const VILLAIN_AFTER_QUESTION = 'humor'

export const QUESTION_IDS: ReadonlySet<string> = new Set(COMMON_ROOM_QUESTIONS.map((question) => question.id))

export const ANSWER_LIMIT = 600
export const REQUEST_LIMIT = 2_000

/** An answer exactly as the server returns it. */
export type StoredAnswer = {
  id: string
  questionId: string
  answer: string
  createdAt: string
  updatedAt: string
}

const isText = (value: unknown): value is string => typeof value === 'string'

export function isStoredAnswer(value: unknown): value is StoredAnswer {
  return (
    isRecord(value) &&
    isText(value.id) &&
    isText(value.questionId) &&
    isText(value.answer) &&
    isText(value.createdAt) &&
    isText(value.updatedAt)
  )
}

export type AnswerCheck = { ok: true; answer: string } | { ok: false; error: string }

export function checkAnswerText(input: unknown): AnswerCheck {
  if (typeof input !== 'string') return { ok: false, error: 'The answer could not be read.' }
  const answer = input.trim()
  if (!answer) return { ok: false, error: 'An answer cannot be empty. Delete it instead.' }
  if (answer.length > ANSWER_LIMIT) return { ok: false, error: `An answer can be up to ${ANSWER_LIMIT} characters.` }
  return { ok: true, answer }
}
