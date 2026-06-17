import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import StartMenu from './StartMenu.jsx'
import ChapterNavigator from './ChapterNavigator.jsx'
import PinsNotesPopup from './PinsNotesPopup.jsx'

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

function PinIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182a.5.5 0 0 1-.707-.707l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"/>
    </svg>
  )
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h9.586a1 1 0 0 0 .707-.293l3.414-3.414A1 1 0 0 0 16 10.586V2a1 1 0 0 0-1-1H2zm10 12.293V11h2.293L12 13.293zM4 4.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z"/>
    </svg>
  )
}

function TutorIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden>
      <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 2a5 5 0 1 1 0 10A5 5 0 0 1 8 3zm-.5 7.5v1h1v-1h-1zm.47-4.98c-.83 0-1.47.59-1.47 1.4h1c0-.27.21-.46.47-.46s.47.19.47.46c0 .22-.09.34-.44.58C7.5 7.73 7 8.17 7 9h1c0-.5.28-.73.7-1.01.43-.28.77-.63.77-1.27 0-.81-.64-1.2-1.5-1.2z"/>
    </svg>
  )
}

export default function Taskbar({ windows, onFocus }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [chapNavOpen, setChapNavOpen] = useState(false)
  const [pinsNotesOpen, setPinsNotesOpen] = useState(null) // 'pins' | 'notes' | null
  const location = useLocation()

  const isLessonRoute = /^\/chapter\/[^/]+\/.+/.test(location.pathname)

  const toggleChat = () => window.dispatchEvent(new CustomEvent('oc-toggle-chat'))
  const toggleTutor = () => window.dispatchEvent(new CustomEvent('oc-toggle-tutor'))

  return (
    <>
      {menuOpen && <StartMenu onClose={() => setMenuOpen(false)} />}
      {chapNavOpen && <ChapterNavigator onClose={() => setChapNavOpen(false)} />}
      {pinsNotesOpen && <PinsNotesPopup initialTab={pinsNotesOpen} onClose={() => setPinsNotesOpen(null)} />}

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

        {/* Right side */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {isLessonRoute && (
            <button
              onClick={() => { setChapNavOpen(o => !o); setPinsNotesOpen(null) }}
              title="Chapter navigator"
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all focus:outline-none ${
                chapNavOpen ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookIcon />
            </button>
          )}

          <button
            onClick={() => { setPinsNotesOpen(p => p === 'pins' ? null : 'pins'); setChapNavOpen(false) }}
            title="Pins"
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all focus:outline-none ${
              pinsNotesOpen === 'pins' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <PinIcon />
          </button>

          <button
            onClick={() => { setPinsNotesOpen(p => p === 'notes' ? null : 'notes'); setChapNavOpen(false) }}
            title="Notes"
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all focus:outline-none ${
              pinsNotesOpen === 'notes' ? 'bg-amber-400 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <NoteIcon />
          </button>

          <button
            onClick={toggleTutor}
            title="STEM Tutor"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none"
          >
            <TutorIcon />
          </button>
          <button
            onClick={toggleChat}
            title="Study Chat"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none"
          >
            <ChatIcon />
          </button>
        </div>
      </div>
    </>
  )
}
