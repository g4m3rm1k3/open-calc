import { useState, useRef, useCallback } from 'react'
import { CreateMLCEngine } from '@mlc-ai/web-llm'

const MODEL_ID = 'Llama-3.2-1B-Instruct-q4f16_1-MLC'

// Module-level singleton so multiple components share one engine instance
let _engine = null
let _enginePromise = null
async function getSharedEngine(onProgress) {
  if (_engine) return _engine
  if (_enginePromise) return _enginePromise
  _enginePromise = CreateMLCEngine(MODEL_ID, { initProgressCallback: ({ text }) => onProgress?.(text || 'Loading…') })
    .then(e => { _engine = e; _enginePromise = null; return e })
  return _enginePromise
}

const SYSTEM_PROMPT = `You are Lovelace, an open-source STEM tutor named after Ada Lovelace — the pioneering mathematician and first computer programmer. You help students understand mathematics, physics, chemistry, computer science, and related subjects.

Rules:
- Keep responses concise for a chat setting (3–5 sentences max)
- Use clear, encouraging language
- For math, write expressions in plain text (e.g. "x^2 + 2x + 1")
- If a question is off-topic from STEM, gently redirect
- Never claim to be human`

export const LOVELACE_TRIGGERS = [/@love\b/i, /@lovely\b/i, /@lovelace\b/i]

export function isLovelaceMention(text) {
  return LOVELACE_TRIGGERS.some(t => t.test(text))
}

export function extractQuestion(text) {
  return text
    .replace(/@lovelace\b/gi, '')
    .replace(/@lovely\b/gi, '')
    .replace(/@love\b/gi, '')
    .trim()
}

export function useLovelaceAI() {
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

  // lessonContext: { id, title, definitions? } — passed when user is in a lesson
  const ask = useCallback(async (question, recentMessages = [], lessonContext = null) => {
    setIsThinking(true)
    try {
      const engine = await ensureEngine()

      const messages = [{ role: 'system', content: SYSTEM_PROMPT }]

      // Inject lesson awareness before chat context
      if (lessonContext?.title) {
        let lessonInfo = `The student is currently studying the lesson: "${lessonContext.title}".`
        if (lessonContext.definitions?.length) {
          const terms = lessonContext.definitions
            .slice(0, 8)
            .map(d => `• ${d.term}: ${d.definition}`)
            .join('\n')
          lessonInfo += `\n\nKey terms in this lesson:\n${terms}`
        }
        messages.push({ role: 'user', content: lessonInfo })
        messages.push({ role: 'assistant', content: `Understood — I'll keep "${lessonContext.title}" in mind when answering.` })
      }

      const context = recentMessages
        .slice(-6)
        .filter(m => !m.isLovelace)
        .map(m => `${m.username}: ${m.text}`)
        .join('\n')

      if (context) {
        messages.push({ role: 'user', content: `Recent chat:\n${context}` })
        messages.push({ role: 'assistant', content: 'I see the recent discussion.' })
      }
      messages.push({ role: 'user', content: question })

      const response = await engine.chat.completions.create({
        messages,
        max_tokens: 300,
        temperature: 0.7,
      })
      return response.choices[0].message.content?.trim() ?? '(no response)'
    } finally {
      setIsThinking(false)
    }
  }, [ensureEngine])

  // Streaming version — onChunk(partialText) is called as tokens arrive
  const askStream = useCallback(async (messages, onChunk) => {
    setIsThinking(true)
    try {
      const engine = await ensureEngine()
      const stream = await engine.chat.completions.create({ messages, max_tokens: 512, temperature: 0.7, stream: true })
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
