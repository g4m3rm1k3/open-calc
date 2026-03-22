import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 360
const M = { top: 20, right: 30, bottom: 40, left: 50 }

// f(x) = x^2
const f = (x) => x * x
const fPrime = (x) => 2 * x

export default function SecantToTangent({ params }) {
  const svgRef = useRef(null)
  const [h, setH] = useState(1.5)
  const [x0, setX0] = useState(1.5)
  const [showTangent, setShowTangent] = useState(false)
  const snapZone = h <= 0.12

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xSc = d3.scaleLinear().domain([-0.5, 4]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([-0.5, 10]).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(8).forEach((t) => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(6).forEach((t) => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes
    svg.append('g').attr('transform', `translate(0,${ySc(0)})`).call(d3.axisBottom(xSc).ticks(8)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${xSc(0)},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    // Parabola
    const pts = d3.range(-0.5, 4.02, 0.02).map((x) => [x, f(x)])
    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y))
    svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', line)

    // Points
    const y0 = f(x0)
    const x1 = x0 + h, y1 = f(x1)

    // Secant slope
    const secSlope = (y1 - y0) / (x1 - x0)  // = h + 2*x0

    // Draw secant line
    const secLine = (x) => y0 + secSlope * (x - x0)
    const secPts = [[-0.5, secLine(-0.5)], [4, secLine(4)]]
    svg.append('path').datum(secPts).attr('fill', 'none').attr('stroke', snapZone ? '#10b981' : '#f59e0b').attr('stroke-width', snapZone ? 2.8 : 2).attr('stroke-dasharray', h < 0.2 ? '5,3' : 'none').attr('d', line)
    svg.append('text').attr('x', xSc(3.5)).attr('y', ySc(secLine(3.5)) - 10).attr('font-size', 11).attr('fill', '#f59e0b').text(`secant slope = ${secSlope.toFixed(3)}`)

    // h label
    svg.append('line').attr('x1', xSc(x0)).attr('x2', xSc(x1)).attr('y1', ySc(y0) + 20).attr('y2', ySc(y0) + 20).attr('stroke', '#94a3b8').attr('stroke-width', 1).attr('marker-end', 'url(#arr)')
    svg.append('text').attr('x', xSc((x0 + x1) / 2)).attr('y', ySc(y0) + 35).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#94a3b8').text(`h = ${h.toFixed(2)}`)

    // Tangent line
    if (showTangent || snapZone) {
      const tanSlope = fPrime(x0)
      const tanLine = (x) => y0 + tanSlope * (x - x0)
      const tanPts = [[-0.5, tanLine(-0.5)], [4, tanLine(4)]]
      svg.append('path').datum(tanPts).attr('fill', 'none').attr('stroke', '#10b981').attr('stroke-width', 2.5).attr('d', line)
      svg.append('text').attr('x', xSc(3.5)).attr('y', ySc(tanLine(3.5)) - 10).attr('font-size', 11).attr('fill', '#10b981').text(`tangent slope = ${tanSlope.toFixed(3)}`)
    }

    // Points on curve
    svg.append('circle').attr('cx', xSc(x0)).attr('cy', ySc(y0)).attr('r', 6).attr('fill', '#6470f1')
    svg.append('circle').attr('cx', xSc(x1)).attr('cy', ySc(y1)).attr('r', 6).attr('fill', '#f59e0b')

    svg.append('text').attr('x', xSc(x0) + 8).attr('y', ySc(y0) - 8).attr('font-size', 11).attr('fill', '#6470f1').text(`(${x0}, ${y0.toFixed(2)})`)
    svg.append('text').attr('x', xSc(x1) + 8).attr('y', ySc(y1) - 8).attr('font-size', 11).attr('fill', '#f59e0b').text(`(${x1.toFixed(2)}, ${y1.toFixed(2)})`)

    // Title
    svg.append('text').attr('x', W / 2).attr('y', 15).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#64748b').text('f(x) = x²')

    if (snapZone) {
      svg.append('text')
        .attr('x', W / 2)
        .attr('y', H - 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('font-weight', 700)
        .attr('fill', '#10b981')
        .text('SNAP: secant has converged to local tangent behavior')
    }

  }, [h, x0, showTangent, snapZone])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <SliderControl
          label="Focus point x0"
          min={0.5} max={3} step={0.05}
          value={x0} onChange={setX0}
        />
        <SliderControl
          label="Scrub the limit: h (interval width)"
          min={0.05} max={2.5} step={0.05}
          value={h} onChange={setH}
        />
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
          <input type="checkbox" checked={showTangent} onChange={(e) => setShowTangent(e.target.checked)} className="accent-brand-500" />
          Show tangent line (h → 0 limit)
        </label>
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        Drag h toward 0 and watch the snap zone: secant (interval) converges to tangent (instantaneous). For this x0, target slope is {(2 * x0).toFixed(2)}.
      </p>
    </div>
  )
}
