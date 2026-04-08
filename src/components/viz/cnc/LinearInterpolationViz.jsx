import { useState, useEffect, useRef, useCallback } from 'react'

function useIsDark() {
  const isDark = () => document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

// ─── Tabs ────────────────────────────────────────────────────────────────────
const TABS = ['G00 vs G01', 'Velocity decomp', 'Modal state', 'Exact stop vs lookahead']

// ─── Main component ───────────────────────────────────────────────────────────
export default function LinearInterpolationViz({ params = {} }) {
  const dark = useIsDark()
  const [tab, setTab] = useState(0)

  const C = {
    bg:       dark ? '#0f172a' : '#ffffff',
    surface:  dark ? '#1e293b' : '#f8fafc',
    border:   dark ? '#334155' : '#e2e8f0',
    text:     dark ? '#f1f5f9' : '#0f172a',
    muted:    dark ? '#94a3b8' : '#475569',
    hint:     dark ? '#475569' : '#94a3b8',
    rapid:    dark ? '#fbbf24' : '#d97706',
    rapidBg:  dark ? '#78350f' : '#fef3c7',
    feed:     dark ? '#38bdf8' : '#0284c7',
    feedBg:   dark ? '#0c4a6e' : '#e0f2fe',
    green:    dark ? '#4ade80' : '#16a34a',
    red:      dark ? '#f87171' : '#dc2626',
    grid:     dark ? '#1e293b' : '#f1f5f9',
    axis:     dark ? '#334155' : '#cbd5e1',
    btnBlue:  dark ? '#1d4ed8' : '#2563eb',
    btnGray:  dark ? '#334155' : '#e2e8f0',
    modal:    dark ? '#a78bfa' : '#7c3aed',
    modalBg:  dark ? '#2e1065' : '#ede9fe',
    lookahead:dark ? '#34d399' : '#059669',
  }

  return (
    <div style={{ background: C.bg, borderRadius: 12, padding: '16px 20px', border: `1px solid ${C.border}`, fontFamily: 'system-ui, sans-serif' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            padding: '5px 12px', borderRadius: 20,
            border: `1px solid ${tab === i ? (i === 0 ? C.rapid : i === 1 ? C.feed : i === 2 ? C.modal : C.lookahead) : C.border}`,
            background: tab === i ? (i === 0 ? C.rapidBg : i === 1 ? C.feedBg : i === 2 ? C.modalBg : dark ? '#064e3b' : '#d1fae5') : C.surface,
            color: tab === i ? (i === 0 ? C.rapid : i === 1 ? C.feed : i === 2 ? C.modal : C.lookahead) : C.muted,
            fontSize: 12, fontWeight: tab === i ? 600 : 400, cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>

      {tab === 0 && <G00vsG01Tab C={C} dark={dark} />}
      {tab === 1 && <VelocityDecompTab C={C} dark={dark} />}
      {tab === 2 && <ModalStateTab C={C} dark={dark} />}
      {tab === 3 && <LookaheadTab C={C} dark={dark} />}
    </div>
  )
}

// ─── Tab 1: G00 vs G01 — dog-leg animation ───────────────────────────────────
function G00vsG01Tab({ C, dark }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [running, setRunning] = useState(false)
  const [mode, setMode] = useState('g01') // 'g00' | 'g01'
  const [toolPos, setToolPos] = useState({ x: 0, y: 0 })
  const [path, setPath] = useState([])
  const [done, setDone] = useState(false)
  const rafRef = useRef(null)
  const stateRef = useRef(null)
  const [svgSize, setSvgSize] = useState({ w: 400, h: 260 })

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width
      setSvgSize({ w: Math.max(260, w - 2), h: 220 })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const PAD = 40
  const { w, h } = svgSize
  // World coords 0–10 X, 0–7 Y
  const sx = v => PAD + (v / 10) * (w - PAD * 2)
  const sy = v => h - PAD - (v / 7) * (h - PAD * 2)

  // Start (1,1) → End (9,6)  — big diagonal
  const START = { x: 1, y: 1 }
  const END   = { x: 9, y: 6 }

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setRunning(false); setDone(false)
    setToolPos(START)
    setPath([START])
    stateRef.current = null
  }, [])

  useEffect(() => { reset() }, [mode, reset])

  const run = useCallback(() => {
    reset()
    setRunning(true)
    const MAX_SPEED_X = 10  // units/sec — X faster (simulating different rapid rates)
    const MAX_SPEED_Y = 7   // units/sec — Y slower
    const FEED_SPEED  = 3   // units/sec for G01
    const FPS = 60

    let pos = { ...START }
    const pathPts = [{ ...START }]

    stateRef.current = { cancelled: false }
    const s = stateRef.current

    const tick = () => {
      if (s.cancelled) return
      const dx = END.x - pos.x
      const dy = END.y - pos.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 0.05) {
        setToolPos({ ...END }); setPath([...pathPts, { ...END }])
        setRunning(false); setDone(true)
        return
      }

      if (mode === 'g01') {
        // True interpolation: both axes move proportionally
        const dt = 1 / FPS
        const step = FEED_SPEED * dt
        const move = Math.min(step, dist)
        pos.x += (dx / dist) * move
        pos.y += (dy / dist) * move
      } else {
        // G00 dog-leg: each axis runs at its own max speed independently
        const dt = 1 / FPS
        const stepX = MAX_SPEED_X * dt
        const stepY = MAX_SPEED_Y * dt
        pos.x += dx > 0 ? Math.min(stepX, dx) : Math.max(-stepX, dx)
        pos.y += dy > 0 ? Math.min(stepY, dy) : Math.max(-stepY, dy)
      }

      pathPts.push({ ...pos })
      setToolPos({ ...pos })
      setPath([...pathPts])
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [mode, reset])

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  // Grid lines
  const gridLines = []
  for (let x = 0; x <= 10; x += 2) gridLines.push({ type: 'v', v: x })
  for (let y = 0; y <= 7; y += 1) gridLines.push({ type: 'h', v: y })

  return (
    <div>
      {/* Mode buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {[['g01', 'G01 — Linear interpolation', C.feed], ['g00', 'G00 — Rapid (dog-leg!)', C.rapid]].map(([m, label, col]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '5px 14px', borderRadius: 6, border: `1px solid ${mode === m ? col : C.border}`,
            background: mode === m ? col + '22' : C.surface,
            color: mode === m ? col : C.muted, fontSize: 12, fontWeight: mode === m ? 700 : 400, cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      {/* Canvas */}
      <div ref={containerRef} style={{ width: '100%' }}>
        <svg width={w} height={h} style={{ display: 'block', background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
          {/* Grid */}
          {gridLines.map((g, i) => (
            <line key={i}
              x1={g.type === 'v' ? sx(g.v) : PAD}
              y1={g.type === 'v' ? PAD : sy(g.v)}
              x2={g.type === 'v' ? sx(g.v) : w - PAD}
              y2={g.type === 'v' ? h - PAD : sy(g.v)}
              stroke={C.axis} strokeWidth={0.5} />
          ))}
          {/* Axes */}
          <line x1={PAD} y1={h - PAD} x2={w - PAD} y2={h - PAD} stroke={C.axis} strokeWidth={1} />
          <line x1={PAD} y1={PAD} x2={PAD} y2={h - PAD} stroke={C.axis} strokeWidth={1} />

          {/* Axis labels */}
          <text x={w / 2} y={h - 6} textAnchor="middle" fontSize={11} fill={C.hint} fontFamily="system-ui">X axis</text>
          <text x={12} y={h / 2} textAnchor="middle" fontSize={11} fill={C.hint} fontFamily="system-ui" transform={`rotate(-90, 12, ${h / 2})`}>Y axis</text>

          {/* Ideal straight-line path (ghost) */}
          <line x1={sx(START.x)} y1={sy(START.y)} x2={sx(END.x)} y2={sy(END.y)}
            stroke={mode === 'g01' ? C.feed : C.rapid} strokeWidth={1.5} strokeDasharray="6 4" opacity={0.3} />

          {/* Actual path */}
          {path.length > 1 && (
            <polyline
              points={path.map(p => `${sx(p.x)},${sy(p.y)}`).join(' ')}
              fill="none" stroke={mode === 'g01' ? C.feed : C.rapid} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
            />
          )}

          {/* Start / End markers */}
          <circle cx={sx(START.x)} cy={sy(START.y)} r={5} fill={C.green} />
          <text x={sx(START.x) + 8} y={sy(START.y) + 4} fontSize={11} fill={C.green} fontFamily="system-ui" fontWeight={600}>START (1,1)</text>
          <circle cx={sx(END.x)} cy={sy(END.y)} r={5} fill={done ? C.green : C.hint} />
          <text x={sx(END.x) - 70} y={sy(END.y) - 8} fontSize={11} fill={C.hint} fontFamily="system-ui" fontWeight={600}>END (9,6)</text>

          {/* Tool */}
          <circle cx={sx(toolPos.x)} cy={sy(toolPos.y)} r={8} fill={mode === 'g01' ? C.feed : C.rapid} opacity={0.9} />
          <circle cx={sx(toolPos.x)} cy={sy(toolPos.y)} r={3} fill="#fff" />
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: C.muted, flexWrap: 'wrap' }}>
        <span style={{ color: mode === 'g01' ? C.feed : C.rapid, fontWeight: 600 }}>━ actual path</span>
        <span style={{ opacity: 0.5 }}>- - ideal straight line</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={run} disabled={running} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: running ? 'not-allowed' : 'pointer', background: C.btnBlue, color: '#fff', fontSize: 12, opacity: running ? 0.5 : 1 }}>▶ Run</button>
        <button onClick={reset} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${C.border}`, cursor: 'pointer', background: C.surface, color: C.text, fontSize: 12 }}>↺ Reset</button>
      </div>

      {mode === 'g00' && (
        <div style={{ marginTop: 10, padding: '8px 12px', background: C.rapidBg, border: `1px solid ${C.rapid}50`, borderRadius: 6, fontSize: 12, color: C.rapid, lineHeight: 1.6 }}>
          <strong>Dog-leg path:</strong> G00 moves each axis independently at its own maximum rapid speed. The axis that has less distance to travel finishes first and stops — while the other keeps moving. The result is not a straight line. Never use G00 while the tool is touching material.
        </div>
      )}
      {mode === 'g01' && (
        <div style={{ marginTop: 10, padding: '8px 12px', background: C.feedBg, border: `1px solid ${C.feed}50`, borderRadius: 6, fontSize: 12, color: C.feed, lineHeight: 1.6 }}>
          <strong>True straight line:</strong> G01 coordinates all axes so they start and finish simultaneously at the programmed feedrate F. The controller solves the velocity decomposition math to guarantee a perfectly straight path.
        </div>
      )}
    </div>
  )
}

// ─── Tab 2: Velocity decomposition ───────────────────────────────────────────
function VelocityDecompTab({ C, dark }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [angle, setAngle] = useState(36.87)  // default gives 3-4-5 triangle
  const [feedrate, setFeedrate] = useState(50)
  const [svgW, setSvgW] = useState(400)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(e => setSvgW(Math.max(260, e[0].contentRect.width - 2)))
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const rad = (angle * Math.PI) / 180
  const Vx = feedrate * Math.cos(rad)
  const Vy = feedrate * Math.sin(rad)
  const dist = feedrate  // F = total vector magnitude

  const H = 200
  const PAD = 40
  const SCALE = (svgW - PAD * 2 - 60) / feedrate

  const ox = PAD + 20
  const oy = H - PAD

  const ex = ox + Vx * SCALE
  const ey = oy - Vy * SCALE

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: C.hint, display: 'block', marginBottom: 4 }}>Angle θ = {angle.toFixed(1)}°</label>
          <input type="range" min={5} max={85} step={0.5} value={angle} onChange={e => setAngle(+e.target.value)} style={{ width: '100%', accentColor: C.feed }} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: C.hint, display: 'block', marginBottom: 4 }}>Feedrate F = {feedrate} ipm</label>
          <input type="range" min={10} max={100} step={5} value={feedrate} onChange={e => setFeedrate(+e.target.value)} style={{ width: '100%', accentColor: C.feed }} />
        </div>
      </div>

      <div ref={containerRef} style={{ width: '100%' }}>
        <svg width={svgW} height={H} style={{ display: 'block', background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
          {/* Vx horizontal component */}
          <line x1={ox} y1={oy} x2={ex} y2={oy} stroke={C.rapid} strokeWidth={2.5} strokeDasharray="6 3" />
          <polygon points={`${ex},${oy - 5} ${ex + 8},${oy} ${ex},${oy + 5}`} fill={C.rapid} />
          <text x={(ox + ex) / 2} y={oy + 16} textAnchor="middle" fontSize={11} fill={C.rapid} fontFamily="system-ui" fontWeight={600}>
            Vx = {Vx.toFixed(1)}
          </text>

          {/* Vy vertical component */}
          <line x1={ex} y1={oy} x2={ex} y2={ey} stroke={C.green} strokeWidth={2.5} strokeDasharray="6 3" />
          <polygon points={`${ex - 5},${ey} ${ex},${ey - 8} ${ex + 5},${ey}`} fill={C.green} />
          <text x={ex + 12} y={(oy + ey) / 2 + 4} fontSize={11} fill={C.green} fontFamily="system-ui" fontWeight={600}>
            Vy = {Vy.toFixed(1)}
          </text>

          {/* Resultant vector F */}
          <line x1={ox} y1={oy} x2={ex} y2={ey} stroke={C.feed} strokeWidth={3} />
          <polygon
            points={`${ex - 6 * Math.cos(rad + 0.4)},${ey + 6 * Math.sin(rad + 0.4)} ${ex + 8 * Math.cos(rad)},${ey - 8 * Math.sin(rad)} ${ex - 6 * Math.cos(rad - 0.4)},${ey + 6 * Math.sin(rad - 0.4)}`}
            fill={C.feed}
          />
          <text
            x={ox + (ex - ox) / 2 - 14 * Math.sin(rad)}
            y={oy - (oy - ey) / 2 - 14 * Math.cos(rad)}
            fontSize={11} fill={C.feed} fontFamily="system-ui" fontWeight={700}
          >
            F = {feedrate}
          </text>

          {/* Angle arc */}
          <path
            d={`M ${ox + 24} ${oy} A 24 24 0 0 0 ${ox + 24 * Math.cos(rad)} ${oy - 24 * Math.sin(rad)}`}
            fill="none" stroke={C.hint} strokeWidth={1}
          />
          <text x={ox + 30} y={oy - 8} fontSize={10} fill={C.hint} fontFamily="system-ui">θ</text>

          {/* Origin dot */}
          <circle cx={ox} cy={oy} r={4} fill={C.feed} />

          {/* Axes */}
          <line x1={ox - 10} y1={oy} x2={ox + (svgW - PAD * 2 - 40)} y2={oy} stroke={C.axis} strokeWidth={1} />
          <line x1={ox} y1={oy + 10} x2={ox} y2={PAD} stroke={C.axis} strokeWidth={1} />
          <text x={ox + (svgW - PAD * 2 - 40) - 4} y={oy - 4} fontSize={10} fill={C.hint} fontFamily="system-ui">X</text>
          <text x={ox + 4} y={PAD + 4} fontSize={10} fill={C.hint} fontFamily="system-ui">Y</text>
        </svg>
      </div>

      {/* Formula cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginTop: 12 }}>
        {[
          { label: 'Distance D', val: `√(ΔX² + ΔY²)`, note: 'total move length' },
          { label: 'Move time T', val: `D / F`, note: 'seconds' },
          { label: 'X velocity', val: `Vx = ${Vx.toFixed(1)}`, note: 'ipm on X axis', color: C.rapid },
          { label: 'Y velocity', val: `Vy = ${Vy.toFixed(1)}`, note: 'ipm on Y axis', color: C.green },
        ].map(c => (
          <div key={c.label} style={{ background: C.surface, border: `1px solid ${c.color ? c.color + '60' : C.border}`, borderRadius: 7, padding: '8px 10px' }}>
            <div style={{ fontSize: 10, color: C.hint, textTransform: 'uppercase', letterSpacing: '.05em' }}>{c.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: c.color || C.text, margin: '2px 0', fontFamily: 'monospace' }}>{c.val}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{c.note}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: C.muted, marginTop: 10, lineHeight: 1.65 }}>
        The controller computes Vx and Vy such that both axes arrive at the endpoint simultaneously — this is what guarantees a straight line. Drag the angle and feedrate sliders to see how the axis components change while the total vector magnitude (F) stays constant.
      </p>
    </div>
  )
}

// ─── Tab 3: Modal state ───────────────────────────────────────────────────────
const MODAL_PROGRAM = [
  { n: 10, raw: 'N10 G00 X0 Y0',       mode: 'G00', x: 0,  y: 0,  f: null, note: 'Rapid to origin. G00 becomes the active motion mode.' },
  { n: 20, raw: 'N20 G01 X5.0 F20.0',  mode: 'G01', x: 5,  y: 0,  f: 20,   note: 'G01 becomes active, F20 becomes active. Both are now modal.' },
  { n: 30, raw: 'N30 Y2.0',            mode: 'G01', x: 5,  y: 2,  f: 20,   note: 'No G-code or F word on this line. G01 and F20 carry over from N20 — modal state.' },
  { n: 40, raw: 'N40 X0',              mode: 'G01', x: 0,  y: 2,  f: 20,   note: 'Still G01, still F20. A line with only X0 cuts back at 20 ipm.' },
  { n: 50, raw: 'N50 G00 Z5.0',        mode: 'G00', x: 0,  y: 2,  f: 20,   note: 'G00 cancels G01. The machine rapids Z up. F20 is still stored — it will reactivate with the next G01.' },
  { n: 60, raw: 'N60 G01 Y0 (F still active)', mode: 'G01', x: 0, y: 0, f: 20, note: 'G01 is commanded again. F20 is still modal from N20 — you don\'t need to restate it, though best practice is to include it for clarity.' },
]

function ModalStateTab({ C, dark }) {
  const [step, setStep] = useState(0)
  const current = MODAL_PROGRAM[step]

  const svgH = 180
  const PAD = 30
  const W = 320
  const sx = v => PAD + (v / 6) * (W - PAD * 2)
  const sy = v => svgH - PAD - (v / 3) * (svgH - PAD * 2)

  const pastPath = MODAL_PROGRAM.slice(0, step + 1)

  return (
    <div>
      <p style={{ fontSize: 12, color: C.muted, margin: '0 0 12px', lineHeight: 1.5 }}>
        Modal codes are "sticky" — once set, they remain active until a different code cancels them. Step through to see which settings carry over and which change.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start' }}>
        {/* Code list */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
          {MODAL_PROGRAM.map((line, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                background: i === step ? (line.mode === 'G00' ? C.rapidBg : C.feedBg) : i < step ? C.surface : C.bg,
                borderBottom: `1px solid ${C.border}`,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: i === step ? (line.mode === 'G00' ? C.rapid : C.feed) : i < step ? C.muted : C.hint, flex: 1, fontWeight: i === step ? 700 : 400 }}>
                {line.raw}
              </span>
              {i === step && <span style={{ fontSize: 10, background: line.mode === 'G00' ? C.rapid : C.feed, color: '#fff', padding: '1px 6px', borderRadius: 3, fontWeight: 700, flexShrink: 0 }}>◀ active</span>}
            </div>
          ))}
        </div>

        {/* Path viz */}
        <svg width={W} height={svgH} style={{ background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, flexShrink: 0 }}>
          {/* Grid */}
          {[0,1,2,3,4,5,6].map(x => <line key={`gx${x}`} x1={sx(x)} y1={PAD} x2={sx(x)} y2={svgH - PAD} stroke={C.axis} strokeWidth={0.5} />)}
          {[0,1,2,3].map(y => <line key={`gy${y}`} x1={PAD} y1={sy(y)} x2={W - PAD} y2={sy(y)} stroke={C.axis} strokeWidth={0.5} />)}
          {/* Path lines */}
          {pastPath.slice(1).map((pt, i) => {
            const prev = pastPath[i]
            return (
              <line key={i}
                x1={sx(prev.x)} y1={sy(prev.y)} x2={sx(pt.x)} y2={sy(pt.y)}
                stroke={pt.mode === 'G00' ? C.rapid : C.feed}
                strokeWidth={pt.mode === 'G00' ? 1.5 : 2.5}
                strokeDasharray={pt.mode === 'G00' ? '5 3' : 'none'}
              />
            )
          })}
          {/* Tool position */}
          <circle cx={sx(current.x)} cy={sy(current.y)} r={7} fill={current.mode === 'G00' ? C.rapid : C.feed} />
          <circle cx={sx(current.x)} cy={sy(current.y)} r={3} fill="#fff" />
          {/* Axis labels */}
          <text x={W / 2} y={svgH - 4} textAnchor="middle" fontSize={9} fill={C.hint} fontFamily="system-ui">X</text>
          <text x={10} y={svgH / 2} textAnchor="middle" fontSize={9} fill={C.hint} fontFamily="system-ui" transform={`rotate(-90,10,${svgH / 2})`}>Y</text>
        </svg>
      </div>

      {/* Active state chips */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Motion mode', val: current.mode, color: current.mode === 'G00' ? C.rapid : C.feed },
          { label: 'Feedrate', val: current.f != null ? `F${current.f}` : '—', color: current.f != null ? C.feed : C.hint },
          { label: 'Position', val: `X${current.x} Y${current.y}`, color: C.text },
        ].map(c => (
          <div key={c.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 12px' }}>
            <div style={{ fontSize: 10, color: C.hint, marginBottom: 2 }}>{c.label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: c.color, fontFamily: 'monospace' }}>{c.val}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: C.muted, marginTop: 10, lineHeight: 1.65, padding: '8px 12px', background: C.surface, borderRadius: 6, border: `1px solid ${C.border}` }}>
        <strong style={{ color: C.text }}>N{current.n}:</strong> {current.note}
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, color: C.text, fontSize: 12, cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.4 : 1 }}>← Back</button>
        <button onClick={() => setStep(s => Math.min(MODAL_PROGRAM.length - 1, s + 1))} disabled={step === MODAL_PROGRAM.length - 1} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: C.btnBlue, color: '#fff', fontSize: 12, cursor: step === MODAL_PROGRAM.length - 1 ? 'not-allowed' : 'pointer', opacity: step === MODAL_PROGRAM.length - 1 ? 0.4 : 1 }}>Next →</button>
      </div>
    </div>
  )
}

// ─── Tab 4: Exact stop vs lookahead ──────────────────────────────────────────
function LookaheadTab({ C, dark }) {
  const [mode, setMode] = useState('g64')
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const rafRef = useRef(null)
  const [svgW, setSvgW] = useState(360)
  const [toolPos, setToolPos] = useState(null)
  const [progress, setProgress] = useState(0)
  const [running, setRunning] = useState(false)
  const stateRef = useRef({ t: 0, running: false })

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(e => setSvgW(Math.max(240, e[0].contentRect.width - 2)))
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const H = 180
  const PAD = 30

  // Waypoints: L-shape path
  const WP = [
    { x: 1, y: 1 }, { x: 8, y: 1 }, { x: 8, y: 5 }
  ]
  const sx = v => PAD + (v / 10) * (svgW - PAD * 2)
  const sy = v => H - PAD - (v / 6) * (H - PAD * 2)

  const reset = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    stateRef.current = { t: 0, running: false }
    setRunning(false); setProgress(0); setToolPos(null)
  }

  const run = useCallback(() => {
    reset()
    stateRef.current.running = true
    setRunning(true)

    // Segments: WP0→WP1, WP1→WP2
    const segments = WP.slice(1).map((wp, i) => {
      const from = WP[i], to = wp
      const dx = to.x - from.x, dy = to.y - from.y
      const len = Math.sqrt(dx * dx + dy * dy)
      return { from, to, dx, dy, len }
    })
    const totalLen = segments.reduce((s, seg) => s + seg.len, 0)
    const speed = mode === 'g61' ? 6 : 8 // units/sec — slower in G61 due to stops
    const FPS = 60

    let elapsed = 0
    let paused = false
    let pauseTime = 0

    const tick = () => {
      if (!stateRef.current.running) return
      elapsed += 1 / FPS

      if (mode === 'g61' && !paused && elapsed * speed >= segments[0].len && elapsed * speed < segments[0].len + 0.3) {
        paused = true; pauseTime = elapsed
      }
      if (paused && elapsed - pauseTime < 0.35) {
        // hold at corner
        const pos = segments[0].to
        setToolPos({ x: sx(pos.x), y: sy(pos.y) })
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      if (paused && elapsed - pauseTime >= 0.35) paused = false

      const dist = Math.min(elapsed * speed, totalLen)
      let remaining = dist
      let pos = { ...WP[0] }
      for (const seg of segments) {
        if (remaining <= seg.len) {
          const t = remaining / seg.len
          pos = { x: seg.from.x + t * seg.dx, y: seg.from.y + t * seg.dy }
          break
        }
        remaining -= seg.len
        pos = { ...seg.to }
      }

      setToolPos({ x: sx(pos.x), y: sy(pos.y) })
      setProgress(dist / totalLen)

      if (dist >= totalLen) {
        stateRef.current.running = false
        setRunning(false); setProgress(1)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [mode, svgW])

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  const cornerX = sx(WP[1].x), cornerY = sy(WP[1].y)

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {[['g61', 'G61 — Exact stop (pause at corners)', C.rapid], ['g64', 'G64 — Lookahead (blend corners)', C.lookahead]].map(([m, label, col]) => (
          <button key={m} onClick={() => { setMode(m); reset() }} style={{
            padding: '5px 12px', borderRadius: 6, border: `1px solid ${mode === m ? col : C.border}`,
            background: mode === m ? col + '22' : C.surface,
            color: mode === m ? col : C.muted, fontSize: 12, fontWeight: mode === m ? 700 : 400, cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      <div ref={containerRef} style={{ width: '100%' }}>
        <svg width={svgW} height={H} style={{ display: 'block', background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
          {/* Path */}
          {WP.slice(1).map((wp, i) => (
            <line key={i} x1={sx(WP[i].x)} y1={sy(WP[i].y)} x2={sx(wp.x)} y2={sy(wp.y)}
              stroke={C.axis} strokeWidth={1.5} strokeDasharray="4 3" />
          ))}

          {/* Lookahead blend arc hint */}
          {mode === 'g64' && (
            <path d={`M ${cornerX - 24} ${cornerY} Q ${cornerX} ${cornerY} ${cornerX} ${cornerY - 24}`}
              fill="none" stroke={C.lookahead} strokeWidth={2.5} opacity={0.7} />
          )}

          {/* G61 stop marker */}
          {mode === 'g61' && (
            <>
              <circle cx={cornerX} cy={cornerY} r={8} fill="none" stroke={C.rapid} strokeWidth={2} />
              <line x1={cornerX - 6} y1={cornerY - 6} x2={cornerX + 6} y2={cornerY + 6} stroke={C.rapid} strokeWidth={2} />
            </>
          )}

          {/* Waypoint dots */}
          {WP.map((wp, i) => (
            <circle key={i} cx={sx(wp.x)} cy={sy(wp.y)} r={5} fill={i === 0 ? C.green : i === WP.length - 1 ? C.hint : C.border} stroke={C.border} strokeWidth={1} />
          ))}

          {/* Tool */}
          {toolPos && (
            <>
              <circle cx={toolPos.x} cy={toolPos.y} r={8} fill={mode === 'g61' ? C.rapid : C.lookahead} opacity={0.9} />
              <circle cx={toolPos.x} cy={toolPos.y} r={3} fill="#fff" />
            </>
          )}

          {/* Labels */}
          <text x={sx(WP[1].x) + 10} y={sy(WP[1].y) - 10} fontSize={11} fill={mode === 'g61' ? C.rapid : C.lookahead} fontFamily="system-ui" fontWeight={700}>
            {mode === 'g61' ? 'STOP' : 'blend'}
          </text>
        </svg>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={run} disabled={running} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: running ? 'not-allowed' : 'pointer', background: C.btnBlue, color: '#fff', fontSize: 12, opacity: running ? 0.5 : 1 }}>▶ Run</button>
        <button onClick={reset} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${C.border}`, cursor: 'pointer', background: C.surface, color: C.text, fontSize: 12 }}>↺ Reset</button>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: C.muted, lineHeight: 1.65 }}>
        {mode === 'g61' ? (
          <div style={{ padding: '8px 12px', background: C.rapidBg, border: `1px solid ${C.rapid}50`, borderRadius: 6, color: C.rapid }}>
            <strong>G61 Exact Stop:</strong> The controller decelerates to zero at the end of each move before starting the next. You get a crisp corner but the machine stutters — bad for smooth contour milling. Useful when corner accuracy matters more than surface finish.
          </div>
        ) : (
          <div style={{ padding: '8px 12px', background: dark ? '#064e3b' : '#d1fae5', border: `1px solid ${C.lookahead}50`, borderRadius: 6, color: C.lookahead }}>
            <strong>G64 Lookahead (default):</strong> The controller reads several blocks ahead and blends the end of one move into the start of the next — the tool never fully decelerates at the corner. Faster cycle time, smoother surface finish. The tradeoff: corners are slightly rounded. Most milling uses G64.
          </div>
        )}
      </div>
    </div>
  )
}
