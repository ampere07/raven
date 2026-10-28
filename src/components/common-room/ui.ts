// Button and text styles shared across the Common Room. Corners stay nearly square, like cut paper and leather.
const button =
  'inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 font-book text-lg transition-colors disabled:cursor-not-allowed disabled:opacity-45'

export const primaryButton = `${button} border border-gold bg-burgundy tracking-wide text-parchment shadow-sm hover:bg-burgundy-deep`

// For use on parchment.
export const inkButton = `${button} border border-leather-soft/50 text-leather-soft hover:border-burgundy hover:text-burgundy`

// For use on the dark wood.
export const goldButton = `${button} border border-gold/70 text-gold-soft hover:bg-gold/10`

export const textButton =
  'py-2.5 font-book text-base text-leather-soft underline decoration-leather-soft/40 underline-offset-4 transition-colors hover:text-burgundy disabled:opacity-45'
