// Tracks total foreground time in the app as an approximation of learning
// time — not per-lesson, just "the app was open and the tab was active."
// Persists to localStorage under 'oc-learning-time', synced across devices
// the same way everything else in the app is (see AuthContext's SYNC_KEYS).
import { useEffect } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

const TICK_MS = 15_000

export interface LearningTimeStore {
  totalMs: number
}

const EMPTY: LearningTimeStore = { totalMs: 0 }

// Pass track=true from exactly one always-mounted place (MontyAmbientNudge)
// to run the accumulator. Every other reader should call this with no
// argument — read-only, mount-time-accurate, matches how useCompass()
// already gets called independently from multiple components in this app.
export function useLearningTime(track: boolean = false): number {
  const [store, setStore] = useLocalStorage<LearningTimeStore>('oc-learning-time', EMPTY)

  useEffect(() => {
    if (!track) return
    const id = setInterval(() => {
      if (document.hidden) return
      setStore((prev) => ({ totalMs: (prev?.totalMs ?? 0) + TICK_MS }))
    }, TICK_MS)
    return () => clearInterval(id)
  }, [track, setStore])

  return store?.totalMs ?? 0
}

export function formatLearningTime(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  return `${hours}h ${minutes}m`
}
