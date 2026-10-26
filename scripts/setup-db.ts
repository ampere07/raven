import { closeDatabase, getDatabase, RESPONSES_COLLECTION } from '../server/db.js'
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

try {
  const db = await getDatabase()
  const [existing] = await db.listCollections({ name: RESPONSES_COLLECTION }).toArray()

  if (existing) {
    await db.command({ collMod: RESPONSES_COLLECTION, validator, validationLevel: 'strict' })
  } else {
    await db.createCollection(RESPONSES_COLLECTION, { validator })
  }
  await db.collection(RESPONSES_COLLECTION).createIndex({ createdAt: -1 })

  console.log(`${db.databaseName}.${RESPONSES_COLLECTION} is ready (validation rules and index applied).`)
} finally {
  await closeDatabase()
}
