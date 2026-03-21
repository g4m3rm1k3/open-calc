/**
 * TangentExplosion — Quotient Rule Intuition for d/dx[tan x] = sec²x
 *
 * Left panel:  sin(x) in blue, cos(x) in red
 * Right panel: tan(x) in purple with asymptotes
 *
 * A draggable vertical slider shows a chosen x-value across both graphs.
 * As x → π/2, the user sees cos(x) → 0 (red shrinking) while sin(x) → 1
 * (blue stays strong), making tan(x) explode toward ∞.
 *
 * A dynamic fraction label reinforces: "Increasing Blue / Shrinking Red = Exploding Purple"
 */
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const BLUE   = '#3b82f6'
const RED    = '#ef4444'
const PURPLE = '#a855f7'
const GOLD   = '#f59e0b'

const X_MIN = -Math.PI * 1.2
const X_MAX =  Math.PI * 1.2
const TAN_CLAMP = 6  // clamp tan(x) display so asymptotes don't break the scale

function clampTan(x) {
  const t = Math.tan(x)
  if (!isFinite(t) || Math.abs(t) > TAN_CLAMP) return NaN
  return t
}

export default function TangentExplosion({ params = {}, onParamChange }) {
  const containerRef = useRef(null)
  const leftRef  = useRef(null)
  const rightRef = useRef(null)
  const [xVal, setXVal] = useState(0)          // current x position
  const [dragging, setDragging] = useState(false)

  const sinVal  = Math.sin(xVal)
  const cosVal  = Math.cos(xVal)
  const tanVal  = Math.tan(xVal)
  const tanText = Math.abs(tanVal) > 99 ? '→ ∞' : tanVal.toFixed(3)

  // Clamp display of the fraction components for the label
  const isNearAsymptote = Math.abs(cosVal) < 0.05

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(() => drawBoth())
    ro.observe(container)
    drawBoth()
    return () => ro.disconnect()
  }, [xVal])

  function drawBoth() {
    const container = containerRef.current
    if (!container) return
    const totalW = container.clientWidth
    if (totalW < 10) return
    const w = Math.floor(totalW / 2) - 4
    const h = Math.min(260, Math.floor(w * 0.7))
    if (w < 20 || h < 20) return
    drawLeft(w, h)
    drawRight(w, h)
  }

  function drawLeft(W, H) {
    const svg = d3.select(leftRef.current)
    if (!W || !H) return
    svg.attr('width', W).attr('height', H)
    svg.selectAll('*').remove()

    const m = { top: 20, right: 10, bottom: 30, left: 36 }
    const w = W - m.left - m.right
    const h = H - m.top  - m.bottom

    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`)

    const xScale = d3.scaleLinear().domain([X_MIN, X_MAX]).range([0, w])
    const yScale = d3.scaleLinear().domain([-1.6, 1.6]).range([h, 0])

    // Axes
    g.append('g').attr('transform', `translate(0,${yScale(0)})`).call(
      d3.axisBottom(xScale)
        .tickValues([-Math.PI, -Math.PI/2, 0, Math.PI/2, Math.PI])
        .tickFormat(v => {
          if (v === 0) return '0'
          const map = { [Math.PI]: 'π', [-Math.PI]: '-π', [Math.PI/2]: 'π/2', [-Math.PI/2]: '-π/2' }
          return map[v] ?? ''
        })
    ).call(s => s.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 10))
     .call(s => s.select('.domain').attr('stroke', '#e2e8f0'))
     .call(s => s.selectAll('.tick line').attr('stroke', '#e2e8f0'))

    g.append('g').call(d3.axisLeft(yScale).ticks(4))
      .call(s => s.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 10))
      .call(s => s.select('.domain').attr('stroke', '#e2e8f0'))
      .call(s => s.selectAll('.tick line').attr('stroke', '#e2e8f0'))

    // Grid
    g.append('g').selectAll('line')
      .data(yScale.ticks(4))
      .join('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', d => yScale(d)).attr('y2', d => yScale(d))
      .attr('stroke', '#f1f5f9').attr('stroke-width', 1)

    const makeLine = (fn) => d3.line()
      .defined(d => isFinite(fn(d)))
      .x(d => xScale(d))
      .y(d => yScale(fn(d)))

    const pts = d3.range(X_MIN, X_MAX, 0.02)

    // sin(x) — blue
    g.append('path')
      .attr('d', makeLine(Math.sin)(pts))
      .attr('fill', 'none').attr('stroke', BLUE).attr('stroke-width', 2.5)

    // cos(x) — red
    g.append('path')
      .attr('d', makeLine(Math.cos)(pts))
      .attr('fill', 'none').attr('stroke', RED).attr('stroke-width', 2.5)

    // Vertical slider line
    g.append('line')
      .attr('x1', xScale(xVal)).attr('x2', xScale(xVal))
      .attr('y1', 0).attr('y2', h)
      .attr('stroke', GOLD).attr('stroke-width', 2).attr('stroke-dasharray', '4,3')

    // Dots on curves
    g.append('circle').attr('cx', xScale(xVal)).attr('cy', yScale(sinVal)).attr('r', 5).attr('fill', BLUE).attr('stroke', 'white').attr('stroke-width', 1.5)
    g.append('circle').attr('cx', xScale(xVal)).attr('cy', yScale(cosVal)).attr('r', 5).attr('fill', RED).attr('stroke', 'white').attr('stroke-width', 1.5)

    // Legend
    const legend = [{ c: BLUE, t: 'sin(x)' }, { c: RED, t: 'cos(x)' }]
    legend.forEach(({ c, t }, i) => {
      g.append('rect').attr('x', w - 65).attr('y', i * 16 + 2).attr('width', 12).attr('height', 3).attr('fill', c).attr('rx', 1)
      g.append('text').attr('x', w - 50).attr('y', i * 16 + 7).attr('fill', c).attr('font-size', 10).attr('font-weight', 'bold').text(t)
    })

    // Title
    g.append('text').attr('x', w / 2).attr('y', -6)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('font-weight', 'bold').attr('fill', '#475569')
      .text('sin(x) and cos(x)')

    // Drag overlay
    svg.append('rect')
      .attr('x', m.left).attr('y', m.top).attr('width', w).attr('height', h)
      .attr('fill', 'transparent').attr('cursor', 'ew-resize')
      .call(d3.drag()
        .on('start', () => setDragging(true))
        .on('end', () => setDragging(false))
        .on('drag', (event) => {
          const newX = xScale.invert(event.x - m.left)
          setXVal(Math.max(X_MIN, Math.min(X_MAX, newX)))
        })
      )
  }

  function drawRight(W, H) {
    const svg = d3.select(rightRef.current)
    if (!W || !H) return
    svg.attr('width', W).attr('height', H)
    svg.selectAll('*').remove()

    const m = { top: 20, right: 10, bottom: 30, left: 36 }
    const w = W - m.left - m.right
    const h = H - m.top  - m.bottom

    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`)

    const xScale = d3.scaleLinear().domain([X_MIN, X_MAX]).range([0, w])
    const yScale = d3.scaleLinear().domain([-TAN_CLAMP, TAN_CLAMP]).range([h, 0])

    // Axes
    g.append('g').attr('transform', `translate(0,${yScale(0)})`).call(
      d3.axisBottom(xScale)
        .tickValues([-Math.PI, -Math.PI/2, 0, Math.PI/2, Math.PI])
        .tickFormat(v => {
          if (v === 0) return '0'
          const map = { [Math.PI]: 'π', [-Math.PI]: '-π', [Math.PI/2]: 'π/2', [-Math.PI/2]: '-π/2' }
          return map[v] ?? ''
        })
    ).call(s => s.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 10))
     .call(s => s.select('.domain').attr('stroke', '#e2e8f0'))
     .call(s => s.selectAll('.tick line').attr('stroke', '#e2e8f0'))

    g.append('g').call(d3.axisLeft(yScale).ticks(5))
      .call(s => s.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 10))
      .call(s => s.select('.domain').attr('stroke', '#e2e8f0'))
      .call(s => s.selectAll('.tick line').attr('stroke', '#e2e8f0'))

    // Asymptote lines
    const asymptotes = [-Math.PI / 2, Math.PI / 2]
    asymptotes.forEach(a => {
      g.append('line')
        .attr('x1', xScale(a)).attr('x2', xScale(a))
        .attr('y1', 0).attr('y2', h)
        .attr('stroke', RED).attr('stroke-width', 1).attr('stroke-dasharray', '5,4').attr('opacity', 0.5)
    })

    // tan(x) segments — split at asymptotes
    const allPts = d3.range(X_MIN, X_MAX, 0.01)
    const tanLine = d3.line()
      .defined(d => {
        // break segment near asymptotes
        if (Math.abs(Math.cos(d)) < 0.04) return false
        const t = Math.tan(d)
        return Math.abs(t) <= TAN_CLAMP
      })
      .x(d => xScale(d))
      .y(d => yScale(clampTan(d)))

    g.append('path')
      .datum(allPts)
      .attr('d', tanLine)
      .attr('fill', 'none').attr('stroke', PURPLE).attr('stroke-width', 2.5)

    // Vertical slider
    g.append('line')
      .attr('x1', xScale(xVal)).attr('x2', xScale(xVal))
      .attr('y1', 0).attr('y2', h)
      .attr('stroke', GOLD).attr('stroke-width', 2).attr('stroke-dasharray', '4,3')

    // Dot on tan(x)
    const tanDot = clampTan(xVal)
    if (!isNaN(tanDot)) {
      g.append('circle').attr('cx', xScale(xVal)).attr('cy', yScale(tanDot)).attr('r', 5)
        .attr('fill', PURPLE).attr('stroke', 'white').attr('stroke-width', 1.5)
    }

    // Legend
    g.append('rect').attr('x', w - 65).attr('y', 2).attr('width', 12).attr('height', 3).attr('fill', PURPLE).attr('rx', 1)
    g.append('text').attr('x', w - 50).attr('y', 7).attr('fill', PURPLE).attr('font-size', 10).attr('font-weight', 'bold').text('tan(x)')
    g.append('rect').attr('x', w - 65).attr('y', 18).attr('width', 12).attr('height', 2).attr('fill', RED).attr('rx', 1)
    g.append('text').attr('x', w - 50).attr('y', 23).attr('fill', RED).attr('font-size', 9).text('asymptote')

    // Title
    g.append('text').attr('x', w / 2).attr('y', -6)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('font-weight', 'bold').attr('fill', '#475569')
      .text('tan(x) = sin(x) / cos(x)')

    // Drag overlay (same x synced to left panel)
    svg.append('rect')
      .attr('x', m.left).attr('y', m.top).attr('width', w).attr('height', h)
      .attr('fill', 'transparent').attr('cursor', 'ew-resize')
      .call(d3.drag()
        .on('start', () => setDragging(true))
        .on('end', () => setDragging(false))
        .on('drag', (event) => {
          const newX = xScale.invert(event.x - m.left)
          setXVal(Math.max(X_MIN, Math.min(X_MAX, newX)))
        })
      )
  }

  // Slider → -π to π mapped 0–100
  const sliderVal = ((xVal - X_MIN) / (X_MAX - X_MIN)) * 100
  function handleSlider(e) {
    const pct = e.target.value / 100
    setXVal(X_MIN + pct * (X_MAX - X_MIN))
  }

  const xLabel = (() => {
    const pi = Math.PI
    const frac = xVal / pi
    if (Math.abs(frac - 0.5) < 0.02) return 'π/2 ⚡'
    if (Math.abs(frac + 0.5) < 0.02) return '-π/2 ⚡'
    return xVal.toFixed(2)
  })()

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 space-y-3">
      {/* Dual graphs */}
      <div ref={containerRef} className="flex gap-1 w-full">
        <svg ref={leftRef}  className="block flex-1 min-w-0" />
        <svg ref={rightRef} className="block flex-1 min-w-0" />
      </div>

      {/* x-value slider */}
      <div className="px-2 space-y-1">
        <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 font-mono">
          <span>-π</span>
          <span className="font-bold" style={{ color: GOLD }}>x = {xLabel}</span>
          <span>π</span>
        </div>
        <input
          type="range" min={0} max={100} step={0.2}
          value={sliderVal}
          onChange={handleSlider}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
      </div>

      {/* Dynamic fraction label — the "aha" moment */}
      <div className={`rounded-xl border px-4 py-3 transition-colors ${isNearAsymptote ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'}`}>
        <div className="flex items-center justify-center gap-3 flex-wrap text-sm font-mono">
          <span className="flex flex-col items-center gap-0.5">
            <span style={{ color: BLUE }} className="font-bold">sin(x) = {sinVal.toFixed(3)}</span>
            <div className="w-full h-px bg-slate-400 dark:bg-slate-500" />
            <span style={{ color: RED }} className="font-bold">cos(x) = {cosVal.toFixed(3)}</span>
          </span>
          <span className="text-slate-400">=</span>
          <span style={{ color: PURPLE }} className="font-bold text-base">
            tan(x) = {isNearAsymptote ? '⚡ ±∞' : tanText}
          </span>
        </div>

        <p className="text-center text-xs mt-2 leading-relaxed" style={{ color: isNearAsymptote ? '#ef4444' : '#64748b' }}>
          {isNearAsymptote
            ? 'cos(x) ≈ 0 — the denominator is vanishing! tan(x) explodes toward ±∞.'
            : Math.abs(cosVal) < 0.3
              ? 'The red cos(x) is getting small — watch tan(x) grow fast on the right graph!'
              : 'Drag the slider toward π/2 to watch the "explosion" happen.'}
        </p>
      </div>

      {/* Aha text */}
      <div className="rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 px-4 py-3">
        <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
          <strong>Why is d/dx[tan x] = sec²x always positive?</strong> Because tan(x) always rises from left to right (on each branch) — it never points downward. Its slope is always positive. And sec²x = 1/cos²x is always ≥ 1, so the tangent line only gets steeper. A squared term can never be negative.
        </p>
      </div>
    </div>
  )
}
