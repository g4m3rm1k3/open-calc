import { useCallback, useEffect, useRef, useState } from 'react'
import { Minus, Send, X, Zap, Sparkles } from 'lucide-react'
import { useStudioAI } from '../../hooks/useStudioAI.js'

// ── Inline markdown renderer (code blocks + bold + inline code) ───────────────
function AiMessage({ text, isDark }) {
  const D = isDark
  const parts = []
  let rest = text
  let k = 0
  while (rest.length) {
    const s = rest.indexOf('```')
    if (s === -1) { parts.push(<span key={k++}>{inline(rest, D)}</span>); break }
    if (s > 0) parts.push(<span key={k++}>{inline(rest.slice(0, s), D)}</span>)
    const after = rest.slice(s + 3)
    const e = after.indexOf('```')
    if (e === -1) { parts.push(<span key={k++}>{inline(rest.slice(s), D)}</span>); break }
    const block = after.slice(0, e)
    const nl = block.indexOf('\n')
    const lang = nl !== -1 ? block.slice(0, nl).trim() : ''
    const code = nl !== -1 ? block.slice(nl + 1) : block
    parts.push(<CodeBlock key={k++} lang={lang} code={code} isDark={D} />)
    rest = after.slice(e + 3)
  }
  return <div className="leading-relaxed space-y-1">{parts}</div>
}

function inline(text, D) {
  return text.split(/(`[^`\n]+`|\*\*[^*]+\*\*)/g).map((t, i) => {
    if (t.startsWith('`') && t.endsWith('`'))
      return <code key={i} className={`px-1 rounded font-mono text-[10px] ${D ? 'bg-slate-800 text-cyan-300' : 'bg-slate-100 text-cyan-700'}`}>{t.slice(1, -1)}</code>
    if (t.startsWith('**') && t.endsWith('**'))
      return <strong key={i} className={D ? 'text-white' : 'text-slate-900'}>{t.slice(2, -2)}</strong>
    return <span key={i}>{t}</span>
  })
}

function CodeBlock({ lang, code, isDark }) {
  const D = isDark
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(code).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className={`my-1.5 rounded overflow-hidden border text-[11px] ${D ? 'border-slate-700' : 'border-slate-300'}`}>
      <div className={`flex items-center justify-between px-2 py-0.5 ${D ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <span className={`font-mono text-[9px] font-bold uppercase tracking-wider ${D ? 'text-slate-400' : 'text-slate-500'}`}>{lang || 'code'}</span>
        <button onClick={copy} className={`text-[9px] font-semibold transition-colors ${copied ? 'text-emerald-400' : D ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>{copied ? '✓' : 'copy'}</button>
      </div>
      <pre className={`p-2 overflow-x-auto whitespace-pre font-mono text-[11px] ${D ? 'bg-[#0c1520] text-slate-200' : 'bg-white text-slate-800'}`}>{code}</pre>
    </div>
  )
}

const QUICK = [
  { label: 'Explain this code',  q: 'In 2-3 sentences, what does this code do?' },
  { label: 'Debug the error',    q: 'What does the terminal error mean and how do I fix it? Be brief.' },
  { label: 'Write an example',   q: 'Write a short working example for this.' },
  { label: 'Why no real server?', q: 'Why can\'t I visit a real URL and what would I need to run this for real?' },
  { label: 'Improve the code',   q: 'What is one concrete improvement I can make to this code?' },
  { label: 'Explain from tutorial', q: 'How does what I\'m coding relate to what the tutorial is teaching?' },
]

export default function AdaPanel({ code = '', language = '', filename = '', terminalOutput = '', tutorialContent = '', fileList = [], isDark = true, ui = {}, accentColor = '#0ea5e9' }) {
  const { askStream, isThinking, isDownloading, downloadProgress } = useStudioAI()
  const [history, setHistory] = useState([])
  const [input, setInput]     = useState('')
  const [streaming, setStreaming] = useState('')
  const [minimized, setMinimized] = useState(false)
  const [pos,  setPos]  = useState({ x: Math.max(0, window.innerWidth - 420), y: 80 })
  const [size, setSize] = useState({ w: 390, h: 520 })
  const dragging  = useRef(false)
  const dragStart = useRef(null)
  const resizing  = useRef(false)
  const resStart  = useRef(null)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const D = isDark

  // ── Drag ───────────────────────────────────────────────────────────────────
  const onHeaderMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return
    dragging.current = true
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
    e.preventDefault()
  }, [pos])

  // ── Resize ─────────────────────────────────────────────────────────────────
  const onResizeMouseDown = useCallback((e) => {
    resizing.current = true
    resStart.current = { mx: e.clientX, my: e.clientY, w: size.w, h: size.h }
    e.preventDefault()
    e.stopPropagation()
  }, [size])

  useEffect(() => {
    const onMove = (e) => {
      if (dragging.current) {
        const nx = dragStart.current.px + (e.clientX - dragStart.current.mx)
        const ny = dragStart.current.py + (e.clientY - dragStart.current.my)
        setPos({
          x: Math.max(0, Math.min(nx, window.innerWidth  - size.w)),
          y: Math.max(0, Math.min(ny, window.innerHeight - 40)),
        })
      }
      if (resizing.current) {
        const dw = e.clientX - resStart.current.mx
        const dh = e.clientY - resStart.current.my
        setSize({
          w: Math.max(300, Math.min(resStart.current.w + dw, window.innerWidth  - 40)),
          h: Math.max(280, Math.min(resStart.current.h + dh, window.innerHeight - 80)),
        })
      }
    }
    const onUp = () => { dragging.current = false; resizing.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [size.w]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send ───────────────────────────────────────────────────────────────────
  const send = useCallback(async (question) => {
    const q = question.trim()
    if (!q || isThinking) return
    setInput('')
    setMinimized(false)
    const snapshot = [...history, { role: 'user', text: q }]
    setHistory(snapshot)
    setStreaming('')

    const context = { code, language, filename, terminalOutput, tutorialContent, fileList }
    let full = ''
    await askStream(q, context, history, chunk => { full = chunk; setStreaming(chunk) })
    setStreaming('')
    setHistory(prev => [...prev, { role: 'ai', text: full }])
  }, [askStream, isThinking, history, code, language, filename, terminalOutput, tutorialContent])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [history, streaming])

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }

  // ── Colours & Theme Integration ────────────────────────────────────────────
  // Fallback defaults if `ui` isn't fully provided
  const panelBg  = ui.bg1 || (D ? 'bg-[#08111e]' : 'bg-white')
  const headBg   = ui.bg2 || (D ? 'bg-[#0c1928]' : 'bg-slate-100')
  const border   = ui.border || (D ? 'border-slate-700/60' : 'border-slate-300')
  const txt      = ui.txt1 || (D ? 'text-slate-200' : 'text-slate-800')
  const txt2     = ui.txt2 || (D ? 'text-slate-400' : 'text-slate-500')
  
  const bubbleU  = `${ui.bg2 || (D ? 'bg-slate-800/70' : 'bg-slate-100')} ${txt} shadow-sm border border-transparent`
  
  // Create a custom glowy gradient style for AI bubbles based on accentColor
  const aiBubbleStyle = {
    backgroundColor: `${accentColor}10`, // 10% opacity hex
    borderColor: `${accentColor}40`,     // 25% opacity hex
    color: txt
  }

  return (
    <div
      className={`fixed z-[9999] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.2)] border flex flex-col overflow-hidden ${panelBg} ${border} backdrop-blur-2xl bg-opacity-95 transition-all duration-300 ease-out`}
      style={{ left: pos.x, top: pos.y, width: size.w, height: minimized ? 'auto' : size.h }}
    >
      {/* ── Drag handle / header ── */}
      <div
        className={`shrink-0 flex items-center gap-3 px-4 py-3 cursor-grab select-none ${headBg} border-b ${border}`}
        onMouseDown={onHeaderMouseDown}
      >
        <span className="text-[13px] font-extrabold tracking-tight flex items-center gap-1.5" style={{ color: accentColor }}>
          <Sparkles className="w-4 h-4" /> Ada
        </span>
        <span className={`text-[10px] ${txt2} flex-1 truncate font-medium`}>
          {isDownloading
            ? <span className="text-amber-500 animate-pulse">{downloadProgress || 'Loading model…'}</span>
            : fileList.length
              ? <span title={fileList.map(f => (f.name || f)).join(', ')}>{filename || 'Studio'} · {fileList.length} file{fileList.length !== 1 ? 's' : ''}</span>
              : 'Studio AI · local · private'}
        </span>
        <button
          onClick={() => setMinimized(m => !m)}
          className={`w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${txt2} hover:${txt}`}
          title={minimized ? 'Expand' : 'Minimize'}
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* ── Body (hidden when minimized) ── */}
      {!minimized && (
        <>
          {/* Messages */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${txt}`}>
            {history.length === 0 && !isThinking && !isDownloading && (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg mb-4">
                  <div className={`w-full h-full rounded-full ${panelBg} flex items-center justify-center backdrop-blur-sm`}>
                    <Sparkles className="w-8 h-8 text-transparent bg-clip-text" style={{ stroke: 'url(#adaGradient)', color: accentColor }} />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500" style={{ color: accentColor }}>Hi, I'm Ada.</h3>
                <p className={`text-sm ${txt2} max-w-[250px] leading-relaxed`}>I'm your private AI tutor. I can see your code, terminal, and current lesson.</p>
              </div>
            )}

            {isDownloading && (
              <div className="rounded-2xl px-4 py-3 text-[13px] shadow-sm border border-transparent" style={aiBubbleStyle}>
                <p className="font-bold text-[11px] mb-1.5 flex items-center gap-1" style={{ color: accentColor }}><Sparkles className="w-3 h-3" /> Ada</p>
                <p className="text-amber-500 font-medium animate-pulse">{downloadProgress || 'Downloading AI (~500 MB, first time only)…'}</p>
                <p className={`mt-1.5 text-[10px] ${txt2}`}>Runs entirely in your browser — nothing is sent to any server.</p>
              </div>
            )}

            {history.map((m, i) => (
              <div key={i} className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${m.role === 'user' ? bubbleU : 'border'}`} style={m.role === 'ai' ? aiBubbleStyle : undefined}>
                {m.role === 'ai' && <p className="font-bold text-[11px] mb-1.5 flex items-center gap-1" style={{ color: accentColor }}><Sparkles className="w-3 h-3" /> Ada</p>}
                {m.role === 'ai'
                  ? <AiMessage text={m.text} isDark={D} />
                  : <span className="whitespace-pre-wrap">{m.text}</span>}
              </div>
            ))}

            {streaming && (
              <div className="rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm border" style={aiBubbleStyle}>
                <p className="font-bold text-[11px] mb-1.5 flex items-center gap-1" style={{ color: accentColor }}><Sparkles className="w-3 h-3" /> Ada</p>
                <AiMessage text={streaming} isDark={D} />
                <span className="animate-pulse" style={{ color: accentColor }}>▍</span>
              </div>
            )}

            {isThinking && !streaming && (
              <div className="rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm border" style={aiBubbleStyle}>
                <p className="font-bold text-[11px] mb-1.5 flex items-center gap-1" style={{ color: accentColor }}><Sparkles className="w-3 h-3" /> Ada</p>
                <span className={`animate-pulse ${txt2} font-medium flex items-center gap-2`}>
                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: accentColor, borderTopColor: 'transparent' }} /> Thinking…
                </span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick actions */}
          {history.length < 2 && !isThinking && !isDownloading && (
            <div className={`shrink-0 flex flex-wrap gap-2 px-4 py-3 border-t ${border} ${ui.bg0}`}>
              {QUICK.map(({ label, q }) => (
                <button
                  key={label}
                  onClick={() => send(q)}
                  disabled={isThinking || isDownloading}
                  className={`text-[11px] px-3 py-1.5 rounded-full border shadow-sm font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0`}
                  style={{ borderColor: `${accentColor}50`, color: accentColor, backgroundColor: `${accentColor}05` }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className={`shrink-0 flex items-center gap-3 px-4 py-3 border-t ${border} ${headBg}`}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              disabled={isThinking || isDownloading}
              placeholder="Ask Ada anything…"
              className={`flex-1 bg-transparent outline-none text-[13px] ${txt} placeholder:text-slate-500 font-medium`}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isThinking || isDownloading}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-white shadow-md transition-all duration-300 disabled:opacity-40 hover:scale-105"
              style={{ backgroundColor: accentColor }}
            >
              {isThinking ? <Zap className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4 ml-0.5" />}
            </button>
          </div>

          {/* Resize grip — bottom-right corner */}
          <div
            onMouseDown={onResizeMouseDown}
            className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize flex items-end justify-end pb-1 pr-1 opacity-30 hover:opacity-70 transition-opacity"
            title="Drag to resize"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" className={D ? 'fill-slate-400' : 'fill-slate-500'}>
              <rect x="6" y="0" width="1.5" height="10" rx="0.75"/>
              <rect x="0" y="6" width="10" height="1.5" rx="0.75"/>
            </svg>
          </div>
        </>
      )}
    </div>
  )
}
