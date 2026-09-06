import { lazy, Suspense, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import StartMenu from './StartMenu.jsx'
import ChapterNavigator from './ChapterNavigator.jsx'
import NotesListWindow from '../ui/NotesListWindow.jsx'
import { useDesktop } from './DesktopProvider.jsx'
import { useChat } from '../../hooks/useChat.js'
import { useMontyContext } from '../../features/compass/MontyContext.tsx'
import { useProgress } from '../../hooks/useProgress.js'
import { computeXp, xpToLevel } from '../../features/compass/montyStatus.ts'
import { getLabEntry } from '../../labs/labLoader.js'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'

// `route` navigates the browser there — correct for RPG Workout and Brain
// Training, which are tall, scrollable content pages meant to be their own
// full page (FloatingWindow's content area uses `overflow-hidden` with no
// scroll, which clips anything taller than the window). `loader` instead
// opens the app as a floating window directly, with NO navigation at all —
// the current page (a lesson, a course, wherever the user actually is)
// stays exactly as it is underneath. Canvas Notes needs `loader`, not
// `route`: navigating to `/lab/canvas-notes` would render EntryShell, which
// opens the window but then also replaces the URL with `backTo` ("/labs")
// — stranding the user on the Labs gallery instead of back on their course
// the moment they close the window.
const PINNED_APPS = [
  { id: 'rpg-workout', label: 'RPG Workout', emoji: '⚔️', route: '/rpg-workout' },
  { id: 'brain', label: 'Brain Training', emoji: '🧠', route: '/brain' },
  { id: 'canvas-notes', label: 'Canvas Notes', emoji: '🗒️', loader: () => getLabEntry('canvas-notes').then((e) => e.component) },
  { id: 'resource-lab', label: 'Resource Lab', emoji: '📚', loader: () => getLabEntry('resource-lab').then((e) => e.component) },
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
  const { unreadCount, chatOpen } = useChat()


  const { taskbarStyle } = useGlobalTheme()

  const isLessonRoute = /^\/chapter\/[^/]+\/.+/.test(location.pathname)

  const toggleChat = () => window.dispatchEvent(new CustomEvent('oc-toggle-chat'))
  const toggleTutor = () => window.dispatchEvent(new CustomEvent('oc-toggle-tutor'))

  // Allow the intro tour (TourContext) to open the Start Menu programmatically
  // when the tour step describing it fires onAction.
  useEffect(() => {
    const handler = () => setMenuOpen(true)
    window.addEventListener('oc-open-start-menu', handler)
    return () => window.removeEventListener('oc-open-start-menu', handler)
  }, [])

  const openPinnedApp = async (app) => {
    if (app.route) { navigate(app.route); return }
    const Component = await app.loader()
    openWindow({ id: app.id, label: app.label, emoji: app.emoji, Component, backTo: '/' })
  }

  const macHoverProps = taskbarStyle === 'mac' ? {
    whileHover: { 
      scale: 1.4, 
      y: -10, 
      originY: 1, 
      rotateY: 360,
      filter: 'drop-shadow(0 20px 10px rgba(0,0,0,0.4))'
    },
    transition: { type: 'spring', stiffness: 400, damping: 20 }
  } : {}

  const utilitiesFragment = (
    <div className={`flex items-center gap-1 flex-shrink-0 pointer-events-auto`}>
      {isLessonRoute && (
        <motion.button
          whileHover={taskbarStyle === 'mac' ? macHoverProps.whileHover : { scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={macHoverProps.transition}
          onClick={() => setChapNavOpen(o => !o)}
          title="Chapter navigator"
          className={`flex items-center justify-center rounded-xl transition-all focus:outline-none ${
            taskbarStyle === 'mac' ? 'w-11 h-11' : 'w-9 h-9'
          } ${
            chapNavOpen ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className={`${taskbarStyle === 'mac' ? 'w-6 h-6' : 'w-5 h-5'}`} />
        </motion.button>
      )}

      <motion.button
        whileHover={taskbarStyle === 'mac' ? macHoverProps.whileHover : { scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={macHoverProps.transition}
        onClick={() => setConceptExplorerOpen(o => !o)}
        title="Concept Explorer"
        className={`relative flex items-center justify-center rounded-xl transition-all focus:outline-none overflow-hidden group ${
          taskbarStyle === 'mac' ? 'w-11 h-11' : 'w-9 h-9'
        } ${
          conceptExplorerOpen 
            ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/40 ring-1 ring-amber-400/50' 
            : 'bg-amber-500/10 text-amber-500 dark:text-amber-400/80 hover:bg-amber-500/20 hover:text-amber-500 dark:hover:text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.1)] hover:shadow-[0_0_12px_rgba(245,158,11,0.2)]'
        }`}
      >
        {conceptExplorerOpen && <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}
        <Lightbulb className={`${taskbarStyle === 'mac' ? 'w-6 h-6' : 'w-5 h-5'} relative z-10 transition-all ${conceptExplorerOpen ? 'drop-shadow-sm' : 'drop-shadow-[0_0_2px_rgba(245,158,11,0.6)]'}`} />
      </motion.button>

      <motion.button
        whileHover={taskbarStyle === 'mac' ? macHoverProps.whileHover : { scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={macHoverProps.transition}
        onClick={() => setPracticeOpen(o => !o)}
        title="Practice"
        className={`relative flex items-center justify-center rounded-xl transition-all focus:outline-none overflow-hidden group ${
          taskbarStyle === 'mac' ? 'w-11 h-11' : 'w-9 h-9'
        } ${
          practiceOpen
            ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/40 ring-1 ring-emerald-400/50'
            : 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400/80 hover:bg-emerald-500/20 hover:text-emerald-500 dark:hover:text-emerald-400'
        }`}
      >
        <Dumbbell className={`${taskbarStyle === 'mac' ? 'w-6 h-6' : 'w-5 h-5'} relative z-10`} />
      </motion.button>

      <motion.button
        whileHover={taskbarStyle === 'mac' ? macHoverProps.whileHover : { scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={macHoverProps.transition}
        onClick={() => { setNotesOpen(o => !o); setChapNavOpen(false) }}
        title="Notes"
        className={`relative flex items-center justify-center rounded-xl transition-all focus:outline-none overflow-hidden group ${
          taskbarStyle === 'mac' ? 'w-11 h-11' : 'w-9 h-9'
        } ${
          notesOpen
            ? 'bg-gradient-to-tr from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/40 ring-1 ring-yellow-400/50'
            : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20 shadow-[0_0_8px_rgba(234,179,8,0.1)] hover:shadow-[0_0_12px_rgba(234,179,8,0.2)]'
        }`}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <StickyNote className={`${taskbarStyle === 'mac' ? 'w-6 h-6' : 'w-5 h-5'} relative z-10`} />
      </motion.button>

      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/50 mx-1 flex-shrink-0 rounded-full" />

      {/* Monty — opens the chat/goal panel; also the only way in to Compass now. */}
      <motion.button
        whileHover={taskbarStyle === 'mac' ? macHoverProps.whileHover : { scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={macHoverProps.transition}
        onClick={monty.openMonty}
        title={`Monty — Lv ${level}, ${xpInLevel}/100 XP`}
        className={`relative flex items-center justify-center rounded-2xl transition-all duration-300 focus:outline-none group ${
          taskbarStyle === 'mac' ? 'w-12 h-12' : 'w-10 h-10'
        } ${
          monty.montyOpen
            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-400 ring-offset-2 dark:ring-offset-slate-950'
            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 shadow hover:shadow-cyan-500/20'
        }`}
        style={{
          filter: `drop-shadow(0 0 ${4 + (xpInLevel / 100) * 12}px rgba(6,182,212,${0.3 + (xpInLevel / 100) * 0.6}))`,
        }}
      >
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
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
        </div>
        <Zap className={`${taskbarStyle === 'mac' ? 'w-6 h-6' : 'w-5 h-5'} relative z-10 ${monty.montyOpen ? 'drop-shadow-md' : 'group-hover:drop-shadow-sm'}`} fill={monty.montyOpen ? 'currentColor' : 'none'} />
        <span className="absolute -bottom-1 -right-1 text-[9px] font-black leading-none bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm z-20">
          {level}
        </span>
      </motion.button>

      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/50 mx-1 flex-shrink-0 rounded-full" />

      <motion.button
        data-tour="stem-tutor"
        whileHover={taskbarStyle === 'mac' ? macHoverProps.whileHover : { scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={macHoverProps.transition}
        onClick={toggleTutor}
        title="Delta — your STEM tutor"
        className={`relative flex items-center justify-center rounded-xl transition-all focus:outline-none overflow-hidden group bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 dark:text-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.1)] hover:shadow-[0_0_12px_rgba(14,165,233,0.2)] ${
          taskbarStyle === 'mac' ? 'w-11 h-11' : 'w-9 h-9'
        }`}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <GraduationCap className={`${taskbarStyle === 'mac' ? 'w-6 h-6' : 'w-5 h-5'} relative z-10`} />
      </motion.button>

      <motion.button
        whileHover={taskbarStyle === 'mac' ? macHoverProps.whileHover : { scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={macHoverProps.transition}
        onClick={toggleChat}
        title="Study Chat"
        className={`relative flex items-center justify-center rounded-xl transition-all focus:outline-none group ${
          taskbarStyle === 'mac' ? 'w-11 h-11' : 'w-9 h-9'
        } ${
          chatOpen
            ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/40 ring-1 ring-indigo-400/50'
            : 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/20 shadow-[0_0_8px_rgba(99,102,241,0.1)] hover:shadow-[0_0_12px_rgba(99,102,241,0.2)]'
        }`}
      >
        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <MessageSquare className={`${taskbarStyle === 'mac' ? 'w-5 h-5' : 'w-4 h-4'} relative z-10`} />
        {unreadCount > 0 && !chatOpen && (
          <span className="absolute -top-1 -right-1 z-20 min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-950 text-white text-[9px] font-bold flex items-center justify-center leading-none shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </motion.button>
    </div>
  )

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

      <div className={`hidden lg:flex fixed left-0 right-0 z-[1600] px-3 transition-all duration-300 ${
        taskbarStyle === 'mac' 
          ? 'bottom-2 h-14 items-end pointer-events-none justify-center' 
          : 'bottom-0 h-12 items-center bg-white/70 dark:bg-slate-950/70 backdrop-blur-3xl border-t border-slate-200/50 dark:border-slate-800/50 shadow-[0_-4px_30px_rgba(0,0,0,0.03)]'
      }`}>

        {taskbarStyle === 'win11' && <div className="flex-1 pointer-events-none" />}

        <div className={`flex items-center pointer-events-auto relative ${
          taskbarStyle === 'mac'
            ? 'gap-3 px-4 py-2'
            : 'gap-2'
        }`}>
          {taskbarStyle === 'mac' && (
            <div 
              className="absolute bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-2xl shadow-2xl pointer-events-none"
              style={{ 
                top: '-4px', bottom: '-8px', left: '-20px', right: '-20px',
                transform: 'perspective(400px) rotateX(45deg)', 
                transformOrigin: 'bottom' 
              }}
            />
          )}
          <motion.button
            data-tour="start-menu"
            whileHover={taskbarStyle === 'mac' ? macHoverProps.whileHover : { scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={macHoverProps.transition}
            onClick={() => setMenuOpen(m => !m)}
            title="Start"
            aria-label="Open Start Menu"
            className={`relative flex items-center justify-center rounded-[12px] transition-colors focus:outline-none flex-shrink-0 border border-white/30 dark:border-white/20 ${
              taskbarStyle === 'mac' ? 'w-11 h-11' : 'w-10 h-10'
            } ${
              menuOpen
                ? 'bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 text-white shadow-[0_0_30px_rgba(99,102,241,0.8)]'
                : 'bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-500 text-white shadow-[0_6px_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] hover:from-cyan-400 hover:via-indigo-400 hover:to-purple-400'
            }`}
          >
            <div className="absolute inset-0 rounded-[12px] bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
            <Command className={`${taskbarStyle === 'mac' ? 'w-6 h-6' : 'w-5 h-5'} relative z-10`} />
          </motion.button>

          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 flex-shrink-0 rounded-full" />
          {PINNED_APPS.map(app => (
            <motion.button
              key={app.id}
              whileHover={taskbarStyle === 'mac' ? macHoverProps.whileHover : { scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.9 }}
              transition={macHoverProps.transition}
              onClick={() => openPinnedApp(app)}
              title={app.label}
              className={`flex items-center justify-center rounded-xl bg-transparent hover:bg-white dark:hover:bg-slate-800 transition-colors focus:outline-none flex-shrink-0 shadow-sm hover:shadow-md border border-transparent hover:border-slate-200 dark:hover:border-slate-700 ${
                taskbarStyle === 'mac' ? 'w-11 h-11 text-2xl' : 'w-10 h-10 text-xl'
              }`}
            >
              <div className={taskbarStyle === 'mac' ? 'drop-shadow-lg' : ''}>{app.emoji}</div>
            </motion.button>
          ))}

          {windows.length > 0 && (
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 flex-shrink-0 rounded-full" />
          )}

          {windows.map(win => {
            const isMin = win.state === 'minimized'
            return (
              <motion.button
                key={win.id}
                whileHover={taskbarStyle === 'mac' ? macHoverProps.whileHover : { scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={macHoverProps.transition}
                onClick={() => onFocus(win.id)}
                title={win.label}
                className={
                  taskbarStyle === 'mac'
                    ? `relative flex items-center justify-center rounded-2xl transition-all focus:outline-none w-11 h-11 flex-shrink-0 ${
                        isMin
                          ? 'bg-white/10 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 border border-white/20 dark:border-slate-700/30'
                          : 'bg-white/30 dark:bg-slate-800/40 text-slate-800 dark:text-slate-100 border border-white/40 dark:border-slate-600/50 shadow-md backdrop-blur-md'
                      }`
                    : `flex items-center gap-2 px-3 h-9 rounded-xl text-xs font-semibold transition-all max-w-[180px] focus:outline-none border ${
                        isMin
                          ? 'text-slate-500 dark:text-slate-400 bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                          : 'text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border-slate-200/50 dark:border-slate-700/50 shadow-sm'
                      }`
                }
              >
                {win.emoji && <span className={`leading-none flex-shrink-0 ${taskbarStyle === 'mac' ? 'text-2xl drop-shadow-md' : 'text-base'}`}>{win.emoji}</span>}
                {taskbarStyle !== 'mac' && <span className="truncate leading-none tracking-tight">{win.label}</span>}
                {!isMin && taskbarStyle !== 'mac' && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 shadow-[0_0_5px_rgba(99,102,241,0.5)]" />}
                {!isMin && taskbarStyle === 'mac' && <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-slate-800 dark:bg-slate-200 shadow-sm" />}
              </motion.button>
            )
          })}

          {(taskbarStyle === 'mac' || taskbarStyle === 'win11') && (
            <>
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1 flex-shrink-0 rounded-full" />
              {utilitiesFragment}
            </>
          )}
        </div>

        {taskbarStyle === 'win10' && <div className="flex-1 pointer-events-none" />}
        {taskbarStyle === 'win10' && utilitiesFragment}
        {taskbarStyle === 'win11' && <div className="flex-1 pointer-events-none" />}
      </div>
    </>
  )
}
