'use client';

import React from 'react';
import { plainReason } from '@/lib/exerciseCopy';
import { Sheet } from '@/components/ui/Sheet';
import { WorkoutExerciseItem, MuscleGroup } from '@/types/workout';
import { X, Play, ArrowRightLeft, Clock, Dumbbell, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface ExerciseDetailModalProps {
  item: WorkoutExerciseItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenVideo: () => void;
  onOpenSwap: () => void;
  /** True when the sheet was opened by morphing out of its list row */
  morph?: boolean;
}

export function ExerciseDetailModal({
  item,
  isOpen,
  onClose,
  onOpenVideo,
  onOpenSwap,
  morph = false,
}: ExerciseDetailModalProps) {

  if (!isOpen || !item) return null;

  const exercise = item.exercise;

  const formatMuscle = (m: MuscleGroup) =>
    m
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  return (
    <Sheet isOpen={isOpen} onClose={onClose} labelledBy="exercise-detail-title" zClass="z-[100]" maxWidth="max-w-2xl" morphName={morph ? 'exercise-surface' : undefined}>
        {/* Modal Header - Fixed/Sticky */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-gym-border bg-gym-cardAlt shrink-0 sticky top-0 z-10 transition-colors">
          <div className="space-y-1.5 pr-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-md bg-gym-cardInner text-gym-limeDark dark:text-gym-lime ">
                {exercise.equipment.replace('_', ' ')}
              </span>
              {item.isSubstituted && (
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{item.substitutionReason || 'Swapped'}</span>
                </span>
              )}
            </div>
            <h2
              id="exercise-detail-title"
              className="text-xl sm:text-2xl font-semibold text-gym-text tracking-tight"
            >
              {exercise.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-2xl text-gym-textMuted hover:text-gym-text hover:brightness-110 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain touch-pan-y space-y-5 sm:space-y-6 text-sm flex-1 min-h-0 modal-content-scroll">
          {/* Prescription Banner (Sets, Reps, Rest) */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gym-cardAlt ">
            <div className="text-center">
              <span className="text-xs font-semibold text-gym-textMuted uppercase tracking-wider block">
                Sets
              </span>
              <span className="text-xl font-bold text-gym-text">{item.sets}</span>
            </div>
            <div className="text-center border-x border-gym-border">
              <span className="text-xs font-semibold text-gym-textMuted uppercase tracking-wider block">
                Reps
              </span>
              <span className="text-xl font-bold text-gym-limeDark dark:text-gym-lime">{item.reps}</span>
            </div>
            <div className="text-center">
              <span className="text-xs font-semibold text-gym-textMuted uppercase tracking-wider block">
                Rest
              </span>
              <span className="text-xl font-bold text-gym-text flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-gym-textMuted" />
                {item.restSeconds}s
              </span>
            </div>
          </div>

          {/* Muscles */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gym-silver uppercase tracking-wider">
              Muscles
            </h4>
            <div className="flex flex-wrap gap-2">
              {exercise.primaryMuscles.map((m) => (
                <span
                  key={m}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-gym-lime/15 text-gym-limeDark dark:text-gym-lime border border-gym-lime/40"
                >
                  Primary: {formatMuscle(m)}
                </span>
              ))}
              {exercise.secondaryMuscles.map((m) => (
                <span
                  key={m}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-gym-cardInner text-gym-silver "
                >
                  Secondary: {formatMuscle(m)}
                </span>
              ))}
            </div>
          </div>

          {/* Why You're Doing It */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-transparent to-transparent bg-gym-cardAlt space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gym-limeDark dark:text-gym-lime uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Why this one</span>
            </div>
            <p className="text-gym-silver text-xs sm:text-sm leading-relaxed">
              {plainReason(exercise)}
            </p>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gym-silver uppercase tracking-wider">
              How to do it
            </h4>
            <div className="space-y-2.5">
              {exercise.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-gym-silver">
                  <div className="w-6 h-6 rounded-full bg-gym-cardInner text-gym-limeDark dark:text-gym-lime font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm leading-snug pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Intensity Note if applicable */}
          {item.intensityNote && (
            <div className="p-3.5 rounded-2xl bg-gym-cardAlt flex items-start gap-2.5 text-xs text-gym-textMuted">
              <CheckCircle2 className="w-4 h-4 text-gym-limeDark dark:text-gym-lime shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-gym-text">Tip:</span>{' '}
                {item.intensityNote}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer - Fixed/Sticky */}
        <div className="p-3.5 sm:p-5 border-t border-gym-border bg-gym-cardAlt flex flex-wrap items-center justify-between gap-3 shrink-0 sticky bottom-0 z-10 transition-colors">
          <button
            type="button"
            onClick={onOpenSwap}
            className="px-4 py-2.5 min-h-[44px] rounded-2xl bg-gym-cardInner hover:bg-gym-cardInner text-gym-text font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 "
          >
            <ArrowRightLeft className="w-4 h-4 text-gym-limeDark dark:text-gym-lime" />
            <span>Swap</span>
          </button>

          <button
            type="button"
            onClick={onOpenVideo}
            className="px-5 py-2.5 min-h-[44px] rounded-2xl bg-gym-lime hover:bg-gym-limeLight text-gym-ink font-semibold text-xs sm:text-sm transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-gym-ink" />
            <span>Watch demo</span>
          </button>
        </div>
    </Sheet>
  );
}
