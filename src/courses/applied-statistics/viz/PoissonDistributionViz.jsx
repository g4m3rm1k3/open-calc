import { useState, useMemo } from 'react'
import SliderControl from '../../calculus/viz/SliderControl.jsx'

function poissonPMF(k, lambda) {
  if (k < 0 || lambda <= 0) return 0
  let logP = k * Math.log(lambda) - lambda
  for (let i = 1; i <= k; i++) logP -= Math.log(i)
  return Math.exp(logP)
}

const W = 540, H = 200, PL = 44, PR = 16, PT = 14, PB = 36

export default function PoissonDistributionViz() {
  const [lambda, setLambda] = useState(3)
  const [highlight, setHighlight] = useState(null)

  const { bars, kMax, prob } = useMemo(() => {
    const kMax = Math.max(15, Math.ceil(lambda + 4 * Math.sqrt(lambda)) + 1)
    const vals = Array.from({ length: kMax + 1 }, (_, k) => ({ k, p: poissonPMF(k, lambda) }))
    const pMax = Math.max(...vals.map(v => v.p)) || 1
    const innerW = W - PL - PR, innerH = H - PT - PB
    const barW = innerW / (kMax + 1)
    const bars = vals.map(({ k, p }) => ({
      k, p,
      x: PL + k * barW + barW * 0.1,
      y: PT + innerH - (p / pMax) * innerH,
      w: barW * 0.8,
      h: (p / pMax) * innerH,
    }))
    const prob = highlight !== null ? poissonPMF(highlight, lambda) : null
    return { bars, kMax, prob }
  }, [lambda, highlight])

  const mu = lambda.toFixed(2)
  const variance = lambda.toFixed(2)

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-100">
        Poisson Distribution — Poisson(λ)
      </h3>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible mb-3">
        <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#94a3b8" strokeWidth="1" />
        <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#94a3b8" strokeWidth="1" />

        {bars.map(({ k, p, x, y, w, h }) => (
          <g key={k} style={{ cursor: 'pointer' }} onClick={() => setHighlight(highlight === k ? null : k)}>
            <rect
              x={x} y={y} width={w} height={h}
              fill={k === highlight ? '#f59e0b' : '#6366f1'}
              fillOpacity={k === highlight ? 0.9 : 0.65}
              rx="2"
            />
            <text x={x + w / 2} y={H - PB + 13} textAnchor="middle" fontSize="9" fill="#94a3b8">{k}</text>
          </g>
        ))}

        {/* Mean line at k = λ */}
        {(() => {
          const innerW = W - PL - PR
          const barW = innerW / (bars.length)
          const x = PL + lambda * barW + barW / 2
          return (
            <line x1={x} y1={PT} x2={x} y2={H - PB}
              stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 3" />
          )
        })()}

        {/* Y-axis label */}
        <text x={PL - 6} y={PT + (H - PT - PB) / 2} textAnchor="middle" fontSize="9" fill="#94a3b8"
          transform={`rotate(-90, ${PL - 6}, ${PT + (H - PT - PB) / 2})`}>P(X=k)</text>
        <text x={(W - PL - PR) / 2 + PL} y={H} textAnchor="middle" fontSize="9" fill="#94a3b8">k (count)</text>
      </svg>

      <div className="mb-3">
        <SliderControl label="λ (rate)" min={0.5} max={15} step={0.5} value={lambda} onChange={v => { setLambda(v); setHighlight(null) }} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">Mean E[X]</div>
          <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{mu}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">Variance</div>
          <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{variance}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">{highlight !== null ? `P(X = ${highlight})` : 'Click a bar'}</div>
          <div className="font-mono font-semibold text-amber-600 dark:text-amber-400">
            {prob !== null ? prob.toFixed(4) : '—'}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        Key property: mean = variance = λ. Click any bar to read its exact probability.
      </p>
    </div>
  )
}
