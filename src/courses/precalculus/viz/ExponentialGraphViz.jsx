import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * ExponentialGraphViz
 * Shows f(x) = a·b^(x-h) + k with live sliders.
 * Left: graph with labeled key features (asymptote, y-intercept, direction).
 * Right: parameter readout + key points table.
 * Toggle between growth bases (>1) and decay bases (0<b<1).
 * Dark mode. ResizeObserver.
 */
export default function ExponentialGraphViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [a, setA] = useState(1)
  const [b, setB] = useState(2)
  const [h, setH] = useState(0)
  const [k, setK] = useState(0)

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
        curve:   isDark ? '#38bdf8' : '#0284c7',
        asym:    isDark ? '#fbbf24' : '#d97706',
        point:   isDark ? '#34d399' : '#059669',
        parent:  isDark ? '#334155' : '#e2e8f0',
      }

      const W = containerRef.current?.clientWidth || 540
      const H = Math.round(W * 0.58)
      const leftW = Math.round(W * 0.6)
      const pad = { t: 28, b: 28, l: 40, r: 8 }
      const iW = leftW - pad.l - pad.r
      const iH = H - pad.t - pad.b

      const xDom = [-4, 4]
      const f = x => a * Math.pow(b, x - h) + k
      const ys = d3.range(xDom[0], xDom[1], 0.1).map(x => f(x)).filter(isFinite)
      const yPad = 2
      const yMin = Math.max(Math.min(...ys) - yPad, k - 8)
      const yMax = Math.min(Math.max(...ys) + yPad, k + 15)
      const yDom = [yMin, yMax]

      const xS = d3.scaleLinear().domain(xDom).range([pad.l, pad.l + iW])
      const yS = d3.scaleLinear().domain(yDom).range([pad.t + iH, pad.t])

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      svg.append('rect').attr('x', 2).attr('y', 2).attr('width', leftW - 4).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      // Grid
      for (let v = Math.ceil(yDom[0]); v <= Math.floor(yDom[1]); v += 2) {
        svg.append('line').attr('x1', pad.l).attr('y1', yS(v)).attr('x2', pad.l + iW).attr('y2', yS(v)).attr('stroke', C.grid).attr('stroke-width', 1)
      }
      for (let v = xDom[0]; v <= xDom[1]; v++) {
        svg.append('line').attr('x1', xS(v)).attr('y1', pad.t).attr('x2', xS(v)).attr('y2', pad.t + iH).attr('stroke', C.grid).attr('stroke-width', 1)
      }

      // Axes
      if (yDom[0] <= 0 && yDom[1] >= 0)
        svg.append('line').attr('x1', pad.l).attr('y1', yS(0)).attr('x2', pad.l + iW).attr('y2', yS(0)).attr('stroke', C.axis).attr('stroke-width', 1.5)
      if (xDom[0] <= 0 && xDom[1] >= 0)
        svg.append('line').attr('x1', xS(0)).attr('y1', pad.t).attr('x2', xS(0)).attr('y2', pad.t + iH).attr('stroke', C.axis).attr('stroke-width', 1.5)

      // Axis tick labels
      for (let v = xDom[0]; v <= xDom[1]; v++) {
        if (v === 0) continue
        svg.append('text').attr('x', xS(v)).attr('y', yS(0) < pad.t + iH - 10 ? yS(0) + 13 : pad.t + iH + 13).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(v)
      }

      // Horizontal asymptote y = k
      if (k >= yDom[0] && k <= yDom[1]) {
        svg.append('line').attr('x1', pad.l).attr('y1', yS(k)).attr('x2', pad.l + iW).attr('y2', yS(k)).attr('stroke', C.asym).attr('stroke-width', 1.5).attr('stroke-dasharray', '6,4')
        svg.append('text').attr('x', pad.l + iW - 4).attr('y', yS(k) - 6).attr('text-anchor', 'end').attr('fill', C.asym).attr('font-size', 11).attr('font-weight', 'bold').text(`y = ${k} (asymptote)`)
      }

      // Parent curve b^x (faint)
      const parentData = d3.range(xDom[0], xDom[1], 0.05).map(x => ({ x, y: Math.pow(b, x) })).filter(d => isFinite(d.y) && d.y >= yDom[0] && d.y <= yDom[1])
      if (parentData.length > 2) {
        const parentLine = d3.line().x(d => xS(d.x)).y(d => yS(d.y)).curve(d3.curveCatmullRom).defined(d => d.y >= yDom[0] && d.y <= yDom[1])
        svg.append('path').datum(parentData).attr('fill', 'none').attr('stroke', C.parent).attr('stroke-width', 1.5).attr('stroke-dasharray', '3,3').attr('d', parentLine)
        svg.append('text').attr('x', xS(xDom[1]) - 4).attr('y', yS(parentData[parentData.length-1]?.y ?? 1) - 6).attr('text-anchor', 'end').attr('fill', C.muted).attr('font-size', 10).text(`b^x`)
      }

      // Main curve
      const curveData = d3.range(xDom[0], xDom[1], 0.03).map(x => ({ x, y: f(x) })).filter(d => isFinite(d.y) && d.y > yDom[0] && d.y < yDom[1])
      if (curveData.length > 2) {
        const curveLine = d3.line().x(d => xS(d.x)).y(d => yS(d.y)).curve(d3.curveCatmullRom)
        svg.append('path').datum(curveData).attr('fill', 'none').attr('stroke', C.curve).attr('stroke-width', 2.5).attr('d', curveLine)
      }

      // Key points
      const keyPts = [
        { x: 0, label: `(0, ${f(0).toFixed(2)})`, desc: 'y-intercept' },
        { x: h, label: `(${h}, ${f(h).toFixed(2)})`, desc: `x=${h} (x-shift)` },
      ]
      keyPts.forEach(({ x, label, desc }) => {
        const y = f(x)
        if (!isFinite(y) || y < yDom[0] || y > yDom[1]) return
        svg.append('circle').attr('cx', xS(x)).attr('cy', yS(y)).attr('r', 5).attr('fill', C.point).attr('stroke', C.bg).attr('stroke-width', 2)
        svg.append('text').attr('x', xS(x) + 7).attr('y', yS(y) - 6).attr('fill', C.point).attr('font-size', 10).attr('font-weight', 'bold').text(label)
      })

      // Equation label
      const bStr = b % 1 === 0 ? b : b.toFixed(2)
      const eqParts = []
      if (Math.abs(a) !== 1) eqParts.push(a < 0 ? `−${Math.abs(a)}` : `${a}`)
      else if (a === -1) eqParts.push('−')
      eqParts.push(`${bStr}^x`)
      if (h !== 0) eqParts[eqParts.length - 1] = `${bStr}^(x${h < 0 ? '+' : '−'}${Math.abs(h)})`
      if (k !== 0) eqParts.push(k > 0 ? `+ ${k}` : `− ${Math.abs(k)}`)
      svg.append('text').attr('x', pad.l + 8).attr('y', pad.t + 16).attr('fill', C.curve).attr('font-size', 12).attr('font-weight', 'bold').text(`f(x) = ${eqParts.join('·')}`)

      // Right panel
      const rx = leftW + 8, rw = W - rx - 8
      svg.append('rect').attr('x', rx).attr('y', 2).attr('width', rw).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      const mid = rx + rw / 2
      const fs = Math.min(rw * 0.08, 12)

      const props = [
        { label: 'Base b', val: bStr, note: b > 1 ? 'growth ↑' : 'decay ↓' },
        { label: 'Stretch a', val: a, note: a < 0 ? 'reflected' : '' },
        { label: 'H-shift h', val: h, note: h !== 0 ? (h > 0 ? '→ right' : '← left') : '' },
        { label: 'V-shift k', val: k, note: 'moves asymptote' },
        { label: 'Asymptote', val: `y = ${k}`, note: '' },
        { label: 'Domain', val: '(−∞, ∞)', note: '' },
        { label: 'Range', val: a > 0 ? `(${k}, ∞)` : `(−∞, ${k})`, note: '' },
        { label: 'y-intercept', val: f(0).toFixed(3), note: '' },
      ]

      props.forEach(({ label, val, note }, i) => {
        const y = 24 + i * ((H - 32) / props.length)
        svg.append('text').attr('x', rx + 10).attr('y', y + 6).attr('fill', C.muted).attr('font-size', fs * 0.9).text(label)
        svg.append('text').attr('x', rx + rw - 10).attr('y', y + 6).attr('text-anchor', 'end').attr('fill', C.text).attr('font-size', fs).attr('font-weight', '500').text(String(val))
        if (note) svg.append('text').attr('x', rx + rw - 10).attr('y', y + 18).attr('text-anchor', 'end').attr('fill', C.curve).attr('font-size', 10).text(note)
        if (i < props.length - 1) svg.append('line').attr('x1', rx + 8).attr('y1', y + 26).attr('x2', rx + rw - 8).attr('y2', y + 26).attr('stroke', C.border).attr('stroke-width', 0.5)
      })
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [a, b, h, k, params.currentStep])

  const sliders = [
    { label: 'a', val: a, set: setA, min: -4, max: 4, step: 0.5, color: '#f472b6', desc: 'vertical stretch / reflect' },
    { label: 'b', val: b, set: setB, min: 0.1, max: 5, step: 0.1, color: '#38bdf8', desc: 'base (>1 growth, <1 decay)' },
    { label: 'h', val: h, set: setH, min: -3, max: 3, step: 0.5, color: '#fbbf24', desc: 'horizontal shift' },
    { label: 'k', val: k, set: setK, min: -4, max: 4, step: 0.5, color: '#34d399', desc: 'vertical shift / asymptote' },
  ]

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ padding: '10px 2px 0' }}>
        {sliders.map(({ label, val, set, min, max, step, color, desc }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 'bold', color, minWidth: 16 }}>{label}</span>
            <input type="range" min={min} max={max} step={step} value={val}
              onChange={e => set(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: color }} />
            <span style={{ fontSize: 12, minWidth: 36, textAlign: 'right', color: 'var(--color-text-secondary)' }}>{val}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', minWidth: 150 }}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
