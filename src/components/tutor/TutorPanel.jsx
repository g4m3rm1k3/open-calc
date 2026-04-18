// src/components/tutor/TutorPanel.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import katex from 'katex'
import { PROVIDERS, getProvider, STORAGE_KEY, DEFAULT_SETTINGS } from './tutorProviders.js'

// ─── WebLLM singleton ────────────────────────────────────────────────────────
let _engine = null
let _engineModelId = null

async function loadWebLLMEngine(modelId, onProgress) {
  if (_engine && _engineModelId === modelId) return _engine
  _engine = null
  _engineModelId = null
  const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
  const engine = await CreateMLCEngine(modelId, {
    initProgressCallback: (r) => onProgress(Math.round(r.progress * 100)),
  })
  _engine = engine
  _engineModelId = modelId
  return engine
}

function hasWebGPU() {
  return typeof navigator !== 'undefined' && 'gpu' in navigator
}

// ─── SSE / API callers ───────────────────────────────────────────────────────
async function* parseSSE(response) {
  const reader = response.body.getReader()
  const dec = new TextDecoder()
  let buf = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += dec.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const d = line.slice(6).trim()
        if (d === '[DONE]') return
        try { yield JSON.parse(d) } catch { /* skip */ }
      }
    }
  } finally { reader.releaseLock() }
}

async function buildApiError(res, label) {
  let msg = `${label} error (${res.status})`
  try { const b = await res.json(); msg = b.error?.message ?? b.message ?? msg } catch { /* */ }
  if (res.status === 401 || res.status === 403) msg = `Invalid API key for ${label}. Open settings to fix it.`
  else if (res.status === 429) msg = `Rate limit reached on ${label}. Wait a moment and try again.`
  return new Error(msg)
}

async function* callOpenAICompat(endpoint, key, model, sysPrompt, msgs) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, stream: true, max_tokens: 1024, temperature: 0.7,
      messages: [{ role: 'system', content: sysPrompt }, ...msgs] }),
  })
  if (!res.ok) throw await buildApiError(res, 'API')
  for await (const chunk of parseSSE(res)) {
    const t = chunk.choices?.[0]?.delta?.content
    if (t) yield t
  }
}

async function* callAnthropic(key, model, sysPrompt, msgs) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', 'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model, stream: true, max_tokens: 1024, system: sysPrompt,
      messages: msgs.map((m) => ({ role: m.role, content: m.content })) }),
  })
  if (!res.ok) throw await buildApiError(res, 'Anthropic')
  for await (const chunk of parseSSE(res)) {
    if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta')
      yield chunk.delta.text
  }
}

async function* callGoogle(key, model, sysPrompt, msgs) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: msgs.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      systemInstruction: { parts: [{ text: sysPrompt }] },
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    }),
  })
  if (!res.ok) throw await buildApiError(res, 'Gemini')
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (text) yield text
}

async function* callProvider(settings, sysPrompt, msgs) {
  const p = getProvider(settings.provider)
  if (settings.provider === 'webllm') {
    if (!_engine) throw new Error('Model not loaded yet.')
    const stream = await _engine.chat.completions.create({
      messages: [{ role: 'system', content: sysPrompt }, ...msgs],
      stream: true, temperature: 0.7, max_tokens: 512,
    })
    for await (const chunk of stream) {
      const t = chunk.choices?.[0]?.delta?.content
      if (t) yield t
    }
    return
  }
  const key = settings.keys?.[settings.provider]
  if (!key) throw new Error('No API key configured. Open settings (⚙) to add one.')
  if (p.protocol === 'openai') yield* callOpenAICompat(p.endpoint, key, settings.model, sysPrompt, msgs)
  else if (p.protocol === 'anthropic') yield* callAnthropic(key, settings.model, sysPrompt, msgs)
  else if (p.protocol === 'google') yield* callGoogle(key, settings.model, sysPrompt, msgs)
}

// ─── System prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt(lesson) {
  const mathFormat = [
    'Format math using $...$ for inline and $$...$$ for display blocks.',
    'Use **bold** for key terms, `code` for function names, numbered lists for steps.',
    'Keep replies short (2–4 sentences) unless a full worked example is asked for.',
    'Offer hints before giving full solutions.',
  ].join(' ')

  if (!lesson) {
    return `You are a friendly math tutor. Respond conversationally to greetings and small talk. When math questions come up, be helpful and precise. ${mathFormat}`
  }

  const prose = lesson.intuition?.prose ?? []
  const contextLines = prose.slice(0, 2).map((p) =>
    `• ${p.replace(/^\*\*[^*]+\*\*:?\s*/, '').slice(0, 300)}`
  )
  const ex = lesson.workedExamples?.[0]
  const exLine = ex
    ? `Example problem on this page: "${ex.problem.replace(/\\\(|\\\)|\\\[|\\\]/g, '').slice(0, 200)}"`
    : ''

  return [
    `You are a friendly and knowledgeable math tutor.`,
    `The student is currently on the "${lesson.title}" lesson${lesson.subtitle ? ` (${lesson.subtitle})` : ''}.`,
    `Use this as background context — only bring it up when the student asks about it or it is directly relevant.`,
    `Don't introduce yourself or summarise the topic unprompted. Just respond naturally to whatever the student says.`,
    ``,
    `Background context (use only when relevant):`,
    ...contextLines,
    exLine,
    ``,
    mathFormat,
  ].filter(Boolean).join('\n')
}

// ─── Markdown + LaTeX message renderer ───────────────────────────────────────
function renderKatex(expr, display) {
  try {
    return katex.renderToString(expr.trim(), {
      displayMode: display, throwOnError: false, trust: false, strict: false,
    })
  } catch {
    return `<span style="color:#ef4444">[math error]</span>`
  }
}

// Parse AI message text into segments: plain text, inline math, display math, bold, inline code
// Handles both $...$ / $$...$$ and \(...\) / \[...\] delimiter styles
function parseMessage(text) {
  const segments = []
  let i = 0

  while (i < text.length) {
    // Display math \[...\]
    if (text[i] === '\\' && text[i + 1] === '[') {
      const end = text.indexOf('\\]', i + 2)
      if (end !== -1) {
        segments.push({ type: 'display-math', content: text.slice(i + 2, end) })
        i = end + 2
        continue
      }
    }
    // Inline math \(...\)
    if (text[i] === '\\' && text[i + 1] === '(') {
      const end = text.indexOf('\\)', i + 2)
      if (end !== -1) {
        segments.push({ type: 'inline-math', content: text.slice(i + 2, end) })
        i = end + 2
        continue
      }
    }
    // Display math $$...$$
    if (text[i] === '$' && text[i + 1] === '$') {
      const end = text.indexOf('$$', i + 2)
      if (end !== -1) {
        segments.push({ type: 'display-math', content: text.slice(i + 2, end) })
        i = end + 2
        continue
      }
    }
    // Inline math $...$ (must not span a newline)
    if (text[i] === '$' && text[i + 1] !== '$') {
      const rest = text.slice(i + 1)
      const nl = rest.indexOf('\n')
      const closing = rest.indexOf('$')
      if (closing > 0 && (nl === -1 || closing < nl)) {
        segments.push({ type: 'inline-math', content: rest.slice(0, closing) })
        i = i + 1 + closing + 1
        continue
      }
    }
    // Inline code `...`
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1)
      if (end !== -1) {
        segments.push({ type: 'code', content: text.slice(i + 1, end) })
        i = end + 1
        continue
      }
    }
    // Bold **...**
    if (text[i] === '*' && text[i + 1] === '*') {
      const end = text.indexOf('**', i + 2)
      if (end !== -1) {
        segments.push({ type: 'bold', content: text.slice(i + 2, end) })
        i = end + 2
        continue
      }
    }
    // Accumulate plain text
    const last = segments[segments.length - 1]
    if (last?.type === 'text') {
      last.content += text[i]
    } else {
      segments.push({ type: 'text', content: text[i] })
    }
    i++
  }
  return segments
}

// Split into lines/paragraphs and render segments within each
function TutorMessage({ content, isUser }) {
  const rendered = useMemo(() => {
    if (isUser) return null
    // Split on blank lines into paragraphs; split on \n within for line breaks
    const paragraphs = content.split(/\n{2,}/)
    return paragraphs.map((para, pi) => {
      // Numbered list item
      const isNumbered = /^\d+\.\s/.test(para.trim())
      // Bullet list item
      const isBullet = /^[-*]\s/.test(para.trim())

      const lines = para.split('\n')
      return (
        <p key={pi} className={`${pi > 0 ? 'mt-2' : ''} ${isNumbered || isBullet ? 'pl-3' : ''}`}>
          {lines.map((line, li) => {
            const segs = parseMessage(line)
            return (
              <span key={li}>
                {li > 0 && <br />}
                {segs.map((seg, si) => {
                  if (seg.type === 'display-math') {
                    return (
                      <span
                        key={si}
                        className="block my-2 overflow-x-auto text-center"
                        dangerouslySetInnerHTML={{ __html: renderKatex(seg.content, true) }}
                      />
                    )
                  }
                  if (seg.type === 'inline-math') {
                    return (
                      <span
                        key={si}
                        dangerouslySetInnerHTML={{ __html: renderKatex(seg.content, false) }}
                      />
                    )
                  }
                  if (seg.type === 'code') {
                    return (
                      <code key={si} className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[12px] font-mono text-slate-700 dark:text-slate-300 mx-0.5">
                        {seg.content}
                      </code>
                    )
                  }
                  if (seg.type === 'bold') {
                    return <strong key={si} className="font-semibold">{seg.content}</strong>
                  }
                  return <span key={si}>{seg.content}</span>
                })}
              </span>
            )
          })}
        </p>
      )
    })
  }, [content, isUser])

  if (isUser) {
    return <span>{content}</span>
  }
  return <div>{rendered}</div>
}

// ─── Settings persistence ─────────────────────────────────────────────────────
function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS }
  } catch { return { ...DEFAULT_SETTINGS } }
}
function persistSettings(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* */ }
}

// ─── Drag & Resize hook ───────────────────────────────────────────────────────
const DEFAULT_SIZE = { w: 380, h: 560 }
const MIN_SIZE = { w: 280, h: 360 }

function useDragResize(initialPos) {
  const [pos, setPos] = useState(initialPos) // { x, y } from bottom-right
  const [size, setSize] = useState(DEFAULT_SIZE)
  const dragRef = useRef(null)   // { startX, startY, startPosX, startPosY }
  const resizeRef = useRef(null) // { startX, startY, startW, startH }

  const onDragStart = useCallback((e) => {
    if (e.button !== 0) return
    e.preventDefault()
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: pos.x, startPosY: pos.y }

    const onMove = (me) => {
      if (!dragRef.current) return
      const dx = me.clientX - dragRef.current.startX
      const dy = me.clientY - dragRef.current.startY
      setPos({
        x: Math.max(0, dragRef.current.startPosX - dx),
        y: Math.max(0, dragRef.current.startPosY - dy),
      })
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [pos])

  const onResizeStart = useCallback((e) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    resizeRef.current = { startX: e.clientX, startY: e.clientY, startW: size.w, startH: size.h }

    const onMove = (me) => {
      if (!resizeRef.current) return
      const dx = me.clientX - resizeRef.current.startX
      const dy = me.clientY - resizeRef.current.startY
      setSize({
        w: Math.max(MIN_SIZE.w, resizeRef.current.startW + dx),
        h: Math.max(MIN_SIZE.h, resizeRef.current.startH + dy),
      })
    }
    const onUp = () => {
      resizeRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [size])

  return { pos, size, onDragStart, onResizeStart }
}

// ─── SettingsView ─────────────────────────────────────────────────────────────
function SettingsView({ settings, onChange }) {
  const [showKey, setShowKey] = useState(false)
  const provider = getProvider(settings.provider)

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1 mb-3">
        AI Provider
      </p>

      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange({ provider: p.id, model: p.models[0].id })}
          className={`w-full text-left p-3 rounded-xl border transition-colors ${
            settings.provider === p.id
              ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-600'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex-1">{p.label}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              p.badge === 'Free' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
              : p.badge === 'Free tier' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>{p.badge}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{p.description}</p>
        </button>
      ))}

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1 mb-2">Model</p>
        <select
          value={settings.model}
          onChange={(e) => onChange({ model: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {provider.models.map((m) => (
            <option key={m.id} value={m.id}>{m.label}{m.note ? ` — ${m.note}` : ''}</option>
          ))}
        </select>
      </div>

      {provider.requiresKey && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">API Key</p>
            {provider.keyHref && (
              <a href={provider.keyHref} target="_blank" rel="noopener noreferrer"
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                Get a key ↗
              </a>
            )}
          </div>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={settings.keys?.[settings.provider] ?? ''}
              onChange={(e) => onChange({ keys: { ...settings.keys, [settings.provider]: e.target.value } })}
              placeholder={provider.keyPlaceholder}
              autoComplete="off"
              className="w-full px-3 py-2 pr-14 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button type="button" onClick={() => setShowKey((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              {showKey ? 'hide' : 'show'}
            </button>
          </div>
          <div className="mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              🔒 Your key is stored only in <strong>this browser's localStorage</strong>. It is never sent to any server except the AI provider you choose.
            </p>
          </div>
        </div>
      )}

      {settings.provider === 'webllm' && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
            <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
              🔒 <strong>Fully private.</strong> Runs entirely on your device. Requires WebGPU (Chrome/Edge desktop).
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
)
const IconClose = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
)
const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
)
const IconChat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-2 10H6V10h12v2zm0-3H6V7h12v2z" />
  </svg>
)

// ─── TutorPanel ───────────────────────────────────────────────────────────────
export default function TutorPanel({ lesson }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('chat')
  const [settings, setSettings] = useState(loadSettings)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('idle')
  const [loadProgress, setLoadProgress] = useState(0)
  const [streamContent, setStreamContent] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const accRef = useRef('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const provider = getProvider(settings.provider)
  const hasKey = !provider.requiresKey || !!(settings.keys?.[settings.provider])
  const canSend = !!input.trim() && status === 'ready'

  // Drag & resize — initial position is bottom-right (offset from corner)
  const { pos, size, onDragStart, onResizeStart } = useDragResize({ x: 16, y: 16 })

  useEffect(() => { persistSettings(settings) }, [settings])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamContent])

  useEffect(() => {
    if (open && view === 'chat' && status !== 'unsupported' && hasKey) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, view])

  // Unified effect: handle provider/model/key changes and trigger WebLLM loading.
  // Reads _engine/_engineModelId directly (module singletons) to avoid stale-state
  // race conditions between two separate effects.
  useEffect(() => {
    if (settings.provider !== 'webllm') {
      // Clear any stale engine reference when switching away from WebLLM
      setStatus(hasKey ? 'ready' : 'needs-key')
      return
    }
    if (!hasWebGPU()) { setStatus('unsupported'); return }

    // Already loaded with the right model — just mark ready
    if (_engine && _engineModelId === settings.model) {
      setStatus('ready')
      return
    }

    // Different model or no engine yet — discard old engine and load new one
    _engine = null
    _engineModelId = null

    if (!open) {
      // Panel is closed; reset to idle so load kicks off when it opens
      setStatus('idle')
      return
    }

    setStatus('loading-model')
    setLoadProgress(0)
    loadWebLLMEngine(settings.model, setLoadProgress)
      .then(() => setStatus('ready'))
      .catch((e) => { setStatus('error'); setErrorMsg(e?.message ?? 'Failed to load model') })
  }, [open, settings.provider, settings.model, hasKey])

  const updateSettings = useCallback((updates) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  function adjustHeight() {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || status !== 'ready') return
    const userMsg = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    setStatus('thinking')
    setErrorMsg('')
    accRef.current = ''
    setStreamContent('')
    try {
      const gen = callProvider(settings, buildSystemPrompt(lesson), history)
      for await (const token of gen) {
        accRef.current += token
        setStreamContent(accRef.current)
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: accRef.current }])
      setStreamContent('')
      setStatus('ready')
    } catch (e) {
      setErrorMsg(e?.message ?? 'Something went wrong. Try again.')
      setStatus('error')
      setStreamContent('')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  // Clamp panel within viewport
  const panelStyle = {
    position: 'fixed',
    right: pos.x,
    bottom: pos.y,
    width: Math.min(size.w, window.innerWidth - 16),
    height: Math.min(size.h, window.innerHeight - pos.y - 64),
    zIndex: 9998,
  }

  return (
    <>
      {/* Panel */}
      {open && (
        <div
          style={panelStyle}
          className="flex flex-col rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden select-none"
        >
          {/* ── Drag handle / header ── */}
          <div
            onMouseDown={onDragStart}
            className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0 cursor-grab active:cursor-grabbing"
          >
            {/* Grip dots */}
            <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor" className="text-slate-300 dark:text-slate-600 shrink-0">
              {[0, 6].map(cx => [2, 8, 14].map(cy => (
                <circle key={`${cx}-${cy}`} cx={cx + 3} cy={cy + 3} r="1.5" />
              )))}
            </svg>
            <span className="text-base select-none">✨</span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">AI Tutor</span>
              <span className="ml-2 text-[11px] text-slate-400 dark:text-slate-500">{provider.label}</span>
            </div>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setView((v) => v === 'settings' ? 'chat' : 'settings')}
              className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                view === 'settings' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
              }`}
              title={view === 'settings' ? 'Back to chat' : 'Settings'}
            >
              {view === 'settings' ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M5 12l7 7M5 12l7-7" />
                </svg>
              ) : <IconSettings />}
            </button>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors"
            >
              <IconClose />
            </button>
          </div>

          {/* ── Content ── */}
          {view === 'settings' ? (
            <SettingsView settings={settings} onChange={updateSettings} />
          ) : (
            <>
              {/* Status banners */}
              {status === 'loading-model' && (
                <div className="px-3 py-2 bg-sky-50 dark:bg-sky-900/20 border-b border-sky-100 dark:border-sky-800 shrink-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span className="text-xs text-sky-700 dark:text-sky-300">Downloading model… {loadProgress}%</span>
                  </div>
                  <div className="h-1 bg-sky-100 dark:bg-sky-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${loadProgress}%` }} />
                  </div>
                </div>
              )}
              {status === 'unsupported' && (
                <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800 shrink-0">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    WebGPU not available.{' '}
                    <button onClick={() => setView('settings')} className="underline font-medium">Add an API key</button>{' '}
                    for a cloud model.
                  </p>
                </div>
              )}
              {status === 'needs-key' && (
                <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800 shrink-0">
                  <button onClick={() => setView('settings')} className="text-xs text-amber-700 dark:text-amber-300 hover:underline">
                    Add an API key in settings to start chatting →
                  </button>
                </div>
              )}
              {status === 'error' && errorMsg && (
                <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800 shrink-0 flex items-start gap-2">
                  <p className="text-xs text-red-700 dark:text-red-300 flex-1">{errorMsg}</p>
                  <button onClick={() => { setStatus(hasKey ? 'ready' : 'needs-key'); setErrorMsg('') }}
                    className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300 shrink-0">✕</button>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {messages.length === 0 && !streamContent && (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-6">
                    <span className="text-3xl select-none">📐</span>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Ask anything about{' '}
                      <span className="text-brand-600 dark:text-brand-400">{lesson?.title ?? 'this lesson'}</span>
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[220px]">
                      "Walk me through step by step" · "Give me a harder example" · "Why does this work?"
                    </p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[88%] px-3 py-2 text-sm leading-relaxed break-words ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-2xl rounded-br-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-sm'
                    }`}>
                      <TutorMessage content={msg.content} isUser={msg.role === 'user'} />
                    </div>
                  </div>
                ))}

                {/* Streaming */}
                {streamContent && (
                  <div className="flex justify-start">
                    <div className="max-w-[88%] px-3 py-2 rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm leading-relaxed break-words">
                      <TutorMessage content={streamContent} isUser={false} />
                      <span className="inline-block w-0.5 h-3.5 ml-0.5 bg-slate-400 dark:bg-slate-500 animate-pulse rounded-full align-middle" />
                    </div>
                  </div>
                )}

                {/* Thinking dots */}
                {status === 'thinking' && !streamContent && (
                  <div className="flex justify-start">
                    <div className="px-3 py-3 rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-slate-800">
                      <span className="flex gap-1 items-center">
                        {[0, 150, 300].map((delay) => (
                          <span key={delay} className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
                            style={{ animationDelay: `${delay}ms` }} />
                        ))}
                      </span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-3 py-2.5 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => { setInput(e.target.value); adjustHeight() }}
                    onKeyDown={handleKeyDown}
                    disabled={status === 'thinking' || status === 'unsupported' || !hasKey}
                    placeholder={
                      status === 'loading-model' ? `Model loading ${loadProgress}% — type your question now`
                      : status === 'unsupported' || !hasKey ? 'Add an API key in settings ↑'
                      : status === 'error' ? 'Fix the error above, then try again'
                      : 'Ask a question… (Enter to send)'
                    }
                    className="flex-1 resize-none overflow-hidden px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent max-h-[120px] leading-relaxed"
                  />
                  <button onClick={sendMessage} disabled={!canSend}
                    className="px-3 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 self-end">
                    {status === 'thinking'
                      ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <IconSend />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1.5 text-center">
                  {settings.provider === 'webllm'
                    ? '🔒 Running locally · no data sent anywhere'
                    : `Powered by ${provider.label} · key stored locally only`}
                </p>
              </div>
            </>
          )}

          {/* ── Resize handle ── */}
          <div
            onMouseDown={onResizeStart}
            className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-end justify-end p-1"
            title="Resize"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="text-slate-300 dark:text-slate-600">
              <path d="M10 0L0 10h2L10 2V0zM10 4L4 10h2l4-4V4zM10 8L8 10h2V8z" />
            </svg>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <div className="fixed z-[9997]" style={{ right: pos.x, bottom: pos.y > 20 ? pos.y - 56 : 16 }}>
        <button
          onClick={() => setOpen((o) => !o)}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
            open ? 'bg-slate-600 dark:bg-slate-700 text-white' : 'bg-brand-600 text-white hover:bg-brand-700 hover:scale-105'
          }`}
          title={open ? 'Close tutor' : 'AI Tutor'}
        >
          {open ? <IconClose /> : <IconChat />}
        </button>
      </div>
    </>
  )
}
