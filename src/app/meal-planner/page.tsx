'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
import { MealPlannerWizard } from '@/components/mealPlanner/MealPlannerWizard';
import { NutritionSummaryBar } from '@/components/mealPlanner/NutritionSummaryBar';
import { MealCard } from '@/components/mealPlanner/MealCard';
import { MealSwapModal } from '@/components/mealPlanner/MealSwapModal';
import { RecipeDetailModal } from '@/components/mealPlanner/RecipeDetailModal';
import { ShoppingListView } from '@/components/mealPlanner/ShoppingListView';
import { PortionGuideModal } from '@/components/mealPlanner/PortionGuideModal';
import Image from 'next/image';
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
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-500">
          <Sparkles className="w-4 h-4 text-gym-lime animate-spin" />
          <span>Loading Nutrition Plan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Wizard Modal / Overlay if building a new plan */}
      {isWizardOpen && (
        <div className="space-y-6">
          <div className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-gym-border bg-white dark:bg-gym-card shadow-lg transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-12 items-center">
              <div className="md:col-span-7 p-6 sm:p-10 space-y-3 z-10">
                <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gym-lime text-black shadow-lime-sm inline-block">
                  Intelligent Nutrition
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                  Nigerian Weekly Meal Planner
                </h1>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
                  Calibrated daily calories, protein synthesis targets, and practical pantry management using wholesome Nigerian food staples.
                </p>
              </div>
              <div className="md:col-span-5 relative h-48 md:h-full min-h-[180px] w-full overflow-hidden bg-zinc-900">
                <Image
                  src="/images/meal-prep-healthy.jpg"
                  alt="Fresh wholesome ingredients and healthy nutrition"
                  fill
                  className="object-cover opacity-85 object-center"
                  sizes="(max-width: 768px) 100vw, 40vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-white dark:from-gym-card via-transparent to-transparent md:w-24 pointer-events-none" />
              </div>
            </div>
          </div>

          <MealPlannerWizard
            initialProfile={mealPlan?.profile}
            initialInventory={inventory}
            onCancel={mealPlan ? () => setIsWizardOpen(false) : undefined}
            onComplete={(newPlan, newInventory) => {
              setMealPlan(newPlan);
              setInventory(newInventory);
              saveActiveMealPlan(newPlan);
              saveMealPlanInventory(newInventory);
              setIsWizardOpen(false);
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />
        </div>
      )}

      {/* Main Meal Plan View */}
      {!isWizardOpen && mealPlan && activeDay && (
        <div className="space-y-8">
          {/* Header Card */}
          <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-gym-border">
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gym-lime text-black shadow-lime-sm">
                    Syndiq Fit Nutrition
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime" />
                    <span>7-Day Nigerian Cycle</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                  7-Day Nigerian Meal Planner
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Scientifically calculated meal combinations using authentic Nigerian staples (Jollof, Egusi, Brown Beans, Titus, Yam, Ogbono, Awara). Accurate macros with zero inflated claims.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isExportingPdf}
                  className="px-5 py-3 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-xs sm:text-sm shadow-lime-md transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
                >
                  <FileDown className="w-4 h-4" />
                  <span>{isExportingPdf ? 'Exporting PDF...' : 'Download PDF Plan'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRegenerateWeek}
                  className="px-4 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs sm:text-sm border border-zinc-300 dark:border-zinc-700 transition-colors flex items-center gap-2 min-h-[44px]"
                  title="Shuffle meals for a fresh 7-day variation"
                >
                  <RefreshCw className="w-4 h-4 text-gym-limeDark dark:text-gym-lime" />
                  <span>Shuffle Week</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPortionGuideOpen(true)}
                  className="px-3.5 py-3 rounded-xl bg-slate-50 hover:bg-zinc-100 dark:bg-[#141414] dark:hover:bg-zinc-800 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white border border-zinc-200 dark:border-gym-border transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-semibold min-h-[44px]"
                  title="How Portions & Serving Sizes Work"
                >
                  <Scale className="w-4 h-4 text-gym-limeDark dark:text-gym-lime" />
                  <span className="hidden sm:inline">Portion Guide</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsWizardOpen(true)}
                  className="px-3.5 py-3 rounded-xl bg-slate-50 hover:bg-zinc-100 dark:bg-[#141414] dark:hover:bg-zinc-800 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white border border-zinc-200 dark:border-gym-border transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-semibold min-h-[44px]"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reconfigure</span>
                </button>
              </div>
            </div>

            {/* Nutrition Targets & Honest Shortfall Analysis Bar */}
            <NutritionSummaryBar mealPlan={mealPlan} activeDay={activeDay} />
          </div>

          {/* View Mode Switcher: 7-Day Plan vs Market Shopping List */}
          <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('plan')}
              className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all min-h-[42px] ${
                activeTab === 'plan'
                  ? 'bg-gym-lime text-black shadow-lime-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>7-Day Meal Schedule</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('shopping')}
              className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all min-h-[42px] ${
                activeTab === 'shopping'
                  ? 'bg-gym-lime text-black shadow-lime-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Market Shopping List</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-black/10 dark:bg-white/10">
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
                      className={`p-3 sm:p-4 rounded-2xl border text-left transition-all shrink-0 min-w-[130px] sm:min-w-[150px] ${
                        isSelected
                          ? 'bg-zinc-900 text-white dark:bg-[#18181b] border-gym-lime ring-2 ring-gym-lime shadow-lime-sm'
                          : 'bg-white dark:bg-gym-card border-zinc-200 dark:border-gym-border text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black uppercase tracking-wider block">
                          {day.dayName.slice(0, 3)}
                        </span>
                        {completedMeals === day.meals.length && (
                          <span className="w-2 h-2 rounded-full bg-gym-lime" />
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-extrabold block truncate">
                        {day.totalCalories} kcal
                      </span>
                      <span className="text-[10px] text-zinc-400 block">
                        {day.totalProtein}g protein
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Day Title & Completed Indicator */}
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                    {activeDay.dayName}&apos;s Nutrition Schedule
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
