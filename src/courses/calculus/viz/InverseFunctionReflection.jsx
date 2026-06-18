import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'

export default function InverseFunctionReflection({ params = {} }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [activePoint, setActivePoint] = useState(1.5)
  const [showReflection, setShowReflection] = useState(true)

  useEffect(() => {
    const draw = () => {
      if (!containerRef.current || !svgRef.current) return
      const W = containerRef.current.clientWidth || 560
      const H = Math.min(W, 480)
      const margin = { top: 24, right: 24, bottom: 40, left: 44 }
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
        point:    isDark ? '#fbbf24' : '#d97706',
        pointMir: isDark ? '#a78bfa' : '#7c3aed',
        label:    isDark ? '#e2e8f0' : '#1e293b',
        dashed:   isDark ? '#64748b' : '#94a3b8',
      }

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H)

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      const domainMax = 3
      const xScale = d3.scaleLinear().domain([-domainMax, domainMax]).range([0, iw])
      const yScale = d3.scaleLinear().domain([-domainMax, domainMax]).range([ih, 0])

      // Grid
      for (let v = -domainMax; v <= domainMax; v++) {
        g.append('line')
          .attr('x1', xScale(v)).attr('x2', xScale(v))
          .attr('y1', 0).attr('y2', ih)
          .attr('stroke', C.grid).attr('stroke-width', 1)
        g.append('line')
          .attr('y1', yScale(v)).attr('y2', yScale(v))
          .attr('x1', 0).attr('x2', iw)
          .attr('stroke', C.grid).attr('stroke-width', 1)
      }

      // Mirror line y = x
      g.append('line')
        .attr('x1', xScale(-domainMax)).attr('x2', xScale(domainMax))
        .attr('y1', yScale(-domainMax)).attr('y2', yScale(domainMax))
        .attr('stroke', C.mirror).attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '6 4')

      g.append('text')
        .attr('x', xScale(2.6)).attr('y', yScale(2.2))
        .attr('fill', C.axisText).attr('font-size', 12)
        .text('y = x')

      // Axes
      const xAxis = d3.axisBottom(xScale).ticks(6).tickSize(4)
      const yAxis = d3.axisLeft(yScale).ticks(6).tickSize(4)
      g.append('g').attr('transform', `translate(0,${ih})`).call(xAxis)
        .call(ax => ax.select('.domain').attr('stroke', C.axis))
        .call(ax => ax.selectAll('text').attr('fill', C.axisText).attr('font-size', 11))
        .call(ax => ax.selectAll('line').attr('stroke', C.axis))
      g.append('g').call(yAxis)
        .call(ax => ax.select('.domain').attr('stroke', C.axis))
        .call(ax => ax.selectAll('text').attr('fill', C.axisText).attr('font-size', 11))
        .call(ax => ax.selectAll('line').attr('stroke', C.axis))

      // f(x) = x^(1/3) * |x|^(2/3) sign-preserving cube — use x^3 inverse
      // Use f(x) = 0.6x^3 + 0.4x for a nice invertible curve
      const f = x => 0.5 * x * x * x + 0.5 * x
      const fInv = y => {
        // numerical inverse via bisection
        let lo = -domainMax, hi = domainMax
        for (let i = 0; i < 60; i++) {
          const mid = (lo + hi) / 2
          if (f(mid) < y) lo = mid; else hi = mid
        }
        return (lo + hi) / 2
      }

      const pts = d3.range(-domainMax, domainMax + 0.01, 0.04)

      // f curve
      const linef = d3.line()
        .x(d => xScale(d))
        .y(d => yScale(f(d)))
        .defined(d => Math.abs(f(d)) <= domainMax + 0.1)
        .curve(d3.curveCatmullRom)

      g.append('path')
        .datum(pts)
        .attr('d', linef)
        .attr('fill', 'none')
        .attr('stroke', C.fColor)
        .attr('stroke-width', 2.5)

      g.append('text')
        .attr('x', xScale(1.45)).attr('y', yScale(2.3))
        .attr('fill', C.fColor).attr('font-size', 13).attr('font-weight', 600)
        .text('f(x)')

      // f⁻¹ curve
      if (showReflection) {
        const lineInv = d3.line()
          .x(d => xScale(fInv(d)))
          .y(d => yScale(d))
          .defined(d => {
            const xi = fInv(d)
            return isFinite(xi) && Math.abs(xi) <= domainMax + 0.1
          })
          .curve(d3.curveCatmullRom)

        g.append('path')
          .datum(pts)
          .attr('d', lineInv)
          .attr('fill', 'none')
          .attr('stroke', C.invColor)
          .attr('stroke-width', 2.5)

        g.append('text')
          .attr('x', xScale(2.2)).attr('y', yScale(1.45))
          .attr('fill', C.invColor).attr('font-size', 13).attr('font-weight', 600)
          .text('f⁻¹(x)')
      }

      // Active point on f
      const ax = activePoint
      const ay = f(ax)
      const validPoint = Math.abs(ax) <= domainMax && Math.abs(ay) <= domainMax

      if (validPoint) {
        // Point on f
        g.append('circle')
          .attr('cx', xScale(ax)).attr('cy', yScale(ay))
          .attr('r', 6).attr('fill', C.point).attr('stroke', C.bg).attr('stroke-width', 2)

        g.append('text')
          .attr('x', xScale(ax) + 9).attr('y', yScale(ay) - 8)
          .attr('fill', C.point).attr('font-size', 12)
          .text(`(${ax.toFixed(1)}, ${ay.toFixed(2)})`)

        if (showReflection) {
          // Corresponding point on f⁻¹ = (ay, ax)
          g.append('circle')
            .attr('cx', xScale(ay)).attr('cy', yScale(ax))
            .attr('r', 6).attr('fill', C.pointMir).attr('stroke', C.bg).attr('stroke-width', 2)

          g.append('text')
            .attr('x', xScale(ay) + 9).attr('y', yScale(ax) - 8)
            .attr('fill', C.pointMir).attr('font-size', 12)
            .text(`(${ay.toFixed(2)}, ${ax.toFixed(1)})`)

          // Dashed connector through mirror line
          g.append('line')
            .attr('x1', xScale(ax)).attr('y1', yScale(ay))
            .attr('x2', xScale(ay)).attr('y2', yScale(ax))
            .attr('stroke', C.dashed).attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '4 3')

          // Midpoint on y=x line
          const mx = (ax + ay) / 2
          g.append('circle')
            .attr('cx', xScale(mx)).attr('cy', yScale(mx))
            .attr('r', 3).attr('fill', C.mirror)
        }
      }

      // Drag interaction
      const dragZone = g.append('rect')
        .attr('width', iw).attr('height', ih)
        .attr('fill', 'transparent')
        .style('cursor', 'ew-resize')

      dragZone.on('mousemove click', function(event) {
        const [mx] = d3.pointer(event)
        const newX = Math.max(-domainMax + 0.1, Math.min(domainMax - 0.1, xScale.invert(mx)))
        setActivePoint(parseFloat(newX.toFixed(2)))
      })
    }

    draw()
    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [activePoint, showReflection])

  return (
    <div ref={containerRef} className="w-full select-none">
      <svg ref={svgRef} className="w-full" />
      <div className="flex items-center gap-6 px-2 pb-2 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showReflection}
            onChange={e => setShowReflection(e.target.checked)}
            className="accent-pink-500"
          />
          Show f⁻¹
        </label>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span>Move point:</span>
          <input
            type="range"
            min={-2.5} max={2.5} step={0.05}
            value={activePoint}
            onChange={e => setActivePoint(parseFloat(e.target.value))}
            className="w-32 accent-amber-500"
          />
          <span className="font-mono w-10">x={activePoint.toFixed(1)}</span>
        </div>
      </div>
    </div>
  )
}
