import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

/**
 * LawOfSinesViz
 * Draggable triangle. Shows all three ratios a/sinA = b/sinB = c/sinC updating live.
 * Also shows the circumscribed circle and that the common ratio = 2R.
 * Dark mode. ResizeObserver.
 */
function LawOfSinesViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const vRef = useRef({ ax: 200, ay: 60, bx: 80, by: 240, cx: 380, cy: 240 })

  useEffect(() => {
    const draw = () => {
      if (!containerRef.current || !svgRef.current) return

      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg: isDark ? '#0f172a' : '#f8fafc', panel: isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '#334155' : '#e2e8f0', text: isDark ? '#e2e8f0' : '#1e293b',
        muted: isDark ? '#64748b' : '#94a3b8',
        cA: isDark ? '#f472b6' : '#db2777', cB: isDark ? '#34d399' : '#059669',
        cC: isDark ? '#38bdf8' : '#0284c7', circ: isDark ? '#334155' : '#e2e8f0',
        ratio: isDark ? '#fbbf24' : '#d97706',
      }

      const W = containerRef.current?.clientWidth || 540
      const H = Math.round(W * 0.62)
      const leftW = Math.round(W * 0.58)

      const v = vRef.current
      const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x))
      v.ax = clamp(v.ax, 20, leftW - 20); v.ay = clamp(v.ay, 20, H - 20)
      v.bx = clamp(v.bx, 20, leftW - 20); v.by = clamp(v.by, 20, H - 20)
      v.cx = clamp(v.cx, 20, leftW - 20); v.cy = clamp(v.cy, 20, H - 20)

      const dist = (p, q) => Math.sqrt((p[0]-q[0])**2 + (p[1]-q[1])**2)
      const ang = (p1, vtx, p2) => {
        const u = [p1[0]-vtx[0], p1[1]-vtx[1]], w = [p2[0]-vtx[0], p2[1]-vtx[1]]
        const d = Math.sqrt(u[0]**2+u[1]**2) * Math.sqrt(w[0]**2+w[1]**2)
        return d < 1e-9 ? 0 : Math.acos(Math.max(-1, Math.min(1, (u[0]*w[0]+u[1]*w[1]) / d)))
      }

      const A = [v.ax, v.ay], B = [v.bx, v.by], Cv = [v.cx, v.cy]
      const a = dist(B, Cv), b = dist(A, Cv), c = dist(A, B)
      const angA = ang(B, A, Cv), angB = ang(A, B, Cv), angC = ang(A, Cv, B)
      const rA = angA > 0.01 ? a / Math.sin(angA) : 0
      const rB = angB > 0.01 ? b / Math.sin(angB) : 0
      const rC = angC > 0.01 ? c / Math.sin(angC) : 0

      // Circumscribed circle
      const D2 = 2 * (A[0]*(B[1]-Cv[1]) + B[0]*(Cv[1]-A[1]) + Cv[0]*(A[1]-B[1]))
      let ocx = 0, ocy = 0, R = 0
      if (Math.abs(D2) > 1e-9) {
        ocx = ((A[0]**2+A[1]**2)*(B[1]-Cv[1]) + (B[0]**2+B[1]**2)*(Cv[1]-A[1]) + (Cv[0]**2+Cv[1]**2)*(A[1]-B[1])) / D2
        ocy = ((A[0]**2+A[1]**2)*(Cv[0]-B[0]) + (B[0]**2+B[1]**2)*(A[0]-Cv[0]) + (Cv[0]**2+Cv[1]**2)*(B[0]-A[0])) / D2
        R = dist([ocx, ocy], A)
      }

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      svg.append('rect').attr('x', 2).attr('y', 2).attr('width', leftW - 4).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      // Circumcircle
      if (R > 0 && R < W * 2) {
        svg.append('circle').attr('cx', ocx).attr('cy', ocy).attr('r', R).attr('fill', 'none').attr('stroke', C.circ).attr('stroke-width', 1).attr('stroke-dasharray', '4,4')
      }

      // Triangle
      svg.append('polygon').attr('points', `${A[0]},${A[1]} ${B[0]},${B[1]} ${Cv[0]},${Cv[1]}`).attr('fill', 'none').attr('stroke', C.cA).attr('stroke-width', 2)

      // Side labels
      const sideMid = (p, q, lbl, col) => {
        if (!Array.isArray(p) || !Array.isArray(q)) return
        if (!Number.isFinite(p[0]) || !Number.isFinite(p[1]) || !Number.isFinite(q[0]) || !Number.isFinite(q[1])) return
        const mx = (p[0]+q[0])/2, my = (p[1]+q[1])/2
        svg.append('text').attr('x', mx + 6).attr('y', my).attr('fill', col).attr('font-size', 12).attr('font-weight', 'bold').text(lbl)
      }
      sideMid(B, Cv, `a=${a.toFixed(1)}`, C.cA)
      sideMid(A, Cv, `b=${b.toFixed(1)}`, C.cB)
      sideMid(A, B, `c=${c.toFixed(1)}`, C.cC)

      // Vertices
      const draggablePoints = [
        { pt: A, lbl: 'A', col: C.cA, angle: angA, xKey: 'ax', yKey: 'ay' },
        { pt: B, lbl: 'B', col: C.cB, angle: angB, xKey: 'bx', yKey: 'by' },
        { pt: Cv, lbl: 'C', col: C.cC, angle: angC, xKey: 'cx', yKey: 'cy' },
      ]

      draggablePoints.forEach(({ pt, lbl, col, angle, xKey, yKey }) => {
        if (!Array.isArray(pt) || !Number.isFinite(pt[0]) || !Number.isFinite(pt[1])) return
        svg.append('circle').attr('cx', pt[0]).attr('cy', pt[1]).attr('r', 7).attr('fill', col).attr('stroke', C.bg).attr('stroke-width', 2).attr('cursor', 'grab')
          .call(d3.drag().on('drag', (event) => {
            if (!Number.isFinite(event.x) || !Number.isFinite(event.y)) return
            vRef.current[xKey] = event.x
            vRef.current[yKey] = event.y
            draw()
          }))
        const off = 16
        svg.append('text').attr('x', pt[0] + (pt[0] < leftW/2 ? -off : off)).attr('y', pt[1] + (pt[1] < H/2 ? -off : off)).attr('text-anchor', 'middle').attr('fill', col).attr('font-size', 11).attr('font-weight', 'bold').text(`${lbl}=${(angle*180/Math.PI).toFixed(1)}°`)
      })

      // Right panel — ratio display
      const rx = leftW + 8, rw = W - rx - 8
      svg.append('rect').attr('x', rx).attr('y', 2).attr('width', rw).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      const mid = rx + rw / 2
      svg.append('text').attr('x', mid).attr('y', 24).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 12).text('Law of Sines ratios')

      // Normalize R to same pixel units
      const rNorm = R

      svg.append('text').attr('x', mid).attr('y', 48).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text('(pixel units)')

      ;[rA, rB, rC].forEach((r, i) => {
        const y = 64 + i * 44
        svg.append('text').attr('x', rx + 12).attr('y', y).attr('fill', [C.cA, C.cB, C.cC][i]).attr('font-size', 12).attr('font-weight', 'bold').text(['a / sin A', 'b / sin B', 'c / sin C'][i])
        svg.append('text').attr('x', rx + rw - 12).attr('y', y + 16).attr('text-anchor', 'end').attr('fill', [C.cA, C.cB, C.cC][i]).attr('font-size', 14).attr('font-weight', 'bold').text(r.toFixed(2))
        svg.append('line').attr('x1', rx + 10).attr('y1', y + 28).attr('x2', rx + rw - 10).attr('y2', y + 28).attr('stroke', C.border).attr('stroke-width', 0.5)
      })

      svg.append('text').attr('x', mid).attr('y', 200).attr('text-anchor', 'middle').attr('fill', C.ratio).attr('font-size', 12).attr('font-weight', 'bold').text(`2R = ${(2*rNorm).toFixed(2)}`)
      svg.append('text').attr('x', mid).attr('y', 218).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text('circumscribed circle diameter')

      const allClose = Math.abs(rA - rB) < 1 && Math.abs(rB - rC) < 1
      svg.append('rect').attr('x', rx + 10).attr('y', H - 44).attr('width', rw - 20).attr('height', 34).attr('rx', 6).attr('fill', allClose ? (isDark ? '#1a3a2a' : '#dcfce7') : 'none').attr('stroke', allClose ? C.cB : 'none').attr('stroke-width', 1)
      svg.append('text').attr('x', mid).attr('y', H - 28).attr('text-anchor', 'middle').attr('fill', allClose ? C.cB : C.muted).attr('font-size', 11).attr('font-weight', 'bold').text(allClose ? 'All ratios equal ✓' : 'Ratios equalise when dragged')

      svg.append('text').attr('x', leftW / 2).attr('y', H - 6).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text('Drag any vertex — the ratios always stay equal')
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [params.currentStep])

  return <div ref={containerRef} className="w-full"><svg ref={svgRef} className="w-full" /></div>
}

export default LawOfSinesViz
