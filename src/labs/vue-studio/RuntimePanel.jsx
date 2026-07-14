import { useState, useEffect, useRef, useMemo } from 'react'
import { useThemeColors } from '../../hooks/useThemeColors.js'

// ── Dependency Graph ──────────────────────────────────────────────────────────

function DependencyGraph({ depGraph, activeFile, C }) {
  const { nodes, edges } = depGraph
  const border = C.border
  const muted  = C.muted
  const accent = C.blue
  const nodeBg = C.surface2
  const text   = C.text

  if (nodes.length <= 1) {
    return <div style={{ padding: '10px 14px', fontSize: 11, color: muted, fontStyle: 'italic' }}>Add more files to see the dependency graph.</div>
  }

  const entry = nodes.find(n => n.isEntry) ?? nodes[0]
  const depthMap = new Map([[entry.id, 0]])
  const queue = [entry.id]
  while (queue.length) {
    const cur = queue.shift()
    for (const e of edges) {
      if (e.from === cur && !depthMap.has(e.to)) { depthMap.set(e.to, depthMap.get(cur) + 1); queue.push(e.to) }
    }
  }
  const maxDepth = Math.max(...depthMap.values(), 0)
  for (const n of nodes) if (!depthMap.has(n.id)) depthMap.set(n.id, maxDepth + 1)

  const byDepth = new Map()
  for (const n of nodes) {
    const d = depthMap.get(n.id) ?? 0
    if (!byDepth.has(d)) byDepth.set(d, [])
    byDepth.get(d).push(n)
  }

  const nodeW = 90, nodeH = 28, colGap = 60, rowGap = 12
  const cols = [...byDepth.keys()].sort((a, b) => a - b)
  const maxRows = Math.max(...[...byDepth.values()].map(a => a.length))
  const totalW = cols.length * (nodeW + colGap) - colGap + 24
  const totalH = maxRows * (nodeH + rowGap) - rowGap + 24

  const pos = new Map()
  for (const col of cols) {
    const group = byDepth.get(col)
    const groupH = group.length * (nodeH + rowGap) - rowGap
    const startY = (totalH - groupH) / 2
    group.forEach((n, i) => pos.set(n.id, { x: 12 + col * (nodeW + colGap), y: startY + i * (nodeH + rowGap) }))
  }

  return (
    <svg width={totalW} height={Math.max(totalH, 60)} style={{ display: 'block', overflow: 'visible', maxWidth: '100%' }}>
      <defs>
        <marker id="dg-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill={muted} />
        </marker>
      </defs>
      {edges.map((e, i) => {
        const from = pos.get(e.from); const to = pos.get(e.to)
        if (!from || !to) return null
        const x1 = from.x + nodeW, y1 = from.y + nodeH / 2
        const x2 = to.x,           y2 = to.y  + nodeH / 2
        const mx = (x1 + x2) / 2
        return <path key={i} d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`} fill="none" stroke={muted} strokeWidth={1.5} markerEnd="url(#dg-arrow)" />
      })}
      {nodes.map(n => {
        const p = pos.get(n.id); if (!p) return null
        const isActive = n.id === activeFile
        return (
          <g key={n.id}>
            <rect x={p.x} y={p.y} width={nodeW} height={nodeH} rx={5}
              fill={isActive ? C.blueBg : nodeBg}
              stroke={isActive ? accent : border} strokeWidth={isActive ? 1.5 : 1} />
            <text x={p.x + nodeW / 2} y={p.y + nodeH / 2 + 1} textAnchor="middle" dominantBaseline="middle"
              fontSize={10} fontFamily="monospace" fill={isActive ? accent : text} fontWeight={n.isEntry ? 700 : 400}>
              {n.label}
            </text>
            {n.isEntry && <text x={p.x + nodeW / 2} y={p.y - 4} textAnchor="middle" fontSize={8} fill={muted}>entry</text>}
          </g>
        )
      })}
    </svg>
  )
}

// ── Reactive state ────────────────────────────────────────────────────────────

function ReactiveRow({ name, value, prevValue, updateCount, changed, typeLabel, C }) {
  const [highlighted, setHighlighted] = useState(false)
  const prevValueRef = useRef(value)
  const text   = C.text
  const muted  = C.muted
  const accent = C.blue
  const flash  = C.greenBg
  const rowBg  = C.bg
  const border = C.border

  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value
      setHighlighted(true)
      const t = setTimeout(() => setHighlighted(false), 600)
      return () => clearTimeout(t)
    }
  }, [value])

  const dv = typeof value    === 'object' ? JSON.stringify(value)    : String(value)
  const dp = typeof prevValue === 'object' ? JSON.stringify(prevValue) : String(prevValue)

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '90px 1fr auto',
      alignItems: 'center', gap: 8, padding: '4px 14px',
      borderBottom: `1px solid ${border}`,
      background: highlighted ? flash : rowBg,
      transition: 'background 0.3s', fontFamily: 'monospace', fontSize: 11,
    }}>
      <span style={{ color: accent, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      <span style={{ color: text }}>
        {changed && dp !== dv
          ? <><span style={{ color: muted, textDecoration: 'line-through', marginRight: 4 }}>{dp}</span>{dv}</>
          : dv}
        <span style={{ color: muted, fontSize: 10, marginLeft: 6 }}>{typeLabel}</span>
      </span>
      <span style={{ color: muted, fontSize: 10 }}>{updateCount > 0 ? `↑${updateCount}` : ''}</span>
    </div>
  )
}

function ReactiveState({ reactiveHistory, C }) {
  const muted = C.muted
  if (!reactiveHistory?.size) {
    return <div style={{ padding: '10px 14px', fontSize: 11, color: muted, fontStyle: 'italic' }}>Run your code — reactive values appear here.</div>
  }
  return (
    <div>
      {[...reactiveHistory.entries()].map(([key, { value, prevValue, updateCount }]) => {
        const changed = updateCount > 0 && String(value) !== String(prevValue)
        const typeLabel = Array.isArray(value) ? 'Array' : value === null ? 'null' : typeof value === 'object' ? 'Object' : typeof value === 'boolean' ? 'Boolean' : typeof value === 'number' ? 'Number' : 'String'
        return <ReactiveRow key={key} name={key} value={value} prevValue={prevValue} updateCount={updateCount} changed={changed} typeLabel={typeLabel} C={C} />
      })}
    </div>
  )
}

// ── Execution flow pipeline ───────────────────────────────────────────────────

const PIPELINE_STEPS = [
  { id: 'click',   label: 'Click',       triggerOn: ['click', 'updating', 'done'] },
  { id: 'handler', label: 'Handler',     triggerOn: ['updating', 'done'] },
  { id: 'state',   label: 'State ↑',     triggerOn: ['updating', 'done'] },
  { id: 'detect',  label: 'Vue detects', triggerOn: ['updating', 'done'] },
  { id: 'render',  label: 'Re-render',   triggerOn: ['done'] },
  { id: 'dom',     label: 'DOM patch',   triggerOn: ['done'] },
]

function parseVueFile(source) {
  if (!source) return { handlers: [], refs: [], computeds: [] }
  const handlers = []
  for (const [, ev, h] of source.matchAll(/[@:](\w+(?::\w+)?)="([^"]+)"/g)) {
    if (['class','style','key','src','href','alt','id','type','placeholder','value','disabled','checked'].includes(ev)) continue
    handlers.push({ event: ev, expr: h.trim() })
  }
  const refs = []
  for (const [, name, init] of source.matchAll(/const\s+(\w+)\s*=\s*ref\(([^)]*)\)/g)) refs.push({ name, init: init.trim() })
  const computeds = []
  for (const [, name, body] of source.matchAll(/const\s+(\w+)\s*=\s*computed\(\(\)\s*=>\s*([^\n)]+)/g)) computeds.push({ name, body: body.trim() })
  return { handlers, refs, computeds }
}

function generateStepExplanation(stepId, { reactiveHistory, componentTree, parsed, lastClick }) {
  const changed = [...(reactiveHistory?.entries() ?? [])].filter(([, { value, prevValue }]) => String(value) !== String(prevValue))
  const compName = componentTree?.name ?? 'App'

  switch (stepId) {
    case 'click': {
      const { tag, text } = lastClick ?? {}
      const clickHandlers = (parsed?.handlers ?? []).filter(h => h.event === 'click')
      let msg = tag ? `A \`<${tag}>\` was clicked` : 'User interaction detected'
      if (text) msg += ` ("${text.slice(0, 30)}")`
      if (clickHandlers.length) msg += `. Vue calls \`${clickHandlers[0].expr}\`.`
      else msg += `. Vue dispatches to any @click handler.`
      return msg
    }
    case 'handler': {
      const expr = (parsed?.handlers ?? []).filter(h => h.event === 'click')[0]?.expr
      if (expr) return `\`${expr}\` ran synchronously. Vue never intercepts your function — it just runs. The magic is inside: any \`ref.value = ...\` assignment triggers Vue's Proxy setter, which schedules a re-render.`
      return `The handler ran synchronously. Reactivity is triggered by \`.value\` assignments on refs inside the function, not by the function call itself.`
    }
    case 'state': {
      if (!changed.length) return `No reactive values changed — the handler ran but didn't mutate any \`ref\` or \`reactive()\` state. No re-render is scheduled.`
      const parts = changed.map(([name, { value, prevValue }]) => {
        const f = typeof prevValue === 'object' ? JSON.stringify(prevValue) : String(prevValue)
        const t = typeof value    === 'object' ? JSON.stringify(value)    : String(value)
        return `\`${name}\`: ${f} → ${t}`
      })
      const aff = (parsed?.computeds ?? []).filter(c => changed.some(([n]) => c.body?.includes(n)))
      let msg = parts.join('; ') + '.'
      if (aff.length) msg += ` The computed \`${aff[0].name}\` depends on this — its cache is now stale.`
      return msg
    }
    case 'detect': {
      const changedNames = changed.map(([n]) => n)
      if (changedNames.length) {
        const init = (parsed?.refs ?? []).find(r => r.name === changedNames[0])?.init
        return `Vue's Proxy intercepted the \`.value\` setter on \`${changedNames.join(', ')}\`${init !== undefined ? ` (originally \`ref(${init})\`)` : ''}. Every \`ref()\` is a Proxy — \`get\` tracks which templates depend on it, \`set\` notifies them. The re-render is queued as a microtask.`
      }
      return `Vue's Proxy system intercepted a reactive assignment. Reads record dependencies, writes trigger updates. Multiple changes in one handler are batched into a single re-render.`
    }
    case 'render': {
      if (changed.length) {
        const [name, { value }] = changed[0]
        const dv = typeof value === 'object' ? JSON.stringify(value) : String(value)
        return `\`${compName}\`'s render function ran again. The expression \`{{ ${name} }}\` now produces \`"${dv}"\`. Vue builds a new virtual DOM tree in memory — no real DOM is touched yet.`
      }
      return `\`${compName}\`'s render function ran and produced a new virtual DOM tree. This is a lightweight JavaScript object — building it is fast.`
    }
    case 'dom': {
      if (changed.length) {
        const [name, { value, prevValue }] = changed[0]
        const f = typeof prevValue === 'object' ? JSON.stringify(prevValue) : String(prevValue)
        const t = typeof value    === 'object' ? JSON.stringify(value)    : String(value)
        return `Vue diffed the virtual DOM. The text node for \`{{ ${name} }}\` changed from "${f}" to "${t}" — only that text node's \`textContent\` was updated. No element was created or removed. This targeted patch is why Vue stays fast even in large component trees.`
      }
      return `Vue applied the minimal DOM patch: only nodes that differ between the old and new virtual DOM are touched. Unchanged nodes are skipped entirely.`
    }
    default: return ''
  }
}

function ExecutionFlow({ execState, hasRun, reactiveHistory, componentTree, parsed, lastClick, C }) {
  const [openStep, setOpenStep] = useState(null)
  const muted    = C.hint
  const accent   = C.blue
  const border   = C.border
  const cardBg   = C.greenBg
  const cardText = C.text

  const displayState = execState ?? (hasRun ? 'done' : null)
  if (!displayState) return null

  const explanation = openStep ? generateStepExplanation(openStep, { reactiveHistory, componentTree, parsed, lastClick }) : null

  return (
    <div style={{ borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
      <div style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'nowrap', overflowX: 'auto' }}>
        {PIPELINE_STEPS.map((step, i) => {
          const active   = step.triggerOn.includes(displayState)
          const selected = openStep === step.id
          return (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <button
                onClick={() => setOpenStep(p => p === step.id ? null : step.id)}
                title="Click for explanation"
                style={{
                  padding: '3px 7px', borderRadius: 4, fontSize: 10, fontFamily: 'monospace',
                  border: `1px solid ${selected ? C.amber : active ? accent : muted}`,
                  color: selected ? C.amber : active ? accent : muted,
                  background: selected ? C.amberBg : active ? C.blueBg : 'transparent',
                  transition: 'all 0.15s', cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap',
                }}>
                {step.label}
              </button>
              {i < PIPELINE_STEPS.length - 1 && (
                <div style={{ color: active ? accent : muted, fontSize: 10, margin: '0 2px', transition: 'color 0.2s' }}>→</div>
              )}
            </div>
          )
        })}
      </div>
      {explanation && (
        <div style={{ margin: '0 14px 8px', padding: '8px 12px', background: cardBg, border: `1px solid ${C.greenBd}`, borderRadius: 6, fontSize: 11, color: cardText, lineHeight: 1.7 }}>
          <span style={{ fontWeight: 700, color: accent, marginRight: 6 }}>{PIPELINE_STEPS.find(s => s.id === openStep)?.label}</span>
          {explanation}
        </div>
      )}
    </div>
  )
}

// ── Tutor log ────────────────────────────────────────────────────────────────

function buildTutorEntry(execState, reactiveHistory, componentTree) {
  const changed = [...(reactiveHistory?.entries() ?? [])].filter(([, { value, prevValue }]) => String(value) !== String(prevValue))
  const compName = componentTree?.name ?? 'App'

  if (execState === 'click') return { tag: 'Interaction', text: 'User clicked. Vue\'s event system is dispatching to the @click handler.' }

  if (execState === 'updating') {
    if (!changed.length) return { tag: 'Handler', text: 'Handler ran. No reactive values were mutated — no re-render queued.' }
    const parts = changed.map(([n, { value, prevValue }]) => `${n}: ${typeof prevValue === 'object' ? JSON.stringify(prevValue) : prevValue} → ${typeof value === 'object' ? JSON.stringify(value) : value}`)
    return { tag: 'State', text: `${parts.join(', ')}. Vue's Proxy queued a re-render.` }
  }

  if (execState === 'done') {
    if (!changed.length) return null
    const [name, { value }] = changed[0]
    const dv = typeof value === 'object' ? JSON.stringify(value) : String(value)
    return { tag: 'DOM', text: `Patch applied. \`{{ ${name} }}\` → "${dv}". Only the changed text node was updated.` }
  }

  if (componentTree && !execState) {
    const stateKeys = [...(reactiveHistory?.keys() ?? [])]
    if (!stateKeys.length) return { tag: 'Mounted', text: `${compName} is live with no reactive state. Add ref() values to see them tracked.` }
    return { tag: 'Mounted', text: `${compName} is live. Tracking: ${stateKeys.join(', ')}. Interact with the preview.` }
  }

  return null
}

function TutorLog({ execState, reactiveHistory, componentTree, C }) {
  const [log, setLog] = useState([])
  const scrollRef = useRef(null)
  const lastKeyRef = useRef(null)

  useEffect(() => {
    const entry = buildTutorEntry(execState, reactiveHistory, componentTree)
    if (!entry) return
    const key = `${entry.tag}:${entry.text}`
    if (key === lastKeyRef.current) return
    lastKeyRef.current = key
    setLog(prev => [...prev.slice(-29), { ...entry, id: Date.now() }])
  }, [execState, reactiveHistory, componentTree])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [log])

  const border = C.border
  const muted  = C.muted
  const text   = C.text
  const tagColors = { Interaction: C.blue, Handler: C.purple, State: C.amber, DOM: C.green, Mounted: C.green }

  if (!log.length) {
    return <div style={{ padding: '10px 14px', fontSize: 11, color: muted, fontStyle: 'italic' }}>Run your code and interact with the preview — I\'ll explain what Vue does at each step.</div>
  }

  return (
    <div ref={scrollRef} style={{ height: '100%', overflowY: 'auto' }}>
      {log.map(entry => (
        <div key={entry.id} style={{ display: 'flex', gap: 10, padding: '6px 14px', borderBottom: `1px solid ${border}`, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: tagColors[entry.tag] ?? muted, flexShrink: 0, marginTop: 2, minWidth: 52 }}>
            {entry.tag}
          </span>
          <span style={{ fontSize: 11, color: text, lineHeight: 1.6 }}>{entry.text}</span>
        </div>
      ))}
    </div>
  )
}

// ── Log colors ────────────────────────────────────────────────────────────────

// Semantic per-level colors, theme-reactive via C (useThemeColors) rather
// than a fixed light/dark pair — log follows the muted text tone, the rest
// are the deliberately theme-invariant status colors from useThemeColors.
function logColor(level, C) {
  if (level === 'warn')  return C.amber
  if (level === 'error') return C.red
  if (level === 'info')  return C.blue
  return C.muted
}

// ── Component tree ────────────────────────────────────────────────────────────

function TreeNode({ node, C, depth = 0, changes = new Set(), path = '' }) {
  const [open, setOpen] = useState(true)
  const text   = C.text
  const muted  = C.muted
  const accent = C.blue
  const dataBg = C.bg
  const nodePath = path || node.name
  const didChange = changes.has(nodePath)
  const hasChildren = node.children?.length > 0
  const hasData = Object.keys(node.data ?? {}).length > 0

  return (
    <div style={{ marginLeft: depth * 12 }}>
      <div onClick={() => (hasChildren || hasData) && setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0', cursor: (hasChildren || hasData) ? 'pointer' : 'default' }}>
        <span style={{ fontSize: 10, color: muted, width: 10 }}>{(hasChildren || hasData) ? (open ? '▾' : '▸') : '·'}</span>
        <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: didChange ? C.amber : accent, background: didChange ? C.amberBg : 'transparent', padding: didChange ? '0 4px' : 0, borderRadius: 3, transition: 'all 0.3s' }}>
          &lt;{node.name}&gt;{didChange && <span style={{ fontSize: 9, marginLeft: 4, opacity: 0.7 }}>updated</span>}
        </span>
      </div>
      {open && (hasData || hasChildren) && (
        <div style={{ marginLeft: 14 }}>
          {hasData && Object.entries(node.data).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 6, fontSize: 11, fontFamily: 'monospace', padding: '1px 0', marginLeft: 6 }}>
              <span style={{ color: muted }}>{k}:</span>
              <span style={{ color: text, background: dataBg, padding: '0 4px', borderRadius: 3 }}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
            </div>
          ))}
          {hasChildren && node.children.map((child, i) => (
            <TreeNode key={i} node={child} C={C} depth={depth + 1} changes={changes} path={`${nodePath}/${child.name}:${i}`} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main bottom panel ─────────────────────────────────────────────────────────

export default function RuntimePanel({
  logs, componentTree, reactiveHistory, execState,
  onClearLogs,
  depGraph, treeChanges, timeline,
  milestone, files, activeFile, lastClick,
}) {
  const [activeTab, setActiveTab] = useState('tutor')
  const C = useThemeColors()

  const bg     = C.surface
  const border = C.border
  const muted  = C.muted
  const accent = C.blue
  const tabBg  = C.surface2

  const parsed = useMemo(() => parseVueFile(files?.[activeFile] ?? ''), [files, activeFile])
  const hasRun = timeline.length > 0 || !!componentTree
  const hasErrors = logs.some(l => l.level === 'error')
  const errorCount = logs.filter(l => l.level === 'error').length

  const tabs = [
    { id: 'tutor',    label: 'Vue Tutor' },
    { id: 'reactive', label: 'Reactive State' },
    { id: 'deps',     label: 'Dep Graph' },
    { id: 'tree',     label: 'Components' },
    { id: 'console',  label: `Console${logs.length ? ` (${logs.length})` : ''}` },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg, overflow: 'hidden' }}>

      {/* Pipeline — always visible */}
      <ExecutionFlow
        execState={execState}
        hasRun={hasRun}
        reactiveHistory={reactiveHistory}
        componentTree={componentTree}
        parsed={parsed}
        lastClick={lastClick}
        C={C}
      />

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${border}`, background: tabBg, flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '4px 12px', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', border: 'none', background: 'none', cursor: 'pointer',
            color: activeTab === t.id ? accent : muted,
            borderBottom: activeTab === t.id ? `2px solid ${accent}` : '2px solid transparent',
            transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
        <div style={{ flex: 1 }} />
        {/* Status */}
        <span style={{ fontSize: 10, color: hasErrors ? C.red : componentTree ? accent : muted, alignSelf: 'center', paddingRight: 12 }}>
          {hasErrors ? `✕ ${errorCount} error${errorCount !== 1 ? 's' : ''}` : componentTree ? '● Live' : 'Run to start'}
        </span>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {activeTab === 'tutor' && (
          <TutorLog execState={execState} reactiveHistory={reactiveHistory} componentTree={componentTree} C={C} />
        )}
        {activeTab === 'reactive' && (
          <ReactiveState reactiveHistory={reactiveHistory} C={C} />
        )}
        {activeTab === 'deps' && (
          <div style={{ padding: '10px 14px' }}>
            {depGraph && <DependencyGraph depGraph={depGraph} activeFile={activeFile} C={C} />}
          </div>
        )}
        {activeTab === 'tree' && (
          <div style={{ padding: '8px 12px' }}>
            {componentTree
              ? <TreeNode node={componentTree} C={C} changes={treeChanges} />
              : <div style={{ fontSize: 11, color: muted, fontStyle: 'italic' }}>Run to see the component tree.</div>}
          </div>
        )}
        {activeTab === 'console' && (
          <div style={{ fontFamily: 'monospace', fontSize: 11 }}>
            {logs.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 14px', borderBottom: `1px solid ${border}` }}>
                <button onClick={onClearLogs} style={{ padding: '2px 6px', fontSize: 10, color: muted, background: 'none', border: `1px solid ${border}`, borderRadius: 3, cursor: 'pointer' }}>Clear</button>
              </div>
            )}
            {logs.length === 0
              ? <div style={{ padding: '10px 14px', color: muted, fontStyle: 'italic' }}>No output.</div>
              : logs.map((entry, i) => {
                  const col = logColor(entry.level, C)
                  return (
                    <div key={i} style={{ padding: '4px 14px', borderBottom: `1px solid ${border}`, color: col, background: entry.level === 'error' ? C.redBg : entry.level === 'warn' ? C.amberBg : 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      <span style={{ opacity: 0.5, marginRight: 6, fontSize: 10 }}>{entry.level === 'warn' ? '⚠ ' : entry.level === 'error' ? '✕ ' : '› '}</span>
                      {entry.args.join(' ')}
                    </div>
                  )
                })
            }
          </div>
        )}
      </div>
    </div>
  )
}
