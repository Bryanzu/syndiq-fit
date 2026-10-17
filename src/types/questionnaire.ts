import { InjuryArea, MuscleGroup } from './workout';
import { SyndiqEquipmentId } from './equipment';

export type AgeCategory = '<=20' | '21-30' | '31-40' | '41-50' | '51-60' | '61+';

export type Gender = 'male' | 'female';

export type ExperienceLevel =
  | 'complete_beginner'
  | 'beginner'
  | 'intermediate'
  | 'advanced';

export type WorkoutDuration = 30 | 45 | 60 | 90 | 120;

export type TrainingFrequency = 2 | 3 | 4 | 5 | 6 | 'recommend';

export type GoalCategory = 'body_composition' | 'strength' | 'specific_emphasis' | 'general';

export type FitnessGoal =
  // Body Composition
  | 'fat_loss'
  | 'muscle_building'
  | 'lean_toned'
  | 'general_fitness'
  // Strength
  | 'build_strength'
  | 'overall_strength'
  | 'beginner_strength'
  // Specific Emphasis
  | 'chest_emphasis'
  | 'back_emphasis'
  | 'shoulder_emphasis'
  | 'arm_emphasis'
  | 'leg_emphasis'
  | 'glute_emphasis'
  | 'core_emphasis'
  // General
  | 'endurance'
  | 'maintain_fitness'
  | 'athletic_performance';

export interface UserProfile {
  gender: Gender;
  age: AgeCategory;
  experience: ExperienceLevel;
  goal: FitnessGoal;
  frequency: TrainingFrequency;
  duration: WorkoutDuration;
  availableEquipment: SyndiqEquipmentId[];
  musclePreferences?: MuscleGroup[];
  injuries: InjuryArea[];
  injuryNotes?: string;
  dislikedExercises?: string[];
}
