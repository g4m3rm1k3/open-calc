import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { getAllCourses } from '../../../courses/courseLoader.js'
import { GLASS_META } from '../../../styles/courseColors.js'

const ALL_COURSES = getAllCourses()

export default function CoursesPanel({ onNavigate }) {
  return (
    <div className="px-3">
      {ALL_COURSES.map(c => {
        const meta = GLASS_META[c.color] ?? GLASS_META.slate
        return (
          <Link
            key={c.key}
            to={c.path}
            onClick={onNavigate}
            className="flex items-center justify-between px-3 py-2.5 mb-0.5 rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${meta.header} flex items-center justify-center text-base shrink-0 shadow-sm`}>
                {c.icon}
              </div>
              <div className="min-w-0">
                <div className={`text-sm font-semibold leading-tight ${meta.text}`}>{c.label}</div>
                <div className="text-xs text-slate-400 dark:text-slate-500 truncate">{c.description}</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 shrink-0 ml-2" />
          </Link>
        )
      })}
    </div>
  )
}
