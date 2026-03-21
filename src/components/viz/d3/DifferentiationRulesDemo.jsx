import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 360
const M = { top: 20, right: 30, bottom: 40, left: 50 }

const RULES = [
  { label: 'Power: xⁿ', fn: (x, n) => Math.pow(x, n), deriv: (x, n) => n * Math.pow(x, n - 1), color: '#6470f1' },
  { label: 'Product: f·g', fn: (x) => x * Math.sin(x), deriv: (x) => Math.sin(x) + x * Math.cos(x), color: '#10b981' },
  { label: 'Quotient: f/g', fn: (x) => x / (x * x + 1), deriv: (x) => (1 - x * x) / ((x * x + 1) ** 2), color: '#f59e0b' },
]

export default function DifferentiationRulesDemo({ params }) {
  const svgRef = useRef(null)
  const [ruleIdx, setRuleIdx] = useState(0)
  const [n, setN] = useState(3)
  const [showDeriv, setShowDeriv] = useState(true)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const rule = RULES[ruleIdx]
    const xSc = d3.scaleLinear().domain([-3, 3]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([-5, 5]).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(6).forEach((t) => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(6).forEach((t) => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes
    svg.append('g').attr('transform', `translate(0,${ySc(0)})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${xSc(0)},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y)).defined(([, y]) => Math.abs(y) < 10)

    // Function curve
    const pts = d3.range(-3, 3.02, 0.02).map((x) => [x, ruleIdx === 0 ? rule.fn(x, n) : rule.fn(x)])
    svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', rule.color).attr('stroke-width', 2.5).attr('d', line)

    // Derivative curve
    if (showDeriv) {
      const dPts = d3.range(-3, 3.02, 0.02).map((x) => [x, ruleIdx === 0 ? rule.deriv(x, n) : rule.deriv(x)])
      svg.append('path').datum(dPts).attr('fill', 'none').attr('stroke', rule.color).attr('stroke-width', 2).attr('stroke-dasharray', '6,3').attr('opacity', 0.7).attr('d', line)
    }

    // Labels
    svg.append('text').attr('x', W / 2).attr('y', 15).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#64748b').text(rule.label + (ruleIdx === 0 ? ` (n=${n})` : ''))
    svg.append('text').attr('x', W - M.right - 5).attr('y', M.top + 15).attr('text-anchor', 'end').attr('font-size', 11).attr('fill', rule.color).text('f(x)')
    if (showDeriv) svg.append('text').attr('x', W - M.right - 5).attr('y', M.top + 30).attr('text-anchor', 'end').attr('font-size', 11).attr('fill', rule.color).attr('opacity', 0.7).text("f'(x) (dashed)")

  }, [ruleIdx, n, showDeriv])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <div className="flex gap-2 flex-wrap">
          {RULES.map((r, i) => (
            <button key={i} onClick={() => setRuleIdx(i)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${i === ruleIdx ? 'bg-brand-500 text-white border-brand-500' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-brand-400'}`}
            >{r.label}</button>
          ))}
        </div>
        {ruleIdx === 0 && (
          <SliderControl label="n (exponent)" min={-3} max={5} step={0.5} value={n} onChange={setN} />
        )}
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
          <input type="checkbox" checked={showDeriv} onChange={(e) => setShowDeriv(e.target.checked)} className="accent-brand-500" />
          Show derivative (dashed)
        </label>
      </div>
    </div>
  )
}
