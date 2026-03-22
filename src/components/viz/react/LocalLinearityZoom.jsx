import { useMemo, useState } from 'react'

function f(x) {
  return x * x
}

function fp(x) {
  return 2 * x
}

export default function LocalLinearityZoom() {
  const [x0, setX0] = useState(1.5)
  const [zoom, setZoom] = useState(1)

  const values = useMemo(() => {
    const h = Math.max(0.02, 1 / zoom)
    const left = x0 - h
    const right = x0 + h
    const slopeSecant = (f(right) - f(left)) / (2 * h)
    const slopeTangent = fp(x0)
    return { h, left, right, slopeSecant, slopeTangent, err: slopeSecant - slopeTangent }
  }, [x0, zoom])

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Increase zoom to shrink the neighborhood around x0. The curve becomes locally line-like.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <label>
          Focus point x0: {x0.toFixed(2)}
          <input type="range" min="-3" max="3" step="0.1" value={x0} onChange={(e) => setX0(Number(e.target.value))} className="w-full" />
        </label>
        <label>
          Zoom level: {zoom.toFixed(1)}x
          <input type="range" min="1" max="50" step="0.5" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full" />
        </label>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          Neighborhood h = {values.h.toFixed(3)}
        </div>
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          secant slope = {values.slopeSecant.toFixed(4)}
        </div>
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          tangent slope = {values.slopeTangent.toFixed(4)}
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Error (secant - tangent): {values.err.toExponential(2)}. As zoom increases, this error approaches zero.
      </p>
      <p className="text-xs italic text-indigo-600 dark:text-indigo-300">
        The secret of physics: smooth curves become line-like when viewed locally enough.
      </p>
    </div>
  )
}
