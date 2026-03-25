import { useRef, useEffect } from 'react'
import * as d3 from 'd3'

// This viz syncs with DynamicProof via params.currentStep (0-indexed, 4 steps)
// Step 0: show f and f⁻¹, identity equation
// Step 1: differentiate both sides — show d/dx brackets
// Step 2: chain rule applied — show slope product = 1
// Step 3: isolate (f⁻¹)' — show 1/f' annotation

export default function InverseDerivativeProof({ params = {} }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const step = params.currentStep ?? 0

  useEffect(() => {
    const draw = () => {
      if (!containerRef.current || !svgRef.current) return
      const W = containerRef.current.clientWidth || 560
      const H = Math.round(W * 0.52)
      const margin = { top: 24, right: 28, bottom: 40, left: 44 }
      const iw = W - margin.left - margin.right
      const ih = H - margin.top - margin.bottom

      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:       isDark ? '#0f172a' : '#f8fafc',
        grid:     isDark ? '#1e293b' : '#e2e8f0',
        axis:     isDark ? '#475569' : '#94a3b8',
        axisText: isDark ? '#94a3b8' : '#64748b',
        mirror:   isDark ? '#334155' : '#cbd5e1',
        fColor:   isDark ? '#38bdf8' : '#0284c7',
        invColor: isDark ? '#f472b6' : '#db2777',
        tangentF: isDark ? '#fbbf24' : '#d97706',
        tangentI: isDark ? '#a78bfa' : '#7c3aed',
        point:    isDark ? '#fbbf24' : '#d97706',
        label:    isDark ? '#e2e8f0' : '#1e293b',
        sublabel: isDark ? '#94a3b8' : '#64748b',
        hiBox:    isDark ? 'rgba(248,113,113,0.15)' : 'rgba(220,38,38,0.08)',
        hiBord:   isDark ? '#f87171' : '#dc2626',
        posBox:   isDark ? 'rgba(74,222,128,0.15)' : 'rgba(22,163,74,0.08)',
        posBord:  isDark ? '#4ade80' : '#16a34a',
      }

      const f = x => 0.5 * x * x * x + 0.5 * x
      const df = x => 1.5 * x * x + 0.5
      const fInv = y => {
        let lo = -3, hi = 3
        for (let i = 0; i < 60; i++) {
          const mid = (lo + hi) / 2
          if (f(mid) < y) lo = mid; else hi = mid
        }
        return (lo + hi) / 2
      }

      const domMax = 2.2
      const xScale = d3.scaleLinear().domain([-domMax, domMax]).range([0, iw])
      const yScale = d3.scaleLinear().domain([-domMax, domMax]).range([ih, 0])

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H)

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      // Grid
      for (let v = -2; v <= 2; v++) {
        g.append('line').attr('x1', xScale(v)).attr('x2', xScale(v)).attr('y1', 0).attr('y2', ih)
          .attr('stroke', C.grid).attr('stroke-width', 1)
        g.append('line').attr('x1', 0).attr('x2', iw).attr('y1', yScale(v)).attr('y2', yScale(v))
          .attr('stroke', C.grid).attr('stroke-width', 1)
      }

      // Mirror y = x
      g.append('line')
        .attr('x1', xScale(-domMax)).attr('x2', xScale(domMax))
        .attr('y1', yScale(-domMax)).attr('y2', yScale(domMax))
        .attr('stroke', C.mirror).attr('stroke-width', 1.5).attr('stroke-dasharray', '6 4')

      // Axes
      g.append('g').attr('transform', `translate(0,${ih})`).call(d3.axisBottom(xScale).ticks(4).tickSize(3))
        .call(ax => ax.select('.domain').attr('stroke', C.axis))
        .call(ax => ax.selectAll('text').attr('fill', C.axisText).attr('font-size', 10))
        .call(ax => ax.selectAll('line').attr('stroke', C.axis))
      g.append('g').call(d3.axisLeft(yScale).ticks(4).tickSize(3))
        .call(ax => ax.select('.domain').attr('stroke', C.axis))
        .call(ax => ax.selectAll('text').attr('fill', C.axisText).attr('font-size', 10))
        .call(ax => ax.selectAll('line').attr('stroke', C.axis))

      const pts = d3.range(-domMax, domMax + 0.01, 0.04)

      // f curve
      const linef = d3.line().x(d => xScale(d)).y(d => yScale(f(d)))
        .defined(d => Math.abs(f(d)) <= domMax + 0.1).curve(d3.curveCatmullRom)
      g.append('path').datum(pts).attr('d', linef)
        .attr('fill', 'none').attr('stroke', C.fColor).attr('stroke-width', 2.5)
      g.append('text').attr('x', xScale(1.18)).attr('y', yScale(1.8))
        .attr('fill', C.fColor).attr('font-size', 13).attr('font-weight', 600).text('f')

      // f⁻¹ curve
      const lineInv = d3.line().x(d => xScale(fInv(d))).y(d => yScale(d))
        .defined(d => Math.abs(fInv(d)) <= domMax + 0.1).curve(d3.curveCatmullRom)
      g.append('path').datum(pts).attr('d', lineInv)
        .attr('fill', 'none').attr('stroke', C.invColor).attr('stroke-width', 2.5)
      g.append('text').attr('x', xScale(1.78)).attr('y', yScale(1.18))
        .attr('fill', C.invColor).attr('font-size', 13).attr('font-weight', 600).text('f⁻¹')

      // Chosen point
      const ax0 = 1.0
      const ay0 = f(ax0)   // point on f: (1, f(1))
      const slope_f = df(ax0)
      const slope_inv = 1 / slope_f

      // Point on f
      g.append('circle').attr('cx', xScale(ax0)).attr('cy', yScale(ay0))
        .attr('r', 6).attr('fill', C.point).attr('stroke', C.bg).attr('stroke-width', 2)

      // Point on f⁻¹ = (ay0, ax0)
      g.append('circle').attr('cx', xScale(ay0)).attr('cy', yScale(ax0))
        .attr('r', 6).attr('fill', C.tangentI).attr('stroke', C.bg).attr('stroke-width', 2)

      // Step 0: identity annotation
      if (step === 0) {
        const bx = xScale(-domMax) + 4, by = 6
        const bw2 = 170, bh2 = 38
        g.append('rect').attr('x', bx).attr('y', by).attr('width', bw2).attr('height', bh2)
          .attr('fill', C.posBox).attr('stroke', C.posBord).attr('stroke-width', 1.5).attr('rx', 6)
        g.append('text').attr('x', bx + bw2 / 2).attr('y', by + 15)
          .attr('text-anchor', 'middle').attr('fill', C.label).attr('font-size', 12).attr('font-weight', 600)
          .text('f(f⁻¹(x)) = x')
        g.append('text').attr('x', bx + bw2 / 2).attr('y', by + 30)
          .attr('text-anchor', 'middle').attr('fill', C.sublabel).attr('font-size', 10)
          .text('definition of inverse')
      }

      // Step 1: show d/dx on both sides
      if (step === 1) {
        const bx = xScale(-domMax) + 4, by = 6
        const bw2 = 200, bh2 = 52
        g.append('rect').attr('x', bx).attr('y', by).attr('width', bw2).attr('height', bh2)
          .attr('fill', C.posBox).attr('stroke', C.posBord).attr('stroke-width', 1.5).attr('rx', 6)
        g.append('text').attr('x', bx + bw2 / 2).attr('y', by + 16)
          .attr('text-anchor', 'middle').attr('fill', C.label).attr('font-size', 11.5).attr('font-weight', 600)
          .text('d/dx[f(f⁻¹(x))] = d/dx[x]')
        g.append('text').attr('x', bx + bw2 / 2).attr('y', by + 32)
          .attr('text-anchor', 'middle').attr('fill', C.sublabel).attr('font-size', 10)
          .text('differentiate both sides')
        g.append('text').attr('x', bx + bw2 / 2).attr('y', by + 46)
          .attr('text-anchor', 'middle').attr('fill', C.sublabel).attr('font-size', 10)
          .text('right side = 1')
      }

      // Steps 2 & 3: show tangent lines and slope annotations
      if (step >= 2) {
        const tLen = 0.7

        // Tangent to f at (ax0, ay0): slope = slope_f
        const tx1 = ax0 - tLen, tx2 = ax0 + tLen
        const ty1 = ay0 - tLen * slope_f, ty2 = ay0 + tLen * slope_f
        g.append('line')
          .attr('x1', xScale(tx1)).attr('x2', xScale(tx2))
          .attr('y1', yScale(ty1)).attr('y2', yScale(ty2))
          .attr('stroke', C.tangentF).attr('stroke-width', 2)
          .attr('stroke-dasharray', '5 3')

        // Tangent to f⁻¹ at (ay0, ax0): slope = slope_inv (swapped rise/run)
        const ix1 = ay0 - tLen, ix2 = ay0 + tLen
        const iy1 = ax0 - tLen * slope_inv, iy2 = ax0 + tLen * slope_inv
        g.append('line')
          .attr('x1', xScale(ix1)).attr('x2', xScale(ix2))
          .attr('y1', yScale(iy1)).attr('y2', yScale(iy2))
          .attr('stroke', C.tangentI).attr('stroke-width', 2)
          .attr('stroke-dasharray', '5 3')

        // Chain rule annotation box
        const bx = xScale(-domMax) + 4, by = 6
        const bw2 = step === 2 ? 212 : 230
        const bh2 = step === 2 ? 56 : 70
        const boxColor = step === 2 ? C.posBox : C.hiBox
        const bordColor = step === 2 ? C.posBord : C.hiBord

        g.append('rect').attr('x', bx).attr('y', by).attr('width', bw2).attr('height', bh2)
          .attr('fill', boxColor).attr('stroke', bordColor).attr('stroke-width', 1.5).attr('rx', 6)

        if (step === 2) {
          g.append('text').attr('x', bx + bw2 / 2).attr('y', by + 16)
            .attr('text-anchor', 'middle').attr('fill', C.label).attr('font-size', 11.5).attr('font-weight', 600)
            .text("f ′(f⁻¹(x)) · (f⁻¹)′(x) = 1")
          g.append('text').attr('x', bx + bw2 / 2).attr('y', by + 32)
            .attr('text-anchor', 'middle').attr('fill', C.sublabel).attr('font-size', 10)
            .text('chain rule on left side')
          g.append('text').attr('x', bx + bw2 / 2).attr('y', by + 48)
            .attr('text-anchor', 'middle').attr('fill', C.sublabel).attr('font-size', 10)
            .text(`slope_f × slope_inv = ${slope_f.toFixed(2)} × ${slope_inv.toFixed(2)} = 1`)
        } else {
          g.append('text').attr('x', bx + bw2 / 2).attr('y', by + 16)
            .attr('text-anchor', 'middle').attr('fill', C.label).attr('font-size', 12).attr('font-weight', 700)
            .text("(f⁻¹)′(x) = 1 / f ′(f⁻¹(x))")
          g.append('text').attr('x', bx + bw2 / 2).attr('y', by + 34)
            .attr('text-anchor', 'middle').attr('fill', C.sublabel).attr('font-size', 10)
            .text('divide both sides by f ′(f⁻¹(x))')
          g.append('text').attr('x', bx + bw2 / 2).attr('y', by + 50)
            .attr('text-anchor', 'middle').attr('fill', C.sublabel).attr('font-size', 10)
            .text(`at this point: 1 / ${slope_f.toFixed(2)} = ${slope_inv.toFixed(2)}`)
          g.append('text').attr('x', bx + bw2 / 2).attr('y', by + 65)
            .attr('text-anchor', 'middle').attr('fill', bordColor).attr('font-size', 10).attr('font-weight', 600)
            .text('slope reciprocal — the key result')
        }

        // Slope labels on tangents
        g.append('text')
          .attr('x', xScale(ax0 + tLen) + 6).attr('y', yScale(ay0 + tLen * slope_f))
          .attr('fill', C.tangentF).attr('font-size', 11)
          .text(`m = ${slope_f.toFixed(2)}`)

        g.append('text')
          .attr('x', xScale(ay0 + tLen) + 6).attr('y', yScale(ax0 + tLen * slope_inv))
          .attr('fill', C.tangentI).attr('font-size', 11)
          .text(`m = ${slope_inv.toFixed(2)}`)
      }

      // Step label
      const stepLabels = [
        'Step 1: Define — f(f⁻¹(x)) = x',
        'Step 2: Differentiate both sides',
        'Step 3: Apply chain rule → slopes multiply to 1',
        'Step 4: Solve → slope of f⁻¹ is reciprocal of slope of f',
      ]
      g.append('text')
        .attr('x', iw / 2).attr('y', ih + 32)
        .attr('text-anchor', 'middle').attr('fill', C.sublabel).attr('font-size', 11)
        .text(stepLabels[Math.min(step, 3)])
    }

    draw()
    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [step])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
    </div>
  )
}
