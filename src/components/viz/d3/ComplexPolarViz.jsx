import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * ComplexPolarViz — Pillars 1, 4, 5 for complex polar and De Moivre
 *
 * Three modes:
 *   'multiply' — drag z1 and z2, see product (Pillar 1: rotation + scaling)
 *   'power'    — drag a complex number, raise to integer power n (Pillar 4 analogy)
 *   'roots'    — choose n, see nth roots of 1 as a regular polygon (Pillar 5)
 *
 * Dark mode. ResizeObserver.
 */
export default function ComplexPolarViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [mode, setMode] = useState('multiply')
  const [z1, setZ1] = useState({ r: 1.5, theta: Math.PI / 4 })
  const [z2, setZ2] = useState({ r: 1.2, theta: Math.PI / 3 })
  const [n, setN] = useState(3)

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:    isDark ? '#0f172a' : '#f8fafc',
        panel: isDark ? '#1e293b' : '#ffffff',
        border:isDark ? '#334155' : '#e2e8f0',
        axis:  isDark ? '#475569' : '#94a3b8',
        grid:  isDark ? '#1e293b' : '#f1f5f9',
        text:  isDark ? '#e2e8f0' : '#1e293b',
        muted: isDark ? '#64748b' : '#94a3b8',
        z1:    isDark ? '#38bdf8' : '#0284c7',
        z2:    isDark ? '#f472b6' : '#db2777',
        prod:  isDark ? '#34d399' : '#059669',
        unit:  isDark ? '#334155' : '#e2e8f0',
        root:  isDark ? '#fbbf24' : '#d97706',
        arc1:  isDark ? 'rgba(56,189,248,0.3)' : 'rgba(2,132,199,0.15)',
        arc2:  isDark ? 'rgba(244,114,182,0.3)' : 'rgba(219,39,119,0.15)',
        arcP:  isDark ? 'rgba(52,211,153,0.3)' : 'rgba(5,150,105,0.15)',
      }

      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.78)
      const cx = W * 0.5, cy = H * 0.5
      const scale = Math.min(W, H) * 0.1

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      svg.append('rect').attr('x',1).attr('y',1).attr('width',W-2).attr('height',H-2).attr('rx',8).attr('fill',C.panel).attr('stroke',C.border).attr('stroke-width',1)

      // Unit circle + grid circles
      ;[1,2,3].forEach(r => {
        svg.append('circle').attr('cx',cx).attr('cy',cy).attr('r',r*scale).attr('fill','none').attr('stroke',C.grid).attr('stroke-width', r===1?1.5:1)
      })
      svg.append('line').attr('x1',cx-3.5*scale).attr('y1',cy).attr('x2',cx+3.5*scale).attr('y2',cy).attr('stroke',C.axis).attr('stroke-width',1.5)
      svg.append('line').attr('x1',cx).attr('y1',cy-3.5*scale).attr('x2',cx).attr('y2',cy+3.5*scale).attr('stroke',C.axis).attr('stroke-width',1.5)
      ;['Re','Im'].forEach((lbl,i) => {
        const [x,y] = i===0 ? [cx+3.3*scale, cy+14] : [cx+8, cy-3.3*scale]
        svg.append('text').attr('x',x).attr('y',y).attr('fill',C.muted).attr('font-size',11).text(lbl)
      })

      const toXY = (r, theta) => ({ x: cx + r*scale*Math.cos(theta), y: cy - r*scale*Math.sin(theta) })

      const drawVector = (r, theta, col, label, fill, dashed) => {
        const {x,y} = toXY(r,theta)
        if (fill) {
          const arc = d3.arc()({ innerRadius:0, outerRadius:r*scale, startAngle:-theta, endAngle:0 })
          svg.append('path').attr('d',arc).attr('transform',`translate(${cx},${cy})`).attr('fill',fill)
        }
        svg.append('line').attr('x1',cx).attr('y1',cy).attr('x2',x).attr('y2',y).attr('stroke',col).attr('stroke-width',2.5).attr('stroke-dasharray', dashed?'5,3':'none')
        svg.append('circle').attr('cx',x).attr('cy',y).attr('r',6).attr('fill',col).attr('stroke',C.bg).attr('stroke-width',2)
        if (label) {
          svg.append('text').attr('x',x+8).attr('y',y-8).attr('fill',col).attr('font-size',12).attr('font-weight','bold').text(label)
        }
        return {x,y}
      }

      if (mode === 'multiply') {
        const prodR = z1.r * z2.r
        const prodTheta = z1.theta + z2.theta

        drawVector(z1.r, z1.theta, C.z1, `z₁`, C.arc1, false)
        drawVector(z2.r, z2.theta, C.z2, `z₂`, C.arc2, false)
        drawVector(prodR, prodTheta, C.prod, `z₁z₂`, C.arcP, true)

        // Make z1 and z2 draggable
        const p1 = toXY(z1.r, z1.theta)
        const p2 = toXY(z2.r, z2.theta)
        ;[{p:p1,col:C.z1,fn:(r,t)=>setZ1({r,theta:t})},{p:p2,col:C.z2,fn:(r,t)=>setZ2({r,theta:t})}].forEach(({p,col,fn}) => {
          svg.append('circle').attr('cx',p.x).attr('cy',p.y).attr('r',7).attr('fill',col).attr('stroke',C.bg).attr('stroke-width',2).attr('cursor','grab')
            .call(d3.drag().on('drag',(event) => {
              const dx = event.x - cx, dy = -(event.y - cy)
              fn(Math.max(0.2, Math.min(3, Math.sqrt(dx*dx+dy*dy)/scale)), Math.atan2(dy,dx))
            }))
        })

        // Angle arcs
        const drawArc = (r, theta, col) => {
          const arc = d3.arc()({ innerRadius: r*scale*0.25, outerRadius: r*scale*0.25, startAngle:-theta, endAngle:0 })
          svg.append('path').attr('d',arc).attr('transform',`translate(${cx},${cy})`).attr('fill','none').attr('stroke',col).attr('stroke-width',2)
        }
        drawArc(z1.r, z1.theta, C.z1)
        drawArc(z2.r, z2.theta, C.z2)
        drawArc(prodR, prodTheta, C.prod)

        // Info panel
        const infoY = H - 100
        svg.append('rect').attr('x',12).attr('y',infoY).attr('width',W-24).attr('height',88).attr('rx',8)
          .attr('fill',isDark?'#0c1825':'#f0f7ff').attr('stroke',C.border).attr('stroke-width',1)

        const toDeg = r => (r * 180 / Math.PI + 360) % 360
        const rows = [
          [C.z1, `z₁ = ${z1.r.toFixed(2)} ∠ ${toDeg(z1.theta).toFixed(1)}°`,    `Cartesian: (${(z1.r*Math.cos(z1.theta)).toFixed(2)}, ${(z1.r*Math.sin(z1.theta)).toFixed(2)})`],
          [C.z2, `z₂ = ${z2.r.toFixed(2)} ∠ ${toDeg(z2.theta).toFixed(1)}°`,    `Cartesian: (${(z2.r*Math.cos(z2.theta)).toFixed(2)}, ${(z2.r*Math.sin(z2.theta)).toFixed(2)})`],
          [C.prod, `z₁z₂ = ${prodR.toFixed(2)} ∠ ${toDeg(prodTheta).toFixed(1)}°`, `moduli: ${z1.r.toFixed(2)}×${z2.r.toFixed(2)}=${prodR.toFixed(2)}  angles: ${toDeg(z1.theta).toFixed(0)}°+${toDeg(z2.theta).toFixed(0)}°=${toDeg(prodTheta).toFixed(0)}°`],
        ]
        rows.forEach(([col, main, sub], i) => {
          svg.append('text').attr('x',24).attr('y',infoY+20+i*26).attr('fill',col).attr('font-size',12).attr('font-weight','bold').text(main)
          svg.append('text').attr('x', W*0.5).attr('y',infoY+20+i*26).attr('fill',C.muted).attr('font-size',11).text(sub)
        })

      } else if (mode === 'power') {
        // Show z and z^n
        const {x:bx,y:by} = toXY(z1.r, z1.theta)
        svg.append('line').attr('x1',cx).attr('y1',cy).attr('x2',bx).attr('y2',by).attr('stroke',C.z1).attr('stroke-width',2.5)
        svg.append('circle').attr('cx',bx).attr('cy',by).attr('r',7).attr('fill',C.z1).attr('stroke',C.bg).attr('stroke-width',2).attr('cursor','grab')
          .call(d3.drag().on('drag',(event) => {
            const dx = event.x-cx, dy = -(event.y-cy)
            setZ1({ r: Math.max(0.2, Math.min(2.5, Math.sqrt(dx*dx+dy*dy)/scale)), theta: Math.atan2(dy,dx) })
          }))
        svg.append('text').attr('x',bx+8).attr('y',by-8).attr('fill',C.z1).attr('font-size',12).attr('font-weight','bold').text('z')

        const powerR = Math.pow(z1.r, n), powerTheta = z1.theta * n
        const {x:px2,y:py2} = toXY(powerR % 4 > 0.1 ? Math.min(powerR, 3.5) : powerR, powerTheta)
        svg.append('line').attr('x1',cx).attr('y1',cy).attr('x2',px2).attr('y2',py2).attr('stroke',C.prod).attr('stroke-width',2.5).attr('stroke-dasharray','6,3')
        svg.append('circle').attr('cx',px2).attr('cy',py2).attr('r',7).attr('fill',C.prod).attr('stroke',C.bg).attr('stroke-width',2)
        svg.append('text').attr('x',px2+8).attr('y',py2-8).attr('fill',C.prod).attr('font-size',12).attr('font-weight','bold').text(`z^${n}`)

        const toDeg = r => (r * 180 / Math.PI + 360) % 360
        svg.append('text').attr('x',W/2).attr('y',H-20).attr('text-anchor','middle').attr('fill',C.muted).attr('font-size',11)
          .text(`|z^${n}| = ${z1.r.toFixed(2)}^${n} = ${powerR.toFixed(3)}   arg(z^${n}) = ${n}×${toDeg(z1.theta).toFixed(0)}° = ${toDeg(powerTheta).toFixed(0)}°`)
        svg.append('text').attr('x',W/2).attr('y',H-4).attr('text-anchor','middle').attr('fill',C.prod).attr('font-size',11).attr('font-weight','bold')
          .text(`De Moivre: r^n = ${powerR.toFixed(3)}, θ×n = ${toDeg(powerTheta).toFixed(1)}°`)

      } else {
        // Roots mode — nth roots of 1
        const rootR = 1
        const pts = []
        for (let k = 0; k < n; k++) {
          const theta = (2 * Math.PI * k) / n
          const {x,y} = toXY(rootR, theta)
          pts.push({x,y,theta,k})
          svg.append('line').attr('x1',cx).attr('y1',cy).attr('x2',x).attr('y2',y).attr('stroke',C.root).attr('stroke-width',1.5).attr('stroke-dasharray','4,3').attr('opacity',0.7)
          svg.append('circle').attr('cx',x).attr('cy',y).attr('r',7).attr('fill',C.root).attr('stroke',C.bg).attr('stroke-width',2)
          svg.append('text').attr('x',x+10*Math.cos(theta)).attr('y',y-10*Math.sin(theta)).attr('text-anchor','middle').attr('fill',C.root).attr('font-size',11).attr('font-weight','bold').text(`w${k}`)
        }
        // Connect as polygon
        if (pts.length > 1) {
          const poly = [...pts, pts[0]]
          const polyLine = d3.line().x(d=>d.x).y(d=>d.y)
          svg.append('path').datum(poly).attr('fill','none').attr('stroke',C.root).attr('stroke-width',1.5).attr('d',polyLine)
        }

        const angleDeg = (360/n).toFixed(1)
        svg.append('text').attr('x',W/2).attr('y',H-32).attr('text-anchor','middle').attr('fill',C.muted).attr('font-size',11).text(`${n} roots equally spaced — angular gap = 360°/${n} = ${angleDeg}°`)
        svg.append('text').attr('x',W/2).attr('y',H-14).attr('text-anchor','middle').attr('fill',C.root).attr('font-size',11).attr('font-weight','bold').text(`w_k = cos(${angleDeg}°·k) + i·sin(${angleDeg}°·k),  k = 0…${n-1}`)
      }
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [mode, z1, z2, n])

  const btnBase = { padding: '5px 13px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: '0.5px solid var(--color-border-secondary)', fontWeight: 500 }
  const active = { ...btnBase, background: 'var(--color-background-info)', color: 'var(--color-text-info)', borderColor: 'var(--color-border-info)' }
  const inactive = { ...btnBase, background: 'transparent', color: 'var(--color-text-secondary)' }

  return (
    <div ref={containerRef} className="w-full">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        <button style={mode === 'multiply' ? active : inactive} onClick={() => setMode('multiply')}>Multiplication = rotation</button>
        <button style={mode === 'power' ? active : inactive} onClick={() => setMode('power')}>De Moivre — powers</button>
        <button style={mode === 'roots' ? active : inactive} onClick={() => setMode('roots')}>nth roots = polygon</button>
      </div>
      <svg ref={svgRef} className="w-full" />
      {mode === 'power' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fbbf24', minWidth: 40 }}>n = {n}</span>
          <input type="range" min={1} max={8} step={1} value={n} onChange={e => setN(parseInt(e.target.value))} style={{ flex: 1, accentColor: '#fbbf24' }} />
        </div>
      )}
      {mode === 'roots' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fbbf24', minWidth: 60 }}>n = {n} roots</span>
          <input type="range" min={2} max={10} step={1} value={n} onChange={e => setN(parseInt(e.target.value))} style={{ flex: 1, accentColor: '#fbbf24' }} />
          <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>n=3 triangle · n=4 square · n=5 pentagon</span>
        </div>
      )}
    </div>
  )
}
