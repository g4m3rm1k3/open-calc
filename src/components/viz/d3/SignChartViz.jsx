import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * SignChartViz
 * Enter zeros of a factored polynomial, see the sign chart build automatically.
 * Each interval coloured green (positive) or red (negative).
 * Dark mode. ResizeObserver.
 */
export default function SignChartViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [zeros, setZeros] = useState([-2, 1, 3])
  const [input, setInput] = useState('-2, 1, 3')

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:    isDark ? '#0f172a' : '#f8fafc',
        axis:  isDark ? '#475569' : '#94a3b8',
        text:  isDark ? '#e2e8f0' : '#1e293b',
        muted: isDark ? '#64748b' : '#94a3b8',
        pos:   isDark ? 'rgba(52,211,153,0.25)' : 'rgba(5,150,105,0.12)',
        neg:   isDark ? 'rgba(248,113,113,0.25)' : 'rgba(220,38,38,0.12)',
        posS:  isDark ? '#34d399' : '#059669',
        negS:  isDark ? '#f87171' : '#ef4444',
        zero:  isDark ? '#fbbf24' : '#d97706',
      }

      const W = containerRef.current?.clientWidth || 480
      const H = 140
      const pad = { l: 48, r: 48, t: 40, b: 40 }
      const iW = W - pad.l - pad.r

      const sorted = [...zeros].sort((a, b) => a - b)
      const margin = 2
      const domMin = (sorted[0] ?? -3) - margin
      const domMax = (sorted[sorted.length - 1] ?? 3) + margin
      const xS = d3.scaleLinear().domain([domMin, domMax]).range([pad.l, pad.l + iW])
      const midY = pad.t + (H - pad.t - pad.b) / 2

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      // Intervals
      const breakpoints = [domMin, ...sorted, domMax]
      breakpoints.slice(0, -1).forEach((lo, i) => {
        const hi = breakpoints[i + 1]
        const testX = (lo + hi) / 2
        const sign = sorted.reduce((prod, z) => prod * (testX - z), 1)
        const isPos = sign >= 0

        svg.append('rect')
          .attr('x', xS(lo)).attr('y', pad.t)
          .attr('width', xS(hi) - xS(lo))
          .attr('height', H - pad.t - pad.b)
          .attr('fill', isPos ? C.pos : C.neg)

        svg.append('text')
          .attr('x', (xS(lo) + xS(hi)) / 2)
          .attr('y', midY)
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
          .attr('fill', isPos ? C.posS : C.negS)
          .attr('font-size', 18).attr('font-weight', 'bold')
          .text(isPos ? '+' : '−')
      })

      // Number line
      svg.append('line').attr('x1', pad.l - 8).attr('y1', midY).attr('x2', pad.l + iW + 8).attr('y2', midY)
        .attr('stroke', C.axis).attr('stroke-width', 2)

      // Zeros
      sorted.forEach(z => {
        const sx = xS(z)
        svg.append('circle').attr('cx', sx).attr('cy', midY).attr('r', 7)
          .attr('fill', C.bg).attr('stroke', C.zero).attr('stroke-width', 2.5)
        svg.append('text').attr('x', sx).attr('y', midY - 14)
          .attr('text-anchor', 'middle').attr('fill', C.zero).attr('font-size', 12).attr('font-weight', 'bold')
          .text(z)
      })

      // Legend
      svg.append('text').attr('x', pad.l).attr('y', H - 8)
        .attr('fill', C.posS).attr('font-size', 11).text('+ positive region')
      svg.append('text').attr('x', pad.l + iW).attr('y', H - 8)
        .attr('text-anchor', 'end').attr('fill', C.negS).attr('font-size', 11).text('− negative region')
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [zeros, params.currentStep])

  const handleInput = (val) => {
    setInput(val)
    const parsed = val.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
    if (parsed.length > 0) setZeros(parsed)
  }

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 0', fontSize: 13 }}>
        <span style={{ color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Zeros (comma-separated):</span>
        <input value={input} onChange={e => handleInput(e.target.value)}
          style={{ flex: 1, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--color-border-secondary)', background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', fontSize: 13 }} />
      </div>
      <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>
        Sign is constant between zeros — only changes when crossing a zero of odd multiplicity
      </p>
    </div>
  )
}
