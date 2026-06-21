import { useCallback } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCalendar } from '../calendar/useCalendar'
import type { CompassStore, System, Habit, Note, Flashcard } from './types'
import { EMPTY_STORE } from './types'

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useCompass() {
  const [rawStore, setRawStore] = useLocalStorage<CompassStore>('oc-compass', EMPTY_STORE)
  
  // Migrate gracefully from old formats or empty values
  const store: CompassStore = {
    systems: Array.isArray(rawStore?.systems) ? rawStore.systems : [],
    habits: Array.isArray(rawStore?.habits) ? rawStore.habits : [],
    notes: Array.isArray(rawStore?.notes) ? rawStore.notes : [],
    cards: Array.isArray(rawStore?.cards) ? rawStore.cards : [],
    reviews: Array.isArray(rawStore?.reviews) ? rawStore.reviews : [],
    settings: rawStore?.settings || EMPTY_STORE.settings,
  }

  const setStore = useCallback((updater: (prev: CompassStore) => CompassStore) => {
    setRawStore((prev: CompassStore) => updater({ ...EMPTY_STORE, ...prev }))
  }, [setRawStore])

  const { pushNow } = (useAuth() ?? {}) as { pushNow?: () => void }
  const { addEvent, deleteEvent } = useCalendar()

  // --- Systems ---
  const addSystem = useCallback((identity: string, title: string, routine: string) => {
    const newSystem: System = {
      id: uid('sys'),
      identity,
      title,
      routine,
      milestones: [],
      calendarEventIds: [],
      createdAt: new Date().toISOString(),
      status: 'active'
    }
    setStore(prev => ({ ...prev, systems: [...prev.systems, newSystem] }))
    pushNow?.()
    return newSystem
  }, [setStore, pushNow])

  const updateSystem = useCallback((id: string, patch: Partial<System>) => {
    setStore(prev => ({
      ...prev,
      systems: prev.systems.map(s => s.id === id ? { ...s, ...patch } : s)
    }))
    pushNow?.()
  }, [setStore, pushNow])

  const deleteSystem = useCallback((id: string) => {
    setStore(prev => {
      const system = prev.systems.find(s => s.id === id)
      if (system) {
        system.calendarEventIds.forEach(evId => deleteEvent(evId))
      }
      return { ...prev, systems: prev.systems.filter(s => s.id !== id) }
    })
    pushNow?.()
  }, [setStore, pushNow, deleteEvent])

  // --- Habits ---
  const addHabit = useCallback((cue: string, routine: string, reward: string, twoMinVersion: string, systemId?: string) => {
    const newHabit: Habit = {
      id: uid('hab'),
      cue,
      routine,
      reward,
      twoMinVersion,
      streak: [],
      systemId
    }
    setStore(prev => ({ ...prev, habits: [...prev.habits, newHabit] }))
    pushNow?.()
    return newHabit
  }, [setStore, pushNow])

  const toggleHabitStreak = useCallback((habitId: string, isoDate: string) => {
    setStore(prev => {
      return {
        ...prev,
        habits: prev.habits.map(h => {
          if (h.id !== habitId) return h
          const newStreak = h.streak.includes(isoDate)
            ? h.streak.filter(d => d !== isoDate)
            : [...h.streak, isoDate]
          return { ...h, streak: newStreak }
        })
      }
    })
    pushNow?.()
  }, [setStore, pushNow])

  const deleteHabit = useCallback((id: string) => {
    setStore(prev => ({ ...prev, habits: prev.habits.filter(h => h.id !== id) }))
    pushNow?.()
  }, [setStore, pushNow])

  // --- Notes ---
  const addNote = useCallback((content: string, courseRef?: string) => {
    const newNote: Note = {
      id: uid('note'),
      content,
      status: 'inbox',
      linkedNoteIds: [],
      courseRef,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setStore(prev => ({ ...prev, notes: [...prev.notes, newNote] }))
    pushNow?.()
    return newNote
  }, [setStore, pushNow])

  const updateNote = useCallback((id: string, patch: Partial<Note>) => {
    setStore(prev => ({
      ...prev,
      notes: prev.notes.map(n => n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)
    }))
    pushNow?.()
  }, [setStore, pushNow])

  const deleteNote = useCallback((id: string) => {
    setStore(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== id) }))
    pushNow?.()
  }, [setStore, pushNow])

  return {
    ...store,
    addSystem,
    updateSystem,
    deleteSystem,
    addHabit,
    toggleHabitStreak,
    deleteHabit,
    addNote,
    updateNote,
    deleteNote
  }
}
