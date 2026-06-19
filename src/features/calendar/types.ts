// Types the user explicitly creates/schedules
export type UserEventType = 'task' | 'study' | 'reminder' | 'goal' | 'workout'
// Types generated automatically by the app (read-only overlays on the calendar)
export type AutoEventType = 'lab' | 'health' | 'progress'
export type EventType = UserEventType | AutoEventType

export type NotificationOffset =
  | 0       // at start
  | 15      // 15 min before
  | 60      // 1 hour before
  | 120     // 2 hours before
  | 240     // 4 hours before
  | 1440    // 1 day before

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: string           // ISO 8601
  end: string             // ISO 8601
  allDay?: boolean
  type: EventType
  color?: string          // hex
  notifications: NotificationOffset[]
  completed?: boolean
  lessonRef?: string      // progressKey e.g. "ai-engineering/dev-environment"
  labRef?: string
}

export interface CalendarStore {
  events: CalendarEvent[]
}

export const EVENT_COLORS: Record<EventType, string> = {
  // user-created
  task:     '#6366f1',  // indigo
  study:    '#0ea5e9',  // sky
  reminder: '#f59e0b',  // amber
  goal:     '#10b981',  // emerald
  workout:  '#f97316',  // orange
  // auto-tracked (read-only overlays)
  lab:      '#8b5cf6',  // violet
  health:   '#ef4444',  // red
  progress: '#0ea5e9',  // sky (same as study, lesson completions)
}

// Labels shown in the create/edit modal — auto types are excluded
export const USER_EVENT_TYPE_LABELS: Record<UserEventType, string> = {
  task:    'Task',
  study:   'Study Session',
  reminder:'Reminder',
  goal:    'Goal',
  workout: 'Workout',
}

export const NOTIFICATION_LABELS: Record<NotificationOffset, string> = {
  0:    'At start',
  15:   '15 min before',
  60:   '1 hour before',
  120:  '2 hours before',
  240:  '4 hours before',
  1440: '1 day before',
}

export const ALL_NOTIFICATION_OFFSETS: NotificationOffset[] = [1440, 240, 120, 60, 15, 0]
