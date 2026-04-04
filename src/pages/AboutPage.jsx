import { Link } from 'react-router-dom'

const COURSES = [
  { emoji: '📐', label: 'Pre-Calculus',       desc: 'Functions, graphs, transformations, trigonometry' },
  { emoji: '📏', label: 'Geometry',            desc: 'Proofs, constructions, similarity, circles, coordinates' },
  { emoji: '∫',  label: 'Calculus',            desc: 'Limits, derivatives, applications, integration, series (ch 0–6)' },
  { emoji: '⚡', label: 'Physics',             desc: 'Mechanics, kinematics, forces, waves' },
  { emoji: '🔢', label: 'Discrete Math',       desc: 'Logic, sets, induction, combinatorics, graph theory' },
  { emoji: '🔷', label: 'Linear Algebra',      desc: 'Vectors, matrices, transformations, eigenvalues' },
  { emoji: '🐍', label: 'Python Programming',  desc: 'Core language, data structures, algorithms' },
  { emoji: '📊', label: 'Data Science',        desc: 'NumPy, Pandas, visualization, ML foundations' },
  { emoji: '🌐', label: 'JavaScript Core',     desc: 'Language fundamentals and runtime mechanics' },
  { emoji: '🖥️', label: 'Web Systems',         desc: 'DOM, reactivity, APIs' },
  { emoji: '🎮', label: 'Build Tetris',        desc: 'Build a complete game from scratch — project-driven' },
]

const STACK = [
  { name: 'React 18 + Vite',  role: 'UI and build' },
  { name: 'D3.js',            role: '2D interactive visualizations' },
  { name: 'Three.js',         role: '3D visualizations' },
  { name: 'KaTeX',            role: 'Math rendering' },
  { name: 'Pyodide',          role: 'Python runtime in the browser — no server needed' },
  { name: 'Tailwind CSS',     role: 'Styling with full dark mode' },
  { name: 'Fuse.js',          role: 'Full-text search across all lessons' },
]

function H2({ children }) {
  return <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-3">{children}</h2>
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">About open-calc</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">An open-source interactive STEM platform</p>

      <div className="text-slate-700 dark:text-slate-300 space-y-3 text-sm leading-relaxed">
        <p>
          <strong>open-calc</strong> is built on the belief that intuition and rigour are not opposites —
          they reinforce each other. Every lesson follows the same four-stage cycle:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-4">
          {[
            { label: 'Hook',      desc: 'A real-world question that makes the concept feel necessary' },
            { label: 'Intuition', desc: 'Geometric or physical reasoning with interactive visualizations' },
            { label: 'Math',      desc: 'Precise definitions, theorems, and worked examples' },
            { label: 'Rigor',     desc: 'Step-by-step proof synchronized with a live visualization' },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3">
              <div className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-0.5">{s.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{s.desc}</div>
            </div>
          ))}
        </div>

        <p>
          Students can write and run Python and JavaScript directly in the browser — no installation required.
          Python is powered by Pyodide (WebAssembly) with a built-in <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">opencalc</code> visualization
          library for plotting graphs, vectors, and geometry with one line of code.
        </p>

        <H2>Courses</H2>
        <div className="space-y-1.5">
          {COURSES.map(c => (
            <div key={c.label} className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <span className="text-base shrink-0 mt-0.5">{c.emoji}</span>
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{c.label} </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">— {c.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <H2>Technology</H2>
        <p>Runs entirely in the browser — no backend, no account required:</p>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mt-3">
          {STACK.map((s, i) => (
            <div key={s.name} className={`flex items-center gap-3 px-4 py-2.5 text-sm border-b border-slate-100 dark:border-slate-800 last:border-0 ${i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-900/30'}`}>
              <code className="font-mono text-xs text-brand-600 dark:text-brand-400 shrink-0 w-36">{s.name}</code>
              <span className="text-slate-500 dark:text-slate-400">{s.role}</span>
            </div>
          ))}
        </div>

        <H2>Open Source</H2>
        <p>
          open-calc is a pure static site — deploy it to GitHub Pages, Netlify, Vercel, or any
          static host for free. Content is stored as plain JavaScript files, making it straightforward
          to contribute new lessons, fix errors, or add visualizations via pull request.
        </p>
        <p>
          New to contributing? Click the{' '}
          <span className="inline-flex items-center gap-1 font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">? Contributor Docs</span>
          {' '}button in the top navigation for an interactive guided tutorial — no coding experience required to add your first lesson.
        </p>

        <H2>Roadmap</H2>
        <ul className="space-y-1.5 text-sm">
          {[
            { done: true,  text: 'Calculus (chapters 0–6): prerequisites through integration and series' },
            { done: true,  text: 'Pre-calculus (5 chapters), Geometry (6 chapters)' },
            { done: true,  text: 'Physics, Discrete Math, Linear Algebra' },
            { done: true,  text: 'Python Programming, Data Science, JavaScript Core' },
            { done: true,  text: 'Web Systems, project-driven courses (Build Tetris)' },
            { done: true,  text: 'Interactive Python and JavaScript notebooks in the browser' },
            { done: true,  text: 'Multi-style learning pathways (intuition-first, proof-first, project-first)' },
            { done: false, text: 'Ongoing quality pass — deeper proofs, more worked examples, richer viz' },
            { done: false, text: 'Differential equations, probability/statistics' },
            { done: false, text: 'More project-driven courses (build a raytracer, build a physics engine)' },
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5">{item.done ? '✅' : '📅'}</span>
              <span className={item.done ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-500'}>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <Link to="/" className="text-brand-600 dark:text-brand-400 hover:underline text-sm">← Back to curriculum</Link>
      </div>
    </div>
  )
}
