import * as d3 from 'd3'
import { useRef, useEffect, useState, useCallback } from 'react'

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'));
    update();
    const ob = new MutationObserver(update);
    ob.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => ob.disconnect();
  }, []);
  return isDark;
}

const W = 580
const ROAD_H = 80
const GRAPH_H = 110
const GRAPH_GAP = 8
const TOTAL_H = ROAD_H + 3 * GRAPH_H + 2 * GRAPH_GAP + 40
const GM = { left: 52, right: 16, top: 12, bottom: 18 }

const PRESETS = [
  {
    label: 'Smooth cruise',
    tMax: 2 * Math.PI,
    s: t => 3 * Math.sin(t) + t * 1.5,
    v: t => 3 * Math.cos(t) + 1.5,
    a: t => -3 * Math.sin(t),
  },
  {
    label: 'Braking',
    tMax: 4,
    s: t => 8 * t - t * t,
    v: t => 8 - 2 * t,
    a: () => -2,
  },
  {
    label: 'Rocket launch',
    tMax: 4,
    s: t => t * t,
    v: t => 2 * t,
    a: () => 2,
  },
]

const COLORS = { s: '#6470f1', v: '#10b981', a: '#f89b29' }

export default function PositionVelocityAcceleration({ params }) {
  const svgRef = useRef(null)
  const intervalRef = useRef(null)
  const isDark = useIsDark()

  const C = {
    road: isDark ? '#0f172a' : '#1e293b',
    roadLine: isDark ? '#334155' : '#f8fafc',
    graphBg: isDark ? '#1e293b' : '#f8fafc',
    zeroLine: isDark ? '#475569' : '#475569',
    text: isDark ? '#94a3b8' : '#64748b',
    axis: isDark ? '#334155' : '#475569',
    labelMuted: isDark ? '#4b5563' : '#94a3b8'
  }

  // New: Handle params for custom functions
  const hasParams = params && params.s && params.v && params.a
  const customPreset = hasParams ? {
    label: params.label || 'Custom',
    tMax: params.tMax || 5,
    s: typeof params.s === 'string' ? new Function('t', `"use strict"; return ${params.s}`) : params.s,
    v: typeof params.v === 'string' ? new Function('t', `"use strict"; return ${params.v}`) : params.v,
    a: typeof params.a === 'string' ? new Function('t', `"use strict"; return ${params.a}`) : params.a
  } : null

  const [preset, setPreset] = useState(0)
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)

  const fn = customPreset || PRESETS[preset]
  const { tMax, s, v, a } = fn
  const N = 300
  const ts = d3.range(0, tMax + tMax / N, tMax / N)

  const sVals = ts.map(s), vVals = ts.map(v), aVals = ts.map(a)
  const sMin = d3.min(sVals), sMax = d3.max(sVals)
  const vMin = d3.min(vVals), vMax = d3.max(vVals)
  const aMin = d3.min(aVals), aMax = d3.max(aVals)

  const pad = (mn, mx) => {
    const p = (mx - mn) * 0.12 || 0.5
    return [mn - p, mx + p]
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const graphW = W - GM.left - GM.right

    // ── Road strip ─────────────────────────────────────────────────────────
    const roadG = svg.append('g')

    roadG.append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', W).attr('height', ROAD_H)
      .attr('fill', C.road)

    // Dashed center line
    roadG.append('line')
      .attr('x1', 0).attr('y1', ROAD_H / 2)
      .attr('x2', W).attr('y2', ROAD_H / 2)
      .attr('stroke', C.roadLine).attr('stroke-width', 2).attr('stroke-dasharray', '20,14')

    // Car position: map t to [60, W-60]
    const tNorm = Math.min(t / tMax, 1)
    const carX = 60 + (W - 120) * tNorm
    const carY = ROAD_H / 2

    // Speed color
    const curV = v(Math.min(t, tMax))
    const speedRatio = (curV - vMin) / (vMax - vMin + 0.001)
    const carColor = d3.interpolateRgb('#ef4444', '#22c55e')(Math.max(0, Math.min(1, speedRatio)))

    // Car body
    roadG.append('rect')
      .attr('x', carX - 20).attr('y', carY - 8)
      .attr('width', 40).attr('height', 16)
      .attr('rx', 4).attr('fill', carColor)

    // Cab
    roadG.append('rect')
      .attr('x', carX - 12).attr('y', carY - 16)
      .attr('width', 24).attr('height', 10)
      .attr('rx', 3).attr('fill', carColor).attr('fill-opacity', 0.8)

    // Wheels
    ;[-10, 10].forEach(dx => {
      roadG.append('circle')
        .attr('cx', carX + dx).attr('cy', carY + 8)
        .attr('r', 5).attr('fill', '#0f172a').attr('stroke', '#94a3b8').attr('stroke-width', 1)
    })

    // Speed text
    roadG.append('text')
      .attr('x', W - 12).attr('y', ROAD_H - 8)
      .attr('text-anchor', 'end').attr('font-size', 11).attr('fill', C.text)
      .attr('font-weight', 'bold')
      .text(`v = ${curV.toFixed(2)}`)

    // ── Helper to draw a mini-graph ────────────────────────────────────────
    const drawGraph = (yOffset, data, [dMin, dMax], color, label, curVal) => {
      const ySc = d3.scaleLinear().domain([dMin, dMax]).range([yOffset + GRAPH_H - GM.bottom, yOffset + GM.top])
      const xSc = d3.scaleLinear().domain([0, tMax]).range([GM.left, W - GM.right])

      const g = svg.append('g')

      // Background
      g.append('rect')
        .attr('x', GM.left).attr('y', yOffset + GM.top)
        .attr('width', graphW).attr('height', GRAPH_H - GM.top - GM.bottom)
        .attr('fill', C.graphBg).attr('fill-opacity', isDark ? 0.3 : 0.03)

      // Zero line
      if (dMin < 0 && dMax > 0) {
        g.append('line')
          .attr('x1', GM.left).attr('x2', W - GM.right)
          .attr('y1', ySc(0)).attr('y2', ySc(0))
          .attr('stroke', C.zeroLine).attr('stroke-width', 0.8).attr('stroke-dasharray', '4,4')
      }

      // Full curve (light)
      const line = d3.line().x((_d, i) => xSc(ts[i])).y(d => ySc(d)).curve(d3.curveCatmullRom)
      g.append('path')
        .datum(data)
        .attr('fill', 'none').attr('stroke', color).attr('stroke-width', 1.5).attr('opacity', 0.2)
        .attr('d', line)

      // "Filled-in-so-far" portion
      const tIdx = Math.round(tNorm * (N - 1))
      const partialData = data.slice(0, tIdx + 1)
      const partialTs = ts.slice(0, tIdx + 1)
      if (partialData.length > 1) {
        const partLine = d3.line().x((_d, i) => xSc(partialTs[i])).y(d => ySc(d)).curve(d3.curveCatmullRom)
        g.append('path')
          .datum(partialData)
          .attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2.5)
          .attr('d', partLine)
      }

      // Cursor line
      const curX = xSc(Math.min(t, tMax))
      g.append('line')
        .attr('x1', curX).attr('x2', curX)
        .attr('y1', yOffset + GM.top).attr('y2', yOffset + GRAPH_H - GM.bottom)
        .attr('stroke', color).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3').attr('opacity', 0.7)

      // Current value dot
      g.append('circle')
        .attr('cx', curX).attr('cy', ySc(curVal))
        .attr('r', 4).attr('fill', color).attr('stroke', isDark ? '#000' : '#fff').attr('stroke-width', 1.5)

      // Y-axis ticks
      ySc.ticks(3).forEach(tick => {
        g.append('text')
          .attr('x', GM.left - 5).attr('y', ySc(tick) + 4)
          .attr('text-anchor', 'end').attr('font-size', 9).attr('fill', C.text)
          .text(tick.toFixed(1))
        g.append('line')
          .attr('x1', GM.left - 3).attr('x2', GM.left)
          .attr('y1', ySc(tick)).attr('y2', ySc(tick))
          .attr('stroke', C.axis).attr('stroke-width', 1)
      })

      // Axes
      g.append('line')
        .attr('x1', GM.left).attr('x2', GM.left)
        .attr('y1', yOffset + GM.top).attr('y2', yOffset + GRAPH_H - GM.bottom)
        .attr('stroke', C.axis).attr('stroke-width', 1)
      g.append('line')
        .attr('x1', GM.left).attr('x2', W - GM.right)
        .attr('y1', yOffset + GRAPH_H - GM.bottom).attr('y2', yOffset + GRAPH_H - GM.bottom)
        .attr('stroke', C.axis).attr('stroke-width', 1)

      // Label
      g.append('text')
        .attr('x', GM.left + 6).attr('y', yOffset + GM.top + 13)
        .attr('font-size', 11).attr('fill', color).attr('font-weight', 'bold')
        .text(label)

      // Current value label
      g.append('text')
        .attr('x', W - GM.right - 4).attr('y', yOffset + GM.top + 13)
        .attr('text-anchor', 'end').attr('font-size', 11).attr('fill', color)
        .attr('font-weight', 'bold')
        .text(`${curVal.toFixed(3)}`)
    }

    const g1Y = ROAD_H + 10
    const g2Y = g1Y + GRAPH_H + GRAPH_GAP
    const g3Y = g2Y + GRAPH_H + GRAPH_GAP

    const tC = Math.min(t, tMax)
    drawGraph(g1Y, sVals, pad(sMin, sMax), COLORS.s, 's(t) = position', s(tC))
    drawGraph(g2Y, vVals, pad(vMin, vMax), COLORS.v, 'v(t) = ds/dt', v(tC))
    drawGraph(g3Y, aVals, pad(aMin, aMax), COLORS.a, 'a(t) = d²s/dt²', a(tC))

    // Time label on last graph
    svg.append('text')
      .attr('x', W / 2).attr('y', g3Y + GRAPH_H - 2)
      .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', C.text)
      .text(`t = ${tC.toFixed(2)} / ${tMax.toFixed(2)} s`)

  }, [t, preset, hasParams, tMax, s, v, a, sVals, vVals, aVals, sMin, sMax, vMin, vMax, aMin, aMax, isDark])

  // Timer
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setT(prev => {
          const next = prev + tMax / 200
          if (next >= tMax) { setPlaying(false); return tMax }
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
    setT(0)
  }, [])

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 transition-colors">
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + TOTAL_H} className="overflow-visible" />
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4 px-4">
        {!hasParams && PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => { setPreset(i); reset() }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${preset === i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setPlaying(p => !p)}
          className="px-6 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95 ml-2"
        >
          {playing ? '⏸ Pause' : t > 0 ? '▶ Resume' : '▶ Start Animation'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  )
}
