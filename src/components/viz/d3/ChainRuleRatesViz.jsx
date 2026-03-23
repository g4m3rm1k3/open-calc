import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * ChainRuleRatesViz — Viz 4: "Rates multiplying"
 *
 * Two analogies on two tabs:
 *
 * Tab 1 — Unit conversion chain:
 *   miles/hour × hours/minute × minutes/second = miles/second
 *   Shows that dy/dx = (dy/du)·(du/dx) looks like fraction cancellation.
 *   Sliders control the two rates. The product updates live.
 *
 * Tab 2 — Gear train:
 *   Gear A → Gear B → Gear C
 *   Each gear ratio is a derivative. Final ratio = product of gear ratios.
 *   Animated rotation. Shows why chain rule must multiply.
 *
 * Dark mode. ResizeObserver.
 */
export default function ChainRuleRatesViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [tab, setTab] = useState('units')
  const [dydu, setDydu] = useState(2.0)   // dy/du (outer derivative)
  const [dudx, setDudx] = useState(3.0)   // du/dx (inner derivative)
  const [angle, setAngle] = useState(0)

  // Animate gears
  useEffect(() => {
    if (tab !== 'gears') return
    let frame
    let a = angle
    const animate = () => {
      a = (a + 0.02) % (2 * Math.PI)
      setAngle(a)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [tab])

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:     isDark ? '#0f172a' : '#f8fafc',
        panel:  isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '#334155' : '#e2e8f0',
        text:   isDark ? '#e2e8f0' : '#1e293b',
        muted:  isDark ? '#64748b' : '#94a3b8',
        inner:  isDark ? '#38bdf8' : '#0284c7',
        outer:  isDark ? '#f472b6' : '#db2777',
        chain:  isDark ? '#34d399' : '#059669',
        cancel: isDark ? '#fbbf24' : '#d97706',
        gear1:  isDark ? '#38bdf8' : '#0284c7',
        gear2:  isDark ? '#f472b6' : '#db2777',
        gear3:  isDark ? '#34d399' : '#059669',
        tooth:  isDark ? '#1e293b' : '#ffffff',
      }

      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.58)
      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      svg.append('rect').attr('x', 1).attr('y', 1).attr('width', W - 2).attr('height', H - 2).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      if (tab === 'units') {
        drawUnits(svg, W, H, C, dydu, dudx)
      } else {
        drawGears(svg, W, H, C, angle, dydu, dudx)
      }
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [tab, dydu, dudx, angle])

  const drawUnits = (svg, W, H, C, dydu, dudx) => {
    const dydx = dydu * dudx
    const cx = W / 2

    // Title
    svg.append('text').attr('x', cx).attr('y', 26).attr('text-anchor', 'middle')
      .attr('fill', C.muted).attr('font-size', 12).text('Leibniz notation looks like fractions cancelling — and it almost does')

    // The Leibniz cancellation
    const fracY = 70
    const boxW = W * 0.24, boxH = 56, gap = W * 0.04
    const x1 = W * 0.05, x2 = x1 + boxW + gap + 20, x3 = x2 + boxW + gap + 20

    const drawFrac = (bx, by, num, denom, numCol, denomCol, borderCol) => {
      svg.append('rect').attr('x', bx).attr('y', by).attr('width', boxW).attr('height', boxH)
        .attr('rx', 8).attr('fill', C.bg).attr('stroke', borderCol).attr('stroke-width', 2)
      svg.append('text').attr('x', bx + boxW / 2).attr('y', by + 22).attr('text-anchor', 'middle')
        .attr('fill', numCol).attr('font-size', 16).attr('font-weight', 'bold').text(num)
      svg.append('line').attr('x1', bx + 10).attr('y1', by + 30).attr('x2', bx + boxW - 10).attr('y2', by + 30)
        .attr('stroke', C.muted).attr('stroke-width', 1.5)
      svg.append('text').attr('x', bx + boxW / 2).attr('y', by + 50).attr('text-anchor', 'middle')
        .attr('fill', denomCol).attr('font-size', 16).attr('font-weight', 'bold').text(denom)
    }

    drawFrac(x1, fracY, 'dy', 'du', C.outer, C.cancel, C.outer)
    svg.append('text').attr('x', x1 + boxW + 12).attr('y', fracY + boxH / 2 + 6).attr('fill', C.muted).attr('font-size', 20).text('×')
    drawFrac(x2, fracY, 'du', 'dx', C.cancel, C.inner, C.inner)
    svg.append('text').attr('x', x2 + boxW + 12).attr('y', fracY + boxH / 2 + 6).attr('fill', C.chain).attr('font-size', 20).text('=')
    drawFrac(x3, fracY, 'dy', 'dx', C.outer, C.inner, C.chain)

    // "du cancels" annotation
    svg.append('rect').attr('x', x1 + boxW * 0.3).attr('y', fracY + 28).attr('width', x2 + boxW * 0.7 - (x1 + boxW * 0.3)).attr('height', 26)
      .attr('rx', 4).attr('fill', 'none').attr('stroke', C.cancel).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
    svg.append('text').attr('x', (x1 + x2 + boxW) / 2 + 10).attr('y', fracY + 56 + 18).attr('text-anchor', 'middle')
      .attr('fill', C.cancel).attr('font-size', 11).text('← "du" appears to cancel')

    // Live numeric example
    const isDark = document.documentElement.classList.contains('dark')
    const numY = fracY + 100
    svg.append('rect').attr('x', W * 0.05).attr('y', numY).attr('width', W * 0.9).attr('height', 68).attr('rx', 8)
      .attr('fill', isDark ? '#0a1628' : '#f0f7ff').attr('stroke', C.chain).attr('stroke-width', 1)

    svg.append('text').attr('x', cx).attr('y', numY + 18).attr('text-anchor', 'middle')
      .attr('fill', C.muted).attr('font-size', 11).text('Concrete example: if g(x)=x³ and f(u)=sin(u) at x=1:')

    const vals = [
      { label: "f'(u) = dy/du", val: `cos(1³) ≈ ${Math.cos(1).toFixed(4)}`, col: C.outer },
      { label: "g'(x) = du/dx", val: `3(1²) = 3.0000`, col: C.inner },
      { label: "h'(x) = dy/dx", val: `${Math.cos(1).toFixed(4)} × 3 = ${(3 * Math.cos(1)).toFixed(4)}`, col: C.chain },
    ]
    vals.forEach(({ label, val, col }, i) => {
      svg.append('text').attr('x', W * 0.1 + i * W * 0.3).attr('y', numY + 40)
        .attr('fill', C.muted).attr('font-size', 10).text(label)
      svg.append('text').attr('x', W * 0.1 + i * W * 0.3).attr('y', numY + 56)
        .attr('fill', col).attr('font-size', 12).attr('font-weight', 'bold').text(val)
    })

    // Your rate example
    const rateY = numY + 84
    svg.append('text').attr('x', cx).attr('y', rateY + 14).attr('text-anchor', 'middle')
      .attr('fill', C.text).attr('font-size', 13).attr('font-weight', 'bold')
      .text(`With your sliders: (dy/du = ${dydu}) × (du/dx = ${dudx}) = dy/dx = ${(dydu * dudx).toFixed(2)}`)

    // Real-world interpretation
    svg.append('text').attr('x', cx).attr('y', rateY + 38).attr('text-anchor', 'middle')
      .attr('fill', C.muted).attr('font-size', 11)
      .text(`If temperature rises ${dydu}/°C and altitude rises ${dudx}°C/km, temperature rises ${(dydu * dudx).toFixed(2)}/km`)
  }

  const drawGears = (svg, W, H, C, angle, r1Speed, r2Speed) => {
    const gear = (cx, cy, r, teeth, theta0, col, label, speed, labelBelow) => {
      const g = svg.append('g')
      g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r * 0.7)
        .attr('fill', col).attr('stroke', C.tooth).attr('stroke-width', 1.5).attr('opacity', 0.9)
      for (let i = 0; i < teeth; i++) {
        const ang = theta0 + (i / teeth) * 2 * Math.PI
        const tx = cx + r * 0.75 * Math.cos(ang)
        const ty = cy + r * 0.75 * Math.sin(ang)
        g.append('rect').attr('x', tx - r * 0.07).attr('y', ty - r * 0.14).attr('width', r * 0.14).attr('height', r * 0.28)
          .attr('transform', `rotate(${ang * 180 / Math.PI}, ${tx}, ${ty})`)
          .attr('fill', col).attr('stroke', C.tooth).attr('stroke-width', 1)
      }
      g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r * 0.1).attr('fill', C.tooth)
      g.append('line').attr('x1', cx).attr('y1', cy)
        .attr('x2', cx + r * 0.6 * Math.cos(theta0)).attr('y2', cy + r * 0.6 * Math.sin(theta0))
        .attr('stroke', C.tooth).attr('stroke-width', 2)
      g.append('text').attr('x', cx).attr('y', labelBelow ? cy + r + 18 : cy - r - 10)
        .attr('text-anchor', 'middle').attr('fill', col).attr('font-size', 12).attr('font-weight', 'bold').text(label)
      g.append('text').attr('x', cx).attr('y', labelBelow ? cy + r + 32 : cy - r - 26)
        .attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(speed)
    }

    const r1 = W * 0.12, r2 = W * 0.09, r3 = W * 0.07
    const cx1 = W * 0.22, cx2 = W * 0.5, cx3 = W * 0.76, cy = H * 0.44

    gear(cx1, cy, r1, 16, angle,        C.gear1, 'Gear A', `speed: 1`, false)
    gear(cx2, cy, r2, 12, -angle * r1 / r2, C.gear2, 'Gear B', `r₁/r₂ = ${(r1/r2).toFixed(2)}`, false)
    gear(cx3, cy, r3, 8,  angle * r1 / r3,  C.gear3, 'Gear C', `r₁/r₃ = ${(r1/r3).toFixed(2)}`, false)

    const lY = cy + Math.max(r1, r2, r3) + 36
    const lines = [
      { x: cx1, text: 'du/dx = 1', col: C.gear1 },
      { x: cx2, text: `× ${(r1/r2).toFixed(2)}`, col: C.gear2 },
      { x: cx3, text: `= ${(r1/r3).toFixed(2)}`, col: C.gear3 },
    ]
    lines.forEach(({ x, text, col }) => {
      svg.append('text').attr('x', x).attr('y', lY).attr('text-anchor', 'middle')
        .attr('fill', col).attr('font-size', 13).attr('font-weight', 'bold').text(text)
    })

    svg.append('text').attr('x', W / 2).attr('y', lY + 22).attr('text-anchor', 'middle')
      .attr('fill', C.muted).attr('font-size', 11)
      .text('Each gear ratio is a derivative. Final speed = product of ratios = chain rule.')

    svg.append('text').attr('x', W / 2).attr('y', H - 16).attr('text-anchor', 'middle')
      .attr('fill', C.chain).attr('font-size', 13).attr('font-weight', 'bold')
      .text('dy/dx = (dy/du) × (du/dx) — rates always multiply through a chain')
  }

  const btnBase = { padding: '5px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: '0.5px solid var(--color-border-secondary)', fontWeight: 500 }
  const active = { ...btnBase, background: 'var(--color-background-info)', color: 'var(--color-text-info)', borderColor: 'var(--color-border-info)' }
  const inactive = { ...btnBase, background: 'transparent', color: 'var(--color-text-secondary)' }

  return (
    <div ref={containerRef} className="w-full">
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button style={tab === 'units' ? active : inactive} onClick={() => setTab('units')}>Rates & units</button>
        <button style={tab === 'gears' ? active : inactive} onClick={() => setTab('gears')}>Gear train</button>
      </div>
      <svg ref={svgRef} className="w-full" />
      {tab === 'units' && (
        <div style={{ padding: '10px 4px 0' }}>
          {[
            { label: 'dy/du (outer rate)', val: dydu, set: setDydu, min: 0.5, max: 5, step: 0.5, color: '#f472b6' },
            { label: 'du/dx (inner rate)', val: dudx, set: setDudx, min: 0.5, max: 5, step: 0.5, color: '#38bdf8' },
          ].map(({ label, val, set, min, max, step, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 'bold', color, minWidth: 140 }}>{label} = {val}</span>
              <input type="range" min={min} max={max} step={step} value={val}
                onChange={e => set(parseFloat(e.target.value))} style={{ flex: 1, accentColor: color }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
