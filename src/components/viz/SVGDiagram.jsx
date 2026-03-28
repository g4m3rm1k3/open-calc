/**
 * SVGDiagram — static labeled diagrams for physics and calc lessons.
 *
 * Usage in lesson data:
 *   { id: "SVGDiagram", props: { type: "kinematic-chain" } }
 *
 * Supported types:
 *   kinematic-chain   — x(t) → v = dx/dt → a = dv/dt derivative chain
 *   slope-triangle    — secant Δx/Δt shrinking toward tangent line
 *   suvat-map         — 5 SUVAT equations as a connection diagram
 *   riemann-rect      — v(t) curve with accumulating rectangles → integral
 *   free-fall-axes    — vertical axis, g pointing down, sign convention
 *   two-objects-line  — number line with two objects converging to meeting point
 */

const COLORS = {
  bg: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  text: '#e2e8f0',
  muted: '#94a3b8',
  brand: '#6366f1',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  sky: '#38bdf8',
}

// ─── Kinematic Chain ────────────────────────────────────────────────────────

function KinematicChain() {
  const W = 520, H = 140
  const boxes = [
    { x: 30,  label: 'x(t)', sub: 'position', color: COLORS.emerald },
    { x: 200, label: 'v(t)', sub: 'velocity',  color: COLORS.brand },
    { x: 370, label: 'a(t)', sub: 'acceleration', color: COLORS.amber },
  ]
  const BW = 110, BH = 60
  const cy = H / 2

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect width={W} height={H} fill={COLORS.bg} rx={12} />
      {/* Arrows forward: differentiate */}
      {boxes.slice(0, 2).map((b, i) => {
        const x1 = b.x + BW, x2 = boxes[i + 1].x
        const mx = (x1 + x2) / 2
        return (
          <g key={`fwd-${i}`}>
            <line x1={x1} y1={cy - 10} x2={x2 - 4} y2={cy - 10} stroke={COLORS.sky} strokeWidth={1.5} markerEnd="url(#arr-sky)" />
            <text x={mx} y={cy - 16} textAnchor="middle" fill={COLORS.sky} fontSize={9} fontFamily="monospace">d/dt</text>
          </g>
        )
      })}
      {/* Arrows backward: integrate */}
      {boxes.slice(0, 2).map((b, i) => {
        const x1 = boxes[i + 1].x, x2 = b.x + BW
        const mx = (x1 + x2) / 2
        return (
          <g key={`bwd-${i}`}>
            <line x1={x1} y1={cy + 10} x2={x2 + 4} y2={cy + 10} stroke={COLORS.rose} strokeWidth={1.5} markerEnd="url(#arr-rose)" />
            <text x={mx} y={cy + 22} textAnchor="middle" fill={COLORS.rose} fontSize={9} fontFamily="monospace">∫ dt</text>
          </g>
        )
      })}
      {/* Boxes */}
      {boxes.map((b) => (
        <g key={b.label}>
          <rect x={b.x} y={cy - BH / 2} width={BW} height={BH} rx={8} fill={COLORS.surface} stroke={b.color} strokeWidth={1.5} />
          <text x={b.x + BW / 2} y={cy - 6} textAnchor="middle" fill={b.color} fontSize={18} fontFamily="monospace" fontWeight="700">{b.label}</text>
          <text x={b.x + BW / 2} y={cy + 14} textAnchor="middle" fill={COLORS.muted} fontSize={10}>{b.sub}</text>
        </g>
      ))}
      {/* Arrow markers */}
      <defs>
        <marker id="arr-sky" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={COLORS.sky} />
        </marker>
        <marker id="arr-rose" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
          <path d="M6,0 L0,3 L6,6 Z" fill={COLORS.rose} />
        </marker>
      </defs>
    </svg>
  )
}

// ─── Slope Triangle ─────────────────────────────────────────────────────────

function SlopeTriangle() {
  const W = 480, H = 220
  const PL = 50, PB = 40, PT = 20, PR = 20
  const GW = W - PL - PR, GH = H - PT - PB

  // x(t) = t² parabola, t in [0, 3]
  const T = 3
  function xFn(t) { return t * t * 0.8 }
  function toSVG(t, x) {
    return [PL + (t / T) * GW, PT + GH - (x / (T * T * 0.8)) * GH]
  }

  const curvePts = Array.from({ length: 40 }, (_, i) => {
    const t = (i / 39) * T
    return toSVG(t, xFn(t))
  })
  const curveD = curvePts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')

  const T0 = 1.2, DT = 1.0
  const T1 = T0 + DT
  const [px0, py0] = toSVG(T0, xFn(T0))
  const [px1, py1] = toSVG(T1, xFn(T1))
  const slope = (xFn(T1) - xFn(T0)) / DT
  const tangSlope = 2 * T0 * 0.8

  // Secant
  const ext = 0.3
  const [sx0, sy0] = toSVG(T0 - ext, xFn(T0) - ext * slope)
  const [sx1, sy1] = toSVG(T1 + ext, xFn(T1) + ext * slope)

  // Tangent
  const [tx0, ty0] = toSVG(T0 - 0.5, xFn(T0) - 0.5 * tangSlope)
  const [tx1, ty1] = toSVG(T0 + 1.2, xFn(T0) + 1.2 * tangSlope)

  // Axes
  const [ox, oy] = toSVG(0, 0)
  const [endX] = toSVG(T, 0)
  const [, endY] = toSVG(0, xFn(T))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect width={W} height={H} fill={COLORS.bg} rx={12} />
      {/* Axes */}
      <line x1={ox} y1={PT} x2={ox} y2={oy} stroke={COLORS.border} strokeWidth={1} />
      <line x1={ox} y1={oy} x2={endX + 10} y2={oy} stroke={COLORS.border} strokeWidth={1} />
      <text x={ox - 8} y={PT + 10} textAnchor="end" fill={COLORS.muted} fontSize={10}>x</text>
      <text x={endX + 14} y={oy + 4} fill={COLORS.muted} fontSize={10}>t</text>
      {/* Curve */}
      <path d={curveD} fill="none" stroke={COLORS.emerald} strokeWidth={2} />
      {/* Secant */}
      <line x1={sx0} y1={sy0} x2={sx1} y2={sy1} stroke={COLORS.amber} strokeWidth={1.5} strokeDasharray="5,3" />
      {/* Triangle legs */}
      <line x1={px0} y1={py0} x2={px1} y2={py0} stroke={COLORS.amber} strokeWidth={1} strokeDasharray="3,2" />
      <line x1={px1} y1={py0} x2={px1} y2={py1} stroke={COLORS.amber} strokeWidth={1} strokeDasharray="3,2" />
      {/* Tangent */}
      <line x1={tx0} y1={ty0} x2={tx1} y2={ty1} stroke={COLORS.sky} strokeWidth={2} />
      {/* Points */}
      <circle cx={px0} cy={py0} r={4} fill={COLORS.amber} />
      <circle cx={px1} cy={py1} r={4} fill={COLORS.amber} />
      {/* Labels */}
      <text x={(px0 + px1) / 2} y={py0 - 6} textAnchor="middle" fill={COLORS.amber} fontSize={10}>Δt</text>
      <text x={px1 + 8} y={(py0 + py1) / 2} fill={COLORS.amber} fontSize={10}>Δx</text>
      <text x={sx1 + 4} y={sy1 - 4} fill={COLORS.amber} fontSize={10} fontFamily="monospace">Δx/Δt</text>
      <text x={tx1 + 4} y={ty1} fill={COLORS.sky} fontSize={10} fontFamily="monospace">dx/dt</text>
      {/* Legend */}
      <rect x={PL} y={PT + 2} width={8} height={2} fill={COLORS.amber} />
      <text x={PL + 12} y={PT + 10} fill={COLORS.amber} fontSize={9}>secant (average rate)</text>
      <rect x={PL} y={PT + 14} width={8} height={2} fill={COLORS.sky} />
      <text x={PL + 12} y={PT + 22} fill={COLORS.sky} fontSize={9}>tangent (instantaneous rate)</text>
    </svg>
  )
}

// ─── SUVAT Map ───────────────────────────────────────────────────────────────

function SuvatMap() {
  const W = 520, H = 200
  // Variables: v₀, v, a, t, Δx — 5 nodes in a pentagon
  const cx = W / 2, cy = H / 2
  const R = 72
  const nodes = [
    { label: 'v₀', angle: -90 },
    { label: 'v',  angle: -18 },
    { label: 'a',  angle:  54 },
    { label: 'Δx', angle: 126 },
    { label: 't',  angle: 198 },
  ].map(n => ({
    ...n,
    x: cx + R * Math.cos(n.angle * Math.PI / 180),
    y: cy + R * Math.sin(n.angle * Math.PI / 180),
  }))

  // Edges: each SUVAT equation omits one variable (the node NOT connected)
  // Eq 1: v=v₀+at  → omits Δx → connects v₀,v,a,t
  // Eq 2: Δx=½(v₀+v)t → omits a
  // Eq 3: Δx=v₀t+½at² → omits v
  // Eq 4: Δx=vt-½at² → omits v₀
  // Eq 5: v²=v₀²+2aΔx → omits t
  const equations = [
    { omit: 'Δx', label: 'v=v₀+at', color: COLORS.brand },
    { omit: 'a',  label: 'Δx=½(v₀+v)t', color: COLORS.emerald },
    { omit: 'v',  label: 'Δx=v₀t+½at²', color: COLORS.amber },
    { omit: 'v₀', label: 'Δx=vt−½at²', color: COLORS.rose },
    { omit: 't',  label: 'v²=v₀²+2aΔx', color: COLORS.sky },
  ]

  const nodeIndex = Object.fromEntries(nodes.map((n, i) => [n.label, i]))
  const edges = []
  equations.forEach(eq => {
    const active = nodes.filter(n => n.label !== eq.omit)
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        edges.push({ x1: active[i].x, y1: active[i].y, x2: active[j].x, y2: active[j].y, color: eq.color })
      }
    }
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect width={W} height={H} fill={COLORS.bg} rx={12} />
      {/* Equation labels on right */}
      {equations.map((eq, i) => (
        <g key={i}>
          <rect x={W - 155} y={16 + i * 34} width={8} height={8} rx={2} fill={eq.color} />
          <text x={W - 142} y={24 + i * 34} fill={eq.color} fontSize={11} fontFamily="monospace">{eq.label}</text>
          <text x={W - 142} y={35 + i * 34} fill={COLORS.muted} fontSize={9}>omits {eq.omit}</text>
        </g>
      ))}
      {/* Edges */}
      {edges.map((e, i) => (
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
          stroke={e.color} strokeWidth={1} opacity={0.35} />
      ))}
      {/* Nodes */}
      {nodes.map(n => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r={22} fill={COLORS.surface} stroke={COLORS.border} strokeWidth={1.5} />
          <text x={n.x} y={n.y + 5} textAnchor="middle" fill={COLORS.text} fontSize={14} fontFamily="monospace" fontWeight="700">{n.label}</text>
        </g>
      ))}
      <text x={16} y={16} fill={COLORS.muted} fontSize={10}>Each equation links 4 of the 5 quantities</text>
    </svg>
  )
}

// ─── Riemann Rectangles ──────────────────────────────────────────────────────

function RiemannRect() {
  const W = 480, H = 200
  const PL = 48, PB = 36, PT = 16, PR = 16
  const GW = W - PL - PR, GH = H - PT - PB
  const T = 4

  function v(t) { return 1.2 + 0.6 * t - 0.08 * t * t }
  const vMax = 3.2

  function toSVG(t, vv) {
    return [PL + (t / T) * GW, PT + GH - (vv / vMax) * GH]
  }

  const n = 8
  const dt = T / n
  const rects = Array.from({ length: n }, (_, i) => {
    const t = i * dt
    const vv = v(t + dt / 2)
    const [rx] = toSVG(t, 0)
    const [, ry] = toSVG(0, vv)
    const [, ry0] = toSVG(0, 0)
    return { x: rx, y: ry, w: (GW / n), h: ry0 - ry }
  })

  const curvePts = Array.from({ length: 60 }, (_, i) => {
    const t = (i / 59) * T
    return toSVG(t, v(t))
  })
  const curveD = curvePts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')

  const [ox, oy] = toSVG(0, 0)
  const [endX] = toSVG(T, 0)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect width={W} height={H} fill={COLORS.bg} rx={12} />
      {/* Rectangles */}
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w - 1} height={r.h}
          fill={COLORS.brand} opacity={0.3} stroke={COLORS.brand} strokeWidth={0.8} />
      ))}
      {/* Curve */}
      <path d={curveD} fill="none" stroke={COLORS.emerald} strokeWidth={2.5} />
      {/* Axes */}
      <line x1={ox} y1={PT} x2={ox} y2={oy} stroke={COLORS.border} strokeWidth={1} />
      <line x1={ox} y1={oy} x2={endX + 10} y2={oy} stroke={COLORS.border} strokeWidth={1} />
      <text x={ox - 6} y={PT + 10} textAnchor="end" fill={COLORS.muted} fontSize={10}>v</text>
      <text x={endX + 14} y={oy + 4} fill={COLORS.muted} fontSize={10}>t</text>
      {/* Labels */}
      <text x={W / 2} y={H - 4} textAnchor="middle" fill={COLORS.muted} fontSize={9}>
        Area ≈ Σ v(tᵢ)·Δt → ∫v dt = displacement
      </text>
      <text x={PL + 6} y={PT + 12} fill={COLORS.brand} fontSize={9}>v(t)</text>
    </svg>
  )
}

// ─── Free-Fall Axes ──────────────────────────────────────────────────────────

function FreeFallAxes() {
  const W = 420, H = 220
  const cx = 90, top = 30, bot = H - 30

  // Parabola x(t) = -½g t² (g=9.8), scaled
  const tMax = 3
  const yScale = (bot - top) / (0.5 * 9.8 * tMax * tMax)
  const curvePts = Array.from({ length: 40 }, (_, i) => {
    const t = (i / 39) * tMax
    const y = 0.5 * 9.8 * t * t
    return [cx + 80 + (t / tMax) * 180, top + y * yScale]
  })
  const curveD = curvePts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect width={W} height={H} fill={COLORS.bg} rx={12} />

      {/* Y-axis (left) */}
      <line x1={cx} y1={top} x2={cx} y2={bot} stroke={COLORS.border} strokeWidth={1.5} />
      {/* Arrow up */}
      <polygon points={`${cx},${top - 2} ${cx - 5},${top + 10} ${cx + 5},${top + 10}`} fill={COLORS.emerald} />
      {/* Arrow down (g) */}
      <polygon points={`${cx},${bot + 2} ${cx - 5},${bot - 10} ${cx + 5},${bot - 10}`} fill={COLORS.rose} />

      {/* +y label */}
      <text x={cx - 14} y={top + 22} fill={COLORS.emerald} fontSize={11} fontFamily="monospace" fontWeight="700">+y</text>
      <text x={cx + 8} y={top + 12} fill={COLORS.emerald} fontSize={9}>positive</text>
      <text x={cx + 8} y={top + 22} fill={COLORS.emerald} fontSize={9}>upward</text>

      {/* g arrow */}
      <line x1={cx + 24} y1={bot - 50} x2={cx + 24} y2={bot - 10} stroke={COLORS.rose} strokeWidth={2} markerEnd="url(#arr-fall)" />
      <text x={cx + 30} y={bot - 28} fill={COLORS.rose} fontSize={12} fontFamily="monospace" fontWeight="700">g</text>
      <text x={cx + 30} y={bot - 16} fill={COLORS.rose} fontSize={9}>= 9.8 m/s²</text>
      <text x={cx + 30} y={bot - 5} fill={COLORS.rose} fontSize={9}>a = −g (upward +)</text>

      {/* Tick at midpoint — origin */}
      <line x1={cx - 5} y1={(top + bot) / 2} x2={cx + 5} y2={(top + bot) / 2} stroke={COLORS.muted} strokeWidth={1} />
      <text x={cx - 8} y={(top + bot) / 2 + 4} textAnchor="end" fill={COLORS.muted} fontSize={9}>y₀</text>

      {/* Trajectory curve */}
      <path d={curveD} fill="none" stroke={COLORS.amber} strokeWidth={2} strokeDasharray="5,3" />
      <text x={curvePts[curvePts.length - 1][0] + 4} y={curvePts[curvePts.length - 1][1]} fill={COLORS.amber} fontSize={9}>y(t)=y₀+v₀t−½gt²</text>
      <text x={cx + 80} y={top + 14} fill={COLORS.muted} fontSize={9}>t →</text>

      <defs>
        <marker id="arr-fall" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto">
          <path d="M0,0 L3,6 L6,0 Z" fill={COLORS.rose} />
        </marker>
      </defs>
    </svg>
  )
}

// ─── Two-Objects Line ────────────────────────────────────────────────────────

function TwoObjectsLine() {
  const W = 480, H = 160
  const y1 = 58, y2 = 105
  const x0 = 50, x1 = W - 40

  const posA = 80, posB = 380, meet = 240

  function xPos(val) { return x0 + ((val - 50) / 350) * (x1 - x0) }

  const pA = xPos(posA), pB = xPos(posB), pM = xPos(meet)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect width={W} height={H} fill={COLORS.bg} rx={12} />

      {/* Number line */}
      <line x1={x0} y1={H / 2} x2={x1} y2={H / 2} stroke={COLORS.border} strokeWidth={1.5} />
      {/* Ticks */}
      {[0, 1, 2, 3, 4].map(i => {
        const tx = x0 + i * (x1 - x0) / 4
        return <line key={i} x1={tx} y1={H / 2 - 5} x2={tx} y2={H / 2 + 5} stroke={COLORS.border} strokeWidth={1} />
      })}

      {/* Object A */}
      <circle cx={pA} cy={y1} r={14} fill={COLORS.brand} opacity={0.9} />
      <text x={pA} y={y1 + 5} textAnchor="middle" fill="white" fontSize={12} fontWeight="700">A</text>
      <line x1={pA} y1={y1 + 14} x2={pA} y2={H / 2} stroke={COLORS.brand} strokeWidth={1} strokeDasharray="3,2" />
      {/* Velocity arrow A */}
      <line x1={pA + 14} y1={y1} x2={pA + 46} y2={y1} stroke={COLORS.brand} strokeWidth={2} markerEnd="url(#arr-a)" />
      <text x={pA + 30} y={y1 - 6} textAnchor="middle" fill={COLORS.brand} fontSize={9}>vₐ →</text>

      {/* Object B */}
      <circle cx={pB} cy={y2} r={14} fill={COLORS.rose} opacity={0.9} />
      <text x={pB} y={y2 + 5} textAnchor="middle" fill="white" fontSize={12} fontWeight="700">B</text>
      <line x1={pB} y1={H / 2} x2={pB} y2={y2 - 14} stroke={COLORS.rose} strokeWidth={1} strokeDasharray="3,2" />
      {/* Velocity arrow B */}
      <line x1={pB - 14} y1={y2} x2={pB - 46} y2={y2} stroke={COLORS.rose} strokeWidth={2} markerEnd="url(#arr-b)" />
      <text x={pB - 30} y={y2 - 6} textAnchor="middle" fill={COLORS.rose} fontSize={9}>← v_b</text>

      {/* Meeting point */}
      <line x1={pM} y1={H / 2 - 18} x2={pM} y2={H / 2 + 18} stroke={COLORS.emerald} strokeWidth={2} strokeDasharray="4,2" />
      <text x={pM} y={H / 2 - 22} textAnchor="middle" fill={COLORS.emerald} fontSize={10} fontWeight="700">x_meet</text>

      {/* Condition label */}
      <text x={W / 2} y={H - 10} textAnchor="middle" fill={COLORS.muted} fontSize={9}>
        Meet when xₐ(t) = x_b(t)  →  solve for t
      </text>

      <defs>
        <marker id="arr-a" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={COLORS.brand} />
        </marker>
        <marker id="arr-b" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
          <path d="M6,0 L0,3 L6,6 Z" fill={COLORS.rose} />
        </marker>
      </defs>
    </svg>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

const DIAGRAMS = {
  'kinematic-chain': KinematicChain,
  'slope-triangle':  SlopeTriangle,
  'suvat-map':       SuvatMap,
  'riemann-rect':    RiemannRect,
  'free-fall-axes':  FreeFallAxes,
  'two-objects-line': TwoObjectsLine,
}

export default function SVGDiagram({ params = {} }) {
  const type = params.type ?? ''
  const Diagram = DIAGRAMS[type]
  if (!Diagram) {
    return (
      <div style={{ background: COLORS.bg, borderRadius: 12, padding: '20px', color: COLORS.muted, fontFamily: 'monospace', fontSize: 12 }}>
        Unknown diagram type: "{type}". Available: {Object.keys(DIAGRAMS).join(', ')}
      </div>
    )
  }
  return (
    <div style={{ background: COLORS.bg, borderRadius: 12, overflow: 'hidden' }}>
      <Diagram />
    </div>
  )
}
