import * as d3 from 'd3'
import { useEffect, useRef, useState } from 'react'

const W = 640, H = 120, MARGIN = { left: 40, right: 40 }
const xScale = d3.scaleLinear().domain([-5, 5]).range([MARGIN.left, W - MARGIN.right])

const NUMBER_SETS = [
  { label: 'Integers', values: [-4, -3, -2, -1, 0, 1, 2, 3, 4], color: '#6470f1' },
  { label: 'Rationals (examples)', values: [-3.5, -1.5, 0.5, 1.5, 2.5], color: '#10b981' },
  { label: 'Irrationals (examples)', values: [-Math.PI, -Math.sqrt(2), Math.sqrt(2), Math.PI], color: '#f59e0b' },
]

export default function NumberLine({ params }) {
  const svgRef = useRef(null)
  const { showSets = false, showIntervals = false } = params ?? {}

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const cy = H / 2

    // Axis line
    svg.append('line')
      .attr('x1', MARGIN.left).attr('x2', W - MARGIN.right)
      .attr('y1', cy).attr('y2', cy)
      .attr('stroke', '#94a3b8').attr('stroke-width', 2)

    // Arrow tips
    svg.append('polygon')
      .attr('points', `${W - MARGIN.right},${cy} ${W - MARGIN.right - 8},${cy - 4} ${W - MARGIN.right - 8},${cy + 4}`)
      .attr('fill', '#94a3b8')
    svg.append('polygon')
      .attr('points', `${MARGIN.left},${cy} ${MARGIN.left + 8},${cy - 4} ${MARGIN.left + 8},${cy + 4}`)
      .attr('fill', '#94a3b8')

    // Ticks
    for (let i = -4; i <= 4; i++) {
      const x = xScale(i)
      svg.append('line')
        .attr('x1', x).attr('x2', x)
        .attr('y1', cy - 6).attr('y2', cy + 6)
        .attr('stroke', '#64748b').attr('stroke-width', 1.5)
      svg.append('text')
        .attr('x', x).attr('y', cy + 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('fill', '#64748b')
        .text(i)
    }

    if (showSets) {
      NUMBER_SETS.forEach((s, idx) => {
        s.values.forEach((v) => {
          svg.append('circle')
            .attr('cx', xScale(v)).attr('cy', cy - 14 - idx * 10)
            .attr('r', 4)
            .attr('fill', s.color)
            .attr('opacity', 0.85)
        })
      })

      // Legend
      NUMBER_SETS.forEach((s, idx) => {
        svg.append('circle').attr('cx', MARGIN.left).attr('cy', 14 + idx * 16).attr('r', 4).attr('fill', s.color)
        svg.append('text').attr('x', MARGIN.left + 10).attr('y', 18 + idx * 16).attr('font-size', 10).attr('fill', '#64748b').text(s.label)
      })
    }

    if (showIntervals) {
      // Show (-1, 3] highlighted
      const a = xScale(-1), b = xScale(3)
      svg.append('rect').attr('x', a).attr('y', cy - 4).attr('width', b - a).attr('height', 8).attr('fill', '#6470f1').attr('opacity', 0.25)
      svg.append('circle').attr('cx', a).attr('cy', cy).attr('r', 5).attr('fill', 'white').attr('stroke', '#6470f1').attr('stroke-width', 2)
      svg.append('circle').attr('cx', b).attr('cy', cy).attr('r', 5).attr('fill', '#6470f1')
      svg.append('text').attr('x', (a + b) / 2).attr('y', cy - 16).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#6470f1').text('(-1, 3]')
    }
  }, [showSets, showIntervals])

  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
  )
}
