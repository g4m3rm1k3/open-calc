import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 340
const M = { top: 30, right: 20, bottom: 45, left: 55 }

const PRESETS = [
  {
    label: 'f(x) = x² − x',
    f: (x) => x * x - x,
    fPrime: (x) => 2 * x - 1,
    domain: [-0.5, 3.5],
    yDomain: [-0.6, 8],
    defaultA: 0.5,
    defaultB: 3,
  },
  {
    label: 'f(x) = sin(x)',
    f: (x) => Math.sin(x),
    fPrime: (x) => Math.cos(x),
    domain: [0, 7],
    yDomain: [-1.3, 1.3],
    defaultA: 0.3,
    defaultB: 2.8,
  },
  {
    label: 'f(x) = x³ − 3x',
    f: (x) => x * x * x - 3 * x,
    fPrime: (x) => 3 * x * x - 3,
    domain: [-2.2, 2.2],
    yDomain: [-4, 4],
    defaultA: -1.5,
    defaultB: 1.5,
  },
]

// Find c numerically via bisection: solve fPrime(c) = secSlope on [a,b]
function findMVTPoint(fPrime, secSlope, a, b, tol = 1e-6) {
  const h = (x) => fPrime(x) - secSlope
  // Search for sign changes in sub-intervals
  const n = 200
  const step = (b - a) / n
  const results = []
  for (let i = 0; i < n; i++) {
    const x0 = a + i * step
    const x1 = x0 + step
    if (h(x0) * h(x1) <= 0) {
      // Bisect on [x0, x1]
      let lo = x0, hi = x1
      for (let iter = 0; iter < 50; iter++) {
        const mid = (lo + hi) / 2
        if (Math.abs(hi - lo) < tol) break
        if (h(lo) * h(mid) <= 0) hi = mid
        else lo = mid
      }
      const c = (lo + hi) / 2
      if (c > a && c < b) results.push(c)
    }
  }
  return results
}

export default function MVTViz() {
  const svgRef = useRef(null)
  const [fnIdx, setFnIdx] = useState(0)
  const [aVal, setAVal] = useState(PRESETS[0].defaultA)
  const [bVal, setBVal] = useState(PRESETS[0].defaultB)

  const preset = PRESETS[fnIdx]
  const { f, fPrime, domain, yDomain } = preset

  // Clamp and order a, b
  const a = Math.min(aVal, bVal - 0.1)
  const b = Math.max(bVal, aVal + 0.1)

  const secSlope = Math.abs(b - a) > 0.001 ? (f(b) - f(a)) / (b - a) : 0
  const cPoints = findMVTPoint(fPrime, secSlope, a, b)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xSc = d3.scaleLinear().domain(domain).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain(yDomain).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(7).forEach((t) => {
      svg.append('line')
        .attr('x1', xSc(t)).attr('x2', xSc(t))
        .attr('y1', M.top).attr('y2', H - M.bottom)
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })
    ySc.ticks(6).forEach((t) => {
      svg.append('line')
        .attr('x1', M.left).attr('x2', W - M.right)
        .attr('y1', ySc(t)).attr('y2', ySc(t))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })

    // Axes
    const xAxisY = Math.max(M.top, Math.min(H - M.bottom, ySc(0)))
    const yAxisX = Math.max(M.left, Math.min(W - M.right, xSc(0)))
    svg.append('g').attr('transform', `translate(0,${xAxisY})`).call(d3.axisBottom(xSc).ticks(7)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${yAxisX},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    const lineFn = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y))
      .defined(([, y]) => isFinite(y) && y > yDomain[0] - 2 && y < yDomain[1] + 2)

    // Curve f(x) in blue
    const pts = d3.range(domain[0], domain[1] + 0.01, (domain[1] - domain[0]) / 300).map((x) => [x, f(x)])
    svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', lineFn)

    // Secant line in amber
    const secLine = (x) => f(a) + secSlope * (x - a)
    const secPts = [[domain[0], secLine(domain[0])], [domain[1], secLine(domain[1])]]
    svg.append('path').datum(secPts).attr('fill', 'none').attr('stroke', '#f59e0b')
      .attr('stroke-width', 2).attr('stroke-dasharray', '8,4').attr('d', lineFn)

    // Endpoint circles
    svg.append('circle').attr('cx', xSc(a)).attr('cy', ySc(f(a))).attr('r', 7).attr('fill', '#f59e0b')
    svg.append('circle').attr('cx', xSc(b)).attr('cy', ySc(f(b))).attr('r', 7).attr('fill', '#f59e0b')
    svg.append('text').attr('x', xSc(a) - 4).attr('y', ySc(f(a)) - 10)
      .attr('font-size', 11).attr('fill', '#f59e0b').attr('text-anchor', 'middle').text('a')
    svg.append('text').attr('x', xSc(b) + 4).attr('y', ySc(f(b)) - 10)
      .attr('font-size', 11).attr('fill', '#f59e0b').attr('text-anchor', 'middle').text('b')

    // Tangent lines at each c in green
    cPoints.forEach((c, idx) => {
      const fc = f(c)
      const tanLine = (x) => fc + fPrime(c) * (x - c)
      const extLeft = Math.max(domain[0], c - 1.2)
      const extRight = Math.min(domain[1], c + 1.2)
      const tanPts = [[extLeft, tanLine(extLeft)], [extRight, tanLine(extRight)]]
      svg.append('path').datum(tanPts).attr('fill', 'none').attr('stroke', '#10b981')
        .attr('stroke-width', 2.5).attr('d', lineFn)

      // Vertical dashed line at c
      svg.append('line')
        .attr('x1', xSc(c)).attr('x2', xSc(c))
        .attr('y1', ySc(fc) + 6).attr('y2', H - M.bottom)
        .attr('stroke', '#10b981').attr('stroke-dasharray', '4,3').attr('stroke-width', 1.5)

      svg.append('circle').attr('cx', xSc(c)).attr('cy', ySc(fc)).attr('r', 6).attr('fill', '#10b981')
      svg.append('text').attr('x', xSc(c)).attr('y', H - M.bottom + 14)
        .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#10b981')
        .text(`c${cPoints.length > 1 ? idx + 1 : ''} = ${c.toFixed(3)}`)
    })

    // Labels at top
    svg.append('text').attr('x', M.left + 6).attr('y', M.top + 16)
      .attr('font-size', 12).attr('fill', '#6470f1').text(preset.label)

    const slopeText = `Secant slope = (f(b)−f(a))/(b−a) = ${secSlope.toFixed(4)}`
    svg.append('text').attr('x', W / 2).attr('y', H - M.bottom + 35)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#f59e0b').text(slopeText)

    if (cPoints.length > 0) {
      const cText = cPoints.map((c, i) => `f'(c${cPoints.length > 1 ? i + 1 : ''}) = ${fPrime(c).toFixed(4)}`).join('  |  ')
      svg.append('text').attr('x', W / 2).attr('y', M.top + 16)
        .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#10b981').text(cText)
    }

  }, [fnIdx, a, b, cPoints, preset, domain, yDomain, f, fPrime, secSlope])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => { setFnIdx(i); setAVal(p.defaultA); setBVal(p.defaultB) }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${fnIdx === i ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <SliderControl
          label="a (left endpoint)"
          min={PRESETS[fnIdx].domain[0] + 0.1} max={PRESETS[fnIdx].domain[1] - 0.2}
          step={0.05} value={aVal} onChange={setAVal}
          format={(v) => v.toFixed(2)}
        />
        <SliderControl
          label="b (right endpoint)"
          min={PRESETS[fnIdx].domain[0] + 0.2} max={PRESETS[fnIdx].domain[1] - 0.1}
          step={0.05} value={bVal} onChange={setBVal}
          format={(v) => v.toFixed(2)}
        />
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        Amber dashed: secant from a to b. Green solid: tangent at c where f′(c) = average slope. At least one such c always exists (MVT).
      </p>
    </div>
  )
}
