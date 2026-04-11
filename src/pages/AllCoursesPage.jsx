import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { COURSES, CURRICULUM } from '../content/index.js'
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
  pink:    'from-pink-500 to-pink-700',
  violet:  'from-violet-500 to-violet-700',
  lime:    'from-lime-500 to-lime-700',
  slate:   'from-slate-500 to-slate-600',
  fuchsia: 'from-fuchsia-500 to-fuchsia-700',
}

const COURSE_BG = {
  indigo:  'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600',
  blue:    'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600',
  red:     'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600',
  purple:  'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600',
  orange:  'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600',
  teal:    'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 hover:border-teal-400 dark:hover:border-teal-600',
  amber:   'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600',
  sky:     'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800 hover:border-sky-400 dark:hover:border-sky-600',
  cyan:    'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800 hover:border-cyan-400 dark:hover:border-cyan-600',
  rose:    'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 hover:border-rose-400 dark:hover:border-rose-600',
  pink:    'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800 hover:border-pink-400 dark:hover:border-pink-600',
  violet:  'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 hover:border-violet-400 dark:hover:border-violet-600',
  lime:    'bg-lime-50 dark:bg-lime-950/30 border-lime-200 dark:border-lime-800 hover:border-lime-400 dark:hover:border-lime-600',
  slate:   'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500',
  fuchsia: 'bg-fuchsia-50 dark:bg-fuchsia-950/30 border-fuchsia-200 dark:border-fuchsia-800 hover:border-fuchsia-400 dark:hover:border-fuchsia-600',
}

const COURSE_LABEL_COLOR = {
  indigo:  'text-indigo-700 dark:text-indigo-300',
  blue:    'text-blue-700 dark:text-blue-300',
  emerald: 'text-emerald-700 dark:text-emerald-300',
  red:     'text-red-700 dark:text-red-300',
  purple:  'text-purple-700 dark:text-purple-300',
  orange:  'text-orange-700 dark:text-orange-300',
  teal:    'text-teal-700 dark:text-teal-300',
  amber:   'text-amber-700 dark:text-amber-300',
  sky:     'text-sky-700 dark:text-sky-300',
  cyan:    'text-cyan-700 dark:text-cyan-300',
  rose:    'text-rose-700 dark:text-rose-300',
  pink:    'text-pink-700 dark:text-pink-300',
  violet:  'text-violet-700 dark:text-violet-300',
  lime:    'text-lime-700 dark:text-lime-300',
  slate:   'text-slate-700 dark:text-slate-300',
  fuchsia: 'text-fuchsia-700 dark:text-fuchsia-300',
}

export default function AllCoursesPage() {
  const { getLessonStatus } = useProgress()

  useEffect(() => {
    document.title = 'All Courses — OpenCalc'
    return () => { document.title = 'OpenCalc' }
  }, [])

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">All Courses</h1>
        <p className="text-slate-500 dark:text-slate-400">
          {COURSES.length} courses — pick up where you left off or start something new.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COURSES.map((course) => {
          const chapters = CURRICULUM.filter(ch => ch.course === course.key)
          const totalLessons = chapters.reduce((s, ch) => s + ch.lessons.length, 0)
          const completedLessons = chapters.reduce((s, ch) =>
            s + ch.lessons.filter(l =>
              getLessonStatus(l.id, l.checkpoints?.length ?? 1) === 'complete'
            ).length
          , 0)
          const pct = totalLessons > 0 ? completedLessons / totalLessons : 0
          const grad = COURSE_GRADIENTS[course.color] ?? COURSE_GRADIENTS.slate
          const bg   = COURSE_BG[course.color]        ?? COURSE_BG.slate
          const lbl  = COURSE_LABEL_COLOR[course.color] ?? 'text-slate-700 dark:text-slate-300'

          // First lesson in the course for direct jump
          const firstChapter = chapters[0]
          const firstLesson  = firstChapter?.lessons?.[0]
          const startPath    = firstLesson
            ? `/chapter/${firstChapter.number}/${firstLesson.slug}`
            : course.path

          return (
            <Link
              key={course.key}
              to={course.path}
              className={`group flex flex-col rounded-2xl border p-5 transition-all hover:shadow-md ${bg}`}
            >
              {/* Colour dot + label */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase tracking-widest ${lbl}`}>
                  {course.label}
                </span>
                {completedLessons > 0 && (
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    {completedLessons}/{totalLessons}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug flex-1 mb-4">
                {course.desc}
              </p>

              {/* Progress bar */}
              <div className="h-1 rounded-full bg-slate-200 dark:bg-slate-700 mb-4 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all`}
                  style={{ width: pct > 0 ? `${Math.max(4, pct * 100)}%` : '0%' }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                <span>
                  {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
                  {totalLessons > 0 && ` · ${totalLessons} lessons`}
                </span>
                <span className={`font-semibold group-hover:opacity-100 transition-opacity ${lbl}`}>
                  {pct > 0 ? 'Continue →' : 'Start →'}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
