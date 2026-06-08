import { createContext, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { useAuth } from './AuthContext.jsx'

export const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useLocalStorage('oc-progress', {})
  const { pushNow } = useAuth() ?? {}

  const markCheckpoint = useCallback((lessonId, checkpoint) => {
    setProgress((prev) => {
      const existing = prev[lessonId]?.completedCheckpoints ?? []
      if (existing.includes(checkpoint)) return prev
      return {
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          completedCheckpoints: [...existing, checkpoint],
        },
      }
    })
    // Immediately persist to Firestore so progress is never lost on a crash
    pushNow?.()
  }, [setProgress, pushNow])

  const setActiveTab = useCallback((lessonId, tab) => {
    setProgress((prev) => ({
      ...prev,
      [lessonId]: { ...prev[lessonId], activeTab: tab },
    }))
  }, [setProgress])

  const getLessonStatus = useCallback((lessonId, totalCheckpoints) => {
    const cp = progress[lessonId]?.completedCheckpoints?.length ?? 0
    if (cp === 0) return 'not-started'
    if (cp >= totalCheckpoints) return 'complete'
    return 'in-progress'
  }, [progress])

  const getActiveTab = useCallback((lessonId) => {
    return progress[lessonId]?.activeTab ?? 'intuition'
  }, [progress])

  const setReadingProgress = useCallback((lessonId, percent) => {
    setProgress((prev) => {
      const current = prev[lessonId]?.readingProgress ?? 0
      if (percent <= current) return prev
      return {
        ...prev,
        [lessonId]: { ...prev[lessonId], readingProgress: percent },
      }
    })
  }, [setProgress])

  const getReadingProgress = useCallback((lessonId) => {
    return progress[lessonId]?.readingProgress ?? 0
  }, [progress])

  // correct = right answers so far, attempted = questions answered, total = quiz length
  const setQuizScore = useCallback((lessonId, correct, attempted, total) => {
    setProgress((prev) => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        quiz: { correct, attempted, total, attemptedAt: Date.now() },
      },
    }))
    pushNow?.()
  }, [setProgress, pushNow])

  const getQuizScore = useCallback((lessonId) => {
    return progress[lessonId]?.quiz ?? null
  }, [progress])

  return (
    <ProgressContext.Provider value={{
      progress, markCheckpoint, setActiveTab, getLessonStatus, getActiveTab,
      setReadingProgress, getReadingProgress, setQuizScore, getQuizScore
    }}>
      {children}
    </ProgressContext.Provider>
  )
}
