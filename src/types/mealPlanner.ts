export type NigerianFoodCategory =
  | 'staples_carbs'
  | 'proteins_meat_fish'
  | 'vegetables_soups_fats'
  | 'fruits_snacks_nuts';

export type LocalUnit =
  | 'cup'
  | 'mudu'
  | 'derica'
  | 'tuber'
  | 'bunch'
  | 'wrap'
  | 'piece'
  | 'tin'
  | 'tbsp'
  | 'cooking_spoon'
  | 'gram'
  | 'kg'
  | 'crate'
  | 'portion'
  | 'bottle';

export interface NigerianFoodItem {
  id: string;
  name: string;
  localName?: string;
  category: NigerianFoodCategory;
  servingSize: string;
  caloriesPerServing: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  defaultUnit: LocalUnit;
  marketUnit: string;
  isHighProtein?: boolean;
  isAffordableProtein?: boolean;
  notes?: string;
}

export type InventoryItemStatus = 'in_stock' | 'to_buy' | 'excluded';

export interface UserInventoryItem {
  foodId: string;
  status: InventoryItemStatus;
  quantity?: number;
  unit?: LocalUnit;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface RecipeIngredient {
  foodId: string;
  foodName: string;
  amount: number;
  unit: LocalUnit;
  displayAmount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NigerianRecipe {
  id: string;
  name: string;
  localTitle?: string;
  mealTypes: MealType[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  primaryProteinFoodId?: string;
  tags: string[];
}

export interface PlannedMeal {
  id: string;
  recipeId: string;
  recipeName: string;
  localTitle?: string;
  mealType: MealType;
  portionMultiplier: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  isCompleted?: boolean;
}

export interface DayMealPlan {
  dayNumber: number;
  dayName: string;
  meals: PlannedMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface MealPlanProfile {
  gender: 'male' | 'female';
  age: number;
  weightKg: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active';
  goal: 'fat_loss' | 'muscle_building' | 'maintain' | 'strength';
  mealsPerDay: 3 | 4;
  budgetLevel: 'budget' | 'moderate' | 'flexible';
  targetCalories: number;
  targetProteinGrams: number;
}

export interface ProteinShortfallReport {
  hasShortfall: boolean;
  targetProtein: number;
  actualAverageProtein: number;
  shortfallGrams: number;
  explanation: string;
  suggestions: string[];
}

export interface WeeklyMealPlan {
  id: string;
  createdAt: string;
  profile: MealPlanProfile;
  days: DayMealPlan[];
  averageDailyCalories: number;
  averageDailyProtein: number;
  proteinShortfallReport?: ProteinShortfallReport;
}

export interface ShoppingListItem {
  foodId: string;
  foodName: string;
  category: NigerianFoodCategory;
  totalQuantityNeeded: number;
  unit: LocalUnit;
  inStockQuantity: number;
  toBuyQuantity: number;
  marketFormatRecommendation: string;
  isPurchased: boolean;
}
