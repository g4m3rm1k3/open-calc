// ── Compass Data Types ──────────────────────────────────────────────
// localStorage key: 'oc-compass'

export interface Milestone {
  id: string
  label: string
  done: boolean
}

export interface Goal {
  id: string
  identity: string          // "I am a person who..."
  title: string
  system: string            // The daily/weekly actions
  milestones: Milestone[]
  calendarEventIds: string[]
  createdAt: string         // ISO 8601
  status: 'active' | 'paused' | 'completed'
}

export interface Habit {
  id: string
  cue: string               // "After I pour my morning coffee"
  routine: string            // "I will study for 2 minutes"
  reward: string             // "I mark it on my streak calendar"
  twoMinVersion: string      // "Open the app and read 1 paragraph"
  streak: string[]           // ISO date strings of completed days
  goalId?: string
}

export interface Note {
  id: string
  content: string            // markdown
  tags: string[]
  linkedNoteIds: string[]
  courseRef?: string
  goalRef?: string
  createdAt: string
  updatedAt: string
}

export interface WeeklyReviewEntry {
  id: string
  weekOf: string             // ISO date of Monday
  content: string            // AI-generated review text
  createdAt: string
}

export interface CompassSettings {
  pomodoroWork: number       // minutes, default 25
  pomodoroBreak: number      // minutes, default 5
  pomodoroLongBreak: number  // minutes, default 15
  morningReviewTime?: string // HH:MM
  eveningReviewTime?: string // HH:MM
}

export interface CompassStore {
  goals: Goal[]
  habits: Habit[]
  notes: Note[]
  reviews: WeeklyReviewEntry[]
  settings: CompassSettings
}

export const DEFAULT_SETTINGS: CompassSettings = {
  pomodoroWork: 25,
  pomodoroBreak: 5,
  pomodoroLongBreak: 15,
}

export const EMPTY_STORE: CompassStore = {
  goals: [],
  habits: [],
  notes: [],
  reviews: [],
  settings: DEFAULT_SETTINGS,
}
