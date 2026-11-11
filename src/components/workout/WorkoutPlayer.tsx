'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Check, ChevronDown, ChevronRight, Minus, Play, Plus, SkipForward, Trophy } from 'lucide-react';
import { Exercise, MuscleGroup } from '@/types/workout';
import { useNow, useWorkoutSession } from '@/context/WorkoutSessionContext';
import { useModalScrollLock } from '@/hooks/useModalScrollLock';
import { completedSets, formatClock, nextIncompleteIndex, totalSets } from '@/lib/workoutSession';
import { LiftEntry, lastLift, logLift } from '@/lib/liftHistory';
import { toLocalISODate } from '@/lib/progress';
import { VideoModal } from '@/components/program/VideoModal';
import { exercisePhoto } from '@/lib/photos';

const formatMuscle = (m: MuscleGroup) =>
  m.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const stripDayPrefix = (title: string) => title.replace(/^Day \d+\s*[—–-]\s*/, '');

/** "30-60s" or "30-40m" are holds or distances, not counted reps */
const isTimed = (reps: string) => /\d\s*(s|m)$/.test(reps);
const firstNumber = (reps: string) => parseInt(reps, 10) || 10;

const RING_RADIUS = 88;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const PHOTO_SHADE =
  'linear-gradient(180deg, rgba(7,9,13,0.66) 0%, rgba(7,9,13,0.25) 28%, rgba(7,9,13,0.6) 60%, rgba(7,9,13,0.94) 100%)';

function Backdrop({ src = '/images/training-weights.jpg' }: { src?: string }) {
  return (
    <>
      <Image key={src} src={src} alt="" fill priority sizes="100vw" className="animate-fadeIn -z-20 object-cover" />
      <div className="absolute inset-0 -z-10" style={{ background: PHOTO_SHADE }} />
    </>
  );
}

function Stepper({
  label,
  value,
  unit,
  step,
  onChange,
}: {
  label: string;
  value: number;
  unit?: string;
  step: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="glass-inset flex items-center justify-between rounded-[22px] p-1.5">
      <button
        type="button"
        aria-label={`Less ${label.toLowerCase()}`}
        onClick={() => onChange(Math.max(0, value - step))}
        className="tap flex size-11 items-center justify-center rounded-full bg-white/10"
      >
        <Minus className="h-4 w-4" strokeWidth={2.6} />
      </button>
      <div className="text-center leading-tight">
        <p className="text-xl font-bold tabular-nums tracking-tight">
          {value}
          {unit && <span className="text-sm font-medium text-white/75"> {unit}</span>}
        </p>
        <p className="text-[11px] font-medium text-white/75">{label}</p>
      </div>
      <button
        type="button"
        aria-label={`More ${label.toLowerCase()}`}
        onClick={() => onChange(value + step)}
        className="tap flex size-11 items-center justify-center rounded-full bg-white/10"
      >
        <Plus className="h-4 w-4" strokeWidth={2.6} />
      </button>
    </div>
  );
}

/**
 * Full-screen "now training" view over a photo: one exercise at a time, weight and reps logged
 * per set, a rest countdown and the session queue. Collapses to the MiniPlayer.
 */
export function WorkoutPlayer() {
  const { session, expanded, setExpanded, completeSet, skipRest, addRest, goTo, finish, close } = useWorkoutSession();
  const [videoExercise, setVideoExercise] = useState<Exercise | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(10);
  const [previous, setPrevious] = useState<LiftEntry | null>(null);

  const open = Boolean(session && expanded);
  useModalScrollLock(open);
  const now = useNow(open ? 250 : null);

  // Escape collapses the player, unless another dialog (e.g. the demo video) is on top of it
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.querySelectorAll('[role="dialog"]').length <= 1) setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setExpanded]);

  // Moving to another exercise: prefill from the last time it was done
  const currentItem = session ? session.day.exercises[session.exerciseIndex] : undefined;
  const currentId = currentItem?.exercise.id;
  const currentReps = currentItem?.reps;
  useEffect(() => {
    if (!currentId || !currentReps) return;
    const last = lastLift(currentId);
    const counted = last && last.reps > 0 ? last : null;
    setPrevious(counted);
    setWeight(counted?.weight ?? 0);
    setReps(counted?.reps ?? firstNumber(currentReps));
    setShowSteps(false);
  }, [currentId, currentReps]);

  if (!session || !expanded) return null;

  const { day } = session;
  const done = completedSets(session);
  const total = totalSets(session);
  const title = stripDayPrefix(day.title);

  /* ---------------------------------------------------------------- */
  /* Summary                                                           */
  /* ---------------------------------------------------------------- */
  if (session.finishedAt) {
    const minutes = Math.max(1, Math.round((session.finishedAt - session.startedAt) / 60000));
    const exercisesDone = session.setsDone.filter((n, i) => n >= day.exercises[i].sets).length;
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="workout-summary-title"
        className="on-photo animate-sheetUp fixed inset-0 isolate z-[90] flex flex-col justify-end overflow-hidden bg-[#07090D]"
      >
        <Backdrop />
        <div className="glass animate-panelUp mx-auto m-3 w-[calc(100%-1.5rem)] max-w-xl space-y-6 rounded-[40px] p-6 text-center">
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-gym-lime text-gym-ink">
            <Trophy className="h-9 w-9" strokeWidth={2} />
          </span>
          <div className="space-y-1">
            <p className="text-[13px] font-semibold text-gym-lime">Workout complete</p>
            <h2 id="workout-summary-title" className="text-[1.75rem] font-bold leading-tight tracking-[-0.03em]">
              {title}
            </h2>
          </div>
          <dl className="grid grid-cols-3 gap-2">
            {[
              [String(minutes), 'minutes'],
              [`${done}/${total}`, 'sets'],
              [`${exercisesDone}/${day.exercises.length}`, 'exercises'],
            ].map(([value, label]) => (
              <div key={label} className="glass-inset rounded-[22px] px-2 py-4">
                <dt className="text-2xl font-bold tabular-nums tracking-tight">{value}</dt>
                <dd className="text-xs text-white/80">{label}</dd>
              </div>
            ))}
          </dl>
          <button type="button" onClick={close} className="btn-primary w-full !min-h-[60px] !text-[17px]">
            Done
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Active workout                                                    */
  /* ---------------------------------------------------------------- */
  const index = session.exerciseIndex;
  const item = day.exercises[index];
  const exercise = item.exercise;
  const setsDoneHere = session.setsDone[index] ?? 0;
  const exerciseComplete = setsDoneHere >= item.sets;
  const currentSet = Math.min(item.sets, setsDoneHere + 1);
  const timed = isTimed(item.reps);
  const usesLoad = !timed && exercise.equipment !== 'bodyweight';
  const nextItem = day.exercises[index + 1];

  const restRemaining = session.rest ? session.rest.endsAt - now : 0;
  const resting = Boolean(session.rest) && restRemaining > 0;
  const restFraction = session.rest ? Math.min(1, Math.max(0, restRemaining / session.rest.totalMs)) : 0;

  const setDone = () => {
    // Every set is logged (the body map counts them); holds and carries record no weight or reps
    const entry = { date: toLocalISODate(), weight: usesLoad ? weight : 0, reps: timed ? 0 : reps };
    logLift(exercise.id, entry);
    if (!timed) setPrevious(entry);
    completeSet();
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Workout in progress: ${title}`}
        className="on-photo animate-sheetUp fixed inset-0 isolate z-[90] flex flex-col overflow-hidden bg-[#07090D] pt-[env(safe-area-inset-top)]"
      >
        <Backdrop src={exercisePhoto(exercise)} />

        {/* Header */}
        <header className="mx-auto flex w-full max-w-xl shrink-0 items-center justify-between gap-2 px-4 pt-3">
          <button type="button" onClick={() => setExpanded(false)} className="glass-btn" aria-label="Minimise workout">
            <ChevronDown className="h-[22px] w-[22px]" strokeWidth={2.4} />
          </button>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-semibold">{title}</p>
            <p className="text-[13px] tabular-nums text-white/80">
              {formatClock(now - session.startedAt)} · {done} of {total} sets
            </p>
          </div>
          <button type="button" onClick={finish} className="glass-btn px-4 text-sm font-semibold">
            End
          </button>
        </header>

        {/* One segment per exercise */}
        <ol
          className="mx-auto mt-4 flex w-full max-w-xl shrink-0 gap-1 px-4"
          aria-label={`Exercise ${index + 1} of ${day.exercises.length}`}
        >
          {day.exercises.map((it, i) => {
            const complete = (session.setsDone[i] ?? 0) >= it.sets;
            return (
              <li
                key={`${it.exercise.id}-${i}`}
                className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                  complete ? 'bg-gym-lime' : i === index ? 'bg-white/75' : 'bg-white/25'
                }`}
              />
            );
          })}
        </ol>

        <div className="modal-content-scroll mx-auto flex w-full max-w-xl flex-1 flex-col overflow-y-auto px-3 pb-3">
          {/* Title sits on the photo */}
          <section key={exercise.id} className="animate-riseIn flex min-h-[9rem] flex-1 flex-col justify-end px-3 pb-5 pt-12" aria-live="polite">
            <p className="text-[13px] font-semibold text-gym-lime">
              Exercise {index + 1} of {day.exercises.length}
            </p>
            <h2 className="mt-1 text-[2.25rem] font-bold leading-[1.04] tracking-[-0.04em]">{exercise.name}</h2>
            <p className="mt-1.5 text-[15px] text-white/85">
              {exercise.primaryMuscles.map(formatMuscle).join(', ')}
              <span aria-hidden> · </span>
              <span className="capitalize">{exercise.equipment}</span>
            </p>
          </section>

          {/* Controls */}
          <section className="glass shrink-0 space-y-4 rounded-[36px] p-4">
            {resting ? (
              <div className="flex flex-col items-center pt-2 text-center">
                <div className="relative size-44">
                  <svg viewBox="0 0 200 200" className="size-full -rotate-90" aria-hidden>
                    <circle cx="100" cy="100" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="9" />
                    <circle
                      cx="100"
                      cy="100"
                      r={RING_RADIUS}
                      fill="none"
                      stroke="#C6F432"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray={RING_LENGTH}
                      strokeDashoffset={RING_LENGTH * (1 - restFraction)}
                      style={{ transition: 'stroke-dashoffset 0.25s linear' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[13px] font-semibold text-white/80">Rest</span>
                    <span className="text-5xl font-bold tabular-nums tracking-tight" role="timer">
                      {formatClock(restRemaining)}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-white/85">
                  Next: set {currentSet} of {item.sets}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div className="glass-inset rounded-[22px] py-3.5 text-center">
                    <p className="text-2xl font-bold tabular-nums tracking-tight">
                      {exerciseComplete ? item.sets : currentSet}
                      <span className="text-[15px] font-medium text-white/75"> / {item.sets}</span>
                    </p>
                    <p className="text-xs text-white/80">Set</p>
                  </div>
                  <div className="glass-inset rounded-[22px] py-3.5 text-center">
                    <p className="text-2xl font-bold tabular-nums tracking-tight text-gym-lime">{item.reps}</p>
                    <p className="text-xs text-white/80">{timed ? 'Target' : 'Reps'}</p>
                  </div>
                  <div className="glass-inset rounded-[22px] py-3.5 text-center">
                    <p className="text-2xl font-bold tabular-nums tracking-tight">
                      {previous ? (usesLoad ? previous.weight : previous.reps) : '–'}
                      {previous && <span className="text-[15px] font-medium text-white/75"> {usesLoad ? 'kg' : 'reps'}</span>}
                    </p>
                    <p className="text-xs text-white/80">Last time</p>
                  </div>
                </div>

                {!timed && !exerciseComplete && (
                  <div className={`grid gap-2 ${usesLoad ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {usesLoad && <Stepper label="Weight" unit="kg" value={weight} step={2.5} onChange={setWeight} />}
                    <Stepper label="Reps done" value={reps} step={1} onChange={setReps} />
                  </div>
                )}
              </>
            )}

            <div className="flex items-center gap-2.5">
              <button type="button" onClick={() => setVideoExercise(exercise)} className="tap glass-inset flex size-[60px] shrink-0 items-center justify-center rounded-full" aria-label="Watch demo">
                <Play className="h-[22px] w-[22px] fill-current" />
              </button>
              {resting ? (
                <>
                  <button type="button" onClick={() => addRest(15)} className="tap glass-inset flex h-[60px] items-center gap-1 rounded-full px-5 text-[15px] font-semibold">
                    <Plus className="h-4 w-4" /> 15s
                  </button>
                  <button type="button" onClick={skipRest} className="tap flex h-[60px] flex-1 items-center justify-center gap-2 rounded-full bg-gym-lime text-[17px] font-bold text-gym-ink">
                    <SkipForward className="h-5 w-5" /> Skip rest
                  </button>
                </>
              ) : exerciseComplete ? (
                <button type="button" onClick={() => goTo(nextIncompleteIndex(session, index))} className="tap flex h-[60px] flex-1 items-center justify-center gap-2 rounded-full bg-gym-lime text-[17px] font-bold text-gym-ink">
                  Next unfinished
                </button>
              ) : (
                <button type="button" onClick={setDone} className="tap flex h-[60px] flex-1 items-center justify-center gap-2 rounded-full bg-gym-lime text-[17px] font-bold text-gym-ink">
                  <Check className="h-[22px] w-[22px]" strokeWidth={3} /> Set done
                </button>
              )}
              {!resting && (
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  disabled={index === day.exercises.length - 1}
                  className="tap glass-inset flex size-[60px] shrink-0 items-center justify-center rounded-full disabled:opacity-40"
                  aria-label="Next exercise"
                >
                  <ChevronRight className="h-[22px] w-[22px]" strokeWidth={2.4} />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-2 text-[13px]">
              <span className="truncate text-white/80">{nextItem ? `Next: ${nextItem.exercise.name}` : 'Last exercise'}</span>
              <button type="button" onClick={() => setShowSteps((v) => !v)} aria-expanded={showSteps} className="tap min-h-[44px] shrink-0 font-semibold text-gym-lime">
                {showSteps ? 'Hide steps' : 'How to'}
              </button>
            </div>

            {showSteps && (
              <ol className="animate-riseIn space-y-2.5 px-2 pb-1">
                {exercise.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-snug text-white/90">
                    <span className="glass-inset flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-gym-lime">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Queue */}
          <section className="glass mt-3 shrink-0 rounded-[32px] px-4 py-3" aria-label="Exercises in this workout">
            <h3 className="px-1 pb-1 pt-1.5 text-[13px] font-semibold text-white/80">This workout</h3>
            <ul>
              {day.exercises.map((it, i) => {
                const n = session.setsDone[i] ?? 0;
                const complete = n >= it.sets;
                const current = i === index;
                return (
                  <li key={`${it.exercise.id}-${i}`}>
                    <button type="button" onClick={() => goTo(i)} aria-current={current ? 'step' : undefined} className="tap flex w-full items-center gap-3 px-1 py-2.5 text-left">
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          complete ? 'bg-gym-lime text-gym-ink' : current ? 'glass-inset ring-2 ring-gym-lime' : 'glass-inset text-white/75'
                        }`}
                      >
                        {complete ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-[15px] font-semibold ${current ? '' : 'text-white/85'}`}>{it.exercise.name}</span>
                        <span className="text-xs tabular-nums text-white/75">
                          {it.sets} × {it.reps}
                        </span>
                      </span>
                      <span className="shrink-0 text-[13px] tabular-nums text-white/80">
                        {n}/{it.sets}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>

      <VideoModal exercise={videoExercise} isOpen={Boolean(videoExercise)} onClose={() => setVideoExercise(null)} />
    </>
  );
}
