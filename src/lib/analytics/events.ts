/**
 * Anonymous usage events. Shared by the browser (sending) and the server (checking and storing).
 * An event carries only a random browser ID, the event name and, for visits, the page path.
 */

export const ANALYTICS_EVENTS = [
  'visit',
  'program_built',
  'meal_plan_built',
  'workout_started',
  'workout_finished',
  'share_opened',
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export const EVENT_LABELS: Record<AnalyticsEvent, string> = {
  visit: 'Page views',
  program_built: 'Programs built',
  meal_plan_built: 'Meal plans built',
  workout_started: 'Workouts started',
  workout_finished: 'Workouts finished',
  share_opened: 'Share links opened',
};

/** Pages counted by path. Anything else (404s, typos) is stored as `/other`, so no free text from a URL is kept. */
export const TRACKED_PATHS = [
  '/',
  '/questionnaire',
  '/program',
  '/meal-planner',
  '/muscle-map',
  '/feedback',
  '/settings',
  '/about',
  '/demo',
  '/disclaimer',
  '/credits',
] as const;

export const OTHER_PATH = '/other';

export function isAnalyticsEvent(value: unknown): value is AnalyticsEvent {
  return typeof value === 'string' && (ANALYTICS_EVENTS as readonly string[]).includes(value);
}

/** Pathname only (no query or hash, which can hold a shared profile), mapped onto the known pages. */
export function normalizePath(value: unknown): string {
  if (typeof value !== 'string') return OTHER_PATH;
  let p = value.split(/[?#]/)[0].trim().toLowerCase();
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return (TRACKED_PATHS as readonly string[]).includes(p) ? p : OTHER_PATH;
}

/** Browser IDs are random UUIDs (v4 shape). */
const ANON_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function isAnonId(value: unknown): value is string {
  return typeof value === 'string' && ANON_ID_RE.test(value);
}
