import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    channel: process.env.CHROME_CHANNEL || 'chrome',
    viewport: { width: 1100, height: 820 },
    screenshot: 'only-on-failure'
  },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI }
})
