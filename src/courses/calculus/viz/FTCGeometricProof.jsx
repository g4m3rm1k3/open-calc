/**
 * FTCGeometricProof — Animates the proof that derivative of area is the function height.
 */
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function FTCGeometricProof({ params = {} }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const { currentStep = 0 } = params

  useEffect(() => {
    const draw = (step) => {
      const container = containerRef.current
      const svgEl = svgRef.current
      if (!container || !svgEl) return

      const W = container.clientWidth || 400
      const H = Math.min(W, 400)
      const svg = d3.select(svgEl).attr('width', W).attr('height', H)
      svg.selectAll('*').remove()

      const margin = 50
      const width = W - 2 * margin
      const height = H - 2 * margin

      const g = svg.append('g').attr('transform', `translate(${margin}, ${margin})`)

      // f(x) = x^2 / 5 + 1
      const func = (x) => (x * x) / 5 + 1
      const xS = d3.scaleLinear().domain([0, 5]).range([0, width])
      const yS = d3.scaleLinear().domain([0, 7]).range([height, 0])

      // Axes
      g.append('line').attr('x1', 0).attr('x2', width).attr('y1', height).attr('y2', height).attr('stroke', '#ccc')
      g.append('line').attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', height).attr('stroke', '#ccc')

      // Curve
      const line = d3.line()
        .x(d => xS(d))
        .y(d => yS(func(d)))
      
      const data = d3.range(0, 5.1, 0.1)
      g.append('path').attr('d', line(data)).attr('fill', 'none').attr('stroke', '#6366f1').attr('stroke-width', 2)

      // Area under f(t) from a=0.5 to x0
      const a = 0.5
      const x0 = 3.0
      const h = 0.8 / (Math.max(1, step - 1)) // Decrease h as step increases to simulate limit

      const areaData = d3.range(a, x0 + 0.05, 0.05)
      const areaGen = d3.area().x(d => xS(d)).y0(height).y1(d => yS(func(d)))

      // Accumulated Area A(x)
      g.append('path')
        .datum(areaData)
        .attr('d', areaGen)
        .attr('fill', '#6366f1').attr('opacity', 0.2)
      
      g.append('line').attr('x1', xS(x0)).attr('x2', xS(x0)).attr('y1', height).attr('y2', yS(func(x0))).attr('stroke', '#6366f1').attr('stroke-dasharray', '2')

      // Step 2-4: Slivers and Limits
      if (step >= 2) {
        const xStep = step === 2 ? 0.8 : (step === 3 ? 0.4 : 0.05)
        const sliverData = d3.range(x0, x0 + xStep + 0.01, 0.01)
        
        g.append('path')
          .datum(sliverData)
          .attr('d', areaGen)
          .attr('fill', '#f43f5e').attr('opacity', 0.5)

        // Show rectangle height f(x)
        g.append('rect')
          .attr('x', xS(x0))
          .attr('y', yS(func(x0)))
          .attr('width', xS(x0 + xStep) - xS(x0))
          .attr('height', height - yS(func(x0)))
          .attr('fill', 'none')
          .attr('stroke', '#f43f5e')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '4')

        g.append('text')
          .attr('x', xS(x0 + xStep/2))
          .attr('y', yS(func(x0)) - 10)
          .text(step === 4 ? `f(x)` : `ΔA ≈ f(x)·h`)
          .attr('text-anchor', 'middle')
          .attr('fill', '#f43f5e')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
      }

      g.append('text').attr('x', xS(a)).attr('y', height + 20).text('a').attr('text-anchor', 'middle')
      g.append('text').attr('x', xS(x0)).attr('y', height + 20).text('x').attr('text-anchor', 'middle')

      // Title
      g.append('text').attr('x', 10).attr('y', 20).text('Fundamental Theorem of Calculus: Area Derivative').attr('fill', '#6366f1').attr('font-weight', 'bold')
    }

    const ro = new ResizeObserver(() => draw(currentStep))
    if (containerRef.current) ro.observe(containerRef.current)
    draw(currentStep)
    return () => ro.disconnect()
  }, [currentStep])

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200 shadow-inner overflow-hidden">
      <svg ref={svgRef} />
    </div>
  )
}
