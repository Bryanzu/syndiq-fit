import { WorkoutProgram } from '@/types/workout';
import { UserProfile } from '@/types/questionnaire';

const STORAGE_KEY_PROGRAM = 'syndiq_active_program';
const STORAGE_KEY_PROFILE = 'syndiq_active_profile';

export function saveActiveProgram(program: WorkoutProgram): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PROGRAM, JSON.stringify(program));
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(program.userProfile));
  } catch (err) {
    console.error('Failed to save workout program to localStorage:', err);
  }
}

export function loadActiveProgram(): WorkoutProgram | null {
  if (typeof window === 'undefined') return null;
  pruneProgramArchiveOnce();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRAM);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to load workout program from localStorage:', err);
    return null;
  }
}

export function loadSavedProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function clearActiveProgram(): void {
  if (typeof window === 'undefined') return;
  // Clear the active generated workout schedule while preserving reusable questionnaire preferences
  localStorage.removeItem(STORAGE_KEY_PROGRAM);
}

export function hasActiveProgram(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(STORAGE_KEY_PROGRAM);
}

/* ------------------------------------------------------------------ */
/* Previous programs: replaced programs are kept for a while, then dropped */
/* ------------------------------------------------------------------ */
const STORAGE_KEY_ARCHIVE = 'syndiq_program_archive';
export const ARCHIVE_KEEP_DAYS = 30;
export const ARCHIVE_MAX = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface ArchivedProgram {
  program: WorkoutProgram;
  /** When it was replaced, ISO string */
  archivedAt: string;
}

function readArchive(): ArchivedProgram[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ARCHIVE);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list)
      ? list.filter((e) => e && e.program && e.program.id && !Number.isNaN(Date.parse(e.archivedAt)))
      : [];
  } catch {
    return [];
  }
}

function writeArchive(list: ArchivedProgram[]): void {
  try {
    if (list.length) localStorage.setItem(STORAGE_KEY_ARCHIVE, JSON.stringify(list));
    else localStorage.removeItem(STORAGE_KEY_ARCHIVE);
  } catch (err) {
    console.error('Failed to save previous programs:', err);
  }
}

/** Whole days left before an archived program is deleted */
export function archiveDaysLeft(entry: ArchivedProgram, now: number = Date.now()): number {
  return Math.max(0, Math.ceil((Date.parse(entry.archivedAt) + ARCHIVE_KEEP_DAYS * DAY_MS - now) / DAY_MS));
}

/** Previous programs, newest first. Expired ones are deleted from storage here. */
export function loadProgramArchive(now: number = Date.now()): ArchivedProgram[] {
  if (typeof window === 'undefined') return [];
  const list = readArchive();
  const kept = list.filter((e) => now - Date.parse(e.archivedAt) < ARCHIVE_KEEP_DAYS * DAY_MS).slice(0, ARCHIVE_MAX);
  if (kept.length !== list.length) writeArchive(kept);
  return kept;
}

let archivePruned = false;
/** Runs the expiry check once per page load, the first time the app reads the active program */
function pruneProgramArchiveOnce(): void {
  if (archivePruned) return;
  archivePruned = true;
  loadProgramArchive();
}

/** Moves the active program into the archive. Workout history and lift weights are stored separately and stay. */
export function archiveActiveProgram(): void {
  if (typeof window === 'undefined') return;
  const current = loadActiveProgram();
  if (!current) return;
  const rest = loadProgramArchive().filter((e) => e.program.id !== current.id);
  writeArchive([{ program: current, archivedAt: new Date().toISOString() }, ...rest].slice(0, ARCHIVE_MAX));
}

/** Makes an archived program active again; the program it replaces goes into the archive. */
export function restoreArchivedProgram(id: string): WorkoutProgram | null {
  if (typeof window === 'undefined') return null;
  const list = loadProgramArchive();
  const entry = list.find((e) => e.program.id === id);
  if (!entry) return null;
  writeArchive(list.filter((e) => e.program.id !== id));
  archiveActiveProgram();
  saveActiveProgram(entry.program);
  return entry.program;
}

export function deleteArchivedProgram(id: string): void {
  if (typeof window === 'undefined') return;
  writeArchive(loadProgramArchive().filter((e) => e.program.id !== id));
}

const STORAGE_KEY_MEAL_PLAN = 'syndiq_meal_plan';
const STORAGE_KEY_MEAL_INVENTORY = 'syndiq_meal_inventory';

export function saveActiveMealPlan(plan: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MEAL_PLAN, JSON.stringify(plan));
  } catch (err) {
    console.error('Failed to save meal plan to localStorage:', err);
  }
}

export function loadActiveMealPlan(): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEAL_PLAN);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to load meal plan from localStorage:', err);
    return null;
  }
}

export function saveMealPlanInventory(inventory: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MEAL_INVENTORY, JSON.stringify(inventory));
  } catch (err) {
    console.error('Failed to save meal inventory to localStorage:', err);
  }
}

export function loadMealPlanInventory(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEAL_INVENTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

