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

function chi2pdf(x, df) {
  if (x <= 0) return 0
  return Math.exp((df / 2 - 1) * Math.log(x) - x / 2 - gammaln(df / 2) - (df / 2) * Math.log(2))
}

function gammainc(a, x) {
  if (x <= 0) return 0
  if (x < a + 1) {
    let term = 1 / a, sum = term
    for (let n = 1; n < 200; n++) { term *= x / (a + n); sum += term; if (Math.abs(term) < 1e-12 * Math.abs(sum)) break }
    return Math.min(1, sum * Math.exp(-x + a * Math.log(x) - gammaln(a)))
  }
  let b = x + 1 - a, c = 1e300, d = 1 / b, h = d
  for (let i = 1; i <= 200; i++) {
    const an = -i * (i - a); b += 2
    d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300
    c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300
    d = 1 / d; h *= d * c; if (Math.abs(d * c - 1) < 1e-12) break
  }
  return 1 - Math.min(1, h * Math.exp(-x + a * Math.log(x) - gammaln(a)))
}

function chi2cdf(x, df) { return x <= 0 ? 0 : gammainc(df / 2, x / 2) }

// Approximate chi2 inverse using Wilson-Hilferty + Newton
function norminv(p) {
  if (p <= 0) return -Infinity; if (p >= 1) return Infinity
  const a = [-3.969683028665376e+01,2.209460984245205e+02,-2.759285104469687e+02,1.383577518672690e+02,-3.066479806614716e+01,2.506628277459239e+00]
  const b = [-5.447609879822406e+01,1.615858368580409e+02,-1.556989798598866e+02,6.680131188771972e+01,-1.328068155288572e+01]
  const c = [-7.784894002430293e-03,-3.223964580411365e-01,-2.400758277161838e+00,-2.549732539343734e+00,4.374664141464968e+00,2.938163982698783e+00]
  const d = [7.784695709041462e-03,3.224671290700398e-01,2.445134137142996e+00,3.754408661907416e+00]
  const plo = 0.02425, phi = 1 - plo
  let q, r
  if (p < plo) { q = Math.sqrt(-2*Math.log(p)); return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1) }
  if (p <= phi) { q = p-0.5; r = q*q; return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1) }
  q = Math.sqrt(-2*Math.log(1-p)); return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)
}

function chi2inv(p, df) {
  if (p <= 0) return 0; if (p >= 1) return Infinity
  const h = 2/(9*df), z = norminv(p)
  let x = Math.max(1e-6, df * Math.pow(Math.max(0, 1 - h + z * Math.sqrt(h)), 3))
  for (let i = 0; i < 80; i++) {
    const fx = chi2cdf(x, df) - p
    if (Math.abs(fx) < 1e-12) break
    const fpdf = chi2pdf(x, df); if (fpdf < 1e-300) break
    x = Math.max(1e-10, x - fx / fpdf)
  }
  return x
}

const W = 540, H = 200, PL = 44, PR = 16, PT = 14, PB = 36

export default function ChiSquaredDistViz() {
  const [df, setDf] = useState(3)
  const [alpha, setAlpha] = useState(0.05)

  const { curvePath, tailPath, critVal, xMax } = useMemo(() => {
    const innerW = W - PL - PR, innerH = H - PT - PB
    const xMax = Math.max(20, df + 5 * Math.sqrt(2 * df))
    const xScale = x => PL + (x / xMax) * innerW
    const peak = df <= 2 ? chi2pdf(Math.max(0.01, df - 2), df) : chi2pdf(df - 2, df)
    const safeScale = peak > 0 ? peak * 1.15 : 1
    const yScale = y => PT + innerH - (y / safeScale) * innerH
    const baseline = PT + innerH

    const N = 300
    const xs = Array.from({ length: N + 1 }, (_, i) => (i / N) * xMax)
    const pts = xs.map(x => [xScale(x), yScale(chi2pdf(x, df))])

    const curvePath = `M${pts[0][0]},${baseline}` + pts.map(([x, y]) => `L${x},${y}`).join('') + `L${pts[N][0]},${baseline}Z`

    const critVal = chi2inv(1 - alpha, df)
    const tailPts = xs.filter(x => x >= critVal).map(x => [xScale(x), yScale(chi2pdf(x, df))])
    const tailPath = tailPts.length > 1
      ? `M${xScale(critVal)},${baseline}` + tailPts.map(([x, y]) => `L${x},${y}`).join('') + `L${tailPts[tailPts.length-1][0]},${baseline}Z`
      : ''

    return { curvePath, tailPath, critVal, xMax }
  }, [df, alpha])

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-100">
        Chi-Squared Distribution — χ²(df)
      </h3>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible mb-3">
        <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="#94a3b8" strokeWidth="1" />

        {/* Distribution fill */}
        <path d={curvePath} fill="#8b5cf6" fillOpacity="0.15" />
        {/* Rejection region */}
        {tailPath && <path d={tailPath} fill="#ef4444" fillOpacity="0.35" />}
        {/* Curve outline */}
        <path d={curvePath} fill="none" stroke="#8b5cf6" strokeWidth="2" />

        {/* Critical value line */}
        {(() => {
          const innerW = W - PL - PR
          const x = PL + (critVal / xMax) * innerW
          return (
            <>
              <line x1={x} y1={PT} x2={x} y2={H - PB} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x={x + 4} y={PT + 12} fontSize="9" fill="#ef4444">χ²* = {critVal.toFixed(2)}</text>
            </>
          )
        })()}

        {/* X-axis ticks */}
        {Array.from({ length: 7 }, (_, i) => Math.round(xMax * i / 6)).map(val => {
          const innerW = W - PL - PR
          const x = PL + (val / xMax) * innerW
          return (
            <g key={val}>
              <line x1={x} y1={H - PB} x2={x} y2={H - PB + 4} stroke="#94a3b8" strokeWidth="1" />
              <text x={x} y={H - PB + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">{val}</text>
            </g>
          )
        })}

        <text x={W / 2} y={H} textAnchor="middle" fontSize="9" fill="#94a3b8">χ² value</text>
      </svg>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <SliderControl label={`df = ${df}`} min={1} max={20} step={1} value={df} onChange={setDf} />
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-600 dark:text-slate-400 min-w-[80px]">α level</span>
          <select value={alpha} onChange={e => setAlpha(Number(e.target.value))}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1">
            {[0.1, 0.05, 0.025, 0.01, 0.001].map(a => <option key={a} value={a}>α = {a}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">df</div>
          <div className="font-mono font-semibold text-purple-600 dark:text-purple-400">{df}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">Critical χ²</div>
          <div className="font-mono font-semibold text-red-600 dark:text-red-400">{critVal.toFixed(3)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-slate-500 mb-1">Mean / Variance</div>
          <div className="font-mono font-semibold text-slate-600 dark:text-slate-400">{df} / {2 * df}</div>
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        Red region = rejection region at α = {alpha}. Chi-squared is always right-skewed; as df grows the shape becomes more symmetric.
      </p>
    </div>
  )
}
