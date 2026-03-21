import React, { useState } from 'react';

export default function PowerSetTreeLab() {
  const [level, setLevel] = useState(0); // 0 to 3

  const items = ['A', 'B', 'C'];
  
  // Hardcoded coordinates for a complete depth-3 binary tree
  const nodes = [
    { id: 'root', depth: 0, x: 50, y: 10, label: '∅' },
    
    // Level 1: Decide on 'A'
    { id: 'L1', depth: 1, x: 25, y: 35, label: '{A}', parent: 'root', choice: 'Keep A' },
    { id: 'R1', depth: 1, x: 75, y: 35, label: '∅', parent: 'root', choice: 'Drop A' },
    
    // Level 2: Decide on 'B'
    { id: 'LL2', depth: 2, x: 12.5, y: 65, label: '{A,B}', parent: 'L1', choice: 'Keep B' },
    { id: 'LR2', depth: 2, x: 37.5, y: 65, label: '{A}', parent: 'L1', choice: 'Drop B' },
    { id: 'RL2', depth: 2, x: 62.5, y: 65, label: '{B}', parent: 'R1', choice: 'Keep B' },
    { id: 'RR2', depth: 2, x: 87.5, y: 65, label: '∅', parent: 'R1', choice: 'Drop B' },
    
    // Level 3: Decide on 'C'
    { id: 'LLL3', depth: 3, x: 6.25, y: 95, label: '{A,B,C}', parent: 'LL2', choice: 'Keep C' },
    { id: 'LLR3', depth: 3, x: 18.75, y: 95, label: '{A,B}', parent: 'LL2', choice: 'Drop' },
    { id: 'LRL3', depth: 3, x: 31.25, y: 95, label: '{A,C}', parent: 'LR2', choice: 'Keep C' },
    { id: 'LRR3', depth: 3, x: 43.75, y: 95, label: '{A}', parent: 'LR2', choice: 'Drop' },
    { id: 'RLL3', depth: 3, x: 56.25, y: 95, label: '{B,C}', parent: 'RL2', choice: 'Keep' },
    { id: 'RLR3', depth: 3, x: 68.75, y: 95, label: '{B}', parent: 'RL2', choice: 'Drop' },
    { id: 'RRL3', depth: 3, x: 81.25, y: 95, label: '{C}', parent: 'RR2', choice: 'Keep C' },
    { id: 'RRR3', depth: 3, x: 93.75, y: 95, label: '∅', parent: 'RR2', choice: 'Drop' },
  ];

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
      
      {/* Header */}
      <div className="p-6 text-center border-b border-slate-800 bg-slate-800/50">
        <h3 className="text-white font-bold text-xl mb-1">The Subsets Decision Tree</h3>
        <p className="text-slate-400 text-sm">Building the Power Set for X = {"{A, B, C}"}</p>
      </div>

      <div className="flex flex-col md:flex-row">
         
         {/* Controls */}
         <div className="w-full md:w-64 p-6 bg-slate-800 border-r border-slate-700 flex flex-col justify-center">
            <h4 className="text-slate-300 font-bold mb-4">Advance the Simulation:</h4>
            
            <div className="space-y-3">
               <button 
                 onClick={() => setLevel(0)}
                 className={`w-full text-left px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${level === 0 ? 'bg-brand-600 text-white shadow-lg indent-2' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                 0. Empty Start
               </button>
               <button 
                 onClick={() => setLevel(1)}
                 className={`w-full text-left px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${level === 1 ? 'bg-brand-600 text-white shadow-lg indent-2' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                 1. Evaluate Element A
               </button>
               <button 
                 onClick={() => setLevel(2)}
                 className={`w-full text-left px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${level === 2 ? 'bg-brand-600 text-white shadow-lg indent-2' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                 2. Evaluate Element B
               </button>
               <button 
                 onClick={() => setLevel(3)}
                 className={`w-full text-left px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${level === 3 ? 'bg-emerald-600 text-white shadow-[0_0_15px_#10b981] scale-105' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                 3. Final Subsets (2³)
               </button>
            </div>

            <div className="mt-8 p-3 bg-slate-900 rounded border border-slate-700">
               <span className="text-xs text-slate-400 font-medium">Total Generated Subsets:</span>
               <div className="text-3xl font-mono text-emerald-400 font-bold tracking-widest mt-1">
                  {Math.pow(2, level)}
               </div>
            </div>
         </div>

         {/* Tree Visualization Workspace */}
         <div className="flex-1 min-h-[400px] relative p-4 bg-slate-950 overflow-auto">
            <div className="w-full min-w-[700px] h-[350px] relative mt-4">
               <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  {nodes.map(node => {
                     if (node.depth > level || !node.parent) return null;
                     const parent = nodes.find(n => n.id === node.parent);
                     const isKeep = node.choice.includes('Keep');
                     
                     return (
                        <g key={`edge-${node.id}`} className="animate-fade-in">
                           <line 
                              x1={`${parent.x}%`} y1={`${parent.y}%`} 
                              x2={`${node.x}%`} y2={`${node.y}%`} 
                              stroke={isKeep ? '#34d399' : '#f87171'} 
                              strokeWidth="2"
                              opacity={0.6}
                           />
                           {/* Add tiny choice labels on the lines */}
                           <text 
                              x={`${Math.round((parent.x + node.x) / 2)}%`} 
                              y={`${Math.round((parent.y + node.y) / 2)}%`}
                              fill={isKeep ? '#34d399' : '#f87171'}
                              fontSize="10"
                              fontWeight="bold"
                              textAnchor="middle"
                              dy="-5"
                           >
                              {node.choice}
                           </text>
                        </g>
                     )
                  })}
               </svg>

               {/* HTML Nodes overlay for formatting */}
               {nodes.map(node => {
                  if (node.depth > level) return null;
                  const isLeaf = node.depth === 3 && level === 3;

                  return (
                     <div 
                        key={node.id} 
                        className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 animate-slide-up-fade
                        ${isLeaf ? 'bg-emerald-900 border border-emerald-400 text-emerald-200 px-2 py-1 rounded shadow-[0_0_10px_#10b981]' : 'bg-slate-800 border-2 border-slate-600 text-slate-300 px-2 py-1 rounded'}`}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                     >
                        <span className="text-[11px] font-mono font-bold whitespace-nowrap">{node.label}</span>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>
    </div>
  );
}
