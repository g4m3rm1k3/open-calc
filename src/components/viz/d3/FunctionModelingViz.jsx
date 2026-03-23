import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * FunctionModelingViz
 * The classic fence problem: fixed perimeter 400m, maximise area.
 * Left: live rectangle that reshapes as slider moves.
 * Right: area function A(l) = l(200-l) plotted, with draggable l marker.
 * Dark mode. ResizeObserver.
 */
export default function FunctionModelingViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [l, setL] = useState(120)

  const P = 400
  const w = val => P / 2 - val
  const A = val => val * w(val)
  const maxL = P / 2 - 1

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
        rect:   isDark ? 'rgba(56,189,248,0.15)' : 'rgba(2,132,199,0.1)',
        rectS:  isDark ? '#38bdf8' : '#0284c7',
        curve:  isDark ? '#a78bfa' : '#7c3aed',
        marker: isDark ? '#fbbf24' : '#d97706',
        max:    isDark ? '#34d399' : '#059669',
        dim:    isDark ? '#f472b6' : '#db2777',
      }

      const W = containerRef.current?.clientWidth || 540
      const H = Math.round(W * 0.58)
      const halfW = Math.floor(W / 2) - 4

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      const curL = Math.max(1, Math.min(maxL, l))
      const curW = w(curL)
      const curA = A(curL)
      const maxA = A(100)

      // ── LEFT PANEL: live rectangle ──────────────────────────────────
      svg.append('rect').attr('x', 2).attr('y', 2).attr('width', halfW - 4).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      const maxDim = Math.max(curL, curW, 1)
      const scale = Math.min((halfW - 60) / maxDim, (H - 60) / maxDim)
      const rW = curL * scale, rH = curW * scale
      const ox = (halfW - rW) / 2, oy = (H - rH) / 2

      svg.append('rect').attr('x', ox).attr('y', oy).attr('width', rW).attr('height', rH).attr('fill', C.rect).attr('stroke', C.rectS).attr('stroke-width', 2).attr('rx', 2)

      // Dimension labels
      svg.append('text').attr('x', ox + rW / 2).attr('y', oy - 8).attr('text-anchor', 'middle').attr('fill', C.dim).attr('font-size', 12).attr('font-weight', 'bold').text(`l = ${curL.toFixed(0)} m`)
      svg.append('text').attr('x', ox - 8).attr('y', oy + rH / 2).attr('text-anchor', 'end').attr('dominant-baseline', 'central').attr('fill', C.dim).attr('font-size', 12).attr('font-weight', 'bold').text(`w = ${curW.toFixed(0)} m`)

      // Area label
      svg.append('text').attr('x', ox + rW / 2).attr('y', oy + rH / 2).attr('text-anchor', 'middle').attr('dominant-baseline', 'central').attr('fill', C.rectS).attr('font-size', Math.min(rW * 0.12, 14)).attr('font-weight', 'bold').text(`A = ${curA.toFixed(0)} m²`)

      // Constraint reminder
      svg.append('text').attr('x', halfW / 2).attr('y', H - 10).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(`Perimeter = 2(${curL.toFixed(0)}) + 2(${curW.toFixed(0)}) = ${(2*curL+2*curW).toFixed(0)} m`)

      // ── RIGHT PANEL: area curve ──────────────────────────────────────
      const rx = halfW + 8, rw = W - rx - 8
      svg.append('rect').attr('x', rx).attr('y', 2).attr('width', rw).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      const pad = { t: 28, b: 28, l: 44, r: 12 }
      const iW = rw - pad.l - pad.r, iH = H - pad.t - pad.b
      const xS = d3.scaleLinear().domain([0, 200]).range([rx + pad.l, rx + pad.l + iW])
      const yS = d3.scaleLinear().domain([0, 11000]).range([pad.t + iH, pad.t])

      // Grid
      for (let v = 0; v <= 10000; v += 2500) {
        svg.append('line').attr('x1', rx + pad.l).attr('y1', yS(v)).attr('x2', rx + pad.l + iW).attr('y2', yS(v)).attr('stroke', C.grid).attr('stroke-width', 1)
        svg.append('text').attr('x', rx + pad.l - 4).attr('y', yS(v) + 4).attr('text-anchor', 'end').attr('fill', C.muted).attr('font-size', 9).text(v === 0 ? '0' : `${v/1000}k`)
      }

      // Axes
      svg.append('line').attr('x1', rx + pad.l).attr('y1', yS(0)).attr('x2', rx + pad.l + iW).attr('y2', yS(0)).attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', rx + pad.l).attr('y1', pad.t).attr('x2', rx + pad.l).attr('y2', pad.t + iH).attr('stroke', C.axis).attr('stroke-width', 1.5)

      // x-axis labels
      ;[0, 50, 100, 150, 200].forEach(v => {
        svg.append('text').attr('x', xS(v)).attr('y', yS(0) + 13).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 9).text(v)
      })

      svg.append('text').attr('x', xS(100)).attr('y', pad.t - 8).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text('A(l) = l(200 − l)')

      // Area curve
      const curveData = d3.range(1, 199, 1).map(v => [v, A(v)])
      const curveLine = d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom)
      svg.append('path').datum(curveData).attr('fill', 'none').attr('stroke', C.curve).attr('stroke-width', 2.5).attr('d', curveLine)

      // Max marker at l=100
      svg.append('line').attr('x1', xS(100)).attr('y1', yS(0)).attr('x2', xS(100)).attr('y2', yS(maxA)).attr('stroke', C.max).attr('stroke-width', 1).attr('stroke-dasharray', '4,3')
      svg.append('circle').attr('cx', xS(100)).attr('cy', yS(maxA)).attr('r', 5).attr('fill', C.max).attr('stroke', C.bg).attr('stroke-width', 2)
      svg.append('text').attr('x', xS(100) + 6).attr('y', yS(maxA) - 8).attr('fill', C.max).attr('font-size', 10).text('max: 10,000 m²')

      // Current l marker
      svg.append('line').attr('x1', xS(curL)).attr('y1', yS(0)).attr('x2', xS(curL)).attr('y2', yS(curA)).attr('stroke', C.marker).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
      svg.append('circle').attr('cx', xS(curL)).attr('cy', yS(curA)).attr('r', 6).attr('fill', C.marker).attr('stroke', C.bg).attr('stroke-width', 2).attr('cursor', 'ew-resize')
        .call(d3.drag().on('drag', (event) => {
          const raw = xS.invert(event.x)
          setL(Math.max(1, Math.min(maxL, Math.round(raw))))
        }))

      // Axis labels
      svg.append('text').attr('x', rx + pad.l + iW / 2).attr('y', H - 8).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text('length l (m)')
      svg.append('text').attr('x', rx + 8).attr('y', pad.t + iH / 2).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).attr('transform', `rotate(-90, ${rx + 8}, ${pad.t + iH / 2})`).text('area (m²)')
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [l, params.currentStep])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px 0' }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fbbf24', minWidth: 56 }}>l = {l} m</span>
        <input type="range" min={1} max={199} step={1} value={l} onChange={e => setL(parseInt(e.target.value))} style={{ flex: 1, accentColor: '#fbbf24' }} />
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', minWidth: 80 }}>w = {Math.round(200-l)} m</span>
      </div>
    </div>
  )
}
