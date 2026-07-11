/**
 * LessonDebugPanel — three-tab debug panel for the lesson engine.
 *
 * Tabs:
 *   Variables — scalars + expandable arrays/objects, changed vars highlighted
 *   Heap      — HeapGraph from CodeLens (arrays as cell grids, linked lists
 *               as chains, pair trees as tree diagrams — auto-detected)
 *   Stack     — call frames with depth + active indicator
 *
 * Step controls are NOT here — they belong in the code editor header.
 * All non-heap colors come from the `ui` UiTheme prop.
 * HeapGraph uses useCodeLensTheme() internally (reads from global theme).
 */
import { useState, useMemo } from 'react'
import type { UiTheme } from './types'
import type { TraceEvent, HeapSnapshot, StackFrame } from '../../labs/codelens/codelens/types'
import HeapGraph from '../../labs/codelens/codelens/renderer/HeapGraph'

interface Props {
  events: TraceEvent[]
  step: number
  heap: HeapSnapshot | null
  ui: UiTheme
}

// ── Value helpers ──────────────────────────────────────────────────────────────

function isRef(v: unknown): v is { $ref: number } {
  return v !== null && typeof v === 'object' && '$ref' in (v as object)
}

function fmtScalar(v: unknown): string {
  if (v === null || v === undefined) return String(v)
  if (typeof v === 'boolean' || typeof v === 'number') return String(v)
  if (typeof v === 'string') {
    const s = v.length > 32 ? v.slice(0, 32) + '…' : v
    return `"${s}"`
  }
  if (isRef(v)) return `→ ref #${(v as { $ref: number }).$ref}`
  return JSON.stringify(v)
}

function getHeapLabel(v: unknown, heap: HeapSnapshot | null): string {
  if (!isRef(v) || !heap) return fmtScalar(v)
  const obj = heap.objects.get((v as { $ref: number }).$ref)
  if (!obj) return fmtScalar(v)
  if (obj.type === 'Array') {
    const len = obj.properties.get('length') ?? '?'
    return `[ … ] (${len} items)`
  }
  const keys = [...obj.properties.keys()].filter(k => k !== '__proto__' && k !== '__mapData__')
  return `{ ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? ', …' : ''} }`
}

type VarKind = 'number' | 'string' | 'boolean' | 'null' | 'array' | 'object' | 'other'

function getKind(v: unknown, heap: HeapSnapshot | null): VarKind {
  if (v === null || v === undefined) return 'null'
  if (typeof v === 'boolean') return 'boolean'
  if (typeof v === 'number') return 'number'
  if (typeof v === 'string') return 'string'
  if (isRef(v) && heap) {
    const obj = heap.objects.get((v as { $ref: number }).$ref)
    return obj?.type === 'Array' ? 'array' : 'object'
  }
  return 'other'
}

const KIND_STYLE: Record<VarKind, string> = {
  number:  'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
  string:  'text-amber-400   bg-amber-400/10   border-amber-400/25',
  boolean: 'text-pink-400    bg-pink-400/10    border-pink-400/25',
  null:    'text-slate-400   bg-slate-400/10   border-slate-400/25',
  array:   'text-cyan-400    bg-cyan-400/10    border-cyan-400/25',
  object:  'text-purple-400  bg-purple-400/10  border-purple-400/25',
  other:   'text-slate-400   bg-slate-400/10   border-slate-400/25',
}

const KIND_LABEL: Record<VarKind, string> = {
  number: 'num', string: 'str', boolean: 'bool',
  null: 'null', array: '[ ]', object: '{ }', other: '?',
}

// ── Inline array/object expander inside Variables tab ─────────────────────────

function HeapExpander({ refId, heap, ui }: { refId: number; heap: HeapSnapshot | null; ui: UiTheme }) {
  const obj = heap?.objects.get(refId)
  if (!obj) return (
    <div className={`ml-5 mr-2 pl-3 py-1 text-[11px] font-mono ${ui.txt2} italic border-l-2 border-slate-500/20`}>
      ref #{refId} (freed or not yet created)
    </div>
  )

  if (obj.type === 'Array') {
    const len = parseInt(String(obj.properties.get('length') ?? 0), 10)
    const elems: unknown[] = []
    for (const [k, v] of obj.properties) {
      const idx = parseInt(k, 10)
      if (!isNaN(idx) && idx < len) elems[idx] = v
    }
    return (
      <div className="ml-5 mr-2 mb-1 border-l-2 border-cyan-500/30 rounded-r-sm">
        {elems.length === 0
          ? <div className={`px-3 py-1 text-[11px] font-mono ${ui.txt2} italic`}>empty</div>
          : elems.map((v, i) => (
            <div key={i} className={`flex items-baseline gap-2 px-3 py-[3px] text-[12px] font-mono hover:bg-brand-500/5`}>
              <span className={`${ui.txt2} opacity-50 w-6 text-right shrink-0`}>[{i}]</span>
              <span className="text-cyan-400">{fmtScalar(v)}</span>
            </div>
          ))}
      </div>
    )
  }

  const entries = [...obj.properties].filter(([k]) => k !== '__proto__' && k !== '__mapData__')
  return (
    <div className="ml-5 mr-2 mb-1 border-l-2 border-purple-500/30 rounded-r-sm">
      {entries.length === 0
        ? <div className={`px-3 py-1 text-[11px] font-mono ${ui.txt2} italic`}>empty</div>
        : entries.map(([k, v]) => (
          <div key={k} className={`flex items-baseline gap-2 px-3 py-[3px] text-[12px] font-mono hover:bg-brand-500/5`}>
            <span className="text-purple-400 shrink-0">{k}:</span>
            <span className={ui.txt1}>{fmtScalar(v)}</span>
          </div>
        ))}
    </div>
  )
}

// ── VarRow ────────────────────────────────────────────────────────────────────

function VarRow({ name, value, changed, heap, ui }: {
  name: string; value: unknown; changed: boolean; heap: HeapSnapshot | null; ui: UiTheme
}) {
  const [expanded, setExpanded] = useState(false)
  const kind = getKind(value, heap)
  const expandable = kind === 'array' || kind === 'object'
  const refId = isRef(value) ? (value as { $ref: number }).$ref : null

  return (
    <div>
      <div
        onClick={expandable ? () => setExpanded(e => !e) : undefined}
        className={[
          'flex items-center gap-2 px-3 py-[5px] text-[12.5px] font-mono border-l-2 transition-colors',
          changed ? 'bg-amber-500/[0.06] border-amber-500' : 'border-transparent',
          expandable ? 'cursor-pointer hover:bg-brand-500/5' : '',
        ].join(' ')}
      >
        <span className={`text-[9px] w-3 shrink-0 ${ui.txt2} opacity-40 ${!expandable ? 'invisible' : ''}`}>
          {expanded ? '▼' : '▶'}
        </span>
        <span className={`shrink-0 min-w-[80px] truncate ${changed ? 'text-amber-400 font-semibold' : 'text-cyan-400'}`}>
          {name}
        </span>
        <span className={`flex-1 min-w-0 truncate ${changed ? 'text-amber-300 font-semibold' : ui.txt1}`}>
          {getHeapLabel(value, heap)}
        </span>
        <span className={`shrink-0 text-[9px] px-1.5 py-px rounded border font-mono ${KIND_STYLE[kind]}`}>
          {KIND_LABEL[kind]}
        </span>
      </div>
      {expandable && expanded && refId !== null && (
        <HeapExpander refId={refId} heap={heap} ui={ui} />
      )}
    </div>
  )
}

// ── Diff builder ──────────────────────────────────────────────────────────────

function getChangedVars(frames: StackFrame[], prevFrames: StackFrame[]): Set<string> {
  const changed = new Set<string>()
  frames.forEach((frame, fi) => {
    const prev = prevFrames[fi]
    for (const [name, val] of Object.entries(frame.locals ?? {})) {
      if (JSON.stringify(val) !== JSON.stringify(prev?.locals?.[name])) {
        changed.add(name)
      }
    }
  })
  return changed
}

// ── Event-type label ──────────────────────────────────────────────────────────

const EVENT_META: Record<string, { label: string; color: string }> = {
  assign:          { label: 'assign',    color: 'text-amber-400' },
  call:            { label: 'fn call',   color: 'text-sky-400' },
  function_call:   { label: 'fn call',   color: 'text-sky-400' },
  return:          { label: 'return',    color: 'text-purple-400' },
  function_return: { label: 'return',    color: 'text-purple-400' },
  loop_iteration:  { label: 'loop',      color: 'text-emerald-400' },
  branch:          { label: 'branch',    color: 'text-pink-400' },
  function_enter:  { label: 'fn enter',  color: 'text-sky-400' },
  function_exit:   { label: 'fn exit',   color: 'text-purple-400' },
  error:           { label: 'error',     color: 'text-red-400' },
  expression:      { label: 'expr',      color: 'text-slate-400' },
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ text, count, ui }: { text: string; count?: number; ui: UiTheme }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1 border-b ${ui.border} ${ui.bg1} sticky top-0 z-10`}>
      <span className={`text-[9px] font-bold uppercase tracking-[0.12em] ${ui.txt2}`}>{text}</span>
      {count !== undefined && (
        <span className={`text-[9px] px-1.5 py-px rounded-full ${ui.bg2} ${ui.txt2} font-mono`}>{count}</span>
      )}
    </div>
  )
}

// ── Tab button ────────────────────────────────────────────────────────────────

function TabBtn({ id, active, label, onClick, ui }: {
  id: string; active: boolean; label: string; onClick: () => void; ui: UiTheme
}) {
  return (
    <button
      key={id}
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 text-[11px] font-semibold border-b-2 bg-transparent cursor-pointer shrink-0 transition-colors ${
        active
          ? 'border-brand-500 text-brand-500'
          : `border-transparent ${ui.txt2} hover:text-brand-500`
      }`}
    >
      {label}
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

type DebugTab = 'vars' | 'heap' | 'stack'

export default function LessonDebugPanel({ events, step, heap, ui }: Props) {
  const [tab, setTab] = useState<DebugTab>('vars')

  const currentEvent = events[step] ?? null
  const prevEvent    = events[step - 1] ?? null

  const frames = useMemo(
    () => [...(currentEvent?.stackSnapshot ?? [])].reverse(),
    [currentEvent]
  )
  const prevFrames = useMemo(
    () => [...(prevEvent?.stackSnapshot ?? [])].reverse(),
    [prevEvent]
  )

  const changedVars = useMemo(() => getChangedVars(frames, prevFrames), [frames, prevFrames])

  // All locals, innermost frame wins. Skip function bindings in global scope.
  const allLocals = useMemo(() => {
    const seen = new Set<string>()
    const out: { name: string; value: unknown; changed: boolean }[] = []
    for (const frame of frames) {
      for (const [name, value] of Object.entries(frame.locals ?? {})) {
        if (seen.has(name)) continue
        seen.add(name)
        if (frame.name === '__global__' && typeof value === 'string' && value.startsWith('[Function')) continue
        out.push({ name, value, changed: changedVars.has(name) })
      }
    }
    return out
  }, [frames, changedVars])

  const fnFrames = frames.filter(f => f.name !== '__global__')

  // Empty state — no trace yet
  if (!currentEvent) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center text-center px-8 gap-3 ${ui.txt2}`}>
        <div className="text-4xl opacity-20">⬡</div>
        <p className="text-sm leading-relaxed max-w-[200px]">
          Enable <span className="font-semibold text-brand-500">Debug</span> on a code cell and run it to inspect variables, heap, and call stack.
        </p>
      </div>
    )
  }

  // Event type strip at top
  const eventMeta = EVENT_META[currentEvent.type] ?? { label: currentEvent.type, color: 'text-slate-400' }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

      {/* Event info strip */}
      <div className={`flex items-center gap-3 px-3 py-1.5 border-b ${ui.border} ${ui.bg1} shrink-0`}>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${eventMeta.color}`}>
          {eventMeta.label}
        </span>
        {(() => {
          const ln = currentEvent?.line ?? currentEvent?.sourceLocation?.line
          return ln != null ? (
            <span className={`text-[10px] font-mono ${ui.txt2} opacity-60`}>line {ln}</span>
          ) : null
        })()}
        <span className={`ml-auto text-[10px] tabular-nums font-semibold ${ui.txt2}`}>
          {step + 1} / {events.length}
        </span>
      </div>

      {/* Tab bar */}
      <div className={`flex border-b ${ui.border} ${ui.bg1} shrink-0`}>
        <TabBtn id="vars"  active={tab === 'vars'}  label={`Variables (${allLocals.length})`}  onClick={() => setTab('vars')}  ui={ui} />
        <TabBtn id="heap"  active={tab === 'heap'}  label="Heap"                                onClick={() => setTab('heap')}  ui={ui} />
        <TabBtn id="stack" active={tab === 'stack'} label={`Stack (${fnFrames.length})`}        onClick={() => setTab('stack')} ui={ui} />
      </div>

      {/* ── Variables ── */}
      {tab === 'vars' && (
        <div className="flex-1 overflow-y-auto">
          {allLocals.length === 0 ? (
            <div className={`px-4 py-6 text-sm font-mono ${ui.txt2} italic`}>No local variables yet.</div>
          ) : (
            <>
              {changedVars.size > 0 && (
                <>
                  <SectionLabel text="Changed this step" count={changedVars.size} ui={ui} />
                  {allLocals.filter(v => v.changed).map(v => (
                    <VarRow key={v.name} {...v} heap={heap} ui={ui} />
                  ))}
                </>
              )}
              <SectionLabel text="All locals" count={allLocals.length} ui={ui} />
              {allLocals.map(v => (
                <VarRow key={v.name} {...v} heap={heap} ui={ui} />
              ))}
            </>
          )}
        </div>
      )}

      {/* ── Heap ── HeapGraph handles array cells, linked-list chains, pair trees */}
      {tab === 'heap' && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <HeapGraph
            snapshot={heap}
            heapDelta={currentEvent?.heapDelta}
          />
        </div>
      )}

      {/* ── Stack ── */}
      {tab === 'stack' && (
        <div className="flex-1 overflow-y-auto">
          {fnFrames.length === 0 ? (
            <div className={`px-4 py-6 text-sm font-mono ${ui.txt2} italic`}>
              No function calls active — running in global scope.
            </div>
          ) : (
            <>
              <SectionLabel text="Call stack" ui={ui} />
              {fnFrames.map((frame, i) => {
                const isTop = i === 0
                const depth = fnFrames.length - 1 - i
                const name = frame.name === '__global__' ? '(global)' : (frame.name ?? '(anonymous)')
                return (
                  <div
                    key={i}
                    className={[
                      'flex items-center gap-2 px-3 py-[6px] text-[12px] font-mono border-l-2 transition-colors',
                      isTop
                        ? 'bg-brand-500/[0.07] border-brand-500'
                        : `border-transparent ${ui.txt2}`,
                    ].join(' ')}
                  >
                    <span className={`shrink-0 text-[9px] tabular-nums ${isTop ? 'text-brand-400' : `${ui.txt2} opacity-40`}`}>
                      #{depth}
                    </span>
                    <span className={`flex-1 truncate ${isTop ? 'text-brand-300 font-semibold' : ui.txt2}`}>
                      {name}
                    </span>
                    {frame.line && (
                      <span className={`shrink-0 text-[10px] ${isTop ? 'text-brand-400/60' : `${ui.txt2} opacity-30`}`}>
                        L{frame.line}
                      </span>
                    )}
                    {isTop && (
                      <span className="shrink-0 text-[9px] px-1.5 py-px rounded bg-brand-500/20 text-brand-400 border border-brand-500/25 font-mono">
                        active
                      </span>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

    </div>
  )
}
