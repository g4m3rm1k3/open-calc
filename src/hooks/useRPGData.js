import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const DEFAULT_RPG_STATE = {
  heroClass: null, // 'barbarian', 'rogue', 'mage', etc.
  experienceLevel: null, // 'beginner', 'intermediate', 'advanced'
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
  workoutLogs: []
};

export function useRPGData() {
  const { currentUser } = useAuth();
  const [rpgData, setRpgData] = useState(DEFAULT_RPG_STATE);
  const [loading, setLoading] = useState(true);

  // Sync logic
  useEffect(() => {
    let isMounted = true;
    
    async function loadData() {
      setLoading(true);
      const localDataStr = localStorage.getItem('oc-rpg-data');
      let localData = localDataStr ? JSON.parse(localDataStr) : null;

      if (!currentUser) {
        if (localData) {
          if (isMounted) setRpgData(localData);
        }
        if (isMounted) setLoading(false);
        return;
      }

      // User is logged in: Check Firebase
      const docRef = doc(db, 'users', currentUser.uid, 'appData', 'rpgProfile');
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const fbData = docSnap.data();
          // Optional: merge localData with fbData here if we want to preserve offline progress
          if (isMounted) {
            setRpgData(fbData);
            // Overwrite local storage with the cloud truth
            localStorage.setItem('oc-rpg-data', JSON.stringify(fbData));
          }
        } else {
          // No Firebase data, but we have local data, so upload it
          const dataToSave = localData || DEFAULT_RPG_STATE;
          await setDoc(docRef, dataToSave);
          if (isMounted) setRpgData(dataToSave);
        }
      } catch (err) {
        console.error("Error loading RPG data from Firebase:", err);
        // Fallback to local
        if (localData && isMounted) setRpgData(localData);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => { isMounted = false; };
  }, [currentUser]);

  // Save Helper
  const saveData = async (newData) => {
    setRpgData(newData);
    localStorage.setItem('oc-rpg-data', JSON.stringify(newData));

    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid, 'appData', 'rpgProfile');
      try {
        await setDoc(docRef, newData, { merge: true });
      } catch (err) {
        console.error("Failed to sync RPG data to Firebase:", err);
      }
    }
  };

  const updateHeroClass = (heroClass) => {
    saveData({ ...rpgData, heroClass });
  };

  const setOnboardingData = (heroClass, experienceLevel, goals) => {
    saveData({ ...rpgData, heroClass, experienceLevel, goals });
  };

  const addXP = (amount) => {
    const newXp = rpgData.xp + amount;
    // Simple scaling: Level = floor(sqrt(xp / 100)) + 1
    // e.g., 0-99 XP = Lv 1, 100-399 = Lv 2, 400-899 = Lv 3
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
    
    // Check if leveled up
    const leveledUp = newLevel > rpgData.level;
    let newHp = rpgData.hp;
    let newMaxHp = rpgData.maxHp;

    if (leveledUp) {
      newMaxHp = 100 + (newLevel * 10);
      newHp = newMaxHp; // Fully heal on level up
    }

    saveData({
      ...rpgData,
      xp: newXp,
      level: newLevel,
      hp: newHp,
      maxHp: newMaxHp
    });

    return leveledUp;
  };

  // details can include: weight, sets, reps, distance, duration, rpe
  const logWorkout = (exerciseId, metrics, calculatedXp) => {
    // We dynamically import or just use a generic update if we can't find it.
    // However, it's better to pass the statFocus directly or rely on the caller
    // since this hook doesn't import rpgExercises.js directly right now.
    // For simplicity, we'll let the caller calculate and pass `statGains`.
  };

  const logDetailedWorkout = (exerciseId, metrics, calculatedXp, statGains) => {
    const logEntry = {
      id: Date.now().toString(),
      exerciseId,
      metrics,
      xpEarned: calculatedXp,
      date: new Date().toISOString()
    };
    
    const newLogs = [logEntry, ...rpgData.workoutLogs].slice(0, 100); 
    const leveledUp = addXP(calculatedXp);

    const newStats = { ...rpgData.stats };
    if (statGains) {
      Object.keys(statGains).forEach(stat => {
        newStats[stat] = (newStats[stat] || 0) + statGains[stat];
      });
    }
    
    saveData({ ...rpgData, workoutLogs: newLogs, stats: newStats });
    return leveledUp;
  };

  const setActivePlan = (planId) => {
    saveData({ ...rpgData, activePlanId: planId });
  };

  const saveCustomPlan = (plan) => {
    const existing = rpgData.customPlans.filter(p => p.id !== plan.id);
    saveData({ ...rpgData, customPlans: [...existing, plan] });
  };

  const acceptQuest = (quest) => {
    saveData({ ...rpgData, activeQuests: [...rpgData.activeQuests, quest] });
  };

  const completeQuest = (questId, rewardXP, rewardGold) => {
    const active = rpgData.activeQuests.filter(q => q.id !== questId);
    const completed = rpgData.activeQuests.find(q => q.id === questId);
    
    if (!completed) return;
    
    completed.completedAt = new Date().toISOString();
    
    saveData({
      ...rpgData,
      activeQuests: active,
      completedQuests: [completed, ...rpgData.completedQuests].slice(0, 20),
      gold: rpgData.gold + rewardGold
    });

    addXP(rewardXP);
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
    completeQuest
  };
}
