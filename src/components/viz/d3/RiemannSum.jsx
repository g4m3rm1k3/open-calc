import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 340, M = { top: 20, right: 20, bottom: 40, left: 50 }

export default function RiemannSum() {
  const svgRef = useRef(null)
  const [n, setN] = useState(4)
  const [type, setType] = useState('left') // left | right | mid

  const f = (x) => x * x  // f(x) = x²
  const a = 0, b = 2
  const exact = 8 / 3  // ∫₀² x² dx

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xSc = d3.scaleLinear().domain([a - 0.3, b + 0.3]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([-0.3, 4.5]).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(6).forEach((t) => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(5).forEach((t) => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    svg.append('g').attr('transform', `translate(0,${ySc(0)})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${xSc(0)},0)`).call(d3.axisLeft(ySc).ticks(5)).attr('color', '#94a3b8')

    const dx = (b - a) / n
    let approx = 0
    for (let i = 0; i < n; i++) {
      const x_left = a + i * dx
      const x_mid = x_left + dx / 2
      const x_right = x_left + dx
      const sampleX = type === 'left' ? x_left : type === 'right' ? x_right : x_mid
      const height = f(sampleX)
      approx += height * dx

      // Rectangle
      svg.append('rect')
        .attr('x', xSc(x_left))
        .attr('y', ySc(Math.max(0, height)))
        .attr('width', xSc(x_right) - xSc(x_left))
        .attr('height', Math.abs(ySc(0) - ySc(height)))
        .attr('fill', '#6470f1')
        .attr('opacity', 0.35)
        .attr('stroke', '#6470f1')
        .attr('stroke-width', 1)

      // Sample point dot
      svg.append('circle').attr('cx', xSc(sampleX)).attr('cy', ySc(f(sampleX))).attr('r', 3).attr('fill', '#6470f1')
    }

    // Curve
    const pts = d3.range(a, b + 0.01, 0.01).map((x) => [x, f(x)])
    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y))
    svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', '#ef4444').attr('stroke-width', 2.5).attr('d', line)

    // Error display
    const error = approx - exact
    svg.append('text').attr('x', W / 2).attr('y', M.top + 10).attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#64748b')
      .text(`Approx = ${approx.toFixed(4)}, Exact = ${exact.toFixed(4)}, Error = ${Math.abs(error).toFixed(4)}`)

  }, [n, type])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <SliderControl label="Rectangles n" min={1} max={50} step={1} value={n} onChange={setN} format={(v) => v} />
        <div className="flex gap-2">
          {['left', 'right', 'mid'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                t === type
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)} Riemann
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-center text-slate-500 mt-2 italic">
        ∫₀² x² dx = 8/3 ≈ 2.6667. As n increases, the approximation approaches the exact value.
      </p>
    </div>
  )
}
