import * as d3 from 'd3'
import { useEffect, useRef } from 'react'

const W = 640, H = 150, MARGIN = { left: 40, right: 40 }

const NUMBER_SETS = [
  { label: 'Integers', values: [-4, -3, -2, -1, 0, 1, 2, 3, 4], color: '#6470f1' },
  { label: 'Rationals (examples)', values: [-3.5, -1.5, 0.5, 1.5, 2.5], color: '#10b981' },
  { label: 'Irrationals (examples)', values: [-Math.PI, -Math.sqrt(2), Math.sqrt(2), Math.PI], color: '#f59e0b' },
]

export default function NumberLine({ params }) {
  const svgRef = useRef(null)
  const {
    showSets = false,
    showIntervals = false,
    xMin = -5,
    xMax = 5,
    tickStep = 1,
    interval = null,
    points = [],
    rays = [],
  } = params ?? {}

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([MARGIN.left, W - MARGIN.right])
    const cy = H / 2

    svg.append('line')
      .attr('x1', MARGIN.left).attr('x2', W - MARGIN.right)
      .attr('y1', cy).attr('y2', cy)
      .attr('stroke', '#94a3b8').attr('stroke-width', 2)

    svg.append('polygon')
      .attr('points', `${W - MARGIN.right},${cy} ${W - MARGIN.right - 8},${cy - 4} ${W - MARGIN.right - 8},${cy + 4}`)
      .attr('fill', '#94a3b8')
    svg.append('polygon')
      .attr('points', `${MARGIN.left},${cy} ${MARGIN.left + 8},${cy - 4} ${MARGIN.left + 8},${cy + 4}`)
      .attr('fill', '#94a3b8')

    for (let i = xMin; i <= xMax + 1e-9; i += tickStep) {
      const rounded = Math.round(i * 1000) / 1000
      const x = xScale(rounded)
      svg.append('line')
        .attr('x1', x).attr('x2', x)
        .attr('y1', cy - 6).attr('y2', cy + 6)
        .attr('stroke', '#64748b').attr('stroke-width', 1.5)
      svg.append('text')
        .attr('x', x).attr('y', cy + 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('fill', '#64748b')
        .text(Number.isInteger(rounded) ? rounded : rounded.toFixed(1))
    }

    if (showSets) {
      NUMBER_SETS.forEach((s, idx) => {
        s.values.forEach((v) => {
          if (v < xMin || v > xMax) return
          svg.append('circle')
            .attr('cx', xScale(v)).attr('cy', cy - 14 - idx * 10)
            .attr('r', 4)
            .attr('fill', s.color)
            .attr('opacity', 0.85)
        })
      })

      NUMBER_SETS.forEach((s, idx) => {
        svg.append('circle').attr('cx', MARGIN.left).attr('cy', 14 + idx * 16).attr('r', 4).attr('fill', s.color)
        svg.append('text').attr('x', MARGIN.left + 10).attr('y', 18 + idx * 16).attr('font-size', 10).attr('fill', '#64748b').text(s.label)
      })
    }

    if (showIntervals) {
      const intervalSpec = interval ?? { a: -1, b: 3, leftClosed: false, rightClosed: true, label: '(-1, 3]' }
      const a = xScale(intervalSpec.a)
      const b = xScale(intervalSpec.b)
      svg.append('rect').attr('x', a).attr('y', cy - 4).attr('width', b - a).attr('height', 8).attr('fill', '#6470f1').attr('opacity', 0.25)
      svg.append('circle').attr('cx', a).attr('cy', cy).attr('r', 5).attr('fill', intervalSpec.leftClosed ? '#6470f1' : 'white').attr('stroke', '#6470f1').attr('stroke-width', 2)
      svg.append('circle').attr('cx', b).attr('cy', cy).attr('r', 5).attr('fill', intervalSpec.rightClosed ? '#6470f1' : 'white').attr('stroke', '#6470f1').attr('stroke-width', 2)
      svg.append('text').attr('x', (a + b) / 2).attr('y', cy - 16).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#6470f1').text(intervalSpec.label)
    }

    for (const ray of rays) {
      if (typeof ray?.from !== 'number') continue
      const from = xScale(ray.from)
      const left = MARGIN.left
      const right = W - MARGIN.right
      const dir = ray.direction === 'left' ? 'left' : 'right'
      const end = dir === 'left' ? left : right
      const color = ray.color ?? '#6470f1'

      svg.append('line')
        .attr('x1', from)
        .attr('x2', end)
        .attr('y1', cy)
        .attr('y2', cy)
        .attr('stroke', color)
        .attr('stroke-width', 5)
        .attr('opacity', 0.3)

      const arrow = dir === 'left'
        ? `${left},${cy} ${left + 10},${cy - 5} ${left + 10},${cy + 5}`
        : `${right},${cy} ${right - 10},${cy - 5} ${right - 10},${cy + 5}`

      svg.append('polygon')
        .attr('points', arrow)
        .attr('fill', color)
        .attr('opacity', 0.8)

      svg.append('circle')
        .attr('cx', from)
        .attr('cy', cy)
        .attr('r', 5)
        .attr('fill', ray.closed ? color : 'white')
        .attr('stroke', color)
        .attr('stroke-width', 2)

      if (ray.label) {
        svg.append('text')
          .attr('x', from)
          .attr('y', cy - 14)
          .attr('text-anchor', 'middle')
          .attr('font-size', 11)
          .attr('fill', color)
          .text(ray.label)
      }
    }

    points.forEach((p, idx) => {
      if (p.value < xMin || p.value > xMax) return

      const px = xScale(p.value)
      const py = cy - 22 - (idx % 2) * 16

      svg.append('circle')
        .attr('cx', px)
        .attr('cy', cy)
        .attr('r', 4)
        .attr('fill', p.fill ?? '#f59e0b')
        .attr('stroke', p.stroke ?? '#7c2d12')
        .attr('stroke-width', 1)

      if (p.label) {
        svg.append('text')
          .attr('x', px)
          .attr('y', py)
          .attr('text-anchor', 'middle')
          .attr('font-size', 10)
          .attr('fill', '#475569')
          .text(p.label)
      }
    })
  }, [showSets, showIntervals, xMin, xMax, tickStep, interval, points, rays])

  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
  )
}
