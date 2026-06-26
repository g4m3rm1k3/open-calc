import React from 'react'
import { Shield, Sword, Wind, Hand, Zap, Heart, AlertTriangle, Flame, Target } from 'lucide-react'
import { motion } from 'framer-motion'

const classMeta = {
  barbarian: { name: 'Barbarian', icon: Shield, color: 'text-orange-400',  bg: 'bg-orange-500/20',  border: 'border-orange-500/50'  },
  rogue:     { name: 'Rogue',     icon: Wind,   color: 'text-teal-400',    bg: 'bg-teal-500/20',    border: 'border-teal-500/50'    },
  monk:      { name: 'Monk',      icon: Hand,   color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/20', border: 'border-fuchsia-500/50' },
  paladin:   { name: 'Paladin',   icon: Sword,  color: 'text-cyan-400',    bg: 'bg-cyan-500/20',    border: 'border-cyan-500/50'    },
  ranger:    { name: 'Ranger',    icon: Target, color: 'text-lime-400',    bg: 'bg-lime-500/20',    border: 'border-lime-500/50'    },
}

function StreakBadge({ streak }) {
  if (!streak || streak < 2) return null
  const color = streak >= 30 ? 'text-fuchsia-400' : streak >= 7 ? 'text-orange-400' : 'text-amber-400'
  return (
    <div className={`flex items-center gap-1 text-xs font-black ${color} bg-black/30 px-2 py-1 rounded-lg border border-current/30`}>
      <Flame size={12} className="animate-pulse" />
      {streak} day streak
    </div>
  )
}

function WeeklyProgress({ current, target }) {
  const pct = Math.min(100, (current / target) * 100)
  const done = current >= target
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-bold text-slate-400">
        <span className="flex items-center gap-1">
          <Target size={10} /> WEEKLY TARGET
        </span>
        <span className={done ? 'text-emerald-400' : 'text-slate-400'}>
          {current}/{target} {done ? '✓' : ''}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700">
        <motion.div
          className={`h-full rounded-full ${done ? 'bg-emerald-400' : 'bg-amber-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, type: 'spring' }}
        />
      </div>
    </div>
  )
}

export function HeroPanel({ rpgData, workoutsThisWeek = 0 }) {
  if (!rpgData || !rpgData.heroClass) return null

  const meta = classMeta[rpgData.heroClass] || classMeta.paladin
  const Icon = meta.icon

  const currentLevelXp = Math.pow(rpgData.level - 1, 2) * 100
  const nextLevelXp = Math.pow(rpgData.level, 2) * 100
  const xpIntoLevel = Math.max(0, rpgData.xp - currentLevelXp)
  const xpNeeded = nextLevelXp - currentLevelXp
  const xpPct = Math.min(100, Math.max(0, (xpIntoLevel / xpNeeded) * 100))

  const hpPct = Math.min(100, Math.max(0, (rpgData.hp / rpgData.maxHp) * 100))
  const isHpLow = hpPct < 40

  const earnedCount = (rpgData.achievements || []).length

  // Weekly stats
  const weeklyTarget = rpgData.weeklyTarget || 3
  const lastSession = rpgData.sessionLogs?.[0]
  const lastSessionDate = lastSession?.date
    ? new Date(lastSession.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : null

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden shadow-xl">
      <div className={`absolute -top-20 -right-20 w-64 h-64 ${meta.bg} blur-[80px] rounded-full pointer-events-none`} />

      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Avatar */}
        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center border-2 ${meta.border} bg-slate-950/80 shadow-[0_0_15px_rgba(0,0,0,0.5)] relative group shrink-0`}>
          <Icon className={`w-12 h-12 ${meta.color} drop-shadow-[0_0_10px_currentColor]`} />
          <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center font-black text-xs text-white">
            {rpgData.level}
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 w-full space-y-3">
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
              <h2 className="text-2xl font-black text-white tracking-wide">Level {rpgData.level} {meta.name}</h2>
              <p className="text-sm text-slate-400">Total XP: {rpgData.xp.toLocaleString()}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StreakBadge streak={rpgData.streak} />
              <span className="text-yellow-400 font-bold flex items-center gap-1 text-sm bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/30">
                <Zap className="w-3 h-3" /> {rpgData.gold} Gold
              </span>
              {earnedCount > 0 && (
                <span className="text-fuchsia-300 text-xs font-bold bg-fuchsia-900/30 border border-fuchsia-700/50 px-2 py-1 rounded">
                  🏅 {earnedCount} badge{earnedCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>XP TO LEVEL {rpgData.level + 1}</span>
              <span>{xpIntoLevel.toLocaleString()} / {xpNeeded.toLocaleString()}</span>
            </div>
            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-700">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-600 to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1, type: 'spring' }}
              />
            </div>
          </div>

          {/* HP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-red-400">
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> HEALTH</span>
              <span>{rpgData.hp} / {rpgData.maxHp}</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-700">
              <motion.div
                className={`h-full ${isHpLow ? 'bg-gradient-to-r from-red-700 to-red-500' : 'bg-gradient-to-r from-red-600 to-rose-400'}`}
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

          {/* Weekly target */}
          <WeeklyProgress current={workoutsThisWeek} target={weeklyTarget} />

          {/* Last session */}
          {lastSessionDate && (
            <p className="text-[10px] text-slate-600">
              Last session: {lastSessionDate} · {lastSession.entryCount} exercises · +{lastSession.totalXp} XP
              {lastSession.tonnage > 0 ? ` · ${Math.round(lastSession.tonnage).toLocaleString()} lbs moved` : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
