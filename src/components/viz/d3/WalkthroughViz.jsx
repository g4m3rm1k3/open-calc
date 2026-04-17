/**
 * WalkthroughViz — formula-driven, flag-based graph renderer.
 *
 * Add to any walkthrough via svgId + vizProps. No code changes needed for new examples.
 *
 * vizProps reference:
 *   fn          — string expression for f(x), e.g. 'x*x + 2*x'
 *   fn1, fn2    — two functions for two-curve scenes
 *   a, b        — interval of interest [a,b] (limit lines + shading)
 *   xMin, xMax  — display domain (defaults to [a - pad, b + pad])
 *
 *   signed      — bool: green above x-axis, red below
 *   split       — x value: split shading into two colors at this point
 *   comparison  — bool: when fn1+fn2 present, highlight gap on [a,b]
 *   rects       — number: draw N Riemann rectangles
 *   method      — 'left' | 'right' | 'midpoint' (default 'left', used with rects)
 *   avgValue    — number: draw horizontal dashed average-value line at this y
 *   intersections — [x,...]: draw dots where the two curves cross
 *
 *   label       — curve label (single-function scenes)
 *   label1      — label for fn1 / fn (two-curve scenes)
 *   label2      — label for fn2
 */
import * as d3 from 'd3'
import { useRef, useEffect, useState } from 'react'

const W = 560, H = 290
const M = { top: 28, right: 28, bottom: 42, left: 52 }
const SAMPLES = 600

// ── compile string → function ─────────────────────────────────────────────────
function compile(expr) {
  if (typeof expr === 'function') return expr
  try {
    // eslint-disable-next-line no-new-func
    const f = new Function('x', `"use strict";
      const {sin,cos,tan,sqrt,abs,log,exp,PI,pow,min,max,
             atan,atan2,asin,acos,floor,ceil,round,sign,sinh,cosh,tanh} = Math;
      return (${expr})`)
    return (x) => { try { const y = f(x); return Number.isFinite(y) ? y : null } catch { return null } }
  } catch { return () => null }
}

function sampleFn(fn, lo, hi, n = SAMPLES) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = lo + (i / n) * (hi - lo)
    return [x, fn(x)]
  })
}

// split sampled points at nulls or large pixel jumps (discontinuities)
function toSegments(pts, ySc, jumpPx = 80) {
  const segs = []
  let seg = []
  for (const pt of pts) {
    if (pt[1] === null) { if (seg.length > 1) segs.push(seg); seg = []; continue }
    if (seg.length > 0 && seg[seg.length - 1][1] !== null &&
        Math.abs(ySc(pt[1]) - ySc(seg[seg.length - 1][1])) > jumpPx) {
      if (seg.length > 1) segs.push(seg); seg = []
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

  useEffect(() => {
    const obs = new MutationObserver(() => setIsDark(document.documentElement.classList.contains('dark')))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // ── palette ───────────────────────────────────────────────────────────────
    const C = {
      grid:   isDark ? '#1e293b' : '#e2e8f0',
      axis:   isDark ? '#475569' : '#94a3b8',
      muted:  isDark ? '#94a3b8' : '#64748b',
      curve1: '#6470f1',
      curve2: '#10b981',
      dotBg:  isDark ? '#0f172a' : '#fff',
      shadeBasic: isDark ? 'rgba(100,112,241,0.28)' : 'rgba(100,112,241,0.20)',
      shadeLeft:  isDark ? 'rgba(100,112,241,0.28)' : 'rgba(100,112,241,0.20)',
      shadeRight: isDark ? 'rgba(16,185,129,0.28)'  : 'rgba(16,185,129,0.20)',
      shadePos:   isDark ? 'rgba(34,197,94,0.32)'   : 'rgba(34,197,94,0.24)',
      shadeNeg:   isDark ? 'rgba(239,68,68,0.38)'   : 'rgba(239,68,68,0.28)',
      shadeBetween: isDark ? 'rgba(34,197,94,0.28)' : 'rgba(34,197,94,0.20)',
      shadeCompare: 'rgba(251,191,36,0.30)',
      rects:  isDark ? 'rgba(100,112,241,0.30)'     : 'rgba(100,112,241,0.25)',
      limit:  '#f59e0b',
    }

    // ── parse params ──────────────────────────────────────────────────────────
    const f1raw = params.fn ?? params.fn1
    const f2raw = params.fn2
    const f1 = f1raw ? compile(f1raw) : null
    const f2 = f2raw ? compile(f2raw) : null

    // infer scene from what's present
    const hasTwoFns   = !!(f1 && f2)
    const isComparison = hasTwoFns && !!params.comparison
    const isAreaBetween = hasTwoFns && !params.comparison
    const isSigned    = !!params.signed && !hasTwoFns
    const splitAt     = params.split != null ? params.split : null
    const hasRects    = !!(params.rects && params.rects > 0)
    const hasAvg      = params.avgValue != null
    const method      = params.method ?? 'left'

    if (!f1 && !f2) return

    const a = params.a
    const b = params.b
    const hasInterval = a != null && b != null

    // ── domain ────────────────────────────────────────────────────────────────
    const intervalPad = hasInterval ? Math.max((b - a) * 0.35, 0.5) : 1
    const xl = params.xMin ?? (hasInterval ? a - intervalPad : -2)
    const xr = params.xMax ?? (hasInterval ? b + intervalPad :  5)

    // ── sample ────────────────────────────────────────────────────────────────
    const pts1 = f1 ? sampleFn(f1, xl, xr) : []
    const pts2 = f2 ? sampleFn(f2, xl, xr) : []

    // ── y extent ──────────────────────────────────────────────────────────────
    // include rect tops if rects requested
    let extraY = []
    if (hasRects && f1 && hasInterval) {
      const dx = (b - a) / params.rects
      for (let i = 0; i < params.rects; i++) {
        const xl2 = a + i * dx
        const sx = method === 'left' ? xl2 : method === 'right' ? xl2 + dx : xl2 + dx / 2
        const y = f1(sx)
        if (y !== null) extraY.push(y)
      }
    }
    const allY = [...pts1, ...pts2, ...extraY.map(y => [0, y])]
      .map(p => p[1]).filter(y => y !== null && isFinite(y))
    if (!allY.length) return
    const [ylo, yhi] = d3.extent(allY)
    const pad = Math.max((yhi - ylo) * 0.18, 0.5)
    const yMin = Math.min(ylo - pad * 0.25, -pad * 0.25)
    const yMax = yhi + pad

    // ── scales ────────────────────────────────────────────────────────────────
    const xSc = d3.scaleLinear().domain([xl, xr]).range([M.left, W - M.right])
    const ySc = d3.scaleLinear().domain([yMin, yMax]).range([H - M.bottom, M.top])
    const y0px = Math.max(M.top, Math.min(H - M.bottom, ySc(0)))
    const x0px = Math.max(M.left, Math.min(W - M.right, xSc(0)))

    // ── grid ──────────────────────────────────────────────────────────────────
    ySc.ticks(5).forEach(t =>
      svg.append('line').attr('x1', M.left).attr('x2', W - M.right)
        .attr('y1', ySc(t)).attr('y2', ySc(t))
        .attr('stroke', C.grid).attr('stroke-dasharray', '3,3'))
    xSc.ticks(7).forEach(t =>
      svg.append('line').attr('x1', xSc(t)).attr('x2', xSc(t))
        .attr('y1', M.top).attr('y2', H - M.bottom)
        .attr('stroke', C.grid).attr('stroke-dasharray', '3,3'))

    // ── axes ──────────────────────────────────────────────────────────────────
    svg.append('g').attr('transform', `translate(0,${y0px})`).call(d3.axisBottom(xSc).ticks(7)).attr('color', C.axis)
    svg.append('g').attr('transform', `translate(${x0px},0)`).call(d3.axisLeft(ySc).ticks(5)).attr('color', C.axis)

    // ── helpers ───────────────────────────────────────────────────────────────
    const lineGen = d3.line().x(d => xSc(d[0])).y(d => ySc(d[1])).defined(d => d[1] !== null)

    function drawCurve(pts, color, width = 2.5) {
      toSegments(pts, ySc).forEach(s =>
        svg.append('path').datum(s).attr('fill', 'none')
          .attr('stroke', color).attr('stroke-width', width).attr('d', lineGen))
    }

    function xLabel(x) {
      return Number.isInteger(x) ? String(x) : x.toFixed(4).replace(/\.?0+$/, '')
    }

    function limitLine(x, fn) {
      const yv = fn(x)
      if (yv === null) return
      svg.append('line')
        .attr('x1', xSc(x)).attr('x2', xSc(x)).attr('y1', y0px).attr('y2', ySc(yv))
        .attr('stroke', C.limit).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
      svg.append('text').attr('x', xSc(x)).attr('y', y0px + 16)
        .attr('text-anchor', 'middle').attr('font-size', 11)
        .attr('fill', C.limit).attr('font-weight', 'bold').text(xLabel(x))
    }

    function txtLabel(txt, color, anchor, x, y) {
      svg.append('text').attr('x', x).attr('y', y)
        .attr('text-anchor', anchor).attr('font-size', 10)
        .attr('fill', color).attr('font-weight', 'bold').text(txt)
    }

    function makeArea(y0fn) {
      return d3.area().x(d => xSc(d[0])).y0(y0fn).y1(d => ySc(d[1] ?? 0)).defined(d => d[1] !== null)
    }

    // ── LAYER 1: shading ──────────────────────────────────────────────────────

    if (hasInterval && f1) {
      if (isSigned) {
        const aPts = sampleFn(f1, a, b, 400)
        const areaPos = d3.area().x(d => xSc(d[0])).y0(y0px).y1(d => ySc(Math.max(0, d[1] ?? 0))).defined(d => d[1] !== null)
        const areaNeg = d3.area().x(d => xSc(d[0])).y0(y0px).y1(d => ySc(Math.min(0, d[1] ?? 0))).defined(d => d[1] !== null)
        svg.append('path').datum(aPts).attr('fill', C.shadePos).attr('d', areaPos)
        svg.append('path').datum(aPts).attr('fill', C.shadeNeg).attr('d', areaNeg)

        // +/− labels at centroid of each signed region
        const posXs = [], negXs = []
        for (const [x, y] of aPts) { if (y === null) continue; (y >= 0 ? posXs : negXs).push(x) }
        if (posXs.length) {
          const mx = (posXs[0] + posXs[posXs.length - 1]) / 2, my = f1(mx)
          if (my !== null && my > 0)
            svg.append('text').attr('x', xSc(mx)).attr('y', ySc(my * 0.5) - 4)
              .attr('text-anchor', 'middle').attr('font-size', 14)
              .attr('fill', '#16a34a').attr('font-weight', 'bold').attr('opacity', 0.85).text('+')
        }
        if (negXs.length) {
          const mx = (negXs[0] + negXs[negXs.length - 1]) / 2, my = f1(mx)
          if (my !== null && my < 0)
            svg.append('text').attr('x', xSc(mx)).attr('y', ySc(my * 0.5) + 14)
              .attr('text-anchor', 'middle').attr('font-size', 14)
              .attr('fill', '#dc2626').attr('font-weight', 'bold').attr('opacity', 0.85).text('\u2212')
        }
      } else if (splitAt != null) {
        const leftPts  = sampleFn(f1, a, splitAt, 200)
        const rightPts = sampleFn(f1, splitAt, b, 200)
        svg.append('path').datum(leftPts).attr('fill', C.shadeLeft).attr('d', makeArea(y0px))
        svg.append('path').datum(rightPts).attr('fill', C.shadeRight).attr('d', makeArea(y0px))
        // split marker line
        const ysp = f1(splitAt)
        if (ysp !== null)
          svg.append('line').attr('x1', xSc(splitAt)).attr('x2', xSc(splitAt))
            .attr('y1', y0px).attr('y2', ySc(ysp))
            .attr('stroke', C.axis).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3')
      } else if (!hasTwoFns) {
        const aPts = sampleFn(f1, a, b, 400)
        svg.append('path').datum(aPts).attr('fill', C.shadeBasic).attr('d', makeArea(y0px))
      }
    }

    if (isAreaBetween && hasInterval) {
      const xPts = Array.from({ length: 300 }, (_, i) => [a + (i / 299) * (b - a)])
      const areaGen = d3.area()
        .x(d => xSc(d[0]))
        .y0(d => ySc(f2(d[0]) ?? 0))
        .y1(d => ySc(f1(d[0]) ?? 0))
        .defined(d => f1(d[0]) !== null && f2(d[0]) !== null)
      svg.append('path').datum(xPts).attr('fill', C.shadeBetween).attr('d', areaGen)
    }

    if (isComparison && hasInterval) {
      const xPts = Array.from({ length: 300 }, (_, i) => [a + (i / 299) * (b - a)])
      const areaGen = d3.area()
        .x(d => xSc(d[0]))
        .y0(d => ySc(Math.min(f1(d[0]) ?? 0, f2(d[0]) ?? 0)))
        .y1(d => ySc(Math.max(f1(d[0]) ?? 0, f2(d[0]) ?? 0)))
        .defined(d => f1(d[0]) !== null && f2(d[0]) !== null)
      svg.append('path').datum(xPts).attr('fill', C.shadeCompare).attr('d', areaGen)
    }

    // ── LAYER 2: Riemann rectangles ───────────────────────────────────────────

    if (hasRects && f1 && hasInterval) {
      const n = params.rects
      const dx = (b - a) / n
      for (let i = 0; i < n; i++) {
        const xl2 = a + i * dx
        const xr2 = xl2 + dx
        const sx = method === 'left' ? xl2 : method === 'right' ? xr2 : xl2 + dx / 2
        const h = f1(sx)
        if (h === null) continue
        svg.append('rect')
          .attr('x', xSc(xl2))
          .attr('y', h >= 0 ? ySc(h) : y0px)
          .attr('width', xSc(xr2) - xSc(xl2))
          .attr('height', Math.abs(y0px - ySc(h)))
          .attr('fill', C.rects)
          .attr('stroke', C.curve1)
          .attr('stroke-width', 1)
      }
    }

    // ── LAYER 3: average value line ───────────────────────────────────────────

    if (hasAvg && hasInterval) {
      const av = params.avgValue
      svg.append('line')
        .attr('x1', xSc(a)).attr('x2', xSc(b)).attr('y1', ySc(av)).attr('y2', ySc(av))
        .attr('stroke', C.limit).attr('stroke-width', 2).attr('stroke-dasharray', '6,3')
      svg.append('rect')
        .attr('x', xSc(b) + 4).attr('y', ySc(av) - 9).attr('width', 72).attr('height', 14)
        .attr('fill', C.dotBg).attr('rx', 3).attr('opacity', 0.85)
      svg.append('text').attr('x', xSc(b) + 8).attr('y', ySc(av) + 2)
        .attr('font-size', 10).attr('fill', C.limit).attr('font-weight', 'bold')
        .text(`favg = ${av}`)
    }

    // ── LAYER 4: curves ───────────────────────────────────────────────────────

    if (f1) drawCurve(pts1, C.curve1)
    if (f2) drawCurve(pts2, C.curve2)

    // ── LAYER 5: limit lines at a, b ──────────────────────────────────────────

    if (hasInterval && f1) { limitLine(a, f1); limitLine(b, f1) }

    // ── LAYER 6: intersection dots ────────────────────────────────────────────

    ;(params.intersections ?? []).forEach(xi => {
      const yi = (f1 ?? f2)(xi)
      if (yi !== null)
        svg.append('circle').attr('cx', xSc(xi)).attr('cy', ySc(yi)).attr('r', 5)
          .attr('fill', C.limit).attr('stroke', C.dotBg).attr('stroke-width', 2)
    })

    // ── LAYER 7: curve labels ─────────────────────────────────────────────────

    const rx = xr - (xr - xl) * 0.08
    if (hasTwoFns) {
      const y1r = f1(rx), y2r = f2(rx)
      if (params.label1 && y1r !== null) txtLabel(params.label1, C.curve1, 'end', W - M.right - 4, ySc(y1r) - 5)
      if (params.label2 && y2r !== null) txtLabel(params.label2, C.curve2, 'end', W - M.right - 4, ySc(y2r) + 12)
    } else if (params.label) {
      svg.append('text').attr('x', W / 2).attr('y', M.top - 9)
        .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', C.muted)
        .text(params.label)
    }

  }, [params, isDark])

  return (
    <div className="w-full px-2 pt-2 pb-1">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full" />
    </div>
  )
}
