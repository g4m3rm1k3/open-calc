import * as d3 from 'd3'
import { useRef, useEffect, useState, useCallback } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 580, H = 380
const M = { top: 30, right: 160, bottom: 50, left: 60 }
const L = 10 // fixed ladder length

export default function RelatedRatesLadder() {
  const svgRef = useRef(null)
  const [xBase, setXBase] = useState(3)
  const [playing, setPlaying] = useState(false)
  const animRef = useRef(null)
  const tRef = useRef(0)

  // Compute y from x
  const getY = (x) => {
    const y2 = L * L - x * x
    return y2 > 0 ? Math.sqrt(y2) : 0
  }

  // dx/dt is fixed at 2 ft/s; dy/dt = -(x/y)*2
  const getDyDt = (x, y) => {
    if (y < 0.001) return -Infinity
    return -(x / y) * 2
  }

  const stopAnimation = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    animRef.current = null
    setPlaying(false)
  }, [])

  useEffect(() => {
    if (!playing) return
    const duration = 5000 // ms for full sweep
    const startTime = performance.now() - (tRef.current / 5000) * duration
    const animate = (now) => {
      const elapsed = now - startTime
      const frac = Math.min(elapsed / duration, 1)
      const newX = 1 + frac * 8 // x goes from 1 to 9
      tRef.current = elapsed
      setXBase(parseFloat(newX.toFixed(2)))
      if (frac < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        stopAnimation()
        tRef.current = 0
      }
    }
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [playing, stopAnimation])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const plotW = W - M.left - M.right
    const plotH = H - M.top - M.bottom

    // Scales: x from 0 to 12, y from 0 to 12 (ladder region)
    const xSc = d3.scaleLinear().domain([0, 12]).range([M.left, M.left + plotW])
    const ySc = d3.scaleLinear().domain([0, 12]).range([M.top + plotH, M.top])

    const y = getY(xBase)
    const dyDt = getDyDt(xBase, y)

    // Defs: arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arr-rr')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8).attr('refY', 0)
      .attr('markerWidth', 6).attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', '#94a3b8')

    // Grid lines (light)
    for (let gx = 0; gx <= 12; gx += 2) {
      svg.append('line')
        .attr('x1', xSc(gx)).attr('x2', xSc(gx))
        .attr('y1', M.top).attr('y2', M.top + plotH)
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    }
    for (let gy = 0; gy <= 12; gy += 2) {
      svg.append('line')
        .attr('x1', M.left).attr('x2', M.left + plotW)
        .attr('y1', ySc(gy)).attr('y2', ySc(gy))
        .attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3')
    }

    // Wall (thick vertical at x=0)
    svg.append('line')
      .attr('x1', xSc(0)).attr('x2', xSc(0))
      .attr('y1', M.top).attr('y2', ySc(0))
      .attr('stroke', '#94a3b8').attr('stroke-width', 6)

    // Ground (thick horizontal at y=0)
    svg.append('line')
      .attr('x1', xSc(0)).attr('x2', xSc(12))
      .attr('y1', ySc(0)).attr('y2', ySc(0))
      .attr('stroke', '#94a3b8').attr('stroke-width', 6)

    // Right angle symbol at origin
    const sq = 0.3
    svg.append('polyline')
      .attr('points', `${xSc(sq)},${ySc(0)} ${xSc(sq)},${ySc(sq)} ${xSc(0)},${ySc(sq)}`)
      .attr('fill', 'none').attr('stroke', '#94a3b8').attr('stroke-width', 1.5)

    // Ladder (thick diagonal)
    svg.append('line')
      .attr('x1', xSc(xBase)).attr('y1', ySc(0))
      .attr('x2', xSc(0)).attr('y2', ySc(y))
      .attr('stroke', '#6470f1').attr('stroke-width', 5)
      .attr('stroke-linecap', 'round')

    // Ladder label "L = 10"
    const midX = xSc((xBase + 0) / 2) + 10
    const midY = ySc((0 + y) / 2) - 10
    svg.append('text')
      .attr('x', midX).attr('y', midY)
      .attr('font-size', 13).attr('font-weight', '600')
      .attr('fill', '#6470f1').attr('text-anchor', 'middle')
      .text('L = 10')

    // Base point (circle)
    svg.append('circle')
      .attr('cx', xSc(xBase)).attr('cy', ySc(0))
      .attr('r', 8).attr('fill', '#f59e0b')

    // Top point (circle)
    svg.append('circle')
      .attr('cx', xSc(0)).attr('cy', ySc(y))
      .attr('r', 8).attr('fill', '#10b981')

    // Arrow for x (horizontal, below ground level not possible, show at base)
    svg.append('line')
      .attr('x1', xSc(0)).attr('x2', xSc(xBase) - 10)
      .attr('y1', ySc(0) + 22).attr('y2', ySc(0) + 22)
      .attr('stroke', '#f59e0b').attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arr-rr)')
    svg.append('text')
      .attr('x', xSc(xBase / 2)).attr('y', ySc(0) + 36)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#f59e0b')
      .text(`x = ${xBase.toFixed(2)} ft`)

    // Arrow for y (vertical, left of wall)
    if (y > 0.5) {
      svg.append('line')
        .attr('x1', xSc(0) - 18).attr('x2', xSc(0) - 18)
        .attr('y1', ySc(0) - 10).attr('y2', ySc(y) + 10)
        .attr('stroke', '#10b981').attr('stroke-width', 1.5)
        .attr('marker-end', 'url(#arr-rr)')
      svg.append('text')
        .attr('x', xSc(0) - 30).attr('y', ySc(y / 2))
        .attr('text-anchor', 'middle').attr('font-size', 12)
        .attr('fill', '#10b981').attr('writing-mode', 'vertical-rl')
        .text(`y = ${y.toFixed(2)} ft`)
    }

    // Info panel on right
    const panelX = M.left + plotW + 12
    const panelY = M.top + 10

    svg.append('text').attr('x', panelX).attr('y', panelY)
      .attr('font-size', 13).attr('font-weight', '600').attr('fill', '#334155')
      .text('Rates:')

    const lines = [
      { label: 'dx/dt =', val: ' 2.000 ft/s', color: '#f59e0b' },
      { label: 'dy/dt =', val: ` ${isFinite(dyDt) ? dyDt.toFixed(3) : '-∞'} ft/s`, color: '#10b981' },
      { label: 'x =', val: ` ${xBase.toFixed(3)} ft`, color: '#f59e0b' },
      { label: 'y =', val: ` ${y.toFixed(3)} ft`, color: '#10b981' },
    ]
    lines.forEach((l, i) => {
      const row = panelY + 24 + i * 22
      svg.append('text').attr('x', panelX).attr('y', row)
        .attr('font-size', 12).attr('fill', '#475569').text(l.label)
      svg.append('text').attr('x', panelX + 52).attr('y', row)
        .attr('font-size', 12).attr('font-family', 'monospace').attr('fill', l.color)
        .text(l.val)
    })

    // Formula reminder
    svg.append('text').attr('x', panelX).attr('y', panelY + 120)
      .attr('font-size', 11).attr('fill', '#64748b')
      .text('x² + y² = 100')
    svg.append('text').attr('x', panelX).attr('y', panelY + 136)
      .attr('font-size', 11).attr('fill', '#64748b')
      .text('2x·ẋ + 2y·ẏ = 0')
    svg.append('text').attr('x', panelX).attr('y', panelY + 152)
      .attr('font-size', 11).attr('fill', '#64748b')
      .text('ẏ = −(x/y)·ẋ')

    // At x=6 highlight
    if (Math.abs(xBase - 6) < 0.15) {
      svg.append('text').attr('x', panelX).attr('y', panelY + 178)
        .attr('font-size', 11).attr('font-weight', '600').attr('fill', '#6470f1')
        .text('x=6: ẏ = −1.500')
    }

    // Singularity warning near y=0
    if (y < 1) {
      svg.append('text').attr('x', W / 2).attr('y', M.top + plotH - 10)
        .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#ef4444')
        .text('⚠ Top accelerates → ∞ as y → 0')
    }

  }, [xBase])

  return (
    <div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        <SliderControl
          label="Base position x"
          min={1} max={9} step={0.01}
          value={xBase} onChange={(v) => { stopAnimation(); setXBase(v) }}
          format={(v) => `${v.toFixed(2)} ft`}
        />
        <div className="flex gap-3 mt-1">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors"
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => { stopAnimation(); setXBase(3); tRef.current = 0 }}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        When x = 6 ft, dy/dt = −(6/8)·2 = −3/2 = −1.500 ft/s. The top slides down at 1.5 ft/s.
      </p>
    </div>
  )
}
