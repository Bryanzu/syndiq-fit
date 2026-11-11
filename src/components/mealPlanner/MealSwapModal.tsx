'use client';

import React, { useEffect } from 'react';
import { Sheet } from '@/components/ui/Sheet';
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
    <Sheet isOpen={Boolean(meal)} onClose={onClose} labelledBy="meal-swap-title" zClass="z-[100]" maxWidth="max-w-2xl">
        {/* Sticky Header with Accessible Close Button */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-5 border-b border-gym-border bg-gym-card">
          <div className="space-y-0.5 min-w-0 pr-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gym-limeDark dark:text-gym-lime">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Swap {meal.mealType.toUpperCase()}</span>
            </div>
            <h2 id="meal-swap-title" className="text-base sm:text-lg font-bold text-gym-text truncate">
              Replace: {meal.recipeName}
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

        {/* Scrollable Alternatives List */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto modal-content-scroll flex-1">
          <p className="text-xs text-gym-textMuted leading-relaxed">
            Pick a replacement. The rest of your week stays the same.
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
                  className={`p-4 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'border-gym-lime bg-gym-lime/10 dark:bg-gym-lime/15 cursor-default'
                      : 'border-gym-border bg-gym-cardAlt hover:border-gym-borderHover hover:brightness-110 cursor-pointer'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {recipe.localTitle && (
                        <span className="text-xs font-bold text-gym-limeDark dark:text-gym-lime">
                          {recipe.localTitle}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-gym-lime text-gym-ink ">
                          Current Choice
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-gym-text leading-snug">
                      {recipe.name}
                    </h4>

                    {/* Ingredients summary or practical home measure */}
                    <p className="text-xs text-gym-textMuted line-clamp-1">
                      {getRecipePracticalMeasurement(recipe.id)
                        ? `Estimate: ${getRecipePracticalMeasurement(recipe.id)}`
                        : recipe.ingredients.map((i) => i.foodName).join(' • ')}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-gym-cardInner/80 text-gym-textMuted flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins</span>
                      </span>
                      {recipe.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded text-xs font-bold bg-gym-cardInner/80 text-gym-textMuted capitalize"
                        >
                          {tag.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Macros & Swap Button */}
                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gym-border">
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="flex items-center gap-1 text-xs font-bold text-gym-text justify-end">
                          <Flame className="w-3 h-3 text-amber-500" />
                          <span>{recipe.calories} kcal</span>
                        </div>
                        <span className="text-xs text-gym-textMuted block">
                          {calDelta > 0 ? `+${calDelta}` : calDelta} kcal
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-xs font-bold text-gym-limeDark dark:text-gym-lime justify-end">
                          <Beef className="w-3 h-3" />
                          <span>{recipe.protein}g</span>
                        </div>
                        <span className={`text-xs font-bold block ${protDelta >= 0 ? 'text-gym-limeDark dark:text-gym-lime' : 'text-gym-textMuted'}`}>
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
                        className="px-3.5 py-2 rounded-2xl bg-gym-lime hover:bg-gym-limeLight text-gym-ink font-semibold text-xs transition-all "
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
    </Sheet>
  );
}
