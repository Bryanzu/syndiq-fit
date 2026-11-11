'use client';

import React from 'react';
import { Check, SkipForward } from 'lucide-react';
import { useNow, useWorkoutSession } from '@/context/WorkoutSessionContext';
import { completedSets, formatClock, totalSets } from '@/lib/workoutSession';
import { lastLift, logLift } from '@/lib/liftHistory';
import { toLocalISODate } from '@/lib/progress';

/**
 * Collapsed workout: a bar docked above the tab bar on phones (a card in the corner on desktop).
 * Tap it to reopen the player; the round button completes the current set or skips the rest.
 */
export function MiniPlayer() {
  const { session, expanded, setExpanded, completeSet, skipRest } = useWorkoutSession();
  const visible = Boolean(session && !session.finishedAt && !expanded);
  const now = useNow(visible ? 500 : null);

  if (!session || !visible) return null;

  const index = session.exerciseIndex;
  const item = session.day.exercises[index];
  const setsDoneHere = session.setsDone[index] ?? 0;
  const restRemaining = session.rest ? session.rest.endsAt - now : 0;
  const resting = restRemaining > 0;
  const done = completedSets(session);
  const total = totalSets(session);

  const status = resting
    ? `Rest ${formatClock(restRemaining)}`
    : setsDoneHere >= item.sets
    ? 'All sets done'
    : `Set ${setsDoneHere + 1} of ${item.sets} · ${item.reps}`;

  return (
    <div
      data-mini-player
      className="animate-riseIn fixed z-40 print:hidden inset-x-2 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4.25rem)] lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-96"
    >
      <div className="relative flex items-center gap-1 overflow-hidden rounded-[26px] glass-nav shadow-float">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex min-w-0 flex-1 items-center gap-3 py-2.5 pl-3 text-left"
          aria-label={`Open workout: ${item.exercise.name}, ${status}`}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gym-lime/15 text-sm font-semibold tabular-nums text-gym-limeDark dark:text-gym-lime">
            {index + 1}/{session.day.exercises.length}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-gym-text">{item.exercise.name}</span>
            <span className="t-small block truncate tabular-nums !text-xs">{status}</span>
          </span>
        </button>

        {resting ? (
          <button type="button" onClick={skipRest} className="btn-icon mr-1.5 shrink-0" aria-label="Skip rest">
            <SkipForward className="h-5 w-5" />
          </button>
        ) : setsDoneHere < item.sets ? (
          <button
            type="button"
            onClick={() => {
              const last = lastLift(item.exercise.id);
              const timed = /\d\s*(s|m)$/.test(item.reps);
              logLift(item.exercise.id, {
                date: toLocalISODate(),
                weight: last?.weight ?? 0,
                reps: timed ? 0 : last?.reps || parseInt(item.reps, 10) || 0,
              });
              completeSet();
            }}
            className="tap mr-2 flex size-10 shrink-0 items-center justify-center rounded-full bg-gym-lime text-gym-ink"
            aria-label={`Complete set ${setsDoneHere + 1}`}
          >
            <Check className="h-5 w-5" strokeWidth={2.6} />
          </button>
        ) : null}

        {/* Session progress */}
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gym-cardInner" aria-hidden>
          <span
            className="block h-full bg-gym-lime transition-[width] duration-500 ease-smooth"
            style={{ width: `${total ? (done / total) * 100 : 0}%` }}
          />
        </span>
      </div>
    </div>
  );
}
