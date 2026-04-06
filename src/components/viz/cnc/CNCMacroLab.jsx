/**
 * CNCMacroLab — 2D backplot + live macro variable watch + line-highlight editor
 *
 * Purpose: teaching viz for Macro B lessons. Shows G-code executing step-by-step
 * with macro variables (#n) highlighted in real time as they change.
 *
 * Props:
 *   initialCode  string   — G-code program to load on mount
 *   dialect      string   — 'fanuc' | 'okuma' | 'siemens'  (default 'fanuc')
 *   watchVars    number[] — extra #var numbers always shown in watch panel
 *   height       number   — body height in px (default 480)
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { CNCInterpreter } from '../../../scripts/cnc/CNCInterpreter.js'

// ─── Minimal line-level G-code colorizer ─────────────────────────────────────
function lineColor(line, C) {
  const t = line.trim()
  if (!t || t.startsWith('(') || t.startsWith(';')) return C.muted
  if (/^(WHILE|IF|ELSE|END\d|DO\d|GOTO|CALL|LOOP|ENDLOOP|THEN)/i.test(t)) return C.teal
  if (/^#\d+\s*=|^#\[|^VC\[|^R\d+\s*=/.test(t)) return C.purple
  if (/^[GM]\d/i.test(t)) return C.blue
  return C.text
}

// ─── Small button helper ──────────────────────────────────────────────────────
function Btn({ children, onClick, disabled, color, C, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: color + '18',
        color: disabled ? C.hint : color,
        border: `1px solid ${disabled ? C.border : color + '55'}`,
        borderRadius: 4, padding: '3px 9px', fontSize: 9,
        fontFamily: 'monospace', letterSpacing: 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap',
      }}
    >{children}</button>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CNCMacroLab({
  initialCode = '',
  dialect = 'fanuc',
  watchVars = [],
  height = 480,
}) {
  // ── Theme ──────────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  )
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains('dark'))
    )
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const C = useMemo(() => isDark ? {
    bg:      '#0f172a', surface: '#1e293b', border:  '#334155',
    text:    '#f1f5f9', muted:   '#64748b', hint:    '#475569',
    green:   '#4ade80', amber:   '#fbbf24', red:     '#f87171',
    blue:    '#38bdf8', teal:    '#2dd4bf', purple:  '#c084fc',
    rapid:   '#fbbf24', feed:    '#38bdf8',
    curLine: '#1e3a8a',
    execRapid: '#92400e', execFeed: '#1e3a5f',
  } : {
    bg:      '#f8fafc', surface: '#ffffff', border:  '#e2e8f0',
    text:    '#0f172a', muted:   '#94a3b8', hint:    '#94a3b8',
    green:   '#16a34a', amber:   '#d97706', red:     '#dc2626',
    blue:    '#2563eb', teal:    '#0d9488', purple:  '#7c3aed',
    rapid:   '#d97706', feed:    '#2563eb',
    curLine: '#dbeafe',
    execRapid: '#fde68a', execFeed: '#bfdbfe',
  }, [isDark])

  // ── Core state ─────────────────────────────────────────────────────────────
  const [code, setCode]           = useState(initialCode)
  const [editBuffer, setEditBuffer] = useState(initialCode)
  const [isEditing, setIsEditing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [renderKey, setRenderKey] = useState(0) // increment on canvas resize

  const interpRef  = useRef(null)
  const prevVarsRef = useRef(new Map())

  const [machineState, setMachineState] = useState(null)
  const [pathPoints,   setPathPoints]   = useState([])
  const [currentStep,  setCurrentStep]  = useState(0)
  const [changedVars,  setChangedVars]  = useState(new Set())

  const canvasRef = useRef(null)
  const codeRef   = useRef(null)

  // ── Extract #var numbers referenced in the current program ────────────────
  const referencedVars = useMemo(() => {
    const nums = new Set(watchVars.map(Number))
    for (const m of code.matchAll(/#(\d+)/g)) nums.add(parseInt(m[1]))
    return [...nums].sort((a, b) => a - b).slice(0, 28)
  }, [code, watchVars])

  // ── Load program + pre-run for full backplot ───────────────────────────────
  const loadProgram = useCallback((prog, dial) => {
    const interp = new CNCInterpreter(dial)
    interp.loadProgram(prog)
    interpRef.current = interp

    const preview = new CNCInterpreter(dial)
    preview.loadProgram(prog)
    const snaps = preview.runAll(10000)
    setPathPoints(snaps.map(s => ({
      x: s.X ?? 0,
      y: s.Y ?? 0,
      mode: s.motionMode ?? 'G00',
    })))
    setCurrentStep(0)
    setMachineState({ ...interp.state })
    prevVarsRef.current = new Map()
    setChangedVars(new Set())
    setIsPlaying(false)
    setRenderKey(k => k + 1)
  }, [])

  useEffect(() => { loadProgram(code, dialect) }, [code, dialect, loadProgram])

  // ── Step one block ─────────────────────────────────────────────────────────
  const stepNext = useCallback(() => {
    const interp = interpRef.current
    if (!interp || interp.state.isDone || interp.state.isError) return
    const s = interp.step()
    // Detect changed vars
    const prev = prevVarsRef.current
    const changed = new Set()
    for (const [k, v] of s.vars) {
      if (prev.get(k) !== v) changed.add(k)
    }
    prevVarsRef.current = new Map(s.vars)
    setChangedVars(changed)
    setMachineState({ ...s })
    setCurrentStep(c => c + 1)
  }, [])

  const reset = useCallback(() => loadProgram(code, dialect), [code, dialect, loadProgram])

  // ── Auto-play loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || !machineState) return
    if (machineState.isDone || machineState.isError) { setIsPlaying(false); return }
    const t = setTimeout(stepNext, 260)
    return () => clearTimeout(t)
  }, [isPlaying, machineState, stepNext])

  // ── Auto-scroll current line into view ────────────────────────────────────
  useEffect(() => {
    if (!codeRef.current || !machineState || isEditing) return
    const el = codeRef.current.querySelector(`[data-line="${machineState.programPointer}"]`)
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [machineState?.programPointer, isEditing])

  // ── Canvas resize observer ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement ?? canvas
    const obs = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width
      const dpr = window.devicePixelRatio || 1
      canvas.width  = Math.round(w * dpr)
      canvas.height = Math.round(220 * dpr)
      canvas.style.width  = `${w}px`
      canvas.style.height = '220px'
      setRenderKey(k => k + 1)
    })
    obs.observe(parent)
    return () => obs.disconnect()
  }, [])

  // ── Draw 2D backplot ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const dpr = window.devicePixelRatio || 1

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc'
    ctx.fillRect(0, 0, W, H)

    if (pathPoints.length < 2) {
      ctx.fillStyle = C.hint
      ctx.font = `${10 * dpr}px monospace`
      ctx.textAlign = 'center'
      ctx.fillText('No path — step through program to see backplot', W / 2, H / 2)
      return
    }

    // Bounding box with padding
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const p of pathPoints) {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y
    }
    const pad = 28 * dpr
    const rangeX = Math.max(maxX - minX, 1)
    const rangeY = Math.max(maxY - minY, 1)
    const scale = Math.min((W - pad * 2) / rangeX, (H - pad * 2) / rangeY)
    const cx = W / 2, cy = H / 2
    const midX = (minX + maxX) / 2, midY = (minY + maxY) / 2
    const sx = (x) => cx + (x - midX) * scale
    const sy = (y) => cy - (y - midY) * scale

    // Grid
    const gridSpacing = Math.pow(10, Math.ceil(Math.log10(Math.max(rangeX, rangeY) / 5)))
    ctx.strokeStyle = isDark ? '#1e293b' : '#e2e8f0'
    ctx.lineWidth = 0.5 * dpr
    ctx.beginPath()
    for (let gx = Math.floor(minX / gridSpacing) * gridSpacing; gx <= maxX + gridSpacing; gx += gridSpacing) {
      ctx.moveTo(sx(gx), 0); ctx.lineTo(sx(gx), H)
    }
    for (let gy = Math.floor(minY / gridSpacing) * gridSpacing; gy <= maxY + gridSpacing; gy += gridSpacing) {
      ctx.moveTo(0, sy(gy)); ctx.lineTo(W, sy(gy))
    }
    ctx.stroke()

    // Axes
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1'
    ctx.lineWidth = dpr
    if (minX <= 0 && maxX >= 0) { ctx.beginPath(); ctx.moveTo(sx(0), 0); ctx.lineTo(sx(0), H); ctx.stroke() }
    if (minY <= 0 && maxY >= 0) { ctx.beginPath(); ctx.moveTo(0, sy(0)); ctx.lineTo(W, sy(0)); ctx.stroke() }

    const execEnd = Math.min(currentStep, pathPoints.length - 1)

    // Draw full dim path (unexecuted)
    for (let i = 1; i < pathPoints.length; i++) {
      const p0 = pathPoints[i - 1], p1 = pathPoints[i]
      ctx.strokeStyle = p1.mode === 'G00'
        ? (isDark ? '#78350f' : '#fde68a')
        : (isDark ? '#1e3a5f' : '#bfdbfe')
      ctx.lineWidth = p1.mode === 'G00' ? 0.7 * dpr : dpr
      ctx.setLineDash(p1.mode === 'G00' ? [3 * dpr, 3 * dpr] : [])
      ctx.beginPath()
      ctx.moveTo(sx(p0.x), sy(p0.y))
      ctx.lineTo(sx(p1.x), sy(p1.y))
      ctx.stroke()
    }
    ctx.setLineDash([])

    // Draw executed path (bright, on top)
    for (let i = 1; i <= execEnd && i < pathPoints.length; i++) {
      const p0 = pathPoints[i - 1], p1 = pathPoints[i]
      ctx.strokeStyle = p1.mode === 'G00' ? C.rapid : C.feed
      ctx.lineWidth = p1.mode === 'G00' ? dpr : 2 * dpr
      ctx.setLineDash(p1.mode === 'G00' ? [4 * dpr, 3 * dpr] : [])
      ctx.beginPath()
      ctx.moveTo(sx(p0.x), sy(p0.y))
      ctx.lineTo(sx(p1.x), sy(p1.y))
      ctx.stroke()
    }
    ctx.setLineDash([])

    // Origin marker
    const ox = sx(0), oy = sy(0)
    if (ox > 0 && ox < W && oy > 0 && oy < H) {
      ctx.fillStyle = C.green
      ctx.beginPath(); ctx.arc(ox, oy, 3 * dpr, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = C.green; ctx.lineWidth = dpr
      ctx.beginPath(); ctx.moveTo(ox - 5 * dpr, oy); ctx.lineTo(ox + 5 * dpr, oy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(ox, oy - 5 * dpr); ctx.lineTo(ox, oy + 5 * dpr); ctx.stroke()
    }

    // Current tool position — red crosshair
    const curPt = pathPoints[execEnd]
    if (curPt) {
      const tx = sx(curPt.x), ty = sy(curPt.y)
      ctx.strokeStyle = C.red; ctx.lineWidth = 1.5 * dpr
      ctx.beginPath(); ctx.moveTo(tx - 8 * dpr, ty); ctx.lineTo(tx + 8 * dpr, ty); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(tx, ty - 8 * dpr); ctx.lineTo(tx, ty + 8 * dpr); ctx.stroke()
      ctx.fillStyle = C.red
      ctx.beginPath(); ctx.arc(tx, ty, 3 * dpr, 0, Math.PI * 2); ctx.fill()
    }

    // DRO overlay
    if (machineState) {
      ctx.fillStyle = isDark ? 'rgba(15,23,42,0.85)' : 'rgba(248,250,252,0.85)'
      ctx.fillRect(3 * dpr, 3 * dpr, 88 * dpr, 28 * dpr)
      ctx.fillStyle = C.text
      ctx.font = `${9 * dpr}px monospace`
      ctx.textAlign = 'left'
      ctx.fillText(`X ${(machineState.X ?? 0).toFixed(3)}`, 7 * dpr, 14 * dpr)
      ctx.fillText(`Y ${(machineState.Y ?? 0).toFixed(3)}`, 7 * dpr, 26 * dpr)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathPoints, currentStep, isDark, C, machineState, renderKey])

  // ── Render ─────────────────────────────────────────────────────────────────
  const ms = machineState
  const lines = code.split('\n')

  return (
    <div style={{
      background: C.bg, borderRadius: 12, overflow: 'hidden',
      fontFamily: 'monospace', fontSize: 11,
      border: `1px solid ${C.border}`,
    }}>
      {/* ── Header / Controls ── */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: '6px 12px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <span style={{ color: C.amber, fontWeight: 700, fontSize: 9, letterSpacing: 2 }}>MACRO LAB</span>
        <span style={{ color: C.hint, fontSize: 8 }}>2D · VARIABLE WATCH</span>

        {/* Status */}
        <span style={{ color: C.hint, fontSize: 8, marginLeft: 4 }}>LINE</span>
        <span style={{ color: C.blue, fontSize: 9, minWidth: 24 }}>{(ms?.programPointer ?? 0) + 1}</span>
        {ms?.isDone  && <span style={{ color: C.green, fontSize: 8 }}>✓ DONE</span>}
        {ms?.isError && (
          <span style={{ color: C.red, fontSize: 8, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            ✗ {ms.error}
          </span>
        )}

        {/* Buttons */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <Btn onClick={reset} color={C.hint} C={C} title="Reset to start">⏮ RESET</Btn>
          <Btn onClick={stepNext} disabled={ms?.isDone || ms?.isError} color={C.blue} C={C} title="Step one block">STEP ▸</Btn>
          <Btn
            onClick={() => setIsPlaying(p => !p)}
            disabled={ms?.isDone || ms?.isError}
            color={isPlaying ? C.red : C.green} C={C}
          >{isPlaying ? '⏸ PAUSE' : '▶ AUTO'}</Btn>
          {isEditing
            ? <>
                <Btn onClick={() => { setCode(editBuffer); setIsEditing(false) }} color={C.green} C={C} title="Send program to machine">✓ SEND</Btn>
                <Btn onClick={() => { setEditBuffer(code); setIsEditing(false) }} color={C.hint} C={C} title="Cancel edit">✕</Btn>
              </>
            : <Btn onClick={() => { setEditBuffer(code); setIsEditing(true) }} color={C.purple} C={C} title="Edit program">✎ EDIT</Btn>
          }
        </div>
      </div>

      {/* ── Body: code left | backplot + vars right ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height }}>

        {/* Left: code with line highlight */}
        <div
          ref={codeRef}
          style={{ borderRight: `1px solid ${C.border}`, overflow: 'auto', position: 'relative' }}
        >
          {isEditing ? (
            <textarea
              value={editBuffer}
              onChange={e => setEditBuffer(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%', height: '100%', background: '#000', color: C.green,
                fontFamily: 'monospace', fontSize: 11, padding: 8,
                border: 'none', outline: 'none', resize: 'none', lineHeight: 1.6,
                boxSizing: 'border-box',
              }}
            />
          ) : (
            <div style={{ padding: '4px 0', minHeight: '100%' }}>
              {lines.map((line, i) => {
                const isActive = ms?.programPointer === i
                return (
                  <div
                    key={i}
                    data-line={i}
                    style={{
                      display: 'flex', alignItems: 'baseline', lineHeight: '20px',
                      background: isActive
                        ? (isDark ? '#1e3a8a30' : '#dbeafe')
                        : 'transparent',
                    }}
                  >
                    <span style={{
                      color: C.hint, minWidth: 32, textAlign: 'right',
                      paddingRight: 8, fontSize: 10, userSelect: 'none', flexShrink: 0,
                    }}>{i + 1}</span>
                    <span style={{ color: lineColor(line, C), whiteSpace: 'pre', flex: 1 }}>
                      {line || ' '}
                    </span>
                    {isActive && (
                      <span style={{ color: C.amber, paddingRight: 6, fontSize: 8, flexShrink: 0 }}>◀</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: 2D canvas + variable watch */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>

          {/* 2D Backplot */}
          <div style={{ position: 'relative', height: 220, flexShrink: 0, overflow: 'hidden' }}>
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '220px', display: 'block' }}
            />
            {/* Legend */}
            <div style={{
              position: 'absolute', bottom: 5, right: 6, display: 'flex', gap: 10, alignItems: 'center',
              background: isDark ? 'rgba(15,23,42,0.82)' : 'rgba(248,250,252,0.82)',
              padding: '2px 8px', borderRadius: 4, fontSize: 8,
            }}>
              <span style={{ color: C.rapid }}>- - G00 rapid</span>
              <span style={{ color: C.feed }}>━ G01/02/03 feed</span>
              <span style={{ color: C.green }}>✚ origin</span>
            </div>
          </div>

          <div style={{ height: 1, background: C.border, flexShrink: 0 }} />

          {/* Variable Watch */}
          <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
            <div style={{ color: C.hint, fontSize: 8, letterSpacing: 3, marginBottom: 4 }}>
              VARIABLE WATCH
            </div>

            {referencedVars.length === 0 && (
              <div style={{ color: C.hint, fontSize: 10, padding: '6px 0' }}>
                No #variables referenced in program.
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
              gap: 3,
            }}>
              {referencedVars.map(n => {
                const val = ms?.vars?.get(n)
                const changed = changedVars.has(n)
                const displayVal = val == null
                  ? '∅'
                  : Number.isFinite(val)
                    ? (Number.isInteger(val) ? val : parseFloat(val.toFixed(4)))
                    : String(val)
                return (
                  <div
                    key={n}
                    style={{
                      background: changed
                        ? (isDark ? '#78350f40' : '#fef3c7')
                        : C.surface,
                      border: `1px solid ${changed ? C.amber : C.border}`,
                      borderRadius: 4, padding: '3px 6px',
                      transition: 'background 0.5s, border-color 0.5s',
                      display: 'flex', gap: 3, alignItems: 'baseline',
                    }}
                  >
                    <span style={{ color: C.purple, fontSize: 10 }}>#{n}</span>
                    <span style={{ color: C.muted, fontSize: 9 }}>=</span>
                    <span style={{
                      color: val != null ? C.text : C.hint,
                      fontSize: 10, fontWeight: val != null ? 600 : 400,
                    }}>{displayVal}</span>
                  </div>
                )
              })}
            </div>

            {/* Messages / status */}
            {ms?.message && (
              <div style={{
                color: C.amber, marginTop: 6, fontSize: 10,
                padding: '4px 8px', background: C.amber + '18',
                borderRadius: 4, border: `1px solid ${C.amber}40`,
              }}>
                MSG: {ms.message}
              </div>
            )}
            {ms?.isDone && (
              <div style={{ color: C.green, marginTop: 6, fontSize: 10 }}>
                ✓ Program complete — press ⏮ RESET to run again
              </div>
            )}
            {ms?.isError && (
              <div style={{
                color: C.red, marginTop: 6, fontSize: 10,
                padding: '4px 8px', background: C.red + '18', borderRadius: 4,
              }}>
                Error: {ms.error}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
