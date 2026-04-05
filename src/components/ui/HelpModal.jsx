// HelpModal.jsx — Interactive contributor tutorial system
// A full in-app documentation site for contributors of all skill levels.
import { useState, useEffect } from 'react'
import {
  X, Download, BookOpen, Code2, Terminal, Layers, ChevronRight,
  ArrowRight, ArrowLeft, Check, MousePointer, Play, FileText,
  Lightbulb, GraduationCap, Zap, Info, Eye, CheckSquare, Bot, ClipboardCopy
} from 'lucide-react'

// ─── TEMPLATE STRINGS ────────────────────────────────────────────────────────

const TPL_MATH = `// math-lesson-template.js
// ================================================================
// MATH / CALCULUS LESSON TEMPLATE  —  open-calc
// ================================================================
// Lines starting with // are INSTRUCTIONS. Delete when done.
// ================================================================

export default {

  // ── IDENTITY (REQUIRED) ─────────────────────────────────────
  id: 'ch1-your-topic',
  //  ^ Unique label. Format: ch{N}-topic-name
  //    Example: 'ch0-real-numbers'   'ch3-chain-rule'
  //    IMPORTANT: Must be unique — no two lessons share one.

  slug: 'your-topic',
  //   ^ Appears in the URL: /chapter/1/your-topic

  chapter: 1,
  //       ^ Chapter NUMBER. Must match chapter file exactly.

  order: 0,
  //     ^ Position in chapter list (0 = first).

  title: 'Your Lesson Title',
  subtitle: 'One sentence describing what this teaches.',
  tags: ['keyword1', 'keyword2'],

  // ── HOOK ────────────────────────────────────────────────────
  hook: {
    question: 'What question does this lesson answer?',
    realWorldContext: 'One or two sentences of real-world motivation.',
  },

  // ── INTUITION ───────────────────────────────────────────────
  intuition: {
    text: \`
Write your explanation here.

Formatting: **bold** *italic* \\\`code\\\` $f(x)$ inline math $$display math$$

Tip: Explain the concept as if talking to a curious 16-year-old.
Don't introduce the formula yet — build the IDEA first.
    \`,

    visualizations: [
      // { id: 'ComponentName', props: {} }
      // Common: PythonNotebook, JSNotebook, RiemannSum, UnitCircle
    ],
  },

  // ── FORMAL MATH (optional) ──────────────────────────────────
  math: {
    definition: 'Formal statement. LaTeX: $f\'(x) = \\\\lim_{h \\\\to 0} \\\\frac{f(x+h)-f(x)}{h}$',
    examples: [
      {
        problem:  'Find the derivative of $f(x) = x^2$.',
        solution: 'Using the power rule: $f\'(x) = 2x$.',
      },
    ],
  },

  // ── UNDERSTANDING CHECK (ungraded) ───────────────────────────
  assessment: {
    questions: [
      {
        question: 'In your own words, what does this concept mean?',
        answer:   'Expected answer here.',
        hint:     'Think about... (a nudge toward the answer)',
      },
    ],
  },

  // ── SCORED QUIZ ──────────────────────────────────────────────
  quiz: {
    questions: [
      {
        question: 'What is the derivative of $x^3$?',
        answer:   '$3x^2$',
        hints: [
          'Try the power rule.',
          'Multiply by the exponent, then reduce it by 1.',
        ],
      },
    ],
  },

}
`

const TPL_PYTHON = `// python-lesson-template.js
// ================================================================
// PYTHON / CODING LESSON TEMPLATE  —  open-calc
// ================================================================

export default {
  id: 'py1-your-topic',
  slug: 'your-topic',
  chapter: 1,
  order: 0,
  title: 'Your Python Lesson Title',
  subtitle: 'What will students build or learn to do?',
  tags: ['python', 'your-topic'],

  hook: {
    question: 'What will students be able to do by the end of this?',
    realWorldContext: 'Why is this Python skill useful in the real world?',
  },

  intuition: {
    text: \`
Explain the concept here — BEFORE any code.

What is the big idea? What problem are we solving?
Then the notebook below lets students try it themselves.
    \`,
    visualizations: [
      // PythonNotebook adds an interactive Python editor right here.
      { id: 'PythonNotebook', props: {} },
    ],
  },

  assessment: {
    questions: [
      {
        question: 'What does this code print?  print(2 ** 10)',
        answer: '1024',
        hint: '** is the Python exponentiation operator.',
      },
    ],
  },

  quiz: {
    questions: [
      {
        question: 'How do you define a function in Python?',
        answer: 'Use: def function_name(parameters): then indent the body.',
        hints: ['Start with the keyword: def', 'def add(a, b): return a + b'],
      },
    ],
  },
}
`

const TPL_PROOF = `// proof-lesson-template.js
// ================================================================
// PROOF / GEOMETRY LESSON TEMPLATE  —  open-calc
// ================================================================

export default {
  id: 'geo1-your-proof',
  slug: 'your-proof',
  chapter: 1,
  order: 0,
  title: 'Your Theorem Name',
  subtitle: 'What surprising result does this prove?',
  tags: ['proof', 'geometry', 'theorem'],

  hook: {
    question: 'What surprising or useful result are we about to prove?',
    realWorldContext: 'Where is this theorem used in the real world?',
  },

  intuition: {
    text: \`
Before the proof, explain WHY this result should be true.

Draw a picture in words. Walk the student through the
geometric or intuitive argument first.
    \`,
    visualizations: [],
  },

  math: {
    definition: \`
**Theorem:** State the theorem formally here.

**Given:** What we are starting with (the hypothesis).

**Prove:** What we need to show (the conclusion).
    \`,
    examples: [],
  },

  rigor: {
    text: \`
**Proof:**

**Step 1:** First step.
*Justification: why this step is valid.*

**Step 2:** Second step. ...

**Therefore:** Final conclusion. $\\\\square$
    \`,
    examples: [],
  },

  assessment: {
    questions: [
      {
        question: 'Can you state the theorem in your own words?',
        answer: 'Student should describe the core result in plain language.',
        hint: 'Focus on what the theorem guarantees, not the proof steps.',
      },
    ],
  },
}
`

const TPL_VIZ = `// MyVizComponent.jsx
// ================================================================
// VIZ COMPONENT (prose + toggles)  —  open-calc
// ================================================================

import { useState, useEffect } from 'react'

// ── COLORS HOOK (copy verbatim into every viz — do not modify) ──
function useColors() {
  const isDark = () =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return {
    bg: dark ? '#0f172a' : '#f8fafc', surface: dark ? '#1e293b' : '#ffffff',
    border: dark ? '#334155' : '#e2e8f0', text: dark ? '#e2e8f0' : '#1e293b',
    muted: dark ? '#94a3b8' : '#64748b',
    blue: dark ? '#38bdf8' : '#0284c7', amber: dark ? '#fbbf24' : '#d97706',
    green: dark ? '#4ade80' : '#16a34a',
  }
}

// IMPORTANT: Function name must EXACTLY match filename and VizFrame.jsx key.
export default function MyVizComponent({ params = {} }) {
  const C = useColors()

  return (
    <div style={{ fontFamily: 'var(--font-sans)', padding: '.5rem 0', maxWidth: 740 }}>
      <div style={{ background: C.surface, border: \`1px solid \${C.border}\`, borderRadius: 12, padding: '16px 20px' }}>
        <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          Replace this with your content.
        </p>
      </div>
    </div>
  )
}

// NEXT STEPS:
// 1. Register in VizFrame.jsx:
//    MyVizComponent: lazy(() => import('./react/MyVizComponent.jsx')),
// 2. Use in a lesson:
//    visualizations: [{ id: 'MyVizComponent', props: {} }]
`

const TPL_CANVAS = `// MyCanvasViz.jsx
// ================================================================
// VIZ COMPONENT (HTML5 Canvas)  —  open-calc
// ================================================================

import { useState, useEffect, useRef } from 'react'

// ── COLORS HOOK (copy verbatim, do not modify) ───────────────────
function useColors() {
  const isDark = () =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return {
    bg: dark ? '#0f172a' : '#f8fafc', surface: dark ? '#1e293b' : '#ffffff',
    border: dark ? '#334155' : '#e2e8f0', text: dark ? '#e2e8f0' : '#1e293b',
    muted: dark ? '#94a3b8' : '#64748b',
    blue: dark ? '#38bdf8' : '#0284c7', amber: dark ? '#fbbf24' : '#d97706',
    green: dark ? '#4ade80' : '#16a34a', red: dark ? '#f87171' : '#dc2626',
  }
}

function MyCanvas({ value, C }) {
  const canvasRef = useRef(null)  // PART A: named canvasRef (not ref or cvRef)
  const roRef     = useRef(null)  // PART B: ResizeObserver ref

  useEffect(() => {
    const draw = () => {
      const cv = canvasRef.current
      if (!cv) return

      // PART C: set dimensions INSIDE draw(), every time
      const canvasW = cv.offsetWidth || 500
      const canvasH = 300
      cv.width  = canvasW
      cv.height = canvasH

      const ctx = cv.getContext('2d')
      const pl = 50, pr = 20, pt = 20, pb = 40
      const iw = canvasW - pl - pr
      const canvasIH = canvasH - pt - pb  // NOTE: not 'ih' or 'H'

      const xMax = 10, yMax = 100
      const toX = v => pl + (v / xMax) * iw
      const toY = v => pt + canvasIH - (v / yMax) * canvasIH

      ctx.clearRect(0, 0, canvasW, canvasH)

      ctx.strokeStyle = C.blue
      ctx.lineWidth = 2.5
      ctx.beginPath()
      for (let x = 0; x <= xMax; x += 0.1) {
        const y = x * x
        if (x === 0) ctx.moveTo(toX(x), toY(y))
        else         ctx.lineTo(toX(x), toY(y))
      }
      ctx.stroke()

      const dotX = toX(value), dotY = toY(value * value)
      ctx.fillStyle = C.amber
      ctx.beginPath()
      ctx.arc(dotX, dotY, 6, 0, Math.PI * 2)
      ctx.fill()
    }

    draw()
    // PART D: observe parentElement (not the canvas itself!)
    roRef.current = new ResizeObserver(draw)
    roRef.current.observe(canvasRef.current.parentElement)
    // PART E: cleanup (prevents memory leak)
    return () => { roRef.current?.disconnect(); roRef.current = null }
  }, [value, C])  // ALL variables used in draw() must be in deps

  return <canvas ref={canvasRef} style={{ width: '100%', display: 'block', borderRadius: 8 }} />
}

export default function MyCanvasViz({ params = {} }) {
  const C = useColors()
  const [value, setValue] = useState(5)

  return (
    <div style={{ fontFamily: 'var(--font-sans)', padding: '.5rem 0', maxWidth: 740 }}>
      <div style={{ background: C.surface, border: \`1px solid \${C.border}\`, borderRadius: 12, overflow: 'hidden' }}>
        <MyCanvas value={value} C={C} />
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, color: C.muted }}>Value</span>
        <input type="range" min={0} max={10} step={0.1} value={value}
          onChange={e => setValue(Number(e.target.value))} style={{ flex: 1 }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: C.text, minWidth: 32 }}>
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  )
}
`

// ─── DOWNLOAD HELPER ─────────────────────────────────────────────────────────
function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── ZONE COLORS (full strings — Tailwind JIT safe) ──────────────────────────
const ZC = {
  blue:   { active: 'border-blue-400 bg-blue-50 dark:bg-blue-950/25',       idle: 'border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700',     label: 'text-blue-600 dark:text-blue-400',   badge: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',   dot: 'bg-blue-400' },
  amber:  { active: 'border-amber-400 bg-amber-50 dark:bg-amber-950/25',    idle: 'border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-700',   label: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300', dot: 'bg-amber-400' },
  green:  { active: 'border-green-400 bg-green-50 dark:bg-green-950/25',    idle: 'border-slate-200 dark:border-slate-700 hover:border-green-200 dark:hover:border-green-700',   label: 'text-green-600 dark:text-green-400', badge: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300', dot: 'bg-green-400' },
  teal:   { active: 'border-teal-400 bg-teal-50 dark:bg-teal-950/25',       idle: 'border-slate-200 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-700',     label: 'text-teal-600 dark:text-teal-400',   badge: 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300',   dot: 'bg-teal-400' },
  orange: { active: 'border-orange-400 bg-orange-50 dark:bg-orange-950/25', idle: 'border-slate-200 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-700', label: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300', dot: 'bg-orange-400' },
}

// ─── LESSON ZONES ────────────────────────────────────────────────────────────
const LESSON_ZONES = [
  {
    id: 'identity', color: 'blue', label: 'Identity', badge: 'Required',
    explanation: 'These 4 fields are required — without them the app can\'t find, display, or link to your lesson. They\'re simple: just short words and numbers.',
    tips: [
      'The id must be unique across the entire app — no two lessons share one.',
      'The slug appears in the URL — keep it short, lowercase, and hyphenated.',
      'The chapter number must exactly match the chapter file your lesson is inside.',
      'order controls where it appears in the chapter list (0 = first lesson).',
    ],
    code: `  id: 'ch1-derivatives',
  slug: 'derivatives',
  chapter: 1,
  order: 0,
  title: 'What is a Derivative?',
  subtitle: 'The instantaneous rate of change',
  tags: ['derivative', 'slope', 'rate'],`,
    renderMockup: () => (
      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Appears in the sidebar as:</div>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-700">
          <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-600 shrink-0" />
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">What is a Derivative?</span>
        </div>
        <div className="text-[10px] text-slate-400 pl-1">URL: /chapter/1/derivatives</div>
      </div>
    ),
  },
  {
    id: 'hook', color: 'amber', label: 'Hook', badge: 'Recommended',
    explanation: 'The very first thing a student sees. Its job is to create curiosity before you\'ve taught anything. The best hooks describe a situation the student can picture and a question they\'d genuinely want answered.',
    tips: [
      'Write the question as something a real person would wonder — not a textbook exercise.',
      'The realWorldContext should feel relevant: science, engineering, nature, or everyday life.',
      'If the hook doesn\'t make YOU curious, rewrite it until it does.',
    ],
    code: `  hook: {
    question: 'How fast is a car going at exactly
  2:14:37 PM — not over a time range, but
  at that precise instant?',
    realWorldContext: 'GPS systems calculate instantaneous
  velocity thousands of times per second using
  the same principle...',
  },`,
    renderMockup: () => (
      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 p-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1.5">Opening Question</div>
        <div className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug mb-1.5">
          "How fast is a car going at exactly 2:14:37 PM?"
        </div>
        <div className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
          GPS systems calculate instantaneous velocity thousands of times per second...
        </div>
      </div>
    ),
  },
  {
    id: 'intuition', color: 'green', label: 'Intuition', badge: 'Recommended',
    explanation: 'Your main lesson body — a prose explanation of the concept plus optional interactive visualizations. Write without formulas first. Build the mental model before the math.',
    tips: [
      'Explain as if talking to a smart non-expert. No jargon until they\'re ready for it.',
      'Add a visualization with { id: \'ComponentName\', props: {} } in the visualizations array.',
      'Text supports **bold**, *italic*, `code`, and $LaTeX$ math.',
      'You can embed multiple visualizations — they appear in order.',
    ],
    code: `  intuition: {
    text: \`
Imagine zooming into a curve so far that it
looks like a straight line. The **derivative**
is the slope of that imaginary tiny line.

The closer you zoom, the more accurate the slope.
Zoom infinitely close: $f'(x)$.
    \`,
    visualizations: [
      { id: 'SecantToTangent', props: {} },
    ],
  },`,
    renderMockup: () => (
      <div className="space-y-2">
        <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Imagine zooming into a curve so far that it looks like a straight line. The <strong>derivative</strong> is the slope of that imaginary tiny line...
        </div>
        <div className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
          <span className="text-[11px] text-slate-400 italic">SecantToTangent visualization</span>
        </div>
      </div>
    ),
  },
  {
    id: 'math', color: 'blue', label: 'Formal Math', badge: 'Optional',
    explanation: 'The precise definition box and worked examples — shown AFTER the intuition section. Because students have context first, the formal definition lands much better.',
    tips: [
      'Write the definition with LaTeX: $$f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}$$',
      'Examples work best as a clear problem statement with step-by-step solution.',
      'Leave examples: [] if you only want a definition box with no worked examples.',
    ],
    code: `  math: {
    definition: \`The **derivative** $f'(x)$ is:
$$f'(x) = \\\\lim_{h \\\\to 0} \\\\frac{f(x+h)-f(x)}{h}$$\`,

    examples: [
      {
        problem:  'Find the derivative of $f(x) = x^2$.',
        solution: 'Power rule: $f\'(x) = 2x$.',
      },
    ],
  },`,
    renderMockup: () => (
      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700 p-3 space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Definition</div>
        <div className="text-xs text-blue-900 dark:text-blue-200 font-mono">f′(x) = lim(h→0) [f(x+h)−f(x)] / h</div>
        <div className="border-t border-blue-200 dark:border-blue-800 pt-2">
          <div className="text-[10px] font-bold text-blue-500 mb-0.5">Example</div>
          <div className="text-[11px] text-blue-800 dark:text-blue-300">Find derivative of x² → 2x</div>
        </div>
      </div>
    ),
  },
  {
    id: 'assessment', color: 'teal', label: 'Understanding Check', badge: 'Optional',
    explanation: 'Ungraded reflection questions shown in teal. No score, no pressure. Students type an answer and then see the model answer. Great for consolidating understanding before the scored quiz.',
    tips: [
      'Use this for open-ended "explain in your own words" questions.',
      'Each question has one hint: field — a single string with one nudge.',
      'Students see the model answer after they submit.',
    ],
    code: `  assessment: {
    questions: [
      {
        question: 'In your own words: what does the
  derivative of a function tell you?',
        answer: 'The instantaneous rate of change —
  how fast the output is changing at one point.',
        hint: 'Think about the slope of the tangent
  line at a single point.',
      },
    ],
  },`,
    renderMockup: () => (
      <div className="rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-700 p-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-teal-500 mb-1.5">Understanding Check</div>
        <div className="text-xs text-teal-800 dark:text-teal-200 mb-2">In your own words: what does the derivative tell you?</div>
        <div className="h-6 rounded bg-white/60 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-700 flex items-center px-2">
          <span className="text-[10px] text-teal-400">Type your answer...</span>
        </div>
      </div>
    ),
  },
  {
    id: 'quiz', color: 'orange', label: 'Scored Quiz', badge: 'Optional',
    explanation: 'The scored quiz shown in orange. Answering at least 80% correctly marks the lesson complete with a star (★) in the sidebar. Each question can have up to 3 hints that reveal one at a time.',
    tips: [
      'Write questions with a single definitive correct answer.',
      'Hints are an array — they reveal one at a time as the student needs help.',
      'The quiz result (★ master / partial / needs review) appears in the sidebar permanently.',
    ],
    code: `  quiz: {
    questions: [
      {
        question: 'What is the derivative of $f(x) = x^3$?',
        answer: '$3x^2$',
        hints: [
          'Use the power rule.',
          'Multiply the exponent by the coefficient,
  then reduce the exponent by 1.',
        ],
      },
    ],
  },`,
    renderMockup: () => (
      <div className="rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-700 p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-orange-500">Lesson Quiz</div>
          <span className="text-[10px] text-orange-400">★ earn completion at ≥80%</span>
        </div>
        <div className="text-xs text-orange-800 dark:text-orange-200 mb-1.5">What is the derivative of f(x) = x³?</div>
        <div className="flex gap-1 flex-wrap">
          {['3x²', '3x³', 'x²', '2x'].map(o => (
            <span key={o} className="text-[10px] px-2 py-0.5 rounded bg-white/60 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300">{o}</span>
          ))}
        </div>
      </div>
    ),
  },
]

// ─── SHARED PRIMITIVES ───────────────────────────────────────────────────────

function Cb({ children }) {
  return <code className="font-mono text-[12px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">{children}</code>
}
function CodeBlock({ children }) {
  return (
    <pre className="text-[12px] font-mono bg-slate-900 dark:bg-slate-950 text-slate-200 rounded-xl p-4 overflow-x-auto leading-relaxed border border-slate-700 my-3">
      {children}
    </pre>
  )
}
function Note({ children, color = 'blue' }) {
  const s = {
    blue:   'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300',
    amber:  'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300',
    green:  'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300',
    red:    'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300',
  }
  return <div className={`text-[12px] border-l-2 rounded-r-xl px-3 py-2.5 mb-3 leading-relaxed ${s[color]}`}>{children}</div>
}
function SectionHeading({ children, sub }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">{children}</h2>
      {sub && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}
function H2({ children }) {
  return <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-3">{children}</h2>
}
function H3({ children }) {
  return <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2">{children}</h3>
}
function Para({ children }) {
  return <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{children}</p>
}

// ─── DOWNLOAD CARD ───────────────────────────────────────────────────────────

function DownloadCard({ icon, title, filename, desc, template }) {
  const [done, setDone] = useState(false)
  const handle = () => {
    downloadFile(filename, template)
    setDone(true)
    setTimeout(() => setDone(false), 2000)
  }
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md dark:hover:shadow-slate-900/60 transition-shadow mb-3">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-2 mb-1">
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</span>
          <code className="text-[11px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{filename}</code>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{desc}</p>
        <button
          onClick={handle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${done ? 'bg-emerald-500 text-white' : 'bg-brand-600 hover:bg-brand-700 text-white'}`}
        >
          {done ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          {done ? 'Downloaded!' : `Download ${filename}`}
        </button>
      </div>
    </div>
  )
}

// ─── STEP WIZARD ─────────────────────────────────────────────────────────────

function StepWizard({ steps }) {
  const [step, setStep] = useState(0)
  const cur = steps[step]
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <button
            key={i} onClick={() => setStep(i)} title={s.title}
            className={`shrink-0 rounded-full transition-all ${i === step ? 'w-7 h-2.5 bg-brand-500' : i < step ? 'w-2.5 h-2.5 bg-brand-300 dark:bg-brand-700' : 'w-2.5 h-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'}`}
          />
        ))}
        <span className="text-[11px] text-slate-400 ml-1 shrink-0">Step {step + 1} / {steps.length}</span>
      </div>

      <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-9 h-9 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">{step + 1}</div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">{cur.title}</h3>
            {cur.sub && <p className="text-xs text-slate-400 mt-0.5">{cur.sub}</p>}
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{cur.desc}</p>
        {cur.note && <Note color={cur.noteColor ?? 'amber'}>{cur.note}</Note>}
        {cur.code && <CodeBlock>{cur.code}</CodeBlock>}
        {cur.bullets && (
          <ul className="space-y-1.5 mb-4">
            {cur.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <ChevronRight className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
        {cur.download && (
          <button
            onClick={() => downloadFile(cur.download.filename, cur.download.content)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-colors mt-2"
          >
            <Download className="w-4 h-4" /> Download {cur.download.filename}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="flex items-center gap-1.5 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            <Check className="w-4 h-4" /> You're ready!
          </div>
        )}
      </div>
    </div>
  )
}

// ─── HOVERABLE LESSON PREVIEW ────────────────────────────────────────────────

function HoverLessonPreview() {
  const [active, setActive] = useState(null)
  const zone = LESSON_ZONES.find(z => z.id === active)

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-5">
      <div className="space-y-2">
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3">
          <MousePointer className="w-3.5 h-3.5" />
          What students see — hover a section
        </p>
        {LESSON_ZONES.map(z => {
          const c = ZC[z.color]
          const isActive = active === z.id
          return (
            <div
              key={z.id}
              onMouseEnter={() => setActive(z.id)}
              onMouseLeave={() => setActive(null)}
              className={`cursor-pointer rounded-xl border-2 p-3.5 transition-all duration-150 ${isActive ? c.active : c.idle}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${c.label}`}>{z.label}</span>
                <span className={`ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${c.badge}`}>{z.badge}</span>
              </div>
              {z.renderMockup()}
            </div>
          )
        })}
      </div>

      <div>
        {zone ? (
          <div className="sticky top-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-base font-bold ${ZC[zone.color].label}`}>{zone.label}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${ZC[zone.color].badge}`}>{zone.badge}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{zone.explanation}</p>
            <CodeBlock>{zone.code}</CodeBlock>
            <ul className="space-y-2 mt-3">
              {zone.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{tip}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="hidden md:flex h-full min-h-[280px] items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700">
            <div className="text-center py-8">
              <MousePointer className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Hover any section</p>
              <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">See the code that creates it</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SECTION: OVERVIEW ───────────────────────────────────────────────────────

function SectionOverview() {
  return (
    <div>
      <SectionHeading sub="No coding experience required to get started.">How open-calc works</SectionHeading>
      <Para>open-calc is an interactive math learning app. Every topic is a <strong>lesson</strong>. Lessons are grouped into <strong>chapters</strong>. You write lessons as simple text files — the app reads them and renders them automatically.</Para>

      <div className="flex flex-wrap items-center gap-2 my-5 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        {[
          { icon: '📄', label: 'Write a .js file', cls: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40' },
          null,
          { icon: '📁', label: 'Add to a chapter', cls: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40' },
          null,
          { icon: '🎓', label: 'Students learn!', cls: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40' },
        ].map((item, i) =>
          item === null
            ? <ArrowRight key={i} className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
            : <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${item.cls}`}><span className="text-lg">{item.icon}</span><span className="text-xs font-semibold">{item.label}</span></div>
        )}
      </div>

      <H3>What does a lesson file look like?</H3>
      <Para>A lesson is a JavaScript file that exports one object with named fields. You don't need to know JavaScript — just fill in the fields with text. Think of it like a form with labeled boxes.</Para>
      <CodeBlock>{`export default {
  id: 'ch1-derivatives',
  title: 'What is a Derivative?',

  hook: {
    question: 'How fast is something changing right now?',
    realWorldContext: 'GPS systems solve this thousands of times per second...',
  },

  intuition: {
    text: 'Imagine zooming into a curve until it looks like a straight line...',
  },

  quiz: {
    questions: [{ question: '...', answer: '...', hints: [] }],
  },
}`}</CodeBlock>

      <H3>What you need to get started</H3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        {[
          { icon: '💻', title: 'A text editor', desc: 'VS Code is free and works great. Any editor will work.' },
          { icon: '📦', title: 'Node.js installed', desc: 'Download from nodejs.org. Run "npm install" in the project folder once.' },
          { icon: '🔥', title: 'npm run dev', desc: 'Starts the app locally so you can instantly see your changes.' },
        ].map(item => (
          <div key={item.title} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{item.title}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</div>
          </div>
        ))}
      </div>

      <H3>The file structure</H3>
      <Para>All lesson files live in <Cb>src/content/</Cb>. Each chapter has its own folder:</Para>
      <CodeBlock>{`src/content/
  chapter-0/           ← Precalculus prerequisites
    index.js           ← Chapter definition (title, lesson list)
    00-real-numbers.js ← A lesson file
    01-functions.js    ← Another lesson
  python-1/
    index.js
    01-variables.js`}</CodeBlock>
      <Note color="green"><strong>Ready to write your first lesson?</strong> Head to <strong>Your First Lesson</strong> in the sidebar — it walks you through everything step by step.</Note>

      <div className="mt-4 flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <svg className="w-5 h-5 text-slate-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Source code on GitHub</div>
          <a href="https://github.com/g4m3rm1k3/open-calc" target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 dark:text-brand-400 hover:underline truncate block">github.com/g4m3rm1k3/open-calc</a>
        </div>
      </div>
    </div>
  )
}

// ─── SECTION: FIRST LESSON ───────────────────────────────────────────────────

const FIRST_LESSON_STEPS = [
  {
    title: 'Download the starter template',
    desc: 'Click the button below to download a lesson file with every field pre-filled and commented. This is your starting point.',
    note: 'The file is heavily commented with instructions. Delete the comments as you go, or keep them as a reference.',
    download: { filename: 'math-lesson-template.js', content: TPL_MATH },
  },
  {
    title: 'Put the file in the right folder',
    desc: 'Move the downloaded file into the chapter folder it belongs to inside src/content/. For Chapter 1, put it in src/content/chapter-1/.',
    code: `// Example:
src/content/chapter-1/01-my-new-lesson.js

// The filename doesn't matter to the app.
// Convention: {order}-{topic}.js`,
    note: 'The folder name tells the app which chapter it\'s in — keep it matching.',
  },
  {
    title: 'Fill in the identity fields',
    sub: 'Lines 1–7 of the template',
    desc: 'These 4 fields are required. Without them the app cannot find or display your lesson. Replace every placeholder value.',
    code: `  id: 'ch1-limits',        // unique, never reused
  slug: 'limits',           // appears in the URL
  chapter: 1,               // must match chapter.number
  order: 3,                 // position in the chapter list
  title: 'What is a Limit?',
  subtitle: 'The foundation of all of calculus',
  tags: ['limits', 'calculus'],`,
    note: 'The id must be unique across the ENTIRE app. If two lessons share the same id, progress data will mix and things will break.',
  },
  {
    title: 'Write a hook that creates curiosity',
    sub: 'The hook section',
    desc: 'The hook is the first thing a student sees. Its only job is to make them curious. Don\'t teach yet — just pose a question they\'ll want answered.',
    code: `  hook: {
    question: 'What happens when you divide by
  something that keeps getting closer to zero —
  but never actually reaches it?',
    realWorldContext: 'GPS satellites solve thousands
  of "approaching but never equal" problems every
  second using limits.',
  },`,
    note: 'If your hook doesn\'t make YOU curious, it won\'t make students curious. Rewrite it until it does.',
  },
  {
    title: 'Write the intuitive explanation',
    sub: 'intuition.text',
    desc: 'Your main lesson body. Explain the concept without formulas first. Write for a smart person who has never seen this topic.',
    code: `  intuition: {
    text: \`
Imagine driving toward a wall. You get closer and
closer — 10m, 1m, 1cm — but you never arrive.
The wall is *there*, you're just always approaching.

In math, a **limit** asks: what value does a function
*approach* as input gets close to something?

$$\\lim_{x \\to 2} x^2 = 4$$
    \`,
  },`,
  },
  {
    title: 'Add formal math (optional)',
    sub: 'The math section',
    desc: 'Now that students have intuition, introduce the formal definition and worked examples. Skip this for Python or web lessons.',
    code: `  math: {
    definition: \`The **limit** of $f(x)$ as $x \\to a$ is $L$:
$$\\lim_{x \\to a} f(x) = L$$\`,
    examples: [
      {
        problem: 'Evaluate $\\\\displaystyle\\\\lim_{x\\\\to 3}(x^2-1)$',
        solution: 'Substitute: $(3)^2 - 1 = 8$.',
      },
    ],
  },`,
    note: 'Inline math uses $...$, display math uses $$...$$.',
    noteColor: 'blue',
  },
  {
    title: 'Add a quiz',
    sub: 'The quiz section — ≥80% earns a ★',
    desc: 'The quiz is scored. Getting at least 80% marks the lesson complete. Write 3–5 questions with clear, single correct answers.',
    code: `  quiz: {
    questions: [
      {
        question: 'What does $\\\\lim_{x \\\\to 3}$ ask?',
        answer: 'What value f(x) approaches as x gets close to 3.',
        hints: [
          'Think "approaching", not "arriving".',
          'The limit is about the journey toward the value.',
        ],
      },
    ],
  },`,
  },
  {
    title: 'Register the lesson in its chapter',
    sub: 'The chapter index.js file',
    desc: 'Add your lesson to the chapter\'s index.js file. Two lines: one import at the top, one entry in the lessons array.',
    code: `// In src/content/chapter-1/index.js:

import myLesson from './03-limits.js'   // ← add import

export default {
  id: 'chapter-1',
  number: 1,
  title: 'Limits',
  lessons: [
    existingLesson1,
    existingLesson2,
    myLesson,          // ← add here
  ],
}`,
    note: 'Restart npm run dev after editing index.js. Navigate to /chapter/1/limits to see it live.',
    noteColor: 'green',
    bullets: [
      'The lesson now appears in the sidebar.',
      'Any errors in your file appear in the browser console (press F12).',
    ],
  },
]

function SectionFirstLesson() {
  return (
    <div>
      <SectionHeading sub="A complete walkthrough — from download to live lesson.">Your First Lesson</SectionHeading>
      <Para>Follow these 8 steps. By the end you'll have a fully working lesson live in the app. You don't need to know JavaScript — just fill in the fields.</Para>
      <StepWizard steps={FIRST_LESSON_STEPS} />
    </div>
  )
}

// ─── SECTION: LESSON ANATOMY ─────────────────────────────────────────────────

function SectionAnatomy() {
  return (
    <div>
      <SectionHeading sub="Hover any section to see the code and tips for filling it in.">Lesson Anatomy</SectionHeading>
      <Para>Every lesson uses the same structure. Sections you leave out are simply not rendered — there will never be a blank box. Hover each section below to explore.</Para>
      <HoverLessonPreview />

      <H3>Assessment vs. Quiz</H3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
        <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-700">
          <div className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2">assessment (teal)</div>
          <ul className="text-xs text-teal-800 dark:text-teal-300 space-y-1.5">
            <li>• No score — zero pressure</li>
            <li>• hint field is a single string</li>
            <li>• Students see model answer after submitting</li>
            <li>• Best for open-ended reflection</li>
          </ul>
        </div>
        <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-700">
          <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2">quiz (orange)</div>
          <ul className="text-xs text-orange-800 dark:text-orange-300 space-y-1.5">
            <li>• Scored — ≥80% earns ★ completion</li>
            <li>• hints is an array (reveals one at a time)</li>
            <li>• Result shown permanently in sidebar</li>
            <li>• Best for clear right/wrong questions</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// ─── SECTION: LESSON TYPES ───────────────────────────────────────────────────

function SectionTypes() {
  const [active, setActive] = useState('math')
  const types = [
    { id: 'math', label: '📐 Math / Calculus' },
    { id: 'python', label: '🐍 Python / Code' },
    { id: 'proof', label: '📝 Proof / Geometry' },
    { id: 'web', label: '🌐 Web / JavaScript' },
    { id: 'science', label: '🔬 Science / ScienceNotebook' },
  ]
  const content = {
    math: (
      <div>
        <Para>The classic lesson type. All sections are available. Emphasis on building intuition first, then formal definition, then practice.</Para>
        <H3>Inline algebra popovers</H3>
        <Para>In any prose string, use <Cb>{'{{'}</Cb><Cb>algebra:id|link text</Cb><Cb>{'}}'}</Cb> to link a term to a pop-up reference card. The link text is KaTeX.</Para>
        <CodeBlock>{`"Factor using {{algebra:difference-of-squares|difference of squares}}."`}</CodeBlock>
        <Para>Available IDs: <Cb>difference-of-squares</Cb>, <Cb>difference-of-cubes</Cb>, <Cb>exponent-rules-multiply</Cb>, <Cb>exponent-rules-power</Cb>, <Cb>log-power-rule</Cb>, <Cb>triangle-inequality</Cb>, <Cb>conjugate-multiplication</Cb>, <Cb>fraction-split</Cb>, <Cb>factoring-fractional-powers</Cb>, <Cb>solve-simple-quadratic</Cb>. Add new ones to <Cb>src/content/algebraRegistry.js</Cb>.</Para>
        <H3>Typical structure</H3>
        <CodeBlock>{`hook → intuition (+ viz) → math definition
  → examples → assessment → quiz`}</CodeBlock>
        <DownloadCard icon="📐" title="Math Lesson Template" filename="math-lesson-template.js" template={TPL_MATH} desc="All sections with commented instructions. For calculus, algebra, geometry, or any math topic." />
      </div>
    ),
    python: (
      <div>
        <Para>For lessons where students write and run Python code. An interactive Python notebook (powered by Pyodide — no installation needed) is embedded directly in the lesson.</Para>
        <H3>Adding the notebook</H3>
        <CodeBlock>{`visualizations: [
  { id: 'PythonNotebook', props: {} },
],`}</CodeBlock>
        <Para>That's it. The cell appears with syntax highlighting and Shift+Enter to run. Students edit it live. output appears immediately.</Para>
        <H3>opencalc library</H3>
        <Para>Every notebook automatically has access to <Cb>opencalc</Cb> — see the <strong>opencalc Library</strong> section for all drawing methods including graphs, vectors, and geometry.</Para>
        <DownloadCard icon="🐍" title="Python Lesson Template" filename="python-lesson-template.js" template={TPL_PYTHON} desc="Lesson with an embedded Python notebook cell." />
      </div>
    ),
    proof: (
      <div>
        <Para>For lessons that walk through a mathematical proof step by step. Heavy on <Cb>math.definition</Cb> and <Cb>rigor.text</Cb>. Often no scored quiz — just an understanding check asking students to paraphrase the result.</Para>
        <H3>Typical structure</H3>
        <CodeBlock>{`hook → intuition (why should this be true?) → math.definition
  → rigor.text (step-by-step proof) → assessment`}</CodeBlock>
        <H3>Writing the proof body</H3>
        <CodeBlock>{`rigor: {
  text: \`
**Proof:**

**Step 1:** Since triangle ABC is isoceles, $AB = AC$.

**Step 2:** By the Angle Bisector Theorem...

**Therefore:** $\\\\angle B = \\\\angle C$. $\\\\square$
  \`,
},`}</CodeBlock>
        <DownloadCard icon="📝" title="Proof Lesson Template" filename="proof-lesson-template.js" template={TPL_PROOF} desc="Step-by-step proof structure with intuition-first approach and formal justification." />
      </div>
    ),
    science: (
      <div>
        <Para>Used for chemistry and digital-fundamentals lessons. The entire lesson — prose, callouts, steps, and interactive viz — is packaged inside a <Cb>ScienceNotebook</Cb> component. This is <strong>Schema E</strong>.</Para>
        <H3>File structure — two exports required</H3>
        <CodeBlock>{`// lesson1-0.js
const LESSON_CHEM_1_0 = { ...full lesson object... }
export { LESSON_CHEM_1_0 }   // named export — for the viz wrapper
export default LESSON_CHEM_1_0  // default export — for the chapter index`}</CodeBlock>
        <H3>Cells in a ScienceNotebook lesson</H3>
        <CodeBlock>{`cells: [
  { type: 'prose',    content: 'Explanation text...' },
  { type: 'callout',  variant: 'key-idea', title: 'Big Idea', body: '...' },
  { type: 'step',     label: '1', content: 'First step...' },
  { type: 'formula',  latex: 'E = mc^2' },
  { type: 'viz',      id: 'MyVizId' },
]`}</CodeBlock>
        <H3>Viz wrapper — required for every ScienceNotebook lesson</H3>
        <Para>Create a wrapper file in <Cb>src/components/viz/react/</Cb> that self-imports the lesson and passes it to ScienceNotebook. Each lesson needs its own wrapper so VizFrame can load it by ID.</Para>
        <CodeBlock>{`// src/components/viz/react/WhyChemistry.jsx
import ScienceNotebook from './ScienceNotebook.jsx'
import { LESSON_CHEM_1_0 } from '../../../content/chemistry-1/lesson1-0.js'

export default function WhyChemistry({ params }) {
  return <ScienceNotebook lesson={LESSON_CHEM_1_0} params={params} />
}`}</CodeBlock>
        <Para>Then register it in <Cb>VizFrame.jsx</Cb>:</Para>
        <CodeBlock>{`WhyChemistry: lazy(() => import('./react/WhyChemistry.jsx')),`}</CodeBlock>
        <Note color="amber">Do NOT set <Cb>previewVisualizationId</Cb> in the lesson's <Cb>hook</Cb> — the viz is rendered from <Cb>intuition.visualizations</Cb> only. Setting it in both causes a double-render.</Note>
        <Note color="violet">Full spec: CONTRIBUTING.md § 7 — ScienceNotebook Lesson Format</Note>
      </div>
    ),
    web: (
      <div>
        <Para>For lessons where students write JavaScript, HTML, or CSS. Uses <Cb>JSNotebook</Cb> — students see live output immediately as they type.</Para>
        <H3>Adding the notebook</H3>
        <CodeBlock>{`visualizations: [{ id: 'JSNotebook', props: {} }]`}</CodeBlock>
        <H3>Python vs. JavaScript notebooks</H3>
        <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
          <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-700 text-teal-800 dark:text-teal-300 space-y-1">
            <div className="font-bold">PythonNotebook</div>
            <div>• Pyodide (WebAssembly)</div><div>• opencalc charts built-in</div><div>• Cell-by-cell execution</div>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300 space-y-1">
            <div className="font-bold">JSNotebook</div>
            <div>• Runs native JS</div><div>• Live HTML/CSS output</div><div>• Monaco editor (VS Code-like)</div>
          </div>
        </div>
      </div>
    ),
  }
  return (
    <div>
      <SectionHeading sub="All types share the same file structure — you just use different fields.">Lesson Types</SectionHeading>
      <Para>"Types" are conventions for which fields and components to use based on subject. Each course uses one type consistently — check ARCHITECTURE.md § 4 for the course→schema mapping before starting.</Para>
      <div className="flex flex-wrap gap-2 mb-6">
        {types.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${active === t.id ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >{t.label}</button>
        ))}
      </div>
      {content[active]}
    </div>
  )
}

// ─── SECTION: OPENCALC ───────────────────────────────────────────────────────

function SectionOpencalc() {
  return (
    <div>
      <SectionHeading sub="The built-in Python visualization library — no installation needed.">opencalc Python Library</SectionHeading>
      <Para><strong>opencalc</strong> is available automatically in every Python notebook. Students just import it and start drawing.</Para>

      <H3>Quick start</H3>
      <CodeBlock>{`from opencalc import Figure, quick_plot

# One-liner: plot a function
print(quick_plot(lambda x: x**2, title='y = x²'))

# Full control:
fig = Figure(xmin=-5, xmax=5, ymin=-2, ymax=10)
fig.grid().axes()
fig.plot(lambda x: x**2, color='blue', label='x²')
fig.point([1, 1], label='(1, 1)')
print(fig.show())   # ← always print()`}</CodeBlock>
      <Note color="amber">Always end with <Cb>print(fig.show())</Cb>. Calling <Cb>fig.show()</Cb> alone won't display the figure.</Note>

      <H3>Drawing methods (all chainable)</H3>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-4">
        {[
          ['.grid(step, color)', 'Background grid lines.'],
          ['.axes(labels, ticks)', 'X and Y axes with optional tick marks and labels.'],
          ['.plot(fn, color, label, fill)', 'Plot a function y = f(x). fn is a Python lambda or function.'],
          ['.parametric(xfn, yfn, tmin, tmax)', 'Parametric curve (x(t), y(t)) over a t range.'],
          ['.scatter(xs, ys, color, radius)', 'Scatter plot from two lists of numbers.'],
          ['.point(pos, color, label)', 'Single labeled dot at [x, y].'],
          ['.arrow(start, end, color)', 'Arrow from [x1,y1] to [x2,y2].'],
          ['.vector(v, color, label, origin)', 'Vector drawn from origin.'],
          ['.fill_between(fn_top, fn_bot)', 'Shaded region between two functions.'],
          ['.circle(center, radius, color)', 'Circle by center point and radius.'],
          ['.rect(x, y, w, h, color)', 'Rectangle at corner (x, y) with given size.'],
          ['.polygon(points, color, fill)', 'Filled polygon from a list of [x,y] points.'],
          ['.text(pos, content, color)', 'Text label at a coordinate.'],
          ['.riemann(fn, a, b, n, method)', 'Riemann sum rectangles (midpoint / left / right).'],
          ['.tangent(fn, x0, color)', 'Tangent line at x0 with slope label.'],
          ['.bars(labels, values, color)', 'Bar chart from label and value lists.'],
          ['.transformed_grid(matrix)', 'Visualize a 2×2 matrix transformation.'],
          ['.hline(y) / .vline(x)', 'Horizontal or vertical dashed reference line.'],
        ].map(([method, desc], i) => (
          <div key={i} className={`flex gap-3 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0 ${i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-900/30'}`}>
            <code className="font-mono text-xs text-teal-600 dark:text-teal-400 shrink-0 w-52">{method}</code>
            <span className="text-xs text-slate-500 dark:text-slate-400">{desc}</span>
          </div>
        ))}
      </div>

      <H3>Shortcut helpers</H3>
      <CodeBlock>{`quick_plot(lambda x: x**2, xmin=-3, xmax=3, title='Square')
quick_vectors([1, 2], [3, -1], labels=['a', 'b'])
quick_transform([[2, 0], [0, 1]])       # stretch x by 2
quick_transform([[0, -1], [1, 0]])      # 90° rotation`}</CodeBlock>

      <H3>Available colors</H3>
      <div className="flex flex-wrap gap-2 my-3">
        {['blue', 'amber', 'green', 'red', 'purple', 'teal', 'gray', 'muted'].map(c => (
          <span key={c} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300">{c}</span>
        ))}
      </div>
    </div>
  )
}

// ─── SECTION: USING VIZ ──────────────────────────────────────────────────────

function SectionUseViz() {
  return (
    <div>
      <SectionHeading sub="Add any existing visualization to a lesson — just one line.">Using Existing Visualizations</SectionHeading>
      <Para>The app has dozens of pre-built interactive visualizations. Adding one to your lesson takes exactly one line in the <Cb>visualizations</Cb> array.</Para>

      <H3>How to add a viz</H3>
      <CodeBlock>{`intuition: {
  text: 'Your explanation...',
  visualizations: [
    { id: 'RiemannSum', props: {} },
  ],
},`}</CodeBlock>
      <Para>The <Cb>id</Cb> must exactly match the registration name in <Cb>VizFrame.jsx</Cb>. It is case-sensitive.</Para>

      <H3>Multiple vizs</H3>
      <CodeBlock>{`visualizations: [
  { id: 'SecantToTangent', props: {} },
  { id: 'PythonNotebook', props: {} },
],`}</CodeBlock>

      <H3>Passing parameters</H3>
      <CodeBlock>{`{ id: 'RiemannSum', props: { defaultN: 10, defaultMethod: 'midpoint' } }`}</CodeBlock>

      <H3>Available visualizations</H3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 my-3">
        {[
          ['SecantToTangent', 'Derivative intuition — secant → tangent line'],
          ['RiemannSum', 'Integration — Riemann sum explorer'],
          ['LimitApproach', 'Limits — approach from both sides'],
          ['EpsilonDelta', 'ε-δ definition explorer'],
          ['ChainRulePeeler', 'Chain rule decomposition'],
          ['NewtonsMethod', 'Root-finding iteration'],
          ['MVTViz', 'Mean Value Theorem visualization'],
          ['CurveSketchingBoard', 'Full curve sketching tool'],
          ['AreaBetweenCurves', 'Integration applications'],
          ['PythagoreanProof', 'Visual proof of Pythagorean theorem'],
          ['UnitCircle', 'Interactive unit circle'],
          ['UnitCircleMirror', 'Sine and cosine from unit circle'],
          ['PythonNotebook', 'Interactive Python cell (runs in browser)'],
          ['JSNotebook', 'Interactive JavaScript cell'],
          ['ParametricCurve3D', '3D parametric curve (Three.js)'],
          ['TangentPlane3D', '3D tangent plane visualization'],
          ['ForceBlockSim', 'Physics — force and acceleration (Matter.js)'],
          ['InclinedPlaneSim', 'Physics — inclined plane simulation'],
        ].map(([name, desc]) => (
          <div key={name} className="flex items-start gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
            <code className="font-mono text-xs text-brand-600 dark:text-brand-400 shrink-0 mt-0.5">{name}</code>
            <span className="text-xs text-slate-500 dark:text-slate-400">{desc}</span>
          </div>
        ))}
      </div>
      <Note color="blue">For the full list, open <Cb>src/components/viz/VizFrame.jsx</Cb> — every registered name is at the top of that file in <Cb>VIZ_REGISTRY</Cb>.</Note>
    </div>
  )
}

// ─── SECTION: BUILD VIZ ──────────────────────────────────────────────────────

function SectionBuildViz() {
  const [tpl, setTpl] = useState('prose')
  return (
    <div>
      <SectionHeading sub="Create a new interactive visualization from scratch.">Building a Visualization</SectionHeading>
      <Para>A visualization is a React component file. You write it in JSX, drop it in a folder, and register it with one line. Then it's available in any lesson.</Para>

      <H3>The 3-step process</H3>
      <div className="space-y-3 my-4">
        {[
          { n: '1', t: 'Create the file', d: 'Make a new .jsx file in src/components/viz/react/. Name it exactly as you want to call it from a lesson.' },
          { n: '2', t: 'Register in VizFrame.jsx', d: 'Add one line to the VIZ_REGISTRY object at the top of VizFrame.jsx.' },
          { n: '3', t: 'Use it in a lesson', d: 'Add { id: \'YourComponentName\', props: {} } to the visualizations array in any lesson file.' },
        ].map(item => (
          <div key={item.n} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center shrink-0">{item.n}</div>
            <div><div className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">{item.t}</div><div className="text-xs text-slate-500 dark:text-slate-400">{item.d}</div></div>
          </div>
        ))}
      </div>

      <H3>Register in VizFrame.jsx</H3>
      <CodeBlock>{`// In src/components/viz/VizFrame.jsx, add to VIZ_REGISTRY:
MyVizComponent: lazy(() => import('./react/MyVizComponent.jsx')),`}</CodeBlock>
      <Note color="amber">The key is CASE-SENSITIVE and must EXACTLY match the id you use in the lesson file and the default export name in the jsx file.</Note>

      <H3>Download a template</H3>
      <div className="flex flex-wrap gap-2 mb-4">
        {[['prose', 'Prose + toggles'], ['canvas', 'Canvas (graphs / animation)']].map(([id, label]) => (
          <button key={id} onClick={() => setTpl(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tpl === id ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
          >{label}</button>
        ))}
      </div>
      {tpl === 'prose'
        ? <DownloadCard icon="🧩" title="Prose Viz Template" filename="MyVizComponent.jsx" template={TPL_VIZ} desc="For text panels, toggles, step-through explanations, and comparison layouts. No canvas needed." />
        : <DownloadCard icon="🎨" title="Canvas Viz Template" filename="MyCanvasViz.jsx" template={TPL_CANVAS} desc="For animated graphs, geometry diagrams, and physics simulations. Includes ResizeObserver and the full 5-part canvas pattern." />}

      <H3>Required: the colors hook</H3>
      <Para>Copy this verbatim into every viz component — never modify it. It makes your component react to dark/light mode automatically.</Para>
      <CodeBlock>{`function useColors() {
  const isDark = () =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, {
      attributes: true, attributeFilter: ['class'],
    })
    return () => obs.disconnect()
  }, [])
  return { bg: dark ? '#0f172a' : '#f8fafc', /* ... */ }
}`}</CodeBlock>

      <H3>Canvas: the 5 required parts</H3>
      <div className="space-y-2 my-3">
        {[
          { p: 'A', t: 'canvasRef (not "ref")', c: 'const canvasRef = useRef(null)', d: '"ref" is semi-reserved in React. Name the canvas ref canvasRef — nothing else.' },
          { p: 'B', t: 'roRef', c: 'const roRef = useRef(null)', d: 'The ResizeObserver ref. Keeps the canvas up to date on window resize.' },
          { p: 'C', t: 'Set size inside draw()', c: 'cv.width = cv.offsetWidth || 500\ncv.height = 300', d: 'Must be set INSIDE draw(), every time. Setting width also clears the canvas: that\'s intentional.' },
          { p: 'D', t: 'Observe parentElement', c: 'roRef.current.observe(canvasRef.current.parentElement)', d: 'Observe the PARENT, not the canvas. The canvas has no CSS width to observe.' },
          { p: 'E', t: 'Cleanup', c: 'return () => { roRef.current?.disconnect() }', d: 'Without cleanup the observer keeps running after the component is gone — memory leak.' },
        ].map(item => (
          <div key={item.p} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{item.p}</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.t}</span>
            </div>
            <div className="px-3 py-2.5">
              <code className="text-xs font-mono text-teal-600 dark:text-teal-400 block mb-1 whitespace-pre">{item.c}</code>
              <span className="text-xs text-slate-500 dark:text-slate-400">{item.d}</span>
            </div>
          </div>
        ))}
      </div>

      <H3>Common crash causes</H3>
      <div className="space-y-2">
        {[
          { icon: '🔴', l: 'Variable named H', f: 'Use canvasH — H shadows the Heading component.' },
          { icon: '🔴', l: 'Observing canvas instead of parentElement', f: 'roRef.current.observe(canvasRef.current.parentElement) not canvasRef.current.' },
          { icon: '🔴', l: 'Missing cleanup for ResizeObserver', f: 'Always return () => { roRef.current?.disconnect() } from useEffect.' },
          { icon: '🟡', l: 'C not in useEffect deps', f: 'Colors go stale after dark mode toggle. Include C in the deps array.' },
          { icon: '🟡', l: 'Drawing before setting cv.width / cv.height', f: 'Setting dimensions clears the canvas — always set them first.' },
        ].map(item => (
          <div key={item.l} className="flex items-start gap-2.5 text-xs p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <span className="text-base shrink-0">{item.icon}</span>
            <div><span className="font-bold text-slate-800 dark:text-slate-200">{item.l}: </span><span className="text-slate-500 dark:text-slate-400">{item.f}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── STANDARDS SECTION ──────────────────────────────────────────────────────

const LESSON_STATES = [
  {
    label: 'Draft',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    desc: 'Initial content. The schema is valid and the lesson renders. Incomplete sections are allowed.',
  },
  {
    label: 'Review-Ready',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    desc: 'All required sections present. Prose checked for weak patterns. Math verified. At least one quiz question per learning objective.',
  },
  {
    label: 'Complete',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    desc: 'Review-Ready plus: all prose quality items pass, KaTeX verified, vizs interactive and referenced from prose, spiral links accurate.',
  },
]

const REQUIREMENTS = [
  {
    zone: '🪪 Identity',
    items: [
      { req: true,  text: 'id, chapter, title, subject all set' },
      { req: true,  text: 'prerequisites[] lists actual lesson ids, not topic names' },
      { req: false, text: 'mentalModel provided (1–2 sentences: what this "is" in plain language)' },
    ],
  },
  {
    zone: '🎣 Hook',
    items: [
      { req: true,  text: 'hook.question — a real-world question that makes the concept feel necessary' },
      { req: true,  text: 'hook.setup — 1–3 sentences framing why the question is hard' },
      { req: false, text: 'hook.visualization — interactive viz (text-only hooks rarely land)' },
    ],
  },
  {
    zone: '🧠 Intuition',
    items: [
      { req: true,  text: 'intuition.explanation — 2+ paragraphs building geometric or physical sense' },
      { req: true,  text: 'At least one interactive visualization tied to the intuition' },
      { req: false, text: 'semantics[] markers linking callouts to explanation paragraphs' },
    ],
  },
  {
    zone: '🔢 Math',
    items: [
      { req: true,  text: 'deepDive / proof section with KaTeX-formatted math' },
      { req: true,  text: 'Every step of every proof or derivation is shown — no "it follows that"' },
      { req: false, text: 'spiral.forward / spiral.backward links to related lessons' },
    ],
  },
  {
    zone: '✅ Assessment',
    items: [
      { req: true,  text: 'assessment block present — checks understanding, not just computation' },
      { req: true,  text: 'quiz[] — at least one question per major learning objective' },
      { req: true,  text: 'All quiz answers verified correct; partialCredit and hints filled in' },
    ],
  },
]

const PROSE_ANTI_PATTERNS = [
  { bad: '"This is simply…"',           fix: 'Explain the step; never imply it is obvious.' },
  { bad: '"You probably know…"',        fix: 'Define it or link to a prerequisite lesson.' },
  { bad: '"It can be shown that…"',     fix: 'Show it, or move it to a separate callout.' },
  { bad: 'Passive: "the limit is taken"', fix: 'Active: "we take the limit" or "the function approaches".' },
  { bad: '"Intuitively…" (then says nothing intuitive)', fix: 'Follow every "intuitively" with a visual or physical reference.' },
  { bad: 'Wall of LaTeX with no prose', fix: 'At least one explanatory sentence between every displayed equation.' },
]

function SectionStandards() {
  const [open, setOpen] = useState(null)
  return (
    <div className="space-y-6">
      <div>
        <H2>Content Standards</H2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Every lesson moves through three states before it is considered complete.
          Use these checklists during writing and before opening a pull request.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {LESSON_STATES.map(s => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.bg} ${s.border}`}>
            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${s.badge}`}>{s.label}</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div>
        <H3>Minimum requirements by section</H3>
        <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">
          <span className="font-bold text-red-500 dark:text-red-400">★ Required</span>{' '}
          items must be present for Review-Ready.{' '}
          <span className="font-bold text-slate-500">○ Recommended</span>{' '}
          items are needed for Complete.
        </p>
        <div className="space-y-2">
          {REQUIREMENTS.map(r => (
            <div key={r.zone} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                onClick={() => setOpen(open === r.zone ? null : r.zone)}
              >
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r.zone}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${open === r.zone ? 'rotate-90' : ''}`} />
              </button>
              {open === r.zone && (
                <div className="px-4 pb-3 pt-2 space-y-1.5">
                  {r.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className={`shrink-0 font-bold mt-0.5 ${item.req ? 'text-red-500 dark:text-red-400' : 'text-slate-400'}`}>
                        {item.req ? '★' : '○'}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">{item.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <H3>Prose quality — patterns to avoid</H3>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="grid grid-cols-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
            <span>Avoid</span>
            <span>Instead</span>
          </div>
          {PROSE_ANTI_PATTERNS.map((row, i) => (
            <div key={i} className={`grid grid-cols-2 gap-3 px-3 py-2.5 text-xs border-b border-slate-100 dark:border-slate-800 last:border-0 ${i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-900/30'}`}>
              <span className="text-red-500 dark:text-red-400 font-mono">{row.bad}</span>
              <span className="text-slate-600 dark:text-slate-400">{row.fix}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <H3>Math accuracy checklist</H3>
        <div className="space-y-1.5">
          {[
            'All definitions match the standard textbook definition for this level.',
            'Every theorem includes the full set of hypotheses — no hidden assumptions.',
            'LaTeX renders without errors; fractions use \\dfrac in display math.',
            'Variable names are consistent throughout the lesson (no silent reuse).',
            'Worked examples are computed correctly — verify algebraically, not just visually.',
            'Quiz numerical answers are exact (not rounded) unless the problem says otherwise.',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <Check className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-slate-600 dark:text-slate-400">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 px-4 py-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        <span className="font-bold text-brand-700 dark:text-brand-300">Full reference: </span>
        See <code className="font-mono bg-white/60 dark:bg-black/20 px-1 rounded">CONTRIBUTING.md</code> section&nbsp;1c for the complete standards specification and PR checklist.
      </div>
    </div>
  )
}

// ─── SECTION: AI PROMPTS ─────────────────────────────────────────────────────

const AI_PROMPTS = [
  {
    id: 'math-lesson',
    label: 'Math Lesson',
    color: 'blue',
    prompt: `You are generating a lesson for open-calc, an interactive math/STEM platform.

The lesson is a JS file with one default export matching this EXACT schema (no extra fields):

export default {
  id: 'ch1-derivatives',           // kebab-case, globally unique across all lessons
  slug: 'ch1-what-is-a-derivative', // kebab-case, used in the URL
  chapter: 'calc.1',               // MUST match the chapter object's number field exactly
  order: 3,                        // integer position within chapter
  title: 'What is a Derivative?',
  subtitle: 'One-line plain-English description',
  tags: ['calculus', 'derivatives'], // lowercase, hyphenated

  hook: {
    question: 'How fast is something changing right now?',
    realWorldContext: 'One paragraph explaining real-world relevance.',
    previewVisualizationId: 'SecantToTangent', // optional — leave out if none
  },

  intuition: {
    prose: ['Paragraph 1.', 'Paragraph 2.'], // plain English, no LaTeX
    callouts: [
      { type: 'important', title: 'Key idea', body: 'Explanation.' },
      { type: 'tip',       title: 'Shortcut', body: 'Explanation.' },
    ],
    visualizations: [
      { id: 'SecantToTangent', title: 'Display title', props: {} }
    ],
  },

  math: {
    prose: ['Formal definition...'],
    callouts: [],
    visualizations: [],
  },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [
    {
      title: 'Example: Power Rule',
      problem: 'Find the derivative of f(x) = x^3.',
      solution: 'Apply the power rule: bring down the exponent, reduce by 1.',
      latex: 'f(x)=x^3 \\\\Rightarrow f\'(x)=3x^2',
    },
  ],

  mentalModel: ['Key takeaway 1.', 'Key takeaway 2.'],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      question: 'What does f\'(x) measure?',
      options: ['Area under f', 'Instantaneous rate of change', 'Average value', 'Antiderivative'],
      answer: 1, // 0-indexed correct answer
      explanation: 'Because the derivative measures instantaneous rate of change.',
    },
  ],
};

RULES:
- All prose arrays contain plain English sentences — NO LaTeX, NO Markdown
- LaTeX only goes in: latex fields, callout body strings (use \\\\frac not \\frac in those)
- callout type must be one of: 'important', 'tip', 'warning'
- Never add schema fields not listed above
- Do not invent visualization IDs — only use ones explicitly provided to you
- id must be unique across the entire codebase`,
  },
  {
    id: 'js-playground',
    label: 'JS Notebook Lesson',
    color: 'amber',
    prompt: `You are generating an interactive JS coding lesson for open-calc using the JSNotebook component.

The file has TWO parts — a notebook cells const, then a lesson metadata export.

PART 1 — Notebook cells (define at module top level):

const LESSON_MY_TOPIC = {
  title: 'Lesson Title',
  subtitle: 'One-line description',
  sequential: true,
  cells: [
    // MARKDOWN cell — explanation/context only, no code
    {
      type: 'markdown',
      instruction: '## Section heading\n\nExplanation prose. Use **bold** for emphasis.',
    },
    // JS cell — live runnable code
    {
      type: 'js',
      instruction: 'What this cell teaches (use backtick code spans for keywords).',
      html: '<div id="output"></div>',
      css: 'body { background: #0f172a; color: #e2e8f0; padding: 12px; font-family: monospace; }',
      startCode: '// Starter code the student sees and can run',
      outputHeight: 300,
    },
    // CHALLENGE cell — student fills in blanks
    {
      type: 'challenge',
      instruction: '**Challenge:** Complete the function...',
      html: '<div id="result"></div>',
      css: 'body { background: #0f172a; color: #e2e8f0; padding: 12px; }',
      startCode: '// Scaffold with YOUR CODE HERE comments',
      solutionCode: '// The complete working solution',
      check: (code) => /expectedPattern/.test(code),
      successMessage: 'Correct! Here is why it works.',
      failMessage: 'Check X and Y in your code.',
      outputHeight: 400,
    },
  ],
};

PART 2 — Lesson metadata export:

export default {
  id: 'tetris-02-describing-a-piece',
  slug: 'tetris-describing-a-piece',
  chapter: 'tetris.1',
  order: 2,
  title: 'Describing a Piece',
  subtitle: '...',
  tags: ['javascript', 'arrays'],
  hook: { question: '...', realWorldContext: '...', previewVisualizationId: 'JSNotebook' },
  intuition: {
    prose: ['...'],
    callouts: [],
    visualizations: [{ id: 'JSNotebook', title: 'Lesson display title', props: { lesson: LESSON_MY_TOPIC } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: ['Takeaway 1.', 'Takeaway 2.'],
  checkpoints: ['read-intuition'],
  quiz: [],
};

RULES:
- sequential: true means later cells can use variables declared in earlier cells
- Every js/challenge cell must have: html, css, startCode, outputHeight
- Every challenge cell must also have: solutionCode, check(), successMessage, failMessage
- CSS uses dark theme by default: background #0f172a, text #e2e8f0
- check() receives the student's full code as a string — use regex to verify key patterns
- Keep each cell focused on ONE concept
- Don't import anything — the notebook environment provides the browser globals`,
  },
  {
    id: 'viz-component',
    label: 'New Viz Component',
    color: 'violet',
    prompt: `You are building a new visualization React component for open-calc.

FILE TARGET: src/components/viz/react/MyComponent.jsx

COMPONENT RULES:
1. One file, one default export — the React component
2. Props signature: ({ params = {} }) — read config from params if needed
3. Self-contained — no external data file imports, no CSS module imports
4. Styling: inline styles or Tailwind classes only (no styled-components)
5. No document.querySelector outside useEffect. Clean up all effects on unmount.
6. Responsive: do not use height: 100vh. Render inside a card of natural height.
7. Dark mode: check document.documentElement.classList.contains('dark') or listen for class changes via MutationObserver.
8. Available globals: React, three (as 'three'), d3 (as 'd3'). No other external libs.
9. Keep the component under 400 lines. Move sub-components into the same file.

REGISTRATION — add one line to src/components/viz/VizFrame.jsx inside VIZ_REGISTRY:
  MyComponent: lazy(() => import('./react/MyComponent.jsx')),

USAGE in a lesson file:
  visualizations: [{ id: 'MyComponent', title: 'Display Title', props: { key: value } }]

VALIDATION:
  Run: npm run build
  No TypeScript, no JSX transform issues — the project uses standard Vite + React 18.`,
  },
  {
    id: 'new-course',
    label: 'New Course',
    color: 'green',
    prompt: `You are adding a new course to open-calc. Complete all 5 steps exactly.

STEP 1 — Create src/content/[course-key]-1/lesson1.js
Use the full Math Lesson schema. Set chapter: '[coursekey.1]' — must match STEP 2's number.

STEP 2 — Create src/content/[course-key]-1/index.js
import lesson1 from './lesson1.js'
const COURSE_CH1 = {
  title: 'Chapter Title',
  number: '[coursekey.1]',   // ← lesson chapter fields must match this exactly
  slug: 'coursekey-chapter-slug',
  description: 'One paragraph.',
  course: '[course-key]-1',  // must match STEP 3's key
  lessons: [lesson1],
};
export default [COURSE_CH1];

STEP 3 — Add to src/content/courses.js (inside the COURSES array):
{
  key: '[course-key]-1',
  label: 'Course Display Name',
  path: '/course/[course-key]-1',
  desc: 'Short tagline',
  color: 'indigo',  // Tailwind color name
},

STEP 4 — Add to src/content/index.js:
// At the top with other imports:
import courseKey1 from './[course-key]-1/index.js'
// In the const section:
const COURSE_KEY_CURRICULUM = courseKey1.map(ch => ({ ...ch, course: '[course-key]-1' }))
// In the CURRICULUM array:
...COURSE_KEY_CURRICULUM,

STEP 5 — Register any new viz components in VizFrame.jsx if lessons use them.

VALIDATION: Run npm run build and check for:
  ✔ "[N] lessons indexed" — number should increase
  ✔ No "[open-calc validator]" warnings (chapter mismatch)
  ✔ "built in Xs" with no errors`,
  },
]

function SectionAIPrompts() {
  const [active, setActive] = useState('math-lesson')
  const [copied, setCopied] = useState(false)
  const prompt = AI_PROMPTS.find(p => p.id === active)

  const copy = () => {
    navigator.clipboard.writeText(prompt.prompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const colorMap = {
    blue:   'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    amber:  'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    violet: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    green:  'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  }

  return (
    <div>
      <SectionHeading sub="Paste into any AI assistant. It already knows the rules.">
        AI Generation Prompts
      </SectionHeading>

      <Para>
        These prompts encode open-calc conventions — the exact lesson schema, JSNotebook cell format, viz registration steps, and build validation commands. Paste one into ChatGPT, Claude, or Copilot Chat and describe what you want to build.
      </Para>

      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 mb-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
        <span className="font-bold text-amber-700 dark:text-amber-400">Why a prompt?</span>{' '}
        AI-generated files often deviate from project structure — wrong schema fields, bad import paths, invented viz IDs. These prompts front-load the rules so the AI follows them from the first response.
      </div>

      {/* Selector tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {AI_PROMPTS.map(p => (
          <button
            key={p.id}
            onClick={() => { setActive(p.id); setCopied(false) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              active === p.id
                ? colorMap[p.color]
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Prompt display */}
      <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-950 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-700">
          <span className="text-xs font-mono text-slate-400">{prompt?.label} prompt</span>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600"
          >
            <ClipboardCopy className="w-3.5 h-3.5" />
            {copied ? 'Copied!' : 'Copy prompt'}
          </button>
        </div>
        <pre className="px-4 py-4 text-xs text-slate-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
          {prompt?.prompt}
        </pre>
      </div>

      <H3>How to use</H3>
      <ol className="space-y-3 mt-3">
        {[
          'Pick the prompt matching what you want to build: Math Lesson, JS Notebook, Viz Component, or New Course.',
          'Click Copy and paste the prompt into your AI chat as the first message (system prompt or opening context).',
          'Describe your request: "Write a lesson on the chain rule with 3 worked examples" or "Build an interactive pendulum for the physics course."',
          'Review the AI output against the schema. Check: chapter matches, id is unique, no extra fields, viz IDs are real.',
          'Run npm run build and watch for [open-calc validator] warnings. Fix any chapter mismatches before committing.',
        ].map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ─── NAVIGATION ──────────────────────────────────────────────────────────────

const NAV = [
  {
    group: 'Start Here',
    items: [
      { id: 'overview',      label: 'How It Works',        Icon: BookOpen },
      { id: 'first-lesson',  label: 'Your First Lesson',   Icon: Play },
      { id: 'anatomy',       label: 'Lesson Anatomy',      Icon: Eye },
    ],
  },
  {
    group: 'Content',
    items: [
      { id: 'types',         label: 'Lesson Types',        Icon: Layers },
    ],
  },
  {
    group: 'Code & Python',
    items: [
      { id: 'opencalc',      label: 'opencalc Library',    Icon: Terminal },
    ],
  },
  {
    group: 'Visualizations',
    items: [
      { id: 'use-viz',       label: 'Using Vizs',          Icon: Zap },
      { id: 'build-viz',     label: 'Building Vizs',       Icon: Code2 },
    ],
  },
  {
    group: 'Quality',
    items: [
      { id: 'standards',     label: 'Content Standards',   Icon: CheckSquare },
    ],
  },
  {
    group: 'AI Generation',
    items: [
      { id: 'ai-prompts',    label: 'AI Prompts',          Icon: Bot },
    ],
  },
]

const SECTION_MAP = {
  'overview':     SectionOverview,
  'first-lesson': SectionFirstLesson,
  'anatomy':      SectionAnatomy,
  'types':        SectionTypes,
  'opencalc':     SectionOpencalc,
  'use-viz':      SectionUseViz,
  'build-viz':    SectionBuildViz,
  'standards':    SectionStandards,
  'ai-prompts':   SectionAIPrompts,
}

// ─── MAIN MODAL ──────────────────────────────────────────────────────────────

export default function HelpModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const ActiveSection = SECTION_MAP[activeSection] ?? SectionOverview

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl h-[96vh] sm:h-[92vh] bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Contributor Docs</h1>
              <p className="text-[11px] text-white/70">open-calc · For all skill levels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Close docs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left nav — desktop */}
          <nav className="hidden sm:block w-52 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-y-auto py-3 px-2">
            {NAV.map(group => (
              <div key={group.group} className="mb-4">
                <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{group.group}</p>
                {group.items.map(item => {
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-800'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <item.Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>

          {/* Mobile tabs */}
          <div className="sm:hidden w-full shrink-0 flex gap-1.5 overflow-x-auto px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 absolute top-[60px] left-0 z-10">
            {NAV.flatMap(g => g.items).map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${activeSection === item.id ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                <item.Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 sm:mt-0 mt-14">
            <ActiveSection key={activeSection} />
          </div>
        </div>
      </div>
    </div>
  )
}
