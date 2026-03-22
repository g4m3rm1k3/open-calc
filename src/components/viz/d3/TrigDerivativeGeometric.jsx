/**
 * TrigDerivativeGeometric — Geometric proof of sin, cos, and tan derivatives.
 * Step-synced with DynamicProof (currentStep in params), plus a live angle slider
 * so the user can verify the relationships hold at any point on the circle.
 *
 * Proof strategy:
 *   A point moving at unit speed on the unit circle has position (cos x, sin x)
 *   and velocity (-sin x, cos x) (perpendicular to radius, CCW).
 *   Each velocity component IS the derivative of the matching coordinate:
 *     d(sin x)/dx = vy = cos x
 *     d(cos x)/dx = vx = -sin x
 *   For tan x, extend the radius to the vertical line at x=1.
 *   The height of that intersection is tan x; its rate of change is sec²x.
 */
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const STEP_INFO = [
  {
    title: 'Position: P = (cos x, sin x)',
    body: 'Every point on the unit circle is (cos x, sin x). As x increases, P moves counterclockwise. We want to know how fast each coordinate changes.',
    color: '#6366f1',
  },
  {
    title: 'Velocity: v = (−sin x, cos x)',
    body: 'At unit speed, the velocity is always perpendicular to the radius. For a unit circle that direction is (−sin x, cos x). Velocity is the derivative of position, so these components ARE the derivatives.',
    color: '#f43f5e',
  },
  {
    title: 'd(sin x)/dx = cos x',
    body: 'The green dashed line shows the vertical component of velocity: vy = cos x. This is the rate at which the height (sin x) changes — so d(sin x)/dx = cos x.',
    color: '#10b981',
  },
  {
    title: 'd(cos x)/dx = −sin x',
    body: 'The amber dashed line shows the horizontal component: vx = −sin x. In the first quadrant P moves left, so the x-coordinate decreases — the minus sign is not a coincidence, it reflects that leftward motion.',
    color: '#f59e0b',
  },
  {
    title: 'Tangent geometry: tan x on the line x = 1',
    body: 'Extend the radius to the vertical line at distance 1. The height of that intersection point is tan x (opposite over adjacent = sin x / cos x). The blue segment is the geometric meaning of tangent.',
    color: '#3b82f6',
  },
  {
    title: 'How fast does tan x grow? The purple segment.',
    body: 'When x increases by a tiny δx, the tangent segment grows by a purple amount. The ratio d(tan x)/δx depends on how far the intersection is from the origin — that distance is sec x, and the ratio becomes sec²x.',
    color: '#8b5cf6',
  },
  {
    title: 'd(tan x)/dx = sec²x',
    body: 'The geometric argument: a small rotation δx sweeps an arc of length δx on the unit circle. Projected onto the vertical tangent line at distance sec x, this becomes sec x · δx. Then the tangent height changes by that much times another factor of sec x. Result: sec²x.',
    color: '#8b5cf6',
  },
]

export default function TrigDerivativeGeometric({ params = {} }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const { currentStep = 0 } = params
  const [angle, setAngle] = useState(Math.PI / 5) // ~36°, gives visible separation

  useEffect(() => {
    const draw = () => {
      const container = containerRef.current
      const svgEl = svgRef.current
      if (!container || !svgEl) return

      const isDark = document.documentElement.classList.contains('dark')
      const W = container.clientWidth || 420
      const H = Math.min(Math.max(W * 0.72, 280), 380)

      const svg = d3.select(svgEl).attr('width', W).attr('height', H)
      svg.selectAll('*').remove()

      // ── Color tokens ──────────────────────────────────────────────────────────
      const C = {
        bg:      isDark ? '#0f172a' : '#f8fafc',
        axis:    isDark ? '#334155' : '#cbd5e1',
        circle:  isDark ? '#334155' : '#cbd5e1',
        label:   isDark ? '#94a3b8' : '#64748b',
        text:    isDark ? '#e2e8f0' : '#1e293b',
        dimLine: isDark ? '#1e293b' : '#e2e8f0',
        radius:  '#6366f1',
        vel:     '#f43f5e',
        vy:      '#10b981',
        vx:      '#f59e0b',
        tan:     '#3b82f6',
        dtan:    '#8b5cf6',
      }

      svg.append('rect').attr('width', W).attr('height', H).attr('fill', C.bg)

      // ── Geometry layout ───────────────────────────────────────────────────────
      const cx = W * 0.43
      const cy = H * 0.52
      const R  = Math.min(W * 0.30, H * 0.38, 120)
      const g  = svg.append('g').attr('transform', `translate(${cx},${cy})`)

      // Arrow marker factory
      const mkArrow = (id, color) => {
        svg.select('defs').empty() && svg.append('defs')
        svg.select('defs').append('marker')
          .attr('id', id)
          .attr('viewBox', '0 -4 8 8').attr('refX', 7).attr('refY', 0)
          .attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto')
          .append('path').attr('d', 'M0,-4 L8,0 L0,4').attr('fill', color)
      }

      // ── Axes ──────────────────────────────────────────────────────────────────
      g.append('line').attr('x1', -R - 14).attr('x2', R + 55)
       .attr('y1', 0).attr('y2', 0).attr('stroke', C.axis).attr('stroke-width', 1)
      g.append('line').attr('x1', 0).attr('x2', 0)
       .attr('y1', -R - 14).attr('y2', R + 14).attr('stroke', C.axis).attr('stroke-width', 1)

      // Axis labels
      g.append('text').attr('x', R + 58).attr('y', 4)
       .attr('font-size', 11).attr('fill', C.label).attr('text-anchor', 'end').text('x')
      g.append('text').attr('x', 5).attr('y', -R - 8)
       .attr('font-size', 11).attr('fill', C.label).text('y')

      // ── Unit circle ───────────────────────────────────────────────────────────
      g.append('circle').attr('r', R).attr('fill', 'none')
       .attr('stroke', C.circle).attr('stroke-width', 1.5)

      // ── Derived positions ─────────────────────────────────────────────────────
      const cosA = Math.cos(angle), sinA = Math.sin(angle)
      const px = R * cosA          // P.x in SVG (relative to center)
      const py = -R * sinA         // P.y in SVG (y-flipped)
      const vLen = R * 0.52
      // Velocity direction in SVG coords: (-sin, -cos) because y-axis is flipped
      const vtx = px + (-sinA) * vLen
      const vty = py + (-cosA) * vLen

      // ── STEP 0 — Radius + point P ─────────────────────────────────────────────
      if (currentStep >= 0) {
        // Angle arc
        const arcR = R * 0.26
        g.append('path')
          .attr('d', `M ${arcR} 0 A ${arcR} ${arcR} 0 0 1 ${(arcR * cosA).toFixed(2)} ${(-arcR * sinA).toFixed(2)}`)
          .attr('fill', 'none').attr('stroke', C.label).attr('stroke-width', 1)
        g.append('text')
          .attr('x', arcR * Math.cos(angle / 2) + 10)
          .attr('y', -arcR * Math.sin(angle / 2) + 4)
          .attr('font-size', 11).attr('fill', C.label).text('x')

        // Radius vector
        g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', px).attr('y2', py)
         .attr('stroke', C.radius).attr('stroke-width', 2)

        // Point P
        g.append('circle').attr('cx', px).attr('cy', py).attr('r', 5).attr('fill', C.radius)

        // P label — always upper-right of point for first quadrant
        g.append('text')
          .attr('x', px + 8).attr('y', py - 6)
          .attr('font-size', 11).attr('fill', C.radius).attr('font-weight', 'bold')
          .text('P')
        g.append('text')
          .attr('x', px + 8).attr('y', py + 7)
          .attr('font-size', 10).attr('fill', C.radius)
          .text('(cos x, sin x)')

        // Coordinate projections (faint dashed)
        g.append('line').attr('x1', px).attr('y1', py).attr('x2', px).attr('y2', 0)
         .attr('stroke', C.dimLine).attr('stroke-width', 1).attr('stroke-dasharray', '3 3')
        g.append('line').attr('x1', px).attr('y1', py).attr('x2', 0).attr('y2', py)
         .attr('stroke', C.dimLine).attr('stroke-width', 1).attr('stroke-dasharray', '3 3')

        // cos x and sin x tick labels
        g.append('text').attr('x', px).attr('y', 12).attr('font-size', 10)
         .attr('fill', C.label).attr('text-anchor', 'middle').text('cos x')
        g.append('text').attr('x', -8).attr('y', py + 4).attr('font-size', 10)
         .attr('fill', C.label).attr('text-anchor', 'end').text('sin x')
      }

      // ── STEP 1 — Velocity arrow ───────────────────────────────────────────────
      if (currentStep >= 1) {
        mkArrow('arr-vel', C.vel)
        g.append('line')
          .attr('x1', px).attr('y1', py).attr('x2', vtx).attr('y2', vty)
          .attr('stroke', C.vel).attr('stroke-width', 2.5)
          .attr('marker-end', 'url(#arr-vel)')

        // Label at arrow tip — offset away from the arrow body
        const tipOffX = -sinA > 0 ? 6 : -6
        const tipAnchor = -sinA > 0 ? 'start' : 'end'
        g.append('text')
          .attr('x', vtx + tipOffX).attr('y', vty - 8)
          .attr('font-size', 10).attr('fill', C.vel)
          .attr('text-anchor', tipAnchor)
          .text('v = (−sin x, cos x)')
      }

      // ── STEP 2 — vy component (green, vertical) ───────────────────────────────
      if (currentStep >= 2) {
        // Vertical dashed from (vtx, py) to (vtx, vty) — the cos x component
        g.append('line')
          .attr('x1', vtx).attr('y1', py).attr('x2', vtx).attr('y2', vty)
          .attr('stroke', C.vy).attr('stroke-width', 2.5).attr('stroke-dasharray', '5 3')

        // Label to the LEFT of the vertical line (vtx is left of px for first quadrant)
        g.append('text')
          .attr('x', vtx - 6).attr('y', (py + vty) / 2 + 4)
          .attr('font-size', 10).attr('fill', C.vy).attr('text-anchor', 'end')
          .text('vy = cos x')
        // Small brace formula
        g.append('text')
          .attr('x', vtx - 6).attr('y', (py + vty) / 2 + 16)
          .attr('font-size', 9).attr('fill', C.vy).attr('text-anchor', 'end')
          .attr('opacity', 0.75)
          .text(`= ${cosA.toFixed(3)}`)
      }

      // ── STEP 3 — vx component (amber, horizontal) ────────────────────────────
      if (currentStep >= 3) {
        // Horizontal dashed from (px, py) to (vtx, py)
        g.append('line')
          .attr('x1', px).attr('y1', py).attr('x2', vtx).attr('y2', py)
          .attr('stroke', C.vx).attr('stroke-width', 2.5).attr('stroke-dasharray', '5 3')

        // Label BELOW the horizontal segment, centered
        g.append('text')
          .attr('x', (px + vtx) / 2).attr('y', py + 14)
          .attr('font-size', 10).attr('fill', C.vx).attr('text-anchor', 'middle')
          .text('vx = −sin x')
        g.append('text')
          .attr('x', (px + vtx) / 2).attr('y', py + 25)
          .attr('font-size', 9).attr('fill', C.vx).attr('text-anchor', 'middle')
          .attr('opacity', 0.75)
          .text(`= ${(-sinA).toFixed(3)}`)
      }

      // ── STEP 4 — Tangent line x=1 and tan x segment ──────────────────────────
      if (currentStep >= 4) {
        const tanVal = Math.tan(angle)
        const tx = R                     // x=1 in circle units = R in SVG
        const ty = -R * tanVal           // SVG y (flipped)

        // Dashed vertical line at x = 1 (the tangent reference line)
        g.append('line')
          .attr('x1', tx).attr('y1', Math.min(R * 0.35, -ty + 15))
          .attr('x2', tx).attr('y2', R * 0.25)
          .attr('stroke', C.label).attr('stroke-width', 1).attr('stroke-dasharray', '4 3')
        g.append('text').attr('x', tx + 3).attr('y', R * 0.22)
          .attr('font-size', 9).attr('fill', C.label).text('x = 1')

        // Ray from origin through P extended to x=1
        g.append('line')
          .attr('x1', 0).attr('y1', 0).attr('x2', tx).attr('y2', ty)
          .attr('stroke', C.tan).attr('stroke-width', 1.5).attr('stroke-dasharray', '6 4')

        // tan x segment from x-axis up to intersection
        g.append('line')
          .attr('x1', tx).attr('y1', 0).attr('x2', tx).attr('y2', ty)
          .attr('stroke', C.tan).attr('stroke-width', 3)

        // Intersection dot
        g.append('circle').attr('cx', tx).attr('cy', ty).attr('r', 4).attr('fill', C.tan)

        // Label: "tan x" to the right, midpoint of the segment
        const tanMidY = ty / 2
        g.append('text')
          .attr('x', tx + 8).attr('y', tanMidY + 4)
          .attr('font-size', 11).attr('fill', C.tan).attr('font-weight', 'bold')
          .text('tan x')
        g.append('text')
          .attr('x', tx + 8).attr('y', tanMidY + 17)
          .attr('font-size', 9).attr('fill', C.tan).attr('opacity', 0.8)
          .text(`≈ ${tanVal.toFixed(3)}`)
      }

      // ── STEP 5 — d(tan x) purple segment ─────────────────────────────────────
      if (currentStep >= 5) {
        const tx = R
        const ty  = -R * Math.tan(angle)
        const dA  = 0.18   // small angle increment for visual
        const ty2 = -R * Math.tan(angle + dA)

        if (isFinite(ty2) && Math.abs(ty2 - ty) < R * 2.5) {
          g.append('line')
            .attr('x1', tx).attr('y1', ty).attr('x2', tx).attr('y2', ty2)
            .attr('stroke', C.dtan).attr('stroke-width', 5)

          g.append('text')
            .attr('x', tx + 9).attr('y', (ty + ty2) / 2 + 4)
            .attr('font-size', 10).attr('fill', C.dtan).attr('font-weight', 'bold')
            .text('δ(tan x)')
        }
      }

      // ── STEP 6 — sec²x annotation ─────────────────────────────────────────────
      if (currentStep >= 6) {
        const secSq = 1 / (cosA * cosA)
        g.append('text')
          .attr('x', R + 8).attr('y', -R * 0.55)
          .attr('font-size', 12).attr('fill', C.dtan).attr('font-weight', 'bold')
          .text(`d(tan x)/dx`)
        g.append('text')
          .attr('x', R + 8).attr('y', -R * 0.55 + 16)
          .attr('font-size', 12).attr('fill', C.dtan).attr('font-weight', 'bold')
          .text(`= sec²x ≈ ${secSq.toFixed(3)}`)
      }
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [currentStep, angle])

  const step = Math.min(currentStep, STEP_INFO.length - 1)
  const info = STEP_INFO[step]
  const cosA = Math.cos(angle), sinA = Math.sin(angle)

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-[#0f172a]">
      {/* Main area: SVG + info panel side-by-side */}
      <div className="flex flex-col sm:flex-row">
        {/* SVG */}
        <div ref={containerRef} className="flex-1 min-h-[280px]">
          <svg ref={svgRef} className="w-full" />
        </div>

        {/* Right info panel */}
        <div className="sm:w-52 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-950 flex flex-col gap-4 text-sm">
          {/* Current step description */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">
              Step {step + 1} / {STEP_INFO.length}
            </p>
            <p className="font-semibold mb-1" style={{ color: info.color }}>{info.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{info.body}</p>
          </div>

          {/* Color legend — shows only revealed elements */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Legend</p>
            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              {currentStep >= 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-2.5 rounded-sm inline-block flex-shrink-0 bg-indigo-500" />
                  <span>Radius → P = (cos x, sin x)</span>
                </div>
              )}
              {currentStep >= 1 && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-2.5 rounded-sm inline-block flex-shrink-0 bg-rose-500" />
                  <span>Velocity v = (−sin x, cos x)</span>
                </div>
              )}
              {currentStep >= 2 && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-2.5 rounded-sm inline-block flex-shrink-0 bg-emerald-500" />
                  <span>d(sin x)/dx = cos x</span>
                </div>
              )}
              {currentStep >= 3 && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-2.5 rounded-sm inline-block flex-shrink-0 bg-amber-500" />
                  <span>d(cos x)/dx = −sin x</span>
                </div>
              )}
              {currentStep >= 4 && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-2.5 rounded-sm inline-block flex-shrink-0 bg-blue-500" />
                  <span>tan x on x = 1</span>
                </div>
              )}
              {currentStep >= 5 && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-2.5 rounded-sm inline-block flex-shrink-0 bg-violet-500" />
                  <span>d(tan x)/dx = sec²x</span>
                </div>
              )}
            </div>
          </div>

          {/* Live values */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">
              Live at x = {angle.toFixed(2)} rad
            </p>
            <div className="font-mono text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <p><span className="text-indigo-400">cos x</span> = {cosA.toFixed(4)}</p>
              <p><span className="text-rose-400">sin x</span> = {sinA.toFixed(4)}</p>
              {currentStep >= 4 && (
                <p><span className="text-blue-400">tan x</span> = {Math.tan(angle).toFixed(4)}</p>
              )}
              {currentStep >= 5 && (
                <p><span className="text-violet-400">sec²x</span> = {(1 / cosA / cosA).toFixed(4)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Angle slider — always visible */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Angle x — drag to verify relationships hold everywhere on the circle
          </label>
          <span className="text-xs font-mono text-slate-400">
            {angle.toFixed(2)} rad = {(angle * 180 / Math.PI).toFixed(0)}°
          </span>
        </div>
        <input
          type="range"
          min="0.08"
          max="1.45"
          step="0.01"
          value={angle}
          onChange={e => setAngle(+e.target.value)}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-0.5">
          <span>0°</span>
          <span>~83°</span>
        </div>
      </div>
    </div>
  )
}
