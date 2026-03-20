import { Link } from 'react-router-dom'
import { CURRICULUM } from '../../content/index.js'

function findLesson(slug) {
  for (const ch of CURRICULUM) {
    const lesson = ch.lessons.find((l) => l.slug === slug)
    if (lesson) return { lesson, chapter: ch }
  }
  return null
}

export default function CrossRef({ lessonSlug, label, context }) {
  const found = findLesson(lessonSlug)
  if (!found) return null

  const { chapter } = found

  return (
    <Link
      to={`/chapter/${chapter.number}/${lessonSlug}`}
      className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 hover:bg-brand-50/50 dark:hover:bg-brand-950/30 transition-colors group no-underline"
    >
      <span className="text-brand-400 group-hover:text-brand-500 mt-0.5 flex-shrink-0">→</span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-brand-600 dark:text-brand-400 group-hover:text-brand-700">{label}</p>
        {context && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{context}</p>}
      </div>
    </Link>
  )
}
