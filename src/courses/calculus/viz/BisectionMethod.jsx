import * as d3 from 'd3'
import { useRef, useEffect, useState, useCallback } from 'react'

const W = 600, H = 360
const M = { top: 24, right: 24, bottom: 44, left: 55 }

const FUNCTIONS = {
  'x³ − x − 2': { fn: x => x ** 3 - x - 2, a: 1, b: 2, label: 'x³ − x − 2' },
  'cos(x) − x':  { fn: x => Math.cos(x) - x, a: 0, b: 2, label: 'cos(x) − x' },
  'x² − 2':      { fn: x => x * x - 2, a: 1, b: 2, label: 'x² − 2' },
  'eˣ − 3x':     { fn: x => Math.exp(x) - 3 * x, a: 1, b: 2, label: 'eˣ − 3x' },
}

function bisectStep(fn, a, b) {
  const c = (a + b) / 2
  const fc = fn(c)
  const fa = fn(a)
  if (fa * fc <= 0) return [a, c]
  return [c, b]
}

export default function BisectionMethod({ params }) {
  const svgRef = useRef(null)
  const [fnKey, setFnKey] = useState('x³ − x − 2')
  const [history, setHistory] = useState([])
  const [step, setStep] = useState(0)

  const { fn, a: a0, b: b0 } = FUNCTIONS[fnKey]

  // Reset when function changes
  const reset = useCallback(() => {
    setHistory([[a0, b0]])
    setStep(0)
  }, [a0, b0])

  useEffect(() => { reset() }, [reset])

  const current = history[step] ?? [a0, b0]
  const [a, b] = current
  const c = (a + b) / 2

  const nextStep = () => {
    if (step < history.length - 1) { setStep(s => s + 1); return }
    const [na, nb] = bisectStep(fn, a, b)
    const next = [na, nb]
    setHistory(h => [...h, next])
    setStep(s => s + 1)
  }

  const prevStep = () => setStep(s => Math.max(0, s - 1))

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xPad = (b0 - a0) * 0.5
    const xDomain = [a0 - xPad, b0 + xPad]
    const xSc = d3.scaleLinear().domain(xDomain).range([M.left, W - M.right])

    const pts = []
    const step = (xDomain[1] - xDomain[0]) / 300
    for (let x = xDomain[0]; x <= xDomain[1] + step / 2; x += step) {
      const y = fn(x)
      if (isFinite(y) && Math.abs(y) < 20) pts.push([x, y])
    }
    const yVals = pts.map(p => p[1])
    const yMin = d3.min(yVals), yMax = d3.max(yVals)
    const yPad = Math.max((yMax - yMin) * 0.2, 0.5)
    const ySc = d3.scaleLinear().domain([yMin - yPad, yMax + yPad]).range([H - M.bottom, M.top])

    // Grid lines
    xSc.ticks(6).forEach(t => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(6).forEach(t => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes
    svg.append('g').attr('transform', `translate(0,${ySc(0)})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${M.left},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    // Shaded interval [a, b]
    svg.append('rect')
      .attr('x', xSc(a)).attr('y', M.top)
      .attr('width', xSc(b) - xSc(a))
      .attr('height', H - M.bottom - M.top)
      .attr('fill', '#6366f1').attr('fill-opacity', 0.12)

    // Midpoint dashed line
    svg.append('line')
      .attr('x1', xSc(c)).attr('x2', xSc(c))
      .attr('y1', M.top).attr('y2', H - M.bottom)
      .attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('stroke-dasharray', '6,4')

    // Curve
    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y)).curve(d3.curveCatmullRom)
    svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', '#6366f1').attr('stroke-width', 2.5).attr('d', line)

    // Label f(a), f(c), f(b)
    const labelPts = [
      { x: a, label: 'f(a)', val: fn(a) },
      { x: c, label: 'f(c)', val: fn(c) },
      { x: b, label: 'f(b)', val: fn(b) },
    ]
    labelPts.forEach(({ x, label, val }) => {
      if (!isFinite(val)) return
      const col = val >= 0 ? '#10b981' : '#ef4444'
      svg.append('circle').attr('cx', xSc(x)).attr('cy', ySc(val)).attr('r', 5).attr('fill', col).attr('stroke', 'white').attr('stroke-width', 1.5)
      svg.append('line').attr('x1', xSc(x)).attr('x2', xSc(x)).attr('y1', ySc(0)).attr('y2', ySc(val)).attr('stroke', col).attr('stroke-width', 1).attr('stroke-dasharray', '3,3')
      svg.append('text').attr('x', xSc(x) + 4).attr('y', ySc(val) - 6).attr('font-size', 11).attr('fill', col).attr('font-weight', 'bold').text(`${label} ≈ ${val.toFixed(3)}`)
    })

    // Axis label
    svg.append('text').attr('x', W / 2).attr('y', H - 2).attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#64748b').text('x')
  }, [fn, a, b, c, a0, b0])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3 px-2">
        {Object.keys(FUNCTIONS).map(k => (
          <button key={k} onClick={() => setFnKey(k)}
            className={`px-2 py-1 rounded text-xs transition-colors ${k === fnKey ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >f(x) = {FUNCTIONS[k].label}</button>
        ))}
      </div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2 flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <button onClick={prevStep} disabled={step === 0}
            className="px-3 py-1.5 rounded text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-300 dark:hover:bg-slate-600">
            ← Prev
          </button>
          <button onClick={nextStep}
            className="px-3 py-1.5 rounded text-sm bg-brand-500 text-white hover:bg-brand-600">
            Next Step →
          </button>
          <button onClick={reset}
            className="px-3 py-1.5 rounded text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600">
            Reset
          </button>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400 font-mono space-x-4">
          <span>Step: {step}</span>
          <span>a = {a.toFixed(6)}</span>
          <span>b = {b.toFixed(6)}</span>
          <span>c ≈ {c.toFixed(6)}</span>
        </div>
      </div>
      <p className="text-xs text-center mt-2 text-slate-500 dark:text-slate-400">
        Shaded band = current interval [a,b]. Yellow dashed = midpoint c. Green = positive, Red = negative.
      </p>
    </div>
  )
}
