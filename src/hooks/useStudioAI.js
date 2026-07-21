import { useState, useCallback } from 'react'
import { getSharedEngine } from './webLLMSingleton.js'

const SYSTEM_PROMPT = `You are Ada, a friendly code tutor inside Open-Calc Studio. You are named after Ada Lovelace, the first computer programmer.

CRITICAL: The student's code and files are pasted directly into this conversation. You CAN read them. Always reference specific variable names, function names, and line content from the code provided. Never say you cannot access the files.

Keep responses SHORT — 2 to 4 sentences for explanations. Use markdown code blocks when writing code.

Your role:
- Explain code by referencing what is actually written
- Debug errors using the terminal output alongside the code
- Write complete working examples when asked
- Explain browser sandbox limits when relevant

Browser sandbox facts (mention only when relevant):
- JavaScript/TypeScript: browser sandbox, require() supports express/path/fs/cors/body-parser/dotenv/morgan
- Express: simulated — GET routes auto-tested, no real server or URL to visit
- Python: Pyodide (real CPython) — stdlib and pip work, sys.argv supported
- FastAPI/uvicorn: simulated — no real server
- OpenMAT (.m): MATLAB-like engine — need OpenMAT Studio tab for plots
- No real TCP ports in any language

Tone: friendly, direct, specific. Always reference the actual code.`

export function useStudioAI() {
  const [isThinking, setIsThinking] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState('')

  const ensureEngine = useCallback(async () => {
    if (_engine) return _engine
    setIsDownloading(true)
    try {
      return await getSharedEngine(p => setDownloadProgress(p))
    } finally {
      setIsDownloading(false)
      setDownloadProgress('')
    }
  }, [])

  /**
   * Non-streaming ask — returns full response string.
   * @param {string} question
   * @param {object} context - { code, language, filename, terminalOutput, tutorialContent }
   * @param {Array}  history - [{role:'user'|'ai', text}] recent conversation turns
   */
  const ask = useCallback(async (question, context = {}, history = []) => {
    setIsThinking(true)
    try {
      const engine = await ensureEngine()
      const messages = buildMessages(question, context, history)
      const res = await engine.chat.completions.create({ messages, max_tokens: 400, temperature: 0.5 })
      return res.choices[0].message.content?.trim() ?? '(no response)'
    } finally {
      setIsThinking(false)
    }
  }, [ensureEngine])

  /**
   * Streaming ask — calls onChunk(partialText) as tokens arrive.
   * @param {string}   question
   * @param {object}   context
   * @param {Array}    history
   * @param {Function} onChunk
   * @returns {Promise<string>} full response
   */
  const askStream = useCallback(async (question, context = {}, history = [], onChunk) => {
    setIsThinking(true)
    try {
      const engine = await ensureEngine()
      const messages = buildMessages(question, context, history)
      const stream = await engine.chat.completions.create({ messages, max_tokens: 400, temperature: 0.5, stream: true })
      let full = ''
      for await (const chunk of stream) {
        full += chunk.choices[0]?.delta?.content ?? ''
        onChunk(full)
      }
      return full
    } finally {
      setIsThinking(false)
    }
  }, [ensureEngine])

  return { ask, askStream, isThinking, isDownloading, downloadProgress }
}

// ── Message builder ───────────────────────────────────────────────────────────
function buildMessages(question, context, history) {
  const { code, language, filename, terminalOutput, tutorialContent, fileList } = context
  const msgs = [{ role: 'system', content: SYSTEM_PROMPT }]

  // Build a single rich context block so the 1B model sees everything clearly
  const parts = []

  // 1. Active file (most important — put first)
  if (code?.trim()) {
    parts.push(`=== ACTIVE FILE: ${filename || 'unknown'} (${language || 'unknown'}) ===\n\`\`\`${language}\n${code.slice(0, 2000)}\n\`\`\``)
  }

  // 2. Other files in the workspace
  const otherFiles = (fileList || []).filter(f => f && typeof f === 'object' && f.name !== filename && f.content?.trim())
  if (otherFiles.length) {
    const others = otherFiles
      .map(f => `--- ${f.name} (${f.language}) ---\n\`\`\`${f.language}\n${f.content.slice(0, 800)}\n\`\`\``)
      .join('\n\n')
    parts.push(`=== OTHER WORKSPACE FILES ===\n${others}`)
  }

  // 3. Terminal output
  if (terminalOutput?.trim()) {
    parts.push(`=== TERMINAL OUTPUT ===\n\`\`\`\n${terminalOutput.slice(-800)}\n\`\`\``)
  }

  // 4. Tutorial being read
  if (tutorialContent?.trim()) {
    parts.push(`=== CURRENT TUTORIAL (excerpt) ===\n${tutorialContent.slice(0, 1200)}`)
  }

  if (parts.length) {
    msgs.push({ role: 'user', content: `Here is the student's workspace:\n\n${parts.join('\n\n')}` })
    msgs.push({
      role: 'assistant',
      content: `I can see the workspace: ${[
        code?.trim() ? `${filename} (${language})` : null,
        otherFiles.length ? `${otherFiles.length} other file(s)` : null,
        terminalOutput?.trim() ? 'terminal output' : null,
        tutorialContent?.trim() ? 'tutorial' : null,
      ].filter(Boolean).join(', ')}. What do you need help with?`,
    })
  }

  // 5. Recent conversation history
  for (const m of history.slice(-8)) {
    msgs.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })
  }

  msgs.push({ role: 'user', content: question })
  return msgs
}
