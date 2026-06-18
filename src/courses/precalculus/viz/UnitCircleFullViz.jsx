import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

/**
 * UnitCircleFullViz
 * Shows all 6 trig functions as actual geometric lengths on/around the unit circle.
 * Sin = vertical coordinate, Cos = horizontal, Tan = tangent line segment,
 * Sec = distance from origin to tangent point, etc.
 * Draggable angle. Dark mode. ResizeObserver.
 */
export default function UnitCircleFullViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const thetaRef = useRef(Math.PI / 4)

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:    isDark ? '#0f172a' : '#f8fafc',
        panel: isDark ? '#1e293b' : '#ffffff',
        border:isDark ? '#334155' : '#e2e8f0',
        axis:  isDark ? '#475569' : '#94a3b8',
        text:  isDark ? '#e2e8f0' : '#1e293b',
        muted: isDark ? '#64748b' : '#94a3b8',
        sin:   isDark ? '#f472b6' : '#db2777',
        cos:   isDark ? '#34d399' : '#059669',
        tan:   isDark ? '#fbbf24' : '#d97706',
        sec:   isDark ? '#38bdf8' : '#0284c7',
        csc:   isDark ? '#a78bfa' : '#7c3aed',
        cot:   isDark ? '#fb923c' : '#ea580c',
        circ:  isDark ? '#334155' : '#e2e8f0',
      }

      const W = containerRef.current?.clientWidth || 560
      const H = Math.round(W * 0.68)
      const leftW = Math.round(W * 0.58)
      const cx = leftW / 2, cy = H / 2
      const R = Math.min(leftW * 0.36, H * 0.36)

      const theta = thetaRef.current
      const s = Math.sin(theta), co = Math.cos(theta)
      const t = Math.abs(co) > 0.05 ? s / co : null
      const se = Math.abs(co) > 0.05 ? 1 / co : null
      const cs = Math.abs(s) > 0.05 ? 1 / s : null
      const ct = Math.abs(s) > 0.05 ? co / s : null

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      svg.append('rect').attr('x', 2).attr('y', 2).attr('width', leftW - 4).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      // Unit circle + axes
      svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', R).attr('fill', 'none').attr('stroke', C.circ).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', cx - R - 12).attr('y1', cy).attr('x2', cx + R + 20).attr('y2', cy).attr('stroke', C.axis).attr('stroke-width', 1)
      svg.append('line').attr('x1', cx).attr('y1', cy - R - 12).attr('x2', cx).attr('y2', cy + R + 12).attr('stroke', C.axis).attr('stroke-width', 1)

      // Point P on circle
      const px = cx + R * co, py = cy - R * s

      // COS — horizontal from origin to foot
      svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', px).attr('y2', cy).attr('stroke', C.cos).attr('stroke-width', 2.5)
      svg.append('text').attr('x', (cx + px) / 2).attr('y', cy + 14).attr('text-anchor', 'middle').attr('fill', C.cos).attr('font-size', 11).attr('font-weight', 'bold').text('cos')

      // SIN — vertical from foot to P
      svg.append('line').attr('x1', px).attr('y1', cy).attr('x2', px).attr('y2', py).attr('stroke', C.sin).attr('stroke-width', 2.5)
      svg.append('text').attr('x', px + 8).attr('y', (cy + py) / 2).attr('fill', C.sin).attr('font-size', 11).attr('font-weight', 'bold').text('sin')

      // Radius
      svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', px).attr('y2', py).attr('stroke', C.muted).attr('stroke-width', 1.5)

      // TAN — tangent line segment at x=1 (if theta not near 90°)
      if (t !== null && Math.abs(t) < 4) {
        const tanEndY = cy - R * t
        svg.append('line').attr('x1', cx + R).attr('y1', cy).attr('x2', cx + R).attr('y2', tanEndY).attr('stroke', C.tan).attr('stroke-width', 2.5)
        svg.append('text').attr('x', cx + R + 8).attr('y', (cy + tanEndY) / 2).attr('fill', C.tan).attr('font-size', 11).attr('font-weight', 'bold').text('tan')
        // SEC — from origin to tangent endpoint
        svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', cx + R).attr('y2', tanEndY).attr('stroke', C.sec).attr('stroke-width', 1.5).attr('stroke-dasharray', '5,3')
        svg.append('text').attr('x', cx + R * 0.5).attr('y', (cy + tanEndY) / 2 - 8).attr('fill', C.sec).attr('font-size', 10).text('sec')
      }

      // CSC / COT — at y=1 (if theta not near 0°/180°)
      if (cs !== null && Math.abs(cs) < 4 && Math.abs(ct !== null ? ct : 999) < 4) {
        const cotEndX = cx + R * (ct ?? 0)
        const cscY = cy - R
        svg.append('line').attr('x1', cx).attr('y1', cscY).attr('x2', cotEndX).attr('y2', cscY).attr('stroke', C.cot).attr('stroke-width', 2.5)
        svg.append('text').attr('x', (cx + cotEndX) / 2).attr('y', cscY - 6).attr('text-anchor', 'middle').attr('fill', C.cot).attr('font-size', 11).attr('font-weight', 'bold').text('cot')
        svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', cotEndX).attr('y2', cscY).attr('stroke', C.csc).attr('stroke-width', 1.5).attr('stroke-dasharray', '5,3')
        svg.append('text').attr('x', (cx + cotEndX) / 2 - 12).attr('y', (cy + cscY) / 2).attr('fill', C.csc).attr('font-size', 10).text('csc')
      }

      // Draggable point P
      svg.append('circle').attr('cx', px).attr('cy', py).attr('r', 7).attr('fill', C.text).attr('stroke', C.bg).attr('stroke-width', 2).attr('cursor', 'grab')
        .call(d3.drag().on('drag', (event) => {
          const dx = event.x - cx, dy = -(event.y - cy)
          thetaRef.current = Math.atan2(dy, dx)
          draw()
        }))

      svg.append('text').attr('x', leftW / 2).attr('y', H - 8).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text('Drag point P around the circle')

      // Right panel — value table
      const rx = leftW + 8, rw = W - rx - 8
      svg.append('rect').attr('x', rx).attr('y', 2).attr('width', rw).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      const mid = rx + rw / 2
      const fs = Math.min(rw * 0.08, 12)
      const deg = (theta * 180 / Math.PI + 360) % 360

      svg.append('text').attr('x', mid).attr('y', 22).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', fs).text(`θ = ${deg.toFixed(1)}°`)

      const vals = [
        ['sin', s, C.sin], ['cos', co, C.cos], ['tan', t, C.tan],
        ['csc', cs, C.csc], ['sec', se, C.sec], ['cot', ct, C.cot],
      ]
      vals.forEach(([name, val, col], i) => {
        const y = 38 + i * ((H - 48) / 6)
        svg.append('text').attr('x', rx + 12).attr('y', y + 8).attr('fill', col).attr('font-size', fs * 1.05).attr('font-weight', 'bold').text(name + ' θ =')
        const display = val === null ? 'undef' : Math.abs(val) > 99 ? (val > 0 ? '+∞' : '−∞') : val.toFixed(4)
        svg.append('text').attr('x', rx + rw - 12).attr('y', y + 8).attr('text-anchor', 'end').attr('fill', col).attr('font-size', fs * 1.1).attr('font-weight', 'bold').text(display)
        if (i < 5) svg.append('line').attr('x1', rx + 8).attr('y1', y + 18).attr('x2', rx + rw - 8).attr('y2', y + 18).attr('stroke', C.border).attr('stroke-width', 0.5)
      })
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [params.currentStep])

  return <div ref={containerRef} className="w-full"><svg ref={svgRef} className="w-full" /></div>
}
