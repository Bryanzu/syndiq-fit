import {
  WeeklyMealPlan,
  UserInventoryItem,
  ShoppingListItem,
  LocalUnit,
  NigerianFoodCategory,
} from '@/types/mealPlanner';
import { getFoodById } from '@/data/nigerianFoods';

/**
 * Aggregates all 7-day ingredients, subtracts pantry in-stock inventory,
 * and formats market purchasing guidance in authentic Nigerian local units.
 */
export function generateShoppingList(
  mealPlan: WeeklyMealPlan,
  inventory: UserInventoryItem[] = []
): ShoppingListItem[] {
  // Aggregate total required quantities by foodId
  const aggregated: Record<
    string,
    {
      foodId: string;
      totalAmount: number;
      unit: LocalUnit;
      foodName: string;
      category: NigerianFoodCategory;
    }
  > = {};

  mealPlan.days.forEach((day) => {
    day.meals.forEach((meal) => {
      meal.ingredients.forEach((ing) => {
        if (!aggregated[ing.foodId]) {
          const food = getFoodById(ing.foodId);
          aggregated[ing.foodId] = {
            foodId: ing.foodId,
            totalAmount: 0,
            unit: ing.unit,
            foodName: ing.foodName,
            category: food?.category || 'staples_carbs',
          };
        }
        aggregated[ing.foodId].totalAmount += ing.amount;
      });
    });
  });

  // Map user inventory
  const inventoryMap = new Map<string, UserInventoryItem>();
  inventory.forEach((item) => {
    inventoryMap.set(item.foodId, item);
  });

  const shoppingList: ShoppingListItem[] = [];

  Object.values(aggregated).forEach((item) => {
    const inv = inventoryMap.get(item.foodId);
    const inStock = inv && inv.status === 'in_stock' ? (inv.quantity ?? 1) : 0;
    const needed = Math.max(0, Math.round((item.totalAmount - (inv?.status === 'in_stock' ? inStock : 0)) * 10) / 10);

    const recommendation = formatMarketRecommendation(item.foodId, item.totalAmount, needed, item.unit);

    shoppingList.push({
      foodId: item.foodId,
      foodName: item.foodName,
      category: item.category,
      totalQuantityNeeded: Math.round(item.totalAmount * 10) / 10,
      unit: item.unit,
      inStockQuantity: inStock,
      toBuyQuantity: needed,
      marketFormatRecommendation: recommendation,
      isPurchased: false,
    });
  });

  // Sort by category order
  const categoryOrder: Record<NigerianFoodCategory, number> = {
    staples_carbs: 1,
    proteins_meat_fish: 2,
    vegetables_soups_fats: 3,
    fruits_snacks_nuts: 4,
  };

  return shoppingList.sort((a, b) => {
    const catDiff = (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99);
    if (catDiff !== 0) return catDiff;
    return a.foodName.localeCompare(b.foodName);
  });
}

function formatMarketRecommendation(
  foodId: string,
  totalNeeded: number,
  toBuy: number,
  unit: LocalUnit
): string {
  if (toBuy <= 0) {
    return 'Fully stocked in pantry';
  }

  switch (foodId) {
    case 'chicken_egg':
      if (toBuy >= 12) {
        return `Buy 1 crate (30 eggs) — will cover your ${Math.ceil(totalNeeded)} needed eggs with leftovers`;
      }
      return `Buy ${Math.ceil(toBuy)} fresh loose eggs`;

    case 'white_rice':
    case 'jollof_rice':
    case 'fried_rice':
      if (toBuy <= 3) return `Buy 1 derica of white rice (~850g raw)`;
      if (toBuy <= 6) return `Buy 2 derica of white rice (~1.7kg raw)`;
      return `Buy 1 mudu (~1.2kg) or paint bucket of rice`;

    case 'brown_beans':
      if (toBuy <= 3) return `Buy 1 derica of brown honey beans (Oloyin)`;
      return `Buy 1 mudu of brown honey beans (~1.2kg)`;

    case 'white_yam':
      const tubers = Math.max(1, Math.ceil(toBuy / 4));
      return `Buy ${tubers} medium yam tuber${tubers > 1 ? 's' : ''} (~1.5kg each)`;

    case 'sweet_potato':
      return `Buy 1 small market heap (4–6 sweet potatoes)`;

    case 'boiled_plantain_ripe':
    case 'boiled_plantain_unripe':
    case 'fried_plantain_dodo':
      return `Buy 1 bunch of plantains (6–8 fingers)`;

    case 'chicken_breast':
      return `Buy 1kg fresh or frozen chicken breast fillets`;

    case 'chicken_thigh_lap':
      return `Buy 1kg chicken laps (~5–6 pieces)`;

    case 'lean_beef':
      return `Buy 1kg lean beef cuts from local butcher`;

    case 'goat_meat':
      return `Buy 1kg fresh goat meat cuts`;

    case 'titus_mackerel':
      return `Buy 1kg frozen Titus fish carton (~4–5 whole fish)`;

    case 'catfish':
      return `Buy 1 medium live catfish (~1kg) or fresh cuts`;

    case 'tilapia_fish':
      return `Buy 1kg fresh or frozen tilapia`;

    case 'panla_hake':
      return `Buy 1 smoked fish tray or 1kg frozen panla`;

    case 'ground_crayfish':
      return `Buy 1 cup / derica of dried crayfish to blend`;

    case 'garri_eba':
      return `Buy 1 derica of yellow or Ijebu garri`;

    case 'semovita':
    case 'wheat_swallow':
      return `Buy 1 pack (1kg / 2kg)`;

    case 'agege_bread':
      return `Buy 1–2 loaves of sliced bread`;

    case 'oatmeal':
      return `Buy 1 tin (500g) rolled oats`;

    case 'powdered_milk':
      return `Buy 1 refill pack (400g) Peak or Dano milk`;

    case 'plain_yogurt':
      return `Buy 1 tub (500ml) plain unsweetened yogurt`;

    case 'roasted_groundnuts':
      return `Buy 1 bottle or small pouch of roasted groundnuts`;

    case 'banana':
      return `Buy 1 bunch of ripe bananas`;

    case 'ugwu_greens':
      return `Buy 2–3 fresh bunches of Ugwu leaves`;

    case 'tomato_stew':
      return `Buy 1 small basket of fresh tomatoes, tatase & rodo`;

    default:
      return `Buy ~${Math.ceil(toBuy)} ${unit}s in market`;
  }
}
