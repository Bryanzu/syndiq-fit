import { Exercise, MovementPattern } from '@/types/workout';

const TIER_1_IDS = new Set([
  'barbell-bench-press',
  'incline-barbell-press',
  'barbell-back-squat',
  'front-squat',
  'conventional-deadlift',
  'trap-bar-deadlift',
  'barbell-overhead-press',
  'pull-up',
  'barbell-row',
]);

const TIER_2_IDS = new Set([
  'dumbbell-bench-press',
  'incline-dumbbell-press',
  'machine-chest-press',
  'chest-dip',
  'push-up',
  'dumbbell-shoulder-press',
  'machine-shoulder-press',
  'arnold-press',
  'landmine-press',
  'lat-pulldown',
  'close-grip-pulldown',
  'chin-up',
  'assisted-pull-up',
  'dumbbell-row',
  'seated-cable-row',
  'chest-supported-row',
  't-bar-row',
  'machine-row',
  'leg-press',
  'hack-squat',
  'goblet-squat',
  'box-squat',
  'smith-machine-squat',
  'walking-lunge',
  'reverse-lunge',
  'bulgarian-split-squat',
  'step-up',
  'romanian-deadlift',
  'dumbbell-romanian-deadlift',
  'hip-thrust',
  'glute-bridge',
  'sumo-deadlift',
  'rack-pull',
  'close-grip-bench-press',
  'overhead-dumbbell-extension',
  'skull-crusher',
]);

export function getExerciseTier(exercise: Exercise): 1 | 2 | 3 {
  if (TIER_1_IDS.has(exercise.id)) return 1;
  if (TIER_2_IDS.has(exercise.id)) return 2;
  return 3;
}

export function getExercisePattern(exercise: Exercise): MovementPattern {
  const id = exercise.id;
  const primary = exercise.primaryMuscles;

  // Specific IDs
  if (id.includes('deadlift') || id.includes('good-morning') || id.includes('back-extension') || id.includes('kettlebell-swing')) {
    return 'hip_hinge';
  }
  if (id.includes('squat') || id.includes('leg-press') || id.includes('lunge') || id.includes('step-up')) {
    return 'quad_dominant';
  }
  if (id.includes('bench-press') || id.includes('push-up') || id.includes('chest-press') || id.includes('chest-dip')) {
    return 'horizontal_push';
  }
  if (id.includes('overhead-press') || id.includes('shoulder-press') || id.includes('pike-push-up') || id.includes('arnold-press') || id.includes('landmine-press')) {
    return 'vertical_push';
  }
  if (id.includes('row') || id.includes('rack-pull') || id.includes('face-pull')) {
    return 'horizontal_pull';
  }
  if (id.includes('pull-up') || id.includes('chin-up') || id.includes('pulldown')) {
    return 'vertical_pull';
  }
  if (id.includes('curl') && !id.includes('leg-curl')) {
    return 'isolation_biceps';
  }
  if (id.includes('triceps') || id.includes('pushdown') || id.includes('extension') && !id.includes('leg-extension') && !id.includes('back-extension') || id.includes('bench-dip')) {
    return 'isolation_triceps';
  }
  if (id.includes('lateral-raise') || id.includes('front-raise') || id.includes('rear-delt') || id.includes('reverse-pec-deck') || id.includes('shrug') || id.includes('upright-row')) {
    return 'isolation_delts';
  }
  if (id.includes('fly') || id.includes('crossover')) {
    return 'isolation_chest';
  }
  if (id.includes('leg-curl') || id.includes('leg-extension') || id.includes('calf-raise') || id.includes('hip-abduction') || id.includes('cable-kickback')) {
    return 'isolation_legs';
  }
  if (primary.includes('abs') || primary.includes('obliques')) {
    return 'core';
  }
  if (id.includes('carry')) {
    return 'carry';
  }
  if (id.includes('burpee') || id.includes('thruster')) {
    return 'conditioning';
  }

  // Fallbacks by primary muscle
  if (primary.includes('chest')) return 'horizontal_push';
  if (primary.includes('lats') || primary.includes('upper_back')) return 'horizontal_pull';
  if (primary.includes('front_delts') || primary.includes('side_delts')) return 'vertical_push';
  if (primary.includes('quads')) return 'quad_dominant';
  if (primary.includes('hamstrings') || primary.includes('glutes')) return 'hip_hinge';
  if (primary.includes('biceps')) return 'isolation_biceps';
  if (primary.includes('triceps')) return 'isolation_triceps';
  if (primary.includes('calves')) return 'isolation_legs';

  return 'conditioning';
}

export function enhanceExercise(exercise: Exercise): Exercise {
  return {
    ...exercise,
    tier: getExerciseTier(exercise),
    movementPattern: getExercisePattern(exercise),
  };
}
