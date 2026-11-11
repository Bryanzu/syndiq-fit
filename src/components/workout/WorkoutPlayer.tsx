'use client';

import React, { useEffect, useState } from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Play, Plus, SkipForward, Trophy } from 'lucide-react';
import { Exercise, MuscleGroup } from '@/types/workout';
import { useNow, useWorkoutSession } from '@/context/WorkoutSessionContext';
import { useModalScrollLock } from '@/hooks/useModalScrollLock';
import { completedSets, formatClock, nextIncompleteIndex, totalSets } from '@/lib/workoutSession';
import { VideoModal } from '@/components/program/VideoModal';

const formatMuscle = (m: MuscleGroup) =>
  m.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const stripDayPrefix = (title: string) => title.replace(/^Day \d+\s*[—–-]\s*/, '');

const RING_RADIUS = 88;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/**
 * Full-screen "now training" view: one exercise at a time, set check-off, rest countdown and the
 * session queue. Collapses to the MiniPlayer so the rest of the app stays usable mid-workout.
 */
export function WorkoutPlayer() {
  const { session, expanded, setExpanded, completeSet, skipRest, addRest, goTo, finish, close } = useWorkoutSession();
  const [videoExercise, setVideoExercise] = useState<Exercise | null>(null);
  const [showSteps, setShowSteps] = useState(false);

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

  // Collapse the instructions when moving to another exercise
  const exerciseIndex = session?.exerciseIndex;
  useEffect(() => setShowSteps(false), [exerciseIndex]);

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
        className="animate-sheetUp fixed inset-0 z-[90] flex flex-col bg-gym-bg text-gym-text"
      >
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-8 px-6 py-10 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-gym-lime text-gym-ink">
            <Trophy className="h-9 w-9" strokeWidth={2} />
          </span>
          <div className="space-y-2">
            <p className="t-eyebrow">Workout complete</p>
            <h2 id="workout-summary-title" className="t-title">
              {title}
            </h2>
          </div>
          <dl className="grid w-full grid-cols-3 gap-3">
            {[
              [String(minutes), 'minutes'],
              [`${done}/${total}`, 'sets'],
              [`${exercisesDone}/${day.exercises.length}`, 'exercises'],
            ].map(([value, label]) => (
              <div key={label} className="surface px-2 py-4">
                <dt className="text-2xl font-semibold tabular-nums tracking-tight">{value}</dt>
                <dd className="t-small">{label}</dd>
              </div>
            ))}
          </dl>
          <p className="t-small max-w-xs">Saved to your activity. Your next session in the split is queued up on Home.</p>
          <button type="button" onClick={close} className="btn-primary w-full max-w-xs">
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

  const restRemaining = session.rest ? session.rest.endsAt - now : 0;
  const resting = Boolean(session.rest) && restRemaining > 0;
  const restFraction = session.rest ? Math.min(1, Math.max(0, restRemaining / session.rest.totalMs)) : 0;

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Workout in progress: ${title}`}
        className="animate-sheetUp fixed inset-0 z-[90] flex flex-col bg-gym-bg text-gym-text pt-[env(safe-area-inset-top)]"
      >
        {/* Header */}
        <header className="mx-auto flex w-full max-w-xl shrink-0 items-center gap-2 px-3 pt-2">
          <button type="button" onClick={() => setExpanded(false)} className="btn-icon" aria-label="Minimise workout">
            <ChevronDown className="h-6 w-6" />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm font-semibold">{title}</p>
            <p className="t-small tabular-nums">
              {formatClock(now - session.startedAt)} · {done} of {total} sets
            </p>
          </div>
          <button type="button" onClick={finish} className="btn-ghost btn-sm !px-3">
            Finish
          </button>
        </header>

        {/* Progress across the whole session */}
        <div className="mx-auto mt-3 w-full max-w-xl shrink-0 px-5">
          <div className="h-1 overflow-hidden rounded-full bg-gym-cardInner" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
            <div
              className="h-full rounded-full bg-gym-lime transition-[width] duration-500 ease-smooth"
              style={{ width: `${total ? (done / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="modal-content-scroll mx-auto w-full max-w-xl flex-1 overflow-y-auto px-5 pb-6">
          {/* Stage */}
          <section className="flex min-h-[19rem] flex-col items-center justify-center py-6 text-center" aria-live="polite">
            {resting ? (
              <>
                <div className="relative size-52">
                  <svg viewBox="0 0 200 200" className="size-full -rotate-90" aria-hidden>
                    <circle cx="100" cy="100" r={RING_RADIUS} fill="none" stroke="var(--gym-card-inner)" strokeWidth="8" />
                    <circle
                      cx="100"
                      cy="100"
                      r={RING_RADIUS}
                      fill="none"
                      stroke="#a3e635"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={RING_LENGTH}
                      strokeDashoffset={RING_LENGTH * (1 - restFraction)}
                      style={{ transition: 'stroke-dashoffset 0.25s linear' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="t-eyebrow">Rest</span>
                    <span className="text-5xl font-semibold tabular-nums tracking-tight" role="timer">
                      {formatClock(restRemaining)}
                    </span>
                  </div>
                </div>
                <p className="t-small mt-5">Up next</p>
                <p className="mt-0.5 text-base font-semibold">
                  {exercise.name} · set {currentSet} of {item.sets}
                </p>
              </>
            ) : (
              <>
                <p className="t-eyebrow">
                  Exercise {index + 1} of {day.exercises.length}
                </p>
                <h2 className="mt-2 text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-4xl">{exercise.name}</h2>
                <p className="t-small mt-1.5">
                  {exercise.primaryMuscles.map(formatMuscle).join(', ')}
                  <span aria-hidden> · </span>
                  <span className="capitalize">{exercise.equipment}</span>
                </p>

                <p className="mt-7 text-6xl font-semibold tabular-nums tracking-tight text-gym-limeDark dark:text-gym-lime">
                  {item.reps}
                </p>
                <p className="t-small mt-1">
                  {/\d\s*(s|m)$/.test(item.reps) ? 'target' : 'reps'} ·{' '}
                  {exerciseComplete ? 'all sets done' : `set ${currentSet} of ${item.sets}`}
                </p>

                {/* Set dots */}
                <ol className="mt-5 flex items-center gap-2" aria-label={`${setsDoneHere} of ${item.sets} sets completed`}>
                  {Array.from({ length: item.sets }, (_, i) => (
                    <li
                      key={i}
                      className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                        i < setsDoneHere
                          ? 'bg-gym-lime text-gym-ink'
                          : i === setsDoneHere
                          ? 'bg-gym-cardInner text-gym-text ring-2 ring-gym-lime/70'
                          : 'bg-gym-cardInner text-gym-textMuted'
                      }`}
                    >
                      {i < setsDoneHere ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </section>

          {/* Transport */}
          <section className="space-y-3">
            {resting ? (
              <div className="flex gap-2.5">
                <button type="button" onClick={() => addRest(15)} className="btn-secondary flex-1">
                  <Plus className="h-4 w-4" /> 15s
                </button>
                <button type="button" onClick={skipRest} className="btn-primary flex-[2]">
                  <SkipForward className="h-4 w-4" /> Skip rest
                </button>
              </div>
            ) : exerciseComplete ? (
              <button
                type="button"
                onClick={() => goTo(nextIncompleteIndex(session, index))}
                className="btn-primary w-full !min-h-[56px] !text-base"
              >
                Go to next unfinished exercise <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button type="button" onClick={completeSet} className="btn-primary w-full !min-h-[56px] !text-base">
                <Check className="h-5 w-5" strokeWidth={2.6} /> Complete set {currentSet}
              </button>
            )}

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                disabled={index === 0}
                className="btn-icon disabled:opacity-30"
                aria-label="Previous exercise"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setVideoExercise(exercise)} className="btn-secondary btn-sm">
                  <Play className="h-3.5 w-3.5 fill-current" /> Demo
                </button>
                <button
                  type="button"
                  onClick={() => setShowSteps((v) => !v)}
                  aria-expanded={showSteps}
                  className="btn-secondary btn-sm"
                >
                  How to
                </button>
              </div>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                disabled={index === day.exercises.length - 1}
                className="btn-icon disabled:opacity-30"
                aria-label="Next exercise"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {showSteps && (
              <div className="surface animate-riseIn space-y-3 p-4 text-left">
                <ol className="space-y-2.5">
                  {exercise.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-snug text-gym-silver">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gym-cardInner text-xs font-semibold text-gym-limeDark dark:text-gym-lime">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
                {item.intensityNote && <p className="t-small border-t hairline pt-3">{item.intensityNote}</p>}
              </div>
            )}
          </section>

          {/* Queue */}
          <section className="mt-8" aria-label="Exercises in this workout">
            <h3 className="t-eyebrow mb-1">This workout</h3>
            <ul className="divide-line">
              {day.exercises.map((it, i) => {
                const n = session.setsDone[i] ?? 0;
                const complete = n >= it.sets;
                const current = i === index;
                return (
                  <li key={`${it.exercise.id}-${i}`}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={current ? 'step' : undefined}
                      className="row w-full text-left"
                    >
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          complete
                            ? 'bg-gym-lime text-gym-ink'
                            : current
                            ? 'bg-gym-cardInner text-gym-text ring-2 ring-gym-lime/70'
                            : 'bg-gym-cardInner text-gym-textMuted'
                        }`}
                      >
                        {complete ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-sm font-medium ${current ? 'text-gym-text' : 'text-gym-silver'}`}>
                          {it.exercise.name}
                        </span>
                        <span className="t-small tabular-nums">
                          {it.sets} × {it.reps}
                        </span>
                      </span>
                      <span className="t-small shrink-0 tabular-nums">
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
