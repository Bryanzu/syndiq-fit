export function formatPortionFraction(multiplier: number): string {
  switch (multiplier) {
    case 0.75:
      return '¾ serving';
    case 1.0:
      return '1 serving';
    case 1.25:
      return '1¼ servings';
    case 1.5:
      return '1½ servings';
    default:
      return `${multiplier}x serving`;
  }
}

export function formatPortionLong(multiplier: number): string {
  switch (multiplier) {
    case 0.75:
      return '¾ of a serving (lighter meal)';
    case 1.0:
      return '1 standard reference serving';
    case 1.25:
      return '1 and ¼ servings (extra energy)';
    case 1.5:
      return '1 and ½ servings (high calorie/protein)';
    default:
      return `${multiplier}x reference serving`;
  }
}

// Practical default household measurements for popular Nigerian meals
export const PRACTICAL_MEAL_MEASUREMENTS: Record<string, string> = {
  jollof_chicken: '1 plate (approx. 1½ cups cooked rice + 1 chicken drumstick/thigh)',
  fried_rice_turkey: '1 plate (approx. 1½ cups cooked fried rice + 1 piece turkey)',
  white_rice_fish_stew: '1 plate (approx. 1½ cups cooked rice + 1 palm-sized titus steak in stew)',
  beans_plantain_egg: '1 cup cooked brown beans + 5–6 fried plantain slices + 1 boiled egg',
  yam_egg_sauce: '3 medium boiled yam slices + 2-egg tomato scramble',
  boiled_plantain_egg_sauce: '1 medium boiled plantain + 2-egg tomato sauce',
  egusi_eba_goat: '1 medium bowl (1 cooking spoon thick egusi + 1 wrap eba + 2 pieces goat meat)',
  ogbono_semo_titus: '1 medium bowl (1 cooking spoon ogbono + 1 wrap semovita + 1 piece titus)',
  edikaikong_fufu_beef: '1 plate (generous vegetable soup + 1 wrap fufu + 2 lean beef cuts)',
  okro_pounded_yam_fish: '1 bowl (fresh okro draw soup + 1 medium wrap pounded yam + 1 catfish cut)',
  titus_pepper_soup: '1 palm-sized piece fresh titus fish (~150g) with spiced pepper soup broth',
  catfish_yam_pepper_soup: '1 palm-sized catfish steak + 2 slices boiled yam in pepper soup',
  moin_moin_egg: '1 medium leaf wrap moin moin + 1 hard-boiled egg',
  akara_pap: '4 medium akara balls + 1 medium bowl hot pap (akamu/ogi)',
  oatmeal_milk_banana: '1 medium bowl cooked oats (~1 cup cooked) + 2 tbsp powdered milk + 1 banana',
  beans_garri_eggs: '1 cup soft brown beans + 2 tbsp soaked garri + 2 hard-boiled eggs',
  awara_pepper_sauce: '4 fried awara (soy cheese) cubes + pepper vegetable sauce',
  suya_cucumber: '2 beef suya skewers + 1 medium sliced cucumber',
  groundnuts_garden_egg: '1 small cupped handful roasted groundnuts + 2 garden eggs',
  roasted_corn_coconut: '1 medium cob roasted corn + 2–3 small coconut slices',
  fruit_salad_cashews: '1 small bowl fresh pawpaw/watermelon + 1 small handful cashews',
  peeled_boiled_eggs_cucumber: '2 whole hard-boiled eggs + 1 whole sliced cucumber',
};

export function getRecipePracticalMeasurement(recipeId: string): string | null {
  return PRACTICAL_MEAL_MEASUREMENTS[recipeId] || null;
}

export function getPortionExplanation(
  recipeId: string,
  recipeName: string,
  multiplier: number
): {
  summary: string;
  householdEstimate: string;
  cookedVsRaw: string;
  scaleFreeTip: string;
} {
  const baseMeasure = getRecipePracticalMeasurement(recipeId) || '1 standard home plate portion';
  const fractionText = formatPortionLong(multiplier);

  let scaleFreeTip =
    'Estimate carbs (rice, eba, yam) using your closed fist (~1 cup), and protein (meat, fish) using the palm of your hand without fingers (~120g–150g).';
  let cookedVsRaw = 'Portions are measured as cooked, ready-to-eat food on your plate, not dry raw grains.';

  if (recipeName.toLowerCase().includes('rice') || recipeName.toLowerCase().includes('beans')) {
    cookedVsRaw =
      'Rice and beans expand 2.5x to 3x in volume when boiled. This portion refers to cooked food on your plate.';
    scaleFreeTip =
      '1 cup cooked rice or beans is approximately the size of an adult fist. 1 piece of chicken is approximately the size of your palm.';
  } else if (
    recipeName.toLowerCase().includes('soup') ||
    recipeName.toLowerCase().includes('eba') ||
    recipeName.toLowerCase().includes('semo')
  ) {
    cookedVsRaw =
      'Swallow (eba, semo, fufu) density depends on water. Measure 1 standard palm-sized wrapped ball.';
    scaleFreeTip =
      'Use 1 standard kitchen cooking spoon for thick soup (egusi, ogbono) and a palm-sized wrap for your swallow.';
  } else if (recipeName.toLowerCase().includes('egg')) {
    cookedVsRaw = 'Whole eggs are counted by unit (each medium egg contains ~6g of complete protein).';
    scaleFreeTip = 'No scale needed — simply count whole eggs as indicated.';
  }

  return {
    summary: `This meal displays ${formatPortionFraction(
      multiplier
    )} (${fractionText}) of ${recipeName}.`,
    householdEstimate: `Reference (1.0x): ${baseMeasure}. At ${multiplier}x, multiply this amount accordingly.`,
    cookedVsRaw,
    scaleFreeTip,
  };
}
