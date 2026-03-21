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
  5: 'text-rose-600 dark:text-rose-400',
}

export default function Sidebar({ onNavigate }) {
  const params = useParams()
  const location = useLocation()
  const { getLessonStatus } = useProgress()

  const activeChapter = params.chapterId ? String(params.chapterId) : null
  const activeSlug = params.lessonSlug ?? params['*']

  // Determine which course we are in based on active chapter or URL
  let activeCourse = 'calc'
  if (activeChapter) {
    const chObj = CURRICULUM.find(c => String(c.number) === activeChapter)
    if (chObj) activeCourse = chObj.course
  } else if (location.pathname.includes('/discrete-1')) {
     activeCourse = 'discrete'
  }

  const visibleChapters = CURRICULUM.filter(c => c.course === activeCourse)
  const courseName = activeCourse === 'calc' ? 'OpenCalc' : activeCourse === 'discrete' ? 'Discrete Math' : 'OpenMath'
  const courseDesc = activeCourse === 'calc' ? 'Interactive Calculus' : 'Logic & Puzzles'

  return (
    <nav className="h-full overflow-y-auto py-4">
      {/* Logo / home */}
      <Link
        to="/"
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
        const isExpanded = activeChapter === String(chapter.number) || chapter.lessons.length === 0
        return (
          <div key={chapter.id} className="mb-1">
            {/* Chapter heading */}
            <Link
              to={`/chapter/${chapter.number}`}
              onClick={onNavigate}
              className={`flex items-center justify-between px-5 py-2 text-xs font-bold uppercase tracking-widest transition-colors hover:text-slate-900 dark:hover:text-slate-100 ${CHAPTER_COLORS[chapter.number] ?? CHAPTER_COLORS[0]}`}
            >
              <span>{activeCourse === 'discrete' ? 'Ch. ' : 'Ch. '}{chapter.number} — {chapter.title}</span>
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
                  key={lesson.id}
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
