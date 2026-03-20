import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 600, H = 320
const M = { top: 20, right: 20, bottom: 40, left: 50 }

export default function ExponentialGrowth({ params }) {
  const svgRef = useRef(null)
  const [base, setBase] = useState(params?.base ?? Math.E)
  const [showLog, setShowLog] = useState(params?.showLog ?? false)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xSc = d3.scaleLinear().domain([-3, 3]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([-0.5, 8]).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(6).forEach((t) => {
      svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom)
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })
    ySc.ticks(6).forEach((t) => {
      svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })

    // Axes
    const yAxisX = Math.max(M.left, Math.min(xSc(0), W - M.right))
    const xAxisY = Math.max(M.top, Math.min(ySc(0), H - M.bottom))
    svg.append('g').attr('transform', `translate(0,${xAxisY})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${yAxisX},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    // b^x curve
    const expPts = d3.range(-3, 3.01, 0.02).map((x) => [x, Math.pow(base, x)]).filter(([, y]) => isFinite(y) && y > -1)
    const expLine = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y))
    svg.append('path').datum(expPts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', expLine)

    // Label
    svg.append('text').attr('x', xSc(2.5)).attr('y', ySc(Math.min(8, Math.pow(base, 2.5))) - 8)
      .attr('font-size', 13).attr('fill', '#6470f1').attr('font-weight', 600)
      .text(base === Math.E ? 'eˣ' : `${base.toFixed(2)}ˣ`)

    if (showLog) {
      // ln(x) or log_b(x)
      const logPts = d3.range(0.05, 8, 0.05).map((x) => [x, Math.log(x) / Math.log(base)]).filter(([, y]) => isFinite(y))
      const logLine = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y))
      svg.append('path').datum(logPts).attr('fill', 'none').attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('stroke-dasharray', '6,3').attr('d', logLine)
      // y = x line
      const idPts = [[-0.5, -0.5], [7, 7]]
      svg.append('path').datum(idPts).attr('fill', 'none').attr('stroke', '#94a3b8').attr('stroke-width', 1).attr('stroke-dasharray', '3,3')
        .attr('d', d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y)))
      svg.append('text').attr('x', xSc(7)).attr('y', ySc(6)).attr('font-size', 11).attr('fill', '#f59e0b')
        .text(base === Math.E ? 'ln(x)' : `log${base.toFixed(1)}(x)`)
    }

    // Point at x=1
    svg.append('circle').attr('cx', xSc(1)).attr('cy', ySc(base)).attr('r', 5).attr('fill', '#6470f1')
    svg.append('text').attr('x', xSc(1) + 8).attr('y', ySc(base) - 6).attr('font-size', 11).attr('fill', '#6470f1')
      .text(`(1, ${base.toFixed(3)})`)

  }, [base, showLog])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <SliderControl label="Base b" min={0.1} max={4} step={0.05} value={base} onChange={setBase} />
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
          <input type="checkbox" checked={showLog} onChange={(e) => setShowLog(e.target.checked)} className="accent-brand-500" />
          Show inverse (logarithm)
        </label>
      </div>
    </div>
  )
}
