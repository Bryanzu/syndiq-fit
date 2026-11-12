import { NextRequest, NextResponse } from 'next/server';
import { isAnalyticsEvent, isAnonId, normalizePath } from '@/lib/analytics/events';
import { analyticsTimezone, dayIn, lastDays } from '@/lib/analytics/days';
import { computeSummary } from '@/lib/analytics/metrics';
import { getAnalyticsStore } from '@/lib/analytics/store';
import { adminDenied, checkAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };
const WINDOW_DAYS = 30;
const MAX_BODY = 512;

// Crawlers that run scripts would otherwise count as visitors
const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|lighthouse|pagespeed/i;

// Events per browser ID, per server instance, to keep a stuck loop or a script from flooding the counts
const recent = new Map<string, number[]>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 200;

function overLimit(id: string): boolean {
  const now = Date.now();
  const list = (recent.get(id) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (list.length >= RATE_MAX) {
    recent.set(id, list);
    return true;
  }
  list.push(now);
  recent.set(id, list);
  if (recent.size > 5000) recent.clear();
  return false;
}

const empty = (status: number) => new NextResponse(null, { status, headers: NO_STORE });

/**
 * POST: record one anonymous event. Body: { id, event, path? }.
 * Nothing else from the request is kept: no IP address, no user agent, no cookies.
 */
export async function POST(req: NextRequest) {
  if (req.headers.get('sec-fetch-site') === 'cross-site') return empty(403);
  if (BOT_UA.test(req.headers.get('user-agent') ?? '')) return empty(204);

  const text = await req.text().catch(() => '');
  if (!text || text.length > MAX_BODY) return empty(400);
  let body: { id?: unknown; event?: unknown; path?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return empty(400);
  }
  if (!body || !isAnonId(body.id) || !isAnalyticsEvent(body.event)) return empty(400);
  if (overLimit(body.id)) return empty(429);

  try {
    await getAnalyticsStore().record({
      id: body.id,
      event: body.event,
      path: body.event === 'visit' ? normalizePath(body.path) : undefined,
      day: dayIn(analyticsTimezone()),
    });
  } catch (err) {
    console.error('Failed to record analytics event:', err);
    return empty(500);
  }
  return empty(204);
}

/** GET: the admin summary. Needs the admin key in the Authorization header. */
export async function GET(req: NextRequest) {
  const access = checkAdmin(req);
  if (access !== 'ok') return adminDenied(access);

  const store = getAnalyticsStore();
  const timezone = analyticsTimezone();
  const today = dayIn(timezone);
  try {
    const snapshot = await store.snapshot(lastDays(today, WINDOW_DAYS));
    return NextResponse.json({ storage: store.kind, timezone, ...computeSummary(snapshot, today) }, { headers: NO_STORE });
  } catch (err) {
    console.error('Failed to read analytics:', err);
    return NextResponse.json({ error: "Couldn't read the counts." }, { status: 500, headers: NO_STORE });
  }
}
