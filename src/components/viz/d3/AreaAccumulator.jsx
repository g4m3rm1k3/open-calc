import * as d3 from 'd3'
import { useRef, useEffect, useState, useCallback } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 360
const M = { top: 24, right: 24, bottom: 40, left: 52 }
const GRAPH_H = 280

const PRESETS = [
  {
    label: 'f(x) = 3x²',
    fn: (x) => 3 * x * x,
    domain: [0, 3],
    fnTex: '3x²',
  },
  {
    label: 'f(x) = cos(x)',
    fn: (x) => Math.cos(x),
    domain: [0, 2 * Math.PI],
    fnTex: 'cos(x)',
  },
  {
    label: 'f(x) = 2x + 1',
    fn: (x) => 2 * x + 1,
    domain: [0, 4],
    fnTex: '2x + 1',
  },
  {
    label: 'f(x) = e^(0.5x)',
    fn: (x) => Math.exp(0.5 * x),
    domain: [0, 3],
    fnTex: 'e^(0.5x)',
  },
]

function numericalIntegral(fn, a, b, steps = 400) {
  if (b <= a) return 0
  const dx = (b - a) / steps
  let sum = 0
  for (let i = 0; i < steps; i++) {
    const x0 = a + i * dx
    const x1 = x0 + dx
    sum += (fn(x0) + fn(x1)) * 0.5 * dx
  }
  return sum
}

export default function AreaAccumulator() {
  const svgRef = useRef(null)
  const [presetIdx, setPresetIdx] = useState(0)
  const preset = PRESETS[presetIdx]
  const [domain, setDomain] = useState(preset.domain)
  const [b, setB] = useState(preset.domain[0] + (preset.domain[1] - preset.domain[0]) * 0.5)

  // When preset changes, update domain and b
  useEffect(() => {
    const d = PRESETS[presetIdx].domain
    setDomain(d)
    setB(d[0] + (d[1] - d[0]) * 0.5)
  }, [presetIdx])

  const fn = preset.fn
  const [a] = [domain[0]]
  const integral = numericalIntegral(fn, a, b)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const [dMin, dMax] = domain
    const xSc = d3.scaleLinear().domain([dMin - 0.05 * (dMax - dMin), dMax + 0.05 * (dMax - dMin)]).range([M.left, W - M.right])

    // Compute y domain
    const yVals = d3.range(dMin, dMax, (dMax - dMin) / 200).map(fn)
    const yMin = Math.min(...yVals, 0)
    const yMax = Math.max(...yVals, 0)
    const yPad = (yMax - yMin) * 0.15 || 0.5
    const ySc = d3.scaleLinear().domain([yMin - yPad, yMax + yPad]).range([GRAPH_H - M.bottom, M.top])

    // Gridlines
    xSc.ticks(7).forEach((t) => {
      svg.append('line')
        .attr('x1', xSc(t)).attr('x2', xSc(t))
        .attr('y1', M.top).attr('y2', GRAPH_H - M.bottom)
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })
    ySc.ticks(6).forEach((t) => {
      svg.append('line')
        .attr('x1', M.left).attr('x2', W - M.right)
        .attr('y1', ySc(t)).attr('y2', ySc(t))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })

    // Axes
    svg.append('g').attr('transform', `translate(0,${ySc(0)})`).call(d3.axisBottom(xSc).ticks(7)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${M.left},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    // Shaded area — split into positive (green) and negative (red) segments
    const N_AREA = 600
    const dx = (b - a) / N_AREA
    if (b > a) {
      let posPoints = [[a, 0]]
      let negPoints = [[a, 0]]
      let inPos = null

      const flushPos = () => {
        if (posPoints.length > 2) {
          svg.append('path')
            .datum(posPoints)
            .attr('fill', '#22c55e').attr('opacity', 0.35)
            .attr('d', d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y)))
        }
        posPoints = []
      }
      const flushNeg = () => {
        if (negPoints.length > 2) {
          svg.append('path')
            .datum(negPoints)
            .attr('fill', '#ef4444').attr('opacity', 0.35)
            .attr('d', d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y)))
        }
        negPoints = []
      }

      // Build area using d3.area
      const posData = []
      const negData = []
      for (let i = 0; i <= N_AREA; i++) {
        const x = a + i * dx
        const y = fn(x)
        if (y >= 0) posData.push({ x, y })
        else negData.push({ x, y })
      }

      // Use d3.area for positive region
      const areaGen = d3.area()
        .x((d) => xSc(d.x))
        .y0(ySc(0))
        .y1((d) => ySc(d.y))

      // Build contiguous segments
      const buildSegments = (pts) => {
        const segs = []
        let cur = []
        for (const p of pts) {
          if (cur.length === 0 || Math.abs(p.x - cur[cur.length - 1].x) < (b - a) / N_AREA * 3) {
            cur.push(p)
          } else {
            if (cur.length > 1) segs.push([...cur])
            cur = [p]
          }
        }
        if (cur.length > 1) segs.push(cur)
        return segs
      }

      buildSegments(posData).forEach((seg) => {
        svg.append('path').datum(seg).attr('fill', '#22c55e').attr('opacity', 0.4).attr('d', areaGen)
      })
      buildSegments(negData).forEach((seg) => {
        svg.append('path').datum(seg).attr('fill', '#ef4444').attr('opacity', 0.4).attr('d', areaGen)
      })
    }

    // Curve
    const curvePts = d3.range(dMin, dMax + (dMax - dMin) / 300, (dMax - dMin) / 300).map((x) => ({ x, y: fn(x) }))
    const lineGen = d3.line().x((d) => xSc(d.x)).y((d) => ySc(d.y))
    svg.append('path').datum(curvePts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', lineGen)

    // Amber vertical line at b
    svg.append('line')
      .attr('x1', xSc(b)).attr('x2', xSc(b))
      .attr('y1', M.top).attr('y2', GRAPH_H - M.bottom)
      .attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('stroke-dasharray', '5,3')

    // Dot on x-axis at b
    svg.append('circle').attr('cx', xSc(b)).attr('cy', ySc(0)).attr('r', 6).attr('fill', '#f59e0b').attr('stroke', 'white').attr('stroke-width', 1.5)

    // b label
    svg.append('text')
      .attr('x', xSc(b)).attr('y', ySc(0) + 18)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#f59e0b').attr('font-weight', 'bold')
      .text('b')

    // Area label inside shaded region
    const midX = a + (b - a) * 0.5
    const midY = fn(midX)
    const labelX = xSc(Math.max(dMin + 0.05 * (dMax - dMin), Math.min(dMax - 0.05 * (dMax - dMin), midX)))
    const labelY = ySc(midY * 0.45 + 0)
    if (b > a + 0.05 * (dMax - dMin)) {
      svg.append('text')
        .attr('x', labelX).attr('y', Math.max(M.top + 16, Math.min(GRAPH_H - M.bottom - 8, labelY)))
        .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', integral >= 0 ? '#166534' : '#991b1b')
        .attr('font-weight', 'bold')
        .text(`Area = ${integral.toFixed(3)}`)
    }

    // Function label
    svg.append('text')
      .attr('x', W - M.right - 4).attr('y', M.top + 2)
      .attr('text-anchor', 'end').attr('font-size', 12).attr('fill', '#6470f1').attr('font-weight', 'bold')
      .text(`f(x) = ${preset.fnTex}`)

    // Integral counter overlay (top-left box)
    const boxX = M.left + 6, boxY = M.top + 6
    svg.append('rect').attr('x', boxX - 4).attr('y', boxY - 14).attr('width', 230).attr('height', 22).attr('rx', 4).attr('fill', 'rgba(255,255,255,0.88)')
    svg.append('text')
      .attr('x', boxX).attr('y', boxY + 4)
      .attr('font-size', 13).attr('fill', '#1e293b').attr('font-family', 'monospace')
      .text(`∫₀ᵇ f(x) dx ≈ ${integral.toFixed(4)}`)

    // Info box at bottom-right of graph area
    const ibX = W - M.right - 4
    const ibY = GRAPH_H - M.bottom - 10
    const infoLines = [
      'Moving b right adds f(b)·Δb to the total.',
      'The rate of change of area IS f(b).',
    ]
    const ibW = 248, ibH = 34
    svg.append('rect')
      .attr('x', ibX - ibW).attr('y', ibY - ibH + 2)
      .attr('width', ibW).attr('height', ibH).attr('rx', 4)
      .attr('fill', 'rgba(255,255,255,0.88)').attr('stroke', '#e2e8f0')
    infoLines.forEach((line, i) => {
      svg.append('text')
        .attr('x', ibX - ibW + 6).attr('y', ibY - ibH + 14 + i * 13)
        .attr('font-size', 10).attr('fill', '#475569')
        .text(line)
    })

  }, [presetIdx, b, domain])

  const preset_ = PRESETS[presetIdx]

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-1 space-y-3">
        <SliderControl
          label={`b (right endpoint)`}
          min={domain[0]}
          max={domain[1]}
          step={(domain[1] - domain[0]) / 300}
          value={b}
          onChange={setB}
          format={(v) => `b = ${v.toFixed(3)}`}
        />
        <div className="flex flex-wrap gap-2 justify-center">
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
      </div>
      <p className="text-xs text-center text-slate-500 mt-2 italic px-4">
        The shaded area grows as b moves right. At each instant, the rate of area growth equals f(b) — this is Part 1 of the Fundamental Theorem.
      </p>
    </div>
  )
}
