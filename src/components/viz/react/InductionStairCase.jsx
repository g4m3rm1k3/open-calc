import React, { useState } from 'react';

export default function InductionProofEngine() {
  const [step, setStep] = useState(0);
  const n = step + 1;

  const sum = (n * (n + 1)) / 2;

  // ---------- GEOMETRY BUILDERS ----------

  const staircase = () =>
    Array.from({ length: n }, (_, row) =>
      Array.from({ length: row + 1 }, (_, col) => ({
        row,
        col,
        type: 'stair'
      }))
    ).flat();

  const complement = () =>
    Array.from({ length: n }, (_, row) =>
      Array.from({ length: n - row }, (_, col) => ({
        row,
        col: row + col + 1,
        type: 'comp'
      }))
    ).flat();

  const cells = [
    ...staircase(),
    ...(step >= 2 ? complement() : [])
  ];

  // ---------- PROOF STEPS ----------

  const steps = [
    {
      name: "Base Case",
      algebra: "S₁ = 1",
      invariant: "Structure exists for n = 1",
      meaning: "We anchor the proof in a real configuration."
    },
    {
      name: "Hypothesis",
      algebra: "S_k = k(k+1)/2",
      invariant: "Staircase encodes sum",
      meaning: "We assume geometric structure matches algebra."
    },
    {
      name: "Completion",
      algebra: "S + S = n(n+1)",
      invariant: "Each row sums to n+1",
      meaning: "We add the missing complement to complete rows."
    },
    {
      name: "Rectangle",
      algebra: "Area = n(n+1)",
      invariant: "n rows × (n+1)",
      meaning: "The structure is now globally uniform."
    },
    {
      name: "Conclusion",
      algebra: "S = n(n+1)/2",
      invariant: "Partition symmetry",
      meaning: "Half the rectangle is the staircase."
    }
  ];

  const current = steps[step];

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl">

      {/* TITLE */}
      <h2 className="text-xl font-semibold mb-4">
        Visual Proof Engine: Σk = n(n+1)/2
      </h2>

      {/* GRID */}
      <div className="flex justify-center mb-10">
        <div
          className="grid gap-1 relative"
          style={{
            gridTemplateColumns: `repeat(${n + 1}, 40px)`,
            gridTemplateRows: `repeat(${n}, 40px)`
          }}
        >
          {cells.map((cell, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded flex items-center justify-center text-xs font-bold text-white
                ${cell.type === 'stair' ? 'bg-orange-500' : 'bg-blue-500'}
              `}
              style={{
                gridColumn: cell.col + 1,
                gridRow: n - cell.row
              }}
            />
          ))}

          {/* rectangle overlay */}
          {step >= 3 && (
            <div className="absolute inset-0 border-2 border-emerald-500 flex items-center justify-center text-xs text-emerald-600 font-bold">
              n(n+1) = {n * (n + 1)}
            </div>
          )}
        </div>
      </div>

      {/* ALGEBRA PANEL */}
      <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <div className="font-mono text-lg text-emerald-600">
          {current.algebra}
        </div>
      </div>

      {/* INVARIANT PANEL */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-slate-800 rounded-xl">
        <div className="text-sm">
          <strong>Invariant:</strong> {current.invariant}
        </div>
      </div>

      {/* MEANING PANEL */}
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
        <div className="text-sm">
          {current.meaning}
        </div>
      </div>

      {/* RESULT */}
      <div className="text-center mb-6 font-mono text-lg">
        1 + 2 + … + {n} = <span className="text-emerald-600">{sum}</span>
      </div>

      {/* CONTROLS */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setStep(0)}
          className="px-4 py-2 border rounded-xl"
        >
          Reset
        </button>
        <button
          onClick={() => setStep(s => Math.min(s + 1, 4))}
          className="px-6 py-2 bg-emerald-600 text-white rounded-xl"
        >
          Next →
        </button>
      </div>
    </div>
  );
}