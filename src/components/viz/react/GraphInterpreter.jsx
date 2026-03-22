import { useMemo, useState } from 'react'

const FUNCTION_OPTIONS = {
  linear: {
    label: 'x(t) = 2t + 1',
    x: (t) => 2 * t + 1,
    v: () => 2,
  },
  quadratic: {
    label: 'x(t) = t^2',
    x: (t) => t * t,
    v: (t) => 2 * t,
  },
  sinusoid: {
    label: 'x(t) = 3 sin(t)',
    x: (t) => 3 * Math.sin(t),
    v: (t) => 3 * Math.cos(t),
  },
}

export default function GraphInterpreter() {
  const [mode, setMode] = useState('quadratic')
  const [t, setT] = useState(2)
  const [t0, setT0] = useState(1)
  const fn = FUNCTION_OPTIONS[mode]

  const values = useMemo(() => {
    const xT = fn.x(t)
    const vT = fn.v(t)
    const dt = 0.01
    let displacement = 0
    for (let s = 0; s < t; s += dt) {
      displacement += fn.v(s) * dt
    }
    const xStart = fn.x(t0)
    const xEnd = fn.x(t0 + 1)
    const avgV = xEnd - xStart

    return { xT, vT, displacement, xStart, xEnd, avgV }
  }, [fn, t, t0])

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Position Model</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
        >
          {Object.entries(FUNCTION_OPTIONS).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <p className="text-xs text-slate-500 mb-2">Point-Slope Meaning</p>
          <label className="text-xs text-slate-500">Time t: {t.toFixed(2)} s</label>
          <input type="range" min="0" max="6" step="0.05" value={t} onChange={(e) => setT(Number(e.target.value))} className="w-full" />
          <p className="text-sm mt-2">x(t) = <strong>{values.xT.toFixed(3)}</strong> m</p>
          <p className="text-sm">v(t) = <strong>{values.vT.toFixed(3)}</strong> m/s</p>
          <p className="text-xs text-slate-500 mt-2">Slope at one point corresponds to instantaneous velocity.</p>
        </div>

        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <p className="text-xs text-slate-500 mb-2">Area-Accumulation Meaning</p>
          <p className="text-sm">Approx. displacement from 0 to t:</p>
          <p className="text-lg font-semibold">{values.displacement.toFixed(3)} m</p>
          <label className="text-xs text-slate-500 mt-2 block">Window start t0: {t0.toFixed(2)} s</label>
          <input type="range" min="0" max="5" step="0.1" value={t0} onChange={(e) => setT0(Number(e.target.value))} className="w-full" />
          <p className="text-sm mt-2">Average velocity on [t0, t0+1]: <strong>{values.avgV.toFixed(3)} m/s</strong></p>
        </div>
      </div>
    </div>
  )
}
