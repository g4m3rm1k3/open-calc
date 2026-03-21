import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 340
const HALF_W = W / 2 - 10
const M = { top: 36, right: 14, bottom: 40, left: 50 }

// Preset limit problems
const PRESETS = [
  {
    label: 'sin(x)/x → 1',
    f: (x) => Math.sin(x),
    g: (x) => x,
    fp: (x) => Math.cos(x),
    gp: (x) => 1,
    limitPoint: 0,
    startX: 2.0,
    endX: 0.02,
    limitL: 1,
    fLabel: 'sin(x)',
    gLabel: 'x',
    fpLabel: 'cos(x)',
    gpLabel: '1',
    yDomain: [-0.5, 1.5],
  },
  {
    label: '(eˣ−1)/x → 1',
    f: (x) => Math.exp(x) - 1,
    g: (x) => x,
    fp: (x) => Math.exp(x),
    gp: (x) => 1,
    limitPoint: 0,
    startX: 2.0,
    endX: 0.02,
    limitL: 1,
    fLabel: 'eˣ−1',
    gLabel: 'x',
    fpLabel: 'eˣ',
    gpLabel: '1',
    yDomain: [-0.5, 2.5],
  },
  {
    label: '(1−cos x)/x² → ½',
    f: (x) => 1 - Math.cos(x),
    g: (x) => x * x,
    fp: (x) => Math.sin(x),
    gp: (x) => 2 * x,
    limitPoint: 0,
    startX: 2.0,
    endX: 0.05,
    limitL: 0.5,
    fLabel: '1−cos(x)',
    gLabel: 'x²',
    fpLabel: 'sin(x)',
    gpLabel: '2x',
    yDomain: [-0.2, 1.2],
  },
]

export default function LHopitalViz() {
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const [fnIdx, setFnIdx] = useState(0)
  const [xApproach, setXApproach] = useState(PRESETS[0].startX)

  const p = PRESETS[fnIdx]
  const { f, g, fp, gp, limitPoint, startX, endX, limitL } = p
  const x = xApproach

  const fgRatio = Math.abs(g(x)) > 1e-10 ? f(x) / g(x) : NaN
  const fpgpRatio = Math.abs(gp(x)) > 1e-10 ? fp(x) / gp(x) : NaN

  // Build x range for plotting (approach from right)
  const xMin = endX
  const xMax = startX + 0.2

  const drawPlot = (svgEl, ratioFn, isLeftPlot, showHole) => {
    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()

    const plotW = HALF_W - M.left - M.right
    const plotH = H - M.top - M.bottom

    const xSc = d3.scaleLinear().domain([xMin - 0.1, xMax]).range([M.left, M.left + plotW])
    const ySc = d3.scaleLinear().domain(p.yDomain).range([M.top + plotH, M.top])

    const lineFn = d3.line().x(([xi]) => xSc(xi)).y(([, yi]) => ySc(yi))
      .defined(([, yi]) => isFinite(yi) && yi > p.yDomain[0] - 1 && yi < p.yDomain[1] + 1)

    // Grid
    xSc.ticks(5).forEach((t) => {
      svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', M.top + plotH)
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })
    ySc.ticks(5).forEach((t) => {
      svg.append('line').attr('x1', M.left).attr('x2', M.left + plotW).attr('y1', ySc(t)).attr('y2', ySc(t))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })

    // Axes
    const xAxisY = Math.max(M.top, Math.min(M.top + plotH, ySc(0)))
    svg.append('g').attr('transform', `translate(0,${xAxisY})`).call(d3.axisBottom(xSc).ticks(4)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${M.left},0)`).call(d3.axisLeft(ySc).ticks(5)).attr('color', '#94a3b8')

    // Curve (avoid the limit point)
    const pts = d3.range(xMin, xMax + 0.01, (xMax - xMin) / 200)
      .filter((xi) => Math.abs(xi - limitPoint) > 0.01)
      .map((xi) => [xi, ratioFn(xi)])
    svg.append('path').datum(pts).attr('fill', 'none')
      .attr('stroke', isLeftPlot ? '#6470f1' : '#10b981')
      .attr('stroke-width', 2.5).attr('d', lineFn)

    // Limit value horizontal line
    svg.append('line')
      .attr('x1', xSc(xMin - 0.1)).attr('x2', xSc(xMax))
      .attr('y1', ySc(limitL)).attr('y2', ySc(limitL))
      .attr('stroke', '#f59e0b').attr('stroke-dasharray', '6,3').attr('stroke-width', 1.5)
    svg.append('text').attr('x', M.left + plotW - 4).attr('y', ySc(limitL) - 6)
      .attr('text-anchor', 'end').attr('font-size', 10).attr('fill', '#f59e0b')
      .text(`L = ${limitL}`)

    // Hole at limit point (left plot has hole, right doesn't)
    if (showHole) {
      svg.append('circle').attr('cx', xSc(limitPoint)).attr('cy', ySc(limitL)).attr('r', 5)
        .attr('fill', 'white').attr('stroke', isLeftPlot ? '#6470f1' : '#10b981').attr('stroke-width', 2)
    } else {
      // Filled dot (no hole)
      svg.append('circle').attr('cx', xSc(limitPoint)).attr('cy', ySc(limitL)).attr('r', 5)
        .attr('fill', '#10b981')
    }

    // Current x cursor
    const currentY = ratioFn(x)
    if (isFinite(currentY) && currentY > p.yDomain[0] && currentY < p.yDomain[1]) {
      svg.append('circle').attr('cx', xSc(x)).attr('cy', ySc(currentY)).attr('r', 6)
        .attr('fill', '#f59e0b').attr('stroke', 'white').attr('stroke-width', 2)
      // Vertical cursor
      svg.append('line')
        .attr('x1', xSc(x)).attr('x2', xSc(x))
        .attr('y1', ySc(currentY)).attr('y2', M.top + plotH)
        .attr('stroke', '#f59e0b').attr('stroke-dasharray', '3,2').attr('stroke-width', 1)
    }

    // Title
    const title = isLeftPlot
      ? `f(x)/g(x) = ${p.fLabel}/${p.gLabel}`
      : `f′(x)/g′(x) = ${p.fpLabel}/${p.gpLabel}`
    svg.append('text').attr('x', M.left + plotW / 2).attr('y', M.top - 10)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('font-weight', '600')
      .attr('fill', isLeftPlot ? '#6470f1' : '#10b981').text(title)

    // Subtitle
    const subtitle = isLeftPlot ? '(has hole at x=0)' : '(defined at x=0 ✓)'
    svg.append('text').attr('x', M.left + plotW / 2).attr('y', M.top - 0)
      .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#64748b').text(subtitle)

    // Numeric value
    const ratio = isLeftPlot ? fgRatio : fpgpRatio
    const valText = isFinite(ratio) ? ratio.toFixed(5) : '0/0'
    svg.append('text').attr('x', M.left + plotW / 2).attr('y', M.top + plotH + 30)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('font-family', 'monospace')
      .attr('fill', isLeftPlot ? '#6470f1' : '#10b981')
      .text(`At x=${x.toFixed(3)}: = ${valText}`)
  }

  useEffect(() => {
    drawPlot(leftRef.current, (xi) => Math.abs(g(xi)) > 1e-10 ? f(xi) / g(xi) : NaN, true, true)
  }, [fnIdx, x, f, g, fp, gp])

  useEffect(() => {
    drawPlot(rightRef.current, (xi) => Math.abs(gp(xi)) > 1e-10 ? fp(xi) / gp(xi) : NaN, false, false)
  }, [fnIdx, x, f, g, fp, gp])

  return (
    <div>
      <div className="flex gap-1">
        <svg ref={leftRef} width="50%" viewBox={"0 0 " + HALF_W + " " + H} className="overflow-visible" />
        <svg ref={rightRef} width="50%" viewBox={"0 0 " + HALF_W + " " + H} className="overflow-visible" />
      </div>
      <div className="px-4 mt-2 space-y-2">
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((pr, i) => (
            <button
              key={i}
              onClick={() => { setFnIdx(i); setXApproach(pr.startX) }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${fnIdx === i ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            >
              {pr.label}
            </button>
          ))}
        </div>
        <SliderControl
          label="x approaches 0"
          min={endX} max={startX}
          step={0.01} value={xApproach} onChange={setXApproach}
          format={(v) => v.toFixed(3)}
        />
      </div>
      <div className="px-4 mt-2 text-xs text-center text-slate-600 dark:text-slate-400">
        <p>
          Left: f/g has a <em>hole</em> at x=0 (0/0 form).
          Right: f′/g′ is <em>defined</em> at x=0 and equals L = {limitL}.
        </p>
        <p className="mt-1 font-semibold text-brand-600 dark:text-brand-400">
          Both ratios → {limitL} as x → 0. L'Hôpital's Rule: lim f/g = lim f′/g′ = {limitL}.
        </p>
      </div>
    </div>
  )
}
