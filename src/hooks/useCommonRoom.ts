import { useCallback, useEffect, useState } from 'react'
import type { StoredAnswer } from '../../shared/commonRoom'
import { deleteAnswer, listAnswers, saveAnswer } from '../services/commonRoom'

export type LoadState = { status: 'loading' } | { status: 'ready' } | { status: 'error'; message: string }

const messageOf = (error: unknown) => (error instanceof Error ? error.message : 'May nangyaring mali.')

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

  // Sends everything that differs from what is stored: new or changed text is saved, a cleared answer is removed.
  // Every change is attempted even if one fails, and the first failure is reported.
  const commit = useCallback(
    async (texts: Readonly<Record<string, string>>) => {
      const work = Object.entries(texts)
        .filter(([questionId, text]) => text !== (answers[questionId]?.answer ?? ''))
        .map(([questionId, text]) => (text ? save(questionId, text) : remove(questionId)))
      const results = await Promise.allSettled(work)
      const failed = results.find((result) => result.status === 'rejected')
      if (failed) throw failed.reason
    },
    [answers, save, remove],
  )

  return { answers, load, reload, commit }
}
