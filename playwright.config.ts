import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: './.env' });

export default defineConfig({
  testDir: './tests',
  timeout: 6 * 10000,
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: 3,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] }
    },
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // }
  ]
});
