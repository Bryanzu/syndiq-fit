'use client';

import React from 'react';
import { WorkoutExerciseItem, MuscleGroup } from '@/types/workout';
import { useModalScrollLock } from '@/hooks/useModalScrollLock';
import { X, Play, ArrowRightLeft, Clock, Dumbbell, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface ExerciseDetailModalProps {
  item: WorkoutExerciseItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenVideo: () => void;
  onOpenSwap: () => void;
}

export function ExerciseDetailModal({
  item,
  isOpen,
  onClose,
  onOpenVideo,
  onOpenSwap,
}: ExerciseDetailModalProps) {
  const { handleBackdropClick } = useModalScrollLock(isOpen, onClose);

  if (!isOpen || !item) return null;

  const exercise = item.exercise;

  const formatMuscle = (m: MuscleGroup) =>
    m
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/80 dark:bg-black/85 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-detail-title"
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl animate-scaleUp max-h-[calc(100dvh-1.5rem)] sm:max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Fixed/Sticky */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-zinc-200 dark:border-gym-border bg-slate-50 dark:bg-[#141414] shrink-0 sticky top-0 z-10 transition-colors">
          <div className="space-y-1.5 pr-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-md bg-zinc-100 dark:bg-zinc-800 text-gym-limeDark dark:text-gym-lime border border-zinc-200 dark:border-zinc-700">
                {exercise.equipment.replace('_', ' ')}
              </span>
              {item.isSubstituted && (
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{item.substitutionReason || 'Adapted'}</span>
                </span>
              )}
            </div>
            <h2
              id="exercise-detail-title"
              className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight"
            >
              {exercise.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain touch-pan-y space-y-5 sm:space-y-6 text-sm flex-1 min-h-0 modal-content-scroll">
          {/* Prescription Banner (Sets, Reps, Rest) */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#161616] border border-zinc-200 dark:border-gym-border">
            <div className="text-center">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Sets
              </span>
              <span className="text-xl font-black text-zinc-900 dark:text-white">{item.sets}</span>
            </div>
            <div className="text-center border-x border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Reps
              </span>
              <span className="text-xl font-black text-gym-limeDark dark:text-gym-lime">{item.reps}</span>
            </div>
            <div className="text-center">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Rest
              </span>
              <span className="text-xl font-black text-zinc-900 dark:text-white flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-zinc-400" />
                {item.restSeconds}s
              </span>
            </div>
          </div>

          {/* Target Muscles */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Target Muscles
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
                  className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                >
                  Secondary: {formatMuscle(m)}
                </span>
              ))}
            </div>
          </div>

          {/* Why You're Doing It */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-50 to-slate-100 dark:from-zinc-900 dark:to-[#18181b] border border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gym-limeDark dark:text-gym-lime uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Why It's In Your Program</span>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
              {exercise.whyIncluded}
            </p>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              How to Perform Properly
            </h4>
            <div className="space-y-2.5">
              {exercise.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                  <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-gym-limeDark dark:text-gym-lime font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-zinc-200 dark:border-zinc-700">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm leading-snug pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Intensity Note if applicable */}
          {item.intensityNote && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-gym-limeDark dark:text-gym-lime shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-200">Coach Guidance:</span>{' '}
                {item.intensityNote}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer - Fixed/Sticky */}
        <div className="p-3.5 sm:p-5 border-t border-zinc-200 dark:border-gym-border bg-slate-50 dark:bg-[#141414] flex flex-wrap items-center justify-between gap-3 shrink-0 sticky bottom-0 z-10 transition-colors">
          <button
            type="button"
            onClick={onOpenSwap}
            className="px-4 py-2.5 min-h-[44px] rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 border border-zinc-300 dark:border-zinc-700"
          >
            <ArrowRightLeft className="w-4 h-4 text-gym-limeDark dark:text-gym-lime" />
            <span>Swap Exercise</span>
          </button>

          <button
            type="button"
            onClick={onOpenVideo}
            className="px-5 py-2.5 min-h-[44px] rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-xs sm:text-sm shadow-lime-sm transition-all hover:scale-105 flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Watch Video Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
