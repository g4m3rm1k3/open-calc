import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 340
const M = { top: 30, right: 30, bottom: 45, left: 55 }

const PRESETS = [
  { label: 'sin(x²)', g: x => x * x, f: u => Math.sin(u), gLabel: 'g(x) = x²', fLabel: 'f(u) = sin(u)', compLabel: 'h(x) = sin(x²)', gPrime: x => 2 * x, fPrime: u => Math.cos(u) },
  { label: '(x²+1)³', g: x => x * x + 1, f: u => Math.pow(u, 3), gLabel: 'g(x) = x²+1', fLabel: 'f(u) = u³', compLabel: 'h(x) = (x²+1)³', gPrime: x => 2 * x, fPrime: u => 3 * u * u },
  { label: 'e^(2x)', g: x => 2 * x, f: u => Math.exp(u), gLabel: 'g(x) = 2x', fLabel: 'f(u) = eᵘ', compLabel: 'h(x) = e^(2x)', gPrime: x => 2, fPrime: u => Math.exp(u) },
  { label: '√(x²+4)', g: x => x * x + 4, f: u => Math.sqrt(u), gLabel: 'g(x) = x²+4', fLabel: 'f(u) = √u', compLabel: 'h(x) = √(x²+4)', gPrime: x => 2 * x, fPrime: u => 1 / (2 * Math.sqrt(u)) },
]

export default function CompositionVisualization({ params }) {
  const svgRef = useRef(null)
  const [presetIdx, setPresetIdx] = useState(0)
  const [xPos, setXPos] = useState(1.0)

  const preset = PRESETS[presetIdx]

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { g, f, gPrime, fPrime, compLabel } = preset
    const h = (x) => f(g(x))

    const xSc = d3.scaleLinear().domain([-2.5, 2.5]).range([M.left, W - M.right])
    const xs = d3.range(-2.5, 2.51, 0.02)
    const yVals = xs.map(x => h(x)).filter(isFinite)
    const yMin = Math.min(...yVals), yMax = Math.max(...yVals)
    const yPad = (yMax - yMin) * 0.2 || 1
    const ySc = d3.scaleLinear().domain([yMin - yPad, yMax + yPad]).range([H - M.bottom, M.top])
    const lineFn = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y)).defined(([, y]) => isFinite(y))

    // Grid
    xSc.ticks(6).forEach(t => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(5).forEach(t => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes
    const x0px = Math.max(M.left, Math.min(W - M.right, xSc(0)))
    const y0px = Math.max(M.top, Math.min(H - M.bottom, ySc(0)))
    svg.append('g').attr('transform', `translate(0,${y0px})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${x0px},0)`).call(d3.axisLeft(ySc).ticks(5)).attr('color', '#94a3b8')

    // Composite function curve
    svg.append('path').datum(xs.map(x => [x, h(x)])).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', lineFn)

    // Tangent line at xPos
    const u = g(xPos)
    const hVal = h(xPos)
    const chainSlope = fPrime(u) * gPrime(xPos)
    const tanY = (x) => hVal + chainSlope * (x - xPos)
    svg.append('path').datum([[-2.5, tanY(-2.5)], [2.5, tanY(2.5)]]).attr('fill', 'none').attr('stroke', '#f59e0b').attr('stroke-width', 2).attr('d', lineFn)
    svg.append('circle').attr('cx', xSc(xPos)).attr('cy', ySc(hVal)).attr('r', 6).attr('fill', '#6470f1')

    // Chain rule annotation
    const annX = xSc(xPos) + 12, annY = ySc(hVal) - 30
    svg.append('text').attr('x', annX).attr('y', annY).attr('font-size', 10).attr('fill', '#f59e0b').text(`h′ = f′(g(x))·g′(x)`)
    svg.append('text').attr('x', annX).attr('y', annY + 14).attr('font-size', 10).attr('fill', '#f59e0b').text(`= ${fPrime(u).toFixed(3)} × ${gPrime(xPos).toFixed(3)} = ${chainSlope.toFixed(3)}`)

    // Title
    svg.append('text').attr('x', W / 2).attr('y', 18).attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#64748b').text(compLabel)
  }, [presetIdx, xPos, preset])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p, i) => (
            <button key={i} onClick={() => { setPresetIdx(i); setXPos(1.0) }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${i === presetIdx ? 'bg-brand-600 text-white border-brand-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-brand-400'}`}>
              {p.label}
            </button>
          ))}
        </div>
        <SliderControl label="x position" min={-2} max={2} step={0.05} value={xPos} onChange={setXPos} />
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        Chain rule: h′(x) = f′(g(x)) · g′(x). The yellow tangent slope is the product of the two individual derivative values.
      </p>
    </div>
  )
}
