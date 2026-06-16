import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

/**
 * SystemsGeometryViz
 * Two draggable lines, shows their intersection.
 * Dark mode. ResizeObserver.
 */
export default function SystemsGeometryViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const line1Ref = useRef({ m: 1, b: -1 })
  const line2Ref = useRef({ m: -0.5, b: 2 })

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
        l1:     isDark ? '#38bdf8' : '#0284c7',
        l2:     isDark ? '#a78bfa' : '#7c3aed',
        inter:  isDark ? '#fbbf24' : '#d97706',
      }

      const W = containerRef.current?.clientWidth || 480
      const H = Math.round(W * 0.72)
      const cx = W * 0.44
      const cy = H / 2
      const range = 5
      const scale = Math.min(cx, cy) * 0.85 / range

      const toSvg = (x, y) => [cx + x * scale, cy - y * scale]

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      // Grid
      for (let i = -range; i <= range; i++) {
        const [lx] = toSvg(i, 0), [, ly] = toSvg(0, i)
        svg.append('line').attr('x1', lx).attr('y1', 0).attr('x2', lx).attr('y2', H).attr('stroke', C.grid).attr('stroke-width', 1)
        svg.append('line').attr('x1', 0).attr('y1', ly).attr('x2', W).attr('y2', ly).attr('stroke', C.grid).attr('stroke-width', 1)
      }

      svg.append('line').attr('x1', 0).attr('y1', cy).attr('x2', W * 0.88).attr('y2', cy).attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', cx).attr('y1', 0).attr('x2', cx).attr('y2', H).attr('stroke', C.axis).attr('stroke-width', 1.5)

      const drawLine = (m, b, color, label, lineRef) => {
        const x0 = -range - 1, x1 = range + 1
        const [sx0, sy0] = toSvg(x0, m * x0 + b)
        const [sx1, sy1] = toSvg(x1, m * x1 + b)
        svg.append('line').attr('x1', sx0).attr('y1', sy0).attr('x2', sx1).attr('y2', sy1)
          .attr('stroke', color).attr('stroke-width', 2)

        const handleX = 1.5, handleY = m * handleX + b
        const [hsx, hsy] = toSvg(handleX, handleY)
        svg.append('circle').attr('cx', hsx).attr('cy', hsy).attr('r', 8)
          .attr('fill', color).attr('stroke', C.bg).attr('stroke-width', 2).attr('cursor', 'grab')
          .call(d3.drag()
            .on('drag', (event) => {
              const mx = (event.x - cx) / scale
              const my = (cy - event.y) / scale
              lineRef.current.b = my - lineRef.current.m * mx
              draw()
            })
          )

        svg.append('text').attr('x', sx1 - 8).attr('y', sy1 - 8)
          .attr('text-anchor', 'end').attr('fill', color).attr('font-size', 12).attr('font-weight', 'bold')
          .text(label)
      }

      const { m: m1, b: b1 } = line1Ref.current
      const { m: m2, b: b2 } = line2Ref.current

      drawLine(m1, b1, C.l1, `y = ${m1}x + ${b1.toFixed(1)}`, line1Ref)
      drawLine(m2, b2, C.l2, `y = ${m2}x + ${b2.toFixed(1)}`, line2Ref)

      // Intersection
      if (Math.abs(m1 - m2) > 0.001) {
        const xi = (b2 - b1) / (m1 - m2)
        const yi = m1 * xi + b1
        if (Math.abs(xi) <= range + 0.5 && Math.abs(yi) <= range + 0.5) {
          const [sx, sy] = toSvg(xi, yi)
          svg.append('circle').attr('cx', sx).attr('cy', sy).attr('r', 7)
            .attr('fill', C.inter).attr('stroke', C.bg).attr('stroke-width', 2.5)
          svg.append('text').attr('x', sx + 10).attr('y', sy - 6)
            .attr('fill', C.inter).attr('font-size', 11).attr('font-weight', 'bold')
            .text(`(${xi.toFixed(2)}, ${yi.toFixed(2)})`)
        }
      } else {
        svg.append('text').attr('x', W / 2).attr('y', H - 16)
          .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 12)
          .text(Math.abs(b1 - b2) < 0.01 ? 'Same line — infinitely many solutions' : 'Parallel lines — no solution')
      }

      svg.append('text').attr('x', W * 0.9).attr('y', 20)
        .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 11)
        .text('Adjust slopes')
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [params.currentStep])

  const row = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13 }

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ padding: '8px 4px 0' }}>
        {[
          { label: 'Slope of L₁', col: '#38bdf8', ref: line1Ref },
          { label: 'Slope of L₂', col: '#a78bfa', ref: line2Ref },
        ].map(({ label, col, ref }, i) => (
          <div key={i} style={row}>
            <span style={{ color: col, minWidth: 90 }}>{label}</span>
            <input type="range" min={-4} max={4} step={0.5}
              defaultValue={ref.current.m}
              onChange={e => { ref.current.m = parseFloat(e.target.value); if (containerRef.current) containerRef.current.dispatchEvent(new Event('resize')) }}
              style={{ flex: 1, accentColor: col }} />
          </div>
        ))}
        <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>
          Drag the circles to shift a line up/down · adjust slopes with sliders
        </p>
      </div>
    </div>
  )
}
