import * as d3 from 'd3'
import { useRef, useEffect, useState, useCallback } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 420
const M = { top: 16, right: 130, bottom: 14, left: 52 }
// Top panel: rows 0–200, bottom panel: rows 220–400
const TOP_TOP = 16, TOP_BOT = 196
const BOT_TOP = 216, BOT_BOT = 400
const DIVIDER_Y = 208

const PRESETS = [
  {
    label: 'sin(x)',
    fn: (x) => Math.sin(x),
    antideriv: (x) => 1 - Math.cos(x),
    domain: [0, 2 * Math.PI],
    fnTex: 'sin(x)',
    ATex: '1 − cos(x)',
  },
  {
    label: 'f(x) = x',
    fn: (x) => x,
    antideriv: (x) => x * x / 2,
    domain: [0, 3],
    fnTex: 'x',
    ATex: 'x²/2',
  },
  {
    label: '3x² − 6x + 2',
    fn: (x) => 3 * x * x - 6 * x + 2,
    antideriv: (x) => x * x * x - 3 * x * x + 2 * x,
    domain: [0, 3],
    fnTex: '3x² − 6x + 2',
    ATex: 'x³ − 3x² + 2x',
  },
]

function numericalIntegral(fn, a, b, steps = 500) {
  if (Math.abs(b - a) < 1e-9) return 0
  const dx = (b - a) / steps
  let sum = 0
  for (let i = 0; i < steps; i++) {
    const x0 = a + i * dx
    const x1 = x0 + dx
    sum += (fn(x0) + fn(x1)) * 0.5 * dx
  }
  return sum
}

export default function FTCLink() {
  const svgRef = useRef(null)
  const rafRef = useRef(null)
  const [presetIdx, setPresetIdx] = useState(0)
  const preset = PRESETS[presetIdx]
  const [xVal, setXVal] = useState(() => preset.domain[0] + (preset.domain[1] - preset.domain[0]) * 0.4)
  const [animating, setAnimating] = useState(false)
  const animStateRef = useRef(null)

  // Reset x when preset changes
  useEffect(() => {
    const d = PRESETS[presetIdx].domain
    setXVal(d[0] + (d[1] - d[0]) * 0.4)
    setAnimating(false)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [presetIdx])

  const startAnimation = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const d = PRESETS[presetIdx].domain
    const duration = 4000
    const start = performance.now()
    setAnimating(true)
    const tick = (now) => {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      const newX = d[0] + (d[1] - d[0]) * t
      setXVal(newX)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setAnimating(false)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [presetIdx])

  const stopAnimation = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setAnimating(false)
  }, [])

  const fn = preset.fn
  const antideriv = preset.antideriv
  const [dMin, dMax] = preset.domain
  const Ax = antideriv(xVal) // closed-form A(x) = ∫₀ˣ f(t)dt
  const fAtX = fn(xVal)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const graphRight = W - M.right

    // ── X scales (shared) ──
    const xSc = d3.scaleLinear().domain([dMin - 0.04 * (dMax - dMin), dMax + 0.04 * (dMax - dMin)]).range([M.left, graphRight])

    // ── TOP PANEL: f(x) ──
    const fVals = d3.range(dMin, dMax, (dMax - dMin) / 200).map(fn)
    const fMin = Math.min(...fVals, 0)
    const fMax = Math.max(...fVals, 0)
    const fPad = (fMax - fMin) * 0.18 || 0.5
    const ySc_f = d3.scaleLinear().domain([fMin - fPad, fMax + fPad]).range([TOP_BOT, TOP_TOP])

    // Grid top
    xSc.ticks(6).forEach((t) => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', TOP_TOP).attr('y2', TOP_BOT).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc_f.ticks(5).forEach((t) => svg.append('line').attr('x1', M.left).attr('x2', graphRight).attr('y1', ySc_f(t)).attr('y2', ySc_f(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes top
    svg.append('g').attr('transform', `translate(0,${ySc_f(0)})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${M.left},0)`).call(d3.axisLeft(ySc_f).ticks(5)).attr('color', '#94a3b8')

    // Shaded area top — positive (green) / negative (red)
    const areaSteps = 500
    const dx_area = (xVal - dMin) / areaSteps
    if (xVal > dMin) {
      const posArea = d3.area().x((d) => xSc(d.x)).y0(ySc_f(0)).y1((d) => ySc_f(d.y))
      const negArea = d3.area().x((d) => xSc(d.x)).y0(ySc_f(0)).y1((d) => ySc_f(d.y))
      const posSegs = [], negSegs = []
      let curPos = null, curNeg = null

      for (let i = 0; i <= areaSteps; i++) {
        const x = dMin + i * (xVal - dMin) / areaSteps
        const y = fn(x)
        if (y >= 0) {
          if (!curPos) { curPos = []; if (curNeg) { negSegs.push(curNeg); curNeg = null } }
          curPos.push({ x, y })
        } else {
          if (!curNeg) { curNeg = []; if (curPos) { posSegs.push(curPos); curPos = null } }
          curNeg.push({ x, y })
        }
      }
      if (curPos) posSegs.push(curPos)
      if (curNeg) negSegs.push(curNeg)

      posSegs.forEach((seg) => svg.append('path').datum(seg).attr('fill', '#22c55e').attr('opacity', 0.38).attr('d', posArea))
      negSegs.forEach((seg) => svg.append('path').datum(seg).attr('fill', '#ef4444').attr('opacity', 0.38).attr('d', negArea))
    }

    // f(x) curve
    const fCurve = d3.range(dMin, dMax + (dMax - dMin) / 300, (dMax - dMin) / 300).map((x) => ({ x, y: fn(x) }))
    svg.append('path').datum(fCurve)
      .attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5)
      .attr('d', d3.line().x((d) => xSc(d.x)).y((d) => ySc_f(d.y)))

    // Moving x line (top)
    svg.append('line').attr('x1', xSc(xVal)).attr('x2', xSc(xVal)).attr('y1', TOP_TOP).attr('y2', TOP_BOT).attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('stroke-dasharray', '5,3')
    svg.append('circle').attr('cx', xSc(xVal)).attr('cy', ySc_f(0)).attr('r', 5).attr('fill', '#f59e0b').attr('stroke', 'white').attr('stroke-width', 1.5)

    // f(x) label top panel
    svg.append('text').attr('x', graphRight - 4).attr('y', TOP_TOP + 12).attr('text-anchor', 'end').attr('font-size', 11).attr('fill', '#6470f1').attr('font-weight', 'bold').text(`f(x) = ${preset.fnTex}`)

    // ── DIVIDER ──
    svg.append('line').attr('x1', M.left).attr('x2', graphRight).attr('y1', DIVIDER_Y).attr('y2', DIVIDER_Y).attr('stroke', '#cbd5e1').attr('stroke-width', 1)

    // ── BOTTOM PANEL: A(x) ──
    // Compute A curve over full domain
    const N_A = 300
    const AcurvePts = []
    for (let i = 0; i <= N_A; i++) {
      const xi = dMin + i * (dMax - dMin) / N_A
      AcurvePts.push({ x: xi, y: antideriv(xi) })
    }
    const aVals = AcurvePts.map((d) => d.y)
    const aMin = Math.min(...aVals, 0)
    const aMax = Math.max(...aVals, 0)
    const aPad = (aMax - aMin) * 0.18 || 0.5
    const ySc_A = d3.scaleLinear().domain([aMin - aPad, aMax + aPad]).range([BOT_BOT, BOT_TOP])

    // Grid bottom
    xSc.ticks(6).forEach((t) => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', BOT_TOP).attr('y2', BOT_BOT).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc_A.ticks(4).forEach((t) => svg.append('line').attr('x1', M.left).attr('x2', graphRight).attr('y1', ySc_A(t)).attr('y2', ySc_A(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes bottom
    svg.append('g').attr('transform', `translate(0,${ySc_A(0)})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${M.left},0)`).call(d3.axisLeft(ySc_A).ticks(4)).attr('color', '#94a3b8')

    // A(x) curve up to xVal only
    const AupTo = AcurvePts.filter((d) => d.x <= xVal + (dMax - dMin) / N_A)
    if (AupTo.length > 1) {
      svg.append('path').datum(AupTo)
        .attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5)
        .attr('d', d3.line().x((d) => xSc(d.x)).y((d) => ySc_A(d.y)))
    }

    // A(x) faint preview (full)
    svg.append('path').datum(AcurvePts)
      .attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 1).attr('opacity', 0.18)
      .attr('d', d3.line().x((d) => xSc(d.x)).y((d) => ySc_A(d.y)))

    // Moving amber dot at (xVal, A(xVal))
    svg.append('circle').attr('cx', xSc(xVal)).attr('cy', ySc_A(Ax)).attr('r', 6).attr('fill', '#f59e0b').attr('stroke', 'white').attr('stroke-width', 1.5)

    // Tangent line at (xVal, A(xVal)) with slope = f(xVal)
    const tangentLen = (dMax - dMin) * 0.12
    const slope = fAtX
    const tScale = (ySc_A(0) - ySc_A(1)) / (xSc(1) - xSc(0)) // pixel slope factor
    const tx1 = xVal - tangentLen, tx2 = xVal + tangentLen
    svg.append('line')
      .attr('x1', xSc(tx1)).attr('y1', ySc_A(Ax + slope * (tx1 - xVal)))
      .attr('x2', xSc(tx2)).attr('y2', ySc_A(Ax + slope * (tx2 - xVal)))
      .attr('stroke', '#f59e0b').attr('stroke-width', 2)
      .attr('clip-path', `inset(${BOT_TOP}px 0px ${H - BOT_BOT}px 0px)`)

    // A(x) label
    svg.append('text').attr('x', graphRight - 4).attr('y', BOT_TOP + 12).attr('text-anchor', 'end').attr('font-size', 11).attr('fill', '#6470f1').attr('font-weight', 'bold').text(`A(x) = ${preset.ATex}`)

    // ── RIGHT PANEL: readouts ──
    const rx = graphRight + 10, rw = M.right - 14
    const readouts = [
      { label: `f(x)`, val: fAtX.toFixed(3), color: '#6470f1' },
      { label: `A(x)`, val: Ax.toFixed(3), color: '#6470f1' },
    ]
    svg.append('text').attr('x', rx).attr('y', TOP_TOP + 18).attr('font-size', 11).attr('font-weight', 'bold').attr('fill', '#475569').text('Readout')
    readouts.forEach(({ label, val, color }, i) => {
      svg.append('text').attr('x', rx).attr('y', TOP_TOP + 36 + i * 22).attr('font-size', 11).attr('fill', '#64748b').text(label + ' =')
      svg.append('text').attr('x', rx).attr('y', TOP_TOP + 50 + i * 22).attr('font-size', 12).attr('font-weight', 'bold').attr('fill', color).text(val)
    })

    // A'(x) = f(x) highlight
    const thY = TOP_TOP + 100
    svg.append('rect').attr('x', rx - 2).attr('y', thY - 14).attr('width', rw).attr('height', 38).attr('rx', 4).attr('fill', '#dcfce7')
    svg.append('text').attr('x', rx + 2).attr('y', thY).attr('font-size', 10).attr('fill', '#166534').text("A'(x) = f(x)")
    svg.append('text').attr('x', rx + 2).attr('y', thY + 14).attr('font-size', 12).attr('font-weight', 'bold').attr('fill', '#166534').text(`= ${fAtX.toFixed(3)}`)

    // x value label bottom right panel
    svg.append('text').attr('x', rx).attr('y', thY + 48).attr('font-size', 11).attr('fill', '#94a3b8').text(`x = ${xVal.toFixed(3)}`)

    // Tangent slope note
    svg.append('text').attr('x', rx).attr('y', BOT_TOP + 20).attr('font-size', 10).attr('fill', '#f59e0b').text('slope of')
    svg.append('text').attr('x', rx).attr('y', BOT_TOP + 33).attr('font-size', 10).attr('fill', '#f59e0b').text('A(x) = f(x)')

  }, [presetIdx, xVal])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
      <div className="px-4 mt-1 space-y-3">
        <SliderControl
          label="x"
          min={preset.domain[0]}
          max={preset.domain[1]}
          step={(preset.domain[1] - preset.domain[0]) / 400}
          value={xVal}
          onChange={(v) => { stopAnimation(); setXVal(v) }}
          format={(v) => `x = ${v.toFixed(3)}`}
        />
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-2">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => setPresetIdx(i)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  i === presetIdx
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={animating ? stopAnimation : startAnimation}
            className={`ml-auto px-4 py-1 text-sm rounded-full border transition-colors ${
              animating
                ? 'bg-amber-500 text-white border-amber-500'
                : 'border-brand-400 text-brand-600 dark:text-brand-400'
            }`}
          >
            {animating ? 'Pause' : '▶ Animate'}
          </button>
        </div>
      </div>
      <p className="text-xs text-center text-slate-500 mt-2 italic px-4">
        As x moves right, the area A(x) accumulates. The slope of A(x) at any x equals f(x) — this is the Fundamental Theorem of Calculus, Part 1: d/dx[∫₀ˣ f(t)dt] = f(x).
      </p>
    </div>
  )
}
