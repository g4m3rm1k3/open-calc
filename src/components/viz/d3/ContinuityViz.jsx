import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'

const W = 580, H = 320, M = { top: 20, right: 20, bottom: 40, left: 50 }

const DISCONTINUITIES = [
  {
    label: 'Removable (hole)',
    fn: (x) => Math.abs(x - 1) < 1e-8 ? null : (x * x - 1) / (x - 1),
    domain: [-1.5, 3.5], yDomain: [-1, 5],
    color: '#6470f1', description: 'Hole at x=1. Limit exists (=2), but f(1) is undefined.',
  },
  {
    label: 'Jump',
    fn: (x) => x < 1 ? x + 1 : x * x,
    domain: [-1.5, 3.5], yDomain: [-1, 10],
    color: '#f59e0b', description: 'Jump at x=1. Left limit = 2, right limit = 1. Different → limit DNE.',
    splitAt: 1,
  },
  {
    label: 'Infinite',
    fn: (x) => Math.abs(x) < 0.05 ? null : 1 / x,
    domain: [-2, 2], yDomain: [-8, 8],
    color: '#ef4444', description: 'Vertical asymptote at x=0. f(x) → ±∞.',
    splitAt: 0,
  },
  {
    label: 'Continuous',
    fn: (x) => x * x - x + 1,
    domain: [-1.5, 3.5], yDomain: [-1, 9],
    color: '#10b981', description: 'No discontinuities. Limit equals function value everywhere.',
  },
]

export default function ContinuityViz({ params }) {
  const svgRef = useRef(null)
  const [idx, setIdx] = useState(0)
  const { showIVT } = params ?? {}
  const disc = DISCONTINUITIES[idx]

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const [xMin, xMax] = disc.domain
    const [yMin, yMax] = disc.yDomain
    const xSc = d3.scaleLinear().domain([xMin, xMax]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([yMin, yMax]).range([H - M.bottom, M.top])

    xSc.ticks(6).forEach((t) => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(5).forEach((t) => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    const axY = Math.max(M.top, Math.min(ySc(0), H - M.bottom))
    const axX = Math.max(M.left, Math.min(xSc(0), W - M.right))
    svg.append('g').attr('transform', `translate(0,${axY})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${axX},0)`).call(d3.axisLeft(ySc).ticks(5)).attr('color', '#94a3b8')

    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y)).defined(([, y]) => y !== null)
    const allPts = d3.range(xMin, xMax + 0.01, 0.02)

    if (disc.splitAt !== undefined) {
      const split = disc.splitAt
      const leftPts = allPts.filter((x) => x < split - 0.02).map((x) => [x, disc.fn(x)])
      const rightPts = allPts.filter((x) => x > split + 0.02).map((x) => [x, disc.fn(x)])
      svg.append('path').datum(leftPts).attr('fill', 'none').attr('stroke', disc.color).attr('stroke-width', 2.5).attr('d', line)
      svg.append('path').datum(rightPts).attr('fill', 'none').attr('stroke', disc.color).attr('stroke-width', 2.5).attr('d', line)

      // Open/closed circles
      const yLeft = disc.fn(split - 0.001)
      const yRight = disc.fn(split + 0.001)
      if (yLeft !== null) svg.append('circle').attr('cx', xSc(split)).attr('cy', ySc(yLeft)).attr('r', 6).attr('fill', 'white').attr('stroke', disc.color).attr('stroke-width', 2)
      if (yRight !== null) svg.append('circle').attr('cx', xSc(split)).attr('cy', ySc(yRight)).attr('r', 5).attr('fill', disc.color)
    } else {
      const pts = allPts.map((x) => [x, disc.fn(x)])
      svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', disc.color).attr('stroke-width', 2.5).attr('d', line)
      // Hole for removable
      if (disc.label.includes('Removable')) {
        const holeY = 2  // limit value
        svg.append('circle').attr('cx', xSc(1)).attr('cy', ySc(holeY)).attr('r', 6).attr('fill', 'white').attr('stroke', disc.color).attr('stroke-width', 2)
      }
    }

    // IVT illustration
    if (showIVT && disc.label === 'Continuous') {
      const a = -1, b = 3
      const fa = disc.fn(a), fb = disc.fn(b)
      const k = (fa + fb) / 2
      const c = (a + b) / 2  // rough midpoint for illustration
      svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(k)).attr('y2', ySc(k)).attr('stroke', '#f59e0b').attr('stroke-width', 1.5).attr('stroke-dasharray', '5,3')
      svg.append('text').attr('x', M.left + 4).attr('y', ySc(k) - 4).attr('font-size', 10).attr('fill', '#f59e0b').text(`k = ${k.toFixed(2)}`)
      svg.append('circle').attr('cx', xSc(c)).attr('cy', ySc(disc.fn(c))).attr('r', 6).attr('fill', '#f59e0b')
      svg.append('text').attr('x', xSc(c) + 8).attr('y', ySc(disc.fn(c)) - 6).attr('font-size', 10).attr('fill', '#f59e0b').text(`f(c) = k`)
    }

  }, [idx, disc, params])

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-3">
        {DISCONTINUITIES.map((d, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              i === idx
                ? 'bg-brand-500 text-white border-brand-500'
                : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-brand-400'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <p className="text-sm text-center text-slate-600 dark:text-slate-400 mt-2 italic">{disc.description}</p>
    </div>
  )
}
