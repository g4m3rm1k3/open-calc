import { useMemo, useState } from 'react'

const G = 9.8

/**
 * SignConventionExplorer
 *
 * Shows a ball thrown upward with a vertical axis.
 * User controls:
 *  1. Origin height (slider): drag the zero point up/down the physical axis
 *  2. Positive direction toggle: upward (+) or downward (+)
 *  3. Time slider: move through the trajectory
 *
 * Live equations update to show how all signed quantities change
 * while the physical trajectory stays identical.
 */
export default function SignConventionExplorer() {
  const [positiveUp, setPositiveUp] = useState(true)
  const [originOffset, setOriginOffset] = useState(0)   // meters from ground; 0 = ground
  const [t, setT] = useState(0)

  // Physical scenario: ball thrown up from ground at 15 m/s
  const v0_physical = 15          // always upward
  const groundHeight = 0          // meters (physical ground)
  const maxPhysicalHeight = (v0_physical ** 2) / (2 * G)  // ≈ 11.5 m
  const totalTime = (2 * v0_physical) / G                  // ≈ 3.06 s

  // Physical position (always: ground = 0, up = positive)
  const physicalY = (time) => v0_physical * time - 0.5 * G * time ** 2

  // Coordinate system values based on user choices
  const { x0, v0_coord, a_coord, xAtT } = useMemo(() => {
    const sign = positiveUp ? 1 : -1
    const x0 = sign * (groundHeight - originOffset)
    const v0_coord = sign * v0_physical
    const a_coord = sign * (-G)     // gravity is downward physically
    const xAtT = x0 + v0_coord * t + 0.5 * a_coord * t ** 2
    return { x0, v0_coord, a_coord, xAtT }
  }, [positiveUp, originOffset, t])

  // SVG geometry
  const SVG_H = 340
  const SVG_W = 260
  const axisX = 80
  const groundPx = SVG_H - 40
  const scalePx = 12   // px per meter

  // Physical ball Y in SVG coords (SVG y goes down)
  const physY_raw = physicalY(Math.min(t, totalTime))
  const ballPx = groundPx - physY_raw * scalePx

  // Axis tick marks (physical meters from ground)
  const ticks = []
  for (let m = 0; m <= Math.ceil(maxPhysicalHeight) + 2; m++) {
    ticks.push(m)
  }

  // Where is the origin in SVG coords?
  const originPx = groundPx - originOffset * scalePx

  // Axis arrow direction
  const arrowUp = positiveUp

  const fmt = (n) => (n >= 0 ? `+${n.toFixed(1)}` : n.toFixed(1))

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
      <h4 className="text-xs font-bold uppercase tracking-tight text-slate-500 dark:text-slate-400 mb-4">
        Coordinate System Explorer — same physics, different conventions
      </h4>

      <div className="flex gap-4 flex-wrap">
        {/* SVG Axis */}
        <svg
          width={SVG_W}
          height={SVG_H}
          className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0"
        >
          {/* Ground line */}
          <line x1={30} y1={groundPx} x2={SVG_W - 10} y2={groundPx}
            stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
          <text x={SVG_W - 8} y={groundPx + 4} textAnchor="end" fontSize="9" fill="#94a3b8">
            ground
          </text>

          {/* Physical axis line */}
          <line x1={axisX} y1={groundPx} x2={axisX} y2={20}
            stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Physical tick marks */}
          {ticks.map((m) => {
            const py = groundPx - m * scalePx
            if (py < 15) return null
            return (
              <g key={m}>
                <line x1={axisX - 4} y1={py} x2={axisX + 4} y2={py}
                  stroke="#94a3b8" strokeWidth="1" />
                <text x={axisX - 7} y={py + 3} textAnchor="end" fontSize="8" fill="#94a3b8">
                  {m}m
                </text>
              </g>
            )
          })}

          {/* Origin marker */}
          <circle cx={axisX} cy={originPx} r={5} fill="#f59e0b" />
          <line x1={axisX - 12} y1={originPx} x2={axisX + 20} y2={originPx}
            stroke="#f59e0b" strokeWidth="1.5" />
          <text x={axisX + 22} y={originPx + 4} fontSize="10" fill="#f59e0b" fontWeight="bold">
            x = 0
          </text>

          {/* Positive direction arrow */}
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3"
              orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill={arrowUp ? '#22c55e' : '#ef4444'} />
            </marker>
          </defs>
          <line
            x1={axisX + 30} y1={arrowUp ? originPx : originPx}
            x2={axisX + 30} y2={arrowUp ? originPx - 40 : originPx + 40}
            stroke={arrowUp ? '#22c55e' : '#ef4444'}
            strokeWidth="2.5"
            markerEnd="url(#arrowhead)"
          />
          <text
            x={axisX + 38}
            y={arrowUp ? originPx - 20 : originPx + 24}
            fontSize="9"
            fill={arrowUp ? '#22c55e' : '#ef4444'}
            fontWeight="bold"
          >
            +
          </text>

          {/* Ball trajectory ghost (full arc) */}
          {Array.from({ length: 31 }, (_, i) => {
            const tGhost = (i / 30) * totalTime
            const pyGhost = groundPx - physicalY(tGhost) * scalePx
            return pyGhost
          }).map((py, i, arr) => {
            if (i === 0) return null
            const prevT = ((i - 1) / 30) * totalTime
            const prevPy = groundPx - physicalY(prevT) * scalePx
            return (
              <line key={i}
                x1={axisX + 15} y1={prevPy}
                x2={axisX + 15} y2={py}
                stroke="#bfdbfe" strokeWidth="1.5"
              />
            )
          })}

          {/* Ball */}
          <circle cx={axisX + 15} cy={Math.max(15, ballPx)} r={9}
            fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />

          {/* x at t label */}
          <line x1={axisX} y1={originPx} x2={axisX + 14} y2={Math.max(15, ballPx)}
            stroke="#a78bfa" strokeWidth="1" strokeDasharray="3 2" />
          <text x={axisX - 2} y={(originPx + Math.max(15, ballPx)) / 2} textAnchor="end"
            fontSize="9" fill="#a78bfa">
            x={xAtT.toFixed(1)}
          </text>
        </svg>

        {/* Controls + Live equations */}
        <div className="flex-1 min-w-[180px] space-y-4">
          {/* Positive direction toggle */}
          <div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
              Positive direction
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPositiveUp(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                  positiveUp
                    ? 'bg-green-500 text-white border-green-600'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500'
                }`}
              >
                ↑ Upward (+)
              </button>
              <button
                onClick={() => setPositiveUp(false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                  !positiveUp
                    ? 'bg-red-500 text-white border-red-600'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500'
                }`}
              >
                ↓ Downward (+)
              </button>
            </div>
          </div>

          {/* Origin slider */}
          <div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Origin height: {originOffset.toFixed(0)} m above ground
            </p>
            <input
              type="range"
              min={0}
              max={Math.ceil(maxPhysicalHeight)}
              step={1}
              value={originOffset}
              onChange={(e) => setOriginOffset(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Move the zero point — yellow dot on axis
            </p>
          </div>

          {/* Time slider */}
          <div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Time: t = {t.toFixed(2)} s
            </p>
            <input
              type="range"
              min={0}
              max={totalTime.toFixed(2)}
              step={0.05}
              value={t}
              onChange={(e) => setT(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Live equations */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide mb-2">
              Live equations (your convention)
            </p>
            <div className="font-mono text-xs space-y-1">
              <p>
                <span className="text-slate-400">x₀ =</span>{' '}
                <span className="text-amber-500 font-bold">{fmt(x0)} m</span>
              </p>
              <p>
                <span className="text-slate-400">v₀ =</span>{' '}
                <span className="text-blue-500 font-bold">{fmt(v0_coord)} m/s</span>
              </p>
              <p>
                <span className="text-slate-400">a =</span>{' '}
                <span className="text-red-500 font-bold">{fmt(a_coord)} m/s²</span>
              </p>
              <hr className="border-slate-200 dark:border-slate-700 my-1" />
              <p>
                <span className="text-slate-400">x(t) =</span>{' '}
                <span className="text-purple-500 font-bold">{xAtT.toFixed(2)} m</span>
              </p>
            </div>
          </div>

          {/* Key insight */}
          <div className={`p-3 rounded-lg border text-[10px] leading-relaxed ${
            originOffset === 0 && positiveUp
              ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300'
              : 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300'
          }`}>
            {originOffset === 0 && positiveUp
              ? 'Standard convention: ground = 0, up = +. Most textbooks use this.'
              : 'Custom convention — all signs changed, but the ball still follows the same arc. Physics is invariant: choose any convention you like.'}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] text-slate-500 dark:text-slate-400">
        <strong>What to notice:</strong> Drag the origin to the peak height — now x₀ is negative (below origin)
        and x at peak is 0. Flip the direction — a changes sign from −9.8 to +9.8.
        The <span className="font-bold text-blue-500">blue ball</span> never moves — only the numbers do.
      </div>
    </div>
  )
}
