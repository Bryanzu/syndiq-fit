'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { WorkoutDay, WorkoutProgram } from '@/types/workout';
import { logSession, toLocalISODate } from '@/lib/progress';
import { track } from '@/lib/analytics/client';
import {
  WORKOUT_LOGGED_EVENT,
  WorkoutSession,
  completedSets,
  loadWorkoutSession,
  nextIncompleteIndex,
  saveWorkoutSession,
} from '@/lib/workoutSession';

interface WorkoutSessionContextValue {
  session: WorkoutSession | null;
  /** Whether the full-screen player is showing (otherwise the mini player is) */
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  /** Start the given day, or resume it if it is already in progress. Opens the player. */
  start: (program: WorkoutProgram, dayIndex: number) => void;
  /**
   * True when an unfinished session exists for this day. Matched on the day itself, not the program id,
   * because re-opening a share link regenerates the program with a new id.
   */
  isActiveFor: (day: Pick<WorkoutDay, 'dayNumber' | 'title'>) => boolean;
  completeSet: () => void;
  skipRest: () => void;
  addRest: (seconds: number) => void;
  goTo: (exerciseIndex: number) => void;
  /** End the workout now. Logs it if any set was completed, otherwise discards it. */
  finish: () => void;
  /** Dismiss the session entirely (after the summary, or to discard). */
  close: () => void;
}

const WorkoutSessionContext = createContext<WorkoutSessionContextValue | null>(null);

export function WorkoutSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  // Start time of the last session counted as started, so a restored session isn't counted again
  const countedStart = useRef<number | null>(null);

  // Restore an in-progress session after a reload
  useEffect(() => {
    const saved = loadWorkoutSession();
    if (saved) {
      countedStart.current = saved.startedAt;
      setSession(saved);
      // A finished-but-unseen summary reopens; an active workout comes back as the mini player
      setExpanded(Boolean(saved.finishedAt));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveWorkoutSession(session);
  }, [session, hydrated]);

  // Count a workout as started once, when a new session begins
  useEffect(() => {
    if (!hydrated || !session || session.finishedAt || countedStart.current === session.startedAt) return;
    countedStart.current = session.startedAt;
    track('workout_started');
  }, [session, hydrated]);

  // End the rest period when its timer runs out
  const restEndsAt = session?.rest?.endsAt ?? null;
  useEffect(() => {
    if (restEndsAt === null) return;
    const id = window.setTimeout(() => {
      setSession((s) => (s && s.rest && s.rest.endsAt === restEndsAt ? { ...s, rest: null } : s));
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.([120, 60, 120]);
    }, Math.max(0, restEndsAt - Date.now()));
    return () => window.clearTimeout(id);
  }, [restEndsAt]);

  // Write a finished session to the workout log exactly once
  useEffect(() => {
    if (!session || !session.finishedAt || session.logged) return;
    logSession({
      date: toLocalISODate(new Date(session.finishedAt)),
      dayNumber: session.day.dayNumber,
      title: session.day.title,
      durationMin: Math.max(1, Math.round((session.finishedAt - session.startedAt) / 60000)),
      setsCompleted: completedSets(session),
    });
    window.dispatchEvent(new Event(WORKOUT_LOGGED_EVENT));
    track('workout_finished');
    setSession({ ...session, logged: true });
  }, [session]);

  const start = useCallback((program: WorkoutProgram, dayIndex: number) => {
    const day = program.days[dayIndex];
    if (!day || day.exercises.length === 0) return;
    setSession((current) => {
      const sameDay =
        current && !current.finishedAt && current.day.dayNumber === day.dayNumber && current.day.title === day.title;
      if (sameDay) return current;
      return {
        programId: program.id,
        day,
        startedAt: Date.now(),
        exerciseIndex: 0,
        setsDone: day.exercises.map(() => 0),
        rest: null,
        finishedAt: null,
      };
    });
    setExpanded(true);
  }, []);

  const isActiveFor = useCallback(
    (day: Pick<WorkoutDay, 'dayNumber' | 'title'>) =>
      Boolean(session && !session.finishedAt && session.day.dayNumber === day.dayNumber && session.day.title === day.title),
    [session]
  );

  const completeSet = useCallback(() => {
    setSession((s) => {
      if (!s || s.finishedAt) return s;
      const i = s.exerciseIndex;
      const item = s.day.exercises[i];
      const setsDone = [...s.setsDone];
      setsDone[i] = Math.min(item.sets, (setsDone[i] ?? 0) + 1);

      const exerciseDone = setsDone[i] >= item.sets;
      const nextIndex = exerciseDone ? nextIncompleteIndex({ day: s.day, setsDone }, i) : i;
      if (nextIndex === -1) {
        return { ...s, setsDone, rest: null, finishedAt: Date.now() };
      }
      const totalMs = item.restSeconds * 1000;
      return { ...s, setsDone, exerciseIndex: nextIndex, rest: { endsAt: Date.now() + totalMs, totalMs } };
    });
  }, []);

  const skipRest = useCallback(() => setSession((s) => (s ? { ...s, rest: null } : s)), []);

  const addRest = useCallback((seconds: number) => {
    setSession((s) =>
      s && s.rest
        ? { ...s, rest: { endsAt: s.rest.endsAt + seconds * 1000, totalMs: s.rest.totalMs + seconds * 1000 } }
        : s
    );
  }, []);

  const goTo = useCallback((exerciseIndex: number) => {
    setSession((s) =>
      s && !s.finishedAt && exerciseIndex >= 0 && exerciseIndex < s.day.exercises.length
        ? { ...s, exerciseIndex, rest: null }
        : s
    );
  }, []);

  const close = useCallback(() => {
    setSession(null);
    setExpanded(false);
  }, []);

  const finish = useCallback(() => {
    setSession((s) => {
      if (!s || s.finishedAt) return s;
      // Nothing done: discard instead of logging an empty workout
      if (completedSets(s) === 0) return null;
      return { ...s, rest: null, finishedAt: Date.now() };
    });
    setExpanded(true);
  }, []);

  // If finishing discarded the session, the player has nothing to show
  useEffect(() => {
    if (!session && expanded) setExpanded(false);
  }, [session, expanded]);

  const value = useMemo<WorkoutSessionContextValue>(
    () => ({ session, expanded, setExpanded, start, isActiveFor, completeSet, skipRest, addRest, goTo, finish, close }),
    [session, expanded, start, isActiveFor, completeSet, skipRest, addRest, goTo, finish, close]
  );

  return <WorkoutSessionContext.Provider value={value}>{children}</WorkoutSessionContext.Provider>;
}

export function useWorkoutSession(): WorkoutSessionContextValue {
  const ctx = useContext(WorkoutSessionContext);
  if (!ctx) throw new Error('useWorkoutSession must be used inside WorkoutSessionProvider');
  return ctx;
}

/** Re-renders on an interval while `intervalMs` is set; returns the current time. */
export function useNow(intervalMs: number | null): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!intervalMs) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
