'use client';

import React, { useEffect } from 'react';
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-detail-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[88vh] bg-white dark:bg-gym-card rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scaleUp">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-5 border-b border-gym-border bg-white dark:bg-gym-card">
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
            className="p-2 sm:p-2.5 rounded-xl text-zinc-500 hover:text-gym-text dark:text-zinc-400 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto modal-content-scroll flex-1">
          {/* Nutrition Snapshot */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-gym-cardInner ">
              <span className="text-xs uppercase font-bold text-zinc-400 block">Energy</span>
              <span className="text-sm sm:text-base font-bold text-gym-text">{meal.calories} kcal</span>
            </div>
            <div className="p-3 rounded-2xl bg-gym-lime/10 dark:bg-gym-lime/15 border border-gym-lime/30">
              <span className="text-xs uppercase font-bold text-gym-limeDark dark:text-gym-lime block">Protein</span>
              <span className="text-sm sm:text-base font-bold text-gym-limeDark dark:text-gym-lime">{meal.protein}g</span>
            </div>
            <div className="p-3 rounded-2xl bg-gym-cardInner ">
              <span className="text-xs uppercase font-bold text-zinc-400 block">Carbs</span>
              <span className="text-sm sm:text-base font-bold text-gym-text">{meal.carbs}g</span>
            </div>
            <div className="p-3 rounded-2xl bg-gym-cardInner ">
              <span className="text-xs uppercase font-bold text-zinc-400 block">Fat</span>
              <span className="text-sm sm:text-base font-bold text-gym-text">{meal.fat}g</span>
            </div>
          </div>

          {/* Household Portion & Measurement Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gym-lime/10 dark:bg-gym-lime/15 border border-gym-lime/30 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold uppercase tracking-wider text-gym-limeDark dark:text-gym-lime flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Selected Portion: {formatPortionFraction(meal.portionMultiplier)}</span>
              </span>
              <span className="text-xs text-zinc-500 font-mono">Cooked Plate Serving</span>
            </div>
            {practicalMeasure && (
              <p className="text-gym-silver font-medium leading-relaxed">
                Practical household measure: <strong>{practicalMeasure}</strong>
              </p>
            )}
            <p className="text-xs text-gym-textMuted">
              Quantities represent ready-to-eat cooked food on your plate.
            </p>
          </div>

          {/* Measured Ingredients in Local Units */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gym-textMuted flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime" />
              <span>Ingredients (Nigerian Measurement Units)</span>
            </h3>

            <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80 rounded-2xl overflow-hidden bg-gym-cardAlt">
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
              <span>Step-by-Step Cooking Guide</span>
            </h3>

            <div className="space-y-2.5">
              {meal.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60 /60 dark:border-zinc-800/60 text-xs sm:text-sm">
                  <div className="w-5 h-5 rounded-full bg-gym-lime text-black font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
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
            className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-bold text-xs shadow-sm hover:opacity-90 transition-opacity"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
