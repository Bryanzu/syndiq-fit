import { AgeCategory, FitnessGoal, UserProfile } from '@/types/questionnaire';
import { MealPlanProfile } from '@/types/mealPlanner';
import { SyndiqEquipmentId } from '@/types/equipment';
import {
  ALL_SYNDIQ_EQUIPMENT_IDS,
  BODYWEIGHT_ONLY_IDS,
  HOME_GYM_DUMBBELLS_IDS,
  STANDARD_COMMERCIAL_GYM_IDS,
} from '@/data/equipment';

export const AGE_MIN = 16;
export const AGE_MAX = 90;

export function bracketForAge(years: number): AgeCategory {
  if (years <= 20) return '<=20';
  if (years <= 30) return '21-30';
  if (years <= 40) return '31-40';
  if (years <= 50) return '41-50';
  if (years <= 60) return '51-60';
  return '61+';
}

/** A typical age inside each bracket, for profiles saved before the exact age was asked */
const BRACKET_MIDPOINT: Record<AgeCategory, number> = {
  '<=20': 19,
  '21-30': 26,
  '31-40': 35,
  '41-50': 45,
  '51-60': 55,
  '61+': 65,
};

export function yearsFromProfile(profile: Pick<UserProfile, 'age' | 'ageYears'>): number {
  if (profile.ageYears && profile.ageYears >= AGE_MIN && profile.ageYears <= AGE_MAX) return profile.ageYears;
  return BRACKET_MIDPOINT[profile.age] ?? 26;
}

export type MealGoal = MealPlanProfile['goal'];
export type ActivityLevel = MealPlanProfile['activityLevel'];

/** The meal planner has four goals; map the workout goal onto the closest one */
export function mealGoalFor(goal: FitnessGoal): MealGoal {
  if (goal === 'fat_loss' || goal === 'lean_toned') return 'fat_loss';
  if (goal === 'build_strength' || goal === 'overall_strength' || goal === 'beginner_strength' || goal === 'athletic_performance') {
    return 'strength';
  }
  if (goal === 'general_fitness' || goal === 'maintain_fitness' || goal === 'endurance') return 'maintain';
  return 'muscle_building';
}

/** A first guess at weekly activity from the number of training days */
export function activityForDays(days: number): ActivityLevel {
  if (days <= 2) return 'light';
  if (days <= 4) return 'moderate';
  return 'very_active';
}

export type SetupId = 'gym' | 'home' | 'body' | 'all';

export const SETUPS: { id: SetupId; label: string; sub: string; ids: SyndiqEquipmentId[] }[] = [
  { id: 'gym', label: 'Full gym', sub: 'Machines, cables, free weights', ids: STANDARD_COMMERCIAL_GYM_IDS },
  { id: 'home', label: 'Home gym', sub: 'Dumbbells and a bench', ids: HOME_GYM_DUMBBELLS_IDS },
  { id: 'body', label: 'Bodyweight', sub: 'No kit needed', ids: BODYWEIGHT_ONLY_IDS },
  { id: 'all', label: 'Everything', sub: 'Every item we cover', ids: ALL_SYNDIQ_EQUIPMENT_IDS },
];

/** Which setup a list of equipment matches exactly, or null when it has been fine-tuned */
export function setupFor(equipment: SyndiqEquipmentId[]): SetupId | null {
  const have = new Set(equipment);
  const match = SETUPS.find((s) => s.ids.length === have.size && s.ids.every((id) => have.has(id)));
  return match ? match.id : null;
}

/** "knee", "knee and hip", "knee, hip and wrist" */
export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];
export const numberWord = (n: number) => NUMBER_WORDS[n] ?? String(n);
