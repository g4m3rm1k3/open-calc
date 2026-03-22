import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * SinusoidalModelViz
 * Live sliders for A (amplitude), B (frequency), C (phase), D (vertical shift).
 * Shows the curve f(t) = A sin(Bt - C) + D with annotations for each parameter.
 * Dark mode. ResizeObserver.
 */
export default function SinusoidalModelViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [A, setA] = useState(2)
  const [B, setB] = useState(1)
  const [C, setC] = useState(0)
  const [D, setD] = useState(1)

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const Col = {
        bg:      isDark ? '#0f172a' : '#f8fafc',
        panel:   isDark ? '#1e293b' : '#ffffff',
        border:  isDark ? '#334155' : '#e2e8f0',
        axis:    isDark ? '#475569' : '#94a3b8',
        grid:    isDark ? '#1e293b' : '#f1f5f9',
        text:    isDark ? '#e2e8f0' : '#1e293b',
        muted:   isDark ? '#64748b' : '#94a3b8',
        curve:   isDark ? '#38bdf8' : '#0284c7',
        amp:     isDark ? '#f472b6' : '#db2777',
        period:  isDark ? '#a78bfa' : '#7c3aed',
        phase:   isDark ? '#fbbf24' : '#d97706',
        midline: isDark ? '#34d399' : '#059669',
        fill:    isDark ? 'rgba(56,189,248,0.08)' : 'rgba(2,132,199,0.05)',
      }

      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.52)
      const pad = { t: 32, b: 28, l: 42, r: 16 }
      const iW = W - pad.l - pad.r
      const iH = H - pad.t - pad.b

      const period = (2 * Math.PI) / Math.abs(B)
      const xDom = [0, period * 2.2]
      const yMax = Math.abs(A) + Math.abs(D) + 0.5
      const yDom = [-yMax, yMax]

      const f = t => A * Math.sin(B * t - C) + D

      const xS = d3.scaleLinear().domain(xDom).range([pad.l, pad.l + iW])
      const yS = d3.scaleLinear().domain(yDom).range([pad.t + iH, pad.t])

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', Col.bg)

      // Grid
      const gridYs = [-Math.abs(A) + D, D, Math.abs(A) + D]
      gridYs.forEach(v => {
        if (v >= yDom[0] && v <= yDom[1]) {
          svg.append('line').attr('x1', pad.l).attr('y1', yS(v)).attr('x2', pad.l + iW).attr('y2', yS(v)).attr('stroke', Col.grid).attr('stroke-width', 1)
        }
      })

      // Axes
      svg.append('line').attr('x1', pad.l).attr('y1', yS(0)).attr('x2', pad.l + iW).attr('y2', yS(0)).attr('stroke', Col.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', pad.l).attr('y1', pad.t).attr('x2', pad.l).attr('y2', pad.t + iH).attr('stroke', Col.axis).attr('stroke-width', 1.5)

      // Midline D
      svg.append('line').attr('x1', pad.l).attr('y1', yS(D)).attr('x2', pad.l + iW).attr('y2', yS(D)).attr('stroke', Col.midline).attr('stroke-width', 1.5).attr('stroke-dasharray', '6,4')
      svg.append('text').attr('x', pad.l + iW - 4).attr('y', yS(D) - 6).attr('text-anchor', 'end').attr('fill', Col.midline).attr('font-size', 11).attr('font-weight', 'bold').text(`midline y=${D}`)

      // Fill under curve
      const curveData = d3.range(xDom[0], xDom[1], 0.02).map(t => [t, f(t)])
      const area = d3.area().x(d => xS(d[0])).y0(yS(D)).y1(d => yS(d[1])).curve(d3.curveCatmullRom)
      svg.append('path').datum(curveData).attr('fill', Col.fill).attr('d', area)

      // Curve
      const line = d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom)
      svg.append('path').datum(curveData).attr('fill', 'none').attr('stroke', Col.curve).attr('stroke-width', 2.5).attr('d', line)

      // Amplitude annotation — vertical bracket at left peak
      const phaseShift = C / B
      const peakT = phaseShift + Math.PI / (2 * B)
      if (peakT >= xDom[0] && peakT <= xDom[1]) {
        const px = xS(peakT)
        svg.append('line').attr('x1', px + 14).attr('y1', yS(D)).attr('x2', px + 14).attr('y2', yS(D + Math.abs(A))).attr('stroke', Col.amp).attr('stroke-width', 1.5)
        ;[D, D + Math.abs(A)].forEach(v => {
          svg.append('line').attr('x1', px + 10).attr('y1', yS(v)).attr('x2', px + 18).attr('y2', yS(v)).attr('stroke', Col.amp).attr('stroke-width', 1.5)
        })
        svg.append('text').attr('x', px + 22).attr('y', yS(D + Math.abs(A) / 2)).attr('dominant-baseline', 'central').attr('fill', Col.amp).attr('font-size', 11).attr('font-weight', 'bold').text(`A=${Math.abs(A)}`)
      }

      // Period annotation — horizontal bracket
      const t0 = phaseShift < 0 ? phaseShift + period : phaseShift
      const t1 = t0 + period
      if (t1 <= xDom[1]) {
        const bY = yS(yDom[0]) + 14
        svg.append('line').attr('x1', xS(t0)).attr('y1', bY).attr('x2', xS(t1)).attr('y2', bY).attr('stroke', Col.period).attr('stroke-width', 1.5)
        ;[t0, t1].forEach(v => {
          svg.append('line').attr('x1', xS(v)).attr('y1', bY - 4).attr('x2', xS(v)).attr('y2', bY + 4).attr('stroke', Col.period).attr('stroke-width', 1.5)
        })
        svg.append('text').attr('x', xS((t0 + t1) / 2)).attr('y', bY + 13).attr('text-anchor', 'middle').attr('fill', Col.period).attr('font-size', 11).attr('font-weight', 'bold').text(`T = ${period.toFixed(2)}`)
      }

      // Phase shift annotation
      if (Math.abs(phaseShift) > 0.05 && xS(phaseShift) > pad.l && xS(phaseShift) < pad.l + iW) {
        svg.append('line').attr('x1', xS(0)).attr('y1', yS(D) - 6).attr('x2', xS(phaseShift)).attr('y2', yS(D) - 6).attr('stroke', Col.phase).attr('stroke-width', 1.5)
        svg.append('text').attr('x', xS(phaseShift / 2)).attr('y', yS(D) - 16).attr('text-anchor', 'middle').attr('fill', Col.phase).attr('font-size', 10).text(`phase = ${(phaseShift).toFixed(2)}`)
      }

      // Equation at top
      const cSign = C >= 0 ? '−' : '+'
      const cAbs = Math.abs(C).toFixed(2)
      const dSign = D >= 0 ? '+' : ''
      svg.append('text').attr('x', W / 2).attr('y', 18).attr('text-anchor', 'middle').attr('fill', Col.text).attr('font-size', 13).attr('font-weight', 'bold')
        .text(`f(t) = ${A} sin(${B}t ${cSign} ${cAbs}) ${dSign}${D}`)

      // Y axis ticks
      ;[D + Math.abs(A), D, D - Math.abs(A)].forEach(v => {
        if (v >= yDom[0] && v <= yDom[1]) {
          svg.append('text').attr('x', pad.l - 5).attr('y', yS(v) + 4).attr('text-anchor', 'end').attr('fill', Col.muted).attr('font-size', 10).text(v.toFixed(1))
        }
      })
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [A, B, C, D, params.currentStep])

  const sliders = [
    { label: 'A', val: A, set: setA, min: -4, max: 4, step: 0.5, color: '#f472b6', desc: 'amplitude' },
    { label: 'B', val: B, set: setB, min: 0.3, max: 4, step: 0.1, color: '#a78bfa', desc: 'frequency → period = 2π/B' },
    { label: 'C', val: C, set: setC, min: -Math.PI, max: Math.PI, step: 0.1, color: '#fbbf24', desc: 'phase → shift = C/B' },
    { label: 'D', val: D, set: setD, min: -3, max: 3, step: 0.5, color: '#34d399', desc: 'vertical shift (midline)' },
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
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', minWidth: 36, textAlign: 'right' }}>{val.toFixed(1)}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', minWidth: 160 }}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
