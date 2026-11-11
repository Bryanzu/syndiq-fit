import { Exercise } from '@/types/workout';

/** A photo for an exercise, chosen by the kind of movement it is. Files live in public/images/exercises. */
export function exercisePhoto(exercise: Pick<Exercise, 'id' | 'movementPattern' | 'equipment'>): string {
  const p = exercise.movementPattern;
  let key = 'squat';
  if (p === 'horizontal_push' || p === 'isolation_chest') key = exercise.equipment === 'bodyweight' ? 'pushup' : 'bench';
  else if (p === 'vertical_push' || p === 'isolation_delts') key = 'overhead';
  else if (p === 'horizontal_pull') key = 'row';
  else if (p === 'vertical_pull') key = 'pullup';
  else if (p === 'quad_dominant') key = /lunge|split|step/.test(exercise.id) ? 'lunge' : 'squat';
  else if (p === 'hip_hinge') key = 'deadlift';
  else if (p === 'isolation_biceps') key = 'curl';
  else if (p === 'isolation_triceps') key = 'triceps';
  else if (p === 'isolation_legs') key = 'legmachine';
  else if (p === 'core') key = 'plank';
  else if (p === 'conditioning') key = 'kettlebell';
  else if (p === 'carry') key = 'carry';
  return `/images/exercises/${key}.jpg`;
}

/** A photo for a recipe. Every recipe id has a file in public/images/meals. */
export function mealPhoto(recipeId: string): string {
  return `/images/meals/${recipeId}.jpg`;
}
