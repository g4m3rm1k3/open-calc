import { useRef, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, Minus, Maximize2, Search, Video, ChevronRight, Play, Layout, Menu, Plus, Globe, Trash2, BookOpen, ChevronLeft, Home, Layers, Compass, Sidebar as SidebarIcon, GripVertical, Pin, PinOff } from 'lucide-react';
import { CURRICULUM, COURSES } from '../../content/index.js'
import { useProgress } from '../../hooks/useProgress.js'
import ProgressDot from '../ui/ProgressDot.jsx'

const CHAPTER_COLORS = {
  0: 'text-slate-600 dark:text-slate-400',
  1: 'text-blue-600 dark:text-blue-400',
  2: 'text-green-600 dark:text-green-400',
  3: 'text-purple-600 dark:text-purple-400',
  4: 'text-orange-600 dark:text-orange-400',
  7: 'text-amber-600 dark:text-amber-400',
  p0: 'text-orange-600 dark:text-orange-400',
  p1: 'text-red-600 dark:text-red-400',
  p2: 'text-orange-500 dark:text-orange-300',
  p3: 'text-yellow-600 dark:text-yellow-400',
  p4: 'text-teal-600 dark:text-teal-400',
  p5: 'text-indigo-600 dark:text-indigo-400',
  p6: 'text-fuchsia-600 dark:text-fuchsia-400',
  'geometry-1': 'text-indigo-600 dark:text-indigo-400',
  'geometry-2': 'text-blue-600 dark:text-blue-400',
  'geometry-3': 'text-emerald-600 dark:text-emerald-400',
  'geometry-4': 'text-purple-600 dark:text-purple-400',
  'geometry-5': 'text-orange-600 dark:text-orange-400',
  'geometry-6': 'text-rose-600 dark:text-rose-400',
}

export default function Sidebar({ onNavigate, isPinned, togglePin, isCollapsed, onSearchOpen }) {
  const location = useLocation()
  const { getLessonStatus } = useProgress()

  const navRef = useRef(null)
  const activeLinkRef = useRef(null)
  const [hovered, setHovered] = useState(false)

  // Parse chapter and lesson from the current URL path directly.
  // Works because Sidebar lives outside the Route tree (in AppShell),
  // so useParams() is always empty — useLocation() is the reliable source.
  const pathMatch = location.pathname.match(/^\/chapter\/([^/]+)(?:\/([^/]+))?/)
  const activeChapter = pathMatch?.[1] ?? null
  const activeSlug = pathMatch?.[2] ?? null

  // Determine which course we are in based on active chapter
  let activeCourse = 'calc'
  if (activeChapter) {
    const chObj = CURRICULUM.find(c => String(c.number) === activeChapter)
    if (chObj) activeCourse = chObj.course
  } else {
    // Heuristic for landing pages (paths that don't have chapterId yet)
    const match = COURSES.find(c => location.pathname.startsWith(c.path.split('/').slice(0,-1).join('/')) || location.pathname.includes(c.key))
    if (match) activeCourse = match.key
  }

  const visibleChapters = CURRICULUM.filter(c => c.course === activeCourse)
  const activeCourseObj = COURSES.find(c => c.key === activeCourse) || COURSES.find(c => c.key === 'calc')
  
  const courseName = activeCourseObj.label === 'Calculus' ? 'OpenCalc' : activeCourseObj.label === 'Physics' ? 'OpenPhysics' : `Open${activeCourseObj.label}`
  const courseDesc = activeCourseObj.desc
  const courseHomePath = activeCourseObj.path

  // Auto-scroll to active lesson on route change and initial mount
  useEffect(() => {
    if (hovered) return
    const id = setTimeout(() => {
      activeLinkRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)
    return () => clearTimeout(id)
  }, [activeChapter, activeSlug, hovered])

  // Also fire once on mount (hard-refresh / initial load)
  useEffect(() => {
    const id = setTimeout(() => {
      activeLinkRef.current?.scrollIntoView({ behavior: 'instant', block: 'center' })
    }, 150)
    return () => clearTimeout(id)
  }, [])

  return (
    <nav
      ref={navRef}
      className="h-full overflow-y-auto py-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Course switchers/Logic (Visible on mobile or when expanded) */}
      <div className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Course switcher — mobile only */}
        <div className="lg:hidden px-3 mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-1.5">
            {COURSES.map(c => (
              <Link
                key={c.key}
                to={c.path}
                onClick={onNavigate}
                className={`text-center text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${
                  activeCourse === c.key
                    ? 'bg-brand-600 text-white dark:bg-brand-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {c.label}
              </Link>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="px-2 mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Tools
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              <Link
                to="/reference"
                onClick={onNavigate}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
              >
                Reference
              </Link>
              <Link
                to="/universal-calc"
                onClick={onNavigate}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              >
                Universal Calc
              </Link>
              <button
                onClick={() => { onNavigate(); onSearchOpen?.(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Course Heading with Pin Toggle */}
        <div className="flex items-center gap-2 px-4 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
          <Link
            to={courseHomePath}
            onClick={onNavigate}
            className="flex-1 flex items-center gap-2"
          >
            <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">∂</span>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">{courseName}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">{courseDesc}</div>
            </div>
          </Link>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePin(); }}
            className="p-1.5 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hidden lg:block"
            title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
          >
            {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
          </button>
        </div>

        {visibleChapters.map((chapter) => {
          const isActiveChapter = activeChapter === String(chapter.number)
          return (
            <div key={`chapter-${chapter.number}-${chapter.id || chapter.title}`} className="mb-1">
              <Link
                to={`/chapter/${chapter.number}`}
                onClick={onNavigate}
                className={`flex items-center justify-between px-5 py-2 text-xs font-bold uppercase tracking-widest transition-colors hover:text-slate-900 dark:hover:text-slate-100 ${isActiveChapter ? 'sidebar-chapter-active' : (CHAPTER_COLORS[chapter.number] ?? CHAPTER_COLORS[0])}`}
              >
                <span>Ch. {chapter.number} — {chapter.title}</span>
                {chapter.comingSoon && (
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded text-xs font-normal normal-case">soon</span>
                )}
              </Link>

              {!chapter.comingSoon && chapter.lessons.map((lesson) => {
                const isActive = activeChapter === String(chapter.number) && activeSlug === lesson.slug
                const status = getLessonStatus(lesson.id, lesson.checkpoints?.length ?? 3)

                return (
                  <Link
                    key={`lesson-${chapter.number}-${lesson.slug}-${lesson.id || lesson.title}`}
                    ref={el => { if (isActive) activeLinkRef.current = el }}
                    to={`/chapter/${chapter.number}/${lesson.slug}`}
                    onClick={onNavigate}
                    className={`flex items-center gap-2.5 px-5 pl-8 py-2 text-sm transition-colors ${
                      isActive
                        ? 'sidebar-link-active'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <ProgressDot status={status} />
                    <span className="leading-snug">{lesson.title}</span>
                  </Link>
                )
              })}
            </div>
          )
        })}

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 px-5">
          <Link
            to="/about"
            onClick={onNavigate}
            className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
          >
            About OpenMath
          </Link>
        </div>
      </div>
    </nav>
  )
}
