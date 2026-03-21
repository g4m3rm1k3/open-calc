import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 600, H = 340
const M = { top: 20, right: 20, bottom: 40, left: 55 }

const SERIES = {
  'geometric (r=1/2)': {
    term: n => Math.pow(0.5, n),
    label: 'Σ (1/2)ⁿ',
    convergesTo: 2,
    desc: 'Converges to 2',
  },
  'geometric (r=2/3)': {
    term: n => Math.pow(2/3, n),
    label: 'Σ (2/3)ⁿ',
    convergesTo: 3,
    desc: 'Converges to 3',
  },
  'harmonic': {
    term: n => 1 / (n + 1),
    label: 'Σ 1/n',
    convergesTo: null,
    desc: 'Diverges (slowly!)',
  },
  'p=2': {
    term: n => 1 / Math.pow(n + 1, 2),
    label: 'Σ 1/n²',
    convergesTo: Math.PI * Math.PI / 6,
    desc: 'Converges to π²/6 ≈ 1.645',
  },
  'alternating harmonic': {
    term: n => Math.pow(-1, n) / (n + 1),
    label: 'Σ (-1)ⁿ/n',
    convergesTo: Math.LN2,
    desc: 'Converges to ln(2) ≈ 0.693',
  },
  '1/n!': {
    term: n => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return 1 / f },
    label: 'Σ 1/n!',
    convergesTo: Math.E,
    desc: 'Converges to e ≈ 2.718',
  },
}

export default function ConvergenceViz({ params }) {
  const svgRef = useRef(null)
  const { preset: initPreset = 'geometric (r=1/2)' } = params ?? {}
  const [seriesKey, setSeriesKey] = useState(initPreset)
  const [numTerms, setNumTerms] = useState(15)

  const series = SERIES[seriesKey] ?? SERIES['geometric (r=1/2)']

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Compute partial sums
    const terms = []
    const partialSums = []
    let sum = 0
    for (let n = 0; n < numTerms; n++) {
      const t = series.term(n)
      terms.push(t)
      sum += t
      partialSums.push(sum)
    }

    const xSc = d3.scaleLinear().domain([0, numTerms - 1]).range([M.left, W - M.right])

    // y range
    const allVals = [...partialSums]
    if (series.convergesTo !== null) allVals.push(series.convergesTo)
    const [yMin, yMax] = d3.extent(allVals)
    const yPad = Math.max((yMax - yMin) * 0.2, 0.5)
    const ySc = d3.scaleLinear().domain([Math.min(yMin - yPad, 0), yMax + yPad]).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(Math.min(numTerms, 10)).forEach(t => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(6).forEach(t => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes
    svg.append('g').attr('transform', `translate(0,${H - M.bottom})`).call(d3.axisBottom(xSc).ticks(Math.min(numTerms, 10)).tickFormat(d => `n=${d}`)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${M.left},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    // Convergence line (if exists)
    if (series.convergesTo !== null) {
      const cy = ySc(series.convergesTo)
      svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', cy).attr('y2', cy)
        .attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('stroke-dasharray', '8,4')
      svg.append('text')
        .attr('x', W - M.right - 4).attr('y', cy - 6)
        .attr('text-anchor', 'end').attr('font-size', 11).attr('fill', '#f59e0b').attr('font-weight', 'bold')
        .text(`L = ${series.convergesTo.toFixed(4)}`)
    }

    // Partial sums line
    const line = d3.line().x((_, i) => xSc(i)).y(d => ySc(d))
    svg.append('path')
      .datum(partialSums)
      .attr('fill', 'none')
      .attr('stroke', '#6470f1')
      .attr('stroke-width', 2)
      .attr('d', line)

    // Dots for partial sums
    partialSums.forEach((s, i) => {
      svg.append('circle')
        .attr('cx', xSc(i)).attr('cy', ySc(s)).attr('r', 4)
        .attr('fill', '#6470f1').attr('stroke', 'white').attr('stroke-width', 1.5)
    })

    // Term bars (small bars showing individual term sizes)
    const barW = Math.max(2, (W - M.left - M.right) / numTerms * 0.4)
    terms.forEach((t, i) => {
      const barH = Math.abs(ySc(0) - ySc(t))
      const y = t >= 0 ? ySc(t) : ySc(0)
      svg.append('rect')
        .attr('x', xSc(i) - barW / 2)
        .attr('y', y)
        .attr('width', barW)
        .attr('height', Math.max(barH, 1))
        .attr('fill', t >= 0 ? '#10b981' : '#ef4444')
        .attr('opacity', 0.4)
        .attr('rx', 1)
    })

    // Labels
    svg.append('text').attr('x', W / 2).attr('y', H - 2).attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#64748b').text('Term index n')
    svg.append('text').attr('x', 14).attr('y', M.top - 4).attr('font-size', 11).attr('fill', '#64748b').text('Sₙ')

    // Current sum label
    const lastSum = partialSums[partialSums.length - 1]
    svg.append('text')
      .attr('x', M.left + 8).attr('y', M.top + 16)
      .attr('font-size', 12).attr('fill', '#334155').attr('font-weight', 'bold')
      .text(`S${numTerms} = ${lastSum.toFixed(6)}`)

  }, [seriesKey, numTerms, series])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3 px-2">
        {Object.keys(SERIES).map(k => (
          <button
            key={k}
            onClick={() => setSeriesKey(k)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              k === seriesKey
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {SERIES[k].label}
          </button>
        ))}
      </div>
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
      <div className="px-4 mt-2">
        <SliderControl label={`Number of terms: ${numTerms}`} min={3} max={50} step={1} value={numTerms} onChange={setNumTerms} />
      </div>
      <p className="text-xs text-center mt-1 text-slate-500 dark:text-slate-400">
        <strong>{series.desc}</strong> — Blue dots: partial sums Sₙ. Green bars: individual term sizes aₙ.
      </p>
    </div>
  )
}
