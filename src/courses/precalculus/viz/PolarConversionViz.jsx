import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * PolarConversionViz — Pillars 1, 2, 5 for polar coordinates
 *
 * Three modes:
 *   'point'    — drag a point, see r/θ ↔ x/y live with right-triangle shown (Pillar 1)
 *   'convert'  — enter a polar equation, trace the curve as θ sweeps (Pillar 5)
 *   'proof'    — step through why r = 2a·cosθ is a circle (Pillar 2)
 *
 * Dark mode. ResizeObserver.
 */
export default function PolarConversionViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [mode, setMode] = useState('point')
  const [px, setPx] = useState(3)
  const [py, setPy] = useState(2)
  const [equationKey, setEquationKey] = useState('circle')
  const [proofStep, setProofStep] = useState(0)

  const equations = {
    circle:    { label: 'r = 3 (circle)',          fn: theta => 3 },
    cardioid:  { label: 'r = 1 + cos θ (cardioid)',fn: theta => 1 + Math.cos(theta) },
    rose3:     { label: 'r = cos(3θ) (rose, 3 petals)', fn: theta => Math.cos(3 * theta) },
    rose4:     { label: 'r = cos(2θ) (rose, 4 petals)', fn: theta => Math.cos(2 * theta) },
    limacon:   { label: 'r = 2 + sin θ (limaçon)', fn: theta => 2 + Math.sin(theta) },
    spiral:    { label: 'r = θ/π (spiral)',         fn: theta => theta / Math.PI },
    lemniscate:{ label: 'r² = 4cos(2θ) (lemniscate)', fn: theta => { const v = 4*Math.cos(2*theta); return v >= 0 ? Math.sqrt(v) : NaN } },
  }

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
        point:  isDark ? '#fbbf24' : '#d97706',
        r:      isDark ? '#38bdf8' : '#0284c7',
        theta:  isDark ? '#a78bfa' : '#7c3aed',
        x:      isDark ? '#34d399' : '#059669',
        y:      isDark ? '#f472b6' : '#db2777',
        curve:  isDark ? '#38bdf8' : '#0284c7',
        tri:    isDark ? 'rgba(251,191,36,0.12)' : 'rgba(217,119,6,0.08)',
        circ:   isDark ? '#334155' : '#e2e8f0',
      }

      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.78)
      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      if (mode === 'point') drawPoint(svg, W, H, C)
      else if (mode === 'convert') drawCurve(svg, W, H, C)
      else drawProof(svg, W, H, C, proofStep)
    }

    const drawPoint = (svg, W, H, C) => {
      const isDark = document.documentElement.classList.contains('dark')
      const cx = W / 2, cy = H * 0.5
      const scale = Math.min(W, H) * 0.11

      svg.append('rect').attr('x', 1).attr('y', 1).attr('width', W-2).attr('height', H-2).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      // Grid circles
      ;[1,2,3,4].forEach(r => {
        svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r * scale).attr('fill', 'none').attr('stroke', C.grid).attr('stroke-width', 1)
        svg.append('text').attr('x', cx + r * scale + 4).attr('y', cy - 4).attr('fill', C.muted).attr('font-size', 9).text(r)
      })

      // Axes
      svg.append('line').attr('x1', cx - 4.5*scale).attr('y1', cy).attr('x2', cx + 4.5*scale).attr('y2', cy).attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', cx).attr('y1', cy - 4.5*scale).attr('x2', cx).attr('y2', cy + 4.5*scale).attr('stroke', C.axis).attr('stroke-width', 1.5)

      const bx = cx + px * scale, by = cy - py * scale
      const r = Math.sqrt(px*px + py*py)
      const theta = Math.atan2(py, px)
      const thetaDeg = (theta * 180 / Math.PI + 360) % 360

      // Right triangle fill
      svg.append('polygon').attr('points', `${cx},${cy} ${bx},${cy} ${bx},${by}`).attr('fill', C.tri)

      // x component
      svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', bx).attr('y2', cy).attr('stroke', C.x).attr('stroke-width', 2.5)
      svg.append('text').attr('x', (cx+bx)/2).attr('y', cy + 16).attr('text-anchor', 'middle').attr('fill', C.x).attr('font-size', 12).attr('font-weight', 'bold').text(`x = ${px.toFixed(2)}`)

      // y component
      svg.append('line').attr('x1', bx).attr('y1', cy).attr('x2', bx).attr('y2', by).attr('stroke', C.y).attr('stroke-width', 2.5)
      svg.append('text').attr('x', bx + 10).attr('y', (cy+by)/2).attr('fill', C.y).attr('font-size', 12).attr('font-weight', 'bold').text(`y = ${py.toFixed(2)}`)

      // r (hypotenuse)
      svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', bx).attr('y2', by).attr('stroke', C.r).attr('stroke-width', 2.5)
      svg.append('text').attr('x', cx + (bx-cx)*0.45 - 12).attr('y', cy - (cy-by)*0.55).attr('fill', C.r).attr('font-size', 12).attr('font-weight', 'bold').text(`r = ${r.toFixed(3)}`)

      // Theta arc
      const arcD = d3.arc()({ innerRadius: scale * 0.35, outerRadius: scale * 0.35, startAngle: -theta, endAngle: 0 })
      svg.append('path').attr('d', arcD).attr('transform', `translate(${cx},${cy})`).attr('fill', 'none').attr('stroke', C.theta).attr('stroke-width', 2)
      svg.append('text').attr('x', cx + scale * 0.45 * Math.cos(theta/2)).attr('y', cy - scale * 0.45 * Math.sin(theta/2)).attr('fill', C.theta).attr('font-size', 12).attr('font-weight', 'bold').text('θ')

      // Draggable point
      svg.append('circle').attr('cx', bx).attr('cy', by).attr('r', 9).attr('fill', C.point).attr('stroke', C.bg).attr('stroke-width', 2).attr('cursor', 'grab')
        .call(d3.drag().on('drag', (event) => {
          setPx(+((event.x - cx) / scale).toFixed(3))
          setPy(+((cy - event.y) / scale).toFixed(3))
        }))

      // Conversion formulas live
      const infoY = H - 110
      svg.append('rect').attr('x', 16).attr('y', infoY).attr('width', W - 32).attr('height', 96).attr('rx', 8)
        .attr('fill', isDark ? '#0c1825' : '#f0f7ff').attr('stroke', C.border).attr('stroke-width', 1)

      const col1 = 32, col2 = W * 0.5
      const rows = [
        ['Polar form:', `(r, θ) = (${r.toFixed(3)}, ${thetaDeg.toFixed(1)}°)`, C.r],
        ['Cartesian:', `(x, y) = (${px.toFixed(3)}, ${py.toFixed(3)})`, C.x],
        ['x = r·cosθ:', `${r.toFixed(3)} × cos(${thetaDeg.toFixed(1)}°) = ${(r*Math.cos(theta)).toFixed(3)}`, C.x],
        ['y = r·sinθ:', `${r.toFixed(3)} × sin(${thetaDeg.toFixed(1)}°) = ${(r*Math.sin(theta)).toFixed(3)}`, C.y],
      ]
      rows.forEach(([label, val, col], i) => {
        svg.append('text').attr('x', col1).attr('y', infoY + 20 + i * 20).attr('fill', C.muted).attr('font-size', 11).text(label)
        svg.append('text').attr('x', col2).attr('y', infoY + 20 + i * 20).attr('fill', col).attr('font-size', 11).attr('font-weight', 'bold').text(val)
      })

      svg.append('text').attr('x', W/2).attr('y', 18).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 11).text('Drag the gold point — the triangle IS the conversion formula')
    }

    const drawCurve = (svg, W, H, C) => {
      const cx = W / 2, cy = H * 0.5
      const fn = equations[equationKey].fn
      const maxR = 4
      const scale = Math.min(W, H) * 0.11

      svg.append('rect').attr('x', 1).attr('y', 1).attr('width', W-2).attr('height', H-2).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      ;[1,2,3,4].forEach(r => {
        svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r * scale).attr('fill', 'none').attr('stroke', C.grid).attr('stroke-width', 1)
      })
      ;[0, Math.PI/4, Math.PI/2, 3*Math.PI/4].forEach(a => {
        svg.append('line').attr('x1', cx - maxR*scale*Math.cos(a)).attr('y1', cy + maxR*scale*Math.sin(a)).attr('x2', cx + maxR*scale*Math.cos(a)).attr('y2', cy - maxR*scale*Math.sin(a)).attr('stroke', C.grid).attr('stroke-width', 0.5)
      })
      svg.append('line').attr('x1', cx - maxR*scale - 10).attr('y1', cy).attr('x2', cx + maxR*scale + 10).attr('y2', cy).attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', cx).attr('y1', cy - maxR*scale - 10).attr('x2', cx).attr('y2', cy + maxR*scale + 10).attr('stroke', C.axis).attr('stroke-width', 1.5)

      const pts = []
      const steps = 800
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * 4 * Math.PI
        const r = fn(theta)
        if (!isFinite(r) || isNaN(r)) continue
        const x = cx + r * scale * Math.cos(theta)
        const y = cy - r * scale * Math.sin(theta)
        pts.push([x, y])
      }

      if (pts.length > 2) {
        const line = d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveCatmullRom)
        svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', C.curve).attr('stroke-width', 2.5).attr('d', line)
      }

      svg.append('text').attr('x', W/2).attr('y', 18).attr('text-anchor', 'middle').attr('fill', C.curve).attr('font-size', 12).attr('font-weight', 'bold').text(equations[equationKey].label)
    }

    const drawProof = (svg, W, H, C, step) => {
      const isDark = document.documentElement.classList.contains('dark')
      const proofSteps = [
        { title: 'Start: r = 2cosθ', body: 'This looks like it could be many shapes. We want to prove it\'s a circle.', formula: 'r = 2cosθ' },
        { title: 'Multiply both sides by r', body: 'Creates r² on left and r·cosθ on right — both have Cartesian forms.', formula: 'r² = 2r·cosθ' },
        { title: 'Substitute r² and r·cosθ', body: 'r² = x²+y², r·cosθ = x.', formula: 'x² + y² = 2x' },
        { title: 'Complete the square', body: 'Move 2x left, add 1 to both sides.', formula: '(x-1)² + y² = 1' },
        { title: 'It\'s a circle!', body: 'Centre (1,0), radius 1. Passes through the origin.', formula: 'Circle: centre (1,0), r=1 ✓' },
      ]
      const s = proofSteps[Math.min(step, proofSteps.length - 1)]
      const cx = W * 0.35, cy = H * 0.45
      const scale = Math.min(W, H) * 0.11

      svg.append('rect').attr('x', 1).attr('y', 1).attr('width', W-2).attr('height', H-2).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      ;[1,2].forEach(r => svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r*scale).attr('fill', 'none').attr('stroke', C.grid).attr('stroke-width', 1))
      svg.append('line').attr('x1', cx-2.5*scale).attr('y1', cy).attr('x2', cx+2.5*scale).attr('y2', cy).attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', cx).attr('y1', cy-2.5*scale).attr('x2', cx).attr('y2', cy+2.5*scale).attr('stroke', C.axis).attr('stroke-width', 1.5)

      // Draw the polar curve r=2cosθ
      const pts = d3.range(0, Math.PI + 0.01, 0.03).map(theta => {
        const r = 2 * Math.cos(theta)
        return [cx + r * scale * Math.cos(theta), cy - r * scale * Math.sin(theta)]
      })
      svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', C.curve).attr('stroke-width', step >= 4 ? 2.5 : 1.5).attr('d', d3.line())

      if (step >= 4) {
        // Draw the Cartesian circle
        svg.append('circle').attr('cx', cx + scale).attr('cy', cy).attr('r', scale).attr('fill', isDark?'rgba(56,189,248,0.12)':'rgba(2,132,199,0.08)').attr('stroke', C.r).attr('stroke-width', 2).attr('stroke-dasharray', '6,3')
        svg.append('circle').attr('cx', cx + scale).attr('cy', cy).attr('r', 4).attr('fill', C.point)
        svg.append('text').attr('x', cx + scale + 4).attr('y', cy - scale - 8).attr('fill', C.r).attr('font-size', 11).text('centre (1,0)')
      }

      // Right panel - step content
      const rx = W * 0.62
      svg.append('rect').attr('x', rx).attr('y', H*0.1).attr('width', W - rx - 12).attr('height', H*0.8).attr('rx', 8)
        .attr('fill', isDark?'#0c1825':'#f0f7ff').attr('stroke', C.border).attr('stroke-width', 1)

      svg.append('text').attr('x', rx + (W-rx)/2).attr('y', H*0.1 + 20).attr('text-anchor', 'middle').attr('fill', C.r).attr('font-size', 12).attr('font-weight', 'bold').text(s.title)
      svg.append('text').attr('x', rx + 12).attr('y', H*0.1 + 50).attr('fill', C.text).attr('font-size', 16).attr('font-weight', 'bold').text(s.formula)
      svg.append('foreignObject').attr('x', rx + 12).attr('y', H*0.1 + 70).attr('width', W-rx-24).attr('height', 80)
        .append('xhtml:p').style('font-size', '12px').style('color', isDark?'#94a3b8':'#475569').style('line-height', '1.6').text(s.body)
      svg.append('text').attr('x', rx + (W-rx)/2).attr('y', H*0.9 - 8).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 11).text(`Step ${step+1} of ${proofSteps.length}`)
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [mode, px, py, equationKey, proofStep])

  const btnBase = { padding: '5px 13px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: '0.5px solid var(--color-border-secondary)', fontWeight: 500 }
  const active = { ...btnBase, background: 'var(--color-background-info)', color: 'var(--color-text-info)', borderColor: 'var(--color-border-info)' }
  const inactive = { ...btnBase, background: 'transparent', color: 'var(--color-text-secondary)' }

  return (
    <div ref={containerRef} className="w-full">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        <button style={mode === 'point' ? active : inactive} onClick={() => setMode('point')}>Point conversion</button>
        <button style={mode === 'convert' ? active : inactive} onClick={() => setMode('convert')}>Polar curves</button>
        <button style={mode === 'proof' ? active : inactive} onClick={() => setMode('proof')}>Circle proof</button>
      </div>
      <svg ref={svgRef} className="w-full" />
      {mode === 'convert' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {Object.entries(equations).map(([key, { label }]) => (
            <button key={key} onClick={() => setEquationKey(key)} style={{ ...btnBase, background: equationKey === key ? 'var(--color-background-success)' : 'transparent', color: equationKey === key ? 'var(--color-text-success)' : 'var(--color-text-secondary)' }}>
              {label.split('(')[0].trim()}
            </button>
          ))}
        </div>
      )}
      {mode === 'proof' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={() => setProofStep(s => Math.max(0, s-1))} disabled={proofStep === 0} style={{ ...btnBase, opacity: proofStep === 0 ? 0.4 : 1 }}>← Back</button>
          <button onClick={() => setProofStep(s => Math.min(4, s+1))} disabled={proofStep === 4} style={{ ...active, opacity: proofStep === 4 ? 0.4 : 1 }}>Next →</button>
        </div>
      )}
    </div>
  )
}
