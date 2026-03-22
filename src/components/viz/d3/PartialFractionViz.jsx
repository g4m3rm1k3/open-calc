import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * PartialFractionViz
 * Shows forward (add fractions → combined) and reverse (decompose) direction.
 * User adjusts A, B and denominator roots a, b.
 * Dark mode. ResizeObserver.
 */
export default function PartialFractionViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [A, setA] = useState(2)
  const [B, setB] = useState(3)
  const [a, setA_] = useState(1)
  const [b, setB_] = useState(-2)

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:     isDark ? '#0f172a' : '#f8fafc',
        panel:  isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '#334155' : '#e2e8f0',
        text:   isDark ? '#e2e8f0' : '#1e293b',
        muted:  isDark ? '#64748b' : '#94a3b8',
        A:      isDark ? '#38bdf8' : '#0284c7',
        B:      isDark ? '#a78bfa' : '#7c3aed',
        combo:  isDark ? '#34d399' : '#059669',
        arrow:  isDark ? '#fbbf24' : '#d97706',
      }

      const W = containerRef.current?.clientWidth || 520
      const H = 280
      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      const signFmt = (n) => n >= 0 ? `+ ${n}` : `− ${Math.abs(n)}`

      // ─── TOP: A/(x-a) + B/(x-b) ───
      const topY = 50
      const boxH = 56

      // Box A
      svg.append('rect').attr('x', 40).attr('y', topY).attr('width', 140).attr('height', boxH)
        .attr('rx', 8).attr('fill', C.panel).attr('stroke', C.A).attr('stroke-width', 1.5)
      svg.append('text').attr('x', 110).attr('y', topY + 22).attr('text-anchor', 'middle')
        .attr('fill', C.A).attr('font-size', 16).attr('font-weight', 'bold').text(A)
      svg.append('line').attr('x1', 56).attr('y1', topY + 30).attr('x2', 164).attr('y2', topY + 30)
        .attr('stroke', C.A).attr('stroke-width', 1.5)
      const denA = a >= 0 ? `x − ${a}` : `x + ${Math.abs(a)}`
      svg.append('text').attr('x', 110).attr('y', topY + 48).attr('text-anchor', 'middle')
        .attr('fill', C.A).attr('font-size', 14).text(denA)

      // Plus
      svg.append('text').attr('x', 200).attr('y', topY + boxH / 2 + 6)
        .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 20).text('+')

      // Box B
      svg.append('rect').attr('x', 220).attr('y', topY).attr('width', 140).attr('height', boxH)
        .attr('rx', 8).attr('fill', C.panel).attr('stroke', C.B).attr('stroke-width', 1.5)
      svg.append('text').attr('x', 290).attr('y', topY + 22).attr('text-anchor', 'middle')
        .attr('fill', C.B).attr('font-size', 16).attr('font-weight', 'bold').text(B)
      svg.append('line').attr('x1', 236).attr('y1', topY + 30).attr('x2', 344).attr('y2', topY + 30)
        .attr('stroke', C.B).attr('stroke-width', 1.5)
      const denB = b >= 0 ? `x − ${b}` : `x + ${Math.abs(b)}`
      svg.append('text').attr('x', 290).attr('y', topY + 48).attr('text-anchor', 'middle')
        .attr('fill', C.B).attr('font-size', 14).text(denB)

      // Double arrow (both directions)
      const arrowY = topY + boxH + 28
      svg.append('line').attr('x1', 180).attr('y1', arrowY).attr('x2', 180).attr('y2', arrowY + 28)
        .attr('stroke', C.arrow).attr('stroke-width', 2)
      svg.append('text').attr('x', 184).attr('y', arrowY + 15)
        .attr('fill', C.arrow).attr('font-size', 11).text('↓ add')
      svg.append('text').attr('x', 184).attr('y', arrowY + 28)
        .attr('fill', C.muted).attr('font-size', 10).text('↑ decompose')

      // ─── BOTTOM: Combined fraction ───
      const botY = topY + boxH + 68

      // Compute combined numerator: A(x-b) + B(x-a)
      const numX = A + B
      const numConst = -(A * b) - (B * a)
      const denB2 = -(a + b)
      const denC = a * b

      const numStr = numX === 0
        ? (numConst === 0 ? '0' : `${numConst}`)
        : (numConst === 0 ? `${numX}x` : `${numX}x ${signFmt(numConst)}`)

      const denStr = denB2 === 0
        ? (denC === 0 ? 'x²' : `x² + ${denC}`)
        : `x² ${signFmt(denB2)}x${denC !== 0 ? ` ${signFmt(denC)}` : ''}`

      svg.append('rect').attr('x', W / 2 - 140).attr('y', botY).attr('width', 280).attr('height', boxH)
        .attr('rx', 8).attr('fill', C.panel).attr('stroke', C.combo).attr('stroke-width', 1.5)
      svg.append('text').attr('x', W / 2).attr('y', botY + 22).attr('text-anchor', 'middle')
        .attr('fill', C.combo).attr('font-size', 15).attr('font-weight', 'bold').text(numStr)
      svg.append('line').attr('x1', W / 2 - 120).attr('y1', botY + 30).attr('x2', W / 2 + 120).attr('y2', botY + 30)
        .attr('stroke', C.combo).attr('stroke-width', 1.5)
      svg.append('text').attr('x', W / 2).attr('y', botY + 48).attr('text-anchor', 'middle')
        .attr('fill', C.combo).attr('font-size', 14).text(denStr)

      // Labels
      svg.append('text').attr('x', 400).attr('y', topY + 18)
        .attr('fill', C.muted).attr('font-size', 11).text('← partial fractions')
      svg.append('text').attr('x', 400).attr('y', botY + 28)
        .attr('fill', C.muted).attr('font-size', 11).text('← combined form')

      // Calc bridge note
      svg.append('text').attr('x', W / 2).attr('y', H - 12)
        .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10)
        .text(`∫ [combined] dx = ${A}·ln|x−${a}| + ${B}·ln|x−${b}| + C`)
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [A, B, a, b, params.currentStep])

  const row = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 13 }

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ padding: '8px 4px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {[
          { label: 'A', val: A, set: setA, col: '#38bdf8' },
          { label: 'B', val: B, set: setB, col: '#a78bfa' },
          { label: 'root a', val: a, set: setA_, col: '#38bdf8' },
          { label: 'root b', val: b, set: setB_, col: '#a78bfa' },
        ].map(({ label, val, set, col }) => (
          <div key={label} style={row}>
            <span style={{ color: col, minWidth: 48 }}>{label} = {val}</span>
            <input type="range" min={-4} max={4} step={1} value={val}
              onChange={e => set(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: col }} />
          </div>
        ))}
      </div>
    </div>
  )
}
