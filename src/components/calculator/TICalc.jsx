import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { evaluate as mathEval, fraction as mathFraction } from 'mathjs'

// ─── Dark mode hook ───────────────────────────────────────────────────────────

function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    const el = document.documentElement
    const obs = new MutationObserver(() => setDark(el.classList.contains('dark')))
    obs.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

// ─── Math utilities ───────────────────────────────────────────────────────────

function buildScope(angleMode, ans, memory) {
  // Only spread numeric memory values; formula strings are kept separate
  const numericMem = Object.fromEntries(
    Object.entries(memory).filter(([, v]) => typeof v === 'number')
  )
  const scope = { ans, Ans: ans, pi: Math.PI, e: Math.E, ...numericMem }
  if (angleMode === 'DEG') {
    const d = Math.PI / 180
    scope.sin  = a => Math.sin(a * d)
    scope.cos  = a => Math.cos(a * d)
    scope.tan  = a => Math.tan(a * d)
    scope.asin = a => Math.asin(a) / d
    scope.acos = a => Math.acos(a) / d
    scope.atan = a => Math.atan(a) / d
    scope.atan2 = (y, x) => Math.atan2(y, x) / d
  }
  return scope
}

function calcEval(expr, scope) {
  // Fix implicit multiplication: 2x → 2*x, 2( → 2*(, )( → )*(
  const cleaned = expr
    .replace(/(\d)([a-zA-Z(])/g, '$1*$2')
    .replace(/\)(\d|[a-zA-Z(])/g, ')*$1')
    .replace(/÷/g, '/')
    .replace(/×/g, '*')
    .replace(/−/g, '-')
  return mathEval(cleaned, scope)
}

function nDeriv(expr, variable, value, scope) {
  const h = 1e-7
  const f = v => Number(calcEval(expr, { ...scope, [variable]: v }))
  return (f(value + h) - f(value - h)) / (2 * h)
}

function fnInt(expr, variable, a, b, scope, n = 1000) {
  const f = v => Number(calcEval(expr, { ...scope, [variable]: v }))
  const h = (b - a) / n
  let sum = f(a) + f(b)
  for (let i = 1; i < n; i++) sum += (i % 2 === 0 ? 2 : 4) * f(a + i * h)
  return (h / 3) * sum
}

function solveZero(expr, variable, guess, scope, maxIter = 60) {
  let x = guess
  for (let i = 0; i < maxIter; i++) {
    const h = 1e-7
    const fx  = Number(calcEval(expr, { ...scope, [variable]: x }))
    const fpx = (Number(calcEval(expr, { ...scope, [variable]: x + h }))
               - Number(calcEval(expr, { ...scope, [variable]: x - h }))) / (2 * h)
    if (Math.abs(fpx) < 1e-15 || !isFinite(fpx)) break
    const xNew = x - fx / fpx
    if (!isFinite(xNew)) break
    if (Math.abs(xNew - x) < 1e-10) return xNew
    x = xNew
  }
  return x
}

function fmtNum(n, prec = 10) {
  if (!isFinite(n)) return String(n)
  const s = parseFloat(n.toPrecision(prec))
  // Switch to scientific if very large or very small (but not zero)
  if (s !== 0 && (Math.abs(s) >= 1e10 || Math.abs(s) < 1e-6)) {
    return n.toExponential(6)
  }
  return String(s)
}

// ─── Canvas Function Plotter ──────────────────────────────────────────────────

const PLOT_COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171']

function FunctionPlotter({ expressions, xMin, xMax, yMin, yMax, angleMode, memory, ans, dark }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    const bg      = dark ? '#0f172a' : '#f8fafc'
    const grid    = dark ? '#1e293b' : '#e2e8f0'
    const axis    = dark ? '#475569' : '#94a3b8'
    const label   = dark ? '#64748b' : '#94a3b8'

    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    const toC = (x, y) => [
      (x - xMin) / (xMax - xMin) * W,
      H - (y - yMin) / (yMax - yMin) * H,
    ]

    // Grid
    ctx.strokeStyle = grid
    ctx.lineWidth = 1
    const xSpan = xMax - xMin, ySpan = yMax - yMin
    const xStep = Math.pow(10, Math.floor(Math.log10(xSpan / 6)))
    const yStep = Math.pow(10, Math.floor(Math.log10(ySpan / 5)))
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax + xStep * 0.01; x += xStep) {
      const [cx] = toC(x, 0)
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke()
    }
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax + yStep * 0.01; y += yStep) {
      const [, cy] = toC(0, y)
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = axis
    ctx.lineWidth = 1.5
    const [axX] = toC(0, 0)
    const [, axY] = toC(0, 0)
    if (axX >= 0 && axX <= W) { ctx.beginPath(); ctx.moveTo(axX, 0); ctx.lineTo(axX, H); ctx.stroke() }
    if (axY >= 0 && axY <= H) { ctx.beginPath(); ctx.moveTo(0, axY); ctx.lineTo(W, axY); ctx.stroke() }

    // Axis labels
    ctx.fillStyle = label
    ctx.font = '9px monospace'
    ctx.textAlign = 'center'
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      if (Math.abs(x) < xStep * 0.01) continue
      const [cx] = toC(x, 0)
      const labelY = axY >= 0 && axY <= H ? Math.min(axY + 12, H - 4) : H - 4
      ctx.fillText(parseFloat(x.toPrecision(4)), cx, labelY)
    }
    ctx.textAlign = 'right'
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      if (Math.abs(y) < yStep * 0.01) continue
      const [, cy] = toC(0, y)
      const labelX = axX >= 0 && axX <= W ? Math.max(axX - 3, 26) : 26
      ctx.fillText(parseFloat(y.toPrecision(4)), labelX, cy + 3)
    }

    // Plot each function
    const scope = buildScope(angleMode, ans, memory)
    expressions.forEach((expr, i) => {
      if (!expr?.trim()) return
      ctx.strokeStyle = PLOT_COLORS[i % PLOT_COLORS.length]
      ctx.lineWidth = 2
      ctx.beginPath()
      let first = true, prevY = null
      const steps = 500
      for (let j = 0; j <= steps; j++) {
        const x = xMin + xSpan * j / steps
        try {
          const y = Number(calcEval(expr, { ...scope, x }))
          if (!isFinite(y) || Math.abs(y) > 1e8) { first = true; prevY = null; continue }
          // Discontinuity detection
          if (prevY !== null && Math.abs(y - prevY) > ySpan * 2) { first = true }
          prevY = y
          const [cx, cy] = toC(x, y)
          if (first) { ctx.moveTo(cx, cy); first = false }
          else ctx.lineTo(cx, cy)
        } catch { first = true; prevY = null }
      }
      ctx.stroke()
    })
  }, [expressions, xMin, xMax, yMin, yMax, angleMode, memory, ans, dark])

  return (
    <canvas
      ref={canvasRef}
      width={332}
      height={200}
      style={{ width: '100%', display: 'block' }}
    />
  )
}

// ─── Formula library data ───────────────────────────────────────────────────────
const FORMULA_LIBRARY = {
  machinist: [
    { name: 'SFM (Surface Feet/Min)', formula: '(pi * D * RPM) / 12', desc: 'D=diameter(in), RPM=spindle speed' },
    { name: 'RPM from SFM', formula: '(SFM * 12) / (pi * D)', desc: 'SFM=cutting speed, D=diameter(in)' },
    { name: 'Feed Rate (in/min)', formula: 'RPM * FPT * Z', desc: 'FPT=feed per tooth, Z=flute count' },
    { name: 'Metric Cutting Speed', formula: '(pi * D * RPM) / 1000', desc: 'D=diameter(mm), result in m/min' },
    { name: 'Taper per Foot', formula: '(D1 - D2) / L * 12', desc: 'D1,D2=diameters(in), L=length(in)' },
    { name: 'Thread Pitch', formula: '1 / TPI', desc: 'TPI=threads per inch' },
    { name: 'Tap Drill Diameter', formula: 'D - (1 / TPI)', desc: 'D=major diameter(in), TPI=threads/in' },
    { name: 'Bolt Circle X', formula: 'BCR * cos(2*pi*k/n)', desc: 'BCR=radius, k=hole index (0-based), n=total holes' },
    { name: 'Bolt Circle Y', formula: 'BCR * sin(2*pi*k/n)', desc: 'BCR=radius, k=hole index (0-based), n=total holes' },
    { name: 'Drill Point Length', formula: 'D / (2 * tan(59 * pi/180))', desc: 'D=drill diameter (118° point angle)' },
    { name: 'Dovetail Width (top)', formula: 'W + 2 * D * (1 / tan(A * pi/180))', desc: 'W=slot bottom, D=depth, A=angle(deg)' },
    { name: 'Material Removal Rate', formula: 'DOC * WOC * FR', desc: 'DOC=depth, WOC=width, FR=feed rate (in³/min)' },
  ],
  math: [
    { name: 'Quadratic (+)', formula: '(-B + sqrt(B^2 - 4*A*C)) / (2*A)', desc: 'Ax²+Bx+C=0' },
    { name: 'Quadratic (−)', formula: '(-B - sqrt(B^2 - 4*A*C)) / (2*A)', desc: 'Ax²+Bx+C=0' },
    { name: 'Distance (2D)', formula: 'sqrt((x2-x1)^2 + (y2-y1)^2)', desc: '' },
    { name: 'Midpoint X', formula: '(x1 + x2) / 2', desc: '' },
    { name: 'Midpoint Y', formula: '(y1 + y2) / 2', desc: '' },
    { name: 'Slope', formula: '(y2 - y1) / (x2 - x1)', desc: '' },
    { name: 'Circle Area', formula: 'pi * r^2', desc: '' },
    { name: 'Circle Circumference', formula: '2 * pi * r', desc: '' },
    { name: 'Sphere Volume', formula: '(4/3) * pi * r^3', desc: '' },
    { name: 'Triangle Area', formula: '(b * h) / 2', desc: 'base × height ÷ 2' },
    { name: "Heron's Formula", formula: 'sqrt(s*(s-a)*(s-b)*(s-c))', desc: 's=(a+b+c)/2' },
    { name: 'Compound Interest', formula: 'P * (1 + r/n)^(n*t)', desc: 'P=principal, r=annual rate, n=periods/yr, t=years' },
    { name: 'Logarithm Change of Base', formula: 'ln(x) / ln(b)', desc: 'log_b(x)' },
    { name: 'Permutations nPr', formula: 'factorial(n) / factorial(n - r)', desc: 'ordered selections' },
    { name: 'Combinations nCr', formula: 'factorial(n) / (factorial(r) * factorial(n-r))', desc: 'unordered selections' },
  ],
  trig: [
    { name: 'Hypotenuse', formula: 'sqrt(a^2 + b^2)', desc: 'Pythagorean theorem' },
    { name: 'Sine Rule: side b', formula: 'a * sin(B) / sin(A)', desc: 'a/sinA = b/sinB (angles in rad)' },
    { name: 'Cosine Rule: side c', formula: 'sqrt(a^2 + b^2 - 2*a*b*cos(C))', desc: 'C in radians' },
    { name: 'Angle from 3 sides', formula: 'acos((a^2 + b^2 - c^2) / (2*a*b))', desc: 'angle C opposite side c' },
    { name: 'Opposite from angle+hyp', formula: 'H * sin(A)', desc: 'H=hypotenuse, A in radians' },
    { name: 'Adjacent from angle+hyp', formula: 'H * cos(A)', desc: 'H=hypotenuse, A in radians' },
    { name: 'Arc Length', formula: 'r * theta', desc: 'r=radius, theta in radians' },
    { name: 'Sector Area', formula: '0.5 * r^2 * theta', desc: 'theta in radians' },
    { name: 'Degrees → Radians', formula: 'deg * pi / 180', desc: '' },
    { name: 'Radians → Degrees', formula: 'rad * 180 / pi', desc: '' },
    { name: 'sin²+cos²=1 (check)', formula: 'sin(x)^2 + cos(x)^2', desc: 'should equal 1 for any x' },
  ],
  physics: [
    { name: 'Force', formula: 'm * a', desc: 'F=ma, m=kg, a=m/s²' },
    { name: 'Kinetic Energy', formula: '0.5 * m * v^2', desc: 'J, m=kg, v=m/s' },
    { name: 'Potential Energy', formula: 'm * 9.81 * h', desc: 'J, m=kg, h=m' },
    { name: 'Final Velocity', formula: 'v0 + a * t', desc: 'v=v0+at' },
    { name: 'Displacement', formula: 'v0 * t + 0.5 * a * t^2', desc: 's=v₀t+½at²' },
    { name: 'Velocity² (no time)', formula: 'sqrt(v0^2 + 2 * a * s)', desc: 'v²=v₀²+2as' },
    { name: "Ohm's Law: Voltage", formula: 'I * R', desc: 'V=IR, I=amps, R=ohms' },
    { name: 'Electric Power', formula: 'V * I', desc: 'W=V·I' },
    { name: 'Ideal Gas Law: Pressure', formula: '(n * 8.314 * T) / V', desc: 'n=mol, T=Kelvin, V=m³, R=8.314' },
    { name: 'Wave Speed', formula: 'freq * wavelength', desc: 'v=fλ' },
    { name: 'Gravitational Force', formula: '(6.674e-11 * m1 * m2) / r^2', desc: 'Newton gravity law' },
    { name: 'Pressure', formula: 'F / A', desc: 'Pa, F=N, A=m²' },
  ],
}

// ─── TI Calc main component ───────────────────────────────────────────────────

export default function TICalc({ onClose }) {
  const dark = useIsDark()

  // ── Core calc state ──
  const [tab, setTab]         = useState('calc')
  const [expr, setExpr]       = useState('')
  const [result, setResult]   = useState('')
  const [error, setError]     = useState('')
  const [history, setHistory] = useState([])
  const [memory, setMemory]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('oc_memory') ?? '{}') } catch { return {} }
  })  // { A: 5, B: 3.14, ... } — numbers only
  const [formulas, setFormulas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('oc_formulas') ?? '{}') } catch { return {} }
  })  // { f1: 'x^2-3x', f2: 'sin(x)', ... } — f1–f10 slots
  const [angleMode, setAngleMode] = useState('RAD')
  const [ans, setAns]         = useState(0)
  const [second, setSecond]   = useState(false)
  const [stoMode, setStoMode] = useState(false)   // false | 'num' | 'formula'
  const [histIdx, setHistIdx] = useState(-1)

  // ── Graph tab state ──
  const [yExprs, setYExprs] = useState(['', '', ''])
  const [xMin, setXMin] = useState(-10); const [xMax, setXMax] = useState(10)
  const [yMin, setYMin] = useState(-10); const [yMax, setYMax] = useState(10)

  // ── Table tab state ──
  const [tableExpr, setTableExpr] = useState('')
  const [tblStart, setTblStart]   = useState(-5)
  const [tblStep, setTblStep]     = useState(1)

  // ── Tools tab state ──
  const [toolMode, setToolMode]     = useState('nDeriv')
  const [toolExpr, setToolExpr]     = useState('')
  const [toolX, setToolX]           = useState('0')
  const [toolA, setToolA]           = useState('0')
  const [toolB, setToolB]           = useState('1')
  const [toolResult, setToolResult] = useState('')
  const [toolError, setToolError]   = useState('')

  // ── Forms tab state ──
  const [formsSubTab, setFormsSubTab] = useState('machinist')

  // ── Draggable position (desktop only) ──
  const [pos, setPos] = useState(() => ({
    x: Math.max(16, window.innerWidth - 400),
    y: Math.max(16, Math.round((window.innerHeight - 620) / 2)),
  }))
  const isMobile = window.innerWidth < 640
  const dragging   = useRef(false)
  const dragOrigin = useRef({ mx: 0, my: 0, px: 0, py: 0 })
  const inputRef   = useRef(null)

  const startDrag = (e) => {
    e.preventDefault()
    dragging.current = true
    dragOrigin.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
  }

  useEffect(() => {
    const move = (e) => {
      if (!dragging.current) return
      const dx = e.clientX - dragOrigin.current.mx
      const dy = e.clientY - dragOrigin.current.my
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 360, dragOrigin.current.px + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 80, dragOrigin.current.py + dy)),
      })
    }
    const up = () => { dragging.current = false }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [])

  // ── Persist memory + formulas to localStorage ──
  useEffect(() => { localStorage.setItem('oc_memory', JSON.stringify(memory)) }, [memory])
  useEffect(() => { localStorage.setItem('oc_formulas', JSON.stringify(formulas)) }, [formulas])

  // ── Auto-focus input when on calc tab ──
  useEffect(() => {
    if (tab === 'calc' && inputRef.current) inputRef.current.focus()
  }, [tab])

  // ── Keyboard input while calc is focused ──
  const calcRef = useRef(null)
  useEffect(() => {
    const handler = (e) => {
      if (!calcRef.current) return
      // Only intercept when calc is in scope and not typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (!calcRef.current.contains(document.activeElement) && document.activeElement !== document.body) return
      if (tab !== 'calc') return
      const k = e.key
      if (k === 'Enter') { e.preventDefault(); execute(); return }
      if (k === 'Backspace') { e.preventDefault(); setExpr(p => p.slice(0, -1)); return }
      if (k === 'Escape') { onClose(); return }
      if (/^[0-9+\-*.\/()^.,]$/.test(k)) {
        e.preventDefault()
        e.stopPropagation()
        setExpr(p => p + k)
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [tab, expr, ans, angleMode, memory])

  // ── Evaluate ──
  const execute = useCallback(() => {
    if (!expr.trim()) return
    try {
      const s = buildScope(angleMode, ans, memory)
      const r = calcEval(expr, s)
      const rNum = typeof r === 'number' ? r : Number(r)
      const rStr = fmtNum(rNum)
      setResult(rStr)
      setError('')
      if (isFinite(rNum)) setAns(rNum)
      setHistory(prev => [{ expr, result: rStr }, ...prev].slice(0, 30))
      setExpr('')
      setHistIdx(-1)
    } catch {
      setError('Syntax Error')
      setResult('')
    }
  }, [expr, angleMode, ans, memory])

  // ── Button press ──
  const press = useCallback((val) => {
    // Handle STO mode: letter = store number, fN = store formula
    if (stoMode === 'num' && /^[A-Z]$/.test(val)) {
      // Evaluate current expr if present, otherwise fall back to ans
      let storeVal = ans
      if (expr.trim()) {
        try {
          const s = buildScope(angleMode, ans, memory)
          const r = Number(calcEval(expr.trim(), s))
          if (isFinite(r)) storeVal = r
        } catch {}
      }
      if (isFinite(storeVal)) {
        setMemory(prev => ({ ...prev, [val]: storeVal }))
        setResult(fmtNum(storeVal))
        setExpr('')
        setHistIdx(-1)
      }
      setStoMode(false)
      setTimeout(() => inputRef.current?.focus(), 20)
      return
    }
    if (stoMode === 'formula' && /^f([1-9]|10)$/.test(val)) {
      if (expr.trim()) {
        setFormulas(prev => ({ ...prev, [val]: expr.trim() }))
        setExpr('')
        setResult('')
      }
      setStoMode(false)
      setTimeout(() => inputRef.current?.focus(), 20)
      return
    }
    if (stoMode) { setStoMode(false); return }  // Cancel on anything else

    // f1-f10: load formula (when not in stoMode)
    if (/^f([1-9]|10)$/.test(val)) {
      if (formulas[val]) { setExpr(formulas[val]); setTimeout(() => inputRef.current?.focus(), 20) }
      return
    }

    setSecond(false)
    // Operator after result seeds 'ans'
    const OPS = ['+', '-', '×', '÷', '−', '*', '/', '^']
    if (!expr.trim() && result && OPS.includes(val)) {
      setExpr('ans' + val)
      return
    }
    switch (val) {
      case '=':      execute(); break
      case 'DEL':    setExpr(p => p.slice(0, -1)); break
      case 'AC':     setExpr(''); setResult(''); setError(''); setStoMode(false); break
      case 'ANS':    setExpr(p => p + 'ans'); break
      case 'STO→':  setStoMode('num'); break
      case 'STOƒ':  if (expr.trim()) setStoMode('formula'); break
      case '2ND':    setSecond(s => !s); return
      case 'π':      setExpr(p => p + 'pi'); break
      case 'ℇ':      setExpr(p => p + 'e'); break
      case 'x²':     setExpr(p => p + '^2'); break
      case '10^x':   setExpr(p => p + '10^('); break
      case 'eˣ':     setExpr(p => p + 'e^('); break
      case '1/x':    setExpr(p => p + '1/('); break
      case '(−)':    setExpr(p => p + '(-'); break
      case ')': {
        // Auto-balance: if no unmatched '(' in expr, insert '(' first
        const open  = (expr.match(/\(/g) || []).length
        const close = (expr.match(/\)/g) || []).length
        setExpr(p => (open <= close ? p + '(' : p) + ')')
        break
      }
      // auto-open-paren functions
      default:
        if (['sin','cos','tan','asin','acos','atan','ln','log','sqrt','abs','floor','ceil','round'].includes(val)) {
          setExpr(p => p + val + '(')
        } else {
          setExpr(p => p + val)
        }
    }
  }, [stoMode, expr, result, execute, formulas])

  // ── History key navigation ──
  const handleInputKey = useCallback((e) => {
    if (e.key === 'Enter') { e.preventDefault(); execute(); return }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(histIdx + 1, history.length - 1)
      setHistIdx(next)
      if (next >= 0 && history[next]) setExpr(history[next].expr)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(histIdx - 1, -1)
      setHistIdx(next)
      if (next >= 0 && history[next]) setExpr(history[next].expr)
      else setExpr('')
      return
    }
  }, [execute, history, histIdx])

  // ── Fraction ↔ Decimal toggle ──
  const handleFrac = useCallback(() => {
    if (!result) return
    try {
      if (result.includes('/')) {
        const parts = result.split('/')
        const num = parseFloat(parts[0])
        const den = parseFloat(parts[1])
        if (!isNaN(num) && !isNaN(den) && den !== 0) setResult(fmtNum(num / den))
      } else {
        const n = parseFloat(result)
        if (isNaN(n)) return
        const f = mathFraction(n)
        if (f.d === 1) return // already integer
        if (f.d > 9999) { setResult('No simple fraction'); return }
        const sign = f.s < 0 ? '-' : ''
        setResult(`${sign}${f.n}/${f.d}`)
      }
    } catch {}
  }, [result])

  // ── Table rows ──
  const tableRows = useMemo(() => {
    if (!tableExpr.trim()) return []
    const s = buildScope(angleMode, ans, memory)
    return Array.from({ length: 22 }, (_, i) => {
      const x = tblStart + i * tblStep
      try {
        const y = Number(calcEval(tableExpr, { ...s, x }))
        return { x: parseFloat(x.toPrecision(8)), y: isFinite(y) ? fmtNum(y, 8) : 'undef' }
      } catch {
        return { x: parseFloat(x.toPrecision(8)), y: 'error' }
      }
    })
  }, [tableExpr, tblStart, tblStep, angleMode, ans, memory])

  // ── Run tool ──
  const runTool = () => {
    setToolError('')
    try {
      const s = buildScope(angleMode, ans, memory)
      let r
      if (toolMode === 'nDeriv') {
        r = nDeriv(toolExpr, 'x', parseFloat(toolX), s)
      } else if (toolMode === 'fnInt') {
        r = fnInt(toolExpr, 'x', parseFloat(toolA), parseFloat(toolB), s)
      } else {
        r = solveZero(toolExpr, 'x', parseFloat(toolX), s)
      }
      if (!isFinite(r)) throw new Error('Result not finite')
      setToolResult(fmtNum(r))
      const rNum = parseFloat(r)
      if (!isNaN(rNum)) setAns(rNum)
    } catch (e) {
      setToolError(e.message ?? 'Error')
      setToolResult('')
    }
  }

  // ─── Styling helpers ──────────────────────────────────────────────────────
  const bg0   = dark ? 'bg-[#0d1117]' : 'bg-slate-100'
  const bg1   = dark ? 'bg-[#161b22]' : 'bg-white'
  const bg2   = dark ? 'bg-[#21262d]' : 'bg-slate-50'
  const bdr   = dark ? 'border-slate-700' : 'border-slate-300'
  const txt   = dark ? 'text-slate-100' : 'text-slate-900'
  const muted = dark ? 'text-slate-400' : 'text-slate-500'

  const inputCls = `w-full px-2 py-1.5 rounded-lg text-xs font-mono outline-none transition-colors
    ${dark ? 'bg-[#0d1117] border border-slate-600 text-slate-200 focus:border-indigo-400 placeholder:text-slate-600'
           : 'bg-white border border-slate-300 text-slate-800 focus:border-indigo-400 placeholder:text-slate-400'}`

  // Button factory
  const mkBtn = (label, variant, handler, extraCls = '') => {
    const variants = {
      num:     dark ? 'bg-[#30363d] hover:bg-[#3d444d] text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800',
      op:      'bg-indigo-600 hover:bg-indigo-500 text-white',
      fn:      dark ? 'bg-amber-600/80 hover:bg-amber-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-white',
      ctrl:    'bg-rose-600 hover:bg-rose-500 text-white',
      special: 'bg-teal-600 hover:bg-teal-500 text-white',
      enter:   'bg-emerald-600 hover:bg-emerald-500 text-white',
      mode:    dark ? 'bg-[#30363d] hover:bg-[#3d444d] text-slate-300' : 'bg-slate-300 hover:bg-slate-400 text-slate-700',
    }
    return (
      <button
        key={label}
        onMouseDown={(e) => { e.preventDefault(); handler() }}
        className={`flex items-center justify-center rounded-lg font-bold cursor-pointer
          active:scale-90 transition-all duration-75 text-[11px] leading-none
          ${variants[variant] ?? variants.num} ${extraCls}`}
        style={{ minHeight: 34 }}
      >
        {label}
      </button>
    )
  }

  // Letter rows for always-visible A-Z pad
  const LETTER_ROWS = ['ABCDEFG', 'HIJKLMN', 'OPQRSTU', 'VWXYZ']
  const renderLetterPad = () => (
    <div className={`border-t ${bdr} pt-1 pb-0.5 px-2 ${bg2}`}>
      {/* STO num mode banner */}
      {stoMode === 'num' && (
        <div className={`flex items-center justify-between mb-1 px-1 py-0.5 rounded-lg bg-teal-500/20`}>
          <span className="text-[9px] font-bold text-teal-400">
            ▶ Tap a letter to store {isFinite(ans) ? ans : '(calc first)'}
          </span>
          <button onMouseDown={e=>{e.preventDefault();setStoMode(false)}} className={`text-[9px] ${muted} hover:text-rose-400`}>✕</button>
        </div>
      )}
      {LETTER_ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-0.5 mb-0.5 justify-center">
          {row.split('').map(l => {
            const hasNum = memory[l] !== undefined
            const tip = hasNum ? `${l} = ${fmtNum(memory[l],5)} — click to insert` : l
            return (
              <button
                key={l}
                title={tip}
                onMouseDown={e => { e.preventDefault(); press(l) }}
                className={`flex-1 flex items-center justify-center rounded font-bold
                  cursor-pointer active:scale-90 transition-all duration-75 text-[11px] leading-none
                  ${stoMode === 'num' ? 'bg-indigo-500 hover:bg-indigo-400 text-white' :
                    dark ? 'bg-[#30363d] hover:bg-[#3d444d] text-slate-200'
                         : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}
                  ${hasNum ? 'ring-1 ring-teal-500' : ''}`}
                style={{ minHeight: 28 }}
              >
                {l}
                {hasNum && <span className="text-[6px] leading-none ml-px opacity-60">▴</span>}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )

  // ─── Trig rows based on 2ND ──────────────────────────────────────────────
  const TRIG_ROW = second
    ? [['asin','fn'],['acos','fn'],['atan','fn'],['10^x','fn'],['eˣ','fn']]
    : [['sin','fn'], ['cos','fn'], ['tan','fn'], ['log','fn'], ['ln','fn']]

  const FN_ROW = second
    ? [['x²','fn'], ['1/x','fn'], ['(−)','num'], ['π','fn'], ['ℇ','fn']]
    : [['sqrt','fn'],['abs','fn'], ['(−)','num'], ['π','fn'], ['ℇ','fn']]

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && (
        <div className="fixed inset-0 z-[1999] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      )}
    <div
      ref={calcRef}
      tabIndex={-1}
      className={`fixed z-[2000] rounded-2xl shadow-2xl border ${bdr} ${bg1} overflow-hidden`}
      style={isMobile
        ? { left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: Math.min(352, window.innerWidth - 16), maxHeight: '92dvh', overflowY: 'auto', outline: 'none' }
        : { left: pos.x, top: pos.y, width: 352, outline: 'none' }
      }
    >
      {/* ── Title bar ──────────────────────────────────────────────────── */}
      <div
        className={`flex items-center gap-2 px-3 py-2.5 ${bg0} cursor-move border-b ${bdr}`}
        onMouseDown={startDrag}
      >
        <span className="text-indigo-400 text-base select-none">⊞</span>
        <span className={`text-xs font-bold tracking-wide ${txt} flex-1`}>OpenCalc</span>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold
          ${angleMode === 'DEG' ? 'bg-amber-500 text-white' : `${bg2} ${muted}`}`}>
          {angleMode}
        </span>
        <button
          onClick={() => setAngleMode(m => m === 'RAD' ? 'DEG' : 'RAD')}
          className={`text-[9px] ${muted} hover:text-indigo-400 underline`}
        >
          toggle
        </button>
        <button onClick={onClose} className={`ml-1 p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 ${muted} hover:text-rose-500 transition-colors`} title="Close">×</button>
      </div>

      {/* ── Tab bar ────────────────────────────────────────────────────── */}
      <div className={`flex border-b ${bdr} ${bg0}`}>
        {[['calc','Calc'],['graph','Graph'],['table','Table'],['tools','Tools'],['forms','Forms']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
              tab === t
                ? 'text-indigo-400 border-b-2 border-indigo-500'
                : `${muted} hover:text-indigo-300`
            }`}>
            {l}
          </button>
        ))}
      </div>

      {/* ══ CALC TAB ═══════════════════════════════════════════════════════ */}
      {tab === 'calc' && (
        <div className="relative flex flex-col">
          {/* Display */}
          <div className={`${bg0} px-4 pt-3 pb-2 border-b ${bdr}`}>
            <input
              ref={inputRef}
              type="text"
              value={expr}
              onChange={e => setExpr(e.target.value)}
              onKeyDown={handleInputKey}
              className={`w-full bg-transparent font-mono text-xs outline-none mb-1 ${muted} placeholder:opacity-40`}
              placeholder="Type, paste, or use buttons below…"
              autoComplete="off"
              spellCheck={false}
            />
            <div className="flex items-end">
              {error
                ? <div className="font-mono text-lg font-bold text-rose-400 flex-1">{error}</div>
                : <div className={`font-mono text-2xl font-bold ${txt} flex-1 text-right`}>{result || '\u00a0'}</div>
              }
              {result && !error && (
                <button
                  onMouseDown={e => { e.preventDefault(); navigator.clipboard?.writeText(result) }}
                  className={`ml-2 text-base ${muted} hover:text-indigo-400 pb-0.5 shrink-0 leading-none`}
                  title="Copy result to clipboard"
                >⎘</button>
              )}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className={`${bg0} border-b ${bdr} max-h-[58px] overflow-y-auto`}>
              {history.slice(0, 6).map((h, i) => (
                <div key={i}
                  className={`flex justify-between items-baseline px-4 py-0.5 cursor-pointer
                    hover:bg-indigo-500/10 ${i === 0 ? 'opacity-70' : 'opacity-40'}`}
                  onClick={() => { setExpr(h.expr); setResult(h.result) }}
                >
                  <span className={`font-mono text-[10px] ${muted} truncate max-w-[180px]`}>{h.expr}</span>
                  <span className={`font-mono text-[10px] ${txt}`}>{h.result}</span>
                </div>
              ))}
            </div>
          )}

          {/* Variables table */}
          {Object.keys(memory).length > 0 && (
            <div className={`border-b ${bdr} ${bg0}`}>
              <div className={`text-[8px] font-bold uppercase tracking-widest ${muted} px-3 pt-1.5 pb-0.5`}>Variables</div>
              <table className="w-full text-[10px] font-mono">
                <tbody>
                  {Object.entries(memory).map(([k, v]) => (
                    <tr key={k}
                      className="cursor-pointer hover:bg-indigo-500/10"
                      onClick={() => setExpr(p => p + k)}
                      title={`Insert ${k}`}
                    >
                      <td className="text-teal-400 font-bold py-0.5 pl-3 pr-1 w-8">{k}</td>
                      <td className={`text-right py-0.5 px-2 flex-1 ${txt}`}>{fmtNum(v, 8)}</td>
                      <td className="py-0.5 pr-2 text-right w-6">
                        <button
                          onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setMemory(prev => { const n={...prev}; delete n[k]; return n }) }}
                          className={`${muted} hover:text-rose-400 leading-none`}
                          title={`Delete ${k}`}
                        >×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Formulas table */}
          {Object.keys(formulas).length > 0 && (
            <div className={`border-b ${bdr} ${bg0}`}>
              <div className={`text-[8px] font-bold uppercase tracking-widest ${muted} px-3 pt-1.5 pb-0.5`}>Formulas</div>
              <table className="w-full text-[10px] font-mono">
                <tbody>
                  {['f1','f2','f3','f4','f5','f6','f7','f8','f9','f10']
                    .filter(k => formulas[k])
                    .map(k => (
                      <tr key={k} className="group">
                        <td className="text-amber-400 font-bold py-0.5 pl-3 pr-1 w-8">{k}</td>
                        <td className={`py-0.5 px-2 ${muted} max-w-0`}>
                          <span className="block truncate">{formulas[k]}</span>
                        </td>
                        <td className="py-0.5 pr-1 text-right w-14">
                          <span className="inline-flex gap-1 items-center">
                            <button
                              onMouseDown={e => { e.preventDefault(); setExpr(formulas[k]); setTimeout(()=>inputRef.current?.focus(),20) }}
                              className="text-amber-400 hover:text-white"
                              title={`Load ${k}`}
                            >▶</button>
                            <button
                              onMouseDown={e => { e.preventDefault(); setFormulas(prev => { const n={...prev}; delete n[k]; return n }) }}
                              className={`${muted} hover:text-rose-400`}
                              title={`Delete ${k}`}
                            >×</button>
                          </span>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {/* Button grid */}
          <div className={`px-2 pt-2 pb-1 ${bg2} space-y-1`}>
            {/* Row 0: 2ND · DEL · AC · ( · ) */}
            <div className="grid grid-cols-5 gap-1">
              {mkBtn(second ? '2ND✓' : '2ND', second ? 'op' : 'mode', () => setSecond(s => !s))}
              {mkBtn('DEL', 'ctrl', () => press('DEL'))}
              {mkBtn('AC',  'ctrl', () => press('AC'))}
              {mkBtn('(',   'num',  () => press('('))}
              {mkBtn(')',   'num',  () => press(')'))}
            </div>

            {/* Trig row */}
            <div className="grid grid-cols-5 gap-1">
              {TRIG_ROW.map(([l, v]) => mkBtn(l, v, () => press(l)))}
            </div>

            {/* Fn row */}
            <div className="grid grid-cols-5 gap-1">
              {FN_ROW.map(([l, v]) => mkBtn(l, v, () => press(l)))}
            </div>

            {/* Number rows: ops on right, + and − in column */}
            <div className="grid grid-cols-5 gap-1">
              {[
                ['7','num'],['8','num'],['9','num'],['÷','op'],['^','op'],
                ['4','num'],['5','num'],['6','num'],['×','op'],['x²','fn'],
                ['1','num'],['2','num'],['3','num'],['−','op'],['+','op'],
              ].map(([l, v]) => mkBtn(l, v, () => press(l)))}
            </div>

            {/* Bottom row: 0 · . · ANS · ►Frac · = */}
            <div className="grid grid-cols-6 gap-1">
              <button
                onMouseDown={(e) => { e.preventDefault(); press('0') }}
                className={`col-span-2 flex items-center justify-center rounded-lg font-bold text-[11px]
                  cursor-pointer active:scale-90 transition-all duration-75
                  ${dark ? 'bg-[#30363d] hover:bg-[#3d444d] text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                style={{ minHeight: 34 }}
              >0</button>
              {mkBtn('.', 'num', () => press('.'))}
              {mkBtn('ANS', 'mode', () => press('ANS'))}
              {mkBtn('►Frac', 'special', handleFrac)}
              <button
                onMouseDown={(e) => { e.preventDefault(); execute() }}
                className="col-span-1 flex items-center justify-center rounded-lg font-bold text-sm
                  cursor-pointer active:scale-90 transition-all duration-75
                  bg-emerald-600 hover:bg-emerald-500 text-white"
                style={{ minHeight: 34 }}
              >=</button>
            </div>

            {/* STO row */}
            <div className="grid grid-cols-2 gap-1">
              {mkBtn('STO→', stoMode === 'num' ? 'op' : 'special', () => press('STO→'))}
              {mkBtn('STOƒ', stoMode === 'formula' ? 'fn' : 'special', () => press('STOƒ'))}
            </div>

            {/* f1–f5 / f6–f10 row */}
            <div className="grid grid-cols-5 gap-1">
              {(second
                ? ['f6','f7','f8','f9','f10']
                : ['f1','f2','f3','f4','f5']
              ).map(fk => {
                const stored = formulas[fk]
                const isActive = stoMode === 'formula'
                return (
                  <button
                    key={fk}
                    onMouseDown={e => { e.preventDefault(); press(fk) }}
                    title={stored ? (isActive ? `Save to ${fk}` : `Load: ${stored}`) : `Save to ${fk}`}
                    className={`flex flex-col items-center justify-center rounded-lg font-bold cursor-pointer
                      active:scale-90 transition-all duration-75 text-[10px] leading-tight
                      ${isActive
                        ? 'bg-amber-500 hover:bg-amber-400 text-white'
                        : stored
                          ? dark ? 'bg-amber-700/60 hover:bg-amber-600/80 text-amber-200' : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                          : dark ? 'bg-[#30363d] hover:bg-[#3d444d] text-slate-500' : 'bg-slate-200 hover:bg-slate-300 text-slate-400'
                      }`}
                    style={{ minHeight: 34 }}
                  >
                    <span>{fk}</span>
                    {stored && !isActive && <span className={`text-[7px] opacity-60 truncate w-full text-center px-0.5`}>{stored.length > 7 ? stored.slice(0,7)+'…' : stored}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Always-visible A–Z letter pad */}
          {renderLetterPad()}
        </div>
      )}

      {/* ══ GRAPH TAB ══════════════════════════════════════════════════════ */}
      {tab === 'graph' && (
        <div className={`p-3 ${bg2} space-y-3`}>
          {/* y= inputs */}
          <div className="space-y-1.5">
            {yExprs.map((e, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-mono w-8 shrink-0"
                  style={{ color: PLOT_COLORS[i] }}>y{i+1}=</span>
                <input
                  className={inputCls}
                  value={e}
                  onChange={ev => setYExprs(prev => prev.map((v, j) => j === i ? ev.target.value : v))}
                  placeholder="e.g. sin(x)"
                  spellCheck={false}
                />
              </div>
            ))}
          </div>

          {/* Window */}
          <div className="grid grid-cols-2 gap-1.5">
            {[['xMin',xMin,setXMin],['xMax',xMax,setXMax],['yMin',yMin,setYMin],['yMax',yMax,setYMax]]
              .map(([lbl, val, set]) => (
                <div key={lbl} className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-mono ${muted} w-10 text-right shrink-0`}>{lbl}</span>
                  <input type="number" className={inputCls} value={val}
                    onChange={e => set(parseFloat(e.target.value) || 0)} />
                </div>
            ))}
          </div>

          {/* Canvas */}
          <div className={`rounded-xl overflow-hidden border ${bdr}`}>
            <FunctionPlotter
              expressions={yExprs}
              xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax}
              angleMode={angleMode} memory={memory} ans={ans} dark={dark}
            />
          </div>

          {/* Zoom presets */}
          <div className="grid grid-cols-4 gap-1">
            {[
              ['±10', () => { setXMin(-10); setXMax(10); setYMin(-10); setYMax(10) }],
              ['±5',  () => { setXMin(-5);  setXMax(5);  setYMin(-5);  setYMax(5) }],
              ['±1',  () => { setXMin(-1);  setXMax(1);  setYMin(-1);  setYMax(1) }],
              ['Trig',() => { const p = Math.PI; setXMin(-2*p); setXMax(2*p); setYMin(-2); setYMax(2) }],
            ].map(([lbl, fn]) => (
              <button key={lbl} onClick={fn}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-colors
                  ${dark ? 'bg-[#30363d] hover:bg-[#3d444d] text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ TABLE TAB ══════════════════════════════════════════════════════ */}
      {tab === 'table' && (
        <div className={`p-3 ${bg2}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[11px] font-mono font-bold ${muted} shrink-0`}>f(x)=</span>
            <input className={inputCls} value={tableExpr} onChange={e => setTableExpr(e.target.value)}
              placeholder="x^2 - 3*x + 2" spellCheck={false} />
          </div>
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {[['Start', tblStart, setTblStart], ['ΔTbl', tblStep, setTblStep]].map(([lbl, val, set]) => (
              <div key={lbl} className="flex items-center gap-1.5">
                <span className={`text-[10px] font-mono ${muted} w-10 text-right shrink-0`}>{lbl}</span>
                <input type="number" className={inputCls} value={val}
                  onChange={e => set(parseFloat(e.target.value) || (lbl === 'ΔTbl' ? 1 : 0))} />
              </div>
            ))}
          </div>

          <div className={`rounded-xl overflow-hidden border ${bdr} max-h-[320px] overflow-y-auto`}>
            <table className="w-full text-[11px] font-mono">
              <thead className={`sticky top-0 ${bg0}`}>
                <tr>
                  <th className={`${muted} py-2 px-3 text-left font-bold`}>x</th>
                  <th className={`${muted} py-2 px-3 text-right font-bold`}>f(x)</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.length === 0
                  ? <tr><td colSpan={2} className={`${muted} text-center py-6 text-[10px]`}>Enter a function above</td></tr>
                  : tableRows.map((row, i) => (
                    <tr key={i} className={dark
                      ? (i % 2 === 0 ? 'bg-[#161b22]' : 'bg-[#0d1117]')
                      : (i % 2 === 0 ? 'bg-white' : 'bg-slate-50')}>
                      <td className={`${muted} py-1.5 px-3`}>{row.x}</td>
                      <td className={`py-1.5 px-3 text-right font-bold ${
                        row.y === 'undef' || row.y === 'error' ? 'text-rose-400' : txt
                      }`}>{row.y}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ TOOLS TAB ══════════════════════════════════════════════════════ */}
      {tab === 'tools' && (
        <div className={`p-3 ${bg2} space-y-3`}>
          {/* Mode selector */}
          <div className="grid grid-cols-3 gap-1">
            {[['nDeriv', "f '(x₀)"], ['fnInt', '∫ f dx'], ['solve', 'zero(f)']].map(([key, lbl]) => (
              <button key={key} onClick={() => { setToolMode(key); setToolResult(''); setToolError('') }}
                className={`py-2 rounded-xl text-[10px] font-bold transition-colors ${
                  toolMode === key
                    ? 'bg-indigo-600 text-white'
                    : `${dark ? 'bg-[#30363d] text-slate-400 hover:text-slate-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`
                }`}>
                {lbl}
              </button>
            ))}
          </div>

          {/* Description */}
          <div className={`text-[10px] ${muted} font-mono px-1`}>
            {toolMode === 'nDeriv' && "Numerical derivative f'(x) evaluated at x = x₀"}
            {toolMode === 'fnInt'  && 'Definite integral ∫ₐᵇ f(x) dx  (Simpson\'s rule, n=1000)'}
            {toolMode === 'solve'  && "Find x where f(x) = 0  (Newton's method from initial guess)"}
          </div>

          {/* f(x) */}
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono font-bold ${muted} shrink-0 w-12`}>f(x) =</span>
            <input className={inputCls} value={toolExpr} onChange={e => setToolExpr(e.target.value)}
              placeholder={toolMode === 'nDeriv' ? 'x^3 - x' : toolMode === 'fnInt' ? 'sin(x)' : 'x^2 - 2'}
              spellCheck={false} />
          </div>

          {/* Parameters */}
          {toolMode === 'nDeriv' && (
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono font-bold ${muted} shrink-0 w-12`}>x₀ =</span>
              <input type="number" className={inputCls} value={toolX} onChange={e => setToolX(e.target.value)} />
            </div>
          )}
          {toolMode === 'fnInt' && (
            <div className="grid grid-cols-2 gap-2">
              {[['a =', toolA, setToolA], ['b =', toolB, setToolB]].map(([lbl, v, set]) => (
                <div key={lbl} className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-mono font-bold ${muted} shrink-0`}>{lbl}</span>
                  <input type="number" className={inputCls} value={v} onChange={e => set(e.target.value)} />
                </div>
              ))}
            </div>
          )}
          {toolMode === 'solve' && (
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono font-bold ${muted} shrink-0 w-12`}>guess =</span>
              <input type="number" className={inputCls} value={toolX} onChange={e => setToolX(e.target.value)} />
            </div>
          )}

          {/* Run button */}
          <button onClick={runTool}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors">
            {toolMode === 'nDeriv' ? "Compute f'(x₀)" : toolMode === 'fnInt' ? 'Compute ∫' : 'Find Zero'}
          </button>

          {/* Result */}
          {(toolResult || toolError) && (
            <div className={`rounded-xl p-3 border ${bdr} ${bg0}`}>
              <div className={`text-[10px] ${muted} font-mono mb-1`}>
                {toolMode === 'nDeriv' && `f'(${toolX}) =`}
                {toolMode === 'fnInt'  && `∫₍${toolA}₎^₍${toolB}₎ f(x) dx =`}
                {toolMode === 'solve'  && 'x ='}
              </div>
              {toolError
                ? <div className="text-rose-400 font-mono text-sm">{toolError}</div>
                : <div className={`${txt} text-xl font-bold font-mono`}>{toolResult}</div>
              }
            </div>
          )}

          {/* Quick reference */}
          <div className={`rounded-xl p-2.5 ${bg0} border ${bdr} text-[9px] font-mono ${muted}`}>
            <div className="font-bold text-slate-400 mb-1">Functions: (use x as variable)</div>
            <div>sin  cos  tan  asin  acos  atan</div>
            <div>ln  log  sqrt  abs  floor  ceil</div>
            <div className="mt-1">π → <span className="text-indigo-400">pi</span> &nbsp;
              e → <span className="text-indigo-400">e</span> &nbsp;
              last → <span className="text-indigo-400">ans</span></div>
          </div>
        </div>
      )}

      {/* ══ FORMS TAB ══════════════════════════════════════════════════════ */}
      {tab === 'forms' && (
        <div className={`${bg2} flex flex-col`}>
          {/* Sub-tab bar */}
          <div className={`flex border-b ${bdr} ${bg0}`}>
            {[['machinist','Machinist'],['math','Math'],['trig','Trig'],['physics','Physics']].map(([k,l]) => (
              <button key={k} onClick={() => setFormsSubTab(k)}
                className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                  formsSubTab === k
                    ? 'text-indigo-400 border-b-2 border-indigo-500'
                    : `${muted} hover:text-indigo-300`
                }`}>
                {l}
              </button>
            ))}
          </div>
          {/* Formula list */}
          <div className="overflow-y-auto" style={{ maxHeight: 360 }}>
            {(FORMULA_LIBRARY[formsSubTab] || []).map((item, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-2 border-b ${bdr} last:border-b-0`}>
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] font-bold ${txt} leading-tight`}>{item.name}</div>
                  <div className="text-[10px] font-mono text-indigo-400 leading-tight truncate">{item.formula}</div>
                  {item.desc && <div className={`text-[9px] ${muted} leading-tight`}>{item.desc}</div>}
                </div>
                <button
                  onMouseDown={e => {
                    e.preventDefault()
                    setExpr(item.formula)
                    setTab('calc')
                    setTimeout(() => inputRef.current?.focus(), 50)
                  }}
                  className="shrink-0 text-[9px] px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors"
                >
                  Use
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  )
}
