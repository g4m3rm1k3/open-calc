import React, { useState } from 'react';

export default function InductionProofSimulator({ params = {} }) {
  const [mode, setMode] = useState('standard'); // standard | strong | recursive
  const [step, setStep] = useState(0);

  const presets = {
    standard: { title: 'Sum of First n Numbers', formula: '1 + 2 + … + n = n(n+1)/2' },
    strong: { title: 'Every integer > 1 has a prime factor', formula: 'Strong induction needed' },
    recursive: { title: 'Recursive Fibonacci Definition', formula: 'F(n) = F(n-1) + F(n-2)' },
  };

  const maxSteps = 5;
  const advance = () => setStep(s => Math.min(s + 1, maxSteps));
  const reset = () => setStep(0);

  const tutorMessages = {
    0: {
      title: 'Base Case',
      body: 'We prove the statement for the smallest value (usually n=1). Without this, the whole proof collapses — a common gotcha.',
      insight: 'Definition: The base case is the foundation. If it fails, induction is invalid.'
    },
    1: {
      title: 'Inductive Hypothesis',
      body: 'Assume the statement is true for some k (or all values up to k in strong induction).',
      insight: 'Gotcha: A weak hypothesis can make the step impossible. That’s when strong induction saves you.'
    },
    2: {
      title: 'Inductive Step',
      body: 'Using the hypothesis, prove the statement for k+1. This is where the recursive structure grows.',
      insight: 'Connection to math: The inductive step mirrors the recursive definition — each new layer is built from previous ones.'
    },
    3: {
      title: 'Conclusion',
      body: 'By the principle of mathematical induction, the statement holds for all n ≥ base.',
      insight: 'Insight: Induction + recursion are two sides of the same coin. One proves, the other constructs.'
    },
  };

  const currentTutor = tutorMessages[step] || { title: '', body: '', insight: '' };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6">
      {/* Header – self-contained lesson */}
      <div className="mb-6 p-5 bg-blue-50 dark:bg-slate-800 rounded-2xl border border-blue-200 dark:border-slate-600">
        <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Self-Contained Lesson: Induction & Recursion</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This visualization teaches the full topic on its own: definitions, base case, inductive step, recursion, common gotchas, and how intuition connects to the formal math.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-6 border-b pb-4">
        {Object.keys(presets).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); reset(); }}
            className={`flex-1 py-3 rounded-2xl text-sm font-medium ${mode === m ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'}`}
          >
            {presets[m].title}
          </button>
        ))}
      </div>

      {/* Current statement */}
      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-medium text-center">
        Proving: <span className="font-mono">{presets[mode].formula}</span>
      </div>

      {/* Visual growth area */}
      <div className="min-h-[320px] flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 rounded-3xl mb-8 relative overflow-hidden">
        <div className="text-center">
          {/* Recursive growth visualization */}
          <div className="flex justify-center gap-8 mb-8">
            {Array.from({ length: step + 1 }, (_, i) => (
              <div
                key={i}
                className={`w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-2xl shadow-inner transition-all ${
                  i < step ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                }`}
              >
                {i === 0 ? 'Base' : `k+${i}`}
              </div>
            ))}
          </div>

          {/* Recursive call tree (simple but clear) */}
          <div className="text-xs text-slate-400 mb-2">Recursive structure built so far</div>
          <div className="flex justify-center">
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: Math.min(step + 3, 12) }, (_, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono transition-colors ${
                    i < step * 2 ? 'bg-emerald-400 text-white' : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  R
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step controls */}
      <div className="flex justify-center gap-4 mb-8">
        <button onClick={reset} className="px-6 py-3 border rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800">Reset Proof</button>
        <button
          onClick={advance}
          disabled={step >= maxSteps}
          className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-medium disabled:opacity-50"
        >
          {step === 0 ? 'Start Base Case' : 'Next Step →'}
        </button>
      </div>

      {/* Tutor / Teaching panel – definitions, gotchas, insights */}
      <div className="p-6 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-3xl">
        <div className="flex items-start gap-4">
          <span className="text-4xl">📘</span>
          <div className="flex-1">
            <div className="uppercase text-amber-600 dark:text-amber-400 text-xs font-bold mb-1">
              Step {step} — {currentTutor.title}
            </div>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{currentTutor.body}</p>
            
            <div className="mt-6 pt-4 border-t border-amber-200 dark:border-amber-700 text-xs">
              <strong className="text-amber-700 dark:text-amber-300">Key Insight / Gotcha:</strong><br />
              {currentTutor.insight}
            </div>

            <div className="mt-4 text-[10px] text-slate-400">
              This step directly mirrors the formal proof in the Rigor section. The recursive tree grows only because the inductive step holds.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-xs text-center text-slate-400">
        This visualization is self-contained. It teaches the full topic: definitions, why the base case matters, common gotchas, and how induction + recursion are two sides of the same mathematical coin.
      </div>
    </div>
  );
}