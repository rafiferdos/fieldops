import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"
import { respectAuthWindow } from "./helpers/auth-window"

async function audit(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze()
  expect
    .soft(
      result.violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map(({ target, failureSummary }) => ({
          target,
          failureSummary,
        })),
      })),
      `Accessibility violations on ${page.url()}`
    )
    .toEqual([])
}

// Reduced motion produces stable final geometry; keyboard/motion behavior has separate scenarios.
test("public pages have no automated WCAG A/AA violations in both themes", async ({
  page,
}) => {
  test.setTimeout(180000)
  await page.emulateMedia({ reducedMotion: "reduce" })
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme })
    for (const pathname of [
      "/",
      "/about",
      "/services",
      "/faq",
      "/contact",
      "/login",
      "/register",
    ]) {
      await page.goto(pathname)
      await audit(page)
    }
  }
})

test("marketing scroll motion preserves text contrast before sections enter view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: "no-preference" })
    await page.goto("/")
    await expect
      .poll(() =>
        page
          .locator("[data-hero-word]")
          .evaluateAll((words) =>
            words.every((word) => getComputedStyle(word).opacity === "1")
          )
      )
      .toBe(true)
    await audit(page)
  }
})

test.describe("authenticated accessibility", () => {
  test.skip(
    process.env.E2E_DEMO_ACCOUNTS !== "1",
    "Requires configured evaluation accounts"
  )
  test.beforeAll(async () => {
    test.setTimeout(70000)
    await respectAuthWindow()
  })
  test("all three role workspaces preserve accessible controls and landmarks", async ({
    browser,
    baseURL,
  }) => {
    test.setTimeout(180000)
    if (!baseURL) throw new Error("A browser-test base URL is required")
    for (const [role, routes] of [
      [
        "Customer",
        [
          "/customer",
          "/customer/requests",
          "/customer/work-orders",
          "/account",
        ],
      ],
      ["Technician", ["/technician", "/technician/work-orders", "/account"]],
      [
        "Admin",
        [
          "/admin",
          "/admin/users",
          "/admin/services",
          "/admin/requests",
          "/admin/work-orders",
          "/admin/audit-logs",
          "/account",
        ],
      ],
    ] as const) {
      const context = await browser.newContext({
        baseURL,
        reducedMotion: "reduce",
      })
      try {
        const page = await context.newPage()
        await page.goto("/login")
        await page
          .getByRole("button", { name: `${role} demo`, exact: true })
          .click()
        await expect(page).not.toHaveURL(/\/login/)
        for (const colorScheme of ["light", "dark"] as const) {
          await page.emulateMedia({ colorScheme })
          for (const route of routes) {
            await page.goto(route)
            await audit(page)
          }
        }
      } finally {
        await context.close()
      }
    }
  })
})
