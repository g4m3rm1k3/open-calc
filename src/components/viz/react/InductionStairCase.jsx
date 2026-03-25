import React, { useState } from 'react';

export default function InductionStaircase() {
  const [step, setStep] = useState(0);
  const maxStep = 4;

  const n = step + 1;
  const sum = (n * (n + 1)) / 2;

  const advance = () => setStep(s => Math.min(s + 1, maxStep));
  const reset = () => setStep(0);

  const tutorSteps = [
    {
      title: "Base Case – n = 1",
      body: "A single block. This equals 1. The formula gives 1(2)/2 = 1.",
      insight: "We establish a true starting configuration."
    },
    {
      title: "Inductive Hypothesis",
      body: "Assume the staircase with k rows has area k(k+1)/2.",
      insight: "We assume structure → not just numbers."
    },
    {
      title: "Geometric Completion",
      body: "Fill the missing blocks to complete each row to length n+1.",
      insight: "We are constructing the complement, not guessing symmetry."
    },
    {
      title: "Rectangle Emerges",
      body: "Each of the n rows now has n+1 blocks → total area n(n+1).",
      insight: "Invariant: every row sums to n+1."
    },
    {
      title: "Conclusion",
      body: "Original staircase is exactly half the rectangle → n(n+1)/2.",
      insight: "Partition + invariant = proof."
    }
  ];

  const current = tutorSteps[step];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border rounded-3xl p-6">

      {/* Header */}
      <div className="mb-6 p-5 bg-blue-50 dark:bg-slate-800 rounded-2xl">
        <h3 className="font-semibold text-blue-700 dark:text-blue-300">
          Geometric Proof of Σk = n(n+1)/2
        </h3>
        <p className="text-sm">
          We don’t mirror—we complete. The rectangle is an invariant construction.
        </p>
      </div>

      {/* GRID */}
      <div className="flex justify-center mb-10">
        <div
          className="grid gap-1 relative"
          style={{
            gridTemplateColumns: `repeat(${n + 1}, 44px)`,
            gridTemplateRows: `repeat(${n}, 44px)`
          }}
        >

          {/* LEFT: staircase */}
          {Array.from({ length: n }, (_, row) =>
            Array.from({ length: row + 1 }, (_, col) => (
              <div
                key={`s-${row}-${col}`}
                className="w-11 h-11 bg-orange-500 rounded flex items-center justify-center text-xs text-white font-bold"
                style={{
                  gridColumn: col + 1,
                  gridRow: n - row
                }}
              >
                {col + 1}
              </div>
            ))
          )}

          {/* RIGHT: complement */}
          {step >= 2 &&
            Array.from({ length: n }, (_, row) =>
              Array.from({ length: n - row }, (_, col) => (
                <div
                  key={`c-${row}-${col}`}
                  className="w-11 h-11 bg-blue-500 rounded"
                  style={{
                    gridColumn: row + col + 2,
                    gridRow: n - row
                  }}
                />
              ))
            )
          }

          {/* Rectangle overlay */}
          {step >= 3 && (
            <div className="absolute inset-0 border-2 border-emerald-500 flex items-center justify-center text-xs text-emerald-600 font-semibold pointer-events-none">
              n × (n+1) = {n * (n + 1)}
            </div>
          )}
        </div>
      </div>

      {/* Equation */}
      <div className="text-center mb-6 font-mono text-lg">
        1 + 2 + … + {n} = <span className="text-emerald-600">{sum}</span>
      </div>

      {/* Tutor block */}
      <div className="p-5 bg-amber-50 rounded-2xl mb-6">
        <div className="font-semibold mb-2">{current.title}</div>
        <p className="whitespace-pre-line">{current.body}</p>
        <div className="mt-3 text-sm border-t pt-2">
          <strong>Invariant:</strong> {current.insight}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button onClick={reset} className="px-4 py-2 border rounded-xl">
          Reset
        </button>
        <button
          onClick={advance}
          disabled={step >= maxStep}
          className="px-6 py-2 bg-emerald-600 text-white rounded-xl"
        >
          Next →
        </button>
      </div>
    </div>
  );
}