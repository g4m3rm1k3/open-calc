import { useState, useMemo, useCallback } from 'react'

const W = 540, H = 260, PL = 48, PR = 20, PT = 14, PB = 36

function linreg(pts) {
  const n = pts.length
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 }
  const mx = pts.reduce((s, p) => s + p.x, 0) / n
  const my = pts.reduce((s, p) => s + p.y, 0) / n
  let sxy = 0, sxx = 0, syy = 0
  for (const p of pts) {
    sxy += (p.x - mx) * (p.y - my)
    sxx += (p.x - mx) ** 2
    syy += (p.y - my) ** 2
  }
  if (sxx === 0) return { slope: 0, intercept: my, r2: 0 }
  const slope = sxy / sxx
  const intercept = my - slope * mx
  const r2 = syy > 0 ? (sxy ** 2) / (sxx * syy) : 1
  return { slope, intercept, r2 }
}

const PRESETS = {
  strong: { label: 'Strong +', noise: 0.15, slopeTrue: 1.2 },
  moderate: { label: 'Moderate', noise: 0.45, slopeTrue: 0.9 },
  weak: { label: 'Weak', noise: 0.85, slopeTrue: 0.6 },
  none: { label: 'No rel.', noise: 1.0, slopeTrue: 0 },
  negative: { label: 'Strong −', noise: 0.15, slopeTrue: -1.2 },
}

function generatePoints(preset, n = 30) {
  const { noise, slopeTrue } = PRESETS[preset]
  return Array.from({ length: n }, () => {
    const x = Math.random() * 8 + 1
    const y = slopeTrue * x + 5 + (Math.random() - 0.5) * 2 * noise * 6
    return { x, y }
  })
}

export default function RegressionScatterViz() {
  const [preset, setPreset] = useState('strong')
  const [showResiduals, setShowResiduals] = useState(false)
  const [pts, setPts] = useState(() => generatePoints('strong'))

  const regenerate = useCallback(() => setPts(generatePoints(preset)), [preset])

  const { slope, intercept, r2, plotData, xMin, xMax, yMin, yMax } = useMemo(() => {
    const { slope, intercept, r2 } = linreg(pts)
    const xs = pts.map(p => p.x)
    const ys = pts.map(p => p.y)
    const xMin = Math.min(...xs) - 0.5, xMax = Math.max(...xs) + 0.5
    const yMin = Math.min(...ys) - 0.5, yMax = Math.max(...ys) + 0.5
    return { slope, intercept, r2, plotData: { xs, ys }, xMin, xMax, yMin, yMax }
  }, [pts])

  const innerW = W - PL - PR, innerH = H - PT - PB
  const xScale = x => PL + ((x - xMin) / (xMax - xMin)) * innerW
  const yScale = y => PT + innerH - ((y - yMin) / (yMax - yMin)) * innerH

  const lineX1 = xMin, lineX2 = xMax
  const lineY1 = slope * lineX1 + intercept
  const lineY2 = slope * lineX2 + intercept

  // X-axis ticks
  const xTicks = Array.from({ length: 5 }, (_, i) => +(xMin + (i / 4) * (xMax - xMin)).toFixed(1))
  const yTicks = Array.from({ length: 5 }, (_, i) => +(yMin + (i / 4) * (yMax - yMin)).toFixed(1))

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-100">
        Simple Linear Regression — Least Squares Fit
      </h3>

      <div className="flex gap-2 mb-3 flex-wrap">
        {Object.entries(PRESETS).map(([key, { label }]) => (
          <button key={key}
            onClick={() => { setPreset(key); setPts(generatePoints(key)) }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              preset === key
                ? 'bg-indigo-50 dark:bg-indigo-900/300 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
            {label}
          </button>
        ))}
        <button onClick={regenerate}
          className="px-3 py-1 rounded-full text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
          Resample
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible mb-3">
        <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#94a3b8" strokeWidth="1" />
        <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="#94a3b8" strokeWidth="1" />

        {/* Residual lines */}
        {showResiduals && pts.map((p, i) => {
          const fitted = slope * p.x + intercept
          return (
            <line key={i}
              x1={xScale(p.x)} y1={yScale(p.y)}
              x2={xScale(p.x)} y2={yScale(fitted)}
              stroke="#ef4444" strokeWidth="1" strokeOpacity="0.6" />
          )
        })}

        {/* Scatter points */}
        {pts.map((p, i) => (
          <circle key={i} cx={xScale(p.x)} cy={yScale(p.y)} r="4"
            fill="#6366f1" fillOpacity="0.7" stroke="white" strokeWidth="0.5" />
        ))}

        {/* Regression line */}
        <line
          x1={xScale(lineX1)} y1={yScale(lineY1)}
          x2={xScale(lineX2)} y2={yScale(lineY2)}
          stroke="#f59e0b" strokeWidth="2.5" />

        {/* x-axis ticks */}
        {xTicks.map(v => {
          const x = xScale(v)
          return (
            <g key={v}>
              <line x1={x} y1={H - PB} x2={x} y2={H - PB + 4} stroke="#94a3b8" strokeWidth="1" />
              <text x={x} y={H - PB + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">{v.toFixed(1)}</text>
            </g>
          )
        })}

        {/* y-axis ticks */}
        {yTicks.map(v => {
          const y = yScale(v)
          return (
            <g key={v}>
              <line x1={PL - 4} y1={y} x2={PL} y2={y} stroke="#94a3b8" strokeWidth="1" />
              <text x={PL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8">{v.toFixed(1)}</text>
            </g>
          )
        })}

        <text x={W / 2} y={H} textAnchor="middle" fontSize="9" fill="#94a3b8">x</text>
        <text x={10} y={PT + innerH / 2} textAnchor="middle" fontSize="9" fill="#94a3b8"
          transform={`rotate(-90, 10, ${PT + innerH / 2})`}>y</text>

        {/* Legend */}
        <circle cx={W - PR - 85} cy={PT + 8} r="4" fill="#6366f1" fillOpacity="0.7" />
        <text x={W - PR - 78} y={PT + 12} fontSize="8" fill="#64748b">observed</text>
        <line x1={W - PR - 85} y1={PT + 22} x2={W - PR - 73} y2={PT + 22} stroke="#f59e0b" strokeWidth="2" />
        <text x={W - PR - 68} y={PT + 26} fontSize="8" fill="#64748b">ŷ = b₀ + b₁x</text>
      </svg>

      <div className="flex items-center gap-3 mb-3 text-xs">
        <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={showResiduals} onChange={e => setShowResiduals(e.target.checked)} className="accent-red-500" />
          Show residuals (y − ŷ)
        </label>
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">Intercept b₀</div>
          <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{intercept.toFixed(3)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">Slope b₁</div>
          <div className="font-mono font-semibold text-amber-600 dark:text-amber-400">{slope.toFixed(3)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">R²</div>
          <div className={`font-mono font-semibold ${r2 > 0.7 ? 'text-green-600 dark:text-green-400' : r2 > 0.3 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
            {r2.toFixed(4)}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">Pearson r</div>
          <div className="font-mono font-semibold text-slate-600 dark:text-slate-400">{(slope >= 0 ? 1 : -1) * Math.sqrt(r2).toFixed(4)}</div>
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        Least squares minimizes the sum of squared residuals (red lines). R² = fraction of variance in y explained by x.
      </p>
    </div>
  )
}
