import { expect, test, type Page } from "@playwright/test"
import { createDispatchFixture } from "./helpers/dispatch-fixtures"
import { respectAuthWindow } from "./helpers/auth-window"
import { writeFile } from "node:fs/promises"
import AxeBuilder from "@axe-core/playwright"

test.skip(
  process.env.E2E_REAL_SANDBOX !== "1" || process.env.E2E_LIVE_WRITES !== "1",
  "Requires explicitly approved disposable records and real sandbox verification"
)

test.beforeAll(async () => {
  test.setTimeout(70000)
  await respectAuthWindow()
})

async function openSandboxCheckout(page: Page) {
  const link = page.getByRole("link", {
    name: "Open sandbox checkout",
    exact: true,
  })
  await expect(link).toHaveAttribute(
    "href",
    /^https:\/\/sandbox\.sslcommerz\.com\//
  )
  // Context page events also cover isolated target=_blank tabs without weakening noopener.
  const [provider] = await Promise.all([
    page.context().waitForEvent("page", { timeout: 30000 }),
    link.click({ timeout: 15000 }),
  ])
  await provider.waitForLoadState("domcontentloaded", { timeout: 30000 })
  return provider
}

// Exercise actual provider UI and the real backend; never manufacture settlement evidence.
test("sandbox cancellation, explicit retry, settlement and immutable paid feedback", async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(240000)
  const fixture = await createDispatchFixture()
  try {
    await fixture.prepareBillingProfile()
    const request = await fixture.createRequest(true)
    const assigned = await fixture.assign(request.id)
    const completed = await fixture.completeAssignedWork(assigned.id)
    if (!completed.invoice)
      throw new Error("Completion did not issue an invoice")
    await page.goto("/login")
    await page.getByLabel("Email address").fill(fixture.email)
    await page.getByLabel("Password", { exact: true }).fill(fixture.password)
    await page.getByRole("button", { name: "Sign in", exact: true }).click()
    await expect(page).toHaveURL(/\/customer$/)
    await page.goto(`/customer/invoices/${completed.invoice.id}`)
    await page
      .getByLabel("Billing address", { exact: true })
      .fill("Disposable sandbox address")
    await page.getByLabel("City", { exact: true }).fill("Dhaka")
    await page.getByLabel("Postcode", { exact: true }).fill("1209")
    await page
      .getByRole("button", { name: "Prepare secure checkout", exact: true })
      .click()
    await expect(page).toHaveURL(/\/payments\/[\da-f-]{36}$/)
    const provider = await test.step("Open the actual hosted sandbox", () =>
      openSandboxCheckout(page))
    await expect(
      provider.getByRole("button", { name: /Pay\s+[\d,.]+\s+BDT/i })
    ).toBeVisible()
    await expect(provider.locator("input:visible").first()).toBeVisible({
      timeout: 30000,
    })
    await provider.locator('a[title="Cancel this transaction"]').click()
    await provider
      .getByRole("button", { name: "Yes, Cancel", exact: true })
      .click()
    await expect(provider).toHaveURL(
      /\/payment\/cancel\?paymentId=[\da-f-]{36}$/,
      { timeout: 45000 }
    )
    await expect(
      provider.getByRole("heading", { name: "Payment cancelled", exact: true })
    ).toBeVisible()
    const cancelledId = new URL(provider.url()).searchParams.get("paymentId")
    await expect(
      provider.getByText("Invoice: UNPAID", { exact: true })
    ).toBeVisible()
    await provider
      .getByRole("link", { name: "View invoice", exact: true })
      .click()
    await provider
      .getByRole("button", { name: "Prepare a new attempt", exact: true })
      .click()
    await expect(
      provider.getByLabel("Billing address", { exact: true })
    ).toBeEnabled()
    await provider
      .getByLabel("Billing address", { exact: true })
      .fill("Disposable sandbox address")
    await provider.getByLabel("City", { exact: true }).fill("Dhaka")
    await provider.getByLabel("Postcode", { exact: true }).fill("1209")
    await provider
      .getByRole("button", { name: "Prepare secure checkout", exact: true })
      .click()
    await expect(provider).toHaveURL(/\/payments\/[\da-f-]{36}$/)
    const replacementId = provider.url().split("/").at(-1)
    if (!cancelledId || !replacementId)
      throw new Error("Missing actual payment identity")
    expect(replacementId).not.toBe(cancelledId)
    const bank =
      await test.step("Open the explicitly prepared replacement", () =>
        openSandboxCheckout(provider))
    await expect(
      bank.getByPlaceholder("Enter Card Number", { exact: true })
    ).toBeVisible()
    await bank
      .getByPlaceholder("Enter Card Number", { exact: true })
      .pressSequentially("4111111111111111")
    await bank
      .getByPlaceholder("MM/YY", { exact: true })
      .pressSequentially("12/26")
    await bank
      .getByPlaceholder("CVC/CVV", { exact: true })
      .pressSequentially("111")
    await bank
      .getByPlaceholder("Card Holder Name", { exact: true })
      .pressSequentially("Disposable Sandbox Tester")
    await bank
      .getByPlaceholder("Card Holder Name", { exact: true })
      .press("Tab")
    const pay = bank.getByRole("button", { name: /Pay\s+[\d,.]+\s+BDT/i })
    await expect(pay).not.toHaveClass(/btn_full_width_disable/)
    await pay.click()
    await expect(
      bank.getByPlaceholder("Enter Card Number", { exact: true })
    ).not.toBeVisible({ timeout: 45000 })
    await expect(
      bank.getByRole("heading", { name: "OTP Page", exact: true })
    ).toBeVisible()
    await bank.locator('input[name="pan"]').fill("111111")
    await bank.getByRole("button", { name: "Success", exact: true }).click()
    await expect(bank).toHaveURL(
      new RegExp(`/payment/success\\?paymentId=${replacementId}$`),
      { timeout: 45000 }
    )
    await expect(
      bank.getByRole("heading", { name: "Payment verified", exact: true })
    ).toBeVisible()
    await expect(
      bank.getByText("Attempt: SUCCEEDED", { exact: true })
    ).toBeVisible()
    await expect(bank.getByText("Invoice: PAID", { exact: true })).toBeVisible()
    await bank.screenshot({
      path: test.info().outputPath("verified-payment.png"),
      fullPage: true,
    })
    const work = await fixture.getWork(completed.id)
    expect(work.invoice?.status).toBe("PAID")
    expect(work.invoice?.amountMinor).toBe(completed.invoice.amountMinor)
    expect(work.feedback).toBeNull()

    // The completed-service link reads current paid eligibility before showing feedback.
    await bank
      .getByRole("link", { name: "View completed service", exact: true })
      .click()
    await expect(
      bank.getByRole("button", { name: "Submit feedback", exact: true })
    ).toBeVisible()
    // Verify the actual controlled widget before submitting one immutable review.
    const rating = bank.getByRole("radiogroup", { name: "Rating", exact: true })
    await expect(rating.getByRole("radio")).toHaveCount(5)
    const highest = rating.getByRole("radio", {
      name: "5 of 5, Excellent",
      exact: true,
    })
    await expect(highest).toBeEnabled()
    expect(
      (
        await new AxeBuilder({ page: bank })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations
    ).toEqual([])
    await highest.focus()
    await bank.keyboard.press("ArrowLeft")
    await expect(
      rating.getByRole("radio", { name: "4 of 5, Good", exact: true })
    ).toHaveAttribute("aria-checked", "true")
    await rating
      .getByRole("radio", { name: "3 of 5, Fair", exact: true })
      .click()
    await expect(
      rating.getByRole("radio", { name: "3 of 5, Fair", exact: true })
    ).toHaveAttribute("aria-checked", "true")
    await bank.setViewportSize({ width: 320, height: 900 })
    expect(
      await rating.evaluate((node) => node.scrollWidth <= node.clientWidth)
    ).toBe(true)
    await highest.focus()
    await bank.keyboard.press("End")
    await expect(highest).toHaveAttribute("aria-checked", "true")
    await bank.setViewportSize({ width: 1280, height: 900 })
    const comment = `Paid sandbox verification ${fixture.marker}`
    await bank.getByLabel("Comment (optional)", { exact: true }).fill(comment)
    let feedbackCalls = 0
    const actionUrl = `**/customer/work-orders/${completed.id}`
    await bank.route(actionUrl, async (route) => {
      if (
        route.request().method() === "POST" &&
        route.request().headers()["next-action"]
      ) {
        feedbackCalls++
        const response = await route.fetch()
        expect(response.ok()).toBe(true)
        await route.abort("failed")
      } else await route.continue()
    })
    await bank
      .getByRole("button", { name: "Submit feedback", exact: true })
      .click()
    await expect(
      bank.getByRole("alert").filter({ hasText: "outcome is uncertain" })
    ).toBeVisible()
    expect(feedbackCalls).toBe(1)
    await expect(
      bank.getByRole("button", { name: "Submit feedback", exact: true })
    ).toBeDisabled()
    await expect(
      bank.getByLabel("Comment (optional)", { exact: true })
    ).toHaveValue(comment)
    await bank.unroute(actionUrl)
    await bank
      .getByRole("button", { name: "Inspect latest feedback", exact: true })
      .click()
    await expect(bank.getByText(comment, { exact: true })).toBeVisible()
    await bank.reload()
    await expect(bank.getByText(comment, { exact: true })).toBeVisible()
    await expect(
      bank.getByRole("button", { name: "Submit feedback", exact: true })
    ).not.toBeVisible()
    const recorded = await fixture.getWork(completed.id)
    expect(recorded.feedback).toMatchObject({ rating: 5, comment })
    await bank.screenshot({
      path: test.info().outputPath("paid-feedback.png"),
      fullPage: true,
    })

    // Old-attempt navigation cannot reopen checkout after the replacement pays the invoice.
    await page.goto(`/payments/${cancelledId}`)
    await expect(
      page.getByRole("heading", { name: "Invoice already paid", exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Open sandbox checkout", exact: true })
    ).not.toBeVisible()
    await page.getByRole("link", { name: "View invoice", exact: true }).click()
    await expect(
      page.getByRole("button", { name: "Prepare secure checkout", exact: true })
    ).not.toBeVisible()
    await expect(
      page.getByRole("button", { name: "Prepare a new attempt", exact: true })
    ).not.toBeVisible()

    const loginContext = await browser.newContext({
      baseURL: baseURL ?? "http://localhost:3002",
    })
    try {
      const signedOut = await loginContext.newPage()
      await signedOut.goto(
        `/payment/success?paymentId=${replacementId}&status=failed`
      )
      await expect(signedOut).toHaveURL(/\/login\?returnTo=/)
      await signedOut.getByLabel("Email address").fill(fixture.email)
      await signedOut
        .getByLabel("Password", { exact: true })
        .fill(fixture.password)
      await signedOut
        .getByRole("button", { name: "Sign in", exact: true })
        .click()
      await expect(signedOut).toHaveURL(
        new RegExp(`/payments/${replacementId}$`)
      )
      await expect(
        signedOut.getByRole("heading", {
          name: "Payment verified",
          exact: true,
        })
      ).toBeVisible()
      await signedOut.setViewportSize({ width: 320, height: 900 })
      expect(
        await signedOut.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
    } finally {
      await loginContext.close()
    }
    await writeFile(
      test.info().outputPath("payment-evidence.json"),
      JSON.stringify({
        paymentId: replacementId,
        cancelledId,
        workOrderId: completed.id,
        invoiceId: completed.invoice.id,
      })
    )
    await bank.close()
    await provider.close()
  } finally {
    await fixture.cleanup()
  }
})
