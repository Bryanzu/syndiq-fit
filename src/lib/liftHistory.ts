/** What was actually lifted, set by set. Local-only, like the rest of the user's data. */
export interface LiftEntry {
  /** Local calendar date, YYYY-MM-DD */
  date: string;
  /** Kilograms; 0 for bodyweight movements */
  weight: number;
  reps: number;
}

type LiftHistory = Record<string, LiftEntry[]>;

const STORAGE_KEY_LIFTS = 'syndiq_lift_history';
const MAX_ENTRIES_PER_EXERCISE = 60;

export function loadLiftHistory(): LiftHistory {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIFTS);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function logLift(exerciseId: string, entry: LiftEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const history = loadLiftHistory();
    history[exerciseId] = [...(history[exerciseId] ?? []), entry].slice(-MAX_ENTRIES_PER_EXERCISE);
    localStorage.setItem(STORAGE_KEY_LIFTS, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to save lift history:', err);
  }
}

/** The most recent set logged for an exercise, if any. */
export function lastLift(exerciseId: string): LiftEntry | null {
  const entries = loadLiftHistory()[exerciseId];
  return entries && entries.length > 0 ? entries[entries.length - 1] : null;
}
