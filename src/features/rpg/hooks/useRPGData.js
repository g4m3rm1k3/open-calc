import { useState, useEffect, useRef } from 'react';
import { db } from '../../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { getExerciseDetails, EXERCISE_TYPES } from '../data/rpgExercises';
import { checkAchievements } from '../data/rpgAchievements';

const DEFAULT_RPG_STATE = {
  heroClass: null,
  experienceLevel: null,
  goals: '',
  level: 1,
  xp: 0,
  hp: 100,
  maxHp: 100,
  gold: 0,
  stats: { STR: 10, END: 10, AGI: 10, DEX: 10 },
  customPlans: [],
  activePlanId: null,
  abilities: [],
  activeQuests: [],
  completedQuests: [],
  workoutLogs: [],    // individual exercise entries (kept for backward compat)
  sessionLogs: [],    // grouped sessions: [{ id, date, planName, entries, totalXp, volume }]
  personalRecords: {},
  achievements: [],   // [{ id, unlockedAt }]
  streak: 0,
  lastWorkoutDate: null,
  weeklyTarget: 3,
  bodyWeightLog: [],  // [{ date: YYYY-MM-DD, weight: number, unit: 'lbs'|'kg' }]
};

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function computeStreak(lastDate, currentStreak) {
  if (!lastDate) return 1;
  const today = todayISO();
  if (lastDate === today) return currentStreak; // already logged today
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
  if (lastDate === yesterday) return currentStreak + 1;
  return 1; // gap — reset
}

function computeXpLevel(currentXp, addedXp, currentLevel, currentHp, currentMaxHp) {
  const newXp = currentXp + addedXp;
  const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
  const leveledUp = newLevel > currentLevel;
  const newMaxHp = leveledUp ? 100 + (newLevel * 10) : currentMaxHp;
  const newHp = leveledUp ? newMaxHp : currentHp;
  return { newXp, newLevel, leveledUp, newMaxHp, newHp };
}

function updatePersonalRecords(existingPRs, entries) {
  const prs = { ...existingPRs };
  const beaten = [];
  const today = todayISO();

  for (const { exerciseId, metrics } of entries) {
    const ex = getExerciseDetails(exerciseId);
    if (!ex || !metrics) continue;
    const m = metrics;
    const cur = prs[exerciseId];

    if (ex.type === EXERCISE_TYPES.WEIGHT_REPS) {
      const weight = parseFloat(m.weight) || 0;
      const reps = parseInt(m.reps) || 0;
      if (weight > 0 && reps > 0 && weight > (cur?.weight || 0)) {
        prs[exerciseId] = { weight, reps, date: today };
        beaten.push(ex.name);
      }
    } else if (ex.type === EXERCISE_TYPES.BODYWEIGHT_REPS) {
      const reps = parseInt(m.reps) || 0;
      if (reps > 0 && reps > (cur?.reps || 0)) {
        prs[exerciseId] = { reps, date: today };
        beaten.push(ex.name);
      }
    } else if (ex.type === EXERCISE_TYPES.DISTANCE_TIME) {
      const distance = parseFloat(m.distance) || 0;
      if (distance > 0 && distance > (cur?.distance || 0)) {
        prs[exerciseId] = { distance, date: today };
        beaten.push(ex.name);
      }
    } else if (ex.type === EXERCISE_TYPES.TIME_HOLD || ex.type === EXERCISE_TYPES.ISOMETRIC) {
      const duration = parseFloat(m.duration) || 0;
      if (duration > 0 && duration > (cur?.duration || 0)) {
        prs[exerciseId] = { duration, date: today };
        beaten.push(ex.name);
      }
    }
  }

  return { prs, beaten };
}

function computeSessionVolume(entries) {
  // tonnage = weight × sets × reps for weighted exercises; reps for BW; km for cardio
  let tonnage = 0;
  let totalReps = 0;
  for (const { exerciseId, metrics } of entries) {
    const ex = getExerciseDetails(exerciseId);
    if (!ex || !metrics) continue;
    const sets = parseInt(metrics.sets) || 1;
    const reps = parseInt(metrics.reps) || 0;
    const weight = parseFloat(metrics.weight) || 0;
    if (ex.type === EXERCISE_TYPES.WEIGHT_REPS) tonnage += sets * reps * weight;
    if (ex.type === EXERCISE_TYPES.BODYWEIGHT_REPS) totalReps += sets * reps;
  }
  return { tonnage, totalReps };
}

function saveWorkoutToCalendar(planName, entries, totalXp) {
  try {
    const today = todayISO();
    const raw = localStorage.getItem('oc-calendar');
    const store = raw ? JSON.parse(raw) : { events: [] };
    if (!Array.isArray(store.events)) store.events = [];

    // Avoid duplicate entries for same session (same minute)
    const minute = new Date().toISOString().slice(0, 16);
    const dup = store.events.find(e => e.id?.startsWith(`ev-rpg-${minute}`));
    if (dup) return;

    const exNames = entries
      .map(e => getExerciseDetails(e.exerciseId)?.name || e.exerciseId)
      .slice(0, 4)
      .join(', ');

    store.events.push({
      id: `ev-rpg-${minute}-${Math.random().toString(36).slice(2, 6)}`,
      title: `⚔ ${planName}`,
      description: `${exNames}${entries.length > 4 ? ` +${entries.length - 4} more` : ''}\n+${totalXp} XP earned`,
      start: today,
      end: today,
      allDay: true,
      type: 'workout',
      color: '#f97316',
      notifications: [],
      completed: true,
    });

    localStorage.setItem('oc-calendar', JSON.stringify(store));
    // Notify CalendarPage if it's open
    window.dispatchEvent(new StorageEvent('storage', { key: 'oc-calendar' }));
  } catch { /* silent — calendar save is a bonus, not critical */ }
}

function autoVerifyQuests(activeQuests, entries) {
  // Check if any active quests can be auto-completed based on what was just logged
  const completable = [];
  for (const quest of activeQuests) {
    if (!quest.task) continue;
    const task = quest.task.toLowerCase();
    for (const { exerciseId } of entries) {
      const ex = getExerciseDetails(exerciseId);
      if (!ex) continue;
      // Simple keyword matching on quest task text vs exercise name/muscles
      const exWords = (ex.name + ' ' + (ex.muscles?.primary || []).join(' ')).toLowerCase();
      const taskWords = task.split(/\s+/);
      const matches = taskWords.filter(w => w.length > 3 && exWords.includes(w)).length;
      if (matches >= 2 && !completable.includes(quest.id)) {
        completable.push(quest.id);
        break;
      }
    }
  }
  return completable;
}

export function useRPGData() {
  const { user: currentUser } = useAuth();
  const [rpgData, setRpgData] = useState(DEFAULT_RPG_STATE);
  const [loading, setLoading] = useState(true);
  const drainAppliedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      const localDataStr = localStorage.getItem('oc-rpg-data');
      let localData = localDataStr ? JSON.parse(localDataStr) : null;

      if (!currentUser) {
        if (localData && isMounted) setRpgData({ ...DEFAULT_RPG_STATE, ...localData });
        if (isMounted) setLoading(false);
        return;
      }

      const docRef = doc(db, 'users', currentUser.uid, 'appData', 'rpgProfile');
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const fbData = { ...DEFAULT_RPG_STATE, ...docSnap.data() };
          if (isMounted) {
            setRpgData(fbData);
            localStorage.setItem('oc-rpg-data', JSON.stringify(fbData));
          }
        } else {
          const dataToSave = localData ? { ...DEFAULT_RPG_STATE, ...localData } : DEFAULT_RPG_STATE;
          await setDoc(docRef, dataToSave);
          if (isMounted) setRpgData(dataToSave);
        }
      } catch (err) {
        console.error('Error loading RPG data from Firebase:', err);
        if (localData && isMounted) setRpgData({ ...DEFAULT_RPG_STATE, ...localData });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [currentUser]);

  // HP drain for inactivity
  useEffect(() => {
    if (loading || drainAppliedRef.current) return;
    drainAppliedRef.current = true;

    const lastLog = rpgData.workoutLogs?.[0];
    if (!lastLog?.date) return;

    const hoursSince = (Date.now() - new Date(lastLog.date).getTime()) / 3_600_000;
    if (hoursSince < 48) return;

    const daysSince = Math.floor(hoursSince / 24);
    const drain = Math.min(daysSince * 10, rpgData.hp - Math.ceil(rpgData.maxHp * 0.1));
    if (drain > 0) {
      saveData({ ...rpgData, hp: rpgData.hp - drain });
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveData = async (newData) => {
    setRpgData(newData);
    localStorage.setItem('oc-rpg-data', JSON.stringify(newData));
    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'appData', 'rpgProfile');
      try {
        await setDoc(docRef, newData, { merge: true });
      } catch (err) {
        console.error('Failed to sync RPG data to Firebase:', err);
      }
    }
  };

  const updateHeroClass = (heroClass) => saveData({ ...rpgData, heroClass });

  const setOnboardingData = (heroClass, experienceLevel, goals) =>
    saveData({ ...rpgData, heroClass, experienceLevel, goals });

  const addXP = (amount) => {
    const { newXp, newLevel, leveledUp, newMaxHp, newHp } = computeXpLevel(
      rpgData.xp, amount, rpgData.level, rpgData.hp, rpgData.maxHp
    );
    saveData({ ...rpgData, xp: newXp, level: newLevel, hp: newHp, maxHp: newMaxHp });
    return leveledUp;
  };

  // entries: [{ exerciseId, metrics, calculatedXp, statGains }]
  // planName: string label for calendar event
  const logDetailedWorkout = (entries, planName = 'Workout') => {
    if (!entries?.length) return { leveledUp: false, newPrs: [], newAchievements: [] };

    const now = Date.now();
    const today = todayISO();

    // ── individual log entries (backward compat) ──
    const newEntries = entries.map((entry, i) => ({
      id: `${now}-${i}`,
      exerciseId: entry.exerciseId,
      metrics: entry.metrics,
      xpEarned: entry.calculatedXp,
      date: new Date(now + i).toISOString(),
    }));
    const newLogs = [...newEntries, ...rpgData.workoutLogs].slice(0, 200);

    // ── session log ──
    const { tonnage, totalReps } = computeSessionVolume(entries);
    const totalXp = entries.reduce((sum, e) => sum + (e.calculatedXp || 0), 0);
    const session = {
      id: `session-${now}`,
      date: today,
      planName,
      entryCount: entries.length,
      totalXp,
      tonnage,
      totalReps,
      exerciseIds: entries.map(e => e.exerciseId),
    };
    const newSessionLogs = [session, ...(rpgData.sessionLogs || [])].slice(0, 100);

    // ── XP + level ──
    const { newXp, newLevel, leveledUp, newMaxHp, newHp } = computeXpLevel(
      rpgData.xp, totalXp, rpgData.level, rpgData.hp, rpgData.maxHp
    );

    // ── stats ──
    const newStats = { ...rpgData.stats };
    entries.forEach(({ statGains }) => {
      if (statGains) Object.keys(statGains).forEach(stat => {
        newStats[stat] = (newStats[stat] || 0) + statGains[stat];
      });
    });

    // ── personal records ──
    const { prs: newPRs, beaten: newPrs } = updatePersonalRecords(
      rpgData.personalRecords || {}, entries
    );

    // ── streak ──
    const newStreak = computeStreak(rpgData.lastWorkoutDate, rpgData.streak);

    // ── quest auto-verify ──
    const autoCompleted = autoVerifyQuests(rpgData.activeQuests || [], entries);
    let newActiveQuests = rpgData.activeQuests || [];
    let newCompletedQuests = rpgData.completedQuests || [];
    let goldGain = 0;
    let xpFromQuests = 0;
    if (autoCompleted.length) {
      const justCompleted = newActiveQuests.filter(q => autoCompleted.includes(q.id));
      justCompleted.forEach(q => {
        xpFromQuests += q.rewardXP || 0;
        goldGain += q.rewardGold || 0;
      });
      newActiveQuests = newActiveQuests.filter(q => !autoCompleted.includes(q.id));
      newCompletedQuests = [
        ...justCompleted.map(q => ({ ...q, completedAt: new Date().toISOString(), autoVerified: true })),
        ...newCompletedQuests,
      ].slice(0, 30);
    }

    // ── build new state ──
    const preAchievementState = {
      ...rpgData,
      workoutLogs: newLogs,
      sessionLogs: newSessionLogs,
      xp: newXp + xpFromQuests,
      level: newLevel,
      hp: newHp,
      maxHp: newMaxHp,
      stats: newStats,
      personalRecords: newPRs,
      streak: newStreak,
      lastWorkoutDate: today,
      gold: (rpgData.gold || 0) + goldGain,
      activeQuests: newActiveQuests,
      completedQuests: newCompletedQuests,
    };

    // ── achievements ──
    const newlyEarned = checkAchievements(preAchievementState, newPrs.length);
    const newAchievements = [...(rpgData.achievements || []), ...newlyEarned];
    // Tonnage achievement checked separately
    if (tonnage >= 1000 && !newAchievements.find(a => a.id === 'tonnage_1k')) {
      newAchievements.push({ id: 'tonnage_1k', unlockedAt: new Date().toISOString() });
    }

    const finalState = { ...preAchievementState, achievements: newAchievements };
    saveData(finalState);

    // ── calendar save ──
    saveWorkoutToCalendar(planName, entries, totalXp + xpFromQuests);

    return { leveledUp, newPrs, newAchievements: newlyEarned, autoCompletedQuests: autoCompleted };
  };

  const setActivePlan = (planId) => saveData({ ...rpgData, activePlanId: planId });

  const saveCustomPlan = (plan) => {
    const existing = rpgData.customPlans.filter(p => p.id !== plan.id);
    saveData({ ...rpgData, customPlans: [...existing, plan] });
  };

  const acceptQuest = (quest) =>
    saveData({ ...rpgData, activeQuests: [...rpgData.activeQuests, quest] });

  const completeQuest = (questId, rewardXP, rewardGold) => {
    const completed = rpgData.activeQuests.find(q => q.id === questId);
    if (!completed) return false;
    completed.completedAt = new Date().toISOString();

    const { newXp, newLevel, leveledUp, newMaxHp, newHp } = computeXpLevel(
      rpgData.xp, rewardXP, rpgData.level, rpgData.hp, rpgData.maxHp
    );

    saveData({
      ...rpgData,
      activeQuests: rpgData.activeQuests.filter(q => q.id !== questId),
      completedQuests: [completed, ...rpgData.completedQuests].slice(0, 20),
      gold: rpgData.gold + rewardGold,
      xp: newXp,
      level: newLevel,
      hp: newHp,
      maxHp: newMaxHp,
    });

    return leveledUp;
  };

  const logBodyWeight = (weight, unit = 'lbs') => {
    const today = todayISO();
    const existing = (rpgData.bodyWeightLog || []).filter(e => e.date !== today);
    saveData({
      ...rpgData,
      bodyWeightLog: [{ date: today, weight, unit }, ...existing].slice(0, 365),
    });
  };

  const setWeeklyTarget = (target) => saveData({ ...rpgData, weeklyTarget: target });

  // Count workouts in the last 7 calendar days
  const workoutsThisWeek = (() => {
    const cutoff = new Date(Date.now() - 7 * 86_400_000).toISOString();
    return (rpgData.sessionLogs || []).filter(s => s.date >= cutoff.split('T')[0]).length;
  })();

  return {
    rpgData,
    loading,
    workoutsThisWeek,
    updateHeroClass,
    setOnboardingData,
    addXP,
    logDetailedWorkout,
    setActivePlan,
    saveCustomPlan,
    acceptQuest,
    completeQuest,
    logBodyWeight,
    setWeeklyTarget,
  };
}
