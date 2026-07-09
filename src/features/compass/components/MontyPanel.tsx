import { useState } from 'react'
import { Sparkles, X, Send, Check, Calendar, Target } from 'lucide-react'
import { useCompassAI, type AgentAction } from '../useCompassAI'
import { useCalendar } from '../../calendar/useCalendar'
import { useProgress } from '../../../hooks/useProgress'
import { useLocation } from 'react-router-dom'
import type { Plan, Note, Flashcard } from '../types'
import type { ActionDraft, IntakeAnswers } from '../playbooks'
import type { AppContext } from '../buildAgentContext'
import PlanIntake from './PlanIntake'
import IntakeQuestions from './IntakeQuestions'
import PlanBreakdown from './PlanBreakdown'
import GoalMap from './GoalMap'
import { computeDailyWin, computeXp, xpToLevel } from '../montyStatus'
import { useLearningTime, formatLearningTime } from '../useLearningTime'

interface MontyPanelProps {
  plans: Plan[]
  notes: Note[]
  flashcards: Flashcard[]
  dueFlashcards: Flashcard[]
  onClose: () => void
  questionTitle: string | null
  draftTitle: string | null
  draftActions: ActionDraft[]
  onIntake: (t: string) => void
  onAnswered: (a: IntakeAnswers) => void
  onConfirm: (t: string, d: ActionDraft[], r?: string) => void
  onCancelBreakdown: () => void
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  actions?: AgentAction[]
}

function ActionConfirmCard({
  action,
  onConfirm,
  onDismiss,
}: {
  action: AgentAction
  onConfirm: () => void
  onDismiss: () => void
}) {
  const label =
    action.type === 'add_calendar_event'
      ? `Add to calendar: "${action.title}" on ${action.start?.split('T')[0]} @ ${action.start?.split('T')[1]?.slice(0, 5)}`
      : action.type === 'create_plan'
      ? `Create plan: "${action.title}"`
      : `Log action as done`

  const icon =
    action.type === 'add_calendar_event' ? <Calendar size={13} /> :
    action.type === 'create_plan' ? <Target size={13} /> :
    <Check size={13} />

  return (
    <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-emerald-500/20 rounded-xl px-3 py-2.5 text-xs shadow-sm">
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
        <span className="text-emerald-600 dark:text-emerald-400">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onConfirm}
          className="bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm shadow-emerald-500/20 transition-all"
        >
          Do it
        </button>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}

export default function MontyPanel({
  plans,
  notes,
  flashcards,
  dueFlashcards,
  onClose,
  questionTitle,
  draftTitle,
  draftActions,
  onIntake,
  onAnswered,
  onConfirm,
  onCancelBreakdown,
}: MontyPanelProps) {
  const { askWithContext, isThinking, isDownloading, downloadProgress } = useCompassAI()
  const { addEvent } = useCalendar()
  const { progress } = useProgress() as unknown as { progress: Record<string, any> }
  const location = useLocation()

  const [input, setInput] = useState('')
  const [chatLog, setChatLog] = useState<ChatMessage[]>([])
  const [dismissedActions, setDismissedActions] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'chat' | 'map'>('chat')

  const win = computeDailyWin(plans)
  const xp = computeXp(progress)
  const { level, xpInLevel } = xpToLevel(xp)
  const learningMs = useLearningTime()

  const buildContext = (): AppContext => ({
    currentPage: location.pathname,
    plans,
    notes,
    flashcards,
    dueFlashcards,
    calendarEvents: [], // populated from useCalendar if needed — kept empty here to avoid re-render loop
    progress,
  })

  // Detect whether input looks like a goal (route to plan) or a question (route to AI).
  // A goal is an action phrase without question words — "master linear algebra",
  // "run a 5k", "ship my side project". A question starts with how/what/why/etc.
  const isGoalLike = (text: string): boolean => {
    const lower = text.toLowerCase().trim()
    const questionWords = /^(how|what|why|when|where|who|is|are|was|were|can|could|should|would|will|do|does|did|tell|show|check|review|explain|help|am i|give me)/
    const goalWords = /\b(learn|master|study|read|build|create|ship|write|finish|complete|run|work out|exercise|get fit|meditate|practice|improve|start|launch|develop|make|achieve)\b/
    if (questionWords.test(lower)) return false
    if (goalWords.test(lower)) return true
    // Short phrase without a verb that sounds like a question → assume goal
    return lower.split(' ').length <= 7 && !lower.includes('?')
  }

  const handleSend = async () => {
    if (!input.trim() || isThinking) return
    const q = input.trim()
    setInput('')

    // Route goals to the plan creation flow — not the AI
    if (isGoalLike(q) && !questionTitle && !draftTitle) {
      onIntake(q)
      return
    }

    setChatLog(prev => [...prev, { role: 'user', content: q }])
    const result = await askWithContext(q, buildContext())
    setChatLog(prev => [
      ...prev,
      { role: 'assistant', content: result.text, actions: result.actions },
    ])
  }

  const executeAction = async (action: AgentAction, msgIdx: number, actionIdx: number) => {
    const key = `${msgIdx}-${actionIdx}`

    if (action.type === 'add_calendar_event' && action.title && action.start) {
      const end = new Date(
        new Date(action.start).getTime() + (action.durationMinutes ?? 30) * 60_000
      ).toISOString()
      addEvent({
        title: action.title,
        description: action.description,
        start: action.start,
        end,
        allDay: false,
        type: 'goal',
        notifications: [15],
      })
    } else if (action.type === 'create_plan' && action.title) {
      onIntake(action.title)
    }

    setDismissedActions(prev => new Set(prev).add(key))
  }

  const hasActivePlans = plans.some(p => p.status === 'active')

  return (
    <div className="fixed inset-0 z-[1700] bg-slate-900/40 backdrop-blur-sm flex sm:inset-auto sm:bottom-4 sm:right-4 sm:bg-transparent sm:backdrop-blur-none sm:block">
    <div className="w-full h-full sm:w-[360px] sm:h-[620px] sm:max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 sm:border border-slate-200 dark:border-slate-700 sm:rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 backdrop-blur flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center">
            <Sparkles className="text-sky-400" size={14} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-none">Compass</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Your achievement operating system</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Stats bar — XP/level from quiz + checkpoint progress, learning time from foreground app time */}
      <div className="px-4 py-2 flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <span className="text-sky-600 dark:text-sky-400">Lv {level}</span>
        <span>{xpInLevel}/100 XP</span>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <span>{formatLearningTime(learningMs)} learning time</span>
      </div>

      {/* Daily Win Bar */}
      {win.dueToday > 0 && (
        <div className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 shrink-0 border-b border-slate-200 dark:border-slate-800 ${win.won ? 'bg-emerald-50/80 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-slate-50/50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'}`}>
          {win.won ? '🏆' : '🎯'}
          <span>{win.doneToday} / {win.dueToday} actions done today{win.won ? ' — you won the day!' : ''}</span>
        </div>
      )}

      {/* Tabs */}
      {hasActivePlans && (
        <div className="flex border-b border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2.5 text-xs font-bold transition-all ${activeTab === 'chat' ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-500 bg-sky-50/50 dark:bg-sky-900/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-2.5 text-xs font-bold transition-all ${activeTab === 'map' ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-500 bg-sky-50/50 dark:bg-sky-900/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            Goal Map
          </button>
        </div>
      )}

      {/* Map Tab */}
      {activeTab === 'map' && hasActivePlans && (
        <div className="flex-1 overflow-y-auto p-3">
          <GoalMap plans={plans} />
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
          {/* Inline plan creation flow */}
          {questionTitle && (
            <IntakeQuestions title={questionTitle} onContinue={onAnswered} onCancel={onCancelBreakdown} />
          )}
          {draftTitle && !questionTitle && (
            <PlanBreakdown
              title={draftTitle}
              initialDrafts={draftActions}
              onConfirm={(t, d, r) => { onConfirm(t, d, r); onClose() }}
              onCancel={onCancelBreakdown}
            />
          )}

          {/* Empty state */}
          {chatLog.length === 0 && !questionTitle && !draftTitle && (
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 text-sm text-slate-700 dark:text-slate-300 shadow-sm">
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">What do you want to accomplish?</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">I'll build you a plan, schedule it, and hold you to it.</p>
              </div>
              <PlanIntake onSubmit={onIntake} />
              <div className="grid grid-cols-2 gap-2">
                {['How am I doing today?', 'What should I work on next?', 'Review my flashcards', 'Check my calendar'].map(q => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="text-left text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3 py-2.5 hover:border-sky-500/40 hover:shadow-sm transition-all hover:-translate-y-0.5"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {chatLog.map((msg, msgIdx) => (
            <div key={msgIdx} className="space-y-2">
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2.5 rounded-xl max-w-[88%] text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 shadow-sm'
                }`}>
                  {msg.content || (msg.actions?.length ? '↓ Suggested actions:' : '(no response)')}
                </div>
              </div>

              {/* Proposed action cards */}
              {msg.role === 'assistant' && msg.actions && msg.actions.length > 0 && (
                <div className="space-y-1.5 ml-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compass suggests:</p>
                  {msg.actions.map((action, actionIdx) => {
                    const key = `${msgIdx}-${actionIdx}`
                    if (dismissedActions.has(key)) return null
                    return (
                      <ActionConfirmCard
                        key={key}
                        action={action}
                        onConfirm={() => executeAction(action, msgIdx, actionIdx)}
                        onDismiss={() => setDismissedActions(prev => new Set(prev).add(key))}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          {isDownloading && (
            <div className="text-xs text-sky-400 bg-sky-900/20 rounded-lg px-3 py-2">
              {downloadProgress}
            </div>
          )}

          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-2.5 text-sm text-slate-400 italic flex items-center gap-2">
                <span className="inline-flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                Compass is thinking…
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      {activeTab === 'chat' && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
          <div className="relative">
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-4 pr-11 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              placeholder="Goal or question — e.g. 'master linear algebra'"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={isThinking || isDownloading}
            />
            <button
              onClick={handleSend}
              disabled={isThinking || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-700 rounded-lg disabled:opacity-40 transition-colors"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}
