import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 400
const M = { top: 30, right: 30, bottom: 30, left: 30 }

export default function ProductRuleRectangle({ params }) {
  const svgRef = useRef(null)
  const [x, setX] = useState(2)
  const [dx, setDx] = useState(0.5)

  // f(x) = x, g(x) = x+1 (simple example)
  const f = (t) => t
  const g = (t) => t + 1

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const fv = f(x), gv = g(x)
    const fvNew = f(x + dx), gvNew = g(x + dx)
    const df = fvNew - fv, dg = gvNew - gv

    // Scale to fit
    const maxW = Math.max(fvNew, fv + df + 0.5) + 0.5
    const maxH = Math.max(gvNew, gv + dg + 0.5) + 0.5
    const scX = d3.scaleLinear().domain([0, maxW]).range([M.left + 60, W - M.right])
    const scY = d3.scaleLinear().domain([0, maxH]).range([H - M.bottom - 20, M.top + 30])

    // Title
    svg.append('text').attr('x', W / 2).attr('y', 18).attr('text-anchor', 'middle')
      .attr('font-size', 13).attr('fill', '#64748b').attr('font-weight', 'bold')
      .text('Area = f(x) · g(x) — How it changes when x changes')

    // Original rectangle f × g
    svg.append('rect')
      .attr('x', scX(0)).attr('y', scY(gv))
      .attr('width', scX(fv) - scX(0)).attr('height', scY(0) - scY(gv))
      .attr('fill', '#6470f1').attr('opacity', 0.2).attr('stroke', '#6470f1').attr('stroke-width', 2)

    // f · Δg strip (top)
    svg.append('rect')
      .attr('x', scX(0)).attr('y', scY(gv + dg))
      .attr('width', scX(fv) - scX(0)).attr('height', scY(gv) - scY(gv + dg))
      .attr('fill', '#10b981').attr('opacity', 0.35).attr('stroke', '#10b981').attr('stroke-width', 1.5)

    // g · Δf strip (right)
    svg.append('rect')
      .attr('x', scX(fv)).attr('y', scY(gv))
      .attr('width', scX(fv + df) - scX(fv)).attr('height', scY(0) - scY(gv))
      .attr('fill', '#f59e0b').attr('opacity', 0.35).attr('stroke', '#f59e0b').attr('stroke-width', 1.5)

    // Δf · Δg corner (tiny, negligible)
    svg.append('rect')
      .attr('x', scX(fv)).attr('y', scY(gv + dg))
      .attr('width', scX(fv + df) - scX(fv)).attr('height', scY(gv) - scY(gv + dg))
      .attr('fill', '#ef4444').attr('opacity', 0.3).attr('stroke', '#ef4444').attr('stroke-width', 1)

    // Labels
    // f(x)
    svg.append('text').attr('x', (scX(0) + scX(fv)) / 2).attr('y', H - M.bottom)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#6470f1').attr('font-weight', 'bold')
      .text(`f(x) = ${fv.toFixed(1)}`)

    // g(x)
    svg.append('text').attr('x', M.left + 10).attr('y', (scY(0) + scY(gv)) / 2)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#6470f1').attr('font-weight', 'bold')
      .attr('transform', `rotate(-90, ${M.left + 10}, ${(scY(0) + scY(gv)) / 2})`)
      .text(`g(x) = ${gv.toFixed(1)}`)

    // Δf label
    svg.append('text').attr('x', (scX(fv) + scX(fv + df)) / 2).attr('y', H - M.bottom)
      .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#f59e0b')
      .text(`Δf = ${df.toFixed(2)}`)

    // Δg label
    svg.append('text').attr('x', M.left + 10).attr('y', (scY(gv) + scY(gv + dg)) / 2)
      .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#10b981')
      .attr('transform', `rotate(-90, ${M.left + 10}, ${(scY(gv) + scY(gv + dg)) / 2})`)
      .text(`Δg = ${dg.toFixed(2)}`)

    // Area labels inside regions
    const area1 = (fv * dg).toFixed(2)
    const area2 = (gv * df).toFixed(2)
    const area3 = (df * dg).toFixed(3)

    svg.append('text').attr('x', (scX(0) + scX(fv)) / 2).attr('y', (scY(gv) + scY(gv + dg)) / 2 + 4)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#10b981').attr('font-weight', 'bold')
      .text(`f·Δg ≈ ${area1}`)

    svg.append('text').attr('x', (scX(fv) + scX(fv + df)) / 2).attr('y', (scY(0) + scY(gv)) / 2 + 4)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#f59e0b').attr('font-weight', 'bold')
      .text(`g·Δf ≈ ${area2}`)

    if (scX(fv + df) - scX(fv) > 25) {
      svg.append('text').attr('x', (scX(fv) + scX(fv + df)) / 2).attr('y', (scY(gv) + scY(gv + dg)) / 2 + 4)
        .attr('text-anchor', 'middle').attr('font-size', 9).attr('fill', '#ef4444')
        .text(`≈ ${area3}`)
    }

    // Summary
    svg.append('text').attr('x', W / 2).attr('y', M.top + 18).attr('text-anchor', 'middle')
      .attr('font-size', 11).attr('fill', '#64748b')
      .text(`Δ(f·g) = f·Δg + g·Δf + Δf·Δg  →  (fg)' = f·g' + g·f'`)

    svg.append('text').attr('x', W / 2).attr('y', M.top + 34).attr('text-anchor', 'middle')
      .attr('font-size', 10).attr('fill', '#94a3b8')
      .text(`The red corner (Δf·Δg = ${area3}) vanishes as Δx → 0`)

  }, [x, dx])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <SliderControl label="x" min={0.5} max={4} step={0.1} value={x} onChange={setX} />
        <SliderControl label="Δx (change in x)" min={0.05} max={1.5} step={0.05} value={dx} onChange={setDx} />
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        The product f(x)·g(x) is the area of the blue rectangle. When x increases by Δx, the area grows by the green strip (f·Δg) + the orange strip (g·Δf) + a tiny red corner (Δf·Δg). As Δx→0, the corner vanishes, giving the product rule.
      </p>
    </div>
  )
}
