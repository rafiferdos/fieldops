import { confirmDemoLogin } from "./helpers/demo-login"
import { expect, test } from "@playwright/test"
import { createManagedUserFixture } from "./helpers/managed-user-fixture"
import { respectAuthWindow } from "./helpers/auth-window"

test("verified contact channels work without JavaScript and fit narrow screens", async ({
  browser,
  baseURL,
}) => {
  if (!baseURL) throw new Error("A browser-test base URL is required")
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  })
  try {
    const page = await context.newPage()
    await page.goto("/contact")
    await expect(
      page.getByRole("heading", {
        name: "A clearer path to help.",
        exact: true,
      })
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Email support", exact: true })
    ).toHaveAttribute("href", "mailto:rafiferdos@gmail.com")
    await expect(
      page.getByRole("link", { name: "Call support", exact: true })
    ).toHaveAttribute("href", "tel:+8801921479294")
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
    }
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "Contact | FieldOps"
    )
  } finally {
    await context.close()
  }
})

test.describe("real technician skill replacement", () => {
  test.skip(
    process.env.E2E_LIVE_WRITES !== "1" ||
      process.env.E2E_DEMO_ACCOUNTS !== "1",
    "Requires approved disposable accounts"
  )
  test.beforeAll(async () => {
    test.setTimeout(70000)
    await respectAuthWindow()
  })
  // Only this new account changes role/skills; existing technicians are never touched.
  test("stale snapshots cannot replace skills and lost responses require actual inspection", async ({
    page,
  }) => {
    const fixture = await createManagedUserFixture()
    try {
      await fixture.setAccess({ role: "TECHNICIAN" })
      const service = await fixture.firstService()
      await page.goto("/login")
      await confirmDemoLogin(page, "Admin")
      await expect(page).toHaveURL(/\/admin$/)
      await page.goto(`/admin/users?q=${encodeURIComponent(fixture.email)}`)
      await page
        .getByRole("button", { name: "Manage skills", exact: true })
        .click()
      const checkbox = page.getByRole("checkbox", {
        name: service.name,
        exact: true,
      })
      await expect(checkbox).not.toBeChecked()
      await fixture.setSkills([service.id], [])
      await checkbox.check()
      await page
        .getByRole("button", { name: "Review skill replacement", exact: true })
        .click()
      await page
        .getByRole("button", { name: "Confirm skill replacement", exact: true })
        .click()
      await expect(
        page.getByRole("button", {
          name: "Inspect current skills",
          exact: true,
        })
      ).toBeVisible()
      await expect(
        page.getByRole("button", {
          name: "Review skill replacement",
          exact: true,
        })
      ).toBeDisabled()
      expect((await fixture.getSkills()).serviceIds).toEqual([service.id])
      await page
        .getByRole("button", { name: "Inspect current skills", exact: true })
        .click()
      await expect(checkbox).toBeChecked()
      await checkbox.uncheck()
      await page
        .getByRole("button", { name: "Review skill replacement", exact: true })
        .click()
      await expect(
        page.getByRole("heading", {
          name: "Remove all technician skills?",
          exact: true,
        })
      ).toBeVisible()
      let writes = 0
      const actionPath = "**/admin/users?*"
      await page.route(actionPath, async (route) => {
        if (
          route.request().method() === "POST" &&
          route.request().headers()["next-action"]
        ) {
          writes++
          const response = await route.fetch()
          expect(response.ok()).toBe(true)
          await route.abort("failed")
        } else await route.continue()
      })
      await page
        .getByRole("button", { name: "Confirm skill replacement", exact: true })
        .click()
      await expect(
        page.getByRole("button", {
          name: "Inspect current skills",
          exact: true,
        })
      ).toBeVisible()
      expect(writes).toBe(1)
      await expect(
        page.getByRole("button", {
          name: "Review skill replacement",
          exact: true,
        })
      ).toBeDisabled()
      await page.unroute(actionPath)
      expect((await fixture.getSkills()).serviceIds).toEqual([])
      await page
        .getByRole("button", { name: "Inspect current skills", exact: true })
        .click()
      await expect(checkbox).not.toBeChecked()
      await page.setViewportSize({ width: 320, height: 900 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
    } finally {
      await fixture.cleanup()
    }
  })
})
