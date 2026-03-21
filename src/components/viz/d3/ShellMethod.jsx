import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 600, H = 380
const M = { top: 20, right: 30, bottom: 44, left: 55 }

const FUNCTIONS = [
  { label: 'y = x²',      fn: x => x * x,              a: 0, b: 1.5 },
  { label: 'y = √x',      fn: x => Math.sqrt(x),        a: 0, b: 2 },
  { label: 'y = sin(x)',  fn: x => Math.sin(x),          a: 0, b: Math.PI },
  { label: 'y = x(2−x)', fn: x => x * (2 - x),          a: 0, b: 2 },
]

const AXES = [
  { label: 'x = 0 (y-axis)', offset: 0 },
  { label: 'x = −1',         offset: -1 },
]

function numericalVolume(fn, a, b, axisX, n = 1000) {
  const dx = (b - a) / n
  let vol = 0
  for (let i = 0; i < n; i++) {
    const x = a + (i + 0.5) * dx
    const radius = Math.abs(x - axisX)
    const height = Math.max(fn(x), 0)
    vol += 2 * Math.PI * radius * height * dx
  }
  return vol
}

export default function ShellMethod({ params }) {
  const svgRef = useRef(null)
  const [fnIdx, setFnIdx] = useState(0)
  const [axisIdx, setAxisIdx] = useState(0)
  const [nShells, setNShells] = useState(8)

  const { fn, a, b } = FUNCTIONS[fnIdx]
  const axisX = AXES[axisIdx].offset

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xPad = 0.4
    const xDomain = [Math.min(axisX - 0.3, a - xPad), b + xPad]
    const xSc = d3.scaleLinear().domain(xDomain).range([M.left, W - M.right])

    const step = (b - a) / 200
    const pts = []
    for (let x = a; x <= b + step / 2; x += step) {
      const y = fn(x)
      if (isFinite(y) && y >= 0) pts.push([x, y])
    }
    const yMax = Math.max(d3.max(pts, p => p[1]) ?? 1, 0.5)
    const ySc = d3.scaleLinear().domain([0, yMax * 1.15]).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(6).forEach(t => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(5).forEach(t => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes
    svg.append('g').attr('transform', `translate(0,${ySc(0)})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${M.left},0)`).call(d3.axisLeft(ySc).ticks(5)).attr('color', '#94a3b8')

    // Axis of rotation
    const axPx = xSc(axisX)
    svg.append('line').attr('x1', axPx).attr('x2', axPx).attr('y1', M.top).attr('y2', H - M.bottom)
      .attr('stroke', '#ef4444').attr('stroke-width', 2).attr('stroke-dasharray', '8,4')
    svg.append('text').attr('x', axPx + 4).attr('y', M.top + 14).attr('font-size', 11).attr('fill', '#ef4444').text(`x = ${axisX}`)

    // Color scale for shells (rainbow by radius)
    const colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([0, nShells])

    // Shells
    const dx = (b - a) / nShells
    for (let i = 0; i < nShells; i++) {
      const x0 = a + i * dx
      const x1 = a + (i + 1) * dx
      const xMid = (x0 + x1) / 2
      const h = Math.max(fn(xMid), 0)
      const color = colorScale(i)

      svg.append('rect')
        .attr('x', xSc(x0)).attr('y', ySc(h))
        .attr('width', Math.max(xSc(x1) - xSc(x0), 1))
        .attr('height', Math.max(ySc(0) - ySc(h), 1))
        .attr('fill', color).attr('fill-opacity', 0.35)
        .attr('stroke', color).attr('stroke-width', 1)
    }

    // Curve
    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y)).curve(d3.curveCatmullRom)
    svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', '#6366f1').attr('stroke-width', 2.5).attr('d', line)

    // Label on last shell
    const lastX = a + (nShells - 0.5) * dx
    const lastH = fn(lastX)
    if (isFinite(lastH) && lastH > 0) {
      const lx = xSc(a + (nShells - 1) * dx)
      const lx2 = xSc(a + nShells * dx)
      const ly = ySc(lastH / 2)
      svg.append('text').attr('x', (lx + lx2) / 2 + 4).attr('y', ly - 6).attr('font-size', 10).attr('fill', '#6366f1').text(`h=f(x)`)
      svg.append('text').attr('x', (lx + lx2) / 2 + 4).attr('y', ly + 10).attr('font-size', 10).attr('fill', '#6366f1').text(`r=|x−${axisX}|`)
    }

    // Volume label
    const vol = numericalVolume(fn, a, b, axisX)
    svg.append('text').attr('x', M.left + 8).attr('y', M.top + 18)
      .attr('font-size', 13).attr('fill', '#334155').attr('font-weight', 'bold')
      .text(`V ≈ ${vol.toFixed(4)}  (= ${(vol / Math.PI).toFixed(4)}π)`)

    svg.append('text').attr('x', W / 2).attr('y', H - 2).attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#64748b').text('x')
  }, [fn, a, b, axisX, nShells])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2 px-2">
        {FUNCTIONS.map((f, i) => (
          <button key={i} onClick={() => setFnIdx(i)}
            className={`px-2 py-1 rounded text-xs transition-colors ${i === fnIdx ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >{f.label}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-3 px-2">
        {AXES.map((ax, i) => (
          <button key={i} onClick={() => setAxisIdx(i)}
            className={`px-2 py-1 rounded text-xs transition-colors ${i === axisIdx ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >Axis: {ax.label}</button>
        ))}
      </div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2">
        <SliderControl label={`Shells: ${nShells}`} min={3} max={20} step={1} value={nShells} onChange={setNShells} />
      </div>
      <p className="text-xs text-center mt-2 text-slate-500 dark:text-slate-400">
        V = 2π ∫ r · h dx. Red dashed = axis of rotation. Colors show shell radius.
      </p>
    </div>
  )
}
