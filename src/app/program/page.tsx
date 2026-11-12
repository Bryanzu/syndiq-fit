'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { flushSync } from 'react-dom';
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
import { BodyFigure } from '@/components/body/BodyFigure';
import { adaptExerciseVolume, calculateWorkoutDuration } from '@/engine/volumeRules';
import { Sheet } from '@/components/ui/Sheet';
import { toast } from '@/components/ui/Toaster';
import { useWorkoutSession } from '@/context/WorkoutSessionContext';
import { track } from '@/lib/analytics/client';
import { Sparkles, Trash2, X, Play } from 'lucide-react';

function ProgramContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const workout = useWorkoutSession();

  // Row-to-sheet morph: which row carries the shared name, and whether the open sheet does
  const [morphIndex, setMorphIndex] = useState<number | null>(null);
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [sheetMorph, setSheetMorph] = useState(false);

  const canMorph = () =>
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Opens the instructions; where the browser supports it, the row grows into the sheet. */
  const openDetails = (item: WorkoutExerciseItem, idx: number) => {
    if (!canMorph()) {
      setSheetMorph(false);
      setSelectedItemForDetails(item);
      return;
    }
    flushSync(() => setMorphIndex(idx));
    (document as any).startViewTransition(() => {
      flushSync(() => {
        setMorphIndex(null);
        setSheetMorph(true);
        setDetailIndex(idx);
        setSelectedItemForDetails(item);
      });
    });
  };

  /** Closes the instructions, shrinking the sheet back into its row. */
  const closeDetails = () => {
    if (!canMorph() || !sheetMorph || detailIndex === null) {
      setSelectedItemForDetails(null);
      return;
    }
    const idx = detailIndex;
    const transition = (document as any).startViewTransition(() => {
      flushSync(() => {
        setSelectedItemForDetails(null);
        setMorphIndex(idx);
      });
    });
    transition.finished.finally(() => {
      setMorphIndex(null);
      setDetailIndex(null);
      setSheetMorph(false);
    });
  };

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
        track('share_opened');
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
      toast(`${newExercise.name} is already in today's session. Pick a different exercise.`);
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
          substitutionReason: 'Your swap',
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
      <div className="page py-6 sm:py-10 space-y-8" aria-busy="true" aria-label="Loading workout program">
        <div className="space-y-3">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-9 w-3/4 max-w-md" />
          <div className="skeleton h-4 w-full max-w-lg" />
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-10 w-24 !rounded-full" />
          ))}
        </div>
        <div className="space-y-4 max-w-2xl">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 w-full" />
          ))}
        </div>
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
              Answer eight questions and your week is ready. Your last answers are saved.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Link href="/questionnaire" className="btn-primary px-7">
                <Sparkles className="w-4 h-4" /> Create new program
              </Link>
              <Link href="/meal-planner" className="btn bg-white/15 text-white backdrop-blur hover:bg-gym-card/25">
                Plan my meals
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
  const muscleIntensity: Partial<Record<MuscleGroup, number>> = {};
  activeDaySecondary.forEach((m) => (muscleIntensity[m] = 0.35));
  activeDayPrimary.forEach((m) => (muscleIntensity[m] = 1));

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/program?p=${encodeProfileToQuery(program.userProfile)}`
      : '';

  return (
    <>
      <div className="page pb-8 pt-1 sm:py-10 space-y-8">
        <PlanHeader
          program={program}
          onDownloadPdf={handleDownloadPdf}
          onOpenShare={() => setIsShareModalOpen(true)}
          onClearProgram={() => setIsClearModalOpen(true)}
          isGeneratingPdf={isGeneratingPdf}
        />

        <div className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-gym-text">Your week</h2>
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

            <button
              type="button"
              onClick={() => workout.start(program, program.days.indexOf(currentDay))}
              className="btn-primary mt-3 w-full sm:w-auto sm:px-7"
            >
              <Play className="w-4 h-4 fill-current" />
              {workout.isActiveFor(currentDay) ? 'Resume workout' : 'Start workout'}
            </button>

            <div className="divide-line">
              {currentDay.exercises.map((item, idx) => (
                <ExerciseCard
                  key={`${item.exercise.id}-${idx}`}
                  item={item}
                  index={idx}
                  onOpenDetails={() => openDetails(item, idx)}
                  morphName={morphIndex === idx ? 'exercise-surface' : undefined}
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

            <div className="surface grid grid-cols-2 gap-2 !rounded-[32px] p-4">
              <BodyFigure view="front" build={program.userProfile.gender} selected={null} intensity={muscleIntensity} interactive={false} className="mx-auto w-full max-w-[11rem]" />
              <BodyFigure view="back" build={program.userProfile.gender} selected={null} intensity={muscleIntensity} interactive={false} className="mx-auto w-full max-w-[11rem]" />
            </div>

            <p className="t-small leading-relaxed">
              Day {currentDay.dayNumber} trains{' '}
              <strong className="text-gym-limeDark dark:text-gym-lime font-semibold">
                {currentDay.focusMuscles.map((m) => m.replace('_', ' ')).join(', ')}
              </strong>{' '}
              today.
            </p>
          </div>
        </div>
      </div>

      {/* Modals rendered outside animated stacking context */}
      <ExerciseDetailModal
        item={selectedItemForDetails}
        isOpen={Boolean(selectedItemForDetails)}
        onClose={closeDetails}
        morph={sheetMorph}
        onOpenVideo={() => {
          if (selectedItemForDetails) {
            setSelectedExerciseForVideo(selectedItemForDetails.exercise);
          }
        }}
        onOpenSwap={() => {
          if (selectedItemForDetails) {
            const item = selectedItemForDetails;
            setSheetMorph(false);
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

      {/* Clear Active Program Confirmation */}
      <Sheet
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        labelledBy="clear-program-title"
        maxWidth="max-w-md"
      >
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between">
            <span className="flex size-12 items-center justify-center rounded-3xl bg-red-500/10 text-red-500">
              <Trash2 className="w-6 h-6" />
            </span>
            <button type="button" onClick={() => setIsClearModalOpen(false)} className="btn-icon" aria-label="Close dialog">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <h3 id="clear-program-title" className="t-section !text-xl">
              Clear Active Workout Program?
            </h3>
            <p className="t-small leading-relaxed">
              This removes the current schedule from this device. Your questionnaire answers are kept, so you can
              generate a new program anytime.
            </p>
            <p className="t-small pt-2 border-t hairline">
              Your meal plan, food inventory and feedback are not affected.
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2.5">
            <button type="button" onClick={() => setIsClearModalOpen(false)} className="btn-secondary flex-1">
              Keep Program
            </button>
            <button type="button" onClick={handleConfirmClearProgram} className="btn flex-1 bg-red-600 text-white hover:bg-red-700">
              Yes, Clear Program
            </button>
          </div>
        </div>
      </Sheet>
    </>
  );
}

export default function ProgramPage() {
  return (
    <Suspense
      fallback={
        <div className="page py-6 sm:py-10 space-y-8" aria-busy="true" aria-label="Loading workout program">
        <div className="space-y-3">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-9 w-3/4 max-w-md" />
          <div className="skeleton h-4 w-full max-w-lg" />
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-10 w-24 !rounded-full" />
          ))}
        </div>
        <div className="space-y-4 max-w-2xl">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 w-full" />
          ))}
        </div>
      </div>
      }
    >
      <ProgramContent />
    </Suspense>
  );
}
