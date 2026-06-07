import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    id: 'intro',
    title: '1. Element-wise Math',
    description: 'NumPy arrays allow you to perform math operations element-by-element without writing loops. Here, we add a scalar (10) to every item in a 1D array.',
    code: `import numpy as np

arr = np.array([1, 2, 3])
# Add 10 to each element
result = arr + 10
# -> [11, 12, 13]`
  },
  {
    id: 'mismatch',
    title: '2. Shape Mismatch',
    description: 'What happens when you add a 3x3 matrix to a 1x3 vector? Mathematically, the shapes do not match. NumPy has to figure out what you mean.',
    code: `matrix = np.array([
  [1, 1, 1],
  [2, 2, 2],
  [3, 3, 3]
])
vector = np.array([10, 20, 30])

# Shapes:
# matrix.shape -> (3, 3)
# vector.shape -> (3,)`
  },
  {
    id: 'broadcast',
    title: '3. The Broadcasting Rule',
    description: 'If the dimensions match from right-to-left (or one is 1), NumPy "broadcasts" the smaller array to fit the larger one. The vector is conceptually stretched down the rows.',
    code: `# "vector" acts as if it were:
# [
#   [10, 20, 30],
#   [10, 20, 30],
#   [10, 20, 30]
# ]

# (No extra memory is actually used!)`
  },
  {
    id: 'result',
    title: '4. The Result',
    description: 'Once broadcasted, the arrays have the exact same shape (3x3). NumPy now performs element-wise addition as usual.',
    code: `result = matrix + vector

# -> [
#      [11, 21, 31],
#      [12, 22, 32],
#      [13, 23, 33]
#    ]`
  }
];

export default function NumpyBroadcastingStepperViz() {
  const [stepIdx, setStepIdx] = useState(0);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-sans">
      <h3 className="text-lg font-semibold mb-1 text-slate-800 dark:text-slate-100">NumPy Broadcasting Walkthrough</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Follow the steps to understand how NumPy aligns and stretches shapes for math operations.
      </p>

      {/* Stepper Dots */}
      <div className="flex gap-1 mb-4">
        {STEPS.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setStepIdx(i)}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i === stepIdx ? 'bg-cyan-500' : i < stepIdx ? 'bg-cyan-300 dark:bg-cyan-800' : 'bg-slate-200 dark:bg-slate-700'}`} 
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Left Column: Code and Explanation */}
        <div className="flex flex-col gap-3">
          <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-4 shadow-sm min-h-[140px]">
            <h4 className="font-bold text-cyan-600 dark:text-cyan-400 mb-2">{STEPS[stepIdx].title}</h4>
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
              <BroadcastVisual stepIdx={stepIdx} />
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
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-40 transition-colors shadow-sm"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------

function GridCell({ val, bgClass="bg-white dark:bg-slate-800", opacity=1 }) {
  return (
    <div 
      className={`w-10 h-10 flex items-center justify-center font-mono text-sm border border-slate-300 dark:border-slate-600 rounded ${bgClass}`}
      style={{ opacity }}
    >
      {val}
    </div>
  );
}

function BroadcastVisual({ stepIdx }) {
  if (stepIdx === 0) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          <GridCell val="1" bgClass="bg-emerald-100 dark:bg-emerald-900/50" />
          <GridCell val="2" bgClass="bg-emerald-100 dark:bg-emerald-900/50" />
          <GridCell val="3" bgClass="bg-emerald-100 dark:bg-emerald-900/50" />
        </div>
        <div className="font-bold text-xl text-slate-400">+</div>
        <GridCell val="10" bgClass="bg-amber-100 dark:bg-amber-900/50" />
        <div className="font-bold text-xl text-slate-400">=</div>
        <div className="flex gap-1">
          <GridCell val="11" bgClass="bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 font-bold" />
          <GridCell val="12" bgClass="bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 font-bold" />
          <GridCell val="13" bgClass="bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 font-bold" />
        </div>
      </div>
    );
  }

  // matrix (3x3)
  const matrix = [
    [1, 1, 1],
    [2, 2, 2],
    [3, 3, 3]
  ];
  
  // vector (1x3)
  const vector = [10, 20, 30];

  return (
    <div className="flex items-center gap-6">
      {/* Matrix */}
      <div className="flex flex-col gap-1">
        {matrix.map((row, r) => (
          <div key={r} className="flex gap-1">
            {row.map((val, c) => (
              <GridCell key={c} val={val} bgClass="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200" />
            ))}
          </div>
        ))}
      </div>

      <div className="font-bold text-2xl text-slate-400">+</div>

      {/* Vector (Broadcasting) */}
      <div className="flex flex-col gap-1 relative">
        {/* Real row */}
        <div className="flex gap-1 z-10 relative">
          {vector.map((val, c) => (
            <GridCell key={c} val={val} bgClass="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 font-bold border-amber-300 dark:border-amber-700" />
          ))}
        </div>
        
        {/* Ghost rows (only show on step 2 and 3) */}
        {stepIdx >= 2 && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-1 z-0 relative">
            {vector.map((val, c) => (
              <GridCell key={c} val={val} bgClass="bg-amber-50 dark:bg-amber-900/20 text-amber-600/50 border-amber-200/50 dark:border-amber-800/50 border-dashed" opacity={0.6} />
            ))}
          </motion.div>
        )}
        {stepIdx >= 2 && (
          <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex gap-1 z-0 relative">
            {vector.map((val, c) => (
              <GridCell key={c} val={val} bgClass="bg-amber-50 dark:bg-amber-900/20 text-amber-600/50 border-amber-200/50 dark:border-amber-800/50 border-dashed" opacity={0.6} />
            ))}
          </motion.div>
        )}
      </div>

      {stepIdx >= 3 && (
        <>
          <div className="font-bold text-2xl text-slate-400">=</div>
          <div className="flex flex-col gap-1">
            {matrix.map((row, r) => (
              <div key={r} className="flex gap-1">
                {row.map((val, c) => (
                  <GridCell 
                    key={c} 
                    val={val + vector[c]} 
                    bgClass="bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 font-bold border-cyan-300 dark:border-cyan-700" 
                  />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
