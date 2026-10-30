'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserProfile,
  Gender,
  AgeCategory,
  ExperienceLevel,
  FitnessGoal,
  TrainingFrequency,
  WorkoutDuration,
  GoalCategory,
} from '@/types/questionnaire';
import { InjuryArea, MuscleGroup } from '@/types/workout';
import { SyndiqEquipmentId, EquipmentCategory } from '@/types/equipment';
import {
  GENDER_OPTIONS,
  AGE_OPTIONS,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  FREQUENCY_OPTIONS,
  DURATION_OPTIONS,
  INJURY_OPTIONS,
  isGoalContradictory,
} from '@/data/questionnaireOptions';
import {
  EQUIPMENT_LIBRARY,
  EQUIPMENT_CATEGORIES,
  STANDARD_COMMERCIAL_GYM_IDS,
  HOME_GYM_DUMBBELLS_IDS,
  ALL_SYNDIQ_EQUIPMENT_IDS,
} from '@/data/equipment';
import { generateWorkoutProgram } from '@/engine/programAssembler';
import { saveActiveProgram, loadSavedProfile } from '@/lib/storage';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Dumbbell,
  Clock,
  ShieldAlert,
  Sparkles,
  Zap,
  Target,
  Flame,
  Award,
  AlertCircle,
  Search,
  Building2,
  Home,
  RotateCcw,
  Info,
  CheckSquare,
  Square,
  X,
  Layers,
  Cpu,
  Activity,
  Shield,
} from 'lucide-react';

export function QuestionnaireWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;

  // Questionnaire form state
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<AgeCategory>('21-30');
  const [experience, setExperience] = useState<ExperienceLevel>('beginner');
  const [goalCategory, setGoalCategory] = useState<GoalCategory | 'all'>('all');
  const [goal, setGoal] = useState<FitnessGoal>('muscle_building');
  const [secondaryGoals, setSecondaryGoals] = useState<FitnessGoal[]>([]);
  const [frequency, setFrequency] = useState<TrainingFrequency>('recommend');
  const [duration, setDuration] = useState<WorkoutDuration>(60);
  const [equipment, setEquipment] = useState<SyndiqEquipmentId[]>(STANDARD_COMMERCIAL_GYM_IDS);
  const [selectedEquipmentCategory, setSelectedEquipmentCategory] = useState<EquipmentCategory | 'all'>('all');
  const [equipmentSearchQuery, setEquipmentSearchQuery] = useState('');
  const [injuries, setInjuries] = useState<InjuryArea[]>(['none']);
  const [injuryNotes, setInjuryNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Pre-fill questionnaire from previously saved profile if available
  useEffect(() => {
    const saved = loadSavedProfile();
    if (saved) {
      if (saved.gender) setGender(saved.gender);
      if (saved.age) setAge(saved.age);
      if (saved.experience) setExperience(saved.experience);
      if (saved.goal) setGoal(saved.goal);
      if (saved.secondaryGoals && saved.secondaryGoals.length > 0) setSecondaryGoals(saved.secondaryGoals);
      if (saved.frequency) setFrequency(saved.frequency);
      if (saved.duration) setDuration(saved.duration);
      if (saved.availableEquipment && saved.availableEquipment.length > 0) setEquipment(saved.availableEquipment);
      if (saved.injuries && saved.injuries.length > 0) setInjuries(saved.injuries);
      if (saved.injuryNotes) setInjuryNotes(saved.injuryNotes);
    }
  }, []);

  // Toggle injury selection
  const handleToggleInjury = (id: InjuryArea) => {
    if (id === 'none') {
      setInjuries(['none']);
      return;
    }
    const currentWithoutNone = injuries.filter((i) => i !== 'none');
    if (currentWithoutNone.includes(id)) {
      const next = currentWithoutNone.filter((i) => i !== id);
      setInjuries(next.length === 0 ? ['none'] : next);
    } else {
      setInjuries([...currentWithoutNone, id]);
    }
  };

  // Toggle equipment item
  const handleToggleEquipment = (id: SyndiqEquipmentId) => {
    if (equipment.includes(id)) {
      setEquipment(equipment.filter((e) => e !== id));
    } else {
      setEquipment([...equipment, id]);
    }
  };

  const handleApplyPreset = (preset: 'commercial' | 'home' | 'all' | 'clear') => {
    switch (preset) {
      case 'commercial':
        setEquipment(STANDARD_COMMERCIAL_GYM_IDS);
        break;
      case 'home':
        setEquipment(HOME_GYM_DUMBBELLS_IDS);
        break;
      case 'all':
        setEquipment(ALL_SYNDIQ_EQUIPMENT_IDS);
        break;
      case 'clear':
        setEquipment([]);
        break;
    }
  };

  const filteredEquipment = useMemo(() => {
    return EQUIPMENT_LIBRARY.filter((item) => {
      if (selectedEquipmentCategory !== 'all' && item.category !== selectedEquipmentCategory) {
        return false;
      }
      if (equipmentSearchQuery.trim()) {
        const q = equipmentSearchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesAlias = item.aliases?.some((a) => a.toLowerCase().includes(q));
        return matchesName || matchesDesc || matchesAlias;
      }
      return true;
    });
  }, [selectedEquipmentCategory, equipmentSearchQuery]);

  const categoryItemIds = useMemo(() => {
    if (selectedEquipmentCategory === 'all') return [];
    return EQUIPMENT_LIBRARY.filter((item) => item.category === selectedEquipmentCategory).map((i) => i.id);
  }, [selectedEquipmentCategory]);

  const areAllInCategorySelected =
    categoryItemIds.length > 0 && categoryItemIds.every((id) => equipment.includes(id));

  const handleToggleCategoryAll = () => {
    if (areAllInCategorySelected) {
      setEquipment(equipment.filter((id) => !categoryItemIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...equipment, ...categoryItemIds]));
      setEquipment(merged);
    }
  };

  // Submission handler
  const handleGenerate = () => {
    setIsGenerating(true);
    const profile: UserProfile = {
      gender,
      age,
      experience,
      goal,
      secondaryGoals: secondaryGoals.length > 0 ? secondaryGoals : undefined,
      frequency,
      duration,
      availableEquipment: equipment,
      injuries,
      injuryNotes: injuryNotes.trim() ? injuryNotes.trim() : undefined,
    };

    try {
      const program = generateWorkoutProgram(profile);
      saveActiveProgram(program);
      router.push('/program');
    } catch (err) {
      console.error('Failed to generate program:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Progress Bar & Step Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5 text-gym-limeDark dark:text-gym-lime">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step {currentStep} of {totalSteps}</span>
          </span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="w-full h-2 bg-zinc-200 dark:bg-[#18181b] rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-gym-lime to-gym-limeLight transition-all duration-500 shadow-lime-sm"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: SEX / GENDER */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm transition-colors">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">What is your sex?</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Helps Syndiq fit calibrate baseline volume ratios and split balancing while ensuring access to full-body strength training.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {GENDER_OPTIONS.map((opt) => {
              const isSelected = gender === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => setGender(opt.value)}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gym-lime/10 dark:bg-[#18181b] border-gym-lime shadow-lime-md'
                      : 'bg-slate-50 dark:bg-[#121212] border-zinc-200 dark:border-gym-border hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-slate-100 dark:hover:bg-[#161616]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-black text-zinc-900 dark:text-white">{opt.label}</span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                        isSelected
                          ? 'bg-gym-lime border-gym-lime text-black'
                          : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{opt.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: AGE */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm transition-colors">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">What is your age bracket?</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Age influences joint loading, recovery intervals, rest periods, and warm-up recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {AGE_OPTIONS.map((opt) => {
              const isSelected = age === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => setAge(opt.value)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gym-lime/10 dark:bg-[#18181b] border-gym-lime shadow-lime-sm'
                      : 'bg-slate-50 dark:bg-[#121212] border-zinc-200 dark:border-gym-border hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-slate-100 dark:hover:bg-[#161616]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base font-bold text-zinc-900 dark:text-white">{opt.label}</span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isSelected
                          ? 'bg-gym-lime border-gym-lime text-black'
                          : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{opt.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: EXPERIENCE LEVEL */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm transition-colors">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">What is your lifting experience?</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Determines exercise complexity, rep schemes, and technical intensity (e.g., machine focus vs heavy barbell compounds).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2">
            {EXPERIENCE_OPTIONS.map((opt) => {
              const isSelected = experience === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => setExperience(opt.value)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gym-lime/10 dark:bg-[#18181b] border-gym-lime shadow-lime-sm'
                      : 'bg-slate-50 dark:bg-[#121212] border-zinc-200 dark:border-gym-border hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-slate-100 dark:hover:bg-[#161616]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-extrabold text-zinc-900 dark:text-white">{opt.label}</span>
                      {opt.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gym-lime/15 text-gym-limeDark dark:text-gym-lime border border-gym-lime/30">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isSelected
                          ? 'bg-gym-lime border-gym-lime text-black'
                          : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{opt.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: PRIMARY FITNESS GOAL & SECONDARY PRIORITIES */}
      {currentStep === 4 && (
        <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm transition-colors">
          {/* Primary Goal Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gym-lime/15 text-gym-limeDark dark:text-gym-lime border border-gym-lime/30 uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              <span>Primary Objective (Single Selection)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">What is your primary goal?</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              The engine weights volume, exercise sequencing, and intensity zones to center your program around this single core priority.
            </p>
          </div>

          {/* Goal Category Tabs - Includes 'All' as default */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <span>Filter by category or explore all:</span>
              <span className="hidden sm:inline-block text-[11px] text-zinc-400">Scroll horizontally for more &rarr;</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-200 dark:border-zinc-800 -mx-2 px-2">
              {(
                [
                  { id: 'all' as const, label: 'All Goals', count: GOAL_OPTIONS.length },
                  { id: 'body_composition' as const, label: 'Body Comp', count: GOAL_OPTIONS.filter((g) => g.category === 'body_composition').length },
                  { id: 'strength' as const, label: 'Strength', count: GOAL_OPTIONS.filter((g) => g.category === 'strength').length },
                  { id: 'specific_emphasis' as const, label: 'Muscle Focus', count: GOAL_OPTIONS.filter((g) => g.category === 'specific_emphasis').length },
                  { id: 'general' as const, label: 'General / Health', count: GOAL_OPTIONS.filter((g) => g.category === 'general').length },
                ]
              ).map((cat) => {
                const isActive = goalCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setGoalCategory(cat.id)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[40px] shrink-0 ${
                      isActive
                        ? 'bg-gym-lime text-black shadow-lime-sm font-extrabold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-black/20 text-black' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Goals Grid */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(goalCategory === 'all' ? GOAL_OPTIONS : GOAL_OPTIONS.filter((g) => g.category === goalCategory)).map((opt) => {
                const isSelected = goal === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setGoal(opt.id);
                      // Remove newly selected primary goal from secondary goals
                      const updatedSec = secondaryGoals.filter((g) => g !== opt.id);
                      // Filter out any secondary goal that contradicts the new primary goal
                      const validSec = updatedSec.filter((g) => !isGoalContradictory(opt.id, g).isContradictory);
                      setSecondaryGoals(validSec);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gym-lime/10 dark:bg-[#18181b] border-gym-lime shadow-lime-sm ring-1 ring-gym-lime'
                        : 'bg-slate-50 dark:bg-[#121212] border-zinc-200 dark:border-gym-border hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-slate-100 dark:hover:bg-[#161616]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">{opt.label}</span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-gym-lime border-gym-lime text-black'
                              : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-2">{opt.description}</p>
                    </div>
                    {goalCategory === 'all' && (
                      <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          {opt.category.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECONDARY PRIORITIES SECTION */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  <Sparkles className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime" />
                  <span>Secondary Priorities (Optional)</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Complementary training objectives woven into accessory slots and movement variations without diluting your primary focus.
                </p>
              </div>

              {secondaryGoals.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSecondaryGoals([])}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear ({secondaryGoals.length})</span>
                </button>
              )}
            </div>

            {/* Notice if no secondary goals selected */}
            {secondaryGoals.length === 0 && (
              <div className="p-3.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>No secondary priorities selected. You can pick below or skip to continue with pure primary goal programming.</span>
              </div>
            )}

            {/* Secondary Goals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {GOAL_OPTIONS.map((opt) => {
                const isPrimary = goal === opt.id;
                const contradiction = isGoalContradictory(goal, opt.id);
                const isDisabled = isPrimary || contradiction.isContradictory;
                const isSelected = secondaryGoals.includes(opt.id);

                return (
                  <div
                    key={`sec-${opt.id}`}
                    onClick={() => {
                      if (isDisabled) return;
                      if (isSelected) {
                        setSecondaryGoals(secondaryGoals.filter((g) => g !== opt.id));
                      } else {
                        setSecondaryGoals([...secondaryGoals, opt.id]);
                      }
                    }}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      isDisabled
                        ? 'opacity-40 cursor-not-allowed bg-zinc-100/50 dark:bg-zinc-900/30 border-dashed border-zinc-200 dark:border-zinc-800'
                        : isSelected
                        ? 'bg-gym-lime/10 dark:bg-[#18181b] border-gym-lime shadow-lime-sm cursor-pointer'
                        : 'bg-slate-50 dark:bg-[#121212] border-zinc-200 dark:border-gym-border hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold leading-tight ${isDisabled ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>
                          {opt.label}
                        </span>
                        {isPrimary && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                            Primary
                          </span>
                        )}
                      </div>
                      {contradiction.isContradictory && !isPrimary && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium block leading-tight">
                          {contradiction.reason}
                        </span>
                      )}
                      {!contradiction.isContradictory && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-tight">
                          {opt.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 mt-0.5">
                      {isDisabled ? (
                        <div className="w-4 h-4 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 opacity-50" />
                      ) : isSelected ? (
                        <div className="w-4 h-4 rounded bg-gym-lime border border-gym-lime flex items-center justify-center text-black">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: TRAINING FREQUENCY */}
      {currentStep === 5 && (
        <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm transition-colors">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">How many days can you train per week?</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Select your weekly availability or choose "Recommend for me" to let Syndiq fit choose the ideal split.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {FREQUENCY_OPTIONS.map((opt) => {
              const isSelected = frequency === opt.value;
              return (
                <div
                  key={String(opt.value)}
                  onClick={() => setFrequency(opt.value)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gym-lime/10 dark:bg-[#18181b] border-gym-lime shadow-lime-sm'
                      : 'bg-slate-50 dark:bg-[#121212] border-zinc-200 dark:border-gym-border hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-slate-100 dark:hover:bg-[#161616]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-zinc-900 dark:text-white">{opt.label}</span>
                      {opt.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gym-lime/15 text-gym-limeDark dark:text-gym-lime border border-gym-lime/30">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                        isSelected
                          ? 'bg-gym-lime border-gym-lime text-black'
                          : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{opt.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 6: SESSION DURATION */}
      {currentStep === 6 && (
        <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm transition-colors">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">How much time do you have per workout?</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Duration dynamically determines how many exercises and sets are programmed so your workout realistically fits your schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2">
            {DURATION_OPTIONS.map((opt) => {
              const isSelected = duration === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gym-lime/10 dark:bg-[#18181b] border-gym-lime shadow-lime-sm'
                      : 'bg-slate-50 dark:bg-[#121212] border-zinc-200 dark:border-gym-border hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-slate-100 dark:hover:bg-[#161616]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base font-bold text-zinc-900 dark:text-white">{opt.label}</span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                        isSelected
                          ? 'bg-gym-lime border-gym-lime text-black'
                          : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{opt.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 7: EQUIPMENT SELECTOR */}
      {currentStep === 7 && (
        <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm transition-colors">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">What equipment do you have access to?</h2>
              <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-extrabold bg-gym-lime/15 text-gym-limeDark dark:text-gym-lime border border-gym-lime/30 shrink-0">
                {equipment.length} Pieces Selected
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <strong>Workouts tailored to your gym.</strong> Every gym has different equipment. Syndiq Fit lets you select the equipment available to you and generates workout programs tailored to your goals, experience, available equipment, and training time.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Quick Setup Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('commercial')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-gym-border hover:border-gym-lime text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-gym-lime transition-all text-center min-h-[44px]"
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>Commercial Gym</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('home')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-gym-border hover:border-gym-lime text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-gym-lime transition-all text-center min-h-[44px]"
              >
                <Home className="w-3.5 h-3.5 shrink-0" />
                <span>Home Dumbbells</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('all')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-gym-border hover:border-gym-lime text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-gym-lime transition-all text-center min-h-[44px]"
              >
                <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                <span>Select All ({ALL_SYNDIQ_EQUIPMENT_IDS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('clear')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-gym-border hover:border-red-500 hover:text-red-500 text-xs font-bold text-zinc-600 dark:text-zinc-400 transition-all text-center min-h-[44px]"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Search Bar & Category Filter Tabs */}
          <div className="space-y-3 pt-1">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={equipmentSearchQuery}
                onChange={(e) => setEquipmentSearchQuery(e.target.value)}
                placeholder="Search equipment by name or alias (e.g. barbell, cables, leg press, lat pulldown)..."
                className="w-full bg-white dark:bg-zinc-900/90 border border-zinc-300 dark:border-gym-border rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gym-lime"
              />
              {equipmentSearchQuery && (
                <button
                  type="button"
                  onClick={() => setEquipmentSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => setSelectedEquipmentCategory('all')}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 min-h-[36px] ${
                  selectedEquipmentCategory === 'all'
                    ? 'bg-gym-lime text-black font-extrabold shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-gym-border'
                }`}
              >
                <span>All Equipment</span>
                <span className="text-[10px] opacity-80">({EQUIPMENT_LIBRARY.length})</span>
              </button>
              {EQUIPMENT_CATEGORIES.map((cat) => {
                const countSelected = EQUIPMENT_LIBRARY.filter(
                  (item) => item.category === cat.id && equipment.includes(item.id)
                ).length;
                const totalInCat = EQUIPMENT_LIBRARY.filter((item) => item.category === cat.id).length;
                const isActive = selectedEquipmentCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedEquipmentCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 min-h-[36px] ${
                      isActive
                        ? 'bg-gym-lime text-black font-extrabold shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-gym-border'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[10px] opacity-75">
                      ({countSelected}/{totalInCat})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Bulk Action */}
          {selectedEquipmentCategory !== 'all' && (
            <div className="flex items-center justify-between px-1 text-xs">
              <span className="text-zinc-600 dark:text-zinc-400">
                Category:{' '}
                <strong className="text-zinc-900 dark:text-white">
                  {EQUIPMENT_CATEGORIES.find((c) => c.id === selectedEquipmentCategory)?.label}
                </strong>
              </span>
              <button
                type="button"
                onClick={handleToggleCategoryAll}
                className="text-gym-limeDark dark:text-gym-lime hover:underline font-bold"
              >
                {areAllInCategorySelected ? 'Deselect all in category' : 'Select all in category'}
              </button>
            </div>
          )}

          {/* Equipment Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[46vh] overflow-y-auto pr-1">
            {filteredEquipment.length === 0 ? (
              <div className="col-span-full py-8 text-center space-y-2">
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                  No equipment matching &quot;{equipmentSearchQuery}&quot;
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEquipmentSearchQuery('');
                    setSelectedEquipmentCategory('all');
                  }}
                  className="text-xs font-bold text-gym-limeDark dark:text-gym-lime hover:underline"
                >
                  Clear search and reset filters
                </button>
              </div>
            ) : (
              filteredEquipment.map((item) => {
                const isChecked = equipment.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleEquipment(item.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                      isChecked
                        ? 'bg-gym-lime/10 dark:bg-[#18181b] border-gym-lime/70 shadow-lime-sm'
                        : 'bg-slate-50 dark:bg-[#121212] border-zinc-200 dark:border-gym-border hover:border-zinc-300 dark:hover:border-zinc-700 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white block leading-snug">
                          {item.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-gym-limeDark dark:text-gym-lime tracking-wider">
                          {EQUIPMENT_CATEGORIES.find((c) => c.id === item.category)?.label}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-gym-lime border-gym-lime text-black'
                            : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>

                    {item.aliases && item.aliases.length > 0 && (
                      <span className="text-[10px] text-zinc-500 italic">
                        Also known as: {item.aliases.slice(0, 3).join(', ')}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Beginner Guidance Notice */}
          <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-gym-border flex items-start gap-3 text-xs text-zinc-600 dark:text-zinc-400">
            <Info className="w-4 h-4 text-gym-limeDark dark:text-gym-lime shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-zinc-900 dark:text-zinc-200">Can&apos;t recognise an item?</strong> Skip it and continue. Syndiq Fit will only prescribe exercises matching equipment you confirm. You can also pick bodyweight-only if you have no gym access.
            </p>
          </div>
        </div>
      )}

      {/* STEP 8: INJURIES, LIMITATIONS & REVIEW */}
      {currentStep === 8 && (
        <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm transition-colors">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">Any injuries or joint limitations?</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Select any areas requiring caution. Contraindicated movements will automatically be replaced with joint-safe alternatives.
            </p>
          </div>

          {/* Medical Disclaimer Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Medical Disclaimer:</strong> Syndiq fit provides fitness programming for healthy individuals. If you have acute pain, recent surgery, or a clinical spinal condition, consult a physician or physical therapist before exercising.
            </p>
          </div>

          {/* Injury options list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {INJURY_OPTIONS.map((opt) => {
              const isChecked = injuries.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => handleToggleInjury(opt.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isChecked
                      ? 'bg-gym-lime/10 dark:bg-[#18181b] border-gym-lime shadow-lime-sm'
                      : 'bg-slate-50 dark:bg-[#121212] border-zinc-200 dark:border-gym-border hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white block">{opt.label}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{opt.affectedMovements}</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 mt-0.5 ${
                      isChecked
                        ? 'bg-gym-lime border-gym-lime text-black'
                        : 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Injury Notes */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block">
              Specific Pain Description (Optional)
            </label>
            <textarea
              value={injuryNotes}
              onChange={(e) => setInjuryNotes(e.target.value)}
              placeholder="e.g. Sharp pain in right shoulder when pressing overhead; lower back tight after long standing."
              rows={2}
              className="w-full bg-white dark:bg-[#141414] border border-zinc-300 dark:border-gym-border rounded-xl p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-gym-lime resize-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
          </div>
        </div>
      )}

      {/* Navigation Buttons (Back & Next / Generate) */}
      <div className={`flex ${currentStep === totalSteps ? 'flex-col-reverse sm:flex-row' : 'flex-row'} items-stretch sm:items-center justify-between gap-3 pt-4`}>
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            className="px-5 sm:px-6 py-3.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300 font-bold text-sm border border-zinc-300 dark:border-zinc-800 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div className="hidden sm:block" />
        )}

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={() => setCurrentStep((s) => Math.min(totalSteps, s + 1))}
            className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-sm shadow-lime-md transition-all hover:scale-105 flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="w-full sm:w-auto px-6 sm:px-10 py-4 rounded-2xl bg-gradient-to-r from-gym-lime to-gym-limeLight text-black font-black text-sm sm:text-base shadow-lime-lg transition-all hover:scale-105 flex items-center justify-center gap-2.5 disabled:opacity-50 min-h-[52px]"
          >
            <Sparkles className="w-5 h-5 fill-black" />
            <span>{isGenerating ? 'Building Your Program...' : 'Generate My Workout Program'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
