import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * PythagoreanSlopeEngine
 *
 * Fixes: "The Why of the Trig Denominators"
 *
 * Split view:
 *   LEFT — unit circle with a right triangle drawn at angle θ.
 *          The legs are labelled x, √(1−x²), hypotenuse = 1.
 *          As x → ±1, the vertical leg (√(1−x²)) → 0.
 *
 *   RIGHT — graph of arcsin(x) with:
 *          - the point (x, arcsin(x)) highlighted
 *          - the tangent line drawn, with slope = 1/√(1−x²)
 *          - a readout showing WHY the denominator = the vertical leg
 *
 * Toggle between arcsin and arctan to see how the triangle changes.
 *
 * Dark mode. ResizeObserver.
 */
export default function PythagoreanSlopeEngine({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [fn, setFn] = useState('arcsin')
  const [x, setX] = useState(0.5)

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:     isDark ? '#0f172a' : '#f8fafc',
        panel:  isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '#334155' : '#e2e8f0',
        axis:   isDark ? '#475569' : '#94a3b8',
        grid:   isDark ? '#1e293b' : '#f1f5f9',
        text:   isDark ? '#e2e8f0' : '#1e293b',
        muted:  isDark ? '#64748b' : '#94a3b8',
        circle: isDark ? '#334155' : '#e2e8f0',
        hyp:    isDark ? '#38bdf8' : '#0284c7',    // hypotenuse / arcsin curve
        opp:    isDark ? '#34d399' : '#059669',    // opposite leg — this becomes denominator
        adj:    isDark ? '#f472b6' : '#db2777',    // adjacent leg
        angle:  isDark ? '#fbbf24' : '#d97706',    // angle arc
        curve:  isDark ? '#38bdf8' : '#0284c7',    // inverse trig curve
        pt:     isDark ? '#fbbf24' : '#d97706',    // draggable point
        tangent:isDark ? 'rgba(251,191,36,0.6)' : 'rgba(217,119,6,0.5)',
        triF:   isDark ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.08)',
        warn:   isDark ? '#f87171' : '#ef4444',
      }

      const W = containerRef.current?.clientWidth || 560
      const H = Math.round(W * 0.52)
      const halfW = Math.floor(W / 2) - 2

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      svg.append('rect').attr('x', 1).attr('y', 1).attr('width', W - 2).attr('height', H - 2)
        .attr('rx', 10).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      // ── LEFT PANEL: Unit circle ────────────────────────────────────────────
      const lCx = halfW * 0.52, lCy = H * 0.5
      const R = Math.min(halfW * 0.4, H * 0.38)

      // Divider
      svg.append('line').attr('x1', halfW + 2).attr('y1', 10).attr('x2', halfW + 2).attr('y2', H - 10)
        .attr('stroke', C.border).attr('stroke-width', 1)

      // Unit circle
      svg.append('circle').attr('cx', lCx).attr('cy', lCy).attr('r', R)
        .attr('fill', 'none').attr('stroke', C.circle).attr('stroke-width', 1.5)

      // Axes
      svg.append('line').attr('x1', lCx - R - 12).attr('y1', lCy).attr('x2', lCx + R + 12).attr('y2', lCy)
        .attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', lCx).attr('y1', lCy - R - 12).attr('x2', lCx).attr('y2', lCy + R + 12)
        .attr('stroke', C.axis).attr('stroke-width', 1.5)

      // Compute triangle based on function
      let theta, px, py, legLabel, denomExpr, denomVal, denomNote

      if (fn === 'arcsin') {
        // arcsin(x): sin θ = x, so θ = arcsin(x)
        // Point on unit circle at angle θ from x-axis
        const xClamped = Math.max(-0.999, Math.min(0.999, x))
        theta = Math.asin(xClamped)
        px = Math.cos(theta)  // adjacent
        py = Math.sin(theta)  // opposite = x
        legLabel = 'x'
        denomExpr = '√(1−x²)'
        denomVal = Math.sqrt(1 - xClamped * xClamped)
        denomNote = `Adjacent leg = cos(θ) = √(1−sin²θ) = √(1−x²) ≈ ${denomVal.toFixed(4)}`
      } else {
        // arctan(x): tan θ = x, so θ = arctan(x)
        const xC = Math.max(-4, Math.min(4, x))
        theta = Math.atan(xC)
        // For arctan: build a right triangle with opp=x, adj=1, hyp=√(1+x²)
        // On the unit circle, map to angle θ
        px = Math.cos(theta)
        py = Math.sin(theta)
        legLabel = '1'
        denomExpr = '1+x²'
        denomVal = 1 + xC * xC
        denomNote = `Hyp² = 1 + x² = ${denomVal.toFixed(4)}, so cos²θ = 1/(1+x²)`
      }

      // Draw the right triangle
      const circPt = { x: lCx + px * R, y: lCy - py * R }
      const basePt = { x: lCx + px * R, y: lCy }

      // Triangle fill
      svg.append('polygon').attr('points', `${lCx},${lCy} ${circPt.x},${lCy} ${circPt.x},${circPt.y}`)
        .attr('fill', C.triF).attr('stroke', 'none')

      // Hypotenuse (radius)
      svg.append('line').attr('x1', lCx).attr('y1', lCy).attr('x2', circPt.x).attr('y2', circPt.y)
        .attr('stroke', C.hyp).attr('stroke-width', 2.5)

      // Adjacent leg (horizontal)
      svg.append('line').attr('x1', lCx).attr('y1', lCy).attr('x2', circPt.x).attr('y2', lCy)
        .attr('stroke', C.adj).attr('stroke-width', 2.5)

      // Opposite leg (vertical) — THIS becomes denominator
      svg.append('line').attr('x1', circPt.x).attr('y1', lCy).attr('x2', circPt.x).attr('y2', circPt.y)
        .attr('stroke', C.opp).attr('stroke-width', 2.5)

      // Right angle mark
      const rSz = R * 0.07
      svg.append('rect').attr('x', circPt.x).attr('y', lCy - rSz).attr('width', -rSz).attr('height', rSz)
        .attr('fill', 'none').attr('stroke', C.muted).attr('stroke-width', 1)

      // Angle arc
      const arcPath = d3.arc()({ innerRadius: R * 0.22, outerRadius: R * 0.22, startAngle: -theta, endAngle: 0 })
      svg.append('path').attr('d', arcPath).attr('transform', `translate(${lCx},${lCy})`)
        .attr('fill', 'none').attr('stroke', C.angle).attr('stroke-width', 2)
      svg.append('text').attr('x', lCx + R * 0.28 * Math.cos(theta / 2)).attr('y', lCy - R * 0.28 * Math.sin(theta / 2))
        .attr('text-anchor', 'middle').attr('fill', C.angle).attr('font-size', 12).attr('font-weight', 'bold').text('θ')

      // Point on circle
      svg.append('circle').attr('cx', circPt.x).attr('cy', circPt.y).attr('r', 6)
        .attr('fill', C.hyp).attr('stroke', C.bg).attr('stroke-width', 2)

      // Leg labels
      const midAdj = { x: (lCx + circPt.x) / 2, y: lCy + 16 }
      const midOpp = { x: circPt.x + 22, y: (lCy + circPt.y) / 2 }
      const midHyp = { x: (lCx + circPt.x) / 2 - 16, y: (lCy + circPt.y) / 2 - 10 }

      svg.append('text').attr('x', midAdj.x).attr('y', midAdj.y).attr('text-anchor', 'middle')
        .attr('fill', C.adj).attr('font-size', 12).attr('font-weight', 'bold')
        .text(fn === 'arcsin' ? '√(1−x²)' : 'adj')
      svg.append('text').attr('x', midOpp.x).attr('y', midOpp.y).attr('text-anchor', 'start')
        .attr('fill', C.opp).attr('font-size', 12).attr('font-weight', 'bold')
        .text(fn === 'arcsin' ? 'x = sinθ' : 'x = tanθ')
      svg.append('text').attr('x', midHyp.x).attr('y', midHyp.y).attr('text-anchor', 'middle')
        .attr('fill', C.hyp).attr('font-size', 12).attr('font-weight', 'bold').text('1')

      // Panel title
      svg.append('text').attr('x', halfW / 2 + 4).attr('y', 18).attr('text-anchor', 'middle')
        .attr('fill', C.muted).attr('font-size', 11).text(fn === 'arcsin' ? 'arcsin: triangle on unit circle' : 'arctan: right triangle with tan θ = x')

      // Zero-denominator warning
      const legLen = fn === 'arcsin' ? Math.sqrt(1 - x * x) : null
      if (legLen !== null && legLen < 0.12) {
        svg.append('text').attr('x', halfW / 2 + 4).attr('y', H - 12).attr('text-anchor', 'middle')
          .attr('fill', C.warn).attr('font-size', 12).attr('font-weight', 'bold')
          .text('Leg → 0! Slope → ∞  (vertical tangent at x = ±1)')
      }

      // ── RIGHT PANEL: Inverse trig curve ───────────────────────────────────
      const rx0 = halfW + 10
      const rPad = { t: 24, b: 24, l: 32, r: 8 }
      const rW = W - rx0 - rPad.l - rPad.r
      const rH = H - rPad.t - rPad.b

      let rXd, rYd, curveFn, slopeFn, curveLabel, slopeLabel

      if (fn === 'arcsin') {
        rXd = [-1, 1]; rYd = [-Math.PI / 2 - 0.1, Math.PI / 2 + 0.1]
        curveFn = v => Math.asin(v)
        slopeFn = v => 1 / Math.sqrt(1 - v * v)
        curveLabel = 'arcsin(x)'
        slopeLabel = '1/√(1−x²)'
      } else {
        rXd = [-4, 4]; rYd = [-Math.PI / 2 - 0.2, Math.PI / 2 + 0.2]
        curveFn = v => Math.atan(v)
        slopeFn = v => 1 / (1 + v * v)
        curveLabel = 'arctan(x)'
        slopeLabel = '1/(1+x²)'
      }

      const xR = d3.scaleLinear().domain(rXd).range([rx0 + rPad.l, rx0 + rPad.l + rW])
      const yR = d3.scaleLinear().domain(rYd).range([rPad.t + rH, rPad.t])

      // Grid
      ;[-1, -0.5, 0, 0.5, 1].concat(fn === 'arctan' ? [-3, -2, 2, 3] : []).forEach(v => {
        if (v >= rXd[0] && v <= rXd[1])
          svg.append('line').attr('x1', xR(v)).attr('y1', rPad.t).attr('x2', xR(v)).attr('y2', rPad.t + rH)
            .attr('stroke', C.grid).attr('stroke-width', 1)
      })

      // Axes
      svg.append('line').attr('x1', rx0 + rPad.l).attr('y1', yR(0)).attr('x2', rx0 + rPad.l + rW).attr('y2', yR(0))
        .attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', xR(0)).attr('y1', rPad.t).attr('x2', xR(0)).attr('y2', rPad.t + rH)
        .attr('stroke', C.axis).attr('stroke-width', 1.5)

      // Asymptote lines for arcsin (at x = ±1 slope → ∞)
      if (fn === 'arcsin') {
        ;[-1, 1].forEach(v => {
          svg.append('line').attr('x1', xR(v)).attr('y1', rPad.t).attr('x2', xR(v)).attr('y2', rPad.t + rH)
            .attr('stroke', C.warn).attr('stroke-width', 1).attr('stroke-dasharray', '4,3').attr('opacity', 0.6)
        })
        svg.append('text').attr('x', xR(1) + 3).attr('y', rPad.t + 12)
          .attr('fill', C.warn).attr('font-size', 10).text('slope→∞')
      }

      // Curve
      const step = (rXd[1] - rXd[0]) / 300
      const pts = []
      for (let i = 0; i <= 300; i++) {
        const v = rXd[0] + i * step
        const y = curveFn(v)
        if (isFinite(y)) pts.push([v, y])
      }
      if (pts.length > 2) {
        const cline = d3.line().x(d => xR(d[0])).y(d => yR(d[1])).curve(d3.curveCatmullRom)
        svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', C.curve).attr('stroke-width', 2.5).attr('d', cline)
      }

      // Current x (clamped to domain)
      const cx = Math.max(rXd[0] + 0.01, Math.min(rXd[1] - 0.01, fn === 'arcsin' ? Math.max(-0.999, Math.min(0.999, x)) : x))
      const cy = curveFn(cx)
      const slope = slopeFn(cx)

      // Tangent line
      if (isFinite(slope) && slope < 50) {
        const tx = 0.4 / Math.sqrt(1 + slope * slope)
        const ty = slope * tx
        svg.append('line').attr('x1', xR(cx - tx)).attr('y1', yR(cy - ty))
          .attr('x2', xR(cx + tx)).attr('y2', yR(cy + ty))
          .attr('stroke', C.tangent).attr('stroke-width', 2).attr('stroke-dasharray', '5,3')
      }

      // Point
      svg.append('circle').attr('cx', xR(cx)).attr('cy', yR(cy)).attr('r', 6)
        .attr('fill', C.pt).attr('stroke', C.bg).attr('stroke-width', 2)

      // Slope readout box
      const slopeStr = isFinite(slope) && slope < 99 ? slope.toFixed(4) : '→ ∞'
      const boxX = rx0 + rPad.l + 6, boxY = rPad.t + 6
      svg.append('rect').attr('x', boxX).attr('y', boxY).attr('width', rW - 10).attr('height', 46)
        .attr('rx', 6).attr('fill', isDark ? '#0c1825' : '#f0f7ff').attr('stroke', C.border).attr('stroke-width', 0.5)
      svg.append('text').attr('x', boxX + 6).attr('y', boxY + 16)
        .attr('fill', C.muted).attr('font-size', 11).text(`d/dx[${curveLabel}] = ${slopeLabel}`)
      svg.append('text').attr('x', boxX + 6).attr('y', boxY + 34)
        .attr('fill', C.pt).attr('font-size', 12).attr('font-weight', 'bold')
        .text(`At x = ${cx.toFixed(3)}: slope = ${slopeStr}`)

      svg.append('text').attr('x', rx0 + rPad.l + rW / 2).attr('y', rPad.t + rH + 18).attr('text-anchor', 'middle')
        .attr('fill', C.muted).attr('font-size', 11).text(curveLabel)
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [fn, x])

  const xMin = fn === 'arcsin' ? -0.99 : -4
  const xMax = fn === 'arcsin' ? 0.99 : 4

  const btnBase = { padding: '5px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: '0.5px solid var(--color-border-secondary)', fontWeight: 500 }
  const active = { ...btnBase, background: 'var(--color-background-info)', color: 'var(--color-text-info)', borderColor: 'var(--color-border-info)' }
  const inactive = { ...btnBase, background: 'transparent', color: 'var(--color-text-secondary)' }

  return (
    <div ref={containerRef} className="w-full">
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button style={fn === 'arcsin' ? active : inactive} onClick={() => { setFn('arcsin'); setX(0.5) }}>arcsin — denominator √(1−x²)</button>
        <button style={fn === 'arctan' ? active : inactive} onClick={() => { setFn('arctan'); setX(1) }}>arctan — denominator 1+x²</button>
      </div>
      <svg ref={svgRef} className="w-full" />
      <div style={{ padding: '8px 4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fbbf24', minWidth: 50 }}>x = {x.toFixed(2)}</span>
          <input type="range" min={xMin} max={xMax} step={0.01} value={x}
            onChange={e => setX(parseFloat(e.target.value))} style={{ flex: 1, accentColor: '#fbbf24' }} />
        </div>
        {fn === 'arcsin' && (
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            <span style={{ color: '#34d399', fontWeight: 600 }}>Green leg = √(1−x²)</span> — this is cos(θ) from the Pythagorean identity.
            As x → ±1 (the ends of the domain), this leg shrinks to 0, making the denominator 0 and the slope infinite.
            That is why arcsin has a vertical tangent at the endpoints of its domain.
          </div>
        )}
        {fn === 'arctan' && (
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            For arctan: tan θ = x. The hypotenuse is √(1+x²) by Pythagoras. cos(θ) = 1/√(1+x²), so cos²(θ) = 1/(1+x²).
            The slope never reaches 0 or ∞ because 1+x² is always ≥ 1 and finite.
          </div>
        )}
      </div>
    </div>
  )
}
