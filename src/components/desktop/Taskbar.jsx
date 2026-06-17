import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import StartMenu from './StartMenu.jsx'
import ChapterNavigator from './ChapterNavigator.jsx'

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

function BookIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path d="M3 2a1 1 0 0 1 1-1h4.5A2.5 2.5 0 0 1 11 3.5V13a1 1 0 0 1-1.447.894L8 13.118l-1.553.776A1 1 0 0 1 5 13V3.5A2.5 2.5 0 0 1 7.5 1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H4z" opacity=".3"/>
      <path fillRule="evenodd" d="M5.5 1A2.5 2.5 0 0 0 3 3.5v10A2.5 2.5 0 0 0 5.5 16h5A2.5 2.5 0 0 0 13 13.5v-10A2.5 2.5 0 0 0 10.5 1h-5zM4 3.5A1.5 1.5 0 0 1 5.5 2h5A1.5 1.5 0 0 1 12 3.5v10A1.5 1.5 0 0 1 10.5 15h-5A1.5 1.5 0 0 1 4 13.5v-10z"/>
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414L2 14.414V2z"/>
    </svg>
  )
}

export default function Taskbar({ windows, onFocus }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [chapNavOpen, setChapNavOpen] = useState(false)
  const location = useLocation()

  const isLessonRoute = /^\/chapter\/[^/]+\/.+/.test(location.pathname)

  const toggleChat = () => {
    window.dispatchEvent(new CustomEvent('oc-toggle-chat'))
  }

  return (
    <>
      {menuOpen && <StartMenu onClose={() => setMenuOpen(false)} />}
      {chapNavOpen && <ChapterNavigator onClose={() => setChapNavOpen(false)} />}

      <div className="fixed bottom-0 left-0 right-0 z-[1600] h-11 flex items-center gap-1 px-2 bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl border-t border-black/[0.08] dark:border-white/[0.08]">

        {/* Start / App launcher */}
        <button
          onClick={() => setMenuOpen(m => !m)}
          title="Start"
          aria-label="Open Start Menu"
          className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all focus:outline-none flex-shrink-0 ${
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
              {!isMin && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />}
            </button>
          )
        })}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side — chapter nav + chat */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {isLessonRoute && (
            <button
              onClick={() => setChapNavOpen(o => !o)}
              title="Chapter navigator"
              aria-label="Chapter navigator"
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all focus:outline-none ${
                chapNavOpen
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookIcon />
            </button>
          )}

          <button
            onClick={toggleChat}
            title="AI Tutor"
            aria-label="Toggle AI Tutor"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none"
          >
            <ChatIcon />
          </button>
        </div>
      </div>
    </>
  )
}
