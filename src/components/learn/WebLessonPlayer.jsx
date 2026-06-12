import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import {
  Play, Pause, ChevronRight, ChevronLeft, ChevronDown, RotateCcw,
  ExternalLink, CheckCircle, XCircle, Terminal, Lightbulb, Check,
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

function saveCheckpoint(lessonId, cpId, segIdx, code) {
  try {
    localStorage.setItem(STORAGE_PREFIX + lessonId, JSON.stringify({ cpId, segIdx, code }))
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

function OutputPanel({ logs, error, challengeResult, expectedOutput, testDetail, previewDoc, language }) {
  const isWeb = language === 'html' || language === 'react'
  const borderColor = challengeResult === 'pass' ? 'border-l-2 border-l-green-500' : challengeResult === 'fail' ? 'border-l-2 border-l-red-500' : ''
  return (
    <div className={`flex flex-col h-full bg-[#070b13] border-l border-slate-800 ${borderColor}`}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800 shrink-0">
        <Terminal size={14} className="text-slate-500" />
        <span className="text-xs text-slate-500 font-mono">{isWeb ? 'Preview & Output' : 'Output'}</span>
        {challengeResult === 'pass' && (
          <span className="ml-auto flex items-center gap-1 text-xs text-green-400">
            <CheckCircle size={12} /> Correct
          </span>
        )}
        {challengeResult === 'fail' && (
          <span className="ml-auto flex items-center gap-1 text-xs text-red-400">
            <XCircle size={12} /> Try again
          </span>
        )}
      </div>

      {isWeb && (
        <div className="flex-1 min-h-0 border-b border-slate-800 flex flex-col bg-white relative">
          {previewDoc
            ? <iframe title="preview" srcDoc={previewDoc} sandbox="allow-scripts allow-same-origin" className="absolute inset-0 w-full h-full border-none" />
            : <div className="flex-1 flex items-center justify-center text-xs text-slate-500 bg-[#070b13]">Run the code to see the preview.</div>
          }
        </div>
      )}

      <div className={`${isWeb ? 'h-48' : 'flex-1'} overflow-y-auto p-3 font-mono text-sm shrink-0`}>
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
  const [code, setCode]                       = useState(savedCp?.code || '')
  const [logs, setLogs]                       = useState([])
  const [runError, setRunError]               = useState(null)
  const [challengeResult, setChallengeResult] = useState(null)
  const [testDetail, setTestDetail]           = useState(null)
  const [hint, setHint]                       = useState(false)
  const [reachedCp, setReachedCp]             = useState(savedCp ? getReachedCpsUpTo(savedCp.cpId) : [])
  const [lessonMenuOpen, setLessonMenuOpen]   = useState(false)
  const [previewDoc, setPreviewDoc]           = useState('')

  const handleRunRef  = useRef(null)
  const pauseRef      = useRef(false)
  const lessonMenuRef = useRef(null)
  const editorRef     = useRef(null)
  const monacoRef     = useRef(null)
  const decorationCollRef = useRef(null)
  const prevCodeRef       = useRef('')
  const pendingDiffRef    = useRef(null)
  const highlightTimerRef = useRef(null)

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
        if (seg.code !== null && seg.code !== undefined) {
          highlightNewLines(seg.code)
          setCode(seg.code)
          setLogs([])
          setRunError(null)
          setChallengeResult(null)
          setTestDetail(null)
          handleRunRef.current?.(seg.code)
        }
        if (seg.text) await speak(seg.text)
        if (pauseRef.current) return

        // Always pause — user clicks Next to advance at their own pace
        setPhase('paused')
        return

      } else if (seg.type === 'checkpoint') {
        saveCheckpoint(lesson.id, seg.id, i, code)
        setReachedCp(prev => prev.includes(seg.id) ? prev : [...prev, seg.id])

      } else if (seg.type === 'challenge') {
        setPhase('challenge')
        setCode(seg.startCode || '')
        setLogs([])
        setRunError(null)
        setChallengeResult(null)
        setTestDetail(null)
        setHint(false)
        if (seg.text) await speak(seg.text)
        return

      } else if (seg.type === 'codelens') {
        setPhase('codelens')
        if (seg.code) setCode(seg.code)
        setLogs([])
        setRunError(null)
        if (seg.text) await speak(seg.text)
        return
      }
    }

    setPhase('done')
  }, [segments, speak, lesson.id, code])

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
    setCode(targetSeg?.startCode ?? targetSeg?.code ?? '')
    setLogs([])
    setPreviewDoc('')
    setRunError(null)
    setChallengeResult(null)
    setTestDetail(null)
    setHint(false)
    setPhase('idle')
  }

  // ── Run (always available) ───────────────────────────────────────────────────

  function handleRun(overrideCode) {
    const codeToRun = typeof overrideCode === 'string' ? overrideCode : code
    
    // 1. Generate Web Preview if applicable
    const isHtml = lesson.language === 'html'
    const isReact = lesson.language === 'react'
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
    <div className="flex flex-col h-screen bg-[#08111f] text-slate-100 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-800 bg-[#080c14] shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm">
          <ChevronLeft size={16} />
          <span>Labs</span>
        </button>
        <div className="w-px h-4 bg-slate-700" />

        {/* Lesson title / series dropdown */}
        <div className="flex flex-col min-w-0 relative" ref={lessonMenuRef}>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">{lesson.series.title}</span>
          <button
            onClick={() => setLessonMenuOpen(o => !o)}
            className="flex items-center gap-1 text-sm font-semibold text-slate-100 hover:text-cyan-300 transition-colors text-left"
          >
            <span className="truncate max-w-56">{lesson.title}</span>
            {seriesLessons?.length > 1 && <ChevronDown size={12} className="shrink-0 text-slate-500" />}
          </button>

          {lessonMenuOpen && seriesLessons?.length > 0 && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-[#0d1624] border border-slate-700 rounded-lg shadow-2xl min-w-72 py-1 max-h-80 overflow-y-auto">
              {seriesLessons.map(l => (
                <button
                  key={l.id}
                  onClick={() => { setLessonMenuOpen(false); onJumpToLesson?.(l.path) }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                    l.active
                      ? 'text-cyan-400 bg-cyan-500/10'
                      : 'text-slate-300 hover:bg-slate-700/60'
                  }`}
                >
                  <span className="w-4 shrink-0">
                    {l.active && <Check size={12} />}
                  </span>
                  <span className="truncate">{l.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />
        <ProgressBar checkpoints={lesson.checkpoints} reachedCp={reachedCp} onJump={jumpToCheckpoint} />
        <div className="flex-1" />
        <button onClick={handleRestart} className="text-slate-500 hover:text-slate-300 transition-colors" title="Restart lesson">
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Editor + Output */}
      <div className="flex flex-1 overflow-hidden">

        {/* Editor pane */}
        <div className="flex flex-col w-1/2 border-r border-slate-800">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800 bg-[#080c14]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <span className="text-xs text-slate-500 font-mono ml-1">script.js</span>
            <div className="flex-1" />
            {code.trim() && (
              <button
                onClick={handleOpenCodeLens}
                title="Visualise this code step-by-step in CodeLens"
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors shadow shadow-cyan-900/40"
              >
                <ExternalLink size={11} />
                Open in CodeLens
              </button>
            )}
            <button
              onClick={() => handleRun()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-700/80 hover:bg-green-600 text-white text-xs font-semibold transition-colors"
            >
              <Play size={11} />
              Run
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={lesson.language === 'html' ? 'html' : 'javascript'}
              theme="vs-dark"
              value={code}
              onChange={setCode}
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

        {/* Output pane */}
        <div className="flex flex-col w-1/2">
          <OutputPanel
            logs={logs}
            error={runError}
            challengeResult={isChallenge ? challengeResult : null}
            expectedOutput={isChallenge && challengeResult === 'fail' ? currentSeg?.expectedOutput : null}
            testDetail={isChallenge && challengeResult === 'fail' ? testDetail : null}
            previewDoc={previewDoc}
            language={lesson.language}
          />
        </div>
      </div>

      {/* Bottom strip */}
      <div className="shrink-0 border-t border-slate-800 bg-[#080c14]">

        {/* Challenge prompt */}
        {isChallenge && (
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 text-[10px] font-bold">C</span>
              </div>
              <p className="flex-1 text-sm text-slate-200">{currentSeg.text.replace(/^Challenge\.\s*/i, '')}</p>
              {currentSeg.hint && (
                <button onClick={() => setHint(h => !h)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-400 transition-colors shrink-0">
                  <Lightbulb size={13} />
                  Hint
                </button>
              )}
            </div>
            {hint && currentSeg.hint && (
              <p className="mt-1.5 ml-8 text-xs text-cyan-400 font-mono">{currentSeg.hint}</p>
            )}
          </div>
        )}

        {/* CodeLens invite */}
        {isCodeLens && (
          <div className="px-4 py-4 border-b border-cyan-900/40 bg-cyan-950/30">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <ExternalLink size={15} className="text-cyan-400" />
              </div>
              <p className="flex-1 text-sm text-slate-200 leading-relaxed">{currentSeg.text}</p>
              <button
                onClick={handleOpenCodeLens}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold transition-all shadow-lg shadow-cyan-900/50 hover:shadow-cyan-700/50 shrink-0 hover:scale-105"
              >
                <ExternalLink size={14} />
                Open in CodeLens →
              </button>
            </div>
          </div>
        )}

        {/* Narration text — stays visible while playing AND while paused on this segment */}
        {(phase === 'playing' || phase === 'paused') && currentSeg?.type === 'narration' && (
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-sm text-slate-300 leading-relaxed">{currentSeg.text}</p>
          </div>
        )}

        {/* Done */}
        {phase === 'done' && (
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-4">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle size={15} />
              Lesson complete — great work!
            </div>
            {onNext && (
              <button
                onClick={onNext}
                className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
              >
                {nextTitle ? `Next: ${nextTitle}` : 'Next Lesson'}
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}

        {/* Transport */}
        <div className="flex items-center gap-3 px-4 py-2.5">

          {phase === 'playing' ? (
            <button onClick={handlePause} className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors">
              <Pause size={14} /> Pause
            </button>
          ) : phase === 'idle' && !isChallenge && !isCodeLens ? (
            <button onClick={handlePlay} className="flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors">
              <Play size={14} /> Play
            </button>
          ) : phase === 'paused' && !isChallenge && !isCodeLens ? (
            <>
              <button
                onClick={() => runFrom(segIdx)}
                className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors"
                title="Replay this segment from the beginning"
              >
                <RotateCcw size={13} /> Replay
              </button>
              <button
                onClick={() => runFrom(segIdx + 1)}
                className="flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
                title="Move to the next segment"
              >
                Next <ChevronRight size={14} />
              </button>
            </>
          ) : null}

          {isChallenge && challengeResult === 'pass' && (
            <button
              onClick={() => { setChallengeResult(null); setTestDetail(null); setHint(false); runFrom(segIdx + 1) }}
              className="flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
            >
              Continue <ChevronRight size={14} />
            </button>
          )}

          {isChallenge && challengeResult !== 'pass' && (
            <button
              onClick={() => { setChallengeResult(null); setTestDetail(null); setHint(false); runFrom(segIdx + 1) }}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              Skip challenge
            </button>
          )}

          {isCodeLens && (
            <button
              onClick={() => runFrom(segIdx + 1)}
              className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors"
            >
              Continue without CodeLens <ChevronRight size={14} />
            </button>
          )}

          <div className="flex-1" />

          <span className="text-xs text-slate-600 font-mono">
            {Math.min(segIdx + 1, segments.length)} / {segments.length}
          </span>
        </div>
      </div>
    </div>
  )
}
