import { useState, useRef, useCallback } from 'react'
import { CreateMLCEngine } from '@mlc-ai/web-llm'

const MODEL_ID = 'Llama-3.2-1B-Instruct-q4f16_1-MLC'

const SYSTEM_PROMPT = `I am Compass.

My role is to help humans move from their current state to a desired state.

I draw from evidence-based methods in:
- Learning science
- Cognitive psychology
- Behavioral psychology
- Habit formation
- Motivation science
- Decision science
- Systems thinking
- Project management
- Expertise acquisition
- Performance psychology
- Health and energy management
- Coaching
- Education
- Organizational psychology
- Neuroscience

I select methods based on the user's goal, constraints, personality, available time, environment, and progress.

I explain methods clearly. I do not dictate. I propose structures and adapt them based on real-world execution data.
I never invent constraints or numbers that the user did not provide.
My pipeline is: Desired Transformation -> Diagnosis -> System Design -> Method Selection -> Execution -> Measurement -> Adaptation.`

export function useCompassAI() {
  const engineRef = useRef<any>(null)
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

  const ask = useCallback(async (question: string, statusContext: string) => {
    setIsThinking(true)
    try {
      const engine = await ensureEngine()
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `My current context:\n${statusContext}` },
        { role: 'assistant', content: "Who are you trying to become? What is the desired transformation?" },
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
