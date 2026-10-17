import { MovementPattern, MuscleGroup } from '@/types/workout';

export interface TemplateSlot {
  pattern: MovementPattern;
  preferredMuscles: MuscleGroup[];
  isEssential: boolean; // included even in 30-min express workouts
  tierPreference?: 1 | 2 | 3;
}

export interface DayTemplate {
  title: string;
  focusMuscles: MuscleGroup[];
  slots: TemplateSlot[];
}

export interface ProgramTemplate {
  frequency: number;
  name: string;
  description: string;
  days: DayTemplate[];
}

// 2-DAY FULL BODY
const TEMPLATE_2_DAY: ProgramTemplate = {
  frequency: 2,
  name: '2-Day Express Full Body Split',
  description: 'Maximum training efficiency across two full-body sessions per week.',
  days: [
    {
      title: 'Full Body A — Quad & Push Focus',
      focusMuscles: ['quads', 'chest', 'upper_back', 'front_delts', 'triceps', 'abs'],
      slots: [
        { pattern: 'quad_dominant', preferredMuscles: ['quads'], isEssential: true, tierPreference: 1 },
        { pattern: 'horizontal_push', preferredMuscles: ['chest'], isEssential: true, tierPreference: 1 },
        { pattern: 'horizontal_pull', preferredMuscles: ['upper_back', 'lats'], isEssential: true, tierPreference: 2 },
        { pattern: 'vertical_push', preferredMuscles: ['front_delts', 'side_delts'], isEssential: false, tierPreference: 2 },
        { pattern: 'isolation_triceps', preferredMuscles: ['triceps'], isEssential: false, tierPreference: 3 },
        { pattern: 'core', preferredMuscles: ['abs'], isEssential: false, tierPreference: 3 },
      ],
    },
    {
      title: 'Full Body B — Hinge & Pull Focus',
      focusMuscles: ['hamstrings', 'glutes', 'lats', 'side_delts', 'biceps', 'obliques'],
      slots: [
        { pattern: 'hip_hinge', preferredMuscles: ['hamstrings', 'glutes'], isEssential: true, tierPreference: 1 },
        { pattern: 'vertical_pull', preferredMuscles: ['lats'], isEssential: true, tierPreference: 1 },
        { pattern: 'horizontal_push', preferredMuscles: ['chest'], isEssential: true, tierPreference: 2 },
        { pattern: 'isolation_delts', preferredMuscles: ['side_delts'], isEssential: false, tierPreference: 3 },
        { pattern: 'isolation_biceps', preferredMuscles: ['biceps'], isEssential: false, tierPreference: 3 },
        { pattern: 'core', preferredMuscles: ['abs', 'obliques'], isEssential: false, tierPreference: 3 },
      ],
    },
  ],
};

// 3-DAY FULL BODY
const TEMPLATE_3_DAY: ProgramTemplate = {
  frequency: 3,
  name: '3-Day Classic Full Body Split',
  description: 'The proven gym standard: train all major muscle groups 3 times per week with built-in recovery.',
  days: [
    {
      title: 'Day 1 — Foundation & Squat Focus',
      focusMuscles: ['quads', 'chest', 'upper_back', 'side_delts', 'abs'],
      slots: [
        { pattern: 'quad_dominant', preferredMuscles: ['quads'], isEssential: true, tierPreference: 1 },
        { pattern: 'horizontal_push', preferredMuscles: ['chest'], isEssential: true, tierPreference: 1 },
        { pattern: 'horizontal_pull', preferredMuscles: ['upper_back', 'lats'], isEssential: true, tierPreference: 2 },
        { pattern: 'isolation_delts', preferredMuscles: ['side_delts'], isEssential: false, tierPreference: 3 },
        { pattern: 'isolation_biceps', preferredMuscles: ['biceps'], isEssential: false, tierPreference: 3 },
        { pattern: 'core', preferredMuscles: ['abs'], isEssential: false, tierPreference: 3 },
        { pattern: 'conditioning', preferredMuscles: ['quads'], isEssential: false, tierPreference: 3 },
      ],
    },
    {
      title: 'Day 2 — Posterior Chain & Overhead Focus',
      focusMuscles: ['hamstrings', 'glutes', 'front_delts', 'lats', 'triceps', 'calves'],
      slots: [
        { pattern: 'hip_hinge', preferredMuscles: ['hamstrings', 'glutes'], isEssential: true, tierPreference: 1 },
        { pattern: 'vertical_push', preferredMuscles: ['front_delts', 'side_delts'], isEssential: true, tierPreference: 1 },
        { pattern: 'vertical_pull', preferredMuscles: ['lats'], isEssential: true, tierPreference: 2 },
        { pattern: 'isolation_legs', preferredMuscles: ['calves', 'hamstrings'], isEssential: false, tierPreference: 3 },
        { pattern: 'isolation_triceps', preferredMuscles: ['triceps'], isEssential: false, tierPreference: 3 },
        { pattern: 'core', preferredMuscles: ['abs', 'obliques'], isEssential: false, tierPreference: 3 },
      ],
    },
    {
      title: 'Day 3 — Volume & Hypertrophy Balance',
      focusMuscles: ['quads', 'chest', 'upper_back', 'biceps', 'triceps', 'glutes'],
      slots: [
        { pattern: 'quad_dominant', preferredMuscles: ['quads', 'glutes'], isEssential: true, tierPreference: 2 },
        { pattern: 'horizontal_push', preferredMuscles: ['chest'], isEssential: true, tierPreference: 2 },
        { pattern: 'horizontal_pull', preferredMuscles: ['upper_back'], isEssential: true, tierPreference: 2 },
        { pattern: 'hip_hinge', preferredMuscles: ['hamstrings', 'glutes'], isEssential: false, tierPreference: 2 },
        { pattern: 'isolation_biceps', preferredMuscles: ['biceps'], isEssential: false, tierPreference: 3 },
        { pattern: 'isolation_triceps', preferredMuscles: ['triceps'], isEssential: false, tierPreference: 3 },
        { pattern: 'core', preferredMuscles: ['abs'], isEssential: false, tierPreference: 3 },
      ],
    },
  ],
};

// 4-DAY UPPER / LOWER
const TEMPLATE_4_DAY: ProgramTemplate = {
  frequency: 4,
  name: '4-Day Upper / Lower Split',
  description: 'Target upper and lower body twice a week for optimal muscle building and recovery.',
  days: [
    {
      title: 'Day 1 — Upper Body Heavy Push & Pull',
      focusMuscles: ['chest', 'upper_back', 'front_delts', 'lats', 'triceps'],
      slots: [
        { pattern: 'horizontal_push', preferredMuscles: ['chest'], isEssential: true, tierPreference: 1 },
        { pattern: 'horizontal_pull', preferredMuscles: ['upper_back'], isEssential: true, tierPreference: 1 },
        { pattern: 'vertical_push', preferredMuscles: ['front_delts'], isEssential: true, tierPreference: 2 },
        { pattern: 'vertical_pull', preferredMuscles: ['lats'], isEssential: false, tierPreference: 2 },
        { pattern: 'isolation_triceps', preferredMuscles: ['triceps'], isEssential: false, tierPreference: 3 },
        { pattern: 'isolation_biceps', preferredMuscles: ['biceps'], isEssential: false, tierPreference: 3 },
      ],
    },
    {
      title: 'Day 2 — Lower Body Quad & Glute Focus',
      focusMuscles: ['quads', 'glutes', 'calves', 'abs'],
      slots: [
        { pattern: 'quad_dominant', preferredMuscles: ['quads'], isEssential: true, tierPreference: 1 },
        { pattern: 'hip_hinge', preferredMuscles: ['glutes', 'hamstrings'], isEssential: true, tierPreference: 2 },
        { pattern: 'quad_dominant', preferredMuscles: ['quads'], isEssential: true, tierPreference: 2 },
        { pattern: 'isolation_legs', preferredMuscles: ['calves', 'quads'], isEssential: false, tierPreference: 3 },
        { pattern: 'core', preferredMuscles: ['abs'], isEssential: false, tierPreference: 3 },
        { pattern: 'core', preferredMuscles: ['obliques'], isEssential: false, tierPreference: 3 },
      ],
    },
    {
      title: 'Day 3 — Upper Body Hypertrophy & Arms',
      focusMuscles: ['chest', 'lats', 'side_delts', 'biceps', 'triceps'],
      slots: [
        { pattern: 'vertical_pull', preferredMuscles: ['lats'], isEssential: true, tierPreference: 1 },
        { pattern: 'horizontal_push', preferredMuscles: ['chest'], isEssential: true, tierPreference: 2 },
        { pattern: 'horizontal_pull', preferredMuscles: ['upper_back'], isEssential: true, tierPreference: 2 },
        { pattern: 'isolation_delts', preferredMuscles: ['side_delts'], isEssential: false, tierPreference: 3 },
        { pattern: 'isolation_biceps', preferredMuscles: ['biceps'], isEssential: false, tierPreference: 3 },
        { pattern: 'isolation_triceps', preferredMuscles: ['triceps'], isEssential: false, tierPreference: 3 },
      ],
    },
    {
      title: 'Day 4 — Lower Body Posterior Chain & Core',
      focusMuscles: ['hamstrings', 'glutes', 'quads', 'lower_back', 'abs'],
      slots: [
        { pattern: 'hip_hinge', preferredMuscles: ['hamstrings', 'glutes'], isEssential: true, tierPreference: 1 },
        { pattern: 'quad_dominant', preferredMuscles: ['quads'], isEssential: true, tierPreference: 2 },
        { pattern: 'isolation_legs', preferredMuscles: ['hamstrings'], isEssential: true, tierPreference: 3 },
        { pattern: 'isolation_legs', preferredMuscles: ['calves'], isEssential: false, tierPreference: 3 },
        { pattern: 'core', preferredMuscles: ['abs'], isEssential: false, tierPreference: 3 },
        { pattern: 'carry', preferredMuscles: ['forearms', 'traps'], isEssential: false, tierPreference: 3 },
      ],
    },
  ],
};

// 5-DAY PUSH / PULL / LEGS / UPPER / LOWER
const TEMPLATE_5_DAY: ProgramTemplate = {
  frequency: 5,
  name: '5-Day Performance Split (PPL + UL)',
  description: 'High frequency and volume designed for dedicated athletic and muscle progression.',
  days: [
    {
      title: 'Day 1 — Push (Chest, Shoulders & Triceps)',
      focusMuscles: ['chest', 'front_delts', 'side_delts', 'triceps'],
      slots: [
        { pattern: 'horizontal_push', preferredMuscles: ['chest'], isEssential: true, tierPreference: 1 },
        { pattern: 'vertical_push', preferredMuscles: ['front_delts'], isEssential: true, tierPreference: 2 },
        { pattern: 'horizontal_push', preferredMuscles: ['chest'], isEssential: true, tierPreference: 2 },
        { pattern: 'isolation_delts', preferredMuscles: ['side_delts'], isEssential: false, tierPreference: 3 },
        { pattern: 'isolation_triceps', preferredMuscles: ['triceps'], isEssential: false, tierPreference: 3 },
        { pattern: 'isolation_triceps', preferredMuscles: ['triceps'], isEssential: false, tierPreference: 3 },
      ],
    },
    {
      title: 'Day 2 — Pull (Back, Rear Delts & Biceps)',
      focusMuscles: ['lats', 'upper_back', 'rear_delts', 'biceps'],
      slots: [
        { pattern: 'vertical_pull', preferredMuscles: ['lats'], isEssential: true, tierPreference: 1 },
        { pattern: 'horizontal_pull', preferredMuscles: ['upper_back'], isEssential: true, tierPreference: 1 },
        { pattern: 'horizontal_pull', preferredMuscles: ['upper_back', 'rear_delts'], isEssential: true, tierPreference: 2 },
        { pattern: 'isolation_delts', preferredMuscles: ['rear_delts'], isEssential: false, tierPreference: 3 },
        { pattern: 'isolation_biceps', preferredMuscles: ['biceps'], isEssential: false, tierPreference: 3 },
        { pattern: 'isolation_biceps', preferredMuscles: ['biceps'], isEssential: false, tierPreference: 3 },
      ],
    },
    {
      title: 'Day 3 — Legs & Abs',
      focusMuscles: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'],
      slots: [
        { pattern: 'quad_dominant', preferredMuscles: ['quads'], isEssential: true, tierPreference: 1 },
        { pattern: 'hip_hinge', preferredMuscles: ['hamstrings', 'glutes'], isEssential: true, tierPreference: 1 },
        { pattern: 'quad_dominant', preferredMuscles: ['quads', 'glutes'], isEssential: true, tierPreference: 2 },
        { pattern: 'isolation_legs', preferredMuscles: ['calves'], isEssential: false, tierPreference: 3 },
        { pattern: 'core', preferredMuscles: ['abs'], isEssential: false, tierPreference: 3 },
      ],
    },
    {
      title: 'Day 4 — Upper Body Hypertrophy',
      focusMuscles: ['chest', 'lats', 'side_delts', 'biceps', 'triceps'],
      slots: [
        { pattern: 'horizontal_push', preferredMuscles: ['chest'], isEssential: true, tierPreference: 2 },
        { pattern: 'vertical_pull', preferredMuscles: ['lats'], isEssential: true, tierPreference: 2 },
        { pattern: 'isolation_delts', preferredMuscles: ['side_delts'], isEssential: true, tierPreference: 3 },
        { pattern: 'isolation_biceps', preferredMuscles: ['biceps'], isEssential: false, tierPreference: 3 },
        { pattern: 'isolation_triceps', preferredMuscles: ['triceps'], isEssential: false, tierPreference: 3 },
      ],
    },
    {
      title: 'Day 5 — Lower Body & Posterior Chain',
      focusMuscles: ['hamstrings', 'glutes', 'quads', 'abs'],
      slots: [
        { pattern: 'hip_hinge', preferredMuscles: ['hamstrings', 'glutes'], isEssential: true, tierPreference: 2 },
        { pattern: 'quad_dominant', preferredMuscles: ['quads'], isEssential: true, tierPreference: 2 },
        { pattern: 'isolation_legs', preferredMuscles: ['hamstrings'], isEssential: true, tierPreference: 3 },
        { pattern: 'core', preferredMuscles: ['abs'], isEssential: false, tierPreference: 3 },
        { pattern: 'carry', preferredMuscles: ['forearms'], isEssential: false, tierPreference: 3 },
      ],
    },
  ],
};

// 6-DAY PUSH / PULL / LEGS (2X)
const TEMPLATE_6_DAY: ProgramTemplate = {
  frequency: 6,
  name: '6-Day Push / Pull / Legs Split',
  description: 'Maximum training frequency and volume for advanced lifters.',
  days: [
    { ...TEMPLATE_5_DAY.days[0], title: 'Day 1 — Push A (Strength Focus)' },
    { ...TEMPLATE_5_DAY.days[1], title: 'Day 2 — Pull A (Strength Focus)' },
    { ...TEMPLATE_5_DAY.days[2], title: 'Day 3 — Legs A (Quad Focus)' },
    { ...TEMPLATE_5_DAY.days[0], title: 'Day 4 — Push B (Hypertrophy Focus)' },
    { ...TEMPLATE_5_DAY.days[1], title: 'Day 5 — Pull B (Hypertrophy Focus)' },
    { ...TEMPLATE_5_DAY.days[2], title: 'Day 6 — Legs B (Hamstring & Glute Focus)' },
  ],
};

export const TEMPLATES_BY_FREQUENCY: Record<number, ProgramTemplate> = {
  2: TEMPLATE_2_DAY,
  3: TEMPLATE_3_DAY,
  4: TEMPLATE_4_DAY,
  5: TEMPLATE_5_DAY,
  6: TEMPLATE_6_DAY,
};
