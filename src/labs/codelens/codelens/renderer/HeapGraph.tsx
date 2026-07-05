/**
 * HeapGraph — semantic heap visualizer.
 * No force simulation. Each pattern gets a layout that matches its structure:
 *   Arrays          → horizontal cell grid (sort/array algorithms)
 *   Linked-list     → horizontal card chain with arrows
 *   Everything else → scrollable card list with inline reference badges
 */

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

  // ── Check for SICP-style pair structures before falling into flat grid ─────
  // Check tree first (branching pairs), then chain (linear list).
  const sicpTreeRoot  = arrays.length >= 3 ? detectSicpTree(arrays, snapshot) : null
  const arraySiciChain = !sicpTreeRoot && arrays.length >= 2 ? detectSicpChain(arrays, snapshot) : null

  // ── SICP pair tree → tree diagram ─────────────────────────────────────────
  if (sicpTreeRoot) {
    return (
      <div style={{ padding: '10px 12px', overflow: 'auto', height: '100%' }}>
        <div style={{ marginBottom: 6, fontSize: 10, color: '#a78bfa',
          fontFamily: 'JetBrains Mono, monospace', letterSpacing: '.06em' }}>
          PAIR TREE — {arrays.length} node{arrays.length !== 1 ? 's' : ''}
        </div>
        <div style={{ display: 'inline-block' }}>
          <PairTreeNode id={sicpTreeRoot} snapshot={snapshot} />
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: '#475569',
          fontFamily: 'JetBrains Mono, monospace' }}>
          Each box: [head | tail] — • = pointer to child node, / = null
        </div>
      </div>
    )
  }

  // ── SICP list chain → linked-list renderer ────────────────────────────────
  if (arraySiciChain) {
    const chainSet   = new Set(arraySiciChain)
    const standalone = arrays.filter(o => !chainSet.has(o.id))
    const chainNodes = arraySiciChain.map(id => snapshot.objects.get(id)).filter(Boolean)
    return (
      <div style={{ padding: '10px 12px', overflow: 'auto', height: '100%' }}>
        {standalone.length > 0 && standalone.map(arr => (
          <ArrayCells key={arr.id} obj={arr}
            isNew={snapshot.lastCreated.has(arr.id)}
            mutated={mutatedProps[arr.id] ?? new Set()}
          />
        ))}
        <div style={{ marginBottom: 6, fontSize: 10, color: '#86efac',
          fontFamily: 'JetBrains Mono, monospace', letterSpacing: '.06em' }}>
          LIST CHAIN — {chainNodes.length} pair{chainNodes.length !== 1 ? 's' : ''}
        </div>
        <PairChain nodes={chainNodes} snapshot={snapshot}
          lastCreated={snapshot.lastCreated} lastMutated={snapshot.lastMutated}
          mutatedProps={mutatedProps}
        />
      </div>
    )
  }

  // ── Pure flat arrays (no inter-references) → cell grid ────────────────────
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

  // ── Detect linked-list chain in non-array objects ──────────────────────────
  const chain = detectChain(others, snapshot)
  const chainSet = chain ? new Set(chain) : null
  const containers = chain ? others.filter(o => !chainSet.has(o.id)) : []
  const chainNodes = chain ? chain.map(id => snapshot.objects.get(id)).filter(Boolean) : []

  return (
    <div style={{ padding: '10px 12px', overflow: 'auto', height: '100%' }}>
      {/* Flat arrays alongside objects */}
      {arrays.map(arr => (
        <ArrayCells key={arr.id} obj={arr}
          isNew={snapshot.lastCreated.has(arr.id)}
          mutated={mutatedProps[arr.id] ?? new Set()}
        />
      ))}

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
      {!chain && others.map(obj => (
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

// ── SICP pair tree renderer ───────────────────────────────────────────────────
// Renders nested pairs as a tree diagram when they branch (head or tail is also a pair).
// Uses recursive divs with connecting lines.

function PairTreeNode({ id, snapshot, depth = 0, visited = new Set() }) {
  if (visited.has(id)) return <span style={{ color: '#f87171', fontSize: 10 }}>⟳</span>
  visited = new Set([...visited, id])

  const obj = snapshot.objects.get(id)
  if (!obj) return null

  const len  = parseInt(obj.properties.get('length') ?? 0, 10)
  const head = obj.properties.get('0')
  const tail = obj.properties.get('1')

  const isHeadRef = head !== null && typeof head === 'object' && '$ref' in head && snapshot.objects.has(head.$ref)
  const isTailRef = tail !== null && typeof tail === 'object' && '$ref' in tail && snapshot.objects.has(tail.$ref)
  const isTailNull = tail === null

  const headStr = isHeadRef ? null
    : head === null ? 'nil' : typeof head === 'number' ? String(head)
    : typeof head === 'string' ? `"${head}"` : String(head)

  const headColor = isHeadRef ? '#818cf8'
    : typeof head === 'number' ? '#86efac' : '#fbbf24'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      {/* This node */}
      <div style={{
        display: 'flex', border: '1px solid #818cf844', borderRadius: 6,
        background: '#0d1526', overflow: 'hidden', fontSize: 11,
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        <div style={{ padding: '4px 8px', borderRight: '1px solid #818cf844',
          color: headColor, minWidth: 28, textAlign: 'center' }}>
          {isHeadRef ? '•' : headStr}
        </div>
        <div style={{ padding: '4px 8px', color: isTailNull ? '#475569' : '#818cf8',
          minWidth: 28, textAlign: 'center' }}>
          {isTailNull ? '/' : '•'}
        </div>
      </div>

      {/* Children */}
      {(isHeadRef || isTailRef) && (
        <div style={{ display: 'flex', gap: 20, marginTop: 0, position: 'relative' }}>
          {/* Connector line */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', width: 1,
            height: 14, background: '#818cf844', transform: 'translateX(-50%)',
          }} />
          {isHeadRef && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 1, height: 14, background: '#818cf844' }} />
              <PairTreeNode id={head.$ref} snapshot={snapshot} depth={depth + 1} visited={visited} />
            </div>
          )}
          {isTailRef && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 1, height: 14, background: '#818cf844' }} />
              <PairTreeNode id={tail.$ref} snapshot={snapshot} depth={depth + 1} visited={visited} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Detect if arrays form a TREE structure (both head AND tail can point to arrays)
// Returns the root node ID if a tree with branching is detected.
function detectSicpTree(arrays, snapshot) {
  if (arrays.length < 3) return null

  // Count how many times each array is referenced by another array
  const refCounts = new Map()
  const pairIds   = new Set(arrays.map(a => a.id))

  for (const arr of arrays) {
    const len = parseInt(arr.properties.get('length') ?? 0, 10)
    if (len !== 2) continue
    for (const prop of ['0', '1']) {
      const v = arr.properties.get(prop)
      if (v !== null && typeof v === 'object' && '$ref' in v && pairIds.has(v.$ref)) {
        refCounts.set(v.$ref, (refCounts.get(v.$ref) ?? 0) + 1)
      }
    }
  }
  if (refCounts.size === 0) return null

  // Check for branching: any array has BOTH head and tail pointing to arrays
  const hasBranching = arrays.some(arr => {
    const h = arr.properties.get('0')
    const t = arr.properties.get('1')
    const hIsRef = h !== null && typeof h === 'object' && '$ref' in h && pairIds.has(h.$ref)
    const tIsRef = t !== null && typeof t === 'object' && '$ref' in t && pairIds.has(t.$ref)
    return hIsRef && tIsRef
  })
  if (!hasBranching) return null

  // Root = array not referenced by any other array in the set
  for (const arr of arrays) {
    if (!refCounts.has(arr.id)) return arr.id
  }
  return null
}

// ── SICP pair chain renderer ──────────────────────────────────────────────────
// Renders list(1,2,3) = [1,[2,[3,null]]] as a horizontal pair chain.
// Each node shows: [ head | tail→ ]

function PairChain({ nodes, snapshot, lastCreated, lastMutated, mutatedProps }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 8, flexWrap: 'wrap', gap: '0 0' }}>
      {nodes.map((obj, i) => {
        const headVal = obj.properties.get('0')
        const tailVal = obj.properties.get('1')
        const isNew     = lastCreated.has(obj.id)
        const isMutated = lastMutated.has(obj.id)
        const borderColor = isNew ? '#22c55e' : isMutated ? '#f59e0b' : '#818cf844'

        // Render the head value
        const headStr = headVal === null ? 'null'
          : headVal === undefined ? 'undef'
          : typeof headVal === 'object' && headVal?.$ref !== undefined
            ? `#${headVal.$ref}`
            : String(headVal)

        const headColor = headVal === null ? '#475569'
          : typeof headVal === 'number' ? '#86efac'
          : typeof headVal === 'string' ? '#fbbf24'
          : typeof headVal === 'boolean' ? '#f472b6'
          : '#818cf8'

        return (
          <div key={obj.id} style={{ display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
            {/* Pair box: [ head | ↓ ] */}
            <div style={{
              display: 'flex', border: `1px solid ${borderColor}`, borderRadius: 6,
              background: '#0d1526', overflow: 'hidden', flexShrink: 0,
              boxShadow: isNew ? '0 0 8px #22c55e44' : isMutated ? '0 0 8px #f59e0b44' : 'none',
            }}>
              {/* Head cell */}
              <div style={{
                padding: '6px 10px', borderRight: `1px solid ${borderColor}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}>
                <span style={{ fontSize: 8, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                  head
                </span>
                <span style={{
                  fontSize: 13, fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700, color: headColor,
                }}>
                  {headStr}
                </span>
              </div>
              {/* Tail cell — just shows →next or null */}
              <div style={{
                padding: '6px 8px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 2, minWidth: 36,
              }}>
                <span style={{ fontSize: 8, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                  tail
                </span>
                <span style={{ fontSize: 11, color: '#818cf8', fontFamily: 'JetBrains Mono, monospace' }}>
                  {tailVal === null ? 'nil' : '→'}
                </span>
              </div>
            </div>
            {/* Arrow between pairs */}
            {i < nodes.length - 1 && (
              <svg width="24" height="44" style={{ flexShrink: 0, alignSelf: 'center' }}>
                <line x1="2" y1="22" x2="18" y2="22" stroke="#818cf8" strokeWidth="1.5" />
                <polygon points="18,18 24,22 18,26" fill="#818cf8" />
              </svg>
            )}
          </div>
        )
      })}
      {/* Terminal null */}
      <div style={{
        display: 'flex', alignItems: 'center', paddingLeft: 8,
        fontSize: 11, color: '#475569', fontFamily: 'JetBrains Mono, monospace',
        fontStyle: 'italic',
      }}>
        null
      </div>
    </div>
  )
}

// ── Detect SICP-style pair chain ──────────────────────────────────────────────
// A SICP pair is [head, tail]. A list is a chain: [a,[b,[c,null]]].
// We detect this by checking: each 2-element array whose index-1 is a $ref
// to another 2-element array in the snapshot.
function detectSicpChain(arrays, snapshot) {
  // Only consider arrays with exactly 2 elements (pair structure)
  const pairs = arrays.filter(o => {
    const len = o.properties.get('length')
    return len === 2
  })
  if (pairs.length < 2) return null

  // Build a next-map: pairId → pairId via index 1
  const nextMap = new Map()
  const pairIds = new Set(pairs.map(p => p.id))
  for (const p of pairs) {
    const tail = p.properties.get('1')
    if (isRef(tail) && pairIds.has(tail.$ref)) {
      nextMap.set(p.id, tail.$ref)
    }
  }
  if (nextMap.size === 0) return null

  // Find the head of the chain (not a target of any next pointer)
  const targets = new Set(nextMap.values())
  let head = null
  for (const [id] of nextMap) {
    if (!targets.has(id)) { head = id; break }
  }
  if (!head) return null

  // Walk the chain
  const order = []
  let cur = head
  const seen = new Set()
  while (cur && !seen.has(cur)) {
    order.push(cur)
    seen.add(cur)
    cur = nextMap.get(cur) ?? null
  }

  // Require at least 2 linked pairs to treat as a list chain
  return order.length >= 2 ? order : null
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
