import { useState, useMemo } from 'react'
import SliderControl from '../../calculus/viz/SliderControl.jsx'

function gammaln(x) {
  const c = [76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5]
  let y = x, tmp = x + 5.5
  tmp -= (x + 0.5) * Math.log(tmp)
  let ser = 1.000000000190015
  for (let j = 0; j < 6; j++) { y++; ser += c[j] / y }
  return -tmp + Math.log(2.5066282746310005 * ser / x)
}

function binomPMF(k, n, p) {
  if (k < 0 || k > n || p < 0 || p > 1) return 0
  if (p === 0) return k === 0 ? 1 : 0
  if (p === 1) return k === n ? 1 : 0
  return Math.exp(gammaln(n + 1) - gammaln(k + 1) - gammaln(n - k + 1) + k * Math.log(p) + (n - k) * Math.log(1 - p))
}

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const normcdf = (x, mu, s) => 0.5 * (1 + erf((x - mu) / (s * Math.SQRT2)))
const normpdf = (x, mu, s) => Math.exp(-0.5 * ((x - mu) / s) ** 2) / (s * Math.sqrt(2 * Math.PI))

const W = 540, H = 210, PL = 44, PR = 16, PT = 14, PB = 36

export default function BinomialDistributionViz() {
  const [n, setN] = useState(10)
  const [p, setP] = useState(0.5)
  const [showNormal, setShowNormal] = useState(false)
  const [highlight, setHighlight] = useState(null)

  const { bars, normalPath, pMax, mu, sd } = useMemo(() => {
    const vals = Array.from({ length: n + 1 }, (_, k) => ({ k, prob: binomPMF(k, n, p) }))
    const pMax = Math.max(...vals.map(v => v.prob), 0.001)
    const innerW = W - PL - PR, innerH = H - PT - PB
    const barW = innerW / (n + 1)

    const bars = vals.map(({ k, prob }) => ({
      k, prob,
      x: PL + k * barW + barW * 0.1,
      y: PT + innerH - (prob / pMax) * innerH,
      w: barW * 0.8,
      h: (prob / pMax) * innerH,
    }))

    const mu = n * p
    const sd = Math.sqrt(n * p * (1 - p))

    let normalPath = ''
    if (showNormal && sd > 0) {
      const pts = Array.from({ length: 201 }, (_, i) => {
        const x = i * (n / 200)
        const pdfVal = normpdf(x, mu, sd)
        const px = PL + (x / n) * innerW
        const py = PT + innerH - (pdfVal / pMax) * innerH
        return `${px},${py}`
      })
      normalPath = `M${pts[0]}` + pts.slice(1).map(p => `L${p}`).join('')
    }

    return { bars, normalPath, pMax, mu, sd }
  }, [n, p, showNormal])

  const canApproximate = n * p >= 10 && n * (1 - p) >= 10
  const highlightProb = highlight !== null ? binomPMF(highlight, n, p) : null

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-100">
        Binomial Distribution — B(n, p)
      </h3>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible mb-3">
        <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#94a3b8" strokeWidth="1" />
        <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#94a3b8" strokeWidth="1" />

        {bars.map(({ k, prob, x, y, w, h }) => (
          <g key={k} style={{ cursor: 'pointer' }} onClick={() => setHighlight(highlight === k ? null : k)}>
            <rect x={x} y={y} width={w} height={h}
              fill={k === highlight ? '#f59e0b' : '#6366f1'}
              fillOpacity={k === highlight ? 0.9 : 0.65} rx="2" />
            {n <= 20 && (
              <text x={x + w / 2} y={H - PB + 13} textAnchor="middle" fontSize="9" fill="#94a3b8">{k}</text>
            )}
          </g>
        ))}

        {/* Normal approximation overlay */}
        {normalPath && (
          <path d={normalPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 3" />
        )}

        {/* Mean line */}
        {(() => {
          const innerW = W - PL - PR
          const x = PL + (mu / n) * innerW
          return <line x1={x} y1={PT} x2={x} y2={H - PB} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
        })()}

        <text x={(W) / 2} y={H} textAnchor="middle" fontSize="9" fill="#94a3b8">k (successes)</text>
      </svg>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <SliderControl label={`n = ${n} trials`} min={1} max={50} step={1} value={n} onChange={v => { setN(v); setHighlight(null) }} />
        <SliderControl label={`p = ${p.toFixed(2)}`} min={0.01} max={0.99} step={0.01} value={p} onChange={v => { setP(v); setHighlight(null) }} />
      </div>

      <div className="flex items-center gap-3 mb-3">
        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
          <input type="checkbox" checked={showNormal} onChange={e => setShowNormal(e.target.checked)}
            className="accent-amber-500" />
          Show normal approximation
          {!canApproximate && showNormal && (
            <span className="text-red-500 ml-1">(np &lt; 10 or n(1−p) &lt; 10 — poor fit)</span>
          )}
          {canApproximate && showNormal && (
            <span className="text-green-600 dark:text-green-400 ml-1">✓ good approximation</span>
          )}
        </label>
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">Mean</div>
          <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{mu.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">Std dev</div>
          <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{sd.toFixed(3)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">Variance</div>
          <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{(sd * sd).toFixed(3)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">{highlight !== null ? `P(X=${highlight})` : 'Click bar'}</div>
          <div className="font-mono font-semibold text-amber-600 dark:text-amber-400">
            {highlightProb !== null ? highlightProb.toFixed(4) : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}
