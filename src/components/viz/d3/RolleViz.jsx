import * as d3 from 'd3'
import { useRef, useEffect, useState, useCallback } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 320
const M = { top: 30, right: 20, bottom: 50, left: 55 }

// All three presets have f(a) = f(b) by construction — that's the whole point
const PRESETS = [
  {
    label: 'f(x) = x²',
    sublabel: 'on [−1, 1]',
    f: (x) => x * x,
    fPrime: (x) => 2 * x,
    a: -1, b: 1,
    domain: [-1.4, 1.4],
    yDomain: [-0.3, 1.6],
    endpointHeight: 1,
    endpointLabel: 'f(a) = f(b) = 1',
  },
  {
    label: 'f(x) = x³ − 4x',
    sublabel: 'on [−2, 2]',
    f: (x) => x * x * x - 4 * x,
    fPrime: (x) => 3 * x * x - 4,
    a: -2, b: 2,
    domain: [-2.4, 2.4],
    yDomain: [-4.5, 4.5],
    endpointHeight: 0,
    endpointLabel: 'f(a) = f(b) = 0',
  },
  {
    label: 'f(x) = sin(x)',
    sublabel: 'on [0, 2π]',
    f: (x) => Math.sin(x),
    fPrime: (x) => Math.cos(x),
    a: 0, b: 2 * Math.PI,
    domain: [-0.3, 6.7],
    yDomain: [-1.4, 1.4],
    endpointHeight: 0,
    endpointLabel: 'f(a) = f(b) = 0',
  },
]

function findZeros(fPrime, a, b, tol = 1e-6) {
  const n = 400
  const step = (b - a) / n
  const results = []
  for (let i = 0; i < n; i++) {
    const x0 = a + i * step
    const x1 = x0 + step
    if (fPrime(x0) * fPrime(x1) <= 0) {
      let lo = x0, hi = x1
      for (let iter = 0; iter < 60; iter++) {
        const mid = (lo + hi) / 2
        if (Math.abs(hi - lo) < tol) break
        if (fPrime(lo) * fPrime(mid) <= 0) hi = mid
        else lo = mid
      }
      const c = (lo + hi) / 2
      if (c > a + tol && c < b - tol) results.push(c)
    }
  }
  return results
}

export default function RolleViz() {
  const svgRef = useRef(null)
  const [fnIdx, setFnIdx] = useState(0)
  const [probeX, setProbeX] = useState(null)   // null = no probe

  const preset = PRESETS[fnIdx]
  const { f, fPrime, a, b, domain, yDomain } = preset
  const cPoints = findZeros(fPrime, a, b)

  // Initialise probe to midpoint on preset change
  const midpoint = (a + b) / 2

  const handleFnChange = useCallback((idx) => {
    setFnIdx(idx)
    setProbeX(null)
  }, [])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xSc = d3.scaleLinear().domain(domain).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain(yDomain).range([H - M.bottom, M.top])

    // Light grid
    xSc.ticks(7).forEach((t) => {
      svg.append('line')
        .attr('x1', xSc(t)).attr('x2', xSc(t))
        .attr('y1', M.top).attr('y2', H - M.bottom)
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })
    ySc.ticks(6).forEach((t) => {
      svg.append('line')
        .attr('x1', M.left).attr('x2', W - M.right)
        .attr('y1', ySc(t)).attr('y2', ySc(t))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })

    // Axes
    const xAxisY = Math.max(M.top, Math.min(H - M.bottom, ySc(0)))
    const yAxisX = Math.max(M.left, Math.min(W - M.right, xSc(0)))
    svg.append('g').attr('transform', `translate(0,${xAxisY})`).call(d3.axisBottom(xSc).ticks(7)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${yAxisX},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    const lineFn = d3.line()
      .x(([x]) => xSc(x))
      .y(([, y]) => ySc(y))
      .defined(([, y]) => isFinite(y))

    // Shaded region between a and b
    const shadePts = d3.range(a, b + 0.005, (b - a) / 200).map((x) => [x, f(x)])
    const shadeArea = d3.area()
      .x(([x]) => xSc(x))
      .y0(xAxisY)
      .y1(([, y]) => ySc(y))
      .defined(([, y]) => isFinite(y))
    svg.append('path').datum(shadePts)
      .attr('fill', '#6366f1').attr('opacity', 0.07)
      .attr('d', shadeArea)

    // Full curve — blue/indigo
    const pts = d3.range(domain[0], domain[1] + 0.005, (domain[1] - domain[0]) / 400).map((x) => [x, f(x)])
    svg.append('path').datum(pts)
      .attr('fill', 'none').attr('stroke', '#6366f1').attr('stroke-width', 2.5)
      .attr('d', lineFn)

    // Equal-height horizontal reference line in amber dashes
    const h = preset.endpointHeight
    if (Math.abs(ySc(h) - xAxisY) > 2 || true) {
      svg.append('line')
        .attr('x1', xSc(a) - 6).attr('x2', xSc(b) + 6)
        .attr('y1', ySc(h)).attr('y2', ySc(h))
        .attr('stroke', '#f59e0b').attr('stroke-width', 1.8)
        .attr('stroke-dasharray', '6,4')
    }

    // Endpoint circles (amber) + vertical drop lines
    ;[a, b].forEach((xv, i) => {
      const label = i === 0 ? 'a' : 'b'
      svg.append('line')
        .attr('x1', xSc(xv)).attr('x2', xSc(xv))
        .attr('y1', ySc(f(xv))).attr('y2', xAxisY)
        .attr('stroke', '#f59e0b').attr('stroke-dasharray', '3,3').attr('stroke-width', 1.2)
      svg.append('circle').attr('cx', xSc(xv)).attr('cy', ySc(f(xv))).attr('r', 7).attr('fill', '#f59e0b')
      svg.append('text')
        .attr('x', xSc(xv)).attr('y', ySc(f(xv)) - 12)
        .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#f59e0b').attr('font-weight', '700')
        .text(label)
    })

    // Guaranteed c points — green with horizontal tangent lines
    cPoints.forEach((c, idx) => {
      const fc = f(c)
      const tangentHalfWidth = Math.min(0.75, (b - a) * 0.22)
      const tx1 = Math.max(domain[0], c - tangentHalfWidth)
      const tx2 = Math.min(domain[1], c + tangentHalfWidth)

      // Horizontal tangent (green, solid) — f'(c) = 0 so it's literally flat
      svg.append('line')
        .attr('x1', xSc(tx1)).attr('x2', xSc(tx2))
        .attr('y1', ySc(fc)).attr('y2', ySc(fc))
        .attr('stroke', '#10b981').attr('stroke-width', 3)

      // Vertical dashed line from c down to axis
      svg.append('line')
        .attr('x1', xSc(c)).attr('x2', xSc(c))
        .attr('y1', ySc(fc)).attr('y2', xAxisY)
        .attr('stroke', '#10b981').attr('stroke-dasharray', '4,3').attr('stroke-width', 1.5)

      svg.append('circle').attr('cx', xSc(c)).attr('cy', ySc(fc)).attr('r', 7).attr('fill', '#10b981')

      const cLabel = cPoints.length > 1 ? `c${idx + 1}` : 'c'
      const labelOffset = ySc(fc) < ySc(preset.endpointHeight) ? -14 : 14
      svg.append('text')
        .attr('x', xSc(c)).attr('y', ySc(fc) + labelOffset)
        .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#10b981').attr('font-weight', '700')
        .text(cLabel)
    })

    // Probe tangent (optional) — shows slope at user-dragged x
    if (probeX !== null) {
      const px = Math.max(a + 0.01, Math.min(b - 0.01, probeX))
      const py = f(px)
      const slope = fPrime(px)
      const hw = Math.min(0.65, (b - a) * 0.18)
      const tx1 = Math.max(domain[0], px - hw)
      const tx2 = Math.min(domain[1], px + hw)
      const tanY1 = py + slope * (tx1 - px)
      const tanY2 = py + slope * (tx2 - px)

      // Color based on slope sign
      const slopeColor = Math.abs(slope) < 0.15 ? '#10b981' : slope > 0 ? '#f59e0b' : '#f43f5e'

      svg.append('line')
        .attr('x1', xSc(tx1)).attr('x2', xSc(tx2))
        .attr('y1', ySc(tanY1)).attr('y2', ySc(tanY2))
        .attr('stroke', slopeColor).attr('stroke-width', 2.5).attr('opacity', 0.85)

      svg.append('circle').attr('cx', xSc(px)).attr('cy', ySc(py)).attr('r', 5).attr('fill', slopeColor)

      // Slope readout
      svg.append('text')
        .attr('x', W - M.right - 4).attr('y', M.top + 14)
        .attr('text-anchor', 'end').attr('font-size', 11).attr('fill', slopeColor).attr('font-family', 'monospace')
        .text(`f′(${px.toFixed(2)}) = ${slope.toFixed(3)}`)
    }

    // Top-left: function label
    svg.append('text')
      .attr('x', M.left + 4).attr('y', M.top + 15)
      .attr('font-size', 12).attr('fill', '#6366f1').attr('font-family', 'monospace')
      .text(`${preset.label}  ${preset.sublabel}`)

    // Bottom: equal endpoints annotation
    svg.append('text')
      .attr('x', W / 2).attr('y', H - M.bottom + 18)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#f59e0b').attr('font-family', 'monospace')
      .text(preset.endpointLabel)

    // Green label: c guaranty
    if (cPoints.length > 0) {
      const labels = cPoints.map((c, i) => {
        const lbl = cPoints.length > 1 ? `c${i + 1}` : 'c'
        return `${lbl} = ${c.toFixed(3)}`
      }).join('   ')
      svg.append('text')
        .attr('x', W / 2).attr('y', H - M.bottom + 32)
        .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#10b981').attr('font-family', 'monospace')
        .text(`f′(c) = 0  at  ${labels}`)
    }

  }, [fnIdx, probeX, preset, cPoints, a, b, domain, yDomain, f, fPrime])

  const probeSliderMin = Math.round((a + (b - a) * 0.05) * 100) / 100
  const probeSliderMax = Math.round((b - (b - a) * 0.05) * 100) / 100
  const probeSliderDefault = Math.round(midpoint * 100) / 100

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-3">
        {/* Preset selector */}
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleFnChange(i)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${fnIdx === i ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            >
              {p.label} {p.sublabel}
            </button>
          ))}
        </div>
        {/* Probe slider */}
        <SliderControl
          label="Explore tangent slope"
          min={probeSliderMin}
          max={probeSliderMax}
          step={0.02}
          value={probeX ?? probeSliderDefault}
          onChange={setProbeX}
          format={(v) => v.toFixed(2)}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
          <span className="text-amber-500 font-semibold">Amber dashed line</span>: equal endpoint heights &mdash; f(a) = f(b).
          {' '}<span className="text-emerald-500 font-semibold">Green</span>: guaranteed c where f′(c) = 0.
          {' '}Drag the probe to watch the slope go from positive to negative &mdash; it must cross zero somewhere (IVT on f′).
        </p>
      </div>
    </div>
  )
}
