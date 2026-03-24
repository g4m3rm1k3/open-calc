import { useRef, useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { CURRICULUM } from '../../content/index.js'
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
}

export default function Sidebar({ onNavigate }) {
  const params = useParams()
  const location = useLocation()
  const { getLessonStatus } = useProgress()

  const navRef = useRef(null)
  const activeLinkRef = useRef(null)
  const [hovered, setHovered] = useState(false)

  const activeChapter = params.chapterId ? String(params.chapterId) : null
  const activeSlug = params.lessonSlug ?? params['*']
  const chapterMatch = location.pathname.match(/\/chapter\/([^/]+)/)
  const chapterFromPath = chapterMatch?.[1] ?? null
  const chapterCandidate = activeChapter ?? chapterFromPath

  // Determine which course we are in based on active chapter or URL
  let activeCourse = 'calc'
  if (chapterCandidate) {
    const chObj = CURRICULUM.find(c => String(c.number) === chapterCandidate)
    if (chObj) activeCourse = chObj.course
  } else if (location.pathname.includes('/discrete-1')) {
    activeCourse = 'discrete'
  } else if (location.pathname.includes('/precalc-')) {
    activeCourse = 'precalc'
  } else if (/\/chapter\/p\d+/.test(location.pathname)) {
    activeCourse = 'physics-1'
  }

  const visibleChapters = CURRICULUM.filter(c => c.course === activeCourse)
  const courseName = activeCourse === 'calc' ? 'OpenCalc' : activeCourse === 'discrete' ? 'Discrete Math' : activeCourse === 'precalc' ? 'Pre-Calculus' : activeCourse === 'physics-1' ? 'OpenPhysics' : 'OpenMath'
  const courseDesc = activeCourse === 'calc' ? 'Interactive Calculus' : activeCourse === 'discrete' ? 'Logic & Puzzles' : activeCourse === 'precalc' ? 'Functions & Graphs' : activeCourse === 'physics-1' ? 'Mechanics & Waves' : ''
  const courseHomePath = activeCourse === 'calc'
    ? '/chapter/0'
    : activeCourse === 'discrete'
      ? '/chapter/discrete-1'
      : activeCourse === 'precalc'
        ? '/chapter/precalc-1'
        : activeCourse === 'physics-1'
          ? '/chapter/p0'
          : '/'

  const COURSES = [
    { key: 'precalc',   label: 'Pre-Calc',  path: '/chapter/precalc-1' },
    { key: 'calc',      label: 'Calculus',   path: '/chapter/0' },
    { key: 'physics-1', label: 'Physics',    path: '/chapter/p0' },
    { key: 'discrete',  label: 'Discrete',   path: '/chapter/discrete-1' },
  ]

  // Auto-scroll to active lesson when not hovering
  useEffect(() => {
    if (hovered) return
    const id = setTimeout(() => {
      activeLinkRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
    return () => clearTimeout(id)
  }, [activeChapter, activeSlug, hovered])

  return (
    <nav
      ref={navRef}
      className="h-full overflow-y-auto py-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Course switcher — mobile only (desktop uses TopBar nav) */}
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
          </div>
        </div>
      </div>

      {/* Logo / course home */}
      <Link
        to={courseHomePath}
        onClick={onNavigate}
        className="flex items-center gap-2 px-5 pb-4 mb-2 border-b border-slate-200 dark:border-slate-700"
      >
        <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">∂</span>
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{courseName}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{courseDesc}</div>
        </div>
      </Link>

      {visibleChapters.map((chapter) => {
        const isActiveChapter = activeChapter === String(chapter.number)
        return (
          <div key={`chapter-${chapter.number}-${chapter.id || chapter.title}`} className="mb-1">
            {/* Chapter heading */}
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

            {/* Lessons */}
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

      {/* About link */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 px-5">
        <Link
          to="/about"
          onClick={onNavigate}
          className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
        >
          About OpenMath
        </Link>
      </div>
    </nav>
  )
}
