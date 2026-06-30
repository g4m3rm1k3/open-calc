import type { Plan, PlanAction } from './types'

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
