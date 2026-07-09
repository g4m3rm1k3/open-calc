import type { Plan, PlanAction } from './types'

type LessonProgress = { quiz?: { correct: number }; completedCheckpoints?: string[] }

// Same formula the old desktop mascot used for its XP bar — kept here so
// Monty (the Compass chat) can report the same numbers now that it owns
// this job instead.
export function computeXp(progress: Record<string, LessonProgress>): number {
  return Object.values(progress).reduce(
    (sum, p) => sum + (p.quiz?.correct ?? 0) * 5 + (p.completedCheckpoints?.length ?? 0) * 2,
    0
  )
}

export function xpToLevel(xp: number): { level: number; xpInLevel: number } {
  return { level: Math.floor(xp / 100) + 1, xpInLevel: xp % 100 }
}

// Simple approximation for daily/weekdays — shared by computeDailyWin here
// and montyNudge.ts so both agree on what "due today" means.
export function isActionDueToday(action: PlanAction, now: Date = new Date()): boolean {
  const day = now.getDay()
  return (
    action.cadence === 'daily' ||
    (action.cadence === 'weekdays' && day !== 0 && day !== 6) ||
    (action.cadence === 'once' && action.status !== 'done') ||
    (action.cadence === 'weekly' && action.calendarEventIds.length > 0) // Approximation
  )
}

export function computeDailyWin(plans: Plan[]) {
  const today = new Date().toISOString().split('T')[0]

  let dueToday = 0
  let doneToday = 0

  plans.forEach(plan => {
    if (plan.status !== 'active') return

    plan.actions.forEach(action => {
      if (isActionDueToday(action)) {
        dueToday++
        const loggedToday = action.log.find(l => l.date === today)
        if (loggedToday && loggedToday.outcome === 'done') {
          doneToday++
        }
      }
    })
  })

  return {
    dueToday,
    doneToday,
    won: dueToday > 0 && doneToday === dueToday
  }
}
