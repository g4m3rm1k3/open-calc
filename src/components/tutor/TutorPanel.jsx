// src/components/tutor/TutorPanel.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { PROVIDERS, getProvider, STORAGE_KEY, DEFAULT_SETTINGS } from './tutorProviders.js'

// ─── WebLLM singleton (persists across panel open/close) ─────────────────────
let _engine = null
let _engineModelId = null
let _loadPromise = null

async function loadWebLLMEngine(modelId, onProgress) {
  if (_engine && _engineModelId === modelId) return _engine
  // Different model selected — discard old engine
  _engine = null
  _engineModelId = null
  if (_loadPromise) {
    // Cancel in-flight load by letting it resolve then ignoring
    _loadPromise = null
  }
  const promise = (async () => {
    const { CreateMLCEngine } = await import(
      /* @vite-ignore */ 'https://esm.run/@mlc-ai/web-llm'
    )
    const engine = await CreateMLCEngine(modelId, {
      initProgressCallback: (r) => onProgress(Math.round(r.progress * 100)),
    })
    _engine = engine
    _engineModelId = modelId
    _loadPromise = null
    return engine
  })()
  _loadPromise = promise
  return promise
}

function hasWebGPU() {
  return typeof navigator !== 'undefined' && 'gpu' in navigator
}

// ─── Streaming parsers ────────────────────────────────────────────────────────
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
        try { yield JSON.parse(d) } catch { /* skip malformed */ }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

async function buildApiError(res, providerLabel) {
  let msg = `${providerLabel} error (${res.status})`
  try {
    const b = await res.json()
    msg = b.error?.message ?? b.message ?? msg
  } catch { /* use default */ }
  if (res.status === 401 || res.status === 403)
    msg = `Invalid API key for ${providerLabel}. Open settings to fix it.`
  else if (res.status === 429)
    msg = `Rate limit reached on ${providerLabel}. Wait a moment and try again.`
  return new Error(msg)
}

// ─── Provider callers ─────────────────────────────────────────────────────────
async function* callOpenAICompat(endpoint, key, model, sysPrompt, msgs) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
      messages: [{ role: 'system', content: sysPrompt }, ...msgs],
    }),
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
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      stream: true,
      max_tokens: 1024,
      system: sysPrompt,
      messages: msgs.map((m) => ({ role: m.role, content: m.content })),
    }),
  })
  if (!res.ok) throw await buildApiError(res, 'Anthropic')
  for await (const chunk of parseSSE(res)) {
    if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta')
      yield chunk.delta.text
  }
}

async function* callGoogle(key, model, sysPrompt, msgs) {
  // Google Gemini — non-streaming for reliability (streams as one chunk on free tier anyway)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
  const contents = msgs.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
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
    if (!_engine) throw new Error('Model not loaded yet. Try again in a moment.')
    const stream = await _engine.chat.completions.create({
      messages: [{ role: 'system', content: sysPrompt }, ...msgs],
      stream: true,
      temperature: 0.7,
      max_tokens: 512,
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
  if (!lesson) return 'You are a helpful calculus tutor. Be concise and clear.'

  const lines = [
    `You are an expert calculus tutor. The student is studying: "${lesson.title}"`,
    lesson.subtitle ? `Subtopic: ${lesson.subtitle}` : '',
    '',
    'Key ideas from this lesson:',
  ]
  const prose = lesson.intuition?.prose ?? []
  prose.slice(0, 2).forEach((p) => {
    const clean = p.replace(/^\*\*[^*]+\*\*:?\s*/, '').slice(0, 350)
    lines.push(`• ${clean}`)
  })
  const ex = lesson.workedExamples?.[0]
  if (ex) {
    const prob = ex.problem.replace(/\\\(|\\\)|\\\[|\\\]/g, '').slice(0, 250)
    lines.push('', `Example from the lesson: "${prob}"`)
  }
  lines.push(
    '',
    'Respond in 2–4 sentences unless a full worked example is requested.',
    'Use plain text math notation (e.g. f\'(x) = 2x, not LaTeX commands).',
    'Offer hints before full solutions. Stay focused on this topic.',
  )
  return lines.filter(Boolean).join('\n')
}

// ─── Settings persistence ─────────────────────────────────────────────────────
function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}
function persistSettings(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* readonly env */ }
}

// ─── SettingsView sub-component ───────────────────────────────────────────────
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
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex-1">
              {p.label}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              p.badge === 'Free'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                : p.badge === 'Free tier'
                ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {p.badge}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{p.description}</p>
        </button>
      ))}

      {/* Model select */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1 mb-2">
          Model
        </p>
        <select
          value={settings.model}
          onChange={(e) => onChange({ model: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {provider.models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}{m.note ? ` — ${m.note}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* API key */}
      {provider.requiresKey && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              API Key
            </p>
            {provider.keyHref && (
              <a
                href={provider.keyHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
              >
                Get a key ↗
              </a>
            )}
          </div>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={settings.keys?.[settings.provider] ?? ''}
              onChange={(e) =>
                onChange({ keys: { ...settings.keys, [settings.provider]: e.target.value } })
              }
              placeholder={provider.keyPlaceholder}
              autoComplete="off"
              className="w-full px-3 py-2 pr-14 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showKey ? 'hide' : 'show'}
            </button>
          </div>
          <div className="mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              🔒 Your key is stored only in <strong>this browser's localStorage</strong>. It is
              never sent to any server except the AI provider you choose.
            </p>
          </div>
        </div>
      )}

      {settings.provider === 'webllm' && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
            <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
              🔒 <strong>Fully private.</strong> The selected model runs entirely on your device.
              No data is ever sent anywhere. Requires a WebGPU-capable browser (Chrome or Edge on
              desktop).
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
  const [view, setView] = useState('chat') // 'chat' | 'settings'
  const [settings, setSettings] = useState(loadSettings)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('idle')
  // idle | loading-model | ready | thinking | error | unsupported | needs-key
  const [loadProgress, setLoadProgress] = useState(0)
  const [streamContent, setStreamContent] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const accRef = useRef('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const provider = getProvider(settings.provider)
  const hasKey = !provider.requiresKey || !!(settings.keys?.[settings.provider])
  const isBusy = status === 'thinking' || status === 'loading-model'
  const canSend = !!input.trim() && !isBusy && hasKey && status !== 'unsupported'

  // Persist settings on every change
  useEffect(() => { persistSettings(settings) }, [settings])

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamContent])

  // Focus input when chat view opens
  useEffect(() => {
    if (open && view === 'chat' && status === 'ready') {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, view, status])

  // Re-evaluate status when provider / key changes
  useEffect(() => {
    if (settings.provider !== 'webllm') {
      setStatus(hasKey ? 'ready' : 'needs-key')
      return
    }
    if (!hasWebGPU()) { setStatus('unsupported'); return }
    // If model changed while engine was loaded with a different model, reset
    if (_engineModelId && _engineModelId !== settings.model) {
      _engine = null
      _engineModelId = null
      setStatus('idle')
    }
  }, [settings.provider, settings.model, hasKey])

  // Kick off WebLLM loading when panel opens (or when settings change to webllm)
  useEffect(() => {
    if (!open || settings.provider !== 'webllm') return
    if (['ready', 'loading-model', 'unsupported'].includes(status)) return
    if (!hasWebGPU()) { setStatus('unsupported'); return }

    setStatus('loading-model')
    setLoadProgress(0)
    loadWebLLMEngine(settings.model, setLoadProgress)
      .then(() => setStatus('ready'))
      .catch((e) => {
        setStatus('error')
        setErrorMsg(e?.message ?? 'Failed to load model')
      })
  }, [open, settings.provider, settings.model])

  const updateSettings = useCallback((updates) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  // Auto-grow textarea
  function adjustHeight() {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || isBusy || !hasKey) return

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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-4 right-4 z-[9998] flex flex-col items-end gap-2 pointer-events-none">
      {/* Panel */}
      {open && (
        <div
          className="pointer-events-auto flex flex-col rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200"
          style={{
            width: 'min(380px, calc(100vw - 2rem))',
            height: 'min(560px, calc(100svh - 5rem))',
          }}
        >
          {/* ── Header ── */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <span className="text-base select-none">✨</span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">AI Tutor</span>
              <span className="ml-2 text-[11px] text-slate-400 dark:text-slate-500">
                {provider.label}
              </span>
            </div>
            <button
              onClick={() => setView((v) => (v === 'settings' ? 'chat' : 'settings'))}
              className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                view === 'settings'
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title={view === 'settings' ? 'Back to chat' : 'Settings'}
            >
              {view === 'settings' ? (
                // Back arrow when in settings
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M5 12l7 7M5 12l7-7" />
                </svg>
              ) : (
                <IconSettings />
              )}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
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
                    <span className="text-xs text-sky-700 dark:text-sky-300">
                      Downloading model… {loadProgress}%
                    </span>
                  </div>
                  <div className="h-1 bg-sky-100 dark:bg-sky-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 transition-all duration-300"
                      style={{ width: `${loadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {status === 'unsupported' && (
                <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800 shrink-0">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    WebGPU not available in this browser. Use Chrome or Edge on desktop, or{' '}
                    <button onClick={() => setView('settings')} className="underline font-medium">
                      add an API key
                    </button>{' '}
                    for a cloud model.
                  </p>
                </div>
              )}
              {status === 'needs-key' && (
                <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800 shrink-0">
                  <button
                    onClick={() => setView('settings')}
                    className="text-xs text-amber-700 dark:text-amber-300 hover:underline"
                  >
                    Add an API key in settings to start chatting →
                  </button>
                </div>
              )}
              {status === 'error' && errorMsg && (
                <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800 shrink-0 flex items-start gap-2">
                  <p className="text-xs text-red-700 dark:text-red-300 flex-1">{errorMsg}</p>
                  <button
                    onClick={() => { setStatus('ready'); setErrorMsg('') }}
                    className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300 shrink-0"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {messages.length === 0 && !streamContent && (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-6">
                    <span className="text-3xl select-none">📐</span>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Ask anything about{' '}
                      <span className="text-brand-600 dark:text-brand-400">
                        {lesson?.title ?? 'this lesson'}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[220px]">
                      "Walk me through step by step" · "Give me a harder example" · "Why does this work?"
                    </p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[88%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        msg.role === 'user'
                          ? 'bg-brand-600 text-white rounded-2xl rounded-br-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Streaming response */}
                {streamContent && (
                  <div className="flex justify-start">
                    <div className="max-w-[88%] px-3 py-2 rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {streamContent}
                      <span className="inline-block w-0.5 h-3.5 ml-0.5 bg-slate-400 dark:bg-slate-500 animate-pulse rounded-full align-middle" />
                    </div>
                  </div>
                )}

                {/* Thinking dots (before first token arrives) */}
                {status === 'thinking' && !streamContent && (
                  <div className="flex justify-start">
                    <div className="px-3 py-3 rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-slate-800">
                      <span className="flex gap-1 items-center">
                        {[0, 150, 300].map((delay) => (
                          <span
                            key={delay}
                            className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input row */}
              <div className="px-3 py-2.5 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => { setInput(e.target.value); adjustHeight() }}
                    onKeyDown={handleKeyDown}
                    disabled={isBusy || !hasKey || status === 'unsupported'}
                    placeholder={
                      status === 'loading-model'
                        ? 'Loading model…'
                        : status === 'unsupported' || !hasKey
                        ? 'Add an API key in settings'
                        : 'Ask a question… (Enter to send)'
                    }
                    className="flex-1 resize-none overflow-hidden px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent max-h-[120px] leading-relaxed"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!canSend}
                    className="px-3 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 self-end"
                  >
                    {status === 'thinking' ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <IconSend />
                    )}
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
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`pointer-events-auto w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          open
            ? 'bg-slate-600 dark:bg-slate-700 text-white'
            : 'bg-brand-600 text-white hover:bg-brand-700 hover:scale-105'
        }`}
        title={open ? 'Close tutor' : 'AI Tutor'}
      >
        {open ? <IconClose /> : <IconChat />}
      </button>
    </div>
  )
}
