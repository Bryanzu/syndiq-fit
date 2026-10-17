export type SyndiqEquipmentId =
  // Free weights
  | 'barbell'
  | 'dumbbells'
  | 'kettlebells'
  | 'weight_plates'
  | 'ez_bar'
  | 'medicine_ball'
  // Benches and racks
  | 'flat_bench'
  | 'adjustable_bench'
  | 'decline_bench'
  | 'squat_rack'
  | 'power_rack'
  | 'smith_machine'
  // Resistance machines
  | 'chest_press_machine'
  | 'incline_chest_press_machine'
  | 'shoulder_press_machine'
  | 'lat_pulldown_machine'
  | 'seated_row_machine'
  | 'pec_deck_machine'
  | 'leg_press_machine'
  | 'hack_squat_machine'
  | 'leg_extension_machine'
  | 'leg_curl_machine'
  | 'calf_raise_machine'
  | 'assisted_pullup_dip_machine'
  | 'hip_abduction_machine'
  // Cable equipment
  | 'cable_crossover_machine'
  | 'adjustable_cable_column'
  // Bodyweight and functional
  | 'pull_up_bar'
  | 'dip_station'
  | 'resistance_bands'
  | 'suspension_trainer'
  | 'yoga_mat'
  | 'plyo_box'
  | 'ab_wheel'
  // Cardio equipment
  | 'treadmill'
  | 'stationary_bike'
  | 'rowing_machine'
  | 'elliptical'
  | 'jump_rope'
  | 'stair_climber'
  // Legacy aliases for backward compatibility with previous selections
  | 'kettlebell'
  | 'flat_bench_press'
  | 'abdominal_bench'
  | 'adjustable_bench_press_machine'
  | 'leg_press_hack_squat'
  | 'leg_extension_curl'
  | 'single_cable_crossover'
  | 'skip_rope';

export type EquipmentCategory =
  | 'free_weights'
  | 'benches_racks'
  | 'machines'
  | 'cables'
  | 'bodyweight_functional'
  | 'cardio';

export interface EquipmentItem {
  id: SyndiqEquipmentId;
  name: string;
  category: EquipmentCategory;
  description: string;
  aliases: string[];
  iconType: string;
  isStandardGym?: boolean;
}


