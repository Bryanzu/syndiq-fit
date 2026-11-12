'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Dumbbell, House, LayoutGrid, Mars, PersonStanding, Venus } from 'lucide-react';
import { ExperienceLevel, FitnessGoal, Gender, TrainingFrequency, WorkoutDuration } from '@/types/questionnaire';
import { InjuryArea } from '@/types/workout';
import { SyndiqEquipmentId } from '@/types/equipment';
import {
  DURATION_OPTIONS,
  EXPERIENCE_OPTIONS,
  FREQUENCY_OPTIONS,
  GOAL_OPTIONS,
  GoalItem,
  INJURY_OPTIONS,
} from '@/data/questionnaireOptions';
import { FlowTitle } from '@/components/flow/FlowShell';
import { Chip, ChipScroller, ChoiceRow, ChoiceTile, GroupLabel, Switch } from '@/components/flow/controls';
import { StopPicker, WheelPicker } from '@/components/flow/pickers';
import { AGE_MAX, AGE_MIN, SETUPS, SetupId, setupFor } from './profileHelpers';

export interface WorkoutAnswers {
  gender: Gender;
  ageYears: number;
  experience: ExperienceLevel;
  goal: FitnessGoal;
  /** Extra muscle focus, only *_emphasis goals */
  secondaryGoals: FitnessGoal[];
  frequency: TrainingFrequency;
  /** The last number of days picked, restored when "Pick for me" is switched off */
  lastDays: 2 | 3 | 4 | 5 | 6;
  duration: WorkoutDuration;
  equipment: SyndiqEquipmentId[];
  /** Never contains 'none'; an empty list means nothing hurts */
  injuries: InjuryArea[];
  injuryNotes: string;
}

export interface StepProps {
  answers: WorkoutAnswers;
  update: (patch: Partial<WorkoutAnswers>) => void;
  /** Move on by itself after a single-choice tap */
  autoNext: () => void;
}

const glassPanel = 'glass rounded-[40px]';

/* ------------------------------------------------------------------ */
export function SexStep({ answers, update, autoNext }: StepProps) {
  const options: { value: Gender; label: string; icon: React.ReactNode }[] = [
    { value: 'male', label: 'Male', icon: <Mars className="h-10 w-10" strokeWidth={2} /> },
    { value: 'female', label: 'Female', icon: <Venus className="h-10 w-10" strokeWidth={2} /> },
  ];
  return (
    <>
      <FlowTitle title="What's your sex?" sub="It shapes your starting volume and your body map." />
      <div role="radiogroup" aria-label="Sex" className="grid grid-cols-2 gap-4">
        {options.map((o) => (
          <ChoiceTile
            key={o.value}
            centered
            className="h-[212px]"
            selected={answers.gender === o.value}
            onSelect={() => {
              update({ gender: o.value });
              autoNext();
            }}
            label={o.label}
            icon={o.icon}
          />
        ))}
      </div>
      <p className="pt-6 text-center text-[13px] text-gym-textMuted">Eight quick questions. You can redo them any time.</p>
    </>
  );
}

/* ------------------------------------------------------------------ */
const AGES = Array.from({ length: AGE_MAX - AGE_MIN + 1 }, (_, i) => AGE_MIN + i);

export function AgeStep({ answers, update }: StepProps) {
  return (
    <>
      <FlowTitle title="How old are you?" sub="Recovery changes with age, so your plan does too." />
      <div className={`${glassPanel} py-6`}>
        <WheelPicker values={AGES} value={answers.ageYears} onChange={(v) => update({ ageYears: v })} label="Age" unit="years" />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
function LevelMeter({ level }: { level: number }) {
  return (
    <span aria-hidden className="flex h-6 items-end gap-[3px]">
      {[9, 14, 19, 24].map((h, i) => (
        <span key={h} className={`w-[5px] rounded-sm ${i <= level ? 'bg-gym-lime' : 'bg-white/30'}`} style={{ height: h }} />
      ))}
    </span>
  );
}

export function ExperienceStep({ answers, update, autoNext }: StepProps) {
  return (
    <>
      <FlowTitle title="How long have you been lifting?" sub="It decides how much work each session holds." />
      <div role="radiogroup" aria-label="Lifting experience" className="flex flex-col gap-2.5">
        {EXPERIENCE_OPTIONS.map((o, i) => (
          <ChoiceRow
            key={o.value}
            selected={answers.experience === o.value}
            onSelect={() => {
              update({ experience: o.value });
              autoNext();
            }}
            label={o.label}
            sub={o.description}
            leading={<LevelMeter level={i} />}
          />
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
const GOAL_CATEGORIES: { id: GoalItem['category']; label: string }[] = [
  { id: 'body_composition', label: 'Shape' },
  { id: 'strength', label: 'Strength' },
  { id: 'specific_emphasis', label: 'Muscle focus' },
  { id: 'general', label: 'General' },
];

/** Short chip names for the muscle-focus goals */
const FOCUS_CHIPS: { id: FitnessGoal; label: string }[] = [
  { id: 'chest_emphasis', label: 'Chest' },
  { id: 'back_emphasis', label: 'Back' },
  { id: 'shoulder_emphasis', label: 'Shoulders' },
  { id: 'arm_emphasis', label: 'Arms' },
  { id: 'leg_emphasis', label: 'Legs' },
  { id: 'glute_emphasis', label: 'Glutes' },
  { id: 'core_emphasis', label: 'Core' },
];
export const FOCUS_IDS = FOCUS_CHIPS.map((c) => c.id);

export function GoalStep({ answers, update }: StepProps) {
  const initialCategory = GOAL_OPTIONS.find((g) => g.id === answers.goal)?.category ?? 'body_composition';
  const [category, setCategory] = React.useState<GoalItem['category']>(initialCategory);
  const goals = GOAL_OPTIONS.filter((g) => g.category === category);
  const focus = FOCUS_CHIPS.filter((c) => c.id !== answers.goal);

  const pickGoal = (id: FitnessGoal) => update({ goal: id, secondaryGoals: answers.secondaryGoals.filter((g) => g !== id) });
  const toggleFocus = (id: FitnessGoal) =>
    update({
      secondaryGoals: answers.secondaryGoals.includes(id)
        ? answers.secondaryGoals.filter((g) => g !== id)
        : [...answers.secondaryGoals, id],
    });

  return (
    <>
      <FlowTitle title="What's the goal?" sub="Pick the one that matters most." />
      <ChipScroller label="Goal type" role="radiogroup">
        {GOAL_CATEGORIES.map((c) => (
          <Chip key={c.id} role="radio" variant="white" selected={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
          </Chip>
        ))}
      </ChipScroller>
      <motion.div
        key={category}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        role="radiogroup"
        aria-label="Goal"
        className="mt-4 flex flex-col gap-2"
      >
        {goals.map((g) => (
          <ChoiceRow key={g.id} selected={answers.goal === g.id} onSelect={() => pickGoal(g.id)} label={g.label} sub={g.description} />
        ))}
      </motion.div>
      <div className="pt-7">
        <GroupLabel>Add a second focus (optional)</GroupLabel>
        <ChipScroller label="Second focus">
          {focus.map((c) => (
            <Chip key={c.id} variant="outline" selected={answers.secondaryGoals.includes(c.id)} onClick={() => toggleFocus(c.id)}>
              {c.label}
            </Chip>
          ))}
        </ChipScroller>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
const DAY_CHOICES = [2, 3, 4, 5, 6] as const;

export function DaysStep({ answers, update }: StepProps) {
  const auto = answers.frequency === 'recommend';
  const shown = FREQUENCY_OPTIONS.find((o) => o.value === answers.frequency) ?? FREQUENCY_OPTIONS[0];
  return (
    <>
      <FlowTitle title="How many days a week?" sub="Pick what you can keep up, not your best week." />
      <div className={`${glassPanel} flex min-h-[280px] flex-col items-center justify-center gap-6 px-4 py-8`}>
        <div role="radiogroup" aria-label="Days a week" className="flex h-[88px] items-center gap-2.5">
          {DAY_CHOICES.map((n) => {
            const on = !auto && answers.frequency === n;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={`${n} days`}
                onClick={() => update({ frequency: n, lastDays: n })}
                className={`flex items-center justify-center rounded-full font-bold tracking-[-0.03em] transition-all duration-300 ease-[cubic-bezier(0.3,1.4,0.5,1)] active:scale-90 ${
                  on ? 'size-[88px] bg-gym-lime text-[44px] text-gym-ink' : 'glass-inset size-[52px] text-lg text-gym-text'
                } ${auto ? 'opacity-45' : ''}`}
              >
                {n}
              </button>
            );
          })}
        </div>
        <motion.div
          key={String(answers.frequency)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-1.5 px-4 text-center"
          aria-live="polite"
        >
          <span className="text-xl font-bold tracking-tight text-gym-text">{shown.label}</span>
          <span className="text-sm leading-relaxed text-gym-textMuted">{shown.description}</span>
        </motion.div>
      </div>
      <div className="glass mt-4 flex min-h-[72px] items-center gap-3.5 rounded-[28px] py-3 pl-5 pr-4">
        <span className="flex-1">
          <span className="block text-base font-semibold text-gym-text">Pick for me</span>
          <span className="block text-[13px] text-gym-textMuted">Based on your goal and experience</span>
        </span>
        <Switch
          label="Pick for me"
          checked={auto}
          onChange={(on) => update({ frequency: on ? 'recommend' : answers.lastDays })}
        />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
const DURATIONS = DURATION_OPTIONS.map((o) => o.value);

export function LengthStep({ answers, update }: StepProps) {
  const option = DURATION_OPTIONS.find((o) => o.value === answers.duration) ?? DURATION_OPTIONS[2];
  return (
    <>
      <FlowTitle title="How long is a session?" sub="We fit the exercises to the time you have." />
      <div className={`${glassPanel} flex flex-col items-center gap-4 px-6 py-8`}>
        <span className="flex flex-col items-center">
          <span aria-hidden className="text-[88px] font-bold leading-none tracking-[-0.05em] tabular-nums text-gym-lime">{answers.duration}</span>
          <span className="text-base font-medium text-gym-textMuted">minutes</span>
        </span>
        <StopPicker values={DURATIONS} value={answers.duration} onChange={(v) => update({ duration: v })} label="Minutes per session" />
        <span className="glass-inset rounded-2xl px-3.5 py-2 text-center text-[13px] font-semibold text-gym-text" aria-live="polite">
          {option.description}
        </span>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
const SETUP_ICONS: Record<SetupId, React.ReactNode> = {
  gym: <Dumbbell className="h-[22px] w-[22px]" strokeWidth={2.2} />,
  home: <House className="h-[22px] w-[22px]" strokeWidth={2.2} />,
  body: <PersonStanding className="h-[22px] w-[22px]" strokeWidth={2.2} />,
  all: <LayoutGrid className="h-[22px] w-[22px]" strokeWidth={2.2} />,
};

export function EquipmentStep({ answers, update, onFineTune }: StepProps & { onFineTune: () => void }) {
  const current = setupFor(answers.equipment);
  const count = answers.equipment.filter((id) => id !== 'bodyweight_only').length;
  const tuneSub =
    current !== null
      ? 'Switch single items on or off'
      : count === 0
      ? 'Nothing on, so bodyweight moves only'
      : `Your own list: ${count} item${count === 1 ? '' : 's'}`;
  return (
    <>
      <FlowTitle title="Where do you train?" sub="Start from a setup, then fine-tune it." />
      <div role="radiogroup" aria-label="Setup" className="grid grid-cols-2 gap-3">
        {SETUPS.map((s) => (
          <ChoiceTile
            key={s.id}
            className="h-[136px]"
            selected={current === s.id}
            onSelect={() => update({ equipment: s.ids })}
            label={s.label}
            sub={s.sub}
            icon={SETUP_ICONS[s.id]}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onFineTune}
        className="tap glass mt-4 flex min-h-[72px] w-full items-center gap-3.5 rounded-[28px] py-3 pl-5 pr-4 text-left"
      >
        <span className="flex-1">
          <span className="block text-base font-semibold text-gym-text">Fine-tune the list</span>
          <span className="block text-[13px] text-gym-textMuted">{tuneSub}</span>
        </span>
        <ChevronRight className="h-5 w-5 text-gym-text" strokeWidth={2.4} />
      </button>
    </>
  );
}

/* ------------------------------------------------------------------ */
const AREAS = INJURY_OPTIONS.filter((o) => o.id !== 'none');

export function InjuriesStep({ answers, update }: StepProps) {
  const none = answers.injuries.length === 0;
  const chosen = AREAS.filter((a) => answers.injuries.includes(a.id));
  const toggle = (id: InjuryArea) =>
    update({
      injuries: answers.injuries.includes(id) ? answers.injuries.filter((i) => i !== id) : [...answers.injuries, id],
    });

  return (
    <>
      <FlowTitle title="Anything sore or injured?" sub="We swap out moves that load that joint." />
      <div className="flex flex-col gap-3.5">
        <button
          type="button"
          aria-pressed={none}
          onClick={() => update({ injuries: [] })}
          className={`tap flex h-[60px] items-center justify-between rounded-full pl-[22px] pr-[18px] text-base font-semibold text-gym-text transition-colors ${
            none ? 'border-[1.5px] border-gym-lime bg-gym-lime/15 backdrop-blur-2xl' : 'glass'
          }`}
        >
          Nothing hurts
          {none ? (
            <span className="flex size-[26px] items-center justify-center rounded-full bg-gym-lime text-gym-ink">
              <Check className="h-[15px] w-[15px]" strokeWidth={3.4} />
            </span>
          ) : (
            <span className="size-[26px] rounded-full border-[1.5px] border-white/45" />
          )}
        </button>

        <div role="group" aria-label="Sore areas" className="flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <Chip key={a.id} selected={answers.injuries.includes(a.id)} onClick={() => toggle(a.id)}>
              {a.label}
            </Chip>
          ))}
        </div>

        {chosen.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass flex flex-col gap-3 rounded-[28px] px-5 py-4"
            aria-live="polite"
          >
            {chosen.map((c) => (
              <div key={c.id} className="space-y-1">
                <p className="text-[13px] font-semibold text-gym-lime">{c.label}</p>
                <p className="text-sm leading-relaxed text-gym-text">{c.affectedMovements}</p>
              </div>
            ))}
          </motion.div>
        )}

        <label className="glass-inset flex h-[52px] items-center rounded-full border border-white/15 px-5">
          <span className="sr-only">Injury note</span>
          <input
            type="text"
            value={answers.injuryNotes}
            onChange={(e) => update({ injuryNotes: e.target.value })}
            placeholder="Add a note (optional)"
            maxLength={200}
            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-gym-text outline-none placeholder:text-gym-textMuted"
          />
        </label>
      </div>
    </>
  );
}
