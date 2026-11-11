'use client';

import React from 'react';
import Image from 'next/image';
import { mealPhoto } from '@/lib/photos';
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
  const availableMultipliers = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

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
      className={`overflow-hidden rounded-[32px] border transition-all p-5 sm:p-6 space-y-4 ${
        isCompleted
          ? 'bg-gym-cardInner/60 border-gym-border opacity-80'
          : 'bg-gym-card border-gym-border hover:border-gym-borderHover'
      }`}
    >
      <div className="relative -mx-5 -mt-5 h-40 overflow-hidden sm:-mx-6 sm:-mt-6 sm:h-48">
        <Image src={mealPhoto(meal.recipeId)} alt="" fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
      </div>

      {/* Top Header: Meal Type, Checkbox & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gym-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gym-cardInner flex items-center justify-center">
            {getMealTypeIcon()}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gym-textMuted">
            {getMealTypeLabel()}
          </span>
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gym-lime/15 text-gym-limeDark dark:text-gym-lime border border-gym-lime/30 flex items-center gap-1">
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
          className={`flex items-center gap-1.5 px-3 py-1 rounded-2xl text-xs font-bold transition-all ${
            isCompleted
              ? 'bg-gym-lime text-gym-ink '
              : 'bg-gym-cardInner text-gym-textMuted hover:text-gym-text '
          }`}
        >
          <div
            className={`w-4 h-4 rounded flex items-center justify-center border ${
              isCompleted ? 'bg-black text-gym-lime border-black' : 'border-gym-border'
            }`}
          >
            {isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <span>{isCompleted ? 'Eaten' : 'Mark eaten'}</span>
        </button>
      </div>

      {/* Meal Names & Title */}
      <div className="space-y-1">
        {meal.localTitle && (
          <span className="text-xs font-bold tracking-wide text-gym-limeDark dark:text-gym-lime block">
            {meal.localTitle}
          </span>
        )}
        <h3 className="text-lg sm:text-xl font-bold text-gym-text leading-snug">
          {meal.recipeName}
        </h3>
      </div>

      {/* Practical Ingredients Summary */}
      <div className="space-y-1 bg-gym-cardAlt p-3 rounded-2xl /60">
        <span className="text-xs font-bold uppercase tracking-wider text-gym-textMuted block">
          On your plate
        </span>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {meal.ingredients.map((ing, idx) => (
            <span
              key={idx}
              className="px-2 py-1 rounded-md text-xs font-semibold bg-gym-card text-gym-silver"
            >
              {ing.displayAmount}
            </span>
          ))}
        </div>
        {practicalMeasure && (
          <div className="pt-2 border-t border-gym-border flex items-start gap-1.5 text-xs text-gym-textMuted">
            <Utensils className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime shrink-0 mt-0.5" />
            <span>
              Home estimate: <strong>{practicalMeasure}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Macro Breakdown Pills */}
      <div className="grid grid-cols-4 gap-2 pt-1 text-center">
        <div className="p-2 rounded-2xl bg-gym-cardInner/80 /80">
          <div className="flex items-center justify-center gap-1 text-xs text-gym-textMuted font-bold uppercase">
            <Flame className="w-3 h-3 text-amber-500" />
            <span>Energy</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-gym-text">
            {meal.calories} kcal
          </span>
        </div>

        <div className="p-2 rounded-2xl bg-gym-lime/10 dark:bg-gym-lime/15 border border-gym-lime/30">
          <div className="flex items-center justify-center gap-1 text-xs text-gym-limeDark dark:text-gym-lime font-bold uppercase">
            <Beef className="w-3 h-3" />
            <span>Protein</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-gym-limeDark dark:text-gym-lime">
            {meal.protein}g
          </span>
        </div>

        <div className="p-2 rounded-2xl bg-gym-cardInner/80 /80">
          <span className="text-xs text-gym-textMuted font-bold uppercase block">
            Carbs
          </span>
          <span className="text-xs sm:text-sm font-bold text-gym-text">
            {meal.carbs}g
          </span>
        </div>

        <div className="p-2 rounded-2xl bg-gym-cardInner/80 /80">
          <span className="text-xs text-gym-textMuted font-bold uppercase block">
            Fats
          </span>
          <span className="text-xs sm:text-sm font-bold text-gym-text">
            {meal.fat}g
          </span>
        </div>
      </div>

      {/* Footer Controls: Portion Scaler & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gym-border">
        {/* Portion Multiplier Selector with Stepper & Fractions */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <div className="flex items-center gap-1">
            <span className="font-bold text-gym-textMuted flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime" />
              <span>Portion:</span>
            </span>
            <InfoTooltip
              title={`${meal.recipeName} Portion`}
              content={`${portionDetails.summary} ${portionDetails.householdEstimate} Note: ${portionDetails.cookedVsRaw} Tip: ${portionDetails.scaleFreeTip}`}
            />
          </div>

          {/* Stepper Buttons (- and +) */}
          <div className="flex items-center bg-gym-cardInner rounded-2xl p-0.5 ">
            <button
              type="button"
              aria-label="Decrease portion"
              disabled={meal.portionMultiplier <= availableMultipliers[0]}
              onClick={() => handleStepPortion(-1)}
              className="p-1.5 rounded-lg text-gym-textMuted hover:bg-gym-card disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-2 font-mono font-bold text-xs text-gym-text min-w-[32px] text-center">
              {formatPortionFraction(meal.portionMultiplier)}
            </span>
            <button
              type="button"
              aria-label="Increase portion"
              disabled={meal.portionMultiplier >= availableMultipliers[availableMultipliers.length - 1]}
              onClick={() => handleStepPortion(1)}
              className="p-1.5 rounded-lg text-gym-textMuted hover:bg-gym-card disabled:opacity-30 disabled:pointer-events-none transition-colors"
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
              { val: 1.75, label: '1¾' },
              { val: 2.0, label: '2x' },
            ].map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => onPortionChange(meal.id, val)}
                className={`px-2 py-1 rounded-lg font-bold text-xs transition-all ${
                  meal.portionMultiplier === val
                    ? 'bg-gym-lime text-gym-ink font-semibold'
                    : 'bg-gym-cardInner text-gym-textMuted hover:brightness-110'
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
            className="flex-1 sm:flex-none px-3 py-2 rounded-2xl bg-gym-cardInner hover:bg-gym-cardInner text-gym-text font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <ChefHat className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime" />
            <span>Recipe</span>
          </button>

          <button
            type="button"
            onClick={() => onSwapClick(meal)}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-2xl bg-gym-lime/10 hover:bg-gym-lime/20 text-gym-limeDark dark:text-gym-lime border border-gym-lime/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Swap</span>
          </button>
        </div>
      </div>
    </div>
  );
}
