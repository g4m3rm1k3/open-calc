import { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import Editor from '@monaco-editor/react'
import { setupOpenCalcMonaco } from '../../utils/monacoThemes.js'
import MarkdownToolbar from '../markdown-toolbar/MarkdownToolbar.jsx'
import { LANG_LABEL } from '../markdown/codeDisplay.jsx'
import {
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  File,
  Folder,
  FilePenLine,
  FilePlus,
  Download,
  Edit2,
  Eye,
  Upload,
  RefreshCcw,
  RotateCcw,
  Code2,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Volume2,
  Square,
  Type,
} from 'lucide-react'
import { buildOptionalBackendUrl } from '../../utils/optionalBackend.js'
import { useSpeech, cleanForSpeech } from '../../utils/useSpeech.js'
import {
  RUNNABLE_LANGS,
  runJSInline, runTSInline, runPythonInline, runOpenMATInline,
  runShellInline, runSQLInline, runJSONInline,
  runLuaInline, runRubyInline, runCInline, runBrainfuckInline,
} from '../../utils/inlineRunner.js'
import { getThemeStyles, STUDIO_THEMES } from '../../utils/studioThemes.js'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import DocsCodeWorkspace from './DocsCodeWorkspace.jsx'
import AdaPanel from './AdaPanel.jsx'

const DOCS_MODULES = import.meta.glob('/src/docs/**/*.md', {
  query: '?raw',
  import: 'default',
})

const PREFIX = '/src/docs/'
const LS_KEY = 'markdownhub_personal'

const LANG_EXT = {
  javascript: 'js', js: 'js', python: 'py', py: 'py', typescript: 'ts', ts: 'ts',
  css: 'css', html: 'html', markup: 'html', bash: 'sh', shell: 'sh', sh: 'sh', zsh: 'sh',
  json: 'json', text: 'txt', sql: 'sql', sqlite: 'sql', lua: 'lua', ruby: 'rb', rb: 'rb',
  c: 'c', cpp: 'cpp', 'c++': 'cpp', brainfuck: 'bf', bf: 'bf',
}
const MONACO_LANG = {
  py: 'python', js: 'javascript', ts: 'typescript', sh: 'shell', zsh: 'shell',
  xml: 'html', markup: 'html', bash: 'shell', rb: 'ruby', sqlite: 'sql',
  'c++': 'cpp', bf: 'brainfuck', brainfuck: 'brainfuck',
  jsx: 'javascript', tsx: 'typescript', 'c#': 'csharp', ps1: 'powershell',
  m: 'matlab'
}
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

function sortTree(nodes) {
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  })
  nodes.forEach((node) => { if (node.type === 'dir') sortTree(node.children) })
  return nodes
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
  // Folders first, then files, alphanumeric within each group — matching how a
  // normal file explorer (and the real src/docs directory listing) would sort.
  return sortTree(root)
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

function getMdCss(md) {
  return `
.md-body { line-height: 1.75; font-size: 15px; max-width: 860px; color: ${md.text}; }
.md-body h1 { font-size: 2em; font-weight: 700; margin: 0 0 0.5em; color: ${md.h1}; border-bottom: 1px solid ${md.hr}; padding-bottom: 0.3em; }
.md-body h2 { font-size: 1.4em; font-weight: 700; margin: 1.8em 0 0.5em; color: ${md.h2}; border-bottom: 1px solid ${md.hr}; padding-bottom: 0.2em; }
.md-body h3 { font-size: 1.15em; font-weight: 600; margin: 1.4em 0 0.4em; color: ${md.h3}; }
.md-body h4 { font-size: 1em; font-weight: 600; margin: 1.2em 0 0.3em; color: ${md.h4}; }
.md-body p { margin: 0 0 1em; }
.md-body strong, .md-body b { color: ${md.strong}; font-weight: 700; }
.md-body em, .md-body i { color: ${md.em}; }
.md-body li::marker { color: ${md.listMarker}; font-weight: 700; }
.md-body a { color: ${md.a}; text-decoration: underline; }
.md-body code { background: ${md.codeBg}; border: 1px solid ${md.tdBorder}; border-radius: 4px; padding: 2px 6px; font-size: 0.85em; font-family: 'JetBrains Mono', monospace; color: ${md.codeText}; }
.md-body pre { background: ${md.preBg}; border: 1px solid ${md.preBorder}; border-radius: 8px; padding: 16px 20px; overflow-x: auto; margin: 0 0 1.2em; }
.md-body pre code { background: none; border: none; padding: 0; color: ${md.text}; }
.md-body blockquote { border-left: 3px solid ${md.quoteBorder}; margin: 0 0 1em; padding: 8px 16px; background: ${md.quoteBg}; border-radius: 0 4px 4px 0; color: ${md.quoteText}; }
.md-body ul, .md-body ol { margin: 0 0 1em 1.4em; }
.md-body li { margin-bottom: 0.3em; }
.md-body table { border-collapse: collapse; width: 100%; margin: 0 0 1.2em; font-size: 0.9em; }
.md-body th { background: ${md.thBg}; border: 1px solid ${md.tdBorder}; padding: 8px 12px; text-align: left; color: ${md.quoteText}; font-weight: 600; }
.md-body td { border: 1px solid ${md.tdBorder}; padding: 7px 12px; }
.md-body tr:nth-child(even) td { background: ${md.trEven}; }
.md-body hr { border: none; border-top: 1px solid ${md.hr}; margin: 1.5em 0; }
.md-body img { max-width: 100%; border-radius: 8px; border: 1px solid ${md.imgBorder}; }
.md-body .katex-display { overflow-x: auto; overflow-y: hidden; }
.md-body .katex-display pre { display: inline-block; text-align: left; background: none; border: none; margin: 0; padding: 0; font-size: 0.9em; color: ${md.text}; }
.md-code-block { margin: 0 0 1.2em; border-radius: 8px; overflow: hidden; border: 1px solid ${md.codeHeaderBorder}; }
.md-code-header { display: flex; align-items: center; justify-content: space-between; padding: 5px 14px; background: ${md.codeHeaderBg}; border-bottom: 1px solid ${md.codeHeaderBorder}; }
.md-code-lang { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: ${md.codeLangText}; font-family: 'JetBrains Mono', monospace; }
.md-code-actions { display: flex; gap: 5px; }
.md-code-btn { font-size: 10px; font-weight: 600; padding: 2px 9px; border-radius: 4px; border: 1px solid ${md.codeBtnBorder}; background: ${md.codeBtnBg}; color: ${md.codeBtnText}; cursor: pointer; transition: all 0.15s; font-family: system-ui; line-height: 1.8; }
.md-code-btn:hover { background: ${md.codeBtnHoverBg}; color: ${md.codeBtnHoverText}; }
.md-code-btn.copied { color: #16a34a !important; border-color: #86efac !important; }
.md-code-btn.run { color: #0369a1; border-color: #bae6fd; background: #f0f9ff; }
.md-code-btn.run:hover { background: #e0f2fe; }
.md-code-monaco { overflow: hidden; }
.md-code-monaco .monaco-editor .overflow-guard { border-radius: 0; }
.md-resize-handle { height: 6px; cursor: row-resize; background: ${md.resizeHandleBg}; display: flex; align-items: center; justify-content: center; transition: background 0.15s; border-radius: 0 0 8px 8px; }
.md-resize-handle:hover, .md-resize-handle.dragging { background: ${md.resizeHandleHover}; }
.md-resize-handle::after { content: ''; width: 28px; height: 2px; border-radius: 2px; background: ${md.quoteText}; }
.md-cell-output { border-top: 1px solid ${md.preBorder}; background: ${md.preBg}; border-radius: 0 0 8px 8px; }
.md-cell-output-header { display: flex; align-items: center; justify-content: space-between; padding: 3px 14px; }
.md-cell-output-header span { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${md.quoteText}; }
.md-cell-output-clear { background: none; border: none; cursor: pointer; font-size: 10px; color: ${md.quoteText}; padding: 0 2px; line-height: 1; }
.md-cell-output-clear:hover { color: #ef4444; }
.md-cell-output-pre { margin: 0; padding: 6px 14px 10px; font-size: 12px; font-family: 'JetBrains Mono', Consolas, monospace; white-space: pre-wrap; word-break: break-word; }
.md-cell-line { line-height: 1.55; }
.md-cell-line--output { color: ${md.text}; }
.md-cell-line--error { color: #dc2626; }
.md-cell-line--dim { color: ${md.quoteText}; font-style: italic; }
.md-cell-plot { display: block; max-width: 100%; height: auto; border-radius: 4px; margin: 6px 0; background: #fff; }
.md-splitter { width: 5px; cursor: col-resize; flex-shrink: 0; background: transparent; transition: background 0.15s; position: relative; z-index: 10; }
.md-splitter:hover, .md-splitter.dragging { background: ${md.resizeHandleHover}; }
.md-ref-badge { font-size: 8px; font-weight: 700; vertical-align: super; margin-left: 2px; padding: 1px 4px; border-radius: 3px; text-decoration: none; line-height: 1; white-space: nowrap; }
.md-ref-badge.mdn { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
.md-ref-badge.py { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
.md-ref-badge:hover { opacity: 0.75; }
`
}




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

const DocsCtx = createContext({ isDark: false, onRun: null, codeAlongOpen: false, activeFile: null, onDocLink: null, onNavigate: null, scrollToHeading: null })

// ── "Open With" helpers ───────────────────────────────────────────────────────

function openInOpenMat(code, fileName) {
  try {
    const docs = (() => {
      try { return JSON.parse(localStorage.getItem('openmat-documents') || '[]') } catch { return [] }
    })()
    const id = `doc-studio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const name = fileName || 'studio-import.m'
    const updated = Array.isArray(docs) ? [...docs, { id, name, code }] : [{ id, name, code }]
    localStorage.setItem('openmat-documents', JSON.stringify(updated))
    localStorage.setItem('openmat-active-document-id', JSON.stringify(id))
    window.location.href = '/#/openmat'
  } catch (e) {
    console.error('Failed to hand off to OpenMAT:', e)
  }
}

const CODELENS_LANG_MAP = { javascript: 'js', js: 'js', typescript: 'ts', ts: 'ts', python: 'py', py: 'py', go: 'go' }

function openInCodeLens(code, language, navigateFn) {
  try {
    const clLang = CODELENS_LANG_MAP[language] ?? 'js'
    const payload = { code, lang: clLang, ts: Date.now() }
    localStorage.setItem('codelens-handoff', JSON.stringify(payload))
    navigateFn('/codelens')
  } catch (e) {
    console.error('Failed to hand off to CodeLens:', e)
  }
}

function MdCodeBlock({ language, code }) {
  const { isDark, monacoTheme, onRun, codeAlongOpen, onNavigate } = useContext(DocsCtx)
  const [copied, setCopied] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [editorHeight, setEditorHeight] = useState(() =>
    Math.min(Math.max(code.split('\n').length * 19 + 24, 72), 540)
  )
  const [output, setOutput]   = useState(null)   // null = never run
  const [running, setRunning] = useState(false)
  const editorRef    = useRef(null)   // holds live Monaco instance so we run edited code
  const outputRef    = useRef(null)   // scroll target when output appears
  const didScrollRef = useRef(false)  // only scroll once per output session

  // Scroll into view once when output first appears; reset when output is cleared
  useEffect(() => {
    if (output !== null && !didScrollRef.current) {
      didScrollRef.current = true
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
    if (output === null) didScrollRef.current = false
  }, [output !== null]) // eslint-disable-line react-hooks/exhaustive-deps

  const monacoLang = MONACO_LANG[language] || language
  const displayLang = LANG_LABEL[language] || monacoLang
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

      const streamLines = []
      const onLine = (item) => { streamLines.push(item); setOutput([...streamLines]) }

      if (lang === 'python' || lang === 'py') {
        const { error } = await runPythonInline(src, onLine)
        if (error) streamLines.push({ text: error, type: 'error' })
        setOutput(streamLines.length ? [...streamLines] : [{ text: '(no output)', type: 'dim' }])
      } else if (lang === 'typescript' || lang === 'ts') {
        const { output: out, error } = await runTSInline(src)
        setOutput(error ? [{ text: error, type: 'error' }] : [{ text: out, type: 'output' }])
      } else if (lang === 'matlab' || lang === 'openmat') {
        const { output: out, error } = runOpenMATInline(src)
        setOutput(error ? [{ text: error, type: 'error' }] : [{ text: out, type: 'output' }])
      } else if (lang === 'shell' || lang === 'bash' || lang === 'sh' || lang === 'zsh') {
        const { output: out, error } = runShellInline(src)
        setOutput(error
          ? [{ text: out || '', type: 'output' }, { text: error, type: 'error' }].filter(l => l.text)
          : [{ text: out, type: 'output' }])
      } else if (lang === 'json') {
        const { output: out, error } = runJSONInline(src)
        setOutput(error ? [{ text: error, type: 'error' }] : [{ text: out, type: 'output' }])
      } else if (lang === 'sql' || lang === 'sqlite') {
        await runSQLInline(src, onLine)
        if (!streamLines.some(l => l.type !== 'dim')) streamLines.push({ text: '(no output)', type: 'dim' })
        setOutput([...streamLines])
      } else if (lang === 'lua') {
        await runLuaInline(src, onLine)
        if (!streamLines.some(l => l.type === 'output')) streamLines.push({ text: '(no output)', type: 'dim' })
        setOutput([...streamLines])
      } else if (lang === 'ruby' || lang === 'rb') {
        await runRubyInline(src, onLine)
        setOutput([...streamLines])
      } else if (lang === 'c' || lang === 'cpp' || lang === 'c++') {
        await runCInline(src, onLine)
        setOutput([...streamLines])
      } else if (lang === 'brainfuck' || lang === 'bf') {
        const { output: out, error } = runBrainfuckInline(src)
        setOutput(error ? [{ text: error, type: 'error' }] : [{ text: out, type: 'output' }])
      } else {
        // javascript / js (fallback)
        const { output: out, error } = await runJSInline(src)
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

  const isOpenMat   = language === 'matlab' || language === 'openmat'
  const isCodeLens  = CODELENS_LANG_MAP[language] != null && !isOpenMat

  const handleOpenInOpenMat = useCallback(() => {
    openInOpenMat(editorRef.current?.getValue() ?? code, `snippet.m`)
  }, [code])

  const handleOpenInCodeLens = useCallback(() => {
    if (!onNavigate) return
    openInCodeLens(editorRef.current?.getValue() ?? code, language, onNavigate)
  }, [code, language, onNavigate])

  return (
    <div className="md-code-block">
      <div className="md-code-header">
        <span className="md-code-lang">{displayLang}</span>
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
          {isOpenMat && (
            <button
              onClick={handleOpenInOpenMat}
              className="md-code-btn"
              title="Open in OpenMAT Studio"
              style={{ color: '#c2410c', borderColor: '#fed7aa', background: '#fff7ed' }}
            >
              ↗ OpenMAT
            </button>
          )}
          {isCodeLens && onNavigate && (
            <button
              onClick={handleOpenInCodeLens}
              className="md-code-btn"
              title="Open in CodeLens visualizer"
              style={{ color: '#4338ca', borderColor: '#c7d2fe', background: '#eef2ff' }}
            >
              ↗ CodeLens
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
          theme={monacoTheme || (isDark ? 'open-calc-dark' : 'open-calc-light')}
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
        <div className="md-cell-output" ref={outputRef}>
          <div className="md-cell-output-header">
            <span>Output</span>
            <button onClick={() => setOutput(null)} className="md-cell-output-clear" title="Clear output">✕</button>
          </div>
          <pre className="md-cell-output-pre">
            {output.map((item, i) =>
              item.type === 'image'
                ? <img key={i} className="md-cell-plot" src={`data:image/png;base64,${item.src}`} alt="plot" />
                : <div key={i} className={`md-cell-line md-cell-line--${item.type}`}>{item.text}</div>
            )}
          </pre>
        </div>
      )}
    </div>
  )
}

function MdInlineCode({ children }) {
  const { activeFile } = useContext(DocsCtx)
  const text = String(children)

  const isTddLesson = activeFile?.includes('/projects/inventory/tdd/lessons/')
  if (isTddLesson && text.endsWith('.md')) {
    const filename = text.split('/').pop()
    const forcedHref = `../concepts/${filename}`
    const docPath = resolveDocPath(activeFile, forcedHref)
    if (docPath) {
      const title = filename.replace('.md', '').replace(/[-_]/g, ' ')
      return <ConceptEmbed docPath={docPath} title={title} />
    }
  }

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

function headingId(text) {
  return String(text).toLowerCase()
    .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

function extractText(node) {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node?.props?.children !== undefined) return extractText(node.props.children)
  return ''
}

// Resolve a relative .md href against the current file path.
// Returns the canonical DOCS_MODULES key if it exists, otherwise null.
function resolveDocPath(currentFilePath, href) {
  if (!currentFilePath || !href) return null
  const hrefBase = href.split('#')[0]
  if (!hrefBase.endsWith('.md')) return null
  const dir = currentFilePath.split('/').slice(0, -1).join('/')
  const parts = (dir + '/' + hrefBase).split('/')
  const resolved = []
  for (const part of parts) {
    if (part === '..') resolved.pop()
    else if (part !== '.' && part !== '') resolved.push(part)
  }
  const resolvedPath = '/' + resolved.join('/')
  return resolvedPath in DOCS_MODULES ? resolvedPath : null
}

function ConceptEmbed({ docPath, title }) {
  const [content, setContent] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open && !content && DOCS_MODULES[docPath]) {
      DOCS_MODULES[docPath]().then((res) => setContent(res))
    }
  }, [open, docPath, content])

  return (
    <span className="my-6 border rounded-xl overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm block w-full">
      <button 
        onClick={(e) => { e.preventDefault(); setOpen(!open); }}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
      >
        <span className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
            📚
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-base">
            Concept: {title}
          </span>
        </span>
        <span className="text-slate-400 dark:text-slate-500 text-xs">
          {open ? '▼' : '▶'}
        </span>
      </button>
      {open && (
        <span className="block p-6 border-t border-slate-200 dark:border-slate-800 w-full overflow-x-auto bg-white dark:bg-slate-900 cursor-auto" onClick={(e) => e.stopPropagation()}>
          {content === null ? (
            <span className="text-slate-500 animate-pulse text-sm">Loading concept...</span>
          ) : (
            <span className="block w-full">
              <SectionedMarkdown 
                content={content} 
                ui={themeStyles?.ui} 
                accentColor={themeStyles?.accentHex || '#0ea5e9'} 
                isDark={themeStyles?.isDark} 
              />
            </span>
          )}
        </span>
      )}
    </span>
  )
}

function MdLink({ href, children }) {
  const { activeFile, onDocLink, scrollToHeading } = useContext(DocsCtx)

  // Same-page anchor — scroll the content container instead of the window
  if (href?.startsWith('#')) {
    return (
      <a href={href} onClick={(e) => { e.preventDefault(); scrollToHeading?.(href.slice(1)) }}>
        {children}
      </a>
    )
  }

  // Relative .md link — always load in Studio, never navigate away
  const hrefBase = href?.split('#')[0] ?? ''
  const isRelativeMd = hrefBase.endsWith('.md') && !href.startsWith('http') && !href.startsWith('//')
  if (isRelativeMd) {
    const docPath = resolveDocPath(activeFile, href)

    const isTddLesson = activeFile?.includes('/projects/inventory/tdd/lessons/')
    const isConcept = hrefBase.startsWith('../concepts/')
    if (isTddLesson && isConcept && docPath) {
      return <ConceptEmbed docPath={docPath} title={extractText(children)} />
    }

    return (
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); if (docPath) onDocLink?.(docPath) }}
        style={{ opacity: docPath ? 1 : 0.5, cursor: docPath ? 'pointer' : 'default' }}
        title={docPath ? undefined : 'Linked document not found in this Studio'}
      >
        {children}
      </a>
    )
  }

  const isExternal = href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//'))
  return (
    <a href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>
      {children}
    </a>
  )
}

// Fenced ```latex / ```math blocks are meant as display equations, not code
// — render them through KaTeX directly so they get the same .katex-display
// "math well" box as inline $$...$$, instead of showing as a code editor.
const MATH_FENCE_LANGS = new Set(['latex', 'math', 'tex'])

// Unlanguaged fences are mostly plain-text/ASCII diagrams, equation systems,
// and terminal output (confirmed: 250+ existing docs rely on bare ``` for
// exactly that) — not real code, and not necessarily valid LaTeX either,
// so running them through KaTeX risks mangling them (e.g. unicode
// subscripts/arrows in an ASCII equation system get parsed as math symbols
// and garbled). Instead, give every bare fence the same boxed "math well"
// visual treatment as a display equation, but render it verbatim as plain
// text — no formatter touches the content, so it can't be misinterpreted.
function MdPlainWell({ code }) {
  return (
    <div className="katex-display">
      <pre>{code}</pre>
    </div>
  )
}

function MdMathBlock({ code }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(code, { displayMode: true, throwOnError: false })
    } catch (e) {
      return `<span class="katex-error">${e.message}</span>`
    }
  }, [code])
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

function MdImage({ src, alt, title }) {
  return (
    <img
      src={src}
      alt={alt || ''}
      title={title || undefined}
      loading="lazy"
      className="md-img"
      onError={(e) => { e.currentTarget.style.opacity = '0.3' }}
    />
  )
}

const MD_COMPONENTS = {
  h1: ({ children }) => <h1 id={headingId(extractText(children))}>{children}</h1>,
  h2: ({ children }) => <h2 id={headingId(extractText(children))}>{children}</h2>,
  h3: ({ children }) => <h3 id={headingId(extractText(children))}>{children}</h3>,
  h4: ({ children }) => <h4 id={headingId(extractText(children))}>{children}</h4>,
  pre({ node }) {
    // react-markdown re-renders `pre` in place at the same tree position when
    // the surrounding doc changes — with no key, React treats it as an update
    // to the SAME component instance rather than a new one. That's harmless
    // for plain elements, but MdCodeBlock's Monaco editor uses an uncontrolled
    // `defaultValue`, which @monaco-editor/react only applies on first mount;
    // reusing the instance across a file change left it showing the
    // previous file's code. Keying by (activeFile + this block's own
    // position) forces a real remount whenever the doc changes, so
    // `defaultValue` gets picked up fresh — the position half keeps the key
    // unique across sibling blocks within the SAME file, so two adjacent
    // code fences don't collide onto a single shared key.
    const { activeFile } = useContext(DocsCtx)
    const blockKey = `${activeFile ?? ''}::${node?.position?.start?.offset ?? node?.position?.start?.line ?? ''}`

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
    if (match) {
      const lang = match[1]
      if (MATH_FENCE_LANGS.has(lang)) return <MdMathBlock key={blockKey} code={code} />
      return <MdCodeBlock key={blockKey} language={lang} code={code} />
    }
    // Unlanguaged fenced block — boxed plain text, see MdPlainWell above.
    return <MdPlainWell key={blockKey} code={code} />
  },
  code({ children }) {
    // Only inline code reaches here; block code is handled entirely by `pre` via node prop
    return <MdInlineCode>{children}</MdInlineCode>
  },
  a({ href, children }) {
    return <MdLink href={href}>{children}</MdLink>
  },
  img({ src, alt, title }) {
    return <MdImage src={src} alt={alt} title={title} />
  },
}

function nodeContainsFile(node, filePath) {
  if (!filePath) return false
  if (node.type === 'file') return node.path === filePath
  return (node.children ?? []).some(child => nodeContainsFile(child, filePath))
}

function TreeNode({ node, activeFile, onSelect, depth = 0, overriddenPaths = new Set(), accentColor = '#0ea5e9', ui = {} }) {
  const [open, setOpen] = useState(() => node.open !== false || nodeContainsFile(node, activeFile))
  const indent = depth * 14

  useEffect(() => {
    if (nodeContainsFile(node, activeFile)) setOpen(true)
  }, [activeFile]) // eslint-disable-line react-hooks/exhaustive-deps

  if (node.type === 'dir') {
    return (
      <div>
        <div
          onClick={() => setOpen((value) => !value)}
          className={`flex items-center gap-1.5 px-2 py-1.5 cursor-pointer transition-colors select-none group ${ui.txt2} ${ui.bgHover}`}
          style={{ paddingLeft: 8 + indent }}
        >
          {open ? <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" /> : <ChevronRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />}
          <Folder className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="text-[11px] font-bold tracking-wide mt-0.5" style={{ color: accentColor }}>{displayName(node.name)}</span>
        </div>
        {open && node.children.map((child, index) => (
          <TreeNode
            key={`${child.name}-${index}`}
            node={child}
            activeFile={activeFile}
            onSelect={onSelect}
            depth={depth + 1}
            overriddenPaths={overriddenPaths}
            accentColor={accentColor}
            ui={ui}
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
      className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer text-xs transition-colors border-l-[3px] ${
        isActive
          ? `${ui.txt1} font-medium`
          : `${ui.txt2} border-transparent ${ui.bgHover}`
      }`}
      style={{ 
        paddingLeft: 12 + indent, 
        ...(isActive ? { borderLeftColor: accentColor, backgroundColor: `${accentColor}1A`, color: accentColor } : {}) 
      }}
    >
      <File className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-70'}`} style={isActive ? { color: accentColor } : {}} />
      <span className="truncate">{displayName(node.name)}</span>
      {isOverridden && <span className="ml-auto text-[9px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Override</span>}
    </div>
  )
}

function DocListItem({ label, subtitle, isActive, onSelect, onDelete, kind, accentColor = '#0ea5e9', ui = {} }) {
  return (
    <div className="flex items-center group">
      <div
        onClick={onSelect}
        className={`flex-1 flex items-center gap-2 px-2 py-1.5 cursor-pointer text-xs transition-colors border-l-[3px] ml-2 ${
          isActive
            ? `${ui.txt1} font-medium`
            : `${ui.txt2} border-transparent ${ui.bgHover}`
        }`}
        style={isActive ? { borderLeftColor: accentColor, backgroundColor: `${accentColor}1A`, color: accentColor } : undefined}
      >
        <FilePenLine className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
        <div className="truncate flex-1">
          <div className="truncate">{label || 'Untitled'}</div>
          {subtitle && <div className={`truncate text-[10px] ${ui.txt3}`}>{subtitle}</div>}
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
        className={`p-1 ${ui.txt3} opacity-0 group-hover:opacity-100 transition-opacity mr-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500`}
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

// ── TTS reader helpers ────────────────────────────────────────────────────────

// remark-math only recognizes $...$ / $$...$$. Content pasted from AI tools
// (ChatGPT, Claude, etc.) commonly uses \( ... \) / \[ ... \] instead — and
// worse, plain Markdown's backslash-escape rule silently drops the lone
// backslash before remark-math ever sees it, leaving bare brackets. Rewrite
// those delimiters to dollar form first, skipping inline code spans so code
// samples containing literal brackets aren't touched.
function convertTexDelimiters(text) {
  return text
    .split(/(`[^`\n]+`)/g)
    .map((part) => part.startsWith('`') ? part : part
      .replace(/\\\[([\s\S]*?)\\\]/g, (_, inner) => `$$${inner}$$`)
      .replace(/\\\(([\s\S]*?)\\\)/g, (_, inner) => `$${inner}$`))
    .join('')
}

// remark-math only treats $$...$$ as block/display math (the boxed "math
// well" styling) when the delimiters sit alone on their own line. A whole
// line that's just "$$<equation>$$" — common when content gets pasted or
// authored compactly — parses as inline math instead and silently loses the
// box. Promote any such line to a proper three-line block.
function normalizeDisplayMath(text) {
  return text
    .split('\n')
    .map((line) => {
      const m = line.match(/^(\s*)\$\$(.+)\$\$(\s*)$/)
      return m && m[2].trim() ? `${m[1]}$$\n${m[2].trim()}\n$$${m[3]}` : line
    })
    .join('\n')
}

function splitIntoPages(markdown) {
  const lines = markdown.split('\n')
  const pages = []
  let currentPage = []
  let inCodeBlock = false
  
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
    }
    
    if (line.startsWith('## ') && !inCodeBlock) {
      if (currentPage.length > 0) {
        pages.push(currentPage.join('\n'))
      }
      currentPage = [line]
    } else {
      currentPage.push(line)
    }
  }
  if (currentPage.length > 0) {
    pages.push(currentPage.join('\n'))
  }
  
  return pages
}

function splitMarkdownSections(markdown) {
  const sections = []
  const fenceRe = /^```[^\n]*\n[\s\S]*?^```[ \t]*$/gm
  let lastIdx = 0
  let match
  while ((match = fenceRe.exec(markdown)) !== null) {
    const before = markdown.slice(lastIdx, match.index)
    if (before.trim()) sections.push({ type: 'prose', content: before })
    sections.push({ type: 'code', content: match[0] })
    lastIdx = match.index + match[0].length
  }
  const after = markdown.slice(lastIdx)
  if (after.trim()) sections.push({ type: 'prose', content: after })
  return sections
}

function SectionedMarkdown({ content, ui, accentColor, isDark, font, width, lineHeight }) {
  const { speak, stop } = useSpeech()
  const [playingIdx, setPlayingIdx] = useState(null)
  const playingIdxRef = useRef(null)
  
  const pages = useMemo(() => {
    return splitIntoPages(content).map(pageContent => splitMarkdownSections(pageContent))
  }, [content])

  useEffect(() => () => { stop() }, [content, stop]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlay = useCallback(async (idx, text) => {
    if (playingIdxRef.current === idx) {
      stop()
      playingIdxRef.current = null
      setPlayingIdx(null)
      return
    }
    stop()
    playingIdxRef.current = idx
    setPlayingIdx(idx)
    await speak(cleanForSpeech(text))
    if (playingIdxRef.current === idx) {
      playingIdxRef.current = null
      setPlayingIdx(null)
    }
  }, [speak, stop])

  return (
    <div className="space-y-6 sm:space-y-8 pb-24">
      {/* Dynamic style for the H1 in the intro page so we can use the accentColor */}
      <style>{`
        .intro-page-content h1 {
          font-size: 2.5rem;
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -0.025em;
          background: linear-gradient(135deg, ${accentColor}, ${accentColor}80);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1.5rem;
        }
        @media (min-width: 640px) {
          .intro-page-content h1 {
            font-size: 3.5rem;
          }
        }
      `}</style>

      {pages.map((sections, pageIdx) => {
        const isIntro = pageIdx === 0
        const widthClass = width === 'narrow' ? 'max-w-3xl mx-auto' : width === 'normal' ? 'max-w-5xl mx-auto' : 'w-full'
        const pageClasses = `bg-white dark:bg-[#0c1520] rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border ${ui?.border || 'border-slate-200 dark:border-slate-800'} w-full ${widthClass}`

        return (
          <div key={pageIdx} className={pageClasses}>
            <div className={`md-body ${isIntro ? 'intro-page-content' : ''}`} style={{
              fontFamily: font === 'serif' ? 'ui-serif, Georgia, serif' : font === 'mono' ? 'ui-monospace, monospace' : 'system-ui, sans-serif',
              lineHeight: lineHeight === 'compact' ? '1.4' : lineHeight === 'relaxed' ? '1.8' : '1.6'
            }}>
              {sections.map((section, secIdx) => {
                const globalIdx = `${pageIdx}-${secIdx}`
                if (section.type === 'code') {
                  return (
                    <ReactMarkdown
                      key={globalIdx}
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeRaw, rehypeKatex]}
                      components={MD_COMPONENTS}
                    >
                      {section.content}
                    </ReactMarkdown>
                  )
                }
                const isPlaying = playingIdx === globalIdx
                return (
                  <div key={globalIdx} className="relative group mt-4">
                    <button
                      onClick={() => handlePlay(globalIdx, section.content)}
                      title={isPlaying ? 'Stop reading' : 'Read aloud'}
                      className={`absolute -top-3 -right-3 z-10 flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md border transition-all shadow-sm ${
                        isPlaying
                          ? 'opacity-100 text-cyan-600 border-cyan-300 bg-cyan-50 dark:text-cyan-300 dark:border-cyan-700/60 dark:bg-cyan-900/20'
                          : `opacity-0 group-hover:opacity-100 text-slate-500 bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700`
                      }`}
                    >
                      {isPlaying
                        ? <><Square className="w-2.5 h-2.5 fill-current" />&nbsp;Stop</>
                        : <><Volume2 className="w-2.5 h-2.5" />&nbsp;Read</>
                      }
                    </button>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeRaw, rehypeKatex]}
                      components={MD_COMPONENTS}
                    >
                      {normalizeDisplayMath(convertTexDelimiters(section.content))}
                    </ReactMarkdown>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
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
  const editorInstanceRef = useRef(null)

  const [readingFont, setReadingFont] = useState(() => localStorage.getItem('mdhub_font') || 'sans')
  const [readingWidth, setReadingWidth] = useState(() => localStorage.getItem('mdhub_width') || 'wide')
  const [readingLineHeight, setReadingLineHeight] = useState(() => localStorage.getItem('mdhub_line_height') || 'relaxed')
  const [typographyOpen, setTypographyOpen] = useState(false)
  
  useEffect(() => { localStorage.setItem('mdhub_font', readingFont) }, [readingFont])
  useEffect(() => { localStorage.setItem('mdhub_width', readingWidth) }, [readingWidth])
  useEffect(() => { localStorage.setItem('mdhub_line_height', readingLineHeight) }, [readingLineHeight])

  // Toolbar insert for the Monaco-backed editor below — real snippet/tabstop
  // support, same mechanism as the Lesson Builder's MarkdownCellEditor.
  const insertIntoEditor = useCallback((btn) => {
    const ed = editorInstanceRef.current
    if (!ed) return
    if (btn.plain != null) {
      ed.trigger('keyboard', 'type', { text: btn.plain })
    } else if (btn.snippet) {
      ed.trigger('keyboard', 'editor.action.insertSnippet', { snippet: btn.snippet })
    }
    ed.focus()
  }, [])
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
  const [sidebarTab, setSidebarTab] = useState('docs') // 'docs' | 'toc'
  const [docSearch, setDocSearch] = useState('')

  // Flat list of all doc paths for search — derived once from the glob keys
  const allDocPaths = useMemo(() => Object.keys(DOCS_MODULES), [])

  const searchResults = useMemo(() => {
    const q = docSearch.trim().toLowerCase()
    if (q.length < 2) return []
    return allDocPaths
      .filter((p) => {
        const rel = p.slice(PREFIX.length).toLowerCase()
        return q.split(/\s+/).every((word) => rel.includes(word))
      })
      .slice(0, 40)
      .map((p) => {
        const rel = p.slice(PREFIX.length)
        const parts = rel.split('/')
        const fileName = parts[parts.length - 1]
        const folder = parts.slice(0, -1).join(' / ')
        return { path: p, fileName: displayName(fileName), folder: displayName(folder) }
      })
  }, [docSearch, allDocPaths])
  const contentScrollRef = useRef(null)
  const headings = useMemo(() => {
    if (!content) return []
    return content.split('\n')
      .filter(line => /^#{1,4} /.test(line))
      .map(line => {
        const m = line.match(/^(#{1,4}) (.+)/)
        if (!m) return null
        const text = m[2].replace(/\*\*/g, '').replace(/`/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
        return { level: m[1].length, text, id: headingId(text) }
      })
      .filter(Boolean)
  }, [content])
  const scrollToHeading = useCallback((id) => {
    const el = contentScrollRef.current?.querySelector(`[id="${CSS.escape(id)}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])
  const { studioTheme, setStudioTheme, themeStyles } = useGlobalTheme();
  const ui = themeStyles.ui;
  const accentColor = STUDIO_THEMES[studioTheme]?.accentHex ?? '#0ea5e9';

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
    try { localStorage.setItem('mdhub_last_tutorial', modulePath) } catch {}
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

  const docsCtxValue = useMemo(() => ({
    isDark: themeStyles.isDark,
    monacoTheme: themeStyles.monaco,
    onRun: handleRunInCodeAlong,
    codeAlongOpen,
    activeFile: tab === 'tutorials' ? activeFile : null,
    onDocLink: selectTutorial,
    onNavigate: navigate,
    scrollToHeading,
  }), [themeStyles, handleRunInCodeAlong, codeAlongOpen, activeFile, selectTutorial, tab, navigate, scrollToHeading])

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
    const lastTutorial = (() => { try { return localStorage.getItem('mdhub_last_tutorial') } catch { return null } })()
    if (lastTutorial && DOCS_MODULES[lastTutorial]) {
      selectTutorial(lastTutorial)
      return
    }
    const readme = Object.keys(DOCS_MODULES).find((modulePath) => modulePath.endsWith('README.md'))
    if (readme) selectTutorial(readme)
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
      <style>{getMdCss(themeStyles.md)}</style>
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.json,.open-calc-doc.json"
        className="hidden"
        onChange={onImportFile}
      />

      <div className={`flex flex-col h-[100vh] w-full ${ui.bg0} ${ui.txt1} font-sans overflow-hidden inset-0 fixed z-[1650]`}>
        <div className={`h-16 ${ui.bg1} bg-opacity-80 backdrop-blur-xl border-b ${ui.border} flex items-center justify-between px-3 sm:px-6 shrink-0 z-50 w-full gap-4 transition-all duration-300 overflow-visible`}>
          
          {/* ── LEFT SECTION: Navigation & Context ── */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Exit Button */}
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${ui.border} ${ui.bg0} ${ui.hoverBg} ${ui.hoverTx} transition-all duration-300 shadow-sm hover:shadow-md font-semibold text-xs group`}
              title="Exit Studio"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Exit</span>
            </button>

            <div className={`w-px h-6 ${ui.border} mx-1 hidden sm:block border-l opacity-50`}></div>

            {/* Nav Toggle */}
            <button
              onClick={() => setDocsNavOpen((v) => !v)}
              className={`p-2 rounded-full border border-transparent ${ui.txt2} ${ui.hoverBg} ${ui.hoverTx} transition-all duration-300 hover:scale-105`}
              title={docsNavOpen ? 'Hide sidebar' : 'Show sidebar'}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Title */}
            <span className={`text-sm font-extrabold ${ui.txt1} tracking-tight ml-1 mr-3 hidden md:inline-block bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-100 dark:to-slate-300`}>
              Studio
            </span>

            {/* Tab switcher */}
            <div className={`flex ${ui.bg2} p-1 rounded-full gap-1 shadow-inner relative`}>
              {['tutorials', 'editor'].map((nextTab) => (
                <button
                  key={nextTab}
                  onClick={() => setTab(nextTab)}
                  className={`relative px-4 py-1.5 text-xs font-bold capitalize rounded-full transition-all duration-300 ease-out z-10 ${
                    tab === nextTab
                      ? `${ui.txt1} drop-shadow-sm`
                      : `${ui.txt2} hover:opacity-80`
                  }`}
                >
                  {tab === nextTab && (
                    <span className={`absolute inset-0 ${ui.bg0} rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] -z-10`} />
                  )}
                  {nextTab === 'tutorials' ? '📖 Tutorials' : '✏️ Editor'}
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT SECTION: Actions & Tools ── */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Theme picker */}
            <div className="relative hidden lg:block group">
              <select
                value={studioTheme}
                onChange={(e) => { setStudioTheme(e.target.value); localStorage.setItem('studio_theme', e.target.value) }}
                className={`appearance-none text-xs font-semibold rounded-full pl-3 pr-8 py-1.5 border ${ui.border} ${ui.bg0} ${ui.txt1} cursor-pointer focus:outline-none shadow-sm hover:shadow transition-shadow`}
                title="Studio theme"
              >
                {Object.entries(STUDIO_THEMES).map(([id, t]) => (
                  <option key={id} value={id}>{t.name}</option>
                ))}
              </select>
              <ChevronDown className={`w-3.5 h-3.5 absolute right-2.5 top-2 pointer-events-none ${ui.txt2} group-hover:${ui.txt1} transition-colors`} />
            </div>

            <div className={`w-px h-6 ${ui.border} mx-1 hidden lg:block border-l opacity-50`}></div>

            {/* Typography picker */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setTypographyOpen(!typographyOpen)}
                className={`p-1.5 rounded-full border border-transparent ${ui.txt2} ${ui.hoverBg} ${ui.hoverTx} transition-all duration-300 hover:scale-105 ${typographyOpen ? ui.bg0 : ''}`}
                title="Typography settings"
              >
                <Type className="w-4 h-4" />
              </button>
              
              {typographyOpen && (
                <div className={`absolute top-full right-0 mt-3 w-64 p-4 rounded-xl shadow-xl border ${ui.border} ${ui.bg0} z-50`}>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-[10px] uppercase font-bold tracking-widest ${ui.txt2} mb-2`}>Font Family</label>
                      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {['sans', 'serif', 'mono'].map(f => (
                          <button key={f} onClick={() => setReadingFont(f)} className={`flex-1 capitalize text-xs py-1.5 rounded-md transition-colors ${readingFont === f ? 'bg-white dark:bg-slate-700 shadow-sm font-bold ' + ui.txt1 : ui.txt2 + ' hover:opacity-80'}`}>{f}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={`block text-[10px] uppercase font-bold tracking-widest ${ui.txt2} mb-2`}>Reading Width</label>
                      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {['narrow', 'normal', 'wide'].map(w => (
                          <button key={w} onClick={() => setReadingWidth(w)} className={`flex-1 capitalize text-xs py-1.5 rounded-md transition-colors ${readingWidth === w ? 'bg-white dark:bg-slate-700 shadow-sm font-bold ' + ui.txt1 : ui.txt2 + ' hover:opacity-80'}`}>{w}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={`block text-[10px] uppercase font-bold tracking-widest ${ui.txt2} mb-2`}>Line Height</label>
                      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {['compact', 'standard', 'relaxed'].map(lh => (
                          <button key={lh} onClick={() => setReadingLineHeight(lh)} className={`flex-1 capitalize text-xs py-1.5 rounded-md transition-colors ${readingLineHeight === lh ? 'bg-white dark:bg-slate-700 shadow-sm font-bold ' + ui.txt1 : ui.txt2 + ' hover:opacity-80'}`}>{lh}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`w-px h-6 ${ui.border} mx-1 hidden lg:block border-l opacity-50`}></div>

            {/* AI / Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCodeAlongOpen((v) => !v)}
                className={`relative group overflow-hidden rounded-full p-[1px] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 ${codeAlongOpen ? 'ring-2 ring-cyan-400/50 ring-offset-1 ring-offset-transparent' : ''}`}
                title="Code-along workspace"
              >
                <span className={`absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-60 group-hover:opacity-100 transition-opacity ${codeAlongOpen ? 'opacity-100' : ''}`} />
                <div className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold ${ui.bg0} rounded-full ${ui.txt1}`}>
                  <Code2 className="w-3.5 h-3.5 text-cyan-500" /><span className="hidden xl:inline">Code Along</span>
                </div>
              </button>

              <button
                onClick={() => setAdaOpen((v) => !v)}
                className={`relative group overflow-hidden rounded-full p-[1px] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 ${adaOpen ? 'ring-2 ring-violet-400/50 ring-offset-1 ring-offset-transparent' : ''}`}
                title="Ask Ada — AI code tutor"
              >
                <span className={`absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60 group-hover:opacity-100 transition-opacity ${adaOpen ? 'opacity-100' : ''}`} />
                <div className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold ${ui.bg0} rounded-full ${ui.txt1}`}>
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" /><span className="hidden xl:inline">Ask Ada</span>
                </div>
              </button>
            </div>

            <div className={`w-px h-6 ${ui.border} mx-1 border-l opacity-50`}></div>

            {/* Document Actions */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 p-1 rounded-full ${ui.bg2} border ${ui.border} shadow-inner`}>
                <button onClick={refreshDocsIndex} className={`p-1.5 rounded-full ${ui.txt2} hover:bg-white dark:hover:bg-slate-700 ${ui.hoverTx} transition-all hover:shadow-sm`} title="Refresh docs index">
                  <RefreshCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => fileInputRef.current?.click()} className={`p-1.5 rounded-full ${ui.txt2} hover:bg-white dark:hover:bg-slate-700 ${ui.hoverTx} transition-all hover:shadow-sm`} title="Import document">
                  <Upload className="w-3.5 h-3.5" />
                </button>
                {((tab === 'tutorials' && activeFile) || (tab === 'editor' && activeDocType)) && (
                  <button onClick={downloadCurrentMarkdown} className={`p-1.5 rounded-full ${ui.txt2} hover:bg-white dark:hover:bg-slate-700 ${ui.hoverTx} transition-all hover:shadow-sm`} title="Download markdown">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Conditional Editors */}
              {tab === 'tutorials' && activeFile && (
                <div className="flex items-center gap-1.5 ml-1">
                  <button
                    onClick={openTutorialOverrideEditor}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-900/30 border border-emerald-300/50 dark:border-emerald-800/50 rounded-full hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 transition-all shadow-sm hover:shadow"
                    title={tutorialOverrideActive ? 'Edit override' : 'Edit local version'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tutorialOverrideActive ? 'Edit override' : 'Edit local'}</span>
                  </button>
                  {tutorialOverrideActive && backendReady && (
                    <button
                      onClick={() => deleteOverrideDoc(activeFile)}
                      className="p-1.5 rounded-full border border-amber-300/50 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/30 hover:bg-amber-200/50 dark:hover:bg-amber-800/50 transition-all shadow-sm hover:shadow"
                      title="Restore built-in doc"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {tab === 'editor' && activeDocType && (
                <div className="flex items-center gap-1.5 ml-1">
                  {previewMode ? (
                    <button
                      onClick={() => setPreviewMode(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/50 dark:bg-indigo-900/30 border border-indigo-300/50 dark:border-indigo-800/50 rounded-full hover:bg-indigo-200/50 transition-all shadow-sm hover:shadow"
                    >
                      <Edit2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Edit</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setPreviewMode(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-900/30 border border-emerald-300/50 dark:border-emerald-800/50 rounded-full hover:bg-emerald-200/50 transition-all shadow-sm hover:shadow"
                    >
                      <Eye className="w-3.5 h-3.5" /><span className="hidden sm:inline">Preview</span>
                    </button>
                  )}
                  <button
                    onClick={exportSharePack}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-100/50 dark:bg-sky-900/30 border border-sky-300/50 dark:border-sky-800/50 rounded-full hover:bg-sky-200/50 transition-all shadow-sm hover:shadow hidden sm:flex"
                  >
                    <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              )}
            </div>
            
          </div>
        </div>


        <DocsCtx.Provider value={docsCtxValue}>
        <div className={`flex flex-1 min-h-0 overflow-hidden w-full relative ${codeAlongOpen ? 'min-w-0' : ''}`}>
          <div className={`${docsNavOpen ? 'hidden sm:flex' : 'hidden'} ${codeAlongOpen ? 'w-[240px]' : 'w-[300px]'} ${ui.bg1} border-r ${ui.border} flex-col shrink-0 overflow-hidden h-full`}>

            {/* ── Docs search bar ── */}
            {tab === 'tutorials' && (
              <div className={`shrink-0 px-2 py-2 border-b ${ui.border}`}>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${ui.border} ${ui.bg1} transition-colors focus-within:ring-1`}
                  style={{ '--tw-ring-color': accentColor }}
                >
                  <svg className="w-3 h-3 shrink-0 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    placeholder="Search docs…"
                    className={`flex-1 bg-transparent text-[12px] outline-none placeholder-slate-400 dark:placeholder-slate-600 ${ui.txt1}`}
                  />
                  {docSearch && (
                    <button
                      onClick={() => setDocSearch('')}
                      className="opacity-40 hover:opacity-70 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Sidebar tab switcher — only in tutorials mode when doc has headings and not searching */}
            {tab === 'tutorials' && headings.length > 0 && !docSearch && (
              <div className={`flex shrink-0 border-b ${ui.border}`}>
                <button
                  onClick={() => setSidebarTab('docs')}
                  className={`flex-1 py-1.5 text-[11px] font-bold transition-colors border-b-2 ${sidebarTab === 'docs' ? '' : 'border-transparent ' + ui.txt2 + ' ' + ui.hoverBg}`}
                  style={sidebarTab === 'docs' ? { borderBottomColor: accentColor, color: accentColor } : {}}
                >
                  Documents
                </button>
                <button
                  onClick={() => setSidebarTab('toc')}
                  className={`flex-1 py-1.5 text-[11px] font-bold transition-colors border-b-2 ${sidebarTab === 'toc' ? '' : 'border-transparent ' + ui.txt2 + ' ' + ui.hoverBg}`}
                  style={sidebarTab === 'toc' ? { borderBottomColor: accentColor, color: accentColor } : {}}
                >
                  On This Page
                </button>
              </div>
            )}

            {/* ── Search results ── */}
            {tab === 'tutorials' && docSearch.trim().length >= 2 && (
              <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                {searchResults.length === 0 ? (
                  <p className={`px-3 py-4 text-[11px] text-center ${ui.txt2}`}>No results for "{docSearch.trim()}"</p>
                ) : (
                  <>
                    <p className={`px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest ${ui.txt2}`}>
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </p>
                    {searchResults.map((r) => (
                      <div
                        key={r.path}
                        onClick={() => { selectTutorial(r.path); setDocSearch('') }}
                        className={`flex flex-col gap-0.5 px-3 py-2 cursor-pointer border-l-2 transition-colors ${
                          activeFile === r.path
                            ? `${ui.txt1} bg-slate-100 dark:bg-slate-800/60`
                            : `border-transparent ${ui.txt2} hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:${ui.txt1}`
                        }`}
                        style={activeFile === r.path ? { borderLeftColor: accentColor } : {}}
                      >
                        <span className="text-[12px] font-medium truncate" style={activeFile === r.path ? { color: accentColor } : {}}>{r.fileName}</span>
                        {r.folder && <span className={`text-[10px] truncate ${ui.txt2}`}>{r.folder}</span>}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
            {/* ── Normal tree (hidden while searching) ── */}
            {!(tab === 'tutorials' && docSearch.trim().length >= 2) && (
            <div className="flex-1 overflow-y-auto py-3 custom-scrollbar min-h-0">
              {tab === 'tutorials' && (sidebarTab === 'docs' || !headings.length) && (
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
                      accentColor={accentColor}
                      ui={ui}
                    />
                    ))
              )}

              {tab === 'tutorials' && !docSearch && sidebarTab === 'toc' && headings.length > 0 && (
                <div className="py-1">
                  {headings.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => { scrollToHeading(h.id); setSidebarTab('docs') }}
                      className={`w-full text-left py-1 text-[12px] ${ui.txt2} ${ui.hoverBg} transition-colors truncate`}
                      style={{ paddingLeft: 10 + (h.level - 1) * 12, paddingRight: 8 }}
                      title={h.text}
                    >
                      {h.level > 1 && <span className="opacity-25 mr-1">{'–'.repeat(h.level - 1)}</span>}
                      {h.text}
                    </button>
                  ))}
                </div>
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
                      accentColor={accentColor}
                      ui={ui}
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
                      accentColor={accentColor}
                      ui={ui}
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
            )}

            {tab === 'editor' && (
              <div className={`shrink-0 p-3 border-t ${ui.border} ${ui.bg1}`}>
                <button
                  onClick={createUserDoc}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors shadow-sm"
                >
                  <FilePlus className="w-4 h-4" /> New Document
                </button>
              </div>
            )}
          </div>

          <div className={`flex-1 min-w-0 flex flex-col overflow-hidden ${ui.bg0}`}>
            {tab === 'tutorials' && (
              <div ref={contentScrollRef} className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-16 py-8 custom-scrollbar">
                {loading ? (
                  <div className="text-slate-500 text-sm animate-pulse">Loading document...</div>
                ) : (
                  <div className="w-full">
                    {activeFile && (
                      <div className="mb-6 flex items-center gap-2 flex-wrap px-4">
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
                    <SectionedMarkdown 
                      content={content} 
                      ui={themeStyles.ui} 
                      accentColor={accentColor} 
                      isDark={themeStyles.isDark} 
                      font={readingFont}
                      width={readingWidth}
                      lineHeight={readingLineHeight}
                    />
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
              <div className="flex-1 overflow-y-auto px-2 sm:px-4 lg:px-6 py-8 custom-scrollbar"
                style={{ background: isDark ? themeStyles.md.preBg + '80' : 'rgba(248,250,252,0.5)' }}>
                <SectionedMarkdown 
                  content={editorContent} 
                  ui={themeStyles.ui} 
                  accentColor={accentColor} 
                  isDark={themeStyles.isDark} 
                  font={readingFont}
                  width={readingWidth}
                  lineHeight={readingLineHeight}
                />
              </div>
            )}

            {tab === 'editor' && activeDocType && !previewMode && (
              <div className={`flex-1 flex flex-col overflow-hidden ${ui.bg0}`}>
                <div className={`flex items-center gap-3 px-6 py-2 border-b ${ui.border}`}
                  style={{ background: themeStyles.md.codeHeaderBg }}>
                  <span className={`text-[10px] font-bold tracking-widest ${ui.txt2} uppercase`}>
                    {activeDocType === 'override' ? 'Override' : 'Document'}
                  </span>
                  <input
                    value={editorName}
                    onChange={(event) => setEditorName(event.target.value)}
                    placeholder="Document name..."
                    className={`flex-1 bg-transparent border-none text-sm font-semibold ${ui.txt1} outline-none focus:ring-0`}
                    style={{ color: themeStyles.md.h1 }}
                  />
                  <span className={`text-[10px] ${ui.txt2} px-2 py-0.5 rounded flex items-center gap-1.5`}
                    style={{ background: themeStyles.md.thBg }}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    {isSaving ? 'Saving' : 'Saved'}
                  </span>
                </div>
                <MarkdownToolbar onInsert={insertIntoEditor} />
                <div className="flex-1 min-h-0">
                  <Editor
                    key={activeDocType === 'user' ? `user:${activeUserId}` : `override:${activeOverridePath}`}
                    defaultValue={editorContent}
                    language="markdown"
                    theme={themeStyles.monaco || (themeStyles.isDark ? 'open-calc-dark' : 'open-calc-light')}
                    beforeMount={setupOpenCalcMonaco}
                    onChange={(value) => setEditorContent(value ?? '')}
                    onMount={(editor) => { editorInstanceRef.current = editor }}
                    options={{
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
                      lineHeight: 22,
                      minimap: { enabled: false },
                      wordWrap: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 20, bottom: 20 },
                      lineNumbers: 'on',
                    }}
                  />
                </div>
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
                <DocsCodeWorkspace activeTitle={activeTitle} pendingRun={pendingRun} onCodeChange={handleCodeChange} accentColor={accentColor} monacoTheme={themeStyles.monaco} themeUi={themeStyles.ui} />
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
          ui={ui}
          accentColor={accentColor}
        />
      )}
    </>
  )
}
