'use client';

import React from 'react';
import { WorkoutExerciseItem, MuscleGroup } from '@/types/workout';
import { Play, ArrowRightLeft, Info, Clock, Dumbbell, ShieldAlert } from 'lucide-react';

interface ExerciseCardProps {
  item: WorkoutExerciseItem;
  index: number;
  onOpenDetails: () => void;
  onOpenVideo: () => void;
  onOpenSwap: () => void;
  onHoverMuscles?: (primary: MuscleGroup[], secondary: MuscleGroup[]) => void;
  onLeaveMuscles?: () => void;
}

export function ExerciseCard({
  item,
  index,
  onOpenDetails,
  onOpenVideo,
  onOpenSwap,
  onHoverMuscles,
  onLeaveMuscles,
}: ExerciseCardProps) {
  const exercise = item.exercise;

  const handleMouseEnter = () => {
    if (onHoverMuscles) {
      onHoverMuscles(exercise.primaryMuscles, exercise.secondaryMuscles);
    }
  };

  const handleMouseLeave = () => {
    if (onLeaveMuscles) {
      onLeaveMuscles();
    }
  };

  const formatMuscle = (m: MuscleGroup) =>
    m
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative bg-white dark:bg-gym-card hover:bg-slate-50 dark:hover:bg-gym-cardHover border border-zinc-200 dark:border-gym-border hover:border-gym-lime/50 rounded-2xl p-4 sm:p-5 transition-all duration-300 shadow-sm hover:shadow-lime-sm flex flex-col justify-between gap-4"
    >
      {/* Top Bar: Order number, Name, Equipment & Substitution Badge */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <span className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-gym-limeDark dark:text-gym-lime font-black text-xs sm:text-sm flex items-center justify-center shrink-0 mt-0.5">
              {index + 1}
            </span>
            <div className="space-y-0.5 min-w-0 flex-1">
              <h3
                onClick={onOpenDetails}
                className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white group-hover:text-gym-limeDark dark:group-hover:text-gym-lime transition-colors cursor-pointer leading-snug"
              >
                {exercise.name}
              </h3>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize inline-block">
                {exercise.movementPattern ? exercise.movementPattern.replace('_', ' ') : 'Strength Movement'}
                {exercise.tier ? ` • Tier ${exercise.tier}` : ''}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-zinc-100 dark:bg-[#18181b] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shrink-0">
            {exercise.equipment.replace('_', ' ')}
          </span>
        </div>

        {/* Safety Substitution Badge */}
        {item.isSubstituted && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>{item.substitutionReason || 'Adapted for injury safety'}</span>
          </div>
        )}

        {/* Target Muscles */}
        <div className="flex flex-wrap gap-1.5">
          {exercise.primaryMuscles.map((m) => (
            <span
              key={m}
              className="px-2.5 py-1 rounded-full text-xs font-bold bg-gym-lime/15 text-gym-limeDark dark:text-gym-lime border border-gym-lime/30"
            >
              {formatMuscle(m)}
            </span>
          ))}
          {exercise.secondaryMuscles.slice(0, 2).map((m) => (
            <span
              key={m}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
            >
              {formatMuscle(m)}
            </span>
          ))}
        </div>
      </div>

      {/* Center: Prescription Stats (Sets, Reps, Rest) */}
      <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-slate-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800/70 text-center">
        <div>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Sets
          </span>
          <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
            {item.sets}
          </span>
        </div>
        <div className="border-x border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Reps
          </span>
          <span className="text-base sm:text-lg font-black text-gym-limeDark dark:text-gym-lime">
            {item.reps}
          </span>
        </div>
        <div>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Rest
          </span>
          <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            {item.restSeconds}s
          </span>
        </div>
      </div>

      {/* Bottom Bar: Action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-200 dark:border-gym-border/60">
        <button
          type="button"
          onClick={onOpenDetails}
          className="inline-flex items-center gap-1.5 py-2 px-2 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors min-h-[44px]"
        >
          <Info className="w-4 h-4 text-gym-limeDark dark:text-gym-lime" />
          <span>Instructions</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Prominent Replace Exercise Button */}
          <button
            type="button"
            onClick={onOpenSwap}
            title="Replace exercise"
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:text-gym-limeDark dark:hover:text-gym-lime border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm font-bold transition-all min-h-[44px]"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-gym-limeDark dark:text-gym-lime" />
            <span>Replace</span>
          </button>

          <button
            type="button"
            onClick={onOpenVideo}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-xs sm:text-sm shadow-lime-sm transition-all hover:scale-105 min-h-[44px]"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
