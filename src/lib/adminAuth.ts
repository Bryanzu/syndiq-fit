/**
 * Server-side check for the admin pages (feedback review, analytics).
 * The key lives only in the server's environment: ADMIN_KEY, or the older ADMIN_FEEDBACK_KEY.
 * There is no built-in fallback key, and the key is read from request headers only, never the URL.
 */
import { createHash, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export type AdminCheck = 'ok' | 'unauthorized' | 'not_configured' | 'too_many';

function configuredKey(): string | null {
  const key = (process.env.ADMIN_KEY || process.env.ADMIN_FEEDBACK_KEY || '').trim();
  return key || null;
}

function presentedKey(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7).trim() || null;
  return req.headers.get('x-admin-key')?.trim() || null;
}

const digest = (s: string) => createHash('sha256').update(s).digest();

// Wrong keys per client, held in memory for a few minutes to slow down guessing. Never written anywhere.
const failures = new Map<string, number[]>();
const FAIL_WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILS = 10;

export function checkAdmin(req: NextRequest): AdminCheck {
  const key = configuredKey();
  if (!key) return 'not_configured';

  const client = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const now = Date.now();
  const recent = (failures.get(client) ?? []).filter((t) => now - t < FAIL_WINDOW_MS);
  if (recent.length >= MAX_FAILS) {
    failures.set(client, recent);
    return 'too_many';
  }

  const given = presentedKey(req);
  // No key at all is not a guess, so it doesn't count towards the limit
  if (!given) return 'unauthorized';
  if (timingSafeEqual(digest(given), digest(key))) {
    failures.delete(client);
    return 'ok';
  }
  recent.push(now);
  failures.set(client, recent);
  return 'unauthorized';
}

/** The error response for any result other than 'ok'. */
export function adminDenied(result: Exclude<AdminCheck, 'ok'>): NextResponse {
  const [status, error] =
    result === 'not_configured'
      ? [503, 'Admin access is not set up. Add ADMIN_KEY to the server environment.']
      : result === 'too_many'
        ? [429, 'Too many wrong keys. Try again in a few minutes.']
        : [401, 'Wrong or missing admin key.'];
  return NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });
}
