// This serves as the schema definition for all RPG Exercises.
// Another agent can parse this structure and add a massive database of exercises.

export const EXERCISE_TYPES = {
  WEIGHT_REPS: 'weight_reps',       // Requires: Weight, Sets, Reps
  BODYWEIGHT_REPS: 'bodyweight_reps', // Requires: Sets, Reps (optional added weight)
  DISTANCE_TIME: 'distance_time',     // Requires: Distance, Duration (calculates speed)
  TIME_HOLD: 'time_hold',             // Requires: Sets, Duration (e.g., plank, L-sit)
  ISOMETRIC: 'isometric'              // Requires: Sets, Duration (e.g., yielding/overcoming isometrics)
};

export const RPG_STATS = {
  STR: 'Strength',
  END: 'Endurance',
  AGI: 'Agility',
  DEX: 'Dexterity / Mobility'
};

export const EXERCISE_DATABASE = [
  // --- STRENGTH ---
  {
    id: 'bench_press',
    name: 'Bench Press',
    type: EXERCISE_TYPES.WEIGHT_REPS,
    statFocus: { STR: 1.0 },
    baseXpPerRep: 2, // Modified by weight lifted
    description: 'A fundamental upper body strength exercise.'
  },
  {
    id: 'barbell_squat',
    name: 'Barbell Squat',
    type: EXERCISE_TYPES.WEIGHT_REPS,
    statFocus: { STR: 1.0 },
    baseXpPerRep: 3,
    description: 'The king of lower body exercises.'
  },
  {
    id: 'pushups',
    name: 'Pushups',
    type: EXERCISE_TYPES.BODYWEIGHT_REPS,
    statFocus: { STR: 0.8, END: 0.2 },
    baseXpPerRep: 1,
    description: 'Standard bodyweight pushing movement.'
  },
  {
    id: 'pullups',
    name: 'Pullups',
    type: EXERCISE_TYPES.BODYWEIGHT_REPS,
    statFocus: { STR: 0.9, AGI: 0.1 },
    baseXpPerRep: 5,
    description: 'Vertical pulling movement.'
  },
  
  // --- ENDURANCE ---
  {
    id: 'running_outdoor',
    name: 'Running (Outdoor/Treadmill)',
    type: EXERCISE_TYPES.DISTANCE_TIME,
    statFocus: { END: 1.0 },
    baseXpPerKm: 100,
    description: 'Continuous cardiovascular exertion.'
  },
  {
    id: 'cycling',
    name: 'Cycling',
    type: EXERCISE_TYPES.DISTANCE_TIME,
    statFocus: { END: 0.9, STR: 0.1 },
    baseXpPerKm: 30, // Cycling is faster, so less XP per km
    description: 'Low impact cardiovascular training.'
  },

  // --- AGILITY / POWER ---
  {
    id: 'box_jumps',
    name: 'Box Jumps',
    type: EXERCISE_TYPES.BODYWEIGHT_REPS,
    statFocus: { AGI: 0.7, STR: 0.3 },
    baseXpPerRep: 2,
    description: 'Explosive plyometric movement.'
  },
  {
    id: 'sprinting',
    name: 'Sprints',
    type: EXERCISE_TYPES.DISTANCE_TIME,
    statFocus: { AGI: 0.6, END: 0.4 },
    baseXpPerKm: 200, // Harder than jogging
    description: 'Maximal effort short distance running.'
  },

  // --- HOLDS / ISOMETRICS ---
  {
    id: 'plank',
    name: 'Plank',
    type: EXERCISE_TYPES.TIME_HOLD,
    statFocus: { END: 0.7, STR: 0.3 },
    baseXpPerMinute: 20,
    description: 'Core stabilization hold.'
  },
  {
    id: 'wall_sit',
    name: 'Wall Sit',
    type: EXERCISE_TYPES.ISOMETRIC,
    statFocus: { STR: 0.6, END: 0.4 },
    baseXpPerMinute: 25,
    description: 'Yielding isometric for the quads.'
  },

  // --- DEXTERITY / MOBILITY ---
  {
    id: 'yoga_flow',
    name: 'Yoga Flow',
    type: EXERCISE_TYPES.TIME_HOLD, // Simplification: we'll just track duration for yoga
    statFocus: { DEX: 0.9, END: 0.1 },
    baseXpPerMinute: 10,
    description: 'Continuous movement through end ranges of motion.'
  },
  {
    id: 'static_stretching',
    name: 'Static Stretching',
    type: EXERCISE_TYPES.TIME_HOLD,
    statFocus: { DEX: 1.0 },
    baseXpPerMinute: 5,
    description: 'Holding stretches to increase muscle length.'
  }
];

export function getExerciseDetails(id) {
  return EXERCISE_DATABASE.find(ex => ex.id === id);
}
