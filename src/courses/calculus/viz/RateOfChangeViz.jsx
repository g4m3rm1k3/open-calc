import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * RateOfChangeViz
 * Shows a curve f(x) = x² + 1 (default) with a draggable secant line.
 * Left panel: the curve with secant line and both points marked.
 * Right panel: live slope readout (AROC) and the difference quotient expression.
 * As the second point approaches the first, the slope approaches f'(x).
 * Dark mode. ResizeObserver.
 */
export default function RateOfChangeViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [x1, setX1] = useState(1)
  const [x2, setX2] = useState(2.5)

  const f = x => x * x + 1
  const fPrime = x => 2 * x

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
        curve:   isDark ? '#38bdf8' : '#0284c7',
        secant:  isDark ? '#f472b6' : '#db2777',
        tangent: isDark ? '#34d399' : '#059669',
        p1:      isDark ? '#fbbf24' : '#d97706',
        p2:      isDark ? '#f472b6' : '#db2777',
        h:       isDark ? '#a78bfa' : '#7c3aed',
      }

      const W = containerRef.current?.clientWidth || 540
      const H = Math.round(W * 0.58)
      const leftW = Math.round(W * 0.58)
      const pad = { t: 24, b: 24, l: 36, r: 8 }
      const iW = leftW - pad.l - pad.r
      const iH = H - pad.t - pad.b

      const xDom = [-0.5, 3.5], yDom = [0, 14]
      const xS = d3.scaleLinear().domain(xDom).range([pad.l, pad.l + iW])
      const yS = d3.scaleLinear().domain(yDom).range([pad.t + iH, pad.t])

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      // Left panel
      svg.append('rect').attr('x', 2).attr('y', 2).attr('width', leftW - 4).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      // Grid
      for (let v = 0; v <= 14; v += 2) {
        svg.append('line').attr('x1', pad.l).attr('y1', yS(v)).attr('x2', pad.l + iW).attr('y2', yS(v)).attr('stroke', C.grid).attr('stroke-width', 1)
      }

      // Axes
      svg.append('line').attr('x1', pad.l).attr('y1', yS(0)).attr('x2', pad.l + iW).attr('y2', yS(0)).attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', xS(0)).attr('y1', pad.t).attr('x2', xS(0)).attr('y2', pad.t + iH).attr('stroke', C.axis).attr('stroke-width', 1.5)

      // Axis labels
      for (let v = 0; v <= 3; v++) {
        svg.append('text').attr('x', xS(v)).attr('y', yS(0) + 14).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(v)
      }

      // Curve f(x) = x² + 1
      const curveData = d3.range(xDom[0], xDom[1], 0.04).map(x => [x, f(x)])
      const line = d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom)
      svg.append('path').datum(curveData).attr('fill', 'none').attr('stroke', C.curve).attr('stroke-width', 2.5).attr('d', line)
      svg.append('text').attr('x', xS(3.2)).attr('y', yS(f(3.2)) - 8).attr('fill', C.curve).attr('font-size', 11).attr('font-weight', 'bold').text('f(x) = x²+1')

      // Tangent line at x1
      const slope_tangent = fPrime(x1)
      const tX0 = xDom[0], tX1 = xDom[1]
      const tY0 = f(x1) + slope_tangent * (tX0 - x1)
      const tY1 = f(x1) + slope_tangent * (tX1 - x1)
      svg.append('line').attr('x1', xS(tX0)).attr('y1', yS(tY0)).attr('x2', xS(tX1)).attr('y2', yS(tY1)).attr('stroke', C.tangent).attr('stroke-width', 1.5).attr('stroke-dasharray', '6,4').attr('opacity', 0.7)

      // Secant line
      const slope = (f(x2) - f(x1)) / (x2 - x1)
      const sY0 = f(x1) + slope * (tX0 - x1)
      const sY1 = f(x1) + slope * (tX1 - x1)
      svg.append('line').attr('x1', xS(tX0)).attr('y1', yS(sY0)).attr('x2', xS(tX1)).attr('y2', yS(sY1)).attr('stroke', C.secant).attr('stroke-width', 2)

      // Vertical h arrow
      if (Math.abs(x2 - x1) > 0.1) {
        const midX = (x1 + x2) / 2
        svg.append('line').attr('x1', xS(x1)).attr('y1', yS(f(x1)) - 6).attr('x2', xS(x2)).attr('y2', yS(f(x1)) - 6).attr('stroke', C.h).attr('stroke-width', 1.5)
        svg.append('text').attr('x', xS(midX)).attr('y', yS(f(x1)) - 12).attr('text-anchor', 'middle').attr('fill', C.h).attr('font-size', 10).attr('font-weight', 'bold').text('h')
      }

      // Points
      const handleDrag = (which) => d3.drag().on('drag', (event) => {
        const xVal = Math.max(xDom[0] + 0.05, Math.min(xDom[1] - 0.05, xS.invert(event.x)))
        if (which === 1) setX1(+xVal.toFixed(3))
        else setX2(+xVal.toFixed(3))
      })

      svg.append('circle').attr('cx', xS(x1)).attr('cy', yS(f(x1))).attr('r', 7).attr('fill', C.p1).attr('stroke', C.bg).attr('stroke-width', 2).attr('cursor', 'ew-resize').call(handleDrag(1))
      svg.append('circle').attr('cx', xS(x2)).attr('cy', yS(f(x2))).attr('r', 7).attr('fill', C.p2).attr('stroke', C.bg).attr('stroke-width', 2).attr('cursor', 'ew-resize').call(handleDrag(2))

      svg.append('text').attr('x', xS(x1) - 10).attr('y', yS(f(x1)) - 10).attr('fill', C.p1).attr('font-size', 11).attr('font-weight', 'bold').text('P₁')
      svg.append('text').attr('x', xS(x2) + 6).attr('y', yS(f(x2)) - 10).attr('fill', C.p2).attr('font-size', 11).attr('font-weight', 'bold').text('P₂')

      svg.append('text').attr('x', leftW / 2).attr('y', H - 6).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text('Drag P₂ toward P₁ — secant approaches tangent (dashed green)')

      // Right panel
      const rx = leftW + 8, rw = W - rx - 8
      svg.append('rect').attr('x', rx).attr('y', 2).attr('width', rw).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      const mid = rx + rw / 2
      const h = x2 - x1
      const fs = Math.min(rw * 0.085, 12)

      const rows = [
        { label: 'x₁', val: x1.toFixed(3), col: C.p1 },
        { label: 'x₂', val: x2.toFixed(3), col: C.p2 },
        { label: 'h = x₂ − x₁', val: h.toFixed(3), col: C.h },
        { label: 'f(x₁)', val: f(x1).toFixed(3), col: C.p1 },
        { label: 'f(x₂)', val: f(x2).toFixed(3), col: C.p2 },
        { label: 'AROC (secant slope)', val: slope.toFixed(4), col: C.secant },
        { label: "f'(x₁) (tangent slope)", val: fPrime(x1).toFixed(4), col: C.tangent },
      ]

      svg.append('text').attr('x', mid).attr('y', 20).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', fs * 0.9).text('live values')

      rows.forEach(({ label, val, col }, i) => {
        const y = 34 + i * ((H - 44) / rows.length)
        svg.append('text').attr('x', rx + 10).attr('y', y + 8).attr('fill', C.muted).attr('font-size', fs * 0.9).text(label)
        svg.append('text').attr('x', rx + rw - 10).attr('y', y + 8).attr('text-anchor', 'end').attr('fill', col).attr('font-size', fs * 1.05).attr('font-weight', 'bold').text(val)
        if (i < rows.length - 1) svg.append('line').attr('x1', rx + 8).attr('y1', y + 16).attr('x2', rx + rw - 8).attr('y2', y + 16).attr('stroke', C.border).attr('stroke-width', 0.5)
      })

      // Convergence indicator
      const diff = Math.abs(slope - fPrime(x1))
      const converging = diff < 0.1
      svg.append('rect').attr('x', rx + 8).attr('y', H - 42).attr('width', rw - 16).attr('height', 32).attr('rx', 6)
        .attr('fill', converging ? (isDark ? '#1a3a2a' : '#dcfce7') : (isDark ? '#3d2a0a' : '#fef9c3'))
        .attr('stroke', converging ? C.tangent : C.h).attr('stroke-width', 1)
      svg.append('text').attr('x', mid).attr('y', H - 30).attr('text-anchor', 'middle').attr('fill', converging ? C.tangent : C.h).attr('font-size', 11).attr('font-weight', 'bold')
        .text(converging ? 'AROC ≈ f\'(x₁) ✓' : `difference: ${diff.toFixed(3)}`)
      svg.append('text').attr('x', mid).attr('y', H - 16).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10)
        .text(converging ? 'secant has converged to tangent' : 'drag P₂ closer to P₁')
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [x1, x2, params.currentStep])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '6px 0 0', textAlign: 'center' }}>
        Gold point (P₁) = fixed base point · Pink point (P₂) = draggable · Green dashed = tangent line at P₁
      </p>
    </div>
  )
}
