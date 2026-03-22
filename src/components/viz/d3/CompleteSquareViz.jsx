import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * CompleteSquareViz
 * Animates completing the square geometrically.
 * Shows x² + bx as geometric shapes, then adds the (b/2)² corner.
 * currentStep (0-3) drives the animation stages.
 * Dark mode. ResizeObserver.
 */
export default function CompleteSquareViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [b, setB] = useState(4)
  const step = params.currentStep ?? 3

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:      isDark ? '#0f172a' : '#f8fafc',
        panel:   isDark ? '#1e293b' : '#ffffff',
        border:  isDark ? '#334155' : '#e2e8f0',
        text:    isDark ? '#e2e8f0' : '#1e293b',
        muted:   isDark ? '#64748b' : '#94a3b8',
        sq:      isDark ? '#1e3a5f' : '#dbeafe',
        sqS:     isDark ? '#3b82f6' : '#2563eb',
        rect1:   isDark ? '#1a3a2a' : '#dcfce7',
        rect1S:  isDark ? '#34d399' : '#059669',
        rect2:   isDark ? '#2d1b4a' : '#ede9fe',
        rect2S:  isDark ? '#a78bfa' : '#7c3aed',
        corner:  isDark ? '#3d2a0a' : '#fef9c3',
        cornerS: isDark ? '#fbbf24' : '#d97706',
        dashed:  isDark ? '#475569' : '#94a3b8',
      }

      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.68)
      const maxSize = Math.min(W * 0.48, H * 0.76)
      const half = b / 2
      const unit = maxSize / (10 + half) * 7
      const xSize = unit
      const hSize = (half / 10) * unit * 1.4

      const GX = W * 0.08
      const GY = (H - xSize - hSize) / 2

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      // Stage 0: x² square
      svg.append('rect')
        .attr('x', GX).attr('y', GY)
        .attr('width', xSize).attr('height', xSize)
        .attr('fill', C.sq).attr('stroke', C.sqS).attr('stroke-width', 2).attr('rx', 4)
      svg.append('text')
        .attr('x', GX + xSize / 2).attr('y', GY + xSize / 2)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
        .attr('fill', C.sqS).attr('font-size', 22).attr('font-weight', 'bold')
        .text('x²')

      // x-dimension label
      svg.append('text').attr('x', GX + xSize / 2).attr('y', GY - 10)
        .attr('text-anchor', 'middle').attr('fill', C.sqS).attr('font-size', 13).attr('font-weight', 'bold')
        .text('x')
      svg.append('text').attr('x', GX - 10).attr('y', GY + xSize / 2)
        .attr('text-anchor', 'end').attr('dominant-baseline', 'central')
        .attr('fill', C.sqS).attr('font-size', 13).attr('font-weight', 'bold')
        .text('x')

      if (step >= 1 && b > 0) {
        // Stage 1: split bx into two rectangles of b/2 each
        // Right rectangle (b/2 wide, x tall)
        svg.append('rect')
          .attr('x', GX + xSize).attr('y', GY)
          .attr('width', hSize).attr('height', xSize)
          .attr('fill', C.rect1).attr('stroke', C.rect1S).attr('stroke-width', 2).attr('rx', 4)
        svg.append('text')
          .attr('x', GX + xSize + hSize / 2).attr('y', GY + xSize / 2)
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
          .attr('fill', C.rect1S).attr('font-size', 12).attr('font-weight', 'bold')
          .text(`½bx`)

        // Bottom rectangle (x wide, b/2 tall)
        svg.append('rect')
          .attr('x', GX).attr('y', GY + xSize)
          .attr('width', xSize).attr('height', hSize)
          .attr('fill', C.rect2).attr('stroke', C.rect2S).attr('stroke-width', 2).attr('rx', 4)
        svg.append('text')
          .attr('x', GX + xSize / 2).attr('y', GY + xSize + hSize / 2)
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
          .attr('fill', C.rect2S).attr('font-size', 12).attr('font-weight', 'bold')
          .text(`½bx`)

        // b/2 labels
        svg.append('text').attr('x', GX + xSize + hSize / 2).attr('y', GY - 10)
          .attr('text-anchor', 'middle').attr('fill', C.rect1S).attr('font-size', 12).attr('font-weight', 'bold')
          .text('b/2')
        svg.append('text').attr('x', GX - 10).attr('y', GY + xSize + hSize / 2)
          .attr('text-anchor', 'end').attr('dominant-baseline', 'central')
          .attr('fill', C.rect2S).attr('font-size', 12).attr('font-weight', 'bold')
          .text('b/2')
      }

      if (step >= 2 && b > 0) {
        // Stage 2: show missing corner (dashed)
        svg.append('rect')
          .attr('x', GX + xSize).attr('y', GY + xSize)
          .attr('width', hSize).attr('height', hSize)
          .attr('fill', 'none').attr('stroke', C.dashed)
          .attr('stroke-width', 2).attr('stroke-dasharray', '6,4').attr('rx', 4)
        svg.append('text')
          .attr('x', GX + xSize + hSize / 2).attr('y', GY + xSize + hSize / 2)
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
          .attr('fill', C.dashed).attr('font-size', 11)
          .text('?')
      }

      if (step >= 3 && b > 0) {
        // Stage 3: fill in the corner
        svg.append('rect')
          .attr('x', GX + xSize).attr('y', GY + xSize)
          .attr('width', hSize).attr('height', hSize)
          .attr('fill', C.corner).attr('stroke', C.cornerS).attr('stroke-width', 2).attr('rx', 4)
        svg.append('text')
          .attr('x', GX + xSize + hSize / 2).attr('y', GY + xSize + hSize / 2)
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
          .attr('fill', C.cornerS).attr('font-size', 11).attr('font-weight', 'bold')
          .text(`(b/2)²`)
      }

      // Right panel — algebra display
      const rx = GX + xSize + hSize + 28
      const rw = W - rx - 16

      if (rw > 60) {
        svg.append('rect').attr('x', rx).attr('y', 12).attr('width', rw).attr('height', H - 24)
          .attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

        const mid = rx + rw / 2
        const fs = Math.min(rw * 0.1, 13)

        const lines = [
          { t: `x² + ${b}x`, c: C.text, s: fs * 1.1 },
          { t: `= x² + ${b}x + (${half})²`, c: C.muted, s: fs },
          { t: `  − (${half})²`, c: C.cornerS, s: fs },
          { t: `= (x + ${half})²`, c: C.sqS, s: fs * 1.1 },
          { t: `  − ${half * half}`, c: C.cornerS, s: fs },
        ]

        lines.forEach(({ t, c, s }, i) => {
          svg.append('text')
            .attr('x', mid).attr('y', H * 0.2 + i * (fs * 1.8))
            .attr('text-anchor', 'middle').attr('fill', c).attr('font-size', s).attr('font-weight', i === 0 || i === 3 ? 'bold' : 'normal')
            .text(t)
        })

        svg.append('text').attr('x', mid).attr('y', H - 28)
          .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10)
          .text('Add (b/2)² and subtract it — net zero change')
      }

      svg.append('text').attr('x', W / 2).attr('y', H - 8)
        .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10)
        .text('Adjust b below · use Next Step in the proof panel')
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [b, step, params.currentStep])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px 0' }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fbbf24', minWidth: 16 }}>b</span>
        <input type="range" min={0} max={10} step={1} value={b}
          onChange={e => setB(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: '#fbbf24' }} />
        <span style={{ fontSize: 13, minWidth: 20, color: 'var(--color-text-secondary)' }}>{b}</span>
      </div>
    </div>
  )
}
