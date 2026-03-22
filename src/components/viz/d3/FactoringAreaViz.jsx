import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * FactoringAreaViz
 * Shows the area model of polynomial multiplication / factoring.
 * User picks (a,b) for (x+a)(x+b). Grid shows x², ax, bx, ab tiles.
 * Dual panel: left=tile grid, right=algebraic form.
 * Dark mode tokens. ResizeObserver.
 */
export default function FactoringAreaViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [a, setA] = useState(3)
  const [b, setB] = useState(2)

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:      isDark ? '#0f172a' : '#f8fafc',
        panel:   isDark ? '#1e293b' : '#ffffff',
        border:  isDark ? '#334155' : '#e2e8f0',
        text:    isDark ? '#e2e8f0' : '#1e293b',
        muted:   isDark ? '#64748b' : '#94a3b8',
        x2:      isDark ? '#1e3a5f' : '#dbeafe',
        x2s:     isDark ? '#3b82f6' : '#2563eb',
        ax:      isDark ? '#1a3a2a' : '#dcfce7',
        axs:     isDark ? '#34d399' : '#059669',
        bx:      isDark ? '#2d1b4a' : '#ede9fe',
        bxs:     isDark ? '#a78bfa' : '#7c3aed',
        ab:      isDark ? '#3d2a0a' : '#fef9c3',
        abs:     isDark ? '#fbbf24' : '#d97706',
      }

      const W = containerRef.current?.clientWidth || 560
      const H = Math.round(W * 0.64)
      const halfW = W * 0.52
      const gridSize = Math.min(halfW * 0.72, H * 0.72)
      const GX = (halfW - gridSize) / 2
      const GY = (H - gridSize) / 2

      const xUnit = gridSize * 0.62
      const aUnit = gridSize * (a / (10 + a + b)) * 0.38
      const bUnit = gridSize * (b / (10 + a + b)) * 0.38
      const xW = xUnit
      const aW = aUnit + bUnit > 0 ? gridSize - xUnit : 0

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      const drawTile = (x, y, w, h, fill, stroke, label, sublabel) => {
        svg.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h)
          .attr('fill', fill).attr('stroke', stroke).attr('stroke-width', 1.5).attr('rx', 4)
        if (label) {
          svg.append('text')
            .attr('x', x + w / 2).attr('y', y + h / 2 - (sublabel ? 7 : 0))
            .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
            .attr('fill', stroke).attr('font-size', Math.min(w, h) * 0.22).attr('font-weight', 'bold')
            .text(label)
        }
        if (sublabel) {
          svg.append('text')
            .attr('x', x + w / 2).attr('y', y + h / 2 + 9)
            .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
            .attr('fill', stroke).attr('font-size', 10)
            .text(sublabel)
        }
      }

      const aH = gridSize * (a / (a + b + 10)) * 0.38 + 1
      const bH = gridSize * (b / (a + b + 10)) * 0.38 + 1
      const xH = gridSize - aH - bH

      // x² tile (top-left, big)
      drawTile(GX, GY, xW, xH, C.x2, C.x2s, 'x²', null)
      // ax tile (top-right)
      if (a > 0) drawTile(GX + xW, GY, aW * a / (a + b), xH, C.ax, C.axs, a > 0 ? `${a}x` : '', null)
      // bx tile
      if (b > 0) drawTile(GX + xW + aW * a / (a + b), GY, aW * b / (a + b), xH, C.bx, C.bxs, b > 0 ? `${b}x` : '', null)
      // ab tile (bottom right)
      if (a > 0 && b > 0) drawTile(GX + xW, GY + xH, aW, aH + bH, C.ab, C.abs, `${a*b}`, null)

      // Dimension labels (top)
      svg.append('text').attr('x', GX + xW / 2).attr('y', GY - 8)
        .attr('text-anchor', 'middle').attr('fill', C.x2s).attr('font-size', 13).attr('font-weight', 'bold')
        .text('x')
      if (a + b > 0) {
        svg.append('text').attr('x', GX + xW + aW / 2).attr('y', GY - 8)
          .attr('text-anchor', 'middle').attr('fill', C.abs).attr('font-size', 13).attr('font-weight', 'bold')
          .text(`${a + b}`)
      }

      // Dimension labels (left)
      svg.append('text').attr('x', GX - 10).attr('y', GY + xH / 2)
        .attr('text-anchor', 'end').attr('dominant-baseline', 'central')
        .attr('fill', C.x2s).attr('font-size', 13).attr('font-weight', 'bold')
        .text('x')
      if (a + b > 0) {
        svg.append('text').attr('x', GX - 10).attr('y', GY + xH + (aH + bH) / 2)
          .attr('text-anchor', 'end').attr('dominant-baseline', 'central')
          .attr('fill', C.abs).attr('font-size', 13).attr('font-weight', 'bold')
          .text(`${a + b}`)
      }

      // Right panel — algebra
      const rx = halfW + 20
      const rw = W - rx - 10

      svg.append('rect').attr('x', rx).attr('y', 12).attr('width', rw).attr('height', H - 24)
        .attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      const mid = rx + rw / 2
      const product = a * b
      const sum = a + b

      svg.append('text').attr('x', mid).attr('y', 44).attr('text-anchor', 'middle')
        .attr('fill', C.muted).attr('font-size', 12).text('multiplication')
      svg.append('text').attr('x', mid).attr('y', 68).attr('text-anchor', 'middle')
        .attr('fill', C.text).attr('font-size', 15).attr('font-weight', 'bold')
        .text(`(x + ${a})(x + ${b})`)

      svg.append('text').attr('x', mid).attr('y', 96).attr('text-anchor', 'middle')
        .attr('fill', C.muted).attr('font-size', 11).text('= sum of all tile areas')

      const tileRows = [
        { label: 'x²', color: C.x2s },
        { label: `+ ${a}x`, color: C.axs },
        { label: `+ ${b}x`, color: C.bxs },
        { label: `+ ${product}`, color: C.abs },
      ]
      tileRows.forEach(({ label, color }, i) => {
        svg.append('text').attr('x', mid).attr('y', 120 + i * 22)
          .attr('text-anchor', 'middle').attr('fill', color)
          .attr('font-size', 14).attr('font-weight', 'bold').text(label)
      })

      svg.append('line').attr('x1', rx + 20).attr('y1', 216).attr('x2', rx + rw - 20).attr('y2', 216)
        .attr('stroke', C.border).attr('stroke-width', 1)

      svg.append('text').attr('x', mid).attr('y', 236).attr('text-anchor', 'middle')
        .attr('fill', C.muted).attr('font-size', 12).text('standard form')
      svg.append('text').attr('x', mid).attr('y', 258).attr('text-anchor', 'middle')
        .attr('fill', C.text).attr('font-size', 16).attr('font-weight', 'bold')
        .text(`x² + ${sum}x + ${product}`)

      svg.append('text').attr('x', mid).attr('y', 290).attr('text-anchor', 'middle')
        .attr('fill', C.muted).attr('font-size', 11).text('← factoring reverses this')

      svg.append('text').attr('x', mid).attr('y', H - 24).attr('text-anchor', 'middle')
        .attr('fill', C.muted).attr('font-size', 10).text('Adjust a and b below')
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [a, b, params.currentStep])

  const sliderStyle = { width: '100%', accentColor: '#fbbf24' }
  const row = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ padding: '8px 4px 0' }}>
        {[{ label: 'a', val: a, set: setA }, { label: 'b', val: b, set: setB }].map(({ label, val, set }) => (
          <div key={label} style={row}>
            <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fbbf24', minWidth: 16 }}>{label}</span>
            <input type="range" min={0} max={9} step={1} value={val}
              onChange={e => set(parseInt(e.target.value))} style={sliderStyle} />
            <span style={{ fontSize: 13, minWidth: 20, color: 'var(--color-text-secondary)' }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
