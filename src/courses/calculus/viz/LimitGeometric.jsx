/**
 * LimitGeometric — Visual geometric proof of what a limit IS
 *
 * Step-synced with DynamicProof (receives currentStep via params).
 *
 * Shows f(x) = (x²−4)/(x−2) with a hole at x=2.
 * Animates left and right approach, the gap closing, the limit value.
 *
 * Steps:
 *  0 → Graph of f with a visible "hole" at x=2, y=4
 *  1 → Left approach: red dot moves from x=0 toward x=2⁻, table of values
 *  2 → Right approach: blue dot moves from x=4 toward x=2⁺
 *  3 → Both arrows point at the same y=4 — the limit value highlighted
 *  4 → Zoom: even though f(2) is undefined (open circle), limit = 4 ✓
 */
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const F = x => (x !== 2) ? (x * x - 4) / (x - 2) : NaN   // = x+2 for x≠2

export default function LimitGeometric({ params = {} }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const { currentStep = 0 } = params

  // Animate the approach dot position
  const [tLeft,  setTLeft]  = useState(0)   // 0→1: left dot approaches x=2
  const [tRight, setTRight] = useState(0)   // 0→1: right dot approaches x=2

  useEffect(() => {
    setTLeft(0); setTRight(0)
    if (currentStep === 1) {
      // Animate left approach
      let t = 0
      const iv = setInterval(() => {
        t = Math.min(t + 0.025, 1)
        setTLeft(t)
        if (t >= 1) clearInterval(iv)
      }, 30)
      return () => clearInterval(iv)
    }
    if (currentStep >= 2) {
      setTLeft(1)
      let t = 0
      const iv = setInterval(() => {
        t = Math.min(t + 0.025, 1)
        setTRight(t)
        if (t >= 1) clearInterval(iv)
      }, 30)
      return () => clearInterval(iv)
    }
  }, [currentStep])

  useEffect(() => {
    draw(currentStep, tLeft, tRight)
  }, [currentStep, tLeft, tRight])

  function draw(step, tL, tR) {
    const container = containerRef.current
    const svgEl = svgRef.current
    if (!container || !svgEl) return
    const W = container.clientWidth || 400
    const H = Math.min(W * 0.7, 300)
    if (W < 40 || H < 40) return

    const svg = d3.select(svgEl).attr('width', W).attr('height', H)
    svg.selectAll('*').remove()

    const m = { top: 24, right: 24, bottom: 36, left: 44 }
    const w = W - m.left - m.right
    const h = H - m.top  - m.bottom
    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`)

    const xScale = d3.scaleLinear().domain([0, 4.2]).range([0, w])
    const yScale = d3.scaleLinear().domain([0.5, 7]).range([h, 0])

    // Axes
    g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(xScale).ticks(5))
      .call(s => s.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 10))
      .call(s => s.select('.domain').attr('stroke', '#cbd5e1'))
      .call(s => s.selectAll('.tick line').attr('stroke', '#e2e8f0'))
    g.append('g').call(d3.axisLeft(yScale).ticks(5))
      .call(s => s.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 10))
      .call(s => s.select('.domain').attr('stroke', '#cbd5e1'))
      .call(s => s.selectAll('.tick line').attr('stroke', '#e2e8f0'))

    // Axis labels
    g.append('text').attr('x', w + 4).attr('y', h + 4).attr('font-size', 10).attr('fill', '#94a3b8').text('x')
    g.append('text').attr('x', -12).attr('y', -8).attr('font-size', 10).attr('fill', '#94a3b8').text('y')

    // Grid
    g.append('g').selectAll('line').data(yScale.ticks(5)).join('line')
      .attr('x1', 0).attr('x2', w).attr('y1', d => yScale(d)).attr('y2', d => yScale(d))
      .attr('stroke', '#f1f5f9').attr('stroke-width', 1)

    // ── f(x) = x+2 curve (left branch: x < 2) ───────────────────────────────
    const pts = d3.range(0.05, 1.97, 0.05)
    const lineL = d3.line().x(d => xScale(d)).y(d => yScale(d + 2))
    g.append('path').datum(pts).attr('d', lineL)
      .attr('fill', 'none').attr('stroke', '#6366f1').attr('stroke-width', 2.5)

    // right branch: x > 2
    const ptsR = d3.range(2.03, 4.15, 0.05)
    const lineR = d3.line().x(d => xScale(d)).y(d => yScale(d + 2))
    g.append('path').datum(ptsR).attr('d', lineR)
      .attr('fill', 'none').attr('stroke', '#6366f1').attr('stroke-width', 2.5)

    // Hole at (2, 4)
    g.append('circle').attr('cx', xScale(2)).attr('cy', yScale(4)).attr('r', 5)
      .attr('fill', 'white').attr('stroke', '#6366f1').attr('stroke-width', 2)

    // Label
    g.append('text').attr('x', w - 80).attr('y', 14)
      .attr('font-size', 11).attr('fill', '#6366f1').attr('font-weight', 'bold')
      .text('f(x) = (x²−4)/(x−2)')

    // ── Step 0: Limit target line ─────────────────────────────────────────────
    if (step >= 0) {
      g.append('line')
        .attr('x1', 0).attr('x2', w)
        .attr('y1', yScale(4)).attr('y2', yScale(4))
        .attr('stroke', '#f59e0b').attr('stroke-width', 1).attr('stroke-dasharray', '5,4').attr('opacity', 0.5)
      g.append('text').attr('x', -2).attr('y', yScale(4) - 4)
        .attr('font-size', 10).attr('fill', '#f59e0b').attr('text-anchor', 'end').text('4')
      g.append('text').attr('x', xScale(2) - 4).attr('y', h + 14)
        .attr('font-size', 10).attr('fill', '#64748b').attr('text-anchor', 'middle').text('2')
    }

    // ── Step 1: Left approach dot ─────────────────────────────────────────────
    if (step >= 1) {
      const leftX = 0.3 + tL * (2 - 0.3 - 0.06)   // approach 2 from left
      g.append('circle').attr('cx', xScale(leftX)).attr('cy', yScale(leftX + 2)).attr('r', 7)
        .attr('fill', '#ef4444').attr('stroke', 'white').attr('stroke-width', 2)

      // Arrow toward hole
      if (tL > 0.5) {
        const defs = svg.append('defs')
        defs.append('marker').attr('id', 'arrL').attr('markerWidth', 7).attr('markerHeight', 7)
          .attr('refX', 4).attr('refY', 2).attr('orient', 'auto')
          .append('polygon').attr('points', '0 0, 7 2, 0 4').attr('fill', '#ef4444')
        g.append('line')
          .attr('x1', xScale(leftX + 0.1)).attr('y1', yScale(leftX + 0.1 + 2))
          .attr('x2', xScale(1.96)).attr('y2', yScale(1.96 + 2))
          .attr('stroke', '#ef4444').attr('stroke-width', 1.5)
          .attr('marker-end', 'url(#arrL)')
      }
      g.append('text').attr('x', m.left + 4).attr('y', 14)
        .attr('font-size', 10).attr('fill', '#ef4444').attr('font-weight', 'bold')
        .text(`x → 2⁻: f(x) → ${(leftX + 2).toFixed(3)}`)
    }

    // ── Step 2: Right approach dot ────────────────────────────────────────────
    if (step >= 2) {
      const rightX = 4.0 - tR * (4.0 - 2.0 - 0.06)
      g.append('circle').attr('cx', xScale(rightX)).attr('cy', yScale(rightX + 2)).attr('r', 7)
        .attr('fill', '#3b82f6').attr('stroke', 'white').attr('stroke-width', 2)

      const defs2 = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs')
      defs2.append('marker').attr('id', 'arrR').attr('markerWidth', 7).attr('markerHeight', 7)
        .attr('refX', 4).attr('refY', 2).attr('orient', 'auto-start-reverse')
        .append('polygon').attr('points', '0 0, 7 2, 0 4').attr('fill', '#3b82f6')
      if (tR > 0.5) {
        g.append('line')
          .attr('x1', xScale(rightX - 0.1)).attr('y1', yScale(rightX - 0.1 + 2))
          .attr('x2', xScale(2.04)).attr('y2', yScale(2.04 + 2))
          .attr('stroke', '#3b82f6').attr('stroke-width', 1.5)
          .attr('marker-end', 'url(#arrR)')
      }
      g.append('text').attr('x', m.left + 4).attr('y', 26)
        .attr('font-size', 10).attr('fill', '#3b82f6').attr('font-weight', 'bold')
        .text(`x → 2⁺: f(x) → ${(rightX + 2).toFixed(3)}`)
    }

    // ── Step 3: Converging arrows + limit label ───────────────────────────────
    if (step >= 3) {
      // Bracket around the hole showing the limit value
      g.append('rect')
        .attr('x', xScale(2) - 30).attr('y', yScale(4) - 14)
        .attr('width', 60).attr('height', 28)
        .attr('rx', 6).attr('fill', '#fef9c3').attr('stroke', '#f59e0b').attr('stroke-width', 2)
      g.append('text').attr('x', xScale(2)).attr('y', yScale(4) + 5)
        .attr('text-anchor', 'middle').attr('font-size', 12).attr('font-weight', 'bold').attr('fill', '#92400e')
        .text('limit = 4')
    }

    // ── Step 4: Final — annotate hole vs limit ────────────────────────────────
    if (step >= 4) {
      // Annotation box
      g.append('rect').attr('x', xScale(2.1)).attr('y', yScale(4) - 38)
        .attr('width', 170).attr('height', 50).attr('rx', 7)
        .attr('fill', '#f0fdf4').attr('stroke', '#10b981').attr('stroke-width', 1.5)
      g.append('text').attr('x', xScale(2.1) + 8).attr('y', yScale(4) - 20)
        .attr('font-size', 11).attr('fill', '#065f46').attr('font-weight', 'bold')
        .text('f(2) = undefined (hole)')
      g.append('text').attr('x', xScale(2.1) + 8).attr('y', yScale(4) - 6)
        .attr('font-size', 11).attr('fill', '#065f46').attr('font-weight', 'bold')
        .text('but lim f(x) = 4 ✓')
      g.append('text').attr('x', xScale(2.1) + 8).attr('y', yScale(4) + 8)
        .attr('font-size', 10).attr('fill', '#047857')
        .text('The limit ignores f(2) itself.')
    }
  }

  return (
    <div ref={containerRef} className="w-full bg-white dark:bg-slate-900 rounded-xl p-3">
      <svg ref={svgRef} className="w-full block" />
    </div>
  )
}
