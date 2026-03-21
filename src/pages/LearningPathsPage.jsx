import { Link } from 'react-router-dom'
import { CURRICULUM } from '../content/index.js'
import { LEARNING_PATHS } from '../content/learningPaths.js'

const LESSON_TO_CHAPTER = Object.fromEntries(
  CURRICULUM.flatMap((ch) => ch.lessons.map((l) => [l.slug, ch.number]))
)

function LessonPill({ slug }) {
  const chapter = LESSON_TO_CHAPTER[slug]
  if (chapter === undefined) {
    return (
      <span className="px-2 py-1 rounded-full text-xs bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
        missing: {slug}
      </span>
    )
  }

  return (
    <Link
      to={`/chapter/${chapter}/${slug}`}
      className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700 hover:bg-brand-100 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-brand-950/40 dark:hover:text-brand-300"
    >
      {slug}
    </Link>
  )
}

export default function LearningPathsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Learning Paths</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Choose your route based on how you learn: why-first, how-first, proof-first, exam-first, or career-first.
          You can switch paths anytime. Every path still lands on complete Calc 1 competence and Calc 2 readiness.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {LEARNING_PATHS.map((path) => (
          <article key={path.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 bg-white dark:bg-slate-900/40">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{path.title}</h2>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">{path.audience}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{path.promise}</p>

            <div className="flex flex-wrap gap-2">
              {path.lessons.map((slug) => (
                <LessonPill key={`${path.id}-${slug}`} slug={slug} />
              ))}
            </div>
          </article>
        ))}
      </section>

      <div>
        <Link to="/" className="text-brand-600 dark:text-brand-400 hover:underline">Back to curriculum</Link>
      </div>
    </div>
  )
}
