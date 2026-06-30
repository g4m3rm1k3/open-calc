import { useState } from 'react'
import { Compass as CompassIcon, Sparkles, Dumbbell, X } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { useCompass } from './useCompass'
import PlanWalkthrough from './components/PlanWalkthrough'
import PlanCard from './components/PlanCard'
import NoteEditor from './components/NoteEditor'
import TutorialCard from './components/TutorialCard'
import PomodoroTimer from './components/PomodoroTimer'
import FlashcardReview from './components/FlashcardReview'
import MontyPanel from './components/MontyPanel'
import GoalMap from './components/GoalMap'
import { isComplicated, type ActionDraft, type IntakeAnswers } from './playbooks'
import { computeDailyWin } from './montyStatus'
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
  return FITNESS_KEYWORDS.some(kw => lower.includes(kw))
}

function FitnessBridgeCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3 flex gap-2 items-start text-xs">
      <Dumbbell size={13} className="text-emerald-500 shrink-0 mt-0.5" />
      <p className="text-slate-400 leading-relaxed flex-1">
        Your plan is above. Use{' '}
        <Link to="/rpg-workout" className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-2">
          RPG Workout
        </Link>{' '}
        as your logbook — check off each session there to track streaks and XP.
      </p>
      <button type="button" aria-label="Dismiss" onClick={onDismiss} className="text-slate-600 hover:text-slate-400 shrink-0">
        <X size={12} />
      </button>
    </div>
  )
}

import atomicHabits from './tutorials/atomic-habits.js'
import deepWork from './tutorials/deep-work.js'
import gtd from './tutorials/gtd.js'
import systemsThinking from './tutorials/systems-thinking.js'
import pomodoro from './tutorials/pomodoro.js'
import spacedRepetition from './tutorials/spaced-repetition.js'

export const meta = {
  title: 'Compass',
  description: 'An accomplish system, not a tracker: state a goal, the system proposes a real breakdown, schedules it on the calendar, and (Slice 2+) holds you accountable for it.',
  concept: 'Feature Module',
  conceptDetail: 'Self-contained feature with its own types, CRUD hook, and components. The rest of the app only knows the /compass route and the compass-quick tool overlay — everything else is internal.',
  jumpTo: '/compass',
}

const TUTORIALS = [atomicHabits, deepWork, gtd, systemsThinking, pomodoro, spacedRepetition]
const TABS = ['Plans', 'Notes', 'Cards', 'Focus', 'Learn'] as const
type Tab = typeof TABS[number]

export default function CompassPage() {
  const compass = useCompass()
  const [tab, setTab] = useState<Tab>('Plans')

  const [questionTitle, setQuestionTitle] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState<string | null>(null)
  const [draftActions, setDraftActions] = useState<ActionDraft[]>([])
  const [convertingNoteId, setConvertingNoteId] = useState<string | null>(null)
  const [confirmedPlan, setConfirmedPlan] = useState<Plan | null>(null)
  
  const [montyOpen, setMontyOpen] = useState(false)
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

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-slate-50 to-slate-100 dark:from-sky-950/20 dark:via-slate-950 dark:to-slate-950 text-slate-900 dark:text-slate-200 p-4 md:p-8 pb-32 md:pb-8 transition-colors duration-300">
      <header className="flex items-center justify-between mb-6 sticky top-0 z-50 -mx-4 px-4 py-3 md:-mx-8 md:px-8 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-500/15 flex items-center justify-center text-sky-500 dark:text-sky-400 shadow-sm border border-sky-200/50 dark:border-transparent">
            <CompassIcon size={18} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">Compass</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Say what you want to accomplish — the system builds the plan</p>
          </div>
        </div>
        
        {(() => {
          const win = computeDailyWin(compass.plans)
          if (win.dueToday === 0) return null
          return (
            <div className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border ${win.won ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/20 dark:border-transparent dark:text-emerald-300' : 'bg-white border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-transparent dark:text-slate-400'}`}>
              {win.won ? '🏆 ' : ''}{win.doneToday}/{win.dueToday} done today{win.won ? ' — you won the day' : ''}
            </div>
          )
        })()}
      </header>

      {/* Mobile tab bar */}
      <div className="flex md:hidden gap-1.5 mb-4 overflow-x-auto">
        {TABS.map((t) => (
          <button type="button" key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${tab === t ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-transparent dark:text-slate-400 dark:hover:bg-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Full-width Goal Map — only shown when there are active plans */}
      {compass.plans.some(p => p.status === 'active' || p.status === 'completed') && (
        <div className="mb-6">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">🗺 Goal Map</h2>
          <GoalMap
            plans={compass.plans}
            onNodeClick={(planId, actionId) => {
              // Switch to Plans tab on mobile when a node is clicked
              setTab('Plans')
            }}
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Notes column */}
        <section className={`${tab === 'Notes' ? 'block' : 'hidden'} md:block space-y-3 min-w-0`}>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">📓 Notes</h2>
          <NoteEditor
            notes={compass.notes}
            categories={compass.noteCategories}
            onAdd={(content, category) => compass.addNote({ content, category })}
            onUpdate={compass.updateNote}
            onDelete={compass.deleteNote}
            onClarifyToPlan={handleClarifyToPlan}
            onArchive={(id) => compass.updateNote(id, { status: 'archived' })}
            onRestore={(id) => compass.updateNote(id, { status: 'inbox' })}
            onSaveCards={compass.addFlashcards}
          />
        </section>

        {/* Plans column */}
        <section className={`${tab === 'Plans' ? 'block' : 'hidden'} md:block space-y-3 min-w-0`}>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">🎯 Plans</h2>
          
          {(questionTitle || draftTitle) && montyOpen ? (
            <p className="text-slate-500 text-sm italic">Finishing this up in Monty's panel →</p>
          ) : (
            <PlanWalkthrough
              questionTitle={questionTitle}
              draftTitle={draftTitle}
              draftActions={draftActions}
              confirmedPlan={confirmedPlan}
              onIntake={handleIntake}
              onAnswered={handleAnswered}
              onConfirm={handleConfirm}
              onCancel={handleCancelBreakdown}
              onStartAnother={() => setConfirmedPlan(null)}
            />
          )}

          {fitnessBridgeGoal && (
            <FitnessBridgeCard goal={fitnessBridgeGoal} onDismiss={() => setFitnessBridgeGoal(null)} />
          )}

          {compass.plans.length === 0 && <p className="text-slate-500 text-sm">No plans yet — say what you want to accomplish above.</p>}
          
          {compass.plans.map((p) => (
            <PlanCard key={p.id} plan={p} onDelete={compass.deletePlan} onLog={compass.logActionOutcome}
              onComplete={(id) => compass.updatePlanStatus(id, 'completed')} onCompleteWithNote={compass.completeWithNote} />
          ))}
        </section>

        {/* Cards column */}
        <section className={`${tab === 'Cards' ? 'block' : 'hidden'} md:block space-y-3 min-w-0`}>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">🧠 Cards</h2>
          <FlashcardReview dueCards={compass.dueFlashcards} totalCards={compass.flashcards.length} onReview={compass.reviewFlashcard} />
        </section>

        {/* Focus column */}
        <section className={`${tab === 'Focus' ? 'block' : 'hidden'} md:block space-y-3 min-w-0`}>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">⏱ Focus</h2>
          <PomodoroTimer settings={compass.settings} />
        </section>

        {/* Tutorials tab — mobile only; desktop shows the row below */}
        <section className={`${tab === 'Learn' ? 'block' : 'hidden'} md:hidden space-y-2`}>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">📚 Tutorials</h2>
          {TUTORIALS.map((t) => <TutorialCard key={t.title} data={t} />)}
        </section>
      </div>

      {/* Desktop-only tutorials row */}
      <div className="hidden md:block mt-6">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">📚 Tutorials</h2>
        <div className="grid grid-cols-3 gap-3">
          {TUTORIALS.map((t) => <TutorialCard key={t.title} data={t} />)}
        </div>
      </div>

      {/* Monty — coach/mentor/assistant, click to open */}
      {!montyOpen && (
        <button type="button" onClick={() => setMontyOpen(true)}
          className="fixed bottom-16 right-4 z-[1700] flex items-center gap-2 bg-sky-500 text-white font-semibold text-sm rounded-full pl-3 pr-4 py-2.5 shadow-lg shadow-sky-500/30 hover:bg-sky-400 hover:-translate-y-0.5 transition-all">
          <Sparkles size={16} /> Monty
        </button>
      )}

      {montyOpen && (
        <MontyPanel
          plans={compass.plans}
          notes={compass.notes}
          flashcards={compass.flashcards}
          dueFlashcards={compass.dueFlashcards}
          onClose={() => setMontyOpen(false)}
          questionTitle={questionTitle}
          draftTitle={draftTitle}
          draftActions={draftActions}
          onIntake={handleIntake}
          onAnswered={handleAnswered}
          onConfirm={handleConfirm}
          onCancelBreakdown={handleCancelBreakdown}
        />
      )}
    </div>
  )
}
