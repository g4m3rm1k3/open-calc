/**
 * SinDerivativeGeometric — Geometric proof that d/dx[sin x] = cos x
 *
 * Step-synced with DynamicProof (receives currentStep via params).
 *
 * The proof: A point P moves around the unit circle. Its velocity vector
 * is tangent to the circle (perpendicular to the radius). The y-component
 * of that velocity is exactly cos(x) — which IS the derivative of sin(x).
 *
 * Steps:
 *  0 → Unit circle + point P at angle x, label sin(x) height
 *  1 → Show the radius vector OP
 *  2 → Show velocity vector (perpendicular to radius) — tangent to circle
 *  3 → Decompose velocity: x-component = -sin x, y-component = cos x
 *  4 → Highlight y-component: that IS d(sin x)/dx = cos x ✓
 */
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const X_ANGLE = Math.PI / 5   // ~36°, a nice illustrative angle

export default function SinDerivativeGeometric({ params = {} }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const { currentStep = 0 } = params

  useEffect(() => {
    const ro = new ResizeObserver(() => draw(currentStep))
    ro.observe(containerRef.current)
    draw(currentStep)
    return () => ro.disconnect()
  }, [currentStep])

  function draw(step) {
    const container = containerRef.current
    const svgEl = svgRef.current
    if (!container || !svgEl) return
    const W = container.clientWidth || 400
    const H = Math.min(W, 360)
    if (W < 40 || H < 40) return

    const svg = d3.select(svgEl).attr('width', W).attr('height', H)
    svg.selectAll('*').remove()

    const cx = W * 0.45
    const cy = H * 0.50
    const R  = Math.min(W, H) * 0.34

    // ── Circle ──────────────────────────────────────────────────────────────
    svg.append('circle')
      .attr('cx', cx).attr('cy', cy).attr('r', R)
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1').attr('stroke-width', 1.5)

    // Axes
    const ax = svg.append('g').attr('class', 'axes')
    ax.append('line')
      .attr('x1', cx - R - 16).attr('x2', cx + R + 16)
      .attr('y1', cy).attr('y2', cy)
      .attr('stroke', '#94a3b8').attr('stroke-width', 1)
    ax.append('line')
      .attr('x1', cx).attr('x2', cx)
      .attr('y1', cy - R - 16).attr('y2', cy + R + 16)
      .attr('stroke', '#94a3b8').attr('stroke-width', 1)

    // Axis labels
    ax.append('text').attr('x', cx + R + 18).attr('y', cy + 4).attr('font-size', 11).attr('fill', '#94a3b8').text('x')
    ax.append('text').attr('x', cx + 3).attr('y', cy - R - 16).attr('font-size', 11).attr('fill', '#94a3b8').text('y')
    ax.append('text').attr('x', cx + 3).attr('y', cy + 13).attr('font-size', 10).attr('fill', '#94a3b8').text('0')

    // ── Point P at angle X_ANGLE ─────────────────────────────────────────────
    const px = cx + R * Math.cos(X_ANGLE)
    const py = cy - R * Math.sin(X_ANGLE)   // svg y is flipped

    // ── Step 0: P + sin(x) height ───────────────────────────────────────────
    // sin(x) vertical drop to x-axis
    svg.append('line')
      .attr('x1', px).attr('x2', px)
      .attr('y1', py).attr('y2', cy)
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', step >= 0 ? 2.5 : 0)
      .attr('stroke-dasharray', step >= 0 ? null : '0')

    // cos(x) horizontal projection
    svg.append('line')
      .attr('x1', cx).attr('x2', px)
      .attr('y1', cy).attr('y2', cy)
      .attr('stroke', '#10b981')
      .attr('stroke-width', step >= 0 ? 2 : 0)

    // P dot
    svg.append('circle').attr('cx', px).attr('cy', py).attr('r', 7)
      .attr('fill', '#6366f1').attr('stroke', 'white').attr('stroke-width', 2)

    // Labels — sin(x) and cos(x)
    if (step >= 0) {
      svg.append('text')
        .attr('x', px + 8).attr('y', (py + cy) / 2 + 4)
        .attr('font-size', 13).attr('font-weight', 'bold').attr('fill', '#3b82f6')
        .text('sin x')
      svg.append('text')
        .attr('x', (cx + px) / 2 - 14).attr('y', cy + 14)
        .attr('font-size', 13).attr('font-weight', 'bold').attr('fill', '#10b981')
        .text('cos x')
      svg.append('text')
        .attr('x', px + 8).attr('y', py - 6)
        .attr('font-size', 12).attr('font-weight', 'bold').attr('fill', '#6366f1')
        .text('P = (cos x, sin x)')
      // Angle arc
      const arcPath = d3.arc()({ innerRadius: 0, outerRadius: 28, startAngle: -Math.PI/2, endAngle: -(Math.PI/2 - X_ANGLE) })
      svg.append('path').attr('d', arcPath)
        .attr('transform', `translate(${cx},${cy}) rotate(-90)`)
        .attr('fill', 'none').attr('stroke', '#6366f1').attr('stroke-width', 1.5).attr('opacity', 0.7)
      svg.append('text').attr('x', cx + 32).attr('y', cy - 8)
        .attr('font-size', 11).attr('fill', '#6366f1').attr('font-style', 'italic').text('x')
    }

    // ── Step 1: Radius vector OP ─────────────────────────────────────────────
    if (step >= 1) {
      svg.append('line')
        .attr('x1', cx).attr('x2', px - 10 * Math.cos(X_ANGLE))
        .attr('y1', cy).attr('y2', py + 10 * Math.sin(X_ANGLE))
        .attr('stroke', '#f59e0b').attr('stroke-width', 2.5)
        .attr('marker-end', 'url(#arrowGold)')
      // Arrowhead defs
      const defs = svg.append('defs')
      defs.append('marker').attr('id', 'arrowGold').attr('markerWidth', 8).attr('markerHeight', 8)
        .attr('refX', 4).attr('refY', 2).attr('orient', 'auto')
        .append('polygon').attr('points', '0 0, 8 2, 0 4').attr('fill', '#f59e0b')
      svg.append('text')
        .attr('x', (cx + px) / 2 - 28).attr('y', (cy + py) / 2 - 6)
        .attr('font-size', 11).attr('fill', '#f59e0b').attr('font-weight', 'bold')
        .text('radius = 1')
    }

    // ── Step 2+: Velocity vector (perpendicular to radius) ───────────────────
    if (step >= 2) {
      const defs2 = step >= 1 ? svg.select('defs') : svg.append('defs')
      // Velocity direction: perpendicular to (cos x, sin x) = (-sin x, cos x)
      const vx = -Math.sin(X_ANGLE)
      const vy = -Math.cos(X_ANGLE)  // svg y flip
      const vScale = R * 0.55
      const vTipX = px + vx * vScale
      const vTipY = py + vy * vScale

      defs2.append('marker').attr('id', 'arrowPurple').attr('markerWidth', 8).attr('markerHeight', 8)
        .attr('refX', 4).attr('refY', 2).attr('orient', 'auto')
        .append('polygon').attr('points', '0 0, 8 2, 0 4').attr('fill', '#a855f7')

      svg.append('line')
        .attr('x1', px).attr('y1', py)
        .attr('x2', vTipX - vx * 10).attr('y2', vTipY - vy * 10)
        .attr('stroke', '#a855f7').attr('stroke-width', 3)
        .attr('marker-end', 'url(#arrowPurple)')

      if (step === 2) {
        svg.append('text')
          .attr('x', vTipX + 6).attr('y', vTipY - 6)
          .attr('font-size', 11).attr('fill', '#a855f7').attr('font-weight', 'bold')
          .text('velocity')
        svg.append('text')
          .attr('x', vTipX + 6).attr('y', vTipY + 7)
          .attr('font-size', 10).attr('fill', '#a855f7')
          .text('⊥ to radius')

        // Right-angle marker at P
        const sq = 12
        const nx = Math.cos(X_ANGLE)   // radius direction
        const ny = -Math.sin(X_ANGLE)
        const tx = vx; const ty = vy
        svg.append('polyline')
          .attr('points', [
            [px + nx * sq, py + ny * sq],
            [px + nx * sq + tx * sq, py + ny * sq + ty * sq],
            [px + tx * sq, py + ty * sq],
          ].map(p => p.join(',')).join(' '))
          .attr('fill', 'none').attr('stroke', '#a855f7').attr('stroke-width', 1.2).attr('opacity', 0.6)
      }
    }

    // ── Step 3: Decompose velocity into x and y components ─────────────────
    if (step >= 3) {
      const vx = -Math.sin(X_ANGLE)
      const vy = -Math.cos(X_ANGLE)
      const vScale = R * 0.55

      const defs3 = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs')
      defs3.append('marker').attr('id', 'arrowRed').attr('markerWidth', 8).attr('markerHeight', 8)
        .attr('refX', 4).attr('refY', 2).attr('orient', 'auto')
        .append('polygon').attr('points', '0 0, 8 2, 0 4').attr('fill', '#ef4444')
      defs3.append('marker').attr('id', 'arrowGreen').attr('markerWidth', 8).attr('markerHeight', 8)
        .attr('refX', 4).attr('refY', 2).attr('orient', 'auto')
        .append('polygon').attr('points', '0 0, 8 2, 0 4').attr('fill', '#10b981')

      // x-component (horizontal)
      svg.append('line')
        .attr('x1', px).attr('y1', py)
        .attr('x2', px + vx * vScale - 8).attr('y2', py)
        .attr('stroke', '#ef4444').attr('stroke-width', 2.5)
        .attr('stroke-dasharray', '5,3')
        .attr('marker-end', 'url(#arrowRed)')
      svg.append('text')
        .attr('x', px + vx * vScale / 2 - 18).attr('y', py - 8)
        .attr('font-size', 12).attr('fill', '#ef4444').attr('font-weight', 'bold')
        .text('−sin x')

      // y-component (vertical)
      svg.append('line')
        .attr('x1', px + vx * vScale).attr('y1', py)
        .attr('x2', px + vx * vScale).attr('y2', py + vy * vScale - 8)
        .attr('stroke', '#10b981').attr('stroke-width', 2.5)
        .attr('stroke-dasharray', '5,3')
        .attr('marker-end', 'url(#arrowGreen)')
      svg.append('text')
        .attr('x', px + vx * vScale + 8).attr('y', py + vy * vScale / 2)
        .attr('font-size', 12).attr('fill', '#10b981').attr('font-weight', 'bold')
        .text('cos x')
    }

    // ── Step 4: Final highlight — y-component is the derivative ─────────────
    if (step >= 4) {
      const vx = -Math.sin(X_ANGLE)
      const vy = -Math.cos(X_ANGLE)
      const vScale = R * 0.55

      // Glow on the y-component
      svg.append('line')
        .attr('x1', px + vx * vScale).attr('y1', py)
        .attr('x2', px + vx * vScale).attr('y2', py + vy * vScale)
        .attr('stroke', '#10b981').attr('stroke-width', 10).attr('opacity', 0.25)

      // Big annotation box
      const bx = W * 0.04
      const by = H * 0.06
      svg.append('rect').attr('x', bx).attr('y', by).attr('width', 160).attr('height', 52)
        .attr('rx', 8).attr('fill', '#f0fdf4').attr('stroke', '#10b981').attr('stroke-width', 1.5)
      svg.append('text').attr('x', bx + 10).attr('y', by + 18)
        .attr('font-size', 11).attr('fill', '#065f46').attr('font-weight', 'bold')
        .text('y-velocity = cos x')
      svg.append('text').attr('x', bx + 10).attr('y', by + 34)
        .attr('font-size', 11).attr('fill', '#065f46')
        .text('= rate of change of sin x')
      svg.append('text').attr('x', bx + 10).attr('y', by + 50)
        .attr('font-size', 12).attr('fill', '#047857').attr('font-weight', 'bold')
        .text('∴ d/dx[sin x] = cos x ✓')
    }
  }

  return (
    <div ref={containerRef} className="w-full bg-white dark:bg-slate-900 rounded-xl p-3">
      <svg ref={svgRef} className="w-full block" />
    </div>
  )
}
