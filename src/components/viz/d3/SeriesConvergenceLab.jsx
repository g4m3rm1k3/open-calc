import { useMemo, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 760
const H = 300

function f(v, d = 6) {
  if (!Number.isFinite(v)) return 'undefined'
  return v.toFixed(d)
}

export default function SeriesConvergenceLab() {
  const [mode, setMode] = useState('geometric')
  const [n, setN] = useState(12)
  const [r, setR] = useState(0.5)
  const [p, setP] = useState(2)

  const data = useMemo(() => {
    const terms = []
    for (let k = 1; k <= n; k += 1) {
      if (mode === 'geometric') terms.push(Math.pow(r, k - 1))
      else if (mode === 'harmonic') terms.push(1 / k)
      else if (mode === 'pseries') terms.push(1 / Math.pow(k, p))
      else if (mode === 'alternating') terms.push((k % 2 === 1 ? 1 : -1) / k)
    }

    let partial = 0
    const partials = terms.map((t) => {
      partial += t
      return partial
    })

    const pMin = Math.min(...partials, 0)
    const pMax = Math.max(...partials, 0)

    let target = null
    let errBound = null
    if (mode === 'geometric' && Math.abs(r) < 1) {
      target = 1 / (1 - r)
      errBound = Math.abs(target - partial)
    }
    if (mode === 'alternating') {
      errBound = 1 / (n + 1)
    }

    return { terms, partials, pMin, pMax, partial, target, errBound }
  }, [mode, n, p, r])

  const x = (i) => 50 + ((i - 1) / Math.max(1, n - 1)) * (W - 90)
  const y = (v) => {
    const denom = data.pMax - data.pMin || 1
    return 30 + ((data.pMax - v) / denom) * (H - 70)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3 px-2">
        {[
          ['geometric', 'geometric'],
          ['harmonic', 'harmonic'],
          ['pseries', 'p-series'],
          ['alternating', 'alternating harmonic'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              mode === id
                ? 'bg-brand-500 text-white border-brand-500'
                : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-brand-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <line x1={50} y1={y(0)} x2={W - 20} y2={y(0)} stroke="#94a3b8" />
        <line x1={50} y1={20} x2={50} y2={H - 30} stroke="#94a3b8" />

        {data.target !== null && (
          <line x1={50} y1={y(data.target)} x2={W - 20} y2={y(data.target)} stroke="#10b981" strokeDasharray="5,4" />
        )}

        {data.partials.map((v, i) => (
          <circle key={i} cx={x(i + 1)} cy={y(v)} r="3.5" fill="#2563eb" />
        ))}

        <path
          d={data.partials
            .map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i + 1)} ${y(v)}`)
            .join(' ')}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
        />

        <text x={56} y={18} fontSize="11" fill="#64748b">partial sums S_n</text>
        {data.target !== null && <text x={56} y={y(data.target) - 6} fontSize="11" fill="#059669">exact sum</text>}
      </svg>

      <div className="px-4 space-y-1">
        <SliderControl label="N terms" min={2} max={80} step={1} value={n} onChange={setN} />
        {mode === 'geometric' && (
          <SliderControl label="ratio r" min={-0.95} max={0.95} step={0.01} value={r} onChange={setR} />
        )}
        {mode === 'pseries' && (
          <SliderControl label="power p" min={0.3} max={4} step={0.1} value={p} onChange={setP} />
        )}
      </div>

      <div className="px-4 mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <div>Current partial sum S{n} = {f(data.partial, 8)}</div>
        {mode === 'geometric' && Math.abs(r) < 1 && (
          <div>
            Exact infinite sum = {f(data.target, 8)}; truncation error = {f(data.errBound, 8)}
          </div>
        )}
        {mode === 'alternating' && (
          <div>Alternating-series error bound: |S - S{n}| ≤ 1/(N+1) = {f(data.errBound, 8)}</div>
        )}
        {mode === 'harmonic' && <div>Harmonic partial sums keep growing without bound (very slowly).</div>}
        {mode === 'pseries' && (
          <div>
            p-series behavior: converges if p {'>'} 1, diverges if p {'≤'} 1.
          </div>
        )}
      </div>
    </div>
  )
}
