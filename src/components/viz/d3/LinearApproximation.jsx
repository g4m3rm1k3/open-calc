import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 360
const M = { top: 30, right: 20, bottom: 50, left: 55 }

const PRESETS = [
  {
    label: 'f(x) = √x at a = 25',
    f: (x) => Math.sqrt(Math.max(x, 0)),
    fPrime: (x) => x > 0 ? 1 / (2 * Math.sqrt(x)) : 0,
    a: 25,
    domain: [20, 31],
    yDomain: [4.4, 5.7],
    fLabel: '√x',
  },
  {
    label: 'f(x) = sin(x) at a = 0',
    f: (x) => Math.sin(x),
    fPrime: (x) => Math.cos(x),
    a: 0,
    domain: [-1.5, 1.5],
    yDomain: [-1.5, 1.5],
    fLabel: 'sin(x)',
  },
  {
    label: 'f(x) = eˣ at a = 0',
    f: (x) => Math.exp(x),
    fPrime: (x) => Math.exp(x),
    a: 0,
    domain: [-1.5, 1.5],
    yDomain: [-0.5, 4.5],
    fLabel: 'eˣ',
  },
]

export default function LinearApproximation() {
  const svgRef = useRef(null)
  const tableRef = useRef(null)
  const [fnIdx, setFnIdx] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)

  const preset = PRESETS[fnIdx]
  const { f, fPrime, a, domain, yDomain, fLabel } = preset

  const fa = f(a)
  const fpA = fPrime(a)
  const L = (x) => fa + fpA * (x - a)

  // Zoomed domain: zoom in around (a, fa)
  const zoomedXRange = (domain[1] - domain[0]) / zoomLevel
  const zoomedYRange = (yDomain[1] - yDomain[0]) / zoomLevel
  const xMin = a - zoomedXRange / 2
  const xMax = a + zoomedXRange / 2
  const yMin = fa - zoomedYRange / 2
  const yMax = fa + zoomedYRange / 2

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xSc = d3.scaleLinear().domain([xMin, xMax]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([yMin, yMax]).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(6).forEach((t) => {
      svg.append('line')
        .attr('x1', xSc(t)).attr('x2', xSc(t))
        .attr('y1', M.top).attr('y2', H - M.bottom)
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })
    ySc.ticks(5).forEach((t) => {
      svg.append('line')
        .attr('x1', M.left).attr('x2', W - M.right)
        .attr('y1', ySc(t)).attr('y2', ySc(t))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })

    // Axes
    const yAxisPos = Math.max(M.left, Math.min(W - M.right, xSc(0)))
    const xAxisPos = Math.max(M.top, Math.min(H - M.bottom, ySc(0)))
    svg.append('g').attr('transform', `translate(0,${xAxisPos})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${yAxisPos},0)`).call(d3.axisLeft(ySc).ticks(5)).attr('color', '#94a3b8')

    // Curve f(x) in blue
    const pts = d3.range(xMin, xMax + 0.001, (xMax - xMin) / 200).map((x) => {
      const y = f(x)
      return [x, y]
    })
    const lineFn = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y)).defined(([, y]) => isFinite(y) && y >= yMin - 2 && y <= yMax + 2)
    svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', lineFn)

    // Tangent line L(x) in orange
    const tanPts = [[xMin, L(xMin)], [xMax, L(xMax)]]
    svg.append('path').datum(tanPts).attr('fill', 'none').attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('stroke-dasharray', zoomLevel > 8 ? 'none' : '6,3').attr('d', lineFn)

    // Point (a, f(a))
    svg.append('circle').attr('cx', xSc(a)).attr('cy', ySc(fa)).attr('r', 6).attr('fill', '#6470f1')

    // Labels
    svg.append('text').attr('x', M.left + 8).attr('y', M.top + 18)
      .attr('font-size', 12).attr('fill', '#6470f1').text(`f(x) = ${fLabel}`)
    svg.append('text').attr('x', M.left + 8).attr('y', M.top + 34)
      .attr('font-size', 12).attr('fill', '#f59e0b')
      .text(`L(x) = ${fa.toFixed(4)} + ${fpA.toFixed(4)}(x−${a})`)

    // Zoom indicator
    svg.append('text').attr('x', W / 2).attr('y', M.top - 8)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#64748b')
      .text(`Zoom ×${zoomLevel}  |  x ∈ [${xMin.toFixed(3)}, ${xMax.toFixed(3)}]`)

    // Convergence note at high zoom
    if (zoomLevel >= 15) {
      svg.append('text').attr('x', W / 2).attr('y', H - M.bottom + 32)
        .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#10b981').attr('font-weight', '600')
        .text('Curve and tangent line are indistinguishable — differentiability!')
    }

  }, [fnIdx, zoomLevel, xMin, xMax, yMin, yMax, a, fa, fpA])

  // Comparison table values
  const offsets = [0.1, 0.5, 1.0]
  const tableRows = offsets.flatMap((dx) => [
    { x: a + dx, sign: '+' },
    { x: a - dx, sign: '−' },
  ])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => { setFnIdx(i); setZoomLevel(1) }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${fnIdx === i ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <SliderControl
          label="Zoom level"
          min={1} max={20} step={0.5}
          value={zoomLevel} onChange={setZoomLevel}
          format={(v) => `×${v.toFixed(1)}`}
        />
      </div>

      {/* Comparison table */}
      <div className="px-4 mt-3">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Approximation accuracy near a = {a}:</p>
        <table ref={tableRef} className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              <th className="px-2 py-1 text-left text-slate-600 dark:text-slate-400">x</th>
              <th className="px-2 py-1 text-right text-indigo-600">f(x) exact</th>
              <th className="px-2 py-1 text-right text-amber-600">L(x) approx</th>
              <th className="px-2 py-1 text-right text-slate-500">error</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map(({ x }) => {
              const exact = f(x)
              const approx = L(x)
              const err = exact - approx
              return (
                <tr key={x} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-2 py-0.5 font-mono">{x.toFixed(2)}</td>
                  <td className="px-2 py-0.5 text-right font-mono text-indigo-600">{isFinite(exact) ? exact.toFixed(5) : 'undef'}</td>
                  <td className="px-2 py-0.5 text-right font-mono text-amber-600">{approx.toFixed(5)}</td>
                  <td className="px-2 py-0.5 text-right font-mono text-slate-500">{isFinite(err) ? err.toFixed(5) : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
