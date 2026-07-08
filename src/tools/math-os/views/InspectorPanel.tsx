// ─── Inspector Panel ──────────────────────────────────────────────────────────
// Click any object → see its id, kind, all computed properties,
// its place in the dependency graph, and current values.

import { useState } from 'react'
import type { MathObject, ObjectId } from '../core/MathDocument'
import { splitPropKey } from '../core/MathDocument'
import type { UseMathDocumentReturn } from '../hooks/useMathDocument'
import { platform as defaultPlatform } from '../core/MathOSPlatform'

const KIND_COLOR: Record<string, string> = {
  variable:   'text-brand-400 bg-brand-500/10 border-brand-500/20',
  expression: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  function:   'text-violet-400 bg-violet-500/10 border-violet-500/20',
  matrix:     'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  vector:     'text-teal-400 bg-teal-500/10 border-teal-500/20',
  triangle:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
  polynomial: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  dataset:    'text-orange-400 bg-orange-500/10 border-orange-500/20',
  equation:   'text-red-400 bg-red-500/10 border-red-500/20',
}

function formatValue(v: unknown): string {
  if (v === undefined || v === null) return '—'
  if (typeof v === 'number') return isFinite(v) ? v.toPrecision(6).replace(/\.?0+$/, '') : String(v)
  if (Array.isArray(v)) {
    if (Array.isArray(v[0])) return `[${(v as number[][]).length}×${(v[0] as number[]).length} matrix]`
    return `[${(v as number[]).map(x => typeof x === 'number' ? x.toPrecision(4) : x).join(', ')}]`
  }
  if (typeof v === 'object') return JSON.stringify(v, null, 1).slice(0, 80)
  return String(v)
}

interface Props {
  bridge: UseMathDocumentReturn
  ui: Record<string, string>
}

export default function InspectorPanel({ bridge, ui }: Props) {
  const { doc, tick, getProp } = bridge
  const [selected, setSelected] = useState<ObjectId | null>(null)
  void tick

  const objects = [...doc.objects.values()]
  const obj = selected ? doc.objects.get(selected) : null

  // Get all computed keys for this object from the dependency engine
  const depEngine = defaultPlatform.dep
  const allKeys = obj ? depEngine.allKeys().filter(k => k.startsWith(`${obj.id}.`)) : []

  return (
    <div className={`rounded-xl border ${ui.border} ${ui.bg1} overflow-hidden flex flex-col`} style={{ minHeight: 200 }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200/20 dark:border-white/5 shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Inspector</span>
        {selected && (
          <button type="button" onClick={() => setSelected(null)} className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">✕ clear</button>
        )}
      </div>

      {/* Object list */}
      {!selected && (
        <div className="p-3 flex flex-wrap gap-1.5 overflow-y-auto">
          {objects.length === 0 && <span className="text-xs text-slate-500 p-2">No objects in document.</span>}
          {objects.map(o => (
            <button
              type="button"
              key={o.id}
              onClick={() => setSelected(o.id)}
              className={`text-xs font-mono px-2.5 py-1 rounded-lg border transition-all hover:-translate-y-0.5 ${KIND_COLOR[o.kind] ?? 'text-slate-400 bg-white/5 border-white/10'}`}
            >
              {objectLabel(o)}
            </button>
          ))}
        </div>
      )}

      {/* Detail view */}
      {selected && obj && (
        <div className="overflow-y-auto flex-1">
          {/* Header */}
          <div className={`px-4 py-3 border-b border-slate-200/10 dark:border-white/5 flex items-center gap-3`}>
            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${KIND_COLOR[obj.kind] ?? ''}`}>{obj.kind}</span>
            <span className="text-sm font-mono font-bold text-slate-200">{objectLabel(obj)}</span>
            <span className="text-[10px] text-slate-600 font-mono ml-auto">{obj.id}</span>
          </div>

          {/* Raw fields */}
          <div className="px-4 py-3 border-b border-slate-200/10 dark:border-white/5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">Fields</div>
            <div className="space-y-1">
              {Object.entries(obj)
                .filter(([k]) => k !== 'id' && k !== 'kind')
                .map(([k, v]) => (
                  <div key={k} className="flex items-start gap-3 text-xs font-mono">
                    <span className="text-slate-500 w-20 shrink-0">{k}</span>
                    <span className="text-slate-300 break-all">{formatValue(v)}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Computed properties */}
          {allKeys.length > 0 && (
            <div className="px-4 py-3 border-b border-slate-200/10 dark:border-white/5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">Computed</div>
              <div className="space-y-1">
                {allKeys.map(key => {
                  const { property } = splitPropKey(key)
                  const val = getProp(obj.id, property)
                  return (
                    <div key={key} className="flex items-start gap-3 text-xs font-mono">
                      <span className="text-emerald-600 w-24 shrink-0">{property}</span>
                      <span className="text-emerald-400 break-all">{formatValue(val)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Dependency graph */}
          <div className="px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">Dependencies</div>
            {allKeys.length === 0
              ? <span className="text-xs text-slate-600">No registered dependencies.</span>
              : allKeys.map(key => {
                  const { property } = splitPropKey(key)
                  const deps = depEngine.getDeps(key)
                  const dependents = depEngine.getDependents(key)
                  if (!deps.length && !dependents.length) return null
                  return (
                    <div key={key} className="mb-2 text-[11px] font-mono">
                      <span className="text-slate-400 font-semibold">{property}</span>
                      {deps.length > 0 && (
                        <div className="ml-3 text-slate-600">
                          reads: {deps.map(d => <span key={d} className="text-sky-600 mr-1">{d}</span>)}
                        </div>
                      )}
                      {dependents.length > 0 && (
                        <div className="ml-3 text-slate-600">
                          feeds: {dependents.map(d => <span key={d} className="text-amber-600 mr-1">{d}</span>)}
                        </div>
                      )}
                    </div>
                  )
                })
            }
          </div>
        </div>
      )}
    </div>
  )
}

function objectLabel(o: MathObject): string {
  if (o.kind === 'variable')   return `${(o as import('../core/MathDocument').Variable).name}`
  if (o.kind === 'function')   return `${(o as import('../core/MathDocument').MathFunction).name}(${(o as import('../core/MathDocument').MathFunction).param})`
  if (o.kind === 'triangle')   return (o as import('../core/MathDocument').MathTriangle).label ?? 'triangle'
  if (o.kind === 'matrix')     return (o as import('../core/MathDocument').MathMatrix).label ?? 'matrix'
  if (o.kind === 'vector')     return (o as import('../core/MathDocument').MathVector).label ?? 'vector'
  if (o.kind === 'dataset')    return (o as import('../core/MathDocument').MathDataset).label ?? 'dataset'
  if (o.kind === 'polynomial') return (o as import('../core/MathDocument').MathPolynomial).expression.slice(0, 20)
  if (o.kind === 'expression') return (o as import('../core/MathDocument').MathExpression).body.slice(0, 20)
  return o.kind
}
