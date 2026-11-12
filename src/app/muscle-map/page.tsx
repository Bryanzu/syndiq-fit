'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { exercisePhoto } from '@/lib/photos';
import { Play } from 'lucide-react';
import { MuscleGroup, Exercise } from '@/types/workout';
import { getExercisesByMuscle } from '@/data/exercises';
import { orderForBuild } from '@/engine/gluteFocus';
import { BodyBuild, BodyFigure, BodyView, FRONT_MUSCLES, BACK_MUSCLES } from '@/components/body/BodyFigure';
import { loadSavedProfile } from '@/lib/storage';
import { VideoModal } from '@/components/program/VideoModal';
import { MuscleLoad, daysAgoLabel, loadMuscleLoad } from '@/lib/muscleLoad';
import { WORKOUT_LOGGED_EVENT } from '@/lib/workoutSession';

const GROUPS: { name: string; muscles: MuscleGroup[] }[] = [
  { name: 'Chest', muscles: ['chest'] },
  { name: 'Shoulders', muscles: ['front_delts', 'side_delts', 'rear_delts'] },
  { name: 'Arms', muscles: ['biceps', 'triceps', 'forearms'] },
  { name: 'Core', muscles: ['abs', 'obliques', 'lower_back'] },
  { name: 'Back', muscles: ['lats', 'upper_back', 'traps'] },
  { name: 'Legs', muscles: ['quads', 'hamstrings', 'glutes', 'calves'] },
];

/** Sets in a week at which a muscle shows at full brightness */
const FULL_BRIGHTNESS_SETS = 10;

/** The muscle each build opens on, until the user picks one */
const START_MUSCLE: Record<BodyBuild, MuscleGroup> = { male: 'chest', female: 'glutes' };

const formatMuscle = (m: MuscleGroup) =>
  m.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export default function MuscleMapPage() {
  const [selected, setSelected] = useState<MuscleGroup>('chest');
  const [view, setView] = useState<BodyView>('front');
  const [build, setBuild] = useState<BodyBuild>('male');
  const pickedMuscle = useRef(false);

  // The female build opens on the glutes, the male on the chest, until a muscle is picked
  const changeBuild = (next: BodyBuild) => {
    setBuild(next);
    if (pickedMuscle.current) return;
    const muscle = START_MUSCLE[next];
    setSelected(muscle);
    setView(FRONT_MUSCLES.includes(muscle) ? 'front' : 'back');
  };

  // Start with the build from the user's questionnaire answers, if they have any
  useEffect(() => {
    const gender = loadSavedProfile()?.gender;
    if (gender) changeBuild(gender);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [videoExercise, setVideoExercise] = useState<Exercise | null>(null);
  const [load, setLoad] = useState<Partial<Record<MuscleGroup, MuscleLoad>>>({});

  useEffect(() => {
    const refresh = () => setLoad(loadMuscleLoad());
    refresh();
    window.addEventListener(WORKOUT_LOGGED_EVENT, refresh);
    return () => window.removeEventListener(WORKOUT_LOGGED_EVENT, refresh);
  }, []);

  const intensity = useMemo(() => {
    const out: Partial<Record<MuscleGroup, number>> = {};
    for (const [muscle, value] of Object.entries(load)) {
      out[muscle as MuscleGroup] = (value?.setsThisWeek ?? 0) / FULL_BRIGHTNESS_SETS;
    }
    return out;
  }, [load]);

  const hasHistory = Object.values(load).some((l) => (l?.setsThisWeek ?? 0) > 0);
  // Same muscle, different order: the female list leads with glute work
  const exercises = useMemo(() => orderForBuild(getExercisesByMuscle(selected), build), [selected, build]);
  const selectedLoad = load[selected];
  const group = GROUPS.find((g) => g.muscles.includes(selected)) ?? GROUPS[0];

  // Choosing a muscle that is only on the other side turns the figure around
  const select = (muscle: MuscleGroup) => {
    pickedMuscle.current = true;
    setSelected(muscle);
    const visible = view === 'front' ? FRONT_MUSCLES : BACK_MUSCLES;
    if (!visible.includes(muscle)) setView(view === 'front' ? 'back' : 'front');
  };

  const status = selectedLoad?.setsThisWeek
    ? `${selectedLoad.setsThisWeek} ${selectedLoad.setsThisWeek === 1 ? 'set' : 'sets'} this week · last trained ${daysAgoLabel(selectedLoad.lastTrained!)}`
    : selectedLoad?.lastTrained
    ? `Last trained ${daysAgoLabel(selectedLoad.lastTrained)}`
    : 'Not trained yet';

  return (
    <div className="page pb-8 pt-1 lg:py-10">
      <header className="flex items-center justify-between gap-3">
        <h1 className="t-large">Body map</h1>
        <div className="glass flex rounded-full p-1" role="group" aria-label="Side of the body">
          {(['front', 'back'] as BodyView[]).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`tap h-10 rounded-full px-[18px] text-sm capitalize ${
                view === v ? 'bg-gym-text font-bold text-gym-bg' : 'font-semibold text-gym-text'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-3 flex justify-end">
        <div className="glass flex rounded-full p-1" role="group" aria-label="Body type">
          {(['male', 'female'] as BodyBuild[]).map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={build === b}
              onClick={() => changeBuild(b)}
              className={`tap h-9 rounded-full px-4 text-[13px] capitalize ${
                build === b ? 'bg-gym-lime font-bold text-gym-ink' : 'font-semibold text-gym-text'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 grid gap-6 lg:mt-6 lg:grid-cols-12 lg:gap-12">
        {/* Figure + muscle groups */}
        <div className="relative isolate flex min-w-0 items-start gap-3 lg:col-span-6 lg:gap-8">
          <div className="absolute left-0 top-16 -z-10 size-64 rounded-full bg-gym-lime/15 blur-[70px]" aria-hidden />
          <div className="min-w-0 flex-1" style={{ perspective: 900 }}>
            <BodyFigure view={view} build={build} selected={selected} intensity={intensity} onSelect={select} className="mx-auto w-full max-w-[17rem]" />
          </div>

          <div className="w-[8.25rem] shrink-0 space-y-2 pt-10 lg:w-44">
            {GROUPS.map((g) => {
              const active = g === group;
              const sets = g.muscles.reduce((sum, m) => sum + (load[m]?.setsThisWeek ?? 0), 0);
              const strength = Math.min(1, sets / FULL_BRIGHTNESS_SETS);
              return (
                <button
                  key={g.name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => select(g.muscles.find((m) => (view === 'front' ? FRONT_MUSCLES : BACK_MUSCLES).includes(m)) ?? g.muscles[0])}
                  className={`tap flex h-11 w-full items-center gap-2 rounded-full px-3.5 text-[13px] ${
                    active ? 'bg-gym-lime font-bold text-gym-ink' : 'glass font-semibold text-gym-text'
                  }`}
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: active ? '#0B1004' : sets > 0 ? `rgb(var(--muscle-rgb) / ${(0.3 + 0.7 * strength).toFixed(2)})` : 'var(--muscle-line)' }}
                    aria-hidden
                  />
                  <span className="flex-1 text-left">{g.name}</span>
                  <span className="tabular-nums" aria-label={`${sets} sets this week`}>
                    {sets}
                  </span>
                </button>
              );
            })}
            <p className="t-small px-1 pt-1 !text-xs leading-snug">
              {hasHistory ? 'Sets this week. Brighter means more work.' : 'Log sets in a workout and the body lights up.'}
            </p>
          </div>
        </div>

        {/* Selected muscle */}
        <section className="min-w-0 lg:col-span-6" aria-live="polite">
          <div key={`${selected}-${build}`} className="glass animate-riseIn rounded-[32px] p-5">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold tracking-[-0.03em] text-gym-text">{formatMuscle(selected)}</h2>
                <p className="t-small !text-[13px]">{status}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-gym-limeDark dark:text-gym-lime">
                {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
              </span>
            </div>

            {group.muscles.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {group.muscles.map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={m === selected}
                    onClick={() => select(m)}
                    className={`tap min-h-[40px] rounded-full px-3.5 text-[13px] font-semibold ${
                      m === selected ? 'bg-gym-text text-gym-bg' : 'glass-inset text-gym-text'
                    }`}
                  >
                    {formatMuscle(m)}
                  </button>
                ))}
              </div>
            )}

            <ul className="stagger divide-line mt-2">
              {exercises.map((ex, i) => (
                <li key={ex.id} className="flex items-center gap-3 py-3" style={{ '--i': Math.min(i, 8) } as React.CSSProperties}>
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-2xl" aria-hidden>
                    <Image src={exercisePhoto(ex)} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-gym-text">{ex.name}</p>
                    <p className="t-small !text-xs capitalize">
                      {ex.equipment} · {ex.defaultSets} × {ex.defaultReps}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVideoExercise(ex)}
                    aria-label={`Watch ${ex.name} demo`}
                    className="tap flex size-11 shrink-0 items-center justify-center rounded-full bg-gym-lime text-gym-ink"
                  >
                    <Play className="h-4 w-4 fill-current" />
                  </button>
                </li>
              ))}
              {exercises.length === 0 && <li className="t-small py-4">Nothing in the library for this muscle yet.</li>}
            </ul>
          </div>
        </section>
      </div>

      <VideoModal exercise={videoExercise} isOpen={Boolean(videoExercise)} onClose={() => setVideoExercise(null)} />
    </div>
  );
}
