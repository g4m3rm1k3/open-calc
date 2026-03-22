import { useParams, Link } from 'react-router-dom'
import { CURRICULUM } from '../content/index.js'
import { useProgress } from '../hooks/useProgress.js'

export default function ChapterPage() {
  const { chapterId } = useParams()
  const chapter = CURRICULUM.find((c) => String(c.number) === chapterId)
  const { getLessonStatus } = useProgress()

  if (!chapter) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl text-slate-700 dark:text-slate-300">Chapter not found</h2>
        <Link to="/" className="text-brand-600 mt-4 block hover:underline">Back to home</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/" className="text-sm text-brand-600 dark:text-brand-400 hover:underline mb-4 inline-block">← All chapters</Link>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Chapter {chapter.number}: {chapter.title}</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">{chapter.description}</p>

      {chapter.comingSoon ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-4xl mb-3">🚧</p>
          <p className="text-slate-600 dark:text-slate-400">This chapter is coming soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chapter.lessons.map((lesson, i) => {
            const status = getLessonStatus(lesson.id, lesson.checkpoints?.length ?? 3)
            return (
              <Link
                key={lesson.id}
                to={`/chapter/${chapter.number}/${lesson.slug}`}
                className="block p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <span className="text-slate-400 dark:text-slate-500 text-sm font-mono mt-1 w-6 text-right">{i + 1}</span>
                  <div className="flex-1">
                    <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{lesson.title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic mb-3">{lesson.subtitle}</p>
                    <div className="flex gap-2 flex-wrap">
                      {lesson.tags?.slice(0, 4).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {status === 'complete' && <span className="text-emerald-500 text-sm font-medium">✓ Complete</span>}
                    {status === 'in-progress' && <span className="text-amber-500 text-sm font-medium">In progress</span>}
                    {status === 'not-started' && <span className="text-slate-400 text-sm">Not started</span>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
