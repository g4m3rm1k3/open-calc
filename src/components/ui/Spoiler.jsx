import { useState } from 'react'

export default function Spoiler({ label = 'Show', children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="my-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors group"
      >
        <span className={`transition-transform ${open ? 'rotate-90' : ''} text-lg leading-none`}>▶</span>
        <span>{open ? label.replace(/^Show/, 'Hide') : label}</span>
      </button>
      {open && (
        <div className="mt-3 pl-4 border-l-2 border-brand-200 dark:border-brand-800 animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  )
}
