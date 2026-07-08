// ─── Event Bus ────────────────────────────────────────────────────────────────
// Typed publish / subscribe. Every layer emits events here.
// Views and lessons subscribe without coupling to internals.

export interface MathOSEvents {
  // Document lifecycle
  'document:loaded':   { docId: string }
  'document:reset':    { docId: string }
  // Object mutations
  'object:added':      { docId: string; objectId: string; kind: string }
  'object:updated':    { docId: string; objectId: string; kind: string }
  'object:removed':    { docId: string; objectId: string }
  // Property propagation — emitted once per property after recompute
  'property:changed':  { docId: string; key: string; value: unknown; prev: unknown }
  // Computation pipeline
  'compute:start':     { docId: string; trigger: string }
  'compute:step':      { docId: string; key: string; value: unknown }
  'compute:done':      { docId: string; steps: { key: string; value: unknown }[] }
  // Lesson adapter
  'lesson:check':      { docId: string; assertion: string; passed: boolean }
  'lesson:highlight':  { docId: string; targets: string[] }
  // Animation
  'animate:start':     { docId: string; propertyKey: string }
  'animate:frame':     { docId: string; propertyKey: string; t: number; value: unknown }
  'animate:done':      { docId: string; propertyKey: string }
}

export type EventName = keyof MathOSEvents

type Handler<K extends EventName> = (payload: MathOSEvents[K]) => void

export class EventBus {
  private listeners: Map<EventName, Set<Handler<EventName>>> = new Map()

  on<K extends EventName>(event: K, handler: Handler<K>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(handler as Handler<EventName>)
    return () => this.listeners.get(event)?.delete(handler as Handler<EventName>)
  }

  once<K extends EventName>(event: K, handler: Handler<K>): () => void {
    const off = this.on(event, (payload) => { handler(payload); off() })
    return off
  }

  emit<K extends EventName>(event: K, payload: MathOSEvents[K]): void {
    this.listeners.get(event)?.forEach(h => h(payload))
  }

  off<K extends EventName>(event: K, handler: Handler<K>): void {
    this.listeners.get(event)?.delete(handler as Handler<EventName>)
  }

  clear(): void {
    this.listeners.clear()
  }
}

// Singleton bus shared across the platform
export const bus = new EventBus()
