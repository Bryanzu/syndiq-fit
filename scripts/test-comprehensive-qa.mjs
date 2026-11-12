import { exercises, getExerciseById } from '../src/data/exercises';
import { generateWorkoutProgram } from '../src/engine/programAssembler';
import { validateWorkoutProgram } from '../src/engine/workoutValidator';
import { LOWER_BODY_MUSCLES, isGluteLed, orderForBuild } from '../src/engine/gluteFocus';
import { BODYWEIGHT_ONLY_IDS, HOME_GYM_DUMBBELLS_IDS, ALL_SYNDIQ_EQUIPMENT_IDS } from '../src/data/equipment';
import { isContraindicated } from '../src/engine/injuryRules';
import { generateWeeklyMealPlan } from '../src/engine/mealPlanner/mealPlanGenerator';
import fs from 'fs';
import { NIGERIAN_RECIPES } from '../src/data/nigerianRecipes';
import { exercisePhoto, mealPhoto } from '../src/lib/photos';
import { PHOTO_CREDITS } from '../src/data/photoCredits';
import { exerciseVideos } from '../src/data/exerciseVideos';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';
import { isAnalyticsEvent, isAnonId, normalizePath } from '../src/lib/analytics/events';
import { addDays, lastDays } from '../src/lib/analytics/days';
import { computeSummary } from '../src/lib/analytics/metrics';
import { getAnalyticsStore, redisStore } from '../src/lib/analytics/store';
import http from 'http';

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

const navDockPath = path.resolve('./src/components/layout/TabBar.tsx');
assert(fs.existsSync(navDockPath), 'TabBar.tsx component exists');

const navDockContent = fs.readFileSync(navDockPath, 'utf8') + fs.readFileSync(path.resolve('./src/components/layout/navItems.ts'), 'utf8');
assert(navDockContent.includes('Home') && navDockContent.includes('/program') && navDockContent.includes('/meal-planner') && navDockContent.includes('/feedback'), 'Navigation covers all 6 key application sections');

const videoModalContent = fs.readFileSync(path.resolve('./src/components/program/VideoModal.tsx'), 'utf8');
assert(videoModalContent.includes('z-[150]'), 'VideoModal uses elevated z-[150] above ExerciseDetailModal');

const strayVideos = Object.keys(exerciseVideos).filter((id) => !getExerciseById(id));
const badVideoIds = Object.entries(exerciseVideos).filter(([, v]) => !/^[\w-]{11}$/.test(v.id)).map(([id]) => id);
const withVideo = exercises.filter((e) => e.youtubeId && e.youtubeId === exerciseVideos[e.id]?.id).length;
assert(
  strayVideos.length === 0 && badVideoIds.length === 0 && withVideo > 0,
  `Demo videos: ${withVideo} of ${exercises.length} exercises have one (unknown exercises: ${strayVideos.join(', ') || 'none'}, bad ids: ${badVideoIds.join(', ') || 'none'})`
);

const exerciseDetailModalContent = fs.readFileSync(path.resolve('./src/components/program/ExerciseDetailModal.tsx'), 'utf8');
assert(exerciseDetailModalContent.includes('z-[100]'), 'ExerciseDetailModal uses z-[100]');

const programPageContent = fs.readFileSync(path.resolve('./src/app/program/page.tsx'), 'utf8');
const detailIdx = programPageContent.indexOf('<ExerciseDetailModal');
const videoIdx = programPageContent.indexOf('<VideoModal');
assert(detailIdx !== -1 && videoIdx !== -1 && detailIdx < videoIdx, 'DOM hierarchy: ExerciseDetailModal is rendered before VideoModal for proper stacking');

// -----------------------------------------------------------------------------
// TEST 7: Photos
// -----------------------------------------------------------------------------
console.log('\n--- TEST 7: Photos ---');

const usedPhotos = new Set([...exercises.map((e) => exercisePhoto(e)), ...NIGERIAN_RECIPES.map((r) => mealPhoto(r.id))]);
const missingPhotos = [...usedPhotos].filter((p) => !fs.existsSync(path.resolve('./public' + p)));
assert(missingPhotos.length === 0, `Every exercise and recipe photo exists on disk (missing: ${missingPhotos.join(', ') || 'none'})`);

const credited = new Set(PHOTO_CREDITS.map((c) => c.file));
const uncredited = [...usedPhotos].filter((p) => !credited.has(p));
assert(uncredited.length === 0, `Every photo in use has a credit entry (uncredited: ${uncredited.join(', ') || 'none'})`);

// -----------------------------------------------------------------------------
// TEST 8: Female glute focus
// -----------------------------------------------------------------------------
console.log('\n--- TEST 8: Female Glute Focus ---');

const sexProfile = {
  age: '21-30',
  experience: 'intermediate',
  goal: 'muscle_building',
  frequency: 4,
  duration: 60,
  availableEquipment: ALL_SYNDIQ_EQUIPMENT_IDS,
  injuries: ['none'],
};
const malePlan = generateWorkoutProgram({ ...sexProfile, gender: 'male' });
const femalePlan = generateWorkoutProgram({ ...sexProfile, gender: 'female' });
const lowerDays = (p) => p.days.filter((d) => d.focusMuscles.some((m) => LOWER_BODY_MUSCLES.includes(m)));
const upperIds = (p) => JSON.stringify(p.days.filter((d) => !lowerDays(p).includes(d)).map((d) => d.exercises.map((x) => x.exercise.id)));
const gluteSets = (p) => p.days.flatMap((d) => d.exercises).filter((x) => x.exercise.primaryMuscles.includes('glutes')).reduce((s, x) => s + x.sets, 0);

assert(
  lowerDays(femalePlan).every((d) => d.exercises.some((x) => isGluteLed(x.exercise))) &&
    femalePlan.days.some((d) => d.exercises.some((x) => x.exercise.id === 'hip-thrust')) &&
    gluteSets(femalePlan) > gluteSets(malePlan) &&
    upperIds(femalePlan) === upperIds(malePlan),
  `Female plan: glute-led move on every lower day, hip thrust in the week, more glute sets (${gluteSets(femalePlan)} vs ${gluteSets(malePlan)}), upper days unchanged`
);

const femaleGlutes = orderForBuild(exercises.filter((e) => e.primaryMuscles.includes('glutes')), 'female');
assert(
  femaleGlutes[0].id === 'hip-thrust' && orderForBuild(exercises, 'male') === exercises,
  `Body map: female glute list starts with ${femaleGlutes[0].name}, male list keeps library order`
);

// -----------------------------------------------------------------------------
// TEST 9: Anonymous analytics
// -----------------------------------------------------------------------------
console.log('\n--- TEST 9: Anonymous Analytics ---');

assert(
  normalizePath('/program?p=eyJnZW5kZXIiOiJtYWxlIn0') === '/program' &&
    normalizePath('/Meal-Planner/') === '/meal-planner' &&
    normalizePath('/someone@example.com') === '/other' &&
    normalizePath(42) === '/other',
  'Page paths drop the query string and map unknown pages to /other'
);

assert(
  isAnonId(randomUUID()) && !isAnonId('user@example.com') && !isAnonId('') && isAnalyticsEvent('workout_finished') && !isAnalyticsEvent('purchase'),
  'Only random browser IDs and the six known events are accepted'
);

// Four browsers over 10 days. a: day 1 and day 9. b: day 1 only. c: share link, workout on day 9. d: new today.
const T = '2026-11-12';
const day = (n) => addDays(T, n - 10);
const snap = {
  firstSeen: { a: day(1), b: day(1), c: day(9), d: T, old: '2026-09-01' },
  lastSeen: { a: day(9), b: day(1), c: day(9), d: T, old: day(8) },
  everDid: { program_built: ['a', 'b'], share_opened: ['c'], workout_finished: ['a', 'c', 'old'] },
  days: lastDays(T, 30).map((d) => ({
    day: d,
    users: d === day(1) ? ['a', 'b'] : d === day(8) ? ['old'] : d === day(9) ? ['a', 'c'] : d === T ? ['d'] : [],
    events: d === day(9) ? { visit: 3, workout_finished: 2 } : d === T ? { visit: 1 } : {},
    pages: d === day(9) ? { '/program': 2, '/': 1 } : d === T ? { '/': 1 } : {},
  })),
};
const sum = computeSummary(snap, T);
assert(
  sum.users.today === 1 && sum.users.week === 4 && sum.users.month === 5 && sum.users.allTime === 5 &&
    sum.newVsReturning.newTotal === 4 && sum.newVsReturning.returningTotal === 1 &&
    sum.newVsReturning.days.find((d) => d.day === day(9)).returning === 1,
  `Unique, new and returning people are counted per browser (${JSON.stringify(sum.users)}, new ${sum.newVsReturning.newTotal}, returning ${sum.newVsReturning.returningTotal})`
);
assert(
  sum.cameBack.eligible === 3 && sum.cameBack.returned === 2 &&
    sum.funnel.visited === 5 && sum.funnel.builtProgram === 3 && sum.funnel.finishedWorkout === 2 &&
    sum.events.totals.visit === 4 && sum.topPages[0].path === '/' && sum.topPages[0].views === 2,
  `Came back after a week, funnel, event totals and top pages add up (${JSON.stringify({ cameBack: sum.cameBack, funnel: sum.funnel })})`
);

const tmpFile = path.join(os.tmpdir(), `syndiq-analytics-${process.pid}.json`);
process.env.ANALYTICS_FILE = tmpFile;
const store = getAnalyticsStore();
const browserId = randomUUID();
await store.record({ id: browserId, event: 'visit', path: '/', day: T });
await store.record({ id: browserId, event: 'program_built', day: T });
const stored = await store.snapshot([T]);
fs.rmSync(tmpFile, { force: true });
assert(
  store.kind === 'file' && stored.firstSeen[browserId] === T && stored.days[0].events.visit === 1 &&
    stored.days[0].pages['/'] === 1 && stored.everDid.program_built?.includes(browserId),
  'Local store records visits and events and reads them back'
);

// A stand-in for Upstash's REST pipeline, with just the commands the store uses
const kv = new Map();
const fakeRedis = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    if (req.url !== '/pipeline' || req.headers.authorization !== 'Bearer test-token') {
      res.writeHead(401).end('[]');
      return;
    }
    const hash = (k) => (kv.has(k) ? kv.get(k) : kv.set(k, new Map()).get(k));
    const set = (k) => (kv.has(k) ? kv.get(k) : kv.set(k, new Set()).get(k));
    const out = JSON.parse(body).map(([cmd, k, a, b]) => {
      if (cmd === 'HSETNX') return { result: hash(k).has(a) ? 0 : (hash(k).set(a, String(b)), 1) };
      if (cmd === 'HSET') return { result: (hash(k).set(a, String(b)), 1) };
      if (cmd === 'HINCRBY') return { result: (hash(k).set(a, String(Number(hash(k).get(a) || 0) + b)), Number(hash(k).get(a))) };
      if (cmd === 'SADD') return { result: (set(k).add(a), 1) };
      if (cmd === 'HGETALL') return { result: kv.has(k) ? [...kv.get(k)].flat() : [] };
      if (cmd === 'SMEMBERS') return { result: kv.has(k) ? [...kv.get(k)] : [] };
      return { error: `ERR unknown command ${cmd}` };
    });
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(out));
  });
});
await new Promise((r) => fakeRedis.listen(0, '127.0.0.1', r));
const redis = redisStore({ url: `http://127.0.0.1:${fakeRedis.address().port}`, token: 'test-token' });
const other = randomUUID();
await redis.record({ id: browserId, event: 'visit', path: '/program', day: day(9) });
await redis.record({ id: browserId, event: 'visit', path: '/program', day: T });
await redis.record({ id: other, event: 'share_opened', day: T });
await redis.record({ id: other, event: 'workout_finished', day: T });
const fromRedis = computeSummary(await redis.snapshot(lastDays(T, 30)), T);
fakeRedis.close();
assert(
  redis.kind === 'redis' && fromRedis.users.today === 2 && fromRedis.users.allTime === 2 &&
    fromRedis.newVsReturning.days.at(-1).returning === 1 && fromRedis.funnel.finishedWorkout === 1 &&
    fromRedis.topPages[0].path === '/program' && fromRedis.topPages[0].views === 2,
  `Redis store round-trips through the Upstash REST pipeline (${JSON.stringify(fromRedis.users)})`
);

const feedbackRoute = fs.readFileSync(path.resolve('./src/app/api/feedback/route.ts'), 'utf8');
const adminAuth = fs.readFileSync(path.resolve('./src/lib/adminAuth.ts'), 'utf8');
assert(
  !feedbackRoute.includes('syndiq-admin-2026') && !/searchParams\.get\(['"]key['"]\)/.test(feedbackRoute + adminAuth) &&
    feedbackRoute.includes('checkAdmin') && fs.readFileSync(path.resolve('./src/app/api/analytics/route.ts'), 'utf8').includes('checkAdmin'),
  'Admin APIs use the server-side key check: no fallback key, no key in the URL'
);

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
