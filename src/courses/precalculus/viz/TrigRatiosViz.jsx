import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * TrigRatiosViz
 * Draggable right triangle. Angle slider. All 6 trig ratios update live.
 * Shows which side is opp/adj/hyp relative to the selected angle.
 * Dark mode. ResizeObserver.
 */
export default function TrigRatiosViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [theta, setTheta] = useState(35)

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:    isDark ? '#0f172a' : '#f8fafc',
        panel: isDark ? '#1e293b' : '#ffffff',
        border:isDark ? '#334155' : '#e2e8f0',
        text:  isDark ? '#e2e8f0' : '#1e293b',
        muted: isDark ? '#64748b' : '#94a3b8',
        opp:   isDark ? '#f472b6' : '#db2777',
        adj:   isDark ? '#34d399' : '#059669',
        hyp:   isDark ? '#38bdf8' : '#0284c7',
        angle: isDark ? '#fbbf24' : '#d97706',
        right: isDark ? '#a78bfa' : '#7c3aed',
      }

      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.62)
      const leftW = Math.round(W * 0.52)

      const rad = theta * Math.PI / 180
      const triW = leftW * 0.55, triH = triW * Math.tan(rad)
      const maxH = H * 0.65
      const scale = triH > maxH ? maxH / triH : 1
      const w = triW * scale, h = triH * scale
      const ox = (leftW - w) / 2 + 10, oy = (H - h) / 2 + h

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      svg.append('rect').attr('x', 2).attr('y', 2).attr('width', leftW - 4).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      const A = [ox, oy]                   // right angle
      const B = [ox + w, oy]               // base end
      const Pt = [ox, oy - h]              // apex (angle theta)

      // Sides
      svg.append('line').attr('x1', Pt[0]).attr('y1', Pt[1]).attr('x2', B[0]).attr('y2', B[1]).attr('stroke', C.hyp).attr('stroke-width', 3)
      svg.append('line').attr('x1', Pt[0]).attr('y1', Pt[1]).attr('x2', A[0]).attr('y2', A[1]).attr('stroke', C.opp).attr('stroke-width', 3)
      svg.append('line').attr('x1', A[0]).attr('y1', A[1]).attr('x2', B[0]).attr('y2', B[1]).attr('stroke', C.adj).attr('stroke-width', 3)

      // Right angle marker
      const sq = 10
      svg.append('rect').attr('x', A[0]).attr('y', A[1] - sq).attr('width', sq).attr('height', sq).attr('fill', 'none').attr('stroke', C.right).attr('stroke-width', 1.5)

      // Angle arc at B
      const arcG = d3.arc()({ innerRadius: 22, outerRadius: 22, startAngle: Math.PI, endAngle: Math.PI + rad })
      svg.append('path').attr('d', arcG).attr('transform', `translate(${B[0]},${B[1]})`).attr('fill', 'none').attr('stroke', C.angle).attr('stroke-width', 2)
      svg.append('text').attr('x', B[0] - 32).attr('y', B[1] - 10).attr('fill', C.angle).attr('font-size', 13).attr('font-weight', 'bold').text(`θ`)

      // Side labels
      const hypMidX = (Pt[0] + B[0]) / 2, hypMidY = (Pt[1] + B[1]) / 2
      const hypLen = Math.sqrt((B[0]-Pt[0])**2 + (B[1]-Pt[1])**2)
      const hyp = 1, adj = Math.cos(rad), opp = Math.sin(rad)
      svg.append('text').attr('x', hypMidX + 12).attr('y', hypMidY).attr('fill', C.hyp).attr('font-size', 12).attr('font-weight', 'bold').text(`hyp = 1`)
      svg.append('text').attr('x', Pt[0] - 14).attr('y', (Pt[1] + A[1]) / 2).attr('text-anchor', 'end').attr('fill', C.opp).attr('font-size', 12).attr('font-weight', 'bold').text(`opp = ${opp.toFixed(3)}`)
      svg.append('text').attr('x', (A[0] + B[0]) / 2).attr('y', A[1] + 16).attr('text-anchor', 'middle').attr('fill', C.adj).attr('font-size', 12).attr('font-weight', 'bold').text(`adj = ${adj.toFixed(3)}`)

      // Right panel - all 6 ratios
      const rx = leftW + 8, rw = W - rx - 8
      svg.append('rect').attr('x', rx).attr('y', 2).attr('width', rw).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      const mid = rx + rw / 2
      const fs = Math.min(rw * 0.08, 12)
      const t = Math.tan(rad)

      svg.append('text').attr('x', mid).attr('y', 22).attr('text-anchor', 'middle').attr('fill', C.angle).attr('font-size', fs * 1.1).attr('font-weight', 'bold').text(`θ = ${theta}°`)

      const ratios = [
        { name: 'sin θ', formula: 'opp/hyp', val: opp, col: C.opp },
        { name: 'cos θ', formula: 'adj/hyp', val: adj, col: C.adj },
        { name: 'tan θ', formula: 'opp/adj', val: t, col: C.angle },
        { name: 'csc θ', formula: 'hyp/opp', val: 1/opp, col: C.opp },
        { name: 'sec θ', formula: 'hyp/adj', val: 1/adj, col: C.adj },
        { name: 'cot θ', formula: 'adj/opp', val: 1/t, col: C.angle },
      ]

      ratios.forEach(({ name, formula, val, col }, i) => {
        const y = 40 + i * ((H - 50) / 6)
        svg.append('text').attr('x', rx + 12).attr('y', y).attr('fill', col).attr('font-size', fs * 1.05).attr('font-weight', 'bold').text(name)
        svg.append('text').attr('x', rx + 12).attr('y', y + 14).attr('fill', C.muted).attr('font-size', fs * 0.85).text(formula)
        svg.append('text').attr('x', rx + rw - 12).attr('y', y + 7).attr('text-anchor', 'end').attr('fill', col).attr('font-size', fs * 1.1).attr('font-weight', 'bold').text(isFinite(val) ? val.toFixed(4) : '∞')
        if (i < 5) svg.append('line').attr('x1', rx + 8).attr('y1', y + 24).attr('x2', rx + rw - 8).attr('y2', y + 24).attr('stroke', C.border).attr('stroke-width', 0.5)
      })
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [theta, params.currentStep])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px 0' }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fbbf24', minWidth: 48 }}>θ = {theta}°</span>
        <input type="range" min={5} max={85} step={1} value={theta} onChange={e => setTheta(parseInt(e.target.value))} style={{ flex: 1, accentColor: '#fbbf24' }} />
        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>drag or use slider</span>
      </div>
    </div>
  )
}
