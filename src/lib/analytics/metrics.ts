/**
 * Turns stored counts into the numbers on the admin page. Pure: the same snapshot and day
 * always give the same summary, whichever store the snapshot came from.
 */
import { ANALYTICS_EVENTS, AnalyticsEvent } from './events';
import { addDays, daysBetween } from './days';

export interface AnalyticsDay {
  day: string;
  /** Browser IDs seen that day */
  users: string[];
  events: Partial<Record<AnalyticsEvent, number>>;
  /** Page views by path */
  pages: Record<string, number>;
}

export interface AnalyticsSnapshot {
  /** Browser ID -> first day seen (all time) */
  firstSeen: Record<string, string>;
  /** Browser ID -> last day seen (all time) */
  lastSeen: Record<string, string>;
  /** The requested days, oldest first */
  days: AnalyticsDay[];
  /** Browser IDs that have ever sent each event */
  everDid: Partial<Record<AnalyticsEvent, string[]>>;
}

export interface AnalyticsSummary {
  today: string;
  windowDays: number;
  users: { today: number; week: number; month: number; allTime: number };
  newVsReturning: {
    days: { day: string; new: number; returning: number }[];
    /** First seen inside the window */
    newTotal: number;
    /** Seen inside the window, first seen before it */
    returningTotal: number;
  };
  /** Of the browsers first seen at least 7 days ago, how many were seen again 7 or more days later */
  cameBack: { eligible: number; returned: number; rate: number | null };
  funnel: { visited: number; builtProgram: number; finishedWorkout: number };
  events: {
    days: { day: string; counts: Record<AnalyticsEvent, number> }[];
    totals: Record<AnalyticsEvent, number>;
  };
  topPages: { path: string; views: number }[];
}

export const COME_BACK_DAYS = 7;
const TOP_PAGES = 10;

function zeroCounts(): Record<AnalyticsEvent, number> {
  return Object.fromEntries(ANALYTICS_EVENTS.map((e) => [e, 0])) as Record<AnalyticsEvent, number>;
}

function uniqueAcross(days: AnalyticsDay[]): number {
  const set = new Set<string>();
  for (const d of days) for (const u of d.users) set.add(u);
  return set.size;
}

export function computeSummary(snapshot: AnalyticsSnapshot, today: string): AnalyticsSummary {
  const days = [...snapshot.days].filter((d) => d.day <= today).sort((a, b) => a.day.localeCompare(b.day));
  const windowStart = days.length ? days[0].day : today;
  const inLast = (n: number) => days.filter((d) => daysBetween(d.day, today) < n);
  const { firstSeen, lastSeen } = snapshot;

  // New vs returning
  const perDay = days.map((d) => {
    const fresh = d.users.filter((u) => firstSeen[u] === d.day).length;
    return { day: d.day, new: fresh, returning: d.users.length - fresh };
  });
  const windowUsers = new Set(days.flatMap((d) => d.users));
  let newTotal = 0;
  let returningTotal = 0;
  for (const u of windowUsers) {
    if (firstSeen[u] && firstSeen[u] < windowStart) returningTotal++;
    else newTotal++;
  }

  // Came back after a week
  const cutoff = addDays(today, -COME_BACK_DAYS);
  let eligible = 0;
  let returned = 0;
  for (const [u, first] of Object.entries(firstSeen)) {
    if (first > cutoff) continue;
    eligible++;
    const last = lastSeen[u];
    if (last && daysBetween(first, last) >= COME_BACK_DAYS) returned++;
  }

  // Funnel: a program counts whether it came from the questions or a share link
  const built = new Set([...(snapshot.everDid.program_built ?? []), ...(snapshot.everDid.share_opened ?? [])]);
  const finished = (snapshot.everDid.workout_finished ?? []).filter((u) => built.has(u)).length;

  // Events over time
  const totals = zeroCounts();
  const eventDays = days.map((d) => {
    const counts = zeroCounts();
    for (const e of ANALYTICS_EVENTS) {
      counts[e] = d.events[e] ?? 0;
      totals[e] += counts[e];
    }
    return { day: d.day, counts };
  });

  // Top pages
  const pages = new Map<string, number>();
  for (const d of days) for (const [p, n] of Object.entries(d.pages)) pages.set(p, (pages.get(p) ?? 0) + n);
  const topPages = [...pages.entries()]
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views || a.path.localeCompare(b.path))
    .slice(0, TOP_PAGES);

  return {
    today,
    windowDays: days.length,
    users: {
      today: days.find((d) => d.day === today)?.users.length ?? 0,
      week: uniqueAcross(inLast(7)),
      month: uniqueAcross(inLast(30)),
      allTime: Object.keys(firstSeen).length,
    },
    newVsReturning: { days: perDay, newTotal, returningTotal },
    cameBack: { eligible, returned, rate: eligible ? returned / eligible : null },
    funnel: { visited: Object.keys(firstSeen).length, builtProgram: built.size, finishedWorkout: finished },
    events: { days: eventDays, totals },
    topPages,
  };
}
