import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

// ── Layout constants ──────────────────────────────────────────────────────────
const W = 580
const SPRING_H = 160   // top section: spring animation
const GRAPH_H  = 70    // height of each time-domain graph
const GRAPH_GAP = 4    // gap between graphs
const H = SPRING_H + 3 * (GRAPH_H + GRAPH_GAP) + 20  // total SVG height ≈ 394
const M = { left: 52, right: 20 }

// Spring drawing constants
const WALL_X   = 70
const EQ_X     = 340   // equilibrium x position of block centre
const BLOCK_W  = 30
const BLOCK_H  = 30
const SPRING_Y = SPRING_H / 2
const SEGS     = 14    // zig-zag segments

const HISTORY_SEC = 6  // seconds of history shown in graphs

function buildZigzag(x1, x2, y, nSegs) {
  const pts = [[x1, y]]
  const step = (x2 - x1) / nSegs
  for (let i = 1; i < nSegs; i++) {
    const x = x1 + i * step
    const dy = (i % 2 === 0 ? -1 : 1) * 10
    pts.push([x, y + dy])
  }
  pts.push([x2, y])
  return pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
}

export default function SpringOscillation() {
  const svgRef = useRef(null)
  const rafRef = useRef(null)
  const historyRef = useRef([])  // { t, pos, vel, acc }[]
  const startTimeRef = useRef(null)

  const [running, setRunning] = useState(true)
  const [amplitude, setAmplitude] = useState(1.0)
  const [omega, setOmega] = useState(1.0)

  // Keep latest A/omega in refs so the animation loop sees current values
  const amplitudeRef = useRef(amplitude)
  const omegaRef = useRef(omega)
  useEffect(() => { amplitudeRef.current = amplitude }, [amplitude])
  useEffect(() => { omegaRef.current = omega }, [omega])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    // One-time structural setup
    svg.selectAll('*').remove()

    // ── Wall ────────────────────────────────────────────────────────────────
    svg.append('rect')
      .attr('x', WALL_X - 12).attr('y', SPRING_Y - 40)
      .attr('width', 12).attr('height', 80)
      .attr('fill', '#64748b')

    // Hatch lines on wall
    for (let i = 0; i < 6; i++) {
      svg.append('line')
        .attr('x1', WALL_X - 12).attr('y1', SPRING_Y - 40 + i * 14)
        .attr('x2', WALL_X).attr('y2', SPRING_Y - 40 + i * 14 + 10)
        .attr('stroke', '#94a3b8').attr('stroke-width', 1)
    }

    // Equilibrium dashed line
    svg.append('line')
      .attr('x1', EQ_X).attr('x2', EQ_X)
      .attr('y1', SPRING_Y - 50).attr('y2', SPRING_Y + 50)
      .attr('stroke', '#94a3b8').attr('stroke-dasharray', '4,3').attr('stroke-width', 1)
    svg.append('text')
      .attr('x', EQ_X + 4).attr('y', SPRING_Y - 38)
      .attr('font-size', 10).attr('fill', '#94a3b8').text('eq.')

    // Dynamic spring path (updated in loop)
    svg.append('path').attr('id', 'spring-path').attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('stroke-linecap', 'round')

    // Block (rect + text label)
    svg.append('rect').attr('id', 'block-rect').attr('width', BLOCK_W).attr('height', BLOCK_H).attr('rx', 3).attr('fill', '#475569').attr('stroke', '#94a3b8').attr('stroke-width', 1.5)
    svg.append('text').attr('id', 'block-label').attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('font-size', 11).attr('fill', '#e2e8f0').text('m')

    // Velocity arrow
    svg.append('line').attr('id', 'vel-arrow').attr('stroke', '#f59e0b').attr('stroke-width', 2.5).attr('marker-end', 'url(#arrow-amber)')

    // Arrow marker def
    const defs = svg.append('defs')
    defs.append('marker').attr('id', 'arrow-amber').attr('markerWidth', 8).attr('markerHeight', 8).attr('refX', 4).attr('refY', 3).attr('orient', 'auto')
      .append('path').attr('d', 'M0,0 L0,6 L8,3 z').attr('fill', '#f59e0b')

    // ── Graph panels ─────────────────────────────────────────────────────────
    const graphDefs = [
      { id: 'pos',  label: 'x(t)', color: '#3b82f6', yDomain: [-2.5, 2.5], yOffset: SPRING_H + GRAPH_GAP },
      { id: 'vel',  label: 'v(t)', color: '#f59e0b', yDomain: [-8, 8],     yOffset: SPRING_H + GRAPH_GAP + GRAPH_H + GRAPH_GAP },
      { id: 'acc',  label: 'a(t)', color: '#ef4444', yDomain: [-8, 8],     yOffset: SPRING_H + GRAPH_GAP + 2 * (GRAPH_H + GRAPH_GAP) },
    ]

    graphDefs.forEach(g => {
      const yTop = g.yOffset
      // Background
      svg.append('rect').attr('x', M.left).attr('y', yTop).attr('width', W - M.left - M.right).attr('height', GRAPH_H).attr('fill', '#f8fafc').attr('rx', 3).attr('class', 'dark:fill-slate-800/60')
      // Zero line
      const midY = yTop + GRAPH_H / 2
      svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', midY).attr('y2', midY).attr('stroke', '#e2e8f0').attr('stroke-width', 1)
      // Label
      svg.append('text').attr('x', M.left - 4).attr('y', midY).attr('text-anchor', 'end').attr('dominant-baseline', 'middle').attr('font-size', 11).attr('fill', g.color).attr('font-weight', '600').text(g.label)
      // Path placeholder
      svg.append('path').attr('id', `graph-${g.id}`).attr('fill', 'none').attr('stroke', g.color).attr('stroke-width', 1.8)
      // Now-line placeholder
      svg.append('line').attr('id', `now-${g.id}`).attr('stroke', '#94a3b8').attr('stroke-width', 1).attr('stroke-dasharray', '3,3').attr('y1', yTop).attr('y2', yTop + GRAPH_H)
    })

    // ── Animation loop ───────────────────────────────────────────────────────
    const graphDefsMap = {}
    graphDefs.forEach(g => { graphDefsMap[g.id] = g })

    function frame(ts) {
      if (startTimeRef.current === null) startTimeRef.current = ts
      const t = (ts - startTimeRef.current) / 1000  // seconds

      const A = amplitudeRef.current
      const w = omegaRef.current
      const pos = A * Math.cos(w * t)
      const vel = -A * w * Math.sin(w * t)
      const acc = -A * w * w * Math.cos(w * t)

      // Maintain rolling history
      historyRef.current.push({ t, pos, vel, acc })
      const cutoff = t - HISTORY_SEC
      while (historyRef.current.length > 1 && historyRef.current[0].t < cutoff) {
        historyRef.current.shift()
      }

      // Block position
      const blockX = EQ_X + pos * 60  // scale: 60px per unit
      const blockLeft = blockX - BLOCK_W / 2

      // Spring
      const springEnd = blockLeft
      d3.select('#spring-path').attr('d', buildZigzag(WALL_X, springEnd, SPRING_Y, SEGS))

      // Block
      d3.select('#block-rect').attr('x', blockLeft).attr('y', SPRING_Y - BLOCK_H / 2)
      d3.select('#block-label').attr('x', blockX).attr('y', SPRING_Y)

      // Velocity arrow
      const arrowLen = Math.min(Math.abs(vel) * 20, 60)
      const arrowDir = vel >= 0 ? 1 : -1
      d3.select('#vel-arrow')
        .attr('x1', blockX).attr('y1', SPRING_Y)
        .attr('x2', blockX + arrowDir * arrowLen).attr('y2', SPRING_Y)
        .attr('opacity', Math.abs(vel) > 0.05 ? 1 : 0)

      // Graphs
      const history = historyRef.current
      const tMin = t - HISTORY_SEC
      const tMax = t

      const xSc = d3.scaleLinear().domain([tMin, tMax]).range([M.left, W - M.right])
      const nowX = xSc(t)

      const graphDatas = { pos: history.map(h => [h.t, h.pos]), vel: history.map(h => [h.t, h.vel]), acc: history.map(h => [h.t, h.acc]) }

      Object.entries(graphDatas).forEach(([id, data]) => {
        const gd = graphDefsMap[id]
        const yTop = gd.yOffset
        const ySc = d3.scaleLinear().domain(gd.yDomain).range([yTop + GRAPH_H - 4, yTop + 4])
        const line = d3.line().x(d => xSc(d[0])).y(d => ySc(d[1])).curve(d3.curveCatmullRom)
        d3.select(`#graph-${id}`).attr('d', line(data))
        d3.select(`#now-${id}`).attr('x1', nowX).attr('x2', nowX)
      })

      rafRef.current = requestAnimationFrame(frame)
    }

    if (running) {
      rafRef.current = requestAnimationFrame(frame)
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      startTimeRef.current = null
      historyRef.current = []
    }
  }, [running]) // restart loop when play/pause changes

  const handlePlayPause = () => {
    setRunning(v => !v)
  }

  return (
    <div className="flex flex-col gap-3">
      <svg ref={svgRef} width={W} height={H} className="w-full overflow-visible" />

      <div className="px-2 flex flex-col gap-2">
        <SliderControl label="Amplitude A" min={0.5} max={2.0} step={0.1} value={amplitude} onChange={setAmplitude} />
        <SliderControl label="Angular freq ω" min={0.5} max={3.0} step={0.1} value={omega} onChange={setOmega} />

        <div className="flex items-center justify-between">
          <button
            onClick={handlePlayPause}
            className="px-5 py-1.5 rounded-lg text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors"
          >
            {running ? '⏸ Pause' : '▶ Play'}
          </button>
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex flex-col items-end gap-0.5">
            <span>x = A·cos(ωt)</span>
            <span>v = −Aω·sin(ωt)</span>
            <span>a = −Aω²·cos(ωt)</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center italic px-2">
        When position is maximum, velocity is zero and acceleration (restoring force) is maximum. This is simple harmonic motion.
      </p>
    </div>
  )
}
