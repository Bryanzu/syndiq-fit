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
    description: 'Strength & hypertrophy programming optimized for male physiological baselines.',
  },
  {
    value: 'female',
    label: 'Female',
    description: 'Comprehensive strength & conditioning designed for female physiological baselines.',
  },
];

export const AGE_OPTIONS: OptionItem<AgeCategory>[] = [
  { value: '<=20', label: '20 & under', description: 'High recovery capacity; focus on foundational movement mechanics.' },
  { value: '21-30', label: '21 – 30', description: 'Peak training tolerance; suitable for high intensity and progressive overload.' },
  { value: '31-40', label: '31 – 40', description: 'Balanced performance; progressive volume with structured recovery.' },
  { value: '41-50', label: '41 – 50', description: 'Strength and longevity; emphasis on joint integrity and sustained progression.' },
  { value: '51-60', label: '51 – 60', description: 'Joint-friendly compound lifts, extended rest, and mobility integration.' },
  { value: '61+', label: '61+', description: 'Longevity, bone density, functional strength, and low joint impact.' },
];

export const EXPERIENCE_OPTIONS: OptionItem<ExperienceLevel>[] = [
  {
    value: 'complete_beginner',
    label: 'Complete Beginner',
    description: 'Brand new to lifting. Guided machines, safe dumbbells, and form-first rep ranges.',
    badge: 'Form First',
  },
  {
    value: 'beginner',
    label: 'Beginner (< 1 Year)',
    description: 'Familiar with basic gym machines; ready for foundational compound movements.',
    badge: 'Rapid Gains',
  },
  {
    value: 'intermediate',
    label: 'Intermediate (1–3 Years)',
    description: 'Consistent lifting history; comfortable with barbells and structured progressive overload.',
    badge: 'Hypertrophy',
  },
  {
    value: 'advanced',
    label: 'Advanced (3+ Years)',
    description: 'High technical proficiency; ready for higher volume splits and targeted intensity.',
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
  { id: 'muscle_building', label: 'Muscle Building (Hypertrophy)', category: 'body_composition', description: 'Maximize muscle size and fullness across the entire body.' },
  { id: 'fat_loss', label: 'Fat Loss & Definition', category: 'body_composition', description: 'High-density workouts with crisp rest intervals to maximize caloric expenditure.' },
  { id: 'lean_toned', label: 'Lean & Toned Physique', category: 'body_composition', description: 'Moderate resistance and athletic circuits for defined, athletic musculature.' },
  { id: 'general_fitness', label: 'General Fitness & Health', category: 'body_composition', description: 'Well-rounded physical strength, cardiovascular health, and day-to-day vitality.' },

  // Strength
  { id: 'build_strength', label: 'Build Maximal Strength', category: 'strength', description: 'Focus on heavy compound movements (squat, bench, hinge) in lower rep ranges.' },
  { id: 'overall_strength', label: 'Overall Functional Strength', category: 'strength', description: 'Balanced multi-joint strength applicable to daily life and sports.' },
  { id: 'beginner_strength', label: 'Beginner Strength Foundation', category: 'strength', description: 'Learn key movement patterns safely while building baseline tendon and muscle strength.' },

  // Specific Emphasis
  { id: 'chest_emphasis', label: 'Chest Development', category: 'specific_emphasis', description: 'Prioritize chest volume and pressing while maintaining balanced full-body training.' },
  { id: 'back_emphasis', label: 'Back & V-Taper Development', category: 'specific_emphasis', description: 'Emphasize vertical pulls and horizontal rows for upper back thickness and lats.' },
  { id: 'shoulder_emphasis', label: 'Shoulder & Delt Width', category: 'specific_emphasis', description: 'Extra focus on side and rear delts to build broad, 3D shoulder shape.' },
  { id: 'arm_emphasis', label: 'Arm Development (Biceps & Triceps)', category: 'specific_emphasis', description: 'Dedicated direct arm volume paired with heavy compound pushes and pulls.' },
  { id: 'leg_emphasis', label: 'Leg & Quad Development', category: 'specific_emphasis', description: 'High-quad stimulus with progressive squat and press patterns.' },
  { id: 'glute_emphasis', label: 'Glute Development', category: 'specific_emphasis', description: 'Hip thrusts, Romanian deadlifts, and lunges dialed for maximum glute growth.' },
  { id: 'core_emphasis', label: 'Core & Midsection Stability', category: 'specific_emphasis', description: 'Direct anti-extension, rotation, and bracing movements for a solid midsection.' },

  // General
  { id: 'athletic_performance', label: 'Athletic Performance', category: 'general', description: 'Explosive power, strength balance, and multi-planar conditioning.' },
  { id: 'endurance', label: 'Muscular Endurance', category: 'general', description: 'Higher rep capacity and stamina with sustained work intervals.' },
  { id: 'maintain_fitness', label: 'Maintain Current Fitness', category: 'general', description: 'Time-efficient sessions designed to preserve muscle and strength.' },
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
  { value: 30, label: '30 Minutes', description: 'Express: 3 focused compound movements, super-efficient pacing.' },
  { value: 45, label: '45 Minutes', description: 'Compact: 4 exercises with solid multi-joint volume.' },
  { value: 60, label: '60 Minutes', description: 'Standard: 5–6 exercises with balanced compounds and isolation.' },
  { value: 90, label: '90 Minutes', description: 'Extended: 7–8 exercises with complete accessory and direct arm/core work.' },
  { value: 120, label: '120 Minutes', description: 'Maximum: 8–9 exercises with full warm-up, heavy compounds, accessories, and conditioning.' },
];

export interface InjuryOption {
  id: InjuryArea;
  label: string;
  affectedMovements: string;
}

export const INJURY_OPTIONS: InjuryOption[] = [
  { id: 'none', label: 'No Injuries or Limitations', affectedMovements: 'Full exercise library available without restriction.' },
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
