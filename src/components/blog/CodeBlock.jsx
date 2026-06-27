import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { runCode, RUNNABLE_LANGS, WANDBOX_COMPILER } from '../../utils/codeRunner.js'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import Prism from 'prismjs'
import '../../styles/prism-blog.css'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-ruby'
import 'prismjs/components/prism-lua'
import 'prismjs/components/prism-r'
import 'prismjs/components/prism-julia'
import 'prismjs/components/prism-haskell'
import 'prismjs/components/prism-kotlin'
import 'prismjs/components/prism-scala'

const MonacoEditor = lazy(() => import('@monaco-editor/react').then((m) => ({ default: m.default })))

const LANG_LABEL = {
  python: 'Python', py: 'Python',
  javascript: 'JavaScript', js: 'JavaScript',
  typescript: 'TypeScript', ts: 'TypeScript',
  matlab: 'MATLAB', m: 'MATLAB',
  cpp: 'C++', 'c++': 'C++', c: 'C',
  java: 'Java', rust: 'Rust', go: 'Go', ruby: 'Ruby',
  php: 'PHP', swift: 'Swift', r: 'R', julia: 'Julia',
  lua: 'Lua', haskell: 'Haskell',
  csharp: 'C#', 'c#': 'C#', scala: 'Scala', kotlin: 'Kotlin',
  perl: 'Perl', bash: 'Bash', sh: 'Bash', shell: 'Bash',
  powershell: 'PowerShell', ps1: 'PowerShell',
}

const MONACO_LANG = {
  python: 'python', py: 'python',
  javascript: 'javascript', js: 'javascript',
  typescript: 'typescript', ts: 'typescript',
  matlab: 'plaintext', m: 'plaintext',
  cpp: 'cpp', 'c++': 'cpp', c: 'c',
  java: 'java', rust: 'rust', go: 'go', ruby: 'ruby',
  php: 'php', swift: 'swift', r: 'r', julia: 'julia',
  lua: 'lua', haskell: 'haskell',
  csharp: 'csharp', 'c#': 'csharp', scala: 'scala', kotlin: 'kotlin',
  perl: 'perl', bash: 'shell', sh: 'shell', shell: 'shell',
  powershell: 'powershell', ps1: 'powershell',
}

const PRISM_LANG = {
  'c++': 'cpp', 'c#': 'csharp',
  sh: 'bash', shell: 'bash',
  m: 'plaintext', matlab: 'plaintext',
}

const PISTON_LANGS = new Set(['kotlin', 'powershell', 'ps1'])

const STDIN_PATTERNS = {
  python: /\binput\s*\(/, py: /\binput\s*\(/,
  c: /\bscanf\s*\(|\bfgets\s*\(|\bgetchar\s*\(/,
  cpp: /\bscanf\s*\(|\bcin\s*>>|\bstd::cin\b|\bgetline\s*\(/, 'c++': /\bscanf\s*\(|\bcin\s*>>|\bstd::cin\b|\bgetline\s*\(/,
  java: /\bScanner\b|\bSystem\.in\b/,
  rust: /\bstdin\(\)|\bread_line\b/,
  go: /\bfmt\.Scan\b|\bbufio\.NewReader\b/,
  ruby: /\bgets\b/,
  kotlin: /\breadLine\s*\(\)/,
  haskell: /\bgetLine\b|\bgetContents\b/,
  bash: /\bread\s/, sh: /\bread\s/, shell: /\bread\s/,
  javascript: /\bprompt\s*\(/, js: /\bprompt\s*\(/,
}

function needsStdin(lang, code) {
  const re = STDIN_PATTERNS[lang]
  return re ? re.test(code) : false
}

function CopyButton({ getText }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API unavailable (e.g. non-https) — silently ignore
    }
  }
  return (
    <button
      onClick={handleCopy}
      title="Copy code"
      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors px-2 py-0.5 rounded"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

function HighlightedCode({ code, language }) {
  const prismKey = PRISM_LANG[language] || language
  const grammar = Prism.languages[prismKey]
  const html = grammar
    ? Prism.highlight(code, grammar, prismKey)
    : code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return (
    <pre
      className="m-0 p-4 text-[13px] leading-[1.6] overflow-x-auto font-mono bg-transparent"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default function CodeBlock({ language = '', code, cellIndex, getPriorContext, onCodeChange }) {
  const { isDarkGlobal } = useGlobalTheme()
  const trimmedCode = code.trimEnd()
  const isTerminalOutput = !language
  const lang = language.toLowerCase()
  const isRunnable = RUNNABLE_LANGS.has(lang)
  const isPiston = PISTON_LANGS.has(lang)
  const isWandbox = lang in WANDBOX_COMPILER
  const label = LANG_LABEL[lang] || language || 'output'
  const monacoLang = MONACO_LANG[lang] || 'plaintext'
  const monacoTheme = isDarkGlobal ? 'vs-dark' : 'vs'
  const codeBg = isDarkGlobal ? 'bg-[#1e1e2e]' : 'bg-[#f6f8fa]'

  const [editing, setEditing] = useState(false)
  const [editorCode, setEditorCode] = useState(trimmedCode)
  const [output, setOutput] = useState(null)
  const [running, setRunning] = useState(false)
  const [isError, setIsError] = useState(false)
  const [stdinValue, setStdinValue] = useState('')
  const showStdin = isRunnable && needsStdin(lang, editorCode)

  const lineCount = editorCode.split('\n').length
  const editorHeight = Math.min(Math.max(lineCount * 20 + 24, 80), 560)

  const prevCode = useRef(trimmedCode)
  useEffect(() => {
    if (prevCode.current !== trimmedCode) {
      prevCode.current = trimmedCode
      setEditorCode(trimmedCode)
      setOutput(null)
    }
  }, [trimmedCode])

  function handleEditorChange(v) {
    const updated = v ?? ''
    setEditorCode(updated)
    onCodeChange?.(cellIndex, lang, updated)
  }

  async function handleRun() {
    setRunning(true)
    setOutput(null)
    setIsError(false)
    onCodeChange?.(cellIndex, lang, editorCode)
    try {
      const priorCode = getPriorContext ? getPriorContext(cellIndex, lang, editorCode) : ''
      const result = await runCode(language, editorCode, priorCode, stdinValue)
      const err = typeof result === 'string' && (result.startsWith('Error:') || result.startsWith('No runner'))
      setOutput(result || '(no output)')
      setIsError(err)
    } catch (e) {
      setOutput('Error: ' + e.message)
      setIsError(true)
    } finally {
      setRunning(false)
    }
  }

  // Terminal / plain output block
  if (isTerminalOutput) {
    return (
      <div className={`my-3 rounded-xl overflow-hidden border ${isDarkGlobal ? 'border-zinc-700 bg-zinc-900' : 'border-slate-200 bg-white'}`}>
        <div className={`px-4 py-1.5 flex items-center gap-2 ${isDarkGlobal ? 'bg-zinc-800' : 'bg-slate-100 border-b border-slate-200'}`}>
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <span className={`ml-2 text-xs font-mono flex-1 ${isDarkGlobal ? 'text-zinc-400' : 'text-slate-500'}`}>output</span>
          <CopyButton getText={() => trimmedCode} />
        </div>
        <pre className={`m-0 px-4 py-3 text-[13px] leading-[1.6] font-mono overflow-x-auto whitespace-pre-wrap ${isDarkGlobal ? 'text-emerald-300' : 'text-slate-700'}`}>
          {trimmedCode}
        </pre>
      </div>
    )
  }

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2 ${isDarkGlobal ? 'bg-slate-900' : 'bg-slate-100 border-b border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkGlobal ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
          {isWandbox && isRunnable && (
            <span className={`text-[10px] font-mono ${isDarkGlobal ? 'text-slate-500' : 'text-slate-400'}`}>via Wandbox</span>
          )}
          {!isWandbox && isPiston && isRunnable && (
            <span className={`text-[10px] font-mono ${isDarkGlobal ? 'text-slate-500' : 'text-slate-400'}`}>via Piston</span>
          )}
          {(lang === 'matlab' || lang === 'm') && (
            <span className={`text-[10px] font-mono ${isDarkGlobal ? 'text-slate-500' : 'text-slate-400'}`}>via OpenMAT</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <CopyButton getText={() => editing ? editorCode : trimmedCode} />
          {editing && editorCode !== trimmedCode && (
            <button
              onClick={() => { setEditorCode(trimmedCode); setOutput(null); onCodeChange?.(cellIndex, lang, trimmedCode) }}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors px-2 py-0.5 rounded"
            >
              Reset
            </button>
          )}
          {isRunnable && !editing && (
            <button
              onClick={() => setEditing(true)}
              className={`text-[11px] transition-colors px-2 py-0.5 rounded border ${isDarkGlobal ? 'text-indigo-300 hover:text-indigo-200 border-indigo-500/40 hover:border-indigo-400/60' : 'text-indigo-600 hover:text-indigo-700 border-indigo-300 hover:border-indigo-400'}`}
            >
              Edit
            </button>
          )}
          {isRunnable && (
            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {running ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running…
                </>
              ) : (
                <>▶ Run</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Code area */}
      <div className={codeBg}>
        {editing ? (
          <Suspense fallback={<div className="px-4 py-3 text-slate-400 text-sm font-mono">Loading editor…</div>}>
            <MonacoEditor
              height={`${editorHeight}px`}
              language={monacoLang}
              value={editorCode}
              onChange={handleEditorChange}
              theme={monacoTheme}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                lineHeight: 20,
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                padding: { top: 12, bottom: 12 },
                wordWrap: 'off',
                folding: false,
                renderLineHighlight: 'gutter',
              }}
            />
          </Suspense>
        ) : (
          <div className={isDarkGlobal ? 'text-[#ccc]' : 'text-[#24292e]'}>
            <HighlightedCode code={trimmedCode} language={lang} />
          </div>
        )}
      </div>

      {/* Stdin panel — shown when code contains input calls */}
      {showStdin && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Stdin</span>
              <span className="text-[10px] text-amber-500/70 dark:text-amber-600/70">one value per line</span>
            </div>
            {stdinValue && (
              <button
                onClick={() => setStdinValue('')}
                className="text-[10px] text-amber-500 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            value={stdinValue}
            onChange={e => setStdinValue(e.target.value)}
            placeholder="Type program inputs here…"
            rows={Math.min(Math.max(stdinValue.split('\n').length, 2), 6)}
            spellCheck={false}
            className="w-full px-4 py-2.5 text-[13px] font-mono leading-relaxed bg-amber-50/60 dark:bg-amber-950/10 text-slate-800 dark:text-slate-200 border-0 outline-none resize-none placeholder-amber-400/60 dark:placeholder-amber-700/60"
          />
        </div>
      )}

      {/* Output panel */}
      {output !== null && (
        <div className={`border-t ${isError ? isDarkGlobal ? 'border-red-500/30 bg-red-950/40' : 'border-red-200 bg-red-50' : isDarkGlobal ? 'border-emerald-500/20 bg-zinc-950' : 'border-emerald-200 bg-emerald-50/50'}`}>
          <div className="flex items-center justify-between px-3 py-1">
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${isError ? isDarkGlobal ? 'text-red-400' : 'text-red-600' : isDarkGlobal ? 'text-emerald-500' : 'text-emerald-700'}`}>
              {isError ? 'Error' : 'Output'}
            </span>
            <CopyButton getText={() => output} />
          </div>
          <pre className={`m-0 px-4 pb-3 text-[13px] leading-[1.6] font-mono overflow-x-auto whitespace-pre-wrap ${isError ? isDarkGlobal ? 'text-red-300' : 'text-red-700' : isDarkGlobal ? 'text-emerald-300' : 'text-emerald-800'}`}>
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}
