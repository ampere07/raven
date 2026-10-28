import { isStoredAnswer, type StoredAnswer } from '../../shared/commonRoom'
import { getOwnerKey } from '../utils/owner'

export type FailureKind = 'network' | 'server' | 'malformed'

export class CommonRoomError extends Error {
  readonly kind: FailureKind

  constructor(message: string, kind: FailureKind) {
    super(message)
    this.kind = kind
  }
}

const NETWORK = 'Hindi maabot yung server. Check mo yung internet mo tapos subukan ulit.'
const MALFORMED = 'Weird yung sagot ng server. Subukan ulit.'

function messageFrom(body: unknown): string | undefined {
  return typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
    ? body.error
    : undefined
}

async function request(path: string, init: { method: 'GET' | 'PUT' | 'DELETE'; body?: unknown }): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(path, {
      method: init.method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getOwnerKey()}` },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    })
  } catch {
    throw new CommonRoomError(NETWORK, 'network')
  }

  const body: unknown = await response.json().catch(() => undefined)
  if (!response.ok) throw new CommonRoomError(messageFrom(body) ?? 'May nangyaring mali. Subukan ulit.', 'server')
  if (body === undefined) throw new CommonRoomError(MALFORMED, 'malformed')
  return body
}

export async function listAnswers(): Promise<StoredAnswer[]> {
  const body = await request('/api/common-room', { method: 'GET' })
  if (typeof body !== 'object' || body === null || !('answers' in body) || !Array.isArray(body.answers)) {
    throw new CommonRoomError(MALFORMED, 'malformed')
  }
  if (!body.answers.every(isStoredAnswer)) throw new CommonRoomError(MALFORMED, 'malformed')
  return body.answers
}

export async function saveAnswer(questionId: string, answer: string): Promise<StoredAnswer> {
  const body = await request('/api/common-room', { method: 'PUT', body: { questionId, answer } })
  if (typeof body !== 'object' || body === null || !('answer' in body) || !isStoredAnswer(body.answer)) {
    throw new CommonRoomError(MALFORMED, 'malformed')
  }
  return body.answer
}

export async function deleteAnswer(questionId: string): Promise<void> {
  const body = await request(`/api/common-room?questionId=${encodeURIComponent(questionId)}`, { method: 'DELETE' })
  if (typeof body !== 'object' || body === null || !('deleted' in body) || typeof body.deleted !== 'number') {
    throw new CommonRoomError(MALFORMED, 'malformed')
  }
}
