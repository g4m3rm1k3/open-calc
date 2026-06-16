import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Play, RotateCcw } from 'lucide-react';

export default function ListMemoryViz({ initialProps }) {
  const defaultSteps = [
    {
      code: "a = [1, 2, 3]",
      explanation: "A list in Python doesn't store values directly. It stores an array of POINTERS to objects. When we create a list, Python creates the integer objects first, then a list object pointing to them.",
      vars: [{ name: "a", target: "list1" }],
      objs: [
        { id: "obj1", val: "1", type: "int" },
        { id: "obj2", val: "2", type: "int" },
        { id: "obj3", val: "3", type: "int" },
        { id: "list1", val: "list", type: "list", slots: ["obj1", "obj2", "obj3"] }
      ]
    },
    {
      code: "b = a",
      explanation: "This is the crucial moment: 'b = a' does NOT copy the list. It just makes the name 'b' point to the EXACT SAME list object in memory.",
      vars: [{ name: "a", target: "list1" }, { name: "b", target: "list1" }],
      objs: [
        { id: "obj1", val: "1", type: "int" },
        { id: "obj2", val: "2", type: "int" },
        { id: "obj3", val: "3", type: "int" },
        { id: "list1", val: "list", type: "list", slots: ["obj1", "obj2", "obj3"] }
      ]
    },
    {
      code: "b[0] = 99",
      explanation: "We mutate the list via 'b'. Python creates a new integer 99, and changes the first slot of the list to point to it. Because 'a' points to the same list, 'a' sees the change too!",
      vars: [{ name: "a", target: "list1" }, { name: "b", target: "list1" }],
      objs: [
        { id: "obj1", val: "1", type: "int", orphaned: true },
        { id: "obj2", val: "2", type: "int" },
        { id: "obj3", val: "3", type: "int" },
        { id: "obj99", val: "99", type: "int" },
        { id: "list1", val: "list", type: "list", slots: ["obj99", "obj2", "obj3"] }
      ]
    },
    {
      code: "a = [4, 5]",
      explanation: "Now we assign a completely NEW list to 'a'. The name 'a' moves to the new list. The name 'b' still points to the old list. They are no longer linked.",
      vars: [{ name: "a", target: "list2" }, { name: "b", target: "list1" }],
      objs: [
        { id: "obj1", val: "1", type: "int", orphaned: true },
        { id: "obj2", val: "2", type: "int" },
        { id: "obj3", val: "3", type: "int" },
        { id: "obj99", val: "99", type: "int" },
        { id: "list1", val: "list", type: "list", slots: ["obj99", "obj2", "obj3"] },
        { id: "obj4", val: "4", type: "int" },
        { id: "obj5", val: "5", type: "int" },
        { id: "list2", val: "list", type: "list", slots: ["obj4", "obj5"] }
      ]
    }
  ];

  const steps = initialProps?.steps || defaultSteps;
  const [stepIdx, setStepIdx] = useState(0);
  const currentStep = steps[stepIdx];

  // Layout calculations
  const VAR_X = 80;
  const LIST_X = 300;
  const PRIM_X = 550;
  
  // We compute positions manually for simplicity
  const varPositions = {};
  currentStep.vars.forEach((v, i) => {
    varPositions[v.name] = { x: VAR_X, y: 100 + i * 100 };
  });

  const objPositions = {};
  
  // Separate lists and primitives
  const lists = currentStep.objs.filter(o => o.type === 'list');
  const prims = currentStep.objs.filter(o => o.type !== 'list');

  lists.forEach((l, i) => {
    objPositions[l.id] = { x: LIST_X, y: 100 + i * 150 };
  });

  prims.forEach((p, i) => {
    objPositions[p.id] = { x: PRIM_X, y: 50 + i * 65 };
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
      <div className="relative h-[480px] w-full bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
        {/* SVG connecting lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-brand-500" />
            </marker>
            <marker id="slotarrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="currentColor" className="text-emerald-500" />
            </marker>
          </defs>
          <AnimatePresence>
            {/* Var to List/Obj lines */}
            {currentStep.vars.map(v => {
              if (!objPositions[v.target]) return null;
              const startX = varPositions[v.name].x + 60; 
              const startY = varPositions[v.name].y;
              const endX = objPositions[v.target].x - 80; 
              const endY = objPositions[v.target].y;

              const cX1 = startX + 50;
              const cX2 = endX - 50;
              const pathData = `M ${startX} ${startY} C ${cX1} ${startY}, ${cX2} ${endY}, ${endX} ${endY}`;

              return (
                <motion.path
                  key={`line-var-${v.name}-${v.target}`}
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

            {/* List slots to Objects lines */}
            {lists.map(list => {
              return list.slots.map((slotTarget, idx) => {
                if (!objPositions[slotTarget]) return null;
                // calculate exact position of slot
                // slot boxes are ~32px wide, stacked horizontally inside list
                const totalSlots = list.slots.length;
                const slotWidth = 36;
                const startX = objPositions[list.id].x - ((totalSlots * slotWidth)/2) + (idx * slotWidth) + 18;
                const startY = objPositions[list.id].y + 10;
                
                const endX = objPositions[slotTarget].x - 50;
                const endY = objPositions[slotTarget].y;

                const cX1 = startX + 40;
                const cX2 = endX - 40;
                
                const pathData = `M ${startX} ${startY} C ${cX1} ${startY}, ${cX2} ${endY}, ${endX} ${endY}`;

                return (
                  <motion.path
                    key={`line-slot-${list.id}-${idx}-${slotTarget}`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    d={pathData}
                    fill="none"
                    strokeWidth="2"
                    className="stroke-emerald-400 dark:stroke-emerald-600"
                    strokeDasharray="4 2"
                    markerEnd="url(#slotarrow)"
                  />
                );
              });
            })}
          </AnimatePresence>
        </svg>

        {/* Labels */}
        <div className="absolute top-4 left-[60px] text-xs font-bold text-slate-400 uppercase tracking-widest">
          Names
        </div>
        <div className="absolute top-4 left-[260px] text-xs font-bold text-slate-400 uppercase tracking-widest">
          List Objects
        </div>
        <div className="absolute top-4 left-[530px] text-xs font-bold text-slate-400 uppercase tracking-widest">
          Primitives
        </div>

        {/* Render Vars */}
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

        {/* Render Objects */}
        <AnimatePresence>
          {currentStep.objs.map(o => {
            if (o.type === 'list') {
              return (
                <motion.div
                  key={`obj-${o.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                  className="absolute p-3 rounded-xl border-2 shadow-lg bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700/50 flex flex-col items-center gap-2"
                  style={{
                    left: objPositions[o.id].x - 80,
                    top: objPositions[o.id].y - 40,
                    width: 160
                  }}
                >
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wide">
                    &lt;list&gt;
                  </div>
                  <div className="flex gap-1 bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-inner">
                    {o.slots.map((_, idx) => (
                      <div key={idx} className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-mono text-slate-400">
                        {idx}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            } else {
              return (
                <motion.div
                  key={`obj-${o.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                  className={`absolute w-[80px] h-[48px] rounded-xl border-2 flex items-center justify-center shadow-sm ${
                    o.orphaned 
                      ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 border-dashed opacity-40" 
                      : "bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700/50"
                  }`}
                  style={{
                    left: objPositions[o.id].x - 40,
                    top: objPositions[o.id].y - 24
                  }}
                >
                  <div className="font-mono font-bold text-lg text-slate-800 dark:text-slate-200">
                    {o.val}
                  </div>
                </motion.div>
              );
            }
          })}
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
