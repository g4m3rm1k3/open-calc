import { useState, useCallback, useRef, useEffect } from 'react'

// ── Voice quality scoring ─────────────────────────────────────────────────────
// Higher = better. Used both for auto-selection and for sorting the picker list.
export function scoreVoice(v) {
  const n = v.name.toLowerCase()
  if (n.includes('natural'))  return 100  // Windows Neural (Microsoft Aria Online Natural, etc.)
  if (n.includes('enhanced')) return 90   // macOS Enhanced (Samantha Enhanced, Ava Enhanced, etc.)
  if (n.includes('premium'))  return 85   // macOS Premium
  if (n.includes('siri'))     return 80   // Siri voices
  if (n.includes('google'))   return 70   // Google voices (Chrome on Android/Desktop)
  if (v.localService)         return 50   // Any other installed local voice
  return 20                               // Network/remote voices with no known quality marker
}

export function voiceQualityLabel(v) {
  const n = v.name.toLowerCase()
  if (n.includes('natural'))  return 'Neural'
  if (n.includes('enhanced')) return 'Enhanced'
  if (n.includes('premium'))  return 'Premium'
  if (n.includes('siri'))     return 'Siri'
  if (n.includes('google'))   return 'Google'
  return null
}

function pickBestVoice(voices) {
  const en = voices.filter(v => v.lang.startsWith('en'))
  const pool = en.length ? en : voices
  const google = pool.find(v => v.name.toLowerCase().includes('google'))
  if (google) return google
  return pool.sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] ?? null
}

const STORAGE_KEY = 'upskillos_tts_voice'

// ── Text cleaning ─────────────────────────────────────────────────────────────
export function cleanForSpeech(text) {
  return text
    .replace(/```[\s\S]*?```/g, '. ')
    .replace(/\$\$[\s\S]*?\$\$/g, '. ')
    .replace(/\\\[[\s\S]*?\\\]/g, '. ')
    .replace(/\$[^$\n]{1,120}\$/g, ' ')
    .replace(/\\\([^)]{1,120}\\\)/g, ' ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const [voices, setVoices]     = useState([])
  const [voiceURI, setVoiceURIState] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Persist voice choice
  const setVoiceURI = useCallback((uri) => {
    setVoiceURIState(uri)
    try { localStorage.setItem(STORAGE_KEY, uri) } catch {}
  }, [])

  // Load voices — Chrome fires voiceschanged async, Safari returns them sync
  useEffect(() => {
    if (!supported) return

    function load() {
      const list = speechSynthesis.getVoices()
      if (!list.length) return
      setVoices(list)
      setVoiceURIState(prev => {
        if (prev) return prev
        // Restore saved preference if the voice still exists
        try {
          const saved = localStorage.getItem(STORAGE_KEY)
          if (saved && list.find(v => v.voiceURI === saved)) return saved
        } catch {}
        return pickBestVoice(list)?.voiceURI ?? null
      })
    }

    load()
    speechSynthesis.addEventListener('voiceschanged', load)
    return () => speechSynthesis.removeEventListener('voiceschanged', load)
  }, [supported])

  const stop = useCallback(() => {
    if (supported) speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [supported])

  const speak = useCallback((text) => {
    if (!supported) return Promise.resolve()
    speechSynthesis.cancel()

    const cleaned = cleanForSpeech(text)
    if (!cleaned || cleaned.length < 2) return Promise.resolve()

    return new Promise((resolve) => {
      const utt = new SpeechSynthesisUtterance(cleaned)
      utt.rate  = 1.05
      utt.pitch = 1.0

      const voice = speechSynthesis.getVoices().find(v => v.voiceURI === voiceURI)
      if (voice) utt.voice = voice

      utt.onstart = () => setIsSpeaking(true)
      utt.onend   = () => { setIsSpeaking(false); resolve() }
      utt.onerror = () => { setIsSpeaking(false); resolve() }

      speechSynthesis.speak(utt)
      setIsSpeaking(true)
    })
  }, [supported, voiceURI])

  // English voices sorted best-first — ready for the picker
  const englishVoices = voices
    .filter(v => v.lang.startsWith('en'))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a))

  return { speak, stop, isSpeaking, supported, englishVoices, voiceURI, setVoiceURI }
}
