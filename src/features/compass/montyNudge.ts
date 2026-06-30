// Pure decision logic for what (if anything) Monty should proactively say
// right now. No React, no fabrication — every nudge is grounded in real
// Plan/PlanAction data already in the store. Returns null when there's
// nothing real to report.
import type { Plan, PlanAction } from './types'
import { isActionDueToday } from './montyStatus'

export type NudgeKind = 'blocked-streak' | 'overdue' | 'daily-summary'

export interface Nudge {
  kind: NudgeKind
  planId: string
  actionId?: string
  message: string
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
      return {
        kind: 'overdue',
        planId: plan.id,
        actionId: action.id,
        message: `It's past ${action.time} — have you done "${action.label}" yet?`,
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
