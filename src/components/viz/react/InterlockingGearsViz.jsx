import { useState, useRef, useEffect } from 'react'

/** Generate a gear outline path centered at origin */
function gearPath(r, teeth = 12) {
  const inner = r * 0.76
  const step = (2 * Math.PI) / teeth
  let d = ''
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2
    const pts = [
      [inner * Math.cos(a - step * 0.30), inner * Math.sin(a - step * 0.30)],
      [r     * Math.cos(a - step * 0.10), r     * Math.sin(a - step * 0.10)],
      [r     * Math.cos(a + step * 0.10), r     * Math.sin(a + step * 0.10)],
      [inner * Math.cos(a + step * 0.30), inner * Math.sin(a + step * 0.30)],
    ]
    d += (i === 0 ? 'M' : 'L') + pts.map(p => p.map(v => v.toFixed(2)).join(',')).join('L') + ' '
  }
  return d + 'Z'
}

function Gear({ x, y, r, angle, color, label, teeth = 12 }) {
  const hub = r * 0.22
  return (
    <g transform={`translate(${x},${y})`}>
      <g transform={`rotate(${angle})`}>
        <path d={gearPath(r, teeth)} fill={color} fillOpacity={0.85} stroke={color} strokeWidth={1.2} />
        <circle r={hub} fill="white" fillOpacity={0.9} stroke={color} strokeWidth={1.5} />
        {/* Spoke indicators so rotation is visible */}
        {[0, 90, 180, 270].map(deg => (
          <line
            key={deg}
            x1={0} y1={0}
            x2={0} y2={-(r * 0.52)}
            stroke={color} strokeWidth={2} strokeLinecap="round"
            transform={`rotate(${deg})`}
          />
        ))}
      </g>
      {/* Label below gear */}
      <text y={r + 18} textAnchor="middle" fontSize={13} fontWeight="bold" fill={color}>{label}</text>
    </g>
  )
}

export default function InterlockingGearsViz() {
  const [ratioAB, setRatioAB] = useState(3)   // dA/dB
  const [ratioBC, setRatioBC] = useState(2)   // dB/dC
  const [spinning, setSpinning] = useState(false)
  const [angles, setAngles] = useState([0, 0, 0])
  const rafRef = useRef(null)
  const tRef = useRef(null)
  const anglesRef = useRef([0, 0, 0])

  const dAC = +(ratioAB * ratioBC).toFixed(2)

  useEffect(() => {
    anglesRef.current = angles
  })

  useEffect(() => {
    if (!spinning) {
      cancelAnimationFrame(rafRef.current)
      tRef.current = null
      return
    }
    const baseSpeed = 80 // deg/s for Gear C
    const tick = (now) => {
      if (tRef.current == null) tRef.current = now
      const dt = Math.min((now - tRef.current) / 1000, 0.05)
      tRef.current = now
      const prev = anglesRef.current
      const next = [
        prev[0] + baseSpeed * dAC * dt,
        prev[1] - baseSpeed * ratioBC * dt,
        prev[2] + baseSpeed * dt,
      ]
      anglesRef.current = next
      setAngles([...next])
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [spinning, ratioAB, ratioBC, dAC])

  // SVG layout — 3 gears of equal visual size, touching
  const W = 400, H = 200
  const r = 58
  const gap = 2   // tiny gap between gear teeth
  const dist = 2 * r + gap
  const cy = H / 2 - 10
  const xC = W - r - 24
  const xB = xC - dist
  const xA = xB - dist

  const gearColors = {
    a: '#3b82f6',
    b: '#8b5cf6',
    c: '#10b981',
  }

  const sliderClass = 'w-full accent-brand-500 cursor-pointer'
  const labelClass = 'text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide'

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Interlocking Gears — Rates Multiply</h3>
        <button
          onClick={() => setSpinning(s => !s)}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            spinning
              ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200'
              : 'bg-brand-600 hover:bg-brand-700 text-white'
          }`}
        >
          {spinning ? '⏹ Stop' : '▶ Spin'}
        </button>
      </div>

      {/* SVG canvas */}
      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
          {/* Connecting line to show mesh */}
          <line x1={xA} y1={cy} x2={xC} y2={cy} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4,3" />
          <Gear x={xA} y={cy} r={r} angle={angles[0]} color={gearColors.a} label="Gear A" teeth={13} />
          <Gear x={xB} y={cy} r={r} angle={angles[1]} color={gearColors.b} label="Gear B" teeth={13} />
          <Gear x={xC} y={cy} r={r} angle={angles[2]} color={gearColors.c} label="Gear C" teeth={13} />
          {/* Ratio labels between gears */}
          <text x={(xA+xB)/2} y={cy - r - 6} textAnchor="middle" fontSize={11} fill="#8b5cf6" fontWeight="600">dA/dB = {ratioAB}</text>
          <text x={(xB+xC)/2} y={cy - r - 6} textAnchor="middle" fontSize={11} fill="#10b981" fontWeight="600">dB/dC = {ratioBC}</text>
        </svg>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className={labelClass}>Gear Ratio dA/dB = <span className="text-blue-500">{ratioAB}</span></label>
          <input type="range" min={1} max={5} step={0.5} value={ratioAB}
            onChange={e => { setRatioAB(+e.target.value); setSpinning(false); setAngles([0,0,0]) }}
            className={sliderClass} />
          <p className="text-xs text-slate-400">Gear A turns {ratioAB}× per turn of B</p>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Gear Ratio dB/dC = <span className="text-purple-500">{ratioBC}</span></label>
          <input type="range" min={1} max={5} step={0.5} value={ratioBC}
            onChange={e => { setRatioBC(+e.target.value); setSpinning(false); setAngles([0,0,0]) }}
            className={sliderClass} />
          <p className="text-xs text-slate-400">Gear B turns {ratioBC}× per turn of C</p>
        </div>
      </div>

      {/* Chain rule readout */}
      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2 font-semibold">Chain Rule — Rates Multiply</p>
        <div className="flex items-center gap-2 flex-wrap text-sm font-mono">
          <span className="text-slate-500">dA/dC</span>
          <span className="text-slate-400">=</span>
          <span className="font-bold" style={{ color: gearColors.a }}>dA/dB</span>
          <span className="text-slate-400">·</span>
          <span className="font-bold" style={{ color: gearColors.b }}>dB/dC</span>
          <span className="text-slate-400">=</span>
          <span className="font-bold" style={{ color: gearColors.a }}>{ratioAB}</span>
          <span className="text-slate-400">×</span>
          <span className="font-bold" style={{ color: gearColors.b }}>{ratioBC}</span>
          <span className="text-slate-400">=</span>
          <span className="text-lg font-extrabold" style={{ color: gearColors.c }}>{dAC}</span>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Gear A spins <strong className="text-emerald-500">{dAC}×</strong> faster than Gear C.
          The intermediate gear B "cancels out" — just like <span className="font-mono">du</span> cancels in <span className="font-mono">dy/dx = (dy/du)·(du/dx)</span>.
        </p>
      </div>
    </div>
  )
}
