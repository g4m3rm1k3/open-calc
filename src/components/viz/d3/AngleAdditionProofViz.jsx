import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

/**
 * AngleAdditionProofViz
 * Visual proof of cos(α−β) = cosα cosβ + sinα sinβ
 * using two points on the unit circle and the distance formula.
 * params.currentStep (0-4) drives the proof stages.
 * Dark mode. ResizeObserver.
 */
export default function AngleAdditionProofViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)

  const ALPHA = Math.PI / 3      // 60°
  const BETA  = Math.PI / 6      // 30°

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
        alpha:   isDark ? '#38bdf8' : '#0284c7',
        beta:    isDark ? '#a78bfa' : '#7c3aed',
        chord:   isDark ? '#fbbf24' : '#d97706',
        diff:    isDark ? '#34d399' : '#059669',
        step:    isDark ? '#f97316' : '#ea580c',
      }

      const W = containerRef.current?.clientWidth || 540
      const H = Math.round(W * 0.68)
      const step = Math.min(params.currentStep ?? 0, 4)

      const leftW = Math.round(W * 0.54)
      const cx = leftW / 2, cy = H / 2
      const R = Math.min(leftW * 0.38, H * 0.38)

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      // Left panel
      svg.append('rect').attr('x', 2).attr('y', 2).attr('width', leftW - 2).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      // Unit circle
      svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', R).attr('fill', 'none').attr('stroke', C.circle).attr('stroke-width', 1.5)

      // Axes
      svg.append('line').attr('x1', cx - R - 8).attr('y1', cy).attr('x2', cx + R + 8).attr('y2', cy).attr('stroke', C.axis).attr('stroke-width', 1)
      svg.append('line').attr('x1', cx).attr('y1', cy - R - 8).attr('x2', cx).attr('y2', cy + R + 8).attr('stroke', C.axis).attr('stroke-width', 1)

      const p1x = cx + R * Math.cos(ALPHA), p1y = cy - R * Math.sin(ALPHA)
      const p2x = cx + R * Math.cos(BETA),  p2y = cy - R * Math.sin(BETA)
      const p3x = cx + R, p3y = cy   // (1,0) — for rotated version

      // Arc alpha
      const arcA = d3.arc()({ innerRadius: R * 0.2, outerRadius: R * 0.2, startAngle: 0, endAngle: -ALPHA })
      svg.append('path').attr('d', arcA).attr('transform', `translate(${cx},${cy})`).attr('fill', 'none').attr('stroke', C.alpha).attr('stroke-width', 2)
      svg.append('text').attr('x', cx + R * 0.24).attr('y', cy - R * 0.12).attr('fill', C.alpha).attr('font-size', 12).attr('font-weight', 'bold').text('α')

      // Arc beta
      const arcB = d3.arc()({ innerRadius: R * 0.13, outerRadius: R * 0.13, startAngle: 0, endAngle: -BETA })
      svg.append('path').attr('d', arcB).attr('transform', `translate(${cx},${cy})`).attr('fill', 'none').attr('stroke', C.beta).attr('stroke-width', 2)
      svg.append('text').attr('x', cx + R * 0.15).attr('y', cy - R * 0.05).attr('fill', C.beta).attr('font-size', 12).attr('font-weight', 'bold').text('β')

      // Arc diff
      if (step >= 1) {
        const arcD = d3.arc()({ innerRadius: R * 0.3, outerRadius: R * 0.3, startAngle: -BETA, endAngle: -ALPHA })
        svg.append('path').attr('d', arcD).attr('transform', `translate(${cx},${cy})`).attr('fill', 'none').attr('stroke', C.diff).attr('stroke-width', 2).attr('stroke-dasharray', '4,3')
        svg.append('text').attr('x', cx + R * 0.27).attr('y', cy - R * 0.3).attr('fill', C.diff).attr('font-size', 11).text('α−β')
      }

      // Radii
      svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', p1x).attr('y2', p1y).attr('stroke', C.alpha).attr('stroke-width', 2)
      svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', p2x).attr('y2', p2y).attr('stroke', C.beta).attr('stroke-width', 2)

      // Chord P1P2 — step >= 2
      if (step >= 2) {
        svg.append('line').attr('x1', p1x).attr('y1', p1y).attr('x2', p2x).attr('y2', p2y).attr('stroke', C.chord).attr('stroke-width', 2.5)
        const midChordX = (p1x + p2x) / 2, midChordY = (p1y + p2y) / 2
        const chordLen = Math.sqrt((p1x - p2x) ** 2 + (p1y - p2y) ** 2)
        svg.append('text').attr('x', midChordX + 8).attr('y', midChordY).attr('fill', C.chord).attr('font-size', 11).attr('font-weight', 'bold').text(`|P₁P₂|`)
      }

      // Points
      ;[{ x: p1x, y: p1y, c: C.alpha, label: 'P₁(α)' }, { x: p2x, y: p2y, c: C.beta, label: 'P₂(β)' }].forEach(({ x, y, c, label }) => {
        svg.append('circle').attr('cx', x).attr('cy', y).attr('r', 6).attr('fill', c).attr('stroke', C.bg).attr('stroke-width', 2)
        svg.append('text').attr('x', x + 8).attr('y', y - 7).attr('fill', c).attr('font-size', 11).attr('font-weight', 'bold').text(label)
      })

      svg.append('text').attr('x', leftW / 2).attr('y', H - 10).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(`α = 60°, β = 30°  →  α−β = 30°`)

      // ── RIGHT PANEL — proof steps ──
      const rx = leftW + 8
      const rw = W - rx - 8
      svg.append('rect').attr('x', rx).attr('y', 2).attr('width', rw).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      const mid = rx + rw / 2
      const fs = Math.min(rw * 0.075, 12)

      const proofContent = [
        { title: 'Two points on the unit circle', body: `P₁ = (cosα, sinα)  P₂ = (cosβ, sinβ)`, color: C.text },
        { title: 'Distance formula', body: '|P₁P₂|² = (cosα−cosβ)² + (sinα−sinβ)²', color: C.chord },
        { title: 'Expand & use sin²+cos²=1', body: '= 2 − 2(cosα cosβ + sinα sinβ)', color: C.alpha },
        { title: 'Chord = 2 − 2cos(α−β)', body: 'Chord between points separated by angle (α−β)', color: C.diff },
        { title: 'Equate → result', body: 'cos(α−β) = cosα cosβ + sinα sinβ  ∎', color: C.step },
      ]

      proofContent.forEach(({ title, body, color }, i) => {
        const isActive = i === step
        const y = 28 + i * (H - 36) / 5
        svg.append('rect').attr('x', rx + 8).attr('y', y - 4).attr('width', rw - 16).attr('height', 44).attr('rx', 6)
          .attr('fill', isActive ? (isDark ? '#1e2d3d' : '#e6f1fb') : 'none')
          .attr('stroke', isActive ? C.alpha : 'none').attr('stroke-width', isActive ? 1 : 0)
        svg.append('text').attr('x', rx + 16).attr('y', y + 10).attr('fill', isActive ? C.alpha : C.muted).attr('font-size', fs * 0.88).attr('font-weight', '500').text(title)
        svg.append('text').attr('x', rx + 16).attr('y', y + 28).attr('fill', isActive ? color : C.muted).attr('font-size', fs * 0.95).attr('font-weight', isActive ? 'bold' : 'normal').text(body)
      })
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
