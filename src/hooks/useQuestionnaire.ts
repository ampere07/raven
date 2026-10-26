import { useCallback, useEffect, useState } from 'react'
import type { FormValues, Submission } from '../../shared/questionnaire'
import { validateSubmission } from '../../shared/validation'
import { submitResponse, SubmitError } from '../services/responses'

export type Status = 'editing' | 'sending' | 'sent'

const DRAFT_KEY = 'little-things-draft'
const EMPTY: FormValues = { name: '', answers: {} }

function loadDraft(): FormValues {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return EMPTY
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null && 'answers' in parsed && 'name' in parsed) {
      return parsed as FormValues
    }
  } catch {
    // Unreadable or unavailable storage just means starting fresh.
  }
  return EMPTY
}

function saveDraft(values: FormValues | null) {
  try {
    if (values) localStorage.setItem(DRAFT_KEY, JSON.stringify(values))
    else localStorage.removeItem(DRAFT_KEY)
  } catch {
    // The draft is a convenience; failing to keep it must not break the form.
  }
}

export function useQuestionnaire() {
  const [values, setValues] = useState<FormValues>(loadDraft)
  const [status, setStatus] = useState<Status>('editing')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<Submission | null>(null)

  useEffect(() => {
    if (status === 'editing') saveDraft(values)
  }, [values, status])

  const setName = useCallback((name: string) => {
    setValues((current) => ({ ...current, name }))
  }, [])

  const setAnswer = useCallback((questionId: string, answer: string) => {
    setValues((current) => ({ ...current, answers: { ...current.answers, [questionId]: answer } }))
  }, [])

  const submit = useCallback(async () => {
    const result = validateSubmission(values)
    if (!result.ok) {
      setError(result.error)
      return
    }

    setError(null)
    setStatus('sending')
    try {
      await submitResponse(values)
      saveDraft(null)
      setValues(EMPTY)
      setSent(result.value)
      setStatus('sent')
    } catch (caught) {
      setError(caught instanceof SubmitError ? caught.message : 'Something went wrong. Please try again.')
      setStatus('editing')
    }
  }, [values])

  const startOver = useCallback(() => {
    setError(null)
    setSent(null)
    setStatus('editing')
  }, [])

  return { values, status, error, sent, setName, setAnswer, submit, startOver }
}
