import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 380
const GRAPH_H = 160 // volume graph height at bottom
const BOX_H = H - GRAPH_H - 10 // box diagram height
const M = { top: 20, right: 20, bottom: 30, left: 60 }

// Open box problem: 12×8 sheet, cut corners x
const SHEET_W = 12
const SHEET_H = 8
const X_MIN = 0.1
const X_MAX = 3.9 // min(12,8)/2 - epsilon

const volume = (x) => (SHEET_W - 2 * x) * (SHEET_H - 2 * x) * x

// Find optimal x numerically
const dVdx = (x) => {
  const l = SHEET_W - 2 * x
  const w = SHEET_H - 2 * x
  return l * w - 2 * x * w - 2 * x * l
}
// Exact: V = (12-2x)(8-2x)x, V' = 4x^2 - 40x + 96 = 4(x^2 - 10x + 24) = 4(x-6)(x-4)... wait
// V = (12-2x)(8-2x)x = x(96 - 40x + 4x^2)
// V' = 96 - 80x + 12x^2 = 4(3x^2 - 20x + 24)
// discriminant: 400 - 288 = 112; x = (20 ± sqrt(112))/6 = (20 ± 4sqrt(7))/6 = (10 ± 2sqrt(7))/3
const OPT_X = (10 - 2 * Math.sqrt(7)) / 3 // ≈ 1.570

export default function OptimizationViz() {
  const boxRef = useRef(null)
  const graphRef = useRef(null)
  const [cutSize, setCutSize] = useState(1.5)

  const x = Math.max(X_MIN, Math.min(X_MAX, cutSize))
  const boxL = SHEET_W - 2 * x
  const boxW = SHEET_H - 2 * x
  const V = volume(x)
  const Vmax = volume(OPT_X)

  // Box diagram
  useEffect(() => {
    const svg = d3.select(boxRef.current)
    svg.selectAll('*').remove()

    const maxDim = Math.max(SHEET_W, SHEET_H)
    const scale = Math.min((W - 120) / maxDim, (BOX_H - 50) / maxDim)
    const offsetX = (W - SHEET_W * scale) / 2
    const offsetY = 30

    // Draw full sheet outline
    svg.append('rect')
      .attr('x', offsetX).attr('y', offsetY)
      .attr('width', SHEET_W * scale).attr('height', SHEET_H * scale)
      .attr('fill', '#f1f5f9').attr('stroke', '#94a3b8').attr('stroke-width', 1.5)

    // Cut corners (mark with hatching)
    const corners = [
      [0, 0], [SHEET_W - x, 0], [0, SHEET_H - x], [SHEET_W - x, SHEET_H - x]
    ]
    corners.forEach(([cx, cy]) => {
      svg.append('rect')
        .attr('x', offsetX + cx * scale).attr('y', offsetY + cy * scale)
        .attr('width', x * scale).attr('height', x * scale)
        .attr('fill', '#fef3c7').attr('stroke', '#f59e0b').attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '3,2')
      // x label inside corner
      if (x * scale > 20) {
        svg.append('text')
          .attr('x', offsetX + cx * scale + x * scale / 2)
          .attr('y', offsetY + cy * scale + x * scale / 2 + 4)
          .attr('text-anchor', 'middle').attr('font-size', Math.min(11, x * scale * 0.7))
          .attr('fill', '#92400e').text('x')
      }
    })

    // Box floor (the remaining middle rectangle)
    svg.append('rect')
      .attr('x', offsetX + x * scale).attr('y', offsetY + x * scale)
      .attr('width', boxL * scale).attr('height', boxW * scale)
      .attr('fill', '#dbeafe').attr('stroke', '#6470f1').attr('stroke-width', 2)

    // Dimension labels
    // Sheet width (top)
    svg.append('line')
      .attr('x1', offsetX).attr('y1', offsetY - 12)
      .attr('x2', offsetX + SHEET_W * scale).attr('y2', offsetY - 12)
      .attr('stroke', '#94a3b8').attr('stroke-width', 1)
    svg.append('text')
      .attr('x', offsetX + SHEET_W * scale / 2).attr('y', offsetY - 16)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#64748b')
      .text(`${SHEET_W}" (fixed)`)

    // Box floor dimensions
    svg.append('text')
      .attr('x', offsetX + x * scale + boxL * scale / 2)
      .attr('y', offsetY + x * scale + boxW * scale / 2 + 4)
      .attr('text-anchor', 'middle').attr('font-size', Math.min(12, boxL * scale * 0.2))
      .attr('fill', '#1e40af').attr('font-weight', '600')
      .text(`${boxL.toFixed(2)} × ${boxW.toFixed(2)}`)

    // Measurements
    svg.append('text').attr('x', 10).attr('y', offsetY + 16)
      .attr('font-size', 12).attr('fill', '#374151')
      .text(`x = ${x.toFixed(3)}"`)
    svg.append('text').attr('x', 10).attr('y', offsetY + 34)
      .attr('font-size', 12).attr('fill', '#1e40af')
      .text(`V = ${V.toFixed(2)} in³`)
    svg.append('text').attr('x', 10).attr('y', offsetY + 52)
      .attr('font-size', 11).attr('fill', Math.abs(x - OPT_X) < 0.05 ? '#10b981' : '#64748b')
      .text(`V* = ${Vmax.toFixed(2)} in³`)

  }, [x, boxL, boxW, V, Vmax])

  // Volume graph
  useEffect(() => {
    const svg = d3.select(graphRef.current)
    svg.selectAll('*').remove()

    const gW = W - M.left - M.right
    const gH = GRAPH_H - M.top - M.bottom

    const xSc = d3.scaleLinear().domain([0, 4]).range([M.left, M.left + gW])
    const ySc = d3.scaleLinear().domain([0, Vmax * 1.1]).range([M.top + gH, M.top])

    // Grid
    xSc.ticks(5).forEach((t) => {
      svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', M.top + gH)
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })
    ySc.ticks(4).forEach((t) => {
      svg.append('line').attr('x1', M.left).attr('x2', M.left + gW).attr('y1', ySc(t)).attr('y2', ySc(t))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    })

    // Axes
    svg.append('g').attr('transform', `translate(0,${M.top + gH})`).call(d3.axisBottom(xSc).ticks(5)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${M.left},0)`).call(d3.axisLeft(ySc).ticks(4)).attr('color', '#94a3b8')

    // Axis labels
    svg.append('text').attr('x', M.left + gW / 2).attr('y', M.top + gH + 28)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#64748b').text('cut size x (inches)')
    svg.append('text').attr('transform', `translate(14,${M.top + gH / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#64748b').text('Volume (in³)')

    // V(x) curve
    const pts = d3.range(0.01, 4, 0.02).map((xi) => [xi, Math.max(0, volume(xi))])
    const lineFn = d3.line().x(([xi]) => xSc(xi)).y(([, yi]) => ySc(yi))
    svg.append('path').datum(pts).attr('fill', 'none').attr('stroke', '#6470f1').attr('stroke-width', 2.5).attr('d', lineFn)

    // Optimal x marker
    svg.append('line')
      .attr('x1', xSc(OPT_X)).attr('x2', xSc(OPT_X))
      .attr('y1', M.top).attr('y2', M.top + gH)
      .attr('stroke', '#10b981').attr('stroke-dasharray', '5,3').attr('stroke-width', 1.5)
    svg.append('circle').attr('cx', xSc(OPT_X)).attr('cy', ySc(Vmax)).attr('r', 5).attr('fill', '#10b981')
    svg.append('text').attr('x', xSc(OPT_X) + 6).attr('y', ySc(Vmax) - 6)
      .attr('font-size', 10).attr('fill', '#10b981').text(`max: x* ≈ ${OPT_X.toFixed(3)}`)

    // Current x marker
    svg.append('circle').attr('cx', xSc(x)).attr('cy', ySc(V)).attr('r', 6)
      .attr('fill', '#f59e0b').attr('stroke', 'white').attr('stroke-width', 2)
    svg.append('line')
      .attr('x1', xSc(x)).attr('x2', xSc(x))
      .attr('y1', ySc(V) + 6).attr('y2', M.top + gH)
      .attr('stroke', '#f59e0b').attr('stroke-dasharray', '3,2').attr('stroke-width', 1)

  }, [x, V, Vmax])

  return (
    <div>
      <svg ref={boxRef} width="100%" viewBox={"0 0 " + W + " " + BOX_H} className="overflow-visible" />
      <svg ref={graphRef} width="100%" viewBox={"0 0 " + W + " " + GRAPH_H} className="overflow-visible border-t border-slate-200 dark:border-slate-700" />
      <div className="px-4 mt-2">
        <SliderControl
          label="Cut size x"
          min={X_MIN} max={X_MAX} step={0.01}
          value={cutSize} onChange={setCutSize}
          format={(v) => `${v.toFixed(3)} in`}
        />
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        V(x) = (12−2x)(8−2x)x. Maximum volume ≈ {Vmax.toFixed(2)} in³ at x* ≈ {OPT_X.toFixed(3)} in (green dot).
        Current: V({cutSize.toFixed(2)}) = {V.toFixed(2)} in³.
      </p>
    </div>
  )
}
