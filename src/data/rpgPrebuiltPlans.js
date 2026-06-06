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
          { id: 'bench_press', targetSets: 4, targetReps: 5 },
          { id: 'pullups', targetSets: 4, targetReps: 8 },
          { id: 'pushups', targetSets: 3, targetReps: 15 }
        ]
      },
      {
        dayName: 'Lower Heavy',
        exercises: [
          { id: 'barbell_squat', targetSets: 4, targetReps: 5 },
          { id: 'wall_sit', targetSets: 3, targetDurationMinutes: 1 },
          { id: 'plank', targetSets: 3, targetDurationMinutes: 1 }
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
          { id: 'running_outdoor', targetDistanceKm: 5 }
        ]
      },
      {
        dayName: 'Sprint Intervals',
        exercises: [
          { id: 'sprinting', targetDistanceKm: 1 },
          { id: 'box_jumps', targetSets: 4, targetReps: 10 }
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
          { id: 'pullups', targetSets: 5, targetReps: 10 },
          { id: 'pushups', targetSets: 5, targetReps: 20 },
          { id: 'plank', targetSets: 3, targetDurationMinutes: 2 }
        ]
      },
      {
        dayName: 'Mobility & Flow',
        exercises: [
          { id: 'yoga_flow', targetDurationMinutes: 30 },
          { id: 'static_stretching', targetDurationMinutes: 15 }
        ]
      }
    ]
  }
];
