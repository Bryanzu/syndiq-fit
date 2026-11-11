import { MuscleGroup } from '@/types/workout';
import { getExerciseById } from '@/data/exercises';
import { loadLiftHistory } from '@/lib/liftHistory';
import { getWeekDates, toLocalISODate } from '@/lib/progress';

export interface MuscleLoad {
  /** Sets logged for this muscle in the current Monday–Sunday week */
  setsThisWeek: number;
  /** Most recent day it was trained (YYYY-MM-DD), any week */
  lastTrained: string | null;
}

/** Reads the lift history and totals it per muscle. Each logged set counts once for each primary muscle. */
export function loadMuscleLoad(): Partial<Record<MuscleGroup, MuscleLoad>> {
  const week = new Set(getWeekDates().map((d) => toLocalISODate(d)));
  const load: Partial<Record<MuscleGroup, MuscleLoad>> = {};

  for (const [exerciseId, entries] of Object.entries(loadLiftHistory())) {
    const exercise = getExerciseById(exerciseId);
    if (!exercise) continue;
    for (const muscle of exercise.primaryMuscles) {
      const current = load[muscle] ?? { setsThisWeek: 0, lastTrained: null };
      for (const entry of entries) {
        if (week.has(entry.date)) current.setsThisWeek += 1;
        if (!current.lastTrained || entry.date > current.lastTrained) current.lastTrained = entry.date;
      }
      load[muscle] = current;
    }
  }
  return load;
}

/** "today", "yesterday" or "N days ago" for a YYYY-MM-DD date. */
export function daysAgoLabel(date: string): string {
  const then = new Date(date + 'T00:00:00').getTime();
  const today = new Date(toLocalISODate() + 'T00:00:00').getTime();
  const days = Math.max(0, Math.round((today - then) / 86400000));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}
