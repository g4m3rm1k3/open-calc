/**
 * VariableWatch — debugger-style variable inspector.
 *
 * Shows every in-scope binding at the current step, grouped by call frame
 * (innermost first) or flattened. Changed variables are highlighted with a
 * struck-through old value and the new value in amber — like a real debugger.
 */
import { useState } from 'react'

// ── Type system ───────────────────────────────────────────────────────────────

function getType(v) {
  if (v === null)      return 'null'
  if (v === undefined) return 'undefined'
  if (v !== null && typeof v === 'object' && '$ref' in v) return 'ref'
  return typeof v
}

function fmtVal(v, heap) {
  if (v === null)      return 'null'
  if (v === undefined) return 'undefined'
  if (typeof v === 'boolean') return String(v)
  if (typeof v === 'number')  return String(v)
  if (typeof v === 'string') {
    const s = v.length > 28 ? v.slice(0, 28) + '…' : v
    return `"${s}"`
  }
  if (typeof v === 'object' && '$ref' in v) {
    const obj = heap?.objects?.get(v.$ref)
    const type = obj?.type ?? 'Object'
    // For arrays, show length hint
    if (type === 'Array') {
      const len = obj?.properties?.get('length')
      return `→ Array[${len ?? '?'}] #${v.$ref}`
    }
    return `→ ${type} #${v.$ref}`
  }
  return JSON.stringify(v)
}

const TYPE_META = {
  number:    { label: 'num',   color: '#86efac' },
  string:    { label: 'str',   color: '#fbbf24' },
  boolean:   { label: 'bool',  color: '#f472b6' },
  null:      { label: 'null',  color: '#475569' },
  undefined: { label: 'undef', color: '#334155' },
  ref:       { label: 'ref',   color: '#818cf8' },
}
const typeMeta = t => TYPE_META[t] ?? TYPE_META['undefined']

// ── Diff builder ──────────────────────────────────────────────────────────────
// Returns { [frameIndex]: { [varName]: { old, new } } }

function buildDiffs(frames, prevFrames) {
  const result = {}
  frames.forEach((frame, fi) => {
    const prev     = prevFrames[fi]
    const locals   = frame.locals ?? {}
    const prevLocs = prev?.locals ?? {}
    const changed  = {}
    for (const [name, val] of Object.entries(locals)) {
      if (JSON.stringify(val) !== JSON.stringify(prevLocs[name])) {
        changed[name] = { old: prevLocs[name], new: val }
      }
    }
    if (Object.keys(changed).length) result[fi] = changed
  })
  return result
}

// ── Sub-components ────────────────────────────────────────────────────────────

function VarRow({ name, value, diff, heap, indent = 20 }) {
  const type    = getType(value)
  const meta    = typeMeta(type)
  const display = fmtVal(value, heap)
  const changed = !!diff

  return (
    <div style={{
      display:    'flex',
      alignItems: 'center',
      gap:        6,
      padding:    `2px ${indent + 6}px 2px ${indent}px`,
      background: changed ? 'rgba(245,158,11,0.07)' : 'transparent',
      borderLeft: `2px solid ${changed ? '#f59e0b' : 'transparent'}`,
      transition: 'background 0.15s',
      minWidth:   0,
    }}>
      {/* Name */}
      <span style={{
        fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
        color: '#7dd3fc', flexShrink: 0, minWidth: 72,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {name}
      </span>

      {/* Value — with old→new diff when changed */}
      {changed ? (
        <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
          <span style={{ color: '#334155', textDecoration: 'line-through', fontSize: 10, flexShrink: 0 }}>
            {fmtVal(diff.old, heap)}
          </span>
          <span style={{ color: '#475569', flexShrink: 0 }}>→</span>
          <span style={{ color: '#f59e0b', fontWeight: 600, overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {display}
          </span>
        </span>
      ) : (
        <span style={{
          flex: 1, minWidth: 0, fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
          color: meta.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {display}
        </span>
      )}

      {/* Type badge */}
      <span style={{
        fontSize: 8, padding: '1px 5px', borderRadius: 99, flexShrink: 0,
        background: meta.color + '18', color: meta.color, border: `1px solid ${meta.color}33`,
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        {meta.label}
      </span>
    </div>
  )
}

function FrameHeader({ frame, isActive }) {
  return (
    <div style={{
      display:    'flex',
      alignItems: 'center',
      gap:        6,
      padding:    '5px 10px',
      background: isActive ? '#0f172a' : 'transparent',
      borderLeft: `2px solid ${isActive ? '#6366f1' : '#1e293b'}`,
      marginTop:  isActive ? 0 : 4,
    }}>
      <span style={{
        fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
        color: isActive ? '#818cf8' : '#475569',
        fontWeight: isActive ? 700 : 400,
      }}>
        {frame.name ?? '(anonymous)'}
      </span>
      {isActive && (
        <span style={{
          fontSize: 8, padding: '1px 5px', borderRadius: 99,
          background: '#1e1b4b', color: '#818cf8',
          fontFamily: 'JetBrains Mono, monospace',
        }}>current</span>
      )}
      {frame.line && (
        <span style={{
          marginLeft: 'auto', fontSize: 8, color: '#334155',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          L{frame.line}
        </span>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function VariableWatch({ currentEvent, prevEvent, heapSnapshot, onShowEnvModel }) {
  const [flat, setFlat] = useState(false)

  // No execution yet
  if (!currentEvent) {
    return (
      <div style={{ padding: '16px 12px', color: '#475569', fontSize: 12 }}>
        Run code to see live variables.
      </div>
    )
  }

  const frames     = [...(currentEvent.stackSnapshot ?? [])].reverse()
  const prevFrames = [...(prevEvent?.stackSnapshot   ?? [])].reverse()
  const diffs      = buildDiffs(frames, prevFrames)

  // Count total changed variables this step
  const changedNames = [...new Set(
    Object.values(diffs).flatMap(d => Object.keys(d))
  )]

  // Flat view: all vars, innermost scope wins for duplicate names
  const flatVars = (() => {
    const seen   = new Set()
    const result = []
    frames.forEach((frame, fi) => {
      for (const [name, value] of Object.entries(frame.locals ?? {})) {
        if (!seen.has(name)) {
          seen.add(name)
          result.push({ name, value, diff: diffs[fi]?.[name] })
        }
      }
    })
    return result
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 10px', borderBottom: '1px solid #1e293b', flexShrink: 0,
      }}>
        <span style={{
          fontSize: 9, color: '#334155', letterSpacing: '.08em',
          fontFamily: 'JetBrains Mono, monospace',
        }}>VARIABLES</span>

        {/* Changed this step pill */}
        {changedNames.length > 0 && (
          <span style={{
            fontSize: 9, padding: '1px 7px', borderRadius: 99,
            background: '#78350f22', color: '#f59e0b', border: '1px solid #78350f44',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {changedNames.length} changed
          </span>
        )}

        {/* Grouped / Flat toggle */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2, background: '#0f172a',
          borderRadius: 4, padding: 2, border: '1px solid #1e293b' }}>
          {['grouped', 'flat'].map(mode => (
            <button key={mode} onClick={() => setFlat(mode === 'flat')} style={{
              padding: '2px 7px', borderRadius: 3, border: 'none', cursor: 'pointer',
              fontSize: 9, fontFamily: 'JetBrains Mono, monospace',
              background: (flat ? mode === 'flat' : mode === 'grouped') ? '#1e293b' : 'transparent',
              color:      (flat ? mode === 'flat' : mode === 'grouped') ? '#a5b4fc'  : '#475569',
            }}>{mode}</button>
          ))}
        </div>
      </div>

      {/* ── Variable list ── */}
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {frames.length === 0 ? (
          <div style={{ padding: '12px 12px', fontSize: 11, color: '#475569',
            fontFamily: 'JetBrains Mono, monospace' }}>
            Global scope — no function frames active.
          </div>
        ) : flat ? (
          /* ── Flat view ── */
          flatVars.length === 0 ? (
            <div style={{ padding: '12px 12px', fontSize: 11, color: '#475569',
              fontFamily: 'JetBrains Mono, monospace' }}>
              No local variables yet.
            </div>
          ) : (
            flatVars.map(({ name, value, diff }) => (
              <VarRow key={name} name={name} value={value} diff={diff}
                heap={heapSnapshot} indent={12} />
            ))
          )
        ) : (
          /* ── Grouped view ── */
          frames.map((frame, fi) => {
            const locals = Object.entries(frame.locals ?? {})
            return (
              <div key={fi}>
                <FrameHeader frame={frame} isActive={fi === 0} />
                {locals.length === 0 ? (
                  <div style={{ padding: '3px 12px 3px 24px', fontSize: 10,
                    color: '#334155', fontFamily: 'JetBrains Mono, monospace',
                    fontStyle: 'italic' }}>
                    no locals
                  </div>
                ) : (
                  locals.map(([name, value]) => (
                    <VarRow key={name} name={name} value={value}
                      diff={diffs[fi]?.[name]} heap={heapSnapshot} indent={22} />
                  ))
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ── Footer: env model link ── */}
      {onShowEnvModel && (
        <button onClick={onShowEnvModel} style={{
          background: 'none', border: 'none', borderTop: '1px solid #1e293b',
          cursor: 'pointer', padding: '6px 10px', textAlign: 'left',
          color: '#334155', fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
          flexShrink: 0,
        }}>
          → Show environment model (scope chain)
        </button>
      )}
    </div>
  )
}
