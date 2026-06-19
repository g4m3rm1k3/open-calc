export const meta = {
  title: 'Notification Scheduler',
  description: 'Schedules OS browser notifications and dispatches oc-notification DOM events for in-app toasts. All-day events fire at 9am; timed events fire at each configured offset.',
  concept: 'Event-Driven Architecture',
  conceptDetail: 'The oc-notification CustomEvent decouples the scheduler from the UI. NavClock badge and the toast component both listen independently — neither knows the other exists.',
}

import type { CalendarEvent, NotificationOffset } from './types'

const scheduled = new Map<string, ReturnType<typeof setTimeout>[]>()
// Prevent re-firing the same notification if events reload mid-session
const firedThisSession = new Set<string>()

export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function fireKey(eventId: string, offset: number) {
  return `${eventId}:${offset}`
}

function fire(event: CalendarEvent, msBefore: number) {
  const key = fireKey(event.id, msBefore)
  if (firedThisSession.has(key)) return
  firedThisSession.add(key)

  const minutesBefore = Math.round(msBefore / 60000)
  const body = msBefore === 0
    ? 'This event is starting now.'
    : minutesBefore < 60
      ? `Starting in ${minutesBefore} minutes.`
      : minutesBefore < 1440
        ? `Starting in ${Math.round(minutesBefore / 60)} hour${Math.round(minutesBefore / 60) !== 1 ? 's' : ''}.`
        : 'Tomorrow.'

  // OS notification (when tab is not focused)
  if (Notification.permission === 'granted') {
    try {
      new Notification(event.title, {
        body,
        icon: '/favicon.ico',
        tag: key,
        requireInteraction: msBefore === 0,
      })
    } catch {
      // some browsers block new Notification() when already focused
    }
  }

  // In-app event — picked up by NotificationToast regardless of OS permission
  window.dispatchEvent(new CustomEvent('oc-notification', {
    detail: { event, msBefore, body },
  }))
}

function scheduleTimer(event: CalendarEvent, fireAt: number, msBefore: number) {
  const delay = fireAt - Date.now()
  const key = fireKey(event.id, msBefore)
  if (firedThisSession.has(key)) return null   // already fired this session
  if (delay < -60_000) return null             // >1 min in the past — skip
  if (delay > 7 * 86_400_000) return null      // >7 days out — skip (reschedules on next load)

  // Fires in the past (<1 min ago): deliver immediately so events don't silently vanish
  const effectiveDelay = Math.max(0, delay)
  return setTimeout(() => fire(event, msBefore), effectiveDelay)
}

export function scheduleEvent(event: CalendarEvent) {
  cancelEvent(event.id)
  const timers: ReturnType<typeof setTimeout>[] = []

  if (event.allDay) {
    // All-day events: notify at 9 AM on the event day.
    // If we're already past 9 AM today, fire within 3 s so the user sees it on load.
    const eventDay = new Date(event.start)
    const nineAm = new Date(event.start)
    nineAm.setHours(9, 0, 0, 0)

    const now = new Date()
    const isToday = isSameDay(eventDay, now)
    const fireAt = isToday && now.getHours() >= 9
      ? Date.now() + 3_000   // already past 9am today → fire on next load
      : nineAm.getTime()

    const t = scheduleTimer(event, fireAt, 0)
    if (t !== null) timers.push(t)
  } else {
    const startMs = new Date(event.start).getTime()
    for (const offset of event.notifications as NotificationOffset[]) {
      const fireAt = startMs - (offset as number) * 60_000
      const t = scheduleTimer(event, fireAt, (offset as number) * 60_000)
      if (t !== null) timers.push(t)
    }
  }

  if (timers.length > 0) scheduled.set(event.id, timers)
}

export function cancelEvent(eventId: string) {
  const timers = scheduled.get(eventId)
  if (timers) timers.forEach(clearTimeout)
  scheduled.delete(eventId)
}

export function scheduleAll(events: CalendarEvent[]) {
  for (const ev of events) scheduleEvent(ev)
}

export function cancelAll() {
  for (const timers of scheduled.values()) timers.forEach(clearTimeout)
  scheduled.clear()
}
