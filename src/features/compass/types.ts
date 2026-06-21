// ── Compass Data Types ──────────────────────────────────────────────
// localStorage key: 'oc-compass'
//
// Plan replaces the old Goal/Habit/Milestone split — see buildplan.md
// "The core architectural change: one concept, not three." A Plan is
// something the user wants to accomplish, made of one or more PlanActions.
// An action's cadence ('once' vs recurring) is what used to distinguish a
// "goal milestone" from a "habit" — same engine now, no separate forms.

export type ActionCadence = 'once' | 'daily' | 'weekdays' | 'weekly'
export type ActionStatus = 'pending' | 'active' | 'done'
export type ActionOutcome = 'done' | 'blocked' | 'skipped'

export interface PlanActionLogEntry {
  date: string              // ISO date the action was due
  outcome: ActionOutcome
  blocker?: string           // free text — only ever set by the user, never inferred
  note?: string              // the real answer when the action requiresNote — see PlanAction.requiresNote
}

export interface PlanAction {
  id: string
  label: string
  cadence: ActionCadence
  time?: string              // HH:MM — if absent, no calendar reminder is created
  durationMinutes?: number
  calendarEventIds: string[]
  log: PlanActionLogEntry[]
  status: ActionStatus
  // Which real, structurally-applied methods this action follows — see
  // methods.ts. Only ever set from a playbook, never invented per-action.
  methodIds?: string[]
  // The actual HOW — a domain-general technique instruction. See
  // playbooks.ts ActionDraft for why this is never subject-specific.
  instructions?: string
  // Why THIS step exists in THIS sequence — always visible, not collapsed.
  why?: string
  // A concrete fallback for a hard day — the obstacle-anticipation piece.
  fallback?: string
  // When set, marking this action "Done" requires a real one-line answer
  // to this prompt instead of just a click
  requiresNote?: string
  narrows?: boolean
}

export interface Plan {
  id: string
  title: string
  createdAt: string
  status: 'active' | 'paused' | 'completed'
  actions: PlanAction[]
  // Decided in advance, in the user's own words — never invented.
  reward?: string
  // The specific thing this plan actually narrowed down to.
  focus?: string
}

export type NoteStatus = 'inbox' | 'clarified' | 'archived'

export interface Note {
  id: string
  content: string            // markdown
  category?: string
  status: NoteStatus
  linkedNoteIds: string[]
  courseRef?: string
  createdAt: string
  updatedAt: string
}

export interface CompassSettings {
  pomodoroWork: number       // minutes, default 25
  pomodoroBreak: number      // minutes, default 5
  pomodoroLongBreak: number  // minutes, default 15
}

// Cards always come from something the user actually wrote (a note)
export interface Flashcard {
  id: string
  front: string
  back: string
  noteId?: string
  step: number               // index into spacedRepetition.ts's STEP_DAYS
  dueDate: string            // ISO — when it's next due for review
  reviewCount: number
  createdAt: string
}

export interface CompassStore {
  plans: Plan[]
  notes: Note[]
  flashcards: Flashcard[]
  settings: CompassSettings
}

export const DEFAULT_SETTINGS: CompassSettings = {
  pomodoroWork: 25,
  pomodoroBreak: 5,
  pomodoroLongBreak: 15,
}

export const EMPTY_STORE: CompassStore = {
  plans: [],
  notes: [],
  flashcards: [],
  settings: DEFAULT_SETTINGS,
}
