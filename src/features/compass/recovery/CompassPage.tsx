export const meta = {
export const meta = {
  title: 'Compass',
  title: 'Compass',
  description: 'An accomplish system, not a tracker: state a goal, the system proposes a real breakdown, schedules it on the calendar, and (Slice 2+) holds you accountable for it.',
  description: 'A personal operating system integrating Atomic Habits and Deep Work principles.',
  concept: 'Feature Module',
  concept: 'Feature Module',
  conceptDetail: 'Self-contained feature with its own types, CRUD hook, and components. The rest of the app only knows the /compass route and the compass-quick tool overlay — everything else is internal.',
  conceptDetail: 'Self-contained feature with its own types, CRUD hook, and components.',
  jumpTo: '/compass',
  jumpTo: '/compass',
}
}
import { useState } from 'react'
import { useState } from 'react'
import { Compass as CompassIcon, Sparkles } from 'lucide-react'
import { Compass as CompassIcon, Plus, Target, Repeat } from 'lucide-react'
import { useCompass } from './useCompass'
import { useCompass } from './useCompass'
import PlanIntake from './components/PlanIntake'
import CompassCoachPanel from './components/CompassCoachPanel'
import IntakeQuestions from './components/IntakeQuestions'
import PlanBreakdown from './components/PlanBreakdown'
import PlanCard from './components/PlanCard'
import NoteEditor from './components/NoteEditor'
import TutorialCard from './components/TutorialCard'
import PomodoroTimer from './components/PomodoroTimer'
import FlashcardReview from './components/FlashcardReview'
import MontyPanel from './components/MontyPanel'
import { isComplicated, type ActionDraft, type IntakeAnswers } from './playbooks'
import { computeDailyWin } from './montyStatus'
import atomicHabits from './tutorials/atomic-habits.js'
import deepWork from './tutorials/deep-work.js'
import gtd from './tutorials/gtd.js'
import systemsThinking from './tutorials/systems-thinking.js'
import pomodoro from './tutorials/pomodoro.js'
import spacedRepetition from './tutorials/spaced-repetition.js'
const TUTORIALS = [atomicHabits, deepWork, gtd, systemsThinking, pomodoro, spacedRepetition]
const TABS = ['Notes', 'Plans', 'Cards', 'Focus', 'Learn'] as const
type Tab = typeof TABS[number]
export default function CompassPage() {
export default function CompassPage() {
  const compass = useCompass()
  const compass = useCompass()
  const [tab, setTab] = useState<Tab>('Plans')
  const [newSystemTitle, setNewSystemTitle] = useState('')
  const [questionTitle, setQuestionTitle] = useState<string | null>(null)
  const [newHabitRoutine, setNewHabitRoutine] = useState('')
  const [draftTitle, setDraftTitle] = useState<string | null>(null)
  const [draftActions, setDraftActions] = useState<ActionDraft[]>([])
  const [convertingNoteId, setConvertingNoteId] = useState<string | null>(null)
  const [montyOpen, setMontyOpen] = useState(false)
  // Complicated (multi-action) goals get sized by two real answers instead
  const handleAddSystem = () => {
  // of always defaulting to the same canned numbers — see IntakeQuestions
    if (!newSystemTitle.trim()) return
  // and isComplicated() in playbooks.ts. Simple ones skip straight to the
    compass.addSystem("I am a person who...", newSystemTitle, "My core routine...")
  // breakdown, since asking "hours/week" for "drink more water" is just
    setNewSystemTitle('')
  // friction with nothing to size.
  const handleIntake = (title: string) => {
    if (isComplicated(title)) {
      setQuestionTitle(title)
    } else {
      setDraftTitle(title)
      setDraftActions(compass.proposePlan(title))
    }
  }
  }
  const handleAnswered = (answers: IntakeAnswers) => {
  const handleAddHabit = () => {
    if (!questionTitle) return
    if (!newHabitRoutine.trim()) return
    setDraftTitle(questionTitle)
    compass.addHabit("After I...", newHabitRoutine, "I will feel...", "Do 2 minutes of...")
    setDraftActions(compass.proposePlan(questionTitle, answers))
    setNewHabitRoutine('')
    setQuestionTitle(null)
  }
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
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 pb-32 md:pb-8">
    <div className="flex h-[calc(100vh-52px)] bg-slate-950 text-slate-200">
      <header className="flex items-center justify-between mb-6">
      {/* Main Content Area */}
        <div className="flex items-center gap-2.5">
      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-400">
        <header className="flex items-center gap-3 mb-10">
            <CompassIcon size={18} />
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <CompassIcon size={24} />
          </div>
          </div>
          <div>
          <div>
            <h1 className="text-xl font-black text-slate-100">Compass</h1>
            <h1 className="text-2xl font-black text-slate-100">Compass</h1>
            <p className="text-xs text-slate-500">Say what you want to accomplish — the system builds the plan</p>
            <p className="text-sm text-slate-500">Design your systems. Track your habits.</p>
          </div>
          </div>
        </div>
        </header>
        {(() => {
          const win = computeDailyWin(compass.plans)
        <div className="grid lg:grid-cols-2 gap-8">
          if (win.dueToday === 0) return null
          
          return (
          {/* Systems Column */}
            <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${win.won ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
          <section>
              {win.won ? '🏆 ' : ''}{win.doneToday}/{win.dueToday} done today{win.won ? ' — you won the day' : ''}
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Target size={16} /> Systems
            </h2>
            <div className="space-y-4">
              {compass.systems.map(sys => (
                <div key={sys.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative group">
                  <button onClick={() => compass.deleteSystem(sys.id)} className="absolute top-3 right-3 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  <p className="text-xs text-emerald-500 italic mb-1">{sys.identity}</p>
                  <h3 className="font-bold text-white text-lg">{sys.title}</h3>
                  <p className="text-sm text-slate-400 mt-2">{sys.routine}</p>
                </div>
              ))}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newSystemTitle} 
                  onChange={e => setNewSystemTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddSystem()}
                  placeholder="New System (e.g., Master Mathematics)" 
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
                <button onClick={handleAddSystem} className="bg-emerald-600 text-white px-3 rounded-lg hover:bg-emerald-500 transition-colors">
                  <Plus size={18} />
                </button>
              </div>
            </div>
            </div>
          )
          </section>
        })()}
      </header>
      {/* Mobile tab bar */}
          {/* Habits Column */}
      <div className="flex md:hidden gap-1.5 mb-4 overflow-x-auto">
          <section>
        {TABS.map((t) => (
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
          <button key={t} onClick={() => setTab(t)}
              <Repeat size={16} /> Habits
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${tab === t ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
            </h2>
            {t}
            <div className="space-y-4">
          </button>
              {compass.habits.map(habit => (
        ))}
                <div key={habit.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative group">
      </div>
                  <button onClick={() => compass.deleteHabit(habit.id)} className="absolute top-3 right-3 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  <h3 className="font-bold text-white">{habit.routine}</h3>
                  <div className="text-xs text-slate-500 mt-2 space-y-1">
                    <p><span className="text-slate-400">Cue:</span> {habit.cue}</p>
                    <p><span className="text-slate-400">2-Min Rule:</span> {habit.twoMinVersion}</p>
                  </div>
                  <div className="mt-4 flex gap-1">
                    {/* Render a 7-day streak block */}
                    {Array.from({ length: 7 }).map((_, i) => {
                      const d = new Date()
                      d.setDate(d.getDate() - (6 - i))
                      const iso = d.toISOString().split('T')[0]
                      const done = habit.streak.includes(iso)
                      return (
                        <button 
                          key={iso} 
                          onClick={() => compass.toggleHabitStreak(habit.id, iso)}
                          title={iso}
                          className={`w-6 h-6 rounded-md border ${done ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newHabitRoutine} 
                  onChange={e => setNewHabitRoutine(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
                  placeholder="New Habit (e.g., Read 10 pages)" 
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
                <button onClick={handleAddHabit} className="bg-emerald-600 text-white px-3 rounded-lg hover:bg-emerald-500 transition-colors">
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </section>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        </div>
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
      </div>
      {/* Desktop-only tutorials row */}
      {/* Persistent AI Coach Panel on the Right */}
      <div className="hidden md:block mt-6">
      <div className="w-80 hidden md:block shrink-0 border-l border-slate-800">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">📚 Tutorials</h2>
        <CompassCoachPanel storeContext={compass} />
        <div className="grid grid-cols-3 gap-3">
          {TUTORIALS.map((t) => <TutorialCard key={t.title} data={t} />)}
        </div>
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
    </div>
  )
  )
}