// ─── Timeline Panel ───────────────────────────────────────────────────────────
// Every computation emits a step log (compute:done event).
// This panel captures that log and replays it so students can see
// the chain of mathematical consequences — not just the final answer.

import { useState, useEffect, useRef } from 'react'
import { bus } from '../core/EventBus'
import { splitPropKey } from '../core/MathDocument'
import type { MathDocument } from '../core/MathDocument'

interface Step {
  key: string
  value: unknown
  ts: number
}

interface Snapshot {
  trigger: string
  steps: Step[]
  ts: number
}

function formatVal(v: unknown): string {
  if (v === undefined || v === null) return '—'
  if (typeof v === 'number') return isFinite(v) ? v.toPrecision(5).replace(/\.?0+$/, '') : String(v)
  if (Array.isArray(v)) {
    if (Array.isArray(v[0])) return `[${(v as unknown[][]).length}×${(v[0] as unknown[]).length}]`
    return `[${(v as unknown[]).slice(0, 4).join(', ')}${(v as unknown[]).length > 4 ? '…' : ''}]`
  }
  return String(v).slice(0, 40)
}

function kindOf(key: string): string {
  // Guess kind from property name for color
  const { property } = splitPropKey(key)
  if (['value'].includes(property)) return 'variable'
  if (['area','perimeter','circumradius','inradius'].includes(property)) return 'geometry'
  if (['determinant','trace','rank','eigenvalues'].includes(property)) return 'matrix'
  if (['mean','variance','stddev','median'].includes(property)) return 'statistics'
  return 'default'
}

const KIND_BADGE: Record<string, string> = {
  variable:   'bg-brand-500/20 text-brand-300',
  geometry:   'bg-amber-500/20 text-amber-300',
  matrix:     'bg-emerald-500/20 text-emerald-300',
  statistics: 'bg-orange-500/20 text-orange-300',
  default:    'bg-slate-500/20 text-slate-300',
}

interface Props {
  doc: MathDocument
  ui: Record<string, string>
}

export default function TimelinePanel({ doc, ui }: Props) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [selected, setSelected]   = useState<number | null>(null)
  const [frame, setFrame]         = useState<number>(0)
  const [playing, setPlaying]     = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const offStart = bus.on('compute:start', (e) => {
      if (e.docId !== doc.meta.id) return
      setSnapshots(prev => {
        const snap: Snapshot = { trigger: e.trigger, steps: [], ts: Date.now() }
        const next = [snap, ...prev].slice(0, 20) // keep last 20
        setSelected(0)
        setFrame(0)
        return next
      })
    })
    const offStep = bus.on('compute:step', (e) => {
      if (e.docId !== doc.meta.id) return
      setSnapshots(prev => {
        if (!prev.length) return prev
        const [head, ...tail] = prev
        return [{ ...head, steps: [...head.steps, { key: e.key, value: e.value, ts: Date.now() }] }, ...tail]
      })
    })
    return () => { offStart(); offStep() }
  }, [doc.meta.id])

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (!playing || selected === null) return
    const snap = snapshots[selected]
    if (!snap) return
    intervalRef.current = setInterval(() => {
      setFrame(f => {
        if (f >= snap.steps.length) { setPlaying(false); return f }
        return f + 1
      })
    }, 280)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing, selected, snapshots])

  const snap = selected !== null ? snapshots[selected] : null
  const visibleSteps = snap ? snap.steps.slice(0, playing ? frame : snap.steps.length) : []

  return (
    <div className={`rounded-xl border ${ui.border} ${ui.bg1} overflow-hidden flex flex-col`}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200/20 dark:border-white/5 shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Timeline</span>
        <span className="text-[10px] text-slate-600">{snapshots.length} computations</span>
      </div>

      {snapshots.length === 0 && (
        <div className="p-6 text-center text-xs text-slate-600">
          Change a variable to see the propagation chain.
        </div>
      )}

      {snapshots.length > 0 && (
        <div className="flex flex-1 overflow-hidden" style={{ minHeight: 180 }}>
          {/* Snapshot list */}
          <div className={`w-36 shrink-0 border-r border-slate-200/10 dark:border-white/5 overflow-y-auto ${ui.bg0}`}>
            {snapshots.map((s, i) => {
              const { property } = splitPropKey(s.trigger)
              return (
                <button
                  type="button"
                  key={s.ts}
                  onClick={() => { setSelected(i); setFrame(s.steps.length); setPlaying(false) }}
                  className={`w-full text-left px-3 py-2 border-b border-slate-200/5 dark:border-white/5 transition-colors ${selected === i ? 'bg-brand-500/10 border-l-2 border-l-brand-500' : 'hover:bg-white/5'}`}
                >
                  <div className="text-[10px] font-mono text-brand-400 truncate">{property}</div>
                  <div className="text-[9px] text-slate-600">{s.steps.length} steps</div>
                </button>
              )
            })}
          </div>

          {/* Step detail */}
          {snap && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Playback controls */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200/10 dark:border-white/5 shrink-0">
                <button
                  type="button"
                  onClick={() => { setFrame(0); setPlaying(true) }}
                  className="text-[10px] px-2 py-0.5 rounded bg-brand-500/15 hover:bg-brand-500/25 text-brand-400 font-bold transition-colors"
                >▶ Replay</button>
                <button
                  type="button"
                  onClick={() => setFrame(snap.steps.length)}
                  className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
                >⏭ End</button>
                <input
                  type="range"
                  min={0}
                  max={snap.steps.length}
                  value={frame}
                  aria-label="Timeline scrubber"
                  onChange={e => { setFrame(parseInt(e.target.value)); setPlaying(false) }}
                  className="flex-1 h-1 accent-brand-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 font-mono shrink-0">{Math.min(frame, snap.steps.length)}/{snap.steps.length}</span>
              </div>

              {/* Steps */}
              <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
                {/* Trigger */}
                <div className="flex items-center gap-2 text-[11px] font-mono pb-1.5 mb-1 border-b border-slate-200/10 dark:border-white/5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">trigger</span>
                  <span className="text-brand-400 font-bold">{splitPropKey(snap.trigger).property}</span>
                  <span className="text-slate-600">changed</span>
                </div>
                {visibleSteps.map((step, i) => {
                  const { objectId, property } = splitPropKey(step.key)
                  const kind = kindOf(step.key)
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-[11px] font-mono rounded-lg px-2 py-1 transition-all ${i === visibleSteps.length - 1 && playing ? 'bg-brand-500/10 scale-[1.01]' : 'bg-white/3 dark:bg-white/3'}`}
                    >
                      <span className="text-[9px] text-slate-600 w-4 text-right">{i + 1}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${KIND_BADGE[kind]}`}>{kind.slice(0,3)}</span>
                      <span className="text-slate-500 truncate w-20">{objectId.split('_')[0]}</span>
                      <span className="text-slate-400">.</span>
                      <span className="text-sky-400 font-semibold">{property}</span>
                      <span className="text-slate-600 ml-auto">→</span>
                      <span className="text-emerald-400 font-bold">{formatVal(step.value)}</span>
                    </div>
                  )
                })}
                {visibleSteps.length === 0 && !playing && (
                  <div className="text-xs text-slate-600 text-center py-4">Press ▶ Replay to animate.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
