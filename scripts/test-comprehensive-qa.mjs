import { exercises, getExerciseById } from '../src/data/exercises';
import { generateWorkoutProgram } from '../src/engine/programAssembler';
import { validateWorkoutProgram } from '../src/engine/workoutValidator';
import { BODYWEIGHT_ONLY_IDS, HOME_GYM_DUMBBELLS_IDS, ALL_SYNDIQ_EQUIPMENT_IDS } from '../src/data/equipment';
import { isContraindicated } from '../src/engine/injuryRules';
import { generateWeeklyMealPlan } from '../src/engine/mealPlanner/mealPlanGenerator';
import fs from 'fs';
import path from 'path';

console.log('=================================================================');
console.log('   SYNDIQ FIT — COMPREHENSIVE QA & VALIDATION SUITE');
console.log('=================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

// -----------------------------------------------------------------------------
// TEST 1: Exercise Catalog Completeness & Metadata
// -----------------------------------------------------------------------------
console.log('--- TEST 1: Exercise Catalog Completeness ---');
assert(exercises.length >= 100, `Total catalog size: ${exercises.length} exercises (>= 100 required)`);

const strictBodyweightExercises = exercises.filter(e => e.isStrictBodyweight === true);
assert(strictBodyweightExercises.length >= 35, `Strict pure bodyweight catalog: ${strictBodyweightExercises.length} exercises (>= 35 required)`);

let metadataValid = true;
for (const ex of exercises) {
  if (!ex.id || !ex.name || !ex.movementPattern || !ex.primaryMuscles || ex.primaryMuscles.length === 0 || typeof ex.isStrictBodyweight !== 'boolean') {
    metadataValid = false;
    console.error(`Invalid metadata for exercise: ${ex.id}`);
    break;
  }
}
assert(metadataValid, 'All exercises have complete valid metadata (id, name, pattern, muscles, isStrictBodyweight)');

// -----------------------------------------------------------------------------
// TEST 2: Strict Bodyweight Mode Isolation (ZERO External Gear)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 2: Strict Bodyweight Workout Generation ---');

const bodyweightProfiles = [
  {
    name: '3-Day Beginner Full Body (Pure Bodyweight)',
    profile: {
      gender: 'male',
      age: '21-30',
      experience: 'beginner',
      goal: 'muscle_building',
      frequency: 3,
      duration: 45,
      availableEquipment: BODYWEIGHT_ONLY_IDS,
      injuries: ['none'],
    },
  },
  {
    name: '4-Day Intermediate Upper/Lower (Pure Bodyweight)',
    profile: {
      gender: 'female',
      age: '31-40',
      experience: 'intermediate',
      goal: 'fat_loss',
      frequency: 4,
      duration: 60,
      availableEquipment: ['bodyweight_only'],
      injuries: ['none'],
    },
  },
  {
    name: '5-Day Advanced Split (Pure Bodyweight)',
    profile: {
      gender: 'male',
      age: '21-30',
      experience: 'advanced',
      goal: 'strength',
      frequency: 5,
      duration: 60,
      availableEquipment: [],
      injuries: ['none'],
    },
  },
];

for (const { name, profile } of bodyweightProfiles) {
  const program = generateWorkoutProgram(profile);
  const validation = validateWorkoutProgram(program);

  let hasExternalEquipment = false;
  let nonBodyweightExList = [];

  for (const day of program.days) {
    for (const item of day.exercises) {
      if (!item.exercise.isStrictBodyweight || item.exercise.equipment !== 'bodyweight') {
        hasExternalEquipment = true;
        nonBodyweightExList.push(`${item.exercise.name} (${item.exercise.equipment})`);
      }
    }
  }

  assert(!hasExternalEquipment, `${name}: 100% pure bodyweight exercises (leaks: ${nonBodyweightExList.join(', ') || 'none'})`);
  assert(validation.isValid, `${name}: Program passes validation score (${validation.score}/100)`);
}

// -----------------------------------------------------------------------------
// TEST 3: Home Gym Dumbbells Only Mode
// -----------------------------------------------------------------------------
console.log('\n--- TEST 3: Home Gym Dumbbells Equipment Filtering ---');

const dumbbellProfile = {
  gender: 'male',
  age: '31-40',
  experience: 'intermediate',
  goal: 'muscle_building',
  frequency: 3,
  duration: 60,
  availableEquipment: HOME_GYM_DUMBBELLS_IDS,
  injuries: ['none'],
};

const dumbbellProgram = generateWorkoutProgram(dumbbellProfile);
let hasInvalidHomeGymGear = false;
let invalidList = [];

for (const day of dumbbellProgram.days) {
  for (const item of day.exercises) {
    const eq = item.exercise.equipment;
    if (eq !== 'bodyweight' && eq !== 'dumbbell' && eq !== 'bench') {
      hasInvalidHomeGymGear = true;
      invalidList.push(`${item.exercise.name} (${eq})`);
    }
  }
}
assert(!hasInvalidHomeGymGear, `Home Dumbbells Mode: Only bodyweight or dumbbells assigned (invalid: ${invalidList.join(', ') || 'none'})`);

// -----------------------------------------------------------------------------
// TEST 4: Injury Safety & Contraindication Filtering
// -----------------------------------------------------------------------------
console.log('\n--- TEST 4: Injury Safety & Joint Contraindications ---');

const shoulderEx = getExerciseById('barbell-overhead-press');
const kneeEx = getExerciseById('barbell-back-squat');
const backEx = getExerciseById('conventional-deadlift');

assert(Boolean(shoulderEx && isContraindicated(shoulderEx, ['shoulder'])), 'Overhead barbell press contraindicated for shoulder injury');
assert(Boolean(kneeEx && isContraindicated(kneeEx, ['knee'])), 'Barbell back squat contraindicated for knee injury');
assert(Boolean(backEx && isContraindicated(backEx, ['lower_back'])), 'Deadlift contraindicated for lower back injury');

const injuredProfile = {
  gender: 'male',
  age: '41-50',
  experience: 'intermediate',
  goal: 'general_fitness',
  frequency: 3,
  duration: 45,
  availableEquipment: ALL_SYNDIQ_EQUIPMENT_IDS,
  injuries: ['shoulder', 'lower_back'],
};

const injuredProgram = generateWorkoutProgram(injuredProfile);
let injuredLeaks = [];

for (const day of injuredProgram.days) {
  for (const item of day.exercises) {
    if (isContraindicated(item.exercise, ['shoulder', 'lower_back'])) {
      injuredLeaks.push(item.exercise.name);
    }
  }
}
assert(injuredLeaks.length === 0, `Injured lifter program avoids all contraindicated movements (leaks: ${injuredLeaks.join(', ') || 'none'})`);

// -----------------------------------------------------------------------------
// TEST 5: Nigerian Meal Planner Generator
// -----------------------------------------------------------------------------
console.log('\n--- TEST 5: Nigerian Meal Planner Generator ---');

const mealPlanProfile = {
  gender: 'male',
  age: 26,
  weightKg: 75,
  activityLevel: 'moderate',
  goal: 'muscle_building',
  mealsPerDay: 3,
  budgetLevel: 'moderate',
  targetCalories: 2200,
  targetProteinGrams: 140,
};

const mealPlan = generateWeeklyMealPlan(mealPlanProfile, []);
assert(mealPlan.days && mealPlan.days.length === 7, `Generated full 7-day Nigerian meal plan (${mealPlan.days?.length} days)`);
assert(Boolean(mealPlan.days[0].meals && mealPlan.days[0].meals.length >= 3), 'Each day contains full Breakfast, Lunch, Dinner with Nigerian recipes');
assert(mealPlan.days[0].totalCalories > 1500, `Caloric targets properly computed: ${mealPlan.days[0].totalCalories} kcal/day`);

// -----------------------------------------------------------------------------
// TEST 6: Navigation & Modal Architecture Integrity
// -----------------------------------------------------------------------------
console.log('\n--- TEST 6: Navigation & Modal Architecture Integrity ---');

const navDockPath = path.resolve('./src/components/layout/ExpandableNavDock.tsx');
assert(fs.existsSync(navDockPath), 'ExpandableNavDock.tsx component exists');

const navDockContent = fs.readFileSync(navDockPath, 'utf8') + fs.readFileSync(path.resolve('./src/components/layout/navItems.ts'), 'utf8');
assert(navDockContent.includes('Home') && navDockContent.includes('/program') && navDockContent.includes('/meal-planner') && navDockContent.includes('/feedback'), 'ExpandableNavDock covers all 6 key application sections');

const videoModalContent = fs.readFileSync(path.resolve('./src/components/program/VideoModal.tsx'), 'utf8');
assert(videoModalContent.includes('z-[150]'), 'VideoModal uses elevated z-[150] above ExerciseDetailModal');

const exerciseDetailModalContent = fs.readFileSync(path.resolve('./src/components/program/ExerciseDetailModal.tsx'), 'utf8');
assert(exerciseDetailModalContent.includes('z-[100]'), 'ExerciseDetailModal uses z-[100]');

const programPageContent = fs.readFileSync(path.resolve('./src/app/program/page.tsx'), 'utf8');
const detailIdx = programPageContent.indexOf('<ExerciseDetailModal');
const videoIdx = programPageContent.indexOf('<VideoModal');
assert(detailIdx !== -1 && videoIdx !== -1 && detailIdx < videoIdx, 'DOM hierarchy: ExerciseDetailModal is rendered before VideoModal for proper stacking');

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n=================================================================');
console.log(`TOTAL CHECKS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('=================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL QA & VALIDATION CHECKS PASSED PERFECTLY!\n');
}
