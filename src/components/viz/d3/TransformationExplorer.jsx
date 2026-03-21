import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 360
const M = { top: 30, right: 20, bottom: 40, left: 52 }
const IW = W - M.left - M.right
const IH = H - M.top - M.bottom

const BASE_FUNCTIONS = [
  { id: 'sin', label: 'Sin', fn: x => Math.sin(x) },
  { id: 'x2',  label: 'x²', fn: x => x * x },
  { id: 'ex',  label: 'eˣ', fn: x => Math.exp(x) },
  { id: 'x3',  label: 'x³', fn: x => x * x * x },
]

const SAMPLES = 400
const X_DOMAIN = [-4, 4]
const Y_DOMAIN = [-4, 4]

export default function TransformationExplorer({ params, onParamChange }) {
  const svgRef = useRef(null)
  const [fnId, setFnId]   = useState('sin')
  const [a, setA]         = useState(1)
  const [b, setB]         = useState(1)
  const [c, setC]         = useState(0)
  const [d, setD]         = useState(0)

  const baseFn = BASE_FUNCTIONS.find(f => f.id === fnId).fn

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xScale = d3.scaleLinear().domain(X_DOMAIN).range([0, IW])
    const yScale = d3.scaleLinear().domain(Y_DOMAIN).range([IH, 0])

    const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`)

    // clip path
    g.append('defs').append('clipPath').attr('id', 'te-clip')
      .append('rect').attr('width', IW).attr('height', IH)

    // gridlines
    const gridColor = '#cbd5e1'
    const xTicks = xScale.ticks(8)
    const yTicks = yScale.ticks(8)

    g.append('g').attr('class', 'grid').selectAll('line.vgrid')
      .data(xTicks).enter().append('line')
      .attr('x1', v => xScale(v)).attr('x2', v => xScale(v))
      .attr('y1', 0).attr('y2', IH)
      .attr('stroke', gridColor).attr('stroke-width', 0.5)

    g.append('g').attr('class', 'grid').selectAll('line.hgrid')
      .data(yTicks).enter().append('line')
      .attr('x1', 0).attr('x2', IW)
      .attr('y1', v => yScale(v)).attr('y2', v => yScale(v))
      .attr('stroke', gridColor).attr('stroke-width', 0.5)

    // axes
    const xAxisG = g.append('g')
      .attr('transform', `translate(0,${yScale(0)})`)
      .call(d3.axisBottom(xScale).ticks(8).tickSize(4))
    xAxisG.select('.domain').attr('stroke', '#64748b')
    xAxisG.selectAll('text').attr('fill', '#64748b').style('font-size', '11px')
    xAxisG.selectAll('line').attr('stroke', '#64748b')

    const yAxisG = g.append('g')
      .attr('transform', `translate(${xScale(0)},0)`)
      .call(d3.axisLeft(yScale).ticks(8).tickSize(4))
    yAxisG.select('.domain').attr('stroke', '#64748b')
    yAxisG.selectAll('text').attr('fill', '#64748b').style('font-size', '11px')
    yAxisG.selectAll('line').attr('stroke', '#64748b')

    // line generator (with clamp to y domain)
    const xs = d3.range(SAMPLES).map(i => X_DOMAIN[0] + (i / (SAMPLES - 1)) * (X_DOMAIN[1] - X_DOMAIN[0]))

    const makeLineGen = (yFn) => d3.line()
      .defined(x => {
        const y = yFn(x)
        return isFinite(y) && y >= Y_DOMAIN[0] - 1 && y <= Y_DOMAIN[1] + 1
      })
      .x(x => xScale(x))
      .y(x => yScale(Math.max(Y_DOMAIN[0], Math.min(Y_DOMAIN[1], yFn(x)))))

    const clipG = g.append('g').attr('clip-path', 'url(#te-clip)')

    // original f(x) — dashed light slate
    const origLine = makeLineGen(x => baseFn(x))
    clipG.append('path')
      .datum(xs)
      .attr('fill', 'none')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1.8)
      .attr('stroke-dasharray', '6,4')
      .attr('d', origLine)

    // transformed y = a·f(b(x-c)) + d — brand blue solid
    const transLine = makeLineGen(x => a * baseFn(b * (x - c)) + d)
    clipG.append('path')
      .datum(xs)
      .attr('fill', 'none')
      .attr('stroke', '#6470f1')
      .attr('stroke-width', 2.5)
      .attr('d', transLine)

  }, [fnId, a, b, c, d])

  const fmt = v => v.toFixed(1)
  const aStr = fmt(a), bStr = fmt(b), cStr = fmt(c), dStr = fmt(d)
  const fnLabel = BASE_FUNCTIONS.find(f => f.id === fnId).label

  return (
    <div className="flex flex-col items-center gap-3 font-sans">
      <p className="text-sm font-mono text-slate-700 dark:text-slate-300 self-start ml-1">
        y = {aStr}·{fnLabel}({bStr}(x − ({cStr}))) + {dStr}
      </p>
      <svg ref={svgRef} width={W} height={H} className="overflow-visible" />

      <div className="w-full max-w-[580px] flex flex-col gap-2 px-1">
        <SliderControl label="a — amplitude/stretch" min={-3} max={3} step={0.1} value={a} onChange={setA} />
        <SliderControl label="b — horizontal scale"  min={-3} max={3} step={0.1} value={b} onChange={setB} />
        <SliderControl label="c — horizontal shift"  min={-3} max={3} step={0.1} value={c} onChange={setC} />
        <SliderControl label="d — vertical shift"    min={-3} max={3} step={0.1} value={d} onChange={setD} />
      </div>

      <div className="flex gap-2 flex-wrap justify-center mt-1">
        {BASE_FUNCTIONS.map(f => (
          <button
            key={f.id}
            onClick={() => setFnId(f.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              fnId === f.id
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-brand-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-lg">
        Sliders control the four fundamental transformations. Original f(x) is dashed.
      </p>
    </div>
  )
}
