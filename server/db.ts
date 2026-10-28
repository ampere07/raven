import { MongoClient, type Collection, type Db } from 'mongodb'
import type { Submission } from '../shared/questionnaire.js'

export type ResponseDocument = Submission & { createdAt: Date }

export const RESPONSES_COLLECTION = 'responses'

/**
 * One document per person per Common Room question. `ownerId` is a hash of the secret key held by that person's
 * browser, never the key itself.
 */
export type CommonRoomAnswerDocument = {
  ownerId: string
  questionId: string
  /** The question's wording when it was answered, so the database reads on its own. Older rows may not have it. */
  question?: string
  answer: string
  createdAt: Date
  updatedAt: Date
}

export const COMMON_ROOM_COLLECTION = 'common_room_answers'
export const COMMON_ROOM_INDEX = { ownerId: 1, questionId: 1 } as const

// Cached across invocations of a warm serverless instance.
let clientPromise: Promise<MongoClient> | undefined

function connect(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  if (!uri) return Promise.reject(new Error('MONGODB_URI is not set'))

  clientPromise ??= new MongoClient(uri, { serverSelectionTimeoutMS: 8_000 })
    .connect()
    .catch((error: unknown) => {
      clientPromise = undefined
      throw error
    })
  return clientPromise
}

export async function getDatabase(): Promise<Db> {
  const client = await connect()
  return client.db(process.env.MONGODB_DB || 'little_things')
}

export async function getResponses(): Promise<Collection<ResponseDocument>> {
  const db = await getDatabase()
  return db.collection<ResponseDocument>(RESPONSES_COLLECTION)
}

let answersIndex: Promise<unknown> | undefined

export async function getCommonRoomAnswers(): Promise<Collection<CommonRoomAnswerDocument>> {
  const db = await getDatabase()
  const collection = db.collection<CommonRoomAnswerDocument>(COMMON_ROOM_COLLECTION)

  // The unique index is what stops two answers for the same person and question, even if two saves race.
  answersIndex ??= collection.createIndex(COMMON_ROOM_INDEX, { unique: true }).catch((error: unknown) => {
    answersIndex = undefined
    throw error
  })
  await answersIndex
  return collection
}

export async function closeDatabase(): Promise<void> {
  answersIndex = undefined
  const pending = clientPromise
  clientPromise = undefined
  if (pending) await (await pending).close()
}
