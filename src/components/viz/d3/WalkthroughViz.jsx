import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'

const W = 560, H = 290
const M = { top: 28, right: 28, bottom: 42, left: 52 }
const N = 600

// ── compile string expression to a JS function ────────────────────────────────
function compile(expr) {
  if (typeof expr === 'function') return expr
  try {
    // eslint-disable-next-line no-new-func
    const f = new Function('x', `"use strict";
      const {sin,cos,tan,sqrt,abs,log,exp,PI,pow,min,max,atan,atan2,asin,acos,floor,ceil,round,sign} = Math;
      return (${expr})`)
    return (x) => {
      try { const y = f(x); return Number.isFinite(y) ? y : null }
      catch { return null }
    }
  } catch { return () => null }
}

function sampleFn(fn, xMin, xMax, n = N) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = xMin + (i / n) * (xMax - xMin)
    return [x, fn(x)]
  })
}

// split sampled points at nulls and large pixel jumps (discontinuities)
function segments(pts, ySc, jumpPx = 80) {
  const segs = []
  let seg = []
  for (const pt of pts) {
    if (pt[1] === null) {
      if (seg.length > 1) segs.push(seg)
      seg = []
      continue
    }
    if (seg.length > 0 && seg[seg.length - 1][1] !== null) {
      if (Math.abs(ySc(pt[1]) - ySc(seg[seg.length - 1][1])) > jumpPx) {
        if (seg.length > 1) segs.push(seg)
        seg = []
      }
    }
    seg.push(pt)
  }
  if (seg.length > 1) segs.push(seg)
  return segs
}

export default function WalkthroughViz({ params = {} }) {
  const svgRef = useRef(null)
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )

  // track theme changes
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains('dark'))
    )
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // ── color palette ───────────────────────────────────────────────────────
    const C = {
      grid:   isDark ? '#1e293b' : '#e2e8f0',
      axis:   isDark ? '#475569' : '#94a3b8',
      label:  isDark ? '#94a3b8' : '#64748b',
      curve1: '#6470f1',
      curve2: '#10b981',
      shadeI:  isDark ? 'rgba(100,112,241,0.28)' : 'rgba(100,112,241,0.20)',
      shadeIL: isDark ? 'rgba(100,112,241,0.22)' : 'rgba(100,112,241,0.16)', // left split
      shadeIR: isDark ? 'rgba(16,185,129,0.22)'  : 'rgba(16,185,129,0.16)',  // right split
      shadeP:  isDark ? 'rgba(34,197,94,0.32)'   : 'rgba(34,197,94,0.24)',
      shadeN:  isDark ? 'rgba(239,68,68,0.38)'   : 'rgba(239,68,68,0.28)',
      shadeB:  isDark ? 'rgba(34,197,94,0.28)'   : 'rgba(34,197,94,0.20)',
      shadeC:  'rgba(251,191,36,0.30)',
      limit:   '#f59e0b',
      dotBg:   isDark ? '#0f172a' : '#fff',
    }

    const { type = 'integral', xMin: xl = -1, xMax: xr = 5 } = params
    const a = params.a ?? xl
    const b = params.b ?? xr

    // ── compile functions ────────────────────────────────────────────────────
    const f1 = (params.fn ?? params.fn1) ? compile(params.fn ?? params.fn1) : null
    const f2 = params.fn2 ? compile(params.fn2) : null

    // ── sample full domain ───────────────────────────────────────────────────
    const pts1 = f1 ? sampleFn(f1, xl, xr) : []
    const pts2 = f2 ? sampleFn(f2, xl, xr) : []

    // ── y extent from all sampled values ─────────────────────────────────────
    const allY = [...pts1, ...pts2].map(p => p[1]).filter(y => y !== null && isFinite(y))
    if (!allY.length) return
    const [ylo, yhi] = d3.extent(allY)
    const pad = Math.max((yhi - ylo) * 0.18, 0.5)
    const yMin = Math.min(ylo - pad * 0.25, -pad * 0.25)
    const yMax = yhi + pad

    // ── scales ───────────────────────────────────────────────────────────────
    const xSc = d3.scaleLinear().domain([xl, xr]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([yMin, yMax]).range([H - M.bottom, M.top])
    const y0px = Math.max(M.top, Math.min(H - M.bottom, ySc(0)))
    const x0px = Math.max(M.left, Math.min(W - M.right, xSc(0)))

    // ── grid ─────────────────────────────────────────────────────────────────
    ySc.ticks(5).forEach(t => {
      svg.append('line').attr('x1', M.left).attr('x2', W - M.right)
        .attr('y1', ySc(t)).attr('y2', ySc(t))
        .attr('stroke', C.grid).attr('stroke-dasharray', '3,3')
    })
    xSc.ticks(7).forEach(t => {
      svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t))
        .attr('y1', M.top).attr('y2', H - M.bottom)
        .attr('stroke', C.grid).attr('stroke-dasharray', '3,3')
    })

    // ── axes ─────────────────────────────────────────────────────────────────
    svg.append('g').attr('transform', `translate(0,${y0px})`).call(d3.axisBottom(xSc).ticks(7)).attr('color', C.axis)
    svg.append('g').attr('transform', `translate(${x0px},0)`).call(d3.axisLeft(ySc).ticks(5)).attr('color', C.axis)

    // ── helpers ───────────────────────────────────────────────────────────────
    const lineGen = d3.line().x(d => xSc(d[0])).y(d => ySc(d[1])).defined(d => d[1] !== null)

    function drawCurve(pts, color, width = 2.5) {
      segments(pts, ySc).forEach(s =>
        svg.append('path').datum(s).attr('fill', 'none')
          .attr('stroke', color).attr('stroke-width', width).attr('d', lineGen)
      )
    }

    function limitLine(x, fn) {
      const yv = fn(x)
      if (yv === null) return
      svg.append('line')
        .attr('x1', xSc(x)).attr('x2', xSc(x)).attr('y1', y0px).attr('y2', ySc(yv))
        .attr('stroke', C.limit).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
      const lab = Number.isInteger(x) ? String(x) : x.toFixed(4).replace(/\.?0+$/, '')
      svg.append('text').attr('x', xSc(x)).attr('y', y0px + 16)
        .attr('text-anchor', 'middle').attr('font-size', 11)
        .attr('fill', C.limit).attr('font-weight', 'bold').text(lab)
    }

    function textLabel(txt, color, anchor, x, y) {
      svg.append('text').attr('x', x).attr('y', y)
        .attr('text-anchor', anchor).attr('font-size', 10)
        .attr('fill', color).attr('font-weight', 'bold').text(txt)
    }

    // ── type rendering ────────────────────────────────────────────────────────

    if (type === 'integral' && f1) {
      const aPts = sampleFn(f1, a, b, 400)
      const areaGen = d3.area().x(d => xSc(d[0])).y0(y0px).y1(d => ySc(d[1] ?? 0)).defined(d => d[1] !== null)
      svg.append('path').datum(aPts).attr('fill', C.shadeI).attr('d', areaGen)

      if (params.showAvg && params.avgValue != null) {
        const av = params.avgValue
        svg.append('line')
          .attr('x1', xSc(a)).attr('x2', xSc(b)).attr('y1', ySc(av)).attr('y2', ySc(av))
          .attr('stroke', C.limit).attr('stroke-width', 2).attr('stroke-dasharray', '6,3')
        svg.append('rect')
          .attr('x', xSc(b) + 4).attr('y', ySc(av) - 9).attr('width', 70).attr('height', 14)
          .attr('fill', C.dotBg).attr('rx', 3).attr('opacity', 0.85)
        svg.append('text').attr('x', xSc(b) + 8).attr('y', ySc(av) + 2)
          .attr('font-size', 10).attr('fill', C.limit).attr('font-weight', 'bold')
          .text(`favg = ${av}`)
      }

      limitLine(a, f1)
      limitLine(b, f1)
      drawCurve(pts1, C.curve1)
    }

    else if (type === 'split-integral' && f1) {
      const sp = params.split ?? (a + b) / 2
      const leftPts = sampleFn(f1, a, sp, 200)
      const rightPts = sampleFn(f1, sp, b, 200)
      const mkArea = () => d3.area().x(d => xSc(d[0])).y0(y0px).y1(d => ySc(d[1] ?? 0)).defined(d => d[1] !== null)
      svg.append('path').datum(leftPts).attr('fill', C.shadeIL).attr('d', mkArea())
      svg.append('path').datum(rightPts).attr('fill', C.shadeIR).attr('d', mkArea())
      // split marker
      const ysp = f1(sp)
      if (ysp !== null) {
        svg.append('line').attr('x1', xSc(sp)).attr('x2', xSc(sp)).attr('y1', y0px).attr('y2', ySc(ysp))
          .attr('stroke', C.axis).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
        svg.append('text').attr('x', xSc(sp)).attr('y', y0px + 16)
          .attr('text-anchor', 'middle').attr('font-size', 11)
          .attr('fill', C.axis).attr('font-weight', 'bold').text(sp)
      }
      limitLine(a, f1)
      limitLine(b, f1)
      drawCurve(pts1, C.curve1)
    }

    else if (type === 'signed-area' && f1) {
      const aPts = sampleFn(f1, a, b, 400)
      const areaPos = d3.area().x(d => xSc(d[0])).y0(y0px).y1(d => ySc(Math.max(0, d[1] ?? 0))).defined(d => d[1] !== null)
      const areaNeg = d3.area().x(d => xSc(d[0])).y0(y0px).y1(d => ySc(Math.min(0, d[1] ?? 0))).defined(d => d[1] !== null)
      svg.append('path').datum(aPts).attr('fill', C.shadeP).attr('d', areaPos)
      svg.append('path').datum(aPts).attr('fill', C.shadeN).attr('d', areaNeg)

      // auto-detect pos/neg stretches for +/− labels
      const posXs = [], negXs = []
      for (const [x, y] of aPts) {
        if (y === null) continue
        if (y >= 0) posXs.push(x); else negXs.push(x)
      }
      if (posXs.length) {
        const mx = (posXs[0] + posXs[posXs.length - 1]) / 2
        const my = f1(mx)
        if (my !== null && my > 0)
          svg.append('text').attr('x', xSc(mx)).attr('y', ySc(my * 0.5) - 4)
            .attr('text-anchor', 'middle').attr('font-size', 14)
            .attr('fill', '#16a34a').attr('font-weight', 'bold').attr('opacity', 0.85).text('+')
      }
      if (negXs.length) {
        const mx = (negXs[0] + negXs[negXs.length - 1]) / 2
        const my = f1(mx)
        if (my !== null && my < 0)
          svg.append('text').attr('x', xSc(mx)).attr('y', ySc(my * 0.5) + 14)
            .attr('text-anchor', 'middle').attr('font-size', 14)
            .attr('fill', '#dc2626').attr('font-weight', 'bold').attr('opacity', 0.85).text('\u2212')
      }

      limitLine(a, f1)
      limitLine(b, f1)
      drawCurve(pts1, C.curve1)
    }

    else if (type === 'area-between' && f1 && f2) {
      const xPts = Array.from({ length: 300 }, (_, i) => [a + (i / 299) * (b - a)])
      const areaGen = d3.area()
        .x(d => xSc(d[0]))
        .y0(d => ySc(f2(d[0]) ?? 0))
        .y1(d => ySc(f1(d[0]) ?? 0))
        .defined(d => f1(d[0]) !== null && f2(d[0]) !== null)
      svg.append('path').datum(xPts).attr('fill', C.shadeB).attr('d', areaGen)

      drawCurve(pts1, C.curve1)
      drawCurve(pts2, C.curve2)

      // intersection dots
      ;(params.intersections ?? []).forEach(xi => {
        const yi = f1(xi)
        if (yi !== null)
          svg.append('circle').attr('cx', xSc(xi)).attr('cy', ySc(yi)).attr('r', 5)
            .attr('fill', C.limit).attr('stroke', C.dotBg).attr('stroke-width', 2)
      })

      // curve labels at right edge
      const rx = xr - (xr - xl) * 0.08
      const y1r = f1(rx), y2r = f2(rx)
      if (params.label1 && y1r !== null) textLabel(params.label1, C.curve1, 'end', W - M.right - 4, ySc(y1r) - 5)
      if (params.label2 && y2r !== null) textLabel(params.label2, C.curve2, 'end', W - M.right - 4, ySc(y2r) + 12)
    }

    else if (type === 'comparison' && f1 && f2) {
      const xPts = Array.from({ length: 300 }, (_, i) => [a + (i / 299) * (b - a)])
      const areaGen = d3.area()
        .x(d => xSc(d[0]))
        .y0(d => ySc(Math.min(f1(d[0]) ?? 0, f2(d[0]) ?? 0)))
        .y1(d => ySc(Math.max(f1(d[0]) ?? 0, f2(d[0]) ?? 0)))
        .defined(d => f1(d[0]) !== null && f2(d[0]) !== null)
      svg.append('path').datum(xPts).attr('fill', C.shadeC).attr('d', areaGen)

      drawCurve(pts1, C.curve1)
      drawCurve(pts2, C.curve2)

      const rx = xr - (xr - xl) * 0.08
      const y1r = f1(rx), y2r = f2(rx)
      if (params.label1 && y1r !== null) textLabel(params.label1, C.curve1, 'end', W - M.right - 4, ySc(y1r) - 5)
      if (params.label2 && y2r !== null) textLabel(params.label2, C.curve2, 'end', W - M.right - 4, ySc(y2r) + 12)
    }

    // top label (single-function types)
    if (params.label && ['integral', 'split-integral', 'signed-area'].includes(type)) {
      svg.append('text').attr('x', W / 2).attr('y', M.top - 9)
        .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', C.label)
        .text(params.label)
    }

  }, [params, isDark])

  return (
    <div className="w-full px-2 pt-2 pb-1">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full" />
    </div>
  )
}
