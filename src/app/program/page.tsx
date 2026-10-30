'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { WorkoutProgram, WorkoutExerciseItem, Exercise, MuscleGroup } from '@/types/workout';
import { loadActiveProgram, saveActiveProgram, clearActiveProgram } from '@/lib/storage';
import { decodeProfileFromQuery, encodeProfileToQuery } from '@/lib/share';
import { generateWorkoutProgram } from '@/engine/programAssembler';
import { PlanHeader } from '@/components/program/PlanHeader';
import { DayTabs } from '@/components/program/DayTabs';
import { ExerciseCard } from '@/components/program/ExerciseCard';
import { ExerciseDetailModal } from '@/components/program/ExerciseDetailModal';
import { ExerciseSwapModal } from '@/components/program/ExerciseSwapModal';
import { VideoModal } from '@/components/program/VideoModal';
import { ShareQrModal } from '@/components/program/ShareQrModal';
import { BodyVisualizer } from '@/components/body/BodyVisualizer';
import { adaptExerciseVolume, calculateWorkoutDuration } from '@/engine/volumeRules';
import { Sparkles, Dumbbell, Trash2, X, AlertTriangle } from 'lucide-react';

function ProgramContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Active muscle highlight state for Body Visualizer
  const [hoveredPrimary, setHoveredPrimary] = useState<MuscleGroup[]>([]);
  const [hoveredSecondary, setHoveredSecondary] = useState<MuscleGroup[]>([]);

  // Modals state
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<WorkoutExerciseItem | null>(null);
  const [selectedExerciseForVideo, setSelectedExerciseForVideo] = useState<Exercise | null>(null);
  const [selectedItemForSwap, setSelectedItemForSwap] = useState<WorkoutExerciseItem | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Load active plan from query param or localStorage
  useEffect(() => {
    const q = searchParams.get('p');
    if (q) {
      const decodedProfile = decodeProfileFromQuery(q);
      if (decodedProfile) {
        const generated = generateWorkoutProgram(decodedProfile);
        setProgram(generated);
        saveActiveProgram(generated);
        setIsLoading(false);
        return;
      }
    }

    const saved = loadActiveProgram();
    if (saved) {
      setProgram(saved);
    }
    setIsLoading(false);
  }, [searchParams]);

  // Handle PDF Generation
  const handleDownloadPdf = async () => {
    if (!program) return;
    setIsGeneratingPdf(true);
    try {
      const { generateWorkoutPdf } = await import('@/lib/pdfGenerator');
      await generateWorkoutPdf(program);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle Exercise Swap
  const handleSelectAlternative = (newExercise: Exercise) => {
    if (!program || !selectedItemForSwap) return;

    const currentDay = program.days[activeDayIndex];
    if (!currentDay) return;

    // Defensive duplicate check: exercise cannot already be in today's routine (excluding the replaced slot)
    const isDuplicate = currentDay.exercises.some(
      (item) => item.exercise.id === newExercise.id && item.exercise.id !== selectedItemForSwap.exercise.id
    );
    if (isDuplicate) {
      alert(`"${newExercise.name}" is already in your schedule for today. Please select an alternative exercise.`);
      return;
    }

    // Adapt volume specifically for the chosen alternative and lifter profile
    const volume = adaptExerciseVolume(newExercise, program.userProfile);

    const updatedExercises: WorkoutExerciseItem[] = currentDay.exercises.map((item) => {
      if (item.exercise.id === selectedItemForSwap.exercise.id) {
        return {
          ...item,
          exercise: newExercise,
          sets: volume.sets,
          reps: volume.reps,
          restSeconds: volume.restSeconds,
          intensityNote: volume.intensityNote || item.intensityNote,
          isSubstituted: true,
          substitutionReason: 'Customized by user',
        };
      }
      return item;
    });

    // Accurately recalculate the workout duration for this day based on new exercises
    const newDuration = calculateWorkoutDuration(updatedExercises);

    const updatedDays = [...program.days];
    updatedDays[activeDayIndex] = {
      ...currentDay,
      exercises: updatedExercises,
      estimatedDuration: newDuration,
    };

    const updatedProgram = {
      ...program,
      days: updatedDays,
    };

    setProgram(updatedProgram);
    saveActiveProgram(updatedProgram);
  };

  // Handle program reset / clear
  const handleConfirmClearProgram = () => {
    clearActiveProgram();
    setProgram(null);
    setIsClearModalOpen(false);
    // Remove query params to ensure refreshing page doesn't repopulate
    router.replace('/program');
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-gym-lime border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Loading workout program...</p>
      </div>
    );
  }

  // Empty state if no program exists
  if (!program) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-10 sm:py-16 animate-fadeIn space-y-6">
        <div className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl overflow-hidden shadow-xl transition-colors">
          <div className="relative h-60 sm:h-80 w-full bg-zinc-950 overflow-hidden">
            <Image
              src="/images/workout-empty.jpg"
              alt="Syndiq Fit strength training equipment and weights"
              fill
              className="object-cover opacity-80 hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gym-lime text-black inline-block shadow-lime-sm">
                Ready For Training
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">No Active Workout Program</h2>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-6 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
              You haven&apos;t generated a personalized workout program yet, or your previous schedule was cleared. Your questionnaire answers (experience, goal, and gym equipment) are kept safe so you can generate a new split in seconds.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/questionnaire"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-sm shadow-lime-md transition-all hover:scale-105 min-h-[48px]"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Create New Program</span>
              </Link>
              <Link
                href="/meal-planner"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-sm transition-colors min-h-[48px]"
              >
                <span>View Meal Planner</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentDay = program.days[activeDayIndex] || program.days[0];

  // Derive muscle highlights for body map
  const activeDayPrimary = hoveredPrimary.length > 0 ? hoveredPrimary : currentDay.focusMuscles;
  const activeDaySecondary = hoveredSecondary;

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/program?p=${encodeProfileToQuery(program.userProfile)}`
      : '';

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 animate-fadeIn">
      {/* Plan Header */}
      <PlanHeader
        program={program}
        onDownloadPdf={handleDownloadPdf}
        onOpenShare={() => setIsShareModalOpen(true)}
        onClearProgram={() => setIsClearModalOpen(true)}
        isGeneratingPdf={isGeneratingPdf}
      />

      {/* Day Schedule Selection Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">Training Schedule</h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Click a day to view exercises</span>
        </div>
        <DayTabs
          days={program.days}
          activeDayIndex={activeDayIndex}
          onSelectDay={(idx) => {
            setActiveDayIndex(idx);
            setHoveredPrimary([]);
            setHoveredSecondary([]);
          }}
        />
      </div>

      {/* Main Grid: Left Exercise Cards, Right Sticky Body Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Exercises */}
        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-[#121212] border border-zinc-200 dark:border-gym-border px-5 py-3.5 rounded-2xl transition-colors">
            <div>
              <span className="text-xs font-bold text-gym-limeDark dark:text-gym-lime uppercase tracking-wider block">
                Day {currentDay.dayNumber} Routine
              </span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">{currentDay.title}</h3>
            </div>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {currentDay.exercises.length} Exercises (~{currentDay.estimatedDuration} min)
            </span>
          </div>

          <div className="space-y-3.5">
            {currentDay.exercises.map((item, idx) => (
              <ExerciseCard
                key={`${item.exercise.id}-${idx}`}
                item={item}
                index={idx}
                onOpenDetails={() => setSelectedItemForDetails(item)}
                onOpenVideo={() => setSelectedExerciseForVideo(item.exercise)}
                onOpenSwap={() => setSelectedItemForSwap(item)}
                onHoverMuscles={(pri, sec) => {
                  setHoveredPrimary(pri);
                  setHoveredSecondary(sec);
                }}
                onLeaveMuscles={() => {
                  setHoveredPrimary([]);
                  setHoveredSecondary([]);
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Anatomical Muscle Map */}
        <div className="lg:col-span-5 min-w-0 lg:sticky lg:top-24 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Target Muscle Activation
            </h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Hover exercises to highlight</span>
          </div>

          <BodyVisualizer
            primaryMuscles={activeDayPrimary}
            secondaryMuscles={activeDaySecondary}
            interactive={true}
            gender={program.userProfile.gender}
            allowGenderToggle={false}
          />

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#121212] border border-zinc-200 dark:border-gym-border text-xs text-zinc-600 dark:text-zinc-400 space-y-1 transition-colors">
            <span className="font-bold text-zinc-900 dark:text-zinc-200 block">Biomechanical Balance:</span>
            <p>
              Day {currentDay.dayNumber} targets{' '}
              <strong className="text-gym-limeDark dark:text-gym-lime">{currentDay.focusMuscles.join(', ')}</strong> with compound volume and targeted assistance to prevent muscular asymmetries.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Modals rendered outside animated stacking context */}
    <VideoModal
        exercise={selectedExerciseForVideo}
        isOpen={Boolean(selectedExerciseForVideo)}
        onClose={() => setSelectedExerciseForVideo(null)}
      />

      <ExerciseDetailModal
        item={selectedItemForDetails}
        isOpen={Boolean(selectedItemForDetails)}
        onClose={() => setSelectedItemForDetails(null)}
        onOpenVideo={() => {
          if (selectedItemForDetails) {
            setSelectedExerciseForVideo(selectedItemForDetails.exercise);
          }
        }}
        onOpenSwap={() => {
          if (selectedItemForDetails) {
            const item = selectedItemForDetails;
            setSelectedItemForDetails(null);
            setSelectedItemForSwap(item);
          }
        }}
      />

      <ExerciseSwapModal
        item={selectedItemForSwap}
        profile={program.userProfile}
        currentWorkoutExercises={currentDay.exercises}
        isOpen={Boolean(selectedItemForSwap)}
        onClose={() => setSelectedItemForSwap(null)}
        onSelectAlternative={handleSelectAlternative}
      />

      <ShareQrModal
        shareUrl={shareUrl}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Clear Active Program Confirmation Dialog */}
      {isClearModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-program-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsClearModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gym-card border border-zinc-200 dark:border-gym-border rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 id="clear-program-title" className="text-xl font-black text-zinc-900 dark:text-white">
                Clear Active Workout Program?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                This will remove your current active workout schedule from this device. Your questionnaire answers (goals, equipment, and experience) will be kept safe so you can generate a new program anytime.
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                Note: Your Nigerian meal planner, food inventory, and feedback comments are preserved.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs sm:text-sm transition-colors min-h-[44px]"
              >
                Keep Program
              </button>
              <button
                type="button"
                onClick={handleConfirmClearProgram}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all min-h-[44px]"
              >
                Yes, Clear Program
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ProgramPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-gym-lime border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Loading workout program...</p>
        </div>
      }
    >
      <ProgramContent />
    </Suspense>
  );
}
