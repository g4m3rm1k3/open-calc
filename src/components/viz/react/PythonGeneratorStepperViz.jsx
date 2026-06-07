import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    id: 'intro',
    title: '1. Normal Functions',
    description: 'A normal function runs top-to-bottom and returns a single value. When it returns, all its local variables are destroyed.',
    code: `def count_to_two():
    n = 1
    print(n)
    n = 2
    return n

result = count_to_two()
# Execution finished. n is destroyed.`
  },
  {
    id: 'yield',
    title: '2. The Yield Keyword',
    description: 'A generator function uses the "yield" keyword instead of return. When called, it doesn\'t run the code immediately; it returns a generator object.',
    code: `def generate_two():
    n = 1
    yield n
    n = 2
    yield n

gen = generate_two()
# gen is now a generator object.`
  },
  {
    id: 'suspend',
    title: '3. State Suspension (Freezing)',
    description: 'When you call next(gen), the function runs until the first yield. It then "freezes" its local variables in memory and yields the value back to you.',
    code: `val1 = next(gen)
# Runs: n = 1; yield n
# val1 is 1

# The function is paused! 
# The local variable n=1 is still alive.`
  },
  {
    id: 'resume',
    title: '4. Resumption (Thawing)',
    description: 'When you call next(gen) again, the function wakes up right where it left off, with all its local variables perfectly intact.',
    code: `val2 = next(gen)
# Resumes after the first yield!
# Runs: n = 2; yield n
# val2 is 2

# This allows processing huge datasets
# one piece at a time without running 
# out of memory.`
  }
];

export default function PythonGeneratorStepperViz() {
  const [stepIdx, setStepIdx] = useState(0);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-sans">
      <h3 className="text-lg font-semibold mb-1 text-slate-800 dark:text-slate-100">Generator State Walkthrough</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Follow the steps to understand how generators pause and resume execution.
      </p>

      {/* Stepper Dots */}
      <div className="flex gap-1 mb-4">
        {STEPS.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setStepIdx(i)}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i === stepIdx ? 'bg-fuchsia-500' : i < stepIdx ? 'bg-fuchsia-300 dark:bg-fuchsia-800' : 'bg-slate-200 dark:bg-slate-700'}`} 
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Left Column: Code and Explanation */}
        <div className="flex flex-col gap-3">
          <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-4 shadow-sm min-h-[140px]">
            <h4 className="font-bold text-fuchsia-600 dark:text-fuchsia-400 mb-2">{STEPS[stepIdx].title}</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {STEPS[stepIdx].description}
            </p>
          </div>
          
          <div className="rounded-lg bg-slate-800 text-slate-100 p-4 font-mono text-xs md:text-sm overflow-x-auto shadow-inner relative">
            <div className="absolute top-0 right-0 px-2 py-1 bg-slate-700 text-slate-300 text-[10px] rounded-bl-lg rounded-tr-lg font-bold">PYTHON</div>
            <pre className="mt-2">
              <code>{STEPS[stepIdx].code}</code>
            </pre>
          </div>
        </div>

        {/* Right Column: Visualization */}
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-4 shadow-sm relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIdx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              <GeneratorVisual stepIdx={stepIdx} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => setStepIdx(Math.max(0, stepIdx - 1))} 
          disabled={stepIdx === 0}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          ← Back
        </button>
        <button 
          onClick={() => setStepIdx(Math.min(STEPS.length - 1, stepIdx + 1))} 
          disabled={stepIdx === STEPS.length - 1}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-fuchsia-600 text-white hover:bg-fuchsia-700 disabled:opacity-40 transition-colors shadow-sm"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------

function GeneratorVisual({ stepIdx }) {
  if (stepIdx === 0) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg w-48 text-center text-sm font-mono text-slate-700 dark:text-slate-300">
          function() executing...
        </div>
        <motion.div 
          animate={{ scale: [1, 1.1, 0], opacity: [1, 1, 0] }}
          transition={{ times: [0, 0.5, 1], duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
          className="bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-400 p-2 rounded w-40 text-center text-xs font-mono text-emerald-800 dark:text-emerald-200"
        >
          local n = 2
        </motion.div>
        <div className="text-xs text-slate-500 font-mono">
          Return complete. Variables destroyed.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center gap-4 w-full justify-center">
        {/* Caller Scope */}
        <div className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-lg w-32 flex flex-col items-center shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 mb-2">CALLER</div>
          {stepIdx >= 1 && (
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded font-mono text-xs mb-1 w-full text-center">gen = obj</div>
          )}
          {stepIdx >= 2 && (
            <div className="bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-800 dark:text-fuchsia-200 p-1 rounded font-mono text-xs font-bold w-full text-center">val1 = 1</div>
          )}
          {stepIdx >= 3 && (
            <div className="bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-800 dark:text-fuchsia-200 p-1 rounded font-mono text-xs font-bold mt-1 w-full text-center">val2 = 2</div>
          )}
        </div>

        {/* Arrows */}
        <div className="flex flex-col gap-2 items-center text-xs font-mono text-fuchsia-500 dark:text-fuchsia-400">
          {stepIdx === 1 && <div>creates →</div>}
          {stepIdx === 2 && <div>yields 1 ←</div>}
          {stepIdx === 3 && <div>yields 2 ←</div>}
        </div>

        {/* Generator Object (Suspended State) */}
        <div className="relative">
          {/* Amber frozen effect on step 2 */}
          {stepIdx === 2 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="absolute -inset-2 bg-amber-500/20 dark:bg-amber-400/20 blur-md rounded-xl z-0" 
            />
          )}

          <div className={`border-2 rounded-xl p-3 w-36 text-center shadow-sm relative z-10 transition-colors ${
            stepIdx === 2 ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30' : 'border-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-900/20'
          }`}>
            <div className="text-[10px] font-bold text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-wider mb-2">
              Generator
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-1 rounded font-mono text-xs mb-1">
              n = {stepIdx === 2 ? 1 : stepIdx === 3 ? 2 : '?'}
            </div>
            
            <div className={`text-[10px] font-bold mt-2 py-0.5 px-1 rounded ${
              stepIdx === 2 ? 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-100' : 'bg-fuchsia-200 text-fuchsia-800 dark:bg-fuchsia-800 dark:text-fuchsia-100'
            }`}>
              {stepIdx === 1 ? 'READY' : stepIdx === 2 ? 'SUSPENDED' : 'RESUMED'}
            </div>
          </div>
        </div>
      </div>
      
      {stepIdx === 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded border border-amber-200 dark:border-amber-800">
          State frozen in memory. Waiting for next().
        </motion.div>
      )}
      {stepIdx === 3 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-fuchsia-600 dark:text-fuchsia-400 font-semibold bg-fuchsia-50 dark:bg-fuchsia-900/20 px-3 py-1 rounded border border-fuchsia-200 dark:border-fuchsia-800">
          Function unfreezes and resumes!
        </motion.div>
      )}
    </div>
  );
}
