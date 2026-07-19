import { useMemo, useState } from 'react'

// Fixed sample tree:
//         A
//       /   \
//      B     C
//     / \   / \
//    D   E F   G
const NODES = {
  A: { x: 200, y: 30 },
  B: { x: 100, y: 100 },
  C: { x: 300, y: 100 },
  D: { x: 50, y: 170 },
  E: { x: 150, y: 170 },
  F: { x: 250, y: 170 },
  G: { x: 350, y: 170 },
}
const EDGES = [
  ['A', 'B'], ['A', 'C'],
  ['B', 'D'], ['B', 'E'],
  ['C', 'F'], ['C', 'G'],
]

const ORDERS = {
  preorder:  { label: 'Pre-order (Root, Left, Right)', sequence: ['A', 'B', 'D', 'E', 'C', 'F', 'G'] },
  inorder:   { label: 'In-order (Left, Root, Right)', sequence: ['D', 'B', 'E', 'A', 'F', 'C', 'G'] },
  postorder: { label: 'Post-order (Left, Right, Root)', sequence: ['D', 'E', 'B', 'F', 'G', 'C', 'A'] },
  levelorder:{ label: 'Level-order (BFS by depth)', sequence: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
}

export default function TreeTraversalAnimator() {
  const [mode, setMode] = useState('preorder')
  const [step, setStep] = useState(-1)

  const sequence = ORDERS[mode].sequence
  const visited = useMemo(() => new Set(sequence.slice(0, step + 1)), [sequence, step])
  const current = step >= 0 && step < sequence.length ? sequence[step] : null

  const handleModeChange = (key) => {
    setMode(key)
    setStep(-1)
  }

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-1">Tree Traversal Animator</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Same 7-node tree, four different visiting orders. Step forward and watch the order each traversal actually takes.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(ORDERS).map(([key, o]) => (
          <button
            key={key}
            onClick={() => handleModeChange(key)}
            className={`px-2.5 py-1.5 rounded text-xs font-medium ${mode === key ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 400 210" className="w-full max-w-md bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a].x} y1={NODES[a].y}
            x2={NODES[b].x} y2={NODES[b].y}
            className="stroke-slate-300 dark:stroke-slate-600"
            strokeWidth="2"
          />
        ))}
        {Object.entries(NODES).map(([label, pos]) => {
          const isCurrent = label === current
          const isVisited = visited.has(label) && !isCurrent
          const order = isVisited || isCurrent ? sequence.indexOf(label) + 1 : null
          return (
            <g key={label}>
              <circle
                cx={pos.x} cy={pos.y} r="22"
                className={
                  isCurrent
                    ? 'fill-amber-400 stroke-amber-600'
                    : isVisited
                    ? 'fill-emerald-500 stroke-emerald-700'
                    : 'fill-slate-200 dark:fill-slate-700 stroke-slate-400 dark:stroke-slate-500'
                }
                strokeWidth="2"
              />
              <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize="14" fontWeight="700"
                className={isCurrent || isVisited ? 'fill-white' : 'fill-slate-600 dark:fill-slate-300'}>
                {label}
              </text>
              {order && (
                <text x={pos.x + 18} y={pos.y - 18} textAnchor="middle" fontSize="10" fontWeight="700" className="fill-slate-500 dark:fill-slate-400">
                  {order}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => setStep((s) => Math.min(s + 1, sequence.length - 1))}
          disabled={step >= sequence.length - 1}
          className="px-3 py-1.5 rounded text-sm font-medium bg-emerald-600 text-white disabled:opacity-40"
        >
          Next Step →
        </button>
        <button
          onClick={() => setStep(-1)}
          className="px-3 py-1.5 rounded text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
        >
          Reset
        </button>
      </div>

      <p className="text-sm mt-3">
        Visited so far: <span className="font-mono font-semibold">{sequence.slice(0, step + 1).join(' → ') || '(none yet)'}</span>
      </p>
    </div>
  )
}
