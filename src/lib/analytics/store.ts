/**
 * Where anonymous usage counts are kept (server only).
 *
 * - `redis`: Upstash Redis over its REST API, used whenever its env vars are set. Works on Vercel.
 *   Vercel's Marketplace sets KV_REST_API_URL / KV_REST_API_TOKEN; Upstash's own dashboard gives
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN. Either pair works.
 * - `file`: data/analytics.json, for local development and tests.
 * - `none`: on Vercel without Redis. Events are dropped, because the server's disk doesn't persist there.
 */
import fs from 'fs';
import path from 'path';
import { ANALYTICS_EVENTS, AnalyticsEvent } from './events';
import { AnalyticsDay, AnalyticsSnapshot } from './metrics';

export type StorageKind = 'redis' | 'file' | 'none';

export interface StoredEvent {
  id: string;
  event: AnalyticsEvent;
  /** Only for visits */
  path?: string;
  day: string;
}

export interface AnalyticsStore {
  kind: StorageKind;
  record(e: StoredEvent): Promise<void>;
  snapshot(days: string[]): Promise<AnalyticsSnapshot>;
}

/* ------------------------------------------------------------------ */
/* Redis (Upstash REST)                                                */
/* ------------------------------------------------------------------ */

function redisConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ''), token } : null;
}

type Command = (string | number)[];

async function pipeline(cfg: { url: string; token: string }, commands: Command[]): Promise<unknown[]> {
  const res = await fetch(`${cfg.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Redis responded ${res.status}`);
  const out = (await res.json()) as { result?: unknown; error?: string }[];
  const failed = out.find((r) => r.error);
  if (failed) throw new Error(`Redis error: ${failed.error}`);
  return out.map((r) => r.result);
}

/** HGETALL over REST comes back as a flat [field, value, field, value] list */
function pairs(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!Array.isArray(raw)) return out;
  for (let i = 0; i + 1 < raw.length; i += 2) out[String(raw[i])] = String(raw[i + 1]);
  return out;
}

function counts(raw: unknown): Record<string, number> {
  return Object.fromEntries(Object.entries(pairs(raw)).map(([k, v]) => [k, Number(v) || 0]));
}

export function redisStore(cfg: { url: string; token: string }): AnalyticsStore {
  // Preview deployments and local runs keep their own counts, apart from production
  const k = `sf:${process.env.VERCEL_ENV || 'local'}:`;
  return {
    kind: 'redis',
    async record({ id, event, path: page, day }) {
      const commands: Command[] = [
        ['HSETNX', `${k}first`, id, day],
        ['HSET', `${k}last`, id, day],
        ['SADD', `${k}day:${day}:users`, id],
        ['HINCRBY', `${k}day:${day}:events`, event, 1],
      ];
      if (event === 'visit') commands.push(['HINCRBY', `${k}day:${day}:pages`, page ?? '/other', 1]);
      else commands.push(['SADD', `${k}ever:${event}`, id]);
      await pipeline(cfg, commands);
    },
    async snapshot(days) {
      const ever = ANALYTICS_EVENTS.filter((e) => e !== 'visit');
      const commands: Command[] = [
        ['HGETALL', `${k}first`],
        ['HGETALL', `${k}last`],
        ...ever.map((e): Command => ['SMEMBERS', `${k}ever:${e}`]),
        ...days.flatMap((d): Command[] => [
          ['SMEMBERS', `${k}day:${d}:users`],
          ['HGETALL', `${k}day:${d}:events`],
          ['HGETALL', `${k}day:${d}:pages`],
        ]),
      ];
      const r = await pipeline(cfg, commands);
      const base = 2 + ever.length;
      return {
        firstSeen: pairs(r[0]),
        lastSeen: pairs(r[1]),
        everDid: Object.fromEntries(ever.map((e, i) => [e, (r[2 + i] as string[]) ?? []])),
        days: days.map((day, i) => ({
          day,
          users: (r[base + i * 3] as string[]) ?? [],
          events: counts(r[base + i * 3 + 1]),
          pages: counts(r[base + i * 3 + 2]),
        })),
      };
    },
  };
}

/* ------------------------------------------------------------------ */
/* Local JSON file                                                     */
/* ------------------------------------------------------------------ */

interface FileData {
  firstSeen: Record<string, string>;
  lastSeen: Record<string, string>;
  days: Record<string, AnalyticsDay>;
  everDid: Partial<Record<AnalyticsEvent, string[]>>;
}

const emptyFile = (): FileData => ({ firstSeen: {}, lastSeen: {}, days: {}, everDid: {} });

export function fileStore(file: string): AnalyticsStore {
  async function read(): Promise<FileData> {
    try {
      const data = JSON.parse(await fs.promises.readFile(file, 'utf-8'));
      return { ...emptyFile(), ...data };
    } catch {
      return emptyFile();
    }
  }

  // One write at a time, so parallel events don't overwrite each other
  let queue: Promise<void> = Promise.resolve();

  return {
    kind: 'file',
    record(e) {
      queue = queue
        .then(async () => {
          const data = await read();
          data.firstSeen[e.id] ??= e.day;
          data.lastSeen[e.id] = e.day;
          const d = (data.days[e.day] ??= { day: e.day, users: [], events: {}, pages: {} });
          if (!d.users.includes(e.id)) d.users.push(e.id);
          d.events[e.event] = (d.events[e.event] ?? 0) + 1;
          if (e.event === 'visit') {
            const p = e.path ?? '/other';
            d.pages[p] = (d.pages[p] ?? 0) + 1;
          } else {
            const ids = (data.everDid[e.event] ??= []);
            if (!ids.includes(e.id)) ids.push(e.id);
          }
          await fs.promises.mkdir(path.dirname(file), { recursive: true });
          const tmp = `${file}.tmp.${Date.now()}`;
          await fs.promises.writeFile(tmp, JSON.stringify(data), 'utf-8');
          await fs.promises.rename(tmp, file);
        })
        .catch((err) => console.error('Failed to record analytics event:', err));
      return queue;
    },
    async snapshot(days) {
      await queue;
      const data = await read();
      return {
        firstSeen: data.firstSeen,
        lastSeen: data.lastSeen,
        everDid: data.everDid,
        days: days.map((day) => data.days[day] ?? { day, users: [], events: {}, pages: {} }),
      };
    },
  };
}

/* ------------------------------------------------------------------ */

const noStore: AnalyticsStore = {
  kind: 'none',
  async record() {},
  async snapshot(days) {
    return { firstSeen: {}, lastSeen: {}, everDid: {}, days: days.map((day) => ({ day, users: [], events: {}, pages: {} })) };
  },
};

let cached: AnalyticsStore | null = null;

export function getAnalyticsStore(): AnalyticsStore {
  if (cached) return cached;
  const redis = redisConfig();
  if (redis) cached = redisStore(redis);
  else if (process.env.VERCEL) cached = noStore;
  else cached = fileStore(process.env.ANALYTICS_FILE || path.join(process.cwd(), 'data', 'analytics.json'));
  return cached;
}
