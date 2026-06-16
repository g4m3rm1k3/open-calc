import React, { useState } from 'react';

export default function HasseTransformerLab() {
  const [cleaned, setCleaned] = useState(false);

  // Nodes: 1, 2, 4. (Relation: x cleanly divides y)
  // 4 is at the top (x=50, y=20)
  // 2 is in the middle (x=50, y=50)
  // 1 is at the bottom (x=50, y=80)
  
  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6 flex flex-col md:flex-row items-center gap-8">
      
      <div className="w-full md:w-64 shrink-0 text-center md:text-left">
         <h3 className="text-white font-bold text-xl mb-1 mt-0">Hasse Transformer</h3>
         <p className="text-slate-400 text-sm mb-6">Cleaning Partial Order "Spaghetti" graphs strictly down to their functional hierarchy.<br/><br/>Relation: <strong className="text-amber-400">a strictly divides b</strong> on Set {"{1, 2, 4}"}</p>

         <button 
            onClick={() => setCleaned(!cleaned)}
            className={`w-full py-3 rounded-lg font-bold uppercase transition-all duration-300 shadow-md transform hover:scale-105 active:scale-95 ${cleaned ? 'bg-emerald-600 text-white shadow-[0_0_15px_#059669]' : 'bg-amber-600 text-white'}`}
         >
            {cleaned ? 'Restore Matrix Spaghetti' : 'Clean to Hasse Diagram'}
         </button>

         <div className="mt-6 flex flex-col gap-2 text-xs text-left">
            <div className={`p-2 rounded transition-colors ${cleaned ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`}>✔️ Removed Reflexive Loops</div>
            <div className={`p-2 rounded transition-colors ${cleaned ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`}>✔️ Removed Transitive Redundancy</div>
            <div className={`p-2 rounded transition-colors ${cleaned ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`}>✔️ Sorted strictly Bottom to Top</div>
         </div>
      </div>

      <div className="flex-1 w-full max-w-sm aspect-square relative bg-slate-950 border-2 border-slate-800 rounded-xl overflow-visible mx-auto">
         
         <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <defs>
               <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="28" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill={cleaned ? '#10b981' : '#f59e0b'} className="transition-colors duration-500" />
               </marker>
               {/* Transitive distinct marker */}
               <marker id="arrowhead-red" markerWidth="6" markerHeight="6" refX="28" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="#ef4444" />
               </marker>
            </defs>

            {/* Reflexive Loops (Disappear when cleaned) */}
            <g className={`transition-all duration-700 origin-center ${cleaned ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
               <path d="M 50,20 C 70,0 80,30 50,20" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
               <path d="M 50,50 C 70,30 80,60 50,50" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
               <path d="M 50,80 C 70,60 80,90 50,80" fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
            </g>

            {/* Primary Core Hierarchy Edges (1->2 and 2->4) */}
            <line x1="50" y1="80" x2="50" y2="50" stroke={cleaned ? '#10b981' : '#f59e0b'} strokeWidth="2.5" markerEnd="url(#arrowhead)" className="transition-colors duration-500" />
            <line x1="50" y1="50" x2="50" y2="20" stroke={cleaned ? '#10b981' : '#f59e0b'} strokeWidth="2.5" markerEnd="url(#arrowhead)" className="transition-colors duration-500" />

            {/* Transitive Skip Edge (1 -> 4). Bends to avoid node 2. (Disappears when cleaned) */}
            <path 
               d="M 50,80 Q 20,50 50,20" 
               fill="none" 
               stroke="#ef4444" strokeWidth="1.5" 
               strokeDasharray="4,4"
               markerEnd="url(#arrowhead-red)" 
               className={`transition-all duration-700 ${cleaned ? 'opacity-0 stroke-dashoffset-24' : 'opacity-100 stroke-dashoffset-0'}`} />

            {/* Nodes */}
            <circle cx="50" cy="20" r="6" className={`transition-colors duration-500 ${cleaned ? 'fill-emerald-500' : 'fill-amber-500'}`} />
            <text x="38" y="24" fill="white" fontSize="10" fontWeight="bold">4</text>

            <circle cx="50" cy="50" r="6" className={`transition-colors duration-500 ${cleaned ? 'fill-emerald-500' : 'fill-amber-500'}`} />
            <text x="38" y="54" fill="white" fontSize="10" fontWeight="bold">2</text>

            <circle cx="50" cy="80" r="6" className={`transition-colors duration-500 ${cleaned ? 'fill-emerald-500' : 'fill-amber-500'}`} />
            <text x="38" y="84" fill="white" fontSize="10" fontWeight="bold">1</text>
         </svg>
         
      </div>

    </div>
  );
}
