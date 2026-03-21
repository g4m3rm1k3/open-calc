import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 500, H = 500
const CX = W / 2, CY = H / 2
const R_MAX = 200

const CURVES = {
  'cardioid':      { fn: t => 1 + Math.cos(t),       label: 'r = 1 + cos θ',   rScale: 1 },
  'rose (3)':      { fn: t => Math.cos(3 * t),        label: 'r = cos 3θ',      rScale: 1 },
  'rose (4)':      { fn: t => Math.sin(4 * t),        label: 'r = sin 4θ',      rScale: 1 },
  'limaçon':       { fn: t => 1 + 2 * Math.cos(t),    label: 'r = 1 + 2cos θ',  rScale: 0.6 },
  'lemniscate':    { fn: t => { const v = Math.cos(2 * t); return v >= 0 ? Math.sqrt(v) : null }, label: 'r² = cos 2θ', rScale: 1 },
  'spiral':        { fn: t => 0.15 * t,                label: 'r = 0.15θ',       rScale: 1 },
  'circle':        { fn: () => 1,                      label: 'r = 1',           rScale: 1 },
  'butterfly':     { fn: t => Math.exp(Math.sin(t)) - 2 * Math.cos(4 * t) + Math.pow(Math.sin((2 * t - Math.PI) / 24), 5), label: 'butterfly', rScale: 0.4 },
}

export default function PolarCurve({ params }) {
  const svgRef = useRef(null)
  const { preset: initPreset = 'cardioid' } = params ?? {}
  const [curveKey, setCurveKey] = useState(initPreset)
  const [thetaMax, setThetaMax] = useState(2 * Math.PI)

  const curve = CURVES[curveKey] ?? CURVES['cardioid']

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const maxTheta = curveKey === 'spiral' ? Math.max(thetaMax, 4 * Math.PI) : thetaMax

    // Sample points
    const pts = []
    const step = maxTheta / 1000
    let maxR = 0
    for (let t = 0; t <= maxTheta; t += step) {
      const r = curve.fn(t)
      if (r === null || !isFinite(r)) continue
      maxR = Math.max(maxR, Math.abs(r))
      pts.push({ theta: t, r })
    }

    const scale = maxR > 0 ? R_MAX * curve.rScale / maxR : 1

    // Polar grid
    const gridR = [0.25, 0.5, 0.75, 1].map(f => f * maxR)
    gridR.forEach(r => {
      svg.append('circle')
        .attr('cx', CX).attr('cy', CY).attr('r', r * scale)
        .attr('fill', 'none').attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })

    // Angle lines
    for (let a = 0; a < 2 * Math.PI; a += Math.PI / 6) {
      svg.append('line')
        .attr('x1', CX).attr('y1', CY)
        .attr('x2', CX + R_MAX * Math.cos(a)).attr('y2', CY - R_MAX * Math.sin(a))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    }

    // Angle labels
    const angleLabels = ['0', 'π/6', 'π/3', 'π/2', '2π/3', '5π/6', 'π', '7π/6', '4π/3', '3π/2', '5π/3', '11π/6']
    angleLabels.forEach((label, i) => {
      const a = i * Math.PI / 6
      svg.append('text')
        .attr('x', CX + (R_MAX + 18) * Math.cos(a))
        .attr('y', CY - (R_MAX + 18) * Math.sin(a))
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
        .attr('font-size', 9).attr('fill', '#94a3b8')
        .text(label)
    })

    // Draw curve
    const lineData = pts.map(p => {
      const x = CX + p.r * scale * Math.cos(p.theta)
      const y = CY - p.r * scale * Math.sin(p.theta)
      return [x, y]
    })

    const line = d3.line().x(d => d[0]).y(d => d[1])
    svg.append('path')
      .datum(lineData)
      .attr('fill', 'none')
      .attr('stroke', '#6470f1')
      .attr('stroke-width', 2.5)
      .attr('d', line)

    // Fill for closed curves (not spiral)
    if (curveKey !== 'spiral' && curveKey !== 'butterfly' && pts.length > 2) {
      const areaData = [{ theta: 0, r: 0 }, ...pts, { theta: pts[pts.length - 1].theta, r: 0 }]
        .map(p => {
          const x = CX + p.r * scale * Math.cos(p.theta)
          const y = CY - p.r * scale * Math.sin(p.theta)
          return [x, y]
        })
      svg.append('path')
        .datum(areaData)
        .attr('fill', '#6470f1')
        .attr('fill-opacity', 0.08)
        .attr('d', d3.line().x(d => d[0]).y(d => d[1]))
    }

    // Origin
    svg.append('circle').attr('cx', CX).attr('cy', CY).attr('r', 3).attr('fill', '#334155')

    // Axes labels
    svg.append('text').attr('x', CX + R_MAX + 4).attr('y', CY + 4).attr('font-size', 11).attr('fill', '#64748b').text('x')
    svg.append('text').attr('x', CX + 4).attr('y', CY - R_MAX - 4).attr('font-size', 11).attr('fill', '#64748b').text('y')

  }, [curveKey, thetaMax, curve])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3 px-2">
        {Object.keys(CURVES).map(k => (
          <button key={k} onClick={() => { setCurveKey(k); if (k === 'spiral') setThetaMax(6 * Math.PI) }}
            className={`px-2 py-1 rounded text-xs transition-colors ${k === curveKey ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >{CURVES[k].label}</button>
        ))}
      </div>
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
      <div className="px-4 mt-2">
        <SliderControl
          label={`θ max: ${(thetaMax / Math.PI).toFixed(1)}π`}
          min={0.1} max={curveKey === 'spiral' ? 8 * Math.PI : 2 * Math.PI}
          step={0.05} value={thetaMax} onChange={setThetaMax}
        />
      </div>
      <p className="text-xs text-center mt-1 text-slate-500 dark:text-slate-400">
        Drag θ to trace the curve. The angle sweeps counterclockwise from the positive x-axis.
      </p>
    </div>
  )
}
