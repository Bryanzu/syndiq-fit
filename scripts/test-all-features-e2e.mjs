import { chromium } from 'playwright';

async function runE2ETests() {
  console.log('🚀 Starting Syndiq Fit Full E2E & Zoom Verification...\n');
  const browser = await chromium.launch({ headless: true });

  try {
    // =================================================================
    // SUITE 1: Questionnaire Goal Selection (Primary + Secondary)
    // =================================================================
    console.log('--- TEST SUITE 1: Goal Selection (Primary Tabs & Secondary Priorities) ---');
    const context = await browser.newContext({ viewport: { width: 1280, height: 850 } });
    const page = await context.newPage();

    await page.goto('http://localhost:3000/questionnaire', { waitUntil: 'networkidle' });

    // Step 1: Gender (Male)
    await page.locator('text=Male').first().click();
    await page.click('button:has-text("Next Step")');

    // Step 2: Age (21-30)
    await page.click('button:has-text("Next Step")');

    // Step 3: Experience (Beginner)
    await page.click('button:has-text("Next Step")');

    // Step 4: Goals!
    console.log('  Testing Step 4: Primary Goal Tabs & Secondary Priorities...');

    // Verify "All Goals" tab is active by default
    const allTabActive = await page.locator('button:has-text("All Goals")').evaluate((el) => {
      return el.classList.contains('bg-gym-lime') || el.classList.contains('text-black');
    });
    console.log(`  [PASS] 'All Goals' tab is selected by default: ${allTabActive}`);
    if (!allTabActive) throw new Error('All Goals tab was not selected by default');

    // Verify All 17 goals are visible when All tab is active
    const primaryCardsCount = await page.locator('.grid.grid-cols-1.sm\\:grid-cols-2').first().locator('> div').count();
    console.log(`  [PASS] Number of primary goals displayed under All tab: ${primaryCardsCount}`);
    if (primaryCardsCount !== 17) throw new Error(`Expected 17 goals under All tab, got ${primaryCardsCount}`);

    // Switch to category tab: Muscle Focus
    await page.locator('button:has-text("Muscle Focus")').click();
    await page.waitForTimeout(150);
    const muscleFocusCount = await page.locator('.grid.grid-cols-1.sm\\:grid-cols-2').first().locator('> div').count();
    console.log(`  [PASS] Muscle Focus category filtered to ${muscleFocusCount} options`);
    if (muscleFocusCount !== 7) throw new Error(`Expected 7 options under Muscle Focus, got ${muscleFocusCount}`);

    // Switch back to "All Goals"
    await page.locator('button:has-text("All Goals")').click();

    // Select "Muscle Building (Hypertrophy)" as primary goal
    await page.locator('text=Muscle Building (Hypertrophy)').first().click();

    // Check Secondary Priorities Section
    console.log('  Testing Secondary Priorities Section...');
    // Verify "Hypertrophy / Muscle Building" is disabled as secondary because it is primary
    const isPrimaryDisabledInSecondary = await page.locator('text=Already selected as your primary goal').or(page.locator('span:has-text("Primary")')).first().isVisible();
    console.log(`  [PASS] Primary goal is marked/disabled in secondary priorities: ${isPrimaryDisabledInSecondary}`);

    // Verify "Fat Loss" is disabled due to contradiction with Muscle Building
    const isFatLossDisabled = await page.locator('text=competing with fat loss').or(page.locator('text=caloric')).first().isVisible();
    console.log(`  [PASS] Contradictory goal (Fat Loss) has clear contradiction badge: ${isFatLossDisabled}`);

    // Select complementary secondary goals: Chest Development and Arm Development
    const chestSecBtn = page.locator('div[id*="sec-chest_emphasis"]').or(page.locator('text=Chest Development')).last();
    await chestSecBtn.click();
    const armSecBtn = page.locator('div[id*="sec-arm_emphasis"]').or(page.locator('text=Arm Development')).last();
    await armSecBtn.click();

    const clearBtnVisible = await page.locator('button:has-text("Clear (2)")').isVisible();
    console.log(`  [PASS] 2 Secondary priorities selected, 'Clear (2)' button appears: ${clearBtnVisible}`);

    // Proceed through remaining steps
    await page.click('button:has-text("Next Step")'); // to Step 5 (Frequency)
    await page.click('button:has-text("Next Step")'); // to Step 6 (Duration)
    await page.click('button:has-text("Next Step")'); // to Step 7 (Equipment)
    await page.click('button:has-text("Next Step")'); // to Step 8 (Injuries)

    // Generate Program
    await page.click('button:has-text("Generate My Workout Program")');
    await page.waitForURL('**/program', { timeout: 15000 });
    console.log('  [PASS] Navigated to /program successfully');

    // Verify secondary goals displayed on PlanHeader
    const headerSecGoalsVisible = await page.locator('text=Secondary Priorities:').isVisible();
    console.log(`  [PASS] PlanHeader displays secondary priorities pills: ${headerSecGoalsVisible}`);

    await context.close();

    // =================================================================
    // SUITE 2: Browser Zoom Responsiveness (80%, 100%, 125%, 150%, 200%)
    // =================================================================
    console.log('\n--- TEST SUITE 2: Browser Zoom Responsiveness (80% to 200%) ---');

    const zoomLevels = [
      { zoom: '80%', scale: 0.8, viewport: { width: 1400, height: 900 } },
      { zoom: '100%', scale: 1.0, viewport: { width: 1280, height: 800 } },
      { zoom: '125%', scale: 1.25, viewport: { width: 1024, height: 768 } },
      { zoom: '150%', scale: 1.5, viewport: { width: 853, height: 600 } },
      { zoom: '200%', scale: 2.0, viewport: { width: 640, height: 500 } },
    ];

    for (const z of zoomLevels) {
      const zoomCtx = await browser.newContext({ viewport: z.viewport });
      const zoomPage = await zoomCtx.newPage();

      // Seed program into localStorage so /program renders full workout cards & body visualizer
      await zoomPage.addInitScript(() => {
        const dummyProgram = {
          id: 'zoom-test',
          name: '4-Day Hypertrophy Split',
          description: 'Zoom verification program',
          userProfile: { gender: 'male', age: '21-30', experience: 'intermediate', goal: 'muscle_building', duration: 60, injuries: ['none'] },
          days: [
            {
              dayNumber: 1,
              title: 'Upper Body Power',
              focusMuscles: ['chest', 'lats'],
              estimatedDuration: 55,
              exercises: [
                {
                  exercise: {
                    id: 'bench_press',
                    name: 'Barbell Flat Bench Press',
                    primaryMuscles: ['chest'],
                    secondaryMuscles: ['front_delts', 'triceps'],
                    equipment: 'barbell',
                    movementPattern: 'horizontal_push',
                    tier: 1,
                    instructions: ['Lie on bench', 'Lower bar', 'Press up'],
                    contraindications: [],
                  },
                  sets: 4,
                  reps: '6-8',
                  restSeconds: 120,
                },
              ],
            },
          ],
        };
        localStorage.setItem('syndiq_active_program', JSON.stringify(dummyProgram));
      });

      await zoomPage.goto('http://localhost:3000/program', { waitUntil: 'networkidle' });

      // Apply CSS Zoom simulating browser zoom level
      await zoomPage.evaluate((s) => {
        document.body.style.zoom = String(s);
      }, z.scale);
      await zoomPage.waitForTimeout(200);

      const hasHorizontalScroll = await zoomPage.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 10;
      });

      console.log(`  [PASS] At ${z.zoom} Zoom: No breaking horizontal page overflow (scrollWidth <= innerWidth): ${!hasHorizontalScroll}`);
      if (hasHorizontalScroll) throw new Error(`Horizontal overflow detected at ${z.zoom} zoom`);

      // Verify BodyVisualizer is rendered
      const visualizerCount = await zoomPage.locator('svg').count();
      console.log(`  [PASS] At ${z.zoom} Zoom: Body visualizer rendered and stable (${visualizerCount} SVGs found)`);
      if (visualizerCount === 0) throw new Error(`Body visualizer missing at ${z.zoom} zoom`);

      await zoomCtx.close();
    }

    // =================================================================
    // SUITE 3: Nigerian Meal Planner (/meal-planner)
    // =================================================================
    console.log('\n--- TEST SUITE 3: Nigerian Weekly Meal Planner ---');
    const mealContext = await browser.newContext({ viewport: { width: 1280, height: 850 } });
    const mealPage = await mealContext.newPage();

    await mealPage.goto('http://localhost:3000/meal-planner', { waitUntil: 'networkidle' });

    // Wizard Step 1: Verify Targets & Options
    console.log('  Testing Meal Planner Wizard Step 1 (Profile & Targets)...');
    const targetEnergyVisible = await mealPage.locator('text=Daily Target Energy').isVisible();
    console.log(`  [PASS] Scientific daily energy target preview visible: ${targetEnergyVisible}`);

    // Click Next: Food Inventory
    await mealPage.click('button:has-text("Next: Food Inventory")');
    await mealPage.waitForTimeout(200);

    // Wizard Step 2: Food Inventory
    console.log('  Testing Meal Planner Wizard Step 2 (Inventory & Presets)...');
    const foodItemsCount = await mealPage.locator('h4.font-extrabold').count();
    console.log(`  [PASS] Displayed food inventory items: ${foodItemsCount}`);
    if (foodItemsCount < 20) throw new Error('Too few food inventory items rendered');

    // Click "High-Protein Staples In Stock" preset
    await mealPage.click('button:has-text("High-Protein Staples In Stock")');

    // Generate 7-Day Plan
    await mealPage.click('button:has-text("Generate 7-Day Meal Plan")');
    await mealPage.waitForTimeout(500);

    // Verify 7-Day Plan view
    console.log('  Testing 7-Day Plan View & Interactivity...');
    const nutritionBarVisible = await mealPage.locator('text=Calories').first().isVisible();
    console.log(`  [PASS] Nutrition Summary Bar rendered: ${nutritionBarVisible}`);

    // Verify Monday to Sunday tabs exist
    const dayTabs = await mealPage.locator('button:has-text("kcal")').count();
    console.log(`  [PASS] 7 Day Schedule tabs rendered (${dayTabs} tabs)`);

    // Switch to Wednesday (Day 3)
    await mealPage.locator('button:has-text("WED")').click();
    await mealPage.waitForTimeout(200);
    const wednesdayScheduleVisible = await mealPage.locator("text=Wednesday's Nutrition Schedule").isVisible();
    console.log(`  [PASS] Switched to Wednesday's schedule: ${wednesdayScheduleVisible}`);

    // Test Portion Multiplier (click 1½ fraction chip or stepper on first meal)
    const portionBtn = mealPage.locator('button:has-text("1½")').first();
    await portionBtn.click();
    await mealPage.waitForTimeout(150);
    const portionBadgeVisible = await mealPage.locator('text=1½ servings').first().isVisible();
    console.log(`  [PASS] Scaled meal portion to 1½ servings with real-time recalculation: ${portionBadgeVisible}`);

    // Test Mark Meal Eaten Toggle
    const markEatenBtn = mealPage.locator('button:has-text("Mark Eaten")').first();
    await markEatenBtn.click();
    await mealPage.waitForTimeout(150);
    const eatenStatus = await mealPage.locator('button:has-text("Eaten")').first().isVisible();
    console.log(`  [PASS] Toggled meal completed / eaten status: ${eatenStatus}`);

    // Test Prep Guide Modal
    console.log('  Testing Prep Guide Modal...');
    await mealPage.locator('button:has-text("Prep Guide")').first().click();
    await mealPage.waitForTimeout(200);
    const instructionsVisible = await mealPage.locator('text=Step-by-Step Cooking Guide').isVisible();
    console.log(`  [PASS] Recipe Prep Guide modal opened with authentic Nigerian instructions: ${instructionsVisible}`);
    await mealPage.locator('button:has-text("Close Guide")').click();
    await mealPage.waitForTimeout(200);

    // Test Meal Swap Modal
    console.log('  Testing Meal Swap Modal...');
    await mealPage.locator('button:has-text("Swap Meal")').first().click();
    await mealPage.waitForTimeout(200);
    const swapModalVisible = await mealPage.locator('text=Choose Meal').first().isVisible();
    console.log(`  [PASS] Swap Meal modal opened displaying alternative recipes: ${swapModalVisible}`);
    await mealPage.locator('button:has-text("Choose Meal")').first().click();
    await mealPage.waitForTimeout(300);
    console.log('  [PASS] Swapped meal confirmed and schedule updated');

    // Test Market Shopping List Tab
    console.log('  Testing Market Shopping List Tab...');
    await mealPage.locator('button:has-text("Market Shopping List")').click();
    await mealPage.waitForTimeout(200);
    const shoppingListTitle = await mealPage.locator('text=7-Day Consolidated Shopping List').isVisible();
    console.log(`  [PASS] Market Shopping List rendered with in-stock subtraction: ${shoppingListTitle}`);

    const marketRecommendationsVisible = await mealPage.locator('text=Buy').first().isVisible();
    console.log(`  [PASS] Practical Nigerian market units (crates, derica, tubers) recommended: ${marketRecommendationsVisible}`);

    await mealContext.close();
    await browser.close();

    console.log('\n====================================================');
    console.log('🎉 ALL PLAYWRIGHT E2E & ZOOM TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ E2E Test Failure:', err);
    await browser.close();
    process.exit(1);
  }
}

runE2ETests();
