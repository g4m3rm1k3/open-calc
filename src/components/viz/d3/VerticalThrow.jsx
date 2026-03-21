import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import SliderControl from '../SliderControl.jsx'

const SVG_W = 580
const SVG_H = 400

// Left panel bounds (ball track)
const TRACK_X = 0
const TRACK_W = 200
const GROUND_Y = 360
const CEILING_Y = 20

// Right panel bounds (graph)
const GRAPH_X1 = 230
const GRAPH_X2 = 560
const GRAPH_Y1 = 20
const GRAPH_Y2 = 360
const GRAPH_ML = 40
const GRAPH_MR = 50
const GRAPH_MT = 10
const GRAPH_MB = 30

function hFn(t, v0) {
  return v0 * t - 16 * t * t
}

function vFn(t, v0) {
  return v0 - 32 * t
}

export default function VerticalThrow() {
  const svgRef = useRef(null)
  const rafRef = useRef(null)
  const startTimeRef = useRef(null)
  const playingRef = useRef(false)

  const [v0, setV0] = useState(64)
  const [playing, setPlaying] = useState(false)
  const [showPeak, setShowPeak] = useState(false)

  const tFlight = (2 * v0) / 32    // time when ball lands
  const tPeak = v0 / 32             // time of max height
  const hMax = hFn(tPeak, v0)       // max height

  // Map height in feet to pixel y inside the left track
  const heightToY = useCallback(
    (h) => {
      return GROUND_Y - (h / (hMax + 10)) * (GROUND_Y - CEILING_Y)
    },
    [hMax]
  )

  // Draw static SVG content
  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    setShowPeak(false)

    // ── Left panel: ball track ─────────────────────────────────────
    // Background
    svg
      .append('rect')
      .attr('x', TRACK_X)
      .attr('y', CEILING_Y)
      .attr('width', TRACK_W)
      .attr('height', GROUND_Y - CEILING_Y)
      .attr('fill', '#f8fafc')

    // Ground
    svg
      .append('rect')
      .attr('x', TRACK_X)
      .attr('y', GROUND_Y)
      .attr('width', TRACK_W)
      .attr('height', SVG_H - GROUND_Y)
      .attr('fill', '#e2e8f0')

    svg
      .append('line')
      .attr('x1', TRACK_X)
      .attr('x2', TRACK_W)
      .attr('y1', GROUND_Y)
      .attr('y2', GROUND_Y)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 2)

    // Ruler on left edge
    const rulerX = TRACK_X + 22
    svg
      .append('line')
      .attr('x1', rulerX)
      .attr('x2', rulerX)
      .attr('y1', CEILING_Y)
      .attr('y2', GROUND_Y)
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1.5)

    const tickStep = hMax > 80 ? 20 : 10
    for (let h = 0; h <= Math.ceil(hMax + 10); h += tickStep) {
      const ty = heightToY(h)
      svg
        .append('line')
        .attr('x1', rulerX - 5)
        .attr('x2', rulerX + 5)
        .attr('y1', ty)
        .attr('y2', ty)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1)

      svg
        .append('text')
        .attr('x', rulerX - 8)
        .attr('y', ty + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', 10)
        .attr('fill', '#94a3b8')
        .text(h)
    }

    // ft label
    svg
      .append('text')
      .attr('x', rulerX - 8)
      .attr('y', CEILING_Y - 6)
      .attr('text-anchor', 'end')
      .attr('font-size', 10)
      .attr('fill', '#94a3b8')
      .text('ft')

    // Peak dashed line
    const peakY = heightToY(hMax)
    svg
      .append('line')
      .attr('id', 'peak-line-track')
      .attr('x1', TRACK_X + 28)
      .attr('x2', TRACK_W)
      .attr('y1', peakY)
      .attr('y2', peakY)
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '5,3')

    svg
      .append('text')
      .attr('x', TRACK_W - 4)
      .attr('y', peakY - 5)
      .attr('text-anchor', 'end')
      .attr('font-size', 10)
      .attr('fill', '#ef4444')
      .text(`hₘₐₓ = ${hMax.toFixed(0)} ft`)

    // Ball (will be repositioned in animation)
    svg
      .append('circle')
      .attr('id', 'ball')
      .attr('r', 10)
      .attr('cx', TRACK_W / 2)
      .attr('cy', GROUND_Y)
      .attr('fill', '#6470f1')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 1.5)

    // Peak flash label (hidden initially)
    svg
      .append('text')
      .attr('id', 'peak-label')
      .attr('x', TRACK_W / 2 + 14)
      .attr('y', peakY - 14)
      .attr('font-size', 11)
      .attr('font-weight', 'bold')
      .attr('fill', '#ef4444')
      .attr('opacity', 0)
      .text('Max height! v = 0')

    // ── Right panel: graph ─────────────────────────────────────────
    const innerL = GRAPH_X1 + GRAPH_ML
    const innerR = GRAPH_X2 - GRAPH_MR
    const innerT = GRAPH_Y1 + GRAPH_MT
    const innerB = GRAPH_Y2 - GRAPH_MB

    const tScaleFn = d3.scaleLinear().domain([0, tFlight]).range([innerL, innerR])
    const hScaleFn = d3.scaleLinear().domain([-10, hMax + 15]).range([innerB, innerT])
    const vScaleFn = d3.scaleLinear().domain([-(v0 + 10), v0 + 10]).range([innerB, innerT])

    // Graph background
    svg
      .append('rect')
      .attr('x', GRAPH_X1)
      .attr('y', GRAPH_Y1)
      .attr('width', GRAPH_X2 - GRAPH_X1)
      .attr('height', GRAPH_Y2 - GRAPH_Y1)
      .attr('fill', '#f8fafc')

    // Grid
    tScaleFn.ticks(5).forEach((tv) => {
      svg
        .append('line')
        .attr('x1', tScaleFn(tv))
        .attr('x2', tScaleFn(tv))
        .attr('y1', innerT)
        .attr('y2', innerB)
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1)
    })
    hScaleFn.ticks(5).forEach((hv) => {
      svg
        .append('line')
        .attr('x1', innerL)
        .attr('x2', innerR)
        .attr('y1', hScaleFn(hv))
        .attr('y2', hScaleFn(hv))
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1)
    })

    // Zero line (h = 0 / ground)
    svg
      .append('line')
      .attr('x1', innerL)
      .attr('x2', innerR)
      .attr('y1', hScaleFn(0))
      .attr('y2', hScaleFn(0))
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1.5)

    // Axes
    svg
      .append('line')
      .attr('x1', innerL)
      .attr('x2', innerR)
      .attr('y1', innerB)
      .attr('y2', innerB)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1.5)

    svg
      .append('line')
      .attr('x1', innerL)
      .attr('x2', innerL)
      .attr('y1', innerT)
      .attr('y2', innerB)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1.5)

    // Right y-axis for v(t)
    svg
      .append('line')
      .attr('x1', innerR)
      .attr('x2', innerR)
      .attr('y1', innerT)
      .attr('y2', innerB)
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,3')

    // T-axis ticks
    tScaleFn.ticks(5).forEach((tv) => {
      svg
        .append('text')
        .attr('x', tScaleFn(tv))
        .attr('y', innerB + 16)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('fill', '#64748b')
        .text(tv.toFixed(1))
    })

    svg
      .append('text')
      .attr('x', (innerL + innerR) / 2)
      .attr('y', innerB + 28)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('fill', '#64748b')
      .text('t (seconds)')

    // H-axis ticks (left)
    hScaleFn.ticks(5).forEach((hv) => {
      svg
        .append('text')
        .attr('x', innerL - 5)
        .attr('y', hScaleFn(hv) + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', 10)
        .attr('fill', '#64748b')
        .text(hv)
    })

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -((innerT + innerB) / 2))
      .attr('y', GRAPH_X1 + 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('fill', '#6470f1')
      .text('h (ft)')

    // V-axis ticks (right)
    vScaleFn.ticks(5).forEach((vv) => {
      svg
        .append('text')
        .attr('x', innerR + 5)
        .attr('y', vScaleFn(vv) + 4)
        .attr('text-anchor', 'start')
        .attr('font-size', 10)
        .attr('fill', '#f59e0b')
        .text(vv)
    })

    svg
      .append('text')
      .attr('transform', 'rotate(90)')
      .attr('x', (innerT + innerB) / 2)
      .attr('y', -(GRAPH_X2 - 8))
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('fill', '#f59e0b')
      .text('v (ft/s)')

    // Parabola h(t)
    const nPoints = 120
    const parabolaData = d3.range(nPoints + 1).map((i) => {
      const t = (i / nPoints) * tFlight
      return [t, hFn(t, v0)]
    })

    const parabolaLine = d3
      .line()
      .x((d) => tScaleFn(d[0]))
      .y((d) => hScaleFn(d[1]))

    svg
      .append('path')
      .datum(parabolaData)
      .attr('d', parabolaLine)
      .attr('fill', 'none')
      .attr('stroke', '#6470f1')
      .attr('stroke-width', 2.5)

    // Velocity line v(t)
    const velData = [
      [0, vFn(0, v0)],
      [tFlight, vFn(tFlight, v0)],
    ]
    const velLine = d3
      .line()
      .x((d) => tScaleFn(d[0]))
      .y((d) => vScaleFn(d[1]))

    svg
      .append('path')
      .datum(velData)
      .attr('d', velLine)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,3')

    // Peak marker: vertical dashed line at t*
    const tPeakX = tScaleFn(tPeak)
    svg
      .append('line')
      .attr('x1', tPeakX)
      .attr('x2', tPeakX)
      .attr('y1', innerT)
      .attr('y2', innerB)
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '5,3')

    svg
      .append('text')
      .attr('x', tPeakX + 4)
      .attr('y', innerT + 14)
      .attr('font-size', 10)
      .attr('fill', '#ef4444')
      .text(`t* = v₀/32`)

    svg
      .append('text')
      .attr('x', tPeakX + 4)
      .attr('y', innerT + 26)
      .attr('font-size', 10)
      .attr('fill', '#ef4444')
      .text('v = 0 here')

    // X-intercept dots (t=0 and t=tFlight)
    ;[0, tFlight].forEach((tv) => {
      svg
        .append('circle')
        .attr('cx', tScaleFn(tv))
        .attr('cy', hScaleFn(0))
        .attr('r', 5)
        .attr('fill', '#10b981')
        .attr('stroke', '#065f46')
        .attr('stroke-width', 1)

      svg
        .append('text')
        .attr('x', tScaleFn(tv))
        .attr('y', hScaleFn(0) - 8)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('fill', '#10b981')
        .text('ground')
    })

    // Curve labels
    svg
      .append('text')
      .attr('x', tScaleFn(tFlight * 0.15))
      .attr('y', hScaleFn(hFn(tFlight * 0.15, v0)) - 10)
      .attr('font-size', 11)
      .attr('font-style', 'italic')
      .attr('fill', '#6470f1')
      .text('h(t) = v₀t − 16t²')

    svg
      .append('text')
      .attr('x', tScaleFn(tFlight * 0.1))
      .attr('y', vScaleFn(vFn(tFlight * 0.1, v0)) - 8)
      .attr('font-size', 11)
      .attr('font-style', 'italic')
      .attr('fill', '#f59e0b')
      .text('v(t) = v₀ − 32t')

    // Animated dot on curve
    svg
      .append('circle')
      .attr('id', 'graph-dot')
      .attr('r', 5)
      .attr('cx', tScaleFn(0))
      .attr('cy', hScaleFn(0))
      .attr('fill', '#6470f1')
      .attr('opacity', 0)

  }, [v0, tFlight, tPeak, hMax, heightToY])

  const ANIM_DURATION_S = tFlight * 1.0

  const animate = useCallback(
    (timestamp) => {
      if (!playingRef.current) return
      if (!startTimeRef.current) startTimeRef.current = timestamp

      const elapsed = (timestamp - startTimeRef.current) / 1000
      const t = Math.min(elapsed, tFlight)

      const h = Math.max(0, hFn(t, v0))
      const ballY = heightToY(h)

      const svg = d3.select(svgRef.current)

      svg.select('#ball').attr('cy', ballY)

      // Flash peak label
      const atPeak = Math.abs(t - tPeak) < tFlight * 0.04
      svg.select('#peak-label').attr('opacity', atPeak ? 1 : 0)
      setShowPeak(atPeak)

      // Update graph dot
      const innerL = GRAPH_X1 + GRAPH_ML
      const innerR = GRAPH_X2 - GRAPH_MR
      const innerT = GRAPH_Y1 + GRAPH_MT
      const innerB = GRAPH_Y2 - GRAPH_MB
      const tScaleFn = d3.scaleLinear().domain([0, tFlight]).range([innerL, innerR])
      const hScaleFn = d3.scaleLinear().domain([-10, hMax + 15]).range([innerB, innerT])

      svg
        .select('#graph-dot')
        .attr('cx', tScaleFn(t))
        .attr('cy', hScaleFn(h))
        .attr('opacity', 1)

      if (t < tFlight) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        svg.select('#ball').attr('cy', GROUND_Y)
        svg.select('#graph-dot').attr('opacity', 0)
        playingRef.current = false
        setPlaying(false)
      }
    },
    [v0, tFlight, tPeak, hMax, heightToY]
  )

  const handlePlayPause = () => {
    if (playing) {
      playingRef.current = false
      setPlaying(false)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    } else {
      playingRef.current = true
      setPlaying(true)
      startTimeRef.current = null
      rafRef.current = requestAnimationFrame(animate)
    }
  }

  const handleV0Change = (val) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    playingRef.current = false
    setPlaying(false)
    startTimeRef.current = null
    setV0(val)
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Vertical Throw — Height & Velocity</h3>

      <svg
        ref={svgRef}
        width={SVG_W}
        height={SVG_H}
        className="rounded-lg border border-slate-100 dark:border-slate-800"
        style={{ maxWidth: '100%' }}
      />

      <div className="w-full max-w-md">
        <SliderControl
          label={`v₀ (initial velocity)`}
          min={32}
          max={96}
          step={8}
          value={v0}
          onChange={handleV0Change}
          format={(v) => `${v} ft/s`}
        />
      </div>

      <button
        onClick={handlePlayPause}
        className="px-5 py-1.5 rounded-lg text-white text-sm font-medium transition-colors"
        style={{ backgroundColor: playing ? '#64748b' : '#6470f1' }}
      >
        {playing ? 'Pause' : 'Play'}
      </button>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-lg leading-relaxed">
        The ball reaches maximum height when v(t) = v₀ − 32t = 0, i.e., t = v₀/32. At the peak, the derivative is zero — this is a critical point.
      </p>
    </div>
  )
}
