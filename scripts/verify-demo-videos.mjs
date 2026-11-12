// Checks every exercise demo video in src/data/exerciseVideos.ts still exists and still allows embedding.
// Needs network access, not the dev server:  npm run verify:videos
// A failing id should be replaced with another checked video, or removed so the exercise falls back to a search.
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const source = fs.readFileSync(path.resolve('./src/data/exerciseVideos.ts'), 'utf8');
const entries = [...source.matchAll(/^\s*'([^']+)': \{ id: '([^']+)'/gm)].map((m) => ({ exercise: m[1], id: m[2] }));

async function get(url) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US' }, signal: AbortSignal.timeout(20000) });
    } catch (err) {
      if (attempt >= 2) throw err;
      await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
    }
  }
}

async function check({ id }) {
  const oembed = await get(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`);
  if (oembed.status !== 200) return `oEmbed returned ${oembed.status}`;
  const html = await (await get(`https://www.youtube.com/watch?v=${id}&hl=en`)).text();
  const status = html.match(/"playabilityStatus":\{"status":"([A-Z_]+)"/)?.[1];
  const embeddable = html.match(/"playableInEmbed":(true|false)/)?.[1];
  if (status !== 'OK') return `playability ${status ?? 'unknown'}`;
  if (embeddable !== 'true') return 'embedding is turned off';
  return '';
}

let failed = 0;
let next = 0;
async function worker() {
  while (next < entries.length) {
    const entry = entries[next++];
    let problem;
    try {
      problem = await check(entry);
    } catch (err) {
      problem = err.message;
    }
    if (problem) {
      failed++;
      console.log(`  [FAIL] ${entry.exercise} ${entry.id}: ${problem}`);
    }
  }
}
await Promise.all(Array.from({ length: 3 }, worker));
console.log(`${entries.length - failed}/${entries.length} demo videos play embedded`);
process.exit(failed > 0 || entries.length === 0 ? 1 : 0);
