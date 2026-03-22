/**
 * TrigDerivativeSync — "The Moving Point" sine & cosine derivative visualizer.
 *
 * Three synchronized panels:
 *   Left  — unit circle with the moving point and its velocity vector
 *   Top R — sine curve (height) with live tangent line showing the slope
 *   Bot R — cosine curve being "painted" in real time by that slope value
 *
 * The insight: the slope of sin(θ) at any point equals cos(θ).
 * This visualization makes that relationship visible and tactile.
 */
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const TAU = 2 * Math.PI

function getLiveLogic(theta) {
  const t = ((theta % TAU) + TAU) % TAU
  const near = (target, eps = 0.18) =>
    Math.abs(t - target) < eps ||
    Math.abs(t - target + TAU) < eps ||
    Math.abs(t - target - TAU) < eps

  if (near(0))           return 'θ = 0 — The point moves straight upward at full speed. sin(θ) rises at its maximum rate, so the tangent slope is 1. The cosine pen lands at its peak: cos(0) = 1.'
  if (near(Math.PI / 2)) return 'θ = π/2 — The point is at the top of the circle, moving horizontally. The height is momentarily not changing, so the sine slope is 0. The cosine pen crosses zero: cos(π/2) = 0.'
  if (near(Math.PI))     return 'θ = π — The point moves straight downward at full speed. sin(θ) falls at its fastest rate, so the tangent slope is −1. The cosine pen hits its trough: cos(π) = −1.'
  if (near(3 * Math.PI / 2)) return 'θ = 3π/2 — The point is at the bottom, moving horizontally again. Height is momentarily flat, so the sine slope is 0. The cosine pen crosses zero again: cos(3π/2) = 0.'
  return `The dashed line links the tangent slope on sin(θ) to the current value on cos(θ). They are always equal — that is the meaning of d/dθ[sin θ] = cos θ.`
}

export default function TrigDerivativeSync({ params = {} }) {
  const svgRef       = useRef(null)
  const containerRef = useRef(null)
  const [theta, setTheta]       = useState(0)
  const [playing, setPlaying]   = useState(false)

  // Animation loop
  useEffect(() => {
    if (!playing) return
    let raf
    const tick = () => {
      setTheta(prev => {
        let next = prev + 0.018
        if (next > TAU) next -= TAU
        return next
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  // Draw
  useEffect(() => {
    const draw = () => {
      const container = containerRef.current
      const svgEl     = svgRef.current
      if (!container || !svgEl) return

      const isDark = document.documentElement.classList.contains('dark')
      const W = container.clientWidth || 700
      // Responsive height: taller on wide screens so both graph panels have room
      const H = Math.min(Math.max(W * 0.62, 320), 520)
      svgEl.setAttribute('height', H)

      const svg = d3.select(svgEl).attr('width', W).attr('height', H)
      svg.selectAll('*').remove()

      // ── Color tokens ────────────────────────────────────────────────────
      const C = {
        bg:       isDark ? '#0f172a' : '#f8fafc',
        panel:    isDark ? '#1e293b' : '#ffffff',
        axis:     isDark ? '#475569' : '#94a3b8',
        label:    isDark ? '#94a3b8' : '#64748b',
        text:     isDark ? '#e2e8f0' : '#1e293b',
        circle:   isDark ? '#475569' : '#94a3b8',
        point:    '#6366f1',       // indigo — the moving point
        vel:      '#eab308',       // yellow — velocity / tangent
        sineLine: '#6366f1',       // indigo — sine curve
        cosLine:  '#ef4444',       // red    — cosine curve
        ghost:    isDark ? 'rgba(148,163,184,0.25)' : 'rgba(100,116,139,0.2)',
        dashed:   isDark ? '#f59e0b' : '#d97706',  // amber dashed link
        arc:      'rgba(99,102,241,0.18)',
      }

      svg.append('rect').attr('width', W).attr('height', H).attr('fill', C.bg)

      // ── Layout ──────────────────────────────────────────────────────────
      const circCX  = W * 0.22
      const circCY  = H * 0.50
      const R       = Math.min(W * 0.17, H * 0.36, 110)

      const gapX    = W * 0.43            // where graphs start
      const graphW  = W - gapX - 16
      const graphH  = H * 0.44
      const sineY0  = H * 0.04
      const cosY0   = H * 0.52

      // ── Arrow markers ───────────────────────────────────────────────────
      const defs = svg.append('defs')
      const mkArrow = (id, color) => {
        defs.append('marker')
          .attr('id', id)
          .attr('viewBox', '0 -4 8 8').attr('refX', 7).attr('refY', 0)
          .attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto')
          .append('path').attr('d', 'M0,-4 L8,0 L0,4').attr('fill', color)
      }
      mkArrow('arr-vel', C.vel)
      mkArrow('arr-ghost', C.ghost)

      // Coordinate helpers for the circle panel
      const cx = v => v * R
      const cy = v => -v * R   // SVG y-axis is flipped

      const cosA = Math.cos(theta)
      const sinA = Math.sin(theta)
      const px = cx(cosA), py = cy(sinA)

      // Velocity direction (perpendicular to radius, CCW): (-sinA, cosA)
      const vScale = 0.72
      const vtx = px + cx(-sinA) * vScale
      const vty = py + cy(cosA)  * vScale

      // ── PANEL A: Unit Circle ─────────────────────────────────────────────
      const gC = svg.append('g').attr('transform', `translate(${circCX},${circCY})`)

      // Axes
      gC.append('line').attr('x1', -R - 12).attr('x2', R + 12).attr('y1', 0).attr('y2', 0).attr('stroke', C.axis).attr('stroke-width', 1)
      gC.append('line').attr('x1', 0).attr('x2', 0).attr('y1', -R - 12).attr('y2', R + 12).attr('stroke', C.axis).attr('stroke-width', 1)

      // Circle
      gC.append('circle').attr('r', R).attr('fill', 'none').attr('stroke', C.circle).attr('stroke-width', 1.5)

      // Angle arc
      const arcPath = d3.arc().innerRadius(0).outerRadius(R * 0.28)
        .startAngle(-Math.PI / 2)          // D3 arc 0 = top; Math 0 = right
        .endAngle(-Math.PI / 2 + theta)
      gC.append('path').attr('d', arcPath).attr('fill', C.arc)
      gC.append('text')
        .attr('x', R * 0.18 * Math.cos(theta / 2) + 5)
        .attr('y', -R * 0.18 * Math.sin(theta / 2) + 4)
        .attr('font-size', 10).attr('fill', C.label).text('θ')

      // Radius line
      gC.append('line').attr('x1', 0).attr('y1', 0).attr('x2', px).attr('y2', py)
        .attr('stroke', C.point).attr('stroke-width', 2)

      // sin x projection (dashed vertical)
      gC.append('line').attr('x1', px).attr('y1', 0).attr('x2', px).attr('y2', py)
        .attr('stroke', C.sineLine).attr('stroke-width', 1).attr('stroke-dasharray', '3 3').attr('opacity', 0.5)
      gC.append('text').attr('x', px > 0 ? px + 4 : px - 4).attr('y', py / 2 + 4)
        .attr('font-size', 9).attr('fill', C.sineLine)
        .attr('text-anchor', px > 0 ? 'start' : 'end').attr('opacity', 0.75).text('sin θ')

      // cos x projection (dashed horizontal)
      gC.append('line').attr('x1', 0).attr('y1', py).attr('x2', px).attr('y2', py)
        .attr('stroke', C.label).attr('stroke-width', 1).attr('stroke-dasharray', '3 3').attr('opacity', 0.4)

      // Velocity vector
      gC.append('line')
        .attr('x1', px).attr('y1', py).attr('x2', vtx).attr('y2', vty)
        .attr('stroke', C.vel).attr('stroke-width', 2.5).attr('marker-end', 'url(#arr-vel)')

      // Moving point
      gC.append('circle').attr('cx', px).attr('cy', py).attr('r', 5).attr('fill', C.point)

      // Label
      gC.append('text').attr('x', 0).attr('y', R + 18).attr('text-anchor', 'middle')
        .attr('font-size', 10).attr('fill', C.label).attr('font-weight', 'bold')
        .text('Unit Circle')

      // ── PANEL B: Sine graph ─────────────────────────────────────────────
      const gS = svg.append('g').attr('transform', `translate(${gapX},${sineY0})`)

      const sX = d3.scaleLinear().domain([0, TAU]).range([0, graphW])
      const sY = d3.scaleLinear().domain([-1.5, 1.5]).range([graphH, 0])

      // Panel background
      gS.append('rect').attr('width', graphW).attr('height', graphH)
        .attr('rx', 4).attr('fill', C.panel).attr('opacity', 0.4)

      // Axes
      gS.append('line').attr('x1', 0).attr('y1', sY(0)).attr('x2', graphW).attr('y2', sY(0))
        .attr('stroke', C.axis).attr('stroke-width', 1)
      gS.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', graphH)
        .attr('stroke', C.axis).attr('stroke-width', 1)

      // π markers on x-axis
      ;[Math.PI / 2, Math.PI, 3 * Math.PI / 2, TAU].forEach((v, i) => {
        const labels = ['π/2', 'π', '3π/2', '2π']
        gS.append('line').attr('x1', sX(v)).attr('x2', sX(v)).attr('y1', sY(0) - 3).attr('y2', sY(0) + 3)
          .attr('stroke', C.axis)
        gS.append('text').attr('x', sX(v)).attr('y', sY(0) + 12)
          .attr('text-anchor', 'middle').attr('font-size', 9).attr('fill', C.label).text(labels[i])
      })

      // Sine curve
      const sineData = d3.range(0, TAU + 0.001, TAU / 180).map(t => [t, Math.sin(t)])
      gS.append('path')
        .attr('fill', 'none').attr('stroke', C.sineLine).attr('stroke-width', 2.5)
        .attr('d', d3.line().x(d => sX(d[0])).y(d => sY(d[1]))(sineData))

      // Tangent line at current theta
      const slope = Math.cos(theta)
      const b = sinA - slope * theta
      const tL = Math.max(0, theta - 1.1)
      const tR = Math.min(TAU, theta + 1.1)
      gS.append('line')
        .attr('x1', sX(tL)).attr('y1', sY(slope * tL + b))
        .attr('x2', sX(tR)).attr('y2', sY(slope * tR + b))
        .attr('stroke', C.vel).attr('stroke-width', 2.5)

      // Current point on sine
      gS.append('circle').attr('cx', sX(theta)).attr('cy', sY(sinA)).attr('r', 5).attr('fill', C.point)

      // Labels
      gS.append('text').attr('x', 6).attr('y', 14)
        .attr('font-size', 10).attr('fill', C.label).attr('font-weight', 'bold')
        .text('y = sin(θ)  [height on circle]')

      const slopeLabelX = Math.min(graphW - 8, sX(theta) + 8)
      gS.append('text').attr('x', slopeLabelX).attr('y', sY(sinA) - 10)
        .attr('font-size', 10).attr('fill', C.vel).attr('font-weight', 'bold')
        .attr('text-anchor', slopeLabelX > graphW * 0.7 ? 'end' : 'start')
        .text(`slope = cos(θ) = ${slope.toFixed(2)}`)

      // ── PANEL C: Cosine graph ─────────────────────────────────────────────
      const gCos = svg.append('g').attr('transform', `translate(${gapX},${cosY0})`)

      const cY = d3.scaleLinear().domain([-1.5, 1.5]).range([graphH, 0])

      // Panel background
      gCos.append('rect').attr('width', graphW).attr('height', graphH)
        .attr('rx', 4).attr('fill', C.panel).attr('opacity', 0.4)

      // Axes
      gCos.append('line').attr('x1', 0).attr('y1', cY(0)).attr('x2', graphW).attr('y2', cY(0))
        .attr('stroke', C.axis).attr('stroke-width', 1)
      gCos.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', graphH)
        .attr('stroke', C.axis).attr('stroke-width', 1)

      // π markers
      ;[Math.PI / 2, Math.PI, 3 * Math.PI / 2, TAU].forEach((v, i) => {
        const labels = ['π/2', 'π', '3π/2', '2π']
        gCos.append('line').attr('x1', sX(v)).attr('x2', sX(v)).attr('y1', cY(0) - 3).attr('y2', cY(0) + 3)
          .attr('stroke', C.axis)
        gCos.append('text').attr('x', sX(v)).attr('y', cY(0) + 12)
          .attr('text-anchor', 'middle').attr('font-size', 9).attr('fill', C.label).text(labels[i])
      })

      // Ghost cosine (faint full curve)
      const cosData = d3.range(0, TAU + 0.001, TAU / 180).map(t => [t, Math.cos(t)])
      gCos.append('path')
        .attr('fill', 'none').attr('stroke', C.cosLine).attr('stroke-width', 1.5).attr('opacity', 0.2)
        .attr('d', d3.line().x(d => sX(d[0])).y(d => cY(d[1]))(cosData))

      // "Painted" trail — only the portion visited so far
      if (theta > 0.001) {
        const paintData = d3.range(0, theta, theta / Math.max(60, theta * 30))
          .concat([theta])
          .map(t => [t, Math.cos(t)])
        gCos.append('path')
          .attr('fill', 'none').attr('stroke', C.cosLine).attr('stroke-width', 3)
          .attr('d', d3.line().x(d => sX(d[0])).y(d => cY(d[1]))(paintData))
      }

      // Current point on cosine
      const cosVal = Math.cos(theta)
      gCos.append('circle').attr('cx', sX(theta)).attr('cy', cY(cosVal)).attr('r', 5).attr('fill', C.cosLine)

      // Labels
      gCos.append('text').attr('x', 6).attr('y', 14)
        .attr('font-size', 10).attr('fill', C.label).attr('font-weight', 'bold')
        .text('y = cos(θ)  [slope value — being painted]')

      const cosLabelX = Math.min(graphW - 8, sX(theta) + 8)
      gCos.append('text').attr('x', cosLabelX).attr('y', cY(cosVal) - 10)
        .attr('font-size', 10).attr('fill', C.cosLine).attr('font-weight', 'bold')
        .attr('text-anchor', cosLabelX > graphW * 0.7 ? 'end' : 'start')
        .text(`cos(θ) = ${cosVal.toFixed(2)}`)

      // ── Dashed link: tangent point → cosine pen ──────────────────────────
      // From bottom of sine panel to top of cosine panel at same θ position
      const linkX = gapX + sX(theta)
      const linkY1 = sineY0 + sY(sinA)
      const linkY2 = cosY0 + cY(cosVal)
      svg.append('line')
        .attr('x1', linkX).attr('y1', linkY1).attr('x2', linkX).attr('y2', linkY2)
        .attr('stroke', C.dashed).attr('stroke-width', 1.5).attr('stroke-dasharray', '5 4').attr('opacity', 0.7)

      svg.append('text')
        .attr('x', linkX + 5).attr('y', (linkY1 + linkY2) / 2)
        .attr('font-size', 9).attr('fill', C.dashed).attr('opacity', 0.9)
        .text('slope pen')

      // ── Special callouts at key angles ──────────────────────────────────
      const t = ((theta % TAU) + TAU) % TAU
      const ring = (g, cx, cy, label, color) => {
        g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 11)
          .attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2)
          .attr('stroke-dasharray', '3 2')
        g.append('text').attr('x', cx + 14).attr('y', cy + 4)
          .attr('font-size', 9).attr('fill', color).text(label)
      }
      const near = (v, eps = 0.18) => Math.abs(t - v) < eps || Math.abs(t - v + TAU) < eps
      if (near(0)) {
        ring(gC, cx(1), cy(0), 'slope = 1', '#10b981')
        ring(gS, sX(0), sY(0), 'slope = 1', '#10b981')
        ring(gCos, sX(0), cY(1), 'cos = 1', '#10b981')
      } else if (near(Math.PI / 2)) {
        ring(gS, sX(Math.PI / 2), sY(1), 'slope = 0', '#10b981')
        ring(gCos, sX(Math.PI / 2), cY(0), 'cos = 0', '#10b981')
      } else if (near(Math.PI)) {
        ring(gS, sX(Math.PI), sY(0), 'slope = −1', '#10b981')
        ring(gCos, sX(Math.PI), cY(-1), 'cos = −1', '#10b981')
      }
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [theta])

  const liveLogic = getLiveLogic(theta)
  const cosVal = Math.cos(theta)
  const sinVal = Math.sin(theta)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-[#0f172a]">

      {/* Header */}
      <div className="px-5 py-4 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
          d/dθ [sin θ] = cos θ — Live Sync
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Three panels, one idea. The <span className="text-indigo-500 font-semibold">indigo</span> point moves around the unit circle.
          Its height traces the <span className="text-indigo-500 font-semibold">sine curve</span> (top right).
          The <span className="text-yellow-500 font-semibold">yellow tangent line</span> shows the instantaneous slope of sine.
          That slope value is plotted in real time below, painting the <span className="text-red-500 font-semibold">cosine curve</span> — proving d/dθ[sin θ] = cos θ by watching it happen.
        </p>
      </div>

      {/* SVG */}
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full" />
      </div>

      {/* Controls */}
      <div className="px-4 py-3 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setPlaying(p => !p)}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors min-w-[130px]"
        >
          {playing ? '⏸ Pause' : '▶ Animate'}
        </button>
        <button
          onClick={() => { setPlaying(false); setTheta(0) }}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors"
        >
          Snap to θ = 0
        </button>
        <div className="flex-1 min-w-[160px]">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>θ (radians)</span>
            <span className="font-mono">{theta.toFixed(2)} = {(theta * 180 / Math.PI).toFixed(0)}°</span>
          </div>
          <input
            type="range" min="0" max={TAU} step="0.01" value={theta}
            onChange={e => { setPlaying(false); setTheta(+e.target.value) }}
            className="w-full accent-indigo-500"
          />
        </div>
      </div>

      {/* Live values row */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-wrap gap-4 text-xs font-mono">
        <span><span className="text-indigo-400">sin(θ)</span> = {sinVal.toFixed(4)}</span>
        <span><span className="text-yellow-400">slope</span> = {Math.cos(theta).toFixed(4)}</span>
        <span><span className="text-red-400">cos(θ)</span> = {cosVal.toFixed(4)}</span>
        <span className="text-slate-400">slope = cos(θ): {Math.abs(Math.cos(theta) - cosVal) < 1e-10 ? '✓ equal' : '?'}</span>
      </div>

      {/* Live logic callout */}
      <div className="px-4 py-3 border-t border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-0.5">What you're seeing</p>
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{liveLogic}</p>
      </div>

      {/* Key observations guide */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Key angles to check</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="rounded border border-slate-100 dark:border-slate-800 p-2">
            <p className="font-semibold text-emerald-500">θ = 0</p>
            <p>sin rising fastest → slope = 1 → cos(0) = 1</p>
          </div>
          <div className="rounded border border-slate-100 dark:border-slate-800 p-2">
            <p className="font-semibold text-emerald-500">θ = π/2</p>
            <p>sin at peak → slope = 0 → cos(π/2) = 0</p>
          </div>
          <div className="rounded border border-slate-100 dark:border-slate-800 p-2">
            <p className="font-semibold text-emerald-500">θ = π</p>
            <p>sin falling fastest → slope = −1 → cos(π) = −1</p>
          </div>
          <div className="rounded border border-slate-100 dark:border-slate-800 p-2">
            <p className="font-semibold text-emerald-500">θ = 3π/2</p>
            <p>sin at trough → slope = 0 → cos(3π/2) = 0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
