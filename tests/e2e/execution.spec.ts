import { expect, test, type Page } from "@playwright/test"
import { createDispatchFixture } from "./helpers/dispatch-fixtures"
import { respectAuthWindow } from "./helpers/auth-window"

test.beforeAll(async () => {
  test.setTimeout(70000)
  await respectAuthWindow()
})

test.skip(
  process.env.E2E_LIVE_WRITES !== "1" || process.env.E2E_DEMO_ACCOUNTS !== "1",
  "Requires approved demo configuration and disposable execution records"
)

async function demoLogin(
  page: Page,
  role: "Technician" | "Admin" | "Customer"
) {
  await page.goto("/login")
  await page.getByRole("button", { name: `${role} demo`, exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/${role.toLowerCase()}$`))
}
async function logout(page: Page) {
  await page.goto("/account")
  await page.getByRole("button", { name: "Sign out", exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
}

test("technician progress, lost completion response recovery and scoped customer tracking", async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(120000)
  const fixture = await createDispatchFixture()
  const customerContext = await browser.newContext({
      baseURL: baseURL ?? "http://localhost:3001",
    }),
    adminContext = await browser.newContext({
      baseURL: baseURL ?? "http://localhost:3001",
    }),
    foreignContext = await browser.newContext({
      baseURL: baseURL ?? "http://localhost:3001",
    })
  try {
    const request = await fixture.createRequest(true),
      assigned = await fixture.assign(request.id)
    await demoLogin(page, "Technician")
    await page.goto(
      `/technician?status=ASSIGNED&q=${fixture.marker}&sort=scheduled_start_asc`
    )
    await expect(
      page.getByRole("link", { name: "View work order" })
    ).toHaveCount(1)
    await page.getByRole("link", { name: "View work order" }).click()
    const customer = await customerContext.newPage(),
      admin = await adminContext.newPage(),
      foreign = await foreignContext.newPage()
    await customer.goto("/login")
    await customer.getByLabel("Email address").fill(fixture.email)
    await customer
      .getByLabel("Password", { exact: true })
      .fill(fixture.password)
    await customer.getByRole("button", { name: "Sign in", exact: true }).click()
    await expect(customer).toHaveURL(/\/customer$/)
    await customer.goto(`/customer/work-orders/${assigned.id}`)
    await expect(
      customer.getByText("Work: ASSIGNED", { exact: true })
    ).toBeVisible()
    await expect(
      customer.getByRole("button", { name: "Start travelling" })
    ).not.toBeVisible()
    await demoLogin(admin, "Admin")
    await admin.goto(`/admin/work-orders/${assigned.id}`)
    await expect(
      admin.getByRole("heading", { name: "Reschedule visit" })
    ).toBeVisible()
    await expect(
      admin.getByRole("button", { name: "Start travelling" })
    ).not.toBeVisible()
    await demoLogin(foreign, "Customer")
    await foreign.goto(`/customer/work-orders/${assigned.id}`)
    await expect(
      foreign.getByRole("heading", { name: "Page not found" })
    ).toBeVisible()
    await expect(
      foreign.getByText(fixture.marker, { exact: false })
    ).not.toBeVisible()
    await logout(foreign)
    const stale = await page.context().newPage()
    try {
      await stale.goto(`/technician/work-orders/${assigned.id}`)
      await page.getByRole("button", { name: "Start travelling" }).click()
      await expect(
        page.getByText("Work: EN_ROUTE", { exact: true })
      ).toBeVisible()
      await stale.getByRole("button", { name: "Start travelling" }).click()
      await expect(
        stale.getByRole("alert").filter({ hasText: "This record has changed" })
      ).toBeVisible()
      await stale.getByRole("button", { name: "Inspect latest work" }).click()
      await expect(
        stale.getByRole("button", { name: "Start work", exact: true })
      ).toBeEnabled()
    } finally {
      await stale.close()
    }
    await page.getByRole("button", { name: "Start work", exact: true }).click()
    await expect(
      page.getByText("Work: IN_PROGRESS", { exact: true })
    ).toBeVisible()
    await page.getByLabel("Completion report", { exact: true }).fill("short")
    await page
      .getByRole("button", { name: "Complete work and issue invoice" })
      .click()
    await expect(
      page.getByText("Describe the completed work in at least 10 characters.")
    ).toBeVisible()
    const report = `Verified service and completed repair for disposable workflow ${fixture.marker}.`
    await page.getByLabel("Completion report", { exact: true }).fill(report)
    const original = await fixture.getWork(assigned.id)
    let completionCalls = 0
    const actionUrl = `**/technician/work-orders/${assigned.id}`
    // Commit the real backend operation, then lose only its browser response.
    await page.route(actionUrl, async (route) => {
      if (
        route.request().method() === "POST" &&
        route.request().headers()["next-action"]
      ) {
        completionCalls++
        await route.fetch()
        await route.abort("failed")
      } else await route.continue()
    })
    await page
      .getByRole("button", { name: "Complete work and issue invoice" })
      .click()
    await expect(
      page.getByRole("button", { name: "Inspect latest work" })
    ).toBeVisible()
    await expect(
      page.getByLabel("Completion report", { exact: true })
    ).toHaveValue(report)
    await expect(
      page.getByRole("button", { name: "Complete work and issue invoice" })
    ).toBeDisabled()
    await page.unroute(actionUrl)
    await page.getByRole("button", { name: "Inspect latest work" }).click()
    await expect(
      page.getByText("Work: COMPLETED", { exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Invoice summary" })
    ).toBeVisible()
    expect(completionCalls).toBe(1)
    const completed = await fixture.getWork(assigned.id)
    expect(completed.invoice).not.toBeNull()
    const replay = await fixture.replayCompletion(
      assigned.id,
      original.version,
      report
    )
    expect(replay.invoice?.id).toBe(completed.invoice?.id)
    await customer.reload()
    await expect(customer.getByText(report, { exact: true })).toBeVisible()
    await expect(
      customer.getByText("Request: APPROVED", { exact: true })
    ).toBeVisible()
    await expect(
      customer.getByRole("heading", { name: "Invoice summary" })
    ).toBeVisible()
    await expect(
      customer.getByText("work order completed", { exact: true })
    ).toBeVisible()
    await expect(
      customer.getByText("ASSIGNED → EN_ROUTE", { exact: true })
    ).toBeVisible()
    await expect(
      customer.getByText("EN_ROUTE → IN_PROGRESS", { exact: true })
    ).toBeVisible()
    await customer.goto(
      `/customer/work-orders?status=COMPLETED&q=${fixture.marker}`
    )
    await expect(
      customer.getByRole("link", { name: "View work order" })
    ).toHaveCount(1)
    await admin.reload()
    await expect(
      admin.getByRole("heading", { name: "Reschedule visit" })
    ).not.toBeVisible()
    await expect(
      admin.getByRole("button", { name: "Start work", exact: true })
    ).not.toBeVisible()
    await page.setViewportSize({ width: 390, height: 844 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
    await page.screenshot({
      path: "/tmp/fieldops-execution-mobile.png",
      fullPage: true,
    })
    await logout(customer)
    await logout(admin)
    await logout(page)
  } finally {
    await customerContext.close()
    await adminContext.close()
    await foreignContext.close()
    await fixture.cleanup()
  }
})
