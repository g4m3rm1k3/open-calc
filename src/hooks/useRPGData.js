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

  const logWorkout = (workoutType, durationOrReps, calculatedXp, rpe = 5) => {
    const logEntry = {
      id: Date.now().toString(),
      type: workoutType,
      value: durationOrReps,
      xpEarned: calculatedXp,
      rpe: rpe,
      date: new Date().toISOString()
    };
    
    const newLogs = [logEntry, ...rpgData.workoutLogs].slice(0, 50); // Keep last 50
    const leveledUp = addXP(calculatedXp);
    
    saveData({ ...rpgData, workoutLogs: newLogs });
    return leveledUp;
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
    logWorkout,
    acceptQuest,
    completeQuest
  };
}
