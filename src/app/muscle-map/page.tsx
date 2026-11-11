'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MuscleGroup, Exercise } from '@/types/workout';
import { exercises, getExercisesByMuscle } from '@/data/exercises';
import { BodyVisualizer } from '@/components/body/BodyVisualizer';
import { VideoModal } from '@/components/program/VideoModal';
import { loadSavedProfile } from '@/lib/storage';
import { Play, Sparkles, Activity, Layers, Dumbbell, ArrowRight, ArrowLeft } from 'lucide-react';

export default function MuscleMapPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup>('chest');
  const [selectedVideoExercise, setSelectedVideoExercise] = useState<Exercise | null>(null);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [mobileTab, setMobileTab] = useState<'map' | 'exercises'>('map');

  const exerciseListRef = useRef<HTMLDivElement>(null);

  // Sync default gender with saved user profile if available
  useEffect(() => {
    const profile = loadSavedProfile();
    if (profile && profile.gender) {
      setGender(profile.gender);
    }
  }, []);

  const muscleList: MuscleGroup[] = [
    'chest',
    'lats',
    'upper_back',
    'front_delts',
    'side_delts',
    'rear_delts',
    'biceps',
    'triceps',
    'forearms',
    'abs',
    'obliques',
    'lower_back',
    'quads',
    'hamstrings',
    'glutes',
    'calves',
  ];

  const filteredExercises = getExercisesByMuscle(selectedMuscle);

  const formatMuscle = (m: MuscleGroup) =>
    m
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const handleSelectMuscle = (m: MuscleGroup) => {
    setSelectedMuscle(m);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Page Title */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gym-lime/10 border border-gym-lime/30 text-xs font-bold text-gym-limeDark dark:text-gym-lime">
          <Sparkles className="w-3.5 h-3.5" />
          <span>INTERACTIVE ANATOMICAL EXPLORER</span>
        </div>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gym-text tracking-tight">
          Muscle Map & Exercise Library
        </h1>
        <p className="text-xs sm:text-sm text-gym-textMuted max-w-xl mx-auto leading-relaxed">
          Tap any muscle group on the anatomical figure below to explore exercises, form cues, and video demonstrations. Supports both male and female anatomy.
        </p>
      </div>

      {/* Mobile-only View Switcher Tabs */}
      <div className="flex lg:hidden items-center justify-center">
        <div className="flex items-center gap-1 bg-gym-cardInner p-1.5 rounded-2xl w-full max-w-sm">
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              mobileTab === 'map'
                ? 'bg-gym-lime text-black '
                : 'text-zinc-600 hover:text-gym-text dark:text-zinc-400 '
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Anatomical Map</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('exercises')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              mobileTab === 'exercises'
                ? 'bg-gym-lime text-black '
                : 'text-zinc-600 hover:text-gym-text dark:text-zinc-400 '
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Exercises ({filteredExercises.length})</span>
          </button>
        </div>
      </div>

      {/* Main Container: Fixed Stable Layout to Prevent Layout Shifts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-[750px]">
        {/* Left Column: Interactive Body Map & Quick Filter Buttons */}
        <div
          className={`lg:col-span-5 lg:sticky lg:top-24 space-y-4 transition-all ${
            mobileTab === 'exercises' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Anatomical Visualizer Container */}
          <div className="bg-white dark:bg-gym-card rounded-2xl overflow-hidden ">
            <BodyVisualizer
              primaryMuscles={[selectedMuscle]}
              selectedMuscle={selectedMuscle}
              onMuscleClick={handleSelectMuscle}
              gender={gender}
              onGenderChange={(g) => setGender(g)}
              allowGenderToggle={true}
            />
          </div>

          {/* Mobile Direct Action Button to view selected exercises */}
          <div className="block lg:hidden">
            <button
              type="button"
              onClick={() => setMobileTab('exercises')}
              className="w-full py-3.5 px-5 rounded-2xl bg-gym-lime text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-gym-limeLight transition-all min-h-[48px]"
            >
              <span>View {formatMuscle(selectedMuscle)} Exercises ({filteredExercises.length})</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Quick Muscle Selector Pills */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gym-card space-y-2.5 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gym-textMuted">
                Quick Muscle Selector
              </span>
              <span className="text-xs text-gym-limeDark dark:text-gym-lime font-bold">
                {formatMuscle(selectedMuscle)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1 scrollbar-none">
              {muscleList.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    handleSelectMuscle(m);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
                    selectedMuscle === m
                      ? 'bg-gym-lime text-black font-semibold scale-105'
                      : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 text-zinc-700 hover:text-gym-text dark:text-zinc-300 border border-zinc-200 dark:border-transparent'
                  }`}
                >
                  {formatMuscle(m)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Filtered Exercise List (Fixed min-height & internal scroll prevents page jumping) */}
        <div
          ref={exerciseListRef}
          className={`lg:col-span-7 space-y-4 min-h-[600px] sm:min-h-[750px] transition-all ${
            mobileTab === 'map' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Mobile Back to Map Bar */}
          <div className="flex lg:hidden items-center justify-between p-3.5 rounded-2xl bg-gym-cardInner ">
            <button
              type="button"
              onClick={() => setMobileTab('map')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gym-limeDark dark:text-gym-lime hover:underline min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Anatomical Body</span>
            </button>
            <span className="text-xs sm:text-sm font-bold text-gym-silver">
              {formatMuscle(selectedMuscle)}
            </span>
          </div>

          {/* Header Bar */}
          <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gym-cardAlt transition-colors">
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase text-gym-limeDark dark:text-gym-lime tracking-wider block">
                Targeted Muscle Area
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-gym-text">{formatMuscle(selectedMuscle)}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-gym-silver bg-gym-cardInner px-3.5 py-1.5 rounded-xl ">
                {filteredExercises.length} Exercises Available
              </span>
            </div>
          </div>

          {/* Exercise Cards with internal scroll on desktop to prevent parent container collapse */}
          <div className="space-y-3 lg:max-h-[650px] lg:overflow-y-auto lg:pr-2 scrollbar-thin scrollbar-thumb-zinc-400 dark:scrollbar-thumb-zinc-700">
            {filteredExercises.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-gym-card text-gym-textMuted text-sm">
                No exercises found for this muscle group.
              </div>
            ) : (
              filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-gym-card hover:brightness-110 hover:border-gym-lime/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 "
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-gym-text group-hover:text-gym-limeDark dark:group-hover:text-gym-lime transition-colors">
                        {ex.name}
                      </h3>
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-gym-cardInner text-gym-silver shrink-0">
                        {ex.equipment.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gym-textMuted line-clamp-2 max-w-xl">
                      {ex.whyIncluded}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gym-textMuted pt-1">
                      <span className="text-zinc-500 font-semibold">Standard Protocol:</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-300">
                        {ex.defaultSets} sets × {ex.defaultReps} reps
                      </span>
                      <span>({ex.defaultRestSeconds}s rest)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => setSelectedVideoExercise(ex)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-semibold text-xs sm:text-sm transition-all min-h-[44px]"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Watch Demo</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        exercise={selectedVideoExercise}
        isOpen={Boolean(selectedVideoExercise)}
        onClose={() => setSelectedVideoExercise(null)}
      />
    </div>
  );
}
