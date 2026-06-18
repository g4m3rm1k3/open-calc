import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

  return (
    <div
      ref={menuRef}
      className="fixed bottom-11 left-2 z-[1900] w-[620px] max-h-[72vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/[0.1] bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl"
    >
      {/* Search */}
      <div className="flex-shrink-0 p-3 border-b border-black/8 dark:border-white/[0.07]">
        <input
          autoFocus
          type="text"
          placeholder="Search labs, games, tools…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border-0 outline-none placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-slate-200"
        />
      </div>

      {/* Tabs */}
      {!query && (
        <div className="flex-shrink-0 flex gap-1 px-3 pt-2 pb-1 border-b border-black/5 dark:border-white/[0.05]">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setTab(s.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                tab === s.id
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-4">
        {showCourses && filteredCourses.length > 0 && (
          <section>
            <h3 className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">Courses</h3>
            <div className="grid grid-cols-3 gap-1.5">
              {filteredCourses.map(course => (
                <button
                  key={course.key}
                  onClick={() => { onClose(); navigate(course.path) }}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-base flex-shrink-0">{course.icon}</span>
                  <span className="truncate text-slate-700 dark:text-slate-300 font-medium">{course.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {showLabs && filteredLabs.length > 0 && (
          <section>
            <h3 className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">Labs</h3>
            <div className="grid grid-cols-3 gap-1.5">
              {filteredLabs.map(lab => (
                <button
                  key={lab.key}
                  onClick={() => handleOpenLab(lab)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <span className="text-base flex-shrink-0">{lab.emoji}</span>
                  <span className="truncate text-slate-700 dark:text-slate-300 font-medium">{lab.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {showGames && filteredGames.length > 0 && (
          <section>
            <h3 className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">Games</h3>
            <div className="grid grid-cols-3 gap-1.5">
              {filteredGames.map(game => (
                <button
                  key={game.key}
                  onClick={() => handleOpenGame(game)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-base flex-shrink-0">{game.emoji}</span>
                  <span className="truncate text-slate-700 dark:text-slate-300 font-medium">{game.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {showTools && filteredTools.filter(t => t.eventTool).length > 0 && (
          <section>
            <h3 className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">Tools</h3>
            <div className="grid grid-cols-3 gap-1.5">
              {filteredTools.filter(t => t.eventTool).map(tool => (
                <button
                  key={tool.key}
                  onClick={() => handleOpenTool(tool)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-base flex-shrink-0">{tool.glyph || '🔧'}</span>
                  <span className="truncate text-slate-700 dark:text-slate-300 font-medium">{tool.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {showNav && filteredNav.length > 0 && (
          <section>
            <h3 className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">Navigate</h3>
            <div className="grid grid-cols-3 gap-1.5">
              {filteredNav.map(link => (
                <button
                  key={link.id}
                  onClick={() => handleNav(link)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-base flex-shrink-0">{link.emoji}</span>
                  <span className="truncate text-slate-700 dark:text-slate-300 font-medium">{link.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {filteredCourses.length === 0 && filteredLabs.length === 0 && filteredGames.length === 0 && filteredTools.length === 0 && filteredNav.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-8">No results for "{query}"</p>
        )}
      </div>
    </div>
  )
}
