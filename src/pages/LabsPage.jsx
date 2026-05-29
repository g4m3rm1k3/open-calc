import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { FlaskConical, Play, Sparkles } from 'lucide-react'
import LabWorkbenchBackground from '../components/labs/LabWorkbenchBackground.jsx'

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
  indigo:  'bg-indigo-950/50 border-indigo-300/25 hover:border-indigo-200/70 hover:shadow-indigo-500/20',
  amber:   'bg-amber-950/40 border-amber-300/25 hover:border-amber-200/70 hover:shadow-amber-500/20',
  violet:  'bg-violet-950/45 border-violet-300/25 hover:border-violet-200/70 hover:shadow-violet-500/20',
  cyan:    'bg-cyan-950/45 border-cyan-300/25 hover:border-cyan-200/70 hover:shadow-cyan-500/20',
  fuchsia: 'bg-fuchsia-950/45 border-fuchsia-300/25 hover:border-fuchsia-200/70 hover:shadow-fuchsia-500/20',
  slate:   'bg-slate-950/55 border-slate-300/20 hover:border-slate-200/60 hover:shadow-slate-500/20',
  emerald: 'bg-emerald-950/45 border-emerald-300/25 hover:border-emerald-200/70 hover:shadow-emerald-500/20',
}

const LABEL = {
  indigo:  'text-indigo-100',
  amber:   'text-amber-100',
  violet:  'text-violet-100',
  cyan:    'text-cyan-100',
  fuchsia: 'text-fuchsia-100',
  slate:   'text-slate-100',
  emerald: 'text-emerald-100',
}

const TAG = {
  indigo:  'bg-indigo-300/15 text-indigo-100 ring-1 ring-indigo-100/20',
  amber:   'bg-amber-300/15 text-amber-100 ring-1 ring-amber-100/20',
  violet:  'bg-violet-300/15 text-violet-100 ring-1 ring-violet-100/20',
  cyan:    'bg-cyan-300/15 text-cyan-100 ring-1 ring-cyan-100/20',
  fuchsia: 'bg-fuchsia-300/15 text-fuchsia-100 ring-1 ring-fuchsia-100/20',
  slate:   'bg-slate-300/15 text-slate-100 ring-1 ring-slate-100/20',
  emerald: 'bg-emerald-300/15 text-emerald-100 ring-1 ring-emerald-100/20',
}

function LabCard({ item, action }) {
  const bg  = BG[item.color]    ?? BG.slate
  const lbl = LABEL[item.color] ?? LABEL.slate
  const tag = TAG[item.color]   ?? TAG.slate

  const inner = (
    <div className={`group flex h-full flex-col rounded-[8px] border p-5 text-white shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${bg}`}>
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
      <p className="text-sm text-slate-200/78 leading-snug flex-1 mb-4">
        {item.desc}
      </p>

      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold opacity-70 transition-opacity group-hover:opacity-100 ${lbl}`}>
        <Play className="h-3.5 w-3.5" />
        Launch
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
    <div className="relative min-h-[calc(100vh-9rem)] text-white">
      <LabWorkbenchBackground />

      <div className="relative z-10 mx-auto max-w-5xl pt-6 sm:pt-10">
        <div className="mb-10 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-[8px] border border-emerald-200/20 bg-emerald-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-100 backdrop-blur-md">
            <FlaskConical className="h-4 w-4" />
            Labs
          </div>
          <h1 className="mb-4 text-4xl font-black leading-tight text-white sm:text-6xl">
            Live simulations with the engine humming underneath.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-100/76 sm:text-lg">
            Hands-on simulations and interactive tools for experimenting, modeling, and building.
          </p>
        </div>

        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-emerald-100/80">
          <Sparkles className="h-4 w-4" />
          <span>Interactive 3D lab backdrop active</span>
        </div>

        <div className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
          {LABS.map(lab => (
            <LabCard key={lab.key} item={lab} action={() => launch(lab.event)} />
          ))}
        </div>
      </div>
    </div>
  )
}
