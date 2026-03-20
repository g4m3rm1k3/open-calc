import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 360
const M = { top: 30, right: 30, bottom: 45, left: 55 }

const CURVES = [
  {
    label: 'Circle x²+y²=r²',
    // parametric: t → (r cos t, r sin t)
    param: (t, r) => [r * Math.cos(t), r * Math.sin(t)],
    // dy/dx at point (x,y) = -x/y
    slope: (x, y) => -x / y,
    paramRange: [0, 2 * Math.PI + 0.01, 0.02],
    rDefault: 2,
    rLabel: 'Radius r',
    rMin: 0.5, rMax: 3, rStep: 0.1,
  },
  {
    label: 'Ellipse x²/4+y²=1',
    param: (t) => [2 * Math.cos(t), Math.sin(t)],
    slope: (x, y) => -x / (4 * y),
    paramRange: [0, 2 * Math.PI + 0.01, 0.02],
    rDefault: 1,
    rLabel: 'n/a',
    rMin: 1, rMax: 1, rStep: 1,
  },
  {
    label: 'Lemniscate (x²+y²)²=x²-y²',
    // r² = cos(2t) in polar → only when cos(2t)≥0
    param: (t) => {
      const r2 = Math.cos(2 * t)
      if (r2 < 0) return [NaN, NaN]
      const r = Math.sqrt(r2)
      return [r * Math.cos(t), r * Math.sin(t)]
    },
    slope: (x, y) => {
      // Implicit: (x²+y²)² = x²-y² → dy/dx = (x - 2x(x²+y²)) / (y + 2y(x²+y²))
      const s = x * x + y * y
      return (x - 2 * x * s) / (y + 2 * y * s)
    },
    paramRange: [0, 2 * Math.PI + 0.01, 0.005],
    rDefault: 1,
    rLabel: 'n/a',
    rMin: 1, rMax: 1, rStep: 1,
  },
]

export default function ImplicitCurveExplorer({ params }) {
  const svgRef = useRef(null)
  const [curveIdx, setCurveIdx] = useState(0)
  const [tPos, setTPos] = useState(Math.PI / 4)
  const [r, setR] = useState(2)

  const curve = CURVES[curveIdx]

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xSc = d3.scaleLinear().domain([-3.5, 3.5]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([-3.5, 3.5]).range([H - M.bottom, M.top])
    const lineFn = d3.line().x(([x]) => xSc(x)).y(([y]) => ySc(y)).defined(([x]) => isFinite(x))

    // Grid
    xSc.ticks(7).forEach(t => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(7).forEach(t => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes
    svg.append('g').attr('transform', `translate(0,${ySc(0)})`).call(d3.axisBottom(xSc).ticks(7)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${xSc(0)},0)`).call(d3.axisLeft(ySc).ticks(7)).attr('color', '#94a3b8')

    // Curve (parametric)
    const [tStart, tEnd, tStep] = curve.paramRange
    const pts = d3.range(tStart, tEnd, tStep).map(t => curve.param(t, r))
    svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', lineFn)

    // Point on curve
    const [px, py] = curve.param(tPos, r)
    if (isFinite(px) && isFinite(py)) {
      svg.append('circle').attr('cx', xSc(px)).attr('cy', ySc(py)).attr('r', 6).attr('fill', '#6470f1')

      // Tangent line
      const m = curve.slope(px, py)
      if (isFinite(m)) {
        const tanY = (x) => py + m * (x - px)
        const ext = 1.5
        svg.append('path').datum([[px - ext, tanY(px - ext)], [px + ext, tanY(px + ext)]])
          .attr('fill', 'none').attr('stroke', '#f59e0b').attr('stroke-width', 2)
          .attr('d', lineFn)
        svg.append('text').attr('x', xSc(px) + 10).attr('y', ySc(py) - 12).attr('font-size', 11).attr('fill', '#f59e0b')
          .text(`dy/dx = ${m.toFixed(3)}`)
      } else {
        // Vertical tangent
        svg.append('line').attr('x1', xSc(px)).attr('x2', xSc(px)).attr('y1', ySc(py - 2)).attr('y2', ySc(py + 2)).attr('stroke', '#f59e0b').attr('stroke-width', 2)
        svg.append('text').attr('x', xSc(px) + 10).attr('y', ySc(py) - 12).attr('font-size', 11).attr('fill', '#f59e0b').text('vertical tangent')
      }

      // Coord label
      svg.append('text').attr('x', xSc(px) + 10).attr('y', ySc(py) + 16).attr('font-size', 10).attr('fill', '#64748b')
        .text(`(${px.toFixed(2)}, ${py.toFixed(2)})`)
    }

    // Title
    svg.append('text').attr('x', W / 2).attr('y', 18).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#64748b').text(curve.label)
  }, [curveIdx, tPos, r, curve])

  const showR = curve.rMin !== curve.rMax

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <div className="flex gap-2 flex-wrap">
          {CURVES.map((c, i) => (
            <button key={i} onClick={() => { setCurveIdx(i); setTPos(Math.PI / 4); setR(CURVES[i].rDefault) }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${i === curveIdx ? 'bg-brand-600 text-white border-brand-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-brand-400'}`}>
              {c.label.split(' ')[0]}
            </button>
          ))}
        </div>
        <SliderControl label="Parameter t (point on curve)" min={0} max={2 * Math.PI} step={0.05} value={tPos} onChange={setTPos} />
        {showR && <SliderControl label={`${curve.rLabel} = ${r.toFixed(1)}`} min={curve.rMin} max={curve.rMax} step={curve.rStep} value={r} onChange={setR} />}
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        The tangent slope (dy/dx) at each point is found by implicit differentiation — no need to solve for y explicitly.
      </p>
    </div>
  )
}
