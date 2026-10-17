import { WorkoutProgram, WorkoutDay, WorkoutExerciseItem, MuscleGroup } from '@/types/workout';
import { isExerciseAvailable } from './equipmentFilter';
import { isContraindicated } from './injuryRules';

export interface WorkoutValidationResult {
  isValid: boolean;
  score: number; // 0 - 100
  errors: string[];
  warnings: string[];
  metrics: {
    totalExercises: number;
    totalSets: number;
    pushSets: number;
    pullSets: number;
    pushPullRatio: number;
    legSets: number;
    coreSets: number;
    avgDailyDuration: number;
    targetDuration: number;
    equipmentCompliancePercent: number;
    injurySafetyPercent: number;
  };
}

const PUSH_PATTERNS = new Set(['horizontal_push', 'vertical_push', 'isolation_chest', 'isolation_triceps']);
const PULL_PATTERNS = new Set(['horizontal_pull', 'vertical_pull', 'isolation_biceps']);
const LEG_PATTERNS = new Set(['quad_dominant', 'hip_hinge', 'isolation_legs']);
const CORE_PATTERNS = new Set(['core']);

const PUSH_MUSCLES: MuscleGroup[] = ['chest', 'front_delts', 'triceps'];
const PULL_MUSCLES: MuscleGroup[] = ['lats', 'upper_back', 'rear_delts', 'biceps', 'traps'];
const LEG_MUSCLES: MuscleGroup[] = ['quads', 'hamstrings', 'glutes', 'calves'];
const CORE_MUSCLES: MuscleGroup[] = ['abs', 'obliques', 'lower_back'];

/**
 * Validates a generated workout program against safety, equipment,
 * biomechanical balance, volume, and duration constraints.
 */
export function validateWorkoutProgram(program: WorkoutProgram): WorkoutValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const profile = program.userProfile;
  let totalExercises = 0;
  let totalSets = 0;
  let pushSets = 0;
  let pullSets = 0;
  let legSets = 0;
  let coreSets = 0;
  let totalEstimatedDuration = 0;

  let equipmentCompliantCount = 0;
  let injurySafeCount = 0;

  if (!program.days || program.days.length === 0) {
    errors.push('Workout program contains no scheduled training days.');
    return {
      isValid: false,
      score: 0,
      errors,
      warnings,
      metrics: {
        totalExercises: 0,
        totalSets: 0,
        pushSets: 0,
        pullSets: 0,
        pushPullRatio: 1,
        legSets: 0,
        coreSets: 0,
        avgDailyDuration: 0,
        targetDuration: profile.duration,
        equipmentCompliancePercent: 0,
        injurySafetyPercent: 0,
      },
    };
  }

  program.days.forEach((day: WorkoutDay) => {
    const seenExerciseIds = new Set<string>();
    totalEstimatedDuration += day.estimatedDuration;

    if (day.exercises.length === 0) {
      errors.push(`Day ${day.dayNumber} ("${day.title}") has no exercises assigned.`);
      return;
    }

    day.exercises.forEach((item: WorkoutExerciseItem) => {
      const ex = item.exercise;
      totalExercises++;
      totalSets += item.sets;

      // 1. Deduplication check within day
      if (seenExerciseIds.has(ex.id)) {
        errors.push(`Day ${day.dayNumber}: Duplicate exercise "${ex.name}" detected.`);
      }
      seenExerciseIds.add(ex.id);

      // 2. Equipment availability check
      const isEquipSafe = isExerciseAvailable(ex, profile.availableEquipment);
      if (isEquipSafe) {
        equipmentCompliantCount++;
      } else {
        errors.push(
          `Day ${day.dayNumber}: Exercise "${ex.name}" requires equipment not selected in your available equipment.`
        );
      }

      // 3. Injury contraindication check
      const hasConflict = isContraindicated(ex, profile.injuries);
      if (!hasConflict) {
        injurySafeCount++;
      } else {
        errors.push(
          `Day ${day.dayNumber}: Exercise "${ex.name}" is contraindicated for reported injuries (${profile.injuries.join(', ')}).`
        );
      }

      // 4. Sets & Reps boundary checks
      if (item.sets < 1 || item.sets > 6) {
        warnings.push(`Day ${day.dayNumber}: Exercise "${ex.name}" has unusual set volume (${item.sets} sets).`);
      }

      // 5. Categorize volume (push vs pull vs leg vs core)
      const pattern = ex.movementPattern;
      const isPush = (pattern && PUSH_PATTERNS.has(pattern)) || ex.primaryMuscles.some((m) => PUSH_MUSCLES.includes(m));
      const isPull = (pattern && PULL_PATTERNS.has(pattern)) || ex.primaryMuscles.some((m) => PULL_MUSCLES.includes(m));
      const isLeg = (pattern && LEG_PATTERNS.has(pattern)) || ex.primaryMuscles.some((m) => LEG_MUSCLES.includes(m));
      const isCore = (pattern && CORE_PATTERNS.has(pattern)) || ex.primaryMuscles.some((m) => CORE_MUSCLES.includes(m));

      if (isPush) pushSets += item.sets;
      if (isPull) pullSets += item.sets;
      if (isLeg) legSets += item.sets;
      if (isCore) coreSets += item.sets;
    });

    // 6. Day duration deviation check
    const diff = Math.abs(day.estimatedDuration - profile.duration);
    const percentDiff = (diff / profile.duration) * 100;
    if (percentDiff > 20) {
      warnings.push(
        `Day ${day.dayNumber} estimated duration (~${day.estimatedDuration}m) deviates by ${Math.round(percentDiff)}% from target ${profile.duration}m.`
      );
    }
  });

  const avgDailyDuration = Math.round(totalEstimatedDuration / program.days.length);
  const equipmentCompliancePercent = totalExercises > 0 ? Math.round((equipmentCompliantCount / totalExercises) * 100) : 100;
  const injurySafetyPercent = totalExercises > 0 ? Math.round((injurySafeCount / totalExercises) * 100) : 100;
  const pushPullRatio = pullSets > 0 ? Number((pullSets / Math.max(1, pushSets)).toFixed(2)) : 1;

  // Biomechanical balance check: Pulling sets should equal or exceed pushing sets for postural health
  if (pushSets > pullSets && (pushSets - pullSets) > 4) {
    warnings.push(
      `Biomechanical posture warning: Pushing volume (${pushSets} sets) exceeds pulling volume (${pullSets} sets). Recommend adding horizontal pulling volume.`
    );
  }

  // Calculate overall program quality score (0 - 100)
  let score = 100;
  score -= errors.length * 25; // Critical failures
  score -= warnings.length * 5; // Minor adjustments
  if (equipmentCompliancePercent < 100) score -= (100 - equipmentCompliancePercent);
  if (injurySafetyPercent < 100) score -= (100 - injurySafetyPercent);
  score = Math.max(0, Math.min(100, score));

  return {
    isValid: errors.length === 0,
    score,
    errors,
    warnings,
    metrics: {
      totalExercises,
      totalSets,
      pushSets,
      pullSets,
      pushPullRatio,
      legSets,
      coreSets,
      avgDailyDuration,
      targetDuration: profile.duration,
      equipmentCompliancePercent,
      injurySafetyPercent,
    },
  };
}
