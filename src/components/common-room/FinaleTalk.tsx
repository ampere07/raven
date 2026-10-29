import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import type { FinaleBeat } from '../../../shared/commonRoom'
import { ReactionGif } from '../high-seas/ReactionGif'
import { SpeechBubble } from './SpeechBubble'
import { primaryButton } from './ui'

type Props = { heroName: string; conversation: readonly FinaleBeat[]; onFinished: () => void }

// The talk after the rescue. Each beat is one of the hero's lines; if it has choices she picks a reply and he answers it
// before the next beat. Nothing she picks is stored.
export function FinaleTalk({ heroName, conversation, onFinished }: Props) {
  const [beat, setBeat] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)

  const current = conversation[beat]
  const chosen = picked !== null ? current.choices?.[picked] : undefined
  const lastBeat = beat === conversation.length - 1
  const waitingForChoice = Boolean(current.choices) && picked === null
  const advance = () => {
    if (lastBeat) return onFinished()
    setBeat(beat + 1)
    setPicked(null)
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      {chosen && (
        <p key={`you-${beat}`} className="cr-fade font-book text-lg italic text-leather-soft">
          Ikaw: “{chosen.label}”
        </p>
      )}
      <SpeechBubble
        key={`${beat}-${picked}`}
        name={heroName}
        className={`cr-fade w-full max-w-xs ${current.punch && picked === null ? 'cr-punch' : ''}`}
      >
        {chosen ? chosen.answer : current.say}
      </SpeechBubble>
      {(chosen?.gif ?? current.gif) && (
        <ReactionGif key={`gif-${beat}-${picked}`} reaction={(chosen?.gif ?? current.gif) as string} />
      )}

      {waitingForChoice ? (
        <div className="cr-fade flex flex-wrap justify-center gap-3">
          {current.choices?.map((option, index) => (
            <button key={option.label} type="button" onClick={() => setPicked(index)} className={primaryButton}>
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <button type="button" onClick={advance} className={`${primaryButton} cr-fade !px-8`} autoFocus>
          {lastBeat ? 'Tuloy' : 'Susunod'} <ArrowRight aria-hidden size={16} />
        </button>
      )}
    </div>
  )
}
