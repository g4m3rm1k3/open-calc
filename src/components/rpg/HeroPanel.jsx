import React from 'react';
import { Shield, Sword, Wind, Hand, Zap, Heart, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const classMeta = {
  barbarian: { name: 'Barbarian', icon: Shield, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/50' },
  rogue: { name: 'Rogue', icon: Wind, color: 'text-teal-400', bg: 'bg-teal-500/20', border: 'border-teal-500/50' },
  monk: { name: 'Monk', icon: Hand, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/20', border: 'border-fuchsia-500/50' },
  paladin: { name: 'Paladin', icon: Sword, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/50' }
};

export function HeroPanel({ rpgData }) {
  if (!rpgData || !rpgData.heroClass) return null;

  const meta = classMeta[rpgData.heroClass] || classMeta.paladin;
  const Icon = meta.icon;

  const currentLevelXp = Math.pow(rpgData.level - 1, 2) * 100;
  const nextLevelXp = Math.pow(rpgData.level, 2) * 100;
  const xpIntoLevel = Math.max(0, rpgData.xp - currentLevelXp);
  const xpNeeded = nextLevelXp - currentLevelXp;
  const xpPct = Math.min(100, Math.max(0, (xpIntoLevel / xpNeeded) * 100));
  
  const hpPct = Math.min(100, Math.max(0, (rpgData.hp / rpgData.maxHp) * 100));
  const isHpLow = hpPct < 40;

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden shadow-xl">
      {/* Magical Background Glow */}
      <div className={`absolute -top-20 -right-20 w-64 h-64 ${meta.bg} blur-[80px] rounded-full pointer-events-none`} />

      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Avatar / Class Icon */}
        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center border-2 ${meta.border} bg-slate-950/80 shadow-[0_0_15px_rgba(0,0,0,0.5)] relative group`}>
          <Icon className={`w-12 h-12 ${meta.color} drop-shadow-[0_0_10px_currentColor]`} />
          <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center font-black text-xs text-white">
            {rpgData.level}
          </div>
        </div>

        {/* Stats Area */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-white tracking-wide">Level {rpgData.level} {meta.name}</h2>
              <p className="text-sm text-slate-400">Total XP: {rpgData.xp.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className="text-yellow-400 font-bold flex items-center gap-1 text-sm bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/30">
                <Zap className="w-3 h-3" /> {rpgData.gold} Gold
              </span>
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>XP TO LEVEL {rpgData.level + 1}</span>
              <span>{xpIntoLevel} / {xpNeeded}</span>
            </div>
            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-700">
              <motion.div 
                className={`h-full bg-gradient-to-r ${meta.color.replace('text-', 'from-').replace('-400', '-600')} to-white/50`}
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1, type: "spring" }}
              />
            </div>
          </div>

          {/* HP Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-red-400">
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> HEALTH</span>
              <span>{rpgData.hp} / {rpgData.maxHp}</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-700">
              <motion.div
                className={`h-full bg-gradient-to-r ${isHpLow ? 'from-red-700 to-red-500' : 'from-red-600 to-rose-400'}`}
                initial={{ width: 0 }}
                animate={{ width: `${hpPct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {isHpLow && (
              <p className="flex items-center gap-1 text-[10px] font-bold text-red-400 animate-pulse">
                <AlertTriangle className="w-3 h-3" /> Your hero is weakening — train to restore HP.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
