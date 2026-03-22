import { useMemo, useState } from 'react'

function xOfT(t, a, v0) {
  return v0 * t + 0.5 * a * t * t
}

function vOfT(t, a, v0) {
  return v0 + a * t
}

export default function VelocityComparison() {
  const [a, setA] = useState(1.2)
  const [v0, setV0] = useState(1)
  const [t0, setT0] = useState(1)
  const [dt, setDt] = useState(1)

  const values = useMemo(() => {
    const x1 = xOfT(t0, a, v0)
    const x2 = xOfT(t0 + dt, a, v0)
    const vAvg = (x2 - x1) / dt
    const vInst = vOfT(t0, a, v0)
    const mismatch = vAvg - vInst
    return { x1, x2, vAvg, vInst, mismatch }
  }, [a, v0, t0, dt])

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Compare interval-average velocity and point-instantaneous velocity for the same motion law.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <label>
          Acceleration a: {a.toFixed(2)} m/s^2
          <input type="range" min="-3" max="4" step="0.1" value={a} onChange={(e) => setA(Number(e.target.value))} className="w-full" />
        </label>
        <label>
          Initial velocity v0: {v0.toFixed(2)} m/s
          <input type="range" min="-4" max="6" step="0.1" value={v0} onChange={(e) => setV0(Number(e.target.value))} className="w-full" />
        </label>
        <label>
          Start time t0: {t0.toFixed(2)} s
          <input type="range" min="0" max="6" step="0.1" value={t0} onChange={(e) => setT0(Number(e.target.value))} className="w-full" />
        </label>
        <label>
          Interval Dt: {dt.toFixed(2)} s
          <input type="range" min="0.1" max="3" step="0.1" value={dt} onChange={(e) => setDt(Number(e.target.value))} className="w-full" />
        </label>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          v_avg = {values.vAvg.toFixed(3)} m/s
        </div>
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          v_inst(t0) = {values.vInst.toFixed(3)} m/s
        </div>
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          difference = {values.mismatch.toFixed(3)} m/s
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        As Dt shrinks, v_avg approaches v_inst. With larger Dt, interval averaging can hide local changes.
      </p>
    </div>
  )
}
