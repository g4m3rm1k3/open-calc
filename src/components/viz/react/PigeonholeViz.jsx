import React, { useState, useEffect } from 'react';
import SliderControl from '../SliderControl.jsx';

export default function PigeonholeViz() {
  const [holes, setHoles] = useState(5);
  const [pigeons, setPigeons] = useState(0);
  const [strategy, setStrategy] = useState('even'); // 'even' or 'random'

  const addPigeon = () => setPigeons((prev) => prev + 1);
  const resetPigeons = () => setPigeons(0);

  // Generate boxes and distribute
  const distribution = Array(holes).fill(0);
  
  if (strategy === 'even') {
    for (let i = 0; i < pigeons; i++) {
      distribution[i % holes]++;
    }
  } else {
    // Deterministic random so React doesn't spazz out on every re-render
    let seed = 1234;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < pigeons; i++) {
      const idx = Math.floor(random() * holes);
      distribution[idx]++;
    }
  }

  const hasConflict = pigeons > holes;

  return (
    <div className="flex flex-col items-center w-full p-4 sm:p-6 text-slate-800 dark:text-slate-200">
      
      <div className="mb-4 text-center">
        <h3 className="font-bold text-lg">Pigeonhole Simulator</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Try to place <span className="font-bold text-brand-500">{pigeons} Pigeons</span> into <span className="font-bold text-brand-500">{holes} Holes</span> without a collision!
        </p>
      </div>

      {hasConflict && (
        <div className="mb-6 px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 font-bold rounded-lg border border-red-200 dark:border-red-800 text-sm animate-pulse-slight">
          Collision Guaranteed! (Items &gt; Containers)
        </div>
      )}

      {/* The Visual Holes */}
      <div className="w-full max-w-2xl flex flex-wrap justify-center gap-3 sm:gap-6 mb-8 min-h-[140px] items-end">
        {distribution.map((count, i) => {
          const isOverfilled = count > 1 && hasConflict;
          return (
            <div 
              key={i} 
              className={`relative flex flex-col justify-end items-center w-14 h-20 sm:w-16 sm:h-24 rounded-b-xl border-x-4 border-b-4 transition-all duration-300
                ${isOverfilled 
                   ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                   : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
                }`}
            >
              {/* Display items inside */}
              <div className="flex flex-wrap justify-center gap-1 mb-2 px-1">
                {Array.from({ length: count }).map((_, j) => (
                  <div 
                    key={j} 
                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-sm animate-in fade-in slide-in-from-top-4
                      ${isOverfilled ? 'bg-red-500' : 'bg-brand-500'}`}
                  />
                ))}
              </div>
              {/* Box label */}
              <div className={`absolute -bottom-6 text-xs font-bold ${isOverfilled ? 'text-red-500' : 'text-slate-400'}`}>
                {count > 1 ? `${count} items!` : count === 1 ? '1 item' : 'Empty'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Controls */}
      <div className="w-full max-w-xl mt-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
        
        <div className="flex items-center justify-between mb-4">
          <SliderControl 
            label={`Number of Holes (N): ${holes}`} 
            min={2} 
            max={12} 
            step={1} 
            value={holes} 
            onChange={(val) => { setHoles(val); setPigeons(0); }} 
          />
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button 
            onClick={addPigeon}
            className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg shadow-sm transition-colors"
          >
            Add Pigeon (Item)
          </button>
          <button 
            onClick={resetPigeons}
            className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-lg transition-colors"
          >
            Empty All
          </button>
        </div>

        <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
            <input 
              type="radio" 
              name="strat" 
              checked={strategy === 'even'} 
              onChange={() => setStrategy('even')} 
              className="accent-brand-500" 
            />
            Try to avoid collisions
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
            <input 
              type="radio" 
              name="strat" 
              checked={strategy === 'random'} 
              onChange={() => setStrategy('random')} 
              className="accent-brand-500" 
            />
            Randomize placement
          </label>
        </div>

      </div>

    </div>
  );
}
