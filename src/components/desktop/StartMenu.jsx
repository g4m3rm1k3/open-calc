import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LABS } from '../../labs/registry.js'
import { GAMES } from '../../games/registry.js'
import { TOOLS } from '../../tools/toolLoader.js'
import { COURSES } from '../../courses/index.js'
import { getLabEntry } from '../../labs/labLoader.js'
import { getGameEntry } from '../../games/gameLoader.js'
import { useDesktop } from './DesktopProvider.jsx'
import { usePins } from '../../context/PinsContext.jsx'

const SECTIONS = [
  { id: 'all',        label: 'All' },
  { id: 'favourites', label: '★ Favourites' },
  { id: 'courses',    label: 'Courses' },
  { id: 'labs',       label: 'Labs' },
  { id: 'games',      label: 'Games' },
  { id: 'tools',      label: 'Tools' },
  { id: 'nav',        label: 'Navigate' },
]

const NAV_LINKS = [
  { id: 'reference',      label: 'Reference Library',          emoji: '📐', path: '/reference' },
  { id: 'linear-algebra', label: 'Linear Algebra',             emoji: '∑',  path: '/linear-algebra' },
  { id: 'studio',         label: 'Studio / Docs',              emoji: '✏️', path: '/studio' },
  { id: 'health',         label: 'Health Tracker',             emoji: '❤️', path: '/health' },
  { id: 'compass',        label: 'Compass',                    emoji: '🧭', path: '/compass' },
  { id: 'lesson-builder', label: 'Lesson Builder · Contribute',emoji: '🔨', path: '/lesson-builder' },
  { id: 'about',          label: 'About',                      emoji: 'ℹ️', path: '/about' },
  { id: 'game-rules',     label: 'Game Reference',             emoji: '♠️', action: 'game-rules' },
]

// Converts any item in the menu to a serialisable pin shape.
function toPin(item, type) {
  switch (type) {
    case 'course':
      return { id: item.key, label: item.label, emoji: item.icon, type: 'course', path: item.path }
    case 'lab':
      return { id: item.key, label: item.label, emoji: item.emoji, type: 'lab', path: item.path, labKey: item.key, event: item.event }
    case 'game':
      return { id: item.key, label: item.label, emoji: item.emoji, type: 'game', path: item.path, gameKey: item.key, event: item.event }
    case 'tool':
      return { id: item.key, label: item.label, emoji: item.glyph || '🔧', type: 'tool', eventTool: item.eventTool }
    case 'nav':
      return { id: item.id, label: item.label, emoji: item.emoji, type: 'nav', path: item.path, action: item.action }
    default:
      return null
  }
}

export default function StartMenu({ onClose }) {
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [contextMenu, setContextMenu] = useState(null) // { x, y, pin }
  const { openWindow } = useDesktop()
  const { pins, addPin, removePin, isPinned } = usePins()
  const navigate = useNavigate()
  const menuRef = useRef(null)

  // Close on outside click or Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (contextMenu) setContextMenu(null)
        else onClose()
      }
    }
    const handleClick = (e) => {
      if (contextMenu) { setContextMenu(null); return }
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose()
    }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('mousedown', handleClick)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('mousedown', handleClick)
    }
  }, [onClose, contextMenu])

  const showCtxMenu = useCallback((e, pin) => {
    e.preventDefault()
    e.stopPropagation()
    // Clamp so the menu doesn't overflow the viewport right/bottom edge
    const x = Math.min(e.clientX, window.innerWidth - 210)
    const y = Math.min(e.clientY, window.innerHeight - 80)
    setContextMenu({ x, y, pin })
  }, [])

  const togglePin = useCallback((pin) => {
    if (isPinned(pin.id)) removePin(pin.id)
    else addPin(pin)
    setContextMenu(null)
  }, [isPinned, removePin, addPin])

  // ---------- item launchers ----------
  const handleOpenLab = async (lab) => {
    onClose()
    if (lab.event) {
      window.dispatchEvent(new CustomEvent('oc-open-game', { detail: { game: lab.event } }))
      return
    }
    if (lab.path?.startsWith('/web-learn/') || lab.path?.startsWith('/learn/')) {
      navigate(lab.path); return
    }
    const entry = await getLabEntry(lab.key)
    if (entry?.component) {
      openWindow({ id: lab.key, label: lab.label, emoji: lab.emoji, Component: entry.component, backTo: '/' })
      return
    }
    if (lab.path) navigate(lab.path)
  }

  const handleOpenGame = async (game) => {
    onClose()
    const entry = await getGameEntry(game.key)
    if (entry?.component) {
      openWindow({ id: game.key, label: game.label, emoji: game.emoji, Component: entry.component, backTo: '/' })
    } else if (entry?.event) {
      window.dispatchEvent(new CustomEvent('oc-open-game', { detail: { game: entry.event } }))
    }
  }

  const handleOpenTool = (tool) => {
    onClose()
    if (tool.eventTool)
      window.dispatchEvent(new CustomEvent('oc-open-tool', { detail: { tool: tool.eventTool } }))
  }

  const handleNav = (link) => {
    onClose()
    if (link.action === 'game-rules') window.dispatchEvent(new CustomEvent('oc-game-rules'))
    else navigate(link.path)
  }

  const handleOpenPin = async (pin) => {
    onClose()
    if (pin.type === 'course' || pin.type === 'nav') {
      if (pin.action === 'game-rules') { window.dispatchEvent(new CustomEvent('oc-game-rules')); return }
      if (pin.path) navigate(pin.path)
      return
    }
    if (pin.type === 'tool') {
      if (pin.eventTool) window.dispatchEvent(new CustomEvent('oc-open-tool', { detail: { tool: pin.eventTool } }))
      return
    }
    if (pin.type === 'game') {
      if (pin.gameKey) {
        const entry = await getGameEntry(pin.gameKey)
        if (entry?.component) {
          openWindow({ id: pin.gameKey, label: pin.label, emoji: pin.emoji, Component: entry.component, backTo: '/' })
        } else if (entry?.event) {
          window.dispatchEvent(new CustomEvent('oc-open-game', { detail: { game: entry.event } }))
        }
      } else if (pin.event) {
        window.dispatchEvent(new CustomEvent('oc-open-game', { detail: { game: pin.event } }))
      }
      return
    }
    if (pin.type === 'lab') {
      if (pin.event) { window.dispatchEvent(new CustomEvent('oc-open-game', { detail: { game: pin.event } })); return }
      if (pin.path?.startsWith('/web-learn/') || pin.path?.startsWith('/learn/')) { navigate(pin.path); return }
      if (pin.labKey) {
        const entry = await getLabEntry(pin.labKey)
        if (entry?.component) {
          openWindow({ id: pin.labKey, label: pin.label, emoji: pin.emoji, Component: entry.component, backTo: '/' })
          return
        }
      }
      if (pin.path) navigate(pin.path)
    }
  }

  // ---------- filters ----------
  const q = query.toLowerCase()
  const filteredCourses = COURSES.filter(c => !q || c.label.toLowerCase().includes(q))
  const filteredLabs    = LABS.filter(l    => !q || l.label.toLowerCase().includes(q) || l.tags?.some(t => t.toLowerCase().includes(q)))
  const filteredGames   = GAMES.filter(g   => !q || g.label.toLowerCase().includes(q) || g.tags?.some(t => t.toLowerCase().includes(q)))
  const filteredTools   = TOOLS.filter(t   => !q || t.label?.toLowerCase().includes(q))
  const filteredNav     = NAV_LINKS.filter(n => !q || n.label.toLowerCase().includes(q))
  const filteredPins    = pins.filter(p    => !q || p.label?.toLowerCase().includes(q))

  const showFavourites = !q && (tab === 'all' || tab === 'favourites')
  const showCourses    = tab === 'all' || tab === 'courses'
  const showLabs       = tab === 'all' || tab === 'labs'
  const showGames      = tab === 'all' || tab === 'games'
  const showTools      = tab === 'all' || tab === 'tools'
  const showNav        = tab === 'all' || tab === 'nav'

  const sectionVariants = {
    hidden:  { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  // Shared item button — used in every section
  const ItemBtn = ({ pin, onClick, hoverColor, children }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onContextMenu={(e) => showCtxMenu(e, pin)}
      className="relative flex flex-col items-start gap-2 p-3 rounded-2xl text-left bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group"
    >
      {isPinned(pin.id) && (
        <span className="absolute top-1.5 right-1.5 text-[10px] leading-none opacity-60 select-none">⭐</span>
      )}
      {children}
    </motion.button>
  )

  return (
    <>
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
          <div className="flex-shrink-0 flex gap-2 px-4 pt-3 pb-2 border-b border-black/[0.05] dark:border-white/[0.05] overflow-x-auto scrollbar-none">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setTab(s.id)}
                className={`relative flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  tab === s.id
                    ? s.id === 'favourites'
                      ? 'text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30'
                      : 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab === s.id && (
                  <motion.div
                    layoutId="startMenuTab"
                    className={`absolute inset-0 rounded-full z-0 ${s.id === 'favourites' ? 'bg-amber-100 dark:bg-amber-800/40' : 'bg-indigo-100 dark:bg-indigo-800/40'}`}
                  />
                )}
                <span className="relative z-10">{s.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-6">
          <AnimatePresence mode="popLayout">

            {/* ---- Favourites ---- */}
            {showFavourites && filteredPins.length > 0 && (
              <motion.section key="fav-section" variants={sectionVariants} initial="hidden" animate="visible" exit="hidden" layout>
                <div className="flex items-center justify-between mb-3 px-2">
                  <h3 className="text-[11px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-widest">
                    ★ Favourites
                  </h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Right-click any item to pin / unpin</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {filteredPins.map(pin => (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={pin.id}
                      onClick={() => handleOpenPin(pin)}
                      onContextMenu={(e) => showCtxMenu(e, pin)}
                      className="relative flex flex-col items-start gap-2 p-3 rounded-2xl text-left bg-amber-50/60 dark:bg-amber-900/10 hover:bg-amber-100/80 dark:hover:bg-amber-900/20 border border-amber-200/50 dark:border-amber-700/30 shadow-sm hover:shadow-md transition-all group"
                    >
                      <span className="text-2xl flex-shrink-0">{pin.emoji}</span>
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-bold group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-2">
                        {pin.label}
                      </span>
                      <button
                        title="Remove from Favourites"
                        onClick={(e) => { e.stopPropagation(); removePin(pin.id) }}
                        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-60 hover:!opacity-100 text-slate-400 hover:text-red-500 transition-all text-xs leading-none w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/50 dark:hover:bg-slate-800/50"
                      >
                        ✕
                      </button>
                    </motion.button>
                  ))}
                </div>
              </motion.section>
            )}

            {showFavourites && filteredPins.length === 0 && tab === 'favourites' && (
              <motion.div key="fav-empty" variants={sectionVariants} initial="hidden" animate="visible" exit="hidden"
                className="flex flex-col items-center justify-center py-12 opacity-50"
              >
                <span className="text-4xl mb-3">⭐</span>
                <p className="text-center text-sm font-medium">No favourites yet</p>
                <p className="text-center text-xs text-slate-400 mt-1">Right-click any course, lab, game, or tool to pin it here</p>
              </motion.div>
            )}

            {/* ---- Courses ---- */}
            {showCourses && filteredCourses.length > 0 && (
              <motion.section key="courses-section" variants={sectionVariants} initial="hidden" animate="visible" exit="hidden" layout>
                <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-2">Courses</h3>
                <div className="grid grid-cols-3 gap-2">
                  {filteredCourses.map(course => {
                    const pin = toPin(course, 'course')
                    return (
                      <ItemBtn key={course.key} pin={pin} onClick={() => { onClose(); navigate(course.path) }} hoverColor="indigo">
                        <span className="text-2xl flex-shrink-0">{course.icon}</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2">{course.label}</span>
                      </ItemBtn>
                    )
                  })}
                </div>
              </motion.section>
            )}

            {/* ---- Labs ---- */}
            {showLabs && filteredLabs.length > 0 && (
              <motion.section key="labs-section" variants={sectionVariants} initial="hidden" animate="visible" exit="hidden" layout>
                <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-2">Labs</h3>
                <div className="grid grid-cols-3 gap-2">
                  {filteredLabs.map(lab => {
                    const pin = toPin(lab, 'lab')
                    return (
                      <ItemBtn key={lab.key} pin={pin} onClick={() => handleOpenLab(lab)} hoverColor="amber">
                        <span className="text-2xl flex-shrink-0">{lab.emoji}</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-bold group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-2">{lab.label}</span>
                      </ItemBtn>
                    )
                  })}
                </div>
              </motion.section>
            )}

            {/* ---- Games ---- */}
            {showGames && filteredGames.length > 0 && (
              <motion.section key="games-section" variants={sectionVariants} initial="hidden" animate="visible" exit="hidden" layout>
                <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-2">Games</h3>
                <div className="grid grid-cols-3 gap-2">
                  {filteredGames.map(game => {
                    const pin = toPin(game, 'game')
                    return (
                      <ItemBtn key={game.key} pin={pin} onClick={() => handleOpenGame(game)} hoverColor="rose">
                        <span className="text-2xl flex-shrink-0">{game.emoji}</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-bold group-hover:text-rose-600 dark:group-hover:text-rose-400 line-clamp-2">{game.label}</span>
                      </ItemBtn>
                    )
                  })}
                </div>
              </motion.section>
            )}

            {/* ---- Tools ---- */}
            {showTools && filteredTools.filter(t => t.eventTool).length > 0 && (
              <motion.section key="tools-section" variants={sectionVariants} initial="hidden" animate="visible" exit="hidden" layout>
                <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-2">Tools</h3>
                <div className="grid grid-cols-3 gap-2">
                  {filteredTools.filter(t => t.eventTool).map(tool => {
                    const pin = toPin(tool, 'tool')
                    return (
                      <ItemBtn key={tool.key} pin={pin} onClick={() => handleOpenTool(tool)} hoverColor="emerald">
                        <span className="text-2xl flex-shrink-0">{tool.glyph || '🔧'}</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-2">{tool.label}</span>
                      </ItemBtn>
                    )
                  })}
                </div>
              </motion.section>
            )}

            {/* ---- Navigate ---- */}
            {showNav && filteredNav.length > 0 && (
              <motion.section key="nav-section" variants={sectionVariants} initial="hidden" animate="visible" exit="hidden" layout>
                <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-2">Navigate</h3>
                <div className="grid grid-cols-3 gap-2">
                  {filteredNav.map(link => {
                    const pin = toPin(link, 'nav')
                    return (
                      <ItemBtn key={link.id} pin={pin} onClick={() => handleNav(link)} hoverColor="sky">
                        <span className="text-2xl flex-shrink-0">{link.emoji}</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-bold group-hover:text-sky-600 dark:group-hover:text-sky-400 line-clamp-2">{link.label}</span>
                      </ItemBtn>
                    )
                  })}
                </div>
              </motion.section>
            )}

          </AnimatePresence>

          {query && filteredCourses.length === 0 && filteredLabs.length === 0 && filteredGames.length === 0 && filteredTools.length === 0 && filteredNav.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 opacity-50">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-center text-sm font-medium">No results for "{query}"</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Right-click context menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            {/* Invisible backdrop to capture clicks outside */}
            <div className="fixed inset-0 z-[1950]" onClick={() => setContextMenu(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className="fixed z-[1960] bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-slate-200/80 dark:border-slate-700/80 py-1 min-w-[200px] overflow-hidden"
              style={{ top: contextMenu.y, left: contextMenu.x }}
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-2">
                <span className="text-base leading-none">{contextMenu.pin.emoji}</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">{contextMenu.pin.label}</span>
              </div>
              <button
                className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => togglePin(contextMenu.pin)}
              >
                {isPinned(contextMenu.pin.id)
                  ? <><span className="text-base">✕</span><span className="text-slate-600 dark:text-slate-300">Remove from Favourites</span></>
                  : <><span className="text-base">⭐</span><span className="text-slate-600 dark:text-slate-300">Add to Favourites</span></>
                }
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
