export const meta = {
  title: 'RPG Workout',
  description: 'Gamified workout tracker — choose a class, log exercises, earn XP, level up. Turns physical training into a progression system with quests and abilities.',
  concept: 'Gamification',
  conceptDetail: 'Attaching XP, levels, and class mechanics to real-world habits uses the same reward loops as games. Progress feels tangible and session-to-session momentum builds.',
  jumpTo: '/rpg-workout',
}

import React, { useState } from 'react';
import { useRPGData } from './hooks/useRPGData';
import { ClassSelector } from './components/ClassSelector';
import { HeroPanel } from './components/HeroPanel';
import { WorkoutLogger } from './components/WorkoutLogger';
import { QuestBoard } from './components/QuestBoard';
import { PlanBuilder } from './components/PlanBuilder';
import { RadarChart } from './components/RadarChart';
import { RPGFantasyBackground } from '../../components/backgrounds/RPGFantasyBackground';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { PREBUILT_PLANS } from './data/rpgPrebuiltPlans';
import { getExerciseDetails } from './data/rpgExercises';
import { WorkoutHistoryChart } from './components/WorkoutHistoryChart';
import RPGContributeModal from './components/RPGContributeModal';
import { AchievementsPanel } from './components/AchievementsPanel';
import { BodyWeightTracker } from './components/BodyWeightTracker';
import { Sword, ScrollText, BarChart2, Plus } from 'lucide-react';

const TABS = [
  { id: 'workout', label: 'Workout', icon: Sword },
  { id: 'quests',  label: 'Quests',  icon: ScrollText },
  { id: 'progress',label: 'Progress',icon: BarChart2 },
]

export default function RPGWorkoutPage() {
  const [activeTab, setActiveTab] = useState('workout');
  const [showContribute, setShowContribute] = useState(false);
  const {
    rpgData,
    loading,
    workoutsThisWeek,
    setOnboardingData,
    logDetailedWorkout,
    setActivePlan,
    saveCustomPlan,
    acceptQuest,
    completeQuest,
    logBodyWeight,
  } = useRPGData();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen text-slate-200 relative">
      <RPGFantasyBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-4 pb-24 md:pb-8 space-y-4">

        {/* Header */}
        <header className="flex items-start justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
              Hero's Journey
            </h1>
            <p className="text-slate-500 text-sm">Train in reality. Level up in fantasy.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowContribute(true)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-600 hover:border-fuchsia-600 text-slate-400 hover:text-fuchsia-300 text-xs font-bold transition-all"
          >
            <Plus size={13} /> Contribute
          </button>
        </header>

        {/* Hero + Radar — always visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <HeroPanel rpgData={rpgData} workoutsThisWeek={workoutsThisWeek} />
          </div>
          <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center backdrop-blur-xl">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Stat Balance</p>
            <RadarChart
              stats={rpgData.stats || { STR: 10, END: 10, AGI: 10, DEX: 10 }}
              maxScore={Math.max(100, ...Object.values(rpgData.stats || { STR: 100 }))}
              size={160}
              color="emerald"
            />
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${
                activeTab === id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Workout */}
        {activeTab === 'workout' && (
          <div className="space-y-4">
            <PlanBuilder rpgData={rpgData} setActivePlan={setActivePlan} saveCustomPlan={saveCustomPlan} />
            <WorkoutLogger
              logDetailedWorkout={logDetailedWorkout}
              activePlan={activePlan}
              personalRecords={rpgData.personalRecords || {}}
              sessionLogs={rpgData.sessionLogs || []}
            />
          </div>
        )}

        {/* Tab: Quests */}
        {activeTab === 'quests' && (
          <QuestBoard
            rpgData={rpgData}
            acceptQuest={acceptQuest}
            completeQuest={completeQuest}
          />
        )}

        {/* Tab: Progress */}
        {activeTab === 'progress' && (
          <div className="space-y-4">
            {/* Recent activity */}
            <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-5 backdrop-blur-xl">
              <WorkoutHistoryChart workoutLogs={rpgData.workoutLogs} />
              <h3 className="text-slate-400 font-bold mb-3 mt-4 text-xs uppercase tracking-widest">Recent Activity</h3>
              {rpgData.workoutLogs.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No logs yet — complete a workout to see history.</p>
              ) : (
                <ul className="space-y-2">
                  {rpgData.workoutLogs.slice(0, 6).map(log => {
                    const ex = getExerciseDetails(log.exerciseId);
                    const m = log.metrics || {};
                    const detail = m.reps ? `${m.sets || 1}×${m.reps}` : m.distance ? `${m.distance}km` : m.duration ? `${m.duration}m` : '';
                    return (
                      <li key={log.id} className="flex justify-between items-center text-sm border-b border-slate-800/60 pb-1.5 last:border-0">
                        <div className="min-w-0">
                          <span className="font-bold text-slate-300 truncate block">{ex?.name || log.exerciseId}</span>
                          {detail && <span className="text-slate-500 text-xs">{detail}</span>}
                        </div>
                        <span className="text-emerald-400 font-mono text-xs shrink-0 ml-2">+{log.xpEarned} XP</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <BodyWeightTracker
              bodyWeightLog={rpgData.bodyWeightLog || []}
              onLog={logBodyWeight}
            />

            <AchievementsPanel achievements={rpgData.achievements || []} />
          </div>
        )}
      </div>

      {showContribute && <RPGContributeModal onClose={() => setShowContribute(false)} />}
    </div>
  );
}
