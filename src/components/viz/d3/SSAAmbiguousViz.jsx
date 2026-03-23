import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * SSAAmbiguousViz
 * Shows the ambiguous SSA case interactively.
 * Fixed angle A and side b. Drag side a to see 0, 1, or 2 triangles.
 */
export default function SSAAmbiguousViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [aLen, setALen] = useState(70)

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg: isDark ? '#0f172a' : '#f8fafc', panel: isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '#334155' : '#e2e8f0', text: isDark ? '#e2e8f0' : '#1e293b',
        muted: isDark ? '#64748b' : '#94a3b8', axis: isDark ? '#475569' : '#94a3b8',
        t1: isDark ? '#38bdf8' : '#0284c7', t2: isDark ? '#f472b6' : '#db2777',
        h: isDark ? '#34d399' : '#059669', a: isDark ? '#fbbf24' : '#d97706',
        b: isDark ? '#a78bfa' : '#7c3aed',
      }

      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.55)
      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      const angleA = 35 * Math.PI / 180
      const bLen = 100
      const h = bLen * Math.sin(angleA)
      const scale = (W * 0.72) / 150
      const ox = W * 0.1, oy = H * 0.78

      const Bx = ox, By = oy
      const adjB = bLen * Math.cos(angleA)
      const Ax = ox + adjB * scale, Ay = oy - bLen * Math.sin(angleA) * scale

      // Base ray
      svg.append('line').attr('x1', ox).attr('y1', oy).attr('x2', ox + 150 * scale).attr('y2', oy).attr('stroke', C.axis).attr('stroke-width', 1)

      // Side b from B to A
      svg.append('line').attr('x1', Bx).attr('y1', By).attr('x2', Ax).attr('y2', Ay).attr('stroke', C.b).attr('stroke-width', 2)
      svg.append('text').attr('x', (Bx+Ax)/2 - 8).attr('y', (By+Ay)/2).attr('fill', C.b).attr('font-size', 11).attr('font-weight', 'bold').text(`b=${bLen}`)

      // Angle A at B
      svg.append('text').attr('x', Bx + 22).attr('y', By - 8).attr('fill', C.muted).attr('font-size', 11).text(`A=35°`)

      // Height h from A perpendicular to base
      svg.append('line').attr('x1', Ax).attr('y1', Ay).attr('x2', Ax).attr('y2', oy).attr('stroke', C.h).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
      svg.append('text').attr('x', Ax + 5).attr('y', (Ay + oy) / 2).attr('fill', C.h).attr('font-size', 11).attr('font-weight', 'bold').text(`h=${h.toFixed(1)}`)

      // Circle of radius a centered at A
      const aScaled = aLen * scale
      svg.append('circle').attr('cx', Ax).attr('cy', Ay).attr('r', aScaled).attr('fill', 'none').attr('stroke', C.a).attr('stroke-width', 1).attr('stroke-dasharray', '5,3').attr('opacity', 0.6)
      svg.append('text').attr('x', Ax + aScaled * 0.7 + 5).attr('y', Ay).attr('fill', C.a).attr('font-size', 11).attr('font-weight', 'bold').text(`a=${aLen}`)

      // Find intersections with base line (y = oy)
      const dy = oy - Ay
      const disc = aScaled * aScaled - dy * dy
      const intersections = []
      if (disc >= 0) {
        const dx = Math.sqrt(disc)
        intersections.push(Ax + dx)
        if (dx > 1) intersections.push(Ax - dx)
      }

      const validIntersections = intersections.filter(ix => ix > ox + 5)
      const tris = validIntersections.length

      // Draw triangles
      const triCols = [C.t1, C.t2]
      validIntersections.forEach((Cx, i) => {
        svg.append('polygon').attr('points', `${Bx},${By} ${Ax},${Ay} ${Cx},${oy}`).attr('fill', 'none').attr('stroke', triCols[i]).attr('stroke-width', 2)
        svg.append('circle').attr('cx', Cx).attr('cy', oy).attr('r', 5).attr('fill', triCols[i]).attr('stroke', C.bg).attr('stroke-width', 2)
        svg.append('text').attr('x', Cx).attr('y', oy + 14).attr('text-anchor', 'middle').attr('fill', triCols[i]).attr('font-size', 10).text(`C${tris > 1 ? i+1 : ''}`)
      })

      // Status
      const statusText = tris === 0 ? 'a < h — no triangle exists (side too short)' : tris === 1 ? aLen === Math.round(h) ? 'a = h — exactly one right triangle' : 'one triangle' : 'two triangles (ambiguous case!)'
      const statusCol = tris === 0 ? '#ef4444' : tris === 2 ? C.a : C.h
      svg.append('rect').attr('x', W * 0.05).attr('y', 10).attr('width', W * 0.9).attr('height', 28).attr('rx', 6).attr('fill', tris === 2 ? (isDark?'#3d2a0a':'#fef9c3') : tris === 0 ? (isDark?'#3d1a1a':'#fef2f2') : (isDark?'#1a3a2a':'#dcfce7')).attr('stroke', statusCol).attr('stroke-width', 1)
      svg.append('text').attr('x', W / 2).attr('y', 28).attr('text-anchor', 'middle').attr('fill', statusCol).attr('font-size', 12).attr('font-weight', 'bold').text(statusText)

      svg.append('text').attr('x', W / 2).attr('y', H - 4).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(`h = b·sin A = ${bLen}·sin 35° ≈ ${h.toFixed(1)} — the critical threshold`)
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [aLen, params.currentStep])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px 0' }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fbbf24', minWidth: 56 }}>a = {aLen}</span>
        <input type="range" min={20} max={140} step={1} value={aLen} onChange={e => setALen(parseInt(e.target.value))} style={{ flex: 1, accentColor: '#fbbf24' }} />
        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>drag to change</span>
      </div>
    </div>
  )
}
