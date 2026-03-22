import { useMemo, useState } from 'react'

export default function SplitScreenLimitSync() {
  const [h, setH] = useState(1.4)
  const [hoverLimit, setHoverLimit] = useState(false)
  const [hoverTerm, setHoverTerm] = useState('none')

  const morph = useMemo(() => {
    const t = Math.max(0, Math.min(1, (1.5 - h) / 1.45))
    const heavy = `${(1 + h).toFixed(2)}`
    return { t, heavy }
  }, [h])

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        <span
          onMouseEnter={() => setHoverLimit(true)}
          onMouseLeave={() => setHoverLimit(false)}
          className="font-semibold text-indigo-600 dark:text-indigo-300 cursor-help"
          title="Hovering this mirrors the shrinking interval h"
        >
          Limit
        </span>{' '}
        links algebra and calculus: same ratio, but with a shrinking gap.
      </p>

      <label className="text-xs block">
        Interval size h: {h.toFixed(2)}
        <input type="range" min="0.05" max="1.5" step="0.05" value={h} onChange={(e) => setH(Number(e.target.value))} className={`w-full ${hoverLimit ? 'accent-indigo-500' : ''}`} />
      </label>

      <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <p className="text-xs mb-2 text-slate-500">Ghost overlay: hover symbols to light up matching geometry.</p>
        <div className="flex items-center gap-3 text-xs mb-2 font-mono">
          <span
            onMouseEnter={() => setHoverTerm('dx')}
            onMouseLeave={() => setHoverTerm('none')}
            className="px-2 py-1 rounded border cursor-help"
            title="Delta x: change in position over the interval"
          >
            Delta x
          </span>
          <span
            onMouseEnter={() => setHoverTerm('dt')}
            onMouseLeave={() => setHoverTerm('none')}
            className="px-2 py-1 rounded border cursor-help"
            title="Delta t: change in time over the interval"
          >
            Delta t
          </span>
          <span
            onMouseEnter={() => setHoverTerm('limit')}
            onMouseLeave={() => setHoverTerm('none')}
            className="px-2 py-1 rounded border cursor-help"
            title="limit as h approaches 0: interval shrinks to a point"
          >
            limit h-&gt;0
          </span>
        </div>
        <svg viewBox="0 0 280 120" className="w-full h-24">
          <polyline fill="none" stroke="#6366f1" strokeWidth="2" points="20,95 80,70 140,55 200,40 260,32" />
          <line x1="140" y1="55" x2={`${140 + h * 40}`} y2={`${55 - h * 8}`} stroke={hoverTerm === 'dt' ? '#f59e0b' : '#94a3b8'} strokeWidth={hoverTerm === 'dt' ? '3' : '1.5'} />
          <line x1={`${140 + h * 40}`} y1="55" x2={`${140 + h * 40}`} y2={`${55 - h * 8}`} stroke={hoverTerm === 'dx' ? '#06b6d4' : '#94a3b8'} strokeWidth={hoverTerm === 'dx' ? '3' : '1.5'} />
          <circle cx="140" cy="55" r={hoverTerm === 'limit' ? '5' : '3'} fill={hoverTerm === 'limit' ? '#10b981' : '#334155'} />
        </svg>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300 mb-2">Algebra Track (Finite Interval)</p>
          <p className="text-xl font-black text-amber-700 dark:text-amber-300 font-mono">
            <span onMouseEnter={() => setHoverTerm('dx')} onMouseLeave={() => setHoverTerm('none')} className="cursor-help" title="change in position">Delta x</span>
            {' / '}
            <span onMouseEnter={() => setHoverTerm('dt')} onMouseLeave={() => setHoverTerm('none')} className="cursor-help" title="change in time">Delta t</span>
          </p>
          <p className="text-xs mt-2 text-slate-600 dark:text-slate-300">Heavy bracket gap: h = {morph.heavy}</p>
        </div>

        <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 mb-2">Calculus Track (Limit)</p>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
            <span onMouseEnter={() => setHoverTerm('limit')} onMouseLeave={() => setHoverTerm('none')} className="cursor-help" title="same ratio, but interval shrinks to zero">lim h-&gt;0</span>
            {' ('}
            <span onMouseEnter={() => setHoverTerm('dx')} onMouseLeave={() => setHoverTerm('none')} className="cursor-help" title="change in position">Delta x</span>
            {' / '}
            <span onMouseEnter={() => setHoverTerm('dt')} onMouseLeave={() => setHoverTerm('none')} className="cursor-help" title="change in time">Delta t</span>
            {')'}
          </p>
          <p className="text-xs mt-2 text-slate-600 dark:text-slate-300">Refined gap: h -&gt; 0</p>
        </div>
      </div>

      <div className="h-2 rounded bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all" style={{ width: `${(1 - morph.t) * 100}%` }} />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">Bridge idea: Calculus is algebraic interval reasoning pushed to microscopic scale.</p>
    </div>
  )
}
