import { createHash } from 'node:crypto'
import { MongoServerError, type WithId } from 'mongodb'
import { getCommonRoomAnswers, type CommonRoomAnswerDocument } from '../server/db.js'
import { checkAnswerText, QUESTION_IDS, REQUEST_LIMIT, type StoredAnswer } from '../shared/commonRoom.js'
import { isRecord } from '../shared/validation.js'

// Each browser holds a random secret key. Only a hash of it is stored, and every request must present the key, so
// a visitor can reach nothing but their own answers. Without a key (or with the wrong one) nothing is returned.
function ownerOf(request: Request): string | null {
  const match = /^Bearer ([a-f0-9]{64})$/.exec(request.headers.get('authorization') ?? '')
  return match ? createHash('sha256').update(match[1]).digest('hex') : null
}

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

const denied = () => json({ error: 'This browser is not allowed to do that.' }, 401)

const present = (doc: WithId<CommonRoomAnswerDocument>): StoredAnswer => ({
  id: doc._id.toHexString(),
  questionId: doc.questionId,
  answer: doc.answer,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
})

const unavailable = (action: string, error: unknown) => {
  console.error(`Common Room: ${action} failed:`, error)
  return json({ error: `The answers could not be ${action} just now. Please try again in a moment.` }, 503)
}

export async function GET(request: Request): Promise<Response> {
  const ownerId = ownerOf(request)
  if (!ownerId) return denied()

  try {
    const answers = await getCommonRoomAnswers()
    const documents = await answers.find({ ownerId }).toArray()
    return json({ answers: documents.map(present) })
  } catch (error) {
    return unavailable('loaded', error)
  }
}

export async function PUT(request: Request): Promise<Response> {
  const ownerId = ownerOf(request)
  if (!ownerId) return denied()

  const body = await request.text()
  if (body.length > REQUEST_LIMIT) return json({ error: 'That was a little too long to save.' }, 413)

  let payload: unknown
  try {
    payload = JSON.parse(body)
  } catch {
    return json({ error: 'The answer could not be read.' }, 400)
  }
  if (!isRecord(payload) || typeof payload.questionId !== 'string' || !QUESTION_IDS.has(payload.questionId)) {
    return json({ error: 'That question does not exist.' }, 400)
  }
  const checked = checkAnswerText(payload.answer)
  if (!checked.ok) return json({ error: checked.error }, 400)

  const { questionId } = payload

  // One document per person and question: an existing answer is updated in place, never duplicated.
  const write = async () => {
    const answers = await getCommonRoomAnswers()
    const now = new Date()
    return answers.findOneAndUpdate(
      { ownerId, questionId },
      { $set: { answer: checked.answer, updatedAt: now }, $setOnInsert: { createdAt: now } },
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
    return unavailable('saved', error)
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const ownerId = ownerOf(request)
  if (!ownerId) return denied()

  const questionId = new URL(request.url).searchParams.get('questionId')
  if (!questionId || !QUESTION_IDS.has(questionId)) return json({ error: 'That question does not exist.' }, 400)

  try {
    const answers = await getCommonRoomAnswers()
    const { deletedCount } = await answers.deleteOne({ ownerId, questionId })
    return json({ deleted: deletedCount })
  } catch (error) {
    return unavailable('deleted', error)
  }
}
