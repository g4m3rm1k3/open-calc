// Curated SystemSpec templates — the same trick that already worked for
// playbooks.ts, applied to GoalSystem's loop/leverage-points/failure-modes
// shape. The free local model is NOT asked to invent leverage-point
// reasoning (a 1B model doing that is exactly what produced the original
// goal-decomposer bug) — these are real, hand-written templates, used
// directly, no AI call, no API key, no cost, works for every first-time
// user immediately. See buildplan.md "GoalSystem — curated, not generated".
//
// Targets are about CONSISTENCY (sessions/hours per week), never a
// domain-specific outcome number parsed from free text (e.g. "sub-20-
// minute") — that kind of parsing is fragile and would be presenting a
// guess as a fact. Consistency targets are honest defaults the user can
// mentally adjust; there's no fake precision here.
import { categorize } from './playbooks'

export interface SystemSpec {
  goal: string
  outcomeMetric: { label: string; unit: string; direction: 'up' | 'down' }
  loop: {
    input: { label: string; detail: string }
    action: { label: string; detail: string }
    output: { label: string; detail: string }
    feedback: { label: string; detail: string }
  }
  leveragePoints: { label: string; impact: 'high' | 'medium' | 'low'; why: string }[]
  failureModes: { label: string; consequence: string }[]
  inputsToLog: { key: string; label: string; unit: string; target: number }[]
}

const TEMPLATES: Record<string, (goal: string) => SystemSpec> = {
  'get-fit': (goal) => ({
    goal,
    outcomeMetric: { label: 'Consistency', unit: 'sessions/week', direction: 'up' },
    loop: {
      input: { label: 'Weekly training volume', detail: 'The base everything else is built on — more important than any single workout.' },
      action: { label: 'Structured sessions', detail: 'Fixed time, fixed activity — see your Plan actions for the schedule.' },
      output: { label: 'Periodic measurement', detail: 'A real number (time, distance, weight, reps) checked on a fixed cadence.' },
      feedback: { label: 'Trend vs. last measurement', detail: 'Tells you to adjust volume or intensity before the outcome stalls.' },
    },
    leveragePoints: [
      { label: 'Weekly volume', impact: 'high', why: 'Consistent base volume predicts results better than any single hard session.' },
      { label: 'Sleep', impact: 'high', why: 'Physical adaptation happens during recovery, not during the workout itself.' },
      { label: 'Session intensity', impact: 'medium', why: 'Matters, but only compounds on top of a consistent base — it cannot substitute for one.' },
    ],
    failureModes: [
      { label: 'Volume increases too fast', consequence: 'Injury risk rises faster than fitness, which then forces time off and erases progress.' },
      { label: 'Never re-measuring', consequence: 'No feedback signal — you cannot tell if the plan is working or just feels like effort.' },
    ],
    inputsToLog: [
      { key: 'sessions', label: 'Sessions this week', unit: 'sessions', target: 4 },
      { key: 'sleep', label: 'Average sleep', unit: 'hrs', target: 7 },
    ],
  }),
  'learn-a-subject': (goal) => ({
    goal,
    outcomeMetric: { label: 'Consistency', unit: 'sessions/week', direction: 'up' },
    loop: {
      input: { label: 'Deliberate study time', detail: 'Time spent actively retrieving, not passively rereading.' },
      action: { label: 'Active recall sessions', detail: 'Testing yourself before checking the answer — see your Plan actions.' },
      output: { label: 'Self-test / applied output', detail: 'Solving something real without notes, on a fixed cadence.' },
      feedback: { label: 'What you got wrong', detail: 'The gap between what you thought you knew and what you could actually produce.' },
    },
    leveragePoints: [
      { label: 'Retrieval practice frequency', impact: 'high', why: 'Forcing recall before checking beats rereading for long-term retention.' },
      { label: 'Sleep', impact: 'high', why: 'Memory consolidation happens during sleep, not during the study session.' },
      { label: 'Interleaving topics', impact: 'medium', why: 'Mixing related topics improves discrimination between them, but only helps once basics are in place.' },
    ],
    failureModes: [
      { label: 'Rereading instead of recalling', consequence: 'Produces familiarity that feels like mastery but fails the first time it is actually needed.' },
      { label: 'Skipping the self-test', consequence: 'No real feedback — confidence and competence silently drift apart.' },
    ],
    inputsToLog: [
      { key: 'sessions', label: 'Study sessions this week', unit: 'sessions', target: 5 },
      { key: 'sleep', label: 'Average sleep', unit: 'hrs', target: 7 },
    ],
  }),
  'ship-a-project': (goal) => ({
    goal,
    outcomeMetric: { label: 'Consistency', unit: 'sessions/week', direction: 'up' },
    loop: {
      input: { label: 'Focused work blocks', detail: 'Single-objective, distraction-free time — see your Plan actions.' },
      action: { label: 'Ship the smallest increment', detail: 'A real, usable piece, not a step toward one.' },
      output: { label: 'Real feedback on the increment', detail: 'From use, a test, or someone else — not your own assumption.' },
      feedback: { label: 'Cycle time vs. last increment', detail: 'Whether increments are getting faster or slower to ship.' },
    },
    leveragePoints: [
      { label: 'Scope discipline', impact: 'high', why: 'A project that never ships a small piece never gets real feedback, regardless of effort.' },
      { label: 'Feedback loop speed', impact: 'high', why: 'Faster cycles mean more corrections before a wrong direction compounds.' },
      { label: 'Context-switching', impact: 'medium', why: 'Splitting focus across other projects slows each one\'s cycle time.' },
    ],
    failureModes: [
      { label: 'Scope creep before shipping anything', consequence: 'No real feedback ever arrives, so direction can be wrong for a long time before anyone notices.' },
      { label: 'No measurable increment', consequence: 'Cannot tell real progress from busywork.' },
    ],
    inputsToLog: [
      { key: 'focusHours', label: 'Focused hours this week', unit: 'hrs', target: 5 },
      { key: 'increments', label: 'Increments shipped', unit: 'increments', target: 1 },
    ],
  }),
}

// Generic fallback for anything that didn't match a curated category —
// honestly generic (just "consistency produces a trend"), not pretending
// to domain expertise it doesn't have.
function genericTemplate(goal: string): SystemSpec {
  return {
    goal,
    outcomeMetric: { label: 'Consistency', unit: 'sessions/week', direction: 'up' },
    loop: {
      input: { label: 'Time invested', detail: 'However much time actually goes toward this, tracked honestly.' },
      action: { label: goal, detail: 'The thing itself — see your Plan actions for the actual schedule.' },
      output: { label: 'Periodic check', detail: 'A fixed-cadence look at whether this is actually moving.' },
      feedback: { label: 'Trend vs. last check', detail: 'Whether the trend is improving, flat, or fading.' },
    },
    leveragePoints: [
      { label: 'Consistency', impact: 'high', why: 'Without a fixed cadence, there is nothing to compare a trend against.' },
    ],
    failureModes: [
      { label: 'No periodic check', consequence: "Can't tell real progress from a feeling either way." },
    ],
    inputsToLog: [
      { key: 'sessions', label: 'Sessions this week', unit: 'sessions', target: 3 },
    ],
  }
}

/** Synchronous, deterministic, free — no AI call, nothing to hallucinate. */
export function generateSystemSpec(title: string): SystemSpec {
  const category = categorize(title)
  const template = category ? TEMPLATES[category] : undefined
  return (template ?? genericTemplate)(title)
}
