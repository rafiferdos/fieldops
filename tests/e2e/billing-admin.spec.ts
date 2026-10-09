import { randomUUID } from "node:crypto"
import { expect, test, type Page } from "@playwright/test"
import { respectAuthWindow } from "./helpers/auth-window"
import { createDispatchFixture } from "./helpers/dispatch-fixtures"

test.beforeAll(async () => {
  test.setTimeout(70000)
  await respectAuthWindow()
})
test.skip(
  process.env.E2E_LIVE_WRITES !== "1" || process.env.E2E_DEMO_ACCOUNTS !== "1",
  "Requires approved disposable records and configured demo accounts"
)
async function demoLogin(page: Page, role: "Admin" | "Customer") {
  await page.goto("/login")
  await page.getByRole("button", { name: `${role} demo`, exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/${role.toLowerCase()}$`), {
    timeout: 45000,
  })
}

test("admin overview uses real bounded aggregates and rejects incomplete periods", async ({
  page,
}) => {
  await demoLogin(page, "Admin")
  await expect(
    page.getByRole("heading", { name: "Operations overview" })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Verified revenue" })
  ).toBeVisible()
  await expect(
    page.getByRole("term").filter({ hasText: /^pending$/ })
  ).toBeVisible()
  await page.getByLabel("From (Dhaka)", { exact: true }).fill("2099-01-01")
  await page.getByRole("button", { name: "Apply period" }).click()
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Provide both valid dates"
  )
  await expect(
    page.getByRole("heading", { name: "Verified revenue" })
  ).not.toBeVisible()
  await page
    .getByLabel("To (exclusive, Dhaka)", { exact: true })
    .fill("2099-02-01")
  await page.getByRole("button", { name: "Apply period" }).click()
  await expect(page).toHaveURL(/from=2099-01-01&to=2099-02-01/)
  await expect(page.getByText("BDT 0.00", { exact: true })).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "No requests in this period" })
  ).toBeVisible()
  await page.setViewportSize({ width: 320, height: 900 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true)
})

test("catalog creation, stale edit protection and soft deletion use real records", async ({
  page,
}) => {
  test.setTimeout(90000)
  const name = `Catalog verification ${randomUUID()}`
  await demoLogin(page, "Admin")
  await page.goto(`/admin/services?q=${encodeURIComponent(name)}`)
  const card = page.locator('[data-slot="card"]').filter({
    has: page.getByRole("heading", {
      name,
      exact: true,
      includeHidden: true,
    }),
  })
  let publicPath: string | null = null
  try {
    await page
      .getByRole("button", { name: "Create service", exact: true })
      .click()
    await page.getByLabel("Service name", { exact: true }).fill(name)
    await page
      .getByLabel("Description", { exact: true })
      .fill(
        "Disposable service created only for frontend catalog verification."
      )
    await page.getByLabel("Base price (BDT)", { exact: true }).fill("1500.25")
    await page
      .getByRole("button", { name: "Publish service", exact: true })
      .click()
    await expect(card).toBeVisible()
    publicPath = await card
      .getByRole("link", { name: "View public service" })
      .getAttribute("href")
    expect(publicPath).toMatch(/^\/services\/[\da-f-]{36}$/)
    const stale = await page.context().newPage()
    try {
      await stale.goto(`/admin/services?q=${encodeURIComponent(name)}`)
      await stale
        .getByRole("button", { name: "Edit service", exact: true })
        .click()
      await card
        .getByRole("button", { name: "Edit service", exact: true })
        .click()
      await page.getByLabel("Base price (BDT)", { exact: true }).fill("1600.99")
      await page
        .getByRole("button", { name: "Save changes", exact: true })
        .click()
      await expect(card).toContainText("1,600.99")
      await stale
        .getByLabel("Base price (BDT)", { exact: true })
        .fill("1700.00")
      await stale
        .getByRole("button", { name: "Save changes", exact: true })
        .click()
      await expect(
        stale
          .getByRole("alert")
          .filter({ hasText: "This catalog entry changed" })
      ).toBeVisible()
      await expect(
        stale.getByRole("button", { name: "Save changes", exact: true })
      ).toBeDisabled()
      await stale.keyboard.press("Escape")
      await stale
        .getByRole("button", { name: "Edit service", exact: true })
        .click()
      await expect(
        stale.getByRole("button", { name: "Save changes", exact: true })
      ).toBeDisabled()
    } finally {
      await stale.close()
    }
    await page.setViewportSize({ width: 320, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
  } finally {
    // Remove only this test's uniquely named catalog entry, including after an assertion failure.
    await page.goto(`/admin/services?q=${encodeURIComponent(name)}`)
    // Wait for the streamed catalog before deciding whether this fixture needs removal.
    await expect(
      card.or(
        page.getByRole("heading", { name: "No matching services", exact: true })
      )
    ).toBeVisible()
    if (await card.count()) {
      await card
        .getByRole("button", { name: "Remove service", exact: true })
        .click()
      await page
        .getByRole("button", { name: "Confirm removal", exact: true })
        .click()
      await expect(page.getByRole("alertdialog")).not.toBeVisible()
      await expect(
        page.getByRole("heading", { name: "No matching services", exact: true })
      ).toBeVisible()
      await expect(card).toHaveCount(0)
    }
    if (publicPath) {
      await page.goto(publicPath)
      await expect(
        page.getByRole("heading", { name: "Page not found" })
      ).toBeVisible()
    }
  }
})

test("real checkout survives a lost response and reload without replacing its intent", async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(120000)
  const fixture = await createDispatchFixture()
  const foreignContext = await browser.newContext({
    baseURL: baseURL ?? "http://localhost:3001",
  })
  try {
    await fixture.prepareBillingProfile()
    const request = await fixture.createRequest(true),
      assigned = await fixture.assign(request.id),
      completed = await fixture.completeAssignedWork(assigned.id)
    if (!completed.invoice)
      throw new Error("Completion did not issue an invoice")
    const invoice = completed.invoice
    await page.goto("/login")
    await page.getByLabel("Email address").fill(fixture.email)
    await page.getByLabel("Password", { exact: true }).fill(fixture.password)
    await page.getByRole("button", { name: "Sign in", exact: true }).click()
    await expect(page).toHaveURL(/\/customer$/, { timeout: 45000 })
    await page.goto(`/customer/work-orders/${completed.id}`)
    await expect(
      page.getByRole("button", { name: "Submit feedback" })
    ).not.toBeVisible()
    await page.getByRole("link", { name: "View invoice", exact: true }).click()
    await page
      .getByLabel("Billing address", { exact: true })
      .fill("Disposable billing address")
    await page.getByLabel("City", { exact: true }).fill("Dhaka")
    await page.getByLabel("Postcode", { exact: true }).fill("1209")
    const actionUrl = `**/customer/invoices/${invoice.id}`
    let calls = 0,
      returnedPath: string | undefined
    await page.route(actionUrl, async (route) => {
      if (
        route.request().method() === "POST" &&
        route.request().headers()["next-action"]
      ) {
        calls++
        const response = await route.fetch(),
          body = await response.text()
        returnedPath = body.match(/\/payments\/[\da-f-]{36}/)?.[0]
        await route.abort("failed")
      } else await route.continue()
    })
    await page
      .getByRole("button", { name: "Prepare secure checkout", exact: true })
      .click()
    await expect(
      page.getByRole("alert").filter({ hasText: "response was lost" })
    ).toBeVisible()
    expect(calls).toBe(1)
    expect(returnedPath).toMatch(/^\/payments\/[\da-f-]{36}$/)
    await page.unroute(actionUrl)
    await page.reload()
    await expect(
      page.getByLabel("Billing address", { exact: true })
    ).toHaveValue("Disposable billing address")
    await expect(
      page.getByLabel("Billing address", { exact: true })
    ).toBeDisabled()
    await page
      .getByRole("button", { name: "Recover checkout", exact: true })
      .click()
    if (!returnedPath) throw new Error("Missing real checkout destination")
    await expect(page).toHaveURL(new RegExp(`${returnedPath}$`))
    await expect(
      page.getByRole("heading", { name: "Payment not yet confirmed" })
    ).toBeVisible()
    const checkout = page.getByRole("link", {
      name: "Open sandbox checkout",
      exact: true,
    })
    await expect(checkout).toHaveAttribute(
      "href",
      /^https:\/\/sandbox\.sslcommerz\.com\//
    )
    await expect(checkout).toHaveAttribute("target", "_blank")
    await page
      .getByRole("button", { name: "Check latest status", exact: true })
      .click()
    await expect(
      page.getByRole("heading", { name: "Payment not yet confirmed" })
    ).toBeVisible()
    const paymentId = returnedPath.split("/").at(-1)
    await page.goto(`/payment/success?paymentId=${paymentId}&status=success`)
    await expect(
      page.getByRole("heading", { name: "Payment not yet confirmed" })
    ).toBeVisible()
    await page.setViewportSize({ width: 320, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    const foreign = await foreignContext.newPage()
    await demoLogin(foreign, "Customer")
    await foreign.goto(`/customer/invoices/${invoice.id}`)
    await expect(
      foreign.getByRole("heading", { name: "Page not found" })
    ).toBeVisible()
    await foreign.goto(returnedPath)
    await expect(
      foreign.getByRole("heading", { name: "Page not found" })
    ).toBeVisible()
    // Open the actual sandbox page; never post a manufactured provider callback.
    await page.goto(returnedPath)
    const popup = page.waitForEvent("popup")
    await page
      .getByRole("link", { name: "Open sandbox checkout", exact: true })
      .click()
    const provider = await popup
    await provider.waitForLoadState("domcontentloaded")
    await expect(
      provider.getByRole("button", { name: /Pay\s+[\d,.]+\s+BDT/i })
    ).toBeVisible()
    await provider.close()
  } finally {
    await foreignContext.close()
    await fixture.cleanup()
  }
})
