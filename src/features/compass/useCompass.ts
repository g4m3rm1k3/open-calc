// Custom hook that owns all Compass state — Plans (the unified
// goal/habit/milestone replacement, see buildplan.md), Notes, settings.
// Persists to localStorage under 'oc-compass' (synced across devices via
// AuthContext's SYNC_KEYS, same as useCalendar).
//
// No AI-generated "weekly review" feature lives here — it was removed
// after producing entirely fabricated content (invented progress numbers,
// invented "fell off" items) because there was no real PlanActionLogEntry
// history yet for it to honestly summarize. Don't re-add a review/summary
// feature until Slice 2 (the Done/Blocked/Skipped accountability log)
// exists to ground it in real data — see buildplan.md.
import { useCallback } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCalendar } from '../calendar/useCalendar'
import type { CompassStore, Plan, PlanAction, Note, Flashcard, ActionCadence, ActionOutcome } from './types'
import { EMPTY_STORE } from './types'
import { proposeBreakdown, type ActionDraft, type IntakeAnswers } from './playbooks'
import { nextStep, stepToDueDate, isDue, type ReviewOutcome } from './spacedRepetition'

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function todayISO(): string {
  return isoDate(new Date())
}

// How many occurrences to schedule up front when a plan is confirmed —
// Calendar has no recurrence concept, so this generates real discrete
// events instead.
function occurrenceDates(cadence: ActionCadence, from: Date = new Date()): string[] {
  if (cadence === 'once') return [isoDate(from)]
  const targetCount = cadence === 'weekly' ? 6 : 10
  const step = cadence === 'weekly' ? 7 : 1
  const dates: string[] = []
  const cursor = new Date(from)
  let safety = 0
  while (dates.length < targetCount && safety < 90) {
    safety++
    const day = cursor.getDay()
    const include = cadence === 'weekdays' ? day !== 0 && day !== 6 : true
    if (include) dates.push(isoDate(cursor))
    cursor.setDate(cursor.getDate() + step)
  }
  return dates
}

export function useCompass() {
  const [rawStore, setRawStore] = useLocalStorage<CompassStore>('oc-compass', EMPTY_STORE)
  
  // Migrate gracefully from old formats or empty values
  const store: CompassStore = {
    ...EMPTY_STORE,
    ...rawStore,
    plans: Array.isArray(rawStore?.plans) ? rawStore.plans : [],
    notes: Array.isArray(rawStore?.notes) ? rawStore.notes : [],
    flashcards: Array.isArray(rawStore?.flashcards) ? rawStore.flashcards : [],
    settings: rawStore?.settings || EMPTY_STORE.settings,
  }

  const setStore = useCallback((updater: (prev: CompassStore) => CompassStore) => {
    setRawStore((prev: CompassStore) => {
      const next = updater({ ...EMPTY_STORE, ...prev })
      return { plans: next.plans, notes: next.notes, flashcards: next.flashcards, settings: next.settings }
    })
  }, [setRawStore])

  const { pushNow } = (useAuth() ?? {}) as { pushNow?: () => void }
  const { addEvent, deleteEvent } = useCalendar()

  /** Pure proposal — no state change. The review UI edits this draft before confirming. */
  const proposePlan = useCallback((title: string, answers?: IntakeAnswers): ActionDraft[] => proposeBreakdown(title, answers), [])

  const confirmPlan = useCallback((title: string, drafts: ActionDraft[], reward?: string) => {
    const actions: PlanAction[] = drafts.map((draft) => {
      const calendarEventIds: string[] = []
      if (draft.time) {
        for (const date of occurrenceDates(draft.cadence)) {
          const start = `${date}T${draft.time}:00`
          const end = new Date(new Date(start).getTime() + (draft.durationMinutes ?? 30) * 60_000).toISOString()
          const event = addEvent({
            title: draft.label,
            start,
            end,
            allDay: false,
            type: 'goal',
            notifications: [15],
          })
          calendarEventIds.push(event.id)
        }
      }
      return {
        id: uid('action'),
        label: draft.label,
        cadence: draft.cadence,
        time: draft.time,
        durationMinutes: draft.durationMinutes,
        calendarEventIds,
        log: [],
        status: draft.cadence === 'once' ? 'pending' : 'active',
        methodIds: draft.methodIds,
        instructions: draft.instructions,
        why: draft.why,
        fallback: draft.fallback,
        requiresNote: draft.requiresNote,
        narrows: draft.narrows,
      }
    })
    const plan: Plan = {
      id: uid('plan'),
      title,
      createdAt: new Date().toISOString(),
      status: 'active',
      actions,
      reward,
    }
    setStore((prev) => ({ ...prev, plans: [...prev.plans, plan] }))
    pushNow?.()
    return plan
  }, [setStore, pushNow, addEvent])

  const deletePlan = useCallback((id: string) => {
    const plan = store.plans.find((p) => p.id === id)
    plan?.actions.forEach((a) => a.calendarEventIds.forEach((eid) => deleteEvent(eid)))
    setStore((prev) => ({ ...prev, plans: prev.plans.filter((p) => p.id !== id) }))
    pushNow?.()
  }, [store.plans, setStore, pushNow, deleteEvent])

  const updatePlanStatus = useCallback((id: string, status: Plan['status']) => {
    setStore((prev) => ({ ...prev, plans: prev.plans.map((p) => (p.id === id ? { ...p, status } : p)) }))
    pushNow?.()
  }, [setStore, pushNow])

  const logActionOutcome = useCallback((planId: string, actionId: string, outcome: ActionOutcome, blocker?: string) => {
    const date = todayISO()
    setStore((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => {
        if (p.id !== planId) return p
        return {
          ...p,
          actions: p.actions.map((a) => {
            if (a.id !== actionId) return a
            const log = a.log.filter((entry) => entry.date !== date)
            log.push({ date, outcome, blocker })
            return {
              ...a,
              log,
              status: a.cadence === 'once' && outcome === 'done' ? 'done' : a.status,
            }
          }),
        }
      })
    }))
    pushNow?.()
  }, [setStore, pushNow])

  const completeWithNote = useCallback((planId: string, actionId: string, note: string) => {
    const date = todayISO()
    setStore((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => {
        if (p.id !== planId) return p
        const action = p.actions.find((a) => a.id === actionId)
        const shouldNarrow = action?.narrows && note.trim()
        return {
          ...p,
          focus: shouldNarrow ? note.trim() : p.focus,
          actions: p.actions.map((a) => {
            if (a.id === actionId) {
              const log = a.log.filter((entry) => entry.date !== date)
              log.push({ date, outcome: 'done', note })
              return { ...a, log, status: a.cadence === 'once' ? 'done' : a.status }
            }
            if (shouldNarrow && a.label.includes(p.title)) {
              return { ...a, label: a.label.split(p.title).join(note.trim()) }
            }
            return a
          }),
        }
      }),
    }))
    pushNow?.()
  }, [setStore, pushNow])

  const addNote = useCallback((input: { content: string; category?: string }) => {
    const now = new Date().toISOString()
    const note: Note = { ...input, id: uid('note'), status: 'inbox', linkedNoteIds: [], createdAt: now, updatedAt: now }
    setStore((prev) => ({ ...prev, notes: [note, ...prev.notes] }))
    pushNow?.()
    return note
  }, [setStore, pushNow])

  const updateNote = useCallback((id: string, patch: Partial<Pick<Note, 'content' | 'category' | 'status'>>) => {
    setStore((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)),
    }))
    pushNow?.()
  }, [setStore, pushNow])

  const deleteNote = useCallback((id: string) => {
    setStore((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id).map((n) => ({ ...n, linkedNoteIds: n.linkedNoteIds.filter((lid) => lid !== id) })),
    }))
    pushNow?.()
  }, [setStore, pushNow])

  const updateSettings = useCallback((patch: Partial<CompassStore['settings']>) => {
    setStore((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }))
    pushNow?.()
  }, [setStore, pushNow])

  const addFlashcards = useCallback((cards: { front: string; back: string; noteId?: string }[]) => {
    const now = new Date().toISOString()
    const newCards: Flashcard[] = cards.map((c) => ({
      ...c, id: uid('card'), step: 0, dueDate: now, reviewCount: 0, createdAt: now,
    }))
    setStore((prev) => ({ ...prev, flashcards: [...prev.flashcards, ...newCards] }))
    pushNow?.()
    return newCards
  }, [setStore, pushNow])

  const deleteFlashcard = useCallback((id: string) => {
    setStore((prev) => ({ ...prev, flashcards: prev.flashcards.filter((c) => c.id !== id) }))
    pushNow?.()
  }, [setStore, pushNow])

  const reviewFlashcard = useCallback((id: string, outcome: ReviewOutcome) => {
    setStore((prev) => ({
      ...prev,
      flashcards: prev.flashcards.map((c) => {
        if (c.id !== id) return c
        const step = nextStep(c.step, outcome)
        return { ...c, step, dueDate: stepToDueDate(step), reviewCount: c.reviewCount + 1 }
      }),
    }))
    pushNow?.()
  }, [setStore, pushNow])

  const noteCategories = [...new Set(store.notes.map((n) => n.category).filter((c): c is string => !!c))]
  const dueFlashcards = store.flashcards.filter((c) => isDue(c.dueDate))

  return {
    plans: store.plans,
    notes: store.notes,
    noteCategories,
    flashcards: store.flashcards,
    dueFlashcards,
    settings: store.settings,
    proposePlan, confirmPlan, deletePlan, updatePlanStatus, logActionOutcome, completeWithNote,
    addNote, updateNote, deleteNote,
    addFlashcards, deleteFlashcard, reviewFlashcard,
    updateSettings
  }
}
