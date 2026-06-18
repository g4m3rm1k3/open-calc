import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'

const W = 580, H = 300
const M = { top: 20, right: 20, bottom: 36, left: 52 }
const IW = W - M.left - M.right
const IH = H - M.top - M.bottom

const X_DOMAIN = [-1, 5]
const Y_DOMAIN = [0, 8]
const SAMPLES = 300

const SCENARIOS = [
  {
    id: 'hole',
    label: 'Hole (limit exists)',
    // f(x) = (x²-4)/(x-2) = x+2 with hole at x=2
    fn: x => x + 2,
    holeX: 2,
    holeY: 4,          // limit value at hole
    filledCircle: null, // no f(a) defined
    openCircle: { x: 2, y: 4 },
    fValue: null,
    limitValue: 4,
    infoText: 'f(2) is undefined — hole in the graph. But the limit = 4.',
    bannerText: 'f(2) = undefined,  lim = 4',
    bannerColor: '#f59e0b',
    continuous: false,
  },
  {
    id: 'redefined',
    label: 'Redefined Point',
    fn: x => x + 2,
    holeX: 2,
    holeY: 4,
    filledCircle: { x: 2, y: 1 },   // f(2) = 1 (redefined)
    openCircle:   { x: 2, y: 4 },   // limit at (2,4)
    fValue: 1,
    limitValue: 4,
    infoText: 'f(2) = 1 (redefined), but the limit still = 4. They differ!',
    bannerText: 'f(2) = 1,  lim = 4',
    bannerColor: '#f59e0b',
    continuous: false,
  },
  {
    id: 'continuous',
    label: 'Continuous',
    fn: x => x + 2,
    holeX: 2,
    holeY: 4,
    filledCircle: { x: 2, y: 4 },   // f(2) = 4
    openCircle: null,
    fValue: 4,
    limitValue: 4,
    infoText: 'f(2) = 4 and lim = 4. They agree — the function is continuous here!',
    bannerText: 'f(2) = 4 = lim ✓',
    bannerColor: '#10b981',
    continuous: true,
  },
]

export default function HoleVsValue({ params, onParamChange }) {
  const svgRef = useRef(null)
  const [activeId, setActiveId] = useState('hole')

  const scenario = SCENARIOS.find(s => s.id === activeId)

  useEffect(() => {
    const s = SCENARIOS.find(sc => sc.id === activeId)
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xScale = d3.scaleLinear().domain(X_DOMAIN).range([0, IW])
    const yScale = d3.scaleLinear().domain(Y_DOMAIN).range([IH, 0])

    const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`)

    // clip
    g.append('defs').append('clipPath').attr('id', 'hvv-clip')
      .append('rect').attr('width', IW).attr('height', IH)

    // grid
    const gridColor = '#e2e8f0'
    xScale.ticks(6).forEach(v => {
      g.append('line')
        .attr('x1', xScale(v)).attr('x2', xScale(v))
        .attr('y1', 0).attr('y2', IH)
        .attr('stroke', gridColor).attr('stroke-width', 0.7)
    })
    yScale.ticks(6).forEach(v => {
      g.append('line')
        .attr('x1', 0).attr('x2', IW)
        .attr('y1', yScale(v)).attr('y2', yScale(v))
        .attr('stroke', gridColor).attr('stroke-width', 0.7)
    })

    // axes
    const y0 = Math.max(0, Math.min(IH, yScale(0)))
    const xAxisG = g.append('g').attr('transform', `translate(0,${y0})`)
      .call(d3.axisBottom(xScale).ticks(6).tickSize(4))
    xAxisG.select('.domain').attr('stroke', '#94a3b8')
    xAxisG.selectAll('text').attr('fill', '#64748b').style('font-size', '11px')
    xAxisG.selectAll('line').attr('stroke', '#94a3b8')

    const yAxisG = g.append('g').attr('transform', `translate(${xScale(0)},0)`)
      .call(d3.axisLeft(yScale).ticks(6).tickSize(4))
    yAxisG.select('.domain').attr('stroke', '#94a3b8')
    yAxisG.selectAll('text').attr('fill', '#64748b').style('font-size', '11px')
    yAxisG.selectAll('line').attr('stroke', '#94a3b8')

    const clipG = g.append('g').attr('clip-path', 'url(#hvv-clip)')

    const xs = d3.range(SAMPLES).map(i =>
      X_DOMAIN[0] + (i / (SAMPLES - 1)) * (X_DOMAIN[1] - X_DOMAIN[0])
    )

    // Draw curve, excluding hole region
    const gapR = s.continuous ? 0 : 0.06
    const curveXs = xs.filter(x => Math.abs(x - s.holeX) > gapR)

    const line = d3.line()
      .defined(x => isFinite(s.fn(x)) && s.fn(x) >= Y_DOMAIN[0] - 0.5 && s.fn(x) <= Y_DOMAIN[1] + 0.5)
      .x(x => xScale(x))
      .y(x => yScale(s.fn(x)))

    clipG.append('path').datum(curveXs)
      .attr('fill', 'none')
      .attr('stroke', '#6470f1')
      .attr('stroke-width', 2.3)
      .attr('d', line)

    // Open circle (limit location) — drawn before filled so filled renders on top
    if (s.openCircle) {
      clipG.append('circle')
        .attr('cx', xScale(s.openCircle.x))
        .attr('cy', yScale(s.openCircle.y))
        .attr('r', 6)
        .attr('fill', 'white')
        .attr('stroke', '#6470f1')
        .attr('stroke-width', 2)

      // label for open circle: "limit = ..."
      g.append('text')
        .attr('x', xScale(s.openCircle.x) + 10)
        .attr('y', yScale(s.openCircle.y) - 6)
        .attr('fill', '#6470f1')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .text(`limit = ${s.limitValue}`)
    }

    // Filled circle (f(a) value)
    if (s.filledCircle) {
      clipG.append('circle')
        .attr('cx', xScale(s.filledCircle.x))
        .attr('cy', yScale(s.filledCircle.y))
        .attr('r', 6)
        .attr('fill', s.continuous ? '#10b981' : '#f59e0b')
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5)

      // label for filled circle: "f(a) = value"
      const labelX = xScale(s.filledCircle.x) + 10
      const labelY = yScale(s.filledCircle.y) + (s.continuous ? -8 : 14)
      g.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('fill', s.continuous ? '#10b981' : '#f59e0b')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .text(`f(a) = ${s.filledCircle.y}`)
    }

    // If scenario is 'hole' (no f(a) defined) — show "f(2) = ?" label at open circle
    if (s.id === 'hole') {
      g.append('text')
        .attr('x', xScale(s.openCircle.x) + 10)
        .attr('y', yScale(s.openCircle.y) + 14)
        .attr('fill', '#94a3b8')
        .style('font-size', '11px')
        .style('font-style', 'italic')
        .text('f(a) undefined')
    }

    // Animated arrow between f(a) and limit (only for redefined scenario)
    if (s.id === 'redefined' && s.filledCircle && s.openCircle) {
      const fx = xScale(s.filledCircle.x)
      const fy = yScale(s.filledCircle.y)
      const lx = xScale(s.openCircle.x)
      const ly = yScale(s.openCircle.y)

      // Arrow line
      const arrowLine = g.append('line')
        .attr('x1', fx).attr('y1', fy)
        .attr('x2', fx).attr('y2', fy)
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,3')
        .attr('marker-end', 'url(#arrowhead)')

      // arrowhead marker
      const defs = svg.select('defs').node()
        ? svg.select('defs')
        : svg.append('defs')
      const marker = defs.append('marker')
        .attr('id', 'arrowhead')
        .attr('markerWidth', 8).attr('markerHeight', 6)
        .attr('refX', 6).attr('refY', 3)
        .attr('orient', 'auto')
      marker.append('polygon')
        .attr('points', '0 0, 8 3, 0 6')
        .attr('fill', '#f59e0b')

      // Animate arrow from filled to open
      arrowLine.transition().duration(800).ease(d3.easeCubicInOut)
        .delay(300)
        .attr('x2', lx).attr('y2', ly)
    }

    // Banner
    const bW = 200, bH = 28
    const bannerG = g.append('g').attr('transform', `translate(${IW - bW - 4}, 4)`)
    bannerG.append('rect')
      .attr('width', bW).attr('height', bH).attr('rx', 5)
      .attr('fill', s.bannerColor).attr('opacity', 0.15)
    bannerG.append('text')
      .attr('x', bW / 2).attr('y', 19)
      .attr('text-anchor', 'middle')
      .attr('fill', s.bannerColor)
      .style('font-size', '12px').style('font-weight', '700')
      .text(s.bannerText)

    // Continuous scenario: extra green "Continuous here!" banner
    if (s.continuous) {
      const cG = g.append('g').attr('transform', `translate(6, 4)`)
      cG.append('rect')
        .attr('width', 130).attr('height', 28).attr('rx', 5)
        .attr('fill', '#10b981').attr('opacity', 0.15)
      cG.append('text')
        .attr('x', 65).attr('y', 19).attr('text-anchor', 'middle')
        .attr('fill', '#10b981').style('font-size', '12px').style('font-weight', '700')
        .text('Continuous here!')
    }

  }, [activeId])

  return (
    <div className="flex flex-col items-center gap-3 font-sans">
      <svg ref={svgRef} width={W} height={H} className="overflow-visible" />

      <div className="w-full max-w-[580px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {scenario.infoText}
        </p>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {SCENARIOS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveId(s.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              activeId === s.id
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-brand-400'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
