import { useState, useMemo } from 'react'
import SliderControl from '../SliderControl.jsx'

function gammaln(x) {
  const c = [76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5]
  let y = x, tmp = x + 5.5
  tmp -= (x + 0.5) * Math.log(tmp)
  let ser = 1.000000000190015
  for (let j = 0; j < 6; j++) { y++; ser += c[j] / y }
  return -tmp + Math.log(2.5066282746310005 * ser / x)
}

function tpdf(t, df) {
  return Math.exp(
    gammaln((df + 1) / 2) - gammaln(df / 2) -
    0.5 * Math.log(df * Math.PI) -
    ((df + 1) / 2) * Math.log(1 + t * t / df)
  )
}

function betacf(x, a, b) {
  const qab = a + b, qap = a + 1, qam = a - 1
  let c = 1, d = 1 - qab * x / qap
  if (Math.abs(d) < 1e-300) d = 1e-300
  d = 1 / d; let h = d
  for (let m = 1; m <= 200; m++) {
    const m2 = 2 * m
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2))
    d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300
    c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300
    d = 1 / d; h *= d * c
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
    d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300
    c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300
    d = 1 / d; const del = d * c; h *= del
    if (Math.abs(del - 1) < 3e-7) break
  }
  return h
}

function betainc(x, a, b) {
  if (x <= 0) return 0; if (x >= 1) return 1
  const lbeta = gammaln(a) + gammaln(b) - gammaln(a + b)
  const bt = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lbeta)
  return x < (a + 1) / (a + b + 2) ? bt * betacf(x, a, b) / a : 1 - bt * betacf(1 - x, b, a) / b
}

function tcdf(t, df) {
  const x = df / (df + t * t)
  const ib = betainc(x, df / 2, 0.5)
  return t >= 0 ? 1 - ib / 2 : ib / 2
}

function normpdf(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
}

const W = 540, H = 200, PL = 44, PR = 16, PT = 14, PB = 36
const ALPHA_LEVELS = [0.05, 0.01, 0.001]

export default function TDistributionViz() {
  const [df, setDf] = useState(5)
  const [alpha, setAlpha] = useState(0.05)
  const [twoTailed, setTwoTailed] = useState(true)

  const { tPath, normalPath, tCrit, tailArea, critX } = useMemo(() => {
    const innerW = W - PL - PR, innerH = H - PT - PB
    const xMin = -5, xMax = 5
    const xScale = x => PL + ((x - xMin) / (xMax - xMin)) * innerW
    const peak = tpdf(0, df)
    const yScale = y => PT + innerH - (y / (peak * 1.15)) * innerH

    const N = 300
    const xs = Array.from({ length: N + 1 }, (_, i) => xMin + i * (xMax - xMin) / N)

    const tPts = xs.map(x => [xScale(x), yScale(tpdf(x, df))])
    const nPts = xs.map(x => [xScale(x), yScale(normpdf(x))])
    const baseline = PT + innerH

    const tPath = `M${tPts[0][0]},${baseline}` + tPts.map(([x, y]) => `L${x},${y}`).join('') + `L${tPts[N][0]},${baseline}Z`
    const normalPath = `M${nPts[0][0]},${nPts[0][1]}` + nPts.slice(1).map(([x, y]) => `L${x},${y}`).join('')

    // Find t critical value (two-tailed: alpha/2 in each tail)
    const targetP = twoTailed ? 1 - alpha / 2 : 1 - alpha
    let lo = 0, hi = 10, tCrit = 2
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2
      if (tcdf(mid, df) < targetP) lo = mid; else hi = mid
      tCrit = (lo + hi) / 2
    }

    const critX = xScale(tCrit)
    const tailArea = twoTailed ? alpha : alpha

    return { tPath, normalPath, tCrit, tailArea, critX }
  }, [df, alpha, twoTailed])

  // Shade tail regions
  const tailShade = useMemo(() => {
    const innerW = W - PL - PR, innerH = H - PT - PB
    const xMin = -5, xMax = 5
    const xScale = x => PL + ((x - xMin) / (xMax - xMin)) * innerW
    const peak = tpdf(0, df)
    const yScale = y => PT + innerH - (y / (peak * 1.15)) * innerH
    const baseline = PT + innerH

    const buildTail = (from, to) => {
      const pts = []
      for (let i = 0; i <= 50; i++) {
        const x = from + i * (to - from) / 50
        pts.push([xScale(x), yScale(tpdf(x, df))])
      }
      return `M${xScale(from)},${baseline}` + pts.map(([x, y]) => `L${x},${y}`).join('') + `L${xScale(to)},${baseline}Z`
    }

    const rightTail = buildTail(Math.min(tCrit, 4.9), 5)
    const leftTail = twoTailed ? buildTail(-5, -Math.min(tCrit, 4.9)) : ''
    return { rightTail, leftTail }
  }, [df, tCrit, twoTailed])

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-100">
        t-Distribution vs Normal
      </h3>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible mb-3">
        <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#94a3b8" strokeWidth="1" />

        {/* t-distribution fill */}
        <path d={tPath} fill="#6366f1" fillOpacity="0.12" />

        {/* Tail shading */}
        {tailShade.rightTail && <path d={tailShade.rightTail} fill="#ef4444" fillOpacity="0.4" />}
        {tailShade.leftTail && <path d={tailShade.leftTail} fill="#ef4444" fillOpacity="0.4" />}

        {/* t-distribution curve */}
        <path d={tPath} fill="none" stroke="#6366f1" strokeWidth="2.5" />

        {/* Normal curve dashed */}
        <path d={normalPath} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6 4" />

        {/* Critical value lines */}
        {critX && (
          <>
            <line x1={critX} y1={PT} x2={critX} y2={H - PB} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x={critX + 4} y={PT + 12} fontSize="9" fill="#ef4444">t* = {tCrit.toFixed(3)}</text>
          </>
        )}
        {twoTailed && critX && (() => {
          const innerW = W - PL - PR
          const xMin = -5, xMax = 5
          const mirrorX = PL + ((-tCrit - xMin) / (xMax - xMin)) * innerW
          return (
            <>
              <line x1={mirrorX} y1={PT} x2={mirrorX} y2={H - PB} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x={mirrorX - 4} y={PT + 12} fontSize="9" fill="#ef4444" textAnchor="end">−t* = {(-tCrit).toFixed(3)}</text>
            </>
          )
        })()}

        {/* x-axis ticks */}
        {[-4,-3,-2,-1,0,1,2,3,4].map(k => {
          const innerW = W - PL - PR
          const xMin = -5, xMax = 5
          const x = PL + ((k - xMin) / (xMax - xMin)) * innerW
          return (
            <g key={k}>
              <line x1={x} y1={H - PB} x2={x} y2={H - PB + 4} stroke="#94a3b8" strokeWidth="1" />
              <text x={x} y={H - PB + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">{k}</text>
            </g>
          )
        })}

        {/* Legend */}
        <line x1={W - PR - 80} y1={PT + 8} x2={W - PR - 60} y2={PT + 8} stroke="#6366f1" strokeWidth="2.5" />
        <text x={W - PR - 56} y={PT + 12} fontSize="8" fill="#6366f1">t({df})</text>
        <line x1={W - PR - 80} y1={PT + 22} x2={W - PR - 60} y2={PT + 22} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={W - PR - 56} y={PT + 26} fontSize="8" fill="#94a3b8">N(0,1)</text>
      </svg>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <SliderControl label={`df = ${df}`} min={1} max={30} step={1} value={df} onChange={setDf} />
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-600 dark:text-slate-400 min-w-[80px]">α level</span>
          <select value={alpha} onChange={e => setAlpha(Number(e.target.value))}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1">
            {ALPHA_LEVELS.map(a => <option key={a} value={a}>α = {a}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3 text-xs">
        <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={twoTailed} onChange={e => setTwoTailed(e.target.checked)} className="accent-red-500" />
          Two-tailed test
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">t critical</div>
          <div className="font-mono font-semibold text-red-600 dark:text-red-400">±{tCrit.toFixed(3)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">Tail area</div>
          <div className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{(tailArea * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">Heavier tails vs N(0,1)</div>
          <div className="font-mono font-semibold text-slate-600 dark:text-slate-400">
            {df <= 5 ? 'Very heavy' : df <= 15 ? 'Moderate' : 'Near normal'}
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        As df → ∞, the t-distribution converges to N(0,1). Heavier tails reflect uncertainty from estimating σ with small samples.
      </p>
    </div>
  )
}
