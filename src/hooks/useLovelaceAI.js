import { useState, useRef, useCallback } from 'react'
import { CreateMLCEngine } from '@mlc-ai/web-llm'

// Smallest capable Llama model — ~880 MB, cached after first load
const MODEL_ID = 'Llama-3.2-1B-Instruct-q4f16_1-MLC'

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
  const engineRef = useRef(null)
  const [isThinking, setIsThinking] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState('')

  const ensureEngine = useCallback(async () => {
    if (engineRef.current) return engineRef.current
    setIsDownloading(true)
    try {
      const engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: ({ text }) => {
          setDownloadProgress(text || 'Loading…')
        },
      })
      engineRef.current = engine
      return engine
    } finally {
      setIsDownloading(false)
      setDownloadProgress('')
    }
  }, [])

  // Pass recent messages as context so Lovelace can see what's been discussed
  const ask = useCallback(async (question, recentMessages = []) => {
    setIsThinking(true)
    try {
      const engine = await ensureEngine()

      const context = recentMessages
        .slice(-6)
        .filter(m => !m.isLovelace)
        .map(m => `${m.username}: ${m.text}`)
        .join('\n')

      const messages = [{ role: 'system', content: SYSTEM_PROMPT }]
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

  return { ask, isThinking, isDownloading, downloadProgress }
}
