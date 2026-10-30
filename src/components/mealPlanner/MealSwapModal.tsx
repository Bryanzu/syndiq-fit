'use client';

import React, { useEffect } from 'react';
import { PlannedMeal, NigerianRecipe } from '@/types/mealPlanner';
import { getRecipesByMealType } from '@/data/nigerianRecipes';
import { getRecipePracticalMeasurement } from '@/lib/portionHelpers';
import { X, Check, Flame, Beef, Clock, Sparkles, Utensils } from 'lucide-react';

interface MealSwapModalProps {
  meal: PlannedMeal | null;
  onClose: () => void;
  onSelectRecipe: (mealId: string, recipeId: string) => void;
}

export function MealSwapModal({
  meal,
  onClose,
  onSelectRecipe,
}: MealSwapModalProps) {
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

  const candidateRecipes = getRecipesByMealType(meal.mealType);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="meal-swap-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[88vh] bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scaleUp">
        {/* Sticky Header with Accessible Close Button */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-gym-border bg-white dark:bg-gym-card">
          <div className="space-y-0.5 min-w-0 pr-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gym-limeDark dark:text-gym-lime">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Swap {meal.mealType.toUpperCase()}</span>
            </div>
            <h2 id="meal-swap-title" className="text-base sm:text-lg font-black text-zinc-900 dark:text-white truncate">
              Replace: {meal.recipeName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 sm:p-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Alternatives List */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto modal-content-scroll flex-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Select any authentic Nigerian recipe below. Macros and portions will instantly recalculate for this meal without changing the rest of your week.
          </p>

          <div className="space-y-2.5">
            {candidateRecipes.map((recipe) => {
              const isCurrent = recipe.id === meal.recipeId;
              const protDelta = Math.round((recipe.protein - meal.protein) * 10) / 10;
              const calDelta = recipe.calories - meal.calories;

              return (
                <div
                  key={recipe.id}
                  onClick={() => {
                    if (!isCurrent) {
                      onSelectRecipe(meal.id, recipe.id);
                      onClose();
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'border-gym-lime bg-gym-lime/10 dark:bg-gym-lime/15 cursor-default'
                      : 'border-zinc-200 dark:border-gym-border bg-slate-50 dark:bg-[#141414] hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-slate-100 dark:hover:bg-[#18181b] cursor-pointer'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {recipe.localTitle && (
                        <span className="text-xs font-black text-gym-limeDark dark:text-gym-lime">
                          {recipe.localTitle}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-gym-lime text-black shadow-lime-sm">
                          Current Choice
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white leading-snug">
                      {recipe.name}
                    </h4>

                    {/* Ingredients summary or practical home measure */}
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      {getRecipePracticalMeasurement(recipe.id)
                        ? `Estimate: ${getRecipePracticalMeasurement(recipe.id)}`
                        : recipe.ingredients.map((i) => i.foodName).join(' • ')}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins</span>
                      </span>
                      {recipe.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 capitalize"
                        >
                          {tag.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Macros & Swap Button */}
                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200/60 dark:border-zinc-800/60">
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="flex items-center gap-1 text-xs font-black text-zinc-900 dark:text-white justify-end">
                          <Flame className="w-3 h-3 text-amber-500" />
                          <span>{recipe.calories} kcal</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 block">
                          {calDelta > 0 ? `+${calDelta}` : calDelta} kcal
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-xs font-black text-gym-limeDark dark:text-gym-lime justify-end">
                          <Beef className="w-3 h-3" />
                          <span>{recipe.protein}g</span>
                        </div>
                        <span className={`text-[10px] font-bold block ${protDelta >= 0 ? 'text-gym-limeDark dark:text-gym-lime' : 'text-zinc-400'}`}>
                          {protDelta >= 0 ? `+${protDelta}g` : `${protDelta}g`}
                        </span>
                      </div>
                    </div>

                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRecipe(meal.id, recipe.id);
                          onClose();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-xs shadow-lime-sm transition-all hover:scale-105"
                      >
                        Choose Meal
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
