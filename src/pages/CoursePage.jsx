import { useParams, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { getCourseMeta, getChapters } from '../courses/courseLoader.js'
import { useProgress } from '../hooks/useProgress.js'
import { GLASS_META } from '../styles/courseColors.js'

export default function CoursePage() {
  const { courseKey } = useParams()
  const { getLessonStatus } = useProgress()

  const meta     = getCourseMeta(courseKey)
  const chapters = getChapters(courseKey)

  useEffect(() => {
    if (meta?.label) document.title = `${meta.label} — UpSkillOS`
    return () => { document.title = 'UpSkillOS' }
  }, [meta?.label])

  if (!meta || chapters.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl text-slate-700 dark:text-slate-300">Course not found</h2>
        <Link to="/" className="text-brand-600 mt-4 block hover:underline">← Back to home</Link>
      </div>
    )
  }

  const grad = GLASS_META[meta.color]?.header ?? 'from-slate-500 to-slate-600'
  const totalLessons = chapters.reduce((s, ch) => s + ch.lessons.length, 0)
  const completedLessons = chapters.reduce((s, ch) =>
    s + ch.lessons.filter(l => getLessonStatus(`${courseKey}/${l.slug}`, 1) === 'complete').length
  , 0)

  return (
    <div>
      <Link to="/" className="text-sm text-brand-600 dark:text-brand-400 hover:underline mb-6 inline-block">← All courses</Link>

      <div className={`bg-gradient-to-r ${grad} rounded-2xl p-8 text-white mb-8`}>
        <h1 className="text-3xl font-bold mb-1">{meta.label}</h1>
        <p className="text-white/80 mb-4">{meta.description}</p>
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

      <div className="space-y-3">
        {chapters.map((chapter) => {
          const chLessons = chapter.lessons.length
          const chCompleted = chapter.lessons.filter(l =>
            getLessonStatus(`${courseKey}/${l.slug}`, 1) === 'complete'
          ).length
          const pct = chLessons > 0 ? chCompleted / chLessons : 0

          return (
            <Link
              key={chapter.number}
              to={`/chapter/${chapter.number}`}
              className="block p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md bg-white dark:bg-slate-900 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 mb-1 block">
                    Ch. {chapter.number.replace(/^.*-/, '')}
                  </span>
                  <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{chapter.title}</h2>
                  {chLessons > 0 && (
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
                  {pct === 1
                    ? <span className="text-emerald-500 font-medium">✓ Done</span>
                    : pct > 0
                      ? <span className="text-amber-500">In progress</span>
                      : <span className="text-slate-400 dark:text-slate-500">→</span>
                  }
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
