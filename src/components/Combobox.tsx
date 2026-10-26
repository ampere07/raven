import { ChevronDown } from 'lucide-react'
import { useId, useState, type KeyboardEvent } from 'react'

type Props = {
  labelledBy: string
  options: readonly string[]
  value: string
  onChange: (value: string) => void
  onEnter: () => void
}

export function Combobox({ labelledBy, options, value, onChange, onEnter }: Props) {
  const listId = useId()
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const needle = query.trim().toLowerCase()
  const matches = needle ? options.filter((option) => option.toLowerCase().includes(needle)) : options

  const choose = (option: string) => {
    setQuery(option)
    setOpen(false)
    onChange(option)
  }

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
        if (open && matches[active]) choose(matches[active])
        else onEnter()
        break
      case 'Escape':
        setOpen(false)
        break
    }
  }

  return (
    <div className="relative mt-8">
      <input
        type="text"
        role="combobox"
        autoFocus
        autoComplete="off"
        aria-labelledby={labelledBy}
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && matches[active] ? `${listId}-${active}` : undefined}
        placeholder="Search or choose…"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
          setActive(0)
          if (value) onChange('')
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setOpen(false)
          if (!value) setQuery('')
        }}
        onKeyDown={handleKeyDown}
        className="w-full border-0 border-b border-line bg-transparent pb-3 pr-8 font-serif text-2xl text-ink transition-colors placeholder:italic placeholder:text-ink-soft/40 focus:border-rose"
      />
      <ChevronDown
        aria-hidden
        size={18}
        className={`pointer-events-none absolute right-1 top-2 text-ink-soft transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      />

      {open && (
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
              aria-selected={option === value}
              onMouseDown={(event) => {
                event.preventDefault()
                choose(option)
              }}
              onMouseEnter={() => setActive(position)}
              className={`cursor-pointer px-4 py-2.5 ${position === active ? 'bg-cream' : ''} ${option === value ? 'text-rose-deep' : ''}`}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
