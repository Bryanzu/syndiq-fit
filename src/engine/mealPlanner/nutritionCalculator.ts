import { MealPlanProfile } from '@/types/mealPlanner';

export interface CalculatedNutritionTargets {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinGrams: number;
  proteinPerKg: number;
}

/**
 * Calculates scientifically grounded daily energy & protein targets.
 * Based on the Mifflin-St Jeor formula and ISSN protein positioning.
 */
export function calculateNutritionTargets(
  gender: 'male' | 'female',
  age: number,
  weightKg: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active',
  goal: 'fat_loss' | 'muscle_building' | 'maintain' | 'strength'
): CalculatedNutritionTargets {
  // Estimated height standard: 175cm for males, 163cm for females if not specified
  const heightCm = gender === 'male' ? 175 : 163;

  // Mifflin-St Jeor BMR
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // Activity multipliers
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
  };
  const multiplier = activityMultipliers[activityLevel] || 1.375;
  const tdee = Math.round(bmr * multiplier);

  // Target calories based on primary fitness goal
  let targetCalories = tdee;
  if (goal === 'fat_loss') {
    targetCalories = Math.max(1300, Math.round(tdee - 450)); // Sustainable caloric deficit
  } else if (goal === 'muscle_building') {
    targetCalories = Math.round(tdee + 350); // Clean lean mass surplus
  } else if (goal === 'strength') {
    targetCalories = Math.round(tdee + 200); // Mild surplus for neurological force production
  } else {
    targetCalories = tdee; // Maintenance
  }

  // Protein targets (g per kg of body weight)
  let proteinPerKg = 1.6;
  if (goal === 'muscle_building' || goal === 'strength') {
    proteinPerKg = 2.0; // 2.0g/kg optimal hypertrophy synthesis
  } else if (goal === 'fat_loss') {
    proteinPerKg = 1.9; // Higher protein in deficit spares lean muscle tissue
  } else {
    proteinPerKg = 1.5;
  }

  const targetProteinGrams = Math.round(weightKg * proteinPerKg);

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    targetProteinGrams,
    proteinPerKg,
  };
}
