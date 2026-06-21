import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import StartMenu from './StartMenu.jsx'
import ChapterNavigator from './ChapterNavigator.jsx'
import PinsNotesPopup from './PinsNotesPopup.jsx'
import { useDesktop } from './DesktopProvider.jsx'
import ReportBugButton from '../ui/ReportBugButton.jsx'

const PINNED_APPS = [
  {
    id: 'rpg-workout', label: 'RPG Workout', emoji: '⚔️',
    loader: () => import('../../features/rpg/RPGWorkoutPage.jsx').then(m => m.default),
  },
  {
    id: 'brain', label: 'Brain Training', emoji: '🧠',
    loader: () => import('../../features/brain/BrainPage.jsx').then(m => m.default),
  },
]
import { LayoutGrid, BookOpen, MessageSquare, Pin, StickyNote, GraduationCap, Compass } from 'lucide-react'

export default function Taskbar({ windows, onFocus }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [chapNavOpen, setChapNavOpen] = useState(false)
  const [pinsNotesOpen, setPinsNotesOpen] = useState(null) // 'pins' | 'notes' | null
  const location = useLocation()
  const navigate = useNavigate()
  const { openWindow } = useDesktop()
  const isCompassActive = location.pathname.startsWith('/compass')

  const isLessonRoute = /^\/chapter\/[^/]+\/.+/.test(location.pathname)

  const toggleChat = () => window.dispatchEvent(new CustomEvent('oc-toggle-chat'))
  const toggleTutor = () => window.dispatchEvent(new CustomEvent('oc-toggle-tutor'))

  const openPinnedApp = async (app) => {
    const Component = await app.loader()
    openWindow({ id: app.id, label: app.label, emoji: app.emoji, Component, backTo: '/' })
  }

  return (
    <>
      {menuOpen && <StartMenu onClose={() => setMenuOpen(false)} />}
      {chapNavOpen && <ChapterNavigator onClose={() => setChapNavOpen(false)} />}
      {pinsNotesOpen && <PinsNotesPopup initialTab={pinsNotesOpen} onClose={() => setPinsNotesOpen(null)} />}

      <div className="hidden lg:flex fixed bottom-0 left-0 right-0 z-[1600] h-12 items-center gap-2 px-3 bg-white/70 dark:bg-slate-950/70 backdrop-blur-3xl border-t border-slate-200/50 dark:border-slate-800/50 shadow-[0_-4px_30px_rgba(0,0,0,0.03)]">

        {/* Start / App launcher */}
        <motion.button
          data-tour="start-menu"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMenuOpen(m => !m)}
          title="Start"
          aria-label="Open Start Menu"
          className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all focus:outline-none flex-shrink-0 ${
            menuOpen
              ? 'bg-brand-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
              : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
        </motion.button>

        {/* Pinned apps */}
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/50 mx-1 flex-shrink-0 rounded-full" />
        {PINNED_APPS.map(app => (
          <motion.button
            key={app.id}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => openPinnedApp(app)}
            title={app.label}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-transparent hover:bg-white dark:hover:bg-slate-800 transition-colors focus:outline-none text-xl flex-shrink-0 shadow-sm hover:shadow-md border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            {app.emoji}
          </motion.button>
        ))}

        {windows.length > 0 && (
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/50 mx-1 flex-shrink-0 rounded-full" />
        )}

        {/* Open window pills */}
        {windows.map(win => {
          const isMin = win.state === 'minimized'
          return (
            <motion.button
              key={win.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onFocus(win.id)}
              title={win.label}
              className={`flex items-center gap-2 px-3 h-9 rounded-xl text-xs font-semibold transition-all max-w-[180px] focus:outline-none border ${
                isMin
                  ? 'text-slate-500 dark:text-slate-400 bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border-slate-200/50 dark:border-slate-700/50 shadow-sm'
              }`}
            >
              {win.emoji && <span className="text-base leading-none flex-shrink-0">{win.emoji}</span>}
              <span className="truncate leading-none tracking-tight">{win.label}</span>
              {!isMin && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 shadow-[0_0_5px_rgba(99,102,241,0.5)]" />}
            </motion.button>
          )
        })}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side utilities */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isLessonRoute && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setChapNavOpen(o => !o); setPinsNotesOpen(null) }}
              title="Chapter navigator"
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all focus:outline-none ${
                chapNavOpen ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-5 h-5" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setPinsNotesOpen(p => p === 'pins' ? null : 'pins'); setChapNavOpen(false) }}
            title="Pins"
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all focus:outline-none ${
              pinsNotesOpen === 'pins' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Pin className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setPinsNotesOpen(p => p === 'notes' ? null : 'notes'); setChapNavOpen(false) }}
            title="Notes"
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all focus:outline-none ${
              pinsNotesOpen === 'notes' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            <StickyNote className="w-5 h-5" />
          </motion.button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/50 mx-1 flex-shrink-0 rounded-full" />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/compass')}
            title="Compass"
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all focus:outline-none ${
              isCompassActive ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400'
            }`}
          >
            <Compass className="w-5 h-5" />
          </motion.button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/50 mx-1 flex-shrink-0 rounded-full" />

          <ReportBugButton iconOnly data-tour="report-bug" />

          <motion.button
            data-tour="stem-tutor"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTutor}
            title="Delta — your STEM tutor"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none"
          >
            <GraduationCap className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleChat}
            title="Study Chat"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400 transition-colors focus:outline-none"
          >
            <MessageSquare className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </>
  )
}
