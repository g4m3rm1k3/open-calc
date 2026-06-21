import { useState } from 'react'
import type { IntakeAnswers } from '../playbooks'

export default function IntakeQuestions({ 
  title, 
  onContinue, 
  onCancel 
}: { 
  title: string, 
  onContinue: (answers: IntakeAnswers) => void,
  onCancel: () => void
}) {
  const [hours, setHours] = useState<number>(3)
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
      <h3 className="font-bold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 mb-6">Let's size this plan. A few quick questions.</p>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            How many hours per week can you commit?
          </label>
          <input 
            type="range" 
            min="1" max="20" 
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="text-sm font-bold text-emerald-400 mt-1">{hours} hours / week</div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Current Level
          </label>
          <div className="flex gap-2">
            {(['beginner', 'intermediate', 'advanced'] as const).map(l => (
              <button 
                key={l}
                onClick={() => setLevel(l)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize border transition-colors ${
                  level === l 
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200">
            Cancel
          </button>
          <button 
            onClick={() => onContinue({ hoursPerWeek: hours, level })}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-bold transition-colors"
          >
            Generate Breakdown →
          </button>
        </div>
      </div>
    </div>
  )
}
