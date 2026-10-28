import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { splitChoices } from '../../shared/questionnaire'
import { hrefFor } from '../utils/route'
import { allowLeaving } from './ExitGuard'
import { drawingSeconds, FlowerDrawing } from './FlowerDrawing'
import { Sprig } from './Sprig'

const MESSENGER_URL = 'https://m.me/RavenRav07'

export function ThankYou({ flowers }: { flowers?: string }) {
  const count = flowers ? splitChoices(flowers).length : 0
  const noteDelay = drawingSeconds(count) + 0.5
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), (noteDelay + 0.8) * 1000)
    return () => window.clearTimeout(timer)
  }, [noteDelay])

  return (
    <section className="py-8 text-center" aria-live="polite">
      {count > 0 && flowers ? (
        <FlowerDrawing flowers={flowers} className="mx-auto w-56 sm:w-64" />
      ) : (
        <Sprig className="mx-auto w-28 text-sage" />
      )}

      <p className="rise mt-10 font-serif text-xl italic text-rose-deep" style={{ animationDelay: `${noteDelay}s` }}>
        Thank you sa cooperation.
      </p>

      {ready && (
        <div className="rise mt-10 flex flex-col items-center gap-4">
          <a
            href={MESSENGER_URL}
            onClick={allowLeaving}
            className="inline-flex items-center gap-2 rounded-full bg-rose px-7 py-3 text-white transition-colors hover:bg-rose-deep"
          >
            Next <ArrowRight aria-hidden size={16} />
          </a>
          <a
            href={hrefFor('common-room')}
            className="text-sm text-rose-deep underline underline-offset-4 transition-colors hover:text-ink"
          >
            Chapter II: The Common Room
          </a>
        </div>
      )}
    </section>
  )
}
