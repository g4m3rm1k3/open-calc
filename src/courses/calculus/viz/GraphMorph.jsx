import * as d3 from 'd3'
import { useRef, useEffect, useState, useCallback } from 'react'

const W = 580, H = 300
const M = { top: 20, right: 20, bottom: 36, left: 48 }
const IW = W - M.left - M.right
const IH = H - M.top - M.bottom
const SAMPLES = 200
const X_DOMAIN = [-3, 3]

const FUNCTIONS = [
  {
    id: 'linear',
    label: 'Linear — f(x) = x',
    fn: x => x,
    yDomain: [-3, 3],
    arrowX: 1.5,
    arrowText: 'increasing',
  },
  {
    id: 'quadratic',
    label: 'Quadratic — f(x) = x²',
    fn: x => x * x,
    yDomain: [-0.5, 9],
    arrowX: 1.8,
    arrowText: 'concave up',
  },
  {
    id: 'cubic',
    label: 'Cubic — f(x) = x³',
    fn: x => x * x * x,
    yDomain: [-4, 4],
    arrowX: 1.5,
    arrowText: 'inflection at 0',
  },
  {
    id: 'exp',
    label: 'Exponential — (eˣ−1)/3',
    fn: x => (Math.exp(x) - 1) / 3,
    yDomain: [-0.2, 3],
    arrowX: 1.5,
    arrowText: 'grows fast →',
  },
  {
    id: 'sine',
    label: 'Sine — f(x) = sin(x)',
    fn: x => Math.sin(x),
    yDomain: [-1.5, 1.5],
    arrowX: 1.1,
    arrowText: 'oscillates',
  },
]

const xs = d3.range(SAMPLES).map(i => X_DOMAIN[0] + (i / (SAMPLES - 1)) * (X_DOMAIN[1] - X_DOMAIN[0]))

export default function GraphMorph({ params, onParamChange }) {
  const svgRef = useRef(null)
  const pathRef = useRef(null)
  const labelRef = useRef(null)
  const arrowRef = useRef(null)
  const arrowTextRef = useRef(null)
  const xScaleRef = useRef(null)
  const yScaleRef = useRef(null)
  const currentFnRef = useRef(null)

  const [activeFnId, setActiveFnId] = useState('quadratic')

  // Build static SVG structure once
  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`)

    // clip
    g.append('defs').append('clipPath').attr('id', 'gm-clip')
      .append('rect').attr('width', IW).attr('height', IH)

    const xScale = d3.scaleLinear().domain(X_DOMAIN).range([0, IW])
    xScaleRef.current = xScale

    // initial y domain from quadratic
    const initFn = FUNCTIONS.find(f => f.id === 'quadratic')
    const yScale = d3.scaleLinear().domain(initFn.yDomain).range([IH, 0])
    yScaleRef.current = yScale

    const gridColor = '#e2e8f0'

    // grid group (will be updated on transition)
    const gridG = g.append('g').attr('class', 'grid-group')

    const xTicks = xScale.ticks(6)
    gridG.selectAll('line.vg').data(xTicks).enter().append('line')
      .attr('x1', v => xScale(v)).attr('x2', v => xScale(v))
      .attr('y1', 0).attr('y2', IH)
      .attr('stroke', gridColor).attr('stroke-width', 0.7)

    const yTicks = yScale.ticks(6)
    gridG.selectAll('line.hg').data(yTicks).enter().append('line')
      .attr('x1', 0).attr('x2', IW)
      .attr('y1', v => yScale(v)).attr('y2', v => yScale(v))
      .attr('stroke', gridColor).attr('stroke-width', 0.7)

    // axes
    const xAxisG = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${yScale(0)})`)
      .call(d3.axisBottom(xScale).ticks(6).tickSize(4))
    xAxisG.select('.domain').attr('stroke', '#94a3b8')
    xAxisG.selectAll('text').attr('fill', '#64748b').style('font-size', '11px')
    xAxisG.selectAll('line').attr('stroke', '#94a3b8')

    const yAxisG = g.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${xScale(0)},0)`)
      .call(d3.axisLeft(yScale).ticks(6).tickSize(4))
    yAxisG.select('.domain').attr('stroke', '#94a3b8')
    yAxisG.selectAll('text').attr('fill', '#64748b').style('font-size', '11px')
    yAxisG.selectAll('line').attr('stroke', '#94a3b8')

    // label top-left
    const labelEl = g.append('text')
      .attr('x', 8).attr('y', 16)
      .attr('fill', '#6470f1')
      .style('font-size', '13px')
      .style('font-weight', '600')
      .text(initFn.label)
    labelRef.current = labelEl

    // clip group for path + arrow
    const clipG = g.append('g').attr('clip-path', 'url(#gm-clip)')

    // path
    const lineGen = d3.line()
      .defined(x => { const y = initFn.fn(x); return isFinite(y) })
      .x(x => xScale(x))
      .y(x => yScale(initFn.fn(x)))

    const pathEl = clipG.append('path')
      .datum(xs)
      .attr('fill', 'none')
      .attr('stroke', '#6470f1')
      .attr('stroke-width', 2.5)
      .attr('d', lineGen)
    pathRef.current = pathEl

    // arrow annotation
    const arrowX = initFn.arrowX
    const arrowY = initFn.fn(arrowX)
    const arrowEl = clipG.append('text')
      .attr('x', xScale(arrowX) + 6)
      .attr('y', yScale(arrowY) - 8)
      .attr('fill', '#6470f1')
      .style('font-size', '11px')
      .style('opacity', 0.85)
      .text('↗ ' + initFn.arrowText)
    arrowRef.current = arrowEl

    currentFnRef.current = initFn
  }, [])

  // Animate on function change
  useEffect(() => {
    const newFn = FUNCTIONS.find(f => f.id === activeFnId)
    if (!newFn || !pathRef.current || !xScaleRef.current) return

    const xScale = xScaleRef.current
    const newYScale = d3.scaleLinear().domain(newFn.yDomain).range([IH, 0])
    yScaleRef.current = newYScale

    const oldFn = currentFnRef.current || FUNCTIONS.find(f => f.id === 'quadratic')
    const oldYScale = d3.scaleLinear().domain(oldFn.yDomain).range([IH, 0])

    // y-values for interpolation
    const oldYs = xs.map(x => {
      const y = oldFn.fn(x)
      return isFinite(y) ? oldYScale(y) : null
    })
    const newYs = xs.map(x => {
      const y = newFn.fn(x)
      return isFinite(y) ? newYScale(y) : null
    })

    const svg = d3.select(svgRef.current)
    const g = svg.select('g')

    // update x-axis (stays same) and y-axis
    g.select('.y-axis')
      .transition().duration(600)
      .call(d3.axisLeft(newYScale).ticks(6).tickSize(4))
      .call(ax => ax.select('.domain').attr('stroke', '#94a3b8'))
      .call(ax => ax.selectAll('text').attr('fill', '#64748b').style('font-size', '11px'))
      .call(ax => ax.selectAll('line').attr('stroke', '#94a3b8'))

    // x-axis position may change if y=0 moves
    g.select('.x-axis')
      .transition().duration(600)
      .attr('transform', `translate(0,${newYScale(0)})`)

    // animate path via custom interpolation
    const t = d3.transition().duration(600).ease(d3.easeCubicInOut)

    pathRef.current.transition(t).attrTween('d', () => {
      return (tVal) => {
        const interpYs = oldYs.map((oy, i) => {
          const ny = newYs[i]
          if (oy === null || ny === null) return null
          return oy + (ny - oy) * tVal
        })
        const pts = xs.map((x, i) => (interpYs[i] !== null ? [xScale(x), interpYs[i]] : null))
        let d = ''
        pts.forEach((pt, i) => {
          if (!pt) return
          if (i === 0 || pts[i - 1] === null) d += `M${pt[0]},${pt[1]}`
          else d += `L${pt[0]},${pt[1]}`
        })
        return d
      }
    })

    // update label
    if (labelRef.current) {
      labelRef.current.transition(t).style('opacity', 0).on('end', function () {
        d3.select(this).text(newFn.label).transition().duration(300).style('opacity', 1)
      })
    }

    // update arrow annotation
    if (arrowRef.current) {
      arrowRef.current.transition(t)
        .attr('x', xScale(newFn.arrowX) + 6)
        .attr('y', newYScale(newFn.fn(newFn.arrowX)) - 8)
        .text('↗ ' + newFn.arrowText)
    }

    currentFnRef.current = newFn
  }, [activeFnId])

  return (
    <div className="flex flex-col items-center gap-3 font-sans">
      <svg ref={svgRef} width={W} height={H} className="overflow-visible" />
      <div className="flex gap-2 flex-wrap justify-center">
        {FUNCTIONS.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFnId(f.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              activeFnId === f.id
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-brand-400'
            }`}
          >
            {f.id.charAt(0).toUpperCase() + f.id.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}
