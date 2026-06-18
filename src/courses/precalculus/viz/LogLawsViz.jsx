import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * LogLawsViz
 * Proves ln(ab) = ln(a) + ln(b) as an area decomposition under y=1/t.
 * Three panels: ln(a), ln(b), ln(ab) — all shown as areas.
 * Sliders for a and b. Step-synced for the proof.
 * Dark mode. ResizeObserver.
 */
export default function LogLawsViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [a, setA] = useState(2)
  const [b, setB] = useState(3)

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:     isDark ? '#0f172a' : '#f8fafc',
        panel:  isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '#334155' : '#e2e8f0',
        axis:   isDark ? '#475569' : '#94a3b8',
        text:   isDark ? '#e2e8f0' : '#1e293b',
        muted:  isDark ? '#64748b' : '#94a3b8',
        curve:  isDark ? '#38bdf8' : '#0284c7',
        aFill:  isDark ? 'rgba(167,139,250,0.3)' : 'rgba(124,58,237,0.15)',
        bFill:  isDark ? 'rgba(52,211,153,0.3)' : 'rgba(5,150,105,0.15)',
        abFill: isDark ? 'rgba(251,191,36,0.25)' : 'rgba(217,119,6,0.12)',
        aStroke: isDark ? '#a78bfa' : '#7c3aed',
        bStroke: isDark ? '#34d399' : '#059669',
        abStroke: isDark ? '#fbbf24' : '#d97706',
        equal:  isDark ? '#f472b6' : '#db2777',
      }

      const step = params.currentStep ?? 3
      const W = containerRef.current?.clientWidth || 540
      const H = Math.round(W * 0.56)

      // Three equal panels
      const panW = (W - 8) / 3
      const pad = { t: 28, b: 24, l: 28, r: 8 }
      const iW = panW - pad.l - pad.r
      const iH = H - pad.t - pad.b

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      const ab = a * b
      const maxT = Math.max(ab + 0.5, 8)

      const drawLnPanel = (offsetX, lo, hi, fillColor, strokeColor, titleText, showCurve) => {
        const xS = d3.scaleLinear().domain([0.5, maxT]).range([offsetX + pad.l, offsetX + pad.l + iW])
        const yS = d3.scaleLinear().domain([0, 2.2]).range([pad.t + iH, pad.t])

        svg.append('rect').attr('x', offsetX + 1).attr('y', 1).attr('width', panW - 2).attr('height', H - 2).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

        // Axes
        svg.append('line').attr('x1', xS(0.5)).attr('y1', yS(0)).attr('x2', xS(maxT)).attr('y2', yS(0)).attr('stroke', C.axis).attr('stroke-width', 1.5)
        svg.append('line').attr('x1', xS(1)).attr('y1', pad.t - 4).attr('x2', xS(1)).attr('y2', pad.t + iH).attr('stroke', C.axis).attr('stroke-width', 1)

        // Tick at 1
        svg.append('text').attr('x', xS(1)).attr('y', yS(0) + 13).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text('1')

        // Shaded area
        const areaData = d3.range(Math.max(lo, 0.52), hi, 0.02).map(t => [t, 1 / t])
        if (areaData.length > 1) {
          const areaPath = d3.area().x(d => xS(d[0])).y0(yS(0)).y1(d => yS(d[1])).curve(d3.curveMonotoneX)
          svg.append('path').datum(areaData).attr('fill', fillColor).attr('d', areaPath)
        }

        // Boundary lines
        ;[lo, hi].forEach(v => {
          if (v > 0.5 && v < maxT) {
            svg.append('line').attr('x1', xS(v)).attr('y1', yS(0)).attr('x2', xS(v)).attr('y2', yS(1 / v)).attr('stroke', strokeColor).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3').attr('opacity', 0.8)
            svg.append('text').attr('x', xS(v)).attr('y', yS(0) + 13).attr('text-anchor', 'middle').attr('fill', strokeColor).attr('font-size', 10).attr('font-weight', 'bold').text(v <= 10 ? v : v.toFixed(1))
          }
        })

        // Curve y=1/t
        if (showCurve) {
          const curveData = d3.range(0.55, maxT, 0.05).map(t => [t, 1 / t])
          const line = d3.line().x(d => xS(d[0])).y(d => yS(Math.min(d[1], 2.2))).curve(d3.curveMonotoneX).defined(d => d[1] <= 2.2)
          svg.append('path').datum(curveData).attr('fill', 'none').attr('stroke', C.curve).attr('stroke-width', 2).attr('d', line)
          svg.append('text').attr('x', offsetX + panW - 8).attr('y', pad.t + 12).attr('text-anchor', 'end').attr('fill', C.curve).attr('font-size', 10).text('y = 1/t')
        }

        // Area value label
        const lnVal = hi > lo ? Math.log(hi / lo) : 0
        svg.append('text').attr('x', offsetX + panW / 2).attr('y', yS(0.6)).attr('text-anchor', 'middle').attr('fill', strokeColor).attr('font-size', 12).attr('font-weight', 'bold').text(lnVal.toFixed(3))

        // Panel title
        svg.append('text').attr('x', offsetX + panW / 2).attr('y', 17).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 11).attr('font-weight', '500').text(titleText)
      }

      // Panel 1: ln(a) = area 1→a
      drawLnPanel(0, 1, a, C.aFill, C.aStroke, `ln(${a}) = ${Math.log(a).toFixed(3)}`, true)

      // Panel 2: ln(b) = area 1→b  (step >= 1)
      if (step >= 1) {
        drawLnPanel(panW + 4, 1, b, C.bFill, C.bStroke, `ln(${b}) = ${Math.log(b).toFixed(3)}`, true)
      } else {
        svg.append('rect').attr('x', panW + 5).attr('y', 1).attr('width', panW - 2).attr('height', H - 2).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)
        svg.append('text').attr('x', panW + 4 + panW / 2).attr('y', H / 2).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 12).text('→ next step')
      }

      // Panel 3: ln(ab) = area 1→ab  (step >= 2)
      if (step >= 2) {
        drawLnPanel((panW + 4) * 2, 1, ab, C.abFill, C.abStroke, `ln(${a}×${b}) = ${Math.log(ab).toFixed(3)}`, true)
      } else {
        svg.append('rect').attr('x', (panW + 4) * 2 + 1).attr('y', 1).attr('width', panW - 2).attr('height', H - 2).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)
        svg.append('text').attr('x', (panW + 4) * 2 + panW / 2).attr('y', H / 2).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 12).text('→ next step')
      }

      // Equality labels (step >= 3)
      if (step >= 3) {
        const lna = Math.log(a), lnb = Math.log(b), lnab = Math.log(ab)
        svg.append('text').attr('x', W / 2).attr('y', H - 6).attr('text-anchor', 'middle').attr('fill', C.equal).attr('font-size', 12).attr('font-weight', 'bold')
          .text(`${lna.toFixed(3)} + ${lnb.toFixed(3)} = ${(lna + lnb).toFixed(3)} = ln(${ab}) ✓`)
      }
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [a, b, params.currentStep])

  const row = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }
  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ padding: '8px 4px 0' }}>
        {[{ label: 'a', val: a, set: setA, color: '#a78bfa' }, { label: 'b', val: b, set: setB, color: '#34d399' }].map(({ label, val, set, color }) => (
          <div key={label} style={row}>
            <span style={{ fontSize: 13, fontWeight: 'bold', color, minWidth: 48 }}>{label} = {val}</span>
            <input type="range" min={1.2} max={6} step={0.2} value={val}
              onChange={e => set(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: color }} />
          </div>
        ))}
        <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>
          Area of ln(a) + area of ln(b) always equals area of ln(ab) — that IS the log law.
        </p>
      </div>
    </div>
  )
}
