import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'

const PI = Math.PI

const TRIG = [
  {
    label: 'arcsin',
    fLabel: 'sin(x)',
    invLabel: 'arcsin(x)',
    f: x => Math.sin(x),
    fInv: y => Math.asin(Math.max(-1, Math.min(1, y))),
    domain: [-PI / 2, PI / 2],
    range: [-1, 1],
    plotDomain: [-2 * PI, 2 * PI],
    yDomain: [-2.5, 2.5],
    dfText: 'cos(x) > 0 on (−π/2, π/2)',
    invDeriv: '1 / √(1 − x²)',
  },
  {
    label: 'arccos',
    fLabel: 'cos(x)',
    invLabel: 'arccos(x)',
    f: x => Math.cos(x),
    fInv: y => Math.acos(Math.max(-1, Math.min(1, y))),
    domain: [0, PI],
    range: [-1, 1],
    plotDomain: [-2 * PI, 2 * PI],
    yDomain: [-2.5, 2.5],
    dfText: '−sin(x) < 0 on (0, π)',
    invDeriv: '−1 / √(1 − x²)',
  },
  {
    label: 'arctan',
    fLabel: 'tan(x)',
    invLabel: 'arctan(x)',
    f: x => {
      const v = Math.tan(x)
      return Math.abs(v) > 8 ? NaN : v
    },
    fInv: y => Math.atan(y),
    domain: [-PI / 2, PI / 2],
    range: [-Infinity, Infinity],
    plotDomain: [-3 * PI / 2 + 0.05, 3 * PI / 2 - 0.05],
    yDomain: [-5, 5],
    dfText: 'sec²(x) > 0 on (−π/2, π/2)',
    invDeriv: '1 / (1 + x²)',
  },
]

const fmt = v => {
  if (Math.abs(v - PI / 2) < 0.01) return 'π/2'
  if (Math.abs(v + PI / 2) < 0.01) return '−π/2'
  if (Math.abs(v - PI) < 0.01) return 'π'
  if (Math.abs(v + PI) < 0.01) return '−π'
  if (Math.abs(v - 2 * PI) < 0.01) return '2π'
  if (Math.abs(v + 2 * PI) < 0.01) return '−2π'
  if (Math.abs(v) < 0.01) return '0'
  return v.toFixed(2)
}

export default function InverseTrigDomainViz({ params = {} }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [active, setActive] = useState(0)

  const trig = TRIG[active]

  useEffect(() => {
    const draw = () => {
      if (!containerRef.current || !svgRef.current) return
      const W = containerRef.current.clientWidth || 560
      const H = Math.round(W * 0.48)
      const margin = { top: 20, right: 20, bottom: 40, left: 44 }
      const iw = W - margin.left - margin.right
      const ih = H - margin.top - margin.bottom

      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:       isDark ? '#0f172a' : '#f8fafc',
        grid:     isDark ? '#1e293b' : '#e2e8f0',
        axis:     isDark ? '#475569' : '#94a3b8',
        axisText: isDark ? '#94a3b8' : '#64748b',
        fAll:     isDark ? 'rgba(56,189,248,0.25)' : 'rgba(2,132,199,0.18)',
        fRestr:   isDark ? '#38bdf8' : '#0284c7',
        invColor: isDark ? '#f472b6' : '#db2777',
        shade:    isDark ? 'rgba(56,189,248,0.13)' : 'rgba(2,132,199,0.10)',
        shadeB:   isDark ? 'rgba(56,189,248,0.5)' : 'rgba(2,132,199,0.5)',
        label:    isDark ? '#e2e8f0' : '#1e293b',
        warn:     isDark ? '#fbbf24' : '#d97706',
        zero:     isDark ? '#475569' : '#94a3b8',
      }

      const { f, fInv, domain, plotDomain, yDomain } = trig
      const xScale = d3.scaleLinear().domain(plotDomain).range([0, iw])
      const yScale = d3.scaleLinear().domain(yDomain).range([ih, 0])

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H)

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      // Grid
      yScale.ticks(5).forEach(v => {
        g.append('line').attr('x1', 0).attr('x2', iw)
          .attr('y1', yScale(v)).attr('y2', yScale(v))
          .attr('stroke', C.grid).attr('stroke-width', 1)
      })
      // y=0 and x=0
      g.append('line').attr('x1', 0).attr('x2', iw)
        .attr('y1', yScale(0)).attr('y2', yScale(0))
        .attr('stroke', C.axis).attr('stroke-width', 1.5)
      g.append('line').attr('x1', xScale(0)).attr('x2', xScale(0))
        .attr('y1', 0).attr('y2', ih)
        .attr('stroke', C.axis).attr('stroke-width', 1.5)

      const step = 0.02
      const pts = d3.range(plotDomain[0], plotDomain[1] + step, step)

      // Full f — faded
      const lineAll = d3.line()
        .x(d => xScale(d)).y(d => yScale(f(d)))
        .defined(d => isFinite(f(d)))
        .curve(d3.curveCatmullRom)
      g.append('path').datum(pts).attr('d', lineAll)
        .attr('fill', 'none').attr('stroke', C.fAll).attr('stroke-width', 2.5)

      // Restricted domain shading
      g.append('rect')
        .attr('x', xScale(domain[0]))
        .attr('width', xScale(domain[1]) - xScale(domain[0]))
        .attr('y', 0).attr('height', ih)
        .attr('fill', C.shade)

      g.append('line')
        .attr('x1', xScale(domain[0])).attr('x2', xScale(domain[0]))
        .attr('y1', 0).attr('y2', ih)
        .attr('stroke', C.shadeB).attr('stroke-width', 2).attr('stroke-dasharray', '5 3')
      g.append('line')
        .attr('x1', xScale(domain[1])).attr('x2', xScale(domain[1]))
        .attr('y1', 0).attr('y2', ih)
        .attr('stroke', C.shadeB).attr('stroke-width', 2).attr('stroke-dasharray', '5 3')

      // Restricted f — bold
      const restrPts = pts.filter(d => d >= domain[0] - 0.01 && d <= domain[1] + 0.01)
      g.append('path').datum(restrPts).attr('d', lineAll)
        .attr('fill', 'none').attr('stroke', C.fRestr).attr('stroke-width', 3)

      // Inverse function curve
      const invDomain = [-3, 3]
      const invPts = d3.range(invDomain[0], invDomain[1] + 0.01, 0.04)
        .filter(y => {
          const x = fInv(y)
          return isFinite(x) && x >= plotDomain[0] && x <= plotDomain[1]
        })

      const lineInv = d3.line()
        .x(d => xScale(fInv(d))).y(d => yScale(d))
        .defined(d => isFinite(fInv(d)))
        .curve(d3.curveCatmullRom)

      if (active !== 2) {
        // For sin and cos, show arcsin/arccos on same axes using x→ range values
        const arcPts = d3.range(-1, 1.01, 0.02)
        g.append('path').datum(arcPts)
          .attr('d', d3.line()
            .x(d => xScale(fInv(d))).y(d => yScale(d))
            .defined(d => isFinite(fInv(d)))
          )
          .attr('fill', 'none').attr('stroke', C.invColor).attr('stroke-width', 2.5)
          .attr('stroke-dasharray', '7 3')
      } else {
        // arctan: range is all reals clipped
        const arcPts = d3.range(-4.9, 4.9, 0.05)
        g.append('path').datum(arcPts)
          .attr('d', d3.line()
            .x(d => xScale(fInv(d))).y(d => yScale(d))
          )
          .attr('fill', 'none').attr('stroke', C.invColor).attr('stroke-width', 2.5)
          .attr('stroke-dasharray', '7 3')
      }

      // Domain boundary labels
      const y0 = yScale(yDomain[0]) - 4
      g.append('text').attr('x', xScale(domain[0])).attr('y', y0)
        .attr('text-anchor', 'middle').attr('fill', C.shadeB).attr('font-size', 11)
        .text(fmt(domain[0]))
      g.append('text').attr('x', xScale(domain[1])).attr('y', y0)
        .attr('text-anchor', 'middle').attr('fill', C.shadeB).attr('font-size', 11)
        .text(fmt(domain[1]))

      // Axes
      g.append('g').attr('transform', `translate(0,${ih})`)
        .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => fmt(d)).tickSize(3))
        .call(ax => ax.select('.domain').attr('stroke', C.axis))
        .call(ax => ax.selectAll('text').attr('fill', C.axisText).attr('font-size', 9.5))
        .call(ax => ax.selectAll('line').attr('stroke', C.axis))
      g.append('g').call(d3.axisLeft(yScale).ticks(5).tickSize(3))
        .call(ax => ax.select('.domain').attr('stroke', C.axis))
        .call(ax => ax.selectAll('text').attr('fill', C.axisText).attr('font-size', 10))
        .call(ax => ax.selectAll('line').attr('stroke', C.axis))

      // Legend
      const lx = iw - 140, ly = 4
      const leg = g.append('g').attr('transform', `translate(${lx},${ly})`)
      leg.append('line').attr('x1', 0).attr('x2', 18).attr('y1', 8).attr('y2', 8)
        .attr('stroke', C.fRestr).attr('stroke-width', 3)
      leg.append('text').attr('x', 22).attr('y', 12).attr('fill', C.label).attr('font-size', 11)
        .text(trig.fLabel + ' (restricted)')
      leg.append('line').attr('x1', 0).attr('x2', 18).attr('y1', 26).attr('y2', 26)
        .attr('stroke', C.invColor).attr('stroke-width', 2.5).attr('stroke-dasharray', '6 3')
      leg.append('text').attr('x', 22).attr('y', 30).attr('fill', C.label).attr('font-size', 11)
        .text(trig.invLabel)
    }

    draw()
    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [active])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div className="flex gap-2 flex-wrap px-1 pb-1">
        {TRIG.map((t, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`px-3 py-1 rounded text-sm font-mono transition-colors ${
              active === i
                ? 'bg-pink-500 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="px-1 pb-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold">Why restrict?</span>{' '}
        {trig.dfText} — so f is monotone on the shaded region and the inverse exists.
        {' '}Derivative of {trig.invLabel}: <span className="font-mono">{trig.invDeriv}</span>
      </div>
    </div>
  )
}
