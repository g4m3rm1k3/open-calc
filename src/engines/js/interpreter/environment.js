let _envId = 0

export class Environment {
  constructor(parent = null, name = 'global') {
    this.id       = ++_envId
    this.name     = name
    this.parent   = parent
    this.bindings = new Map() // name -> { value, kind, initialized }
  }

  // Declare a new binding in THIS scope.
  define(name, value, kind = 'let') {
    this.bindings.set(name, { value, kind, initialized: true })
  }

  // Hoist a var name (marks it as declared but uninitialized = undefined).
  hoist(name) {
    if (!this.bindings.has(name)) {
      this.bindings.set(name, { value: undefined, kind: 'var', initialized: true })
    }
  }

  // Look up a name, walking the chain. Throws ReferenceError if not found.
  lookup(name) {
    const binding = this.bindings.get(name)
    if (binding !== undefined) {
      if (!binding.initialized) throw new TDZError(name)
      return binding.value
    }
    if (this.parent) return this.parent.lookup(name)
    throw new ReferenceError(`${name} is not defined`)
  }

  // Assign to an existing binding wherever it lives in the chain.
  assign(name, value) {
    const binding = this.bindings.get(name)
    if (binding !== undefined) {
      if (binding.kind === 'const') throw new TypeError(`Assignment to constant variable '${name}'`)
      binding.value = value
      return
    }
    if (this.parent) { this.parent.assign(name, value); return }
    // Implicit global in non-strict mode
    this.define(name, value, 'var')
  }

  // Find the scope that owns a binding (used for closures / scope-chain display).
  ownerOf(name) {
    if (this.bindings.has(name)) return this
    return this.parent?.ownerOf(name) ?? null
  }

  // Snapshot all bindings in THIS scope (for event emission / visualization).
  snapshot() {
    const out = {}
    for (const [k, b] of this.bindings) out[k] = b.initialized ? serializeValue(b.value) : '<TDZ>'
    return out
  }

  // Walk up to the nearest function scope (for var hoisting).
  functionScope() {
    if (this.name === 'function' || this.name === 'global') return this
    return this.parent?.functionScope() ?? this
  }

  extend(name = 'block') {
    return new Environment(this, name)
  }
}

export class TDZError extends ReferenceError {
  constructor(name) { super(`Cannot access '${name}' before initialization`) }
}

// Serialize a runtime value to a plain, JSON-safe descriptor for events/display.
export function serializeValue(v) {
  if (v === null)      return null
  if (v === undefined) return undefined
  if (typeof v === 'function') return `[Function]`
  if (typeof v !== 'object')   return v
  if (v?.__kind === 'reference')  return { $ref: v.objectId }
  if (v?.__kind === 'function')   return `[Function: ${v.name ?? '(anonymous)'}]`
  if (v?.__kind === 'class')      return `[Class: ${v.name}]`
  if (v?.__kind === 'native')     return `[native: ${v.name}]`
  return String(v)
}
