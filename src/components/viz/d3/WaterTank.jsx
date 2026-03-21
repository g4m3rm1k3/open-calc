import * as d3 from 'd3'
import { useRef, useEffect, useState, useCallback } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 400
// Left panel: tank
const TANK_X = 20, TANK_Y = 60, TANK_W = 160, TANK_H = 220
// Right panel: flow rate graph
const RP_LEFT = 230, RP_RIGHT = 570
const FLOW_TOP = 20, FLOW_BOT = 230
const VOL_TOP = 250, VOL_BOT = 380
const M_FLOW = { left: 44, right: 8, top: FLOW_TOP, bottom: FLOW_BOT }
const M_VOL = { left: 44, right: 8, top: VOL_TOP, bottom: VOL_BOT }

const SCENARIOS = [
  {
    label: 'Constant flow',
    r: (t) => 5,
    V: (t) => 5 * t,
    domain: [0, 6],
    V_max: 30,
    rTex: 'r(t) = 5',
  },
  {
    label: 'Increasing flow',
    r: (t) => 2 * t,
    V: (t) => t * t,
    domain: [0, 5],
    V_max: 25,
    rTex: 'r(t) = 2t',
  },
  {
    label: 'Fill then drain',
    r: (t) => 6 * Math.sin(Math.PI * t / 6),
    V: (t) => {
      // ∫₀ᵗ 6sin(πs/6)ds = 6·[-6/π·cos(πs/6)]₀ᵗ = (36/π)(1 - cos(πt/6))
      return (36 / Math.PI) * (1 - Math.cos(Math.PI * t / 6))
    },
    domain: [0, 12],
    V_max: 72 / Math.PI,
    rTex: 'r(t) = 6sin(πt/6)',
  },
]

export default function WaterTank() {
  const svgRef = useRef(null)
  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const tRef = useRef(0)
  const speedRef = useRef(1)
  const playingRef = useRef(false)

  const scenario = SCENARIOS[scenarioIdx]

  // Keep refs in sync
  useEffect(() => { tRef.current = t }, [t])
  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { playingRef.current = playing }, [playing])

  // Reset on scenario change
  useEffect(() => {
    setT(0)
    setPlaying(false)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    lastTimeRef.current = null
  }, [scenarioIdx])

  const startPlay = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    lastTimeRef.current = null
    setPlaying(true)
    playingRef.current = true
    const tick = (now) => {
      if (!playingRef.current) return
      if (lastTimeRef.current === null) lastTimeRef.current = now
      const dt = (now - lastTimeRef.current) / 1000 * speedRef.current
      lastTimeRef.current = now
      const sc = SCENARIOS[scenarioIdx]
      setT((prev) => {
        const next = prev + dt
        if (next >= sc.domain[1]) {
          playingRef.current = false
          setPlaying(false)
          return sc.domain[1]
        }
        return next
      })
      if (playingRef.current) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [scenarioIdx])

  const stopPlay = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    playingRef.current = false
    setPlaying(false)
    lastTimeRef.current = null
  }, [])

  const resetT = useCallback(() => {
    stopPlay()
    setT(0)
  }, [stopPlay])

  const sc = scenario
  const [dMin, dMax] = sc.domain
  const curR = sc.r(t)
  const curV = sc.V(t)
  const V_max = sc.V_max
  const fillFrac = Math.max(0, Math.min(1, curV / V_max))
  const waterH = fillFrac * TANK_H

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // ── LEFT PANEL: Water Tank ──
    // Tank outline
    svg.append('rect')
      .attr('x', TANK_X).attr('y', TANK_Y)
      .attr('width', TANK_W).attr('height', TANK_H)
      .attr('fill', 'none').attr('stroke', '#64748b').attr('stroke-width', 2.5).attr('rx', 4)

    // Water fill (from bottom)
    const waterY = TANK_Y + TANK_H - waterH
    if (waterH > 0) {
      svg.append('rect')
        .attr('x', TANK_X + 2).attr('y', waterY)
        .attr('width', TANK_W - 4).attr('height', waterH)
        .attr('fill', '#60a5fa').attr('opacity', 0.65).attr('rx', 2)

      // Animated shimmer line near top of water
      svg.append('line')
        .attr('x1', TANK_X + 4).attr('y1', waterY + 3)
        .attr('x2', TANK_X + TANK_W - 4).attr('y2', waterY + 3)
        .attr('stroke', '#93c5fd').attr('stroke-width', 2).attr('opacity', 0.7)
    }

    // Volume label inside tank
    svg.append('text')
      .attr('x', TANK_X + TANK_W / 2).attr('y', TANK_Y + TANK_H / 2)
      .attr('text-anchor', 'middle').attr('font-size', 15).attr('font-weight', 'bold')
      .attr('fill', waterH > TANK_H * 0.35 ? '#1e40af' : '#64748b')
      .text(`V = ${curV.toFixed(1)} L`)

    // Tank label
    svg.append('text').attr('x', TANK_X + TANK_W / 2).attr('y', TANK_Y - 10).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#64748b').text('Water Tank')

    // Pipe (horizontal line on left side of tank, middle height)
    const pipeY = TANK_Y + TANK_H * 0.5
    svg.append('line').attr('x1', TANK_X - 40).attr('y1', pipeY).attr('x2', TANK_X).attr('y2', pipeY).attr('stroke', '#64748b').attr('stroke-width', 6).attr('stroke-linecap', 'round')

    // Flow direction arrow on pipe
    const arrowDir = curR >= 0 ? 1 : -1 // 1 = right (inflow), -1 = left (outflow)
    const arrowX = TANK_X - 20 + arrowDir * 6
    svg.append('polygon')
      .attr('points', arrowDir > 0
        ? `${arrowX - 8},${pipeY - 5} ${arrowX + 8},${pipeY} ${arrowX - 8},${pipeY + 5}`
        : `${arrowX + 8},${pipeY - 5} ${arrowX - 8},${pipeY} ${arrowX + 8},${pipeY + 5}`)
      .attr('fill', Math.abs(curR) < 0.01 ? '#94a3b8' : curR > 0 ? '#22c55e' : '#ef4444')

    // Flow label below pipe
    svg.append('text').attr('x', TANK_X - 20).attr('y', pipeY + 20).attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#94a3b8').text('flow')

    // Bottom labels
    const labelY = TANK_Y + TANK_H + 24
    svg.append('text').attr('x', TANK_X + TANK_W / 2).attr('y', labelY).attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#475569').text(`t = ${t.toFixed(1)} min`)
    svg.append('text').attr('x', TANK_X + TANK_W / 2).attr('y', labelY + 16).attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', curR >= 0 ? '#16a34a' : '#dc2626').text(`r(t) = ${curR.toFixed(2)} L/min`)

    // ── RIGHT PANEL ──
    const xSc = d3.scaleLinear().domain([dMin, dMax]).range([RP_LEFT + M_FLOW.left, RP_RIGHT - M_FLOW.right])

    // ─ Flow rate graph ─
    const rVals = d3.range(dMin, dMax, (dMax - dMin) / 200).map(sc.r)
    const rMin = Math.min(...rVals, 0)
    const rMax = Math.max(...rVals, 0)
    const rPad = (rMax - rMin) * 0.18 || 0.5
    const ySc_r = d3.scaleLinear().domain([rMin - rPad, rMax + rPad]).range([FLOW_BOT - 10, FLOW_TOP + 10])

    // Grid flow
    xSc.ticks(6).forEach((tx) => svg.append('line').attr('x1', xSc(tx)).attr('x2', xSc(tx)).attr('y1', FLOW_TOP + 10).attr('y2', FLOW_BOT - 10).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc_r.ticks(4).forEach((ty) => svg.append('line').attr('x1', RP_LEFT + M_FLOW.left).attr('x2', RP_RIGHT - M_FLOW.right).attr('y1', ySc_r(ty)).attr('y2', ySc_r(ty)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes flow
    svg.append('g').attr('transform', `translate(0,${ySc_r(0)})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${RP_LEFT + M_FLOW.left},0)`).call(d3.axisLeft(ySc_r).ticks(4)).attr('color', '#94a3b8')

    // Shaded area under r(t) from 0 to t
    if (t > dMin) {
      const areaSteps = 300
      const buildSegs = () => {
        const pos = [], neg = []
        let cp = null, cn = null
        for (let i = 0; i <= areaSteps; i++) {
          const xi = dMin + i * (t - dMin) / areaSteps
          const yi = sc.r(xi)
          if (yi >= 0) {
            if (!cp) { cp = []; if (cn) { neg.push(cn); cn = null } }
            cp.push({ x: xi, y: yi })
          } else {
            if (!cn) { cn = []; if (cp) { pos.push(cp); cp = null } }
            cn.push({ x: xi, y: yi })
          }
        }
        if (cp) pos.push(cp)
        if (cn) neg.push(cn)
        return { pos, neg }
      }
      const { pos, neg } = buildSegs()
      const areaGen = (color) => d3.area().x((d) => xSc(d.x)).y0(ySc_r(0)).y1((d) => ySc_r(d.y))
      pos.forEach((seg) => svg.append('path').datum(seg).attr('fill', '#22c55e').attr('opacity', 0.4).attr('d', d3.area().x((d) => xSc(d.x)).y0(ySc_r(0)).y1((d) => ySc_r(d.y))))
      neg.forEach((seg) => svg.append('path').datum(seg).attr('fill', '#ef4444').attr('opacity', 0.4).attr('d', d3.area().x((d) => xSc(d.x)).y0(ySc_r(0)).y1((d) => ySc_r(d.y))))
    }

    // r(t) curve
    const rCurve = d3.range(dMin, dMax + (dMax - dMin) / 300, (dMax - dMin) / 300).map((xi) => ({ x: xi, y: sc.r(xi) }))
    svg.append('path').datum(rCurve).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', d3.line().x((d) => xSc(d.x)).y((d) => ySc_r(d.y)))

    // Vertical amber line at t
    svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', FLOW_TOP + 10).attr('y2', FLOW_BOT - 10).attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('stroke-dasharray', '5,3')

    // Flow rate label
    svg.append('text').attr('x', RP_RIGHT - M_FLOW.right - 4).attr('y', FLOW_TOP + 20).attr('text-anchor', 'end').attr('font-size', 11).attr('fill', '#6470f1').attr('font-weight', 'bold').text(`r(t) = ${sc.rTex}`)
    svg.append('text').attr('x', RP_LEFT + M_FLOW.left + 2).attr('y', FLOW_TOP + 20).attr('font-size', 10).attr('fill', '#94a3b8').text('flow rate (L/min)')

    // ─ Volume graph ─
    const VVals = d3.range(dMin, dMax, (dMax - dMin) / 200).map(sc.V)
    const VMin = Math.min(...VVals, 0)
    const VMax = Math.max(...VVals, 0)
    const VPad = (VMax - VMin) * 0.15 || 0.5
    const ySc_V = d3.scaleLinear().domain([VMin - VPad, VMax + VPad]).range([VOL_BOT, VOL_TOP])

    // Divider between flow and vol panels
    svg.append('line').attr('x1', RP_LEFT + M_FLOW.left).attr('x2', RP_RIGHT - M_FLOW.right).attr('y1', VOL_TOP - 8).attr('y2', VOL_TOP - 8).attr('stroke', '#cbd5e1').attr('stroke-width', 1)

    // Grid vol
    xSc.ticks(6).forEach((tx) => svg.append('line').attr('x1', xSc(tx)).attr('x2', xSc(tx)).attr('y1', VOL_TOP).attr('y2', VOL_BOT).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc_V.ticks(3).forEach((ty) => svg.append('line').attr('x1', RP_LEFT + M_FLOW.left).attr('x2', RP_RIGHT - M_FLOW.right).attr('y1', ySc_V(ty)).attr('y2', ySc_V(ty)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes vol
    svg.append('g').attr('transform', `translate(0,${ySc_V(0)})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${RP_LEFT + M_FLOW.left},0)`).call(d3.axisLeft(ySc_V).ticks(3)).attr('color', '#94a3b8')

    // V(t) curve traced up to current t
    const N_V = 300
    const VcurvePts = []
    for (let i = 0; i <= N_V; i++) {
      const xi = dMin + i * (dMax - dMin) / N_V
      if (xi <= t + (dMax - dMin) / N_V) VcurvePts.push({ x: xi, y: sc.V(xi) })
    }
    if (VcurvePts.length > 1) {
      svg.append('path').datum(VcurvePts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2).attr('d', d3.line().x((d) => xSc(d.x)).y((d) => ySc_V(d.y)))
    }

    // Faint full V curve
    const VfullPts = d3.range(dMin, dMax + (dMax - dMin) / 300, (dMax - dMin) / 300).map((xi) => ({ x: xi, y: sc.V(xi) }))
    svg.append('path').datum(VfullPts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 1).attr('opacity', 0.15).attr('d', d3.line().x((d) => xSc(d.x)).y((d) => ySc_V(d.y)))

    // Dot on V curve
    svg.append('circle').attr('cx', xSc(t)).attr('cy', ySc_V(curV)).attr('r', 5).attr('fill', '#f59e0b').attr('stroke', 'white').attr('stroke-width', 1.5)

    // Vol label
    svg.append('text').attr('x', RP_LEFT + M_FLOW.left + 2).attr('y', VOL_TOP + 14).attr('font-size', 10).attr('fill', '#94a3b8').text('V(t) = ∫r(s)ds')

    // Info box at bottom left
    const infoX = TANK_X, infoY = TANK_Y + TANK_H + 55
    const lines = [
      `t = ${t.toFixed(1)} min`,
      `r(t) = ${curR.toFixed(2)} L/min`,
      `V = ${curV.toFixed(1)} L`,
    ]
    lines.forEach((line, i) => {
      svg.append('text').attr('x', infoX + TANK_W / 2).attr('y', infoY + i * 15).attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', i === 1 ? (curR >= 0 ? '#16a34a' : '#dc2626') : '#475569').text(line)
    })

  }, [scenarioIdx, t])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-1 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={playing ? stopPlay : startPlay}
            className={`px-4 py-1 text-sm rounded-full border transition-colors ${
              playing
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-brand-500 text-white border-brand-500'
            }`}
          >
            {playing ? 'Pause' : '▶ Play'}
          </button>
          <button
            onClick={resetT}
            className="px-3 py-1 text-sm rounded-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300"
          >
            Reset
          </button>
          <SliderControl
            label="Speed"
            min={0.5}
            max={2}
            step={0.5}
            value={speed}
            onChange={(v) => { speedRef.current = v; setSpeed(v) }}
            format={(v) => `${v}×`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((sc, i) => (
            <button
              key={i}
              onClick={() => setScenarioIdx(i)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                i === scenarioIdx
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-center text-slate-500 mt-2 italic px-4">
        Total volume = area under the flow rate curve. This is the integral: V(t) = ∫₀ᵗ r(s) ds. The flow rate function is the derivative of the volume function.
      </p>
    </div>
  )
}
