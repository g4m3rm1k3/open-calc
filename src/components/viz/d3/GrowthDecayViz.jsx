import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * GrowthDecayViz
 * Shows A = P(1 + r/n)^(nt) vs A = Pe^(rt) side by side.
 * Sliders for P, r, and time range.
 * Marks doubling time / half-life on the curve.
 * Toggle: growth (r>0) vs decay (r<0).
 * Dark mode. ResizeObserver.
 */
export default function GrowthDecayViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [P, setP] = useState(1000)
  const [r, setR] = useState(6)       // percent
  const [mode, setMode] = useState('growth')
  const [tMax, setTMax] = useState(30)

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
        cont:    isDark ? '#38bdf8' : '#0284c7',
        monthly: isDark ? '#f472b6' : '#db2777',
        annual:  isDark ? '#fbbf24' : '#d97706',
        marker:  isDark ? '#34d399' : '#059669',
        panel2:  isDark ? '#162032' : '#f0f7ff',
      }

      const rDec = (mode === 'growth' ? r : -r) / 100
      const contFn = t => P * Math.exp(rDec * t)
      const monthlyFn = t => P * Math.pow(1 + rDec / 12, 12 * t)
      const annualFn = t => P * Math.pow(1 + rDec, t)

      const W = containerRef.current?.clientWidth || 540
      const H = Math.round(W * 0.56)
      const pad = { t: 28, b: 36, l: 56, r: 16 }
      const iW = W - pad.l - pad.r
      const iH = H - pad.t - pad.b

      const xDom = [0, tMax]
      const allYs = d3.range(0, tMax, 0.5).flatMap(t => [contFn(t), monthlyFn(t), annualFn(t)]).filter(isFinite)
      const yMax = Math.max(...allYs) * 1.05
      const yDom = [0, yMax]

      const xS = d3.scaleLinear().domain(xDom).range([pad.l, pad.l + iW])
      const yS = d3.scaleLinear().domain(yDom).range([pad.t + iH, pad.t])

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      // Panel
      svg.append('rect').attr('x', 2).attr('y', 2).attr('width', W - 4).attr('height', H - 4).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      // Grid
      const yTicks = yS.ticks(5)
      yTicks.forEach(v => {
        svg.append('line').attr('x1', pad.l).attr('y1', yS(v)).attr('x2', pad.l + iW).attr('y2', yS(v)).attr('stroke', C.grid).attr('stroke-width', 1)
        const label = v >= 1000 ? `${(v/1000).toFixed(1)}k` : `${v.toFixed(0)}`
        svg.append('text').attr('x', pad.l - 4).attr('y', yS(v) + 4).attr('text-anchor', 'end').attr('fill', C.muted).attr('font-size', 10).text(label)
      })
      ;[0, tMax/4, tMax/2, 3*tMax/4, tMax].forEach(v => {
        svg.append('text').attr('x', xS(v)).attr('y', pad.t + iH + 14).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(`${v}yr`)
      })

      // Axes
      svg.append('line').attr('x1', pad.l).attr('y1', yS(0)).attr('x2', pad.l + iW).attr('y2', yS(0)).attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', pad.l).attr('y1', pad.t).attr('x2', pad.l).attr('y2', pad.t + iH).attr('stroke', C.axis).attr('stroke-width', 1.5)

      // Curves
      const drawCurve = (fn, color, dash, label) => {
        const data = d3.range(0, tMax, tMax / 200).map(t => [t, fn(t)]).filter(d => isFinite(d[1]) && d[1] >= 0 && d[1] <= yDom[1] * 1.1)
        if (data.length < 2) return
        const line = d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom)
        svg.append('path').datum(data).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2.5).attr('stroke-dasharray', dash || 'none').attr('d', line)
        const last = data[data.length - 1]
        svg.append('text').attr('x', xS(last[0]) + 4).attr('y', yS(last[1])).attr('fill', color).attr('font-size', 11).attr('font-weight', 'bold').text(label)
      }

      drawCurve(annualFn, C.annual, '6,4', 'Annual')
      drawCurve(monthlyFn, C.monthly, '3,2', 'Monthly')
      drawCurve(contFn, C.cont, null, 'Continuous')

      // Doubling / half-life marker
      const tTarget = Math.log(2) / Math.abs(rDec)
      if (tTarget <= tMax && isFinite(tTarget)) {
        const markerY = contFn(tTarget)
        svg.append('line').attr('x1', xS(tTarget)).attr('y1', yS(0)).attr('x2', xS(tTarget)).attr('y2', yS(markerY)).attr('stroke', C.marker).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
        svg.append('line').attr('x1', pad.l).attr('y1', yS(markerY)).attr('x2', xS(tTarget)).attr('y2', yS(markerY)).attr('stroke', C.marker).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
        svg.append('circle').attr('cx', xS(tTarget)).attr('cy', yS(markerY)).attr('r', 5).attr('fill', C.marker).attr('stroke', C.bg).attr('stroke-width', 2)
        const markerLabel = mode === 'growth' ? `Doubling time: ${tTarget.toFixed(1)} yr` : `Half-life: ${tTarget.toFixed(1)} yr`
        svg.append('text').attr('x', xS(tTarget) + 6).attr('y', yS(markerY) - 8).attr('fill', C.marker).attr('font-size', 11).attr('font-weight', 'bold').text(markerLabel)
      }

      // Summary box top-right
      const finalCont = contFn(tMax)
      const finalMonthly = monthlyFn(tMax)
      svg.append('rect').attr('x', pad.l + iW - 160).attr('y', pad.t + 4).attr('width', 158).attr('height', 58).attr('rx', 6).attr('fill', C.panel2).attr('stroke', C.border).attr('stroke-width', 0.5)
      svg.append('text').attr('x', pad.l + iW - 82).attr('y', pad.t + 18).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(`After ${tMax} years:`)
      svg.append('text').attr('x', pad.l + iW - 82).attr('y', pad.t + 32).attr('text-anchor', 'middle').attr('fill', C.cont).attr('font-size', 11).attr('font-weight', 'bold').text(`Continuous: ${finalCont.toFixed(0)}`)
      svg.append('text').attr('x', pad.l + iW - 82).attr('y', pad.t + 46).attr('text-anchor', 'middle').attr('fill', C.monthly).attr('font-size', 11).attr('font-weight', 'bold').text(`Monthly: ${finalMonthly.toFixed(0)}`)

      // Axis labels
      svg.append('text').attr('x', pad.l + iW / 2).attr('y', H - 6).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 11).text('Time (years)')
      svg.append('text').attr('x', 12).attr('y', pad.t + iH / 2).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 11).attr('transform', `rotate(-90, 12, ${pad.t + iH / 2})`).text('Amount ($)')
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [P, r, mode, tMax, params.currentStep])

  const btnBase = { padding: '5px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: '0.5px solid var(--color-border-secondary)', fontWeight: 500 }
  const activeBtn = { ...btnBase, background: 'var(--color-background-info)', color: 'var(--color-text-info)', borderColor: 'var(--color-border-info)' }
  const inactiveBtn = { ...btnBase, background: 'transparent', color: 'var(--color-text-secondary)' }

  return (
    <div ref={containerRef} className="w-full">
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button style={mode === 'growth' ? activeBtn : inactiveBtn} onClick={() => setMode('growth')}>Growth</button>
        <button style={mode === 'decay' ? activeBtn : inactiveBtn} onClick={() => setMode('decay')}>Decay</button>
      </div>
      <svg ref={svgRef} className="w-full" />
      <div style={{ padding: '10px 2px 0' }}>
        {[
          { label: 'Principal P', val: P, set: setP, min: 100, max: 10000, step: 100, color: '#34d399', fmt: v => `${v}` },
          { label: 'Rate r', val: r, set: setR, min: 1, max: 20, step: 0.5, color: '#38bdf8', fmt: v => `${v}%` },
          { label: 'Time span', val: tMax, set: setTMax, min: 5, max: 50, step: 5, color: '#fbbf24', fmt: v => `${v} yr` },
        ].map(({ label, val, set, min, max, step, color, fmt }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 'bold', color, minWidth: 80 }}>{label}</span>
            <input type="range" min={min} max={max} step={step} value={val}
              onChange={e => set(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: color }} />
            <span style={{ fontSize: 12, minWidth: 52, textAlign: 'right', color: 'var(--color-text-secondary)' }}>{fmt(val)}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '6px 0 0' }}>
        Blue = continuous · Pink dashed = monthly · Gold dashed = annual · Green marker = doubling time or half-life
      </p>
    </div>
  )
}
