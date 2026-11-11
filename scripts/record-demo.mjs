// Records the product walkthrough shown on /demo.
// Needs the dev server running:  npm run dev   then   npm run demo:record
// Output: public/videos/syndiq-fit-demo.webm (served by /api/video).
import { chromium } from 'playwright';
import fs from 'fs';
import os from 'os';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT = path.resolve('public', 'videos', 'syndiq-fit-demo.webm');
const SIZE = { width: 1440, height: 900 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const started = Date.now();
const chapter = (name) => console.log(`${String(Math.round((Date.now() - started) / 1000)).padStart(4)}s  ${name}`);

async function smoothScroll(page, targetY, durationMs = 1200) {
  const startY = await page.evaluate(() => window.scrollY);
  const steps = 30;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    await page.evaluate((y) => window.scrollTo(0, y), startY + (targetY - startY) * eased);
    await sleep(durationMs / steps);
  }
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-recording-'));
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: SIZE, colorScheme: 'dark', recordVideo: { dir: tmp, size: SIZE } });
const page = await context.newPage();
// Hide the Next.js dev badge so it is not in the recording
await page.addInitScript(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const s = document.createElement('style');
    s.textContent = 'nextjs-portal{display:none!important}';
    document.head.appendChild(s);
  });
});
let finished = false;
const nav = (href) => page.locator(`nav[data-nav="desktop"] a[href="${href}"]`);

try {
  /* 1. First open */
  chapter('First open');
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForSelector('a:has-text("Build my program"):visible');
  await sleep(2500);
  await smoothScroll(page, 900);
  await sleep(1200);
  await smoothScroll(page, 0, 900);
  await sleep(600);

  /* 2. Questionnaire */
  chapter('Questionnaire');
  await page.locator('a:has-text("Build my program"):visible').first().click();
  await page.waitForSelector('text=What is your sex?');
  await sleep(900);
  await page.getByRole('radio', { name: /Female/ }).click();
  await sleep(700);
  for (let step = 0; step < 14; step++) {
    const build = page.getByRole('button', { name: /Build my program/ });
    if (await build.count()) {
      await sleep(900);
      await build.click();
      break;
    }
    const preset = page.getByRole('button', { name: /Commercial Gym/ });
    if (await preset.count()) {
      await preset.first().click();
      await sleep(900);
      await smoothScroll(page, 500, 700);
      await sleep(500);
    }
    const next = page.getByRole('button', { name: /^Next/ });
    await next.scrollIntoViewIfNeeded();
    await sleep(700);
    await next.click();
    await sleep(900);
  }

  /* 3. Program */
  chapter('Your program');
  await page.waitForURL('**/program**');
  await page.waitForSelector('article');
  await sleep(2200);
  await smoothScroll(page, 520);
  const rows = page.locator('article');
  for (let i = 0; i < Math.min(4, await rows.count()); i++) {
    await rows.nth(i).hover();
    await sleep(800);
  }
  await page.locator('article button[aria-label*="view instructions"]').first().click();
  await page.waitForSelector('#exercise-detail-title');
  await sleep(2400);
  await page.keyboard.press('Escape');
  await sleep(1200);
  await page.locator('article button:has-text("Replace")').nth(1).click();
  await page.waitForSelector('#exercise-swap-title');
  await sleep(1800);
  await page.getByRole('button', { name: /Use this/ }).first().click();
  await sleep(1500);

  /* 4. Workout player */
  chapter('Training');
  await smoothScroll(page, 420, 600);
  await page.getByRole('button', { name: /Start workout/ }).click();
  const player = page.locator('[role="dialog"][aria-label^="Workout in progress"]');
  await player.waitFor();
  await sleep(1800);
  for (let i = 0; i < 3; i++) {
    const more = player.getByRole('button', { name: 'More weight' });
    if (await more.count()) await more.click();
    await sleep(350);
  }
  await player.getByRole('button', { name: 'Set done' }).click();
  await sleep(3200);
  await player.getByRole('button', { name: 'Skip rest' }).click();
  await sleep(1200);
  await player.getByRole('button', { name: 'Set done' }).click();
  await sleep(2000);
  await player.getByRole('button', { name: 'Skip rest' }).click();
  await sleep(1000);
  await player.getByRole('button', { name: 'Minimise workout' }).click();
  await sleep(1500);

  /* 5. Body map */
  chapter('Body map');
  await nav('/muscle-map').click();
  await page.waitForSelector('text=Body map');
  await sleep(2000);
  // Click one solid shape of the muscle: the group's own centre can fall in the gap between left and right
  await page.locator('g[aria-label="quads"] path').nth(2).click();
  await sleep(1500);
  await page.getByRole('button', { name: 'back', exact: true }).click();
  await sleep(1500);
  await page.locator('g[aria-label="glutes"] path').first().click();
  await sleep(1500);
  await page.getByRole('button', { name: 'male', exact: true }).click();
  await sleep(1500);
  await page.getByRole('button', { name: 'female', exact: true }).click();
  await sleep(1200);

  /* 6. Meals */
  chapter('Meals');
  await nav('/meal-planner').click();
  await page.waitForSelector('text=Set your targets');
  await sleep(1500);
  await smoothScroll(page, 600);
  await sleep(800);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.waitForSelector('text=What’s in your kitchen?');
  await sleep(1500);
  await page.getByRole('button', { name: /Build my meal plan/ }).click();
  await page.waitForSelector('text=This week’s meals');
  await sleep(2000);
  await smoothScroll(page, 900, 1600);
  await sleep(1500);
  await smoothScroll(page, 1700, 1600);
  await sleep(1200);
  await smoothScroll(page, 0, 900);

  /* 7. Home */
  chapter('Home');
  await nav('/').click();
  await page.waitForSelector('text=In this session');
  await sleep(3000);
  chapter('End');
  finished = true;
} finally {
  const video = page.video();
  await context.close();
  await browser.close();
  // Only replace the published video when the whole walkthrough ran
  if (video && finished) {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.copyFileSync(await video.path(), OUT);
    console.log(`Saved ${OUT} (${(fs.statSync(OUT).size / 1048576).toFixed(1)} MB)`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}
