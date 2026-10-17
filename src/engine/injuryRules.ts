import { Exercise, InjuryArea } from '@/types/workout';
import { SyndiqEquipmentId } from '@/types/equipment';
import { isExerciseAvailable } from './equipmentFilter';

export function isContraindicated(
  exercise: Exercise,
  userInjuries: InjuryArea[]
): boolean {
  if (!userInjuries || userInjuries.length === 0 || userInjuries.includes('none')) {
    return false;
  }
  return exercise.contraindications.some((injury) => userInjuries.includes(injury));
}

export function getInjurySubstitutionReason(
  exercise: Exercise,
  userInjuries: InjuryArea[]
): string {
  const matching = exercise.contraindications.filter((c) => userInjuries.includes(c));
  if (matching.length === 0) return 'General form adaptation';

  const readableInjuries = matching
    .map((m) => m.replace('_', ' '))
    .join(' & ');

  return `Adapted for ${readableInjuries} joint comfort`;
}

export function findSafeAlternative(
  exercise: Exercise,
  userInjuries: InjuryArea[],
  availableEquipment: SyndiqEquipmentId[],
  exerciseLookup: (id: string) => Exercise | undefined
): Exercise | undefined {
  for (const altId of exercise.alternatives) {
    const candidate = exerciseLookup(altId);
    if (!candidate) continue;

    const safe = !isContraindicated(candidate, userInjuries);
    const available = isExerciseAvailable(candidate, availableEquipment);

    if (safe && available) {
      return candidate;
    }
  }
  return undefined;
}
