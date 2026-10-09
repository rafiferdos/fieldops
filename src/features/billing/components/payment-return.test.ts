import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ requireViewer: vi.fn() }))
vi.mock("@/features/auth/session", () => ({
  requireViewer: mocks.requireViewer,
}))
vi.mock("./payment-status", () => ({ PaymentStatus: () => null }))
import { PaymentReturn } from "./payment-return"
import { PaymentStatus } from "./payment-status"

describe("payment return identity", () => {
  beforeEach(() =>
    mocks.requireViewer.mockResolvedValue({ profile: { role: "CUSTOMER" } })
  )

  it("delegates a valid attempt to the owned payment read so login preserves its identity", async () => {
    const paymentId = "00000000-0000-4000-8000-000000000001"
    const result = await PaymentReturn({
      values: {
        paymentId,
        status: "success",
        returnTo: "https://evil.example",
      },
    })
    expect(result.type).toBe(PaymentStatus)
    expect(result.props).toEqual({ paymentId })
    expect(mocks.requireViewer).not.toHaveBeenCalled()
  })

  it.each([
    undefined,
    "invalid",
    [
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000002",
    ],
  ])(
    "does not select missing, malformed or duplicate attempt IDs: %s",
    async (paymentId) => {
      const result = await PaymentReturn({
        values: { paymentId, status: "success" },
      })
      expect(result.type).not.toBe(PaymentStatus)
      expect(mocks.requireViewer).toHaveBeenCalledOnce()
    }
  )
})
