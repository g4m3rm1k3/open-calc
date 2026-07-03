import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { TUTORIALS } from '../data/canvasTutorials.js'

// ── Preview document builder (same Babel + React pattern as SceneEditorPage) ─
function buildPreviewDoc(source, dark) {
  const escaped = source
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')

  return `<!DOCTYPE html>
<html class="${dark ? 'dark' : ''}">
<head>
<meta charset="utf-8"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body,#root{width:100%;height:100%;overflow:hidden}
  body{background:${dark ? '#0f172a' : '#f8fafc'}}
</style>
</head>
<body>
<div id="root" style="position:relative;width:100%;height:100%"></div>
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel" data-presets="react">
const __src = \`${escaped}\`
try {
  const blob = new Blob([__src], { type: 'text/javascript' })
  const url = URL.createObjectURL(blob)
  const transpiled = Babel.transform(__src, { presets: ['react'] }).code
  const fn = new Function('React','ReactDOM', transpiled + '\\n;return typeof MyScene !== "undefined" ? MyScene : null')
  const Component = fn(React, ReactDOM)
  if (Component) {
    const root = ReactDOM.createRoot(document.getElementById('root'))
    root.render(React.createElement(Component))
  } else {
    document.getElementById('root').innerHTML = '<p style="color:#f87171;padding:12px;font-family:monospace">No default export named MyScene found.</p>'
  }
} catch(e) {
  document.getElementById('root').innerHTML = '<pre style="color:#f87171;padding:12px;font-family:monospace;font-size:11px;white-space:pre-wrap">' + e.message + '</pre>'
}
</script>
</body>
</html>`
}

// ── Content block renderer ────────────────────────────────────────────────────
function renderInline(text) {
  // Support **bold** and `code`
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[11px] font-mono text-indigo-600 dark:text-indigo-300">{part.slice(1, -1)}</code>
    }
    return part
  })
}

function ContentBlock({ block }) {
  switch (block.type) {
    case 'build':
      return (
        <div className="border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 rounded-r-lg px-4 py-3 mb-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">What you'll build</div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{renderInline(block.text)}</p>
        </div>
      )
    case 'h3':
      return <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-5 mb-2">{block.text}</h3>
    case 'p':
      return <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{renderInline(block.text)}</p>
    case 'code': {
      // Multiline code block
      const lines = block.text.split('\n')
      return (
        <pre className="bg-slate-900 dark:bg-slate-950 rounded-lg p-3 mb-3 overflow-x-auto text-[11px] font-mono text-slate-200 leading-relaxed">
          {lines.map((line, i) => <div key={i}>{line || ' '}</div>)}
        </pre>
      )
    }
    case 'walk':
      return (
        <div className="ml-3 border-l-2 border-slate-300 dark:border-slate-600 pl-3 mb-3">
          {block.text.split('\n\n').map((para, i) => (
            <p key={i} className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed mb-2">{renderInline(para)}</p>
          ))}
        </div>
      )
    case 'cs':
      return (
        <div className="border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/40 rounded-lg px-4 py-3 mb-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-1">CS Concept</div>
          <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">{renderInline(block.text)}</p>
        </div>
      )
    case 'se':
      return (
        <div className="border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/40 rounded-lg px-4 py-3 mb-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-1">SE Principle</div>
          <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">{renderInline(block.text)}</p>
        </div>
      )
    case 'breaks':
      return (
        <div className="border border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/40 rounded-lg px-4 py-3 mb-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-1">What breaks</div>
          <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">{renderInline(block.text)}</p>
        </div>
      )
    case 'note':
      return (
        <div className="border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 rounded-lg px-4 py-3 mb-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">Try it</div>
          <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">{renderInline(block.text)}</p>
        </div>
      )
    default:
      return null
  }
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CanvasTutorialsPage() {
  const navigate = useNavigate()
  const { tutorialId, stepId } = useParams()

  const isDark = () => document.documentElement.classList.contains('dark')

  // Resolve active tutorial + step from URL params (or default to first)
  const activeTutorial = TUTORIALS.find(t => t.id === tutorialId) ?? TUTORIALS[0]
  const activeStep = activeTutorial.steps.find(s => s.id === stepId) ?? activeTutorial.steps[0]
  const stepIndex = activeTutorial.steps.indexOf(activeStep)

  const [source, setSource] = useState(activeStep.starterCode)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  const editorRef = useRef(null)
  const saveHandlerRef = useRef(null)

  function goTo(tutId, stId) {
    navigate(`/dev/canvas-tutorials/${tutId}/${stId}`)
  }

  // When step changes, reset editor to starter code
  useEffect(() => {
    const code = showAnswer ? activeStep.completeCode : activeStep.starterCode
    setSource(code)
    editorRef.current?.setValue(code)
    setShowAnswer(false)
    setPreviewDoc(null)
  }, [activeStep.id])

  const handleRefreshPreview = useCallback(() => {
    setPreviewDoc(buildPreviewDoc(source, isDark()))
    setPreviewKey(k => k + 1)
  }, [source])

  saveHandlerRef.current = handleRefreshPreview

  const handleMonacoMount = useCallback((editor, monaco) => {
    editorRef.current = editor
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => saveHandlerRef.current()
    )
  }, [])

  function handleShowAnswer() {
    const code = activeStep.completeCode
    setSource(code)
    editorRef.current?.setValue(code)
    setShowAnswer(true)
    setPreviewDoc(buildPreviewDoc(code, isDark()))
    setPreviewKey(k => k + 1)
  }

  function handleResetStarter() {
    const code = activeStep.starterCode
    setSource(code)
    editorRef.current?.setValue(code)
    setShowAnswer(false)
    setPreviewDoc(null)
  }

  const prevStep = stepIndex > 0 ? activeTutorial.steps[stepIndex - 1] : null
  const nextStep = stepIndex < activeTutorial.steps.length - 1 ? activeTutorial.steps[stepIndex + 1] : null

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2 bg-slate-900 border-b border-slate-800">
        <button
          onClick={() => navigate('/dev/scene-editor')}
          className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800 transition-colors"
        >
          ← Editor
        </button>
        <div className="h-4 w-px bg-slate-700" />

        {/* Tutorial selector */}
        <div className="flex items-center gap-1">
          {TUTORIALS.map(t => (
            <button
              key={t.id}
              onClick={() => goTo(t.id, t.steps[0].id)}
              className={`text-xs font-semibold px-3 py-1 rounded transition-colors ${
                t.id === activeTutorial.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-slate-700" />
        <span className="text-xs text-slate-500">
          Step {stepIndex + 1} / {activeTutorial.steps.length}
        </span>
        <div className="flex-1" />

        {/* Answer / reset */}
        <button
          onClick={handleResetStarter}
          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
        >
          ↺ Reset
        </button>
        <button
          onClick={handleShowAnswer}
          className="text-xs text-amber-400 hover:text-amber-300 px-2 py-1 rounded hover:bg-amber-950/40 border border-amber-700/50 hover:border-amber-600 transition-colors"
        >
          Show Answer
        </button>
      </div>

      {/* ── 3-column body ───────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* ── Column 1: Lesson content (35%) ──────────────────────── */}
        <div className="w-[35%] shrink-0 flex flex-col border-r border-slate-800 overflow-hidden">

          {/* Step selector tabs */}
          <div className="shrink-0 flex gap-1 px-3 pt-3 pb-2 border-b border-slate-800 bg-slate-900/60 overflow-x-auto">
            {activeTutorial.steps.map((step, i) => (
              <button
                key={step.id}
                onClick={() => goTo(activeTutorial.id, step.id)}
                className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded transition-colors ${
                  step.id === activeStep.id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                }`}
              >
                {i + 1}. {step.title}
              </button>
            ))}
          </div>

          {/* Lesson content */}
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-base font-bold text-white mb-1">{activeStep.title}</h2>
            <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest mb-4">
              {activeTutorial.title} · Step {stepIndex + 1}
            </p>

            {activeStep.content.map((block, i) => (
              <ContentBlock key={i} block={block} />
            ))}

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800">
              <button
                onClick={() => prevStep && goTo(activeTutorial.id, prevStep.id)}
                disabled={!prevStep}
                className="text-xs px-3 py-1.5 rounded border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← {prevStep ? prevStep.title : 'Previous'}
              </button>
              <button
                onClick={() => nextStep && goTo(activeTutorial.id, nextStep.id)}
                disabled={!nextStep}
                className="text-xs px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {nextStep ? nextStep.title : 'Done'} →
              </button>
            </div>
          </div>
        </div>

        {/* ── Column 2: Monaco editor (40%) ───────────────────────── */}
        <div className="w-[40%] shrink-0 flex flex-col border-r border-slate-800">
          <div className="shrink-0 flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border-b border-slate-800">
            <span className="text-[10px] font-mono text-slate-500">MyScene.jsx</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-600">⌘S to run</span>
              <button
                onClick={handleRefreshPreview}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 px-2 py-0.5 rounded border border-indigo-800 hover:border-indigo-600 transition-colors"
              >
                ▶ Run
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              defaultValue={source}
              theme="vs-dark"
              options={{
                fontSize: 12,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                padding: { top: 8 },
                overviewRulerLanes: 0,
                renderLineHighlight: 'line',
                folding: false,
              }}
              onChange={value => setSource(value ?? '')}
              onMount={handleMonacoMount}
            />
          </div>
        </div>

        {/* ── Column 3: Preview (25%) ──────────────────────────────── */}
        <div className="flex-1 flex flex-col">
          <div className="shrink-0 flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border-b border-slate-800">
            <span className="text-[10px] text-slate-500">Preview</span>
            {previewDoc && (
              <button
                onClick={() => {
                  setPreviewDoc(buildPreviewDoc(source, isDark()))
                  setPreviewKey(k => k + 1)
                }}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
              >
                ↻ Refresh
              </button>
            )}
          </div>
          <div className="flex-1 relative bg-slate-950">
            {previewDoc ? (
              <iframe
                key={previewKey}
                srcDoc={previewDoc}
                sandbox="allow-scripts"
                className="absolute inset-0 w-full h-full border-0"
                title="Canvas preview"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 text-xl">▶</div>
                <p className="text-xs text-slate-500">Type your code in the editor<br />then press <span className="font-mono">⌘S</span> or click <span className="text-indigo-400 font-semibold">Run</span></p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
