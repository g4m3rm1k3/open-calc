import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

/**
 * RootMultiplicityViz
 * Three side-by-side panels: root of multiplicity 1 (crosses), 2 (bounces), 3 (flattened cross).
 * currentStep highlights which panel. Dark mode. ResizeObserver.
 */
export default function RootMultiplicityViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:       isDark ? '#0f172a' : '#f8fafc',
        panel:    isDark ? '#1e293b' : '#ffffff',
        panelHL:  isDark ? '#1e3a5f' : '#eff6ff',
        border:   isDark ? '#334155' : '#e2e8f0',
        borderHL: isDark ? '#3b82f6' : '#3b82f6',
        axis:     isDark ? '#475569' : '#cbd5e1',
        text:     isDark ? '#e2e8f0' : '#1e293b',
        muted:    isDark ? '#64748b' : '#94a3b8',
        cross:    isDark ? '#34d399' : '#059669',
        bounce:   isDark ? '#f472b6' : '#db2777',
        flatten:  isDark ? '#fbbf24' : '#d97706',
        zero:     isDark ? '#64748b' : '#94a3b8',
        signPos:  isDark ? 'rgba(52,211,153,0.15)' : 'rgba(5,150,105,0.08)',
        signNeg:  isDark ? 'rgba(248,113,113,0.15)' : 'rgba(220,38,38,0.08)',
      }

      const W = containerRef.current?.clientWidth || 540
      const H = Math.round(W * 0.48)
      const panelW = (W - 16) / 3
      const panelH = H - 8

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      const currentStep = params.currentStep ?? -1

      const cases = [
        {
          mult: 1, label: 'Multiplicity 1', sublabel: '(crosses)',
          f: x => x * (x - 1.5) * (x + 1.5),
          color: C.cross, desc: 'Sign changes at root → graph crosses',
        },
        {
          mult: 2, label: 'Multiplicity 2', sublabel: '(bounces)',
          f: x => (x * x) * (x - 2.5),
          color: C.bounce, desc: 'Sign preserved at root → graph bounces',
        },
        {
          mult: 3, label: 'Multiplicity 3', sublabel: '(flattened cross)',
          f: x => (x * x * x) * 0.6,
          color: C.flatten, desc: 'Sign changes, but flattened tangency at root',
        },
      ]

      cases.forEach(({ mult, label, sublabel, f, color, desc }, i) => {
        const ox = 4 + i * (panelW + 4)
        const highlight = currentStep === i
        const pad = { t: 32, b: 28, l: 20, r: 10 }
        const iW = panelW - pad.l - pad.r - 8
        const iH = panelH - pad.t - pad.b

        const xDom = [-3.2, 3.2]
        const rawData = d3.range(xDom[0], xDom[1], 0.03).map(x => [x, f(x)])
        const yVals = rawData.map(d => d[1]).filter(isFinite)
        const yMax = Math.max(...yVals), yMin = Math.min(...yVals)
        const yPad = (yMax - yMin) * 0.15
        const yDom = [yMin - yPad, yMax + yPad]

        const xS = d3.scaleLinear().domain(xDom).range([ox + pad.l, ox + pad.l + iW])
        const yS = d3.scaleLinear().domain(yDom).range([pad.t + iH, pad.t])

        // Panel bg
        svg.append('rect')
          .attr('x', ox + 2).attr('y', 2)
          .attr('width', panelW - 4).attr('height', panelH - 2)
          .attr('rx', 8)
          .attr('fill', highlight ? C.panelHL : C.panel)
          .attr('stroke', highlight ? C.borderHL : C.border)
          .attr('stroke-width', highlight ? 2 : 1)

        // Sign fill
        rawData.forEach((d, j) => {
          if (j === 0) return
          const prev = rawData[j - 1]
          const fillColor = d[1] >= 0 ? C.signPos : C.signNeg
          svg.append('rect')
            .attr('x', xS(prev[0])).attr('y', yS(Math.max(d[1], 0)))
            .attr('width', Math.max(xS(d[0]) - xS(prev[0]), 1))
            .attr('height', Math.abs(yS(d[1]) - yS(0)))
            .attr('fill', fillColor).attr('opacity', 0.5)
        })

        // Axes
        const y0 = yS(0)
        svg.append('line')
          .attr('x1', ox + pad.l).attr('y1', y0)
          .attr('x2', ox + pad.l + iW).attr('y2', y0)
          .attr('stroke', C.axis).attr('stroke-width', 1.5)

        const x0 = xS(0)
        svg.append('line')
          .attr('x1', x0).attr('y1', pad.t)
          .attr('x2', x0).attr('y2', pad.t + iH)
          .attr('stroke', C.axis).attr('stroke-width', 1)

        // Curve
        const lineGen = d3.line()
          .x(d => xS(d[0])).y(d => yS(d[1]))
          .curve(d3.curveMonotoneX)
          .defined(d => d[1] >= yDom[0] && d[1] <= yDom[1])

        svg.append('path').datum(rawData)
          .attr('fill', 'none')
          .attr('stroke', color).attr('stroke-width', 2.5)
          .attr('d', lineGen)

        // Root dot at x=0
        svg.append('circle')
          .attr('cx', xS(0)).attr('cy', y0).attr('r', 5)
          .attr('fill', color).attr('stroke', C.bg).attr('stroke-width', 2)

        // Labels
        svg.append('text')
          .attr('x', ox + panelW / 2).attr('y', 16)
          .attr('text-anchor', 'middle').attr('fill', color)
          .attr('font-size', 12).attr('font-weight', 'bold')
          .text(label)

        svg.append('text')
          .attr('x', ox + panelW / 2).attr('y', 27)
          .attr('text-anchor', 'middle').attr('fill', C.muted)
          .attr('font-size', 10)
          .text(sublabel)

        // Sign change arrows
        const arrowY = pad.t + iH + 14
        svg.append('text')
          .attr('x', ox + panelW / 2 - 20).attr('y', arrowY + 12)
          .attr('text-anchor', 'middle').attr('fill', mult % 2 === 1 ? C.cross : C.bounce)
          .attr('font-size', 10)
          .text(mult % 2 === 1 ? '− → +' : '− → −')
      })

      // Legend at bottom
      svg.append('text')
        .attr('x', W / 2).attr('y', H - 4)
        .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10)
        .text('Green shading = positive region  |  Red shading = negative region  |  Root at x = 0')
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
