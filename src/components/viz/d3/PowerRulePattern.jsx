import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 340
const M = { top: 30, right: 30, bottom: 50, left: 55 }

export default function PowerRulePattern({ params }) {
  const svgRef = useRef(null)
  const [n, setN] = useState(3)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xSc = d3.scaleLinear().domain([-2.2, 2.2]).range([M.left, W - M.right])
    const yMax = Math.max(Math.pow(2.2, n), n * Math.pow(2.2, n - 1)) * 0.8
    const ySc = d3.scaleLinear().domain([-yMax * 0.5, yMax]).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(8).forEach((t) =>
      svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom)
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    )
    ySc.ticks(6).forEach((t) =>
      svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    )

    // Axes
    const yAxisPos = Math.max(M.left, Math.min(W - M.right, xSc(0)))
    const xAxisPos = Math.max(M.top, Math.min(H - M.bottom, ySc(0)))
    svg.append('g').attr('transform', `translate(0,${xAxisPos})`).call(d3.axisBottom(xSc).ticks(8)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${yAxisPos},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y)).defined(([, y]) => isFinite(y))

    // f(x) = x^n
    const fPts = d3.range(-2.2, 2.21, 0.02).map((x) => [x, Math.pow(x, n)])
    svg.append('path').datum(fPts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', line)

    // f'(x) = n * x^(n-1)
    const dPts = d3.range(-2.2, 2.21, 0.02).map((x) => [x, n * Math.pow(x, n - 1)])
    svg.append('path').datum(dPts).attr('fill', 'none').attr('stroke', '#10b981').attr('stroke-width', 2).attr('stroke-dasharray', '6,3').attr('d', line)

    // Legend
    const legend = svg.append('g').attr('transform', `translate(${W - M.right - 160}, ${M.top + 5})`)
    legend.append('rect').attr('width', 155).attr('height', 50).attr('rx', 6).attr('fill', 'white').attr('fill-opacity', 0.85).attr('stroke', '#e2e8f0')
    legend.append('line').attr('x1', 8).attr('x2', 30).attr('y1', 16).attr('y2', 16).attr('stroke', '#6470f1').attr('stroke-width', 2.5)
    legend.append('text').attr('x', 36).attr('y', 20).attr('font-size', 12).attr('fill', '#6470f1').text(`f(x) = x${n === 1 ? '' : n > 0 ? superscript(n) : ''}`)
    legend.append('line').attr('x1', 8).attr('x2', 30).attr('y1', 36).attr('y2', 36).attr('stroke', '#10b981').attr('stroke-width', 2).attr('stroke-dasharray', '6,3')
    legend.append('text').attr('x', 36).attr('y', 40).attr('font-size', 12).attr('fill', '#10b981').text(`f′(x) = ${n}x${n - 1 === 0 ? '' : n - 1 === 1 ? '' : superscript(n - 1)}`)

    // Title annotation
    svg.append('text').attr('x', W / 2).attr('y', 18).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#64748b')
      .text(`Power Rule: d/dx[x^${n}] = ${n}x^${n - 1}`)
  }, [n])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2">
        <SliderControl label="Exponent n" min={1} max={6} step={1} value={n} onChange={setN} />
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        The green dashed line is the derivative f′(x) = {n}x{n - 1 === 0 ? '' : `^${n - 1}`}. Notice how the derivative's degree is always one less.
      </p>
    </div>
  )
}

function superscript(n) {
  const sup = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹']
  return n < 0 ? '⁻' + sup[-n] : String(n).split('').map(d => sup[+d]).join('')
}
