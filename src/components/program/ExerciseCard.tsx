'use client';

import React from 'react';
import { WorkoutExerciseItem, MuscleGroup } from '@/types/workout';
import { Play, ArrowRightLeft, ChevronRight, ShieldAlert } from 'lucide-react';

interface ExerciseCardProps {
  item: WorkoutExerciseItem;
  index: number;
  onOpenDetails: () => void;
  onOpenVideo: () => void;
  onOpenSwap: () => void;
  onHoverMuscles?: (primary: MuscleGroup[], secondary: MuscleGroup[]) => void;
  onLeaveMuscles?: () => void;
}

const formatMuscle = (m: MuscleGroup) =>
  m.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/**
 * One exercise as a flat list row (no card, no border). The list that renders these supplies the dividers.
 * Primary tap target opens the instructions; Replace and Demo are always visible secondary actions.
 */
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

  return (
    <article
      onMouseEnter={() => onHoverMuscles?.(exercise.primaryMuscles, exercise.secondaryMuscles)}
      onMouseLeave={() => onLeaveMuscles?.()}
      className="py-4 sm:py-5"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <span className="w-6 pt-0.5 text-sm tabular-nums text-gym-textMuted shrink-0">{index + 1}</span>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpenDetails}
            className="group flex w-full items-start justify-between gap-3 text-left"
            aria-label={`${exercise.name} — view instructions`}
          >
            <span className="min-w-0">
              <span className="block text-base sm:text-lg font-semibold leading-snug text-gym-text group-hover:text-gym-limeDark dark:group-hover:text-gym-lime transition-colors">
                {exercise.name}
              </span>
              <span className="mt-0.5 block text-sm text-gym-textMuted">
                {exercise.primaryMuscles.map(formatMuscle).join(', ')}
                <span aria-hidden> · </span>
                <span className="capitalize">{exercise.equipment.replace('_', ' ')}</span>
              </span>
            </span>
            <ChevronRight className="mt-1 w-4 h-4 shrink-0 text-gym-textMuted group-hover:text-gym-text transition-colors" />
          </button>

          {item.isSubstituted && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              {item.substitutionReason || 'Adapted for injury safety'}
            </p>
          )}

          {/* Prescription: plain typographic stats, no boxes */}
          <dl className="mt-3 flex items-baseline gap-5 sm:gap-7">
            <div>
              <dt className="t-eyebrow !text-[11px]">Sets</dt>
              <dd className="text-lg font-semibold text-gym-text tabular-nums">{item.sets}</dd>
            </div>
            <div>
              <dt className="t-eyebrow !text-[11px]">Reps</dt>
              <dd className="text-lg font-semibold text-gym-limeDark dark:text-gym-lime tabular-nums">{item.reps}</dd>
            </div>
            <div>
              <dt className="t-eyebrow !text-[11px]">Rest</dt>
              <dd className="text-lg font-semibold text-gym-text tabular-nums">{item.restSeconds}s</dd>
            </div>
          </dl>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={onOpenVideo} className="btn-primary btn-sm">
              <Play className="w-3.5 h-3.5 fill-current" /> Demo
            </button>
            <button type="button" onClick={onOpenSwap} title="Replace exercise" className="btn-secondary btn-sm">
              <ArrowRightLeft className="w-3.5 h-3.5" /> Replace
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
