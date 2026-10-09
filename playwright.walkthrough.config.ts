import { defineConfig } from "@playwright/test"

// Keep intentional demo recording separate from regression tests and authentication traces.
export default defineConfig({
  testDir: "./scripts/walkthrough",
  workers: 1,
  retries: 0,
  timeout: 600000,
  expect: { timeout: 20000 },
  outputDir: process.env.WALKTHROUGH_OUTPUT_DIR ?? "./walkthrough-output",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3002",
    viewport: { width: 1440, height: 900 },
    browserName: "chromium",
    trace: "off",
    screenshot: "off",
    video: { mode: "on", size: { width: 1440, height: 900 } },
  },
  reporter: "list",
})
