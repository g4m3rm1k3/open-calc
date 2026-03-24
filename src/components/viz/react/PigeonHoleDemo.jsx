// src/components/viz/react/PigeonholeMagic.jsx
// UPDATED — now with built-in “Professor Explanation” that teaches the WHY
// exactly like you asked. The collision happens first → then the prof steps in
// and explains the modular pigeonhole logic so no one has to Google it.

import React, { useState, useEffect } from 'react';

export default function PigeonholeMagic({ params = {} }) {
  const [mode, setMode] = useState('mod9'); // 'mod9' or 'mod5'
  const [numbers, setNumbers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const modulus = mode === 'mod9' ? 9 : 5;
  const maxSafe = modulus;           // 9 or 5 — safe maximum without collision

  // Compute remainder buckets
  const buckets = Array.from({ length: modulus }, (_, r) => ({
    remainder: r,
    items: numbers.filter(n => Math.abs(n % modulus) === r)
  }));

  const hasCollision = buckets.some(b => b.items.length >= 2);

  // Auto-show the professor explanation the moment a collision appears
  useEffect(() => {
    if (hasCollision && !showExplanation) {
      setShowExplanation(true);
    }
  }, [hasCollision, showExplanation]);

  // Find a colliding pair for the live example
  let collidingPair = null;
  if (hasCollision) {
    for (let b of buckets) {
      if (b.items.length >= 2) {
        collidingPair = b.items.slice(0, 2);
        break;
      }
    }
  }

  const addRandomNumber = () => {
    const newNum = Math.floor(Math.random() * 100) + 1;
    setNumbers(prev => [...prev, newNum]);
  };

  const addWorstCase = () => {
    const worst = Array.from({ length: maxSafe }, (_, i) => i * 7 + 3); // one per remainder
    setNumbers(worst);
    setShowExplanation(false); // hide explanation until real collision
  };

  const reset = () => {
    setNumbers([]);
    setShowExplanation(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    reset();
  };

  const profText = mode === 'mod9'
    ? `There are only 9 possible remainders when you divide any integer by 9 (0 through 8). 
       If you pick 10 numbers, that’s 10 pigeons and only 9 holes. 
       By the pigeonhole principle at least one remainder must be shared by two numbers.`
    : `There are only 5 possible remainders when you divide any integer by 5 (0 through 4). 
       If you pick 6 integers, that’s 6 pigeons and only 5 holes. 
       So at least two numbers must fall into the same remainder bucket.`;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {mode === 'mod9' 
              ? '10 numbers → at least two have the same remainder mod 9'
              : 'Any 6 integers → two differ by a multiple of 5'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The hidden modular “pigeonholes” that make collisions inevitable
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => switchMode('mod9')}
            className={`px-4 py-1 text-sm rounded-2xl font-medium transition-colors ${
              mode === 'mod9' ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Mod 9
          </button>
          <button
            onClick={() => switchMode('mod5')}
            className={`px-4 py-1 text-sm rounded-2xl font-medium transition-colors ${
              mode === 'mod5' ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Diff mod 5
          </button>
        </div>
      </div>

      {/* Your numbers */}
      <div className="mb-6">
        <div className="text-xs font-mono text-slate-400 mb-2">
          Numbers added ({numbers.length})
        </div>
        <div className="flex flex-wrap gap-2 min-h-[52px]">
          {numbers.length === 0 ? (
            <div className="text-slate-400 text-sm italic">Add numbers — each one lands in a remainder bucket</div>
          ) : (
            numbers.map((n, i) => (
              <div key={i} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl font-mono text-sm flex items-center gap-1">
                {n}
                <span className="text-xs text-slate-400">→ rem {Math.abs(n % modulus)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Buckets */}
      <div className="grid grid-cols-5 sm:grid-cols-9 gap-3 mb-8">
        {buckets.map(bucket => (
          <div
            key={bucket.remainder}
            className={`border-2 rounded-2xl p-3 flex flex-col items-center transition-colors ${
              bucket.items.length >= 2 ? 'border-red-400 bg-red-50 dark:bg-red-950/30' : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="text-xs font-mono text-slate-400 mb-1">rem {bucket.remainder}</div>
            <div className="flex flex-wrap justify-center gap-1 min-h-[68px]">
              {bucket.items.map((num, idx) => (
                <div key={idx} className="text-xs font-semibold bg-white dark:bg-slate-700 shadow-sm px-3 py-1 rounded-xl">
                  {num}
                </div>
              ))}
            </div>
            {bucket.items.length > 0 && (
              <div className="mt-auto text-sm font-mono text-slate-500">
                {bucket.items.length} {bucket.items.length === 1 ? 'item' : 'items'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Collision banner + pair */}
      {hasCollision && collidingPair && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-3xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🪄</div>
            <div className="flex-1">
              <div className="uppercase text-amber-600 dark:text-amber-400 text-xs font-bold tracking-widest mb-1">
                COLLISION DETECTED
              </div>
              <p className="text-slate-700 dark:text-slate-200 leading-tight">
                Numbers <strong className="font-mono">{collidingPair[0]}</strong> and{' '}
                <strong className="font-mono">{collidingPair[1]}</strong> both leave remainder{' '}
                <strong>{Math.abs(collidingPair[0] % modulus)}</strong>.
              </p>
              <p className="mt-3 font-medium text-amber-700 dark:text-amber-300">
                Difference = <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                  {Math.abs(collidingPair[0] - collidingPair[1])}
                </span> 
                {' '}→ divisible by {modulus}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Professor Explanation — this is the new “why” layer you asked for */}
      {showExplanation && (
        <div className="mb-8 p-6 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-600 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">👨‍🏫</div>
            <h4 className="font-semibold text-blue-700 dark:text-blue-300">Professor’s Step-by-Step Explanation</h4>
          </div>
          
          <div className="prose dark:prose-invert text-sm leading-relaxed">
            <p>
              When you divide <strong>any integer</strong> by {modulus}, the only possible remainders are <strong>0, 1, 2, …, {modulus-1}</strong>.
            </p>
            <p className="mt-3">
              That’s exactly <strong>{modulus} possible “pigeonholes”</strong>.
            </p>
            <p className="mt-3 font-medium">
              If you pick <strong>{modulus + 1}</strong> numbers (the 6th number in mod-5 mode, or the 10th in mod-9 mode), 
              you have more pigeons than holes.
            </p>
            <p className="mt-3">
              By the pigeonhole principle at least <strong>one remainder must be shared</strong> by two different numbers.
            </p>
            <div className="mt-6 text-xs bg-white dark:bg-slate-700 p-4 rounded-2xl border border-blue-100 dark:border-slate-500">
              <strong>Why this matters in the real world:</strong><br />
              • Same remainder mod 9 → checksums can catch transmission errors<br />
              • Same remainder mod 5 → difference is divisible by 5 (the “odd differences” theorem)<br />
              • Same remainder mod anything → appears in cryptography, hashing, and number theory proofs
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={addRandomNumber}
          className="flex-1 sm:flex-none px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-2xl hover:bg-orange-600 hover:text-white transition-colors"
        >
          + Add random number (1–100)
        </button>

        <button
          onClick={addWorstCase}
          className="flex-1 sm:flex-none px-6 py-4 border border-slate-300 dark:border-slate-600 font-medium rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Fill worst-case ({maxSafe} numbers — still safe)
        </button>

        <button
          onClick={reset}
          className="px-6 py-4 border border-slate-300 dark:border-slate-600 font-medium rounded-2xl hover:bg-red-50 dark:hover:bg-red-950"
        >
          Reset
        </button>
      </div>

      <div className="mt-8 text-xs text-slate-400 dark:text-slate-500 text-center">
        Add numbers until a collision appears.<br />
        The professor box only opens once you see the collision — that’s when the “why” finally clicks.
      </div>
    </div>
  );
}