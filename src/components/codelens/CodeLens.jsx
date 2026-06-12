import { useState, useCallback, useEffect, useRef } from 'react'
import Editor, { useMonaco } from '@monaco-editor/react'
import { buildProgramModel } from './parser/jsParser.js'
import { run as runInterpreter } from './interpreter/interpreter.js'
import { EXPLAIN } from './eventStream.js'
import { buildHeapSnapshot } from './renderer/heapSnapshot.js'
import HeapGraph from './renderer/HeapGraph.jsx'
import { setupOpenCalcMonaco } from '../../utils/monacoThemes.js'
import {
  ChevronRight, ChevronDown, Code2, Boxes, Braces, ArrowLeft,
  Zap, Play, StepForward, StepBack, SkipForward, Terminal,
  Palette, Info, Network,
} from 'lucide-react'

// ── Theme config ──────────────────────────────────────────────────────────────

const THEMES = [
  { id: 'monokai',        label: 'Monokai',      monaco: 'monokai' },
  { id: 'open-calc-dark', label: 'UpSkillOS',    monaco: 'open-calc-dark' },
  { id: 'dracula',        label: 'Dracula',      monaco: 'dracula' },
  { id: 'nord-dark',      label: 'Nord',         monaco: 'nord-dark' },
  { id: 'tokyo-night',    label: 'Tokyo Night',  monaco: 'tokyo-night' },
  { id: 'one-dark',       label: 'One Dark',     monaco: 'one-dark' },
]

const STARTER = `function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

class Node {
  constructor(value) {
    this.value = value
    this.next = null
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.size = 0
  }

  push(value) {
    const node = new Node(value)
    node.next = this.head
    this.head = node
    this.size++
  }
}

console.log('fib(10):', fibonacci(10))

const list = new LinkedList()
list.push(1)
list.push(2)
list.push(3)
console.log('List size:', list.size)

const nums = [3, 1, 4, 1, 5, 9, 2, 6]
const result = nums.filter(x => x > 3).map(x => x * 2)
console.log('Result:', result)
`

// ── Helpers ───────────────────────────────────────────────────────────────────

function Panel({ title, icon: Icon, children, badge, style }) {
  return (
    <div style={{
      background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10,
      display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0,
      ...style,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 12px', borderBottom: '1px solid #1e293b',
        background: '#0a0f1e', flexShrink: 0,
      }}>
        {Icon && <Icon size={13} color="#818cf8" />}
        <span style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', letterSpacing: '.02em' }}>{title}</span>
        {badge != null && (
          <span style={{
            marginLeft: 'auto', fontSize: 10,
            background: '#1e293b', color: '#7dd3fc',
            padding: '1px 6px', borderRadius: 99,
          }}>{badge}</span>
        )}
      </div>
      <div style={{ overflow: 'auto', flex: 1, padding: 10 }}>
        {children}
      </div>
    </div>
  )
}

function Btn({ onClick, disabled, title, children, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: active ? '#312e81' : '#1e293b',
        border: `1px solid ${active ? '#6366f1' : '#334155'}`,
        color: disabled ? '#475569' : active ? '#a5b4fc' : '#cbd5e1',
        borderRadius: 6, padding: '4px 10px',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 12, fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 5,
        transition: 'all 0.12s',
      }}
    >
      {children}
    </button>
  )
}

function ComplexityBadge({ complexity }) {
  const color =
    complexity === 'O(1)'           ? '#86efac' :
    complexity?.includes('log')     ? '#7dd3fc' :
    complexity === 'O(n)'           ? '#fbbf24' :
    complexity?.includes('recursive') ? '#fb923c' :
    '#f87171'
  return (
    <span style={{
      fontSize: 10, padding: '1px 7px', borderRadius: 99,
      background: `${color}18`, color, border: `1px solid ${color}44`,
      fontFamily: 'JetBrains Mono, monospace',
    }}>{complexity}</span>
  )
}

const TOKEN_COLORS = {
  keyword: '#818cf8', name: '#7dd3fc', num: '#86efac',
  string: '#fbbf24', punctuation: '#94a3b8',
}
function tokenColor(type) {
  for (const [k, v] of Object.entries(TOKEN_COLORS)) if (type.includes(k)) return v
  return '#cbd5e1'
}

// ── AST viewer ────────────────────────────────────────────────────────────────

function ASTNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2)
  if (!node || typeof node !== 'object') return null
  const children = Object.entries(node).filter(([k, v]) => {
    if (['type','start','end','loc','sourceType'].includes(k)) return false
    if (Array.isArray(v)) return v.some(c => c && typeof c.type === 'string')
    return v && typeof v.type === 'string'
  })
  const label = [
    node.type,
    node.name ? ` ${node.name}` : '',
    node.id?.name ? ` ${node.id.name}` : '',
    node.operator ? ` ${node.operator}` : '',
    node.kind ? ` (${node.kind})` : '',
    node.raw != null ? ` = ${node.raw}` : '',
  ].join('')
  const hasChildren = children.length > 0
  return (
    <div style={{ marginLeft: depth * 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
      <div
        onClick={() => hasChildren && setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 3,
          cursor: hasChildren ? 'pointer' : 'default',
          padding: '1px 3px', borderRadius: 3,
          color: depth === 0 ? '#818cf8' : depth === 1 ? '#7dd3fc' : depth === 2 ? '#86efac' : '#e2e8f0',
        }}
      >
        {hasChildren ? (open ? <ChevronDown size={10} /> : <ChevronRight size={10} />) : <span style={{ width: 10 }} />}
        <span>{label}</span>
      </div>
      {open && hasChildren && children.map(([key, val]) => {
        const items = Array.isArray(val) ? val.filter(c => c?.type) : [val]
        return (
          <div key={key}>
            <div style={{ marginLeft: (depth+1)*12+13, fontSize: 10, color: '#475569', padding: '1px 0' }}>{key}</div>
            {items.map((child, i) => <ASTNode key={i} node={child} depth={depth + 2} />)}
          </div>
        )
      })}
    </div>
  )
}

// ── Event explanation card ────────────────────────────────────────────────────

function EventCard({ event, active }) {
  const explain = EXPLAIN[event.type]?.(event) ?? { summary: event.type, why: '', concept: '' }
  return (
    <div style={{
      padding: '7px 10px', borderRadius: 7, marginBottom: 4,
      background: active ? '#1e1b4b' : '#0f172a',
      border: `1px solid ${active ? '#4338ca' : '#1e293b'}`,
      cursor: 'default',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: explain.why ? 4 : 0 }}>
        <span style={{
          fontSize: 10, padding: '1px 6px', borderRadius: 99,
          background: '#1e293b', color: '#818cf8',
          fontFamily: 'JetBrains Mono, monospace', flexShrink: 0,
        }}>{event.type}</span>
        {event.sourceLocation?.line && (
          <span style={{ fontSize: 10, color: '#475569' }}>L{event.sourceLocation.line}</span>
        )}
        {explain.concept && (
          <span style={{
            marginLeft: 'auto', fontSize: 10, color: '#6366f1',
            background: '#1e1b4b', padding: '1px 6px', borderRadius: 99,
          }}>{explain.concept}</span>
        )}
      </div>
      <div style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace', marginBottom: explain.why ? 3 : 0 }}>
        {explain.summary}
      </div>
      {explain.why && (
        <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
          {explain.why}
        </div>
      )}
    </div>
  )
}

// ── Stack frame display ───────────────────────────────────────────────────────

function StackFrame({ frame, depth }) {
  const [open, setOpen] = useState(depth === 0)
  const locals = Object.entries(frame.locals ?? {})
  return (
    <div style={{
      marginBottom: 4, borderRadius: 6, overflow: 'hidden',
      border: `1px solid ${depth === 0 ? '#4338ca' : '#1e293b'}`,
    }}>
      <div
        onClick={() => locals.length > 0 && setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 8px',
          background: depth === 0 ? '#1e1b4b' : '#0f172a',
          cursor: locals.length > 0 ? 'pointer' : 'default',
        }}
      >
        {locals.length > 0 ? (open ? <ChevronDown size={11} /> : <ChevronRight size={11} />) : <span style={{ width: 11 }} />}
        <span style={{ fontSize: 12, color: '#a5b4fc', fontFamily: 'JetBrains Mono, monospace' }}>
          {frame.name}
        </span>
        {frame.line && <span style={{ fontSize: 10, color: '#475569' }}>L{frame.line}</span>}
        {depth === 0 && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#6366f1' }}>← current</span>}
      </div>
      {open && locals.length > 0 && (
        <div style={{ padding: '5px 8px', background: '#080c14' }}>
          {locals.map(([name, value]) => (
            <div key={name} style={{
              display: 'flex', gap: 8, fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace', marginBottom: 2,
            }}>
              <span style={{ color: '#7dd3fc', minWidth: 80 }}>{name}</span>
              <span style={{ color: '#86efac' }}>{JSON.stringify(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CodeLens({ onBack, initialCode }) {
  const [source, setSource]         = useState(initialCode ?? STARTER)
  const [model, setModel]           = useState(null)
  const [execution, setExecution]   = useState(null)
  const [step, setStep]             = useState(0)
  const [running, setRunning]       = useState(false)
  const [tab, setTab]               = useState('structure')
  const [rightTab, setRightTab]     = useState('execution')
  const [theme, setTheme]           = useState('monokai')
  const [showThemes, setShowThemes] = useState(false)
  const eventListRef                = useRef(null)
  const editorRef                   = useRef(null)
  const decorRef                    = useRef([])
  const monaco                      = useMonaco()

  // Parse live as we type
  useEffect(() => { setModel(buildProgramModel(source)) }, [])
  useEffect(() => {
    const id = setTimeout(() => setModel(buildProgramModel(source)), 400)
    return () => clearTimeout(id)
  }, [source])

  // Source line highlighting — update Monaco decoration on every step
  useEffect(() => {
    const ed = editorRef.current
    if (!ed || !monaco) return
    const line = currentEvent?.sourceLocation?.line
    if (!line) {
      decorRef.current = ed.deltaDecorations(decorRef.current, [])
      return
    }
    decorRef.current = ed.deltaDecorations(decorRef.current, [{
      range: new monaco.Range(line, 1, line, 1),
      options: {
        isWholeLine: true,
        className: 'cl-exec-line',
        overviewRulerColor: '#6366f1',
      }
    }])
    ed.revealLineInCenterIfOutsideViewport(line)
  })

  // Auto-scroll event list to current step
  useEffect(() => {
    if (!eventListRef.current) return
    const active = eventListRef.current.querySelector('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [step])

  const handleRun = useCallback(() => {
    setRunning(true)
    setTimeout(() => {
      try {
        const result = runInterpreter(source)
        setExecution(result)
        setStep(0)
        setRightTab('execution')
      } finally {
        setRunning(false)
      }
    }, 0)
  }, [source])

  const totalSteps = execution?.events?.length ?? 0
  const currentEvent = execution?.events?.[step] ?? null

  const TABS = [
    { id: 'structure', label: 'Structure', icon: Boxes },
    { id: 'tokens',    label: 'Tokens',    icon: Zap },
    { id: 'ast',       label: 'AST',       icon: Braces },
  ]
  const heapSnapshot = execution
    ? buildHeapSnapshot(execution.events, step)
    : null

  const RTABS = [
    { id: 'execution', label: 'Events',  icon: Play },
    { id: 'heap',      label: 'Heap',    icon: Network },
    { id: 'stack',     label: 'Stack',   icon: Info },
    { id: 'output',    label: 'Output',  icon: Terminal },
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#080c14', color: '#e2e8f0',
    }}>
      <style>{`
        .cl-exec-line {
          background: rgba(99,102,241,0.14) !important;
          border-left: 3px solid #6366f1 !important;
        }
      `}</style>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 14px', borderBottom: '1px solid #1e293b',
        background: '#0a0f1e', flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#475569', display: 'flex', alignItems: 'center',
        }}>
          <ArrowLeft size={16} />
        </button>
        <Code2 size={17} color="#818cf8" />
        <span style={{ fontWeight: 700, fontSize: 14 }}>CodeLens</span>
        <span style={{ fontSize: 12, color: '#475569' }}>· Execution Visualizer</span>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme picker */}
          <div style={{ position: 'relative' }}>
            <Btn onClick={() => setShowThemes(v => !v)} active={showThemes} title="Editor theme">
              <Palette size={12} />
              {THEMES.find(t => t.id === theme)?.label ?? 'Theme'}
            </Btn>
            {showThemes && (
              <div style={{
                position: 'absolute', top: '110%', right: 0, zIndex: 100,
                background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
                padding: 4, minWidth: 140,
              }}>
                {THEMES.map(t => (
                  <div
                    key={t.id}
                    onClick={() => { setTheme(t.id); setShowThemes(false) }}
                    style={{
                      padding: '6px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 12,
                      background: theme === t.id ? '#1e293b' : 'transparent',
                      color: theme === t.id ? '#a5b4fc' : '#cbd5e1',
                    }}
                  >
                    {t.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Run button */}
          <Btn onClick={handleRun} disabled={running} title="Run code (⌘↵)">
            <Play size={12} />
            {running ? 'Running…' : 'Run'}
          </Btn>
        </div>

        {model?.error && (
          <span style={{
            fontSize: 11, background: '#7f1d1d', color: '#fca5a5',
            padding: '2px 8px', borderRadius: 5,
          }}>
            L{model.error.line}: {model.error.message}
          </span>
        )}
      </div>

      {/* ── Step controls (only when execution exists) ── */}
      {execution && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderBottom: '1px solid #1e293b',
          background: '#080c14', flexShrink: 0,
        }}>
          <Btn onClick={() => setStep(0)} disabled={step === 0} title="Go to start">
            <SkipForward size={12} style={{ transform: 'scaleX(-1)' }} />
          </Btn>
          <Btn onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} title="Step back">
            <StepBack size={12} /> Back
          </Btn>
          <Btn onClick={() => setStep(s => Math.min(totalSteps - 1, s + 1))} disabled={step >= totalSteps - 1} title="Step forward">
            <StepForward size={12} /> Step
          </Btn>
          <Btn onClick={() => setStep(totalSteps - 1)} disabled={step >= totalSteps - 1} title="Go to end">
            <SkipForward size={12} />
          </Btn>

          <div style={{
            flex: 1, marginLeft: 8,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <input
              type="range" min={0} max={totalSteps - 1} value={step}
              onChange={e => setStep(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#6366f1' }}
            />
            <span style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>
              {step + 1} / {totalSteps}
            </span>
          </div>

          {execution.error && (
            <span style={{ fontSize: 11, color: '#f87171' }}>
              {execution.error.type}: {execution.error.message}
            </span>
          )}
        </div>
      )}

      {/* ── Body ── */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: '1fr 320px 320px',
        gap: 10, padding: 10, minHeight: 0,
      }}>
        {/* Left: editor + static analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
          {/* Editor */}
          <div style={{
            flex: 2, background: '#0f172a', border: '1px solid #1e293b',
            borderRadius: 10, overflow: 'hidden', minHeight: 0,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 12px', borderBottom: '1px solid #1e293b',
              background: '#0a0f1e',
            }}>
              <Code2 size={13} color="#818cf8" />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>Source</span>
              <span style={{ fontSize: 10, color: '#475569', marginLeft: 'auto' }}>JavaScript</span>
            </div>
            <div style={{ height: 'calc(100% - 33px)' }}>
              <Editor
                height="100%"
                language="javascript"
                value={source}
                onChange={v => setSource(v ?? '')}
                theme={THEMES.find(t => t.id === theme)?.monaco ?? 'monokai'}
                beforeMount={setupOpenCalcMonaco}
                onMount={ed => { editorRef.current = ed }}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  fontFamily: 'JetBrains Mono, monospace',
                  padding: { top: 10 },
                }}
              />
            </div>
          </div>

          {/* Static analysis tabs */}
          <div style={{ flex: 1, minHeight: 120, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{
              display: 'flex', gap: 4, background: '#0f172a',
              borderRadius: 7, padding: 3, border: '1px solid #1e293b', flexShrink: 0,
            }}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  padding: '4px 0', borderRadius: 5, border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 600,
                  background: tab === id ? '#1e293b' : 'transparent',
                  color: tab === id ? '#818cf8' : '#64748b',
                }}>
                  <Icon size={12} />{label}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {tab === 'structure' && <StructureView model={model} />}
              {tab === 'tokens'    && <TokensView model={model} />}
              {tab === 'ast'       && <AstView model={model} />}
            </div>
          </div>
        </div>

        {/* Middle: event stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
          <div style={{
            display: 'flex', gap: 4, background: '#0f172a',
            borderRadius: 7, padding: 3, border: '1px solid #1e293b', flexShrink: 0,
          }}>
            {RTABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setRightTab(id)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                padding: '4px 0', borderRadius: 5, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600,
                background: rightTab === id ? '#1e293b' : 'transparent',
                color: rightTab === id ? '#818cf8' : '#64748b',
              }}>
                <Icon size={12} />{label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: rightTab === 'heap' ? 'hidden' : 'auto' }} ref={eventListRef}>
            {rightTab === 'execution' && (
              execution ? (
                execution.events.length === 0
                  ? <span style={{ color: '#475569', fontSize: 12 }}>No events.</span>
                  : execution.events.map((evt, i) => (
                      <div key={i} data-active={i === step ? 'true' : 'false'}>
                        <EventCard event={evt} active={i === step} />
                      </div>
                    ))
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', height: '100%', gap: 10,
                }}>
                  <Play size={28} color="#4338ca" />
                  <span style={{ fontSize: 13, color: '#64748b', textAlign: 'center' }}>
                    Press Run to execute the code<br />and see the event stream here.
                  </span>
                </div>
              )
            )}
            {rightTab === 'heap' && (
              <HeapGraph snapshot={heapSnapshot} />
            )}
            {rightTab === 'stack' && (
              currentEvent ? (
                currentEvent.stackSnapshot?.length > 0 ? (
                  [...currentEvent.stackSnapshot].reverse().map((frame, i) => (
                    <StackFrame key={i} frame={frame} depth={currentEvent.stackSnapshot.length - 1 - i} />
                  ))
                ) : (
                  <span style={{ color: '#475569', fontSize: 12 }}>Global scope (no function frames)</span>
                )
              ) : (
                <span style={{ color: '#475569', fontSize: 12 }}>Run code first.</span>
              )
            )}
            {rightTab === 'output' && (
              execution?.output?.length > 0 ? (
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                  {execution.output.map((line, i) => (
                    <div key={i} style={{
                      padding: '3px 8px', borderRadius: 4, marginBottom: 2,
                      background: line.startsWith('[error]') ? '#7f1d1d22'
                        : line.startsWith('[warn]') ? '#78350f22' : '#0f172a',
                      color: line.startsWith('[error]') ? '#fca5a5'
                        : line.startsWith('[warn]') ? '#fcd34d' : '#86efac',
                    }}>
                      {line}
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ color: '#475569', fontSize: 12 }}>
                  {execution ? 'No output.' : 'Run code first.'}
                </span>
              )
            )}
          </div>
        </div>

        {/* Right: explanation hero + call stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, overflow: 'auto' }}>
          {currentEvent
            ? <ExplainHero event={currentEvent} step={step} total={totalSteps} />
            : <IdleHero />
          }

          {/* Heap deltas */}
          {currentEvent?.heapDelta?.length > 0 && (
            <Panel title="Heap Changes" icon={Boxes} badge={currentEvent.heapDelta.length}>
              {currentEvent.heapDelta.map((d, i) => (
                <div key={i} style={{
                  padding: '5px 8px', borderRadius: 6, marginBottom: 4,
                  background: d.op === 'create' ? '#14532d22' : '#78350f22',
                  border: `1px solid ${d.op === 'create' ? '#14532d' : '#78350f'}`,
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                }}>
                  <span style={{ color: d.op === 'create' ? '#86efac' : '#fcd34d' }}>
                    {d.op === 'create' ? `+ ${d.objectType} #${d.objectId}` : `~ #${d.objectId}.${d.property}`}
                  </span>
                  {d.op === 'mutate' && (
                    <span style={{ color: '#94a3b8' }}>
                      {' '}{JSON.stringify(d.oldValue)} → {JSON.stringify(d.newValue)}
                    </span>
                  )}
                </div>
              ))}
            </Panel>
          )}

          {/* Call stack */}
          {currentEvent && (
            <Panel title="Call Stack" icon={Code2} badge={currentEvent.stackSnapshot?.length ?? 0}>
              {currentEvent.stackSnapshot?.length > 0 ? (
                [...currentEvent.stackSnapshot].reverse().map((frame, i) => (
                  <StackFrame key={i} frame={frame} depth={currentEvent.stackSnapshot.length - 1 - i} />
                ))
              ) : (
                <span style={{ color: '#475569', fontSize: 12 }}>Global scope</span>
              )}
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Explain hero ─────────────────────────────────────────────────────────────

const EVENT_COLOR = {
  CALL:        '#818cf8',
  RETURN:      '#86efac',
  DECLARE:     '#7dd3fc',
  ASSIGN:      '#fbbf24',
  BRANCH:      '#f472b6',
  LOOP:        '#fb923c',
  OBJECT_CREATE: '#a78bfa',
  OBJECT_MUTATE: '#f59e0b',
  THROW:       '#f87171',
  CATCH:       '#34d399',
  BUILTIN:     '#94a3b8',
}
function eventColor(type) {
  for (const [k, v] of Object.entries(EVENT_COLOR)) {
    if (type.startsWith(k)) return v
  }
  return '#94a3b8'
}

function ExplainHero({ event, step, total }) {
  const explain = EXPLAIN[event.type]?.(event) ?? { summary: event.type, why: '', concept: '' }
  const color   = eventColor(event.type)
  const loc     = event.sourceLocation

  return (
    <div style={{
      background: '#0a0f1e',
      border: `1px solid ${color}33`,
      borderRadius: 12,
      padding: '16px 16px 14px',
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle glow band at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${color}88, ${color}22)`,
        borderRadius: '12px 12px 0 0',
      }} />

      {/* Type + concept row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <span style={{
          fontSize: 10, padding: '2px 7px', borderRadius: 99,
          background: `${color}22`, color, border: `1px solid ${color}55`,
          fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '.04em',
        }}>{event.type}</span>
        {explain.concept && (
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 99,
            background: '#1e293b', color: '#64748b', border: '1px solid #334155',
            fontFamily: 'JetBrains Mono, monospace',
          }}>{explain.concept}</span>
        )}
        {loc && (
          <span style={{
            marginLeft: 'auto', fontSize: 10,
            color: '#334155', fontFamily: 'JetBrains Mono, monospace',
          }}>L{loc.line}</span>
        )}
      </div>

      {/* Summary — the hero text */}
      <div style={{
        fontSize: 15, fontWeight: 600, color: '#f1f5f9',
        lineHeight: 1.45, marginBottom: explain.why ? 12 : 0,
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        {explain.summary}
      </div>

      {/* Why — the explanation */}
      {explain.why && (
        <div style={{
          fontSize: 12, color: '#64748b', lineHeight: 1.65,
          borderTop: '1px solid #1e293b', paddingTop: 10,
        }}>
          {explain.why}
        </div>
      )}

      {/* Step counter */}
      <div style={{
        marginTop: 12, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          flex: 1, height: 2, background: '#1e293b', borderRadius: 2, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${((step + 1) / total) * 100}%`,
            background: color, borderRadius: 2,
            transition: 'width 0.15s',
          }} />
        </div>
        <span style={{
          fontSize: 10, color: '#334155', fontFamily: 'JetBrains Mono, monospace',
          whiteSpace: 'nowrap',
        }}>{step + 1} / {total}</span>
      </div>
    </div>
  )
}

function IdleHero() {
  return (
    <div style={{
      background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 12,
      padding: '24px 16px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 12, flexShrink: 0,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: '#1e1b4b', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Play size={18} color="#6366f1" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>
          Ready to trace
        </div>
        <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
          Press Run, then use Step or the slider<br />
          to walk through every line as it executes.
        </div>
      </div>
    </div>
  )
}

// ── Static analysis views ─────────────────────────────────────────────────────

function StructureView({ model }) {
  if (model?.error) return <span style={{ color: '#ef4444', fontSize: 12 }}>Parse error: {model.error.message}</span>
  if (!model) return <span style={{ color: '#475569', fontSize: 12 }}>Parsing…</span>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {model.functions.map((fn, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '5px 9px', background: '#1e293b', borderRadius: 6,
        }}>
          <div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#7dd3fc' }}>{fn.name}</span>
            <span style={{ fontSize: 11, color: '#64748b' }}>({fn.params.join(', ')})</span>
            {fn.line && <span style={{ fontSize: 10, color: '#475569', marginLeft: 6 }}>L{fn.line}</span>}
          </div>
          <ComplexityBadge complexity={fn.complexity} />
        </div>
      ))}
      {model.classes.map((cls, i) => (
        <div key={i} style={{ padding: '7px 9px', background: '#1e293b', borderRadius: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#818cf8' }}>{cls.name}</span>
            {cls.superclass && <span style={{ fontSize: 10, color: '#64748b' }}>extends {cls.superclass}</span>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {cls.methods.map((m, j) => (
              <span key={j} style={{
                fontSize: 10, padding: '1px 6px', borderRadius: 99,
                background: m.kind === 'constructor' ? '#312e81' : '#1e3a5f',
                color: m.kind === 'constructor' ? '#a5b4fc' : '#7dd3fc',
                fontFamily: 'JetBrains Mono, monospace',
              }}>{m.static ? 'static ' : ''}{m.name}</span>
            ))}
          </div>
        </div>
      ))}
      {model.functions.length === 0 && model.classes.length === 0 && (
        <span style={{ color: '#475569', fontSize: 12 }}>No functions or classes detected.</span>
      )}
    </div>
  )
}

function TokensView({ model }) {
  const tokens = model?.files?.[0]?.tokens ?? []
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {tokens.map((tok, i) => (
        <span key={i} style={{
          fontSize: 10, padding: '2px 6px', borderRadius: 4,
          background: `${tokenColor(tok.type)}18`, color: tokenColor(tok.type),
          border: `1px solid ${tokenColor(tok.type)}33`,
          fontFamily: 'JetBrains Mono, monospace', cursor: 'default',
        }} title={`${tok.type}  ${tok.start}–${tok.end}`}>
          {tok.value ?? tok.type}
        </span>
      ))}
      {tokens.length === 0 && <span style={{ color: '#475569', fontSize: 12 }}>No tokens.</span>}
    </div>
  )
}

function AstView({ model }) {
  const ast = model?.files?.[0]?.ast
  return ast
    ? <ASTNode node={ast} depth={0} />
    : <span style={{ color: '#475569', fontSize: 12 }}>No AST.</span>
}
