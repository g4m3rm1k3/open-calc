import { useMemo, useState } from 'react'

function f(x) {
  return x * x
}

function fp(x) {
  return 2 * x
}

export default function MasterLimitGraph({ params = {} }) {
  const isProofMode = typeof params.currentStep === 'number'
  const [x0, setX0] = useState(1.5)
  const [h, setH] = useState(1.2)
  const [phase, setPhase] = useState(1)

  const derived = useMemo(() => {
    const step = Math.max(0, Number(params.currentStep ?? 0))
    const derivedPhase = isProofMode ? Math.min(3, step + 1) : phase
    const derivedH = isProofMode ? Math.max(0.05, 1.4 - step * 0.35) : h
    const x1 = x0 + derivedH
    const y0 = f(x0)
    const y1 = f(x1)
    const sec = (y1 - y0) / Math.max(0.05, x1 - x0)
    const tan = fp(x0)
    const snap = derivedH <= 0.12
    return { step, derivedPhase, derivedH, x1, y0, y1, sec, tan, snap }
  }, [params.currentStep, isProofMode, phase, h, x0])

  const W = 620
  const H = 320
  const pad = 36
  const xMin = -0.2
  const xMax = 3.8
  const yMin = -0.3
  const yMax = 11
  const sx = (x) => pad + ((x - xMin) / (xMax - xMin)) * (W - 2 * pad)
  const sy = (y) => H - pad - ((y - yMin) / (yMax - yMin)) * (H - 2 * pad)

  const curvePts = Array.from({ length: 140 }, (_, i) => {
    const x = xMin + (i / 139) * (xMax - xMin)
    return `${sx(x)},${sy(f(x))}`
  }).join(' ')

  const secLineY = (x) => derived.y0 + derived.sec * (x - x0)
  const tanLineY = (x) => derived.y0 + derived.tan * (x - x0)

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {!isProofMode && (
          <>
            <button onClick={() => setPhase(1)} className={`px-3 py-1 rounded text-xs ${phase === 1 ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 border'}`}>Phase 1: Algebra</button>
            <button onClick={() => setPhase(2)} className={`px-3 py-1 rounded text-xs ${phase === 2 ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 border'}`}>Phase 2: Limit</button>
            <button onClick={() => setPhase(3)} className={`px-3 py-1 rounded text-xs ${phase === 3 ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 border'}`}>Phase 3: Calculus</button>
          </>
        )}
        {isProofMode && <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">Proof Step {derived.step + 1} synced</span>}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <polyline fill="none" stroke="#6366f1" strokeWidth="3" points={curvePts} />

        {(derived.derivedPhase >= 1) && (
          <>
            <line x1={sx(x0)} y1={sy(derived.y0)} x2={sx(derived.x1)} y2={sy(derived.y1)} stroke={derived.snap ? '#10b981' : '#f59e0b'} strokeWidth={derived.snap ? 3 : 2.4} />
            <circle cx={sx(x0)} cy={sy(derived.y0)} r="5" fill="#6366f1" />
            <circle cx={sx(derived.x1)} cy={sy(derived.y1)} r="5" fill="#f59e0b" />
            <line x1={sx(x0)} y1={sy(derived.y0) + 20} x2={sx(derived.x1)} y2={sy(derived.y0) + 20} stroke="#64748b" strokeWidth="1.5" />
            <text x={(sx(x0) + sx(derived.x1)) / 2} y={sy(derived.y0) + 34} fontSize="11" textAnchor="middle" fill="#64748b">h = {derived.derivedH.toFixed(2)}</text>
          </>
        )}

        {(derived.derivedPhase >= 2) && (
          <line x1={sx(xMin)} y1={sy(secLineY(xMin))} x2={sx(xMax)} y2={sy(secLineY(xMax))} stroke={derived.snap ? '#10b981' : '#f59e0b'} strokeWidth="2" strokeDasharray="5,4" />
        )}

        {(derived.derivedPhase >= 3 || derived.snap) && (
          <line x1={sx(xMin)} y1={sy(tanLineY(xMin))} x2={sx(xMax)} y2={sy(tanLineY(xMax))} stroke="#10b981" strokeWidth="2.8" />
        )}
      </svg>

      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">secant slope = {derived.sec.toFixed(4)}</div>
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">tangent slope = {derived.tan.toFixed(4)}</div>
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">state = {derived.snap ? 'SNAP to local tangent' : 'finite interval'}</div>
      </div>

      {!isProofMode && (
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <label>
            Focus point x0: {x0.toFixed(2)}
            <input type="range" min="0.6" max="3" step="0.05" value={x0} onChange={(e) => setX0(Number(e.target.value))} className="w-full" />
          </label>
          <label>
            Scrub h (limit width): {h.toFixed(2)}
            <input type="range" min="0.05" max="1.6" step="0.05" value={h} onChange={(e) => setH(Number(e.target.value))} className="w-full" />
          </label>
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400">
        One graph, three phases: Algebra secant, limit shrinking, and Calculus tangent. This avoids repeated static visuals and keeps causality explicit.
      </p>
    </div>
  )
}
