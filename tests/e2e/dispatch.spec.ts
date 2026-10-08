import { expect, test, type Page } from "@playwright/test"
import { dhakaLocal } from "../../src/features/requests/schemas"
import { createDispatchFixture } from "./helpers/dispatch-fixtures"
import { respectAuthWindow } from "./helpers/auth-window"

test.beforeAll(async () => {
  test.setTimeout(70000)
  await respectAuthWindow()
})

test.skip(
  process.env.E2E_LIVE_WRITES !== "1" || process.env.E2E_DEMO_ACCOUNTS !== "1",
  "Requires approved local demo configuration and explicit disposable writes"
)

// Search through the rendered form so URL state and invalidated selection are exercised.
async function searchWindow(page: Page, start: string, end: string) {
  await page.getByLabel("Visit start (Dhaka)").fill(dhakaLocal(start))
  await page.getByLabel("Visit end (Dhaka)").fill(dhakaLocal(end))
  await page
    .getByRole("button", { name: "Find technicians", exact: true })
    .click()
  await expect(page).toHaveURL(/techPage=1/)
  await expect(page.getByLabel("Available technician")).toBeEnabled()
}

test("admin review, stale decision, qualified assignment, collision and reschedule", async ({
  page,
}) => {
  test.setTimeout(120000)
  const fixture = await createDispatchFixture()
  try {
    const request = await fixture.createRequest(),
      collision = await fixture.createRequest(true),
      rejection = await fixture.createRequest()
    await page.goto("/login")
    await page.getByRole("button", { name: "Admin demo", exact: true }).click()
    await expect(page).toHaveURL(/\/admin$/)
    await page.goto(`/admin/requests/${request.id}`)
    const stale = await page.context().newPage()
    try {
      await stale.goto(`/admin/requests/${request.id}`)
      await page
        .getByRole("button", { name: "Save review", exact: true })
        .click()
      await expect(
        page.getByRole("heading", { name: "Assign a visit" })
      ).toBeVisible()
      await stale.getByLabel("Decision", { exact: true }).selectOption("REJECT")
      await stale
        .getByLabel("Rejection reason")
        .fill("Stale decision must not replace approval")
      await stale
        .getByRole("button", { name: "Save review", exact: true })
        .click()
      await expect(
        stale.getByRole("alert").filter({ hasText: "This record has changed" })
      ).toBeVisible()
      await expect(
        stale.getByRole("button", { name: "Save review" })
      ).toBeDisabled()
    } finally {
      await stale.close()
    }
    await searchWindow(page, fixture.window.start, fixture.window.end)
    await page
      .getByLabel("Available technician")
      .selectOption(fixture.technician.id)
    await page
      .getByLabel("Visit end (Dhaka)")
      .fill(
        dhakaLocal(
          new Date(Date.parse(fixture.window.end) + 60000).toISOString()
        )
      )
    await expect(page.getByLabel("Available technician")).not.toBeVisible()
    await searchWindow(page, fixture.window.start, fixture.window.end)
    await expect(page.getByLabel("Available technician")).toHaveValue("")
    await page
      .getByLabel("Available technician")
      .selectOption(fixture.technician.id)
    const competing = await page.context().newPage()
    try {
      await competing.goto(`/admin/requests/${collision.id}`)
      await searchWindow(competing, fixture.window.start, fixture.window.end)
      await competing
        .getByLabel("Available technician")
        .selectOption(fixture.technician.id)
      await page.getByRole("button", { name: "Confirm assignment" }).click()
      await expect(page).toHaveURL(/\/admin\/work-orders\/[a-f0-9-]{36}$/)
      await competing
        .getByRole("button", { name: "Confirm assignment" })
        .click()
      await expect(
        competing
          .getByRole("alert")
          .filter({ hasText: "This record has changed" })
      ).toBeVisible()
      await expect(
        competing.getByRole("button", {
          name: "Reload record and availability",
        })
      ).toBeVisible()
      await expect(
        competing.getByRole("button", { name: "Confirm assignment" })
      ).toBeDisabled()
    } finally {
      await competing.close()
    }
    const workId = page.url().split("/").at(-1)
    if (!workId) throw new Error("Created work ID missing")
    const before = await fixture.getWork(workId)
    const nextStart = new Date(
        Date.parse(fixture.window.start) + 7200000
      ).toISOString(),
      nextEnd = new Date(Date.parse(fixture.window.end) + 7200000).toISOString()
    await searchWindow(page, nextStart, nextEnd)
    await page
      .getByLabel("Available technician")
      .selectOption(fixture.technician.id)
    await page.getByRole("button", { name: "Confirm reschedule" }).click()
    await expect(
      page.getByText("Visit rescheduled.", { exact: true })
    ).toBeVisible()
    const after = await fixture.getWork(workId)
    expect(after.scheduledStart).toBe(nextStart)
    expect(after.version).toBeGreaterThan(before.version)
    expect(after.agreedPriceMinor).toBe(before.agreedPriceMinor)
    await page.goto(`/admin/requests/${rejection.id}`)
    await page.getByLabel("Decision", { exact: true }).selectOption("REJECT")
    await page.getByRole("button", { name: "Save review", exact: true }).click()
    await expect(
      page.getByText("Explain the rejection in 3–500 characters.")
    ).toBeVisible()
    await page
      .getByLabel("Rejection reason")
      .fill("Disposable request cannot be served")
    await page.getByRole("button", { name: "Save review", exact: true }).click()
    await expect(page.getByText("REJECTED", { exact: true })).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Assign a visit" })
    ).not.toBeVisible()
    await page.goto("/admin/requests")
    await page.getByLabel("Search requests").fill(fixture.marker)
    await page.getByRole("button", { name: "Apply filters" }).click()
    await expect(page).toHaveURL(new RegExp(`q=${fixture.marker}`))
    await page.getByRole("button", { name: "Sign out", exact: true }).click()
  } finally {
    await fixture.cleanup()
  }
})
