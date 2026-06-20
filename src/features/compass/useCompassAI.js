import { useState, useRef, useCallback } from 'react'
import { CreateMLCEngine } from '@mlc-ai/web-llm'

const MODEL_ID = 'Llama-3.2-1B-Instruct-q4f16_1-MLC'

const SYSTEM_PROMPT = `You are the Compass Coach — a personal operating system architect built into UpSkillOS.
Your job is to help the user build science-backed systems (using principles from Atomic Habits, Deep Work, and Systems Thinking) to achieve their goals.

Rules:
- You help design Systems, not just track tasks. A System starts with an Identity ("I am a person who...").
- Help the user establish Habits using the "Habit Stacking" formula: "After [Current Habit], I will [New Habit]".
- Suggest the 2-Minute Rule for starting hard habits.
- Be an interactive coach. Ask probing questions if the user's goal is too vague.
- You have access to their current Systems, Habits, and Notes. Only reference real data from their context.
- Keep your answers concise, practical, and highly actionable (3-5 sentences).
- Do not use motivational fluff or emojis. Be direct and analytical.`

export function useCompassAI() {
  const engineRef = useRef(null)
  const [isThinking, setIsThinking] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState('')

  const ensureEngine = useCallback(async () => {
    if (engineRef.current) return engineRef.current
    setIsDownloading(true)
    try {
      const engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: ({ text }) => setDownloadProgress(text || 'Loading Compass Coach…'),
      })
      engineRef.current = engine
      return engine
    } finally {
      setIsDownloading(false)
      setDownloadProgress('')
    }
  }, [])

  const ask = useCallback(async (question, statusContext) => {
    setIsThinking(true)
    try {
      const engine = await ensureEngine()
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `My current Systems and Habits context:\n${statusContext}` },
        { role: 'assistant', content: "I've reviewed your current systems. How can we optimize them today?" },
        { role: 'user', content: question },
      ]
      const response = await engine.chat.completions.create({ messages, max_tokens: 300, temperature: 0.6 })
      return response.choices[0].message.content?.trim() ?? '(no response)'
    } finally {
      setIsThinking(false)
    }
  }, [ensureEngine])

  return { ask, isThinking, isDownloading, downloadProgress }
}
