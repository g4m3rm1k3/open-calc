import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 340
const M = { top: 20, right: 20, bottom: 40, left: 50 }

// Safe eval of simple math expressions
function safeFn(exprStr) {
  try {
    // eslint-disable-next-line no-new-func
    const f = new Function('x', `"use strict"; const Math_sin=Math.sin,Math_cos=Math.cos,Math_sqrt=Math.sqrt,Math_abs=Math.abs,Math_exp=Math.exp,Math_log=Math.log; return (${exprStr})`)
    return (x) => {
      try { const v = f(x); return isFinite(v) ? v : null } catch { return null }
    }
  } catch {
    return () => null
  }
}

export default function LimitApproach({ params }) {
  const svgRef = useRef(null)
  const { fn = '(x*x - 4)/(x - 2)', targetX = 2, limitVal = 4, showTable = false } = params ?? {}
  const [delta, setDelta] = useState(1.0)

  const f = safeFn(fn)

  const tableVals = [
    { x: targetX - 1, side: '←' },
    { x: targetX - 0.1, side: '←' },
    { x: targetX - 0.01, side: '←' },
    { x: targetX - 0.001, side: '←' },
    { x: null, side: '' },
    { x: targetX + 0.001, side: '→' },
    { x: targetX + 0.01, side: '→' },
    { x: targetX + 0.1, side: '→' },
    { x: targetX + 1, side: '→' },
  ]

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xDom = [targetX - 3, targetX + 3]
    const xSc = d3.scaleLinear().domain(xDom).range([M.left, W - M.right])

    // Sample y values for scale
    const pts = d3.range(...xDom, 0.02).map((x) => {
      if (Math.abs(x - targetX) < 1e-10) return null
      const y = f(x)
      return y !== null ? [x, y] : null
    }).filter(Boolean)

    const yVals = pts.map((p) => p[1])
    const [yMin, yMax] = d3.extent(yVals)
    const yPad = Math.max((yMax - yMin) * 0.2, 1)
    const ySc = d3.scaleLinear().domain([yMin - yPad, yMax + yPad]).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(6).forEach((t) => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(5).forEach((t) => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes
    const axY = Math.max(M.top, Math.min(ySc(0), H - M.bottom))
    const axX = Math.max(M.left, Math.min(xSc(0), W - M.right))
    svg.append('g').attr('transform', `translate(0,${axY})`).call(d3.axisBottom(xSc).ticks(6)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${axX},0)`).call(d3.axisLeft(ySc).ticks(5)).attr('color', '#94a3b8')

    // Shade delta region
    const x1 = xSc(targetX - delta), x2 = xSc(targetX + delta)
    svg.append('rect').attr('x', x1).attr('width', x2 - x1).attr('y', M.top).attr('height', H - M.bottom - M.top)
      .attr('fill', '#6470f1').attr('opacity', 0.08)

    // Curve (two segments, skip the hole)
    const line = d3.line().x(([x]) => xSc(x)).y(([, y]) => ySc(y)).defined(([x, y]) => y !== null)
    const leftPts = pts.filter(([x]) => x < targetX - 0.01)
    const rightPts = pts.filter(([x]) => x > targetX + 0.01)
    svg.append('path').datum(leftPts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', line)
    svg.append('path').datum(rightPts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', line)

    // Hole at (targetX, limitVal)
    const lv = limitVal ?? f(targetX + 0.0001)
    if (lv !== null) {
      svg.append('circle').attr('cx', xSc(targetX)).attr('cy', ySc(lv)).attr('r', 6)
        .attr('fill', 'white').attr('stroke', '#6470f1').attr('stroke-width', 2)
      // Dotted lines to limit value
      svg.append('line').attr('x1', M.left).attr('x2', xSc(targetX)).attr('y1', ySc(lv)).attr('y2', ySc(lv))
        .attr('stroke', '#f59e0b').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
      svg.append('line').attr('x1', xSc(targetX)).attr('x2', xSc(targetX)).attr('y1', H - M.bottom).attr('y2', ySc(lv))
        .attr('stroke', '#f59e0b').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
    }

    // Approaching arrows (from left and right)
    const arrowX = targetX - delta * 0.5
    const arrowY = f(arrowX)
    if (arrowY !== null && isFinite(arrowY)) {
      svg.append('text').attr('x', xSc(arrowX)).attr('y', ySc(arrowY) - 14).attr('text-anchor', 'middle')
        .attr('font-size', 16).attr('fill', '#6470f1').text('→')
    }
    const arrowXR = targetX + delta * 0.5
    const arrowYR = f(arrowXR)
    if (arrowYR !== null && isFinite(arrowYR)) {
      svg.append('text').attr('x', xSc(arrowXR)).attr('y', ySc(arrowYR) - 14).attr('text-anchor', 'middle')
        .attr('font-size', 16).attr('fill', '#6470f1').text('←')
    }

  }, [fn, targetX, delta, limitVal])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={"0 0 " + W + " " + H} className="overflow-visible" />
      <div className="px-4 mt-2">
        <SliderControl label="Approach width δ" min={0.05} max={2.5} step={0.05} value={delta} onChange={setDelta} />
      </div>
      {showTable && (
        <div className="mt-4 overflow-x-auto">
          <table className="text-xs mx-auto border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                <th className="px-3 py-1 border border-slate-200 dark:border-slate-700">x</th>
                <th className="px-3 py-1 border border-slate-200 dark:border-slate-700">f(x)</th>
                <th className="px-3 py-1 border border-slate-200 dark:border-slate-700">direction</th>
              </tr>
            </thead>
            <tbody>
              {tableVals.map((row, i) => {
                if (!row.x) return (
                  <tr key={i}><td colSpan={3} className="px-3 py-1 text-center text-slate-400 border border-slate-200 dark:border-slate-700">⋯ x = {targetX} (hole) ⋯</td></tr>
                )
                const y = f(row.x)
                return (
                  <tr key={i} className="even:bg-slate-50 dark:even:bg-slate-800/40">
                    <td className="px-3 py-1 border border-slate-200 dark:border-slate-700 font-mono text-center">{row.x.toFixed(3)}</td>
                    <td className={`px-3 py-1 border border-slate-200 dark:border-slate-700 font-mono text-center ${row.side === '←' ? 'text-brand-600' : 'text-emerald-600'}`}>
                      {y !== null ? y.toFixed(6) : 'undef.'}
                    </td>
                    <td className="px-3 py-1 border border-slate-200 dark:border-slate-700 text-center text-slate-500">{row.side}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="text-xs text-center text-slate-500 mt-2">Both columns approach {limitVal} — the limit is {limitVal}.</p>
        </div>
      )}
    </div>
  )
}
