import { Link } from 'react-router-dom'
import { useEffect } from 'react'

const LABS = [
  {
    key: 'openmat',
    label: 'OpenMAT',
    emoji: '⚛️',
    color: 'indigo',
    desc: 'Full-featured math computation engine with symbolic algebra, 3D graphing, and matrix tools.',
    path: '/openmat',
    tags: ['Math', 'Platform'],
  },
  {
    key: 'cnc-sim',
    label: 'CNC Simulator',
    emoji: '🔧',
    color: 'amber',
    desc: 'Program and simulate CNC toolpaths with a live 3D backplot and fixture management.',
    path: '/cnc-sim',
    tags: ['Engineering', 'CAD'],
  },
  {
    key: 'logic-sim',
    label: 'Logic Suite',
    emoji: '⚡',
    color: 'violet',
    desc: 'Design and simulate digital logic circuits gate by gate with truth tables.',
    path: '/logic-sim',
    tags: ['CS', 'Engineering'],
  },
  {
    key: 'chemistry',
    label: 'Chemistry Lab',
    emoji: '🧪',
    color: 'cyan',
    desc: 'Explore chemical reactions, periodic table data, and molecular structures interactively.',
    event: 'chemistry',
    tags: ['Chemistry', 'Lab'],
  },
  {
    key: 'physics',
    label: 'Physics Engine',
    emoji: '🌌',
    color: 'fuchsia',
    desc: 'Simulate rigid body dynamics, forces, springs, pendulums, and wave mechanics.',
    event: 'physics',
    tags: ['Physics', 'Simulation'],
  },
  {
    key: 'cad-pro',
    label: 'CAD Pro',
    emoji: '📐',
    color: 'slate',
    desc: 'Parametric 3D modelling with constraint-based design tools.',
    path: '/cad-pro',
    tags: ['Engineering', 'Design'],
  },
  {
    key: 'universal-calc',
    label: 'Universal Calc',
    emoji: '🧮',
    color: 'emerald',
    desc: 'One calculator for everything — unit conversion, constants, formulas, and numerical methods.',
    path: '/universal-calc',
    tags: ['Math', 'Tools'],
  },
]

const BG = {
  indigo:  'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600',
  amber:   'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600',
  violet:  'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 hover:border-violet-400 dark:hover:border-violet-600',
  cyan:    'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800 hover:border-cyan-400 dark:hover:border-cyan-600',
  fuchsia: 'bg-fuchsia-50 dark:bg-fuchsia-950/30 border-fuchsia-200 dark:border-fuchsia-800 hover:border-fuchsia-400 dark:hover:border-fuchsia-600',
  slate:   'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600',
}

const LABEL = {
  indigo:  'text-indigo-700 dark:text-indigo-300',
  amber:   'text-amber-700 dark:text-amber-300',
  violet:  'text-violet-700 dark:text-violet-300',
  cyan:    'text-cyan-700 dark:text-cyan-300',
  fuchsia: 'text-fuchsia-700 dark:text-fuchsia-300',
  slate:   'text-slate-700 dark:text-slate-300',
  emerald: 'text-emerald-700 dark:text-emerald-300',
}

const TAG = {
  indigo:  'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
  amber:   'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
  violet:  'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400',
  cyan:    'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400',
  fuchsia: 'bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-600 dark:text-fuchsia-400',
  slate:   'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
}

function LabCard({ item, action }) {
  const bg  = BG[item.color]    ?? BG.slate
  const lbl = LABEL[item.color] ?? LABEL.slate
  const tag = TAG[item.color]   ?? TAG.slate

  const inner = (
    <div className={`group flex flex-col rounded-2xl border p-5 h-full transition-all hover:shadow-md ${bg}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl leading-none">{item.emoji}</span>
        <div className="flex flex-wrap gap-1 justify-end">
          {item.tags.map(t => (
            <span key={t} className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${tag}`}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <span className={`text-sm font-bold mb-1 ${lbl}`}>{item.label}</span>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug flex-1 mb-4">
        {item.desc}
      </p>

      <span className={`text-xs font-semibold group-hover:opacity-100 opacity-60 transition-opacity ${lbl}`}>
        Launch →
      </span>
    </div>
  )

  if (item.path) {
    return <Link to={item.path} className="flex flex-col">{inner}</Link>
  }

  return (
    <button className="flex flex-col text-left w-full" onClick={action}>
      {inner}
    </button>
  )
}

export default function LabsPage() {
  useEffect(() => {
    document.title = 'Labs — UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [])

  function launch(name) {
    window.dispatchEvent(new CustomEvent('oc-open-game', { detail: { game: name } }))
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Labs</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Hands-on simulations and interactive tools — experiment, model, and build.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LABS.map(lab => (
          <LabCard key={lab.key} item={lab} action={() => launch(lab.event)} />
        ))}
      </div>
    </div>
  )
}
