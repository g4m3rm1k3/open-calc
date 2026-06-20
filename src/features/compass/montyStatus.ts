import type { Plan } from './types'

export function computeDailyWin(plans: Plan[]) {
  const today = new Date().toISOString().split('T')[0]
  
  let dueToday = 0
  let doneToday = 0

  plans.forEach(plan => {
    if (plan.status !== 'active') return
    
    plan.actions.forEach(action => {
      // Check if due today
      // Simple approximation for daily/weekdays
      const d = new Date()
      const day = d.getDay()
      const isDue = 
        action.cadence === 'daily' || 
        (action.cadence === 'weekdays' && day !== 0 && day !== 6) ||
        (action.cadence === 'once' && action.status !== 'done') ||
        (action.cadence === 'weekly' && action.calendarEventIds.length > 0) // Approximation

      if (isDue) {
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
