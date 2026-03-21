import React, { useState } from 'react';
import KatexBlock from '../math/KatexBlock.jsx';
import { parseProse } from './IntegratedLesson.jsx';
import VizFrame from '../viz/VizFrame.jsx';

export default function ScrubbableExample({ example, number }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = example.steps || [];
  const maxStep = steps.length - 1;

  if (steps.length === 0) return null;

  return (
    <div className="example-block bg-surface border border-border shadow-sm rounded-xl mb-8 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-border flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-slate-200">
          Example {number}: {example.title}
        </h3>
      </div>

      <div className="p-6">
        {/* The Problem Statement */}
        <div className="mb-6 p-4 bg-brand-50 dark:bg-brand-900/20 text-brand-900 dark:text-brand-100 rounded-lg border border-brand-100 dark:border-brand-800 font-medium">
          <span className="leading-relaxed">{parseProse(example.problem)}</span>
        </div>

        {/* The Scrubbable Content Area */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
           {/* Left/Main: Math Viewer */}
           <div className={`relative min-h-[160px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-[#0f172a] ${example.visualizationId ? 'lg:w-[55%]' : 'w-full'}`}>
             <div className="w-full text-center transition-all duration-300">
                <div className="text-2xl font-bold mb-4">
                    <KatexBlock expr={steps[currentStep].expression} />
                </div>
                <div className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto italic prose-content px-2">
                    {parseProse(steps[currentStep].annotation)}
                </div>
             </div>
           </div>

           {/* Right: Synced Interactive System */}
           {example.visualizationId && (
              <div className="lg:w-[45%] border-2 border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-[#1e293b] p-2 relative flex items-center justify-center min-h-[250px] overflow-hidden">
                 <div className="absolute top-2 left-2 bg-brand-100 text-brand-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm opacity-80 z-10">Synced Graphic</div>
                 <div className="w-full zoom-in-95 pointer-events-none">
                     <VizFrame id={example.visualizationId} initialProps={{...example.params, currentStep}} title={null} />
                 </div>
              </div>
           )}
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
                  className="px-4 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 transition-colors font-medium text-sm"
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

        {/* Conclusion visible only at end */}
        <div className={`mt-8 overflow-hidden transition-all duration-500 ${currentStep === maxStep ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg text-green-900 dark:text-green-100">
                <strong>Conclusion:</strong> <span className="leading-relaxed">{parseProse(example.conclusion)}</span>
            </div>
        </div>

      </div>
    </div>
  );
}
