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
    label: 'Complete Beginner',
    description: 'Never lifted. We start with machines and light dumbbells.',
    badge: 'Form First',
  },
  {
    value: 'beginner',
    label: 'Beginner (< 1 Year)',
    description: 'You know the machines and are ready for the big lifts.',
    badge: 'Rapid Gains',
  },
  {
    value: 'intermediate',
    label: 'Intermediate (1–3 Years)',
    description: 'You train regularly and are comfortable with a barbell.',
    badge: 'Hypertrophy',
  },
  {
    value: 'advanced',
    label: 'Advanced (3+ Years)',
    description: 'Years under the bar. Ready for more volume.',
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
  { value: 'recommend', label: 'Recommend for me', description: 'Syndiq fit will pick the ideal split based on your experience and goal.', badge: 'Recommended' },
  { value: 2, label: '2 Days / Week', description: 'Full body express workouts for very busy schedules.' },
  { value: 3, label: '3 Days / Week', description: 'Classic full-body split with rest days between sessions.' },
  { value: 4, label: '4 Days / Week', description: 'Upper / Lower split allowing higher volume per muscle group.' },
  { value: 5, label: '5 Days / Week', description: 'Push / Pull / Legs + Upper / Lower split for dedicated lifters.' },
  { value: 6, label: '6 Days / Week', description: 'High-frequency 6-day split (PPL x 2) for maximum volume.' },
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
  { id: 'none', label: 'No injuries', affectedMovements: 'Full exercise library available without restriction.' },
  { id: 'shoulder', label: 'Shoulder Pain / Impingement', affectedMovements: 'Swaps heavy barbell overhead pressing for neutral-grip and machine presses.' },
  { id: 'knee', label: 'Knee Pain / Patellar Issues', affectedMovements: 'Replaces deep squats and lunges with controlled leg press, glute bridges, and hamstring curls.' },
  { id: 'lower_back', label: 'Lower Back / Spine Strain', affectedMovements: 'Substitutes spinal-loading deadlifts and squats with chest-supported rows and leg press.' },
  { id: 'hip', label: 'Hip Pain / Impingement', affectedMovements: 'Adjusts stance width, avoids extreme deep hip flexion, prioritizes glute bridges.' },
  { id: 'wrist', label: 'Wrist Pain / Weakness', affectedMovements: 'Replaces straight barbell curls/presses with dumbbell neutral grips and machines.' },
  { id: 'elbow', label: 'Elbow Tendonitis (Tennis/Golfer)', affectedMovements: 'Swaps skull crushers and heavy barbell curls for cable pushdowns and hammer curls.' },
  { id: 'ankle', label: 'Ankle Mobility Limitation', affectedMovements: 'Avoids deep calf drops and ankle-dependent squat depth.' },
  { id: 'neck', label: 'Neck / Cervical Tension', affectedMovements: 'Avoids heavy shrugs, behind-the-neck movements, and decline setups.' },
  { id: 'other', label: 'Other Limitation', affectedMovements: 'Describe your symptoms in the notes box below.' },
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
