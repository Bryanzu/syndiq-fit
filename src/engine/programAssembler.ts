import { Exercise, WorkoutDay, WorkoutExerciseItem, WorkoutProgram, MovementPattern, MuscleGroup } from '@/types/workout';
import { UserProfile } from '@/types/questionnaire';
import { exercises } from '@/data/exercises';
import { TEMPLATES_BY_FREQUENCY, TemplateSlot } from '@/data/templates';
import { enhanceExercise } from './patternClassifier';
import { isExerciseAvailable, isBodyweightOnlyEquipment, normalizeEquipmentSet } from './equipmentFilter';
import { isContraindicated, getInjurySubstitutionReason, findSafeAlternative } from './injuryRules';
import {
  getTargetExerciseCount,
  resolveTrainingFrequency,
  adaptExerciseVolume,
  calculateWorkoutDuration,
} from './volumeRules';
import { validateWorkoutProgram } from './workoutValidator';
import { LOWER_BODY_MUSCLES, gluteKneeRank, gluteSlotScore, usesGluteFocus, withGluteSlot } from './gluteFocus';

const enhancedExercises: Exercise[] = exercises.map(enhanceExercise);
const enhancedById = new Map(enhancedExercises.map((e) => [e.id, e]));

function getEnhancedExercise(id: string): Exercise | undefined {
  return enhancedById.get(id);
}

// Exercises with high axial compressive loading on the spine to avoid for lifters aged 51+
const AXIAL_SPINAL_LOAD_IDS = new Set([
  'barbell-back-squat',
  'conventional-deadlift',
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

  const gluteFocus = usesGluteFocus(profile);
  const isDisliked = (ex: Exercise) => Boolean(profile.dislikedExercises?.includes(ex.id));
  const isSenior = profile.age === '51-60' || profile.age === '61+';

  const prefersLoaded = !isBodyweightOnlyEquipment(profile.availableEquipment);
  // Normalised so legacy/composite IDs (e.g. 'leg_press_hack_squat') count as the machines they provide
  const ownedEquipment = [...normalizeEquipmentSet(profile.availableEquipment)];
  const ownsMachines = ownedEquipment.some((id) => id.includes('machine') && id !== 'rowing_machine');
  const ownsKettlebells = ownedEquipment.some((id) => id.startsWith('kettlebell'));
  // 0 = loaded movement on gear the user actually has, 1 = floor-only bodyweight, 2 = improvised substitute
  const equipmentFitRank = (ex: Exercise): number => {
    if (ex.equipment === 'machine' && !ownsMachines) return 2;
    if (ex.equipment === 'kettlebell' && !ownsKettlebells) return 2;
    return ex.isStrictBodyweight ? 1 : 0;
  };

  // How many times each exercise has been used on earlier days. Used as a ranking tie-breaker
  // so repeated slots across the week (e.g. Push A / Push B) rotate through different movements.
  const weeklyUsage = new Map<string, number>();
  let gluteSlotsSoFar = 0;

  // 2. Assemble each workout day
  const days: WorkoutDay[] = template.days.map((dayTemplate, dayIndex) => {
    const selectedExerciseIds = new Set<string>();
    const dayExercises: WorkoutExerciseItem[] = [];

    let activeSlots: TemplateSlot[] = [...dayTemplate.slots];

    // Female programs (unless the goal is upper-body size) give every lower-body day a glute-led
    // exercise. The first one of the week is a main lift (hip thrust); later ones rotate
    // through bridges, pull-throughs and swings. Upper-body days are left alone.
    const dayTrainsLowerBody = dayTemplate.focusMuscles.some((m) => LOWER_BODY_MUSCLES.includes(m));
    if (gluteFocus && dayTrainsLowerBody) {
      const mainLift = gluteSlotsSoFar === 0 && profile.experience !== 'complete_beginner';
      activeSlots = withGluteSlot(activeSlots, mainLift ? 1 : 2);
      gluteSlotsSoFar++;
    }

    // Filter slots based on requested workout duration
    if (activeSlots.length > targetExerciseCount) {
      const essential = activeSlots.filter((s) => s.isEssential);
      const optional = activeSlots.filter((s) => !s.isEssential);
      activeSlots = [...essential, ...optional].slice(0, targetExerciseCount);
    } else if (activeSlots.length < targetExerciseCount) {
      // Long sessions (90–120 min) ask for more exercises than the template has slots.
      // Fill the gap with extra accessory work drawn from the day's own slots (accessories first).
      const optional = activeSlots.filter((s) => !s.isEssential);
      const essential = activeSlots.filter((s) => s.isEssential);
      const extraSource = [...optional, ...essential];
      for (let i = 0; activeSlots.length < targetExerciseCount && extraSource.length > 0; i++) {
        const base = extraSource[i % extraSource.length];
        activeSlots.push({ ...base, isEssential: false, tierPreference: base.tierPreference === 1 ? 2 : base.tierPreference });
      }
    }

    // 3. Select exercises for each slot
    for (const slot of activeSlots) {
      let chosenExercise: Exercise | undefined;
      let isSubstituted = false;
      let substitutionReason: string | undefined;

      // Why a safety-net pick was needed: an injury, if it ruled out a movement the user has the gear for
      const fallbackReason = (): string => {
        const blocked = enhancedExercises.find(
          (ex) =>
            ex.movementPattern === slot.pattern &&
            isExerciseAvailable(ex, profile.availableEquipment) &&
            isContraindicated(ex, profile.injuries)
        );
        return blocked ? getInjurySubstitutionReason(blocked, profile.injuries) : 'Swapped to fit your equipment';
      };

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
          // Glute focus: the glute slot goes to a glute-led movement, the second knee slot to a lunge
          if (gluteFocus) {
            const aGlute = gluteSlotScore(a, slot);
            const bGlute = gluteSlotScore(b, slot);
            if (aGlute !== bGlute) return bGlute - aGlute;
          }

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

          // With equipment available, prefer loaded movements over floor-only bodyweight ones
          // for strength slots (core and conditioning are fine either way).
          // Machine / kettlebell movements that are only possible by improvising with other gear
          // (e.g. a "machine" calf raise done with dumbbells) rank last.
          if (prefersLoaded && slot.pattern !== 'core' && slot.pattern !== 'conditioning') {
            const aRank = equipmentFitRank(a);
            const bRank = equipmentFitRank(b);
            if (aRank !== bRank) return aRank - bRank;
          }

          // Weekly variety: prefer movements not yet used on earlier days
          const aUsed = weeklyUsage.get(a.id) || 0;
          const bUsed = weeklyUsage.get(b.id) || 0;
          if (aUsed !== bUsed) return aUsed - bUsed;

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

          // Glute focus: split squats before lunges (easier lunges first for new lifters)
          if (gluteFocus && slot.pattern === 'quad_dominant') {
            const rank = gluteKneeRank(a, profile.experience) - gluteKneeRank(b, profile.experience);
            if (rank !== 0) return rank;
          }

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
            if (safeAlt && !selectedExerciseIds.has(safeAlt.id) && !isDisliked(safeAlt)) {
              chosenExercise = safeAlt;
              isSubstituted = true;
              substitutionReason = 'Swapped to go easier on your spine';
            }
          } else {
            const safeAlt = findSafeAlternative(
              theoreticalIdeal,
              profile.injuries,
              profile.availableEquipment,
              getEnhancedExercise
            );

            if (safeAlt && !selectedExerciseIds.has(safeAlt.id) && !isDisliked(safeAlt)) {
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
            !isDisliked(ex) &&
            (!isSenior || !AXIAL_SPINAL_LOAD_IDS.has(ex.id))
        );
        if (fallback) {
          chosenExercise = fallback;
          isSubstituted = true;
          substitutionReason = fallbackReason();
        }
      }

      // 3d. Broader safety net: any safe exercise matching day's focus muscles or core
      if (!chosenExercise) {
        const fallbackAny = enhancedExercises.find(
          (ex) =>
            !selectedExerciseIds.has(ex.id) &&
            (ex.primaryMuscles.some((m) => dayTemplate.focusMuscles.includes(m)) || ex.movementPattern === 'core' || ex.movementPattern === 'conditioning') &&
            !isContraindicated(ex, profile.injuries) &&
            isExerciseAvailable(ex, profile.availableEquipment) &&
            !isDisliked(ex) &&
            (!isSenior || !AXIAL_SPINAL_LOAD_IDS.has(ex.id))
        );
        if (fallbackAny) {
          chosenExercise = fallbackAny;
          isSubstituted = true;
          substitutionReason = fallbackReason();
        }
      }

      // 4. Assign volume and push to day list
      if (chosenExercise) {
        selectedExerciseIds.add(chosenExercise.id);
        weeklyUsage.set(chosenExercise.id, (weeklyUsage.get(chosenExercise.id) || 0) + 1);
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

    // If estimated duration is under target by > 12%, add sets one round at a time
    // (compounds first, since they lead the day) until the session fills the requested time.
    if (estimatedDuration < profile.duration * 0.88 && dayExercises.length > 0) {
      const setCap = (item: WorkoutExerciseItem): number => {
        if (profile.experience === 'complete_beginner') return 3;
        if (isSenior) return 4;
        return (item.exercise.tier || 3) <= 2 ? 5 : 4;
      };
      let added = true;
      while (added && estimatedDuration < profile.duration * 0.95) {
        added = false;
        for (const item of dayExercises) {
          if (item.sets < setCap(item)) {
            item.sets += 1;
            added = true;
            estimatedDuration = calculateWorkoutDuration(dayExercises);
            if (estimatedDuration >= profile.duration * 0.95) break;
          }
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
      ? ` Also working on: ${profile.secondaryGoals.map(getGoalLabel).join(', ').toLowerCase()}.`
      : '';

  const program: WorkoutProgram = {
    id: `syndiq-${Date.now()}`,
    name: `${getGoalLabel(profile.goal)} · ${frequency} days a week`,
    description: `${profile.duration}-minute sessions.${secondaryDesc}`,
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
  if ((goal === 'build_strength' || goal === 'overall_strength') && exercise.tier === 1) return true;
  if ((goal === 'muscle_building' || goal === 'beginner_strength') && (exercise.tier === 1 || exercise.tier === 2)) return true;
  if (
    goal === 'athletic_performance' &&
    (exercise.tier === 1 || exercise.movementPattern === 'conditioning' || exercise.movementPattern === 'carry')
  )
    return true;
  // Fat loss and endurance keep the main lifts: heavy work holds on to muscle. Their reps and
  // rest change in volumeRules; only conditioning moves get a ranking boost here.
  if ((goal === 'fat_loss' || goal === 'endurance') && exercise.movementPattern === 'conditioning') return true;
  return false;
}

function getGoalLabel(goal: string): string {
  const map: Record<string, string> = {
    fat_loss: 'Lose fat',
    muscle_building: 'Build muscle',
    lean_toned: 'Lean and toned',
    general_fitness: 'General fitness',
    build_strength: 'Max strength',
    overall_strength: 'All-round strength',
    beginner_strength: 'Starter strength',
    chest_emphasis: 'Bigger chest',
    back_emphasis: 'Wider back',
    shoulder_emphasis: 'Broader shoulders',
    arm_emphasis: 'Bigger arms',
    leg_emphasis: 'Stronger legs',
    glute_emphasis: 'Glutes',
    core_emphasis: 'Core',
    endurance: 'Endurance',
    maintain_fitness: 'Stay in shape',
    athletic_performance: 'Athletic',
  };
  return map[goal] || 'Your program';
}
