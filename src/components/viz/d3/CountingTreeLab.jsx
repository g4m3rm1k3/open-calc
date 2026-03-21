import { useMemo, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

function buildNodes(branch, depth) {
  const nodes = [{ id: 'root', level: 0, x: 0.5, parent: null }]
  let frontier = ['root']
  let idCounter = 0

  for (let lv = 1; lv <= depth; lv += 1) {
    const next = []
    const width = Math.pow(branch, lv)
    for (let i = 0; i < width; i += 1) {
      const parent = frontier[Math.floor(i / branch)]
      const id = `n-${idCounter}`
      idCounter += 1
      nodes.push({ id, level: lv, x: (i + 0.5) / width, parent })
      next.push(id)
    }
    frontier = next
  }
  return nodes
}

export default function CountingTreeLab() {
  const [branch, setBranch] = useState(2)
  const [depth, setDepth] = useState(4)

  const nodes = useMemo(() => buildNodes(branch, depth), [branch, depth])
  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes])
  const leafCount = Math.pow(branch, depth)
  const totalCount = nodes.length

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-2">Counting Tree Lab</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Each level adds a choice. Leaves match multiplication principle: branch^depth.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SliderControl label={`Branching factor = ${branch}`} min={2} max={5} step={1} value={branch} onChange={setBranch} />
        <SliderControl label={`Depth = ${depth}`} min={1} max={6} step={1} value={depth} onChange={setDepth} />
      </div>

      <svg viewBox="0 0 800 320" className="w-full mt-4 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
        {nodes.map((n) => {
          if (!n.parent) return null
          const p = byId[n.parent]
          return (
            <line
              key={`e-${n.id}`}
              x1={p.x * 780 + 10}
              y1={p.level * 48 + 24}
              x2={n.x * 780 + 10}
              y2={n.level * 48 + 24}
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
          )
        })}
        {nodes.map((n) => (
          <circle
            key={n.id}
            cx={n.x * 780 + 10}
            cy={n.level * 48 + 24}
            r={n.level === depth ? 4 : 3}
            fill={n.level === depth ? '#f59e0b' : '#6366f1'}
          />
        ))}
      </svg>

      <p className="text-xs text-slate-500 mt-3">
        Leaves: {leafCount} | Total nodes: {totalCount} | Formula check: {branch}^{depth} = {leafCount}
      </p>
    </div>
  )
}
