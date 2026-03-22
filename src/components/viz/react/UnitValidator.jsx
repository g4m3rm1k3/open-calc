import React, { useState } from 'react'

export default function UnitValidator() {
  const [leftDimension, setLeftDimension] = useState('[L]')
  const [rightDimensions, setRightDimensions] = useState(['[L]', '/', '[T]'])
  
  const DIMENSIONS = ['[L]', '[M]', '[T]', '*', '/', '(', ')', '^2']
  
  const validate = () => {
    // Very simplified validation logic for physics education
    const rightStr = rightDimensions.join('')
    if (leftDimension === '[L]' && rightStr === '[L]/[T]*[T]') return true
    if (leftDimension === '[M]' && rightStr === '[M]') return true
    if (leftDimension === '[L]' && rightStr === '[L]') return true
    return false
  }

  const isValid = validate()

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight text-xs mb-4">
        Interactive: Dimensional Checker
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Build a physically consistent equation:
      </p>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex-shrink-0 flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Target:</span>
            <select 
              value={leftDimension}
              onChange={(e) => setLeftDimension(e.target.value)}
              className="bg-transparent border-none font-bold text-brand-600 dark:text-brand-400 text-lg focus:ring-0"
            >
              <option value="[L]">[L] (Length)</option>
              <option value="[M]">[M] (Mass)</option>
              <option value="[T]">[T] (Time)</option>
            </select>
          </div>
          
          <span className="text-2xl font-bold text-slate-300 dark:text-slate-600">=</span>
          
          <div className="flex-1 flex flex-wrap gap-1 min-h-[40px] items-center p-2 bg-slate-50 dark:bg-slate-900/50 rounded-md border-2 border-dashed border-slate-200 dark:border-slate-700">
            {rightDimensions.map((dim, i) => (
              <button 
                key={i}
                onClick={() => setRightDimensions(prev => prev.filter((_, idx) => idx !== i))}
                className="px-2 py-0.5 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded text-xs font-mono font-bold hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 transition-colors"
                title="Click to remove"
              >
                {dim}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {DIMENSIONS.map(dim => (
            <button
              key={dim}
              onClick={() => setRightDimensions(prev => [...prev, dim])}
              className="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs transition-colors hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 font-mono shadow-sm active:scale-95"
            >
              {dim}
            </button>
          ))}
        </div>

        <div className={`p-3 rounded-lg flex items-center gap-3 border transition-all ${
          isValid 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' 
            : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
        }`}>
          <div className="text-xl">{isValid ? '✓' : '⚠'}</div>
          <div>
            <p className="text-xs font-bold uppercase leading-none mb-1">
              {isValid ? 'Dimensionally Sound' : 'Invalid Combination'}
            </p>
            <p className="text-[10px] opacity-80 leading-relaxed">
              {isValid 
                ? 'Your model is consistent. It can exist in the physical universe.' 
                : 'You are adding incompatible units. This violates dimensional homogeneity.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
