import exerciseData from '../../../data/rpg/exercises.json'

export const EXERCISE_TYPES = exerciseData.types
export const RPG_STATS = exerciseData.stats
export const EXERCISE_DATABASE = exerciseData.exercises

export function getExerciseDetails(id) {
  return EXERCISE_DATABASE.find(ex => ex.id === id)
}

export function getExercisesByDifficulty(difficulty) {
  return EXERCISE_DATABASE.filter(ex => ex.difficulty === difficulty)
}

export function getExercisesByMuscle(muscle) {
  return EXERCISE_DATABASE.filter(
    ex => ex.muscles.primary.includes(muscle) || ex.muscles.secondary.includes(muscle)
  )
}

export function getProgressions(id) {
  const ex = getExerciseDetails(id)
  if (!ex) return { easier: [], harder: [] }
  return {
    easier: ex.progressions.easier.map(getExerciseDetails).filter(Boolean),
    harder: ex.progressions.harder.map(getExerciseDetails).filter(Boolean),
  }
}
