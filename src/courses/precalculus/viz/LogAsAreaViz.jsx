import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

/**
 * LogAsAreaViz
 * Dual panel:
 * Left: y=1/t curve, shaded area from 1 to x = ln(x). Draggable x.
 * Right: ln(x) curve with the current value marked.
 * Dark mode color tokens. ResizeObserver.
 */
export default function LogAsAreaViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const xValRef = useRef(Math.E)

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
        curve1:   isDark ? '#38bdf8' : '#0284c7',   // 1/t
        curve2:   isDark ? '#a78bfa' : '#7c3aed',   // ln(x)
        fill:     isDark ? 'rgba(56,189,248,0.20)' : 'rgba(2,132,199,0.12)',
        xLine:    isDark ? '#fbbf24' : '#d97706',
        eColor:   isDark ? '#34d399' : '#059669',
        negFill:  isDark ? 'rgba(248,113,113,0.18)' : 'rgba(220,38,38,0.10)',
        step:     isDark ? '#f97316' : '#ea580c',
      }

      const W = containerRef.current?.clientWidth || 560
      const H = Math.round(W * 0.56)
      const halfW = W / 2 - 5
      const pad = { t: 30, b: 30, l: 38, r: 12 }

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      const xVal = Math.max(0.12, Math.min(6.5, xValRef.current))
      const lnVal = Math.log(xVal)

      // ──────────────────────────────────────────
      // LEFT PANEL: y = 1/t, shaded area = ln(x)
      // ──────────────────────────────────────────
      svg.append('rect')
        .attr('x', 2).attr('y', 2)
        .attr('width', halfW - 2).attr('height', H - 4)
        .attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      svg.append('text')
        .attr('x', halfW / 2).attr('y', 17)
        .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 11).attr('font-weight', '500')
        .text('y = 1/t  — area = ln(x)')

      const lInW = halfW - pad.l - pad.r
      const lInH = H - pad.t - pad.b
      const tDom = [0.08, 6.8]
      const yDom = [0, 3.2]
      const tScale = d3.scaleLinear().domain(tDom).range([pad.l, pad.l + lInW])
      const yLScale = d3.scaleLinear().domain(yDom).range([pad.t + lInH, pad.t])

      // Axes
      svg.append('line')
        .attr('x1', tScale(tDom[0])).attr('y1', yLScale(0))
        .attr('x2', tScale(tDom[1])).attr('y2', yLScale(0))
        .attr('stroke', C.axis).attr('stroke-width', 1)
      svg.append('line')
        .attr('x1', tScale(1)).attr('y1', yLScale(yDom[0]))
        .attr('x2', tScale(1)).attr('y2', pad.t - 4)
        .attr('stroke', C.axis).attr('stroke-width', 1)

      // Tick at t=1, e
      ;[1, Math.E, 2, 3, 4, 5, 6].forEach(v => {
        svg.append('line')
          .attr('x1', tScale(v)).attr('y1', yLScale(0) - 3)
          .attr('x2', tScale(v)).attr('y2', yLScale(0) + 3)
          .attr('stroke', C.axis).attr('stroke-width', 1)
        svg.append('text')
          .attr('x', tScale(v)).attr('y', yLScale(0) + 13)
          .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10)
          .text(v === Math.E ? 'e' : v)
      })

      // Shaded area between 1 and xVal
      const lo = Math.min(1, xVal), hi = Math.max(1, xVal)
      const areaData = d3.range(lo, hi + 0.01, 0.01).map(t => [t, 1 / t])
      const areaPath = d3.area()
        .x(d => tScale(d[0])).y0(yLScale(0)).y1(d => yLScale(d[1]))
        .curve(d3.curveMonotoneX)

      svg.append('path')
        .datum(areaData)
        .attr('fill', xVal >= 1 ? C.fill : C.negFill)
        .attr('d', areaPath)

      // Curve y=1/t
      const curveData = d3.range(0.14, 6.8, 0.02).map(t => [t, 1 / t])
      const lineGen = d3.line()
        .x(d => tScale(d[0])).y(d => yLScale(Math.min(d[1], yDom[1])))
        .curve(d3.curveMonotoneX)

      svg.append('path')
        .datum(curveData)
        .attr('fill', 'none').attr('stroke', C.curve1).attr('stroke-width', 2.5)
        .attr('d', lineGen)

      // t=1 marker
      svg.append('line')
        .attr('x1', tScale(1)).attr('y1', yLScale(0))
        .attr('x2', tScale(1)).attr('y2', yLScale(1))
        .attr('stroke', C.eColor).attr('stroke-width', 1.5).attr('stroke-dasharray', '3,3')

      // t=e marker
      svg.append('line')
        .attr('x1', tScale(Math.E)).attr('y1', yLScale(0))
        .attr('x2', tScale(Math.E)).attr('y2', yLScale(1 / Math.E))
        .attr('stroke', C.eColor).attr('stroke-width', 1.5).attr('stroke-dasharray', '3,3')

      // x draggable line
      svg.append('line')
        .attr('x1', tScale(xVal)).attr('y1', yLScale(0))
        .attr('x2', tScale(xVal)).attr('y2', yLScale(Math.min(1 / xVal, yDom[1])))
        .attr('stroke', C.xLine).attr('stroke-width', 2)

      // Draggable handle on x-axis
      svg.append('circle')
        .attr('cx', tScale(xVal)).attr('cy', yLScale(0)).attr('r', 8)
        .attr('fill', C.xLine).attr('stroke', C.bg).attr('stroke-width', 2)
        .attr('cursor', 'ew-resize')
        .call(d3.drag()
          .on('drag', (event) => {
            const raw = tScale.invert(event.x)
            xValRef.current = Math.max(0.12, Math.min(6.5, raw))
            draw()
          })
        )

      // Area label
      const areaLabelX = tScale((lo + hi) / 2)
      const areaLabelY = yLScale(0.5 / Math.max(lo, 0.5))
      svg.append('text')
        .attr('x', areaLabelX).attr('y', areaLabelY)
        .attr('text-anchor', 'middle').attr('fill', xVal >= 1 ? C.curve1 : '#f87171')
        .attr('font-size', 11).attr('font-weight', 'bold')
        .text(`ln(${xVal.toFixed(2)}) = ${lnVal.toFixed(3)}`)

      // e annotation
      if (params.currentStep >= 1) {
        svg.append('text')
          .attr('x', tScale(Math.E)).attr('y', pad.t - 2)
          .attr('text-anchor', 'middle').attr('fill', C.eColor).attr('font-size', 10)
          .text('area=1 here → e')
      }

      // ──────────────────────────────────────────
      // RIGHT PANEL: ln(x) curve
      // ──────────────────────────────────────────
      const rOX = halfW + 10
      svg.append('rect')
        .attr('x', rOX).attr('y', 2)
        .attr('width', halfW - 2).attr('height', H - 4)
        .attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      svg.append('text')
        .attr('x', rOX + halfW / 2).attr('y', 17)
        .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 11).attr('font-weight', '500')
        .text('y = ln(x)')

      const rInW = halfW - pad.l - pad.r
      const xScale2 = d3.scaleLinear().domain([0, 7]).range([rOX + pad.l, rOX + pad.l + rInW])
      const yScale2 = d3.scaleLinear().domain([-2.2, 2.2]).range([pad.t + lInH, pad.t])

      // Axes
      svg.append('line')
        .attr('x1', xScale2(0)).attr('y1', yScale2(0))
        .attr('x2', xScale2(7)).attr('y2', yScale2(0))
        .attr('stroke', C.axis).attr('stroke-width', 1)
      svg.append('line')
        .attr('x1', xScale2(0)).attr('y1', yScale2(-2.2))
        .attr('x2', xScale2(0)).attr('y2', yScale2(2.2))
        .attr('stroke', C.axis).attr('stroke-width', 1)

      ;[1, 2, 3, 4, 5, 6].forEach(v => {
        svg.append('text')
          .attr('x', xScale2(v)).attr('y', yScale2(0) + 13)
          .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10)
          .text(v)
      })
      ;[-2, -1, 1, 2].forEach(v => {
        svg.append('text')
          .attr('x', xScale2(0) - 5).attr('y', yScale2(v) + 4)
          .attr('text-anchor', 'end').attr('fill', C.muted).attr('font-size', 10)
          .text(v)
      })

      // ln curve
      const lnData = d3.range(0.05, 7, 0.05).map(t => [t, Math.log(t)])
      const lnLine = d3.line()
        .x(d => xScale2(d[0])).y(d => yScale2(Math.max(-2.2, Math.min(2.2, d[1]))))
        .curve(d3.curveMonotoneX)

      svg.append('path')
        .datum(lnData)
        .attr('fill', 'none').attr('stroke', C.curve2).attr('stroke-width', 2.5)
        .attr('d', lnLine)

      // Current x dot
      if (xVal <= 6.8) {
        svg.append('line')
          .attr('x1', xScale2(xVal)).attr('y1', yScale2(0))
          .attr('x2', xScale2(xVal)).attr('y2', yScale2(lnVal))
          .attr('stroke', C.xLine).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
        svg.append('line')
          .attr('x1', xScale2(0)).attr('y1', yScale2(lnVal))
          .attr('x2', xScale2(xVal)).attr('y2', yScale2(lnVal))
          .attr('stroke', C.xLine).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
        svg.append('circle')
          .attr('cx', xScale2(xVal)).attr('cy', yScale2(lnVal)).attr('r', 5)
          .attr('fill', C.xLine).attr('stroke', C.bg).attr('stroke-width', 2)

        // Value label
        svg.append('text')
          .attr('x', xScale2(xVal) + 7).attr('y', yScale2(lnVal) - 5)
          .attr('fill', C.xLine).attr('font-size', 10).attr('font-weight', 'bold')
          .text(`(${xVal.toFixed(2)}, ${lnVal.toFixed(3)})`)
      }

      // e annotation on ln curve
      svg.append('circle')
        .attr('cx', xScale2(Math.E)).attr('cy', yScale2(1)).attr('r', 4)
        .attr('fill', C.eColor).attr('stroke', C.bg).attr('stroke-width', 1.5)
      svg.append('text')
        .attr('x', xScale2(Math.E) + 7).attr('y', yScale2(1) + 4)
        .attr('fill', C.eColor).attr('font-size', 10)
        .text('(e, 1)')

      // Bottom hint
      svg.append('text')
        .attr('x', W / 2).attr('y', H - 5)
        .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10)
        .text('Drag the orange handle on the left panel  ←  →')
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
