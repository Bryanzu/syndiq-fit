import { Exercise, WorkoutDay, WorkoutExerciseItem, WorkoutProgram, MovementPattern, MuscleGroup } from '@/types/workout';
import { UserProfile } from '@/types/questionnaire';
import { exercises } from '@/data/exercises';
import { TEMPLATES_BY_FREQUENCY, TemplateSlot } from '@/data/templates';
import { enhanceExercise } from './patternClassifier';
import { isExerciseAvailable } from './equipmentFilter';
import { isContraindicated, getInjurySubstitutionReason, findSafeAlternative } from './injuryRules';
import {
  getTargetExerciseCount,
  resolveTrainingFrequency,
  adaptExerciseVolume,
  calculateWorkoutDuration,
} from './volumeRules';
import { validateWorkoutProgram } from './workoutValidator';

const enhancedExercises: Exercise[] = exercises.map(enhanceExercise);
const enhancedById = new Map(enhancedExercises.map((e) => [e.id, e]));

function getEnhancedExercise(id: string): Exercise | undefined {
  return enhancedById.get(id);
}

// Exercises with high axial compressive loading on the spine to avoid for lifters aged 51+
const AXIAL_SPINAL_LOAD_IDS = new Set([
  'barbell-back-squat',
  'barbell-deadlift',
  'barbell-overhead-press',
  'good-morning',
]);

/**
 * Generates an individualized, rule-driven workout program tailored to Syndiq Fit's verified
 * equipment, user biomechanics, injury profile, sex/gender, age, duration, and goals.
 */
export function generateWorkoutProgram(profile: UserProfile): WorkoutProgram {
  // 1. Determine workout structure (Split frequency)
  const frequency = resolveTrainingFrequency(profile.frequency, profile.experience, profile.goal, profile.age);
  const template = TEMPLATES_BY_FREQUENCY[frequency] || TEMPLATES_BY_FREQUENCY[3];
  const targetExerciseCount = getTargetExerciseCount(profile.duration);

  const isFemale = profile.gender === 'female';
  const isSenior = profile.age === '51-60' || profile.age === '61+';

  // 2. Assemble each workout day
  const days: WorkoutDay[] = template.days.map((dayTemplate, dayIndex) => {
    const selectedExerciseIds = new Set<string>();
    const dayExercises: WorkoutExerciseItem[] = [];

    // Calibrate slots based on Gender and Goal
    let activeSlots: TemplateSlot[] = [...dayTemplate.slots];

    // For female users: adjust high-frequency push isolations towards posterior chain / glutes
    // unless user explicitly selected upper-body focus goals
    if (isFemale && profile.goal !== 'chest_emphasis' && profile.goal !== 'arm_emphasis') {
      let replacedOne = false;
      activeSlots = activeSlots.map((slot) => {
        if (!replacedOne && (slot.pattern === 'isolation_triceps' || slot.pattern === 'isolation_delts')) {
          replacedOne = true;
          return {
            pattern: 'hip_hinge',
            preferredMuscles: ['glutes', 'hamstrings'],
            isEssential: false,
            tierPreference: 2,
          };
        }
        return slot;
      });
    }

    // Filter slots based on requested workout duration
    if (activeSlots.length > targetExerciseCount) {
      const essential = activeSlots.filter((s) => s.isEssential);
      const optional = activeSlots.filter((s) => !s.isEssential);
      activeSlots = [...essential, ...optional].slice(0, targetExerciseCount);
    }

    // 3. Select exercises for each slot
    for (const slot of activeSlots) {
      let chosenExercise: Exercise | undefined;
      let isSubstituted = false;
      let substitutionReason: string | undefined;

      // 3a. Find direct safe & available candidates
      const candidates = enhancedExercises.filter((ex) => {
        if (selectedExerciseIds.has(ex.id)) return false;
        if (ex.movementPattern !== slot.pattern) return false;
        if (isContraindicated(ex, profile.injuries)) return false;
        if (!isExerciseAvailable(ex, profile.availableEquipment)) return false;
        if (profile.dislikedExercises && profile.dislikedExercises.includes(ex.id)) return false;

        // Age 51+ spinal loading filter: avoid direct axial spine compression
        if (isSenior && AXIAL_SPINAL_LOAD_IDS.has(ex.id)) {
          return false;
        }

        return true;
      });

      if (candidates.length > 0) {
        // Multi-factor deterministic ranking
        candidates.sort((a, b) => {
          // Goal priority match (Primary goal > Secondary goals > Neutral)
          const aGoalScore = getGoalPriorityScore(a, profile.goal, profile.secondaryGoals, profile.musclePreferences);
          const bGoalScore = getGoalPriorityScore(b, profile.goal, profile.secondaryGoals, profile.musclePreferences);
          if (aGoalScore !== bGoalScore) return bGoalScore - aGoalScore;

          // Tier preference
          if (slot.tierPreference) {
            const aDiff = Math.abs((a.tier || 2) - slot.tierPreference);
            const bDiff = Math.abs((b.tier || 2) - slot.tierPreference);
            if (aDiff !== bDiff) return aDiff - bDiff;
          }

          // Beginner safety: prefer machine or dumbbell over heavy barbell
          if (profile.experience === 'complete_beginner') {
            if (a.equipment === 'machine' && b.equipment === 'barbell') return -1;
            if (a.equipment === 'barbell' && b.equipment === 'machine') return 1;
            if (a.equipment === 'dumbbell' && b.equipment === 'barbell') return -1;
            if (a.equipment === 'barbell' && b.equipment === 'dumbbell') return 1;
          }

          // Advanced strength: prefer barbell compounds
          if (profile.experience === 'advanced' && (profile.goal === 'build_strength' || profile.goal === 'overall_strength')) {
            if (a.equipment === 'barbell' && b.equipment !== 'barbell') return -1;
            if (a.equipment !== 'barbell' && b.equipment === 'barbell') return 1;
          }

          // Slot preferred muscle overlap
          const aMuscleMatch = a.primaryMuscles.some((m) => slot.preferredMuscles.includes(m));
          const bMuscleMatch = b.primaryMuscles.some((m) => slot.preferredMuscles.includes(m));
          if (aMuscleMatch && !bMuscleMatch) return -1;
          if (!aMuscleMatch && bMuscleMatch) return 1;

          return 0;
        });

        chosenExercise = candidates[0];
      } else {
        // 3b. Fallback: find theoretical ideal and substitute safely
        const theoreticalIdeal = enhancedExercises.find(
          (ex) => ex.movementPattern === slot.pattern && !selectedExerciseIds.has(ex.id)
        );

        if (theoreticalIdeal) {
          // Check if theoretical ideal was skipped due to age spinal protection
          if (isSenior && AXIAL_SPINAL_LOAD_IDS.has(theoreticalIdeal.id)) {
            const safeAlt = findSafeAlternative(
              theoreticalIdeal,
              profile.injuries,
              profile.availableEquipment,
              getEnhancedExercise
            );
            if (safeAlt && !selectedExerciseIds.has(safeAlt.id)) {
              chosenExercise = safeAlt;
              isSubstituted = true;
              substitutionReason = 'Substituted for spinal decompression & joint longevity (50+)';
            }
          } else {
            const safeAlt = findSafeAlternative(
              theoreticalIdeal,
              profile.injuries,
              profile.availableEquipment,
              getEnhancedExercise
            );

            if (safeAlt && !selectedExerciseIds.has(safeAlt.id)) {
              chosenExercise = safeAlt;
              isSubstituted = true;
              substitutionReason = getInjurySubstitutionReason(theoreticalIdeal, profile.injuries);
            }
          }
        }
      }

      // 3c. Final safety net: any available muscle match
      if (!chosenExercise) {
        const fallback = enhancedExercises.find(
          (ex) =>
            !selectedExerciseIds.has(ex.id) &&
            ex.primaryMuscles.some((m) => slot.preferredMuscles.includes(m)) &&
            !isContraindicated(ex, profile.injuries) &&
            isExerciseAvailable(ex, profile.availableEquipment) &&
            (!isSenior || !AXIAL_SPINAL_LOAD_IDS.has(ex.id))
        );
        if (fallback) {
          chosenExercise = fallback;
          isSubstituted = true;
          substitutionReason = 'Adapted for available gym equipment';
        }
      }

      // 4. Assign volume and push to day list
      if (chosenExercise) {
        selectedExerciseIds.add(chosenExercise.id);
        const volume = adaptExerciseVolume(chosenExercise, profile);

        dayExercises.push({
          exercise: chosenExercise,
          sets: volume.sets,
          reps: volume.reps,
          restSeconds: volume.restSeconds,
          intensityNote: volume.intensityNote,
          isSubstituted,
          substitutionReason,
        });
      }
    }

    // 5. Dynamic time-budget calibration
    let estimatedDuration = calculateWorkoutDuration(dayExercises);

    // If estimated duration exceeds target by > 8%, scale down accessory sets
    if (estimatedDuration > profile.duration * 1.08 && dayExercises.length > 0) {
      for (let i = dayExercises.length - 1; i >= 0; i--) {
        if (dayExercises[i].sets > 2) {
          dayExercises[i].sets -= 1;
          estimatedDuration = calculateWorkoutDuration(dayExercises);
          if (estimatedDuration <= profile.duration * 1.05) break;
        }
      }
    }

    // If estimated duration is under target by > 12%, add 1 set to main compounds
    if (estimatedDuration < profile.duration * 0.88 && dayExercises.length > 0) {
      for (let i = 0; i < Math.min(3, dayExercises.length); i++) {
        if (dayExercises[i].sets < 4) {
          dayExercises[i].sets += 1;
          estimatedDuration = calculateWorkoutDuration(dayExercises);
          if (estimatedDuration >= profile.duration * 0.95) break;
        }
      }
    }

    return {
      dayNumber: dayIndex + 1,
      title: dayTemplate.title,
      focusMuscles: dayTemplate.focusMuscles,
      estimatedDuration,
      exercises: dayExercises,
    };
  });

  const secondaryDesc =
    profile.secondaryGoals && profile.secondaryGoals.length > 0
      ? ` Complementary priorities: ${profile.secondaryGoals.map(getGoalLabel).join(', ')}.`
      : '';

  const program: WorkoutProgram = {
    id: `syndiq-${Date.now()}`,
    name: `${getGoalLabel(profile.goal)} — ${frequency}-Day Program`,
    description: `Customized for a ${profile.gender === 'male' ? 'male' : 'female'} lifter (${profile.age} yrs), focusing on ${getGoalLabel(profile.goal)} with ~${profile.duration}-minute sessions.${secondaryDesc}`,
    userProfile: profile,
    days,
    createdAt: new Date().toISOString(),
  };

  // 6. Validate the assembled program
  const validationResult = validateWorkoutProgram(program);
  if (!validationResult.isValid) {
    console.warn('Syndiq fit Program Validation Issues:', validationResult.errors);
  }

  return program;
}

function getGoalPriorityScore(
  exercise: Exercise,
  primaryGoal: string,
  secondaryGoals?: string[],
  userPreferences?: MuscleGroup[]
): number {
  if (userPreferences && userPreferences.length > 0) {
    if (exercise.primaryMuscles.some((m) => userPreferences.includes(m))) {
      return 3;
    }
  }

  if (matchesGoal(exercise, primaryGoal)) {
    return 2;
  }

  if (secondaryGoals && secondaryGoals.some((sg) => matchesGoal(exercise, sg))) {
    return 1;
  }

  return 0;
}

function matchesGoal(exercise: Exercise, goal: string): boolean {
  if (goal === 'chest_emphasis' && exercise.primaryMuscles.includes('chest')) return true;
  if (goal === 'back_emphasis' && (exercise.primaryMuscles.includes('lats') || exercise.primaryMuscles.includes('upper_back'))) return true;
  if (goal === 'shoulder_emphasis' && (exercise.primaryMuscles.includes('front_delts') || exercise.primaryMuscles.includes('side_delts'))) return true;
  if (goal === 'arm_emphasis' && (exercise.primaryMuscles.includes('biceps') || exercise.primaryMuscles.includes('triceps'))) return true;
  if (goal === 'leg_emphasis' && (exercise.primaryMuscles.includes('quads') || exercise.primaryMuscles.includes('hamstrings'))) return true;
  if (goal === 'glute_emphasis' && (exercise.primaryMuscles.includes('glutes') || exercise.primaryMuscles.includes('hamstrings'))) return true;
  if (goal === 'core_emphasis' && (exercise.primaryMuscles.includes('abs') || exercise.primaryMuscles.includes('obliques'))) return true;
  if (goal === 'lean_toned' && (exercise.primaryMuscles.includes('glutes') || exercise.primaryMuscles.includes('abs'))) return true;
  if (goal === 'build_strength' && exercise.tier === 1) return true;
  if (goal === 'fat_loss' && (exercise.movementPattern === 'conditioning' || exercise.tier === 3)) return true;
  if (goal === 'endurance' && (exercise.movementPattern === 'conditioning' || exercise.tier === 3)) return true;
  return false;
}

function getGoalLabel(goal: string): string {
  const map: Record<string, string> = {
    fat_loss: 'Fat Loss & Conditioning',
    muscle_building: 'Hypertrophy & Muscle Building',
    lean_toned: 'Lean & Toned Physique',
    general_fitness: 'Total Body Fitness',
    build_strength: 'Maximal Strength',
    overall_strength: 'Functional Strength',
    beginner_strength: 'Foundational Strength',
    chest_emphasis: 'Chest Development',
    back_emphasis: 'Back & V-Taper Development',
    shoulder_emphasis: 'Shoulder & Deltoid Development',
    arm_emphasis: 'Arm Hypertrophy',
    leg_emphasis: 'Quad & Leg Builder',
    glute_emphasis: 'Glute & Posterior Development',
    core_emphasis: 'Core Stability & Midsection',
    endurance: 'Muscular Endurance',
    maintain_fitness: 'Fitness Maintenance',
    athletic_performance: 'Athletic Conditioning',
  };
  return map[goal] || 'Custom Training Program';
}
