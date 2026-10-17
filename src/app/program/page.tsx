'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { WorkoutProgram, WorkoutExerciseItem, Exercise, MuscleGroup } from '@/types/workout';
import { loadActiveProgram, saveActiveProgram } from '@/lib/storage';
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
import { Sparkles, Dumbbell } from 'lucide-react';

function ProgramContent() {
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

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-gym-lime border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Loading workout program...</p>
      </div>
    );
  }

  // Empty state if no program exists
  if (!program) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-zinc-900 border border-gym-border flex items-center justify-center text-gym-lime shadow-lime-sm">
          <Dumbbell className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-white">No Active Workout Program</h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          You haven't generated a personalized workout program yet. Complete our 2-minute questionnaire to receive an equipment-matched plan.
        </p>
        <Link
          href="/questionnaire"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gym-lime hover:bg-gym-limeLight text-black font-extrabold text-sm shadow-lime-md transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4 fill-black" />
          <span>Create My Program</span>
        </Link>
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 animate-fadeIn">
      {/* Plan Header */}
      <PlanHeader
        program={program}
        onDownloadPdf={handleDownloadPdf}
        onOpenShare={() => setIsShareModalOpen(true)}
        isGeneratingPdf={isGeneratingPdf}
      />

      {/* Day Schedule Selection Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white">Training Schedule</h2>
          <span className="text-xs text-zinc-400">Click a day to view exercises</span>
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
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between bg-[#121212] border border-gym-border px-5 py-3.5 rounded-2xl">
            <div>
              <span className="text-xs font-bold text-gym-lime uppercase tracking-wider block">
                Day {currentDay.dayNumber} Routine
              </span>
              <h3 className="text-base font-bold text-white">{currentDay.title}</h3>
            </div>
            <span className="text-xs font-semibold text-zinc-400">
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
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              Target Muscle Activation
            </h3>
            <span className="text-xs text-zinc-400">Hover exercises to highlight</span>
          </div>

          <BodyVisualizer
            primaryMuscles={activeDayPrimary}
            secondaryMuscles={activeDaySecondary}
            interactive={true}
            gender={program.userProfile.gender}
            allowGenderToggle={false}
          />

          <div className="p-4 rounded-2xl bg-[#121212] border border-gym-border text-xs text-zinc-400 space-y-1">
            <span className="font-bold text-zinc-200 block">Biomechanical Balance:</span>
            <p>
              Day {currentDay.dayNumber} targets{' '}
              <strong className="text-gym-lime">{currentDay.focusMuscles.join(', ')}</strong> with compound volume and targeted assistance to prevent muscular asymmetries.
            </p>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        exercise={selectedExerciseForVideo}
        isOpen={Boolean(selectedExerciseForVideo)}
        onClose={() => setSelectedExerciseForVideo(null)}
      />

      {/* Exercise Detail Modal */}
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

      {/* Exercise Swap Modal */}
      <ExerciseSwapModal
        item={selectedItemForSwap}
        profile={program.userProfile}
        currentWorkoutExercises={currentDay.exercises}
        isOpen={Boolean(selectedItemForSwap)}
        onClose={() => setSelectedItemForSwap(null)}
        onSelectAlternative={handleSelectAlternative}
      />

      {/* Share / QR Modal */}
      <ShareQrModal
        shareUrl={shareUrl}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
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
