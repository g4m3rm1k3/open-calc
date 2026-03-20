import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 380

const PHASE_LABELS = [
  '0: The Triangle',
  '1: Second copy appears',
  '2: Parallelogram formed',
  '3: Area = ½ × base × height',
]

export default function TriangleAreaProof() {
  const svgRef = useRef(null)
  const [b, setB] = useState(6)
  const [h, setH] = useState(4)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const scale = Math.min(300 / Math.max(b, h + 1, 2), 50)
    const offset = b * 0.3

    // Triangle 1: A=(0,0), B=(b,0), C=(offset,h)  in unit coords
    // Parallelogram: A=(0,0), B=(b,0), A'=(b+offset,h), C=(offset,h)

    // For phase 2+ we need to center the parallelogram
    const paraW = (b + offset) * scale
    const paraH = h * scale
    const centerX = W / 2
    const centerY = H / 2 + 10

    // Pixel coords for triangle 1 (centered on canvas)
    const pA = [centerX - paraW / 2, centerY + paraH / 2]
    const pB = [centerX - paraW / 2 + b * scale, centerY + paraH / 2]
    const pC = [centerX - paraW / 2 + offset * scale, centerY - paraH / 2]
    // A' = B + (C - A) = (b + offset, h) in unit
    const pA2 = [centerX - paraW / 2 + (b + offset) * scale, centerY - paraH / 2]

    // ── Phase 0: single triangle with labels ──────────────────────────────
    if (phase === 0) {
      // Center just the triangle
      const triW = b * scale
      const triH = h * scale
      const ox = W / 2 - triW / 2
      const oy = H / 2 - triH / 2

      const tA = [ox, oy + triH]
      const tB = [ox + triW, oy + triH]
      const tC = [ox + offset * scale, oy]

      svg.append('polygon')
        .attr('points', [tA, tB, tC].map(p => p.join(',')).join(' '))
        .attr('fill', '#6470f1').attr('fill-opacity', 0.5)
        .attr('stroke', '#6470f1').attr('stroke-width', 2)

      // Height dashed line
      svg.append('line')
        .attr('x1', tC[0]).attr('y1', tC[1])
        .attr('x2', tC[0]).attr('y2', tA[1])
        .attr('stroke', '#10b981').attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '5,4')

      // Right angle marker at foot of height
      const footX = tC[0]
      const ms = 8
      svg.append('polyline')
        .attr('points', `${footX + ms},${tA[1]} ${footX + ms},${tA[1] - ms} ${footX},${tA[1] - ms}`)
        .attr('fill', 'none').attr('stroke', '#94a3b8').attr('stroke-width', 1.5)

      // Labels
      svg.append('text').attr('x', (tA[0] + tB[0]) / 2).attr('y', tA[1] + 20)
        .attr('text-anchor', 'middle').attr('font-size', 15).attr('fill', '#3b82f6').attr('font-weight', 'bold')
        .text('b')
      svg.append('text').attr('x', tC[0] + 14).attr('y', (tC[1] + tA[1]) / 2)
        .attr('font-size', 15).attr('fill', '#10b981').attr('font-weight', 'bold')
        .text('h')

      svg.append('text').attr('x', W / 2).attr('y', H - 25)
        .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', '#64748b')
        .text(`b = ${b}, h = ${h}, Area = ½ × ${b} × ${h} = ${(0.5 * b * h).toFixed(2)}`)
    }

    // ── Phase 1: original + second triangle offset to side ────────────────
    if (phase === 1) {
      // Original triangle at left-center
      const triW = b * scale
      const triH = h * scale
      const ox = W / 2 - triW - 20
      const oy = H / 2 - triH / 2

      const tA = [ox, oy + triH]
      const tB = [ox + triW, oy + triH]
      const tC = [ox + offset * scale, oy]

      svg.append('polygon')
        .attr('points', [tA, tB, tC].map(p => p.join(',')).join(' '))
        .attr('fill', '#6470f1').attr('fill-opacity', 0.5)
        .attr('stroke', '#6470f1').attr('stroke-width', 2)

      // Second triangle (rotated 180° about midpoint of AB => flipped, offset to right)
      const sep = 30
      const t2A = [ox + triW + sep, oy + triH]
      const t2B = [ox + triW + sep + triW, oy + triH]
      const t2A2 = [ox + triW + sep + (b + offset) * scale, oy]
      const t2C2 = [ox + triW + sep + offset * scale, oy]

      // The second triangle has vertices: B'=(offset,h), C'=(0,0), and goes to (b+offset,h)
      // Rotated: C=(offset,h), A=(0,0) → A'=(b+offset,h), B=(b,0)→ it's the flipped one
      // Second triangle: t2A (=A'), t2B (=B'=C of rot), t2C2 (=C')
      svg.append('polygon')
        .attr('points', [t2A, [t2A[0] + b * scale, t2A[1]], [t2A[0] + offset * scale, oy]].map(p => p.join(',')).join(' '))
        .attr('fill', '#f59e0b').attr('fill-opacity', 0.5)
        .attr('stroke', '#f59e0b').attr('stroke-width', 2)

      svg.append('text').attr('x', W / 2).attr('y', H - 25)
        .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', '#64748b')
        .text('A congruent copy of the triangle appears.')
    }

    // ── Phase 2: parallelogram ────────────────────────────────────────────
    if (phase === 2) {
      // Triangle 1: pA, pB, pC
      svg.append('polygon')
        .attr('points', [pA, pB, pC].map(p => p.join(',')).join(' '))
        .attr('fill', '#6470f1').attr('fill-opacity', 0.5)
        .attr('stroke', '#6470f1').attr('stroke-width', 2)

      // Triangle 2: pB, pA2, pC (shares edge pB-pC with triangle 1)
      svg.append('polygon')
        .attr('points', [pB, pA2, pC].map(p => p.join(',')).join(' '))
        .attr('fill', '#f59e0b').attr('fill-opacity', 0.5)
        .attr('stroke', '#f59e0b').attr('stroke-width', 2)

      // Shared edge pB-pC (dashed to show the internal diagonal)
      svg.append('line')
        .attr('x1', pB[0]).attr('y1', pB[1])
        .attr('x2', pC[0]).attr('y2', pC[1])
        .attr('stroke', '#94a3b8').attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '6,4')

      // Height line
      const footX = pC[0]
      svg.append('line')
        .attr('x1', footX).attr('y1', pC[1])
        .attr('x2', footX).attr('y2', pA[1])
        .attr('stroke', '#10b981').attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '5,4')
      svg.append('text').attr('x', footX + 10).attr('y', (pC[1] + pA[1]) / 2)
        .attr('font-size', 13).attr('fill', '#10b981').attr('font-weight', 'bold').text('h')

      // Base label
      svg.append('text').attr('x', (pA[0] + pB[0]) / 2).attr('y', pA[1] + 20)
        .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', '#3b82f6').attr('font-weight', 'bold').text('b')

      svg.append('text').attr('x', W / 2).attr('y', H - 25)
        .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', '#64748b')
        .text('Together they form a parallelogram with base b and height h.')
    }

    // ── Phase 3: labels and proof ─────────────────────────────────────────
    if (phase === 3) {
      // Draw parallelogram lightly
      svg.append('polygon')
        .attr('points', [pA, pB, pA2, pC].map(p => p.join(',')).join(' '))
        .attr('fill', '#6470f1').attr('fill-opacity', 0.2)
        .attr('stroke', '#6470f1').attr('stroke-width', 1.5)

      // Diagonal
      svg.append('line')
        .attr('x1', pB[0]).attr('y1', pB[1])
        .attr('x2', pC[0]).attr('y2', pC[1])
        .attr('stroke', '#94a3b8').attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '6,4')

      // Labels on parallelogram
      svg.append('text').attr('x', (pA[0] + pB[0]) / 2).attr('y', pA[1] + 20)
        .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', '#3b82f6').attr('font-weight', 'bold').text('b')
      svg.append('text').attr('x', pC[0] + 12).attr('y', (pC[1] + pA[1]) / 2)
        .attr('font-size', 13).attr('fill', '#10b981').attr('font-weight', 'bold').text('h')

      // Equations
      const eqX = W / 2
      const eqY = H - 100
      svg.append('text').attr('x', eqX).attr('y', eqY)
        .attr('text-anchor', 'middle').attr('font-size', 14).attr('fill', '#64748b')
        .text('Area of parallelogram = b × h')
      svg.append('text').attr('x', eqX).attr('y', eqY + 26)
        .attr('text-anchor', 'middle').attr('font-size', 16).attr('fill', '#f59e0b').attr('font-weight', 'bold')
        .text('Area of triangle = ½ × b × h')
      svg.append('text').attr('x', eqX).attr('y', eqY + 54)
        .attr('text-anchor', 'middle').attr('font-size', 15).attr('fill', '#10b981')
        .text(`= ½ × ${b} × ${h} = ${(0.5 * b * h).toFixed(2)}`)
    }
  }, [phase, b, h])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <SliderControl label="base b" min={1} max={8} step={0.5} value={b} onChange={setB} />
        <SliderControl label="height h" min={1} max={6} step={0.5} value={h} onChange={setH} />
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
