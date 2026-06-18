import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * InverseTrigViz
 * Dual panel: left shows the full periodic function with the restricted
 * (principal value) region highlighted. Right shows the inverse function
 * as the reflection over y=x.
 * Toggle between sin, cos, tan.
 * Dark mode. ResizeObserver.
 */
export default function InverseTrigViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [fn, setFn] = useState('sin')

  const config = {
    sin: {
      f: x => Math.sin(x),
      inv: x => Math.asin(Math.max(-1, Math.min(1, x))),
      xDom: [-2 * Math.PI, 2 * Math.PI],
      yDom: [-1.5, 1.5],
      restDom: [-Math.PI / 2, Math.PI / 2],
      invXDom: [-1.1, 1.1],
      invYDom: [-Math.PI / 2 - 0.2, Math.PI / 2 + 0.2],
      label: 'sin x',
      invLabel: 'arcsin x',
      restriction: '[-π/2, π/2]',
      range: '[-π/2, π/2]',
    },
    cos: {
      f: x => Math.cos(x),
      inv: x => Math.acos(Math.max(-1, Math.min(1, x))),
      xDom: [-2 * Math.PI, 2 * Math.PI],
      yDom: [-1.5, 1.5],
      restDom: [0, Math.PI],
      invXDom: [-1.1, 1.1],
      invYDom: [-0.2, Math.PI + 0.2],
      label: 'cos x',
      invLabel: 'arccos x',
      restriction: '[0, π]',
      range: '[0, π]',
    },
    tan: {
      f: x => Math.tan(x),
      inv: x => Math.atan(x),
      xDom: [-2 * Math.PI, 2 * Math.PI],
      yDom: [-4, 4],
      restDom: [-Math.PI / 2 + 0.05, Math.PI / 2 - 0.05],
      invXDom: [-5, 5],
      invYDom: [-Math.PI / 2 - 0.2, Math.PI / 2 + 0.2],
      label: 'tan x',
      invLabel: 'arctan x',
      restriction: '(−π/2, π/2)',
      range: '(−π/2, π/2)',
    },
  }

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:      isDark ? '#0f172a' : '#f8fafc',
        panel:   isDark ? '#1e293b' : '#ffffff',
        border:  isDark ? '#334155' : '#e2e8f0',
        axis:    isDark ? '#475569' : '#94a3b8',
        text:    isDark ? '#e2e8f0' : '#1e293b',
        muted:   isDark ? '#64748b' : '#94a3b8',
        faded:   isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)',
        active:  isDark ? '#818cf8' : '#4f46e5',
        restrict: isDark ? '#fbbf24' : '#d97706',
        rFill:   isDark ? 'rgba(251,191,36,0.18)' : 'rgba(217,119,6,0.1)',
        inv:     isDark ? '#34d399' : '#059669',
        yxLine:  isDark ? '#475569' : '#cbd5e1',
      }

      const W = containerRef.current?.clientWidth || 540
      const H = Math.round(W * 0.6)
      const halfW = Math.floor(W / 2) - 4
      const cfg = config[fn]
      const pad = { t: 24, b: 24, l: 32, r: 12 }

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      const drawPanel = (offsetX, xDom, yDom, title) => {
        const iW = halfW - pad.l - pad.r
        const iH = H - pad.t - pad.b
        const xS = d3.scaleLinear().domain(xDom).range([offsetX + pad.l, offsetX + pad.l + iW])
        const yS = d3.scaleLinear().domain(yDom).range([pad.t + iH, pad.t])

        svg.append('rect').attr('x', offsetX + 1).attr('y', 1).attr('width', halfW - 2).attr('height', H - 2).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

        // Axes
        const x0 = xS(0), y0 = yS(0)
        svg.append('line').attr('x1', offsetX + pad.l).attr('y1', y0).attr('x2', offsetX + pad.l + iW).attr('y2', y0).attr('stroke', C.axis).attr('stroke-width', 1.5)
        svg.append('line').attr('x1', x0).attr('y1', pad.t).attr('x2', x0).attr('y2', pad.t + iH).attr('stroke', C.axis).attr('stroke-width', 1.5)

        svg.append('text').attr('x', offsetX + halfW / 2).attr('y', 16).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 11).attr('font-weight', '500').text(title)

        return { xS, yS, iW, iH }
      }

      // ── LEFT PANEL: full function + restriction ──
      const { xS: lx, yS: ly } = drawPanel(0, cfg.xDom, cfg.yDom, cfg.label + ' — full domain')

      // y=x diagonal (reference)
      // Faded full function
      const fullData = []
      const step = (cfg.xDom[1] - cfg.xDom[0]) / 400
      for (let x = cfg.xDom[0]; x <= cfg.xDom[1]; x += step) {
        const y = cfg.f(x)
        if (Math.abs(y) <= Math.abs(cfg.yDom[1]) * 1.1) fullData.push([x, y])
        else if (fullData.length > 0 && fullData[fullData.length - 1] !== null) fullData.push(null)
      }

      const fullLine = d3.line().x(d => lx(d[0])).y(d => ly(d[1])).defined(d => d !== null).curve(d3.curveCatmullRom)
      const segments = []
      let cur = []
      fullData.forEach(d => {
        if (d === null) { if (cur.length) segments.push(cur); cur = [] }
        else cur.push(d)
      })
      if (cur.length) segments.push(cur)

      segments.forEach(seg => {
        svg.append('path').datum(seg).attr('fill', 'none').attr('stroke', C.faded).attr('stroke-width', 1.5).attr('d', fullLine)
      })

      // Restricted region highlight
      const [r0, r1] = cfg.restDom
      svg.append('rect')
        .attr('x', lx(r0)).attr('y', ly(cfg.yDom[1]))
        .attr('width', lx(r1) - lx(r0)).attr('height', ly(cfg.yDom[0]) - ly(cfg.yDom[1]))
        .attr('fill', C.rFill).attr('stroke', C.restrict).attr('stroke-width', 1).attr('stroke-dasharray', '4,3')

      // Active (restricted) portion of function
      const restData = d3.range(r0 + 0.01, r1 + 0.01, 0.02).map(x => [x, cfg.f(x)]).filter(d => Math.abs(d[1]) <= Math.abs(cfg.yDom[1]) * 1.1)
      const restLine = d3.line().x(d => lx(d[0])).y(d => ly(d[1])).curve(d3.curveCatmullRom)
      svg.append('path').datum(restData).attr('fill', 'none').attr('stroke', C.restrict).attr('stroke-width', 2.5).attr('d', restLine)

      // Label restriction
      const midR = (r0 + r1) / 2
      svg.append('text').attr('x', lx(midR)).attr('y', ly(cfg.yDom[0]) + 14).attr('text-anchor', 'middle').attr('fill', C.restrict).attr('font-size', 10).attr('font-weight', 'bold').text(cfg.restriction)

      // ── RIGHT PANEL: inverse function ──
      const { xS: rx, yS: ry } = drawPanel(halfW + 8, cfg.invXDom, cfg.invYDom, cfg.invLabel + '  →  range ' + cfg.range)

      // y = x diagonal
      const diag0 = Math.max(cfg.invXDom[0], cfg.invYDom[0])
      const diag1 = Math.min(cfg.invXDom[1], cfg.invYDom[1])
      if (diag1 > diag0) {
        svg.append('line')
          .attr('x1', rx(diag0)).attr('y1', ry(diag0))
          .attr('x2', rx(diag1)).attr('y2', ry(diag1))
          .attr('stroke', C.yxLine).attr('stroke-width', 1).attr('stroke-dasharray', '4,4')
        const midD = (diag0 + diag1) / 2 * 0.7
        svg.append('text').attr('x', rx(midD) + 6).attr('y', ry(midD) - 6).attr('fill', C.yxLine).attr('font-size', 10).text('y = x')
      }

      // Inverse function curve
      const invData = d3.range(cfg.invXDom[0] + 0.05, cfg.invXDom[1], 0.04).map(x => {
        try { const y = cfg.inv(x); if (isFinite(y)) return [x, y]; return null }
        catch { return null }
      }).filter(Boolean)

      const invLine = d3.line().x(d => rx(d[0])).y(d => ry(d[1])).curve(d3.curveCatmullRom)
      svg.append('path').datum(invData).attr('fill', 'none').attr('stroke', C.inv).attr('stroke-width', 2.5).attr('d', invLine)

      // Asymptotes for arctan
      if (fn === 'tan') {
        ;[Math.PI / 2, -Math.PI / 2].forEach(v => {
          svg.append('line')
            .attr('x1', rx(cfg.invXDom[0])).attr('y1', ry(v))
            .attr('x2', rx(cfg.invXDom[1])).attr('y2', ry(v))
            .attr('stroke', C.restrict).attr('stroke-width', 1).attr('stroke-dasharray', '5,4').attr('opacity', 0.7)
          svg.append('text').attr('x', rx(cfg.invXDom[1]) - 4).attr('y', ry(v) - 5).attr('text-anchor', 'end').attr('fill', C.restrict).attr('font-size', 9).text(v > 0 ? 'π/2' : '−π/2')
        })
      }
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [fn, params.currentStep])

  const btnBase = { padding: '5px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: '0.5px solid var(--color-border-secondary)', fontWeight: 500 }
  const active = { ...btnBase, background: 'var(--color-background-info)', color: 'var(--color-text-info)', borderColor: 'var(--color-border-info)' }
  const inactive = { ...btnBase, background: 'transparent', color: 'var(--color-text-secondary)' }

  return (
    <div ref={containerRef} className="w-full">
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {['sin', 'cos', 'tan'].map(f => (
          <button key={f} style={f === fn ? active : inactive} onClick={() => setFn(f)}>{f}</button>
        ))}
      </div>
      <svg ref={svgRef} className="w-full" />
      <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '6px 0 0', lineHeight: 1.5 }}>
        Left: full periodic function — amber region is the restricted domain used to define the inverse.
        Right: the inverse function (reflection over y=x of the restricted portion only).
      </p>
    </div>
  )
}
