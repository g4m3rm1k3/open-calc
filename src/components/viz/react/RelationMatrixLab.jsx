import React, { useState, useEffect } from 'react';

export default function RelationMatrixLab() {
  // A 4x4 relation matrix for a set {A, B, C, D}
  const size = 4;
  const labels = ['A', 'B', 'C', 'D'];
  const [matrix, setMatrix] = useState(() => 
    Array(size).fill(false).map(() => Array(size).fill(false))
  );

  const toggleCell = (r, c) => {
    const newMat = matrix.map((row, i) => 
       row.map((val, j) => (i === r && j === c ? !val : val))
    );
    setMatrix(newMat);
  };

  const clearAll = () => setMatrix(Array(size).fill(false).map(() => Array(size).fill(false)));
  
  const setEquivalence = () => {
    const newMat = Array(size).fill(false).map(() => Array(size).fill(false));
    newMat[0][0] = true; newMat[0][1] = true; newMat[1][0] = true; newMat[1][1] = true;
    newMat[2][2] = true; newMat[2][3] = true; newMat[3][2] = true; newMat[3][3] = true;
    setMatrix(newMat);
  };

  const setIdentity = () => {
    const newMat = Array(size).fill(false).map(() => Array(size).fill(false));
    for (let i = 0; i < size; i++) newMat[i][i] = true;
    setMatrix(newMat);
  };

  const flipInverse = () => {
    const newMat = Array(size).fill(false).map(() => Array(size).fill(false));
    for (let i = 0; i < size; i++) {
       for (let j = 0; j < size; j++) {
          newMat[i][j] = matrix[j][i];
       }
    }
    setMatrix(newMat);
  };

  // Properties validation
  // Reflexive: All main diagonal elements are true
  let isReflexive = true;
  for (let i = 0; i < size; i++) if (!matrix[i][i]) isReflexive = false;

  // Symmetric: matrix[i][j] === matrix[j][i]
  let isSymmetric = true;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (matrix[i][j] && !matrix[j][i]) isSymmetric = false;
    }
  }

  // Antisymmetric: if aRb and bRa, then a = b.
  // Meaning if i !== j, you cannot have both matrix[i][j] and matrix[j][i]
  let isAntisymmetric = true;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (i !== j && matrix[i][j] && matrix[j][i]) isAntisymmetric = false;
    }
  }

  // Transitive: if aRb and bRc, then aRc
  let isTransitive = true;
  let counterExample = null;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      for (let k = 0; k < size; k++) {
        if (matrix[i][j] && matrix[j][k] && !matrix[i][k]) {
          isTransitive = false;
          counterExample = `(${labels[i]}, ${labels[j]}) and (${labels[j]}, ${labels[k]}) exist, but missing (${labels[i]}, ${labels[k]})!`;
        }
      }
    }
  }

  // Is Function: A relation where EVERY input has EXACTLY ONE output arrow.
  let isFunction = true;
  let functionError = null;
  for (let i = 0; i < size; i++) {
     const arrowCount = matrix[i].filter(Boolean).length;
     if (arrowCount !== 1) {
         isFunction = false;
         functionError = arrowCount > 1 
           ? `Node ${labels[i]} is "cheating" by pointing to ${arrowCount} things at once!` 
           : `Node ${labels[i]} has zero outputs!`;
         break;
     }
  }

  const isEquivalence = isReflexive && isSymmetric && isTransitive;
  const isPoset = isReflexive && isAntisymmetric && isTransitive;

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6 flex flex-col md:flex-row gap-8 items-start">
      
      {/* Left Axis: The Matrix */}
      <div className="flex flex-col items-center w-full md:w-auto shrink-0">
         <h4 className="text-white font-bold mb-4 border-b border-slate-700 pb-2 w-full text-center">Set Relation Matrix</h4>
         
         <div className="flex flex-col gap-1">
            {/* Header Row */}
            <div className="flex gap-1 mb-1">
               <div className="w-8 h-8"></div>
               {labels.map(l => <div key={`col-${l}`} className="w-10 h-8 flex items-center justify-center font-bold text-slate-400">{l}</div>)}
            </div>

            {/* Grid Rows */}
            {matrix.map((row, i) => (
              <div key={`row-${i}`} className="flex gap-1 items-center">
                 <div className="w-8 font-bold text-slate-400 flex justify-end pr-2">{labels[i]}</div>
                 {row.map((val, j) => {
                   const isDiagonal = i === j;
                   return (
                     <button 
                       key={`cell-${i}-${j}`}
                       onClick={() => toggleCell(i, j)}
                       className={`w-10 h-10 rounded border transition-all duration-300 transform active:scale-90 ${val ? (isDiagonal ? 'bg-amber-500 border-amber-400 shadow-[0_0_10px_#fbbf24]' : 'bg-brand-500 border-brand-400 shadow-[0_0_10px_#38bdf8]') : 'bg-slate-800 border-slate-600 hover:bg-slate-700'}`}
                     >
                       {val && <span className="text-white font-bold opacity-80 pl-0.5">1</span>}
                     </button>
                   );
                 })}
              </div>
            ))}
         </div>

         <div className="flex w-full gap-2 mt-6 flex-wrap">
            <button onClick={clearAll} className="flex-1 text-[10px] py-2 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold transition whitespace-nowrap px-2">Clear</button>
            <button onClick={setIdentity} className="flex-1 text-[10px] py-2 rounded bg-sky-700 hover:bg-sky-600 text-white font-bold transition whitespace-nowrap px-2">Identity R</button>
            <button onClick={flipInverse} className="flex-1 text-[10px] py-2 rounded bg-purple-700 hover:bg-purple-600 text-white font-bold transition whitespace-nowrap px-2">Inverse Flip R⁻¹</button>
         </div>
         <div className="flex w-full gap-2 mt-2">
            <button onClick={setEquivalence} className="w-full text-[10px] py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold transition uppercase tracking-wider">Load Perfect Class</button>
         </div>
      </div>

      {/* Right Axis: Validations */}
      <div className="flex-1 w-full bg-slate-800 p-5 rounded-lg border border-slate-600">
         <h4 className="text-white font-bold mb-4 border-b border-slate-700 pb-2">Live Structural Analysis</h4>
         
         <div className="space-y-3">
             <div className={`p-3 rounded border flex justify-between items-center transition-colors ${isReflexive ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                <span className="font-bold text-sm">Reflexive</span>
                <span className="text-xs uppercase">{isReflexive ? 'TRUE' : 'Missing Diagonal Elements'}</span>
             </div>

             <div className={`p-3 rounded border flex justify-between items-center transition-colors ${isSymmetric ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                <span className="font-bold text-sm">Symmetric</span>
                <span className="text-xs uppercase">{isSymmetric ? 'TRUE' : 'Matrix is not perfectly mirrored'}</span>
             </div>

             <div className={`p-3 rounded border flex justify-between items-center transition-colors ${isAntisymmetric ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                <span className="font-bold text-sm">Antisymmetric</span>
                <span className="text-xs uppercase">{isAntisymmetric ? 'TRUE' : 'Mutual loops point both ways!'}</span>
             </div>

             <div className={`p-3 rounded border flex flex-col justify-center transition-colors ${isTransitive ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' : 'bg-red-900/30 border-red-500 text-red-400'}`}>
                <div className="flex justify-between items-center w-full">
                   <span className="font-bold text-sm">Transitive</span>
                   <span className="text-xs uppercase">{isTransitive ? 'TRUE' : 'Chain Broken!'}</span>
                </div>
                {!isTransitive && counterExample && <div className="mt-2 text-[10px] text-red-300">{counterExample}</div>}
             </div>
         </div>

         {/* Grand Structures */}
         <div className="mt-6 space-y-2">
             <div className={`p-3 rounded border flex flex-col justify-center transition-colors ${isFunction ? 'bg-sky-900/30 border-sky-500 text-sky-400' : 'bg-red-900/30 border-red-500 text-red-500'}`}>
                <div className="flex justify-between items-center w-full">
                   <span className="font-bold text-sm tracking-widest uppercase text-white">Loyal Function?</span>
                   <span className="text-xs font-bold uppercase">{isFunction ? 'YES' : 'NO'}</span>
                </div>
                {!isFunction && functionError && <div className="mt-2 text-[10.5px] font-bold text-red-300">Warning: This is incredibly wild! {functionError}</div>}
             </div>

            {isEquivalence && (
              <div className="p-3 bg-amber-500 text-amber-950 font-bold rounded shadow-[0_0_20px_#fbbf24] animate-pulse text-center">
                 🌟 EQUIVALENCE RELATION ACHIEVED!
              </div>
            )}
            {isPoset && !isEquivalence && (
              <div className="p-3 bg-purple-500 text-white font-bold rounded shadow-[0_0_20px_#a855f7] animate-pulse text-center">
                 📈 PARTIAL ORDER (POSET) ACHIEVED!
              </div>
            )}
         </div>

      </div>

    </div>
  );
}
