/**
 * BrainPage — Cognitive training hub.
 *
 * Architecture: PUZZLES registry array.  Adding a new puzzle = push one entry.
 * Each entry describes the puzzle and provides a lazy-loadable component.
 *
 * Current puzzles:
 *   1. Dual N-Back  — working memory / fluid intelligence (Jaeggi et al. 2008)
 *
 * Planned (registry stubs show what's coming):
 *   2. Stroop Task       — attention control, cognitive flexibility
 *   3. Mental Rotation   — spatial reasoning, visuospatial working memory
 *   4. Arithmetic Sprint — processing speed, numerical fluency
 *   5. Pattern Memory    — episodic memory, visual sequence recall
 */

import { lazy, Suspense, useState } from 'react'
import { Brain, Clock, Star, Lock, ChevronRight, Zap, RotateCcw, Hash, Grid3x3 } from 'lucide-react'

const DualNBack        = lazy(() => import('./components/DualNBack.jsx'))
const StroopTask       = lazy(() => import('./components/StroopTask.jsx'))
const MentalRotation   = lazy(() => import('./components/MentalRotation.jsx'))
const ArithmeticSprint = lazy(() => import('./components/ArithmeticSprint.jsx'))
const PatternMemory    = lazy(() => import('./components/PatternMemory.jsx'))

// ─── Puzzle Registry ──────────────────────────────────────────────────────────
// To add a puzzle: push an entry here + create the component.
// status: 'available' | 'soon'
const PUZZLES = [
  {
    id:          'dual-nback',
    title:       'Dual N-Back',
    tagline:     'Working memory & fluid intelligence',
    description: 'Track two independent streams (position + letter) N steps back. The only cognitive training task with replicated evidence for transfer to fluid intelligence.',
    icon:        Grid3x3,
    color:       'violet',
    difficulty:  'Adaptive',
    timeEst:     '5–10 min',
    science:     'Jaeggi et al. (2008) PNAS',
    status:      'available',
    component:   DualNBack,
  },
  {
    id:         'stroop',
    title:      'Stroop Task',
    tagline:    'Attention control & cognitive flexibility',
    description: 'Name the ink colour, not the word — your brain wants to read, you have to override it. Trains executive attention and conflict resolution.',
    icon:        Zap,
    color:       'rose',
    difficulty:  'Adaptive',
    timeEst:     '3–5 min',
    science:     'Stroop (1935); MacLeod (1991) Psych Bull',
    status:      'available',
    component:   StroopTask,
  },
  {
    id:         'mental-rotation',
    title:      'Mental Rotation',
    tagline:    'Spatial reasoning & visuospatial memory',
    description: 'Judge whether two shapes are the same object at different orientations or mirror images. Builds spatial working memory and correlates with STEM performance.',
    icon:        RotateCcw,
    color:       'sky',
    difficulty:  'Adaptive',
    timeEst:     '5 min',
    science:     'Shepard & Metzler (1971) Science',
    status:      'available',
    component:   MentalRotation,
  },
  {
    id:         'arithmetic-sprint',
    title:      'Arithmetic Sprint',
    tagline:    'Processing speed & numerical fluency',
    description: 'Timed mental arithmetic — mixed operations, increasing complexity. Builds automatic number sense and processing speed.',
    icon:        Hash,
    color:       'amber',
    difficulty:  'Adaptive',
    timeEst:     '3–5 min',
    science:     'Dehaene (1992) Cognition',
    status:      'available',
    component:   ArithmeticSprint,
  },
  {
    id:         'pattern-memory',
    title:      'Pattern Memory',
    tagline:    'Episodic memory & visual sequence recall',
    description: 'Watch a growing sequence of highlighted cells, then replay it. Classic Corsi block-tapping working memory span task in visual form.',
    icon:        Star,
    color:       'emerald',
    difficulty:  'Adaptive',
    timeEst:     '4–8 min',
    science:     'Corsi (1972) block-tapping paradigm',
    status:      'available',
    component:   PatternMemory,
  },
]

// ─── Color maps ───────────────────────────────────────────────────────────────
const COLOR = {
  violet: { badge: 'bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800', ring: 'hover:border-violet-300 dark:hover:border-violet-700', icon: 'text-violet-500', active: 'border-violet-400 dark:border-violet-600 bg-violet-50 dark:bg-violet-950/20' },
  rose:   { badge: 'bg-rose-100   dark:bg-rose-950/40   text-rose-700   dark:text-rose-300   border-rose-200   dark:border-rose-800',   ring: 'hover:border-rose-300   dark:hover:border-rose-700',   icon: 'text-rose-400',   active: 'border-rose-400   dark:border-rose-600   bg-rose-50   dark:bg-rose-950/20'   },
  sky:    { badge: 'bg-sky-100    dark:bg-sky-950/40    text-sky-700    dark:text-sky-300    border-sky-200    dark:border-sky-800',    ring: 'hover:border-sky-300    dark:hover:border-sky-700',    icon: 'text-sky-500',    active: 'border-sky-400    dark:border-sky-600    bg-sky-50    dark:bg-sky-950/20'    },
  amber:  { badge: 'bg-amber-100  dark:bg-amber-950/40  text-amber-700  dark:text-amber-300  border-amber-200  dark:border-amber-800',  ring: 'hover:border-amber-300  dark:hover:border-amber-700',  icon: 'text-amber-500',  active: 'border-amber-400  dark:border-amber-600  bg-amber-50  dark:bg-amber-950/20'  },
  emerald:{ badge: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', ring: 'hover:border-emerald-300 dark:hover:border-emerald-700', icon: 'text-emerald-500', active: 'border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' },
}

// ─── PuzzleCard ───────────────────────────────────────────────────────────────
function PuzzleCard({ puzzle, selected, onSelect }) {
  const c   = COLOR[puzzle.color] ?? COLOR.violet
  const Icon = puzzle.icon
  const available = puzzle.status === 'available'
  return (
    <button
      onClick={() => available && onSelect(puzzle.id)}
      disabled={!available}
      className={`w-full text-left rounded-2xl border p-4 transition-all group
        ${selected ? c.active + ' border-2' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}
        ${available ? c.ring + ' cursor-pointer hover:shadow-sm' : 'opacity-60 cursor-not-allowed'}
      `}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl ${selected ? 'bg-white/60 dark:bg-slate-800/60' : 'bg-slate-100 dark:bg-slate-700'}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{puzzle.title}</h3>
            {!available && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md">
                <Lock className="w-2.5 h-2.5" /> Coming soon
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{puzzle.tagline}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${c.badge}`}>{puzzle.difficulty}</span>
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400"><Clock className="w-3 h-3" />{puzzle.timeEst}</span>
          </div>
        </div>
        {available && <ChevronRight className={`w-4 h-4 text-slate-300 dark:text-slate-600 mt-1 transition-transform ${selected ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />}
      </div>
      {selected && available && (
        <p className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {puzzle.description}{' '}
          <span className="italic text-slate-400">— {puzzle.science}</span>
        </p>
      )}
    </button>
  )
}

// ─── Loading fallback ─────────────────────────────────────────────────────────
function PuzzleLoader() {
  return (
    <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm">
      <Brain className="w-5 h-5 animate-pulse text-violet-400" />
      Loading puzzle…
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BrainPage() {
  const [activePuzzle, setActivePuzzle] = useState('dual-nback')
  const puzzle = PUZZLES.find(p => p.id === activePuzzle)
  const PuzzleComponent = puzzle?.component ?? null

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
      {/* Decorative blur */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full bg-violet-400/10 dark:bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-indigo-400/10 dark:bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-violet-100 dark:bg-violet-900/40 border border-violet-200 dark:border-violet-800">
              <Brain className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Brain Training</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Evidence-based cognitive exercises · Progress saved locally</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          {/* Puzzle selector */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 mb-3">Exercises</p>
            {PUZZLES.map(p => (
              <PuzzleCard key={p.id} puzzle={p} selected={activePuzzle === p.id} onSelect={setActivePuzzle} />
            ))}
          </div>

          {/* Active puzzle */}
          <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 p-5 shadow-sm min-h-[500px]">
            {PuzzleComponent
              ? <Suspense fallback={<PuzzleLoader />}><PuzzleComponent /></Suspense>
              : <PuzzleLoader />
            }
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          All progress saved locally in your browser · Nothing sent to any server
        </p>
      </div>
    </div>
  )
}
