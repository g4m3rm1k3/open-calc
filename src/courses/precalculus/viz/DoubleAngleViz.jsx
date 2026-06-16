import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

/**
 * DoubleAngleViz
 * Shows sin(2θ) = 2sinθcosθ geometrically.
 * Left panel: unit circle with angle θ and 2θ marked, right triangle decomposed.
 * Right panel: the algebraic identity updating live.
 * Draggable angle. Dark mode. ResizeObserver.
 */
export default function DoubleAngleViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const thetaRef = useRef(Math.PI / 6)

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:      isDark ? '#0f172a' : '#f8fafc',
        panel:   isDark ? '#1e293b' : '#ffffff',
        border:  isDark ? '#334155' : '#e2e8f0',
        axis:    isDark ? '#475569' : '#94a3b8',
        text:    isDark ? '#e2e8f0' : '#1e293b',
        muted:   isDark ? '#64748b' : '#94a3b8',
        circle:  isDark ? '#334155' : '#e2e8f0',
        theta:   isDark ? '#38bdf8' : '#0284c7',
        double:  isDark ? '#a78bfa' : '#7c3aed',
        sin:     isDark ? '#f472b6' : '#db2777',
        cos:     isDark ? '#34d399' : '#059669',
        point:   isDark ? '#fbbf24' : '#d97706',
        hyp:     isDark ? '#fb923c' : '#ea580c',
      }

      const W = containerRef.current?.clientWidth || 540
      const H = Math.round(W * 0.62)
      const halfW = Math.floor(W / 2) - 4
      const cx = halfW / 2
      const cy = H / 2
      const R = Math.min(halfW * 0.38, H * 0.38)

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      const theta = thetaRef.current
      const sinT = Math.sin(theta)
      const cosT = Math.cos(theta)
      const sin2T = Math.sin(2 * theta)
      const cos2T = Math.cos(2 * theta)

      // ── LEFT PANEL ──────────────────────────────────────────────
      svg.append('rect').attr('x', 2).attr('y', 2)
        .attr('width', halfW - 2).attr('height', H - 4)
        .attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      // Unit circle
      svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', R)
        .attr('fill', 'none').attr('stroke', C.circle).attr('stroke-width', 1.5)

      // Axes
      svg.append('line').attr('x1', cx - R - 10).attr('y1', cy).attr('x2', cx + R + 10).attr('y2', cy).attr('stroke', C.axis).attr('stroke-width', 1)
      svg.append('line').attr('x1', cx).attr('y1', cy - R - 10).attr('x2', cx).attr('y2', cy + R + 10).attr('stroke', C.axis).attr('stroke-width', 1)

      const px = cx + R * cosT, py = cy - R * sinT
      const p2x = cx + R * cos2T, p2y = cy - R * sin2T

      // Arc for θ
      const arc1 = d3.arc()({ innerRadius: R * 0.22, outerRadius: R * 0.22, startAngle: 0, endAngle: -theta })
      svg.append('path').attr('d', arc1).attr('transform', `translate(${cx},${cy})`).attr('fill', 'none').attr('stroke', C.theta).attr('stroke-width', 2)
      svg.append('text').attr('x', cx + R * 0.28).attr('y', cy - R * 0.08).attr('fill', C.theta).attr('font-size', 13).attr('font-weight', 'bold').text('θ')

      // Arc for 2θ
      const arc2 = d3.arc()({ innerRadius: R * 0.15, outerRadius: R * 0.15, startAngle: 0, endAngle: -2 * theta })
      svg.append('path').attr('d', arc2).attr('transform', `translate(${cx},${cy})`).attr('fill', 'none').attr('stroke', C.double).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
      svg.append('text').attr('x', cx + R * 0.16).attr('y', cy - R * 0.22).attr('fill', C.double).attr('font-size', 11).text('2θ')

      // Radius to P(θ)
      svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', px).attr('y2', py).attr('stroke', C.theta).attr('stroke-width', 2)
      // Radius to P(2θ)
      svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', p2x).attr('y2', p2y).attr('stroke', C.double).attr('stroke-width', 2)

      // sin(θ) vertical drop from P
      svg.append('line').attr('x1', px).attr('y1', cy).attr('x2', px).attr('y2', py).attr('stroke', C.sin).attr('stroke-width', 2).attr('stroke-dasharray', '5,3')
      // cos(θ) horizontal
      svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', px).attr('y2', cy).attr('stroke', C.cos).attr('stroke-width', 2).attr('stroke-dasharray', '5,3')

      // sin(2θ) vertical from P(2θ)
      svg.append('line').attr('x1', p2x).attr('y1', cy).attr('x2', p2x).attr('y2', p2y).attr('stroke', C.double).attr('stroke-width', 1.5).attr('stroke-dasharray', '3,3').attr('opacity', 0.7)

      // Right angle marker at P projected to x-axis
      const sqSz = 6
      svg.append('rect').attr('x', px - sqSz).attr('y', cy - sqSz).attr('width', sqSz).attr('height', sqSz).attr('fill', 'none').attr('stroke', C.muted).attr('stroke-width', 1)

      // Points
      svg.append('circle').attr('cx', px).attr('cy', py).attr('r', 6).attr('fill', C.theta).attr('stroke', C.bg).attr('stroke-width', 2).attr('cursor', 'grab')
        .call(d3.drag().on('drag', (event) => {
          const dx = event.x - cx, dy = -(event.y - cy)
          thetaRef.current = Math.max(0.05, Math.min(Math.PI * 0.99, Math.atan2(dy, dx)))
          draw()
        }))
      svg.append('circle').attr('cx', p2x).attr('cy', p2y).attr('r', 5).attr('fill', C.double).attr('stroke', C.bg).attr('stroke-width', 2)

      // Labels
      svg.append('text').attr('x', px + 7).attr('y', py - 7).attr('fill', C.theta).attr('font-size', 11).attr('font-weight', 'bold').text(`P(θ)`)
      svg.append('text').attr('x', p2x + 7).attr('y', p2y - 7).attr('fill', C.double).attr('font-size', 11).attr('font-weight', 'bold').text(`P(2θ)`)

      const midCos = (cx + px) / 2
      svg.append('text').attr('x', midCos).attr('y', cy + 14).attr('text-anchor', 'middle').attr('fill', C.cos).attr('font-size', 11).attr('font-weight', 'bold').text('cosθ')
      svg.append('text').attr('x', px + 8).attr('y', (cy + py) / 2).attr('fill', C.sin).attr('font-size', 11).attr('font-weight', 'bold').text('sinθ')

      svg.append('text').attr('x', halfW / 2).attr('y', H - 10).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text('Drag blue point to change θ')

      // ── RIGHT PANEL ──────────────────────────────────────────────
      const rx = halfW + 8
      svg.append('rect').attr('x', rx).attr('y', 2).attr('width', halfW - 2).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      const mid = rx + halfW / 2
      const fs = Math.min(halfW * 0.08, 13)

      const rows = [
        { label: 'θ', val: (theta * 180 / Math.PI).toFixed(1) + '°', col: C.theta },
        { label: 'sin θ', val: sinT.toFixed(3), col: C.sin },
        { label: 'cos θ', val: cosT.toFixed(3), col: C.cos },
        { label: 'sin 2θ', val: sin2T.toFixed(3), col: C.double },
        { label: '2 sin θ cos θ', val: (2 * sinT * cosT).toFixed(3), col: C.hyp },
      ]

      svg.append('text').attr('x', mid).attr('y', 28).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', fs * 0.9).text('live values')

      rows.forEach(({ label, val, col }, i) => {
        const y = 52 + i * 38
        svg.append('text').attr('x', rx + 16).attr('y', y).attr('fill', C.muted).attr('font-size', fs).text(label)
        svg.append('text').attr('x', rx + halfW - 16).attr('y', y).attr('text-anchor', 'end').attr('fill', col).attr('font-size', fs).attr('font-weight', 'bold').text(val)
        if (i < rows.length - 1) {
          svg.append('line').attr('x1', rx + 12).attr('y1', y + 10).attr('x2', rx + halfW - 12).attr('y2', y + 10).attr('stroke', C.border).attr('stroke-width', 0.5)
        }
      })

      // Check equality
      const match = Math.abs(sin2T - 2 * sinT * cosT) < 0.001
      svg.append('rect').attr('x', rx + 12).attr('y', H - 56).attr('width', halfW - 24).attr('height', 36).attr('rx', 6).attr('fill', match ? (isDark ? '#1a3a2a' : '#dcfce7') : (isDark ? '#3d1a1a' : '#fef2f2')).attr('stroke', match ? C.cos : C.sin).attr('stroke-width', 1)
      svg.append('text').attr('x', mid).attr('y', H - 44).attr('text-anchor', 'middle').attr('fill', match ? C.cos : C.sin).attr('font-size', 12).attr('font-weight', 'bold').text('sin 2θ = 2 sin θ cos θ')
      svg.append('text').attr('x', mid).attr('y', H - 28).attr('text-anchor', 'middle').attr('fill', match ? C.cos : C.sin).attr('font-size', 11).text(match ? '✓ verified for this θ' : 'checking...')
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [params.currentStep])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
    </div>
  )
}
