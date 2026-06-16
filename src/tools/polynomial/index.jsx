import { useState, useMemo, useRef, useEffect } from 'react'
import { evaluate as mathEval } from 'mathjs'
import KatexBlock from '../math/KatexBlock.jsx'

// ─── polynomial evaluation via mathjs ────────────────────────────────────────
function evalAt(expr, x) {
  try {
    const r = mathEval(expr, { x })
    if (typeof r === 'number') return r
    if (r && typeof r.re === 'number') return NaN // complex → no real value
    return NaN
  } catch { return NaN }
}

// ─── numerical derivative (central difference) ───────────────────────────────
function numDeriv(expr, x) {
  const h = Math.max(Math.abs(x) * 1e-6, 1e-8)
  return (evalAt(expr, x + h) - evalAt(expr, x - h)) / (2 * h)
}

// ─── single Newton-Raphson root refinement ───────────────────────────────────
function newtonRoot(expr, x0) {
  let x = x0
  for (let k = 0; k < 80; k++) {
    const fx = evalAt(expr, x)
    if (!isFinite(fx)) return null
    if (Math.abs(fx) < 1e-12) return x
    const fpx = numDeriv(expr, x)
    if (Math.abs(fpx) < 1e-14) break
    const xn = x - fx / fpx
    if (!isFinite(xn)) return null
    if (Math.abs(xn - x) < 1e-10) return Math.abs(evalAt(expr, xn)) < 1e-5 ? xn : null
    x = xn
  }
  return Math.abs(evalAt(expr, x)) < 1e-5 ? x : null
}

// ─── scan [lo,hi] for all distinct real roots ─────────────────────────────────
function findRoots(expr, lo = -15, hi = 15, nScan = 800) {
  const roots = []
  const step = (hi - lo) / nScan
  let px = lo, pf = evalAt(expr, lo)
  for (let i = 1; i <= nScan; i++) {
    const x = lo + i * step
    const f = evalAt(expr, x)
    if (isFinite(pf) && isFinite(f)) {
      if (pf * f < 0) {
        const r = newtonRoot(expr, (px + x) / 2)
        if (r !== null && !roots.some(e => Math.abs(e - r) < 1e-4)) roots.push(r)
      }
      if (Math.abs(f) < 1e-7 && !roots.some(e => Math.abs(e - x) < 5e-4)) {
        const r = newtonRoot(expr, x)
        if (r !== null && Math.abs(evalAt(expr, r)) < 1e-5 && !roots.some(e => Math.abs(e - r) < 1e-3)) roots.push(r)
      }
    }
    px = x; pf = f
  }
  return roots.sort((a, b) => a - b)
}

// ─── detect polynomial degree via finite differences ─────────────────────────
function detectDegree(expr) {
  const pts = Array.from({ length: 8 }, (_, i) => evalAt(expr, i - 1))
  if (pts.some(p => !isFinite(p))) return null
  let d = [...pts]
  for (let k = 0; k <= 6; k++) {
    const scale = Math.max(...d.map(v => Math.abs(v)), 1)
    if (d.every(v => Math.abs(v) < 1e-6 * scale)) return k
    d = d.slice(0, -1).map((_, i) => d[i + 1] - d[i])
  }
  return null
}

// ─── extract a, b, c from ax² + bx + c ───────────────────────────────────────
function extractQuadCoeffs(expr) {
  const c  = evalAt(expr, 0)
  const f1 = evalAt(expr, 1)
  const fm = evalAt(expr, -1)
  const a  = (f1 + fm - 2 * c) / 2
  const b  = f1 - c - a
  return { a, b, c }
}

// ─── number formatting ────────────────────────────────────────────────────────
function fmtN(v) {
  if (!isFinite(v)) return '?'
  if (Math.abs(v) < 1e-9) return '0'
  if (Math.abs(v - Math.round(v)) < 1e-7) return String(Math.round(v))
  return parseFloat(v.toPrecision(6)).toString()
}

// Try to express v as a simple fraction (denom ≤ 12); returns LaTeX string
function tryFrac(v) {
  if (Math.abs(v - Math.round(v)) < 1e-7) return fmtN(v)
  for (let d = 2; d <= 12; d++) {
    const n = Math.round(v * d)
    if (Math.abs(v - n / d) < 1e-6 && Math.abs(n % d) !== 0) {
      return `\\tfrac{${n}}{${d}}`
    }
  }
  return fmtN(v)
}

// Wrap negative numbers in \!\left( \right) for safe LaTeX embedding
function lp(v) {
  const s = fmtN(v)
  return v < -1e-9 ? `\\left(${s}\\right)` : s
}

// ─── build quadratic solution steps ──────────────────────────────────────────
function buildQuadSteps(a, b, c) {
  const disc  = b * b - 4 * a * c
  const aL    = fmtN(a), bL = fmtN(b), cL = fmtN(c)
  const discL = fmtN(disc)
  const negbL = fmtN(-b)
  const twoaL = fmtN(2 * a)
  const bSqL  = fmtN(b * b)
  const facL  = fmtN(4 * a * c)

  // Build the standard-form display line
  const aTerm = a === 1 ? '' : a === -1 ? '-' : `${aL}\\,`
  const bAbs  = Math.abs(b)
  const bSign = b >= 0 ? '+' : '-'
  const bTerm = bAbs === 1 ? `${bSign} x` : `${bSign} ${fmtN(bAbs)}\\,x`
  const cSign = c >= 0 ? '+' : '-'
  const cTerm = `${cSign} ${fmtN(Math.abs(c))}`

  const steps = [
    {
      title: 'Identify coefficients',
      math: `f(x) = ${aTerm}x^2 ${bTerm} ${cTerm} = 0\\\\\na = ${aL},\\quad b = ${bL},\\quad c = ${cL}`,
    },
    {
      title: 'Compute the discriminant  Δ = b² − 4ac',
      math: `\\Delta = b^2 - 4ac\n= ${lp(b)}^2 - 4 \\cdot ${lp(a)} \\cdot ${lp(c)}\n= ${bSqL} - ${facL}\n= ${discL}`,
    },
    disc > 0
      ? {
          title: 'Δ > 0  →  two distinct real roots',
          math: `x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a} = \\dfrac{${negbL} \\pm \\sqrt{${discL}}}{${twoaL}}`,
        }
      : disc === 0
      ? {
          title: 'Δ = 0  →  one repeated root',
          math: `x = -\\dfrac{b}{2a} = -\\dfrac{${lp(b)}}{${twoaL}} = ${tryFrac(-b / (2 * a))}`,
        }
      : {
          title: 'Δ < 0  →  no real roots (complex pair)',
          math: `\\Delta = ${discL} < 0\\\\\nx = ${fmtN(-b / (2 * a))} \\pm ${fmtN(Math.sqrt(-disc) / (2 * Math.abs(a)))}\\,i`,
        },
  ]

  if (disc > 0) {
    const sqrtD  = Math.sqrt(disc)
    const sqrtDL = Math.abs(sqrtD - Math.round(sqrtD)) < 1e-7 ? fmtN(sqrtD) : `\\sqrt{${discL}}`
    const x1     = (-b + sqrtD) / (2 * a)
    const x2     = (-b - sqrtD) / (2 * a)
    steps.push({
      title: 'Evaluate both roots',
      math: `x_1 = \\dfrac{${negbL} + ${sqrtDL}}{${twoaL}} = ${tryFrac(x1)}\\qquad x_2 = \\dfrac{${negbL} - ${sqrtDL}}{${twoaL}} = ${tryFrac(x2)}`,
    })
    const r1L       = x1 < -1e-9 ? `\\left(${tryFrac(x1)}\\right)` : tryFrac(x1)
    const r2L       = x2 < -1e-9 ? `\\left(${tryFrac(x2)}\\right)` : tryFrac(x2)
    const aPre      = a === 1 ? '' : a === -1 ? '-' : `${aL}\\cdot`
    steps.push({
      title: 'Factored form  (Factor Theorem)',
      math: `f(x) = ${aPre}\\left(x - ${r1L}\\right)\\left(x - ${r2L}\\right)`,
    })
  } else if (disc === 0) {
    const root = -b / (2 * a)
    const rL   = root < -1e-9 ? `\\left(${tryFrac(root)}\\right)` : tryFrac(root)
    const aPre = a === 1 ? '' : a === -1 ? '-' : `${aL}\\cdot`
    steps.push({
      title: 'Factored form  (perfect square)',
      math: `f(x) = ${aPre}\\left(x - ${rL}\\right)^2`,
    })
  } else {
    // complex: show conjugate pair
    const re  = -b / (2 * a)
    const im  = Math.sqrt(-disc) / (2 * Math.abs(a))
    steps.push({
      title: 'Complex conjugate pair',
      math: `x = ${fmtN(re)} + ${fmtN(im)}\\,i\\qquad x = ${fmtN(re)} - ${fmtN(im)}\\,i`,
    })
  }

  return { steps, disc }
}

// ─── normalise user input (implicit multiplication) ───────────────────────────
function norm(s) {
  return s
    .trim()
    .replace(/x²/g, 'x^2').replace(/x³/g, 'x^3').replace(/x⁴/g, 'x^4')
    .replace(/(\d)\s*x/g, '$1*x')
    .replace(/x\s*(\d)/g, 'x*$1')
    .replace(/\)\s*\(/g, ')*(')
    .replace(/(\d)\s*\(/g, '$1*(')
}

// ─── SVG mini graph ───────────────────────────────────────────────────────────
function PolyGraph({ expr, roots, dark }) {
  const W = 290, H = 160
  const PAD = { l: 28, r: 10, t: 12, b: 22 }
  const Wi = W - PAD.l - PAD.r
  const Hi = H - PAD.t - PAD.b

  const samples = useMemo(() => {
    if (!expr) return []
    const pts = []
    for (let i = 0; i <= 280; i++) {
      const x = -14 + i * 0.1
      const y = evalAt(expr, x)
      pts.push(isFinite(y) ? { x, y } : null)
    }
    return pts
  }, [expr])

  const valid = samples.filter(Boolean)
  if (!valid.length) return null

  const ys   = valid.map(p => p.y)
  const rawLo = Math.min(...ys), rawHi = Math.max(...ys)
  const span  = rawHi - rawLo || 2
  const ylo   = Math.min(rawLo - span * 0.12, -span * 0.05)
  const yhi   = Math.max(rawHi + span * 0.12,  span * 0.05)

  const sx = x  => PAD.l + (x + 14) / 28 * Wi
  const sy = y  => PAD.t + (1 - (y - ylo) / (yhi - ylo)) * Hi
  const y0 = sy(0)
  const x0 = sx(0)

  // Build polyline segments (break on vertical jumps > 2×Hi)
  const segs = []; let cur = []
  for (let i = 0; i < samples.length; i++) {
    const p = samples[i]
    if (!p) { if (cur.length > 1) segs.push(cur); cur = []; continue }
    const pt = `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`
    if (cur.length > 0) {
      const prev = samples.slice(0, i).reverse().find(Boolean)
      if (prev && Math.abs(sy(p.y) - sy(prev.y)) > Hi * 2) {
        if (cur.length > 1) segs.push(cur); cur = []
      }
    }
    cur.push(pt)
  }
  if (cur.length > 1) segs.push(cur)

  const axisClr  = dark ? '#374151' : '#d1d5db'
  const tickClr  = dark ? '#4b5563' : '#e5e7eb'
  const labelClr = dark ? '#6b7280' : '#9ca3af'

  // x-axis tick marks at integers
  const ticks = [-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10].filter(
    n => sx(n) >= PAD.l && sx(n) <= PAD.l + Wi
  )

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg" style={{ maxHeight: 160, display: 'block' }}>
      {/* grid lines at x ticks */}
      {ticks.map(n => (
        <line key={n} x1={sx(n)} y1={PAD.t} x2={sx(n)} y2={PAD.t + Hi}
          stroke={tickClr} strokeWidth="0.5" />
      ))}
      {/* axes */}
      <line x1={PAD.l} y1={Math.max(PAD.t, Math.min(PAD.t + Hi, y0))}
            x2={PAD.l + Wi} y2={Math.max(PAD.t, Math.min(PAD.t + Hi, y0))}
            stroke={axisClr} strokeWidth="1" />
      <line x1={Math.max(PAD.l, Math.min(PAD.l + Wi, x0))} y1={PAD.t}
            x2={Math.max(PAD.l, Math.min(PAD.l + Wi, x0))} y2={PAD.t + Hi}
            stroke={axisClr} strokeWidth="1" />
      {/* curve */}
      {segs.map((pts, i) => (
        <polyline key={i} points={pts.join(' ')} fill="none"
          stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {/* root dots */}
      {roots.map((r, i) => {
        const rx = sx(r)
        if (rx < PAD.l - 4 || rx > PAD.l + Wi + 4) return null
        const ry = Math.max(PAD.t, Math.min(PAD.t + Hi, y0))
        return (
          <g key={i}>
            <circle cx={rx} cy={ry} r="4.5" fill="#f472b6" stroke={dark ? '#0d1117' : '#fff'} strokeWidth="1.5" />
            <text x={rx} y={ry + 14} textAnchor="middle" fontSize="8.5" fill="#f472b6" fontWeight="600">
              {tryFrac(r)}
            </text>
          </g>
        )
      })}
      {/* y-range labels */}
      <text x={PAD.l - 3} y={PAD.t + 7} textAnchor="end" fontSize="8" fill={labelClr}>{fmtN(yhi)}</text>
      <text x={PAD.l - 3} y={PAD.t + Hi} textAnchor="end" fontSize="8" fill={labelClr}>{fmtN(ylo)}</text>
      {/* tick x labels */}
      {ticks.filter(n => n !== 0).map(n => (
        <text key={n} x={sx(n)} y={H - PAD.b + 10} textAnchor="middle" fontSize="7" fill={labelClr}>{n}</text>
      ))}
    </svg>
  )
}

// ─── presets ──────────────────────────────────────────────────────────────────
const PRESETS = [
  { label: 'x²−5x+6',          expr: 'x^2 - 5*x + 6'           },  // roots 2,3
  { label: 'x²−4',             expr: 'x^2 - 4'                  },  // roots ±2
  { label: 'x²+1',             expr: 'x^2 + 1'                  },  // no real roots
  { label: 'x²−6x+9',         expr: 'x^2 - 6*x + 9'            },  // double root 3
  { label: '2x²−7x+3',        expr: '2*x^2 - 7*x + 3'          },  // 1/2, 3
  { label: 'x³−x',             expr: 'x^3 - x'                  },  // −1,0,1
  { label: 'x³−6x²+11x−6',    expr: 'x^3 - 6*x^2 + 11*x - 6'  },  // 1,2,3
]

const STEP_COLORS = [
  'bg-violet-600', 'bg-indigo-500', 'bg-sky-500',
  'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
]

// ─── main panel ───────────────────────────────────────────────────────────────
function PolyPanel({ dark }) {
  const [rawExpr, setRawExpr]       = useState('x^2 - 5*x + 6')
  const [debouncedExpr, setDebExpr] = useState('x^2 - 5*x + 6')
  const inputRef = useRef(null)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  useEffect(() => {
    const id = setTimeout(() => setDebExpr(norm(rawExpr)), 600)
    return () => clearTimeout(id)
  }, [rawExpr])

  const bg0   = dark ? 'bg-[#0d1117]'  : 'bg-slate-100'
  const bg1   = dark ? 'bg-[#161b22]'  : 'bg-white'
  const bg2   = dark ? 'bg-[#21262d]'  : 'bg-slate-50'
  const bdr   = dark ? 'border-slate-700' : 'border-slate-200'
  const txt   = dark ? 'text-slate-100' : 'text-slate-900'
  const muted = dark ? 'text-slate-400' : 'text-slate-500'
  const inputCls = `w-full px-3 py-2 rounded-lg text-sm font-mono outline-none transition-colors border
    ${dark
      ? 'bg-[#0d1117] border-slate-600 text-slate-200 focus:border-violet-400 placeholder:text-slate-600'
      : 'bg-white border-slate-300 text-slate-800 focus:border-violet-400 placeholder:text-slate-400'}`

  const degree  = useMemo(() => detectDegree(debouncedExpr), [debouncedExpr])
  const roots   = useMemo(() => findRoots(debouncedExpr),    [debouncedExpr])

  const quadInfo = useMemo(() => {
    if (degree !== 2) return null
    const { a, b, c } = extractQuadCoeffs(debouncedExpr)
    if (!isFinite(a) || !isFinite(b) || !isFinite(c)) return null
    return { ...buildQuadSteps(a, b, c), a, b, c }
  }, [degree, debouncedExpr])

  function applyPreset(p) {
    setRawExpr(p.expr)
    setDebExpr(norm(p.expr))
    if (!isMobile) inputRef.current?.focus()
  }

  const degreeLabel = degree === 1 ? 'Linear'
    : degree === 2 ? 'Quadratic'
    : degree === 3 ? 'Cubic'
    : degree === 4 ? 'Quartic'
    : degree != null ? `Degree-${degree}`
    : null

  return (
    <div className={`flex flex-col gap-4 p-3 ${bg1} overflow-y-auto`}
      style={{ maxHeight: 'calc(92dvh - 48px)' }}>

      {/* ── input ── */}
      <div className="space-y-2">
        <label className={`text-[10px] font-semibold uppercase tracking-wide ${muted}`}>
          f(x) = 0  — use ^ for powers, * for multiply
        </label>
        <input
          ref={inputRef}
          className={inputCls}
          value={rawExpr}
          onChange={e => setRawExpr(e.target.value)}
          onBlur={() => isMobile && inputRef.current?.blur()}
          placeholder="x^2 - 5x + 6  or  x^3 - x"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {/* ── presets ── */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => applyPreset(p)}
            className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${bdr} ${muted}
              hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-colors`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* ── degree badge + graph ── */}
      {degreeLabel && (
        <div className={`rounded-xl border ${bdr} overflow-hidden`}>
          <div className={`px-3 py-2 flex items-center justify-between ${bg2} border-b ${bdr}`}>
            <span className={`text-xs font-semibold ${txt}`}>
              {degreeLabel} polynomial
            </span>
            <span className={`text-xs font-semibold ${
              roots.length === 0 ? 'text-amber-400'
              : roots.length === 1 ? 'text-sky-400'
              : 'text-emerald-400'}`}>
              {roots.length === 0 ? 'No real zeros'
               : roots.length === 1 ? '1 real zero'
               : `${roots.length} real zeros`}
            </span>
          </div>
          <div className={`p-2 ${bg0}`}>
            <PolyGraph expr={debouncedExpr} roots={roots} dark={dark} />
          </div>
        </div>
      )}

      {/* ── roots summary ── */}
      {roots.length > 0 && (
        <div className={`rounded-xl border ${bdr} p-3 space-y-2`}>
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${muted}`}>Zeros (roots)</p>
          <div className="flex flex-wrap gap-2">
            {roots.map((r, i) => (
              <div key={i} className={`px-3 py-1.5 rounded-lg font-mono font-bold text-sm text-pink-400
                border border-pink-500/40 ${dark ? 'bg-pink-900/20' : 'bg-pink-50'}`}>
                x = {tryFrac(r)}
              </div>
            ))}
          </div>
          <p className={`text-[10px] ${muted}`}>
            Verified: {roots.map(r => `f(${tryFrac(r)}) ≈ ${Math.abs(evalAt(debouncedExpr, r)) < 1e-5 ? '0' : fmtN(evalAt(debouncedExpr, r))}`).join('  ·  ')}
          </p>
        </div>
      )}

      {/* ── no real roots note ── */}
      {degreeLabel && roots.length === 0 && (
        <div className={`rounded-xl border border-amber-500/30 p-3 space-y-1 ${dark ? 'bg-amber-900/10' : 'bg-amber-50'}`}>
          <p className="text-xs font-semibold text-amber-400">No real zeros found in [−15, 15]</p>
          <p className={`text-[11px] ${muted}`}>
            The curve doesn't cross the x-axis in the visible range.
            Roots may be complex or outside the search window.
          </p>
        </div>
      )}

      {/* ── quadratic: full step-by-step ── */}
      {quadInfo && (
        <div className="space-y-3">
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${muted}`}>Step-by-step solution</p>
          {quadInfo.steps.map((step, i) => (
            <div key={i} className={`rounded-xl border ${bdr} overflow-hidden`}>
              <div className={`px-3 py-1.5 flex items-center gap-2 ${bg2} border-b ${bdr}`}>
                <span className={`w-5 h-5 rounded-full ${STEP_COLORS[i % STEP_COLORS.length]} text-white
                  text-[10px] font-bold flex items-center justify-center flex-shrink-0`}>
                  {i + 1}
                </span>
                <span className={`text-xs font-semibold ${txt}`}>{step.title}</span>
              </div>
              <div className={`px-3 py-2 overflow-x-auto ${bg0}`}>
                <KatexBlock expr={step.math} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── linear: trivial ── */}
      {degree === 1 && roots.length > 0 && (
        <div className="space-y-2">
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${muted}`}>Solution</p>
          <div className={`rounded-xl border ${bdr} p-3 overflow-x-auto ${bg0}`}>
            <KatexBlock expr={`f(x) = 0 \\implies x = ${tryFrac(roots[0])}`} />
          </div>
        </div>
      )}

      {/* ── cubic/quartic/higher: factor theorem ── */}
      {degree != null && degree > 2 && roots.length > 0 && (
        <div className="space-y-3">
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${muted}`}>Factor Theorem</p>
          <div className={`rounded-xl border ${bdr} p-3 space-y-3`}>
            <p className={`text-xs ${txt}`}>
              If <span className="font-mono text-violet-400">f(r) = 0</span>, then{' '}
              <span className="font-mono text-violet-400">(x − r)</span> is a factor of f(x).
            </p>
            <div className={`rounded-lg overflow-x-auto px-3 py-2 ${bg0}`}>
              <KatexBlock expr={
                roots.map(r => {
                  const rL = r < -1e-9 ? `\\left(${tryFrac(r)}\\right)` : tryFrac(r)
                  return `f(${tryFrac(r)}) = 0 \\implies \\left(x - ${rL}\\right) \\text{ is a factor}`
                }).join('\\\\')
              } />
            </div>
          </div>
        </div>
      )}

      {/* ── quick reference card ── */}
      <div className={`rounded-xl border ${bdr} p-3 space-y-2`}>
        <p className={`text-[10px] font-semibold uppercase tracking-wide ${muted} mb-1`}>Quick Reference</p>
        <div className="overflow-x-auto">
          <KatexBlock expr="x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" />
        </div>
        <div className={`text-[11px] ${muted} leading-relaxed`}>
          <span className="text-sky-400 font-semibold">Δ &gt; 0</span> → 2 distinct real roots &ensp;
          <span className="text-emerald-400 font-semibold">Δ = 0</span> → 1 repeated root &ensp;
          <span className="text-amber-400 font-semibold">Δ &lt; 0</span> → no real roots (complex pair)
        </div>
      </div>

    </div>
  )
}

// ─── floating window shell ────────────────────────────────────────────────────
export default function PolyCalc({ onClose }) {
  const dark     = document.documentElement.classList.contains('dark')
  const isMobile = window.innerWidth < 640

  const [pos, setPos] = useState(() => ({
    x: Math.max(16, window.innerWidth  - 440),
    y: Math.max(16, Math.round((window.innerHeight - 620) / 2)),
  }))

  const dragging   = useRef(false)
  const dragOrigin = useRef({ mx: 0, my: 0, px: 0, py: 0 })

  const startDrag = (e) => {
    e.preventDefault()
    dragging.current = true
    dragOrigin.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
  }

  useEffect(() => {
    const move = (e) => {
      if (!dragging.current) return
      setPos({
        x: Math.max(0, Math.min(window.innerWidth  - 380, dragOrigin.current.px + e.clientX - dragOrigin.current.mx)),
        y: Math.max(0, Math.min(window.innerHeight - 80,  dragOrigin.current.py + e.clientY - dragOrigin.current.my)),
      })
    }
    const up = () => { dragging.current = false }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup',   up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup',   up)
    }
  }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const bg0  = dark ? 'bg-[#0d1117]'    : 'bg-slate-100'
  const bg1  = dark ? 'bg-[#161b22]'    : 'bg-white'
  const bdr  = dark ? 'border-slate-700' : 'border-slate-300'
  const txt  = dark ? 'text-slate-100'   : 'text-slate-900'
  const muted = dark ? 'text-slate-400'  : 'text-slate-500'

  return (
    <>
      {isMobile && (
        <div className="fixed inset-0 z-[1999] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      )}
      <div
        className={`fixed z-[2000] rounded-2xl shadow-2xl border ${bdr} ${bg1} overflow-hidden`}
        style={isMobile
          ? {
              left: '50%', top: '50%',
              transform: 'translate(-50%,-50%)',
              width: Math.min(420, window.innerWidth - 16),
              maxHeight: '92dvh', overflowY: 'auto',
            }
          : { left: pos.x, top: pos.y, width: 420 }
        }
      >
        {/* title bar */}
        <div
          className={`flex items-center gap-2 px-3 py-2.5 ${bg0} border-b ${bdr} cursor-move select-none`}
          onMouseDown={startDrag}
        >
          <span className="text-violet-400 text-sm font-bold font-mono">P(x)</span>
          <span className={`text-xs font-bold tracking-wide ${txt} flex-1`}>Polynomial Solver</span>
          <span className={`text-[10px] ${muted}`}>drag to move</span>
          <button
            onClick={onClose}
            className={`ml-1 p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 ${muted} hover:text-rose-500 transition-colors text-base leading-none`}
            title="Close (Esc)"
          >×</button>
        </div>

        <PolyPanel dark={dark} />
      </div>
    </>
  )
}
