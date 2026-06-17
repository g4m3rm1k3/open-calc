export const PREBUILT_PLANS = [
  {
    id: 'plan_berserker_ascent',
    name: "The Berserker's Ascent",
    type: 'prebuilt',
    class: 'barbarian',
    description: 'An Upper/Lower powerbuilding split focused on raw strength and muscle mass.',
    workouts: [
      {
        dayName: 'Upper Heavy',
        exercises: [
          { id: 'barbell_bench_press', targetSets: 4, targetReps: 5 },
          { id: 'bw_pullups', targetSets: 4, targetReps: 8 },
          { id: 'bw_pushups', targetSets: 3, targetReps: 15 }
        ]
      },
      {
        dayName: 'Lower Heavy',
        exercises: [
          { id: 'barbell_squat', targetSets: 4, targetReps: 5 },
          { id: 'iso_wall_sit', targetSets: 3, targetDurationMinutes: 1 },
          { id: 'iso_plank', targetSets: 3, targetDurationMinutes: 1 }
        ]
      }
    ]
  },
  {
    id: 'plan_windrunner_path',
    name: "The Windrunner's Path",
    type: 'prebuilt',
    class: 'rogue',
    description: 'A mix of long distance endurance running and high intensity sprint intervals.',
    workouts: [
      {
        dayName: 'Long Run',
        exercises: [
          { id: 'cardio_running', targetDistanceKm: 5 }
        ]
      },
      {
        dayName: 'Sprint Intervals',
        exercises: [
          { id: 'cardio_sprinting', targetDistanceKm: 1 },
          { id: 'bw_box_jumps', targetSets: 4, targetReps: 10 }
        ]
      }
    ]
  },
  {
    id: 'plan_monk_discipline',
    name: "The Monk's Discipline",
    type: 'prebuilt',
    class: 'monk',
    description: 'Bodyweight mastery, isometric holds, and extreme flexibility.',
    workouts: [
      {
        dayName: 'Calisthenics',
        exercises: [
          { id: 'bw_pullups', targetSets: 5, targetReps: 10 },
          { id: 'bw_pushups', targetSets: 5, targetReps: 20 },
          { id: 'iso_plank', targetSets: 3, targetDurationMinutes: 2 }
        ]
      },
      {
        dayName: 'Mobility & Flow',
        exercises: [
          { id: 'mob_yoga', targetDurationMinutes: 30 },
          { id: 'mob_static_stretch', targetDurationMinutes: 15 }
        ]
      }
    ]
  }
];
