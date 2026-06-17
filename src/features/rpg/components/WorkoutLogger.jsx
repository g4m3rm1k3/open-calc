import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXERCISE_DATABASE, EXERCISE_TYPES } from '../data/rpgExercises';
import { PREBUILT_PLANS } from '../data/rpgPrebuiltPlans';
import { Dumbbell, Activity, ShieldPlus, X, Plus, PlaySquare, Wind, Hand, Trophy } from 'lucide-react';

const getIconForType = (type) => {
  if (type === EXERCISE_TYPES.WEIGHT_REPS || type === EXERCISE_TYPES.BODYWEIGHT_REPS) return <Dumbbell size={18} className="text-emerald-400" />;
  if (type === EXERCISE_TYPES.DISTANCE_TIME) return <Wind size={18} className="text-cyan-400" />;
  if (type === EXERCISE_TYPES.TIME_HOLD || type === EXERCISE_TYPES.ISOMETRIC) return <Hand size={18} className="text-fuchsia-400" />;
  return <Activity size={18} className="text-orange-400" />;
};

function formatPR(pr, type) {
  if (!pr) return null;
  if (type === EXERCISE_TYPES.WEIGHT_REPS) return `${pr.weight}lbs × ${pr.reps}`;
  if (type === EXERCISE_TYPES.BODYWEIGHT_REPS) return `${pr.reps} reps`;
  if (type === EXERCISE_TYPES.DISTANCE_TIME) return `${pr.distance}km`;
  if (type === EXERCISE_TYPES.TIME_HOLD || type === EXERCISE_TYPES.ISOMETRIC) return `${pr.duration}min`;
  return null;
}

export function WorkoutLogger({ logDetailedWorkout, activePlan, personalRecords = {} }) {
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [workoutRows, setWorkoutRows] = useState([]);
  const [levelUpMessage, setLevelUpMessage] = useState(false);
  const [newPrNames, setNewPrNames] = useState([]);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Load plan when activePlan or activeDayIdx changes
  useEffect(() => {
    if (!activePlan) {
      setWorkoutRows([]);
      return;
    }

    if (activePlan.workouts && activePlan.workouts[activeDayIdx]) {
      const dayExercises = activePlan.workouts[activeDayIdx].exercises.map((ex, idx) => ({
        ...ex,
        rowId: `row-${activePlan.id}-${activeDayIdx}-${idx}`, // Stable ID based on plan and index
        metrics: {
          weight: '',
          sets: ex.targetSets || '',
          reps: ex.targetReps || '',
          distance: ex.targetDistanceKm || '',
          duration: ex.targetDurationMinutes || '',
          rpe: 5
        }
      }));
      setWorkoutRows(dayExercises);
    } else {
      setWorkoutRows([]);
    }
  }, [activePlan, activeDayIdx]);

  const handleMetricChange = (rowId, field, value) => {
    setWorkoutRows(rows => rows.map(row => 
      row.rowId === rowId ? { ...row, metrics: { ...row.metrics, [field]: value } } : row
    ));
  };

  const removeRow = (rowId) => {
    setWorkoutRows(rows => rows.filter(r => r.rowId !== rowId));
  };

  const addRow = (exerciseId) => {
    setWorkoutRows(rows => [
      ...rows,
      {
        id: exerciseId,
        rowId: `row-spontaneous-${Date.now()}`, // fine for ad-hoc since it's a one-time user action
        metrics: { weight: '', sets: '', reps: '', distance: '', duration: '', rpe: 5 }
      }
    ]);
    setShowAddMenu(false);
  };

  const calculateRowXpAndStats = (row) => {
    const exDb = EXERCISE_DATABASE.find(e => e.id === row.id);
    if (!exDb) return { xp: 0, statGains: {} };

    let xp = 0;
    const m = row.metrics;
    const w = parseFloat(m.weight) || 0;
    const s = parseInt(m.sets) || 1;
    const r = parseInt(m.reps) || 0;
    const dKm = parseFloat(m.distance) || 0;
    const dMin = parseFloat(m.duration) || 0;
    const rpe = parseInt(m.rpe) || 5;

    if (exDb.type === EXERCISE_TYPES.WEIGHT_REPS) {
      const volumeFactor = w > 0 ? (w / 20) : 1; 
      xp = s * r * exDb.baseXpPerRep * volumeFactor;
    } else if (exDb.type === EXERCISE_TYPES.BODYWEIGHT_REPS) {
      xp = s * r * exDb.baseXpPerRep;
    } else if (exDb.type === EXERCISE_TYPES.DISTANCE_TIME) {
      xp = dKm * exDb.baseXpPerKm;
    } else if (exDb.type === EXERCISE_TYPES.TIME_HOLD || exDb.type === EXERCISE_TYPES.ISOMETRIC) {
      xp = dMin * exDb.baseXpPerMinute * s;
    }

    const rpeMultiplier = 1 + ((rpe - 5) * 0.05);
    xp = Math.round(xp * rpeMultiplier);

    const statGains = {};
    Object.keys(exDb.statFocus).forEach(stat => {
      statGains[stat] = (xp * exDb.statFocus[stat]) * 0.1;
    });

    return { xp, statGains };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const entries = workoutRows
      .map(row => {
        const { xp, statGains } = calculateRowXpAndStats(row);
        return xp > 0
          ? { exerciseId: row.id, metrics: row.metrics, calculatedXp: xp, statGains }
          : null;
      })
      .filter(Boolean);

    if (entries.length === 0) return;

    const { leveledUp, newPrs } = logDetailedWorkout(entries);

    if (leveledUp) {
      setLevelUpMessage(true);
      setTimeout(() => setLevelUpMessage(false), 5000);
    }
    if (newPrs?.length) {
      setNewPrNames(newPrs);
      setTimeout(() => setNewPrNames([]), 5000);
    }

    setWorkoutRows(rows => rows.map(r => ({
      ...r,
      metrics: { weight: '', sets: '', reps: '', distance: '', duration: '', rpe: 5 }
    })));
  };

  const totalPreviewXp = workoutRows.reduce((sum, row) => sum + calculateRowXpAndStats(row).xp, 0);

  if (!activePlan) {
    return (
      <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-8 text-center backdrop-blur-xl">
        <PlaySquare className="text-slate-500 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-bold text-slate-300 mb-2">No Active Plan</h3>
        <p className="text-slate-500">Select a training tome from the Plan Builder above to begin your session.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 relative backdrop-blur-xl">
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
        {!levelUpMessage && newPrNames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md rounded-2xl"
          >
            <Trophy size={64} className="text-amber-400 mb-4 animate-bounce drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 text-center uppercase tracking-widest">New Record!</h2>
            <div className="mt-3 space-y-1 text-center">
              {newPrNames.map(name => (
                <p key={name} className="text-amber-200 font-bold">{name}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            {activePlan.name}
          </h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Daily Log</p>
        </div>
        
        {/* Day Switcher */}
        {activePlan.workouts && activePlan.workouts.length > 1 && (
          <div className="flex gap-2 bg-slate-950 p-1 rounded-lg">
            {activePlan.workouts.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDayIdx(idx)}
                className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                  activeDayIdx === idx ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {day.dayName || `Day ${idx + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {workoutRows.map((row) => {
          const exDb = EXERCISE_DATABASE.find(e => e.id === row.id);
          if (!exDb) return null;

          return (
            <motion.div 
              key={row.rowId}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 group relative overflow-hidden"
            >
              {/* Delete button (Swipe/X) */}
              <button 
                type="button"
                onClick={() => removeRow(row.rowId)}
                className="absolute top-2 right-2 p-2 text-slate-600 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  {getIconForType(exDb.type)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">{exDb.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{Object.keys(exDb.statFocus).join(' | ')}</p>
                    {formatPR(personalRecords[row.id], exDb.type) && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                        <Trophy size={9} /> {formatPR(personalRecords[row.id], exDb.type)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Inputs */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-2">
                {(exDb.type === EXERCISE_TYPES.WEIGHT_REPS) && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Weight</label>
                    <input type="number" placeholder="lbs" value={row.metrics.weight} onChange={e => handleMetricChange(row.rowId, 'weight', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none" />
                  </div>
                )}
                {(exDb.type === EXERCISE_TYPES.WEIGHT_REPS || exDb.type === EXERCISE_TYPES.BODYWEIGHT_REPS || exDb.type === EXERCISE_TYPES.TIME_HOLD || exDb.type === EXERCISE_TYPES.ISOMETRIC) && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Sets</label>
                    <input type="number" placeholder="sets" value={row.metrics.sets} onChange={e => handleMetricChange(row.rowId, 'sets', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none" />
                  </div>
                )}
                {(exDb.type === EXERCISE_TYPES.WEIGHT_REPS || exDb.type === EXERCISE_TYPES.BODYWEIGHT_REPS) && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Reps</label>
                    <input type="number" placeholder="reps" value={row.metrics.reps} onChange={e => handleMetricChange(row.rowId, 'reps', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none" />
                  </div>
                )}
                {(exDb.type === EXERCISE_TYPES.DISTANCE_TIME) && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Dist (km)</label>
                    <input type="number" placeholder="km" value={row.metrics.distance} onChange={e => handleMetricChange(row.rowId, 'distance', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none" />
                  </div>
                )}
                {(exDb.type === EXERCISE_TYPES.DISTANCE_TIME || exDb.type === EXERCISE_TYPES.TIME_HOLD || exDb.type === EXERCISE_TYPES.ISOMETRIC) && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Time (m)</label>
                    <input type="number" placeholder="mins" value={row.metrics.duration} onChange={e => handleMetricChange(row.rowId, 'duration', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 outline-none" />
                  </div>
                )}

                {/* RPE Slider inline */}
                <div className="col-span-3 sm:col-span-2 md:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">RPE (Feel)</label>
                    <span className="text-[10px] font-mono text-emerald-400">{row.metrics.rpe}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" value={row.metrics.rpe} onChange={e => handleMetricChange(row.rowId, 'rpe', e.target.value)}
                    className="w-full accent-emerald-500 h-2"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Add Row Button */}
        <div className="relative">
          {showAddMenu ? (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 max-h-60 overflow-y-auto z-10 absolute bottom-full w-full mb-2 shadow-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Add Exercise</span>
                <button onClick={() => setShowAddMenu(false)} className="text-slate-500 hover:text-white"><X size={16}/></button>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {EXERCISE_DATABASE.map(ex => (
                  <button 
                    key={ex.id} type="button" onClick={() => addRow(ex.id)}
                    className="text-left px-3 py-2 hover:bg-slate-800 rounded-lg text-slate-300 text-sm flex items-center justify-between"
                  >
                    <span>{ex.name}</span>
                    <span className="text-[10px] text-emerald-500/50">{Object.keys(ex.statFocus).join(', ')}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button 
              type="button"
              onClick={() => setShowAddMenu(true)}
              className="w-full py-3 border border-dashed border-slate-600 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={18} /> Add Spontaneous Exercise
            </button>
          )}
        </div>

        {/* Submit */}
        <button 
          type="submit"
          disabled={totalPreviewXp === 0}
          className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:scale-[1.01] disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:scale-100 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:shadow-none flex items-center justify-center gap-2 transition-all"
        >
          Transcribe to Ledger <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-sm font-bold">+{totalPreviewXp} XP</span>
        </button>
      </form>
    </div>
  );
}
