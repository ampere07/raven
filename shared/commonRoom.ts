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
  subtitle: 'Lahat tayo may sariling mundo. Gusto kong malaman yung sa’yo.',
  introduction:
    '',
  enter: 'Proceed',
  privacy:
    'Hindi mo kailangang sagutin lahat, skip mo lang if dika comfy sagutin.',
  moreMagic: 'Extra details lang ',
  completeTitle: 'Thankyou sa cooperation.',
  completeSubtitle: 'Mahalaga sakin kahit yung mga maliliit na detalye.',

  // The Quidditch game after the seventh question. None of this is stored either.
  snitch: {
    title: 'Golden Snitch!',
    guidance: 'May Golden Snitch! I-tap mo siya para mahuli. Sampu ang kailangan mo.',
    heroName: 'Raven',
    // Said after they catch the last one together. Same shape as the finale: his line, her reply, his answer.
    conversation: [
      {
        say: 'Ay sige, ipapaubaya ko na. Ikaw naman yan.',
        choices: [
          { label: 'Ha? Anong ibig mong sabihin?', answer: 'Wala, wala. Sabay naman nating nahuli, diba?' },
          { label: 'Sabay tayong nakahuli, ah.', answer: 'Oo nga. Pero sa’yo na lang. Ikaw naman yan.' },
        ],
      },
      { say: 'Tuloy na tayo? Marami pa akong gustong malaman sa’yo.' },
    ],
  },

  // The villain and the scene after the last question. None of this is stored.
  villainName: 'Voldemort',
  villainDefeatLine: 'Ill be back.',
  finale: {
    villainLine: 'I told you, I will be back.',
    heroName: 'Raven',
    // After the rescue she and Raven talk. Each beat is one of his lines; if it has choices she picks a reply and he
    // answers it before the next beat. Nothing she picks is stored.
    conversation: [
      {
        say: 'Are you okay?',
        choices: [
          { label: 'Yes, Im fine', answer: 'Good. Your safe now.' },
          { label: 'I was a bit scared', answer: 'Its okay. Im here now.' },
        ],
      },
      { say: 'I wont let him hurt you. Not now, not ever.' },
      {
        say: 'I saw him coming back, so I ran to you.',
        choices: [
          { label: 'Why did you save me?', answer: 'Because you’re the one I don’t want to lose.' },
          { label: 'Thanks, ha.', answer: 'No problem. I would do it again for you.' },
        ],
      },
      {
        say: 'If he tries to come back, Ill face him again. Just stay by my side.',
        choices: [
          { label: 'Ill stay right here', answer: 'Yan na nga yung gusto kong marinig.' },
          { label: 'Ill go with you', answer: 'Kaya ko lahat basta kasama kita.' },
        ],
      },
      { say: 'Lets go. I want to know more about you.' },
    ],
  },
} as const

export type FinaleBeat = {
  say: string
  choices?: readonly { label: string; answer: string }[]
}

export const COMMON_ROOM_QUESTIONS: readonly CommonRoomQuestion[] = [
  {
    id: 'ideal-weekend',
    text: 'Ano yung perfect weekend para sa’yo?',
    followUp: 'Mas gusto mo ba sa bagong place o sa lugar na kilala mo na?',
  },
  {
    id: 'humor',
    text: 'Anong klaseng jokes yung pinaka-nakakatawa para sa’yo?',
    followUp: 'Ano yung pinakanakakatawang nangyari sa’yo recently?',
  },
  {
    id: 'first-impression',
    text: 'Anong klaseng tao yung agad nakakakuha ng attention mo, kahit hindi mo pa siya kilala?',
    followUp: 'Sa itsura ba, sa kilos, o sa vibes niya?',
  },
  {
    id: 'spontaneous-or-routine',
    text: 'Mas gusto mo ba yung biglaang lakad o yung comfy na routine?',
    followUp: 'May routine ka bang ayaw mong mawala?',
  },
  {
    id: 'hobby-to-try',
    text: 'Anong hobby yung gusto mo nang subukan dati pa?',
    followUp: 'Ano bang pumipigil sa’yo na subukan?',
  },
  {
    id: 'talk-for-hours',
    text: 'Ano yung kaya mong pag-usapan nang ilang oras na hindi ka nagsasawa?',
    followUp: 'Paano ka ba nahilig doon?',
  },
  {
    id: 'slowly-liking',
    text: 'Anong maliliit na bagay yung pwedeng gawin ng isang tao para unti-unti mo siyang magustuhan?',
    followUp: 'May isang simpleng ginawa ba na hindi mo malimutan?',
  },
  {
    id: 'surprising-fact',
    text: 'Ano yung bagay about sa’yo na ikagugulat ng mga tao?',
    followUp: 'May kwento ba sa likod niyan na gusto mong ikwento someday?',
  },
  {
    id: 'guilty-pleasure',
    text: 'Ano yung guilty pleasure mo?',
    followUp: 'May paborito ka bang paraan para i-enjoy yun, parang may time, lugar, o food na kasama?',
  },
  {
    id: 'free-day',
    text: 'Kung may isang buong araw ka na walang responsibilidad, ano yung gagawin mo?',
    followUp: 'Mag-isa ka ba o kasama yung mga taong gusto mo?',
  },
  {
    id: 'group-size',
    text: 'Mas comfy ka ba sa small group o sa maraming tao?',
    followUp: 'Ano yung nagpapagaan ng pakiramdam mo sa isang hangout?',
  },
  {
    id: 'your-type',
    text: 'Kung ide-describe mo yung type mo in three words, ano yun?',
    followUp: 'Alin sa tatlong yun yung pinaka-importante sa’yo?',
  },
]

/** The villain waits right after this question. It is named by id, so reordering questions keeps it in place. */
export const VILLAIN_AFTER_QUESTION = 'humor'

// The Quidditch game stands between this question and the next, and she has to catch this many snitches.
export const SNITCH_AFTER_QUESTION = 'slowly-liking'
export const SNITCH_TARGET = 10

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
  if (typeof input !== 'string') return { ok: false, error: 'Hindi mabasa yung sagot.' }
  const answer = input.trim()
  if (!answer) return { ok: false, error: 'Hindi pwedeng walang laman. Burahin mo na lang.' }
  if (answer.length > ANSWER_LIMIT) return { ok: false, error: `Hanggang ${ANSWER_LIMIT} characters lang yung sagot.` }
  return { ok: true, answer }
}
