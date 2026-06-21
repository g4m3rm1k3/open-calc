import { useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function PlanIntake({ onSubmit }: { onSubmit: (title: string) => void }) {
  const [title, setTitle] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && title.trim()) {
      onSubmit(title.trim())
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-emerald-400" />
        <h3 className="font-bold text-slate-200">What do you want to accomplish?</h3>
      </div>
      <div className="relative">
        <input 
          autoFocus
          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          placeholder="e.g., Master Linear Algebra, Read Atomic Habits, Drink more water"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button 
          disabled={!title.trim()}
          onClick={() => onSubmit(title.trim())}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-500 hover:text-emerald-400 disabled:opacity-50 transition-colors"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
