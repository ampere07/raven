import { Sparkles } from 'lucide-react'
import { COMMON_ROOM_COPY } from '../../../shared/commonRoom'

// A gentle thought for the conversation. It is only ever read, never stored, and stays folded away until asked for.
export function FollowUpPrompt({ prompt }: { prompt: string }) {
  return (
    <details className="mt-7 border-t border-leather/20 pt-4">
      <summary className="inline-flex items-center gap-2 font-display text-lg text-forest transition-colors hover:text-burgundy">
        <Sparkles aria-hidden size={16} />
        {COMMON_ROOM_COPY.moreMagic}
      </summary>
      <p className="cr-reveal mt-3 font-book text-lg italic leading-snug text-leather-soft">{prompt}</p>
    </details>
  )
}
