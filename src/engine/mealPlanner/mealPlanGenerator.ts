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
import { NIGERIAN_RECIPES, getRecipeById } from '@/data/nigerianRecipes';
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
    // Never fall back to recipes containing excluded foods (they may be allergies).
    // An empty pool means that meal is skipped and reported, not silently filled.
    const list = allowedRecipes.filter((r) => r.mealTypes.includes(mealType));
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

  // Recipes already placed today (lunch and dinner share some recipes)
  let usedToday = new Set<string>();

  const selectRecipeWithVariety = (pool: NigerianRecipe[], mealType: MealType, dayIdx: number): NigerianRecipe | undefined => {
    if (pool.length === 0) return undefined;
    const used = recentRecipes[mealType];
    const lastTwo = used.slice(-2);
    const timesUsed = (id: string) => used.filter((u) => u === id).length;

    // Rotate through the whole pool: least-used first, best score breaking ties (pool is score-sorted),
    // never repeating the last 2 days of this meal type or a recipe already eaten today.
    const fresh = pool.filter((r) => !lastTwo.includes(r.id) && !usedToday.has(r.id));
    const eligible = fresh.length > 0 ? fresh : pool.filter((r) => !usedToday.has(r.id));
    const ranked = (eligible.length > 0 ? eligible : pool)
      .map((r, idx) => ({ r, idx }))
      .sort((a, b) => timesUsed(a.r.id) - timesUsed(b.r.id) || a.idx - b.idx);
    const candidate = ranked[0]?.r ?? pool[dayIdx % pool.length];

    recentRecipes[mealType].push(candidate.id);
    usedToday.add(candidate.id);
    return candidate;
  };

  // Portion sizes the UI can display and step through
  const PORTION_STEPS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  /**
   * Picks one portion multiplier per meal so the day lands as close as possible to the calorie target.
   * Starts from a uniform multiplier, then nudges individual meals one step to close the remaining gap.
   */
  const fitPortionsToTarget = (recipes: NigerianRecipe[], targetCalories: number): number[] => {
    const baseTotal = recipes.reduce((sum, r) => sum + r.calories, 0);
    if (baseTotal <= 0 || !targetCalories) return recipes.map(() => 1.0);

    const ideal = targetCalories / baseTotal;
    const nearestStep = PORTION_STEPS.reduce((best, s) => (Math.abs(s - ideal) < Math.abs(best - ideal) ? s : best), 1.0);
    const stepIdx = recipes.map(() => PORTION_STEPS.indexOf(nearestStep));
    const total = () => recipes.reduce((sum, r, i) => sum + r.calories * PORTION_STEPS[stepIdx[i]], 0);

    for (let guard = 0; guard < recipes.length * PORTION_STEPS.length; guard++) {
      const gap = targetCalories - total();
      const dir = gap > 0 ? 1 : -1;
      // Best single-step move: the one that leaves the smallest remaining gap
      let bestMeal = -1;
      let bestGap = Math.abs(gap);
      recipes.forEach((r, i) => {
        const next = stepIdx[i] + dir;
        if (next < 0 || next >= PORTION_STEPS.length) return;
        const delta = r.calories * (PORTION_STEPS[next] - PORTION_STEPS[stepIdx[i]]);
        const newGap = Math.abs(gap - delta);
        if (newGap < bestGap) {
          bestGap = newGap;
          bestMeal = i;
        }
      });
      if (bestMeal === -1) break;
      stepIdx[bestMeal] += dir;
    }

    return stepIdx.map((i) => PORTION_STEPS[i]);
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

  // Meal types left empty because every recipe for them contains an excluded food
  const skippedMealTypes = new Set<MealType>();

  // Generate 7 days
  const days: DayMealPlan[] = [];

  for (let i = 0; i < 7; i++) {
    const dayName = DAYS_OF_WEEK[i];
    usedToday = new Set<string>();

    const slots: Array<{ mealType: MealType; pool: NigerianRecipe[] }> = [
      { mealType: 'breakfast', pool: breakfastPool },
      { mealType: 'lunch', pool: lunchPool },
      { mealType: 'dinner', pool: dinnerPool },
    ];
    if (profile.mealsPerDay === 4) {
      slots.push({ mealType: 'snack', pool: snackPool });
    }

    // Choose the day's recipes first, then size the portions to the calorie target
    const chosen: Array<{ mealType: MealType; recipe: NigerianRecipe }> = [];
    for (const slot of slots) {
      const recipe = selectRecipeWithVariety(slot.pool, slot.mealType, i);
      if (recipe) {
        chosen.push({ mealType: slot.mealType, recipe });
      } else {
        skippedMealTypes.add(slot.mealType);
      }
    }

    const multipliers = fitPortionsToTarget(chosen.map((c) => c.recipe), profile.targetCalories);
    const meals: PlannedMeal[] = chosen.map((c, idx) => buildPlannedMeal(c.recipe, c.mealType, multipliers[idx]));

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

  if (shortfall > 8 || skippedMealTypes.size > 0) {
    // Each suggestion lists the foods it relies on; drop any that use a food the user excluded.
    const allSuggestions: Array<{ foodIds: string[]; text: string }> = [
      { foodIds: ['chicken_egg'], text: 'Add 2 boiled chicken eggs to breakfast (+13g pure protein at ~₦300–₦400).' },
      { foodIds: ['ground_crayfish'], text: 'Stir 2 rounded tablespoons of ground crayfish into your soups and stew (+11g animal protein + calcium).' },
      { foodIds: ['awara_tofu'], text: 'Swap one snack for pan-seared Awara (soy curd) (+17g protein).' },
      { foodIds: ['plain_yogurt'], text: 'Swap one snack for 1 cup of plain Greek yogurt (+17g protein).' },
      { foodIds: ['panla_hake'], text: 'Incorporate 1 extra piece of affordable Panla fish with dinner (+21g protein).' },
      { foodIds: ['titus_mackerel'], text: 'Incorporate 1 extra piece of Titus mackerel fish with dinner (+21g protein).' },
      { foodIds: ['brown_beans'], text: 'Add 1 extra cup of cooked brown honey beans (+14g protein).' },
      { foodIds: ['moi_moi'], text: 'Add 1 wrap of Moi Moi (+14g protein).' },
    ];
    const suggestions: string[] = allSuggestions
      .filter((s) => !s.foodIds.some((id) => excludedFoodIds.has(id)))
      .map((s) => s.text)
      .slice(0, 5);
    if (skippedMealTypes.size > 0) {
      suggestions.unshift(
        `No ${[...skippedMealTypes].join(' or ')} could be planned because every recipe for it contains a food you excluded. Re-allow some foods to fill it.`
      );
    }

    shortfallReport = {
      hasShortfall: true,
      targetProtein: profile.targetProteinGrams,
      actualAverageProtein: avgProtein,
      shortfallGrams: Math.max(0, shortfall),
      explanation:
        shortfall > 0
          ? `You’re averaging ${avgProtein}g of protein a day against a ${profile.targetProteinGrams}g target, about ${Math.max(0, shortfall)}g short.`
          : `Protein is on target at ${avgProtein}g a day.`,
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
