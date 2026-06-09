import { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import Editor from '@monaco-editor/react'
import { setupOpenCalcMonaco } from '../../utils/monacoThemes.js'
import {
  X,
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FilePenLine,
  FilePlus,
  Download,
  Edit2,
  Eye,
  Upload,
  RefreshCcw,
  Code2,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { buildOptionalBackendUrl } from '../../utils/optionalBackend.js'
import { RUNNABLE_LANGS, runJSInline, runTSInline, runPythonInline, runOpenMATInline } from '../../utils/inlineRunner.js'
import DocsCodeWorkspace from './DocsCodeWorkspace.jsx'
import AdaPanel from './AdaPanel.jsx'

const DOCS_MODULES = import.meta.glob('/src/docs/**/*.md', {
  query: '?raw',
  import: 'default',
})

const PREFIX = '/src/docs/'
const LS_KEY = 'markdownhub_personal'

const LANG_EXT = { javascript: 'js', js: 'js', python: 'py', py: 'py', typescript: 'ts', ts: 'ts', css: 'css', html: 'html', markup: 'html', bash: 'sh', shell: 'sh', json: 'json', text: 'txt' }
const MONACO_LANG = { py: 'python', js: 'javascript', ts: 'typescript', sh: 'shell', xml: 'html', markup: 'html', bash: 'shell' }
const WORKSPACE_LANG = { python: 'python', javascript: 'javascript', typescript: 'typescript', html: 'html', css: 'javascript', shell: 'javascript', json: 'javascript', plaintext: 'javascript', matlab: 'openmat', openmat: 'openmat' }

const TERM_REFS = {
  // Python dunder methods
  '__init__':       { desc: 'Constructor — runs automatically when an instance is created.', url: 'https://docs.python.org/3/reference/datamodel.html#object.__init__', src: 'py' },
  '__str__':        { desc: 'Returns the human-readable string representation of an object.', url: 'https://docs.python.org/3/reference/datamodel.html#object.__str__', src: 'py' },
  '__repr__':       { desc: 'Returns the developer-facing unambiguous string representation.', url: 'https://docs.python.org/3/reference/datamodel.html#object.__repr__', src: 'py' },
  '__len__':        { desc: 'Called by len() — return the length of the container.', url: 'https://docs.python.org/3/reference/datamodel.html#object.__len__', src: 'py' },
  '__eq__':         { desc: 'Defines == comparison between two objects.', url: 'https://docs.python.org/3/reference/datamodel.html#object.__eq__', src: 'py' },
  '__call__':       { desc: 'Makes an instance callable like a function: obj(args).', url: 'https://docs.python.org/3/reference/datamodel.html#object.__call__', src: 'py' },
  '__enter__':      { desc: 'Called on entering a with block — returns the context resource.', url: 'https://docs.python.org/3/reference/datamodel.html#object.__enter__', src: 'py' },
  '__exit__':       { desc: 'Called on leaving a with block — handles cleanup and exceptions.', url: 'https://docs.python.org/3/reference/datamodel.html#object.__exit__', src: 'py' },
  '__slots__':      { desc: 'Restricts instance attributes to a fixed set, reducing memory.', url: 'https://docs.python.org/3/reference/datamodel.html#slots', src: 'py' },
  // Python decorators / builtins
  '@property':      { desc: 'Turns a method into a read-only attribute with optional setter.', url: 'https://docs.python.org/3/library/functions.html#property', src: 'py' },
  '@classmethod':   { desc: 'Method bound to the class, not the instance — receives cls as first arg.', url: 'https://docs.python.org/3/library/functions.html#classmethod', src: 'py' },
  '@staticmethod':  { desc: 'Method with no implicit first argument — a plain function in a class.', url: 'https://docs.python.org/3/library/functions.html#staticmethod', src: 'py' },
  '@abstractmethod':{ desc: 'Marks a method as abstract — subclasses must implement it or cannot be instantiated.', url: 'https://docs.python.org/3/library/abc.html#abc.abstractmethod', src: 'py' },
  '@dataclass':     { desc: 'Auto-generates __init__, __repr__, __eq__ and more from field annotations.', url: 'https://docs.python.org/3/library/dataclasses.html', src: 'py' },
  'super()':        { desc: 'Returns a proxy to call methods from a parent class in the MRO chain.', url: 'https://docs.python.org/3/library/functions.html#super', src: 'py' },
  'isinstance()':   { desc: 'Returns True if the object is an instance of the class or tuple of classes.', url: 'https://docs.python.org/3/library/functions.html#isinstance', src: 'py' },
  'issubclass()':   { desc: 'Returns True if a class is a subclass of another.', url: 'https://docs.python.org/3/library/functions.html#issubclass', src: 'py' },
  'ABC':            { desc: 'Abstract Base Class helper — inherit from this to create abstract classes.', url: 'https://docs.python.org/3/library/abc.html#abc.ABC', src: 'py' },
  // JS / Web MDN
  'addEventListener':     { desc: 'Registers an event handler on an EventTarget (element, document, window).', url: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener', src: 'mdn' },
  'removeEventListener':  { desc: 'Removes a previously registered event listener from an EventTarget.', url: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener', src: 'mdn' },
  'querySelector':        { desc: 'Returns the first element in the document matching a CSS selector.', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector', src: 'mdn' },
  'querySelectorAll':     { desc: 'Returns a NodeList of all elements matching a CSS selector.', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll', src: 'mdn' },
  'fetch':                { desc: 'Makes a network request and returns a Promise resolving to a Response.', url: 'https://developer.mozilla.org/en-US/docs/Web/API/fetch', src: 'mdn' },
  'Promise':              { desc: 'Represents the eventual completion or failure of an async operation.', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise', src: 'mdn' },
  'localStorage':         { desc: "Persists key-value data in the browser with no expiry.", url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage', src: 'mdn' },
  'Object.keys':          { desc: "Returns an array of an object's own enumerable property names.", url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys', src: 'mdn' },
  'Object.values':        { desc: "Returns an array of an object's own enumerable property values.", url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values', src: 'mdn' },
  'Object.entries':       { desc: "Returns an array of [key, value] pairs for an object's own properties.", url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries', src: 'mdn' },
  'JSON.parse':           { desc: 'Parses a JSON string and constructs the JavaScript value it describes.', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse', src: 'mdn' },
  'JSON.stringify':       { desc: 'Converts a JavaScript value to a JSON string.', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify', src: 'mdn' },
}

function buildTree(modulePaths) {
  const root = []
  ;[...modulePaths].sort().forEach((modulePath) => {
    const rel = modulePath.slice(PREFIX.length)
    const parts = rel.split('/')
    let nodes = root

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1
      if (isFile) {
        nodes.push({ type: 'file', name: part, path: modulePath })
      } else {
        let dir = nodes.find((node) => node.type === 'dir' && node.name === part)
        if (!dir) {
          dir = { type: 'dir', name: part, children: [], open: false }
          nodes.push(dir)
        }
        nodes = dir.children
      }
    })
  })
  return root
}

function displayName(value) {
  return String(value)
    .replace(/\.md$/i, '')
    .replace(/^\d+-/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function loadPersonal() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

function savePersonal(files) {
  localStorage.setItem(LS_KEY, JSON.stringify(files))
}

const MD_CSS = `
.md-body { line-height: 1.75; font-size: 15px; max-width: 860px; color: #334155; }
.dark .md-body { color: #e2e8f0; }
.md-body h1 { font-size: 2em; font-weight: 700; margin: 0 0 0.5em; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; }
.dark .md-body h1 { color: #f8fafc; border-bottom-color: #334155; }
.md-body h2 { font-size: 1.4em; font-weight: 700; margin: 1.8em 0 0.5em; color: #2563eb; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.2em; }
.dark .md-body h2 { color: #60a5fa; border-bottom-color: #1e293b; }
.md-body h3 { font-size: 1.15em; font-weight: 600; margin: 1.4em 0 0.4em; color: #059669; }
.dark .md-body h3 { color: #34d399; }
.md-body h4 { font-size: 1em; font-weight: 600; margin: 1.2em 0 0.3em; color: #d97706; }
.dark .md-body h4 { color: #fbbf24; }
.md-body p { margin: 0 0 1em; }
.md-body a { color: #2563eb; text-decoration: underline; }
.dark .md-body a { color: #60a5fa; }
.md-body code { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px 6px; font-size: 0.85em; font-family: 'JetBrains Mono', monospace; color: #7c3aed; }
.dark .md-body code { background: #1e293b; border-color: #334155; color: #c084fc; }
.md-body pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; overflow-x: auto; margin: 0 0 1.2em; }
.dark .md-body pre { background: #0f172a; border-color: #1e293b; }
.md-body pre code { background: none; border: none; padding: 0; color: #334155; }
.dark .md-body pre code { color: #e2e8f0; }
.md-body blockquote { border-left: 3px solid #3b82f6; margin: 0 0 1em; padding: 8px 16px; background: rgba(59,130,246,0.05); border-radius: 0 4px 4px 0; color: #64748b; }
.dark .md-body blockquote { border-left-color: #60a5fa; background: rgba(96,165,250,0.05); color: #94a3b8; }
.md-body ul, .md-body ol { margin: 0 0 1em 1.4em; }
.md-body li { margin-bottom: 0.3em; }
.md-body table { border-collapse: collapse; width: 100%; margin: 0 0 1.2em; font-size: 0.9em; }
.md-body th { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; color: #475569; font-weight: 600; }
.dark .md-body th { background: #1e293b; border-color: #334155; color: #cbd5e1; }
.md-body td { border: 1px solid #e2e8f0; padding: 7px 12px; }
.dark .md-body td { border-color: #334155; }
.md-body tr:nth-child(even) td { background: #f8fafc; }
.dark .md-body tr:nth-child(even) td { background: #0f172a; }
.md-body hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5em 0; }
.dark .md-body hr { border-top-color: #334155; }
.md-body img { max-width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; }
.dark .md-body img { border-color: #334155; }
.md-body .katex-display { overflow-x: auto; overflow-y: hidden; }
/* ── Monaco code block wrapper ── */
.md-code-block { margin: 0 0 1.2em; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
.dark .md-code-block { border-color: #1e293b; }
.md-code-header { display: flex; align-items: center; justify-content: space-between; padding: 5px 14px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
.dark .md-code-header { background: #0d1526; border-bottom-color: #1e293b; }
.md-code-lang { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-family: 'JetBrains Mono', monospace; }
.dark .md-code-lang { color: #4a5568; }
.md-code-actions { display: flex; gap: 5px; }
.md-code-btn { font-size: 10px; font-weight: 600; padding: 2px 9px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; color: #475569; cursor: pointer; transition: all 0.15s; font-family: system-ui; line-height: 1.8; }
.dark .md-code-btn { border-color: #334155; background: #1e293b; color: #94a3b8; }
.md-code-btn:hover { background: #e2e8f0; color: #1e293b; }
.dark .md-code-btn:hover { background: #334155; color: #e2e8f0; }
.md-code-btn.copied { color: #16a34a !important; border-color: #86efac !important; }
.dark .md-code-btn.copied { color: #4ade80 !important; border-color: #166534 !important; }
.md-code-btn.run { color: #0369a1; border-color: #bae6fd; background: #f0f9ff; }
.dark .md-code-btn.run { color: #38bdf8; border-color: #0c4a6e; background: #082f49; }
.md-code-btn.run:hover { background: #e0f2fe; }
.dark .md-code-btn.run:hover { background: #0c4a6e; }
.md-code-monaco { overflow: hidden; }
.md-code-monaco .monaco-editor .overflow-guard { border-radius: 0; }
.md-resize-handle { height: 6px; cursor: row-resize; background: #e2e8f0; display: flex; align-items: center; justify-content: center; transition: background 0.15s; border-radius: 0 0 8px 8px; }
.dark .md-resize-handle { background: #1e293b; }
.md-resize-handle:hover, .md-resize-handle.dragging { background: #3b82f6; }
.dark .md-resize-handle:hover, .dark .md-resize-handle.dragging { background: #2563eb; }
.md-resize-handle::after { content: ''; width: 28px; height: 2px; border-radius: 2px; background: #94a3b8; }
.dark .md-resize-handle::after { background: #334155; }
/* ── Inline cell output ── */
.md-cell-output { border-top: 1px solid #e2e8f0; background: #f8fafc; border-radius: 0 0 8px 8px; }
.dark .md-cell-output { border-top-color: #1e293b; background: #060d18; }
.md-cell-output-header { display: flex; align-items: center; justify-content: space-between; padding: 3px 14px; }
.md-cell-output-header span { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; }
.md-cell-output-clear { background: none; border: none; cursor: pointer; font-size: 10px; color: #94a3b8; padding: 0 2px; line-height: 1; }
.md-cell-output-clear:hover { color: #ef4444; }
.md-cell-output-pre { margin: 0; padding: 6px 14px 10px; font-size: 12px; font-family: 'JetBrains Mono', Consolas, monospace; white-space: pre-wrap; word-break: break-word; }
.md-cell-line { line-height: 1.55; }
.md-cell-line--output { color: #1e293b; }
.dark .md-cell-line--output { color: #c8d3e8; }
.md-cell-line--error { color: #dc2626; }
.dark .md-cell-line--error { color: #f87171; }
.md-cell-line--dim { color: #94a3b8; font-style: italic; }
.md-splitter { width: 5px; cursor: col-resize; flex-shrink: 0; background: transparent; transition: background 0.15s; position: relative; z-index: 10; }
.md-splitter:hover, .md-splitter.dragging { background: #3b82f6; }
.dark .md-splitter:hover, .dark .md-splitter.dragging { background: #2563eb; }
/* ── Inline doc reference badge ── */
.md-ref-badge { font-size: 8px; font-weight: 700; vertical-align: super; margin-left: 2px; padding: 1px 4px; border-radius: 3px; text-decoration: none; line-height: 1; white-space: nowrap; }
.md-ref-badge.mdn { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
.dark .md-ref-badge.mdn { background: #1e3a5f; color: #60a5fa; border-color: #1d4ed8; }
.md-ref-badge.py { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
.dark .md-ref-badge.py { background: #3b2700; color: #fbbf24; border-color: #78350f; }
.md-ref-badge:hover { opacity: 0.75; }
`

function useIsDark() {
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark'))
    )
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

const DocsCtx = createContext({ isDark: false, onRun: null, codeAlongOpen: false })

function MdCodeBlock({ language, code }) {
  const { isDark, onRun, codeAlongOpen } = useContext(DocsCtx)
  const [copied, setCopied] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [editorHeight, setEditorHeight] = useState(() =>
    Math.min(Math.max(code.split('\n').length * 19 + 24, 72), 540)
  )
  const [output, setOutput]   = useState(null)   // null = never run
  const [running, setRunning] = useState(false)
  const editorRef = useRef(null)  // holds live Monaco instance so we run edited code

  const monacoLang = MONACO_LANG[language] || language
  const runnable   = RUNNABLE_LANGS.has(language)

  const onResizeStart = useCallback((e) => {
    e.preventDefault()
    const startY = e.clientY
    const startH = editorHeight
    setDragging(true)
    const onMove = (ev) => setEditorHeight(Math.max(80, startH + ev.clientY - startY))
    const onUp = () => {
      setDragging(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [editorHeight])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(editorRef.current?.getValue() ?? code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  const handleDownload = useCallback(() => {
    const ext = LANG_EXT[language] || 'txt'
    const blob = new Blob([editorRef.current?.getValue() ?? code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `snippet.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }, [code, language])

  const handleRunInline = useCallback(async () => {
    const src = editorRef.current?.getValue() ?? code
    setRunning(true)
    setOutput(null)
    try {
      const lang = language

      if (lang === 'python' || lang === 'py') {
        const lines = []
        const { error } = await runPythonInline(src, (text, type) => {
          lines.push({ text, type })
          setOutput([...lines])
        })
        if (error) lines.push({ text: error, type: 'error' })
        setOutput(lines.length ? [...lines] : [{ text: '(no output)', type: 'dim' }])
      } else if (lang === 'typescript' || lang === 'ts') {
        const { output: out, error } = await runTSInline(src)
        setOutput(error
          ? [{ text: error, type: 'error' }]
          : [{ text: out, type: 'output' }])
      } else if (lang === 'matlab' || lang === 'openmat') {
        const { output: out, error } = runOpenMATInline(src)
        setOutput(error
          ? [{ text: error, type: 'error' }]
          : [{ text: out, type: 'output' }])
      } else {
        // javascript / js
        const { output: out, error } = runJSInline(src)
        setOutput(error
          ? [{ text: out || '', type: 'output' }, { text: error, type: 'error' }].filter(l => l.text)
          : [{ text: out, type: 'output' }])
      }
    } catch (e) {
      setOutput([{ text: e.message, type: 'error' }])
    } finally {
      setRunning(false)
    }
  }, [code, language])

  const handleSendToWorkspace = useCallback(() => {
    if (onRun) onRun(editorRef.current?.getValue() ?? code, monacoLang)
  }, [code, monacoLang, onRun])

  return (
    <div className="md-code-block">
      <div className="md-code-header">
        <span className="md-code-lang">{monacoLang}</span>
        <div className="md-code-actions">
          {runnable && (
            <button
              onClick={handleRunInline}
              disabled={running}
              className="md-code-btn run"
              title="Run this code here"
            >
              {running ? '⏳' : '▶'} Run
            </button>
          )}
          {onRun && (
            <button
              onClick={handleSendToWorkspace}
              className="md-code-btn"
              title="Send to Code Along workspace"
            >
              {codeAlongOpen ? '→ Workspace' : 'Code Along →'}
            </button>
          )}
          <button onClick={handleDownload} className="md-code-btn">↓</button>
          <button onClick={handleCopy} className={`md-code-btn${copied ? ' copied' : ''}`}>
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="md-code-monaco">
        <Editor
          height={editorHeight}
          language={monacoLang}
          defaultValue={code}
          theme={isDark ? 'open-calc-dark' : 'open-calc-light'}
          beforeMount={setupOpenCalcMonaco}
          onMount={(editor) => { editorRef.current = editor }}
          options={{
            readOnly: !runnable,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            lineDecorationsWidth: 4,
            lineNumbersMinChars: 3,
            folding: false,
            wordWrap: 'off',
            fontSize: 13,
            fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
            renderLineHighlight: runnable ? 'line' : 'none',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: { vertical: 'auto', horizontal: 'auto', alwaysConsumeMouseWheel: false, verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
            padding: { top: 10, bottom: 10 },
            contextmenu: false,
            automaticLayout: true,
            glyphMargin: false,
          }}
        />
      </div>
      <div
        className={`md-resize-handle${dragging ? ' dragging' : ''}`}
        onMouseDown={onResizeStart}
        title="Drag to resize"
      />
      {output !== null && (
        <div className="md-cell-output">
          <div className="md-cell-output-header">
            <span>Output</span>
            <button onClick={() => setOutput(null)} className="md-cell-output-clear" title="Clear output">✕</button>
          </div>
          <pre className="md-cell-output-pre">
            {output.map((line, i) => (
              <div key={i} className={`md-cell-line md-cell-line--${line.type}`}>{line.text}</div>
            ))}
          </pre>
        </div>
      )}
    </div>
  )
}

function MdInlineCode({ children }) {
  const text = String(children)
  const ref = TERM_REFS[text]
  return (
    <>
      <code>{text}</code>
      {ref && (
        <span
          className={`md-ref-badge ${ref.src}`}
          title={ref.desc}
          role="link"
          tabIndex={0}
          style={{ cursor: 'pointer' }}
          onClick={() => window.open(ref.url, '_blank', 'noopener,noreferrer')}
          onKeyDown={(e) => e.key === 'Enter' && window.open(ref.url, '_blank', 'noopener,noreferrer')}
        >
          {ref.src}↗
        </span>
      )}
    </>
  )
}

const MD_COMPONENTS = {
  pre({ node }) {
    // Read directly from the hast node to avoid losing className through custom `code` processing
    const codeNode = node?.children?.[0]
    const classNames = codeNode?.properties?.className ?? []
    const langClass = (Array.isArray(classNames) ? classNames : [String(classNames)])
      .find(c => /^language-/.test(String(c)))
    const match = /language-(\w+)/.exec(langClass || '')
    const rawCode = (codeNode?.children ?? [])
      .filter(n => n.type === 'text')
      .map(n => n.value)
      .join('')
    const code = rawCode.replace(/\n$/, '')
    if (match) return <MdCodeBlock language={match[1]} code={code} />
    // Unlanguaged fenced block — bare <pre>, no <code> wrapper so inline-code CSS can't bleed in
    return <pre>{code}</pre>
  },
  code({ children }) {
    // Only inline code reaches here; block code is handled entirely by `pre` via node prop
    return <MdInlineCode>{children}</MdInlineCode>
  },
}

function TreeNode({ node, activeFile, onSelect, depth = 0, overriddenPaths = new Set() }) {
  const [open, setOpen] = useState(node.open !== false)
  const indent = depth * 14

  if (node.type === 'dir') {
    return (
      <div>
        <div
          onClick={() => setOpen((value) => !value)}
          className="flex items-center gap-1.5 px-2 py-1 cursor-pointer text-amber-600 dark:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors select-none group"
          style={{ paddingLeft: 8 + indent }}
        >
          {open ? <ChevronDown className="w-3 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" /> : <ChevronRight className="w-3 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />}
          <Folder className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold tracking-wide uppercase mt-0.5">{displayName(node.name)}</span>
        </div>
        {open && node.children.map((child, index) => (
          <TreeNode
            key={`${child.name}-${index}`}
            node={child}
            activeFile={activeFile}
            onSelect={onSelect}
            depth={depth + 1}
            overriddenPaths={overriddenPaths}
          />
        ))}
      </div>
    )
  }

  const isActive = activeFile === node.path
  const isOverridden = overriddenPaths.has(node.path)
  return (
    <div
      onClick={() => onSelect(node.path)}
      className={`flex items-center gap-1.5 px-2 py-1.5 cursor-pointer text-xs transition-colors border-l-2 ${
        isActive
          ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/10 border-brand-500'
          : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
      style={{ paddingLeft: 12 + indent }}
    >
      <File className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
      <span className="truncate">{displayName(node.name)}</span>
      {isOverridden && <span className="ml-auto text-[9px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Override</span>}
    </div>
  )
}

function DocListItem({ label, subtitle, isActive, onSelect, onDelete, kind }) {
  return (
    <div className="flex items-center group">
      <div
        onClick={onSelect}
        className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 cursor-pointer text-xs transition-colors border-l-2 ml-2 ${
          isActive
            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 border-indigo-500'
            : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <FilePenLine className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
        <div className="truncate flex-1">
          <div className="truncate">{label || 'Untitled'}</div>
          {subtitle && <div className="truncate text-[10px] text-slate-400 dark:text-slate-500">{subtitle}</div>}
        </div>
        <span className={`text-[9px] uppercase tracking-widest ${kind === 'override' ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-500 dark:text-indigo-300'}`}>
          {kind}
        </span>
      </div>
      <button
        onClick={(event) => {
          event.stopPropagation()
          onDelete()
        }}
        className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity mr-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
        title={kind === 'override' ? 'Restore built-in doc' : 'Delete document'}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function createLocalDoc() {
  const id = Date.now().toString()
  return {
    id,
    name: 'Untitled',
    content: '# New Document\n\nStart writing here...',
    source: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export default function MarkdownHub() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const tree = useMemo(() => buildTree(Object.keys(DOCS_MODULES)), [])

  const [tab, setTab] = useState('tutorials')
  const [activeFile, setActiveFile] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [backendReady, setBackendReady] = useState(false)
  const [backendLoading, setBackendLoading] = useState(true)
  const [userDocs, setUserDocs] = useState(loadPersonal)
  const [overrideDocs, setOverrideDocs] = useState([])
  const [activeDocType, setActiveDocType] = useState(null)
  const [activeUserId, setActiveUserId] = useState(null)
  const [activeOverridePath, setActiveOverridePath] = useState(null)
  const [editorName, setEditorName] = useState('')
  const [editorContent, setEditorContent] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [tutorialOverrideActive, setTutorialOverrideActive] = useState(false)
  const [codeAlongOpen, setCodeAlongOpen] = useState(false)
  const [docsNavOpen, setDocsNavOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 640)
  const [pendingRun, setPendingRun] = useState(null)
  const [codeAlongPx, setCodeAlongPx] = useState(560)
  const [splitterDragging, setSplitterDragging] = useState(false)
  const [adaOpen, setAdaOpen] = useState(false)
  const [workspaceSnap, setWorkspaceSnap] = useState({ code: '', language: '', filename: '', fileList: [], getTerminalOutput: () => '' })
  const isDark = useIsDark()

  const handleCodeChange = useCallback((snap) => { setWorkspaceSnap(snap) }, [])

  const handleSplitterDrag = useCallback((e) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = codeAlongPx
    setSplitterDragging(true)
    const onMove = (ev) => {
      const delta = startX - ev.clientX
      setCodeAlongPx(Math.max(300, Math.min(startW + delta, window.innerWidth - 350)))
    }
    const onUp = () => {
      setSplitterDragging(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [codeAlongPx])

  const handleRunInCodeAlong = useCallback((code, monacoLang) => {
    const wsLang = WORKSPACE_LANG[monacoLang] || 'javascript'
    setCodeAlongOpen(true)
    setPendingRun({ code, language: wsLang, key: Date.now() })
  }, [])

  const docsCtxValue = useMemo(() => ({
    isDark,
    onRun: handleRunInCodeAlong,
    codeAlongOpen,
  }), [isDark, handleRunInCodeAlong, codeAlongOpen])

  const overriddenPaths = useMemo(() => new Set(overrideDocs.map((doc) => doc.path)), [overrideDocs])
  const activeUserDoc = userDocs.find((doc) => doc.id === activeUserId) || null
  const activeOverrideDoc = overrideDocs.find((doc) => doc.path === activeOverridePath) || null

  const refreshDocsIndex = useCallback(async () => {
    setBackendLoading(true)
    try {
      const response = await fetch(buildOptionalBackendUrl('/api/docs'))
      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}`)
      }
      const payload = await response.json()
      setBackendReady(true)
      setUserDocs(payload.userDocs || [])
      setOverrideDocs(payload.overrideDocs || [])
    } catch {
      setBackendReady(false)
      setOverrideDocs([])
      const localDocs = loadPersonal()
      setUserDocs(localDocs)
    } finally {
      setBackendLoading(false)
    }
  }, [])

  const selectTutorial = useCallback(async (modulePath) => {
    setActiveFile(modulePath)
    setLoading(true)
    setTutorialOverrideActive(false)
    try {
      const bundled = await DOCS_MODULES[modulePath]()
      let resolvedContent = bundled
      if (backendReady) {
        const response = await fetch(buildOptionalBackendUrl('/api/docs/override', { path: modulePath }))
        if (response.ok) {
          const payload = await response.json()
          if (payload.doc?.content) {
            resolvedContent = payload.doc.content
            setTutorialOverrideActive(true)
          }
        }
      }
      setContent(resolvedContent)
    } catch {
      setContent(`*Could not load file: ${modulePath}*`)
    } finally {
      setLoading(false)
    }
  }, [backendReady])

  useEffect(() => {
    refreshDocsIndex()
  }, [refreshDocsIndex])

  // Restore the last-viewed user doc when the Studio reopens
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mdhub_last_doc') || 'null')
      if (!saved) return
      if (saved.type === 'user') {
        const docs = loadPersonal()
        const doc = docs.find(d => d.id === saved.id)
        if (doc) selectUserDoc(doc)
      }
    } catch {}
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const readme = Object.keys(DOCS_MODULES).find((modulePath) => modulePath.endsWith('README.md'))
    if (readme) {
      selectTutorial(readme)
    }
  }, [selectTutorial])

  // When code-along opens, Monaco measures its container before the flex layout
  // settles (especially with a minimal sidebar). A resize event forces all
  // ResizeObservers (including Monaco's automaticLayout) to re-measure.
  useEffect(() => {
    if (!codeAlongOpen) return
    const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 50)
    return () => clearTimeout(t)
  }, [codeAlongOpen])

  const selectUserDoc = useCallback((doc) => {
    setActiveDocType('user')
    setActiveUserId(doc.id)
    setActiveOverridePath(null)
    setEditorName(doc.name || 'Untitled')
    setEditorContent(doc.content || '')
    setTab('editor')
    setPreviewMode(true)  // always render, not raw textarea — user can click Edit mode if needed
    try { localStorage.setItem('mdhub_last_doc', JSON.stringify({ type: 'user', id: doc.id })) } catch {}
  }, [])

  const selectOverrideDoc = useCallback((doc) => {
    setActiveDocType('override')
    setActiveOverridePath(doc.path)
    setActiveUserId(null)
    setEditorName(doc.name || displayName(doc.path.split('/').pop()))
    setEditorContent(doc.content || '')
    setTab('editor')
  }, [])

  const createUserDoc = useCallback(async () => {
    if (backendReady) {
      const response = await fetch(buildOptionalBackendUrl('/api/docs/user'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Untitled', content: '# New Document\n\nStart writing here...' }),
      })
      const payload = await response.json()
      if (response.ok && payload.doc) {
        await refreshDocsIndex()
        selectUserDoc(payload.doc)
      }
      return
    }

    const file = createLocalDoc()
    const updated = [...userDocs, file]
    setUserDocs(updated)
    savePersonal(updated)
    selectUserDoc(file)
  }, [backendReady, refreshDocsIndex, selectUserDoc, userDocs])

  const openTutorialOverrideEditor = useCallback(async () => {
    if (!activeFile) return

    let name = displayName(activeFile.split('/').pop())
    let docContent = content

    if (backendReady) {
      const response = await fetch(buildOptionalBackendUrl('/api/docs/override', { path: activeFile }))
      if (response.ok) {
        const payload = await response.json()
        if (payload.doc) {
          name = payload.doc.name || name
          docContent = payload.doc.content || docContent
        }
      }
    }

    setActiveDocType('override')
    setActiveOverridePath(activeFile)
    setActiveUserId(null)
    setEditorName(name)
    setEditorContent(docContent)
    setTab('editor')
    setPreviewMode(false)
  }, [activeFile, backendReady, content])

  const saveEditorDocument = useCallback(async () => {
    if (!activeDocType) return
    setIsSaving(true)
    try {
      if (activeDocType === 'user') {
        if (backendReady && activeUserId) {
          await fetch(buildOptionalBackendUrl('/api/docs/user', { id: activeUserId }), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editorName, content: editorContent }),
          })
          await refreshDocsIndex()
          return
        }

        if (activeUserId) {
          const updated = userDocs.map((doc) =>
            doc.id === activeUserId
              ? { ...doc, name: editorName, content: editorContent, updatedAt: new Date().toISOString() }
              : doc
          )
          setUserDocs(updated)
          savePersonal(updated)
        }
        return
      }

      if (activeDocType === 'override' && activeOverridePath && backendReady) {
        await fetch(buildOptionalBackendUrl('/api/docs/override', { path: activeOverridePath }), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editorName, content: editorContent }),
        })
        await refreshDocsIndex()
        if (activeFile === activeOverridePath) {
          setContent(editorContent)
          setTutorialOverrideActive(true)
        }
      }
    } finally {
      setIsSaving(false)
    }
  }, [
    activeDocType,
    activeFile,
    activeOverridePath,
    activeUserId,
    backendReady,
    editorContent,
    editorName,
    refreshDocsIndex,
    userDocs,
  ])

  useEffect(() => {
    if (!activeDocType) return
    const timeout = setTimeout(() => {
      saveEditorDocument()
    }, 700)
    return () => clearTimeout(timeout)
  }, [activeDocType, activeUserId, activeOverridePath, editorName, editorContent, saveEditorDocument])

  const deleteUserDoc = useCallback(async (id) => {
    if (backendReady) {
      await fetch(buildOptionalBackendUrl('/api/docs/user', { id }), { method: 'DELETE' })
      await refreshDocsIndex()
    } else {
      const updated = userDocs.filter((doc) => doc.id !== id)
      setUserDocs(updated)
      savePersonal(updated)
    }

    if (activeUserId === id) {
      setActiveUserId(null)
      setActiveDocType(null)
      setEditorName('')
      setEditorContent('')
    }
  }, [activeUserId, backendReady, refreshDocsIndex, userDocs])

  const deleteOverrideDoc = useCallback(async (docPath) => {
    if (!backendReady) return
    await fetch(buildOptionalBackendUrl('/api/docs/override', { path: docPath }), { method: 'DELETE' })
    await refreshDocsIndex()

    if (activeOverridePath === docPath) {
      setActiveOverridePath(null)
      setActiveDocType(null)
      setEditorName('')
      setEditorContent('')
    }

    if (activeFile === docPath) {
      setTutorialOverrideActive(false)
      const bundled = await DOCS_MODULES[docPath]()
      setContent(bundled)
    }
  }, [activeFile, activeOverridePath, backendReady, refreshDocsIndex])

  const downloadTextFile = useCallback((filename, text) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }, [])

  const downloadCurrentMarkdown = useCallback(() => {
    if (tab === 'tutorials' && activeFile) {
      downloadTextFile(activeFile.split('/').pop(), content)
      return
    }

    if (tab === 'editor' && activeDocType) {
      const name = (editorName || 'document').replace(/[^a-z0-9-_ ]/gi, '') || 'document'
      downloadTextFile(`${name}.md`, editorContent)
    }
  }, [activeDocType, activeFile, content, downloadTextFile, editorContent, editorName, tab])

  const exportSharePack = useCallback(async () => {
    if (!activeDocType) return

    if (backendReady) {
      const query = activeDocType === 'user'
        ? { type: 'user', id: activeUserId }
        : { type: 'override', path: activeOverridePath }
      const response = await fetch(buildOptionalBackendUrl('/api/docs/share/export', query))
      if (response.ok) {
        const payload = await response.json()
        const name = (editorName || 'document').replace(/[^a-z0-9-_ ]/gi, '') || 'document'
        downloadTextFile(`${name}.open-calc-doc.json`, JSON.stringify(payload, null, 2))
      }
      return
    }

    if (activeDocType === 'user' && activeUserDoc) {
      const pack = {
        kind: 'open-calc-doc-share',
        version: 1,
        docType: 'user',
        exportedAt: new Date().toISOString(),
        doc: activeUserDoc,
      }
      const name = (editorName || 'document').replace(/[^a-z0-9-_ ]/gi, '') || 'document'
      downloadTextFile(`${name}.open-calc-doc.json`, JSON.stringify(pack, null, 2))
    }
  }, [activeDocType, activeOverridePath, activeUserDoc, activeUserId, backendReady, downloadTextFile, editorName])

  const onImportFile = useCallback(async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const raw = await file.text()
    event.target.value = ''

    // .md file → create a new user doc directly
    if (file.name.toLowerCase().endsWith('.md')) {
      const name = file.name.replace(/\.md$/i, '').replace(/[-_]/g, ' ') || 'Imported Doc'
      const fileDoc = { ...createLocalDoc(), name, content: raw }
      if (backendReady) {
        await fetch(buildOptionalBackendUrl('/api/docs/user'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, content: raw }),
        })
        await refreshDocsIndex()
      } else {
        const updated = [...userDocs, fileDoc]
        setUserDocs(updated)
        savePersonal(updated)
      }
      selectUserDoc(fileDoc)
      setPreviewMode(true)
      return
    }

    // .json share pack
    let parsed
    try { parsed = JSON.parse(raw) } catch { return }

    if (backendReady) {
      await fetch(buildOptionalBackendUrl('/api/docs/share/import'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      })
      await refreshDocsIndex()
    } else if (parsed.docType === 'user' && parsed.doc) {
      const fileDoc = {
        ...createLocalDoc(),
        name: parsed.doc.name || 'Imported Document',
        content: parsed.doc.content || '',
      }
      const updated = [...userDocs, fileDoc]
      setUserDocs(updated)
      savePersonal(updated)
      selectUserDoc(fileDoc)
    }
  }, [backendReady, refreshDocsIndex, selectUserDoc, userDocs])

  const activeTitle = tab === 'tutorials'
    ? activeFile?.replace('/src/docs/', '') || 'Bundled docs'
    : editorName || 'Markdown document'

  return (
    <>
      <style>{MD_CSS}</style>
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.json,.open-calc-doc.json"
        className="hidden"
        onChange={onImportFile}
      />

      <div className="flex flex-col h-[100vh] w-full bg-white dark:bg-[#07111e] text-slate-900 dark:text-slate-100 font-sans overflow-hidden inset-0 fixed z-[100]">
        <div className="h-12 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 px-4 shrink-0 shadow-sm z-10 w-full">
          <button
            onClick={() => setDocsNavOpen((value) => !value)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title={docsNavOpen ? 'Hide docs navigation' : 'Show docs navigation'}
          >
            {docsNavOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
            Nav
          </button>

          <span className="text-[17px] font-bold text-slate-800 dark:text-slate-100 mr-2 tracking-tight">
            🖥️ Studio
          </span>

          <div className="flex flex-wrap bg-slate-200/50 dark:bg-slate-950/50 p-1 rounded-lg gap-1 border border-slate-200/50 dark:border-slate-800/50">
            {['tutorials', 'editor'].map((nextTab) => (
              <button
                key={nextTab}
                onClick={() => setTab(nextTab)}
                className={`px-3 py-1 text-xs font-bold capitalize rounded-md transition-all ${
                  tab === nextTab
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/50'
                }`}
              >
                {nextTab === 'tutorials' ? '📖 Tutorials' : '✏️ Editor'}
              </button>
            ))}
          </div>

          <div className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {backendLoading ? 'Checking backend...' : backendReady ? 'Backend linked' : 'Local-only mode'}
          </div>

          <div className="flex-1" />

          <button
            onClick={() => setCodeAlongOpen((value) => !value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors ${
              codeAlongOpen
                ? 'text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-800/50'
                : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title="Open code-along workspace"
          >
            <Code2 className="w-3.5 h-3.5" /> Code Along
          </button>

          <button
            onClick={() => setAdaOpen((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors ${
              adaOpen
                ? 'text-cyan-600 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-700/50'
                : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title="Ask Ada — your private AI code tutor"
          >
            <Sparkles className="w-3.5 h-3.5" /> Ask Ada
          </button>

          <button
            onClick={refreshDocsIndex}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Refresh
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Import
          </button>

          {tab === 'tutorials' && activeFile && (
            <>
              <button
                onClick={openTutorialOverrideEditor}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> {tutorialOverrideActive ? 'Edit override' : 'Edit local version'}
              </button>
              {tutorialOverrideActive && backendReady && (
                <button
                  onClick={() => deleteOverrideDoc(activeFile)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                >
                  <RefreshCcw className="w-3.5 h-3.5" /> Restore built-in
                </button>
              )}
            </>
          )}

          {(tab === 'tutorials' && activeFile) || (tab === 'editor' && activeDocType) ? (
            <button
              onClick={downloadCurrentMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          ) : null}

          {tab === 'editor' && activeDocType && (
            <>
              {previewMode ? (
                <button
                  onClick={() => setPreviewMode(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit mode
                </button>
              ) : (
                <button
                  onClick={() => setPreviewMode(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview mode
                </button>
              )}
              <button
                onClick={exportSharePack}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800/50 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export share pack
              </button>
            </>
          )}

          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            title="Exit Docs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <DocsCtx.Provider value={docsCtxValue}>
        <div className={`flex flex-1 overflow-hidden w-full relative ${codeAlongOpen ? 'min-w-0' : ''}`}>
          <div className={`${docsNavOpen ? 'hidden sm:flex' : 'hidden'} ${codeAlongOpen ? 'w-[240px]' : 'w-[300px]'} bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 flex-col shrink-0 overflow-hidden h-full`}>
            <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
              {tab === 'tutorials' && (
                tree.length === 0
                  ? (
                    <div className="p-4 text-xs text-slate-500 dark:text-slate-400">
                      No docs found.<br />Add `.md` files to <code className="text-slate-700 dark:text-slate-300">src/docs/</code>
                    </div>
                    )
                  : tree.map((node, index) => (
                    <TreeNode
                      key={`${node.name}-${index}`}
                      node={node}
                      activeFile={activeFile}
                      onSelect={selectTutorial}
                      overriddenPaths={overriddenPaths}
                    />
                    ))
              )}

              {tab === 'editor' && (
                <>
                  <div className="px-4 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">
                    My Documents
                  </div>
                  {userDocs.map((doc) => (
                    <DocListItem
                      key={doc.id}
                      label={doc.name}
                      subtitle={backendReady ? new Date(doc.updatedAt).toLocaleString() : 'Local browser storage'}
                      kind="user"
                      isActive={activeDocType === 'user' && activeUserId === doc.id}
                      onSelect={() => selectUserDoc(doc)}
                      onDelete={() => deleteUserDoc(doc.id)}
                    />
                  ))}
                  {userDocs.length === 0 && (
                    <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                      No user docs yet.
                    </div>
                  )}

                  <div className="px-4 py-3 text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1 mt-3">
                    Bundled Doc Overrides
                  </div>
                  {overrideDocs.map((doc) => (
                    <DocListItem
                      key={doc.path}
                      label={doc.name}
                      subtitle={doc.path.replace('/src/docs/', '')}
                      kind="override"
                      isActive={activeDocType === 'override' && activeOverridePath === doc.path}
                      onSelect={() => selectOverrideDoc(doc)}
                      onDelete={() => deleteOverrideDoc(doc.path)}
                    />
                  ))}
                  {overrideDocs.length === 0 && (
                    <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                      No doc overrides yet. Open a tutorial and choose `Edit local version`.
                    </div>
                  )}
                </>
              )}
            </div>

            {tab === 'editor' && (
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                <button
                  onClick={createUserDoc}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors shadow-sm"
                >
                  <FilePlus className="w-4 h-4" /> New Document
                </button>
              </div>
            )}
          </div>

          <div className={`flex-1 min-w-0 flex flex-col overflow-hidden bg-white dark:bg-[#0b1322]`}>
            {tab === 'tutorials' && (
              <div className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-16 py-8 custom-scrollbar">
                {loading ? (
                  <div className="text-slate-500 text-sm animate-pulse">Loading document...</div>
                ) : (
                  <div className="md-body mx-auto">
                    {activeFile && (
                      <div className="mb-6 flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          {activeFile.replace('/src/docs/', '')}
                        </span>
                        {tutorialOverrideActive && (
                          <span className="text-[10px] uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 px-2 py-1 rounded">
                            Local override active
                          </span>
                        )}
                      </div>
                    )}
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={MD_COMPONENTS}>
                      {content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            {tab === 'editor' && !activeDocType && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400 dark:text-slate-500">
                <FilePenLine className="w-16 h-16 opacity-30" />
                <p className="text-sm">Select a document, create one, or open a tutorial to override it.</p>
                <button
                  onClick={createUserDoc}
                  className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm shadow-indigo-500/20"
                >
                  <FilePlus className="w-4 h-4" /> Create New Document
                </button>
              </div>
            )}

            {tab === 'editor' && activeDocType && previewMode && (
              <div className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-16 py-8 bg-slate-50/50 dark:bg-[#07111e]/50 custom-scrollbar">
                <div className="md-body mx-auto bg-white dark:bg-[#0b1322] p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 min-h-full">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={MD_COMPONENTS}>
                    {editorContent}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {tab === 'editor' && activeDocType && !previewMode && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/30">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                    {activeDocType === 'override' ? 'Override' : 'Document'}
                  </span>
                  <input
                    value={editorName}
                    onChange={(event) => setEditorName(event.target.value)}
                    placeholder="Document name..."
                    className="flex-1 bg-transparent border-none text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-0"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    {isSaving ? 'Saving' : 'Saved'}
                  </span>
                </div>
                <textarea
                  value={editorContent}
                  onChange={(event) => setEditorContent(event.target.value)}
                  spellCheck={false}
                  className="flex-1 w-full p-6 sm:p-8 bg-slate-50 dark:bg-[#07111e] text-slate-700 dark:text-slate-300 border-none outline-none resize-none font-mono text-[13px] leading-relaxed custom-scrollbar placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  placeholder="# Begin your markdown here..."
                  style={{ tabSize: 2 }}
                />
              </div>
            )}
          </div>

          {codeAlongOpen && (
            <>
              <div
                className={`md-splitter hidden md:block${splitterDragging ? ' dragging' : ''}`}
                onMouseDown={handleSplitterDrag}
                title="Drag to resize"
              />
              <div className="hidden md:flex flex-col shrink-0 overflow-hidden" style={{ width: codeAlongPx }}>
                <DocsCodeWorkspace activeTitle={activeTitle} pendingRun={pendingRun} onCodeChange={handleCodeChange} />
              </div>
            </>
          )}
        </div>
        </DocsCtx.Provider>
      </div>

      {/* ── Ada floating panel ── */}
      {adaOpen && (
        <AdaPanel
          code={workspaceSnap.code}
          language={workspaceSnap.language}
          filename={workspaceSnap.filename}
          terminalOutput={workspaceSnap.getTerminalOutput()}
          tutorialContent={content}
          fileList={workspaceSnap.fileList}
          isDark={isDark}
        />
      )}
    </>
  )
}
