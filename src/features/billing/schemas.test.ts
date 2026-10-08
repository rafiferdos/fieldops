import { describe, expect, it } from "vitest"
import { invoiceSchema } from "./schemas"

describe("immutable invoice boundary", () => {
  const invoice = {
    id: "00000000-0000-4000-8000-000000000001",
    workOrderId: "00000000-0000-4000-8000-000000000002",
    customerId: "00000000-0000-4000-8000-000000000003",
    amountMinor: 150000,
    currency: "BDT",
    status: "UNPAID",
    issuedAt: "2026-10-09T00:00:00Z",
    paidAt: null,
  }
  it("accepts the backend snapshot and excludes unrelated private fields", () => {
    expect(
      invoiceSchema.parse({ ...invoice, providerSecret: "hidden" })
    ).toEqual(invoice)
  })
  it.each([-1, 0.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid money: %s",
    (amountMinor) => {
      expect(invoiceSchema.safeParse({ ...invoice, amountMinor }).success).toBe(
        false
      )
    }
  )
  it("rejects foreign currency and client-invented settlement states", () => {
    expect(
      invoiceSchema.safeParse({ ...invoice, currency: "USD" }).success
    ).toBe(false)
    expect(
      invoiceSchema.safeParse({ ...invoice, status: "SUCCESS" }).success
    ).toBe(false)
  })
})
