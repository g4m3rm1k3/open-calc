/**
 * WatchWindow — floating draggable watch panel.
 * Add variable names to watch; each updates live as you step through code.
 * Renders based on type: primitives inline, arrays as cells, SICP pair-lists
 * as linked chains, SICP pair-trees as tree diagrams.
 */
import { useState, useRef, useCallback, useEffect } from 'react'
import { X, Plus, GripVertical, Eye } from 'lucide-react'

// ── Value renderer (type-aware) ────────────────────────────────────────────────

function renderValue(name, value, snapshot) {
  if (value === undefined) {
    return (
      <span style={{ color: '#475569', fontStyle: 'italic', fontSize: 11,
        fontFamily: 'JetBrains Mono, monospace' }}>
        not in scope
      </span>
    )
  }

  if (value === null) return <Primitive label="null" color="#475569" />
  if (typeof value === 'boolean') return <Primitive label={String(value)} color="#f472b6" />
  if (typeof value === 'number')  return <Primitive label={String(value)} color="#86efac" />
  if (typeof value === 'string' && !value.startsWith('['))
    return <Primitive label={`"${value}"`} color="#fbbf24" />

  // Heap reference — render based on object type
  const refId = typeof value === 'object' && value?.$ref != null ? value.$ref
    : typeof value === 'object' && value?.objectId != null ? value.objectId
    : null
  if (refId === null) return <Primitive label={String(value)} color="#94a3b8" />

  const obj = snapshot?.objects?.get(refId)
  if (!obj) return <Primitive label={`#${refId}`} color="#818cf8" />

  if (obj.type === 'Array') {
    // Detect SICP list/tree or plain array
    const mode = detectArrayMode(obj, snapshot)
    if (mode === 'list')  return <WatchList rootId={refId} snapshot={snapshot} />
    if (mode === 'tree')  return <WatchTree rootId={refId} snapshot={snapshot} />
    return <WatchArray obj={obj} snapshot={snapshot} />
  }

  // Generic object — show key: value pairs
  return <WatchObject obj={obj} snapshot={snapshot} />
}

// ── Detection helpers ──────────────────────────────────────────────────────────

function isHeapRef(v) {
  return v !== null && typeof v === 'object' && ('$ref' in v || 'objectId' in v)
}
function refId(v) {
  return v?.$ref ?? v?.objectId ?? null
}

function detectArrayMode(obj, snapshot) {
  const len = parseInt(obj.properties.get('length') ?? 0, 10)
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
    const nodeLen = parseInt(node.properties.get('length') ?? 0, 10)
    if (nodeLen !== 2) { isChain = false; break }

    const nodeTail = node.properties.get('1')
    const nodeHead = node.properties.get('0')

    // If head is also a pair → could be a tree
    if (isHeapRef(nodeHead) && snapshot?.objects?.get(refId(nodeHead))?.type === 'Array') {
      return 'tree'
    }
    cur = isHeapRef(nodeTail) ? refId(nodeTail) : null
    if (nodeTail === null) break
  }

  // Also check: does the original head point to a pair? → tree
  const headId = isHeapRef(head) ? refId(head) : null
  if (headId && snapshot?.objects?.get(headId)?.type === 'Array') return 'tree'

  return isChain ? 'list' : 'plain'
}

// ── Primitive ──────────────────────────────────────────────────────────────────

function Primitive({ label, color }) {
  return (
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
      color, fontWeight: 600 }}>{label}</span>
  )
}

// ── Plain array → cell grid ────────────────────────────────────────────────────

function WatchArray({ obj, snapshot }) {
  const len = parseInt(obj.properties.get('length') ?? 0, 10)
  const elems = []
  for (let i = 0; i < len; i++) elems.push(obj.properties.get(String(i)))

  if (len === 0) return <Primitive label="[]" color="#7dd3fc" />

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
      {elems.map((v, i) => {
        const str = v === null ? 'null' : v === undefined ? 'undef'
          : isHeapRef(v) ? `#${refId(v)}` : String(v)
        const color = v === null || v === undefined ? '#475569'
          : typeof v === 'number' ? '#86efac'
          : typeof v === 'string' ? '#fbbf24' : '#818cf8'
        return (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: '#0f172a', border: '1px solid #1e293b', borderRadius: 5,
            padding: '4px 8px', minWidth: 36,
          }}>
            <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700, color }}>{str}</span>
            <span style={{ fontSize: 8, color: '#334155',
              fontFamily: 'JetBrains Mono, monospace' }}>{i}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── SICP list → horizontal chain ───────────────────────────────────────────────

function WatchList({ rootId, snapshot }) {
  const nodes = []
  const visited = new Set()
  let cur = rootId

  while (cur && !visited.has(cur)) {
    visited.add(cur)
    const obj = snapshot?.objects?.get(cur)
    if (!obj) break
    const head = obj.properties.get('0')
    const tail  = obj.properties.get('1')
    nodes.push({ head, tail })
    cur = isHeapRef(tail) ? refId(tail) : null
    if (tail === null) break
  }

  const fmt = v => v === null ? 'nil'
    : isHeapRef(v) ? `#${refId(v)}`
    : typeof v === 'number' ? String(v)
    : typeof v === 'string' ? v : String(v)

  const fmtColor = v => typeof v === 'number' ? '#86efac'
    : v === null ? '#475569' : '#fbbf24'

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap',
      gap: 0, marginTop: 4, overflowX: 'auto' }}>
      {nodes.map(({ head, tail }, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', border: '1px solid #818cf844', borderRadius: 5,
            background: '#0d1526', overflow: 'hidden', fontSize: 11,
            fontFamily: 'JetBrains Mono, monospace' }}>
            <div style={{ padding: '3px 7px', borderRight: '1px solid #818cf844',
              color: fmtColor(head), fontWeight: 700 }}>{fmt(head)}</div>
            <div style={{ padding: '3px 6px', color: tail === null ? '#475569' : '#818cf8' }}>
              {tail === null ? '/' : '→'}
            </div>
          </div>
          {i < nodes.length - 1 && (
            <svg width="16" height="20" style={{ flexShrink: 0 }}>
              <line x1="2" y1="10" x2="12" y2="10" stroke="#818cf8" strokeWidth="1.2"/>
              <polygon points="12,7 16,10 12,13" fill="#818cf8"/>
            </svg>
          )}
        </div>
      ))}
      {nodes[nodes.length - 1]?.tail === null && (
        <span style={{ fontSize: 10, color: '#475569', paddingLeft: 4,
          fontFamily: 'JetBrains Mono, monospace', fontStyle: 'italic' }}>null</span>
      )}
    </div>
  )
}

// ── SICP tree → vertical tree diagram ─────────────────────────────────────────

function WatchTreeNode({ id, snapshot, depth = 0, visited = new Set() }) {
  if (!id || visited.has(id)) return <span style={{ color:'#f87171',fontSize:10 }}>∞</span>
  const obj = snapshot?.objects?.get(id)
  if (!obj) return null

  const v = new Set([...visited, id])
  const head = obj.properties.get('0')
  const tail  = obj.properties.get('1')
  const headId = isHeapRef(head) ? refId(head) : null
  const tailId  = isHeapRef(tail) ? refId(tail) : null
  const headIsArr = headId && snapshot?.objects?.get(headId)?.type === 'Array'
  const tailIsArr  = tailId && snapshot?.objects?.get(tailId)?.type === 'Array'

  const headStr = headIsArr ? '•'
    : head === null ? 'nil' : typeof head === 'number' ? String(head)
    : typeof head === 'string' ? head : String(head)
  const headColor = headIsArr ? '#818cf8' : typeof head === 'number' ? '#86efac' : '#fbbf24'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', border: '1px solid #818cf855', borderRadius: 5,
        background: '#0d1526', overflow: 'hidden', fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace' }}>
        <div style={{ padding: '3px 7px', borderRight: '1px solid #818cf844',
          color: headColor, fontWeight: 700 }}>{headStr}</div>
        <div style={{ padding: '3px 6px', color: tail === null ? '#475569' : '#818cf8' }}>
          {tail === null ? '/' : '•'}
        </div>
      </div>
      {(headIsArr || tailIsArr) && (
        <div style={{ display: 'flex', gap: 12, marginTop: 0 }}>
          {headIsArr && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 1, height: 10, background: '#818cf844' }} />
              <WatchTreeNode id={headId} snapshot={snapshot} depth={depth+1} visited={v} />
            </div>
          )}
          {tailIsArr && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 1, height: 10, background: '#818cf844' }} />
              <WatchTreeNode id={tailId} snapshot={snapshot} depth={depth+1} visited={v} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function WatchTree({ rootId, snapshot }) {
  return (
    <div style={{ marginTop: 6, display: 'inline-block' }}>
      <WatchTreeNode id={rootId} snapshot={snapshot} />
    </div>
  )
}

// ── Object ─────────────────────────────────────────────────────────────────────

function WatchObject({ obj, snapshot }) {
  const entries = [...obj.properties].filter(([k]) =>
    k !== '__mapData__' && k !== 'length')
  if (entries.length === 0) return <Primitive label="{}" color="#818cf8" />
  return (
    <div style={{ marginTop: 4, fontSize: 11,
      fontFamily: 'JetBrains Mono, monospace' }}>
      {entries.map(([k, v]) => {
        const str = v === null ? 'null' : isHeapRef(v) ? `→ #${refId(v)}` : String(v)
        const col = typeof v === 'number' ? '#86efac' : '#94a3b8'
        return (
          <div key={k} style={{ display: 'flex', gap: 6 }}>
            <span style={{ color: '#7dd3fc' }}>{k}:</span>
            <span style={{ color: col }}>{str}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Watch row ──────────────────────────────────────────────────────────────────

function WatchRow({ name, snapshot, stackSnapshot, onRemove }) {
  // Look up the value in the current scope chain
  const value = (() => {
    if (!stackSnapshot) return undefined
    for (const frame of stackSnapshot) {
      const locals = frame.locals ?? {}
      if (name in locals) return locals[name]
    }
    return undefined
  })()

  return (
    <div style={{ borderBottom: '1px solid #0f172a', padding: '8px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
          color: '#7dd3fc', flex: 1, fontWeight: 600 }}>{name}</span>
        <button onClick={() => onRemove(name)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#334155', padding: 2, display: 'flex', alignItems: 'center',
        }}>
          <X size={12} />
        </button>
      </div>
      {renderValue(name, value, snapshot)}
    </div>
  )
}

// ── Main WatchWindow component ─────────────────────────────────────────────────

export default function WatchWindow({ snapshot, currentEvent, onClose }) {
  const [watches, setWatches]   = useState([])
  const [inputVal, setInputVal] = useState('')
  const [pos, setPos]           = useState({ x: 20, y: 80 })
  const [dragging, setDragging] = useState(false)
  const dragStart               = useRef(null)
  const windowRef               = useRef(null)

  const stackSnapshot = currentEvent?.stackSnapshot ?? []

  const addWatch = useCallback(() => {
    const name = inputVal.trim()
    if (!name || watches.includes(name)) return
    setWatches(w => [...w, name])
    setInputVal('')
  }, [inputVal, watches])

  const removeWatch = useCallback((name) => {
    setWatches(w => w.filter(n => n !== name))
  }, [])

  // Drag handling
  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    dragStart.current = { mx: e.clientX - pos.x, my: e.clientY - pos.y }
    setDragging(true)
  }, [pos])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
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
        background: '#0a0f1e',
        border: '1px solid #1e293b',
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
          padding: '7px 10px', borderBottom: '1px solid #1e293b',
          cursor: dragging ? 'grabbing' : 'grab',
          background: '#080c14', borderRadius: '10px 10px 0 0',
        }}
      >
        <GripVertical size={12} color="#334155" />
        <Eye size={12} color="#818cf8" />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0',
          fontFamily: 'JetBrains Mono, monospace', flex: 1 }}>Watch</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#475569', display: 'flex', alignItems: 'center', padding: 2,
        }}>
          <X size={13} />
        </button>
      </div>

      {/* Watch rows */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 400 }}>
        {watches.length === 0 ? (
          <div style={{ padding: '12px 10px', fontSize: 11, color: '#334155',
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
            />
          ))
        )}
      </div>

      {/* Add watch input */}
      <div style={{ display: 'flex', gap: 0, borderTop: '1px solid #1e293b' }}>
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addWatch()}
          placeholder="variable name…"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            padding: '7px 10px', fontSize: 11, color: '#e2e8f0',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        />
        <button onClick={addWatch} style={{
          background: 'none', border: 'none', borderLeft: '1px solid #1e293b',
          cursor: 'pointer', padding: '6px 10px', color: '#818cf8',
          display: 'flex', alignItems: 'center',
        }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}
