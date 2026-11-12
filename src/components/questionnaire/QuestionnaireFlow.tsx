'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Dumbbell } from 'lucide-react';
import { UserProfile } from '@/types/questionnaire';
import { WorkoutProgram } from '@/types/workout';
import { STANDARD_COMMERCIAL_GYM_IDS } from '@/data/equipment';
import { GOAL_OPTIONS, INJURY_OPTIONS } from '@/data/questionnaireOptions';
import { generateWorkoutProgram } from '@/engine/programAssembler';
import { ARCHIVE_KEEP_DAYS, archiveActiveProgram, loadActiveProgram, loadSavedProfile, saveActiveProgram } from '@/lib/storage';
import { toast } from '@/components/ui/Toaster';
import { FlowShell } from '@/components/flow/FlowShell';
import { FlowButton, FlowSecondaryButton } from '@/components/flow/controls';
import { BuildingView, ResultPanel } from '@/components/flow/BuildingView';
import { EquipmentSheet } from './EquipmentSheet';
import { bracketForAge, joinList, numberWord, SETUPS, setupFor, yearsFromProfile } from './profileHelpers';
import {
  AgeStep,
  DaysStep,
  EquipmentStep,
  ExperienceStep,
  FOCUS_IDS,
  GoalStep,
  InjuriesStep,
  LengthStep,
  SexStep,
  StepProps,
  WorkoutAnswers,
} from './WorkoutSteps';

const STEPS = ['sex', 'age', 'experience', 'goal', 'days', 'length', 'equipment', 'injuries'] as const;
type StepId = (typeof STEPS)[number];

const PHOTO: Record<StepId | 'done', string> = {
  sex: '/images/fitness-hero.jpg',
  age: '/images/fitness-hero.jpg',
  experience: '/images/training-weights.jpg',
  goal: '/images/training-weights.jpg',
  days: '/images/workout-empty.jpg',
  length: '/images/workout-empty.jpg',
  equipment: '/images/training-weights.jpg',
  injuries: '/images/fitness-hero.jpg',
  done: '/images/workout-empty.jpg',
};

const AUTO_ADVANCE_MS = 300;

const DEFAULT_ANSWERS: WorkoutAnswers = {
  gender: 'male',
  ageYears: 26,
  experience: 'beginner',
  goal: 'muscle_building',
  secondaryGoals: [],
  frequency: 'recommend',
  lastDays: 4,
  duration: 60,
  equipment: STANDARD_COMMERCIAL_GYM_IDS,
  injuries: [],
  injuryNotes: '',
};

function answersFromProfile(saved: UserProfile): WorkoutAnswers {
  const frequency = saved.frequency ?? DEFAULT_ANSWERS.frequency;
  return {
    gender: saved.gender ?? DEFAULT_ANSWERS.gender,
    ageYears: saved.age ? yearsFromProfile(saved) : DEFAULT_ANSWERS.ageYears,
    experience: saved.experience ?? DEFAULT_ANSWERS.experience,
    goal: saved.goal ?? DEFAULT_ANSWERS.goal,
    // The new screen only offers muscle focus as a second goal
    secondaryGoals: (saved.secondaryGoals ?? []).filter((g) => FOCUS_IDS.includes(g) && g !== saved.goal),
    frequency,
    lastDays: typeof frequency === 'number' ? frequency : DEFAULT_ANSWERS.lastDays,
    duration: saved.duration ?? DEFAULT_ANSWERS.duration,
    equipment: saved.availableEquipment?.length ? saved.availableEquipment : DEFAULT_ANSWERS.equipment,
    injuries: (saved.injuries ?? []).filter((i) => i !== 'none'),
    injuryNotes: saved.injuryNotes ?? '',
  };
}

function profileFromAnswers(a: WorkoutAnswers): UserProfile {
  return {
    gender: a.gender,
    age: bracketForAge(a.ageYears),
    ageYears: a.ageYears,
    experience: a.experience,
    goal: a.goal,
    secondaryGoals: a.secondaryGoals.length ? a.secondaryGoals : undefined,
    frequency: a.frequency,
    duration: a.duration,
    availableEquipment: a.equipment,
    injuries: a.injuries.length ? a.injuries : ['none'],
    injuryNotes: a.injuryNotes.trim() || undefined,
  };
}

const injuryNames = (a: WorkoutAnswers) =>
  INJURY_OPTIONS.filter((o) => a.injuries.includes(o.id) && o.id !== 'other').map((o) => o.label.toLowerCase());

function kitLine(a: WorkoutAnswers): string {
  const setup = setupFor(a.equipment);
  if (setup === 'gym') return 'Matched to your full gym';
  if (setup === 'home') return 'Matched to your home gym';
  if (setup === 'all') return 'Using every piece of kit';
  const count = a.equipment.filter((id) => id !== 'bodyweight_only').length;
  return count === 0 ? 'Bodyweight moves only' : `Matched to your ${count} pieces of kit`;
}

function buildingLines(a: WorkoutAnswers, program: WorkoutProgram): string[] {
  const sore = injuryNames(a);
  const goal = GOAL_OPTIONS.find((g) => g.id === a.goal)?.label ?? '';
  const days = numberWord(program.days.length);
  return [
    kitLine(a),
    sore.length ? `Working around your ${joinList(sore)}` : `Goal: ${goal.toLowerCase()}`,
    `${days.charAt(0).toUpperCase()}${days.slice(1)} days, ${a.duration} minutes each`,
  ];
}

function summaryChips(a: WorkoutAnswers, program: WorkoutProgram): string[] {
  const setup = setupFor(a.equipment);
  const sore = injuryNames(a);
  const chips = [
    `${program.days.length} days a week`,
    `${a.duration} min`,
    setup ? SETUPS.find((s) => s.id === setup)!.label : 'Your own kit',
  ];
  if (sore.length) chips.push(`Easy on your ${joinList(sore)}`);
  return chips;
}

export function QuestionnaireFlow() {
  const router = useRouter();
  const [answers, setAnswers] = useState<WorkoutAnswers>(DEFAULT_ANSWERS);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [phase, setPhase] = useState<'existing' | 'questions' | 'building' | 'ready'>('questions');
  const [existing, setExisting] = useState<WorkoutProgram | null>(null);
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  // Pre-fill from the last program's answers. With a program already in use, ask first,
  // unless the person came from "Edit answers" (?edit=1) and has already chosen to change it.
  useEffect(() => {
    const saved = loadSavedProfile();
    if (saved) setAnswers(answersFromProfile(saved));
    const current = loadActiveProgram();
    if (current && new URLSearchParams(window.location.search).get('edit') !== '1') {
      setExisting(current);
      setPhase('existing');
    }
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const step: StepId = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const update = (patch: Partial<WorkoutAnswers>) => setAnswers((a) => ({ ...a, ...patch }));

  const goTo = (to: number) => {
    window.clearTimeout(timer.current);
    setDirection(to > index ? 1 : -1);
    setIndex(to);
  };

  const autoNext = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setDirection(1);
      setIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, AUTO_ADVANCE_MS);
  };

  const build = () => {
    window.clearTimeout(timer.current);
    try {
      const next = generateWorkoutProgram(profileFromAnswers(answers));
      // Keep the program being replaced, unless it is the one built a moment ago in this flow
      if (loadActiveProgram()?.id !== program?.id) archiveActiveProgram();
      saveActiveProgram(next);
      setProgram(next);
      setDirection(1);
      setPhase('building');
    } catch (err) {
      console.error('Failed to generate program:', err);
      toast("Couldn't build the program. Try changing an answer.");
    }
  };

  const props: StepProps = { answers, update, autoNext };
  const building = phase === 'building' && program !== null;
  const ready = phase === 'ready' && program !== null;
  const asking = phase === 'existing' && existing !== null;
  const questions = !building && !ready && !asking;

  return (
    <FlowShell
      label="Build your program"
      photo={questions ? PHOTO[step] : PHOTO.done}
      shade={building ? 'blur' : ready || asking ? 'result' : 'question'}
      screenKey={building ? 'building' : ready ? 'ready' : asking ? 'existing' : step}
      direction={direction}
      step={questions ? index + 1 : undefined}
      total={questions ? STEPS.length : undefined}
      onBack={
        ready
          ? () => {
              setDirection(-1);
              setPhase('questions');
            }
          : questions && index > 0
          ? () => goTo(index - 1)
          : undefined
      }
      onClose={asking || (questions && index === 0) ? () => router.push('/') : undefined}
      footer={
        questions ? (
          <FlowButton onClick={isLast ? build : () => goTo(index + 1)}>{isLast ? 'Build my program' : 'Continue'}</FlowButton>
        ) : undefined
      }
      overlays={
        <EquipmentSheet
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          equipment={answers.equipment}
          onChange={(equipment) => update({ equipment })}
        />
      }
    >
      {asking && existing && (
        <ResultPanel>
          <p className="text-[13px] font-semibold text-gym-lime">Current program</p>
          <h2 className="text-[34px] font-bold leading-[1.08] tracking-[-0.035em] text-gym-text">You already have a program</h2>
          <p className="text-[15px] font-semibold text-gym-text">{existing.name}</p>
          <p className="text-sm leading-relaxed text-gym-textMuted">
            Build a new one and this one moves to Settings, where you can bring it back for {ARCHIVE_KEEP_DAYS} days. Your
            workout history and lift weights stay.
          </p>
          <div className="flex flex-col gap-2.5 pt-1">
            <FlowButton onClick={() => router.push('/program')}>Go to my program</FlowButton>
            <FlowSecondaryButton
              onClick={() => {
                setDirection(1);
                setPhase('questions');
              }}
            >
              Build a new one
            </FlowSecondaryButton>
          </div>
        </ResultPanel>
      )}
      {building && program && (
        <BuildingView
          title="Building your program"
          icon={<Dumbbell className="h-11 w-11" strokeWidth={2.2} />}
          lines={buildingLines(answers, program)}
          onDone={() => setPhase('ready')}
        />
      )}
      {ready && program && (
        <ResultPanel>
          <p className="flex items-center gap-2 text-[13px] font-semibold text-gym-lime">
            <span className="flex size-[26px] items-center justify-center rounded-full bg-gym-lime text-gym-ink">
              <Check className="h-[15px] w-[15px]" strokeWidth={3.4} />
            </span>
            Built for you
          </p>
          <h2 className="text-[34px] font-bold leading-[1.08] tracking-[-0.035em] text-gym-text">
            Your program
            <br />
            is ready.
          </h2>
          <ul className="flex flex-wrap gap-2" aria-label="Program summary">
            {summaryChips(answers, program).map((c) => (
              <li key={c} className="glass-inset rounded-full px-3.5 py-2 text-[13px] font-semibold text-gym-text">
                {c}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2.5 pt-1">
            <FlowButton onClick={() => router.push('/program')}>See my program</FlowButton>
            <FlowSecondaryButton onClick={() => router.push('/meal-planner?new=1')}>Plan my meals too</FlowSecondaryButton>
          </div>
        </ResultPanel>
      )}
      {questions && step === 'sex' && <SexStep {...props} />}
      {questions && step === 'age' && <AgeStep {...props} />}
      {questions && step === 'experience' && <ExperienceStep {...props} />}
      {questions && step === 'goal' && <GoalStep {...props} />}
      {questions && step === 'days' && <DaysStep {...props} />}
      {questions && step === 'length' && <LengthStep {...props} />}
      {questions && step === 'equipment' && <EquipmentStep {...props} onFineTune={() => setSheetOpen(true)} />}
      {questions && step === 'injuries' && <InjuriesStep {...props} />}
    </FlowShell>
  );
}
