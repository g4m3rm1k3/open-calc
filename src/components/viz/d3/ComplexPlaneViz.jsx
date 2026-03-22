import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * ComplexPlaneViz
 * Place two complex numbers z1, z2 on the plane.
 * Shows their product z1*z2 with magnitude multiplied and angle added.
 * Drag handles. Dark mode. ResizeObserver.
 */
export default function ComplexPlaneViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const z1Ref = useRef({ r: 1.5, theta: Math.PI / 4 })
  const z2Ref = useRef({ r: 1.2, theta: Math.PI / 3 })

  const polarToRect = ({ r, theta }) => ({ x: r * Math.cos(theta), y: r * Math.sin(theta) })

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
        z1:      isDark ? '#38bdf8' : '#0284c7',
        z2:      isDark ? '#a78bfa' : '#7c3aed',
        zp:      isDark ? '#34d399' : '#059669',
        unit:    isDark ? '#334155' : '#e2e8f0',
        arc:     isDark ? '#475569' : '#cbd5e1',
      }

      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.75)
      const cx = W * 0.44
      const cy = H / 2
      const range = 3.2
      const scale = Math.min(cx, cy) * 0.82 / range

      const toSvg = (x, y) => [cx + x * scale, cy - y * scale]
      const toMath = (sx, sy) => [(sx - cx) / scale, (cy - sy) / scale]

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      // Grid
      for (let i = -3; i <= 3; i++) {
        const [lx] = toSvg(i, 0)
        svg.append('line').attr('x1', lx).attr('y1', 0).attr('x2', lx).attr('y2', H)
          .attr('stroke', C.grid).attr('stroke-width', 1)
        const [, ly] = toSvg(0, i)
        svg.append('line').attr('x1', 0).attr('y1', ly).attr('x2', cx * 2).attr('y2', ly)
          .attr('stroke', C.grid).attr('stroke-width', 1)
      }

      // Axes
      svg.append('line').attr('x1', 0).attr('y1', cy).attr('x2', cx * 1.9).attr('y2', cy)
        .attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', cx).attr('y1', 0).attr('x2', cx).attr('y2', H)
        .attr('stroke', C.axis).attr('stroke-width', 1.5)

      // Unit circle
      svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', scale)
        .attr('fill', 'none').attr('stroke', C.unit).attr('stroke-width', 1).attr('stroke-dasharray', '4,4')

      // Axis labels
      svg.append('text').attr('x', cx * 1.88).attr('y', cy - 6)
        .attr('fill', C.muted).attr('font-size', 12).attr('text-anchor', 'middle').text('Re')
      svg.append('text').attr('x', cx + 6).attr('y', 16)
        .attr('fill', C.muted).attr('font-size', 12).text('Im')
      svg.append('text').attr('x', cx + 4).attr('y', cy - 4)
        .attr('fill', C.muted).attr('font-size', 10).text('0')

      for (let i = -2; i <= 2; i++) {
        if (i === 0) continue
        const [lx] = toSvg(i, 0)
        svg.append('text').attr('x', lx).attr('y', cy + 14)
          .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(i)
      }

      const { x: x1, y: y1 } = polarToRect(z1Ref.current)
      const { x: x2, y: y2 } = polarToRect(z2Ref.current)
      const xp = x1 * x2 - y1 * y2
      const yp = x1 * y2 + y1 * x2

      // Defs for arrow markers
      const defs = svg.append('defs')
      ;[{ id: C.z1, col: C.z1 }, { id: C.z2, col: C.z2 }, { id: C.zp, col: C.zp }].forEach(({ id, col }) => {
        defs.append('marker')
          .attr('id', `arr-${col.replace('#', '')}`)
          .attr('viewBox', '0 0 10 10').attr('refX', 8).attr('refY', 5)
          .attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto')
          .append('path').attr('d', 'M2 1L8 5L2 9').attr('fill', 'none')
          .attr('stroke', col).attr('stroke-width', 1.5).attr('stroke-linecap', 'round')
      })

      // Angle arcs
      const arcGen = d3.arc()
      const drawArc = (theta, r, color) => {
        svg.append('path')
          .attr('d', arcGen({ innerRadius: r, outerRadius: r, startAngle: 0, endAngle: -theta }))
          .attr('transform', `translate(${cx},${cy})`)
          .attr('fill', 'none').attr('stroke', color).attr('stroke-width', 1.5).attr('opacity', 0.6)
      }
      drawArc(z1Ref.current.theta, scale * 0.28, C.z1)
      drawArc(z2Ref.current.theta, scale * 0.18, C.z2)
      drawArc(z1Ref.current.theta + z2Ref.current.theta, scale * 0.38, C.zp)

      const drawVector = (x, y, color, label, draggable, zRef) => {
        const [sx, sy] = toSvg(x, y)
        svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', sx).attr('y2', sy)
          .attr('stroke', color).attr('stroke-width', 2)
          .attr('marker-end', `url(#arr-${color.replace('#', '')})`)

        const handle = svg.append('circle').attr('cx', sx).attr('cy', sy).attr('r', 7)
          .attr('fill', color).attr('stroke', C.bg).attr('stroke-width', 2)
          .attr('opacity', 0.9)

        if (draggable && zRef) {
          handle.attr('cursor', 'grab')
            .call(d3.drag()
              .on('drag', (event) => {
                const [mx, my] = toMath(event.x, event.y)
                const r = Math.sqrt(mx * mx + my * my)
                const theta = Math.atan2(my, mx)
                zRef.current = { r: Math.max(0.1, Math.min(3, r)), theta }
                draw()
              })
            )
        }

        svg.append('text').attr('x', sx + 8).attr('y', sy - 6)
          .attr('fill', color).attr('font-size', 11).attr('font-weight', 'bold').text(label)
      }

      drawVector(x1, y1, C.z1, `z₁`, true, z1Ref)
      drawVector(x2, y2, C.z2, `z₂`, true, z2Ref)
      drawVector(xp, yp, C.zp, `z₁z₂`, false, null)

      // Right panel — values
      const rx = cx * 1.92 + 8
      const rw = W - rx - 8
      if (rw > 60) {
        svg.append('rect').attr('x', rx).attr('y', 8).attr('width', rw).attr('height', H - 16)
          .attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

        const mid = rx + rw / 2
        const fs = Math.min(rw * 0.09, 11)

        const fmt = n => n.toFixed(2)
        const rows = [
          { label: 'z₁', col: C.z1, r: fmt(z1Ref.current.r), θ: fmt(z1Ref.current.theta * 180 / Math.PI) + '°' },
          { label: 'z₂', col: C.z2, r: fmt(z2Ref.current.r), θ: fmt(z2Ref.current.theta * 180 / Math.PI) + '°' },
          { label: 'z₁z₂', col: C.zp, r: fmt(Math.sqrt(xp*xp+yp*yp)), θ: fmt((z1Ref.current.theta+z2Ref.current.theta)*180/Math.PI) + '°' },
        ]

        svg.append('text').attr('x', mid).attr('y', 30).attr('text-anchor', 'middle')
          .attr('fill', C.muted).attr('font-size', fs).text('magnitude × → sum of angles')

        rows.forEach(({ label, col, r: mag, θ }, i) => {
          const y = 54 + i * 52
          svg.append('text').attr('x', mid).attr('y', y)
            .attr('text-anchor', 'middle').attr('fill', col).attr('font-size', fs * 1.1).attr('font-weight', 'bold')
            .text(label)
          svg.append('text').attr('x', mid).attr('y', y + fs * 1.3)
            .attr('text-anchor', 'middle').attr('fill', C.text).attr('font-size', fs)
            .text(`|z| = ${mag}`)
          svg.append('text').attr('x', mid).attr('y', y + fs * 2.6)
            .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', fs)
            .text(`∠ = ${θ}`)
        })

        svg.append('text').attr('x', mid).attr('y', H - 24)
          .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10)
          .text('Drag z₁ and z₂')
      }
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [params.currentStep])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '6px 0 0', textAlign: 'center' }}>
        Drag the blue (z₁) and purple (z₂) points — the green product updates live
      </p>
    </div>
  )
}
