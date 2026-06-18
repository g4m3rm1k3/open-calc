import { Link } from 'react-router-dom'
import { CURRICULUM } from '../../courses/index.js'
import { ArrowRight } from 'lucide-react'

function findLesson(slug) {
  for (const ch of CURRICULUM) {
    const lesson = ch.lessons.find((l) => l.slug === slug)
    if (lesson) return { lesson, chapter: ch }
  }
  return null
}

export default function CrossRef({ lessonSlug, slug, label, reason, context }) {
  const resolvedSlug = lessonSlug ?? slug
  const resolvedLabel = label ?? reason
  const resolvedContext = context
  const found = findLesson(resolvedSlug)
  if (!found) return null

  const { chapter } = found

  return (
    <Link
      to={`/chapter/${chapter.number}/${resolvedSlug}`}
      className="oc-soft-panel group p-5 flex items-start gap-4 no-underline hover:-translate-y-1 hover:shadow-md"
    >
      <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-all">
        <ArrowRight className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 group-hover:text-brand-500">Related Concept</p>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 leading-tight">
          {resolvedLabel}
        </p>
        {resolvedContext && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{resolvedContext}</p>}
      </div>
    </Link>
  )
}
