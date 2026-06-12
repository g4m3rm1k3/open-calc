import { serializeValue } from './environment.js'

let _objId = 0

export class Heap {
  constructor() {
    this.objects  = new Map()  // objectId -> descriptor
    this.deltas   = []         // pending delta for current event
  }

  // Allocate a new object. Returns a reference value { __kind, objectId }.
  allocate(type, properties = {}, prototype = null) {
    const id  = ++_objId
    const obj = {
      id,
      type,
      properties: new Map(Object.entries(properties)),
      prototype,
      createdAtStep: null,  // filled in by interpreter
    }
    this.objects.set(id, obj)
    this.deltas.push({ op: 'create', objectId: id, objectType: type,
      properties: serializeProps(obj.properties) })
    return mkRef(id)
  }

  // Read a property from an object, walking the prototype chain.
  get(ref, prop) {
    const obj = this._resolve(ref)
    if (!obj) return undefined
    if (obj.properties.has(prop)) return obj.properties.get(prop)
    if (obj.prototype !== null)   return this.get(mkRef(obj.prototype), prop)
    return undefined
  }

  // Write a property on the direct object (no prototype walk).
  set(ref, prop, value, stepId = null) {
    const obj = this._resolve(ref)
    if (!obj) throw new TypeError(`Cannot set property '${prop}' on non-object`)
    const oldValue = obj.properties.get(prop)
    obj.properties.set(prop, value)
    this.deltas.push({
      op: 'mutate', objectId: obj.id, property: prop,
      oldValue: serializeValue(oldValue), newValue: serializeValue(value),
    })
  }

  // Check own-property existence.
  has(ref, prop) {
    const obj = this._resolve(ref)
    return obj?.properties.has(prop) ?? false
  }

  // Enumerate own properties (for for-in / spread).
  ownKeys(ref) {
    const obj = this._resolve(ref)
    return obj ? [...obj.properties.keys()] : []
  }

  // Get all own + inherited keys (for for-in).
  allKeys(ref) {
    const seen = new Set()
    let r = ref
    while (r !== null && r !== undefined) {
      const obj = this._resolve(r)
      if (!obj) break
      for (const k of obj.properties.keys()) seen.add(k)
      r = obj.prototype !== null ? mkRef(obj.prototype) : null
    }
    return [...seen]
  }

  // Snapshot the heap for display (top-level objects, no deep clone).
  snapshot() {
    const out = {}
    for (const [id, obj] of this.objects) {
      out[id] = {
        id, type: obj.type,
        properties: serializeProps(obj.properties),
        prototype: obj.prototype,
      }
    }
    return out
  }

  // Drain and return the accumulated deltas since last drain.
  drainDeltas() {
    const d = this.deltas
    this.deltas = []
    return d
  }

  _resolve(ref) {
    if (ref?.__kind !== 'reference') return null
    return this.objects.get(ref.objectId) ?? null
  }
}

export function mkRef(objectId) {
  return { __kind: 'reference', objectId }
}

export function isRef(v) {
  return v?.__kind === 'reference'
}

function serializeProps(propMap) {
  const out = {}
  for (const [k, v] of propMap) out[k] = serializeValue(v)
  return out
}
