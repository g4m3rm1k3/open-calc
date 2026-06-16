import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'

const PRESETS = [
  {
    label: 'x³ − 3x',
    f: x => x * x * x - 3 * x,
    df: x => 3 * x * x - 3,
    criticals: [-1, 1],
  },
  {
    label: 'x²',
    f: x => x * x,
    df: x => 2 * x,
    criticals: [0],
  },
  {
    label: 'sin(x)',
    f: x => Math.sin(x),
    df: x => Math.cos(x),
    criticals: [-Math.PI, -Math.PI / 2, 0, Math.PI / 2, Math.PI],
  },
  {
    label: 'eˣ',
    f: x => Math.exp(x),
    df: x => Math.exp(x),
    criticals: [],
  },
]

export default function MonotoneSignChart({ params = {} }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [preset, setPreset] = useState(0)

  useEffect(() => {
    const draw = () => {
      if (!containerRef.current || !svgRef.current) return
      const W = containerRef.current.clientWidth || 560
      const topH = Math.round(W * 0.42)
      const botH = 110
      const H = topH + botH + 16
      const margin = { top: 20, right: 20, bottom: 36, left: 44 }
      const iw = W - margin.left - margin.right
      const ih = topH - margin.top - 8

      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:         isDark ? '#0f172a' : '#f8fafc',
        grid:       isDark ? '#1e293b' : '#e2e8f0',
        axis:       isDark ? '#475569' : '#94a3b8',
        axisText:   isDark ? '#94a3b8' : '#64748b',
        fColor:     isDark ? '#38bdf8' : '#0284c7',
        dfColor:    isDark ? '#fb923c' : '#ea580c',
        pos:        isDark ? '#4ade80' : '#16a34a',
        neg:        isDark ? '#f87171' : '#dc2626',
        zero:       isDark ? '#fbbf24' : '#d97706',
        label:      isDark ? '#e2e8f0' : '#1e293b',
        invertible: isDark ? 'rgba(74,222,128,0.13)' : 'rgba(22,163,74,0.10)',
        notInvert:  isDark ? 'rgba(248,113,113,0.13)' : 'rgba(220,38,38,0.08)',
        band:       isDark ? '#1e293b' : '#f1f5f9',
      }

      const fn = PRESETS[preset]
      const domX = [-Math.PI - 0.2, Math.PI + 0.2]

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H)

      // ── Top panel: f and f' ─────────────────────────────────────────────
      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      const pts = d3.range(domX[0], domX[1] + 0.01, 0.04)
      const fVals = pts.map(fn.f)
      const dfVals = pts.map(fn.df)
      const allVals = [...fVals, ...dfVals].filter(isFinite)
      const yMin = Math.max(d3.min(allVals), -6)
      const yMax = Math.min(d3.max(allVals), 6)

      const xScale = d3.scaleLinear().domain(domX).range([0, iw])
      const yScale = d3.scaleLinear().domain([yMin - 0.5, yMax + 0.5]).range([ih, 0])

      // Grid
      yScale.ticks(5).forEach(v => {
        g.append('line').attr('x1', 0).attr('x2', iw)
          .attr('y1', yScale(v)).attr('y2', yScale(v))
          .attr('stroke', C.grid).attr('stroke-width', 1)
      })
      g.append('line').attr('x1', 0).attr('x2', iw)
        .attr('y1', yScale(0)).attr('y2', yScale(0))
        .attr('stroke', C.axis).attr('stroke-width', 1.5)

      // Shade monotone intervals
      const criticals = fn.criticals.filter(c => c > domX[0] && c < domX[1])
      const boundaries = [domX[0], ...criticals, domX[1]]
      for (let i = 0; i < boundaries.length - 1; i++) {
        const mid = (boundaries[i] + boundaries[i + 1]) / 2
        const sign = fn.df(mid)
        const color = sign > 0 ? C.invertible : sign < 0 ? C.invertible : 'transparent'
        g.append('rect')
          .attr('x', xScale(boundaries[i]))
          .attr('width', xScale(boundaries[i + 1]) - xScale(boundaries[i]))
          .attr('y', 0).attr('height', ih)
          .attr('fill', color)
      }

      // f curve
      const linef = d3.line().x(d => xScale(d)).y(d => yScale(fn.f(d)))
        .defined(d => isFinite(fn.f(d)) && fn.f(d) >= yMin - 1 && fn.f(d) <= yMax + 1)
        .curve(d3.curveCatmullRom)
      g.append('path').datum(pts).attr('d', linef)
        .attr('fill', 'none').attr('stroke', C.fColor).attr('stroke-width', 2.5)

      // f' curve
      const linedf = d3.line().x(d => xScale(d)).y(d => yScale(fn.df(d)))
        .defined(d => isFinite(fn.df(d)) && fn.df(d) >= yMin - 1 && fn.df(d) <= yMax + 1)
        .curve(d3.curveCatmullRom)
      g.append('path').datum(pts).attr('d', linedf)
        .attr('fill', 'none').attr('stroke', C.dfColor).attr('stroke-width', 2)
        .attr('stroke-dasharray', '6 3')

      // Critical points
      criticals.forEach(c => {
        g.append('circle')
          .attr('cx', xScale(c)).attr('cy', yScale(fn.df(c)))
          .attr('r', 5).attr('fill', C.zero).attr('stroke', C.bg).attr('stroke-width', 1.5)
        g.append('line')
          .attr('x1', xScale(c)).attr('x2', xScale(c))
          .attr('y1', 0).attr('y2', ih)
          .attr('stroke', C.zero).attr('stroke-width', 1.5).attr('stroke-dasharray', '4 3')
      })

      // Axes
      g.append('g').attr('transform', `translate(0,${ih})`).call(d3.axisBottom(xScale).ticks(6).tickSize(3))
        .call(ax => ax.select('.domain').attr('stroke', C.axis))
        .call(ax => ax.selectAll('text').attr('fill', C.axisText).attr('font-size', 10))
        .call(ax => ax.selectAll('line').attr('stroke', C.axis))
      g.append('g').call(d3.axisLeft(yScale).ticks(5).tickSize(3))
        .call(ax => ax.select('.domain').attr('stroke', C.axis))
        .call(ax => ax.selectAll('text').attr('fill', C.axisText).attr('font-size', 10))
        .call(ax => ax.selectAll('line').attr('stroke', C.axis))

      // Legend
      const leg = g.append('g').attr('transform', `translate(${iw - 120}, 4)`)
      leg.append('line').attr('x1', 0).attr('x2', 20).attr('y1', 8).attr('y2', 8)
        .attr('stroke', C.fColor).attr('stroke-width', 2.5)
      leg.append('text').attr('x', 25).attr('y', 12).attr('fill', C.label).attr('font-size', 11)
        .text(`f(x) = ${fn.label}`)
      leg.append('line').attr('x1', 0).attr('x2', 20).attr('y1', 26).attr('y2', 26)
        .attr('stroke', C.dfColor).attr('stroke-width', 2).attr('stroke-dasharray', '5 3')
      leg.append('text').attr('x', 25).attr('y', 30).attr('fill', C.label).attr('font-size', 11)
        .text("f′(x)")

      // ── Bottom panel: sign chart ──────────────────────────────────────────
      const by = topH + 16
      const sg = svg.append('g').attr('transform', `translate(${margin.left},${by})`)
      const bw = iw
      const bh = botH - 10

      sg.append('rect').attr('width', bw).attr('height', bh)
        .attr('fill', C.band).attr('rx', 6)

      sg.append('text').attr('x', -8).attr('y', bh / 2 + 4)
        .attr('fill', C.axisText).attr('font-size', 11)
        .attr('text-anchor', 'end').text("f′")

      for (let i = 0; i < boundaries.length - 1; i++) {
        const x0 = xScale(boundaries[i])
        const x1 = xScale(boundaries[i + 1])
        const mid = (boundaries[i] + boundaries[i + 1]) / 2
        const sign = fn.df(mid)

        const color = sign > 0 ? C.pos : sign < 0 ? C.neg : C.zero
        const symbol = sign > 0 ? '+' : sign < 0 ? '−' : '0'
        const label = sign > 0 ? '↑ increasing' : sign < 0 ? '↓ decreasing' : 'flat'

        sg.append('rect')
          .attr('x', x0 + 1).attr('width', x1 - x0 - 2)
          .attr('y', 1).attr('height', bh - 2)
          .attr('fill', sign > 0 ? C.invertible : C.notInvert)
          .attr('rx', 4)

        sg.append('text')
          .attr('x', (x0 + x1) / 2).attr('y', bh / 2 - 4)
          .attr('text-anchor', 'middle')
          .attr('fill', color).attr('font-size', 20).attr('font-weight', 700)
          .text(symbol)

        sg.append('text')
          .attr('x', (x0 + x1) / 2).attr('y', bh / 2 + 14)
          .attr('text-anchor', 'middle')
          .attr('fill', color).attr('font-size', 10)
          .text(label)
      }

      criticals.forEach(c => {
        const cx = xScale(c)
        sg.append('line')
          .attr('x1', cx).attr('x2', cx)
          .attr('y1', 0).attr('y2', bh)
          .attr('stroke', C.zero).attr('stroke-width', 2)
        sg.append('circle')
          .attr('cx', cx).attr('cy', bh / 2)
          .attr('r', 4).attr('fill', C.zero)
      })

      sg.append('text').attr('x', bw / 2).attr('y', bh + 16)
        .attr('text-anchor', 'middle')
        .attr('fill', C.axisText).attr('font-size', 10.5)
        .text('Green = f′ > 0 or f′ < 0 → monotone on this interval → invertible here')
    }

    draw()
    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [preset])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div className="flex flex-wrap gap-2 px-1 pb-2 pt-1">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => setPreset(i)}
            className={`px-3 py-1 rounded text-sm font-mono transition-colors ${
              preset === i
                ? 'bg-sky-500 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
