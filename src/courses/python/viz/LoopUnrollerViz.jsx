import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';

export default function LoopUnrollerViz() {
  const steps = [
    {
      action: "Initialize accumulator",
      codeLeft: ["total = 0", "for i in range(1, 4):", "    total += i"],
      highlightLeft: 0,
      codeRight: ["total = 0"],
      vars: { total: "0", i: "undefined" },
      explanation: "Before the loop starts, we initialize our accumulator variable."
    },
    {
      action: "Loop enters",
      codeLeft: ["total = 0", "for i in range(1, 4):", "    total += i"],
      highlightLeft: 1,
      codeRight: ["total = 0", "# loop range: [1, 2, 3]"],
      vars: { total: "0", i: "undefined" },
      explanation: "The range(1, 4) generator will produce three values: 1, 2, and 3."
    },
    {
      action: "Iteration 1: bind",
      codeLeft: ["total = 0", "for i in range(1, 4):", "    total += i"],
      highlightLeft: 1,
      codeRight: ["total = 0", "", "i = 1"],
      vars: { total: "0", i: "1" },
      explanation: "Python takes the first value from the range and assigns it to 'i'."
    },
    {
      action: "Iteration 1: execute",
      codeLeft: ["total = 0", "for i in range(1, 4):", "    total += i"],
      highlightLeft: 2,
      codeRight: ["total = 0", "", "i = 1", "total += 1"],
      vars: { total: "1", i: "1" },
      explanation: "The loop body executes with i=1. total becomes 0 + 1 = 1."
    },
    {
      action: "Iteration 2: bind",
      codeLeft: ["total = 0", "for i in range(1, 4):", "    total += i"],
      highlightLeft: 1,
      codeRight: ["total = 0", "", "i = 1", "total += 1", "", "i = 2"],
      vars: { total: "1", i: "2" },
      explanation: "Python takes the next value from the range and assigns it to 'i'."
    },
    {
      action: "Iteration 2: execute",
      codeLeft: ["total = 0", "for i in range(1, 4):", "    total += i"],
      highlightLeft: 2,
      codeRight: ["total = 0", "", "i = 1", "total += 1", "", "i = 2", "total += 2"],
      vars: { total: "3", i: "2" },
      explanation: "The loop body executes with i=2. total becomes 1 + 2 = 3."
    },
    {
      action: "Iteration 3: bind",
      codeLeft: ["total = 0", "for i in range(1, 4):", "    total += i"],
      highlightLeft: 1,
      codeRight: ["total = 0", "", "i = 1", "total += 1", "", "i = 2", "total += 2", "", "i = 3"],
      vars: { total: "3", i: "3" },
      explanation: "Python takes the final value from the range and assigns it to 'i'."
    },
    {
      action: "Iteration 3: execute",
      codeLeft: ["total = 0", "for i in range(1, 4):", "    total += i"],
      highlightLeft: 2,
      codeRight: ["total = 0", "", "i = 1", "total += 1", "", "i = 2", "total += 2", "", "i = 3", "total += 3"],
      vars: { total: "6", i: "3" },
      explanation: "The loop body executes with i=3. total becomes 3 + 3 = 6."
    },
    {
      action: "Loop exits",
      codeLeft: ["total = 0", "for i in range(1, 4):", "    total += i"],
      highlightLeft: -1,
      codeRight: ["total = 0", "", "i = 1", "total += 1", "", "i = 2", "total += 2", "", "i = 3", "total += 3", "", "# loop ends"],
      vars: { total: "6", i: "3" },
      explanation: "The range is exhausted. The loop ends. Notice that 'i' still exists and holds the last value (3)!"
    }
  ];

  const [stepIdx, setStepIdx] = useState(0);
  const currentStep = steps[stepIdx];

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col font-sans">
      {/* Header section */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed min-h-[3rem]">
          {currentStep.explanation}
        </p>
      </div>

      {/* Visualization Canvas */}
      <div className="flex h-[360px] w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
        
        {/* Left Side: Original Code */}
        <div className="flex-1 p-6 border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/50 flex flex-col">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Original Code
          </div>
          <div className="font-mono text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {currentStep.codeLeft.map((line, idx) => (
              <div 
                key={idx} 
                className={`px-2 py-1 rounded ${currentStep.highlightLeft === idx ? 'bg-brand-100 text-brand-900 dark:bg-brand-900/40 dark:text-brand-300 font-bold border-l-2 border-brand-500' : 'border-l-2 border-transparent'}`}
              >
                {line}
              </div>
            ))}
          </div>

          <div className="mt-auto">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Memory State
             </div>
             <div className="flex gap-4">
               <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex-1 flex flex-col items-center">
                 <span className="text-xs text-slate-400 font-mono mb-1">total</span>
                 <span className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                   {currentStep.vars.total}
                 </span>
               </div>
               <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex-1 flex flex-col items-center">
                 <span className="text-xs text-slate-400 font-mono mb-1">i</span>
                 <span className={`text-xl font-mono font-bold ${currentStep.vars.i === 'undefined' ? 'text-slate-300 dark:text-slate-600' : 'text-indigo-600 dark:text-indigo-400'}`}>
                   {currentStep.vars.i}
                 </span>
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: Unrolled Execution */}
        <div className="flex-1 p-6 flex flex-col bg-white dark:bg-slate-900 overflow-y-auto relative">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 sticky top-0 bg-white dark:bg-slate-900 pb-2 z-10">
            Unrolled Execution
          </div>
          <div className="font-mono text-sm text-slate-700 dark:text-slate-300 flex flex-col gap-1">
            <AnimatePresence initial={false}>
              {currentStep.codeRight.map((line, idx) => (
                <motion.div
                  key={`${idx}-${line}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`${line === '' ? 'h-2' : ''} ${line.startsWith('#') ? 'text-slate-400 italic' : ''}`}
                >
                  {line}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Controls */}
      <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex gap-2">
          <span className="text-xs font-medium text-slate-400">
            Step {stepIdx + 1} of {steps.length}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStepIdx(0)}
            disabled={stepIdx === 0}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setStepIdx(s => Math.max(0, s - 1))}
            disabled={stepIdx === 0}
            className="px-4 py-2 rounded-lg flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <button
            onClick={() => setStepIdx(s => Math.min(steps.length - 1, s + 1))}
            disabled={stepIdx === steps.length - 1}
            className="px-5 py-2 rounded-lg flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50 transition-colors font-medium shadow-sm"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
