'use client';

import React, { useState } from 'react';
import { MuscleGroup } from '@/types/workout';
import { SvgBodyFront } from './SvgBodyFront';
import { SvgBodyBack } from './SvgBodyBack';
import { SvgBodyFemaleFront } from './SvgBodyFemaleFront';
import { SvgBodyFemaleBack } from './SvgBodyFemaleBack';

export interface BodyVisualizerProps {
  primaryMuscles?: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[];
  selectedMuscle?: MuscleGroup | null;
  onMuscleClick?: (muscle: MuscleGroup) => void;
  interactive?: boolean;
  gender?: 'male' | 'female';
  onGenderChange?: (gender: 'male' | 'female') => void;
  allowGenderToggle?: boolean;
  className?: string;
}

export function BodyVisualizer({
  primaryMuscles = [],
  secondaryMuscles = [],
  selectedMuscle = null,
  onMuscleClick,
  interactive = true,
  gender: initialGender = 'male',
  onGenderChange,
  allowGenderToggle = false,
  className = '',
}: BodyVisualizerProps) {
  const [activeTab, setActiveTab] = useState<'both' | 'front' | 'back'>('both');
  const [currentGender, setCurrentGender] = useState<'male' | 'female'>(initialGender);

  // Sync with prop when prop changes
  React.useEffect(() => {
    setCurrentGender(initialGender);
  }, [initialGender]);

  const formatMuscleName = (name: MuscleGroup): string => {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div
      className={`flex flex-col items-center bg-gym-card border border-gym-border rounded-2xl p-4 sm:p-5 transition-all w-full ${className}`}
    >
      {/* Top Controls: View Toggle (Dual/Front/Back) & Gender Switcher */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-gym-border/60">
        {/* Dual / Front / Back Tabs */}
        <div className="flex items-center gap-1 bg-[#18181b] p-1 rounded-xl border border-[#27272a]">
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'both'
                ? 'bg-gym-lime text-black shadow-lime-sm font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Dual View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('front')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'front'
                ? 'bg-gym-lime text-black shadow-lime-sm font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('back')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'back'
                ? 'bg-gym-lime text-black shadow-lime-sm font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Back
          </button>
        </div>

        {/* Gender Toggle Pill (Always available or controlled) */}
        {allowGenderToggle && (
          <div className="flex items-center gap-1 bg-[#18181b] p-1 rounded-xl border border-[#27272a]">
            <button
              type="button"
              onClick={() => {
                setCurrentGender('male');
                onGenderChange?.('male');
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                currentGender === 'male'
                  ? 'bg-zinc-700 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentGender('female');
                onGenderChange?.('female');
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                currentGender === 'female'
                  ? 'bg-zinc-700 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Female
            </button>
          </div>
        )}
      </div>

      {/* SVG Canvas Area: Fixed stable container to prevent jumping */}
      <div className="w-full flex items-center justify-center gap-3 sm:gap-6 my-2 min-h-[340px] sm:min-h-[380px]">
        {currentGender === 'male' ? (
          <>
            {(activeTab === 'both' || activeTab === 'front') && (
              <div className="flex flex-col items-center flex-1 max-w-[170px] sm:max-w-[200px]">
                <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 mb-1.5">
                  Front
                </span>
                <SvgBodyFront
                  primaryMuscles={primaryMuscles}
                  secondaryMuscles={secondaryMuscles}
                  selectedMuscle={selectedMuscle}
                  onMuscleClick={interactive ? onMuscleClick : undefined}
                />
              </div>
            )}

            {(activeTab === 'both' || activeTab === 'back') && (
              <div className="flex flex-col items-center flex-1 max-w-[170px] sm:max-w-[200px]">
                <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 mb-1.5">
                  Back
                </span>
                <SvgBodyBack
                  primaryMuscles={primaryMuscles}
                  secondaryMuscles={secondaryMuscles}
                  selectedMuscle={selectedMuscle}
                  onMuscleClick={interactive ? onMuscleClick : undefined}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {(activeTab === 'both' || activeTab === 'front') && (
              <div className="flex flex-col items-center flex-1 max-w-[170px] sm:max-w-[200px]">
                <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 mb-1.5">
                  Front
                </span>
                <SvgBodyFemaleFront
                  primaryMuscles={primaryMuscles}
                  secondaryMuscles={secondaryMuscles}
                  selectedMuscle={selectedMuscle}
                  onMuscleClick={interactive ? onMuscleClick : undefined}
                />
              </div>
            )}

            {(activeTab === 'both' || activeTab === 'back') && (
              <div className="flex flex-col items-center flex-1 max-w-[170px] sm:max-w-[200px]">
                <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 mb-1.5">
                  Back
                </span>
                <SvgBodyFemaleBack
                  primaryMuscles={primaryMuscles}
                  secondaryMuscles={secondaryMuscles}
                  selectedMuscle={selectedMuscle}
                  onMuscleClick={interactive ? onMuscleClick : undefined}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Selected Muscle Indicator Pill (Always reserves space to avoid layout shift) */}
      <div className="min-h-[36px] flex items-center justify-center my-1">
        {selectedMuscle ? (
          <div className="flex items-center gap-2 bg-[#18181b] border border-gym-lime/40 px-3 py-1 rounded-full text-xs animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-gym-lime animate-pulse"></span>
            <span className="text-zinc-300">Selected:</span>
            <span className="font-bold text-gym-lime">{formatMuscleName(selectedMuscle)}</span>
            {onMuscleClick && (
              <button
                type="button"
                onClick={() => onMuscleClick(selectedMuscle)}
                className="ml-1 text-zinc-400 hover:text-white font-bold"
                title="Clear selection"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-zinc-400">Tap any muscle group to inspect exercises</span>
        )}
      </div>

      {/* Visual Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-2 pt-3 border-t border-gym-border/60 text-xs text-zinc-400 w-full">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16] shadow-[0_0_8px_#84cc16]"></span>
          <span className="text-[11px]">Primary Target</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4d7c0f]"></span>
          <span className="text-[11px]">Secondary / Synergist</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1f2937] border border-zinc-700"></span>
          <span className="text-[11px]">Resting</span>
        </div>
      </div>
    </div>
  );
}
