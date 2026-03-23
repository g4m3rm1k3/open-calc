import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

// ─────────────────────────────────────────────────────────────────────────────
// VectorOperationsViz — Pillars 1, 2, 4, 5 for 2D vectors
// Three modes: 'add' (tip-to-tail), 'forces' (component decomposition), 'scale'
// ─────────────────────────────────────────────────────────────────────────────
export function VectorOperationsViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [mode, setMode] = useState('add')
  const [v1, setV1] = useState({ x: 3, y: 1 })
  const [v2, setV2] = useState({ x: 1, y: 2.5 })
  const [scalar, setScalar] = useState(1.5)

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
        v1:    isDark ? '#38bdf8' : '#0284c7',
        v2:    isDark ? '#f472b6' : '#db2777',
        sum:   isDark ? '#34d399' : '#059669',
        par:   isDark ? '#fbbf24' : '#d97706',
        neg:   isDark ? '#f87171' : '#ef4444',
      }

      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.72)
      const cx = W * 0.45, cy = H * 0.5
      const scale = Math.min(W, H) / 9

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      svg.append('defs').html(`<marker id="arv" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker>`)

      svg.append('rect').attr('x',1).attr('y',1).attr('width',W-2).attr('height',H-2).attr('rx',8).attr('fill',C.panel).attr('stroke',C.border).attr('stroke-width',1)

      for (let v = -4; v <= 4; v++) {
        svg.append('line').attr('x1',cx+v*scale).attr('y1',cy-4*scale).attr('x2',cx+v*scale).attr('y2',cy+4*scale).attr('stroke',C.grid).attr('stroke-width',1)
        svg.append('line').attr('x1',cx-4*scale).attr('y1',cy+v*scale).attr('x2',cx+4*scale).attr('y2',cy+v*scale).attr('stroke',C.grid).attr('stroke-width',1)
        if (v !== 0) {
          svg.append('text').attr('x',cx+v*scale).attr('y',cy+14).attr('text-anchor','middle').attr('fill',C.muted).attr('font-size',9).text(v)
          svg.append('text').attr('x',cx-8).attr('y',cy-v*scale+4).attr('text-anchor','end').attr('fill',C.muted).attr('font-size',9).text(v)
        }
      }
      svg.append('line').attr('x1',cx-4*scale).attr('y1',cy).attr('x2',cx+4*scale).attr('y2',cy).attr('stroke',C.axis).attr('stroke-width',1.5)
      svg.append('line').attr('x1',cx).attr('y1',cy-4*scale).attr('x2',cx).attr('y2',cy+4*scale).attr('stroke',C.axis).attr('stroke-width',1.5)

      const drawVec = (ox, oy, dx, dy, col, label, dashed) => {
        const ex = ox + dx*scale, ey = oy - dy*scale
        svg.append('line').attr('x1',ox).attr('y1',oy).attr('x2',ex).attr('y2',ey).attr('stroke',col).attr('stroke-width',2.5).attr('stroke-dasharray',dashed?'5,3':'none').attr('marker-end','url(#arv)')
        if (label) svg.append('text').attr('x',ex+8).attr('y',ey-6).attr('fill',col).attr('font-size',12).attr('font-weight','bold').text(label)
        return { ex, ey }
      }

      const makeDraggable = (ex, ey, col, onDrag) => {
        svg.append('circle').attr('cx',ex).attr('cy',ey).attr('r',7).attr('fill',col).attr('stroke',C.bg).attr('stroke-width',2).attr('cursor','grab')
          .call(d3.drag().on('drag', event => {
            const nx = Math.max(-3.8, Math.min(3.8, (event.x-cx)/scale))
            const ny = Math.max(-3.8, Math.min(3.8, -(event.y-cy)/scale))
            onDrag(Math.round(nx*10)/10, Math.round(ny*10)/10)
          }))
      }

      if (mode === 'add') {
        const {ex:e1x, ey:e1y} = drawVec(cx, cy, v1.x, v1.y, C.v1, 'u', false)
        drawVec(e1x, e1y, v2.x, v2.y, C.v2, 'v', false)
        drawVec(cx, cy, v1.x+v2.x, v1.y+v2.y, C.sum, 'u+v', true)
        drawVec(cx, cy, v2.x, v2.y, C.v2, '', false)
        drawVec(cx + v2.x*scale, cy - v2.y*scale, v1.x, v1.y, C.v1, '', true)
        makeDraggable(cx+v1.x*scale, cy-v1.y*scale, C.v1, (x,y) => setV1({x,y}))
        makeDraggable(cx+v2.x*scale, cy-v2.y*scale, C.v2, (x,y) => setV2({x,y}))

        const sx = v1.x+v2.x, sy = v1.y+v2.y
        const infoX = cx + 4*scale + 10
        const infoW = W - infoX - 10
        if (infoW > 60) {
          const rows = [
            {label:'u', val:`⟨${v1.x}, ${v1.y}⟩`, col:C.v1},
            {label:'v', val:`⟨${v2.x}, ${v2.y}⟩`, col:C.v2},
            {label:'u+v', val:`⟨${sx.toFixed(1)}, ${sy.toFixed(1)}⟩`, col:C.sum},
            {label:'|u+v|', val:`${Math.sqrt(sx*sx+sy*sy).toFixed(3)}`, col:C.sum},
          ]
          rows.forEach(({label,val,col},i) => {
            svg.append('text').attr('x',infoX).attr('y',cy-40+i*22).attr('fill',C.muted).attr('font-size',11).text(label+' =')
            svg.append('text').attr('x',infoX).attr('y',cy-40+i*22+14).attr('fill',col).attr('font-size',12).attr('font-weight','bold').text(val)
          })
        }
        svg.append('text').attr('x',W/2).attr('y',H-10).attr('text-anchor','middle').attr('fill',C.muted).attr('font-size',10).text('Parallelogram: both arrangements give the same resultant (green arrow)')

      } else if (mode === 'scale') {
        drawVec(cx, cy, v1.x, v1.y, C.v1, 'u', false)
        drawVec(cx, cy, v1.x*scalar, v1.y*scalar, C.sum, `${scalar}u`, true)
        makeDraggable(cx+v1.x*scale, cy-v1.y*scale, C.v1, (x,y) => setV1({x,y}))

        svg.append('text').attr('x',cx+4*scale+10).attr('y',cy-20).attr('fill',C.v1).attr('font-size',12).attr('font-weight','bold').text(`u = ⟨${v1.x}, ${v1.y}⟩`)
        svg.append('text').attr('x',cx+4*scale+10).attr('y',cy+4).attr('fill',C.sum).attr('font-size',12).attr('font-weight','bold').text(`${scalar}u = ⟨${(v1.x*scalar).toFixed(1)}, ${(v1.y*scalar).toFixed(1)}⟩`)
        svg.append('text').attr('x',cx+4*scale+10).attr('y',cy+26).attr('fill',C.muted).attr('font-size',11).text(`|u| = ${Math.sqrt(v1.x*v1.x+v1.y*v1.y).toFixed(3)}`)
        svg.append('text').attr('x',cx+4*scale+10).attr('y',cy+44).attr('fill',C.sum).attr('font-size',11).text(`|${scalar}u| = ${(Math.sqrt(v1.x*v1.x+v1.y*v1.y)*Math.abs(scalar)).toFixed(3)}`)
        svg.append('text').attr('x',W/2).attr('y',H-10).attr('text-anchor','middle').attr('fill',C.muted).attr('font-size',10).text('Scalar mult: same direction, length scaled. Negative scalar: direction reversed.')
      }
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [mode, v1, v2, scalar])

  const btnBase = { padding: '5px 13px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: '0.5px solid var(--color-border-secondary)', fontWeight: 500 }
  const active = { ...btnBase, background: 'var(--color-background-info)', color: 'var(--color-text-info)', borderColor: 'var(--color-border-info)' }
  const inactive = { ...btnBase, background: 'transparent', color: 'var(--color-text-secondary)' }

  return (
    <div ref={containerRef} className="w-full">
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <button style={mode==='add'?active:inactive} onClick={()=>setMode('add')}>Addition (tip-to-tail)</button>
        <button style={mode==='scale'?active:inactive} onClick={()=>setMode('scale')}>Scalar multiplication</button>
      </div>
      <svg ref={svgRef} className="w-full" />
      {mode === 'scale' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px 0' }}>
          <span style={{ fontSize: 13, fontWeight: 'bold', color: '#34d399', minWidth: 60 }}>scalar = {scalar}</span>
          <input type="range" min={-2.5} max={3} step={0.1} value={scalar} onChange={e => setScalar(parseFloat(e.target.value))} style={{ flex: 1, accentColor: '#34d399' }} />
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DotProductViz — Pillars 1, 2, 3, 5 for dot product and projection
// Two modes: 'angle' (show dot product and angle) and 'project' (decomposition)
// ─────────────────────────────────────────────────────────────────────────────
export function DotProductViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [mode, setMode] = useState('angle')
  const [u, setU] = useState({ x: 3, y: 1 })
  const [v, setV] = useState({ x: 1.5, y: 2.5 })

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
        u:     isDark ? '#38bdf8' : '#0284c7',
        v:     isDark ? '#f472b6' : '#db2777',
        proj:  isDark ? '#fbbf24' : '#d97706',
        perp:  isDark ? '#34d399' : '#059669',
        angle: isDark ? '#a78bfa' : '#7c3aed',
      }

      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.72)
      const leftW = Math.round(W * 0.6)
      const cx = leftW * 0.45, cy = H * 0.5
      const scale = Math.min(leftW, H) / 9

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      svg.append('defs').html(`<marker id="ard" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker>`)

      svg.append('rect').attr('x',1).attr('y',1).attr('width',W-2).attr('height',H-2).attr('rx',8).attr('fill',C.panel).attr('stroke',C.border).attr('stroke-width',1)

      for (let vv = -4; vv <= 4; vv++) {
        svg.append('line').attr('x1',cx+vv*scale).attr('y1',cy-4*scale).attr('x2',cx+vv*scale).attr('y2',cy+4*scale).attr('stroke',C.grid).attr('stroke-width',1)
        svg.append('line').attr('x1',cx-4*scale).attr('y1',cy+vv*scale).attr('x2',cx+4*scale).attr('y2',cy+vv*scale).attr('stroke',C.grid).attr('stroke-width',1)
      }
      svg.append('line').attr('x1',cx-4*scale).attr('y1',cy).attr('x2',cx+4*scale).attr('y2',cy).attr('stroke',C.axis).attr('stroke-width',1.5)
      svg.append('line').attr('x1',cx).attr('y1',cy-4*scale).attr('x2',cx).attr('y2',cy+4*scale).attr('stroke',C.axis).attr('stroke-width',1.5)

      const drawVec = (ox,oy,dx,dy,col,lbl) => {
        const ex=ox+dx*scale, ey=oy-dy*scale
        svg.append('line').attr('x1',ox).attr('y1',oy).attr('x2',ex).attr('y2',ey).attr('stroke',col).attr('stroke-width',2.5).attr('marker-end','url(#ard)')
        if(lbl) svg.append('text').attr('x',ex+8).attr('y',ey-6).attr('fill',col).attr('font-size',13).attr('font-weight','bold').text(lbl)
      }

      const dot = u.x*v.x + u.y*v.y
      const magU = Math.sqrt(u.x*u.x + u.y*u.y)
      const magV = Math.sqrt(v.x*v.x + v.y*v.y)
      const cosTheta = dot / (magU * magV)
      const theta = Math.acos(Math.max(-1, Math.min(1, cosTheta)))
      const thetaDeg = theta * 180 / Math.PI

      drawVec(cx,cy,u.x,u.y,C.u,'u')
      drawVec(cx,cy,v.x,v.y,C.v,'v')

      // Angle arc between u and v
      const uAngle = Math.atan2(u.y, u.x)
      const vAngle = Math.atan2(v.y, v.x)
      const arcR = 0.55 * scale
      const startA = -Math.max(uAngle,vAngle), endA = -Math.min(uAngle,vAngle)
      const arc = d3.arc()({ innerRadius:arcR, outerRadius:arcR, startAngle:startA, endAngle:endA })
      svg.append('path').attr('d',arc).attr('transform',`translate(${cx},${cy})`).attr('fill','none').attr('stroke',C.angle).attr('stroke-width',2)
      svg.append('text').attr('x',cx+arcR*1.3*Math.cos((uAngle+vAngle)/2)).attr('y',cy-arcR*1.3*Math.sin((uAngle+vAngle)/2)).attr('text-anchor','middle').attr('fill',C.angle).attr('font-size',11).attr('font-weight','bold').text(`${thetaDeg.toFixed(1)}°`)

      if (mode === 'project') {
        // Scalar projection: comp_v(u) = (u·v)/|v|
        const scalarProj = dot / magV
        // Vector projection direction
        const projX = (dot / (magV*magV)) * v.x, projY = (dot / (magV*magV)) * v.y
        // Perpendicular component
        const perpX = u.x - projX, perpY = u.y - projY

        // Projection on v
        drawVec(cx,cy,projX,projY,C.proj,'proj')
        // Dashed from projection tip to u tip
        svg.append('line').attr('x1',cx+projX*scale).attr('y1',cy-projY*scale).attr('x2',cx+u.x*scale).attr('y2',cy-u.y*scale).attr('stroke',C.perp).attr('stroke-width',2).attr('stroke-dasharray','5,3').attr('marker-end','url(#ard)')
        svg.append('text').attr('x',cx+(projX+u.x)/2*scale+8).attr('y',cy-(projY+u.y)/2*scale).attr('fill',C.perp).attr('font-size',11).text('u⊥')

        // Right angle marker
        const pn = Math.sqrt(perpX*perpX+perpY*perpY)
        if (pn > 0.1) {
          const sqS = 0.15*scale
          const px2 = projX + (perpX/pn)*sqS, py2 = projY + (perpY/pn)*sqS
          const ex2 = px2 + (projX/magV)*sqS, ey2 = py2 + (projY/magV)*sqS
          const sx2 = projX + (projX/magV)*sqS, sy2 = projY + (projY/magV)*sqS
          const pts = [[projX,projY],[px2,py2],[ex2,ey2],[sx2,sy2]].map(([x,y])=>[cx+x*scale,cy-y*scale])
          svg.append('polygon').attr('points',pts.map(p=>p.join(',')).join(' ')).attr('fill','none').attr('stroke',C.perp).attr('stroke-width',1.5)
        }
      }

      // Make draggable
      ;[{pt:u,col:C.u,fn:setU},{pt:v,col:C.v,fn:setV}].forEach(({pt,col,fn}) => {
        svg.append('circle').attr('cx',cx+pt.x*scale).attr('cy',cy-pt.y*scale).attr('r',7).attr('fill',col).attr('stroke',C.bg).attr('stroke-width',2).attr('cursor','grab')
          .call(d3.drag().on('drag',event => {
            const nx = Math.max(-3.5,Math.min(3.5,(event.x-cx)/scale))
            const ny = Math.max(-3.5,Math.min(3.5,-(event.y-cy)/scale))
            fn({x:Math.round(nx*10)/10, y:Math.round(ny*10)/10})
          }))
      })

      // Right panel — live values
      const rx = leftW + 8, rw = W - rx - 8
      svg.append('rect').attr('x',rx).attr('y',2).attr('width',rw).attr('height',H-4).attr('rx',8).attr('fill',C.panel).attr('stroke',C.border).attr('stroke-width',1)

      const mid = rx + rw/2
      const fs = Math.min(rw*0.08, 12)
      const scalarProj = dot / magV
      const dotSign = dot > 0.01 ? 'positive → θ < 90°' : dot < -0.01 ? 'negative → θ > 90°' : 'zero → perpendicular!'

      const rows = [
        {label:'u · v', val: dot.toFixed(3), col: dot>0?C.perp:dot<0?'#ef4444':C.angle},
        {label:'|u|', val: magU.toFixed(3), col: C.u},
        {label:'|v|', val: magV.toFixed(3), col: C.v},
        {label:'cos θ', val: cosTheta.toFixed(4), col: C.angle},
        {label:'θ', val: `${thetaDeg.toFixed(2)}°`, col: C.angle},
        {label:'comp_v(u)', val: scalarProj.toFixed(3), col: C.proj},
      ]

      svg.append('text').attr('x',mid).attr('y',22).attr('text-anchor','middle').attr('fill',C.muted).attr('font-size',fs*0.9).text('live values')

      rows.forEach(({label,val,col},i) => {
        const y = 36 + i * ((H-80)/rows.length)
        svg.append('text').attr('x',rx+10).attr('y',y+8).attr('fill',C.muted).attr('font-size',fs).text(label+' =')
        svg.append('text').attr('x',rx+rw-10).attr('y',y+8).attr('text-anchor','end').attr('fill',col).attr('font-size',fs*1.1).attr('font-weight','bold').text(val)
        if(i<rows.length-1) svg.append('line').attr('x1',rx+8).attr('y1',y+16).attr('x2',rx+rw-8).attr('y2',y+16).attr('stroke',C.border).attr('stroke-width',0.5)
      })

      svg.append('rect').attr('x',rx+8).attr('y',H-46).attr('width',rw-16).attr('height',36).attr('rx',6)
        .attr('fill',dot>0.01?(isDark?'#1a3a2a':'#dcfce7'):dot<-0.01?(isDark?'#3d1a1a':'#fef2f2'):(isDark?'#2d1b4a':'#ede9fe'))
        .attr('stroke',dot>0.01?C.perp:dot<-0.01?'#ef4444':C.angle).attr('stroke-width',1)
      svg.append('text').attr('x',mid).attr('y',H-30).attr('text-anchor','middle').attr('fill',C.text).attr('font-size',11).attr('font-weight','bold').text(dotSign)
      svg.append('text').attr('x',mid).attr('y',H-14).attr('text-anchor','middle').attr('fill',C.muted).attr('font-size',10).text('drag vectors to explore')
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [mode, u, v])

  const btnBase = { padding: '5px 13px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: '0.5px solid var(--color-border-secondary)', fontWeight: 500 }
  const active = { ...btnBase, background: 'var(--color-background-info)', color: 'var(--color-text-info)', borderColor: 'var(--color-border-info)' }
  const inactive = { ...btnBase, background: 'transparent', color: 'var(--color-text-secondary)' }

  return (
    <div ref={containerRef} className="w-full">
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <button style={mode==='angle'?active:inactive} onClick={()=>setMode('angle')}>Angle & dot product</button>
        <button style={mode==='project'?active:inactive} onClick={()=>setMode('project')}>Projection & decomposition</button>
      </div>
      <svg ref={svgRef} className="w-full" />
    </div>
  )
}

export default VectorOperationsViz
