import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'

const W = 600, H = 380
const M = { top: 20, right: 24, bottom: 44, left: 55 }

const REGIONS = [
  {
    label: 'y = √x on [0,4]',
    fn: x => Math.sqrt(x), fnBot: () => 0, a: 0, b: 4,
    xBar: () => { // ∫x·f dx / ∫f dx
      const n = 1000; const dx = 4 / n; let A = 0, Mx = 0, My = 0
      for (let i = 0; i < n; i++) { const x = (i + 0.5) * dx; const y = Math.sqrt(x); A += y * dx; Mx += x * y * dx; My += 0.5 * y * y * dx }
      return { xBar: Mx / A, yBar: My / A, area: A }
    },
  },
  {
    label: 'y = x² on [0,2]',
    fn: x => x * x, fnBot: () => 0, a: 0, b: 2,
    xBar: () => {
      const n = 1000; const dx = 2 / n; let A = 0, Mx = 0, My = 0
      for (let i = 0; i < n; i++) { const x = (i + 0.5) * dx; const y = x * x; A += y * dx; Mx += x * y * dx; My += 0.5 * y * y * dx }
      return { xBar: Mx / A, yBar: My / A, area: A }
    },
  },
  {
    label: 'Semicircle r=2',
    fn: x => Math.sqrt(Math.max(0, 4 - x * x)), fnBot: () => 0, a: -2, b: 2,
    xBar: () => ({ xBar: 0, yBar: 4 / (3 * Math.PI) * 2, area: 2 * Math.PI }),
  },
  {
    label: 'Triangle (0,0)–(3,0)–(0,2)',
    fn: x => Math.max(0, 2 - (2 / 3) * x), fnBot: () => 0, a: 0, b: 3,
    xBar: () => ({ xBar: 1, yBar: 2 / 3, area: 3 }),
  },
]

export default function CentroidViz({ params }) {
  const svgRef = useRef(null)
  const [regionIdx, setRegionIdx] = useState(0)
  const [showStrips, setShowStrips] = useState(false)
  const [clickPt, setClickPt] = useState(null)

  const region = REGIONS[regionIdx]
  const { fn, fnBot, a, b } = region
  const { xBar, yBar, area } = region.xBar()

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xPad = (b - a) * 0.15
    const xDomain = [a - xPad, b + xPad]
    const xSc = d3.scaleLinear().domain(xDomain).range([M.left, W - M.right])

    const step = (b - a) / 200
    const pts = [], ptsBot = []
    for (let x = a; x <= b + step / 2; x += step) {
      const y = fn(x); if (isFinite(y)) pts.push([x, y])
      const yb = fnBot(x); if (isFinite(yb)) ptsBot.push([x, yb])
    }
    const yMax = Math.max(d3.max(pts, p => p[1]) ?? 1, 0.5)
    const ySc = d3.scaleLinear().domain([-yMax * 0.15, yMax * 1.2]).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(6).forEach(t => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(5).forEach(t => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes
    svg.append('g').attr('transform', `translate(0,${ySc(0)})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${M.left},0)`).call(d3.axisLeft(ySc).ticks(5)).attr('color', '#94a3b8')

    // Moment strips
    if (showStrips) {
      const nStrips = 16
      const dx = (b - a) / nStrips
      for (let i = 0; i < nStrips; i++) {
        const x = a + (i + 0.5) * dx
        const y = fn(x)
        if (!isFinite(y)) continue
        // Vertical strip (for x̄)
        svg.append('rect').attr('x', xSc(a + i * dx)).attr('y', ySc(y))
          .attr('width', xSc(a + (i + 1) * dx) - xSc(a + i * dx))
          .attr('height', Math.max(ySc(0) - ySc(y), 1))
          .attr('fill', '#6366f1').attr('fill-opacity', 0.12).attr('stroke', '#6366f1').attr('stroke-width', 0.5)
        // Horizontal mid-point (for ȳ)
        svg.append('circle').attr('cx', xSc(x)).attr('cy', ySc(y / 2)).attr('r', 2).attr('fill', '#10b981').attr('opacity', 0.5)
      }
    }

    // Filled region
    const areaFn = d3.area().x(([x]) => xSc(x)).y0(() => ySc(0)).y1(([, y]) => ySc(y))
    svg.append('path').datum(pts).attr('fill', '#6366f1').attr('fill-opacity', 0.15).attr('d', areaFn)

    // Curve
    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y))
    svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', '#6366f1').attr('stroke-width', 2.5).attr('d', line)

    // Centroid crosshairs
    const cx = xSc(xBar), cy = ySc(yBar)
    svg.append('line').attr('x1', cx).attr('x2', cx).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#f59e0b').attr('stroke-width', 1.5).attr('stroke-dasharray', '6,4')
    svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', cy).attr('y2', cy).attr('stroke', '#f59e0b').attr('stroke-width', 1.5).attr('stroke-dasharray', '6,4')
    svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 8).attr('fill', '#f59e0b').attr('stroke', 'white').attr('stroke-width', 2)
    svg.append('text').attr('x', cx + 12).attr('y', cy - 4).attr('font-size', 12).attr('fill', '#b45309').attr('font-weight', 'bold').text(`(${xBar.toFixed(3)}, ${yBar.toFixed(3)})`)

    // Click point distance
    if (clickPt) {
      const [cpx, cpy] = clickPt
      const dist = Math.sqrt((cpx - xBar) ** 2 + (cpy - yBar) ** 2)
      svg.append('line').attr('x1', xSc(cpx)).attr('y1', ySc(cpy)).attr('x2', cx).attr('y2', cy)
        .attr('stroke', '#ef4444').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
      svg.append('circle').attr('cx', xSc(cpx)).attr('cy', ySc(cpy)).attr('r', 5).attr('fill', '#ef4444').attr('stroke', 'white').attr('stroke-width', 1.5)
      svg.append('text').attr('x', (xSc(cpx) + cx) / 2 + 4).attr('y', (ySc(cpy) + cy) / 2 - 4)
        .attr('font-size', 11).attr('fill', '#ef4444').text(`d ≈ ${dist.toFixed(3)}`)
    }

    // Pappus: torus vol = 2π·xBar·area (rotating region around y-axis)
    const torusVol = 2 * Math.PI * xBar * area

    // Labels
    svg.append('text').attr('x', M.left + 8).attr('y', M.top + 18)
      .attr('font-size', 12).attr('fill', '#334155').attr('font-weight', 'bold')
      .text(`x̄ = ${xBar.toFixed(4)},  ȳ = ${yBar.toFixed(4)},  A = ${area.toFixed(4)}`)
    svg.append('text').attr('x', M.left + 8).attr('y', M.top + 36)
      .attr('font-size', 11).attr('fill', '#64748b')
      .text(`Pappus torus vol (about y-axis) ≈ ${torusVol.toFixed(4)}`)

    // Clickable overlay
    svg.append('rect').attr('x', M.left).attr('y', M.top).attr('width', W - M.left - M.right).attr('height', H - M.top - M.bottom)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('click', function (event) {
        const [mx] = d3.pointer(event)
        const [, my] = d3.pointer(event)
        setClickPt([xSc.invert(mx), ySc.invert(my)])
      })

  }, [fn, fnBot, a, b, xBar, yBar, area, showStrips, clickPt])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3 px-2">
        {REGIONS.map((r, i) => (
          <button key={i} onClick={() => { setRegionIdx(i); setClickPt(null) }}
            className={`px-2 py-1 rounded text-xs transition-colors ${i === regionIdx ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >{r.label}</button>
        ))}
      </div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
          <input type="checkbox" checked={showStrips} onChange={e => setShowStrips(e.target.checked)} className="rounded" />
          Show moment strips
        </label>
      </div>
      <p className="text-xs text-center mt-2 text-slate-500 dark:text-slate-400">
        Yellow dot = centroid. Click anywhere on the graph to measure distance from centroid.
      </p>
    </div>
  )
}
