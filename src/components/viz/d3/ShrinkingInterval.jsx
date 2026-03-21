import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import SliderControl from '../SliderControl.jsx'

const SVG_W = 580
const SVG_H = 340

const MARGIN = { left: 52, right: 30, top: 20, bottom: 40 }

const T0 = 1          // fixed point
const T_MIN = 0
const T_MAX = 2.236   // sqrt(5), slightly past where h(t) = 0 at t ≈ 2.236

// h(t) = 80 - 16t²
function hFn(t) {
  return 80 - 16 * t * t
}

// exact derivative at t0 = 1: h'(1) = -32
const EXACT_SLOPE = -32

// Average velocity over [t0, t0+h]
function avgVelocity(h) {
  if (Math.abs(h) < 1e-9) return EXACT_SLOPE
  return (hFn(T0 + h) - hFn(T0)) / h
}

// Fixed h values for the table
const TABLE_H_VALUES = [1.0, 0.5, 0.1, 0.01]

// Build a secant line through A=(t0, h(t0)) and B=(t0+h, h(t0+h))
// Returns a function of t
function secantLine(h) {
  const slope = avgVelocity(h)
  const x0 = T0
  const y0 = hFn(T0)
  return (t) => y0 + slope * (t - x0)
}

// Tangent line at t0 (slope = EXACT_SLOPE)
function tangentLine(t) {
  return hFn(T0) + EXACT_SLOPE * (t - T0)
}

export default function ShrinkingInterval() {
  const svgRef = useRef(null)
  const [h, setH] = useState(1.0)

  const innerL = MARGIN.left
  const innerR = SVG_W - MARGIN.right
  const innerT = MARGIN.top
  const innerB = SVG_H - MARGIN.bottom

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const tScaleFn = d3.scaleLinear().domain([T_MIN, T_MAX]).range([innerL, innerR])
    const yScaleFn = d3.scaleLinear().domain([-5, 90]).range([innerB, innerT])

    // ── Grid ──────────────────────────────────────────────────────────
    tScaleFn.ticks(7).forEach((tv) => {
      svg
        .append('line')
        .attr('x1', tScaleFn(tv))
        .attr('x2', tScaleFn(tv))
        .attr('y1', innerT)
        .attr('y2', innerB)
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1)
    })

    yScaleFn.ticks(6).forEach((yv) => {
      svg
        .append('line')
        .attr('x1', innerL)
        .attr('x2', innerR)
        .attr('y1', yScaleFn(yv))
        .attr('y2', yScaleFn(yv))
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1)
    })

    // ── Axes ─────────────────────────────────────────────────────────
    // X axis
    svg
      .append('line')
      .attr('x1', innerL)
      .attr('x2', innerR)
      .attr('y1', innerB)
      .attr('y2', innerB)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1.5)

    tScaleFn.ticks(7).forEach((tv) => {
      svg
        .append('text')
        .attr('x', tScaleFn(tv))
        .attr('y', innerB + 16)
        .attr('text-anchor', 'middle')
        .attr('font-size', 11)
        .attr('fill', '#64748b')
        .text(tv.toFixed(1))
    })

    svg
      .append('text')
      .attr('x', (innerL + innerR) / 2)
      .attr('y', SVG_H - 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('fill', '#64748b')
      .text('t (seconds)')

    // Y axis
    svg
      .append('line')
      .attr('x1', innerL)
      .attr('x2', innerL)
      .attr('y1', innerT)
      .attr('y2', innerB)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1.5)

    yScaleFn.ticks(6).forEach((yv) => {
      svg
        .append('text')
        .attr('x', innerL - 6)
        .attr('y', yScaleFn(yv) + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', 11)
        .attr('fill', '#64748b')
        .text(yv)
    })

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -((innerT + innerB) / 2))
      .attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('fill', '#64748b')
      .text('h (feet)')

    // ── Main curve: h(t) = 80 - 16t² ─────────────────────────────────
    const nCurve = 200
    const curveData = d3.range(nCurve + 1).map((i) => {
      const t = T_MIN + ((T_MAX - T_MIN) * i) / nCurve
      return [t, hFn(t)]
    })

    const curveLine = d3
      .line()
      .x((d) => tScaleFn(d[0]))
      .y((d) => yScaleFn(d[1]))

    svg
      .append('path')
      .datum(curveData)
      .attr('d', curveLine)
      .attr('fill', 'none')
      .attr('stroke', '#6470f1')
      .attr('stroke-width', 2.5)

    // Curve label
    svg
      .append('text')
      .attr('x', tScaleFn(0.25))
      .attr('y', yScaleFn(hFn(0.25)) - 10)
      .attr('font-size', 12)
      .attr('font-style', 'italic')
      .attr('fill', '#6470f1')
      .text('h(t) = 80 − 16t²')

    // ── Tangent line at t0=1 ──────────────────────────────────────────
    const tangentExtent = 0.8
    const tangentData = [
      [T0 - tangentExtent, tangentLine(T0 - tangentExtent)],
      [T0 + tangentExtent, tangentLine(T0 + tangentExtent)],
    ]

    svg
      .append('path')
      .datum(tangentData)
      .attr('d', curveLine)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 1.8)
      .attr('stroke-dasharray', '6,4')

    svg
      .append('text')
      .attr('x', tScaleFn(T0 + tangentExtent) + 4)
      .attr('y', yScaleFn(tangentLine(T0 + tangentExtent)))
      .attr('font-size', 11)
      .attr('fill', '#ef4444')
      .text('tangent (slope = −32)')

    // ── Secant line ───────────────────────────────────────────────────
    const tB = T0 + h
    const slope = avgVelocity(h)

    // Extend the secant slightly beyond A and B for visibility
    const secExtent = Math.max(0.15, Math.abs(h) * 0.2)
    const secLeft = Math.max(T_MIN, T0 - secExtent)
    const secRight = Math.min(T_MAX, tB + secExtent)

    const secantData = [
      [secLeft, secantLine(h)(secLeft)],
      [secRight, secantLine(h)(secRight)],
    ]

    svg
      .append('path')
      .datum(secantData)
      .attr('d', curveLine)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)

    // ── Point A (fixed, t0=1) ─────────────────────────────────────────
    const ax = tScaleFn(T0)
    const ay = yScaleFn(hFn(T0))

    svg
      .append('circle')
      .attr('cx', ax)
      .attr('cy', ay)
      .attr('r', 6)
      .attr('fill', '#f59e0b')
      .attr('stroke', '#92400e')
      .attr('stroke-width', 1.5)

    svg
      .append('text')
      .attr('x', ax - 8)
      .attr('y', ay - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('font-weight', 'bold')
      .attr('fill', '#f59e0b')
      .text('A')

    svg
      .append('text')
      .attr('x', ax - 8)
      .attr('y', ay - 22)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('fill', '#64748b')
      .text(`(1, ${hFn(T0)})`)

    // ── Point B (movable, t0+h) ────────────────────────────────────────
    const hClamped = Math.min(tB, T_MAX)
    const bx = tScaleFn(hClamped)
    const by = yScaleFn(hFn(Math.min(tB, T_MAX)))

    // Draw B only if it's distinct from A
    if (Math.abs(h) > 0.005) {
      svg
        .append('circle')
        .attr('cx', bx)
        .attr('cy', by)
        .attr('r', 6)
        .attr('fill', '#10b981')
        .attr('stroke', '#065f46')
        .attr('stroke-width', 1.5)

      svg
        .append('text')
        .attr('x', bx + 8)
        .attr('y', by - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('font-weight', 'bold')
        .attr('fill', '#10b981')
        .text('B')

      svg
        .append('text')
        .attr('x', bx + 8)
        .attr('y', by - 22)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('fill', '#64748b')
        .text(`(${tB.toFixed(3)}, ${hFn(tB).toFixed(2)})`)
    }

    // Δh and Δt bracket lines
    if (Math.abs(h) > 0.02) {
      // Vertical drop from B to y of A
      svg
        .append('line')
        .attr('x1', bx)
        .attr('x2', bx)
        .attr('y1', by)
        .attr('y2', ay)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,2')

      // Horizontal from A to under B
      svg
        .append('line')
        .attr('x1', ax)
        .attr('x2', bx)
        .attr('y1', ay)
        .attr('y2', ay)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,2')

      // Δt label
      svg
        .append('text')
        .attr('x', (ax + bx) / 2)
        .attr('y', ay + 14)
        .attr('text-anchor', 'middle')
        .attr('font-size', 11)
        .attr('fill', '#64748b')
        .text(`Δt = ${h.toFixed(3)}`)

      // Δh label
      const dhVal = hFn(tB) - hFn(T0)
      svg
        .append('text')
        .attr('x', bx + 6)
        .attr('y', (ay + by) / 2 + 4)
        .attr('text-anchor', 'start')
        .attr('font-size', 11)
        .attr('fill', '#64748b')
        .text(`Δh = ${dhVal.toFixed(2)}`)
    }
  }, [h, innerL, innerR, innerT, innerB])

  const currentAvgV = avgVelocity(h)

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Shrinking Interval — Approaching the Derivative</h3>

      <svg
        ref={svgRef}
        width={SVG_W}
        height={SVG_H}
        className="rounded-lg border border-slate-100 dark:border-slate-800"
        style={{ maxWidth: '100%' }}
      />

      <div className="w-full max-w-md">
        <SliderControl
          label="h (interval width)"
          min={0.001}
          max={2.0}
          step={0.001}
          value={h}
          onChange={setH}
          format={(v) => v.toFixed(3)}
        />
      </div>

      {/* Dynamic formula */}
      <div className="text-sm text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
        <span className="text-slate-500">Avg velocity = </span>
        <span className="text-slate-800 dark:text-slate-100">
          [h(1 + {h.toFixed(3)}) − h(1)] / {h.toFixed(3)}
        </span>
        <span className="text-slate-500"> = </span>
        <span
          className="font-bold"
          style={{
            color: Math.abs(currentAvgV - EXACT_SLOPE) < 1
              ? '#10b981'
              : Math.abs(currentAvgV - EXACT_SLOPE) < 5
              ? '#f59e0b'
              : '#ef4444',
          }}
        >
          {currentAvgV.toFixed(4)} ft/s
        </span>
      </div>

      {/* Table */}
      <div className="w-full max-w-md overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              <th className="px-4 py-2 text-left font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                h
              </th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Avg velocity = Δh/Δt
              </th>
            </tr>
          </thead>
          <tbody>
            {TABLE_H_VALUES.map((hv) => (
              <tr
                key={hv}
                className={
                  Math.abs(hv - h) < 0.0005
                    ? 'bg-brand-50 dark:bg-brand-900/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }
              >
                <td className="px-4 py-1.5 font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {hv}
                </td>
                <td
                  className="px-4 py-1.5 font-mono font-medium border border-slate-200 dark:border-slate-700"
                  style={{
                    color:
                      Math.abs(avgVelocity(hv) - EXACT_SLOPE) < 1
                        ? '#10b981'
                        : Math.abs(avgVelocity(hv) - EXACT_SLOPE) < 5
                        ? '#f59e0b'
                        : '#ef4444',
                  }}
                >
                  {avgVelocity(hv).toFixed(4)}
                </td>
              </tr>
            ))}

            {/* Current h row */}
            {!TABLE_H_VALUES.some((hv) => Math.abs(hv - h) < 0.0005) && (
              <tr className="bg-brand-50 dark:bg-brand-900/20">
                <td className="px-4 py-1.5 font-mono font-bold border border-slate-200 dark:border-slate-700" style={{ color: '#6470f1' }}>
                  {h.toFixed(3)} ← current
                </td>
                <td
                  className="px-4 py-1.5 font-mono font-bold border border-slate-200 dark:border-slate-700"
                  style={{
                    color:
                      Math.abs(currentAvgV - EXACT_SLOPE) < 1
                        ? '#10b981'
                        : Math.abs(currentAvgV - EXACT_SLOPE) < 5
                        ? '#f59e0b'
                        : '#ef4444',
                  }}
                >
                  {currentAvgV.toFixed(4)}
                </td>
              </tr>
            )}

            {/* Limit row */}
            <tr className="bg-green-50 dark:bg-green-900/20">
              <td className="px-4 py-1.5 font-mono text-green-700 dark:text-green-400 border border-slate-200 dark:border-slate-700 italic">
                h → 0
              </td>
              <td className="px-4 py-1.5 font-mono font-bold text-green-700 dark:text-green-400 border border-slate-200 dark:border-slate-700">
                −32.0000 (exact)
              </td>
            </tr>
          </tbody>
        </table>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
          Limit as h→0:{' '}
          <strong className="text-green-600 dark:text-green-400">−32 ft/s</strong>{' '}
          (instantaneous velocity at t = 1)
        </p>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-lg leading-relaxed">
        As the time interval shrinks (h→0), the average velocity approaches −32 ft/s — the instantaneous velocity.
        This is exactly the definition of the derivative h'(1).
      </p>
    </div>
  )
}
