import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 340
const M = { top: 30, right: 30, bottom: 45, left: 55 }

export default function ExponentialSlopeAtZero({ params }) {
  const svgRef = useRef(null)
  const [base, setBase] = useState(Math.E)
  const [showDeriv, setShowDeriv] = useState(true)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xSc = d3.scaleLinear().domain([-3, 3]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([-0.3, 8]).range([H - M.bottom, M.top])
    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y)).defined(([, y]) => isFinite(y) && y <= 8.5)

    // Grid
    xSc.ticks(7).forEach((t) =>
      svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom)
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    )
    ySc.ticks(6).forEach((t) =>
      svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    )

    // Axes
    svg.append('g').attr('transform', `translate(0,${ySc(0)})`).call(d3.axisBottom(xSc).ticks(7)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${xSc(0)},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    const xs = d3.range(-3, 3.02, 0.02)

    // a^x
    const aFn = (x) => Math.pow(base, x)
    svg.append('path').datum(xs.map(x => [x, aFn(x)])).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', line)

    // Derivative: ln(base) * base^x
    const lnBase = Math.log(base)
    if (showDeriv) {
      svg.append('path').datum(xs.map(x => [x, lnBase * aFn(x)])).attr('fill', 'none').attr('stroke', '#10b981').attr('stroke-width', 2).attr('stroke-dasharray', '6,3').attr('d', line)
    }

    // Tangent line at x=0
    const slopeAt0 = lnBase  // derivative of a^x at x=0 is ln(a)
    const tanLine = (x) => 1 + slopeAt0 * x
    svg.append('path').datum([[-2, tanLine(-2)], [2, tanLine(2)]]).attr('fill', 'none').attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('d', line)
    svg.append('circle').attr('cx', xSc(0)).attr('cy', ySc(1)).attr('r', 6).attr('fill', '#6470f1')

    // Label slope at origin
    const isE = Math.abs(base - Math.E) < 0.02
    svg.append('text').attr('x', xSc(0.15)).attr('y', ySc(1.5)).attr('font-size', 11).attr('fill', '#f59e0b')
      .text(`slope at x=0: ln(${isE ? 'e' : base.toFixed(2)}) = ${slopeAt0.toFixed(3)}`)

    if (isE) {
      svg.append('text').attr('x', xSc(0.15)).attr('y', ySc(1.5) + 16).attr('font-size', 11).attr('fill', '#f59e0b').text('= 1 ✓ (e is special!)')
    }

    // Legend
    const lg = svg.append('g').attr('transform', `translate(${M.left + 10}, ${M.top + 5})`)
    lg.append('rect').attr('width', 190).attr('height', showDeriv ? 72 : 50).attr('rx', 6).attr('fill', 'white').attr('fill-opacity', 0.9).attr('stroke', '#e2e8f0')
    const bLabel = isE ? 'e' : base.toFixed(2)
    lg.append('line').attr('x1', 8).attr('x2', 30).attr('y1', 16).attr('y2', 16).attr('stroke', '#6470f1').attr('stroke-width', 2.5)
    lg.append('text').attr('x', 36).attr('y', 20).attr('font-size', 12).attr('fill', '#6470f1').text(`f(x) = ${bLabel}^x`)
    lg.append('line').attr('x1', 8).attr('x2', 30).attr('y1', 36).attr('y2', 36).attr('stroke', '#f59e0b').attr('stroke-width', 2)
    lg.append('text').attr('x', 36).attr('y', 40).attr('font-size', 12).attr('fill', '#f59e0b').text('tangent at x = 0')
    if (showDeriv) {
      lg.append('line').attr('x1', 8).attr('x2', 30).attr('y1', 56).attr('y2', 56).attr('stroke', '#10b981').attr('stroke-width', 2).attr('stroke-dasharray', '6,3')
      lg.append('text').attr('x', 36).attr('y', 60).attr('font-size', 12).attr('fill', '#10b981').text(`f′(x) = ln(${bLabel})·${bLabel}^x`)
    }
  }, [base, showDeriv])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <SliderControl label={`Base a = ${Math.abs(base - Math.E) < 0.02 ? 'e ≈ 2.718' : base.toFixed(2)}`} min={1.1} max={5} step={0.05} value={base} onChange={setBase} />
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
          <input type="checkbox" checked={showDeriv} onChange={(e) => setShowDeriv(e.target.checked)} className="accent-brand-500" />
          Show derivative curve
        </label>
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        When base = e ≈ 2.718, the slope of the curve at x = 0 equals exactly 1. That is what makes e the natural base.
      </p>
    </div>
  )
}
