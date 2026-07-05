/**
 * WatchWindow — floating draggable watch panel.
 * Add variable names to watch; each updates live as you step through code.
 * Renders based on type: primitives inline, arrays as cells, SICP pair-lists
 * as linked chains, SICP pair-trees as tree diagrams.
 */
import { useState, useRef, useCallback, useEffect } from 'react'
import { X, Plus, GripVertical, Eye } from 'lucide-react'
import type { HeapSnapshot, HeapObjectEntry, StackFrame, TraceEvent } from '../types'
import { useCodeLensTheme } from '../ThemeContext'
import type { CodeLensUiPalette } from '../theme'

// ── Sentinel for "variable not found in any scope frame" ──────────────────────
const MISSING = Symbol('missing')

// ── Value renderer (type-aware) ────────────────────────────────────────────────

function renderValue(value: unknown, snapshot: HeapSnapshot | null | undefined, ui: CodeLensUiPalette) {
  if (value === MISSING) {
    return (
      <span style={{ color: ui.textFaint, fontStyle: 'italic', fontSize: 11,
        fontFamily: 'JetBrains Mono, monospace' }}>
        not in scope
      </span>
    )
  }

  if (value === undefined) {
    return <span style={{ color: ui.textMuted, fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12 }}>undefined</span>
  }

  if (value === null) return <Primitive label="null" color={ui.textFaint} />
  if (typeof value === 'boolean') return <Primitive label={String(value)} color={ui.pink} />
  if (typeof value === 'number')  return <Primitive label={String(value)} color={ui.green} />
  if (typeof value === 'string' && !value.startsWith('['))
    return <Primitive label={`"${value}"`} color={ui.amber} />

  // Heap reference — render based on object type
  const rid = refId(value)
  if (rid === null) return <Primitive label={String(value)} color={ui.textDim} />

  const obj = snapshot?.objects?.get(rid)
  if (!obj) return <Primitive label={`#${rid}`} color={ui.accent} />

  if (obj.type === 'Array') {
    // Detect SICP list/tree or plain array
    const mode = detectArrayMode(obj, snapshot)
    if (mode === 'list')  return <WatchList rootId={rid} snapshot={snapshot} ui={ui} />
    if (mode === 'tree')  return <WatchTree rootId={rid} snapshot={snapshot} ui={ui} />
    return <WatchArray obj={obj} snapshot={snapshot} ui={ui} />
  }

  // Generic object — show key: value pairs
  return <WatchObject obj={obj} snapshot={snapshot} ui={ui} />
}

// ── Detection helpers ──────────────────────────────────────────────────────────

function isHeapRef(v: unknown): v is { $ref?: number; objectId?: number } {
  return v !== null && typeof v === 'object' && ('$ref' in v || 'objectId' in v)
}
function refId(v: unknown): number | null {
  if (!isHeapRef(v)) return null
  return v.$ref ?? v.objectId ?? null
}

function detectArrayMode(obj: HeapObjectEntry, snapshot: HeapSnapshot | null | undefined): 'plain' | 'list' | 'tree' {
  const len = parseInt(String(obj.properties.get('length') ?? 0), 10)
  if (len !== 2) return 'plain'

  const head = obj.properties.get('0')
  const tail  = obj.properties.get('1')
  const tailId = isHeapRef(tail) ? refId(tail) : null

  if (tailId === null && tail !== null) return 'plain'  // tail is not ref or null → plain

  // Walk the chain
  const visited = new Set([obj.id])
  let cur = tailId
  let isChain = tail === null || isHeapRef(tail)

  while (cur && !visited.has(cur)) {
    visited.add(cur)
    const node = snapshot?.objects?.get(cur)
    if (!node || node.type !== 'Array') { isChain = false; break }
    const nodeLen = parseInt(String(node.properties.get('length') ?? 0), 10)
    if (nodeLen !== 2) { isChain = false; break }

    const nodeTail = node.properties.get('1')
    const nodeHead = node.properties.get('0')

    // If head is also a pair → could be a tree
    const nodeHeadId = isHeapRef(nodeHead) ? refId(nodeHead) : null
    if (nodeHeadId !== null && snapshot?.objects?.get(nodeHeadId)?.type === 'Array') {
      return 'tree'
    }
    cur = isHeapRef(nodeTail) ? refId(nodeTail) : null
    if (nodeTail === null) break
  }

  // Also check: does the original head point to a pair? → tree
  const headId = isHeapRef(head) ? refId(head) : null
  if (headId !== null && snapshot?.objects?.get(headId)?.type === 'Array') return 'tree'

  return isChain ? 'list' : 'plain'
}

// ── Primitive ──────────────────────────────────────────────────────────────────

function Primitive({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
      color, fontWeight: 600 }}>{label}</span>
  )
}

// ── Expandable heap reference ──────────────────────────────────────────────────
// Renders "▶ Type #id" with a click-to-expand toggle. Used inside WatchObject
// and WatchArray so any nested reference can be drilled into inline.

interface ExpandableRefProps {
  id: number
  snapshot: HeapSnapshot | null | undefined
  depth: number
  ui: CodeLensUiPalette
}

function ExpandableRef({ id, snapshot, depth, ui }: ExpandableRefProps) {
  const [open, setOpen] = useState(false)
  const obj = snapshot?.objects?.get(id)

  if (!obj) {
    return (
      <span style={{ color: ui.accent, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
        #{id}
      </span>
    )
  }

  const len  = obj.type === 'Array' ? parseInt(String(obj.properties.get('length') ?? 0), 10) : null
  const label = obj.type === 'Array' ? `Array[${len}]` : obj.type

  return (
    <div>
      <span
        onClick={() => setOpen(o => !o)}
        style={{
          color: ui.accent, cursor: 'pointer', fontSize: 11,
          fontFamily: 'JetBrains Mono, monospace',
          display: 'inline-flex', alignItems: 'center', gap: 4,
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 9, color: ui.textFaint }}>{open ? '▼' : '▶'}</span>
        {label}
        <span style={{ color: ui.borderStrong, fontSize: 10 }}>#{id}</span>
      </span>

      {open && depth < 5 && (
        <div style={{
          marginLeft: 10, marginTop: 2,
          paddingLeft: 8, borderLeft: `1px solid ${ui.border}`,
        }}>
          {obj.type === 'Array'
            ? <WatchArray obj={obj} snapshot={snapshot} depth={depth + 1} ui={ui} />
            : <WatchObject obj={obj} snapshot={snapshot} depth={depth + 1} ui={ui} />
          }
        </div>
      )}
    </div>
  )
}

// ── Plain array → cell grid (primitives) or vertical list (refs) ───────────────

interface WatchArrayProps {
  obj: HeapObjectEntry
  snapshot: HeapSnapshot | null | undefined
  depth?: number
  ui: CodeLensUiPalette
}

function WatchArray({ obj, snapshot, depth = 0, ui }: WatchArrayProps) {
  const len = parseInt(String(obj.properties.get('length') ?? 0), 10)
  const elems: unknown[] = []
  for (let i = 0; i < len; i++) elems.push(obj.properties.get(String(i)))

  if (len === 0) return <Primitive label="[]" color={ui.cyan} />

  const hasRefs = elems.some(v => isHeapRef(v))

  // When any element is a reference, or we're nested inside another object,
  // use a vertical list so each element can be expanded.
  if (hasRefs || depth > 0) {
    return (
      <div style={{ marginTop: depth === 0 ? 4 : 2 }}>
        {elems.map((v, i) => {
          const rid = isHeapRef(v) ? refId(v) : null
          const color = v === null || v === undefined ? ui.textFaint
            : typeof v === 'number' ? ui.green
            : typeof v === 'string' ? ui.amber
            : typeof v === 'boolean' ? ui.pink : ui.accent
          return (
            <div key={i} style={{
              display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 2,
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            }}>
              <span style={{ fontSize: 9, color: ui.borderStrong, flexShrink: 0,
                minWidth: 22, textAlign: 'right', paddingTop: 1 }}>[{i}]</span>
              {rid !== null
                ? <ExpandableRef id={rid} snapshot={snapshot} depth={depth + 1} ui={ui} />
                : <span style={{ color }}>
                    {v === null ? 'null' : v === undefined ? 'undef' : String(v)}
                  </span>
              }
            </div>
          )
        })}
      </div>
    )
  }

  // Horizontal cell grid for flat primitive arrays
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
      {elems.map((v, i) => {
        const str = v === null ? 'null' : v === undefined ? 'undef' : String(v)
        const color = v === null || v === undefined ? ui.textFaint
          : typeof v === 'number' ? ui.green
          : typeof v === 'string' ? ui.amber : ui.accent
        return (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: ui.panelBg, border: `1px solid ${ui.border}`, borderRadius: 5,
            padding: '4px 8px', minWidth: 36,
          }}>
            <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700, color }}>{str}</span>
            <span style={{ fontSize: 8, color: ui.borderStrong,
              fontFamily: 'JetBrains Mono, monospace' }}>{i}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── SICP list → horizontal chain ───────────────────────────────────────────────

function WatchList({ rootId, snapshot, ui }: { rootId: number; snapshot: HeapSnapshot | null | undefined; ui: CodeLensUiPalette }) {
  const nodes: { head: unknown; tail: unknown }[] = []
  const visited = new Set<number>()
  let cur: number | null = rootId

  while (cur && !visited.has(cur)) {
    visited.add(cur)
    const obj: HeapObjectEntry | undefined = snapshot?.objects?.get(cur)
    if (!obj) break
    const head: unknown = obj.properties.get('0')
    const tail: unknown = obj.properties.get('1')
    nodes.push({ head, tail })
    cur = isHeapRef(tail) ? refId(tail) : null
    if (tail === null) break
  }

  const fmt = (v: unknown) => v === null ? 'nil'
    : isHeapRef(v) ? `#${refId(v)}`
    : typeof v === 'number' ? String(v)
    : typeof v === 'string' ? v : String(v)

  const fmtColor = (v: unknown) => typeof v === 'number' ? ui.green
    : v === null ? ui.textFaint : ui.amber

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap',
      gap: 0, marginTop: 4, overflowX: 'auto' }}>
      {nodes.map(({ head, tail }, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', border: `1px solid ${ui.accent}44`, borderRadius: 5,
            background: ui.panelBg2, overflow: 'hidden', fontSize: 11,
            fontFamily: 'JetBrains Mono, monospace' }}>
            <div style={{ padding: '3px 7px', borderRight: `1px solid ${ui.accent}44`,
              color: fmtColor(head), fontWeight: 700 }}>{fmt(head)}</div>
            <div style={{ padding: '3px 6px', color: tail === null ? ui.textFaint : ui.accent }}>
              {tail === null ? '/' : '→'}
            </div>
          </div>
          {i < nodes.length - 1 && (
            <svg width="16" height="20" style={{ flexShrink: 0 }}>
              <line x1="2" y1="10" x2="12" y2="10" stroke={ui.accent} strokeWidth="1.2"/>
              <polygon points="12,7 16,10 12,13" fill={ui.accent}/>
            </svg>
          )}
        </div>
      ))}
      {nodes[nodes.length - 1]?.tail === null && (
        <span style={{ fontSize: 10, color: ui.textFaint, paddingLeft: 4,
          fontFamily: 'JetBrains Mono, monospace', fontStyle: 'italic' }}>null</span>
      )}
    </div>
  )
}

// ── SICP tree → vertical tree diagram ─────────────────────────────────────────

interface WatchTreeNodeProps {
  id: number | null
  snapshot: HeapSnapshot | null | undefined
  depth?: number
  visited?: Set<number>
  ui: CodeLensUiPalette
}

function WatchTreeNode({ id, snapshot, depth = 0, visited = new Set(), ui }: WatchTreeNodeProps) {
  if (!id || visited.has(id)) return <span style={{ color: ui.red, fontSize: 10 }}>∞</span>
  const obj = snapshot?.objects?.get(id)
  if (!obj) return null

  const v = new Set([...visited, id])
  const head = obj.properties.get('0')
  const tail  = obj.properties.get('1')
  const headId = isHeapRef(head) ? refId(head) : null
  const tailId  = isHeapRef(tail) ? refId(tail) : null
  const headIsArr = headId !== null && snapshot?.objects?.get(headId)?.type === 'Array'
  const tailIsArr  = tailId !== null && snapshot?.objects?.get(tailId)?.type === 'Array'

  const headStr = headIsArr ? '•'
    : head === null ? 'nil' : typeof head === 'number' ? String(head)
    : typeof head === 'string' ? head : String(head)
  const headColor = headIsArr ? ui.accent : typeof head === 'number' ? ui.green : ui.amber

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', border: `1px solid ${ui.accent}55`, borderRadius: 5,
        background: ui.panelBg2, overflow: 'hidden', fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace' }}>
        <div style={{ padding: '3px 7px', borderRight: `1px solid ${ui.accent}44`,
          color: headColor, fontWeight: 700 }}>{headStr}</div>
        <div style={{ padding: '3px 6px', color: tail === null ? ui.textFaint : ui.accent }}>
          {tail === null ? '/' : '•'}
        </div>
      </div>
      {(headIsArr || tailIsArr) && (
        <div style={{ display: 'flex', gap: 12, marginTop: 0 }}>
          {headIsArr && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 1, height: 10, background: `${ui.accent}44` }} />
              <WatchTreeNode id={headId} snapshot={snapshot} depth={depth+1} visited={v} ui={ui} />
            </div>
          )}
          {tailIsArr && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 1, height: 10, background: `${ui.accent}44` }} />
              <WatchTreeNode id={tailId} snapshot={snapshot} depth={depth+1} visited={v} ui={ui} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function WatchTree({ rootId, snapshot, ui }: { rootId: number; snapshot: HeapSnapshot | null | undefined; ui: CodeLensUiPalette }) {
  return (
    <div style={{ marginTop: 6, display: 'inline-block' }}>
      <WatchTreeNode id={rootId} snapshot={snapshot} ui={ui} />
    </div>
  )
}

// ── Object ─────────────────────────────────────────────────────────────────────

function WatchObject({ obj, snapshot, depth = 0, ui }: { obj: HeapObjectEntry; snapshot: HeapSnapshot | null | undefined; depth?: number; ui: CodeLensUiPalette }) {
  const entries = [...obj.properties].filter(([k]) =>
    k !== '__mapData__' && k !== 'length')
  if (entries.length === 0) return <Primitive label="{}" color={ui.accent} />
  return (
    <div style={{ marginTop: depth === 0 ? 4 : 2, fontSize: 11,
      fontFamily: 'JetBrains Mono, monospace' }}>
      {entries.map(([k, v]) => {
        const rid = isHeapRef(v) ? refId(v) : null
        const col = v === null ? ui.textFaint
          : typeof v === 'number' ? ui.green
          : typeof v === 'string' ? ui.amber
          : typeof v === 'boolean' ? ui.pink
          : ui.textDim
        return (
          <div key={k} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 2 }}>
            <span style={{ color: ui.cyan, flexShrink: 0, minWidth: 52,
              overflow: 'hidden', textOverflow: 'ellipsis' }}>{k}:</span>
            {rid !== null
              ? <ExpandableRef id={rid} snapshot={snapshot} depth={depth + 1} ui={ui} />
              : <span style={{ color: col }}>
                  {v === null ? 'null' : String(v)}
                </span>
            }
          </div>
        )
      })}
    </div>
  )
}

// ── Watch row ──────────────────────────────────────────────────────────────────

interface WatchRowProps {
  name: string
  snapshot: HeapSnapshot | null | undefined
  stackSnapshot: StackFrame[]
  onRemove: (name: string) => void
  ui: CodeLensUiPalette
}

function WatchRow({ name, snapshot, stackSnapshot, onRemove, ui }: WatchRowProps) {
  // Look up the value in the current scope chain.
  // Returns MISSING (not undefined) when the variable isn't in any frame,
  // so variables that genuinely hold undefined display correctly.
  const value: unknown = (() => {
    if (!stackSnapshot?.length) return MISSING
    for (const frame of stackSnapshot) {
      const locals = frame.locals ?? {}
      if (Object.prototype.hasOwnProperty.call(locals, name)) return locals[name]
    }
    return MISSING
  })()

  return (
    <div style={{ borderBottom: `1px solid ${ui.panelBg}`, padding: '8px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
          color: ui.cyan, flex: 1, fontWeight: 600 }}>{name}</span>
        <button onClick={() => onRemove(name)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: ui.borderStrong, padding: 2, display: 'flex', alignItems: 'center',
        }}>
          <X size={12} />
        </button>
      </div>
      {renderValue(value, snapshot, ui)}
    </div>
  )
}

// ── Main WatchWindow component ─────────────────────────────────────────────────

interface WatchWindowProps {
  snapshot: HeapSnapshot | null
  currentEvent: TraceEvent | null
  onClose: () => void
  // Variable/function/parameter names pulled from the parsed AST, offered as
  // browser-native autocomplete so users can pick a name to watch instead of
  // having to remember and retype it exactly.
  knownNames?: string[]
}

const WATCH_DATALIST_ID = 'codelens-watch-known-names'

export default function WatchWindow({ snapshot, currentEvent, onClose, knownNames = [] }: WatchWindowProps) {
  const { theme: { ui } } = useCodeLensTheme()
  const [watches, setWatches]   = useState<string[]>([])
  const [inputVal, setInputVal] = useState('')
  const [pos, setPos]           = useState({ x: 20, y: 80 })
  const [dragging, setDragging] = useState(false)
  const dragStart               = useRef<{ mx: number; my: number } | null>(null)
  const windowRef               = useRef<HTMLDivElement>(null)

  const stackSnapshot = currentEvent?.stackSnapshot ?? []

  const addWatch = useCallback(() => {
    const name = inputVal.trim()
    if (!name || watches.includes(name)) return
    setWatches(w => [...w, name])
    setInputVal('')
  }, [inputVal, watches])

  const removeWatch = useCallback((name: string) => {
    setWatches(w => w.filter(n => n !== name))
  }, [])

  // Drag handling
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragStart.current = { mx: e.clientX - pos.x, my: e.clientY - pos.y }
    setDragging(true)
  }, [pos])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: globalThis.MouseEvent) => {
      if (!dragStart.current) return
      setPos({ x: e.clientX - dragStart.current.mx, y: e.clientY - dragStart.current.my })
    }
    const onUp = () => setDragging(false)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  }, [dragging])

  return (
    <div
      ref={windowRef}
      style={{
        position: 'fixed',
        left: pos.x, top: pos.y,
        width: 280,
        background: ui.headerBg,
        border: `1px solid ${ui.border}`,
        borderRadius: 10,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        userSelect: dragging ? 'none' : 'auto',
      }}
    >
      {/* Title bar */}
      <div
        onMouseDown={onMouseDown}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 10px', borderBottom: `1px solid ${ui.border}`,
          cursor: dragging ? 'grabbing' : 'grab',
          background: ui.bg, borderRadius: '10px 10px 0 0',
        }}
      >
        <GripVertical size={12} color={ui.borderStrong} />
        <Eye size={12} color={ui.accent} />
        <span style={{ fontSize: 11, fontWeight: 700, color: ui.text,
          fontFamily: 'JetBrains Mono, monospace', flex: 1 }}>Watch</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: ui.textFaint, display: 'flex', alignItems: 'center', padding: 2,
        }}>
          <X size={13} />
        </button>
      </div>

      {/* Watch rows */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 400 }}>
        {watches.length === 0 ? (
          <div style={{ padding: '12px 10px', fontSize: 11, color: ui.borderStrong,
            fontFamily: 'JetBrains Mono, monospace', fontStyle: 'italic' }}>
            Type a variable name below to watch it.
          </div>
        ) : (
          watches.map(name => (
            <WatchRow
              key={name}
              name={name}
              snapshot={snapshot}
              stackSnapshot={stackSnapshot}
              onRemove={removeWatch}
              ui={ui}
            />
          ))
        )}
      </div>

      {/* Add watch input */}
      <div style={{ display: 'flex', gap: 0, borderTop: `1px solid ${ui.border}` }}>
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addWatch()}
          placeholder="variable name…"
          list={knownNames.length > 0 ? WATCH_DATALIST_ID : undefined}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            padding: '7px 10px', fontSize: 11, color: ui.text,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        />
        <button onClick={addWatch} style={{
          background: 'none', border: 'none', borderLeft: `1px solid ${ui.border}`,
          cursor: 'pointer', padding: '6px 10px', color: ui.accent,
          display: 'flex', alignItems: 'center',
        }}>
          <Plus size={14} />
        </button>
      </div>

      {/* Native browser autocomplete — names parsed from the AST/model */}
      {knownNames.length > 0 && (
        <datalist id={WATCH_DATALIST_ID}>
          {knownNames.map(n => <option key={n} value={n} />)}
        </datalist>
      )}
    </div>
  )
}
