'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Activity, Check, Layers, ShieldCheck, Undo2, Utensils } from 'lucide-react';
import { loadActiveProgram, loadActiveMealPlan } from '@/lib/storage';
import {
  SessionEntry,
  getNextDayIndex,
  getWeekDates,
  loadWorkoutLog,
  logSession,
  toLocalISODate,
  undoSession,
} from '@/lib/progress';
import { WorkoutProgram } from '@/types/workout';
import { useWorkoutSession } from '@/context/WorkoutSessionContext';
import { WORKOUT_LOGGED_EVENT } from '@/lib/workoutSession';
import { SlideToStart } from '@/components/ui/SlideToStart';
import { mealPhoto } from '@/lib/photos';

const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const formatMuscle = (m: string) => m.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const stripDayPrefix = (title: string) => title.replace(/^Day \d+\s*[—–-]\s*/, '');

const HERO_SHADE =
  'linear-gradient(180deg, rgba(7,9,13,0.62) 0%, rgba(7,9,13,0.2) 30%, rgba(7,9,13,0.7) 62%, rgba(7,9,13,0.82) 93%, var(--gym-bg) 100%)';

/* ------------------------------------------------------------------ */
/* FIRST OPEN                                                          */
/* ------------------------------------------------------------------ */
function Welcome() {
  const features = [
    { icon: Layers, title: 'Fits your gym', body: 'Pick the equipment you have. Every exercise sticks to it.' },
    { icon: ShieldCheck, title: 'Works around injuries', body: 'Flag a sore knee or shoulder and those lifts get swapped out.' },
    { icon: Utensils, title: 'Nigerian meals', body: 'A week of jollof, egusi and moi moi, portioned for your goal.' },
    { icon: Activity, title: 'Know your muscles', body: 'Tap a muscle to see what trains it and how.' },
  ];
  const steps = [
    ['01', 'Answer eight questions', 'Your goal, schedule, equipment and any injuries.'],
    ['02', 'Get your week', 'A full program, laid out day by day.'],
    ['03', 'Train', 'Follow along set by set. Swap anything you don’t like.'],
  ];

  return (
    <div>
      {/* PHONE: one full-screen photo with a glass panel */}
      <section className="on-photo relative isolate -mt-14 flex min-h-[100dvh] flex-col justify-end overflow-hidden lg:hidden">
        <Image src="/images/workout-empty.jpg" alt="" fill priority sizes="100vw" className="animate-heroSettle -z-20 object-cover" />
        <div
          className="absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(180deg, rgba(7,9,13,0.5) 0%, rgba(7,9,13,0.05) 30%, rgba(7,9,13,0.35) 55%, rgba(7,9,13,0.82) 100%)' }}
        />
        <div className="glass animate-panelUp m-3 space-y-4 rounded-[40px] px-6 pb-6 pt-3">
          <span className="mx-auto block h-[5px] w-11 rounded-full bg-white/60" aria-hidden />
          <h1 className="pt-1.5 text-[2.125rem] font-bold leading-[1.08] tracking-[-0.035em]">
            Train for the
            <br />
            body you want.
          </h1>
          <p className="text-base leading-snug text-white/85">
            A program built around your gym, your schedule and your joints. Meals from the food you already cook.
          </p>
          <div className="flex flex-col gap-2.5 pt-1.5 min-[420px]:flex-row">
            <Link
              href="/questionnaire"
              className="tap flex h-[60px] flex-1 items-center justify-between whitespace-nowrap rounded-full bg-white pl-6 pr-1.5 text-[17px] font-bold text-gym-ink"
            >
              Build my program
              <span className="flex size-12 items-center justify-center rounded-full bg-gym-ink text-gym-lime">
                <ArrowRight className="h-[22px] w-[22px]" strokeWidth={2.6} />
              </span>
            </Link>
            <Link href="/muscle-map" className="tap glass-inset flex h-[52px] items-center justify-center rounded-full px-5 text-[15px] font-semibold min-[420px]:h-[60px]">
              Look around
            </Link>
          </div>
          <p className="text-center text-[13px] text-white/75">Two minutes. No account needed.</p>
        </div>
      </section>

      {/* DESKTOP: split hero */}
      <section className="page hidden lg:block">
        <div className="grid grid-cols-12 items-center gap-12 py-16 xl:py-20">
          <div className="col-span-6 space-y-7">
            <h1 className="text-6xl font-bold leading-[1.04] tracking-[-0.04em] text-gym-text">
              Train for the
              <br />
              body you want.
            </h1>
            <p className="t-body max-w-lg !text-lg">
              A program built around your gym, your schedule and your joints. Meals from the food you already cook.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <Link href="/questionnaire" className="btn-primary !min-h-[56px] px-8 !text-base">
                Build my program <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/muscle-map" className="btn-secondary !min-h-[56px] px-7 !text-base">
                Look around
              </Link>
            </div>
            <dl className="flex gap-10 pt-4">
              {[['134', 'exercises'], ['48', 'need no equipment'], ['7 days', 'of meals planned']].map(([n, l]) => (
                <div key={l}>
                  <dt className="text-3xl font-bold tracking-tight text-gym-text">{n}</dt>
                  <dd className="t-small">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="col-span-6">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[40px]">
              <Image src="/images/fitness-hero.jpg" alt="Athlete training in a gym" fill priority sizes="50vw" className="animate-heroSettle object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="page page-section">
        <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="surface space-y-3 !rounded-3xl p-5" style={{ '--i': i } as React.CSSProperties}>
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-gym-lime/15 text-gym-limeDark dark:text-gym-lime">
                <Icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <h3 className="t-section">{title}</h3>
              <p className="t-small leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page page-section">
        <h2 className="t-large mb-8 sm:mb-10">Three steps</h2>
        <ol className="grid gap-8 md:grid-cols-3">
          {steps.map(([n, title, body]) => (
            <li key={n} className="space-y-2">
              <span className="text-5xl font-bold tracking-tight text-gym-limeDark dark:text-gym-lime">{n}</span>
              <h3 className="t-section">{title}</h3>
              <p className="t-small max-w-xs leading-relaxed">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="page page-section">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-[16/11] overflow-hidden rounded-[32px] lg:order-2">
            <Image src="/images/meal-prep-healthy.jpg" alt="Prepared meals in containers" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="space-y-4">
            <h2 className="t-large">Eat what you already cook.</h2>
            <p className="t-body max-w-md">
              The planner builds your week from Nigerian recipes, sizes each plate for your goal and writes the shopping list.
            </p>
            <Link href="/meal-planner" className="btn-secondary">
              Plan my meals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="page py-14 text-center sm:py-20">
        <h2 className="t-large mx-auto max-w-xl">Ready when you are.</h2>
        <p className="t-body mx-auto mt-3 max-w-md">Two minutes. No account needed.</p>
        <Link href="/questionnaire" className="btn-primary mt-7 !min-h-[56px] px-8 !text-base">
          Build my program <ArrowRight className="h-5 w-5" />
        </Link>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* HOME — once a program exists                                        */
/* ------------------------------------------------------------------ */
function Dashboard({ program, mealPlan }: { program: WorkoutProgram; mealPlan: any | null }) {
  const [log, setLog] = useState<SessionEntry[]>([]);
  useEffect(() => {
    const refresh = () => setLog(loadWorkoutLog());
    refresh();
    // The workout player logs sessions while this page stays mounted
    window.addEventListener(WORKOUT_LOGGED_EVENT, refresh);
    return () => window.removeEventListener(WORKOUT_LOGGED_EVENT, refresh);
  }, []);
  const workout = useWorkoutSession();

  const todayISO = toLocalISODate();
  const todayEntry = log.find((e) => e.date === todayISO);
  const weekDates = useMemo(() => getWeekDates(), []);
  const weekISO = weekDates.map((d) => toLocalISODate(d));
  const doneThisWeek = new Set(log.filter((e) => weekISO.includes(e.date)).map((e) => e.date));
  const sessionsThisWeek = log.filter((e) => weekISO.includes(e.date)).length;
  const target = typeof program.userProfile.frequency === 'number' ? program.userProfile.frequency : program.days.length;

  const nextIdx = getNextDayIndex(program, log);
  const day = program.days[nextIdx] ?? program.days[0];
  const exercises = day?.exercises ?? [];
  const inProgress = workout.isActiveFor(day);

  const todayMeals: any[] = useMemo(() => {
    if (!mealPlan?.days?.length) return [];
    const idx = (new Date().getDay() + 6) % 7;
    return (mealPlan.days[idx] ?? mealPlan.days[0])?.meals ?? [];
  }, [mealPlan]);

  const recent = [...log].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).slice(0, 4);

  const complete = () => setLog(logSession({ date: todayISO, dayNumber: day.dayNumber, title: day.title }));
  const undo = () => todayEntry && setLog(undoSession(todayEntry.date, todayEntry.dayNumber));

  return (
    <div className="relative isolate">
      {/* Photo behind the top of the screen, running up under the phone header */}
      <div className="absolute inset-x-0 -top-14 -z-10 h-[44rem] sm:h-[42rem] overflow-hidden lg:top-0" aria-hidden>
        <Image src="/images/fitness-hero.jpg" alt="" fill priority sizes="100vw" className="animate-heroSettle object-cover" />
        <div className="absolute inset-0" style={{ background: HERO_SHADE }} />
      </div>

      <div className="page pb-6 lg:pb-10">
        <div className="on-photo space-y-5 pt-1 lg:pt-10">
          <header className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-white/80">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <h1 className="t-large mt-0.5">{greeting()}</h1>
            </div>
            <span className="glass flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold">
              <strong className="text-gym-lime">{sessionsThisWeek}</strong> of {target} this week
            </span>
          </header>

          <ol className="grid grid-cols-7 gap-1.5 sm:gap-2.5 lg:max-w-xl" aria-label="This week">
            {weekDates.map((d, i) => {
              const iso = weekISO[i];
              const isToday = iso === todayISO;
              const done = doneThisWeek.has(iso);
              return (
                <li
                  key={iso}
                  aria-label={`${WEEKDAY_SHORT[i]} ${d.getDate()}${done ? ', workout done' : ''}${isToday ? ', today' : ''}`}
                  className={`flex h-16 flex-col items-center justify-center gap-0.5 rounded-[22px] transition-colors ${
                    done ? 'bg-gym-lime text-gym-ink' : isToday ? 'glass ring-2 ring-gym-lime' : 'glass'
                  }`}
                >
                  <span className={`text-[11px] font-semibold ${done || isToday ? '' : 'text-white/75'}`}>{WEEKDAY_SHORT[i]}</span>
                  {done ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <span className="text-[17px] font-bold leading-none">{d.getDate()}</span>
                  )}
                </li>
              );
            })}
          </ol>

          <section className="glass space-y-3.5 rounded-[32px] p-5 lg:max-w-xl" aria-label={todayEntry ? 'Up next' : 'Today’s workout'}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-gym-lime">{todayEntry ? 'Up next' : 'Today'}</span>
              <span className="glass-inset rounded-full px-3 py-1.5 text-xs font-semibold">
                Day {day.dayNumber} of {program.days.length}
              </span>
            </div>
            <h2 className="text-[1.625rem] font-bold leading-[1.12] tracking-[-0.03em]">{stripDayPrefix(day.title)}</h2>
            <div className="flex flex-wrap gap-2 text-[13px] font-medium">
              <span className="glass-inset rounded-full px-3 py-2">{day.estimatedDuration} min</span>
              <span className="glass-inset rounded-full px-3 py-2">{exercises.length} exercises</span>
              <span className="glass-inset rounded-full px-3 py-2">{day.focusMuscles.slice(0, 2).map(formatMuscle).join(', ')}</span>
            </div>
            <SlideToStart
              label={inProgress ? 'Slide to resume' : 'Slide to start'}
              onComplete={() => workout.start(program, nextIdx)}
            />
            <div className="flex items-center justify-between pt-0.5 text-sm font-semibold">
              {todayEntry ? (
                <button type="button" onClick={undo} className="tap flex min-h-[44px] items-center gap-1.5 text-white/85">
                  <Check className="h-4 w-4 text-gym-lime" strokeWidth={3} /> Done today <Undo2 className="h-3.5 w-3.5 opacity-70" />
                </button>
              ) : (
                <button type="button" onClick={complete} className="tap flex min-h-[44px] items-center gap-1.5 text-white/85">
                  <Check className="h-4 w-4" /> Mark as done
                </button>
              )}
              <Link href="/program" className="tap flex min-h-[44px] items-center gap-1 text-gym-lime">
                Full plan <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>

        {/* On the menu */}
        <section aria-label="Today’s meals" className="mt-12">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xl font-bold tracking-tight text-gym-text">On the menu</h2>
            <Link href="/meal-planner" className="text-sm font-semibold text-gym-limeDark dark:text-gym-lime">
              {mealPlan ? 'See week' : 'Plan meals'}
            </Link>
          </div>
          {todayMeals.length > 0 ? (
            <ul className="stagger no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
              {todayMeals.map((m, i) => (
                <li
                  key={m.id ?? i}
                  style={{ '--i': i } as React.CSSProperties}
                  className="on-photo relative isolate flex min-h-[9.5rem] w-52 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl p-4"
                >
                  <Image src={mealPhoto(m.recipeId)} alt="" fill sizes="208px" className="-z-20 object-cover" />
                  <span className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/35 to-black/25" aria-hidden />
                  <span className="glass-inset self-start rounded-full px-2.5 py-1 text-xs font-semibold capitalize">{m.mealType}</span>
                  <div>
                    <p className="line-clamp-2 text-[15px] font-semibold leading-snug">{m.recipeName}</p>
                    <p className="mt-1 text-xs tabular-nums text-white/80">
                      {Math.round(m.calories)} kcal · {Math.round(m.protein)}g protein
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Link href="/meal-planner" className="tap on-photo relative isolate flex min-h-[9rem] items-end overflow-hidden rounded-[32px] p-5">
              <Image src="/images/meal-prep-healthy.jpg" alt="" fill sizes="(max-width: 1024px) 100vw, 60vw" className="-z-20 object-cover" />
              <span className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 to-black/20" />
              <span>
                <span className="block text-lg font-bold tracking-tight">Plan this week’s meals</span>
                <span className="text-sm text-white/80">Seven days of Nigerian food, sized for your goal.</span>
              </span>
            </Link>
          )}
        </section>

        <div className="mt-9 grid grid-cols-1 gap-9 lg:grid-cols-12 lg:gap-10">
          <section aria-label="Exercises in this session" className="min-w-0 lg:col-span-7">
            <div className="mb-1 flex items-baseline justify-between">
              <h2 className="text-xl font-bold tracking-tight text-gym-text">In this session</h2>
              <Link href="/program" className="text-sm font-semibold text-gym-limeDark dark:text-gym-lime">
                See all
              </Link>
            </div>
            <ul className="stagger divide-line">
              {exercises.slice(0, 5).map((it, i) => (
                <li key={it.exercise.id + i} className="row" style={{ '--i': i } as React.CSSProperties}>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gym-cardInner text-sm font-semibold tabular-nums text-gym-text">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-gym-text">{it.exercise.name}</p>
                    <p className="t-small truncate !text-xs">{it.exercise.primaryMuscles.map(formatMuscle).join(', ')}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-gym-limeDark dark:text-gym-lime">
                    {it.sets} × {it.reps}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="Recent activity" className="min-w-0 lg:col-span-5">
            <h2 className="mb-1 text-xl font-bold tracking-tight text-gym-text">Recent</h2>
            {recent.length > 0 ? (
              <ul className="divide-line">
                {recent.map((e) => (
                  <li key={e.id} className="row">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-gym-lime text-gym-ink">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-gym-text">{stripDayPrefix(e.title)}</p>
                      <p className="t-small !text-xs">
                        {new Date(e.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                        {e.durationMin ? ` · ${e.durationMin} min` : ''}
                        {e.setsCompleted ? ` · ${e.setsCompleted} sets` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="t-small py-3">Finish a workout and it shows up here.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export default function HomePage() {
  const [ready, setReady] = useState(false);
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [mealPlan, setMealPlan] = useState<any | null>(null);

  useEffect(() => {
    setProgram(loadActiveProgram());
    setMealPlan(loadActiveMealPlan());
    setReady(true);
  }, []);

  if (!ready) return <div className="min-h-[70dvh]" aria-hidden />;
  return program ? <Dashboard program={program} mealPlan={mealPlan} /> : <Welcome />;
}
