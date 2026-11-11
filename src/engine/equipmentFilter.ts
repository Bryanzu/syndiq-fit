import { Exercise } from '@/types/workout';
import { SyndiqEquipmentId } from '@/types/equipment';

/**
 * Checks whether the user's selected equipment configuration represents Strict Bodyweight Only.
 * True when no equipment is selected or only pure bodyweight markers (e.g. yoga mat / bodyweight_only) are present.
 */
export function isBodyweightOnlyEquipment(availableEquipment: SyndiqEquipmentId[]): boolean {
  if (!availableEquipment || availableEquipment.length === 0) {
    return true;
  }
  const nonBodyweightItems = availableEquipment.filter(
    (item) =>
      item !== 'bodyweight' &&
      item !== 'bodyweight_only' &&
      item !== 'yoga_mat'
  );
  return nonBodyweightItems.length === 0;
}

/**
 * Normalizes user equipment IDs to include equivalent and legacy identifiers.
 */
export function normalizeEquipmentSet(availableEquipment: SyndiqEquipmentId[]): Set<string> {
  const normalized = new Set<string>();

  for (const item of availableEquipment) {
    normalized.add(item);

    // Legacy and composite mapping
    if (item === 'flat_bench_press') {
      normalized.add('flat_bench');
      normalized.add('barbell');
      normalized.add('weight_plates');
    }
    if (item === 'abdominal_bench') {
      normalized.add('decline_bench');
    }
    if (item === 'adjustable_bench_press_machine') {
      normalized.add('chest_press_machine');
      normalized.add('incline_chest_press_machine');
    }
    if (item === 'leg_press_hack_squat') {
      normalized.add('leg_press_machine');
      normalized.add('hack_squat_machine');
    }
    if (item === 'leg_extension_curl') {
      normalized.add('leg_extension_machine');
      normalized.add('leg_curl_machine');
    }
    if (item === 'single_cable_crossover') {
      normalized.add('adjustable_cable_column');
      normalized.add('cable_crossover_machine');
    }
    if (item === 'skip_rope') {
      normalized.add('jump_rope');
    }
    if (item === 'kettlebell') {
      normalized.add('kettlebells');
    }
    // Barbell implies weight plates in standard context
    if (item === 'barbell') {
      normalized.add('weight_plates');
    }
    // Power rack provides squat rack functionality
    if (item === 'power_rack') {
      normalized.add('squat_rack');
    }
    // Dual cable crossover provides single cable column functionality
    if (item === 'cable_crossover_machine') {
      normalized.add('adjustable_cable_column');
    }
  }

  return normalized;
}

/**
 * Validates whether an exercise can realistically and strictly be performed with the user's selected equipment.
 * In Strict Bodyweight Only mode, EVERY exercise must be strictly equipment-free.
 */
export function isExerciseAvailable(
  exercise: Exercise,
  availableEquipment: SyndiqEquipmentId[]
): boolean {
  // STRICT BODYWEIGHT ONLY MODE:
  // When user has no equipment or bodyweight only, ONLY exercises marked isStrictBodyweight qualify.
  // Absolutely no dumbbells, barbells, pull-up bars, dip bars, bands, cables, machines, or benches.
  if (isBodyweightOnlyEquipment(availableEquipment)) {
    return Boolean(exercise.isStrictBodyweight);
  }

  // Pure equipment-free exercises can be performed in any gym or home setup
  if (exercise.isStrictBodyweight) {
    return true;
  }

  const equip = normalizeEquipmentSet(availableEquipment);
  const id = exercise.id;

  // 1. SPECIFIC MACHINE EXERCISES
  switch (id) {
    case 'machine-chest-press':
      return equip.has('chest_press_machine') || equip.has('incline_chest_press_machine');
    case 'machine-shoulder-press':
      return equip.has('shoulder_press_machine');
    case 'lat-pulldown':
    case 'close-grip-pulldown':
    case 'straight-arm-pulldown':
      return equip.has('lat_pulldown_machine') || equip.has('adjustable_cable_column');
    case 'seated-cable-row':
      return equip.has('seated_row_machine') || equip.has('adjustable_cable_column');
    case 'machine-row':
    case 'chest-supported-row':
      return equip.has('seated_row_machine') || (equip.has('dumbbells') && (equip.has('adjustable_bench') || equip.has('flat_bench')));
    case 'pec-deck-fly':
    case 'reverse-pec-deck':
      return equip.has('pec_deck_machine') || equip.has('cable_crossover_machine');
    case 'leg-press':
      return equip.has('leg_press_machine');
    case 'hack-squat':
      return equip.has('hack_squat_machine');
    case 'leg-extension':
      return equip.has('leg_extension_machine');
    case 'lying-leg-curl':
    case 'seated-leg-curl':
      return equip.has('leg_curl_machine');
    case 'standing-calf-raise':
    case 'seated-calf-raise':
      return equip.has('calf_raise_machine') || equip.has('dumbbells');
    case 'leg-press-calf-raise':
      return equip.has('leg_press_machine');
    case 'assisted-pull-up':
      return equip.has('assisted_pullup_dip_machine') || (equip.has('pull_up_bar') && equip.has('resistance_bands'));
    case 'hip-abduction-machine':
      return equip.has('hip_abduction_machine') || equip.has('resistance_bands');
    case 'smith-machine-squat':
      return equip.has('smith_machine');
    case 't-bar-row':
      return equip.has('barbell') || equip.has('seated_row_machine');
    case 'machine-lateral-raise':
      return equip.has('adjustable_cable_column') || equip.has('dumbbells');
  }

  // 2. EXERCISE EQUIPMENT CATEGORY CHECK WITH ACCURATE CO-REQUIREMENTS
  switch (exercise.equipment) {
    case 'barbell': {
      if (!equip.has('barbell')) return false;

      // Heavy bench pressing requires a bench (flat or adjustable)
      if (id === 'barbell-bench-press' || id === 'close-grip-bench-press') {
        return (equip.has('flat_bench') || equip.has('adjustable_bench'));
      }
      if (id === 'incline-barbell-press') {
        return equip.has('adjustable_bench');
      }
      // Squats, good-mornings, and overhead presses require a rack to safely unrack
      if (
        id === 'barbell-back-squat' ||
        id === 'front-squat' ||
        id === 'box-squat' ||
        id === 'good-morning' ||
        id === 'barbell-overhead-press'
      ) {
        return equip.has('squat_rack') || equip.has('power_rack');
      }
      // Rack pull requires safety pins in a rack
      if (id === 'rack-pull') {
        return equip.has('squat_rack') || equip.has('power_rack');
      }
      // Hip thrust requires bench support
      if (id === 'hip-thrust') {
        return equip.has('flat_bench') || equip.has('adjustable_bench');
      }
      // Skull crusher requires a bench
      if (id === 'skull-crusher') {
        return equip.has('flat_bench') || equip.has('adjustable_bench');
      }
      // Deadlifts, rows, shrugs, and curls can be pulled from the floor
      return true;
    }

    case 'dumbbell': {
      if (!equip.has('dumbbells')) return false;

      // Incline movements require an adjustable incline bench
      if (id === 'incline-dumbbell-press' || id === 'incline-dumbbell-curl') {
        return equip.has('adjustable_bench');
      }
      // Flat bench movements require a flat or adjustable bench
      if (id === 'dumbbell-bench-press' || id === 'dumbbell-fly' || id === 'dumbbell-row') {
        return equip.has('flat_bench') || equip.has('adjustable_bench');
      }
      // Unilateral leg elevations require a bench or jump box
      if (id === 'bulgarian-split-squat' || id === 'dumbbell-bulgarian-split-squat' || id === 'step-up' || id === 'dumbbell-step-up') {
        return equip.has('flat_bench') || equip.has('adjustable_bench') || equip.has('plyo_box');
      }
      // Concentration curl requires any bench or seated surface
      if (id === 'concentration-curl') {
        return equip.has('flat_bench') || equip.has('adjustable_bench');
      }
      return true;
    }

    case 'kettlebell':
      return equip.has('kettlebells') || equip.has('dumbbells');

    case 'cable':
      return equip.has('adjustable_cable_column') || equip.has('cable_crossover_machine');

    case 'bodyweight': {
      // Pull-ups and hanging movements require a pull-up bar
      if (
        id === 'pull-up' ||
        id === 'chin-up' ||
        id === 'hanging-leg-raise' ||
        id === 'hanging-knee-raise'
      ) {
        return equip.has('pull_up_bar');
      }
      // Dips require a dip station or stable bench
      if (id === 'chest-dip') {
        return equip.has('dip_station') || equip.has('pull_up_bar');
      }
      if (id === 'bench-dip') {
        return equip.has('flat_bench') || equip.has('adjustable_bench');
      }
      // Inverted row requires low bar or smith machine
      if (id === 'inverted-row') {
        return equip.has('pull_up_bar') || equip.has('smith_machine') || equip.has('squat_rack');
      }
      // Decline sit-up requires decline bench
      if (id === 'decline-sit-up') {
        return equip.has('decline_bench');
      }
      // Ab wheel requires ab wheel or barbell
      if (id === 'ab-wheel-rollout') {
        return equip.has('ab_wheel') || equip.has('barbell');
      }
      // Resistance band exercises require resistance bands
      if (id.startsWith('band-')) {
        return equip.has('resistance_bands');
      }
      // If marked strict bodyweight, it is always available
      if (exercise.isStrictBodyweight) {
        return true;
      }
      return true;
    }

    case 'machine':
      // Generic machine check
      return false;

    default:
      return false;
  }
}

/**
 * Finds the highest-ranked alternative exercise whose equipment requirements are met.
 */
export function findBestEquipmentAlternative(
  exercise: Exercise,
  availableEquipment: SyndiqEquipmentId[],
  exerciseLookup: (id: string) => Exercise | undefined
): Exercise | undefined {
  for (const altId of exercise.alternatives) {
    const candidate = exerciseLookup(altId);
    if (candidate && isExerciseAvailable(candidate, availableEquipment)) {
      return candidate;
    }
  }
  return undefined;
}
