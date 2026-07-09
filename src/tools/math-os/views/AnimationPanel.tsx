// ─── Animation Panel ─────────────────────────────────────────────────────────
// Pick a platform variable, set a range, hit play.
// Each frame updates the variable → DependencyEngine propagates → all views update.

import { useState, useEffect, useRef } from 'react'
import { objectsByKind } from '../core/MathDocument'
import type { Variable } from '../core/MathDocument'
import type { UseMathDocumentReturn } from '../hooks/useMathDocument'

interface Props {
  bridge: UseMathDocumentReturn
  ui: Record<string, string>
}

export default function AnimationPanel({ bridge, ui }: Props) {
  const { doc, tick, setVariable } = bridge
  void tick

  const vars = objectsByKind<Variable>(doc, 'variable')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [min, setMin]   = useState(0)
  const [max, setMax]   = useState(10)
  const [fps, setFps]   = useState(30)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)

  const rafRef  = useRef<number | null>(null)
  const lastRef = useRef<number>(0)
  const stateRef = useRef({ min, max, fps, selectedId, current, playing })

  // Keep ref in sync so the RAF loop sees current values
  useEffect(() => {
    stateRef.current = { min, max, fps, selectedId, current, playing }
  })

  // Auto-select first variable when doc gets one
  useEffect(() => {
    if (!selectedId && vars.length > 0) setSelectedId(vars[0].id)
  }, [vars.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // RAF loop
  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    const loop = (ts: number) => {
      const { min: lo, max: hi, fps: rate, selectedId: id } = stateRef.current
      const interval = 1000 / rate

      if (ts - lastRef.current >= interval) {
        lastRef.current = ts
        const step = (hi - lo) / (rate * 3)  // 3 second cycle
        setCurrent(prev => {
          const next = prev + step > hi ? lo : prev + step
          if (id) setVariable(id, next)
          return next
        })
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [playing]) // eslint-disable-line react-hooks/exhaustive-deps

  function stop() {
    setPlaying(false)
    setCurrent(min)
    if (selectedId) setVariable(selectedId, min)
  }

  const progress = max === min ? 0 : (current - min) / (max - min)
  const selected = vars.find(v => v.id === selectedId)

  if (vars.length === 0) {
    return (
      <div className={`rounded-xl border ${ui.border} ${ui.bg1} p-6 text-center`}>
        <div className="text-xs text-slate-500">Add variables in the left panel to animate them.</div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border ${ui.border} ${ui.bg1} overflow-hidden flex flex-col gap-0`}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200/20 dark:border-white/5 shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Animate</span>
        {playing && <span className="text-[10px] text-brand-400 font-mono animate-pulse">● live</span>}
      </div>

      {/* Variable picker */}
      <div className="px-4 py-3 border-b border-slate-200/10 dark:border-white/5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">Variable</div>
        <div className="flex flex-wrap gap-1.5">
          {vars.map(v => (
            <button
              type="button"
              key={v.id}
              onClick={() => { setSelectedId(v.id); setCurrent(min) }}
              className={`text-xs font-mono px-2.5 py-1 rounded-lg border transition-all ${selectedId === v.id ? 'bg-brand-500/20 text-brand-300 border-brand-500/30' : 'bg-white/5 text-slate-400 border-white/10 hover:border-brand-500/20 hover:text-brand-400'}`}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>

      {/* Range controls */}
      <div className="px-4 py-3 border-b border-slate-200/10 dark:border-white/5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">Range</div>
        <div className="flex items-center gap-3 text-xs">
          {([['min', min, setMin], ['max', max, setMax]] as const).map(([label, val, set]) => (
            <label key={label} className="flex items-center gap-1.5">
              <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">{label}</span>
              <input
                type="number"
                value={val}
                onChange={e => set(parseFloat(e.target.value) || 0)}
                className={`w-16 text-center text-xs font-mono py-1 rounded-lg ${ui.bg2} border ${ui.border} text-slate-800 dark:text-slate-100 focus:border-brand-400 focus:outline-none`}
              />
            </label>
          ))}
          <label className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">fps</span>
            <input
              type="number"
              value={fps}
              min={1}
              max={60}
              onChange={e => setFps(Math.max(1, Math.min(60, parseInt(e.target.value) || 30)))}
              className={`w-12 text-center text-xs font-mono py-1 rounded-lg ${ui.bg2} border ${ui.border} text-slate-800 dark:text-slate-100 focus:border-brand-400 focus:outline-none`}
            />
          </label>
        </div>
      </div>

      {/* Playback controls */}
      <div className="px-4 py-3">
        {selected && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono text-brand-400 font-bold">{selected.name}</span>
            <span className="text-slate-600">=</span>
            <span className="text-xs font-mono text-emerald-400 font-bold w-20">{current.toPrecision(5).replace(/\.?0+$/, '')}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-none"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPlaying(p => !p)}
            disabled={!selectedId}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${playing ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30' : 'bg-brand-500/15 text-brand-400 border border-brand-500/20 hover:bg-brand-500/25'} disabled:opacity-40`}
          >
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            type="button"
            onClick={stop}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 transition-colors"
          >
            ⏹ Reset
          </button>
          <input
            type="range"
            min={min}
            max={max}
            step={(max - min) / 200}
            value={current}
            aria-label="Animation scrubber"
            onChange={e => {
              const v = parseFloat(e.target.value)
              setCurrent(v)
              if (selectedId) setVariable(selectedId, v)
            }}
            className="flex-1 h-1 accent-brand-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
