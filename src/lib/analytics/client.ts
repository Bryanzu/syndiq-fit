/**
 * Browser side of the anonymous usage counts.
 * Each browser gets a random ID in localStorage (no cookies). Events are sent fire-and-forget
 * and never throw, so tracking can't break the app.
 */
import { AnalyticsEvent, isAnonId } from './events';

export const ANON_ID_KEY = 'syndiq_anon_id';
export const ANALYTICS_ENDPOINT = '/api/analytics';

function randomUUID(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // Plain-http hosts (a phone on the LAN) have no randomUUID; build a v4 UUID by hand
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** This browser's anonymous ID, created on first use. Null when storage is blocked. */
export function getAnonId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(ANON_ID_KEY);
    if (isAnonId(saved)) return saved;
    const id = randomUUID();
    localStorage.setItem(ANON_ID_KEY, id);
    return id;
  } catch {
    return null;
  }
}

// React's dev double-run of effects would send everything twice
let last: { key: string; at: number } | null = null;

export function track(event: AnalyticsEvent, path?: string): void {
  try {
    if (typeof window === 'undefined') return;
    if (window.location.pathname.startsWith('/admin')) return;
    const id = getAnonId();
    if (!id) return;

    const key = `${event}:${path ?? ''}`;
    const now = Date.now();
    if (last && last.key === key && now - last.at < 1000) return;
    last = { key, at: now };

    const body = JSON.stringify(path ? { id, event, path } : { id, event });
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon?.(ANALYTICS_ENDPOINT, blob)) return;
    void fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Counting is best effort
  }
}
