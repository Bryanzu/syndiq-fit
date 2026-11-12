import { Exercise } from '@/types/workout';
import { UserProfile, WorkoutDuration, ExperienceLevel, FitnessGoal, TrainingFrequency } from '@/types/questionnaire';

/**
 * Returns the baseline target exercise count based on requested session duration.
 */
export function getTargetExerciseCount(duration: WorkoutDuration): number {
  switch (duration) {
    case 30:
      return 4;
    case 45:
      return 5;
    case 60:
      return 6;
    case 90:
      return 8;
    case 120:
      return 10;
    default:
      return 6;
  }
}

/**
 * Resolves automatic frequency recommendation based on experience, goal, and age.
 */
export function resolveTrainingFrequency(
  selectedFrequency: TrainingFrequency,
  experience: ExperienceLevel,
  goal: FitnessGoal,
  age?: string
): number {
  if (selectedFrequency !== 'recommend') {
    return selectedFrequency;
  }

  // Automatic recommendation logic
  switch (experience) {
    case 'complete_beginner':
      return 3; // 3-day full body is the evidence-based gold standard for motor learning
    case 'beginner':
      return 3;
    case 'intermediate':
      return 4; // 4-day upper/lower
    case 'advanced':
      // Lifters aged 61+ thrive with 3-4 days to preserve systemic recovery
      if (age === '61+') return 3;
      if (goal === 'build_strength' || goal === 'muscle_building') {
        return 5;
      }
      return 4;
    default:
      return 3;
  }
}

/**
 * Accurately estimates exercise time in minutes based on sets, rep cadence (tempo),
 * rest intervals, and equipment changeover.
 */
export function estimateExerciseDuration(
  sets: number,
  reps: string,
  restSeconds: number,
  setupSeconds: number = 90
): number {
  // Parse average reps: e.g. "8-12" -> 10, "10-15" -> 12.5, "4-6" -> 5, "30s" -> 30
  let repCount = 10;
  if (reps.includes('-')) {
    const parts = reps
      .split('-')
      .map((p) => parseInt(p.trim(), 10))
      .filter((n) => !isNaN(n));
    if (parts.length === 2) repCount = (parts[0] + parts[1]) / 2;
  } else if (!isNaN(parseInt(reps, 10))) {
    repCount = parseInt(reps, 10);
  }

  // Rep tempo ~ 3 seconds per rep (2s eccentric, 1s concentric)
  const secondsUnderTension = reps.includes('s') ? repCount : repCount * 3;
  // Total work seconds = sets * (tension + rest)
  const totalWorkSeconds = sets * (secondsUnderTension + restSeconds);
  // Per-movement overhead: walking to the station, loading, and ramp-up sets
  const totalSeconds = totalWorkSeconds + setupSeconds;

  return Math.max(2, Math.round(totalSeconds / 60));
}

/**
 * Calculates total session duration in minutes, factoring 5-minute dynamic mobility warm-up.
 */
export function calculateWorkoutDuration(
  exercises: Array<{ sets: number; reps: string; restSeconds: number; exercise?: { tier?: number } }>
): number {
  const warmupMinutes = 5;
  const exercisesDuration = exercises.reduce(
    // Main compounds (tier 1) need ramp-up sets and plate loading, so they carry more setup time
    (acc, ex) => acc + estimateExerciseDuration(ex.sets, ex.reps, ex.restSeconds, ex.exercise?.tier === 1 ? 150 : 90),
    0
  );
  return warmupMinutes + exercisesDuration;
}

/**
 * Adapts volume, reps, and rest intervals based on duration, experience, goal, age, and gender.
 */
export function adaptExerciseVolume(
  exercise: Exercise,
  profile: UserProfile
): { sets: number; reps: string; restSeconds: number; intensityNote?: string } {
  let sets = exercise.defaultSets;
  let reps = exercise.defaultReps;
  let restSeconds = exercise.defaultRestSeconds;
  let intensityNote = exercise.intensityNote;

  const isFemale = profile.gender === 'female';
  const isPosteriorOrGlute =
    exercise.primaryMuscles.includes('glutes') ||
    exercise.primaryMuscles.includes('hamstrings') ||
    exercise.movementPattern === 'hip_hinge';
  // Glute cues only go on movements that train the glutes (not leg curls or good mornings)
  const trainsGlutes = exercise.primaryMuscles.includes('glutes');

  // 1. Duration Scaling
  if (profile.duration === 30) {
    sets = Math.max(2, sets - 1);
    restSeconds = Math.max(45, restSeconds - 15);
  } else if (profile.duration === 90 || profile.duration === 120) {
    sets = Math.min(4, sets + 1);
  }

  // 2. Gender Volume Calibration
  // Female physiology demonstrates enhanced recovery capacity and higher muscular endurance in lower body/posterior chain
  if (isFemale) {
    if (isPosteriorOrGlute && profile.duration >= 45) {
      sets = Math.min(4, sets + 1);
      if (!intensityNote && trainsGlutes) {
        intensityNote = 'Squeeze your glutes for a second at the top.';
      }
    }
    // Females often benefit from slightly crisper rest intervals without compromising power output
    if (exercise.tier !== 1 && restSeconds > 60) {
      restSeconds = Math.max(45, restSeconds - 15);
    }
  }

  // 3. Experience Scaling
  if (profile.experience === 'complete_beginner') {
    sets = Math.min(3, Math.max(2, sets));
    if (!reps.includes('s')) {
      reps = '10-15';
    }
    restSeconds = Math.max(60, restSeconds);
    intensityNote = 'Move slowly and stop with 2 or 3 reps left in the tank.';
  } else if (profile.experience === 'advanced') {
    if (exercise.tier === 1 && (profile.goal === 'build_strength' || profile.goal === 'overall_strength')) {
      reps = '4-6';
      restSeconds = Math.max(120, restSeconds + 30);
      intensityNote = 'Go heavy. Rest fully between sets and stop 1 or 2 reps short of failure.';
    }
  } else if (profile.experience === 'intermediate') {
    if (exercise.tier === 1 && (profile.goal === 'build_strength' || profile.goal === 'overall_strength')) {
      reps = '5-8';
      restSeconds = Math.max(120, restSeconds);
      intensityNote = 'Add weight once every set reaches the top of the rep range. Stop about 2 reps short of failure.';
    }
  }

  // 4. Goal Scaling
  if (profile.goal === 'fat_loss' || profile.goal === 'endurance') {
    restSeconds = Math.max(45, restSeconds - 15);
    // Fat loss keeps main compounds in their normal rep range: heavy work preserves muscle in a deficit.
    const keepHeavy = profile.goal === 'fat_loss' && exercise.tier === 1;
    if (!keepHeavy && !reps.includes('s') && !reps.includes('m')) {
      reps = '12-15';
    }
    if (!intensityNote) {
      intensityNote = 'Keep rests short so your heart rate stays up.';
    }
  } else if (profile.goal === 'glute_emphasis' && isPosteriorOrGlute) {
    sets = Math.min(4, sets + 1);
    intensityNote = 'Use the full range and lower the weight slowly.';
  }

  // 4b. Secondary Goals Nuance (complements primary goal)
  if (profile.secondaryGoals && profile.secondaryGoals.length > 0) {
    const hasSecondaryStrength = profile.secondaryGoals.includes('build_strength') || profile.secondaryGoals.includes('overall_strength');
    const hasSecondaryEndurance = profile.secondaryGoals.includes('endurance') || profile.secondaryGoals.includes('fat_loss');
    const hasSecondaryGlute = profile.secondaryGoals.includes('glute_emphasis');
    const hasSecondaryCore = profile.secondaryGoals.includes('core_emphasis');

    if (hasSecondaryStrength && exercise.tier === 1 && profile.goal !== 'fat_loss') {
      if (!reps.includes('s') && !reps.includes('m') && reps === '8-12') {
        reps = '6-8';
      }
      restSeconds = Math.max(90, restSeconds + 15);
      if (!intensityNote) {
        intensityNote = 'Keep strict form and add weight a little at a time.';
      }
    } else if (hasSecondaryEndurance && exercise.tier === 3) {
      restSeconds = Math.max(45, restSeconds - 15);
      if (!intensityNote) {
        intensityNote = 'Keep a steady pace and short rests.';
      }
    } else if (hasSecondaryGlute && trainsGlutes && profile.goal !== 'glute_emphasis') {
      if (!intensityNote) {
        intensityNote = 'Finish each rep with your hips fully straight and your glutes squeezed.';
      }
    } else if (hasSecondaryCore && (exercise.primaryMuscles.includes('abs') || exercise.primaryMuscles.includes('obliques'))) {
      if (!intensityNote) {
        intensityNote = 'Keep your stomach braced for the whole set.';
      }
    }
  }

  // 5. Age Scaling (51+ joint safety & recovery)
  if (profile.age === '51-60' || profile.age === '61+') {
    restSeconds += 30;
    // Avoid heavy low-rep axial grinds for master lifters
    if (reps === '4-6' || reps === '5' || reps === '5-8') {
      reps = '8-10';
    }
    if (exercise.tier === 1) {
      intensityNote = (intensityNote ? intensityNote + ' ' : '') + 'Build up with a few warm-up sets. Comfortable joints matter more than the weight.';
    }
  }

  return { sets, reps, restSeconds, intensityNote };
}
