/**
 * GcodeNotebook.jsx
 * Notebook-style G-code learning environment.
 *
 * Layout:
 *   Left  — one or more editable code cells (Monaco, G-code syntax)
 *   Right — 2-D toolpath canvas  +  tabs: Trace | Positions | Variables
 *
 * Uses the existing CNCInterpreter (src/scripts/cnc/CNCInterpreter.js).
 * Cells are concatenated and run together; "Run ↑" runs cells 1..N.
 *
 * Props:
 *   initialCells   { id, label, code }[]   — pre-populated cells
 *   dialect        'fanuc' | 'okuma' | 'siemens'   (default 'fanuc')
 *   height         number   — min height of the notebook body (default 520)
 */

import { useState, useEffect, useRef, useCallback, useMemo, useId } from 'react'
import Editor from '@monaco-editor/react'
import { CNCInterpreter } from '../../../scripts/cnc/CNCInterpreter.js'
import { setupOpenCalcMonaco } from '../../../utils/monacoThemes.js'
import { useCncTheme } from "./theme/useCncTheme.js";

// ── Theme ─────────────────────────────────────────────────────────────────────
function useIsDark() {
  const q = () =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(q)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(q()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}


// ── Known system variable descriptions ───────────────────────────────────────
const SYS_VAR_DESC = {
  3001: 'ms timer',       3011: 'date YYMMDD',   3012: 'time HHMMSS',
  4001: 'modal G grp 1',  4003: 'modal G grp 3', 4006: 'modal G grp 6',
  5041: 'work X',         5042: 'work Y',         5043: 'work Z',
  5021: 'machine X',      5022: 'machine Y',      5023: 'machine Z',
}

// ── 2-D Toolpath Canvas ───────────────────────────────────────────────────────
function ToolpathCanvas({ snaps, isDark, C }) {
  const wrapRef  = useRef(null)
  const canvasRef = useRef(null)
  const [size, setSize] = useState({ w: 400, h: 260 })

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => {
      const w = Math.floor(e.contentRect.width)
      setSize({ w, h: Math.round(w * 0.62) })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width  = Math.round(size.w * dpr)
    canvas.height = Math.round(size.h * dpr)
    canvas.style.width  = `${size.w}px`
    canvas.style.height = `${size.h}px`
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = C.traceBg
    ctx.fillRect(0, 0, W, H)

    if (!snaps || snaps.length < 2) {
      ctx.fillStyle = C.hint
      ctx.font = `${10 * dpr}px monospace`
      ctx.textAlign = 'center'
      ctx.fillText('Run program to see toolpath trace', W / 2, H / 2)
      return
    }

    // Bounding box
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity
    for (const s of snaps) {
      const x = s.X ?? 0, y = s.Y ?? 0
      if (x < xMin) xMin = x; if (x > xMax) xMax = x
      if (y < yMin) yMin = y; if (y > yMax) yMax = y
    }
    const rx = Math.max(xMax - xMin, 0.1), ry = Math.max(yMax - yMin, 0.1)
    const pad = 0.16
    xMin -= rx * pad; xMax += rx * pad
    yMin -= ry * pad; yMax += ry * pad

    const scale = Math.min(W / (xMax - xMin), H / (yMax - yMin))
    const ox = (W - (xMax - xMin) * scale) / 2
    const oy = (H - (yMax - yMin) * scale) / 2
    const toC = (wx, wy) => ({
      x: ox + (wx - xMin) * scale,
      y: H - oy - (wy - yMin) * scale,   // flip Y
    })

    // Grid
    const gs = Math.pow(10, Math.floor(Math.log10(rx / 4)))
    ctx.strokeStyle = isDark ? '#0e1e30' : '#e9f0f8'
    ctx.lineWidth = 1
    for (let gx = Math.ceil(xMin / gs) * gs; gx <= xMax; gx += gs) {
      const { x } = toC(gx, 0)
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }
    for (let gy = Math.ceil(yMin / gs) * gs; gy <= yMax; gy += gs) {
      const { y } = toC(0, gy)
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }

    // Axis lines
    ctx.lineWidth = 1
    ctx.strokeStyle = isDark ? '#1e3a5f' : '#bfdbfe'
    const o0 = toC(0, 0)
    if (o0.x >= 0 && o0.x <= W) {
      ctx.beginPath(); ctx.moveTo(o0.x, 0); ctx.lineTo(o0.x, H); ctx.stroke()
    }
    if (o0.y >= 0 && o0.y <= H) {
      ctx.beginPath(); ctx.moveTo(0, o0.y); ctx.lineTo(W, o0.y); ctx.stroke()
    }

    // Origin crosshair
    ctx.strokeStyle = isDark ? '#374151' : '#94a3b8'
    ctx.lineWidth = 1.5 * dpr
    const cs = 5 * dpr
    ctx.beginPath(); ctx.moveTo(o0.x - cs, o0.y); ctx.lineTo(o0.x + cs, o0.y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(o0.x, o0.y - cs); ctx.lineTo(o0.x, o0.y + cs); ctx.stroke()

    // Toolpath segments
    for (let i = 1; i < snaps.length; i++) {
      const a = snaps[i - 1], b = snaps[i]
      const p0 = toC(a.X ?? 0, a.Y ?? 0)
      const p1 = toC(b.X ?? 0, b.Y ?? 0)
      const mode = b.motionMode ?? 'G00'
      const isRapid = mode === 'G00'
      const isArc   = mode === 'G02' || mode === 'G03'
      ctx.beginPath()
      ctx.moveTo(p0.x, p0.y)
      ctx.lineTo(p1.x, p1.y)
      if (isRapid) {
        ctx.strokeStyle = C.rapid; ctx.lineWidth = 1 * dpr
        ctx.setLineDash([4 * dpr, 3 * dpr])
      } else {
        ctx.strokeStyle = isArc ? C.arc : C.feed
        ctx.lineWidth = 1.5 * dpr; ctx.setLineDash([])
      }
      ctx.stroke(); ctx.setLineDash([])
    }

    // End position dot
    const last = snaps[snaps.length - 1]
    const lp = toC(last.X ?? 0, last.Y ?? 0)
    ctx.beginPath(); ctx.arc(lp.x, lp.y, 4 * dpr, 0, Math.PI * 2)
    ctx.fillStyle = C.green; ctx.fill()

    // Axis labels
    ctx.font = `${8 * dpr}px monospace`
    ctx.fillStyle = isDark ? '#475569' : '#94a3b8'
    ctx.textAlign = 'center'
    for (let gx = Math.ceil(xMin / gs) * gs; gx <= xMax; gx += gs) {
      const { x } = toC(gx, 0)
      const yl = Math.min(H - 4 * dpr, o0.y + 12 * dpr)
      ctx.fillText(gx % 1 === 0 ? gx : gx.toFixed(2), x, yl)
    }
    ctx.textAlign = 'right'
    for (let gy = Math.ceil(yMin / gs) * gs; gy <= yMax; gy += gs) {
      const { y } = toC(0, gy)
      const xl = Math.max(3 * dpr, o0.x - 4 * dpr)
      ctx.fillText(gy % 1 === 0 ? gy : gy.toFixed(2), xl, y + 3 * dpr)
    }

    // Legend
    const legend = [
      { c: C.rapid, dash: true,  label: 'Rapid (G0)' },
      { c: C.feed,  dash: false, label: 'Feed (G1)'  },
      { c: C.arc,   dash: false, label: 'Arc (G2/3)' },
    ]
    ctx.font = `${9 * dpr}px monospace`
    ctx.textAlign = 'left'
    legend.forEach(({ c, dash, label }, i) => {
      const lx = W - 80 * dpr, ly = 12 * dpr + i * 14 * dpr
      ctx.strokeStyle = c; ctx.lineWidth = 1.5 * dpr
      if (dash) ctx.setLineDash([3 * dpr, 2 * dpr]); else ctx.setLineDash([])
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 16 * dpr, ly); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = c; ctx.fillText(label, lx + 20 * dpr, ly + 3 * dpr)
    })
  }, [snaps, size, isDark, C])

  return (
    <div ref={wrapRef} style={{ width: '100%', background: C.traceBg, borderRadius: 6 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', borderRadius: 6 }} />
    </div>
  )
}

// ── Position Log Table ────────────────────────────────────────────────────────
function PositionLog({ moves, C }) {
  if (!moves.length) return (
    <p style={{ color: C.hint, fontSize: 11, padding: '12px 16px', fontFamily: 'monospace' }}>
      No moves logged. Run the program first.
    </p>
  )
  const th = { color: C.muted, fontSize: 10, fontFamily: 'monospace', padding: '4px 8px',
                borderBottom: `1px solid ${C.border}`, textAlign: 'right', fontWeight: 600, letterSpacing: 1 }
  const td = (extra = {}) => ({
    fontSize: 11, fontFamily: 'monospace', padding: '3px 8px',
    textAlign: 'right', borderBottom: `1px solid ${C.border}`, ...extra
  })
  return (
    <div style={{ overflowY: 'auto', maxHeight: 240 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Line', 'Mode', 'X', 'Y', 'Z', 'F', 'S'].map(h => (
              <th key={h} style={{ ...th, textAlign: h === 'Mode' ? 'left' : 'right' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {moves.map((m, i) => {
            const isRapid = m.mode === 'G00'
            const isArc   = m.mode === 'G02' || m.mode === 'G03'
            const modeColor = isRapid ? C.amber : isArc ? C.purple : C.blue
            return (
              <tr key={i} style={{ background: i % 2 === 0 ? C.surface : 'transparent' }}>
                <td style={td({ color: C.muted })}>{m.line}</td>
                <td style={td({ color: modeColor, textAlign: 'left' })}>{m.mode}</td>
                <td style={td({ color: C.text })}>{fmt(m.X)}</td>
                <td style={td({ color: C.text })}>{fmt(m.Y)}</td>
                <td style={td({ color: C.teal })}>{fmt(m.Z)}</td>
                <td style={td({ color: C.muted })}>{m.F > 0 ? m.F : '—'}</td>
                <td style={td({ color: C.muted })}>{m.S > 0 ? m.S : '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function fmt(v) {
  if (v === undefined || v === null) return '—'
  const n = Number(v)
  return isNaN(n) ? '—' : n % 1 === 0 ? n.toString() : n.toFixed(4).replace(/0+$/, '')
}

// ── Variable State Table ──────────────────────────────────────────────────────
function VariableTable({ vars, C }) {
  if (!vars || vars.size === 0) return (
    <p style={{ color: C.hint, fontSize: 11, padding: '12px 16px', fontFamily: 'monospace' }}>
      No variables set. Use <span style={{ color: C.purple }}>#n = value</span> in your program.
    </p>
  )
  const entries = [...vars.entries()]
    .filter(([, v]) => v !== undefined && v !== null && !isNaN(Number(v)))
    .sort(([a], [b]) => Number(a) - Number(b))
  if (!entries.length) return (
    <p style={{ color: C.hint, fontSize: 11, padding: '12px 16px', fontFamily: 'monospace' }}>
      No variables set.
    </p>
  )
  const groups = [
    { label: 'Local  (#1–33)',   min: 1,   max: 33   },
    { label: 'Common (#100–199)', min: 100, max: 199  },
    { label: 'Common (#500–999)', min: 500, max: 999  },
    { label: 'System (#1000+)',  min: 1000, max: Infinity },
  ]
  const th = { color: C.muted, fontSize: 10, fontFamily: 'monospace', padding: '4px 8px',
                borderBottom: `1px solid ${C.border}`, letterSpacing: 1, fontWeight: 600 }
  const td = { fontSize: 11, fontFamily: 'monospace', padding: '3px 8px',
                borderBottom: `1px solid ${C.border}` }
  return (
    <div style={{ overflowY: 'auto', maxHeight: 240 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Variable</th>
            <th style={{ ...th, textAlign: 'right' }}>Value</th>
            <th style={th}>Note</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(({ label, min, max }) => {
            const rows = entries.filter(([k]) => Number(k) >= min && Number(k) <= max)
            if (!rows.length) return null
            return [
              <tr key={`hdr-${min}`}>
                <td colSpan={3} style={{ ...td, color: C.muted, fontSize: 9,
                  letterSpacing: 2, textTransform: 'uppercase', paddingTop: 8 }}>
                  {label}
                </td>
              </tr>,
              ...rows.map(([k, v], i) => (
                <tr key={k} style={{ background: i % 2 === 0 ? C.surface : 'transparent' }}>
                  <td style={{ ...td, color: C.purple }}>#{k}</td>
                  <td style={{ ...td, color: C.green, textAlign: 'right' }}>{fmt(v)}</td>
                  <td style={{ ...td, color: C.muted }}>{SYS_VAR_DESC[k] ?? ''}</td>
                </tr>
              )),
            ]
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Small utility buttons ─────────────────────────────────────────────────────
function Btn({ children, onClick, disabled, color, C, title, small }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} style={{
      background: disabled ? 'transparent' : color + '18',
      color: disabled ? C.hint : color,
      border: `1px solid ${disabled ? C.border : color + '55'}`,
      borderRadius: 4, padding: small ? '2px 7px' : '4px 12px',
      fontSize: small ? 9 : 10, fontFamily: 'monospace',
      letterSpacing: 1, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap', transition: 'all .15s',
    }}>{children}</button>
  )
}

// ── Default starter cell ──────────────────────────────────────────────────────
const DEFAULT_CELLS = [
  {
    id: 'default-0',
    label: 'Program',
    code: `; G-code Notebook — edit and run
O0001
G21 G90 G54          ; metric, absolute, WCS G54
G0 X0 Y0 Z5          ; rapid to start position
S1200 M3             ; spindle on CW @ 1200 RPM
G1 Z-2 F300          ; plunge 2 mm
G1 X50 F200          ; cut along X
G1 Y30               ; cut along Y
G2 X30 Y50 I-20 J0   ; arc (CW, I/J center offset)
G1 X0 Y0             ; return to origin
G0 Z5                ; retract
M30                  ; end program
`,
  },
]

// ── GcodeNotebook ─────────────────────────────────────────────────────────────
let _cellId = 0
const newId = () => `cell-${++_cellId}`

export default function GcodeNotebook({
  params = {},
  initialCells: initialCellsProp,
  dialect: dialectProp = 'fanuc',
  height: heightProp = 520,
}) {
  const initialCells = params.initialCells ?? initialCellsProp
  const dialect = params.dialect ?? dialectProp
  const height = params.height ?? heightProp
  const isDark = useIsDark()
  const _C = useCncTheme();
  const C = useMemo(() => ({
    bg: _C.vpBg,
    surface: _C.p1,
    panel: _C.p1,
    border: _C.bd,
    border2: _C.bd2,
    text: _C.txt,
    muted: _C.txt2,
    hint: _C.txt3,
    blue: _C.blue,
    green: _C.green,
    amber: _C.amber,
    red: _C.red,
    teal: _C.teal,
    purple: _C.purple,
    rapid: _C.rapid,
    feed: _C.feed,
    arc: _C.arc,
    traceBg: _C.bg,
    editorBg: _C.bg,
    cellBar: _C.p2,
    runBtn: _C.blue,
    addBtn: _C.bd2,
  }), [_C]);

  const seed = useMemo(() => {
    const raw = initialCells ?? DEFAULT_CELLS
    return raw.map((c, i) => ({ id: c.id ?? `seed-${i}`, label: c.label ?? `Cell ${i + 1}`, code: c.code ?? '' }))
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const [cells, setCells] = useState(seed)
  const [snaps, setSnaps]     = useState([])
  const [moves, setMoves]     = useState([])
  const [vars,  setVars]      = useState(new Map())
  const [errors, setErrors]   = useState([])
  const [running, setRunning] = useState(false)
  const [activeTab, setActiveTab] = useState('trace')
  const [runUpto, setRunUpto] = useState(null)   // null = all, n = index

  // Run cells 0..uptoIdx (or all if null)
  const runCells = useCallback((uptoIdx = null) => {
    setRunning(true)
    setErrors([])
    const idx = uptoIdx ?? cells.length - 1
    const code = cells.slice(0, idx + 1).map(c => c.code).join('\n')

    try {
      const interp = new CNCInterpreter(dialect)
      interp.loadProgram(code)
      const allSnaps = interp.runAll(15000)

      // Build position log: only collect entries where position changed
      const log = []
      let px = 0, py = 0, pz = 0
      allSnaps.forEach((s, i) => {
        if (i === 0) { px = s.X ?? 0; py = s.Y ?? 0; pz = s.Z ?? 0; return }
        const nx = s.X ?? 0, ny = s.Y ?? 0, nz = s.Z ?? 0
        if (nx !== px || ny !== py || nz !== pz) {
          log.push({
            line: s.programPointer ?? i,
            mode: s.motionMode ?? 'G00',
            X: nx, Y: ny, Z: nz,
            F: s.feedrate ?? 0,
            S: s.spindleRPM ?? 0,
          })
          px = nx; py = ny; pz = nz
        }
      })

      const finalState = allSnaps[allSnaps.length - 1] ?? interp.state
      setSnaps(allSnaps)
      setMoves(log)
      setVars(new Map(finalState.vars ?? []))
      if (finalState.isError && finalState.error) {
        setErrors([finalState.error])
      }
    } catch (e) {
      setErrors([e?.message ?? String(e)])
    }

    setRunning(false)
    setRunUpto(uptoIdx)
    setActiveTab('trace')
  }, [cells, dialect])

  const reset = useCallback(() => {
    setSnaps([]); setMoves([]); setVars(new Map()); setErrors([]); setRunUpto(null)
  }, [])

  const updateCell = useCallback((id, code) => {
    setCells(prev => prev.map(c => c.id === id ? { ...c, code } : c))
  }, [])

  const updateLabel = useCallback((id, label) => {
    setCells(prev => prev.map(c => c.id === id ? { ...c, label } : c))
  }, [])

  const addCell = useCallback(() => {
    setCells(prev => [...prev, { id: newId(), label: `Cell ${prev.length + 1}`, code: '; New cell\n' }])
  }, [])

  const deleteCell = useCallback((id) => {
    setCells(prev => prev.length > 1 ? prev.filter(c => c.id !== id) : prev)
  }, [])

  // ── Layout metrics ──────────────────────────────────────────────────────────
  const tabs = [
    { key: 'trace',     label: '⬛ Trace' },
    { key: 'positions', label: '📍 Positions' },
    { key: 'variables', label: '🔢 Variables' },
  ]

  const posCount   = moves.length
  const varCount   = vars ? [...vars.values()].filter(v => v !== undefined && !isNaN(Number(v))).length : 0

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: C.bg, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: 'hidden', fontFamily: 'monospace',
      minHeight: height,
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        padding: '8px 14px', background: C.panel, borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ color: C.blue, fontSize: 10, letterSpacing: 2, fontWeight: 700 }}>
          G-CODE NOTEBOOK
        </span>
        <span style={{ color: C.muted, fontSize: 9, marginRight: 'auto' }}>
          {dialect.toUpperCase()} dialect
        </span>
        <Btn C={C} color={C.runBtn} onClick={() => runCells()} disabled={running}>
          ▶ Run All
        </Btn>
        <Btn C={C} color={C.amber} onClick={reset} disabled={running}>
          ↺ Reset
        </Btn>
      </div>

      {/* ── Body: cells left, output right ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
        gap: 0,
        minHeight: height - 44,
      }}>
        {/* ── Cells panel ── */}
        <div style={{ borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {cells.map((cell, idx) => (
              <CellEditor
                key={cell.id}
                cell={cell}
                idx={idx}
                isDark={isDark}
                C={C}
                running={running}
                ranUpto={runUpto}
                onCodeChange={updateCell}
                onLabelChange={updateLabel}
                onRunUpto={() => runCells(idx)}
                onDelete={() => deleteCell(cell.id)}
              />
            ))}
          </div>
          {/* Add cell */}
          <div style={{ padding: '8px 12px', borderTop: `1px solid ${C.border}` }}>
            <button onClick={addCell} style={{
              width: '100%', background: 'transparent',
              color: C.muted, border: `1px dashed ${C.border2}`,
              borderRadius: 4, padding: '4px 8px', fontSize: 9,
              letterSpacing: 1, cursor: 'pointer',
            }}>
              + Add Cell
            </button>
          </div>
        </div>

        {/* ── Output panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Canvas */}
          <div style={{ padding: '10px 10px 6px' }}>
            <ToolpathCanvas snaps={snaps} isDark={isDark} C={C} />
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 0, borderTop: `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
          }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                flex: 1, padding: '5px 4px', fontSize: 9, letterSpacing: 1,
                fontFamily: 'monospace', border: 'none', cursor: 'pointer',
                background: activeTab === t.key ? C.bg : C.panel,
                color: activeTab === t.key ? C.blue : C.muted,
                borderBottom: activeTab === t.key ? `2px solid ${C.blue}` : '2px solid transparent',
              }}>
                {t.key === 'positions' ? `POSITIONS (${posCount})` :
                 t.key === 'variables' ? `VARIABLES (${varCount})` :
                 'TRACE'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {activeTab === 'positions' && <PositionLog moves={moves} C={C} />}
            {activeTab === 'variables' && <VariableTable vars={vars} C={C} />}
            {activeTab === 'trace' && snaps.length < 2 && (
              <div style={{ padding: '12px 16px' }}>
                <p style={{ color: C.hint, fontSize: 10, margin: 0 }}>
                  Write G-code in the cells and click <strong style={{ color: C.runBtn }}>▶ Run All</strong> to see the toolpath.
                </p>
              </div>
            )}
            {activeTab === 'trace' && snaps.length >= 2 && (
              <div style={{ padding: '6px 12px' }}>
                <p style={{ color: C.muted, fontSize: 9, margin: 0 }}>
                  {snaps.length - 1} moves rendered •{' '}
                  <span style={{ color: C.rapid }}>— rapid</span>{' '}
                  <span style={{ color: C.feed }}>— feed</span>{' '}
                  <span style={{ color: C.arc }}>— arc</span>
                </p>
              </div>
            )}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div style={{
              borderTop: `1px solid ${C.border}`, padding: '6px 12px',
              background: isDark ? '#1a0a0a' : '#fff5f5',
            }}>
              {errors.map((e, i) => (
                <p key={i} style={{ color: C.red, fontSize: 10, margin: '2px 0' }}>
                  ⚠ {e}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Individual cell editor ────────────────────────────────────────────────────
function CellEditor({ cell, idx, isDark, C, running, ranUpto, onCodeChange, onLabelChange, onRunUpto, onDelete }) {
  const [editingLabel, setEditingLabel] = useState(false)
  const [labelDraft, setLabelDraft] = useState(cell.label)
  const lineCount = (cell.code.match(/\n/g) ?? []).length + 1
  const editorH = Math.max(80, Math.min(lineCount * 19 + 16, 320))
  const hasRun = ranUpto !== null && idx <= ranUpto

  return (
    <div style={{
      borderBottom: `1px solid ${C.border}`,
      background: C.surface,
    }}>
      {/* Cell header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px',
        background: hasRun ? (isDark ? '#0d1f12' : '#f0fdf4') : C.cellBar,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ color: isDark ? '#374151' : '#9ca3af', fontSize: 9, minWidth: 16 }}>
          {String(idx + 1).padStart(2, '0')}
        </span>
        {editingLabel ? (
          <input
            autoFocus
            value={labelDraft}
            onChange={e => setLabelDraft(e.target.value)}
            onBlur={() => { setEditingLabel(false); onLabelChange(cell.id, labelDraft) }}
            onKeyDown={e => { if (e.key === 'Enter') { setEditingLabel(false); onLabelChange(cell.id, labelDraft) } }}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              outline: `1px solid ${C.blue}`, color: C.text,
              fontSize: 9, fontFamily: 'monospace', padding: '1px 4px', borderRadius: 2,
            }}
          />
        ) : (
          <span
            onClick={() => setEditingLabel(true)}
            title="Click to rename"
            style={{ flex: 1, color: hasRun ? C.green : C.muted, fontSize: 9,
              cursor: 'text', letterSpacing: 1, userSelect: 'none' }}
          >
            {cell.label}
            {hasRun && <span style={{ color: C.green, marginLeft: 4 }}>✓</span>}
          </span>
        )}
        <Btn C={C} color={C.blue} onClick={onRunUpto} disabled={running} small title={`Run cells 1–${idx + 1}`}>
          ▶ Run ↑
        </Btn>
        <Btn C={C} color={C.red} onClick={onDelete} disabled={running} small title="Delete cell">
          ✕
        </Btn>
      </div>

      {/* Monaco editor */}
      <Editor
        height={editorH}
        language="plaintext"
        value={cell.code}
        onChange={v => onCodeChange(cell.id, v ?? '')}
        beforeMount={setupOpenCalcMonaco}
        theme={isDark ? 'open-calc-dark' : 'open-calc-light'}
        options={{
          minimap: { enabled: false },
          fontSize: 12,
          lineNumbers: 'on',
          lineNumbersMinChars: 3,
          folding: false,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 2,
          renderLineHighlight: 'line',
          scrollbar: { vertical: 'hidden', horizontal: 'hidden', alwaysConsumeMouseWheel: false },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          padding: { top: 8, bottom: 8 },
        }}
      />
    </div>
  )
}
