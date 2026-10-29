import type { ReactNode } from 'react'

// Every Chapter III page is written on this: ragged paper between two wooden dowels. The Chapter II page components
// inside it keep their own layout; the stylesheet strips their parchment so the scroll shows through.
export function SeaScroll({ children }: { children: ReactNode }) {
  return (
    <div className="sea-scroll">
      <span className="sea-roll top" aria-hidden />
      <div className="sea-unroll">
        <div>
          <div className="sea-paper">{children}</div>
        </div>
      </div>
      <span className="sea-roll bottom" aria-hidden />
    </div>
  )
}
