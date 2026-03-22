import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

/**
 * CartesianFoundationsViz
 * Click anywhere to place a point and see its coordinates.
 * Shows axes, quadrant labels, grid.
 * Dark mode tokens. ResizeObserver.
 */
export default function CartesianFoundationsViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const pointsRef = useRef([])

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:      isDark ? '#0f172a' : '#f8fafc',
        panel:   isDark ? '#1e293b' : '#ffffff',
        border:  isDark ? '#334155' : '#e2e8f0',
        axis:    isDark ? '#475569' : '#94a3b8',
        grid:    isDark ? '#1e293b' : '#f1f5f9',
        text:    isDark ? '#e2e8f0' : '#1e293b',
        muted:   isDark ? '#64748b' : '#94a3b8',
        point:   isDark ? '#fbbf24' : '#d97706',
        label:   isDark ? '#f472b6' : '#db2777',
        q1:      isDark ? 'rgba(56,189,248,0.06)' : 'rgba(59,130,246,0.04)',
        q2:      isDark ? 'rgba(167,139,250,0.06)' : 'rgba(124,58,237,0.04)',
        q3:      isDark ? 'rgba(248,113,113,0.06)' : 'rgba(220,38,38,0.04)',
        q4:      isDark ? 'rgba(52,211,153,0.06)' : 'rgba(5,150,105,0.04)',
        qlabel:  isDark ? '#475569' : '#cbd5e1',
      }

      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.72)
      const cx = W / 2
      const cy = H / 2
      const range = 6
      const scale = Math.min(cx, cy) * 0.82 / range

      const toSvg = (x, y) => [cx + x * scale, cy - y * scale]
      const toMath = (sx, sy) => [(sx - cx) / scale, (cy - sy) / scale]

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      // Quadrant fills
      ;[
        [0, 0, cx, cy, C.q1, 'QI\n+,+'],
        [-range, 0, cx, cy, C.q2, 'QII\n−,+'],
        [-range, -range, cx, cy, C.q3, 'QIII\n−,−'],
        [0, -range, cx, cy, C.q4, 'QIV\n+,−'],
      ].forEach(([mx, my, w, h, fill, label]) => {
        const [sx, sy] = toSvg(mx, my)
        const [ex, ey] = toSvg(mx + (mx < 0 ? range : range), my + (my < 0 ? range : range))
        const rx = Math.min(sx, ex), ry = Math.min(sy, ey)
        const rw = Math.abs(ex - sx), rh = Math.abs(ey - sy)
        svg.append('rect').attr('x', rx).attr('y', ry).attr('width', rw).attr('height', rh).attr('fill', fill)
        const lx = mx < 0 ? rx + rw * 0.5 : rx + rw * 0.5
        const ly = my < 0 ? ry + rh * 0.25 : ry + rh * 0.25
        label.split('\n').forEach((line, i) => {
          svg.append('text')
            .attr('x', lx).attr('y', ly + i * 14)
            .attr('text-anchor', 'middle').attr('fill', C.qlabel)
            .attr('font-size', 11).attr('font-weight', '500')
            .text(line)
        })
      })

      // Grid lines
      for (let i = -range; i <= range; i++) {
        if (i === 0) continue
        const [lx] = toSvg(i, 0)
        svg.append('line')
          .attr('x1', lx).attr('y1', 0).attr('x2', lx).attr('y2', H)
          .attr('stroke', C.grid).attr('stroke-width', 1)
        const [, ly] = toSvg(0, i)
        svg.append('line')
          .attr('x1', 0).attr('y1', ly).attr('x2', W).attr('y2', ly)
          .attr('stroke', C.grid).attr('stroke-width', 1)
      }

      // Axes
      svg.append('line').attr('x1', 0).attr('y1', cy).attr('x2', W).attr('y2', cy)
        .attr('stroke', C.axis).attr('stroke-width', 2)
      svg.append('line').attr('x1', cx).attr('y1', 0).attr('x2', cx).attr('y2', H)
        .attr('stroke', C.axis).attr('stroke-width', 2)

      // Tick labels
      for (let i = -range; i <= range; i++) {
        if (i === 0) continue
        const [lx] = toSvg(i, 0)
        svg.append('text')
          .attr('x', lx).attr('y', cy + 14)
          .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10)
          .text(i)
        const [, ly] = toSvg(0, i)
        svg.append('text')
          .attr('x', cx - 8).attr('y', ly + 4)
          .attr('text-anchor', 'end').attr('fill', C.muted).attr('font-size', 10)
          .text(i)
      }

      // Axis labels
      svg.append('text').attr('x', W - 12).attr('y', cy - 6)
        .attr('fill', C.text).attr('font-size', 13).attr('font-weight', 'bold').text('x')
      svg.append('text').attr('x', cx + 6).attr('y', 14)
        .attr('fill', C.text).attr('font-size', 13).attr('font-weight', 'bold').text('y')
      svg.append('text').attr('x', cx + 5).attr('y', cy - 5)
        .attr('fill', C.muted).attr('font-size', 11).text('O')

      // Placed points
      pointsRef.current.forEach(([mx, my], i) => {
        const [sx, sy] = toSvg(mx, my)
        svg.append('circle').attr('cx', sx).attr('cy', sy).attr('r', 5)
          .attr('fill', C.point).attr('stroke', C.bg).attr('stroke-width', 2)
        svg.append('text')
          .attr('x', sx + 8).attr('y', sy - 6)
          .attr('fill', C.label).attr('font-size', 11).attr('font-weight', 'bold')
          .text(`(${mx.toFixed(1)}, ${my.toFixed(1)})`)
      })

      // Click handler
      svg.on('click', function (event) {
        const [sx, sy] = d3.pointer(event)
        const [mx, my] = toMath(sx, sy)
        const snapped = [Math.round(mx * 2) / 2, Math.round(my * 2) / 2]
        pointsRef.current = [...pointsRef.current.slice(-4), snapped]
        draw()
      })

      // Hint
      svg.append('text')
        .attr('x', W / 2).attr('y', H - 6)
        .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 11)
        .text('Click anywhere to place a point and see its coordinates')
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [params.currentStep])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" style={{ cursor: 'crosshair' }} />
    </div>
  )
}
