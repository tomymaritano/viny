import { defineConfig, devices } from '@playwright/test';
import { TestConfig, getEnvironmentConfig } from './e2e/config/test-config';
import { getVisualEnvironmentConfig } from './e2e/config/visual-config';
import { getOptimalWorkerCount, getPerformanceConfig } from './e2e/config/performance-config';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

const envConfig = getEnvironmentConfig();
const visualConfig = getVisualEnvironmentConfig();
const performanceConfig = getPerformanceConfig();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: performanceConfig.parallelization.enableFullyParallel,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Enhanced retry strategy based on environment */
  retries: process.env.CI ? envConfig.retries.default : Math.max(1, envConfig.retries.default - 1),
  /* Optimized worker count based on environment and resources */
  workers: getOptimalWorkerCount(),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',
    /* Enhanced tracing strategy */
    trace: TestConfig.performance.enableTracing ? 'on-first-retry' : 'off',
    /* Smart screenshot strategy */
    screenshot: TestConfig.performance.enableScreenshots ? 'only-on-failure' : 'off',
    /* Video strategy based on environment */
    video: TestConfig.errorHandling.videoOnFailure ? 'retain-on-failure' : 'off',
    /* Optimized timeouts */
    actionTimeout: envConfig.timeouts.default,
    navigationTimeout: envConfig.timeouts.navigation,
    /* Browser configuration */
    headless: TestConfig.browser.headless,
    viewport: TestConfig.browser.viewport,
    locale: TestConfig.browser.locale,
    timezoneId: TestConfig.browser.timezone,
  },
  
  /* Global test timeout - increased for complex workflows */
  timeout: 90000,
  
  /* Expect timeout with environment adjustment */
  expect: {
    timeout: envConfig.timeouts.default,
    // Visual comparison settings
    toHaveScreenshot: {
      threshold: visualConfig.comparison.threshold,
      maxDiffPixels: visualConfig.comparison.maxDiffPixels,
      animations: visualConfig.comparison.animations,
    },
    toMatchSnapshot: {
      threshold: visualConfig.comparison.threshold,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});