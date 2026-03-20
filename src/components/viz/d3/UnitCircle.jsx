import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 420, H = 420
const CX = W / 2, CY = H / 2, R = 160

const NOTABLE = [
  { angle: 0,          label: '0',       cos: 1,            sin: 0,           frac: '1' },
  { angle: Math.PI/6,  label: 'π/6',     cos: Math.sqrt(3)/2, sin: 0.5,       frac: '(√3/2, 1/2)' },
  { angle: Math.PI/4,  label: 'π/4',     cos: Math.sqrt(2)/2, sin: Math.sqrt(2)/2, frac: '(√2/2, √2/2)' },
  { angle: Math.PI/3,  label: 'π/3',     cos: 0.5,          sin: Math.sqrt(3)/2, frac: '(1/2, √3/2)' },
  { angle: Math.PI/2,  label: 'π/2',     cos: 0,            sin: 1,           frac: '' },
  { angle: 2*Math.PI/3,label: '2π/3',    cos: -0.5,         sin: Math.sqrt(3)/2, frac: '' },
  { angle: 3*Math.PI/4,label: '3π/4',    cos: -Math.sqrt(2)/2, sin: Math.sqrt(2)/2, frac: '' },
  { angle: 5*Math.PI/6,label: '5π/6',    cos: -Math.sqrt(3)/2, sin: 0.5,     frac: '' },
  { angle: Math.PI,    label: 'π',       cos: -1,           sin: 0,           frac: '' },
  { angle: 7*Math.PI/6,label: '7π/6',    cos: -Math.sqrt(3)/2, sin: -0.5,    frac: '' },
  { angle: 5*Math.PI/4,label: '5π/4',    cos: -Math.sqrt(2)/2, sin: -Math.sqrt(2)/2, frac: '' },
  { angle: 4*Math.PI/3,label: '4π/3',    cos: -0.5,         sin: -Math.sqrt(3)/2, frac: '' },
  { angle: 3*Math.PI/2,label: '3π/2',    cos: 0,            sin: -1,          frac: '' },
  { angle: 5*Math.PI/3,label: '5π/3',    cos: 0.5,          sin: -Math.sqrt(3)/2, frac: '' },
  { angle: 7*Math.PI/4,label: '7π/4',    cos: Math.sqrt(2)/2, sin: -Math.sqrt(2)/2, frac: '' },
  { angle: 11*Math.PI/6,label: '11π/6',  cos: Math.sqrt(3)/2, sin: -0.5,     frac: '' },
]

export default function UnitCircle({ params }) {
  const svgRef = useRef(null)
  const [angle, setAngle] = useState(Math.PI / 3)
  const { showTable } = params ?? {}

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const px = CX + R * cos
    const py = CY - R * sin  // SVG y is flipped

    // Axes
    svg.append('line').attr('x1', CX - R - 20).attr('x2', CX + R + 20).attr('y1', CY).attr('y2', CY).attr('stroke', '#94a3b8').attr('stroke-width', 1.5)
    svg.append('line').attr('x1', CX).attr('x2', CX).attr('y1', CY - R - 20).attr('y2', CY + R + 20).attr('stroke', '#94a3b8').attr('stroke-width', 1.5)

    // Unit circle
    svg.append('circle').attr('cx', CX).attr('cy', CY).attr('r', R).attr('fill', 'none').attr('stroke', '#cbd5e1').attr('stroke-width', 1.5)

    // Notable angles (small dots)
    NOTABLE.forEach((n) => {
      const nx = CX + R * Math.cos(n.angle)
      const ny = CY - R * Math.sin(n.angle)
      svg.append('circle').attr('cx', nx).attr('cy', ny).attr('r', 3).attr('fill', '#94a3b8')
      const labelR = R + 20
      const lx = CX + labelR * Math.cos(n.angle)
      const ly = CY - labelR * Math.sin(n.angle)
      svg.append('text').attr('x', lx).attr('y', ly).attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('font-size', 9).attr('fill', '#94a3b8').text(n.label)
    })

    // cos line (horizontal)
    svg.append('line').attr('x1', CX).attr('x2', px).attr('y1', CY).attr('y2', CY).attr('stroke', '#10b981').attr('stroke-width', 2).attr('stroke-dasharray', '4,3')
    // sin line (vertical)
    svg.append('line').attr('x1', px).attr('x2', px).attr('y1', CY).attr('y2', py).attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('stroke-dasharray', '4,3')
    // Radius
    svg.append('line').attr('x1', CX).attr('x2', px).attr('y1', CY).attr('y2', py).attr('stroke', '#6470f1').attr('stroke-width', 2.5)
    // Arc for angle
    const arcGen = d3.arc().innerRadius(0).outerRadius(28).startAngle(-angle).endAngle(0)
    svg.append('path').attr('transform', `translate(${CX},${CY})`).attr('d', arcGen()).attr('fill', '#6470f1').attr('opacity', 0.2)

    // Point on circle
    svg.append('circle').attr('cx', px).attr('cy', py).attr('r', 6).attr('fill', '#6470f1')

    // Labels
    svg.append('text').attr('x', (CX + px) / 2).attr('y', CY + 16).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#10b981').attr('font-weight', 600)
      .text(`cos θ = ${cos.toFixed(3)}`)
    svg.append('text').attr('x', px + (cos > 0 ? 8 : -8)).attr('y', (CY + py) / 2).attr('text-anchor', cos > 0 ? 'start' : 'end').attr('font-size', 12).attr('fill', '#f59e0b').attr('font-weight', 600)
      .text(`sin θ = ${sin.toFixed(3)}`)

    // Angle label
    svg.append('text').attr('x', CX + 36).attr('y', CY - 8).attr('font-size', 13).attr('fill', '#6470f1').attr('font-style', 'italic')
      .text(`θ = ${(angle / Math.PI).toFixed(3)}π`)

    // Origin
    svg.append('circle').attr('cx', CX).attr('cy', CY).attr('r', 3).attr('fill', '#64748b')
    svg.append('text').attr('x', CX - 8).attr('y', CY + 14).attr('font-size', 10).attr('fill', '#64748b').text('O')

  }, [angle])

  return (
    <div>
      <div className="flex justify-center">
        <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W }} />
      </div>
      <div className="mt-2 px-4">
        <SliderControl
          label="Angle θ (radians)"
          min={0}
          max={2 * Math.PI}
          step={0.01}
          value={angle}
          onChange={setAngle}
          format={(v) => `${(v / Math.PI).toFixed(3)}π`}
        />
      </div>
      {showTable && (
        <div className="mt-4 overflow-x-auto">
          <table className="text-xs mx-auto border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                <th className="px-3 py-1 border border-slate-200 dark:border-slate-700">θ</th>
                <th className="px-3 py-1 border border-slate-200 dark:border-slate-700">cos θ</th>
                <th className="px-3 py-1 border border-slate-200 dark:border-slate-700">sin θ</th>
                <th className="px-3 py-1 border border-slate-200 dark:border-slate-700">tan θ</th>
              </tr>
            </thead>
            <tbody>
              {[0, Math.PI/6, Math.PI/4, Math.PI/3, Math.PI/2, Math.PI, 3*Math.PI/2].map((a, i) => {
                const c = Math.cos(a), s = Math.sin(a), t = s / c
                const labels = ['0', 'π/6', 'π/4', 'π/3', 'π/2', 'π', '3π/2']
                const fmt = (v) => Math.abs(v) < 1e-10 ? '0' : Math.abs(Math.abs(v) - 1) < 1e-10 ? (v < 0 ? '−1' : '1') : v.toFixed(4)
                return (
                  <tr key={i} className="even:bg-slate-50 dark:even:bg-slate-800/40">
                    <td className="px-3 py-1 border border-slate-200 dark:border-slate-700 font-mono text-center">{labels[i]}</td>
                    <td className="px-3 py-1 border border-slate-200 dark:border-slate-700 font-mono text-center text-emerald-600">{fmt(c)}</td>
                    <td className="px-3 py-1 border border-slate-200 dark:border-slate-700 font-mono text-center text-amber-600">{fmt(s)}</td>
                    <td className="px-3 py-1 border border-slate-200 dark:border-slate-700 font-mono text-center text-blue-600">{!isFinite(t) ? 'undef.' : fmt(t)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

