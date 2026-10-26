import type { FormValues } from '../../shared/questionnaire'

export class SubmitError extends Error {}

// The server validates the raw form values itself and builds the stored document from them.
export async function submitResponse(submission: FormValues): Promise<void> {
  let response: Response
  try {
    response = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    })
  } catch {
    throw new SubmitError("Couldn't reach the server. Check your connection and try again.")
  }

  if (response.ok) return

  const body: unknown = await response.json().catch(() => null)
  const message =
    typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
      ? body.error
      : 'Something went wrong while sending. Please try again.'
  throw new SubmitError(message)
}
