import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXERCISE_DATABASE, EXERCISE_TYPES } from '../../data/rpgExercises';
import { Dumbbell, Activity, ShieldPlus, ChevronDown } from 'lucide-react';

export function WorkoutLogger({ logDetailedWorkout }) {
  const [selectedExId, setSelectedExId] = useState(EXERCISE_DATABASE[0].id);
  const [metrics, setMetrics] = useState({ weight: '', sets: '', reps: '', distance: '', duration: '' });
  const [rpe, setRpe] = useState(5);
  const [levelUpMessage, setLevelUpMessage] = useState(false);

  const selectedEx = EXERCISE_DATABASE.find(e => e.id === selectedExId);

  const handleMetricChange = (e) => {
    setMetrics({ ...metrics, [e.target.name]: e.target.value });
  };

  const calculateXpAndStats = () => {
    let xp = 0;
    
    // Convert inputs to numbers
    const w = parseFloat(metrics.weight) || 0;
    const s = parseInt(metrics.sets) || 1;
    const r = parseInt(metrics.reps) || 0;
    const dKm = parseFloat(metrics.distance) || 0;
    const dMin = parseFloat(metrics.duration) || 0;

    if (selectedEx.type === EXERCISE_TYPES.WEIGHT_REPS) {
      // e.g. Bench press: (reps * sets) * (weight/10) * base
      const volumeFactor = w > 0 ? (w / 20) : 1; 
      xp = s * r * selectedEx.baseXpPerRep * volumeFactor;
    } else if (selectedEx.type === EXERCISE_TYPES.BODYWEIGHT_REPS) {
      xp = s * r * selectedEx.baseXpPerRep;
    } else if (selectedEx.type === EXERCISE_TYPES.DISTANCE_TIME) {
      xp = dKm * selectedEx.baseXpPerKm;
    } else if (selectedEx.type === EXERCISE_TYPES.TIME_HOLD || selectedEx.type === EXERCISE_TYPES.ISOMETRIC) {
      xp = dMin * selectedEx.baseXpPerMinute * s;
    }

    // Multiply by RPE factor (higher RPE = slightly more XP)
    const rpeMultiplier = 1 + ((rpe - 5) * 0.05); // +/- 25% max
    xp = Math.round(xp * rpeMultiplier);

    // Distribute XP to stats
    const statGains = {};
    Object.keys(selectedEx.statFocus).forEach(stat => {
      // 1 XP = roughly 0.1 stat point to avoid numbers exploding too fast
      statGains[stat] = (xp * selectedEx.statFocus[stat]) * 0.1;
    });

    return { xp, statGains };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (xp === 0) return; // Prevent empty logs
    
    const { xp, statGains } = calculateXpAndStats();
    
    const finalMetrics = { ...metrics, rpe };
    const leveledUp = logDetailedWorkout(selectedEx.id, finalMetrics, xp, statGains);
    
    if (leveledUp) {
      setLevelUpMessage(true);
      setTimeout(() => setLevelUpMessage(false), 5000);
    }

    // Reset fields
    setMetrics({ weight: '', sets: '', reps: '', distance: '', duration: '' });
    setRpe(5);
  };

  // Safe check before calculating preview
  let previewXp = 0;
  if (selectedEx) {
    previewXp = calculateXpAndStats().xp;
  }

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
      <AnimatePresence>
        {levelUpMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md rounded-2xl"
          >
            <ShieldPlus size={64} className="text-emerald-400 mb-4 animate-bounce" />
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-center uppercase tracking-widest drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]">Level Up!</h2>
            <p className="text-emerald-200 mt-2 font-bold text-center">Your power grows.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-500/20 rounded-xl">
          <Dumbbell className="text-emerald-400" size={24} />
        </div>
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Log Training</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Exercise Selection */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Select Exercise</label>
          <div className="relative">
            <select 
              value={selectedExId} 
              onChange={(e) => setSelectedExId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-emerald-500 appearance-none font-bold"
            >
              {EXERCISE_DATABASE.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={20} />
          </div>
          <p className="text-xs text-emerald-500/70 mt-2 font-mono">
            Focus: {selectedEx && Object.entries(selectedEx.statFocus).map(([k, v]) => `${k} ${(v*100)}%`).join(' | ')}
          </p>
        </div>

        {/* Dynamic Inputs based on Type */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          
          {(selectedEx.type === EXERCISE_TYPES.WEIGHT_REPS) && (
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Weight (lbs)</label>
              <input type="number" name="weight" value={metrics.weight} onChange={handleMetricChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200" placeholder="e.g. 135" />
            </div>
          )}

          {(selectedEx.type === EXERCISE_TYPES.WEIGHT_REPS || selectedEx.type === EXERCISE_TYPES.BODYWEIGHT_REPS || selectedEx.type === EXERCISE_TYPES.TIME_HOLD || selectedEx.type === EXERCISE_TYPES.ISOMETRIC) && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Sets</label>
              <input type="number" name="sets" value={metrics.sets} onChange={handleMetricChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200" placeholder="e.g. 3" />
            </div>
          )}

          {(selectedEx.type === EXERCISE_TYPES.WEIGHT_REPS || selectedEx.type === EXERCISE_TYPES.BODYWEIGHT_REPS) && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Reps</label>
              <input type="number" name="reps" value={metrics.reps} onChange={handleMetricChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200" placeholder="e.g. 10" />
            </div>
          )}

          {(selectedEx.type === EXERCISE_TYPES.DISTANCE_TIME) && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Distance (km)</label>
              <input type="number" name="distance" value={metrics.distance} onChange={handleMetricChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200" placeholder="e.g. 5" />
            </div>
          )}

          {(selectedEx.type === EXERCISE_TYPES.DISTANCE_TIME || selectedEx.type === EXERCISE_TYPES.TIME_HOLD || selectedEx.type === EXERCISE_TYPES.ISOMETRIC) && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Duration (mins)</label>
              <input type="number" name="duration" value={metrics.duration} onChange={handleMetricChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200" placeholder="e.g. 30" />
            </div>
          )}
        </div>

        {/* RPE & Submit */}
        <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-950/50 p-4 rounded-xl border border-slate-800">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center px-1 mb-1">
              <label className="text-xs font-bold text-slate-400 uppercase">How did it feel?</label>
              <span className="text-xs font-mono text-emerald-400">{rpe}/10 (RPE)</span>
            </div>
            <input 
              type="range" min="1" max="10" value={rpe} onChange={(e) => setRpe(parseInt(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <button 
            type="submit"
            disabled={previewXp === 0}
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:shadow-none flex items-center justify-center gap-2"
          >
            Log Activity <span className="font-mono bg-black/20 px-2 py-0.5 rounded text-sm">+{previewXp} XP</span>
          </button>
        </div>
      </form>
    </div>
  );
}
