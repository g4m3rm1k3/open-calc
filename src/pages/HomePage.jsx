import { Link } from 'react-router-dom'
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

export default function HomePage() {
  const { getLessonStatus } = useProgress()

  const totalLessons = CURRICULUM.reduce((s, ch) => s + ch.lessons.length, 0)
  const completedLessons = CURRICULUM.reduce((s, ch) =>
    s + ch.lessons.filter((l) => getLessonStatus(l.id, l.checkpoints?.length ?? 1) === 'complete').length
  , 0)

  return (
    <div>
      {/* Hero */}
      <section className="text-center py-12 mb-12">
        <div className="inline-block text-6xl mb-4">∂</div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">OpenCalc</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-6">
          An open-source interactive calculus textbook. Learn with <strong>intuition first</strong>, backed by interactive visualizations, complete worked examples, and rigorous proofs — all in one place.
        </p>

        {totalLessons > 0 && (
          <div className="inline-flex items-center gap-3 bg-brand-50 dark:bg-brand-950/40 px-4 py-2 rounded-full text-sm">
            <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all"
                style={{ width: `${(completedLessons / totalLessons) * 100}%` }}
              />
            </div>
            <span className="text-slate-600 dark:text-slate-400">
              {completedLessons}/{totalLessons} lessons completed
            </span>
          </div>
        )}
      </section>

      {/* How to use */}
      <section className="mb-12 grid sm:grid-cols-3 gap-4">
        {[
          { icon: '🧠', title: 'Intuition First', desc: 'Every topic starts with a real-world question and a visual. Build the "why" before the "how."' },
          { icon: '📐', title: 'Complete Math', desc: 'Every algebra step is shown. No "obviously" or "it can be shown" — just clear, traceable reasoning.' },
          { icon: '∴ Rigor', icon2: '∴', title: 'Formal Proofs', desc: 'The rigorous layer for when you want to understand why things are actually true.' },
        ].map((item, i) => (
          <div key={i} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="text-2xl mb-2">{item.icon2 ?? item.icon}</div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{item.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>



      {/* Curriculum */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Curriculum</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {COURSES.map((course) => {
            const chapters = CURRICULUM.filter(c => c.course === course.key)
            if (chapters.length === 0) return null
            const courseTotalLessons = chapters.reduce((s, c) => s + c.lessons.length, 0)
            const courseCompleted = chapters.reduce((s, c) =>
              s + c.lessons.filter(l => getLessonStatus(l.id, l.checkpoints?.length ?? 1) === 'complete').length
            , 0)
            const grad = COURSE_GRADIENTS[course.color] ?? 'from-slate-500 to-slate-600'
            const pct = courseTotalLessons > 0 ? courseCompleted / courseTotalLessons : 0
            return (
              <Link
                key={course.key}
                to={course.path}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
              >
                <div className={`bg-gradient-to-r ${grad} p-5 text-white`}>
                  <h3 className="text-xl font-bold mb-0.5">{course.label}</h3>
                  <p className="text-sm opacity-80">{course.desc}</p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'} · {courseTotalLessons} lessons
                    </span>
                    {courseCompleted > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                        {courseCompleted}/{courseTotalLessons} done
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${pct > 0 ? Math.max(4, pct * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>OpenCalc is free and open source. <Link to="/about" className="text-brand-600 dark:text-brand-400 hover:underline">Learn more</Link>.</p>
      </footer>
    </div>
  )
}
