import { NextResponse } from 'next/server';
import { generateWorkoutProgram } from '@/engine/programAssembler';
import { validateWorkoutProgram } from '@/engine/workoutValidator';
import { ALL_SYNDIQ_EQUIPMENT_IDS } from '@/data/equipment';
import { UserProfile } from '@/types/questionnaire';

export async function GET() {
  const testProfiles: Array<{ name: string; profile: UserProfile }> = [
    {
      name: 'Female Beginner Glute & Tone Focus (45 min)',
      profile: {
        gender: 'female',
        age: '21-30',
        experience: 'beginner',
        goal: 'glute_emphasis',
        frequency: 3,
        duration: 45,
        availableEquipment: ALL_SYNDIQ_EQUIPMENT_IDS,
        injuries: ['none'],
      },
    },
    {
      name: 'Male Senior with Knee & Lower Back Issues (45 min)',
      profile: {
        gender: 'male',
        age: '51-60',
        experience: 'beginner',
        goal: 'general_fitness',
        frequency: 3,
        duration: 45,
        availableEquipment: ALL_SYNDIQ_EQUIPMENT_IDS,
        injuries: ['knee', 'lower_back'],
      },
    },
    {
      name: 'Male Advanced Hypertrophy & Chest Emphasis (60 min)',
      profile: {
        gender: 'male',
        age: '31-40',
        experience: 'intermediate',
        goal: 'chest_emphasis',
        frequency: 4,
        duration: 60,
        availableEquipment: ALL_SYNDIQ_EQUIPMENT_IDS,
        injuries: ['none'],
      },
    },
    {
      name: 'Complete Beginner Express (30 min)',
      profile: {
        gender: 'female',
        age: '<=20',
        experience: 'complete_beginner',
        goal: 'fat_loss',
        frequency: 3,
        duration: 30,
        availableEquipment: ALL_SYNDIQ_EQUIPMENT_IDS,
        injuries: ['none'],
      },
    },
    {
      name: 'Senior 61+ Strength Preservation (60 min)',
      profile: {
        gender: 'male',
        age: '61+',
        experience: 'intermediate',
        goal: 'maintain_fitness',
        frequency: 3,
        duration: 60,
        availableEquipment: ALL_SYNDIQ_EQUIPMENT_IDS,
        injuries: ['lower_back'],
      },
    },
  ];

  const results = testProfiles.map((tp) => {
    const program = generateWorkoutProgram(tp.profile);
    const validation = validateWorkoutProgram(program);
    return {
      testName: tp.name,
      programName: program.name,
      totalDays: program.days.length,
      validationScore: validation.score,
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      metrics: validation.metrics,
      daysSample: program.days.map((d) => ({
        day: d.dayNumber,
        title: d.title,
        estimatedDuration: d.estimatedDuration,
        exercises: d.exercises.map((e) => ({
          name: e.exercise.name,
          sets: e.sets,
          reps: e.reps,
          rest: e.restSeconds,
          isSubstituted: e.isSubstituted,
          reason: e.substitutionReason,
        })),
      })),
    };
  });

  return NextResponse.json({
    allPassed: results.every((r) => r.isValid),
    results,
  });
}
