import * as d3 from 'd3'
import { useRef, useEffect } from 'react'

const W = 580, H = 300, M = { top: 20, right: 20, bottom: 40, left: 50 }

export default function SqueezeTheorem() {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xSc = d3.scaleLinear().domain([-2, 2]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([-1.5, 1.5]).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(8).forEach((t) => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(6).forEach((t) => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    const axY = ySc(0), axX = xSc(0)
    svg.append('g').attr('transform', `translate(0,${axY})`).call(d3.axisBottom(xSc).ticks(8)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${axX},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    const pts = d3.range(-2, 2.01, 0.01)
    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y))

    // g(x) = -x²
    const gPts = pts.map((x) => [x, -(x * x)])
    svg.append('path').datum(gPts).attr('fill', 'none').attr('stroke', '#10b981').attr('stroke-width', 2.5).attr('d', line)
    svg.append('text').attr('x', xSc(-1.8)).attr('y', ySc(-1.8 * 1.8) - 8).attr('font-size', 11).attr('fill', '#10b981').attr('font-weight', 600).text('g(x) = −x²')

    // h(x) = x²
    const hPts = pts.map((x) => [x, x * x])
    svg.append('path').datum(hPts).attr('fill', 'none').attr('stroke', '#f59e0b').attr('stroke-width', 2.5).attr('d', line)
    svg.append('text').attr('x', xSc(-1.7)).attr('y', ySc(1.7 * 1.7) - 8).attr('font-size', 11).attr('fill', '#f59e0b').attr('font-weight', 600).text('h(x) = x²')

    // f(x) = x² sin(1/x) — sampled carefully
    const fPts = pts.filter((x) => Math.abs(x) > 0.005).map((x) => [x, x * x * Math.sin(1 / x)])
    svg.append('path').datum(fPts.filter(([x]) => x < 0)).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 1.5).attr('d', line)
    svg.append('path').datum(fPts.filter(([x]) => x > 0)).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 1.5).attr('d', line)
    svg.append('text').attr('x', xSc(1.4)).attr('y', ySc(0.3)).attr('font-size', 11).attr('fill', '#6470f1').attr('font-weight', 600).text('f(x) = x²sin(1/x)')

    // Point at origin
    svg.append('circle').attr('cx', xSc(0)).attr('cy', ySc(0)).attr('r', 7).attr('fill', '#6470f1')
    svg.append('text').attr('x', xSc(0) + 10).attr('y', ySc(0) - 10).attr('font-size', 12).attr('fill', '#6470f1').attr('font-weight', 600).text('Limit = 0')

    // Squeeze arrows
    svg.append('text').attr('x', W / 2).attr('y', M.top + 10).attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#64748b')
      .text('−x² ≤ x²sin(1/x) ≤ x²  →  Squeeze: limit at 0 is 0')

  }, [])

  return (
    <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
  )
}
