import { useMemo, useState } from 'react'

const TRACKS = {
  logic: ['Propositional Logic', 'Predicate Logic', 'Proof Techniques'],
  language: ['Set Theory', 'Functions', 'Relations'],
  domains: ['Combinatorics', 'Graph Theory', 'Number Theory'],
  computation: ['Recurrences', 'Automata', 'Complexity'],
}

const EDGES = [
  ['Propositional Logic', 'Predicate Logic'],
  ['Predicate Logic', 'Proof Techniques'],
  ['Proof Techniques', 'Set Theory'],
  ['Set Theory', 'Functions'],
  ['Functions', 'Relations'],
  ['Relations', 'Graph Theory'],
  ['Proof Techniques', 'Combinatorics'],
  ['Combinatorics', 'Discrete Probability'],
  ['Functions', 'Recurrences'],
  ['Recurrences', 'Complexity'],
  ['Graph Theory', 'Trees'],
  ['Graph Theory', 'Automata'],
  ['Automata', 'Formal Languages'],
  ['Formal Languages', 'Complexity'],
]

const NODES = [
  ['Propositional Logic', 80, 60],
  ['Predicate Logic', 230, 60],
  ['Proof Techniques', 390, 60],
  ['Set Theory', 80, 170],
  ['Functions', 230, 170],
  ['Relations', 390, 170],
  ['Combinatorics', 80, 280],
  ['Graph Theory', 230, 280],
  ['Number Theory', 390, 280],
  ['Discrete Probability', 80, 390],
  ['Recurrences', 230, 390],
  ['Trees', 390, 390],
  ['Automata', 230, 500],
  ['Formal Languages', 390, 500],
  ['Complexity', 540, 500],
]

export default function DiscreteDependencyMap() {
  const [focus, setFocus] = useState('all')

  const highlighted = useMemo(() => {
    if (focus === 'all') return new Set(NODES.map((n) => n[0]))
    const names = TRACKS[focus] ?? []
    return new Set(names)
  }, [focus])

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-2">Discrete Math Dependency Graph</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        Use this map as a curriculum graph, not a checklist. Pick a focus track to see how ideas depend on one another.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFocus('all')} className={`px-3 py-1 rounded text-sm ${focus === 'all' ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>All</button>
        <button onClick={() => setFocus('logic')} className={`px-3 py-1 rounded text-sm ${focus === 'logic' ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Logic Track</button>
        <button onClick={() => setFocus('language')} className={`px-3 py-1 rounded text-sm ${focus === 'language' ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Language Track</button>
        <button onClick={() => setFocus('domains')} className={`px-3 py-1 rounded text-sm ${focus === 'domains' ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Domain Track</button>
        <button onClick={() => setFocus('computation')} className={`px-3 py-1 rounded text-sm ${focus === 'computation' ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Computation Track</button>
      </div>

      <svg viewBox="0 0 640 560" className="w-full bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
        {EDGES.map(([a, b]) => {
          const from = NODES.find((n) => n[0] === a)
          const to = NODES.find((n) => n[0] === b)
          if (!from || !to) return null
          const strong = highlighted.has(a) && highlighted.has(b)
          return (
            <line
              key={`${a}-${b}`}
              x1={from[1]}
              y1={from[2]}
              x2={to[1]}
              y2={to[2]}
              stroke={strong ? '#6366f1' : '#94a3b8'}
              strokeOpacity={strong ? '1' : '0.35'}
              strokeWidth={strong ? '2.4' : '1.4'}
            />
          )
        })}

        {NODES.map(([name, x, y]) => {
          const active = highlighted.has(name)
          return (
            <g key={name}>
              <circle cx={x} cy={y} r="28" fill={active ? '#6366f1' : '#cbd5e1'} />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="8" fill={active ? '#ffffff' : '#334155'}>{name.replace(' ', '\n')}</text>
            </g>
          )
        })}
      </svg>

      <p className="text-xs text-slate-500 mt-3">
        A strong approach: revisit earlier nodes repeatedly while progressing so concepts become tools, not isolated facts.
      </p>
    </div>
  )
}
