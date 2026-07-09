// Monty is one instance app-wide now — opened from the taskbar on any page,
// or from the inline goal-intake flow on the Compass page itself. Both need
// to see the exact same in-progress draft (type a goal on /compass, then
// open Monty — it should pick up mid-flow, not start over), so this state
// lives in a context instead of being duplicated per-caller.
import { createContext, useContext, useState, type ReactNode } from 'react'
import { useCompass } from './useCompass'
import { isComplicated, type ActionDraft, type IntakeAnswers } from './playbooks'
import type { Plan } from './types'

const FITNESS_KEYWORDS = [
  'get in shape', 'get fit', 'lose weight', 'weight loss', 'fat loss', 'gain muscle',
  'build muscle', 'bulk', 'cut', 'shred', 'workout', 'work out', 'exercise', 'fitness',
  'gym', 'training', 'train', 'run', 'running', 'cardio', 'strength', 'weightlifting',
  'bench press', 'squat', 'deadlift', 'abs', 'push-up', 'pull-up', 'body composition',
  'healthy body', 'lose fat', 'get stronger', 'build strength', 'be fit',
]

function isFitnessGoal(title: string) {
  const lower = title.toLowerCase()
  return FITNESS_KEYWORDS.some((kw) => lower.includes(kw))
}

interface MontyContextValue {
  compass: ReturnType<typeof useCompass>
  montyOpen: boolean
  openMonty: () => void
  closeMonty: () => void
  questionTitle: string | null
  draftTitle: string | null
  draftActions: ActionDraft[]
  confirmedPlan: Plan | null
  fitnessBridgeGoal: string | null
  setConfirmedPlan: (p: Plan | null) => void
  setFitnessBridgeGoal: (g: string | null) => void
  handleIntake: (title: string) => void
  handleAnswered: (answers: IntakeAnswers) => void
  handleClarifyToPlan: (noteId: string, content: string) => void
  handleConfirm: (title: string, drafts: ActionDraft[], reward?: string) => void
  handleCancelBreakdown: () => void
}

const MontyContext = createContext<MontyContextValue | null>(null)

export function MontyProvider({ children }: { children: ReactNode }) {
  const compass = useCompass()
  const [montyOpen, setMontyOpen] = useState(false)
  const [questionTitle, setQuestionTitle] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState<string | null>(null)
  const [draftActions, setDraftActions] = useState<ActionDraft[]>([])
  const [convertingNoteId, setConvertingNoteId] = useState<string | null>(null)
  const [confirmedPlan, setConfirmedPlan] = useState<Plan | null>(null)
  const [fitnessBridgeGoal, setFitnessBridgeGoal] = useState<string | null>(null)

  // Complicated (multi-action) goals get sized by two real answers instead
  // of always defaulting to the same canned numbers — see IntakeQuestions
  // and isComplicated() in playbooks.ts. Simple ones skip straight to the
  // breakdown, since asking "hours/week" for "drink more water" is just
  // friction with nothing to size.
  const handleIntake = (title: string) => {
    setConfirmedPlan(null)
    if (isFitnessGoal(title)) setFitnessBridgeGoal(title)
    if (isComplicated(title)) {
      setQuestionTitle(title)
    } else {
      setDraftTitle(title)
      setDraftActions(compass.proposePlan(title))
    }
  }

  const handleAnswered = (answers: IntakeAnswers) => {
    if (!questionTitle) return
    setDraftTitle(questionTitle)
    setDraftActions(compass.proposePlan(questionTitle, answers))
    setQuestionTitle(null)
  }

  // A note's "→ Plan" clarify action reuses the exact same intake/breakdown
  // flow as typing into PlanIntake directly — it's not a separate path.
  const handleClarifyToPlan = (noteId: string, content: string) => {
    setConvertingNoteId(noteId)
    handleIntake(content)
  }

  const handleConfirm = (title: string, drafts: ActionDraft[], reward?: string) => {
    const plan = compass.confirmPlan(title, drafts, reward)
    if (convertingNoteId) {
      compass.updateNote(convertingNoteId, { status: 'clarified' })
      setConvertingNoteId(null)
    }
    setDraftTitle(null)
    setDraftActions([])
    setConfirmedPlan(plan)
  }

  const handleCancelBreakdown = () => {
    setConvertingNoteId(null)
    setQuestionTitle(null)
    setDraftTitle(null)
  }

  const value: MontyContextValue = {
    compass,
    montyOpen,
    openMonty: () => setMontyOpen(true),
    closeMonty: () => setMontyOpen(false),
    questionTitle,
    draftTitle,
    draftActions,
    confirmedPlan,
    fitnessBridgeGoal,
    setConfirmedPlan,
    setFitnessBridgeGoal,
    handleIntake,
    handleAnswered,
    handleClarifyToPlan,
    handleConfirm,
    handleCancelBreakdown,
  }

  return <MontyContext.Provider value={value}>{children}</MontyContext.Provider>
}

export function useMontyContext(): MontyContextValue {
  const ctx = useContext(MontyContext)
  if (!ctx) throw new Error('useMontyContext must be used within MontyProvider')
  return ctx
}
