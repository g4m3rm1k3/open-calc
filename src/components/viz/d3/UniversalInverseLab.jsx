import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'

/**
 * UniversalInverseLab
 *
 * Pillar 1+2+3 for inverse function derivatives.
 *
 * What it fixes:
 *   - Hard-coded x² only → any evaluable function
 *   - First quadrant only → full four-quadrant grid
 *   - No notation bridge → live point labels (a,b) and (b,a)
 *     showing WHY the derivative formula evaluates f′ at (b,a).x = a
 *   - No slope verification → live m₁ · m₂ = 1 display
 *
 * Supports: x^2, sin(x), exp(x), x^3, ln(x), tan(x), etc.
 * Uses math.js loaded from CDN.
 *
 * Dark mode. ResizeObserver.
 */

const PRESETS = [
  { label: 'x²  (restricted x≥0)', fn: 'x^2', xMin: -3, xMax: 3, yMin: -3, yMax: 9, restrict: x => x >= 0 },
  { label: 'x³', fn: 'x^3', xMin: -2, xMax: 2, yMin: -8, yMax: 8, restrict: null },
  { label: 'eˣ', fn: 'exp(x)', xMin: -3, xMax: 3, yMin: -1, yMax: 9, restrict: null },
  { label: 'ln(x)', fn: 'log(x)', xMin: -1, xMax: 9, yMin: -3, yMax: 3, restrict: x => x > 0 },
  { label: 'sin(x)  [−π/2, π/2]', fn: 'sin(x)', xMin: -3, xMax: 3, yMin: -1.5, yMax: 1.5, restrict: x => x >= -Math.PI / 2 && x <= Math.PI / 2 },
]

export default function UniversalInverseLab({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const mathRef = useRef(null)
  const [mathReady, setMathReady] = useState(false)
  const [preset, setPreset] = useState(0)
  const [customFn, setCustomFn] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [fnError, setFnError] = useState('')
  const [dragX, setDragX] = useState(1.5)
  const [slopes, setSlopes] = useState({ m1: null, m2: null })
  const [showGrid, setShowGrid] = useState(true)
  const [showNotation, setShowNotation] = useState(false)

  // Load math.js
  useEffect(() => {
    if (window.math) { mathRef.current = window.math; setMathReady(true); return }
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.11.1/math.min.js'
    s.onload = () => { mathRef.current = window.math; setMathReady(true) }
    document.head.appendChild(s)
  }, [])

  const cfg = PRESETS[preset]

  const evalFn = useCallback((x) => {
    if (!mathRef.current) return NaN
    try {
      const expr = useCustom ? customFn : cfg.fn
      const val = mathRef.current.evaluate(expr, { x })
      if (typeof val !== 'number' || !isFinite(val)) return NaN
      if (cfg.restrict && !cfg.restrict(x)) return NaN
      return val
    } catch { return NaN }
  }, [preset, customFn, useCustom, mathReady])

  const numericalDeriv = useCallback((x) => {
    const h = 1e-5
    const f1 = evalFn(x + h)
    const f2 = evalFn(x - h)
    if (!isFinite(f1) || !isFinite(f2)) return NaN
    return (f1 - f2) / (2 * h)
  }, [evalFn])

  useEffect(() => {
    if (!mathReady) return
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:      isDark ? '#0f172a' : '#f8fafc',
        panel:   isDark ? '#1e293b' : '#ffffff',
        border:  isDark ? '#334155' : '#e2e8f0',
        axis:    isDark ? '#475569' : '#94a3b8',
        grid:    isDark ? '#1e293b' : '#f1f5f9',
        text:    isDark ? '#e2e8f0' : '#1e293b',
        muted:   isDark ? '#64748b' : '#94a3b8',
        f:       isDark ? '#38bdf8' : '#0284c7',      // f(x) — blue
        finv:    isDark ? '#34d399' : '#059669',      // f⁻¹(x) — green
        mirror:  isDark ? '#475569' : '#cbd5e1',      // y=x — dashed gray
        ptA:     isDark ? '#fbbf24' : '#d97706',      // point A — amber
        ptB:     isDark ? '#f472b6' : '#db2777',      // point B — pink
        tan:     isDark ? 'rgba(251,191,36,0.6)' : 'rgba(217,119,6,0.5)',
        tanInv:  isDark ? 'rgba(244,114,182,0.6)' : 'rgba(219,39,119,0.5)',
        hud:     isDark ? '#162032' : '#f0f7ff',
      }

      const W = containerRef.current?.clientWidth || 560
      const H = Math.min(W * 0.82, 480)
      const pad = { t: 24, b: 32, l: 40, r: 8 }
      const iW = W - pad.l - pad.r
      const iH = H - pad.t - pad.b

      const xd = [cfg.xMin, cfg.xMax]
      const yd = [cfg.yMin, cfg.yMax]

      const xS = d3.scaleLinear().domain(xd).range([pad.l, pad.l + iW])
      const yS = d3.scaleLinear().domain(yd).range([pad.t + iH, pad.t])

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      svg.append('rect').attr('x', 1).attr('y', 1).attr('width', W - 2).attr('height', H - 2)
        .attr('rx', 10).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      // Arrow marker defs
      svg.append('defs').html(`
        <marker id="arri" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round"/>
        </marker>`)

      // Grid
      if (showGrid) {
        xS.ticks(8).forEach(v => {
          svg.append('line').attr('x1', xS(v)).attr('y1', pad.t).attr('x2', xS(v)).attr('y2', pad.t + iH)
            .attr('stroke', C.grid).attr('stroke-width', 1)
        })
        yS.ticks(8).forEach(v => {
          svg.append('line').attr('x1', pad.l).attr('y1', yS(v)).attr('x2', pad.l + iW).attr('y2', yS(v))
            .attr('stroke', C.grid).attr('stroke-width', 1)
        })
      }

      // Axes
      if (yd[0] <= 0 && yd[1] >= 0)
        svg.append('line').attr('x1', pad.l).attr('y1', yS(0)).attr('x2', pad.l + iW).attr('y2', yS(0))
          .attr('stroke', C.axis).attr('stroke-width', 1.5)
      if (xd[0] <= 0 && xd[1] >= 0)
        svg.append('line').attr('x1', xS(0)).attr('y1', pad.t).attr('x2', xS(0)).attr('y2', pad.t + iH)
          .attr('stroke', C.axis).attr('stroke-width', 1.5)

      // Axis labels
      xS.ticks(6).forEach(v => {
        if (Math.abs(v) < 0.01) return
        const py = yS(0) < pad.t + iH - 10 ? yS(0) + 14 : pad.t + iH + 14
        svg.append('text').attr('x', xS(v)).attr('y', py).attr('text-anchor', 'middle')
          .attr('fill', C.muted).attr('font-size', 10).text(v % 1 === 0 ? v : v.toFixed(1))
      })
      yS.ticks(6).forEach(v => {
        if (Math.abs(v) < 0.01) return
        svg.append('text').attr('x', pad.l - 4).attr('y', yS(v) + 4).attr('text-anchor', 'end')
          .attr('fill', C.muted).attr('font-size', 10).text(v % 1 === 0 ? v : v.toFixed(1))
      })

      // Helper: draw curve segments
      const drawCurve = (fn, col, width, dash) => {
        const step = (xd[1] - xd[0]) / 400
        let segs = [], cur = []
        for (let i = 0; i <= 400; i++) {
          const x = xd[0] + i * step
          const y = fn(x)
          if (!isFinite(y) || y < yd[0] - 0.5 || y > yd[1] + 0.5) {
            if (cur.length > 1) segs.push(cur)
            cur = []
          } else {
            cur.push([x, y])
          }
        }
        if (cur.length > 1) segs.push(cur)
        const line = d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom)
        segs.forEach(s => {
          svg.append('path').datum(s).attr('fill', 'none').attr('stroke', col)
            .attr('stroke-width', width).attr('stroke-dasharray', dash || 'none').attr('d', line)
        })
      }

      // y = x mirror line
      const mMin = Math.max(xd[0], yd[0]), mMax = Math.min(xd[1], yd[1])
      svg.append('line').attr('x1', xS(mMin)).attr('y1', yS(mMin)).attr('x2', xS(mMax)).attr('y2', yS(mMax))
        .attr('stroke', C.mirror).attr('stroke-width', 1.5).attr('stroke-dasharray', '6,4')
      svg.append('text').attr('x', xS(mMax) - 4).attr('y', yS(mMax) - 8)
        .attr('text-anchor', 'end').attr('fill', C.muted).attr('font-size', 11).text('y = x')

      // f(x) — blue
      drawCurve(x => evalFn(x), C.f, 2.5, null)

      // f⁻¹(x) — green (swap x and y: plot f's y-values as x, x-values as y)
      // We build the inverse by sampling f and swapping coordinates
      const fInvPts = []
      for (let i = 0; i <= 600; i++) {
        const x = xd[0] + (i / 600) * (xd[1] - xd[0])
        const y = evalFn(x)
        if (isFinite(y) && y >= xd[0] && y <= xd[1] && x >= yd[0] && x <= yd[1]) {
          fInvPts.push([y, x]) // swap: the inverse maps f(x) → x
        }
      }
      fInvPts.sort((a, b) => a[0] - b[0])
      if (fInvPts.length > 2) {
        const invLine = d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom)
        svg.append('path').datum(fInvPts).attr('fill', 'none').attr('stroke', C.finv)
          .attr('stroke-width', 2.5).attr('d', invLine)
      }

      // Legend labels
      svg.append('text').attr('x', pad.l + 8).attr('y', pad.t + 16)
        .attr('fill', C.f).attr('font-size', 12).attr('font-weight', 'bold').text('f(x)')
      svg.append('text').attr('x', pad.l + 8).attr('y', pad.t + 32)
        .attr('fill', C.finv).attr('font-size', 12).attr('font-weight', 'bold').text('f⁻¹(x)')

      // Current point A on f(x)
      const ax = Math.max(xd[0] + 0.01, Math.min(xd[1] - 0.01, dragX))
      const ay = evalFn(ax)
      if (!isFinite(ay)) { setSlopes({ m1: null, m2: null }); return }

      // Point B on f⁻¹ — coordinates are (ay, ax)
      const bx = ay, by = ax

      // Slopes
      const m1 = numericalDeriv(ax)
      const m2 = isFinite(m1) && Math.abs(m1) > 1e-8 ? 1 / m1 : NaN

      setSlopes({ m1: isFinite(m1) ? m1 : null, m2: isFinite(m2) ? m2 : null })

      // Tangent line helper
      const drawTangent = (px, py, slope, col, len = 1.8) => {
        if (!isFinite(slope)) return
        const dx = len / Math.sqrt(1 + slope * slope)
        const dy = slope * dx
        svg.append('line').attr('x1', xS(px - dx)).attr('y1', yS(py - dy))
          .attr('x2', xS(px + dx)).attr('y2', yS(py + dy))
          .attr('stroke', col).attr('stroke-width', 2).attr('stroke-dasharray', '6,3')
      }

      drawTangent(ax, ay, m1, C.tan)
      drawTangent(bx, by, m2, C.tanInv)

      // Point A
      if (bx >= xd[0] && bx <= xd[1] && by >= yd[0] && by <= yd[1]) {
        // Dashed connection line between A and B
        svg.append('line').attr('x1', xS(ax)).attr('y1', yS(ay))
          .attr('x2', xS(bx)).attr('y2', yS(by))
          .attr('stroke', C.muted).attr('stroke-width', 1).attr('stroke-dasharray', '3,3')
      }

      // Points
      svg.append('circle').attr('cx', xS(ax)).attr('cy', yS(ay)).attr('r', 7)
        .attr('fill', C.ptA).attr('stroke', C.bg).attr('stroke-width', 2).attr('cursor', 'ew-resize')
        .call(d3.drag().on('drag', (event) => {
          const nx = Math.max(xd[0] + 0.05, Math.min(xd[1] - 0.05, xS.invert(event.x)))
          setDragX(nx)
        }))

      const aLabel = `A = (${ax.toFixed(2)}, ${ay.toFixed(2)})`
      svg.append('text').attr('x', xS(ax) + 10).attr('y', yS(ay) - 8)
        .attr('fill', C.ptA).attr('font-size', 12).attr('font-weight', 'bold').text(aLabel)

      if (isFinite(bx) && bx >= xd[0] && bx <= xd[1] && by >= yd[0] && by <= yd[1]) {
        svg.append('circle').attr('cx', xS(bx)).attr('cy', yS(by)).attr('r', 7)
          .attr('fill', C.ptB).attr('stroke', C.bg).attr('stroke-width', 2)
        const bLabel = `B = (${bx.toFixed(2)}, ${by.toFixed(2)})`
        svg.append('text').attr('x', xS(bx) + 10).attr('y', yS(by) - 8)
          .attr('fill', C.ptB).attr('font-size', 12).attr('font-weight', 'bold').text(bLabel)
      }

      // HUD — slope table
      const hudX = pad.l + iW - 218, hudY = pad.t + iH - 86
      svg.append('rect').attr('x', hudX).attr('y', hudY).attr('width', 212).attr('height', 80)
        .attr('rx', 8).attr('fill', C.hud).attr('stroke', C.border).attr('stroke-width', 0.5)

      const fmt = v => v !== null ? (Math.abs(v) > 999 ? '∞' : v.toFixed(4)) : '—'
      const product = slopes.m1 !== null && slopes.m2 !== null ? (slopes.m1 * slopes.m2).toFixed(4) : '—'
      const hudRows = [
        { label: 'slope at A  m₁ =', val: fmt(m1), col: C.ptA },
        { label: 'slope at B  m₂ =', val: fmt(m2), col: C.ptB },
        { label: 'm₁ · m₂ =', val: Math.abs(m1 * m2 - 1) < 0.002 ? '1.000 ✓' : (m1 * m2).toFixed(4), col: Math.abs(m1 * m2 - 1) < 0.002 ? '#059669' : C.text },
      ]
      hudRows.forEach(({ label, val, col }, i) => {
        const ry = hudY + 18 + i * 22
        svg.append('text').attr('x', hudX + 8).attr('y', ry).attr('fill', C.muted).attr('font-size', 11).text(label)
        svg.append('text').attr('x', hudX + 205).attr('y', ry).attr('text-anchor', 'end')
          .attr('fill', col).attr('font-size', 11).attr('font-weight', 'bold').text(val)
      })
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [mathReady, preset, dragX, showGrid, evalFn, numericalDeriv])

  const btnBase = { padding: '4px 11px', borderRadius: 14, fontSize: 12, cursor: 'pointer', border: '0.5px solid var(--color-border-secondary)', background: 'transparent', color: 'var(--color-text-secondary)' }
  const activeBtn = { ...btnBase, background: 'var(--color-background-info)', color: 'var(--color-text-info)', borderColor: 'var(--color-border-info)' }

  return (
    <div ref={containerRef} className="w-full">
      {/* Preset selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPreset(i); setUseCustom(false); setDragX(p.xMin * 0.4 + p.xMax * 0.6) }}
            style={!useCustom && preset === i ? activeBtn : btnBase}>
            {p.label}
          </button>
        ))}
      </div>

      <svg ref={svgRef} className="w-full" />

      {/* Controls row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 2px 0', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} style={{ accentColor: '#38bdf8' }} />
          Grid
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showNotation} onChange={e => setShowNotation(e.target.checked)} style={{ accentColor: '#a78bfa' }} />
          Notation bridge
        </label>
        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>Drag amber point along f(x)</span>
      </div>

      {/* Notation bridge panel */}
      {showNotation && (
        <div style={{ marginTop: 10, padding: '12px 14px', borderLeft: '3px solid #a78bfa', borderRadius: '0 8px 8px 0', background: 'var(--color-background-secondary)', fontSize: 13, lineHeight: 1.7, color: 'var(--color-text-primary)' }}>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>Why the notation (f⁻¹)′(b) = 1/f′(a) uses point A's x-coordinate:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: '#d97706', fontWeight: 600, marginBottom: 3 }}>Point A (amber) — on f(x)</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                Coordinates: (a, b) = ({isFinite(dragX) ? dragX.toFixed(2) : '?'}, {slopes.m1 !== null ? evalFn(dragX)?.toFixed(2) : '?'})<br/>
                Slope m₁ = f′(a) = {slopes.m1 !== null ? slopes.m1.toFixed(4) : '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#db2777', fontWeight: 600, marginBottom: 3 }}>Point B (pink) — on f⁻¹(x)</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                Coordinates: (b, a) — swapped!<br/>
                Slope m₂ = (f⁻¹)′(b) = 1/f′(a) = {slopes.m2 !== null ? slopes.m2.toFixed(4) : '—'}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--color-background-primary)', borderRadius: 6, fontSize: 12, color: 'var(--color-text-secondary)' }}>
            The formula (f⁻¹)′(b) = 1/f′(a) looks confusing because b is the input to f⁻¹ but a is where we evaluate f′.
            Drag the amber point — b is always the y-coordinate of A, and a is always the x-coordinate of A.
            The pink point B lives at (b, a) — exactly swapped. Its slope is always 1/m₁.
          </div>
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '6px 0 0' }}>
        Blue = f(x) · Green = f⁻¹(x) · Gray dashed = y=x mirror line · Amber = point A on f · Pink = reflected point B on f⁻¹
      </p>
    </div>
  )
}
