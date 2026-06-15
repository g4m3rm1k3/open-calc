// Replay heap deltas up to a given step to reconstruct the full heap state.
// Called on every step change — fast enough because each delta is a few ops.

export function buildHeapSnapshot(events, stepIndex) {
  const objects = new Map() // objectId -> { id, type, properties: Map, prototype }
  const lastCreated = new Set()
  const lastMutated = new Set()

  for (let i = 0; i <= stepIndex && i < events.length; i++) {
    const deltas = events[i].heapDelta ?? []
    if (i === stepIndex) { lastCreated.clear(); lastMutated.clear() }

    for (const delta of deltas) {
      if (delta.op === 'create') {
        objects.set(delta.objectId, {
          id:         delta.objectId,
          type:       delta.objectType ?? 'Object',
          properties: new Map(Object.entries(delta.properties ?? {})),
          prototype:  delta.prototype ?? null,
        })
        if (i === stepIndex) lastCreated.add(delta.objectId)
      } else if (delta.op === 'mutate') {
        const obj = objects.get(delta.objectId)
        if (obj) {
          obj.properties.set(delta.property, delta.newValue)
          if (i === stepIndex) lastMutated.add(delta.objectId)
        }
      } else if (delta.op === 'delete') {
        const obj = objects.get(delta.objectId)
        if (obj) {
          obj.properties.delete(delta.property)
          if (i === stepIndex) lastMutated.add(delta.objectId)
        }
      } else if (delta.op === 'free') {
        objects.delete(delta.objectId)
      }
    }
  }

  return { objects, lastCreated, lastMutated }
}

// Extract nodes + directed edges from a heap snapshot for the D3 graph.
export function snapshotToGraph(snapshot) {
  const nodes = []
  const links = []
  const seen  = new Set()

  for (const obj of snapshot.objects.values()) {
    nodes.push({
      id:        obj.id,
      type:      obj.type,
      props:     visibleProps(obj),
      isNew:     snapshot.lastCreated.has(obj.id),
      isMutated: snapshot.lastMutated.has(obj.id),
    })

    for (const [prop, val] of obj.properties) {
      if (isRef(val) && snapshot.objects.has(val.$ref)) {
        const key = `${obj.id}:${prop}:${val.$ref}`
        if (!seen.has(key)) {
          seen.add(key)
          links.push({ id: key, source: obj.id, target: val.$ref, label: prop })
        }
      }
    }
  }

  return { nodes, links }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isRef(v) {
  return v !== null && typeof v === 'object' && '$ref' in v
}

function visibleProps(obj) {
  const out = []
  for (const [k, v] of obj.properties) {
    if (isRef(v)) continue  // references shown as edges, not inline
    if (k === '__mapData__') continue
    if (obj.type === 'Array' && k === 'length') continue
    out.push([k, formatVal(v)])
  }
  return out
}

function formatVal(v) {
  if (v === null)      return 'null'
  if (v === undefined) return 'undef'
  if (typeof v === 'string') return v.length > 12 ? `"${v.slice(0, 12)}…"` : `"${v}"`
  if (typeof v === 'object') return '{…}'
  return String(v)
}
