import { createHash } from 'node:crypto'
import { MongoServerError, type WithId } from 'mongodb'
import { getCommonRoomAnswers, type CommonRoomAnswerDocument } from '../server/db.js'
import {
  checkAnswerText,
  COMMON_ROOM_QUESTIONS,
  REQUEST_LIMIT,
  type StoredAnswer,
} from '../shared/commonRoom.js'
import { HIGH_SEAS_QUESTIONS } from '../shared/highSeas.js'
import { isRecord } from '../shared/validation.js'

// Chapter II and Chapter III share this collection; their question ids never overlap.
const KNOWN_QUESTIONS = [...COMMON_ROOM_QUESTIONS, ...HIGH_SEAS_QUESTIONS]
const KNOWN_IDS: ReadonlySet<string> = new Set(KNOWN_QUESTIONS.map((question) => question.id))

// Each browser holds a random secret key. Only a hash of it is stored, and every request must present the key, so
// a visitor can reach nothing but their own answers. Without a key (or with the wrong one) nothing is returned.
function ownerOf(request: Request): string | null {
  const match = /^Bearer ([a-f0-9]{64})$/.exec(request.headers.get('authorization') ?? '')
  return match ? createHash('sha256').update(match[1]).digest('hex') : null
}

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

const denied = () => json({ error: 'Hindi pinapayagan ng browser na ’to.' }, 401)

const present = (doc: WithId<CommonRoomAnswerDocument>): StoredAnswer => ({
  id: doc._id.toHexString(),
  questionId: doc.questionId,
  answer: doc.answer,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
})

const UNAVAILABLE = {
  load: 'Hindi ma-load yung mga sagot ngayon. Subukan mo ulit mamaya.',
  save: 'Hindi na-save yung sagot ngayon. Subukan mo ulit mamaya.',
  delete: 'Hindi nabura yung sagot ngayon. Subukan mo ulit mamaya.',
} as const

const unavailable = (action: keyof typeof UNAVAILABLE, error: unknown) => {
  console.error(`Common Room: could not ${action}:`, error)
  return json({ error: UNAVAILABLE[action] }, 503)
}

export async function GET(request: Request): Promise<Response> {
  const ownerId = ownerOf(request)
  if (!ownerId) return denied()

  try {
    const answers = await getCommonRoomAnswers()
    const documents = await answers.find({ ownerId }).toArray()
    return json({ answers: documents.map(present) })
  } catch (error) {
    return unavailable('load', error)
  }
}

export async function PUT(request: Request): Promise<Response> {
  const ownerId = ownerOf(request)
  if (!ownerId) return denied()

  const body = await request.text()
  if (body.length > REQUEST_LIMIT) return json({ error: 'Masyadong mahaba para ma-save.' }, 413)

  let payload: unknown
  try {
    payload = JSON.parse(body)
  } catch {
    return json({ error: 'Hindi mabasa yung sagot.' }, 400)
  }
  if (!isRecord(payload) || typeof payload.questionId !== 'string' || !KNOWN_IDS.has(payload.questionId)) {
    return json({ error: 'Walang ganyang tanong.' }, 400)
  }
  const checked = checkAnswerText(payload.answer)
  if (!checked.ok) return json({ error: checked.error }, 400)

  const { questionId } = payload
  // The wording comes from the server's own list, never from the request, and is refreshed on every save.
  const question = KNOWN_QUESTIONS.find((candidate) => candidate.id === questionId)?.text
  if (!question) return json({ error: 'Walang ganyang tanong.' }, 400)

  // One document per person and question: an existing answer is updated in place, never duplicated.
  const write = async () => {
    const answers = await getCommonRoomAnswers()
    const now = new Date()
    return answers.findOneAndUpdate(
      { ownerId, questionId },
      { $set: { question, answer: checked.answer, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true, returnDocument: 'after' },
    )
  }

  try {
    let stored: WithId<CommonRoomAnswerDocument> | null
    try {
      stored = await write()
    } catch (error) {
      // Two first saves of the same answer at once: the loser retries as an update.
      if (error instanceof MongoServerError && error.code === 11000) stored = await write()
      else throw error
    }
    if (!stored) throw new Error('The write returned no document')
    return json({ answer: present(stored) })
  } catch (error) {
    return unavailable('save', error)
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const ownerId = ownerOf(request)
  if (!ownerId) return denied()

  const questionId = new URL(request.url).searchParams.get('questionId')
  if (!questionId || !KNOWN_IDS.has(questionId)) return json({ error: 'Walang ganyang tanong.' }, 400)

  try {
    const answers = await getCommonRoomAnswers()
    const { deletedCount } = await answers.deleteOne({ ownerId, questionId })
    return json({ deleted: deletedCount })
  } catch (error) {
    return unavailable('delete', error)
  }
}
