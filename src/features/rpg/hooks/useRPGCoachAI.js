import { useState, useCallback } from 'react';
import { getSharedEngine } from '../../../hooks/webLLMSingleton.js';
import { PREBUILT_PLANS } from '../data/rpgPrebuiltPlans';
import { getExerciseDetails, EXERCISE_TYPES } from '../data/rpgExercises';


// Used when the user has no active plan — establishes basic movement baselines
// before assigning anything plan-specific
const BASELINE_POOL = [
  {
    name: 'Pushups',
    task: 'Complete 3 sets of max-effort pushups with good form. Rest 2 minutes between sets. Log the reps for each set.',
  },
  {
    name: 'Plank Hold',
    task: 'Hold a plank for as long as possible. Rest 90 seconds. Repeat 3 times. Log your best hold time in seconds.',
  },
  {
    name: 'Bodyweight Squats',
    task: 'Complete 3 sets of 15 bodyweight squats with full depth. No added weight. Focus on form and controlled descent.',
  },
  {
    name: 'Walking',
    task: 'Walk for 20 minutes at a pace where you can hold a full conversation. This is your aerobic baseline.',
  },
  {
    name: 'Crunches',
    task: 'Complete 3 sets of max crunches with strict form. Rest 60 seconds between sets. Log reps per set.',
  },
];

// The AI only writes the quest name and flavor description.
// We compute the actual task ourselves — the model should not invent exercises.
const SYSTEM_PROMPT = `You are a quest writer for an RPG fitness app. Your only job is to write an RPG-flavored quest name and one short description sentence.
You will be given a specific workout task. Do NOT change the task — copy it exactly.
Output ONLY a valid JSON object with these exact keys:
- "questName": RPG-style title, 3-5 words max
- "description": exactly one sentence of fantasy flavor text that references the hero class and hints at the real fitness benefit
- "task": copy the provided task EXACTLY, word for word
- "rewardXP": integer between 50 and 300
- "rewardGold": integer between 10 and 80
Output nothing except the JSON object.`;

// Derive all unique exercises from the active plan, preserving plan targets
function resolvePlanExercises(rpgData) {
  const allPlans = [...PREBUILT_PLANS, ...(rpgData.customPlans || [])];
  const plan = allPlans.find(p => p.id === rpgData.activePlanId);
  if (!plan) return null;

  const seen = new Set();
  const exercises = [];
  for (const day of plan.workouts || []) {
    for (const ex of day.exercises || []) {
      if (seen.has(ex.id)) continue;
      const details = getExerciseDetails(ex.id);
      if (details) {
        seen.add(ex.id);
        exercises.push({ ...ex, details });
      }
    }
  }
  return exercises.length > 0 ? exercises : null;
}

// Pick which exercise to focus the quest on:
// - Prefer exercises not done in the last 5 logs (freshness rotation)
// - Rotate deterministically by total quest count so repeated calls vary
function pickExercise(planExercises, rpgData) {
  const recentIds = new Set(
    (rpgData.workoutLogs || []).slice(0, 5).map(l => l.exerciseId)
  );
  const fresh = planExercises.filter(ex => !recentIds.has(ex.id));
  const pool = fresh.length > 0 ? fresh : planExercises;
  const questCount = (rpgData.completedQuests || []).length + (rpgData.activeQuests || []).length;
  return pool[questCount % pool.length];
}

// Build a concrete task string with progressive overload baked in
function buildTask(planEx, workoutLogs) {
  const ex = planEx.details;
  const lastLog = workoutLogs.find(l => l.exerciseId === planEx.id);
  const m = lastLog?.metrics || {};

  const sets = planEx.targetSets || 3;
  const reps = planEx.targetReps || 10;
  const distKm = planEx.targetDistanceKm;
  const durMin = planEx.targetDurationMinutes;

  // Distance-based cardio
  if (distKm || ex.type === EXERCISE_TYPES.DISTANCE_TIME) {
    const lastDist = parseFloat(m.distance) || 0;
    if (lastDist > 0) {
      const next = Math.min(lastDist * 1.1, (distKm || lastDist) * 1.5).toFixed(1);
      return `Complete ${next}km of ${ex.name}. Your last session was ${lastDist}km — aim to match or slightly beat it.`;
    }
    return `Complete ${distKm || 1}km of ${ex.name} at a comfortable effort. Log your time when done.`;
  }

  // Duration/hold-based
  if (durMin || ex.type === EXERCISE_TYPES.TIME_HOLD || ex.type === EXERCISE_TYPES.ISOMETRIC) {
    const lastDur = parseFloat(m.duration) || 0;
    if (lastDur > 0) {
      const next = Math.round(lastDur * 1.1);
      return `Complete ${sets} set${sets > 1 ? 's' : ''} of ${next} minutes of ${ex.name}. Last session you held ${lastDur} minutes.`;
    }
    const target = durMin || 1;
    return `Complete ${sets} set${sets > 1 ? 's' : ''} of ${target} minute${target > 1 ? 's' : ''} of ${ex.name}.`;
  }

  // Reps-based (weighted or bodyweight)
  const lastReps = parseInt(m.reps) || 0;
  const lastSets = parseInt(m.sets) || 0;
  const lastWeight = parseFloat(m.weight) || 0;

  if (lastReps > 0) {
    // Logged before — apply progressive overload
    if (lastWeight > 0) {
      // If they hit their rep target last time, nudge weight up; otherwise keep it
      const nextWeight = lastReps >= reps ? lastWeight + 2.5 : lastWeight;
      const nextReps = lastReps >= reps ? reps : lastReps + 1;
      return `Complete ${sets} sets of ${nextReps} reps of ${ex.name} at ${nextWeight}lbs. Last session: ${lastSets}×${lastReps} @ ${lastWeight}lbs.`;
    }
    const nextReps = lastReps >= reps ? reps + 1 : lastReps + 1;
    return `Complete ${sets} sets of ${nextReps} reps of ${ex.name}. Last session: ${lastSets}×${lastReps}.`;
  }

  // First time doing this exercise
  if (ex.type === EXERCISE_TYPES.WEIGHT_REPS) {
    return `Complete ${sets} sets of ${reps} reps of ${ex.name}. Start with a weight you can control with perfect form throughout all sets.`;
  }
  return `Complete ${sets} sets of ${reps} reps of ${ex.name}.`;
}

export function useRPGCoachAI() {
  const [isThinking, setIsThinking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');

  const ensureEngine = useCallback(async () => {
    setIsDownloading(true);
    try {
      return await getSharedEngine(p => setDownloadProgress(p));
    } finally {
      setIsDownloading(false);
      setDownloadProgress('');
    }
  }, []);

  const generateQuest = useCallback(async (rpgData) => {
    setIsThinking(true);
    try {
      const engine = await ensureEngine();

      // 1. Determine what exercise to quest on
      const planExercises = resolvePlanExercises(rpgData);
      let chosenTask = '';
      let exerciseName = '';

      if (!planExercises) {
        // No active plan — cycle through baseline exercises
        const idx = (rpgData.completedQuests || []).length % BASELINE_POOL.length;
        const baseline = BASELINE_POOL[idx];
        exerciseName = baseline.name;
        chosenTask = baseline.task;
      } else {
        const picked = pickExercise(planExercises, rpgData);
        exerciseName = picked.details.name;
        chosenTask = buildTask(picked, rpgData.workoutLogs || []);
      }

      // 2. Ask the AI only for quest name + flavor text — not for the task itself
      const prompt = `Hero: Level ${rpgData.level || 1} ${rpgData.heroClass || 'adventurer'} (${rpgData.experienceLevel || 'beginner'}).
Quest task: "${chosenTask}"
Write an RPG quest name and description for this task. Return JSON only.`;

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ];

      const response = await engine.chat.completions.create({
        messages,
        max_tokens: 200,
        temperature: 0.8,
      });

      let content = response.choices[0].message.content?.trim() || '';
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in model response');

      const parsed = JSON.parse(jsonMatch[0]);

      // Always override task with our computed one — never trust the model to copy it exactly
      parsed.task = chosenTask;
      if (!parsed.questName) parsed.questName = `${exerciseName} Challenge`;
      if (!parsed.rewardXP || typeof parsed.rewardXP !== 'number') parsed.rewardXP = 100;
      if (!parsed.rewardGold || typeof parsed.rewardGold !== 'number') parsed.rewardGold = 25;

      return parsed;
    } catch (err) {
      console.error('Error generating quest:', err);
      throw err;
    } finally {
      setIsThinking(false);
    }
  }, [ensureEngine]);

  return { generateQuest, isThinking, isDownloading, downloadProgress };
}
