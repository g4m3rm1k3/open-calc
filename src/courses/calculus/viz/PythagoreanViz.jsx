import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

/**
 * PythagoreanViz
 * Animated visual proof of the Pythagorean theorem.
 * params.currentStep (0-4) drives the animation stages.
 */
export default function PythagoreanViz({ params = {} }) {
  const { currentStep = 0 } = params
  const svgRef = useRef(null)

  const SIZE = 440
  const a = 90   // leg a
  const b = 130  // leg b
  const c = Math.sqrt(a * a + b * b)
  const SIDE = a + b  // big square side

  // Offset so big square fits centered
  const OX = (SIZE - SIDE) / 2
  const OY = (SIZE - SIDE) / 2

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const step = Math.min(currentStep, 4)

    // ── Big square outline ──
    svg.append('rect')
      .attr('x', OX).attr('y', OY)
      .attr('width', SIDE).attr('height', SIDE)
      .attr('fill', '#f8fafc').attr('stroke', '#94a3b8').attr('stroke-width', 2)

    // ── Label big square side ──
    svg.append('text')
      .attr('x', OX + SIDE / 2).attr('y', OY + SIDE + 18)
      .attr('text-anchor', 'middle').attr('font-size', 14).attr('fill', '#475569')
      .text('a + b')

    if (step >= 1) {
      // ── 4 right triangles in arrangement 1 ──
      // Corners: TL, TR, BR, BL — triangles arranged with hypotenuses forming inner square
      const triangleColor = '#bfdbfe'
      const triangleStroke = '#3b82f6'

      const triangles = [
        // top-left corner: horizontal leg = a (right), vertical leg = b (down)
        [[OX, OY], [OX + a, OY], [OX, OY + b]],
        // top-right corner
        [[OX + SIDE, OY], [OX + SIDE, OY + a], [OX + SIDE - b, OY]],
        // bottom-right corner
        [[OX + SIDE, OY + SIDE], [OX + SIDE - a, OY + SIDE], [OX + SIDE, OY + SIDE - b]],
        // bottom-left corner
        [[OX, OY + SIDE], [OX, OY + SIDE - a], [OX + b, OY + SIDE]],
      ]

      const poly = d => d.map(p => p.join(',')).join(' ')

      triangles.forEach((t, i) => {
        svg.append('polygon')
          .attr('points', poly(t))
          .attr('fill', triangleColor)
          .attr('stroke', triangleStroke)
          .attr('stroke-width', 1.5)
          .attr('opacity', 0)
          .transition().delay(i * 120).duration(400)
          .attr('opacity', 0.85)
      })

      // Label legs a and b on one triangle
      svg.append('text')
        .attr('x', OX + a / 2).attr('y', OY - 6)
        .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', '#1d4ed8').attr('font-weight', 'bold')
        .text('a')
      svg.append('text')
        .attr('x', OX - 12).attr('y', OY + b / 2)
        .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', '#1d4ed8').attr('font-weight', 'bold')
        .text('b')
    }

    if (step >= 2) {
      // ── Inner tilted square (hypotenuses form it) ──
      // Vertices of inner square
      const pts = [
        [OX + a, OY],
        [OX + SIDE, OY + a],
        [OX + SIDE - a, OY + SIDE],
        [OX, OY + SIDE - a],
      ]
      svg.append('polygon')
        .attr('points', pts.map(p => p.join(',')).join(' '))
        .attr('fill', '#fef9c3').attr('stroke', '#ca8a04').attr('stroke-width', 2)
        .attr('opacity', 0)
        .transition().duration(500).attr('opacity', 1)

      // Label c
      const cx = (pts[0][0] + pts[1][0]) / 2 + 12
      const cy = (pts[0][1] + pts[1][1]) / 2
      svg.append('text')
        .attr('x', cx).attr('y', cy)
        .attr('font-size', 14).attr('fill', '#92400e').attr('font-weight', 'bold')
        .text('c')

      svg.append('text')
        .attr('x', SIZE / 2).attr('y', 20)
        .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', '#92400e')
        .text('Inner square has area c²')
    }

    if (step >= 3) {
      // ── Show equation: Big area = 4 triangles + inner ──
      const eqY = SIZE - 10
      svg.append('text')
        .attr('x', SIZE / 2).attr('y', eqY - 16)
        .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', '#475569')
        .text('(a+b)² = 4·(½ab) + c²')
      svg.append('text')
        .attr('x', SIZE / 2).attr('y', eqY)
        .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', '#475569')
        .text('a² + 2ab + b² = 2ab + c²')
    }

    if (step >= 4) {
      // ── Final result ──
      svg.append('rect')
        .attr('x', SIZE / 2 - 80).attr('y', SIZE - 40)
        .attr('width', 160).attr('height', 32)
        .attr('rx', 6).attr('fill', '#dcfce7').attr('stroke', '#16a34a').attr('stroke-width', 2)
      svg.append('text')
        .attr('x', SIZE / 2).attr('y', SIZE - 19)
        .attr('text-anchor', 'middle').attr('font-size', 15).attr('fill', '#15803d').attr('font-weight', 'bold')
        .text('∴  a² + b² = c²  ∎')
    }

  }, [currentStep])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <svg
        ref={svgRef}
        width={SIZE}
        height={SIZE}
        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
      />
      <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: '#64748b', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 14, height: 14, background: '#bfdbfe', border: '1px solid #3b82f6', display: 'inline-block', borderRadius: 2 }} />
          Right triangles (area = ½ab each)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 14, height: 14, background: '#fef9c3', border: '1px solid #ca8a04', display: 'inline-block', borderRadius: 2 }} />
          Inner square (area = c²)
        </span>
      </div>
      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
        Use the "Next Step" button in the proof panel to animate the proof.
      </p>
    </div>
  )
}
