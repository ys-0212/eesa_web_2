import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests run against the production build on port 3400 (kept separate from D:\EESA_WEB's
 * 3100/3200). Uses the shared, already-installed Playwright 1.64.1 browser cache.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:3400',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3400',
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
