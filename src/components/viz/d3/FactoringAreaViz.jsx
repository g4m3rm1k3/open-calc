import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * FactoringAreaViz — complete version
 *
 * Modes (set via params.mode or the tab UI):
 *   'area'   — interactive area model, sliders for a and b (supports negatives)
 *   'proof'  — step-driven visual proof of a²−b² = (a−b)(a+b)
 *              syncs with params.currentStep from the DynamicProof panel
 *
 * Props:
 *   params.mode        'area' | 'proof'   (default 'area')
 *   params.currentStep integer            (used in 'proof' mode)
 *
 * Dark mode: color token object, no hardcoded colors.
 * Responsive: ResizeObserver on containerRef.
 */
export default function FactoringAreaViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [mode, setMode] = useState(params.mode || 'area')
  const [a, setA] = useState(3)
  const [b, setB] = useState(2)

  // ── Color tokens ──────────────────────────────────────────────────────────
  const getC = () => {
    const dark = document.documentElement.classList.contains('dark')
    return {
      bg:     dark ? '#0f172a' : '#f8fafc',
      panel:  dark ? '#1e293b' : '#ffffff',
      border: dark ? '#334155' : '#e2e8f0',
      text:   dark ? '#e2e8f0' : '#1e293b',
      muted:  dark ? '#64748b' : '#94a3b8',
      // tile colours — positive
      x2f:  dark ? '#1e3a5f' : '#dbeafe',  x2s:  dark ? '#3b82f6' : '#2563eb',
      axf:  dark ? '#1a3a2a' : '#dcfce7',  axs:  dark ? '#34d399' : '#059669',
      bxf:  dark ? '#2d1b4a' : '#ede9fe',  bxs:  dark ? '#a78bfa' : '#7c3aed',
      abf:  dark ? '#3d2a0a' : '#fef9c3',  abs:  dark ? '#fbbf24' : '#d97706',
      // negative tile accent
      negf: dark ? '#3d1a1a' : '#fef2f2',  negs: dark ? '#f87171' : '#ef4444',
      // proof colours
      prf_a:   dark ? '#1e3a5f' : '#dbeafe',  prf_as: dark ? '#3b82f6' : '#2563eb',
      prf_cut: dark ? '#1a3a2a' : '#dcfce7',  prf_cs: dark ? '#34d399' : '#059669',
      prf_rot: dark ? '#2d1b4a' : '#ede9fe',  prf_rs: dark ? '#a78bfa' : '#7c3aed',
      prf_fin: dark ? '#3d2a0a' : '#fef9c3',  prf_fs: dark ? '#fbbf24' : '#d97706',
      dashed:  dark ? '#475569' : '#94a3b8',
    }
  }

  // ── Area model drawing ────────────────────────────────────────────────────
  const drawArea = (svg, W, H, C) => {
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', H).style('background', C.bg)

    const absA = Math.abs(a), absB = Math.abs(b)
    const totalSpan = 10 + absA + absB
    const gridSz = Math.min(W * 0.5, H * 0.78)
    const GX = Math.max(28, (W * 0.5 - gridSz) / 2 + 16)
    const GY = 28

    const xW = gridSz * 10 / totalSpan
    const aW = gridSz * absA / totalSpan
    const bW = gridSz * absB / totalSpan
    const xH = gridSz * 10 / totalSpan
    const aH = gridSz * absA / totalSpan
    const bH = gridSz * absB / totalSpan

    const tile = (x, y, w, h, fill, stroke, label) => {
      if (w < 2 || h < 2) return
      svg.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h)
        .attr('fill', fill).attr('stroke', stroke).attr('stroke-width', 1.5).attr('rx', 3)
      if (label && w > 16 && h > 12) {
        const fs = Math.min(Math.min(w, h) * 0.22, 15)
        svg.append('text')
          .attr('x', x + w / 2).attr('y', y + h / 2)
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
          .attr('fill', stroke).attr('font-size', fs).attr('font-weight', 'bold')
          .text(label)
      }
    }

    const dimLabel = (x, y, txt, color, anchor = 'middle') =>
      svg.append('text').attr('x', x).attr('y', y)
        .attr('text-anchor', anchor).attr('dominant-baseline', 'central')
        .attr('fill', color).attr('font-size', 13).attr('font-weight', 'bold').text(txt)

    // top dimension labels
    dimLabel(GX + xW / 2, GY - 10, 'x', C.x2s)
    if (absA > 0) dimLabel(GX + xW + aW / 2, GY - 10, a > 0 ? `+${a}` : `−${absA}`, a > 0 ? C.axs : C.negs)
    if (absB > 0) dimLabel(GX + xW + aW + bW / 2, GY - 10, b > 0 ? `+${b}` : `−${absB}`, b > 0 ? C.bxs : C.negs)

    // left dimension labels
    dimLabel(GX - 10, GY + xH / 2, 'x', C.x2s, 'end')
    if (absA > 0) dimLabel(GX - 10, GY + xH + aH / 2, a > 0 ? `+${a}` : `−${absA}`, a > 0 ? C.axs : C.negs, 'end')
    if (absB > 0) dimLabel(GX - 10, GY + xH + aH + bH / 2, b > 0 ? `+${b}` : `−${absB}`, b > 0 ? C.bxs : C.negs, 'end')

    // x² — always positive
    tile(GX, GY, xW, xH, C.x2f, C.x2s, 'x²')

    // ax tile (top-right first column)
    if (absA > 0) {
      const pos = a >= 0
      tile(GX + xW, GY, aW, xH, pos ? C.axf : C.negf, pos ? C.axs : C.negs, `${pos ? '' : '−'}${absA}x`)
    }
    // bx tile
    if (absB > 0) {
      const pos = b >= 0
      tile(GX + xW + aW, GY, bW, xH, pos ? C.bxf : C.negf, pos ? C.bxs : C.negs, `${pos ? '' : '−'}${absB}x`)
    }
    // ab constant tile (bottom-right block)
    if (absA > 0 || absB > 0) {
      const prod = a * b
      const pos = prod >= 0
      tile(GX + xW, GY + xH, aW + bW, aH + bH, pos ? C.abf : C.negf, pos ? C.abs : C.negs, `${prod}`)
    }

    // ── right panel: algebraic form ──
    const rx = GX + gridSz + 24
    const rw = W - rx - 8
    if (rw < 60) return

    svg.append('rect').attr('x', rx).attr('y', 10).attr('width', rw).attr('height', H - 20)
      .attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

    const mid = rx + rw / 2
    const sum = a + b, prod = a * b

    svg.append('text').attr('x', mid).attr('y', 34).attr('text-anchor', 'middle')
      .attr('fill', C.muted).attr('font-size', 11).text('factored')
    svg.append('text').attr('x', mid).attr('y', 56).attr('text-anchor', 'middle')
      .attr('fill', C.text).attr('font-size', 14).attr('font-weight', 'bold')
      .text(`(x ${a >= 0 ? '+' : '−'} ${absA})(x ${b >= 0 ? '+' : '−'} ${absB})`)

    svg.append('text').attr('x', mid).attr('y', 80).attr('text-anchor', 'middle')
      .attr('fill', C.muted).attr('font-size', 11).text('↕  tiles sum to')

    const termRows = [
      { t: 'x²', c: C.x2s },
      { t: `${sum >= 0 ? '+' : ''}${sum}x`, c: sum >= 0 ? C.axs : C.negs },
      { t: `${prod >= 0 ? '+' : ''}${prod}`, c: prod >= 0 ? C.abs : C.negs },
    ]
    termRows.forEach(({ t, c }, i) => {
      svg.append('text').attr('x', mid).attr('y', 104 + i * 22)
        .attr('text-anchor', 'middle').attr('fill', c).attr('font-size', 15).attr('font-weight', 'bold')
        .text(t)
    })

    svg.append('line')
      .attr('x1', rx + 16).attr('y1', 172).attr('x2', rx + rw - 16).attr('y2', 172)
      .attr('stroke', C.border).attr('stroke-width', 0.5)

    svg.append('text').attr('x', mid).attr('y', 190).attr('text-anchor', 'middle')
      .attr('fill', C.muted).attr('font-size', 11).text('expanded form')
    svg.append('text').attr('x', mid).attr('y', 212).attr('text-anchor', 'middle')
      .attr('fill', C.text).attr('font-size', 14).attr('font-weight', 'bold')
      .text(`x² ${sum >= 0 ? '+' : ''}${sum}x ${prod >= 0 ? '+' : ''}${prod}`)

    svg.append('text').attr('x', mid).attr('y', H - 12).attr('text-anchor', 'middle')
      .attr('fill', C.muted).attr('font-size', 10).text('← factoring reverses this')
  }

  // ── Proof steps: a²−b² = (a−b)(a+b) ─────────────────────────────────────
  const proofSteps = [
    {
      expr: 'Start: square of side a, area = a²',
      ann: 'Draw a large square with side a. Its area is a². We want to prove a²−b² = (a−b)(a+b) — entirely by rearranging this shape.',
      draw: (svg, W, H, C) => {
        const ox = W * 0.12, oy = 24, sz = Math.min(W * 0.56, H - 48)
        rect(svg, ox, oy, sz, sz, C.prf_a, C.prf_as, 'a²', 22)
        dimTop(svg, ox, oy, sz, 0, 'a', C.prf_as)
        dimLeft(svg, ox, oy, sz, 0, 'a', C.prf_as)
      },
    },
    {
      expr: 'Remove a b×b corner — remaining area = a²−b²',
      ann: 'Cut out a small b×b square from one corner. The L-shaped region that remains has area a²−b². We need to show this L-shape equals (a−b)(a+b).',
      draw: (svg, W, H, C) => {
        const ox = W * 0.12, oy = 24, sz = Math.min(W * 0.56, H - 48)
        const bSz = sz * 0.28
        rect(svg, ox, oy, sz, sz, C.prf_a, C.prf_as, '', 0)
        // mask corner with bg
        svg.append('rect').attr('x', ox + sz - bSz).attr('y', oy)
          .attr('width', bSz).attr('height', bSz).attr('fill', C.bg)
        // dashed outline for removed square
        svg.append('rect').attr('x', ox + sz - bSz).attr('y', oy)
          .attr('width', bSz).attr('height', bSz).attr('fill', 'none')
          .attr('stroke', C.negs).attr('stroke-width', 1.5).attr('stroke-dasharray', '5,3').attr('rx', 2)
        svg.append('text').attr('x', ox + sz - bSz / 2).attr('y', oy + bSz / 2)
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
          .attr('fill', C.negs).attr('font-size', 13).attr('font-weight', 'bold').text('b²')
        dimTop(svg, ox, oy, sz - bSz, 0, 'a−b', C.prf_as)
        dimTop(svg, ox + sz - bSz, oy, bSz, 0, 'b', C.negs)
        dimLeft(svg, ox, oy, sz, 0, 'a', C.prf_as)
        // label L-shape area
        svg.append('text').attr('x', ox + (sz - bSz) / 2).attr('y', oy + sz * 0.6)
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
          .attr('fill', C.prf_as).attr('font-size', 18).attr('font-weight', 'bold').text('a²−b²')
      },
    },
    {
      expr: 'Slice the L-shape with a horizontal cut',
      ann: 'Cut the L horizontally at height (a−b). This gives two separate rectangles — a tall one on the left and a short wide one at the bottom.',
      draw: (svg, W, H, C) => {
        const ox = W * 0.12, oy = 24, sz = Math.min(W * 0.56, H - 48)
        const bSz = sz * 0.28, ab = sz - bSz
        // top rectangle: width=(a−b), height=(a−b)   → actually the full left strip
        rect(svg, ox, oy, ab, ab, C.prf_a, C.prf_as, '', 0)
        svg.append('text').attr('x', ox + ab / 2).attr('y', oy + ab / 2)
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
          .attr('fill', C.prf_as).attr('font-size', 13).attr('font-weight', 'bold')
          .text(`(a−b)×(a−b)`)
        // bottom strip: full width (a), height=b
        rect(svg, ox, oy + ab, sz, bSz, C.prf_cut, C.prf_cs, `a × b`, 13)
        dimTop(svg, ox, oy, ab, 0, 'a−b', C.prf_as)
        dimLeft(svg, ox, oy, ab, 0, 'a−b', C.prf_as)
        dimLeft(svg, ox, oy + ab, bSz, 0, 'b', C.prf_cs)
        // cut line
        svg.append('line').attr('x1', ox - 4).attr('y1', oy + ab)
          .attr('x2', ox + sz + 4).attr('y2', oy + ab)
          .attr('stroke', C.prf_cs).attr('stroke-width', 2).attr('stroke-dasharray', '6,3')
      },
    },
    {
      expr: 'Rotate the bottom strip and attach it to the right',
      ann: 'Take the bottom strip (a×b) and rotate it 90°. Its new dimensions are b×a = b wide, (a−b) tall — perfect to attach to the right side of the top rectangle.',
      draw: (svg, W, H, C) => {
        const ox = W * 0.10, oy = 36, sz = Math.min(W * 0.52, H - 60)
        const bSz = sz * 0.28, ab = sz - bSz
        // left block: (a−b) × (a−b)
        rect(svg, ox, oy, ab, ab, C.prf_a, C.prf_as, '', 0)
        svg.append('text').attr('x', ox + ab / 2).attr('y', oy + ab / 2)
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
          .attr('fill', C.prf_as).attr('font-size', 12).attr('font-weight', 'bold').text('(a−b)²')
        // right block: b × (a−b)  [rotated strip]
        rect(svg, ox + ab, oy, bSz, ab, C.prf_rot, C.prf_rs, 'b×(a−b)', 11)
        // outer border of combined rectangle
        svg.append('rect').attr('x', ox).attr('y', oy)
          .attr('width', ab + bSz).attr('height', ab)
          .attr('fill', 'none').attr('stroke', C.prf_fs).attr('stroke-width', 2).attr('rx', 3)
        dimTop(svg, ox, oy, ab + bSz, 0, 'a+b', C.prf_fs)
        dimLeft(svg, ox, oy, ab, 0, 'a−b', C.prf_as)
        // rotation arrow hint
        svg.append('text').attr('x', ox + ab + bSz + 10).attr('y', oy + ab * 0.4)
          .attr('fill', C.prf_rs).attr('font-size', 11).text('↑ rotated strip')
      },
    },
    {
      expr: 'a²−b² = (a−b)(a+b)  ∎',
      ann: 'The L-shape (area a²−b²) became a rectangle with width (a+b) and height (a−b). Area is preserved — rearranging shapes never changes area. The identity is proved without a single line of algebra.',
      draw: (svg, W, H, C) => {
        const ox = W * 0.10, oy = 28, sz = Math.min(W * 0.54, H - 56)
        const bSz = sz * 0.28, ab = sz - bSz
        rect(svg, ox, oy, ab + bSz, ab, C.prf_fin, C.prf_fs, '', 0)
        svg.append('text').attr('x', ox + (ab + bSz) / 2).attr('y', oy + ab / 2)
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
          .attr('fill', C.prf_fs).attr('font-size', 20).attr('font-weight', 'bold').text('(a−b)(a+b)')
        dimTop(svg, ox, oy, ab + bSz, 0, 'a+b', C.prf_fs)
        dimLeft(svg, ox, oy, ab, 0, 'a−b', C.prf_fs)
        svg.append('text').attr('x', ox + (ab + bSz) / 2).attr('y', oy + ab + 22)
          .attr('text-anchor', 'middle').attr('fill', C.prf_fs)
          .attr('font-size', 16).attr('font-weight', 'bold').text('= a² − b²  ∎')
      },
    },
  ]

  const rect = (svg, x, y, w, h, fill, stroke, label, fs) => {
    svg.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h)
      .attr('fill', fill).attr('stroke', stroke).attr('stroke-width', 1.5).attr('rx', 4)
    if (label && w > 20 && h > 14 && fs > 0) {
      svg.append('text').attr('x', x + w / 2).attr('y', y + h / 2)
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
        .attr('fill', stroke).attr('font-size', fs).attr('font-weight', 'bold').text(label)
    }
  }

  const dimTop = (svg, x, y, w, offset, label, color) =>
    svg.append('text').attr('x', x + w / 2).attr('y', y - 8 - offset)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('fill', color).attr('font-size', 12).attr('font-weight', 'bold').text(label)

  const dimLeft = (svg, x, y, h, offset, label, color) =>
    svg.append('text').attr('x', x - 8 - offset).attr('y', y + h / 2)
      .attr('text-anchor', 'end').attr('dominant-baseline', 'central')
      .attr('fill', color).attr('font-size', 12).attr('font-weight', 'bold').text(label)

  const drawProof = (svg, W, H, C, step) => {
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', H).style('background', C.bg)
    const s = Math.max(0, Math.min(proofSteps.length - 1, step))
    proofSteps[s].draw(svg, W, H, C)
  }

  // ── Main draw loop ────────────────────────────────────────────────────────
  useEffect(() => {
    const draw = () => {
      const C = getC()
      const W = containerRef.current?.clientWidth || 540
      const H = mode === 'proof' ? Math.round(W * 0.52) : Math.round(W * 0.58)
      const svg = d3.select(svgRef.current)

      if (mode === 'proof') {
        drawProof(svg, W, H, C, params.currentStep ?? 0)
      } else {
        drawArea(svg, W, H, C)
      }
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [mode, a, b, params.currentStep])

  // ── UI ────────────────────────────────────────────────────────────────────
  const btnBase = {
    padding: '5px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
    border: '0.5px solid var(--color-border-secondary)', fontWeight: 500,
  }
  const activeBtn = { ...btnBase, background: 'var(--color-background-info)', color: 'var(--color-text-info)', borderColor: 'var(--color-border-info)' }
  const inactiveBtn = { ...btnBase, background: 'transparent', color: 'var(--color-text-secondary)' }

  const step = Math.max(0, Math.min(proofSteps.length - 1, params.currentStep ?? 0))

  return (
    <div ref={containerRef} className="w-full">
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button style={mode === 'area' ? activeBtn : inactiveBtn} onClick={() => setMode('area')}>
          Area model
        </button>
        <button style={mode === 'proof' ? activeBtn : inactiveBtn} onClick={() => setMode('proof')}>
          Visual proof (diff. of squares)
        </button>
      </div>

      <svg ref={svgRef} className="w-full" />

      {/* Area mode controls */}
      {mode === 'area' && (
        <div style={{ padding: '10px 2px 0' }}>
          {[
            { label: 'a', val: a, set: setA, color: '#fbbf24' },
            { label: 'b', val: b, set: setB, color: '#a78bfa' },
          ].map(({ label, val, set, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 'bold', color, minWidth: 60 }}>
                {label} = {val}
              </span>
              <input type="range" min={-6} max={8} step={1} value={val}
                onChange={e => set(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: color }} />
            </div>
          ))}
          <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '4px 0 0', lineHeight: 1.5 }}>
            Drag into negative values — red tiles show negative terms. The colour of each tile
            matches its sign. Factoring means finding a and b given the expanded form.
          </p>
        </div>
      )}

      {/* Proof mode annotation */}
      {mode === 'proof' && (
        <div style={{
          marginTop: 10, padding: '10px 14px',
          background: 'var(--color-background-secondary)',
          borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            {proofSteps[step].expr}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            {proofSteps[step].ann}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 6 }}>
            Step {step + 1} of {proofSteps.length} — use the proof panel's Next Step button, or switch to Area model tab
          </div>
        </div>
      )}
    </div>
  )
}
