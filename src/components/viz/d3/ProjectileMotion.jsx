import * as d3 from 'd3'
import { useRef, useEffect, useState, useCallback } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 360
const M = { top: 30, right: 20, bottom: 50, left: 55 }
const G = 9.8

export default function ProjectileMotion() {
  const svgRef = useRef(null)
  const intervalRef = useRef(null)
  const [angle, setAngle] = useState(45)
  const [speed, setSpeed] = useState(12)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)

  const angleRad = (angle * Math.PI) / 180
  const vx = speed * Math.cos(angleRad)
  const vy = speed * Math.sin(angleRad)
  const tMax = (2 * vy) / G
  const xMax = vx * tMax
  const yMax = (vy * vy) / (2 * G)

  const plotW = W - M.left - M.right
  const plotH = H - M.top - M.bottom

  // Use uniform scale to avoid distortion
  const kx = plotW / Math.max(xMax, 0.01)
  const ky = plotH / Math.max(yMax * 1.1, 0.01)
  const k = Math.min(kx, ky) * 0.9

  const toSvgX = (x) => M.left + x * k
  const toSvgY = (y) => H - M.bottom - y * k

  const xAtT = (t) => vx * t
  const yAtT = (t) => vy * t - 0.5 * G * t * t

  const tClamped = Math.min(time, tMax)
  const ballX = xAtT(tClamped)
  const ballY = Math.max(0, yAtT(tClamped))
  const vyT = vy - G * tClamped
  const arrowScale = 6

  // Draw static elements
  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('.static').remove()

    const g = svg.append('g').attr('class', 'static')

    // Ground
    g.append('line')
      .attr('x1', M.left).attr('y1', H - M.bottom)
      .attr('x2', W - M.right).attr('y2', H - M.bottom)
      .attr('stroke', '#94a3b8').attr('stroke-width', 2)

    // Y-axis
    g.append('line')
      .attr('x1', M.left).attr('y1', M.top)
      .attr('x2', M.left).attr('y2', H - M.bottom)
      .attr('stroke', '#94a3b8').attr('stroke-width', 1.5)

    // Trajectory path
    const pts = d3.range(0, tMax + 0.02, tMax / 120).map(t => [xAtT(t), Math.max(0, yAtT(t))])
    const line = d3.line().x(([x]) => toSvgX(x)).y(([, y]) => toSvgY(y))
    g.append('path')
      .datum(pts)
      .attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,3').attr('d', line)

    // Dashed max-height line
    g.append('line')
      .attr('x1', M.left).attr('y1', toSvgY(yMax))
      .attr('x2', toSvgX(xMax / 2)).attr('y2', toSvgY(yMax))
      .attr('stroke', '#10b981').attr('stroke-width', 1).attr('stroke-dasharray', '4,4')

    // Dashed range line
    g.append('line')
      .attr('x1', toSvgX(xMax)).attr('y1', H - M.bottom)
      .attr('x2', toSvgX(xMax)).attr('y2', toSvgY(0) - 20)
      .attr('stroke', '#3b82f6').attr('stroke-width', 1).attr('stroke-dasharray', '4,4')

    // Labels
    g.append('text').attr('x', M.left + 6).attr('y', toSvgY(yMax) - 6)
      .attr('font-size', 11).attr('fill', '#10b981')
      .text(`H = ${yMax.toFixed(1)} m`)

    g.append('text').attr('x', toSvgX(xMax) + 4).attr('y', H - M.bottom - 6)
      .attr('font-size', 11).attr('fill', '#3b82f6')
      .text(`R = ${xMax.toFixed(1)} m`)

    // Launch angle arc
    const arcR = 28
    g.append('path')
      .attr('d', `M ${M.left + arcR} ${H - M.bottom} A ${arcR} ${arcR} 0 0 0 ${M.left + arcR * Math.cos(angleRad)} ${H - M.bottom - arcR * Math.sin(angleRad)}`)
      .attr('fill', 'none').attr('stroke', '#f59e0b').attr('stroke-width', 1.5)
    g.append('text').attr('x', M.left + 36).attr('y', H - M.bottom - 8)
      .attr('font-size', 11).attr('fill', '#f59e0b')
      .text(`${angle}°`)

    // Axis labels
    g.append('text').attr('x', M.left - 10).attr('y', M.top - 8)
      .attr('font-size', 11).attr('fill', '#94a3b8').attr('text-anchor', 'middle').text('y (m)')
    g.append('text').attr('x', W - M.right).attr('y', H - M.bottom + 30)
      .attr('font-size', 11).attr('fill', '#94a3b8').attr('text-anchor', 'end').text('x (m)')

    // x-axis ticks
    const xTicks = d3.range(0, xMax * 1.05, xMax / 4)
    xTicks.forEach(t => {
      g.append('text').attr('x', toSvgX(t)).attr('y', H - M.bottom + 16)
        .attr('font-size', 10).attr('fill', '#94a3b8').attr('text-anchor', 'middle')
        .text(t.toFixed(0))
    })

    // y-axis ticks
    const yTicks = d3.range(0, yMax * 1.05, yMax / 3)
    yTicks.forEach(t => {
      g.append('text').attr('x', M.left - 8).attr('y', toSvgY(t) + 4)
        .attr('font-size', 10).attr('fill', '#94a3b8').attr('text-anchor', 'end')
        .text(t.toFixed(1))
    })
  }, [angle, speed])

  // Draw dynamic elements (ball + velocity vectors)
  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('.dynamic').remove()

    if (tClamped <= 0 && !playing) return

    const g = svg.append('g').attr('class', 'dynamic')

    const bx = toSvgX(ballX)
    const by = toSvgY(ballY)

    // Velocity vectors
    if (tClamped < tMax) {
      // vx arrow (blue)
      g.append('line')
        .attr('x1', bx).attr('y1', by)
        .attr('x2', bx + vx * arrowScale).attr('y2', by)
        .attr('stroke', '#3b82f6').attr('stroke-width', 2.5)
      g.append('polygon')
        .attr('points', `0,-4 0,4 8,0`)
        .attr('fill', '#3b82f6')
        .attr('transform', `translate(${bx + vx * arrowScale},${by}) rotate(0)`)

      // vy arrow (green)
      const vyPx = vyT * arrowScale
      g.append('line')
        .attr('x1', bx).attr('y1', by)
        .attr('x2', bx).attr('y2', by - vyPx)
        .attr('stroke', '#10b981').attr('stroke-width', 2.5)
      if (Math.abs(vyPx) > 2) {
        const angle2 = vyPx > 0 ? -90 : 90
        g.append('polygon')
          .attr('points', `0,-4 0,4 8,0`)
          .attr('fill', '#10b981')
          .attr('transform', `translate(${bx},${by - vyPx}) rotate(${angle2})`)
      }

      // Full velocity vector (orange)
      const fvx = vx * arrowScale, fvy = vyT * arrowScale
      g.append('line')
        .attr('x1', bx).attr('y1', by)
        .attr('x2', bx + fvx).attr('y2', by - fvy)
        .attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('stroke-dasharray', '4,3')
    }

    // Ball
    g.append('circle')
      .attr('cx', bx).attr('cy', by)
      .attr('r', 7).attr('fill', '#6470f1').attr('stroke', '#fff').attr('stroke-width', 1.5)

    // Time label
    g.append('text').attr('x', W - M.right).attr('y', M.top - 8)
      .attr('text-anchor', 'end').attr('font-size', 12).attr('fill', '#64748b')
      .text(`t = ${tClamped.toFixed(2)} s`)
  }, [time, angle, speed, playing])

  // Timer
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setTime(t => {
          const next = t + 0.05
          if (next >= tMax) {
            setPlaying(false)
            return tMax
          }
          return next
        })
      }, 50)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, tMax])

  const reset = useCallback(() => {
    setPlaying(false)
    setTime(0)
  }, [])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <SliderControl label="Launch angle (°)" min={5} max={85} step={1} value={angle} onChange={v => { setAngle(v); reset() }} format={v => `${v}°`} />
        <SliderControl label="Initial speed (m/s)" min={5} max={20} step={0.5} value={speed} onChange={v => { setSpeed(v); reset() }} />
      </div>
      <div className="flex items-center justify-center gap-3 mt-3">
        <button
          onClick={() => setPlaying(p => !p)}
          className="px-5 py-1.5 rounded bg-brand-500 text-white text-sm hover:bg-brand-600 transition"
        >
          {playing ? '⏸ Pause' : time > 0 ? '▶ Resume' : '▶ Launch'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-1.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition"
        >
          ↺ Reset
        </button>
      </div>
      <div className="flex justify-center gap-6 mt-2 text-xs text-slate-500 dark:text-slate-400">
        <span style={{ color: '#3b82f6' }}>— vₓ (constant)</span>
        <span style={{ color: '#10b981' }}>— vᵧ(t)</span>
        <span style={{ color: '#f59e0b' }}>-- |v(t)|</span>
        <span style={{ color: '#6470f1' }}>— trajectory</span>
      </div>
    </div>
  )
}
