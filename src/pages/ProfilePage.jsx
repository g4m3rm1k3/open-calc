import { Link } from 'react-router-dom'
import { useMemo, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useProgress } from '../hooks/useProgress.js'
import { buildProgressKey } from '../context/progressMigration.ts'
import { getAllCourses, getChapters } from '../courses/courseLoader.js'
import { GLASS_META } from '../styles/courseColors.js'
import AuthButton from '../components/ui/AuthButton.jsx'
import { CheckCircle2, Play, BookOpen, Clock, RotateCcw } from 'lucide-react'

const ALL_COURSES = getAllCourses()

function StatCard({ label, value }) {
  return (
    <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
      <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{value}</div>
      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, syncing, signOut } = useAuth()
  const { progress, getLessonProgress, resetCourseProgress } = useProgress()
  const [failedPhotoURL, setFailedPhotoURL] = useState(null)

  useEffect(() => {
    document.title = 'Profile - UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [])

  // Every course with at least one real lesson, its lessons (tagged with
  // their chapter route id so links can be built directly), and completion
  // counts — computed once per progress change, reused below for both the
  // stat tiles and the per-course grid.
  const courseStats = useMemo(() => {
    return ALL_COURSES
      .map(course => {
        const chapters = getChapters(course.key)
        const lessons = chapters.flatMap(ch =>
          ch.lessons.map(l => ({ ...l, chapterId: ch.number }))
        )
        const total = lessons.length
        const completed = lessons.filter(
          l => getLessonProgress(buildProgressKey(course.key, l)).status === 'complete'
        ).length
        return { course, lessons, total, completed, pct: total > 0 ? completed / total : 0 }
      })
      .filter(c => c.total > 0)
  }, [getLessonProgress])

  const totalLessons = courseStats.reduce((s, c) => s + c.total, 0)
  const totalCompleted = courseStats.reduce((s, c) => s + c.completed, 0)
  const coursesStarted = courseStats.filter(c => c.completed > 0).length
  const coursesCompleted = courseStats.filter(c => c.completed === c.total).length

  // "Continue where you left off" — every lesson with a lastVisitedAt stamp
  // (written by LessonPage.jsx on open) that isn't already complete, most
  // recent first.
  const continueItems = useMemo(() => {
    const items = []
    for (const { course, lessons } of courseStats) {
      for (const lesson of lessons) {
        const key = buildProgressKey(course.key, lesson)
        const lastVisitedAt = progress[key]?.lastVisitedAt
        if (!lastVisitedAt) continue
        const lp = getLessonProgress(key)
        if (lp.status === 'complete') continue
        items.push({
          key,
          courseLabel: course.label,
          courseColor: course.color,
          chapterId: lesson.chapterId,
          slug: lesson.slug,
          title: lesson.title,
          lastVisitedAt,
          percent: lp.percent,
        })
      }
    }
    return items.sort((a, b) => b.lastVisitedAt - a.lastVisitedAt).slice(0, 6)
  }, [courseStats, progress, getLessonProgress])

  if (user === undefined) return null

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">Your Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Sign in to track progress across devices and pick up right where you left off.
        </p>
        <div className="inline-block">
          <AuthButton />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20 pt-10">
      {/* Header */}
      <div className="flex items-center gap-5 mb-10">
        {user.photoURL && user.photoURL !== failedPhotoURL ? (
          <img
            src={user.photoURL}
            alt=""
            className="w-16 h-16 rounded-full ring-2 ring-brand-500/60"
            onError={() => setFailedPhotoURL(user.photoURL)}
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-2xl font-bold">
            {(user.displayName || user.email || '?')[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 truncate">
            {user.displayName || 'Your Profile'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {syncing ? 'Syncing…' : 'Synced across devices'}
          </p>
        </div>
        <button
          onClick={signOut}
          className="text-sm font-medium text-red-500 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors flex-shrink-0"
        >
          Sign out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
        <StatCard label={`Lessons completed (of ${totalLessons})`} value={totalCompleted} />
        <StatCard label="Courses started" value={coursesStarted} />
        <StatCard label="Courses completed" value={coursesCompleted} />
        <StatCard
          label="Overall progress"
          value={totalLessons > 0 ? `${Math.round((totalCompleted / totalLessons) * 100)}%` : '0%'}
        />
      </div>

      {/* Continue where you left off */}
      {continueItems.length > 0 && (
        <div className="mb-12">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-indigo-500 dark:text-indigo-400" /> Continue where you left off
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {continueItems.map(item => {
              const theme = GLASS_META[item.courseColor] ?? GLASS_META.slate
              return (
                <Link
                  key={item.key}
                  to={`/chapter/${item.chapterId}/${item.slug}`}
                  className="group flex items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all"
                >
                  <div className="min-w-0">
                    <div className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${theme.text}`}>
                      {item.courseLabel}
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">{item.title}</div>
                    {item.percent > 0 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.percent}% complete</div>
                    )}
                  </div>
                  <div className="flex-shrink-0 w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-all">
                    <Play size={14} className="fill-current" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Per-course progress */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-indigo-500 dark:text-indigo-400" /> Your courses
        </h2>
        {coursesStarted === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            You haven't started any courses yet.{' '}
            <Link to="/" className="text-indigo-500 dark:text-indigo-400 hover:underline">Browse courses →</Link>
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {courseStats
              .filter(c => c.completed > 0)
              .sort((a, b) => b.pct - a.pct)
              .map(({ course, total, completed, pct }) => {
                const theme = GLASS_META[course.color] ?? GLASS_META.slate
                return (
                  <div key={course.key} className="relative group">
                    <Link
                      to={course.path}
                      className="block p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center justify-between mb-2 gap-2 pr-6">
                        <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">{course.label}</span>
                        {pct === 1 && <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                        <span>{completed} / {total} lessons</span>
                        <span className={`font-bold ${theme.text}`}>{Math.round(pct * 100)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct === 1 ? 'bg-emerald-500' : theme.bar} transition-all`}
                          style={{ width: `${Math.max(4, pct * 100)}%` }}
                        />
                      </div>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (window.confirm(`Reset all progress for ${course.label}? This can't be undone.`)) {
                          resetCourseProgress(course.key)
                        }
                      }}
                      title={`Reset progress for ${course.label}`}
                      className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
