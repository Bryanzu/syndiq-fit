import { Exercise, MuscleGroup } from '@/types/workout';

const muscleName = (m: MuscleGroup) => m.replace('_', ' ');

function muscleList(muscles: MuscleGroup[]): string {
  const names = muscles.slice(0, 2).map(muscleName);
  return names.length === 2 ? `${names[0]} and ${names[1]}` : names[0] ?? 'whole body';
}

/**
 * One plain sentence on why an exercise is in a program, built from what the exercise is
 * (main lift, supporting lift or isolation) and the muscles it trains.
 */
export function plainReason(exercise: Exercise): string {
  const muscles = muscleList(exercise.primaryMuscles);
  const prefix = exercise.isStrictBodyweight ? 'No equipment needed. ' : '';

  if (exercise.movementPattern === 'conditioning') return `${prefix}Gets your heart rate up.`;
  if (exercise.movementPattern === 'carry') return `${prefix}Builds grip and a strong trunk.`;
  if (exercise.movementPattern === 'core') return `${prefix}Trains your ${muscles} to stay braced.`;
  if (exercise.tier === 1) return `${prefix}A main lift. Builds your ${muscles} with heavy weight.`;
  if (exercise.tier === 2) return `${prefix}Backs up the main lift with more ${muscles} work.`;
  return `${prefix}Works your ${muscles} on their own.`;
}
