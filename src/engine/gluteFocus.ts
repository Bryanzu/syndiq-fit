import { Exercise, MuscleGroup } from '@/types/workout';
import { ExperienceLevel, FitnessGoal, Gender, UserProfile } from '@/types/questionnaire';
import type { TemplateSlot } from '@/data/templates';

/**
 * Glute focus: how a female program, and the female body map, lean towards the glutes.
 *
 * - Every lower-body day gets one slot led by the glutes (hip thrust, bridge, pull-through...).
 * - Second knee-dominant slots prefer lunges, split squats and step-ups over squats and leg presses.
 * - Upper-body days are left as they are.
 */

export const LOWER_BODY_MUSCLES: MuscleGroup[] = ['quads', 'hamstrings', 'glutes', 'calves'];

/** Goals that ask for upper-body size. Glute focus does not take slots away from them. */
const UPPER_BODY_GOALS: FitnessGoal[] = ['chest_emphasis', 'back_emphasis', 'shoulder_emphasis', 'arm_emphasis'];

/**
 * Knee-dominant movements that also load the glutes hard, best first. Each has a dumbbell
 * version and a `bodyweight-` version. New lifters start with the easier lunges and step-ups.
 */
const KNEE_ORDER = ['bulgarian-split-squat', 'reverse-lunge', 'walking-lunge', 'step-up'];
const KNEE_ORDER_NEW_LIFTER = ['reverse-lunge', 'step-up', 'walking-lunge', 'bulgarian-split-squat'];

const kneeBase = (id: string) => id.replace(/^bodyweight-/, '');
const isGluteBiasedKnee = (exercise: Exercise) => KNEE_ORDER.includes(kneeBase(exercise.id));

/** Where a lunge-type movement sits in the preferred order (lower first). Anything else ranks last. */
export function gluteKneeRank(exercise: Exercise, experience?: ExperienceLevel): number {
  const order = experience === 'complete_beginner' || experience === 'beginner' ? KNEE_ORDER_NEW_LIFTER : KNEE_ORDER;
  const index = order.indexOf(kneeBase(exercise.id));
  return index === -1 ? order.length : index;
}

export function usesGluteFocus(profile: Pick<UserProfile, 'gender' | 'goal'>): boolean {
  return profile.gender === 'female' && !UPPER_BODY_GOALS.includes(profile.goal);
}

/** The glutes are the main muscle: hip thrusts, bridges, kickbacks, abductions. */
export const isGluteLed = (exercise: Exercise): boolean => exercise.primaryMuscles[0] === 'glutes';

const isGluteSlot = (slot: TemplateSlot): boolean => slot.pattern === 'hip_hinge' && slot.preferredMuscles[0] === 'glutes';

const gluteSlot = (tierPreference: 1 | 2): TemplateSlot => ({
  pattern: 'hip_hinge',
  preferredMuscles: ['glutes'],
  isEssential: true,
  tierPreference,
});

/**
 * Makes sure a lower-body day has one glute-led slot. In order of preference it:
 * 1. takes over a hinge slot that already leads with the glutes,
 * 2. replaces the first shoulder or triceps isolation,
 * 3. replaces a calf raise,
 * 4. or adds a slot after the day's main lifts.
 */
export function withGluteSlot(slots: TemplateSlot[], tierPreference: 1 | 2): TemplateSlot[] {
  const replaceAt = (index: number) => slots.map((s, i) => (i === index ? gluteSlot(tierPreference) : s));

  const existing = slots.findIndex(isGluteSlot);
  if (existing >= 0) return replaceAt(existing);

  const upperIsolation = slots.findIndex((s) => s.pattern === 'isolation_triceps' || s.pattern === 'isolation_delts');
  if (upperIsolation >= 0) return replaceAt(upperIsolation);

  const calves = slots.findIndex((s) => s.pattern === 'isolation_legs' && s.preferredMuscles[0] === 'calves');
  if (calves >= 0) return replaceAt(calves);

  let afterMainLifts = 0;
  slots.forEach((s, i) => {
    if (s.isEssential) afterMainLifts = i + 1;
  });
  return [...slots.slice(0, afterMainLifts), gluteSlot(tierPreference), ...slots.slice(afterMainLifts)];
}

/** Ranking bonus inside a slot for a glute focus program. Higher ranks first. */
export function gluteSlotScore(exercise: Exercise, slot: TemplateSlot): number {
  if (isGluteSlot(slot)) {
    if (isGluteLed(exercise)) return 2;
    return exercise.primaryMuscles.includes('glutes') ? 1 : 0;
  }
  // Leave the day's main squat alone; lean the second knee-dominant slot towards the glutes
  if (slot.pattern === 'quad_dominant' && slot.tierPreference !== 1) {
    return isGluteBiasedKnee(exercise) ? 1 : 0;
  }
  return 0;
}

/**
 * Orders a muscle's exercises for the body map. The male list keeps the library order.
 * The female list puts glute-led movements first, then split squats and lunges, then anything
 * else that works the glutes. Cardio and mobility drills keep their place after those.
 */
export function orderForBuild(list: Exercise[], build: Gender): Exercise[] {
  if (build !== 'female') return list;
  const score = (ex: Exercise): number => {
    if (ex.exerciseType === 'mobility' || ex.movementPattern === 'conditioning') return 0;
    if (isGluteLed(ex)) return 3;
    if (isGluteBiasedKnee(ex)) return 2;
    return ex.primaryMuscles.includes('glutes') ? 1 : 0;
  };
  return list
    .map((ex, index) => ({ ex, index, score: score(ex) }))
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      if (a.score === 2) {
        const rank = gluteKneeRank(a.ex) - gluteKneeRank(b.ex);
        if (rank !== 0) return rank;
      }
      // Heavier movements lead within each glute group
      if (a.score > 0 && (a.ex.tier || 2) !== (b.ex.tier || 2)) return (a.ex.tier || 2) - (b.ex.tier || 2);
      return a.index - b.index;
    })
    .map((x) => x.ex);
}
