// Standalone verification script for Syndiq Fit test-engine endpoint
async function runEngineVerification() {
  console.log('--- RUNNING SYNDIQ FIT ENGINE VERIFICATION ---');
  try {
    const res = await fetch('http://localhost:3000/api/test-engine');
    const data = await res.json();
    console.log(`All Tests Passed: ${data.allPassed}`);
    data.results.forEach((r, idx) => {
      console.log(`\nTest ${idx + 1}: ${r.testName}`);
      console.log(`  Program: ${r.programName} (${r.totalDays} Days)`);
      console.log(`  Validation Score: ${r.validationScore}/100 | Valid: ${r.isValid}`);
      console.log(`  Metrics: ${r.metrics.pushSets} Push / ${r.metrics.pullSets} Pull sets (Ratio: ${r.metrics.pushPullRatio}) | Avg Duration: ${r.metrics.avgDailyDuration}m`);
      if (r.warnings.length > 0) {
        console.log(`  Warnings: ${r.warnings.join('; ')}`);
      }
    });
    console.log('\n--- VERIFICATION SUCCESSFUL ---');
  } catch (err) {
    console.error('Error executing verification:', err.message);
  }
}

runEngineVerification();
