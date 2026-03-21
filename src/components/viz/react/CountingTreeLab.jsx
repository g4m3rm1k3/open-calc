import React, { useMemo, useState } from 'react';

function formatLarge(value) {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(2);
}

export default function CountingTreeLab() {
  const [stage1Label, setStage1Label] = useState('Shirts');
  const [stage2Label, setStage2Label] = useState('Pants');
  const [stage3Label, setStage3Label] = useState('Shoes');
  const [stage4Label, setStage4Label] = useState('Hats');
  const [stage1Count, setStage1Count] = useState(3);
  const [stage2Count, setStage2Count] = useState(2);
  const [stage3Count, setStage3Count] = useState(2);
  const [stage4Count, setStage4Count] = useState(2);
  const [stageCount, setStageCount] = useState(2);
  const [guessRate, setGuessRate] = useState(1000000000);

  const total = stageCount === 2
    ? stage1Count * stage2Count
    : stageCount === 3
      ? stage1Count * stage2Count * stage3Count
      : stage1Count * stage2Count * stage3Count * stage4Count;

  const timeToCrack = useMemo(() => {
    const seconds = total / Math.max(1, guessRate);
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    const years = days / 365;
    if (years >= 1) return `${formatLarge(years)} years`;
    if (days >= 1) return `${formatLarge(days)} days`;
    if (hours >= 1) return `${formatLarge(hours)} hours`;
    if (minutes >= 1) return `${formatLarge(minutes)} minutes`;
    if (seconds >= 1) return `${formatLarge(seconds)} seconds`;
    if (seconds >= 0.001) return `${formatLarge(seconds * 1000)} ms`;
    if (seconds >= 0.000001) return `${formatLarge(seconds * 1e6)} us`;
    return `${formatLarge(seconds * 1e9)} ns`;
  }, [total, guessRate]);

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      <div className="text-center mb-6">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">Multiplication Playground</h3>
        <p className="text-slate-400 text-sm">Build your own stage machine. Each stage multiplies the state space.</p>
      </div>

      <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-lg border-2 border-slate-800 relative mb-6">
         <div className="flex items-center justify-center gap-2 mb-5 w-full">
            <label className="text-slate-300 text-sm font-semibold mr-2">Stages</label>
            <div className="inline-flex rounded border border-slate-700 overflow-hidden">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setStageCount(n)}
                  className={`px-3 py-1 text-sm ${stageCount === n ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-300'}`}
                >
                  {n}
                </button>
              ))}
            </div>
         </div>

         <div className="flex flex-wrap justify-center gap-8 w-full mb-8">
            <div className="flex flex-col items-center text-center">
               <input
                  value={stage1Label}
                  onChange={(e) => setStage1Label(e.target.value)}
                  className="mb-2 px-2 py-1 text-xs rounded bg-slate-800 border border-slate-700 text-slate-100 text-center w-28"
               />
               <div className="flex items-center gap-3">
                  <button onClick={() => setStage1Count(Math.max(1, stage1Count - 1))} className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold hover:bg-slate-700">-</button>
                  <span className="text-brand-400 font-bold text-3xl font-serif">{stage1Count}</span>
                  <button onClick={() => setStage1Count(Math.min(20, stage1Count + 1))} className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold hover:bg-slate-700">+</button>
               </div>
            </div>

            <div className="flex flex-col items-center text-center">
               <input
                  value={stage2Label}
                  onChange={(e) => setStage2Label(e.target.value)}
                  className="mb-2 px-2 py-1 text-xs rounded bg-slate-800 border border-slate-700 text-slate-100 text-center w-28"
               />
               <div className="flex items-center gap-3">
                  <button onClick={() => setStage2Count(Math.max(1, stage2Count - 1))} className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold hover:bg-slate-700">-</button>
                  <span className="text-amber-400 font-bold text-3xl font-serif">{stage2Count}</span>
                  <button onClick={() => setStage2Count(Math.min(20, stage2Count + 1))} className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold hover:bg-slate-700">+</button>
               </div>
            </div>

            {stageCount >= 3 && (
              <div className="flex flex-col items-center text-center">
                <input
                  value={stage3Label}
                  onChange={(e) => setStage3Label(e.target.value)}
                  className="mb-2 px-2 py-1 text-xs rounded bg-slate-800 border border-slate-700 text-slate-100 text-center w-28"
                />
                <div className="flex items-center gap-3">
                  <button onClick={() => setStage3Count(Math.max(1, stage3Count - 1))} className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold hover:bg-slate-700">-</button>
                  <span className="text-emerald-400 font-bold text-3xl font-serif">{stage3Count}</span>
                  <button onClick={() => setStage3Count(Math.min(20, stage3Count + 1))} className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold hover:bg-slate-700">+</button>
                </div>
              </div>
            )}

            {stageCount >= 4 && (
              <div className="flex flex-col items-center text-center">
                <input
                  value={stage4Label}
                  onChange={(e) => setStage4Label(e.target.value)}
                  className="mb-2 px-2 py-1 text-xs rounded bg-slate-800 border border-slate-700 text-slate-100 text-center w-28"
                />
                <div className="flex items-center gap-3">
                  <button onClick={() => setStage4Count(Math.max(1, stage4Count - 1))} className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold hover:bg-slate-700">-</button>
                  <span className="text-cyan-400 font-bold text-3xl font-serif">{stage4Count}</span>
                  <button onClick={() => setStage4Count(Math.min(20, stage4Count + 1))} className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold hover:bg-slate-700">+</button>
                </div>
              </div>
            )}
         </div>

         <div className="text-center mb-8 font-serif text-2xl text-white min-h-[40px] flex items-center justify-center gap-4 bg-slate-900 px-6 py-3 rounded-full border border-slate-700 shadow-inner">
            <span className="text-brand-400 font-bold">{stage1Count} {stage1Label}</span>
            <span className="text-white">x</span>
            <span className="text-amber-400 font-bold">{stage2Count} {stage2Label}</span>
            {stageCount >= 3 && (
              <>
                <span className="text-white">x</span>
                <span className="text-emerald-400 font-bold">{stage3Count} {stage3Label}</span>
              </>
            )}
            {stageCount >= 4 && (
              <>
                <span className="text-white">x</span>
                <span className="text-cyan-400 font-bold">{stage4Count} {stage4Label}</span>
              </>
            )}
            <span className="text-white">=</span>
            <span className="text-emerald-400 font-bold text-3xl">{total} Outfits</span>
         </div>

         <div className="w-full mb-4">
            <label className="text-slate-300 text-xs block mb-2">Guesses per second: {guessRate.toLocaleString()}</label>
            <input
              type="range"
              min="1000"
              max="1000000000"
              step="1000"
              value={guessRate}
              onChange={(e) => setGuessRate(Number(e.target.value))}
              className="w-full"
            />
         </div>

         <div className="w-full bg-red-950/40 border border-red-900/50 rounded-lg p-3 text-center flex flex-col items-center justify-center shadow-[0_0_15px_#450a0a]">
            <span className="text-red-500 font-mono text-[10px] uppercase tracking-[0.2em] animate-pulse">Live Keyspace State Explosion Tracker</span>
            <span className="text-red-300 font-mono text-sm mt-1">Brute-force time at current rate: <strong className="text-red-400">{timeToCrack}</strong></span>
         </div>

      </div>

      <div className="mt-2 text-center text-sm font-medium text-slate-400 flex flex-col items-center justify-center gap-1">
         Each extra stage multiplies the full branch count, so state spaces explode exponentially. This is why brute-force quickly becomes unrealistic.
      </div>
    </div>
  );
}
