import { useMemo, useState } from 'react'
import SliderControl from '../SliderControl.jsx'

const W = 760
const H = 320

function fmt(value, digits = 3) {
  if (!Number.isFinite(value)) return 'undefined'
  return value.toFixed(digits)
}

function curveState(mode, t, scale) {
  if (mode === 'circle') {
    const x = scale * Math.cos(t)
    const y = scale * Math.sin(t)
    const vx = -scale * Math.sin(t)
    const vy = scale * Math.cos(t)
    const ax = -scale * Math.cos(t)
    const ay = -scale * Math.sin(t)
    return { x, y, vx, vy, ax, ay }
  }

  if (mode === 'helixProjection') {
    const x = scale * Math.cos(t)
    const y = 0.6 * scale * Math.sin(2 * t)
    const vx = -scale * Math.sin(t)
    const vy = 1.2 * scale * Math.cos(2 * t)
    const ax = -scale * Math.cos(t)
    const ay = -2.4 * scale * Math.sin(2 * t)
    return { x, y, vx, vy, ax, ay }
  }

  const x = t
  const y = 0.25 * t * t
  const vx = 1
  const vy = 0.5 * t
  const ax = 0
  const ay = 0.5
  return { x, y, vx, vy, ax, ay }
}

export default function VectorKinematicsLab() {
  const [mode, setMode] = useState('circle')
  const [t, setT] = useState(1.2)
  const [scale, setScale] = useState(2.5)
  const [vectorScale, setVectorScale] = useState(0.65)

  const points = useMemo(() => {
    const list = []
    const start = mode === 'parabola' ? -6 : 0
    const end = mode === 'parabola' ? 6 : 2 * Math.PI
    const step = (end - start) / 180

    for (let u = start; u <= end + 1e-9; u += step) {
      const s = curveState(mode, u, scale)
      list.push({ x: s.x, y: s.y })
    }
    return { list, start, end }
  }, [mode, scale])

  const current = useMemo(() => curveState(mode, t, scale), [mode, t, scale])

  const bounds = useMemo(() => {
    const xs = points.list.map((p) => p.x)
    const ys = points.list.map((p) => p.y)
    const margin = 0.6
    const minX = Math.min(...xs) - margin
    const maxX = Math.max(...xs) + margin
    const minY = Math.min(...ys) - margin
    const maxY = Math.max(...ys) + margin
    return { minX, maxX, minY, maxY }
  }, [points])

  const toX = (x) => 40 + ((x - bounds.minX) / (bounds.maxX - bounds.minX || 1)) * (W - 80)
  const toY = (y) => 24 + ((bounds.maxY - y) / (bounds.maxY - bounds.minY || 1)) * (H - 64)

  const px = toX(current.x)
  const py = toY(current.y)

  const drawVector = (dx, dy, color) => {
    const x2 = toX(current.x + dx * vectorScale)
    const y2 = toY(current.y + dy * vectorScale)
    return (
      <g>
        <line x1={px} y1={py} x2={x2} y2={y2} stroke={color} strokeWidth="2.5" />
        <circle cx={x2} cy={y2} r="3.2" fill={color} />
      </g>
    )
  }

  const speed = Math.hypot(current.vx, current.vy)
  const accelMag = Math.hypot(current.ax, current.ay)

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3 px-2">
        {[
          ['circle', 'uniform circle'],
          ['helixProjection', 'oscillating loop'],
          ['parabola', 'projectile slice'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              mode === id
                ? 'bg-brand-500 text-white border-brand-500'
                : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-brand-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <line x1={40} y1={H - 40} x2={W - 20} y2={H - 40} stroke="#94a3b8" />
        <line x1={40} y1={24} x2={40} y2={H - 40} stroke="#94a3b8" />

        <path
          d={points.list
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.x)} ${toY(p.y)}`)
            .join(' ')}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
        />

        <circle cx={px} cy={py} r="5" fill="#1d4ed8" />

        {drawVector(current.vx, current.vy, '#16a34a')}
        {drawVector(current.ax, current.ay, '#dc2626')}

        <text x={50} y={22} fontSize="11" fill="#1d4ed8">trajectory r(t)</text>
        <text x={150} y={22} fontSize="11" fill="#16a34a">velocity v(t)</text>
        <text x={250} y={22} fontSize="11" fill="#dc2626">acceleration a(t)</text>
      </svg>

      <div className="px-4 space-y-1">
        <SliderControl
          label="parameter t"
          min={points.start}
          max={points.end}
          step={0.01}
          value={t}
          onChange={setT}
        />
        <SliderControl label="path scale" min={0.8} max={4} step={0.1} value={scale} onChange={setScale} />
        <SliderControl
          label="arrow scale"
          min={0.2}
          max={1.5}
          step={0.05}
          value={vectorScale}
          onChange={setVectorScale}
        />
      </div>

      <div className="px-4 mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <div>
          r(t) = ({fmt(current.x)}, {fmt(current.y)})
        </div>
        <div>
          v(t) = ({fmt(current.vx)}, {fmt(current.vy)}), |v| = {fmt(speed)}
        </div>
        <div>
          a(t) = ({fmt(current.ax)}, {fmt(current.ay)}), |a| = {fmt(accelMag)}
        </div>
        <div>
          Readout tip: when |v| stays constant but acceleration is nonzero, motion is turning without speeding up.
        </div>
      </div>
    </div>
  )
}
