import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * TransformationBuilderViz
 * Sliders for a, b, h, k. Shows base f(x)=x² (grey) and g(x)=a·f(b(x-h))+k (colored).
 * Dark mode tokens. ResizeObserver for the SVG.
 */
export default function TransformationBuilderViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [a, setA] = useState(1)
  const [b, setB] = useState(1)
  const [h, setH] = useState(0)
  const [k, setK] = useState(0)

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:     isDark ? '#0f172a' : '#f8fafc',
        axis:   isDark ? '#475569' : '#cbd5e1',
        grid:   isDark ? '#1e293b' : '#f1f5f9',
        muted:  isDark ? '#64748b' : '#94a3b8',
        text:   isDark ? '#e2e8f0' : '#1e293b',
        base:   isDark ? '#334155' : '#cbd5e1',
        curve:  isDark ? '#38bdf8' : '#0284c7',
        ref:    isDark ? '#f97316' : '#ea580c',
        zero:   isDark ? '#475569' : '#94a3b8',
      }

      const W = containerRef.current?.clientWidth || 480
      const H = Math.round(W * 0.72)
      const pad = { t: 28, b: 28, l: 38, r: 16 }
      const iW = W - pad.l - pad.r
      const iH = H - pad.t - pad.b
      const xDom = [-5, 5], yDom = [-6, 10]

      const xS = d3.scaleLinear().domain(xDom).range([pad.l, pad.l + iW])
      const yS = d3.scaleLinear().domain(yDom).range([pad.t + iH, pad.t])

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      // Grid
      for (let i = xDom[0]; i <= xDom[1]; i++) {
        svg.append('line')
          .attr('x1', xS(i)).attr('y1', pad.t)
          .attr('x2', xS(i)).attr('y2', pad.t + iH)
          .attr('stroke', C.grid).attr('stroke-width', 1)
      }
      for (let i = yDom[0]; i <= yDom[1]; i++) {
        svg.append('line')
          .attr('x1', pad.l).attr('y1', yS(i))
          .attr('x2', pad.l + iW).attr('y2', yS(i))
          .attr('stroke', C.grid).attr('stroke-width', 1)
      }

      // Axes
      svg.append('line').attr('x1', pad.l).attr('y1', yS(0)).attr('x2', pad.l + iW).attr('y2', yS(0))
        .attr('stroke', C.axis).attr('stroke-width', 1.5)
      svg.append('line').attr('x1', xS(0)).attr('y1', pad.t).attr('x2', xS(0)).attr('y2', pad.t + iH)
        .attr('stroke', C.axis).attr('stroke-width', 1.5)

      // Tick labels
      for (let i = xDom[0]; i <= xDom[1]; i++) {
        if (i === 0) continue
        svg.append('text').attr('x', xS(i)).attr('y', yS(0) + 13)
          .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(i)
      }

      const lineGen = d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveMonotoneX)
        .defined(d => isFinite(d[1]) && d[1] >= yDom[0] && d[1] <= yDom[1])

      // Base curve f(x)=x²
      const baseData = d3.range(xDom[0], xDom[1] + 0.05, 0.05).map(x => [x, x * x])
      svg.append('path').datum(baseData).attr('fill', 'none')
        .attr('stroke', C.base).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
        .attr('d', lineGen)

      // Transformed g(x) = a·f(b·(x-h))+k = a·(b(x-h))²+k
      const gData = d3.range(xDom[0], xDom[1] + 0.05, 0.02).map(x => {
        const inner = b * (x - h)
        const y = a * inner * inner + k
        return [x, y]
      })
      svg.append('path').datum(gData).attr('fill', 'none')
        .attr('stroke', C.curve).attr('stroke-width', 2.5)
        .attr('d', lineGen)

      // Vertex marker
      const vx = h, vy = k
      if (vy >= yDom[0] && vy <= yDom[1]) {
        svg.append('circle').attr('cx', xS(vx)).attr('cy', yS(vy)).attr('r', 5)
          .attr('fill', C.ref).attr('stroke', C.bg).attr('stroke-width', 2)
        svg.append('text').attr('x', xS(vx) + 7).attr('y', yS(vy) - 6)
          .attr('fill', C.ref).attr('font-size', 10).attr('font-weight', 'bold')
          .text(`vertex (${vx}, ${vy})`)
      }

      // Equation label
      const aStr = a === 1 ? '' : a === -1 ? '-' : `${a}`
      const bStr = b === 1 ? '' : `${b}`
      const hStr = h === 0 ? 'x' : h > 0 ? `(x−${h})` : `(x+${Math.abs(h)})`
      const kStr = k === 0 ? '' : k > 0 ? `+${k}` : `${k}`
      svg.append('text')
        .attr('x', pad.l + iW - 4).attr('y', pad.t + 16)
        .attr('text-anchor', 'end').attr('fill', C.curve).attr('font-size', 12).attr('font-weight', 'bold')
        .text(`g(x) = ${aStr}(${bStr}${hStr})²${kStr}`)

      svg.append('text')
        .attr('x', pad.l + iW - 4).attr('y', pad.t + 30)
        .attr('text-anchor', 'end').attr('fill', C.base).attr('font-size', 11)
        .text('f(x) = x² (base)')
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [a, b, h, k, params.currentStep])

  const sliderStyle = { width: '100%', accentColor: '#38bdf8' }
  const labelStyle = { fontSize: 12, color: '#94a3b8', minWidth: 32 }
  const valueStyle = { fontSize: 12, fontWeight: 'bold', minWidth: 36, textAlign: 'right' }
  const rowStyle = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }
  const descStyle = { fontSize: 11, color: '#64748b' }

  const sliders = [
    { label: 'a', val: a, set: setA, min: -3, max: 3, step: 0.25, desc: 'vertical scale / reflect over x-axis' },
    { label: 'b', val: b, set: setB, min: -3, max: 3, step: 0.25, desc: 'horizontal scale / reflect over y-axis' },
    { label: 'h', val: h, set: setH, min: -4, max: 4, step: 0.5, desc: 'horizontal shift (right = +)' },
    { label: 'k', val: k, set: setK, min: -5, max: 8, step: 0.5, desc: 'vertical shift (up = +)' },
  ]

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      <div style={{ padding: '10px 4px 4px' }}>
        {sliders.map(({ label, val, set, min, max, step, desc }) => (
          <div key={label} style={rowStyle}>
            <span style={{ ...labelStyle, fontWeight: 'bold', color: '#38bdf8' }}>{label}</span>
            <input type="range" min={min} max={max} step={step} value={val}
              onChange={e => set(parseFloat(e.target.value))} style={sliderStyle} />
            <span style={valueStyle}>{val > 0 ? `+${val}` : val}</span>
            <span style={descStyle}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
