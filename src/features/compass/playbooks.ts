import type { ActionCadence } from './types'

export interface IntakeAnswers {
  hoursPerWeek?: number
  level?: 'beginner' | 'intermediate' | 'advanced'
}

export interface ActionDraft {
  label: string
  cadence: ActionCadence
  time?: string
  durationMinutes?: number
  methodIds?: string[]
  instructions?: string
  why?: string
  fallback?: string
  requiresNote?: string
  narrows?: boolean
}

interface Playbook {
  id: string
  complicated: boolean
  match: (title: string) => boolean
  generate: (title: string, answers?: IntakeAnswers) => ActionDraft[]
}

// clamp session length between 15 and 120 mins
function sizeDuration(hoursPerWeek: number, daysPerWeek: number): number {
  const minsPerWeek = hoursPerWeek * 60
  const session = Math.round(minsPerWeek / daysPerWeek)
  return Math.max(15, Math.min(120, session))
}

const PLAYBOOKS: Playbook[] = [
  {
    id: 'learn-a-subject',
    complicated: true,
    match: (t) => /learn|master|study|understand/i.test(t),
    generate: (title, answers) => {
      const isAdvanced = answers?.level === 'advanced'
      const duration = sizeDuration(answers?.hoursPerWeek ?? 3, 5) // assume 5 days (weekdays)

      const actions: ActionDraft[] = []

      if (!isAdvanced) {
        actions.push({
          label: `Orientation: define scope for ${title}`,
          cadence: 'once',
          methodIds: ['systems-vs-goals'],
          why: 'Before studying, you must define the exact subset you are tackling first so you aren\'t overwhelmed by the whole subject.',
          fallback: 'Just pick one chapter or one concept. You can expand later.',
          requiresNote: 'What specific concept or chapter are you starting with?',
          narrows: true
        })
      }

      actions.push({
        label: `Study session: ${title}`,
        cadence: 'weekdays',
        time: '19:00',
        durationMinutes: duration,
        methodIds: ['deep-work'],
        why: 'Consistent, distraction-free blocks are required to encode new information.',
        fallback: 'Read 1 page or watch 1 minute of a video.',
      })

      actions.push({
        label: `Active Recall: ${title}`,
        cadence: 'weekly',
        time: '10:00',
        durationMinutes: 30,
        methodIds: ['spaced-repetition'],
        why: 'Testing yourself is how memories move to long-term storage.',
        fallback: 'Just review your flashcards for 5 minutes.'
      })

      return actions
    }
  },
  {
    id: 'ship-a-project',
    complicated: true,
    match: (t) => /build|create|ship|make|write/i.test(t),
    generate: (title, answers) => {
      const duration = sizeDuration(answers?.hoursPerWeek ?? 5, 5)

      return [
        {
          label: `Scope definition: ${title}`,
          cadence: 'once',
          methodIds: ['systems-vs-goals'],
          why: 'Define the absolute smallest version of this project that works.',
          requiresNote: 'What is the absolute minimum viable version of this?',
          narrows: true
        },
        {
          label: `Deep work block: ${title}`,
          cadence: 'weekdays',
          time: '08:00',
          durationMinutes: duration,
          methodIds: ['deep-work', 'project-based-learning'],
          why: 'Shipping requires dedicated, uninterrupted focus.',
          fallback: 'Just open the editor and write 1 line or 1 sentence.'
        }
      ]
    }
  },
  {
    id: 'get-fit',
    complicated: true,
    match: (t) => /workout|run|gym|fitness|lift|exercise|shape|weight|muscle|cardio|strength|healthy body|get fit/i.test(t),
    generate: (title, answers) => {
      const level = answers?.level ?? 'beginner'
      const hours = answers?.hoursPerWeek ?? (level === 'advanced' ? 5 : level === 'intermediate' ? 4 : 3)
      const days = level === 'beginner' ? 3 : level === 'intermediate' ? 4 : 5
      const sessionMins = sizeDuration(hours, days)

      const actions: ActionDraft[] = []

      if (level === 'beginner') {
        actions.push({
          label: 'Full-body strength session',
          cadence: 'weekly',
          time: '07:00',
          durationMinutes: sessionMins,
          instructions: '3 sets × 8–10 reps each: goblet squat, deadlift, push-up, dumbbell row, plank 30s. Rest 90s between sets. Add 5 lbs or 1 rep when all sets are clean.',
          why: 'Full-body 3×/week builds strength without overtraining beginners. Compound lifts give maximum return per minute.',
          fallback: 'Push-ups, bodyweight squats, hip hinges — 3 rounds, no equipment.'
        })
        actions.push({
          label: 'Walk or Zone 2 cardio',
          cadence: 'weekly',
          time: '12:00',
          durationMinutes: 30,
          instructions: 'Brisk walk, bike, or easy jog. Keep pace conversational — you should be able to speak in sentences.',
          why: 'Zone 2 cardio on rest days accelerates fat loss and recovery without straining muscles.',
          fallback: '10-minute walk still counts. Anything beats nothing.'
        })
      } else if (level === 'intermediate') {
        actions.push({
          label: 'Upper body workout',
          cadence: 'weekly',
          time: '07:00',
          durationMinutes: sessionMins,
          instructions: 'Push: bench press 4×6, overhead press 3×8, dips 3×10. Pull: barbell row 4×6, pull-ups 3×max, face pulls 3×15.',
          why: 'Upper/lower splits let each muscle group recover 48h while you train 4×/week.',
          fallback: 'Resistance band chest press and rows if no equipment.'
        })
        actions.push({
          label: 'Lower body + core workout',
          cadence: 'weekly',
          time: '07:00',
          durationMinutes: sessionMins,
          instructions: 'Squat 4×5, Romanian deadlift 3×8, walking lunges 3×12, leg press 3×10. Core: ab wheel 3×8, hanging leg raises 3×10.',
          why: 'Lower body training drives the most metabolic change — largest muscle groups in the body.',
          fallback: 'Goblet squat + reverse lunges + glute bridges, 4 rounds.'
        })
        actions.push({
          label: 'Cardio + mobility',
          cadence: 'weekly',
          time: '07:30',
          durationMinutes: 30,
          instructions: '20 min steady-state run or bike. 10 min hip flexor, hamstring, and thoracic spine mobility work.',
          why: 'Mobility prevents the injuries that derail programs. Cardio maintains aerobic base.',
          fallback: '20-minute walk + 10 min stretching.'
        })
      } else {
        // advanced
        actions.push({
          label: 'Push day — chest / shoulders / triceps',
          cadence: 'weekly',
          time: '07:00',
          durationMinutes: sessionMins,
          instructions: 'Flat bench 5×5, incline DB 4×8, lateral raises 4×12, overhead press 3×6, tricep pushdowns 3×12, cable fly 3×15.',
          why: 'PPL 5–6×/week maximizes weekly volume per muscle group with adequate recovery.',
        })
        actions.push({
          label: 'Pull day — back / biceps',
          cadence: 'weekly',
          time: '07:00',
          durationMinutes: sessionMins,
          instructions: 'Deadlift 4×4, weighted pull-ups 4×6, pendlay row 4×6, face pulls 4×15, hammer curls 3×10, reverse fly 3×15.',
          why: 'Pulling strength lags behind in most people. Dedicated pull day fixes the imbalance.',
        })
        actions.push({
          label: 'Leg day — quads / hamstrings / glutes',
          cadence: 'weekly',
          time: '07:00',
          durationMinutes: sessionMins,
          instructions: 'Squat 5×5, RDL 4×6, leg press 4×10, walking lunges 3×12, calf raises 5×15, leg curl 3×12.',
          why: 'Legs are 60% of your muscle mass. Skipping them caps total progress and hurts hormonal response.',
        })
        actions.push({
          label: 'HIIT cardio + abs',
          cadence: 'weekly',
          time: '07:00',
          durationMinutes: 25,
          instructions: '5 rounds: 40s sprint / 20s rest on bike or treadmill. Then: 3×15 cable crunch, 3×12 hanging leg raise, 3×20 Russian twist.',
          why: 'HIIT preserves muscle mass while accelerating fat loss better than steady-state.',
          fallback: '30-min Zone 2 run if recovery feels compromised.'
        })
      }

      // Always: weekly check-in
      actions.push({
        label: 'Weekly check-in: weight + lift PRs',
        cadence: 'weekly',
        time: '08:00',
        durationMinutes: 10,
        instructions: 'Weigh yourself same time, same conditions. Note your main lifts. Ask: did I hit all sessions? What felt hard?',
        why: 'Without measurement, you\'re guessing. Weekly snapshots reveal whether the program is working or needs adjusting.',
        requiresNote: 'Starting lifts (squat / bench / deadlift in lbs or kg) and current bodyweight:',
        fallback: 'Just log your bodyweight. Any data is better than none.'
      })

      return actions
    }
  },
  {
    id: 'simple-recurring',
    complicated: false,
    match: (t) => /drink|meditate|read|journal/i.test(t),
    generate: (title) => [
      {
        label: title,
        cadence: 'daily',
        time: '08:00',
        durationMinutes: 15,
        methodIds: ['implementation-intentions'],
        why: 'Small daily habits compound over time.',
        fallback: 'Do it for just 2 minutes.'
      }
    ]
  }
]

export function isComplicated(title: string): boolean {
  const playbook = PLAYBOOKS.find(p => p.match(title))
  return playbook?.complicated ?? false
}

// Reused by systemTemplates.ts so a goal categorized as e.g. "get-fit" for
// the Plan engine is categorized identically for the System view — one
// categorization, not two regex sets that can silently drift apart.
export function categorize(title: string): string | null {
  return PLAYBOOKS.find(p => p.match(title))?.id ?? null
}

export function proposeBreakdown(title: string, answers?: IntakeAnswers): ActionDraft[] {
  const playbook = PLAYBOOKS.find(p => p.match(title))
  if (playbook) {
    return playbook.generate(title, answers)
  }

  // Fallback to one-off task if no heuristic matches
  return [
    {
      label: title,
      cadence: 'once',
      why: 'A simple one-off task.',
    }
  ]
}
