import type { Exercise, MuscleGroup, InjuryArea } from '@/types/workout';

type Equipment = Exercise['equipment'];

// youtubeId is left empty on purpose. Paste a verified video ID per exercise,
// and VideoModal can embed it. Until then, youtubeUrl opens a form-guide search.
const yt = (name: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' proper form')}`;

const E = (
  id: string,
  name: string,
  equipment: Equipment,
  primaryMuscles: MuscleGroup[],
  secondaryMuscles: MuscleGroup[],
  contraindications: InjuryArea[],
  defaultSets: number,
  defaultReps: string,
  defaultRestSeconds: number,
  instructions: string[],
  whyIncluded: string,
  alternatives: string[],
  intensityNote?: string
): Exercise => ({
  id,
  name,
  primaryMuscles,
  secondaryMuscles,
  equipment,
  contraindications,
  instructions,
  whyIncluded,
  youtubeId: '',
  youtubeUrl: yt(name),
  alternatives,
  defaultSets,
  defaultReps,
  defaultRestSeconds,
  intensityNote,
});

export const exercises: Exercise[] = [
  // ───────── CHEST ─────────
  E('barbell-bench-press','Barbell Bench Press','barbell',['chest'],['front_delts','triceps'],['shoulder','wrist','elbow'],4,'6-10',120,['Lie flat, feet planted, shoulder blades pinched back','Lower the bar to mid chest under control','Press up until arms are straight'],'The best heavy builder for chest size and pressing strength.',['dumbbell-bench-press','machine-chest-press','push-up']),
  E('incline-barbell-press','Incline Barbell Press','barbell',['chest','front_delts'],['triceps'],['shoulder','wrist','elbow'],3,'6-10',120,['Set bench to 30 degrees, shoulder blades back','Lower the bar to upper chest','Press up and slightly back'],'Targets the upper chest, which flat pressing under-trains.',['incline-dumbbell-press','machine-chest-press','incline-push-up']),
  E('dumbbell-bench-press','Dumbbell Bench Press','dumbbell',['chest'],['front_delts','triceps'],['shoulder'],3,'8-12',90,['Lie flat with dumbbells at chest level','Press up until arms are straight','Lower slowly until you feel a chest stretch'],'Longer range of motion than a barbell and easier on the shoulders.',['machine-chest-press','push-up','barbell-bench-press']),
  E('incline-dumbbell-press','Incline Dumbbell Press','dumbbell',['chest','front_delts'],['triceps'],['shoulder'],3,'8-12',90,['Set bench to 30 degrees','Press the dumbbells up over your upper chest','Lower with control to chest level'],'Builds the upper chest with a joint-friendly path.',['incline-push-up','machine-chest-press','low-to-high-cable-fly']),
  E('machine-chest-press','Machine Chest Press','machine',['chest'],['front_delts','triceps'],[],3,'10-15',75,['Adjust seat so handles are at mid chest','Press forward without locking elbows','Return slowly until you feel a stretch'],'Stable and safe, ideal for beginners or when training close to failure.',['push-up','incline-push-up','pec-deck-fly']),
  E('pec-deck-fly','Pec Deck Fly','machine',['chest'],['front_delts'],['shoulder'],3,'12-15',60,['Sit tall with elbows slightly bent','Bring the handles together in front of your chest','Return slowly without letting the weight stack touch'],'Isolates the chest with constant tension.',['cable-crossover','dumbbell-fly','machine-chest-press']),
  E('cable-crossover','Cable Crossover','cable',['chest'],['front_delts'],['shoulder'],3,'12-15',60,['Set pulleys high, step forward with a slight lean','Sweep hands down and together in an arc','Squeeze at the bottom, then return slowly'],'Great chest squeeze with smooth, even resistance.',['pec-deck-fly','dumbbell-fly','low-to-high-cable-fly']),
  E('dumbbell-fly','Dumbbell Fly','dumbbell',['chest'],['front_delts'],['shoulder'],3,'10-15',60,['Lie flat, dumbbells over chest, elbows slightly bent','Open arms wide in an arc until you feel a stretch','Squeeze the chest to bring them back up'],'Stretch-focused chest isolation.',['pec-deck-fly','cable-crossover']),
  E('push-up','Push-Up','bodyweight',['chest'],['front_delts','triceps','abs'],['wrist','shoulder'],3,'10-20',60,['Hands slightly wider than shoulders, body in a straight line','Lower your chest to just above the floor','Push back up without sagging hips'],'No equipment needed and trains the chest plus core stability.',['incline-push-up','machine-chest-press','dumbbell-bench-press']),
  E('incline-push-up','Incline Push-Up','bodyweight',['chest'],['front_delts','triceps'],['wrist'],3,'10-20',60,['Hands on a bench or bar, body in a straight line','Lower your chest to the edge','Push back up to straight arms'],'An easier push-up for beginners building pressing strength.',['push-up','machine-chest-press']),
  E('chest-dip','Chest Dip','bodyweight',['chest','triceps'],['front_delts'],['shoulder','elbow','wrist'],3,'6-12',90,['Grip the bars and lean your torso forward','Lower until upper arms are parallel to the floor','Press back up to straight arms'],'A heavy bodyweight press for lower chest and triceps.',['machine-chest-press','close-grip-bench-press','push-up']),
  E('low-to-high-cable-fly','Low-to-High Cable Fly','cable',['chest','front_delts'],[],['shoulder'],3,'12-15',60,['Set pulleys low, step forward','Raise hands up and together to chin height','Lower slowly with control'],'Isolation work for the upper chest.',['pec-deck-fly','cable-crossover','incline-dumbbell-press']),
  E('landmine-press','Landmine Press','barbell',['front_delts','chest'],['triceps','abs'],['wrist'],3,'8-12',75,['Hold the bar end at shoulder height, feet staggered','Press up and forward in an arc','Lower under control'],'A shoulder-friendly press angle for people who struggle with overhead work.',['dumbbell-shoulder-press','machine-shoulder-press','incline-push-up']),

  // ───────── BACK ─────────
  E('pull-up','Pull-Up','bodyweight',['lats'],['biceps','upper_back','forearms'],['shoulder','elbow'],3,'5-10',120,['Hang with an overhand grip slightly wider than shoulders','Pull until your chin clears the bar','Lower to a full hang'],'The standard test of upper body pulling strength and lat width.',['lat-pulldown','assisted-pull-up','chin-up']),
  E('chin-up','Chin-Up','bodyweight',['lats','biceps'],['upper_back','forearms'],['elbow','shoulder'],3,'5-10',120,['Hang with an underhand shoulder-width grip','Pull your chin over the bar','Lower to a full hang'],'Easier than pull-ups and hits the biceps harder.',['lat-pulldown','assisted-pull-up','close-grip-pulldown']),
  E('assisted-pull-up','Assisted Pull-Up','machine',['lats'],['biceps','upper_back'],['shoulder'],3,'8-12',90,['Kneel on the pad and grip the handles','Pull your chest toward the bar','Lower slowly to full stretch'],'Lets beginners build toward bodyweight pull-ups.',['lat-pulldown','close-grip-pulldown']),
  E('lat-pulldown','Lat Pulldown','cable',['lats'],['biceps','upper_back'],['shoulder'],3,'8-12',90,['Grip slightly wider than shoulders, chest up','Pull the bar to your upper chest','Return slowly to a full stretch'],'Builds back width and is easy to load for any level.',['close-grip-pulldown','assisted-pull-up','straight-arm-pulldown']),
  E('close-grip-pulldown','Close-Grip Pulldown','cable',['lats'],['biceps','upper_back'],[],3,'10-12',75,['Use a neutral close grip handle','Pull down toward your chest, elbows tucked','Control the return up'],'Neutral grip is easier on the shoulders and wrists.',['lat-pulldown','assisted-pull-up']),
  E('straight-arm-pulldown','Straight-Arm Pulldown','cable',['lats'],['abs'],[],3,'12-15',60,['Stand facing the cable, arms nearly straight','Sweep the bar down to your thighs','Return slowly keeping tension on the lats'],'Isolates the lats without the biceps taking over.',['lat-pulldown','close-grip-pulldown']),
  E('barbell-row','Barbell Row','barbell',['lats','upper_back'],['biceps','rear_delts','lower_back'],['lower_back'],4,'6-10',120,['Hinge forward with a flat back','Pull the bar to your lower ribs','Lower under control'],'A top mass builder for the whole back.',['chest-supported-row','seated-cable-row','dumbbell-row'],'Keep the torso still. Do not jerk the weight up.'),
  E('dumbbell-row','One-Arm Dumbbell Row','dumbbell',['lats','upper_back'],['biceps','rear_delts'],[],3,'8-12',75,['Support one hand and knee on a bench','Pull the dumbbell to your hip','Lower to a full stretch'],'Trains each side separately and fixes imbalances.',['seated-cable-row','chest-supported-row','machine-row']),
  E('seated-cable-row','Seated Cable Row','cable',['upper_back','lats'],['biceps','rear_delts'],[],3,'10-12',75,['Sit tall with a slight knee bend','Pull the handle to your stomach, squeezing shoulder blades','Return slowly without rounding forward'],'A steady, low-risk way to build mid-back thickness.',['machine-row','chest-supported-row','dumbbell-row']),
  E('chest-supported-row','Chest-Supported Row','machine',['upper_back','lats'],['biceps','rear_delts'],[],3,'8-12',75,['Lie chest down on the pad','Pull the handles toward your hips','Lower to a full stretch'],'Removes lower back strain so you can focus on the back muscles.',['seated-cable-row','machine-row','dumbbell-row']),
  E('t-bar-row','T-Bar Row','barbell',['upper_back','lats'],['biceps','lower_back','rear_delts'],['lower_back'],3,'8-10',90,['Straddle the bar with a flat back','Pull the weight to your chest','Lower under control'],'Heavy rowing variation for back thickness.',['chest-supported-row','seated-cable-row','machine-row']),
  E('machine-row','Machine Row','machine',['upper_back','lats'],['biceps','rear_delts'],[],3,'10-12',75,['Chest against the pad, grip the handles','Pull elbows back and squeeze','Return slowly'],'Simple and safe for beginners.',['seated-cable-row','chest-supported-row']),
  E('inverted-row','Inverted Row','bodyweight',['upper_back','lats'],['biceps','rear_delts','abs'],[],3,'8-15',75,['Lie under a bar, body straight, heels on the floor','Pull your chest to the bar','Lower with control'],'No machine needed. Scale difficulty by changing bar height.',['seated-cable-row','dumbbell-row','machine-row']),
  E('conventional-deadlift','Conventional Deadlift','barbell',['hamstrings','glutes','lower_back'],['quads','upper_back','traps','forearms'],['lower_back','knee','hip'],3,'3-6',180,['Bar over mid-foot, flat back, chest up','Push the floor away and stand tall','Hinge back and lower the bar with control'],'The strongest full-body lift for posterior chain strength.',['trap-bar-deadlift','romanian-deadlift','hip-thrust'],'Advanced lifters only. Keep your back flat throughout.'),
  E('rack-pull','Rack Pull','barbell',['upper_back','traps','glutes'],['hamstrings','lower_back','forearms'],['lower_back'],3,'5-8',150,['Set the bar at knee height in a rack','Pull up by driving hips forward','Lower under control'],'Overloads the upper back with less range than a full deadlift.',['barbell-row','seated-cable-row','trap-bar-deadlift']),
  E('back-extension','Back Extension','bodyweight',['lower_back'],['glutes','hamstrings'],['lower_back'],3,'10-15',60,['Hips on the pad, ankles secured','Lower your torso with a flat back','Raise until your body is in a straight line'],'Strengthens the lower back and glutes.',['bird-dog','glute-bridge','hip-thrust']),
  E('face-pull','Face Pull','cable',['rear_delts','upper_back'],['traps'],[],3,'12-20',45,['Set the rope at face height','Pull toward your face, elbows high and wide','Control the return'],'Keeps shoulders healthy and fixes slouched posture.',['reverse-pec-deck','rear-delt-fly','dumbbell-row']),

  // ───────── SHOULDERS & TRAPS ─────────
  E('barbell-overhead-press','Barbell Overhead Press','barbell',['front_delts','side_delts'],['triceps','traps','abs'],['shoulder','lower_back','wrist'],3,'5-8',120,['Bar at collarbone, glutes and abs tight','Press straight overhead, head moving through','Lower back to the collarbone'],'The classic strength builder for the shoulders.',['dumbbell-shoulder-press','machine-shoulder-press','landmine-press']),
  E('dumbbell-shoulder-press','Dumbbell Shoulder Press','dumbbell',['front_delts','side_delts'],['triceps'],['shoulder'],3,'8-12',90,['Sit with back supported, dumbbells at shoulders','Press up until arms are nearly straight','Lower under control'],'Free-moving press that builds shoulder size.',['machine-shoulder-press','landmine-press','arnold-press']),
  E('machine-shoulder-press','Machine Shoulder Press','machine',['front_delts','side_delts'],['triceps'],[],3,'10-12',75,['Adjust the seat so handles are at shoulder height','Press up without locking out','Lower slowly'],'A stable press that is safe for beginners.',['dumbbell-shoulder-press','landmine-press']),
  E('arnold-press','Arnold Press','dumbbell',['front_delts','side_delts'],['triceps'],['shoulder'],3,'8-12',90,['Start with palms facing you at chest height','Rotate palms outward as you press up','Reverse the motion on the way down'],'Works the shoulders through a longer range of motion.',['dumbbell-shoulder-press','machine-shoulder-press']),
  E('dumbbell-lateral-raise','Dumbbell Lateral Raise','dumbbell',['side_delts'],['traps'],['shoulder'],3,'12-20',45,['Stand with a slight elbow bend','Raise arms out to shoulder height','Lower slowly. Do not swing'],'The main builder of shoulder width.',['cable-lateral-raise','machine-lateral-raise'],'Use light weight and strict form.'),
  E('cable-lateral-raise','Cable Lateral Raise','cable',['side_delts'],[],['shoulder'],3,'12-20',45,['Stand side-on to a low pulley','Raise your arm out to shoulder height','Lower under control'],'Constant tension through the whole movement.',['dumbbell-lateral-raise','machine-lateral-raise']),
  E('machine-lateral-raise','Machine Lateral Raise','machine',['side_delts'],[],[],3,'12-15',45,['Sit with arms against the pads','Raise arms out to the sides','Lower slowly'],'Easy to learn and hard to cheat on.',['dumbbell-lateral-raise','cable-lateral-raise']),
  E('front-raise','Front Raise','dumbbell',['front_delts'],['chest'],['shoulder'],2,'10-15',45,['Hold dumbbells in front of your thighs','Raise one or both to shoulder height','Lower slowly'],'Adds front shoulder volume if pressing is not enough.',['dumbbell-shoulder-press','landmine-press']),
  E('rear-delt-fly','Rear Delt Fly','dumbbell',['rear_delts'],['upper_back'],[],3,'12-20',45,['Hinge forward with a flat back','Raise arms out to the sides, squeezing the rear shoulders','Lower slowly'],'Balances the shoulders and helps posture.',['reverse-pec-deck','face-pull']),
  E('reverse-pec-deck','Reverse Pec Deck','machine',['rear_delts'],['upper_back','traps'],[],3,'12-20',45,['Sit facing the pad, arms straight','Pull the handles back and out','Return slowly'],'Easy way to build the rear delts.',['rear-delt-fly','face-pull']),
  E('barbell-shrug','Barbell Shrug','barbell',['traps'],['forearms'],[],3,'8-12',60,['Hold the bar at thigh level','Shrug straight up toward your ears','Lower slowly. Do not roll the shoulders'],'Builds upper trap size.',['dumbbell-shrug','face-pull']),
  E('dumbbell-shrug','Dumbbell Shrug','dumbbell',['traps'],['forearms'],[],3,'10-15',60,['Hold dumbbells at your sides','Shrug straight up and pause','Lower slowly'],'Simple trap builder with a natural arm path.',['barbell-shrug','face-pull']),
  E('upright-row','Upright Row','barbell',['side_delts','traps'],['biceps'],['shoulder','wrist'],3,'10-12',60,['Hold the bar with a shoulder-width grip','Pull to chest height, elbows leading','Lower under control'],'Builds the side delts and traps, but can irritate the shoulders.',['dumbbell-lateral-raise','dumbbell-shrug']),
  E('pike-push-up','Pike Push-Up','bodyweight',['front_delts','side_delts'],['triceps','chest'],['wrist','shoulder'],3,'6-12',60,['Hips high in an inverted V','Lower your head toward the floor','Push back up'],'A bodyweight shoulder press for home or travel.',['dumbbell-shoulder-press','machine-shoulder-press']),

  // ───────── BICEPS & FOREARMS ─────────
  E('barbell-curl','Barbell Curl','barbell',['biceps'],['forearms'],['wrist','elbow'],3,'8-12',60,['Stand tall with an underhand grip','Curl up without swinging','Lower slowly'],'Heavy loading for biceps size.',['dumbbell-curl','cable-curl','hammer-curl']),
  E('dumbbell-curl','Dumbbell Curl','dumbbell',['biceps'],['forearms'],['elbow'],3,'10-12',60,['Hold dumbbells at your sides, palms forward','Curl up and turn the palms up at the top','Lower under control'],'Simple and joint-friendly biceps work.',['cable-curl','hammer-curl','barbell-curl']),
  E('hammer-curl','Hammer Curl','dumbbell',['biceps','forearms'],[],[],3,'10-12',60,['Hold dumbbells with palms facing in','Curl up keeping the grip neutral','Lower slowly'],'Builds the brachialis and forearms for thicker-looking arms.',['dumbbell-curl','cable-curl']),
  E('incline-dumbbell-curl','Incline Dumbbell Curl','dumbbell',['biceps'],[],['shoulder'],3,'10-12',60,['Lie back on a 45 degree bench, arms hanging','Curl up without moving the upper arm','Lower to full stretch'],'Stretched position hits the long head of the biceps.',['dumbbell-curl','preacher-curl']),
  E('preacher-curl','Preacher Curl','barbell',['biceps'],[],['elbow'],3,'10-12',60,['Rest your upper arms on the pad','Curl up to the top','Lower slowly to near full extension'],'Prevents cheating so the biceps do the work.',['cable-curl','concentration-curl','dumbbell-curl']),
  E('cable-curl','Cable Curl','cable',['biceps'],['forearms'],[],3,'10-15',60,['Stand facing a low pulley','Curl the bar up, elbows pinned','Lower slowly'],'Constant tension through the entire rep.',['dumbbell-curl','hammer-curl']),
  E('concentration-curl','Concentration Curl','dumbbell',['biceps'],[],[],2,'10-15',45,['Sit with your elbow braced on your inner thigh','Curl up and squeeze','Lower slowly'],'Strict, one-arm biceps isolation.',['dumbbell-curl','preacher-curl']),
  E('reverse-curl','Reverse Curl','barbell',['forearms','biceps'],[],['wrist'],2,'10-15',45,['Hold the bar with an overhand grip','Curl up with wrists straight','Lower slowly'],'Builds forearm and grip strength.',['hammer-curl','wrist-curl']),
  E('wrist-curl','Wrist Curl','dumbbell',['forearms'],[],['wrist'],2,'12-20',45,['Rest forearms on your thighs, palms up','Curl the weight up with your wrists','Lower slowly'],'Targeted forearm work for grip.',['reverse-curl','hammer-curl']),
  E('reverse-wrist-curl','Reverse Wrist Curl','dumbbell',['forearms'],[],['wrist'],2,'12-20',45,['Rest forearms on your thighs, palms down','Lift the back of your hand up','Lower slowly'],'Balances forearm strength and protects elbows.',['wrist-curl','reverse-curl']),

  // ───────── TRICEPS ─────────
  E('close-grip-bench-press','Close-Grip Bench Press','barbell',['triceps'],['chest','front_delts'],['wrist','elbow','shoulder'],3,'6-10',90,['Grip the bar at shoulder width','Lower to lower chest, elbows tucked','Press up'],'A heavy compound move for triceps strength.',['triceps-pushdown','diamond-push-up','chest-dip']),
  E('triceps-pushdown','Triceps Pushdown','cable',['triceps'],[],['elbow'],3,'10-15',60,['Elbows pinned to your sides','Push down until arms are straight','Return slowly to 90 degrees'],'Easy-to-load triceps builder.',['rope-pushdown','overhead-cable-extension','diamond-push-up']),
  E('rope-pushdown','Rope Pushdown','cable',['triceps'],[],[],3,'10-15',60,['Hold the rope with elbows at your sides','Push down and spread the rope at the bottom','Return slowly'],'Extra squeeze at the bottom of the rep.',['triceps-pushdown','overhead-cable-extension']),
  E('overhead-dumbbell-extension','Overhead Dumbbell Extension','dumbbell',['triceps'],[],['elbow','shoulder'],3,'10-12',60,['Hold one dumbbell overhead with both hands','Lower behind your head','Extend back up'],'Stretch position hits the long head of the triceps.',['overhead-cable-extension','triceps-pushdown']),
  E('overhead-cable-extension','Overhead Cable Extension','cable',['triceps'],[],['shoulder'],3,'10-15',60,['Face away from a low pulley, rope overhead','Extend your arms forward and up','Return slowly'],'Constant tension on the long head.',['overhead-dumbbell-extension','triceps-pushdown']),
  E('skull-crusher','Skull Crusher','barbell',['triceps'],[],['elbow','wrist'],3,'8-12',75,['Lie flat, bar over your chest','Lower toward your forehead, elbows fixed','Extend back up'],'Heavy triceps isolation.',['triceps-pushdown','overhead-dumbbell-extension']),
  E('bench-dip','Bench Dip','bodyweight',['triceps'],['chest','front_delts'],['shoulder','wrist','elbow'],3,'8-15',60,['Hands on a bench behind you, legs out','Lower until elbows hit 90 degrees','Press back up'],'Bodyweight triceps option.',['triceps-pushdown','diamond-push-up']),
  E('triceps-kickback','Triceps Kickback','dumbbell',['triceps'],[],[],2,'12-15',45,['Hinge forward, upper arm parallel to the floor','Extend your forearm back','Return slowly'],'Light finishing work for the triceps.',['triceps-pushdown','rope-pushdown']),
  E('diamond-push-up','Diamond Push-Up','bodyweight',['triceps'],['chest','front_delts'],['wrist','elbow','shoulder'],3,'8-15',60,['Hands close together under your chest','Lower your chest to your hands','Push back up'],'Bodyweight triceps focus.',['triceps-pushdown','close-grip-bench-press']),

  // ───────── QUADS ─────────
  E('barbell-back-squat','Barbell Back Squat','barbell',['quads','glutes'],['hamstrings','lower_back','abs'],['knee','lower_back','hip','ankle'],4,'5-8',150,['Bar on upper back, feet shoulder-width','Sit down and back until thighs are parallel','Drive through your feet to stand'],'The king of leg exercises for size and strength.',['leg-press','goblet-squat','hack-squat']),
  E('front-squat','Front Squat','barbell',['quads'],['glutes','abs','upper_back'],['knee','wrist','lower_back'],3,'5-8',150,['Bar rests on front shoulders, elbows high','Squat down keeping the torso upright','Stand up driving through your feet'],'Quad-dominant and demands a strong upright torso.',['goblet-squat','hack-squat','leg-press']),
  E('goblet-squat','Goblet Squat','dumbbell',['quads','glutes'],['abs'],['knee'],3,'10-15',75,['Hold a dumbbell at your chest','Squat down between your knees','Stand up tall'],'The best squat to learn good form.',['bodyweight-squat','leg-press','box-squat']),
  E('leg-press','Leg Press','machine',['quads','glutes'],['hamstrings'],['knee'],3,'10-15',90,['Feet shoulder-width on the platform','Lower until knees reach about 90 degrees','Press up without locking knees'],'Heavy leg work with no balance or back demands.',['hack-squat','goblet-squat','leg-extension']),
  E('hack-squat','Hack Squat','machine',['quads'],['glutes'],['knee'],3,'8-12',90,['Back flat on the pad, feet shoulder-width','Lower under control','Press up'],'Quad focus with a stable back.',['leg-press','goblet-squat','leg-extension']),
  E('leg-extension','Leg Extension','machine',['quads'],[],['knee'],3,'12-15',60,['Sit with the pad on your lower shins','Extend your legs fully','Lower slowly'],'Isolates the quads.',['leg-press','goblet-squat']),
  E('walking-lunge','Walking Lunge','dumbbell',['quads','glutes'],['hamstrings','abs'],['knee','ankle','hip'],3,'10-12',75,['Hold dumbbells at your sides','Step forward and lower the back knee','Push through the front foot to step into the next rep'],'Builds leg strength, balance and glutes.',['reverse-lunge','bulgarian-split-squat','leg-press']),
  E('reverse-lunge','Reverse Lunge','dumbbell',['quads','glutes'],['hamstrings'],['knee'],3,'10-12',75,['Step back and lower the back knee','Keep your torso upright','Drive through the front foot to return'],'Gentler on the knees than forward lunges.',['step-up','goblet-squat','leg-press']),
  E('bulgarian-split-squat','Bulgarian Split Squat','dumbbell',['quads','glutes'],['hamstrings'],['knee','hip','ankle'],3,'8-12',90,['Back foot elevated on a bench','Lower straight down','Drive through the front foot'],'Great single-leg builder for quads and glutes.',['reverse-lunge','step-up','leg-press']),
  E('step-up','Step-Up','dumbbell',['quads','glutes'],['hamstrings'],['knee'],3,'10-12',60,['Place one foot on a box or bench','Drive through that foot to stand','Lower under control'],'Simple unilateral leg strength.',['reverse-lunge','goblet-squat','leg-press']),
  E('smith-machine-squat','Smith Machine Squat','machine',['quads','glutes'],['hamstrings'],['knee','lower_back'],3,'8-12',90,['Bar on upper back, feet slightly forward','Squat down to parallel','Press up'],'Guided path that is easier to learn than a free squat.',['leg-press','hack-squat','goblet-squat']),
  E('bodyweight-squat','Bodyweight Squat','bodyweight',['quads','glutes'],['hamstrings'],['knee'],3,'12-20',45,['Feet shoulder-width, chest up','Sit down and back','Stand up'],'A starting point for complete beginners.',['goblet-squat','leg-press','step-up']),
  E('box-squat','Box Squat','barbell',['quads','glutes'],['hamstrings','lower_back'],['knee','lower_back'],3,'6-10',120,['Squat back to a box at parallel','Pause briefly without relaxing','Drive up'],'Teaches depth and control under load.',['goblet-squat','leg-press','hack-squat']),

  // ───────── HAMSTRINGS & GLUTES ─────────
  E('romanian-deadlift','Romanian Deadlift','barbell',['hamstrings','glutes'],['lower_back','forearms'],['lower_back','hip'],3,'8-10',120,['Soft knees, bar close to your legs','Push hips back until you feel a hamstring stretch','Drive hips forward to stand'],'The best hamstring and glute builder for the hip hinge.',['dumbbell-romanian-deadlift','lying-leg-curl','hip-thrust']),
  E('dumbbell-romanian-deadlift','Dumbbell Romanian Deadlift','dumbbell',['hamstrings','glutes'],['lower_back'],['lower_back'],3,'10-12',90,['Hold dumbbells in front of your thighs','Hinge back with a flat back','Stand up squeezing the glutes'],'Easier to learn than the barbell version.',['lying-leg-curl','hip-thrust','cable-pull-through']),
  E('lying-leg-curl','Lying Leg Curl','machine',['hamstrings'],['calves'],['knee'],3,'10-15',60,['Lie face down, pad on the back of your ankles','Curl your heels toward your glutes','Lower slowly'],'Direct hamstring isolation.',['seated-leg-curl','dumbbell-romanian-deadlift']),
  E('seated-leg-curl','Seated Leg Curl','machine',['hamstrings'],['calves'],['knee'],3,'10-15',60,['Sit with the pad above your heels','Curl legs back under the seat','Return slowly'],'Stretched hamstring position for more growth.',['lying-leg-curl','dumbbell-romanian-deadlift']),
  E('good-morning','Good Morning','barbell',['hamstrings','lower_back'],['glutes'],['lower_back'],3,'8-12',90,['Bar on upper back, soft knees','Hinge forward with a flat back','Stand back up'],'Strengthens the hamstrings and lower back.',['romanian-deadlift','back-extension','cable-pull-through']),
  E('hip-thrust','Hip Thrust','barbell',['glutes'],['hamstrings','quads'],['hip','lower_back'],3,'8-12',90,['Upper back on a bench, bar over your hips','Drive hips up until your body is level','Lower under control'],'The most direct glute builder.',['glute-bridge','single-leg-glute-bridge','cable-pull-through']),
  E('glute-bridge','Glute Bridge','bodyweight',['glutes'],['hamstrings'],[],3,'12-20',45,['Lie on your back, knees bent','Drive hips up and squeeze','Lower slowly'],'Easy glute activation for beginners or sore backs.',['single-leg-glute-bridge','hip-thrust']),
  E('single-leg-glute-bridge','Single-Leg Glute Bridge','bodyweight',['glutes'],['hamstrings'],[],3,'10-15',45,['Lie on your back with one foot planted','Drive that hip up','Lower slowly'],'Harder glute work with no equipment.',['glute-bridge','hip-thrust']),
  E('cable-kickback','Cable Glute Kickback','cable',['glutes'],['hamstrings'],[],3,'12-15',45,['Ankle cuff on a low pulley','Kick your leg straight back','Return slowly without arching your back'],'Glute isolation.',['hip-abduction-machine','glute-bridge']),
  E('hip-abduction-machine','Hip Abduction Machine','machine',['glutes'],[],['hip'],3,'12-20',45,['Sit with pads outside your knees','Push your legs apart','Return slowly'],'Targets the outer glutes.',['cable-kickback','glute-bridge']),
  E('sumo-deadlift','Sumo Deadlift','barbell',['glutes','quads','hamstrings'],['lower_back','forearms','upper_back'],['lower_back','hip','knee'],3,'4-6',150,['Wide stance, toes out, grip inside the knees','Push the floor apart and stand tall','Lower under control'],'Wide-stance pull that hits glutes and inner legs.',['romanian-deadlift','hip-thrust','leg-press']),
  E('kettlebell-swing','Kettlebell Swing','kettlebell',['glutes','hamstrings'],['lower_back','abs','front_delts'],['lower_back'],3,'12-20',60,['Hinge back and hike the bell between your legs','Snap your hips forward to swing it to chest height','Let it fall and hinge again'],'Builds power and conditioning at the same time.',['cable-pull-through','hip-thrust','dumbbell-romanian-deadlift']),
  E('cable-pull-through','Cable Pull-Through','cable',['glutes','hamstrings'],['lower_back'],[],3,'10-15',60,['Face away from a low pulley, rope between your legs','Hinge back with a flat back','Drive hips forward to stand'],'A safe way to learn the hip hinge.',['dumbbell-romanian-deadlift','hip-thrust','glute-bridge']),
  E('trap-bar-deadlift','Trap Bar Deadlift','barbell',['quads','glutes','hamstrings'],['lower_back','traps','forearms'],['lower_back','knee','hip'],3,'5-8',150,['Stand inside the bar, grip the handles','Push the floor away and stand tall','Lower under control'],'Easier on the back than a straight bar deadlift.',['romanian-deadlift','leg-press','hip-thrust']),

  // ───────── CALVES ─────────
  E('standing-calf-raise','Standing Calf Raise','machine',['calves'],[],['ankle'],3,'10-15',45,['Balls of feet on the platform','Rise as high as you can and pause','Lower to a full stretch'],'Builds the big calf muscle (gastrocnemius).',['leg-press-calf-raise','single-leg-calf-raise']),
  E('seated-calf-raise','Seated Calf Raise','machine',['calves'],[],['ankle'],3,'12-20',45,['Pad on your lower thighs','Rise onto your toes and pause','Lower to a full stretch'],'Targets the deeper soleus calf muscle.',['standing-calf-raise','leg-press-calf-raise']),
  E('leg-press-calf-raise','Leg Press Calf Raise','machine',['calves'],[],['ankle'],3,'12-20',45,['Balls of feet on the bottom of the platform','Press up through your toes','Lower to a full stretch'],'Heavy calf work without a dedicated machine.',['standing-calf-raise','seated-calf-raise']),
  E('single-leg-calf-raise','Single-Leg Calf Raise','bodyweight',['calves'],[],['ankle'],3,'12-20',45,['Stand on one foot on a step edge','Rise onto your toes','Lower to a full stretch'],'Bodyweight calf work for home training.',['standing-calf-raise','leg-press-calf-raise']),

  // ───────── CORE ─────────
  E('plank','Plank','bodyweight',['abs'],['obliques','lower_back'],['wrist','shoulder'],3,'30-60s',45,['Forearms on the floor, body in a straight line','Brace your abs and squeeze your glutes','Hold without sagging'],'Core stability builder.',['dead-bug','bird-dog','pallof-press']),
  E('side-plank','Side Plank','bodyweight',['obliques'],['abs','glutes'],['shoulder','wrist'],3,'20-45s',45,['Lie on your side, forearm under your shoulder','Lift your hips into a straight line','Hold without dropping'],'Strengthens the sides of the core.',['pallof-press','plank']),
  E('hanging-leg-raise','Hanging Leg Raise','bodyweight',['abs'],['obliques','forearms'],['shoulder','lower_back'],3,'8-15',60,['Hang from a bar, body still','Raise your legs to hip height or above','Lower slowly'],'A strong lower ab exercise.',['hanging-knee-raise','reverse-crunch','cable-crunch']),
  E('hanging-knee-raise','Hanging Knee Raise','bodyweight',['abs'],['forearms'],['shoulder'],3,'10-15',60,['Hang from a bar','Bring knees up toward your chest','Lower slowly'],'Easier version of the leg raise.',['reverse-crunch','hanging-leg-raise','cable-crunch']),
  E('cable-crunch','Cable Crunch','cable',['abs'],['obliques'],[],3,'10-15',60,['Kneel facing a high pulley, rope by your head','Crunch your elbows toward your knees','Return slowly'],'Lets you load the abs progressively.',['crunch','reverse-crunch','decline-sit-up']),
  E('crunch','Crunch','bodyweight',['abs'],[],[],3,'15-25',45,['Lie on your back, knees bent','Curl your shoulders off the floor','Lower slowly'],'Basic ab exercise.',['reverse-crunch','bicycle-crunch','dead-bug']),
  E('russian-twist','Russian Twist','bodyweight',['obliques'],['abs'],['lower_back'],3,'15-30',45,['Sit leaning back with feet raised or down','Rotate your torso side to side','Keep the chest tall'],'Trains rotation through the obliques.',['bicycle-crunch','woodchopper','pallof-press']),
  E('ab-wheel-rollout','Ab Wheel Rollout','bodyweight',['abs'],['lower_back','lats','front_delts'],['lower_back','shoulder','wrist'],3,'6-12',60,['Kneel with the wheel under your shoulders','Roll out with a braced core','Pull back using your abs'],'Hard, full-core strength work.',['plank','dead-bug','cable-crunch'],'Advanced. Stop if your lower back sags.'),
  E('dead-bug','Dead Bug','bodyweight',['abs'],['obliques'],[],3,'8-12',45,['Lie on your back, arms up, knees at 90 degrees','Lower opposite arm and leg while keeping your back flat','Return and switch sides'],'Safe core control for beginners.',['bird-dog','plank','crunch']),
  E('bird-dog','Bird Dog','bodyweight',['lower_back'],['glutes','abs'],['wrist'],3,'8-12',45,['Start on hands and knees','Extend opposite arm and leg','Hold briefly, return and switch'],'Builds back and core stability with low stress.',['dead-bug','back-extension','plank']),
  E('bicycle-crunch','Bicycle Crunch','bodyweight',['abs','obliques'],[],[],3,'15-30',45,['Lie on your back, hands by your head','Bring opposite elbow to knee while extending the other leg','Alternate sides with control'],'Works the abs and obliques together.',['crunch','russian-twist']),
  E('pallof-press','Pallof Press','cable',['obliques'],['abs'],[],3,'10-12',45,['Stand side-on to a cable at chest height','Press the handle straight out and hold','Resist the pull and return'],'Anti-rotation core strength.',['side-plank','plank','woodchopper']),
  E('woodchopper','Cable Woodchopper','cable',['obliques'],['abs','front_delts'],['lower_back'],3,'10-12',45,['Start with the cable high on one side','Pull diagonally down across your body','Return with control'],'Builds rotational core power.',['pallof-press','russian-twist']),
  E('mountain-climber','Mountain Climber','bodyweight',['abs'],['front_delts','quads'],['wrist','shoulder'],3,'20-40s',30,['Start in a high plank','Drive knees toward your chest alternately','Keep hips low and steady'],'Core work that also raises your heart rate.',['plank','dead-bug','crunch']),
  E('reverse-crunch','Reverse Crunch','bodyweight',['abs'],[],[],3,'12-20',45,['Lie on your back, knees bent','Curl your hips off the floor toward your chest','Lower slowly'],'Targets the lower abs with little neck strain.',['crunch','hanging-knee-raise']),
  E('decline-sit-up','Decline Sit-Up','bodyweight',['abs'],['quads'],['lower_back','neck'],3,'10-15',60,['Hook feet under the pad on a decline bench','Curl up with your arms crossed','Lower slowly'],'Weighted ab work as you progress.',['cable-crunch','crunch']),

  // ───────── CARRIES & CONDITIONING ─────────
  E('farmers-carry','Farmer\'s Carry','dumbbell',['forearms','traps'],['abs','obliques','glutes'],['lower_back'],3,'30-40m',60,['Pick up heavy dumbbells at your sides','Walk tall with tight abs','Set them down under control'],'Builds grip and total-body stability.',['dumbbell-shrug','plank','wrist-curl']),
  E('burpee','Burpee','bodyweight',['quads','chest'],['abs','front_delts','triceps'],['wrist','knee','lower_back'],3,'8-15',60,['Drop into a squat and kick back to a plank','Do a push-up, then jump feet in','Jump up with arms overhead'],'High-calorie conditioning with no equipment.',['mountain-climber','kettlebell-swing','push-up']),
  E('dumbbell-thruster','Dumbbell Thruster','dumbbell',['quads','front_delts'],['glutes','triceps','abs'],['knee','shoulder'],3,'8-12',75,['Hold dumbbells at your shoulders','Squat down, then drive up and press overhead','Lower to your shoulders and repeat'],'Full-body strength and conditioning in one move.',['goblet-squat','dumbbell-shoulder-press','kettlebell-swing']),
];

// ───────── HELPERS ─────────
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
