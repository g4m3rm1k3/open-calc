import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * TangentLineViz
 * Animates secant lines converging to the tangent as h → 0.
 * params.currentStep controls which proof step is highlighted.
 */
export default function TangentLineViz({ params = {} }) {
  const svgRef = useRef(null)
  const [hValue, setHValue] = useState(2.0)
  const isAnimating = useRef(false)
  const animRef = useRef(null)

  const WIDTH = 560
  const HEIGHT = 380
  const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 }
  const INNER_W = WIDTH - MARGIN.left - MARGIN.right
  const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom

  const f = x => x * x
  const fPrime = x => 2 * x
  const X0 = 1.5 // point of tangency

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const xScale = d3.scaleLinear().domain([-0.5, 4]).range([0, INNER_W])
    const yScale = d3.scaleLinear().domain([-0.5, 10]).range([INNER_H, 0])

    const g = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${INNER_H})`)
      .call(d3.axisBottom(xScale).tickSize(-INNER_H).tickFormat(''))
      .selectAll('line').style('stroke', '#e2e8f0').style('stroke-width', 1)

    // Axes
    g.append('g').attr('transform', `translate(0,${INNER_H})`).call(d3.axisBottom(xScale))
    g.append('g').call(d3.axisLeft(yScale))

    // Axis labels
    svg.append('text')
      .attr('x', WIDTH / 2).attr('y', HEIGHT - 5)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#64748b')
      .text('x')
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -HEIGHT / 2).attr('y', 14)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#64748b')
      .text('f(x) = x²')

    // f(x) = x² curve
    const lineGen = d3.line()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]))
      .curve(d3.curveCatmullRom)

    const curveData = d3.range(-0.3, 3.8, 0.05).map(x => [x, f(x)])
    g.append('path')
      .datum(curveData)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2.5)
      .attr('d', lineGen)

    // Fixed point P = (X0, f(X0))
    g.append('circle')
      .attr('cx', xScale(X0)).attr('cy', yScale(f(X0)))
      .attr('r', 5).attr('fill', '#1d4ed8').attr('stroke', 'white').attr('stroke-width', 2)

    g.append('text')
      .attr('x', xScale(X0) + 8).attr('y', yScale(f(X0)) - 8)
      .attr('font-size', 12).attr('fill', '#1d4ed8').attr('font-weight', 'bold')
      .text(`P(${X0}, ${f(X0)})`)

    // ---- Secant line (updates with hValue) ----
    const x1 = X0
    const x2 = X0 + hValue
    const secantSlope = (f(x2) - f(x1)) / (x2 - x1)
    const secantIntercept = f(x1) - secantSlope * x1

    // Extend secant across visible range
    const sx0 = -0.5, sx1 = 4
    g.append('line')
      .attr('id', 'secant-line')
      .attr('x1', xScale(sx0)).attr('y1', yScale(secantSlope * sx0 + secantIntercept))
      .attr('x2', xScale(sx1)).attr('y2', yScale(secantSlope * sx1 + secantIntercept))
      .attr('stroke', '#f97316').attr('stroke-width', 2).attr('stroke-dasharray', hValue < 0.1 ? 'none' : '6,3')
      .attr('opacity', 0.85)

    // Second point Q
    if (Math.abs(hValue) > 0.05) {
      g.append('circle')
        .attr('cx', xScale(x2)).attr('cy', yScale(f(x2)))
        .attr('r', 5).attr('fill', '#f97316').attr('stroke', 'white').attr('stroke-width', 2)
      g.append('text')
        .attr('x', xScale(x2) + 8).attr('y', yScale(f(x2)) - 8)
        .attr('font-size', 11).attr('fill', '#f97316')
        .text(`Q(${x2.toFixed(2)}, ${f(x2).toFixed(2)})`)
    }

    // Tangent line (always show, dashed blue when h > 0.1)
    const tanSlope = fPrime(X0)
    const tanIntercept = f(X0) - tanSlope * X0
    g.append('line')
      .attr('x1', xScale(sx0)).attr('y1', yScale(tanSlope * sx0 + tanIntercept))
      .attr('x2', xScale(sx1)).attr('y2', yScale(tanSlope * sx1 + tanIntercept))
      .attr('stroke', '#10b981')
      .attr('stroke-width', hValue < 0.15 ? 3 : 1.5)
      .attr('stroke-dasharray', hValue < 0.15 ? 'none' : '3,3')
      .attr('opacity', hValue < 0.15 ? 1 : 0.5)

    // Slope label
    g.append('text')
      .attr('x', INNER_W - 10).attr('y', 20)
      .attr('text-anchor', 'end').attr('font-size', 13).attr('fill', '#f97316').attr('font-weight', 'bold')
      .text(`Secant slope: ${secantSlope.toFixed(3)}`)

    g.append('text')
      .attr('x', INNER_W - 10).attr('y', 38)
      .attr('text-anchor', 'end').attr('font-size', 13).attr('fill', '#10b981').attr('font-weight', 'bold')
      .text(`Tangent slope: ${tanSlope.toFixed(3)}`)

    g.append('text')
      .attr('x', INNER_W - 10).attr('y', 56)
      .attr('text-anchor', 'end').attr('font-size', 11).attr('fill', '#94a3b8')
      .text(`h = ${hValue.toFixed(3)}`)

  }, [hValue])

  const animateShrink = () => {
    if (isAnimating.current) return
    isAnimating.current = true
    let h = 2.0
    const step = () => {
      h = h * 0.88
      setHValue(h)
      if (h > 0.01) {
        animRef.current = requestAnimationFrame(step)
      } else {
        setHValue(0.001)
        isAnimating.current = false
      }
    }
    animRef.current = requestAnimationFrame(step)
  }

  const reset = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    isAnimating.current = false
    setHValue(2.0)
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '12px 0' }}>
      <svg
        ref={svgRef}
        width={WIDTH}
        height={HEIGHT}
        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
      />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
        <button
          onClick={animateShrink}
          style={{
            padding: '8px 18px', background: '#3b82f6', color: 'white',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14,
          }}
        >
          Animate h → 0
        </button>
        <button
          onClick={reset}
          style={{
            padding: '8px 18px', background: '#e2e8f0', color: '#334155',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14,
          }}
        >
          Reset
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 13, color: '#64748b' }}>h:</label>
          <input
            type="range" min="0.05" max="2.5" step="0.05"
            value={hValue}
            onChange={e => { if (animRef.current) cancelAnimationFrame(animRef.current); isAnimating.current = false; setHValue(parseFloat(e.target.value)) }}
            style={{ width: 120 }}
          />
          <span style={{ fontSize: 13, color: '#475569', width: 48 }}>{hValue.toFixed(2)}</span>
        </div>
      </div>
      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
        🟠 Secant line through P and Q &nbsp;|&nbsp; 🟢 True tangent line at P &nbsp;|&nbsp;
        As h→0, the secant approaches the tangent.
      </p>
    </div>
  )
}
