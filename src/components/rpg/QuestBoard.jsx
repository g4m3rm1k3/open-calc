import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scroll, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { useRPGCoachAI } from '../../hooks/useRPGCoachAI';

export function QuestBoard({ rpgData, acceptQuest, completeQuest }) {
  const { generateQuest, isThinking, isDownloading, downloadProgress } = useRPGCoachAI();
  const [error, setError] = useState(null);

  const handleGenerateQuest = async () => {
    setError(null);
    try {
      const newQuest = await generateQuest(rpgData);
      if (newQuest && newQuest.questName) {
        newQuest.id = Date.now().toString();
        acceptQuest(newQuest);
      } else {
        setError("Coach returned an empty scroll. Try again.");
      }
    } catch (err) {
      setError(`Coach error: ${err?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/50">
          <Scroll className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Quest Board</h2>
          <p className="text-xs text-slate-400">Receive instructions from your AI Coach</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 min-h-[200px]">
        {rpgData.activeQuests.length === 0 ? (
          <div className="text-center py-10">
            <Scroll className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No active quests.</p>
          </div>
        ) : (
          rpgData.activeQuests.map((quest, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={quest.id}
              className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-4 shadow-[0_0_10px_rgba(99,102,241,0.1)] relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <h3 className="text-indigo-400 font-bold mb-1">{quest.questName}</h3>
              <p className="text-slate-300 text-sm mb-3 italic">"{quest.description}"</p>
              <div className="bg-slate-900 rounded p-2 text-slate-200 text-sm mb-3 border border-slate-700">
                <span className="text-slate-500 mr-2">TASK:</span> {quest.task}
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800">
                <div className="flex gap-3 text-xs font-bold">
                  <span className="text-emerald-400">+{quest.rewardXP} XP</span>
                  <span className="text-yellow-400">+{quest.rewardGold} Gold</span>
                </div>
                <button
                  onClick={() => completeQuest(quest.id, quest.rewardXP, quest.rewardGold)}
                  className="flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/50 px-3 py-1 rounded text-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Complete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {error && <p className="text-red-400 text-xs mb-3 text-center">{error}</p>}
      
      {isDownloading && (
        <p className="text-indigo-400 text-xs mb-3 text-center animate-pulse">{downloadProgress}</p>
      )}

      <button
        onClick={handleGenerateQuest}
        disabled={isThinking || isDownloading}
        className="w-full relative group overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-indigo-400/30 to-indigo-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <span className="relative flex items-center justify-center gap-2">
          {isThinking ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Consulting Coach...</>
          ) : (
            <><Zap className="w-5 h-5 text-indigo-300" /> Seek New Quest</>
          )}
        </span>
      </button>
    </div>
  );
}
