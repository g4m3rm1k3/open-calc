import { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import { parse, derivative } from 'mathjs'
import KatexBlock from '../../math/KatexBlock.jsx'

const X_MIN = -5
const X_MAX = 5
const Y_MIN = -5
const Y_MAX = 5
const VIEW_LIMIT = 60
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

function isTrigExpression(expr) {
  return /(?:^|[^a-zA-Z])(sin|cos|tan|sec|csc|cot)\s*\(/.test(String(expr || ''))
}

function trigFamily(expr) {
  const e = String(expr || '')
  if (/(?:^|[^a-zA-Z])(sin|cos)\s*\(/.test(e)) return 'bounded'
  if (/(?:^|[^a-zA-Z])(tan|sec|csc|cot)\s*\(/.test(e)) return 'unbounded'
  return 'none'
}

function normalizeBounds(xMin, xMax, yMin, yMax) {
  const MIN_SPAN = 0.2
  const MAX_SPAN = 40

  const finite = (v, fallback) => (Number.isFinite(v) ? v : fallback)
  let xa = finite(xMin, -5)
  let xb = finite(xMax, 5)
  let ya = finite(yMin, -5)
  let yb = finite(yMax, 5)

  if (xa > xb) [xa, xb] = [xb, xa]
  if (ya > yb) [ya, yb] = [yb, ya]

  const clampAxis = (a, b) => {
    let lo = Math.max(-VIEW_LIMIT, Math.min(VIEW_LIMIT, a))
    let hi = Math.max(-VIEW_LIMIT, Math.min(VIEW_LIMIT, b))
    if (lo > hi) [lo, hi] = [hi, lo]

    let span = hi - lo
    if (span < MIN_SPAN) {
      const c = (lo + hi) / 2
      lo = c - MIN_SPAN / 2
      hi = c + MIN_SPAN / 2
    }
    span = hi - lo
    if (span > MAX_SPAN) {
      const c = (lo + hi) / 2
      lo = c - MAX_SPAN / 2
      hi = c + MAX_SPAN / 2
    }

    lo = Math.max(-VIEW_LIMIT, lo)
    hi = Math.min(VIEW_LIMIT, hi)
    return [lo, hi]
  }

  const [nxMin, nxMax] = clampAxis(xa, xb)
  const [nyMin, nyMax] = clampAxis(ya, yb)

  return { xMin: nxMin, xMax: nxMax, yMin: nyMin, yMax: nyMax }
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
  const trigPresetRef = useRef('')
  const zoomSliderRef = useRef(50)
  const hudDragRef = useRef({ dragging: false, startX: 0, startY: 0, originX: 10, originY: 10 })

  const persisted = useMemo(() => loadDashboardState(), [])
  const initialBounds = useMemo(
    () => normalizeBounds(persisted?.xMin, persisted?.xMax, persisted?.yMin, persisted?.yMax),
    [persisted],
  )

  const [input, setInput] = useState(persisted?.input || 'x^3 + x')
  const [xVal, setXVal] = useState(Number.isFinite(persisted?.xVal) ? persisted.xVal : 1)
  const [xMin, setXMin] = useState(initialBounds.xMin)
  const [xMax, setXMax] = useState(initialBounds.xMax)
  const [yMin, setYMin] = useState(initialBounds.yMin)
  const [yMax, setYMax] = useState(initialBounds.yMax)
  const [error, setError] = useState('')
  const [valid, setValid] = useState(true)
  const [autoClipMessage, setAutoClipMessage] = useState('')
  const [inverseMode, setInverseMode] = useState(persisted?.inverseMode || 'auto')
  const [fastZoom, setFastZoom] = useState(Boolean(persisted?.fastZoom))
  const [zoomSlider, setZoomSlider] = useState(50)
  const [verifyTick, setVerifyTick] = useState(0)
  const [hudPos, setHudPos] = useState({ x: 10, y: 10 })
  const [hudOpen, setHudOpen] = useState(persisted?.hudOpen !== false)
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

  const trigKind = useMemo(() => trigFamily(expr), [expr])
  const isTrig = useMemo(() => isTrigExpression(expr), [expr])

  const fieldStyle = useMemo(
    () => ({
      width: '100%',
      boxSizing: 'border-box',
      background: 'var(--color-background-primary)',
      color: 'var(--color-text-primary)',
      border: '1px solid rgba(148,163,184,0.45)',
      borderRadius: 8,
      padding: '6px 8px',
      fontSize: 13,
    }),
    [],
  )

  const pickerButtonStyle = useMemo(
    () => ({
      fontSize: 11,
      border: '1px solid rgba(148,163,184,0.45)',
      background: 'var(--color-background-primary)',
      color: 'var(--color-text-primary)',
      borderRadius: 7,
      padding: '4px 8px',
      cursor: 'pointer',
    }),
    [],
  )

  const dpadButtonStyle = useMemo(
    () => ({
      width: '100%',
      minWidth: 0,
      minHeight: 46,
      border: '1px solid rgba(148,163,184,0.45)',
      borderRadius: 10,
      background: 'var(--color-background-primary)',
      color: 'var(--color-text-primary)',
      fontSize: 14,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    }),
    [],
  )

  useEffect(() => {
    saveDashboardState({ input, xVal, xMin, xMax, yMin, yMax, inverseMode, fastZoom, hudOpen })
  }, [input, xVal, xMin, xMax, yMin, yMax, inverseMode, fastZoom, hudOpen])

  useEffect(() => {
    if (!isTrig) return
    if (trigPresetRef.current === expr) return

    if (trigKind === 'bounded') {
      setXMin(-2 * Math.PI)
      setXMax(2 * Math.PI)
      setYMin(-1.6)
      setYMax(1.6)
      setXVal(0)
      setAutoClipMessage('Trig tuning applied: bounded trig view set to x in [-2pi, 2pi], y in [-1.6, 1.6].')
    } else if (trigKind === 'unbounded') {
      setXMin(-Math.PI)
      setXMax(Math.PI)
      setYMin(-5)
      setYMax(5)
      setXVal(0)
      setAutoClipMessage('Trig tuning applied: unbounded trig view set to x in [-pi, pi], y in [-5, 5].')
    }

    trigPresetRef.current = expr
  }, [expr, isTrig, trigKind])

  useEffect(() => {
    setXVal((v) => Math.max(xMin, Math.min(xMax, v)))
  }, [xMin, xMax])

  useEffect(() => {
    const n = normalizeBounds(xMin, xMax, yMin, yMax)
    const eps = 1e-9
    if (Math.abs(n.xMin - xMin) > eps) setXMin(n.xMin)
    if (Math.abs(n.xMax - xMax) > eps) setXMax(n.xMax)
    if (Math.abs(n.yMin - yMin) > eps) setYMin(n.yMin)
    if (Math.abs(n.yMax - yMax) > eps) setYMax(n.yMax)
  }, [xMin, xMax, yMin, yMax])

  const applyBounds = (nextXMin, nextXMax, nextYMin, nextYMax) => {
    const n = normalizeBounds(nextXMin, nextXMax, nextYMin, nextYMax)
    setXMin(n.xMin)
    setXMax(n.xMax)
    setYMin(n.yMin)
    setYMax(n.yMax)
  }

  const resetGraph = () => {
    if (isTrig && trigKind === 'bounded') {
      applyBounds(-2 * Math.PI, 2 * Math.PI, -1.6, 1.6)
      setXVal(0)
    } else if (isTrig && trigKind === 'unbounded') {
      applyBounds(-Math.PI, Math.PI, -5, 5)
      setXVal(0)
    } else {
      applyBounds(-5, 5, -5, 5)
      setXVal(0)
    }
    zoomSliderRef.current = 50
    setZoomSlider(50)
    setAutoClipMessage('Graph reset to a stable default window.')
  }

  const centerView = () => {
    const xSpan = Math.max(0.2, xMax - xMin)
    const ySpan = Math.max(0.2, yMax - yMin)
    try {
      const f = makeFunction(expr)
      const targetX = Number.isFinite(f(xVal)) ? xVal : nearestFiniteX(f, xVal, xMin, xMax) ?? 0
      const targetYRaw = f(targetX)
      const targetY = Number.isFinite(targetYRaw) ? targetYRaw : (yMin + yMax) / 2
      const nextXMin = targetX - xSpan / 2
      const nextXMax = targetX + xSpan / 2
      const nextYMin = targetY - ySpan / 2
      const nextYMax = targetY + ySpan / 2
      applyBounds(nextXMin, nextXMax, nextYMin, nextYMax)
      setAutoClipMessage('Centered window on x0 without changing zoom scale.')
    } catch {
      applyBounds(-xSpan / 2, xSpan / 2, -ySpan / 2, ySpan / 2)
      setAutoClipMessage('Centered view around origin without changing zoom scale.')
    }
  }

  const clampHudPos = (x, y) => {
    const width = containerRef.current?.clientWidth || 600
    const height = 480
    const hudWidth = 290
    const hudHeight = 122
    return {
      x: Math.max(6, Math.min(width - hudWidth - 6, x)),
      y: Math.max(6, Math.min(height - hudHeight - 6, y)),
    }
  }

  const onHudMouseDown = (event) => {
    event.preventDefault()
    hudDragRef.current = {
      dragging: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: hudPos.x,
      originY: hudPos.y,
    }
  }

  useEffect(() => {
    const onMove = (event) => {
      if (!hudDragRef.current.dragging) return
      const dx = event.clientX - hudDragRef.current.startX
      const dy = event.clientY - hudDragRef.current.startY
      const next = clampHudPos(hudDragRef.current.originX + dx, hudDragRef.current.originY + dy)
      setHudPos(next)
    }

    const onUp = () => {
      if (!hudDragRef.current.dragging) return
      hudDragRef.current.dragging = false
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [hudPos.x, hudPos.y])

  const panX = (ratio) => {
    const span = xMax - xMin
    const shift = span * ratio
    let nxMin = xMin + shift
    let nxMax = xMax + shift
    if (nxMin < -VIEW_LIMIT) {
      const bump = -VIEW_LIMIT - nxMin
      nxMin += bump
      nxMax += bump
    }
    if (nxMax > VIEW_LIMIT) {
      const bump = nxMax - VIEW_LIMIT
      nxMin -= bump
      nxMax -= bump
    }
    applyBounds(nxMin, nxMax, yMin, yMax)
  }

  const panY = (ratio) => {
    const span = yMax - yMin
    const shift = span * ratio
    let nyMin = yMin + shift
    let nyMax = yMax + shift
    if (nyMin < -VIEW_LIMIT) {
      const bump = -VIEW_LIMIT - nyMin
      nyMin += bump
      nyMax += bump
    }
    if (nyMax > VIEW_LIMIT) {
      const bump = nyMax - VIEW_LIMIT
      nyMin -= bump
      nyMax -= bump
    }
    applyBounds(xMin, xMax, nyMin, nyMax)
  }

  const zoom = (factor) => {
    const cx = (xMin + xMax) / 2
    const cy = (yMin + yMax) / 2
    const hx = (xMax - xMin) / (2 * factor)
    const hy = (yMax - yMin) / (2 * factor)
    applyBounds(cx - hx, cx + hx, cy - hy, cy + hy)
  }

  const onZoomScrollbar = (nextValue) => {
    const next = Number(nextValue)
    const delta = next - zoomSliderRef.current
    if (delta !== 0) {
      const base = fastZoom ? 1.08 : 1.02
      const factor = Math.pow(base, delta)
      zoom(factor)
    }
    zoomSliderRef.current = next
    setZoomSlider(next)
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

      setValid(monotonic)

      const modeUsed =
        inverseMode === 'global'
          ? (monotonic ? 'global' : 'none')
          : inverseMode === 'local'
            ? 'local'
            : (monotonic ? 'global' : 'local')

      if (monotonic) {
        setAutoClipMessage('')
      } else if (inverseMode === 'global') {
        setAutoClipMessage('Global inverse is not single-valued on this window. Use Local mode for branch-based inverse view.')
      } else {
        setAutoClipMessage('Local inverse follows the branch near x0. The x0 slider moves the probe point and tangent check.')
      }

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

      const xSpan = Math.max(1e-6, xMax - xMin)
      const ySpan = Math.max(1e-6, yMax - yMin)
      const sampleStep = Math.max(isTrig ? 0.006 : 0.02, xSpan / 1400)
      const inverseStep = Math.max(isTrig ? 0.02 : 0.05, ySpan / 1000)

      const data = d3
        .range(xMin, xMax, sampleStep)
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
              .range(yMin, yMax, inverseStep)
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
      <style>{`
        .inverse-help-tip-parent:hover .inverse-help-tip{opacity:1!important;transform:translateY(0)!important;}
        .inverse-layout{display:grid;grid-template-columns:minmax(0,1fr) clamp(280px,32vw,340px);gap:12px;align-items:start;}
        .inverse-right-panel, .inverse-right-panel *{box-sizing:border-box;}
        .inverse-right-panel .math-display{max-width:100%;}
        .inverse-right-panel .katex-display{max-width:100%;overflow-x:auto;overflow-y:hidden;}
        @media (max-width: 1120px){
          .inverse-layout{grid-template-columns:minmax(0,1fr);}
        }
      `}</style>

      <div className="inverse-layout">
        <div style={{ border: '1px solid #33415533', borderRadius: 12, padding: 10, background: 'var(--color-background-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <strong>Inverse Calculus Stage</strong>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Mirror line: y = x</div>
          </div>

          <div style={{ position: 'relative' }}>
            {hudOpen ? (
              <div
                style={{
                  position: 'absolute',
                  left: hudPos.x,
                  top: hudPos.y,
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
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', cursor: 'grab' }}
                  onMouseDown={onHudMouseDown}
                  className="inverse-help-tip-parent"
                >
                  <span style={{ fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    Live HUD
                    <HelpTip
                      title="What do HUD values mean?"
                      body="Point A = (x0, f(x0)) on the original function. Point B = (f(x0), x0) is the reflected inverse pair. The two m values are tangent slopes at A and B, and product checks the reciprocal rule m_A * m_B ≈ 1."
                    />
                  </span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: reciprocalOk ? '#34d399' : '#f59e0b' }}>
                      {reciprocalOk ? 'check Reciprocal Match' : 'check Approximate'}
                    </span>
                    <button
                      onClick={() => setHudOpen(false)}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: '1px solid rgba(148,163,184,0.45)',
                        background: 'rgba(15,23,42,0.7)',
                        color: '#e2e8f0',
                        cursor: 'pointer',
                        fontSize: 12,
                        lineHeight: 1,
                      }}
                      aria-label="Close HUD"
                    >
                      x
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  Point A: ({formatNum(readout.activeX, 3)}, {formatNum(readout.yVal, 3)}) | m = {formatNum(readout.slope, 4)}
                </div>
                <div style={{ fontSize: 12 }}>
                  Point B: ({formatNum(readout.yVal, 3)}, {formatNum(readout.invX, 3)}) | m = {formatNum(readout.invSlope, 4)}
                </div>
                <div style={{ fontSize: 12 }}>Status: product = {formatNum(readout.product, 4)}</div>
              </div>
            ) : (
              <button
                onClick={() => setHudOpen(true)}
                style={{
                  position: 'absolute',
                  left: hudPos.x,
                  top: hudPos.y,
                  zIndex: 5,
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: '1px solid rgba(148,163,184,0.45)',
                  background: 'rgba(15,23,42,0.72)',
                  color: '#e2e8f0',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                aria-label="Open HUD"
              >
                HUD
              </button>
            )}

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

          <div style={{ marginTop: 10, border: '1px solid rgba(148,163,184,0.28)', borderRadius: 10, padding: '10px 12px', background: 'var(--color-background-secondary)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Graph Legend</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 8, fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 22, height: 2, background: '#6366f1', display: 'inline-block' }} /> f(x) curve</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 22, height: 2, background: '#f59e0b', display: 'inline-block' }} /> inverse curve</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 22, borderTop: '2px dashed #10b981', display: 'inline-block' }} /> mirror line y = x</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 22, height: 2, background: '#ef4444', display: 'inline-block' }} /> tangent(s)</div>
            </div>
          </div>
        </div>

        <div className="inverse-right-panel" style={{ border: '1px solid #33415533', borderRadius: 12, padding: 10, background: 'var(--color-background-secondary)', display: 'grid', gap: 10, alignContent: 'start', minWidth: 0 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>f(x)</label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={fieldStyle}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {EXAMPLES.map((ex) => (
                <button key={ex} onClick={() => setInput(ex)} style={pickerButtonStyle}>
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
                style={pickerButtonStyle}
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

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="inverse-help-tip-parent">
              <label style={{ fontSize: 12 }}>x0</label>
              <HelpTip
                title="What does x0 slider do?"
                body="x0 moves the probe point along f(x), which updates Point A/B and the slope reciprocity check. It should not zoom; use Zoom Scrollbar for scale changes."
              />
            </div>
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
            <label style={{ fontSize: 12 }}>xMin <input type="number" value={xMin} step={0.1} onChange={(e) => applyBounds(Number(e.target.value), xMax, yMin, yMax)} style={fieldStyle} /></label>
            <label style={{ fontSize: 12 }}>xMax <input type="number" value={xMax} step={0.1} onChange={(e) => applyBounds(xMin, Number(e.target.value), yMin, yMax)} style={fieldStyle} /></label>
            <label style={{ fontSize: 12 }}>yMin <input type="number" value={yMin} step={0.1} onChange={(e) => applyBounds(xMin, xMax, Number(e.target.value), yMax)} style={fieldStyle} /></label>
            <label style={{ fontSize: 12 }}>yMax <input type="number" value={yMax} step={0.1} onChange={(e) => applyBounds(xMin, xMax, yMin, Number(e.target.value))} style={fieldStyle} /></label>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="inverse-help-tip-parent">
              <label style={{ fontSize: 12, fontWeight: 700 }}>Zoom Scrollbar</label>
              <HelpTip
                title="What does Zoom Scrollbar do?"
                body="This slider only changes zoom scale around the current window center. It does not move x0. If the graph feels off-screen, use the D-pad to pan or Center to recenter on the current probe point."
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={zoomSlider}
              onChange={(e) => onZoomScrollbar(e.target.value)}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <input
                type="checkbox"
                checked={fastZoom}
                onChange={(e) => setFastZoom(e.target.checked)}
              />
              x10 zoom speed modifier
            </label>

            <div style={{ display: 'grid', gap: 8, gridColumn: "span 3" }}>
              <button onClick={resetGraph} style={{ ...dpadButtonStyle, minHeight: 30, width: 'fit-content', justifySelf: 'center', fontSize: 12, padding: '4px 10px' }}>
                Reset
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.8fr 1fr', gap: 8, padding: 10, borderRadius: 10, border: '1px solid rgba(148,163,184,0.28)', background: 'var(--color-background-primary)', width: '100%', alignItems: 'stretch' }}>
                <button onClick={() => panY(0.15)} style={{ ...dpadButtonStyle, gridColumn: '2', gridRow: '1' }}>Up</button>

                <button onClick={() => panX(-0.15)} style={{ ...dpadButtonStyle, gridColumn: '1', gridRow: '2', fontSize: 12 }}>Left</button>
                <button onClick={centerView} style={{ ...dpadButtonStyle, gridColumn: '2', gridRow: '2' }}>Center</button>
                <button onClick={() => panX(0.15)} style={{ ...dpadButtonStyle, gridColumn: '3', gridRow: '2', fontSize: 12 }}>Right</button>

                <button onClick={() => panY(-0.15)} style={{ ...dpadButtonStyle, gridColumn: '2', gridRow: '3' }}>Down</button>
              </div>
            </div>

            <button onClick={() => setVerifyTick((v) => v + 1)} style={{ gridColumn: 'span 3' }}>
              Verify Triangle Flip
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="inverse-help-tip-parent">
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                Triangle Flip
              </div>
              <HelpTip
                title="What does Triangle Flip mean?"
                body="The animation shows local differential geometry under inversion: rise/run on f becomes run/rise on f^{-1}. That swaps slope m with 1/m at corresponding reflected points."
              />
            </div>
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}
          {!error && !valid && (
            <div style={{ color: '#f59e0b', fontSize: 12 }}>
              Global inverse fails on this full window; use Local mode or Center View for a cleaner overlay.
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
