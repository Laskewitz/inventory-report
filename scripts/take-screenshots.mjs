import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Resolve playwright from global node_modules
const globalModules = execSync('npm root -g', { encoding: 'utf-8' }).trim();
const require = createRequire(globalModules + '/');
const { chromium } = require('@playwright/cli/node_modules/playwright');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reportPath = path.resolve(__dirname, '../reports/20260413/1640/index.html');
const outputDir = path.resolve(__dirname, '../assets/images');

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'environments', label: 'Environments' },
  { id: 'resources', label: 'Resources' },
  { id: 'governance', label: 'Tenant Governance' },
  { id: 'dlp', label: 'DLP Policies' },
  { id: 'env-settings', label: 'Environment Settings' },
  { id: 'recommendations', label: 'Recommendations' },
];

const themes = ['dark', 'light'];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto(`file://${reportPath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  for (const theme of themes) {
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
    }, theme);
    await page.waitForTimeout(500);

    for (const tab of tabs) {
      // Click the actual tab button to trigger showTab with a real event
      await page.click(`.nav-tab >> text="${tab.label}"`);
      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);

      const filename = `report-${tab.id}-${theme}.png`;
      await page.screenshot({
        path: path.join(outputDir, filename),
        fullPage: true,
      });
      console.log(`✓ ${filename}`);
    }
  }

  await browser.close();
  console.log('\nDone! All screenshots saved to assets/images/');
})();
