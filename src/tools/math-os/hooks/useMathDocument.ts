// ─── React Bridge ─────────────────────────────────────────────────────────────
// Subscribes a React component to a MathDocument living in the platform.
// Re-renders whenever any property in the document changes.
// Exposes typed mutation functions that go through the platform.

import { useState, useEffect, useCallback, useRef } from 'react'
import type { MathDocument, ObjectId, PropertyKey } from '../core/MathDocument'
import { platform as defaultPlatform, type MathOSPlatform, type Assertion } from '../core/MathOSPlatform'
import type { LessonConfig, LoadedWorkspace } from '../core/LessonAdapter'
import { loadWorkspace } from '../core/LessonAdapter'

export interface UseMathDocumentReturn {
  doc:         MathDocument
  tick:        number   // increments on every property change — use as dep for effects

  // Property access
  get:         (key: PropertyKey) => unknown
  getProp:     (objectId: ObjectId, property: string) => unknown

  // Mutations
  setVariable: (idOrName: string, value: number) => void
  addVariable: (name: string, value: number, unit?: string) => ObjectId
  addMatrix:   (values: number[][], label?: string) => ObjectId
  addVector:   (values: number[], label?: string) => ObjectId
  addTriangle: (known: Record<string, number>, label?: string) => ObjectId
  addDataset:  (values: number[], label?: string) => ObjectId
  addPolynomial:(expression: string) => ObjectId
  addFunction: (name: string, param: string, body: string) => ObjectId
  removeObject:(id: ObjectId) => void

  // Assessment
  check:       (assertion: Assertion) => boolean

  // Serialization
  serialize:   () => string
}

export function useMathDocument(
  doc: MathDocument,
  p: MathOSPlatform = defaultPlatform,
): UseMathDocumentReturn {
  const [tick, setTick] = useState(0)
  const docId = doc.meta.id

  useEffect(() => {
    const off = p.bus.on('property:changed', (e) => {
      if (e.docId === docId) setTick(t => t + 1)
    })
    return off
  }, [docId, p])

  const get     = useCallback((key: PropertyKey) => p.get(doc, key), [doc, p])
  const getProp = useCallback((id: ObjectId, prop: string) => p.getProperty(doc, id, prop), [doc, p])

  const setVariable  = useCallback((idOrName: string, value: number) => p.setVariable(doc, idOrName, value), [doc, p])
  const addVariable  = useCallback((name: string, value: number, unit?: string) => p.addVariable(doc, name, value, unit), [doc, p])
  const addMatrix    = useCallback((values: number[][], label?: string) => p.addMatrix(doc, values, label), [doc, p])
  const addVector    = useCallback((values: number[], label?: string) => p.addVector(doc, values, label), [doc, p])
  const addTriangle  = useCallback((known: Record<string, number>, label?: string) => p.addTriangle(doc, known, label), [doc, p])
  const addDataset   = useCallback((values: number[], label?: string) => p.addDataset(doc, values, label), [doc, p])
  const addPolynomial= useCallback((expression: string) => p.addPolynomial(doc, expression), [doc, p])
  const addFunction  = useCallback((name: string, param: string, body: string) => p.addFunction(doc, name, param, body), [doc, p])
  const removeObject = useCallback((id: ObjectId) => p.removeObject(doc, id), [doc, p])
  const check        = useCallback((assertion: Assertion) => p.check(doc, assertion), [doc, p])
  const serialize    = useCallback(() => p.serialize(doc), [doc, p])

  return {
    doc, tick,
    get, getProp,
    setVariable, addVariable, addMatrix, addVector,
    addTriangle, addDataset, addPolynomial, addFunction,
    removeObject, check, serialize,
  }
}

// ─── Single-property subscription ────────────────────────────────────────────
// Re-renders only when the specific property changes.

export function useProperty<T = unknown>(
  doc: MathDocument,
  key: PropertyKey,
  p: MathOSPlatform = defaultPlatform,
): T | undefined {
  const [value, setValue] = useState<T | undefined>(() => p.get(doc, key) as T | undefined)

  useEffect(() => {
    // Sync initial value when key or doc changes
    setValue(p.get(doc, key) as T | undefined)
    const off = p.bus.on('property:changed', (e) => {
      if (e.docId === doc.meta.id && e.key === key) setValue(e.value as T)
    })
    return off
  }, [doc, key, p])

  return value
}

// ─── Workspace hook ───────────────────────────────────────────────────────────
// Builds a MathDocument from a LessonConfig, keeps it stable across renders.

export function useWorkspace(
  config: LessonConfig,
  p: MathOSPlatform = defaultPlatform,
): LoadedWorkspace & UseMathDocumentReturn {
  const ws = useRef<LoadedWorkspace | null>(null)
  if (!ws.current) ws.current = loadWorkspace(config, p)

  const bridge = useMathDocument(ws.current.doc, p)

  return {
    ...ws.current,
    ...bridge,
    reset: () => { ws.current!.reset(); bridge.setVariable }  // reset triggers re-render via bus
  }
}
