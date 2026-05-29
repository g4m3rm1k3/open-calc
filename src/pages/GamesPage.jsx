import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Gamepad2, Play, Sparkles } from 'lucide-react'
import ArcadeMazeBackground from '../components/games/ArcadeMazeBackground.jsx'

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
  rose:    'bg-rose-950/50 border-rose-300/25 hover:border-rose-200/70 hover:shadow-rose-500/20',
  amber:   'bg-amber-950/40 border-amber-300/25 hover:border-amber-200/70 hover:shadow-amber-500/20',
  cyan:    'bg-cyan-950/45 border-cyan-300/25 hover:border-cyan-200/70 hover:shadow-cyan-500/20',
  indigo:  'bg-indigo-950/50 border-indigo-300/25 hover:border-indigo-200/70 hover:shadow-indigo-500/20',
  orange:  'bg-orange-950/45 border-orange-300/25 hover:border-orange-200/70 hover:shadow-orange-500/20',
  purple:  'bg-fuchsia-950/45 border-fuchsia-300/25 hover:border-fuchsia-200/70 hover:shadow-fuchsia-500/20',
  emerald: 'bg-emerald-950/45 border-emerald-300/25 hover:border-emerald-200/70 hover:shadow-emerald-500/20',
  violet:  'bg-violet-950/45 border-violet-300/25 hover:border-violet-200/70 hover:shadow-violet-500/20',
  fuchsia: 'bg-fuchsia-950/45 border-fuchsia-300/25 hover:border-fuchsia-200/70 hover:shadow-fuchsia-500/20',
  slate:   'bg-slate-950/55 border-slate-300/20 hover:border-slate-200/60 hover:shadow-slate-500/20',
}

const LABEL = {
  rose:    'text-rose-100',
  amber:   'text-amber-100',
  cyan:    'text-cyan-100',
  indigo:  'text-indigo-100',
  orange:  'text-orange-100',
  purple:  'text-fuchsia-100',
  emerald: 'text-emerald-100',
  violet:  'text-violet-100',
  fuchsia: 'text-fuchsia-100',
  slate:   'text-slate-100',
}

const TAG = {
  rose:    'bg-rose-300/15 text-rose-100 ring-1 ring-rose-100/20',
  amber:   'bg-amber-300/15 text-amber-100 ring-1 ring-amber-100/20',
  cyan:    'bg-cyan-300/15 text-cyan-100 ring-1 ring-cyan-100/20',
  indigo:  'bg-indigo-300/15 text-indigo-100 ring-1 ring-indigo-100/20',
  orange:  'bg-orange-300/15 text-orange-100 ring-1 ring-orange-100/20',
  purple:  'bg-fuchsia-300/15 text-fuchsia-100 ring-1 ring-fuchsia-100/20',
  emerald: 'bg-emerald-300/15 text-emerald-100 ring-1 ring-emerald-100/20',
  violet:  'bg-violet-300/15 text-violet-100 ring-1 ring-violet-100/20',
  fuchsia: 'bg-fuchsia-300/15 text-fuchsia-100 ring-1 ring-fuchsia-100/20',
  slate:   'bg-slate-300/15 text-slate-100 ring-1 ring-slate-100/20',
}

function GameCard({ item, action }) {
  const bg  = BG[item.color]   ?? BG.slate
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
        {item.event ? 'Launch' : 'Play'}
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
    <div className="relative min-h-[calc(100vh-9rem)] text-white">
      <ArcadeMazeBackground />

      <div className="relative z-10 mx-auto max-w-5xl pt-6 sm:pt-10">
        <div className="mb-10 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-[8px] border border-cyan-200/20 bg-cyan-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100 backdrop-blur-md">
            <Gamepad2 className="h-4 w-4" />
            Games
          </div>
          <h1 className="mb-4 text-4xl font-black leading-tight text-white sm:text-6xl">
            Arcade learning, running live behind the page.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-100/76 sm:text-lg">
            Apply what you're learning through arcade challenges, physics playgrounds, and sports math.
          </p>
        </div>

        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-cyan-100/80">
          <Sparkles className="h-4 w-4" />
          <span>Original neon maze engine active</span>
        </div>

        <div className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map(g => (
            <GameCard key={g.key} item={g} action={() => launch(g.event)} />
          ))}
        </div>
      </div>
    </div>
  )
}
