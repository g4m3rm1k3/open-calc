import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 600, H = 380
const M = { top: 20, right: 24, bottom: 60, left: 55 }
const UNROLL_Y = H - 16   // y-position of the unrolled line

const FUNCTIONS = [
  { label: 'y = x²',       fn: x => x * x,              df: x => 2 * x,              a: 0, b: 1.5 },
  { label: 'y = sin(x)',   fn: x => Math.sin(x),          df: x => Math.cos(x),        a: 0, b: Math.PI },
  { label: 'y = x^(3/2)', fn: x => Math.pow(x, 1.5),    df: x => 1.5 * Math.sqrt(x), a: 0, b: 2 },
  { label: 'y = ln(x)+1', fn: x => Math.log(x) + 1,     df: x => 1 / x,              a: 1, b: 3 },
]

function arcLength(df, a, b, n = 2000) {
  const dx = (b - a) / n
  let L = 0
  for (let i = 0; i < n; i++) {
    const x = a + (i + 0.5) * dx
    L += Math.sqrt(1 + df(x) ** 2) * dx
  }
  return L
}

export default function ArcLengthViz({ params }) {
  const svgRef = useRef(null)
  const [fnIdx, setFnIdx] = useState(0)
  const [nSeg, setNSeg] = useState(10)
  const [highlight, setHighlight] = useState(3)

  const { fn, df, a, b } = FUNCTIONS[fnIdx]

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Scales — leave room for unrolled line at bottom
    const graphH = H - M.bottom - 24
    const xSc = d3.scaleLinear().domain([a, b]).range([M.left, W - M.right])

    const step = (b - a) / 300
    const pts = []
    for (let x = a; x <= b + step / 2; x += step) {
      const y = fn(x)
      if (isFinite(y)) pts.push([x, y])
    }
    const yVals = pts.map(p => p[1])
    const [yMin, yMax] = d3.extent(yVals)
    const yPad = Math.max((yMax - yMin) * 0.2, 0.3)
    const ySc = d3.scaleLinear().domain([yMin - yPad, yMax + yPad]).range([M.top + graphH, M.top])

    // Grid
    xSc.ticks(6).forEach(t => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', M.top + graphH).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(5).forEach(t => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes
    svg.append('g').attr('transform', `translate(0,${ySc(0) < M.top + graphH ? ySc(0) : M.top + graphH})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${M.left},0)`).call(d3.axisLeft(ySc).ticks(5)).attr('color', '#94a3b8')

    // True arc length
    const L = arcLength(df, a, b)

    // Segment endpoints
    const xs = d3.range(nSeg + 1).map(i => a + i * (b - a) / nSeg)
    const segs = xs.map(x => [x, fn(x)])

    // Draw tangent segments (colored red)
    for (let i = 0; i < nSeg; i++) {
      const [x0, y0] = segs[i]
      const [x1, y1] = segs[i + 1]
      const isHl = i === highlight
      svg.append('line')
        .attr('x1', xSc(x0)).attr('y1', ySc(y0))
        .attr('x2', xSc(x1)).attr('y2', ySc(y1))
        .attr('stroke', isHl ? '#f59e0b' : '#ef4444')
        .attr('stroke-width', isHl ? 3 : 1.5)
        .attr('stroke-opacity', isHl ? 1 : 0.7)
        .style('cursor', 'pointer')
        .on('click', () => setHighlight(i))
    }

    // Highlighted segment — show dx, dy, ds triangle
    const hi = Math.min(highlight, nSeg - 1)
    const [hx0, hy0] = segs[hi]
    const [hx1, hy1] = segs[hi + 1]
    const px0 = xSc(hx0), py0 = ySc(hy0), px1 = xSc(hx1), py1 = ySc(hy1)
    // dx line
    svg.append('line').attr('x1', px0).attr('y1', py0).attr('x2', px1).attr('y2', py0).attr('stroke', '#10b981').attr('stroke-width', 2).attr('stroke-dasharray', '5,3')
    // dy line
    svg.append('line').attr('x1', px1).attr('y1', py0).attr('x2', px1).attr('y2', py1).attr('stroke', '#6366f1').attr('stroke-width', 2).attr('stroke-dasharray', '5,3')
    const midX = (px0 + px1) / 2
    svg.append('text').attr('x', midX).attr('y', py0 + 14).attr('font-size', 10).attr('fill', '#10b981').attr('text-anchor', 'middle').text('dx')
    svg.append('text').attr('x', px1 + 8).attr('y', (py0 + py1) / 2).attr('font-size', 10).attr('fill', '#6366f1').text('dy')
    svg.append('text').attr('x', midX - 8).attr('y', (py0 + py1) / 2 - 4).attr('font-size', 10).attr('fill', '#f59e0b').attr('font-weight', 'bold').text('ds')

    // Curve
    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y)).curve(d3.curveCatmullRom)
    svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', '#6366f1').attr('stroke-width', 2).attr('stroke-opacity', 0.35).attr('d', line)

    // Dots at segment endpoints
    segs.forEach(([x, y]) => {
      svg.append('circle').attr('cx', xSc(x)).attr('cy', ySc(y)).attr('r', 3).attr('fill', '#ef4444').attr('stroke', 'white').attr('stroke-width', 1)
    })

    // Approx arc length
    let Lapprox = 0
    for (let i = 0; i < nSeg; i++) {
      const dx = segs[i + 1][0] - segs[i][0]
      const dy = segs[i + 1][1] - segs[i][1]
      Lapprox += Math.sqrt(dx * dx + dy * dy)
    }

    // Unrolled line
    const lineY = M.top + graphH + 36
    svg.append('line').attr('x1', M.left).attr('x2', M.left + xSc(b) - xSc(a)).attr('y1', lineY).attr('y2', lineY).attr('stroke', '#94a3b8').attr('stroke-width', 1).attr('stroke-dasharray', '4,3')
    svg.append('line').attr('x1', M.left).attr('x2', M.left + (Lapprox / L) * (xSc(b) - xSc(a))).attr('y1', lineY).attr('y2', lineY).attr('stroke', '#ef4444').attr('stroke-width', 4)
    svg.append('text').attr('x', M.left).attr('y', lineY - 5).attr('font-size', 10).attr('fill', '#ef4444').text(`Approx: ${Lapprox.toFixed(4)}`)
    svg.append('text').attr('x', M.left).attr('y', lineY + 14).attr('font-size', 10).attr('fill', '#64748b').text(`True L ≈ ${L.toFixed(4)}`)

    // Formula
    svg.append('text').attr('x', W - M.right).attr('y', M.top + 16).attr('text-anchor', 'end').attr('font-size', 12).attr('fill', '#334155').attr('font-weight', 'bold')
      .text(`L ≈ Σ√(1+(f′)²)Δx ≈ ${Lapprox.toFixed(4)}`)

  }, [fn, df, a, b, nSeg, highlight])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3 px-2">
        {FUNCTIONS.map((f, i) => (
          <button key={i} onClick={() => { setFnIdx(i); setHighlight(3) }}
            className={`px-2 py-1 rounded text-xs transition-colors ${i === fnIdx ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >{f.label}</button>
        ))}
      </div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2">
        <SliderControl label={`Segments: ${nSeg}`} min={2} max={50} step={1} value={nSeg} onChange={setNSeg} />
      </div>
      <p className="text-xs text-center mt-2 text-slate-500 dark:text-slate-400">
        Red segments approximate the arc. Click a segment to highlight its dx/dy/ds triangle. Red bar = approx length.
      </p>
    </div>
  )
}
