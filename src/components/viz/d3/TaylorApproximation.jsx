import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 600, H = 380
const M = { top: 20, right: 20, bottom: 40, left: 50 }

const PRESETS = {
  'e^x':       { fn: Math.exp,   label: 'eˣ',     center: 0, xRange: [-3, 3],  coeffs: n => 1 / factorial(n) },
  'sin(x)':    { fn: Math.sin,   label: 'sin x',   center: 0, xRange: [-7, 7],  coeffs: n => n % 2 === 0 ? 0 : (((n - 1) / 2) % 2 === 0 ? 1 : -1) / factorial(n) },
  'cos(x)':    { fn: Math.cos,   label: 'cos x',   center: 0, xRange: [-7, 7],  coeffs: n => n % 2 === 1 ? 0 : ((n / 2) % 2 === 0 ? 1 : -1) / factorial(n) },
  'ln(1+x)':   { fn: x => Math.log(1 + x), label: 'ln(1+x)', center: 0, xRange: [-0.95, 3], coeffs: n => n === 0 ? 0 : (n % 2 === 0 ? -1 : 1) / n },
  '1/(1-x)':   { fn: x => 1 / (1 - x), label: '1/(1−x)', center: 0, xRange: [-2, 0.95], coeffs: () => 1 },
  'arctan(x)': { fn: Math.atan,  label: 'arctan x', center: 0, xRange: [-4, 4],  coeffs: n => n % 2 === 0 ? 0 : (((n - 1) / 2) % 2 === 0 ? 1 : -1) / n },
}

function factorial(n) {
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

function taylorPoly(coeffs, center, degree) {
  return (x) => {
    let sum = 0
    for (let n = 0; n <= degree; n++) {
      const c = coeffs(n)
      if (c === 0) continue
      sum += c * Math.pow(x - center, n)
    }
    return sum
  }
}

const COLORS = ['#94a3b8', '#6470f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

export default function TaylorApproximation({ params }) {
  const svgRef = useRef(null)
  const { preset: initPreset = 'sin(x)' } = params ?? {}
  const [presetKey, setPresetKey] = useState(initPreset)
  const [degree, setDegree] = useState(3)

  const preset = PRESETS[presetKey] ?? PRESETS['sin(x)']

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const [xMin, xMax] = preset.xRange
    const xSc = d3.scaleLinear().domain([xMin, xMax]).range([M.left, W - M.right])
    const step = (xMax - xMin) / 500

    // Sample actual function
    const pts = []
    for (let x = xMin; x <= xMax; x += step) {
      const y = preset.fn(x)
      if (isFinite(y) && Math.abs(y) < 50) pts.push([x, y])
    }

    // Sample Taylor polynomials for each degree
    const taylorCurves = []
    for (let d = 0; d <= degree; d++) {
      const T = taylorPoly(preset.coeffs, preset.center, d)
      // Check if this degree adds a nonzero term
      if (d > 0 && preset.coeffs(d) === 0 && taylorCurves.length > 0) {
        // Skip degrees with zero coefficients (they produce identical curves)
        continue
      }
      const tPts = []
      for (let x = xMin; x <= xMax; x += step) {
        const y = T(x)
        if (isFinite(y) && Math.abs(y) < 50) tPts.push([x, y])
      }
      taylorCurves.push({ degree: d, pts: tPts })
    }

    // Compute y range from actual function
    const allY = pts.map(p => p[1])
    const yExtent = d3.extent(allY)
    const yPad = Math.max((yExtent[1] - yExtent[0]) * 0.3, 1)
    const ySc = d3.scaleLinear()
      .domain([Math.max(yExtent[0] - yPad, -10), Math.min(yExtent[1] + yPad, 10)])
      .range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(8).forEach(t => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(6).forEach(t => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes
    const axY = Math.max(M.top, Math.min(ySc(0), H - M.bottom))
    const axX = Math.max(M.left, Math.min(xSc(0), W - M.right))
    svg.append('g').attr('transform', `translate(0,${axY})`).call(d3.axisBottom(xSc).ticks(8)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${axX},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y)).defined(([, y]) => y !== null && isFinite(y))

    // Draw Taylor curves (earlier degrees more transparent)
    taylorCurves.forEach((tc, i) => {
      const opacity = i === taylorCurves.length - 1 ? 1 : 0.3
      const color = COLORS[i % COLORS.length]
      svg.append('path')
        .datum(tc.pts)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', i === taylorCurves.length - 1 ? 2.5 : 1.5)
        .attr('stroke-dasharray', i === taylorCurves.length - 1 ? null : '5,3')
        .attr('opacity', opacity)
        .attr('d', line)
    })

    // Draw actual function (on top)
    svg.append('path')
      .datum(pts)
      .attr('fill', 'none')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 3)
      .attr('d', line)

    // Legend
    const lg = svg.append('g').attr('transform', `translate(${W - M.right - 130}, ${M.top + 10})`)
    lg.append('rect').attr('width', 125).attr('height', 24 + taylorCurves.length * 18).attr('fill', 'white').attr('fill-opacity', 0.9).attr('stroke', '#e2e8f0').attr('rx', 4)
    lg.append('line').attr('x1', 8).attr('x2', 28).attr('y1', 14).attr('y2', 14).attr('stroke', '#1e293b').attr('stroke-width', 3)
    lg.append('text').attr('x', 32).attr('y', 18).attr('font-size', 10).attr('fill', '#334155').text(preset.label)
    taylorCurves.forEach((tc, i) => {
      const y = 32 + i * 18
      const color = COLORS[i % COLORS.length]
      lg.append('line').attr('x1', 8).attr('x2', 28).attr('y1', y).attr('y2', y).attr('stroke', color).attr('stroke-width', 1.5).attr('stroke-dasharray', i === taylorCurves.length - 1 ? null : '5,3')
      lg.append('text').attr('x', 32).attr('y', y + 4).attr('font-size', 10).attr('fill', '#334155').text(`T${tc.degree}(x)`)
    })

    // Center point marker
    const cx = xSc(preset.center)
    const cy = ySc(preset.fn(preset.center))
    if (cx >= M.left && cx <= W - M.right && cy >= M.top && cy <= H - M.bottom) {
      svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 5).attr('fill', '#6470f1').attr('stroke', 'white').attr('stroke-width', 2)
    }

  }, [presetKey, degree, preset])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3 px-2">
        {Object.keys(PRESETS).map(k => (
          <button
            key={k}
            onClick={() => setPresetKey(k)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              k === presetKey
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {k}
          </button>
        ))}
      </div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2">
        <SliderControl label={`Taylor degree: ${degree}`} min={0} max={15} step={1} value={degree} onChange={setDegree} />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
        Increase the degree to watch the polynomial approximate the function more closely near the center.
      </p>
    </div>
  )
}
