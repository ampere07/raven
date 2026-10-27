import { useEffect, useRef, useState } from 'react'
import pic from '../pic.jpg'

let leaving = false

// Called by links that are meant to take the visitor away, so they are not stopped on the way out.
export const allowLeaving = () => {
  leaving = true
}

// A page cannot see a click on the browser's own close button. All it is told is that it is about to be closed, so
// that is the moment the browser's generic "leave site?" box is requested. That box cannot carry custom words or a
// picture, so the page's own message is queued behind it and appears if the visitor chooses to stay.
export function ExitGuard() {
  const [open, setOpen] = useState(false)
  const stay = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (leaving) return
      event.preventDefault()
      event.returnValue = ''
      setOpen(true)
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  useEffect(() => {
    if (!open) return
    stay.current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/50 p-6" onClick={() => setOpen(false)}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="exit-message"
        className="rise w-full max-w-xs rounded-md bg-paper p-5 text-center shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <img src={pic} alt="" className="mx-auto max-h-72 w-full rounded-sm object-cover" />
        <p id="exit-message" className="mt-5 font-serif text-2xl">
          icclose mo talaga ????
        </p>
        <button
          ref={stay}
          type="button"
          onClick={() => setOpen(false)}
          className="mt-5 rounded-full bg-rose px-6 py-2.5 text-white transition-colors hover:bg-rose-deep"
        >
          Hindi na lang
        </button>
      </div>
    </div>
  )
}
