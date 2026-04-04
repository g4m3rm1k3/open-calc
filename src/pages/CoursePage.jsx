import { useParams, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { CURRICULUM, COURSES } from '../content/index.js'
import { useProgress } from '../hooks/useProgress.js'

const COURSE_GRADIENTS = {
  indigo:  'from-indigo-500 to-indigo-700',
  blue:    'from-blue-500 to-blue-700',
  emerald: 'from-emerald-500 to-emerald-700',
  red:     'from-red-500 to-red-700',
  purple:  'from-purple-500 to-purple-700',
  orange:  'from-orange-500 to-orange-700',
  teal:    'from-teal-500 to-teal-700',
  amber:   'from-amber-500 to-amber-700',
  sky:     'from-sky-500 to-sky-700',
  cyan:    'from-cyan-500 to-cyan-700',
  rose:    'from-rose-500 to-rose-700',
}

export default function CoursePage() {
  const { courseKey } = useParams()
  const { getLessonStatus } = useProgress()

  const course = COURSES.find(c => c.key === courseKey)
  const chapters = CURRICULUM.filter(ch => ch.course === courseKey)

  useEffect(() => {
    if (course) document.title = `${course.label} — OpenCalc`
    return () => { document.title = 'OpenCalc' }
  }, [course?.key])

  if (!course || chapters.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl text-slate-700 dark:text-slate-300">Course not found</h2>
        <Link to="/" className="text-brand-600 mt-4 block hover:underline">← Back to home</Link>
      </div>
    )
  }

  const grad = COURSE_GRADIENTS[course.color] ?? 'from-slate-500 to-slate-600'
  const totalLessons = chapters.reduce((s, ch) => s + ch.lessons.length, 0)
  const completedLessons = chapters.reduce((s, ch) =>
    s + ch.lessons.filter(l => getLessonStatus(l.id, l.checkpoints?.length ?? 1) === 'complete').length
  , 0)

  return (
    <div>
      <Link to="/" className="text-sm text-brand-600 dark:text-brand-400 hover:underline mb-6 inline-block">← All courses</Link>

      {/* Course header */}
      <div className={`bg-gradient-to-r ${grad} rounded-2xl p-8 text-white mb-8`}>
        <h1 className="text-3xl font-bold mb-1">{course.label}</h1>
        <p className="text-white/80 mb-4">{course.desc}</p>
        <div className="flex items-center gap-3 text-sm text-white/70 flex-wrap">
          <span>{chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}</span>
          <span>·</span>
          <span>{totalLessons} lessons</span>
          {completedLessons > 0 && (
            <>
              <span>·</span>
              <span className="text-white font-medium">{completedLessons}/{totalLessons} complete</span>
            </>
          )}
        </div>
        {totalLessons > 0 && completedLessons > 0 && (
          <div className="mt-4 h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white/70 transition-all"
              style={{ width: `${(completedLessons / totalLessons) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Chapter list */}
      <div className="space-y-3">
        {chapters.map((chapter) => {
          const chLessons = chapter.lessons.length
          const chCompleted = chapter.lessons.filter(l =>
            getLessonStatus(l.id, l.checkpoints?.length ?? 1) === 'complete'
          ).length
          const pct = chLessons > 0 ? chCompleted / chLessons : 0

          return (
            <Link
              key={chapter.id ?? chapter.number}
              to={chapter.comingSoon ? '#' : `/chapter/${chapter.number}`}
              className={`block p-5 rounded-xl border bg-white dark:bg-slate-900 transition-all ${
                chapter.comingSoon
                  ? 'border-slate-200 dark:border-slate-800 opacity-60 cursor-default'
                  : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md'
              }`}
              onClick={chapter.comingSoon ? (e) => e.preventDefault() : undefined}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                      {typeof chapter.number === 'number'
                        ? `Ch. ${chapter.number}`
                        : String(chapter.number)}
                    </span>
                    {chapter.comingSoon && (
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">coming soon</span>
                    )}
                  </div>
                  <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{chapter.title}</h2>
                  {chapter.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{chapter.description}</p>
                  )}
                  {chLessons > 0 && !chapter.comingSoon && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-1">
                        <span>{chLessons} {chLessons === 1 ? 'lesson' : 'lessons'}</span>
                        {chCompleted > 0 && <span>{chCompleted}/{chLessons} done</span>}
                      </div>
                      <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-500 transition-all"
                          style={{ width: `${pct > 0 ? Math.max(4, pct * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-sm mt-1">
                  {!chapter.comingSoon && (
                    pct === 1
                      ? <span className="text-emerald-500 font-medium">✓ Done</span>
                      : pct > 0
                        ? <span className="text-amber-500">In progress</span>
                        : <span className="text-slate-400 dark:text-slate-500">→</span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
