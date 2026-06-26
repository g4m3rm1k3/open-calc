import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Scale, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const CHART_HEIGHT = 80
const CHART_W = 320

function sparkPath(points) {
  if (points.length < 2) return ''
  const xs = points.map(p => p.x)
  const ys = points.map(p => p.y)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1

  const nx = x => ((x - minX) / rangeX) * (CHART_W - 20) + 10
  const ny = y => CHART_HEIGHT - ((y - minY) / rangeY) * (CHART_HEIGHT - 16) - 8

  let d = `M ${nx(xs[0])} ${ny(ys[0])}`
  for (let i = 1; i < points.length; i++) {
    const cpx = (nx(xs[i - 1]) + nx(xs[i])) / 2
    d += ` C ${cpx} ${ny(ys[i - 1])}, ${cpx} ${ny(ys[i])}, ${nx(xs[i])} ${ny(ys[i])}`
  }
  return d
}

export function BodyWeightTracker({ bodyWeightLog = [], onLog }) {
  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState('lbs')
  const [expanded, setExpanded] = useState(false)

  const last30 = useMemo(() => {
    const cutoff = new Date(Date.now() - 30 * 86_400_000).toISOString().split('T')[0]
    return [...bodyWeightLog].filter(e => e.date >= cutoff).sort((a, b) => a.date.localeCompare(b.date))
  }, [bodyWeightLog])

  const latest = bodyWeightLog[0]
  const prev = bodyWeightLog[1]
  const trend = latest && prev
    ? latest.weight - prev.weight
    : null

  const chartPoints = last30.map((e, i) => ({ x: i, y: e.weight }))

  const handleLog = (e) => {
    e.preventDefault()
    const w = parseFloat(weight)
    if (!w || w <= 0) return
    onLog(w, unit)
    setWeight('')
  }

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-2xl overflow-hidden backdrop-blur-xl">
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-slate-800/30 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <Scale className="text-cyan-400" size={20} />
          <div className="text-left">
            <h3 className="font-black text-slate-200 text-sm uppercase tracking-widest">Body Weight</h3>
            {latest ? (
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                {latest.weight} {latest.unit}
                {trend !== null && trend !== 0 && (
                  <span className={`flex items-center gap-0.5 ${trend < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {trend < 0 ? <TrendingDown size={9} /> : <TrendingUp size={9} />}
                    {Math.abs(trend).toFixed(1)}
                  </span>
                )}
                {trend === 0 && <span className="text-slate-600 flex items-center gap-0.5"><Minus size={9} /> stable</span>}
              </p>
            ) : (
              <p className="text-[10px] text-slate-500">No entries yet</p>
            )}
          </div>
        </div>
        <span className="text-slate-500 text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 pb-5 space-y-4"
        >
          {/* Sparkline chart */}
          {chartPoints.length >= 2 && (
            <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Last 30 Days</p>
              <svg viewBox={`0 0 ${CHART_W} ${CHART_HEIGHT}`} className="w-full" style={{ height: CHART_HEIGHT }}>
                {/* Area fill */}
                <defs>
                  <linearGradient id="bwGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                <path
                  d={sparkPath(chartPoints) + ` L ${((chartPoints.length - 1) / Math.max(chartPoints.length - 1, 1)) * (CHART_W - 20) + 10} ${CHART_HEIGHT} L 10 ${CHART_HEIGHT} Z`}
                  fill="url(#bwGrad)"
                />
                <path d={sparkPath(chartPoints)} fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
                {/* Latest dot */}
                {(() => {
                  const last = chartPoints[chartPoints.length - 1]
                  const minX = 0, maxX = chartPoints.length - 1 || 1
                  const ys = chartPoints.map(p => p.y)
                  const minY = Math.min(...ys), maxY = Math.max(...ys), rangeY = maxY - minY || 1
                  const nx = x => ((x - minX) / (maxX - minX)) * (CHART_W - 20) + 10
                  const ny = y => CHART_HEIGHT - ((y - minY) / rangeY) * (CHART_HEIGHT - 16) - 8
                  return <circle cx={nx(last.x)} cy={ny(last.y)} r="3" fill="#22d3ee" />
                })()}
              </svg>
              {/* Min / max labels */}
              <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                <span>{last30[0]?.date}</span>
                <span>{last30[last30.length - 1]?.date}</span>
              </div>
            </div>
          )}

          {/* Log form */}
          <form onSubmit={handleLog} className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Today's Weight</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder={`e.g. 185`}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Unit</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500 outline-none"
              >
                <option value="lbs">lbs</option>
                <option value="kg">kg</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={!weight}
              className="px-4 py-2.5 bg-cyan-700 hover:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-600 text-white text-sm font-black rounded-lg transition-colors"
            >
              Log
            </button>
          </form>

          {/* Recent entries */}
          {bodyWeightLog.length > 0 && (
            <div className="space-y-1">
              {bodyWeightLog.slice(0, 7).map(e => (
                <div key={e.date} className="flex justify-between text-xs text-slate-500 border-b border-slate-800/50 pb-1">
                  <span>{e.date}</span>
                  <span className="font-mono text-slate-300">{e.weight} {e.unit}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
