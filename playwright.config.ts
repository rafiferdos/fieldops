import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  timeout: 60000,
  expect: { timeout: 15000 },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3001",
    browserName: "chromium",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  reporter: "list",
})
