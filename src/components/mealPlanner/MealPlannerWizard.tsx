'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  MealPlanProfile,
  UserInventoryItem,
  WeeklyMealPlan,
  NigerianFoodCategory,
} from '@/types/mealPlanner';
import { NIGERIAN_FOOD_DATABASE, NIGERIAN_FOOD_CATEGORIES } from '@/data/nigerianFoods';
import { calculateNutritionTargets } from '@/engine/mealPlanner/nutritionCalculator';
import { generateWeeklyMealPlan } from '@/engine/mealPlanner/mealPlanGenerator';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Search,
  Scale,
  Target,
  Flame,
  Beef,
  DollarSign,
  AlertCircle,
  RotateCcw,
  CheckSquare,
  Square,
  X,
  Plus,
} from 'lucide-react';

interface MealPlannerWizardProps {
  initialProfile?: Partial<MealPlanProfile>;
  initialInventory?: UserInventoryItem[];
  onComplete: (plan: WeeklyMealPlan, inventory: UserInventoryItem[]) => void;
  onCancel?: () => void;
}

export function MealPlannerWizard({
  initialProfile,
  initialInventory = [],
  onComplete,
  onCancel,
}: MealPlannerWizardProps) {
  const wizardContainerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const handleStepChange = (newStep: 1 | 2) => {
    setStep(newStep);
    if (typeof window !== 'undefined') {
      if (wizardContainerRef.current) {
        const top = wizardContainerRef.current.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Profile State
  const [gender, setGender] = useState<'male' | 'female'>(initialProfile?.gender || 'male');
  const [age, setAge] = useState<number>(initialProfile?.age || 26);
  const [weightKg, setWeightKg] = useState<number>(initialProfile?.weightKg || 74);
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'very_active'>(
    initialProfile?.activityLevel || 'moderate'
  );
  const [goal, setGoal] = useState<'fat_loss' | 'muscle_building' | 'maintain' | 'strength'>(
    initialProfile?.goal || 'muscle_building'
  );
  const [mealsPerDay, setMealsPerDay] = useState<3 | 4>(initialProfile?.mealsPerDay || 4);
  const [budgetLevel, setBudgetLevel] = useState<'budget' | 'moderate' | 'flexible'>(
    initialProfile?.budgetLevel || 'moderate'
  );

  // Live scientific calculation of energy & protein
  const liveTargets = useMemo(() => {
    return calculateNutritionTargets(gender, age, weightKg, activityLevel, goal);
  }, [gender, age, weightKg, activityLevel, goal]);

  // Inventory State
  const [inventory, setInventory] = useState<UserInventoryItem[]>(() => {
    if (initialInventory.length > 0) return initialInventory;
    // Default: mark all common staple items as to_buy and a few common items as in_stock
    return NIGERIAN_FOOD_DATABASE.map((f) => ({
      foodId: f.id,
      status: ['white_rice', 'garri_eba', 'chicken_egg', 'palm_oil', 'tomato_stew'].includes(f.id)
        ? 'in_stock'
        : 'to_buy',
    }));
  });

  const [activeCategory, setActiveCategory] = useState<NigerianFoodCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Update item inventory status
  const handleSetItemStatus = (foodId: string, status: 'in_stock' | 'to_buy' | 'excluded') => {
    setInventory((prev) => {
      const idx = prev.findIndex((i) => i.foodId === foodId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], status };
        return next;
      }
      return [...prev, { foodId, status }];
    });
  };

  const filteredFoods = useMemo(() => {
    return NIGERIAN_FOOD_DATABASE.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesLocal = item.localName?.toLowerCase().includes(q);
        return matchesName || matchesLocal;
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  const handleGenerate = () => {
    setIsGenerating(true);
    const profile: MealPlanProfile = {
      gender,
      age,
      weightKg,
      activityLevel,
      goal,
      mealsPerDay,
      budgetLevel,
      targetCalories: liveTargets.targetCalories,
      targetProteinGrams: liveTargets.targetProteinGrams,
    };

    try {
      const plan = generateWeeklyMealPlan(profile, inventory);
      onComplete(plan, inventory);
    } catch (err) {
      console.error('Failed to generate meal plan:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div ref={wizardContainerRef} className="w-full max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Step Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5 text-gym-limeDark dark:text-gym-lime">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step {step} of 2</span>
          </span>
          <span>{step === 1 ? 'Profile & Nutrition Target' : 'Nigerian Food Inventory'}</span>
        </div>
        <div className="w-full h-2 bg-zinc-200 dark:bg-[#18181b] rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-gym-lime to-gym-limeLight transition-all duration-500 shadow-lime-sm"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: PROFILE & NUTRITION TARGETS */}
      {step === 1 && (
        <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm transition-colors">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gym-lime/15 text-gym-limeDark dark:text-gym-lime border border-gym-lime/30 uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              <span>Nigerian Precision Nutrition</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
              Calibrate Your Energy & Protein Target
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Syndiq Fit uses the scientific Mifflin-St Jeor formula and ISSN protein positioning to construct an accurate daily target for your physique goal.
            </p>
          </div>

          {/* Sex & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Sex
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['male', 'female'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-3 rounded-2xl border font-bold text-sm capitalize transition-all min-h-[46px] ${
                      gender === g
                        ? 'bg-gym-lime/15 border-gym-lime text-gym-limeDark dark:text-gym-lime shadow-lime-sm ring-1 ring-gym-lime'
                        : 'bg-slate-50 dark:bg-[#121212] border-zinc-200 dark:border-gym-border text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Age: {age} years
              </label>
              <input
                type="range"
                min="16"
                max="75"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-gym-lime h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>16y</span>
                <span>45y</span>
                <span>75y</span>
              </div>
            </div>
          </div>

          {/* Body Weight in KG */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Body Weight
              </label>
              <span className="text-base font-black text-gym-limeDark dark:text-gym-lime">
                {weightKg} kg (~{Math.round(weightKg * 2.20462)} lbs)
              </span>
            </div>
            <input
              type="range"
              min="45"
              max="140"
              step="0.5"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full accent-gym-lime h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center">
              <span>Weekly Activity Level</span>
              <InfoTooltip
                title="Activity Level"
                content="How much physical movement and structured workouts you perform in a typical week. Used to calculate your daily energy expenditure (TDEE)."
              />
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'sedentary', label: 'Sedentary', sub: 'Desk job, low movement' },
                  { id: 'light', label: 'Light', sub: '1–2 workouts/wk' },
                  { id: 'moderate', label: 'Moderate', sub: '3–4 workouts/wk' },
                  { id: 'very_active', label: 'Very Active', sub: '5+ heavy sessions/wk' },
                ] as const
              ).map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setActivityLevel(act.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    activityLevel === act.id
                      ? 'bg-gym-lime/10 dark:bg-[#18181b] border-gym-lime shadow-lime-sm ring-1 ring-gym-lime'
                      : 'bg-slate-50 dark:bg-[#121212] border-zinc-200 dark:border-gym-border text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-white block">{act.label}</span>
                  <span className="text-[10px] text-zinc-500 block leading-tight">{act.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Fitness Goal */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Primary Physique & Nutrition Goal
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(
                [
                  { id: 'muscle_building', label: 'Hypertrophy / Muscle Building', desc: 'Caloric surplus with 2.0g/kg protein to pack on lean mass.' },
                  { id: 'fat_loss', label: 'Fat Loss & Conditioning', desc: '450 kcal deficit with high protein to strip fat while preserving muscle.' },
                  { id: 'strength', label: 'Maximal Strength', desc: 'Sustained energy surplus for heavy multi-joint performance.' },
                  { id: 'maintain', label: 'Maintain Current Fitness', desc: 'Energy balance and muscle retention for active busy schedules.' },
                ] as const
              ).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    goal === g.id
                      ? 'bg-gym-lime/10 dark:bg-[#18181b] border-gym-lime shadow-lime-sm ring-1 ring-gym-lime'
                      : 'bg-slate-50 dark:bg-[#121212] border-zinc-200 dark:border-gym-border text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-zinc-900 dark:text-white">{g.label}</span>
                    {goal === g.id && <Check className="w-3.5 h-3.5 text-gym-lime stroke-[3]" />}
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-tight">{g.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Meals Per Day & Budget Strategy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Daily Meal Frequency
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { count: 3 as const, label: '3 Meals', sub: 'Breakfast, Lunch, Dinner' },
                  { count: 4 as const, label: '3 Meals + 1 Snack', sub: 'Includes Midday Fuel' },
                ].map((m) => (
                  <button
                    key={m.count}
                    type="button"
                    onClick={() => setMealsPerDay(m.count)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      mealsPerDay === m.count
                        ? 'bg-gym-lime/15 border-gym-lime text-zinc-900 dark:text-white shadow-lime-sm ring-1 ring-gym-lime'
                        : 'bg-slate-50 dark:bg-[#121212] border-zinc-200 dark:border-gym-border text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="text-xs font-bold block">{m.label}</span>
                    <span className="text-[10px] text-zinc-500">{m.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center">
                <span>Budget Optimization</span>
                <InfoTooltip
                  title="Budget Optimization"
                  content="The planner tries to build meals around foods you already have in your kitchen and affordable additional market purchases, while minimizing unnecessary spending. It does not guarantee the lowest price in every local market."
                />
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  {
                    id: 'budget' as const,
                    label: 'Budget',
                    sub: 'Eggs, Beans, Titus',
                  },
                  {
                    id: 'moderate' as const,
                    label: 'Balanced',
                    sub: 'Standard market',
                  },
                  {
                    id: 'flexible' as const,
                    label: 'Flexible',
                    sub: 'Any protein cut',
                  },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBudgetLevel(b.id)}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      budgetLevel === b.id
                        ? 'bg-gym-lime/15 border-gym-lime text-zinc-900 dark:text-white shadow-lime-sm ring-1 ring-gym-lime font-bold'
                        : 'bg-slate-50 dark:bg-[#121212] border-zinc-200 dark:border-gym-border text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="text-xs block font-bold">{b.label}</span>
                    <span className="text-[9px] text-zinc-500 block leading-tight">{b.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Calibrated Target Preview Box */}
          <div className="p-5 rounded-2xl bg-zinc-900 text-white dark:bg-[#161616] border border-zinc-800 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gym-lime flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Calculated Daily Baseline</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-[11px] text-zinc-400 flex items-center">
                  <span>Daily Target Energy</span>
                  <InfoTooltip
                    title="Daily Target Energy"
                    content="Estimated total calories you need per day based on your body weight, activity level, and goal (caloric deficit for fat loss, surplus for muscle building). It is an evidence-based guideline, not an exact measurement."
                  />
                </span>
                <span className="text-xl sm:text-2xl font-black text-white">{liveTargets.targetCalories} kcal</span>
                <span className="text-[10px] text-zinc-500 flex items-center">
                  <span>TDEE: {liveTargets.tdee} kcal</span>
                  <InfoTooltip
                    title="Total Daily Energy Expenditure"
                    content="Your total daily calories burned, combining your resting metabolic rate (BMR) with all daily walking, occupation movement, and exercise."
                  />
                </span>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 flex items-center">
                  <span>Target Daily Protein</span>
                  <InfoTooltip
                    title="Daily Protein Target"
                    content="The estimated amount of dietary protein to consume daily for muscle repair and recovery (1.5–2.0 g/kg bodyweight based on International Society of Sports Nutrition guidelines)."
                  />
                </span>
                <span className="text-xl sm:text-2xl font-black text-gym-lime">{liveTargets.targetProteinGrams}g</span>
                <span className="text-[10px] text-zinc-500 block">~{liveTargets.proteinPerKg}g per kg bodyweight</span>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <span className="text-[11px] text-zinc-400 flex items-center">
                  <span>BMR Baseline</span>
                  <InfoTooltip
                    title="Basal Metabolic Rate (BMR)"
                    content="BMR is the estimated energy your body burns at complete rest just to maintain basic life functions (breathing, circulation, organ function). It is not the same as total daily calorie needs (TDEE)."
                  />
                </span>
                <span className="text-xl sm:text-2xl font-black text-zinc-300">{liveTargets.bmr} kcal</span>
                <span className="text-[10px] text-zinc-500 block">Resting metabolic rate</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: NIGERIAN FOOD INVENTORY & PANTRY */}
      {step === 2 && (
        <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm transition-colors">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gym-lime/15 text-gym-limeDark dark:text-gym-lime border border-gym-lime/30 uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>Pantry & Market Availability</span>
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                Your Nigerian Food Inventory
              </h2>
              <InfoTooltip
                title="Pantry Inventory Categories"
                content="In Stock items are already in your kitchen pantry; To Buy items are added to your market shopping list; Excluded items (allergies or dislikes) will never appear in your meals."
              />
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Mark items currently in your kitchen (In Stock), items you can buy at the market (To Buy), or foods you are allergic to / dislike (Exclude).
            </p>
          </div>

          {/* Search & Category Tabs */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search food by English or Nigerian name (e.g., Titus, Oloyin, Semo, Ugwu, Akara)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#141414] border border-zinc-300 dark:border-gym-border text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-gym-lime"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-200 dark:border-zinc-800 -mx-2 px-2">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all min-h-[36px] ${
                  activeCategory === 'all'
                    ? 'bg-gym-lime text-black shadow-lime-sm'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                All Foods ({NIGERIAN_FOOD_DATABASE.length})
              </button>
              {NIGERIAN_FOOD_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all min-h-[36px] ${
                    activeCategory === cat.id
                      ? 'bg-gym-lime text-black shadow-lime-sm'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-zinc-500">Quick Presets:</span>
            <button
              type="button"
              onClick={() => {
                setInventory(
                  NIGERIAN_FOOD_DATABASE.map((f) => ({
                    foodId: f.id,
                    status: 'to_buy',
                  }))
                );
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-200"
            >
              All Available in Market
            </button>
            <button
              type="button"
              onClick={() => {
                setInventory(
                  NIGERIAN_FOOD_DATABASE.map((f) => ({
                    foodId: f.id,
                    status: f.isHighProtein || f.isAffordableProtein ? 'in_stock' : 'to_buy',
                  }))
                );
              }}
              className="px-2.5 py-1 rounded-lg bg-gym-lime/15 text-gym-limeDark dark:text-gym-lime border border-gym-lime/30 font-bold"
            >
              High-Protein Staples In Stock
            </button>
          </div>

          {/* Food Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredFoods.map((item) => {
              const currentInv = inventory.find((i) => i.foodId === item.id);
              const status = currentInv?.status || 'to_buy';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                    status === 'in_stock'
                      ? 'bg-gym-lime/10 dark:bg-gym-lime/15 border-gym-lime shadow-lime-sm'
                      : status === 'excluded'
                      ? 'bg-red-500/10 border-red-500/30 opacity-60'
                      : 'bg-slate-50 dark:bg-[#121212] border-zinc-200 dark:border-gym-border'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {item.localName && (
                          <span className="text-[10px] font-black text-gym-limeDark dark:text-gym-lime block">
                            {item.localName}
                          </span>
                        )}
                        <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white leading-tight">
                          {item.name}
                        </h4>
                      </div>
                      {item.isHighProtein && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-gym-lime text-black shrink-0">
                          High Protein
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                      <span>{item.servingSize}</span>
                      <span>•</span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">{item.proteinGrams}g prot</span>
                      <span>•</span>
                      <span>{item.caloriesPerServing} kcal</span>
                    </div>
                  </div>

                  {/* 3-State Buttons: In Stock / To Buy / Exclude */}
                  <div className="grid grid-cols-3 gap-1 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    <button
                      type="button"
                      onClick={() => handleSetItemStatus(item.id, 'in_stock')}
                      className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                        status === 'in_stock'
                          ? 'bg-gym-lime text-black shadow-lime-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                      }`}
                    >
                      In Pantry
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetItemStatus(item.id, 'to_buy')}
                      className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                        status === 'to_buy'
                          ? 'bg-zinc-900 text-white dark:bg-zinc-200 dark:text-black shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                      }`}
                    >
                      To Buy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetItemStatus(item.id, 'excluded')}
                      className={`py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${
                        status === 'excluded'
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-500'
                      }`}
                    >
                      Exclude
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between gap-3 pt-4">
        {step === 2 ? (
          <button
            type="button"
            onClick={() => handleStepChange(1)}
            className="px-5 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300 font-bold text-sm border border-zinc-300 dark:border-zinc-800 flex items-center gap-2 min-h-[48px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Targets</span>
          </button>
        ) : (
          onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 font-bold text-sm min-h-[48px]"
            >
              Cancel
            </button>
          )
        )}

        {step === 1 ? (
          <button
            type="button"
            onClick={() => handleStepChange(2)}
            className="ml-auto px-7 py-3.5 rounded-2xl bg-gym-lime hover:bg-gym-limeLight text-black font-black text-sm shadow-lime-md transition-all hover:scale-105 flex items-center gap-2 min-h-[48px]"
          >
            <span>Next: Food Inventory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="ml-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-gym-lime to-gym-limeLight text-black font-black text-sm sm:text-base shadow-lime-lg transition-all hover:scale-105 flex items-center gap-2.5 disabled:opacity-50 min-h-[50px]"
          >
            <Sparkles className="w-5 h-5 fill-black" />
            <span>{isGenerating ? 'Building 7-Day Plan...' : 'Generate 7-Day Meal Plan'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
