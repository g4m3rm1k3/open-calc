import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 300
const M = { top: 20, right: 20, bottom: 36, left: 52 }

export default function OscillationViz() {
  const svgRef = useRef(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xMax = 2 / zoom
    const xMin = -xMax
    const yMin = -1.5, yMax = 1.5

    const xSc = d3.scaleLinear().domain([xMin, xMax]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([yMin, yMax]).range([H - M.bottom, M.top])

    // Grid lines
    xSc.ticks(8).forEach(t =>
      svg.append('line')
        .attr('x1', xSc(t)).attr('x2', xSc(t))
        .attr('y1', M.top).attr('y2', H - M.bottom)
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    )
    ySc.ticks(6).forEach(t =>
      svg.append('line')
        .attr('x1', M.left).attr('x2', W - M.right)
        .attr('y1', ySc(t)).attr('y2', ySc(t))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    )

    // Sample sin(1/x)
    const N = 3000
    const pts = d3.range(N).map(i => {
      const x = xMin + (i / (N - 1)) * (xMax - xMin)
      return { x, y: Math.sin(1 / x) }
    })

    const line = d3.line()
      .defined(d => Math.abs(d.x) >= 0.005 && isFinite(d.y))
      .x(d => xSc(d.x))
      .y(d => ySc(d.y))
      .curve(d3.curveLinear)

    svg.append('path')
      .datum(pts)
      .attr('fill', 'none')
      .attr('stroke', '#6470f1')
      .attr('stroke-width', 1.8)
      .attr('d', line)

    // Axes
    const yAxisPos = Math.max(M.left, Math.min(W - M.right, xSc(0)))
    const xAxisPos = Math.max(M.top, Math.min(H - M.bottom, ySc(0)))
    svg.append('g').attr('transform', `translate(0,${xAxisPos})`).call(d3.axisBottom(xSc).ticks(8)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${yAxisPos},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    // x=0 red dashed line
    svg.append('line')
      .attr('x1', xSc(0)).attr('x2', xSc(0))
      .attr('y1', M.top).attr('y2', H - M.bottom)
      .attr('stroke', '#ef4444').attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,4')

    svg.append('text')
      .attr('x', xSc(0) + 5).attr('y', M.top + 14)
      .attr('fill', '#ef4444').attr('font-size', 12).attr('font-weight', '600')
      .text('x = 0')

    // y=1 and y=-1 bounds
    ;[-1, 1].forEach(v =>
      svg.append('line')
        .attr('x1', M.left).attr('x2', W - M.right)
        .attr('y1', ySc(v)).attr('y2', ySc(v))
        .attr('stroke', '#cbd5e1').attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4')
    )
  }, [zoom])

  const highZoom = zoom >= 12
  const infoText = highZoom
    ? 'No matter how close to 0 you look… it still oscillates infinitely.'
    : 'sin(1/x) oscillates faster and faster as x → 0.'

  return (
    <div className="flex flex-col gap-3">
      <svg ref={svgRef} width={W} height={H} className="w-full overflow-visible" />

      <div className="px-2 flex flex-col gap-2">
        <SliderControl
          label="Zoom level"
          min={1} max={20} step={1}
          value={zoom}
          onChange={setZoom}
          format={v => `${v}×`}
        />

        <div className={`rounded-lg px-4 py-2 text-sm transition-colors duration-300 ${highZoom ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'}`}>
          {infoText}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center italic">
          lim<sub>x→0</sub> sin(1/x) does not exist — the function oscillates between −1 and 1 infinitely many times
        </p>
      </div>
    </div>
  )
}
