import { BookOpen, Loader2, RotateCw } from 'lucide-react'
import { COMMON_ROOM_COPY } from '../../../shared/commonRoom'
import type { LoadState } from '../../hooks/useCommonRoom'
import { Flourish } from './Flourish'
import { inkButton, primaryButton } from './ui'

type Props = { load: LoadState; onEnter: () => void; onRetry: () => void }

export function CommonRoomIntroduction({ load, onEnter, onRetry }: Props) {
  return (
    <section aria-labelledby="chapter-title" className="cr-parchment cr-unfurl px-6 py-10 text-center sm:px-12 sm:py-14">
      <p className="font-display text-lg tracking-[0.2em] text-burgundy/90">CHAPTER {COMMON_ROOM_COPY.number}</p>
      <h1 id="chapter-title" className="mt-3 font-display text-4xl leading-tight text-burgundy sm:text-5xl">
        Chapter {COMMON_ROOM_COPY.number}: {COMMON_ROOM_COPY.title}
      </h1>
      <Flourish className="mx-auto mt-5 w-40 text-gold" />

      <p className="mx-auto mt-5 max-w-md font-display text-xl italic leading-snug text-leather-soft">
        {COMMON_ROOM_COPY.subtitle}
      </p>
      <p className="mx-auto mt-6 max-w-md font-book text-xl leading-relaxed">{COMMON_ROOM_COPY.introduction}</p>

      <div className="mt-9">
        {load.status === 'error' ? (
          <div role="alert" className="mx-auto max-w-sm rounded-sm border border-burgundy/50 bg-burgundy/10 px-4 py-3 text-burgundy">
            <p className="font-book text-lg leading-snug">Hindi mabuksan yung libro. {load.message}</p>
            <button type="button" onClick={onRetry} className={`${inkButton} mt-3 !py-1.5`}>
              <RotateCw aria-hidden size={15} /> Subukan ulit
            </button>
          </div>
        ) : (
          <button type="button" onClick={onEnter} disabled={load.status !== 'ready'} className={`${primaryButton} !px-8 !py-3`}>
            {load.status === 'loading' ? (
              <>
                <Loader2 aria-hidden size={18} className="animate-spin" /> Binubuksan yung libro…
              </>
            ) : (
              <>
                <BookOpen aria-hidden size={18} /> {COMMON_ROOM_COPY.enter}
              </>
            )}
          </button>
        )}
      </div>

      <p className="mx-auto mt-8 max-w-md font-book text-base italic leading-snug text-leather-soft/90">
        {COMMON_ROOM_COPY.privacy}
      </p>
    </section>
  )
}
