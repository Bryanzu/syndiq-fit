'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  WeeklyMealPlan,
  PlannedMeal,
  UserInventoryItem,
  ShoppingListItem,
} from '@/types/mealPlanner';
import {
  loadActiveMealPlan,
  saveActiveMealPlan,
  loadMealPlanInventory,
  saveMealPlanInventory,
  loadSavedProfile,
} from '@/lib/storage';
import {
  generateWeeklyMealPlan,
  swapPlannedMeal,
  adjustMealPortion,
} from '@/engine/mealPlanner/mealPlanGenerator';
import { generateShoppingList } from '@/engine/mealPlanner/shoppingList';
import { generateMealPlanPdf } from '@/lib/mealPlanPdf';
import { MealPlannerFlow } from '@/components/mealPlanner/MealPlannerFlow';
import { NutritionSummaryBar } from '@/components/mealPlanner/NutritionSummaryBar';
import { MealCard } from '@/components/mealPlanner/MealCard';
import { MealSwapModal } from '@/components/mealPlanner/MealSwapModal';
import { RecipeDetailModal } from '@/components/mealPlanner/RecipeDetailModal';
import { ShoppingListView } from '@/components/mealPlanner/ShoppingListView';
import { PortionGuideModal } from '@/components/mealPlanner/PortionGuideModal';
import {
  Utensils,
  ShoppingBag,
  FileDown,
  RotateCcw,
  Sparkles,
  Calendar,
  ChefHat,
  RefreshCw,
  Plus,
  Scale,
  HelpCircle,
} from 'lucide-react';

export default function MealPlannerPage() {
  const router = useRouter();
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null);
  const [inventory, setInventory] = useState<UserInventoryItem[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isPortionGuideOpen, setIsPortionGuideOpen] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [activeTab, setActiveTab] = useState<'plan' | 'shopping'>('plan');
  const [swapTargetMeal, setSwapTargetMeal] = useState<PlannedMeal | null>(null);
  const [detailTargetMeal, setDetailTargetMeal] = useState<PlannedMeal | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedPlan = loadActiveMealPlan();
    const savedInv = loadMealPlanInventory();
    if (savedPlan) {
      setMealPlan(savedPlan);
      setInventory(savedInv);
      // "Plan my meals too" from the program result asks for a fresh plan
      if (new URLSearchParams(window.location.search).get('new') === '1') setIsWizardOpen(true);
    } else {
      setIsWizardOpen(true);
    }
    setIsHydrated(true);
  }, []);

  // Compute active day
  const activeDay = useMemo(() => {
    if (!mealPlan) return null;
    return mealPlan.days.find((d) => d.dayNumber === selectedDayNumber) || mealPlan.days[0];
  }, [mealPlan, selectedDayNumber]);

  // Compute live shopping list
  const shoppingList = useMemo(() => {
    if (!mealPlan) return [];
    return generateShoppingList(mealPlan, inventory);
  }, [mealPlan, inventory]);

  // Handle plan updates & persist
  const handleUpdatePlan = (updated: WeeklyMealPlan) => {
    setMealPlan(updated);
    saveActiveMealPlan(updated);
  };

  // Toggle meal completed
  const handleToggleMealComplete = (mealId: string) => {
    if (!mealPlan) return;
    const updatedDays = mealPlan.days.map((day) => ({
      ...day,
      meals: day.meals.map((m) => (m.id === mealId ? { ...m, isCompleted: !m.isCompleted } : m)),
    }));
    handleUpdatePlan({ ...mealPlan, days: updatedDays });
  };

  // Adjust meal portion
  const handlePortionChange = (mealId: string, multiplier: number) => {
    if (!mealPlan) return;
    const updatedDays = mealPlan.days.map((day) => {
      const updatedMeals = day.meals.map((m) =>
        m.id === mealId ? adjustMealPortion(m, multiplier) : m
      );
      const totalCal = updatedMeals.reduce((sum, m) => sum + m.calories, 0);
      const totalProt = Math.round(updatedMeals.reduce((sum, m) => sum + m.protein, 0) * 10) / 10;
      const totalCarbs = Math.round(updatedMeals.reduce((sum, m) => sum + m.carbs, 0) * 10) / 10;
      const totalFat = Math.round(updatedMeals.reduce((sum, m) => sum + m.fat, 0) * 10) / 10;
      return {
        ...day,
        meals: updatedMeals,
        totalCalories: totalCal,
        totalProtein: totalProt,
        totalCarbs,
        totalFat,
      };
    });

    const avgCal = Math.round(updatedDays.reduce((sum, d) => sum + d.totalCalories, 0) / 7);
    const avgProt = Math.round((updatedDays.reduce((sum, d) => sum + d.totalProtein, 0) / 7) * 10) / 10;

    handleUpdatePlan({
      ...mealPlan,
      days: updatedDays,
      averageDailyCalories: avgCal,
      averageDailyProtein: avgProt,
    });
  };

  // Swap meal recipe
  const handleConfirmSwap = (mealId: string, newRecipeId: string) => {
    if (!mealPlan) return;
    const updatedDays = mealPlan.days.map((day) => {
      const updatedMeals = day.meals.map((m) =>
        m.id === mealId ? swapPlannedMeal(m, newRecipeId) : m
      );
      const totalCal = updatedMeals.reduce((sum, m) => sum + m.calories, 0);
      const totalProt = Math.round(updatedMeals.reduce((sum, m) => sum + m.protein, 0) * 10) / 10;
      const totalCarbs = Math.round(updatedMeals.reduce((sum, m) => sum + m.carbs, 0) * 10) / 10;
      const totalFat = Math.round(updatedMeals.reduce((sum, m) => sum + m.fat, 0) * 10) / 10;
      return {
        ...day,
        meals: updatedMeals,
        totalCalories: totalCal,
        totalProtein: totalProt,
        totalCarbs,
        totalFat,
      };
    });

    const avgCal = Math.round(updatedDays.reduce((sum, d) => sum + d.totalCalories, 0) / 7);
    const avgProt = Math.round((updatedDays.reduce((sum, d) => sum + d.totalProtein, 0) / 7) * 10) / 10;

    handleUpdatePlan({
      ...mealPlan,
      days: updatedDays,
      averageDailyCalories: avgCal,
      averageDailyProtein: avgProt,
    });
  };

  // Toggle shopping list purchased item
  const handleToggleShoppingItem = (foodId: string) => {
    setInventory((prev) => {
      const updated = prev.map((item) =>
        item.foodId === foodId ? { ...item, isPurchased: !(item as any).isPurchased } : item
      );
      saveMealPlanInventory(updated);
      return updated;
    });
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    if (!mealPlan) return;
    setIsExportingPdf(true);
    try {
      await generateMealPlanPdf(mealPlan, shoppingList);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Regenerate entire week with current profile & inventory
  const handleRegenerateWeek = () => {
    if (!mealPlan) return;
    const freshPlan = generateWeeklyMealPlan(mealPlan.profile, inventory);
    handleUpdatePlan(freshPlan);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-gym-textMuted">
          <Sparkles className="w-4 h-4 text-gym-lime animate-spin" />
          <span>Loading your meals</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page pb-8 pt-1 sm:py-10 space-y-8">
      {/* Full-screen questions for a new plan */}
      {isWizardOpen && (
        <MealPlannerFlow
          initialProfile={mealPlan?.profile}
          initialInventory={inventory}
          onClose={() => {
            if (mealPlan) setIsWizardOpen(false);
            else router.push('/');
          }}
          onComplete={(newPlan, newInventory) => {
            setMealPlan(newPlan);
            setInventory(newInventory);
            saveActiveMealPlan(newPlan);
            saveMealPlanInventory(newInventory);
            setIsWizardOpen(false);
            if (window.location.search) router.replace('/meal-planner');
            window.scrollTo({ top: 0 });
          }}
        />
      )}

      {/* Main Meal Plan View */}
      {!isWizardOpen && mealPlan && activeDay && (
        <div className="space-y-8">
          {/* Header Card */}
          <div className="bg-gym-card rounded-3xl p-6 sm:p-8 space-y-6 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gym-border">
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gym-lime text-gym-ink ">
                    Your week
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gym-cardInner text-gym-silver flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime" />
                    <span>7 days</span>
                  </span>
                </div>
                <h1 className="t-large">
                  This week’s meals
                </h1>
                <p className="text-gym-textMuted text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Tap a meal to see the recipe, swap it or change the portion.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isExportingPdf}
                  className="px-5 py-3 rounded-2xl bg-gym-lime hover:bg-gym-limeLight text-gym-ink font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
                >
                  <FileDown className="w-4 h-4" />
                  <span>{isExportingPdf ? 'Exporting PDF...' : 'Download PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRegenerateWeek}
                  className="px-4 py-3 rounded-2xl bg-gym-cardInner hover:bg-gym-cardInner text-gym-text font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 min-h-[44px]"
                  title="Shuffle the week"
                >
                  <RefreshCw className="w-4 h-4 text-gym-limeDark dark:text-gym-lime" />
                  <span>Shuffle week</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPortionGuideOpen(true)}
                  className="px-3.5 py-3 rounded-2xl bg-gym-cardInner hover:bg-gym-cardInner text-gym-text hover:text-gym-text transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-semibold min-h-[44px]"
                  title="How portions work"
                >
                  <Scale className="w-4 h-4 text-gym-limeDark dark:text-gym-lime" />
                  <span className="hidden sm:inline">Portion Guide</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsWizardOpen(true)}
                  className="px-3.5 py-3 rounded-2xl bg-gym-cardInner hover:bg-gym-cardInner text-gym-text hover:text-gym-text transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-semibold min-h-[44px]"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reconfigure</span>
                </button>
              </div>
            </div>

            {/* Nutrition Targets & Honest Shortfall Analysis Bar */}
            <NutritionSummaryBar mealPlan={mealPlan} activeDay={activeDay} />
          </div>

          {/* View Mode Switcher: 7-Day Plan vs Shopping list */}
          <div className="flex items-center gap-2 border-b border-gym-border pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('plan')}
              className={`px-5 py-2.5 rounded-3xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all min-h-[42px] ${
                activeTab === 'plan'
                  ? 'bg-gym-lime text-gym-ink '
                  : 'text-gym-textMuted hover:text-gym-text bg-gym-cardInner'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Meals</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('shopping')}
              className={`px-5 py-2.5 rounded-3xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all min-h-[42px] ${
                activeTab === 'shopping'
                  ? 'bg-gym-lime text-gym-ink '
                  : 'text-gym-textMuted hover:text-gym-text bg-gym-cardInner'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shopping list</span>
              <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-black/10 dark:bg-white/10">
                {shoppingList.filter((i) => i.toBuyQuantity > 0).length}
              </span>
            </button>
          </div>

          {/* TAB 1: 7-DAY MEAL SCHEDULE */}
          {activeTab === 'plan' && (
            <div className="space-y-6">
              {/* Day Selector Tabs (Mon to Sun) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2">
                {mealPlan.days.map((day) => {
                  const isSelected = day.dayNumber === selectedDayNumber;
                  const completedMeals = day.meals.filter((m) => m.isCompleted).length;

                  return (
                    <button
                      key={day.dayNumber}
                      type="button"
                      onClick={() => setSelectedDayNumber(day.dayNumber)}
                      className={`p-3 sm:p-4 rounded-3xl border text-left transition-all shrink-0 min-w-[130px] sm:min-w-[150px] ${
                        isSelected
                          ? 'bg-gym-lime text-gym-ink border-gym-lime '
                          : 'bg-gym-card border-gym-border text-gym-silver hover:border-gym-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider block">
                          {day.dayName.slice(0, 3)}
                        </span>
                        {completedMeals === day.meals.length && (
                          <span className="w-2 h-2 rounded-full bg-gym-lime" />
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold block truncate">
                        {day.totalCalories} kcal
                      </span>
                      <span className="text-xs text-gym-textMuted block">
                        {day.totalProtein}g protein
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Day Title & Completed Indicator */}
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-gym-text">
                    {activeDay.dayName}&apos;s Nutrition Schedule
                  </h2>
                  <p className="text-xs text-gym-textMuted">
                    {activeDay.meals.length} planned meals • {activeDay.totalCalories} total calories • {activeDay.totalProtein}g protein
                  </p>
                </div>
              </div>

              {/* Meal Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDay.meals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onSwapClick={(m) => setSwapTargetMeal(m)}
                    onRecipeClick={(m) => setDetailTargetMeal(m)}
                    onToggleComplete={handleToggleMealComplete}
                    onPortionChange={handlePortionChange}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CONSOLIDATED SHOPPING LIST */}
          {activeTab === 'shopping' && (
            <ShoppingListView
              items={shoppingList}
              onToggleItem={handleToggleShoppingItem}
            />
          )}

          {/* Modals: Swap & Recipe Detail */}
          <MealSwapModal
            meal={swapTargetMeal}
            onClose={() => setSwapTargetMeal(null)}
            onSelectRecipe={handleConfirmSwap}
          />

          <RecipeDetailModal
            meal={detailTargetMeal}
            onClose={() => setDetailTargetMeal(null)}
          />

          <PortionGuideModal
            isOpen={isPortionGuideOpen}
            onClose={() => setIsPortionGuideOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
