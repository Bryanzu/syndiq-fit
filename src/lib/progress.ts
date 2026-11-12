import { WorkoutProgram } from '@/types/workout';

/** Lightweight, local-only workout completion log (no account required). */
export interface SessionEntry {
  id: string;
  /** Local calendar date, YYYY-MM-DD */
  date: string;
  dayNumber: number;
  title: string;
  completedAt: string;
  /** Recorded when the session was done in the workout player */
  durationMin?: number;
  setsCompleted?: number;
}

const STORAGE_KEY_LOG = 'syndiq_workout_log';

export function toLocalISODate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function loadWorkoutLog(): SessionEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOG);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWorkoutLog(entries: SessionEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOG, JSON.stringify(entries.slice(-200)));
  } catch (err) {
    console.error('Failed to save workout log:', err);
  }
}

export function logSession(entry: Omit<SessionEntry, 'id' | 'completedAt'>): SessionEntry[] {
  const log = loadWorkoutLog();
  const exists = log.some((e) => e.date === entry.date && e.dayNumber === entry.dayNumber);
  if (exists) return log;
  const next = [
    ...log,
    { ...entry, id: `${entry.date}-d${entry.dayNumber}`, completedAt: new Date().toISOString() },
  ];
  saveWorkoutLog(next);
  return next;
}

export function undoSession(date: string, dayNumber: number): SessionEntry[] {
  const next = loadWorkoutLog().filter((e) => !(e.date === date && e.dayNumber === dayNumber));
  saveWorkoutLog(next);
  return next;
}

export function clearWorkoutLog(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_LOG);
}

/** Monday-first week containing `ref`. */
export function getWeekDates(ref: Date = new Date()): Date[] {
  const start = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const offset = (start.getDay() + 6) % 7; // Mon=0 … Sun=6
  start.setDate(start.getDate() - offset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/** The next session in the split: sessions simply cycle through the program's days in order. */
export function getNextDayIndex(program: WorkoutProgram, log: SessionEntry[]): number {
  const count = program.days.length;
  if (count === 0) return 0;
  // Only sessions done since this program was built count, so a new program starts on its first day
  const since = Date.parse(program.createdAt);
  const relevant = Number.isNaN(since) ? log : log.filter((e) => Date.parse(e.completedAt) >= since);
  if (relevant.length === 0) return 0;
  const last = [...relevant].sort((a, b) => a.completedAt.localeCompare(b.completedAt))[relevant.length - 1];
  const lastIdx = program.days.findIndex((d) => d.dayNumber === last.dayNumber);
  return lastIdx === -1 ? 0 : (lastIdx + 1) % count;
}
