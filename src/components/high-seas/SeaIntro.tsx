import { Anchor, Loader2, RotateCw } from 'lucide-react'
import { HIGH_SEAS_COPY } from '../../../shared/highSeas'
import type { LoadState } from '../../hooks/useCommonRoom'
import { inkButton, primaryButton } from '../common-room/ui'
import { SeaScroll } from './SeaScroll'

type Props = { load: LoadState; onEnter: () => void; onRetry: () => void }

function SkullAndBones() {
  return (
    <span className="sea-bones" aria-hidden>
      <svg viewBox="0 0 64 56" width="46" height="40" fill="currentColor">
        <path d="M6 6 L14 4 L34 24 L30 30 Z M58 6 L50 4 L30 24 L34 30 Z M6 50 L14 52 L34 32 L30 26 Z M58 50 L50 52 L30 32 L34 26 Z" opacity=".85" />
        <path d="M32 8c-9.4 0-16 6-16 14 0 5 2.4 8.4 6 10.6V38h20v-5.4c3.6-2.2 6-5.6 6-10.6 0-8-6.600-14-16-14Z" stroke="#e8d3a0" strokeWidth="1.6" />
        <circle cx="25.500" cy="23" r="3.800" fill="#e8d3a0" />
        <circle cx="38.500" cy="23" r="3.800" fill="#e8d3a0" />
        <path d="M32 27l-2.200 4h4.400Z" fill="#e8d3a0" />
        <path d="M27 38v-3.500M32 38v-3.500M37 38v-3.500" stroke="#e8d3a0" strokeWidth="1.600" />
      </svg>
    </span>
  )
}

export function SeaIntro({ load, onEnter, onRetry }: Props) {
  return (
    <SeaScroll>
      <section aria-labelledby="chapter-title" className="px-8 pb-12 pt-14 text-center sm:px-14">
        <p className="font-display text-lg tracking-[0.25em] text-[#6b1f2a]">CHAPTER {HIGH_SEAS_COPY.number}</p>
        <h1 id="chapter-title" className="mt-3 font-display text-4xl leading-tight text-[#3a2410] sm:text-5xl">
          Chapter {HIGH_SEAS_COPY.number}: {HIGH_SEAS_COPY.title}
        </h1>
        <div className="mt-5">
          <SkullAndBones />
        </div>

        <p className="mx-auto mt-5 max-w-md font-display text-xl italic leading-snug text-[#5a3a1c]">
          {HIGH_SEAS_COPY.subtitle}
        </p>

        <div className="mt-9">
          {load.status === 'error' ? (
            <div role="alert" className="mx-auto max-w-sm rounded-sm border border-burgundy/50 bg-burgundy/10 px-4 py-3 text-burgundy">
              <p className="font-book text-lg leading-snug">Hindi mabuksan yung mapa. {load.message}</p>
              <button type="button" onClick={onRetry} className={`${inkButton} mt-3 !py-1.5`}>
                <RotateCw aria-hidden size={15} /> Subukan ulit
              </button>
            </div>
          ) : (
            <button type="button" onClick={onEnter} disabled={load.status !== 'ready'} className={`${primaryButton} !px-8 !py-3`}>
              {load.status === 'loading' ? (
                <>
                  <Loader2 aria-hidden size={18} className="animate-spin" /> Binubuksan yung mapa…
                </>
              ) : (
                <>
                  <Anchor aria-hidden size={18} /> {HIGH_SEAS_COPY.enter}
                </>
              )}
            </button>
          )}
        </div>

        <p className="mx-auto mt-8 max-w-md font-book text-base italic leading-snug text-[#5a3a1c]/90">
          {HIGH_SEAS_COPY.privacy}
        </p>
      </section>
    </SeaScroll>
  )
}
