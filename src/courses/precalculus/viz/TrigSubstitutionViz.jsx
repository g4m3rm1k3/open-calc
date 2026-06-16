import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

/**
 * TrigSubstitutionViz
 * Dual-panel visualization matching the app's dark-theme dual-chart style.
 * Left: unit circle showing x = sinθ geometry.
 * Right: the integrand √(1-x²) plotted, with the triangle correspondence highlighted.
 * Slider/drag to change x. currentStep highlights different aspects.
 */
export default function TrigSubstitutionViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const xValRef = useRef(0.6)

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:       isDark ? '#0f172a' : '#f8fafc',
        panel:    isDark ? '#1e293b' : '#ffffff',
        border:   isDark ? '#334155' : '#e2e8f0',
        axis:     isDark ? '#475569' : '#cbd5e1',
        text:     isDark ? '#e2e8f0' : '#1e293b',
        muted:    isDark ? '#64748b' : '#94a3b8',
        circle:   isDark ? '#3b82f6' : '#2563eb',
        curve:    isDark ? '#a78bfa' : '#7c3aed',
        sinColor: isDark ? '#f472b6' : '#db2777',
        cosColor: isDark ? '#34d399' : '#059669',
        xColor:   isDark ? '#fbbf24' : '#d97706',
        fill:     isDark ? 'rgba(167,139,250,0.18)' : 'rgba(124,58,237,0.12)',
        step:     isDark ? '#f97316' : '#ea580c',
      }

      const W = containerRef.current?.clientWidth || 560
      const H = Math.round(W * 0.58)
      const halfW = W / 2 - 6
      const pad = { t: 28, b: 36, l: 36, r: 16 }

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      const xVal = Math.max(-0.98, Math.min(0.98, xValRef.current))
      const theta = Math.asin(xVal)
      const cosT = Math.cos(theta)

      // ──────────────────────────────────────────
      // LEFT PANEL: unit circle
      // ──────────────────────────────────────────
      const lx = halfW / 2
      const ly = H / 2
      const R = Math.min(halfW * 0.37, H * 0.38)

      svg.append('rect')
        .attr('x', 2).attr('y', 2)
        .attr('width', halfW - 2).attr('height', H - 4)
        .attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      // Panel title
      svg.append('text')
        .attr('x', halfW / 2).attr('y', 18)
        .attr('text-anchor', 'middle').attr('fill', C.muted)
        .attr('font-size', 11).attr('font-weight', '500')
        .text('x = sinθ on the unit circle')

      // Axes
      ;[
        [lx - R - 10, ly, lx + R + 10, ly],
        [lx, ly - R - 10, lx, ly + R + 10],
      ].forEach(([x1, y1, x2, y2]) => {
        svg.append('line')
          .attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
          .attr('stroke', C.axis).attr('stroke-width', 1)
      })

      // Unit circle
      svg.append('circle')
        .attr('cx', lx).attr('cy', ly).attr('r', R)
        .attr('fill', 'none').attr('stroke', C.circle).attr('stroke-width', 1.8)

      const px = lx + R * xVal
      const py = ly - R * cosT

      // cos leg (vertical, from x-axis up to point)
      svg.append('line')
        .attr('x1', px).attr('y1', ly)
        .attr('x2', px).attr('y2', py)
        .attr('stroke', C.cosColor).attr('stroke-width', 2.5)

      // sin leg (horizontal, from center to x)
      svg.append('line')
        .attr('x1', lx).attr('y1', ly)
        .attr('x2', px).attr('y2', ly)
        .attr('stroke', C.sinColor).attr('stroke-width', 2.5)

      // Hypotenuse
      svg.append('line')
        .attr('x1', lx).attr('y1', ly)
        .attr('x2', px).attr('y2', py)
        .attr('stroke', C.xColor).attr('stroke-width', 2)

      // Right angle marker
      const sq = 7
      svg.append('rect')
        .attr('x', px - sq).attr('y', ly - sq)
        .attr('width', sq).attr('height', sq)
        .attr('fill', 'none').attr('stroke', C.muted).attr('stroke-width', 1)

      // Point on circle
      svg.append('circle')
        .attr('cx', px).attr('cy', py).attr('r', 7)
        .attr('fill', C.xColor).attr('stroke', C.bg).attr('stroke-width', 2)
        .attr('cursor', 'grab')
        .call(d3.drag()
          .on('drag', (event) => {
            const raw = (event.x - lx) / R
            xValRef.current = Math.max(-0.98, Math.min(0.98, raw))
            draw()
          })
        )

      const fs = Math.min(R * 0.14, 12)

      // Labels
      svg.append('text')
        .attr('x', lx + R * xVal / 2).attr('y', ly + fs * 1.5)
        .attr('text-anchor', 'middle').attr('fill', C.sinColor)
        .attr('font-size', fs).attr('font-weight', 'bold')
        .text(`sinθ = x = ${xVal.toFixed(2)}`)

      svg.append('text')
        .attr('x', px + fs * 0.8).attr('y', ly - R * cosT / 2)
        .attr('fill', C.cosColor).attr('font-size', fs).attr('font-weight', 'bold')
        .text(`cosθ = √(1−x²)`)

      // Identity callout
      const step = params.currentStep || 0
      if (step >= 1) {
        svg.append('text')
          .attr('x', halfW / 2).attr('y', H - 10)
          .attr('text-anchor', 'middle').attr('fill', C.step)
          .attr('font-size', 11).attr('font-weight', '600')
          .text('1−sin²θ = cos²θ  ⟹  √(1−x²) = cosθ')
      }

      // ──────────────────────────────────────────
      // RIGHT PANEL: integrand √(1−x²) curve
      // ──────────────────────────────────────────
      const rOX = halfW + 10
      svg.append('rect')
        .attr('x', rOX).attr('y', 2)
        .attr('width', halfW - 2).attr('height', H - 4)
        .attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      svg.append('text')
        .attr('x', rOX + halfW / 2).attr('y', 18)
        .attr('text-anchor', 'middle').attr('fill', C.muted)
        .attr('font-size', 11).attr('font-weight', '500')
        .text('y = √(1 − x²)  (semicircle)')

      const rInW = halfW - pad.l - pad.r
      const rInH = H - pad.t - pad.b
      const xScale = d3.scaleLinear().domain([-1.05, 1.05]).range([rOX + pad.l, rOX + pad.l + rInW])
      const yScale = d3.scaleLinear().domain([-0.1, 1.15]).range([pad.t + rInH, pad.t])

      // x axis
      svg.append('line')
        .attr('x1', xScale(-1.05)).attr('y1', yScale(0))
        .attr('x2', xScale(1.05)).attr('y2', yScale(0))
        .attr('stroke', C.axis).attr('stroke-width', 1)

      // y axis
      svg.append('line')
        .attr('x1', xScale(0)).attr('y1', yScale(-0.1))
        .attr('x2', xScale(0)).attr('y2', yScale(1.15))
        .attr('stroke', C.axis).attr('stroke-width', 1)

      // Tick labels
      ;[-1, -0.5, 0.5, 1].forEach(v => {
        svg.append('text')
          .attr('x', xScale(v)).attr('y', yScale(0) + 13)
          .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10)
          .text(v)
      })

      // Shaded area 0 to xVal (showing the integral visually)
      const areaData = d3.range(-1, xVal, 0.01).map(t => [t, Math.sqrt(Math.max(0, 1 - t * t))])
      const areaPath = d3.area()
        .x(d => xScale(d[0]))
        .y0(yScale(0))
        .y1(d => yScale(d[1]))
        .curve(d3.curveCatmullRom)

      svg.append('path')
        .datum(areaData)
        .attr('fill', C.fill)
        .attr('d', areaPath)

      // The semicircle curve
      const curveData = d3.range(-1, 1.01, 0.01).map(t => [t, Math.sqrt(Math.max(0, 1 - t * t))])
      const line = d3.line()
        .x(d => xScale(d[0]))
        .y(d => yScale(d[1]))
        .curve(d3.curveCatmullRom)

      svg.append('path')
        .datum(curveData)
        .attr('fill', 'none')
        .attr('stroke', C.curve)
        .attr('stroke-width', 2.5)
        .attr('d', line)

      // Vertical marker at current x
      const yAtX = Math.sqrt(Math.max(0, 1 - xVal * xVal))
      svg.append('line')
        .attr('x1', xScale(xVal)).attr('y1', yScale(0))
        .attr('x2', xScale(xVal)).attr('y2', yScale(yAtX))
        .attr('stroke', C.xColor).attr('stroke-width', 2).attr('stroke-dasharray', '4,3')

      svg.append('circle')
        .attr('cx', xScale(xVal)).attr('cy', yScale(yAtX)).attr('r', 5)
        .attr('fill', C.xColor).attr('stroke', C.bg).attr('stroke-width', 2)

      // Label: cosθ = √(1-x²) on the curve
      svg.append('text')
        .attr('x', xScale(xVal) + 6).attr('y', yScale(yAtX) - 6)
        .attr('fill', C.cosColor).attr('font-size', 10).attr('font-weight', 'bold')
        .text(`cosθ≈${yAtX.toFixed(2)}`)

      // x label bottom
      svg.append('text')
        .attr('x', xScale(xVal)).attr('y', yScale(0) + 13)
        .attr('text-anchor', 'middle').attr('fill', C.xColor).attr('font-size', 10)
        .text(`x=${xVal.toFixed(2)}`)

      // Bottom label
      svg.append('text')
        .attr('x', rOX + halfW / 2).attr('y', H - 8)
        .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10)
        .text('Drag point left ← → Drag point right')
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
