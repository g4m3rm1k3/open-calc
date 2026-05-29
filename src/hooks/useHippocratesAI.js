import { useState, useRef, useCallback } from 'react'
import { CreateMLCEngine } from '@mlc-ai/web-llm'

const MODEL_ID = 'Llama-3.2-1B-Instruct-q4f16_1-MLC'

const SYSTEM_PROMPT = `You are Hippocrates, a health education and wellness assistant inspired by the father of medicine. You help people understand nutrition, preventive health, lifestyle patterns, biomarkers, and evidence-based wellness practices.

Rules:
- You are an informational decision-support tool, NOT a diagnostic or treatment engine
- Always remind users to consult a qualified healthcare provider for medical decisions
- Base guidance on established evidence from NIH, USDA, and peer-reviewed research
- Acknowledge uncertainty and conflicting evidence honestly
- Be specific about dosage, timing, and interaction considerations when relevant (educational context only)
- Keep responses focused, educational, and concise (4–6 sentences for most answers)
- Never diagnose conditions or prescribe treatments
- Frame everything as educational context and informed self-awareness, not medical advice
- For supplement questions, explain mechanism, evidence strength, timing, and any known interactions
- For nutrition questions, reference RDA/AI/UL values and food sources where helpful`

export function useHippocratesAI() {
  const engineRef = useRef(null)
  const [isThinking, setIsThinking] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState('')

  const ensureEngine = useCallback(async () => {
    if (engineRef.current) return engineRef.current
    setIsDownloading(true)
    try {
      const engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: ({ text }) => setDownloadProgress(text || 'Loading model…'),
      })
      engineRef.current = engine
      return engine
    } finally {
      setIsDownloading(false)
      setDownloadProgress('')
    }
  }, [])

  /**
   * Ask Hippocrates a question.
   * @param {string} question - The user's question
   * @param {object|null} userContext - Sanitized profile/entry summary for personalization
   */
  const ask = useCallback(async (question, userContext = null) => {
    setIsThinking(true)
    try {
      const engine = await ensureEngine()
      const messages = [{ role: 'system', content: SYSTEM_PROMPT }]

      if (userContext) {
        messages.push({
          role: 'user',
          content: `My health context (for educational context only):\n${JSON.stringify(userContext, null, 2)}`,
        })
        messages.push({
          role: 'assistant',
          content: 'I have your context and can provide personalized educational information. What would you like to know?',
        })
      }

      messages.push({ role: 'user', content: question })

      const response = await engine.chat.completions.create({
        messages,
        max_tokens: 450,
        temperature: 0.6,
      })
      return response.choices[0].message.content?.trim() ?? '(no response)'
    } finally {
      setIsThinking(false)
    }
  }, [ensureEngine])

  return { ask, isThinking, isDownloading, downloadProgress }
}
