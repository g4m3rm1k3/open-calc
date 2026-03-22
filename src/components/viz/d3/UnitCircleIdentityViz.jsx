import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

/**
 * UnitCircleIdentityViz
 * Interactive unit circle. Drag the angle point to see sin, cos, and
 * sin²+cos²=1 update in real time. Syncs with params.currentStep.
 *
 * Dark mode: color tokens, no hardcoded colors.
 * Layout: ResizeObserver-driven.
 */
export default function UnitCircleIdentityViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const angleRef = useRef(Math.PI / 4)

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:       isDark ? '#0f172a' : '#f8fafc',
        surface:  isDark ? '#1e293b' : '#ffffff',
        axis:     isDark ? '#334155' : '#cbd5e1',
        text:     isDark ? '#e2e8f0' : '#1e293b',
        muted:    isDark ? '#64748b' : '#94a3b8',
        circle:   isDark ? '#3b82f6' : '#2563eb',
        sinColor: isDark ? '#f472b6' : '#db2777',
        cosColor: isDark ? '#34d399' : '#059669',
        point:    isDark ? '#fbbf24' : '#d97706',
        identity: isDark ? '#a78bfa' : '#7c3aed',
        grid:     isDark ? '#1e293b' : '#f1f5f9',
      }

      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.72)
      const cx = W * 0.42
      const cy = H / 2
      const R = Math.min(W * 0.32, H * 0.40)

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      const theta = angleRef.current
      const cosT = Math.cos(theta)
      const sinT = Math.sin(theta)
      const px = cx + R * cosT
      const py = cy - R * sinT

      // Grid circle
      svg.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', R)
        .attr('fill', 'none').attr('stroke', C.circle).attr('stroke-width', 2)

      // Axes
      ;[[-R - 16, 0, R + 16, 0], [0, -R - 16, 0, R + 16]].forEach(([x1, y1, x2, y2]) => {
        svg.append('line')
          .attr('x1', cx + x1).attr('y1', cy + y1)
          .attr('x2', cx + x2).attr('y2', cy + y2)
          .attr('stroke', C.axis).attr('stroke-width', 1)
      })

      // cos projection (horizontal leg)
      svg.append('line')
        .attr('x1', cx).attr('y1', cy)
        .attr('x2', cx + R * cosT).attr('y2', cy)
        .attr('stroke', C.cosColor).attr('stroke-width', 3).attr('stroke-dasharray', '5,3')

      // sin projection (vertical leg)
      svg.append('line')
        .attr('x1', cx + R * cosT).attr('y1', cy)
        .attr('x2', cx + R * cosT).attr('y2', cy - R * sinT)
        .attr('stroke', C.sinColor).attr('stroke-width', 3).attr('stroke-dasharray', '5,3')

      // Hypotenuse (radius to point)
      svg.append('line')
        .attr('x1', cx).attr('y1', cy)
        .attr('x2', px).attr('y2', py)
        .attr('stroke', C.point).attr('stroke-width', 2.5)

      // Arc for angle θ
      const arcPath = d3.arc()({
        innerRadius: R * 0.18, outerRadius: R * 0.18,
        startAngle: 0, endAngle: -theta,
      })
      svg.append('path')
        .attr('d', arcPath)
        .attr('transform', `translate(${cx},${cy})`)
        .attr('fill', 'none').attr('stroke', C.muted).attr('stroke-width', 1.5)

      svg.append('text')
        .attr('x', cx + R * 0.25).attr('y', cy - R * 0.07)
        .attr('fill', C.muted).attr('font-size', R * 0.13)
        .text('θ')

      // Draggable point
      svg.append('circle')
        .attr('cx', px).attr('cy', py).attr('r', 9)
        .attr('fill', C.point).attr('stroke', C.bg).attr('stroke-width', 2.5)
        .attr('cursor', 'grab')
        .call(d3.drag()
          .on('drag', (event) => {
            const dx = event.x - cx
            const dy = -(event.y - cy)
            angleRef.current = Math.atan2(dy, dx)
            draw()
          })
        )

      // Labels on projections
      const midCosX = cx + R * cosT / 2
      svg.append('text')
        .attr('x', midCosX).attr('y', cy + R * 0.12)
        .attr('text-anchor', 'middle').attr('fill', C.cosColor)
        .attr('font-size', R * 0.13).attr('font-weight', 'bold')
        .text(`cos θ = ${cosT.toFixed(3)}`)

      svg.append('text')
        .attr('x', cx + R * cosT + R * 0.13).attr('y', cy - R * sinT / 2)
        .attr('text-anchor', 'start').attr('fill', C.sinColor)
        .attr('font-size', R * 0.13).attr('font-weight', 'bold')
        .text(`sin θ = ${sinT.toFixed(3)}`)

      // Right panel: identity display
      const panelX = cx + R + 28
      const panelW = W - panelX - 10
      if (panelW > 80) {
        svg.append('rect')
          .attr('x', panelX).attr('y', H * 0.12)
          .attr('width', panelW).attr('height', H * 0.76)
          .attr('rx', 8).attr('fill', C.surface).attr('stroke', C.axis).attr('stroke-width', 1)

        const mid = panelX + panelW / 2
        const fs = Math.min(R * 0.135, 13)

        svg.append('text')
          .attr('x', mid).attr('y', H * 0.24)
          .attr('text-anchor', 'middle').attr('fill', C.text)
          .attr('font-size', fs * 1.05).attr('font-weight', '600')
          .text('Identity check')

        const sin2 = (sinT * sinT).toFixed(4)
        const cos2 = (cosT * cosT).toFixed(4)
        const sum = (sinT * sinT + cosT * cosT).toFixed(4)

        ;[
          { label: 'sin²θ', val: sin2, color: C.sinColor },
          { label: 'cos²θ', val: cos2, color: C.cosColor },
          { label: 'sin²θ + cos²θ', val: sum, color: C.identity },
        ].forEach(({ label, val, color }, i) => {
          const y = H * 0.38 + i * H * 0.17
          svg.append('text')
            .attr('x', mid).attr('y', y)
            .attr('text-anchor', 'middle').attr('fill', C.muted)
            .attr('font-size', fs * 0.9)
            .text(label)
          svg.append('text')
            .attr('x', mid).attr('y', y + fs * 1.5)
            .attr('text-anchor', 'middle').attr('fill', color)
            .attr('font-size', fs * 1.4).attr('font-weight', 'bold')
            .text(val)
        })

        svg.append('text')
          .attr('x', mid).attr('y', H * 0.88)
          .attr('text-anchor', 'middle').attr('fill', C.muted)
          .attr('font-size', fs * 0.82)
          .text('Always exactly 1 →')

        svg.append('text')
          .attr('x', mid).attr('y', H * 0.88 + fs * 1.3)
          .attr('text-anchor', 'middle').attr('fill', C.identity)
          .attr('font-size', fs * 0.82)
          .text('Pythagorean Theorem')
      }

      // Drag hint
      svg.append('text')
        .attr('x', W / 2).attr('y', H - 6)
        .attr('text-anchor', 'middle').attr('fill', C.muted)
        .attr('font-size', 11)
        .text('Drag the point around the circle')
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
