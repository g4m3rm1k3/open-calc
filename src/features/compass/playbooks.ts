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
    complicated: false,
    match: (t) => /workout|run|gym|fitness|lift|exercise/i.test(t),
    generate: (title) => [
      {
        label: title,
        cadence: 'weekdays',
        time: '07:00',
        durationMinutes: 45,
        methodIds: ['implementation-intentions'],
        why: 'Consistent physical activity requires pre-deciding the time.',
        fallback: 'Do 5 pushups or go for a 5-minute walk.'
      }
    ]
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
