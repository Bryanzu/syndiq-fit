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
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
          Muscle Map & Exercise Library
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Tap any muscle group on the anatomical figure below to explore exercises, form cues, and video demonstrations. Supports both male and female anatomy.
        </p>
      </div>

      {/* Mobile-only View Switcher Tabs */}
      <div className="flex lg:hidden items-center justify-center">
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#18181b] p-1.5 rounded-2xl border border-zinc-200 dark:border-gym-border w-full max-w-sm">
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              mobileTab === 'map'
                ? 'bg-gym-lime text-black shadow-lime-sm'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
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
                ? 'bg-gym-lime text-black shadow-lime-sm'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
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
          <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl overflow-hidden shadow-xl">
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
              className="w-full py-3.5 px-5 rounded-2xl bg-gym-lime text-black font-black text-sm shadow-lime-md flex items-center justify-center gap-2 hover:bg-gym-limeLight transition-all min-h-[48px]"
            >
              <span>View {formatMuscle(selectedMuscle)} Exercises ({filteredExercises.length})</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Quick Muscle Selector Pills */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#121212] border border-zinc-200 dark:border-gym-border space-y-2.5 shadow-md transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
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
                      ? 'bg-gym-lime text-black font-extrabold shadow-lime-sm scale-105'
                      : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white border border-zinc-200 dark:border-transparent'
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
          <div className="flex lg:hidden items-center justify-between p-3.5 rounded-2xl bg-zinc-100 dark:bg-[#18181b] border border-zinc-200 dark:border-gym-border">
            <button
              type="button"
              onClick={() => setMobileTab('map')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gym-limeDark dark:text-gym-lime hover:underline min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Anatomical Body</span>
            </button>
            <span className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
              {formatMuscle(selectedMuscle)}
            </span>
          </div>

          {/* Header Bar */}
          <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#141414] border border-zinc-200 dark:border-gym-border transition-colors">
            <div className="space-y-0.5">
              <span className="text-xs font-black uppercase text-gym-limeDark dark:text-gym-lime tracking-wider block">
                Targeted Muscle Area
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">{formatMuscle(selectedMuscle)}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                {filteredExercises.length} Exercises Available
              </span>
            </div>
          </div>

          {/* Exercise Cards with internal scroll on desktop to prevent parent container collapse */}
          <div className="space-y-3 lg:max-h-[650px] lg:overflow-y-auto lg:pr-2 scrollbar-thin scrollbar-thumb-zinc-400 dark:scrollbar-thumb-zinc-700">
            {filteredExercises.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border text-zinc-500 dark:text-zinc-400 text-sm">
                No exercises found for this muscle group.
              </div>
            ) : (
              filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-gym-card hover:bg-slate-50 dark:hover:bg-gym-cardHover border border-zinc-200 dark:border-gym-border hover:border-gym-lime/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white group-hover:text-gym-limeDark dark:group-hover:text-gym-lime transition-colors">
                        {ex.name}
                      </h3>
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shrink-0">
                        {ex.equipment.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 max-w-xl">
                      {ex.whyIncluded}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
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
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-xs sm:text-sm shadow-lime-sm transition-all hover:scale-105 min-h-[44px]"
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
