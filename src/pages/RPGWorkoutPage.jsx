import React from 'react';
import { useRPGData } from '../hooks/useRPGData';
import { ClassSelector } from '../components/rpg/ClassSelector';
import { HeroPanel } from '../components/rpg/HeroPanel';
import { WorkoutLogger } from '../components/rpg/WorkoutLogger';
import { QuestBoard } from '../components/rpg/QuestBoard';
import { PlanBuilder } from '../components/rpg/PlanBuilder';
import { RadarChart } from '../components/rpg/RadarChart';
import { RPGFantasyBackground } from '../components/rpg/RPGFantasyBackground';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { PREBUILT_PLANS } from '../data/rpgPrebuiltPlans';

export default function RPGWorkoutPage() {
  const { 
    rpgData, 
    loading, 
    setOnboardingData, 
    addXP, 
    logDetailedWorkout, 
    setActivePlan,
    saveCustomPlan,
    acceptQuest, 
    completeQuest 
  } = useRPGData();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If user hasn't selected a class yet
  if (!rpgData.heroClass) {
    return (
      <div className="min-h-screen text-slate-200 relative">
        <RPGFantasyBackground />
        <div className="relative z-10">
          <ClassSelector onSelect={setOnboardingData} />
        </div>
      </div>
    );
  }

  const activePlan = [...PREBUILT_PLANS, ...(rpgData.customPlans || [])].find(p => p.id === rpgData.activePlanId);

  // Dashboard View
  return (
    <div className="min-h-screen text-slate-200 p-4 md:p-8 pb-32 md:pb-8 relative">
      <RPGFantasyBackground />
      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">
            Hero's Journey
          </h1>
          <p className="text-slate-400 font-medium">Train in reality. Level up in fantasy.</p>
        </header>

        {/* Hero Stats & Radar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <HeroPanel rpgData={rpgData} />
          </div>
          <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center backdrop-blur-xl">
            <h3 className="text-slate-400 font-bold mb-2 text-sm uppercase tracking-wider text-center">Stat Balance</h3>
            <RadarChart stats={rpgData.stats || { STR: 10, END: 10, AGI: 10, DEX: 10 }} maxScore={Math.max(100, ...Object.values(rpgData.stats || { STR: 100 }))} size={220} color="emerald" />
          </div>
        </div>

        {/* Plan Builder */}
        <div className="mb-6">
          <PlanBuilder rpgData={rpgData} setActivePlan={setActivePlan} saveCustomPlan={saveCustomPlan} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Actions */}
          <div className="space-y-6">
            <WorkoutLogger logDetailedWorkout={logDetailedWorkout} activePlan={activePlan} />
            
            {/* Logs Preview */}
            <div className="bg-slate-900/40 rounded-2xl p-6 border border-slate-800">
              <h3 className="text-slate-400 font-bold mb-4 text-sm uppercase tracking-wider">Recent Activity</h3>
              {rpgData.workoutLogs.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No recent training logs.</p>
              ) : (
                <ul className="space-y-3">
                  {rpgData.workoutLogs.slice(0, 5).map(log => (
                    <li key={log.id} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                      <div>
                        <span className="font-bold text-slate-300 capitalize">{log.type}</span>
                        <span className="text-slate-500 ml-2">x {log.value}</span>
                      </div>
                      <span className="text-emerald-400 font-mono">+{log.xpEarned} XP</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right Column: Quests */}
          <div className="h-full">
            <QuestBoard 
              rpgData={rpgData} 
              acceptQuest={acceptQuest} 
              completeQuest={completeQuest} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}
