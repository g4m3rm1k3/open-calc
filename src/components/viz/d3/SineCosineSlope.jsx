import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 340
const M = { top: 30, right: 30, bottom: 45, left: 50 }

export default function SineCosineSlope({ params }) {
  const svgRef = useRef(null)
  const [xPos, setXPos] = useState(1.0)
  const [showCos, setShowCos] = useState(true)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xSc = d3.scaleLinear().domain([-Math.PI - 0.3, 2 * Math.PI + 0.3]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([-1.6, 1.6]).range([H - M.bottom, M.top])
    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y))

    // Grid
    xSc.ticks(8).forEach((t) =>
      svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom)
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    )
    ySc.ticks(5).forEach((t) =>
      svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    )

    // Axes
    svg.append('g').attr('transform', `translate(0,${ySc(0)})`).call(d3.axisBottom(xSc).tickValues([-Math.PI, -Math.PI/2, 0, Math.PI/2, Math.PI, 3*Math.PI/2, 2*Math.PI]).tickFormat(d => {
      const map = { [-Math.PI]: '-π', [-Math.PI/2]: '-π/2', 0: '0', [Math.PI/2]: 'π/2', [Math.PI]: 'π', [3*Math.PI/2]: '3π/2', [2*Math.PI]: '2π' }
      return map[d] ?? ''
    })).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${xSc(0)},0)`).call(d3.axisLeft(ySc).ticks(5)).attr('color', '#94a3b8')

    const xs = d3.range(-Math.PI - 0.3, 2 * Math.PI + 0.31, 0.02)

    // sin(x)
    svg.append('path').datum(xs.map(x => [x, Math.sin(x)])).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', line)

    // cos(x) — the derivative
    if (showCos) {
      svg.append('path').datum(xs.map(x => [x, Math.cos(x)])).attr('fill', 'none').attr('stroke', '#10b981').attr('stroke-width', 2).attr('stroke-dasharray', '6,3').attr('d', line)
    }

    // Tangent line at xPos
    const y0 = Math.sin(xPos)
    const slope = Math.cos(xPos)
    const tanLine = (x) => y0 + slope * (x - xPos)
    const left = xPos - 1.2, right = xPos + 1.2
    svg.append('path').datum([[left, tanLine(left)], [right, tanLine(right)]]).attr('fill', 'none').attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('d', line)

    // Point on sin
    svg.append('circle').attr('cx', xSc(xPos)).attr('cy', ySc(y0)).attr('r', 6).attr('fill', '#6470f1')

    // Slope label
    svg.append('text').attr('x', xSc(xPos) + 10).attr('y', ySc(y0) - 12).attr('font-size', 11).attr('fill', '#f59e0b')
      .text(`slope = cos(x) = ${slope.toFixed(3)}`)

    // Point on cos (derivative value)
    if (showCos) {
      svg.append('circle').attr('cx', xSc(xPos)).attr('cy', ySc(slope)).attr('r', 5).attr('fill', '#10b981')
    }

    // Legend
    const lg = svg.append('g').attr('transform', `translate(${W - M.right - 170}, ${M.top + 5})`)
    lg.append('rect').attr('width', 165).attr('height', showCos ? 62 : 38).attr('rx', 6).attr('fill', 'white').attr('fill-opacity', 0.9).attr('stroke', '#e2e8f0')
    lg.append('line').attr('x1', 8).attr('x2', 30).attr('y1', 16).attr('y2', 16).attr('stroke', '#6470f1').attr('stroke-width', 2.5)
    lg.append('text').attr('x', 36).attr('y', 20).attr('font-size', 12).attr('fill', '#6470f1').text('f(x) = sin(x)')
    if (showCos) {
      lg.append('line').attr('x1', 8).attr('x2', 30).attr('y1', 36).attr('y2', 36).attr('stroke', '#10b981').attr('stroke-width', 2).attr('stroke-dasharray', '6,3')
      lg.append('text').attr('x', 36).attr('y', 40).attr('font-size', 12).attr('fill', '#10b981').text("f′(x) = cos(x)")
      lg.append('line').attr('x1', 8).attr('x2', 30).attr('y1', 54).attr('y2', 54).attr('stroke', '#f59e0b').attr('stroke-width', 2)
      lg.append('text').attr('x', 36).attr('y', 58).attr('font-size', 12).attr('fill', '#f59e0b').text('tangent line')
    }
  }, [xPos, showCos])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <SliderControl label="x position" min={-Math.PI} max={2 * Math.PI} step={0.05} value={xPos} onChange={setXPos} />
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
          <input type="checkbox" checked={showCos} onChange={(e) => setShowCos(e.target.checked)} className="accent-brand-500" />
          Show cos(x) — the derivative curve
        </label>
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        The slope of sin(x) at every point (yellow tangent) equals cos(x) at that point (green dot).
      </p>
    </div>
  )
}
