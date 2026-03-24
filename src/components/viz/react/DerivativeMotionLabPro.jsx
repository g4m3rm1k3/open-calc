import { useEffect, useMemo, useRef, useState } from 'react'
import KatexBlock from '../../math/KatexBlock.jsx'

export default function DerivativeMotionLabPro({ params = {} }) {
  const { currentStep = 0 } = params

  const [t, setT] = useState(0)
  const [k, setK] = useState(5)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(0.35)
  const [direction, setDirection] = useState(1)
  const [trace, setTrace] = useState(false)

  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)
  const traceRef = useRef([])

  const T_MIN = -Math.PI
  const T_MAX = Math.PI

  // Position and its first three derivatives for s(t) = sin(kt)
  const s = Math.sin(k * t)
  const v = k * Math.cos(k * t)
  const a = -k * k * Math.sin(k * t)
  const j = -k * k * k * Math.cos(k * t)

  const scale = {
    s: 1,
    v: k,
    a: k * k,
    j: k * k * k,
  }

  useEffect(() => {
    if (!playing || currentStep < 6) return

    const loop = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time
      const dt = (time - lastTimeRef.current) / 1000
      lastTimeRef.current = time

      setT((prev) => {
        let next = prev + dt * speed * direction
        if (next > T_MAX) next = T_MIN
        if (next < T_MIN) next = T_MAX
        return next
      })

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = null
    }
  }, [playing, speed, direction, currentStep])

  useEffect(() => {
    if (!trace || currentStep < 6) {
      traceRef.current = []
      return
    }
    traceRef.current.push({ t, s, v, a, j })
    if (traceRef.current.length > 500) traceRef.current.shift()
  }, [t, trace, currentStep, s, v, a, j])

  const makePoints = (fn, norm) => {
    const pts = []
    for (let x = T_MIN; x <= T_MAX; x += 0.02) {
      pts.push({ x, y: fn(x) / norm })
    }
    return pts
  }

  const pathFromPoints = (points) =>
    points
      .map((p, i) => {
        const X = 250 + p.x * 70
        const Y = 100 - p.y * 60
        return `${i === 0 ? 'M' : 'L'} ${X} ${Y}`
      })
      .join(' ')

  const tangentLine = () => {
    const slope = v
    const dx = 0.5

    const x1 = t - dx
    const x2 = t + dx

    const y1 = s + slope * (x1 - t)
    const y2 = s + slope * (x2 - t)

    return {
      x1: 250 + x1 * 70,
      y1: 100 - y1 * 60,
      x2: 250 + x2 * 70,
      y2: 100 - y2 * 60,
    }
  }

  const graphs = useMemo(() => {
    const g = []

    g.push({
      key: 's',
      label: `Position  s(t) = sin(${k}t)`,
      chainExpr: 'u=kt,\\quad s(t)=\\sin(u)',
      fn: (x) => Math.sin(k * x),
      value: s,
      norm: scale.s,
      color: 'stroke-blue-500 dark:stroke-blue-400',
      tangent: currentStep >= 1,
    })

    if (currentStep >= 2) {
      g.push({
        key: 'v',
        label: `Velocity  v(t) = ${k}cos(${k}t)`,
        chainExpr:
          '\\begin{aligned}u&=kt\\\\ s(t)&=\\sin(u)\\\\ v(t)&=\\frac{ds}{dt}=\\frac{ds}{du}\\frac{du}{dt}=\\cos(u)\\cdot k=k\\cos(kt)\\end{aligned}',
        fn: (x) => k * Math.cos(k * x),
        value: v,
        norm: scale.v,
        color: 'stroke-green-500 dark:stroke-green-400',
      })
    }

    if (currentStep >= 3) {
      g.push({
        key: 'a',
        label: `Acceleration  a(t) = -${k * k}sin(${k}t)`,
        chainExpr:
          '\\begin{aligned}u&=kt\\\\ s(t)&=\\sin(u)\\\\ v(t)&=\\frac{ds}{dt}=\\frac{ds}{du}\\frac{du}{dt}=\\cos(u)\\cdot k\\\\ a(t)&=\\frac{dv}{dt}=\\frac{dv}{du}\\frac{du}{dt}=(-k\\sin(u))\\cdot k=-k^2\\sin(kt)\\end{aligned}',
        fn: (x) => -k * k * Math.sin(k * x),
        value: a,
        norm: scale.a,
        color: 'stroke-red-500 dark:stroke-red-400',
      })
    }

    if (currentStep >= 5) {
      g.push({
        key: 'j',
        label: `Jerk  j(t) = -${k * k * k}cos(${k}t)`,
        chainExpr:
          '\\begin{aligned}u&=kt\\\\ s(t)&=\\sin(u)\\\\ v(t)&=\\frac{ds}{dt}=\\frac{ds}{du}\\frac{du}{dt}=\\cos(u)\\cdot k\\\\ a(t)&=\\frac{dv}{dt}=\\frac{dv}{du}\\frac{du}{dt}=(-k\\sin(u))\\cdot k\\\\ j(t)&=\\frac{da}{dt}=\\frac{da}{du}\\frac{du}{dt}=(-k^2\\cos(u))\\cdot k=-k^3\\cos(kt)\\end{aligned}',
        fn: (x) => -k * k * k * Math.cos(k * x),
        value: j,
        norm: scale.j,
        color: 'stroke-fuchsia-500 dark:stroke-fuchsia-400',
      })
    }

    return g
  }, [k, currentStep, s, v, a, j, scale.s, scale.v, scale.a, scale.j])

  const tracePathFor = (key, norm) => {
    if (!trace || traceRef.current.length < 2) return ''
    const points = traceRef.current.map((entry) => ({
      x: 250 + entry.t * 70,
      y: 100 - (entry[key] / norm) * 60,
    }))
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ')
  }

  const derivationSteps = [
    {
      label: 'Position model',
      expr: 'u=kt,\\quad s(t)=\\sin(u)',
      note: 'Define the inner variable u=kt so every derivative can be read as chain rule.',
    },
    {
      label: 'Slope of position',
      expr: 'v(t)=\\frac{ds}{dt}=\\frac{ds}{du}\\cdot\\frac{du}{dt}',
      note: 'This is the chain rule template: outer-rate times inner-rate.',
    },
    {
      label: 'Chain rule for velocity',
      expr: 'v(t)=\\cos(u)\\cdot k=k\\cos(kt)',
      note: 'Because ds/du=cos(u) and du/dt=k, the velocity picks up one factor of k.',
    },
    {
      label: 'Second derivative setup',
      expr: 'a(t)=\\frac{dv}{dt}=\\frac{dv}{du}\\cdot\\frac{du}{dt}',
      note: 'Apply the exact same chain rule pattern again for acceleration.',
    },
    {
      label: 'Chain rule for acceleration',
      expr: 'a(t)=(-k\\sin(u))\\cdot k=-k^2\\sin(kt)',
      note: 'Since v(u)=kcos(u), dv/du=-ksin(u), then multiply by du/dt=k.',
    },
    {
      label: 'Third derivative (jerk)',
      expr: 'j(t)=\\frac{da}{dt}=\\frac{da}{du}\\cdot\\frac{du}{dt}=(-k^2\\cos(u))\\cdot k=-k^3\\cos(kt)',
      note: 'A third chain-rule pass adds a third factor of k, giving k^3 scaling.',
    },
    {
      label: 'Complete derivative chain',
      expr: '\\frac{ds}{dt}=\\frac{ds}{du}\\frac{du}{dt},\\;\\frac{dv}{dt}=\\frac{dv}{du}\\frac{du}{dt},\\;\\frac{da}{dt}=\\frac{da}{du}\\frac{du}{dt}',
      note: 'Each stage is chain rule in disguise: same structure, new outer function.',
    },
  ]

  const chainRuleTemplate = '\\text{Chain rule in disguise: }\\dfrac{d(\\text{output})}{dt}=\\dfrac{d(\\text{output})}{du}\\cdot\\dfrac{du}{dt},\\;u=kt'

  const cappedStep = Math.max(0, Math.min(currentStep, derivationSteps.length - 1))
  const visibleDerivations = derivationSteps.slice(0, cappedStep + 1)

  const stageNotes = [
    'We start with position: a wave describing motion.',
    'The tangent line shows velocity as slope of position.',
    'Velocity becomes its own function: v(t) = k cos(kt).',
    'Acceleration is the derivative of velocity.',
    'Chain rule appears again: a(t) = -k^2 sin(kt).',
    'Third derivative (jerk) adds another k factor: j(t) = -k^3 cos(kt).',
    'Full system unlocked: position, velocity, acceleration, and jerk in one motion chain.',
  ]

  return (
    <div className="w-full p-4 space-y-6">
      <div className="bg-sky-50 dark:bg-sky-950/25 border border-sky-100 dark:border-sky-900/50 rounded-2xl p-4 space-y-3">
        <KatexBlock expr={chainRuleTemplate} className="mb-0" />
        {visibleDerivations.map((step, idx) => {
          const isCurrent = idx === cappedStep
          return (
            <div
              key={`${step.label}-${idx}`}
              className={`rounded-xl border px-3 py-3 ${
                isCurrent
                  ? 'border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-900'
                  : 'border-sky-100 dark:border-sky-900/60 bg-white/70 dark:bg-slate-900/50'
              }`}
            >
              <div className="text-xs uppercase tracking-widest font-semibold text-sky-600 dark:text-sky-400 mb-1">
                {idx + 1}. {step.label}
              </div>
              <KatexBlock expr={step.expr} className="mb-1" />
              <div className="text-sm text-slate-600 dark:text-slate-300">{step.note}</div>
            </div>
          )
        })}
      </div>

      {currentStep >= 6 && (
        <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl space-y-3">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="px-3 py-1 rounded-lg bg-blue-500 text-white"
            >
              {playing ? 'Pause' : 'Play'}
            </button>

            <button
              onClick={() => {
                setT(0)
                setPlaying(false)
                traceRef.current = []
              }}
              className="px-3 py-1 rounded-lg bg-slate-300 dark:bg-slate-700"
            >
              Reset
            </button>

            <button
              onClick={() => setDirection((d) => -d)}
              className="px-3 py-1 rounded-lg bg-slate-300 dark:bg-slate-700"
            >
              Reverse
            </button>
          </div>

          <div>
            <div className="text-sm">Speed: {speed.toFixed(1)}x</div>
            <input
              type="range"
              min="0.05"
              max="1.5"
              step="0.05"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {[0.2, 0.35, 0.6, 1].map((val) => (
              <button
                key={val}
                onClick={() => setSpeed(val)}
                className={`px-3 py-1 rounded-lg ${
                  Math.abs(speed - val) < 0.001
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                {val.toFixed(2)}x
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            {[1, 3, 5, 10].map((val) => (
              <button
                key={val}
                onClick={() => setK(val)}
                className={`px-3 py-1 rounded-lg ${
                  k === val
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                k = {val}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={trace}
              onChange={(e) => setTrace(e.target.checked)}
            />
            Trace motion history
          </label>
        </div>
      )}

      {graphs.map((g, i) => {
        const pts = makePoints(g.fn, g.norm)
        const tangent = g.tangent ? tangentLine() : null
        const tracePath = tracePathFor(g.key, g.norm)

        return (
          <div key={i} className="bg-slate-100 dark:bg-slate-900 p-3 rounded-2xl">
            <div className="text-sm mb-2">{g.label}</div>
            <div className="mb-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-950/60 px-3 py-2">
              <KatexBlock expr={g.chainExpr} className="mb-0" />
            </div>

            <svg width="100%" height="200" viewBox="0 0 500 200">
              <line
                x1="0"
                y1="100"
                x2="500"
                y2="100"
                className="stroke-slate-400 dark:stroke-slate-600"
              />

              <path
                d={pathFromPoints(pts)}
                fill="none"
                className={g.color}
                strokeWidth="2"
              />

              {tracePath && (
                <path
                  d={tracePath}
                  fill="none"
                  className="stroke-amber-400"
                  strokeWidth="1.5"
                  strokeDasharray="2 3"
                />
              )}

              <line
                x1={250 + t * 70}
                x2={250 + t * 70}
                y1="0"
                y2="200"
                className="stroke-yellow-400"
                strokeDasharray="4"
              />

              <circle
                cx={250 + t * 70}
                cy={100 - (g.value / g.norm) * 60}
                r="4"
                className="fill-yellow-400"
              />

              {tangent && (
                <line
                  x1={tangent.x1}
                  y1={tangent.y1}
                  x2={tangent.x2}
                  y2={tangent.y2}
                  className="stroke-purple-400"
                  strokeWidth="2"
                />
              )}
            </svg>

            <div className="text-xs mt-1">value = {g.value.toFixed(4)}</div>
          </div>
        )
      })}

      <div className="bg-amber-100 dark:bg-amber-900 p-4 rounded-2xl text-sm">
        <div className="text-xs uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-300 mb-2">
          Step Guide (stays visible)
        </div>
        <ol className="space-y-1.5 list-decimal pl-5">
          {stageNotes.map((note, idx) => (
            <li
              key={idx}
              className={`leading-relaxed ${
                idx === currentStep
                  ? 'font-semibold text-slate-900 dark:text-slate-100'
                  : idx < currentStep
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {note}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
