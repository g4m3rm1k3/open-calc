import { useState } from 'react'
import { Compass as CompassIcon, Sparkles } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useCompass } from './useCompass'
import PlanIntake from './components/PlanIntake'
import IntakeQuestions from './components/IntakeQuestions'
import PlanBreakdown from './components/PlanBreakdown'
import PlanCard from './components/PlanCard'
import NoteEditor from './components/NoteEditor'
import TutorialCard from './components/TutorialCard'
import PomodoroTimer from './components/PomodoroTimer'
import FlashcardReview from './components/FlashcardReview'
import MontyPanel from './components/MontyPanel'
import GoalMap from './components/GoalMap'
import { isComplicated, type ActionDraft, type IntakeAnswers } from './playbooks'
import { computeDailyWin } from './montyStatus'

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
  
  const [montyOpen, setMontyOpen] = useState(false)

  // Complicated (multi-action) goals get sized by two real answers instead
  // of always defaulting to the same canned numbers — see IntakeQuestions
  // and isComplicated() in playbooks.ts. Simple ones skip straight to the
  // breakdown, since asking "hours/week" for "drink more water" is just
  // friction with nothing to size.
  const handleIntake = (title: string) => {
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
    compass.confirmPlan(title, drafts, reward)
    if (convertingNoteId) {
      compass.updateNote(convertingNoteId, { status: 'clarified' })
      setConvertingNoteId(null)
    }
    setDraftTitle(null)
    setDraftActions([])
  }

  const handleCancelBreakdown = () => {
    setConvertingNoteId(null)
    setQuestionTitle(null)
    setDraftTitle(null)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 pb-32 md:pb-8">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-400">
            <CompassIcon size={18} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100">Compass</h1>
            <p className="text-xs text-slate-500">Say what you want to accomplish — the system builds the plan</p>
          </div>
        </div>
        
        {(() => {
          const win = computeDailyWin(compass.plans)
          if (win.dueToday === 0) return null
          return (
            <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${win.won ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
              {win.won ? '🏆 ' : ''}{win.doneToday}/{win.dueToday} done today{win.won ? ' — you won the day' : ''}
            </div>
          )
        })()}
      </header>

      {/* Mobile tab bar */}
      <div className="flex md:hidden gap-1.5 mb-4 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${tab === t ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
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
          ) : questionTitle ? (
            <IntakeQuestions title={questionTitle} onContinue={handleAnswered} onCancel={handleCancelBreakdown} />
          ) : draftTitle ? (
            <PlanBreakdown title={draftTitle} initialDrafts={draftActions} onConfirm={handleConfirm} onCancel={handleCancelBreakdown} />
          ) : (
            <PlanIntake onSubmit={handleIntake} />
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
        <button onClick={() => setMontyOpen(true)}
          className="fixed bottom-16 right-4 z-[1700] flex items-center gap-2 bg-sky-500 text-slate-950 font-semibold text-sm rounded-full pl-3 pr-4 py-2.5 shadow-lg hover:bg-sky-400">
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
