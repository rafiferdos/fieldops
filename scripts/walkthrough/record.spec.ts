import { writeFile } from "node:fs/promises"
import { expect, test } from "@playwright/test"
import { createDispatchFixture } from "../../tests/e2e/helpers/dispatch-fixtures"
import { chooseOption } from "../../tests/e2e/helpers/choice-select"
import { respectAuthWindow } from "../../tests/e2e/helpers/auth-window"
import { dhakaLocal } from "../../src/features/requests/schemas"
import { formatMoney } from "../../src/shared/lib/format"

// Recording creates real disposable work and a sandbox settlement; it never uses customer data.
test.skip(
  process.env.WALKTHROUGH_RECORD !== "1" ||
    process.env.E2E_REAL_SANDBOX !== "1" ||
    process.env.E2E_LIVE_WRITES !== "1",
  "Requires deliberate opt-in to disposable data, recording and sandbox payment"
)

test("record an actual request-to-paid-feedback walkthrough", async ({
  page,
}, info) => {
  await respectAuthWindow()
  const fixture = await createDispatchFixture()
  const started = Date.now()
  const scenes: { second: number; title: string; explanation: string }[] = []
  // Reading pauses are deliberate video pacing, never a substitute for readiness assertions.
  async function scene(title: string, explanation: string, seconds = 16) {
    scenes.push({
      second: Math.round((Date.now() - started) / 1000),
      title,
      explanation,
    })
    console.log(`Walkthrough: ${title}`)
    await page.waitForTimeout(seconds * 1000)
  }
  async function logout() {
    await page.goto("/account")
    await page.getByRole("button", { name: "Sign out", exact: true }).click()
    await expect(page).toHaveURL(/\/login$/)
  }
  async function customerLogin() {
    await page.goto("/login")
    await page.getByLabel("Email address").fill(fixture.email)
    await page.getByLabel("Password", { exact: true }).fill(fixture.password)
    await page.getByRole("button", { name: "Sign in", exact: true }).click()
    await expect(page).toHaveURL(/\/customer$/)
  }
  async function demoLogin(role: "Admin" | "Technician") {
    await page.goto("/login")
    await page
      .getByRole("button", { name: `${role} demo`, exact: true })
      .click()
    await expect(page).toHaveURL(new RegExp(`/${role.toLowerCase()}$`))
  }
  try {
    await fixture.prepareBillingProfile()
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await scene(
      "FieldOps",
      "Real service coordination with server-rendered public content and accessible motion."
    )
    await page
      .getByRole("heading", { name: /A little structure/ })
      .scrollIntoViewIfNeeded()
    await scene(
      "From request to resolution",
      "Customer, administrator and technician responsibilities remain explicit."
    )
    await page.goto("/faq")
    await page
      .getByRole("button", {
        name: "Is my preferred time a confirmed booking?",
        exact: true,
      })
      .click()
    await scene(
      "Accessible service guidance",
      "Image-card disclosures use supported shadcn controls and preserve keyboard behavior."
    )
    await page.goto("/contact")
    await scene(
      "Verified support",
      "Only owner-approved email and telephone channels are published."
    )
    await page.goto(`/services/${fixture.service.id}`)
    await scene(
      "Actual service catalog",
      "Service identity, description and BDT price come from the backend."
    )
    await customerLogin()
    await page.goto(`/customer/requests/new?serviceId=${fixture.service.id}`)
    await chooseOption(
      page,
      "Service",
      `${fixture.service.name} · ${formatMoney(fixture.service.basePriceMinor)}`
    )
    await scene(
      "Choose a service",
      "The validated wizard uses a styled shadcn Select and a real catalog option."
    )
    await page.getByRole("button", { name: "Continue", exact: true }).click()
    await page
      .getByLabel("What needs attention?")
      .fill(`Disposable walkthrough repair ${fixture.marker}`)
    await page
      .getByLabel("Service address")
      .fill("Disposable demonstration address, Dhaka")
    await page
      .getByLabel("Preferred visit time")
      .fill(dhakaLocal(fixture.window.start))
    await scene(
      "Describe the visit",
      "Dates are explicit Dhaka time. The customer cannot choose a role, owner or price."
    )
    await page.getByRole("button", { name: "Continue", exact: true }).click()
    await expect(
      page.getByRole("heading", { name: "Review request" })
    ).toBeVisible()
    await scene(
      "Review before submitting",
      "Values persist between steps and the backend validates the final request again."
    )
    await page
      .getByRole("button", { name: "Submit request", exact: true })
      .click()
    await expect(page).toHaveURL(/\/customer\/requests\/[\da-f-]{36}$/)
    const requestId = page.url().split("/").at(-1)
    if (!requestId) throw new Error("Created request identity is missing")
    await fixture.trackRequest(requestId)
    await scene(
      "Owned request",
      "Only its owner can read this request. Pending edits and cancellation follow explicit state rules."
    )
    await logout()
    await demoLogin("Admin")
    await scene(
      "Administrative reporting",
      "Bounded periods, real status counts and exact verified revenue remain readable alongside the chart."
    )
    await page.goto(`/admin/requests/${requestId}`)
    await page.getByRole("button", { name: "Save review", exact: true }).click()
    await expect(
      page.getByRole("heading", { name: "Assign a visit" })
    ).toBeVisible()
    await scene(
      "Approve the request",
      "Review uses the latest request version. Stale decisions cannot replace a newer outcome."
    )
    await page
      .getByLabel("Visit start (Dhaka)")
      .fill(dhakaLocal(fixture.window.start))
    await page
      .getByLabel("Visit end (Dhaka)")
      .fill(dhakaLocal(fixture.window.end))
    await page
      .getByRole("button", { name: "Find technicians", exact: true })
      .click()
    await expect(page.getByLabel("Available technician")).toBeEnabled()
    await chooseOption(page, "Available technician", fixture.technician.name)
    await scene(
      "Qualified dispatch",
      "The backend checks technician skills, availability and scheduling collisions."
    )
    await page
      .getByRole("button", { name: "Confirm assignment", exact: true })
      .click()
    await expect(page).toHaveURL(/\/admin\/work-orders\/[\da-f-]{36}$/)
    const workId = page.url().split("/").at(-1)
    if (!workId) throw new Error("Assigned work identity is missing")
    await scene(
      "Confirmed work order",
      "Assignment snapshots the agreed price. Later catalog edits cannot change this visit's invoice."
    )
    await logout()
    await demoLogin("Technician")
    await page.goto(`/technician/work-orders/${workId}`)
    await scene(
      "Assigned technician",
      "Execution controls appear only for the assigned technician."
    )
    await page
      .getByRole("button", { name: "Start travelling", exact: true })
      .click()
    await expect(
      page.getByText("Work: EN_ROUTE", { exact: true })
    ).toBeVisible()
    await scene(
      "Travel recorded",
      "Versioned state transitions produce an auditable work timeline.",
      10
    )
    await page.getByRole("button", { name: "Start work", exact: true }).click()
    await page
      .getByLabel("Completion report", { exact: true })
      .fill(
        "Completed the disposable walkthrough repair and verified service operation."
      )
    await scene(
      "Completion report",
      "Completion freezes the report and creates one immutable invoice in a transaction."
    )
    await page
      .getByRole("button", {
        name: "Complete work and issue invoice",
        exact: true,
      })
      .click()
    await expect(
      page.getByText("Work: COMPLETED", { exact: true })
    ).toBeVisible()
    const work = await fixture.getWork(workId)
    if (!work.invoice) throw new Error("Completed work has no invoice")
    await scene(
      "Immutable invoice",
      "Invoice values come from the saved service snapshot, not client-supplied money."
    )
    await logout()
    await customerLogin()
    await page.goto(`/customer/invoices/${work.invoice.id}`)
    await page
      .getByLabel("Billing address", { exact: true })
      .fill("Disposable sandbox billing address")
    await page.getByLabel("City", { exact: true }).fill("Dhaka")
    await page.getByLabel("Postcode", { exact: true }).fill("1209")
    await scene(
      "Durable checkout",
      "An encrypted intent survives reloads and uncertain responses. No automatic charge retry occurs."
    )
    await page
      .getByRole("button", { name: "Prepare secure checkout", exact: true })
      .click()
    await expect(page).toHaveURL(/\/payments\/[\da-f-]{36}$/)
    const checkout = await page
      .getByRole("link", { name: "Open sandbox checkout", exact: true })
      .getAttribute("href")
    if (!checkout) throw new Error("The provider checkout URL is missing")
    // Keep the real provider in the recorded page; no callback or success state is fabricated.
    await page.goto(checkout)
    await expect(
      page.getByPlaceholder("Enter Card Number", { exact: true })
    ).toBeVisible()
    await page
      .getByPlaceholder("Enter Card Number", { exact: true })
      .pressSequentially("4111111111111111")
    await page
      .getByPlaceholder("MM/YY", { exact: true })
      .pressSequentially("12/26")
    await page
      .getByPlaceholder("CVC/CVV", { exact: true })
      .pressSequentially("111")
    await page
      .getByPlaceholder("Card Holder Name", { exact: true })
      .pressSequentially("Disposable Sandbox Tester")
    await page
      .getByPlaceholder("Card Holder Name", { exact: true })
      .press("Tab")
    await scene(
      "SSLCommerz sandbox",
      "This is the real provider sandbox with official synthetic card data. No live funds are used."
    )
    await page.getByRole("button", { name: /Pay\s+[\d,.]+\s+BDT/i }).click()
    await expect(
      page.getByRole("heading", { name: "OTP Page", exact: true })
    ).toBeVisible({ timeout: 45000 })
    await page.locator('input[name="pan"]').fill("111111")
    await page.getByRole("button", { name: "Success", exact: true }).click()
    await expect(page).toHaveURL(
      /\/payment\/success\?paymentId=[\da-f-]{36}$/,
      { timeout: 45000 }
    )
    await expect(
      page.getByRole("heading", { name: "Payment verified", exact: true })
    ).toBeVisible()
    await expect(page.getByText("Invoice: PAID", { exact: true })).toBeVisible()
    await scene(
      "Server-verified payment",
      "Only provider validation and matching settlement evidence establish success; URL status is never trusted."
    )
    await page
      .getByRole("link", { name: "View completed service", exact: true })
      .click()
    await page
      .getByLabel("Comment (optional)", { exact: true })
      .fill(
        "The disposable walkthrough service is complete and payment is verified."
      )
    await page
      .getByRole("button", { name: "Submit feedback", exact: true })
      .click()
    await expect(
      page.getByRole("button", { name: "Submit feedback", exact: true })
    ).not.toBeVisible()
    await scene(
      "Paid-service feedback",
      "The customer submits one immutable review only after backend-confirmed eligibility."
    )
    const verified = await fixture.getWork(workId)
    expect(verified.invoice?.status).toBe("PAID")
    expect(verified.feedback?.rating).toBe(5)
    await logout()
    await page.goto("/")
    await page.setViewportSize({ width: 390, height: 844 })
    await scene(
      "Responsive presentation",
      "The same semantic controls and theme tokens adapt to narrow screens."
    )
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/about")
    await scene(
      "Verification limits",
      "Recorded against the production build on loopback with disposable data. Hosted HTTPS and IPN are separate delivery checks."
    )
    await writeFile(
      info.outputPath("scenes.json"),
      JSON.stringify(
        {
          durationSeconds: Math.round((Date.now() - started) / 1000),
          scenes,
          requestId,
          workOrderId: workId,
          invoiceId: work.invoice.id,
        },
        null,
        2
      )
    )
  } finally {
    await fixture.cleanup()
  }
})
