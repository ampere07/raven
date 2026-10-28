import { Check, Loader2, RotateCw } from 'lucide-react'
import { useId, useState, type KeyboardEvent } from 'react'
import { ANSWER_LIMIT, type StoredAnswer } from '../../../shared/commonRoom'
import { inkButton, primaryButton, textButton } from './ui'

type Action = 'save' | 'delete'
type Status =
  | { kind: 'idle' }
  | { kind: 'working'; action: Action }
  | { kind: 'done'; action: Action }
  | { kind: 'failed'; action: Action; message: string }

type Props = {
  saved?: StoredAnswer
  draft: string
  onDraftChange: (text: string) => void
  /** Resolve only once the answer is really stored; reject with an Error if it is not. */
  onSave: (text: string) => Promise<void>
  onDelete: () => Promise<void>
}

export function AnswerForm({ saved, draft, onDraftChange, onSave, onDelete }: Props) {
  const fieldId = useId()
  const statusId = useId()
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [confirming, setConfirming] = useState(false)

  const text = draft.trim()
  const unchanged = text === (saved?.answer ?? '')
  const working = status.kind === 'working'
  const canSave = text.length > 0 && !unchanged && !working

  const run = async (action: Action, work: () => Promise<void>) => {
    setStatus({ kind: 'working', action })
    try {
      await work()
      setStatus({ kind: 'done', action })
      setConfirming(false)
    } catch (error) {
      setStatus({ kind: 'failed', action, message: error instanceof Error ? error.message : 'Something went wrong.' })
    }
  }

  const save = () => run('save', () => onSave(text))
  const remove = () => run('delete', onDelete)

  const edit = (value: string) => {
    onDraftChange(value)
    if (status.kind !== 'working') setStatus({ kind: 'idle' })
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && canSave) {
      event.preventDefault()
      void save()
    }
  }

  return (
    <div>
      <label htmlFor={fieldId} className="font-book text-base uppercase tracking-[0.18em] text-leather-soft">
        Your answer
      </label>
      <textarea
        id={fieldId}
        rows={4}
        maxLength={ANSWER_LIMIT}
        value={draft}
        onChange={(event) => edit(event.target.value)}
        onKeyDown={onKeyDown}
        aria-describedby={statusId}
        placeholder="Write a few words, or leave it for later…"
        className="mt-2 w-full resize-none rounded-sm border border-leather-soft/40 bg-parchment/50 px-3 py-2.5 font-book text-xl leading-snug text-leather transition-colors placeholder:italic placeholder:text-leather-soft/60 focus:border-burgundy focus:bg-parchment/70"
      />

      <div className="mt-2 flex items-start justify-between gap-4">
        <div id={statusId} aria-live="polite" className="min-h-6 font-book text-base">
          <StatusLine status={status} saved={Boolean(saved)} unchanged={unchanged} empty={text.length === 0} />
        </div>
        <span aria-hidden className="shrink-0 font-book text-sm text-leather-soft/70">
          {draft.length} / {ANSWER_LIMIT}
        </span>
      </div>

      {status.kind === 'failed' && (
        <div role="alert" className="mt-3 rounded-sm border border-burgundy/50 bg-burgundy/10 px-4 py-3 text-burgundy">
          <p className="font-book text-lg leading-snug">
            {status.action === 'save' ? 'That answer could not be saved.' : 'That answer could not be deleted.'}{' '}
            {status.message}
          </p>
          <button type="button" onClick={status.action === 'save' ? save : remove} className={`${inkButton} mt-3 !py-1.5`}>
            <RotateCw aria-hidden size={15} /> Try again
          </button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="button" onClick={save} disabled={!canSave} className={primaryButton}>
          {working && status.action === 'save' ? <Loader2 aria-hidden size={16} className="animate-spin" /> : null}
          Save Answer
        </button>

        {saved && !confirming && (
          <button type="button" onClick={() => setConfirming(true)} disabled={working} className={textButton}>
            Delete answer
          </button>
        )}
        {saved && confirming && (
          <span className="flex flex-wrap items-center gap-3 font-book text-lg text-burgundy">
            Delete this answer?
            <button type="button" onClick={remove} disabled={working} className={`${inkButton} !py-1.5`}>
              {working && status.action === 'delete' ? <Loader2 aria-hidden size={15} className="animate-spin" /> : null}
              Yes, delete it
            </button>
            <button type="button" onClick={() => setConfirming(false)} disabled={working} className={textButton}>
              Keep it
            </button>
          </span>
        )}
      </div>
    </div>
  )
}

type LineProps = { status: Status; saved: boolean; unchanged: boolean; empty: boolean }

// One quiet line saying where this answer stands. A success is only ever shown after the server confirmed it.
function StatusLine({ status, saved, unchanged, empty }: LineProps) {
  if (status.kind === 'working') {
    return <span className="italic text-leather-soft">{status.action === 'save' ? 'Writing it down…' : 'Removing it…'}</span>
  }
  if (status.kind === 'failed') return null
  if (status.kind === 'done' && unchanged) {
    return (
      <span className="inline-flex items-center gap-1.5 text-forest">
        <Check aria-hidden size={16} /> {status.action === 'save' ? 'Answer saved.' : 'Answer deleted.'}
      </span>
    )
  }
  if (!unchanged) {
    if (empty) return <span className="italic text-leather-soft">To remove this answer, use “Delete answer”.</span>
    return <span className="italic text-leather-soft">{saved ? 'Changes not saved yet.' : 'Not saved yet.'}</span>
  }
  if (saved) return <span className="text-leather-soft">You have answered this one.</span>
  return <span className="italic text-leather-soft/80">Not answered yet.</span>
}
