import { useState, useMemo } from 'react'

/** Animated strikethrough line that draws across text on hover */
function Cancelled({ children, active }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      <span
        style={{
          position: 'absolute',
          left: '-2px',
          right: '-2px',
          top: '50%',
          height: '2px',
          background: '#ef4444',
          transformOrigin: 'left center',
          transform: active ? 'scaleX(1)' : 'scaleX(0)',
          transition: active ? 'transform 0.35s ease 0.1s' : 'transform 0.15s ease',
          borderRadius: '1px',
        }}
      />
    </span>
  )
}

function Fraction({ num, denom, numColor, denomColor, fontSize = 15 }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', lineHeight: 1, fontSize }}>
      <span style={{ color: numColor, fontWeight: 700, padding: '0 3px' }}>{num}</span>
      <span style={{ borderTop: '1.5px solid currentColor', width: '100%', margin: '1px 0' }} />
      <span style={{ color: denomColor, fontWeight: 700, padding: '0 3px' }}>{denom}</span>
    </span>
  )
}

export default function LeibnizUnitTrackerLab() {
  const [t, setT] = useState(3)
  const [drdt, setDrdt] = useState(2)
  const [cancelling, setCancelling] = useState(false)

  // r grows linearly with time starting from r₀ = 1
  const r = 1 + drdt * t

  const vals = useMemo(() => {
    const dVdr = 4 * Math.PI * r * r
    const dVdt = dVdr * drdt
    return { dVdr, dVdt, r }
  }, [r, drdt])

  // Balloon visual: map r (1–13 range) to a circle radius (20–90px)
  const maxR = 1 + 5 * 10
  const balloonRadius = 20 + (vals.r / maxR) * 70

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-5 space-y-4">
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Leibniz Unit Tracker — Balloon Expansion</h3>

      {/* Balloon + Chain Rule display */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">

        {/* Balloon SVG */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <svg width={160} height={160} style={{ display: 'block' }}>
            <defs>
              <radialGradient id="balloonGrad" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
              </radialGradient>
            </defs>
            <circle
              cx={80} cy={80}
              r={balloonRadius}
              fill="url(#balloonGrad)"
              stroke="#2563eb"
              strokeWidth={1.5}
              style={{ transition: 'r 0.15s ease' }}
            />
            {/* Radius label */}
            <line x1={80} y1={80} x2={80 + balloonRadius} y2={80} stroke="#1d4ed8" strokeWidth={1.5} strokeDasharray="3,2" />
            <text x={80 + balloonRadius / 2} y={74} textAnchor="middle" fontSize={11} fill="#1d4ed8" fontWeight="bold">r</text>
          </svg>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            r = <strong className="text-blue-500">{vals.r.toFixed(2)}</strong> cm
          </p>
        </div>

        {/* Chain rule fractions */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">
            Hover to cancel units
          </p>
          <div
            className="rounded-lg border p-4 cursor-pointer select-none transition-colors"
            style={{
              borderColor: cancelling ? '#f59e0b' : undefined,
              background: cancelling ? 'rgba(251,191,36,0.06)' : undefined,
            }}
            onMouseEnter={() => setCancelling(true)}
            onMouseLeave={() => setCancelling(false)}
            onTouchStart={() => setCancelling(c => !c)}
          >
            {/* dV/dt = dV/dr · dr/dt */}
            <div className="flex items-center gap-2 flex-wrap mb-3" style={{ fontSize: 15 }}>
              <Fraction num="dV" denom="dt" numColor="#10b981" denomColor="#64748b" />
              <span className="text-slate-500 font-bold">=</span>
              <Fraction num="dV" denom={<Cancelled active={cancelling}>dr</Cancelled>} numColor="#10b981" denomColor="#ef4444" />
              <span className="text-slate-500 font-bold">·</span>
              <Fraction num={<Cancelled active={cancelling}>dr</Cancelled>} denom="dt" numColor="#ef4444" denomColor="#64748b" />
            </div>

            {/* Units row */}
            <div className="flex items-center gap-2 flex-wrap" style={{ fontSize: 13 }}>
              <Fraction num="cm³" denom="s" numColor="#10b981" denomColor="#64748b" fontSize={12} />
              <span className="text-slate-400">=</span>
              <Fraction num="cm³" denom={<Cancelled active={cancelling}>cm</Cancelled>} numColor="#10b981" denomColor="#ef4444" fontSize={12} />
              <span className="text-slate-400">·</span>
              <Fraction num={<Cancelled active={cancelling}>cm</Cancelled>} denom="s" numColor="#ef4444" denomColor="#64748b" fontSize={12} />
            </div>

            {cancelling && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                The <span className="font-mono">dr</span> cancels — leaving exactly cm³/s ✓
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Time t = <strong className="text-blue-500">{t.toFixed(1)} s</strong>
          </label>
          <input type="range" min={0} max={10} step={0.1} value={t}
            onChange={e => setT(+e.target.value)} className="w-full accent-blue-500" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            dr/dt = <strong className="text-purple-500">{drdt.toFixed(1)} cm/s</strong>
          </label>
          <input type="range" min={0.2} max={5} step={0.1} value={drdt}
            onChange={e => setDrdt(+e.target.value)} className="w-full accent-purple-500" />
        </div>
      </div>

      {/* Numeric readout */}
      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 grid grid-cols-3 gap-3 text-center text-sm">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">dV/dr</p>
          <p className="font-bold text-emerald-500">{vals.dVdr.toFixed(2)}</p>
          <p className="text-xs text-slate-400">cm³/cm</p>
        </div>
        <div className="border-x border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-400 mb-0.5">dr/dt</p>
          <p className="font-bold text-purple-500">{drdt.toFixed(2)}</p>
          <p className="text-xs text-slate-400">cm/s</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">dV/dt</p>
          <p className="font-bold text-blue-500">{vals.dVdt.toFixed(2)}</p>
          <p className="text-xs text-slate-400">cm³/s</p>
        </div>
      </div>
    </div>
  )
}
