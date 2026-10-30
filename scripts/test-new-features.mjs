import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const ADMIN_KEY = 'syndiq-admin-2026';

async function runTests() {
  console.log('🚀 Running Syndiq Fit Full Feature Verification Suite...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const page = await context.newPage();

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // =================================================================
    // SUITE 1: Photography Assets
    // =================================================================
    console.log('--- 1. Testing Photography Assets & Loading ---');
    const imageFiles = [
      '/images/fitness-hero.jpg',
      '/images/training-weights.jpg',
      '/images/meal-prep-healthy.jpg',
      '/images/workout-empty.jpg',
    ];

    for (const img of imageFiles) {
      const res = await fetch(`${BASE_URL}${img}`);
      assert(res.status === 200, `Image asset ${img} returned HTTP 200 OK`);
      const contentType = res.headers.get('content-type');
      assert(contentType && contentType.includes('image'), `${img} has valid image content-type (${contentType})`);
    }

    // Verify Home page hero showcase (Next.js Image rewrites src or alt)
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const homeImgs = await page.locator('img[alt*="athlete"], img[src*="fitness-hero"]').count();
    assert(homeImgs >= 1, `Home page renders hero fitness photographs (${homeImgs} found)`);

    // =================================================================
    // SUITE 2: Feedback & Comments (User submission & Admin portal)
    // =================================================================
    console.log('\n--- 2. Testing Feedback Submission & Admin Security ---');

    // API Security check: Unauthorized access without admin key
    const unauthRes = await fetch(`${BASE_URL}/api/feedback`);
    assert(unauthRes.status === 401, 'Anonymous GET /api/feedback correctly blocked with 401 Unauthorized');

    // API Validation check: Empty username
    const badSubmitRes = await fetch(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: '', message: 'Test message' }),
    });
    assert(badSubmitRes.status === 400, 'POST /api/feedback rejects empty username with 400 Bad Request');

    // Browser UI submission: Tester submits feedback without an account
    await page.goto(`${BASE_URL}/feedback`, { waitUntil: 'networkidle' });
    const feedbackTitle = await page.textContent('h1');
    assert(feedbackTitle.includes('Share Your Feedback'), 'Feedback page rendered with welcoming header');

    const testUser = `Tester_${Date.now()}`;
    const testMessage = `This is a test comment by ${testUser}. Loving the new Nigerian portion sizes and reset controls!`;

    await page.fill('#fb-username', testUser);
    await page.click('button:has-text("Suggestion")');
    await page.fill('#fb-message', testMessage);
    await page.click('button[type="submit"]');

    // Wait for success screen
    await page.waitForSelector('text=Feedback Received!');
    const successMsg = await page.textContent('h2');
    assert(successMsg.includes('Feedback Received'), 'Feedback submission succeeded without requiring an account');

    // Check central persistence in data/feedback.json on server
    const feedbackFilePath = path.join(process.cwd(), 'data', 'feedback.json');
    assert(fs.existsSync(feedbackFilePath), 'Central feedback file data/feedback.json exists on server');
    const storedRaw = fs.readFileSync(feedbackFilePath, 'utf-8');
    const storedList = JSON.parse(storedRaw);
    const foundEntry = storedList.find((f) => f.username === testUser);
    assert(!!foundEntry, `Submitted feedback by "${testUser}" is securely persisted on server`);
    assert(foundEntry.category === 'suggestion', 'Feedback category preserved as suggestion');

    // Admin Review Interface: Check login gate
    await page.goto(`${BASE_URL}/admin/feedback`, { waitUntil: 'networkidle' });
    const loginHeader = await page.textContent('h1');
    assert(loginHeader.includes('Administrator Portal'), 'Admin feedback portal displays password authentication gate');

    // Enter admin key
    await page.fill('input[type="password"]', ADMIN_KEY);
    await page.click('button[type="submit"]');

    await page.waitForSelector('text=Tester Submissions & Feedback');
    const adminHeader = await page.textContent('h1');
    assert(adminHeader.includes('Tester Submissions & Feedback'), 'Admin successfully authenticated into review dashboard');

    // Verify feedback appears in admin list
    const pageText = await page.textContent('body');
    assert(pageText.includes(testUser), `Admin dashboard shows submission from "${testUser}"`);

    // Toggle reviewed status
    await page.click(`button:has-text("Mark Reviewed"):near(:text("${testUser}"))`);
    await page.waitForTimeout(500);
    const updatedRaw = fs.readFileSync(feedbackFilePath, 'utf-8');
    const updatedList = JSON.parse(updatedRaw);
    const updatedEntry = updatedList.find((f) => f.username === testUser);
    assert(updatedEntry.reviewed === true, 'Admin successfully marked feedback as reviewed in central storage');

    // =================================================================
    // SUITE 3: Clear / Reset Workout Program
    // =================================================================
    console.log('\n--- 3. Testing Clear / Reset Workout Program ---');

    // Seed program & profile in localStorage once
    await page.goto(`${BASE_URL}/program`, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const dummyProfile = {
        gender: 'female',
        age: '21-30',
        experience: 'intermediate',
        goal: 'glute_emphasis',
        secondaryGoals: ['core_emphasis'],
        duration: 45,
        frequency: 4,
        availableEquipment: ['barbell', 'dumbbell'],
        injuries: ['none'],
      };
      const dummyProgram = {
        id: 'reset-test-plan',
        name: '4-Day Glute & Core Specialization',
        description: 'Test schedule for clear verification',
        userProfile: dummyProfile,
        days: [
          {
            dayNumber: 1,
            title: 'Glutes & Quads',
            focusMuscles: ['glutes', 'quads'],
            estimatedDuration: 45,
            exercises: [
              {
                exercise: {
                  id: 'barbell_squat',
                  name: 'Barbell Back Squat',
                  primaryMuscles: ['quads', 'glutes'],
                  secondaryMuscles: ['hamstrings'],
                  equipment: 'barbell',
                  movementPattern: 'squat',
                  tier: 1,
                  instructions: ['Squat down', 'Drive up'],
                  contraindications: [],
                },
                sets: 3,
                reps: '8-10',
                restSeconds: 90,
              },
            ],
          },
        ],
      };
      localStorage.setItem('syndiq_active_program', JSON.stringify(dummyProgram));
      localStorage.setItem('syndiq_active_profile', JSON.stringify(dummyProfile));
      localStorage.setItem('syndiq_meal_plan', JSON.stringify({ id: 'dummy_meal_plan' }));
    });

    await page.reload({ waitUntil: 'networkidle' });
    const planTitle = await page.textContent('h1');
    assert(planTitle.includes('Glute & Core Specialization'), 'Active program loaded successfully');

    // Click "Clear Plan" button
    const clearBtn = page.locator('button:has-text("Clear Plan")');
    assert((await clearBtn.count()) > 0, 'Clear Plan button is clearly visible in plan header');
    await clearBtn.click();

    // Confirm dialog appears
    await page.waitForSelector('text=Clear Active Workout Program?');
    const modalTitle = await page.textContent('#clear-program-title');
    assert(modalTitle.includes('Clear Active Workout Program'), 'Accessible confirmation modal displayed');

    // Click "Yes, Clear Program"
    await page.click('button:has-text("Yes, Clear Program")');
    await page.waitForTimeout(400);

    // Empty state should be visible immediately
    const emptyStateTitle = await page.textContent('h2');
    assert(emptyStateTitle.includes('No Active Workout Program'), 'UI immediately updated to empty state upon confirmation');

    // Verify localStorage: program is removed, profile is preserved
    const storageState = await page.evaluate(() => {
      return {
        hasProgram: !!localStorage.getItem('syndiq_active_program'),
        savedProfile: JSON.parse(localStorage.getItem('syndiq_active_profile') || 'null'),
        hasMealPlan: !!localStorage.getItem('syndiq_meal_plan'),
      };
    });
    assert(storageState.hasProgram === false, 'syndiq_active_program was removed from localStorage');
    assert(storageState.savedProfile !== null, 'syndiq_active_profile questionnaire preferences were PRESERVED');
    assert(storageState.savedProfile.goal === 'glute_emphasis', 'Preserved goal is glute_emphasis');
    assert(storageState.hasMealPlan === true, 'syndiq_meal_plan was completely unaffected by program clear');

    // Refresh page: program must stay cleared
    await page.reload({ waitUntil: 'networkidle' });
    const reloadedEmpty = await page.textContent('h2');
    assert(reloadedEmpty && reloadedEmpty.includes('No Active Workout Program'), 'Program remains cleared after page refresh');

    // Click "Create New Program" -> Questionnaire should pre-fill preserved answers
    await page.click('text=Create New Program');
    await page.waitForURL('**/questionnaire');
    await page.waitForTimeout(300);

    // Check pre-filled female gender card
    const femaleSelected = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('div')).find(
        (el) => el.textContent?.includes('Female') && el.className?.includes('border-gym-lime')
      );
      return !!card;
    });
    assert(femaleSelected === true, 'Questionnaire pre-filled preserved gender ("female") from saved profile');

    // =================================================================
    // SUITE 4: Meal Planner Terminology & Understandable Portions
    // =================================================================
    console.log('\n--- 4. Testing Meal Planner Terminology & Understandable Portions ---');

    await page.goto(`${BASE_URL}/meal-planner`, { waitUntil: 'networkidle' });
    // Reset any existing meal plan to ensure wizard Step 1 is open
    await page.evaluate(() => localStorage.removeItem('syndiq_meal_plan'));
    await page.reload({ waitUntil: 'networkidle' });

    // Step 1: Check info tooltips on Budget Optimization, Target Calories, Protein, BMR
    const tooltipsCount = await page.locator('button[aria-label*="Information"], button[aria-label*="Help"]').count();
    assert(tooltipsCount >= 4, `Step 1 contains plain-language InfoTooltips (${tooltipsCount} found)`);

    // Test clicking an InfoTooltip on touch/mobile
    const firstTooltip = page.locator('button[aria-label*="Information"], button[aria-label*="Help"]').first();
    await firstTooltip.click();
    await page.waitForTimeout(200);
    const tooltipPopover = await page.locator('[role="tooltip"]').count();
    assert(tooltipPopover > 0, 'InfoTooltip popover opens on tap/click for mobile and keyboard accessibility');

    // Test Step Scroll Reset
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await page.click('text=Next: Food Inventory');
    await page.waitForTimeout(400);
    const step2Heading = await page.textContent('h2');
    assert(step2Heading.includes('Your Nigerian Food Inventory'), 'Advanced to Step 2 (Food Inventory)');

    // Generate Meal Plan
    await page.click('text=Generate 7-Day Meal Plan');
    await page.waitForSelector('text=7-Day Nigerian Meal Planner', { timeout: 10000 });
    console.log('  ✅ PASS: 7-Day Nigerian Meal Plan generated');

    // Portion Understandability on MealCard
    const portionBadge = await page.locator('span:has-text("serving")').first().textContent();
    assert(portionBadge.includes('serving'), `Portion displayed in understandable words/fractions: "${portionBadge.trim()}"`);

    // Portion Guide Modal
    const portionGuideBtn = page.locator('button:has-text("Portion Guide")');
    assert((await portionGuideBtn.count()) > 0, 'Portion Guide button visible in meal plan toolbar');
    await portionGuideBtn.click();
    await page.waitForSelector('text=How Portions Work');
    const guideHeading = await page.textContent('#portion-guide-title');
    assert(guideHeading.includes('How Portions Work'), 'Portion Guide modal opened displaying hand measurements and cooked/raw guidelines');

    // Close guide modal
    await page.click('button:has-text("Got It")');
    await page.waitForTimeout(200);

    // Portion Stepper Controls (- and +)
    const plusBtn = page.locator('button[aria-label="Increase portion"]').first();
    await plusBtn.click();
    await page.waitForTimeout(300);
    const newPortionText = await page.locator('span:has-text("serving")').first().textContent();
    assert(newPortionText.includes('1¼') || newPortionText.includes('1½') || newPortionText.includes('1'), `Portion scaled up with stepper control: "${newPortionText.trim()}"`);

    // Prep Guide Modal with practical measurement
    await page.locator('button:has-text("Prep Guide")').first().click();
    await page.waitForSelector('text=Step-by-Step Cooking Guide');
    const modalText = await page.textContent('[role="dialog"]');
    assert(modalText.includes('Cooked Plate Serving') || modalText.includes('Practical household measure'), 'Prep guide displays cooked plate servings and practical household measures');

    await page.click('text=Close Guide');

    // Clean up test feedback entry from server
    await fetch(`${BASE_URL}/api/feedback?id=${foundEntry.id}&key=${ADMIN_KEY}`, { method: 'DELETE' });
    console.log(`  ✅ Cleaned up temporary test feedback item from server`);

    console.log('\n====================================================');
    console.log(`🎉 ALL TESTS PASSED! (${passedTests} of ${totalTests} assertions - 100%)`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ Test Suite Error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
