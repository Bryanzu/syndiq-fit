import { isGoalContradictory } from '../src/data/questionnaireOptions.js';
import { generateWorkoutProgram } from '../src/engine/programAssembler.js';
import { calculateNutritionTargets } from '../src/engine/mealPlanner/nutritionCalculator.js';
import { generateWeeklyMealPlan, swapPlannedMeal, adjustMealPortion } from '../src/engine/mealPlanner/mealPlanGenerator.js';
import { generateShoppingList } from '../src/engine/mealPlanner/shoppingList.js';
import { NIGERIAN_RECIPES } from '../src/data/nigerianRecipes.js';
import { NIGERIAN_FOOD_DATABASE } from '../src/data/nigerianFoods.js';

console.log('====================================================');
console.log('🧪 RUNNING SYNDIQ FIT COMPREHENSIVE FEATURES TEST');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

// -----------------------------------------------------------------
// 1. FEATURE 1: Workout Goal Selection & Contradiction Logic
// -----------------------------------------------------------------
console.log('--- 1. Testing Goal Selection & Contradiction Logic ---');

const sameGoalCheck = isGoalContradictory('muscle_building', 'muscle_building');
assert(sameGoalCheck.isContradictory, 'Identical primary & secondary goal is flagged as contradictory');

const fatLossVsMuscle = isGoalContradictory('fat_loss', 'muscle_building');
assert(fatLossVsMuscle.isContradictory, 'Fat loss vs muscle building is flagged as conflicting energy balances');

const muscleVsFat = isGoalContradictory('muscle_building', 'fat_loss');
assert(muscleVsFat.isContradictory, 'Muscle building vs fat loss is flagged as conflicting energy balances');

const fatLossVsMaintain = isGoalContradictory('fat_loss', 'maintain_fitness');
assert(fatLossVsMaintain.isContradictory, 'Fat loss vs maintain fitness is flagged as contradictory');

const complementaryGoals = isGoalContradictory('muscle_building', 'chest_emphasis');
assert(!complementaryGoals.isContradictory, 'Muscle building + Chest emphasis is a valid complementary pairing');

const strengthPlusArm = isGoalContradictory('build_strength', 'arm_emphasis');
assert(!strengthPlusArm.isContradictory, 'Build strength + Arm development is a valid complementary pairing');

// Program Assembly with Secondary Goals
const testProfile = {
  gender: 'male',
  age: '21-30',
  experience: 'intermediate',
  goal: 'muscle_building',
  secondaryGoals: ['chest_emphasis', 'arm_emphasis'],
  frequency: 4,
  duration: 60,
  availableEquipment: ['barbell_bench_press', 'dumbbells_adjustable', 'olympic_barbell', 'flat_bench'],
  injuries: ['none'],
};

const generatedProgram = generateWorkoutProgram(testProfile);
assert(generatedProgram.days.length === 4, 'Engine generated 4 days for 4-day frequency');
assert(generatedProgram.description.includes('Chest Development') || generatedProgram.description.includes('Arm Development'), 'Program description highlights complementary secondary priorities');
assert(generatedProgram.userProfile.secondaryGoals?.length === 2, 'Program userProfile preserves secondary goals');

// -----------------------------------------------------------------
// 2. FEATURE 3: Nigerian Meal Planner & Nutrition Calculations
// -----------------------------------------------------------------
console.log('\n--- 2. Testing Nigerian Nutrition & Meal Plan Engine ---');

assert(NIGERIAN_FOOD_DATABASE.length >= 25, `Verified Nigerian food database contains ${NIGERIAN_FOOD_DATABASE.length} items`);
assert(NIGERIAN_RECIPES.length >= 20, `Verified Nigerian recipe library contains ${NIGERIAN_RECIPES.length} recipes`);

// Mifflin-St Jeor Calculation Test
const maleTargets = calculateNutritionTargets('male', 25, 75, 'moderate', 'muscle_building');
assert(maleTargets.targetCalories > 2200 && maleTargets.targetCalories < 3200, `Male target calories calculated realistically: ${maleTargets.targetCalories} kcal`);
assert(maleTargets.targetProteinGrams === 150, `Target protein for 75kg at 2.0g/kg is 150g (got ${maleTargets.targetProteinGrams}g)`);

const femaleTargets = calculateNutritionTargets('female', 28, 62, 'light', 'fat_loss');
assert(femaleTargets.targetCalories < femaleTargets.tdee, `Fat loss target calories (${femaleTargets.targetCalories}) is in a deficit below TDEE (${femaleTargets.tdee})`);
assert(femaleTargets.targetProteinGrams === Math.round(62 * 1.9), `Female protein target in deficit is ~1.9g/kg: ${femaleTargets.targetProteinGrams}g`);

// 7-Day Plan Generation
const mealProfile = {
  gender: 'male',
  age: 26,
  weightKg: 78,
  activityLevel: 'moderate',
  goal: 'muscle_building',
  mealsPerDay: 4,
  budgetLevel: 'budget',
  targetCalories: maleTargets.targetCalories,
  targetProteinGrams: maleTargets.targetProteinGrams,
};

const userInventory = [
  { foodId: 'white_rice', status: 'in_stock', quantity: 4, unit: 'cup' },
  { foodId: 'chicken_egg', status: 'in_stock', quantity: 6, unit: 'piece' },
  { foodId: 'palm_oil', status: 'in_stock', quantity: 1, unit: 'bottle' },
  { foodId: 'tilapia_fish', status: 'excluded' }, // User allergic to tilapia
];

const weeklyPlan = generateWeeklyMealPlan(mealProfile, userInventory);
assert(weeklyPlan.days.length === 7, `Weekly plan generated exactly 7 days (Monday - Sunday)`);

let containsExcluded = false;
weeklyPlan.days.forEach((day) => {
  day.meals.forEach((meal) => {
    if (meal.ingredients.some((ing) => ing.foodId === 'tilapia_fish')) {
      containsExcluded = true;
    }
  });
});
assert(!containsExcluded, 'Engine strictly excluded tilapia from all planned meals as requested by user allergy');

// Test Meal Swapping
const mondayLunch = weeklyPlan.days[0].meals.find((m) => m.mealType === 'lunch');
assert(!!mondayLunch, 'Monday has a valid lunch meal');
const originalRecipeId = mondayLunch.recipeId;
const alternativeRecipeId = originalRecipeId === 'l1_jollof_chicken_breast' ? 'l2_rice_beans_titus' : 'l1_jollof_chicken_breast';
const swappedMeal = swapPlannedMeal(mondayLunch, alternativeRecipeId);
assert(swappedMeal.recipeId === alternativeRecipeId, `Successfully swapped meal to alternative recipe (${swappedMeal.recipeName})`);
assert(swappedMeal.calories > 0 && swappedMeal.protein > 0, 'Swapped meal recalculated calories and protein accurately');

// Test Portion Multiplier Scaling
const scaledMeal = adjustMealPortion(mondayLunch, 1.5);
assert(scaledMeal.portionMultiplier === 1.5, 'Portion multiplier set to 1.5x');
assert(scaledMeal.calories === Math.round(mondayLunch.calories * 1.5), `Calories scaled proportionally: ${mondayLunch.calories} -> ${scaledMeal.calories}`);

// Test Honest Shortfall Reporting
console.log('\n--- 3. Testing Honest Protein Shortfall Reporting ---');
const lowProteinInventory = [
  { foodId: 'white_rice', status: 'in_stock' },
  { foodId: 'garri_eba', status: 'in_stock' },
  { foodId: 'chicken_breast', status: 'excluded' },
  { foodId: 'chicken_thigh_lap', status: 'excluded' },
  { foodId: 'lean_beef', status: 'excluded' },
  { foodId: 'goat_meat', status: 'excluded' },
  { foodId: 'titus_mackerel', status: 'excluded' },
  { foodId: 'catfish', status: 'excluded' },
  { foodId: 'tilapia_fish', status: 'excluded' },
];

const highTargetProfile = {
  ...mealProfile,
  weightKg: 85,
  targetProteinGrams: 170,
};

const shortfallPlan = generateWeeklyMealPlan(highTargetProfile, lowProteinInventory);
assert(shortfallPlan.proteinShortfallReport?.hasShortfall === true, 'Engine truthfully detected that protein target cannot be met with excluded meats');
assert(shortfallPlan.proteinShortfallReport.shortfallGrams > 0, `Engine honestly reported exact shortfall (${shortfallPlan.proteinShortfallReport.shortfallGrams}g deficit)`);
assert(shortfallPlan.proteinShortfallReport.suggestions.length > 0, 'Engine offered practical Nigerian food suggestions (eggs, crayfish, beans) to bridge the gap without false reporting');

// Test Shopping List with In-Stock Subtraction
console.log('\n--- 4. Testing Consolidated Nigerian Market Shopping List ---');
const shoppingList = generateShoppingList(weeklyPlan, userInventory);
assert(shoppingList.length > 0, `Consolidated shopping list created with ${shoppingList.length} unique ingredients`);

const eggItem = shoppingList.find((i) => i.foodId === 'chicken_egg');
assert(!!eggItem, 'Chicken eggs identified on shopping list');
assert(eggItem.inStockQuantity === 6, 'Subtracted 6 eggs already in pantry');
assert(eggItem.marketFormatRecommendation.includes('crate') || eggItem.marketFormatRecommendation.includes('eggs'), 'Recommends standard local market purchasing format (crate/loose eggs)');

console.log('\n====================================================');
console.log(`🏁 TEST RESULTS: ${passedTests} OF ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('====================================================');
