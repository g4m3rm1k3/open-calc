import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * PolarCartesianViz
 * Left: polar plane with angle sweep. Right: Cartesian plot of the same curve.
 * Toggle between common polar curves. Dark mode. ResizeObserver.
 */
export default function PolarCartesianViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [selected, setSelected] = useState(0)
  const [sweep, setSweep] = useState(Math.PI * 2)

  const curves = [
    { label: 'Circle', expr: 'r = 2', r: () => 2, cartDesc: 'x²+y²=4 (Cartesian: constant distance from origin)' },
    { label: 'Cardioid', expr: 'r = 1+cosθ', r: t => 1 + Math.cos(t), cartDesc: 'Heart shape — simplest limaçon with a cusp' },
    { label: 'Rose 3', expr: 'r = cos(3θ)', r: t => Math.cos(3 * t), cartDesc: '3 petals (odd n in cos(nθ))' },
    { label: 'Rose 4', expr: 'r = cos(2θ)', r: t => Math.cos(2 * t), cartDesc: '4 petals (even n in cos(nθ))' },
    { label: 'Spiral', expr: 'r = θ/π', r: t => t / Math.PI, cartDesc: 'Archimedes spiral — radius grows linearly with angle' },
  ]

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:      isDark ? '#0f172a' : '#f8fafc',
        panel:   isDark ? '#1e293b' : '#ffffff',
        border:  isDark ? '#334155' : '#e2e8f0',
        axis:    isDark ? '#475569' : '#94a3b8',
        grid:    isDark ? '#1e293b' : '#f1f5f9',
        text:    isDark ? '#e2e8f0' : '#1e293b',
        muted:   isDark ? '#64748b' : '#94a3b8',
        curve:   isDark ? '#a78bfa' : '#7c3aed',
        spoke:   isDark ? '#1e293b' : '#f1f5f9',
        sweep:   isDark ? '#fbbf24' : '#d97706',
        cartCrv: isDark ? '#34d399' : '#059669',
      }

      const fn = curves[selected]
      const W = containerRef.current?.clientWidth || 560
      const H = Math.round(W * 0.52)
      const halfW = W / 2 - 4

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      // ── LEFT: polar ──
      svg.append('rect').attr('x', 2).attr('y', 2).attr('width', halfW - 2).attr('height', H - 4)
        .attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      const pcx = halfW / 2, pcy = H / 2
      const pR = Math.min(halfW, H) * 0.36

      // Concentric circles and spokes
      ;[1, 2, 3].forEach(r => {
        svg.append('circle').attr('cx', pcx).attr('cy', pcy).attr('r', pR * r / 3)
          .attr('fill', 'none').attr('stroke', C.spoke).attr('stroke-width', 1)
      })
      for (let a = 0; a < Math.PI; a += Math.PI / 6) {
        svg.append('line')
          .attr('x1', pcx + pR * Math.cos(a)).attr('y1', pcy - pR * Math.sin(a))
          .attr('x2', pcx - pR * Math.cos(a)).attr('y2', pcy + pR * Math.sin(a))
          .attr('stroke', C.spoke).attr('stroke-width', 1)
      }
      // Axes
      svg.append('line').attr('x1', pcx - pR - 8).attr('y1', pcy).attr('x2', pcx + pR + 8).attr('y2', pcy)
        .attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', pcx).attr('y1', pcy - pR - 8).attr('x2', pcx).attr('y2', pcy + pR + 8)
        .attr('stroke', C.axis).attr('stroke-width', 1.5)

      // Polar curve
      const steps = 400
      const maxT = sweep
      const polarData = d3.range(0, steps).map(i => {
        const t = (i / steps) * maxT
        const r = fn.r(t)
        if (r < 0) return null
        return [pcx + r * pR / 2.2 * Math.cos(t), pcy - r * pR / 2.2 * Math.sin(t)]
      }).filter(Boolean)

      const polarLine = d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveCatmullRom)
      svg.append('path').datum(polarData).attr('fill', 'none')
        .attr('stroke', C.curve).attr('stroke-width', 2.5).attr('d', polarLine)

      // Sweep angle indicator
      const lastPt = polarData[polarData.length - 1]
      if (lastPt) {
        svg.append('line').attr('x1', pcx).attr('y1', pcy)
          .attr('x2', lastPt[0]).attr('y2', lastPt[1])
          .attr('stroke', C.sweep).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
      }

      svg.append('text').attr('x', halfW / 2).attr('y', 16)
        .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 11).attr('font-weight', '500')
        .text(`Polar: ${fn.expr}`)

      // ── RIGHT: Cartesian ──
      const rOX = halfW + 8
      svg.append('rect').attr('x', rOX).attr('y', 2).attr('width', halfW - 2).attr('height', H - 4)
        .attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      const pad = { t: 28, b: 24, l: 32, r: 12 }
      const iW = halfW - pad.l - pad.r - 8, iH = H - pad.t - pad.b
      const cartPts = d3.range(0, steps).map(i => {
        const t = (i / steps) * maxT
        const r = fn.r(t)
        if (r < 0) return null
        return [r * Math.cos(t), r * Math.sin(t)]
      }).filter(Boolean)

      if (cartPts.length > 0) {
        const xs = cartPts.map(p => p[0]), ys = cartPts.map(p => p[1])
        const xRange = [Math.min(...xs) - 0.3, Math.max(...xs) + 0.3]
        const yRange = [Math.min(...ys) - 0.3, Math.max(...ys) + 0.3]

        const xS2 = d3.scaleLinear().domain(xRange).range([rOX + pad.l, rOX + pad.l + iW])
        const yS2 = d3.scaleLinear().domain(yRange).range([pad.t + iH, pad.t])

        svg.append('line').attr('x1', xS2(xRange[0])).attr('y1', yS2(0))
          .attr('x2', xS2(xRange[1])).attr('y2', yS2(0))
          .attr('stroke', C.axis).attr('stroke-width', 1.5)
        svg.append('line').attr('x1', xS2(0)).attr('y1', pad.t)
          .attr('x2', xS2(0)).attr('y2', pad.t + iH)
          .attr('stroke', C.axis).attr('stroke-width', 1.5)

        const cartLine = d3.line().x(d => xS2(d[0])).y(d => yS2(d[1])).curve(d3.curveCatmullRom)
        svg.append('path').datum(cartPts).attr('fill', 'none')
          .attr('stroke', C.cartCrv).attr('stroke-width', 2.5).attr('d', cartLine)
      }

      svg.append('text').attr('x', rOX + halfW / 2).attr('y', 16)
        .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 11).attr('font-weight', '500')
        .text('Cartesian equivalent')

      svg.append('text').attr('x', W / 2).attr('y', H - 5)
        .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10)
        .text(fn.cartDesc)
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [selected, sweep, params.currentStep])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {curves.map((c, i) => (
          <button key={i} onClick={() => { setSelected(i); setSweep(Math.PI * 2) }}
            style={{
              padding: '5px 11px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: selected === i ? '#a78bfa' : 'transparent',
              color: selected === i ? '#0f172a' : '#94a3b8',
              border: `1px solid ${selected === i ? '#a78bfa' : '#334155'}`,
            }}>
            {c.label}
          </button>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>sweep θ</span>
          <input type="range" min={0.1} max={Math.PI * 4} step={0.1} value={sweep}
            onChange={e => setSweep(parseFloat(e.target.value))}
            style={{ width: 90, accentColor: '#fbbf24' }} />
          <span style={{ fontSize: 11, color: '#fbbf24', minWidth: 40 }}>{(sweep / Math.PI).toFixed(1)}π</span>
        </div>
      </div>
    </div>
  )
}
