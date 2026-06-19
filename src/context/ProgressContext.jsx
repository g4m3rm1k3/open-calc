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

  const setQuizStates = useCallback((lessonId, states) => {
    setProgress((prev) => ({
      ...prev,
      [lessonId]: { ...prev[lessonId], quizStates: states },
    }))
    pushNow?.()
  }, [setProgress, pushNow])

  const getQuizStates = useCallback((lessonId) => {
    return progress[lessonId]?.quizStates ?? {}
  }, [progress])

  // Quiz score is the canonical lesson progress metric.
  // Falls back to reading checkpoints for lessons that have no quiz.
  const getLessonProgress = useCallback((lessonId) => {
    const entry = progress[lessonId]
    if (!entry) return { percent: 0, status: 'not-started', correct: 0, total: 0 }

    if (entry.quiz && entry.quiz.total > 0) {
      const pct = Math.round((entry.quiz.correct / entry.quiz.total) * 100)
      return {
        percent: pct,
        status: pct >= 100 ? 'complete' : pct > 0 ? 'in-progress' : 'not-started',
        correct: entry.quiz.correct,
        total: entry.quiz.total,
      }
    }

    const cp = entry.completedCheckpoints?.length ?? 0
    return {
      percent: cp > 0 ? 100 : 0,
      status: cp > 0 ? 'complete' : 'not-started',
      correct: 0,
      total: 0,
    }
  }, [progress])

  return (
    <ProgressContext.Provider value={{
      progress, markCheckpoint, setActiveTab, getLessonStatus, getLessonProgress,
      getActiveTab, setReadingProgress, getReadingProgress,
      setQuizScore, getQuizScore, setQuizStates, getQuizStates
    }}>
      {children}
    </ProgressContext.Provider>
  )
}
