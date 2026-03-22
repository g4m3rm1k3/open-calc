import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

/**
 * AngleMeasurementViz
 * Draggable angle on a circle showing degrees, radians, and arc length simultaneously.
 * Left: the angle with arc highlighted. Right: live value panel.
 * Dark mode. ResizeObserver.
 */
export default function AngleMeasurementViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const thetaRef = useRef(Math.PI / 3)

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:     isDark ? '#0f172a' : '#f8fafc',
        panel:  isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '#334155' : '#e2e8f0',
        axis:   isDark ? '#475569' : '#94a3b8',
        text:   isDark ? '#e2e8f0' : '#1e293b',
        muted:  isDark ? '#64748b' : '#94a3b8',
        circle: isDark ? '#334155' : '#e2e8f0',
        arc:    isDark ? '#38bdf8' : '#0284c7',
        arcFill:isDark ? 'rgba(56,189,248,0.15)' : 'rgba(2,132,199,0.08)',
        ray:    isDark ? '#fbbf24' : '#d97706',
        deg:    isDark ? '#f472b6' : '#db2777',
        rad:    isDark ? '#34d399' : '#059669',
        arc2:   isDark ? '#a78bfa' : '#7c3aed',
      }

      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.62)
      const leftW = Math.round(W * 0.56)
      const cx = leftW / 2, cy = H / 2
      const R = Math.min(leftW * 0.38, H * 0.38)

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      const theta = thetaRef.current

      // Left panel
      svg.append('rect').attr('x', 2).attr('y', 2).attr('width', leftW - 4).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      // Full circle faint
      svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', R).attr('fill', 'none').attr('stroke', C.circle).attr('stroke-width', 1.5)

      // Arc fill sector
      const arcPath = d3.arc()({ innerRadius: 0, outerRadius: R, startAngle: -theta, endAngle: 0 })
      svg.append('path').attr('d', arcPath).attr('transform', `translate(${cx},${cy}) rotate(0)`).attr('fill', C.arcFill)

      // Arc stroke
      const arcStroke = d3.arc()({ innerRadius: R, outerRadius: R, startAngle: -theta, endAngle: 0 })
      svg.append('path').attr('d', arcStroke).attr('transform', `translate(${cx},${cy})`).attr('fill', 'none').attr('stroke', C.arc).attr('stroke-width', 3)

      // Axes
      svg.append('line').attr('x1', cx - R - 10).attr('y1', cy).attr('x2', cx + R + 10).attr('y2', cy).attr('stroke', C.axis).attr('stroke-width', 1)
      svg.append('line').attr('x1', cx).attr('y1', cy - R - 10).attr('x2', cx).attr('y2', cy + R + 10).attr('stroke', C.axis).attr('stroke-width', 1)

      // Initial ray (positive x-axis)
      svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', cx + R).attr('y2', cy).attr('stroke', C.ray).attr('stroke-width', 2)

      // Terminal ray
      const tx = cx + R * Math.cos(theta), ty = cy - R * Math.sin(theta)
      svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', tx).attr('y2', ty).attr('stroke', C.ray).attr('stroke-width', 2)

      // Angle arc label
      const midT = theta / 2
      svg.append('text').attr('x', cx + R * 0.3 * Math.cos(midT)).attr('y', cy - R * 0.3 * Math.sin(midT)).attr('text-anchor', 'middle').attr('dominant-baseline', 'central').attr('fill', C.arc).attr('font-size', 13).attr('font-weight', 'bold').text('θ')

      // Unit radius label
      svg.append('text').attr('x', cx + R * 0.52).attr('y', cy - 8).attr('fill', C.muted).attr('font-size', 11).text('r = 1')

      // Arc length annotation
      const arcMidX = cx + R * 1.08 * Math.cos(theta / 2)
      const arcMidY = cy - R * 1.08 * Math.sin(theta / 2)
      svg.append('text').attr('x', arcMidX).attr('y', arcMidY).attr('text-anchor', 'middle').attr('dominant-baseline', 'central').attr('fill', C.arc2).attr('font-size', 11).attr('font-weight', 'bold').text(`s = θ`)

      // Draggable terminal point
      svg.append('circle').attr('cx', tx).attr('cy', ty).attr('r', 8).attr('fill', C.ray).attr('stroke', C.bg).attr('stroke-width', 2).attr('cursor', 'grab')
        .call(d3.drag().on('drag', (event) => {
          const dx = event.x - cx, dy = -(event.y - cy)
          let angle = Math.atan2(dy, dx)
          if (angle < 0.05) angle = 0.05
          if (angle > Math.PI * 1.99) angle = Math.PI * 1.99
          thetaRef.current = angle
          draw()
        }))

      svg.append('text').attr('x', leftW / 2).attr('y', H - 10).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text('Drag the gold point to change the angle')

      // Right panel
      const rx = leftW + 8, rw = W - rx - 8
      svg.append('rect').attr('x', rx).attr('y', 2).attr('width', rw).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      const mid = rx + rw / 2
      const deg = theta * 180 / Math.PI
      const fs = Math.min(rw * 0.09, 13)

      svg.append('text').attr('x', mid).attr('y', 28).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', fs * 0.85).text('angle measurement')

      const rows = [
        { label: 'Degrees', val: deg.toFixed(1) + '°', col: C.deg },
        { label: 'Radians', val: theta.toFixed(4), col: C.rad },
        { label: 'Arc length (r=1)', val: theta.toFixed(4), col: C.arc2 },
        { label: 'Arc length (r=5)', val: (5 * theta).toFixed(3), col: C.arc },
      ]

      rows.forEach(({ label, val, col }, i) => {
        const y = 52 + i * 44
        svg.append('text').attr('x', rx + 14).attr('y', y).attr('fill', C.muted).attr('font-size', fs * 0.9).text(label)
        svg.append('text').attr('x', rx + rw - 14).attr('y', y + 16).attr('text-anchor', 'end').attr('fill', col).attr('font-size', fs * 1.2).attr('font-weight', 'bold').text(val)
        if (i < rows.length - 1) svg.append('line').attr('x1', rx + 10).attr('y1', y + 30).attr('x2', rx + rw - 10).attr('y2', y + 30).attr('stroke', C.border).attr('stroke-width', 0.5)
      })

      // Key angles
      const keyAngles = [[30, 'π/6'], [45, 'π/4'], [60, 'π/3'], [90, 'π/2'], [180, 'π']]
      svg.append('text').attr('x', mid).attr('y', H - 70).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', fs * 0.8).text('key conversions')
      keyAngles.forEach(([d, r], i) => {
        const y = H - 56 + i * 12
        svg.append('text').attr('x', mid).attr('y', y).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(`${d}° = ${r}`)
      })
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [params.currentStep])

  return <div ref={containerRef} className="w-full"><svg ref={svgRef} className="w-full" /></div>
}
