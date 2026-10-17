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
  localStorage.removeItem(STORAGE_KEY_PROGRAM);
  localStorage.removeItem(STORAGE_KEY_PROFILE);
}
