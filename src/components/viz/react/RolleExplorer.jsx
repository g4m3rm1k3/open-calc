import { useState, useMemo, useRef, useEffect } from 'react'

// ─── Safe expression evaluator ───────────────────────────────────────────────
// Supports: x, +, -, *, /, ^, (), sin, cos, tan, sqrt, abs, ln, log, exp, pi, e
function safeEval(expr, x) {
  let s = expr.trim()
    .replace(/\^/g, '**')
    .replace(/\bsqrt\b/g,  'Math.sqrt')
    .replace(/\babs\b/g,   'Math.abs')
    .replace(/\bsin\b/g,   'Math.sin')
    .replace(/\bcos\b/g,   'Math.cos')
    .replace(/\btan\b/g,   'Math.tan')
    .replace(/\bln\b/g,    'Math.log')
    .replace(/\blog\b/g,   'Math.log10')
    .replace(/\bexp\b/g,   'Math.exp')
    .replace(/\bpi\b/g,    'Math.PI')
    .replace(/\be\b/g,     'Math.E')
    .replace(/\bx\b/g,     `(${x})`)
  if (!/^[\d\s+\-*/().Math,_]+$/i.test(s)) return NaN
  try {
    // eslint-disable-next-line no-new-func
    const v = Function('"use strict"; return (' + s + ')')()
    return typeof v === 'number' && isFinite(v) ? v : NaN
  } catch {
    return NaN
  }
}

// Numerical derivative via central difference
function numDeriv(expr, x, h = 1e-5) {
  const fp = safeEval(expr, x + h)
  const fm = safeEval(expr, x - h)
  if (isNaN(fp) || isNaN(fm)) return NaN
  return (fp - fm) / (2 * h)
}

// Find zeros of f'(x) on (a,b) via sign-change bisection
function findCPoints(expr, a, b, tol = 1e-6) {
  const n = 500
  const step = (b - a) / n
  const results = []
  for (let i = 0; i < n; i++) {
    const x0 = a + i * step
    const x1 = x0 + step
    const d0 = numDeriv(expr, x0)
    const d1 = numDeriv(expr, x1)
    if (isNaN(d0) || isNaN(d1)) continue
    if (d0 * d1 <= 0) {
      let lo = x0, hi = x1
      for (let iter = 0; iter < 60; iter++) {
        const mid = (lo + hi) / 2
        if (Math.abs(hi - lo) < tol) break
        const dMid = numDeriv(expr, mid)
        if (isNaN(dMid)) break
        if (numDeriv(expr, lo) * dMid <= 0) hi = mid
        else lo = mid
      }
      const c = (lo + hi) / 2
      if (c > a + tol && c < b - tol) {
        // Deduplicate
        if (!results.some((r) => Math.abs(r - c) < 0.01)) results.push(c)
      }
    }
  }
  return results
}

// ─── SVG graph ────────────────────────────────────────────────────────────────
const W = 520, H = 260
const PM = { t: 24, b: 36, l: 44, r: 16 }
const GW = W - PM.l - PM.r
const GH = H - PM.t - PM.b

function Graph({ expr, a, b, cPoints, guessX, fa, fb, validFunc, rolleOk }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width  = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    if (!validFunc || isNaN(fa)) return

    // Sample f over plot domain (add 15% margin each side)
    const margin = (b - a) * 0.2
    const xLo = a - margin, xHi = b + margin
    const N = 500
    const ys = []
    for (let i = 0; i <= N; i++) {
      const x = xLo + (i / N) * (xHi - xLo)
      const y = safeEval(expr, x)
      if (!isNaN(y)) ys.push(y)
    }
    if (ys.length === 0) return

    const yLo = Math.min(...ys) - Math.abs(Math.max(...ys) - Math.min(...ys)) * 0.15
    const yHi = Math.max(...ys) + Math.abs(Math.max(...ys) - Math.min(...ys)) * 0.15

    function toCanvasX(x) { return PM.l + ((x - xLo) / (xHi - xLo)) * GW }
    function toCanvasY(y) { return PM.t + GH - ((y - yLo) / (yHi - yLo)) * GH }

    // ── Grid lines
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 0.8
    ctx.setLineDash([3, 3])
    for (let t = Math.ceil(xLo); t <= Math.floor(xHi); t++) {
      ctx.beginPath(); ctx.moveTo(toCanvasX(t), PM.t); ctx.lineTo(toCanvasX(t), PM.t + GH); ctx.stroke()
    }
    const yStep = (yHi - yLo) > 8 ? 2 : 1
    for (let t = Math.ceil(yLo / yStep) * yStep; t <= yHi; t += yStep) {
      ctx.beginPath(); ctx.moveTo(PM.l, toCanvasY(t)); ctx.lineTo(PM.l + GW, toCanvasY(t)); ctx.stroke()
    }
    ctx.setLineDash([])

    // ── Axes
    const axY = Math.max(PM.t, Math.min(PM.t + GH, toCanvasY(0)))
    const axX = Math.max(PM.l, Math.min(PM.l + GW, toCanvasX(0)))
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(PM.l, axY); ctx.lineTo(PM.l + GW, axY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(axX, PM.t); ctx.lineTo(axX, PM.t + GH); ctx.stroke()

    // ── Axis tick labels
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace'; ctx.textAlign = 'center'
    for (let t = Math.ceil(xLo); t <= Math.floor(xHi); t++) {
      if (t === 0) continue
      ctx.fillText(t, toCanvasX(t), axY + 12)
    }
    ctx.textAlign = 'right'
    for (let t = Math.ceil(yLo / yStep) * yStep; t <= yHi; t += yStep) {
      if (Math.abs(t) < 0.01) continue
      ctx.fillText(t.toFixed(t % 1 === 0 ? 0 : 1), PM.l - 4, toCanvasY(t) + 4)
    }

    // ── Shaded region between a and b
    if (rolleOk) {
      ctx.fillStyle = 'rgba(99,102,241,0.07)'
      ctx.beginPath()
      ctx.moveTo(toCanvasX(a), axY)
      for (let i = 0; i <= 100; i++) {
        const x = a + (i / 100) * (b - a)
        const y = safeEval(expr, x)
        if (!isNaN(y)) ctx.lineTo(toCanvasX(x), toCanvasY(y))
      }
      ctx.lineTo(toCanvasX(b), axY)
      ctx.closePath(); ctx.fill()
    }

    // ── Curve (indigo)
    ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2.5
    ctx.beginPath()
    let started = false
    for (let i = 0; i <= N; i++) {
      const x = xLo + (i / N) * (xHi - xLo)
      const y = safeEval(expr, x)
      if (isNaN(y) || y < yLo - 2 || y > yHi + 2) { started = false; continue }
      if (!started) { ctx.moveTo(toCanvasX(x), toCanvasY(y)); started = true }
      else ctx.lineTo(toCanvasX(x), toCanvasY(y))
    }
    ctx.stroke()

    // ── Endpoint equal-height reference line (amber dashes)
    if (rolleOk && !isNaN(fa)) {
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.8; ctx.setLineDash([6, 4])
      ctx.beginPath()
      ctx.moveTo(toCanvasX(a) - 5, toCanvasY(fa))
      ctx.lineTo(toCanvasX(b) + 5, toCanvasY(fa))
      ctx.stroke(); ctx.setLineDash([])
    }

    // ── Endpoint dots (amber)
    ;[a, b].forEach((xv, idx) => {
      const yv = safeEval(expr, xv)
      if (isNaN(yv)) return
      ctx.fillStyle = '#f59e0b'
      ctx.beginPath(); ctx.arc(toCanvasX(xv), toCanvasY(yv), 6, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'
      ctx.fillText(idx === 0 ? 'a' : 'b', toCanvasX(xv), toCanvasY(yv) - 10)
    })

    // ── c points (green) with horizontal tangent
    if (rolleOk) {
      cPoints.forEach((c, i) => {
        const fc = safeEval(expr, c)
        if (isNaN(fc)) return
        const hw = Math.min(0.6, (b - a) * 0.18)
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.8
        ctx.beginPath()
        ctx.moveTo(toCanvasX(c - hw), toCanvasY(fc))
        ctx.lineTo(toCanvasX(c + hw), toCanvasY(fc))
        ctx.stroke()
        // Vertical dashed drop
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 1.3; ctx.setLineDash([4, 3])
        ctx.beginPath(); ctx.moveTo(toCanvasX(c), toCanvasY(fc)); ctx.lineTo(toCanvasX(c), axY); ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = '#10b981'
        ctx.beginPath(); ctx.arc(toCanvasX(c), toCanvasY(fc), 6, 0, Math.PI * 2); ctx.fill()
        const lbl = cPoints.length > 1 ? `c${i + 1}` : 'c'
        const above = toCanvasY(fc) > PM.t + 18
        ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'
        ctx.fillText(lbl, toCanvasX(c), toCanvasY(fc) + (above ? -10 : 14))
      })
    }

    // ── Guess marker (violet dashed vertical)
    if (guessX !== null && !isNaN(guessX)) {
      const gy = safeEval(expr, guessX)
      if (!isNaN(gy)) {
        ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 2; ctx.setLineDash([5, 4])
        ctx.beginPath(); ctx.moveTo(toCanvasX(guessX), PM.t + 4); ctx.lineTo(toCanvasX(guessX), PM.t + GH); ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = '#a855f7'
        ctx.beginPath(); ctx.arc(toCanvasX(guessX), toCanvasY(gy), 5, 0, Math.PI * 2); ctx.fill()
        ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'
        ctx.fillText('?', toCanvasX(guessX), PM.t + 14)
      }
    }
  }, [expr, a, b, cPoints, guessX, fa, fb, validFunc, rolleOk])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: W, height: H, maxWidth: '100%', display: 'block' }}
    />
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
const EXAMPLES = [
  { label: 'x² on [−1, 1]',     expr: 'x^2',          a: '-1', b: '1'  },
  { label: 'x³−4x on [−2, 2]',  expr: 'x^3 - 4*x',    a: '-2', b: '2'  },
  { label: 'sin(x) on [0, 2π]', expr: 'sin(x)',        a: '0',  b: '6.2832' },
  { label: 'x²−x on [0, 1]',    expr: 'x^2 - x',      a: '0',  b: '1'  },
]

export default function RolleExplorer() {
  const [expr,  setExpr]  = useState('x^2')
  const [aStr,  setAStr]  = useState('-1')
  const [bStr,  setBStr]  = useState('1')
  const [guess, setGuess] = useState('')
  const [revealed, setRevealed] = useState(false)

  // Reset reveal when inputs change
  function update(setter, val) { setter(val); setRevealed(false); setGuess('') }

  const a = parseFloat(aStr)
  const b = parseFloat(bStr)
  const validInterval = !isNaN(a) && !isNaN(b) && b > a + 0.05

  const fa = useMemo(() => validInterval ? safeEval(expr, a) : NaN, [expr, a, validInterval])
  const fb = useMemo(() => validInterval ? safeEval(expr, b) : NaN, [expr, b, validInterval])
  const validFunc = !isNaN(fa) && !isNaN(fb)

  const heightDiff = validFunc ? Math.abs(fa - fb) : NaN
  const rolleOk = validFunc && heightDiff < 0.01

  const cPoints = useMemo(
    () => (rolleOk ? findCPoints(expr, a, b) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expr, a, b, rolleOk]
  )

  const guessNum = parseFloat(guess)
  const guessInInterval = !isNaN(guessNum) && guessNum > a && guessNum < b
  const guessError = guessInInterval && cPoints.length > 0
    ? Math.min(...cPoints.map((c) => Math.abs(c - guessNum)))
    : null

  // Guess quality
  let guessMsg = null, guessColor = '#94a3b8'
  if (guessInInterval && cPoints.length > 0) {
    if (guessError < 0.05)       { guessMsg = 'Exact! f′(c) = 0 right there.';    guessColor = '#10b981' }
    else if (guessError < 0.2)   { guessMsg = 'Very close — within 0.2 units.';   guessColor = '#10b981' }
    else if (guessError < 0.5)   { guessMsg = `Off by ${guessError.toFixed(2)} — keep looking.`; guessColor = '#f59e0b' }
    else                          { guessMsg = `Off by ${guessError.toFixed(2)} — way off.`;      guessColor = '#f43f5e' }
  }

  function loadExample(ex) {
    setExpr(ex.expr); setAStr(ex.a); setBStr(ex.b)
    setGuess(''); setRevealed(false)
  }

  const inputClass = 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm font-mono text-slate-800 dark:text-slate-100 w-full focus:outline-none focus:ring-2 focus:ring-brand-400'

  return (
    <div className="space-y-3">
      {/* Example presets */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => loadExample(ex)}
            className="px-3 py-1 rounded-full text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Inputs row */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1">f(x) =</label>
          <input
            value={expr}
            onChange={(e) => update(setExpr, e.target.value)}
            className={inputClass}
            placeholder="e.g. x^2 - 1"
            spellCheck={false}
          />
        </div>
        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1">a =</label>
          <input
            value={aStr}
            onChange={(e) => update(setAStr, e.target.value)}
            className={inputClass}
            placeholder="-1"
          />
        </div>
        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1">b =</label>
          <input
            value={bStr}
            onChange={(e) => update(setBStr, e.target.value)}
            className={inputClass}
            placeholder="1"
          />
        </div>
      </div>

      {/* Condition check badges */}
      {validInterval && validFunc && (
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
            ✓ continuous &amp; differentiable (polynomial/trig)
          </span>
          <span className={`px-2 py-0.5 rounded ${rolleOk ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300'}`}>
            {rolleOk
              ? `✓ f(a) = f(b) = ${fa.toFixed(4)}`
              : `✗ f(a) = ${fa.toFixed(4)}, f(b) = ${fb.toFixed(4)} — not equal`}
          </span>
          {!rolleOk && (
            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
              Rolle's does not apply — try adjusting a or b so f(a) = f(b)
            </span>
          )}
        </div>
      )}

      {/* Graph */}
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <Graph
          expr={expr}
          a={isNaN(a) ? 0 : a}
          b={isNaN(b) ? 1 : b}
          cPoints={cPoints}
          guessX={guessInInterval && !revealed ? guessNum : null}
          fa={fa} fb={fb}
          validFunc={validFunc}
          rolleOk={rolleOk}
        />
      </div>

      {/* Guess section */}
      {rolleOk && cPoints.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rolle&apos;s applies. Where do you think f′(c) = 0? Enter your best guess for <span className="font-mono text-brand-500">c</span> ∈ ({a}, {b}):
          </p>
          <div className="flex gap-2 items-center">
            <input
              value={guess}
              onChange={(e) => { setGuess(e.target.value); setRevealed(false) }}
              className={`${inputClass} w-32`}
              placeholder="e.g. 0"
            />
            <button
              onClick={() => setRevealed(true)}
              className="px-3 py-1 rounded text-xs font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors"
            >
              Reveal answer
            </button>
          </div>

          {/* Guess feedback */}
          {guessMsg && !revealed && (
            <p className="text-xs font-mono" style={{ color: guessColor }}>{guessMsg}</p>
          )}

          {/* Revealed answer */}
          {revealed && (
            <div className="rounded-lg p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
              <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                {cPoints.length === 1 ? 'One value' : `${cPoints.length} values`} guaranteed by Rolle's Theorem:
              </p>
              {cPoints.map((c, i) => (
                <p key={i} className="font-mono text-emerald-600 dark:text-emerald-400">
                  {cPoints.length > 1 ? `c${i + 1}` : 'c'} = {c.toFixed(6)}
                  &nbsp;&nbsp;f′(c) = {numDeriv(expr, c).toFixed(8)}
                </p>
              ))}
              {guessInInterval && guessError !== null && (
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Your guess: {guessNum.toFixed(4)} — error: {guessError.toFixed(6)}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {rolleOk && cPoints.length === 0 && validFunc && (
        <p className="text-xs text-amber-600 dark:text-amber-400 font-mono">
          Conditions met but no zero of f′ found numerically — try a different interval or function.
        </p>
      )}

      <p className="text-xs text-slate-400 dark:text-slate-500 leading-snug">
        Supported syntax: <span className="font-mono">x^2</span>, <span className="font-mono">sin(x)</span>, <span className="font-mono">cos(x)</span>, <span className="font-mono">sqrt(x)</span>, <span className="font-mono">ln(x)</span>, <span className="font-mono">exp(x)</span>, <span className="font-mono">abs(x)</span>, <span className="font-mono">pi</span>, <span className="font-mono">e</span>. Multiply explicitly: <span className="font-mono">2*x</span> not <span className="font-mono">2x</span>.
      </p>
    </div>
  )
}
