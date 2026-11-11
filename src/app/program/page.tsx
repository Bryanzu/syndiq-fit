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
import { useModalScrollLock } from '@/hooks/useModalScrollLock';
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

  // Lock scroll when clear modal is open
  useModalScrollLock(isClearModalOpen, () => setIsClearModalOpen(false));

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
        <p className="text-xs font-bold uppercase tracking-wider text-gym-textMuted">Loading workout program...</p>
      </div>
    );
  }

  // Empty state if no program exists
  if (!program) {
    return (
      <div className="page py-8 sm:py-14 max-w-3xl animate-fadeIn">
        <div className="relative isolate overflow-hidden rounded-3xl">
          <Image
            src="/images/workout-empty.jpg"
            alt=""
            fill
            className="object-cover -z-20"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/55 to-black/20" />
          <div className="p-7 sm:p-10 pt-44 sm:pt-60 space-y-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gym-lime">Ready when you are</p>
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight leading-tight">
              No active <strong className="font-semibold">workout program</strong>
            </h1>
            <p className="text-sm sm:text-base text-white/75 max-w-lg leading-relaxed">
              You haven&apos;t generated a program yet, or your previous schedule was cleared. Your questionnaire answers are
              kept, so a new split takes seconds.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Link href="/questionnaire" className="btn-primary px-7">
                <Sparkles className="w-4 h-4" /> Create new program
              </Link>
              <Link href="/meal-planner" className="btn bg-white/15 text-white backdrop-blur hover:bg-white/25">
                View meal planner
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
      <div className="page py-6 sm:py-10 space-y-8 animate-fadeIn">
        <PlanHeader
          program={program}
          onDownloadPdf={handleDownloadPdf}
          onOpenShare={() => setIsShareModalOpen(true)}
          onClearProgram={() => setIsClearModalOpen(true)}
          isGeneratingPdf={isGeneratingPdf}
        />

        <div className="space-y-3">
          <h2 className="t-section">Training schedule</h2>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7 min-w-0">
            <div className="flex items-baseline justify-between gap-3 pb-1">
              <h3 className="text-base sm:text-lg font-semibold text-gym-text">
                {currentDay.title.replace(/^Day \d+\s*[—–-]\s*/, '')}
              </h3>
              <span className="t-small shrink-0">
                {currentDay.exercises.length} exercises · ~{currentDay.estimatedDuration} min
              </span>
            </div>

            <div className="divide-line">
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

          <div className="lg:col-span-5 min-w-0 lg:sticky lg:top-24 space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="t-eyebrow">Muscles worked</h3>
              <span className="t-small hidden lg:inline">Hover an exercise to highlight</span>
            </div>

            <BodyVisualizer
              primaryMuscles={activeDayPrimary}
              secondaryMuscles={activeDaySecondary}
              interactive={true}
              gender={program.userProfile.gender}
              allowGenderToggle={false}
            />

            <p className="t-small leading-relaxed">
              Day {currentDay.dayNumber} targets{' '}
              <strong className="text-gym-limeDark dark:text-gym-lime font-semibold">
                {currentDay.focusMuscles.map((m) => m.replace('_', ' ')).join(', ')}
              </strong>{' '}
              with compound volume and targeted assistance to prevent muscular asymmetries.
            </p>
          </div>
        </div>
      </div>

      {/* Modals rendered outside animated stacking context */}
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

      <VideoModal
        exercise={selectedExerciseForVideo}
        isOpen={Boolean(selectedExerciseForVideo)}
        onClose={() => setSelectedExerciseForVideo(null)}
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 dark:bg-black/85 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsClearModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gym-card rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative animate-scaleUp"
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
              <h3 id="clear-program-title" className="text-xl font-bold text-gym-text">
                Clear Active Workout Program?
              </h3>
              <p className="text-xs sm:text-sm text-gym-textMuted leading-relaxed">
                This will remove your current active workout schedule from this device. Your questionnaire answers (goals, equipment, and experience) will be kept safe so you can generate a new program anytime.
              </p>
              <p className="text-xs text-gym-textMuted pt-2 border-t border-gym-border">
                Note: Your Nigerian meal planner, food inventory, and feedback comments are preserved.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-gym-text font-bold text-xs sm:text-sm transition-colors min-h-[44px]"
              >
                Keep Program
              </button>
              <button
                type="button"
                onClick={handleConfirmClearProgram}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm transition-all min-h-[44px]"
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
