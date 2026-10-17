'use client';

import React, { useEffect } from 'react';
import { WorkoutExerciseItem, MuscleGroup } from '@/types/workout';
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const exercise = item.exercise;

  const formatMuscle = (m: MuscleGroup) =>
    m
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-gym-card border border-gym-border rounded-2xl overflow-hidden shadow-2xl animate-scaleUp max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-gym-border bg-[#141414]">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-md bg-zinc-800 text-gym-lime border border-zinc-700">
                {exercise.equipment}
              </span>
              {item.isSubstituted && (
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{item.substitutionReason || 'Adapted'}</span>
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">{exercise.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Prescription Banner (Sets, Reps, Rest) */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#161616] border border-gym-border">
            <div className="text-center">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Sets</span>
              <span className="text-xl font-black text-white">{item.sets}</span>
            </div>
            <div className="text-center border-x border-zinc-800">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Reps</span>
              <span className="text-xl font-black text-gym-lime">{item.reps}</span>
            </div>
            <div className="text-center">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Rest</span>
              <span className="text-xl font-black text-white flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-zinc-400" />
                {item.restSeconds}s
              </span>
            </div>
          </div>

          {/* Target Muscles */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Target Muscles</h4>
            <div className="flex flex-wrap gap-2">
              {exercise.primaryMuscles.map((m) => (
                <span
                  key={m}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-gym-lime/10 text-gym-lime border border-gym-lime/40"
                >
                  Primary: {formatMuscle(m)}
                </span>
              ))}
              {exercise.secondaryMuscles.map((m) => (
                <span
                  key={m}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700"
                >
                  Secondary: {formatMuscle(m)}
                </span>
              ))}
            </div>
          </div>

          {/* Why You're Doing It */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-900 to-[#18181b] border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gym-lime uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Why It's In Your Program</span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">{exercise.whyIncluded}</p>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">How to Perform Properly</h4>
            <div className="space-y-2.5">
              {exercise.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 text-gym-lime font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-zinc-700">
                    {idx + 1}
                  </div>
                  <p className="text-sm leading-snug">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Intensity Note if applicable */}
          {item.intensityNote && (
            <div className="p-3.5 rounded-xl bg-[#141414] border border-zinc-800 flex items-start gap-2.5 text-xs text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-gym-lime shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-200">Coach Guidance:</span> {item.intensityNote}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-5 border-t border-gym-border bg-[#141414] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onOpenSwap}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors flex items-center gap-2 border border-zinc-700"
          >
            <ArrowRightLeft className="w-4 h-4 text-gym-lime" />
            <span>Swap Exercise</span>
          </button>

          <button
            type="button"
            onClick={onOpenVideo}
            className="px-5 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-bold text-xs shadow-lime-sm transition-all hover:scale-105 flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Watch Video Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
