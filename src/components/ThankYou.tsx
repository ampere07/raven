import { splitChoices } from '../../shared/questionnaire'
import { drawingSeconds, FlowerDrawing } from './FlowerDrawing'
import { Sprig } from './Sprig'

export function ThankYou({ flowers }: { flowers?: string }) {
  const count = flowers ? splitChoices(flowers).length : 0

  return (
    <section className="py-8 text-center" aria-live="polite">
      {count > 0 && flowers ? (
        <FlowerDrawing flowers={flowers} className="mx-auto w-56 sm:w-64" />
      ) : (
        <Sprig className="mx-auto w-28 text-sage" />
      )}

      <p
        className="rise mt-10 font-serif text-xl italic text-rose-deep"
        style={{ animationDelay: `${drawingSeconds(count) + 0.5}s` }}
      >
        Thank you sa cooperation.
      </p>
    </section>
  )
}
