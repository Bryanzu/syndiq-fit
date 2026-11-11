import { WorkoutDay } from '@/types/workout';

/** An in-progress (or just-finished) workout. Kept in localStorage so it survives reloads and navigation. */
export interface WorkoutSession {
  programId: string;
  /** Snapshot of the day being trained, so later edits to the program don't change a session mid-way */
  day: WorkoutDay;
  startedAt: number;
  exerciseIndex: number;
  /** Sets completed per exercise, same order as `day.exercises` */
  setsDone: number[];
  rest: { endsAt: number; totalMs: number } | null;
  finishedAt: number | null;
  /** True once the finished session has been written to the workout log */
  logged?: boolean;
}

const STORAGE_KEY_SESSION = 'syndiq_workout_session';

/** Fired on `window` after a session is written to the workout log, so open pages can refresh. */
export const WORKOUT_LOGGED_EVENT = 'syndiq:workout-logged';

export function loadWorkoutSession(): WorkoutSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkoutSession;
    if (!parsed?.day?.exercises?.length || !Array.isArray(parsed.setsDone)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveWorkoutSession(session: WorkoutSession | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (session) localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY_SESSION);
  } catch (err) {
    console.error('Failed to save workout session:', err);
  }
}

export function totalSets(session: WorkoutSession): number {
  return session.day.exercises.reduce((sum, it) => sum + it.sets, 0);
}

export function completedSets(session: WorkoutSession): number {
  return session.setsDone.reduce((sum, n) => sum + n, 0);
}

/** Next exercise that still has sets left, searching forward from `from` and wrapping. -1 if none. */
export function nextIncompleteIndex(session: Pick<WorkoutSession, 'day' | 'setsDone'>, from: number): number {
  const count = session.day.exercises.length;
  for (let step = 1; step <= count; step++) {
    const i = (from + step) % count;
    if ((session.setsDone[i] ?? 0) < session.day.exercises[i].sets) return i;
  }
  return -1;
}

export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
