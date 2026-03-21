import * as d3 from 'd3'
import { useRef, useEffect, useState, useCallback } from 'react'

const W = 580, H = 300
const M = { top: 20, right: 20, bottom: 36, left: 52 }
const IW = W - M.left - M.right
const IH = H - M.top - M.bottom

const PRESETS = [
  {
    id: 'exists',
    label: 'Limit Exists',
    fn: x => x * x + 1,
    a: 1,
    xDomain: [-1, 3],
    yDomain: [-0.2, 5],
    leftLimit: 2,
    rightLimit: 2,
    limitEqual: true,
    hasHole: false,
    bannerText: 'lim = 2',
    bannerColor: '#10b981',
  },
  {
    id: 'jump',
    label: 'Jump Discontinuity',
    fn: x => (x < 1 ? x + 0.5 : x - 0.5),
    a: 1,
    xDomain: [-1, 3],
    yDomain: [-0.5, 3],
    leftLimit: 1.5,
    rightLimit: 0.5,
    limitEqual: false,
    hasHole: false,
    bannerText: 'DNE — left ≠ right',
    bannerColor: '#ef4444',
  },
  {
    id: 'hole',
    label: 'Hole',
    fn: x => x + 1,   // (x²-1)/(x-1) simplified, a=1
    a: 1,
    xDomain: [-1, 3],
    yDomain: [-0.2, 4.5],
    leftLimit: 2,
    rightLimit: 2,
    limitEqual: true,
    hasHole: true,
    bannerText: 'lim = 2',
    bannerColor: '#10b981',
  },
]

const SAMPLES = 250

function buildScales(preset) {
  const xScale = d3.scaleLinear().domain(preset.xDomain).range([0, IW])
  const yScale = d3.scaleLinear().domain(preset.yDomain).range([IH, 0])
  return { xScale, yScale }
}

export default function TwoSidedLimit({ params, onParamChange }) {
  const svgRef = useRef(null)
  const [activeId, setActiveId] = useState('exists')
  const animRef = useRef(null)

  const preset = PRESETS.find(p => p.id === activeId)

  const draw = useCallback((presetArg) => {
    const p = presetArg || preset
    const { xScale, yScale } = buildScales(p)
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`)

    // clip
    g.append('defs').append('clipPath').attr('id', 'tsl-clip')
      .append('rect').attr('width', IW).attr('height', IH)

    // grid
    const gridColor = '#e2e8f0'
    p.xDomain && xScale.ticks(6).forEach(v => {
      g.append('line')
        .attr('x1', xScale(v)).attr('x2', xScale(v))
        .attr('y1', 0).attr('y2', IH)
        .attr('stroke', gridColor).attr('stroke-width', 0.7)
    })
    yScale.ticks(6).forEach(v => {
      g.append('line')
        .attr('x1', 0).attr('x2', IW)
        .attr('y1', yScale(v)).attr('y2', yScale(v))
        .attr('stroke', gridColor).attr('stroke-width', 0.7)
    })

    // x axis at y=0
    const y0 = yScale(0) >= 0 && yScale(0) <= IH ? yScale(0) : IH
    const xAxisG = g.append('g').attr('transform', `translate(0,${y0})`)
      .call(d3.axisBottom(xScale).ticks(6).tickSize(4))
    xAxisG.select('.domain').attr('stroke', '#94a3b8')
    xAxisG.selectAll('text').attr('fill', '#64748b').style('font-size', '11px')
    xAxisG.selectAll('line').attr('stroke', '#94a3b8')

    const yAxisG = g.append('g').attr('transform', `translate(${xScale(0)},0)`)
      .call(d3.axisLeft(yScale).ticks(6).tickSize(4))
    yAxisG.select('.domain').attr('stroke', '#94a3b8')
    yAxisG.selectAll('text').attr('fill', '#64748b').style('font-size', '11px')
    yAxisG.selectAll('line').attr('stroke', '#94a3b8')

    const clipG = g.append('g').attr('clip-path', 'url(#tsl-clip)')

    const xs = d3.range(SAMPLES).map(i =>
      p.xDomain[0] + (i / (SAMPLES - 1)) * (p.xDomain[1] - p.xDomain[0])
    )

    // Draw curve(s)
    if (p.id === 'jump') {
      // Left branch: x < a
      const leftXs = xs.filter(x => x < p.a - 0.005)
      const rightXs = xs.filter(x => x > p.a + 0.005)

      const lineL = d3.line()
        .x(x => xScale(x))
        .y(x => yScale(p.fn(x)))
      clipG.append('path').datum(leftXs)
        .attr('fill', 'none').attr('stroke', '#6470f1')
        .attr('stroke-width', 2.2).attr('d', lineL)

      const lineR = d3.line()
        .x(x => xScale(x))
        .y(x => yScale(p.fn(x)))
      clipG.append('path').datum(rightXs)
        .attr('fill', 'none').attr('stroke', '#6470f1')
        .attr('stroke-width', 2.2).attr('d', lineR)

      // Filled endpoint circles at jump
      clipG.append('circle').attr('cx', xScale(p.a)).attr('cy', yScale(p.leftLimit))
        .attr('r', 4).attr('fill', '#6470f1')
      clipG.append('circle').attr('cx', xScale(p.a)).attr('cy', yScale(p.rightLimit))
        .attr('r', 4).attr('fill', 'white').attr('stroke', '#6470f1').attr('stroke-width', 2)
    } else if (p.id === 'hole') {
      const holeXs = xs.filter(x => Math.abs(x - p.a) > 0.03)
      const line = d3.line().x(x => xScale(x)).y(x => yScale(p.fn(x)))
      clipG.append('path').datum(holeXs)
        .attr('fill', 'none').attr('stroke', '#6470f1')
        .attr('stroke-width', 2.2).attr('d', line)
      // open circle at hole
      clipG.append('circle').attr('cx', xScale(p.a)).attr('cy', yScale(p.fn(p.a)))
        .attr('r', 5).attr('fill', 'white').attr('stroke', '#6470f1').attr('stroke-width', 2)
    } else {
      const line = d3.line()
        .defined(x => isFinite(p.fn(x)))
        .x(x => xScale(x))
        .y(x => yScale(Math.max(p.yDomain[0], Math.min(p.yDomain[1], p.fn(x)))))
      clipG.append('path').datum(xs)
        .attr('fill', 'none').attr('stroke', '#6470f1')
        .attr('stroke-width', 2.2).attr('d', line)
    }

    // banner
    const bannerG = g.append('g').attr('transform', `translate(${IW - 110}, 6)`)
    bannerG.append('rect').attr('width', 106).attr('height', 26).attr('rx', 5)
      .attr('fill', p.bannerColor).attr('opacity', 0.15)
    bannerG.append('text').attr('x', 53).attr('y', 17).attr('text-anchor', 'middle')
      .attr('fill', p.bannerColor).style('font-size', '12px').style('font-weight', '700')
      .text(p.bannerText)

    // Labels for approaching dots (static x→a⁻ and x→a⁺ labels)
    // Left dot label
    const leftLabelEl = clipG.append('text')
      .attr('class', 'left-label')
      .attr('fill', '#10b981')
      .style('font-size', '11px').style('font-weight', '600')
      .attr('text-anchor', 'middle')

    const rightLabelEl = clipG.append('text')
      .attr('class', 'right-label')
      .attr('fill', '#ef4444')
      .style('font-size', '11px').style('font-weight', '600')
      .attr('text-anchor', 'middle')

    // Static x→a⁻ / x→a⁺ approach direction labels
    g.append('text')
      .attr('x', xScale(p.a) - 20).attr('y', IH + 28)
      .attr('fill', '#10b981').style('font-size', '11px').style('font-weight', '600')
      .attr('text-anchor', 'middle').text('x→a⁻')

    g.append('text')
      .attr('x', xScale(p.a) + 20).attr('y', IH + 28)
      .attr('fill', '#ef4444').style('font-size', '11px').style('font-weight', '600')
      .attr('text-anchor', 'middle').text('x→a⁺')

    // Left and right limit value labels
    const leftValEl = g.append('text')
      .attr('class', 'left-val')
      .attr('fill', '#10b981').style('font-size', '11px').style('font-weight', '600')
      .attr('text-anchor', 'end')

    const rightValEl = g.append('text')
      .attr('class', 'right-val')
      .attr('fill', '#ef4444').style('font-size', '11px').style('font-weight', '600')
      .attr('text-anchor', 'start')

    // Animate dots
    const startOffset = 2
    const leftDot = clipG.append('circle').attr('r', 7).attr('fill', '#10b981').attr('opacity', 0.9)
    const rightDot = clipG.append('circle').attr('r', 7).attr('fill', '#ef4444').attr('opacity', 0.9)

    let forward = true
    let timer = null

    function runAnimation() {
      if (timer) timer.stop()
      const duration = 2000

      function step() {
        const dir = forward ? 1 : -1
        const startT = forward ? 0 : 1
        const endT   = forward ? 1 : 0

        const t = d3.transition().duration(duration).ease(d3.easeCubicInOut)

        t.tween('dots', () => {
          return (tVal) => {
            const progress = startT + (endT - startT) * tVal

            // left dot: goes from a-startOffset to a (as progress 0→1)
            const lx = p.a - startOffset + startOffset * progress
            const rx = p.a + startOffset - startOffset * progress

            const ly = p.id === 'jump' ? lx + 0.5 : p.fn(lx)
            const ry = p.id === 'jump' ? rx - 0.5 : p.fn(rx)

            if (isFinite(ly)) {
              const cyL = Math.max(0, Math.min(IH, yScale(ly)))
              leftDot.attr('cx', xScale(lx)).attr('cy', cyL)
              leftLabelEl
                .attr('x', xScale(lx))
                .attr('y', Math.max(12, cyL - 10))
                .text(ly.toFixed(2))
              leftValEl.attr('x', xScale(p.a) - 14).attr('y', cyL + 4)
                .text('L= ' + ly.toFixed(2))
            }
            if (isFinite(ry)) {
              const cyR = Math.max(0, Math.min(IH, yScale(ry)))
              rightDot.attr('cx', xScale(rx)).attr('cy', cyR)
              rightLabelEl
                .attr('x', xScale(rx))
                .attr('y', Math.max(12, cyR - 10))
                .text(ry.toFixed(2))
              rightValEl.attr('x', xScale(p.a) + 14).attr('y', cyR + 4)
                .text('R= ' + ry.toFixed(2))
            }
          }
        })

        t.on('end', () => {
          forward = !forward
          timer = d3.timeout(step, 400)
        })
      }

      step()
    }

    runAnimation()
    animRef.current = { stop: () => { if (timer) timer.stop() } }
  }, [preset])

  useEffect(() => {
    // Stop any running animation
    if (animRef.current) animRef.current.stop()
    const p = PRESETS.find(p => p.id === activeId)
    draw(p)
    return () => { if (animRef.current) animRef.current.stop() }
  }, [activeId])

  return (
    <div className="flex flex-col items-center gap-3 font-sans">
      <svg ref={svgRef} width={W} height={H} className="overflow-visible" />
      <div className="flex gap-2 flex-wrap justify-center">
        {PRESETS.map(p => (
          <button
            key={p.id}
            onClick={() => setActiveId(p.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              activeId === p.id
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-brand-400'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
