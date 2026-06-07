import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * SSAAmbiguousViz
 * Shows the ambiguous SSA case interactively.
 * Fixed angle A and side b. Drag side a to see 0, 1, or 2 triangles.
 */
export default function SSAAmbiguousViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [aLen, setALen] = useState(70)

  useEffect(() => {
    const draw = () => {
      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.55)
      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H)

      const angleA = 35 * Math.PI / 180
      const bLen = 100
      const h = bLen * Math.sin(angleA)
      const scale = (W * 0.72) / 150
      const ox = W * 0.1, oy = H * 0.78

      const Bx = ox, By = oy
      const adjB = bLen * Math.cos(angleA)
      const Ax = ox + adjB * scale, Ay = oy - bLen * Math.sin(angleA) * scale

      // Base ray
      svg.append('line').attr('x1', ox).attr('y1', oy).attr('x2', ox + 150 * scale).attr('y2', oy).attr('class', 'stroke-slate-400 dark:stroke-slate-600').attr('stroke-width', 1)

      // Side b from B to A
      svg.append('line').attr('x1', Bx).attr('y1', By).attr('x2', Ax).attr('y2', Ay).attr('class', 'stroke-violet-600 dark:stroke-violet-400').attr('stroke-width', 2)
      svg.append('text').attr('x', (Bx+Ax)/2 - 8).attr('y', (By+Ay)/2).attr('class', 'fill-violet-600 dark:fill-violet-400').attr('font-size', 11).attr('font-weight', 'bold').text(`b=${bLen}`)

      // Angle A at B
      svg.append('text').attr('x', Bx + 22).attr('y', By - 8).attr('class', 'fill-slate-500 dark:fill-slate-400').attr('font-size', 11).text(`A=35°`)

      // Height h from A perpendicular to base
      svg.append('line').attr('x1', Ax).attr('y1', Ay).attr('x2', Ax).attr('y2', oy).attr('class', 'stroke-emerald-600 dark:stroke-emerald-400').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
      svg.append('text').attr('x', Ax + 5).attr('y', (Ay + oy) / 2).attr('class', 'fill-emerald-600 dark:fill-emerald-400').attr('font-size', 11).attr('font-weight', 'bold').text(`h=${h.toFixed(1)}`)

      // Circle of radius a centered at A
      const aScaled = aLen * scale
      svg.append('circle').attr('cx', Ax).attr('cy', Ay).attr('r', aScaled).attr('fill', 'none').attr('class', 'stroke-amber-600 dark:stroke-amber-500').attr('stroke-width', 1).attr('stroke-dasharray', '5,3').attr('opacity', 0.6)
      svg.append('text').attr('x', Ax + aScaled * 0.7 + 5).attr('y', Ay).attr('class', 'fill-amber-600 dark:fill-amber-400').attr('font-size', 11).attr('font-weight', 'bold').text(`a=${aLen}`)

      // Find intersections with base line (y = oy)
      const dy = oy - Ay
      const disc = aScaled * aScaled - dy * dy
      const intersections = []
      if (disc >= 0) {
        const dx = Math.sqrt(disc)
        intersections.push(Ax + dx)
        if (dx > 1) intersections.push(Ax - dx)
      }

      const validIntersections = intersections.filter(ix => ix > ox + 5)
      const tris = validIntersections.length

      // Draw triangles
      const triStrokeClasses = ['stroke-sky-600 dark:stroke-sky-400', 'stroke-pink-600 dark:stroke-pink-400']
      const triFillClasses = ['fill-sky-600 dark:fill-sky-400', 'fill-pink-600 dark:fill-pink-400']
      
      validIntersections.forEach((Cx, i) => {
        svg.append('polygon').attr('points', `${Bx},${By} ${Ax},${Ay} ${Cx},${oy}`).attr('fill', 'none').attr('class', triStrokeClasses[i]).attr('stroke-width', 2)
        svg.append('circle').attr('cx', Cx).attr('cy', oy).attr('r', 5).attr('class', `${triFillClasses[i]} stroke-slate-50 dark:stroke-slate-900`).attr('stroke-width', 2)
        svg.append('text').attr('x', Cx).attr('y', oy + 14).attr('text-anchor', 'middle').attr('class', triFillClasses[i]).attr('font-size', 10).text(`C${tris > 1 ? i+1 : ''}`)
      })

      // Status Box
      let statusText = ''
      let boxClass = ''
      let textClass = ''

      if (tris === 0) {
        statusText = 'a < h — no triangle exists (side too short)'
        boxClass = 'fill-red-50 dark:fill-red-950/30 stroke-red-500'
        textClass = 'fill-red-500'
      } else if (tris === 2) {
        statusText = 'two triangles (ambiguous case!)'
        boxClass = 'fill-amber-50 dark:fill-amber-950/30 stroke-amber-600 dark:stroke-amber-400'
        textClass = 'fill-amber-600 dark:fill-amber-400'
      } else {
        statusText = aLen === Math.round(h) ? 'a = h — exactly one right triangle' : 'one triangle'
        boxClass = 'fill-emerald-50 dark:fill-emerald-950/30 stroke-emerald-600 dark:stroke-emerald-400'
        textClass = 'fill-emerald-600 dark:fill-emerald-400'
      }

      svg.append('rect').attr('x', W * 0.05).attr('y', 10).attr('width', W * 0.9).attr('height', 28).attr('rx', 6).attr('class', boxClass).attr('stroke-width', 1)
      svg.append('text').attr('x', W / 2).attr('y', 28).attr('text-anchor', 'middle').attr('class', textClass).attr('font-size', 12).attr('font-weight', 'bold').text(statusText)

      // Subtitle
      svg.append('text').attr('x', W / 2).attr('y', H - 4).attr('text-anchor', 'middle').attr('class', 'fill-slate-500 dark:fill-slate-400').attr('font-size', 10).text(`h = b·sin A = ${bLen}·sin 35° ≈ ${h.toFixed(1)} — the critical threshold`)
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [aLen, params.currentStep])

  return (
    <div ref={containerRef} className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2">
      <svg ref={svgRef} className="w-full bg-transparent" />
      <div className="flex items-center gap-3 px-2 pt-2 pb-1 mt-2 border-t border-slate-200 dark:border-slate-700/50">
        <span className="text-[13px] font-bold text-amber-600 dark:text-amber-400 min-w-[56px]">a = {aLen}</span>
        <input 
          type="range" 
          min={20} 
          max={140} 
          step={1} 
          value={aLen} 
          onChange={e => setALen(parseInt(e.target.value))} 
          className="flex-1 accent-amber-500 cursor-pointer" 
        />
        <span className="text-[11px] text-slate-500 dark:text-slate-400">drag to change</span>
      </div>
    </div>
  )
}
