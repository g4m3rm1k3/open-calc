import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import StartMenu from './StartMenu.jsx'
import ChapterNavigator from './ChapterNavigator.jsx'
import PinsNotesPopup from './PinsNotesPopup.jsx'
import { useDesktop } from './DesktopProvider.jsx'
import ReportBugButton from '../ui/ReportBugButton.jsx'
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
import { LayoutGrid, Command, BookOpen, MessageSquare, Pin, StickyNote, GraduationCap, Zap } from 'lucide-react'

export default function Taskbar({ windows, onFocus }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [chapNavOpen, setChapNavOpen] = useState(false)
  const [pinsNotesOpen, setPinsNotesOpen] = useState(null) // 'pins' | 'notes' | null
  const location = useLocation()
  const navigate = useNavigate()
  const { openWindow } = useDesktop()
  const monty = useMontyContext()
  const { progress } = useProgress()
  const { level, xpInLevel } = xpToLevel(computeXp(progress))
  const montyFillCircumference = 2 * Math.PI * 15.5

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

          {/* Monty — opens the chat/goal panel; also the only way in to Compass now.
              The ring around the icon fills as xpInLevel climbs toward the next
              level, and the glow gets stronger with it — "the meter getting full." */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={monty.openMonty}
            title={`Monty — Lv ${level}, ${xpInLevel}/100 XP`}
            className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all focus:outline-none ${
              monty.montyOpen ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-500 dark:hover:text-cyan-400'
            }`}
            style={{
              filter: `drop-shadow(0 0 ${3 + (xpInLevel / 100) * 9}px rgba(0,212,255,${0.25 + (xpInLevel / 100) * 0.55}))`,
            }}
          >
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
              <circle
                cx="18" cy="18" r="15.5" fill="none" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"
                strokeDasharray={`${(xpInLevel / 100) * montyFillCircumference} ${montyFillCircumference}`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <Zap className="w-5 h-5 relative z-10" fill={monty.montyOpen ? 'currentColor' : 'none'} />
            <span className="absolute -bottom-1 -right-1 text-[8px] font-black leading-none bg-cyan-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center border border-white dark:border-slate-950">
              {level}
            </span>
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
