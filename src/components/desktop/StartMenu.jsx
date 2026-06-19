import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LABS } from '../../labs/registry.js'
import { GAMES } from '../../games/registry.js'
import { TOOLS } from '../../tools/toolLoader.js'
import { COURSES } from '../../courses/index.js'
import { getLabEntry } from '../../labs/labLoader.js'
import { getGameEntry } from '../../games/gameLoader.js'
import { useDesktop } from './DesktopProvider.jsx'

const SECTIONS = [
  { id: 'all', label: 'All' },
  { id: 'courses', label: 'Courses' },
  { id: 'labs', label: 'Labs' },
  { id: 'games', label: 'Games' },
  { id: 'tools', label: 'Tools' },
  { id: 'nav', label: 'Navigate' },
]

const NAV_LINKS = [
  { id: 'reference', label: 'Reference Library', emoji: '📐', path: '/reference' },
  { id: 'linear-algebra', label: 'Linear Algebra', emoji: '∑', path: '/linear-algebra' },
  { id: 'studio', label: 'Studio / Docs', emoji: '✏️', path: '/studio' },
  { id: 'health', label: 'Health Tracker', emoji: '❤️', path: '/health' },
  { id: 'about', label: 'About', emoji: 'ℹ️', path: '/about' },
  { id: 'game-rules', label: 'Game Reference', emoji: '♠️', action: 'game-rules' },
]

export default function StartMenu({ onClose }) {
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const { openWindow } = useDesktop()
  const navigate = useNavigate()
  const menuRef = useRef(null)

  // Close on outside click or Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    const handleClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) onClose() }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('mousedown', handleClick)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('mousedown', handleClick)
    }
  }, [onClose])

  const q = query.toLowerCase()

  const filteredCourses = COURSES.filter(c =>
    !q || c.label.toLowerCase().includes(q)
  )
  const filteredLabs = LABS.filter(l =>
    !q || l.label.toLowerCase().includes(q) || l.tags?.some(t => t.toLowerCase().includes(q))
  )
  const filteredGames = GAMES.filter(g =>
    !q || g.label.toLowerCase().includes(q) || g.tags?.some(t => t.toLowerCase().includes(q))
  )
  const filteredTools = TOOLS.filter(t =>
    !q || t.label?.toLowerCase().includes(q)
  )
  const filteredNav = NAV_LINKS.filter(n =>
    !q || n.label.toLowerCase().includes(q)
  )

  const handleOpenLab = async (lab) => {
    onClose()
    // Labs that open via AppShell event (chemistry, physics)
    if (lab.event) {
      window.dispatchEvent(new CustomEvent('oc-open-game', { detail: { game: lab.event } }))
      return
    }
    // Full-screen web courses always navigate (css-mastery, react-mastery, sicp, dsa-patterns)
    if (lab.path?.startsWith('/web-learn/') || lab.path?.startsWith('/learn/')) {
      navigate(lab.path)
      return
    }
    // Try to load as a floating window — works for most labs that have index.jsx
    const entry = await getLabEntry(lab.key)
    if (entry?.component) {
      openWindow({
        id: lab.key,
        label: lab.label,
        emoji: lab.emoji,
        Component: entry.component,
        backTo: '/',
      })
      return
    }
    // Fall back to navigation for standalone pages (openmat, cnc-sim, codelens, etc.)
    if (lab.path) navigate(lab.path)
  }

  const handleOpenGame = async (game) => {
    onClose()
    const entry = await getGameEntry(game.key)
    if (entry?.component) {
      openWindow({
        id: game.key,
        label: game.label,
        emoji: game.emoji,
        Component: entry.component,
        backTo: '/',
      })
    } else if (entry?.event) {
      // Physics games (pool, basketball, golf, football) open via AppShell event
      window.dispatchEvent(new CustomEvent('oc-open-game', { detail: { game: entry.event } }))
    }
  }

  const handleOpenTool = (tool) => {
    onClose()
    if (tool.eventTool) {
      window.dispatchEvent(new CustomEvent('oc-open-tool', { detail: { tool: tool.eventTool } }))
    }
  }

  const handleNav = (link) => {
    onClose()
    if (link.action === 'game-rules') {
      window.dispatchEvent(new CustomEvent('oc-game-rules'))
    } else {
      navigate(link.path)
    }
  }

  const showCourses = tab === 'all' || tab === 'courses'
  const showLabs = tab === 'all' || tab === 'labs'
  const showGames = tab === 'all' || tab === 'games'
  const showTools = tab === 'all' || tab === 'tools'
  const showNav = tab === 'all' || tab === 'nav'

  const sectionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      ref={menuRef}
      className="fixed bottom-14 left-3 z-[1900] w-[620px] max-h-[75vh] flex flex-col rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/50 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl ring-1 ring-black/5 dark:ring-white/5"
    >
      {/* Search */}
      <div className="flex-shrink-0 p-4 border-b border-black/[0.05] dark:border-white/[0.05]">
        <div className="relative">
          <input
            autoFocus
            type="text"
            placeholder="Search labs, games, tools…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500/50 outline-none placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-slate-200 transition-all shadow-sm focus:shadow-md"
          />
          <svg className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      {!query && (
        <div className="flex-shrink-0 flex gap-2 px-4 pt-3 pb-2 border-b border-black/[0.05] dark:border-white/[0.05]">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setTab(s.id)}
              className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                tab === s.id
                  ? 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab === s.id && (
                <motion.div layoutId="startMenuTab" className="absolute inset-0 bg-indigo-100 dark:bg-indigo-800/40 rounded-full z-0" />
              )}
              <span className="relative z-10">{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-6">
        <AnimatePresence mode="popLayout">
          {showCourses && filteredCourses.length > 0 && (
            <motion.section variants={sectionVariants} initial="hidden" animate="visible" exit="hidden" layout>
              <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-2">Courses</h3>
              <div className="grid grid-cols-3 gap-2">
                {filteredCourses.map(course => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={course.key}
                    onClick={() => { onClose(); navigate(course.path) }}
                    className="flex flex-col items-start gap-2 p-3 rounded-2xl text-left bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group"
                  >
                    <span className="text-2xl flex-shrink-0">{course.icon}</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2">{course.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}

          {showLabs && filteredLabs.length > 0 && (
            <motion.section variants={sectionVariants} initial="hidden" animate="visible" exit="hidden" layout>
              <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-2">Labs</h3>
              <div className="grid grid-cols-3 gap-2">
                {filteredLabs.map(lab => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={lab.key}
                    onClick={() => handleOpenLab(lab)}
                    className="flex flex-col items-start gap-2 p-3 rounded-2xl text-left bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group"
                  >
                    <span className="text-2xl flex-shrink-0">{lab.emoji}</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-bold group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-2">{lab.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}

          {showGames && filteredGames.length > 0 && (
            <motion.section variants={sectionVariants} initial="hidden" animate="visible" exit="hidden" layout>
              <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-2">Games</h3>
              <div className="grid grid-cols-3 gap-2">
                {filteredGames.map(game => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={game.key}
                    onClick={() => handleOpenGame(game)}
                    className="flex flex-col items-start gap-2 p-3 rounded-2xl text-left bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group"
                  >
                    <span className="text-2xl flex-shrink-0">{game.emoji}</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-bold group-hover:text-rose-600 dark:group-hover:text-rose-400 line-clamp-2">{game.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}

          {showTools && filteredTools.filter(t => t.eventTool).length > 0 && (
            <motion.section variants={sectionVariants} initial="hidden" animate="visible" exit="hidden" layout>
              <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-2">Tools</h3>
              <div className="grid grid-cols-3 gap-2">
                {filteredTools.filter(t => t.eventTool).map(tool => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={tool.key}
                    onClick={() => handleOpenTool(tool)}
                    className="flex flex-col items-start gap-2 p-3 rounded-2xl text-left bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group"
                  >
                    <span className="text-2xl flex-shrink-0">{tool.glyph || '🔧'}</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-2">{tool.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}

          {showNav && filteredNav.length > 0 && (
            <motion.section variants={sectionVariants} initial="hidden" animate="visible" exit="hidden" layout>
              <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-2">Navigate</h3>
              <div className="grid grid-cols-3 gap-2">
                {filteredNav.map(link => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={link.id}
                    onClick={() => handleNav(link)}
                    className="flex flex-col items-start gap-2 p-3 rounded-2xl text-left bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group"
                  >
                    <span className="text-2xl flex-shrink-0">{link.emoji}</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-bold group-hover:text-sky-600 dark:group-hover:text-sky-400 line-clamp-2">{link.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {filteredCourses.length === 0 && filteredLabs.length === 0 && filteredGames.length === 0 && filteredTools.length === 0 && filteredNav.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 opacity-50">
            <span className="text-4xl mb-3">🔍</span>
            <p className="text-center text-sm font-medium">No results for "{query}"</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
