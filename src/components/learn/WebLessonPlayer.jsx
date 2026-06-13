import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import {
  Play, Pause, ChevronRight, ChevronLeft, ChevronDown, RotateCcw,
  ExternalLink, CheckCircle, XCircle, Terminal, Lightbulb, Check, Code2, LayoutTemplate
} from 'lucide-react'
import { useSpeech } from '../../utils/useSpeech.js'

// ── Sandbox ───────────────────────────────────────────────────────────────────

function addImplicitReturn(code) {
  const lines = code.split('\n')
  let lastIdx = -1
  for (let i = lines.length - 1; i >= 0; i--) {
    const t = lines[i].trim()
    if (t && !t.startsWith('//')) { lastIdx = i; break }
  }
  if (lastIdx === -1) return code
  const last = lines[lastIdx].trim()
  const withoutComment = last.replace(/\/\/.*$/, '').trim()
  if (!withoutComment) return code
  if (/^(const|let|var|function|class|if|for|while|do|switch|try|throw|return|{|})/.test(withoutComment)) return code
  const expr = withoutComment.replace(/;$/, '')
  lines[lastIdx] = lines[lastIdx].replace(last, `return (${expr})`)
  return lines.join('\n')
}

function runCode(code) {
  const logs = []
  const fakeConsole = {
    log:   (...args) => logs.push(args.map(a => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a))).join(' ')),
    error: (...args) => logs.push('[error] ' + args.join(' ')),
    warn:  (...args) => logs.push('[warn] '  + args.join(' ')),
  }
  try {
    const fn = new Function('console', `"use strict";\n${addImplicitReturn(code)}`)
    const result = fn(fakeConsole)
    if (result !== undefined) logs.push(String(result))
    return { logs, result, error: null }
  } catch (e) {
    return { logs, result: undefined, error: e.message }
  }
}

// ── Checkpoint persistence ────────────────────────────────────────────────────

const STORAGE_PREFIX = 'lesson_cp_'

function saveCheckpoint(lessonId, cpId, segIdx, code, files) {
  try {
    localStorage.setItem(STORAGE_PREFIX + lessonId, JSON.stringify({ cpId, segIdx, code, files }))
  } catch {}
}

function loadCheckpoint(lessonId) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + lessonId)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function clearCheckpoint(lessonId) {
  try { localStorage.removeItem(STORAGE_PREFIX + lessonId) } catch {}
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ checkpoints, reachedCp, onJump }) {
  return (
    <div className="flex items-center gap-2">
      {checkpoints.map((cp, i) => {
        const reached = reachedCp.includes(cp.id)
        return (
          <div key={cp.id} className="flex items-center gap-2">
            {i > 0 && <div className={`h-0.5 w-8 rounded ${reached ? 'bg-cyan-400' : 'bg-slate-700'}`} />}
            <button
              onClick={() => onJump?.(cp.id)}
              title={`Jump to: ${cp.label}`}
              className={`flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer`}
            >
              <div className={`w-2 h-2 rounded-full ${reached ? 'bg-cyan-400' : 'bg-slate-600'}`} />
              <span className={`text-xs ${reached ? 'text-cyan-400' : 'text-slate-500'}`}>{cp.label}</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ── Output panel ──────────────────────────────────────────────────────────────

function OutputPanel({ logs, error, challengeResult, expectedOutput, testDetail, previewDoc, language, topHeight, onDragRight, isDragging }) {
  const isWeb = language === 'html' || language === 'react' || language === 'web'
  const borderColor = challengeResult === 'pass' ? 'border-t border-t-emerald-500' : challengeResult === 'fail' ? 'border-t border-t-red-500' : 'border-t border-white/5'
  
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#050505]">
      
      {isWeb && (
        <div className="flex flex-col relative shrink-0" style={{ height: topHeight }}>
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-black/40">
            <LayoutTemplate size={14} className="text-indigo-400" />
            <span className="text-xs text-slate-400 font-mono">Browser Preview</span>
          </div>
          
          {previewDoc ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 border-b border-slate-300 shrink-0">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded shadow-sm border border-slate-200 text-slate-500 text-[11px] font-mono min-w-[200px] justify-center">
                    <span className="text-slate-400">🔒</span>
                    localhost:3000
                  </div>
                </div>
                <div className="w-10"></div>
              </div>
              <iframe 
                title="preview" 
                srcDoc={previewDoc} 
                sandbox="allow-scripts allow-same-origin" 
                className="flex-1 w-full bg-white border-none" 
                style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-sm text-slate-400 bg-[#0a0a0a]">
              <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Play size={24} className="text-slate-500 ml-1" />
              </div>
              Run the code to see the browser preview.
            </div>
          )}
        </div>
      )}

      {isWeb && (
        <div 
          className="h-1.5 hover:h-2 bg-white/5 hover:bg-indigo-500/50 cursor-row-resize shrink-0 z-30 transition-all duration-200"
          onMouseDown={onDragRight}
        />
      )}

      <div className="flex-1 overflow-y-auto p-3 font-mono text-[12px] shrink-0 bg-[#080c14] border-t border-slate-800 shadow-[inset_0_10px_20px_-10px_rgba(0,0,0,0.5)]">
        {logs.map((line, i) => (
          <div key={i} className={`leading-relaxed ${line.startsWith('[error]') || line.startsWith('[warn]') ? 'text-red-400' : 'text-green-300'}`}>
            {line}
          </div>
        ))}
        {error && <div className="text-red-400 mt-1">{error}</div>}
        {!logs.length && !error && <div className="text-slate-600 italic">Run code to see output</div>}
        {challengeResult === 'fail' && testDetail && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <div className="text-slate-500 text-xs mb-1">Test results</div>
            {testDetail.split('\n').map((line, i) => (
              <div key={i} className={`font-mono text-xs leading-relaxed ${line.includes('✗') ? 'text-red-400' : 'text-green-400'}`}>
                {line}
              </div>
            ))}
          </div>
        )}
        {challengeResult === 'fail' && !testDetail && expectedOutput && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <div className="text-slate-500 text-xs mb-1">Expected</div>
            <div className="text-cyan-300">{expectedOutput}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── New-line diff ─────────────────────────────────────────────────────────────

function diffNewLines(prevCode, nextCode) {
  if (!prevCode) return []
  const prevSet = new Set(prevCode.split('\n').map(l => l.trimEnd()))
  const nextLines = nextCode.split('\n')
  const newNums = []
  nextLines.forEach((line, i) => {
    const t = line.trimEnd()
    if (t.trim() && !prevSet.has(t)) newNums.push(i + 1)
  })
  return newNums
}

// ── Tab auto-selection ────────────────────────────────────────────────────────

function autoTab(files) {
  if ((files?.js || '').trim()) return 'js'
  if ((files?.css || '').trim()) return 'css'
  return 'html'
}

// ── Main component ────────────────────────────────────────────────────────────


export default function WebLessonPlayer({ lesson, onBack, onNext, nextTitle, seriesLessons, onJumpToLesson }) {
  const navigate = useNavigate()
  const { speak, stop: stopSpeech } = useSpeech()

  const segments = lesson.segments

  const savedCp    = loadCheckpoint(lesson.id)
  const initialIdx = savedCp ? savedCp.segIdx : 0
  const pastEnd    = initialIdx >= segments.length

  function getReachedCpsUpTo(cpId) {
    const result = []
    for (const cp of lesson.checkpoints) {
      result.push(cp.id)
      if (cp.id === cpId) break
    }
    return result
  }

  const [segIdx, setSegIdx]                   = useState(pastEnd ? segments.length - 1 : initialIdx)
  const [phase, setPhase]                     = useState(pastEnd ? 'done' : 'idle')
  const initialSeg = segments[initialIdx] || {}
  const initCode = savedCp?.code || (initialSeg.startCode ?? initialSeg.code ?? '')
  const initFiles = savedCp?.files || (initialSeg.startFiles ?? initialSeg.files ?? { html: initCode, css: '', js: '' })

  const [code, setCode]                       = useState(initCode)
  const [files, setFiles]                     = useState(initFiles)
  const [activeTab, setActiveTab]             = useState(() => autoTab(initFiles))
  const [logs, setLogs]                       = useState([])
  const [runError, setRunError]               = useState(null)
  const [challengeResult, setChallengeResult] = useState(null)
  const [testDetail, setTestDetail]           = useState(null)
  const [hint, setHint]                       = useState(false)
  const [reachedCp, setReachedCp]             = useState(savedCp ? getReachedCpsUpTo(savedCp.cpId) : [])
  const [lessonMenuOpen, setLessonMenuOpen]   = useState(false)
  const [previewDoc, setPreviewDoc]           = useState('')

  // Draggable Pane States
  const [leftWidth, setLeftWidth] = useState('40vw')
  const [topHeight, setTopHeight] = useState('60vh')
  const [isDragging, setIsDragging] = useState(false)

  const handleRunRef  = useRef(null)
  const pauseRef      = useRef(false)
  const lessonMenuRef = useRef(null)
  const editorRef     = useRef(null)
  const monacoRef     = useRef(null)
  const decorationCollRef = useRef(null)
  const prevCodeRef       = useRef('')
  const pendingDiffRef    = useRef(null)
  const highlightTimerRef = useRef(null)
  
  // Drag refs
  const isDraggingSplit   = useRef(false)
  const isDraggingRight   = useRef(false)
  const dragSplitStart    = useRef({ x: 0, w: 0 })
  const dragRightStart    = useRef({ y: 0, h: 0 })

  // Dragging event listeners
  useEffect(() => {
    const onMove = (e) => {
      if (isDraggingSplit.current) {
        e.preventDefault()
        const delta = e.clientX - dragSplitStart.current.x
        const newWidth = Math.max(200, dragSplitStart.current.w + delta)
        setLeftWidth(`${newWidth}px`)
      } else if (isDraggingRight.current) {
        e.preventDefault()
        const delta = e.clientY - dragRightStart.current.y
        const newHeight = Math.max(100, dragRightStart.current.h + delta)
        setTopHeight(`${newHeight}px`)
      }
    }
    const onUp = () => {
      if (isDraggingSplit.current || isDraggingRight.current) {
        document.body.style.cursor = 'default'
        setIsDragging(false)
      }
      isDraggingSplit.current = false
      isDraggingRight.current = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  // Close lesson dropdown on outside click
  useEffect(() => {
    if (!lessonMenuOpen) return
    function onDown(e) {
      if (lessonMenuRef.current && !lessonMenuRef.current.contains(e.target)) {
        setLessonMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [lessonMenuOpen])

  const currentSeg = segments[segIdx] ?? null
  const isChallenge = phase === 'challenge'
  const isCodeLens  = phase === 'codelens'

  // ── Playback engine ──────────────────────────────────────────────────────────

  const runFrom = useCallback(async (startIdx) => {
    pauseRef.current = false

    for (let i = startIdx; i < segments.length; i++) {
      if (pauseRef.current) return

      setSegIdx(i)
      const seg = segments[i]

      if (seg.type === 'narration') {
        setPhase('playing')
        if ((seg.code !== null && seg.code !== undefined) || seg.files) {
          const newCode = seg.code ?? ''
          const newFiles = seg.files ?? { html: newCode, css: '', js: '' }
          highlightNewLines(newCode)
          setCode(newCode)
          setFiles(newFiles)
          if (lesson.language === 'web') setActiveTab(seg.defaultTab ?? autoTab(newFiles))
          setLogs([])
          setRunError(null)
          setChallengeResult(null)
          setTestDetail(null)
          handleRunRef.current?.(newCode, newFiles)
        }
        if (seg.text) await speak(seg.text)
        if (pauseRef.current) return

        // Always pause — user clicks Next to advance at their own pace
        setPhase('paused')
        return

      } else if (seg.type === 'checkpoint') {
        saveCheckpoint(lesson.id, seg.id, i, code, files)
        setReachedCp(prev => prev.includes(seg.id) ? prev : [...prev, seg.id])

      } else if (seg.type === 'challenge') {
        setPhase('challenge')
        const newCode = seg.startCode || ''
        const newFiles = seg.startFiles || { html: newCode, css: '', js: '' }
        setCode(newCode)
        setFiles(newFiles)
        if (seg.defaultTab) setActiveTab(seg.defaultTab)
        setLogs([])
        setRunError(null)
        setChallengeResult(null)
        setTestDetail(null)
        setHint(false)
        if (seg.text) await speak(seg.text)
        return

      } else if (seg.type === 'codelens') {
        setPhase('codelens')
        if (seg.code || seg.files) {
          const newCode = seg.code ?? ''
          const newFiles = seg.files ?? { html: newCode, css: '', js: '' }
          setCode(newCode)
          setFiles(newFiles)
        }
        setLogs([])
        setRunError(null)
        if (seg.text) await speak(seg.text)
        return
      }
    }

    setPhase('done')
  }, [segments, speak, lesson.id, code, files])

  function handlePlay() {
    if (phase === 'idle')   runFrom(segIdx)
    if (phase === 'paused') runFrom(segIdx + 1)
  }

  function handlePause() {
    pauseRef.current = true
    stopSpeech()
    setPhase('paused')
  }

  function handleRestart() {
    pauseRef.current = true
    stopSpeech()
    clearCheckpoint(lesson.id)
    prevCodeRef.current = ''
    decorationCollRef.current?.clear()
    setSegIdx(0)
    setPhase('idle')
    setCode('')
    setFiles({ html: '', css: '', js: '' })
    setLogs([])
    setPreviewDoc('')
    setRunError(null)
    setChallengeResult(null)
    setTestDetail(null)
    setReachedCp([])
    setHint(false)
  }

  // ── Checkpoint jump ──────────────────────────────────────────────────────────

  function jumpToCheckpoint(cpId) {
    pauseRef.current = true
    stopSpeech()

    const cpIdx = segments.findIndex(s => s.id === cpId)
    if (cpIdx === -1) return

    // Find start of this section: first segment after the previous checkpoint
    let sectionStart = 0
    for (let i = cpIdx - 1; i >= 0; i--) {
      if (segments[i].type === 'checkpoint') { sectionStart = i + 1; break }
    }

    // Find first non-checkpoint segment in this section (skip any back-to-back checkpoints)
    let targetIdx = sectionStart
    for (let i = sectionStart; i < cpIdx; i++) {
      if (segments[i].type !== 'checkpoint') { targetIdx = i; break }
    }

    const targetSeg = segments[targetIdx]
    prevCodeRef.current = ''
    decorationCollRef.current?.clear()
    setSegIdx(targetIdx)
    const newCode = targetSeg?.startCode ?? targetSeg?.code ?? ''
    const newFiles = targetSeg?.startFiles ?? targetSeg?.files ?? { html: newCode, css: '', js: '' }
    setCode(newCode)
    setFiles(newFiles)
    if (targetSeg?.defaultTab) setActiveTab(targetSeg.defaultTab)
    else if (lesson.language === 'web') setActiveTab(autoTab(newFiles))
    setLogs([])
    setPreviewDoc('')
    setRunError(null)
    setChallengeResult(null)
    setTestDetail(null)
    setHint(false)
    setPhase('idle')
  }

  // ── Run (always available) ───────────────────────────────────────────────────

  function handleRun(overrideCode, overrideFiles) {
    const codeToRun = typeof overrideCode === 'string' ? overrideCode : code
    const filesToRun = overrideFiles || files
    
    const isMultiTab = lesson.language === 'web'
    const isHtml = lesson.language === 'html'
    const isReact = lesson.language === 'react'

    if (isMultiTab) {
      const doc = `<!DOCTYPE html>
<html>
<head>
  <style>${filesToRun.css || ''}</style>
</head>
<body>
  ${filesToRun.html || ''}
  <script type="module">
    ${filesToRun.js || ''}
  </script>
</body>
</html>`
      setPreviewDoc(doc)
      setLogs(['[info] Code is executing in the Preview pane.'])
      setRunError(null)

      if (isChallenge && currentSeg?.validate) {
        const { passed, detail } = runValidate(currentSeg, { files: filesToRun })
        setChallengeResult(passed ? 'pass' : 'fail')
        setTestDetail(passed ? null : (detail ?? null))
      }
      return
    }

    if (isHtml || isReact) {
      const doc = isHtml
        ? codeToRun
        : `<!DOCTYPE html>
<html>
<head><style>body{margin:0;font-family:sans-serif;}</style></head>
<body>
<div id="root"></div>
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel" data-type="module">
${codeToRun}
</script>
</body>
</html>`
      setPreviewDoc(doc)
      
      // Do not execute React code in the local JS runner to avoid "ReactDOM is not defined" errors.
      setLogs(['[info] Code is executing in the Preview pane.'])
      setRunError(null)

      if (isChallenge && currentSeg?.validate) {
        // Challenges might need custom handling for React
        setChallengeResult('pass')
      }
      return
    }

    // 2. Evaluate as standard JS (will capture raw evaluation errors or terminal output)
    const { logs: newLogs, result, error } = runCode(codeToRun)
    setLogs(newLogs)
    setRunError(error)
    
    if (isChallenge && currentSeg?.validate) {
      const { passed, detail } = runValidate(currentSeg, { logs: newLogs, result, error, code: codeToRun })
      setChallengeResult(passed ? 'pass' : 'fail')
      setTestDetail(passed ? null : (detail ?? null))
    }
  }
  handleRunRef.current = handleRun

  function runValidate(seg, ctx) {
    try {
      const passed = seg.validate(ctx)
      if (passed) return { passed: true }
      // Run the test cases from the segment to generate a diff
      if (seg.tests) {
        const lines = seg.tests.map(({ call, expected }) => {
          try {
            const fn = new Function('console', `"use strict";\n${ctx.code}\nreturn (${call})`)
            const got = fn({ log: () => {}, error: () => {}, warn: () => {} })
            const ok = got === expected
            return `${call} → ${JSON.stringify(got)} (expected ${JSON.stringify(expected)})${ok ? ' ✓' : ' ✗'}`
          } catch (e) {
            return `${call} → error: ${e.message} (expected ${JSON.stringify(expected)}) ✗`
          }
        })
        return { passed: false, detail: lines.join('\n') }
      }
      return { passed: false }
    } catch {
      return { passed: false }
    }
  }

  // ── CodeLens handoff ─────────────────────────────────────────────────────────

  function handleOpenCodeLens() {
    try {
      localStorage.setItem('codelens-handoff', JSON.stringify({ code, lang: 'javascript' }))
      sessionStorage.setItem('codelens_return_path', `#/learn/${lesson.series.id}/${lesson.id.replace(lesson.series.id + '-', '')}`)
      sessionStorage.setItem('codelens_return_label', lesson.title)
      // Save position PAST this codelens segment so returning doesn't replay it
      saveCheckpoint(lesson.id, 'codelens', segIdx + 1, code)
    } catch {}
    navigate('/codelens')
  }

  // ── New-line highlight ────────────────────────────────────────────────────────

  // Stage a highlight diff — the useEffect below applies it after Monaco updates
  function highlightNewLines(newCode) {
    pendingDiffRef.current = { prev: prevCodeRef.current, next: newCode }
    prevCodeRef.current = newCode
  }

  // Apply staged decorations after Monaco has received the new value
  useEffect(() => {
    const pending = pendingDiffRef.current
    if (!pending) return
    pendingDiffRef.current = null

    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) return

    const newNums = diffNewLines(pending.prev, pending.next)
    clearTimeout(highlightTimerRef.current)
    decorationCollRef.current?.clear()
    if (!newNums.length) return

    decorationCollRef.current = editor.createDecorationsCollection(
      newNums.map(line => ({
        range: new monaco.Range(line, 1, line, 1),
        options: { isWholeLine: true, className: 'lesson-new-line' },
      }))
    )

    highlightTimerRef.current = setTimeout(() => {
      decorationCollRef.current?.clear()
    }, 3000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  // ── Cleanup ───────────────────────────────────────────────────────────────────

  useEffect(() => () => { pauseRef.current = true; stopSpeech() }, [stopSpeech])

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-row h-screen bg-[#050505] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">

      {/* Left Pane */}
      <div className="flex flex-col border-r border-white/5 shrink-0 relative z-20 shadow-[10px_0_40px_rgba(0,0,0,0.5)]" style={{ width: leftWidth }}>
        
        {/* 1. Header (Nav + Title + Progress) */}
        <div className="flex items-center gap-4 px-4 py-2 border-b border-white/10 bg-black/50 backdrop-blur-md shrink-0 z-50">
          <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-white transition-all text-xs font-medium hover:-translate-x-0.5 shrink-0">
            <ChevronLeft size={14} />
            <span>Labs</span>
          </button>
          <div className="w-px h-4 bg-white/10 shrink-0" />

          <div className="flex flex-col min-w-0 relative max-w-[200px]" ref={lessonMenuRef}>
            <span className="text-[9px] text-indigo-400/80 uppercase tracking-widest font-bold mb-0.5 truncate">{lesson.series.title}</span>
            <button
              onClick={() => setLessonMenuOpen(o => !o)}
              className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-indigo-300 transition-colors text-left"
            >
              <span className="truncate">{lesson.title}</span>
              {seriesLessons?.length > 1 && <ChevronDown size={14} className="shrink-0 text-slate-500" />}
            </button>

            {lessonMenuOpen && seriesLessons?.length > 0 && (
              <div className="absolute top-full left-0 mt-2 z-50 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl min-w-72 py-2 max-h-80 overflow-y-auto backdrop-blur-xl">
                {seriesLessons.map(l => (
                  <button
                    key={l.id}
                    onClick={() => { setLessonMenuOpen(false); onJumpToLesson?.(l.path) }}
                    className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${
                      l.active
                        ? 'text-indigo-400 bg-indigo-500/10 font-medium'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="w-4 shrink-0 flex justify-center">
                      {l.active && <Check size={14} />}
                    </span>
                    <span className="truncate">{l.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />
          <div className="hidden xl:block">
            <ProgressBar checkpoints={lesson.checkpoints} reachedCp={reachedCp} onJump={jumpToCheckpoint} />
          </div>
          <div className="flex-1" />

          <button onClick={handleRestart} className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-all shrink-0" title="Restart lesson">
            <RotateCcw size={14} />
          </button>
        </div>

        {/* 2. Transport & Narration Area */}
        <div className="flex flex-col border-b border-white/10 bg-[#080808] shrink-0">
          
          {/* Controls Bar */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-black/40">
            {/* Play/Pause/Next */}
            <div className="flex items-center gap-1.5">
              {phase === 'playing' ? (
                <button onClick={handlePause} className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all shadow-md hover:scale-105 border border-white/5" title="Pause">
                  <Pause size={14} className="fill-white" />
                </button>
              ) : phase === 'idle' && !isChallenge && !isCodeLens ? (
                <button onClick={handlePlay} className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105">
                  <Play size={12} className="fill-black" /> Play
                </button>
              ) : phase === 'paused' && !isChallenge && !isCodeLens ? (
                <div className="flex items-center gap-1.5">
                  <button onClick={() => runFrom(segIdx)} className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all shadow-md hover:scale-105 border border-white/5" title="Replay">
                    <RotateCcw size={12} />
                  </button>
                  <button onClick={() => runFrom(segIdx + 1)} className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black hover:bg-slate-200 transition-all shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:scale-105" title="Next">
                    <ChevronRight size={16} />
                  </button>
                </div>
              ) : null}

              {isChallenge && challengeResult === 'pass' && (
                <button onClick={() => { setChallengeResult(null); setTestDetail(null); setHint(false); runFrom(segIdx + 1) }} className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105">
                  Continue <ChevronRight size={14} />
                </button>
              )}
              {isChallenge && challengeResult !== 'pass' && (
                <button onClick={() => { setChallengeResult(null); setTestDetail(null); setHint(false); runFrom(segIdx + 1) }} className="text-[9px] text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest font-bold ml-2">
                  Skip
                </button>
              )}
              {isCodeLens && (
                <button onClick={() => runFrom(segIdx + 1)} className="text-[9px] text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest font-bold ml-2">
                  Skip
                </button>
              )}
            </div>

            <div className="text-[9px] text-slate-500 font-mono tracking-widest uppercase ml-2">
              {Math.min(segIdx + 1, segments.length)} / {segments.length}
            </div>

            <div className="flex-1" />

            {/* Run Button */}
            <button onClick={() => handleRun()} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white hover:scale-105 text-xs font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Play size={10} className="fill-white" />
              Run
            </button>
          </div>

          {/* Text Area */}
          <div className="px-5 py-3 min-h-[60px] max-h-[25vh] overflow-y-auto">
            {isChallenge && (
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 shadow-inner">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <span className="text-amber-400 text-xs font-bold">C</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-200 leading-relaxed font-medium tracking-tight">{currentSeg.text.replace(/^Challenge\.\s*/i, '')}</p>
                    {currentSeg.hint && (
                      <div className="mt-2">
                        <button onClick={() => setHint(h => !h)} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500/70 hover:text-amber-400 transition-colors">
                          <Lightbulb size={12} /> {hint ? 'Hide Hint' : 'Show Hint'}
                        </button>
                        {hint && <p className="mt-2 text-[11px] text-amber-300 font-mono bg-amber-950/40 p-2 rounded border border-amber-900/50 leading-relaxed">{currentSeg.hint}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isCodeLens && (
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 shadow-inner flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <ExternalLink size={14} className="text-indigo-400" />
                  </div>
                  <p className="flex-1 text-sm text-slate-200 leading-relaxed font-medium tracking-tight">{currentSeg.text}</p>
                </div>
                <button
                  onClick={handleOpenCodeLens}
                  className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:scale-105 w-fit"
                >
                  Open in CodeLens <ChevronRight size={14} />
                </button>
              </div>
            )}

            {(phase === 'playing' || phase === 'paused') && currentSeg?.type === 'narration' && (
              <p className="text-[15px] text-slate-200 leading-relaxed tracking-tight font-medium">{currentSeg.text}</p>
            )}

            {phase === 'done' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <CheckCircle size={16} className="text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-emerald-400">Lesson Complete!</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Amazing work. You're ready to move on.</p>
                  </div>
                </div>
                {onNext && (
                  <button
                    onClick={onNext}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black hover:bg-slate-200 text-sm font-bold transition-all hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  >
                    {nextTitle ? `Next: ${nextTitle}` : 'Next Lesson'} <ChevronRight size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. Editor Pane */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#050505]">
          {lesson.language === 'web' ? (
            <div className="flex items-center gap-1 px-2 pt-2 border-b border-white/10 bg-[#080c14] z-10 shrink-0">
              {['html', 'css', 'js'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 text-[11px] font-mono font-bold uppercase tracking-wider rounded-t-lg transition-all ${activeTab === tab ? 'bg-[#050505] text-indigo-400 border-t-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                >
                  {tab === 'js' ? 'JavaScript' : tab}
                </button>
              ))}
              <div className="flex-1" />
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/40 z-10 shrink-0">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-2">
                <Code2 size={14} className="text-indigo-400" />
                script.{lesson.language === 'react' ? 'jsx' : lesson.language === 'html' ? 'html' : 'js'}
              </span>
              <div className="flex-1" />
              {code.trim() && (
                <button
                  onClick={handleOpenCodeLens}
                  title="Visualise this code step-by-step in CodeLens"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold transition-all border border-indigo-500/20"
                >
                  <ExternalLink size={12} />
                  CodeLens
                </button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={lesson.language === 'web' ? (activeTab === 'js' ? 'javascript' : activeTab) : (lesson.language === 'html' ? 'html' : 'javascript')}
              theme="ocean"
              value={lesson.language === 'web' ? files[activeTab] : code}
              onChange={(val) => {
                if (lesson.language === 'web') {
                  setFiles(prev => ({ ...prev, [activeTab]: val || '' }))
                } else {
                  setCode(val || '')
                }
                setChallengeResult(null)
                setTestDetail(null)
                setHint(false)
              }}
              beforeMount={(monaco) => {
                monaco.editor.defineTheme('ocean', {
                  base: 'vs-dark',
                  inherit: true,
                  rules: [
                    { background: '050505' }
                  ],
                  colors: {
                    'editor.background': '#050505',
                    'editor.lineHighlightBackground': '#111111',
                    'editorLineNumber.foreground': '#333333',
                    'editorIndentGuide.background': '#111111',
                  }
                })
              }}
              onMount={(editor, monaco) => {
                editorRef.current = editor
                monacoRef.current = monaco
              }}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                folding: false,
                contextmenu: false,
              }}
            />
          </div>
        </div>
      </div>

      {/* Resize Handle (Vertical) */}
      <div 
        className="w-1.5 hover:w-2 bg-white/5 hover:bg-indigo-500/50 cursor-col-resize shrink-0 z-30 transition-all duration-200"
        onMouseDown={(e) => { 
          const prevEl = e.currentTarget.previousElementSibling;
          dragSplitStart.current = { x: e.clientX, w: prevEl.getBoundingClientRect().width };
          isDraggingSplit.current = true; 
          setIsDragging(true); 
          document.body.style.cursor = 'col-resize' 
        }}
      />

      {/* Right Pane */}
      <div className="flex flex-col flex-1 min-w-0 bg-[#050505]">
        <OutputPanel
          logs={logs}
          error={runError}
          challengeResult={isChallenge ? challengeResult : null}
          expectedOutput={isChallenge && challengeResult === 'fail' ? currentSeg?.expectedOutput : null}
          testDetail={isChallenge && challengeResult === 'fail' ? testDetail : null}
          previewDoc={previewDoc}
          language={lesson.language}
          topHeight={topHeight}
          isDragging={isDragging}
          onDragRight={(e) => { 
            const prevEl = e.currentTarget.previousElementSibling;
            dragRightStart.current = { y: e.clientY, h: prevEl.getBoundingClientRect().height };
            isDraggingRight.current = true; 
            setIsDragging(true); 
            document.body.style.cursor = 'row-resize' 
          }}
        />
      </div>
    </div>
  )
}
