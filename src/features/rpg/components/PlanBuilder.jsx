import React, { useState } from 'react';
import { PREBUILT_PLANS } from '../../data/rpgPrebuiltPlans';
import { EXERCISE_DATABASE } from '../../data/rpgExercises';
import { Plus, Check, Book, Save, X } from 'lucide-react';

export function PlanBuilder({ rpgData, setActivePlan, saveCustomPlan }) {
  const [view, setView] = useState('list'); // 'list', 'create'
  
  // Custom plan creation state
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDays, setNewPlanDays] = useState([{ dayName: 'Day 1', exercises: [] }]);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(null); // stores day index

  const handleSetPlan = (planId) => {
    setActivePlan(planId);
  };

  const resetCreateForm = () => {
    setNewPlanName('');
    setNewPlanDays([{ dayName: 'Day 1', exercises: [] }]);
    setExercisePickerOpen(null);
  };

  const handleSaveCustomPlan = () => {
    const trimmed = newPlanName.trim();
    if (!trimmed) return;
    const hasExercises = newPlanDays.some(d => d.exercises.length > 0);
    if (!hasExercises) return;
    const plan = {
      id: `custom_${Date.now()}`,
      name: trimmed,
      type: 'custom',
      workouts: newPlanDays,
    };
    saveCustomPlan(plan);
    setActivePlan(plan.id);
    resetCreateForm();
    setView('list');
  };

  const addExerciseToDay = (dayIndex, exerciseId) => {
    setNewPlanDays(days => days.map((day, i) =>
      i === dayIndex
        ? { ...day, exercises: [...day.exercises, { id: exerciseId, targetSets: 3, targetReps: 10 }] }
        : day
    ));
    setExercisePickerOpen(null);
  };

  if (view === 'create') {
    return (
      <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Forge New Plan</h2>
          <button onClick={() => { resetCreateForm(); setView('list'); }} className="text-slate-400 hover:text-slate-200">
            <X size={24} />
          </button>
        </div>

        <input 
          type="text" 
          placeholder="Plan Name (e.g. Monday Legs)" 
          value={newPlanName}
          onChange={e => setNewPlanName(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 focus:border-emerald-500 focus:outline-none mb-6 font-bold"
        />

        <div className="space-y-6">
          {newPlanDays.map((day, dIdx) => (
            <div key={dIdx} className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
              <input 
                type="text" 
                value={day.dayName}
                onChange={e => {
                  const val = e.target.value;
                  setNewPlanDays(days => days.map((day, i) =>
                    i === dIdx ? { ...day, dayName: val } : day
                  ));
                }}
                className="bg-transparent text-emerald-400 font-bold mb-4 focus:outline-none w-full"
              />

              <ul className="space-y-2 mb-4">
                {day.exercises.map((ex, eIdx) => {
                  const details = EXERCISE_DATABASE.find(dbEx => dbEx.id === ex.id);
                  return (
                    <li key={eIdx} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="font-bold text-slate-300">{details?.name || ex.id}</span>
                      <button
                        onClick={() => setNewPlanDays(days => days.map((day, i) =>
                          i === dIdx
                            ? { ...day, exercises: day.exercises.filter((_, j) => j !== eIdx) }
                            : day
                        ))}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>

              {exercisePickerOpen === dIdx ? (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 max-h-60 overflow-y-auto">
                  <p className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">Choose Exercise</p>
                  <div className="grid grid-cols-1 gap-2">
                    {EXERCISE_DATABASE.map(ex => (
                      <button 
                        key={ex.id}
                        onClick={() => addExerciseToDay(dIdx, ex.id)}
                        className="text-left px-4 py-2 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
                      >
                        {ex.name} <span className="text-xs text-slate-500">({Object.keys(ex.statFocus).join(', ')})</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setExercisePickerOpen(null)} className="mt-4 w-full py-2 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                </div>
              ) : (
                <button 
                  onClick={() => setExercisePickerOpen(dIdx)}
                  className="w-full py-3 border border-dashed border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Add Exercise
                </button>
              )}
            </div>
          ))}

          <button 
            onClick={() => setNewPlanDays([...newPlanDays, { dayName: `Day ${newPlanDays.length + 1}`, exercises: [] }])}
            className="w-full py-4 text-slate-400 font-bold uppercase tracking-wider hover:text-slate-200"
          >
            + Add Another Day
          </button>
        </div>

        {(() => {
          const trimmed = newPlanName.trim();
          const hasExercises = newPlanDays.some(d => d.exercises.length > 0);
          const canSave = trimmed && hasExercises;
          return (
            <>
              {!trimmed && newPlanName.length > 0 && (
                <p className="text-red-400 text-xs text-center mt-6">Plan name cannot be blank.</p>
              )}
              {trimmed && !hasExercises && (
                <p className="text-amber-400 text-xs text-center mt-6">Add at least one exercise before saving.</p>
              )}
              <button
                onClick={handleSaveCustomPlan}
                disabled={!canSave}
                className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-cyan-600 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:shadow-none flex justify-center items-center gap-2 hover:scale-[1.02] disabled:hover:scale-100 transition-transform"
              >
                <Save size={20} /> Forbid Plan in the Grimoire
              </button>
            </>
          );
        })()}
      </div>
    );
  }

  // List View
  const allPlans = [...PREBUILT_PLANS, ...(rpgData.customPlans || [])].sort((a, b) => {
    // Put active plan first
    if (a.id === rpgData.activePlanId) return -1;
    if (b.id === rpgData.activePlanId) return 1;
    // Put class-recommended plans second
    if (a.class === rpgData.heroClass && b.class !== rpgData.heroClass) return -1;
    if (b.class === rpgData.heroClass && a.class !== rpgData.heroClass) return 1;
    return 0;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 backdrop-blur-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center gap-2">
          <Book className="text-emerald-400" /> Tomes of Training
        </h2>
        <button 
          onClick={() => setView('create')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.3)]"
        >
          <Plus size={16} /> New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allPlans.map(plan => {
          const isActive = rpgData.activePlanId === plan.id;
          const isRecommended = plan.class === rpgData.heroClass;

          return (
            <div 
              key={plan.id}
              className={`p-5 rounded-xl border transition-all relative overflow-hidden ${
                isActive 
                  ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                  : isRecommended
                    ? 'bg-fuchsia-900/20 border-fuchsia-500/30 hover:border-fuchsia-400/50'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-600'
              }`}
            >
              {isRecommended && !isActive && (
                <div className="absolute top-0 right-0 bg-fuchsia-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded-bl-lg">
                  Class Synergy
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-200">{plan.name}</h3>
                {plan.type === 'prebuilt' && <span className="text-[10px] bg-slate-800 text-cyan-400 px-2 py-1 rounded-full uppercase tracking-widest font-black">Prebuilt</span>}
              </div>
              <p className="text-sm text-slate-400 mb-4">{plan.description || `${plan.workouts?.length || 0} training days`}</p>
              
              {isActive ? (
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Check size={16} /> Active Plan
                </div>
              ) : (
                <button 
                  onClick={() => handleSetPlan(plan.id)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors text-sm"
                >
                  Set as Active
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
