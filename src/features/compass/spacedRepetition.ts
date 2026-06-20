// A simplified, fixed-step spaced-repetition schedule — not full SM-2/FSRS
// (be honest about that rather than overclaiming sophistication we haven't
// built). Each correct review advances one step; "again" resets to the
// start; "hard" repeats the same step; "easy" skips ahead two steps. This
// is real, deterministic scheduling math — no AI involved, nothing invented.
const STEP_DAYS = [1, 3, 7, 14, 30, 60]

export type ReviewOutcome = 'again' | 'hard' | 'good' | 'easy'

export function isoDaysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export function nextStep(currentStep: number, outcome: ReviewOutcome): number {
  if (outcome === 'again') return 0
  if (outcome === 'hard') return currentStep
  if (outcome === 'easy') return Math.min(STEP_DAYS.length - 1, currentStep + 2)
  return Math.min(STEP_DAYS.length - 1, currentStep + 1) // 'good'
}

export function stepToDueDate(step: number): string {
  return isoDaysFromNow(STEP_DAYS[Math.max(0, Math.min(STEP_DAYS.length - 1, step))])
}

export function isDue(dueDate: string): boolean {
  return new Date(dueDate).getTime() <= Date.now()
}
