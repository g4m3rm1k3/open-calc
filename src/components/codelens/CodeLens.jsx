import { useState, useCallback, useEffect, useRef } from 'react'
import Editor, { useMonaco } from '@monaco-editor/react'
import { buildProgramModel } from './parser/jsParser.js'
import { run as runInterpreter } from './interpreter/interpreter.js'
import { EXPLAIN } from './eventStream.js'
import { buildHeapSnapshot } from './renderer/heapSnapshot.js'
import HeapGraph from './renderer/HeapGraph.jsx'
import CallGraphView from './renderer/CallGraphView.jsx'
import VariableWatch from './renderer/VariableWatch.jsx'
import CallTreeView from './renderer/CallTreeView.jsx'
import { setupOpenCalcMonaco } from '../../utils/monacoThemes.js'
import {
  ChevronRight, ChevronDown, Code2, Boxes, Braces, ArrowLeft,
  Zap, Play, Pause, StepForward, StepBack, SkipForward, Terminal,
  Palette, Info, Network, Layers, GitBranch,
} from 'lucide-react'

const SPEED_CONFIG = {
  '0.5x': { interval: 1200, steps: 1 },
  '1x':   { interval: 600,  steps: 1 },
  '2x':   { interval: 250,  steps: 1 },
  '5x':   { interval: 100,  steps: 1 },
  '10x':  { interval: 60,   steps: 2 },
}

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
  const [theme, setTheme]           = useState('open-calc-dark')
  const [showThemes, setShowThemes] = useState(false)
  const [rightMode, setRightMode]   = useState('explain')  // 'explain' | 'analyse'
  const [playing, setPlaying]       = useState(false)
  const [playSpeed, setPlaySpeed]   = useState('1x')
  const [fnModal, setFnModal]       = useState(null)
  const [editorW, setEditorW]       = useState(null)  // null = auto flex-grow
  const eventListRef                = useRef(null)
  const editorRef                   = useRef(null)
  const decorRef                    = useRef([])
  const editorColRef                = useRef(null)
  const monaco                      = useMonaco()

  const totalSteps   = execution?.events?.length ?? 0
  const currentEvent = execution?.events?.[step]      ?? null
  const prevEvent    = execution?.events?.[step - 1]  ?? null

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

  // Auto-play
  useEffect(() => {
    if (!playing || !execution) return
    const { interval, steps } = SPEED_CONFIG[playSpeed] ?? SPEED_CONFIG['1x']
    const id = setInterval(() => {
      setStep(s => {
        const next = s + steps
        if (next >= totalSteps - 1) { setPlaying(false); return totalSteps - 1 }
        return next
      })
    }, interval)
    return () => clearInterval(id)
  }, [playing, playSpeed, execution, totalSteps])

  // Auto-scroll event list to current step
  useEffect(() => {
    if (!eventListRef.current) return
    const active = eventListRef.current.querySelector('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [step])

  const startEditorResize = useCallback((e) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = editorColRef.current?.getBoundingClientRect().width ?? 400
    const onMove = (ev) => {
      const w = Math.max(160, Math.min(startW + (ev.clientX - startX), window.innerWidth - 700))
      setEditorW(w)
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

  const handleRun = useCallback(() => {
    setRunning(true)
    setTimeout(() => {
      try {
        const result = runInterpreter(source)
        setExecution(result)
        setStep(0)
        setPlaying(false)
        setRightTab('execution')
        setRightMode('explain')
      } finally {
        setRunning(false)
      }
    }, 0)
  }, [source])

  const TABS = [
    { id: 'structure', label: 'Structure', icon: Boxes },
    { id: 'tokens',    label: 'Tokens',    icon: Zap },
    { id: 'ast',       label: 'AST',       icon: Braces },
  ]
  const heapSnapshot = execution
    ? buildHeapSnapshot(execution.events, step)
    : null

  const RTABS = [
    { id: 'execution', label: 'Events',    icon: Play },
    { id: 'variables', label: 'Variables', icon: Layers },
    { id: 'calltree',  label: 'Tree',      icon: GitBranch },
    { id: 'heap',      label: 'Heap',      icon: Network },
    { id: 'output',    label: 'Output',    icon: Terminal },
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
          color: '#475569', display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 12, fontWeight: 500,
        }}>
          <ArrowLeft size={14} />
          UpSkillOS
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

      {/* ── Video-style playback controls ── */}
      {execution && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderBottom: '1px solid #1e293b',
          background: '#080c14', flexShrink: 0, flexWrap: 'wrap',
        }}>
          {/* Step controls */}
          <Btn onClick={() => { setPlaying(false); setStep(0) }} disabled={step === 0} title="Jump to start">
            <SkipForward size={11} style={{ transform: 'scaleX(-1)' }} />
          </Btn>
          <Btn onClick={() => { setPlaying(false); setStep(s => Math.max(0, s - 1)) }} disabled={step === 0} title="Step back">
            <StepBack size={11} /> Back
          </Btn>
          <Btn onClick={() => { setPlaying(false); setStep(s => Math.min(totalSteps - 1, s + 1)) }} disabled={step >= totalSteps - 1} title="Step forward">
            <StepForward size={11} /> Step
          </Btn>
          <Btn onClick={() => { setPlaying(false); setStep(totalSteps - 1) }} disabled={step >= totalSteps - 1} title="Jump to end">
            <SkipForward size={11} />
          </Btn>

          {/* Play / pause */}
          <div style={{ width: 1, height: 16, background: '#1e293b', margin: '0 2px' }} />
          <Btn
            onClick={() => setPlaying(p => !p)}
            disabled={step >= totalSteps - 1 && !playing}
            active={playing}
            title={playing ? 'Pause' : 'Play through'}
          >
            {playing ? <><Pause size={11} /> Pause</> : <><Play size={11} /> Play</>}
          </Btn>

          {/* Scrubber */}
          <input
            type="range" min={0} max={totalSteps - 1} value={step}
            onChange={e => { setPlaying(false); setStep(Number(e.target.value)) }}
            style={{ flex: 1, minWidth: 80, accentColor: '#6366f1' }}
          />
          <span style={{ fontSize: 10, color: '#475569', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace' }}>
            {step + 1}/{totalSteps}
          </span>

          {/* Speed */}
          <div style={{ display: 'flex', gap: 2, borderLeft: '1px solid #1e293b', paddingLeft: 6 }}>
            {Object.keys(SPEED_CONFIG).map(sp => (
              <button key={sp} onClick={() => setPlaySpeed(sp)} style={{
                background: playSpeed === sp ? '#312e81' : 'transparent',
                border: `1px solid ${playSpeed === sp ? '#6366f1' : '#1e293b'}`,
                color: playSpeed === sp ? '#a5b4fc' : '#475569',
                borderRadius: 4, padding: '2px 5px', cursor: 'pointer',
                fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
              }}>{sp}</button>
            ))}
          </div>

          {execution.error && (
            <span style={{ fontSize: 10, color: '#f87171' }}>
              {execution.error.type}: {execution.error.message}
            </span>
          )}
        </div>
      )}

      {/* ── Body ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'stretch',
        gap: 0, padding: 10, minHeight: 0, overflow: 'hidden',
      }}>
        {/* Left: editor — flex-grow unless manually resized */}
        <div
          ref={editorColRef}
          style={{
            flex: editorW ? `0 0 ${editorW}px` : '1 1 0',
            minWidth: 160, display: 'flex', flexDirection: 'column', minHeight: 0,
          }}
        >
          <div style={{
            flex: 1, background: '#0f172a', border: '1px solid #1e293b',
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
        </div>

        {/* ── Drag handle ── */}
        <div
          onMouseDown={startEditorResize}
          title="Drag to resize editor"
          style={{
            width: 9, flexShrink: 0, cursor: 'col-resize', alignSelf: 'stretch',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 2px',
          }}
        >
          <div style={{
            width: 2, height: 36, borderRadius: 1,
            background: '#1e293b', pointerEvents: 'none',
          }} />
        </div>

        {/* Middle: event stream */}
        <div style={{ flex: editorW ? '1 1 320px' : '0 0 320px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
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

          <div style={{ flex: 1, minHeight: 0, overflow: (rightTab === 'heap' || rightTab === 'variables' || rightTab === 'scope' || rightTab === 'calltree') ? 'hidden' : 'auto' }} ref={eventListRef}>
            {rightTab === 'execution' && (
              execution ? (
                execution.events.length === 0
                  ? <span style={{ color: '#475569', fontSize: 12 }}>No events.</span>
                  : execution.events.map((evt, i) => (
                      <div
                        key={i}
                        data-active={i === step ? 'true' : 'false'}
                        onClick={() => setStep(i)}
                        style={{ opacity: i > step ? 0.35 : 1, cursor: 'pointer' }}
                      >
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
            {rightTab === 'variables' && (
              <VariableWatch
                currentEvent={currentEvent}
                prevEvent={prevEvent}
                heapSnapshot={heapSnapshot}
                onShowEnvModel={() => setRightTab('scope')}
              />
            )}
            {rightTab === 'scope' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <button
                  onClick={() => setRightTab('variables')}
                  style={{ background: 'none', border: 'none', borderBottom: '1px solid #1e293b',
                    cursor: 'pointer', padding: '6px 10px', textAlign: 'left',
                    color: '#334155', fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                    flexShrink: 0 }}
                >
                  ← Back to Variables
                </button>
                <div style={{ flex: 1, overflow: 'auto' }}>
                  <ScopeChainView event={currentEvent} />
                </div>
              </div>
            )}
            {rightTab === 'calltree' && (
              <CallTreeView
                events={execution?.events ?? []}
                step={step}
              />
            )}
            {rightTab === 'heap' && (
              <HeapPanel snapshot={heapSnapshot} heapDelta={currentEvent?.heapDelta} />
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

        {/* Right: Analyse / Explain toggle */}
        <div style={{ width: 320, flexShrink: 0, marginLeft: 10, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
          {/* Mode toggle */}
          <div style={{
            display: 'flex', gap: 4, background: '#0f172a',
            borderRadius: 7, padding: 3, border: '1px solid #1e293b', flexShrink: 0,
          }}>
            {[
              { id: 'analyse', label: 'Analyse', icon: Boxes },
              { id: 'explain', label: 'Explain', icon: Info },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setRightMode(id)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                padding: '5px 0', borderRadius: 5, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600,
                background: rightMode === id ? '#1e293b' : 'transparent',
                color: rightMode === id ? '#818cf8' : '#64748b',
              }}>
                <Icon size={12} />{label}
              </button>
            ))}
          </div>

          {/* Analyse mode: Structure / Tokens / AST */}
          {rightMode === 'analyse' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
              <div style={{
                display: 'flex', gap: 3, background: '#0f172a',
                borderRadius: 6, padding: 3, border: '1px solid #1e293b', flexShrink: 0,
              }}>
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setTab(id)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    padding: '3px 0', borderRadius: 4, border: 'none', cursor: 'pointer',
                    fontSize: 10, fontWeight: 600,
                    background: tab === id ? '#1e293b' : 'transparent',
                    color: tab === id ? '#818cf8' : '#64748b',
                  }}>
                    <Icon size={11} />{label}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                {tab === 'structure' && <StructureView model={model} currentEvent={currentEvent} onNodeClick={node => setFnModal({ node, callGraph: model.callGraph })} />}
                {tab === 'tokens'    && <TokensView model={model} />}
                {tab === 'ast'       && <AstView model={model} />}
              </div>
            </div>
          )}

          {/* Explain mode: hero + heap changes + call stack */}
          {rightMode === 'explain' && (
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentEvent
                ? <ExplainHero event={currentEvent} step={step} total={totalSteps} />
                : <IdleHero />
              }
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
          )}
        </div>
      </div>

      {/* ── Function detail modal ── */}
      {fnModal && (
        <FunctionModal
          node={fnModal.node}
          callGraph={fnModal.callGraph}
          onClose={() => setFnModal(null)}
        />
      )}
    </div>
  )
}

// ── Inline code renderer ─────────────────────────────────────────────────────
// Converts `backtick-wrapped` segments in explanation strings to styled <code>.

function InlineText({ text }) {
  if (!text) return null
  const parts = String(text).split(/(`[^`\n]+`)/)
  return parts.map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code key={i} style={{
        background: '#1e293b', color: '#7dd3fc',
        padding: '1px 5px', borderRadius: 3,
        fontSize: '0.88em', fontFamily: 'JetBrains Mono, monospace',
      }}>{part.slice(1, -1)}</code>
    ) : part
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
        fontSize: 14, fontWeight: 600, color: '#f1f5f9',
        lineHeight: 1.5, marginBottom: explain.why ? 12 : 0,
      }}>
        <InlineText text={explain.summary} />
      </div>

      {/* Why — the explanation */}
      {explain.why && (
        <div style={{
          fontSize: 12, color: '#64748b', lineHeight: 1.7,
          borderTop: '1px solid #1e293b', paddingTop: 10,
        }}>
          <InlineText text={explain.why} />
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

// ── Heap panel ────────────────────────────────────────────────────────────────

function HeapPanel({ snapshot, heapDelta }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Legend bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px',
        borderBottom: '1px solid #1e293b', flexShrink: 0, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 9, color: '#334155', fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '.08em' }}>HEAP</span>
        <HeapDot color="#22c55e" label="new object" />
        <HeapDot color="#f59e0b" label="mutated" />
        <HeapDot color="#818cf8" label="existing" />
        <button onClick={() => setOpen(v => !v)} style={{
          marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
          color: open ? '#818cf8' : '#334155', fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace', padding: 0,
        }}>
          {open ? '▲ hide' : '? what is this'}
        </button>
      </div>

      {/* Collapsible explanation */}
      {open && (
        <div style={{
          padding: '12px 14px', background: '#080c14', borderBottom: '1px solid #1e293b',
          fontSize: 12, color: '#64748b', lineHeight: 1.7, flexShrink: 0,
        }}>
          <div style={{ fontWeight: 700, color: '#818cf8', marginBottom: 6 }}>The Heap — long-term memory</div>
          When you write <code style={IC}>new Node()</code>, <code style={IC}>[]</code>, or <code style={IC}>{'{}'}</code>,
          JavaScript allocates memory on the <em>heap</em> and gives your variable a <strong style={{ color: '#f1f5f9' }}>reference</strong> — an arrow pointing to that memory, not a copy of the value.
          <br /><br />
          Unlike the <strong style={{ color: '#f1f5f9' }}>call stack</strong> — which is destroyed when a function returns — heap objects
          persist until nothing holds a reference to them. At that point the garbage collector reclaims the memory.
          <br /><br />
          <strong>This is why mutation is powerful and dangerous.</strong> Multiple variables can hold references to the same object.
          Changing the object through any one of them changes it for all — there is only one copy.
          <br /><br />
          <em style={{ color: '#475569' }}>SICP Chapter 3.3: "Modeling with Mutable Data" — the environment model depends on understanding this distinction.</em>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <HeapGraph snapshot={snapshot} heapDelta={heapDelta} />
      </div>
    </div>
  )
}

const IC = {
  background: '#1e293b', color: '#7dd3fc',
  padding: '1px 5px', borderRadius: 3,
  fontSize: '0.9em', fontFamily: 'JetBrains Mono, monospace',
}

function HeapDot({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9,
      color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, border: `2px solid ${color}`,
        display: 'inline-block', flexShrink: 0 }} />
      {label}
    </span>
  )
}

// ── Function detail modal ─────────────────────────────────────────────────────

const KIND_COLOR_MAP = {
  function:    '#7dd3fc',
  arrow:       '#86efac',
  method:      '#818cf8',
  constructor: '#a78bfa',
}
const kColor = k => KIND_COLOR_MAP[k] ?? '#94a3b8'

function FunctionModal({ node, callGraph, onClose }) {
  const { nodes, edges } = callGraph ?? { nodes: [], edges: [] }

  const callsEdges   = edges.filter(e => e.from === node.id && !e.recursive)
  const calledByEdges = edges.filter(e => e.to === node.id && !e.recursive)
  const isRecursive  = edges.some(e => e.recursive && e.from === node.id)

  const callsNames    = callsEdges.map(e => nodes.find(n => n.id === e.to)?.name).filter(Boolean)
  const calledByNames = calledByEdges.map(e => nodes.find(n => n.id === e.from)?.name).filter(Boolean)
  const isEntryPoint  = calledByNames.length === 0
  const isLeaf        = callsNames.length === 0 && !isRecursive
  const color         = kColor(node.kind)

  const sicp = getSICPNote(node, isRecursive, callsNames, isLeaf, calledByNames)

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#0d1526', border: '1px solid #1e293b', borderRadius: 14,
          padding: '24px 26px', maxWidth: 500, width: '100%', maxHeight: '82vh',
          overflow: 'auto', boxShadow: '0 30px 70px rgba(0,0,0,.7)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99,
                background: color + '22', color, border: `1px solid ${color}44`,
                fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                {node.kind}
              </span>
              {isRecursive && (
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99,
                  background: '#78350f22', color: '#f59e0b', border: '1px solid #78350f44',
                  fontFamily: 'JetBrains Mono, monospace' }}>
                  ↺ recursive
                </span>
              )}
              {isEntryPoint && (
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99,
                  background: '#1e3a5f', color: '#7dd3fc', border: '1px solid #1e3a5f',
                  fontFamily: 'JetBrains Mono, monospace' }}>
                  entry point
                </span>
              )}
            </div>
            <div style={{ fontSize: 19, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color }}>
              {node.name}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'JetBrains Mono, monospace', marginTop: 3 }}>
              ({node.params.join(', ')})
              {node.line && <span style={{ marginLeft: 10, color: '#334155' }}>line {node.line}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#475569', fontSize: 22, lineHeight: 1, padding: 0,
          }}>×</button>
        </div>

        {/* ── What it does ── */}
        <ModalSection title="What this does">
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
            <InlineText text={describeFn(node, callsNames, calledByNames, isRecursive, isLeaf, isEntryPoint)} />
          </p>
        </ModalSection>

        {/* ── Complexity ── */}
        {node.complexity && (
          <ModalSection title="Complexity">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <ComplexityBadge complexity={node.complexity} />
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
              <InlineText text={explainComplexity(node.complexity)} />
            </p>
          </ModalSection>
        )}

        {/* ── Relationships ── */}
        <ModalSection title="Relationships">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12,
            fontFamily: 'JetBrains Mono, monospace' }}>
            {callsNames.length > 0 && (
              <RelRow icon="→" label="Calls" names={callsNames} color="#7dd3fc" />
            )}
            {calledByNames.length > 0 && (
              <RelRow icon="←" label="Called by" names={calledByNames} color="#a78bfa" />
            )}
            {isRecursive && (
              <RelRow icon="↺" label="Recursive" names={[node.name]} color="#f59e0b" />
            )}
            {isLeaf && (
              <div style={{ color: '#475569' }}>Leaf function — calls nothing in this program.</div>
            )}
            {isEntryPoint && !isRecursive && (
              <div style={{ color: '#475569' }}>Not called by any other function — this is an entry point.</div>
            )}
          </div>
        </ModalSection>

        {/* ── SICP connection ── */}
        {sicp && (
          <ModalSection title="SICP Connection">
            <div style={{
              borderLeft: '2px solid #6366f1', paddingLeft: 12,
              fontSize: 13, color: '#64748b', lineHeight: 1.7,
            }}>
              <InlineText text={sicp} />
            </div>
          </ModalSection>
        )}
      </div>
    </div>
  )
}

function ModalSection({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 9, letterSpacing: '.1em', color: '#334155',
        fontFamily: 'JetBrains Mono, monospace', marginBottom: 8, textTransform: 'uppercase' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function RelRow({ icon, label, names, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: '#475569', minWidth: 16 }}>{icon}</span>
      <span style={{ color: '#475569', minWidth: 60 }}>{label}</span>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {names.map(n => (
          <span key={n} style={{ color, background: color + '18',
            padding: '1px 7px', borderRadius: 4, border: `1px solid ${color}33` }}>
            {n}
          </span>
        ))}
      </div>
    </div>
  )
}

function describeFn(node, callsNames, calledByNames, isRecursive, isLeaf, isEntryPoint) {
  const name = node.name
  if (isRecursive) {
    const others = callsNames.filter(n => n !== name)
    const also   = others.length ? ` It also calls ${others.join(', ')}.` : ''
    return `\`${name}\` is a recursive function — it calls itself with a smaller input until it reaches a base case. Each call creates a new frame on the call stack.${also} Once the base case is reached, the frames unwind and results are assembled on the way back up.`
  }
  if (isLeaf) {
    return `\`${name}\` is a leaf function — it performs a focused task without calling other named functions in this program. Leaf functions are the atomic units that everything else is built from.`
  }
  if (isEntryPoint && callsNames.length > 0) {
    return `\`${name}\` is an entry point that orchestrates the overall flow. It delegates to: ${callsNames.map(n => `\`${n}\``).join(', ')}.`
  }
  if (calledByNames.length > 0 && callsNames.length > 0) {
    return `\`${name}\` sits in the middle of the call graph — called by ${calledByNames.map(n => `\`${n}\``).join(', ')} and in turn calls ${callsNames.map(n => `\`${n}\``).join(', ')}.`
  }
  return `\`${name}\` — a ${node.kind} function${node.params.length > 0 ? ` taking ${node.params.join(', ')}` : ' with no parameters'}.`
}

function explainComplexity(c) {
  const map = {
    'O(1)':           'Constant time — the same amount of work is done regardless of input size. This is the gold standard. Adding one more element changes nothing.',
    'O(n)':           'Linear time — work grows proportionally with n. Double the input, double the work. A single loop over n elements is typically O(n).',
    'O(n) recursive': 'Linear recursion — proportional to n but uses the call stack. Each recursive call adds a frame. For very large n this can cause a stack overflow. An iterative version avoids this (SICP §1.2.1).',
    'O(n²)':          'Quadratic time — double the input, 4× the work. Common in naive sorts (bubble, selection) and nested loops. Fine for small n, expensive for large n.',
    'O(n log n)?':    'Near-linear time — the sweet spot for comparison-based sorting (merge sort, quicksort on average). Much better than O(n²) for large inputs.',
  }
  return map[c] ?? `Work grows as ${c} with respect to input size.`
}

function getSICPNote(node, isRecursive, callsNames, isLeaf, calledByNames) {
  if (isRecursive) {
    return 'SICP §1.2 distinguishes between a recursive *procedure* (the code calls itself) and a recursive *process* (the shape of the computation). This function creates a recursive process — work accumulates and is resolved on the way back up the call stack. See §1.2.1 for linear recursion and §1.2.2 for tree recursion (like `fib`).'
  }
  if (node.name.toLowerCase().includes('sort')) {
    return 'SICP §2.2 covers sequence operations and §2.3.3 covers sets — sorting underpins both. Higher-order functions like `map`, `filter`, and `fold` are the SICP way to express sorted transformations without explicit loops.'
  }
  if (node.kind === 'constructor') {
    return 'SICP §3.1 introduces mutable state via `set!`. Constructors in OOP encapsulate state in closures — the object is a dispatch procedure that holds variables in its environment. This is message-passing style, introduced in §3.1.2.'
  }
  if (node.kind === 'method') {
    return 'SICP §3.1 shows that objects are really procedures with local state. A method is a message handler — `(account \'withdraw)` returns a procedure that closes over the account\'s balance. The same pattern you\'re using here.'
  }
  if (isLeaf && node.params.length >= 2) {
    return 'SICP §1.1.4 — "Compound Procedures." This is a black box that maps inputs to an output. The key abstraction: the *what* (specification) is separate from the *how* (implementation). Callers should not need to know how `' + node.name + '` works internally.'
  }
  if (isEntryPoint && callsNames && callsNames.length > 1) {
    return 'This looks like a coordination function — it knows the steps but delegates the work. SICP §1.3 covers higher-order procedures that capture this exact pattern: procedures that take procedures as arguments or return them.'
  }
  return null
}

// ── Static analysis views ─────────────────────────────────────────────────────

function StructureView({ model, currentEvent, onNodeClick }) {
  if (model?.error) return <span style={{ color: '#ef4444', fontSize: 12 }}>Parse error: {model.error.message}</span>
  if (!model) return <span style={{ color: '#475569', fontSize: 12 }}>Parsing…</span>

  const hasGraph   = model.callGraph?.nodes?.length > 0
  const hasClasses = model.classes?.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Call graph */}
      {hasGraph && (
        <CallGraphView callGraph={model.callGraph} currentEvent={currentEvent} onNodeClick={onNodeClick} />
      )}

      {!hasGraph && (
        <span style={{ color: '#475569', fontSize: 12 }}>No functions detected.</span>
      )}

      {/* Classes */}
      {hasClasses && (
        <>
          {hasGraph && (
            <div style={{ fontSize: 9, letterSpacing: '.08em', color: '#334155',
              fontFamily: 'JetBrains Mono, monospace', paddingTop: 4,
              borderTop: '1px solid #1e293b' }}>
              CLASSES
            </div>
          )}
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
        </>
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

// ── Scope chain view ──────────────────────────────────────────────────────────

function ScopeChainView({ event }) {
  if (!event) {
    return (
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 12, color: '#475569' }}>Run code first.</div>
      </div>
    )
  }

  const frames   = event.stackSnapshot ?? []
  // Frames are ordered innermost-first; reverse so top = current
  const ordered  = [...frames].reverse()
  const hasFrames = ordered.length > 0

  return (
    <div style={{ padding: '0 2px' }}>
      {/* Concept label */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
        padding: '6px 10px', borderRadius: 7,
        background: '#0f172a', border: '1px solid #1e293b',
      }}>
        <Layers size={12} color="#818cf8" />
        <span style={{ fontSize: 10, color: '#818cf8', fontWeight: 700, letterSpacing: '.04em' }}>
          SCOPE CHAIN
        </span>
        <span style={{ fontSize: 10, color: '#334155', marginLeft: 'auto' }}>
          {hasFrames ? `${ordered.length} frame${ordered.length > 1 ? 's' : ''}` : 'global only'}
        </span>
      </div>

      {/* Concept explanation */}
      <div style={{
        fontSize: 11, color: '#475569', lineHeight: 1.6,
        padding: '0 2px', marginBottom: 12,
      }}>
        Every time a function is called, JavaScript creates a new <span style={{ color: '#818cf8' }}>scope frame</span> to
        hold its variables. When the function returns, the frame is destroyed.
        Inner frames can read variables from outer frames — that's how <span style={{ color: '#a78bfa' }}>closures</span> work.
      </div>

      {/* Stack frames as scope levels */}
      {ordered.map((frame, i) => (
        <ScopeFrame key={i} frame={frame} isCurrent={i === 0} isGlobal={false} />
      ))}

      {/* Global scope always at the bottom */}
      <div style={{ position: 'relative', marginTop: ordered.length > 0 ? 0 : 4 }}>
        {ordered.length > 0 && (
          <div style={{
            width: 1, height: 12, background: '#1e293b',
            margin: '0 auto 0 19px',
          }} />
        )}
        <GlobalScope event={event} />
      </div>
    </div>
  )
}

function ScopeFrame({ frame, isCurrent }) {
  const [open, setOpen] = useState(isCurrent)
  const locals = Object.entries(frame.locals ?? {})

  return (
    <div style={{ position: 'relative', marginBottom: 0 }}>
      {/* Connector line */}
      <div style={{
        position: 'absolute', left: 19, top: 0, bottom: 0,
        width: 1, background: isCurrent ? '#4338ca' : '#1e293b',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, marginBottom: 4 }}>
        {/* Frame header */}
        <div
          onClick={() => locals.length > 0 && setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px 6px 8px', borderRadius: 7,
            background: isCurrent ? '#1e1b4b' : '#0f172a',
            border: `1px solid ${isCurrent ? '#4338ca' : '#1e293b'}`,
            cursor: locals.length > 0 ? 'pointer' : 'default',
            marginLeft: 0,
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: isCurrent ? '#4338ca' : '#1e293b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isCurrent
              ? <span style={{ fontSize: 8, color: '#a5b4fc', fontWeight: 700 }}>NOW</span>
              : <span style={{ fontSize: 9, color: '#475569' }}>fn</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
              color: isCurrent ? '#a5b4fc' : '#7dd3fc',
            }}>
              {frame.name ?? '(anonymous)'}
              {isCurrent && <span style={{ fontSize: 10, color: '#6366f1', marginLeft: 6 }}>← running</span>}
            </div>
            <div style={{ fontSize: 10, color: '#334155' }}>
              {locals.length} variable{locals.length !== 1 ? 's' : ''}
              {frame.line ? ` · L${frame.line}` : ''}
            </div>
          </div>
          {locals.length > 0 && (
            <span style={{ fontSize: 10, color: '#334155' }}>
              {open ? '▲' : '▼'}
            </span>
          )}
        </div>

        {/* Variables */}
        {open && locals.length > 0 && (
          <div style={{
            marginLeft: 30, marginTop: 2, marginBottom: 4,
            padding: '6px 8px', borderRadius: 6,
            background: '#080c14', border: '1px solid #1e293b',
          }}>
            {locals.map(([name, val]) => (
              <div key={name} style={{
                display: 'flex', gap: 8, fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                padding: '2px 0', alignItems: 'baseline',
              }}>
                <span style={{ color: '#7dd3fc', minWidth: 80, flexShrink: 0 }}>{name}</span>
                <span style={{ color: '#334155', flexShrink: 0 }}>=</span>
                <span style={{ color: valueColor(val), wordBreak: 'break-all' }}>
                  {formatValue(val)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function GlobalScope({ event }) {
  const [open, setOpen] = useState(false)
  // Collect globals from the first (oldest) stack frame if available
  const frames  = event.stackSnapshot ?? []
  const globals = frames.length > 0 ? Object.entries(frames[0]?.locals ?? {}) : []

  return (
    <div style={{
      padding: '6px 10px 6px 8px', borderRadius: 7,
      background: '#080c14', border: '1px solid #1e293b',
      cursor: globals.length > 0 ? 'pointer' : 'default',
    }} onClick={() => globals.length > 0 && setOpen(o => !o)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          background: '#0f172a', border: '1px solid #334155',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 8, color: '#475569', fontWeight: 700,
        }}>GBL</div>
        <div>
          <div style={{ fontSize: 12, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
            global scope
          </div>
          <div style={{ fontSize: 10, color: '#334155' }}>
            top-level declarations · always visible
          </div>
        </div>
        {globals.length > 0 && (
          <span style={{ fontSize: 10, color: '#334155', marginLeft: 'auto' }}>
            {open ? '▲' : '▼'}
          </span>
        )}
      </div>
      {open && globals.length > 0 && (
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #1e293b' }}>
          {globals.map(([name, val]) => (
            <div key={name} style={{
              display: 'flex', gap: 8, fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace', padding: '2px 0',
            }}>
              <span style={{ color: '#64748b', minWidth: 80 }}>{name}</span>
              <span style={{ color: '#334155' }}>=</span>
              <span style={{ color: valueColor(val) }}>{formatValue(val)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function valueColor(v) {
  if (v === null || v === undefined) return '#475569'
  if (typeof v === 'number') return '#86efac'
  if (typeof v === 'string') return '#fbbf24'
  if (typeof v === 'boolean') return '#f472b6'
  if (typeof v === 'object' && v?.__kind === 'reference') return '#818cf8'
  if (typeof v === 'function' || (typeof v === 'object' && v?.type === 'function')) return '#a78bfa'
  return '#94a3b8'
}

function formatValue(v) {
  if (v === null)      return 'null'
  if (v === undefined) return 'undefined'
  if (typeof v === 'function') return '[Function]'
  if (typeof v === 'object' && v?.__kind === 'reference') return `[Object #${v.objectId}]`
  if (typeof v === 'object' && v?.type === 'function') return `[Function ${v.name ?? ''}]`
  if (typeof v === 'object') return JSON.stringify(v).slice(0, 30)
  if (typeof v === 'string') return `"${v.length > 20 ? v.slice(0, 20) + '…' : v}"`
  return String(v)
}
