import { useRef, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Pin, PinOff } from 'lucide-react'
import { getAllCourses } from '../../courses/courseLoader.js'
import { LABS } from '../../data/labs.js'
import { GAMES } from '../../data/games.js'
import ReportBugButton from '../ui/ReportBugButton.jsx'
import CoursesPanel from './sidebar/CoursesPanel.jsx'
import ChaptersPanel from './sidebar/ChaptersPanel.jsx'
import LabsPanel from './sidebar/LabsPanel.jsx'
import GamesPanel from './sidebar/GamesPanel.jsx'

const ALL_COURSES = getAllCourses()

export default function Sidebar({ onNavigate, isPinned, togglePin, isCollapsed, onSearchOpen }) {
  const location = useLocation()
  const activeLinkRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const path = location.pathname

  // Parse URL segments
  const chapterMatch  = path.match(/^\/chapter\/([^/]+)(?:\/([^/]+))?/)
  const activeChapter = chapterMatch?.[1] ?? null
  const activeSlug    = chapterMatch?.[2] ?? null
  const courseMatch   = path.match(/^\/course\/([^/]+)/)
  const activeCourse  = activeChapter
    ? activeChapter.replace(/-\d+$/, '')
    : courseMatch?.[1] ?? null

  const activeCourseObj = ALL_COURSES.find(c => c.key === activeCourse)

  // Which panel to show
  const isLabsArea  = path.startsWith('/labs')  || LABS.some(l => l.path && path === l.path)
  const isGamesArea = path.startsWith('/games') || GAMES.some(g => g.path && path === g.path)
  const isCourseArea = path === '/' || path.startsWith('/course') || path.startsWith('/chapter')
  const showCourses  = isCourseArea && !activeCourse
  const showChapters = !!activeCourse

  // Header identity changes by context
  const headerIcon = activeCourse ? (activeCourseObj?.icon ?? '∂') : isLabsArea ? '⚗' : isGamesArea ? '⊕' : '∂'
  const headerSub  = activeCourse ? (activeCourseObj?.description ?? 'Course') : isLabsArea ? 'Labs' : isGamesArea ? 'Games' : 'Omnibus'
  const headerPath = activeCourse ? (activeCourseObj?.path ?? '/courses') : isLabsArea ? '/labs' : isGamesArea ? '/games' : '/courses'

  // Auto-scroll to active lesson
  useEffect(() => {
    if (hovered) return
    const id = setTimeout(() => { activeLinkRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, 80)
    return () => clearTimeout(id)
  }, [activeChapter, activeSlug, hovered])

  useEffect(() => {
    const id = setTimeout(() => { activeLinkRef.current?.scrollIntoView({ behavior: 'instant', block: 'center' }) }, 150)
    return () => clearTimeout(id)
  }, [])

  return (
    <nav
      className={`h-full overflow-y-auto sidebar-scroll backdrop-blur-3xl bg-white/40 dark:bg-slate-950/60 transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_80px_rgba(0,0,0,0.4)] ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Sticky top bar */}
      <div className={`sticky top-0 z-20 flex items-center justify-between px-5 py-2.5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-800/60 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 select-none">UpSkillOS</span>
        <ReportBugButton />
      </div>

      <div className={`pt-6 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Header identity block */}
        <div className="flex flex-col gap-4 px-6 pb-8 mb-6 border-b border-white/10">
          <Link to={headerPath} onClick={onNavigate} className="flex items-center gap-4 group">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center text-white text-2xl font-black group-hover:scale-110 transition-transform duration-500">
                {headerIcon}
              </div>
              <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-full -z-10 animate-pulse" />
            </div>
            <div className="min-w-0 flex flex-col">
              <div className="font-black text-slate-900 dark:text-white leading-none tracking-[0.15em] text-xl uppercase mb-1.5">UpSkillOS</div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-80 shrink-0">System Node</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight truncate">{headerSub}</div>
              </div>
            </div>
          </Link>

          <div className="flex items-center justify-between mt-2">
            <button onClick={onSearchOpen} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-500 transition-all">
              <Search className="w-3.5 h-3.5" /> Discovery Mode
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePin() }}
              className="p-1.5 rounded-xl transition-all hover:bg-white/10 text-slate-400 hover:text-indigo-400 hidden lg:block"
              title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
            >
              {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Context-aware panels */}
        {showCourses  && <CoursesPanel onNavigate={onNavigate} />}
        {isLabsArea   && !activeCourse && <LabsPanel path={path} onNavigate={onNavigate} />}
        {isGamesArea  && !activeCourse && <GamesPanel path={path} onNavigate={onNavigate} />}
        {showChapters && (
          <ChaptersPanel
            activeCourse={activeCourse}
            activeChapter={activeChapter}
            activeSlug={activeSlug}
            onNavigate={onNavigate}
            activeLinkRef={activeLinkRef}
          />
        )}

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 px-5">
          <Link to="/about" onClick={onNavigate} className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
            About OpenMath
          </Link>
        </div>
      </div>
    </nav>
  )
}
