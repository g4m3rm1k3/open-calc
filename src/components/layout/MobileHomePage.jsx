import { Link } from "react-router-dom";
import { COURSES, ALL_LESSONS } from "../../courses/index.js";
import { useProgress } from "../../hooks/useProgress.js";

// The actual mobile home screen — previously mobile visitors at "/" just saw
// the full-screen desktop wallpaper graph (CodeMapBackground) meant to sit
// behind the Start Menu/Taskbar desktop metaphor, with no real content of
// their own. Built from COURSES (same source the desktop Start Menu reads),
// so this can't drift out of sync with the real course list the way a
// hand-written nav array would.
export default function MobileHomePage() {
  const { progress } = useProgress();

  const inProgress = Object.entries(progress ?? {})
    .filter(([, entry]) => (entry?.completedCheckpoints?.length ?? 0) > 0 || (entry?.readingProgress ?? 0) > 0)
    .filter(([, entry]) => !(entry?.quiz?.total > 0 && entry.quiz.correct >= entry.quiz.total))
    .slice(-3)
    .reverse()
    .map(([slug]) => ALL_LESSONS.find(l => l.slug === slug))
    .filter(Boolean);

  return (
    <div className="px-4 pt-4 pb-8 max-w-screen-sm mx-auto">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
        Welcome back
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Pick up a course or jump back into a lesson.
      </p>

      {inProgress.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            Continue learning
          </h2>
          <div className="space-y-2">
            {inProgress.map(lesson => (
              <Link
                key={lesson.slug}
                to={`/chapter/${lesson.chapterNumber}/${lesson.slug}`}
                className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-transform"
              >
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {lesson.title}
                </span>
                <span className="text-brand-600 dark:text-brand-400 text-sm shrink-0">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section data-tour="courses-grid">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          Courses
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {COURSES.map(course => (
            <Link
              key={course.key}
              to={course.path}
              className="flex flex-col gap-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-transform"
            >
              <span className="text-2xl leading-none">{course.icon}</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {course.label}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                {course.description}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
