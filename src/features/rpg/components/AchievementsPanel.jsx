import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ACHIEVEMENTS, RARITY_COLORS } from '../data/rpgAchievements'
import { Lock, Trophy } from 'lucide-react'

export function AchievementsPanel({ achievements = [] }) {
  const [expanded, setExpanded] = useState(false)
  const earned = new Set(achievements.map(a => a.id))
  const earnedCount = earned.size

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-2xl overflow-hidden backdrop-blur-xl">
      {/* Header — always visible */}
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-slate-800/30 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <Trophy className="text-amber-400" size={20} />
          <div className="text-left">
            <h3 className="font-black text-slate-200 text-sm uppercase tracking-widest">Achievements</h3>
            <p className="text-[10px] text-slate-500">{earnedCount} / {ACHIEVEMENTS.length} unlocked</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Progress bar */}
          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-fuchsia-500 rounded-full transition-all duration-500"
              style={{ width: `${(earnedCount / ACHIEVEMENTS.length) * 100}%` }}
            />
          </div>
          <span className="text-slate-500 text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-5 pt-0">
              {ACHIEVEMENTS.map(a => {
                const isEarned = earned.has(a.id)
                const colors = RARITY_COLORS[a.rarity]
                const earnedEntry = achievements.find(e => e.id === a.id)
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-xl p-3 border flex flex-col gap-1 ${
                      isEarned
                        ? `${colors.bg} ${colors.border}`
                        : 'bg-slate-950/40 border-slate-800 opacity-50 grayscale'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{isEarned ? a.icon : '🔒'}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${isEarned ? colors.label : 'text-slate-600'}`}>
                        {a.rarity}
                      </span>
                    </div>
                    <p className={`text-xs font-black leading-tight ${isEarned ? colors.text : 'text-slate-600'}`}>
                      {a.name}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight">{a.desc}</p>
                    {isEarned && earnedEntry?.unlockedAt && (
                      <p className="text-[9px] text-slate-600 mt-0.5">
                        {new Date(earnedEntry.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </p>
                    )}
                    {!isEarned && (
                      <p className="text-[9px] text-slate-700 flex items-center gap-0.5">
                        <Lock size={8} /> Locked
                      </p>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
