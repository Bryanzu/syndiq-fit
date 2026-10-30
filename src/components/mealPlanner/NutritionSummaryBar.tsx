'use client';

import React from 'react';
import { WeeklyMealPlan, DayMealPlan } from '@/types/mealPlanner';
import { Flame, Beef, Target, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

interface NutritionSummaryBarProps {
  mealPlan: WeeklyMealPlan;
  activeDay: DayMealPlan;
}

export function NutritionSummaryBar({ mealPlan, activeDay }: NutritionSummaryBarProps) {
  const profile = mealPlan.profile;
  const shortfall = mealPlan.proteinShortfallReport;

  const calDiff = activeDay.totalCalories - profile.targetCalories;
  const protDiff = Math.round((activeDay.totalProtein - profile.targetProteinGrams) * 10) / 10;

  return (
    <div className="space-y-4">
      {/* Target vs Actual Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Calories Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Calories</span>
              <InfoTooltip
                title="Daily Calories"
                content="Calories measure the total energy provided by food. Your target balances daily burn (TDEE) to meet your physique goal."
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                {activeDay.totalCalories}
              </span>
              <span className="text-xs text-zinc-500">/ {profile.targetCalories} kcal</span>
            </div>
            <span className={`text-[10px] font-bold block ${Math.abs(calDiff) <= 150 ? 'text-gym-limeDark dark:text-gym-lime' : calDiff > 0 ? 'text-amber-600' : 'text-blue-500'}`}>
              {calDiff >= 0 ? `+${calDiff}` : `${calDiff}`} kcal of target
            </span>
          </div>
        </div>

        {/* Protein Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <Beef className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime" />
              <span>Protein</span>
              <InfoTooltip
                title="Daily Protein"
                content="Dietary protein provides amino acids for muscle repair and strength. Syndiq Fit targets 1.5–2.0g per kg bodyweight."
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                {activeDay.totalProtein}g
              </span>
              <span className="text-xs text-zinc-500">/ {profile.targetProteinGrams}g</span>
            </div>
            <span className={`text-[10px] font-bold block ${protDiff >= 0 ? 'text-gym-limeDark dark:text-gym-lime' : 'text-amber-500'}`}>
              {protDiff >= 0 ? `Target Met (+${protDiff}g)` : `${protDiff}g below target`}
            </span>
          </div>
        </div>

        {/* Carbs Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <span>Carbohydrates</span>
              <InfoTooltip
                title="Carbohydrates"
                content="Carbohydrates provide primary glycogen energy for demanding workouts and cognitive focus."
              />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                {activeDay.totalCarbs}g
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 block">
              {Math.round((activeDay.totalCarbs * 4 / Math.max(activeDay.totalCalories, 1)) * 100)}% of daily energy
            </span>
          </div>
        </div>

        {/* Healthy Fats Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <span>Healthy Fats</span>
              <InfoTooltip
                title="Healthy Fats"
                content="Dietary fats support vital hormone synthesis (testosterone), cellular health, and fat-soluble vitamin uptake."
              />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                {activeDay.totalFat}g
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 block">
              {Math.round((activeDay.totalFat * 9 / Math.max(activeDay.totalCalories, 1)) * 100)}% of daily energy
            </span>
          </div>
        </div>
      </div>

      {/* Honest Protein Shortfall Alert Banner: NEVER falsify numbers */}
      {shortfall && shortfall.hasShortfall && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-900 dark:text-amber-200">
                  Honest Gap Analysis
                </span>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Daily Deficit: {shortfall.shortfallGrams}g Protein
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200/90 leading-relaxed">
                {shortfall.explanation}
              </p>
            </div>
          </div>

          {/* Actionable Nigerian Solutions */}
          <div className="pl-0 sm:pl-11 space-y-1.5 pt-1 border-t border-amber-500/20">
            <span className="text-xs font-extrabold text-amber-900 dark:text-amber-200 block uppercase tracking-wider">
              Affordable Nigerian High-Protein Additions to Bridge the Gap:
            </span>
            <ul className="space-y-1">
              {shortfall.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-xs text-amber-800 dark:text-amber-300/90 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
