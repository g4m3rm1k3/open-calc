import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';

export default function CallStackViz() {
  const steps = [
    {
      action: "Global execution starts",
      codeLeft: ["def multiply(a, b):", "    return a * b", "", "def main():", "    x = 10", "    y = multiply(x, 2)", "    return y", "", "main()"],
      highlightLeft: 8,
      stack: [
        { id: "global", name: "Global Frame", vars: { multiply: "<func>", main: "<func>" } }
      ],
      explanation: "Execution starts in the Global frame. It defines two functions, then calls main()."
    },
    {
      action: "Enter main()",
      codeLeft: ["def multiply(a, b):", "    return a * b", "", "def main():", "    x = 10", "    y = multiply(x, 2)", "    return y", "", "main()"],
      highlightLeft: 4,
      stack: [
        { id: "global", name: "Global Frame", vars: { multiply: "<func>", main: "<func>" } },
        { id: "main", name: "Frame: main()", vars: { x: "10" } }
      ],
      explanation: "Calling main() creates a NEW sandbox (stack frame). Local variable 'x' is set to 10."
    },
    {
      action: "Call multiply()",
      codeLeft: ["def multiply(a, b):", "    return a * b", "", "def main():", "    x = 10", "    y = multiply(x, 2)", "    return y", "", "main()"],
      highlightLeft: 5,
      stack: [
        { id: "global", name: "Global Frame", vars: { multiply: "<func>", main: "<func>" } },
        { id: "main", name: "Frame: main()", vars: { x: "10" } },
        { id: "multiply", name: "Frame: multiply()", vars: { a: "10", b: "2" } }
      ],
      explanation: "main() calls multiply(). Another new sandbox is pushed onto the stack. The arguments 10 and 2 are bound to parameters 'a' and 'b'."
    },
    {
      action: "Execute multiply()",
      codeLeft: ["def multiply(a, b):", "    return a * b", "", "def main():", "    x = 10", "    y = multiply(x, 2)", "    return y", "", "main()"],
      highlightLeft: 1,
      stack: [
        { id: "global", name: "Global Frame", vars: { multiply: "<func>", main: "<func>" } },
        { id: "main", name: "Frame: main()", vars: { x: "10" } },
        { id: "multiply", name: "Frame: multiply()", vars: { a: "10", b: "2", "return": "20" } }
      ],
      explanation: "multiply() calculates a * b (20) and prepares to return it."
    },
    {
      action: "Return to main()",
      codeLeft: ["def multiply(a, b):", "    return a * b", "", "def main():", "    x = 10", "    y = multiply(x, 2)", "    return y", "", "main()"],
      highlightLeft: 5,
      stack: [
        { id: "global", name: "Global Frame", vars: { multiply: "<func>", main: "<func>" } },
        { id: "main", name: "Frame: main()", vars: { x: "10", y: "20" } }
      ],
      explanation: "multiply() finishes. Its sandbox is DESTROYED. The return value 20 is passed back to main() and assigned to 'y'."
    },
    {
      action: "Return from main()",
      codeLeft: ["def multiply(a, b):", "    return a * b", "", "def main():", "    x = 10", "    y = multiply(x, 2)", "    return y", "", "main()"],
      highlightLeft: 6,
      stack: [
        { id: "global", name: "Global Frame", vars: { multiply: "<func>", main: "<func>" } },
        { id: "main", name: "Frame: main()", vars: { x: "10", y: "20", "return": "20" } }
      ],
      explanation: "main() prepares to return the value of 'y' (20)."
    },
    {
      action: "Program ends",
      codeLeft: ["def multiply(a, b):", "    return a * b", "", "def main():", "    x = 10", "    y = multiply(x, 2)", "    return y", "", "main()"],
      highlightLeft: 8,
      stack: [
        { id: "global", name: "Global Frame", vars: { multiply: "<func>", main: "<func>" } }
      ],
      explanation: "main() finishes and its sandbox is destroyed. The program completes."
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
      <div className="flex h-[420px] w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
        
        {/* Left Side: Original Code */}
        <div className="w-1/2 p-6 border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/50 flex flex-col">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Code Execution
          </div>
          <div className="font-mono text-sm leading-relaxed text-slate-600 dark:text-slate-300 relative">
            {currentStep.codeLeft.map((line, idx) => (
              <div 
                key={idx} 
                className={`px-2 py-1 rounded ${currentStep.highlightLeft === idx ? 'bg-brand-100 text-brand-900 dark:bg-brand-900/40 dark:text-brand-300 font-bold border-l-2 border-brand-500' : 'border-l-2 border-transparent'}`}
              >
                {line === '' ? <br/> : line}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Call Stack */}
        <div className="w-1/2 p-6 flex flex-col bg-slate-200/50 dark:bg-slate-900 overflow-hidden relative justify-end pb-8">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 absolute top-6 left-6 z-10">
            The Call Stack
          </div>
          <div className="flex flex-col gap-3 justify-end h-full">
            <AnimatePresence mode="popLayout">
              {currentStep.stack.map((frame, idx) => (
                <motion.div
                  key={frame.id}
                  layout
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9, filter: "blur(4px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`w-full rounded-xl border-2 shadow-lg p-4 flex flex-col gap-2 ${
                    idx === currentStep.stack.length - 1 
                    ? "bg-white dark:bg-slate-800 border-brand-300 dark:border-brand-700/50" 
                    : "bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700/30 opacity-70"
                  }`}
                >
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide border-b border-indigo-100 dark:border-indigo-900/30 pb-1 mb-1">
                    {frame.name} {idx === currentStep.stack.length - 1 && "(Active)"}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(frame.vars).map(([k, v]) => (
                      <div key={k} className="flex flex-col bg-slate-50 dark:bg-slate-900 rounded p-2 border border-slate-100 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 font-mono">{k}</span>
                        <span className={`text-sm font-mono font-bold ${k === 'return' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
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
