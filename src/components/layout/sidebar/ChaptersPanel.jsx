import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { getAllChapters } from '../../../courses/courseLoader.js'
import { useProgress } from '../../../hooks/useProgress.js'
import ProgressDot from '../../ui/ProgressDot.jsx'

const ALL_CHAPTERS = getAllChapters()

function chapterStatus(chapter, courseId, getLessonStatus) {
  if (!chapter.lessons.length) return 'none'
  const statuses = chapter.lessons.map(l => getLessonStatus(`${courseId}/${l.slug}`, 1))
  if (statuses.every(s => s === 'complete')) return 'complete'
  if (statuses.some(s => s && s !== 'none')) return 'in-progress'
  return 'none'
}

export default function ChaptersPanel({ activeCourse, activeChapter, activeSlug, onNavigate, activeLinkRef }) {
  const { getLessonStatus } = useProgress()
  const chapters = ALL_CHAPTERS.filter(c => c.course === activeCourse)

  return (
    <div>
      {chapters.map((chapter) => {
        const isActiveChapter = activeChapter === String(chapter.number)
        const chNum    = String(chapter.number).replace(/^.*-/, '')
        const chStatus = chapterStatus(chapter, activeCourse, getLessonStatus)

        return (
          <div key={chapter.number} className="mb-2">
            <Link
              to={`/chapter/${chapter.number}`}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 hover:pl-7 ${isActiveChapter ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
              <ProgressDot status={chStatus} />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] opacity-60 mb-0.5">Chapter {chNum}</span>
                <span className="truncate">{chapter.title}</span>
              </div>
            </Link>

            {chapter.lessons.map((lesson) => {
              const isActive = isActiveChapter && activeSlug === lesson.slug
              const status   = getLessonStatus(`${activeCourse}/${lesson.slug}`, 1)
              const pct      = status === 'complete' ? 100 : status === 'partial' ? 50 : status === 'active' ? 25 : 0

              return (
                <Link
                  key={`${chapter.number}/${lesson.slug}`}
                  ref={el => { if (isActive) activeLinkRef.current = el }}
                  to={`/chapter/${chapter.number}/${lesson.slug}`}
                  onClick={onNavigate}
                  className={`relative mx-4 my-0.5 pl-10 pr-4 py-3 rounded-[1.25rem] flex items-center gap-3 transition-all duration-300 overflow-hidden ${
                    isActive
                      ? 'bg-indigo-600/10 dark:bg-indigo-500/10 text-indigo-700 dark:text-white shadow-[0_0_20px_rgba(79,70,229,0.1)] ring-1 ring-indigo-500/30'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <div
                      className="absolute inset-0 z-[-1] opacity-[0.12] dark:opacity-[0.18]"
                      style={{ background: `linear-gradient(to right, #4f46e5 ${pct}%, transparent ${pct}%)` }}
                    />
                  )}
                  <ProgressDot status={status} />
                  <span className="leading-snug relative z-10 text-sm">{lesson.title}</span>
                  {isActive && pct > 0 && (
                    <span className="ml-auto text-[10px] font-black text-indigo-500/80 dark:text-brand-400/80 tabular-nums relative z-10">
                      {Math.round(pct)}%
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )
      })}

      <div className="px-4 pt-3 pb-4">
        <Link
          to="/courses"
          onClick={onNavigate}
          className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ChevronLeft className="w-3 h-3" />
          All courses
        </Link>
      </div>
    </div>
  )
}
