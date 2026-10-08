import { describe, expect, it } from "vitest"
import { feedbackEligible, feedbackInputSchema } from "./schemas"
describe("one immutable customer review", () => {
  it("requires completed, paid work with no prior feedback or known review hold", () => {
    const work = {
      status: "COMPLETED",
      invoice: { status: "PAID" },
      feedback: null,
    }
    expect(feedbackEligible(work)).toBe(true)
    expect(feedbackEligible(work, true)).toBe(false)
    expect(feedbackEligible({ ...work, status: "IN_PROGRESS" })).toBe(false)
    expect(feedbackEligible({ ...work, invoice: { status: "UNPAID" } })).toBe(
      false
    )
    expect(feedbackEligible({ ...work, feedback: { id: "existing" } })).toBe(
      false
    )
  })
  it("accepts omitted comments and normal line breaks without allowing client ownership", () => {
    expect(feedbackInputSchema.parse({ rating: 5 })).toEqual({ rating: 5 })
    expect(
      feedbackInputSchema.safeParse({
        rating: 4,
        comment: "Clear explanation.\nThank you.",
      }).success
    ).toBe(true)
    expect(
      feedbackInputSchema.safeParse({ rating: 5, customerId: "forged" }).success
    ).toBe(false)
  })
  it.each([
    { rating: 0 },
    { rating: 6 },
    { rating: 2.5 },
    { rating: "5" },
    { rating: 5, comment: " " },
    { rating: 5, comment: "bad\u0000text" },
    { rating: 5, comment: null },
  ])("rejects unsupported feedback: %j", (input) => {
    expect(feedbackInputSchema.safeParse(input).success).toBe(false)
  })
})
