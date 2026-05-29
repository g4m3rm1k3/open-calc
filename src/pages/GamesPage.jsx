import { Link } from 'react-router-dom'
import { useEffect } from 'react'

const GAMES = [
  {
    key: 'arkanoid',
    label: 'Arkanoid Learn',
    emoji: '🎮',
    color: 'rose',
    desc: 'Break bricks by answering math questions. Miss one and the wall fights back.',
    path: '/arkanoid-learn',
    tags: ['Arcade', 'Math'],
  },
  {
    key: 'stem-quest',
    label: 'STEM Quest',
    emoji: '🗺️',
    color: 'amber',
    desc: 'Explore an interactive adventure map packed with STEM challenges.',
    path: '/stem-quest',
    tags: ['Adventure', 'Multi-subject'],
  },
  {
    key: 'open-craft',
    label: 'OpenCraft',
    emoji: '⛏️',
    color: 'cyan',
    desc: 'Build and explore in a physics-based voxel sandbox.',
    path: '/open-craft',
    tags: ['Sandbox', 'Physics'],
  },
  {
    key: 'reality-runner',
    label: 'Reality Runner',
    emoji: '🏃',
    color: 'indigo',
    desc: 'Run through physics simulations and dodge equations in real time.',
    path: '/reality-runner',
    tags: ['Runner', 'Physics'],
  },
  {
    key: 'basketball',
    label: 'Basketball Lab',
    emoji: '🏀',
    color: 'orange',
    desc: 'Apply trajectory and calculus to perfect your arc and sink every shot.',
    event: 'basketball',
    tags: ['Physics', 'Calculus'],
  },
  {
    key: 'pool',
    label: 'Physics Pool',
    emoji: '🎱',
    color: 'purple',
    desc: 'Explore collision physics and bank angles on the felt.',
    event: 'pool',
    tags: ['Physics', 'Geometry'],
  },
  {
    key: 'golf',
    label: 'Mini Golf',
    emoji: '⛳',
    color: 'emerald',
    desc: 'Apply geometry and projectile motion to sink every putt.',
    event: 'golf',
    tags: ['Geometry', 'Physics'],
  },
  {
    key: 'football',
    label: 'Football Calculus',
    emoji: '🏈',
    color: 'amber',
    desc: 'Use integration and optimization to analyze routes and trajectories.',
    event: 'football',
    tags: ['Calculus', 'Sports'],
  },
]


const BG = {
  rose:    'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 hover:border-rose-400 dark:hover:border-rose-600',
  amber:   'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600',
  cyan:    'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800 hover:border-cyan-400 dark:hover:border-cyan-600',
  indigo:  'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600',
  orange:  'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600',
  purple:  'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600',
  violet:  'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 hover:border-violet-400 dark:hover:border-violet-600',
  fuchsia: 'bg-fuchsia-50 dark:bg-fuchsia-950/30 border-fuchsia-200 dark:border-fuchsia-800 hover:border-fuchsia-400 dark:hover:border-fuchsia-600',
  slate:   'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500',
}

const LABEL = {
  rose:    'text-rose-700 dark:text-rose-300',
  amber:   'text-amber-700 dark:text-amber-300',
  cyan:    'text-cyan-700 dark:text-cyan-300',
  indigo:  'text-indigo-700 dark:text-indigo-300',
  orange:  'text-orange-700 dark:text-orange-300',
  purple:  'text-purple-700 dark:text-purple-300',
  emerald: 'text-emerald-700 dark:text-emerald-300',
  violet:  'text-violet-700 dark:text-violet-300',
  fuchsia: 'text-fuchsia-700 dark:text-fuchsia-300',
  slate:   'text-slate-700 dark:text-slate-300',
}

const TAG = {
  rose:    'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
  amber:   'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
  cyan:    'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400',
  indigo:  'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
  orange:  'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
  purple:  'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
  violet:  'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400',
  fuchsia: 'bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-600 dark:text-fuchsia-400',
  slate:   'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
}

function GameCard({ item, action }) {
  const bg  = BG[item.color]   ?? BG.slate
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
        {item.event ? 'Launch →' : 'Play →'}
      </span>
    </div>
  )

  if (item.path) {
    return <Link to={item.path} className="flex flex-col">{inner}</Link>
  }

  return (
    <button className="flex flex-col text-left" onClick={action}>
      {inner}
    </button>
  )
}

export default function GamesPage() {
  useEffect(() => {
    document.title = 'Games — UpSkillOS'
    return () => { document.title = 'UpSkillOS' }
  }, [])

  function launch(name) {
    window.dispatchEvent(new CustomEvent('oc-open-game', { detail: { game: name } }))
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Games</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Apply what you're learning — arcade challenges, physics playgrounds, and sports math.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map(g => (
          <GameCard key={g.key} item={g} action={() => launch(g.event)} />
        ))}
      </div>
    </div>
  )
}
