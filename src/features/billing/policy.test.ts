import { describe, expect, it } from "vitest"
import { invoiceSchema, paymentSchema, checkoutSchema } from "./schemas"
import { paymentOutcome, safeCheckoutUrl, canStartNewAttempt } from "./policy"
const id = "00000000-0000-4000-8000-000000000001",
  at = "2026-10-09T00:00:00Z"
const invoice = invoiceSchema.parse({
  id,
  workOrderId: id,
  customerId: id,
  amountMinor: 150000,
  currency: "BDT",
  status: "UNPAID",
  issuedAt: at,
  paidAt: null,
})
const payment = paymentSchema.parse({
  id,
  invoiceId: id,
  amountMinor: 150000,
  currency: "BDT",
  gateway: "SSLCOMMERZ",
  mode: "SANDBOX",
  status: "PENDING",
  checkoutUrl: "https://sandbox.sslcommerz.com/checkout",
  requiresReview: false,
  reviewReason: null,
  createdAt: at,
  updatedAt: at,
  verifiedAt: null,
  settledAt: null,
})

describe("payment evidence and recovery boundaries", () => {
  it("requires matching verified settlement and a paid invoice", () => {
    const succeeded = {
      ...payment,
      status: "SUCCEEDED" as const,
      verifiedAt: at,
      settledAt: at,
    }
    expect(paymentOutcome(succeeded, invoice).title).toBe(
      "Payment not yet confirmed"
    )
    expect(
      paymentOutcome(succeeded, { ...invoice, status: "PAID", paidAt: at })
        .title
    ).toBe("Payment verified")
    expect(
      paymentOutcome(
        { ...succeeded, settledAt: null },
        { ...invoice, status: "PAID", paidAt: at }
      ).title
    ).toBe("Payment not yet confirmed")
    expect(
      paymentOutcome(
        { ...succeeded, requiresReview: true },
        { ...invoice, status: "PAID", paidAt: at }
      ).title
    ).toBe("Payment needs review")
    expect(
      paymentOutcome({ ...succeeded, amountMinor: 1 }, invoice).title
    ).toBe("Payment needs inspection")
  })
  it.each(["INITIATING", "PENDING", "UNKNOWN", "REVIEW", "SUCCEEDED"] as const)(
    "never releases an intent in %s",
    (status) => {
      expect(
        canStartNewAttempt({ ...payment, status, verifiedAt: at }, invoice)
      ).toBe(false)
    }
  )
  it("releases only verified terminal failure without a paid invoice or review hold", () => {
    const failed = { ...payment, status: "FAILED" as const, verifiedAt: at }
    expect(canStartNewAttempt(failed, invoice)).toBe(true)
    expect(canStartNewAttempt({ ...failed, verifiedAt: null }, invoice)).toBe(
      false
    )
    expect(
      canStartNewAttempt({ ...failed, requiresReview: true }, invoice)
    ).toBe(false)
    expect(
      canStartNewAttempt(failed, { ...invoice, status: "PAID", paidAt: at })
    ).toBe(false)
  })
  it("explains a cancelled attempt whose invoice was paid by a replacement without declaring the old attempt successful", () => {
    const old = { ...payment, status: "CANCELLED" as const, verifiedAt: at },
      paid = { ...invoice, status: "PAID" as const, paidAt: at }
    expect(paymentOutcome(old, paid).kind).toBe("paid-elsewhere")
    expect(canStartNewAttempt(old, paid)).toBe(false)
    expect(safeCheckoutUrl(old, paid)).toBeNull()
  })
  it.each([
    "https://sandbox.sslcommerz.com.evil.example/checkout",
    "https://evil.example/checkout",
    "http://sandbox.sslcommerz.com/checkout",
    "https://user:password@sandbox.sslcommerz.com/checkout",
    "https://sandbox.sslcommerz.com/checkout#fragment",
  ])("blocks untrusted checkout URL %s", (checkoutUrl) => {
    expect(safeCheckoutUrl({ ...payment, checkoutUrl }, invoice)).toBeNull()
  })
  it("allows only the mode's provider URL on a matching unpaid pending attempt", () => {
    expect(safeCheckoutUrl(payment, invoice)).toBe(payment.checkoutUrl)
    expect(safeCheckoutUrl({ ...payment, mode: "LIVE" }, invoice)).toBeNull()
    expect(
      safeCheckoutUrl({ ...payment, requiresReview: true }, invoice)
    ).toBeNull()
    expect(
      safeCheckoutUrl(payment, { ...invoice, status: "PAID", paidAt: at })
    ).toBeNull()
  })
  it("rejects client pricing, ownership, extra billing fields and incomplete billing", () => {
    const billing = { address: "House 12", city: "Dhaka", postcode: "1209" }
    expect(checkoutSchema.safeParse({ billing, amountMinor: 1 }).success).toBe(
      false
    )
    expect(
      checkoutSchema.safeParse({ billing: { ...billing, country: "USA" } })
        .success
    ).toBe(false)
    expect(
      checkoutSchema.safeParse({ billing: { ...billing, address: "" } }).success
    ).toBe(false)
  })
})
