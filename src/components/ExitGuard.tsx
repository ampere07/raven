import { useEffect, useRef, useState, type ReactNode } from 'react'
import pic from '../pic.jpg'

let leaving = false

// Called by links that are meant to take the visitor away, so they are not stopped on the way out.
export const allowLeaving = () => {
  leaving = true
}

type Step = 'closed' | 'sure' | 'really'

const secondary =
  'rounded-full border border-line px-6 py-2.5 text-ink-soft transition-colors hover:border-rose hover:text-rose-deep'
const primary = 'rounded-full bg-rose px-6 py-2.5 text-white transition-colors hover:bg-rose-deep'

// A page cannot see a click on the browser's own close button. All it is told is that it is about to be closed, so
// that is the moment the browser's generic "leave site?" box has to be requested: without it the tab would just
// close. That box cannot carry custom words or a picture, so the page's own messages are queued behind it and
// appear when the visitor chooses to stay.
export function ExitGuard() {
  const [step, setStep] = useState<Step>('closed')
  const stay = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (leaving) return
      event.preventDefault()
      event.returnValue = ''
      setStep('sure')
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  const keepGoing = () => setStep('closed')

  useEffect(() => {
    if (step === 'closed') return
    stay.current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && keepGoing()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  // Browsers only let a page close a tab it opened itself, so otherwise the site is replaced with a blank page.
  const closeWebsite = () => {
    allowLeaving()
    window.close()
    window.setTimeout(() => window.location.replace('about:blank'), 150)
  }

  if (step === 'closed') return null

  return (
    <Overlay onDismiss={keepGoing}>
      {step === 'sure' ? (
        <>
          <img src={pic} alt="" className="mx-auto max-h-72 w-full rounded-sm object-cover" />
          <p id="exit-message" className="mt-5 font-serif text-2xl">
            icclose mo talaga ????
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button type="button" onClick={() => setStep('really')} className={secondary}>
              Close
            </button>
            <button ref={stay} type="button" onClick={keepGoing} className={primary}>
              Hindi na lang
            </button>
          </div>
        </>
      ) : (
        <>
          <div
            role="img"
            aria-label="A sad cat looking up"
            id="exit-message"
            className="mx-auto aspect-square w-full rounded-sm bg-no-repeat"
            style={{ backgroundImage: `url(${pic})`, backgroundSize: '159% auto', backgroundPosition: '82.6% 28.3%' }}
          />
          <div className="mt-5 flex justify-center gap-3">
            <button type="button" onClick={closeWebsite} className={secondary}>
              Close
            </button>
            <button ref={stay} type="button" onClick={keepGoing} className={primary}>
              Hindi na
            </button>
          </div>
        </>
      )}
    </Overlay>
  )
}

function Overlay({ children, onDismiss }: { children: ReactNode; onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/50 p-6" onClick={onDismiss}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="exit-message"
        className="rise w-full max-w-xs rounded-md bg-paper p-5 text-center shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
