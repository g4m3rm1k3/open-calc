import * as d3 from 'd3'
import { useRef, useEffect, useState, useCallback } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580
const HF = 220   // top panel height (f)
const HFP = 160  // bottom panel height (f')
const M = { top: 16, right: 20, bottom: 36, left: 52 }

const PRESETS = [
  {
    label: 'x³ − 3x',
    f:  x => x ** 3 - 3 * x,
    fp: x => 3 * x ** 2 - 3,
    domain: [-2.5, 2.5],
    yDomain: [-4, 4],
    fpDomain: [-1, 10],
  },
  {
    label: 'sin(x)',
    f:  x => Math.sin(x),
    fp: x => Math.cos(x),
    domain: [-Math.PI * 1.5, Math.PI * 1.5],
    yDomain: [-1.5, 1.5],
    fpDomain: [-1.5, 1.5],
  },
  {
    label: 'x²',
    f:  x => x ** 2,
    fp: x => 2 * x,
    domain: [-3, 3],
    yDomain: [-1, 9],
    fpDomain: [-6, 6],
  },
]

function buildLine(xSc, ySc) {
  return d3.line()
    .defined(d => isFinite(d.y))
    .x(d => xSc(d.x))
    .y(d => ySc(d.y))
    .curve(d3.curveCatmullRom)
}

function drawAxes(svg, xSc, ySc, h, ticks = 6) {
  const xPos = Math.max(M.top, Math.min(h - M.bottom, ySc(0)))
  const yPos = Math.max(M.left, Math.min(W - M.right, xSc(0)))
  svg.append('g').attr('transform', `translate(0,${xPos})`).call(d3.axisBottom(xSc).ticks(ticks)).attr('color', '#94a3b8')
  svg.append('g').attr('transform', `translate(${yPos},0)`).call(d3.axisLeft(ySc).ticks(ticks)).attr('color', '#94a3b8')
}

function drawGrid(svg, xSc, ySc, h) {
  xSc.ticks(8).forEach(t =>
    svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', h - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
  )
  ySc.ticks(6).forEach(t =>
    svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
  )
}

const N_CURVE = 400

export default function DerivativeBuilder() {
  const topRef = useRef(null)
  const botRef = useRef(null)

  const [presetIdx, setPresetIdx] = useState(0)
  const [xVal, setXVal] = useState(0)
  const [trace, setTrace] = useState([])
  const [showAnswer, setShowAnswer] = useState(false)

  const preset = PRESETS[presetIdx]
  const { f, fp, domain, yDomain, fpDomain } = preset
  const slope = fp(xVal)

  // Add current point to trace whenever xVal changes (after first meaningful drag)
  const handleX = useCallback((v) => {
    setXVal(v)
    setTrace(prev => {
      // avoid duplicates
      if (prev.length && Math.abs(prev[prev.length - 1].x - v) < 0.04) return prev
      return [...prev, { x: v, y: fp(v) }]
    })
  }, [fp]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset trace when preset changes
  useEffect(() => {
    setTrace([])
    setXVal((domain[0] + domain[1]) / 2)
  }, [presetIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Top SVG (f) ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const svg = d3.select(topRef.current)
    svg.selectAll('*').remove()

    const xSc = d3.scaleLinear().domain(domain).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain(yDomain).range([HF - M.bottom, M.top])

    drawGrid(svg, xSc, ySc, HF)

    // f(x) curve — blue
    const pts = d3.range(N_CURVE).map(i => {
      const x = domain[0] + (i / (N_CURVE - 1)) * (domain[1] - domain[0])
      return { x, y: f(x) }
    })
    svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', '#3b82f6').attr('stroke-width', 2.5).attr('d', buildLine(xSc, ySc))

    // Tangent line: y - f(x0) = slope*(x - x0)  → clamp to domain
    const x0 = xVal, y0 = f(xVal), m = slope
    const tangentPts = domain.map(xd => ({ x: xd, y: y0 + m * (xd - x0) }))
      .filter(d => d.y >= yDomain[0] - 0.5 && d.y <= yDomain[1] + 0.5)
    if (tangentPts.length >= 2) {
      svg.append('line')
        .attr('x1', xSc(tangentPts[0].x)).attr('y1', ySc(tangentPts[0].y))
        .attr('x2', xSc(tangentPts[tangentPts.length - 1].x)).attr('y2', ySc(tangentPts[tangentPts.length - 1].y))
        .attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('stroke-linecap', 'round')
    }

    // Tangent point
    svg.append('circle').attr('cx', xSc(x0)).attr('cy', ySc(y0)).attr('r', 6).attr('fill', '#f59e0b').attr('stroke', '#fff').attr('stroke-width', 1.5)

    drawAxes(svg, xSc, ySc, HF)

    // Label
    svg.append('text').attr('x', M.left + 6).attr('y', M.top + 14).attr('font-size', 13).attr('fill', '#3b82f6').attr('font-weight', '600').text('f(x)')
  }, [xVal, slope, f, domain, yDomain]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Bottom SVG (f') ───────────────────────────────────────────────────────────
  useEffect(() => {
    const svg = d3.select(botRef.current)
    svg.selectAll('*').remove()

    const xSc = d3.scaleLinear().domain(domain).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain(fpDomain).range([HFP - M.bottom, M.top])

    drawGrid(svg, xSc, ySc, HFP)

    // True f'(x) dashed — only if showAnswer
    if (showAnswer) {
      const fpPts = d3.range(N_CURVE).map(i => {
        const x = domain[0] + (i / (N_CURVE - 1)) * (domain[1] - domain[0])
        return { x, y: fp(x) }
      })
      svg.append('path').datum(fpPts)
        .attr('fill', 'none').attr('stroke', '#94a3b8').attr('stroke-width', 1.8)
        .attr('stroke-dasharray', '6,4')
        .attr('d', buildLine(xSc, ySc))
    }

    // Trace path
    if (trace.length > 1) {
      const sorted = [...trace].sort((a, b) => a.x - b.x)
      svg.append('path').datum(sorted)
        .attr('fill', 'none').attr('stroke', '#22c55e').attr('stroke-width', 2)
        .attr('d', buildLine(xSc, ySc))
    }

    // Trace dots
    trace.forEach(pt => {
      svg.append('circle')
        .attr('cx', xSc(pt.x)).attr('cy', ySc(pt.y))
        .attr('r', 3).attr('fill', '#22c55e').attr('opacity', 0.8)
    })

    // Current point on f' panel
    svg.append('circle')
      .attr('cx', xSc(xVal)).attr('cy', ySc(fp(xVal)))
      .attr('r', 5).attr('fill', '#f59e0b').attr('stroke', '#fff').attr('stroke-width', 1.5)

    drawAxes(svg, xSc, ySc, HFP)

    svg.append('text').attr('x', M.left + 6).attr('y', M.top + 14).attr('font-size', 13).attr('fill', '#22c55e').attr('font-weight', '600').text("f '(x) — tracing…")
  }, [xVal, trace, showAnswer, fp, domain, fpDomain]) // eslint-disable-line react-hooks/exhaustive-deps

  const enoughTrace = trace.length >= 20
  const coversDomain = trace.length > 5 && (Math.max(...trace.map(p => p.x)) - Math.min(...trace.map(p => p.x))) > (domain[1] - domain[0]) * 0.6

  return (
    <div className="flex flex-col gap-2">
      <svg ref={topRef} width={W} height={HF} className="w-full overflow-visible" />

      <div className="px-2">
        <SliderControl
          label={`x = ${xVal.toFixed(2)}, slope = ${slope.toFixed(2)}`}
          min={domain[0]} max={domain[1]} step={0.05}
          value={xVal}
          onChange={handleX}
          format={() => `${xVal.toFixed(2)}`}
        />
      </div>

      <svg ref={botRef} width={W} height={HFP} className="w-full overflow-visible" />

      {coversDomain && enoughTrace && (
        <p className="text-center text-sm font-semibold text-green-600 dark:text-green-400">
          You've traced the shape — this IS f'(x)!
        </p>
      )}

      <div className="px-2 flex flex-wrap items-center gap-2 justify-between">
        <div className="flex gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => setPresetIdx(i)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${i === presetIdx ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAnswer(v => !v)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${showAnswer ? 'bg-slate-400 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
          >
            {showAnswer ? "Hide f'(x)" : "Show f'(x)"}
          </button>
          <button
            onClick={() => { setTrace([]); setXVal((domain[0] + domain[1]) / 2) }}
            className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100"
          >
            Reset Trace
          </button>
        </div>
      </div>
    </div>
  )
}
