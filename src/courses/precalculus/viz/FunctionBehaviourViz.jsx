import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * FunctionBehaviourViz
 * Toggle between 4 rational functions, each demonstrating a different asymptote type.
 * Shows VAs (dashed red), HA/oblique (dashed orange), holes (open circle).
 * Dark mode. ResizeObserver.
 */
export default function FunctionBehaviourViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [selected, setSelected] = useState(0)

  const functions = [
    {
      label: 'VA + HA',
      expr: '(x+1)/(x−2)',
      f: x => (x + 1) / (x - 2),
      va: [2], ha: 1, oblique: null, holes: [],
      desc: 'Vertical asymptote at x=2 (denominator=0, numerator≠0). Horizontal asymptote y=1 (equal degrees).',
    },
    {
      label: 'Hole + VA',
      expr: '(x²−x−2)/(x²−4)',
      f: x => {
        if (Math.abs(x + 2) < 0.01) return null
        const n = x * x - x - 2
        const d = x * x - 4
        return Math.abs(d) < 1e-9 ? null : n / d
      },
      va: [2], ha: 1, oblique: null,
      holes: [{ x: -2, y: 5 / 4 }],
      desc: 'Hole at (−2, 5/4): (x+2) cancels. Vertical asymptote at x=2. Horizontal asymptote y=1.',
    },
    {
      label: 'Oblique',
      expr: '(x²+3x−2)/(x−1)',
      f: x => (x * x + 3 * x - 2) / (x - 1),
      va: [1], ha: null, oblique: { m: 1, b: 4 }, holes: [],
      desc: 'Oblique asymptote y=x+4 (degree of numerator exceeds denominator by 1). Long division gives x+4 + 2/(x−1).',
    },
    {
      label: 'HA y=0',
      expr: '3/(x²+1)',
      f: x => 3 / (x * x + 1),
      va: [], ha: 0, oblique: null, holes: [],
      desc: 'Numerator degree < denominator degree → horizontal asymptote y=0. No vertical asymptotes (denominator always positive).',
    },
  ]

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:       isDark ? '#0f172a' : '#f8fafc',
        panel:    isDark ? '#1e293b' : '#ffffff',
        border:   isDark ? '#334155' : '#e2e8f0',
        axis:     isDark ? '#475569' : '#94a3b8',
        grid:     isDark ? '#1e293b' : '#f1f5f9',
        text:     isDark ? '#e2e8f0' : '#1e293b',
        muted:    isDark ? '#64748b' : '#94a3b8',
        curve:    isDark ? '#38bdf8' : '#0284c7',
        va:       isDark ? '#f87171' : '#ef4444',
        ha:       isDark ? '#fbbf24' : '#d97706',
        oblique:  isDark ? '#a78bfa' : '#7c3aed',
        hole:     isDark ? '#fbbf24' : '#d97706',
      }

      const fn = functions[selected]
      const W = containerRef.current?.clientWidth || 480
      const H = Math.round(W * 0.7)
      const pad = { t: 28, b: 30, l: 42, r: 16 }
      const iW = W - pad.l - pad.r
      const iH = H - pad.t - pad.b

      const xDom = [-7, 7], yDom = [-8, 10]
      const xS = d3.scaleLinear().domain(xDom).range([pad.l, pad.l + iW])
      const yS = d3.scaleLinear().domain(yDom).range([pad.t + iH, pad.t])

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      // Grid
      for (let i = xDom[0]; i <= xDom[1]; i++) {
        svg.append('line').attr('x1', xS(i)).attr('y1', pad.t).attr('x2', xS(i)).attr('y2', pad.t + iH)
          .attr('stroke', C.grid).attr('stroke-width', 1)
      }
      for (let i = yDom[0]; i <= yDom[1]; i += 2) {
        svg.append('line').attr('x1', pad.l).attr('y1', yS(i)).attr('x2', pad.l + iW).attr('y2', yS(i))
          .attr('stroke', C.grid).attr('stroke-width', 1)
      }

      // Axes
      svg.append('line').attr('x1', pad.l).attr('y1', yS(0)).attr('x2', pad.l + iW).attr('y2', yS(0))
        .attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', xS(0)).attr('y1', pad.t).attr('x2', xS(0)).attr('y2', pad.t + iH)
        .attr('stroke', C.axis).attr('stroke-width', 1.5)

      // Tick labels
      for (let i = xDom[0]; i <= xDom[1]; i += 2) {
        if (i === 0) continue
        svg.append('text').attr('x', xS(i)).attr('y', yS(0) + 13)
          .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(i)
      }

      // Vertical asymptotes
      fn.va.forEach(va => {
        svg.append('line')
          .attr('x1', xS(va)).attr('y1', pad.t)
          .attr('x2', xS(va)).attr('y2', pad.t + iH)
          .attr('stroke', C.va).attr('stroke-width', 1.5).attr('stroke-dasharray', '6,4')
        svg.append('text')
          .attr('x', xS(va) + 4).attr('y', pad.t + 12)
          .attr('fill', C.va).attr('font-size', 10).attr('font-weight', 'bold')
          .text(`VA: x=${va}`)
      })

      // Horizontal asymptote
      if (fn.ha !== null) {
        svg.append('line')
          .attr('x1', pad.l).attr('y1', yS(fn.ha))
          .attr('x2', pad.l + iW).attr('y2', yS(fn.ha))
          .attr('stroke', C.ha).attr('stroke-width', 1.5).attr('stroke-dasharray', '6,4')
        svg.append('text')
          .attr('x', pad.l + iW - 4).attr('y', yS(fn.ha) - 5)
          .attr('text-anchor', 'end').attr('fill', C.ha).attr('font-size', 10).attr('font-weight', 'bold')
          .text(`HA: y=${fn.ha}`)
      }

      // Oblique asymptote
      if (fn.oblique) {
        const { m, b } = fn.oblique
        svg.append('line')
          .attr('x1', xS(xDom[0])).attr('y1', yS(m * xDom[0] + b))
          .attr('x2', xS(xDom[1])).attr('y2', yS(m * xDom[1] + b))
          .attr('stroke', C.oblique).attr('stroke-width', 1.5).attr('stroke-dasharray', '6,4')
        svg.append('text')
          .attr('x', pad.l + iW - 4).attr('y', yS(m * xDom[1] + b) - 5)
          .attr('text-anchor', 'end').attr('fill', C.oblique).attr('font-size', 10).attr('font-weight', 'bold')
          .text(`Oblique: y=${m > 0 ? '' : ''}${m}x+${b}`)
      }

      // Curve — split at VAs
      const allBreaks = [...fn.va]
      const segments = []
      let prev = xDom[0]
      ;[...allBreaks.sort((a, b) => a - b), xDom[1]].forEach(brk => {
        segments.push([prev + 0.05, brk - 0.05])
        prev = brk
      })

      const lineGen = d3.line()
        .x(d => xS(d[0])).y(d => yS(d[1]))
        .curve(d3.curveMonotoneX)
        .defined(d => d[1] !== null && d[1] >= yDom[0] && d[1] <= yDom[1])

      segments.forEach(([lo, hi]) => {
        const segData = d3.range(lo, hi, 0.03)
          .map(x => {
            const y = fn.f(x)
            return y === null ? [x, null] : [x, y]
          })
        svg.append('path').datum(segData)
          .attr('fill', 'none').attr('stroke', C.curve).attr('stroke-width', 2.5)
          .attr('d', lineGen)
      })

      // Holes
      fn.holes.forEach(({ x, y }) => {
        svg.append('circle').attr('cx', xS(x)).attr('cy', yS(y)).attr('r', 5)
          .attr('fill', C.bg).attr('stroke', C.hole).attr('stroke-width', 2)
        svg.append('text').attr('x', xS(x) + 7).attr('y', yS(y) - 5)
          .attr('fill', C.hole).attr('font-size', 10).attr('font-weight', 'bold')
          .text(`hole (${x}, ${y.toFixed(2)})`)
      })

      // Description
      const words = fn.desc
      svg.append('foreignObject')
        .attr('x', pad.l).attr('y', pad.t + iH + 4)
        .attr('width', iW).attr('height', 30)
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [selected, params.currentStep])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        {functions.map((fn, i) => (
          <button key={i} onClick={() => setSelected(i)}
            style={{
              padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: selected === i ? '#38bdf8' : 'transparent',
              color: selected === i ? '#0f172a' : '#94a3b8',
              border: `1px solid ${selected === i ? '#38bdf8' : '#334155'}`,
            }}>
            {fn.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 11, color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
        {functions[selected].desc}
      </p>
    </div>
  )
}
