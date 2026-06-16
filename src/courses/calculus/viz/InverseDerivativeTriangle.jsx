import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'

// The triangle trick:
// For arcsin: sin(y) = x, so opposite = x, hypotenuse = 1, adjacent = √(1-x²)
// For arccos: cos(y) = x, so adjacent = x, hypotenuse = 1, opposite = √(1-x²)
// For arctan: tan(y) = x, so opposite = x, adjacent = 1, hypotenuse = √(1+x²)

const MODES = [
  {
    id: 'arcsin',
    label: 'arcsin',
    invLabel: 'arcsin(x)',
    equation: 'sin(y) = x',
    opp: x => x,
    adj: x => Math.sqrt(Math.max(0, 1 - x * x)),
    hyp: () => 1,
    oppLabel: x => `x = ${x.toFixed(2)}`,
    adjLabel: x => `√(1−x²) = ${Math.sqrt(Math.max(0, 1 - x * x)).toFixed(3)}`,
    hypLabel: () => '1',
    angleLabel: 'y = arcsin(x)',
    derivSteps: [
      'sin(y) = x',
      'cos(y) · dy/dx = 1',
      'dy/dx = 1/cos(y)',
      'cos(y) = adj/hyp = √(1−x²)/1',
      'd/dx arcsin(x) = 1/√(1−x²)',
    ],
    result: '\\dfrac{d}{dx}\\arcsin(x) = \\dfrac{1}{\\sqrt{1-x^2}}',
    xMin: -0.95, xMax: 0.95, xDefault: 0.6,
    highlight: 'adj', // the side we're solving for
    trigId: 'cos(y)',
    identityNote: 'From sin²+cos²=1: cos(y) = √(1−sin²(y)) = √(1−x²)',
  },
  {
    id: 'arccos',
    label: 'arccos',
    invLabel: 'arccos(x)',
    equation: 'cos(y) = x',
    opp: x => Math.sqrt(Math.max(0, 1 - x * x)),
    adj: x => x,
    hyp: () => 1,
    oppLabel: x => `√(1−x²) = ${Math.sqrt(Math.max(0, 1 - x * x)).toFixed(3)}`,
    adjLabel: x => `x = ${x.toFixed(2)}`,
    hypLabel: () => '1',
    angleLabel: 'y = arccos(x)',
    derivSteps: [
      'cos(y) = x',
      '−sin(y) · dy/dx = 1',
      'dy/dx = −1/sin(y)',
      'sin(y) = opp/hyp = √(1−x²)/1',
      'd/dx arccos(x) = −1/√(1−x²)',
    ],
    result: '\\dfrac{d}{dx}\\arccos(x) = \\dfrac{-1}{\\sqrt{1-x^2}}',
    xMin: -0.95, xMax: 0.95, xDefault: 0.6,
    highlight: 'opp',
    trigId: 'sin(y)',
    identityNote: 'From sin²+cos²=1: sin(y) = √(1−cos²(y)) = √(1−x²)',
  },
  {
    id: 'arctan',
    label: 'arctan',
    invLabel: 'arctan(x)',
    equation: 'tan(y) = x',
    opp: x => x,
    adj: () => 1,
    hyp: x => Math.sqrt(1 + x * x),
    oppLabel: x => `x = ${x.toFixed(2)}`,
    adjLabel: () => '1',
    hypLabel: x => `√(1+x²) = ${Math.sqrt(1 + x * x).toFixed(3)}`,
    angleLabel: 'y = arctan(x)',
    derivSteps: [
      'tan(y) = x',
      'sec²(y) · dy/dx = 1',
      'dy/dx = 1/sec²(y) = cos²(y)',
      'sec²(y) = hyp²/adj² = (1+x²)/1',
      'd/dx arctan(x) = 1/(1+x²)',
    ],
    result: '\\dfrac{d}{dx}\\arctan(x) = \\dfrac{1}{1+x^2}',
    xMin: -2.5, xMax: 2.5, xDefault: 1.0,
    highlight: 'hyp',
    trigId: 'sec²(y)',
    identityNote: 'sec²(y) = 1 + tan²(y) = 1 + x²',
  },
]

export default function InverseDerivativeTriangle({ params = {} }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [mode, setMode] = useState(0)
  const [xVal, setXVal] = useState(MODES[0].xDefault)
  const [step, setStep] = useState(4) // show all steps by default

  const m = MODES[mode]

  // Keep xVal in range when switching modes
  const safeX = Math.max(m.xMin, Math.min(m.xMax, xVal))

  useEffect(() => {
    const draw = () => {
      if (!containerRef.current || !svgRef.current) return
      const W = containerRef.current.clientWidth || 560
      const H = Math.round(W * 0.48)

      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg:       isDark ? '#0f172a' : '#f8fafc',
        panel:    isDark ? '#1e293b' : '#ffffff',
        border:   isDark ? '#334155' : '#e2e8f0',
        axis:     isDark ? '#475569' : '#94a3b8',
        label:    isDark ? '#e2e8f0' : '#1e293b',
        sublabel: isDark ? '#94a3b8' : '#64748b',
        hyp:      isDark ? '#f472b6' : '#db2777',
        opp:      isDark ? '#38bdf8' : '#0284c7',
        adj:      isDark ? '#4ade80' : '#16a34a',
        angle:    isDark ? '#fbbf24' : '#d97706',
        right:    isDark ? '#475569' : '#94a3b8',
        fill:     isDark ? 'rgba(56,189,248,0.07)' : 'rgba(2,132,199,0.05)',
        hiBox:    isDark ? 'rgba(251,191,36,0.15)' : 'rgba(217,119,6,0.10)',
        hiBord:   isDark ? '#fbbf24' : '#d97706',
        step:     isDark ? '#a78bfa' : '#7c3aed',
      }

      const x = safeX
      const opp = m.opp(x)
      const adj = Math.abs(m.adj(x))
      const hyp = m.hyp(x)

      // Triangle layout — fixed position, scale sides proportionally
      const triLeft = W * 0.08
      const triBottom = H * 0.82
      const scale = Math.min(W * 0.28, H * 0.55)

      // Normalize sides so the longest fits in `scale`
      const maxSide = Math.max(opp, adj, hyp)
      const s = scale / Math.max(maxSide, 0.01)

      const A = [triLeft, triBottom]                     // bottom-left (right angle)
      const B = [triLeft + adj * s, triBottom]           // bottom-right
      const C2 = [triLeft, triBottom - opp * s]          // top-left

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('width', W).attr('height', H)

      const g = svg.append('g')

      // Triangle fill
      g.append('polygon')
        .attr('points', [A, B, C2].map(p => p.join(',')).join(' '))
        .attr('fill', C.fill)
        .attr('stroke', C.border)
        .attr('stroke-width', 1)

      // Right angle marker
      const rm = 10
      g.append('polyline')
        .attr('points', `${A[0] + rm},${A[1]} ${A[0] + rm},${A[1] - rm} ${A[0]},${A[1] - rm}`)
        .attr('fill', 'none').attr('stroke', C.right).attr('stroke-width', 1.5)

      // Hypotenuse (C2 to B)
      const hypHighlight = m.highlight === 'hyp'
      g.append('line')
        .attr('x1', C2[0]).attr('y1', C2[1]).attr('x2', B[0]).attr('y2', B[1])
        .attr('stroke', hypHighlight ? C.angle : C.hyp)
        .attr('stroke-width', hypHighlight ? 4 : 2.5)

      // Opposite (A to C2 — vertical)
      const oppHighlight = m.highlight === 'opp'
      g.append('line')
        .attr('x1', A[0]).attr('y1', A[1]).attr('x2', C2[0]).attr('y2', C2[1])
        .attr('stroke', oppHighlight ? C.angle : C.opp)
        .attr('stroke-width', oppHighlight ? 4 : 2.5)

      // Adjacent (A to B — horizontal)
      const adjHighlight = m.highlight === 'adj'
      g.append('line')
        .attr('x1', A[0]).attr('y1', A[1]).attr('x2', B[0]).attr('y2', B[1])
        .attr('stroke', adjHighlight ? C.angle : C.adj)
        .attr('stroke-width', adjHighlight ? 4 : 2.5)

      // Angle arc at B
      const angleAtB = Math.atan2(opp * s, adj * s)
      const arcR = 22
      const arcPath = d3.arc()
        .innerRadius(arcR - 1).outerRadius(arcR + 1)
        .startAngle(Math.PI - angleAtB)
        .endAngle(Math.PI)
      g.append('path').attr('d', arcPath())
        .attr('transform', `translate(${B[0]},${B[1]})`)
        .attr('fill', C.angle)
      g.append('text')
        .attr('x', B[0] - arcR - 14).attr('y', B[1] - 6)
        .attr('fill', C.angle).attr('font-size', 11).attr('font-style', 'italic')
        .text('y')

      // Side labels
      const midAdj = [(A[0] + B[0]) / 2, A[1] + 16]
      const midOpp = [A[0] - 14, (A[1] + C2[1]) / 2]
      const midHyp = [(C2[0] + B[0]) / 2 + 10, (C2[1] + B[1]) / 2 - 8]

      const sideColor = (which) => {
        if (m.highlight === which) return C.angle
        if (which === 'adj') return C.adj
        if (which === 'opp') return C.opp
        return C.hyp
      }

      g.append('text').attr('x', midAdj[0]).attr('y', midAdj[1])
        .attr('text-anchor', 'middle').attr('fill', sideColor('adj'))
        .attr('font-size', 12).attr('font-weight', 600)
        .text(m.adjLabel(x))

      g.append('text').attr('x', midOpp[0]).attr('y', midOpp[1])
        .attr('text-anchor', 'middle').attr('fill', sideColor('opp'))
        .attr('font-size', 12).attr('font-weight', 600)
        .text(m.oppLabel(x))

      g.append('text').attr('x', midHyp[0]).attr('y', midHyp[1])
        .attr('text-anchor', 'middle').attr('fill', sideColor('hyp'))
        .attr('font-size', 12).attr('font-weight', 600)
        .text(m.hypLabel(x))

      // Equation label top of triangle
      g.append('text').attr('x', triLeft).attr('y', C2[1] - 12)
        .attr('fill', C.label).attr('font-size', 12).attr('font-weight', 700)
        .text(m.equation)
      g.append('text').attr('x', triLeft).attr('y', C2[1] - 28)
        .attr('fill', C.sublabel).attr('font-size', 11)
        .text('Let ' + m.angleLabel)

      // ── Derivation steps panel ─────────────────────────────────────────
      const panelX = W * 0.44
      const panelW = W - panelX - 12
      const panelY = H * 0.04
      const lineH = H * 0.135
      const numSteps = m.derivSteps.length

      m.derivSteps.forEach((s2, i) => {
        const isVisible = i <= step
        const isCurrent = i === Math.min(step, numSteps - 1)
        const isFinal = i === numSteps - 1
        const y0 = panelY + i * lineH

        // Step box
        g.append('rect')
          .attr('x', panelX).attr('y', y0)
          .attr('width', panelW).attr('height', lineH - 3)
          .attr('rx', 5)
          .attr('fill', !isVisible ? 'transparent' : isFinal ? C.hiBox : isDark ? 'rgba(30,41,59,0.7)' : 'rgba(241,245,249,0.9)')
          .attr('stroke', !isVisible ? C.border : isFinal ? C.hiBord : C.border)
          .attr('stroke-width', isVisible ? 1.5 : 1)
          .attr('opacity', isVisible ? 1 : 0.3)

        if (isVisible) {
          g.append('text')
            .attr('x', panelX + 10).attr('y', y0 + lineH * 0.42)
            .attr('fill', isFinal ? C.hiBord : C.sublabel)
            .attr('font-size', 9.5)
            .text(`Step ${i + 1}`)

          g.append('text')
            .attr('x', panelX + 10).attr('y', y0 + lineH * 0.75)
            .attr('fill', isFinal ? C.label : C.label)
            .attr('font-size', isFinal ? 12 : 11)
            .attr('font-weight', isFinal ? 700 : 400)
            .attr('font-family', 'monospace')
            .text(s2)
        }
      })

      // Identity note
      const noteY = panelY + numSteps * lineH + 2
      g.append('rect')
        .attr('x', panelX).attr('y', noteY)
        .attr('width', panelW).attr('height', 26)
        .attr('rx', 5)
        .attr('fill', isDark ? 'rgba(167,139,250,0.1)' : 'rgba(124,58,237,0.06)')
        .attr('stroke', C.step).attr('stroke-width', 1)
      g.append('text')
        .attr('x', panelX + 8).attr('y', noteY + 17)
        .attr('fill', C.step).attr('font-size', 9.5)
        .text('Key: ' + m.identityNote)
    }

    draw()
    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [mode, safeX, step])

  const m2 = MODES[mode]

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center px-2 pb-1 pt-1">
        <div className="flex gap-1">
          {MODES.map((md, i) => (
            <button key={i} onClick={() => { setMode(i); setStep(4) }}
              className={`px-3 py-1 rounded text-sm font-mono transition-colors ${
                mode === i
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}>
              {md.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span>x =</span>
          <input type="range"
            min={m2.xMin} max={m2.xMax} step={0.01}
            value={safeX}
            onChange={e => setXVal(parseFloat(e.target.value))}
            className="w-28 accent-amber-500"
          />
          <span className="font-mono w-12">{safeX.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span>Steps:</span>
          <input type="range" min={0} max={4} step={1}
            value={step}
            onChange={e => setStep(parseInt(e.target.value))}
            className="w-24 accent-violet-500"
          />
          <span className="font-mono">{step + 1}/5</span>
        </div>
      </div>

      <p className="px-2 pb-2 text-xs text-slate-500 dark:text-slate-400">
        The highlighted side is what we need to rewrite in terms of x using the Pythagorean identity.
        Drag x to see how the triangle — and the derivative value — changes.
      </p>
    </div>
  )
}
