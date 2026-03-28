/**
 * SVGDiagram — static labeled diagrams for physics and calc lessons.
 * Supports light and dark themes by watching the root `dark` class.
 *
 * Usage in lesson data:
 *   { id: "SVGDiagram", props: { type: "kinematic-chain" } }
 *
 * Diagram types (algebra → calculus ordering):
 *
 *   ALGEBRA
 *   algebra-rectangle     — constant-v: displacement = v × Δt (rectangle)
 *   algebra-trapezoid     — constant-a: displacement = ½(v₀+v)t (trapezoid)
 *   algebra-avg-velocity  — Δx/Δt formula with two labeled points on x–t
 *
 *   BRIDGE
 *   slope-triangle        — Δx/Δt secant shrinking toward tangent (limit idea)
 *   riemann-rect          — Riemann rectangles converging to integral
 *
 *   CALCULUS / REFERENCE
 *   kinematic-chain       — x → v = dx/dt → a = dv/dt with ∫ reversed
 *   suvat-map             — 5 SUVAT equations as a connection diagram
 *   free-fall-axes        — vertical axis, g downward, sign convention
 *   two-objects-line      — number line with two objects meeting
 */

import { useState, useEffect } from 'react'

// ─── Theme hook ──────────────────────────────────────────────────────────────

function useIsDark() {
  const [dark, setDark] = useState(
    () => document.documentElement.classList.contains('dark')
  )
  useEffect(() => {
    const el = document.documentElement
    const obs = new MutationObserver(() =>
      setDark(el.classList.contains('dark'))
    )
    obs.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

// ─── Color palettes ──────────────────────────────────────────────────────────

const DARK = {
  bg:       '#0f172a',
  surface:  '#1e293b',
  border:   '#334155',
  text:     '#e2e8f0',
  muted:    '#94a3b8',
  brand:    '#6366f1',
  emerald:  '#10b981',
  amber:    '#f59e0b',
  rose:     '#f43f5e',
  sky:      '#38bdf8',
}

const LIGHT = {
  bg:       '#f8fafc',
  surface:  '#ffffff',
  border:   '#cbd5e1',
  text:     '#0f172a',
  muted:    '#64748b',
  brand:    '#4f46e5',
  emerald:  '#059669',
  amber:    '#d97706',
  rose:     '#e11d48',
  sky:      '#0284c7',
}

// ─── Algebra: Rectangle (constant velocity) ──────────────────────────────────

function AlgebraRectangle({ C }) {
  const W = 480, H = 200
  const PL = 60, PB = 44, PT = 20, PR = 20
  const GW = W - PL - PR, GH = H - PT - PB

  const v = 2.5
  const vMax = 4
  const tMax = 4
  const t1 = 1, t2 = 3.2

  function toSVG(t, vv) {
    return [PL + (t / tMax) * GW, PT + GH - (vv / vMax) * GH]
  }

  const [rx, ] = toSVG(t1, 0)
  const [rx2, ry] = toSVG(t2, v)
  const [, ry0] = toSVG(0, 0)
  const rw = rx2 - rx
  const rh = ry0 - ry

  const [ox, oy] = toSVG(0, 0)
  const [endX] = toSVG(tMax, 0)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect width={W} height={H} fill={C.bg} rx={12} />

      {/* Rectangle fill */}
      <rect x={rx} y={ry} width={rw} height={rh}
        fill={C.brand} opacity={0.2} />
      <rect x={rx} y={ry} width={rw} height={rh}
        fill="none" stroke={C.brand} strokeWidth={2} />

      {/* Velocity line */}
      <line x1={PL} y1={ry} x2={endX} y2={ry}
        stroke={C.emerald} strokeWidth={2.5} />

      {/* Axes */}
      <line x1={ox} y1={PT} x2={ox} y2={oy} stroke={C.border} strokeWidth={1} />
      <line x1={ox} y1={oy} x2={endX + 10} y2={oy} stroke={C.border} strokeWidth={1} />
      <text x={ox - 8} y={PT + 10} textAnchor="end" fill={C.muted} fontSize={10} fontFamily="sans-serif">v</text>
      <text x={endX + 14} y={oy + 4} fill={C.muted} fontSize={10} fontFamily="sans-serif">t</text>

      {/* v label */}
      <line x1={ox} y1={ry} x2={rx - 4} y2={ry} stroke={C.border} strokeWidth={1} strokeDasharray="3,2" />
      <text x={ox - 6} y={ry + 4} textAnchor="end" fill={C.emerald} fontSize={11} fontFamily="monospace" fontWeight="700">v</text>

      {/* Δt brace */}
      <line x1={rx} y1={oy + 10} x2={rx2} y2={oy + 10} stroke={C.amber} strokeWidth={1.5} />
      <line x1={rx} y1={oy + 6} x2={rx} y2={oy + 14} stroke={C.amber} strokeWidth={1.5} />
      <line x1={rx2} y1={oy + 6} x2={rx2} y2={oy + 14} stroke={C.amber} strokeWidth={1.5} />
      <text x={(rx + rx2) / 2} y={oy + 24} textAnchor="middle" fill={C.amber} fontSize={11} fontFamily="monospace">Δt</text>

      {/* Area label */}
      <text x={rx + rw / 2} y={ry + rh / 2 - 6} textAnchor="middle" fill={C.brand} fontSize={13} fontFamily="monospace" fontWeight="700">Δx = v · Δt</text>
      <text x={rx + rw / 2} y={ry + rh / 2 + 10} textAnchor="middle" fill={C.muted} fontSize={10} fontFamily="sans-serif">area of rectangle</text>

      {/* Legend */}
      <text x={PL} y={H - 6} fill={C.muted} fontSize={9} fontFamily="sans-serif">
        Requires: constant velocity. Works purely with algebra — no calculus needed.
      </text>
    </svg>
  )
}

// ─── Algebra: Trapezoid (constant acceleration) ──────────────────────────────

function AlgebraTrapezoid({ C }) {
  const W = 480, H = 210
  const PL = 60, PB = 44, PT = 20, PR = 20
  const GW = W - PL - PR, GH = H - PT - PB

  const v0 = 1.0, v1 = 3.2
  const tMax = 4, vMax = 4.5
  const t1 = 0.8, t2 = 3.4

  function toSVG(t, vv) {
    return [PL + (t / tMax) * GW, PT + GH - (vv / vMax) * GH]
  }

  const [rx1, ry1] = toSVG(t1, v0)
  const [rx2, ry2] = toSVG(t2, v1)
  const [, ry0] = toSVG(0, 0)

  const trapezoidPts = [
    [rx1, ry0],
    [rx1, ry1],
    [rx2, ry2],
    [rx2, ry0],
  ].map(p => p.join(',')).join(' ')

  const [ox, oy] = toSVG(0, 0)
  const [endX] = toSVG(tMax, 0)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect width={W} height={H} fill={C.bg} rx={12} />

      {/* Trapezoid fill */}
      <polygon points={trapezoidPts} fill={C.brand} opacity={0.2} />
      <polygon points={trapezoidPts} fill="none" stroke={C.brand} strokeWidth={2} />

      {/* Velocity line (v(t) = v0 + at — a straight line for constant a) */}
      <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke={C.emerald} strokeWidth={2.5} />

      {/* v₀ and v labels */}
      <line x1={ox} y1={ry1} x2={rx1 - 4} y2={ry1} stroke={C.border} strokeWidth={1} strokeDasharray="3,2" />
      <line x1={ox} y1={ry2} x2={rx2 + 4} y2={ry2} stroke={C.border} strokeWidth={1} strokeDasharray="3,2" />
      <text x={ox - 6} y={ry1 + 4} textAnchor="end" fill={C.emerald} fontSize={11} fontFamily="monospace">v₀</text>
      <text x={rx2 + 8} y={ry2 + 4} fill={C.emerald} fontSize={11} fontFamily="monospace">v</text>

      {/* Axes */}
      <line x1={ox} y1={PT} x2={ox} y2={oy} stroke={C.border} strokeWidth={1} />
      <line x1={ox} y1={oy} x2={endX + 10} y2={oy} stroke={C.border} strokeWidth={1} />
      <text x={ox - 8} y={PT + 10} textAnchor="end" fill={C.muted} fontSize={10} fontFamily="sans-serif">v</text>
      <text x={endX + 14} y={oy + 4} fill={C.muted} fontSize={10} fontFamily="sans-serif">t</text>

      {/* Δt brace */}
      <line x1={rx1} y1={oy + 10} x2={rx2} y2={oy + 10} stroke={C.amber} strokeWidth={1.5} />
      <line x1={rx1} y1={oy + 6} x2={rx1} y2={oy + 14} stroke={C.amber} strokeWidth={1.5} />
      <line x1={rx2} y1={oy + 6} x2={rx2} y2={oy + 14} stroke={C.amber} strokeWidth={1.5} />
      <text x={(rx1 + rx2) / 2} y={oy + 24} textAnchor="middle" fill={C.amber} fontSize={11} fontFamily="monospace">t</text>

      {/* Parallel sides label */}
      <text x={(rx1 + rx2) / 2 - 10} y={(ry1 + ry0) / 2 + 4} textAnchor="end" fill={C.brand} fontSize={11} fontFamily="monospace">v₀</text>
      <text x={(rx1 + rx2) / 2 + 10} y={(ry2 + ry0) / 2 + 4} fill={C.brand} fontSize={11} fontFamily="monospace">v</text>

      {/* Area formula */}
      <text x={(rx1 + rx2) / 2} y={(ry1 + ry0) / 2 + 4} textAnchor="middle" fill={C.brand} fontSize={13} fontFamily="monospace" fontWeight="700">Δx = ½(v₀ + v)·t</text>
      <text x={(rx1 + rx2) / 2} y={(ry1 + ry0) / 2 + 20} textAnchor="middle" fill={C.muted} fontSize={10} fontFamily="sans-serif">area of trapezoid</text>

      {/* Legend */}
      <text x={PL} y={H - 6} fill={C.muted} fontSize={9} fontFamily="sans-serif">
        Requires: constant acceleration. Still pure algebra — this IS the SUVAT equation Δx = ½(v₀+v)t.
      </text>
    </svg>
  )
}

// ─── Algebra: Average velocity ────────────────────────────────────────────────

function AlgebraAvgVelocity({ C }) {
  const W = 480, H = 200
  const PL = 50, PB = 36, PT = 20, PR = 20
  const GW = W - PL - PR, GH = H - PT - PB

  const tMax = 5, xMax = 12
  function xFn(t) { return 0.5 * t * t }
  function toSVG(t, x) {
    return [PL + (t / tMax) * GW, PT + GH - (x / xMax) * GH]
  }

  const curvePts = Array.from({ length: 50 }, (_, i) => {
    const t = (i / 49) * tMax
    return toSVG(t, xFn(t))
  })
  const curveD = curvePts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')

  const tA = 1.2, tB = 3.6
  const [pAx, pAy] = toSVG(tA, xFn(tA))
  const [pBx, pBy] = toSVG(tB, xFn(tB))
  const [ox, oy] = toSVG(0, 0)
  const [endX] = toSVG(tMax, 0)
  const secantSlope = (xFn(tB) - xFn(tA)) / (tB - tA)
  const ext = 0.25
  const [sx0, sy0] = toSVG(tA - ext, xFn(tA) - ext * secantSlope)
  const [sx1, sy1] = toSVG(tB + ext, xFn(tB) + ext * secantSlope)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect width={W} height={H} fill={C.bg} rx={12} />

      {/* Curve */}
      <path d={curveD} fill="none" stroke={C.emerald} strokeWidth={2} />

      {/* Secant */}
      <line
        x1={sx0} y1={sy0} x2={sx1} y2={sy1}
        stroke={C.amber} strokeWidth={2} strokeDasharray="5,3"
      />

      {/* Δx and Δt legs */}
      <line x1={pAx} y1={pAy} x2={pBx} y2={pAy} stroke={C.sky} strokeWidth={1.5} strokeDasharray="3,2" />
      <line x1={pBx} y1={pAy} x2={pBx} y2={pBy} stroke={C.rose} strokeWidth={1.5} strokeDasharray="3,2" />

      {/* Points */}
      <circle cx={pAx} cy={pAy} r={5} fill={C.amber} />
      <circle cx={pBx} cy={pBy} r={5} fill={C.amber} />

      {/* Labels */}
      <text x={pAx - 10} y={pAy - 8} textAnchor="end" fill={C.text} fontSize={11} fontFamily="monospace">(t₁, x₁)</text>
      <text x={pBx + 6} y={pBy - 8} fill={C.text} fontSize={11} fontFamily="monospace">(t₂, x₂)</text>
      <text x={(pAx + pBx) / 2} y={pAy - 6} textAnchor="middle" fill={C.sky} fontSize={11} fontFamily="monospace">Δt = t₂ − t₁</text>
      <text x={pBx + 6} y={(pAy + pBy) / 2 + 4} fill={C.rose} fontSize={11} fontFamily="monospace">Δx = x₂ − x₁</text>

      {/* Formula box */}
      <rect x={PL} y={PT + 2} width={160} height={28} rx={6} fill={C.surface} stroke={C.border} strokeWidth={1} />
      <text x={PL + 80} y={PT + 12} textAnchor="middle" fill={C.muted} fontSize={9} fontFamily="sans-serif">AVERAGE VELOCITY</text>
      <text x={PL + 80} y={PT + 25} textAnchor="middle" fill={C.amber} fontSize={13} fontFamily="monospace" fontWeight="700">v̄ = Δx / Δt</text>

      {/* Axes */}
      <line x1={ox} y1={PT} x2={ox} y2={oy} stroke={C.border} strokeWidth={1} />
      <line x1={ox} y1={oy} x2={endX + 10} y2={oy} stroke={C.border} strokeWidth={1} />
      <text x={ox - 8} y={PT + 10} textAnchor="end" fill={C.muted} fontSize={10} fontFamily="sans-serif">x</text>
      <text x={endX + 14} y={oy + 4} fill={C.muted} fontSize={10} fontFamily="sans-serif">t</text>

      {/* Legend */}
      <text x={PL} y={H - 6} fill={C.muted} fontSize={9} fontFamily="sans-serif">
        Pure algebra: subtract, divide. No limits required — but gives only the average, not the instantaneous rate.
      </text>
    </svg>
  )
}

// ─── Kinematic Chain ─────────────────────────────────────────────────────────

function KinematicChain({ C }) {
  const W = 520, H = 140
  const boxes = [
    { x: 30,  label: 'x(t)', sub: 'position',     color: C.emerald },
    { x: 200, label: 'v(t)', sub: 'velocity',      color: C.brand },
    { x: 370, label: 'a(t)', sub: 'acceleration',  color: C.amber },
  ]
  const BW = 110, BH = 60, cy = H / 2

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <marker id="kc-sky" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={C.sky} />
        </marker>
        <marker id="kc-rose" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
          <path d="M6,0 L0,3 L6,6 Z" fill={C.rose} />
        </marker>
      </defs>
      <rect width={W} height={H} fill={C.bg} rx={12} />
      {boxes.slice(0, 2).map((b, i) => {
        const x1 = b.x + BW, x2 = boxes[i + 1].x
        const mx = (x1 + x2) / 2
        return (
          <g key={`fwd-${i}`}>
            <line x1={x1} y1={cy - 10} x2={x2 - 4} y2={cy - 10} stroke={C.sky} strokeWidth={1.5} markerEnd="url(#kc-sky)" />
            <text x={mx} y={cy - 16} textAnchor="middle" fill={C.sky} fontSize={9} fontFamily="monospace">d/dt</text>
          </g>
        )
      })}
      {boxes.slice(0, 2).map((b, i) => {
        const x1 = boxes[i + 1].x, x2 = b.x + BW
        const mx = (x1 + x2) / 2
        return (
          <g key={`bwd-${i}`}>
            <line x1={x1} y1={cy + 10} x2={x2 + 4} y2={cy + 10} stroke={C.rose} strokeWidth={1.5} markerEnd="url(#kc-rose)" />
            <text x={mx} y={cy + 22} textAnchor="middle" fill={C.rose} fontSize={9} fontFamily="monospace">∫ dt</text>
          </g>
        )
      })}
      {boxes.map((b) => (
        <g key={b.label}>
          <rect x={b.x} y={cy - BH / 2} width={BW} height={BH} rx={8} fill={C.surface} stroke={b.color} strokeWidth={1.5} />
          <text x={b.x + BW / 2} y={cy - 6} textAnchor="middle" fill={b.color} fontSize={18} fontFamily="monospace" fontWeight="700">{b.label}</text>
          <text x={b.x + BW / 2} y={cy + 14} textAnchor="middle" fill={C.muted} fontSize={10} fontFamily="sans-serif">{b.sub}</text>
        </g>
      ))}
    </svg>
  )
}

// ─── Slope Triangle ──────────────────────────────────────────────────────────

function SlopeTriangle({ C }) {
  const W = 480, H = 220
  const PL = 50, PB = 40, PT = 16, PR = 20
  const GW = W - PL - PR, GH = H - PT - PB

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

  const T0 = 1.2, DT = 1.0, T1 = T0 + DT
  const [px0, py0] = toSVG(T0, xFn(T0))
  const [px1, py1] = toSVG(T1, xFn(T1))
  const slope = (xFn(T1) - xFn(T0)) / DT
  const tangSlope = 2 * T0 * 0.8

  const ext = 0.3
  const [sx0, sy0] = toSVG(T0 - ext, xFn(T0) - ext * slope)
  const [sx1, sy1] = toSVG(T1 + ext, xFn(T1) + ext * slope)
  const [tx0, ty0] = toSVG(T0 - 0.5, xFn(T0) - 0.5 * tangSlope)
  const [tx1, ty1] = toSVG(T0 + 1.2, xFn(T0) + 1.2 * tangSlope)
  const [ox, oy] = toSVG(0, 0)
  const [endX] = toSVG(T, 0)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect width={W} height={H} fill={C.bg} rx={12} />
      <line x1={ox} y1={PT} x2={ox} y2={oy} stroke={C.border} strokeWidth={1} />
      <line x1={ox} y1={oy} x2={endX + 10} y2={oy} stroke={C.border} strokeWidth={1} />
      <text x={ox - 8} y={PT + 10} textAnchor="end" fill={C.muted} fontSize={10} fontFamily="sans-serif">x</text>
      <text x={endX + 14} y={oy + 4} fill={C.muted} fontSize={10} fontFamily="sans-serif">t</text>
      <path d={curveD} fill="none" stroke={C.emerald} strokeWidth={2} />
      <line x1={sx0} y1={sy0} x2={sx1} y2={sy1} stroke={C.amber} strokeWidth={1.5} strokeDasharray="5,3" />
      <line x1={px0} y1={py0} x2={px1} y2={py0} stroke={C.amber} strokeWidth={1} strokeDasharray="3,2" />
      <line x1={px1} y1={py0} x2={px1} y2={py1} stroke={C.amber} strokeWidth={1} strokeDasharray="3,2" />
      <line x1={tx0} y1={ty0} x2={tx1} y2={ty1} stroke={C.sky} strokeWidth={2} />
      <circle cx={px0} cy={py0} r={4} fill={C.amber} />
      <circle cx={px1} cy={py1} r={4} fill={C.amber} />
      <text x={(px0 + px1) / 2} y={py0 - 6} textAnchor="middle" fill={C.amber} fontSize={10} fontFamily="monospace">Δt → 0</text>
      <text x={px1 + 8} y={(py0 + py1) / 2} fill={C.amber} fontSize={10} fontFamily="monospace">Δx</text>
      <text x={sx1 + 4} y={sy1 - 4} fill={C.amber} fontSize={10} fontFamily="monospace">Δx/Δt  (algebra)</text>
      <text x={tx1 + 4} y={ty1} fill={C.sky} fontSize={10} fontFamily="monospace">dx/dt  (calculus)</text>
      <rect x={PL} y={PT + 2} width={8} height={2} fill={C.amber} />
      <text x={PL + 12} y={PT + 10} fill={C.amber} fontSize={9} fontFamily="sans-serif">secant — average rate (algebra)</text>
      <rect x={PL} y={PT + 14} width={8} height={2} fill={C.sky} />
      <text x={PL + 12} y={PT + 22} fill={C.sky} fontSize={9} fontFamily="sans-serif">tangent — instantaneous rate (calculus)</text>
    </svg>
  )
}

// ─── Riemann Rectangles ──────────────────────────────────────────────────────

function RiemannRect({ C }) {
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
    return { x: rx, y: ry, w: GW / n, h: ry0 - ry }
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
      <rect width={W} height={H} fill={C.bg} rx={12} />
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w - 1} height={r.h}
          fill={C.brand} opacity={0.25} stroke={C.brand} strokeWidth={0.8} />
      ))}
      <path d={curveD} fill="none" stroke={C.emerald} strokeWidth={2.5} />
      <line x1={ox} y1={PT} x2={ox} y2={oy} stroke={C.border} strokeWidth={1} />
      <line x1={ox} y1={oy} x2={endX + 10} y2={oy} stroke={C.border} strokeWidth={1} />
      <text x={ox - 6} y={PT + 10} textAnchor="end" fill={C.muted} fontSize={10} fontFamily="sans-serif">v</text>
      <text x={endX + 14} y={oy + 4} fill={C.muted} fontSize={10} fontFamily="sans-serif">t</text>
      <text x={W / 2} y={H - 4} textAnchor="middle" fill={C.muted} fontSize={9} fontFamily="sans-serif">
        Σ v(tᵢ)·Δt  →  ∫v dt = exact displacement   (algebra sum → calculus limit)
      </text>
    </svg>
  )
}

// ─── SUVAT Map ────────────────────────────────────────────────────────────────

function SuvatMap({ C }) {
  const W = 520, H = 200
  const cx = 185, cy = H / 2, R = 72
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

  const equations = [
    { omit: 'Δx', label: 'v = v₀ + at',       color: C.brand },
    { omit: 'a',  label: 'Δx = ½(v₀+v)t',     color: C.emerald },
    { omit: 'v',  label: 'Δx = v₀t + ½at²',   color: C.amber },
    { omit: 'v₀', label: 'Δx = vt − ½at²',    color: C.rose },
    { omit: 't',  label: 'v² = v₀² + 2aΔx',   color: C.sky },
  ]

  const edges = []
  equations.forEach(eq => {
    const active = nodes.filter(n => n.label !== eq.omit)
    for (let i = 0; i < active.length; i++)
      for (let j = i + 1; j < active.length; j++)
        edges.push({ x1: active[i].x, y1: active[i].y, x2: active[j].x, y2: active[j].y, color: eq.color })
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect width={W} height={H} fill={C.bg} rx={12} />
      {equations.map((eq, i) => (
        <g key={i}>
          <rect x={W - 175} y={14 + i * 35} width={10} height={10} rx={2} fill={eq.color} />
          <text x={W - 160} y={23 + i * 35} fill={eq.color} fontSize={11} fontFamily="monospace">{eq.label}</text>
          <text x={W - 160} y={35 + i * 35} fill={C.muted} fontSize={9} fontFamily="sans-serif">omits {eq.omit}</text>
        </g>
      ))}
      {edges.map((e, i) => (
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
          stroke={e.color} strokeWidth={1} opacity={0.3} />
      ))}
      {nodes.map(n => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r={22} fill={C.surface} stroke={C.border} strokeWidth={1.5} />
          <text x={n.x} y={n.y + 5} textAnchor="middle" fill={C.text} fontSize={14} fontFamily="monospace" fontWeight="700">{n.label}</text>
        </g>
      ))}
      <text x={16} y={16} fill={C.muted} fontSize={10} fontFamily="sans-serif">Each equation links 4 of the 5 quantities — choose by what's missing</text>
    </svg>
  )
}

// ─── Free-Fall Axes ───────────────────────────────────────────────────────────

function FreeFallAxes({ C }) {
  const W = 420, H = 220
  const axX = 90, top = 30, bot = H - 30

  const tMax = 3
  const yScale = (bot - top) / (0.5 * 9.8 * tMax * tMax)
  const curvePts = Array.from({ length: 40 }, (_, i) => {
    const t = (i / 39) * tMax
    return [axX + 80 + (t / tMax) * 180, top + 0.5 * 9.8 * t * t * yScale]
  })
  const curveD = curvePts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <marker id="ff-fall" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto">
          <path d="M0,0 L3,6 L6,0 Z" fill={C.rose} />
        </marker>
      </defs>
      <rect width={W} height={H} fill={C.bg} rx={12} />
      <line x1={axX} y1={top} x2={axX} y2={bot} stroke={C.border} strokeWidth={1.5} />
      <polygon points={`${axX},${top - 2} ${axX - 5},${top + 10} ${axX + 5},${top + 10}`} fill={C.emerald} />
      <text x={axX - 14} y={top + 22} fill={C.emerald} fontSize={11} fontFamily="monospace" fontWeight="700">+y</text>
      <text x={axX + 8} y={top + 12} fill={C.emerald} fontSize={9} fontFamily="sans-serif">positive upward</text>
      <line x1={axX + 24} y1={bot - 50} x2={axX + 24} y2={bot - 12} stroke={C.rose} strokeWidth={2} markerEnd="url(#ff-fall)" />
      <text x={axX + 32} y={bot - 28} fill={C.rose} fontSize={13} fontFamily="monospace" fontWeight="700">g</text>
      <text x={axX + 32} y={bot - 16} fill={C.rose} fontSize={9} fontFamily="sans-serif">9.8 m/s²</text>
      <text x={axX + 32} y={bot - 4} fill={C.rose} fontSize={9} fontFamily="sans-serif">a = −g (upward +)</text>
      <line x1={axX - 5} y1={(top + bot) / 2} x2={axX + 5} y2={(top + bot) / 2} stroke={C.muted} strokeWidth={1} />
      <text x={axX - 8} y={(top + bot) / 2 + 4} textAnchor="end" fill={C.muted} fontSize={9} fontFamily="monospace">y₀</text>
      <path d={curveD} fill="none" stroke={C.amber} strokeWidth={2} strokeDasharray="5,3" />
      <text x={curvePts[curvePts.length - 1][0] + 4} y={curvePts[curvePts.length - 1][1] - 4}
        fill={C.amber} fontSize={9} fontFamily="monospace">y(t) = y₀ + v₀t − ½gt²</text>
      <text x={axX + 80} y={top + 14} fill={C.muted} fontSize={9} fontFamily="sans-serif">t →</text>
    </svg>
  )
}

// ─── Two-Objects Line ─────────────────────────────────────────────────────────

function TwoObjectsLine({ C }) {
  const W = 480, H = 160
  const y1 = 58, y2 = 105
  const x0 = 50, x1 = W - 40
  const posA = 80, posB = 380, meet = 240

  function xPos(val) { return x0 + ((val - 50) / 350) * (x1 - x0) }
  const pA = xPos(posA), pB = xPos(posB), pM = xPos(meet)
  const lineY = H / 2

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <marker id="to-a" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={C.brand} />
        </marker>
        <marker id="to-b" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
          <path d="M6,0 L0,3 L6,6 Z" fill={C.rose} />
        </marker>
      </defs>
      <rect width={W} height={H} fill={C.bg} rx={12} />
      <line x1={x0} y1={lineY} x2={x1} y2={lineY} stroke={C.border} strokeWidth={1.5} />
      {[0, 1, 2, 3, 4].map(i => {
        const tx = x0 + i * (x1 - x0) / 4
        return <line key={i} x1={tx} y1={lineY - 5} x2={tx} y2={lineY + 5} stroke={C.border} strokeWidth={1} />
      })}
      <circle cx={pA} cy={y1} r={14} fill={C.brand} opacity={0.9} />
      <text x={pA} y={y1 + 5} textAnchor="middle" fill="#fff" fontSize={12} fontFamily="sans-serif" fontWeight="700">A</text>
      <line x1={pA} y1={y1 + 14} x2={pA} y2={lineY} stroke={C.brand} strokeWidth={1} strokeDasharray="3,2" />
      <line x1={pA + 14} y1={y1} x2={pA + 46} y2={y1} stroke={C.brand} strokeWidth={2} markerEnd="url(#to-a)" />
      <text x={pA + 30} y={y1 - 6} textAnchor="middle" fill={C.brand} fontSize={9} fontFamily="monospace">vₐ →</text>
      <circle cx={pB} cy={y2} r={14} fill={C.rose} opacity={0.9} />
      <text x={pB} y={y2 + 5} textAnchor="middle" fill="#fff" fontSize={12} fontFamily="sans-serif" fontWeight="700">B</text>
      <line x1={pB} y1={lineY} x2={pB} y2={y2 - 14} stroke={C.rose} strokeWidth={1} strokeDasharray="3,2" />
      <line x1={pB - 14} y1={y2} x2={pB - 46} y2={y2} stroke={C.rose} strokeWidth={2} markerEnd="url(#to-b)" />
      <text x={pB - 30} y={y2 - 6} textAnchor="middle" fill={C.rose} fontSize={9} fontFamily="monospace">← v_b</text>
      <line x1={pM} y1={lineY - 18} x2={pM} y2={lineY + 18} stroke={C.emerald} strokeWidth={2} strokeDasharray="4,2" />
      <text x={pM} y={lineY - 22} textAnchor="middle" fill={C.emerald} fontSize={10} fontFamily="monospace" fontWeight="700">x_meet</text>
      <text x={W / 2} y={H - 10} textAnchor="middle" fill={C.muted} fontSize={9} fontFamily="sans-serif">
        Meet when xₐ(t) = x_b(t) → set equal and solve algebraically for t
      </text>
    </svg>
  )
}

// ─── Vector Components (right triangle decomposition) ────────────────────────

function VectorComponents({ C }) {
  const W = 420, H = 220
  const ox = 60, oy = H - 40
  const ax = 310, ay = H - 40   // tip of Ax (horizontal)
  const bx = 310, by = 50       // tip of A (diagonal)

  function arrow(x1, y1, x2, y2, color, id) {
    const dx = x2 - x1, dy = y2 - y1
    const len = Math.sqrt(dx * dx + dy * dy)
    const ux = dx / len, uy = dy / len
    const hx = x2 - ux * 10, hy = y2 - uy * 10
    return (
      <g key={id}>
        <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={2.5} />
        <polygon points={`${x2},${y2} ${hx - uy * 5},${hy + ux * 5} ${hx + uy * 5},${hy - ux * 5}`} fill={color} />
      </g>
    )
  }

  const angle = Math.atan2(oy - by, bx - ox) * 180 / Math.PI
  const arcR = 36

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect width={W} height={H} fill={C.bg} rx={12} />

      {/* Grid suggestion lines */}
      <line x1={ax} y1={ay} x2={bx} y2={by} stroke={C.border} strokeWidth={1} strokeDasharray="4,3" />
      <line x1={ox} y1={by} x2={bx} y2={by} stroke={C.border} strokeWidth={1} strokeDasharray="4,3" />

      {/* Right angle marker */}
      <rect x={bx - 12} y={ay - 12} width={12} height={12} fill="none" stroke={C.muted} strokeWidth={1} />

      {/* Component arrows */}
      {arrow(ox, oy, ax, ay, C.sky, 'ax')}
      {arrow(ax, ay, bx, by, C.rose, 'ay')}
      {/* Main vector */}
      {arrow(ox, oy, bx, by, C.emerald, 'a')}

      {/* Angle arc */}
      <path
        d={`M ${ox + arcR} ${oy} A ${arcR} ${arcR} 0 0 0 ${ox + arcR * Math.cos(-angle * Math.PI / 180)} ${oy + arcR * Math.sin(-angle * Math.PI / 180)}`}
        fill="none" stroke={C.amber} strokeWidth={1.5}
      />
      <text x={ox + arcR + 6} y={oy - 10} fill={C.amber} fontSize={12} fontFamily="monospace">θ</text>

      {/* Labels */}
      <text x={(ox + ax) / 2} y={oy + 16} textAnchor="middle" fill={C.sky} fontSize={13} fontFamily="monospace" fontWeight="700">Aₓ = A cos θ</text>
      <text x={bx + 10} y={(ay + by) / 2} fill={C.rose} fontSize={13} fontFamily="monospace" fontWeight="700">A_y = A sin θ</text>
      <text x={(ox + bx) / 2 - 24} y={(oy + by) / 2 - 8} fill={C.emerald} fontSize={14} fontFamily="monospace" fontWeight="700">A</text>

      {/* Magnitude recovery */}
      <text x={W - 16} y={30} textAnchor="end" fill={C.muted} fontSize={10} fontFamily="sans-serif">|A| = √(Aₓ² + A_y²)</text>
      <text x={W - 16} y={44} textAnchor="end" fill={C.muted} fontSize={10} fontFamily="sans-serif">θ = atan2(A_y, Aₓ)</text>
    </svg>
  )
}

// ─── Vector Addition Chain ────────────────────────────────────────────────────

function VectorAdditionChain({ C }) {
  const W = 480, H = 210

  // Three vectors tip-to-tail, then resultant from origin
  const vecs = [
    { dx: 120, dy: -30,  color: C.brand,   label: 'A' },
    { dx: 80,  dy: -90,  color: C.emerald, label: 'B' },
    { dx: -40, dy: -60,  color: C.amber,   label: 'C' },
  ]

  let cx = 60, cy = H - 40
  const start = { x: cx, y: cy }
  const segments = vecs.map(v => {
    const x1 = cx, y1 = cy
    cx += v.dx; cy += v.dy
    return { x1, y1, x2: cx, y2: cy, color: v.color, label: v.label }
  })
  const end = { x: cx, y: cy }

  function arrowHead(x1, y1, x2, y2, color) {
    const dx = x2 - x1, dy = y2 - y1
    const len = Math.sqrt(dx * dx + dy * dy)
    const ux = dx / len, uy = dy / len
    const hx = x2 - ux * 10, hy = y2 - uy * 10
    return (
      <>
        <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={2.5} />
        <polygon points={`${x2},${y2} ${hx - uy * 5},${hy + ux * 5} ${hx + uy * 5},${hy - ux * 5}`} fill={color} />
      </>
    )
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect width={W} height={H} fill={C.bg} rx={12} />

      {/* Chain vectors */}
      {segments.map((s, i) => (
        <g key={i}>
          {arrowHead(s.x1, s.y1, s.x2, s.y2, s.color)}
          <text
            x={(s.x1 + s.x2) / 2 + (s.y2 - s.y1 > 0 ? 10 : -10)}
            y={(s.y1 + s.y2) / 2 + (s.x2 - s.x1 > 0 ? -8 : 8)}
            fill={s.color} fontSize={14} fontFamily="monospace" fontWeight="700"
          >{s.label}</text>
        </g>
      ))}

      {/* Resultant */}
      {arrowHead(start.x, start.y, end.x, end.y, C.rose)}
      <text x={(start.x + end.x) / 2 - 20} y={(start.y + end.y) / 2 + 16}
        fill={C.rose} fontSize={13} fontFamily="monospace" fontWeight="700">R = A+B+C</text>

      {/* Dots at joints */}
      {[start, ...segments.map(s => ({ x: s.x2, y: s.y2 }))].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={C.muted} />
      ))}

      <text x={W / 2} y={H - 8} textAnchor="middle" fill={C.muted} fontSize={9} fontFamily="sans-serif">
        Tip-to-tail: place each vector's tail at the previous tip. Resultant = tail of first → tip of last.
      </text>
    </svg>
  )
}

// ─── Dot Product Projection ───────────────────────────────────────────────────

function DotProductProjection({ C }) {
  const W = 460, H = 200
  const ox = 60, oy = H - 50

  // Vector A along x-ish, vector B at an angle
  const Ax = 260                 // A is horizontal (Ay = 0, shares oy baseline)
  const angle = 38 * Math.PI / 180
  const Blen = 170
  const Bx = Blen * Math.cos(angle), By = -Blen * Math.sin(angle)

  // Projection of B onto A: scalar = B·Â = Blen*cos(angle)
  const projLen = Blen * Math.cos(angle)
  const projX = ox + projLen, projY = oy   // projection foot

  function arr(x1, y1, x2, y2, color) {
    const dx = x2 - x1, dy = y2 - y1
    const len = Math.sqrt(dx * dx + dy * dy)
    const ux = dx / len, uy = dy / len
    const hx = x2 - ux * 9, hy = y2 - uy * 9
    return <>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={2.5} />
      <polygon points={`${x2},${y2} ${hx - uy * 5},${hy + ux * 5} ${hx + uy * 5},${hy - ux * 5}`} fill={color} />
    </>
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect width={W} height={H} fill={C.bg} rx={12} />

      {/* Drop line from B tip to projection */}
      <line x1={ox + Bx} y1={oy + By} x2={projX} y2={projY}
        stroke={C.muted} strokeWidth={1.5} strokeDasharray="4,3" />
      {/* Right angle mark at foot */}
      <rect x={projX - 8} y={projY - 8} width={8} height={8} fill="none" stroke={C.muted} strokeWidth={1} />

      {/* Projection segment on A-axis */}
      <line x1={ox} y1={oy} x2={projX} y2={projY}
        stroke={C.sky} strokeWidth={4} opacity={0.5} />
      <text x={(ox + projX) / 2} y={oy + 20} textAnchor="middle"
        fill={C.sky} fontSize={11} fontFamily="monospace">B cos θ = A⃗·B⃗ / |A⃗|</text>

      {/* Vectors */}
      {arr(ox, oy, ox + Ax, oy, C.emerald)}
      {arr(ox, oy, ox + Bx, oy + By, C.amber)}

      {/* Angle arc */}
      <path d={`M ${ox + 40} ${oy} A 40 40 0 0 0 ${ox + 40 * Math.cos(angle)} ${oy - 40 * Math.sin(angle)}`}
        fill="none" stroke={C.amber} strokeWidth={1.5} />
      <text x={ox + 48} y={oy - 16} fill={C.amber} fontSize={12} fontFamily="monospace">θ</text>

      {/* Labels */}
      <text x={ox + Ax / 2} y={oy - 10} textAnchor="middle" fill={C.emerald} fontSize={14} fontFamily="monospace" fontWeight="700">A⃗</text>
      <text x={ox + Bx / 2 - 12} y={oy + By / 2} fill={C.amber} fontSize={14} fontFamily="monospace" fontWeight="700">B⃗</text>

      {/* Formula */}
      <text x={W - 16} y={24} textAnchor="end" fill={C.text} fontSize={13} fontFamily="monospace" fontWeight="700">A⃗·B⃗ = |A||B| cos θ</text>
      <text x={W - 16} y={42} textAnchor="end" fill={C.muted} fontSize={10} fontFamily="sans-serif">= (projection of B onto A) × |A|</text>
    </svg>
  )
}

// ─── Cross Product Right-Hand Rule ────────────────────────────────────────────

function CrossProductRHR({ C }) {
  const W = 480, H = 220
  // Show A×B=C with arrows in 3D-ish perspective, plus formula
  // Use a simple 2D oblique projection

  // Origin
  const ox = 120, oy = 140

  // A vector (along "x" direction with slight up-right tilt)
  const Ax = 140, Ay = -20
  // B vector (up-left, into screen)
  const Bx = -30, By = -100
  // C = A×B (out of screen = upward in our 2D view, perpendicular to both)
  const Cx = 0, Cy = -90   // drawn perpendicular-ish

  // Project "out of screen" axis (z) slightly right-down
  const Zx = 60, Zy = 30

  function arr(x1, y1, x2, y2, color, width = 2.5) {
    const dx = x2 - x1, dy = y2 - y1
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len < 1) return null
    const ux = dx / len, uy = dy / len
    const hx = x2 - ux * 10, hy = y2 - uy * 10
    return <>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={width} />
      <polygon points={`${x2},${y2} ${hx - uy * 5},${hy + ux * 5} ${hx + uy * 5},${hy - ux * 5}`} fill={color} />
    </>
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect width={W} height={H} fill={C.bg} rx={12} />

      {/* Axes hint */}
      <text x={ox + Ax + 8} y={oy + Ay + 4} fill={C.muted} fontSize={9} fontFamily="sans-serif">x</text>
      <text x={ox + Bx - 10} y={oy + By - 4} fill={C.muted} fontSize={9} fontFamily="sans-serif">y</text>
      <text x={ox + Zx + 4} y={oy + Zy + 4} fill={C.muted} fontSize={9} fontFamily="sans-serif">z</text>
      {arr(ox, oy, ox + Ax * 0.4, oy + Ay * 0.4, C.muted, 1)}
      {arr(ox, oy, ox + Bx * 0.4, oy + By * 0.4, C.muted, 1)}
      {arr(ox, oy, ox + Zx * 0.5, oy + Zy * 0.5, C.muted, 1)}

      {/* A and B vectors */}
      {arr(ox, oy, ox + Ax, oy + Ay, C.brand)}
      {arr(ox, oy, ox + Bx, oy + By, C.emerald)}
      {/* C = A×B */}
      {arr(ox, oy, ox + Cx, oy + Cy, C.rose, 3)}

      {/* Labels */}
      <text x={ox + Ax + 6} y={oy + Ay} fill={C.brand} fontSize={15} fontFamily="monospace" fontWeight="700">A⃗</text>
      <text x={ox + Bx - 20} y={oy + By - 4} fill={C.emerald} fontSize={15} fontFamily="monospace" fontWeight="700">B⃗</text>
      <text x={ox + Cx + 8} y={oy + Cy} fill={C.rose} fontSize={15} fontFamily="monospace" fontWeight="700">A⃗×B⃗</text>

      {/* Curved arrow showing curl from A to B */}
      <path d={`M ${ox + 50} ${oy - 14} Q ${ox + 20} ${oy - 60} ${ox - 16} ${oy - 60}`}
        fill="none" stroke={C.amber} strokeWidth={2} strokeDasharray="5,3" />
      <text x={ox + 16} y={oy - 64} textAnchor="middle" fill={C.amber} fontSize={9} fontFamily="sans-serif">curl fingers A→B</text>

      {/* Right panel: formula and rule */}
      <text x={280} y={36} fill={C.text} fontSize={13} fontFamily="monospace" fontWeight="700">A⃗ × B⃗ = |A||B| sin θ n̂</text>
      <text x={280} y={56} fill={C.muted} fontSize={9} fontFamily="sans-serif">n̂ = unit normal (right-hand rule)</text>
      <text x={280} y={80} fill={C.sky} fontSize={11} fontFamily="monospace">Right-hand rule:</text>
      <text x={280} y={96} fill={C.muted} fontSize={9} fontFamily="sans-serif">1. Point fingers along A⃗</text>
      <text x={280} y={110} fill={C.muted} fontSize={9} fontFamily="sans-serif">2. Curl toward B⃗</text>
      <text x={280} y={124} fill={C.muted} fontSize={9} fontFamily="sans-serif">3. Thumb points along A⃗×B⃗</text>
      <text x={280} y={146} fill={C.rose} fontSize={10} fontFamily="monospace">B⃗×A⃗ = −(A⃗×B⃗)</text>
      <text x={280} y={160} fill={C.muted} fontSize={9} fontFamily="sans-serif">Anti-commutative — order matters!</text>

      <text x={W / 2} y={H - 6} textAnchor="middle" fill={C.muted} fontSize={9} fontFamily="sans-serif">
        |A⃗×B⃗| = area of parallelogram spanned by A⃗ and B⃗
      </text>
    </svg>
  )
}

// ─── Free Body Diagram ────────────────────────────────────────────────────────

function FreeBodyDiagram({ C }) {
  const W = 420, H = 220
  const cx = 180, cy = 120
  const r = 28

  const forces = [
    { label: 'N (normal)',  dx: 0,    dy: -90, color: C.emerald },
    { label: 'W = mg',     dx: 0,    dy: 80,  color: C.rose },
    { label: 'F (applied)',dx: 100,  dy: -20, color: C.brand },
    { label: 'f (friction)',dx: -80, dy: 0,   color: C.amber },
  ]

  function arr(x1, y1, x2, y2, color) {
    const dx = x2 - x1, dy = y2 - y1
    const len = Math.sqrt(dx * dx + dy * dy)
    const ux = dx / len, uy = dy / len
    const hx = x2 - ux * 10, hy = y2 - uy * 10
    return <>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={2.5} />
      <polygon points={`${x2},${y2} ${hx - uy * 5},${hy + ux * 5} ${hx + uy * 5},${hy - ux * 5}`} fill={color} />
    </>
  }

  // Edge point of circle in direction of force
  function edgePoint(dx, dy) {
    const len = Math.sqrt(dx * dx + dy * dy)
    return [cx + (dx / len) * r, cy + (dy / len) * r]
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <rect width={W} height={H} fill={C.bg} rx={12} />

      {/* Object */}
      <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={4}
        fill={C.surface} stroke={C.border} strokeWidth={1.5} />
      <text x={cx} y={cy + 5} textAnchor="middle" fill={C.muted} fontSize={11} fontFamily="sans-serif">m</text>

      {/* Forces */}
      {forces.map((f, i) => {
        const [ex, ey] = edgePoint(f.dx, f.dy)
        return <g key={i}>{arr(ex, ey, ex + f.dx, ey + f.dy, f.color)}</g>
      })}

      {/* Labels on the right */}
      {forces.map((f, i) => (
        <g key={i}>
          <rect x={W - 130} y={20 + i * 44} width={8} height={8} rx={2} fill={f.color} />
          <text x={W - 118} y={29 + i * 44} fill={f.color} fontSize={11} fontFamily="monospace">{f.label}</text>
        </g>
      ))}

      <text x={W / 2} y={H - 6} textAnchor="middle" fill={C.muted} fontSize={9} fontFamily="sans-serif">
        F_net = ΣF = ma — isolate the object, draw every force acting ON it
      </text>
    </svg>
  )
}

// ─── Registry + export ────────────────────────────────────────────────────────

const DIAGRAMS = {
  // Algebra-first (kinematics)
  'algebra-rectangle':    AlgebraRectangle,
  'algebra-trapezoid':    AlgebraTrapezoid,
  'algebra-avg-velocity': AlgebraAvgVelocity,
  // Bridge: algebra → calculus
  'slope-triangle':       SlopeTriangle,
  'riemann-rect':         RiemannRect,
  // Kinematics reference
  'kinematic-chain':      KinematicChain,
  'suvat-map':            SuvatMap,
  'free-fall-axes':       FreeFallAxes,
  'two-objects-line':     TwoObjectsLine,
  // Vectors (Ch1)
  'vector-components':       VectorComponents,
  'vector-addition-chain':   VectorAdditionChain,
  'dot-product-projection':  DotProductProjection,
  'cross-product-rhr':       CrossProductRHR,
  'free-body-diagram':       FreeBodyDiagram,
}

export default function SVGDiagram({ params = {} }) {
  const dark = useIsDark()
  const C = dark ? DARK : LIGHT
  const type = params.type ?? ''
  const Diagram = DIAGRAMS[type]

  if (!Diagram) {
    return (
      <div style={{
        background: C.bg, borderRadius: 12, padding: '20px',
        color: C.muted, fontFamily: 'monospace', fontSize: 12,
      }}>
        Unknown diagram type: "{type}". Available: {Object.keys(DIAGRAMS).join(', ')}
      </div>
    )
  }

  return (
    <div style={{ background: C.bg, borderRadius: 12, overflow: 'hidden' }}>
      <Diagram C={C} />
    </div>
  )
}
