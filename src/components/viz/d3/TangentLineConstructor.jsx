import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 400
const M = { top: 20, right: 30, bottom: 40, left: 50 }

const f = (x) => x * x
const fPrime = (x) => 2 * x

export default function TangentLineConstructor({ params }) {
  const svgRef = useRef(null)
  const [a, setA] = useState(1)
  const [showRiseRun, setShowRiseRun] = useState(true)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xSc = d3.scaleLinear().domain([-3, 3]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([-1, 9]).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(6).forEach((t) => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(6).forEach((t) => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes
    svg.append('g').attr('transform', `translate(0,${ySc(0)})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${xSc(0)},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    // Parabola
    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y))
    const pts = d3.range(-3, 3.02, 0.02).map((x) => [x, f(x)])
    svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', line)

    const ya = f(a)
    const slope = fPrime(a)

    // Tangent line
    const tanLine = (x) => ya + slope * (x - a)
    const tanPts = [[-3, tanLine(-3)], [3, tanLine(3)]]
    svg.append('path').datum(tanPts).attr('fill', 'none').attr('stroke', '#10b981').attr('stroke-width', 2).attr('d', line)

    // Rise/run triangle
    if (showRiseRun) {
      const dx = 1
      const runEnd = a + dx
      const rise = slope * dx
      svg.append('line').attr('x1', xSc(a)).attr('x2', xSc(runEnd)).attr('y1', ySc(ya)).attr('y2', ySc(ya)).attr('stroke', '#f59e0b').attr('stroke-width', 2)
      svg.append('line').attr('x1', xSc(runEnd)).attr('x2', xSc(runEnd)).attr('y1', ySc(ya)).attr('y2', ySc(ya + rise)).attr('stroke', '#ef4444').attr('stroke-width', 2)

      svg.append('text').attr('x', xSc(a + dx / 2)).attr('y', ySc(ya) + 16).attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#f59e0b').text('run = 1')
      svg.append('text').attr('x', xSc(runEnd) + 10).attr('y', ySc(ya + rise / 2)).attr('font-size', 11).attr('fill', '#ef4444').text(`rise = ${slope.toFixed(2)}`)
    }

    // Point on curve
    svg.append('circle').attr('cx', xSc(a)).attr('cy', ySc(ya)).attr('r', 6).attr('fill', '#6470f1')
    svg.append('text').attr('x', xSc(a) + 10).attr('y', ySc(ya) - 10).attr('font-size', 11).attr('fill', '#6470f1').text(`(${a.toFixed(1)}, ${ya.toFixed(2)})`)

    // Tangent info
    svg.append('text').attr('x', W / 2).attr('y', 15).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#64748b').text('f(x) = x²')
    svg.append('text').attr('x', W - M.right).attr('y', M.top + 15).attr('text-anchor', 'end').attr('font-size', 11).attr('fill', '#10b981').text(`slope = f'(${a.toFixed(1)}) = ${slope.toFixed(2)}`)

    // Tangent line equation
    const b = ya - slope * a
    svg.append('text').attr('x', W - M.right).attr('y', M.top + 32).attr('text-anchor', 'end').attr('font-size', 10).attr('fill', '#10b981').text(`y = ${slope.toFixed(2)}x ${b >= 0 ? '+' : '−'} ${Math.abs(b).toFixed(2)}`)

  }, [a, showRiseRun])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <SliderControl label="Point x = a" min={-2.5} max={2.5} step={0.1} value={a} onChange={setA} />
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
          <input type="checkbox" checked={showRiseRun} onChange={(e) => setShowRiseRun(e.target.checked)} className="accent-brand-500" />
          Show rise/run triangle
        </label>
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        Drag the point along f(x) = x². The tangent line (green) shows the slope f'(a) = 2a. The point-slope equation updates in real time.
      </p>
    </div>
  )
}
