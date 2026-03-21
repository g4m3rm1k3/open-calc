import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import SliderControl from '../SliderControl.jsx'

const PRESETS = [
  {
    label: 'Constant Speed',
    fn: (t) => 3 * t - 5,
    tMax: 4,
    xMin: -6,
    xMax: 7,
    color: '#10b981',
    eq: 'x(t) = 3t − 5',
  },
  {
    label: 'Acceleration',
    fn: (t) => t * t - 4,
    tMax: 4,
    xMin: -5,
    xMax: 13,
    color: '#f59e0b',
    eq: 'x(t) = t² − 4',
  },
  {
    label: 'Stop & Reverse',
    fn: (t) => t * t * t - 3 * t,
    tMax: 2.5,
    xMin: -3,
    xMax: 5,
    color: '#6470f1',
    eq: 'x(t) = t³ − 3t',
  },
]

const SVG_W = 580
const SVG_H = 380
const ROAD_Y1 = 0
const ROAD_Y2 = 140
const GRAPH_Y1 = 150
const GRAPH_Y2 = 370
const MARGIN = { left: 48, right: 24, top: 12, bottom: 24 }
const ANIM_DURATION_S = 5

export default function MotionTracer() {
  const svgRef = useRef(null)
  const rafRef = useRef(null)
  const startTimeRef = useRef(null)
  const traceRef = useRef([])
  const playingRef = useRef(false)

  const [presetIdx, setPresetIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [tNow, setTNow] = useState(0)

  const preset = PRESETS[presetIdx]

  // D3 scales derived from current preset
  const xScale = useCallback(
    (val) => {
      const scale = d3
        .scaleLinear()
        .domain([preset.xMin, preset.xMax])
        .range([MARGIN.left, SVG_W - MARGIN.right])
      return scale(val)
    },
    [preset]
  )

  const tScale = useCallback(
    (val) => {
      const scale = d3
        .scaleLinear()
        .domain([0, preset.tMax])
        .range([MARGIN.left, SVG_W - MARGIN.right])
      return scale(val)
    },
    [preset]
  )

  const posScale = useCallback(
    (val) => {
      const scale = d3
        .scaleLinear()
        .domain([preset.xMin, preset.xMax])
        .range([GRAPH_Y2 - MARGIN.bottom, GRAPH_Y1 + MARGIN.top])
      return scale(val)
    },
    [preset]
  )

  // Draw static elements (axes, road, grid) whenever preset changes
  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    traceRef.current = []

    // ── Road background ──────────────────────────────────────────────
    const roadY = (ROAD_Y1 + ROAD_Y2) / 2
    const roadH = 30

    svg
      .append('rect')
      .attr('x', MARGIN.left)
      .attr('y', roadY - roadH / 2)
      .attr('width', SVG_W - MARGIN.left - MARGIN.right)
      .attr('height', roadH)
      .attr('rx', 4)
      .attr('fill', '#e2e8f0')

    // Road dashes
    const dashCount = 14
    const roadLeft = MARGIN.left
    const roadRight = SVG_W - MARGIN.right
    for (let i = 0; i <= dashCount; i++) {
      const dx = roadLeft + ((roadRight - roadLeft) / dashCount) * i
      svg
        .append('line')
        .attr('x1', dx)
        .attr('x2', dx + (roadRight - roadLeft) / dashCount / 2.5)
        .attr('y1', roadY)
        .attr('y2', roadY)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 2)
    }

    // Number line ticks
    const xScaleFn = d3
      .scaleLinear()
      .domain([preset.xMin, preset.xMax])
      .range([MARGIN.left, SVG_W - MARGIN.right])

    svg
      .append('line')
      .attr('x1', MARGIN.left)
      .attr('x2', SVG_W - MARGIN.right)
      .attr('y1', roadY + roadH / 2 + 14)
      .attr('y2', roadY + roadH / 2 + 14)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1.5)

    d3.range(Math.ceil(preset.xMin), Math.floor(preset.xMax) + 1).forEach((n) => {
      const tx = xScaleFn(n)
      svg
        .append('line')
        .attr('x1', tx)
        .attr('x2', tx)
        .attr('y1', roadY + roadH / 2 + 10)
        .attr('y2', roadY + roadH / 2 + 18)
        .attr('stroke', '#64748b')
        .attr('stroke-width', 1)

      if (n % 2 === 0 || preset.xMax - preset.xMin <= 10) {
        svg
          .append('text')
          .attr('x', tx)
          .attr('y', roadY + roadH / 2 + 30)
          .attr('text-anchor', 'middle')
          .attr('font-size', 11)
          .attr('fill', '#64748b')
          .text(n)
      }
    })

    // Car placeholder (will be updated each frame)
    svg
      .append('rect')
      .attr('id', 'car')
      .attr('width', 28)
      .attr('height', 14)
      .attr('rx', 3)
      .attr('y', roadY - 7)
      .attr('fill', '#6470f1')
      .attr('x', xScaleFn(preset.fn(0)) - 14)

    // Car top dome
    svg
      .append('rect')
      .attr('id', 'car-top')
      .attr('width', 16)
      .attr('height', 8)
      .attr('rx', 3)
      .attr('fill', '#818cf8')
      .attr('y', roadY - 14)
      .attr('x', xScaleFn(preset.fn(0)) - 8)

    // Car wheels
    ;[-9, 7].forEach((offset, i) => {
      svg
        .append('circle')
        .attr('class', 'car-wheel')
        .attr('r', 4)
        .attr('cy', roadY + 7)
        .attr('cx', xScaleFn(preset.fn(0)) + offset)
        .attr('fill', '#1e293b')
    })

    // ── Bottom graph axes ─────────────────────────────────────────────
    const tScaleFn = d3
      .scaleLinear()
      .domain([0, preset.tMax])
      .range([MARGIN.left, SVG_W - MARGIN.right])

    const posScaleFn = d3
      .scaleLinear()
      .domain([preset.xMin, preset.xMax])
      .range([GRAPH_Y2 - MARGIN.bottom, GRAPH_Y1 + MARGIN.top])

    // Grid lines
    tScaleFn.ticks(6).forEach((tv) => {
      svg
        .append('line')
        .attr('x1', tScaleFn(tv))
        .attr('x2', tScaleFn(tv))
        .attr('y1', GRAPH_Y1 + MARGIN.top)
        .attr('y2', GRAPH_Y2 - MARGIN.bottom)
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1)
    })

    posScaleFn.ticks(6).forEach((pv) => {
      svg
        .append('line')
        .attr('x1', MARGIN.left)
        .attr('x2', SVG_W - MARGIN.right)
        .attr('y1', posScaleFn(pv))
        .attr('y2', posScaleFn(pv))
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1)
    })

    // Zero line
    if (preset.xMin < 0 && preset.xMax > 0) {
      svg
        .append('line')
        .attr('x1', MARGIN.left)
        .attr('x2', SVG_W - MARGIN.right)
        .attr('y1', posScaleFn(0))
        .attr('y2', posScaleFn(0))
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,3')
    }

    // X axis (time)
    svg
      .append('line')
      .attr('x1', MARGIN.left)
      .attr('x2', SVG_W - MARGIN.right)
      .attr('y1', GRAPH_Y2 - MARGIN.bottom)
      .attr('y2', GRAPH_Y2 - MARGIN.bottom)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1.5)

    tScaleFn.ticks(6).forEach((tv) => {
      svg
        .append('text')
        .attr('x', tScaleFn(tv))
        .attr('y', GRAPH_Y2 - MARGIN.bottom + 16)
        .attr('text-anchor', 'middle')
        .attr('font-size', 11)
        .attr('fill', '#64748b')
        .text(tv)
    })

    svg
      .append('text')
      .attr('x', (MARGIN.left + SVG_W - MARGIN.right) / 2)
      .attr('y', GRAPH_Y2 - 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('fill', '#64748b')
      .text('time t (s)')

    // Y axis (position)
    svg
      .append('line')
      .attr('x1', MARGIN.left)
      .attr('x2', MARGIN.left)
      .attr('y1', GRAPH_Y1 + MARGIN.top)
      .attr('y2', GRAPH_Y2 - MARGIN.bottom)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1.5)

    posScaleFn.ticks(5).forEach((pv) => {
      svg
        .append('text')
        .attr('x', MARGIN.left - 6)
        .attr('y', posScaleFn(pv) + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', 11)
        .attr('fill', '#64748b')
        .text(pv)
    })

    svg
      .append('text')
      .attr('transform', `rotate(-90)`)
      .attr('x', -((GRAPH_Y1 + GRAPH_Y2) / 2))
      .attr('y', 12)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('fill', '#64748b')
      .text('x(t)')

    // Equation label
    svg
      .append('text')
      .attr('x', SVG_W - MARGIN.right - 4)
      .attr('y', GRAPH_Y1 + MARGIN.top + 14)
      .attr('text-anchor', 'end')
      .attr('font-size', 13)
      .attr('font-style', 'italic')
      .attr('fill', preset.color)
      .text(preset.eq)

    // Trace path placeholder
    svg.append('path').attr('id', 'trace-path').attr('fill', 'none').attr('stroke', preset.color).attr('stroke-width', 2.5)

    // Annotation group
    svg.append('g').attr('id', 'annotation')
  }, [preset])

  // Animation loop
  const animate = useCallback(
    (timestamp) => {
      if (!playingRef.current) return
      if (!startTimeRef.current) startTimeRef.current = timestamp

      const elapsed = (timestamp - startTimeRef.current) / 1000
      const tCurrent = Math.min((elapsed / ANIM_DURATION_S) * preset.tMax, preset.tMax)

      const svg = d3.select(svgRef.current)
      const xScaleFn = d3.scaleLinear().domain([preset.xMin, preset.xMax]).range([MARGIN.left, SVG_W - MARGIN.right])
      const tScaleFn = d3.scaleLinear().domain([0, preset.tMax]).range([MARGIN.left, SVG_W - MARGIN.right])
      const posScaleFn = d3.scaleLinear().domain([preset.xMin, preset.xMax]).range([GRAPH_Y2 - MARGIN.bottom, GRAPH_Y1 + MARGIN.top])

      const carX = preset.fn(tCurrent)
      const cx = xScaleFn(carX)

      // Update car
      svg.select('#car').attr('x', cx - 14)
      svg.select('#car-top').attr('x', cx - 8)
      const wheels = svg.selectAll('.car-wheel').nodes()
      if (wheels[0]) d3.select(wheels[0]).attr('cx', cx - 9)
      if (wheels[1]) d3.select(wheels[1]).attr('cx', cx + 7)

      // Add to trace
      traceRef.current.push([tCurrent, carX])

      // Redraw trace path
      const lineGen = d3
        .line()
        .x((d) => tScaleFn(d[0]))
        .y((d) => posScaleFn(d[1]))
        .curve(d3.curveCatmullRom)

      svg.select('#trace-path').attr('d', lineGen(traceRef.current))

      // Annotation: dashed crosshairs at current point
      const ann = svg.select('#annotation')
      ann.selectAll('*').remove()

      const tx = tScaleFn(tCurrent)
      const py = posScaleFn(carX)

      ann
        .append('line')
        .attr('x1', MARGIN.left)
        .attr('x2', tx)
        .attr('y1', py)
        .attr('y2', py)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,3')

      ann
        .append('line')
        .attr('x1', tx)
        .attr('x2', tx)
        .attr('y1', py)
        .attr('y2', GRAPH_Y2 - MARGIN.bottom)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,3')

      ann
        .append('circle')
        .attr('cx', tx)
        .attr('cy', py)
        .attr('r', 4)
        .attr('fill', preset.color)

      const labelX = tx > SVG_W / 2 ? tx - 6 : tx + 6
      const anchor = tx > SVG_W / 2 ? 'end' : 'start'
      ann
        .append('text')
        .attr('x', labelX)
        .attr('y', py - 8)
        .attr('text-anchor', anchor)
        .attr('font-size', 11)
        .attr('fill', preset.color)
        .text(`(${tCurrent.toFixed(2)}, ${carX.toFixed(2)})`)

      setTNow(tCurrent)

      if (tCurrent < preset.tMax) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        playingRef.current = false
        setPlaying(false)
      }
    },
    [preset]
  )

  const handlePlayPause = () => {
    if (playing) {
      // Pause
      playingRef.current = false
      setPlaying(false)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    } else {
      // Resume or restart if finished
      playingRef.current = true
      setPlaying(true)
      if (tNow >= preset.tMax) {
        // Restart
        traceRef.current = []
        startTimeRef.current = null
      } else {
        // Resume: adjust startTime so t continues from tNow
        const resumeOffset = (tNow / preset.tMax) * ANIM_DURATION_S
        startTimeRef.current = null
        // We'll use a wrapper to set start adjusted for elapsed
        const resumeAnimate = (timestamp) => {
          if (!startTimeRef.current) {
            startTimeRef.current = timestamp - resumeOffset * 1000
          }
          animate(timestamp)
        }
        rafRef.current = requestAnimationFrame(resumeAnimate)
        return
      }
      rafRef.current = requestAnimationFrame(animate)
    }
  }

  const handlePreset = (idx) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    playingRef.current = false
    setPlaying(false)
    traceRef.current = []
    startTimeRef.current = null
    setTNow(0)
    setPresetIdx(idx)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Motion Tracer</h3>

      <svg
        ref={svgRef}
        width={SVG_W}
        height={SVG_H}
        className="rounded-lg border border-slate-100 dark:border-slate-800"
        style={{ maxWidth: '100%' }}
      />

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          onClick={handlePlayPause}
          className="px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors"
          style={{ backgroundColor: playing ? '#64748b' : '#6470f1' }}
        >
          {playing ? 'Pause' : tNow >= preset.tMax ? 'Replay' : 'Play'}
        </button>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => handlePreset(i)}
              className="px-3 py-1 rounded-lg text-sm font-medium border transition-colors"
              style={{
                borderColor: p.color,
                color: presetIdx === i ? 'white' : p.color,
                backgroundColor: presetIdx === i ? p.color : 'transparent',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-lg leading-relaxed">
        Height of the graph = position of the car. Steeper slope = faster motion. Flat = stopped. Downward slope = moving backward.
      </p>
    </div>
  )
}
