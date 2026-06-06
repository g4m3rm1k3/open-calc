import { useState, useMemo } from 'react'
import SliderControl from '../SliderControl.jsx'

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const normcdf = (x, mu, s) => 0.5 * (1 + erf((x - mu) / (s * Math.SQRT2)))
const normpdf = (x, mu, s) => Math.exp(-0.5 * ((x - mu) / s) ** 2) / (s * Math.sqrt(2 * Math.PI))

const W = 540, H = 200, PL = 44, PR = 16, PT = 14, PB = 36
const BANDS = [
  { k: 1, color: 'rgba(99,102,241,0.45)', label: '68.27%' },
  { k: 2, color: 'rgba(99,102,241,0.25)', label: '95.45%' },
  { k: 3, color: 'rgba(99,102,241,0.12)', label: '99.73%' },
]

export default function NormalDistributionViz() {
  const [mu, setMu] = useState(0)
  const [sigma, setSigma] = useState(1)
  const [activeK, setActiveK] = useState(1)

  const { curvePath, shadePath, yMax, xs, xScale, yScale } = useMemo(() => {
    const xMin = mu - 4 * sigma, xMax = mu + 4 * sigma
    const innerW = W - PL - PR, innerH = H - PT - PB
    const peak = normpdf(mu, mu, sigma)
    const xScale = x => PL + ((x - xMin) / (xMax - xMin)) * innerW
    const yScale = y => PT + innerH - (y / (peak * 1.15)) * innerH

    const N = 300
    const xs = Array.from({ length: N + 1 }, (_, i) => xMin + (i * (xMax - xMin)) / N)
    const pts = xs.map(x => [xScale(x), yScale(normpdf(x, mu, sigma))])
    const baseline = PT + innerH

    const curvePath =
      `M${pts[0][0]},${baseline}` +
      pts.map(([x, y]) => `L${x},${y}`).join('') +
      `L${pts[pts.length - 1][0]},${baseline}Z`

    const lo = mu - activeK * sigma, hi = mu + activeK * sigma
    const shadePts = pts.filter((_, i) => xs[i] >= lo && xs[i] <= hi)
    const shadePath = shadePts.length > 1
      ? `M${xScale(lo)},${baseline}` +
        shadePts.map(([x, y]) => `L${x},${y}`).join('') +
        `L${xScale(hi)},${baseline}Z`
      : ''

    return { curvePath, shadePath, yMax: peak, xs, xScale, yScale }
  }, [mu, sigma, activeK])

  const prob = activeK === 1 ? 68.27 : activeK === 2 ? 95.45 : 99.73

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-100">
        Normal Distribution — N(μ, σ²)
      </h3>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible mb-3">
        {/* Baseline */}
        <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#94a3b8" strokeWidth="1" />
        {/* Fill bands (draw outermost first) */}
        {[3, 2, 1].map(k => {
          const lo = mu - k * sigma, hi = mu + k * sigma
          const innerW = W - PL - PR, innerH = H - PT - PB
          const xMin = mu - 4 * sigma, xMax = mu + 4 * sigma
          const peak = normpdf(mu, mu, sigma)
          const xs2 = Array.from({ length: 201 }, (_, i) => xMin + (i * (xMax - xMin)) / 200)
          const xScale2 = x => PL + ((x - xMin) / (xMax - xMin)) * innerW
          const yScale2 = y => PT + innerH - (y / (peak * 1.15)) * innerH
          const pts2 = xs2.filter(x => x >= lo && x <= hi).map(x => [xScale2(x), yScale2(normpdf(x, mu, sigma))])
          if (!pts2.length) return null
          const d = `M${xScale2(lo)},${H - PB}` + pts2.map(([x, y]) => `L${x},${y}`).join('') + `L${xScale2(hi)},${H - PB}Z`
          return <path key={k} d={d} fill={BANDS[k - 1].color} />
        })}
        {/* Curve outline */}
        <path d={curvePath} fill="none" stroke="#6366f1" strokeWidth="2" />
        {/* Active shade highlight */}
        {shadePath && <path d={shadePath} fill="rgba(99,102,241,0.18)" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 2" />}
        {/* Sigma tick marks */}
        {[-3, -2, -1, 0, 1, 2, 3].map(k => {
          const innerW = W - PL - PR, xMin = mu - 4 * sigma, xMax = mu + 4 * sigma
          const x = PL + ((mu + k * sigma - xMin) / (xMax - xMin)) * innerW
          const lbl = k === 0 ? 'μ' : `${k > 0 ? '+' : ''}${k}σ`
          return (
            <g key={k}>
              <line x1={x} y1={H - PB} x2={x} y2={H - PB + 5} stroke="#94a3b8" strokeWidth="1" />
              <text x={x} y={H - PB + 15} textAnchor="middle" fontSize="9" fill="#94a3b8">{lbl}</text>
            </g>
          )
        })}
        {/* Mean line */}
        {(() => {
          const innerW = W - PL - PR, xMin = mu - 4 * sigma, xMax = mu + 4 * sigma
          const x = PL + ((mu - xMin) / (xMax - xMin)) * innerW
          return <line x1={x} y1={PT} x2={x} y2={H - PB} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
        })()}
      </svg>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <SliderControl label="μ (mean)" min={-3} max={3} step={0.1} value={mu} onChange={setMu} />
        <SliderControl label="σ (std dev)" min={0.3} max={3} step={0.1} value={sigma} onChange={setSigma} />
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        {BANDS.map(({ k, label }) => (
          <button
            key={k}
            onClick={() => setActiveK(k)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeK === k
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            ±{k}σ → {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">Mean (μ)</div>
          <div className="font-mono font-semibold text-amber-600 dark:text-amber-400">{mu.toFixed(1)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">Std dev (σ)</div>
          <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{sigma.toFixed(1)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">P(μ ± {activeK}σ)</div>
          <div className="font-mono font-semibold text-green-600 dark:text-green-400">{prob.toFixed(2)}%</div>
        </div>
      </div>
    </div>
  )
}
