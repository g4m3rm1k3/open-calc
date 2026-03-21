import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 400
const M = { top: 20, right: 30, bottom: 40, left: 50 }

// Implicit curves as contour levels
const CURVES = {
  circle: { label: 'x² + y² = 25', F: (x, y) => x * x + y * y - 25, Fx: (x, y) => 2 * x, Fy: (x, y) => 2 * y, range: [-6, 6] },
  folium: { label: 'x³ + y³ = 6xy', F: (x, y) => x ** 3 + y ** 3 - 6 * x * y, Fx: (x, y) => 3 * x * x - 6 * y, Fy: (x, y) => 3 * y * y - 6 * x, range: [-4, 8] },
  ellipse: { label: 'x²/9 + y²/4 = 1', F: (x, y) => x * x / 9 + y * y / 4 - 1, Fx: (x, y) => 2 * x / 9, Fy: (x, y) => 2 * y / 4, range: [-5, 5] },
}

// March across a grid to find zero-contour line segments
function traceContour(F, range, res = 200) {
  const [lo, hi] = range
  const step = (hi - lo) / res
  const segs = []
  for (let i = 0; i < res; i++) {
    for (let j = 0; j < res; j++) {
      const x0 = lo + i * step, y0 = lo + j * step
      const x1 = x0 + step, y1 = y0 + step
      const v00 = F(x0, y0), v10 = F(x1, y0), v01 = F(x0, y1), v11 = F(x1, y1)
      // Simple marching squares: if sign change across any edge, approximate crossing
      const pts = []
      if (v00 * v10 < 0) pts.push([x0 - v00 / (v10 - v00) * step, y0])
      if (v10 * v11 < 0) pts.push([x1, y0 - v10 / (v11 - v10) * step])
      if (v01 * v11 < 0) pts.push([x0 - v01 / (v11 - v01) * step, y1])
      if (v00 * v01 < 0) pts.push([x0, y0 - v00 / (v01 - v00) * step])
      if (pts.length >= 2) segs.push([pts[0], pts[1]])
    }
  }
  return segs
}

export default function TangentToImplicitCurve({ params }) {
  const svgRef = useRef(null)
  const [curveKey, setCurveKey] = useState('circle')
  const [pointT, setPointT] = useState(0.6)
  const [showNormal, setShowNormal] = useState(params?.showNormalLine ?? false)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const curve = CURVES[curveKey]
    const [lo, hi] = curve.range
    const xSc = d3.scaleLinear().domain([lo, hi]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([lo, hi]).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(6).forEach((t) => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(6).forEach((t) => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes
    svg.append('g').attr('transform', `translate(0,${ySc(0)})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${xSc(0)},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    // Draw implicit curve via marching squares
    const segs = traceContour(curve.F, curve.range, 250)
    segs.forEach(([[x0, y0], [x1, y1]]) => {
      svg.append('line').attr('x1', xSc(x0)).attr('x2', xSc(x1)).attr('y1', ySc(y0)).attr('y2', ySc(y1)).attr('stroke', '#6470f1').attr('stroke-width', 2)
    })

    // Pick a point on the curve — parametrize via angle for circle, else via collected contour points
    let px, py
    if (curveKey === 'circle') {
      const theta = pointT * 2 * Math.PI
      px = 5 * Math.cos(theta); py = 5 * Math.sin(theta)
    } else if (curveKey === 'ellipse') {
      const theta = pointT * 2 * Math.PI
      px = 3 * Math.cos(theta); py = 2 * Math.sin(theta)
    } else {
      // folium — parametric: x = 6t/(1+t³), y = 6t²/(1+t³)
      const t = -1.5 + pointT * 5
      const d = 1 + t * t * t
      if (Math.abs(d) < 0.01) { px = 3; py = 3 } else { px = 6 * t / d; py = 6 * t * t / d }
    }

    const fx = curve.Fx(px, py)
    const fy = curve.Fy(px, py)

    if (Math.abs(fy) > 0.001) {
      const dydx = -fx / fy
      // Tangent line
      const tanLen = (hi - lo) * 0.4
      const dx = tanLen / Math.sqrt(1 + dydx * dydx)
      svg.append('line').attr('x1', xSc(px - dx)).attr('x2', xSc(px + dx)).attr('y1', ySc(py - dydx * dx)).attr('y2', ySc(py + dydx * dx)).attr('stroke', '#10b981').attr('stroke-width', 2.5)

      svg.append('text').attr('x', xSc(px + dx * 0.6)).attr('y', ySc(py + dydx * dx * 0.6) - 12).attr('font-size', 11).attr('fill', '#10b981').text(`slope = ${dydx.toFixed(3)}`)

      // Normal line
      if (showNormal) {
        const normSlope = -1 / dydx
        const ndx = tanLen * 0.3 / Math.sqrt(1 + normSlope * normSlope)
        svg.append('line').attr('x1', xSc(px - ndx)).attr('x2', xSc(px + ndx)).attr('y1', ySc(py - normSlope * ndx)).attr('y2', ySc(py + normSlope * ndx)).attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('stroke-dasharray', '5,3')
      }
    }

    // Point
    svg.append('circle').attr('cx', xSc(px)).attr('cy', ySc(py)).attr('r', 6).attr('fill', '#6470f1')
    svg.append('text').attr('x', xSc(px) + 10).attr('y', ySc(py) - 10).attr('font-size', 11).attr('fill', '#6470f1').text(`(${px.toFixed(2)}, ${py.toFixed(2)})`)

    // Title
    svg.append('text').attr('x', W / 2).attr('y', 15).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#64748b').text(curve.label)

  }, [curveKey, pointT, showNormal])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <div className="flex gap-2 flex-wrap">
          {Object.entries(CURVES).map(([key, c]) => (
            <button key={key} onClick={() => setCurveKey(key)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${key === curveKey ? 'bg-brand-500 text-white border-brand-500' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-brand-400'}`}
            >{c.label}</button>
          ))}
        </div>
        <SliderControl label="Move point along curve" min={0.01} max={0.99} step={0.01} value={pointT} onChange={setPointT} />
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
          <input type="checkbox" checked={showNormal} onChange={(e) => setShowNormal(e.target.checked)} className="accent-brand-500" />
          Show normal line (perpendicular)
        </label>
      </div>
    </div>
  )
}
