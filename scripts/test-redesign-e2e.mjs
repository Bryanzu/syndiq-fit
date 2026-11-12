// End-to-end check of the redesigned app in a real browser (Playwright).
// Needs the dev server running:  npm run dev   then   npm run test:e2e
// The admin checks need ADMIN_KEY, from the environment or .env.local (the same key the dev server reads).
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_KEY =
  process.env.ADMIN_KEY ||
  (fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8').match(/^ADMIN_KEY=(.*)$/m)?.[1]?.trim() : '') ||
  '';
// Every anonymous usage event the app sends during the run
const sentEvents = [];
// A share link: base64 of a UserProfile (male, intermediate, build muscle, 4 days, 60 min, barbell gym, knee injury)
const PROFILE =
  'eyJnZW5kZXIiOiJtYWxlIiwiYWdlIjoiMjEtMzAiLCJleHBlcmllbmNlIjoiaW50ZXJtZWRpYXRlIiwiZ29hbCI6Im11c2NsZV9idWlsZGluZyIsImZyZXF1ZW5jeSI6NCwiZHVyYXRpb24iOjYwLCJhdmFpbGFibGVFcXVpcG1lbnQiOlsiZHVtYmJlbGxzIiwiYWRqdXN0YWJsZV9iZW5jaCIsImJhcmJlbGwiLCJzcXVhdF9yYWNrIiwicHVsbF91cF9iYXIiLCJhZGp1c3RhYmxlX2NhYmxlX2NvbHVtbiJdLCJpbmp1cmllcyI6WyJrbmVlIl19';

let passed = 0;
let failed = 0;
const pageErrors = [];
function check(label, ok, detail = '') {
  if (ok) passed++;
  else failed++;
  console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${label}${detail ? ` (${detail})` : ''}`);
}

const browser = await chromium.launch();

async function open(viewport, scheme = 'dark') {
  const ctx = await browser.newContext({ viewport, colorScheme: scheme, hasTouch: viewport.width < 600 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => pageErrors.push(e.message));
  // Playwright can't read sendBeacon bodies, so copy each one out before it is sent
  await ctx.exposeBinding('__recordAnalytics', (_source, body) => sentEvents.push(body));
  await ctx.addInitScript((appOrigin) => {
    if (location.origin !== appOrigin) return; // leave embedded frames (YouTube) alone
    const send = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (url, data) => {
      if (String(url).endsWith('/api/analytics') && data instanceof Blob) data.text().then((t) => window.__recordAnalytics(t));
      return send(url, data);
    };
  }, new URL(BASE).origin);
  // The Next.js dev overlay badge sits over the bottom-left of the page and intercepts taps
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style');
      s.textContent = 'nextjs-portal{display:none!important}';
      document.head.appendChild(s);
    });
  });
  return { ctx, page };
}

/* ------------------------------------------------------------------ */
console.log('\n--- Phone: first open, home, workout player ---');
{
  const { ctx, page } = await open({ width: 390, height: 844 });
  const nav = page.locator('nav[data-nav="mobile"]');
  // A shrunk pill hides the other tabs, so go back to the top (which opens it) before tapping one
  const tapTab = async (href) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await nav.locator(`a[href="${href}"]`).click();
  };
  const player = page.locator('[role="dialog"][aria-label^="Workout in progress"]');
  const mini = page.locator('[data-mini-player]');

  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForSelector('a:has-text("Build my program"):visible');
  check('First-open screen shows the call to action', true);
  check('Pill navigation is hidden on the first-open screen', (await nav.count()) === 0);

  await page.goto(`${BASE}/program?p=${PROFILE}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('article');
  check('Share link builds a program', (await page.locator('article').count()) >= 4);
  check('Program header shows the plain program name', (await page.locator('h1').first().innerText()).includes('Build muscle'));
  const rowPhoto = page.locator('article img').first();
  await rowPhoto.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  check('Exercise rows show a photo', await rowPhoto.evaluate((img) => img.complete && img.naturalWidth > 0));
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(500);
  check('Pill shrinks while scrolling down', (await nav.getAttribute('data-compact')) === 'true');
  check('Shrunk pill keeps all five tabs in the page', (await nav.locator('a').count()) === 5);
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);
  check('Pill opens again when scrolling up', (await nav.getAttribute('data-compact')) === 'false');

  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForSelector('text=In this session');
  check('Pill navigation shows five tabs on Home', (await nav.locator('a').count()) === 5);
  check('Active tab is Home', (await nav.locator('a[aria-current="page"]').getAttribute('href')) === '/');

  // Slide to start: a short drag must not start, a long drag must
  const thumb = page.locator('button[aria-label^="Slide to"]');
  let b = await thumb.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + 70, b.y + b.height / 2, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  check('Short slide does not start the workout', (await player.count()) === 0);
  b = await thumb.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + 310, b.y + b.height / 2, { steps: 8 });
  await page.mouse.up();
  await player.waitFor();
  check('Full slide opens the workout player', true);

  // Log a set with weight and reps
  await player.getByRole('button', { name: 'More weight' }).click();
  await player.getByRole('button', { name: 'More weight' }).click();
  await player.getByRole('button', { name: 'Set done' }).click();
  await player.locator('[role="timer"]').waitFor();
  check('Completing a set starts the rest timer', true);
  const history = await page.evaluate(() => JSON.parse(localStorage.getItem('syndiq_lift_history') || '{}'));
  const firstEntry = Object.values(history)[0]?.[0];
  check('Set is logged with its weight', firstEntry?.weight === 5, JSON.stringify(firstEntry));
  await player.getByRole('button', { name: 'Skip rest' }).click();
  check('Last-time tile shows the logged weight', (await player.innerText()).includes('5 kg'));

  await player.getByRole('button', { name: 'Minimise workout' }).click();
  await mini.waitFor();
  check('Minimising shows the mini player', (await mini.innerText()).includes('Set 2'));
  check('Page scroll is restored while minimised', await page.evaluate(() => !document.body.classList.contains('modal-open')));

  await page.reload({ waitUntil: 'networkidle' });
  await mini.waitFor();
  check('Workout survives a reload', true);

  // Finish everything
  await mini.locator('button[aria-label^="Open workout"]').click();
  await player.waitFor();
  for (let guard = 0; guard < 90; guard++) {
    if (await page.locator('#workout-summary-title').count()) break;
    const skip = player.getByRole('button', { name: 'Skip rest' });
    if (await skip.count()) await skip.click();
    else await player.getByRole('button', { name: 'Set done' }).click();
    await page.waitForTimeout(40);
  }
  await page.locator('#workout-summary-title').waitFor();
  const summary = (await page.locator('[role="dialog"]').innerText()).replace(/\n/g, ' ');
  check('Summary shows every set done', /(\d+)\/\1\s*sets/.test(summary), summary.slice(0, 90));
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.waitForSelector('text=Recent');
  await page.waitForTimeout(800);
  check('Home counts the session this week', /1\s*of 4 this week/.test((await page.locator('main').innerText()).replace(/\n/g, ' ')));

  /* Body map */
  console.log('\n--- Phone: body map ---');
  await tapTab('/muscle-map');
  await page.waitForURL('**/muscle-map');
  await page.waitForSelector('text=Body map');
  check('Body map shows sets logged this week', /\d+ sets? this week/.test(await page.locator('main').innerText()));
  await page.getByRole('button', { name: 'back', exact: true }).click();
  await page.locator('g[aria-label="glutes"] path').first().click();
  check('Tapping a muscle on the figure selects it', (await page.locator('main h2').first().innerText()) === 'Glutes');
  await page.getByRole('button', { name: /^Chest/ }).click();
  await page.waitForTimeout(300);
  check('Choosing a front muscle turns the figure around', (await page.getByRole('button', { name: 'front', exact: true }).getAttribute('aria-pressed')) === 'true');
  check('No sideways scrolling on the body map', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

  /* Sheets */
  console.log('\n--- Phone: sheets ---');
  await tapTab('/program');
  await page.waitForURL('**/program');
  await page.waitForSelector('article');
  await page.locator('article button[aria-label*="view instructions"]').first().click();
  await page.waitForSelector('.sheet-panel');
  await page.waitForTimeout(600);
  const box = await page.locator('.sheet-panel').boundingBox();
  check('Sheet is anchored to the bottom of the screen', Math.round(box.y + box.height) === 844 && box.x === 0, JSON.stringify(box));
  const grab = await page.locator('.sheet-panel > div').first().boundingBox();
  await page.mouse.move(grab.x + grab.width / 2, grab.y + 8);
  await page.mouse.down();
  await page.mouse.move(grab.x + grab.width / 2, grab.y + 230, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  check('Dragging the sheet down dismisses it', (await page.locator('.sheet-panel').count()) === 0);

  /* Meals */
  console.log('\n--- Phone: meal planner ---');
  await tapTab('/meal-planner');
  await page.waitForURL('**/meal-planner');
  const mealFlow = page.locator('[role="dialog"][aria-label="Plan your meals"]');
  await mealFlow.waitFor();
  check('Meal questions reuse the workout answers', (await mealFlow.innerText()).includes('From your program'));
  for (let i = 0; i < 4; i++) {
    await mealFlow.getByRole('button', { name: 'Continue' }).click();
    await page.waitForTimeout(450);
  }
  await mealFlow.getByRole('button', { name: 'Build my meal plan' }).click();
  await mealFlow.getByRole('button', { name: 'See my week' }).click();
  await page.waitForSelector('text=This week’s meals');
  const plan = await page.evaluate(() => JSON.parse(localStorage.getItem('syndiq_meal_plan')));
  const gap = Math.abs(plan.averageDailyCalories - plan.profile.targetCalories);
  check('Meal plan lands within 150 kcal of the target', gap <= 150, `${plan.averageDailyCalories} vs ${plan.profile.targetCalories}`);
  check('Meal plan stores the height it was built with', typeof plan.profile.heightCm === 'number');
  await tapTab('/muscle-map');
  await page.waitForSelector('text=Body map');
  await page.getByRole('button', { name: 'female', exact: true }).click();
  check('Body map switches to the female figure', (await page.locator('svg[aria-label*="female body"]').count()) === 1);
  await page.waitForTimeout(300);
  const firstMove = await page.locator('section ul li p').first().innerText();
  check('Female body map opens on the glutes, hip thrust first', (await page.locator('main h2').first().innerText()) === 'Glutes' && firstMove.includes('Hip Thrust'), firstMove);
  await ctx.close();
}

/* ------------------------------------------------------------------ */
console.log('\n--- Phone: workout questionnaire ---');
{
  const { ctx, page } = await open({ width: 390, height: 844 });
  const flow = page.locator('[role="dialog"][aria-label="Build your program"]');
  const cont = async () => {
    await flow.getByRole('button', { name: 'Continue' }).click();
    await page.waitForTimeout(450);
  };
  await page.goto(BASE + '/questionnaire', { waitUntil: 'networkidle' });
  await flow.waitFor();
  check('Questionnaire opens full screen on its first question', (await flow.locator('h2').first().innerText()).includes('sex'));
  await flow.getByRole('radio', { name: /Female/ }).click();
  const wheel = flow.getByRole('spinbutton', { name: 'Age' });
  await wheel.waitFor();
  check('A single-choice answer moves on by itself', true);
  await wheel.focus();
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(800);
  check('Age wheel responds to the keyboard', (await wheel.getAttribute('aria-valuetext')) === '27 years');
  await cont();
  await flow.getByRole('radio', { name: /1 to 3 years/ }).click();
  await flow.getByRole('radio', { name: 'Shape' }).waitFor();
  await cont();
  await flow.getByRole('radio', { name: '3 days' }).click();
  check('Days screen names the split', (await flow.innerText()).includes('Full body'));
  await cont();
  const slider = flow.getByRole('slider', { name: 'Minutes per session' });
  const track = await slider.boundingBox();
  await page.mouse.move(track.x + track.width * 0.5, track.y + 20);
  await page.mouse.down();
  await page.mouse.move(track.x + track.width * 0.72, track.y + 20, { steps: 8 });
  await page.mouse.up();
  check('Dragging the session pointer snaps to the next stop', (await slider.getAttribute('aria-valuenow')) === '90');
  await cont();
  await flow.getByRole('radio', { name: /Home gym/ }).click();
  await flow.getByRole('button', { name: /Fine-tune the list/ }).click();
  const sheet = page.locator('[role="dialog"][aria-labelledby="equipment-sheet-title"]');
  await sheet.waitFor();
  await sheet.getByRole('switch', { name: /Kettlebells/ }).click();
  await sheet.getByRole('button', { name: 'Done' }).click();
  await page.waitForTimeout(400);
  check('Fine-tuning the kit leaves no setup selected', (await flow.locator('[role="radio"][aria-checked="true"]').count()) === 0);
  await cont();
  await flow.getByRole('checkbox', { name: 'Knee' }).click();
  check('Picking a sore joint says what gets swapped', (await flow.innerText()).includes('leg press'));
  await flow.getByRole('button', { name: 'Build my program' }).click();
  await flow.getByRole('button', { name: 'See my program' }).waitFor({ timeout: 8000 });
  const profile = await page.evaluate(() => JSON.parse(localStorage.getItem('syndiq_active_profile')));
  check(
    'Answers are saved with the program',
    profile.gender === 'female' && profile.ageYears === 27 && profile.age === '21-30' && profile.frequency === 3 &&
      profile.availableEquipment.includes('kettlebells') && profile.injuries.includes('knee'),
    JSON.stringify(profile)
  );
  await flow.getByRole('button', { name: 'See my program' }).click();
  await page.waitForURL('**/program');
  await page.waitForSelector('article');
  check('The result opens the new program', (await page.locator('article').count()) >= 3);
  check('Page scroll is restored after the questionnaire', await page.evaluate(() => !document.body.classList.contains('modal-open')));

  // With a program in use, the questionnaire asks first and keeps the old program
  const ids = () =>
    page.evaluate(() => ({
      active: JSON.parse(localStorage.getItem('syndiq_active_program')).id,
      archive: JSON.parse(localStorage.getItem('syndiq_program_archive') || '[]').map((e) => e.program.id),
    }));
  const firstId = (await ids()).active;
  await page.goto(BASE + '/questionnaire', { waitUntil: 'networkidle' });
  await flow.waitFor();
  check('A second visit asks before replacing the program', (await flow.innerText()).includes('You already have a program'));
  await flow.getByRole('button', { name: 'Build a new one' }).click();
  await page.waitForTimeout(450);
  for (let i = 0; i < 7; i++) await cont();
  await flow.getByRole('button', { name: 'Build my program' }).click();
  await flow.getByRole('button', { name: 'See my program' }).waitFor({ timeout: 8000 });
  const built = await ids();
  check('Building a new program keeps the old one', built.active !== firstId && built.archive.join() === firstId, JSON.stringify(built));
  await page.goto(BASE + '/settings', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Restore' }).click();
  await page.waitForTimeout(300);
  const restored = await ids();
  check('Restoring a previous program swaps it back', restored.active === firstId && restored.archive.join() === built.active, JSON.stringify(restored));
  await page.evaluate(() => {
    const list = JSON.parse(localStorage.getItem('syndiq_program_archive'));
    list[0].archivedAt = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem('syndiq_program_archive', JSON.stringify(list));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  check('Programs older than 30 days are deleted', await page.evaluate(() => !localStorage.getItem('syndiq_program_archive')));
  await page.goto(`${BASE}/questionnaire?edit=1`, { waitUntil: 'networkidle' });
  await flow.waitFor();
  check('"Edit answers" goes straight to the questions', (await flow.innerText()).includes('1 of 8'));
  await ctx.close();
}

/* ------------------------------------------------------------------ */
console.log('\n--- Phone: demo videos ---');
{
  const { ctx, page } = await open({ width: 390, height: 844 });
  const player = page.locator('[data-demo-player]');
  const embed = page.locator('[data-demo-player="embed"] iframe');
  const openFirstDemo = async () => {
    await page.locator('article button:has-text("Demo")').first().click();
    await player.waitFor();
  };
  // Saved programs keep a copy of each exercise; rewrite the first one and reload
  const editFirstExercise = async (fn) => {
    await page.evaluate((src) => {
      const program = JSON.parse(localStorage.getItem('syndiq_active_program'));
      new Function('ex', src)(program.days[0].exercises[0].exercise);
      localStorage.setItem('syndiq_active_program', JSON.stringify(program));
    }, fn);
    await page.goto(BASE + '/program', { waitUntil: 'networkidle' });
    await page.waitForSelector('article');
  };

  await page.goto(`${BASE}/program?p=${PROFILE}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('article');
  await openFirstDemo();
  const src = (await embed.getAttribute('src')) || '';
  check('Demo opens a YouTube player inside the app', /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}\?/.test(src), src);
  const video = page.frameLocator('[data-demo-player="embed"] iframe').locator('video');
  let playing = null;
  try {
    await video.waitFor({ state: 'attached', timeout: 20000 });
    await page.waitForTimeout(5000);
    playing = await video.evaluate((v) => ({ paused: v.paused, time: Math.round(v.currentTime * 10) / 10 }));
  } catch (err) {
    playing = { error: err.message.split('\n')[0] };
  }
  check('Demo video plays embedded', playing?.paused === false && playing.time > 0, JSON.stringify(playing));
  check('Demo credits the video’s channel', /^Video by .+/.test(await page.locator('[role="dialog"] h3 + p').innerText()));
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.waitForTimeout(300);
  check('Closing the demo removes the player', (await player.count()) === 0);

  await editFirstExercise("ex.youtubeId = ''; ex.youtubeUrl = 'https://www.youtube.com/results?search_query=x';");
  await openFirstDemo();
  check('Programs saved before the videos still play them', (await embed.count()) === 1);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  await editFirstExercise("ex.id = 'not-in-the-library'; ex.youtubeId = ''; ex.youtubeUrl = 'https://www.youtube.com/results?search_query=x';");
  await openFirstDemo();
  check(
    'An exercise without a video falls back to a YouTube search',
    (await embed.count()) === 0 && (await page.locator('[data-demo-player="search"] a[href*="youtube.com/results"]').count()) === 1
  );
  await page.keyboard.press('Escape');

  await page.goto(BASE + '/muscle-map', { waitUntil: 'networkidle' });
  await page.locator('button[aria-label$=" demo"]').first().click();
  await player.waitFor();
  check('Body map demo buttons play the video too', (await embed.count()) === 1);
  await ctx.close();
}

/* ------------------------------------------------------------------ */
console.log('\n--- Desktop and light theme ---');
{
  const { ctx, page } = await open({ width: 1280, height: 800 }, 'light');
  await page.addInitScript(() => localStorage.setItem('syndiq_theme', 'light'));
  await page.goto(`${BASE}/program?p=${PROFILE}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('article');
  check('Pill navigation is hidden on desktop', !(await page.locator('nav[data-nav="mobile"]').isVisible()));
  check('Desktop navigation is visible', await page.locator('nav[data-nav="desktop"]').isVisible());
  check('Light theme is applied', await page.evaluate(() => document.documentElement.classList.contains('light')));
  await page.locator('article button:has-text("Replace")').first().click();
  await page.waitForSelector('.sheet-panel');
  await page.waitForTimeout(500);
  const box = await page.locator('.sheet-panel').boundingBox();
  check('On desktop the sheet is a centred dialog', box.x > 100 && box.y > 20, JSON.stringify(box));
  await ctx.close();
}

/* ------------------------------------------------------------------ */
console.log('\n--- Anonymous analytics and admin lock ---');
{
  const { ctx, page } = await open({ width: 390, height: 844 });
  await page.goto(BASE + '/about', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => localStorage.getItem('syndiq_anon_id'), null, { timeout: 10000 }).catch(() => {});
  const anonId = await page.evaluate(() => localStorage.getItem('syndiq_anon_id'));
  check('Each browser gets a random anonymous ID', /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(anonId || ''), anonId);
  await page.waitForTimeout(500);

  const bodies = sentEvents.map((b) => {
    try {
      return JSON.parse(b);
    } catch {
      return null;
    }
  });
  const kinds = new Set(bodies.map((b) => b?.event));
  const expected = ['visit', 'program_built', 'meal_plan_built', 'workout_started', 'workout_finished', 'share_opened'];
  check('Visits, programs, meal plans, workouts and share links are all counted', expected.every((e) => kinds.has(e)), [...kinds].join(', '));
  check(
    'Events carry only an ID, the event name and a page path',
    bodies.length > 0 &&
      bodies.every((b) => b && Object.keys(b).every((k) => ['id', 'event', 'path'].includes(k)) && !String(b.path ?? '').includes('?')),
    `${bodies.length} events`
  );
  check('Opening the about page is counted as a visit to /about', bodies.some((b) => b?.id === anonId && b.event === 'visit' && b.path === '/about'));

  const api = ctx.request;
  const noKey = await api.get(BASE + '/api/analytics');
  const noKeyBody = await noKey.json().catch(() => ({}));
  check('Admin counts are locked without the key', [401, 503].includes(noKey.status()) && !('users' in noKeyBody), String(noKey.status()));
  const wrongKey = await api.get(BASE + '/api/analytics', { headers: { Authorization: 'Bearer not-the-key' } });
  check('A wrong key is refused', [401, 429, 503].includes(wrongKey.status()), String(wrongKey.status()));
  const inUrl = await api.get(`${BASE}/api/feedback?key=${encodeURIComponent(ADMIN_KEY || 'x')}`);
  check('Feedback admin no longer accepts the key in the URL', !inUrl.ok(), String(inUrl.status()));

  const withKey = await api.get(BASE + '/api/analytics', { headers: { Authorization: `Bearer ${ADMIN_KEY}` } });
  const stats = await withKey.json().catch(() => ({}));
  check(
    'With the key, the counts include this run (set ADMIN_KEY in .env.local)',
    withKey.ok() && stats.users?.today >= 1 && expected.every((e) => stats.events?.totals?.[e] >= 1) && stats.topPages?.length > 0,
    withKey.ok() ? JSON.stringify(stats.users) : String(withKey.status())
  );

  // The admin page itself
  await page.goto(BASE + '/admin/analytics', { waitUntil: 'networkidle' });
  const keyField = page.getByLabel('Admin key');
  check('Admin page shows only the key form without a key', (await keyField.count()) === 1 && (await page.locator('[data-tile]').count()) === 0);
  await keyField.fill('not-the-key');
  await page.getByRole('button', { name: 'Open' }).click();
  // Next.js has its own role="alert" route announcer, so find the message by id
  await page.locator('#admin-key-error').waitFor();
  check('Admin page says when the key is wrong', (await page.locator('#admin-key-error').innerText()).includes('didn’t work'));
  await keyField.fill(ADMIN_KEY);
  await page.getByRole('button', { name: 'Open' }).click();
  await page.locator('[data-tile="All time"]').waitFor({ timeout: 10000 }).catch(() => {});
  const allTime = Number(((await page.locator('[data-tile="All time"]').innerText().catch(() => '')) || '').replace(/\D/g, ''));
  check(
    'The right key opens the dashboard with the counts',
    allTime >= 1 && (await page.locator('[data-event]').count()) === 6 && (await page.getByRole('heading', { name: 'Top pages' }).count()) === 1,
    String(allTime)
  );
  check('Admin pages are not counted as visits', !sentEvents.some((b) => b.includes('"/admin')));
  await ctx.close();
}

await browser.close();
check('No page errors', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '));
console.log(`\nTOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}\n`);
process.exit(failed > 0 ? 1 : 0);
