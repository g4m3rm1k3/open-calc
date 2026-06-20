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
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
      <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex items-center gap-2">
        <Sparkles className="text-emerald-400" size={18} />
        <h3 className="font-bold text-slate-200">Compass Coach</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
            <span className="animate-pulse">Coach is thinking...</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="relative">
          <input 
            type="text" 
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-3 pr-10 text-sm text-white focus:outline-none focus:border-sky-500"
            placeholder="Ask for system advice..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isThinking || isDownloading}
          />
          <button 
            onClick={handleSend}
            disabled={isThinking || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-sky-400 hover:text-sky-300 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
