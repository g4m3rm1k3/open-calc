import * as d3 from 'd3'
import { useRef, useEffect, useState, useCallback } from 'react'

const W = 580, H = 340
const M = { top: 30, right: 24, bottom: 48, left: 56 }

const FN_PRESETS = [
  {
    label: 'f(x) = (x²−4)/(x−2)',
    eval: x => (Math.abs(x - 2) < 1e-9 ? null : (x * x - 4) / (x - 2)),
    targetX: 2,
    limitY: 4,
    xDomain: [-0.5, 5],
    yDomain: [-0.5, 7],
    holeDesc: 'x = 2',
    limitDesc: 'f(x) → 4',
  },
  {
    label: 'f(x) = sin(x)/x',
    eval: x => (Math.abs(x) < 1e-9 ? null : Math.sin(x) / x),
    targetX: 0,
    limitY: 1,
    xDomain: [-3, 3],
    yDomain: [-0.3, 1.3],
    holeDesc: 'x = 0',
    limitDesc: 'f(x) → 1',
  },
  {
    label: 'f(x) = (x³−8)/(x−2)',
    eval: x => (Math.abs(x - 2) < 1e-9 ? null : (x * x * x - 8) / (x - 2)),
    targetX: 2,
    limitY: 12,
    xDomain: [-0.5, 4],
    yDomain: [-1, 16],
    holeDesc: 'x = 2',
    limitDesc: 'f(x) → 12',
  },
]

export default function LimitRacingCar() {
  const svgRef = useRef(null)
  const rafRef = useRef(null)
  const startTimeRef = useRef(null)
  const [fnIdx, setFnIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0) // 0..1

  const fn = FN_PRESETS[fnIdx]
  const { eval: f, targetX, limitY, xDomain, yDomain } = fn

  const plotW = W - M.left - M.right
  const plotH = H - M.top - M.bottom
  const xSc = d3.scaleLinear().domain(xDomain).range([M.left, M.left + plotW])
  const ySc = d3.scaleLinear().domain(yDomain).range([M.top + plotH, M.top])

  // Car approaches from startX to near targetX
  const startX = xDomain[0] + (targetX - xDomain[0]) * 0.1
  const stopOffset = (xDomain[1] - xDomain[0]) * 0.015
  // carX(p) = startX + (targetX - startX - stopOffset) * (1 - exp(-4p))
  const carXAtP = (p) => startX + (targetX - startX - stopOffset) * (1 - Math.exp(-4 * p))

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // ── Grid ──────────────────────────────────────────────────────────────
    xSc.ticks(6).forEach(t => {
      svg.append('line')
        .attr('x1', xSc(t)).attr('x2', xSc(t))
        .attr('y1', M.top).attr('y2', M.top + plotH)
        .attr('stroke', '#334155').attr('stroke-width', 0.5)
    })
    ySc.ticks(5).forEach(t => {
      svg.append('line')
        .attr('x1', M.left).attr('x2', M.left + plotW)
        .attr('y1', ySc(t)).attr('y2', ySc(t))
        .attr('stroke', '#334155').attr('stroke-width', 0.5)
    })

    // ── Axes ──────────────────────────────────────────────────────────────
    svg.append('g')
      .attr('transform', `translate(0,${ySc(0)})`)
      .call(d3.axisBottom(xSc).ticks(6))
      .attr('color', '#94a3b8')
    svg.append('g')
      .attr('transform', `translate(${xSc(0)},0)`)
      .call(d3.axisLeft(ySc).ticks(5))
      .attr('color', '#94a3b8')

    // ── Curve (the "road") ─────────────────────────────────────────────────
    const step = (xDomain[1] - xDomain[0]) / 400
    const leftPts = [], rightPts = []
    for (let x = xDomain[0]; x <= xDomain[1]; x += step) {
      if (Math.abs(x - targetX) < step * 0.8) continue
      const y = f(x)
      if (y === null || y < yDomain[0] || y > yDomain[1]) continue
      if (x < targetX) leftPts.push([x, y])
      else rightPts.push([x, y])
    }

    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y)).curve(d3.curveCatmullRom)
    ;[leftPts, rightPts].forEach(pts => {
      if (pts.length > 1) {
        // Road thickness: thick stroke for "asphalt" look
        svg.append('path').datum(pts).attr('fill', 'none')
          .attr('stroke', '#334155').attr('stroke-width', 8).attr('d', line)
        svg.append('path').datum(pts).attr('fill', 'none')
          .attr('stroke', '#6470f1').attr('stroke-width', 3).attr('d', line)
      }
    })

    // ── Hole (open circle) at targetX ─────────────────────────────────────
    svg.append('circle')
      .attr('cx', xSc(targetX)).attr('cy', ySc(limitY))
      .attr('r', 6).attr('fill', '#0f172a').attr('stroke', '#6470f1').attr('stroke-width', 2.5)

    // ── Limit dashed line ──────────────────────────────────────────────────
    svg.append('line')
      .attr('x1', M.left).attr('x2', M.left + plotW)
      .attr('y1', ySc(limitY)).attr('y2', ySc(limitY))
      .attr('stroke', '#f59e0b').attr('stroke-width', 1.5).attr('stroke-dasharray', '6,5')
    svg.append('text')
      .attr('x', M.left + plotW + 2).attr('y', ySc(limitY) + 4)
      .attr('font-size', 10).attr('fill', '#f59e0b')
      .text(`L=${limitY}`)

    // ── Car ───────────────────────────────────────────────────────────────
    const cx = carXAtP(progress)
    const cy = f(cx)
    if (cy !== null && cy >= yDomain[0] && cy <= yDomain[1]) {
      const px = xSc(cx), py = ySc(cy)

      // Approximate tangent angle for car rotation
      const dx = 0.0001
      const cyNext = f(cx + dx)
      let rotDeg = 0
      if (cyNext !== null) {
        const dydx = (cyNext - cy) / dx
        rotDeg = Math.atan(dydx * (plotH / plotW) * ((xDomain[1] - xDomain[0]) / (yDomain[1] - yDomain[0]))) * 180 / Math.PI
      }

      const carG = svg.append('g').attr('transform', `translate(${px},${py}) rotate(${-rotDeg})`)
      carG.append('rect').attr('x', -12).attr('y', -5).attr('width', 24).attr('height', 10).attr('rx', 3).attr('fill', '#ef4444')
      carG.append('rect').attr('x', -6).attr('y', -9).attr('width', 14).attr('height', 6).attr('rx', 2).attr('fill', '#ef4444').attr('fill-opacity', 0.8)
      ;[-6, 6].forEach(ddx => {
        carG.append('circle').attr('cx', ddx).attr('cy', 5).attr('r', 3).attr('fill', '#0f172a').attr('stroke', '#94a3b8').attr('stroke-width', 0.8)
      })
    }

    // ── Annotations ───────────────────────────────────────────────────────
    svg.append('text')
      .attr('x', W / 2).attr('y', M.top - 10)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#94a3b8')
      .text(`As x → ${fn.holeDesc},  ${fn.limitDesc}  (but f(${fn.holeDesc}) is undefined!)`)

    // x-position line (car to axis)
    if (progress > 0.05) {
      const cx2 = carXAtP(progress)
      svg.append('line')
        .attr('x1', xSc(cx2)).attr('x2', xSc(cx2))
        .attr('y1', ySc(f(cx2) || limitY)).attr('y2', ySc(0))
        .attr('stroke', '#ef4444').attr('stroke-width', 1).attr('stroke-dasharray', '4,4').attr('opacity', 0.5)
      svg.append('text')
        .attr('x', xSc(cx2)).attr('y', ySc(0) + 22)
        .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#ef4444')
        .text(`x=${cx2.toFixed(3)}`)
    }

  }, [fnIdx, progress])

  // Animation loop
  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(rafRef.current)
      return
    }
    startTimeRef.current = null
    const DURATION = 3500 // ms

    const animate = (ts) => {
      if (!startTimeRef.current) startTimeRef.current = ts
      const elapsed = ts - startTimeRef.current
      const p = Math.min(elapsed / DURATION, 1)
      setProgress(p)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setPlaying(false)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [playing])

  const reset = useCallback(() => {
    setPlaying(false)
    setProgress(0)
  }, [])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3 px-4">
        {FN_PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => { setFnIdx(i); reset() }}
            className={`px-3 py-1 rounded text-xs transition ${fnIdx === i ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3 mt-2">
        <button
          onClick={() => setPlaying(p => !p)}
          className="px-4 py-1.5 rounded bg-brand-500 text-white text-sm hover:bg-brand-600 transition"
        >
          {playing ? '⏸ Pause' : '▶ Drive'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-1.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition"
        >
          ↺ Reset
        </button>
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        The car approaches the hole — getting arbitrarily close but never reaching it. That is the limit.
      </p>
    </div>
  )
}
