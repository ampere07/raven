import { MongoClient, type Collection, type Db } from 'mongodb'
import type { Submission } from '../shared/questionnaire.js'

export type ResponseDocument = Submission & { createdAt: Date }

export const RESPONSES_COLLECTION = 'responses'

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

export async function closeDatabase(): Promise<void> {
  const pending = clientPromise
  clientPromise = undefined
  if (pending) await (await pending).close()
}
