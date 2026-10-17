import { Exercise } from '@/types/workout';
import { UserProfile, WorkoutDuration, ExperienceLevel, FitnessGoal, TrainingFrequency } from '@/types/questionnaire';

/**
 * Returns the baseline target exercise count based on requested session duration.
 */
export function getTargetExerciseCount(duration: WorkoutDuration): number {
  switch (duration) {
    case 30:
      return 3;
    case 45:
      return 4;
    case 60:
      return 6;
    case 90:
      return 8;
    case 120:
      return 9;
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
export function estimateExerciseDuration(sets: number, reps: string, restSeconds: number): number {
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
  // Equipment adjustment & loading buffer (approx 45 seconds per movement)
  const totalSeconds = totalWorkSeconds + 45;

  return Math.max(2, Math.round(totalSeconds / 60));
}

/**
 * Calculates total session duration in minutes, factoring 5-minute dynamic mobility warm-up.
 */
export function calculateWorkoutDuration(
  exercises: Array<{ sets: number; reps: string; restSeconds: number }>
): number {
  const warmupMinutes = 5;
  const exercisesDuration = exercises.reduce(
    (acc, ex) => acc + estimateExerciseDuration(ex.sets, ex.reps, ex.restSeconds),
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
      if (!intensityNote) {
        intensityNote = 'Focus on peak glute contraction at top of movement with a 1-second squeeze.';
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
    intensityNote = 'Focus on controlled form and smooth cadence. Stop with 2-3 reps in reserve.';
  } else if (profile.experience === 'advanced') {
    if (exercise.tier === 1 && (profile.goal === 'build_strength' || profile.goal === 'overall_strength')) {
      reps = '4-6';
      restSeconds = Math.max(120, restSeconds + 30);
      intensityNote = 'Heavy compound work. Rest fully between working sets (RPE 8-9).';
    }
  }

  // 4. Goal Scaling
  if (profile.goal === 'fat_loss' || profile.goal === 'endurance') {
    restSeconds = Math.max(45, restSeconds - 15);
    if (!reps.includes('s') && !reps.includes('m')) {
      reps = '12-15';
    }
    if (!intensityNote) {
      intensityNote = 'Keep rest periods crisp to maintain elevated heart rate and workout density.';
    }
  } else if (profile.goal === 'glute_emphasis' && isPosteriorOrGlute) {
    sets = Math.min(4, sets + 1);
    intensityNote = 'Target muscle priority: full range of motion with intentional mind-muscle connection.';
  }

  // 5. Age Scaling (51+ joint safety & recovery)
  if (profile.age === '51-60' || profile.age === '61+') {
    restSeconds += 30;
    // Avoid heavy low-rep axial grinds for master lifters
    if (reps === '4-6' || reps === '5') {
      reps = '8-10';
    }
    if (exercise.tier === 1) {
      intensityNote = (intensityNote ? intensityNote + ' ' : '') + 'Take warm-up sets progressively; prioritize joint comfort over load.';
    }
  }

  return { sets, reps, restSeconds, intensityNote };
}
