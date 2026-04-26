import { Link } from "react-router-dom";
import { CURRICULUM, COURSES } from "../content/index.js";
import { useProgress } from "../hooks/useProgress.js";

const COURSE_GRADIENTS = {
  indigo: "from-indigo-500 to-indigo-700",
  blue: "from-blue-500 to-blue-700",
  emerald: "from-emerald-500 to-emerald-700",
  red: "from-red-500 to-red-700",
  purple: "from-purple-500 to-purple-700",
  orange: "from-orange-500 to-orange-700",
  teal: "from-teal-500 to-teal-700",
  amber: "from-amber-500 to-amber-700",
  sky: "from-sky-500 to-sky-700",
  cyan: "from-cyan-500 to-cyan-700",
  rose: "from-rose-500 to-rose-700",
};

export default function HomePage() {
  const { getLessonStatus } = useProgress();

  const totalLessons = CURRICULUM.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
  const completedLessons = CURRICULUM.reduce(
    (sum, chapter) =>
      sum +
      chapter.lessons.filter(
        (lesson) => getLessonStatus(lesson.id, lesson.checkpoints?.length ?? 1) === "complete",
      ).length,
    0,
  );

  return (
    <div>
      <section className="oc-shell-card relative mb-12 overflow-hidden px-6 py-10 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_22%)]" />
        <div className="relative text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 dark:border-brand-800 bg-brand-50/90 dark:bg-brand-950/40 px-4 py-1.5 text-sm font-semibold text-brand-700 dark:text-brand-300">
            <span className="text-lg">⚡</span>
            Intuition-first learning workspace
          </div>
          <h1 className="mb-4 text-4xl font-black tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl">
            OpenCalc
          </h1>
          <p className="mx-auto mb-6 max-w-3xl text-lg leading-9 text-slate-600 dark:text-slate-300 sm:text-xl">
            An open-source interactive platform for math, science, engineering, and programming.
            Build real understanding with <strong>intuition first</strong>, live visuals, in-browser
            code, and rigorous explanations that still feel readable.
          </p>

          {totalLessons > 0 && (
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-2 text-sm shadow-sm">
              <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all"
                  style={{ width: `${(completedLessons / totalLessons) * 100}%` }}
                />
              </div>
              <span className="text-slate-600 dark:text-slate-300">
                {completedLessons}/{totalLessons} lessons completed
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="mb-12 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: "🧠",
            title: "Intuition First",
            desc: 'Every topic starts with a real-world question and a visual. Build the "why" before the "how."',
          },
          {
            icon: "⌨️",
            title: "Learn by Doing",
            desc: "Write and run Python or JavaScript directly in the browser. No installs, no accounts, just experiments.",
          },
          {
            icon: "∴",
            title: "Rigorous Depth",
            desc: "Step-by-step proofs, derivations, and worked examples when you want more than a surface answer.",
          },
        ].map((item) => (
          <div key={item.title} className="oc-soft-panel p-5">
            <div className="mb-2 text-2xl">{item.icon}</div>
            <h3 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{item.desc}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-6 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">
          Curriculum
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Link
            to="/ai-engineering"
            className="oc-shell-card overflow-hidden transition-all group hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-lg"
          >
            <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 p-5 text-white">
              <h3 className="mb-0.5 text-xl font-bold">AI Engineering</h3>
              <p className="text-sm opacity-85">
                Imported course with Pyodide-backed runnable Python lessons.
              </p>
            </div>
            <div className="bg-white p-4 dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">New course · curated import</span>
                <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
                  Start ported lessons
                </span>
              </div>
              <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                OpenCalc-native reading, quizzes, and in-browser Python for the browser-safe parts
                of the external course.
              </div>
            </div>
          </Link>

          {COURSES.map((course) => {
            const chapters = CURRICULUM.filter((chapter) => chapter.course === course.key);
            if (chapters.length === 0) return null;

            const courseTotalLessons = chapters.reduce(
              (sum, chapter) => sum + chapter.lessons.length,
              0,
            );
            const courseCompleted = chapters.reduce(
              (sum, chapter) =>
                sum +
                chapter.lessons.filter(
                  (lesson) =>
                    getLessonStatus(lesson.id, lesson.checkpoints?.length ?? 1) === "complete",
                ).length,
              0,
            );
            const grad = COURSE_GRADIENTS[course.color] ?? "from-slate-500 to-slate-600";
            const pct = courseTotalLessons > 0 ? courseCompleted / courseTotalLessons : 0;

            return (
              <Link
                key={course.key}
                to={course.path}
                className="oc-shell-card overflow-hidden transition-all group hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg"
              >
                <div className={`bg-gradient-to-r ${grad} p-5 text-white`}>
                  <h3 className="mb-0.5 text-xl font-bold">{course.label}</h3>
                  <p className="text-sm opacity-80">{course.desc}</p>
                </div>
                <div className="bg-white p-4 dark:bg-slate-900">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"} ·{" "}
                      {courseTotalLessons} lessons
                    </span>
                    {courseCompleted > 0 && (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {courseCompleted}/{courseTotalLessons} done
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${pct > 0 ? Math.max(4, pct * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="mt-16 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        <p>
          OpenCalc is free, open source, and runs entirely in your browser.{" "}
          <Link to="/about" className="text-brand-600 hover:underline dark:text-brand-400">
            Learn more
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
