import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * LogExpReciprocalViz
 *
 * Fixes: "Log-Exp Reciprocal Growth"
 *
 * Shows eˣ and ln(x) side by side on the same graph.
 * Key insight: slope of eˣ at any point = its y-value.
 * When reflected to get ln(x), slope becomes 1/y = 1/(eˣ) = 1/x.
 *
 * Interactive elements:
 *   - Drag a point along eˣ
 *   - See the tangent slope = y-value (the special property of eˣ)
 *   - See the reflected point on ln(x)
 *   - See slope of ln(x) = 1/(slope of eˣ) = 1/x
 *
 * Three-panel HUD showing the algebra connecting them.
 * Dark mode. ResizeObserver.
 */
export default function LogExpReciprocalViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [t, setT] = useState(1.0) // parameter along eˣ: x = t

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
        exp:    isDark ? '#38bdf8' : '#0284c7',    // eˣ — blue
        log:    isDark ? '#34d399' : '#059669',    // ln(x) — green
        mirror: isDark ? '#475569' : '#cbd5e1',    // y=x
        ptA:    isDark ? '#fbbf24' : '#d97706',    // point on eˣ
        ptB:    isDark ? '#f472b6' : '#db2777',    // point on ln(x)
        tanA:   isDark ? 'rgba(251,191,36,0.65)' : 'rgba(217,119,6,0.5)',
        tanB:   isDark ? 'rgba(244,114,182,0.65)' : 'rgba(219,39,119,0.5)',
        hud:    isDark ? '#162032' : '#f0f7ff',
        special: isDark ? '#a78bfa' : '#7c3aed',
      }

      const W = containerRef.current?.clientWidth || 560
      const H = Math.round(W * 0.72)
      const pad = { t: 28, b: 32, l: 42, r: 16 }
      const iW = W - pad.l - pad.r
      const iH = H - pad.t - pad.b

      const xd = [-2.5, 4], yd = [-0.5, 8]
      const xS = d3.scaleLinear().domain(xd).range([pad.l, pad.l + iW])
      const yS = d3.scaleLinear().domain(yd).range([pad.t + iH, pad.t])

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      svg.append('rect').attr('x', 1).attr('y', 1).attr('width', W - 2).attr('height', H - 2)
        .attr('rx', 10).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      // Grid
      xS.ticks(8).forEach(v => {
        svg.append('line').attr('x1', xS(v)).attr('y1', pad.t).attr('x2', xS(v)).attr('y2', pad.t + iH)
          .attr('stroke', C.grid).attr('stroke-width', 1)
        if (v !== 0) svg.append('text').attr('x', xS(v)).attr('y', yS(0) + 14).attr('text-anchor', 'middle')
          .attr('fill', C.muted).attr('font-size', 10).text(v)
      })
      yS.ticks(6).forEach(v => {
        svg.append('line').attr('x1', pad.l).attr('y1', yS(v)).attr('x2', pad.l + iW).attr('y2', yS(v))
          .attr('stroke', C.grid).attr('stroke-width', 1)
        if (v !== 0) svg.append('text').attr('x', pad.l - 4).attr('y', yS(v) + 4).attr('text-anchor', 'end')
          .attr('fill', C.muted).attr('font-size', 10).text(v)
      })

      // Axes
      svg.append('line').attr('x1', pad.l).attr('y1', yS(0)).attr('x2', pad.l + iW).attr('y2', yS(0))
        .attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', xS(0)).attr('y1', pad.t).attr('x2', xS(0)).attr('y2', pad.t + iH)
        .attr('stroke', C.axis).attr('stroke-width', 1.5)

      // y = x mirror
      const mMin = Math.max(xd[0], yd[0]), mMax = Math.min(xd[1], yd[1])
      svg.append('line').attr('x1', xS(mMin)).attr('y1', yS(mMin)).attr('x2', xS(mMax)).attr('y2', yS(mMax))
        .attr('stroke', C.mirror).attr('stroke-width', 1.5).attr('stroke-dasharray', '6,4')
      svg.append('text').attr('x', xS(3.5) + 4).attr('y', yS(3.5) - 6)
        .attr('fill', C.muted).attr('font-size', 11).text('y = x')

      const drawCurve = (fn, col, w) => {
        const step = (xd[1] - xd[0]) / 400
        let segs = [], cur = []
        for (let i = 0; i <= 400; i++) {
          const x = xd[0] + i * step
          const y = fn(x)
          if (!isFinite(y) || y < yd[0] - 0.5 || y > yd[1] + 0.5) {
            if (cur.length > 1) segs.push(cur)
            cur = []
          } else { cur.push([x, y]) }
        }
        if (cur.length > 1) segs.push(cur)
        const line = d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom)
        segs.forEach(s => svg.append('path').datum(s).attr('fill', 'none').attr('stroke', col)
          .attr('stroke-width', w).attr('d', line))
      }

      drawCurve(x => Math.exp(x), C.exp, 2.5)
      drawCurve(x => x > 0 ? Math.log(x) : NaN, C.log, 2.5)

      // Curve labels
      svg.append('text').attr('x', xS(2) + 6).attr('y', yS(Math.exp(2)) - 8)
        .attr('fill', C.exp).attr('font-size', 12).attr('font-weight', 'bold').text('y = eˣ')
      svg.append('text').attr('x', xS(7) + 4).attr('y', yS(Math.log(7)) - 6)
        .attr('fill', C.log).attr('font-size', 12).attr('font-weight', 'bold').text('y = ln(x)')

      // Current points
      const ax = Math.max(xd[0] + 0.01, Math.min(2, t))
      const ay = Math.exp(ax)
      // Reflected point: (ay, ax)
      const bx = ay, by = ax

      // THE KEY INSIGHT: slope of eˣ at ax = ay (y-value!)
      const slopeExp = ay
      const slopeLn = isFinite(bx) && bx > 0 ? 1 / bx : NaN // = 1/x at point B

      // Tangents
      const drawTan = (px, py, slope, col, len = 1.2) => {
        if (!isFinite(slope)) return
        const dx = len / Math.sqrt(1 + slope * slope)
        const dy = slope * dx
        svg.append('line').attr('x1', xS(px - dx)).attr('y1', yS(py - dy))
          .attr('x2', xS(px + dx)).attr('y2', yS(py + dy))
          .attr('stroke', col).attr('stroke-width', 2).attr('stroke-dasharray', '5,3')
      }
      drawTan(ax, ay, slopeExp, C.tanA)
      if (bx >= xd[0] && bx <= xd[1] && by >= yd[0] && by <= yd[1])
        drawTan(bx, by, slopeLn, C.tanB)

      // Connection line
      if (bx >= xd[0] && bx <= xd[1] && by >= yd[0] && by <= yd[1]) {
        svg.append('line').attr('x1', xS(ax)).attr('y1', yS(ay))
          .attr('x2', xS(bx)).attr('y2', yS(by))
          .attr('stroke', C.muted).attr('stroke-width', 1).attr('stroke-dasharray', '3,3')
      }

      // Point A
      svg.append('circle').attr('cx', xS(ax)).attr('cy', yS(ay)).attr('r', 7)
        .attr('fill', C.ptA).attr('stroke', C.bg).attr('stroke-width', 2).attr('cursor', 'ew-resize')
        .call(d3.drag().on('drag', (event) => {
          const nx = Math.max(xd[0] + 0.1, Math.min(2, xS.invert(event.x)))
          setT(nx)
        }))
      svg.append('text').attr('x', xS(ax) + 8).attr('y', yS(ay) - 10)
        .attr('fill', C.ptA).attr('font-size', 11).attr('font-weight', 'bold')
        .text(`A=(${ax.toFixed(2)}, ${ay.toFixed(2)})`)

      // Point B
      if (bx >= xd[0] && bx <= xd[1] && by >= yd[0] && by <= yd[1]) {
        svg.append('circle').attr('cx', xS(bx)).attr('cy', yS(by)).attr('r', 7)
          .attr('fill', C.ptB).attr('stroke', C.bg).attr('stroke-width', 2)
        svg.append('text').attr('x', xS(bx) + 8).attr('y', yS(by) - 10)
          .attr('fill', C.ptB).attr('font-size', 11).attr('font-weight', 'bold')
          .text(`B=(${bx.toFixed(2)}, ${by.toFixed(2)})`)
      }

      // Special property callout
      const spX = pad.l + 8, spY = pad.t + 8
      svg.append('rect').attr('x', spX).attr('y', spY).attr('width', 220).attr('height', 52)
        .attr('rx', 8).attr('fill', isDark ? '#1e1a3d' : '#f3eeff').attr('stroke', C.special).attr('stroke-width', 1)
      svg.append('text').attr('x', spX + 8).attr('y', spY + 18).attr('fill', C.special)
        .attr('font-size', 12).attr('font-weight', 'bold').text('Special property of eˣ:')
      svg.append('text').attr('x', spX + 8).attr('y', spY + 36).attr('fill', C.special)
        .attr('font-size', 12).text(`slope = y-value = ${ay.toFixed(4)}`)

      // HUD
      const hudX = pad.l + iW - 228, hudY = pad.t + iH - 96
      svg.append('rect').attr('x', hudX).attr('y', hudY).attr('width', 224).attr('height', 90)
        .attr('rx', 8).attr('fill', C.hud).attr('stroke', C.border).attr('stroke-width', 0.5)

      const rows = [
        { label: 'slope of eˣ at A:', val: `eᵃ = ${slopeExp.toFixed(4)}`, col: C.ptA },
        { label: 'slope of ln(x) at B:', val: `1/b = 1/${bx.toFixed(3)} = ${slopeLn.toFixed(4)}`, col: C.ptB },
        { label: 'product:', val: Math.abs(slopeExp * slopeLn - 1) < 0.002 ? '1.000 ✓' : (slopeExp * slopeLn).toFixed(4), col: Math.abs(slopeExp * slopeLn - 1) < 0.002 ? '#059669' : C.text },
        { label: 'd/dx[ln x] at B =', val: `1/x = 1/${bx.toFixed(3)} = ${slopeLn.toFixed(4)}`, col: C.log },
      ]
      rows.forEach(({ label, val, col }, i) => {
        const ry = hudY + 18 + i * 20
        svg.append('text').attr('x', hudX + 8).attr('y', ry).attr('fill', C.muted).attr('font-size', 11).text(label)
        svg.append('text').attr('x', hudX + 218).attr('y', ry).attr('text-anchor', 'end')
          .attr('fill', col).attr('font-size', 11).attr('font-weight', 'bold').text(val)
      })
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [t])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ padding: '10px 4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fbbf24', minWidth: 60 }}>x = {t.toFixed(2)}</span>
          <input type="range" min={-2} max={2} step={0.02} value={t}
            onChange={e => setT(parseFloat(e.target.value))} style={{ flex: 1, accentColor: '#fbbf24' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, lineHeight: 1.6 }}>
          <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--color-background-secondary)', borderLeft: '3px solid #38bdf8' }}>
            <div style={{ color: '#0284c7', fontWeight: 600, marginBottom: 3 }}>The special property of eˣ</div>
            <div style={{ color: 'var(--color-text-secondary)' }}>
              At point A = (a, eᵃ): slope = eᵃ = y-value. The function equals its own derivative.
              No other base has this property.
            </div>
          </div>
          <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--color-background-secondary)', borderLeft: '3px solid #34d399' }}>
            <div style={{ color: '#059669', fontWeight: 600, marginBottom: 3 }}>How ln(x) inherits 1/x</div>
            <div style={{ color: 'var(--color-text-secondary)' }}>
              B = (eᵃ, a). Slope of ln at B = 1/slope of eˣ at A = 1/eᵃ = 1/b.
              At a general point (x, ln(x)): slope = 1/x.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
