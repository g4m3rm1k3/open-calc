import { useMemo, useState } from 'react'

const curve = (t, a, v0) => ({
  t,
  x: v0 * t + 0.5 * a * t * t,
  z: 0.3 * Math.sin(0.8 * t),
})

export default function SpaceTimeRibbon() {
  const [a, setA] = useState(0.8)
  const [v0, setV0] = useState(1)
  const [t0, setT0] = useState(2)
  const [dt, setDt] = useState(1)

  const data = useMemo(() => {
    const pts = Array.from({ length: 70 }, (_, i) => curve((i / 69) * 6, a, v0))
    const p1 = curve(t0, a, v0)
    const p2 = curve(Math.min(6, t0 + dt), a, v0)
    const secSlope = (p2.x - p1.x) / Math.max(0.05, p2.t - p1.t)
    const instSlope = v0 + a * t0
    return { pts, p1, p2, secSlope, instSlope }
  }, [a, v0, t0, dt])

  const project = (p) => {
    const sx = 35 + p.t * 48
    const sy = 220 - p.x * 16 - p.z * 20
    return `${sx},${sy}`
  }

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">Space-time ribbon: average is a straight pole between two times; instantaneous is a local laser direction.</p>

      <svg viewBox="0 0 360 260" className="w-full rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <polyline fill="none" stroke="#6366f1" strokeWidth="3" points={data.pts.map(project).join(' ')} />
        <line x1={project(data.p1).split(',')[0]} y1={project(data.p1).split(',')[1]} x2={project(data.p2).split(',')[0]} y2={project(data.p2).split(',')[1]} stroke="#f59e0b" strokeWidth="3" />
        <circle cx={project(data.p1).split(',')[0]} cy={project(data.p1).split(',')[1]} r="5" fill="#06b6d4" />
        <line
          x1={project(data.p1).split(',')[0]}
          y1={project(data.p1).split(',')[1]}
          x2={Number(project(data.p1).split(',')[0]) + 45}
          y2={Number(project(data.p1).split(',')[1]) - data.instSlope * 5}
          stroke="#10b981"
          strokeWidth="2"
        />
      </svg>

      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <label>Acceleration a: {a.toFixed(2)}<input type="range" min="-1" max="2" step="0.1" value={a} onChange={(e) => setA(Number(e.target.value))} className="w-full" /></label>
        <label>Initial v0: {v0.toFixed(2)}<input type="range" min="-2" max="4" step="0.1" value={v0} onChange={(e) => setV0(Number(e.target.value))} className="w-full" /></label>
        <label>Sample time t0: {t0.toFixed(2)}<input type="range" min="0.4" max="5" step="0.1" value={t0} onChange={(e) => setT0(Number(e.target.value))} className="w-full" /></label>
        <label>Window Dt: {dt.toFixed(2)}<input type="range" min="0.1" max="2" step="0.1" value={dt} onChange={(e) => setDt(Number(e.target.value))} className="w-full" /></label>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">average slope = {data.secSlope.toFixed(3)}</div>
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">instant slope = {data.instSlope.toFixed(3)}</div>
      </div>
    </div>
  )
}
