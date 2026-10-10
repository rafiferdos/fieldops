import { confirmDemoLogin } from "./helpers/demo-login"
import { expect, test } from "@playwright/test"
import { z } from "zod"
import { dashboardSchema } from "../../src/features/workspace/schemas"
import { formatRevenue } from "../../src/features/admin/schemas"
import { respectAuthWindow } from "./helpers/auth-window"
import { confirmSignOut } from "./helpers/sign-out"
import {
  verifyWorkspaceMotion,
  verifyWorkspaceDialogLock,
} from "./helpers/workspace-motion"

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
      await page.setViewportSize({ width: 1440, height: 900 })
      const errors: string[] = []
      page.on("pageerror", (error) => errors.push(error.message))
      await page.goto("/login")
      await confirmDemoLogin(page, role)
      await expect(
        page.getByRole("button", { name: "Refresh dashboard" })
      ).toBeVisible({ timeout: 45000 })
      await expect(
        page.getByText("Shared evaluation account", { exact: true })
      ).toBeVisible()
      await expect(
        page.getByText(/not evidence of real customer usage/)
      ).toBeVisible()
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
      if (envelope.data.role === "ADMIN") {
        const { overview, requests } = envelope.data
        // Compare each visible aggregate with an authenticated live read, not fixture constants.
        const expectedMetrics = {
          "Verified revenue": formatRevenue(
            overview.invoices.verifiedRevenueMinor
          ),
          "Paid invoices": String(overview.invoices.paidCount),
          "Period requests": String(overview.requests.total),
          "Period completions": String(overview.workOrders.completed),
          "Completion rate": `${overview.workOrders.completionRate}%`,
          "Active technicians": String(overview.technicians.active),
          "Awaiting review": String(requests.byStatus.PENDING),
        }
        for (const [metric, value] of Object.entries(expectedMetrics)) {
          await expect(
            page.locator(`[data-metric="${metric}"] [data-metric-value]`)
          ).toHaveText(value)
        }
      }
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
      if (role === "Admin" && process.env.E2E_VISUAL_PROOF === "1") {
        // Optional documentation proof captures only the dedicated demo's aggregate overview.
        await page.setViewportSize({ width: 1440, height: 960 })
        await page.screenshot({
          path: test.info().outputPath("workspace-overview.png"),
        })
      }
      await verifyWorkspaceMotion(page, role === "Admin")
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
      await page.keyboard.press("End")
      if (role === "Admin")
        await expect(
          page.getByRole("link", { name: "All visits", exact: true })
        ).toBeInViewport()
      await page
        .getByRole("navigation", { name: "Workspace navigation" })
        .getByRole("link", {
          name: role === "Technician" ? "Assigned visits" : "Work orders",
          exact: true,
        })
        .click()
      await expect(page.getByRole("heading", { level: 1 })).toBeInViewport()
      if (role === "Admin") {
        // Back restores the previous dashboard position; Forward restores the queue's own position.
        await page.goBack()
        await expect(page).toHaveURL(/\/admin$/)
        await expect(
          page.getByRole("link", { name: "All visits", exact: true })
        ).toBeInViewport()
        await page.goForward()
        await expect(page).toHaveURL(/\/admin\/work-orders$/)
        await expect(page.getByRole("heading", { level: 1 })).toBeInViewport()
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
      await verifyWorkspaceDialogLock(page)
      const hold = page.getByRole("button", {
        name: "Hold to logout",
        exact: true,
      })
      // A click and an interrupted key hold must never invoke the logout action.
      await hold.click()
      await expect(hold).toHaveAttribute("data-phase", "idle")
      await hold.focus()
      await page.keyboard.down("Space")
      await expect(hold).toHaveAttribute("data-phase", "holding")
      await page.keyboard.up("Space")
      await expect(hold).toHaveAttribute("data-phase", "idle")
      await expect(page).toHaveURL(new RegExp(`/${role.toLowerCase()}$`))
      await expect(page.locator(".gradual-blur-page")).toHaveCount(0)
      await page.getByRole("button", { name: "Cancel sign out" }).click()
      const navigation = page.getByRole("navigation", {
        name: "Workspace navigation",
      })
      const workLink = navigation.getByRole("link", {
        name: role === "Technician" ? "Assigned visits" : "Work orders",
        exact: true,
      })
      await expect(workLink).toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
      await expect(workLink).toHaveAttribute("href", /work-orders$/)
      await expect(
        page.getByRole("button", { name: "Open account menu" })
      ).toBeFocused()
      await confirmSignOut(page)
      await page.goto("/account")
      await expect(page).toHaveURL(/\/login\?returnTo=/)
      expect(errors).toEqual([])
    })
  }
})
