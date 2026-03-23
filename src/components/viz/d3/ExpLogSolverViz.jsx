import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * ExpLogSolverViz
 * Shows both sides of an equation plotted as functions.
 * Predefined equation types user can select.
 * Highlights the intersection point(s) = solution(s).
 * Dark mode. ResizeObserver.
 */
export default function ExpLogSolverViz({ params = {} }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [eq, setEq] = useState('exp1')

  const equations = {
    exp1: {
      label: '2^x = 5',
      f: x => Math.pow(2, x),
      g: x => 5,
      xDom: [-1, 4], yDom: [0, 10],
      solution: Math.log(5) / Math.log(2),
      solutionLabel: 'x = log₂5 ≈ 2.322',
      fLabel: 'y = 2^x',
      gLabel: 'y = 5',
    },
    exp2: {
      label: '3^(x-1) = 2^x',
      f: x => Math.pow(3, x - 1),
      g: x => Math.pow(2, x),
      xDom: [-1, 5], yDom: [0, 12],
      solution: Math.log(3) / (Math.log(3) - Math.log(2)) - 1 + 1,
      solutionLabel: 'x = ln3/(ln3−ln2) ≈ 2.71',
      fLabel: 'y = 3^(x−1)',
      gLabel: 'y = 2^x',
    },
    log1: {
      label: 'log₂(x+3) = 3',
      f: x => x > -3 ? Math.log(x + 3) / Math.log(2) : null,
      g: x => 3,
      xDom: [-3, 10], yDom: [-1, 5],
      solution: 5,
      solutionLabel: 'x = 5',
      fLabel: 'y = log₂(x+3)',
      gLabel: 'y = 3',
    },
    log2: {
      label: 'ln(x) + ln(x-2) = ln(3)',
      f: x => x > 0 && x > 2 ? Math.log(x) + Math.log(x - 2) : null,
      g: x => Math.log(3),
      xDom: [2, 6], yDom: [-1, 3],
      solution: 3,
      solutionLabel: 'x = 3 (x=−1 extraneous)',
      fLabel: 'y = ln(x)+ln(x−2)',
      gLabel: 'y = ln(3)',
    },
    nat1: {
      label: 'e^(2x) - 5e^x + 6 = 0',
      f: x => Math.exp(2 * x) - 5 * Math.exp(x) + 6,
      g: x => 0,
      xDom: [-0.5, 2.5], yDom: [-2, 8],
      solution: Math.log(2),
      solution2: Math.log(3),
      solutionLabel: 'x = ln2 ≈ 0.693 or x = ln3 ≈ 1.099',
      fLabel: 'y = e^(2x)−5e^x+6',
      gLabel: 'y = 0',
    },
  }

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:     isDark ? '#0f172a' : '#f8fafc',
        panel:  isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '#334155' : '#e2e8f0',
        axis:   isDark ? '#475569' : '#94a3b8',
        grid:   isDark ? '#1e293b' : '#f1f5f9',
        text:   isDark ? '#e2e8f0' : '#1e293b',
        muted:  isDark ? '#64748b' : '#94a3b8',
        f:      isDark ? '#38bdf8' : '#0284c7',
        g:      isDark ? '#f472b6' : '#db2777',
        sol:    isDark ? '#34d399' : '#059669',
        solFill:isDark ? 'rgba(52,211,153,0.2)' : 'rgba(5,150,105,0.12)',
      }

      const cfg = equations[eq]
      const W = containerRef.current?.clientWidth || 520
      const H = Math.round(W * 0.62)
      const pad = { t: 28, b: 28, l: 40, r: 16 }
      const iW = W - pad.l - pad.r
      const iH = H - pad.t - pad.b

      const xS = d3.scaleLinear().domain(cfg.xDom).range([pad.l, pad.l + iW])
      const yS = d3.scaleLinear().domain(cfg.yDom).range([pad.t + iH, pad.t])

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H).style('background', C.bg)

      svg.append('rect').attr('x', 1).attr('y', 1).attr('width', W - 2).attr('height', H - 2).attr('rx', 8).attr('fill', C.panel).attr('stroke', C.border).attr('stroke-width', 1)

      // Grid
      yS.ticks(5).forEach(v => {
        svg.append('line').attr('x1', pad.l).attr('y1', yS(v)).attr('x2', pad.l + iW).attr('y2', yS(v)).attr('stroke', C.grid).attr('stroke-width', 1)
        svg.append('text').attr('x', pad.l - 4).attr('y', yS(v) + 4).attr('text-anchor', 'end').attr('fill', C.muted).attr('font-size', 10).text(v.toFixed(1))
      })

      // Axes
      if (cfg.yDom[0] <= 0) svg.append('line').attr('x1', pad.l).attr('y1', yS(0)).attr('x2', pad.l + iW).attr('y2', yS(0)).attr('stroke', C.axis).attr('stroke-width', 1.5)
      if (cfg.xDom[0] <= 0) svg.append('line').attr('x1', xS(0)).attr('y1', pad.t).attr('x2', xS(0)).attr('y2', pad.t + iH).attr('stroke', C.axis).attr('stroke-width', 1.5)

      xS.ticks(5).forEach(v => {
        svg.append('text').attr('x', xS(v)).attr('y', yS(cfg.yDom[0]) + 14).attr('text-anchor', 'middle').attr('fill', C.muted).attr('font-size', 10).text(v.toFixed(1))
      })

      // Draw curve helper
      const drawFn = (fn, color, label, labelOffset = 0) => {
        const step = (cfg.xDom[1] - cfg.xDom[0]) / 300
        let segs = [], cur = []
        for (let i = 0; i <= 300; i++) {
          const x = cfg.xDom[0] + i * step
          const y = fn(x)
          if (y === null || !isFinite(y) || y < cfg.yDom[0] - 1 || y > cfg.yDom[1] + 1) {
            if (cur.length > 1) segs.push(cur)
            cur = []
          } else {
            cur.push([x, y])
          }
        }
        if (cur.length > 1) segs.push(cur)
        const line = d3.line().x(d => xS(d[0])).y(d => yS(d[1])).curve(d3.curveCatmullRom)
        segs.forEach(s => svg.append('path').datum(s).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2.5).attr('d', line))
        if (segs.length > 0) {
          const last = segs[0][segs[0].length - 1]
          if (last) svg.append('text').attr('x', xS(last[0]) - 4).attr('y', yS(last[1]) + labelOffset - 6).attr('text-anchor', 'end').attr('fill', color).attr('font-size', 11).attr('font-weight', 'bold').text(label)
        }
      }

      drawFn(cfg.f, C.f, cfg.fLabel, 0)
      drawFn(cfg.g, C.g, cfg.gLabel, 14)

      // Solution marker(s)
      const markSol = (x) => {
        const y = cfg.g(x)
        if (!isFinite(y)) return
        svg.append('circle').attr('cx', xS(x)).attr('cy', yS(y)).attr('r', 8).attr('fill', C.solFill).attr('stroke', C.sol).attr('stroke-width', 2)
        svg.append('line').attr('x1', xS(x)).attr('y1', yS(cfg.yDom[0])).attr('x2', xS(x)).attr('y2', yS(y)).attr('stroke', C.sol).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
        svg.append('text').attr('x', xS(x)).attr('y', yS(cfg.yDom[0]) + 14).attr('text-anchor', 'middle').attr('fill', C.sol).attr('font-size', 11).attr('font-weight', 'bold').text(`x≈${x.toFixed(3)}`)
      }

      if (cfg.solution !== undefined && cfg.solution >= cfg.xDom[0] && cfg.solution <= cfg.xDom[1]) markSol(cfg.solution)
      if (cfg.solution2 !== undefined && cfg.solution2 >= cfg.xDom[0] && cfg.solution2 <= cfg.xDom[1]) markSol(cfg.solution2)

      // Solution label box
      svg.append('rect').attr('x', pad.l + 4).attr('y', pad.t + 4).attr('width', Math.min(iW * 0.6, 260)).attr('height', 26).attr('rx', 6).attr('fill', C.solFill).attr('stroke', C.sol).attr('stroke-width', 1)
      svg.append('text').attr('x', pad.l + 12).attr('y', pad.t + 21).attr('fill', C.sol).attr('font-size', 12).attr('font-weight', 'bold').text(`Solution: ${cfg.solutionLabel}`)
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()
    return () => ro.disconnect()
  }, [eq, params.currentStep])

  const btnBase = { padding: '5px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: '0.5px solid var(--color-border-secondary)', marginBottom: 4 }

  return (
    <div ref={containerRef} className="w-full">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {Object.entries(equations).map(([key, { label }]) => (
          <button key={key} onClick={() => setEq(key)} style={{ ...btnBase, background: eq === key ? 'var(--color-background-info)' : 'transparent', color: eq === key ? 'var(--color-text-info)' : 'var(--color-text-secondary)', borderColor: eq === key ? 'var(--color-border-info)' : 'var(--color-border-secondary)', fontWeight: eq === key ? 600 : 400 }}>
            {label}
          </button>
        ))}
      </div>
      <svg ref={svgRef} className="w-full" />
      <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '6px 0 0' }}>
        Blue = left side · Pink = right side · Green marker = solution (where curves intersect)
      </p>
    </div>
  )
}
