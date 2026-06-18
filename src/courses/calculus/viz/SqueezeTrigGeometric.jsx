/**
 * SqueezeTrigGeometric — Shows the Area Squeeze proof for lim sin(x)/x = 1.
 */
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

const X_ANGLE = 0.6 // ~34 degrees

export default function SqueezeTrigGeometric({ params = {} }) {
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

      const margin = 40
      const originX = margin
      const originY = H - 20
      const R = Math.min(W, H) * 0.4

      const g = svg.append('g').attr('transform', `translate(${originX}, ${originY})`)
      
      const px = R * Math.cos(X_ANGLE)
      const py = -R * Math.sin(X_ANGLE)
      const tx = R
      const ty = -R * Math.tan(X_ANGLE)

      // Axes
      g.append('line').attr('x1', 0).attr('x2', R + 60).attr('y1', 0).attr('y2', 0).attr('stroke', '#ccc')
      g.append('line').attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', -R - 60).attr('stroke', '#ccc')

      // Unit Circle Arc
      const arcGen = d3.arc().innerRadius(0).outerRadius(R).startAngle(Math.PI/2).endAngle(Math.PI/2 - X_ANGLE)
      
      // Step 0: Inner Triangle (sin x cos x / 2)
      if (step >= 0) {
        g.append('path')
          .attr('d', `M 0 0 L ${px} 0 L ${px} ${py} Z`)
          .attr('fill', '#10b981').attr('opacity', 0.1)
          .attr('stroke', '#10b981').attr('stroke-width', 2)
        g.append('text').attr('x', px/2).attr('y', py/2 - 5).text('Inner').attr('fill', '#10b981').attr('font-size', '12px').attr('font-weight', 'bold')
      }

      // Step 1: Sector (x/2)
      if (step >= 1) {
        g.append('path')
          .attr('d', arcGen())
          .attr('fill', '#6366f1').attr('opacity', 0.1)
          .attr('stroke', '#6366f1').attr('stroke-width', 2).attr('stroke-dasharray', '4')
        g.append('text').attr('x', px + 15).attr('y', py).text('Sector').attr('fill', '#6366f1').attr('font-size', '12px').attr('font-weight', 'bold')
      }

      // Step 2 & 3: Outer Triangle (tan x / 2)
      if (step >= 2) {
        g.append('path')
          .attr('d', `M 0 0 L ${tx} 0 L ${tx} ${ty} Z`)
          .attr('fill', '#f43f5e').attr('opacity', 0.1)
          .attr('stroke', '#f43f5e').attr('stroke-width', 2).attr('stroke-dasharray', '2')
        g.append('text').attr('x', tx + 5).attr('y', ty/2).text('Outer').attr('fill', '#f43f5e').attr('font-size', '12px').attr('font-weight', 'bold')
      }

      // Intersection labels
      g.append('circle').attr('cx', px).attr('cy', py).attr('r', 3).attr('fill', '#10b981')
      g.append('circle').attr('cx', tx).attr('cy', ty).attr('r', 3).attr('fill', '#f43f5e')

      g.append('text').attr('x', 10).attr('y', -H + 40).text('The Area Squeeze in Radians').attr('fill', '#6366f1').attr('font-weight', 'bold')
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
