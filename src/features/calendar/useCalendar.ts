import { useCallback, useEffect, useMemo } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useProgress } from '../../hooks/useProgress.js'
import { scheduleAll, cancelEvent, scheduleEvent } from './notifications'
import type { CalendarEvent, CalendarStore } from './types'
import { EVENT_COLORS } from './types'

const EMPTY: CalendarStore = { events: [] }

function uuid(): string {
  return `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useCalendar() {
  const [store, setStore] = useLocalStorage<CalendarStore>('oc-calendar', EMPTY)
  const { pushNow } = (useAuth() ?? {}) as { pushNow?: () => void }
  const { progress } = useProgress() as { progress: Record<string, { quiz?: { correct: number; total: number }; completedCheckpoints?: string[] }> }

  // Schedule notifications for all future events whenever events change
  useEffect(() => {
    scheduleAll(store.events)
  }, [store.events])

  const addEvent = useCallback((ev: Omit<CalendarEvent, 'id'>): CalendarEvent => {
    const event: CalendarEvent = { ...ev, id: uuid() }
    setStore(prev => ({ ...prev, events: [...prev.events, event] }))
    scheduleEvent(event)
    pushNow?.()
    return event
  }, [setStore, pushNow])

  const updateEvent = useCallback((id: string, patch: Partial<Omit<CalendarEvent, 'id'>>) => {
    cancelEvent(id)
    setStore(prev => {
      const events = prev.events.map(e => e.id === id ? { ...e, ...patch } : e)
      const updated = events.find(e => e.id === id)
      if (updated) scheduleEvent(updated)
      return { ...prev, events }
    })
    pushNow?.()
  }, [setStore, pushNow])

  const deleteEvent = useCallback((id: string) => {
    cancelEvent(id)
    setStore(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }))
    pushNow?.()
  }, [setStore, pushNow])

  const toggleComplete = useCallback((id: string) => {
    setStore(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === id ? { ...e, completed: !e.completed } : e),
    }))
    pushNow?.()
  }, [setStore, pushNow])

  // Build read-only "progress" events from lesson completions
  const progressEvents = useMemo((): CalendarEvent[] => {
    const events: CalendarEvent[] = []
    for (const [lessonId, data] of Object.entries(progress)) {
      if (!data.quiz || data.quiz.total === 0) continue
      if (data.quiz.correct === 0) continue
      const pct = Math.round((data.quiz.correct / data.quiz.total) * 100)
      const label = lessonId.split('/').pop()?.replace(/-/g, ' ') ?? lessonId
      const today = new Date().toISOString().split('T')[0]
      events.push({
        id: `progress-${lessonId}`,
        title: `📚 ${label} — ${pct}%`,
        description: `Quiz: ${data.quiz.correct}/${data.quiz.total} correct`,
        start: today,
        end: today,
        allDay: true,
        type: 'study',
        color: EVENT_COLORS.study,
        notifications: [],
        completed: pct === 100,
        lessonRef: lessonId,
      })
    }
    return events
  }, [progress])

  return {
    events: store.events,
    progressEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleComplete,
  }
}
