import React, { useState } from 'react';
import KatexBlock from '../math/KatexBlock.jsx';
import KatexInline from '../math/KatexInline.jsx';
import { parseProse } from './IntegratedLesson.jsx';

export default function StepThrough({ steps = [], title, initialStep = 0 }) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const maxStep = steps.length - 1;

  if (steps.length === 0) return null;

  return (
    <div className="bg-surface border border-border shadow-sm rounded-xl mb-8 overflow-hidden">
      {/* Header */}
      {title && (
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-border">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">{title}</h3>
        </div>
      )}

      <div className="p-6">
        <div className="relative min-h-[160px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-[#0f172a] mb-6">
          <div className="w-full text-center transition-all duration-300">
             {steps[currentStep].expression && (
               <div className="text-2xl font-bold mb-4">
                 <KatexBlock expr={steps[currentStep].expression} />
               </div>
             )}
             <div className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto italic prose-content px-2">
                 {parseProse(steps[currentStep].annotation)}
             </div>
          </div>
        </div>

        {/* Scrub Bar Control */}
        <div className="w-full flex flex-col items-center gap-2">
            <div className="flex justify-between w-full text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                <span>Start</span>
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>Finish</span>
            </div>
            <input 
               type="range"
               min={0}
               max={maxStep}
               value={currentStep}
               onChange={(e) => setCurrentStep(parseInt(e.target.value))}
               className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-600 transition-colors"
            />
            <div className="flex gap-4 mt-4">
                <button 
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  className="px-4 py-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-colors font-medium text-sm"
                >
                    ← Prev Step
                </button>
                <button 
                  disabled={currentStep === maxStep}
                  onClick={() => setCurrentStep(Math.min(maxStep, currentStep + 1))}
                  className="px-4 py-1.5 rounded bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-30 transition-colors font-medium text-sm"
                >
                    Next Step →
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
