import { useState } from 'react'

const W = 540, H = 200, PL = 44, PR = 16, PT = 14, PB = 36

const EXAMPLES = {
  die: {
    label: 'Fair Die',
    values: [1, 2, 3, 4, 5, 6],
    probs: [1/6, 1/6, 1/6, 1/6, 1/6, 1/6],
    color: '#6366f1',
    desc: 'Each outcome equally likely',
  },
  loaded: {
    label: 'Loaded Die',
    values: [1, 2, 3, 4, 5, 6],
    probs: [0.05, 0.10, 0.10, 0.10, 0.15, 0.50],
    color: '#f59e0b',
    desc: '6 appears 50% of the time',
  },
  coin3: {
    label: '3 Coin Flips',
    values: [0, 1, 2, 3],
    probs: [0.125, 0.375, 0.375, 0.125],
    color: '#10b981',
    desc: 'Number of heads in 3 fair flips',
  },
  custom: {
    label: 'Custom',
    values: [1, 2, 3, 4],
    probs: [0.10, 0.30, 0.40, 0.20],
    color: '#ec4899',
    desc: 'Click bars to highlight',
  },
}

function stats(values, probs) {
  const mu = values.reduce((s, v, i) => s + v * probs[i], 0)
  const variance = values.reduce((s, v, i) => s + (v - mu) ** 2 * probs[i], 0)
  return { mu, variance, sd: Math.sqrt(variance) }
}

export default function DiscretePMFViz() {
  const [exKey, setExKey] = useState('die')
  const [highlight, setHighlight] = useState(null)

  const ex = EXAMPLES[exKey]
  const pMax = Math.max(...ex.probs, 0.001)
  const innerW = W - PL - PR, innerH = H - PT - PB
  const barW = innerW / ex.values.length
  const { mu, variance, sd } = stats(ex.values, ex.probs)

  const bars = ex.values.map((v, i) => ({
    v, p: ex.probs[i],
    x: PL + i * barW + barW * 0.12,
    y: PT + innerH - (ex.probs[i] / pMax) * innerH,
    w: barW * 0.76,
    h: (ex.probs[i] / pMax) * innerH,
  }))

  // Mean line position
  const muX = (() => {
    const vMin = ex.values[0], vMax = ex.values[ex.values.length - 1]
    return PL + ((mu - vMin) / (vMax - vMin + 1)) * innerW + barW / 2
  })()

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-100">
        Discrete Probability Mass Function — P(X = k)
      </h3>

      <div className="flex gap-2 mb-3 flex-wrap">
        {Object.entries(EXAMPLES).map(([key, { label, color }]) => (
          <button key={key}
            onClick={() => { setExKey(key); setHighlight(null) }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              exKey === key ? 'text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
            style={exKey === key ? { backgroundColor: color } : {}}>
            {label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible mb-3">
        <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#94a3b8" strokeWidth="1" />
        <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#94a3b8" strokeWidth="1" />

        {bars.map(({ v, p, x, y, w, h }, i) => (
          <g key={i} style={{ cursor: 'pointer' }} onClick={() => setHighlight(highlight === i ? null : i)}>
            <rect x={x} y={y} width={w} height={h}
              fill={i === highlight ? '#f59e0b' : ex.color}
              fillOpacity={i === highlight ? 0.95 : 0.70} rx="2" />
            <text x={x + w / 2} y={H - PB + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">{v}</text>
            {/* Probability label on bar if tall enough */}
            {h > 18 && (
              <text x={x + w / 2} y={y + 11} textAnchor="middle" fontSize="8" fill="white" fontWeight="600">
                {p.toFixed(2)}
              </text>
            )}
          </g>
        ))}

        {/* Mean line */}
        <line x1={muX} y1={PT} x2={muX} y2={H - PB} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x={muX + 4} y={PT + 12} fontSize="9" fill="#f59e0b">μ = {mu.toFixed(2)}</text>

        {/* Y-axis label */}
        <text x={PL - 6} y={PT + innerH / 2} textAnchor="middle" fontSize="9" fill="#94a3b8"
          transform={`rotate(-90, ${PL - 6}, ${PT + innerH / 2})`}>P(X=k)</text>
        <text x={W / 2} y={H} textAnchor="middle" fontSize="9" fill="#94a3b8">k</text>
      </svg>

      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">E[X] = μ</div>
          <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{mu.toFixed(3)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">Var(X)</div>
          <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{variance.toFixed(3)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">SD(X)</div>
          <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{sd.toFixed(3)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">{highlight !== null ? `P(X=${ex.values[highlight]})` : 'Click bar'}</div>
          <div className="font-mono font-semibold text-amber-600 dark:text-amber-400">
            {highlight !== null ? ex.probs[highlight].toFixed(4) : '—'}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        {ex.desc}. All probabilities sum to 1. E[X] = Σ k·P(X=k).
      </p>
    </div>
  )
}
