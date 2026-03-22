import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * LawOfSinesViz
 * Draggable triangle. Shows all three ratios a/sinA = b/sinB = c/sinC updating live.
 * Also shows the circumscribed circle and that the common ratio = 2R.
 * Dark mode. ResizeObserver.
 */
export function LawOfSinesViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const vRef = useRef({ ax: 200, ay: 60, bx: 80, by: 240, cx: 380, cy: 240 })

  useEffect(() => {
    const draw = () => {
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
        const mx = (p[0]+q[0])/2, my = (p[1]+q[1])/2
        svg.append('text').attr('x', mx + 6).attr('y', my).attr('fill', col).attr('font-size', 12).attr('font-weight', 'bold').text(lbl)
      }
      sideMid(B, Cv, `a=${a.toFixed(1)}`, C.cA)
      sideMid(A, Cv, `b=${b.toFixed(1)}`, C.cB)
      sideMid(A, B, `c=${c.toFixed(1)}`, C.cC)

      // Vertices
      [[A, 'A', C.cA, angA], [B, 'B', C.cB, angB], [Cv, 'C', C.cC, angC]].forEach(([pt, lbl, col, angle], i) => {
        svg.append('circle').attr('cx', pt[0]).attr('cy', pt[1]).attr('r', 7).attr('fill', col).attr('stroke', C.bg).attr('stroke-width', 2).attr('cursor', 'grab')
          .call(d3.drag().on('drag', (event) => {
            const k = ['ax','ay','bx','by','cx','cy'][i*2]
            vRef.current[k] = event.x; vRef.current[k.replace('x','y')] = event.y
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

      const rows = [
        { label: 'a / sin A', val: rA, col: C.cA },
        { label: 'b / sin B', val: rB, col: C.cB },
        { label: 'c / sin C', val: rC, col: C.cC },
        { label: '2R', val: 2 * R / (W * 0.001), col: C.ratio },
      ]
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

/**
 * SSAAmbiguousViz
 * Shows the ambiguous SSA case interactively.
 * Fixed angle A and side b. Drag side a to see 0, 1, or 2 triangles.
 */
export function SSAAmbiguousViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [aLen, setALen] = useState(70)

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg: isDark ? '#0f172a' : '#f8fafc', panel: isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '#334155' : '#e2e8f0', text: isDark ? '#e2e8f0' : '#1e293b',
        muted: isDark ? '#64748b' : '#94a3b8', axis: isDark ? '#475569' : '#94a3b8',
        t1: isDark ? '#38bdf8' : '#0284c7', t2: isDark ? '#f472b6' : '#db2777',
        h: isDark ? '#34d399' : '#059669', a: isDark ? '#fbbf24' : '#d97706',
        b: isDark ? '#a78bfa' : '#7c3aed',
      }

      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.55)
      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      const angleA = 35 * Math.PI / 180
      const bLen = 100
      const h = bLen * Math.sin(angleA)
      const scale = (W * 0.72) / 150
      const ox = W * 0.1, oy = H * 0.78

      const Bx = ox, By = oy
      const adjB = bLen * Math.cos(angleA)
      const Ax = ox + adjB * scale, Ay = oy - bLen * Math.sin(angleA) * scale

      // Base ray
      svg.append('line').attr('x1', ox).attr('y1', oy).attr('x2', ox + 150 * scale).attr('y2', oy).attr('stroke', C.axis).attr('stroke-width', 1)

      // Side b from B to A
      svg.append('line').attr('x1', Bx).attr('y1', By).attr('x2', Ax).attr('y2', Ay).attr('stroke', C.b).attr('stroke-width', 2)
      svg.append('text').attr('x', (Bx+Ax)/2 - 8).attr('y', (By+Ay)/2).attr('fill', C.b).attr('font-size', 11).attr('font-weight', 'bold').text(`b=${bLen}`)

      // Angle A at B
      svg.append('text').attr('x', Bx + 22).attr('y', By - 8).attr('fill', C.muted).attr('font-size', 11).text(`A=35°`)

      // Height h from A perpendicular to base
      svg.append('line').attr('x1', Ax).attr('y1', Ay).attr('x2', Ax).attr('y2', oy).attr('stroke', C.h).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
      svg.append('text').attr('x', Ax + 5).attr('y', (Ay + oy) / 2).attr('fill', C.h).attr('font-size', 11).attr('font-weight', 'bold').text(`h=${h.toFixed(1)}`)

      // Circle of radius a centered at A
      const aScaled = aLen * scale
      svg.append('circle').attr('cx', Ax).attr('cy', Ay).attr('r', aScaled).attr('fill', 'none').attr('stroke', C.a).attr('stroke-width', 1).attr('stroke-dasharray', '5,3').attr('opacity', 0.6)
      svg.append('text').attr('x', Ax + aScaled * 0.7 + 5).attr('y', Ay).attr('fill', C.a).attr('font-size', 11).attr('font-weight', 'bold').text(`a=${aLen}`)

      // Find intersections with base line (y = oy)
      const dy = oy - Ay
      const disc = aScaled * aScaled - dy * dy
      const intersections = []
      if (disc >= 0) {
        const dx = Math.sqrt(disc)
        intersections.push(Ax + dx)
        if (dx > 1) intersections.push(Ax - dx)
      }

      const validIntersections = intersections.filter(ix => ix > ox + 5)
      const tris = validIntersections.length

      // Draw triangles
      const triCols = [C.t1, C.t2]
      validIntersections.forEach((Cx, i) => {
        svg.append('polygon').attr('points', `${Bx},${By} ${Ax},${Ay} ${Cx},${oy}`).attr('fill', 'none').attr('stroke', triCols[i]).attr('stroke-width', 2)
        svg.append('circle').attr('cx', Cx).attr('cy', oy).attr('r', 5).attr('fill', triCols[i]).attr('stroke', C.bg).attr('stroke-width', 2)
        svg.append('text').attr('x', Cx).attr('y', oy + 14).attr('text-anchor', 'middle').attr('fill', triCols[i]).attr('font-size', 10).text(`C${tris > 1 ? i+1 : ''}`)
      })

      // Status
      const statusText = tris === 0 ? 'a < h — no triangle exists (side too short)' : tris === 1 ? aLen === Math.round(h) ? 'a = h — exactly one right triangle' : 'one triangle' : 'two triangles (ambiguous case!)'
      const statusCol = tris === 0 ? '#ef4444' : tris === 2 ? C.a : C.h
      svg.append('rect').attr('x', W * 0.05).attr('y', 10).attr('width', W * 0.9).attr('height', 28).attr('rx', 6).attr('fill', tris === 2 ? (isDark?'#3d2a0a':'#fef9c3') : tris === 0 ? (isDark?'#3d1a1a':'#fef2f2') : (isDark?'#1a3a2a':'#dcfce7')).attr('stroke', statusCol).attr('stroke-width', 1)
      svg.append('text').attr('x', W / 2).attr('y', 28).attr('text-anchor', 'middle').attr('fill', statusCol).attr('font-size', 12).attr('font-weight', 'bold').text(statusText)

      svg.append('text').attr('x', W / 2).attr('y', H - 4).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(`h = b·sin A = ${bLen}·sin 35° ≈ ${h.toFixed(1)} — the critical threshold`)
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [aLen, params.currentStep])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px 0' }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fbbf24', minWidth: 56 }}>a = {aLen}</span>
        <input type="range" min={20} max={140} step={1} value={aLen} onChange={e => setALen(parseInt(e.target.value))} style={{ flex: 1, accentColor: '#fbbf24' }} />
        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>drag to change</span>
      </div>
    </div>
  )
}

export default LawOfSinesViz
