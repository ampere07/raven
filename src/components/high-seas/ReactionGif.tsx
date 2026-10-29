import { useState } from 'react'

// Reaction GIFs from the Pirates of the Caribbean films, shown from GIPHY (they are not copied into this project).
// Each is picked by a short key, so a line of dialogue only needs to say which reaction it wants.
const REACTIONS: Record<string, { id: string; alt: string }> = {
  rum: { id: 'w7M8g9cTom0Du', alt: 'Captain Jack Sparrow asking why the rum is gone' },
  boss: { id: 'o0eOCNkn7cSD6', alt: 'Captain Jack Sparrow sailing a sinking ship like a boss' },
  hmm: { id: 'ws4pzeC916KRO', alt: 'Captain Jack Sparrow looking unimpressed' },
  salute: { id: 'EQIDJxDloq1zO', alt: 'Captain Jack Sparrow tipping his hat' },
  run: { id: 'Zhpvn5KvGEvJu', alt: 'Captain Jack Sparrow running away' },
  drink: { id: '8JCwuk8n2Y6iI', alt: 'Captain Jack Sparrow taking a drink' },
  ugh: { id: '1bYaHhGtueIqQ', alt: 'Captain Jack Sparrow wincing' },
  regret: { id: 'gDllSSJi9Knew', alt: 'Captain Jack Sparrow on his ship: I regret nothing' },
  cheers: { id: '2PmMiUc9OH4lO', alt: 'Captain Jack Sparrow with a drink and a gesture' },
}

const src = (id: string) => `https://media.giphy.com/media/${id}/giphy.gif`

type Props = { reaction: string; className?: string }

// If the GIF cannot be loaded (offline, or it was taken down) nothing is shown at all rather than a broken picture.
export function ReactionGif({ reaction, className = '' }: Props) {
  const [failed, setFailed] = useState<string | null>(null)
  const gif = REACTIONS[reaction]
  if (!gif || failed === reaction) return null

  return (
    <figure className={`cr-fade mx-auto w-full max-w-[16rem] ${className}`}>
      <img
        key={reaction}
        src={src(gif.id)}
        alt={gif.alt}
        loading="lazy"
        onError={() => setFailed(reaction)}
        className="w-full rounded-sm border border-gold/60 shadow-lg"
      />
      <figcaption className="mt-1 text-right font-book text-xs text-leather-soft/70">via GIPHY</figcaption>
    </figure>
  )
}
