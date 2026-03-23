import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * LogGraphViz
 * Two modes via tab:
 *  'inverse' — shows b^x and log_b(x) as reflections over y=x
 *  'transform' — shows a·log_b(x-h)+k with live sliders
 * Slider for base b in both modes.
 * Dark mode. ResizeObserver.
 */
export default function LogGraphViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [mode, setMode] = useState('inverse')
  const [b, setB] = useState(2)
  const [a, setA] = useState(1)
  const [h, setH] = useState(0)
  const [k, setK] = useState(0)

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
        exp:    isDark ? '#38bdf8' : '#0284c7',
        log:    isDark ? '#f472b6' : '#db2777',
        diag:   isDark ? '#334155' : '#e2e8f0',
        asym:   isDark ? '#fbbf24' : '#d97706',
        point:  isDark ? '#34d399' : '#059669',
        parent: isDark ? '#475569' : '#cbd5e1',
      }

      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.72)
      const pad = { t: 28, b: 28, l: 40, r: 16 }
      const iW = W - pad.l - pad.r
      const iH = H - pad.t - pad.b

      const xDom = [-3, 6], yDom = [-4, 6]
      const xS = d3.scaleLinear().domain(xDom).range([pad.l, pad.l + iW])
      const yS = d3.scaleLinear().domain(yDom).range([pad.t + iH, pad.t])

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      svg.append('rect').attr('x', 1).attr('y', 1).attr('width', W - 2).attr('height', H - 2).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      // Grid
      for (let v = Math.ceil(yDom[0]); v <= Math.floor(yDom[1]); v++) {
        svg.append('line').attr('x1', pad.l).attr('y1', yS(v)).attr('x2', pad.l + iW).attr('y2', yS(v)).attr('stroke', C.grid).attr('stroke-width', 1)
      }
      for (let v = Math.ceil(xDom[0]); v <= Math.floor(xDom[1]); v++) {
        svg.append('line').attr('x1', xS(v)).attr('y1', pad.t).attr('x2', xS(v)).attr('y2', pad.t + iH).attr('stroke', C.grid).attr('stroke-width', 1)
      }

      // Axes
      svg.append('line').attr('x1', pad.l).attr('y1', yS(0)).attr('x2', pad.l + iW).attr('y2', yS(0)).attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', xS(0)).attr('y1', pad.t).attr('x2', xS(0)).attr('y2', pad.t + iH).attr('stroke', C.axis).attr('stroke-width', 1.5)

      // Tick labels
      for (let v = Math.ceil(xDom[0]); v <= Math.floor(xDom[1]); v++) {
        if (v !== 0) svg.append('text').attr('x', xS(v)).attr('y', yS(0) + 13).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(v)
      }
      for (let v = Math.ceil(yDom[0]); v <= Math.floor(yDom[1]); v++) {
        if (v !== 0) svg.append('text').attr('x', xS(0) - 5).attr('y', yS(v) + 4).attr('text-anchor', 'end').attr('fill', C.muted).attr('font-size', 10).text(v)
      }

      const drawCurve = (fn, color, width, dash) => {
        const pts = []
        let seg = []
        for (let i = 0; i <= 400; i++) {
          const x = xDom[0] + (i / 400) * (xDom[1] - xDom[0])
          const y = fn(x)
          if (!isFinite(y) || y < yDom[0] - 1 || y > yDom[1] + 1) {
            if (seg.length > 1) pts.push(seg)
            seg = []
          } else {
            seg.push([x, y])
          }
        }
        if (seg.length > 1) pts.push(seg)
        const line = d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom)
        pts.forEach(s => {
          svg.append('path').datum(s).attr('fill', 'none').attr('stroke', color).attr('stroke-width', width).attr('stroke-dasharray', dash || 'none').attr('d', line)
        })
      }

      if (mode === 'inverse') {
        // y = x diagonal
        svg.append('line').attr('x1', xS(xDom[0])).attr('y1', yS(xDom[0])).attr('x2', xS(xDom[1])).attr('y2', yS(xDom[1])).attr('stroke', C.diag).attr('stroke-width', 1.5).attr('stroke-dasharray', '6,4')
        svg.append('text').attr('x', xS(4.5)).attr('y', yS(4.5) - 8).attr('fill', C.muted).attr('font-size', 11).text('y = x')

        // Exponential
        drawCurve(x => Math.pow(b, x), C.exp, 2.5, null)
        svg.append('text').attr('x', xS(2.2)).attr('y', yS(Math.pow(b, 2.2)) - 8).attr('fill', C.exp).attr('font-size', 12).attr('font-weight', 'bold').text(`b^x`)

        // Logarithm
        drawCurve(x => x > 0 ? Math.log(x) / Math.log(b) : null, C.log, 2.5, null)
        svg.append('text').attr('x', xS(4.5)).attr('y', yS(Math.log(4.5) / Math.log(b)) + 16).attr('fill', C.log).attr('font-size', 12).attr('font-weight', 'bold').text(`log_b(x)`)

        // Key points
        const pts = [[0, 1, 'exp: (0,1)', C.exp], [1, 0, 'log: (1,0)', C.log]]
        pts.forEach(([px, py, lbl, col]) => {
          svg.append('circle').attr('cx', xS(px)).attr('cy', yS(py)).attr('r', 5).attr('fill', col).attr('stroke', C.bg).attr('stroke-width', 2)
          svg.append('text').attr('x', xS(px) + 8).attr('y', yS(py) - 6).attr('fill', col).attr('font-size', 11).text(lbl)
        })

        // Asymptote labels
        svg.append('text').attr('x', pad.l + 4).attr('y', yS(0) - 6).attr('fill', C.asym).attr('font-size', 10).text('exp: y=0 asymptote')
        svg.append('text').attr('x', xS(0) + 4).attr('y', pad.t + 14).attr('fill', C.log).attr('font-size', 10).text('log: x=0 asymptote')

      } else {
        // Transform mode
        const logFn = x => x - h > 0 ? a * Math.log(x - h) / Math.log(b) + k : null

        // Parent log_b(x) in grey
        drawCurve(x => x > 0 ? Math.log(x) / Math.log(b) : null, C.parent, 1.5, '4,4')

        // Vertical asymptote
        if (h >= xDom[0] && h <= xDom[1]) {
          svg.append('line').attr('x1', xS(h)).attr('y1', pad.t).attr('x2', xS(h)).attr('y2', pad.t + iH).attr('stroke', C.asym).attr('stroke-width', 1.5).attr('stroke-dasharray', '5,4')
          svg.append('text').attr('x', xS(h) + 4).attr('y', pad.t + 14).attr('fill', C.asym).attr('font-size', 11).text(`x=${h}`)
        }

        // Transformed curve
        drawCurve(logFn, C.log, 2.5, null)

        // Key point: (h+1, k)
        const kpX = h + 1, kpY = k
        if (kpX >= xDom[0] && kpX <= xDom[1] && kpY >= yDom[0] && kpY <= yDom[1]) {
          svg.append('circle').attr('cx', xS(kpX)).attr('cy', yS(kpY)).attr('r', 5).attr('fill', C.point).attr('stroke', C.bg).attr('stroke-width', 2)
          svg.append('text').attr('x', xS(kpX) + 7).attr('y', yS(kpY) - 6).attr('fill', C.point).attr('font-size', 11).text(`(${kpX}, ${kpY})`)
        }

        // Equation label
        const bStr = b === Math.E ? 'e' : b
        svg.append('text').attr('x', pad.l + 8).attr('y', pad.t + 16).attr('fill', C.log).attr('font-size', 12).attr('font-weight', 'bold')
          .text(`f(x) = ${a !== 1 ? a : ''}log_${bStr}(x${h !== 0 ? (h > 0 ? '−'+h : '+'+Math.abs(h)) : ''})${k !== 0 ? (k > 0 ? '+'+k : k) : ''}`)

        // Domain annotation
        svg.append('text').attr('x', pad.l + 8).attr('y', H - 10).attr('fill', C.muted).attr('font-size', 11)
          .text(`Domain: (${h}, ∞)   Range: (−∞, ∞)`)
      }
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [mode, b, a, h, k, params.currentStep])

  const btnBase = { padding: '5px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: '0.5px solid var(--color-border-secondary)', fontWeight: 500 }
  const active = { ...btnBase, background: 'var(--color-background-info)', color: 'var(--color-text-info)', borderColor: 'var(--color-border-info)' }
  const inactive = { ...btnBase, background: 'transparent', color: 'var(--color-text-secondary)' }

  return (
    <div ref={containerRef} className="w-full">
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button style={mode === 'inverse' ? active : inactive} onClick={() => setMode('inverse')}>Inverse relationship</button>
        <button style={mode === 'transform' ? active : inactive} onClick={() => setMode('transform')}>Transformations</button>
      </div>
      <svg ref={svgRef} className="w-full" />
      <div style={{ padding: '10px 2px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 'bold', color: '#38bdf8', minWidth: 16 }}>b</span>
          <input type="range" min={1.1} max={5} step={0.1} value={b} onChange={e => setB(parseFloat(e.target.value))} style={{ flex: 1, accentColor: '#38bdf8' }} />
          <span style={{ fontSize: 12, minWidth: 32, color: 'var(--color-text-secondary)' }}>{b.toFixed(1)}</span>
          <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>base</span>
        </div>
        {mode === 'transform' && [
          { label: 'a', val: a, set: setA, min: -3, max: 3, step: 0.5, color: '#f472b6', desc: 'vertical stretch/reflect' },
          { label: 'h', val: h, set: setH, min: -3, max: 4, step: 0.5, color: '#fbbf24', desc: 'horizontal shift → asymptote' },
          { label: 'k', val: k, set: setK, min: -3, max: 3, step: 0.5, color: '#34d399', desc: 'vertical shift' },
        ].map(({ label, val, set, min, max, step, color, desc }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 'bold', color, minWidth: 16 }}>{label}</span>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(parseFloat(e.target.value))} style={{ flex: 1, accentColor: color }} />
            <span style={{ fontSize: 12, minWidth: 32, color: 'var(--color-text-secondary)' }}>{val}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', minWidth: 160 }}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
