import type { Exercise, MuscleGroup, InjuryArea, EquipmentType, MovementPattern } from '@/types/workout';
import { exerciseVideos } from './exerciseVideos';

const yt = (name: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' proper form')}`;

const E = (
  id: string,
  name: string,
  equipment: EquipmentType,
  primaryMuscles: MuscleGroup[],
  secondaryMuscles: MuscleGroup[],
  contraindications: InjuryArea[],
  defaultSets: number,
  defaultReps: string,
  defaultRestSeconds: number,
  instructions: string[],
  whyIncluded: string,
  alternatives: string[],
  options?: {
    intensityNote?: string;
    movementPattern?: MovementPattern;
    tier?: 1 | 2 | 3;
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    exerciseType?: 'compound' | 'isolation' | 'bodyweight' | 'cardio' | 'mobility';
    isStrictBodyweight?: boolean;
    suitableGoals?: string[];
  }
): Exercise => ({
  id,
  name,
  primaryMuscles,
  secondaryMuscles,
  equipment,
  contraindications,
  instructions,
  whyIncluded,
  youtubeId: exerciseVideos[id]?.id ?? '',
  youtubeUrl: exerciseVideos[id] ? `https://www.youtube.com/watch?v=${exerciseVideos[id].id}` : yt(name),
  alternatives,
  defaultSets,
  defaultReps,
  defaultRestSeconds,
  intensityNote: options?.intensityNote,
  movementPattern: options?.movementPattern,
  tier: options?.tier,
  category: options?.category,
  difficulty: options?.difficulty || 'intermediate',
  exerciseType: options?.exerciseType || (equipment === 'bodyweight' ? 'bodyweight' : 'compound'),
  isStrictBodyweight: Boolean(options?.isStrictBodyweight),
  suitableGoals: options?.suitableGoals || ['muscle_building', 'build_strength', 'general_fitness'],
});

export const exercises: Exercise[] = [
  // ═════════════════════════════════════════════════════════════════════
  // 1. CHEST & HORIZONTAL PUSH
  // ═════════════════════════════════════════════════════════════════════
  // Pure Bodyweight Chest
  E('push-up', 'Standard Push-Up', 'bodyweight', ['chest'], ['front_delts', 'triceps', 'abs'], ['wrist', 'shoulder'], 3, '10-20', 60,
    ['Hands slightly wider than shoulder width on the floor', 'Lower your chest to an inch above the ground while bracing your abs and glutes', 'Push the floor away to full arm extension without sagging hips'],
    'The foundational bodyweight horizontal push that develops chest size, pressing strength, and core stability simultaneously.',
    ['incline-push-up', 'diamond-push-up', 'wide-push-up'],
    { tier: 2, movementPattern: 'horizontal_push', category: 'chest', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('incline-push-up', 'Incline Push-Up (Hands Elevated)', 'bodyweight', ['chest'], ['front_delts', 'triceps'], ['wrist'], 3, '12-20', 60,
    ['Place hands on a sturdy elevated surface or stairs', 'Lower your chest to the edge under control', 'Press back up to straight arms'],
    'Reduces gravity resistance to allow complete beginners to accumulate high-volume pressing with strict biomechanics.',
    ['push-up', 'wide-push-up'],
    { tier: 2, movementPattern: 'horizontal_push', category: 'chest', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('decline-push-up', 'Decline Push-Up (Feet Elevated)', 'bodyweight', ['chest', 'front_delts'], ['triceps', 'abs'], ['wrist', 'shoulder'], 3, '8-15', 75,
    ['Place feet on an elevated step or low chair with hands on the floor', 'Lower your chest smoothly until nose touches close to floor', 'Press back up with an active core brace'],
    'Elevating the feet shifts tension onto the clavicular head (upper chest) and anterior deltoids without weights.',
    ['push-up', 'diamond-push-up', 'pike-push-up'],
    { tier: 2, movementPattern: 'horizontal_push', category: 'chest', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('diamond-push-up', 'Diamond Push-Up', 'bodyweight', ['triceps', 'chest'], ['front_delts'], ['wrist', 'elbow', 'shoulder'], 3, '8-15', 60,
    ['Form a diamond/triangle shape with index fingers and thumbs on the floor', 'Lower chest to touch your hands, elbows tracking back', 'Drive through the palms to lock out'],
    'Directly challenges triceps extension and inner chest muscle recruitment using zero equipment.',
    ['push-up', 'floor-tricep-press'],
    { tier: 3, movementPattern: 'isolation_triceps', category: 'triceps', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('wide-push-up', 'Wide-Grip Push-Up', 'bodyweight', ['chest'], ['front_delts', 'triceps'], ['shoulder', 'wrist'], 3, '10-18', 60,
    ['Place hands 4-6 inches wider than standard push-up width', 'Lower your torso smoothly with elbows at roughly 45 degrees', 'Squeeze your chest together as you press back up'],
    'Increases transverse adduction stress on the pectoralis major with reduced triceps involvement.',
    ['push-up', 'incline-push-up'],
    { tier: 2, movementPattern: 'horizontal_push', category: 'chest', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),

  // Free Weight & Loaded Chest
  E('barbell-bench-press', 'Barbell Flat Bench Press', 'barbell', ['chest'], ['front_delts', 'triceps'], ['shoulder', 'wrist', 'elbow'], 4, '6-10', 120,
    ['Lie flat on bench with eyes directly under bar, feet driven into floor', 'Unrack bar, lower with control to lower chest line', 'Press explosively to lockout over upper chest'],
    'The premier compound barbell lift for maximal upper-body pressing strength and pectoralis hypertrophy.',
    ['dumbbell-bench-press', 'machine-chest-press', 'push-up'],
    { tier: 1, movementPattern: 'horizontal_push', category: 'chest', difficulty: 'intermediate', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('incline-barbell-press', 'Incline Barbell Bench Press', 'barbell', ['chest', 'front_delts'], ['triceps'], ['shoulder', 'wrist', 'elbow'], 3, '6-10', 120,
    ['Set bench to 30-degree incline', 'Lower bar with high control to clavicle level', 'Press straight up until arms extend'],
    'Directly emphasizes the clavicular head of the pectoralis major for upper chest thickness.',
    ['incline-dumbbell-press', 'machine-chest-press', 'decline-push-up'],
    { tier: 1, movementPattern: 'horizontal_push', category: 'chest', difficulty: 'intermediate', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('dumbbell-bench-press', 'Flat Dumbbell Bench Press', 'dumbbell', ['chest'], ['front_delts', 'triceps'], ['shoulder'], 3, '8-12', 90,
    ['Lie on bench with dumbbells at sides of chest', 'Press up and slightly inward in an arc', 'Lower slowly to feel a deep chest stretch at the bottom'],
    'Provides unrestricted convergent pressing biomechanics that accommodate individual shoulder ergonomics.',
    ['barbell-bench-press', 'machine-chest-press', 'push-up'],
    { tier: 2, movementPattern: 'horizontal_push', category: 'chest', difficulty: 'intermediate', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('incline-dumbbell-press', 'Incline Dumbbell Bench Press', 'dumbbell', ['chest', 'front_delts'], ['triceps'], ['shoulder'], 3, '8-12', 90,
    ['Set bench to 30 degrees, dumbbells over upper chest', 'Lower slowly with elbows slightly tucked', 'Press dumbbells up in a gentle arc over face'],
    'The gold-standard dumbbell exercise for upper chest shelf development with gentle shoulder alignment.',
    ['incline-barbell-press', 'machine-chest-press', 'decline-push-up'],
    { tier: 2, movementPattern: 'horizontal_push', category: 'chest', difficulty: 'intermediate', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('dumbbell-floor-press', 'Dumbbell Floor Press', 'dumbbell', ['chest', 'triceps'], ['front_delts'], ['wrist'], 3, '8-12', 75,
    ['Lie on floor with knees bent, holding dumbbells at chest level', 'Lower until triceps rest gently on the floor', 'Press up to full lockout'],
    'Restricts hyperextension of the shoulder joint, making it the safest horizontal press for lifters with shoulder impingement.',
    ['dumbbell-bench-press', 'push-up'],
    { tier: 2, movementPattern: 'horizontal_push', category: 'chest', difficulty: 'beginner', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('dumbbell-fly', 'Flat Dumbbell Chest Fly', 'dumbbell', ['chest'], ['front_delts'], ['shoulder'], 3, '10-15', 60,
    ['Lie flat with palms facing each other, slight bend in elbows', 'Open arms wide in a controlled arc until a deep stretch is felt', 'Squeeze chest muscles to return dumbbells together'],
    'Provides an intense eccentric stretch across the pectoralis fibers.',
    ['pec-deck-fly', 'cable-crossover'],
    { tier: 3, movementPattern: 'isolation_chest', category: 'chest', difficulty: 'intermediate', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('machine-chest-press', 'Selectorized Machine Chest Press', 'machine', ['chest'], ['front_delts', 'triceps'], [], 3, '10-15', 75,
    ['Adjust seat height so handles align with mid-chest', 'Press handles forward smoothly without locking elbows', 'Control the descent back to starting stretch'],
    'Offers maximum stability and isolated mechanical tension without demanding barbell balancing.',
    ['push-up', 'incline-push-up', 'pec-deck-fly'],
    { tier: 2, movementPattern: 'horizontal_push', category: 'chest', difficulty: 'beginner', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('pec-deck-fly', 'Pec Deck Machine Fly', 'machine', ['chest'], ['front_delts'], ['shoulder'], 3, '12-15', 60,
    ['Sit tall against backrest, forearms on pads or hands on levers', 'Sweep arms together in an arc in front of sternum', 'Slowly reverse until a chest stretch is reached'],
    'Delivers constant mechanical resistance profile across the entire horizontal adduction range of motion.',
    ['cable-crossover', 'dumbbell-fly'],
    { tier: 3, movementPattern: 'isolation_chest', category: 'chest', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('cable-crossover', 'High-to-Low Cable Crossover', 'cable', ['chest'], ['front_delts'], ['shoulder'], 3, '12-15', 60,
    ['Set pulleys high, step forward with staggered stance and slight torso lean', 'Sweep handles down and across your midsection', 'Hold peak contraction for a second, then return slowly'],
    'Maintains continuous cable tension and deep contraction on the lower and sternal pectoralis fibers.',
    ['pec-deck-fly', 'dumbbell-fly', 'low-to-high-cable-fly'],
    { tier: 3, movementPattern: 'isolation_chest', category: 'chest', difficulty: 'intermediate', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('low-to-high-cable-fly', 'Low-to-High Cable Fly', 'cable', ['chest', 'front_delts'], [], ['shoulder'], 3, '12-15', 60,
    ['Set pulleys at lowest position, step forward', 'Raise hands up and inward toward chin height in an upward arc', 'Lower slowly under control'],
    'Matches the upward fiber orientation of the clavicular pectoral head with smooth pulley resistance.',
    ['incline-dumbbell-press', 'pec-deck-fly'],
    { tier: 3, movementPattern: 'isolation_chest', category: 'chest', difficulty: 'intermediate', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('chest-dip', 'Parallel Bar Chest Dip', 'bodyweight', ['chest', 'triceps'], ['front_delts'], ['shoulder', 'elbow', 'wrist'], 3, '6-12', 90,
    ['Grip parallel bars, lean torso forward 30 degrees', 'Lower body until elbows reach 90 degrees', 'Press back up focusing on chest contraction'],
    'High-intensity calisthenic compound builder for the lower pectoralis and triceps.',
    ['push-up', 'close-grip-bench-press'],
    { tier: 2, movementPattern: 'horizontal_push', category: 'chest', difficulty: 'advanced', exerciseType: 'bodyweight', isStrictBodyweight: false }
  ),
  E('band-push-up', 'Banded Push-Up', 'bodyweight', ['chest', 'triceps'], ['front_delts'], ['wrist', 'shoulder'], 3, '8-15', 60,
    ['Loop resistance band across upper back and hold ends under palms on floor', 'Perform strict push-up against accommodating band tension', 'Lock out against peak resistance at the top'],
    'Accommodates strength curve by adding peak resistance at lockout where lifters are mechanically strongest.',
    ['push-up', 'diamond-push-up'],
    { tier: 2, movementPattern: 'horizontal_push', category: 'chest', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: false }
  ),
  E('band-chest-press', 'Standing Band Chest Press', 'bodyweight', ['chest'], ['front_delts', 'triceps'], [], 3, '12-20', 45,
    ['Anchor resistance band behind back or pole, hold handles at chest', 'Press arms forward into full extension', 'Control the return stretch'],
    'Gentle on the joints for home routines with zero weights required.',
    ['push-up', 'incline-push-up'],
    { tier: 3, movementPattern: 'horizontal_push', category: 'chest', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),

  // ═════════════════════════════════════════════════════════════════════
  // 2. BACK, LATS & POSTERIOR CHAIN
  // ═════════════════════════════════════════════════════════════════════
  // Pure Bodyweight Back (Zero equipment needed)
  E('prone-cobra', 'Prone Cobra (Floor Back & Scapular Extension)', 'bodyweight', ['upper_back', 'lower_back'], ['rear_delts', 'glutes'], [], 3, '12-20', 45,
    ['Lie face down on the floor with arms at your sides, thumbs pointing to ceiling', 'Lift chest, head, and hands off the floor by pinching shoulder blades together', 'Hold peak contraction for 2-3 seconds, then lower smoothly'],
    'Strengthens the rhomboids, lower trapezius, and erectors to reverse slouching posture without needing any pull-up bar.',
    ['superman', 'prone-ytw-raise', 'bird-dog'],
    { tier: 2, movementPattern: 'horizontal_pull', category: 'back', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('superman', 'Superman Hold & Pulse', 'bodyweight', ['lower_back', 'glutes'], ['hamstrings', 'upper_back'], ['lower_back'], 3, '10-15', 45,
    ['Lie flat on your stomach with arms and legs outstretched', 'Simultaneously raise arms, chest, and thighs off the floor', 'Hold for 2 seconds at the top before controlled descent'],
    'A staple equipment-free movement that activates the entire posterior spinal chain and glute musculature.',
    ['prone-cobra', 'bird-dog', 'glute-bridge'],
    { tier: 2, movementPattern: 'hip_hinge', category: 'back', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('prone-ytw-raise', 'Floor Prone Y-T-W Scapular Raises', 'bodyweight', ['rear_delts', 'upper_back'], ['traps'], [], 3, '10-15', 45,
    ['Lie face down on floor', 'Form a "Y" with arms and lift thumbs up for 5 reps, then form a "T" for 5 reps, then bend elbows to form a "W" for 5 reps', 'Squeeze mid-back and rear delts deliberately on each letter'],
    'Complete three-angle shoulder and upper-back mobility and hypertrophy protocol performed entirely on the living room floor.',
    ['prone-cobra', 'superman'],
    { tier: 3, movementPattern: 'horizontal_pull', category: 'back', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('floor-lat-pull', 'Prone Floor Lat Pull-Down', 'bodyweight', ['lats', 'upper_back'], ['biceps', 'rear_delts'], [], 3, '10-15', 45,
    ['Lie face down with chest slightly propped, arms extended forward', 'Drive elbows back and down toward hips as if pulling a heavy bar to sternum', 'Squeeze lats hard at bottom before reaching forward'],
    'Generates intense voluntary latissimus dorsi contraction when no vertical pull apparatus is available.',
    ['prone-cobra', 'prone-ytw-raise'],
    { tier: 2, movementPattern: 'vertical_pull', category: 'back', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),

  // Equipment Calisthenics & Weighted Back
  E('pull-up', 'Strict Bodyweight Pull-Up', 'bodyweight', ['lats'], ['biceps', 'upper_back', 'forearms'], ['shoulder', 'elbow'], 3, '5-10', 120,
    ['Hang from bar with overhand grip slightly wider than shoulders', 'Pull elbows down toward ribs until chin clears bar', 'Lower smoothly to full active hang'],
    'The king of vertical pulling for lat width, upper-back muscularity, and grip strength.',
    ['chin-up', 'lat-pulldown', 'assisted-pull-up'],
    { tier: 1, movementPattern: 'vertical_pull', category: 'back', difficulty: 'advanced', exerciseType: 'bodyweight', isStrictBodyweight: false }
  ),
  E('chin-up', 'Strict Underhand Chin-Up', 'bodyweight', ['lats', 'biceps'], ['upper_back', 'forearms'], ['elbow', 'shoulder'], 3, '5-10', 120,
    ['Hang from bar with supinated (palms facing you) shoulder-width grip', 'Pull chest toward bar until chin clears bar cleanly', 'Lower under strict control'],
    'Higher bicep recruitment than standard pull-ups while retaining heavy lat overload.',
    ['pull-up', 'lat-pulldown', 'close-grip-pulldown'],
    { tier: 1, movementPattern: 'vertical_pull', category: 'back', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: false }
  ),
  E('inverted-row', 'Inverted Bodyweight Row (Bar / Suspension)', 'bodyweight', ['upper_back', 'lats'], ['biceps', 'rear_delts', 'abs'], [], 3, '8-15', 75,
    ['Lie under fixed bar or rings at waist height, heels on floor', 'Pull chest to touch bar while maintaining straight plank posture', 'Lower with control to arm extension'],
    'Superb horizontal rowing calisthenic that adjusts difficulty instantly via body angle.',
    ['dumbbell-row', 'seated-cable-row', 'prone-cobra'],
    { tier: 2, movementPattern: 'horizontal_pull', category: 'back', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: false }
  ),
  E('assisted-pull-up', 'Machine-Assisted Pull-Up', 'machine', ['lats'], ['biceps', 'upper_back'], ['shoulder'], 3, '8-12', 90,
    ['Kneel or stand on counterweight pad, grip pull-up handles', 'Pull elbows down until chin passes hands', 'Lower smoothly to complete arm extension'],
    'Enables lifters of any strength level to build toward complete bodyweight pull-ups with calibrated counter-resistance.',
    ['lat-pulldown', 'close-grip-pulldown'],
    { tier: 2, movementPattern: 'vertical_pull', category: 'back', difficulty: 'beginner', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('lat-pulldown', 'Wide-Grip Lat Pulldown', 'cable', ['lats'], ['biceps', 'upper_back'], ['shoulder'], 3, '8-12', 90,
    ['Sit with thighs locked under pads, grip bar wider than shoulders', 'Pull bar smoothly to clavicle, driving elbows down and back', 'Return slowly to full stretch at top'],
    'The premier scalable vertical pulling movement for developing latissimus dorsi width.',
    ['close-grip-pulldown', 'assisted-pull-up', 'straight-arm-pulldown'],
    { tier: 2, movementPattern: 'vertical_pull', category: 'back', difficulty: 'beginner', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('close-grip-pulldown', 'Neutral Close-Grip Lat Pulldown', 'cable', ['lats'], ['biceps', 'upper_back'], [], 3, '10-12', 75,
    ['Use a V-bar or neutral dual handle', 'Pull down toward upper sternum while keeping torso upright', 'Control the eccentric stretch up'],
    'Neutral hand positioning protects the rotator cuff and permits a longer lat range of motion.',
    ['lat-pulldown', 'assisted-pull-up'],
    { tier: 2, movementPattern: 'vertical_pull', category: 'back', difficulty: 'beginner', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('straight-arm-pulldown', 'Standing Straight-Arm Lat Pulldown', 'cable', ['lats'], ['abs'], [], 3, '12-15', 60,
    ['Stand facing high cable, arms nearly straight, slight forward torso hinge', 'Sweep bar down in an arc to touch upper thighs using lats only', 'Return slowly without bending elbows'],
    'Completely isolates the lats by removing biceps flexion from the pulling equation.',
    ['lat-pulldown', 'seated-cable-row'],
    { tier: 3, movementPattern: 'vertical_pull', category: 'back', difficulty: 'intermediate', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('barbell-row', 'Bent-Over Barbell Row', 'barbell', ['lats', 'upper_back'], ['biceps', 'rear_delts', 'lower_back'], ['lower_back'], 4, '6-10', 120,
    ['Hinge at hips with flat back at 45 degrees, grip bar outside knees', 'Pull bar into lower ribcage, pinching shoulder blades', 'Lower bar under strict control without torso bobbing'],
    'Heavy multi-joint mass builder for mid-back thickness, lats, and static spinal endurance.',
    ['dumbbell-row', 'seated-cable-row', 'chest-supported-row'],
    { tier: 1, movementPattern: 'horizontal_pull', category: 'back', difficulty: 'advanced', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('dumbbell-row', 'Single-Arm Dumbbell Row', 'dumbbell', ['lats', 'upper_back'], ['biceps', 'rear_delts'], [], 3, '8-12', 75,
    ['Brace one hand and knee on bench, flat back parallel to floor', 'Pull dumbbell up toward hip pocket, leading with elbow', 'Lower slowly to full lat stretch'],
    'Eliminates bilateral asymmetries and spares lower-back fatigue by supporting the torso on a bench.',
    ['seated-cable-row', 'chest-supported-row', 'machine-row'],
    { tier: 2, movementPattern: 'horizontal_pull', category: 'back', difficulty: 'beginner', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('seated-cable-row', 'Seated Cable Row', 'cable', ['upper_back', 'lats'], ['biceps', 'rear_delts'], [], 3, '10-12', 75,
    ['Sit with feet on footplates, knees slightly bent, torso upright', 'Pull handle into navel, driving elbows back and squeezing rhomboids', 'Extend arms smoothly without rounding lower back'],
    'Consistent mechanical tension across the rhomboids and mid-trapezius with minimal spinal compression.',
    ['machine-row', 'chest-supported-row', 'dumbbell-row'],
    { tier: 2, movementPattern: 'horizontal_pull', category: 'back', difficulty: 'beginner', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('chest-supported-row', 'Incline Chest-Supported Dumbbell Row', 'dumbbell', ['upper_back', 'lats'], ['biceps', 'rear_delts'], [], 3, '8-12', 75,
    ['Lie face down on 30-45 degree incline bench with dumbbells hanging', 'Row dumbbells up toward ribs, driving elbows high', 'Lower with control to complete stretch'],
    'Zero spinal loading allows complete focus on mid-back hypertrophy and scapular retraction.',
    ['seated-cable-row', 'machine-row', 'dumbbell-row'],
    { tier: 2, movementPattern: 'horizontal_pull', category: 'back', difficulty: 'beginner', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('t-bar-row', 'T-Bar Row (Chest Supported or Landmine)', 'barbell', ['upper_back', 'lats'], ['biceps', 'lower_back', 'rear_delts'], ['lower_back'], 3, '8-10', 90,
    ['Straddle the bar with a flat back or lie on chest-supported pad', 'Pull handle firmly to lower chest', 'Lower under controlled tempo'],
    'Heavy compound loading for middle trapezius and lat density.',
    ['chest-supported-row', 'seated-cable-row', 'dumbbell-row'],
    { tier: 2, movementPattern: 'horizontal_pull', category: 'back', difficulty: 'intermediate', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('machine-row', 'Selectorized Machine Row', 'machine', ['upper_back', 'lats'], ['biceps', 'rear_delts'], [], 3, '10-12', 75,
    ['Adjust seat so chest pad supports sternum', 'Pull handles toward ribs, squeezing shoulder blades together', 'Return slowly without slamming plates'],
    'High-stability, beginner-friendly back row with fixed resistance path.',
    ['seated-cable-row', 'chest-supported-row'],
    { tier: 2, movementPattern: 'horizontal_pull', category: 'back', difficulty: 'beginner', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('conventional-deadlift', 'Conventional Barbell Deadlift', 'barbell', ['hamstrings', 'glutes', 'lower_back'], ['quads', 'upper_back', 'traps', 'forearms'], ['lower_back', 'knee', 'hip'], 3, '3-6', 180,
    ['Stand with bar over mid-foot, hip hinge to grip bar outside legs', 'Brace core, flatten back, drive feet through the floor', 'Stand tall by locking hips and knees together, then hinge to lower'],
    'The king of full-body posterior chain strength lifts.',
    ['trap-bar-deadlift', 'romanian-deadlift'],
    { tier: 1, movementPattern: 'hip_hinge', category: 'back', difficulty: 'advanced', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('trap-bar-deadlift', 'Trap Bar (Hex Bar) Deadlift', 'barbell', ['quads', 'glutes', 'hamstrings'], ['lower_back', 'traps', 'forearms'], ['lower_back', 'knee'], 3, '5-8', 150,
    ['Step inside hex bar, grip neutral handles', 'Drop hips, brace core, drive floor away to stand tall', 'Lower with control along center of mass'],
    'Distributes mechanical load more evenly between quads and hips, sparing the lumbar spine compared to straight-bar pulls.',
    ['conventional-deadlift', 'romanian-deadlift'],
    { tier: 1, movementPattern: 'hip_hinge', category: 'back', difficulty: 'intermediate', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('face-pull', 'Cable Face Pull with Rope', 'cable', ['rear_delts', 'upper_back'], ['traps'], [], 3, '12-20', 45,
    ['Set rope at eye level, grip ends with thumbs back', 'Pull rope towards bridge of nose, separating hands and rotating forearms up', 'Pause and squeeze rear delts, then control the return'],
    'Essential postural corrective that counters internal rotation and strengthens rotator cuff stabilizers.',
    ['reverse-pec-deck', 'rear-delt-fly', 'prone-ytw-raise'],
    { tier: 3, movementPattern: 'horizontal_pull', category: 'back', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('band-pull-apart', 'Resistance Band Pull-Apart', 'bodyweight', ['rear_delts', 'upper_back'], ['traps'], [], 3, '15-25', 45,
    ['Hold resistance band in front of chest with arms straight', 'Pull band apart horizontally until it touches sternum, pinching shoulder blades', 'Control the return with continuous tension'],
    'Lightweight, highly effective rotator cuff and rear delt activation tool for any home or gym workout.',
    ['face-pull', 'prone-ytw-raise'],
    { tier: 3, movementPattern: 'horizontal_pull', category: 'back', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),

  // ═════════════════════════════════════════════════════════════════════
  // 3. SHOULDERS & DELTOIDS
  // ═════════════════════════════════════════════════════════════════════
  // Pure Bodyweight Shoulders
  E('pike-push-up', 'Pike Push-Up (Floor Inverted-V)', 'bodyweight', ['front_delts', 'side_delts'], ['triceps', 'traps', 'upper_back'], ['wrist', 'shoulder'], 3, '6-12', 60,
    ['Start in push-up, walk feet forward and push hips into air creating an inverted V', 'Lower head diagonally forward between hands', 'Press back up to top pike position'],
    'Shifts pressing angle toward the vertical plane to target deltoid musculature without weights.',
    ['push-up', 'decline-push-up'],
    { tier: 2, movementPattern: 'vertical_push', category: 'shoulders', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('elevated-pike-push-up', 'Elevated Feet Pike Push-Up', 'bodyweight', ['front_delts', 'side_delts'], ['triceps', 'traps'], ['wrist', 'shoulder'], 3, '6-10', 75,
    ['Place toes on elevated bench or step, hands on floor in inverted V', 'Lower top of head toward the ground in front of hands', 'Press up through shoulders to lockout'],
    'Advanced bodyweight overhead press simulation that approaches a handstand push-up progression.',
    ['pike-push-up'],
    { tier: 2, movementPattern: 'vertical_push', category: 'shoulders', difficulty: 'advanced', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),

  // Loaded Shoulders
  E('barbell-overhead-press', 'Standing Barbell Overhead Press (OHP)', 'barbell', ['front_delts', 'side_delts'], ['triceps', 'traps', 'abs'], ['shoulder', 'lower_back', 'wrist'], 3, '5-8', 120,
    ['Hold bar at collarbone with hands just outside shoulders', 'Brace glutes and abs, press bar straight up, tucking head slightly back then through at top', 'Lower under control to collarbone'],
    'The foundational vertical pressing compound exercise for total shoulder power and overhead stability.',
    ['dumbbell-shoulder-press', 'machine-shoulder-press', 'pike-push-up'],
    { tier: 1, movementPattern: 'vertical_push', category: 'shoulders', difficulty: 'advanced', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('dumbbell-shoulder-press', 'Seated Dumbbell Overhead Press', 'dumbbell', ['front_delts', 'side_delts'], ['triceps'], ['shoulder'], 3, '8-12', 90,
    ['Sit with back supported, hold dumbbells at shoulder level', 'Press dumbbells overhead in an arc until arms are nearly straight', 'Lower under control to ear level'],
    'Allows independent arm movement to accommodate natural scapular plane pressing.',
    ['machine-shoulder-press', 'barbell-overhead-press', 'pike-push-up'],
    { tier: 2, movementPattern: 'vertical_push', category: 'shoulders', difficulty: 'intermediate', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('machine-shoulder-press', 'Selectorized Machine Shoulder Press', 'machine', ['front_delts', 'side_delts'], ['triceps'], ['shoulder'], 3, '10-12', 75,
    ['Adjust seat height so handles sit at chin level', 'Press overhead smoothly without locking elbows', 'Lower with control to stretch position'],
    'Stable, beginner-friendly overhead pressing option that isolates the deltoids safely.',
    ['dumbbell-shoulder-press', 'pike-push-up'],
    { tier: 2, movementPattern: 'vertical_push', category: 'shoulders', difficulty: 'beginner', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('arnold-press', 'Arnold Dumbbell Press', 'dumbbell', ['front_delts', 'side_delts'], ['triceps'], ['shoulder'], 3, '8-12', 90,
    ['Start with dumbbells at chin height, palms facing chest', 'As you press overhead, rotate palms outward 180 degrees', 'Reverse the rotation on the descent'],
    'Lengthens the active range of motion and hits all three deltoid heads sequentially.',
    ['dumbbell-shoulder-press', 'machine-shoulder-press'],
    { tier: 2, movementPattern: 'vertical_push', category: 'shoulders', difficulty: 'intermediate', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('dumbbell-lateral-raise', 'Dumbbell Lateral Raise', 'dumbbell', ['side_delts'], ['traps'], ['shoulder'], 3, '12-20', 45,
    ['Stand with slight elbow bend and subtle torso lean', 'Raise dumbbells out to sides until elbows reach shoulder height', 'Lower slowly without swinging or using body momentum'],
    'The classic isolation movement for building round, three-dimensional side deltoids and shoulder width.',
    ['cable-lateral-raise', 'machine-lateral-raise', 'band-lateral-raise'],
    { tier: 3, movementPattern: 'isolation_delts', category: 'shoulders', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('cable-lateral-raise', 'Single-Arm Cable Lateral Raise', 'cable', ['side_delts'], [], ['shoulder'], 3, '12-20', 45,
    ['Stand side-on to low pulley, hold handle across body', 'Raise arm out to shoulder height with a steady tempo', 'Control the descent against constant pulley resistance'],
    'Overcomes the dumbbell gravity curve by providing consistent tension from start to finish.',
    ['dumbbell-lateral-raise', 'machine-lateral-raise'],
    { tier: 3, movementPattern: 'isolation_delts', category: 'shoulders', difficulty: 'intermediate', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('machine-lateral-raise', 'Machine Lateral Raise', 'machine', ['side_delts'], [], [], 3, '12-15', 45,
    ['Sit with arms against padded levers', 'Raise elbows laterally to parallel with the floor', 'Lower slowly with zero body sway'],
    'Strict mechanical isolation of the lateral deltoid head with zero cheating permitted.',
    ['dumbbell-lateral-raise', 'cable-lateral-raise'],
    { tier: 3, movementPattern: 'isolation_delts', category: 'shoulders', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('rear-delt-fly', 'Bent-Over Dumbbell Rear Delt Fly', 'dumbbell', ['rear_delts'], ['upper_back'], [], 3, '12-20', 45,
    ['Hinge forward with flat torso at 45 degrees, dumbbells hanging', 'Sweep arms wide leading with elbows, squeezing rear delts', 'Lower slowly under control'],
    'Balances anterior chest presses by developing posterior deltoid thickness and shoulder posture.',
    ['reverse-pec-deck', 'face-pull', 'prone-ytw-raise'],
    { tier: 3, movementPattern: 'isolation_delts', category: 'shoulders', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('reverse-pec-deck', 'Reverse Pec Deck (Rear Delt Fly Machine)', 'machine', ['rear_delts'], ['upper_back', 'traps'], [], 3, '12-20', 45,
    ['Sit facing the chest pad with arms extended forward', 'Fly handles outward and backward, leading with pinkies', 'Pause at peak contraction, return slowly'],
    'Locked-in machine stability eliminates torso swinging for pure posterior deltoid stimulus.',
    ['rear-delt-fly', 'face-pull'],
    { tier: 3, movementPattern: 'isolation_delts', category: 'shoulders', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('barbell-shrug', 'Barbell Shrug', 'barbell', ['traps'], ['forearms'], [], 3, '8-12', 60,
    ['Hold barbell at thigh level with overhand grip', 'Shrug shoulders straight up toward ears and pause', 'Lower slowly without rolling shoulders'],
    'Direct overload for the upper trapezius musculature and grip endurance.',
    ['dumbbell-shrug', 'face-pull'],
    { tier: 3, movementPattern: 'isolation_delts', category: 'shoulders', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('dumbbell-shrug', 'Dumbbell Shrug', 'dumbbell', ['traps'], ['forearms'], [], 3, '10-15', 60,
    ['Hold heavy dumbbells at your sides with neutral grip', 'Elevate shoulders directly toward ears', 'Squeeze traps at the apex and lower smoothly'],
    'Neutral hand positioning provides an ergonomic, pinch-free trap contraction.',
    ['barbell-shrug', 'face-pull'],
    { tier: 3, movementPattern: 'isolation_delts', category: 'shoulders', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('band-lateral-raise', 'Standing Band Lateral Raise', 'bodyweight', ['side_delts'], [], ['shoulder'], 3, '15-25', 45,
    ['Step on center of band, hold handles at sides', 'Raise arms to shoulder level against increasing elastic resistance', 'Lower slowly maintaining tension'],
    'Gentle accommodating resistance for deltoid hypertrophy and shoulder rehabilitation.',
    ['dumbbell-lateral-raise'],
    { tier: 3, movementPattern: 'isolation_delts', category: 'shoulders', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),

  // ═════════════════════════════════════════════════════════════════════
  // 4. ARMS: BICEPS & TRICEPS
  // ═════════════════════════════════════════════════════════════════════
  // Pure Bodyweight Arms
  E('floor-tricep-press', 'Sphinx Push-Up / Floor Tricep Extension', 'bodyweight', ['triceps'], ['abs'], ['elbow', 'wrist'], 3, '8-12', 60,
    ['Start in low forearm plank with hands flat on floor', 'Press palms down to elevate elbows off the floor into high plank lockout', 'Lower elbows back down with high triceps control'],
    'An exceptional bodyweight triceps isolation movement requiring zero external weights or cables.',
    ['diamond-push-up', 'push-up'],
    { tier: 3, movementPattern: 'isolation_triceps', category: 'triceps', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),

  // Biceps
  E('barbell-curl', 'Standing Barbell Bicep Curl', 'barbell', ['biceps'], ['forearms'], ['wrist', 'elbow'], 3, '8-12', 60,
    ['Stand tall with supinated shoulder-width grip on bar', 'Curl bar up toward chest while keeping elbows pinned to ribs', 'Lower slowly to full elbow extension without hip sway'],
    'The heavy mass builder for the anterior arm flexors and grip stability.',
    ['dumbbell-curl', 'cable-curl', 'hammer-curl'],
    { tier: 3, movementPattern: 'isolation_biceps', category: 'biceps', difficulty: 'intermediate', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('dumbbell-curl', 'Alternating Dumbbell Bicep Curl', 'dumbbell', ['biceps'], ['forearms'], ['elbow'], 3, '10-12', 60,
    ['Hold dumbbells at sides with palms neutral, curl up while supinating wrist', 'Squeeze biceps hard at top', 'Lower under control to sides'],
    'Supination through the curling arc recruits both the short and long heads of the biceps.',
    ['barbell-curl', 'cable-curl', 'hammer-curl'],
    { tier: 3, movementPattern: 'isolation_biceps', category: 'biceps', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('hammer-curl', 'Neutral-Grip Dumbbell Hammer Curl', 'dumbbell', ['biceps', 'forearms'], [], [], 3, '10-12', 60,
    ['Keep palms facing each other throughout the curl', 'Lift dumbbell toward shoulder keeping elbow locked at side', 'Lower slowly under control'],
    'Emphasizes the brachialis and brachioradialis for forearm thickness and arm width.',
    ['dumbbell-curl', 'cable-curl'],
    { tier: 3, movementPattern: 'isolation_biceps', category: 'biceps', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('incline-dumbbell-curl', 'Incline Dumbbell Bicep Curl', 'dumbbell', ['biceps'], [], ['shoulder', 'elbow'], 3, '10-12', 60,
    ['Sit on 45-degree incline bench with arms hanging fully behind torso', 'Curl dumbbells up while keeping elbows pointed down', 'Lower to complete stretch at bottom'],
    'Places the long head of the biceps under a deep stretch across the shoulder joint for peak height.',
    ['dumbbell-curl', 'cable-curl'],
    { tier: 3, movementPattern: 'isolation_biceps', category: 'biceps', difficulty: 'intermediate', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('cable-curl', 'Standing Cable Bicep Curl', 'cable', ['biceps'], ['forearms'], [], 3, '10-15', 60,
    ['Hold straight or EZ-bar attached to low pulley', 'Curl up toward chin, keeping elbows tight to sides', 'Lower under smooth, continuous cable resistance'],
    'Keeps constant mechanical tension at the bottom of the movement where free weights drop off.',
    ['dumbbell-curl', 'barbell-curl'],
    { tier: 3, movementPattern: 'isolation_biceps', category: 'biceps', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('preacher-curl', 'Barbell Preacher Curl', 'barbell', ['biceps'], [], ['elbow'], 3, '10-12', 60,
    ['Rest upper arms flush on preacher pad, grip bar shoulder-width', 'Curl up to vertical forearm position', 'Lower slowly to near-full stretch without hyper-extending elbows'],
    'Completely prevents momentum and swinging, isolating the lower biceps peak.',
    ['cable-curl', 'dumbbell-curl'],
    { tier: 3, movementPattern: 'isolation_biceps', category: 'biceps', difficulty: 'intermediate', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('band-bicep-curl', 'Standing Resistance Band Bicep Curl', 'bodyweight', ['biceps'], ['forearms'], [], 3, '12-20', 45,
    ['Stand on middle of band, curl handles up with palms facing sky', 'Squeeze biceps hard against peak band tension at the top', 'Control the descent'],
    'Smooth elastic resistance for arm training anywhere.',
    ['dumbbell-curl', 'hammer-curl'],
    { tier: 3, movementPattern: 'isolation_biceps', category: 'biceps', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),

  // Triceps
  E('close-grip-bench-press', 'Close-Grip Barbell Bench Press', 'barbell', ['triceps'], ['chest', 'front_delts'], ['wrist', 'elbow', 'shoulder'], 3, '6-10', 90,
    ['Grip bar at shoulder width on flat bench', 'Lower bar to lower sternum with elbows tucked tightly to ribs', 'Press up focusing entirely on triceps extension'],
    'The heaviest compound overload available for overall triceps mass and lockout strength.',
    ['triceps-pushdown', 'diamond-push-up', 'chest-dip'],
    { tier: 2, movementPattern: 'isolation_triceps', category: 'triceps', difficulty: 'intermediate', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('triceps-pushdown', 'Cable Triceps Pushdown (Straight Bar)', 'cable', ['triceps'], [], ['elbow'], 3, '10-15', 60,
    ['Stand upright, elbows pinned to sides at 90 degrees', 'Push bar down until arms are fully extended', 'Control the return up to chest height'],
    'The standard cable builder for lateral and medial triceps heads.',
    ['rope-pushdown', 'overhead-dumbbell-extension', 'diamond-push-up'],
    { tier: 3, movementPattern: 'isolation_triceps', category: 'triceps', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('rope-pushdown', 'Cable Triceps Rope Pushdown', 'cable', ['triceps'], [], [], 3, '10-15', 60,
    ['Hold rope attachment, elbows tucked to ribs', 'Push down and flare ends of rope outward at bottom lockout', 'Return smoothly to 90 degrees'],
    'Flaring the rope at the bottom provides maximum contraction on the lateral triceps head.',
    ['triceps-pushdown', 'overhead-dumbbell-extension'],
    { tier: 3, movementPattern: 'isolation_triceps', category: 'triceps', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('overhead-dumbbell-extension', 'Seated Overhead Dumbbell Triceps Extension', 'dumbbell', ['triceps'], [], ['elbow', 'shoulder'], 3, '10-12', 60,
    ['Hold one dumbbell with both hands overhead, seated upright', 'Lower dumbbell behind head by bending elbows to 90 degrees', 'Extend arms back to top lockout'],
    'Places the long head of the triceps in a deep stretch for complete upper-arm sweep.',
    ['skull-crusher', 'triceps-pushdown'],
    { tier: 3, movementPattern: 'isolation_triceps', category: 'triceps', difficulty: 'intermediate', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('skull-crusher', 'Lying Barbell Triceps Extension (Skull Crusher)', 'barbell', ['triceps'], [], ['elbow', 'wrist'], 3, '8-12', 75,
    ['Lie on flat bench, hold bar over chest', 'Hinge at elbows to lower bar toward forehead or crown of head', 'Extend elbows smoothly back to starting position'],
    'Classic mass builder for the long and medial triceps heads.',
    ['triceps-pushdown', 'overhead-dumbbell-extension'],
    { tier: 3, movementPattern: 'isolation_triceps', category: 'triceps', difficulty: 'intermediate', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('bench-dip', 'Bench Dip', 'bodyweight', ['triceps'], ['chest', 'front_delts'], ['shoulder', 'wrist', 'elbow'], 3, '8-15', 60,
    ['Place palms on edge of bench behind you, legs out in front', 'Lower hips by bending elbows until upper arms reach parallel', 'Press back up through the palms'],
    'Accessible bodyweight triceps movement that can be calibrated by bending knees.',
    ['diamond-push-up', 'floor-tricep-press'],
    { tier: 3, movementPattern: 'isolation_triceps', category: 'triceps', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: false }
  ),

  // ═════════════════════════════════════════════════════════════════════
  // 5. QUADS & KNEE-DOMINANT LEGS
  // ═════════════════════════════════════════════════════════════════════
  // Pure Bodyweight Quads
  E('bodyweight-squat', 'Bodyweight Air Squat', 'bodyweight', ['quads', 'glutes'], ['hamstrings', 'abs'], ['knee'], 3, '15-25', 45,
    ['Stand with feet shoulder-width, toes slightly flared', 'Sit back and down until thighs reach parallel with the floor', 'Drive through mid-foot to stand tall, squeezing glutes'],
    'The foundational lower-body movement pattern that builds mobility, knee stability, and quad endurance with zero equipment.',
    ['bodyweight-reverse-lunge', 'bodyweight-walking-lunge', 'wall-sit'],
    { tier: 2, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('bodyweight-reverse-lunge', 'Bodyweight Reverse Lunge', 'bodyweight', ['quads', 'glutes'], ['hamstrings'], ['knee'], 3, '10-15', 45,
    ['Take a large step backward and lower back knee until an inch above floor', 'Keep front shin relatively vertical and torso upright', 'Push through front heel to return to standing'],
    'Gentler on the patellar tendon than forward lunges while delivering powerful unilateral quad and glute training.',
    ['bodyweight-squat', 'bodyweight-walking-lunge', 'cossack-squat'],
    { tier: 2, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('bodyweight-walking-lunge', 'Bodyweight Walking Lunge', 'bodyweight', ['quads', 'glutes'], ['hamstrings', 'calves', 'abs'], ['knee', 'ankle'], 3, '12-20', 60,
    ['Step forward into a lunge, lowering back knee toward floor', 'Drive smoothly through front foot into the next forward step', 'Continue walking forward with steady rhythm'],
    'Dynamic unilateral leg training that combines quad hypertrophy with balance and hip stabilization.',
    ['bodyweight-reverse-lunge', 'bodyweight-squat'],
    { tier: 2, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('cossack-squat', 'Cossack Squat (Lateral Air Squat)', 'bodyweight', ['quads', 'glutes'], ['hamstrings', 'calves'], ['knee', 'hip', 'ankle'], 3, '8-12', 45,
    ['Stand with wide stance, shift weight to one side and squat deeply on that leg', 'Keep opposite leg straight with heel grounded and toes turned up', 'Push back to center and alternate'],
    'Exceptional frontal-plane hip mobility, adductor flexibility, and unilateral quad strength builder.',
    ['bodyweight-squat', 'bodyweight-reverse-lunge'],
    { tier: 2, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('wall-sit', 'Isometric Wall Sit', 'bodyweight', ['quads'], ['glutes', 'calves'], ['knee'], 3, '30-60s', 45,
    ['Back flat against a sturdy wall, slide down until thighs are parallel to ground', 'Ensure knees are directly over ankles at 90 degrees', 'Hold position without resting hands on thighs'],
    'Safe isometric time-under-tension protocol that strengthens the quadriceps without joint shear.',
    ['bodyweight-squat', 'bodyweight-reverse-lunge'],
    { tier: 3, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('jump-squat', 'Bodyweight Jump Squat (Plyometric)', 'bodyweight', ['quads', 'glutes'], ['calves', 'hamstrings'], ['knee', 'ankle'], 3, '8-12', 60,
    ['Lower into standard quarter/half squat', 'Explode upward into a vertical jump with arms driving up', 'Land softly on balls of feet and absorb into next squat'],
    'Develops lower-body explosive power, rate of force development, and athletic conditioning.',
    ['bodyweight-squat', 'burpee'],
    { tier: 2, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('bodyweight-step-up', 'Bodyweight Step-Up (Floor / Stair Step)', 'bodyweight', ['quads', 'glutes'], ['calves'], ['knee'], 3, '10-15', 45,
    ['Place front foot on a sturdy step or elevated ledge', 'Drive through heel to step up to straight leg without bouncing off back foot', 'Lower with control'],
    'Unilateral quad and glute strength builder accessible on any household staircase.',
    ['bodyweight-reverse-lunge', 'bodyweight-squat'],
    { tier: 2, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('bodyweight-bulgarian-split-squat', 'Bodyweight Bulgarian Split Squat', 'bodyweight', ['quads', 'glutes'], ['hamstrings'], ['knee', 'hip'], 3, '8-12', 60,
    ['Rest rear foot on a low chair, sofa, or step behind you', 'Lower hips straight down until front thigh is parallel to floor', 'Drive through front heel to return to top'],
    'Unilateral quad and glute builder that rivals heavy barbell squats in muscle activation.',
    ['bodyweight-reverse-lunge', 'bodyweight-step-up'],
    { tier: 2, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),

  // Loaded Quads
  E('barbell-back-squat', 'Barbell Back Squat', 'barbell', ['quads', 'glutes'], ['hamstrings', 'lower_back', 'abs'], ['knee', 'lower_back', 'hip', 'ankle'], 4, '5-8', 150,
    ['Rest bar securely across upper traps, feet shoulder-width', 'Break at hips and knees together, squatting to parallel', 'Drive aggressively through mid-foot to stand'],
    'The premier barbell compound movement for overall lower-body size, systemic strength, and bone density.',
    ['goblet-squat', 'leg-press', 'hack-squat'],
    { tier: 1, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'advanced', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('front-squat', 'Barbell Front Squat', 'barbell', ['quads'], ['glutes', 'abs', 'upper_back'], ['knee', 'wrist', 'lower_back'], 3, '5-8', 150,
    ['Rest bar on front deltoid shelf with high elbows', 'Squat down keeping torso completely upright', 'Drive through mid-foot to stand'],
    'Heavily emphasizes the quadriceps while reducing lumbar shear forces.',
    ['barbell-back-squat', 'goblet-squat', 'hack-squat'],
    { tier: 1, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'advanced', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('goblet-squat', 'Dumbbell / Kettlebell Goblet Squat', 'dumbbell', ['quads', 'glutes'], ['abs'], ['knee'], 3, '10-15', 75,
    ['Hold dumbbell vertically against upper chest with both hands', 'Squat between knees keeping elbows inside thighs', 'Stand up tall, driving through heels'],
    'The best exercise to teach upright torso mechanics and deep squat depth with low injury risk.',
    ['bodyweight-squat', 'leg-press', 'barbell-back-squat'],
    { tier: 2, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'beginner', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('leg-press', '45-Degree Incline Leg Press', 'machine', ['quads', 'glutes'], ['hamstrings'], ['knee'], 3, '10-15', 90,
    ['Place feet shoulder-width on platform, release safety levers', 'Lower platform until knees reach 90 degrees', 'Press through mid-foot without locking knees out aggressively'],
    'Allows maximal quadriceps loading with zero spinal compression.',
    ['hack-squat', 'goblet-squat', 'leg-extension'],
    { tier: 2, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'beginner', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('hack-squat', 'Machine Hack Squat', 'machine', ['quads'], ['glutes'], ['knee'], 3, '8-12', 90,
    ['Position back flat against pad with shoulders wedged under pads', 'Squat down to 90 degrees with shins vertical', 'Drive back up through mid-foot'],
    'Isolates the quadriceps through a rigid guided track that removes balance demands.',
    ['leg-press', 'goblet-squat', 'leg-extension'],
    { tier: 2, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'intermediate', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('leg-extension', 'Seated Leg Extension Machine', 'machine', ['quads'], [], ['knee'], 3, '12-15', 60,
    ['Align knee pivot with machine axis, pad on lower shins', 'Extend legs fully and pause for a second at peak quad contraction', 'Lower slowly through the eccentric return'],
    'Pure open-kinetic-chain quadriceps isolation targeting the rectus femoris in its shortened position.',
    ['leg-press', 'goblet-squat'],
    { tier: 3, movementPattern: 'isolation_legs', category: 'legs', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('walking-lunge', 'Dumbbell Walking Lunge', 'dumbbell', ['quads', 'glutes'], ['hamstrings', 'abs'], ['knee', 'ankle', 'hip'], 3, '10-12', 75,
    ['Hold dumbbells at sides, step forward and drop back knee toward floor', 'Drive through front heel to step directly into the next lunge', 'Maintain tall upright posture throughout'],
    'Heavy functional unilateral quad and glute training with dynamic hip stabilization.',
    ['reverse-lunge', 'bulgarian-split-squat', 'leg-press'],
    { tier: 2, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'intermediate', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('reverse-lunge', 'Dumbbell Reverse Lunge', 'dumbbell', ['quads', 'glutes'], ['hamstrings'], ['knee'], 3, '10-12', 75,
    ['Hold dumbbells at sides, step backward and drop back knee gently', 'Keep weight rooted in front heel and torso upright', 'Push through front foot to stand'],
    'Gentle on the patellar tendon while delivering intense single-leg loading.',
    ['walking-lunge', 'step-up', 'goblet-squat'],
    { tier: 2, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'beginner', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('bulgarian-split-squat', 'Dumbbell Bulgarian Split Squat', 'dumbbell', ['quads', 'glutes'], ['hamstrings'], ['knee', 'hip', 'ankle'], 3, '8-12', 90,
    ['Rear foot elevated on bench behind you, dumbbells held at sides', 'Lower hips straight down until front thigh is parallel', 'Drive up through front heel'],
    'One of the most potent unilateral leg and glute hypertrophic exercises in sports science.',
    ['reverse-lunge', 'step-up', 'leg-press'],
    { tier: 2, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'advanced', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('step-up', 'Dumbbell Bench Step-Up', 'dumbbell', ['quads', 'glutes'], ['hamstrings'], ['knee'], 3, '10-12', 60,
    ['Place whole foot on bench holding dumbbells', 'Step up driving entirely through the working leg without jumping off the back toe', 'Lower with control'],
    'Direct functional strength builder for stairs and athletic sprint mechanics.',
    ['reverse-lunge', 'goblet-squat'],
    { tier: 2, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'beginner', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('smith-machine-squat', 'Smith Machine Squat', 'machine', ['quads', 'glutes'], ['hamstrings'], ['knee', 'lower_back'], 3, '8-12', 90,
    ['Bar across upper back, place feet slightly forward on floor', 'Squat down smoothly to 90 degrees', 'Press back up to standing'],
    'Fixed vertical rails permit lifters to place feet forward to target quads with zero forward lean.',
    ['leg-press', 'hack-squat', 'goblet-squat'],
    { tier: 2, movementPattern: 'quad_dominant', category: 'legs', difficulty: 'beginner', exerciseType: 'compound', isStrictBodyweight: false }
  ),

  // ═════════════════════════════════════════════════════════════════════
  // 6. GLUTES, HAMSTRINGS & HIP HINGE
  // ═════════════════════════════════════════════════════════════════════
  // Pure Bodyweight Posterior Chain
  E('glute-bridge', 'Bodyweight Glute Bridge', 'bodyweight', ['glutes'], ['hamstrings', 'lower_back'], [], 3, '15-25', 45,
    ['Lie on back with knees bent at 90 degrees, feet flat on floor', 'Drive through heels to lift hips until thighs and torso align', 'Squeeze glutes hard at top for 2 seconds, then lower smoothly'],
    'The foundational equipment-free glute builder that restores hip extension without back strain.',
    ['single-leg-glute-bridge', 'frog-pump', 'donkey-kick'],
    { tier: 2, movementPattern: 'hip_hinge', category: 'glutes', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('single-leg-glute-bridge', 'Single-Leg Bodyweight Glute Bridge', 'bodyweight', ['glutes'], ['hamstrings'], [], 3, '10-15', 45,
    ['Lie on back, lift one leg into the air', 'Drive through working heel to elevate hips fully', 'Lower with control without letting hips tilt'],
    'Doubles the bodyweight resistance per glute and addresses left-to-right pelvic imbalances.',
    ['glute-bridge', 'frog-pump'],
    { tier: 2, movementPattern: 'hip_hinge', category: 'glutes', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('frog-pump', 'Floor Frog Pumps', 'bodyweight', ['glutes'], [], [], 3, '20-30', 30,
    ['Lie on back, press soles of feet together with knees splayed wide', 'Drive outer edges of feet into floor to bridge hips upward', 'Squeeze glutes intensely at peak contraction'],
    'Combines external rotation and hip extension to maximize gluteus maximus contraction with zero weights.',
    ['glute-bridge', 'single-leg-glute-bridge'],
    { tier: 3, movementPattern: 'hip_hinge', category: 'glutes', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('donkey-kick', 'Quadruped Donkey Kick', 'bodyweight', ['glutes'], ['hamstrings'], [], 3, '15-20', 30,
    ['Start on hands and knees with neutral spine', 'Kick one heel straight up toward the ceiling keeping knee bent at 90 degrees', 'Squeeze glute at top without arching lower back, then return'],
    'Strict glute isolation movement requiring zero equipment and zero stress on the lumbar spine.',
    ['fire-hydrant', 'glute-bridge'],
    { tier: 3, movementPattern: 'hip_hinge', category: 'glutes', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('fire-hydrant', 'Quadruped Fire Hydrant (Hip Abduction)', 'bodyweight', ['glutes'], [], ['hip'], 3, '15-20', 30,
    ['Start on all fours with tight core', 'Lift one bent knee out to the side until thigh is parallel to floor', 'Hold for 1 second, then lower under control'],
    'Directly targets the gluteus medius and minimus for hip stability and pelvic alignment.',
    ['donkey-kick', 'glute-bridge'],
    { tier: 3, movementPattern: 'isolation_legs', category: 'glutes', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('bodyweight-single-leg-rdl', 'Bodyweight Single-Leg Romanian Deadlift', 'bodyweight', ['hamstrings', 'glutes'], ['calves', 'abs'], ['ankle'], 3, '8-12', 45,
    ['Stand on one leg with soft knee bend', 'Hinge forward at hip while extending non-working leg straight behind you', 'Reach forward until torso is parallel to floor, then return by contracting hamstring'],
    'Develops posterior chain flexibility, ankle balance, and hamstring eccentric control.',
    ['glute-bridge', 'single-leg-glute-bridge'],
    { tier: 2, movementPattern: 'hip_hinge', category: 'hamstrings', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),

  // Loaded Posterior Chain
  E('romanian-deadlift', 'Barbell Romanian Deadlift (RDL)', 'barbell', ['hamstrings', 'glutes'], ['lower_back', 'forearms'], ['lower_back', 'hip'], 3, '8-10', 120,
    ['Hold bar at hips with soft knees', 'Push hips back toward the wall behind you with flat spine', 'Lower until deep hamstring stretch is felt, then drive hips forward to stand'],
    'The premier hamstring stretch and hip hinge exercise for hypertrophy and athletic sprinting power.',
    ['dumbbell-romanian-deadlift', 'lying-leg-curl', 'hip-thrust'],
    { tier: 1, movementPattern: 'hip_hinge', category: 'hamstrings', difficulty: 'intermediate', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('dumbbell-romanian-deadlift', 'Dumbbell Romanian Deadlift', 'dumbbell', ['hamstrings', 'glutes'], ['lower_back'], ['lower_back'], 3, '10-12', 90,
    ['Hold dumbbells in front of thighs, knees soft', 'Hinge hips backward, tracing dumbbells down shins with flat back', 'Drive hips forward, squeezing glutes to stand'],
    'Allows hands to travel naturally along the sides of legs, reducing lower-back torque.',
    ['romanian-deadlift', 'lying-leg-curl', 'hip-thrust'],
    { tier: 2, movementPattern: 'hip_hinge', category: 'hamstrings', difficulty: 'beginner', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('hip-thrust', 'Barbell Hip Thrust (Bench Supported)', 'barbell', ['glutes'], ['hamstrings', 'quads'], ['hip', 'lower_back'], 3, '8-12', 90,
    ['Upper back against sturdy bench, bar with pad over hip crease', 'Plant feet at shoulder width, drive hips up to full horizontal extension', 'Pause and squeeze glutes hard at the apex, then lower smoothly'],
    'Maximizes mechanical tension at full hip extension where the gluteus maximus is strongest.',
    ['glute-bridge', 'single-leg-glute-bridge', 'cable-pull-through'],
    { tier: 1, movementPattern: 'hip_hinge', category: 'glutes', difficulty: 'intermediate', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('lying-leg-curl', 'Lying Hamstring Leg Curl Machine', 'machine', ['hamstrings'], ['calves'], ['knee'], 3, '10-15', 60,
    ['Lie face down, roller pad positioned against lower Achilles tendons', 'Curl heels toward glutes smoothly', 'Control the descent back to full leg extension'],
    'Directly isolates the knee-flexion function of the hamstring complex.',
    ['seated-leg-curl', 'dumbbell-romanian-deadlift'],
    { tier: 3, movementPattern: 'isolation_legs', category: 'hamstrings', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('seated-leg-curl', 'Seated Hamstring Leg Curl Machine', 'machine', ['hamstrings'], ['calves'], ['knee'], 3, '10-15', 60,
    ['Sit with thigh pad clamped, back against pad', 'Curl legs down and back beneath seat', 'Slowly return to start'],
    'Trains the hamstrings in a lengthened hip-flexed position, yielding superior muscle growth in clinical studies.',
    ['lying-leg-curl', 'dumbbell-romanian-deadlift'],
    { tier: 3, movementPattern: 'isolation_legs', category: 'hamstrings', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('good-morning', 'Barbell Good Morning', 'barbell', ['hamstrings', 'lower_back'], ['glutes'], ['lower_back'], 3, '8-12', 90,
    ['Bar across upper back, slight bend in knees', 'Hinge hips backward until torso is nearly parallel to floor', 'Contract hamstrings to stand tall'],
    'Builds resilience in the posterior chain and spinal erectors.',
    ['romanian-deadlift', 'cable-pull-through'],
    { tier: 2, movementPattern: 'hip_hinge', category: 'hamstrings', difficulty: 'advanced', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('hip-abduction-machine', 'Seated Hip Abduction Machine', 'machine', ['glutes'], [], ['hip'], 3, '12-20', 45,
    ['Sit with pads on outside of knees', 'Push legs outward against resistance', 'Slowly return without letting weight stack touch'],
    'Targets the gluteus medius for hip stability and pelvic width.',
    ['cable-kickback', 'fire-hydrant'],
    { tier: 3, movementPattern: 'isolation_legs', category: 'glutes', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('cable-kickback', 'Cable Glute Kickback', 'cable', ['glutes'], ['hamstrings'], [], 3, '12-15', 45,
    ['Attach ankle cuff to low pulley, face cable station', 'Drive leg straight back and slightly outward, contracting glute', 'Return slowly without hyperextending lumbar spine'],
    'Constant cable resistance across the glute contraction arc.',
    ['hip-abduction-machine', 'glute-bridge', 'donkey-kick'],
    { tier: 3, movementPattern: 'isolation_legs', category: 'glutes', difficulty: 'intermediate', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('cable-pull-through', 'Cable Pull-Through with Rope', 'cable', ['glutes', 'hamstrings'], ['lower_back'], [], 3, '10-15', 60,
    ['Face away from low pulley, rope between legs', 'Hinge hips backward with flat back', 'Drive hips forward into full extension, squeezing glutes'],
    'Superb, low-back-friendly hinge pattern builder.',
    ['dumbbell-romanian-deadlift', 'hip-thrust', 'glute-bridge'],
    { tier: 2, movementPattern: 'hip_hinge', category: 'glutes', difficulty: 'beginner', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('kettlebell-swing', 'Russian Kettlebell Swing', 'kettlebell', ['glutes', 'hamstrings'], ['lower_back', 'abs', 'front_delts'], ['lower_back'], 3, '12-20', 60,
    ['Hinge back, hike bell between legs', 'Snap hips explosively forward, driving bell to chest level', 'Let bell fall naturally and hinge back into next rep'],
    'High-power posterior chain explosive builder and conditioning tool.',
    ['cable-pull-through', 'hip-thrust'],
    { tier: 2, movementPattern: 'hip_hinge', category: 'glutes', difficulty: 'intermediate', exerciseType: 'compound', isStrictBodyweight: false }
  ),

  // ═════════════════════════════════════════════════════════════════════
  // 7. CALVES
  // ═════════════════════════════════════════════════════════════════════
  E('bodyweight-standing-calf-raise', 'Bodyweight Standing Calf Raise', 'bodyweight', ['calves'], [], ['ankle'], 3, '15-25', 45,
    ['Stand on balls of feet on a step edge or flat floor', 'Rise up onto big toes as high as possible and hold for 1 second', 'Lower under control to a deep stretch'],
    'Direct calf training requiring zero apparatus.',
    ['single-leg-calf-raise'],
    { tier: 3, movementPattern: 'isolation_legs', category: 'calves', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('single-leg-calf-raise', 'Single-Leg Bodyweight Calf Raise', 'bodyweight', ['calves'], [], ['ankle'], 3, '12-20', 45,
    ['Stand on one foot with ball of foot on step edge', 'Raise onto tiptoes, pause at the apex', 'Lower slowly to full ankle dorsiflexion stretch'],
    'Doubles the resistance per calf and fixes ankle stability imbalances.',
    ['bodyweight-standing-calf-raise', 'standing-calf-raise'],
    { tier: 3, movementPattern: 'isolation_legs', category: 'calves', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('tibialis-raise', 'Bodyweight Wall Tibialis Raise', 'bodyweight', ['calves'], [], ['ankle', 'knee'], 3, '15-25', 45,
    ['Back against wall, legs extended forward on heels', 'Flex toes and feet upward toward shins', 'Lower slowly to floor'],
    'Strengthens the anterior tibialis to bulletproof knees and prevent shin splints with zero equipment.',
    ['single-leg-calf-raise'],
    { tier: 3, movementPattern: 'isolation_legs', category: 'calves', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('standing-calf-raise', 'Standing Machine Calf Raise', 'machine', ['calves'], [], ['ankle'], 3, '10-15', 45,
    ['Balls of feet on platform, pads on shoulders', 'Rise onto toes fully and pause', 'Lower to complete calf stretch'],
    'Overloads the gastrocnemius with straight-knee leverage.',
    ['single-leg-calf-raise'],
    { tier: 3, movementPattern: 'isolation_legs', category: 'calves', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('seated-calf-raise', 'Seated Calf Raise Machine', 'machine', ['calves'], [], ['ankle'], 3, '12-20', 45,
    ['Sit with knee pads clamped over lower thighs', 'Elevate heels onto balls of feet, hold peak contraction', 'Lower to deep Achilles stretch'],
    'Directly isolates the soleus muscle underneath the calf.',
    ['standing-calf-raise'],
    { tier: 3, movementPattern: 'isolation_legs', category: 'calves', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('leg-press-calf-raise', 'Leg Press Calf Press', 'machine', ['calves'], [], ['ankle'], 3, '12-20', 45,
    ['Balls of feet on bottom edge of leg press platform', 'Push platform away through toes', 'Lower to full ankle stretch without bending knees'],
    'Heavy calf overload using the leg press carriage.',
    ['standing-calf-raise', 'seated-calf-raise'],
    { tier: 3, movementPattern: 'isolation_legs', category: 'calves', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),

  // ═════════════════════════════════════════════════════════════════════
  // 8. CORE & ABDOMINALS
  // ═════════════════════════════════════════════════════════════════════
  // Pure Bodyweight Core
  E('plank', 'Forearm Plank', 'bodyweight', ['abs'], ['obliques', 'lower_back', 'glutes'], ['shoulder', 'wrist'], 3, '30-60s', 45,
    ['Forearms on floor under shoulders, body in a rigid straight line', 'Tuck pelvis, squeeze glutes and brace abs tightly', 'Breathe steadily without letting hips sag or pike'],
    'The classic isometric anti-extension core stability standard.',
    ['side-plank', 'dead-bug', 'bird-dog'],
    { tier: 3, movementPattern: 'core', category: 'core', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('side-plank', 'Side Plank Hold', 'bodyweight', ['obliques'], ['abs', 'glutes'], ['shoulder', 'wrist'], 3, '20-45s', 45,
    ['Lie on side, elbow under shoulder, stack feet', 'Elevate hips until body forms straight diagonal line', 'Hold without rotating torso forward'],
    'Isometric anti-lateral flexion builder for lateral core integrity and hip stability.',
    ['plank', 'russian-twist'],
    { tier: 3, movementPattern: 'core', category: 'core', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('dead-bug', 'Dead Bug', 'bodyweight', ['abs'], ['obliques'], [], 3, '10-15', 45,
    ['Lie on back, arms straight up, knees at 90 degrees', 'Extend opposite arm and leg toward floor while pressing lower back flat', 'Return to center and switch sides'],
    'Teaches anterior pelvic stability and deep transversus abdominis activation with zero spine strain.',
    ['bird-dog', 'plank', 'crunch'],
    { tier: 3, movementPattern: 'core', category: 'core', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('bird-dog', 'Bird Dog', 'bodyweight', ['lower_back'], ['glutes', 'abs'], ['wrist'], 3, '10-15', 45,
    ['Start on hands and knees with flat spine', 'Simultaneously extend right arm forward and left leg straight back', 'Hold for 2 seconds, return and alternate'],
    'Dr. Stuart McGill core stability standard that strengthens the posterior oblique sling.',
    ['dead-bug', 'plank', 'superman'],
    { tier: 3, movementPattern: 'core', category: 'core', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('bicycle-crunch', 'Bicycle Crunch', 'bodyweight', ['abs', 'obliques'], [], [], 3, '15-30', 45,
    ['Lie on back, fingertips at temples', 'Bring opposite elbow to knee while extending other leg', 'Alternate sides in a slow, controlled pedal rhythm'],
    'Combines flexion and rotation for maximal rectus and oblique muscle recruitment.',
    ['crunch', 'russian-twist'],
    { tier: 3, movementPattern: 'core', category: 'core', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('crunch', 'Standard Floor Abdominal Crunch', 'bodyweight', ['abs'], [], [], 3, '15-25', 45,
    ['Lie on back, knees bent, feet flat on floor', 'Curl shoulders off the ground by compressing ribs to pelvis', 'Lower smoothly without pulling on neck'],
    'Simple, effective rectus abdominis shortening movement.',
    ['reverse-crunch', 'bicycle-crunch'],
    { tier: 3, movementPattern: 'core', category: 'core', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('reverse-crunch', 'Floor Reverse Crunch', 'bodyweight', ['abs'], [], [], 3, '12-20', 45,
    ['Lie on back, arms at sides, knees bent at 90 degrees', 'Curl hips off the floor, bringing knees toward chest', 'Lower slowly using lower abdominal control'],
    'Targets lower rectus abdominis without neck or hip-flexor dominance.',
    ['crunch', 'dead-bug'],
    { tier: 3, movementPattern: 'core', category: 'core', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('mountain-climber', 'Mountain Climber', 'bodyweight', ['abs'], ['front_delts', 'quads'], ['wrist', 'shoulder'], 3, '20-40s', 30,
    ['Start in high plank on hands and toes', 'Drive one knee up toward chest, then quickly alternate in a running motion', 'Maintain low hips and steady pace'],
    'High-tempo core endurance and conditioning crossover exercise.',
    ['plank', 'dead-bug'],
    { tier: 3, movementPattern: 'core', category: 'core', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('russian-twist', 'Bodyweight Russian Twist', 'bodyweight', ['obliques'], ['abs', 'lower_back'], ['lower_back'], 3, '15-30', 45,
    ['Sit with knees bent, lean torso back 45 degrees with chest tall', 'Rotate shoulders and hands from side to side', 'Keep hips anchored to floor'],
    'Develops rotational strength and oblique muscularity.',
    ['bicycle-crunch', 'side-plank'],
    { tier: 3, movementPattern: 'core', category: 'core', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('hollow-body-hold', 'Gymnastic Hollow Body Hold', 'bodyweight', ['abs'], ['obliques', 'quads'], [], 3, '20-40s', 45,
    ['Lie flat on back, arms extended overhead, legs straight', 'Press lower back into floor, lifting shoulders and heels 4 inches', 'Hold banana shape with braced core'],
    'Gymnastic foundation for maximum anterior core tension.',
    ['plank', 'dead-bug'],
    { tier: 3, movementPattern: 'core', category: 'core', difficulty: 'advanced', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('flutter-kicks', 'Floor Flutter Kicks', 'bodyweight', ['abs'], ['quads'], ['lower_back'], 3, '20-40s', 30,
    ['Lie on back, hands under glutes, legs extended straight', 'Kick legs up and down alternately in small, rapid scissor motions', 'Keep lower back glued to floor'],
    'Endurance burner for the lower abdominals and hip flexors.',
    ['reverse-crunch', 'dead-bug'],
    { tier: 3, movementPattern: 'core', category: 'core', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),

  // Equipment Core
  E('hanging-leg-raise', 'Hanging Leg Raise (Bar)', 'bodyweight', ['abs'], ['obliques', 'forearms'], ['shoulder', 'lower_back'], 3, '8-15', 60,
    ['Hang from pull-up bar with straight arms', 'Raise straight legs upward to waist height or higher without swinging', 'Lower slowly to full hang'],
    'Advanced vertical abdominal exercise with intense lower-abs stimulus.',
    ['hanging-knee-raise', 'reverse-crunch'],
    { tier: 2, movementPattern: 'core', category: 'core', difficulty: 'advanced', exerciseType: 'bodyweight', isStrictBodyweight: false }
  ),
  E('hanging-knee-raise', 'Hanging Knee Raise (Bar)', 'bodyweight', ['abs'], ['forearms'], ['shoulder'], 3, '10-15', 60,
    ['Hang from bar with overhand grip', 'Curl knees up toward chest, tucking pelvis', 'Lower with control without swinging body'],
    'Accessible progression toward strict hanging leg raises.',
    ['hanging-leg-raise', 'reverse-crunch'],
    { tier: 3, movementPattern: 'core', category: 'core', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: false }
  ),
  E('cable-crunch', 'Kneeling Cable Crunch', 'cable', ['abs'], ['obliques'], [], 3, '10-15', 60,
    ['Kneel facing high pulley with rope at temples', 'Crunch torso down, bringing elbows toward thighs', 'Control the return stretch up'],
    'Allows progressive overload on the abdominals with direct weight stack resistance.',
    ['crunch', 'reverse-crunch'],
    { tier: 3, movementPattern: 'core', category: 'core', difficulty: 'intermediate', exerciseType: 'isolation', isStrictBodyweight: false }
  ),
  E('pallof-press', 'Cable Pallof Press', 'cable', ['obliques'], ['abs'], [], 3, '10-12', 45,
    ['Stand perpendicular to chest-height cable, hold handle at sternum', 'Press handle straight out in front of you, resisting lateral rotation', 'Hold for 2 seconds, then return to chest'],
    'The premier anti-rotation stability movement for core health.',
    ['side-plank', 'plank'],
    { tier: 3, movementPattern: 'core', category: 'core', difficulty: 'beginner', exerciseType: 'isolation', isStrictBodyweight: false }
  ),

  // ═════════════════════════════════════════════════════════════════════
  // 9. CARDIO, CONDITIONING & CARRIES
  // ═════════════════════════════════════════════════════════════════════
  // Pure Bodyweight Conditioning
  E('burpee', 'Bodyweight Burpee', 'bodyweight', ['quads', 'chest'], ['abs', 'front_delts', 'triceps', 'calves'], ['wrist', 'knee', 'lower_back'], 3, '8-15', 60,
    ['From standing, drop into squat and place hands on floor', 'Kick feet back to high plank, perform push-up', 'Jump feet back in, then explode vertically into air with arms up'],
    'Full-body cardiovascular and metabolic conditioning requiring zero apparatus.',
    ['mountain-climber', 'high-knees'],
    { tier: 2, movementPattern: 'conditioning', category: 'cardio', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('high-knees', 'Stationary High Knees Sprint', 'bodyweight', ['quads', 'calves'], ['abs'], ['knee', 'ankle'], 3, '20-40s', 30,
    ['Sprint in place, driving knees vigorously up to hip height on every stride', 'Pump arms in coordination with feet', 'Stay light on balls of feet'],
    'Aerobic conditioning and sprint-cadence drill for home or gym.',
    ['burpee', 'mountain-climber'],
    { tier: 3, movementPattern: 'conditioning', category: 'cardio', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('jumping-jacks', 'Classic Jumping Jacks', 'bodyweight', ['calves', 'side_delts'], ['quads'], ['ankle'], 3, '30-60s', 30,
    ['Start standing with arms at sides', 'Jump feet wide while raising arms overhead into a clap', 'Jump back to start and repeat with cadence'],
    'Gentle warm-up and cardiovascular base builder.',
    ['high-knees', 'burpee'],
    { tier: 3, movementPattern: 'conditioning', category: 'cardio', difficulty: 'beginner', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),
  E('skater-hops', 'Lateral Skater Hops', 'bodyweight', ['glutes', 'quads'], ['calves', 'abs'], ['knee', 'ankle'], 3, '12-20', 45,
    ['Bound laterally from one foot to the other like a speed skater', 'Land softly on single foot with knee absorbing impact, sweep other leg behind', 'Push off immediately in opposite direction'],
    'Builds lateral agility, hip stabilizer power, and heart rate.',
    ['burpee', 'high-knees'],
    { tier: 3, movementPattern: 'conditioning', category: 'cardio', difficulty: 'intermediate', exerciseType: 'bodyweight', isStrictBodyweight: true }
  ),

  // Equipment Conditioning
  E('farmers-carry', 'Heavy Dumbbell Farmer\'s Carry', 'dumbbell', ['forearms', 'traps'], ['abs', 'obliques', 'glutes'], ['lower_back'], 3, '30-40m', 60,
    ['Pick up pair of heavy dumbbells with flat back', 'Walk forward with tall posture, short steady steps, shoulders pinned back', 'Maintain tight core without leaning'],
    'Develops crushing grip strength, massive trap endurance, and full-body core bracing under load.',
    ['dumbbell-shrug', 'plank'],
    { tier: 2, movementPattern: 'carry', category: 'cardio', difficulty: 'intermediate', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('dumbbell-thruster', 'Dumbbell Thruster (Squat to Overhead Press)', 'dumbbell', ['quads', 'front_delts'], ['glutes', 'triceps', 'abs'], ['knee', 'shoulder'], 3, '8-12', 75,
    ['Hold dumbbells at shoulders, squat to parallel', 'Explode upward out of squat, using leg drive to propel dumbbells overhead', 'Lower dumbbells to shoulders as you initiate next squat'],
    'Brutal full-body hybrid combining lower-body squat power with vertical pressing capacity.',
    ['goblet-squat', 'dumbbell-shoulder-press'],
    { tier: 2, movementPattern: 'conditioning', category: 'cardio', difficulty: 'advanced', exerciseType: 'compound', isStrictBodyweight: false }
  ),
  E('jump-rope', 'Speed Jump Rope Intervals', 'bodyweight', ['calves'], ['forearms', 'front_delts'], ['ankle', 'knee'], 3, '60-120s', 45,
    ['Hold rope handles at hip height, jump on balls of feet as rope passes under', 'Keep elbows close and rotate wrists smoothly', 'Maintain light, springy bounces'],
    'Classic conditioning tool for foot speed, calf stamina, and cardiovascular fitness.',
    ['jumping-jacks', 'high-knees'],
    { tier: 3, movementPattern: 'conditioning', category: 'cardio', difficulty: 'intermediate', exerciseType: 'cardio', isStrictBodyweight: false }
  ),

  // ═════════════════════════════════════════════════════════════════════
  // 10. MOBILITY & RECOVERY
  // ═════════════════════════════════════════════════════════════════════
  E('worlds-greatest-stretch', 'World\'s Greatest Stretch', 'bodyweight', ['hamstrings', 'glutes'], ['upper_back', 'chest'], ['knee', 'wrist'], 2, '5-8 per side', 30,
    ['Lunge forward, place both hands inside front foot', 'Reach inside arm toward sky, rotating thoracic spine', 'Plant hand, shift hips back into hamstring stretch, step forward and switch'],
    'Premier multi-joint mobility flow that simultaneously opens hips, hamstrings, and the thoracic spine.',
    ['cat-cow-stretch', 'hip-90-90-switch'],
    { tier: 3, movementPattern: 'conditioning', category: 'mobility', difficulty: 'beginner', exerciseType: 'mobility', isStrictBodyweight: true }
  ),
  E('cat-cow-stretch', 'Cat-Cow Spinal Flow', 'bodyweight', ['lower_back'], ['abs', 'upper_back'], ['wrist'], 2, '10-15', 30,
    ['On hands and knees, inhale and drop belly while looking up (Cow)', 'Exhale and arch spine to ceiling, tucking chin and pelvis (Cat)', 'Move smoothly between postures with deep breath'],
    'Gentle spinal articulation that lubricates intervertebral discs and relieves back tightness.',
    ['worlds-greatest-stretch', 'bird-dog'],
    { tier: 3, movementPattern: 'conditioning', category: 'mobility', difficulty: 'beginner', exerciseType: 'mobility', isStrictBodyweight: true }
  ),
  E('hip-90-90-switch', '90/90 Seated Hip Mobility Switch', 'bodyweight', ['glutes'], [], ['hip', 'knee'], 2, '8-10 per side', 30,
    ['Sit on floor with both legs bent at 90 degrees (one in front, one to side)', 'Keep chest tall, rotate knees smoothly over to opposite side', 'Hold end range for 2 seconds before reversing'],
    'Restores internal and external hip rotation essential for deep squats and healthy lumbar spine.',
    ['worlds-greatest-stretch'],
    { tier: 3, movementPattern: 'conditioning', category: 'mobility', difficulty: 'beginner', exerciseType: 'mobility', isStrictBodyweight: true }
  ),
  E('deep-squat-pry', 'Deep Goblet / Bodyweight Squat Pry', 'bodyweight', ['glutes', 'quads'], ['calves'], ['knee', 'ankle'], 2, '30-45s', 30,
    ['Sink into deepest comfortable squat, press elbows against inner knees', 'Gently rock side to side, prying ankles and hips open', 'Keep chest proud and heels flat'],
    'Builds deep squat comfort, adductor opening, and ankle dorsiflexion.',
    ['bodyweight-squat', 'worlds-greatest-stretch'],
    { tier: 3, movementPattern: 'conditioning', category: 'mobility', difficulty: 'beginner', exerciseType: 'mobility', isStrictBodyweight: true }
  ),
];

// ───────── FAST LOOKUP MAPS & EXPORTS ─────────
const byId = new Map(exercises.map((e) => [e.id, e]));

export const getExerciseById = (id: string): Exercise | undefined => byId.get(id);

export const getExercisesByMuscle = (muscle: MuscleGroup): Exercise[] =>
  exercises.filter((e) => e.primaryMuscles.includes(muscle));

export const getSafeExercises = (injuries: InjuryArea[]): Exercise[] =>
  exercises.filter((e) => !e.contraindications.some((c) => injuries.includes(c)));

export const getSafeAlternatives = (id: string, injuries: InjuryArea[]): Exercise[] => {
  const ex = byId.get(id);
  if (!ex) return [];
  return ex.alternatives
    .map((a) => byId.get(a))
    .filter((a): a is Exercise => !!a && !a.contraindications.some((c) => injuries.includes(c)));
};
