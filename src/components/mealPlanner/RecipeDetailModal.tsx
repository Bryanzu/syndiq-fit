'use client';

import React, { useEffect } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { PlannedMeal } from '@/types/mealPlanner';
import { X, Clock, ChefHat, Flame, Beef, CheckCircle, Utensils, Scale } from 'lucide-react';
import { formatPortionFraction, getRecipePracticalMeasurement } from '@/lib/portionHelpers';

interface RecipeDetailModalProps {
  meal: PlannedMeal | null;
  onClose: () => void;
}

export function RecipeDetailModal({ meal, onClose }: RecipeDetailModalProps) {
  const practicalMeasure = meal ? getRecipePracticalMeasurement(meal.recipeId) : null;
  useEffect(() => {
    if (meal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [meal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!meal) return null;

  return (
    <Sheet isOpen={Boolean(meal)} onClose={onClose} labelledBy="recipe-detail-title" zClass="z-[100]" maxWidth="max-w-2xl">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-5 border-b border-gym-border bg-gym-card">
          <div className="space-y-0.5 min-w-0 pr-3">
            {meal.localTitle && (
              <span className="text-xs font-bold text-gym-limeDark dark:text-gym-lime block">
                {meal.localTitle}
              </span>
            )}
            <h2 id="recipe-detail-title" className="text-base sm:text-xl font-bold text-gym-text truncate">
              {meal.recipeName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 sm:p-2.5 rounded-2xl text-gym-textMuted hover:text-gym-text bg-gym-cardInner hover:bg-gym-cardInner transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto modal-content-scroll flex-1">
          {/* Nutrition Snapshot */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-3 rounded-3xl bg-gym-cardInner ">
              <span className="text-xs uppercase font-bold text-gym-textMuted block">Energy</span>
              <span className="text-sm sm:text-base font-bold text-gym-text">{meal.calories} kcal</span>
            </div>
            <div className="p-3 rounded-3xl bg-gym-lime/10 dark:bg-gym-lime/15 border border-gym-lime/30">
              <span className="text-xs uppercase font-bold text-gym-limeDark dark:text-gym-lime block">Protein</span>
              <span className="text-sm sm:text-base font-bold text-gym-limeDark dark:text-gym-lime">{meal.protein}g</span>
            </div>
            <div className="p-3 rounded-3xl bg-gym-cardInner ">
              <span className="text-xs uppercase font-bold text-gym-textMuted block">Carbs</span>
              <span className="text-sm sm:text-base font-bold text-gym-text">{meal.carbs}g</span>
            </div>
            <div className="p-3 rounded-3xl bg-gym-cardInner ">
              <span className="text-xs uppercase font-bold text-gym-textMuted block">Fat</span>
              <span className="text-sm sm:text-base font-bold text-gym-text">{meal.fat}g</span>
            </div>
          </div>

          {/* Household Portion & Measurement Card */}
          <div className="p-3.5 sm:p-4 rounded-3xl bg-gym-lime/10 dark:bg-gym-lime/15 border border-gym-lime/30 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold uppercase tracking-wider text-gym-limeDark dark:text-gym-lime flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Selected Portion: {formatPortionFraction(meal.portionMultiplier)}</span>
              </span>
              <span className="text-xs text-gym-textMuted font-mono">One plate</span>
            </div>
            {practicalMeasure && (
              <p className="text-gym-silver font-medium leading-relaxed">
                Practical household measure: <strong>{practicalMeasure}</strong>
              </p>
            )}
            <p className="text-xs text-gym-textMuted">
              Amounts are for cooked food on your plate.
            </p>
          </div>

          {/* Measured Ingredients in Local Units */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gym-textMuted flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime" />
              <span>Ingredients</span>
            </h3>

            <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80 rounded-3xl overflow-hidden bg-gym-cardAlt">
              {meal.ingredients.map((ing, idx) => (
                <div key={idx} className="p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <span className="font-bold text-gym-text">{ing.foodName}</span>
                  <span className="font-semibold text-gym-limeDark dark:text-gym-lime bg-gym-lime/10 dark:bg-gym-lime/20 px-2.5 py-1 rounded-lg">
                    {ing.displayAmount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Practical Cooking Instructions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gym-textMuted flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime" />
              <span>How to cook it</span>
            </h3>

            <div className="space-y-2.5">
              {meal.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-gym-cardInner/70 /60 text-xs sm:text-sm">
                  <div className="w-5 h-5 rounded-full bg-gym-lime text-gym-ink font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-gym-silver leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gym-border bg-gym-cardAlt flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gym-text text-gym-bg font-bold text-xs shadow-sm hover:opacity-90 transition-opacity"
          >
            Close Guide
          </button>
        </div>
    </Sheet>
  );
}
