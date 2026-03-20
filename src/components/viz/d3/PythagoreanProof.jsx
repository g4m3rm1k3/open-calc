import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 400

const PHASE_LABELS = [
  '0: The Triangle',
  '1: c² in the center',
  '2: a² + b² revealed',
  '3: Proof Complete',
]

export default function PythagoreanProof() {
  const svgRef = useRef(null)
  const [a, setA] = useState(3)
  const [b, setB] = useState(4)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const c = Math.sqrt(a * a + b * b)
    const S = a + b
    const scale = Math.min(260 / S, 45)

    const sqSize = S * scale
    const ox = (W - sqSize) / 2
    const oy = (H - sqSize) / 2 - 10

    // ── Phase 0: draw just the right triangle ───────────────────────────────
    if (phase === 0) {
      const ts = Math.min(200 / Math.max(a, b, c), 50)
      const tx = W / 2 - (b * ts) / 2
      const ty = H / 2 + (a * ts) / 2

      // right triangle: A=(0,a), B=(b,a), C=(0,0) in unit coords
      // SVG y-down: A=(tx, ty - a*ts), B=(tx + b*ts, ty - a*ts), C=(tx, ty)
      const A = [tx, ty - a * ts]
      const B = [tx + b * ts, ty - a * ts]
      const Cv = [tx, ty]

      svg.append('polygon')
        .attr('points', [A, B, Cv].map(p => p.join(',')).join(' '))
        .attr('fill', '#6470f1')
        .attr('fill-opacity', 0.4)
        .attr('stroke', '#6470f1')
        .attr('stroke-width', 2)

      // right-angle marker
      const ms = 10
      svg.append('polyline')
        .attr('points', `${Cv[0] + ms},${Cv[1]} ${Cv[0] + ms},${Cv[1] - ms} ${Cv[0]},${Cv[1] - ms}`)
        .attr('fill', 'none')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1.5)

      // Labels
      svg.append('text').attr('x', (A[0] + Cv[0]) / 2 - 18).attr('y', (A[1] + Cv[1]) / 2)
        .attr('text-anchor', 'middle').attr('font-size', 15).attr('fill', '#10b981').attr('font-weight', 'bold').text('a')
      svg.append('text').attr('x', (A[0] + B[0]) / 2).attr('y', A[1] - 10)
        .attr('text-anchor', 'middle').attr('font-size', 15).attr('fill', '#3b82f6').attr('font-weight', 'bold').text('b')
      const midHyp = [(B[0] + Cv[0]) / 2 + 12, (B[1] + Cv[1]) / 2]
      svg.append('text').attr('x', midHyp[0]).attr('y', midHyp[1])
        .attr('text-anchor', 'middle').attr('font-size', 15).attr('fill', '#f59e0b').attr('font-weight', 'bold').text('c')

      svg.append('text').attr('x', W / 2).attr('y', H - 20)
        .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', '#64748b')
        .text(`a = ${a}, b = ${b}, c = √(${a}²+${b}²) = ${c.toFixed(3)}`)
    }

    // ── Phase 1: (a+b)² outer square, 4 triangles, c² tilted inner square ──
    if (phase === 1) {
      // Outer square
      svg.append('rect')
        .attr('x', ox).attr('y', oy)
        .attr('width', sqSize).attr('height', sqSize)
        .attr('fill', 'none').attr('stroke', '#94a3b8').attr('stroke-width', 2)

      // Inner c² square vertices (on edges of outer square)
      const px = [
        [ox + a * scale, oy],
        [ox + sqSize, oy + a * scale],
        [ox + b * scale, oy + sqSize],
        [ox, oy + b * scale],
      ]

      // 4 triangles
      const corners = [
        [ox, oy],
        [ox + sqSize, oy],
        [ox + sqSize, oy + sqSize],
        [ox, oy + sqSize],
      ]
      const triPts = [
        [corners[0], px[0], px[3]],
        [corners[1], px[1], px[0]],
        [corners[2], px[2], px[1]],
        [corners[3], px[3], px[2]],
      ]
      triPts.forEach(tri => {
        svg.append('polygon')
          .attr('points', tri.map(p => p.join(',')).join(' '))
          .attr('fill', '#6470f1')
          .attr('fill-opacity', 0.4)
          .attr('stroke', '#6470f1')
          .attr('stroke-width', 1.5)
      })

      // c² inner square
      svg.append('polygon')
        .attr('points', px.map(p => p.join(',')).join(' '))
        .attr('fill', '#f59e0b')
        .attr('fill-opacity', 0.5)
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2)

      // Label c²
      const cx = px.reduce((s, p) => s + p[0], 0) / 4
      const cy = px.reduce((s, p) => s + p[1], 0) / 4
      svg.append('text').attr('x', cx).attr('y', cy - 6)
        .attr('text-anchor', 'middle').attr('font-size', 16).attr('fill', '#f59e0b').attr('font-weight', 'bold').text('c²')
      svg.append('text').attr('x', cx).attr('y', cy + 14)
        .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#f59e0b')
        .text(`= ${(c * c).toFixed(2)}`)

      // Outer square label
      svg.append('text').attr('x', ox + sqSize / 2).attr('y', oy - 8)
        .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', '#94a3b8')
        .text(`(a+b)² = ${S}² = ${S * S}`)

      svg.append('text').attr('x', W / 2).attr('y', H - 20)
        .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#64748b')
        .text('4 triangles + c² = (a+b)²')
    }

    // ── Phase 2: same outer square, a² + b² arrangement ───────────────────
    if (phase === 2) {
      // Outer square
      svg.append('rect')
        .attr('x', ox).attr('y', oy)
        .attr('width', sqSize).attr('height', sqSize)
        .attr('fill', 'none').attr('stroke', '#94a3b8').attr('stroke-width', 2)

      const aS = a * scale
      const bS = b * scale

      // a² square (top-left)
      svg.append('rect')
        .attr('x', ox).attr('y', oy)
        .attr('width', aS).attr('height', aS)
        .attr('fill', '#10b981').attr('fill-opacity', 0.5)
        .attr('stroke', '#10b981').attr('stroke-width', 1.5)

      svg.append('text').attr('x', ox + aS / 2).attr('y', oy + aS / 2 + 6)
        .attr('text-anchor', 'middle').attr('font-size', 14).attr('fill', '#10b981').attr('font-weight', 'bold').text('a²')

      // b² square (bottom-right)
      svg.append('rect')
        .attr('x', ox + aS).attr('y', oy + aS)
        .attr('width', bS).attr('height', bS)
        .attr('fill', '#3b82f6').attr('fill-opacity', 0.5)
        .attr('stroke', '#3b82f6').attr('stroke-width', 1.5)

      svg.append('text').attr('x', ox + aS + bS / 2).attr('y', oy + aS + bS / 2 + 6)
        .attr('text-anchor', 'middle').attr('font-size', 14).attr('fill', '#3b82f6').attr('font-weight', 'bold').text('b²')

      // Top-right rectangle with 2 triangles
      // T1: (ox+aS, oy), (ox+sqSize, oy), (ox+sqSize, oy+aS)
      svg.append('polygon')
        .attr('points', `${ox + aS},${oy} ${ox + sqSize},${oy} ${ox + sqSize},${oy + aS}`)
        .attr('fill', '#6470f1').attr('fill-opacity', 0.4)
        .attr('stroke', '#6470f1').attr('stroke-width', 1.5)
      // T2: (ox+aS, oy), (ox+sqSize, oy+aS), (ox+aS, oy+aS)
      svg.append('polygon')
        .attr('points', `${ox + aS},${oy} ${ox + sqSize},${oy + aS} ${ox + aS},${oy + aS}`)
        .attr('fill', '#6470f1').attr('fill-opacity', 0.4)
        .attr('stroke', '#6470f1').attr('stroke-width', 1.5)

      // Bottom-left rectangle with 2 triangles
      // T3: (ox, oy+aS), (ox+aS, oy+aS), (ox, oy+sqSize)
      svg.append('polygon')
        .attr('points', `${ox},${oy + aS} ${ox + aS},${oy + aS} ${ox},${oy + sqSize}`)
        .attr('fill', '#6470f1').attr('fill-opacity', 0.4)
        .attr('stroke', '#6470f1').attr('stroke-width', 1.5)
      // T4: (ox+aS, oy+aS), (ox, oy+sqSize), (ox+aS, oy+sqSize)
      svg.append('polygon')
        .attr('points', `${ox + aS},${oy + aS} ${ox},${oy + sqSize} ${ox + aS},${oy + sqSize}`)
        .attr('fill', '#6470f1').attr('fill-opacity', 0.4)
        .attr('stroke', '#6470f1').attr('stroke-width', 1.5)

      svg.append('text').attr('x', W / 2).attr('y', H - 20)
        .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#64748b')
        .text('4 triangles + a² + b² = (a+b)²')
    }

    // ── Phase 3: proof complete ─────────────────────────────────────────────
    if (phase === 3) {
      const midX = W / 2
      const startY = 80

      svg.append('text').attr('x', midX).attr('y', startY)
        .attr('text-anchor', 'middle').attr('font-size', 18).attr('fill', '#6470f1').attr('font-weight', 'bold')
        .text('Proof Complete!')

      svg.append('text').attr('x', midX).attr('y', startY + 40)
        .attr('text-anchor', 'middle').attr('font-size', 14).attr('fill', '#64748b')
        .text('Both arrangements fill the same (a+b)² outer square.')

      svg.append('text').attr('x', midX).attr('y', startY + 65)
        .attr('text-anchor', 'middle').attr('font-size', 14).attr('fill', '#64748b')
        .text('Arrangement 1:  4 triangles + c²  = (a+b)²')

      svg.append('text').attr('x', midX).attr('y', startY + 90)
        .attr('text-anchor', 'middle').attr('font-size', 14).attr('fill', '#64748b')
        .text('Arrangement 2:  4 triangles + a² + b²  = (a+b)²')

      svg.append('line')
        .attr('x1', midX - 160).attr('x2', midX + 160)
        .attr('y1', startY + 108).attr('y2', startY + 108)
        .attr('stroke', '#94a3b8').attr('stroke-width', 1)

      svg.append('text').attr('x', midX).attr('y', startY + 140)
        .attr('text-anchor', 'middle').attr('font-size', 22).attr('fill', '#f59e0b').attr('font-weight', 'bold')
        .text('∴  c²  =  a²  +  b²')

      svg.append('text').attr('x', midX).attr('y', startY + 180)
        .attr('text-anchor', 'middle').attr('font-size', 16).attr('fill', '#94a3b8')
        .text(`With a=${a}, b=${b}: ${(a * a)} + ${(b * b)} = ${(a * a + b * b)} = c²`)

      svg.append('text').attr('x', midX).attr('y', startY + 210)
        .attr('text-anchor', 'middle').attr('font-size', 14).attr('fill', '#10b981')
        .text(`c = √${a * a + b * b} ≈ ${c.toFixed(4)}`)
    }
  }, [phase, a, b])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <SliderControl label="a (leg)" min={1} max={5} step={0.5} value={a} onChange={setA} />
        <SliderControl label="b (leg)" min={1} max={5} step={0.5} value={b} onChange={setB} />
      </div>
      <div className="flex items-center justify-center gap-4 mt-3">
        <button
          onClick={() => setPhase(p => Math.max(0, p - 1))}
          disabled={phase === 0}
          className="px-4 py-1.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm disabled:opacity-40 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
        >
          ← Previous
        </button>
        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">{PHASE_LABELS[phase]}</span>
        <button
          onClick={() => setPhase(p => Math.min(3, p + 1))}
          disabled={phase === 3}
          className="px-4 py-1.5 rounded bg-brand-500 text-white text-sm disabled:opacity-40 hover:bg-brand-600 transition"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
