import { useState, useEffect, useRef } from 'react';
import { db } from '../../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { getExerciseDetails, EXERCISE_TYPES } from '../data/rpgExercises';

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
  workoutLogs: [],
  personalRecords: {},
};

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
  const today = new Date().toISOString().split('T')[0];

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

export function useRPGData() {
  const { currentUser } = useAuth();
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

  // HP drain for inactivity — applied once per session on load
  useEffect(() => {
    if (loading || drainAppliedRef.current) return;
    drainAppliedRef.current = true;

    const lastLog = rpgData.workoutLogs?.[0];
    if (!lastLog?.date) return;

    const hoursSince = (Date.now() - new Date(lastLog.date).getTime()) / 3_600_000;
    if (hoursSince < 48) return; // 2-day grace period

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
  // Returns { leveledUp: boolean, newPrs: string[] }
  const logDetailedWorkout = (entries) => {
    if (!entries?.length) return { leveledUp: false, newPrs: [] };

    const now = Date.now();
    const newEntries = entries.map((entry, i) => ({
      id: `${now}-${i}`,
      exerciseId: entry.exerciseId,
      metrics: entry.metrics,
      xpEarned: entry.calculatedXp,
      date: new Date(now + i).toISOString(),
    }));

    const newLogs = [...newEntries, ...rpgData.workoutLogs].slice(0, 100);

    const totalXp = entries.reduce((sum, e) => sum + (e.calculatedXp || 0), 0);
    const { newXp, newLevel, leveledUp, newMaxHp, newHp } = computeXpLevel(
      rpgData.xp, totalXp, rpgData.level, rpgData.hp, rpgData.maxHp
    );

    const newStats = { ...rpgData.stats };
    entries.forEach(({ statGains }) => {
      if (statGains) {
        Object.keys(statGains).forEach(stat => {
          newStats[stat] = (newStats[stat] || 0) + statGains[stat];
        });
      }
    });

    const { prs: newPRs, beaten: newPrs } = updatePersonalRecords(
      rpgData.personalRecords || {}, entries
    );

    saveData({
      ...rpgData,
      workoutLogs: newLogs,
      xp: newXp,
      level: newLevel,
      hp: newHp,
      maxHp: newMaxHp,
      stats: newStats,
      personalRecords: newPRs,
    });

    return { leveledUp, newPrs };
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

  return {
    rpgData,
    loading,
    updateHeroClass,
    setOnboardingData,
    addXP,
    logDetailedWorkout,
    setActivePlan,
    saveCustomPlan,
    acceptQuest,
    completeQuest,
  };
}
