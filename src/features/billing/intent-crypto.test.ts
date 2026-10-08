import { randomBytes } from "node:crypto"
import { describe, expect, it } from "vitest"
import { openIntent, sealIntent } from "./intent-crypto"
import type { CheckoutIntent } from "./schemas"
describe("private checkout recovery envelope", () => {
  const key = randomBytes(32),
    context = "customer:invoice"
  const intent: CheckoutIntent = {
    key: "00000000-0000-4000-8000-000000000001",
    billing: { address: "Private address", city: "Dhaka", postcode: "1209" },
    paymentId: null,
    createdAt: "2026-10-09T00:00:00Z",
  }
  it("round trips without plaintext billing and uses fresh nonces", () => {
    const first = sealIntent(intent, key, context)
    expect(first).not.toContain(intent.billing.address)
    expect(first).not.toBe(sealIntent(intent, key, context))
    expect(openIntent(first, key, context)).toEqual(intent)
  })
  it("fails closed for a foreign customer/invoice or altered ciphertext", () => {
    const sealed = sealIntent(intent, key, context)
    expect(() => openIntent(sealed, key, "other:invoice")).toThrow()
    const packed = Buffer.from(sealed, "base64")
    const last = packed.at(-1)
    if (last === undefined) throw new Error("Missing encrypted payload")
    packed[packed.length - 1] = last ^ 1
    expect(() => openIntent(packed.toString("base64"), key, context)).toThrow()
  })
})
