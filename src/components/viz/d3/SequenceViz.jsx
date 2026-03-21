import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 600, H = 360
const M = { top: 24, right: 24, bottom: 44, left: 60 }
const N_MAX = 50

const SEQUENCES = {
  '1/n': {
    term: n => 1 / n,
    limit: 0,
    label: '1/n',
    diverges: false,
  },
  '(−1)ⁿ/n': {
    term: n => Math.pow(-1, n) / n,
    limit: 0,
    label: '(−1)ⁿ/n',
    diverges: false,
  },
  '(1+1/n)ⁿ → e': {
    term: n => Math.pow(1 + 1 / n, n),
    limit: Math.E,
    label: '(1+1/n)ⁿ',
    diverges: false,
  },
  'n/(n+1)': {
    term: n => n / (n + 1),
    limit: 1,
    label: 'n/(n+1)',
    diverges: false,
  },
  'sin(n)/n': {
    term: n => Math.sin(n) / n,
    limit: 0,
    label: 'sin(n)/n',
    diverges: false,
  },
  '(−1)ⁿ (diverges)': {
    term: n => Math.pow(-1, n),
    limit: null,
    label: '(−1)ⁿ',
    diverges: true,
  },
}

export default function SequenceViz({ params }) {
  const svgRef = useRef(null)
  const [seqKey, setSeqKey] = useState('1/n')
  const [epsilon, setEpsilon] = useState(0.25)
  const [visible, setVisible] = useState(N_MAX)
  const [animating, setAnimating] = useState(false)
  const animRef = useRef(null)

  const seq = SEQUENCES[seqKey]

  const startAnimate = () => {
    setVisible(1)
    setAnimating(true)
  }

  useEffect(() => {
    if (!animating) return
    if (visible >= N_MAX) { setAnimating(false); return }
    animRef.current = setTimeout(() => setVisible(v => v + 1), 60)
    return () => clearTimeout(animRef.current)
  }, [animating, visible])

  useEffect(() => {
    setVisible(N_MAX)
    setAnimating(false)
    clearTimeout(animRef.current)
  }, [seqKey])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const terms = d3.range(1, N_MAX + 1).map(n => ({ n, val: seq.term(n) }))
    const visTerms = terms.slice(0, visible)

    const vals = terms.map(t => t.val)
    const [yMin, yMax] = d3.extent(vals)
    const yPad = Math.max((yMax - yMin) * 0.25, 0.2)
    const L = seq.limit
    const domMin = L !== null ? Math.min(yMin - yPad, L - epsilon * 1.5) : yMin - yPad
    const domMax = L !== null ? Math.max(yMax + yPad, L + epsilon * 1.5) : yMax + yPad

    const xSc = d3.scaleLinear().domain([0, N_MAX + 1]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([domMin, domMax]).range([H - M.bottom, M.top])

    // Grid
    xSc.ticks(8).forEach(t => svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t)).attr('y1', M.top).attr('y2', H - M.bottom).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))
    ySc.ticks(6).forEach(t => svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(t)).attr('y2', ySc(t)).attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'))

    // Axes
    svg.append('g').attr('transform', `translate(0,${H - M.bottom})`).call(d3.axisBottom(xSc).ticks(8).tickFormat(d => `n=${d}`)).attr('color', '#94a3b8')
    svg.append('g').attr('transform', `translate(${M.left},0)`).call(d3.axisLeft(ySc).ticks(6)).attr('color', '#94a3b8')

    // Epsilon band
    if (L !== null) {
      const bandTop = ySc(L + epsilon)
      const bandBot = ySc(L - epsilon)
      svg.append('rect')
        .attr('x', M.left).attr('y', bandTop)
        .attr('width', W - M.left - M.right)
        .attr('height', Math.max(bandBot - bandTop, 1))
        .attr('fill', '#10b981').attr('fill-opacity', 0.15)

      // Limit line
      svg.append('line').attr('x1', M.left).attr('x2', W - M.right).attr('y1', ySc(L)).attr('y2', ySc(L))
        .attr('stroke', '#10b981').attr('stroke-width', 2).attr('stroke-dasharray', '8,4')
      svg.append('text').attr('x', W - M.right - 4).attr('y', ySc(L) - 5).attr('text-anchor', 'end')
        .attr('font-size', 11).attr('fill', '#10b981').attr('font-weight', 'bold')
        .text(`L = ${L.toFixed(4)}`)

      // ε labels
      svg.append('text').attr('x', W - M.right + 2).attr('y', ySc(L + epsilon) + 4).attr('font-size', 10).attr('fill', '#10b981').text(`+ε`)
      svg.append('text').attr('x', W - M.right + 2).attr('y', ySc(L - epsilon) + 4).attr('font-size', 10).attr('fill', '#10b981').text(`−ε`)

      // Find N (first index where all subsequent terms are within ε)
      let N = null
      for (let i = 1; i <= N_MAX; i++) {
        const allIn = terms.slice(i - 1).every(t => Math.abs(t.val - L) < epsilon)
        if (allIn) { N = i; break }
      }
      if (N !== null) {
        const nx = xSc(N)
        svg.append('line').attr('x1', nx).attr('x2', nx).attr('y1', M.top).attr('y2', H - M.bottom)
          .attr('stroke', '#f59e0b').attr('stroke-width', 1.5).attr('stroke-dasharray', '5,4')
        svg.append('text').attr('x', nx + 3).attr('y', M.top + 14).attr('font-size', 11).attr('fill', '#f59e0b').text(`N=${N}`)
      }
    } else {
      // Divergent: just show a note
      svg.append('text').attr('x', W / 2).attr('y', M.top + 14).attr('text-anchor', 'middle')
        .attr('font-size', 12).attr('fill', '#ef4444').attr('font-weight', 'bold').text('Diverges — no finite limit')
    }

    // Dots
    visTerms.forEach(({ n, val }) => {
      const inBand = L !== null && Math.abs(val - L) < epsilon
      svg.append('circle')
        .attr('cx', xSc(n)).attr('cy', ySc(val)).attr('r', 4)
        .attr('fill', inBand ? '#10b981' : '#6366f1')
        .attr('stroke', 'white').attr('stroke-width', 1.5)
    })

    // Axis labels
    svg.append('text').attr('x', W / 2).attr('y', H - 2).attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#64748b').text('n')
    svg.append('text').attr('x', 14).attr('y', M.top - 4).attr('font-size', 11).attr('fill', '#64748b').text('aₙ')

  }, [seq, epsilon, visible])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3 px-2">
        {Object.keys(SEQUENCES).map(k => (
          <button key={k} onClick={() => setSeqKey(k)}
            className={`px-2 py-1 rounded text-xs transition-colors ${k === seqKey ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >aₙ = {SEQUENCES[k].label}</button>
        ))}
      </div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible" />
      <div className="px-4 mt-2 space-y-2">
        {!seq.diverges && (
          <SliderControl label={`ε = ${epsilon.toFixed(2)}`} min={0.01} max={0.5} step={0.01} value={epsilon} onChange={setEpsilon} />
        )}
        <div className="flex items-center gap-3">
          <button onClick={startAnimate} disabled={animating}
            className="px-3 py-1.5 rounded text-sm bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50">
            {animating ? `Animating… (${visible}/${N_MAX})` : 'Animate dots'}
          </button>
          {animating && (
            <button onClick={() => { setAnimating(false); setVisible(N_MAX) }}
              className="px-3 py-1.5 rounded text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              Skip
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-center mt-2 text-slate-500 dark:text-slate-400">
        Green band = ε-neighborhood of L. Green dots = terms within ε. Yellow line = N (all terms after are in band).
      </p>
    </div>
  )
}
