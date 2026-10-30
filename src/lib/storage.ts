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
  // Clear the active generated workout schedule while preserving reusable questionnaire preferences
  localStorage.removeItem(STORAGE_KEY_PROGRAM);
}

export function hasActiveProgram(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(STORAGE_KEY_PROGRAM);
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

