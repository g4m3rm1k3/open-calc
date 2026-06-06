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
  // ==========================================
  // BARBELL & POWERLIFTING
  // ==========================================
  { id: 'barbell_bench_press', name: 'Barbell Bench Press', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 1.0 }, baseXpPerRep: 2, description: 'Fundamental upper body horizontal push.' },
  { id: 'barbell_squat', name: 'Barbell Back Squat', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 1.0 }, baseXpPerRep: 3, description: 'The king of lower body exercises.' },
  { id: 'barbell_deadlift', name: 'Barbell Deadlift', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 1.0 }, baseXpPerRep: 3, description: 'Maximal full body pull from the floor.' },
  { id: 'barbell_overhead_press', name: 'Barbell Overhead Press', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 1.0 }, baseXpPerRep: 2, description: 'Strict vertical upper body push.' },
  { id: 'barbell_front_squat', name: 'Barbell Front Squat', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 0.9, DEX: 0.1 }, baseXpPerRep: 3, description: 'Quad-dominant squat requiring high mobility.' },
  { id: 'barbell_bent_over_row', name: 'Barbell Bent Over Row', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 1.0 }, baseXpPerRep: 2, description: 'Heavy horizontal back pull.' },
  { id: 'barbell_romanian_deadlift', name: 'Romanian Deadlift (RDL)', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 0.8, DEX: 0.2 }, baseXpPerRep: 2, description: 'Posterior chain hinge focusing on hamstrings.' },

  // ==========================================
  // DUMBBELLS & FREE WEIGHTS
  // ==========================================
  { id: 'db_bench_press', name: 'Dumbbell Bench Press', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 0.9, DEX: 0.1 }, baseXpPerRep: 2, description: 'Chest press requiring independent stabilization.' },
  { id: 'db_incline_press', name: 'Incline DB Press', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 0.9, DEX: 0.1 }, baseXpPerRep: 2, description: 'Upper chest focused dumbbell press.' },
  { id: 'db_shoulder_press', name: 'Dumbbell Shoulder Press', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 0.9, DEX: 0.1 }, baseXpPerRep: 2, description: 'Vertical overhead dumbbell press.' },
  { id: 'db_lateral_raise', name: 'Dumbbell Lateral Raise', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 0.7, DEX: 0.3 }, baseXpPerRep: 1, description: 'Isolation exercise for lateral deltoids.' },
  { id: 'db_bicep_curl', name: 'Dumbbell Bicep Curl', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 0.8, END: 0.2 }, baseXpPerRep: 1, description: 'Classic elbow flexion isolation.' },
  { id: 'db_tricep_extension', name: 'Overhead Tricep Extension', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 0.8, END: 0.2 }, baseXpPerRep: 1, description: 'Triceps isolation movement.' },
  { id: 'db_lunges', name: 'Dumbbell Walking Lunges', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 0.7, END: 0.3 }, baseXpPerRep: 2, description: 'Unilateral leg strength and stability.' },
  { id: 'db_bulgarian_split_squat', name: 'Bulgarian Split Squat', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 0.8, DEX: 0.2 }, baseXpPerRep: 2, description: 'Intense unilateral leg training.' },

  // ==========================================
  // KETTLEBELLS
  // ==========================================
  { id: 'kb_swing', name: 'Kettlebell Swing', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { AGI: 0.5, STR: 0.3, END: 0.2 }, baseXpPerRep: 1, description: 'Explosive hip hinge for posterior power.' },
  { id: 'kb_goblet_squat', name: 'KB Goblet Squat', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 0.8, DEX: 0.2 }, baseXpPerRep: 2, description: 'Front-loaded squat for depth and core.' },
  { id: 'kb_turkish_getup', name: 'Turkish Get-Up', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { DEX: 0.4, STR: 0.4, AGI: 0.2 }, baseXpPerRep: 5, description: 'Complex full-body mobility and stability drill.' },
  { id: 'kb_snatch', name: 'Kettlebell Snatch', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { AGI: 0.6, STR: 0.2, END: 0.2 }, baseXpPerRep: 2, description: 'Explosive full body pull to overhead.' },
  { id: 'kb_clean_and_press', name: 'KB Clean & Press', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 0.6, AGI: 0.4 }, baseXpPerRep: 3, description: 'Dynamic pull followed by vertical push.' },

  // ==========================================
  // MACHINES & CABLES
  // ==========================================
  { id: 'machine_leg_press', name: 'Leg Press', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 1.0 }, baseXpPerRep: 2, description: 'Heavy lower body machine push.' },
  { id: 'machine_lat_pulldown', name: 'Lat Pulldown', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 1.0 }, baseXpPerRep: 2, description: 'Vertical cable pull for the back.' },
  { id: 'machine_cable_crossover', name: 'Cable Crossover', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 0.8, DEX: 0.2 }, baseXpPerRep: 1, description: 'Chest isolation with constant tension.' },
  { id: 'machine_leg_extension', name: 'Leg Extension', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 0.9, END: 0.1 }, baseXpPerRep: 1, description: 'Quad isolation machine.' },
  { id: 'machine_leg_curl', name: 'Leg Curl', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 0.9, END: 0.1 }, baseXpPerRep: 1, description: 'Hamstring isolation machine.' },
  { id: 'machine_calf_raise', name: 'Calf Raises', type: EXERCISE_TYPES.WEIGHT_REPS, statFocus: { STR: 0.8, END: 0.2 }, baseXpPerRep: 1, description: 'Lower leg isolation.' },

  // ==========================================
  // BODYWEIGHT & CALISTHENICS
  // ==========================================
  { id: 'bw_pushups', name: 'Pushups', type: EXERCISE_TYPES.BODYWEIGHT_REPS, statFocus: { STR: 0.8, END: 0.2 }, baseXpPerRep: 1, description: 'Standard bodyweight horizontal push.' },
  { id: 'bw_pullups', name: 'Pullups', type: EXERCISE_TYPES.BODYWEIGHT_REPS, statFocus: { STR: 0.9, AGI: 0.1 }, baseXpPerRep: 4, description: 'Standard bodyweight vertical pull.' },
  { id: 'bw_chinups', name: 'Chin-ups', type: EXERCISE_TYPES.BODYWEIGHT_REPS, statFocus: { STR: 0.9, AGI: 0.1 }, baseXpPerRep: 4, description: 'Supinated vertical pull (more bicep focus).' },
  { id: 'bw_dips', name: 'Parallel Bar Dips', type: EXERCISE_TYPES.BODYWEIGHT_REPS, statFocus: { STR: 0.9, END: 0.1 }, baseXpPerRep: 2, description: 'Heavy bodyweight vertical push.' },
  { id: 'bw_muscle_ups', name: 'Muscle-Ups', type: EXERCISE_TYPES.BODYWEIGHT_REPS, statFocus: { AGI: 0.6, STR: 0.4 }, baseXpPerRep: 10, description: 'Advanced explosive pull-to-push movement.' },
  { id: 'bw_pistol_squat', name: 'Pistol Squats', type: EXERCISE_TYPES.BODYWEIGHT_REPS, statFocus: { DEX: 0.5, STR: 0.5 }, baseXpPerRep: 5, description: 'Advanced single-leg bodyweight squat.' },
  { id: 'bw_handstand_pushups', name: 'Handstand Pushups', type: EXERCISE_TYPES.BODYWEIGHT_REPS, statFocus: { STR: 0.7, DEX: 0.3 }, baseXpPerRep: 5, description: 'Inverted vertical bodyweight push.' },
  { id: 'bw_crunches', name: 'Crunches / Sit-ups', type: EXERCISE_TYPES.BODYWEIGHT_REPS, statFocus: { END: 0.8, STR: 0.2 }, baseXpPerRep: 0.5, description: 'Core flexion exercise.' },
  { id: 'bw_box_jumps', name: 'Box Jumps', type: EXERCISE_TYPES.BODYWEIGHT_REPS, statFocus: { AGI: 0.7, STR: 0.3 }, baseXpPerRep: 2, description: 'Explosive plyometric movement.' },

  // ==========================================
  // CARDIO & BIKES
  // ==========================================
  { id: 'cardio_running', name: 'Running (Outdoor/Treadmill)', type: EXERCISE_TYPES.DISTANCE_TIME, statFocus: { END: 1.0 }, baseXpPerKm: 100, description: 'Continuous cardiovascular exertion.' },
  { id: 'cardio_sprinting', name: 'Sprints', type: EXERCISE_TYPES.DISTANCE_TIME, statFocus: { AGI: 0.6, END: 0.4 }, baseXpPerKm: 200, description: 'Maximal effort short distance running.' },
  { id: 'cardio_walking', name: 'Walking / Hiking', type: EXERCISE_TYPES.DISTANCE_TIME, statFocus: { END: 0.8, STR: 0.2 }, baseXpPerKm: 50, description: 'Low intensity steady state movement.' },
  { id: 'cardio_stationary_bike', name: 'Stationary Bike', type: EXERCISE_TYPES.DISTANCE_TIME, statFocus: { END: 0.9, STR: 0.1 }, baseXpPerKm: 30, description: 'Indoor cycling for endurance.' },
  { id: 'cardio_road_bike', name: 'Road Cycling', type: EXERCISE_TYPES.DISTANCE_TIME, statFocus: { END: 0.8, AGI: 0.2 }, baseXpPerKm: 35, description: 'Outdoor distance cycling.' },
  { id: 'cardio_mountain_bike', name: 'Mountain Biking', type: EXERCISE_TYPES.DISTANCE_TIME, statFocus: { AGI: 0.4, END: 0.4, STR: 0.2 }, baseXpPerKm: 45, description: 'Off-road variable intensity cycling.' },
  { id: 'cardio_air_bike', name: 'Air Bike (Assault Bike)', type: EXERCISE_TYPES.DISTANCE_TIME, statFocus: { END: 0.5, STR: 0.3, AGI: 0.2 }, baseXpPerKm: 80, description: 'High intensity full-body conditioning.' },
  { id: 'cardio_rowing', name: 'Rowing Machine', type: EXERCISE_TYPES.DISTANCE_TIME, statFocus: { END: 0.7, STR: 0.3 }, baseXpPerKm: 60, description: 'Full body pulling cardiovascular exercise.' },
  { id: 'cardio_stairmaster', name: 'Stairmaster', type: EXERCISE_TYPES.TIME_HOLD, statFocus: { END: 0.8, STR: 0.2 }, baseXpPerMinute: 15, description: 'Continuous step climbing.' }, // Logged as time since distance is weird on stairs

  // ==========================================
  // ISOMETRICS & HOLDS
  // ==========================================
  { id: 'iso_plank', name: 'Plank', type: EXERCISE_TYPES.TIME_HOLD, statFocus: { END: 0.7, STR: 0.3 }, baseXpPerMinute: 20, description: 'Core stabilization hold.' },
  { id: 'iso_wall_sit', name: 'Wall Sit', type: EXERCISE_TYPES.TIME_HOLD, statFocus: { STR: 0.6, END: 0.4 }, baseXpPerMinute: 25, description: 'Yielding isometric for the quads.' },
  { id: 'iso_l_sit', name: 'L-Sit', type: EXERCISE_TYPES.TIME_HOLD, statFocus: { STR: 0.7, DEX: 0.3 }, baseXpPerMinute: 50, description: 'Advanced core and hip flexor hold.' },
  { id: 'iso_planche', name: 'Planche Hold', type: EXERCISE_TYPES.TIME_HOLD, statFocus: { STR: 0.8, AGI: 0.2 }, baseXpPerMinute: 100, description: 'Elite calisthenics static hold.' },
  { id: 'iso_hollow_body', name: 'Hollow Body Hold', type: EXERCISE_TYPES.TIME_HOLD, statFocus: { END: 0.9, STR: 0.1 }, baseXpPerMinute: 30, description: 'Gymnastics fundamental core hold.' },

  // ==========================================
  // MOBILITY & DEXTERITY
  // ==========================================
  { id: 'mob_yoga', name: 'Yoga Flow', type: EXERCISE_TYPES.TIME_HOLD, statFocus: { DEX: 0.9, END: 0.1 }, baseXpPerMinute: 10, description: 'Continuous movement through end ranges of motion.' },
  { id: 'mob_static_stretch', name: 'Static Stretching', type: EXERCISE_TYPES.TIME_HOLD, statFocus: { DEX: 1.0 }, baseXpPerMinute: 5, description: 'Holding stretches to increase muscle length.' },
  { id: 'mob_foam_roll', name: 'Foam Rolling / MFR', type: EXERCISE_TYPES.TIME_HOLD, statFocus: { DEX: 0.8, END: 0.2 }, baseXpPerMinute: 3, description: 'Myofascial release for tissue health.' }
];

export function getExerciseDetails(id) {
  return EXERCISE_DATABASE.find(ex => ex.id === id);
}
