import { AgeCategory, Gender, ExperienceLevel, FitnessGoal, WorkoutDuration, TrainingFrequency } from '@/types/questionnaire';
import { InjuryArea, MuscleGroup } from '@/types/workout';

export interface OptionItem<T> {
  value: T;
  label: string;
  description: string;
  badge?: string;
}

export const GENDER_OPTIONS: OptionItem<Gender>[] = [
  {
    value: 'male',
    label: 'Male',
    description: 'Male starting volumes and split.',
  },
  {
    value: 'female',
    label: 'Female',
    description: 'Female starting volumes and split.',
  },
];

export const AGE_OPTIONS: OptionItem<AgeCategory>[] = [
  { value: '<=20', label: '20 & under', description: 'You recover fast. We focus on good form.' },
  { value: '21-30', label: '21 – 30', description: 'Your prime years for pushing hard.' },
  { value: '31-40', label: '31 – 40', description: 'Steady progress with planned recovery.' },
  { value: '41-50', label: '41 – 50', description: 'Strong lifts, kinder to your joints.' },
  { value: '51-60', label: '51 – 60', description: 'Joint-friendly lifts and longer rests.' },
  { value: '61+', label: '61+', description: 'Strength for everyday life, low impact.' },
];

export const EXPERIENCE_OPTIONS: OptionItem<ExperienceLevel>[] = [
  {
    value: 'complete_beginner',
    label: 'Just starting',
    description: 'Never trained with weights',
    badge: 'Form First',
  },
  {
    value: 'beginner',
    label: 'Under a year',
    description: 'You know the main lifts',
    badge: 'Rapid Gains',
  },
  {
    value: 'intermediate',
    label: '1 to 3 years',
    description: 'Training most weeks',
    badge: 'Hypertrophy',
  },
  {
    value: 'advanced',
    label: '3 years or more',
    description: 'Comfortable under heavy loads',
    badge: 'High Volume',
  },
];

export interface GoalItem {
  id: FitnessGoal;
  label: string;
  category: 'body_composition' | 'strength' | 'specific_emphasis' | 'general';
  description: string;
}

export const GOAL_OPTIONS: GoalItem[] = [
  // Body Composition
  { id: 'muscle_building', label: 'Build muscle', category: 'body_composition', description: 'More size everywhere.' },
  { id: 'fat_loss', label: 'Lose fat', category: 'body_composition', description: 'Faster-paced sessions that burn more.' },
  { id: 'lean_toned', label: 'Lean and toned', category: 'body_composition', description: 'Lighter weights, more movement, visible definition.' },
  { id: 'general_fitness', label: 'General fitness', category: 'body_composition', description: 'A bit of everything. Feel better day to day.' },

  // Strength
  { id: 'build_strength', label: 'Max strength', category: 'strength', description: 'Heavy squats, presses and pulls for low reps.' },
  { id: 'overall_strength', label: 'All-round strength', category: 'strength', description: 'Strong in every direction, for life and sport.' },
  { id: 'beginner_strength', label: 'Starter strength', category: 'strength', description: 'Learn the main lifts safely and build a base.' },

  // Specific Emphasis
  { id: 'chest_emphasis', label: 'Bigger chest', category: 'specific_emphasis', description: 'Extra pressing and chest work. The rest stays balanced.' },
  { id: 'back_emphasis', label: 'Wider back', category: 'specific_emphasis', description: 'More rows and pull-downs for a thicker, wider back.' },
  { id: 'shoulder_emphasis', label: 'Broader shoulders', category: 'specific_emphasis', description: 'More side and rear delt work for width.' },
  { id: 'arm_emphasis', label: 'Bigger arms', category: 'specific_emphasis', description: 'Extra biceps and triceps on top of the big lifts.' },
  { id: 'leg_emphasis', label: 'Stronger legs', category: 'specific_emphasis', description: 'More squats and leg presses.' },
  { id: 'glute_emphasis', label: 'Glutes', category: 'specific_emphasis', description: 'Hip thrusts, Romanian deadlifts and lunges.' },
  { id: 'core_emphasis', label: 'Core', category: 'specific_emphasis', description: 'Direct ab and bracing work for a solid middle.' },

  // General
  { id: 'athletic_performance', label: 'Athletic', category: 'general', description: 'Power, balance and conditioning.' },
  { id: 'endurance', label: 'Endurance', category: 'general', description: 'Higher reps and shorter rests.' },
  { id: 'maintain_fitness', label: 'Stay in shape', category: 'general', description: 'Short sessions that keep what you have.' },
];

export const FREQUENCY_OPTIONS: OptionItem<TrainingFrequency>[] = [
  { value: 'recommend', label: 'We will pick', description: 'Based on your goal and experience.' },
  { value: 2, label: 'Full body, twice', description: 'Two full-body sessions. Good for busy weeks.' },
  { value: 3, label: 'Full body', description: 'Three full-body sessions with a rest day between.' },
  { value: 4, label: 'Upper and lower', description: 'Two upper-body days and two lower-body days.' },
  { value: 5, label: 'Push, pull, legs, upper, lower', description: 'Five sessions. Every muscle trained twice.' },
  { value: 6, label: 'Push, pull, legs, twice', description: 'Six sessions. Every muscle trained twice.' },
];

export const DURATION_OPTIONS: OptionItem<WorkoutDuration>[] = [
  { value: 30, label: '30 Minutes', description: '4 exercises. In and out.' },
  { value: 45, label: '45 Minutes', description: '5 exercises. The essentials.' },
  { value: 60, label: '60 Minutes', description: '6 exercises. Big lifts plus accessories.' },
  { value: 90, label: '90 Minutes', description: '8 exercises. Room for arms and core.' },
  { value: 120, label: '120 Minutes', description: '10 exercises. The full session.' },
];

export interface InjuryOption {
  id: InjuryArea;
  label: string;
  affectedMovements: string;
}

export const INJURY_OPTIONS: InjuryOption[] = [
  { id: 'none', label: 'Nothing hurts', affectedMovements: 'Every exercise is available.' },
  { id: 'shoulder', label: 'Shoulder', affectedMovements: 'Heavy overhead pressing is swapped for neutral-grip and machine presses.' },
  { id: 'knee', label: 'Knee', affectedMovements: 'Deep squats and lunges are swapped for leg press, glute bridges and hamstring curls.' },
  { id: 'lower_back', label: 'Lower back', affectedMovements: 'Deadlifts and loaded squats are swapped for chest-supported rows and leg press.' },
  { id: 'hip', label: 'Hip', affectedMovements: 'Wide stances and deep hip bends are avoided. Glute bridges come first.' },
  { id: 'wrist', label: 'Wrist', affectedMovements: 'Straight-bar curls and presses become dumbbell, neutral-grip and machine versions.' },
  { id: 'elbow', label: 'Elbow', affectedMovements: 'Skull crushers and heavy barbell curls are swapped for cable pushdowns and hammer curls.' },
  { id: 'ankle', label: 'Ankle', affectedMovements: 'Deep calf drops and ankle-heavy squat depth are left out.' },
  { id: 'neck', label: 'Neck', affectedMovements: 'Heavy shrugs, behind-the-neck moves and decline setups are left out.' },
  { id: 'other', label: 'Something else', affectedMovements: 'Tell us what is going on in the note below.' },
];

export function isGoalContradictory(
  primaryGoal: FitnessGoal,
  candidateGoal: FitnessGoal
): { isContradictory: boolean; reason?: string } {
  if (primaryGoal === candidateGoal) {
    return { isContradictory: true, reason: 'Already selected as your primary goal.' };
  }
  if (primaryGoal === 'fat_loss' && candidateGoal === 'muscle_building') {
    return { isContradictory: true, reason: 'Hard to do both at once: losing fat means eating less, building muscle means eating more.' };
  }
  if (primaryGoal === 'muscle_building' && candidateGoal === 'fat_loss') {
    return { isContradictory: true, reason: 'Hard to do both at once: building muscle means eating more, losing fat means eating less.' };
  }
  if (primaryGoal === 'fat_loss' && candidateGoal === 'maintain_fitness') {
    return { isContradictory: true, reason: 'Fat loss focuses on weight reduction while maintenance preserves current body mass.' };
  }
  if (primaryGoal === 'build_strength' && candidateGoal === 'beginner_strength') {
    return { isContradictory: true, reason: 'Maximal strength programming assumes beyond-beginner baseline strength.' };
  }
  return { isContradictory: false };
}
