/**
 * HeapGraph — semantic heap visualizer.
 * No force simulation. Each pattern gets a layout that matches its structure:
 *   Arrays          → horizontal cell grid (sort/array algorithms)
 *   Linked-list     → horizontal card chain with arrows
 *   Everything else → scrollable card list with inline reference badges
 */
import { snapshotToGraph } from './heapSnapshot.js'

const TYPE_COLOR = {
  Object:     '#818cf8',
  Array:      '#7dd3fc',
  Node:       '#86efac',
  LinkedList: '#a78bfa',
  Map:        '#fbbf24',
  Set:        '#f472b6',
  prototype:  '#475569',
}
const typeColor = t => TYPE_COLOR[t] ?? '#94a3b8'

// ── Top-level dispatcher ───────────────────────────────────────────────────────

export default function HeapGraph({ snapshot, heapDelta }) {
  if (!snapshot || snapshot.objects.size === 0) return <EmptyState />

  const objects = [...snapshot.objects.values()]
  const arrays  = objects.filter(o => o.type === 'Array')
  const others  = objects.filter(o => o.type !== 'Array')

  const mutatedProps = buildMutatedProps(heapDelta)

  // ── Pure array (sorting, array ops) → cell grid ───────────────────────────
  if (arrays.length > 0 && others.length === 0) {
    return (
      <div style={{ padding: '10px 12px', overflow: 'auto', height: '100%' }}>
        {arrays.map(arr => (
          <ArrayCells
            key={arr.id}
            obj={arr}
            isNew={snapshot.lastCreated.has(arr.id)}
            mutated={mutatedProps[arr.id] ?? new Set()}
          />
        ))}
      </div>
    )
  }

  // ── Detect linked-list chain ───────────────────────────────────────────────
  const chain = detectChain(others, snapshot)
  const chainSet = chain ? new Set(chain) : null
  const containers = chain ? others.filter(o => !chainSet.has(o.id)) : []
  const chainNodes = chain ? chain.map(id => snapshot.objects.get(id)).filter(Boolean) : []

  return (
    <div style={{ padding: '10px 12px', overflow: 'auto', height: '100%' }}>
      {/* Container objects (e.g. LinkedList wrapper) */}
      {containers.map(obj => (
        <ObjectCard key={obj.id} obj={obj} snapshot={snapshot}
          isNew={snapshot.lastCreated.has(obj.id)}
          isMutated={snapshot.lastMutated.has(obj.id)}
          mutatedProps={mutatedProps[obj.id] ?? new Set()}
        />
      ))}

      {/* Horizontal chain */}
      {chain && (
        <>
          {containers.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
              fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace',
            }}>
              <div style={{ height: 1, width: 24, background: '#1e293b' }} />
              chain of {chainNodes.length} {chainNodes[0]?.type ?? 'nodes'}
              <div style={{ flex: 1, height: 1, background: '#1e293b' }} />
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 6 }}>
            {chainNodes.map((obj, i) => (
              <div key={obj.id} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <ObjectCard obj={obj} snapshot={snapshot}
                  isNew={snapshot.lastCreated.has(obj.id)}
                  isMutated={snapshot.lastMutated.has(obj.id)}
                  mutatedProps={mutatedProps[obj.id] ?? new Set()}
                  compact
                />
                <ChainArrow />
              </div>
            ))}
            <span style={{
              fontSize: 12, color: '#475569', fontFamily: 'JetBrains Mono, monospace',
              padding: '0 8px', flexShrink: 0,
            }}>null</span>
          </div>
        </>
      )}

      {/* Card list for non-chain objects */}
      {!chain && objects.map(obj => (
        <ObjectCard key={obj.id} obj={obj} snapshot={snapshot}
          isNew={snapshot.lastCreated.has(obj.id)}
          isMutated={snapshot.lastMutated.has(obj.id)}
          mutatedProps={mutatedProps[obj.id] ?? new Set()}
        />
      ))}
    </div>
  )
}

// ── Object card (used for both list and chain) ─────────────────────────────────

function ObjectCard({ obj, snapshot, isNew, isMutated, mutatedProps, compact }) {
  const color = typeColor(obj.type)
  const prims = [], refs = []

  for (const [k, v] of obj.properties) {
    if (obj.type === 'Array' && k === 'length') continue
    if (isRef(v)) {
      const target = snapshot.objects.get(v.$ref)
      refs.push({ key: k, label: target ? `${target.type} #${v.$ref}` : `#${v.$ref}`, id: v.$ref })
    } else {
      prims.push({ key: k, val: v })
    }
  }

  const borderColor = isNew ? '#22c55e' : isMutated ? '#f59e0b' : color + '44'
  const glow = (isNew || isMutated)
    ? `0 0 12px ${isNew ? '#22c55e44' : '#f59e0b44'}`
    : 'none'

  return (
    <div style={{
      background: '#0d1526',
      border: `1px solid ${borderColor}`,
      borderRadius: 8,
      marginBottom: compact ? 0 : 8,
      minWidth: compact ? 130 : undefined,
      flexShrink: 0,
      boxShadow: glow,
      transition: 'box-shadow 0.2s, border-color 0.2s',
    }}>
      {/* Header */}
      <div style={{
        background: color + '1a',
        padding: '5px 10px',
        borderRadius: '7px 7px 0 0',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ color, fontWeight: 700, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
          {obj.type}
        </span>
        <span style={{ color: '#334155', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>
          #{obj.id}
        </span>
        {isNew && (
          <span style={{
            marginLeft: 'auto', fontSize: 9, padding: '1px 5px', borderRadius: 99,
            background: '#14532d22', color: '#86efac', border: '1px solid #14532d44',
          }}>new</span>
        )}
        {isMutated && !isNew && (
          <span style={{
            marginLeft: 'auto', fontSize: 9, padding: '1px 5px', borderRadius: 99,
            background: '#78350f22', color: '#fcd34d', border: '1px solid #78350f44',
          }}>changed</span>
        )}
      </div>

      {/* Body */}
      {(prims.length > 0 || refs.length > 0) && (
        <div style={{ padding: '5px 10px 7px' }}>
          {prims.map(({ key, val }) => {
            const highlighted = mutatedProps.has(key)
            return (
              <div key={key} style={{
                display: 'flex', gap: 6, alignItems: 'baseline',
                fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                marginBottom: 2,
                background: highlighted ? '#78350f1a' : 'transparent',
                borderRadius: 3, padding: highlighted ? '1px 3px' : '1px 0',
              }}>
                <span style={{ color: '#7dd3fc', flexShrink: 0 }}>{key}:</span>
                <span style={{ color: valColor(val) }}>{fmtVal(val)}</span>
              </div>
            )
          })}
          {refs.map(({ key, label, id }) => (
            <div key={key} style={{
              display: 'flex', gap: 6, alignItems: 'center',
              fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
              marginBottom: 2,
            }}>
              <span style={{ color: '#7dd3fc', flexShrink: 0 }}>{key}:</span>
              <span style={{
                color: '#818cf8', background: '#1e1b4b',
                padding: '1px 6px', borderRadius: 4, fontSize: 10,
              }}>→ {label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ChainArrow() {
  return (
    <svg width="28" height="24" style={{ flexShrink: 0, overflow: 'visible' }}>
      <line x1="2" y1="12" x2="22" y2="12" stroke="#6366f1" strokeWidth="1.5" />
      <polygon points="22,8 28,12 22,16" fill="#6366f1" />
    </svg>
  )
}

// ── Array cells (sort / array-heavy algorithms) ────────────────────────────────

function ArrayCells({ obj, isNew, mutated }) {
  const elems = []
  for (const [k, v] of obj.properties) {
    const idx = parseInt(k, 10)
    if (!isNaN(idx)) elems[idx] = v
  }
  const len   = elems.length
  const cellW = len > 30 ? 24 : len > 15 ? 32 : len > 8 ? 42 : 52
  const cellH = len > 30 ? 38 : 52

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#7dd3fc', fontWeight: 700 }}>
          Array #{obj.id}
        </span>
        <span style={{
          fontSize: 10, padding: '1px 6px', borderRadius: 99,
          background: '#1e293b', color: '#475569', fontFamily: 'JetBrains Mono, monospace',
        }}>{len} elements</span>
        {isNew && (
          <span style={{
            fontSize: 10, padding: '1px 6px', borderRadius: 99,
            background: '#14532d22', color: '#86efac', border: '1px solid #14532d',
          }}>new</span>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {elems.map((v, i) => {
          const hit = mutated.has(String(i))
          return (
            <div key={i} title={`[${i}] = ${v}`} style={{
              width: cellW, height: cellH,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              borderRadius: 5, cursor: 'default',
              background: hit ? '#78350f33' : '#0f172a',
              border: `1px solid ${hit ? '#f59e0b' : '#1e293b'}`,
              boxShadow: hit ? '0 0 8px #f59e0b44' : 'none',
              transition: 'all 0.15s',
            }}>
              <span style={{
                fontSize: cellW < 32 ? 11 : 13, fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 600, color: hit ? '#fcd34d' : '#86efac', lineHeight: 1,
              }}>{v === undefined ? '·' : String(v)}</span>
              <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: '#334155', marginTop: 2, lineHeight: 1 }}>
                {i}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      width: '100%', height: '100%', minHeight: 180, padding: 24, gap: 10, textAlign: 'center',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>
        NO HEAP ALLOCATIONS
      </div>
      <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.7, maxWidth: 260 }}>
        This code works entirely with primitives — numbers, strings, booleans.
        Primitives live on the <span style={{ color: '#818cf8' }}>call stack</span>, not the heap.
      </div>
      <div style={{
        fontSize: 11, color: '#334155', padding: '6px 12px',
        borderRadius: 6, background: '#0f172a', border: '1px solid #1e293b',
      }}>
        → Switch to <span style={{ color: '#818cf8' }}>Scope</span> to see where variables live
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function isRef(v) { return v !== null && typeof v === 'object' && '$ref' in v }

function buildMutatedProps(heapDelta) {
  const map = {}
  for (const d of heapDelta ?? []) {
    if (d.op === 'mutate') {
      if (!map[d.objectId]) map[d.objectId] = new Set()
      map[d.objectId].add(String(d.property))
    }
  }
  return map
}

function detectChain(objects, snapshot) {
  if (objects.length < 2) return null

  // Find pairs where one object has a property pointing to another of the same type
  const nextMap = new Map() // fromId → toId
  for (const obj of objects) {
    for (const [, v] of obj.properties) {
      if (isRef(v) && snapshot.objects.has(v.$ref)) {
        const target = snapshot.objects.get(v.$ref)
        if (target.type === obj.type) { nextMap.set(obj.id, v.$ref); break }
      }
    }
  }
  if (nextMap.size === 0) return null

  // Find chain head: in nextMap but not a target of any nextMap entry
  const allTargets = new Set(nextMap.values())
  let head = null
  for (const [id] of nextMap) {
    if (!allTargets.has(id)) { head = id; break }
  }
  if (!head) head = nextMap.keys().next().value

  // Walk the chain
  const order = []
  let cur = head
  const seen = new Set()
  while (cur && !seen.has(cur)) {
    order.push(cur)
    seen.add(cur)
    cur = nextMap.get(cur) ?? null
  }

  return order.length >= 2 ? order : null
}

function valColor(v) {
  if (v === null || v === undefined) return '#475569'
  if (typeof v === 'number') return '#86efac'
  if (typeof v === 'string') return '#fbbf24'
  if (typeof v === 'boolean') return '#f472b6'
  return '#94a3b8'
}

function fmtVal(v) {
  if (v === null)      return 'null'
  if (v === undefined) return 'undefined'
  if (typeof v === 'string') return `"${v.length > 18 ? v.slice(0, 18) + '…' : v}"`
  if (typeof v === 'object') return '{…}'
  return String(v)
}
