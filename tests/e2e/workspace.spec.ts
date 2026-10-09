import { expect, test } from "@playwright/test"
import { z } from "zod"
import { dashboardSchema } from "../../src/features/workspace/schemas"
import { respectAuthWindow } from "./helpers/auth-window"
import { confirmSignOut } from "./helpers/sign-out"

test.describe("live dashboard and account navigation", () => {
  test.skip(
    process.env.E2E_DEMO_ACCOUNTS !== "1",
    "Requires configured real evaluation accounts"
  )
  test.beforeAll(async () => {
    test.setTimeout(70000)
    await respectAuthWindow()
  })
  for (const role of ["Customer", "Technician", "Admin"] as const) {
    test(`${role}: real counts, drill-down, refresh and confirmed sign-out`, async ({
      page,
    }) => {
      test.setTimeout(120000)
      await page.goto("/login")
      await page
        .getByRole("button", { name: `${role} demo`, exact: true })
        .click()
      await expect(
        page.getByRole("button", { name: "Refresh dashboard" })
      ).toBeVisible({ timeout: 45000 })
      // Read the authenticated transport and compare whole-dataset totals with displayed metrics.
      const response = await page.request.get("/api/workspace/overview")
      expect(response.status()).toBe(200)
      expect(response.headers()["cache-control"]).toBe("private, no-store")
      const payload: unknown = await response.json()
      const envelope = z
        .object({
          ok: z.literal(true),
          data: dashboardSchema,
        })
        .parse(payload)
      expect(envelope.data.role).toBe(role.toUpperCase())
      const label = role === "Admin" ? "Period work orders" : "Total visits"
      const expected =
        envelope.data.role === "ADMIN"
          ? envelope.data.overview.workOrders.total
          : envelope.data.work.total
      await expect(
        page.locator(`[data-metric="${label}"] [data-metric-value]`)
      ).toHaveText(String(expected))
      const refreshed = page.waitForResponse(
        (reply) =>
          reply.url().includes("/api/workspace/overview") &&
          reply.request().method() === "GET"
      )
      await page.getByRole("button", { name: "Refresh dashboard" }).click()
      expect((await refreshed).status()).toBe(200)
      await expect(
        page.getByRole("button", { name: "Refresh dashboard" })
      ).toBeEnabled()
      if (role === "Customer") {
        await page
          .locator('[data-metric="Awaiting review"]')
          .getByRole("link")
          .click()
        await expect(page).toHaveURL(/\/customer\/requests\?status=PENDING$/)
        await expect(page.getByLabel("Status", { exact: true })).toContainText(
          "PENDING"
        )
      }
      await page.goto("/")
      await expect(
        page.getByRole("link", { name: "Sign in", exact: true })
      ).toHaveCount(0)
      await page.getByRole("button", { name: "Open account menu" }).click()
      await page
        .getByRole("menuitem", { name: "Dashboard", exact: true })
        .click()
      await expect(page).toHaveURL(new RegExp(`/${role.toLowerCase()}$`))
      await page.getByRole("button", { name: "Open account menu" }).click()
      await page
        .getByRole("menuitem", { name: "Sign out", exact: true })
        .click()
      await page.getByRole("button", { name: "Stay signed in" }).click()
      await expect(
        page.getByRole("button", { name: "Open account menu" })
      ).toBeFocused()
      await confirmSignOut(page)
      await page.goto("/account")
      await expect(page).toHaveURL(/\/login\?returnTo=/)
    })
  }
})
