import { useCallback, useEffect, useRef, useState } from 'react'
import { RotateCcw, Send, Zap } from 'lucide-react'
import { useStudioAI } from '../../hooks/useStudioAI.js'

// ── Render AI response with code block support ────────────────────────────────
function AiMessage({ text, isDark }) {
  const D = isDark
  const parts = []
  let remaining = text
  let key = 0

  // Walk through the text extracting ```lang\ncode``` blocks
  while (remaining.length > 0) {
    const blockStart = remaining.indexOf('```')
    if (blockStart === -1) {
      parts.push(<span key={key++}>{renderInline(remaining, D)}</span>)
      break
    }
    if (blockStart > 0) {
      parts.push(<span key={key++}>{renderInline(remaining.slice(0, blockStart), D)}</span>)
    }
    const afterFence = remaining.slice(blockStart + 3)
    const blockEnd = afterFence.indexOf('```')
    if (blockEnd === -1) {
      parts.push(<span key={key++}>{renderInline(remaining.slice(blockStart), D)}</span>)
      break
    }
    const block = afterFence.slice(0, blockEnd)
    const nlIdx = block.indexOf('\n')
    const lang = nlIdx !== -1 ? block.slice(0, nlIdx).trim() : ''
    const code = nlIdx !== -1 ? block.slice(nlIdx + 1) : block
    parts.push(<CodeBlock key={key++} lang={lang} code={code} isDark={D} />)
    remaining = afterFence.slice(blockEnd + 3)
  }

  return <div className="leading-relaxed">{parts}</div>
}

function renderInline(text, isDark) {
  // Handle `inline code` and **bold**
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
  return tokens.map((t, i) => {
    if (t.startsWith('`') && t.endsWith('`')) {
      return (
        <code key={i} className={`px-1 rounded font-mono text-[10px] ${isDark ? 'bg-slate-800 text-violet-300' : 'bg-slate-100 text-violet-700'}`}>
          {t.slice(1, -1)}
        </code>
      )
    }
    if (t.startsWith('**') && t.endsWith('**')) {
      return <strong key={i} className={isDark ? 'text-slate-100' : 'text-slate-900'}>{t.slice(2, -2)}</strong>
    }
    return <span key={i}>{t}</span>
  })
}

function CodeBlock({ lang, code, isDark }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className={`my-2 rounded-lg overflow-hidden border ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
      <div className={`flex items-center justify-between px-2 py-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{lang || 'code'}</span>
        <button onClick={copy} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded transition-colors ${copied ? 'text-emerald-400' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>
      <pre className={`text-[11px] font-mono p-2.5 overflow-x-auto whitespace-pre ${isDark ? 'bg-[#0c1520] text-slate-200' : 'bg-white text-slate-800'}`}>{code}</pre>
    </div>
  )
}

// ── Quick action prompts ───────────────────────────────────────────────────────
const QUICK = [
  { label: 'Explain the code',   q: 'Explain what this code does step by step. Highlight anything a beginner should pay close attention to.' },
  { label: 'Debug the error',    q: 'Look at the terminal output and explain exactly what the error means and how to fix it.' },
  { label: 'Write a working example', q: 'Write a clean, complete working example based on what this code is trying to do.' },
  { label: 'Why no real server?', q: 'Explain why I cannot visit a real URL for my server and what I would need to run this outside the browser.' },
  { label: 'Improve the code',   q: 'Suggest concrete improvements to the structure, readability, or correctness of this code.' },
  { label: 'Explain from tutorial', q: 'Connect what is in the tutorial I am reading to what my current code is doing.' },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function WorkspaceAIPanel({ code, language, filename, terminalOutput, tutorialContent, isDark }) {
  const { askStream, isThinking, isDownloading, downloadProgress } = useStudioAI()
  const [history, setHistory] = useState([])   // [{role:'user'|'ai', text}]
  const [input, setInput]     = useState('')
  const [streaming, setStreaming] = useState('')
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const hasAutoRef = useRef(false)
  const D = isDark

  const bg     = D ? 'bg-[#080f1a]'     : 'bg-slate-50'
  const bg1    = D ? 'bg-slate-900'     : 'bg-white'
  const border = D ? 'border-slate-800' : 'border-slate-200'
  const txt    = D ? 'text-slate-200'   : 'text-slate-800'
  const txt2   = D ? 'text-slate-400'   : 'text-slate-500'
  const bubbleUser = D ? 'bg-slate-800/80 text-slate-200' : 'bg-slate-100 text-slate-800'
  const bubbleAI   = D ? 'bg-violet-950/60 border border-violet-800/40 text-slate-200' : 'bg-violet-50 border border-violet-200 text-slate-800'

  const context = { code, language, filename, terminalOutput, tutorialContent }

  const send = useCallback(async (question) => {
    const q = question.trim()
    if (!q || isThinking) return
    setInput('')
    const newHistory = [...history, { role: 'user', text: q }]
    setHistory(newHistory)
    setStreaming('')

    let full = ''
    await askStream(q, context, history, chunk => { full = chunk; setStreaming(chunk) })
    setStreaming('')
    setHistory(prev => [...prev, { role: 'ai', text: full }])
  }, [askStream, isThinking, history, context]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-explain on first open if there's code to look at
  useEffect(() => {
    if (!hasAutoRef.current && (code?.trim() || tutorialContent?.trim())) {
      hasAutoRef.current = true
      send('Explain what is in the editor and what the student is working on. If there are browser sandbox limitations relevant to this code, explain them clearly.')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [history, streaming])

  const onKey = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }, [send, input])

  const clearHistory = () => { setHistory([]); hasAutoRef.current = false; setStreaming('') }

  return (
    <div className={`flex flex-col h-full ${bg} ${txt}`}>

      {/* Header */}
      <div className={`shrink-0 flex items-center gap-2 px-3 py-2 border-b ${border} ${bg1}`}>
        <span className="text-[11px] font-bold text-violet-400">✦ Turing</span>
        <span className={`text-[10px] ${txt2}`}>— private code tutor · local AI · not in chat</span>
        {isDownloading && (
          <span className="ml-auto text-[10px] text-amber-400 animate-pulse truncate max-w-[200px]">
            {downloadProgress || 'Downloading AI model…'}
          </span>
        )}
        {history.length > 0 && !isDownloading && (
          <button onClick={clearHistory} className={`ml-auto p-1 rounded ${txt2} hover:text-red-400 transition-colors`} title="Clear conversation">
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">

        {history.length === 0 && !isThinking && !isDownloading && !streaming && (
          <div className={`text-center pt-4 text-[11px] ${txt2} space-y-1`}>
            <p className="font-semibold text-violet-400">Turing is your private code tutor.</p>
            <p>Reads your code, terminal output, and the current tutorial.</p>
            <p>Pick a question below or type your own.</p>
          </div>
        )}

        {isDownloading && (
          <div className={`rounded-lg p-3 text-xs ${bubbleAI}`}>
            <p className="font-semibold text-violet-400 mb-1">✦ Turing</p>
            <p className="text-amber-300 animate-pulse">{downloadProgress || 'Downloading AI model (first-time only, ~500 MB)…'}</p>
            <p className={`mt-1 text-[10px] ${txt2}`}>The model runs entirely in your browser — no data sent anywhere.</p>
          </div>
        )}

        {history.map((m, i) => (
          <div key={i} className={`rounded-lg px-3 py-2 text-xs ${m.role === 'user' ? bubbleUser : bubbleAI}`}>
            {m.role === 'ai' && <p className="font-bold text-violet-400 text-[10px] mb-1">✦ Turing</p>}
            {m.role === 'ai'
              ? <AiMessage text={m.text} isDark={D} />
              : <span className="whitespace-pre-wrap">{m.text}</span>
            }
          </div>
        ))}

        {/* Live streaming response */}
        {streaming && (
          <div className={`rounded-lg px-3 py-2 text-xs ${bubbleAI}`}>
            <p className="font-bold text-violet-400 text-[10px] mb-1">✦ Turing</p>
            <AiMessage text={streaming} isDark={D} />
            <span className="animate-pulse text-violet-400">▍</span>
          </div>
        )}

        {isThinking && !streaming && (
          <div className={`rounded-lg px-3 py-2 text-xs ${bubbleAI}`}>
            <p className="font-bold text-violet-400 text-[10px] mb-1">✦ Turing</p>
            <span className={`animate-pulse ${txt2}`}>Thinking…</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick actions — shown when conversation is empty */}
      {history.length < 2 && !isThinking && !isDownloading && (
        <div className={`shrink-0 px-3 py-2 border-t ${border} flex flex-wrap gap-1.5`}>
          {QUICK.map(({ label, q }) => (
            <button
              key={label}
              onClick={() => send(q)}
              disabled={isThinking || isDownloading}
              className={`text-[10px] px-2 py-1 rounded border font-medium transition-colors disabled:opacity-40 ${
                D
                  ? 'border-violet-800/60 text-violet-300 hover:bg-violet-900/30'
                  : 'border-violet-300 text-violet-700 hover:bg-violet-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className={`shrink-0 flex items-center gap-2 px-3 py-2 border-t ${border} ${bg1}`}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          disabled={isThinking || isDownloading}
          placeholder={isDownloading ? 'Loading model…' : 'Ask Turing about your code or the tutorial…'}
          className={`flex-1 bg-transparent outline-none text-xs ${txt} placeholder:text-slate-500`}
          style={{ fontFamily: 'inherit' }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || isThinking || isDownloading}
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors"
        >
          {isThinking
            ? <Zap className="w-3 h-3 text-white animate-pulse" />
            : <Send className="w-3 h-3 text-white" />
          }
        </button>
      </div>
    </div>
  )
}
