/**
 * DisplacementVsDistance
 *
 * Teaching goal: show students WHY displacement and distance are different numbers,
 * computed by different formulas, and how they diverge the moment an object reverses.
 *
 * Core insight shown:
 *   Displacement = x_final − x_initial  (one subtraction, signed)
 *   Distance     = |Δx₁| + |Δx₂| + …   (sum of absolute segment lengths)
 *
 * The formulas are written out live — not just the answer — so students
 * connect the animation to the algebra as it happens.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'

// ─── Presets ─────────────────────────────────────────────────────────────────
// Each preset is a sequence of signed segments (positive = right, negative = left).
// x_start is the starting position on the number line.
const PRESETS = [
  {
    label: 'One direction',
    desc: 'Object moves right only. Displacement = Distance.',
    x0: -4,
    segments: [8],
    color: '#10b981',
  },
  {
    label: 'Back and forth',
    desc: 'Object moves right, then partly back. Displacement < Distance.',
    x0: -5,
    segments: [9, -4],
    color: '#6470f1',
  },
  {
    label: 'Full reversal',
    desc: 'Object returns exactly to start. Displacement = 0, Distance > 0.',
    x0: -4,
    segments: [7, -7],
    color: '#f59e0b',
  },
  {
    label: 'Multi-segment',
    desc: 'Three legs. Distance keeps growing even when displacement shrinks.',
    x0: -6,
    segments: [8, -5, 3],
    color: '#e11d48',
  },
]

const SVG_W = 560
const SVG_H = 220
const NL_Y = 80        // number line y position
const NL_LEFT = 40
const NL_RIGHT = 520
const TICK_SCALE_DOMAIN = [-8, 8]

// Duration per unit of distance (ms per metre)
const MS_PER_UNIT = 220

function fmt(n) {
  const s = n.toFixed(1)
  return n >= 0 ? `+${s}` : s
}

export default function DisplacementVsDistance() {
  const svgRef = useRef(null)
  const rafRef = useRef(null)
  const phaseRef = useRef({ segIdx: 0, progress: 0, done: false })
  const playingRef = useRef(false)
  const lastTimeRef = useRef(null)

  const [presetIdx, setPresetIdx] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const [liveState, setLiveState] = useState({ xCur: 0, distance: 0, displacement: 0, segsDone: [] })

  const preset = PRESETS[presetIdx]

  // Build a flat list of segment data for the current preset
  const buildSegments = useCallback((p) => {
    const segs = []
    let x = p.x0
    p.segments.forEach((dx, i) => {
      segs.push({ x0: x, dx, x1: x + dx, idx: i })
      x += dx
    })
    return segs
  }, [])

  // ── Draw static elements ───────────────────────────────────────────────────
  const drawStatic = useCallback(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const p = PRESETS[presetIdx]
    const xScale = d3.scaleLinear().domain(TICK_SCALE_DOMAIN).range([NL_LEFT, NL_RIGHT])

    // Number line axis
    svg.append('line')
      .attr('x1', NL_LEFT - 10).attr('x2', NL_RIGHT + 10)
      .attr('y1', NL_Y).attr('y2', NL_Y)
      .attr('stroke', '#94a3b8').attr('stroke-width', 2)

    // Arrow heads on axis
    ;[[-1, NL_LEFT - 10], [1, NL_RIGHT + 10]].forEach(([dir, x]) => {
      svg.append('polygon')
        .attr('points', dir === 1
          ? `${x},${NL_Y} ${x - 8},${NL_Y - 4} ${x - 8},${NL_Y + 4}`
          : `${x},${NL_Y} ${x + 8},${NL_Y - 4} ${x + 8},${NL_Y + 4}`)
        .attr('fill', '#94a3b8')
    })

    // Ticks and labels
    d3.range(-7, 8).forEach(v => {
      const cx = xScale(v)
      svg.append('line')
        .attr('x1', cx).attr('x2', cx)
        .attr('y1', NL_Y - 5).attr('y2', NL_Y + 5)
        .attr('stroke', '#94a3b8').attr('stroke-width', 1)
      if (v % 2 === 0) {
        svg.append('text')
          .attr('x', cx).attr('y', NL_Y + 18)
          .attr('text-anchor', 'middle')
          .attr('font-size', 11).attr('fill', '#64748b')
          .text(v)
      }
    })

    // Origin label
    svg.append('text')
      .attr('x', xScale(0)).attr('y', NL_Y - 12)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10).attr('fill', '#64748b')
      .text('0')

    // x label on axis
    svg.append('text')
      .attr('x', NL_RIGHT + 18).attr('y', NL_Y + 4)
      .attr('font-size', 13).attr('fill', '#64748b').attr('font-style', 'italic')
      .text('x')

    // Starting position marker (triangle above)
    const x0px = xScale(p.x0)
    svg.append('polygon')
      .attr('points', `${x0px},${NL_Y - 10} ${x0px - 6},${NL_Y - 22} ${x0px + 6},${NL_Y - 22}`)
      .attr('fill', '#cbd5e1').attr('stroke', '#94a3b8').attr('stroke-width', 1)
    svg.append('text')
      .attr('x', x0px).attr('y', NL_Y - 26)
      .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#64748b')
      .text(`x₀ = ${p.x0}`)

  }, [presetIdx])

  // ── Draw animated elements ─────────────────────────────────────────────────
  const drawFrame = useCallback((segsDone, segIdx, segProgress) => {
    const svg = d3.select(svgRef.current)
    svg.select('#anim-layer').remove()
    const layer = svg.append('g').attr('id', 'anim-layer')

    const p = PRESETS[presetIdx]
    const segs = buildSegments(p)
    const xScale = d3.scaleLinear().domain(TICK_SCALE_DOMAIN).range([NL_LEFT, NL_RIGHT])

    let distance = 0
    let xCur = p.x0

    // Draw completed segments
    segsDone.forEach((si) => {
      const seg = segs[si]
      const x0px = xScale(seg.x0)
      const x1px = xScale(seg.x1)
      const dir = seg.dx > 0 ? 1 : -1
      const yOff = 18 + si * 14  // stagger below line for multi-segment

      // Solid segment line below the number line
      layer.append('line')
        .attr('x1', x0px).attr('x2', x1px)
        .attr('y1', NL_Y + yOff).attr('y2', NL_Y + yOff)
        .attr('stroke', p.color).attr('stroke-width', 3).attr('opacity', 0.7)

      // Distance label on segment
      const midX = (x0px + x1px) / 2
      layer.append('text')
        .attr('x', midX).attr('y', NL_Y + yOff - 4)
        .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', p.color)
        .text(`|${seg.dx}| = ${Math.abs(seg.dx)}`)

      distance += Math.abs(seg.dx)
      xCur = seg.x1
    })

    // Draw in-progress segment
    if (segIdx < segs.length) {
      const seg = segs[segIdx]
      const xMid = seg.x0 + seg.dx * segProgress
      const x0px = xScale(seg.x0)
      const xMidPx = xScale(xMid)
      const yOff = 18 + segIdx * 14

      layer.append('line')
        .attr('x1', x0px).attr('x2', xMidPx)
        .attr('y1', NL_Y + yOff).attr('y2', NL_Y + yOff)
        .attr('stroke', p.color).attr('stroke-width', 3).attr('opacity', 0.5)
        .attr('stroke-dasharray', '4,3')

      distance += Math.abs(seg.dx * segProgress)
      xCur = xMid
    }

    // Displacement arrow (from x0 to xCur, above the number line)
    const dispVal = xCur - p.x0
    const x0px = xScale(p.x0)
    const xCurPx = xScale(xCur)
    if (Math.abs(dispVal) > 0.05) {
      const arrowY = NL_Y - 38
      // Line
      layer.append('line')
        .attr('x1', x0px).attr('x2', xCurPx)
        .attr('y1', arrowY).attr('y2', arrowY)
        .attr('stroke', '#6470f1').attr('stroke-width', 2.5)
      // Arrowhead
      const dir = dispVal > 0 ? 1 : -1
      layer.append('polygon')
        .attr('points', dispVal > 0
          ? `${xCurPx},${arrowY} ${xCurPx - 7},${arrowY - 4} ${xCurPx - 7},${arrowY + 4}`
          : `${xCurPx},${arrowY} ${xCurPx + 7},${arrowY - 4} ${xCurPx + 7},${arrowY + 4}`)
        .attr('fill', '#6470f1')
      // Δx label above arrow
      const midX = (x0px + xCurPx) / 2
      layer.append('text')
        .attr('x', midX).attr('y', arrowY - 6)
        .attr('text-anchor', 'middle').attr('font-size', 11)
        .attr('fill', '#6470f1').attr('font-weight', 'bold')
        .text(`Δx = ${dispVal.toFixed(1)}`)
    }

    // Moving object (circle on number line)
    layer.append('circle')
      .attr('cx', xCurPx).attr('cy', NL_Y)
      .attr('r', 10)
      .attr('fill', p.color).attr('stroke', '#fff').attr('stroke-width', 2)

    layer.append('text')
      .attr('x', xCurPx).attr('y', NL_Y + 4)
      .attr('text-anchor', 'middle').attr('font-size', 9)
      .attr('fill', '#fff').attr('font-weight', 'bold')
      .text(xCur.toFixed(1))

    setLiveState({ xCur, distance, displacement: dispVal, segsDone })
  }, [presetIdx, buildSegments])

  // ── Animation loop ─────────────────────────────────────────────────────────
  const animate = useCallback((timestamp) => {
    if (!playingRef.current) return
    if (!lastTimeRef.current) lastTimeRef.current = timestamp

    const dt = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp

    const p = PRESETS[presetIdx]
    const segs = buildSegments(p)
    const phase = phaseRef.current

    if (phase.done) return

    // Advance progress within current segment
    const seg = segs[phase.segIdx]
    const segDuration = Math.abs(seg.dx) * MS_PER_UNIT
    phase.progress += dt / segDuration

    if (phase.progress >= 1) {
      // Segment complete — move to next
      const newDone = [...phase.segsDone || [], phase.segIdx]
      phase.segsDone = newDone
      phase.segIdx += 1
      phase.progress = 0

      if (phase.segIdx >= segs.length) {
        phase.done = true
        playingRef.current = false
        setPlaying(false)
        setDone(true)
        drawFrame(newDone, phase.segIdx, 0)
        return
      }
    }

    drawFrame(phase.segsDone || [], phase.segIdx, Math.min(phase.progress, 1))
    rafRef.current = requestAnimationFrame(animate)
  }, [presetIdx, buildSegments, drawFrame])

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    playingRef.current = false
    lastTimeRef.current = null
    phaseRef.current = { segIdx: 0, progress: 0, done: false, segsDone: [] }
    setPlaying(false)
    setDone(false)
    const p = PRESETS[presetIdx]
    setLiveState({ xCur: p.x0, distance: 0, displacement: 0, segsDone: [] })
    drawStatic()
    const svg = d3.select(svgRef.current)
    svg.select('#anim-layer').remove()
    // Draw object at start
    const xScale = d3.scaleLinear().domain(TICK_SCALE_DOMAIN).range([NL_LEFT, NL_RIGHT])
    const layer = svg.append('g').attr('id', 'anim-layer')
    layer.append('circle')
      .attr('cx', xScale(p.x0)).attr('cy', NL_Y)
      .attr('r', 10)
      .attr('fill', p.color).attr('stroke', '#fff').attr('stroke-width', 2)
  }, [presetIdx, drawStatic])

  const play = useCallback(() => {
    if (done) reset()
    playingRef.current = true
    lastTimeRef.current = null
    setPlaying(true)
    setDone(false)
    rafRef.current = requestAnimationFrame(animate)
  }, [done, reset, animate])

  const pause = useCallback(() => {
    playingRef.current = false
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setPlaying(false)
  }, [])

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    reset()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [presetIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    drawStatic()
  }, [drawStatic])

  // ── Derived display values ─────────────────────────────────────────────────
  const p = PRESETS[presetIdx]
  const { xCur, distance, displacement } = liveState
  const xFmt = xCur.toFixed(1)
  const distFmt = distance.toFixed(1)
  const dispFmt = displacement.toFixed(1)
  const dispSign = displacement >= 0 ? '+' : ''

  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 select-none">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
        Displacement vs Distance
      </h3>

      {/* Preset selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {PRESETS.map((pr, i) => (
          <button
            key={i}
            onClick={() => { if (!playing) setPresetIdx(i) }}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              i === presetIdx
                ? 'text-white border-transparent'
                : 'text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-400'
            }`}
            style={i === presetIdx ? { backgroundColor: PRESETS[i].color, borderColor: PRESETS[i].color } : {}}
          >
            {pr.label}
          </button>
        ))}
      </div>

      {/* Preset description */}
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 italic px-4">
        {p.desc}
      </p>

      {/* SVG */}
      <svg
        ref={svgRef}
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ maxWidth: '100%' }}
        className="mx-auto"
      />

      {/* Live formula panels */}
      <div className="grid grid-cols-2 gap-3 px-2">
        {/* Displacement panel */}
        <div className="rounded-lg border-2 border-indigo-300 dark:border-indigo-600 p-3 bg-indigo-50 dark:bg-indigo-950">
          <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1">
            Displacement (vector)
          </div>
          <div className="font-mono text-sm text-indigo-800 dark:text-indigo-200">
            Δx = x<sub>f</sub> − x<sub>0</sub>
          </div>
          <div className="font-mono text-sm text-indigo-800 dark:text-indigo-200">
            &nbsp;&nbsp;&nbsp;= {xFmt} − ({p.x0})
          </div>
          <div className="font-mono text-base font-bold text-indigo-900 dark:text-indigo-100 mt-1">
            &nbsp;&nbsp;&nbsp;= {dispSign}{dispFmt} m
          </div>
          <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
            {displacement < 0 ? '← moved left (net)' : displacement > 0 ? '→ moved right (net)' : 'no net movement'}
          </div>
        </div>

        {/* Distance panel */}
        <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-600 p-3 bg-emerald-50 dark:bg-emerald-950">
          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">
            Distance (scalar)
          </div>
          <div className="font-mono text-sm text-emerald-800 dark:text-emerald-200">
            d = |Δx₁| + |Δx₂| + …
          </div>
          <div className="font-mono text-sm text-emerald-800 dark:text-emerald-200">
            &nbsp;&nbsp;= {
              liveState.segsDone.length > 0
                ? p.segments.slice(0, liveState.segsDone.length).map(dx => `|${dx}|`).join(' + ')
                : '…'
            }
          </div>
          <div className="font-mono text-base font-bold text-emerald-900 dark:text-emerald-100 mt-1">
            &nbsp;&nbsp;= {distFmt} m
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            always ≥ |displacement|
          </div>
        </div>
      </div>

      {/* Key insight — shown when animation completes */}
      {done && (
        <div className={`rounded-lg px-4 py-2 text-sm text-center font-medium ${
          Math.abs(displacement) < 0.05
            ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
            : Math.abs(distFmt - Math.abs(dispFmt)) < 0.2
            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
            : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700'
        }`}>
          {Math.abs(displacement) < 0.05
            ? `Displacement = 0 m but distance = ${distFmt} m. The object moved, but returned exactly to start.`
            : Math.abs(parseFloat(distFmt) - Math.abs(parseFloat(dispFmt))) < 0.2
            ? `Displacement = Distance = ${distFmt} m. Object moved in one direction only — they match.`
            : `Displacement (${dispSign}${dispFmt} m) ≠ Distance (${distFmt} m). Direction reversed → they diverge.`
          }
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <button
          onClick={playing ? pause : play}
          className="px-5 py-1.5 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: playing ? '#64748b' : p.color }}
        >
          {playing ? 'Pause' : done ? 'Replay' : 'Play'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-1.5 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Reset
        </button>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 text-center px-4">
        The purple arrow shows displacement (x<sub>final</sub> − x<sub>0</sub>).
        The coloured segments below the line show each leg of the journey — distance adds them all up.
      </p>
    </div>
  )
}
