/**
 * DerivativeCycleClock — The Higher-Order Derivative Game
 *
 * A "clock" showing sin → cos → -sin → -cos → sin (repeat).
 * Each click of "Take Derivative" rotates the needle 90° clockwise.
 * Below: a live tracker (f, f', f'', ...) and a modulo calculator
 * so students can instantly find, e.g., the 43rd derivative.
 */
import { useState, useRef, useEffect } from 'react'

// The four positions on the clock, in clockwise order starting from top
const CYCLE = [
  { label: 'sin(x)',  latex: '\\sin x',  color: '#3b82f6', angle: -90 },  // top
  { label: 'cos(x)',  latex: '\\cos x',  color: '#10b981', angle: 0   },  // right
  { label: '-sin(x)', latex: '-\\sin x', color: '#ef4444', angle: 90  },  // bottom
  { label: '-cos(x)', latex: '-\\cos x', color: '#a855f7', angle: 180 },  // left
]

const SUPERSCRIPTS = ['', '′', '′′', '′′′']

function ordinalLabel(n) {
  if (n === 0) return 'f(x)'
  if (n <= 3) return `f${'′'.repeat(n)}(x)`
  return `f⁽${n}⁾(x)`
}

// Map step → angle of needle (degrees, 0 = up, clockwise)
function stepToAngle(step) {
  return step * 90 // 0→0°(top), 1→90°(right), 2→180°(bottom), 3→270°(left)
}

export default function DerivativeCycleClock({ params = {}, onParamChange }) {
  const [step, setStep] = useState(0)           // current position on the clock (0-3)
  const [totalTaken, setTotalTaken] = useState(0) // total derivatives taken
  const [nQuery, setNQuery] = useState(43)      // for the modulo calculator
  const [animating, setAnimating] = useState(false)

  const current = CYCLE[step]
  const needleAngle = stepToAngle(step)

  function takeDeriv() {
    if (animating) return
    setAnimating(true)
    setTimeout(() => setAnimating(false), 350)
    setStep(s => (s + 1) % 4)
    setTotalTaken(n => n + 1)
  }

  function reset() {
    setStep(0)
    setTotalTaken(0)
  }

  // Modulo calculator
  const queryMod = ((nQuery % 4) + 4) % 4
  const queryResult = CYCLE[queryMod]

  // Build history labels (last 8 visible)
  const historyStart = Math.max(0, totalTaken - 7)
  const historyItems = []
  for (let i = historyStart; i <= totalTaken; i++) {
    historyItems.push({ n: i, fn: CYCLE[i % 4] })
  }

  // Clock geometry
  const cx = 110, cy = 110, r = 80
  const labelPositions = [
    { x: cx,     y: cy - r - 16, idx: 0 }, // top = sin
    { x: cx + r + 16, y: cy,     idx: 1 }, // right = cos
    { x: cx,     y: cy + r + 16, idx: 2 }, // bottom = -sin
    { x: cx - r - 16, y: cy,     idx: 3 }, // left = -cos
  ]

  // Needle tip coords
  const angleRad = (needleAngle - 90) * Math.PI / 180
  const needleTip = {
    x: cx + (r - 8) * Math.cos(angleRad),
    y: cy + (r - 8) * Math.sin(angleRad),
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 select-none">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">

        {/* ── Clock ── */}
        <div className="flex flex-col items-center gap-3">
          <svg viewBox="0 0 220 220" className="w-56 h-56">
            {/* Outer ring */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="2" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={current.color} strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * r}`}
              strokeDashoffset="0"
              opacity="0.25"
            />

            {/* Tick marks at 0/90/180/270 */}
            {[0, 90, 180, 270].map(a => {
              const rad = (a - 90) * Math.PI / 180
              return (
                <line key={a}
                  x1={cx + (r - 6) * Math.cos(rad)} y1={cy + (r - 6) * Math.sin(rad)}
                  x2={cx + (r + 0) * Math.cos(rad)} y2={cy + (r + 0) * Math.sin(rad)}
                  stroke="#94a3b8" strokeWidth="2"
                />
              )
            })}

            {/* Quadrant labels */}
            {labelPositions.map(({ x, y, idx }) => {
              const fn = CYCLE[idx]
              const isActive = idx === step
              return (
                <g key={idx}>
                  <rect
                    x={x - 28} y={y - 11}
                    width={56} height={22}
                    rx={6}
                    fill={isActive ? fn.color : '#f1f5f9'}
                    opacity={isActive ? 1 : 0.7}
                  />
                  <text
                    x={x} y={y + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight={isActive ? 'bold' : 'normal'}
                    fill={isActive ? '#fff' : '#64748b'}
                    fontFamily="monospace"
                  >
                    {fn.label}
                  </text>
                </g>
              )
            })}

            {/* Needle */}
            <line
              x1={cx} y1={cy}
              x2={needleTip.x} y2={needleTip.y}
              stroke={current.color}
              strokeWidth="3"
              strokeLinecap="round"
              style={{ transition: animating ? 'all 0.3s cubic-bezier(.4,2,.6,1)' : 'none' }}
            />

            {/* Center hub */}
            <circle cx={cx} cy={cy} r="7" fill={current.color} />
            <circle cx={cx} cy={cy} r="3" fill="white" />
          </svg>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={takeDeriv}
              className="px-4 py-2 rounded-lg font-bold text-sm text-white shadow transition-all active:scale-95"
              style={{ backgroundColor: current.color }}
            >
              d/dx →
            </button>
            <button
              onClick={reset}
              className="px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Current function badge */}
          <div
            className="rounded-xl px-5 py-2 text-white font-mono text-lg font-bold shadow-md"
            style={{ backgroundColor: current.color }}
          >
            {ordinalLabel(totalTaken)} = {current.label}
          </div>
        </div>

        {/* ── Right panel: tracker + calculator ── */}
        <div className="flex flex-col gap-4 w-full max-w-xs">

          {/* Derivative tracker */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Derivative Tracker
              </p>
            </div>
            <div className="px-4 py-3 space-y-1 max-h-52 overflow-y-auto">
              {historyItems.map(({ n, fn }) => (
                <div key={n} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500 w-16 text-right font-mono flex-shrink-0">
                    {ordinalLabel(n)} =
                  </span>
                  <span
                    className="text-sm font-mono font-bold px-2 py-0.5 rounded"
                    style={{
                      color: fn.color,
                      backgroundColor: fn.color + '18',
                    }}
                  >
                    {fn.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Modulo calculator */}
          <div className="rounded-xl border border-purple-200 dark:border-purple-900/60 overflow-hidden">
            <div className="px-4 py-2 bg-purple-50 dark:bg-purple-950/40 border-b border-purple-100 dark:border-purple-800">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Instant Calculator
              </p>
            </div>
            <div className="px-4 py-3 space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">Find the Nth derivative of sin(x):</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">N =</span>
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={nQuery}
                  onChange={e => setNQuery(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div className="bg-purple-50/60 dark:bg-purple-950/20 rounded-lg px-3 py-2 space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {nQuery} mod 4 = <span className="font-bold text-purple-600 dark:text-purple-400">{queryMod}</span>
                </p>
                <p className="text-sm font-bold" style={{ color: queryResult.color }}>
                  f⁽{nQuery}⁾(x) = {queryResult.label}
                </p>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 italic leading-relaxed">
                Every 4 derivatives complete one full cycle back to sin(x). So just find the remainder when dividing by 4.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
