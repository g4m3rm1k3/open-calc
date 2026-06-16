import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * LogPropertiesViz
 * Shows ln(M), ln(N), and ln(MN) as areas under y=1/t.
 * Left panel: the curve with three shaded regions.
 * Right panel: numerical verification that areas add.
 * Sliders for M and N.
 * Dark mode. ResizeObserver.
 */
export default function LogPropertiesViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [M, setM] = useState(2)
  const [N, setN] = useState(3)

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
        curve:  isDark ? '#38bdf8' : '#0284c7',
        lnM:    isDark ? 'rgba(167,139,250,0.35)' : 'rgba(124,58,237,0.2)',
        lnMs:   isDark ? '#a78bfa' : '#7c3aed',
        lnN:    isDark ? 'rgba(52,211,153,0.35)' : 'rgba(5,150,105,0.2)',
        lnNs:   isDark ? '#34d399' : '#059669',
        lnMN:   isDark ? 'rgba(251,191,36,0.2)' : 'rgba(217,119,6,0.1)',
        lnMNs:  isDark ? '#fbbf24' : '#d97706',
      }

      const MN = M * N
      const maxT = Math.max(MN + 0.5, 8)

      const W = containerRef.current?.clientWidth || 540
      const H = Math.round(W * 0.56)
      const leftW = Math.round(W * 0.62)
      const pad = { t: 28, b: 28, l: 36, r: 8 }
      const iW = leftW - pad.l - pad.r
      const iH = H - pad.t - pad.b

      const xS = d3.scaleLinear().domain([0.3, maxT]).range([pad.l, pad.l + iW])
      const yS = d3.scaleLinear().domain([0, 2.2]).range([pad.t + iH, pad.t])

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      svg.append('rect').attr('x', 2).attr('y', 2).attr('width', leftW - 4).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      // Axes
      svg.append('line').attr('x1', xS(0.3)).attr('y1', yS(0)).attr('x2', xS(maxT)).attr('y2', yS(0)).attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', xS(1)).attr('y1', pad.t - 4).attr('x2', xS(1)).attr('y2', pad.t + iH).attr('stroke', C.axis).attr('stroke-width', 1.5)

      const shadeArea = (lo, hi, fill, stroke) => {
        const pts = d3.range(Math.max(lo, 0.32), hi, 0.02).map(t => [t, 1 / t])
        if (pts.length < 2) return
        const area = d3.area().x(d => xS(d[0])).y0(yS(0)).y1(d => yS(d[1])).curve(d3.curveMonotoneX)
        svg.append('path').datum(pts).attr('fill', fill).attr('d', area)
        ;[lo, hi].forEach(v => {
          if (v > 0.32 && v < maxT) {
            svg.append('line').attr('x1', xS(v)).attr('y1', yS(0)).attr('x2', xS(v)).attr('y2', yS(1 / v)).attr('stroke', stroke).attr('stroke-width', 2)
          }
        })
      }

      // Shade regions
      shadeArea(1, M, C.lnM, C.lnMs)
      shadeArea(M, MN, C.lnN, C.lnNs)

      // Curve y = 1/t
      const curveData = d3.range(0.32, maxT, 0.04).map(t => [t, Math.min(1 / t, 2.2)])
      const curveLine = d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveMonotoneX)
      svg.append('path').datum(curveData).attr('fill', 'none').attr('stroke', C.curve).attr('stroke-width', 2.5).attr('d', curveLine)
      svg.append('text').attr('x', xS(0.5)).attr('y', yS(2)).attr('fill', C.curve).attr('font-size', 12).attr('font-weight', 'bold').text('y = 1/t')

      // Tick labels at 1, M, MN
      ;[[1, '1', C.muted], [M, `M=${M}`, C.lnMs], [MN, `MN=${MN}`, C.lnNs]].forEach(([v, lbl, col]) => {
        if (v > 0.4 && v < maxT) {
          svg.append('text').attr('x', xS(v)).attr('y', yS(0) + 13).attr('text-anchor', 'middle').attr('fill', col).attr('font-size', 11).attr('font-weight', 'bold').text(lbl)
        }
      })

      // Area value labels
      const lnM = Math.log(M), lnN = Math.log(N), lnMN = Math.log(MN)
      const midM = (1 + M) / 2, midN = (M + MN) / 2
      if (midM < maxT) {
        svg.append('text').attr('x', xS(midM)).attr('y', yS(0.35)).attr('text-anchor', 'middle').attr('fill', C.lnMs).attr('font-size', 12).attr('font-weight', 'bold').text(`ln(${M})`)
        svg.append('text').attr('x', xS(midM)).attr('y', yS(0.22)).attr('text-anchor', 'middle').attr('fill', C.lnMs).attr('font-size', 11).text(`= ${lnM.toFixed(3)}`)
      }
      if (midN < maxT && M < MN) {
        svg.append('text').attr('x', xS(midN)).attr('y', yS(0.35)).attr('text-anchor', 'middle').attr('fill', C.lnNs).attr('font-size', 12).attr('font-weight', 'bold').text(`ln(${N})`)
        svg.append('text').attr('x', xS(midN)).attr('y', yS(0.22)).attr('text-anchor', 'middle').attr('fill', C.lnNs).attr('font-size', 11).text(`= ${lnN.toFixed(3)}`)
      }

      // Right panel
      const rx = leftW + 8, rw = W - rx - 8
      svg.append('rect').attr('x', rx).attr('y', 2).attr('width', rw).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)
      const mid = rx + rw / 2
      const fs = Math.min(rw * 0.085, 12)

      svg.append('text').attr('x', mid).attr('y', 22).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', fs * 0.9).text('product rule check')

      const rows = [
        { label: `ln(${M})`, val: lnM.toFixed(4), col: C.lnMs },
        { label: `ln(${N})`, val: lnN.toFixed(4), col: C.lnNs },
        { label: `ln(${M})+ln(${N})`, val: (lnM + lnN).toFixed(4), col: C.lnMNs },
        { label: `ln(${M}×${N})=ln(${MN})`, val: lnMN.toFixed(4), col: C.text },
      ]

      rows.forEach(({ label, val, col }, i) => {
        const y = 36 + i * ((H - 80) / 4)
        svg.append('text').attr('x', rx + 10).attr('y', y).attr('fill', C.muted).attr('font-size', fs * 0.85).text(label)
        svg.append('text').attr('x', rx + rw - 10).attr('y', y + 14).attr('text-anchor', 'end').attr('fill', col).attr('font-size', fs * 1.1).attr('font-weight', 'bold').text(val)
        if (i < rows.length - 1) svg.append('line').attr('x1', rx + 8).attr('y1', y + 22).attr('x2', rx + rw - 8).attr('y2', y + 22).attr('stroke', C.border).attr('stroke-width', 0.5)
      })

      svg.append('rect').attr('x', rx + 8).attr('y', H - 46).attr('width', rw - 16).attr('height', 36).attr('rx', 6)
        .attr('fill', isDark ? '#1a3a2a' : '#dcfce7').attr('stroke', C.lnNs).attr('stroke-width', 1)
      svg.append('text').attr('x', mid).attr('y', H - 32).attr('text-anchor', 'middle').attr('fill', C.lnNs).attr('font-size', 12).attr('font-weight', 'bold').text('ln(M) + ln(N) = ln(MN) ✓')
      svg.append('text').attr('x', mid).attr('y', H - 16).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text('Areas add — product rule is geometry')
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [M, N, params.currentStep])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ padding: '10px 2px 0' }}>
        {[
          { label: 'M', val: M, set: setM, color: '#a78bfa' },
          { label: 'N', val: N, set: setN, color: '#34d399' },
        ].map(({ label, val, set, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 'bold', color, minWidth: 32 }}>{label} = {val}</span>
            <input type="range" min={1.1} max={5} step={0.1} value={val} onChange={e => set(parseFloat(e.target.value))} style={{ flex: 1, accentColor: color }} />
          </div>
        ))}
        <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
          Purple area = ln(M). Green area = ln(N). Together they equal ln(MN) — the product rule as geometry.
        </p>
      </div>
    </div>
  )
}
