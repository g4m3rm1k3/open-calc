import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

/**
 * PowerReductionViz
 * Dual panel:
 * Left:  y = sin²x plotted, showing it oscillates between 0 and 1, averaging 1/2
 * Right: y = (1 − cos2x)/2 plotted — identical curve, different formula
 * A draggable x-line shows the values are always equal.
 * Step 0: just sin²x. Step 1: overlay. Step 2+: both + equality highlight.
 * Dark mode. ResizeObserver.
 */
export default function PowerReductionViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const xRef = useRef(Math.PI / 4)

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:     isDark ? '#0f172a' : '#f8fafc',
        panel:  isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '#334155' : '#e2e8f0',
        axis:   isDark ? '#475569' : '#94a3b8',
        grid:   isDark ? '#1e293b' : '#f1f5f9',
        text:   isDark ? '#e2e8f0' : '#1e293b',
        muted:  isDark ? '#64748b' : '#94a3b8',
        sin2:   isDark ? '#f472b6' : '#db2777',
        pr:     isDark ? '#38bdf8' : '#0284c7',
        avg:    isDark ? '#fbbf24' : '#d97706',
        xLine:  isDark ? '#34d399' : '#059669',
        fill1:  isDark ? 'rgba(244,114,182,0.12)' : 'rgba(219,39,119,0.08)',
      }

      const step = params.currentStep ?? 2
      const W = containerRef.current?.clientWidth || 560
      const H = Math.round(W * 0.5)
      const halfW = W / 2 - 4
      const pad = { t: 28, b: 28, l: 36, r: 12 }
      const iW = halfW - pad.l - pad.r
      const iH = H - pad.t - pad.b

      const xDom = [0, 2 * Math.PI]
      const yDom = [-0.15, 1.15]
      const mkX = d3.scaleLinear().domain(xDom).range([pad.l, pad.l + iW])
      const mkY = d3.scaleLinear().domain(yDom).range([pad.t + iH, pad.t])

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      const drawPanel = (offsetX, titleText, curveColor, curveFn, showPR) => {
        const xS = (v) => offsetX + mkX(v)
        const yS = (v) => mkY(v)

        svg.append('rect').attr('x', offsetX + 2).attr('y', 2).attr('width', halfW - 4).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

        // Grid
        ;[0, 0.5, 1].forEach(v => {
          svg.append('line').attr('x1', xS(xDom[0])).attr('y1', yS(v)).attr('x2', xS(xDom[1])).attr('y2', yS(v)).attr('stroke', C.grid).attr('stroke-width', 1)
        })

        // Axes
        svg.append('line').attr('x1', xS(xDom[0])).attr('y1', yS(0)).attr('x2', xS(xDom[1])).attr('y2', yS(0)).attr('stroke', C.axis).attr('stroke-width', 1.5)
        svg.append('line').attr('x1', xS(0)).attr('y1', pad.t).attr('x2', xS(0)).attr('y2', pad.t + iH).attr('stroke', C.axis).attr('stroke-width', 1)

        // x-axis tick labels
        ;[[Math.PI / 2, 'π/2'], [Math.PI, 'π'], [3 * Math.PI / 2, '3π/2'], [2 * Math.PI, '2π']].forEach(([v, lbl]) => {
          svg.append('text').attr('x', xS(v)).attr('y', yS(0) + 13).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(lbl)
        })
        ;[0, 0.5, 1].forEach(v => {
          svg.append('text').attr('x', xS(0) - 4).attr('y', yS(v) + 4).attr('text-anchor', 'end').attr('fill', C.muted).attr('font-size', 10).text(v)
        })

        // Average line y = 1/2
        svg.append('line').attr('x1', xS(xDom[0])).attr('y1', yS(0.5)).attr('x2', xS(xDom[1])).attr('y2', yS(0.5)).attr('stroke', C.avg).attr('stroke-width', 1.5).attr('stroke-dasharray', '5,4').attr('opacity', 0.7)
        svg.append('text').attr('x', xS(xDom[1]) - 4).attr('y', yS(0.5) - 6).attr('text-anchor', 'end').attr('fill', C.avg).attr('font-size', 10).text('avg = ½')

        // Shaded area under curve
        const areaData = d3.range(xDom[0], xDom[1], 0.03).map(x => [x, curveFn(x)])
        const area = d3.area().x(d => xS(d[0])).y0(yS(0)).y1(d => yS(d[1])).curve(d3.curveCatmullRom)
        svg.append('path').datum(areaData).attr('fill', C.fill1).attr('d', area)

        // Power reduction overlay
        if (showPR && step >= 1) {
          const prData = d3.range(xDom[0], xDom[1], 0.03).map(x => [x, (1 - Math.cos(2 * x)) / 2])
          const prLine = d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom)
          svg.append('path').datum(prData).attr('fill', 'none').attr('stroke', C.pr).attr('stroke-width', 2).attr('stroke-dasharray', '6,3').attr('d', prLine)
        }

        // Main curve
        const curveData = d3.range(xDom[0], xDom[1], 0.02).map(x => [x, curveFn(x)])
        const line = d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom)
        svg.append('path').datum(curveData).attr('fill', 'none').attr('stroke', curveColor).attr('stroke-width', 2.5).attr('d', line)

        // Draggable x line
        const xVal = xRef.current
        const yVal = curveFn(xVal)
        svg.append('line').attr('x1', xS(xVal)).attr('y1', yS(0)).attr('x2', xS(xVal)).attr('y2', yS(1.1)).attr('stroke', C.xLine).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
        svg.append('circle').attr('cx', xS(xVal)).attr('cy', yS(yVal)).attr('r', 5).attr('fill', C.xLine).attr('stroke', C.bg).attr('stroke-width', 2)
        svg.append('circle').attr('cx', xS(xVal)).attr('cy', yS(0)).attr('r', 6).attr('fill', C.xLine).attr('stroke', C.bg).attr('stroke-width', 2).attr('cursor', 'ew-resize')
          .call(d3.drag().on('drag', (event) => {
            const raw = mkX.invert(event.x - offsetX)
            xRef.current = Math.max(0.05, Math.min(2 * Math.PI - 0.05, raw))
            draw()
          }))

        // Value label
        svg.append('text').attr('x', xS(xVal) + 7).attr('y', yS(yVal) - 6).attr('fill', C.xLine).attr('font-size', 10).attr('font-weight', 'bold').text(yVal.toFixed(3))

        // Title
        svg.append('text').attr('x', offsetX + halfW / 2).attr('y', 17).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 11).attr('font-weight', '500').text(titleText)
      }

      drawPanel(0, 'y = sin²x', C.sin2, x => Math.sin(x) ** 2, true)
      drawPanel(halfW + 8, 'y = (1 − cos 2x) / 2', C.pr, x => (1 - Math.cos(2 * x)) / 2, false)

      // Equality note at bottom centre
      if (step >= 2) {
        const xV = xRef.current
        const v1 = (Math.sin(xV) ** 2).toFixed(4)
        const v2 = ((1 - Math.cos(2 * xV)) / 2).toFixed(4)
        svg.append('text').attr('x', W / 2).attr('y', H - 6).attr('text-anchor', 'middle').attr('fill', C.xLine).attr('font-size', 11).attr('font-weight', 'bold')
          .text(`sin²(x) = ${v1}  =  (1−cos2x)/2 = ${v2}  ← identical`)
      }
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [params.currentStep])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '6px 0 0', textAlign: 'center' }}>
        Drag the green marker — both panels track the same x. The values are always identical.
      </p>
    </div>
  )
}
