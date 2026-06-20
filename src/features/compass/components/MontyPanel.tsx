import { useState } from 'react'
import { Sparkles, X, Send } from 'lucide-react'
import { useCompassAI } from '../useCompassAI'
import type { Plan } from '../types'
import type { ActionDraft, IntakeAnswers } from '../playbooks'
import PlanIntake from './PlanIntake'
import IntakeQuestions from './IntakeQuestions'
import PlanBreakdown from './PlanBreakdown'
import { computeDailyWin } from '../montyStatus'

export default function MontyPanel({
  plans,
  onClose,
  questionTitle,
  draftTitle,
  draftActions,
  onIntake,
  onAnswered,
  onConfirm,
  onCancelBreakdown
}: {
  plans: Plan[]
  onClose: () => void
  questionTitle: string | null
  draftTitle: string | null
  draftActions: ActionDraft[]
  onIntake: (t: string) => void
  onAnswered: (a: IntakeAnswers) => void
  onConfirm: (t: string, d: ActionDraft[], r?: string) => void
  onCancelBreakdown: () => void
}) {
  const { ask, isThinking, isDownloading, downloadProgress } = useCompassAI()
  const [input, setInput] = useState('')
  const [chatLog, setChatLog] = useState<{role: string, content: string}[]>([])

  const win = computeDailyWin(plans)

  const handleSend = async () => {
    if (!input.trim() || isThinking) return
    const q = input
    setInput('')
    setChatLog(prev => [...prev, { role: 'user', content: q }])
    
    // Provide a simple string representation of the user's systems/habits
    const contextStr = `Active Plans: ${plans.map(s => s.title).join(', ')}\nDue Today: ${win.dueToday}\nDone Today: ${win.doneToday}`
    const response = await ask(q, contextStr)
    setChatLog(prev => [...prev, { role: 'assistant', content: response }])
  }

  return (
    <div className="fixed bottom-4 right-4 z-[1700] w-[350px] h-[600px] max-h-[80vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-3 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-sky-400" size={16} />
          <h3 className="font-bold text-slate-200 text-sm">Monty (Compass Coach)</h3>
        </div>
        <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-300">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatLog.length === 0 && !questionTitle && !draftTitle && (
          <div className="bg-slate-800/50 rounded-xl p-4 text-sm text-slate-300 space-y-3">
            <p>Hi, I'm Monty. Let's design a system to get you to your desired transformation.</p>
            <PlanIntake onSubmit={onIntake} />
          </div>
        )}

        {questionTitle && (
          <IntakeQuestions title={questionTitle} onContinue={onAnswered} onCancel={onCancelBreakdown} />
        )}

        {draftTitle && (
          <PlanBreakdown title={draftTitle} initialDrafts={draftActions} onConfirm={(t, d, r) => {
            onConfirm(t, d, r)
            onClose() // Close monty after confirming a plan
          }} onCancel={onCancelBreakdown} />
        )}

        {isDownloading && (
          <div className="text-xs text-sky-400 p-2 bg-sky-900/20 rounded-lg">
            {downloadProgress}
          </div>
        )}
        
        {chatLog.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-3 py-2 rounded-xl max-w-[85%] text-sm ${
              msg.role === 'user' 
                ? 'bg-sky-600 text-white' 
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isThinking && (
          <div className="text-sm text-slate-500 italic flex items-center gap-2">
            <span className="animate-pulse">Monty is thinking...</span>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <div className="relative">
          <input 
            type="text" 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-3 pr-10 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
            placeholder="Ask Monty for advice..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isThinking || isDownloading}
          />
          <button 
            onClick={handleSend}
            disabled={isThinking || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-sky-400 hover:text-sky-300 disabled:opacity-50 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
