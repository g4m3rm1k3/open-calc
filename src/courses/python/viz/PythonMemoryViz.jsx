import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Play, RotateCcw } from 'lucide-react';

export default function PythonMemoryViz({ initialProps }) {
  const defaultSteps = [
    {
      code: "age = 25",
      explanation: "In Python, variables are not boxes that hold values. They are just 'name tags' pointing to objects in memory. First, Python creates an integer object 25.",
      vars: [{ name: "age", target: "obj1" }],
      objs: [{ id: "obj1", val: "25", type: "int" }]
    },
    {
      code: "score = 25",
      explanation: "Because small integers are often cached, 'score' might just point to the exact same object in memory! No new object is created.",
      vars: [{ name: "age", target: "obj1" }, { name: "score", target: "obj1" }],
      objs: [{ id: "obj1", val: "25", type: "int" }]
    },
    {
      code: "age = 26",
      explanation: "Integers are immutable. When we change 'age', Python doesn't modify the 25. It creates a NEW object 26, and moves the 'age' tag to it.",
      vars: [{ name: "age", target: "obj2" }, { name: "score", target: "obj1" }],
      objs: [
        { id: "obj1", val: "25", type: "int" },
        { id: "obj2", val: "26", type: "int" }
      ]
    },
    {
      code: "score = 100",
      explanation: "Now 'score' points to a new object 100. The object 25 has no names pointing to it anymore!",
      vars: [{ name: "age", target: "obj2" }, { name: "score", target: "obj3" }],
      objs: [
        { id: "obj1", val: "25", type: "int", orphaned: true },
        { id: "obj2", val: "26", type: "int" },
        { id: "obj3", val: "100", type: "int" }
      ]
    },
    {
      code: "# Garbage Collection",
      explanation: "Since nothing points to 25, Python's Garbage Collector automatically deletes it to free up memory.",
      vars: [{ name: "age", target: "obj2" }, { name: "score", target: "obj3" }],
      objs: [
        { id: "obj2", val: "26", type: "int" },
        { id: "obj3", val: "100", type: "int" }
      ]
    }
  ];

  const steps = initialProps?.steps || defaultSteps;
  const [stepIdx, setStepIdx] = useState(0);
  const currentStep = steps[stepIdx];

  // Layout calculations
  const VAR_X = 80;
  const OBJ_X = 400;
  const Y_START = 80;
  const Y_SPACING = 90;

  // Compute positions dynamically so lines don't cross too badly
  const varPositions = {};
  currentStep.vars.forEach((v, i) => {
    varPositions[v.name] = { x: VAR_X, y: Y_START + i * Y_SPACING };
  });

  const objPositions = {};
  currentStep.objs.forEach((o, i) => {
    objPositions[o.id] = { x: OBJ_X, y: Y_START + i * Y_SPACING };
  });

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col font-sans">
      {/* Header section */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="flex gap-4">
          <div className="flex-1 space-y-4">
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-brand-300 shadow-inner">
              {steps.slice(0, stepIdx + 1).map((s, i) => (
                <div key={i} className={i === stepIdx ? "text-brand-300 font-bold" : "text-slate-500"}>
                  {i === stepIdx ? "▶ " : "  "}{s.code}
                </div>
              ))}
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed min-h-[3rem]">
              {currentStep.explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Visualization Canvas */}
      <div className="relative h-[360px] w-full bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
        {/* SVG connecting lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-brand-500" />
            </marker>
          </defs>
          <AnimatePresence>
            {currentStep.vars.map(v => {
              if (!objPositions[v.target]) return null;
              const startX = varPositions[v.name].x + 60; // right edge of var
              const startY = varPositions[v.name].y;
              const endX = objPositions[v.target].x - 60; // left edge of obj
              const endY = objPositions[v.target].y;

              const cX1 = startX + 100;
              const cX2 = endX - 100;
              const pathData = `M ${startX} ${startY} C ${cX1} ${startY}, ${cX2} ${endY}, ${endX} ${endY}`;

              return (
                <motion.path
                  key={`line-${v.name}-${v.target}`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  d={pathData}
                  fill="none"
                  strokeWidth="3"
                  className="stroke-brand-500"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
          </AnimatePresence>
        </svg>

        {/* Names */}
        <div className="absolute top-4 left-[60px] text-xs font-bold text-slate-400 uppercase tracking-widest">
          Names
        </div>
        <AnimatePresence>
          {currentStep.vars.map(v => (
            <motion.div
              key={`var-${v.name}`}
              layout
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute w-[120px] h-[48px] bg-white dark:bg-slate-800 border-2 border-brand-200 dark:border-brand-900 rounded-xl shadow-sm flex items-center justify-center font-mono font-bold text-slate-700 dark:text-slate-200"
              style={{
                left: varPositions[v.name].x - 60,
                top: varPositions[v.name].y - 24
              }}
            >
              {v.name}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Objects */}
        <div className="absolute top-4 left-[380px] text-xs font-bold text-slate-400 uppercase tracking-widest">
          Objects (Heap)
        </div>
        <AnimatePresence>
          {currentStep.objs.map(o => (
            <motion.div
              key={`obj-${o.id}`}
              layout
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -20, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`absolute w-[120px] h-[64px] rounded-xl border-2 flex flex-col items-center justify-center shadow-md ${
                o.orphaned 
                  ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 border-dashed opacity-50" 
                  : "bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700/50"
              }`}
              style={{
                left: objPositions[o.id].x - 60,
                top: objPositions[o.id].y - 32
              }}
            >
              <div className="text-xs text-amber-600/70 dark:text-amber-500/70 font-semibold mb-0.5 uppercase tracking-wide">
                &lt;{o.type}&gt;
              </div>
              <div className="font-mono font-bold text-lg text-slate-800 dark:text-slate-200">
                {o.val}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
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
            title="Restart"
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
