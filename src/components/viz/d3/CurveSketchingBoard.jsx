import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 400
const TOP_H = 230 // f plot
const BOT_H = 130 // f'/f'' plot
const M = { top: 24, right: 20, bottom: 20, left: 52 }

const PRESETS = [
  {
    label: 'x³ − 3x',
    f: (x) => x * x * x - 3 * x,
    fp: (x) => 3 * x * x - 3,
    fpp: (x) => 6 * x,
    domain: [-2.5, 2.5],
    yDomain: [-4, 4],
    fpDomain: [-4, 8],
  },
  {
    label: 'x⁴ − 4x³',
    f: (x) => x ** 4 - 4 * x ** 3,
    fp: (x) => 4 * x ** 3 - 12 * x ** 2,
    fpp: (x) => 12 * x ** 2 - 24 * x,
    domain: [-1, 4.5],
    yDomain: [-30, 20],
    fpDomain: [-30, 30],
  },
  {
    label: 'x / (x²+1)',
    f: (x) => x / (x * x + 1),
    fp: (x) => (1 - x * x) / ((x * x + 1) ** 2),
    fpp: (x) => (2 * x * (x * x - 3)) / ((x * x + 1) ** 3),
    domain: [-4, 4],
    yDomain: [-0.7, 0.7],
    fpDomain: [-0.6, 0.6],
  },
  {
    label: 'e^(−x²)',
    f: (x) => Math.exp(-x * x),
    fp: (x) => -2 * x * Math.exp(-x * x),
    fpp: (x) => (4 * x * x - 2) * Math.exp(-x * x),
    domain: [-3, 3],
    yDomain: [-0.1, 1.1],
    fpDomain: [-0.9, 0.9],
  },
]

// Find approximate zeros of a function on an interval
function findZeros(fn, a, b, n = 400) {
  const step = (b - a) / n
  const zeros = []
  for (let i = 0; i < n; i++) {
    const x0 = a + i * step
    const x1 = x0 + step
    if (fn(x0) * fn(x1) < 0) {
      let lo = x0, hi = x1
      for (let j = 0; j < 50; j++) {
        const m = (lo + hi) / 2
        if (Math.abs(hi - lo) < 1e-8) break
        if (fn(lo) * fn(m) <= 0) hi = m
        else lo = m
      }
      zeros.push((lo + hi) / 2)
    }
  }
  return zeros
}

export default function CurveSketchingBoard() {
  const topRef = useRef(null)
  const botRef = useRef(null)
  const [fnIdx, setFnIdx] = useState(0)

  const preset = PRESETS[fnIdx]
  const { f, fp, fpp, domain, yDomain, fpDomain } = preset

  // Top plot: f with annotations
  useEffect(() => {
    const criticalPts = findZeros(fp, domain[0], domain[1])
    const inflectionPts = findZeros(fpp, domain[0], domain[1])

    const svg = d3.select(topRef.current)
    svg.selectAll('*').remove()

    const topPlotH = TOP_H
    const xSc = d3.scaleLinear().domain(domain).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain(yDomain).range([topPlotH - M.bottom, M.top])

    const lineFn = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y))
      .defined(([, y]) => isFinite(y) && y > yDomain[0] - 5 && y < yDomain[1] + 5)

    // Shade rising/falling regions with light tint
    const xs = d3.range(domain[0], domain[1], (domain[1] - domain[0]) / 400)
    xs.forEach((x, i) => {
      if (i === xs.length - 1) return
      const x2 = xs[i + 1]
      const isRising = fp(x) > 0
      const fy1 = Math.max(yDomain[0], Math.min(yDomain[1], f(x)))
      const fy2 = Math.max(yDomain[0], Math.min(yDomain[1], f(x2)))
      const pxX1 = xSc(x), pxX2 = xSc(x2)
      const pxY1 = ySc(fy1), pxY2 = ySc(fy2)
      const baseY = ySc(Math.max(yDomain[0], 0))
      svg.append('polygon')
        .attr('points', `${pxX1},${baseY} ${pxX1},${pxY1} ${pxX2},${pxY2} ${pxX2},${baseY}`)
        .attr('fill', isRising ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)')
    })

    // Shade concave up/down under curve
    xs.forEach((x, i) => {
      if (i === xs.length - 1) return
      const x2 = xs[i + 1]
      const isConcaveUp = fpp(x) > 0
      const fy1 = Math.max(yDomain[0], Math.min(yDomain[1], f(x)))
      const fy2 = Math.max(yDomain[0], Math.min(yDomain[1], f(x2)))
      if (isConcaveUp) {
        svg.append('polygon')
          .attr('points', `${xSc(x)},${ySc(yDomain[0])} ${xSc(x)},${ySc(fy1)} ${xSc(x2)},${ySc(fy2)} ${xSc(x2)},${ySc(yDomain[0])}`)
          .attr('fill', 'rgba(100,112,241,0.05)')
      }
    })

    // Grid
    xSc.ticks(8).forEach((t) => {
      svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', topPlotH - M.bottom)
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })
    ySc.ticks(6).forEach((t) => {
      svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })

    // Axes
    const xAxisY = Math.max(M.top, Math.min(topPlotH - M.bottom, ySc(0)))
    const yAxisX = Math.max(M.left, Math.min(W - M.right, xSc(0)))
    svg.append('g').attr('transform', `translate(0,${xAxisY})`).call(d3.axisBottom(xSc).ticks(8)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${yAxisX},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    // f(x) curve
    const pts = d3.range(domain[0], domain[1] + 0.001, (domain[1] - domain[0]) / 400).map((x) => [x, f(x)])
    svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 3).attr('d', lineFn)

    // Annotate critical points
    criticalPts.forEach((c) => {
      const fc = f(c)
      const isMax = fp(c - 0.001) > 0 && fp(c + 0.001) < 0
      const isMin = fp(c - 0.001) < 0 && fp(c + 0.001) > 0
      if (!isFinite(fc) || fc < yDomain[0] || fc > yDomain[1]) return

      svg.append('circle').attr('cx', xSc(c)).attr('cy', ySc(fc)).attr('r', 6)
        .attr('fill', isMax ? '#ef4444' : isMin ? '#10b981' : '#f59e0b')
        .attr('stroke', 'white').attr('stroke-width', 1.5)

      const labelY = isMax ? ySc(fc) - 14 : ySc(fc) + 20
      svg.append('text').attr('x', xSc(c)).attr('y', labelY)
        .attr('text-anchor', 'middle').attr('font-size', 10).attr('font-weight', '600')
        .attr('fill', isMax ? '#ef4444' : isMin ? '#10b981' : '#f59e0b')
        .text(isMax ? '▲ local max' : isMin ? '▼ local min' : '●')
    })

    // Annotate inflection points
    inflectionPts.forEach((c) => {
      const fc = f(c)
      if (!isFinite(fc) || fc < yDomain[0] || fc > yDomain[1]) return
      svg.append('circle').attr('cx', xSc(c)).attr('cy', ySc(fc)).attr('r', 5)
        .attr('fill', 'none').attr('stroke', '#8b5cf6').attr('stroke-width', 2)
      svg.append('text').attr('x', xSc(c) + 6).attr('y', ySc(fc) - 6)
        .attr('font-size', 9).attr('fill', '#8b5cf6').text('inflection')
    })

    // f label
    svg.append('text').attr('x', M.left + 6).attr('y', M.top + 14)
      .attr('font-size', 12).attr('fill', '#6470f1').attr('font-weight', '600').text(`f(x) = ${preset.label}`)

  }, [fnIdx, domain, yDomain, f, fp, fpp, preset])

  // Bottom plot: f' and f''
  useEffect(() => {
    const criticalPts = findZeros(fp, domain[0], domain[1])
    const inflectionPts = findZeros(fpp, domain[0], domain[1])

    const svg = d3.select(botRef.current)
    svg.selectAll('*').remove()

    const xSc = d3.scaleLinear().domain(domain).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain(fpDomain).range([BOT_H - 8, 14])

    const lineFn = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y))
      .defined(([, y]) => isFinite(y) && y > fpDomain[0] - 5 && y < fpDomain[1] + 5)

    // Zero line
    const zeroY = Math.max(14, Math.min(BOT_H - 8, ySc(0)))
    svg.append('line').attr('x1', M.left).attr('x2', W - M.right)
      .attr('y1', zeroY).attr('y2', zeroY)
      .attr('stroke', '#cbd5e1').attr('stroke-dasharray', '4,2')

    // f'(x) in amber
    const fpPts = d3.range(domain[0], domain[1] + 0.001, (domain[1] - domain[0]) / 300).map((x) => [x, fp(x)])
    svg.append('path').datum(fpPts).attr('fill', 'none').attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('d', lineFn)

    // f''(x) in purple
    const fppPts = d3.range(domain[0], domain[1] + 0.001, (domain[1] - domain[0]) / 300).map((x) => [x, fpp(x)])
    svg.append('path').datum(fppPts).attr('fill', 'none').attr('stroke', '#8b5cf6')
      .attr('stroke-width', 1.5).attr('stroke-dasharray', '5,2').attr('d', lineFn)

    // Critical pts (f'=0) marked on f' plot
    criticalPts.forEach((c) => {
      const fpc = fp(c)
      if (!isFinite(fpc) || fpc < fpDomain[0] || fpc > fpDomain[1]) return
      svg.append('circle').attr('cx', xSc(c)).attr('cy', ySc(fpc)).attr('r', 4).attr('fill', '#f59e0b')
    })

    // Inflection pts (f''=0) marked on f'' plot
    inflectionPts.forEach((c) => {
      const fppc = fpp(c)
      if (!isFinite(fppc)) return
      const plotY = Math.max(14, Math.min(BOT_H - 8, ySc(fppc)))
      svg.append('circle').attr('cx', xSc(c)).attr('cy', plotY).attr('r', 4).attr('fill', '#8b5cf6')
    })

    // x-axis
    svg.append('g').attr('transform', `translate(0,${zeroY})`).call(d3.axisBottom(xSc).ticks(7)).attr('color', '#94a3b8')

    // Legend
    svg.append('text').attr('x', M.left + 6).attr('y', 12)
      .attr('font-size', 10).attr('fill', '#f59e0b').text("f′(x)")
    svg.append('text').attr('x', M.left + 40).attr('y', 12)
      .attr('font-size', 10).attr('fill', '#8b5cf6').text("f′′(x) dashed")

  }, [fnIdx, domain, fpDomain, fp, fpp])

  return (
    <div>
      <svg ref={topRef} width="100%" viewBox={"0 0 " + W + " " + TOP_H} className="overflow-visible" />
      <svg ref={botRef} width="100%" viewBox={"0 0 " + W + " " + BOT_H} className="overflow-visible border-t border-slate-200 dark:border-slate-700" />
      <div className="px-4 mt-2 flex gap-2 flex-wrap">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => setFnIdx(i)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${fnIdx === i ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        Top: f(x) with extrema (red/green) and inflection points (purple). Bottom: f′ (amber) and f′′ (purple dashed). Green tint = rising; red tint = falling.
      </p>
    </div>
  )
}
