import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 360
const M = { top: 20, right: 22, bottom: 40, left: 52 }
const GRAPH_BOTTOM_PX = 280   // pixel row where the graph area ends
const PANEL_Y = 288           // info panel top

// ── numerical helpers ──────────────────────────────────────────────────────
function trapezoid(fn, a, b, n = 1000) {
  const dx = (b - a) / n
  let sum = 0
  for (let i = 0; i < n; i++) {
    sum += (fn(a + i * dx) + fn(a + (i + 1) * dx)) / 2 * dx
  }
  return sum
}

// ── preset definitions ─────────────────────────────────────────────────────
const PRESETS = [
  {
    label: 'Parabola & Line',
    f: (x) => x,
    g: (x) => x * x,
    fLabel: 'f(x) = x',
    gLabel: 'g(x) = x²',
    xMin: -0.3,
    xMax: 1.3,
    // single region: f > g on (0,1)
    regions: [{ a: 0, b: 1 }],
  },
  {
    label: 'Two Parabolas',
    f: (x) => 4 - x * x,
    g: (x) => x * x - 2,
    fLabel: 'f(x) = 4−x²',
    gLabel: 'g(x) = x²−2',
    xMin: -2.2,
    xMax: 2.2,
    // f > g on (-√3, √3)
    regions: [{ a: -Math.sqrt(3), b: Math.sqrt(3) }],
  },
  {
    label: 'Sin & Cos',
    f: (x) => Math.sin(x),
    g: (x) => Math.cos(x),
    fLabel: 'f(x) = sin x',
    gLabel: 'g(x) = cos x',
    xMin: 0,
    xMax: Math.PI * 1.6,
    // sin > cos on (π/4, 5π/4)
    regions: [{ a: Math.PI / 4, b: 5 * Math.PI / 4 }],
  },
  {
    label: 'Cubic Region',
    f: (x) => x,
    g: (x) => x * x * x,
    fLabel: 'f(x) = x',
    gLabel: 'g(x) = x³',
    xMin: -1.3,
    xMax: 1.3,
    // two sub-regions: x > x³ on (0,1), x³ > x on (-1,0)
    regions: [
      { a: -1, b: 0, flip: true },   // g > f here
      { a: 0, b: 1 },                // f > g here
    ],
  },
]

// palette for multiple regions
const REGION_COLORS = ['#a78bfa', '#f9a8d4', '#6ee7b7', '#fcd34d']

function computeArea(preset) {
  return preset.regions.reduce((sum, { a, b, flip }) => {
    const fn = flip
      ? (x) => Math.abs(preset.g(x) - preset.f(x))
      : (x) => Math.abs(preset.f(x) - preset.g(x))
    return sum + trapezoid(fn, a, b)
  }, 0)
}

export default function AreaBetweenCurves() {
  const svgRef = useRef(null)
  const [presetIdx, setPresetIdx] = useState(0)
  const [hoverX, setHoverX] = useState(null)

  const preset = PRESETS[presetIdx]
  const area = computeArea(preset)

  // mouse handler: map SVG clientX → data x
  function handleMouseMove(e) {
    const svgEl = svgRef.current
    if (!svgEl) return
    const rect = svgEl.getBoundingClientRect()
    const svgW = rect.width
    const scaleX = W / svgW
    const rawX = (e.clientX - rect.left) * scaleX
    const xSc = d3.scaleLinear().domain([preset.xMin, preset.xMax]).range([M.left, W - M.right])
    const dataX = xSc.invert(rawX)
    if (dataX >= preset.xMin && dataX <= preset.xMax) {
      setHoverX(dataX)
    } else {
      setHoverX(null)
    }
  }

  function handleMouseLeave() {
    setHoverX(null)
  }

  useEffect(() => {
    setHoverX(null)
  }, [presetIdx])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { f, g, fLabel, gLabel, xMin, xMax, regions } = preset

    // ── scales ──────────────────────────────────────────────────────────
    const N = 600
    const xs = d3.range(N + 1).map((i) => xMin + i * (xMax - xMin) / N)
    const ys = xs.flatMap((x) => [f(x), g(x), 0])
    const yMin = Math.min(...ys)
    const yMax = Math.max(...ys)
    const yPad = Math.max((yMax - yMin) * 0.15, 0.4)

    const xSc = d3.scaleLinear().domain([xMin, xMax]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([yMin - yPad, yMax + yPad]).range([GRAPH_BOTTOM_PX - M.bottom, M.top])

    // ── gridlines ────────────────────────────────────────────────────────
    xSc.ticks(7).forEach((t) =>
      svg.append('line')
        .attr('x1', xSc(t)).attr('x2', xSc(t))
        .attr('y1', M.top).attr('y2', GRAPH_BOTTOM_PX - M.bottom)
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    )
    ySc.ticks(6).forEach((y) =>
      svg.append('line')
        .attr('x1', M.left).attr('x2', W - M.right)
        .attr('y1', ySc(y)).attr('y2', ySc(y))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    )

    // ── axes ─────────────────────────────────────────────────────────────
    svg.append('g')
      .attr('transform', `translate(0,${ySc(0)})`)
      .call(d3.axisBottom(xSc).ticks(7))
      .attr('color', '#94a3b8')

    svg.append('g')
      .attr('transform', `translate(${M.left},0)`)
      .call(d3.axisLeft(ySc).ticks(6))
      .attr('color', '#94a3b8')

    // ── shaded regions ───────────────────────────────────────────────────
    regions.forEach(({ a, b, flip }, ri) => {
      const color = REGION_COLORS[ri % REGION_COLORS.length]
      const steps = 400
      const dx = (b - a) / steps
      const regionPts = d3.range(steps + 1).map((j) => {
        const x = a + j * dx
        return [x, f(x), g(x)]
      })

      // area between: y0 = bottom of band, y1 = top of band
      const areaFn = d3.area()
        .x(([x]) => xSc(x))
        .y0(([, fv, gv]) => ySc(flip ? Math.max(fv, gv) : Math.min(fv, gv)))
        .y1(([, fv, gv]) => ySc(flip ? Math.min(fv, gv) : Math.max(fv, gv)))

      svg.append('path')
        .datum(regionPts)
        .attr('fill', color)
        .attr('opacity', 0.3)
        .attr('d', areaFn)

      // integral label inside shaded region
      const midX = (a + b) / 2
      const midFv = f(midX)
      const midGv = g(midX)
      const labelY = ySc((midFv + midGv) / 2)
      svg.append('text')
        .attr('x', xSc(midX)).attr('y', labelY)
        .attr('text-anchor', 'middle').attr('font-size', 9.5)
        .attr('fill', '#7c3aed').attr('opacity', 0.9)
        .text('∫[f−g]dx')
    })

    // ── intersection dots ─────────────────────────────────────────────────
    const allBounds = new Set()
    regions.forEach(({ a, b }) => { allBounds.add(a); allBounds.add(b) })
    allBounds.forEach((xi) => {
      const yi = f(xi)
      svg.append('circle')
        .attr('cx', xSc(xi)).attr('cy', ySc(yi))
        .attr('r', 5).attr('fill', '#f59e0b').attr('stroke', '#fff').attr('stroke-width', 1.5)

      const labelText = `(${xi % 1 === 0 ? xi : xi.toFixed(2)}, ${yi % 1 === 0 ? yi : yi.toFixed(2)})`
      const textAnchor = xi < (xMin + xMax) / 2 ? 'end' : 'start'
      const dx = xi < (xMin + xMax) / 2 ? -8 : 8
      svg.append('text')
        .attr('x', xSc(xi) + dx).attr('y', ySc(yi) - 8)
        .attr('text-anchor', textAnchor).attr('font-size', 9).attr('fill', '#b45309')
        .text(labelText)
    })

    // ── curve f(x) ────────────────────────────────────────────────────────
    const fPts = xs.map((x) => [x, f(x)])
    const lineFn = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y))
    svg.append('path')
      .datum(fPts)
      .attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5)
      .attr('d', lineFn)

    // ── curve g(x) ────────────────────────────────────────────────────────
    const gPts = xs.map((x) => [x, g(x)])
    svg.append('path')
      .datum(gPts)
      .attr('fill', 'none').attr('stroke', '#10b981').attr('stroke-width', 2.5)
      .attr('d', lineFn)

    // ── curve labels ──────────────────────────────────────────────────────
    // Place f label near right end of curve
    const fLabelX = xMax - (xMax - xMin) * 0.08
    svg.append('text')
      .attr('x', xSc(fLabelX)).attr('y', ySc(f(fLabelX)) - 8)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('font-weight', 600)
      .attr('fill', '#6470f1')
      .text(fLabel)

    const gLabelX = xMax - (xMax - xMin) * 0.08
    svg.append('text')
      .attr('x', xSc(gLabelX)).attr('y', ySc(g(gLabelX)) + 14)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('font-weight', 600)
      .attr('fill', '#10b981')
      .text(gLabel)

    // ── hover readout ─────────────────────────────────────────────────────
    if (hoverX !== null && hoverX >= xMin && hoverX <= xMax) {
      const fv = f(hoverX)
      const gv = g(hoverX)
      const diff = fv - gv

      // vertical guide
      svg.append('line')
        .attr('x1', xSc(hoverX)).attr('x2', xSc(hoverX))
        .attr('y1', M.top).attr('y2', GRAPH_BOTTOM_PX - M.bottom)
        .attr('stroke', '#f59e0b').attr('stroke-width', 1.2).attr('stroke-dasharray', '4,3')

      // dots on each curve
      svg.append('circle').attr('cx', xSc(hoverX)).attr('cy', ySc(fv)).attr('r', 4).attr('fill', '#6470f1')
      svg.append('circle').attr('cx', xSc(hoverX)).attr('cy', ySc(gv)).attr('r', 4).attr('fill', '#10b981')

      // tooltip box
      const tipX = hoverX > (xMin + xMax) / 2 ? xSc(hoverX) - 110 : xSc(hoverX) + 10
      const tipY = M.top + 4
      svg.append('rect')
        .attr('x', tipX).attr('y', tipY)
        .attr('width', 100).attr('height', 48).attr('rx', 5)
        .attr('fill', '#1e293b').attr('opacity', 0.85)

      svg.append('text')
        .attr('x', tipX + 6).attr('y', tipY + 14)
        .attr('font-size', 9.5).attr('fill', '#a5b4fc')
        .text(`f(${hoverX.toFixed(2)}) = ${fv.toFixed(3)}`)

      svg.append('text')
        .attr('x', tipX + 6).attr('y', tipY + 28)
        .attr('font-size', 9.5).attr('fill', '#6ee7b7')
        .text(`g(${hoverX.toFixed(2)}) = ${gv.toFixed(3)}`)

      svg.append('text')
        .attr('x', tipX + 6).attr('y', tipY + 42)
        .attr('font-size', 9.5)
        .attr('fill', diff >= 0 ? '#fde68a' : '#fca5a5')
        .text(`f−g = ${diff.toFixed(3)}`)
    }

    // ── info panel ────────────────────────────────────────────────────────
    // Build bounds string
    const boundsStr = regions.map(({ a, b }) => {
      const af = a % 1 === 0 ? a : a.toFixed(3)
      const bf = b % 1 === 0 ? b : b.toFixed(3)
      return `[${af}, ${bf}]`
    }).join(' ∪ ')

    svg.append('text')
      .attr('x', W / 2).attr('y', PANEL_Y + 18)
      .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', '#334155')
      .attr('font-weight', 600)
      .text(`Area = ∫ₐᵇ [f(x) − g(x)] dx = ${area.toFixed(4)}`)

    svg.append('text')
      .attr('x', W / 2).attr('y', PANEL_Y + 36)
      .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#94a3b8')
      .text(`Integration bounds: ${boundsStr}`)

  }, [presetIdx, hoverX])

  return (
    <div>
      <svg
        ref={svgRef}
        width="100%"
        viewBox={"0 0 " + W + " " + H}
        className="overflow-visible cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      <div className="px-4 mt-1">
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setPresetIdx(i)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                i === presetIdx
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic px-4">
        Area between curves = ∫ₐᵇ [top − bottom] dx. Find intersection points to determine limits a and b.
        Where the curves cross, split the integral.
      </p>
    </div>
  )
}
