import { useState, useRef, useEffect } from 'react'
import type { LessonStep, UiTheme } from './types'
import type { ParsedLesson } from './types'
import { callProvider, loadSettings } from '../../components/tutor/TutorPanel.jsx'

interface Props {
  lesson: ParsedLesson
  step: LessonStep
  ui: UiTheme
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function buildSystemPrompt(lesson: ParsedLesson, step: LessonStep): string {
  const isChallenge = !!step.challenge
  const lines = [
    `You are Delta, a concise coding tutor embedded in an interactive lesson on "${lesson.title}".`,
    `The learner is on step: "${step.title || 'Introduction'}".`,
    ``,
    `Your rules:`,
    `- Be short. One or two paragraphs max unless the learner asks for more.`,
    `- For challenge steps: give hints and direction, never write the solution. If they are stuck, ask a leading question.`,
    `- For concept steps: explain, connect to related ideas, give an alternative analogy if asked.`,
    `- Use Python examples only when they directly answer the question.`,
    `- If the learner shares code, read it and respond to what they actually wrote — do not hallucinate different code.`,
    ``,
    `Current step prose (what the learner just read):`,
    step.prose.slice(0, 1200),
  ]

  if (isChallenge && step.challenge) {
    lines.push(``, `Challenge starter code:`, '```python', step.challenge.code, '```')
    if (step.tests) {
      lines.push(``, `Test assertions:`, '```python', step.tests, '```')
    }
    lines.push(``, `Do NOT reveal the solution. Guide with questions and partial hints.`)
  }

  if (step.lenses?.cs) lines.push(``, `CS concept behind this step: ${step.lenses.cs}`)
  if (step.lenses?.se) lines.push(``, `SE principle behind this step: ${step.lenses.se}`)

  return lines.join('\n')
}

export default function DeltaTutor({ lesson, step, ui }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'thinking' | 'error'>('idle')
  const [streaming, setStreaming] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const messagesRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Reset conversation when step changes
  useEffect(() => {
    setMessages([])
    setInput('')
    setStatus('idle')
    setStreaming('')
    setErrorMsg('')
  }, [step.id])

  // Scroll the message list's own scrollTop directly rather than
  // bottomRef.scrollIntoView() — scrollIntoView walks up the DOM for the
  // nearest scrollable ancestor, and when this panel is embedded inside a
  // floating window, that search can escape the window entirely and
  // scroll the whole page instead of just this list.
  useEffect(() => {
    const el = messagesRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, streaming])

  async function send() {
    const text = input.trim()
    if (!text || status === 'thinking') return
    const userMsg: Message = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setStatus('thinking')
    setErrorMsg('')
    let acc = ''
    setStreaming('')
    try {
      const settings = loadSettings()
      const sysPrompt = buildSystemPrompt(lesson, step)
      const gen = callProvider(settings, history, sysPrompt)
      for await (const token of gen) {
        acc += token
        setStreaming(acc)
      }
      setMessages(prev => [...prev, { role: 'assistant', content: acc }])
      setStreaming('')
      setStatus('idle')
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Something went wrong.')
      setStatus('error')
      setStreaming('')
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const isChallenge = !!step.challenge

  return (
    <div className="flex flex-col h-full">

      {/* Context banner */}
      <div className={`px-4 py-2 border-b ${ui.border} ${ui.bg1} shrink-0`}>
        <p className={`text-[11px] ${ui.txt2}`}>
          <span className="font-semibold">Δ Delta</span>
          {' · '}
          {isChallenge ? 'hints only — no solutions' : 'ask anything about this step'}
        </p>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {messages.length === 0 && !streaming && (
          <div className={`text-xs ${ui.txt2} text-center pt-6`}>
            {isChallenge
              ? 'Stuck on the challenge? Describe what you\'ve tried and I\'ll guide you.'
              : 'Ask me anything about this step — a different explanation, an analogy, or how it connects to real code.'}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? `bg-brand-500 text-white`
                  : `${ui.bg1} ${ui.txt1} border ${ui.border}`
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {streaming && (
          <div className="flex justify-start">
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${ui.bg1} ${ui.txt1} border ${ui.border}`}>
              {streaming}
              <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-brand-400 animate-pulse rounded-sm" />
            </div>
          </div>
        )}
        {status === 'thinking' && !streaming && (
          <div className={`text-xs ${ui.txt2} text-center`}>Delta is thinking…</div>
        )}
        {errorMsg && (
          <div className="text-xs text-red-400 text-center px-2">{errorMsg}</div>
        )}
      </div>

      {/* Input */}
      <div className={`px-3 py-2 border-t ${ui.border} ${ui.bg1} shrink-0`}>
        <div className={`flex items-end gap-2 rounded-xl border ${ui.border} ${ui.bg0} px-3 py-2`}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={e => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
            }}
            onKeyDown={handleKey}
            placeholder="Ask Delta…"
            disabled={status === 'thinking'}
            className={`flex-1 resize-none bg-transparent text-sm outline-none ${ui.txt1} placeholder:${ui.txt2} disabled:opacity-50`}
          />
          <button
            type="button"
            onClick={send}
            disabled={!input.trim() || status === 'thinking'}
            className="shrink-0 w-7 h-7 rounded-lg bg-brand-500 text-white text-sm font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer border-none"
          >
            ↑
          </button>
        </div>
      </div>

    </div>
  )
}
