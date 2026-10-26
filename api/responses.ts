import { getResponses } from '../server/db.js'
import { LIMITS } from '../shared/questionnaire.js'
import { validateSubmission } from '../shared/validation.js'

export async function POST(request: Request): Promise<Response> {
  const body = await request.text()
  if (body.length > LIMITS.body) {
    return Response.json({ error: 'That was a little too long to send.' }, { status: 413 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(body)
  } catch {
    return Response.json({ error: 'The answers could not be read.' }, { status: 400 })
  }

  const result = validateSubmission(payload)
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 })

  try {
    const responses = await getResponses()
    const { acknowledged, insertedId } = await responses.insertOne({ ...result.value, createdAt: new Date() })
    if (!acknowledged) throw new Error('Insert was not acknowledged')
    return Response.json({ id: insertedId.toHexString() }, { status: 201 })
  } catch (error) {
    console.error('Saving a response failed:', error)
    return Response.json(
      { error: 'Your answers could not be saved just now. Please try again in a moment.' },
      { status: 503 },
    )
  }
}
