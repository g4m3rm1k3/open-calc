import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 600, H = 400
const M = { top: 20, right: 20, bottom: 40, left: 50 }

const PRESETS = [
  { label: 'y = √x (disk)', fn: Math.sqrt, a: 0, b: 4, axis: 'x', method: 'disk' },
  { label: 'y = x² (disk)', fn: x => x * x, a: 0, b: 1.5, axis: 'x', method: 'disk' },
  { label: 'y = sin(x) (disk)', fn: Math.sin, a: 0, b: Math.PI, axis: 'x', method: 'disk' },
  { label: 'y = 1/x (disk)', fn: x => 1 / x, a: 1, b: 4, axis: 'x', method: 'disk' },
  { label: 'x² and √x (washer)', fn: Math.sqrt, fn2: x => x * x, a: 0, b: 1, axis: 'x', method: 'washer' },
]

export default function VolumesOfRevolution({ params }) {
  const svgRef = useRef(null)
  const [presetIdx, setPresetIdx] = useState(0)
  const [numSlices, setNumSlices] = useState(10)
  const [showSolid, setShowSolid] = useState(true)

  const preset = PRESETS[presetIdx]

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { fn, fn2, a, b, method } = preset
    const xDom = [Math.min(a - 0.5, -0.5), b + 0.5]
    const xSc = d3.scaleLinear().domain(xDom).range([M.left, W - M.right])

    // Sample function for y range
    const step = (b - a) / 200
    const pts = []
    const pts2 = []
    for (let x = a; x <= b + step / 2; x += step) {
      const y = fn(x)
      if (isFinite(y)) pts.push([x, y])
      if (fn2) {
        const y2 = fn2(x)
        if (isFinite(y2)) pts2.push([x, y2])
      }
    }

    const allY = pts.map(p => p[1]).concat(pts2.map(p => p[1]))
    const yMax = Math.max(d3.max(allY) ?? 1, 0.5)
    const ySc = d3.scaleLinear().domain([-yMax * 1.1, yMax * 1.1]).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(6).forEach(t => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(6).forEach(t => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes
    svg.append('g').attr('transform', `translate(0,${ySc(0)})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${xSc(0)},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    // Draw the revolution "disks" / "washers"
    if (showSolid) {
      const dx = (b - a) / numSlices
      for (let i = 0; i < numSlices; i++) {
        const xMid = a + (i + 0.5) * dx
        const R = Math.abs(fn(xMid))
        const xLeft = xSc(a + i * dx)
        const xRight = xSc(a + (i + 1) * dx)
        const sliceW = xRight - xLeft

        if (method === 'washer' && fn2) {
          const r = Math.abs(fn2(xMid))
          // Outer ellipse (top half)
          svg.append('ellipse')
            .attr('cx', (xLeft + xRight) / 2).attr('cy', ySc(0))
            .attr('rx', sliceW / 2).attr('ry', Math.abs(ySc(R) - ySc(0)))
            .attr('fill', '#6470f1').attr('fill-opacity', 0.15)
            .attr('stroke', '#6470f1').attr('stroke-width', 0.5).attr('stroke-opacity', 0.4)
          // Inner ellipse (hole)
          svg.append('ellipse')
            .attr('cx', (xLeft + xRight) / 2).attr('cy', ySc(0))
            .attr('rx', sliceW / 2).attr('ry', Math.abs(ySc(r) - ySc(0)))
            .attr('fill', 'white').attr('fill-opacity', 0.8)
            .attr('stroke', '#ef4444').attr('stroke-width', 0.5).attr('stroke-opacity', 0.4)
        } else {
          // Disk: draw as an ellipse centered on x-axis
          svg.append('ellipse')
            .attr('cx', (xLeft + xRight) / 2).attr('cy', ySc(0))
            .attr('rx', sliceW / 2).attr('ry', Math.abs(ySc(R) - ySc(0)))
            .attr('fill', '#6470f1').attr('fill-opacity', 0.15)
            .attr('stroke', '#6470f1').attr('stroke-width', 0.5).attr('stroke-opacity', 0.5)
        }
      }
    }

    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y))

    // Draw curves (upper and lower — the reflected curve for revolution)
    // Upper curve
    svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', line)
    // Reflected curve
    const reflectedPts = pts.map(([x, y]) => [x, -y])
    svg.append('path').datum(reflectedPts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('stroke-dasharray', '4,3').attr('d', line)

    if (fn2) {
      svg.append('path').datum(pts2).attr('fill', 'none').attr('stroke', '#ef4444').attr('stroke-width', 2.5).attr('d', line)
      const reflected2 = pts2.map(([x, y]) => [x, -y])
      svg.append('path').datum(reflected2).attr('fill', 'none').attr('stroke', '#ef4444').attr('stroke-width', 2.5).attr('stroke-dasharray', '4,3').attr('d', line)
    }

    // Shade region
    const area = d3.area()
      .x(([x]) => xSc(x))
      .y0(([, y]) => ySc(-y))
      .y1(([, y]) => ySc(y))
    svg.append('path').datum(pts).attr('fill', '#6470f1').attr('fill-opacity', 0.06).attr('d', area)

    // Volume label
    let volume = 0
    const dx = (b - a) / 500
    for (let x = a; x <= b; x += dx) {
      const R = fn(x)
      if (method === 'washer' && fn2) {
        const r = fn2(x)
        volume += Math.PI * (R * R - r * r) * dx
      } else {
        volume += Math.PI * R * R * dx
      }
    }
    svg.append('text')
      .attr('x', M.left + 10).attr('y', M.top + 18)
      .attr('font-size', 13).attr('fill', '#334155').attr('font-weight', 'bold')
      .text(`V ≈ ${volume.toFixed(3)} (π × ${(volume / Math.PI).toFixed(3)})`)

  }, [presetIdx, numSlices, showSolid, preset])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3 px-2">
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => setPresetIdx(i)}
            className={`px-2 py-1 rounded text-xs transition-colors ${i === presetIdx ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >{p.label}</button>
        ))}
      </div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <SliderControl label={`Slices: ${numSlices}`} min={3} max={40} step={1} value={numSlices} onChange={setNumSlices} />
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
          <input type="checkbox" checked={showSolid} onChange={e => setShowSolid(e.target.checked)} className="rounded" />
          Show cross-section disks
        </label>
      </div>
    </div>
  )
}
