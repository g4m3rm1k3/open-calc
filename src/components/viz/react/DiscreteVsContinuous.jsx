import { useMemo, useState } from 'react'

function exactPosition(t) {
  return t * t
}

export default function DiscreteVsContinuous() {
  const [dt, setDt] = useState(1)
  const [t, setT] = useState(4)

  const values = useMemo(() => {
    let xDiscrete = 0
    for (let s = 0; s < t; s += dt) {
      xDiscrete += (2 * s) * dt
    }
    const xExact = exactPosition(t)
    return { xDiscrete, xExact, err: xDiscrete - xExact }
  }, [dt, t])

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">Decrease step size to watch discrete approximation converge to continuous model.</p>
      <label className="text-xs text-slate-600 dark:text-slate-300">Final time t: {t.toFixed(2)} s</label>
      <input type="range" min="1" max="8" step="0.1" value={t} onChange={(e) => setT(Number(e.target.value))} className="w-full" />
      <label className="text-xs text-slate-600 dark:text-slate-300">Step size dt: {dt.toFixed(2)} s</label>
      <input type="range" min="0.05" max="2" step="0.05" value={dt} onChange={(e) => setDt(Number(e.target.value))} className="w-full" />

      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">Discrete x ~ {values.xDiscrete.toFixed(3)} m</div>
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">Continuous x = {values.xExact.toFixed(3)} m</div>
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">Error = {values.err.toFixed(3)} m</div>
      </div>
    </div>
  )
}
