import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * ChainRuleCompositionViz — Viz 1: "What composition actually means"
 *
 * Shows two function machines side by side:
 *   x → [inner g] → u=g(x) → [outer f] → y=f(g(x))
 *
 * A slider moves x. All three values update live.
 * Beneath: the chain rule assembled in Leibniz notation with each factor highlighted.
 * Dropdown of preset compositions: sin(x³), e^(x²), ln(cos x), (x²+1)⁵, cos(e^x).
 *
 * Dark mode. ResizeObserver.
 */
export default function ChainRuleCompositionViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [preset, setPreset] = useState('sinCube')
  const [x, setX] = useState(1.0)

  const presets = {
    sinCube: {
      label: 'sin(x³)',
      inner: x => x ** 3,
      outer: u => Math.sin(u),
      innerDeriv: x => 3 * x ** 2,
      outerDeriv: u => Math.cos(u),
      innerLabel: 'g(x) = x³',
      outerLabel: 'f(u) = sin(u)',
      innerDerivLabel: "g'(x) = 3x²",
      outerDerivLabel: "f'(u) = cos(u)",
      composedLabel: 'h(x) = sin(x³)',
      chainLabel: "h'(x) = cos(x³) · 3x²",
      xDom: [-2, 2],
    },
    expSq: {
      label: 'e^(x²)',
      inner: x => x ** 2,
      outer: u => Math.exp(u),
      innerDeriv: x => 2 * x,
      outerDeriv: u => Math.exp(u),
      innerLabel: 'g(x) = x²',
      outerLabel: 'f(u) = eᵘ',
      innerDerivLabel: "g'(x) = 2x",
      outerDerivLabel: "f'(u) = eᵘ",
      composedLabel: 'h(x) = e^(x²)',
      chainLabel: "h'(x) = e^(x²) · 2x",
      xDom: [-1.5, 1.5],
    },
    lnCos: {
      label: 'ln(cos x)',
      inner: x => Math.cos(x),
      outer: u => u > 0 ? Math.log(u) : NaN,
      innerDeriv: x => -Math.sin(x),
      outerDeriv: u => u > 0 ? 1 / u : NaN,
      innerLabel: 'g(x) = cos(x)',
      outerLabel: 'f(u) = ln(u)',
      innerDerivLabel: "g'(x) = −sin(x)",
      outerDerivLabel: "f'(u) = 1/u",
      composedLabel: 'h(x) = ln(cos x)',
      chainLabel: "h'(x) = (1/cos x)·(−sin x) = −tan x",
      xDom: [-1.3, 1.3],
    },
    poly5: {
      label: '(x²+1)⁵',
      inner: x => x ** 2 + 1,
      outer: u => u ** 5,
      innerDeriv: x => 2 * x,
      outerDeriv: u => 5 * u ** 4,
      innerLabel: 'g(x) = x²+1',
      outerLabel: 'f(u) = u⁵',
      innerDerivLabel: "g'(x) = 2x",
      outerDerivLabel: "f'(u) = 5u⁴",
      composedLabel: 'h(x) = (x²+1)⁵',
      chainLabel: "h'(x) = 5(x²+1)⁴ · 2x",
      xDom: [-2, 2],
    },
    cosExp: {
      label: 'cos(eˣ)',
      inner: x => Math.exp(x),
      outer: u => Math.cos(u),
      innerDeriv: x => Math.exp(x),
      outerDeriv: u => -Math.sin(u),
      innerLabel: 'g(x) = eˣ',
      outerLabel: 'f(u) = cos(u)',
      innerDerivLabel: "g'(x) = eˣ",
      outerDerivLabel: "f'(u) = −sin(u)",
      composedLabel: 'h(x) = cos(eˣ)',
      chainLabel: "h'(x) = −sin(eˣ) · eˣ",
      xDom: [-1.5, 1.5],
    },
  }

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:      isDark ? '#0f172a' : '#f8fafc',
        panel:   isDark ? '#1e293b' : '#ffffff',
        border:  isDark ? '#334155' : '#e2e8f0',
        text:    isDark ? '#e2e8f0' : '#1e293b',
        muted:   isDark ? '#64748b' : '#94a3b8',
        inner:   isDark ? '#38bdf8' : '#0284c7',
        innerFill: isDark ? '#0c2a3f' : '#e6f4fb',
        outer:   isDark ? '#f472b6' : '#db2777',
        outerFill: isDark ? '#3d0a1f' : '#fce7f0',
        arrow:   isDark ? '#fbbf24' : '#d97706',
        chain:   isDark ? '#34d399' : '#059669',
        chainFill: isDark ? '#0a2a1e' : '#e6f9f2',
        x:       isDark ? '#a78bfa' : '#7c3aed',
        u:       isDark ? '#38bdf8' : '#0284c7',
        y:       isDark ? '#f472b6' : '#db2777',
      }

      const p = presets[preset]
      const W = containerRef.current?.clientWidth || 560
      const H = Math.round(W * 0.72)
      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      const u = p.inner(x)
      const y = p.outer(u)
      const gPrime = p.innerDeriv(x)
      const fPrimeAtU = p.outerDeriv(u)
      const hPrime = fPrimeAtU * gPrime

      const valid = isFinite(u) && isFinite(y) && isFinite(gPrime) && isFinite(fPrimeAtU)

      // ── Layout: three boxes + two arrows ────────────────────────────────
      const boxW = W * 0.22, boxH = 90
      const y0 = 32
      const xBox  = W * 0.04
      const gBox  = W * 0.32
      const fBox  = W * 0.62
      const arrowY = y0 + boxH / 2

      // Helper: rounded box with title + value
      const drawBox = (bx, by, bw, bh, title, val, subval, borderCol, fillCol) => {
        svg.append('rect').attr('x', bx).attr('y', by).attr('width', bw).attr('height', bh).attr('rx', 10)
          .attr('fill', fillCol).attr('stroke', borderCol).attr('stroke-width', 2)
        svg.append('text').attr('x', bx + bw / 2).attr('y', by + 18).attr('text-anchor', 'middle')
          .attr('fill', borderCol).attr('font-size', 12).attr('font-weight', 'bold').text(title)
        svg.append('text').attr('x', bx + bw / 2).attr('y', by + 44).attr('text-anchor', 'middle')
          .attr('fill', C.text).attr('font-size', 20).attr('font-weight', 'bold')
          .text(val)
        if (subval) {
          svg.append('text').attr('x', bx + bw / 2).attr('y', by + 66).attr('text-anchor', 'middle')
            .attr('fill', C.muted).attr('font-size', 11).text(subval)
        }
      }

      // Helper: arrow with label
      const drawArrow = (x1, y1, x2, y2, label, col) => {
        svg.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2 - 8).attr('y2', y2)
          .attr('stroke', col).attr('stroke-width', 2.5).attr('marker-end', 'url(#arr)')
        if (label) {
          svg.append('text').attr('x', (x1 + x2) / 2).attr('y', y1 - 8)
            .attr('text-anchor', 'middle').attr('fill', col).attr('font-size', 12).attr('font-weight', 'bold')
            .text(label)
        }
      }

      svg.append('defs').html(`<marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="${C.arrow}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker>`)

      // x input box
      drawBox(xBox, y0, boxW, boxH, 'Input x', x.toFixed(3), '', C.x, isDark ? '#1e0a3d' : '#f3eeff')

      // Arrow x → g
      drawArrow(xBox + boxW, arrowY, gBox, arrowY, '', C.arrow)

      // g(x) machine box
      drawBox(gBox, y0, boxW * 1.1, boxH, p.innerLabel, isFinite(u) ? u.toFixed(3) : '—', 'inner function', C.inner, C.innerFill)

      // Arrow g → f
      drawArrow(gBox + boxW * 1.1, arrowY, fBox, arrowY, 'u = g(x)', C.arrow)

      // f(u) machine box
      drawBox(fBox, y0, boxW * 1.1, boxH, p.outerLabel, isFinite(y) ? y.toFixed(3) : '—', 'outer function', C.outer, C.outerFill)

      // Output label
      svg.append('text').attr('x', fBox + boxW * 1.1 + 10).attr('y', arrowY + 6)
        .attr('fill', C.outer).attr('font-size', 13).attr('font-weight', 'bold').text('→ y')

      // ── Derivative assembly ─────────────────────────────────────────────
      const d0 = y0 + boxH + 28

      svg.append('rect').attr('x', W * 0.03).attr('y', d0).attr('width', W * 0.94).attr('height', 130)
        .attr('rx', 10).attr('fill', C.chainFill).attr('stroke', C.chain).attr('stroke-width', 1.5)

      svg.append('text').attr('x', W / 2).attr('y', d0 + 20).attr('text-anchor', 'middle')
        .attr('fill', C.chain).attr('font-size', 13).attr('font-weight', 'bold').text('Chain Rule: h\'(x) = f\'(g(x)) · g\'(x)')

      // Three derivative boxes
      const dBoxW = W * 0.27, dBoxH = 52, dY = d0 + 34
      const d1x = W * 0.04, d2x = W * 0.38, d3x = W * 0.70

      const drawDBox = (bx, by, label, val, numVal, col) => {
        svg.append('rect').attr('x', bx).attr('y', by).attr('width', dBoxW).attr('height', dBoxH)
          .attr('rx', 8).attr('fill', C.panel).attr('stroke', col).attr('stroke-width', 1.5)
        svg.append('text').attr('x', bx + dBoxW / 2).attr('y', by + 16).attr('text-anchor', 'middle')
          .attr('fill', C.muted).attr('font-size', 11).text(label)
        svg.append('text').attr('x', bx + dBoxW / 2).attr('y', by + 34).attr('text-anchor', 'middle')
          .attr('fill', col).attr('font-size', 13).attr('font-weight', 'bold').text(val)
        if (isFinite(numVal)) {
          svg.append('text').attr('x', bx + dBoxW / 2).attr('y', by + 48).attr('text-anchor', 'middle')
            .attr('fill', C.muted).attr('font-size', 10).text(`= ${numVal.toFixed(4)}`)
        }
      }

      drawDBox(d1x, dY, "f'(g(x)) — outer deriv at inner", p.outerDerivLabel.replace('u', 'g(x)'), fPrimeAtU, C.outer)

      // × symbol
      svg.append('text').attr('x', d2x - 14).attr('y', dY + dBoxH / 2 + 6)
        .attr('text-anchor', 'middle').attr('fill', C.arrow).attr('font-size', 20).attr('font-weight', 'bold').text('×')

      drawDBox(d2x, dY, "g'(x) — inner derivative", p.innerDerivLabel, gPrime, C.inner)

      // = symbol
      svg.append('text').attr('x', d3x - 14).attr('y', dY + dBoxH / 2 + 6)
        .attr('text-anchor', 'middle').attr('fill', C.arrow).attr('font-size', 20).attr('font-weight', 'bold').text('=')

      drawDBox(d3x, dY, "h'(x) — chain rule result", p.chainLabel, hPrime, C.chain)

      // ── Leibniz form ────────────────────────────────────────────────────
      const lY = d0 + 130 + 12
      svg.append('text').attr('x', W / 2).attr('y', lY + 16).attr('text-anchor', 'middle')
        .attr('fill', C.muted).attr('font-size', 12)
        .text(`Leibniz: dy/dx = (dy/du)·(du/dx)  =  ${isFinite(fPrimeAtU) ? fPrimeAtU.toFixed(3) : '?'}  ×  ${isFinite(gPrime) ? gPrime.toFixed(3) : '?'}  =  ${isFinite(hPrime) ? hPrime.toFixed(3) : '?'}`)

      // ── Graph panels ────────────────────────────────────────────────────
      const gY = lY + 32
      const gH = H - gY - 8
      if (gH < 60) return

      const panW = (W - 24) / 3, panH = gH
      const pPad = { t: 18, b: 8, l: 24, r: 6 }

      const drawMiniGraph = (offsetX, fn, xd, col, title, curX, curY) => {
        const ys = d3.range(xd[0], xd[1], 0.05).map(xx => fn(xx)).filter(isFinite)
        if (ys.length === 0) return
        const yd = [Math.min(...ys) - 0.5, Math.max(...ys) + 0.5]
        const xs = d3.scaleLinear().domain(xd).range([offsetX + pPad.l, offsetX + panW - pPad.r])
        const ySc = d3.scaleLinear().domain(yd).range([gY + panH - pPad.b, gY + pPad.t])

        svg.append('rect').attr('x', offsetX + 1).attr('y', gY).attr('width', panW - 2).attr('height', panH)
          .attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)
        svg.append('text').attr('x', offsetX + panW / 2).attr('y', gY + 13).attr('text-anchor', 'middle')
          .attr('fill', col).attr('font-size', 11).attr('font-weight', 'bold').text(title)

        // Zero lines
        if (yd[0] <= 0 && yd[1] >= 0)
          svg.append('line').attr('x1', offsetX + pPad.l).attr('y1', ySc(0)).attr('x2', offsetX + panW - pPad.r).attr('y2', ySc(0)).attr('stroke', C.muted).attr('stroke-width', 1)

        const data = d3.range(xd[0], xd[1], 0.04).map(xx => ({ x: xx, y: fn(xx) })).filter(d => isFinite(d.y))
        const line = d3.line().x(d => xs(d.x)).y(d => ySc(d.y)).curve(d3.curveCatmullRom).defined(d => isFinite(d.y))
        svg.append('path').datum(data).attr('fill', 'none').attr('stroke', col).attr('stroke-width', 2).attr('d', line)

        if (isFinite(curX) && isFinite(curY) && curY >= yd[0] && curY <= yd[1]) {
          svg.append('circle').attr('cx', xs(curX)).attr('cy', ySc(curY)).attr('r', 5)
            .attr('fill', col).attr('stroke', C.bg).attr('stroke-width', 2)
          svg.append('line').attr('x1', xs(curX)).attr('y1', gY + pPad.t).attr('x2', xs(curX)).attr('y2', gY + panH - pPad.b)
            .attr('stroke', col).attr('stroke-width', 1).attr('stroke-dasharray', '3,3').attr('opacity', 0.5)
        }
      }

      const xd = p.xDom
      drawMiniGraph(0,          t => p.inner(t),       xd, C.inner, p.innerLabel, x, u)
      drawMiniGraph(panW + 8,   t => p.outer(p.inner(t) * 0 + t), [-3, 3], C.outer, p.outerLabel, u, y)
      drawMiniGraph((panW + 8) * 2, t => p.outer(p.inner(t)), xd, C.chain, p.composedLabel, x, y)
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [preset, x])

  const p = presets[preset]
  const btnBase = { padding: '4px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: '0.5px solid var(--color-border-secondary)' }

  return (
    <div ref={containerRef} className="w-full">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {Object.entries(presets).map(([key, { label }]) => (
          <button key={key} onClick={() => setPreset(key)} style={{ ...btnBase, background: preset === key ? 'var(--color-background-info)' : 'transparent', color: preset === key ? 'var(--color-text-info)' : 'var(--color-text-secondary)', fontWeight: preset === key ? 600 : 400 }}>
            {label}
          </button>
        ))}
      </div>
      <svg ref={svgRef} className="w-full" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px 0' }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#a78bfa', minWidth: 60 }}>x = {x.toFixed(2)}</span>
        <input type="range" min={p.xDom[0]} max={p.xDom[1]} step={0.05} value={x}
          onChange={e => setX(parseFloat(e.target.value))} style={{ flex: 1, accentColor: '#a78bfa' }} />
      </div>
    </div>
  )
}
