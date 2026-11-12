'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Mars, Utensils, Venus } from 'lucide-react';
import { InventoryItemStatus, MealPlanProfile, UserInventoryItem, WeeklyMealPlan } from '@/types/mealPlanner';
import { NIGERIAN_FOOD_DATABASE } from '@/data/nigerianFoods';
import { calculateNutritionTargets } from '@/engine/mealPlanner/nutritionCalculator';
import { generateWeeklyMealPlan } from '@/engine/mealPlanner/mealPlanGenerator';
import { loadActiveProgram, loadSavedProfile } from '@/lib/storage';
import { toast } from '@/components/ui/Toaster';
import { FlowShell, FlowTitle } from '@/components/flow/FlowShell';
import { ChoiceRow, ChoiceTile, FlowButton, GroupLabel, Segmented } from '@/components/flow/controls';
import { RulerPicker, WheelPicker } from '@/components/flow/pickers';
import { BuildingView, ResultPanel } from '@/components/flow/BuildingView';
import {
  activityForDays,
  ActivityLevel,
  AGE_MAX,
  AGE_MIN,
  mealGoalFor,
  MealGoal,
  yearsFromProfile,
} from '@/components/questionnaire/profileHelpers';
import { KitchenStep, statusOf } from './KitchenStep';

type StepId = 'sex' | 'age' | 'goal' | 'weight' | 'height' | 'activity' | 'eating' | 'kitchen';
const DETAIL_STEPS: StepId[] = ['sex', 'age', 'goal'];
const BODY_STEPS: StepId[] = ['weight', 'height', 'activity', 'eating', 'kitchen'];

const PHOTO: Record<StepId | 'done', string> = {
  sex: '/images/meal-prep-healthy.jpg',
  age: '/images/meal-prep-healthy.jpg',
  goal: '/images/meal-prep-healthy.jpg',
  weight: '/images/meal-prep-healthy.jpg',
  height: '/images/meal-prep-healthy.jpg',
  activity: '/images/meals/l1_jollof_chicken_breast.jpg',
  eating: '/images/meals/l1_jollof_chicken_breast.jpg',
  kitchen: '/images/meals/d2_semo_egusi_chicken_breast.jpg',
  done: '/images/meal-prep-healthy.jpg',
};

const GOALS: { value: MealGoal; label: string; sub: string }[] = [
  { value: 'muscle_building', label: 'Build muscle', sub: 'Eat a little more than you burn' },
  { value: 'fat_loss', label: 'Lose fat', sub: 'Eat a little less, keep protein high' },
  { value: 'strength', label: 'Get stronger', sub: 'Enough fuel for heavy training' },
  { value: 'maintain', label: 'Stay as I am', sub: 'Eat about what you burn' },
];

const ACTIVITY: { value: ActivityLevel; label: string; sub: string }[] = [
  { value: 'sedentary', label: 'Mostly sitting', sub: 'Desk job, little movement' },
  { value: 'light', label: 'Lightly active', sub: '1 to 2 workouts a week' },
  { value: 'moderate', label: 'Active', sub: '3 to 4 workouts a week' },
  { value: 'very_active', label: 'Very active', sub: '5 or more hard sessions a week' },
];

const BUDGETS: { value: MealPlanProfile['budgetLevel']; label: string }[] = [
  { value: 'budget', label: 'Tight' },
  { value: 'moderate', label: 'Balanced' },
  { value: 'flexible', label: 'Flexible' },
];

const LB_PER_KG = 2.20462;
const AGES = Array.from({ length: AGE_MAX - AGE_MIN + 1 }, (_, i) => AGE_MIN + i);
const HEIGHTS_CM = Array.from({ length: 81 }, (_, i) => 140 + i); // 140 to 220
const HEIGHTS_IN = Array.from({ length: 33 }, (_, i) => 55 + i); // 4'7" to 7'3"
const feet = (inches: number) => `${Math.floor(inches / 12)}′${inches % 12}″`;

function defaultInventory(): UserInventoryItem[] {
  return NIGERIAN_FOOD_DATABASE.map((f) => ({
    foodId: f.id,
    status: ['white_rice', 'garri_eba', 'chicken_egg', 'palm_oil', 'tomato_stew'].includes(f.id) ? 'in_stock' : 'to_buy',
  }));
}

interface MealPlannerFlowProps {
  /** The profile of the current meal plan, if there is one */
  initialProfile?: MealPlanProfile;
  initialInventory?: UserInventoryItem[];
  onComplete: (plan: WeeklyMealPlan, inventory: UserInventoryItem[]) => void;
  onClose: () => void;
}

/**
 * The meal plan questions, one per screen. Rendered only after hydration (the page waits for
 * localStorage), so the initial state can read saved data directly.
 */
export function MealPlannerFlow({ initialProfile, initialInventory = [], onComplete, onClose }: MealPlannerFlowProps) {
  // Where sex, age and goal come from: the last meal plan, else the workout answers, else ask
  const [seed] = useState(() => {
    if (initialProfile) return { source: 'meal' as const, gender: initialProfile.gender, age: initialProfile.age, goal: initialProfile.goal };
    const workout = loadSavedProfile();
    if (workout?.gender && workout.age && workout.goal) {
      return { source: 'program' as const, gender: workout.gender, age: yearsFromProfile(workout), goal: mealGoalFor(workout.goal) };
    }
    return { source: null, gender: 'male' as const, age: 26, goal: 'muscle_building' as MealGoal };
  });
  // A first guess at activity from the training days, only for a first meal plan
  const [suggested] = useState<{ activity: ActivityLevel; days: number } | null>(() => {
    if (initialProfile) return null;
    const days = loadActiveProgram()?.days.length;
    return days ? { activity: activityForDays(days), days } : null;
  });

  const [askDetails, setAskDetails] = useState(seed.source === null);
  const [gender, setGender] = useState<'male' | 'female'>(seed.gender);
  const [age, setAge] = useState(seed.age);
  const [goal, setGoal] = useState<MealGoal>(seed.goal);
  const [weightKg, setWeightKg] = useState(initialProfile?.weightKg ?? (seed.gender === 'female' ? 65 : 74));
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [heightCm, setHeightCm] = useState(initialProfile?.heightCm ?? (seed.gender === 'female' ? 163 : 175));
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [activity, setActivity] = useState<ActivityLevel>(initialProfile?.activityLevel ?? suggested?.activity ?? 'moderate');
  const [mealsPerDay, setMealsPerDay] = useState<3 | 4>(initialProfile?.mealsPerDay ?? 4);
  const [budget, setBudget] = useState<MealPlanProfile['budgetLevel']>(initialProfile?.budgetLevel ?? 'moderate');
  const [inventory, setInventory] = useState<UserInventoryItem[]>(() =>
    initialInventory.length > 0 ? initialInventory : defaultInventory()
  );

  const steps = askDetails ? [...DETAIL_STEPS, ...BODY_STEPS] : BODY_STEPS;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [phase, setPhase] = useState<'questions' | 'building' | 'ready'>('questions');
  const [plan, setPlan] = useState<WeeklyMealPlan | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const step = steps[Math.min(index, steps.length - 1)];
  const isLast = index === steps.length - 1;

  const targets = useMemo(
    () => calculateNutritionTargets(gender, age, weightKg, activity, goal, heightCm),
    [gender, age, weightKg, activity, goal, heightCm]
  );

  const goTo = (to: number) => {
    window.clearTimeout(timer.current);
    setDirection(to > index ? 1 : -1);
    setIndex(to);
  };
  const autoNext = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setDirection(1);
      setIndex((i) => Math.min(i + 1, steps.length - 1));
    }, 300);
  };

  const setStatus = (foodId: string, status: InventoryItemStatus) =>
    setInventory((prev) =>
      prev.some((i) => i.foodId === foodId)
        ? prev.map((i) => (i.foodId === foodId ? { ...i, status } : i))
        : [...prev, { foodId, status }]
    );

  const build = () => {
    window.clearTimeout(timer.current);
    const profile: MealPlanProfile = {
      gender,
      age,
      weightKg,
      heightCm,
      activityLevel: activity,
      goal,
      mealsPerDay,
      budgetLevel: budget,
      targetCalories: targets.targetCalories,
      targetProteinGrams: targets.targetProteinGrams,
    };
    try {
      setPlan(generateWeeklyMealPlan(profile, inventory));
      setDirection(1);
      setPhase('building');
    } catch (err) {
      console.error('Failed to generate meal plan:', err);
      toast("Couldn't build the meal plan. Try marking more foods as Have or Buy.");
    }
  };

  const excluded = NIGERIAN_FOOD_DATABASE.filter((f) => statusOf(inventory, f.id) === 'excluded');
  const toBuy = NIGERIAN_FOOD_DATABASE.filter((f) => statusOf(inventory, f.id) === 'to_buy').length;
  const kitchenSummary = [`${toBuy} on your shopping list`, excluded.length ? `${excluded.length} left out` : ''].filter(Boolean).join(' · ');

  const buildingLines = [
    `${targets.targetCalories.toLocaleString('en-GB')} calories a day`,
    `${targets.targetProteinGrams} g of protein a day`,
    excluded.length === 0
      ? 'Using the food you marked'
      : excluded.length === 1
      ? `Leaving out ${excluded[0].name.toLowerCase()}`
      : `Leaving out ${excluded.length} foods`,
  ];

  const building = phase === 'building' && plan !== null;
  const ready = phase === 'ready' && plan !== null;
  const questions = !building && !ready;

  const detailsLine = `${gender === 'male' ? 'Male' : 'Female'} · ${age} · ${GOALS.find((g) => g.value === goal)?.label}`;

  return (
    <FlowShell
      label="Plan your meals"
      photo={questions ? PHOTO[step] : PHOTO.done}
      shade={building ? 'blur' : ready ? 'result' : 'question'}
      screenKey={building ? 'building' : ready ? 'ready' : step}
      direction={direction}
      step={questions ? index + 1 : undefined}
      total={questions ? steps.length : undefined}
      onBack={
        ready
          ? () => {
              setDirection(-1);
              setPhase('questions');
            }
          : questions && index > 0
          ? () => goTo(index - 1)
          : undefined
      }
      onClose={questions && index === 0 ? onClose : undefined}
      footer={
        questions ? (
          <div className="space-y-3">
            {step === 'kitchen' && (
              <p className="text-center text-[13px] font-semibold text-gym-textMuted" aria-live="polite">
                {kitchenSummary}
              </p>
            )}
            <FlowButton onClick={isLast ? build : () => goTo(index + 1)}>{isLast ? 'Build my meal plan' : 'Continue'}</FlowButton>
          </div>
        ) : undefined
      }
    >
      {building && (
        <BuildingView
          title="Planning your week"
          icon={<Utensils className="h-11 w-11" strokeWidth={2.2} />}
          lines={buildingLines}
          onDone={() => setPhase('ready')}
        />
      )}

      {ready && plan && (
        <ResultPanel>
          <p className="text-[13px] font-semibold text-gym-lime">Your daily target</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="glass-inset space-y-1 rounded-[26px] p-[18px]">
              <p className="text-[34px] font-bold leading-none tracking-[-0.04em] tabular-nums text-gym-text">
                {plan.profile.targetCalories.toLocaleString('en-GB')}
              </p>
              <p className="text-[13px] text-gym-textMuted">calories</p>
            </div>
            <div className="glass-inset space-y-1 rounded-[26px] p-[18px]">
              <p className="text-[34px] font-bold leading-none tracking-[-0.04em] tabular-nums text-gym-lime">
                {plan.profile.targetProteinGrams} g
              </p>
              <p className="text-[13px] text-gym-textMuted">protein</p>
            </div>
          </div>
          <p className="text-[15px] leading-relaxed text-gym-text">
            Seven days of meals, built from the food you marked.
          </p>
          <FlowButton onClick={() => onComplete(plan, inventory)}>See my week</FlowButton>
        </ResultPanel>
      )}

      {questions && step === 'sex' && (
        <>
          <FlowTitle title="What's your sex?" sub="It changes how many calories you burn." />
          <div role="radiogroup" aria-label="Sex" className="grid grid-cols-2 gap-4">
            {(['male', 'female'] as const).map((g) => (
              <ChoiceTile
                key={g}
                centered
                className="h-[212px]"
                selected={gender === g}
                onSelect={() => {
                  setGender(g);
                  autoNext();
                }}
                label={g === 'male' ? 'Male' : 'Female'}
                icon={g === 'male' ? <Mars className="h-10 w-10" strokeWidth={2} /> : <Venus className="h-10 w-10" strokeWidth={2} />}
              />
            ))}
          </div>
        </>
      )}

      {questions && step === 'age' && (
        <>
          <FlowTitle title="How old are you?" sub="Your body burns a little less each decade." />
          <div className="glass rounded-[40px] py-6">
            <WheelPicker values={AGES} value={age} onChange={setAge} label="Age" unit="years" />
          </div>
        </>
      )}

      {questions && step === 'goal' && (
        <>
          <FlowTitle title="What are you eating for?" />
          <div role="radiogroup" aria-label="Goal" className="flex flex-col gap-2.5">
            {GOALS.map((g) => (
              <ChoiceRow
                key={g.value}
                selected={goal === g.value}
                onSelect={() => {
                  setGoal(g.value);
                  autoNext();
                }}
                label={g.label}
                sub={g.sub}
              />
            ))}
          </div>
        </>
      )}

      {questions && step === 'weight' && (
        <>
          <FlowTitle title="What do you weigh?" sub="It sets your calories and protein." />
          {!askDetails && (
            <div className="glass-inset mb-4 flex min-h-[60px] items-center gap-3 rounded-full border border-white/15 py-2 pl-5 pr-2">
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-gym-textMuted">
                  {seed.source === 'meal' ? 'Your details' : 'From your program'}
                </span>
                <span className="block truncate text-sm font-semibold text-gym-text">{detailsLine}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setAskDetails(true);
                  setDirection(-1);
                  setIndex(0);
                }}
                className="tap h-11 rounded-full bg-white/15 px-4 text-sm font-semibold text-gym-lime"
              >
                Edit
              </button>
            </div>
          )}
          <div className="glass flex flex-col items-center gap-5 overflow-hidden rounded-[40px] px-4 py-7">
            <div className="w-44">
              <Segmented
                id="weight-unit"
                size="sm"
                label="Weight unit"
                options={[
                  { value: 'kg', label: 'kg' },
                  { value: 'lb', label: 'lb' },
                ]}
                value={weightUnit}
                onChange={setWeightUnit}
              />
            </div>
            {weightUnit === 'kg' ? (
              <RulerPicker key="kg" min={35} max={200} value={Math.round(weightKg)} onChange={setWeightKg} label="Weight" unit="kg" />
            ) : (
              <RulerPicker
                key="lb"
                min={77}
                max={440}
                value={Math.round(weightKg * LB_PER_KG)}
                onChange={(lb) => setWeightKg(Math.round((lb / LB_PER_KG) * 10) / 10)}
                label="Weight"
                unit="lb"
              />
            )}
          </div>
        </>
      )}

      {questions && step === 'height' && (
        <>
          <FlowTitle title="How tall are you?" sub="Height sharpens the calorie estimate." />
          <div className="glass flex flex-col items-center gap-3 rounded-[40px] px-4 py-6">
            <div className="w-44">
              <Segmented
                id="height-unit"
                size="sm"
                label="Height unit"
                options={[
                  { value: 'cm', label: 'cm' },
                  { value: 'ft', label: 'ft' },
                ]}
                value={heightUnit}
                onChange={setHeightUnit}
              />
            </div>
            <div className="w-full">
              {heightUnit === 'cm' ? (
                <WheelPicker key="cm" values={HEIGHTS_CM} value={Math.round(heightCm)} onChange={setHeightCm} label="Height" unit="cm" />
              ) : (
                <WheelPicker
                  key="ft"
                  values={HEIGHTS_IN}
                  value={Math.min(87, Math.max(55, Math.round(heightCm / 2.54)))}
                  onChange={(inches) => setHeightCm(Math.round(inches * 2.54))}
                  format={feet}
                  label="Height"
                />
              )}
            </div>
          </div>
        </>
      )}

      {questions && step === 'activity' && (
        <>
          <FlowTitle title="How active is your week?" sub="Count work and daily life, not just the gym." />
          <div role="radiogroup" aria-label="Activity" className="flex flex-col gap-2.5">
            {ACTIVITY.map((a) => (
              <ChoiceRow
                key={a.value}
                selected={activity === a.value}
                onSelect={() => {
                  setActivity(a.value);
                  autoNext();
                }}
                label={a.label}
                sub={a.sub}
              />
            ))}
          </div>
          {suggested && activity === suggested.activity && (
            <p className="flex items-center gap-2 px-2 pt-5 text-[13px] text-gym-textMuted">
              <span className="size-2 shrink-0 rounded-full bg-gym-lime" />
              Picked from your {suggested.days}-day program. Change it if it&apos;s off.
            </p>
          )}
        </>
      )}

      {questions && step === 'eating' && (
        <>
          <FlowTitle title="How do you like to eat?" />
          <GroupLabel>Meals a day</GroupLabel>
          <div role="radiogroup" aria-label="Meals a day" className="grid grid-cols-2 gap-3">
            <ChoiceTile className="h-[132px]" selected={mealsPerDay === 3} onSelect={() => setMealsPerDay(3)} big="3" sub="Breakfast, lunch and dinner" />
            <ChoiceTile className="h-[132px]" selected={mealsPerDay === 4} onSelect={() => setMealsPerDay(4)} big="3 + 1" sub="Three meals and a snack" />
          </div>
          <div className="pt-7">
            <GroupLabel>Food budget</GroupLabel>
            <Segmented id="budget" label="Food budget" options={BUDGETS} value={budget} onChange={setBudget} />
          </div>
        </>
      )}

      {questions && step === 'kitchen' && <KitchenStep inventory={inventory} onChange={setStatus} />}
    </FlowShell>
  );
}
