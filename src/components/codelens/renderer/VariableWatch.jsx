/**
 * VariableWatch — debugger-style variable inspector with optional per-variable
 * sparkline timelines showing how each value changes across all execution steps.
 */
import { useState, useMemo, useCallback, useRef } from 'react'

// ── Type helpers ──────────────────────────────────────────────────────────────

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
    const obj  = heap?.objects?.get(v.$ref)
    const type = obj?.type ?? 'Object'
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

// ── Timeline builder ──────────────────────────────────────────────────────────
// For each "frameName:varName" key, records the variable's value at every step
// where it exists — taking the innermost frame when the function is recursive.

function buildTimelines(events) {
  const map = new Map()
  events.forEach((evt, i) => {
    const frames = [...(evt.stackSnapshot ?? [])].reverse() // innermost first
    const seenNames = new Set()
    for (const frame of frames) {
      const fname = frame.name ?? '__global__'
      if (seenNames.has(fname)) continue   // only innermost instance per step
      seenNames.add(fname)
      for (const [vname, value] of Object.entries(frame.locals ?? {})) {
        const key = `${fname}:${vname}`
        if (!map.has(key)) map.set(key, [])
        map.get(key).push({ step: i, value })
      }
    }
  })
  return map
}

// ── Diff builder ──────────────────────────────────────────────────────────────

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

// ── VarTimeline ───────────────────────────────────────────────────────────────

const TL_H      = 18
const TL_PAD    = 3

function numericSparkline(points, totalSteps, step) {
  const vals   = points.map(p => p.value)
  const minV   = Math.min(...vals)
  const maxV   = Math.max(...vals)
  const range  = maxV - minV || 1

  // Build polyline points in viewBox coordinates
  const ptStr = points
    .map(p => {
      const x = p.step + 0.5
      const y = TL_H - TL_PAD - ((p.value - minV) / range) * (TL_H - TL_PAD * 2)
      return `${x},${y}`
    })
    .join(' ')

  // Find nearest point to current step for the cursor dot
  const nearest = points.reduce((best, p) =>
    Math.abs(p.step - step) < Math.abs(best.step - step) ? p : best
  , points[0])
  const dotY = nearest
    ? TL_H - TL_PAD - ((nearest.value - minV) / range) * (TL_H - TL_PAD * 2)
    : TL_H / 2

  return (
    <>
      <polyline points={ptStr} fill="none" stroke="#6366f1" strokeWidth={1} opacity={0.8} />
      {/* min/max baselines */}
      <line x1={0} y1={TL_H - TL_PAD} x2={totalSteps} y2={TL_H - TL_PAD}
        stroke="#1e293b" strokeWidth={0.5} />
      {/* cursor */}
      <line x1={step + 0.5} y1={0} x2={step + 0.5} y2={TL_H}
        stroke="white" strokeWidth={0.8} opacity={0.45} />
      {/* active dot */}
      {nearest && (
        <circle cx={nearest.step + 0.5} cy={dotY} r={1.8} fill="#fbbf24" />
      )}
    </>
  )
}

function booleanTimeline(points, totalSteps, step) {
  const segments = []
  for (let i = 0; i < points.length; i++) {
    const start = points[i].step
    const end   = i + 1 < points.length ? points[i + 1].step : totalSteps
    segments.push({ start, end, val: points[i].value })
  }
  return (
    <>
      {segments.map((seg, i) => (
        <rect key={i}
          x={seg.start} y={TL_PAD}
          width={seg.end - seg.start} height={TL_H - TL_PAD * 2}
          fill={seg.val ? '#4ade8044' : '#f8717144'}
          stroke={seg.val ? '#4ade80' : '#f87171'}
          strokeWidth={0.4}
        />
      ))}
      <line x1={step + 0.5} y1={0} x2={step + 0.5} y2={TL_H}
        stroke="white" strokeWidth={0.8} opacity={0.45} />
    </>
  )
}

function stringTimeline(points, totalSteps, step) {
  // Assign a stable color to each unique string value
  const unique = [...new Set(points.map(p => p.value))]
  const palette = ['#818cf8','#34d399','#fbbf24','#f472b6','#60a5fa','#a78bfa','#fb923c']
  const colorOf = v => palette[unique.indexOf(v) % palette.length]

  const segments = []
  for (let i = 0; i < points.length; i++) {
    const start = points[i].step
    const end   = i + 1 < points.length ? points[i + 1].step : totalSteps
    segments.push({ start, end, val: points[i].value })
  }
  return (
    <>
      {segments.map((seg, i) => (
        <rect key={i}
          x={seg.start} y={TL_PAD}
          width={seg.end - seg.start} height={TL_H - TL_PAD * 2}
          fill={colorOf(seg.val) + '55'}
          stroke={colorOf(seg.val)}
          strokeWidth={0.4}
        />
      ))}
      <line x1={step + 0.5} y1={0} x2={step + 0.5} y2={TL_H}
        stroke="white" strokeWidth={0.8} opacity={0.45} />
    </>
  )
}

function VarTimeline({ points, totalSteps, step, onSeek, typeColor }) {
  const svgRef = useRef(null)

  const seekAt = useCallback((e) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect || totalSteps === 0) return
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    onSeek(Math.round(ratio * (totalSteps - 1)))
  }, [totalSteps, onSeek])

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    seekAt(e)
    const onMove = ev => seekAt(ev)
    const onUp   = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [seekAt])

  if (!points?.length || totalSteps === 0) return null

  const firstType = typeof points[0].value
  let content = null
  if (firstType === 'number') {
    content = numericSparkline(points, totalSteps, step)
  } else if (firstType === 'boolean') {
    content = booleanTimeline(points, totalSteps, step)
  } else if (firstType === 'string') {
    content = stringTimeline(points, totalSteps, step)
  } else {
    // ref / null / etc — show activity blips
    content = (
      <>
        {points.map((p, i) => (
          <rect key={i} x={p.step} y={TL_PAD} width={1} height={TL_H - TL_PAD * 2}
            fill={typeColor ?? '#818cf8'} opacity={0.6} />
        ))}
        <line x1={step + 0.5} y1={0} x2={step + 0.5} y2={TL_H}
          stroke="white" strokeWidth={0.8} opacity={0.45} />
      </>
    )
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${totalSteps} ${TL_H}`}
      preserveAspectRatio="none"
      width="100%"
      height={TL_H}
      style={{ display: 'block', cursor: 'col-resize', background: '#0a0f1e' }}
      onMouseDown={onMouseDown}
    >
      {content}
    </svg>
  )
}

// ── VarRow ────────────────────────────────────────────────────────────────────

function VarRow({ name, value, diff, heap, indent = 20, timeline, step, onSeek, totalSteps, showTimeline }) {
  const type    = getType(value)
  const meta    = typeMeta(type)
  const display = fmtVal(value, heap)
  const changed = !!diff

  return (
    <div>
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
        <span style={{
          fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
          color: '#7dd3fc', flexShrink: 0, minWidth: 72,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
        </span>

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

        <span style={{
          fontSize: 8, padding: '1px 5px', borderRadius: 99, flexShrink: 0,
          background: meta.color + '18', color: meta.color, border: `1px solid ${meta.color}33`,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {meta.label}
        </span>
      </div>

      {/* Sparkline */}
      {showTimeline && timeline?.length > 1 && (
        <div style={{ paddingLeft: indent, paddingRight: indent + 6, paddingBottom: 3 }}>
          <VarTimeline
            points={timeline}
            totalSteps={totalSteps}
            step={step}
            onSeek={onSeek}
            typeColor={meta.color}
          />
        </div>
      )}
    </div>
  )
}

// ── FrameHeader ───────────────────────────────────────────────────────────────

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

export default function VariableWatch({
  currentEvent, prevEvent, heapSnapshot,
  events, step, onSeek,
  onShowEnvModel,
}) {
  const [flat,          setFlat]          = useState(false)
  const [showTimelines, setShowTimelines] = useState(false)

  // Pre-compute timelines for all variables across all steps
  const timelines = useMemo(
    () => events?.length ? buildTimelines(events) : new Map(),
    [events],
  )

  const totalSteps = events?.length ?? 0

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

  const changedNames = [...new Set(
    Object.values(diffs).flatMap(d => Object.keys(d))
  )]

  const flatVars = (() => {
    const seen   = new Set()
    const result = []
    frames.forEach((frame, fi) => {
      for (const [name, value] of Object.entries(frame.locals ?? {})) {
        if (!seen.has(name)) {
          seen.add(name)
          const fname = frame.name ?? '__global__'
          result.push({ name, value, diff: diffs[fi]?.[name], fname })
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

        {changedNames.length > 0 && (
          <span style={{
            fontSize: 9, padding: '1px 7px', borderRadius: 99,
            background: '#78350f22', color: '#f59e0b', border: '1px solid #78350f44',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {changedNames.length} changed
          </span>
        )}

        {/* Timeline toggle */}
        <button
          onClick={() => setShowTimelines(t => !t)}
          title="Toggle variable timelines"
          style={{
            background: showTimelines ? '#1e293b' : 'transparent',
            border: `1px solid ${showTimelines ? '#6366f1' : '#1e293b'}`,
            borderRadius: 4, padding: '2px 6px', cursor: 'pointer',
            color: showTimelines ? '#a5b4fc' : '#475569',
            fontSize: 9, fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          ∿ timeline
        </button>

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
          flatVars.length === 0 ? (
            <div style={{ padding: '12px 12px', fontSize: 11, color: '#475569',
              fontFamily: 'JetBrains Mono, monospace' }}>
              No local variables yet.
            </div>
          ) : (
            flatVars.map(({ name, value, diff, fname }) => (
              <VarRow key={name} name={name} value={value} diff={diff}
                heap={heapSnapshot} indent={12}
                timeline={timelines.get(`${fname}:${name}`)}
                step={step} onSeek={onSeek} totalSteps={totalSteps}
                showTimeline={showTimelines}
              />
            ))
          )
        ) : (
          frames.map((frame, fi) => {
            const fname  = frame.name ?? '__global__'
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
                      diff={diffs[fi]?.[name]} heap={heapSnapshot} indent={22}
                      timeline={timelines.get(`${fname}:${name}`)}
                      step={step} onSeek={onSeek} totalSteps={totalSteps}
                      showTimeline={showTimelines}
                    />
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
