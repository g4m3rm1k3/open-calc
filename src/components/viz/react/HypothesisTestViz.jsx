import { useState, useMemo } from 'react'
import SliderControl from '../SliderControl.jsx'

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const normpdf = x => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
const normcdf = x => 0.5 * (1 + erf(x / Math.SQRT2))

const W = 540, H = 200, PL = 44, PR = 16, PT = 14, PB = 36

export default function HypothesisTestViz() {
  const [zObs, setZObs] = useState(1.96)
  const [twoTailed, setTwoTailed] = useState(true)
  const [alpha, setAlpha] = useState(0.05)

  const { curvePath, rejectPaths, critPaths, pValue, zCrit, reject } = useMemo(() => {
    const innerW = W - PL - PR, innerH = H - PT - PB
    const xMin = -4, xMax = 4
    const xScale = x => PL + ((x - xMin) / (xMax - xMin)) * innerW
    const peak = normpdf(0)
    const yScale = y => PT + innerH - (y / (peak * 1.15)) * innerH
    const baseline = PT + innerH

    const N = 300
    const xs = Array.from({ length: N + 1 }, (_, i) => xMin + i * (xMax - xMin) / N)
    const pts = xs.map(x => [xScale(x), yScale(normpdf(x))])
    const curvePath = `M${pts[0][0]},${baseline}` + pts.map(([x, y]) => `L${x},${y}`).join('') + `L${pts[N][0]},${baseline}Z`

    const buildShade = (from, to) => {
      const step = (to - from) / 80
      const shadePts = []
      for (let i = 0; i <= 80; i++) {
        const x = from + i * step
        shadePts.push([xScale(Math.max(xMin, Math.min(xMax, x))), yScale(normpdf(x))])
      }
      return `M${xScale(Math.max(xMin, from))},${baseline}` +
        shadePts.map(([x, y]) => `L${x},${y}`).join('') +
        `L${xScale(Math.min(xMax, to))},${baseline}Z`
    }

    // p-value shading (blue = observed region)
    const rejectPaths = []
    if (twoTailed) {
      const z = Math.abs(zObs)
      rejectPaths.push(buildShade(z, xMax))
      rejectPaths.push(buildShade(xMin, -z))
    } else {
      rejectPaths.push(buildShade(zObs, xMax))
    }

    // Critical region shading
    const zCrit = twoTailed
      ? (() => { let lo = 0, hi = 4; for (let i = 0; i < 60; i++) { const m = (lo+hi)/2; if (normcdf(m) < 1-alpha/2) lo=m; else hi=m; } return (lo+hi)/2 })()
      : (() => { let lo = 0, hi = 4; for (let i = 0; i < 60; i++) { const m = (lo+hi)/2; if (normcdf(m) < 1-alpha) lo=m; else hi=m; } return (lo+hi)/2 })()

    // Critical value lines
    const critLines = []
    critLines.push({ x: xScale(zCrit), label: `z* = ${zCrit.toFixed(2)}`, anchor: 'start' })
    if (twoTailed) critLines.push({ x: xScale(-zCrit), label: `−${zCrit.toFixed(2)}`, anchor: 'end' })

    const pValue = twoTailed ? 2 * (1 - normcdf(Math.abs(zObs))) : 1 - normcdf(zObs)
    const reject = pValue < alpha

    return { curvePath, rejectPaths, critPaths: critLines, pValue, zCrit, reject }
  }, [zObs, twoTailed, alpha])

  const zAbsCapped = Math.min(Math.abs(zObs), 3.99)

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-100">
        Hypothesis Test — Null Distribution
      </h3>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible mb-3">
        <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#94a3b8" strokeWidth="1" />

        {/* Null distribution fill */}
        <path d={curvePath} fill="#6366f1" fillOpacity="0.10" />

        {/* p-value region (blue) */}
        {rejectPaths.map((d, i) => (
          <path key={i} d={d} fill="#3b82f6" fillOpacity="0.45" />
        ))}

        {/* Curve outline */}
        <path d={curvePath} fill="none" stroke="#6366f1" strokeWidth="2" />

        {/* Critical value lines */}
        {critPaths.map(({ x, label, anchor }, i) => (
          <g key={i}>
            <line x1={x} y1={PT} x2={x} y2={H - PB} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x={x + (anchor === 'start' ? 4 : -4)} y={PT + 12} fontSize="9" fill="#ef4444" textAnchor={anchor}>{label}</text>
          </g>
        ))}

        {/* Observed z line */}
        {(() => {
          const innerW = W - PL - PR
          const xMin = -4, xMax = 4
          const x = PL + ((zObs - xMin) / (xMax - xMin)) * innerW
          return (
            <>
              <line x1={x} y1={PT} x2={x} y2={H - PB} stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 3" />
              <text x={x + 4} y={PT + 24} fontSize="9" fill="#f59e0b">z = {zObs.toFixed(2)}</text>
            </>
          )
        })()}

        {/* x-axis ticks */}
        {[-3,-2,-1,0,1,2,3].map(k => {
          const innerW = W - PL - PR
          const x = PL + ((k - (-4)) / 8) * innerW
          return (
            <g key={k}>
              <line x1={x} y1={H - PB} x2={x} y2={H - PB + 4} stroke="#94a3b8" strokeWidth="1" />
              <text x={x} y={H - PB + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">{k}</text>
            </g>
          )
        })}
        <text x={W / 2} y={H} textAnchor="middle" fontSize="9" fill="#94a3b8">z-score</text>

        {/* Legend */}
        <rect x={W - PR - 100} y={PT + 2} width={10} height={8} fill="#3b82f6" fillOpacity="0.5" />
        <text x={W - PR - 87} y={PT + 10} fontSize="8" fill="#64748b">p-value region</text>
        <line x1={W - PR - 100} y1={PT + 20} x2={W - PR - 90} y2={PT + 20} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x={W - PR - 87} y={PT + 24} fontSize="8" fill="#64748b">critical value</text>
      </svg>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <SliderControl label={`z-observed = ${zObs.toFixed(2)}`} min={-3.99} max={3.99} step={0.01} value={zObs} onChange={setZObs} />
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-600 dark:text-slate-400 min-w-[24px]">α</span>
          <select value={alpha} onChange={e => setAlpha(Number(e.target.value))}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1">
            {[0.10, 0.05, 0.025, 0.01].map(a => <option key={a} value={a}>α = {a}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3 text-xs">
        <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={twoTailed} onChange={e => setTwoTailed(e.target.checked)} className="accent-red-500" />
          Two-tailed (H₁: μ ≠ μ₀)
        </label>
        {!twoTailed && <span className="text-slate-500">(right-tailed: H₁: μ &gt; μ₀)</span>}
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs mb-2">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">z-stat</div>
          <div className="font-mono font-semibold text-amber-600 dark:text-amber-400">{zObs.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">p-value</div>
          <div className={`font-mono font-semibold ${pValue < alpha ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">z-critical</div>
          <div className="font-mono font-semibold text-red-600 dark:text-red-400">±{zCrit.toFixed(3)}</div>
        </div>
        <div className={`rounded-lg p-2 text-center ${reject ? 'bg-red-50 dark:bg-red-950' : 'bg-green-50 dark:bg-green-950'}`}>
          <div className="text-slate-500 mb-1">Decision</div>
          <div className={`font-semibold text-xs ${reject ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {reject ? 'Reject H₀' : 'Fail to reject H₀'}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Blue region = p-value (probability of data this extreme under H₀). Drag z to see how the decision changes.
      </p>
    </div>
  )
}
