// Pure decision logic for what (if anything) Monty should proactively say
// right now. No React, no fabrication — every nudge is grounded in real
// Plan/PlanAction data already in the store. Returns null when there's
// nothing real to report.
import type { Plan, PlanAction } from './types'
import { isActionDueToday } from './montyStatus'

export type NudgeKind = 'blocked-streak' | 'overdue' | 'daily-summary' | 'celebration'

export interface Nudge {
  kind: NudgeKind
  planId: string
  actionId?: string
  message: string
}

// Fired the moment a lesson checkpoint/quiz completes (see markCheckpoint in
// ProgressContext.jsx) — decoupled the same way notifications.ts's
// 'oc-notification' event decouples the scheduler from its UI. useMontyNudge
// listens and surfaces it immediately, instead of waiting on the 5-minute
// poll that drives the plan-based nudges above.
export const CELEBRATE_EVENT = 'oc-monty-celebrate'

export function celebrate(message: string) {
  window.dispatchEvent(new CustomEvent(CELEBRATE_EVENT, { detail: { message } }))
}

function hasBlockedStreak(action: PlanAction, minStreak = 2): boolean {
  const sorted = [...action.log].sort((a, b) => b.date.localeCompare(a.date))
  if (sorted.length < minStreak) return false
  return sorted.slice(0, minStreak).every((l) => l.outcome === 'blocked')
}

function isPastScheduledTime(time: string, now: Date): boolean {
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return false
  const due = new Date(now)
  due.setHours(h, m, 0, 0)
  return now.getTime() > due.getTime()
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h)) return time
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function minutesPast(time: string, now: Date): number {
  const [h, m] = time.split(':').map(Number)
  return (now.getHours() - h) * 60 + (now.getMinutes() - m)
}

export function computeNudge(plans: Plan[], now: Date = new Date()): Nudge | null {
  const today = now.toISOString().split('T')[0]
  const activePlans = plans.filter((p) => p.status === 'active')

  // Priority 1: something is genuinely stuck — blocked 2+ days running.
  for (const plan of activePlans) {
    for (const action of plan.actions) {
      if (hasBlockedStreak(action)) {
        return {
          kind: 'blocked-streak',
          planId: plan.id,
          actionId: action.id,
          message: `"${action.label}" has been blocked 2 days in a row on "${plan.title}" — want to adjust the plan?`,
        }
      }
    }
  }

  // Priority 2: a scheduled action is overdue and hasn't been logged yet.
  for (const plan of activePlans) {
    for (const action of plan.actions) {
      if (!action.time) continue
      if (!isActionDueToday(action, now)) continue
      if (action.log.some((l) => l.date === today)) continue
      if (!isPastScheduledTime(action.time, now)) continue
      const late = minutesPast(action.time, now)
      const message = late > 180
        ? `You missed "${action.label}" today (was ${formatTime(action.time)}) — still want to do it?`
        : `"${action.label}" was due at ${formatTime(action.time)} — did you get to it?`
      return {
        kind: 'overdue',
        planId: plan.id,
        actionId: action.id,
        message,
      }
    }
  }

  // Priority 3: end-of-day summary, only once there's a real gap to report.
  if (now.getHours() >= 18) {
    let dueToday = 0
    let doneToday = 0
    let firstGapPlanId: string | null = null
    for (const plan of activePlans) {
      for (const action of plan.actions) {
        if (!isActionDueToday(action, now)) continue
        dueToday++
        const done = action.log.some((l) => l.date === today && l.outcome === 'done')
        if (done) doneToday++
        else firstGapPlanId ??= plan.id
      }
    }
    if (dueToday > 0 && doneToday < dueToday && firstGapPlanId) {
      return {
        kind: 'daily-summary',
        planId: firstGapPlanId,
        message: `${doneToday}/${dueToday} done today — still time to close the gap.`,
      }
    }
  }

  return null
}
