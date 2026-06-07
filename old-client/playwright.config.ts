import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  timeout: 30 * 1000,
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
  },
});
