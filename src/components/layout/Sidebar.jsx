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

// Fallback colors keyed by the `color` field on each course in courses.js
const COURSE_TEXT_COLORS = {
  indigo:  'text-indigo-600 dark:text-indigo-400',
  blue:    'text-blue-600 dark:text-blue-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  red:     'text-red-600 dark:text-red-400',
  purple:  'text-purple-600 dark:text-purple-400',
  orange:  'text-orange-600 dark:text-orange-400',
  teal:    'text-teal-600 dark:text-teal-400',
  amber:   'text-amber-600 dark:text-amber-400',
  sky:     'text-sky-600 dark:text-sky-400',
  cyan:    'text-cyan-600 dark:text-cyan-400',
  rose:    'text-rose-600 dark:text-rose-400',
  pink:    'text-pink-600 dark:text-pink-400',
  violet:  'text-violet-600 dark:text-violet-400',
  lime:    'text-lime-600 dark:text-lime-400',
  fuchsia: 'text-fuchsia-600 dark:text-fuchsia-400',
  slate:   'text-slate-600 dark:text-slate-400',
}

export default function Sidebar({ onNavigate, isPinned, togglePin, isCollapsed, onSearchOpen }) {
  const location = useLocation()
  const { getLessonStatus, getQuizScore } = useProgress()

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
  const coursePageMatch = location.pathname.match(/^\/course\/([^/]+)/)
  let activeCourse = null
  if (activeChapter) {
    const chObj = CURRICULUM.find(c => String(c.number) === activeChapter)
    if (chObj) activeCourse = chObj.course
  } else if (coursePageMatch?.[1]) {
    activeCourse = coursePageMatch[1]
  } else if (location.pathname !== '/' && location.pathname !== '/courses') {
    // Heuristic for other landing pages (e.g. /course/calc direct)
    const match = COURSES.find(c => location.pathname.includes(c.key))
    if (match) activeCourse = match.key
  }

  const showAllCourses = activeCourse === null

  const visibleChapters = activeCourse ? CURRICULUM.filter(c => c.course === activeCourse) : []
  const activeCourseObj = COURSES.find(c => c.key === activeCourse)
  
  const courseName = 'UpSkillOS'
  const courseDesc = activeCourseObj?.desc ?? 'All Courses'
  const courseHomePath = activeCourseObj?.path ?? '/courses'

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
      className={`h-full overflow-y-auto py-10 sidebar-scroll backdrop-blur-3xl bg-white/40 dark:bg-slate-950/60 transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_80px_rgba(0,0,0,0.4)] ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}
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
                to="/chemistry"
                onClick={onNavigate}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              >
                ⚛ Chemistry
              </Link>
              <Link
                to="/universal-calc"
                onClick={onNavigate}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              >
                Universal Calc
              </Link>
              <Link
                to="/stem-quest"
                onClick={onNavigate}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              >
                🗺️ STEM Quest
              </Link>
              <Link
                to="/arkanoid-learn"
                onClick={onNavigate}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
              >
                Arkanoid Learn
              </Link>
              <Link
                to="/open-craft"
                onClick={onNavigate}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors"
              >
                OpenCraft
              </Link>
              {/* Reality Runner hidden until physics fixed */}
              <Link
                to="/cnc-sim"
                onClick={onNavigate}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
              >
                CNC Sim
              </Link>
              <Link
                to="/docs"
                onClick={onNavigate}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
              >
                📚 Docs
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

        <div className="flex flex-col gap-4 px-6 pb-8 mb-6 border-b border-white/10">
          <Link
            to={courseHomePath}
            onClick={onNavigate}
            className="flex items-center gap-4 group"
          >
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center text-white text-2xl font-black group-hover:scale-110 transition-transform duration-500">
                ∂
              </div>
              <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-full -z-10 animate-pulse" />
            </div>
            <div className="min-w-0 flex flex-col">
              <div className="font-black text-slate-900 dark:text-white leading-none tracking-[0.15em] text-xl uppercase mb-1.5">{courseName}</div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-80 shrink-0">System Node</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight truncate">{showAllCourses ? 'Omnibus' : courseDesc}</div>
              </div>
            </div>
          </Link>
          
          <div className="flex items-center justify-between mt-2">
            <button onClick={onSearchOpen} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-500 transition-all">
              <Search className="w-3.5 h-3.5" /> Discovery Mode
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePin(); }}
              className="p-1.5 rounded-xl transition-all hover:bg-white/10 text-slate-400 hover:text-indigo-400 hidden lg:block"
              title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
            >
              {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* All-courses panel — shown when not inside a specific course */}
        {showAllCourses && (
          <div className="px-3">
            {COURSES.map(c => (
              <Link
                key={c.key}
                to={c.path}
                onClick={onNavigate}
                className={`flex items-center justify-between px-3 py-2.5 mb-0.5 rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 group`}
              >
                <div className="min-w-0">
                  <div className={`text-sm font-semibold leading-tight ${COURSE_TEXT_COLORS[c.color] ?? 'text-slate-700 dark:text-slate-300'}`}>
                    {c.label}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 truncate">{c.desc}</div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        )}

        {/* Per-course chapter/lesson tree — shown when inside a specific course */}
        {!showAllCourses && visibleChapters.map((chapter) => {
          const isActiveChapter = activeChapter === String(chapter.number)
          return (
            <div key={`chapter-${chapter.number}-${chapter.id || chapter.title}`} className="mb-2">
              <Link
                to={`/chapter/${chapter.number}`}
                onClick={onNavigate}
                className={`flex items-center justify-between px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 hover:pl-9 ${isActiveChapter ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
              >
                <div className="flex flex-col">
                   <span className="text-[9px] opacity-60 mb-0.5">Chapter 0{chapter.number}</span>
                   <span>{chapter.title}</span>
                </div>
                {chapter.comingSoon && (
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-lg text-[8px] font-black tracking-widest uppercase">SOON</span>
                )}
              </Link>

              {!chapter.comingSoon && chapter.lessons.map((lesson) => {
                const isActive = activeChapter === String(chapter.number) && activeSlug === lesson.slug
                const quizScore = getQuizScore(lesson.id)
                let status
                // Only show quiz-based color once ALL questions have been attempted
                if (quizScore && quizScore.attempted === quizScore.total && quizScore.total > 0) {
                  const pct = quizScore.correct / quizScore.total
                  status = pct >= 0.8 ? 'quiz-pass' : pct >= 0.5 ? 'quiz-partial' : 'quiz-fail'
                } else {
                  status = getLessonStatus(lesson.id, lesson.checkpoints?.length ?? 1)
                }

                let progressPct = 0
                if (quizScore && quizScore.total > 0) {
                  progressPct = (quizScore.attempted / quizScore.total) * 100
                } else {
                  const checkpoints = lesson.checkpoints?.length ?? 1
                  const completed = getLessonStatus(lesson.id, checkpoints)
                  // Simplified progress heuristic
                  if (completed === 'pass') progressPct = 100
                  else if (completed === 'partial') progressPct = 50
                  else if (completed === 'active') progressPct = 25
                }

                return (
                  <Link
                    key={`lesson-${chapter.number}-${lesson.slug}-${lesson.id || lesson.title}`}
                    ref={el => { if (isActive) activeLinkRef.current = el }}
                    to={`/chapter/${chapter.number}/${lesson.slug}`}
                    onClick={onNavigate}
                    className={`relative mx-4 my-0.5 pl-10 pr-4 py-3 rounded-[1.25rem] flex items-center gap-3 transition-all duration-300 group overflow-hidden ${
                      isActive
                        ? 'bg-indigo-600/10 dark:bg-indigo-500/10 text-indigo-700 dark:text-white shadow-[0_0_20px_rgba(79,70,229,0.1)] ring-1 ring-indigo-500/30'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-white/5'
                    }`}
                  >
                    {/* Progress Sweep Background for Active State */}
                    {isActive && (
                      <div 
                        className="absolute inset-0 z-[-1] opacity-[0.12] dark:opacity-[0.18]"
                        style={{
                          background: `linear-gradient(to right, #4f46e5 ${progressPct}%, transparent ${progressPct}%)`
                        }}
                      />
                    )}
                    <ProgressDot status={status} />
                    <span className="leading-snug relative z-10">{lesson.title}</span>
                    {isActive && progressPct > 0 && (
                      <span className="ml-auto text-[10px] font-black text-indigo-500/80 dark:text-brand-400/80 tabular-nums relative z-10">
                        {Math.round(progressPct)}%
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )
        })}

        {!showAllCourses && activeCourse && (
          <div className="px-4 pt-3">
            <Link
              to="/courses"
              onClick={onNavigate}
              className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              All courses
            </Link>
          </div>
        )}

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
