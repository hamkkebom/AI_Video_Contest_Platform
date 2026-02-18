const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = '../.sisyphus/evidence';

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function runTests() {
  const browser = await chromium.launch();
  const results = [];

  try {
    // Scenario 1: Desktop Layout (1440x900)
    console.log('📱 Testing Desktop Layout (1440x900)...');
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto('http://localhost:3333', { waitUntil: 'networkidle' });
    await ensureDir(EVIDENCE_DIR);
    const desktopPath = path.join(EVIDENCE_DIR, 'task-4-desktop-1440x900.png');
    await desktopPage.screenshot({ path: desktopPath, fullPage: true });
    results.push(`✓ Desktop screenshot saved: ${desktopPath}`);
    await desktopContext.close();

    // Scenario 2: Mobile Layout (375x812)
    console.log('📱 Testing Mobile Layout (375x812)...');
    const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:3333', { waitUntil: 'networkidle' });
    const mobilePath = path.join(EVIDENCE_DIR, 'task-4-mobile-375x812.png');
    await mobilePage.screenshot({ path: mobilePath, fullPage: true });
    results.push(`✓ Mobile screenshot saved: ${mobilePath}`);
    await mobileContext.close();

    // Scenario 3: Header Verification
    console.log('🎬 Testing Header Verification...');
    const headerContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const headerPage = await headerContext.newPage();
    await headerPage.goto('http://localhost:3333', { waitUntil: 'networkidle' });
    const headerPath = path.join(EVIDENCE_DIR, 'task-4-header-verification.png');
    await headerPage.screenshot({ path: headerPath, fullPage: false });
    results.push(`✓ Header screenshot saved: ${headerPath}`);
    await headerContext.close();

    // Scenario 4: Landing Page Verification
    console.log('🎨 Testing Landing Page Verification...');
    const landingContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const landingPage = await landingContext.newPage();
    await landingPage.goto('http://localhost:3333', { waitUntil: 'networkidle' });
    const landingPath = path.join(EVIDENCE_DIR, 'task-4-landing-verification.png');
    await landingPage.screenshot({ path: landingPath, fullPage: true });
    results.push(`✓ Landing page screenshot saved: ${landingPath}`);
    await landingContext.close();

    console.log('\n✅ All visual regression tests completed!');
    results.forEach(r => console.log(r));

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
