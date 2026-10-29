import type { Db } from 'mongodb'
import { closeDatabase, COMMON_ROOM_COLLECTION, COMMON_ROOM_INDEX, getDatabase, RESPONSES_COLLECTION } from '../server/db.js'
import { ANSWER_LIMIT, COMMON_ROOM_QUESTIONS } from '../shared/commonRoom.js'
import { HIGH_SEAS_QUESTIONS } from '../shared/highSeas.js'
import { LIMITS } from '../shared/questionnaire.js'

// Structural rules only, so editing the questions never requires re-running this script.
const validator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['answers', 'createdAt'],
    additionalProperties: false,
    properties: {
      _id: { bsonType: 'objectId' },
      name: { bsonType: 'string', minLength: 1, maxLength: LIMITS.name },
      answers: {
        bsonType: 'array',
        minItems: 1,
        items: {
          bsonType: 'object',
          required: ['questionId', 'question', 'answer'],
          additionalProperties: false,
          properties: {
            questionId: { bsonType: 'string', minLength: 1 },
            question: { bsonType: 'string', minLength: 1 },
            answer: { bsonType: 'string', minLength: 1, maxLength: LIMITS.answer },
          },
        },
      },
      createdAt: { bsonType: 'date' },
    },
  },
}

const commonRoomValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['ownerId', 'questionId', 'answer', 'createdAt', 'updatedAt'],
    additionalProperties: false,
    properties: {
      _id: { bsonType: 'objectId' },
      ownerId: { bsonType: 'string', minLength: 64, maxLength: 64 },
      questionId: { bsonType: 'string', minLength: 1, maxLength: 64 },
      question: { bsonType: 'string', minLength: 1, maxLength: 500 },
      answer: { bsonType: 'string', minLength: 1, maxLength: ANSWER_LIMIT },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
    },
  },
}

async function ensureCollection(db: Db, name: string, schema: { $jsonSchema: object }) {
  const [existing] = await db.listCollections({ name }).toArray()
  if (existing) await db.command({ collMod: name, validator: schema, validationLevel: 'strict' })
  else await db.createCollection(name, { validator: schema })
}

try {
  const db = await getDatabase()

  await ensureCollection(db, RESPONSES_COLLECTION, validator)
  await db.collection(RESPONSES_COLLECTION).createIndex({ createdAt: -1 })

  await ensureCollection(db, COMMON_ROOM_COLLECTION, commonRoomValidator)
  await db.collection(COMMON_ROOM_COLLECTION).createIndex(COMMON_ROOM_INDEX, { unique: true })

  // Answers saved before the question text was stored get it now. Only rows without it are touched, nothing is
  // removed, and no answer is changed.
  let added = 0
  for (const { id, text } of [...COMMON_ROOM_QUESTIONS, ...HIGH_SEAS_QUESTIONS]) {
    const result = await db
      .collection(COMMON_ROOM_COLLECTION)
      .updateMany({ questionId: id, question: { $exists: false } }, { $set: { question: text } })
    added += result.modifiedCount
  }
  console.log(`Added the question text to ${added} saved answer(s).`)

  console.log(
    `${db.databaseName}: ${RESPONSES_COLLECTION} and ${COMMON_ROOM_COLLECTION} are ready (validation rules and indexes applied).`,
  )
} finally {
  await closeDatabase()
}
