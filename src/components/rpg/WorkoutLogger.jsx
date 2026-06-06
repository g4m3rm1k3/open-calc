import React, { useState } from 'react';
import { Activity, Dumbbell, Route, Timer, ArrowDownToLine, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const EXERCISE_TYPES = [
  { id: 'pushups', name: 'Pushups', icon: Dumbbell, xpPerUnit: 10, unit: 'reps', color: 'rose' },
  { id: 'pullups', name: 'Pullups', icon: Dumbbell, xpPerUnit: 20, unit: 'reps', color: 'indigo' },
  { id: 'running', name: 'Running', icon: Route, xpPerUnit: 100, unit: 'km', color: 'emerald' },
  { id: 'plank', name: 'Plank', icon: Timer, xpPerUnit: 5, unit: 'seconds', color: 'amber' },
  { id: 'steps', name: 'Walking Steps', icon: Activity, xpPerUnit: 0.1, unit: 'steps', color: 'sky' }
];

export function WorkoutLogger({ logWorkout }) {
  const [selectedType, setSelectedType] = useState(EXERCISE_TYPES[0]);
  const [amount, setAmount] = useState('');
  const [rpe, setRpe] = useState(5);
  const [levelUpMessage, setLevelUpMessage] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) return;
    
    const xpEarned = Math.round(amount * selectedType.xpPerUnit);
    const leveledUp = logWorkout(selectedType.id, amount, xpEarned, rpe);
    
    if (leveledUp) {
      setLevelUpMessage(true);
      setTimeout(() => setLevelUpMessage(false), 5000);
    }
    setAmount('');
  };

  const syncHealthData = () => {
    try {
      const storeStr = localStorage.getItem('oc-health-v1');
      if (!storeStr) {
        alert("No Health App data found to sync.");
        return;
      }
      const data = JSON.parse(storeStr);
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = data.entries?.find(e => e.date === today);
      
      if (!todayEntry) {
        alert("No Health entries found for today.");
        return;
      }

      let totalSyncXp = 0;
      if (todayEntry.steps && todayEntry.steps > 0) {
        const stepsXp = Math.round(todayEntry.steps * 0.1);
        const leveledUp = logWorkout('steps', todayEntry.steps, stepsXp);
        if (leveledUp) setLevelUpMessage(true);
        totalSyncXp += stepsXp;
      }
      
      if (totalSyncXp > 0) {
        alert(`Synced today's health data! Earned ${totalSyncXp} XP.`);
      } else {
        alert("Today's Health entry had no relevant workout data to sync (e.g. steps).");
      }
    } catch (e) {
      console.error("Failed to sync health data", e);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl relative">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/50">
            <Flame className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Log Workout</h2>
            <p className="text-xs text-slate-400">Convert sweat into XP</p>
          </div>
        </div>
        <button 
          onClick={syncHealthData}
          className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 bg-sky-950/40 px-3 py-1.5 rounded border border-sky-800 transition-colors"
        >
          <ArrowDownToLine className="w-3.5 h-3.5" /> Sync Health App
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {EXERCISE_TYPES.map(type => {
            const Icon = type.icon;
            const isSelected = selectedType.id === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  isSelected 
                    ? `bg-${type.color}-500/20 border-${type.color}-500 text-${type.color}-400` 
                    : 'bg-slate-950/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{type.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Amount (${selectedType.unit})`}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 uppercase">
              {selectedType.unit}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center px-1 mb-1">
              <label className="text-xs font-bold text-slate-400 uppercase">How did it feel?</label>
              <span className="text-xs font-mono text-emerald-400">{rpe}/10 (RPE)</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={rpe}
              onChange={(e) => setRpe(parseInt(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <button 
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 md:py-0 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0"
          >
            Log It
          </button>
        </div>
      </form>

      {levelUpMessage && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 bg-yellow-500/90 rounded-2xl flex flex-col items-center justify-center z-20 backdrop-blur-sm"
        >
          <Flame className="w-16 h-16 text-white mb-2 animate-bounce" />
          <h2 className="text-3xl font-black text-white drop-shadow-lg">LEVEL UP!</h2>
          <p className="text-yellow-100 font-bold">Your stats have increased!</p>
        </motion.div>
      )}
    </div>
  );
}
