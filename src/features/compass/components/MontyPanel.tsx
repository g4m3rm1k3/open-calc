import { useState } from 'react'
import { Zap, X, Send, Check, Calendar, Target, Compass, LayoutGrid, Dumbbell, Brain } from 'lucide-react'
import { useCompassAI, type AgentAction } from '../useCompassAI'
import { useCalendar } from '../../calendar/useCalendar'
import { useProgress } from '../../../hooks/useProgress'
import { useLocation, useNavigate } from 'react-router-dom'
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
    <div className="flex items-center justify-between gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/80 dark:border-cyan-500/30 rounded-xl px-3 py-2.5 text-xs shadow-md hover:shadow-cyan-500/10 transition-all duration-300">
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
        <span className="text-emerald-600 dark:text-emerald-400">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onConfirm}
          className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 dark:from-emerald-600 dark:to-teal-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-md shadow-emerald-500/20 hover:scale-105 transition-all"
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
  const navigate = useNavigate()

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

  const goTo = (path: string) => {
    onClose()
    navigate(path)
  }

  return (
    <div className="fixed inset-0 z-[1700] bg-slate-900/40 backdrop-blur-sm flex sm:inset-auto sm:bottom-[72px] sm:right-4 sm:bg-transparent sm:backdrop-blur-none sm:block">
    <div className="w-full h-full sm:w-[360px] sm:h-[620px] sm:max-h-[85vh] flex flex-col bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl sm:border border-white/40 dark:border-cyan-500/30 sm:rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(6,182,212,0.15)] overflow-hidden transition-all duration-500">
      {/* Header — electric theme; glow strength tracks how full the level meter is */}
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/80 to-cyan-50/50 dark:from-slate-800/60 dark:to-cyan-900/20 backdrop-blur-xl flex items-center justify-between shrink-0 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 dark:via-cyan-400/30 to-transparent" />
        <div className="flex items-center gap-2 relative z-10">
          <div
            className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center"
            style={{ filter: `drop-shadow(0 0 ${3 + (xpInLevel / 100) * 8}px rgba(0,212,255,${0.35 + (xpInLevel / 100) * 0.5}))` }}
          >
            <Zap className="text-cyan-400" size={14} fill="currentColor" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-none">Monty</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Your achievement operating system</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Stats bar — XP/level from quiz + checkpoint progress, learning time from foreground app time */}
      <div className="px-4 py-2 flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-cyan-100/70 border-b border-slate-200/50 dark:border-cyan-900/30 bg-white/40 dark:bg-slate-900/40 shrink-0 shadow-inner">
        <span className="text-cyan-600 dark:text-cyan-400">Lv {level}</span>
        <span>{xpInLevel}/100 XP</span>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <span>{formatLearningTime(learningMs)} learning time</span>
      </div>

      {/* Quick links — Monty is now the one way in to these destinations */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-slate-200/50 dark:border-cyan-900/30 bg-slate-50/30 dark:bg-slate-800/30 shrink-0 overflow-x-auto scrollbar-hide">
        {[
          { label: 'Compass', icon: Compass, path: '/compass' },
          { label: 'Courses', icon: LayoutGrid, path: '/' },
          { label: 'RPG Workout', icon: Dumbbell, path: '/rpg-workout' },
          { label: 'Brain', icon: Brain, path: '/brain' },
        ].map(({ label, icon: Icon, path }) => (
          <button
            key={path}
            onClick={() => goTo(path)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-cyan-100/80 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-cyan-900/50 hover:text-cyan-700 dark:hover:text-cyan-300 border border-slate-200/50 dark:border-cyan-500/20 shadow-sm hover:shadow-cyan-500/20 hover:scale-[1.03] active:scale-95 rounded-full px-3 py-1.5 whitespace-nowrap transition-all"
          >
            <Icon size={11} /> {label}
          </button>
        ))}
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
              <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200/80 dark:border-cyan-500/20 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <p className="font-bold text-slate-900 dark:text-white mb-1 relative z-10">What do you want to accomplish?</p>
                <p className="text-xs text-slate-500 dark:text-cyan-100/60 relative z-10">I'll build you a plan, schedule it, and hold you to it.</p>
              </div>
              <PlanIntake onSubmit={onIntake} />
              <div className="grid grid-cols-2 gap-2">
                {['How am I doing today?', 'What should I work on next?', 'Review my flashcards', 'Check my calendar'].map(q => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="text-left text-xs font-medium text-slate-600 dark:text-cyan-100/70 bg-white/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-cyan-500/20 rounded-xl px-3 py-2.5 hover:border-cyan-400/50 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/30 hover:text-cyan-700 dark:hover:text-cyan-300 hover:shadow-md hover:shadow-cyan-500/10 transition-all hover:-translate-y-0.5"
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
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                <div className={`px-3 py-2.5 rounded-xl max-w-[88%] text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 rounded-br-sm'
                    : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-cyan-500/20 border-l-2 dark:border-l-cyan-400 shadow-sm rounded-bl-sm'
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
              <div className="bg-slate-800/80 backdrop-blur-md border border-cyan-500/20 rounded-xl px-3 py-2.5 text-sm text-cyan-200/80 italic flex items-center gap-2 shadow-sm rounded-bl-sm animate-pulse">
                <span className="inline-flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                Compass is thinking…
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      {activeTab === 'chat' && (
        <div className="p-4 border-t border-slate-200/50 dark:border-cyan-900/30 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shrink-0">
          <div className="relative">
            <input
              type="text"
              className="w-full bg-white/80 dark:bg-slate-950/50 border border-slate-300/80 dark:border-cyan-500/30 rounded-2xl py-3 pl-4 pr-11 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-cyan-700/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 shadow-inner transition-all duration-300"
              placeholder="Goal or question — e.g. 'master linear algebra'"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={isThinking || isDownloading}
            />
            <button
              onClick={handleSend}
              disabled={isThinking || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-cyan-500 hover:text-cyan-400 dark:text-cyan-400 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 rounded-lg disabled:opacity-40 transition-colors"
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
