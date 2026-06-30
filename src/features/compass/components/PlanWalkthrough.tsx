// Presentational stepper around the existing PlanIntake -> IntakeQuestions ->
// PlanBreakdown sequence. Step is derived from the same lifted state
// CompassPage already shares with MontyPanel (so typing a goal in either
// surface drives the same walkthrough) — this adds the step chrome and the
// step-4 GoalMap payoff, it does not own any new state itself.
import { Check } from 'lucide-react'
import PlanIntake from './PlanIntake'
import IntakeQuestions from './IntakeQuestions'
import PlanBreakdown from './PlanBreakdown'
import GoalMap from './GoalMap'
import type { ActionDraft, IntakeAnswers } from '../playbooks'
import type { Plan } from '../types'

type StepKey = 'goal' | 'size' | 'review' | 'confirmed'

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'goal', label: 'State your goal' },
  { key: 'size', label: 'Size it' },
  { key: 'review', label: 'Review your system' },
  { key: 'confirmed', label: 'Confirm & schedule' },
]

export default function PlanWalkthrough({
  questionTitle,
  draftTitle,
  draftActions,
  confirmedPlan,
  onIntake,
  onAnswered,
  onConfirm,
  onCancel,
  onStartAnother,
}: {
  questionTitle: string | null
  draftTitle: string | null
  draftActions: ActionDraft[]
  confirmedPlan: Plan | null
  onIntake: (title: string) => void
  onAnswered: (answers: IntakeAnswers) => void
  onConfirm: (title: string, drafts: ActionDraft[], reward?: string) => void
  onCancel: () => void
  onStartAnother: () => void
}) {
  const step: StepKey = confirmedPlan ? 'confirmed' : questionTitle ? 'size' : draftTitle ? 'review' : 'goal'
  const currentIndex = STEPS.findIndex((s) => s.key === step)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1 flex-1 min-w-0">
            <div
              className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i < currentIndex
                  ? 'bg-emerald-500 text-white'
                  : i === currentIndex
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {i < currentIndex ? <Check size={11} /> : i + 1}
            </div>
            <span
              className={`text-[10px] font-semibold truncate hidden sm:inline ${
                i === currentIndex ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 rounded ${i < currentIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
            )}
          </div>
        ))}
      </div>

      {step === 'goal' && <PlanIntake onSubmit={onIntake} />}

      {step === 'size' && questionTitle && (
        <IntakeQuestions title={questionTitle} onContinue={onAnswered} onCancel={onCancel} />
      )}

      {step === 'review' && draftTitle && (
        <PlanBreakdown title={draftTitle} initialDrafts={draftActions} onConfirm={onConfirm} onCancel={onCancel} />
      )}

      {step === 'confirmed' && confirmedPlan && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <Check size={16} /> "{confirmedPlan.title}" is live — here's your system
          </div>
          <GoalMap plans={[confirmedPlan]} />
          <button
            onClick={onStartAnother}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
          >
            Start another goal
          </button>
        </div>
      )}
    </div>
  )
}
