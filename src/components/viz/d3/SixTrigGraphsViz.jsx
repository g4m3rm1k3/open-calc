import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * SixTrigGraphsViz
 * Toggle any subset of the 6 trig functions. Shows asymptotes, period markers,
 * and a draggable x-line with live value readout. Dark mode. ResizeObserver.
 */
export default function SixTrigGraphsViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const xRef = useRef(Math.PI / 6)
  const [active, setActive] = useState({ sin: true, cos: true, tan: false, cot: false, sec: false, csc: false })

  const fns = {
    sin: { f: x => Math.sin(x), col: { dark: '#f472b6', light: '#db2777' }, period: 2 * Math.PI, label: 'sin' },
    cos: { f: x => Math.cos(x), col: { dark: '#34d399', light: '#059669' }, period: 2 * Math.PI, label: 'cos' },
    tan: { f: x => { const v = Math.tan(x); return Math.abs(v) > 8 ? null : v }, col: { dark: '#fbbf24', light: '#d97706' }, period: Math.PI, label: 'tan' },
    cot: { f: x => { const v = Math.cos(x) / Math.sin(x); return Math.abs(v) > 8 ? null : v }, col: { dark: '#fb923c', light: '#ea580c' }, period: Math.PI, label: 'cot' },
    sec: { f: x => { const v = 1 / Math.cos(x); return Math.abs(v) > 8 ? null : v }, col: { dark: '#38bdf8', light: '#0284c7' }, period: 2 * Math.PI, label: 'sec' },
    csc: { f: x => { const v = 1 / Math.sin(x); return Math.abs(v) > 8 ? null : v }, col: { dark: '#a78bfa', light: '#7c3aed' }, period: 2 * Math.PI, label: 'csc' },
  }

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg: isDark ? '#0f172a' : '#f8fafc', panel: isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '#334155' : '#e2e8f0', axis: isDark ? '#475569' : '#94a3b8',
        grid: isDark ? '#1e293b' : '#f1f5f9', muted: isDark ? '#64748b' : '#94a3b8',
        text: isDark ? '#e2e8f0' : '#1e293b', xLine: isDark ? '#ffffff' : '#000000',
      }

      const W = containerRef.current?.clientWidth || 540
      const H = Math.round(W * 0.56)
      const pad = { t: 24, b: 24, l: 36, r: 12 }
      const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b
      const xDom = [-2 * Math.PI, 2 * Math.PI], yDom = [-4.5, 4.5]

      const xS = d3.scaleLinear().domain(xDom).range([pad.l, pad.l + iW])
      const yS = d3.scaleLinear().domain(yDom).range([pad.t + iH, pad.t])

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      // Grid
      for (let v = -4; v <= 4; v++) {
        svg.append('line').attr('x1', pad.l).attr('y1', yS(v)).attr('x2', pad.l + iW).attr('y2', yS(v)).attr('stroke', C.grid).attr('stroke-width', 1)
      }

      // Axes
      svg.append('line').attr('x1', pad.l).attr('y1', yS(0)).attr('x2', pad.l + iW).attr('y2', yS(0)).attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', xS(0)).attr('y1', pad.t).attr('x2', xS(0)).attr('y2', pad.t + iH).attr('stroke', C.axis).attr('stroke-width', 1.5)

      // x-axis tick labels (multiples of π/2)
      for (let k = -4; k <= 4; k++) {
        const v = k * Math.PI / 2
        const labels = { '-4': '-2π', '-3': '-3π/2', '-2': '-π', '-1': '-π/2', '0': '0', '1': 'π/2', '2': 'π', '3': '3π/2', '4': '2π' }
        svg.append('text').attr('x', xS(v)).attr('y', yS(0) + 13).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(labels[k])
      }

      // y-axis ticks
      for (let v = -4; v <= 4; v += 1) {
        if (v === 0) continue
        svg.append('text').attr('x', pad.l - 4).attr('y', yS(v) + 4).attr('text-anchor', 'end').attr('fill', C.muted).attr('font-size', 9).text(v)
      }

      // Asymptotes for tan/sec (at π/2 + kπ) and cot/csc (at kπ)
      const hasAsymTanSec = active.tan || active.sec
      const hasAsymCotCsc = active.cot || active.csc
      for (let k = -3; k <= 3; k++) {
        if (hasAsymTanSec) {
          const v = (k + 0.5) * Math.PI
          if (v >= xDom[0] && v <= xDom[1]) {
            svg.append('line').attr('x1', xS(v)).attr('y1', pad.t).attr('x2', xS(v)).attr('y2', pad.t + iH).attr('stroke', isDark ? '#fbbf24' : '#d97706').attr('stroke-width', 0.5).attr('stroke-dasharray', '4,4').attr('opacity', 0.5)
          }
        }
        if (hasAsymCotCsc && k !== 0) {
          const v = k * Math.PI
          if (v >= xDom[0] && v <= xDom[1]) {
            svg.append('line').attr('x1', xS(v)).attr('y1', pad.t).attr('x2', xS(v)).attr('y2', pad.t + iH).attr('stroke', isDark ? '#a78bfa' : '#7c3aed').attr('stroke-width', 0.5).attr('stroke-dasharray', '4,4').attr('opacity', 0.5)
          }
        }
      }

      // Trig curves
      Object.entries(active).forEach(([name, on]) => {
        if (!on) return
        const fn = fns[name]
        const col = isDark ? fn.col.dark : fn.col.light
        const rawData = d3.range(xDom[0], xDom[1], 0.02).map(x => [x, fn.f(x)])

        const lineGen = d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveMonotoneX).defined(d => d[1] !== null && d[1] >= yDom[0] && d[1] <= yDom[1])

        // Split at nulls
        let seg = []
        rawData.forEach((d, i) => {
          if (d[1] === null || d[1] < yDom[0] || d[1] > yDom[1]) {
            if (seg.length > 1) svg.append('path').datum(seg).attr('fill', 'none').attr('stroke', col).attr('stroke-width', 2).attr('d', lineGen)
            seg = []
          } else {
            seg.push(d)
          }
        })
        if (seg.length > 1) svg.append('path').datum(seg).attr('fill', 'none').attr('stroke', col).attr('stroke-width', 2).attr('d', lineGen)
      })

      // Draggable x-line
      const xVal = xRef.current
      svg.append('line').attr('x1', xS(xVal)).attr('y1', pad.t).attr('x2', xS(xVal)).attr('y2', pad.t + iH).attr('stroke', C.xLine).attr('stroke-width', 1).attr('stroke-dasharray', '3,3').attr('opacity', 0.4)

      // Value dots on each active curve
      Object.entries(active).forEach(([name, on]) => {
        if (!on) return
        const fn = fns[name]
        const val = fn.f(xVal)
        if (val !== null && val >= yDom[0] && val <= yDom[1]) {
          const col = isDark ? fn.col.dark : fn.col.light
          svg.append('circle').attr('cx', xS(xVal)).attr('cy', yS(val)).attr('r', 4).attr('fill', col).attr('stroke', C.bg).attr('stroke-width', 1.5)
        }
      })

      // Draggable handle
      svg.append('circle').attr('cx', xS(xVal)).attr('cy', pad.t + iH + 2).attr('r', 7).attr('fill', C.text).attr('stroke', C.bg).attr('stroke-width', 2).attr('cursor', 'ew-resize')
        .call(d3.drag().on('drag', (event) => {
          xRef.current = xS.invert(event.x)
          draw()
        }))

      svg.append('text').attr('x', xS(xVal)).attr('y', pad.t - 6).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(`x = ${xVal.toFixed(2)}`)
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [active, params.currentStep])

  const toggle = name => setActive(a => ({ ...a, [name]: !a[name] }))
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        {Object.entries(fns).map(([name, fn]) => {
          const col = isDark ? fn.col.dark : fn.col.light
          const on = active[name]
          return (
            <button key={name} onClick={() => toggle(name)} style={{ padding: '4px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontWeight: 600, border: `0.5px solid ${on ? col : 'var(--color-border-secondary)'}`, background: on ? col + '22' : 'transparent', color: on ? col : 'var(--color-text-tertiary)' }}>
              {name}
            </button>
          )
        })}
        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginLeft: 8, alignSelf: 'center' }}>drag white line to read values</span>
      </div>
    </div>
  )
}
