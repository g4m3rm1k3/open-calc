/**
 * buildAgentContext — the hallucination guard.
 *
 * Assembles a plain-text snapshot of the user's real app state.
 * The AI agent receives ONLY this text — it cannot invent numbers,
 * progress, or blockers because it only ever reads real data from here.
 *
 * Never call the AI without passing the output of this function.
 */

import type { Plan, Note, Flashcard } from './types'
import type { CalendarEvent } from '../calendar/types'

export interface AppContext {
  currentPage: string
  plans: Plan[]
  notes: Note[]
  flashcards: Flashcard[]
  dueFlashcards: Flashcard[]
  calendarEvents: CalendarEvent[]
  progress: Record<string, { quiz?: { correct: number; total: number }; completedCheckpoints?: string[] }>
}

export function buildAgentContext(ctx: AppContext): string {
  const todayISO = new Date().toISOString().split('T')[0]
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const todayDay = new Date().getDay() // 0=Sun, 6=Sat
  const weekdayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][todayDay]

  const lines: string[] = []

  lines.push(`TODAY: ${todayLabel} (${weekdayName})`)
  lines.push(`CURRENT PAGE: ${ctx.currentPage}`)
  lines.push('')

  // ── Calendar ─────────────────────────────────────────────────────────
  const upcoming = ctx.calendarEvents
    .filter(e => e.start >= todayISO)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 10)

  if (upcoming.length > 0) {
    lines.push('UPCOMING CALENDAR EVENTS (next 7 days):')
    for (const ev of upcoming) {
      const timeStr = ev.allDay ? '(all-day)' : ev.start.includes('T') ? ev.start.split('T')[1].slice(0, 5) : ''
      const doneStr = ev.completed ? ' ✓ DONE' : ''
      lines.push(`  - ${ev.start.split('T')[0]} ${timeStr}: ${ev.title}${doneStr}`)
    }
  } else {
    lines.push('UPCOMING CALENDAR EVENTS: None')
  }
  lines.push('')

  // ── Compass Plans ─────────────────────────────────────────────────────
  const activePlans = ctx.plans.filter(p => p.status === 'active')
  if (activePlans.length > 0) {
    lines.push('ACTIVE COMPASS PLANS:')
    for (const plan of activePlans) {
      lines.push(`  Plan: "${plan.title}" [${plan.status}]${plan.focus ? ` — Narrowed to: "${plan.focus}"` : ''}`)
      for (const action of plan.actions) {
        const todayLog = action.log.find(l => l.date === todayISO)
        const recentLogs = action.log.slice(-3)
        const lastOutcomes = recentLogs.map(l => `${l.date}:${l.outcome}${l.blocker ? `(${l.blocker})` : ''}`).join(', ')
        let doneStr = 'NOT logged today'
        if (todayLog) doneStr = `logged today: ${todayLog.outcome.toUpperCase()}${todayLog.blocker ? ` — blocker: "${todayLog.blocker}"` : ''}`
        else if (action.status === 'done') doneStr = 'COMPLETED'

        lines.push(`    → [${action.cadence}] ${action.label}${action.time ? ` @ ${action.time}` : ''} — ${doneStr}`)
        if (lastOutcomes) lines.push(`      Recent: ${lastOutcomes}`)
      }
    }
  } else {
    lines.push('ACTIVE COMPASS PLANS: None')
  }
  lines.push('')

  // ── Flashcards ────────────────────────────────────────────────────────
  lines.push(`FLASHCARDS:`)
  lines.push(`  Total: ${ctx.flashcards.length}`)
  lines.push(`  Due today: ${ctx.dueFlashcards.length}`)
  lines.push('')

  // ── Lesson Progress ───────────────────────────────────────────────────
  const progressEntries = Object.entries(ctx.progress)
    .filter(([, v]) => v.quiz?.total && v.quiz.total > 0)
    .map(([id, v]) => {
      const pct = v.quiz ? Math.round((v.quiz.correct / v.quiz.total) * 100) : 0
      return { id, pct, correct: v.quiz?.correct ?? 0, total: v.quiz?.total ?? 0 }
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 10)

  if (progressEntries.length > 0) {
    lines.push('LESSON PROGRESS (quiz scores):')
    for (const e of progressEntries) {
      const label = e.id.split('/').join(' › ')
      lines.push(`  - ${label}: ${e.pct}% (${e.correct}/${e.total} correct)`)
    }
  } else {
    lines.push('LESSON PROGRESS: No quizzes completed yet')
  }
  lines.push('')

  // ── Recent Notes ──────────────────────────────────────────────────────
  const inboxNotes = ctx.notes.filter(n => n.status === 'inbox').slice(0, 5)
  if (inboxNotes.length > 0) {
    lines.push('RECENT NOTES (inbox):')
    for (const n of inboxNotes) {
      lines.push(`  - "${n.content.slice(0, 100)}${n.content.length > 100 ? '…' : ''}"`)
    }
  }

  return lines.join('\n')
}
