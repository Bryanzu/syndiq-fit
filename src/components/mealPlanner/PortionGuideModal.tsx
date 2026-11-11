'use client';

import React from 'react';
import { Sheet } from '@/components/ui/Sheet';
import {
  X,
  Scale,
  Hand,
  PieChart,
  Flame,
  Beef,
  Utensils,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

interface PortionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PortionGuideModal({ isOpen, onClose }: PortionGuideModalProps) {
  if (!isOpen) return null;

  return (
    <Sheet isOpen={isOpen} onClose={onClose} labelledBy="portion-guide-title" zClass="z-[100]" maxWidth="max-w-2xl">
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-6 border-b border-gym-border shrink-0 bg-gym-card backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gym-lime/20 border border-gym-lime/40 flex items-center justify-center text-gym-limeDark dark:text-gym-lime">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 id="portion-guide-title" className="text-xl font-bold text-gym-text">
                How Portions Work
              </h2>
              <p className="text-xs text-gym-textMuted">
                A simple guide to understanding servings, fractions, and Nigerian food measurements
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl"
            aria-label="Close portion guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Section 1: Serving vs Portion */}
          <div className="space-y-2 bg-gym-cardAlt p-4 rounded-2xl /80 dark:border-zinc-800/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-gym-limeDark dark:text-gym-lime flex items-center gap-1.5">
              <PieChart className="w-4 h-4" />
              <span>1. Serving vs. Portion</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-gym-card rounded-xl space-y-1">
                <span className="font-bold text-gym-text block">A &ldquo;Serving&rdquo; (Reference)</span>
                <p className="text-gym-textMuted text-xs">
                  The standard recipe unit calculated by the planner (e.g., 1 plate of Jollof Rice with 1 chicken piece).
                </p>
              </div>
              <div className="p-3 bg-gym-card rounded-xl space-y-1">
                <span className="font-bold text-gym-text block">Your &ldquo;Portion&rdquo; (What You Eat)</span>
                <p className="text-gym-textMuted text-xs">
                  The actual quantity you consume. You can adjust this up or down based on your hunger and training intensity.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Understanding Multipliers & Fractions */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gym-text flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-gym-limeDark dark:text-gym-lime" />
              <span>2. Fractions & Multipliers Explained</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-3 rounded-xl bg-gym-cardAlt ">
                <span className="text-base font-bold text-gym-limeDark dark:text-gym-lime block">¾ (0.75x)</span>
                <span className="text-xs font-bold text-gym-text block">¾ of a serving</span>
                <span className="text-xs text-zinc-500">Lighter meal, 25% fewer calories</span>
              </div>
              <div className="p-3 rounded-xl bg-gym-cardAlt ">
                <span className="text-base font-bold text-gym-limeDark dark:text-gym-lime block">1.0x</span>
                <span className="text-xs font-bold text-gym-text block">1 standard serving</span>
                <span className="text-xs text-zinc-500">The baseline balanced recipe</span>
              </div>
              <div className="p-3 rounded-xl bg-gym-cardAlt ">
                <span className="text-base font-bold text-gym-limeDark dark:text-gym-lime block">1¼ (1.25x)</span>
                <span className="text-xs font-bold text-gym-text block">1 and ¼ servings</span>
                <span className="text-xs text-zinc-500">Extra fuel for training recovery</span>
              </div>
              <div className="p-3 rounded-xl bg-gym-cardAlt ">
                <span className="text-base font-bold text-gym-limeDark dark:text-gym-lime block">1½ (1.5x)</span>
                <span className="text-xs font-bold text-gym-text block">1 and ½ servings</span>
                <span className="text-xs text-zinc-500">Large meal for muscle building</span>
              </div>
            </div>
          </div>

          {/* Section 3: Visual Hand Measurements */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gym-text flex items-center gap-1.5">
              <Hand className="w-4 h-4 text-gym-limeDark dark:text-gym-lime" />
              <span>3. Estimating Portions Without a Kitchen Scale</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-gym-cardAlt flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gym-lime/20 text-gym-limeDark dark:text-gym-lime shrink-0">
                  <Beef className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-xs text-gym-text block">
                    Palm of Your Hand = Protein (Fish, Chicken, Beef)
                  </span>
                  <p className="text-xs text-gym-textMuted leading-normal">
                    One palm-sized piece (without fingers, ~120g to 150g) represents one standard protein portion.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gym-cardAlt flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-xs text-gym-text block">
                    Closed Fist = Carbohydrates & Swallow (Rice, Eba, Yam)
                  </span>
                  <p className="text-xs text-gym-textMuted leading-normal">
                    One clenched fist equals about 1 cup of cooked rice (~150g) or 1 medium wrap of swallow.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gym-cardAlt flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500 shrink-0">
                  <Hand className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-xs text-gym-text block">
                    Cupped Hand = Beans, Peanuts, Fruits
                  </span>
                  <p className="text-xs text-gym-textMuted leading-normal">
                    What fits into your cupped hand represents about ½ cup of cooked beans or a healthy snack serving.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gym-cardAlt flex items-start gap-3">
                <div className="p-2 rounded-xl bg-red-500/20 text-red-500 shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-xs text-gym-text block">
                    Thumb Tip = Palm Oil & Cooking Fats
                  </span>
                  <p className="text-xs text-gym-textMuted leading-normal">
                    About 1 tablespoon of red palm oil or groundnut oil. A little goes a long way in Nigerian soups!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Raw vs Cooked Clarification */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 space-y-1.5">
            <span className="font-bold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Raw Ingredients vs. Cooked Food</span>
            </span>
            <p className="text-xs leading-relaxed text-gym-silver">
              Rice and beans expand 2.5x to 3x when boiled in water, whereas meats shrink about 25% when grilled or fried. The meal planner measures plate portions in <strong>cooked quantities</strong> and market purchases in <strong>raw market units</strong> (such as mudus, dericas, and crates).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gym-border shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-semibold text-xs sm:text-sm transition-all"
          >
            Got It
          </button>
        </div>
    </Sheet>
  );
}
