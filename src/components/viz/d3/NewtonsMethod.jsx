import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'

const W = 580, H = 360
const M = { top: 20, right: 20, bottom: 36, left: 52 }
const MAX_STEPS = 8

const PRESETS = [
  {
    label: 'x² − 2',
    f:   x => x * x - 2,
    fp:  x => 2 * x,
    domain: [-0.5, 3],
    yDomain: [-2.5, 5],
    x0: 2,
    root: Math.SQRT2,
  },
  {
    label: 'x³ − x − 1',
    f:   x => x ** 3 - x - 1,
    fp:  x => 3 * x ** 2 - 1,
    domain: [-1, 2.5],
    yDomain: [-3, 5],
    x0: 2,
    root: 1.3247179572,
  },
  {
    label: 'cos(x) − x',
    f:   x => Math.cos(x) - x,
    fp:  x => -Math.sin(x) - 1,
    domain: [-0.5, 2],
    yDomain: [-2, 2],
    x0: 1.5,
    root: 0.7390851332,
  },
]

function buildHistory(f, fp, x0, steps) {
  const hist = [x0]
  for (let i = 0; i < steps; i++) {
    const xn = hist[hist.length - 1]
    const fxn = f(xn)
    const fpxn = fp(xn)
    if (Math.abs(fpxn) < 1e-14) break
    hist.push(xn - fxn / fpxn)
  }
  return hist
}

export default function NewtonsMethod() {
  const svgRef = useRef(null)
  const autoTimerRef = useRef(null)

  const [presetIdx, setPresetIdx] = useState(0)
  const [step, setStep] = useState(0)
  const [autoRunning, setAutoRunning] = useState(false)

  const preset = PRESETS[presetIdx]
  const { f, fp, domain, yDomain, x0, root } = preset
  const xHistory = buildHistory(f, fp, x0, step)

  // ── Reset when preset changes ────────────────────────────────────────────────
  useEffect(() => {
    clearInterval(autoTimerRef.current)
    setAutoRunning(false)
    setStep(0)
  }, [presetIdx])

  // ── Auto-run logic ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (autoRunning) {
      autoTimerRef.current = setInterval(() => {
        setStep(prev => {
          if (prev >= MAX_STEPS) {
            setAutoRunning(false)
            clearInterval(autoTimerRef.current)
            return prev
          }
          return prev + 1
        })
      }, 900)
    } else {
      clearInterval(autoTimerRef.current)
    }
    return () => clearInterval(autoTimerRef.current)
  }, [autoRunning])

  // ── D3 render ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xSc = d3.scaleLinear().domain(domain).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain(yDomain).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(8).forEach(t =>
      svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    )
    ySc.ticks(6).forEach(t =>
      svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    )

    // Axes
    const xAxisY = Math.max(M.top, Math.min(H - M.bottom, ySc(0)))
    const yAxisX = Math.max(M.left, Math.min(W - M.right, xSc(0)))
    svg.append('g').attr('transform', `translate(0,${xAxisY})`).call(d3.axisBottom(xSc).ticks(8)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${yAxisX},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    // Curve
    const N = 400
    const pts = d3.range(N).map(i => {
      const x = domain[0] + (i / (N - 1)) * (domain[1] - domain[0])
      return { x, y: f(x) }
    })
    svg.append('path').datum(pts)
      .attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5)
      .attr('d', d3.line().defined(d => isFinite(d.y)).x(d => xSc(d.x)).y(d => ySc(d.y)))

    // Previous x_n on x-axis (all except last = current)
    xHistory.slice(0, -1).forEach((xn, i) => {
      const color = i === 0 ? '#ef4444' : '#94a3b8'
      svg.append('circle').attr('cx', xSc(xn)).attr('cy', xAxisY).attr('r', 4).attr('fill', color).attr('stroke', '#fff').attr('stroke-width', 1)
    })

    // Current iteration
    if (xHistory.length >= 1) {
      const xn = xHistory[xHistory.length - 1]
      const fxn = f(xn)
      const fpxn = fp(xn)

      // Vertical dashed line x_n → (x_n, f(x_n))
      svg.append('line')
        .attr('x1', xSc(xn)).attr('x2', xSc(xn))
        .attr('y1', xAxisY).attr('y2', ySc(fxn))
        .attr('stroke', '#f59e0b').attr('stroke-width', 1.5).attr('stroke-dasharray', '5,3')

      // Amber dot at (x_n, f(x_n))
      svg.append('circle').attr('cx', xSc(xn)).attr('cy', ySc(fxn)).attr('r', 6).attr('fill', '#f59e0b').attr('stroke', '#fff').attr('stroke-width', 1.5)

      // Tangent line (with animation if step > 0)
      if (step > 0 && Math.abs(fpxn) > 1e-14) {
        const xNext = xn - fxn / fpxn
        const tangentLine = svg.append('line')
          .attr('x1', xSc(xn)).attr('y1', ySc(fxn))
          .attr('x2', xSc(xn)).attr('y2', ySc(fxn))  // start collapsed
          .attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('stroke-linecap', 'round')

        tangentLine.transition().duration(600)
          .attr('x2', xSc(xNext)).attr('y2', xAxisY)

        // Green dot at x_{n+1} on x-axis
        svg.append('circle')
          .attr('cx', xSc(xNext)).attr('cy', xAxisY)
          .attr('r', 6).attr('fill', '#22c55e').attr('stroke', '#fff').attr('stroke-width', 1.5)
          .attr('opacity', 0)
          .transition().delay(550).duration(200)
          .attr('opacity', 1)
      }
    }

    // True root indicator
    svg.append('line')
      .attr('x1', xSc(root)).attr('x2', xSc(root))
      .attr('y1', xAxisY - 8).attr('y2', xAxisY + 8)
      .attr('stroke', '#22c55e').attr('stroke-width', 2)
    svg.append('text').attr('x', xSc(root) + 5).attr('y', xAxisY - 10).attr('font-size', 10).attr('fill', '#22c55e').text('true root')

  }, [step, presetIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  const tableRows = buildHistory(f, fp, x0, MAX_STEPS)
  const visibleRows = tableRows.slice(0, step + 1)

  return (
    <div className="flex flex-col gap-3">
      {/* Preset buttons */}
      <div className="flex gap-2 flex-wrap px-1">
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => setPresetIdx(i)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${i === presetIdx ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <svg ref={svgRef} width={W} height={H} className="w-full overflow-visible" />

      {/* Controls */}
      <div className="flex gap-2 items-center px-2 flex-wrap">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          x₀ = {x0}
        </span>
        <button
          onClick={() => setStep(s => Math.min(s + 1, MAX_STEPS))}
          disabled={step >= MAX_STEPS || autoRunning}
          className="px-4 py-1.5 rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next Step →
        </button>
        <button
          onClick={() => { setAutoRunning(v => !v) }}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${autoRunning ? 'bg-slate-500 text-white hover:bg-slate-600' : 'bg-brand-500 text-white hover:bg-brand-600'}`}
        >
          {autoRunning ? '⏸ Pause' : '▶ Auto'}
        </button>
        <button
          onClick={() => { clearInterval(autoTimerRef.current); setAutoRunning(false); setStep(0) }}
          className="px-4 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-2">
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-1 px-2 text-slate-500 dark:text-slate-400">Step n</th>
              <th className="text-right py-1 px-2 text-slate-500 dark:text-slate-400">xₙ</th>
              <th className="text-right py-1 px-2 text-slate-500 dark:text-slate-400">f(xₙ)</th>
              <th className="text-right py-1 px-2 text-slate-500 dark:text-slate-400">|error|</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((xn, i) => {
              const err = Math.abs(xn - root)
              return (
                <tr key={i} className={`border-b border-slate-100 dark:border-slate-800 ${i === visibleRows.length - 1 ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}>
                  <td className="py-1 px-2 text-slate-600 dark:text-slate-400">{i}</td>
                  <td className="py-1 px-2 text-right text-indigo-600 dark:text-indigo-400">{xn.toFixed(8)}</td>
                  <td className="py-1 px-2 text-right text-slate-600 dark:text-slate-400">{f(xn).toExponential(3)}</td>
                  <td className="py-1 px-2 text-right text-green-600 dark:text-green-400">{err < 1e-12 ? '< 1e-12' : err.toExponential(3)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center italic px-2">
        Each tangent line predicts the next better approximation. Convergence is quadratic — errors square with each step.
      </p>
    </div>
  )
}
