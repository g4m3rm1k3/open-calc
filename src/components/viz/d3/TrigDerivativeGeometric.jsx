/**
 * TrigDerivativeGeometric — Animated proof for sin, cos, and tan derivatives.
 * Receives currentStep from the Rigor/Lesson component.
 */
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

const X_ANGLE = Math.PI / 4 // 45 degrees

export default function TrigDerivativeGeometric({ params = {} }) {
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
      const cx = W / 2 - 40
      const cy = H / 2
      const R = Math.min(W, H) * 0.3

      // Scales
      const g = svg.append('g').attr('transform', `translate(${cx}, ${cy})`)

      // Circle
      g.append('circle')
        .attr('r', R)
        .attr('fill', 'none')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1)

      // Axes
      g.append('line').attr('x1', -R - 20).attr('x2', R + 60).attr('y1', 0).attr('y2', 0).attr('stroke', '#ccc')
      g.append('line').attr('x1', 0).attr('x2', 0).attr('y1', -R - 20).attr('y2', R + 20).attr('stroke', '#ccc')

      // Point P
      const px = R * Math.cos(X_ANGLE)
      const py = -R * Math.sin(X_ANGLE)

      // Step 0: Position P
      if (step >= 0) {
        g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', px).attr('y2', py).attr('stroke', '#6366f1').attr('stroke-width', 2)
        g.append('circle').attr('cx', px).attr('cy', py).attr('r', 5).attr('fill', '#6366f1')
        g.append('text').attr('x', px + 5).attr('y', py - 5).text('P (cos x, sin x)').attr('font-size', '12px').attr('fill', '#6366f1')
      }

      // Step 1: Velocity Vector
      if (step >= 1) {
        const vLen = R * 0.6
        const vx = -Math.sin(X_ANGLE) * vLen
        const vy = -Math.cos(X_ANGLE) * vLen // negated because svg y is down
        
        const arrow = g.append('g').attr('class', 'velocity')
        arrow.append('line')
          .attr('x1', px).attr('y1', py)
          .attr('x2', px + vx).attr('y2', py + vy)
          .attr('stroke', '#f43f5e').attr('stroke-width', 3)
          .attr('marker-end', 'url(#arrowhead)')
        
        arrow.append('text')
          .attr('x', px + vx + 5).attr('y', py + vy - 5)
          .text('v = (-sin x, cos x)')
          .attr('fill', '#f43f5e').attr('font-size', '12px').attr('font-weight', 'bold')
      }

      // Step 2 & 3: Component Decomposition
      if (step >= 2) {
        const vLen = R * 0.6
        const vx = -Math.sin(X_ANGLE) * vLen
        const vy = -Math.cos(X_ANGLE) * vLen

        // vy component (cos x)
        g.append('line')
          .attr('x1', px + vx).attr('y1', py)
          .attr('x2', px + vx).attr('y2', py + vy)
          .attr('stroke', '#10b981').attr('stroke-width', 3).attr('stroke-dasharray', '4')
        
        g.append('text')
          .attr('x', px + vx + 5).attr('y', py + vy / 2)
          .text('dy/dx = cos x')
          .attr('fill', '#10b981').attr('font-size', '12px')
          
        // vx component (-sin x)
        if (step >= 3) {
          g.append('line')
            .attr('x1', px).attr('y1', py)
            .attr('x2', px + vx).attr('y2', py)
            .attr('stroke', '#f59e0b').attr('stroke-width', 3).attr('stroke-dasharray', '4')
          
          g.append('text')
            .attr('x', px + vx / 2).attr('y', py + 15)
            .text('dx/dx = -sin x')
            .attr('fill', '#f59e0b').attr('font-size', '12px')
        }
      }

      // Step 4 & 5 & 6: Tangent Proof
      if (step >= 4) {
        // Tangent line x = 1
        g.append('line').attr('x1', R).attr('y1', -R * 1.5).attr('x2', R).attr('y2', R * 0.5).attr('stroke', '#94a3b8').attr('stroke-dasharray', '2')
        
        // Ray through P to the tangent line
        const tx = R
        const ty = -R * Math.tan(X_ANGLE)
        g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', tx).attr('y2', ty).attr('stroke', '#3b82f6').attr('stroke-dasharray', '4')
        g.append('circle').attr('cx', tx).attr('cy', ty).attr('r', 4).attr('fill', '#3b82f6')
        
        // Label tan x
        g.append('text').attr('x', tx + 5).attr('y', ty / 2).text('tan x').attr('fill', '#3b82f6').attr('font-weight', 'bold')
        g.append('line').attr('x1', tx).attr('y1', 0).attr('x2', tx).attr('y2', ty).attr('stroke', '#3b82f6').attr('stroke-width', 2)
      }

      if (step >= 5) {
        // dx and d(tan x) triangle
        const tx = R
        const ty = -R * Math.tan(X_ANGLE)
        
        // Show a small angle dx
        const dAlpha = 0.15
        const ty2 = -R * Math.tan(X_ANGLE + dAlpha)
        
        g.append('path')
          .attr('d', `M ${tx} ${ty} L ${tx} ${ty2}`)
          .attr('stroke', '#8b5cf6').attr('stroke-width', 4)
        
        g.append('text')
          .attr('x', tx + 10).attr('y', (ty + ty2) / 2)
          .text('d(tan x)')
          .attr('fill', '#8b5cf6').attr('font-weight', 'bold')
      }

      // Add arrowhead marker
      svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 8).attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 5).attr('markerHeight', 5)
        .attr('xoverflow', 'visible')
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#f43f5e').style('stroke', 'none')
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
