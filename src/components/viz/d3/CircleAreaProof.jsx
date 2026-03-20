import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 360

export default function CircleAreaProof() {
  const svgRef = useRef(null)
  const [n, setN] = useState(8)
  const [r, setR] = useState(80)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const leftCx = W * 0.28
    const leftCy = H * 0.48
    const arcLen = (2 * Math.PI * r) / n
    const halfPiR = Math.PI * r  // total rearranged width

    // ── Left: circle divided into n sectors ────────────────────────────────
    const arc = d3.arc().innerRadius(0).outerRadius(r)

    for (let i = 0; i < n; i++) {
      const startAngle = (i * 2 * Math.PI) / n - Math.PI / 2
      const endAngle = ((i + 1) * 2 * Math.PI) / n - Math.PI / 2
      const color = i % 2 === 0 ? '#6470f1' : '#f59e0b'

      svg.append('path')
        .attr('transform', `translate(${leftCx},${leftCy})`)
        .attr('d', arc({ startAngle, endAngle }))
        .attr('fill', color)
        .attr('fill-opacity', 0.7)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.8)
    }

    // r label
    svg.append('line')
      .attr('x1', leftCx).attr('y1', leftCy)
      .attr('x2', leftCx + r).attr('y2', leftCy)
      .attr('stroke', '#10b981').attr('stroke-width', 2)
    svg.append('text')
      .attr('x', leftCx + r / 2).attr('y', leftCy - 6)
      .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', '#10b981').attr('font-weight', 'bold')
      .text('r')

    svg.append('text')
      .attr('x', leftCx).attr('y', leftCy + r + 24)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#64748b')
      .text(`Circle: A = πr²`)

    // ── Right: rearranged sectors ──────────────────────────────────────────
    const rightCx = W * 0.73
    const rightCy = H * 0.52
    const totalWidth = halfPiR  // ≈ πr
    const startX = rightCx - totalWidth / 2

    // Draw n/2 "up" triangles interleaved with n/2 "down" triangles
    // Each sector approximated as isoceles triangle: base=arcLen, height=r
    for (let i = 0; i < n; i++) {
      const isEven = i % 2 === 0
      const color = isEven ? '#6470f1' : '#f59e0b'
      const xPos = startX + i * arcLen
      let pts

      if (isEven) {
        // Triangle pointing up: base on bottom, apex at top
        const bx = xPos
        const by = rightCy
        pts = [
          [bx, by],
          [bx + arcLen, by],
          [bx + arcLen / 2, by - r],
        ]
      } else {
        // Triangle pointing down: base on top, apex at bottom
        const bx = xPos
        const by = rightCy - r
        pts = [
          [bx, by],
          [bx + arcLen, by],
          [bx + arcLen / 2, by + r],
        ]
      }

      svg.append('polygon')
        .attr('points', pts.map(p => p.join(',')).join(' '))
        .attr('fill', color)
        .attr('fill-opacity', 0.7)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
    }

    // Width label (≈ πr)
    const labelY = rightCy + 16
    svg.append('line')
      .attr('x1', startX).attr('y1', labelY)
      .attr('x2', startX + totalWidth).attr('y2', labelY)
      .attr('stroke', '#3b82f6').attr('stroke-width', 1.5)
      .attr('marker-start', 'url(#arrL)').attr('marker-end', 'url(#arrR)')
    svg.append('text')
      .attr('x', startX + totalWidth / 2).attr('y', labelY + 16)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#3b82f6').attr('font-weight', 'bold')
      .text('≈ πr')

    // Height label (≈ r)
    svg.append('line')
      .attr('x1', startX - 10).attr('y1', rightCy - r)
      .attr('x2', startX - 10).attr('y2', rightCy)
      .attr('stroke', '#10b981').attr('stroke-width', 1.5)
    svg.append('text')
      .attr('x', startX - 20).attr('y', rightCy - r / 2)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#10b981').attr('font-weight', 'bold')
      .text('≈ r')

    // Area label
    svg.append('text')
      .attr('x', rightCx).attr('y', rightCy + 48)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#f59e0b').attr('font-weight', 'bold')
      .text('Area ≈ πr × r = πr²')

    // Accuracy note
    const actualArea = Math.PI * r * r
    const approxArea = (n / 2) * (1 / 2) * arcLen * r * n  // n triangles each ½ × arcLen × r
    const triArea = n * 0.5 * arcLen * r
    const pctErr = Math.abs(triArea - actualArea) / actualArea * 100

    svg.append('text')
      .attr('x', W / 2).attr('y', H - 8)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#94a3b8')
      .text(`n=${n} sectors · approx area = ${triArea.toFixed(1)} · exact = ${actualArea.toFixed(1)} · error = ${pctErr.toFixed(2)}%`)

    // Title
    svg.append('text')
      .attr('x', W / 2).attr('y', 18)
      .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', '#64748b')
      .text('Rearranging circle sectors shows Area = πr²')

  }, [n, r])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <SliderControl
          label="n (sectors)"
          min={4} max={32} step={2}
          value={n} onChange={setN}
          format={v => String(v)}
        />
        <SliderControl
          label="r (radius px)"
          min={40} max={100} step={5}
          value={r} onChange={setR}
          format={v => String(v)}
        />
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        As n → ∞ the rearranged shape becomes a perfect rectangle of width πr and height r, so Area = πr².
      </p>
    </div>
  )
}
