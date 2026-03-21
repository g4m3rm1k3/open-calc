import React, { useState } from 'react';

export default function VennDiagram() {
  const [operator, setOperator] = useState('AND');

  // Logic to determine fill opacities based on regions
  // Region 1: P only (left crescent)
  // Region 2: P and Q (center intersection)
  // Region 3: Q only (right crescent)
  // Region 0: outside (the bounding box)

  const isActive = (p, q) => {
    switch (operator) {
      case 'AND': return p && q;
      case 'OR': return p || q;
      case 'XOR': return p !== q;
      case 'NOT P': return !p;
      case 'NOT Q': return !q;
      default: return false;
    }
  };

  const c1 = isActive(true, false); // P only
  const c2 = isActive(true, true);  // P AND Q (center)
  const c3 = isActive(false, true); // Q only
  const bg = isActive(false, false); // Neither P nor Q

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 p-6 bg-slate-900 rounded-xl border border-slate-700 shadow-md items-center justify-center">
      <div className="flex flex-col gap-2 bg-slate-800 p-4 rounded-lg border border-slate-600 min-w-[150px]">
        <h3 className="text-white font-bold mb-2">Operators</h3>
        <button onClick={() => setOperator('AND')} className={`px-3 py-1.5 text-sm font-bold rounded transition-colors ${operator === 'AND' ? 'bg-emerald-600 text-white' : 'text-slate-400 bg-slate-700 hover:text-white'}`}>AND (P ∧ Q)</button>
        <button onClick={() => setOperator('OR')} className={`px-3 py-1.5 text-sm font-bold rounded transition-colors ${operator === 'OR' ? 'bg-emerald-600 text-white' : 'text-slate-400 bg-slate-700 hover:text-white'}`}>OR (P ∨ Q)</button>
        <button onClick={() => setOperator('XOR')} className={`px-3 py-1.5 text-sm font-bold rounded transition-colors ${operator === 'XOR' ? 'bg-emerald-600 text-white' : 'text-slate-400 bg-slate-700 hover:text-white'}`}>XOR (P ⊕ Q)</button>
        <div className="h-px bg-slate-700 my-1 w-full" />
        <button onClick={() => setOperator('NOT P')} className={`px-3 py-1.5 text-sm font-bold rounded transition-colors ${operator === 'NOT P' ? 'bg-emerald-600 text-white' : 'text-slate-400 bg-slate-700 hover:text-white'}`}>NOT (¬P)</button>
        <button onClick={() => setOperator('NOT Q')} className={`px-3 py-1.5 text-sm font-bold rounded transition-colors ${operator === 'NOT Q' ? 'bg-emerald-600 text-white' : 'text-slate-400 bg-slate-700 hover:text-white'}`}>NOT (¬Q)</button>
      </div>

      <div className="relative w-full max-w-[400px] aspect-video flex-1 flex items-center justify-center">
         <svg viewBox="0 0 400 250" className="w-full h-full drop-shadow-lg">
            <defs>
              <clipPath id="circle-p">
                <circle cx="160" cy="125" r="80" />
              </clipPath>
              <clipPath id="circle-q">
                <circle cx="240" cy="125" r="80" />
              </clipPath>
            </defs>

            {/* Background (Outside) */}
            <rect x="0" y="0" width="400" height="250" rx="10" className={`transition-colors duration-500 ${bg ? 'fill-emerald-900/50' : 'fill-slate-800'}`} />

            {/* Base Circles (unfilled wireframes) */}
            <circle cx="160" cy="125" r="80" fill="none" stroke="#475569" strokeWidth="2" />
            <circle cx="240" cy="125" r="80" fill="none" stroke="#475569" strokeWidth="2" />

            {/* P Only Fill */}
            {c1 && (
              <path d="M 160,45 A 80,80 0 1,0 200,194.28 A 80,80 0 0,1 200,55.72 A 80,80 0 0,0 160,45 Z" className="fill-emerald-500/80 transition-opacity duration-300" />
            )}

            {/* Q Only Fill */}
            {c3 && (
              <path d="M 240,45 A 80,80 0 1,1 200,194.28 A 80,80 0 0,0 200,55.72 A 80,80 0 0,1 240,45 Z" className="fill-emerald-500/80 transition-opacity duration-300" />
            )}

            {/* Intersection Fill (P AND Q) */}
            {c2 && (
              <path d="M 200,55.72 A 80,80 0 0,1 200,194.28 A 80,80 0 0,1 200,55.72 Z" className="fill-emerald-400 transition-opacity duration-300" />
            )}

            <text x="120" y="130" className="fill-white font-bold text-xl font-mono mix-blend-difference pointer-events-none">P</text>
            <text x="270" y="130" className="fill-white font-bold text-xl font-mono mix-blend-difference pointer-events-none">Q</text>
         </svg>
      </div>
    </div>
  );
}
