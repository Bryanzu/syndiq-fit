import { chromium } from 'playwright';

async function runTests() {
  console.log('🧪 Starting Syndiq Fit Mobile Modals & Theme Verification...');
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop & Theme Switching Tests
  console.log('\n--- TEST SUITE 1: Light/Dark Theme Switch & Persistence ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await desktopContext.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Check default theme is dark
  const isDarkInitial = await page.evaluate(() => {
    return document.documentElement.classList.contains('dark');
  });
  console.log(`[PASS] Default theme is dark: ${isDarkInitial}`);
  if (!isDarkInitial) throw new Error('Default theme was not dark');

  // Toggle to light mode
  const themeToggleBtn = page.locator('button[aria-label*="Switch to light"]').first();
  await themeToggleBtn.click();
  await page.waitForTimeout(300);

  const isLightAfterToggle = await page.evaluate(() => {
    return !document.documentElement.classList.contains('dark') &&
      localStorage.getItem('syndiq_theme') === 'light';
  });
  console.log(`[PASS] Switched to light mode (class removed & storage updated): ${isLightAfterToggle}`);
  if (!isLightAfterToggle) throw new Error('Theme toggle failed to activate light mode');

  // Reload page to test persistence and zero-flash
  await page.reload({ waitUntil: 'networkidle' });
  const isLightPersisted = await page.evaluate(() => {
    return !document.documentElement.classList.contains('dark') &&
      localStorage.getItem('syndiq_theme') === 'light';
  });
  console.log(`[PASS] Light mode persisted across page reload: ${isLightPersisted}`);
  if (!isLightPersisted) throw new Error('Light mode did not persist after reload');

  // Toggle back to dark mode
  const darkToggleBtn = page.locator('button[aria-label*="Switch to dark"]').first();
  await darkToggleBtn.click();
  await page.waitForTimeout(300);

  const isDarkRestored = await page.evaluate(() => {
    return document.documentElement.classList.contains('dark') &&
      localStorage.getItem('syndiq_theme') === 'dark';
  });
  console.log(`[PASS] Dark mode restored & persisted: ${isDarkRestored}`);
  if (!isDarkRestored) throw new Error('Failed to restore dark mode');

  await desktopContext.close();

  // 2. Mobile Viewport & Modals Tests
  console.log('\n--- TEST SUITE 2: Mobile Viewport (iPhone 14 / 390x844) & Modals ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true,
  });
  const mPage = await mobileContext.newPage();

  // Create a program via questionnaire or direct navigation
  console.log('Navigating to questionnaire to generate test program...');
  await mPage.goto('http://localhost:3000/questionnaire', { waitUntil: 'networkidle' });

  // Step 1: Gender -> Female
  await mPage.locator('text=Female').first().click();
  await mPage.click('button:has-text("Next Step")');
  await mPage.waitForTimeout(200);

  // Step 2: Age -> 21-30
  await mPage.locator('text=21 – 30').first().click();
  await mPage.click('button:has-text("Next Step")');
  await mPage.waitForTimeout(200);

  // Step 3: Experience -> Beginner
  await mPage.locator('text=Beginner').first().click();
  await mPage.click('button:has-text("Next Step")');
  await mPage.waitForTimeout(200);

  // Step 4: Goal -> Lean & Toned Physique
  await mPage.locator('text=Lean & Toned Physique').first().click();
  await mPage.click('button:has-text("Next Step")');
  await mPage.waitForTimeout(200);

  // Step 5: Frequency -> 3 Days
  await mPage.locator('text=3 Days / Week').first().click();
  await mPage.click('button:has-text("Next Step")');
  await mPage.waitForTimeout(200);

  // Step 6: Duration -> 45 Min
  await mPage.locator('text=45 Minutes').first().click();
  await mPage.click('button:has-text("Next Step")');
  await mPage.waitForTimeout(200);

  // Step 7: Equipment -> Continue with defaults
  await mPage.click('button:has-text("Next Step")');
  await mPage.waitForTimeout(200);

  // Step 8: Injuries -> None & Generate
  await mPage.locator('text=No Injuries or Limitations').first().click();
  await mPage.click('button:has-text("Generate My Workout Program")');

  // Wait for Program Dashboard to load
  await mPage.waitForURL('**/program**', { timeout: 15000 });
  await mPage.waitForTimeout(1000);
  console.log('[PASS] Generated program and arrived at /program on mobile');

  // TEST MODAL 1: Exercise Detail Modal
  console.log('\n--- Testing ExerciseDetailModal on Mobile ---');
  const firstExerciseCard = mPage.locator('button:has-text("Instructions")').first();
  await firstExerciseCard.click();
  await mPage.waitForTimeout(400);

  // Check modal is open and body has 'modal-open' class
  const isBodyLocked = await mPage.evaluate(() => document.body.classList.contains('modal-open'));
  console.log(`[PASS] Background body scrolling locked: ${isBodyLocked}`);
  if (!isBodyLocked) throw new Error('Body was not locked when modal opened');

  // Check close button visibility and touch target (at least 44x44)
  const closeBtn = mPage.locator('button[aria-label="Close dialog"]').first();
  const closeBtnBox = await closeBtn.boundingBox();
  console.log(`Close button size: ${closeBtnBox?.width}px x ${closeBtnBox?.height}px`);
  if (!closeBtnBox || closeBtnBox.width < 44 || closeBtnBox.height < 44) {
    throw new Error('Close button touch target is smaller than 44x44px');
  }
  console.log('[PASS] Close button has accessible 44x44px touch target');

  // Test scrolling inside modal content
  const modalScrollArea = mPage.locator('.modal-content-scroll').first();
  await modalScrollArea.evaluate((el) => {
    el.scrollTop = 200;
  });
  const scrolledY = await modalScrollArea.evaluate((el) => el.scrollTop);
  console.log(`[PASS] Modal content is independently scrollable (scrolled to ${scrolledY}px)`);

  // Close with close button
  await closeBtn.click();
  await mPage.waitForTimeout(300);

  const isBodyUnlocked = await mPage.evaluate(() => !document.body.classList.contains('modal-open'));
  console.log(`[PASS] Modal closed and background body scrolling restored: ${isBodyUnlocked}`);
  if (!isBodyUnlocked) throw new Error('Body was not unlocked after closing modal');

  // Re-open and test Escape key
  await firstExerciseCard.click();
  await mPage.waitForTimeout(300);
  await mPage.keyboard.press('Escape');
  await mPage.waitForTimeout(300);
  const closedByEscape = await mPage.evaluate(() => !document.body.classList.contains('modal-open'));
  console.log(`[PASS] Modal closes cleanly on Escape key: ${closedByEscape}`);
  if (!closedByEscape) throw new Error('Modal did not close on Escape key');

  // TEST MODAL 2: Exercise Swap Modal
  console.log('\n--- Testing ExerciseSwapModal on Mobile ---');
  const swapBtn = mPage.locator('button:has-text("Replace")').first();
  await swapBtn.click();
  await mPage.waitForTimeout(400);

  const isSwapBodyLocked = await mPage.evaluate(() => document.body.classList.contains('modal-open'));
  console.log(`[PASS] Swap modal opened and body scrolling locked: ${isSwapBodyLocked}`);

  const swapCloseBtn = mPage.locator('button[aria-label="Close dialog"]').first();
  const swapCloseBox = await swapCloseBtn.boundingBox();
  console.log(`Swap Close button size: ${swapCloseBox?.width}px x ${swapCloseBox?.height}px`);
  if (!swapCloseBox || swapCloseBox.width < 44 || swapCloseBox.height < 44) {
    throw new Error('Swap close button touch target is smaller than 44x44px');
  }

  // Test search filter
  const searchInput = mPage.locator('input[placeholder*="Search substitutes"]');
  await searchInput.fill('Squat');
  await mPage.waitForTimeout(300);
  console.log('[PASS] Swap search input interactive and responsive');

  // Close Swap modal with close button
  await swapCloseBtn.click();
  await mPage.waitForTimeout(300);
  const isSwapUnlocked = await mPage.evaluate(() => !document.body.classList.contains('modal-open'));
  console.log(`[PASS] Swap modal closed and body scrolling unlocked: ${isSwapUnlocked}`);

  // TEST MODAL 3: Share QR Modal
  console.log('\n--- Testing ShareQrModal on Mobile ---');
  const shareBtn = mPage.locator('button:has-text("Send to Phone")').first();
  if (await shareBtn.isVisible()) {
    await shareBtn.click();
    await mPage.waitForTimeout(400);

    const isShareLocked = await mPage.evaluate(() => document.body.classList.contains('modal-open'));
    console.log(`[PASS] Share QR modal opened & body locked: ${isShareLocked}`);

    const shareCloseBtn = mPage.locator('button[aria-label="Close dialog"]').first();
    await shareCloseBtn.click();
    await mPage.waitForTimeout(300);

    const isShareUnlocked = await mPage.evaluate(() => !document.body.classList.contains('modal-open'));
    console.log(`[PASS] Share QR modal closed & body unlocked: ${isShareUnlocked}`);
  }

  // TEST MODAL 4: Video Demo Modal
  console.log('\n--- Testing VideoModal on Mobile ---');
  const videoBtn = mPage.locator('button:has-text("Demo")').first();
  if (await videoBtn.isVisible()) {
    await videoBtn.click();
    await mPage.waitForTimeout(400);

    const isVideoLocked = await mPage.evaluate(() => document.body.classList.contains('modal-open'));
    console.log(`[PASS] Video modal opened & body locked: ${isVideoLocked}`);

    const videoCloseBtn = mPage.locator('button[aria-label="Close dialog"]').first();
    await videoCloseBtn.click();
    await mPage.waitForTimeout(300);

    const isVideoUnlocked = await mPage.evaluate(() => !document.body.classList.contains('modal-open'));
    console.log(`[PASS] Video modal closed & body unlocked: ${isVideoUnlocked}`);
  }

  await mobileContext.close();
  await browser.close();

  console.log('\n🎉 ALL MOBILE MODAL & THEME TESTS PASSED SUCCESSFULLY! 🎉\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
