import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 380
const M = { top: 18, right: 22, bottom: 42, left: 52 }
const GRAPH_H = 260   // graph occupies y: 0..260 in SVG coords
const PANEL_Y = 275   // info panel starts here

const PRESETS = [
  {
    label: 'Moving Right',
    v: (t) => 3 * t - 3,
    tMin: 0,
    tMax: 4,
    zeros: [1],
  },
  {
    label: 'Oscillating',
    v: (t) => Math.sin(t),
    tMin: 0,
    tMax: 2 * Math.PI,
    zeros: [Math.PI],
  },
  {
    label: 'Forward then Back',
    v: (t) => 4 - 2 * t,
    tMin: 0,
    tMax: 5,
    zeros: [2],
  },
]

function numericalIntegral(fn, a, b, n = 1000) {
  const dt = (b - a) / n
  let sum = 0
  for (let i = 0; i < n; i++) {
    const t0 = a + i * dt
    const t1 = t0 + dt
    sum += (fn(t0) + fn(t1)) / 2 * dt
  }
  return sum
}

function computeStats(preset, tEnd) {
  const { v, tMin } = preset
  const disp = numericalIntegral(v, tMin, tEnd)
  const dist = numericalIntegral((t) => Math.abs(v(t)), tMin, tEnd)
  return { disp, dist }
}

// Position along number line at time tEnd
function positionAt(preset, tEnd) {
  return numericalIntegral(preset.v, preset.tMin, tEnd)
}

export default function SignedArea() {
  const svgRef = useRef(null)
  const [presetIdx, setPresetIdx] = useState(0)
  const [tEnd, setTEnd] = useState(PRESETS[0].tMax)
  const [showPath, setShowPath] = useState(false)

  const preset = PRESETS[presetIdx]
  const { disp, dist } = computeStats(preset, tEnd)

  useEffect(() => {
    setTEnd(preset.tMax)
  }, [presetIdx])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { v, tMin, tMax, zeros } = preset

    // ── scales ────────────────────────────────────────────────────────────
    const graphTop = M.top
    const graphBottom = GRAPH_H - M.bottom  // pixel row of x-axis baseline

    // sample velocity range for y domain
    const N_SAMPLE = 400
    const pts = d3.range(tMin, tMax, (tMax - tMin) / N_SAMPLE).map((t) => v(t))
    const vMin = Math.min(...pts, 0)
    const vMax = Math.max(...pts, 0)
    const vPad = Math.max((vMax - vMin) * 0.15, 0.5)

    const xSc = d3.scaleLinear()
      .domain([tMin, tMax])
      .range([M.left, W - M.right])

    const ySc = d3.scaleLinear()
      .domain([vMin - vPad, vMax + vPad])
      .range([graphBottom, graphTop])

    // ── optional position path strip ─────────────────────────────────────
    const pathStripH = 28
    const pathStripY = graphTop   // drawn above graph when toggled
    if (showPath) {
      const stripG = svg.append('g')
      stripG.append('rect')
        .attr('x', M.left).attr('y', pathStripY)
        .attr('width', W - M.left - M.right).attr('height', pathStripH)
        .attr('fill', '#f1f5f9').attr('rx', 4)

      // number line ticks
      const maxDisp = Math.max(Math.abs(positionAt(preset, tMax)), 1)
      const nlSc = d3.scaleLinear()
        .domain([-maxDisp * 1.1, maxDisp * 1.1])
        .range([M.left + 10, W - M.right - 10])

      stripG.append('line')
        .attr('x1', M.left + 10).attr('x2', W - M.right - 10)
        .attr('y1', pathStripY + pathStripH / 2).attr('y2', pathStripY + pathStripH / 2)
        .attr('stroke', '#94a3b8').attr('stroke-width', 1.5)

      // zero tick
      stripG.append('line')
        .attr('x1', nlSc(0)).attr('x2', nlSc(0))
        .attr('y1', pathStripY + 6).attr('y2', pathStripY + pathStripH - 6)
        .attr('stroke', '#94a3b8').attr('stroke-width', 1)

      stripG.append('text')
        .attr('x', nlSc(0)).attr('y', pathStripY + pathStripH - 1)
        .attr('text-anchor', 'middle').attr('font-size', 9).attr('fill', '#94a3b8')
        .text('0')

      // particle dot
      const pos = positionAt(preset, tEnd)
      const dotColor = disp >= 0 ? '#22c55e' : '#ef4444'
      stripG.append('circle')
        .attr('cx', nlSc(Math.max(Math.min(pos, maxDisp * 1.05), -maxDisp * 1.05)))
        .attr('cy', pathStripY + pathStripH / 2)
        .attr('r', 7).attr('fill', dotColor).attr('opacity', 0.85)

      stripG.append('text')
        .attr('x', M.left).attr('y', pathStripY - 3)
        .attr('font-size', 9).attr('fill', '#64748b')
        .text('Position x(t)')
    }

    // ── light gridlines ───────────────────────────────────────────────────
    xSc.ticks(6).forEach((t) =>
      svg.append('line')
        .attr('x1', xSc(t)).attr('x2', xSc(t))
        .attr('y1', graphTop).attr('y2', graphBottom)
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    )
    ySc.ticks(5).forEach((y) =>
      svg.append('line')
        .attr('x1', M.left).attr('x2', W - M.right)
        .attr('y1', ySc(y)).attr('y2', ySc(y))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    )

    // ── axes ──────────────────────────────────────────────────────────────
    svg.append('g')
      .attr('transform', `translate(0,${ySc(0)})`)
      .call(d3.axisBottom(xSc).ticks(6))
      .attr('color', '#94a3b8')

    svg.append('g')
      .attr('transform', `translate(${M.left},0)`)
      .call(d3.axisLeft(ySc).ticks(5))
      .attr('color', '#94a3b8')

    // axis labels
    svg.append('text')
      .attr('x', W - M.right + 4).attr('y', ySc(0) + 4)
      .attr('font-size', 11).attr('fill', '#64748b').text('t')

    svg.append('text')
      .attr('x', M.left - 8).attr('y', graphTop - 4)
      .attr('font-size', 11).attr('fill', '#64748b').attr('text-anchor', 'middle').text('v')

    // dashed zero line emphasis
    svg.append('line')
      .attr('x1', M.left).attr('x2', W - M.right)
      .attr('y1', ySc(0)).attr('y2', ySc(0))
      .attr('stroke', '#94a3b8').attr('stroke-dasharray', '6,4').attr('stroke-width', 1.2)

    // ── signed area fills up to tEnd ──────────────────────────────────────
    // Build segments split at zero crossings within [tMin, tEnd]
    const crossings = [tMin, ...zeros.filter((z) => z > tMin && z < tEnd), tEnd]

    crossings.forEach((_, i) => {
      if (i === crossings.length - 1) return
      const segA = crossings[i]
      const segB = crossings[i + 1]
      const midV = v((segA + segB) / 2)
      const color = midV >= 0 ? '#22c55e' : '#ef4444'

      const steps = 300
      const dt = (segB - segA) / steps
      const areaData = d3.range(steps + 1).map((j) => {
        const t = segA + j * dt
        return [t, v(t)]
      })

      const areaFn = d3.area()
        .x(([t]) => xSc(t))
        .y0(ySc(0))
        .y1(([, y]) => ySc(y))

      svg.append('path')
        .datum(areaData)
        .attr('fill', color)
        .attr('opacity', 0.3)
        .attr('d', areaFn)
    })

    // ── velocity curve ────────────────────────────────────────────────────
    const curvePts = d3.range(0, N_SAMPLE + 1).map((i) => {
      const t = tMin + i * (tMax - tMin) / N_SAMPLE
      return [t, v(t)]
    })
    const lineFn = d3.line().x(([t]) => xSc(t)).y(([, y]) => ySc(y))
    svg.append('path')
      .datum(curvePts)
      .attr('fill', 'none')
      .attr('stroke', '#6470f1')
      .attr('stroke-width', 2.5)
      .attr('d', lineFn)

    // ── tEnd vertical marker ──────────────────────────────────────────────
    svg.append('line')
      .attr('x1', xSc(tEnd)).attr('x2', xSc(tEnd))
      .attr('y1', graphTop).attr('y2', graphBottom)
      .attr('stroke', '#f59e0b').attr('stroke-width', 1.8).attr('stroke-dasharray', '5,3')

    svg.append('circle')
      .attr('cx', xSc(tEnd)).attr('cy', ySc(v(tEnd)))
      .attr('r', 5).attr('fill', '#f59e0b')

    // ── zero crossing annotations ─────────────────────────────────────────
    zeros.forEach((z) => {
      if (z <= tMin || z >= tMax) return
      const cx = xSc(z)
      const cy = ySc(0)
      svg.append('line')
        .attr('x1', cx).attr('x2', cx)
        .attr('y1', cy - 14).attr('y2', cy + 14)
        .attr('stroke', '#f59e0b').attr('stroke-width', 1.5)
      svg.append('text')
        .attr('x', cx + 4).attr('y', cy - 6)
        .attr('font-size', 9).attr('fill', '#b45309')
        .text('v=0')
    })

    // ── info panel ────────────────────────────────────────────────────────
    const panelY = PANEL_Y
    const dispColor = disp >= 0 ? '#16a34a' : '#dc2626'

    // Displacement box
    svg.append('rect')
      .attr('x', M.left).attr('y', panelY)
      .attr('width', (W - M.left - M.right) / 2 - 6).attr('height', 56)
      .attr('fill', disp >= 0 ? '#f0fdf4' : '#fef2f2').attr('rx', 6)
      .attr('stroke', dispColor).attr('stroke-width', 1.2).attr('opacity', 0.6)

    svg.append('text')
      .attr('x', M.left + (W - M.left - M.right) / 4 - 3)
      .attr('y', panelY + 18)
      .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#64748b')
      .text('Displacement')

    svg.append('text')
      .attr('x', M.left + (W - M.left - M.right) / 4 - 3)
      .attr('y', panelY + 42)
      .attr('text-anchor', 'middle').attr('font-size', 22).attr('font-weight', 700)
      .attr('fill', dispColor)
      .text(`${disp >= 0 ? '' : ''}${disp.toFixed(3)} m`)

    // Distance box
    const distBoxX = M.left + (W - M.left - M.right) / 2 + 6
    svg.append('rect')
      .attr('x', distBoxX).attr('y', panelY)
      .attr('width', (W - M.left - M.right) / 2 - 6).attr('height', 56)
      .attr('fill', '#fffbeb').attr('rx', 6)
      .attr('stroke', '#d97706').attr('stroke-width', 1.2).attr('opacity', 0.6)

    svg.append('text')
      .attr('x', distBoxX + (W - M.left - M.right) / 4 - 3)
      .attr('y', panelY + 18)
      .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#64748b')
      .text('Total Distance')

    svg.append('text')
      .attr('x', distBoxX + (W - M.left - M.right) / 4 - 3)
      .attr('y', panelY + 42)
      .attr('text-anchor', 'middle').attr('font-size', 22).attr('font-weight', 700)
      .attr('fill', '#d97706')
      .text(`${dist.toFixed(3)} m`)

    // explanation text
    svg.append('text')
      .attr('x', W / 2).attr('y', panelY + 70)
      .attr('text-anchor', 'middle').attr('font-size', 9.5).attr('fill', '#94a3b8')
      .text('Displacement = net change in position (can be negative).  Distance = total path length (always ≥ 0).')

  }, [presetIdx, tEnd, showPath])

  return (
    <div>
      <svg
        ref={svgRef}
        width="100%"
        viewBox={"0 0 " + W + " " + H}
        className="overflow-visible"
      />

      <div className="px-4 mt-1 space-y-2">
        {/* Preset buttons */}
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

        {/* t slider */}
        <SliderControl
          label={`t endpoint`}
          min={PRESETS[presetIdx].tMin}
          max={PRESETS[presetIdx].tMax}
          step={0.02}
          value={tEnd}
          onChange={setTEnd}
          format={(v) => v.toFixed(2)}
        />

        {/* Toggle */}
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showPath}
            onChange={(e) => setShowPath(e.target.checked)}
            className="accent-brand-500"
          />
          Show displacement path
        </label>
      </div>

      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic px-4">
        Positive velocity (green) adds to displacement; negative velocity (red) subtracts.
        Total distance counts both equally. Displacement = ∫v dt; Distance = ∫|v| dt.
      </p>
    </div>
  )
}
