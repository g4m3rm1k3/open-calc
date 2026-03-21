import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 700, H = 340
const M = { top: 20, right: 20, bottom: 40, left: 20 }

// Layout: circle on left, sine wave on right
const CIRCLE_CX = 170, CIRCLE_CY = 170, RADIUS = 120
const WAVE_LEFT = 340, WAVE_RIGHT = W - M.right
const WAVE_TOP = M.top, WAVE_BOTTOM = H - M.bottom

export default function SineUnwrap({ params }) {
  const svgRef = useRef(null)
  const [theta, setTheta] = useState(Math.PI * 0.75)
  const [animate, setAnimate] = useState(false)
  const animRef = useRef(null)

  // Animation loop
  useEffect(() => {
    if (!animate) {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      return
    }
    let t = theta
    const tick = () => {
      t += 0.02
      if (t > 2 * Math.PI) t = 0
      setTheta(t)
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [animate])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // === LEFT SIDE: Unit Circle ===
    // Circle outline
    svg.append('circle').attr('cx', CIRCLE_CX).attr('cy', CIRCLE_CY).attr('r', RADIUS)
      .attr('fill', 'none').attr('stroke', '#cbd5e1').attr('stroke-width', 1.5)

    // Axes through circle center
    svg.append('line').attr('x1', CIRCLE_CX - RADIUS - 15).attr('x2', CIRCLE_CX + RADIUS + 15)
      .attr('y1', CIRCLE_CY).attr('y2', CIRCLE_CY).attr('stroke', '#94a3b8').attr('stroke-width', 1)
    svg.append('line').attr('x1', CIRCLE_CX).attr('x2', CIRCLE_CX)
      .attr('y1', CIRCLE_CY - RADIUS - 15).attr('y2', CIRCLE_CY + RADIUS + 15).attr('stroke', '#94a3b8').attr('stroke-width', 1)

    // Angle arc
    const arc = d3.arc().innerRadius(20).outerRadius(20).startAngle(0).endAngle(-theta)
    svg.append('path').attr('d', arc()).attr('transform', `translate(${CIRCLE_CX},${CIRCLE_CY}) rotate(90)`)
      .attr('fill', 'none').attr('stroke', '#f59e0b').attr('stroke-width', 2)
    svg.append('text').attr('x', CIRCLE_CX + 30).attr('y', CIRCLE_CY - 8)
      .attr('font-size', 12).attr('fill', '#f59e0b').text(`θ = ${(theta / Math.PI).toFixed(2)}π`)

    // Arc along the circle (the "unwrapping" arc)
    const arcPath = d3.arc().innerRadius(RADIUS).outerRadius(RADIUS).startAngle(0).endAngle(-theta)
    svg.append('path').attr('d', arcPath()).attr('transform', `translate(${CIRCLE_CX},${CIRCLE_CY}) rotate(90)`)
      .attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 3)

    // Point on circle
    const px = CIRCLE_CX + RADIUS * Math.cos(theta)
    const py = CIRCLE_CY - RADIUS * Math.sin(theta)
    svg.append('circle').attr('cx', px).attr('cy', py).attr('r', 5).attr('fill', '#6470f1')

    // Radius line
    svg.append('line').attr('x1', CIRCLE_CX).attr('x2', px)
      .attr('y1', CIRCLE_CY).attr('y2', py).attr('stroke', '#6470f1').attr('stroke-width', 1.5)

    // sin(θ) vertical line (height)
    svg.append('line').attr('x1', px).attr('x2', px)
      .attr('y1', CIRCLE_CY).attr('y2', py).attr('stroke', '#ef4444').attr('stroke-width', 2.5)
    svg.append('text').attr('x', px + 8).attr('y', (CIRCLE_CY + py) / 2)
      .attr('font-size', 11).attr('fill', '#ef4444').text(`sin θ = ${Math.sin(theta).toFixed(3)}`)

    // cos(θ) horizontal line
    svg.append('line').attr('x1', CIRCLE_CX).attr('x2', px)
      .attr('y1', CIRCLE_CY).attr('y2', CIRCLE_CY).attr('stroke', '#10b981').attr('stroke-width', 2).attr('stroke-dasharray', '4,3')

    // Labels on circle
    svg.append('text').attr('x', CIRCLE_CX).attr('y', CIRCLE_CY + RADIUS + 28).attr('text-anchor', 'middle')
      .attr('font-size', 12).attr('fill', '#64748b').text('Unit Circle')

    // === CONNECTING LINE: Trace from circle point to wave ===
    const waveXSc = d3.scaleLinear().domain([0, 2 * Math.PI]).range([WAVE_LEFT, WAVE_RIGHT])
    const waveYSc = d3.scaleLinear().domain([-1.3, 1.3]).range([WAVE_BOTTOM, WAVE_TOP])

    // Horizontal dashed connector
    svg.append('line').attr('x1', px).attr('x2', waveXSc(theta))
      .attr('y1', py).attr('y2', waveYSc(Math.sin(theta)))
      .attr('stroke', '#ef4444').attr('stroke-width', 1).attr('stroke-dasharray', '4,3').attr('opacity', 0.5)

    // === RIGHT SIDE: Sine Wave ===
    // Axes
    svg.append('line').attr('x1', WAVE_LEFT).attr('x2', WAVE_RIGHT)
      .attr('y1', waveYSc(0)).attr('y2', waveYSc(0)).attr('stroke', '#94a3b8').attr('stroke-width', 1)

    // Tick marks
    const ticks = [
      { val: Math.PI / 2, label: 'π/2' }, { val: Math.PI, label: 'π' },
      { val: 3 * Math.PI / 2, label: '3π/2' }, { val: 2 * Math.PI, label: '2π' }
    ]
    ticks.forEach(({ val, label }) => {
      svg.append('line').attr('x1', waveXSc(val)).attr('x2', waveXSc(val))
        .attr('y1', waveYSc(0) - 4).attr('y2', waveYSc(0) + 4).attr('stroke', '#94a3b8')
      svg.append('text').attr('x', waveXSc(val)).attr('y', waveYSc(0) + 18)
        .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#94a3b8').text(label)
    })

    // y-axis ticks
    ;[-1, 1].forEach((v) => {
      svg.append('line').attr('x1', WAVE_LEFT - 4).attr('x2', WAVE_LEFT + 4)
        .attr('y1', waveYSc(v)).attr('y2', waveYSc(v)).attr('stroke', '#94a3b8')
      svg.append('text').attr('x', WAVE_LEFT - 10).attr('y', waveYSc(v) + 4)
        .attr('text-anchor', 'end').attr('font-size', 10).attr('fill', '#94a3b8').text(v)
    })

    // Full sine wave (faded)
    const fullWave = d3.range(0, 2 * Math.PI + 0.02, 0.02).map((t) => [t, Math.sin(t)])
    const waveLine = d3.line().x(([t]) => waveXSc(t)).y(([, y]) => waveYSc(y))
    svg.append('path').datum(fullWave).attr('fill', 'none').attr('stroke', '#cbd5e1').attr('stroke-width', 1.5).attr('d', waveLine)

    // Traced portion of sine wave (up to current θ)
    const tracedWave = d3.range(0, theta + 0.02, 0.02).filter((t) => t <= theta).map((t) => [t, Math.sin(t)])
    svg.append('path').datum(tracedWave).attr('fill', 'none').attr('stroke', '#ef4444').attr('stroke-width', 2.5).attr('d', waveLine)

    // Current point on wave
    svg.append('circle').attr('cx', waveXSc(theta)).attr('cy', waveYSc(Math.sin(theta))).attr('r', 5).attr('fill', '#ef4444')

    // Label
    svg.append('text').attr('x', (WAVE_LEFT + WAVE_RIGHT) / 2).attr('y', WAVE_BOTTOM + 30)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#64748b').text('y = sin(θ)')

  }, [theta])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <SliderControl label="Angle θ" min={0} max={6.28} step={0.02} value={theta} onChange={(v) => { setAnimate(false); setTheta(v) }} />
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
          <input type="checkbox" checked={animate} onChange={(e) => setAnimate(e.target.checked)} className="accent-brand-500" />
          Auto-animate
        </label>
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        As the point traces the unit circle, its height (sin θ) unwraps into the sine wave on the right. The red vertical line IS the sine — the height of the point above the center.
      </p>
    </div>
  )
}
