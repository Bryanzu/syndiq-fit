'use client';

import React from 'react';
import { PlannedMeal } from '@/types/mealPlanner';
import {
  Sun,
  UtensilsCrossed,
  Moon,
  Apple,
  RotateCw,
  ChefHat,
  Check,
  Flame,
  Beef,
  Scale,
  Plus,
  Minus,
  Utensils,
} from 'lucide-react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import {
  formatPortionFraction,
  formatPortionLong,
  getRecipePracticalMeasurement,
  getPortionExplanation,
} from '@/lib/portionHelpers';

interface MealCardProps {
  meal: PlannedMeal;
  onSwapClick: (meal: PlannedMeal) => void;
  onRecipeClick: (meal: PlannedMeal) => void;
  onToggleComplete: (mealId: string) => void;
  onPortionChange: (mealId: string, multiplier: number) => void;
}

export function MealCard({
  meal,
  onSwapClick,
  onRecipeClick,
  onToggleComplete,
  onPortionChange,
}: MealCardProps) {
  const isCompleted = !!meal.isCompleted;
  const practicalMeasure = getRecipePracticalMeasurement(meal.recipeId);
  const portionDetails = getPortionExplanation(meal.recipeId, meal.recipeName, meal.portionMultiplier);
  const availableMultipliers = [0.75, 1.0, 1.25, 1.5];

  const handleStepPortion = (delta: -1 | 1) => {
    const currentIndex = availableMultipliers.indexOf(meal.portionMultiplier);
    if (currentIndex === -1) {
      onPortionChange(meal.id, 1.0);
      return;
    }
    const nextIndex = currentIndex + delta;
    if (nextIndex >= 0 && nextIndex < availableMultipliers.length) {
      onPortionChange(meal.id, availableMultipliers[nextIndex]);
    }
  };

  const getMealTypeIcon = () => {
    switch (meal.mealType) {
      case 'breakfast':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'lunch':
        return <UtensilsCrossed className="w-4 h-4 text-gym-limeDark dark:text-gym-lime" />;
      case 'dinner':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'snack':
        return <Apple className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getMealTypeLabel = () => {
    switch (meal.mealType) {
      case 'breakfast':
        return 'Breakfast';
      case 'lunch':
        return 'Lunch';
      case 'dinner':
        return 'Dinner';
      case 'snack':
        return 'Midday Fuel / Snack';
    }
  };

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl border transition-all p-5 sm:p-6 space-y-4 ${
        isCompleted
          ? 'bg-zinc-100/70 dark:bg-[#121212]/60 border-zinc-200 dark:border-zinc-800 opacity-80'
          : 'bg-white dark:bg-gym-card border-zinc-200 dark:border-gym-border shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700'
      }`}
    >
      {/* Top Header: Meal Type, Checkbox & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            {getMealTypeIcon()}
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {getMealTypeLabel()}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-gym-lime/15 text-gym-limeDark dark:text-gym-lime border border-gym-lime/30 flex items-center gap-1">
            <span>{formatPortionFraction(meal.portionMultiplier)}</span>
            <InfoTooltip
              title={`${meal.recipeName} Portion`}
              content={`${portionDetails.summary} ${portionDetails.householdEstimate} ${portionDetails.cookedVsRaw}`}
              iconSize={12}
            />
          </span>
        </div>

        {/* Mark Completed Toggle */}
        <button
          type="button"
          onClick={() => onToggleComplete(meal.id)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            isCompleted
              ? 'bg-gym-lime text-black shadow-lime-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <div
            className={`w-4 h-4 rounded flex items-center justify-center border ${
              isCompleted ? 'bg-black text-gym-lime border-black' : 'border-zinc-300 dark:border-zinc-600'
            }`}
          >
            {isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <span>{isCompleted ? 'Eaten' : 'Mark Eaten'}</span>
        </button>
      </div>

      {/* Meal Names & Title */}
      <div className="space-y-1">
        {meal.localTitle && (
          <span className="text-xs font-black tracking-wide text-gym-limeDark dark:text-gym-lime block">
            {meal.localTitle}
          </span>
        )}
        <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white leading-snug">
          {meal.recipeName}
        </h3>
      </div>

      {/* Practical Ingredients Summary */}
      <div className="space-y-1 bg-slate-50 dark:bg-[#141414] p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
          Measured Portions:
        </span>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {meal.ingredients.map((ing, idx) => (
            <span
              key={idx}
              className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              {ing.displayAmount}
            </span>
          ))}
        </div>
        {practicalMeasure && (
          <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50 flex items-start gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
            <Utensils className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime shrink-0 mt-0.5" />
            <span>
              Home estimate: <strong>{practicalMeasure}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Macro Breakdown Pills */}
      <div className="grid grid-cols-4 gap-2 pt-1 text-center">
        <div className="p-2 rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase">
            <Flame className="w-3 h-3 text-amber-500" />
            <span>Energy</span>
          </div>
          <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white">
            {meal.calories} kcal
          </span>
        </div>

        <div className="p-2 rounded-xl bg-gym-lime/10 dark:bg-gym-lime/15 border border-gym-lime/30">
          <div className="flex items-center justify-center gap-1 text-[10px] text-gym-limeDark dark:text-gym-lime font-bold uppercase">
            <Beef className="w-3 h-3" />
            <span>Protein</span>
          </div>
          <span className="text-xs sm:text-sm font-black text-gym-limeDark dark:text-gym-lime">
            {meal.protein}g
          </span>
        </div>

        <div className="p-2 rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase block">
            Carbs
          </span>
          <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white">
            {meal.carbs}g
          </span>
        </div>

        <div className="p-2 rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase block">
            Fats
          </span>
          <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white">
            {meal.fat}g
          </span>
        </div>
      </div>

      {/* Footer Controls: Portion Scaler & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
        {/* Portion Multiplier Selector with Stepper & Fractions */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <div className="flex items-center gap-1">
            <span className="font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime" />
              <span>Portion:</span>
            </span>
            <InfoTooltip
              title={`${meal.recipeName} Portion`}
              content={`${portionDetails.summary} ${portionDetails.householdEstimate} Note: ${portionDetails.cookedVsRaw} Tip: ${portionDetails.scaleFreeTip}`}
            />
          </div>

          {/* Stepper Buttons (- and +) */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-xl p-0.5 border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              aria-label="Decrease portion"
              disabled={meal.portionMultiplier <= availableMultipliers[0]}
              onClick={() => handleStepPortion(-1)}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-2 font-mono font-bold text-[11px] text-zinc-900 dark:text-white min-w-[32px] text-center">
              {formatPortionFraction(meal.portionMultiplier)}
            </span>
            <button
              type="button"
              aria-label="Increase portion"
              disabled={meal.portionMultiplier >= availableMultipliers[availableMultipliers.length - 1]}
              onClick={() => handleStepPortion(1)}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Fraction Chips */}
          <div className="flex items-center gap-1">
            {[
              { val: 0.75, label: '¾' },
              { val: 1.0, label: '1x' },
              { val: 1.25, label: '1¼' },
              { val: 1.5, label: '1½' },
            ].map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => onPortionChange(meal.id, val)}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  meal.portionMultiplier === val
                    ? 'bg-zinc-900 text-white dark:bg-gym-lime dark:text-black shadow-sm font-extrabold'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons: Swap & Recipe */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onRecipeClick(meal)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <ChefHat className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime" />
            <span>Prep Guide</span>
          </button>

          <button
            type="button"
            onClick={() => onSwapClick(meal)}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gym-lime/10 hover:bg-gym-lime/20 text-gym-limeDark dark:text-gym-lime border border-gym-lime/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Swap Meal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
