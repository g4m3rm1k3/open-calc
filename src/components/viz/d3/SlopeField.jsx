import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 380
const M = { top: 20, right: 30, bottom: 40, left: 50 }

const FUNCTIONS = [
  { label: 'f(x) = x²', fn: (x) => x * x, deriv: (x) => 2 * x },
  { label: 'f(x) = sin(x)', fn: Math.sin, deriv: Math.cos },
  { label: 'f(x) = eˣ', fn: Math.exp, deriv: Math.exp },
  { label: 'f(x) = x³ - x', fn: (x) => x ** 3 - x, deriv: (x) => 3 * x * x - 1 },
]

export default function SlopeField({ params }) {
  const svgRef = useRef(null)
  const [fnIdx, setFnIdx] = useState(0)
  const [density, setDensity] = useState(12)
  const [showCurve, setShowCurve] = useState(true)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { fn, deriv, label } = FUNCTIONS[fnIdx]
    const xSc = d3.scaleLinear().domain([-3, 3]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([-3, 3]).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(6).forEach((t) => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#f1f5f9').attr('stroke-width', 1))
    ySc.ticks(6).forEach((t) => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#f1f5f9').attr('stroke-width', 1))

    // Axes
    svg.append('g').attr('transform', `translate(0,${ySc(0)})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${xSc(0)},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    // Slope field: small line segments
    const step = 6 / density
    const segLen = (W - M.left - M.right) / density * 0.35

    for (let xi = -3; xi <= 3; xi += step) {
      for (let yi = -3; yi <= 3; yi += step) {
        const slope = deriv(xi)
        const angle = Math.atan(slope)
        const dx = segLen * Math.cos(angle) / 2
        const dy = segLen * Math.sin(angle) / 2

        // Color by slope magnitude
        const absSl = Math.min(Math.abs(slope), 5)
        const color = d3.interpolateViridis(absSl / 5)

        svg.append('line')
          .attr('x1', xSc(xi) - dx)
          .attr('x2', xSc(xi) + dx)
          .attr('y1', ySc(yi) + dy * (xSc(1) - xSc(0)) / (ySc(0) - ySc(1)))
          .attr('y2', ySc(yi) - dy * (xSc(1) - xSc(0)) / (ySc(0) - ySc(1)))
          .attr('stroke', color).attr('stroke-width', 1.5).attr('opacity', 0.7)
      }
    }

    // Original function curve
    if (showCurve) {
      const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y)).defined(([, y]) => Math.abs(y) < 5)
      const pts = d3.range(-3, 3.02, 0.02).map((x) => [x, fn(x)])
      svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', '#ef4444').attr('stroke-width', 2.5).attr('d', line)
    }

    // Title
    svg.append('text').attr('x', W / 2).attr('y', 15).attr('text-anchor', 'middle')
      .attr('font-size', 12).attr('fill', '#64748b').text(`Slope Field for ${label} — each line shows f'(x) at that point`)

  }, [fnIdx, density, showCurve])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <div className="flex gap-2 flex-wrap">
          {FUNCTIONS.map((f, i) => (
            <button key={i} onClick={() => setFnIdx(i)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${i === fnIdx ? 'bg-brand-500 text-white border-brand-500' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-brand-400'}`}
            >{f.label}</button>
          ))}
        </div>
        <SliderControl label="Density" min={6} max={20} step={1} value={density} onChange={setDensity} />
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
          <input type="checkbox" checked={showCurve} onChange={(e) => setShowCurve(e.target.checked)} className="accent-brand-500" />
          Show original function (red curve)
        </label>
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        Each tiny line segment shows the derivative (slope) at that x-position. The derivative is not just a number at one point — it's a whole function, mapping every x to a slope. The red curve follows the flow of the slope field.
      </p>
    </div>
  )
}
