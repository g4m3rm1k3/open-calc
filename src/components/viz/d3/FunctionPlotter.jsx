import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'

const W = 600, H = 380
const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 }

const PRESETS = [
  { label: 'x²', fn: (x) => x * x, domain: [-3, 3] },
  { label: 'sin(x)', fn: Math.sin, domain: [-2 * Math.PI, 2 * Math.PI] },
  { label: '1/x', fn: (x) => 1 / x, domain: [-4, 4] },
  { label: 'eˣ', fn: Math.exp, domain: [-3, 2] },
  { label: '√x', fn: (x) => x >= 0 ? Math.sqrt(x) : null, domain: [0, 9] },
  { label: 'ln(x)', fn: (x) => x > 0 ? Math.log(x) : null, domain: [0.01, 8] },
]

function makeFn(expr) {
  try {
    // eslint-disable-next-line no-new-func
    const compiled = new Function('x', `"use strict"; return (${expr})`)
    return (x) => {
      try {
        const y = compiled(x)
        return Number.isFinite(y) ? y : null
      } catch {
        return null
      }
    }
  } catch {
    return () => null
  }
}

export default function FunctionPlotter({ params }) {
  const svgRef = useRef(null)
  const [presetIdx, setPresetIdx] = useState(0)

  const hasCustom = !!params?.fn
  const preset = PRESETS[presetIdx]

  const active = hasCustom
    ? {
        label: params?.label ?? `f(x) = ${params.fn}`,
        fn: typeof params.fn === 'function' ? params.fn : makeFn(params.fn),
        domain: [params?.xMin ?? -5, params?.xMax ?? 5],
      }
    : preset

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const [xMin, xMax] = active.domain
    const xSc = d3.scaleLinear().domain([xMin, xMax]).range([MARGIN.left, W - MARGIN.right])

    // Sample y values
    const pts = []
    const steps = 500
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin)
      const y = active.fn(x)
      if (y !== null && isFinite(y)) pts.push([x, y])
    }

    if (!pts.length) {
      svg.append('text')
        .attr('x', W / 2)
        .attr('y', H / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('fill', '#64748b')
        .text('No valid points for this function/domain')
      return
    }

    const yVals = pts.map((p) => p[1])
    const [yMin, yMax] = d3.extent(yVals)
    const padding = (yMax - yMin) * 0.1 || 1
    const ySc = d3.scaleLinear().domain([yMin - padding, yMax + padding]).range([H - MARGIN.bottom, MARGIN.top])

    // Axes
    svg.append('g').attr('transform', `translate(0,${ySc(0) < MARGIN.top ? MARGIN.top : ySc(0) > H - MARGIN.bottom ? H - MARGIN.bottom : ySc(0)})`)
      .call(d3.axisBottom(xSc).ticks(8))
      .attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${xSc(0) < MARGIN.left ? MARGIN.left : xSc(0) > W - MARGIN.right ? W - MARGIN.right : xSc(0)},0)`)
      .call(d3.axisLeft(ySc).ticks(6))
      .attr('color', '#94a3b8')

    // Grid
    const xTicks = xSc.ticks(8)
    xTicks.forEach((t) => {
      svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', MARGIN.top).attr('y2', H - MARGIN.bottom)
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })
    const yTicks = ySc.ticks(6)
    yTicks.forEach((t) => {
      svg.append('line').attr('x1', MARGIN.left).attr('x2', W - MARGIN.right).attr('y1', ySc(t)).attr('y2', ySc(t))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })

    // Curve — handle discontinuities by splitting at gaps
    const line = d3.line().x((d) => xSc(d[0])).y((d) => ySc(d[1])).defined((d) => d !== null)

    // Split into contiguous segments
    const segments = []
    let seg = []
    for (const p of pts) {
      seg.push(p)
      // Detect large gap (discontinuity) by checking steep dy
      if (seg.length > 1) {
        const prev = seg[seg.length - 2]
        const dy = Math.abs(ySc(p[1]) - ySc(prev[1]))
        if (dy > 60) {
          segments.push(seg.slice(0, -1))
          seg = [p]
        }
      }
    }
    if (seg.length) segments.push(seg)

    segments.forEach((s) => {
      svg.append('path').datum(s).attr('fill', 'none')
        .attr('stroke', '#6470f1').attr('stroke-width', 2.5)
        .attr('d', line)
    })

    svg.append('text')
      .attr('x', W / 2)
      .attr('y', MARGIN.top - 6)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('fill', '#475569')
      .text(active.label)

  }, [presetIdx, hasCustom, params])

  return (
    <div>
      {!hasCustom && (
        <div className="flex gap-2 flex-wrap mb-3">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => setPresetIdx(i)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                i === presetIdx
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-brand-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
    </div>
  )
}
