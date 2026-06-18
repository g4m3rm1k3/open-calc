/**
 * ExpLogGeometricProof — Displays both the exponential slope proof 
 * and the logarithmic accumulation area proof.
 */
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function ExpLogGeometricProof({ params = {} }) {
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

      // Drawing logic based on step (0-2: Exponential, 3-4: Logarithm)
      if (step <= 2) {
        // --- Exponential f(x)=e^x Proof ---
        const xS = d3.scaleLinear().domain([-2, 2]).range([0, width])
        const yS = d3.scaleLinear().domain([0, 8]).range([height, 0])

        // Axes
        g.append('line').attr('x1', 0).attr('x2', width).attr('y1', height).attr('y2', height).attr('stroke', '#ccc')
        g.append('line').attr('x1', width / 2).attr('x2', width / 2).attr('y1', 0).attr('y2', height).attr('stroke', '#ccc')

        // Curve e^x
        const line = d3.line()
          .x(d => xS(d))
          .y(d => yS(Math.exp(d)))
        
        const data = d3.range(-2, 2.1, 0.1)
        g.append('path').attr('d', line(data)).attr('fill', 'none').attr('stroke', '#6366f1').attr('stroke-width', 2)

        // Point at x = 0.5 (for visualization)
        const xTest = 0.5
        const px = xS(xTest)
        const py = yS(Math.exp(xTest))
        
        g.append('circle').attr('cx', px).attr('cy', py).attr('r', 5).attr('fill', '#6366f1')

        // Tangent triangle
        const slope = Math.exp(xTest) // slope should be e^x
        const dx = 0.4
        const dy = slope * dx
        
        const tx1 = xS(xTest)
        const ty1 = yS(Math.exp(xTest))
        const tx2 = xS(xTest + dx)
        const ty2 = yS(Math.exp(xTest) + dy)

        const triangleG = g.append('g').attr('class', 'slope-triangle')
        
        triangleG.append('line').attr('x1', tx1).attr('x2', tx2).attr('y1', ty1).attr('y2', ty1).attr('stroke', '#f43f5e').attr('stroke-width', 2)
        triangleG.append('line').attr('x1', tx2).attr('x2', tx2).attr('y1', ty1).attr('y2', ty2).attr('stroke', '#10b981').attr('stroke-width', 2)
        
        triangleG.append('text').attr('x', (tx1 + tx2) / 2).attr('y', ty1 + 15).text('dx').attr('text-anchor', 'middle').attr('fill', '#f43f5e').attr('font-size', '12px')
        triangleG.append('text').attr('x', tx2 + 5).attr('y', (ty1 + ty2) / 2).text('dy = e^x dx').attr('fill', '#10b981').attr('font-size', '12px')

        g.append('line')
          .attr('x1', tx1 - dx).attr('y1', yS(Math.exp(xTest) - slope * dx))
          .attr('x2', tx2 + dx).attr('y2', yS(Math.exp(xTest) + slope * (dx * 2)))
          .attr('stroke', '#f43f5e').attr('stroke-dasharray', '4')

        g.append('text').attr('x', 10).attr('y', 20).text(`Step: e^x, slope = ${Math.exp(xTest).toFixed(2)}`).attr('fill', '#6366f1').attr('font-weight', 'bold')

      } else {
        // --- Logarithm f(x)=ln(x) Area under 1/t Proof ---
        const xS = d3.scaleLinear().domain([0, 5]).range([0, width])
        const yS = d3.scaleLinear().domain([0, 1.5]).range([height, 0])

        // Axes
        g.append('line').attr('x1', 0).attr('x2', width).attr('y1', height).attr('y2', height).attr('stroke', '#ccc')
        g.append('line').attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', height).attr('stroke', '#ccc')

        // Curve 1/t
        const line = d3.line()
          .x(d => xS(d))
          .y(d => yS(1/d))
        
        const data = d3.range(0.5, 5.1, 0.1)
        g.append('path').attr('d', line(data)).attr('fill', 'none').attr('stroke', '#8b5cf6').attr('stroke-width', 2)

        // Shade area from 1 to x0
        const x0 = 3.0
        const dx = 0.5
        const areaData = d3.range(1, x0 + 0.05, 0.05)
        
        const areaGenerator = d3.area()
          .x(d => xS(d))
          .y0(height)
          .y1(d => yS(1/d))

        g.append('path')
          .datum(areaData)
          .attr('d', areaGenerator)
          .attr('fill', '#8b5cf6').attr('opacity', 0.2)
        
        g.append('text').attr('x', xS(1.8)).attr('y', height - 10).text('Area = ln x').attr('fill', '#8b5cf6')

        // Show accumulation slice at x0
        if (step >= 4) {
          const sliceX1 = xS(x0)
          const sliceX2 = xS(x0 + dx)
          const sliceY = yS(1/x0)

          g.append('rect')
            .attr('x', sliceX1)
            .attr('y', sliceY)
            .attr('width', sliceX2 - sliceX1)
            .attr('height', height - sliceY)
            .attr('fill', '#ef4444')
            .attr('opacity', 0.5)

          g.append('text').attr('x', sliceX1).attr('y', sliceY - 10).text('d(Area) = (1/x) dx').attr('fill', '#ef4444').attr('font-size', '12px')
        }
        
        g.append('text').attr('x', 10).attr('y', 20).text('Natural Log: Accumulation of 1/t').attr('fill', '#8b5cf6').attr('font-weight', 'bold')
      }
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
