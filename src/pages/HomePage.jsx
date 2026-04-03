import { Link } from 'react-router-dom'
import { CURRICULUM } from '../content/index.js'
import { useProgress } from '../hooks/useProgress.js'

const CHAPTER_GRADIENTS = {
  0: 'from-slate-500 to-slate-600',
  1: 'from-blue-500 to-blue-700',
  2: 'from-emerald-500 to-emerald-700',
  3: 'from-purple-500 to-purple-700',
  4: 'from-orange-500 to-orange-700',
  5: 'from-rose-500 to-rose-700',
  6: 'from-cyan-500 to-cyan-700',
  p0: 'from-slate-500 to-slate-600',
  p1: 'from-red-500 to-red-700',
  p2: 'from-orange-500 to-orange-700',
  p3: 'from-yellow-500 to-yellow-700',
  p4: 'from-teal-500 to-teal-700',
  p5: 'from-blue-500 to-blue-700',
  p6: 'from-fuchsia-500 to-fuchsia-700',
  'geometry-1': 'from-indigo-500 to-indigo-700',
  'geometry-2': 'from-blue-500 to-blue-700',
  'geometry-3': 'from-emerald-500 to-emerald-700',
  'geometry-4': 'from-purple-500 to-purple-700',
  'geometry-5': 'from-orange-500 to-orange-700',
  'geometry-6': 'from-rose-500 to-rose-700',
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

      <section className="mb-12 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-gradient-to-r from-slate-50 to-brand-50/40 dark:from-slate-900/40 dark:to-brand-950/20">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Choose How You Learn</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-3xl">
          Not everyone learns calculus the same way. Pick a route for exam prep, intuition, proofs, or career applications, then jump between paths whenever needed.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/paths" className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm hover:bg-brand-700 transition-colors">Open learning paths</Link>
          <Link to="/chapter/0/05-assignment-playbook" className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-700 dark:text-slate-200 hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">Start with assignment playbook</Link>
        </div>
      </section>

      {/* Curriculum */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Curriculum</h2>
        <div className="space-y-6">
          {CURRICULUM.map((chapter) => {
            const grad = CHAPTER_GRADIENTS[chapter.number] ?? CHAPTER_GRADIENTS[0]
            const chLessonsCompleted = chapter.lessons.filter(
              (l) => getLessonStatus(l.id, l.checkpoints?.length ?? 1) === 'complete'
            ).length
            return (
              <div key={chapter.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <Link
                  to={`/chapter/${chapter.number}`}
                  className={`block bg-gradient-to-r ${grad} p-5 text-white hover:opacity-95 transition-opacity`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm opacity-75 font-medium mb-0.5">Chapter {chapter.number}</p>
                      <h3 className="text-xl font-bold">{chapter.title}</h3>
                    </div>
                    {chapter.comingSoon ? (
                      <span className="px-2 py-1 bg-white/20 rounded-full text-xs">Coming soon</span>
                    ) : (
                      <span className="text-sm opacity-75">{chLessonsCompleted}/{chapter.lessons.length} done</span>
                    )}
                  </div>
                  <p className="text-sm opacity-80 mt-2 leading-relaxed">{chapter.description}</p>
                </Link>

                {!chapter.comingSoon && chapter.lessons.length > 0 && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {chapter.lessons.map((lesson, i) => {
                      const status = getLessonStatus(lesson.id, lesson.checkpoints?.length ?? 1)
                      return (
                        <Link
                          key={lesson.id}
                          to={`/chapter/${chapter.number}/${lesson.slug}`}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <span className="text-slate-400 dark:text-slate-500 text-sm font-mono w-5 text-right">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{lesson.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{lesson.subtitle}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {status === 'complete' && <span className="text-emerald-500 text-xs font-medium">✓ Done</span>}
                            {status === 'in-progress' && <span className="text-amber-500 text-xs font-medium">In progress</span>}
                            <span className="text-slate-300 dark:text-slate-600">→</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
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
