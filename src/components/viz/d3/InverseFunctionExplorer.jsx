import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { parse, derivative } from 'mathjs'
import KatexBlock from '../../math/KatexBlock.jsx'

const X_MIN = -5
const X_MAX = 5
const Y_MIN = -5
const Y_MAX = 5
const STORAGE_KEY = 'inverse-function-explorer-dashboard-v1'

const EXAMPLES = [
  'x^3 + x',
  'exp(x)',
  'log(x + 3)',
  'x^3 + 2*x',
  'sin(x)',
  'x^2',
]

function preprocess(input) {
  return String(input || '')
    .replace(/\*\*/g, '^')
    .replace(/\s+/g, '')
}

function loadDashboardState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const v = raw ? JSON.parse(raw) : null
    if (!v || typeof v !== 'object') return null
    return v
  } catch {
    return null
  }
}

function saveDashboardState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Best effort persistence.
  }
}

function makeFunction(expr) {
  const node = parse(expr)
  const compiled = node.compile()

  return (x) => {
    try {
      return compiled.evaluate({ x })
    } catch {
      return NaN
    }
  }
}

function derivativeTex(expr) {
  try {
    return derivative(parse(expr), 'x').toTex({ parenthesis: 'auto' })
  } catch {
    return ''
  }
}

function numericDerivative(f, x, h = 1e-5) {
  return (f(x + h) - f(x - h)) / (2 * h)
}

function inverseNewton(f, df, y, guess = 0, min = X_MIN, max = X_MAX) {
  let x = guess
  for (let i = 0; i < 12; i += 1) {
    const fx = f(x) - y
    if (!Number.isFinite(fx)) return NaN
    if (Math.abs(fx) < 1e-8) return x

    const dfx = df(x)
    if (!Number.isFinite(dfx) || Math.abs(dfx) < 1e-9) break

    const next = x - fx / dfx
    if (!Number.isFinite(next)) break
    x = Math.max(min, Math.min(max, next))
  }

  const residual = Math.abs(f(x) - y)
  return Number.isFinite(residual) && residual < 1e-3 ? x : NaN
}

function isMonotonic(f, min = -5, max = 5) {
  const step = 0.1
  const vals = []
  for (let x = min; x <= max; x += step) {
    const v = f(x)
    if (Number.isFinite(v)) vals.push(v)
  }

  if (vals.length < 6) return false

  let dir = 0
  for (let i = 1; i < vals.length; i += 1) {
    const delta = vals[i] - vals[i - 1]
    if (Math.abs(delta) < 1e-7) continue
    const s = Math.sign(delta)
    if (dir === 0) dir = s
    else if (s !== dir) return false
  }

  return dir !== 0
}

function nearestFiniteX(f, target, min = X_MIN, max = X_MAX, step = 0.05) {
  let bestX = null
  let bestDist = Infinity
  for (let x = min; x <= max; x += step) {
    const y = f(x)
    if (!Number.isFinite(y)) continue
    const d = Math.abs(x - target)
    if (d < bestDist) {
      bestDist = d
      bestX = x
    }
  }
  return bestX
}

function buildLocalInverseBranch(
  f,
  df,
  anchorX,
  xMin = X_MIN,
  xMax = X_MAX,
  yMin = Y_MIN,
  yMax = Y_MAX,
  step = 0.08,
) {
  const ys = d3.range(yMin, yMax + step, step)
  const branch = []
  let guess = anchorX

  for (let i = 0; i < ys.length; i += 1) {
    const y = ys[i]
    const x = inverseNewton(f, df, y, guess, xMin, xMax)

    if (Number.isFinite(x)) {
      guess = x
      branch.push({ x: y, y: x })
    } else {
      branch.push({ x: y, y: NaN })
    }
  }

  return branch
}

function formatNum(v, digits = 4) {
  if (!Number.isFinite(v)) return 'undefined'
  return Number(v).toFixed(digits)
}

function findNearestMonotonicBranch(f, df, x0, min, max) {
  const span = Math.max(0.25, max - min)
  const step = Math.max(0.01, span / 500)
  const slopeEps = 1e-5

  const signAt = (x) => {
    const d = df(x)
    if (!Number.isFinite(d) || Math.abs(d) < slopeEps) return 0
    return Math.sign(d)
  }

  let baseSign = signAt(x0)
  if (baseSign === 0) {
    for (let k = 1; k <= 60 && baseSign === 0; k += 1) {
      const left = x0 - k * step
      const right = x0 + k * step
      if (left >= min) baseSign = signAt(left)
      if (baseSign === 0 && right <= max) baseSign = signAt(right)
    }
  }
  if (baseSign === 0) return null

  let leftBound = x0
  for (let x = x0 - step; x >= min; x -= step) {
    const s = signAt(x)
    if (s === 0) continue
    if (s !== baseSign) break
    leftBound = x
  }

  let rightBound = x0
  for (let x = x0 + step; x <= max; x += step) {
    const s = signAt(x)
    if (s === 0) continue
    if (s !== baseSign) break
    rightBound = x
  }

  const pad = step * 4
  const left = Math.max(min, leftBound - pad)
  const right = Math.min(max, rightBound + pad)

  if (!(right - left > 0.1)) return null
  return { left, right, sign: baseSign }
}

function HelpTip({ title, body }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 16,
          height: 16,
          borderRadius: '50%',
          border: '1px solid #64748b88',
          color: '#64748b',
          fontSize: 11,
          fontWeight: 700,
          cursor: 'help',
        }}
      >
        ?
      </span>
      <span
        style={{
          position: 'absolute',
          top: 20,
          right: 0,
          zIndex: 20,
          width: 260,
          opacity: 0,
          pointerEvents: 'none',
          transform: 'translateY(-4px)',
          transition: 'opacity 140ms ease, transform 140ms ease',
          background: 'rgba(15,23,42,0.74)',
          color: '#f8fafc',
          border: '1px solid rgba(148,163,184,0.35)',
          borderRadius: 10,
          padding: '10px 12px',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 10px 24px rgba(2,6,23,0.35)',
        }}
        className="inverse-help-tip"
      >
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, lineHeight: 1.55 }}>{body}</div>
      </span>
    </span>
  )
}

export default function InverseFunctionExplorer({ params = {} }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const autoBranchRef = useRef('')

  const persisted = useMemo(() => loadDashboardState(), [])

  const [input, setInput] = useState(persisted?.input || 'x^3 + x')
  const [xVal, setXVal] = useState(Number.isFinite(persisted?.xVal) ? persisted.xVal : 1)
  const [xMin, setXMin] = useState(Number.isFinite(persisted?.xMin) ? persisted.xMin : -5)
  const [xMax, setXMax] = useState(Number.isFinite(persisted?.xMax) ? persisted.xMax : 5)
  const [yMin, setYMin] = useState(Number.isFinite(persisted?.yMin) ? persisted.yMin : -5)
  const [yMax, setYMax] = useState(Number.isFinite(persisted?.yMax) ? persisted.yMax : 5)
  const [error, setError] = useState('')
  const [valid, setValid] = useState(true)
  const [autoClipMessage, setAutoClipMessage] = useState('')
  const [inverseMode, setInverseMode] = useState(persisted?.inverseMode || 'auto')
  const [verifyTick, setVerifyTick] = useState(0)
  const [readout, setReadout] = useState({
    activeX: NaN,
    yVal: NaN,
    invX: NaN,
    slope: NaN,
    invSlope: NaN,
    product: NaN,
    modeUsed: 'none',
  })

  const expr = preprocess(input)
  const fTex = useMemo(() => {
    try {
      return parse(expr).toTex({ parenthesis: 'auto' })
    } catch {
      return ''
    }
  }, [expr])

  const dfTex = useMemo(() => derivativeTex(expr), [expr])
  const inverseRuleTex = useMemo(() => {
    if (!dfTex) return ''
    return `\\left(f^{-1}\\right)'\\big(f(x_0)\\big)=\\frac{1}{${dfTex.replaceAll('x', 'x_0')}}`
  }, [dfTex])

  useEffect(() => {
    saveDashboardState({ input, xVal, xMin, xMax, yMin, yMax, inverseMode })
  }, [input, xVal, xMin, xMax, yMin, yMax, inverseMode])

  useEffect(() => {
    setXVal((v) => Math.max(xMin, Math.min(xMax, v)))
  }, [xMin, xMax])

  const panX = (ratio) => {
    const span = xMax - xMin
    const shift = span * ratio
    setXMin((v) => v + shift)
    setXMax((v) => v + shift)
  }

  const panY = (ratio) => {
    const span = yMax - yMin
    const shift = span * ratio
    setYMin((v) => v + shift)
    setYMax((v) => v + shift)
  }

  const zoom = (factor) => {
    const cx = (xMin + xMax) / 2
    const cy = (yMin + yMax) / 2
    const hx = (xMax - xMin) / (2 * factor)
    const hy = (yMax - yMin) / (2 * factor)
    setXMin(cx - hx)
    setXMax(cx + hx)
    setYMin(cy - hy)
    setYMax(cy + hy)
  }

  useEffect(() => {
    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const C = {
        bg: isDark ? '#0f172a' : '#ffffff',
        axis: isDark ? '#334155' : '#cbd5e1',
        text: isDark ? '#e2e8f0' : '#1e293b',
        f: '#6366f1',
        inv: '#f59e0b',
        mirror: '#10b981',
        tangent: '#ef4444',
      }

      const width = containerRef.current?.clientWidth || 600
      const height = 480

      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg.attr('viewBox', `0 0 ${width} ${height}`)
      svg.style('background', C.bg)

      let parsedExpr
      try {
        parsedExpr = parse(expr)
        setError('')
      } catch {
        setError('Invalid expression')
        setAutoClipMessage('')
        return
      }

      const f = makeFunction(parsedExpr.toString())
      const df = (x) => numericDerivative(f, x)

      const monotonic = isMonotonic(f, xMin, xMax)

      if (!monotonic && inverseMode !== 'local') {
        const anchorX = Number.isFinite(f(xVal)) ? xVal : nearestFiniteX(f, xVal, xMin, xMax)
        const branch = Number.isFinite(anchorX)
          ? findNearestMonotonicBranch(f, df, anchorX, xMin, xMax)
          : null

        if (branch) {
          const key = `${expr}|${formatNum(anchorX, 2)}|${formatNum(branch.left, 3)}|${formatNum(branch.right, 3)}`
          const needApply = Math.abs(branch.left - xMin) > 1e-3 || Math.abs(branch.right - xMax) > 1e-3
          if (needApply && key !== autoBranchRef.current) {
            autoBranchRef.current = key
            setXMin(branch.left)
            setXMax(branch.right)
            setAutoClipMessage(`Auto-restricted to nearest monotonic branch around x0 in [${formatNum(branch.left, 3)}, ${formatNum(branch.right, 3)}].`)
            return
          }
        }
      }

      setValid(monotonic)

      if (monotonic) setAutoClipMessage('')

      const modeUsed =
        inverseMode === 'global'
          ? (monotonic ? 'global' : 'none')
          : inverseMode === 'local'
            ? 'local'
            : (monotonic ? 'global' : 'local')

      const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, width])
      const yScale = d3.scaleLinear().domain([yMin, yMax]).range([height, 0])

      svg
        .append('g')
        .attr('opacity', 0.55)
        .call(d3.axisBottom(xScale).ticks(12).tickSize(height).tickFormat(''))
        .call((g) => g.selectAll('line').attr('stroke', isDark ? '#334155' : '#e2e8f0'))
        .call((g) => g.select('.domain').remove())

      svg
        .append('g')
        .attr('opacity', 0.55)
        .call(d3.axisLeft(yScale).ticks(10).tickSize(-width).tickFormat(''))
        .call((g) => g.selectAll('line').attr('stroke', isDark ? '#334155' : '#e2e8f0'))
        .call((g) => g.select('.domain').remove())

      const line = d3.line().x((d) => xScale(d.x)).y((d) => yScale(d.y))
      const lineWithHoles = d3
        .line()
        .defined((d) => Number.isFinite(d.y))
        .x((d) => xScale(d.x))
        .y((d) => yScale(d.y))

      const data = d3
        .range(xMin, xMax, 0.04)
        .map((x) => ({ x, y: f(x) }))
        .filter((d) => Number.isFinite(d.y))

      const activeX = Number.isFinite(f(xVal)) ? xVal : nearestFiniteX(f, xVal, xMin, xMax)
      if (!Number.isFinite(activeX)) {
        setReadout({
          activeX: NaN,
          yVal: NaN,
          invX: NaN,
          slope: NaN,
          invSlope: NaN,
          product: NaN,
          modeUsed,
        })
        return
      }

      const invData =
        modeUsed === 'global'
          ? d3
              .range(yMin, yMax, 0.08)
              .map((y) => {
                const x = inverseNewton(f, df, y, y, xMin, xMax)
                return { x: y, y: x }
              })
              .filter((d) => Number.isFinite(d.y))
          : modeUsed === 'local'
            ? buildLocalInverseBranch(f, df, activeX, xMin, xMax, yMin, yMax)
            : []

      const mirrorMin = Math.max(xMin, yMin)
      const mirrorMax = Math.min(xMax, yMax)

      svg
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', C.f)
        .attr('stroke-width', 2)
        .attr('d', line)

      if (modeUsed === 'global') {
        svg
          .append('path')
          .datum(invData)
          .attr('fill', 'none')
          .attr('stroke', C.inv)
          .attr('stroke-width', 2)
          .attr('d', line)
      } else if (modeUsed === 'local') {
        svg
          .append('path')
          .datum(invData)
          .attr('fill', 'none')
          .attr('stroke', C.inv)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '6 4')
          .attr('d', lineWithHoles)
      }

      svg
        .append('line')
        .attr('x1', xScale(mirrorMin))
        .attr('y1', yScale(mirrorMin))
        .attr('x2', xScale(mirrorMax))
        .attr('y2', yScale(mirrorMax))
        .attr('stroke', C.mirror)
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '6 5')

      const yVal = f(activeX)
      if (!Number.isFinite(yVal)) return

      const invX = inverseNewton(f, df, yVal, activeX, xMin, xMax)
      const slope = df(activeX)
      const slopeAtInv = Number.isFinite(invX) ? df(invX) : NaN
      const invSlope = Number.isFinite(slopeAtInv) && Math.abs(slopeAtInv) > 1e-9 ? 1 / slopeAtInv : NaN
      const product = Number.isFinite(slope) && Number.isFinite(invSlope) ? slope * invSlope : NaN

      setReadout({
        activeX,
        yVal,
        invX,
        slope,
        invSlope,
        product,
        modeUsed,
      })

      svg
        .append('circle')
        .attr('cx', xScale(activeX))
        .attr('cy', yScale(yVal))
        .attr('r', 5)
        .attr('fill', C.f)

      if (modeUsed !== 'none' && Number.isFinite(invX)) {
        svg
          .append('circle')
          .attr('cx', xScale(yVal))
          .attr('cy', yScale(invX))
          .attr('r', 5)
          .attr('fill', C.inv)
      }

      if (verifyTick > 0 && Number.isFinite(slope) && Number.isFinite(invX)) {
        const dx = (xMax - xMin) * 0.08
        const p0 = { x: activeX, y: yVal }
        const p1 = { x: activeX + dx, y: yVal }
        const p2 = { x: activeX + dx, y: yVal + slope * dx }
        const q0 = { x: p0.y, y: p0.x }
        const q1 = { x: p1.y, y: p1.x }
        const q2 = { x: p2.y, y: p2.x }

        const toPoints = (a, b, c) => `${xScale(a.x)},${yScale(a.y)} ${xScale(b.x)},${yScale(b.y)} ${xScale(c.x)},${yScale(c.y)}`

        const tri = svg
          .append('polygon')
          .attr('points', toPoints(p0, p1, p2))
          .attr('fill', 'rgba(14,165,233,0.24)')
          .attr('stroke', '#0ea5e9')
          .attr('stroke-width', 2)

        tri
          .transition()
          .duration(1000)
          .ease(d3.easeCubicInOut)
          .attrTween('points', () => {
            return (t) => {
              const r = (u, v) => ({ x: u.x + (v.x - u.x) * t, y: u.y + (v.y - u.y) * t })
              return toPoints(r(p0, q0), r(p1, q1), r(p2, q2))
            }
          })
      }

      function tangent(x0, y0, m) {
        return d3.range(-2, 2, 0.1).map((dx) => ({ x: x0 + dx, y: y0 + m * dx }))
      }

      if (Number.isFinite(slope)) {
        svg
          .append('path')
          .datum(tangent(activeX, yVal, slope))
          .attr('fill', 'none')
          .attr('stroke', C.tangent)
          .attr('stroke-width', 1.5)
          .attr('d', line)
      }

      if (modeUsed !== 'none' && Number.isFinite(invX) && Number.isFinite(invSlope)) {
        svg
          .append('path')
          .datum(tangent(yVal, invX, invSlope))
          .attr('fill', 'none')
          .attr('stroke', C.tangent)
          .attr('stroke-dasharray', '3 3')
          .attr('d', line)
      }

      svg
        .append('g')
        .attr('transform', `translate(0,${yScale(0)})`)
        .call(d3.axisBottom(xScale).ticks(12))
        .call((g) => g.selectAll('line,path').attr('stroke', C.axis))
        .call((g) => g.selectAll('text').attr('fill', C.text))

      svg
        .append('g')
        .attr('transform', `translate(${xScale(0)},0)`)
        .call(d3.axisLeft(yScale).ticks(10))
        .call((g) => g.selectAll('line,path').attr('stroke', C.axis))
        .call((g) => g.selectAll('text').attr('fill', C.text))
    }

    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    draw()

    return () => ro.disconnect()
  }, [input, xVal, inverseMode, xMin, xMax, yMin, yMax, expr, verifyTick])

  const reciprocalOk = Number.isFinite(readout.product) && Math.abs(readout.product - 1) < 0.05

  return (
    <div style={{ fontFamily: 'system-ui', position: 'relative' }}>
      <style>{`.inverse-help-tip-parent:hover .inverse-help-tip{opacity:1!important;transform:translateY(0)!important;}`}</style>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,4fr) minmax(280px,1fr)', gap: 12 }}>
        <div style={{ border: '1px solid #33415533', borderRadius: 12, padding: 10, background: 'var(--color-background-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <strong>Inverse Calculus Stage</strong>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Mirror line: y = x</div>
          </div>

          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: 10,
                top: 10,
                zIndex: 5,
                background: 'rgba(15,23,42,0.72)',
                border: '1px solid rgba(148,163,184,0.35)',
                borderRadius: 10,
                padding: '8px 10px',
                color: '#e2e8f0',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                minWidth: 255,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>Live HUD</span>
                <span style={{ fontSize: 11, color: reciprocalOk ? '#34d399' : '#f59e0b' }}>
                  {reciprocalOk ? 'check Reciprocal Match' : 'check Approximate'}
                </span>
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                Point A: ({formatNum(readout.activeX, 3)}, {formatNum(readout.yVal, 3)}) | m = {formatNum(readout.slope, 4)}
              </div>
              <div style={{ fontSize: 12 }}>
                Point B: ({formatNum(readout.yVal, 3)}, {formatNum(readout.invX, 3)}) | m = {formatNum(readout.invSlope, 4)}
              </div>
              <div style={{ fontSize: 12 }}>Status: product = {formatNum(readout.product, 4)}</div>
            </div>

            <div ref={containerRef}>
              <svg ref={svgRef} />
            </div>
          </div>

          <div style={{ borderLeft: '3px solid #10b981', background: 'var(--color-background-secondary)', padding: '10px 12px', borderRadius: '0 8px 8px 0', marginTop: 10, lineHeight: 1.6 }}>
            <div><strong>Rigorous inverse rule:</strong></div>
            <KatexBlock expr={`\\left(f^{-1}\\right)'\\big(f(x_0)\\big)=\\frac{1}{f'(x_0)}`} />
            <div style={{ fontSize: 13 }}>
              If a function fails the global horizontal line test, the dashboard auto-restricts to the nearest monotonic branch around x0 so you can still see a valid local inverse.
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #33415533', borderRadius: 12, padding: 10, background: 'var(--color-background-secondary)', display: 'grid', gap: 10, alignContent: 'start' }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>f(x)</label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {EXAMPLES.map((ex) => (
                <button key={ex} onClick={() => setInput(ex)} style={{ fontSize: 11 }}>
                  {ex}
                </button>
              ))}
              <button
                onClick={() => {
                  setInput('sin(x)')
                  setXMin(-1.5708)
                  setXMax(1.5708)
                  setYMin(-1.2)
                  setYMax(1.2)
                }}
                style={{ fontSize: 11 }}
              >
                sin principal
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => setInverseMode('auto')}>Auto</button>
              <button onClick={() => setInverseMode('global')}>Global</button>
              <button onClick={() => setInverseMode('local')}>Local</button>
            </div>

            <label style={{ fontSize: 12 }}>x0</label>
            <input
              type="range"
              min={xMin}
              max={xMax}
              step={0.01}
              value={xVal}
              onChange={(e) => setXVal(Number(e.target.value))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <label style={{ fontSize: 12 }}>xMin <input type="number" value={xMin} step={0.1} onChange={(e) => setXMin(Number(e.target.value))} style={{ width: '100%' }} /></label>
            <label style={{ fontSize: 12 }}>xMax <input type="number" value={xMax} step={0.1} onChange={(e) => setXMax(Number(e.target.value))} style={{ width: '100%' }} /></label>
            <label style={{ fontSize: 12 }}>yMin <input type="number" value={yMin} step={0.1} onChange={(e) => setYMin(Number(e.target.value))} style={{ width: '100%' }} /></label>
            <label style={{ fontSize: 12 }}>yMax <input type="number" value={yMax} step={0.1} onChange={(e) => setYMax(Number(e.target.value))} style={{ width: '100%' }} /></label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 6 }}>
            <button onClick={() => zoom(1.25)}>Zoom +</button>
            <button onClick={() => zoom(1 / 1.25)}>Zoom -</button>
            <button onClick={() => { setXMin(-5); setXMax(5); setYMin(-5); setYMax(5) }}>Reset</button>
            <button onClick={() => panX(-0.15)}>Pan Left</button>
            <button onClick={() => panX(0.15)}>Pan Right</button>
            <button onClick={() => panY(0.15)}>Pan Up</button>
            <button onClick={() => panY(-0.15)}>Pan Down</button>
            <button onClick={() => setVerifyTick((v) => v + 1)} style={{ gridColumn: 'span 3' }}>
              Verify Triangle Flip
            </button>
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}
          {!error && !valid && (
            <div style={{ color: '#f59e0b', fontSize: 12 }}>
              Global inverse fails on this full window; switching to branch-safe behavior.
            </div>
          )}
          {autoClipMessage && <div style={{ color: '#10b981', fontSize: 12 }}>{autoClipMessage}</div>}

          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="inverse-help-tip-parent">
              <strong style={{ fontSize: 12 }}>Function Pair</strong>
              <HelpTip
                title="What is a function pair?"
                body="If A = (x0, f(x0)) lies on f, then B = (f(x0), x0) lies on f^{-1}. Coordinates swap across y = x."
              />
            </div>
            <div style={{ fontSize: 12 }}>
              A = ({formatNum(readout.activeX, 3)}, {formatNum(readout.yVal, 3)})
            </div>
            <div style={{ fontSize: 12 }}>
              B = ({formatNum(readout.yVal, 3)}, {formatNum(readout.invX, 3)})
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="inverse-help-tip-parent">
              <strong style={{ fontSize: 12 }}>Slopes</strong>
              <HelpTip
                title="What do slopes mean here?"
                body="mA = f'(x0). mB = (f^{-1})'(f(x0)). The inverse derivative theorem predicts mA * mB = 1 when both exist."
              />
            </div>
            <div style={{ fontSize: 12 }}>f'(x0) = {formatNum(readout.slope)}</div>
            <div style={{ fontSize: 12 }}>(f^-1)'(f(x0)) = {formatNum(readout.invSlope)}</div>
            <div style={{ fontSize: 12 }}>Product = {formatNum(readout.product)}</div>
          </div>

          {fTex && <KatexBlock expr={`f(x)=${fTex}`} />}
          {dfTex && <KatexBlock expr={`f'(x)=${dfTex}`} />}
          {inverseRuleTex && <KatexBlock expr={inverseRuleTex} />}
        </div>
      </div>
    </div>
  )
}
