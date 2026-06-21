import { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import katex from 'katex'
import {
  fmtNum, buildScope, calcEval, nDeriv, fnInt, solveZero,
  parseMatrix, hasNaN, matLatex, vecLatex, toFrac,
  solveRREF, solveDeterminant, solveInverse, solveTranspose, solveTrace,
  solveRank, solveNullSpace, solveColumnSpace, solveLU, solveEigenvalues,
  solveQR, solveSVD, solveGramSchmidt, solveConditionNumber, solveMatrixPower,
  solveCharPoly, solveMultiply, solveAdd, solveSubtract, solveScalarMul,
  solveDot, solveCross, solveNorm, solveLinearSystem, solveProjection, solveLeastSquares,
  safeEval, CLOSED_FORMS, matchClosedForm,
  polyEvalAt, findRoots, detectDegree, buildQuadSteps,
  solveStats, PHYSICS_FORMULAS, MACHINIST_FORMULAS, generateCode, EXPLANATIONS, CONNECTIONS,
  identity, transpose, matMul,
  solveBasis, solveLinearIndependence, solveSimilarity, solveSpan,
  simplifyExpr, expandExpr,
} from './mathEngines.js'
import { executeScript as openmatExec } from '../../engines/openmat/openmatEngine.js'

// ─── Monaco lazy load ─────────────────────────────────────────────────────────
const MonacoEditor = lazy(() => import('@monaco-editor/react').then(m => ({ default: m.default })))

// ─── KaTeX renderer ───────────────────────────────────────────────────────────
function KatexStep({ label, latex }) {
  const bodyHtml = useMemo(() => {
    try { return katex.renderToString(latex, { displayMode: true, throwOnError: false, trust: false, strict: false }) }
    catch { return `<span style="color:#f87171">[LaTeX error: ${latex?.slice(0,40)}]</span>` }
  }, [latex])
  const labelHtml = useMemo(() => {
    if (!label) return null
    // Render label as inline KaTeX if it contains LaTeX commands or math notation
    if (label.includes('\\') || /[_^{}]/.test(label)) {
      try { return katex.renderToString(label, { displayMode: false, throwOnError: false, trust: false, strict: false }) }
      catch { return null }
    }
    return null
  }, [label])
  return (
    <div className="mb-2">
      {label && (
        <div className="text-xs text-slate-400 mb-1 font-mono">
          {labelHtml
            ? <span dangerouslySetInnerHTML={{ __html: labelHtml }} />
            : label}
        </div>
      )}
      <div className="text-center overflow-x-auto" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </div>
  )
}

function KatexInline({ expr }) {
  const html = useMemo(() => {
    try { return katex.renderToString(expr, { displayMode: false, throwOnError: false, trust: false, strict: false }) }
    catch { return expr }
  }, [expr])
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

// ─── LOCAL STORAGE ────────────────────────────────────────────────────────────
const LS_VARS = 'oc_memory'
const LS_FORMULAS = 'oc_formulas'
const LS_SCRIPTS = 'oc_scripts'
const LS_HISTORY = 'oc_math_os_history'

function loadVars() { try { return JSON.parse(localStorage.getItem(LS_VARS) || '{}') } catch { return {} } }
function saveVars(v) { localStorage.setItem(LS_VARS, JSON.stringify(v)) }
function loadFormulas() { try { return JSON.parse(localStorage.getItem(LS_FORMULAS) || '{}') } catch { return {} } }
function saveFormulas(f) { localStorage.setItem(LS_FORMULAS, JSON.stringify(f)) }
function loadScripts() { try { return JSON.parse(localStorage.getItem(LS_SCRIPTS) || '{}') } catch { return {} } }
function saveScripts(s) { localStorage.setItem(LS_SCRIPTS, JSON.stringify(s)) }
function loadHistory() { try { return JSON.parse(localStorage.getItem(LS_HISTORY) || '[]') } catch { return [] } }
function saveHistory(h) { localStorage.setItem(LS_HISTORY, JSON.stringify(h.slice(-100))) }
const LS_MAT_VARS = 'oc_mat_vars'
function loadMatVars() { try { return JSON.parse(localStorage.getItem(LS_MAT_VARS) || '{}') } catch { return {} } }
function saveMatVars(v) { localStorage.setItem(LS_MAT_VARS, JSON.stringify(v)) }

// ─── MATRIX INPUT COMPONENT ───────────────────────────────────────────────────
function MatrixInput({ matrix, onChange, label = 'A' }) {
  const rows = matrix.length
  const cols = matrix[0]?.length ?? 1

  function resize(newRows, newCols) {
    onChange(Array.from({ length: newRows }, (_, r) =>
      Array.from({ length: newCols }, (_, c) => matrix[r]?.[c] ?? '0')
    ))
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs font-bold text-blue-300 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded">{label}</span>
        <span className="text-xs text-slate-400 font-mono">{rows}×{cols}</span>
        {[2,3,4,5].map(n => (
          <button key={n} onClick={() => resize(n, n)}
            className={`text-[11px] px-2 py-0.5 rounded-md transition-all font-semibold ${rows===n&&cols===n?'bg-blue-500/20 text-blue-300 border border-blue-500/30':'bg-white/5 hover:bg-white/10 text-slate-400 border border-transparent'}`}>
            {n}²
          </button>
        ))}
        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-slate-500 font-semibold uppercase tracking-wider">R</span>
          <button onClick={() => resize(Math.max(1, rows-1), cols)} className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 flex items-center justify-center leading-none transition-colors">−</button>
          <button onClick={() => resize(Math.min(6, rows+1), cols)} className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 flex items-center justify-center leading-none transition-colors">+</button>
          <span className="text-slate-500 ml-1 font-semibold uppercase tracking-wider">C</span>
          <button onClick={() => resize(rows, Math.max(1, cols-1))} className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 flex items-center justify-center leading-none transition-colors">−</button>
          <button onClick={() => resize(rows, Math.min(6, cols+1))} className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 flex items-center justify-center leading-none transition-colors">+</button>
        </div>
        <button onClick={() => onChange(matrix.map(r => r.map(() => '0')))}
          className="text-[11px] font-semibold px-2 py-0.5 rounded hover:bg-red-500/10 hover:text-red-400 text-slate-500 ml-auto transition-colors">clear</button>
      </div>
      <div className="inline-flex flex-col gap-1.5 p-3 bg-black/20 rounded-xl border border-white/5 shadow-inner">
        {matrix.map((row, r) => (
          <div key={r} className="flex gap-1.5">
            {row.map((cell, c) => (
              <input key={c} value={cell}
                onChange={e => { const m = matrix.map(r2=>[...r2]); m[r][c]=e.target.value; onChange(m) }}
                className="w-12 h-9 text-center text-sm bg-white/5 border border-white/10 rounded-lg text-white font-mono focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 focus:bg-white/10 focus:outline-none transition-all shadow-inner" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── CANVAS GRAPH ─────────────────────────────────────────────────────────────
const GRAPH_COLORS = ['#60a5fa','#34d399','#f472b6','#fb923c']
function CanvasGraph({ fns = [], xMin = -10, xMax = 10, yMin = -10, yMax = 10, width = 860, height = 320, highlightRoots = [] }) {
  const ref = useRef()
  const [trace, setTrace] = useState(null)

  const toCanvasX = useCallback((x) => ((x - xMin) / (xMax - xMin)) * width, [xMin, xMax, width])
  const toCanvasY = useCallback((y) => height - ((y - yMin) / (yMax - yMin)) * height, [yMin, yMax, height])

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const toX = x => ((x - xMin) / (xMax - xMin)) * W
    const toY = y => H - ((y - yMin) / (yMax - yMin)) * H
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H)
    // Grid
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1
    const stepX = (xMax - xMin) / 10
    for (let x = Math.ceil(xMin/stepX)*stepX; x <= xMax + stepX*0.01; x += stepX) { ctx.beginPath(); ctx.moveTo(toX(x),0); ctx.lineTo(toX(x),H); ctx.stroke() }
    const stepY = (yMax - yMin) / 10
    for (let y = Math.ceil(yMin/stepY)*stepY; y <= yMax + stepY*0.01; y += stepY) { ctx.beginPath(); ctx.moveTo(0,toY(y)); ctx.lineTo(W,toY(y)); ctx.stroke() }
    // Axes
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(toX(0),0); ctx.lineTo(toX(0),H); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0,toY(0)); ctx.lineTo(W,toY(0)); ctx.stroke()
    // Axis tick labels
    ctx.fillStyle = '#475569'; ctx.font = '10px monospace'; ctx.textAlign = 'center'
    for (let x = Math.ceil(xMin/stepX)*stepX; x <= xMax + stepX*0.01; x += stepX) {
      if (Math.abs(x) > stepX*0.1) ctx.fillText(parseFloat(x.toPrecision(3)), toX(x), toY(0)+12)
    }
    ctx.textAlign = 'right'
    for (let y = Math.ceil(yMin/stepY)*stepY; y <= yMax + stepY*0.01; y += stepY) {
      if (Math.abs(y) > stepY*0.1) ctx.fillText(parseFloat(y.toPrecision(3)), toX(0)-4, toY(y)+4)
    }
    // Functions
    fns.forEach((fn, idx) => {
      ctx.strokeStyle = GRAPH_COLORS[idx % GRAPH_COLORS.length]; ctx.lineWidth = 2; ctx.beginPath()
      let started = false
      for (let px = 0; px < W; px++) {
        const x = xMin + (px / W) * (xMax - xMin)
        try {
          const y = typeof fn === 'function' ? fn(x) : parseFloat(String(fn))
          if (!isFinite(y) || Math.abs(y) > (yMax - yMin) * 20) { started = false; continue }
          if (!started) { ctx.moveTo(px, toY(y)); started = true } else { ctx.lineTo(px, toY(y)) }
        } catch { started = false }
      }
      ctx.stroke()
    })
    // Root highlights
    ctx.fillStyle = '#f87171'
    for (const r of highlightRoots) { ctx.beginPath(); ctx.arc(toX(r), toY(0), 5, 0, 2*Math.PI); ctx.fill() }
    // Trace crosshair
    if (trace) {
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; ctx.setLineDash([4,4])
      ctx.beginPath(); ctx.moveTo(trace.px, 0); ctx.lineTo(trace.px, H); ctx.stroke()
      if (trace.py !== null) { ctx.beginPath(); ctx.moveTo(0, trace.py); ctx.lineTo(W, trace.py); ctx.stroke() }
      ctx.setLineDash([])
      trace.fnYs.forEach((py, i) => {
        if (py === null) return
        ctx.fillStyle = GRAPH_COLORS[i % GRAPH_COLORS.length]
        ctx.beginPath(); ctx.arc(trace.px, py, 4, 0, 2*Math.PI); ctx.fill()
      })
    }
  }, [fns, xMin, xMax, yMin, yMax, highlightRoots, trace, toCanvasX, toCanvasY, width, height])

  const handleMove = useCallback((e) => {
    const canvas = ref.current; if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = width / rect.width
    const scaleY = height / rect.height
    const px = (e.clientX - rect.left) * scaleX
    const py = (e.clientY - rect.top) * scaleY
    const x = xMin + (px / width) * (xMax - xMin)
    const fnYs = fns.map(fn => {
      try { const y = fn(x); return isFinite(y) && Math.abs(y) < (yMax-yMin)*20 ? toCanvasY(y) : null } catch { return null }
    })
    const firstY = fnYs.find(y => y !== null) ?? null
    setTrace({ px, py, x, fnYs, firstY })
  }, [fns, xMin, xMax, yMin, yMax, width, height, toCanvasY])

  const traceLabel = trace ? `x=${trace.x.toFixed(4)}  ${trace.fnYs.map((py,i) => py!==null ? `y${fns.length>1?i+1:''}=${(yMin + (1 - py/height) * (yMax-yMin)).toFixed(4)}` : '').filter(Boolean).join('  ')}` : ''

  return (
    <div className="relative select-none">
      <canvas ref={ref} width={width} height={height}
        className="rounded border border-slate-800 cursor-crosshair"
        style={{width:'100%', height:'auto'}}
        onMouseMove={handleMove}
        onMouseLeave={() => setTrace(null)} />
      <div className={`absolute top-1.5 right-2 font-mono text-xs text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded pointer-events-none transition-opacity ${trace ? 'opacity-100' : 'opacity-0'}`}>
        {traceLabel}
      </div>
    </div>
  )
}

// ─── MACHINIST SVG VISUALIZATIONS ────────────────────────────────────────────
function MachinistViz({ viz, vars }) {
  if (!viz) return null

  if (viz === 'rotation') {
    return (
      <svg width="160" height="160" viewBox="0 0 160 160" className="rounded bg-slate-900 border border-slate-700">
        <defs>
          <marker id="rot-arr" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#f59e0b" />
          </marker>
        </defs>
        <circle cx="80" cy="80" r="52" fill="#1e293b" stroke="#60a5fa" strokeWidth="2" />
        <circle cx="80" cy="80" r="4" fill="#60a5fa" />
        <line x1="80" y1="80" x2="132" y2="80" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="101" y="74" fill="#93c5fd" fontSize="12" fontFamily="monospace">r</text>
        <path d="M 115 42 A 52 52 0 0 1 132 80" fill="none" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#rot-arr)" />
        <line x1="28" y1="140" x2="132" y2="140" stroke="#475569" strokeWidth="1" />
        <line x1="28" y1="136" x2="28" y2="144" stroke="#475569" strokeWidth="1" />
        <line x1="132" y1="136" x2="132" y2="144" stroke="#475569" strokeWidth="1" />
        <text x="60" y="155" fill="#94a3b8" fontSize="10" fontFamily="monospace">D = 2r</text>
        <text x="28" y="22" fill="#f59e0b" fontSize="9" fontFamily="monospace">SFM = πDN/12</text>
      </svg>
    )
  }

  if (viz === 'boltcircle') {
    const n = Math.max(1, Math.min(24, parseInt(vars?.n) || 6))
    const cx = 80, cy = 80, r = 52
    const holes = Array.from({ length: n }, (_, k) => {
      const a = (2 * Math.PI * k / n) + ((parseFloat(vars?.start_angle) || 0) * Math.PI / 180)
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), k }
    })
    return (
      <svg width="160" height="160" viewBox="0 0 160 160" className="rounded bg-slate-900 border border-slate-700">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="5 4" />
        <circle cx={cx} cy={cy} r="2.5" fill="#64748b" />
        {holes.map(h => (
          <g key={h.k}>
            <circle cx={h.x} cy={h.y} r="7" fill="none" stroke="#f59e0b" strokeWidth="2" />
            <circle cx={h.x} cy={h.y} r="2" fill="#94a3b8" />
          </g>
        ))}
        <line x1={cx} y1={cy} x2={holes[0]?.x ?? cx+r} y2={holes[0]?.y ?? cy} stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 2" />
        <text x="82" y="70" fill="#93c5fd" fontSize="9" fontFamily="monospace">BCR</text>
        <text x="4" y="152" fill="#94a3b8" fontSize="9" fontFamily="monospace">n = {n} holes</text>
      </svg>
    )
  }

  if (viz === 'taper') {
    return (
      <svg width="200" height="120" viewBox="0 0 200 120" className="rounded bg-slate-900 border border-slate-700">
        <polygon points="25,25 25,95 180,78 180,42" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="2" />
        <line x1="12" y1="25" x2="12" y2="95" stroke="#34d399" strokeWidth="2" />
        <line x1="8" y1="25" x2="16" y2="25" stroke="#34d399" strokeWidth="1.5" />
        <line x1="8" y1="95" x2="16" y2="95" stroke="#34d399" strokeWidth="1.5" />
        <text x="2" y="63" fill="#34d399" fontSize="10" fontFamily="monospace">D₁</text>
        <line x1="192" y1="42" x2="192" y2="78" stroke="#f472b6" strokeWidth="2" />
        <line x1="188" y1="42" x2="196" y2="42" stroke="#f472b6" strokeWidth="1.5" />
        <line x1="188" y1="78" x2="196" y2="78" stroke="#f472b6" strokeWidth="1.5" />
        <text x="183" y="63" fill="#f472b6" fontSize="10" fontFamily="monospace">D₂</text>
        <line x1="25" y1="108" x2="180" y2="108" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="25" y1="103" x2="25" y2="113" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="180" y1="103" x2="180" y2="113" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="92" y="118" fill="#f59e0b" fontSize="10" fontFamily="monospace">L</text>
        <text x="50" y="18" fill="#94a3b8" fontSize="9" fontFamily="monospace">TPF = (D₁−D₂)/L × 12</text>
      </svg>
    )
  }

  if (viz === 'ramp') {
    return (
      <svg width="200" height="120" viewBox="0 0 200 120" className="rounded bg-slate-900 border border-slate-700">
        <rect x="10" y="72" width="180" height="30" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
        <line x1="20" y1="72" x2="170" y2="25" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="7 3" />
        <path d="M 65 72 A 44 44 0 0 1 80 49" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="72" y="66" fill="#f59e0b" fontSize="12" fontFamily="monospace">α</text>
        <rect x="150" y="14" width="22" height="16" rx="3" fill="#3b82f6" opacity="0.85" />
        <text x="153" y="26" fill="white" fontSize="9" fontFamily="monospace">tool</text>
        <line x1="20" y1="72" x2="85" y2="72" stroke="#475569" strokeWidth="1" strokeDasharray="4 3" />
        <text x="5" y="16" fill="#94a3b8" fontSize="9" fontFamily="monospace">α ≤ 3° carbide</text>
        <text x="40" y="112" fill="#64748b" fontSize="9" fontFamily="monospace">helical entry path</text>
      </svg>
    )
  }

  if (viz === 'thread') {
    return (
      <svg width="200" height="120" viewBox="0 0 200 120" className="rounded bg-slate-900 border border-slate-700">
        {[0,1,2,3,4].map(i => (
          <polygon key={i} points={`${18+i*36},18 ${36+i*36},68 ${54+i*36},18`} fill="none" stroke="#60a5fa" strokeWidth="2" />
        ))}
        <line x1="8" y1="18" x2="192" y2="18" stroke="#34d399" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="8" y="13" fill="#34d399" fontSize="9" fontFamily="monospace">major D</text>
        <line x1="8" y1="68" x2="192" y2="68" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="8" y="82" fill="#f472b6" fontSize="9" fontFamily="monospace">minor d (root)</text>
        <line x1="18" y1="96" x2="54" y2="96" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="18" y1="91" x2="18" y2="101" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="54" y1="91" x2="54" y2="101" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="28" y="112" fill="#f59e0b" fontSize="9" fontFamily="monospace">pitch = 1/TPI</text>
        <text x="105" y="112" fill="#94a3b8" fontSize="9" fontFamily="monospace">60° thread form</text>
      </svg>
    )
  }

  if (viz === 'sinebar') {
    return (
      <svg width="200" height="130" viewBox="0 0 200 130" className="rounded bg-slate-900 border border-slate-700">
        <rect x="10" y="95" width="180" height="14" rx="1" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
        <text x="72" y="118" fill="#64748b" fontSize="9" fontFamily="monospace">surface plate</text>
        <rect x="155" y="68" width="18" height="27" rx="1" fill="#334155" stroke="#60a5fa" strokeWidth="1.5" />
        <text x="151" y="63" fill="#60a5fd" fontSize="10" fontFamily="monospace">H</text>
        <line x1="25" y1="95" x2="173" y2="68" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
        <circle cx="25" cy="95" r="7" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="173" cy="68" r="7" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="25" y1="53" x2="173" y2="53" stroke="#34d399" strokeWidth="1" strokeDasharray="3 2" />
        <line x1="25" y1="48" x2="25" y2="58" stroke="#34d399" strokeWidth="1.5" />
        <line x1="173" y1="48" x2="173" y2="58" stroke="#34d399" strokeWidth="1.5" />
        <text x="88" y="48" fill="#34d399" fontSize="10" fontFamily="monospace">L</text>
        <path d="M 65 95 A 40 40 0 0 1 78 68" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="76" y="85" fill="#f59e0b" fontSize="12" fontFamily="monospace">α</text>
        <text x="50" y="20" fill="#94a3b8" fontSize="10" fontFamily="monospace">H = L · sin(α)</text>
      </svg>
    )
  }

  if (viz === 'feed' || viz === 'milling') {
    return (
      <svg width="200" height="120" viewBox="0 0 200 120" className="rounded bg-slate-900 border border-slate-700">
        <defs>
          <marker id="feed-arr" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#f59e0b" />
          </marker>
        </defs>
        <rect x="10" y="55" width="180" height="50" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
        <circle cx="48" cy="42" r="20" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="2" />
        {[0,1,2,3].map(i => { const a = i * Math.PI / 2; return <line key={i} x1={48+8*Math.cos(a)} y1={42+8*Math.sin(a)} x2={48+20*Math.cos(a)} y2={42+20*Math.sin(a)} stroke="#60a5fa" strokeWidth="1.5" /> })}
        <line x1="48" y1="55" x2="48" y2="85" stroke="#34d399" strokeWidth="2" />
        <text x="52" y="73" fill="#34d399" fontSize="9" fontFamily="monospace">DOC</text>
        <line x1="28" y1="55" x2="68" y2="55" stroke="#f472b6" strokeWidth="2" />
        <text x="25" y="51" fill="#f472b6" fontSize="9" fontFamily="monospace">WOC</text>
        <line x1="72" y1="42" x2="185" y2="42" stroke="#f59e0b" strokeWidth="2.5" markerEnd="url(#feed-arr)" />
        <text x="108" y="37" fill="#f59e0b" fontSize="10" fontFamily="monospace">Feed →</text>
        <text x="12" y="115" fill="#64748b" fontSize="9" fontFamily="monospace">MRR = DOC × WOC × FR</text>
      </svg>
    )
  }

  return null
}

// ─── TRIANGLE SVG ────────────────────────────────────────────────────────────
function TriangleSVG({ a, b, c, A, B, C }) {
  if (!a || !b || !c || !A || !B || !C) return null
  const W = 280, H = 200, pad = 36
  // Place C at left, B at right, A at top — vertex B at origin, C at (c,0)
  const Bx = 0, By = 0
  const Cx = c, Cy = 0
  // A is at distance from B = a_from_B... wait:
  // side a is opposite A (between B and C), side b is opposite B (between A and C), side c is opposite C (between A and B)
  // A is connected to b (A-C) and c (A-B)
  // Place: B at (0,0), C at (a,0) (side a = BC), A at (c·cos(B), c·sin(B))
  const Ax = c * Math.cos(B), Ay = c * Math.sin(B)
  const pts = [[Ax,Ay],[Bx,By],[Cx,Cy]]
  const minX = Math.min(...pts.map(p=>p[0])), maxX = Math.max(...pts.map(p=>p[0]))
  const minY = Math.min(...pts.map(p=>p[1])), maxY = Math.max(...pts.map(p=>p[1]))
  const scaleX = (W-2*pad)/(maxX-minX||1), scaleY = (H-2*pad)/(maxY-minY||1)
  const sc = Math.min(scaleX, scaleY)
  const tx = x => pad + (x-minX)*sc, ty = y => H-pad-(y-minY)*sc
  const [pA,pB,pC] = [[tx(Ax),ty(Ay)],[tx(Bx),ty(By)],[tx(Cx),ty(Cy)]]
  const mid = (p1,p2) => [(p1[0]+p2[0])/2,(p1[1]+p2[1])/2]
  const fmtDeg = v => v.toFixed(1)+'°'
  const isRight = Math.abs(C*180/Math.PI - 90) < 0.1 || Math.abs(B*180/Math.PI - 90) < 0.1 || Math.abs(A*180/Math.PI - 90) < 0.1
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="rounded bg-slate-900 border border-slate-700">
      <polygon points={pA.join(',') + ' ' + pB.join(',') + ' ' + pC.join(',')}
        fill="#1e3a5f" stroke="#60a5fa" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Right angle box if applicable */}
      {isRight && Math.abs(C*180/Math.PI-90)<0.1 && (() => {
        const s = 10
        return <polygon points={`${pC[0]},${pC[1]-s} ${pC[0]-s},${pC[1]-s} ${pC[0]-s},${pC[1]}`} fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      })()}
      {/* Side labels */}
      {[
        [mid(pA,pB),'c='+parseFloat(c.toFixed(4)),'#f472b6',-12,0],  // c is side A-B, put outside
        [mid(pA,pC),'b='+parseFloat(b.toFixed(4)),'#f472b6',12,0],   // b is side A-C
        [mid(pB,pC),'a='+parseFloat(a.toFixed(4)),'#34d399',0,14],   // a is bottom
      ].map(([pos,lbl,col,dx,dy],i) => (
        <text key={i} x={pos[0]+dx} y={pos[1]+dy} fill={col} fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="600">{lbl}</text>
      ))}
      {/* Vertex angle labels */}
      {[
        [pA,'A='+fmtDeg(A*180/Math.PI),'#f59e0b',0,-8],
        [pB,'B='+fmtDeg(B*180/Math.PI),'#f59e0b',-10,10],
        [pC,'C='+fmtDeg(C*180/Math.PI),'#f59e0b',10,10],
      ].map(([pos,lbl,col,dx,dy],i) => (
        <text key={i} x={pos[0]+dx} y={pos[1]+dy} fill={col} fontSize="10" textAnchor="middle" fontFamily="monospace">{lbl}</text>
      ))}
    </svg>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function MathOS({ open, onClose }) {
  // drag
  const panelRef = useRef()
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const [pos, setPos] = useState({ x: Math.max(20, window.innerWidth - 960), y: 40 })

  // core state
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [activeView, setActiveView] = useState('symbolic') // numerical | symbolic | visual | code
  const [explainLevel, setExplainLevel] = useState('student')
  const [angleMode, setAngleMode] = useState('RAD')
  const [vars, setVarsState] = useState(loadVars)
  const [formulas, setFormulasState] = useState(loadFormulas)
  const [history, setHistory] = useState(loadHistory)
  const [histIdx, setHistIdx] = useState(-1)
  const [section, setSection] = useState('compute') // compute | matrix | sigma | poly | stats | physics | script | graph | formulas
  const [tab, setTab] = useState('symbolic') // per result: symbolic | visual | code | explain | connections
  const inputRef = useRef()

  // matrix state
  const [matA, setMatA] = useState([['1','0'],['0','1']])
  const [matB, setMatB] = useState([['1','0'],['0','1']])
  const [matOp, setMatOp] = useState('det')
  const [matN, setMatN] = useState(2)
  const [matAugB, setMatAugB] = useState([['1'],['0']]) // for Ax=b

  // sigma state
  const [sigExpr, setSigExpr] = useState('i')
  const [sigLo, setSigLo] = useState('1')
  const [sigHi, setSigHi] = useState('n')
  const [sigN, setSigN] = useState(10)

  // poly state
  const [polyExpr, setPolyExpr] = useState('x^2 - 5*x + 6')

  // stats state
  const [statsData, setStatsData] = useState('1, 2, 3, 4, 5')

  // physics state
  const [physFormula, setPhysFormula] = useState(null)
  const [physVarsLocal, setPhysVarsLocal] = useState({})

  // machinist state
  const [machFormula, setMachFormula] = useState(null)
  const [machVarsLocal, setMachVarsLocal] = useState({})
  const [machResult, setMachResult] = useState(null)

  // graph state
  const [graphFns, setGraphFns] = useState(['x^2','sin(x)','',''])
  const [graphXMin, setGraphXMin] = useState(-10)
  const [graphXMax, setGraphXMax] = useState(10)
  const [graphYMin, setGraphYMin] = useState(-10)
  const [graphYMax, setGraphYMax] = useState(10)

  // triangle state
  const [triSides, setTriSides] = useState({ a:'', b:'', c:'' })
  const [triAngles, setTriAngles] = useState({ A:'', B:'', C:'' })
  const [triResult, setTriResult] = useState(null)

  // matrix vars + expression state
  const [matVars, setMatVarsState] = useState(loadMatVars)
  const [matExpr, setMatExpr] = useState('')
  const [matExprResult, setMatExprResult] = useState(null)

  // script state
  const [scriptLang, setScriptLang] = useState('js')
  const [script, setScript] = useState(`// All stored variables are available\n// console.log output appears below\nconsole.log("Hello from MathOS script!");`)
  const [pyScript, setPyScript] = useState(`# numpy and matplotlib available\nimport numpy as np\nimport matplotlib.pyplot as plt\n\nx = np.linspace(0, 2*np.pi, 100)\ny = np.sin(x)\nprint("sin(pi/2) =", np.sin(np.pi/2))\nplt.plot(x, y)\nplt.title("sin(x)")\nplt.grid(True)\nplt.show()`)
  const [mlScript, setMlScript] = useState(`% OpenMAT — MATLAB-like engine (runs in browser)\nA = [-3 1; 5 2];\nM = [1 1; 1 0];\nB = inv(M) * A * M;\ndisp('A ='); disp(A)\ndisp('M ='); disp(M)\ndisp('B = inv(M)*A*M ='); disp(B)`)
  const [mlOutput, setMlOutput] = useState('')
  const [mlWorkspace, setMlWorkspace] = useState([])
  const [mlStatus, setMlStatus] = useState('idle') // idle|running|done|error
  const [scriptOutput, setScriptOutput] = useState('')
  const [scriptName, setScriptName] = useState('')
  const [scripts, setScriptsState] = useState(loadScripts)
  const [pyodideStatus, setPyodideStatus] = useState('idle') // idle|loading|ready|error
  const [pyImages, setPyImages] = useState([])
  const iframeRef = useRef()
  const pyodideRef = useRef(null)

  // ─── DRAG ────────────────────────────────────────────────────────────────────
  const onMouseDown = useCallback(e => {
    if (e.button !== 0) return
    dragging.current = true
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    e.preventDefault()
  }, [pos])

  useEffect(() => {
    const onMove = e => { if (!dragging.current) return; setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y }) }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  // ─── MATRIX AUTO-RESHAPE ON OP CHANGE ───────────────────────────────────────
  useEffect(() => {
    const vectorOps = new Set(['dot','cross','norm'])
    const squareOps = new Set(['det','inverse','trace','lu','eigen','char_poly','condition','power','transform2d'])
    const fixedOps  = { transform2d: 2 }
    const needsBOps = new Set(['multiply','add','subtract','dot','cross'])
    const needsAugOps = new Set(['linear_system','projection','least_squares'])

    if (fixedOps[matOp] !== undefined) {
      const n = fixedOps[matOp]
      setMatA(Array.from({length:n}, () => Array(n).fill('0')))
    } else if (vectorOps.has(matOp)) {
      const n = Math.max(2, matA.length)
      if (matA[0]?.length !== 1) setMatA(Array.from({length:n}, (_,r) => [matA[r]?.[0] ?? '0']))
      if (needsBOps.has(matOp) && matB[0]?.length !== 1)
        setMatB(Array.from({length:n}, (_,r) => [matB[r]?.[0] ?? '0']))
    } else if (squareOps.has(matOp) && matA.length !== matA[0]?.length) {
      const n = matA.length
      setMatA(Array.from({length:n}, (_,r) => Array.from({length:n}, (_,c) => matA[r]?.[c] ?? '0')))
    }
    if (needsAugOps.has(matOp) && matAugB.length !== matA.length) {
      setMatAugB(Array.from({length:matA.length}, (_,r) => [matAugB[r]?.[0] ?? '0']))
    }
  }, [matOp])

  // ─── VAR / FORMULA helpers ───────────────────────────────────────────────────
  const setVars = useCallback(v => { setVarsState(v); saveVars(v) }, [])
  const setFormulas = useCallback(f => { setFormulasState(f); saveFormulas(f) }, [])
  const setScripts2 = useCallback(s => { setScriptsState(s); saveScripts(s) }, [])
  const setMatVars = useCallback(v => { setMatVarsState(v); saveMatVars(v) }, [])

  // ─── KEYWORD DETECTION ───────────────────────────────────────────────────────
  function detectIntent(raw) {
    const s = raw.toLowerCase().trim()
    if (/\bintegrat(e|ion)\b|\b∫\b|∫|integral/.test(s)) return 'integral'
    if (/\bderivat(ive|e)\b|d\/d[a-z]|f'\(|differentiat/.test(s)) return 'derivative'
    if (/\bright triangle\b|\bpythagorean\b/.test(s)) return 'pythagorean'
    if (/\bsolve\b.*=.*/.test(s) && !/matrix|vector/.test(s)) return 'solve_eq'
    if (/\bfactor\b/.test(s) && !/matrix/.test(s)) return 'factor'
    if (/\bplot\b|\bgraph\b/.test(s)) return 'graph'
    if (/\bstat(istic)?\b|\bmean\b|\bmedian\b|\bstd dev\b|\bstandard dev/.test(s)) return 'stats'
    if (/F\s*=\s*ma|kinetic|potential energy|ohm|Newton|gravity|displacement|wavelength|ideal gas|velocity|torque|pressure/.test(raw)) return 'physics'
    if (/SFM|RPM|feed rate|tap drill|machinist/.test(raw)) return 'machinist'
    if (/^table\s*\(/.test(s)) return 'table'
    if (/^simplify\b/.test(s)) return 'simplify'
    if (/^expand\b/.test(s)) return 'expand'
    if (/^factor\b/.test(s)) return 'factor'
    if (/nDeriv\(|fnInt\(/.test(raw)) return 'calc_fn'
    return 'calc'
  }

  // ─── COMPUTE ─────────────────────────────────────────────────────────────────
  function compute() {
    const raw = input.trim(); if (!raw) return
    const scope = buildScope(angleMode, vars['ans'] ?? 0, vars)
    let res = null

    try {
      const intent = detectIntent(raw)

      if (intent === 'integral') {
        const m = raw.match(/integrat\w*\s+(.+?)\s+(?:from|d?x)\s+(-?[\d.]+)\s+to\s+(-?[\d.]+)/i)
          || raw.match(/∫\s*(.+?)\s*(?:from|dx)?\s*(-?[\d.]+)\s*to\s*(-?[\d.]+)/i)
        if (m) {
          const expr = m[1].trim(), a = parseFloat(m[2]), b = parseFloat(m[3])
          const val = fnInt(expr, 'x', a, b, scope)
          const steps = [
            { label: 'Integral', latex: `\\int_{${a}}^{${b}} ${expr}\\,dx` },
            { label: "Numerical method: Simpson's Rule (n=1000)", latex: `\\int_{a}^{b} f(x)\\,dx \\approx \\tfrac{h}{3}\\Bigl[f(a)+4f(a{+}h)+2f(a{+}2h)+\\cdots+f(b)\\Bigr]` },
            { label: 'Result', latex: `\\boxed{\\int_{${a}}^{${b}} ${expr}\\,dx \\approx ${fmtNum(val)}}` },
          ]
          const code = generateCode('integral', { expr, a, b })
          res = { type: 'integral', numerical: fmtNum(val), steps, code, expr, a, b, explainKey: 'integral', connKey: 'integral' }
        }
      } else if (intent === 'derivative') {
        const m = raw.match(/derivat\w*\s+(?:of\s+)?(.+?)\s+(?:at\s+)?x\s*=\s*(-?[\d.]+)/i)
        if (m) {
          const expr = m[1].trim(), xv = parseFloat(m[2])
          const val = nDeriv(expr, 'x', xv, scope)
          const steps = [
            { label: 'Expression', latex: `f(x) = ${expr}` },
            { label: 'Numerical derivative (central difference)', latex: `f'(x) \\approx \\frac{f(x+h)-f(x-h)}{2h},\\quad h=10^{-7}` },
            { label: 'At x = ' + xv, latex: `\\boxed{f'(${xv}) \\approx ${fmtNum(val)}}` },
          ]
          const code = generateCode('derivative', { expr, x: xv })
          res = { type: 'derivative', numerical: fmtNum(val), steps, code, expr, xv, explainKey: 'derivative', connKey: 'derivative' }
        }
      } else if (intent === 'table') {
        // table(expr, start, end [, step])
        const m = raw.match(/table\s*\(\s*(.+?)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)(?:\s*,\s*(-?[\d.]+))?\s*\)/i)
        if (m) {
          const expr = m[1].trim()
          const lo = parseFloat(m[2]), hi = parseFloat(m[3])
          const step = m[4] ? parseFloat(m[4]) : (hi - lo) / 20
          const rows = []
          for (let x = lo; x <= hi + step * 0.001; x += step) {
            try { rows.push([x, Number(calcEval(expr, { ...scope, x }))]) } catch { rows.push([x, NaN]) }
          }
          const steps = [
            { label: `Table: ${expr}`, latex: `x \\in [${lo}, ${hi}],\\quad \\Delta x = ${fmtNum(step)}` },
            { label: `${rows.length} values`, latex: `f(${lo}) = ${fmtNum(rows[0]?.[1])},\\quad \\cdots ,\\quad f(${hi.toFixed(4)}) = ${fmtNum(rows[rows.length-1]?.[1])}` },
          ]
          res = { type: 'table', numerical: `${rows.length} rows`, steps, tableRows: rows, code: { js: `// Table: ${expr}\nfor (let x=${lo}; x<=${hi}; x+=${step}) {\n  const y = ${expr.replace(/\^/g,'**')};\n  console.log(x.toFixed(4), y);\n}`, py: `import numpy as np\nx = np.arange(${lo}, ${hi+step*0.001}, ${step})\ny = ${expr.replace(/\^/g,'**')}\nfor xi, yi in zip(x, y):\n    print(f'{xi:.4f}  {yi:.6f}')`, mpl: `import numpy as np\nimport matplotlib.pyplot as plt\nx = np.arange(${lo}, ${hi+step*0.001}, ${step})\ny = ${expr.replace(/\^/g,'**')}\nplt.plot(x, y, 'o-')\nplt.grid(True)\nplt.title('${expr}')\nplt.show()`, ml: `x = ${lo}:${step}:${hi};\ny = ${expr.replace(/\^/g,'.^')};\n[x(:), y(:)]`, pt: '' }, explainKey: null, connKey: null }
          setTab('visual')
        }
      } else if (intent === 'solve_eq') {
        const m = raw.match(/solve\s+(.+?)\s*=\s*(.+)/i)
        if (m) {
          const lhs = m[1].trim(), rhs = m[2].trim()
          const expr = `(${lhs})-(${rhs})`
          const root = solveZero(expr, 'x', 0, scope)
          const steps = [
            { label: 'Equation', latex: `${lhs} = ${rhs}` },
            { label: 'Rearrange: f(x) = 0', latex: `f(x) = ${lhs} - (${rhs}) = 0` },
            { label: 'Newton-Raphson: x₁ = x₀ − f(x₀)/f\'(x₀)', latex: `x_0 = 0` },
            { label: 'Answer', latex: `\\boxed{x \\approx ${fmtNum(root)}}` },
          ]
          res = { type: 'solve_eq', numerical: fmtNum(root), steps, code: generateCode('calc', { expr }), explainKey: 'derivative', connKey: 'poly' }
        }
      } else if (intent === 'simplify' || intent === 'expand' || intent === 'factor') {
        const expr = raw.replace(/^(simplify|expand|factor)\s*/i,'').trim()
        if (intent === 'factor') {
          const roots = findRoots(expr)
          const degree = detectDegree(expr)
          const steps = [
            { label: `Factor: ${expr}`, latex: `f(x) = ${expr}` },
            ...(roots.length
              ? [{ label: 'Real roots (Newton-Raphson scan)', latex: `x = ${roots.map(toFrac).join(',\\;')}` },
                 { label: 'Factored form', latex: `f(x) = ${roots.map(r=>`(x - ${toFrac(r)})`).join('')}` }]
              : [{ label: 'No real roots in [-15, 15]', latex: '\\text{No real factors found — may have complex roots}' }]),
          ]
          res = { type: 'poly', numerical: roots.map(toFrac).join(', ') || 'No real roots', steps, code: generateCode('poly',{expr}), expr, roots: roots || [], degree, explainKey: 'poly', connKey: 'poly' }
        } else {
          const r = intent === 'expand' ? expandExpr(expr) : simplifyExpr(expr)
          const label = intent === 'expand' ? 'Expanded' : 'Simplified'
          const steps = r.ok
            ? [{ label: `${label}: ${expr}`, latex: expr }, { label, latex: `\\boxed{${r.latex || r.result}}` }]
            : [{ label: 'Error', latex: `\\text{${r.error?.slice(0,80)?.replace(/[<>&]/g,' ')}}` }]
          res = { type: 'calc', numerical: r.ok ? r.result : 'Error', steps, code: generateCode('calc',{expr}), expr, explainKey: null, connKey: null }
        }
      } else if (intent === 'pythagorean') {
        const nums = raw.match(/-?[\d.]+/g)?.map(Number) || []
        if (nums.length >= 2) {
          const [a, b] = nums; const c = Math.sqrt(a**2 + b**2)
          const steps = [
            { label: 'Pythagorean Theorem', latex: 'a^2 + b^2 = c^2' },
            { label: 'Substitute', latex: `${a}^2 + ${b}^2 = ${a*a} + ${b*b} = ${a*a+b*b}` },
            { label: 'Answer', latex: `\\boxed{c = \\sqrt{${a*a+b*b}} = ${fmtNum(c)}}` },
          ]
          res = { type: 'pythagorean', numerical: fmtNum(c), steps, explainKey: 'poly', connKey: 'poly' }
        }
      } else if (intent === 'graph') {
        const expr = raw.replace(/^(plot|graph)\s+/i, '').trim()
        setGraphFns([expr, '', '', ''])
        setSection('graph')
        return
      } else {
        // General arithmetic/algebra
        const sto = raw.match(/^(.+?)\s*sto→?\s*([a-zA-Z]\w*)$/i) || raw.match(/^([a-zA-Z]\w*)\s*=\s*([^=].*)$/)
        if (sto) {
          const varName = sto[2]?.trim() || sto[1]?.trim()
          const exprPart = sto[1]?.trim() || sto[2]?.trim()
          if (!/^\d+$/.test(varName)) {
            let val
            try { val = Number(mathEvalSafe(exprPart, scope)) } catch { val = parseFloat(exprPart) }
            if (isFinite(val)) {
              const newVars = { ...vars, [varName]: val }; setVars(newVars)
              const steps = [{ label: 'Store', latex: `${varName} \\leftarrow ${fmtNum(val)}` }]
              res = { type: 'store', numerical: fmtNum(val), steps, varName, code: generateCode('calc', { expr: exprPart }), explainKey: null, connKey: null }
            }
          }
        } else {
          const val = mathEvalSafe(raw, scope)
          if (val !== null) {
            const numVal = Number(val)
            const newVars = { ...vars, ans: numVal }; setVars(newVars)
            const steps = buildArithSteps(raw, numVal, scope)
            const code = generateCode('calc', { expr: raw })
            res = { type: 'calc', numerical: fmtNum(numVal), steps, code, expr: raw, explainKey: null, connKey: null }
          }
        }
      }
    } catch (err) {
      res = { type: 'error', numerical: 'Error', steps: [{ label: 'Error', latex: `\\text{${err.message.replace(/[<>]/g,' ')}}` }], code: { js: '', py: '', ml: '' }, explainKey: null, connKey: null }
    }

    if (!res) {
      res = { type: 'unrecognized', numerical: '?', steps: [{ label: 'Not recognized', latex: `\\text{Try: "integrate x^2 from 0 to 1", "derivative of x^3 at x=2", or use a section below.}` }], code: { js: '', py: '', ml: '' }, explainKey: null, connKey: null }
    }

    setResult(res)
    setTab('symbolic')
    const newHistory = [...history, { input, result: res }]
    setHistory(newHistory); saveHistory(newHistory)
    setHistIdx(-1)
  }

  function mathEvalSafe(expr, scope) {
    try {
      const cleaned = expr.replace(/(\d)([a-zA-Z(])/g, '$1*$2').replace(/\)(\d|[a-zA-Z(])/g, ')*$1')
        .replace(/÷/g,'/').replace(/×/g,'*').replace(/−/g,'-').replace(/π/g,'pi')
      const r = calcEval(cleaned, scope)
      return typeof r === 'number' ? r : (r && typeof r === 'object' ? r : null)
    } catch { return null }
  }

  function buildArithSteps(expr, val, scope) {
    const steps = [{ label: 'Expression', latex: expr.replace(/_/g,'\\_') }]
    const cleaned = expr.replace(/(\d)([a-zA-Z(])/g, '$1*$2').replace(/÷/g,'/').replace(/×/g,'*').replace(/π/g,'\\pi')
    if (cleaned !== expr) steps.push({ label: 'Expand implicit multiplication', latex: cleaned })
    if (angleMode === 'DEG') steps.push({ label: 'Angle mode: degrees', latex: '\\theta_{\\text{rad}} = \\theta_{\\text{deg}} \\cdot \\frac{\\pi}{180}' })
    steps.push({ label: 'Answer', latex: `\\boxed{${fmtNum(val)}}` })
    return steps
  }

  // ─── MATRIX COMPUTE ───────────────────────────────────────────────────────────
  function computeMatrix() {
    const A = parseMatrix(matA)
    const B = parseMatrix(matB)
    if (hasNaN(A)) { setResult({ type: 'error', numerical: 'Error', steps: [{ label: 'Error', latex: '\\text{Matrix A has invalid entries.}' }], code: { js:'',py:'',ml:'' }, explainKey: null, connKey: null }); return }

    let steps = [], numerical = '', code = {js:'',py:'',ml:''}
    const N = typeof matN === 'number' ? matN : parseInt(matN)

    const opMap = {
      det: () => { steps = solveDeterminant(A); try { const last = steps[steps.length-1]?.latex || ''; const m = last.match(/\\boxed\{.*?=(.+?)\}/); numerical = m ? m[1].trim() : '' } catch {}; code = generateCode('det',{matrix:A}); return { explainKey:'det', connKey:'det' } },
      rref: () => { const r = solveRREF(A); steps = r.steps; code = generateCode('rref',{matrix:A}); return { explainKey:'rref', connKey:'rref', rank: r.rank } },
      inverse: () => { steps = solveInverse(A); code = generateCode('det',{matrix:A}); return { explainKey:'det', connKey:'inverse' } },
      transpose: () => { steps = solveTranspose(A); return { explainKey:null, connKey:null } },
      trace: () => { steps = solveTrace(A); return { explainKey:null, connKey:'det' } },
      rank: () => { const r = solveRREF(A); steps = solveRank(A); return { explainKey:'rref', connKey:'rref' } },
      null_space: () => { steps = solveNullSpace(A); return { explainKey:'rref', connKey:'rref' } },
      col_space: () => { steps = solveColumnSpace(A); return { explainKey:'rref', connKey:'rref' } },
      lu: () => { steps = solveLU(A); return { explainKey:null, connKey:'lu' } },
      eigen: () => { steps = solveEigenvalues(A); code = generateCode('eigen',{matrix:A}); return { explainKey:'eigen', connKey:'eigen' } },
      char_poly: () => { steps = solveCharPoly(A); return { explainKey:'eigen', connKey:'eigen' } },
      qr: () => { steps = solveQR(A); return { explainKey:null, connKey:'qr' } },
      svd: () => { steps = solveSVD(A); return { explainKey:null, connKey:'svd' } },
      gram_schmidt: () => { steps = solveGramSchmidt(A); return { explainKey:null, connKey:'qr' } },
      condition: () => { steps = solveConditionNumber(A); return { explainKey:null, connKey:'eigen' } },
      power: () => { steps = solveMatrixPower(A, N); return { explainKey:null, connKey:'eigen' } },
      multiply: () => { if (hasNaN(B)) return null; steps = solveMultiply(A, B); return { explainKey:null, connKey:'dot' } },
      add: () => { if (hasNaN(B)) return null; steps = solveAdd(A, B); return { explainKey:null, connKey:null } },
      subtract: () => { if (hasNaN(B)) return null; steps = solveSubtract(A, B); return { explainKey:null, connKey:null } },
      scalar: () => { steps = solveScalarMul(A, N); return { explainKey:null, connKey:null } },
      dot: () => { if (hasNaN(B)) return null; steps = solveDot(A, B); return { explainKey:null, connKey:'dot' } },
      cross: () => { if (hasNaN(B)) return null; steps = solveCross(A, B); return { explainKey:null, connKey:'cross' } },
      norm: () => { steps = solveNorm(A); return { explainKey:null, connKey:'dot' } },
      linear_system: () => { if (hasNaN(matAugB)) return null; const bParsed = parseMatrix(matAugB); steps = solveLinearSystem(A, bParsed); return { explainKey:'rref', connKey:'rref' } },
      projection: () => { if (hasNaN(matAugB)) return null; const bParsed = parseMatrix(matAugB); steps = solveProjection(A, bParsed); return { explainKey:null, connKey:'dot' } },
      least_squares: () => { if (hasNaN(matAugB)) return null; const bParsed = parseMatrix(matAugB); steps = solveLeastSquares(A, bParsed); return { explainKey:null, connKey:'qr' } },
      transform2d: () => { steps = [{ label:'2D Transform', latex: matLatex(A,'T = ') }, { label:'Apply to i, j', latex:`T\\begin{pmatrix}1\\\\0\\end{pmatrix}=${vecLatex(A.map(r=>r[0]))},\\;T\\begin{pmatrix}0\\\\1\\end{pmatrix}=${vecLatex(A.map(r=>r[1]))}` }]; return { explainKey:null, connKey:'eigen' } },
      basis: () => { steps = solveBasis(A); return { explainKey:'rref', connKey:'rref' } },
      span: () => { steps = solveSpan(A); return { explainKey:'rref', connKey:'rref' } },
      linear_independence: () => { steps = solveLinearIndependence(A); return { explainKey:'rref', connKey:'rref' } },
      similarity: () => { if (hasNaN(B)) return null; steps = solveSimilarity(A, B); return { explainKey:'eigen', connKey:'eigen' } },
    }

    const fn = opMap[matOp]
    if (!fn) { setResult({ type:'error', numerical:'?', steps:[{label:'Unknown op',latex:`\\text{Unknown operation: ${matOp}}`}], code, explainKey:null, connKey:null }); return }
    const meta = fn()
    if (!meta) { setResult({ type:'error', numerical:'?', steps:[{label:'Error',latex:'\\text{Matrix B has invalid entries.}'}], code, explainKey:null, connKey:null }); return }

    setResult({ type: 'matrix', operation: matOp, numerical: steps[steps.length-1]?.latex || '', steps, code, ...meta })
    setTab('symbolic')
  }

  // ─── SIGMA COMPUTE ───────────────────────────────────────────────────────────
  function computeSigma() {
    const n = parseInt(sigN)
    const lo = parseInt(sigLo) || 1
    const hiNum = sigHi === 'n' ? n : parseInt(sigHi)
    const terms = []
    let total = 0
    for (let i = lo; i <= hiNum; i++) {
      const v = safeEval(sigExpr, { i, n })
      if (!isFinite(v)) continue
      terms.push(v); total += v
    }
    const cf = matchClosedForm(sigExpr, sigLo, sigHi, n)
    const steps = [
      { label: 'Expression', latex: `\\sum_{i=${sigLo}}^{${sigHi==='n'?`n=${n}`:sigHi}} ${sigExpr}` },
      ...(cf ? [{ label: 'Closed form recognized', latex: cf.label }, { label: 'Apply formula', latex: cf.resultLatex }, { label: cf.explanation || 'Formula applied', latex: `\\boxed{${cf.resultLatex}}` }]
        : [{ label: 'Expand (first few terms)', latex: terms.slice(0,8).map(toFrac).join(' + ') + (terms.length > 8 ? ' + \\cdots' : '') },
           { label: 'Sum', latex: `\\boxed{\\sum = ${toFrac(total)}}` }]),
    ]
    const code = generateCode('sigma', { expr: sigExpr, lo: sigLo, hi: sigHi, n })
    setResult({ type: 'sigma', numerical: toFrac(total), steps, code, terms, total, explainKey: 'sigma', connKey: 'sigma' })
    setTab('symbolic')
  }

  // ─── POLY COMPUTE ────────────────────────────────────────────────────────────
  function computePoly() {
    // Note: do NOT replace ^ with ** — polyEvalAt uses mathjs which needs ^ for exponentiation
    const norm = polyExpr.trim().replace(/(\d)([a-zA-Z(])/g,'$1*$2').replace(/([a-zA-Z)])(\d)/g,'$1*$2')
    const degree = detectDegree(norm)
    const roots = findRoots(norm)
    const steps = degree === 2
      ? buildQuadSteps(norm)
      : [
          { label: 'Expression', latex: `f(x) = ${polyExpr}` },
          { label: `Detected degree: ${degree !== null ? degree : '?'}`, latex: `f(x) \\text{ — degree-${degree ?? '?'} polynomial}` },
          { label: 'Roots (Newton-Raphson scan)', latex: roots.length ? `x = ${roots.map(toFrac).join(',\\;')}` : '\\text{No real roots found in [-15, 15]}' },
          ...(roots.length ? [{ label: 'Verify', latex: roots.map(r => `f(${toFrac(r)}) \\approx ${toFrac(polyEvalAt(norm, r))}`).join(',\\;') }] : []),
          { label: 'Answer', latex: `\\boxed{\\text{Roots: }${roots.length ? roots.map(toFrac).join(',\\;') : '\\text{none (real)}'}}` },
        ]
    const code = generateCode('poly', { expr: polyExpr })
    setResult({ type: 'poly', numerical: roots.map(toFrac).join(', ') || 'No real roots', steps, code, expr: norm, roots, degree, explainKey: 'poly', connKey: 'poly' })
    setTab('symbolic')
  }

  // ─── STATS COMPUTE ───────────────────────────────────────────────────────────
  function computeStats() {
    const data = statsData.split(/[,\s]+/).map(Number).filter(n => !isNaN(n))
    if (data.length < 2) { setResult({ type: 'error', numerical: 'Error', steps: [{ label: 'Error', latex: '\\text{Enter at least 2 numbers, comma-separated.}' }], code: {js:'',py:'',ml:''}, explainKey:null, connKey:null }); return }
    const steps = solveStats(data)
    setResult({ type: 'stats', numerical: toFrac(data.reduce((s,x)=>s+x,0)/data.length), steps, data, code: {js:`const data=[${data}];\nconst mean=data.reduce((s,x)=>s+x,0)/data.length;\nconsole.log('mean',mean);`,py:`import numpy as np\ndata=[${data}]\nprint('mean',np.mean(data))\nprint('std',np.std(data))`,ml:`data=[${data}];\nmean(data), std(data)`}, explainKey:null, connKey:null })
    setTab('symbolic')
  }

  // ─── PHYSICS COMPUTE ─────────────────────────────────────────────────────────
  function computePhysics() {
    if (!physFormula) return
    const scope = { pi: Math.PI, e: Math.E }
    for (const [k,v] of Object.entries(physVarsLocal)) { if (v !== '') scope[k] = parseFloat(v) }

    // Detect which variable is the unknown (left empty)
    const unknown = (physFormula.vars || []).find(v => !physVarsLocal[v] || physVarsLocal[v] === '')

    let val, solveFor = unknown || '?'
    const steps = [{ label: `${physFormula.name} — ${physFormula.desc}`, latex: physFormula.latex }]
    const knownStr = Object.entries(scope).filter(([k]) => k!=='pi'&&k!=='e').map(([k,v])=>`${k}=${v}`).join(',\\;')
    if (knownStr) steps.push({ label: 'Known', latex: knownStr })

    try {
      if (physFormula.formula.includes('=')) {
        const [lhs, rhs] = physFormula.formula.split('=').map(s => s.trim())
        if (!unknown || unknown === lhs) {
          // Solve LHS = evaluate RHS
          val = Number(calcEval(rhs, scope))
          solveFor = lhs
          steps.push({ label: `Evaluate RHS`, latex: `${lhs} = ${rhs.replace(/\*/g,'\\cdot ')}` })
        } else {
          // Unknown is somewhere in RHS — Newton-Raphson: f(u) = rhs(u) - lhs_value
          const lhsVal = scope[lhs]
          solveFor = unknown
          let x = 1
          for (let i = 0; i < 60; i++) {
            const fx = Number(calcEval(rhs, { ...scope, [unknown]: x })) - lhsVal
            const h = Math.max(Math.abs(x)*1e-6, 1e-8)
            const fpx = (Number(calcEval(rhs, { ...scope, [unknown]: x+h })) - Number(calcEval(rhs, { ...scope, [unknown]: x-h }))) / (2*h)
            if (!isFinite(fpx) || Math.abs(fpx) < 1e-14) break
            const xn = x - fx/fpx; if (!isFinite(xn)) break
            if (Math.abs(xn-x) < 1e-10) { x = xn; break }
            x = xn
          }
          val = x
          steps.push({ label: `Solve for ${unknown}`, latex: `${lhs} = ${rhs} \\Rightarrow ${unknown} = ?` })
        }
      } else {
        val = Number(calcEval(physFormula.formula, scope))
      }
      steps.push({ label: 'Answer', latex: `\\boxed{${solveFor} = ${isFinite(val) ? fmtNum(val) : String(val)}}` })
      setResult({ type: 'physics', numerical: isFinite(val) ? fmtNum(val) : String(val), steps, code:{js:'',py:'',ml:''}, explainKey:null, connKey:null })
      setTab('symbolic')
    } catch (e) {
      steps.push({ label: 'Error', latex: `\\text{${e.message.slice(0,80).replace(/[<>]/g,' ')}}` })
      setResult({ type: 'physics', numerical: 'Error', steps, code:{js:'',py:'',ml:''}, explainKey:null, connKey:null })
      setTab('symbolic')
    }
  }

  // ─── TRIANGLE SOLVER ─────────────────────────────────────────────────────────
  function computeTriangle() {
    const deg = angleMode === 'DEG'
    const toRad = v => deg ? v * Math.PI / 180 : v
    const toDeg = v => deg ? v * 180 / Math.PI : v
    const fmt = v => parseFloat(v.toFixed(6))
    const fmtAng = v => parseFloat((toDeg(v)).toFixed(4))

    let a = triSides.a !== '' ? parseFloat(triSides.a) : null
    let b = triSides.b !== '' ? parseFloat(triSides.b) : null
    let c = triSides.c !== '' ? parseFloat(triSides.c) : null
    let A = triAngles.A !== '' ? toRad(parseFloat(triAngles.A)) : null
    let B = triAngles.B !== '' ? toRad(parseFloat(triAngles.B)) : null
    let C = triAngles.C !== '' ? toRad(parseFloat(triAngles.C)) : null

    const known = [a,b,c,A,B,C].filter(v=>v!==null).length
    if (known < 3) { setTriResult({ error: 'Enter at least 3 values (e.g. two sides + one angle, or all three sides).' }); return }

    // Derive third angle if two are known
    const solveAngles = () => {
      if (A!==null && B!==null && C===null) C = Math.PI - A - B
      else if (A!==null && C!==null && B===null) B = Math.PI - A - C
      else if (B!==null && C!==null && A===null) A = Math.PI - B - C
    }

    // SSS
    if (a!==null && b!==null && c!==null) {
      const cosA = (b*b+c*c-a*a)/(2*b*c)
      const cosB = (a*a+c*c-b*b)/(2*a*c)
      if (Math.abs(cosA)>1||Math.abs(cosB)>1) { setTriResult({error:'Triangle inequality violated — no such triangle.'}); return }
      A = Math.acos(cosA); B = Math.acos(cosB); C = Math.PI-A-B
    } else {
      solveAngles()
      // AAS / ASA — two angles + one side
      if (A!==null && B!==null && C!==null) {
        if (a!==null) { b = a*Math.sin(B)/Math.sin(A); c = a*Math.sin(C)/Math.sin(A) }
        else if (b!==null) { a = b*Math.sin(A)/Math.sin(B); c = b*Math.sin(C)/Math.sin(B) }
        else if (c!==null) { a = c*Math.sin(A)/Math.sin(C); b = c*Math.sin(B)/Math.sin(C) }
      }
      // SAS — two sides + included angle
      else if (a!==null && b!==null && C!==null) {
        c = Math.sqrt(a*a+b*b-2*a*b*Math.cos(C))
        A = Math.asin(a*Math.sin(C)/c); B = Math.PI-A-C
      } else if (a!==null && c!==null && B!==null) {
        b = Math.sqrt(a*a+c*c-2*a*c*Math.cos(B))
        A = Math.asin(a*Math.sin(B)/b); C = Math.PI-A-B
      } else if (b!==null && c!==null && A!==null) {
        a = Math.sqrt(b*b+c*c-2*b*c*Math.cos(A))
        B = Math.asin(b*Math.sin(A)/a); C = Math.PI-A-B
      }
      // SSA — two sides + non-included angle (law of sines, may be ambiguous)
      else if (a!==null && b!==null && A!==null) {
        const sinB = b*Math.sin(A)/a
        if (sinB>1) { setTriResult({error:'No triangle — sin(B) > 1 for these values (SSA ambiguous case).'}); return }
        B = Math.asin(sinB); C = Math.PI-A-B; c = a*Math.sin(C)/Math.sin(A)
      } else if (a!==null && c!==null && A!==null) {
        const sinC = c*Math.sin(A)/a
        if (sinC>1) { setTriResult({error:'No triangle — sin(C) > 1 for these values.'}); return }
        C = Math.asin(sinC); B = Math.PI-A-C; b = a*Math.sin(B)/Math.sin(A)
      } else if (b!==null && c!==null && B!==null) {
        const sinC = c*Math.sin(B)/b
        if (sinC>1) { setTriResult({error:'No triangle — sin(C) > 1 for these values.'}); return }
        C = Math.asin(sinC); A = Math.PI-B-C; a = b*Math.sin(A)/Math.sin(B)
      } else {
        setTriResult({error:'Cannot solve — enter a valid combination: SSS, SAS, ASA, AAS, or SSA.'}); return
      }
    }

    if ([a,b,c,A,B,C].some(v=>v===null||!isFinite(v)||v<=0)) { setTriResult({error:'Invalid triangle — check your values.'}); return }

    const area = 0.5*a*b*Math.sin(C)
    const s = (a+b+c)/2 // semi-perimeter
    const R = a/(2*Math.sin(A)) // circumradius
    const r = area/s             // inradius

    const steps = [
      { label: 'Law of Cosines: c² = a² + b² − 2ab·cos(C)', latex: 'c^2 = a^2 + b^2 - 2ab\\cos(C)' },
      { label: 'Law of Sines: a/sin A = b/sin B = c/sin C', latex: '\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C}' },
      { label: 'Sides', latex: `a = ${fmtNum(a)},\\quad b = ${fmtNum(b)},\\quad c = ${fmtNum(c)}` },
      { label: 'Angles', latex: `A = ${fmtNum(fmtAng(A))}^\\circ,\\quad B = ${fmtNum(fmtAng(B))}^\\circ,\\quad C = ${fmtNum(fmtAng(C))}^\\circ` },
      { label: 'Area (Heron / cross-product)', latex: `\\text{Area} = \\tfrac{1}{2}ab\\sin C = ${fmtNum(area)}` },
      { label: 'Circumradius, Inradius', latex: `R = \\dfrac{a}{2\\sin A} = ${fmtNum(R)},\\quad r = \\dfrac{\\text{Area}}{s} = ${fmtNum(r)}` },
    ]

    setTriResult({ a:fmt(a), b:fmt(b), c:fmt(c), A:fmtAng(A), B:fmtAng(B), C:fmtAng(C), area:fmt(area), R:fmt(R), r:fmt(r), steps })
  }

  // ─── PYTHON RUNNER (Pyodide) ──────────────────────────────────────────────────
  async function loadPyodide() {
    if (pyodideRef.current) return pyodideRef.current
    setPyodideStatus('loading')
    setScriptOutput('⏳ Loading Python runtime (first run ~5–15 s, downloads once)...')
    try {
      if (!window.loadPyodide) {
        await new Promise((res, rej) => {
          const s = document.createElement('script')
          s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js'
          s.onload = res; s.onerror = () => rej(new Error('Failed to load Pyodide CDN'))
          document.head.appendChild(s)
        })
      }
      const py = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' })
      await py.loadPackage(['numpy', 'matplotlib'])
      pyodideRef.current = py
      setPyodideStatus('ready')
      return py
    } catch(e) {
      setPyodideStatus('error')
      setScriptOutput('[Pyodide Error] ' + e.message + '\n\nCheck your internet connection. Pyodide requires CDN access.')
      throw e
    }
  }

  async function runPython() {
    setPyImages([])
    try {
      const py = await loadPyodide()
      // Redirect stdout/stderr
      py.runPython(`
import sys
from io import StringIO
_out_buf = StringIO()
sys.stdout = _out_buf
sys.stderr = _out_buf
`)
      // Inject stored numeric vars
      for (const [k,v] of Object.entries(vars)) {
        if (typeof v === 'number' && /^[a-zA-Z_]\w*$/.test(k)) {
          try { py.runPython(`${k} = ${v}`) } catch {}
        }
      }
      // Try matplotlib setup (optional)
      try {
        py.runPython(`
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io, base64, json as _json
_mpl_images = []
_orig_show = plt.show
def _patched_show(*a, **kw):
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=100)
    buf.seek(0)
    _mpl_images.append('data:image/png;base64,' + base64.b64encode(buf.read()).decode())
    plt.clf()
plt.show = _patched_show
`)
      } catch { /* matplotlib not available in this build */ }

      py.runPython(pyScript)

      py.runPython(`sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__`)
      const output = py.runPython(`_out_buf.getvalue()`)
      setScriptOutput(output || '(done — no print output)')

      // Collect matplotlib images
      try {
        const imgs = py.runPython(`_json.dumps(_mpl_images)`)
        const parsed = JSON.parse(imgs)
        if (parsed.length) setPyImages(parsed)
      } catch {}
    } catch(e) {
      try { pyodideRef.current?.runPython?.(`sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__`) } catch {}
      const msg = e.message || String(e)
      setScriptOutput('[Python Error]\n' + msg)
    }
  }

  // ─── OPENMAT (MATLAB-like) RUNNER ─────────────────────────────────────────────
  function runMatlab() {
    setMlStatus('running')
    setMlOutput('')
    setMlWorkspace([])
    try {
      // inject stored matrix vars + scalar vars as preamble
      const preamble = [
        ...Object.entries(matVars).map(([name, mat]) =>
          `${name} = [${mat.map(r => r.join(' ')).join('; ')}];`),
        ...Object.entries(vars).filter(([,v]) => typeof v === 'number').map(([k,v]) => `${k} = ${v};`),
      ].join('\n')
      const result = openmatExec(preamble ? preamble + '\n' + mlScript : mlScript)
      setMlOutput(result.output || '(done — no output)')
      setMlWorkspace((result.workspace || []).filter(w => !w.name.startsWith('_')))
      setMlStatus('done')
    } catch(e) {
      setMlOutput('Error: ' + (e.message || String(e)))
      setMlStatus('error')
    }
  }

  // ─── MATRIX EXPRESSION EVALUATOR ─────────────────────────────────────────────
  function computeMatExpr() {
    const expr = matExpr.trim()
    if (!expr) return
    try {
      const preamble = Object.entries(matVars).map(([name, mat]) =>
        `${name} = [${mat.map(r => r.join(' ')).join('; ')}];`
      ).join('\n')
      const result = openmatExec(preamble + '\n_result = ' + expr + ';')
      const w = (result.workspace || []).find(v => v.name === '_result')
      if (w) {
        const val = w.value
        if (Array.isArray(val) && Array.isArray(val[0])) {
          // matrix result → load into matA + show
          const strMat = val.map(r => r.map(x => String(+x.toFixed(6))))
          setMatA(strMat)
          setMatExprResult({ mat: val, preview: w.preview, expr })
        } else {
          setMatExprResult({ scalar: w.preview, expr })
        }
      } else {
        setMatExprResult({ scalar: result.output, expr })
      }
    } catch(e) {
      setMatExprResult({ error: e.message, expr })
    }
  }

  // ─── MACHINIST COMPUTE ────────────────────────────────────────────────────────
  function computeMachinist() {
    if (!machFormula) return
    const scope = { pi: Math.PI, e: Math.E }
    for (const [k,v] of Object.entries(machVarsLocal)) { if (v !== '') scope[k] = parseFloat(v) }

    const steps = [{ label: machFormula.fullName, latex: machFormula.latex }]
    const knownStr = Object.entries(scope).filter(([k]) => k!=='pi'&&k!=='e').map(([k,v])=>`${k}=${v}`).join(',\\;')
    if (knownStr) steps.push({ label: 'Given', latex: knownStr })

    // Special case: Bolt Circle — generate all n coordinates
    if (machFormula.viz === 'boltcircle') {
      const n = parseInt(machVarsLocal.n) || 0
      const bcr = parseFloat(machVarsLocal.BCR) || 0
      const sa = parseFloat(machVarsLocal.start_angle) || 0
      if (n < 1 || bcr <= 0) {
        setMachResult({ answer: 'Enter BCR and n', steps, coords: null })
        return
      }
      const coords = []
      for (let k = 0; k < n; k++) {
        const angle = (2 * Math.PI * k / n) + (sa * Math.PI / 180)
        coords.push({ k, x: bcr * Math.cos(angle), y: bcr * Math.sin(angle) })
      }
      steps.push({ label: `${n} hole coordinates`, latex: `x_k = BCR\\cos\\!\\left(\\tfrac{2\\pi k}{n}+\\theta_0\\right),\\quad y_k = BCR\\sin\\!\\left(\\tfrac{2\\pi k}{n}+\\theta_0\\right)` })
      setMachResult({ answer: `${n} holes on BCR=${bcr}`, steps, coords })
      return
    }

    try {
      const val = Number(calcEval(machFormula.formula, scope))
      const solves = machFormula.solves || '?'
      const unitStr = machFormula.units?.[solves] || ''
      steps.push({ label: 'Result', latex: `\\boxed{${solves} = ${isFinite(val) ? fmtNum(val) : String(val)}}` })
      setMachResult({ answer: isFinite(val) ? `${fmtNum(val)}  ${unitStr.split(' ')[0]}` : 'Error', steps, coords: null })
    } catch(e) {
      steps.push({ label: 'Error', latex: `\\text{${e.message.slice(0,80).replace(/[<>&]/g,' ')}}` })
      setMachResult({ answer: 'Error', steps, coords: null })
    }
  }

  // ─── SCRIPT RUN ───────────────────────────────────────────────────────────────
  function runScript() {
    const varInit = Object.entries(vars).filter(([,v])=>typeof v==='number').map(([k,v])=>`var ${k}=${v};`).join('\n')
    const html = `<!DOCTYPE html><html><head></head><body><script>
var __log=[];var __err=[];
var console={log:function(){__log.push(Array.from(arguments).join(' '));},error:function(){__err.push(Array.from(arguments).join(' '));},warn:function(){__log.push('[WARN] '+Array.from(arguments).join(' '));},table:function(){__log.push('[TABLE] '+JSON.stringify(arguments[0]));},info:function(){__log.push(Array.from(arguments).join(' '));}};
${varInit}
try { ${script} } catch(e) { __err.push(e.message); }
window.parent.postMessage({type:'script-output',log:__log,err:__err},'*');
<\/script></body></html>`
    if (iframeRef.current) iframeRef.current.srcdoc = html
  }

  useEffect(() => {
    const handler = e => { if (e.data?.type === 'script-output') { const out = [...e.data.log, ...e.data.err.map(s=>'[ERR] '+s)]; setScriptOutput(out.join('\n')) } }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // ─── KEYBOARD ─────────────────────────────────────────────────────────────────
  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); compute() }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIdx = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1)
      setHistIdx(newIdx); if (history[newIdx]) setInput(history[newIdx].input)
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIdx = histIdx === -1 ? -1 : histIdx + 1
      if (newIdx >= history.length) { setHistIdx(-1); setInput('') } else { setHistIdx(newIdx); setInput(history[newIdx]?.input || '') }
    }
  }

  // ─── GRAPH FN BUILDERS (use mathjs so sin/cos/sqrt/etc all work) ─────────────
  const builtGraphFns = useMemo(() => {
    const scope = buildScope(angleMode, 0, vars)
    return graphFns.map(expr => {
      if (!expr.trim()) return null
      return x => { try { return Number(calcEval(expr, { ...scope, x })) } catch { return NaN } }
    }).filter(Boolean)
  }, [graphFns, angleMode, vars])

  if (!open) return null

  const OPERATIONS = [
    { id:'det', label:'Determinant', squareOnly:true }, { id:'rref', label:'RREF', squareOnly:false },
    { id:'inverse', label:'Inverse', squareOnly:true }, { id:'transpose', label:'Transpose', squareOnly:false },
    { id:'trace', label:'Trace', squareOnly:true }, { id:'rank', label:'Rank', squareOnly:false },
    { id:'null_space', label:'Null Space', squareOnly:false }, { id:'col_space', label:'Col Space', squareOnly:false },
    { id:'lu', label:'LU', squareOnly:true }, { id:'eigen', label:'Eigenvalues', squareOnly:true },
    { id:'char_poly', label:'Char Poly', squareOnly:true }, { id:'qr', label:'QR', squareOnly:false },
    { id:'svd', label:'SVD', squareOnly:false }, { id:'gram_schmidt', label:'Gram-Schmidt', squareOnly:false },
    { id:'condition', label:'Condition #', squareOnly:true }, { id:'power', label:'Aⁿ', squareOnly:true },
    { id:'transform2d', label:'2D Transform', squareOnly:true },
    { id:'multiply', label:'A × B', needsB:true }, { id:'add', label:'A + B', needsB:true },
    { id:'subtract', label:'A − B', needsB:true }, { id:'scalar', label:'cA', squareOnly:false },
    { id:'dot', label:'Dot ·', needsB:true, vectorMode:true }, { id:'cross', label:'Cross ×', needsB:true, vectorMode:true },
    { id:'norm', label:'Norm ‖v‖', vectorMode:true }, { id:'linear_system', label:'Ax = b', needsAug:true },
    { id:'projection', label:'Proj onto col(A)', needsAug:true }, { id:'least_squares', label:'Least Squares', needsAug:true },
    { id:'basis', label:'Basis col(A)', squareOnly:false }, { id:'span', label:'Span', squareOnly:false },
    { id:'linear_independence', label:'Lin. Independence', squareOnly:false },
    { id:'similarity', label:'A ~ B (Similar?)', needsB:true },
  ]
  const currentOp = OPERATIONS.find(o => o.id === matOp) || {}

  const SECTIONS = [
    { id:'compute', label:'∑ Compute' }, { id:'matrix', label:'⊞ Matrix' }, { id:'sigma', label:'Σ Sigma' },
    { id:'poly', label:'f(x) Poly' }, { id:'stats', label:'📊 Stats' }, { id:'physics', label:'⚛ Physics' },
    { id:'machinist', label:'⚙ Machinist' }, { id:'triangle', label:'△ Triangle' },
    { id:'graph', label:'📈 Graph' }, { id:'script', label:'</> Script' }, { id:'formulas', label:'📐 Formulas' },
  ]

  function getExplain(level) {
    if (!result) return null
    if (result.explainKey && EXPLANATIONS[result.explainKey]) return EXPLANATIONS[result.explainKey][level]
    // Matrix ops map to existing explanation keys
    const opExplainMap = { det:'det', rref:'rref', rank:'rref', null_space:'rref', col_space:'rref',
      linear_system:'rref', inverse:'det', eigen:'eigen', char_poly:'eigen', svd:'svd', qr:'qr',
      lu:'lu', dot:'dot', cross:'cross', projection:'dot', least_squares:'qr', gram_schmidt:'qr' }
    if (result.type === 'matrix' && result.operation && opExplainMap[result.operation]) {
      const key = opExplainMap[result.operation]
      if (EXPLANATIONS[key]) return EXPLANATIONS[key][level]
    }
    if (result.type === 'sigma') return EXPLANATIONS.sigma?.[level]
    if (result.type === 'poly') return EXPLANATIONS.poly?.[level]
    if (result.type === 'calc') {
      const e = result.expr || ''
      if (/sin|cos|tan/.test(e)) return { eli5:'Trig functions relate angles to side ratios in triangles.', student:'sin(θ), cos(θ), tan(θ) are defined via the unit circle.', college:'Trigonometric functions are periodic real-valued functions with period 2π.', advanced:'They are the real/imaginary parts of e^(iθ) via Euler\'s formula.' }[level]
      if (/log|ln/.test(e)) return { eli5:'Logarithms ask "what power gives me this number?"', student:'log_b(x)=y means b^y=x. ln is base e.', college:'The natural log is the inverse of the exponential. Its derivative is 1/x.', advanced:'ln extends to complex numbers: ln(re^(iθ))=ln(r)+iθ.' }[level]
      return { eli5:`You calculated ${result.numerical}.`, student:`The expression evaluates to ${result.numerical}.`, college:`Numerical evaluation: ${result.numerical}.`, advanced:`Result: ${result.numerical}` }[level]
    }
    return null
  }
  const explainText = getExplain(explainLevel)
  const connData = result?.connKey && CONNECTIONS[result.connKey]

  return (
    <div
      ref={panelRef}
      className="fixed z-[2000] flex flex-col rounded-[24px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden bg-slate-900/80 backdrop-blur-3xl"
      style={{ left: pos.x, top: pos.y, width: 900, maxHeight: '92vh', color: '#e2e8f0', userSelect: dragging.current ? 'none' : 'auto' }}
    >
      {/* ── TITLE BAR ── */}
      <div className="relative flex items-center gap-3 px-5 py-3 bg-white/5 border-b border-white/10 cursor-grab active:cursor-grabbing shrink-0" onMouseDown={onMouseDown}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl pointer-events-none" />
        <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 font-black text-[15px] tracking-wide select-none">⬡ MathOS</span>
        <span className="relative z-10 text-slate-400 font-medium text-xs select-none">Universal STEM Workspace</span>
        <div className="relative z-10 ml-auto flex items-center gap-2">
          <button onClick={() => setAngleMode(a => a === 'RAD' ? 'DEG' : 'RAD')}
            className={`text-xs px-2.5 py-1 rounded-md font-mono font-bold transition-colors ${angleMode==='DEG'?'bg-amber-500/20 text-amber-300':'bg-white/10 hover:bg-white/20 text-slate-300'}`}>
            {angleMode}
          </button>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
      </div>

      {/* ── VAR STRIP ── */}
      <div className="flex gap-2 px-5 py-1.5 bg-black/20 border-b border-white/5 flex-wrap shrink-0 min-h-[32px] items-center">
        {Object.keys(vars).length === 0
          ? <span className="text-xs text-slate-500 font-mono">vars — type "x = 5" or use STO→ button to store values</span>
          : <>
              {Object.entries(vars).slice(0,20).map(([k,v]) => (
                <button key={k} onClick={() => setInput(k)}
                  className="flex items-center gap-1.5 text-[11px] font-mono hover:bg-white/10 rounded-md px-2 py-0.5 transition-colors border border-transparent hover:border-white/10">
                  <span className="text-blue-300 font-bold">{k}</span>
                  <span className="text-slate-600">=</span>
                  <span className="text-emerald-400">{typeof v === 'number' ? fmtNum(v) : String(v)}</span>
                </button>
              ))}
              {Object.entries(matVars).slice(0,12).map(([k,mat]) => (
                <button key={`m_${k}`} onClick={() => { setSection('matrix'); setMatA(mat.map(r=>r.map(String))) }}
                  className="flex items-center gap-1 text-[11px] font-mono hover:bg-purple-500/10 rounded-md px-2 py-0.5 transition-colors border border-transparent hover:border-purple-500/20">
                  <span className="text-purple-300 font-bold">{k}</span>
                  <span className="text-slate-600 text-[10px]">[{mat.length}×{mat[0]?.length}]</span>
                </button>
              ))}
            </>
        }
        {(Object.keys(vars).length > 0 || Object.keys(matVars).length > 0) && (
          <button onClick={() => { setVars({}); setFormulas({}); setMatVars({}) }} className="ml-auto text-[11px] text-slate-500 hover:text-red-400 font-mono transition-colors">× clear</button>
        )}
      </div>

      {/* ── SECTION TABS ── */}
      <div className="flex gap-1 px-3 py-2 border-b border-white/5 shrink-0 overflow-x-auto bg-black/10">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-200 ${section===s.id?'bg-white/10 text-white shadow-sm':'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ══════════════════════════════════════════════════════════════════════
            COMPUTE SECTION
        ══════════════════════════════════════════════════════════════════════ */}
        {section === 'compute' && (
          <div className="p-5">
            <div className="flex gap-3 mb-4">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder='Type any STEM problem: "integrate x^2 from 0 to 1", "derivative of x^3 at x=2", "2^10", "STO→ A 42"...'
                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[15px] font-mono text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all shadow-inner"
              />
              <button onClick={compute} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm shrink-0 shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all active:scale-95">Compute</button>
            </div>
            {/* Quick-reference syntax chips */}
            <div className="flex flex-wrap gap-1 mb-4">
              {[
                ['2^10','calc'],['sin(pi/4)','calc'],['sqrt(2)','calc'],
                ['x = 42','store'],['ans * 2','calc'],
                ['integrate x^2 from 0 to 1','integral'],
                ['derivative of sin(x) at x=0','derivative'],
                ['nDeriv(x^3, x, 2)','calc_fn'],['fnInt(x^2, x, 0, 1)','calc_fn'],
                ['table(x^2, -5, 5, 0.5)','table'],
                ['solve 2x+3=11','solve'],
                ['plot sin(x)','graph'],
              ].map(([ex]) => (
                <button key={ex} onClick={() => setInput(ex)}
                  className="text-xs px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 text-slate-400 hover:text-blue-300 font-mono transition-colors">
                  {ex}
                </button>
              ))}
            </div>

            {result && (
              <>
                {/* Numerical answer bar */}
                <div className="flex items-center gap-4 bg-black/20 border border-white/5 rounded-xl px-5 py-3 mb-4 shadow-inner">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Answer</span>
                  <span className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 flex-1">{result.numerical}</span>
                  <button onClick={() => navigator.clipboard?.writeText(result.numerical)} className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded hover:bg-white/5">copy</button>
                  <button onClick={() => { const name = prompt('Store as variable:'); if (name) { const v = {...vars,[name]:parseFloat(result.numerical)||result.numerical}; setVars(v) }}} className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-white/5">STO→</button>
                </div>

                {/* Result tabs */}
                <div className="flex gap-2 border-b border-white/5 mb-4 pb-1">
                  {[['symbolic','∑ Steps'],['visual','◉ Visual'],['code','</> Code'],['explain','💡 Explain'],['connections','🔗 Connects']].map(([id,label])=>(
                    <button key={id} onClick={() => setTab(id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${tab===id?'bg-blue-500/10 text-blue-400 border border-blue-500/20':'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {tab === 'symbolic' && (
                  <div className="space-y-1">
                    {result.steps?.map((s,i) => <KatexStep key={i} label={s.label} latex={s.latex} />)}
                  </div>
                )}

                {tab === 'visual' && (
                  <div>
                    {result.type === 'integral' && (
                      <CanvasGraph fns={[x => polyEvalAt(result.expr, x)]} xMin={result.a-2} xMax={result.b+2} yMin={-5} yMax={10} />
                    )}
                    {result.type === 'derivative' && (
                      <CanvasGraph
                        fns={[
                          x => polyEvalAt(result.expr, x),
                          x => parseFloat(result.numerical)*(x - result.xv) + polyEvalAt(result.expr, result.xv)
                        ]}
                        xMin={result.xv-5} xMax={result.xv+5} yMin={-10} yMax={10} />
                    )}
                    {result.type === 'calc' && (
                      <CanvasGraph fns={[x => { try { return Number(calcEval(result.expr, { x, pi: Math.PI, e: Math.E })) } catch { return NaN } }]}
                        xMin={-10} xMax={10} yMin={-15} yMax={15} />
                    )}
                    {result.type === 'table' && (
                      <div className="overflow-x-auto">
                        <table className="text-xs font-mono w-full border-collapse">
                          <thead>
                            <tr className="border-b border-slate-700">
                              <th className="text-left px-3 py-1.5 text-slate-400">x</th>
                              <th className="text-right px-3 py-1.5 text-blue-400">f(x)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.tableRows?.map(([x,y],i) => (
                              <tr key={i} className={`border-b border-slate-800/60 ${i%2===0?'bg-slate-900/30':''}`}>
                                <td className="px-3 py-1 text-slate-400">{fmtNum(x,6)}</td>
                                <td className="px-3 py-1 text-right text-green-400">{isFinite(y) ? fmtNum(y,6) : '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {!['integral','derivative','calc','table'].includes(result.type) && (
                      <div className="text-slate-500 text-sm p-4 text-center">Switch to Graph section for interactive plotting.</div>
                    )}
                  </div>
                )}

                {tab === 'code' && result.code && (
                  <div className="space-y-3 font-mono text-xs">
                    {[
                      ['JavaScript','js','bg-yellow-950 border-yellow-800 text-yellow-100'],
                      ['Python / NumPy','py','bg-blue-950 border-blue-800 text-blue-100'],
                      ['Matplotlib','mpl','bg-green-950 border-green-800 text-green-100'],
                      ['PyTorch','pt','bg-purple-950 border-purple-800 text-purple-100'],
                      ['MATLAB','ml','bg-orange-950 border-orange-800 text-orange-100'],
                    ].map(([lang,key,cls])=>(
                      result.code[key] ? (
                        <div key={key}>
                          <div className="text-slate-400 mb-1 font-sans text-xs">{lang}</div>
                          <pre className={`${cls} border rounded-lg p-3 whitespace-pre-wrap overflow-x-auto leading-relaxed`}>{result.code[key]}</pre>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}

                {tab === 'explain' && (
                  <div>
                    <div className="flex gap-2 mb-3">
                      {[['eli5','ELI5'],['student','Student'],['college','College'],['advanced','Advanced']].map(([id,label])=>(
                        <button key={id} onClick={() => setExplainLevel(id)}
                          className={`px-3 py-1 text-xs rounded ${explainLevel===id?'bg-blue-600 text-white':'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{label}</button>
                      ))}
                    </div>
                    {explainText ? (
                      <div className="bg-slate-800 rounded-lg p-4 text-sm text-slate-200 leading-relaxed">{explainText}</div>
                    ) : (
                      <div className="text-slate-500 text-sm p-4">No explanation available for this result type.</div>
                    )}
                  </div>
                )}

                {tab === 'connections' && (
                  <div>
                    {connData ? (
                      <div>
                        <div className="text-xs text-slate-400 mb-2">This concept connects to:</div>
                        <div className="flex flex-wrap gap-2">
                          {connData.map(c => (
                            <span key={c} className="px-3 py-1 rounded-full bg-slate-700 text-slate-200 text-xs border border-slate-600">{c}</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm p-4">No connections mapped for this result.</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MATRIX SECTION
        ══════════════════════════════════════════════════════════════════════ */}
        {section === 'matrix' && (
          <div className="p-5">

            {/* ── Matrix Expression Evaluator ─────────────────────────────── */}
            <div className="mb-5 bg-black/20 border border-purple-500/20 rounded-xl p-3 shadow-inner">
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-2">Matrix Expression  <span className="font-normal text-slate-500 normal-case tracking-normal">uses stored vars — e.g. inv(M)*A*M</span></div>
              <div className="flex gap-2">
                <input value={matExpr} onChange={e => setMatExpr(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && computeMatExpr()}
                  placeholder="inv(M)*A*M  or  A^2  or  trace(A*B)"
                  className="flex-1 text-sm bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white font-mono focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 focus:outline-none transition-all" />
                <button onClick={computeMatExpr} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold transition-all active:scale-95 shadow">Eval</button>
              </div>
              {matExprResult && (
                <div className="mt-2 text-sm font-mono">
                  <span className="text-slate-400 text-[11px]">{matExprResult.expr} =</span>
                  {matExprResult.error
                    ? <span className="text-red-400 ml-2">{matExprResult.error}</span>
                    : matExprResult.mat
                      ? <div className="text-emerald-400 mt-1">
                          {matExprResult.mat.map((r,i) => (
                            <div key={i}>[{r.map(x => (+x.toFixed(4)).toString().padStart(10)).join('  ')}]</div>
                          ))}
                          <span className="text-[10px] text-slate-500 mt-1 block">↑ loaded into A</span>
                        </div>
                      : <span className="text-emerald-400 ml-2">{matExprResult.scalar}</span>
                  }
                </div>
              )}
              {/* Stored matrix vars */}
              {Object.keys(matVars).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 self-center">Stored:</span>
                  {Object.entries(matVars).map(([name, mat]) => (
                    <div key={name} className="flex items-center gap-0.5">
                      <button onClick={() => setMatA(mat.map(r => r.map(String)))}
                        className="text-[11px] font-mono px-2 py-0.5 rounded-l bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/20 transition-colors">
                        {name} <span className="text-slate-500">[{mat.length}×{mat[0]?.length}]</span>
                      </button>
                      {currentOp.needsB && (
                        <button onClick={() => setMatB(mat.map(r => r.map(String)))}
                          title="Load into B"
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded-r bg-white/5 hover:bg-white/15 text-slate-400 border border-white/10 border-l-0 transition-colors">→B</button>
                      )}
                      <button onClick={() => { const v={...matVars}; delete v[name]; setMatVars(v) }}
                        className="text-[10px] px-1 py-0.5 rounded bg-transparent hover:text-red-400 text-slate-600 transition-colors ml-0.5">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mb-5 p-2 bg-black/10 rounded-xl border border-white/5 shadow-inner">
              {OPERATIONS.map(op => (
                <button key={op.id} onClick={() => setMatOp(op.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all font-medium ${matOp===op.id?'bg-blue-500 text-white shadow-md shadow-blue-500/20':'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-transparent hover:border-white/10'}`}>
                  {op.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-1">
              <span className="text-[11px] font-bold text-blue-300 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded">Matrix A</span>
              <button onClick={() => { const name = prompt('Store A as:')?.trim(); if (name) setMatVars({...matVars, [name]: parseMatrix(matA)}) }}
                className="text-[11px] text-slate-400 hover:text-purple-300 font-semibold transition-colors px-2 py-0.5 rounded hover:bg-purple-500/10">+ Store A</button>
            </div>
            <MatrixInput matrix={matA} onChange={setMatA} label="A" />
            {currentOp.needsB && (
              <>
                <div className="flex items-center gap-3 mb-1 mt-2">
                  <span className="text-[11px] font-bold text-blue-300 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded">Matrix B</span>
                  <button onClick={() => { const name = prompt('Store B as:')?.trim(); if (name) setMatVars({...matVars, [name]: parseMatrix(matB)}) }}
                    className="text-[11px] text-slate-400 hover:text-purple-300 font-semibold transition-colors px-2 py-0.5 rounded hover:bg-purple-500/10">+ Store B</button>
                </div>
              </>
            )}
            {currentOp.needsB && <MatrixInput matrix={matB} onChange={setMatB} label="B" />}
            {currentOp.needsAug && (
              <div className="mb-4">
                <div className="text-[11px] font-bold text-blue-300 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded inline-block mb-2">Vector b</div>
                <MatrixInput matrix={matAugB} onChange={setMatAugB} label="b" />
              </div>
            )}
            {(matOp === 'power' || matOp === 'scalar') && (
              <div className="mb-4 flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5 w-max shadow-inner">
                <label className="text-[11px] font-bold text-blue-300 font-mono uppercase tracking-wider">{matOp === 'power' ? 'n (power)' : 'scalar c'}</label>
                <input type="number" value={matN} onChange={e => setMatN(parseFloat(e.target.value))}
                  className="w-20 text-center text-sm bg-white/5 border border-white/10 rounded-lg py-1.5 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 focus:bg-white/10 focus:outline-none transition-all shadow-inner" />
              </div>
            )}
            <button onClick={computeMatrix} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm mb-5 shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all active:scale-95">Compute Matrix</button>

            {result?.type === 'matrix' && (
              <>
                <div className="flex gap-2 border-b border-white/5 mb-4 pb-1">
                  {[['symbolic','∑ Steps'],['visual','◉ Visual'],['code','</> Code'],['explain','💡 Explain'],['connections','🔗 Connects']].map(([id,label])=>(
                    <button key={id} onClick={() => setTab(id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${tab===id?'bg-blue-500/10 text-blue-400 border border-blue-500/20':'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                {tab === 'symbolic' && <div className="space-y-1">{result.steps?.map((s,i)=><KatexStep key={i} label={s.label} latex={s.latex} />)}</div>}
                {tab === 'visual' && (
                  <div>
                    {(matOp === 'transform2d' || matOp === 'eigen') && (() => {
                      const A = parseMatrix(matA)
                      if (A.length !== 2 || A[0].length !== 2 || hasNaN(A)) return <div className="text-slate-500 text-sm">Need 2×2 matrix for 2D visualization.</div>
                      const W = 300, H = 300, cx = W/2, cy = H/2, sc = 50
                      const pts = [[1,0],[0,1],[-1,0],[0,-1]]
                      const tPts = pts.map(([x,y]) => [A[0][0]*x+A[0][1]*y, A[1][0]*x+A[1][1]*y])
                      return (
                        <svg width={W} height={H} className="rounded bg-slate-800 border border-slate-700">
                          <line x1={0} y1={cy} x2={W} y2={cy} stroke="#334155" strokeWidth={1} />
                          <line x1={cx} y1={0} x2={cx} y2={H} stroke="#334155" strokeWidth={1} />
                          {pts.map(([x,y],i)=><line key={`o${i}`} x1={cx} y1={cy} x2={cx+x*sc} y2={cy-y*sc} stroke="#475569" strokeWidth={1} strokeDasharray="4"/>)}
                          {tPts.map(([x,y],i)=><line key={`t${i}`} x1={cx} y1={cy} x2={cx+x*sc} y2={cy-y*sc} stroke={['#60a5fa','#34d399','#f472b6','#fb923c'][i]} strokeWidth={2} markerEnd="url(#arrowBlue)"/>)}
                          {pts.map(([x,y],i)=><circle key={`op${i}`} cx={cx+x*sc} cy={cy-y*sc} r={3} fill="#475569"/>)}
                          {tPts.map(([x,y],i)=><circle key={`tp${i}`} cx={cx+x*sc} cy={cy-y*sc} r={4} fill={['#60a5fa','#34d399','#f472b6','#fb923c'][i]}/>)}
                        </svg>
                      )
                    })()}
                    {matOp !== 'transform2d' && matOp !== 'eigen' && <div className="text-slate-500 text-sm p-4 text-center">Visual available for 2D Transform. For other ops, see symbolic steps above.</div>}
                  </div>
                )}
                {tab === 'code' && result.code && (
                  <div className="space-y-3 font-mono text-xs">
                    {[['JavaScript','js','bg-yellow-950 border-yellow-800'],['Python','py','bg-blue-950 border-blue-800'],['MATLAB','ml','bg-orange-950 border-orange-800']].map(([lang,key,cls])=>(
                      <div key={key}><div className="text-slate-400 mb-1 font-sans">{lang}</div>
                        <pre className={`${cls} border rounded-lg p-3 whitespace-pre-wrap text-slate-200 overflow-x-auto`}>{result.code[key]||'// Not available'}</pre>
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'explain' && (
                  <div>
                    <div className="flex gap-2 mb-3">{[['eli5','ELI5'],['student','Student'],['college','College'],['advanced','Advanced']].map(([id,label])=>(
                      <button key={id} onClick={()=>setExplainLevel(id)} className={`px-3 py-1 text-xs rounded ${explainLevel===id?'bg-blue-600 text-white':'bg-slate-700 text-slate-300'}`}>{label}</button>
                    ))}</div>
                    {explainText ? <div className="bg-slate-800 rounded-lg p-4 text-sm text-slate-200 leading-relaxed">{explainText}</div> : <div className="text-slate-500 text-sm p-4">No explanation available.</div>}
                  </div>
                )}
                {tab === 'connections' && result.connKey && CONNECTIONS[result.connKey] && (
                  <div className="flex flex-wrap gap-2 pt-2">{CONNECTIONS[result.connKey].map(c=><span key={c} className="px-3 py-1 rounded-full bg-slate-700 text-slate-200 text-xs border border-slate-600">{c}</span>)}</div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            SIGMA SECTION
        ══════════════════════════════════════════════════════════════════════ */}
        {section === 'sigma' && (
          <div className="p-5">
            <div className="flex items-center gap-4 flex-wrap mb-5">
              <div className="flex items-center gap-3 bg-black/20 p-4 rounded-xl border border-white/5 shadow-inner">
                <span className="text-blue-400 text-2xl font-black">Σ</span>
                <div><div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">i from</div>
                  <input value={sigLo} onChange={e=>setSigLo(e.target.value)} className="w-16 text-center text-sm bg-white/5 border border-white/10 rounded-lg py-1.5 text-white font-mono focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 focus:outline-none transition-all shadow-inner" /></div>
                <div><div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">to (n or num)</div>
                  <input value={sigHi} onChange={e=>setSigHi(e.target.value)} className="w-20 text-center text-sm bg-white/5 border border-white/10 rounded-lg py-1.5 text-white font-mono focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 focus:outline-none transition-all shadow-inner" /></div>
                <div><div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">f(i) =</div>
                  <input value={sigExpr} onChange={e=>setSigExpr(e.target.value)} className="w-32 px-3 text-sm bg-white/5 border border-white/10 rounded-lg py-1.5 text-white font-mono focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 focus:outline-none transition-all shadow-inner" /></div>
                {sigHi === 'n' && <div><div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">n =</div>
                  <input type="number" value={sigN} onChange={e=>setSigN(parseInt(e.target.value)||10)} className="w-16 text-center text-sm bg-white/5 border border-white/10 rounded-lg py-1.5 text-white font-mono focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 focus:outline-none transition-all shadow-inner" /></div>}
              </div>
              <button onClick={computeSigma} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all active:scale-95">Compute</button>
            </div>
            <div className="flex gap-2 flex-wrap mb-5">
              {[['1','n','1'],['i','n','i'],['i^2','n','i^2'],['i^3','n','i^3'],['2^i','10','2^i'],['1/i','20','1/i']].map(([e,h,l])=>(
                <button key={l} onClick={()=>{setSigExpr(e);setSigHi(h);setSigLo('1')}} className="text-[11px] px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 font-mono font-medium transition-colors border border-transparent hover:border-white/10">{l}</button>
              ))}
            </div>
            {result?.type === 'sigma' && (
              <>
                <div className="bg-black/20 border border-white/5 rounded-xl px-5 py-4 mb-4 font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 text-2xl shadow-inner">Σ = {result.numerical}</div>
                <div className="space-y-1 mb-5">{result.steps?.map((s,i)=><KatexStep key={i} label={s.label} latex={s.latex} />)}</div>
                {result.terms?.length > 0 && (
                  <div className="mb-5 bg-black/20 p-4 rounded-xl border border-white/5 shadow-inner">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Bar chart of terms</div>
                    <svg width="100%" viewBox={`0 0 ${Math.min(result.terms.length*28+40,840)} 120`} className="rounded-lg">
                      {(() => {
                        const max = Math.max(...result.terms.map(Math.abs), 1)
                        return result.terms.slice(0,30).map((v,i)=>{
                          const barH = Math.abs(v)/max * 80; const x = 20+i*28; const y = v>=0 ? 90-barH : 90
                          return <g key={i}><rect x={x} y={y} width={20} height={barH} fill={v>=0?'#4ade80':'#f87171'} rx={2}/>
                            <text x={x+10} y={108} textAnchor="middle" fontSize={8} fill="#94a3b8" fontWeight="600">{i+parseInt(sigLo)}</text></g>
                        })
                      })()}
                      <line x1={20} x2={840} y1={90} y2={90} stroke="#475569" strokeWidth={1}/>
                    </svg>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            POLYNOMIAL SECTION
        ══════════════════════════════════════════════════════════════════════ */}
        {section === 'poly' && (
          <div className="p-5">
            <div className="flex gap-3 mb-4">
              <input value={polyExpr} onChange={e=>setPolyExpr(e.target.value)}
                placeholder="e.g. x^2 - 5*x + 6, x^3 - 6x^2 + 11x - 6"
                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[15px] font-mono text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all shadow-inner" />
              <button onClick={computePoly} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm shrink-0 shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all active:scale-95">Solve</button>
            </div>
            <div className="flex gap-2 flex-wrap mb-5">
              {['x^2 - 4','x^2 - 5*x + 6','x^3 - 6*x^2 + 11*x - 6','x^2 + 1','2*x^2 - 4*x - 6','x^4 - 5*x^2 + 4','x^3 - 2*x^2 - x + 2'].map(p=>(
                <button key={p} onClick={()=>setPolyExpr(p)} className="text-[11px] px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 font-mono font-medium transition-colors border border-transparent hover:border-white/10">{p}</button>
              ))}
            </div>
            {result?.type === 'poly' && (
              <>
                <div className="bg-black/20 border border-white/5 rounded-xl px-5 py-4 mb-4 font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 shadow-inner">
                  Roots: {result.numerical}&nbsp;&nbsp;
                  {result.degree !== null && <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 ml-3">degree {result.degree}</span>}
                </div>
                <div className="space-y-1 mb-5">{result.steps?.map((s,i)=><KatexStep key={i} label={s.label} latex={s.latex} />)}</div>
                <div className="mb-5 bg-black/20 p-4 rounded-xl border border-white/5 shadow-inner">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Graph — hover to trace</div>
                  <CanvasGraph
                    fns={[x => polyEvalAt(result.expr, x)]}
                    xMin={-8} xMax={8}
                    yMin={-20} yMax={20}
                    highlightRoots={result.roots||[]}
                    width={860} height={280} />
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STATS SECTION
        ══════════════════════════════════════════════════════════════════════ */}
        {section === 'stats' && (
          <div className="p-5">
            <div className="flex gap-3 mb-4">
              <input value={statsData} onChange={e=>setStatsData(e.target.value)}
                placeholder="Enter numbers separated by commas: 1, 2, 3, 4, 5"
                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[15px] font-mono text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all shadow-inner" />
              <button onClick={computeStats} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm shrink-0 shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all active:scale-95">Analyze</button>
            </div>
            {result?.type === 'stats' && (
              <>
                <div className="space-y-1 mb-5">{result.steps?.map((s,i)=><KatexStep key={i} label={s.label} latex={s.latex} />)}</div>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5 shadow-inner">
                  <svg width="100%" viewBox={`0 0 ${result.data.length*40+60} 140`}>
                    {(() => {
                      const max = Math.max(...result.data.map(Math.abs), 1)
                      const mean = result.data.reduce((s,x)=>s+x,0)/result.data.length
                      return <>
                        {result.data.map((v,i)=>{
                          const barH = Math.abs(v)/max*100; const x=30+i*40; const y=v>=0?110-barH:110
                          return <g key={i}><rect x={x} y={y} width={30} height={barH} fill="#818cf8" rx={4} opacity={0.9}/>
                            <text x={x+15} y={128} textAnchor="middle" fontSize={9} fill="#94a3b8" fontWeight="600">{fmtNum(v)}</text></g>
                        })}
                        <line x1={30} x2={result.data.length*40+30} y1={110} y2={110} stroke="#475569" strokeWidth={1}/>
                        {isFinite(mean) && <line x1={30} x2={result.data.length*40+30} y1={110-mean/max*100} y2={110-mean/max*100} stroke="#f472b6" strokeWidth={1.5} strokeDasharray="4"/>}
                      </>
                    })()}
                  </svg>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            PHYSICS SECTION
        ══════════════════════════════════════════════════════════════════════ */}
        {section === 'physics' && (
          <div className="p-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Select a formula</div>
            <div className="flex flex-wrap gap-1.5 mb-5 p-2 bg-black/10 rounded-xl border border-white/5 shadow-inner">
              {PHYSICS_FORMULAS.map((f,i) => (
                <button key={i} onClick={() => { setPhysFormula(f); setPhysVarsLocal(Object.fromEntries((f.vars||[]).map(v=>[v,'']))) }}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all font-medium ${physFormula?.name===f.name?'bg-blue-500 text-white shadow-md shadow-blue-500/20':'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-transparent hover:border-white/10'}`}>
                  {f.name}
                </button>
              ))}
            </div>
            {physFormula && (
              <div>
                <div className="bg-black/20 border border-white/5 rounded-xl p-5 mb-5 shadow-inner">
                  <KatexStep label={physFormula.desc} latex={physFormula.latex} />
                </div>
                <div className="flex flex-wrap gap-4 mb-5 p-4 bg-black/20 border border-white/5 rounded-xl shadow-inner">
                  {(physFormula.vars || []).map(v => (
                    <div key={v} className="flex items-center gap-3">
                      <div className="text-xs font-bold text-blue-300 font-mono uppercase">{v} =</div>
                      <input value={physVarsLocal[v]||''} onChange={e=>setPhysVarsLocal(p=>({...p,[v]:e.target.value}))}
                        className="w-24 text-center text-sm bg-white/5 border border-white/10 rounded-lg py-1.5 text-white font-mono focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 focus:outline-none transition-all shadow-inner" />
                    </div>
                  ))}
                </div>
                <button onClick={computePhysics} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all active:scale-95">Solve</button>
                {result?.type === 'physics' && (
                  <div className="mt-5">
                    <div className="bg-black/20 border border-white/5 rounded-xl px-5 py-4 mb-4 font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 text-2xl shadow-inner">{result.numerical}</div>
                    <div className="space-y-1">{result.steps?.map((s,i)=><KatexStep key={i} label={s.label} latex={s.latex} />)}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MACHINIST SECTION
        ══════════════════════════════════════════════════════════════════════ */}
        {section === 'machinist' && (
          <div className="p-5">
            {/* Formula picker */}
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Select formula</div>
            <div className="flex flex-wrap gap-1.5 mb-5 p-2 bg-black/10 rounded-xl border border-white/5 shadow-inner">
              {MACHINIST_FORMULAS.map((f,i) => (
                <button key={i} onClick={() => { setMachFormula(f); setMachVarsLocal(Object.fromEntries((f.vars||[]).map(v=>[v,'']))); setMachResult(null) }}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all font-medium ${machFormula?.name===f.name?'bg-orange-500 text-white shadow-md shadow-orange-500/20':'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-transparent hover:border-white/10'}`}>
                  {f.name}
                </button>
              ))}
            </div>

            {machFormula && (
              <div className="flex gap-5 flex-wrap lg:flex-nowrap">
                {/* Left: formula card + inputs + results + explanations */}
                <div className="flex-1 min-w-0">
                  <div className="bg-black/20 border border-white/5 rounded-xl p-5 mb-5 shadow-inner">
                    <div className="text-sm font-bold text-orange-400 mb-2 uppercase tracking-wide">{machFormula.fullName}</div>
                    <div className="text-xs text-slate-400 mb-4">{machFormula.desc}</div>
                    <KatexStep label="" latex={machFormula.latex} />
                    {machFormula.units && (
                      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-x-5 gap-y-1">
                        {Object.entries(machFormula.units).map(([k,u]) => (
                          <div key={k} className="text-xs text-slate-500 font-mono"><span className="text-orange-200/50">{k}</span>: {u}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Variable inputs */}
                  <div className="flex flex-wrap gap-4 mb-5 p-4 bg-black/20 border border-white/5 rounded-xl shadow-inner">
                    {(machFormula.vars || []).map(v => (
                      <div key={v} className="flex flex-col gap-1">
                        <div className="text-[11px] font-bold text-orange-300 font-mono uppercase pl-1">{v}</div>
                        <input value={machVarsLocal[v]||''} onChange={e=>setMachVarsLocal(p=>({...p,[v]:e.target.value}))}
                          placeholder="0"
                          className="w-24 text-center text-sm bg-white/5 border border-white/10 rounded-lg py-2 text-white font-mono focus:border-orange-400 focus:ring-1 focus:ring-orange-400/50 focus:outline-none transition-all shadow-inner" />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 mb-5">
                    <button onClick={computeMachinist} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-xl font-bold text-sm shadow-[0_4px_15px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 transition-all active:scale-95">Solve</button>
                    <span className="text-xs text-slate-500 flex items-center gap-2">→ <span className="text-orange-400 font-mono font-bold bg-orange-500/10 px-2 py-1 rounded">{machFormula.solves}</span></span>
                  </div>

                  {/* Result */}
                  {machResult && (
                    <div className="mb-5">
                      <div className="bg-black/20 border border-white/5 rounded-xl px-5 py-4 mb-4 font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 text-2xl shadow-inner">{machResult.answer}</div>
                      {/* Bolt circle coordinate table */}
                      {machResult.coords && (
                        <div className="overflow-x-auto mb-4 bg-black/20 rounded-xl border border-white/5 shadow-inner">
                          <table className="text-xs font-mono w-full border-collapse">
                            <thead>
                              <tr className="border-b border-white/10 bg-white/5">
                                <th className="text-left px-4 py-2 text-slate-400 font-semibold">Hole</th>
                                <th className="text-right px-4 py-2 text-slate-400 font-semibold">X</th>
                                <th className="text-right px-4 py-2 text-slate-400 font-semibold">Y</th>
                              </tr>
                            </thead>
                            <tbody>
                              {machResult.coords.map(({k,x,y}) => (
                                <tr key={k} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="px-4 py-2 text-slate-500 font-bold">{k+1}</td>
                                  <td className="px-4 py-2 text-right text-slate-300">{fmtNum(x, 5)}</td>
                                  <td className="px-4 py-2 text-right text-slate-300">{fmtNum(y, 5)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <div className="space-y-1">{machResult.steps?.map((s,i)=><KatexStep key={i} label={s.label} latex={s.latex} />)}</div>
                    </div>
                  )}

                  {/* Explanations */}
                  {machFormula.explain && (
                    <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex gap-2 mb-3">
                        {['eli5','student','college','advanced'].map(l => (
                          <button key={l} onClick={() => setExplainLevel(l)}
                            className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-md transition-colors ${explainLevel===l?'bg-orange-500/20 text-orange-400 border border-orange-500/30':'bg-black/20 text-slate-400 hover:bg-white/10 border border-transparent'}`}>
                            {l}
                          </button>
                        ))}
                      </div>
                      <div className="text-sm text-slate-300 leading-relaxed">{machFormula.explain[explainLevel]}</div>
                    </div>
                  )}

                  {/* Reference links */}
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Reference docs</div>
                    <div className="flex flex-wrap gap-2">
                      <a href="#/reference" className="text-xs px-3 py-1.5 rounded-lg bg-black/20 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-slate-300 hover:text-blue-400 transition-all">📐 Math Reference</a>
                      <a href="#/linear-algebra" className="text-xs px-3 py-1.5 rounded-lg bg-black/20 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-slate-300 hover:text-blue-400 transition-all">⊞ Linear Algebra</a>
                      <a href="#/cnc-sim" className="text-xs px-3 py-1.5 rounded-lg bg-black/20 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 text-slate-300 hover:text-orange-400 transition-all">🔧 CNC Sim</a>
                    </div>
                  </div>
                </div>

                {/* Right: SVG visualization */}
                <div className="flex flex-col items-center gap-4 shrink-0 bg-black/20 p-5 rounded-xl border border-white/5 shadow-inner h-max">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Diagram</div>
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5">
                    <MachinistViz viz={machFormula.viz} vars={machVarsLocal} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TRIANGLE SECTION
        ══════════════════════════════════════════════════════════════════════ */}
        {section === 'triangle' && (
          <div className="p-5">
            <div className="text-[11px] font-semibold text-slate-400 mb-4 uppercase tracking-wider">Enter any 3 known values. Angles in {angleMode}. Leave unknowns blank.</div>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                ['Right: a=3 b=4','a','3','b','4','C','90'],
                ['SAS: a=7 b=10 C=45°','a','7','b','10','C','45'],
                ['ASA: A=35° B=65° c=20','A','35','B','65','c','20'],
                ['SSS: a=5 b=7 c=8','a','5','b','7','c','8'],
                ['AAS: A=40° B=60° a=14','A','40','B','60','a','14'],
              ].map(([label,...args]) => (
                <button key={label} onClick={() => {
                  const sv={a:'',b:'',c:''}, an={A:'',B:'',C:''}
                  for (let i=0; i<args.length; i+=2) {
                    if ('abc'.includes(args[i])) sv[args[i]] = args[i+1]
                    else an[args[i]] = args[i+1]
                  }
                  setTriSides(sv); setTriAngles(an); setTriResult(null)
                }} className="text-[11px] px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 font-mono font-medium transition-colors border border-transparent hover:border-white/10">{label}</button>
              ))}
            </div>

            <div className="flex gap-8 flex-wrap lg:flex-nowrap">
              {/* Inputs */}
              <div className="flex-1 bg-black/20 p-5 rounded-xl border border-white/5 shadow-inner min-w-[300px]">
                <div className="flex gap-8 mb-6">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-wider">Sides</div>
                    <div className="flex flex-col gap-3">
                      {['a','b','c'].map(k => (
                        <div key={k} className="flex items-center gap-3">
                          <span className="text-sm font-bold font-mono text-emerald-400 w-4">{k}</span>
                          <span className="text-slate-600">=</span>
                          <input value={triSides[k]} onChange={e=>setTriSides(p=>({...p,[k]:e.target.value}))}
                            placeholder="?" className="w-24 text-center text-sm bg-white/5 border border-white/10 rounded-lg py-1.5 text-white font-mono focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 focus:outline-none transition-all shadow-inner" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-wider">Angles ({angleMode})</div>
                    <div className="flex flex-col gap-3">
                      {['A','B','C'].map(k => (
                        <div key={k} className="flex items-center gap-3">
                          <span className="text-sm font-bold font-mono text-amber-400 w-4">{k}</span>
                          <span className="text-slate-600">=</span>
                          <input value={triAngles[k]} onChange={e=>setTriAngles(p=>({...p,[k]:e.target.value}))}
                            placeholder="?" className="w-24 text-center text-sm bg-white/5 border border-white/10 rounded-lg py-1.5 text-white font-mono focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 focus:outline-none transition-all shadow-inner" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-white/5">
                  <button onClick={computeTriangle} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all active:scale-95">Solve</button>
                  <button onClick={() => { setTriSides({a:'',b:'',c:''}); setTriAngles({A:'',B:'',C:''}); setTriResult(null) }} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-semibold text-sm transition-colors">Clear</button>
                </div>
                <div className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest font-semibold space-y-1">
                  <div>a, b, c = sides opposite angles A, B, C</div>
                  <div>A + B + C = 180°</div>
                </div>
              </div>

              {/* SVG diagram */}
              {triResult && !triResult.error && (
                <div className="flex flex-col items-center bg-black/20 p-5 rounded-xl border border-white/5 shadow-inner">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 mb-4">
                    <TriangleSVG a={triResult.a} b={triResult.b} c={triResult.c}
                      A={triResult.A*Math.PI/180} B={triResult.B*Math.PI/180} C={triResult.C*Math.PI/180} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs font-mono w-full">
                    {[['Area',triResult.area],['Perimeter',parseFloat((triResult.a+triResult.b+triResult.c).toFixed(6))],['Circumradius R',triResult.R],['Inradius r',triResult.r]].map(([k,v])=>(
                      <div key={k} className="flex justify-between gap-4 border-b border-white/5 pb-1"><span className="text-slate-500">{k}</span><span className="text-emerald-400 font-bold">{v}</span></div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {triResult?.error && (
              <div className="mt-5 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 shadow-inner">{triResult.error}</div>
            )}

            {/* Steps */}
            {triResult && !triResult.error && (
              <div className="mt-6 space-y-1">
                {triResult.steps?.map((s,i) => <KatexStep key={i} label={s.label} latex={s.latex} />)}
              </div>
            )}

            {/* Reference laws */}
            <div className="mt-8 pt-5 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 col-span-full mb-1">Reference Formulas</div>
              {[
                ['Law of Sines','\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C}'],
                ['Law of Cosines','c^2 = a^2 + b^2 - 2ab\\cos C'],
                ['Area','\\text{Area} = \\tfrac{1}{2}ab\\sin C = \\sqrt{s(s-a)(s-b)(s-c)}'],
                ['Angles sum','A + B + C = 180^\\circ'],
              ].map(([lbl,lat]) => (
                <div key={lbl} className="flex items-center gap-4 text-xs bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-slate-400 w-28 shrink-0 font-medium">{lbl}</span>
                  <KatexInline expr={lat} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            GRAPH SECTION
        ══════════════════════════════════════════════════════════════════════ */}
        {section === 'graph' && (
          <div className="p-5">
            <div className="flex flex-wrap gap-4 mb-4 items-end bg-black/20 p-4 rounded-xl border border-white/5 shadow-inner">
              {graphFns.map((fn,i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="text-[11px] font-bold uppercase font-mono tracking-wider" style={{color:['#60a5fa','#34d399','#f472b6','#fb923c'][i]}}>y{i+1} =</div>
                  <input value={fn} onChange={e=>{ const f=[...graphFns]; f[i]=e.target.value; setGraphFns(f) }}
                    className="w-40 text-sm bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white font-mono focus:ring-1 focus:outline-none transition-all shadow-inner"
                    style={{ '--tw-ring-color': ['#60a5fa','#34d399','#f472b6','#fb923c'][i] }} />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mb-5 items-end text-xs text-slate-400">
              {[['xMin',graphXMin,setGraphXMin],['xMax',graphXMax,setGraphXMax],['yMin',graphYMin,setGraphYMin],['yMax',graphYMax,setGraphYMax]].map(([label,val,set])=>(
                <div key={label} className="flex flex-col gap-1"><div className="text-[10px] font-bold uppercase tracking-wider">{label}</div>
                  <input type="number" value={val} onChange={e=>set(parseFloat(e.target.value)||0)}
                    className="w-20 text-center text-sm bg-black/20 border border-white/10 rounded-lg py-1.5 text-white font-mono focus:border-blue-400 focus:outline-none shadow-inner transition-colors" />
                </div>
              ))}
              <button onClick={()=>{setGraphXMin(-10);setGraphXMax(10);setGraphYMin(-10);setGraphYMax(10)}} className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 self-end font-medium transition-colors border border-transparent hover:border-white/10">reset bounds</button>
            </div>
            <div className="bg-black/20 p-2 rounded-xl border border-white/5 shadow-inner">
              <CanvasGraph fns={builtGraphFns} xMin={graphXMin} xMax={graphXMax} yMin={graphYMin} yMax={graphYMax} width={860} height={380} />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            SCRIPT SECTION
        ══════════════════════════════════════════════════════════════════════ */}
        {section === 'script' && (
          <div className="p-5">
            {/* Language selector */}
            <div className="flex items-center gap-2 mb-4 p-2 bg-black/20 rounded-xl border border-white/5 shadow-inner">
              {[['js','JavaScript','#f59e0b'],['python','Python (Pyodide)','#60a5fa'],['matlab','OpenMAT','#f97316']].map(([id,label,col])=>(
                <button key={id} onClick={()=>{ setScriptLang(id); setScriptOutput(''); setMlOutput(''); setMlWorkspace([]) }}
                  className={`px-4 py-2 text-xs rounded-lg font-bold transition-all shadow-sm ${scriptLang===id?'text-white shadow-md':'bg-white/5 text-slate-400 hover:bg-white/10 border border-transparent'}`}
                  style={scriptLang===id?{background:col,color:'#0f172a'}:{}}>
                  {label}
                </button>
              ))}
              {scriptLang === 'python' && (
                <span className={`text-[11px] font-bold uppercase tracking-wider ml-3 ${pyodideStatus==='ready'?'text-emerald-400':pyodideStatus==='loading'?'text-amber-400':pyodideStatus==='error'?'text-red-400':'text-slate-500'}`}>
                  {pyodideStatus==='ready'?'● Runtime ready':pyodideStatus==='loading'?'⏳ Loading...':pyodideStatus==='error'?'✗ Load failed':'○ First run loads runtime'}
                </span>
              )}
              {scriptLang === 'matlab' && (
                <span className={`text-[11px] font-bold uppercase tracking-wider ml-3 ${mlStatus==='done'?'text-emerald-400':mlStatus==='running'?'text-amber-400':mlStatus==='error'?'text-red-400':'text-slate-500'}`}>
                  {mlStatus==='done'?'● Done':mlStatus==='running'?'⏳ Running...':mlStatus==='error'?'✗ Error':'○ Browser engine'}
                </span>
              )}
              <div className="ml-auto flex items-center gap-3 pr-1">
                {scriptLang !== 'matlab' && (
                  <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 border border-white/5">
                    <input value={scriptName} onChange={e=>setScriptName(e.target.value)} placeholder="name to save..."
                      className="w-32 text-xs bg-transparent border-none rounded px-2 py-1 text-white font-mono focus:outline-none placeholder-slate-600" />
                    <button onClick={() => { if (scriptName.trim()) setScripts2({...scripts,[scriptName.trim()]: scriptLang==='python' ? pyScript : script}) }}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded text-xs font-semibold transition-colors">Save</button>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (scriptLang === 'python') runPython()
                    else if (scriptLang === 'matlab') runMatlab()
                    else runScript()
                  }}
                  className={`px-6 py-2 rounded-lg text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 ${scriptLang==='matlab'?'bg-gradient-to-r from-orange-600 to-red-600 hover:shadow-orange-500/30':scriptLang==='python'?'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30':'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-500/30'}`}>
                  {mlStatus === 'running' && scriptLang === 'matlab' ? '⏳ Running…' : '▶ Run'}
                </button>
              </div>
            </div>

            {/* Saved scripts */}
            {Object.keys(scripts).length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap px-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider self-center mr-2">Saved:</span>
                {Object.keys(scripts).map(name=>(
                  <button key={name} onClick={()=>{
                    if (scriptLang==='python') setPyScript(scripts[name])
                    else setScript(scripts[name]); setScriptName(name)
                  }} className="text-xs font-mono px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-slate-300 transition-colors">{name}</button>
                ))}
              </div>
            )}

            {/* Editor */}
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <Suspense fallback={<div className="text-slate-400 text-sm p-4 bg-black/40">Loading editor...</div>}>
                <MonacoEditor
                  height="280px"
                  language={scriptLang === 'python' ? 'python' : scriptLang === 'matlab' ? 'plaintext' : 'javascript'}
                  theme="vs-dark"
                  value={scriptLang === 'python' ? pyScript : scriptLang === 'matlab' ? mlScript : script}
                  onChange={v => { if (scriptLang==='python') setPyScript(v||''); else if (scriptLang==='matlab') setMlScript(v||''); else setScript(v||'') }}
                  options={{ minimap:{enabled:false}, fontSize:13, wordWrap:'on', scrollBeyondLastLine:false, tabSize:2, padding:{top:10,bottom:10} }} />
              </Suspense>
            </div>

            {/* Output — JS / Python */}
            {scriptLang !== 'matlab' && (
              <div className="mt-4 bg-[#0a0a0a] rounded-xl border border-white/10 p-4 font-mono text-sm min-h-[4rem] max-h-48 overflow-y-auto shadow-inner">
                {scriptOutput
                  ? <pre className="text-emerald-400 whitespace-pre-wrap">{scriptOutput}</pre>
                  : <span className="text-slate-600 select-none">Output appears here after ▶ Run...</span>}
              </div>
            )}

            {/* Output — OpenMAT */}
            {scriptLang === 'matlab' && (mlStatus !== 'idle') && (
              <div className="mt-4 space-y-3">
                <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-4 font-mono text-sm min-h-[4rem] max-h-56 overflow-y-auto shadow-inner">
                  {mlOutput
                    ? <pre className={`whitespace-pre-wrap ${mlStatus==='error'?'text-red-400':'text-emerald-400'}`}>{mlOutput}</pre>
                    : <span className="text-slate-600">No output.</span>}
                </div>
                {mlWorkspace.length > 0 && (
                  <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden shadow-inner">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-4 py-2 border-b border-white/5">Workspace</div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-mono">
                        <thead><tr className="text-slate-500 border-b border-white/5">
                          <th className="text-left px-4 py-1.5 font-semibold">Name</th>
                          <th className="text-left px-4 py-1.5 font-semibold">Size</th>
                          <th className="text-left px-4 py-1.5 font-semibold">Class</th>
                          <th className="text-left px-4 py-1.5 font-semibold">Value</th>
                          <th className="px-2 py-1.5"></th>
                        </tr></thead>
                        <tbody>
                          {mlWorkspace.map(w => (
                            <tr key={w.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="px-4 py-1.5 text-blue-300 font-bold">{w.name}</td>
                              <td className="px-4 py-1.5 text-slate-400">{w.size?.join('×')}</td>
                              <td className="px-4 py-1.5 text-slate-500">{w.className}</td>
                              <td className="px-4 py-1.5 text-emerald-400 max-w-[200px] truncate">{w.preview}</td>
                              <td className="px-2 py-1.5">
                                {Array.isArray(w.value) && Array.isArray(w.value[0]) && (
                                  <button onClick={() => { setMatVars({...matVars, [w.name]: w.value}); setSection('matrix') }}
                                    className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold px-1.5 py-0.5 rounded hover:bg-purple-500/10 transition-colors">→ mat</button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            {scriptLang === 'matlab' && mlStatus === 'idle' && (
              <div className="mt-4 bg-orange-500/10 border border-orange-500/20 rounded-xl px-5 py-3 text-sm text-orange-200 shadow-inner">
                <strong className="font-bold text-orange-300">OpenMAT</strong> — MATLAB-like engine running entirely in the browser via mathjs. Supports matrices, plots, control flow, and most numeric MATLAB syntax. Press <strong>▶ Run</strong> to execute.
              </div>
            )}

            {/* Matplotlib images */}
            {pyImages.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4 p-4 bg-black/20 rounded-xl border border-white/5 shadow-inner">
                {pyImages.map((src,i) => (
                  <img key={i} src={src} alt={`Plot ${i+1}`} className="max-w-full rounded-lg border border-white/10 shadow-md" style={{maxHeight:320}} />
                ))}
              </div>
            )}

            <iframe ref={iframeRef} style={{display:'none'}} sandbox="allow-scripts" title="script-runner-js" />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            FORMULAS SECTION
        ══════════════════════════════════════════════════════════════════════ */}
        {section === 'formulas' && (
          <div className="p-5 space-y-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 pl-1">Physics Formulas</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PHYSICS_FORMULAS.map(f => (
                  <button key={f.name} onClick={() => { setSection('physics'); setPhysFormula(f); setPhysVarsLocal(Object.fromEntries((f.vars||[]).map(v=>[v,'']))) }}
                    className="text-left px-4 py-3 rounded-xl bg-black/20 border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
                    <div className="text-sm font-bold text-blue-400 group-hover:text-blue-300 transition-colors">{f.name}</div>
                    <div className="text-xs text-slate-400 font-mono mt-1">{f.desc}</div>
                    <div className="text-xs text-slate-500 mt-2 overflow-hidden bg-black/20 p-2 rounded-lg">
                      <KatexInline expr={f.latex} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 pl-1 flex items-center gap-2">
                Machinist Formulas <span className="text-[9px] font-semibold bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded">→ open ⚙ Machinist tab for detail</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MACHINIST_FORMULAS.map(f => (
                  <button key={f.name} onClick={() => { setSection('machinist'); setMachFormula(f); setMachVarsLocal(Object.fromEntries((f.vars||[]).map(v=>[v,'']))); setMachResult(null) }}
                    className="text-left px-4 py-3 rounded-xl bg-black/20 border border-white/5 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group">
                    <div className="text-sm font-bold text-orange-400 group-hover:text-orange-300 transition-colors">{f.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{f.desc}</div>
                    <div className="text-xs text-slate-500 mt-2 overflow-hidden bg-black/20 p-2 rounded-lg">
                      <KatexInline expr={f.latex} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 pl-1">Saved Formulas</div>
              {Object.keys(formulas).length === 0 && <div className="text-slate-500 text-sm bg-black/20 p-4 rounded-xl border border-white/5">No saved formulas. In Compute, use "f1 = expr" to save.</div>}
              <div className="flex flex-wrap gap-2">
                {Object.entries(formulas).map(([k,v]) => (
                  <button key={k} onClick={() => { setInput(v); setSection('compute') }}
                    className="text-xs px-4 py-2 rounded-lg bg-black/20 border border-white/5 hover:border-blue-400/50 hover:bg-blue-500/5 text-slate-300 font-mono transition-all shadow-inner">
                    <span className="font-bold text-blue-400 mr-2">{k}:</span>{v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── STATUS BAR ── */}
      <div className="flex items-center gap-4 px-5 py-2 bg-black/30 border-t border-white/5 shrink-0 backdrop-blur-md">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          MathOS v1.0
        </span>
        <span className="text-xs text-white/10">|</span>
        <span className="text-[11px] font-medium text-slate-400"><span className="text-slate-300 font-mono">{Object.keys(vars).length}</span> vars</span>
        <span className="text-xs text-white/10">|</span>
        <span className="text-[11px] font-medium text-slate-400"><span className="text-slate-300 font-mono">{history.length}</span> history</span>
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-slate-500">↑↓ history • <kbd className="font-mono bg-white/5 px-1 rounded border border-white/10 mx-1">Enter</kbd> to compute</span>
      </div>
    </div>
  )
}
