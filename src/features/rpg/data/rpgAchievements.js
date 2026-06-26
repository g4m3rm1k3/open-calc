export const ACHIEVEMENTS = [
  { id: 'first_sweat',   name: 'First Blood',       desc: 'Log your first workout',            icon: '⚔',  rarity: 'common' },
  { id: 'ten_sessions',  name: "Warrior's Path",     desc: 'Complete 10 workouts',              icon: '🗡',  rarity: 'common' },
  { id: 'fifty_sessions',name: 'Seasoned Veteran',   desc: 'Complete 50 workouts',              icon: '🛡',  rarity: 'rare'   },
  { id: 'century',       name: 'Iron Centurion',     desc: 'Complete 100 workouts',             icon: '👑',  rarity: 'epic'   },
  { id: 'level_5',       name: 'Initiate',           desc: 'Reach Level 5',                     icon: '⚡',  rarity: 'common' },
  { id: 'level_10',      name: 'Adept',              desc: 'Reach Level 10',                    icon: '🌟',  rarity: 'rare'   },
  { id: 'level_20',      name: 'Champion',           desc: 'Reach Level 20',                    icon: '🔮',  rarity: 'epic'   },
  { id: 'first_pr',      name: 'Personal Legend',    desc: 'Set your first personal record',    icon: '🏆',  rarity: 'common' },
  { id: 'streak_7',      name: 'Unbroken',           desc: '7-day training streak',             icon: '🔥',  rarity: 'rare'   },
  { id: 'streak_30',     name: 'Iron Will',          desc: '30-day training streak',            icon: '💎',  rarity: 'epic'   },
  { id: 'diverse_10',    name: 'Versatile',          desc: 'Try 10 different exercises',        icon: '🎯',  rarity: 'common' },
  { id: 'tonnage_1k',    name: 'Iron Moved',         desc: 'Lift 1,000 lbs total in one session', icon: '🏋', rarity: 'rare'  },
  { id: 'five_plans',    name: 'Planner',            desc: 'Complete 5 different workout days', icon: '📋',  rarity: 'common' },
  { id: 'quest_10',      name: 'Quest Chaser',       desc: 'Complete 10 quests',                icon: '📜',  rarity: 'rare'   },
  { id: 'xp_10k',        name: 'XP Hoarder',         desc: 'Earn 10,000 total XP',              icon: '✨',  rarity: 'epic'   },
]

export const RARITY_COLORS = {
  common: { text: 'text-slate-300',  border: 'border-slate-600',  bg: 'bg-slate-800/50',  label: 'text-slate-400' },
  rare:   { text: 'text-cyan-300',   border: 'border-cyan-700',   bg: 'bg-cyan-900/30',   label: 'text-cyan-500'  },
  epic:   { text: 'text-fuchsia-300',border: 'border-fuchsia-700',bg: 'bg-fuchsia-900/30',label: 'text-fuchsia-500'},
}

export function checkAchievements(state, newPrsCount) {
  const earned = new Set((state.achievements || []).map(a => a.id))
  const newly = []
  const now = new Date().toISOString()

  const sessionCount = (state.sessionLogs || []).length
  const uniqueExercises = new Set((state.workoutLogs || []).map(l => l.exerciseId)).size
  const completedQuests = (state.completedQuests || []).length

  const checks = [
    ['first_sweat',    sessionCount >= 1],
    ['ten_sessions',   sessionCount >= 10],
    ['fifty_sessions', sessionCount >= 50],
    ['century',        sessionCount >= 100],
    ['level_5',        state.level >= 5],
    ['level_10',       state.level >= 10],
    ['level_20',       state.level >= 20],
    ['first_pr',       newPrsCount > 0 || Object.keys(state.personalRecords || {}).length > 0],
    ['streak_7',       (state.streak || 0) >= 7],
    ['streak_30',      (state.streak || 0) >= 30],
    ['diverse_10',     uniqueExercises >= 10],
    ['quest_10',       completedQuests >= 10],
    ['xp_10k',         state.xp >= 10000],
  ]

  for (const [id, cond] of checks) {
    if (cond && !earned.has(id)) newly.push({ id, unlockedAt: now })
  }

  return newly
}
