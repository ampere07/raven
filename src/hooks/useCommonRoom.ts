import { useCallback, useEffect, useState } from 'react'
import type { StoredAnswer } from '../../shared/commonRoom'
import { deleteAnswer, listAnswers, saveAnswer } from '../services/commonRoom'

export type LoadState = { status: 'loading' } | { status: 'ready' } | { status: 'error'; message: string }

const messageOf = (error: unknown) => (error instanceof Error ? error.message : 'Something went wrong.')

// The saved answers, keyed by question id. They change only after the server has confirmed the change, so what is
// shown is never ahead of what is actually stored.
export function useCommonRoom() {
  const [answers, setAnswers] = useState<Record<string, StoredAnswer>>({})
  const [load, setLoad] = useState<LoadState>({ status: 'loading' })

  const reload = useCallback(async () => {
    setLoad({ status: 'loading' })
    try {
      const stored = await listAnswers()
      setAnswers(Object.fromEntries(stored.map((answer) => [answer.questionId, answer])))
      setLoad({ status: 'ready' })
    } catch (error) {
      setLoad({ status: 'error', message: messageOf(error) })
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const save = useCallback(async (questionId: string, text: string) => {
    const stored = await saveAnswer(questionId, text)
    setAnswers((current) => ({ ...current, [questionId]: stored }))
  }, [])

  const remove = useCallback(async (questionId: string) => {
    await deleteAnswer(questionId)
    setAnswers((current) => {
      const { [questionId]: _removed, ...rest } = current
      return rest
    })
  }, [])

  return { answers, load, reload, save, remove }
}
