import { useState } from 'react'
import { Sparkles, Send } from 'lucide-react'
import { useCompassAI } from '../useCompassAI'

export default function CompassCoachPanel({ storeContext }) {
  const { ask, isThinking, isDownloading, downloadProgress } = useCompassAI()
  const [input, setInput] = useState('')
  const [chatLog, setChatLog] = useState([
    { role: 'assistant', content: "Hi! I'm your Compass Coach. Let's design some systems based on Atomic Habits and Deep Work. What are you trying to accomplish?" }
  ])

  const handleSend = async () => {
    if (!input.trim() || isThinking) return
    const q = input
    setInput('')
    setChatLog(prev => [...prev, { role: 'user', content: q }])
    
    // Provide a simple string representation of the user's systems/habits
    const contextStr = `Systems: ${storeContext.systems.map(s => s.title).join(', ')}\nHabits: ${storeContext.habits.map(h => h.routine).join(', ')}`

    const response = await ask(q, contextStr)
    setChatLog(prev => [...prev, { role: 'assistant', content: response }])
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex items-center gap-2">
        <Sparkles className="text-emerald-600 dark:text-emerald-400" size={18} />
        <h3 className="font-bold text-slate-900 dark:text-slate-200">Compass Coach</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isDownloading && (
          <div className="text-xs text-sky-400 p-2 bg-sky-900/20 rounded-lg">
            {downloadProgress}
          </div>
        )}
        
        {chatLog.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-sky-500 text-white shadow-sky-500/20' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="text-sm text-slate-500 italic flex items-center gap-2">
            <span className="animate-pulse">Coach is thinking...</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="relative">
          <input 
            type="text" 
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-4 pr-11 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
            placeholder="Ask for system advice..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isThinking || isDownloading}
          />
          <button 
            onClick={handleSend}
            disabled={isThinking || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
