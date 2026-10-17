'use client';

import React, { useState, useMemo } from 'react';
import { Exercise, WorkoutExerciseItem, MuscleGroup } from '@/types/workout';
import { getExerciseById, exercises } from '@/data/exercises';
import { isContraindicated } from '@/engine/injuryRules';
import { isExerciseAvailable } from '@/engine/equipmentFilter';
import { adaptExerciseVolume } from '@/engine/volumeRules';
import { UserProfile } from '@/types/questionnaire';
import {
  X,
  ArrowRightLeft,
  ShieldCheck,
  Check,
  Search,
  Dumbbell,
  Clock,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface ExerciseSwapModalProps {
  item: WorkoutExerciseItem | null;
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSelectAlternative: (newExercise: Exercise) => void;
  currentWorkoutExercises?: WorkoutExerciseItem[];
}

export function ExerciseSwapModal({
  item,
  profile,
  isOpen,
  onClose,
  onSelectAlternative,
  currentWorkoutExercises = [],
}: ExerciseSwapModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Format muscle helper
  const formatMuscle = (m: MuscleGroup) =>
    m
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  // Compute eligible alternatives
  const availableAlternatives = useMemo(() => {
    if (!item) return [];
    const current = item.exercise;

    // Set of exercise IDs already assigned to this day's workout (excluding the item being replaced)
    const existingWorkoutIds = new Set(
      currentWorkoutExercises
        .map((i) => i.exercise.id)
        .filter((id) => id !== current.id)
    );

    // 1. Direct designated alternatives
    const direct: Exercise[] = (current.alternatives || [])
      .map((id) => getExerciseById(id))
      .filter((ex): ex is Exercise => {
        if (!ex) return false;
        if (ex.id === current.id) return false;
        // Exclude exercises already present in this workout day to prevent accidental duplicates
        if (existingWorkoutIds.has(ex.id)) return false;

        const isSafe = !isContraindicated(ex, profile.injuries);
        const isEquipReady = isExerciseAvailable(ex, profile.availableEquipment);
        return isSafe && isEquipReady;
      });

    // 2. Compatible pool matching same movement pattern or primary muscles
    const pool: Exercise[] = exercises.filter((ex) => {
      if (ex.id === current.id) return false;
      // Prevent duplicates: must not be in current workout day
      if (existingWorkoutIds.has(ex.id)) return false;
      if (direct.some((d) => d.id === ex.id)) return false;

      // Must share either movement pattern or at least one primary muscle group
      const sharesPattern = ex.movementPattern && current.movementPattern && ex.movementPattern === current.movementPattern;
      const sharesPrimary = ex.primaryMuscles.some((m) =>
        current.primaryMuscles.includes(m)
      );
      if (!sharesPattern && !sharesPrimary) return false;

      // Must pass joint safety constraints
      if (isContraindicated(ex, profile.injuries)) return false;

      // Must be executable with user's selected equipment
      if (!isExerciseAvailable(ex, profile.availableEquipment)) return false;

      // Experience level safety check for beginners: avoid heavy barbell grinds
      if (profile.experience === 'complete_beginner' && ex.tier === 1 && ex.equipment === 'barbell') {
        return false;
      }

      return true;
    });

    // 3. Score and prioritize candidates based on functional role and movement pattern
    const scoredCandidates = [...direct, ...pool].map((ex) => {
      let score = 0;

      // Direct hand-curated alternative
      if (current.alternatives?.includes(ex.id)) {
        score += 60;
      }

      // Exact movement pattern match (horizontal push -> horizontal push, etc.)
      if (ex.movementPattern && current.movementPattern && ex.movementPattern === current.movementPattern) {
        score += 45;
      }

      // Primary muscle overlap
      const sharedPrimaryCount = ex.primaryMuscles.filter((m) => current.primaryMuscles.includes(m)).length;
      score += sharedPrimaryCount * 15;

      // Similar exercise tier / role in workout (compound vs isolation)
      if (ex.tier && current.tier && ex.tier === current.tier) {
        score += 15;
      }

      // Secondary muscle overlap
      const sharedSecondaryCount = ex.secondaryMuscles.filter((m) => current.secondaryMuscles.includes(m)).length;
      score += sharedSecondaryCount * 5;

      // Goal-specific matching (e.g. strength vs hypertrophy)
      if (profile.goal === 'build_strength' && ex.tier === 1) score += 10;
      if (profile.goal === 'muscle_building' && (ex.tier === 1 || ex.tier === 2)) score += 8;

      return { exercise: ex, score };
    });

    scoredCandidates.sort((a, b) => b.score - a.score);

    const candidates = scoredCandidates.map((c) => c.exercise);

    // Optional user search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return candidates.filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) ||
          ex.equipment.toLowerCase().includes(q) ||
          ex.primaryMuscles.some((m) => m.toLowerCase().includes(q))
      );
    }

    return candidates;
  }, [item, profile, currentWorkoutExercises, searchQuery]);

  if (!isOpen || !item) return null;

  const currentExercise = item.exercise;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-gym-card border border-gym-border rounded-3xl overflow-hidden shadow-2xl animate-scaleUp flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-gym-border bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gym-lime/10 border border-gym-lime/30 flex items-center justify-center text-gym-lime shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-white">
                Replace Exercise
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Substituting{' '}
                <span className="text-gym-lime font-bold">
                  {currentExercise.name}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Exercise Context Pill */}
        <div className="px-5 sm:px-6 py-3 bg-[#111111] border-b border-gym-border flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-400">Current Role:</span>
            {currentExercise.primaryMuscles.map((m) => (
              <span
                key={m}
                className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gym-lime/10 text-gym-lime border border-gym-lime/30"
              >
                {formatMuscle(m)}
              </span>
            ))}
            {currentExercise.movementPattern && (
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300">
                {currentExercise.movementPattern.replace('_', ' ')}
              </span>
            )}
          </div>
          <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            {currentExercise.equipment.replace('_', ' ')}
          </span>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-5 border-b border-gym-border/70 bg-[#141414]">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search suitable substitutes by name or equipment..."
              className="w-full bg-[#18181b] border border-gym-border focus:border-gym-lime rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Candidate List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1 max-h-[55vh]">
          {availableAlternatives.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#141414] border border-gym-border space-y-3 my-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-white">
                No Compatible Alternatives Found
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                All potential substitutes for{' '}
                <strong className="text-zinc-200">{currentExercise.name}</strong>{' '}
                are either already scheduled in this workout, require equipment you haven't selected, or conflict with your active injury restrictions.
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Tip: You can expand your equipment checklist or adjust joint settings in the questionnaire to unlock additional exercise variations.
              </p>
            </div>
          ) : (
            availableAlternatives.map((alt) => {
              // Calculate adapted prescription preview for this alternative
              const volume = adaptExerciseVolume(alt, profile);

              return (
                <div
                  key={alt.id}
                  className="group rounded-2xl bg-[#161616] hover:bg-[#1c1c1c] border border-gym-border hover:border-gym-lime/50 p-4 sm:p-5 transition-all space-y-3 shadow-sm hover:shadow-lime-sm"
                >
                  {/* Top: Name, Equipment & Primary Muscles */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-base text-white group-hover:text-gym-lime transition-colors">
                          {alt.name}
                        </h4>
                        <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {alt.equipment.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {alt.primaryMuscles.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gym-lime/10 text-gym-lime border border-gym-lime/20"
                          >
                            {formatMuscle(m)}
                          </span>
                        ))}
                        {alt.movementPattern && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400">
                            {alt.movementPattern.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Select Button */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectAlternative(alt);
                        onClose();
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-xs sm:text-sm shadow-lime-sm transition-all hover:scale-105 shrink-0 self-start sm:self-auto min-h-[44px]"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Select Exercise</span>
                    </button>
                  </div>

                  {/* Prescription Preview Grid */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-[#111111] border border-zinc-800/80 text-center text-xs sm:text-sm">
                    <div>
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                        Prescribed Sets
                      </span>
                      <span className="font-black text-white text-sm sm:text-base">
                        {volume.sets} Sets
                      </span>
                    </div>
                    <div className="border-x border-zinc-800">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                        Prescribed Reps
                      </span>
                      <span className="font-black text-gym-lime text-sm sm:text-base">
                        {volume.reps}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                        Rest Period
                      </span>
                      <span className="font-black text-white text-sm sm:text-base flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {volume.restSeconds}s
                      </span>
                    </div>
                  </div>

                  {/* Why Included rationale */}
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    <span className="font-semibold text-zinc-300">Biomechanical role:</span> {alt.whyIncluded}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Safety Footer */}
        <div className="p-4 bg-[#141414] border-t border-gym-border flex items-center gap-2.5 text-xs text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-gym-lime shrink-0" />
          <span>
            Filtered against your selected gym equipment and personal joint safety profile. Accidental duplicates in this workout are automatically excluded.
          </span>
        </div>
      </div>
    </div>
  );
}
