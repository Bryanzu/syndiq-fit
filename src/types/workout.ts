export type MuscleGroup =
  | 'chest'
  | 'lats'
  | 'upper_back'
  | 'traps'
  | 'front_delts'
  | 'side_delts'
  | 'rear_delts'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'lower_back'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves';

export type InjuryArea =
  | 'shoulder'
  | 'knee'
  | 'lower_back'
  | 'hip'
  | 'wrist'
  | 'elbow'
  | 'ankle'
  | 'neck'
  | 'other'
  | 'none';

export type EquipmentType = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'kettlebell';

export type MovementPattern =
  | 'horizontal_push'
  | 'vertical_push'
  | 'horizontal_pull'
  | 'vertical_pull'
  | 'quad_dominant'
  | 'hip_hinge'
  | 'isolation_chest'
  | 'isolation_delts'
  | 'isolation_biceps'
  | 'isolation_triceps'
  | 'isolation_legs'
  | 'core'
  | 'conditioning'
  | 'carry';

export interface Exercise {
  id: string;
  name: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType;
  contraindications: InjuryArea[];
  instructions: string[];
  whyIncluded: string;
  youtubeId: string;
  youtubeUrl: string;
  alternatives: string[];
  defaultSets: number;
  defaultReps: string;
  defaultRestSeconds: number;
  intensityNote?: string;
  movementPattern?: MovementPattern;
  tier?: 1 | 2 | 3; // 1 = Main Compound, 2 = Secondary Compound, 3 = Isolation / Accessory
}

export interface WorkoutExerciseItem {
  exercise: Exercise;
  sets: number;
  reps: string;
  restSeconds: number;
  intensityNote?: string;
  isSubstituted?: boolean;
  substitutionReason?: string;
}

export interface WorkoutDay {
  dayNumber: number;
  title: string;
  focusMuscles: MuscleGroup[];
  estimatedDuration: number; // in minutes
  exercises: WorkoutExerciseItem[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  userProfile: import('./questionnaire').UserProfile;
  days: WorkoutDay[];
  createdAt: string;
}
