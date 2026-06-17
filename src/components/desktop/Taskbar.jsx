import { useState } from 'react'
import StartMenu from './StartMenu.jsx'

function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden>
      <rect x="1" y="1" width="6" height="6" rx="1.2" />
      <rect x="9" y="1" width="6" height="6" rx="1.2" />
      <rect x="1" y="9" width="6" height="6" rx="1.2" />
      <rect x="9" y="9" width="6" height="6" rx="1.2" />
    </svg>
  )
}

export default function Taskbar({ windows, onFocus, onClose }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {menuOpen && <StartMenu onClose={() => setMenuOpen(false)} />}

      <div className="fixed bottom-0 left-0 right-0 z-[1600] h-11 flex items-center gap-1 px-2 bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl border-t border-black/[0.08] dark:border-white/[0.08]">
        {/* Start / App launcher button */}
        <button
          onClick={() => setMenuOpen(m => !m)}
          title="Start"
          aria-label="Open Start Menu"
          className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all focus:outline-none ${
            menuOpen
              ? 'bg-indigo-500 text-white shadow-md'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GridIcon />
        </button>

        {windows.length > 0 && (
          <div className="w-px h-5 bg-black/[0.1] dark:bg-white/[0.1] mx-0.5 flex-shrink-0" />
        )}

        {/* Open window pills */}
        {windows.map(win => {
          const isMin = win.state === 'minimized'
          return (
            <button
              key={win.id}
              onClick={() => onFocus(win.id)}
              title={win.label}
              className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium transition-all max-w-[160px] focus:outline-none border ${
                isMin
                  ? 'text-slate-500 dark:text-slate-400 bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 border-black/[0.07] dark:border-white/[0.08] shadow-sm'
              }`}
            >
              {win.emoji && <span className="text-sm leading-none flex-shrink-0">{win.emoji}</span>}
              <span className="truncate leading-none">{win.label}</span>
              {!isMin && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}
