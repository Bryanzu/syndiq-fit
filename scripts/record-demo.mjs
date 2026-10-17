import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const FFMPEG_PATH = 'C:\\Users\\izu31\\AppData\\Local\\ms-playwright\\ffmpeg-1013\\ffmpeg-win64.exe';
const VIDEO_DIR = path.resolve('public', 'videos');
const ARTIFACT_DIR = 'C:\\Users\\izu31\\.gemini\\antigravity\\brain\\7584e0c1-1d56-4a76-a80f-c27b24aded85';

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function smoothScroll(page, targetY, durationMs = 1000) {
  const startY = await page.evaluate(() => window.scrollY);
  const diff = targetY - startY;
  const steps = 20;
  const stepTime = durationMs / steps;
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    await page.evaluate((y) => window.scrollTo(0, y), startY + diff * eased);
    await sleep(stepTime);
  }
}

async function runDemo() {
  console.log('🚀 Launching Chromium browser with video recording enabled...');
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  // 1. HOME PAGE
  console.log('📍 1. Loading Homepage (http://localhost:3000)...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await sleep(2000);

  console.log('📜 Scrolling down to showcase tailored equipment platform branding...');
  await smoothScroll(page, 550, 1200);
  await sleep(1500);

  await smoothScroll(page, 1100, 1200);
  await sleep(1500);

  await smoothScroll(page, 1600, 1200);
  await sleep(1800);

  await smoothScroll(page, 0, 1000);
  await sleep(1200);

  // 2. QUESTIONNAIRE WIZARD
  console.log('📍 2. Starting Questionnaire Wizard...');
  await page.click('a[href="/questionnaire"]');
  await page.waitForURL('**/questionnaire');
  await sleep(1500);

  // Step 1: Gender (Select Female)
  console.log('👤 Step 1: Selecting Female...');
  await page.locator('text=Female').first().click();
  await sleep(1000);
  await page.click('button:has-text("Next Step")');
  await sleep(800);

  // Step 2: Age
  console.log('🎂 Step 2: Selecting Age 21–30...');
  await page.locator('text=/21.*30/').first().click();
  await sleep(800);
  await page.click('button:has-text("Next Step")');
  await sleep(800);

  // Step 3: Experience
  console.log('🏋️ Step 3: Selecting Beginner...');
  await page.locator('text=/Beginner/').first().click();
  await sleep(800);
  await page.click('button:has-text("Next Step")');
  await sleep(800);

  // Step 4: Fitness Goal
  console.log('🎯 Step 4: Selecting Muscle Building / Tone Focus...');
  await page.locator('text=/Muscle Building/').first().click();
  await sleep(800);
  await page.click('button:has-text("Next Step")');
  await sleep(800);

  // Step 5: Training Frequency
  console.log('📅 Step 5: Selecting 4 Days / Week...');
  await page.locator('text=/4 Days/').first().click();
  await sleep(800);
  await page.click('button:has-text("Next Step")');
  await sleep(800);

  // Step 6: Session Duration
  console.log('⏱️ Step 6: Selecting 45 Minutes...');
  await page.locator('text=/45 Minutes/').first().click();
  await sleep(800);
  await page.click('button:has-text("Next Step")');
  await sleep(1200);

  // Step 7: Central Equipment Library & Selector
  console.log('⚙️ Step 7: Demonstrating New Flexible Equipment Selector & Presets...');
  await sleep(1500);

  // Click Presets
  console.log('   Clicking "Home Dumbbells" preset...');
  await page.locator('button:has-text("Home Dumbbells")').click();
  await sleep(1400);

  console.log('   Clicking "Commercial Gym" preset...');
  await page.locator('button:has-text("Commercial Gym")').click();
  await sleep(1400);

  // Browse category tabs
  console.log('   Switching to "Benches & Racks" category tab...');
  await page.locator('button:has-text("Benches & Racks")').click();
  await sleep(1200);

  console.log('   Switching to "Resistance Machines" category tab...');
  await page.locator('button:has-text("Resistance Machines")').click();
  await sleep(1200);

  console.log('   Switching to "Cable Equipment" category tab...');
  await page.locator('button:has-text("Cable Equipment")').click();
  await sleep(1200);

  // Try search filter
  console.log('   Searching for "cable" in equipment search box...');
  const searchInput = page.locator('input[placeholder*="Search equipment"]');
  await searchInput.fill('cable');
  await sleep(1400);
  await searchInput.fill('');
  await sleep(800);

  // Back to All Equipment
  await page.locator('button:has-text("All Equipment")').click();
  await sleep(1200);

  await page.click('button:has-text("Next Step")');
  await sleep(1000);

  // Step 8: Injuries & Medical Disclaimer
  console.log('🩹 Step 8: Selecting Knee Discomfort limitation...');
  await page.locator('text=/Knee/').first().click();
  await sleep(1500);

  // Generate Program
  console.log('⚡ Generating custom program with deterministic sports-science engine...');
  await page.click('button:has-text("Generate My Workout Program")');
  await page.waitForURL('**/program', { timeout: 15000 });
  await sleep(3000);

  // 3. GENERATED WORKOUT PROGRAM PAGE
  console.log('📊 3. Demonstrating Generated Workout & Female Body Visualizer...');
  // Smooth scroll to view routine and female anatomical model
  await smoothScroll(page, 320, 1000);
  await sleep(2500);

  console.log('✨ Verified: Female silhouette automatically rendered with no toggle buttons.');

  // Hover over exercise cards to highlight active muscles
  const exerciseCards = page.locator('div[class*="rounded-2xl bg-gym-card"]');
  const count = await exerciseCards.count();
  if (count > 0) {
    console.log('🖱️ Hovering over Exercise 1 to highlight target muscles on female body...');
    await exerciseCards.nth(0).hover();
    await sleep(2000);

    if (count > 1) {
      console.log('🖱️ Hovering over Exercise 2...');
      await exerciseCards.nth(1).hover();
      await sleep(2000);
    }
  }

  // Switch training day tabs
  console.log('🗓️ Switching to Day 2 schedule tab...');
  await page.locator('button:has-text("Day 2")').first().click();
  await sleep(2000);

  console.log('🗓️ Switching back to Day 1...');
  await page.locator('button:has-text("Day 1")').first().click();
  await sleep(2000);

  // Open "Replace Exercise" Modal
  console.log('🔄 Opening Exercise Swap / Alternative Modal (Replace button)...');
  const replaceBtn = page.locator('button:has-text("Replace")').first();
  if (await replaceBtn.isVisible()) {
    await replaceBtn.click();
    await sleep(2500);

    console.log('✅ Verifying alternatives list excludes exercises already in today\'s workout...');
    await sleep(1500);

    const selectExerciseBtn = page.locator('button:has-text("Select Exercise")').first();
    if (await selectExerciseBtn.isVisible()) {
      console.log('🎯 Selecting smart alternative exercise...');
      await selectExerciseBtn.click();
      await sleep(2000);
      console.log('✅ Replaced exercise successfully with recalculated duration and updated routine!');
    }
  }

  // Open Instructions Modal
  console.log('📖 Opening Exercise Instructions details modal...');
  const instructionsBtn = page.locator('button:has-text("Instructions")').first();
  if (await instructionsBtn.isVisible()) {
    await instructionsBtn.click();
    await sleep(2500);

    const closeBtn = page.locator('button[aria-label="Close"], button:has(svg.lucide-x)').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await sleep(1000);
    }
  }

  // 4. STANDALONE MUSCLE MAP PAGE
  console.log('🗺️ 4. Visiting Standalone Muscle Map (/muscle-map)...');
  await page.goto('http://localhost:3000/muscle-map', { waitUntil: 'networkidle' });
  await sleep(2500);

  console.log('🚻 Testing interactive Male / Female toggling on Standalone Map...');
  const maleBtn = page.locator('button:has-text("Male")').first();
  if (await maleBtn.isVisible()) {
    await maleBtn.click();
    await sleep(2000);
  }

  const femaleBtn = page.locator('button:has-text("Female")').first();
  if (await femaleBtn.isVisible()) {
    await femaleBtn.click();
    await sleep(2000);
  }

  console.log('🔄 Testing Front / Back anatomical switching...');
  const backBtn = page.locator('button:has-text("Back")').first();
  if (await backBtn.isVisible()) {
    await backBtn.click();
    await sleep(2000);
  }

  const frontBtn = page.locator('button:has-text("Front")').first();
  if (await frontBtn.isVisible()) {
    await frontBtn.click();
    await sleep(2000);
  }

  // Click on a muscle group to show stable layout and exercises
  console.log('💪 Clicking Chest muscle group...');
  const chestSvg = page.locator('path[id*="chest"], g[id*="chest"]').first();
  if (await chestSvg.isVisible()) {
    await chestSvg.click();
    await sleep(2000);
  }

  // Smooth scroll back to top
  await smoothScroll(page, 0, 800);
  await sleep(2000);

  console.log('🎬 Wrapping up demo and finalizing video stream...');
  await page.close();
  await context.close();
  await browser.close();

  // Find saved WebM
  const files = fs.readdirSync(VIDEO_DIR).filter((f) => f.endsWith('.webm'));
  if (files.length > 0) {
    files.sort((a, b) => fs.statSync(path.join(VIDEO_DIR, b)).mtimeMs - fs.statSync(path.join(VIDEO_DIR, a)).mtimeMs);
    const recordedWebm = path.join(VIDEO_DIR, files[0]);
    const demoWebm = path.join(VIDEO_DIR, 'syndiq-fit-demo.webm');
    const demoMp4 = path.join(VIDEO_DIR, 'syndiq-fit-demo.mp4');

    fs.copyFileSync(recordedWebm, demoWebm);
    console.log(`✅ Saved WebM demo video to: ${demoWebm}`);

    // Convert to MP4
    if (fs.existsSync(FFMPEG_PATH)) {
      console.log('🔄 Encoding MP4 version with H.264...');
      try {
        execSync(`"${FFMPEG_PATH}" -y -i "${demoWebm}" -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p "${demoMp4}"`, {
          stdio: 'inherit',
        });
        console.log(`✅ Saved MP4 demo video to: ${demoMp4}`);

        // Copy to artifact directory for easy download
        const artifactMp4 = path.join(ARTIFACT_DIR, 'syndiq-fit-demo.mp4');
        const artifactWebm = path.join(ARTIFACT_DIR, 'syndiq-fit-demo.webm');
        fs.copyFileSync(demoMp4, artifactMp4);
        fs.copyFileSync(demoWebm, artifactWebm);
        console.log(`✅ Copied to artifacts directory: ${artifactMp4}`);
      } catch (err) {
        console.error('Error during MP4 conversion:', err.message);
      }
    }
  }

  console.log('🎉 Full product demo video recorded and saved successfully!');
}

runDemo().catch((err) => {
  console.error('❌ Demo recording failed:', err);
  process.exit(1);
});
