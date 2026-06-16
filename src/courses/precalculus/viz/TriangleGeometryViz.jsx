import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * TriangleGeometryViz
 * Three modes: 'similar' | 'thales' | 'triples'
 * Similar: draggable triangle showing angle sum = 180° always
 * Thales: step-synced proof that angle in semicircle = 90°
 * Triples: visual grid of Pythagorean triples
 * Dark mode. ResizeObserver.
 */
export default function TriangleGeometryViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [mode, setMode] = useState('similar')
  const vRef = useRef({ ax: 180, ay: 60, bx: 80, by: 220, cx: 310, cy: 220 })

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')

    const draw = () => {
      const C = {
        bg:      isDark ? '#0f172a' : '#f8fafc',
        panel:   isDark ? '#1e293b' : '#ffffff',
        border:  isDark ? '#334155' : '#e2e8f0',
        axis:    isDark ? '#475569' : '#94a3b8',
        text:    isDark ? '#e2e8f0' : '#1e293b',
        muted:   isDark ? '#64748b' : '#94a3b8',
        tri:     isDark ? '#38bdf8' : '#0284c7',
        triFill: isDark ? 'rgba(56,189,248,0.1)' : 'rgba(2,132,199,0.06)',
        ang:     [isDark ? '#f472b6' : '#db2777', isDark ? '#34d399' : '#059669', isDark ? '#fbbf24' : '#d97706'],
        dia:     isDark ? '#a78bfa' : '#7c3aed',
        right:   isDark ? '#34d399' : '#059669',
        triple:  isDark ? '#38bdf8' : '#0284c7',
      }

      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.62)
      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      if (mode === 'similar') drawSimilar(svg, W, H, C)
      else if (mode === 'thales') drawThales(svg, W, H, C, params.currentStep ?? 0)
      else drawTriples(svg, W, H, C)
    }

    const drawSimilar = (svg, W, H, C) => {
      const v = vRef.current
      // Constrain to canvas
      const clamp = (val, lo, hi) => Math.max(lo, Math.min(hi, val))
      v.ax = clamp(v.ax, 30, W - 30); v.ay = clamp(v.ay, 30, H - 30)
      v.bx = clamp(v.bx, 30, W - 30); v.by = clamp(v.by, 30, H - 30)
      v.cx = clamp(v.cx, 30, W - 30); v.cy = clamp(v.cy, 30, H - 30)

      const angle = (p1, vertex, p2) => {
        const v1 = [p1[0] - vertex[0], p1[1] - vertex[1]]
        const v2 = [p2[0] - vertex[0], p2[1] - vertex[1]]
        const dot = v1[0] * v2[0] + v1[1] * v2[1]
        const mag = Math.sqrt(v1[0]**2+v1[1]**2) * Math.sqrt(v2[0]**2+v2[1]**2)
        return mag < 1e-10 ? 0 : Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180 / Math.PI
      }

      const A = angle([v.bx, v.by], [v.ax, v.ay], [v.cx, v.cy])
      const B = angle([v.ax, v.ay], [v.bx, v.by], [v.cx, v.cy])
      const CC = angle([v.ax, v.ay], [v.cx, v.cy], [v.bx, v.by])
      const sum = A + B + CC

      // Triangle fill
      svg.append('polygon').attr('points', `${v.ax},${v.ay} ${v.bx},${v.by} ${v.cx},${v.cy}`).attr('fill', C.triFill)
      svg.append('polygon').attr('points', `${v.ax},${v.ay} ${v.bx},${v.by} ${v.cx},${v.cy}`).attr('fill', 'none').attr('stroke', C.tri).attr('stroke-width', 2)

      // Vertices
      ;[[v.ax,v.ay,'A',B,A,CC], [v.bx,v.by,'B',A,B,CC], [v.cx,v.cy,'C',A,B,CC]].forEach(([x,y,lbl], i) => {
        svg.append('circle').attr('cx', x).attr('cy', y).attr('r', 7).attr('fill', C.ang[i]).attr('stroke', C.bg).attr('stroke-width', 2).attr('cursor', 'grab')
          .call(d3.drag().on('drag', (event) => {
            if (i === 0) { v.ax = event.x; v.ay = event.y }
            else if (i === 1) { v.bx = event.x; v.by = event.y }
            else { v.cx = event.x; v.cy = event.y }
            draw()
          }))
        const off = 14
        const angle_vals = [A, B, CC]
        svg.append('text').attr('x', x + (x < W/2 ? -off : off)).attr('y', y + (y < H/2 ? -off : off)).attr('text-anchor', 'middle').attr('fill', C.ang[i]).attr('font-size', 12).attr('font-weight', 'bold').text(`${lbl} = ${angle_vals[i].toFixed(1)}°`)
      })

      // Sum display
      const sumColor = Math.abs(sum - 180) < 0.5 ? C.right : '#ef4444'
      svg.append('text').attr('x', W / 2).attr('y', H - 16).attr('text-anchor', 'middle').attr('fill', sumColor).attr('font-size', 14).attr('font-weight', 'bold').text(`A + B + C = ${sum.toFixed(1)}° — always 180°`)
      svg.append('text').attr('x', W / 2).attr('y', H - 4).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text('Drag any vertex to reshape the triangle')
    }

    const drawThales = (svg, W, H, C, step) => {
      const cx = W / 2, cy = H / 2
      const R = Math.min(W * 0.3, H * 0.36)
      const theta = Math.PI / 3.5

      svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', R).attr('fill', 'none').attr('stroke', C.axis).attr('stroke-width', 1.5)

      const Ax = cx - R, Ay = cy
      const Bx = cx + R, By = cy
      const Px = cx + R * Math.cos(theta), Py = cy - R * Math.sin(theta)
      const Ox = cx, Oy = cy

      // Diameter
      svg.append('line').attr('x1', Ax).attr('y1', Ay).attr('x2', Bx).attr('y2', By).attr('stroke', C.dia).attr('stroke-width', 2)

      if (step >= 1) {
        svg.append('line').attr('x1', Ox).attr('y1', Oy).attr('x2', Px).attr('y2', Py).attr('stroke', C.muted).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
      }

      if (step >= 2) {
        svg.append('line').attr('x1', Ax).attr('y1', Ay).attr('x2', Px).attr('y2', Py).attr('stroke', C.ang[0]).attr('stroke-width', 2)
        svg.append('line').attr('x1', Bx).attr('y1', By).attr('x2', Px).attr('y2', Py).attr('stroke', C.ang[1]).attr('stroke-width', 2)
      }

      if (step >= 4) {
        // Right angle marker at P
        const sq = 9
        const ux = (Ax - Px), uy = (Ay - Py)
        const len1 = Math.sqrt(ux*ux+uy*uy)
        const vx = (Bx - Px), vy = (By - Py)
        const len2 = Math.sqrt(vx*vx+vy*vy)
        const mx = Px + (ux/len1 + vx/len2) * sq * 0.7
        const my = Py + (uy/len1 + vy/len2) * sq * 0.7
        svg.append('rect').attr('x', mx - sq/2).attr('y', my - sq/2).attr('width', sq).attr('height', sq).attr('fill', 'none').attr('stroke', C.right).attr('stroke-width', 2).attr('transform', `rotate(${Math.atan2(uy,ux)*180/Math.PI}, ${mx}, ${my})`)
        svg.append('text').attr('x', Px + 12).attr('y', Py - 8).attr('fill', C.right).attr('font-size', 12).attr('font-weight', 'bold').text('90°')
      }

      ;[[Ax, Ay, 'A'], [Bx, By, 'B'], [Px, Py, 'P']].forEach(([x, y, lbl], i) => {
        svg.append('circle').attr('cx', x).attr('cy', y).attr('r', 5).attr('fill', i === 2 ? C.ang[2] : C.dia).attr('stroke', C.bg).attr('stroke-width', 2)
        svg.append('text').attr('x', x + (x < cx ? -12 : 10)).attr('y', y + (y < cy ? -8 : 14)).attr('fill', i === 2 ? C.ang[2] : C.dia).attr('font-size', 12).attr('font-weight', 'bold').text(lbl)
      })
      svg.append('circle').attr('cx', Ox).attr('cy', Oy).attr('r', 4).attr('fill', C.muted)
      svg.append('text').attr('x', Ox + 6).attr('y', Oy + 14).attr('fill', C.muted).attr('font-size', 11).text('O')

      const steps = ['Place diameter AB and point P on circle', 'Draw radius OC to P — creates two isosceles triangles', 'Label base angles α (△OAP) and β (△OBP)', 'Angle at P = α + β', '∠APB = α + β = 90° ∎']
      svg.append('text').attr('x', W/2).attr('y', H - 14).attr('text-anchor', 'middle').attr('fill', step >= 4 ? C.right : C.muted).attr('font-size', 12).attr('font-weight', step >= 4 ? 'bold' : 'normal').text(steps[Math.min(step, 4)])
    }

    const drawTriples = (svg, W, H, C) => {
      const triples = [
        [3,4,5],[5,12,13],[8,15,17],[7,24,25],[20,21,29],
        [9,40,41],[12,35,37],[11,60,61],[6,8,10],[9,12,15],
        [10,24,26],[15,20,25],[8,6,10],
      ].filter(([a,b,c]) => a*a+b*b===c*c)

      const maxC = Math.max(...triples.map(([,,c]) => c))
      const scale = Math.min((W-80) / maxC, (H-60) / maxC) * 0.85
      const ox = 40, oy = H - 30

      // Axes
      svg.append('line').attr('x1', ox).attr('y1', oy).attr('x2', ox + maxC * scale + 20).attr('y2', oy).attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', ox).attr('y1', oy).attr('x2', ox).attr('y2', oy - maxC * scale - 20).attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('text').attr('x', ox + maxC * scale / 2).attr('y', oy + 18).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 11).text('a (horizontal leg)')
      svg.append('text').attr('x', ox - 14).attr('y', oy - maxC * scale / 2).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 11).text('b')

      const seen = new Set()
      triples.forEach(([a, b, c]) => {
        const key = `${Math.min(a,b)}-${Math.max(a,b)}-${c}`
        if (seen.has(key)) return
        seen.add(key)
        const x1 = ox, y1 = oy
        const x2 = ox + a * scale, y2 = oy
        const x3 = ox + a * scale, y3 = oy - b * scale

        const isPrimitive = (p, q, r) => { const g = (x,y) => y===0?x:g(y,x%y); return g(g(p,q),r) === 1 }
        const prim = isPrimitive(a, b, c)

        svg.append('polygon').attr('points', `${x1},${y1} ${x2},${y2} ${x3},${y3}`).attr('fill', prim ? (isDark?'rgba(56,189,248,0.18)':'rgba(2,132,199,0.1)') : (isDark?'rgba(167,139,250,0.12)':'rgba(124,58,237,0.08)')).attr('stroke', prim ? C.triple : C.dia).attr('stroke-width', prim ? 1.5 : 1).attr('stroke-dasharray', prim ? 'none' : '4,3')

        if (prim && b * scale > 20 && a * scale > 20) {
          svg.append('text').attr('x', (x1+x2+x3)/3).attr('y', (y1+y2+y3)/3).attr('text-anchor', 'middle').attr('dominant-baseline', 'central').attr('fill', prim ? C.triple : C.dia).attr('font-size', 9).text(`${a}-${b}-${c}`)
        }
      })

      svg.append('text').attr('x', W - 10).attr('y', 18).attr('text-anchor', 'end').attr('fill', C.triple).attr('font-size', 11).text('━ primitive triple')
      svg.append('text').attr('x', W - 10).attr('y', 32).attr('text-anchor', 'end').attr('fill', C.dia).attr('font-size', 11).text('╌ multiple triple')
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [mode, params.currentStep])

  const btnBase = { padding: '5px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: '0.5px solid var(--color-border-secondary)', fontWeight: 500 }
  const active = { ...btnBase, background: 'var(--color-background-info)', color: 'var(--color-text-info)', border: '0.5px solid var(--color-border-info)' }
  const inactive = { ...btnBase, background: 'transparent', color: 'var(--color-text-secondary)' }

  return (
    <div ref={containerRef} className="w-full">
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {[['similar', 'Similar triangles'], ['thales', "Thales' proof"], ['triples', 'Pythagorean triples']].map(([m, lbl]) => (
          <button key={m} style={m === mode ? active : inactive} onClick={() => setMode(m)}>{lbl}</button>
        ))}
      </div>
      <svg ref={svgRef} className="w-full" />
    </div>
  )
}
