import { lazy, Suspense, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import StartMenu from './StartMenu.jsx'
import ChapterNavigator from './ChapterNavigator.jsx'
import NotesListWindow from '../ui/NotesListWindow.jsx'
import { useDesktop } from './DesktopProvider.jsx'
import { useMontyContext } from '../../features/compass/MontyContext.tsx'
import { useProgress } from '../../hooks/useProgress.js'
import { computeXp, xpToLevel } from '../../features/compass/montyStatus.ts'

// RPG Workout and Brain Training are tall, scrollable content pages — not
// fixed-size games/labs — so they route to their own dedicated pages instead
// of opening through the floating-window manager. FloatingWindow's content
// area uses `overflow-hidden` with no scroll, which is correct for canvas
// games but silently clips/cuts off anything taller than the window.
const PINNED_APPS = [
  { id: 'rpg-workout', label: 'RPG Workout', emoji: '⚔️', route: '/rpg-workout' },
  { id: 'brain', label: 'Brain Training', emoji: '🧠', route: '/brain' },
]
import { LayoutGrid, Command, BookOpen, MessageSquare, StickyNote, GraduationCap, Zap, Lightbulb, Dumbbell } from 'lucide-react'

// Lazy-loaded: each pulls in its own markdown library (concepts/practice
// content + parsing) as a separate chunk, so the always-mounted desktop
// shell doesn't ship or eagerly parse that content until actually opened.
const ConceptExplorerModal = lazy(() => import('../../concepts/ConceptExplorerModal.tsx'))
const PracticeExplorerModal = lazy(() => import('../../practice/PracticeExplorerModal.tsx'))

export default function Taskbar({ windows, onFocus }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [chapNavOpen, setChapNavOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [conceptExplorerOpen, setConceptExplorerOpen] = useState(false)
  const [practiceOpen, setPracticeOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { openWindow } = useDesktop()
  const monty = useMontyContext()
  const { progress } = useProgress()
  const { level, xpInLevel } = xpToLevel(computeXp(progress))


  const isLessonRoute = /^\/chapter\/[^/]+\/.+/.test(location.pathname)

  const toggleChat = () => window.dispatchEvent(new CustomEvent('oc-toggle-chat'))
  const toggleTutor = () => window.dispatchEvent(new CustomEvent('oc-toggle-tutor'))

  const openPinnedApp = async (app) => {
    if (app.route) { navigate(app.route); return }
    const Component = await app.loader()
    openWindow({ id: app.id, label: app.label, emoji: app.emoji, Component, backTo: '/' })
  }

  return (
    <>
      {menuOpen && <StartMenu onClose={() => setMenuOpen(false)} />}
      {chapNavOpen && <ChapterNavigator onClose={() => setChapNavOpen(false)} />}
      {notesOpen && <NotesListWindow onClose={() => setNotesOpen(false)} />}
      <AnimatePresence>
        {conceptExplorerOpen && (
          <Suspense fallback={null}>
            <ConceptExplorerModal onClose={() => setConceptExplorerOpen(false)} />
          </Suspense>
        )}
        {practiceOpen && (
          <Suspense fallback={null}>
            <PracticeExplorerModal onClose={() => setPracticeOpen(false)} />
          </Suspense>
        )}
      </AnimatePresence>

      <div className="hidden lg:flex fixed bottom-0 left-0 right-0 z-[1600] h-12 items-center gap-2 px-3 bg-white/70 dark:bg-slate-950/70 backdrop-blur-3xl border-t border-slate-200/50 dark:border-slate-800/50 shadow-[0_-4px_30px_rgba(0,0,0,0.03)]">

        {/* Start / App launcher */}
        <motion.button
          data-tour="start-menu"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMenuOpen(m => !m)}
          title="Start"
          aria-label="Open Start Menu"
          className={`relative flex items-center justify-center w-10 h-10 rounded-[12px] transition-all focus:outline-none flex-shrink-0 border border-white/30 dark:border-white/20 ${
            menuOpen
              ? 'bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 text-white shadow-[0_0_30px_rgba(99,102,241,0.8)]'
              : 'bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-500 text-white shadow-[0_6px_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] hover:from-cyan-400 hover:via-indigo-400 hover:to-purple-400'
          }`}
        >
          {/* Inner glass highlight */}
          <div className="absolute inset-0 rounded-[12px] bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
          <Command className="w-[20px] h-[20px] relative z-10" />
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
              onClick={() => setChapNavOpen(o => !o)}
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
            onClick={() => setConceptExplorerOpen(o => !o)}
            title="Concept Explorer"
            className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all focus:outline-none overflow-hidden group ${
              conceptExplorerOpen 
                ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/40 ring-1 ring-amber-400/50' 
                : 'bg-amber-500/10 text-amber-500 dark:text-amber-400/80 hover:bg-amber-500/20 hover:text-amber-500 dark:hover:text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.1)] hover:shadow-[0_0_12px_rgba(245,158,11,0.2)]'
            }`}
          >
            {conceptExplorerOpen && <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}
            <Lightbulb className={`w-5 h-5 relative z-10 transition-all ${conceptExplorerOpen ? 'drop-shadow-sm' : 'drop-shadow-[0_0_2px_rgba(245,158,11,0.6)]'}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPracticeOpen(o => !o)}
            title="Practice"
            className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all focus:outline-none overflow-hidden group ${
              practiceOpen
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/40 ring-1 ring-emerald-400/50'
                : 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400/80 hover:bg-emerald-500/20 hover:text-emerald-500 dark:hover:text-emerald-400'
            }`}
          >
            <Dumbbell className="w-5 h-5 relative z-10" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setNotesOpen(o => !o); setChapNavOpen(false) }}
            title="Notes"
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all focus:outline-none ${
              notesOpen ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            <StickyNote className="w-5 h-5" />
          </motion.button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/50 mx-1 flex-shrink-0 rounded-full" />

          {/* Monty — opens the chat/goal panel; also the only way in to Compass now.
              The ring around the icon fills as xpInLevel climbs toward the next
              level, and the glow gets stronger with it — "the meter getting full." */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={monty.openMonty}
            title={`Monty — Lv ${level}, ${xpInLevel}/100 XP`}
            className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 focus:outline-none overflow-hidden group ${
              monty.montyOpen
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-400 ring-offset-2 dark:ring-offset-slate-950'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 shadow hover:shadow-cyan-500/20'
            }`}
            style={{
              filter: `drop-shadow(0 0 ${4 + (xpInLevel / 100) * 12}px rgba(6,182,212,${0.3 + (xpInLevel / 100) * 0.6}))`,
            }}
          >
            {/* Glass glare effect inside button */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 40 40">
              <defs>
                <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="17.5" fill="none" stroke="currentColor" strokeOpacity={monty.montyOpen ? "0.2" : "0.1"} strokeWidth="2.5" />
              <circle
                cx="20" cy="20" r="17.5" fill="none" stroke="url(#cyanGlow)" strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray={`${(xpInLevel / 100) * (2 * Math.PI * 17.5)} ${2 * Math.PI * 17.5}`}
                style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </svg>
            <Zap className={`w-5 h-5 relative z-10 ${monty.montyOpen ? 'drop-shadow-md' : 'group-hover:drop-shadow-sm'}`} fill={monty.montyOpen ? 'currentColor' : 'none'} />
            <span className="absolute -bottom-1 -right-1 text-[9px] font-black leading-none bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm z-20">
              {level}
            </span>
          </motion.button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/50 mx-1 flex-shrink-0 rounded-full" />

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
            className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:shadow-indigo-500/30 transition-all focus:outline-none group overflow-hidden"
          >
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <MessageSquare className="w-4 h-4 relative z-10" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-white dark:border-slate-950 animate-pulse shadow-sm" />
          </motion.button>
        </div>
      </div>
    </>
  )
}

