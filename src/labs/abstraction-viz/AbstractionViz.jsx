import { useState, useEffect, useCallback, useRef } from 'react'
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
      ].join('')
    }),
  ].join('\n')
  const el = document.createElement('style')
  el.textContent = rules
  document.head.appendChild(el)
}

// ── Arrow lane ─────────────────────────────────────────────────────────────────
const LANE_W  = 56
const LINE_H  = 20
const PAD_TOP = 16

function ArrowLane({ connections, height }) {
  if (!connections.length) return <div style={{ width: LANE_W }} />
  return (
    <div className="shrink-0 relative bg-transparent" style={{ width: LANE_W }}>
      <svg width={LANE_W} height={height} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {connections.map((c, i) => {
          const col = HEX[c.color] || HEX.indigo
          const y1  = (c.fromLine - 1) * LINE_H + PAD_TOP + LINE_H * 0.5
          const y2  = (c.toLine   - 1) * LINE_H + PAD_TOP + LINE_H * 0.5
          const x0  = 4
          const cx  = LANE_W - 6
          const d   = `M ${x0} ${y1} C ${cx} ${y1} ${cx} ${y2} ${x0} ${y2}`
          const my  = (y1 + y2) / 2
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={col} strokeWidth={1.5} opacity={0.8} />
              <circle cx={x0} cy={y1} r={3} fill={col} />
              <circle cx={x0} cy={y2} r={3} fill={col} />
              {c.label && (
                <text x={cx - 2} y={my + 3} fontSize={8} textAnchor="middle"
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

  const varRow = (k, v, dimmed = false) => (
    <div key={k} className="flex items-baseline gap-1.5 py-0.5">
      <span className={`font-mono text-[10px] shrink-0 ${dimmed ? 'text-slate-600' : 'text-slate-400 dark:text-slate-400'}`}>{k}</span>
      <span className={`font-mono text-[10px] truncate ${dimmed ? 'text-slate-500' : 'text-emerald-400'}`}>{fmtVal(v)}</span>
    </div>
  )

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
          {Object.entries(frame.locals ?? {}).map(([k, v]) => varRow(k, v))}
        </div>
      ))}

      {globalVars.length > 0 && (
        <div>
          <div className="text-[9px] font-bold tracking-widest text-slate-600 uppercase mb-1">global</div>
          {globalVars.map(([k, v]) => varRow(k, v, true))}
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

  const editorRef = useRef(null)
  const monacoRef = useRef(null)
  const decorRef  = useRef(null)
  const laneRef   = useRef(null)

  const lesson = (mode === 'user' && userLesson)
    ? userLesson
    : (LESSONS[lessonIdx] ?? LESSONS[0])
  const safeStepIdx = Math.min(stepIdx, lesson.steps.length - 1)
  const step        = (mode === 'user' && !userLesson) ? EMPTY_STEP : (lesson.steps[safeStepIdx] ?? EMPTY_STEP)
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

  function handleEditorMount(editor, monaco) {
    editorRef.current = editor
    monacoRef.current = monaco
    ensureCSS()
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
    setStepIdx(0); setIsPlaying(false); decorRef.current = null
  }, [lessonIdx])

  useEffect(() => {
    setStepIdx(0); setIsPlaying(false); decorRef.current = null
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

        {/* Panel 1 — Explanation */}
        <div className="flex flex-col min-h-0 border-r border-slate-200 dark:border-slate-800" style={{ width: '26%' }}>
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
              <div className="shrink-0 px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold tracking-widest text-indigo-500 dark:text-indigo-400 uppercase">
                    Step {safeStepIdx + 1} / {lesson.steps.length}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    isDark ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                  }`}>{lesson.tag}</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{step.title}</h2>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
                <div className="mb-5 flex flex-col gap-3">
                  {(Array.isArray(step.explanation) ? step.explanation : [step.explanation]).map((para, pi) => (
                    <p key={pi} className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">{para}</p>
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

        {/* Panel 2 — Monaco + arrows */}
        <div className="flex flex-1 min-h-0">
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
          <ArrowLane connections={step.connections} height={laneH} />
        </div>

        {/* Panel 3 — Variables */}
        <div className={`flex flex-col min-h-0 border-l border-slate-200 dark:border-slate-800`} style={{ width: '20%' }}>
          <div className="shrink-0 px-3 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-[9px] font-bold tracking-widest text-slate-400 dark:text-slate-600 uppercase">Variables</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-slate-950">
            <VarsPanel
              snapshot={mode === 'user' ? (step.stackSnapshot ?? []) : liveSnapshot}
              hint={showInput ? 'Paste code and click Trace It →' : 'Step through to see variables'}
            />
          </div>
        </div>
      </div>

      {/* Console output strip */}
      <div className="shrink-0 border-t border-slate-800 bg-slate-950 font-mono text-[11px] overflow-x-auto overflow-y-auto px-4 py-2 flex flex-col gap-0.5"
        style={{ minHeight: 36, maxHeight: 112 }}>
        <span className="text-slate-600 text-[10px] select-none">console</span>
        {(mode === 'user' ? (step.outputSoFar ?? []) : liveOutput).map((line, i) => (
          <span key={i} className="whitespace-pre leading-snug text-emerald-400">{line}</span>
        ))}
      </div>

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
