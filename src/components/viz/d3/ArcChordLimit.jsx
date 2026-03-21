import { useMemo, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 720
const H = 320
const CX = 170
const CY = 170
const R = 110

function fmt(v, digits = 4) {
  return Number.isFinite(v) ? v.toFixed(digits) : 'undefined'
}

export default function ArcChordLimit() {
  const [theta, setTheta] = useState(1.1)

  const data = useMemo(() => {
    const arc = R * theta
    const chord = 2 * R * Math.sin(theta / 2)
    const ratio = chord / arc
    const sinc = Math.sin(theta) / theta
    const px = CX + R * Math.cos(theta)
    const py = CY - R * Math.sin(theta)

    return { arc, chord, ratio, sinc, px, py }
  }, [theta])

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#cbd5e1" strokeWidth="2" />
        <line x1={CX} y1={CY} x2={CX + R} y2={CY} stroke="#94a3b8" strokeWidth="1.5" />
        <line x1={CX} y1={CY} x2={data.px} y2={data.py} stroke="#6470f1" strokeWidth="2" />

        <path
          d={`M ${CX + R} ${CY} A ${R} ${R} 0 0 0 ${data.px} ${data.py}`}
          fill="none"
          stroke="#ef4444"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <line
          x1={CX + R}
          y1={CY}
          x2={data.px}
          y2={data.py}
          stroke="#10b981"
          strokeWidth="3"
          strokeDasharray="6,4"
        />

        <circle cx={CX + R} cy={CY} r={4.5} fill="#1e293b" />
        <circle cx={data.px} cy={data.py} r={4.5} fill="#1e293b" />

        <text x={35} y={34} fill="#334155" fontSize="13">red: arc length = Rθ</text>
        <text x={35} y={52} fill="#334155" fontSize="13">green dashed: chord = 2R sin(θ/2)</text>
        <text x={35} y={70} fill="#334155" fontSize="13">As θ → 0, chord/arc → 1 (squeeze intuition)</text>

        <rect x={355} y={36} width={320} height={132} rx={10} fill="#f8fafc" stroke="#cbd5e1" />
        <text x={372} y={64} fill="#0f172a" fontSize="14">θ (radians) = {fmt(theta, 3)}</text>
        <text x={372} y={88} fill="#0f172a" fontSize="14">arc length = {fmt(data.arc, 3)}</text>
        <text x={372} y={112} fill="#0f172a" fontSize="14">chord length = {fmt(data.chord, 3)}</text>
        <text x={372} y={136} fill="#0f172a" fontSize="14">chord / arc = {fmt(data.ratio, 5)}</text>
        <text x={372} y={160} fill="#0f172a" fontSize="14">sin(θ)/θ = {fmt(data.sinc, 5)}</text>

        <text x={140} y={300} fill="#64748b" fontSize="12">Circle geometry view</text>
        <text x={430} y={300} fill="#64748b" fontSize="12">Numerical convergence view</text>
      </svg>

      <div className="px-4 mt-2">
        <SliderControl
          label="Angle θ (radians)"
          min={0.02}
          max={1.4}
          step={0.01}
          value={theta}
          onChange={setTheta}
        />
      </div>

      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 italic">
        The geometric fact "arc and chord become indistinguishable for tiny angles" is the visual engine behind the limit sin(x)/x = 1.
      </p>
    </div>
  )
}
