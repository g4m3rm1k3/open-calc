import { useMemo, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const CURVES = {
  'O(1)': (n) => 1,
  'O(log n)': (n) => Math.log2(Math.max(2, n)),
  'O(n)': (n) => n,
  'O(n log n)': (n) => n * Math.log2(Math.max(2, n)),
  'O(n^2)': (n) => n * n,
  'O(2^n)': (n) => Math.pow(2, n),
}

export default function ComplexityLab() {
  const [n, setN] = useState(12)
  const [selected, setSelected] = useState('O(n log n)')

  const values = useMemo(() => {
    return Object.fromEntries(Object.entries(CURVES).map(([k, fn]) => [k, fn(n)]))
  }, [n])

  const maxY = Math.max(...Object.values(values))

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-2">Complexity Growth Lab</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Move n and compare asymptotic growth rates.</p>

      <SliderControl label={`Input size n = ${n}`} min={2} max={24} step={1} value={n} onChange={setN} />

      <div className="flex flex-wrap gap-2 mt-3 mb-4">
        {Object.keys(CURVES).map((k) => (
          <button
            key={k}
            onClick={() => setSelected(k)}
            className={`px-3 py-1 rounded text-sm ${selected === k ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            {k}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 640 260" className="w-full bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
        {Object.entries(values).map(([k, v], i) => {
          const x = 40 + i * 95
          const h = (v / maxY) * 180
          const y = 220 - h
          const active = k === selected
          return (
            <g key={k}>
              <rect x={x} y={y} width="60" height={h} fill={active ? '#6366f1' : '#94a3b8'} opacity={active ? '1' : '0.55'} />
              <text x={x + 30} y={242} textAnchor="middle" fontSize="10" fill="#334155">{k}</text>
            </g>
          )
        })}
      </svg>

      <p className="text-xs text-slate-500 mt-3">
        Selected {selected} value at n={n}: {values[selected].toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </p>
    </div>
  )
}
