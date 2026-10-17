import { MuscleGroup } from './workout';
import { UserProfile } from './questionnaire';

/**
 * Stage 2: User Account & Saved Plans Schema
 */
export interface UserAccount {
  id: string;
  email: string;
  displayName: string;
  profile: UserProfile;
  savedPlanIds: string[];
  activePlanId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Stage 2: Exercise Completion & Workout Logging Schema
 */
export interface SetLogItem {
  setNumber: number;
  targetReps: string;
  performedReps: number;
  weightKg?: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  completed: boolean;
}

export interface ExerciseLogItem {
  exerciseId: string;
  exerciseName: string;
  sets: SetLogItem[];
  notes?: string;
}

export interface WorkoutSessionLog {
  id: string;
  userId?: string;
  programId: string;
  dayNumber: number;
  date: string;
  durationMinutes: number;
  exercises: ExerciseLogItem[];
  feelingScore?: 1 | 2 | 3 | 4 | 5; // 1 = Poor, 5 = Great
  notes?: string;
}

/**
 * Stage 2: Body Measurements & Progress History
 */
export interface BodyMeasurementEntry {
  id: string;
  userId?: string;
  date: string;
  weightKg: number;
  bodyFatPercentage?: number;
  waistCm?: number;
  chestCm?: number;
  armsCm?: number;
  thighsCm?: number;
  notes?: string;
}

/**
 * Stage 3: Connected Fitness Platform & Health Sync Schema
 */
export type HealthPlatformProvider = 'apple_health' | 'android_health_connect' | 'google_fit' | 'garmin' | 'strava';

export interface HealthSyncConfig {
  provider: HealthPlatformProvider;
  enabled: boolean;
  syncWorkouts: boolean;
  syncHeartRate: boolean;
  syncActiveCalories: boolean;
  lastSyncedAt?: string;
}
