'use client';

import React from 'react';
import Image from 'next/image';
import { WorkoutExerciseItem, MuscleGroup } from '@/types/workout';
import { exercisePhoto } from '@/lib/photos';
import { Play, ArrowRightLeft, ChevronRight, ShieldAlert } from 'lucide-react';

interface ExerciseCardProps {
  item: WorkoutExerciseItem;
  index: number;
  onOpenDetails: () => void;
  onOpenVideo: () => void;
  onOpenSwap: () => void;
  onHoverMuscles?: (primary: MuscleGroup[], secondary: MuscleGroup[]) => void;
  onLeaveMuscles?: () => void;
  /** Set while this row is morphing into (or out of) its detail sheet */
  morphName?: string;
}

const formatMuscle = (m: MuscleGroup) =>
  m.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/**
 * One exercise as a list row with its photo. The list that renders these supplies the dividers.
 * Tapping the name opens the instructions; Demo and Replace are always visible.
 */
export function ExerciseCard({
  item,
  index,
  onOpenDetails,
  onOpenVideo,
  onOpenSwap,
  onHoverMuscles,
  onLeaveMuscles,
  morphName,
}: ExerciseCardProps) {
  const exercise = item.exercise;

  return (
    <article
      onMouseEnter={() => onHoverMuscles?.(exercise.primaryMuscles, exercise.secondaryMuscles)}
      onMouseLeave={() => onLeaveMuscles?.()}
      style={morphName ? ({ viewTransitionName: morphName } as React.CSSProperties) : undefined}
      className="py-4 sm:py-5"
    >
      <div className="flex items-start gap-3.5 sm:gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl sm:size-20" aria-hidden>
          <Image src={exercisePhoto(exercise)} alt="" fill sizes="80px" className="object-cover" />
          <span className="absolute left-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/65 text-[11px] font-bold tabular-nums text-white">
            {index + 1}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpenDetails}
            className="group flex w-full items-start justify-between gap-3 text-left"
            aria-label={`${exercise.name} — view instructions`}
          >
            <span className="min-w-0">
              <span className="block text-base font-bold leading-snug text-gym-text transition-colors group-hover:text-gym-limeDark dark:group-hover:text-gym-lime sm:text-lg">
                {exercise.name}
              </span>
              <span className="mt-0.5 block text-sm text-gym-textMuted">
                {exercise.primaryMuscles.map(formatMuscle).join(', ')}
                <span aria-hidden> · </span>
                <span className="capitalize">{exercise.equipment.replace('_', ' ')}</span>
              </span>
            </span>
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gym-textMuted transition-colors group-hover:text-gym-text" />
          </button>

          {item.isSubstituted && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              {item.substitutionReason || 'Swapped for safety'}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="glass-inset rounded-full px-3 py-1.5 text-[13px] font-bold tabular-nums text-gym-text">
              {item.sets} × <span className="text-gym-limeDark dark:text-gym-lime">{item.reps}</span>
            </span>
            <span className="glass-inset rounded-full px-3 py-1.5 text-[13px] font-medium tabular-nums text-gym-textMuted">
              {item.restSeconds}s rest
            </span>
            <button type="button" onClick={onOpenVideo} className="btn-primary btn-sm !min-h-[36px] !px-3.5">
              <Play className="h-3.5 w-3.5 fill-current" /> Demo
            </button>
            <button type="button" onClick={onOpenSwap} title="Replace exercise" className="btn-secondary btn-sm !min-h-[36px] !px-3.5">
              <ArrowRightLeft className="h-3.5 w-3.5" /> Replace
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
