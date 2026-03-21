import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 360
const M = { top: 30, right: 30, bottom: 40, left: 55 }

export default function EpsilonDelta({ params }) {
  const svgRef = useRef(null)
  const { 
    fn = '2*x + 1', 
    c = 2, 
    L = 5,
    getDelta = (e) => e / 2 // Default delta for 2x+1
  } = params ?? {}
  const [epsilon, setEpsilon] = useState(1.0)

  const delta = typeof getDelta === 'string' 
    ? (new Function('e', `"use strict"; return ${getDelta}`))(epsilon)
    : getDelta(epsilon)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // eslint-disable-next-line no-new-func
    const f = new Function('x', `"use strict"; return ${fn}`)

    const xSc = d3.scaleLinear().domain([c - 3, c + 3]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([L - 3.5, L + 3.5]).range([H - M.bottom, M.top])

    // Epsilon band (horizontal)
    const bandTop = ySc(L + epsilon)
    const bandBot = ySc(L - epsilon)
    svg.append('rect').attr('x', M.left).attr('width', W - M.left - M.right)
      .attr('y', bandTop).attr('height', bandBot - bandTop)
      .attr('fill', '#f59e0b').attr('opacity', 0.15)

    // Delta band (vertical)
    const dBandLeft = xSc(c - delta)
    const dBandRight = xSc(c + delta)
    svg.append('rect').attr('x', dBandLeft).attr('width', dBandRight - dBandLeft)
      .attr('y', M.top).attr('height', H - M.top - M.bottom)
      .attr('fill', '#6470f1').attr('opacity', 0.15)

    // Grid
    xSc.ticks(6).forEach((t) => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(6).forEach((t) => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Epsilon lines
    svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(L + epsilon)).attr('y2', ySc(L + epsilon)).attr('stroke', '#f59e0b').attr('stroke-width', 1.5).attr('stroke-dasharray', '6,3')
    svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(L - epsilon)).attr('y2', ySc(L - epsilon)).attr('stroke', '#f59e0b').attr('stroke-width', 1.5).attr('stroke-dasharray', '6,3')
    svg.append('text').attr('x', M.left + 4).attr('y', ySc(L + epsilon) - 4).attr('font-size', 10).attr('fill', '#f59e0b').text(`L + ε = ${(L + epsilon).toFixed(2)}`)
    svg.append('text').attr('x', M.left + 4).attr('y', ySc(L - epsilon) + 12).attr('font-size', 10).attr('fill', '#f59e0b').text(`L - ε = ${(L - epsilon).toFixed(2)}`)

    // Delta lines
    svg.append('line').attr('x1', xSc(c - delta)).attr('x2', xSc(c - delta)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#6470f1').attr('stroke-width', 1.5).attr('stroke-dasharray', '6,3')
    svg.append('line').attr('x1', xSc(c + delta)).attr('x2', xSc(c + delta)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#6470f1').attr('stroke-width', 1.5).attr('stroke-dasharray', '6,3')
    svg.append('text').attr('x', xSc(c - delta)).attr('y', M.top - 8).attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#6470f1').text(`c-δ`)
    svg.append('text').attr('x', xSc(c + delta)).attr('y', M.top - 8).attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#6470f1').text(`c+δ`)

    // Axes
    svg.append('g').attr('transform', `translate(0,${ySc(0) < M.top ? M.top : ySc(0) > H - M.bottom ? H - M.bottom : ySc(0)})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${xSc(0) < M.left ? M.left : xSc(0)},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    // Curve
    const pts = d3.range(c - 3, c + 3.01, 0.02).filter((x) => Math.abs(x - c) > 1e-8).map((x) => {
      try { const y = f(x); return isFinite(y) ? [x, y] : null } catch { return null }
    }).filter(Boolean)
    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y))
    svg.append('path').datum(pts.filter(([x]) => x < c)).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', line)
    svg.append('path').datum(pts.filter(([x]) => x > c)).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', line)

    // Hole at (c, L)
    svg.append('circle').attr('cx', xSc(c)).attr('cy', ySc(L)).attr('r', 6).attr('fill', 'white').attr('stroke', '#6470f1').attr('stroke-width', 2)

    // Labels
    svg.append('text').attr('x', xSc(c)).attr('y', H - M.bottom + 28).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#6470f1').text(`c = ${c}`)
    svg.append('line').attr('x1', M.left).attr('x2', xSc(c)).attr('y1', ySc(L)).attr('y2', ySc(L)).attr('stroke', '#f59e0b').attr('stroke-width', 1).attr('stroke-dasharray', '3,3')
    svg.append('text').attr('x', M.left - 4).attr('y', ySc(L) + 4).attr('text-anchor', 'end').attr('font-size', 12).attr('fill', '#f59e0b').attr('font-weight', 600).text(`L=${L}`)

    // ε label
    svg.append('text').attr('x', W - M.right + 4).attr('y', ySc(L + epsilon / 2)).attr('font-size', 12).attr('fill', '#f59e0b').attr('dominant-baseline', 'middle').text(`ε=${epsilon.toFixed(2)}`)
    // δ label
    svg.append('text').attr('x', xSc(c)).attr('y', M.top - 18).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#6470f1').text(`δ=${delta.toFixed(3)}`)

    // Title
    svg.append('text').attr('x', W / 2).attr('y', 15).attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#64748b').text(`f(x) = ${fn}`)

  }, [fn, c, L, epsilon, delta])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2">
        <SliderControl label="ε (epsilon)" min={0.05} max={2} step={0.05} value={epsilon} onChange={setEpsilon} />
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        Yellow band = ε-tolerance on output. Purple band = δ-tolerance on input. When x is within δ of c (purple), f(x) is within ε of L (yellow).
      </p>
    </div>
  )
}
