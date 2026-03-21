import { useMemo, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

function buildSequence(kind, n, a0, d, r) {
  const out = [a0]
  for (let i = 1; i < n; i += 1) {
    if (kind === 'arithmetic') out.push(out[i - 1] + d)
    else if (kind === 'geometric') out.push(out[i - 1] * r)
    else out.push((out[i - 1] ?? 0) + (out[i - 2] ?? 1))
  }
  return out
}

export default function RecurrenceExplorer() {
  const [kind, setKind] = useState('arithmetic')
  const [n, setN] = useState(12)
  const [a0, setA0] = useState(1)
  const [d, setD] = useState(2)
  const [r, setR] = useState(2)

  const seq = useMemo(() => buildSequence(kind, n, a0, d, r), [kind, n, a0, d, r])
  const max = Math.max(...seq.map((v) => Math.abs(v)), 1)

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-2">Recurrence Explorer</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Visualize sequence growth and compare recurrence families.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {['arithmetic', 'geometric', 'fibonacci-like'].map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`px-3 py-1 text-sm rounded ${kind === k ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SliderControl label={`Terms n = ${n}`} min={5} max={24} step={1} value={n} onChange={setN} />
        <SliderControl label={`a0 = ${a0.toFixed(1)}`} min={-5} max={10} step={0.5} value={a0} onChange={setA0} />
        {kind === 'arithmetic' && <SliderControl label={`difference d = ${d.toFixed(1)}`} min={-3} max={6} step={0.5} value={d} onChange={setD} />}
        {kind === 'geometric' && <SliderControl label={`ratio r = ${r.toFixed(2)}`} min={-2} max={3} step={0.1} value={r} onChange={setR} />}
      </div>

      <svg viewBox="0 0 640 260" className="w-full mt-5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
        {seq.map((v, i) => {
          const x = 30 + (i * 580) / Math.max(1, n - 1)
          const y = 220 - (v / max) * 160
          return <circle key={`p-${i}`} cx={x} cy={y} r="4" fill="#6366f1" />
        })}
        {seq.slice(1).map((v, i) => {
          const x1 = 30 + (i * 580) / Math.max(1, n - 1)
          const y1 = 220 - (seq[i] / max) * 160
          const x2 = 30 + ((i + 1) * 580) / Math.max(1, n - 1)
          const y2 = 220 - (v / max) * 160
          return <line key={`l-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth="2" />
        })}
        <line x1="20" y1="220" x2="620" y2="220" stroke="#94a3b8" strokeWidth="1" />
      </svg>

      <p className="text-xs text-slate-500 mt-3">Last term: {seq[seq.length - 1].toFixed(3)} | Sequence: {seq.slice(0, 8).map((v) => v.toFixed(1)).join(', ')}{seq.length > 8 ? ', ...' : ''}</p>
    </div>
  )
}
