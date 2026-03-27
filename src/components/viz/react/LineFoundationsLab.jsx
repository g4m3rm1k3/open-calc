import { useState, useEffect, useRef } from 'react'
import { Plus, Info, Hash, Activity, Compass, Settings, Check, LayoutGrid } from 'lucide-react'

// ── CORE HOOKS ──────────────────────────────────────────────────────────────

function useColors() {
  const isDark = () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return {
    bg: dark ? '#0f172a' : '#f8fafc',
    surface: dark ? '#1e293b' : '#ffffff',
    surface2: dark ? '#0f172a' : '#f1f5f9',
    border: dark ? '#334155' : '#e2e8f0',
    text: dark ? '#f1f5f9' : '#1e293b',
    muted: dark ? '#94a3b8' : '#64748b',
    hint: dark ? '#475569' : '#94a3b8',
    blue: dark ? '#38bdf8' : '#0284c7',
    blueBg: dark ? 'rgba(56,189,248,0.1)' : 'rgba(2,132,199,0.05)',
    blueBd: dark ? '#38bdf8' : '#0284c7',
    amber: dark ? '#fbbf24' : '#d97706',
    amberBg: dark ? 'rgba(251,191,36,0.1)' : 'rgba(217,119,6,0.05)',
    amberBd: dark ? '#fbbf24' : '#d97706',
    green: dark ? '#4ade80' : '#16a34a',
    greenBg: dark ? 'rgba(74,222,128,0.1)' : 'rgba(22,163,74,0.05)',
    greenBd: dark ? '#4ade80' : '#16a34a',
    red: dark ? '#f87171' : '#dc2626',
    redBg: dark ? 'rgba(248,113,113,0.1)' : 'rgba(220,38,38,0.05)',
    redBd: dark ? '#f87171' : '#dc2626',
    purple: dark ? '#a78bfa' : '#7c3aed',
    purpleBg: dark ? 'rgba(167,139,250,0.1)' : 'rgba(124,58,237,0.05)',
    purpleBd: dark ? '#a78bfa' : '#7c3aed',
  }
}

// ── UI COMPONENTS ────────────────────────────────────────────────────────────

const Tag = ({ label, color, C }) => {
  const m = { blue: [C.blueBg, C.blue], amber: [C.amberBg, C.amber], green: [C.greenBg, C.green], red: [C.redBg, C.red], purple: [C.purpleBg, C.purple] }
  const [bg, tc] = m[color] || m.blue
  return <span style={{ display: 'inline-block', fontSize: 11, padding: '2px 9px', borderRadius: 6, background: bg, color: tc, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 10 }}>{label}</span>
}

const Formula = ({ children, C }) => (
  <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 16px', fontFamily: '"Cambria Math", "Times New Roman", serif', fontSize: 20, color: C.text, textAlign: 'center', margin: '12px 0' }}>
    {children}
  </div>
)

const B = ({ children }) => <span style={{ fontWeight: 700 }}>{children}</span>

const Callout = ({ title, children, color, icon: Icon, C }) => {
  const m = { blue: [C.blueBg, C.blueBd, C.blue], amber: [C.amberBg, C.amberBd, C.amber], green: [C.greenBg, C.greenBd, C.green] }
  const [bg, bd, tc] = m[color] || m.blue
  return (
    <div style={{ display: 'flex', gap: 12, background: bg, borderLeft: `4px solid ${bd}`, borderRadius: '0 8px 8px 0', padding: '12px 14px', marginBottom: 12 }}>
      {Icon && <Icon size={18} color={tc} style={{ flexShrink: 0, marginTop: 2 }} />}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: tc, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: tc, lineHeight: 1.6, opacity: 1 }}>{children}</div>
      </div>
    </div>
  )
}

// ── THE ENGINE ───────────────────────────────────────────────────────────────

export default function LineFoundationsLab() {
  const C = useColors()
  const [mode, setMode] = useState('slope') // slope, forms, parallel, tangent, scenarios
  const [points, setPoints] = useState([{ x: 1, y: 2 }, { x: 5, y: 5 }])
  const [activePoint, setActivePoint] = useState(null)
  const [showGrid, setShowGrid] = useState(true)
  const canvasRef = useRef(null)

  // Coordinate System Mapping
  const range = 10
  const padding = 40
  const getScale = (W, H) => {
    const iw = W - padding * 2, ih = H - padding * 2
    return {
      xS: x => padding + (x / range) * iw,
      yS: y => H - padding - (y / range) * ih,
      xI: sx => ((sx - padding) / iw) * range,
      yI: sy => ((H - padding - sy) / ih) * range
    }
  }

  // Math helpers
  const slope = points.length >= 2 ? (points[1].y - points[0].y) / (points[1].x - points[0].x) : 0
  const yIntercept = points[0].y - slope * points[0].x

  const handlePointerDown = (e) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const { xI, yI } = getScale(rect.width, rect.height)
    const px = xI(e.clientX - rect.left), py = yI(e.clientY - rect.top)

    // Check if clicking near a point
    const idx = points.findIndex(p => Math.hypot(p.x - px, p.y - py) < 0.6)
    if (idx !== -1) setActivePoint(idx)
  }

  const handlePointerMove = (e) => {
    if (activePoint === null || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const { xI, yI } = getScale(rect.width, rect.height)
    const px = Math.min(range, Math.max(0, Math.round(xI(e.clientX - rect.left) * 2) / 2))
    const py = Math.min(range, Math.max(0, Math.round(yI(e.clientY - rect.top) * 2) / 2))

    const newPoints = [...points]
    newPoints[activePoint] = { x: px, y: py }
    setPoints(newPoints)
  }

  useEffect(() => {
    const draw = () => {
      const cv = canvasRef.current; if (!cv) return
      const W = cv.offsetWidth, H = cv.offsetHeight
      cv.width = W * window.devicePixelRatio; cv.height = H * window.devicePixelRatio
      const ctx = cv.getContext('2d')
      if (!ctx) return
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      const { xS, yS } = getScale(W, H)

      ctx.clearRect(0, 0, W, H)

      // Grid
      if (showGrid) {
        ctx.strokeStyle = C.border; ctx.lineWidth = 0.5
        for (let i = 0; i <= range; i++) {
          ctx.beginPath(); ctx.moveTo(xS(i), yS(0)); ctx.lineTo(xS(i), yS(range)); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(xS(0), yS(i)); ctx.lineTo(xS(range), yS(i)); ctx.stroke()
        }
      }

      // Axes
      ctx.strokeStyle = C.muted; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(xS(0), yS(0)); ctx.lineTo(xS(range), yS(0)); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(xS(0), yS(0)); ctx.lineTo(xS(0), yS(range)); ctx.stroke()

      // The Line
      const m = slope, b = yIntercept
      const drawLine = (slopeVal, interceptVal, color, width = 3, dash = []) => {
        const x1 = 0, y1 = slopeVal * x1 + interceptVal
        const x2 = range, y2 = slopeVal * x2 + interceptVal
        ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash)
        ctx.beginPath(); ctx.moveTo(xS(x1), yS(y1)); ctx.lineTo(xS(x2), yS(y2)); ctx.stroke()
      }

      drawLine(m, b, C.blue)

      // Parallel and Perpendicular
      if (mode === 'parallel') {
        // Parallel through a fixed offset
        drawLine(m, b + 2, C.green, 2, [5, 5])
        ctx.fillStyle = C.green; ctx.font = '600 11px sans-serif'; ctx.fillText("Parallel (m₁ = m₂)", xS(range) - 110, yS(m * range + b + 2.5))

        // Perpendicular through center
        const mPerp = -1 / m
        const bPerp = 5 - mPerp * 5
        drawLine(mPerp, bPerp, C.red, 2, [5, 5])
        ctx.fillStyle = C.red; ctx.fillText("Perp (m₁·m₂ = -1)", xS(5) - 10, yS(mPerp * 5 + bPerp) + 20)
      }

      // Slope triangle (Delta visualization)
      if (mode === 'slope' || mode === 'forms') {
        const p1 = points[0], p2 = points[1]
        ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.setLineDash([5, 5])
        ctx.beginPath(); ctx.moveTo(xS(p1.x), yS(p1.y)); ctx.lineTo(xS(p2.x), yS(p1.y)); ctx.lineTo(xS(p2.x), yS(p2.y)); ctx.stroke()
        ctx.setLineDash([])

        // Midpoint labels
        ctx.fillStyle = C.amber; ctx.font = '600 12px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText(`Δx = ${(p2.x - p1.x).toFixed(1)}`, xS((p1.x + p2.x) / 2), yS(p1.y) + 18)
        ctx.save(); ctx.translate(xS(p2.x) + 12, yS((p1.y + p2.y) / 2)); ctx.rotate(-Math.PI / 2)
        ctx.fillText(`Δy = ${(p2.y - p1.y).toFixed(1)}`, 0, 0); ctx.restore()
      }

      // Intercepts
      if (mode === 'forms') {
        if (yIntercept >= 0 && yIntercept <= range) {
          ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(xS(0), yS(yIntercept), 5, 0, 7); ctx.fill()
          ctx.fillText(`b = ${yIntercept.toFixed(1)}`, xS(0) + 25, yS(yIntercept) + 4)
        }
      }

      // Point Handles
      points.forEach((p, i) => {
        ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(xS(p.x), yS(p.y), 7, 0, 7)
        ctx.shadowBlur = activePoint === i ? 10 : 0; ctx.shadowColor = C.blue
        ctx.fill(); ctx.shadowBlur = 0
        ctx.strokeStyle = C.surface; ctx.lineWidth = 2; ctx.stroke()

        ctx.fillStyle = C.text; ctx.font = '600 12px sans-serif'; ctx.textAlign = 'left'
        ctx.fillText(`P${i + 1}(${p.x}, ${p.y})`, xS(p.x) + 10, yS(p.y) - 10)
      })
    }
    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [points, mode, showGrid, activePoint, C, slope, yIntercept])

  return (
    <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto', fontFamily: 'sans-serif', color: C.text, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, padding: '8px 8px 0 8px', background: C.surface2, borderBottom: `1px solid ${C.border}`, overflowX: 'auto' }}>
        {[
          { id: 'slope', label: 'Rate', icon: Activity },
          { id: 'forms', label: 'Forms', icon: Hash },
          { id: 'parallel', label: 'Parallel', icon: LayoutGrid },
          { id: 'tangent', label: 'Tangent', icon: Compass },
          { id: 'scenarios', label: 'Real-World', icon: Plus }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setMode(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: mode === t.id ? C.surface : 'transparent', color: mode === t.id ? C.blue : C.muted,
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', minHeight: 540 }}>

        {/* ── Visual Area ── */}
        <div style={{ position: 'relative', background: C.bg }}>
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setActivePoint(null)}
            style={{ width: '100%', height: '100%', cursor: activePoint !== null ? 'grabbing' : 'crosshair' }}
          />

          <div style={{ position: 'absolute', top: 20, left: 20, pointerEvents: 'none' }}>
            <Tag label={mode} color="blue" C={C} />
            <div style={{ fontSize: 24, fontWeight: 700, opacity: 0.8 }}>m = {slope.toFixed(2)}</div>
          </div>

          <div style={{ position: 'absolute', bottom: 20, right: 20, display: 'flex', gap: 8 }}>
            <button onClick={() => setShowGrid(!showGrid)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 8, cursor: 'pointer', color: C.text }}>
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* ── Content Area ── */}
        <div style={{ padding: 24, borderLeft: `1px solid ${C.border}`, overflowY: 'auto', background: C.surface }}>

          {mode === 'slope' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>The Invariant Ratio</h2>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
                A line is defined exactly by its <B>rate of change</B>. Between any two points, the ratio of Δy to Δx is constant.
              </p>

              <Callout title="What is a Slope?" color="blue" icon={Info} C={C}>
                It's how the output (y) responds to a 1-unit nudge in the input (x). If m=3, a nudge of 1 x-unit causes a 3 y-unit jump.
              </Callout>

              <Formula C={C}>
                m = Δy / Δx = (y₂ - y₁) / (x₂ - x₁)
              </Formula>

              <div style={{ background: C.blueBg, padding: 16, borderRadius: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>Vertical (Δy)</span>
                  <span style={{ fontWeight: 700, color: C.amberBd }}>{(points[1].y - points[0].y).toFixed(1)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>Horizontal (Δx)</span>
                  <span style={{ fontWeight: 700, color: C.blueBd }}>{(points[1].x - points[0].x).toFixed(1)}</span>
                </div>
              </div>

              <p style={{ fontSize: 13, color: C.muted }}>Drag the points to change the steepness. Notice how if Δx gets small, the slope explodes toward infinity.</p>
            </div>
          )}

          {mode === 'forms' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Translation to Algebra</h2>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
                Equations describe a <B>constraint</B>. They define the relationship that must hold true for every point on the path.
              </p>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.blue, marginBottom: 4, textTransform: 'uppercase' }}>Slope-Intercept Form</div>
                <div style={{ fontSize: 18, fontFamily: 'monospace', padding: 12, background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                  y = {slope.toFixed(2)}x {yIntercept >= 0 ? '+' : ''} {yIntercept.toFixed(2)}
                </div>
                <p style={{ fontSize: 12, color: C.hint, marginTop: 4 }}>Tells you exactly where the line crosses the y-axis (b).</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 4, textTransform: 'uppercase' }}>Point-Slope Form</div>
                <div style={{ fontSize: 16, fontFamily: 'monospace', padding: 12, background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                  (y - {points[0].y}) = {slope.toFixed(2)}(x - {points[0].x})
                </div>
                <p style={{ fontSize: 12, color: C.hint, marginTop: 4 }}>Calculus uses this because it anchors the line to a specific point P₁ and a local slope m.</p>
              </div>

              <Callout title="Aha!" color="amber" icon={Check} C={C}>
                Every line form is just the same "ratio constant" rearranged algebraically.
              </Callout>
            </div>
          )}

          {mode === 'parallel' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Geometric Relations</h2>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
                How lines relate depends entirely on their slopes (m).
              </p>

              <Callout title="Parallel Rules" color="green" icon={LayoutGrid} C={C}>
                Slopes are <b>equal</b> (m₁ = m₂). They are moving at the same rate and will never meet.
              </Callout>

              <Callout title="Perpendicular Rules" color="blue" icon={Plus} C={C}>
                Slopes are <b>Negative Reciprocals</b> (m₁ · m₂ = -1). At the intersection, their growth rates are perfectly inverted.
              </Callout>

              <div style={{ padding: 12, background: C.surface2, borderRadius: 8, fontSize: 13, color: C.muted }}>
                If your slope is {slope.toFixed(2)}, the perpendicular slope is <B>{(-1 / slope).toFixed(2)}</B>.
              </div>
            </div>
          )}

          {mode === 'tangent' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>The Master Connection</h2>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
                In calculus, finding the tangent line is the "Gold Standard" of understanding.
              </p>

              <Callout title="What is f'(x)?" color="blue" icon={Activity} C={C}>
                The derivative at a point x₀ is <b>literally</b> the slope (m) of the line that just brushes the curve.
              </Callout>

              <Formula C={C}>
                y - f(x₀) = f'(x₀)(x - x₀)
              </Formula>

              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
                When you have a curve, the derivative gives you the <b>instantaneous logic</b> of a line at that exact coordinate.
              </p>
            </div>
          )}

          {mode === 'scenarios' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Lines in Action</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: 12, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.blue }}>Accessibility Ramps</div>
                  <div style={{ fontSize: 13, color: C.muted }}>Required slope m ≤ 1/12. For every 1 unit of rise, you need 12 units of run.</div>
                </div>

                <div style={{ padding: 12, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.amber }}>Descent Slopes</div>
                  <div style={{ fontSize: 13, color: C.muted }}>Planes often descend at a constant 3° angle—approx slope of 0.05. Change in altitude is a linear function of distance.</div>
                </div>

                <div style={{ padding: 12, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.purple }}>Sledding Velocity</div>
                  <div style={{ fontSize: 13, color: C.muted }}>A steeper slope m increases the component of gravity accelerating you down the hill.</div>
                </div>

                <div style={{ padding: 12, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.green }}>Reverse Construction</div>
                  <div style={{ fontSize: 13, color: C.muted }}>If you know the slope (dy/dx = m), integration <b>∫ m dx = mx+C</b> perfectly recovers the line's history.</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
