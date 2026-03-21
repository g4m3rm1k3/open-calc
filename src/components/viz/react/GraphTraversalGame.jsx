import { useMemo, useState } from 'react'

const NODES = [
  { id: 'A', x: 70, y: 70 },
  { id: 'B', x: 180, y: 50 },
  { id: 'C', x: 300, y: 75 },
  { id: 'D', x: 90, y: 170 },
  { id: 'E', x: 220, y: 170 },
  { id: 'F', x: 330, y: 175 },
  { id: 'G', x: 150, y: 265 },
  { id: 'H', x: 280, y: 275 },
]

const EDGES = [
  ['A', 'B'],
  ['A', 'D'],
  ['B', 'C'],
  ['B', 'E'],
  ['C', 'F'],
  ['D', 'E'],
  ['D', 'G'],
  ['E', 'F'],
  ['E', 'G'],
  ['E', 'H'],
  ['F', 'H'],
  ['G', 'H'],
]

function buildAdjacency() {
  const adj = {}
  for (const node of NODES) adj[node.id] = []
  for (const [u, v] of EDGES) {
    adj[u].push(v)
    adj[v].push(u)
  }
  for (const key of Object.keys(adj)) {
    adj[key].sort()
  }
  return adj
}

function computeOrder(start, mode, adj) {
  if (mode === 'BFS') {
    const visited = new Set([start])
    const queue = [start]
    const order = []
    while (queue.length) {
      const cur = queue.shift()
      order.push(cur)
      for (const nxt of adj[cur]) {
        if (!visited.has(nxt)) {
          visited.add(nxt)
          queue.push(nxt)
        }
      }
    }
    return order
  }

  const visited = new Set()
  const order = []
  function dfs(u) {
    visited.add(u)
    order.push(u)
    for (const v of adj[u]) {
      if (!visited.has(v)) dfs(v)
    }
  }
  dfs(start)
  return order
}

export default function GraphTraversalGame() {
  const [mode, setMode] = useState('BFS')
  const [start, setStart] = useState('A')
  const [step, setStep] = useState(0)

  const adjacency = useMemo(() => buildAdjacency(), [])
  const expectedOrder = useMemo(() => computeOrder(start, mode, adjacency), [start, mode, adjacency])
  const visited = expectedOrder.slice(0, step)

  const distances = useMemo(() => {
    const dist = {}
    for (const n of NODES) dist[n.id] = '-'
    if (mode !== 'BFS') return dist

    const queue = [start]
    dist[start] = 0
    while (queue.length) {
      const cur = queue.shift()
      for (const nxt of adjacency[cur]) {
        if (dist[nxt] === '-') {
          dist[nxt] = dist[cur] + 1
          queue.push(nxt)
        }
      }
    }
    return dist
  }, [mode, start, adjacency])

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      <h3 className="text-lg font-semibold mb-2">Graph Traversal Game</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Choose BFS or DFS and step through the exploration order. BFS expands in waves; DFS commits deeply.
      </p>

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <label className="text-sm font-medium">
          Start node
          <select
            value={start}
            onChange={(e) => {
              setStart(e.target.value)
              setStep(0)
            }}
            className="ml-2 p-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
          >
            {NODES.map((n) => (
              <option key={n.id} value={n.id}>{n.id}</option>
            ))}
          </select>
        </label>

        <div className="inline-flex rounded border border-slate-300 dark:border-slate-600 overflow-hidden">
          {['BFS', 'DFS'].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m)
                setStep(0)
              }}
              className={`px-3 py-1 text-sm font-semibold ${mode === m ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
            >
              {m}
            </button>
          ))}
        </div>

        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="px-3 py-1 rounded text-sm bg-slate-200 dark:bg-slate-800"
        >
          Step Back
        </button>
        <button
          onClick={() => setStep((s) => Math.min(expectedOrder.length, s + 1))}
          className="px-3 py-1 rounded text-sm bg-emerald-500 text-white"
        >
          Step Forward
        </button>
        <button
          onClick={() => setStep(expectedOrder.length)}
          className="px-3 py-1 rounded text-sm bg-indigo-500 text-white"
        >
          Run All
        </button>
      </div>

      <div className="mb-4 text-sm">
        <div><span className="font-semibold">Traversal order:</span> {expectedOrder.join(' -> ')}</div>
        <div><span className="font-semibold">Visited so far:</span> {visited.length ? visited.join(' -> ') : '(none yet)'}</div>
      </div>

      <svg viewBox="0 0 400 320" className="w-full rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 mb-4">
        {EDGES.map(([u, v]) => {
          const nu = NODES.find((n) => n.id === u)
          const nv = NODES.find((n) => n.id === v)
          return (
            <line
              key={`${u}-${v}`}
              x1={nu.x}
              y1={nu.y}
              x2={nv.x}
              y2={nv.y}
              stroke="#64748b"
              strokeWidth="2"
              opacity="0.7"
            />
          )
        })}

        {NODES.map((n) => {
          const idx = visited.indexOf(n.id)
          const isVisited = idx !== -1
          const isCurrent = idx === visited.length - 1
          return (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={22}
                fill={isCurrent ? '#f97316' : isVisited ? '#22c55e' : '#cbd5e1'}
                stroke="#0f172a"
                strokeWidth="1.5"
                style={{ transition: 'fill 250ms ease' }}
              />
              <text x={n.x} y={n.y + 5} textAnchor="middle" className="fill-slate-900 text-sm font-bold">{n.id}</text>
              {mode === 'BFS' && (
                <text x={n.x} y={n.y + 36} textAnchor="middle" className="fill-slate-600 text-[10px] font-semibold">
                  d={distances[n.id]}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Game rule: in this lab, neighbors are explored alphabetically, so traversal order is deterministic.
      </p>
    </div>
  )
}
