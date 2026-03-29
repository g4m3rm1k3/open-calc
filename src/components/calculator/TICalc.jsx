import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { evaluate as mathEval } from 'mathjs'

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
  const scope = { ans, Ans: ans, pi: Math.PI, e: Math.E, ...memory }
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

// ─── TI Calc main component ───────────────────────────────────────────────────

export default function TICalc({ onClose }) {
  const dark = useIsDark()

  // ── Core calc state ──
  const [tab, setTab]         = useState('calc')
  const [expr, setExpr]       = useState('')
  const [result, setResult]   = useState('')
  const [error, setError]     = useState('')
  const [history, setHistory] = useState([])
  const [memory, setMemory]   = useState({})
  const [angleMode, setAngleMode] = useState('RAD')
  const [ans, setAns]         = useState(0)
  const [second, setSecond]   = useState(false)
  const [stoMode, setStoMode] = useState(false)

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

  // ── Draggable position ──
  const [pos, setPos] = useState(() => ({
    x: Math.max(16, window.innerWidth - 400),
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
    } catch {
      setError('Syntax Error')
      setResult('')
    }
  }, [expr, angleMode, ans, memory])

  // ── Button press ──
  const press = useCallback((val) => {
    if (stoMode) {
      if (/^[A-Z]$/.test(val)) {
        const n = parseFloat(result)
        if (!isNaN(n)) setMemory(prev => ({ ...prev, [val]: n }))
      }
      setStoMode(false)
      return
    }
    setSecond(false)
    switch (val) {
      case '=':      execute(); break
      case 'DEL':    setExpr(p => p.slice(0, -1)); break
      case 'AC':     setExpr(''); setResult(''); setError(''); break
      case 'ANS':    setExpr(p => p + 'ans'); break
      case 'STO→':   setStoMode(true); break
      case '2ND':    setSecond(s => !s); return
      case 'π':      setExpr(p => p + 'pi'); break
      case 'ℇ':      setExpr(p => p + 'e'); break
      case 'x²':     setExpr(p => p + '^2'); break
      case '10^x':   setExpr(p => p + '10^('); break
      case 'eˣ':     setExpr(p => p + 'e^('); break
      case '1/x':    setExpr(p => p + '1/('); break
      case '(−)':    setExpr(p => p + '(-'); break
      // auto-open-paren functions
      default:
        if (['sin','cos','tan','asin','acos','atan','ln','log','sqrt','abs','floor','ceil','round'].includes(val)) {
          setExpr(p => p + val + '(')
        } else {
          setExpr(p => p + val)
        }
    }
  }, [stoMode, result, execute])

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

  // STO mode — show A-Z pad
  const stoOverlay = stoMode && (
    <div className={`absolute inset-x-0 bottom-0 ${bg0} border-t ${bdr} p-3 z-10`}>
      <p className={`text-[10px] font-bold ${muted} mb-2`}>Store {result || '(no result)'} to variable:</p>
      <div className="grid grid-cols-9 gap-1">
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l =>
          mkBtn(l, 'fn', () => press(l))
        )}
        {mkBtn('Cancel', 'ctrl', () => setStoMode(false), 'col-span-8')}
      </div>
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
    <div
      ref={calcRef}
      tabIndex={-1}
      className={`fixed z-[2000] rounded-2xl shadow-2xl border ${bdr} ${bg1} overflow-hidden`}
      style={{ left: pos.x, top: pos.y, width: 352, outline: 'none' }}
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
        <button onClick={onClose} className={`ml-1 text-lg leading-none ${muted} hover:text-rose-400`}>×</button>
      </div>

      {/* ── Tab bar ────────────────────────────────────────────────────── */}
      <div className={`flex border-b ${bdr} ${bg0}`}>
        {[['calc','Calc'],['graph','Graph'],['table','Table'],['tools','Tools']].map(([t, l]) => (
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
            <div className={`font-mono text-xs ${muted} min-h-[16px] truncate mb-1`}>{expr || '\u00a0'}</div>
            {error
              ? <div className="font-mono text-lg font-bold text-rose-400">{error}</div>
              : <div className={`font-mono text-2xl font-bold ${txt} text-right`}>{result || '\u00a0'}</div>
            }
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

          {/* Memory readout */}
          {Object.keys(memory).length > 0 && (
            <div className={`flex flex-wrap gap-x-3 gap-y-0.5 px-4 py-1.5 border-b ${bdr} ${bg0}`}>
              {Object.entries(memory).map(([k, v]) => (
                <span key={k}
                  className="text-[10px] font-mono text-teal-400 cursor-pointer hover:text-teal-300"
                  onClick={() => setExpr(p => p + k)}
                  title={`Click to insert ${k}`}
                >
                  {k}={fmtNum(v, 5)}
                </span>
              ))}
            </div>
          )}

          {/* Button grid */}
          <div className={`p-2 ${bg2} space-y-1`}>
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

            {/* Number/op rows */}
            <div className="grid grid-cols-5 gap-1">
              {[
                ['7','num'],['8','num'],['9','num'],['÷','op'],['^','op'],
                ['4','num'],['5','num'],['6','num'],['×','op'],['ANS','mode'],
                ['1','num'],['2','num'],['3','num'],['−','op'],['STO→','special'],
              ].map(([l, v]) => mkBtn(l, v, () => press(l)))}
            </div>

            {/* Last row: 0 · . · + · = */}
            <div className="grid grid-cols-5 gap-1">
              <button
                onMouseDown={(e) => { e.preventDefault(); press('0') }}
                className={`col-span-2 flex items-center justify-center rounded-lg font-bold text-[11px]
                  cursor-pointer active:scale-90 transition-all duration-75
                  ${dark ? 'bg-[#30363d] hover:bg-[#3d444d] text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                style={{ minHeight: 34 }}
              >0</button>
              {mkBtn('.', 'num', () => press('.'))}
              {mkBtn('+', 'op',  () => press('+'))}
              <button
                onMouseDown={(e) => { e.preventDefault(); execute() }}
                className="col-span-1 flex items-center justify-center rounded-lg font-bold text-sm
                  cursor-pointer active:scale-90 transition-all duration-75
                  bg-emerald-600 hover:bg-emerald-500 text-white"
                style={{ minHeight: 34 }}
              >=</button>
            </div>
          </div>

          {/* STO overlay */}
          {stoOverlay}
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
    </div>
  )
}
