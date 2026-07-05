import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Editor from '@monaco-editor/react'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import { setupOpenCalcMonaco } from '../../utils/monacoThemes.js'
import { LESSONS } from './lessons/index.js'
import { generateSteps, runStep } from './generateSteps.js'

// ── Colours ────────────────────────────────────────────────────────────────────
const HEX = {
  indigo:  '#6366f1',
  violet:  '#8b5cf6',
  pink:    '#ec4899',
  emerald: '#10b981',
  amber:   '#f59e0b',
}

// ── Semantic event taxonomy ────────────────────────────────────────────────────
const SEMANTIC_EVENTS = {
  // Variable operations
  CreateVariable:    { label: 'Create Variable', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  ReadVariable:      { label: 'Read Variable',   color: '#10b981', bg: 'rgba(16,185,129,0.09)' },
  WriteVariable:     { label: 'Write Variable',  color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  // Function operations
  DefineFunction:    { label: 'Define Function', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  CallFunction:      { label: 'Call Function',   color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  ReturnValue:       { label: 'Return Value',    color: '#6366f1', bg: 'rgba(99,102,241,0.09)' },
  // Object / class operations
  DefineClass:       { label: 'Define Class',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  CreateObject:      { label: 'Create Object',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  ReadProperty:      { label: 'Read Property',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.09)' },
  WriteProperty:     { label: 'Write Property',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  // Control flow
  EnterScope:        { label: 'Enter Scope',     color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  ExitScope:         { label: 'Exit Scope',      color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  TakeBranch:        { label: 'Take Branch',     color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  BeginLoop:         { label: 'Begin Loop',      color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  EndLoop:           { label: 'End Loop',        color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  // Error
  ThrowCatch:        { label: 'Throw / Catch',   color: '#ef4444', bg: 'rgba(239,68,68,0.10)'  },
  // Async
  EnqueueMicrotask:  { label: 'Enqueue Microtask', color: '#ec4899', bg: 'rgba(236,72,153,0.10)' },
  EnqueueTask:       { label: 'Enqueue Task',    color: '#ec4899', bg: 'rgba(236,72,153,0.10)' },
  // Type (TypeScript)
  InferType:         { label: 'Infer Type',      color: '#38bdf8', bg: 'rgba(56,189,248,0.10)' },
  NarrowType:        { label: 'Narrow Type',     color: '#38bdf8', bg: 'rgba(56,189,248,0.10)' },
  ResolveGeneric:    { label: 'Resolve Generic', color: '#38bdf8', bg: 'rgba(56,189,248,0.10)' },
}

// ── Connection relationship types ──────────────────────────────────────────────
const CONN_TYPES = {
  calls:      'calls',
  produces:   'produces',
  reads:      'reads from',
  writes:     'writes to',
  inherits:   'inherits',
  creates:    'creates',
  stores:     'stores in',
  enters:     'enters',
  captures:   'captures',
  depends:    'depends on',
  resolves:   'resolves to',
  narrows:    'narrows to',
}

// ── CSS injection ──────────────────────────────────────────────────────────────
let _css = false
function ensureCSS() {
  if (_css) return; _css = true
  const rules = [
    ...Object.entries(HEX).map(([n, hex]) => {
      const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
      return [
        `.av-hl-${n} { background: rgba(${r},${g},${b},0.14) !important; }`,
        `.av-gutter-${n} { width: 3px !important; background: ${hex} !important; margin-left: 2px; }`,
        `.av-conn-ep-${n} { border-left: 3px solid ${hex} !important; background: transparent !important; opacity: 0.6; }`,
      ].join('')
    }),
  ].join('\n')
  const el = document.createElement('style')
  el.textContent = rules
  document.head.appendChild(el)
}

// ── Explanation paragraph ──────────────────────────────────────────────────────
const PARA_LABELS = [
  { re: /^(CS\s*[—–-]\s*)/, color: '#818cf8', bg: 'rgba(99,102,241,0.12)'  },  // indigo
  { re: /^(SE\s*[—–-]\s*)/, color: '#34d399', bg: 'rgba(16,185,129,0.12)'  },  // emerald
  { re: /^(Without this[:\s])/, color: '#fbbf24', bg: 'rgba(245,158,11,0.12)' }, // amber
]

function renderInlineCode(text) {
  return text.split(/(`[^`\n]+`)/).map((seg, i) => {
    if (seg.startsWith('`') && seg.endsWith('`')) {
      return (
        <code key={i} style={{
          fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace',
          fontSize: '0.78em',
          background: 'rgba(139,92,246,0.15)',
          color: '#c4b5fd',
          borderRadius: 3,
          padding: '1px 4px',
          letterSpacing: 0,
        }}>{seg.slice(1, -1)}</code>
      )
    }
    return seg
  })
}

function ExplanationPara({ text }) {
  for (const { re, color, bg } of PARA_LABELS) {
    const m = text.match(re)
    if (m) {
      const prefix = m[1]
      const body   = text.slice(prefix.length)
      const label  = prefix.replace(/\s*[—–-]\s*$/, '').replace(/:\s*$/, '').trim()
      return (
        <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            background: bg, color, borderRadius: 4,
            fontSize: '0.7em', fontWeight: 700, letterSpacing: '0.04em',
            padding: '1px 6px', marginRight: 6, verticalAlign: 'middle',
            textTransform: 'uppercase',
          }}>{label}</span>
          {renderInlineCode(body)}
        </p>
      )
    }
  }
  return (
    <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
      {renderInlineCode(text)}
    </p>
  )
}

// ── Arrow lane ─────────────────────────────────────────────────────────────────
// Circles sit at the RIGHT edge (touching Monaco); curves bow LEFT into the lane.
const LANE_W  = 72
const LINE_H  = 20
const PAD_TOP = 16

// SVG_H is tall enough for any realistic lesson (500 lines × 20px)
const SVG_H = 10200

function ArrowLane({ connections, height, selectedKey, onSelect, scrollTop = 0 }) {
  if (!connections.length) return <div style={{ width: LANE_W, height }} />
  return (
    <div className="shrink-0 overflow-hidden" style={{ width: LANE_W, height }}>
      <svg width={LANE_W} height={SVG_H}
        style={{ display: 'block', transform: `translateY(-${scrollTop}px)` }}>
        {connections.map((c, i) => {
          const key      = `${c.fromLine}-${c.toLine}-${c.color}`
          const isSel    = selectedKey === key
          const col      = HEX[c.color] || HEX.indigo
          const opacity  = isSel ? 1 : c.dim ? 0.25 : 0.8
          const sw       = isSel ? 2.5 : c.dim ? 1 : 1.5
          const y1  = (c.fromLine - 1) * LINE_H + PAD_TOP + LINE_H * 0.5
          const y2  = (c.toLine   - 1) * LINE_H + PAD_TOP + LINE_H * 0.5
          const x0  = LANE_W - 4   // circles at right edge, touching Monaco
          const cx  = 8            // curves bow left
          const d   = `M ${x0} ${y1} C ${cx} ${y1} ${cx} ${y2} ${x0} ${y2}`
          const my  = (y1 + y2) / 2
          return (
            <g key={i} style={{ cursor: 'pointer' }} onClick={() => onSelect(isSel ? null : { ...c, key })}>
              {/* invisible wide hit-area */}
              <path d={d} fill="none" stroke="transparent" strokeWidth={14} />
              <path d={d} fill="none" stroke={col} strokeWidth={sw} opacity={opacity} />
              <circle cx={x0} cy={y1} r={isSel ? 4 : c.dim ? 2 : 3} fill={col} opacity={opacity} />
              <circle cx={x0} cy={y2} r={isSel ? 4 : c.dim ? 2 : 3} fill={col} opacity={opacity} />
              {c.label && !c.dim && (
                <text x={LANE_W / 2} y={my + 3} fontSize={8} textAnchor="middle"
                  fill={col} fontFamily="ui-sans-serif,system-ui,sans-serif" fontWeight="700">
                  {c.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Variables panel ────────────────────────────────────────────────────────────
const BUILTINS = new Set([
  'undefined', 'null', 'true', 'false', 'Infinity', 'NaN',
  'console', 'Math', 'Number', 'String', 'Array', 'Object',
  'Map', 'Set', 'parseInt', 'parseFloat', 'isNaN', 'isFinite',
  'typeof', '__console_log__',
])

function fmtVal(v) {
  if (v === null)      return 'null'
  if (v === undefined) return 'undefined'
  if (v === '<TDZ>')   return '<TDZ>'
  if (typeof v === 'boolean') return String(v)
  if (typeof v === 'number')  return String(v)
  if (typeof v === 'string') {
    // _snapshotValue already formatted these as display strings — show them verbatim
    if (v.startsWith('[') || v.startsWith('{') || v === '') return v
    return `"${v}"`   // actual string value
  }
  if (typeof v === 'object' && '$ref' in v) return '{…}'  // fallback, shouldn't occur after engine fix
  return String(v)
}

function VarRow({ varKey, value, dimmed }) {
  const [open, setOpen] = useState(false)
  const str    = fmtVal(value)
  const isLong = str.length > 22
  const valCls = dimmed ? 'text-slate-500' : 'text-emerald-400'
  return (
    <div className="py-0.5">
      <div
        className={`flex items-baseline gap-1.5 min-w-0 ${isLong ? 'cursor-pointer' : ''}`}
        onClick={() => isLong && setOpen(o => !o)}
      >
        <span className={`font-mono text-[10px] shrink-0 ${dimmed ? 'text-slate-600' : 'text-slate-400 dark:text-slate-400'}`}>
          {varKey}
        </span>
        {!open && (
          <span className={`font-mono text-[10px] truncate ${valCls}`}>{str}</span>
        )}
        {isLong && (
          <span className="text-[8px] text-slate-600 shrink-0 ml-auto">{open ? '▲' : '▼'}</span>
        )}
      </div>
      {open && (
        <pre className={`font-mono text-[9px] leading-relaxed whitespace-pre-wrap break-all ml-1 mt-1 pl-2 border-l-2 border-slate-700 ${valCls}`}>
          {str}
        </pre>
      )}
    </div>
  )
}

function VarsPanel({ snapshot, hint }) {
  if (!snapshot?.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 px-4 text-center">
        <span className="text-[11px] text-slate-500 dark:text-slate-600 leading-relaxed">
          {hint ?? 'No variables in scope'}
        </span>
      </div>
    )
  }

  // stackSnapshot is [oldest…newest, global] — reverse so innermost is first
  const reversed   = [...snapshot].reverse()
  const globalFrm  = reversed.find(f => f.name === '__global__')
  const callFrames = reversed.filter(f => f.name !== '__global__')
  const globalVars = Object.entries(globalFrm?.locals ?? {}).filter(([k]) => !BUILTINS.has(k))

  return (
    <div className="h-full overflow-y-auto px-3 py-3 flex flex-col gap-4">
      {callFrames.length === 0 && globalVars.length === 0 && (
        <p className="text-[10px] text-slate-600 italic">no variables in scope</p>
      )}

      {callFrames.map((frame, i) => (
        <div key={i}>
          <div className="text-[9px] font-bold tracking-widest text-indigo-400 uppercase mb-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
            {frame.name}
          </div>
          {Object.entries(frame.locals ?? {}).map(([k, v]) => (
            <VarRow key={k} varKey={k} value={v} />
          ))}
        </div>
      ))}

      {globalVars.length > 0 && (
        <div>
          <div className="text-[9px] font-bold tracking-widest text-slate-600 uppercase mb-1">global</div>
          {globalVars.map(([k, v]) => (
            <VarRow key={k} varKey={k} value={v} dimmed />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Lesson groups for nav sidebar ─────────────────────────────────────────────
const LESSON_GROUPS = LESSONS.reduce((acc, l, i) => {
  if (!acc[l.tag]) acc[l.tag] = []
  acc[l.tag].push({ lesson: l, idx: i })
  return acc
}, {})

// ── Shared ─────────────────────────────────────────────────────────────────────
const EMPTY_STEP = { title: '', code: '', explanation: '', active: [], connections: [], outputSoFar: [], stackSnapshot: [] }

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AbstractionViz({ onBack }) {
  const { themeStyles, isDarkGlobal: isDark } = useGlobalTheme()

  const [lessonIdx, setLessonIdx] = useState(0)
  const [stepIdx,   setStepIdx]   = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed,     setSpeed]     = useState(1)
  const [laneH,     setLaneH]     = useState(600)

  const [mode,         setMode]       = useState('lessons')
  const [userCode,     setUserCode]   = useState('')
  const [userLesson,   setUserLesson] = useState(null)
  const [genError,     setGenError]   = useState(null)
  const [navOpen,      setNavOpen]    = useState(true)
  const [liveOutput,   setLiveOutput]   = useState([])
  const [liveSnapshot, setLiveSnapshot] = useState([])
  const [explanW,      setExplanW]    = useState(() => Math.round(Math.max(240, Math.min(600, window.innerWidth * 0.28))))
  const [varsW,        setVarsW]      = useState(() => Math.round(Math.max(180, Math.min(480, window.innerWidth * 0.20))))
  const [varsOpen,     setVarsOpen]   = useState(true)
  const [selectedConn, setSelectedConn] = useState(null)
  const [scrollTop,    setScrollTop]  = useState(0)

  const editorRef    = useRef(null)
  const monacoRef    = useRef(null)
  const decorRef     = useRef(null)
  const connDecorRef = useRef(null)
  const laneRef      = useRef(null)

  const lesson = (mode === 'user' && userLesson)
    ? userLesson
    : (LESSONS[lessonIdx] ?? LESSONS[0])
  const safeStepIdx = Math.min(stepIdx, lesson.steps.length - 1)
  const step        = (mode === 'user' && !userLesson) ? EMPTY_STEP : (lesson.steps[safeStepIdx] ?? EMPTY_STEP)

  // Accumulate connections from all steps up to current, dimming older ones.
  // Uses a Map so a connection re-used in a later step is always shown bright.
  const accumulatedConnections = useMemo(() => {
    const map = new Map()
    lesson.steps.slice(0, safeStepIdx + 1).forEach((s, si) => {
      ;(s.connections ?? []).forEach(c => {
        const key = `${c.fromLine}-${c.toLine}-${c.color}`
        map.set(key, { ...c, dim: si < safeStepIdx })
      })
    })
    return [...map.values()]
  }, [lesson, safeStepIdx])
  const totalLines  = step.code.split('\n').length
  const isFirst     = safeStepIdx === 0
  const isLast      = safeStepIdx === lesson.steps.length - 1
  const showInput   = mode === 'user' && !userLesson

  // Run the current step's code live and capture output + variables
  useEffect(() => {
    if (mode !== 'lessons') return
    const { output, snapshot } = runStep(step, lesson.lang)
    setLiveOutput(output)
    setLiveSnapshot(snapshot)
  }, [lessonIdx, safeStepIdx, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync lane height
  useEffect(() => {
    if (!laneRef.current) return
    const ro = new ResizeObserver(([e]) => setLaneH(e.contentRect.height))
    ro.observe(laneRef.current)
    return () => ro.disconnect()
  }, [])

  // Apply decorations
  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) return
    const decors = step.active.flatMap(h => [{
      range: new monaco.Range(h.startLine, 1, h.endLine, 1),
      options: {
        isWholeLine: true,
        className: `av-hl-${h.color}`,
        linesDecorationsClassName: `av-gutter-${h.color}`,
      },
    }])
    if (decorRef.current) {
      decorRef.current.set(decors)
    } else {
      decorRef.current = editor.createDecorationsCollection(decors)
    }
  }, [step, totalLines])

  // Connection endpoint right-border decorations in Monaco
  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) return
    const endMap = new Map()
    accumulatedConnections.forEach(c => {
      if (!endMap.has(c.fromLine)) endMap.set(c.fromLine, c.color)
      if (!endMap.has(c.toLine))   endMap.set(c.toLine,   c.color)
    })
    const decors = [...endMap.entries()].map(([line, color]) => ({
      range: new monaco.Range(line, 1, line, 1),
      options: { isWholeLine: true, className: `av-conn-ep-${color}` },
    }))
    if (connDecorRef.current) {
      connDecorRef.current.set(decors)
    } else {
      connDecorRef.current = editor.createDecorationsCollection(decors)
    }
  }, [accumulatedConnections])

  function handleEditorMount(editor, monaco) {
    editorRef.current = editor
    monacoRef.current = monaco
    ensureCSS()
    editor.onDidScrollChange(() => setScrollTop(editor.getScrollTop()))
  }

  function handleResizeStart(e) {
    e.preventDefault()
    const startX = e.clientX
    const startW = explanW
    const overlay = document.createElement('div')
    overlay.style.cssText = 'position:fixed;inset:0;cursor:col-resize;z-index:9999;'
    document.body.appendChild(overlay)
    function onMove(ev) {
      const maxW = window.innerWidth - LANE_W - 320 - varsW - 204
      setExplanW(Math.max(180, Math.min(maxW, startW + ev.clientX - startX)))
    }
    function onUp() {
      overlay.remove()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleVarsResizeStart(e) {
    e.preventDefault()
    const startX = e.clientX
    const startW = varsW
    const overlay = document.createElement('div')
    overlay.style.cssText = 'position:fixed;inset:0;cursor:col-resize;z-index:9999;'
    document.body.appendChild(overlay)
    function onMove(ev) {
      const delta = startX - ev.clientX
      setVarsW(Math.max(150, Math.min(600, startW + delta)))
    }
    function onUp() {
      overlay.remove()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const goNext = useCallback(() => {
    if (isLast) { setIsPlaying(false); return }
    setStepIdx(s => s + 1)
  }, [isLast])

  const goPrev = useCallback(() => {
    if (!isFirst) setStepIdx(s => s - 1)
  }, [isFirst])

  useEffect(() => {
    if (!isPlaying) return
    const t = setTimeout(goNext, Math.round(3000 / speed))
    return () => clearTimeout(t)
  }, [isPlaying, speed, stepIdx, goNext])

  useEffect(() => {
    setStepIdx(0); setIsPlaying(false); setSelectedConn(null)
    decorRef.current = null; connDecorRef.current = null
  }, [lessonIdx])

  useEffect(() => {
    setStepIdx(0); setIsPlaying(false); setSelectedConn(null)
    decorRef.current = null; connDecorRef.current = null
    if (mode === 'lessons') { setUserLesson(null); setGenError(null) }
  }, [mode])

  function handleTrace() {
    if (!userCode.trim()) return
    setGenError(null)
    const { steps, error } = generateSteps(userCode)
    if (!steps) { setGenError(error); return }
    setUserLesson({ id: 'user', title: 'Your Code', tag: 'Custom', steps })
    if (error) setGenError(error)
    setStepIdx(0); setIsPlaying(false); decorRef.current = null
  }

  const monacoOptions = {
    readOnly: true, fontSize: 13, lineHeight: LINE_H,
    minimap: { enabled: false }, scrollBeyondLastLine: false,
    padding: { top: PAD_TOP, bottom: 16 }, overviewRulerLanes: 0,
    renderLineHighlight: 'none', scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
    folding: false, lineDecorationsWidth: 8, lineNumbersMinChars: 3,
  }

  const tabCls = (active) =>
    `shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
      active
        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
        : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
    }`

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-slate-950">

      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161b22]">
        {onBack && (
          <>
            <button onClick={onBack} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">← Back</button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
          </>
        )}
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Abstraction Visualizer</span>
        <span className="text-slate-300 dark:text-slate-700">|</span>

        <div className="flex items-center gap-1 min-w-0 flex-1">
          <button onClick={() => setMode('lessons')} className={tabCls(mode === 'lessons')}>Lessons</button>
          <button onClick={() => setMode('user')} className={tabCls(mode === 'user')}>Your Code</button>

          {mode === 'user' && userLesson && (
            <>
              <span className="text-slate-300 dark:text-slate-700 mx-0.5">|</span>
              <button onClick={() => { setUserLesson(null); setGenError(null); setStepIdx(0) }}
                className="shrink-0 text-xs text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors px-2">
                ← edit code
              </button>
            </>
          )}
        </div>

        {mode === 'lessons' && (
          <button onClick={() => setNavOpen(o => !o)}
            title={navOpen ? 'Collapse lesson nav' : 'Open lesson nav'}
            className="shrink-0 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors px-1.5 py-1 rounded">
            {navOpen ? '◀' : '▶'}
          </button>
        )}
      </div>

      {/* Body: sidebar + panels */}
      <div className="flex flex-1 min-h-0">

        {/* Lesson nav sidebar */}
        {mode === 'lessons' && (
          navOpen ? (
            <div className="shrink-0 flex flex-col min-h-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1117]"
              style={{ width: 196 }}>
              <div className="shrink-0 px-3 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[9px] font-bold tracking-widest text-slate-400 dark:text-slate-600 uppercase">Lessons</span>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {Object.entries(LESSON_GROUPS).map(([tag, items]) => (
                  <div key={tag} className="mb-3">
                    <div className="px-3 py-1 text-[9px] font-bold tracking-widest text-indigo-400 dark:text-indigo-500 uppercase">
                      {tag}
                    </div>
                    {items.map(({ lesson: l, idx: i }) => (
                      <button key={l.id}
                        onClick={() => { setLessonIdx(i); setStepIdx(0); setIsPlaying(false) }}
                        className={`w-full text-left px-3 py-1.5 text-[11px] font-medium transition-colors rounded-none ${
                          i === lessonIdx
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-l-2 border-indigo-500'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 border-l-2 border-transparent'
                        }`}>
                        {l.title}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="shrink-0 flex flex-col items-center pt-3 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1117]"
              style={{ width: 28 }}>
            </div>
          )
        )}

        {/* Panel 1 — Explanation (resizable) */}
        <div className="shrink-0 flex flex-col min-h-0" style={{ width: explanW, minWidth: 180, maxWidth: 640 }}>
          {showInput ? (
            <>
              <div className="shrink-0 px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Paste JavaScript</h2>
                <p className="text-[12px] text-slate-500 dark:text-slate-500">Paste any JS function or snippet. The visualizer traces every call and shows live variables.</p>
              </div>
              <div className="flex-1 flex flex-col gap-3 px-4 py-4 min-h-0 overflow-y-auto">
                <textarea
                  value={userCode}
                  onChange={e => setUserCode(e.target.value)}
                  spellCheck={false}
                  placeholder={`function greet(name) {\n  return \`Hello, \${name}!\`\n}\ngreet('Alice')`}
                  className={`flex-1 min-h-[200px] font-mono text-[12px] resize-none rounded-lg border p-3 outline-none transition-colors ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-600 focus:border-indigo-600'
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400'
                  }`}
                />
                {genError && <p className="text-[11px] text-red-500 dark:text-red-400 font-mono leading-snug">{genError}</p>}
                <button onClick={handleTrace} disabled={!userCode.trim()}
                  className="shrink-0 text-sm font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-40 bg-indigo-500 dark:bg-indigo-600 text-white hover:bg-indigo-600">
                  Trace It →
                </button>
              </div>
            </>
          ) : (
            <>
              {(() => {
                const ev = step.semanticEvent ? SEMANTIC_EVENTS[step.semanticEvent] : null
                return (
                  <div className="shrink-0 px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800/60"
                    style={ev ? {
                      borderLeft: `3px solid ${ev.color}`,
                      background: ev.bg,
                    } : {}}>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold tracking-widest uppercase"
                        style={ev ? { color: ev.color } : { color: isDark ? '#818cf8' : '#6366f1' }}>
                        Step {safeStepIdx + 1} / {lesson.steps.length}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        isDark ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                      }`}>{lesson.tag}</span>
                      {ev && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${ev.color}22`, color: ev.color, border: `1px solid ${ev.color}55` }}>
                          {ev.label}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold"
                      style={ev ? { color: ev.color } : { color: isDark ? '#f1f5f9' : '#0f172a' }}>
                      {step.title}
                    </h2>
                  </div>
                )
              })()}
              <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
                <div className="mb-5 flex flex-col gap-3">
                  {(Array.isArray(step.explanation) ? step.explanation : [step.explanation]).map((para, pi) => (
                    <ExplanationPara key={pi} text={para} />
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  {step.active.map((h, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: HEX[h.color] }} />
                      <span className="text-[11px] text-slate-500 dark:text-slate-500">{h.label}</span>
                    </div>
                  ))}
                </div>
                {genError && <p className="mt-4 text-[11px] text-amber-500 font-mono leading-snug">{genError}</p>}
              </div>
            </>
          )}
        </div>

        {/* Resize handle — explanation ↔ Monaco */}
        <div
          onMouseDown={handleResizeStart}
          className="shrink-0 cursor-col-resize flex items-center justify-center group bg-transparent hover:bg-indigo-500/10 transition-colors"
          style={{ width: 10 }}
          title="Drag to resize"
        >
          <div className="w-0.5 h-10 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-indigo-400 dark:group-hover:bg-indigo-500 transition-colors" />
        </div>

        {/* Panel 2 — ArrowLane (left of Monaco) + Monaco */}
        <div className="flex flex-1 min-h-0">
          <ArrowLane
            connections={accumulatedConnections}
            height={laneH}
            selectedKey={selectedConn?.key}
            onSelect={setSelectedConn}
            scrollTop={scrollTop}
          />
          <div ref={laneRef} className="flex-1 min-h-0 relative">
            <Editor
              language={lesson.lang === 'ts' ? 'typescript' : 'javascript'}
              value={step.code}
              theme={themeStyles.monaco}
              beforeMount={setupOpenCalcMonaco}
              onMount={handleEditorMount}
              options={monacoOptions}
              className="h-full"
            />
            {showInput && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[13px] text-slate-300 dark:text-slate-700">paste code on the left, then Trace It</span>
              </div>
            )}
          </div>
        </div>

        {/* Variables resize handle — Monaco ↔ vars */}
        {varsOpen && (
          <div
            onMouseDown={handleVarsResizeStart}
            className="shrink-0 cursor-col-resize flex items-center justify-center group bg-transparent hover:bg-indigo-500/10 transition-colors"
            style={{ width: 10 }}
            title="Drag to resize variables"
          >
            <div className="w-0.5 h-10 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-indigo-400 dark:group-hover:bg-indigo-500 transition-colors" />
          </div>
        )}

        {/* Panel 3 — Variables (collapsible) */}
        {varsOpen ? (
          <div className="shrink-0 flex flex-col min-h-0" style={{ width: varsW }}>
            <div className="shrink-0 px-3 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-2">
              <span className="text-[9px] font-bold tracking-widest text-slate-400 dark:text-slate-600 uppercase flex-1">Variables</span>
              <button onClick={() => setVarsOpen(false)} title="Collapse variables"
                className="text-slate-400 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-300 text-xs leading-none">▶</button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-slate-950">
              <VarsPanel
                snapshot={mode === 'user' ? (step.stackSnapshot ?? []) : liveSnapshot}
                hint={showInput ? 'Paste code and click Trace It →' : 'Step through to see variables'}
              />
            </div>
          </div>
        ) : (
          <div className="shrink-0 flex flex-col items-center pt-3 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1117]"
            style={{ width: 28 }}>
            <button onClick={() => setVarsOpen(true)} title="Expand variables"
              className="text-slate-400 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-300 text-xs">◀</button>
          </div>
        )}
      </div>

      {/* Console output strip */}
      <div className="shrink-0 border-t border-slate-800 bg-slate-950 font-mono text-[11px] overflow-x-auto overflow-y-auto px-4 py-2 flex flex-col gap-0.5"
        style={{ minHeight: 36, maxHeight: 112 }}>
        <span className="text-slate-600 text-[10px] select-none">console</span>
        {(mode === 'user' ? (step.outputSoFar ?? []) : liveOutput).map((line, i) => (
          <span key={i} className="whitespace-pre leading-snug text-emerald-400">{line}</span>
        ))}
      </div>

      {/* Connection info modal */}
      {selectedConn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setSelectedConn(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-5 w-80 max-w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: HEX[selectedConn.color] || HEX.indigo }} />
              <span className="text-sm font-bold text-slate-100 flex-1">Relationship</span>
              <button onClick={() => setSelectedConn(null)}
                className="text-slate-500 hover:text-slate-300 text-lg leading-none px-1">×</button>
            </div>
            {selectedConn.type && (
              <div className="mb-2">
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                  style={{
                    background: `${HEX[selectedConn.color] || HEX.indigo}22`,
                    color: HEX[selectedConn.color] || HEX.indigo,
                    border: `1px solid ${HEX[selectedConn.color] || HEX.indigo}44`,
                  }}>
                  {CONN_TYPES[selectedConn.type] ?? selectedConn.type}
                </span>
              </div>
            )}
            <p className="text-[13px] text-slate-200 font-medium leading-snug mb-3">
              {selectedConn.label || '(no label)'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono border-t border-slate-800 pt-3">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">line {selectedConn.fromLine}</span>
              <span className="text-slate-600">──►</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">line {selectedConn.toLine}</span>
              {selectedConn.dim && (
                <span className="ml-auto text-[10px] text-slate-600 italic">established earlier</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={`shrink-0 flex items-center gap-3 px-5 py-2.5 border-t ${
        isDark ? 'bg-[#161b22] border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <button onClick={goPrev} disabled={isFirst || showInput}
          className="text-xs px-3 py-1.5 rounded font-semibold disabled:opacity-30 transition-colors bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700">
          ← Back
        </button>
        <button onClick={() => setIsPlaying(p => !p)} disabled={(isLast && !isPlaying) || showInput}
          className={`text-xs px-4 py-1.5 rounded font-bold transition-colors disabled:opacity-30 ${
            isPlaying
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
              : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-200 dark:hover:bg-indigo-900'
          }`}>
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button onClick={() => { setStepIdx(0); setIsPlaying(false) }} disabled={showInput}
          className="text-xs px-3 py-1.5 rounded disabled:opacity-30 transition-colors text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          ↺ Reset
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 dark:text-slate-600 select-none">Speed</span>
          <input type="range" min={0.5} max={3} step={0.25} value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            className="w-20 accent-indigo-500 cursor-pointer" />
          <span className="text-[10px] text-slate-500 font-mono w-7">{speed}×</span>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          {!showInput && lesson.steps.map((_, i) => (
            <button key={i} onClick={() => { setStepIdx(i); setIsPlaying(false) }}
              className={`rounded-full transition-all duration-200 ${
                i === safeStepIdx  ? 'w-5 h-2.5 bg-indigo-500'
                : i < safeStepIdx ? 'w-2.5 h-2.5 bg-indigo-300 dark:bg-indigo-700'
                                  : 'w-2.5 h-2.5 bg-slate-300 dark:bg-slate-700'
              }`} />
          ))}
          <button onClick={goNext} disabled={isLast || showInput}
            className="text-xs px-3 py-1.5 rounded font-bold disabled:opacity-30 transition-colors bg-indigo-500 dark:bg-indigo-600 text-white hover:bg-indigo-600">
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
