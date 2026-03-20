import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">About OpenCalc</h1>

      <div className="prose-content text-slate-700 dark:text-slate-300 space-y-4">
        <p>
          <strong>OpenCalc</strong> is an open-source interactive calculus textbook built on the belief that
          mathematics is best learned by first building intuition, then formalizing it with notation,
          and finally understanding why it's true through rigorous proofs.
        </p>

        <p>
          Every lesson follows the same three-layer structure:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li><strong>Intuition</strong> — real-world motivation, visual explorations, the "why"</li>
          <li><strong>Mathematics</strong> — precise notation, theorems, worked examples with every step shown</li>
          <li><strong>Rigor</strong> — epsilon-delta proofs, formal definitions, the complete logical foundation</li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 pt-4">Technology</h2>
        <p>Built entirely in the browser with no backend required:</p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li><strong>React + Vite</strong> — fast, modern UI framework</li>
          <li><strong>KaTeX</strong> — beautiful math typesetting</li>
          <li><strong>D3.js</strong> — interactive 2D visualizations</li>
          <li><strong>Three.js</strong> — 3D visualizations (coming)</li>
          <li><strong>Fuse.js</strong> — fast client-side search</li>
          <li><strong>Tailwind CSS</strong> — utility-first styling</li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 pt-4">Open Source</h2>
        <p>
          OpenCalc is designed to be free to host — it's a static site with no server-side requirements.
          Deploy to GitHub Pages, Netlify, Vercel, or any static host for free.
        </p>
        <p>
          Content is stored as plain JavaScript files, making it easy to contribute new lessons,
          fix errors, or add visualizations via pull request.
        </p>

        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 pt-4">Roadmap</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>✅ Chapter 0: Prerequisites (Real Numbers, Functions, Trig, Exponentials)</li>
          <li>✅ Chapter 1: Limits & Continuity</li>
          <li>🚧 Chapter 2: Derivatives</li>
          <li>📅 Chapter 3: Applications of Derivatives</li>
          <li>📅 Chapter 4: Integration</li>
          <li>📅 Chapter 5: Applications of Integration + FTC</li>
          <li>📅 Future: Calc 2, Linear Algebra, Statistics, Physics</li>
        </ul>
      </div>

      <div className="mt-8">
        <Link to="/" className="text-brand-600 dark:text-brand-400 hover:underline">← Back to curriculum</Link>
      </div>
    </div>
  )
}
