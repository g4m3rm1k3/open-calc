import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'

export default function SlopeReciprocalViz({ params = {} }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [ax, setAx] = useState(0.8)

  const f = x => 0.5 * x * x * x + 0.5 * x
  const df = x => 1.5 * x * x + 0.5

  useEffect(() => {
    const draw = () => {
      if (!containerRef.current || !svgRef.current) return
      const W = containerRef.current.clientWidth || 560
      const H = Math.round(W * 0.52)
      const margin = { top: 20, right: 28, bottom: 40, left: 44 }
      const iw = W - margin.left - margin.right
      const ih = H - margin.top - margin.bottom

      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:       isDark ? '#0f172a' : '#f8fafc',
        grid:     isDark ? '#1e293b' : '#e2e8f0',
        axis:     isDark ? '#475569' : '#94a3b8',
        axisText: isDark ? '#94a3b8' : '#64748b',
        mirror:   isDark ? '#334155' : '#cbd5e1',
        fColor:   isDark ? '#38bdf8' : '#0284c7',
        invColor: isDark ? '#f472b6' : '#db2777',
        tangentF: isDark ? '#fbbf24' : '#d97706',
        tangentI: isDark ? '#a78bfa' : '#7c3aed',
        label:    isDark ? '#e2e8f0' : '#1e293b',
        sublabel: isDark ? '#94a3b8' : '#64748b',
        pointF:   isDark ? '#fbbf24' : '#d97706',
        pointI:   isDark ? '#a78bfa' : '#7c3aed',
        riseRun:  isDark ? 'rgba(74,222,128,0.18)' : 'rgba(22,163,74,0.12)',
        riseRunB: isDark ? '#4ade80' : '#16a34a',
      }

      const domMax = 2.2
      const xScale = d3.scaleLinear().domain([-domMax, domMax]).range([0, iw])
      const yScale = d3.scaleLinear().domain([-domMax, domMax]).range([ih, 0])

      const fInv = y => {
        let lo = -3, hi = 3
        for (let i = 0; i < 60; i++) {
          const mid = (lo + hi) / 2
          if (f(mid) < y) lo = mid; else hi = mid
        }
        return (lo + hi) / 2
      }

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H)

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      // Grid
      for (let v = -2; v <= 2; v++) {
        g.append('line').attr('x1', xScale(v)).attr('x2', xScale(v)).attr('y1', 0).attr('y2', ih)
          .attr('stroke', C.grid).attr('stroke-width', 1)
        g.append('line').attr('x1', 0).attr('x2', iw).attr('y1', yScale(v)).attr('y2', yScale(v))
          .attr('stroke', C.grid).attr('stroke-width', 1)
      }

      // Mirror y = x
      g.append('line')
        .attr('x1', xScale(-domMax)).attr('x2', xScale(domMax))
        .attr('y1', yScale(-domMax)).attr('y2', yScale(domMax))
        .attr('stroke', C.mirror).attr('stroke-width', 1.5).attr('stroke-dasharray', '6 4')

      g.append('text').attr('x', xScale(1.9)).attr('y', yScale(1.6))
        .attr('fill', C.axisText).attr('font-size', 10).text('y = x')

      // Axes
      g.append('g').attr('transform', `translate(0,${ih})`).call(d3.axisBottom(xScale).ticks(4).tickSize(3))
        .call(ax2 => ax2.select('.domain').attr('stroke', C.axis))
        .call(ax2 => ax2.selectAll('text').attr('fill', C.axisText).attr('font-size', 10))
        .call(ax2 => ax2.selectAll('line').attr('stroke', C.axis))
      g.append('g').call(d3.axisLeft(yScale).ticks(4).tickSize(3))
        .call(ax2 => ax2.select('.domain').attr('stroke', C.axis))
        .call(ax2 => ax2.selectAll('text').attr('fill', C.axisText).attr('font-size', 10))
        .call(ax2 => ax2.selectAll('line').attr('stroke', C.axis))

      const pts = d3.range(-domMax, domMax + 0.01, 0.04)

      // f curve
      const linef = d3.line().x(d => xScale(d)).y(d => yScale(f(d)))
        .defined(d => Math.abs(f(d)) <= domMax + 0.1).curve(d3.curveCatmullRom)
      g.append('path').datum(pts).attr('d', linef)
        .attr('fill', 'none').attr('stroke', C.fColor).attr('stroke-width', 2.5)
      g.append('text').attr('x', xScale(1.2)).attr('y', yScale(2.0))
        .attr('fill', C.fColor).attr('font-size', 13).attr('font-weight', 600).text('f')

      // f⁻¹ curve
      const lineInv = d3.line().x(d => xScale(fInv(d))).y(d => yScale(d))
        .defined(d => Math.abs(fInv(d)) <= domMax + 0.1).curve(d3.curveCatmullRom)
      g.append('path').datum(pts).attr('d', lineInv)
        .attr('fill', 'none').attr('stroke', C.invColor).attr('stroke-width', 2.5)
      g.append('text').attr('x', xScale(2.0)).attr('y', yScale(1.2))
        .attr('fill', C.invColor).attr('font-size', 13).attr('font-weight', 600).text('f⁻¹')

      // Active values
      const ay = f(ax)
      const m = df(ax)          // slope of f at ax
      const mInv = 1 / m        // slope of f⁻¹ at ay

      // Tangent length in data units
      const tLen = 0.55

      // Rise/run triangle on f
      const runF = tLen
      const riseF = tLen * m
      g.append('polygon')
        .attr('points', [
          [xScale(ax), yScale(ay)],
          [xScale(ax + runF), yScale(ay)],
          [xScale(ax + runF), yScale(ay + riseF)],
        ].map(p => p.join(',')).join(' '))
        .attr('fill', C.riseRun).attr('stroke', C.riseRunB).attr('stroke-width', 1.5)

      // Rise/run triangle on f⁻¹ — SWAPPED (run and rise are swapped)
      // On f⁻¹ at point (ay, ax): slope = mInv = 1/m
      const runI = tLen
      const riseI = tLen * mInv
      g.append('polygon')
        .attr('points', [
          [xScale(ay), yScale(ax)],
          [xScale(ay + runI), yScale(ax)],
          [xScale(ay + runI), yScale(ax + riseI)],
        ].map(p => p.join(',')).join(' '))
        .attr('fill', C.riseRun).attr('stroke', C.tangentI).attr('stroke-width', 1.5)

      // Tangent line on f
      g.append('line')
        .attr('x1', xScale(ax - tLen)).attr('x2', xScale(ax + tLen))
        .attr('y1', yScale(ay - tLen * m)).attr('y2', yScale(ay + tLen * m))
        .attr('stroke', C.tangentF).attr('stroke-width', 2.5)

      // Tangent line on f⁻¹
      g.append('line')
        .attr('x1', xScale(ay - tLen)).attr('x2', xScale(ay + tLen))
        .attr('y1', yScale(ax - tLen * mInv)).attr('y2', yScale(ax + tLen * mInv))
        .attr('stroke', C.tangentI).attr('stroke-width', 2.5)

      // Points
      g.append('circle').attr('cx', xScale(ax)).attr('cy', yScale(ay))
        .attr('r', 6).attr('fill', C.pointF).attr('stroke', C.bg).attr('stroke-width', 2)
      g.append('circle').attr('cx', xScale(ay)).attr('cy', yScale(ax))
        .attr('r', 6).attr('fill', C.pointI).attr('stroke', C.bg).attr('stroke-width', 2)

      // Dashed connector through mirror
      g.append('line')
        .attr('x1', xScale(ax)).attr('y1', yScale(ay))
        .attr('x2', xScale(ay)).attr('y2', yScale(ax))
        .attr('stroke', C.mirror).attr('stroke-width', 1.5).attr('stroke-dasharray', '4 3')

      // Slope annotation panel — bottom left
      const px = 4, py = ih - 62
      g.append('rect').attr('x', px).attr('y', py).attr('width', 160).attr('height', 58)
        .attr('fill', isDark ? 'rgba(15,23,42,0.85)' : 'rgba(248,250,252,0.9)')
        .attr('stroke', C.axis).attr('stroke-width', 1).attr('rx', 6)

      g.append('text').attr('x', px + 8).attr('y', py + 16)
        .attr('fill', C.tangentF).attr('font-size', 12).attr('font-weight', 600)
        .text(`slope of f:   m = ${m.toFixed(3)}`)
      g.append('text').attr('x', px + 8).attr('y', py + 32)
        .attr('fill', C.tangentI).attr('font-size', 12).attr('font-weight', 600)
        .text(`slope of f⁻¹: 1/m = ${mInv.toFixed(3)}`)
      g.append('text').attr('x', px + 8).attr('y', py + 50)
        .attr('fill', C.sublabel).attr('font-size', 10)
        .text(`${m.toFixed(3)} × ${mInv.toFixed(3)} = ${(m * mInv).toFixed(3)}`)

      // Drag zone
      g.append('rect').attr('width', iw).attr('height', ih)
        .attr('fill', 'transparent').style('cursor', 'ew-resize')
        .on('mousemove click', function(event) {
          const [mx] = d3.pointer(event)
          const newX = Math.max(-domMax + 0.2, Math.min(domMax - 0.2, xScale.invert(mx)))
          setAx(parseFloat(newX.toFixed(3)))
        })
    }

    draw()
    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [ax])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div className="flex items-center gap-3 px-2 pb-2 text-sm text-slate-600 dark:text-slate-400">
        <span>Drag on graph or:</span>
        <input type="range" min={-2.0} max={2.0} step={0.02}
          value={ax} onChange={e => setAx(parseFloat(e.target.value))}
          className="w-36 accent-amber-500"
        />
        <span className="font-mono">x = {ax.toFixed(2)}</span>
      </div>
    </div>
  )
}
