'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Lock, LogOut, RefreshCw } from 'lucide-react';
import type { AnalyticsSummary } from '@/lib/analytics/metrics';
import type { StorageKind } from '@/lib/analytics/store';
import { ANALYTICS_EVENTS, EVENT_LABELS } from '@/lib/analytics/events';

type Summary = AnalyticsSummary & { storage: StorageKind; timezone: string };

// Shared with the feedback admin, so signing in on one opens the other (this tab only)
const KEY_STORE = 'syndiq_admin_key';

const PAGE_NAMES: Record<string, string> = {
  '/': 'Home',
  '/program': 'Program',
  '/questionnaire': 'Questions',
  '/meal-planner': 'Meals',
  '/muscle-map': 'Body map',
  '/feedback': 'Feedback',
  '/settings': 'Settings',
  '/about': 'About',
  '/demo': 'Demo',
  '/disclaimer': 'Disclaimer',
  '/credits': 'Credits',
  '/other': 'Other pages',
};

const fmt = (n: number) => n.toLocaleString('en-GB');
const dayLabel = (day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

function readKey(): string {
  try {
    return sessionStorage.getItem(KEY_STORE) ?? '';
  } catch {
    return '';
  }
}
function writeKey(key: string | null) {
  try {
    if (key) sessionStorage.setItem(KEY_STORE, key);
    else sessionStorage.removeItem(KEY_STORE);
  } catch {
    // Without storage the key just isn't remembered
  }
}

export default function AdminAnalyticsPage() {
  const [key, setKey] = useState('');
  const [input, setInput] = useState('');
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [checked, setChecked] = useState(false);

  const load = async (k: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analytics', { headers: { Authorization: `Bearer ${k}` }, cache: 'no-store' });
      if (!res.ok) {
        const msg =
          res.status === 401
            ? 'That key didn’t work.'
            : res.status === 429
              ? 'Too many wrong keys. Try again in a few minutes.'
              : res.status === 503
                ? 'Admin access isn’t set up. Add ADMIN_KEY in Vercel.'
                : 'Couldn’t load the counts. Try again.';
        throw new Error(msg);
      }
      setData(await res.json());
      setKey(k);
      setUpdatedAt(new Date());
      writeKey(k);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t load the counts.');
      setData(null);
      writeKey(null);
    } finally {
      setLoading(false);
      setChecked(true);
    }
  };

  useEffect(() => {
    const saved = readKey();
    if (saved) load(saved);
    else setChecked(true);
  }, []);

  const signOut = () => {
    writeKey(null);
    setKey('');
    setInput('');
    setData(null);
    setError(null);
  };

  if (!data) {
    return (
      <div className="page py-4 sm:py-10">
        <section className="on-photo relative isolate flex min-h-[72vh] flex-col justify-end overflow-hidden rounded-[32px] p-4 sm:p-8">
          <Image src="/images/training-weights.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
          <div
            className="absolute inset-0 -z-10"
            style={{ background: 'linear-gradient(180deg, rgba(7,9,13,0.55) 0%, rgba(7,9,13,0.35) 30%, rgba(7,9,13,0.92) 75%)' }}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) load(input.trim());
            }}
            className="glass w-full max-w-md space-y-4 rounded-[32px] p-5 sm:p-6"
            aria-label="Unlock analytics"
          >
            <span className="glass-inset flex h-[52px] w-[52px] items-center justify-center rounded-full text-gym-lime">
              <Lock className="h-[22px] w-[22px]" aria-hidden="true" />
            </span>
            <div>
              <h1 className="t-large">Analytics</h1>
              <p className="mt-1.5 text-[15px] text-white/85">Enter the admin key to see the counts.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="admin-key" className="text-[13px] font-semibold text-white/85">
                Admin key
              </label>
              <input
                id="admin-key"
                type="password"
                autoComplete="current-password"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(null);
                }}
                placeholder="Key"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'admin-key-error' : undefined}
                className={`field glass-inset min-h-[52px] rounded-[18px] text-base ${error ? 'ring-2 ring-[#FF9B8A]' : ''}`}
              />
              {error && (
                <p id="admin-key-error" role="alert" className="text-[13px] font-semibold text-[#FF9B8A]">
                  {error}
                </p>
              )}
            </div>
            <button type="submit" className="btn-primary min-h-[56px] w-full text-base" disabled={loading || !checked}>
              {loading ? 'Checking…' : 'Open'}
            </button>
          </form>
        </section>
      </div>
    );
  }

  return <Dashboard data={data} updatedAt={updatedAt} loading={loading} onRefresh={() => load(key)} onSignOut={signOut} />;
}

/* ------------------------------------------------------------------ */

function Dashboard({
  data,
  updatedAt,
  loading,
  onRefresh,
  onSignOut,
}: {
  data: Summary;
  updatedAt: Date | null;
  loading: boolean;
  onRefresh: () => void;
  onSignOut: () => void;
}) {
  const tiles = [
    ['Today', data.users.today],
    ['Last 7 days', data.users.week],
    ['Last 30 days', data.users.month],
    ['All time', data.users.allTime],
  ] as const;
  const storageNote =
    data.storage === 'redis' ? 'Counting' : data.storage === 'file' ? 'Local file' : 'Not saving: storage isn’t connected';

  return (
    <div className="page space-y-4 py-4 pb-28 sm:py-10">
      <header className="on-photo relative isolate overflow-hidden rounded-[32px]">
        <Image src="/images/training-weights.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div
          className="absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(180deg, rgba(7,9,13,0.7) 0%, rgba(7,9,13,0.45) 40%, rgba(7,9,13,0.92) 100%)' }}
        />
        <div className="space-y-6 p-4 sm:p-8">
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={onRefresh} className="glass-btn" aria-label="Refresh" disabled={loading}>
              <RefreshCw className={`h-[18px] w-[18px] ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
            <button type="button" onClick={onSignOut} className="glass-btn gap-2 px-4 text-sm font-semibold">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
          <div>
            <h1 className="t-large">Analytics</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <p className="text-[15px] text-white/85">
                Anonymous counts. Days run on {data.timezone === 'Africa/Lagos' ? 'Lagos' : data.timezone} time.
                {updatedAt && ` Updated ${updatedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}.`}
              </p>
              <span className="glass-inset inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold" data-storage={data.storage}>
                <span className={`h-[7px] w-[7px] rounded-full ${data.storage === 'none' ? 'bg-[#FF9B8A]' : 'bg-gym-lime'}`} aria-hidden="true" />
                {storageNote}
              </span>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="People">
            {tiles.map(([label, value]) => (
              <li key={label} className="glass rounded-[28px] px-5 py-4">
                <p className="text-[13px] font-semibold text-white/80">{label}</p>
                <p className="text-[2.5rem] font-bold leading-tight tracking-[-0.03em] tabular-nums" data-tile={label}>
                  {fmt(value)}
                </p>
                <p className="text-[13px] text-white/70">people</p>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <NewVsReturning data={data} />
        <CameBack data={data} />
      </div>
      <Funnel data={data} />
      <div className="grid gap-4 lg:grid-cols-5">
        <Events data={data} />
        <TopPages data={data} />
      </div>
      <p className="t-small px-1">People are counted by browser. No cookies, names or IP addresses are stored.</p>
    </div>
  );
}

function Card({ title, aside, className = '', children }: { title: string; aside?: React.ReactNode; className?: string; children: React.ReactNode }) {
  const id = `card-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return (
    <section aria-labelledby={id} className={`surface min-w-0 rounded-[28px] p-5 sm:p-6 ${className}`}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={id} className="text-xl font-bold tracking-tight text-gym-text">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

const NEW_BG = 'bg-[#2a78d6] dark:bg-[#3987e5]';
const RET_BG = 'bg-gym-limeDark dark:bg-[#79a600]';

function NewVsReturning({ data }: { data: Summary }) {
  const days = data.newVsReturning.days;
  const [hover, setHover] = useState<number | null>(null);
  const top = useMemo(() => {
    const max = Math.max(0, ...days.map((d) => d.new + d.returning));
    return Math.max(3, Math.ceil(max / 3) * 3);
  }, [days]);
  const shown = days[hover ?? days.length - 1];

  return (
    <Card
      title="New and returning"
      className="lg:col-span-2"
      aside={
        <div className="flex gap-4 text-[13px] text-gym-textMuted">
          <span className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-[3px] ${RET_BG}`} aria-hidden="true" />
            Returning <strong className="text-gym-text tabular-nums">{fmt(data.newVsReturning.returningTotal)}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-[3px] ${NEW_BG}`} aria-hidden="true" />
            New <strong className="text-gym-text tabular-nums">{fmt(data.newVsReturning.newTotal)}</strong>
          </span>
        </div>
      }
    >
      <p className="t-small mb-3 tabular-nums" aria-live="polite">
        {shown
          ? `${hover === null ? 'Today' : dayLabel(shown.day)}: ${fmt(shown.new + shown.returning)} people, ${fmt(shown.returning)} returning, ${fmt(shown.new)} new`
          : 'No visits yet'}
      </p>
      <div className="flex gap-2">
        <div aria-hidden="true" className="flex h-44 w-7 flex-col justify-between text-right text-[11px] text-gym-textMuted tabular-nums">
          {[top, (top * 2) / 3, top / 3, 0].map((v) => (
            <span key={v}>{fmt(v)}</span>
          ))}
        </div>
        <div className="relative h-44 min-w-0 flex-1">
          <div aria-hidden="true" className="absolute inset-y-[7px] left-0 right-0 flex flex-col justify-between">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`h-px bg-gym-border ${i === 3 ? '' : 'opacity-50'}`} />
            ))}
          </div>
          <div className="absolute inset-y-[7px] left-0 right-0 flex items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
            {days.map((d, i) => {
              const total = d.new + d.returning;
              return (
                <div
                  key={d.day}
                  className={`flex h-full min-w-0 flex-1 flex-col justify-end gap-[2px] ${hover === i ? 'opacity-100' : hover === null ? '' : 'opacity-60'}`}
                  onMouseEnter={() => setHover(i)}
                  title={`${dayLabel(d.day)}: ${total} people`}
                >
                  {d.new > 0 && <div className={`rounded-t-[4px] ${NEW_BG}`} style={{ height: `${(d.new / top) * 100}%` }} />}
                  {d.returning > 0 && (
                    <div className={`${d.new > 0 ? '' : 'rounded-t-[4px]'} ${RET_BG}`} style={{ height: `${(d.returning / top) * 100}%` }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="mt-2 flex justify-between pl-9 text-[11px] text-gym-textMuted">
        <span>{days[0] && dayLabel(days[0].day)}</span>
        <span>{days[Math.floor(days.length / 2)] && dayLabel(days[Math.floor(days.length / 2)].day)}</span>
        <span>Today</span>
      </div>
      <table className="sr-only">
        <caption>People per day, last {days.length} days</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Returning</th>
            <th scope="col">New</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.day}>
              <th scope="row">{dayLabel(d.day)}</th>
              <td>{d.returning}</td>
              <td>{d.new}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function CameBack({ data }: { data: Summary }) {
  const { eligible, returned, rate } = data.cameBack;
  return (
    <Card title="Came back after a week">
      <p className="text-[4rem] font-bold leading-none tracking-[-0.04em] text-gym-limeDark dark:text-gym-lime tabular-nums" data-came-back>
        {rate === null ? '–' : `${Math.round(rate * 100)}%`}
      </p>
      <p className="mt-3 text-[15px] leading-snug text-gym-textMuted">
        {eligible === 0
          ? 'Nobody first came a week or more ago yet.'
          : `${fmt(returned)} of the ${fmt(eligible)} people who first came a week or more ago were back 7 or more days later.`}
      </p>
    </Card>
  );
}

function Funnel({ data }: { data: Summary }) {
  const { visited, builtProgram, finishedWorkout } = data.funnel;
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
  const steps = [
    { label: 'Visited', value: visited, width: visited ? 100 : 0, rate: '' },
    { label: 'Built a program', value: builtProgram, width: pct(builtProgram, visited), rate: `${pct(builtProgram, visited)}% of visitors` },
    { label: 'Finished a workout', value: finishedWorkout, width: pct(finishedWorkout, visited), rate: `${pct(finishedWorkout, builtProgram)}% of builders` },
  ];
  return (
    <Card title="From first visit to first workout" aside={<span className="t-small">All time</span>}>
      <ol className="space-y-3.5">
        {steps.map((s) => (
          <li key={s.label} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[10rem_1fr_12rem]">
            <span className="text-[15px] font-semibold text-gym-text">{s.label}</span>
            <span className="text-right text-[15px] tabular-nums text-gym-text sm:order-3">
              <strong>{fmt(s.value)}</strong> <span className="text-gym-textMuted">{s.rate}</span>
            </span>
            <div className="col-span-2 h-7 overflow-hidden rounded-full bg-gym-cardInner sm:order-2 sm:col-span-1">
              <div className="h-7 rounded-r-[6px] bg-gym-limeDark dark:bg-gym-lime" style={{ width: `${s.width}%` }} />
            </div>
          </li>
        ))}
      </ol>
      <p className="t-small mt-4">A program counts whether it came from the questions or a share link.</p>
    </Card>
  );
}

function sparkPoints(values: number[]): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  return values
    .map((v, i) => {
      const x = values.length > 1 ? (i / (values.length - 1)) * 156 + 2 : 80;
      const y = max === min ? 30 : 30 - ((v - min) / (max - min)) * 28;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function Events({ data }: { data: Summary }) {
  return (
    <Card title="Events" className="lg:col-span-3" aside={<span className="t-small">Last {data.windowDays} days</span>}>
      <ul className="divide-line">
        {ANALYTICS_EVENTS.map((e) => {
          const values = data.events.days.map((d) => d.counts[e]);
          const total = data.events.totals[e];
          return (
            <li key={e} className="flex min-h-[52px] items-center gap-4" data-event={e}>
              <span className="min-w-0 flex-1 text-[15px] font-medium text-gym-text">{EVENT_LABELS[e]}</span>
              <svg
                role="img"
                aria-label={`${EVENT_LABELS[e]}: ${fmt(total)} in ${data.windowDays} days`}
                viewBox="0 0 160 32"
                className="h-8 w-[min(160px,30vw)] shrink"
              >
                <polyline
                  points={sparkPoints(values)}
                  fill="none"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="stroke-gym-limeDark dark:stroke-gym-lime"
                />
              </svg>
              <span className="w-16 shrink-0 text-right text-[17px] font-bold tabular-nums text-gym-text">{fmt(total)}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function TopPages({ data }: { data: Summary }) {
  const top = data.topPages[0]?.views ?? 0;
  return (
    <Card title="Top pages" className="lg:col-span-2" aside={<span className="t-small">Last {data.windowDays} days</span>}>
      {data.topPages.length === 0 ? (
        <p className="t-body">No page views yet.</p>
      ) : (
        <ul className="space-y-3" aria-label="Page views by page">
          {data.topPages.map((p) => (
            <li key={p.path} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-semibold text-gym-text">
                  {PAGE_NAMES[p.path] ?? p.path} <span className="font-normal text-gym-textMuted">{p.path}</span>
                </span>
                <span className="font-bold tabular-nums text-gym-text">{fmt(p.views)}</span>
              </div>
              <div className="h-2 rounded-full bg-gym-cardInner">
                <div className="h-2 rounded-full bg-gym-limeDark dark:bg-gym-lime" style={{ width: `${top ? (p.views / top) * 100 : 0}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
