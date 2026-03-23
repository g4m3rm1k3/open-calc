import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * ChainRuleZoomViz — Viz 2: "The zooming proof"
 *
 * Three linked graph panels: g(x), f(u), h(x)=f(g(x))
 * A base point x₀ and a Δx slider.
 * Shows:
 *   Δu ≈ g'(x₀)·Δx  in the middle panel
 *   Δy ≈ f'(u₀)·Δu = f'(g(x₀))·g'(x₀)·Δx  in the right panel
 *
 * As Δx → 0, the local linear approximation becomes exact.
 * No limit symbols — the proof is pure geometry.
 *
 * Preset: sin(x³). Dark mode. ResizeObserver.
 */
export default function ChainRuleZoomViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [deltaX, setDeltaX] = useState(0.5)
  const [x0, setX0] = useState(1.0)

  const g = x => x ** 3
  const f = u => Math.sin(u)
  const gp = x => 3 * x ** 2
  const fp = u => Math.cos(u)
  const h = x => f(g(x))

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:      isDark ? '#0f172a' : '#f8fafc',
        panel:   isDark ? '#1e293b' : '#ffffff',
        border:  isDark ? '#334155' : '#e2e8f0',
        axis:    isDark ? '#475569' : '#94a3b8',
        text:    isDark ? '#e2e8f0' : '#1e293b',
        muted:   isDark ? '#64748b' : '#94a3b8',
        inner:   isDark ? '#38bdf8' : '#0284c7',
        outer:   isDark ? '#f472b6' : '#db2777',
        chain:   isDark ? '#34d399' : '#059669',
        dx:      isDark ? '#a78bfa' : '#7c3aed',
        du:      isDark ? '#38bdf8' : '#0284c7',
        dy:      isDark ? '#34d399' : '#059669',
        tangent: isDark ? 'rgba(251,191,36,0.7)' : 'rgba(217,119,6,0.7)',
      }

      const W = containerRef.current?.clientWidth || 560
      const H = Math.round(W * 0.52)
      const panW = (W - 24) / 3
      const pad = { t: 28, b: 28, l: 28, r: 8 }
      const iW = panW - pad.l - pad.r
      const iH = H - pad.t - pad.b

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      svg.append('defs').html(`<marker id="arrd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker>`)

      const u0 = g(x0)
      const y0v = h(x0)
      const x1 = x0 + deltaX
      const u1 = g(x1)
      const y1 = h(x1)
      const du = u1 - u0
      const dy = y1 - y0v
      const duApprox = gp(x0) * deltaX
      const dyApprox = fp(u0) * du

      const drawPanel = (offsetX, fn, xDom, curveCol, title, baseX, dx, baseY, deltaY, baseYLabel, topLabel, xLabel) => {
        const xs = d3.scaleLinear().domain(xDom).range([offsetX + pad.l, offsetX + pad.l + iW])
        const ys_data = d3.range(xDom[0], xDom[1], 0.04).map(t => fn(t)).filter(isFinite)
        const yMin = Math.min(...ys_data) - 0.3
        const yMax = Math.max(...ys_data) + 0.3
        const ys = d3.scaleLinear().domain([yMin, yMax]).range([pad.t + iH, pad.t])

        // Panel bg
        svg.append('rect').attr('x', offsetX + 1).attr('y', 1).attr('width', panW - 2).attr('height', H - 2)
          .attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)
        svg.append('text').attr('x', offsetX + panW / 2).attr('y', 16)
          .attr('text-anchor', 'middle').attr('fill', curveCol).attr('font-size', 12).attr('font-weight', 'bold').text(title)

        // Axes
        if (yMin <= 0 && yMax >= 0)
          svg.append('line').attr('x1', offsetX + pad.l).attr('y1', ys(0)).attr('x2', offsetX + pad.l + iW).attr('y2', ys(0)).attr('stroke', C.axis).attr('stroke-width', 1)
        if (xDom[0] <= 0 && xDom[1] >= 0)
          svg.append('line').attr('x1', xs(0)).attr('y1', pad.t).attr('x2', xs(0)).attr('y2', pad.t + iH).attr('stroke', C.axis).attr('stroke-width', 1)

        // Curve
        const data = d3.range(xDom[0], xDom[1], 0.02).map(t => ({ x: t, y: fn(t) })).filter(d => isFinite(d.y))
        const line = d3.line().x(d => xs(d.x)).y(d => ys(d.y)).curve(d3.curveCatmullRom)
        svg.append('path').datum(data).attr('fill', 'none').attr('stroke', curveCol).attr('stroke-width', 2).attr('d', line)

        const bY = fn(baseX)
        const eY = fn(baseX + dx)
        if (!isFinite(bY) || !isFinite(eY)) return

        // Tangent line segment
        const slope = (eY - bY) / dx
        const tanX0 = baseX - Math.abs(dx) * 0.5
        const tanX1 = baseX + Math.abs(dx) * 1.5
        const tanFn = t => bY + slope * (t - baseX)
        svg.append('line').attr('x1', xs(tanX0)).attr('y1', ys(tanFn(tanX0))).attr('x2', xs(tanX1)).attr('y2', ys(tanFn(tanX1))).attr('stroke', C.tangent).attr('stroke-width', 1.5).attr('stroke-dasharray', '5,3')

        // Δ brackets
        const bYpx = ys(bY)
        svg.append('line').attr('x1', xs(baseX)).attr('y1', bYpx + 8).attr('x2', xs(baseX + dx)).attr('y2', bYpx + 8)
          .attr('stroke', C.dx).attr('stroke-width', 2).attr('marker-end', 'url(#arrd)').attr('marker-start', 'url(#arrd)')
        svg.append('text').attr('x', xs(baseX + dx / 2)).attr('y', bYpx + 20)
          .attr('text-anchor', 'middle').attr('fill', C.dx).attr('font-size', 11).attr('font-weight', 'bold').text(xLabel)

        const midX = xs(baseX + dx) + 12
        svg.append('line').attr('x1', midX).attr('y1', ys(bY)).attr('x2', midX).attr('y2', ys(eY))
          .attr('stroke', curveCol).attr('stroke-width', 2).attr('marker-end', 'url(#arrd)').attr('marker-start', 'url(#arrd)')
        svg.append('text').attr('x', midX + 6).attr('y', (ys(bY) + ys(eY)) / 2 + 4)
          .attr('fill', curveCol).attr('font-size', 11).attr('font-weight', 'bold').text(topLabel)

        // Base point
        svg.append('circle').attr('cx', xs(baseX)).attr('cy', ys(bY)).attr('r', 5)
          .attr('fill', curveCol).attr('stroke', C.bg).attr('stroke-width', 2)

        // Slope label
        const slopeVal = isFinite(slope) ? slope.toFixed(3) : '?'
        svg.append('text').attr('x', offsetX + pad.l + 4).attr('y', H - 10)
          .attr('fill', C.muted).attr('font-size', 10).text(`slope = ${slopeVal}`)
      }

      // Panel 1: g(x) = x³
      drawPanel(0, g, [-1.8, 1.8], C.inner, 'g(x) = x³  [inner]',
        x0, deltaX, u0, du, `u₀=${u0.toFixed(2)}`, `Δu≈${duApprox.toFixed(3)}`, `Δx=${deltaX.toFixed(2)}`)

      // Panel 2: f(u) = sin(u)
      drawPanel(panW + 8, f, [-2.5, 2.5], C.outer, 'f(u) = sin(u)  [outer]',
        u0, du, y0v, dy, `y₀=${y0v.toFixed(2)}`, `Δy≈${dyApprox.toFixed(3)}`, `Δu=${du.toFixed(3)}`)

      // Panel 3: h(x) = sin(x³)
      drawPanel((panW + 8) * 2, h, [-1.8, 1.8], C.chain, 'h(x) = sin(x³)  [composed]',
        x0, deltaX, y0v, dy, `y₀=${y0v.toFixed(2)}`, `Δy=${dy.toFixed(3)}`, `Δx=${deltaX.toFixed(2)}`)

      // ── Bottom summary bar ────────────────────────────────────────────
      const sumY = H - 26
      const msg = `Δy/Δx = ${(dy/deltaX).toFixed(4)}   ≈   f'(g(x₀))·g'(x₀) = ${(fp(u0)*gp(x0)).toFixed(4)}   [exact as Δx→0: cos(x₀³)·3x₀² = ${(Math.cos(x0**3)*3*x0**2).toFixed(4)}]`
      svg.append('text').attr('x', W / 2).attr('y', sumY)
        .attr('text-anchor', 'middle').attr('fill', C.chain).attr('font-size', 11).attr('font-weight', 'bold').text(msg)
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [deltaX, x0])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ padding: '10px 4px 0' }}>
        {[
          { label: 'x₀ (base point)', val: x0, set: setX0, min: -1.5, max: 1.5, step: 0.05, color: '#a78bfa' },
          { label: 'Δx (shrink me → 0)', val: deltaX, set: setDeltaX, min: 0.01, max: 1.0, step: 0.01, color: '#fbbf24' },
        ].map(({ label, val, set, min, max, step, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 12, color, minWidth: 160, fontWeight: 'bold' }}>{label} = {val.toFixed(2)}</span>
            <input type="range" min={min} max={max} step={step} value={val}
              onChange={e => set(parseFloat(e.target.value))} style={{ flex: 1, accentColor: color }} />
          </div>
        ))}
        <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', lineHeight: 1.6 }}>
          Shrink Δx toward 0 — watch Δy/Δx in the bottom bar converge exactly to f'(g(x₀))·g'(x₀). The chain rule is this convergence, made visible.
        </p>
      </div>
    </div>
  )
}
