import {
  MealPlanProfile,
  UserInventoryItem,
  WeeklyMealPlan,
  DayMealPlan,
  PlannedMeal,
  MealType,
  NigerianRecipe,
  ProteinShortfallReport,
} from '@/types/mealPlanner';
import { NIGERIAN_RECIPES, getRecipesByMealType, getRecipeById } from '@/data/nigerianRecipes';
import { getFoodById, getAffordableHighProteinFoods } from '@/data/nigerianFoods';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Deterministic and personalized 7-Day Nigerian Meal Plan Generator
 */
export function generateWeeklyMealPlan(
  profile: MealPlanProfile,
  inventory: UserInventoryItem[] = []
): WeeklyMealPlan {
  // Map of excluded food IDs (allergies / dislikes)
  const excludedFoodIds = new Set(
    inventory.filter((item) => item.status === 'excluded').map((item) => item.foodId)
  );

  // Map of in-stock food IDs
  const inStockFoodIds = new Set(
    inventory.filter((item) => item.status === 'in_stock').map((item) => item.foodId)
  );

  // Filter allowed recipes that do not contain any excluded foods
  const isRecipeAllowed = (recipe: NigerianRecipe): boolean => {
    return !recipe.ingredients.some((ing) => excludedFoodIds.has(ing.foodId));
  };

  const allowedRecipes = NIGERIAN_RECIPES.filter(isRecipeAllowed);

  // Score recipe fit for this user profile and inventory
  const scoreRecipe = (recipe: NigerianRecipe): number => {
    let score = 10;

    // In-stock bonus: reward recipes that use pantry items
    const inStockCount = recipe.ingredients.filter((ing) => inStockFoodIds.has(ing.foodId)).length;
    score += inStockCount * 4;

    // Budget optimization
    if (profile.budgetLevel === 'budget') {
      if (recipe.tags.includes('budget_friendly') || recipe.tags.includes('affordable')) {
        score += 8;
      }
    }

    // Goal alignment
    if (profile.goal === 'fat_loss') {
      // Reward high protein to calorie efficiency
      const proteinPer100Kcal = (recipe.protein / Math.max(recipe.calories, 100)) * 100;
      score += proteinPer100Kcal * 2;
      if (recipe.tags.includes('fat_loss') || recipe.tags.includes('lean_physique')) {
        score += 6;
      }
    } else if (profile.goal === 'muscle_building' || profile.goal === 'strength') {
      if (recipe.protein >= 30) score += 8;
      if (recipe.tags.includes('muscle_building') || recipe.tags.includes('ultra_high_protein')) {
        score += 6;
      }
    }

    return score;
  };

  // Build recipe pools by meal type
  const getPoolForType = (mealType: MealType): NigerianRecipe[] => {
    const list = allowedRecipes.filter((r) => r.mealTypes.includes(mealType));
    // Fall back to all recipes for that type if all were excluded to prevent empty schedule
    if (list.length === 0) {
      return getRecipesByMealType(mealType);
    }
    return list.sort((a, b) => scoreRecipe(b) - scoreRecipe(a));
  };

  const breakfastPool = getPoolForType('breakfast');
  const lunchPool = getPoolForType('lunch');
  const dinnerPool = getPoolForType('dinner');
  const snackPool = getPoolForType('snack');

  // Track recent recipes to enforce variety across days
  const recentRecipes: Record<MealType, string[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };

  const selectRecipeWithVariety = (pool: NigerianRecipe[], mealType: MealType, dayIdx: number): NigerianRecipe => {
    const recentlyUsed = recentRecipes[mealType];
    // Find highest scoring recipe not used in the last 2 days of this meal type
    const candidate = pool.find((r) => !recentlyUsed.slice(-2).includes(r.id)) ||
      pool[(dayIdx) % pool.length];

    recentRecipes[mealType].push(candidate.id);
    return candidate;
  };

  // Convert recipe into a PlannedMeal with portion scaling
  const buildPlannedMeal = (recipe: NigerianRecipe, mealType: MealType, multiplier: number = 1.0): PlannedMeal => {
    return {
      id: `${mealType}-${recipe.id}-${Math.random().toString(36).substring(2, 7)}`,
      recipeId: recipe.id,
      recipeName: recipe.name,
      localTitle: recipe.localTitle,
      mealType,
      portionMultiplier: multiplier,
      calories: Math.round(recipe.calories * multiplier),
      protein: Math.round(recipe.protein * multiplier * 10) / 10,
      carbs: Math.round(recipe.carbs * multiplier * 10) / 10,
      fat: Math.round(recipe.fat * multiplier * 10) / 10,
      ingredients: recipe.ingredients.map((ing) => ({
        ...ing,
        amount: Math.round(ing.amount * multiplier * 10) / 10,
        calories: Math.round(ing.calories * multiplier),
        protein: Math.round(ing.protein * multiplier * 10) / 10,
        carbs: Math.round(ing.carbs * multiplier * 10) / 10,
        fat: Math.round(ing.fat * multiplier * 10) / 10,
      })),
      instructions: recipe.instructions,
      isCompleted: false,
    };
  };

  // Generate 7 days
  const days: DayMealPlan[] = [];

  for (let i = 0; i < 7; i++) {
    const dayName = DAYS_OF_WEEK[i];
    const meals: PlannedMeal[] = [];

    // Breakfast
    const bRecipe = selectRecipeWithVariety(breakfastPool, 'breakfast', i);
    meals.push(buildPlannedMeal(bRecipe, 'breakfast'));

    // Lunch
    const lRecipe = selectRecipeWithVariety(lunchPool, 'lunch', i);
    meals.push(buildPlannedMeal(lRecipe, 'lunch'));

    // Dinner
    const dRecipe = selectRecipeWithVariety(dinnerPool, 'dinner', i);
    meals.push(buildPlannedMeal(dRecipe, 'dinner'));

    // Snack (if 4 meals per day)
    if (profile.mealsPerDay === 4) {
      const sRecipe = selectRecipeWithVariety(snackPool, 'snack', i);
      meals.push(buildPlannedMeal(sRecipe, 'snack'));
    }

    const dayCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const dayProtein = Math.round(meals.reduce((sum, m) => sum + m.protein, 0) * 10) / 10;
    const dayCarbs = Math.round(meals.reduce((sum, m) => sum + m.carbs, 0) * 10) / 10;
    const dayFat = Math.round(meals.reduce((sum, m) => sum + m.fat, 0) * 10) / 10;

    days.push({
      dayNumber: i + 1,
      dayName,
      meals,
      totalCalories: dayCalories,
      totalProtein: dayProtein,
      totalCarbs: dayCarbs,
      totalFat: dayFat,
    });
  }

  // Calculate averages across the 7 days
  const avgCalories = Math.round(days.reduce((sum, d) => sum + d.totalCalories, 0) / 7);
  const avgProtein = Math.round((days.reduce((sum, d) => sum + d.totalProtein, 0) / 7) * 10) / 10;

  // Honest Protein Shortfall Analysis: NEVER falsify numbers!
  let shortfallReport: ProteinShortfallReport | undefined = undefined;
  const shortfall = Math.round((profile.targetProteinGrams - avgProtein) * 10) / 10;

  if (shortfall > 8) {
    const suggestions: string[] = [
      'Add 2 boiled chicken eggs to breakfast (+13g pure protein at ~₦300–₦400).',
      'Stir 2 rounded tablespoons of ground crayfish into your soups and stew (+11g animal protein + calcium).',
      'Swap one snack for pan-seared Awara (soy curd) or 1 cup of plain Greek yogurt (+17g protein).',
      'Incorporate 1 extra piece of affordable Panla or Titus mackerel fish with dinner (+21g protein).',
      'Add 1 extra cup of cooked brown honey beans or 1 wrap of Moi Moi (+14g protein).',
    ];

    shortfallReport = {
      hasShortfall: true,
      targetProtein: profile.targetProteinGrams,
      actualAverageProtein: avgProtein,
      shortfallGrams: shortfall,
      explanation: `Based on your selected meals and food exclusions, your daily protein intake averages ${avgProtein}g against your optimal target of ${profile.targetProteinGrams}g (${shortfall}g daily deficit). Syndiq Fit reports true numbers to protect your progress.`,
      suggestions,
    };
  }

  return {
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    profile,
    days,
    averageDailyCalories: avgCalories,
    averageDailyProtein: avgProtein,
    proteinShortfallReport: shortfallReport,
  };
}

/**
 * Swaps a single planned meal with an alternative Nigerian recipe
 */
export function swapPlannedMeal(
  currentMeal: PlannedMeal,
  newRecipeId: string
): PlannedMeal {
  const newRecipe = getRecipeById(newRecipeId);
  if (!newRecipe) return currentMeal;

  const multiplier = currentMeal.portionMultiplier || 1.0;

  return {
    ...currentMeal,
    recipeId: newRecipe.id,
    recipeName: newRecipe.name,
    localTitle: newRecipe.localTitle,
    calories: Math.round(newRecipe.calories * multiplier),
    protein: Math.round(newRecipe.protein * multiplier * 10) / 10,
    carbs: Math.round(newRecipe.carbs * multiplier * 10) / 10,
    fat: Math.round(newRecipe.fat * multiplier * 10) / 10,
    ingredients: newRecipe.ingredients.map((ing) => ({
      ...ing,
      amount: Math.round(ing.amount * multiplier * 10) / 10,
      calories: Math.round(ing.calories * multiplier),
      protein: Math.round(ing.protein * multiplier * 10) / 10,
      carbs: Math.round(ing.carbs * multiplier * 10) / 10,
      fat: Math.round(ing.fat * multiplier * 10) / 10,
    })),
    instructions: newRecipe.instructions,
  };
}

/**
 * Adjusts the portion size multiplier of a planned meal (0.75x, 1x, 1.25x, 1.5x)
 */
export function adjustMealPortion(
  currentMeal: PlannedMeal,
  newMultiplier: number
): PlannedMeal {
  const baseRecipe = getRecipeById(currentMeal.recipeId);
  if (!baseRecipe) {
    // Scale current if base not found
    const ratio = newMultiplier / (currentMeal.portionMultiplier || 1.0);
    return {
      ...currentMeal,
      portionMultiplier: newMultiplier,
      calories: Math.round(currentMeal.calories * ratio),
      protein: Math.round(currentMeal.protein * ratio * 10) / 10,
      carbs: Math.round(currentMeal.carbs * ratio * 10) / 10,
      fat: Math.round(currentMeal.fat * ratio * 10) / 10,
    };
  }

  return {
    ...currentMeal,
    portionMultiplier: newMultiplier,
    calories: Math.round(baseRecipe.calories * newMultiplier),
    protein: Math.round(baseRecipe.protein * newMultiplier * 10) / 10,
    carbs: Math.round(baseRecipe.carbs * newMultiplier * 10) / 10,
    fat: Math.round(baseRecipe.fat * newMultiplier * 10) / 10,
    ingredients: baseRecipe.ingredients.map((ing) => ({
      ...ing,
      amount: Math.round(ing.amount * newMultiplier * 10) / 10,
      calories: Math.round(ing.calories * newMultiplier),
      protein: Math.round(ing.protein * newMultiplier * 10) / 10,
      carbs: Math.round(ing.carbs * newMultiplier * 10) / 10,
      fat: Math.round(ing.fat * newMultiplier * 10) / 10,
    })),
  };
}
