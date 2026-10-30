'use client';

import React, { useState } from 'react';
import { ShoppingListItem, NigerianFoodCategory } from '@/types/mealPlanner';
import { ShoppingBag, Check, Copy, CheckCheck, Store, Sparkles } from 'lucide-react';

interface ShoppingListViewProps {
  items: ShoppingListItem[];
  onToggleItem: (foodId: string) => void;
}

export function ShoppingListView({ items, onToggleItem }: ShoppingListViewProps) {
  const [copied, setCopied] = useState(false);

  const categories: { id: NigerianFoodCategory; label: string }[] = [
    { id: 'staples_carbs', label: 'Staples, Swallows & Tubers' },
    { id: 'proteins_meat_fish', label: 'Proteins, Poultry & Fresh Fish' },
    { id: 'vegetables_soups_fats', label: 'Soups, Veggies & Cooking Oils' },
    { id: 'fruits_snacks_nuts', label: 'Fruits, Dairy & Market Nuts' },
  ];

  const handleCopy = () => {
    const lines = items
      .filter((i) => i.toBuyQuantity > 0)
      .map((i) => `• [ ] ${i.foodName}: ${i.marketFormatRecommendation}`)
      .join('\n');

    const text = `SYNDIQ FIT — NIGERIAN 7-DAY MARKET SHOPPING LIST\n\n${lines}\n\nGenerated with Syndiq Fit Intelligent Nutrition.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const purchasedCount = items.filter((i) => i.isPurchased).length;
  const toBuyCount = items.filter((i) => i.toBuyQuantity > 0).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Quick Controls */}
      <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gym-lime text-black shadow-lime-sm">
              Nigerian Market Guide
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {purchasedCount} of {toBuyCount} items bought
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
            7-Day Consolidated Shopping List
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
            Calculated across your entire 7-day program with in-stock pantry items automatically subtracted. Formatted in standard local market units (crates, derica, mudus, bunches, tubers).
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="self-start sm:self-auto px-4 py-3 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:opacity-90 transition-all shrink-0 min-h-[44px]"
        >
          {copied ? <CheckCheck className="w-4 h-4 text-gym-lime" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Market List'}</span>
        </button>
      </div>

      {/* Categorized Market Sections */}
      <div className="space-y-5">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category === cat.id);
          if (catItems.length === 0) return null;

          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
                <Store className="w-4 h-4 text-gym-limeDark dark:text-gym-lime" />
                <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white">
                  {cat.label}
                </h3>
                <span className="text-xs text-zinc-400 ml-auto font-bold">
                  {catItems.length} items
                </span>
              </div>

              <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                {catItems.map((item) => {
                  const isFullyStocked = item.toBuyQuantity <= 0;

                  return (
                    <div
                      key={item.foodId}
                      onClick={() => !isFullyStocked && onToggleItem(item.foodId)}
                      className={`py-3.5 flex items-start justify-between gap-3 transition-colors ${
                        isFullyStocked
                          ? 'opacity-50 cursor-default'
                          : 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 -mx-2 px-2 rounded-xl'
                      }`}
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-extrabold leading-snug ${
                              item.isPurchased
                                ? 'line-through text-zinc-400 dark:text-zinc-500'
                                : 'text-zinc-900 dark:text-white'
                            }`}
                          >
                            {item.foodName}
                          </span>
                          {isFullyStocked && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              In Stock
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                          <span className="font-bold text-gym-limeDark dark:text-gym-lime">
                            {item.marketFormatRecommendation}
                          </span>
                          {item.inStockQuantity > 0 && !isFullyStocked && (
                            <span className="text-[11px] text-zinc-400">
                              (Needs {item.totalQuantityNeeded} {item.unit}s • {item.inStockQuantity} in pantry)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Checkbox */}
                      <div className="shrink-0 mt-0.5">
                        {isFullyStocked ? (
                          <div className="w-5 h-5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                              item.isPurchased
                                ? 'bg-gym-lime text-black border-gym-lime shadow-lime-sm'
                                : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                            }`}
                          >
                            {item.isPurchased && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
