import { ChevronDown, X } from 'lucide-react'
import { useId, useState, type KeyboardEvent } from 'react'
import { joinChoices, splitChoices } from '../../shared/questionnaire'

type Props = {
  labelledBy: string
  options: readonly string[]
  value: string
  max: number
  exclusive?: string
  onChange: (value: string) => void
  onEnter: () => void
}

export function MultiCombobox({ labelledBy, options, value, max, exclusive, onChange, onEnter }: Props) {
  const listId = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const selected = splitChoices(value)
  const full = selected.length >= max
  const needle = query.trim().toLowerCase()
  const matches = options.filter(
    (option) => !selected.includes(option) && (!needle || option.toLowerCase().includes(needle)),
  )

  const commit = (choices: string[]) => onChange(joinChoices(choices))

  const add = (option: string) => {
    const kept = option === exclusive ? [] : selected.filter((choice) => choice !== exclusive)
    const next = [...kept, option].slice(0, max)
    commit(next)
    setQuery('')
    setActive(0)
    if (next.length >= max || option === exclusive) setOpen(false)
  }

  const remove = (option: string) => commit(selected.filter((choice) => choice !== option))

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setOpen(true)
        setActive((current) => Math.min(current + 1, matches.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActive((current) => Math.max(current - 1, 0))
        break
      case 'Enter':
        event.preventDefault()
        if (open && !full && matches[active]) add(matches[active])
        else onEnter()
        break
      case 'Escape':
        setOpen(false)
        break
      case 'Backspace':
        if (!query && selected.length > 0) remove(selected[selected.length - 1])
        break
    }
  }

  return (
    <div className="mt-8">
      {selected.length > 0 && (
        <ul className="mb-5 flex flex-wrap gap-2" aria-label="Your picks">
          {selected.map((choice) => (
            <li key={choice}>
              <button
                type="button"
                onClick={() => remove(choice)}
                aria-label={`Remove ${choice}`}
                className="inline-flex items-center gap-2 rounded-full border border-sage bg-sage-soft/70 py-1.5 pl-4 pr-3 text-sm text-ink transition-colors hover:border-rose hover:bg-blush/60"
              >
                {choice}
                <X aria-hidden size={14} className="text-ink-soft" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <input
          type="text"
          role="combobox"
          autoFocus
          autoComplete="off"
          disabled={full}
          aria-labelledby={labelledBy}
          aria-expanded={open && !full}
          aria-controls={listId}
          aria-activedescendant={open && !full && matches[active] ? `${listId}-${active}` : undefined}
          placeholder={full ? `Naka-${max} na. Tanggalin muna ang isa para magpalit.` : 'Search or choose…'}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
            setActive(0)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setOpen(false)
            setQuery('')
          }}
          onKeyDown={handleKeyDown}
          className="w-full border-0 border-b border-line bg-transparent pb-3 pr-8 font-serif text-2xl text-ink transition-colors placeholder:italic placeholder:text-ink-soft/40 focus:border-rose disabled:cursor-not-allowed disabled:placeholder:text-sm"
        />
        <ChevronDown
          aria-hidden
          size={18}
          className={`pointer-events-none absolute right-1 top-2 text-ink-soft transition-transform duration-300 ${open && !full ? 'rotate-180' : ''}`}
        />

        {open && !full && (
          <ul
            id={listId}
            role="listbox"
            aria-labelledby={labelledBy}
            className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-line bg-paper py-1 shadow-sm"
          >
            {matches.length === 0 && <li className="px-4 py-3 text-sm italic text-ink-soft">Nothing matches that</li>}
            {matches.map((option, position) => (
              <li
                key={option}
                id={`${listId}-${position}`}
                role="option"
                aria-selected={false}
                onMouseDown={(event) => {
                  event.preventDefault()
                  add(option)
                }}
                onMouseEnter={() => setActive(position)}
                className={`cursor-pointer px-4 py-2.5 ${position === active ? 'bg-cream' : ''}`}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-3 text-xs text-ink-soft" aria-live="polite">
        {selected.length} of {max}
      </p>
    </div>
  )
}
