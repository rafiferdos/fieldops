import { describe, expect, it } from "vitest"
import {
  canCancelRequest,
  createRequestSchema,
  dhakaInstant,
  dhakaLocal,
  parseRequestQuery,
  visitFormSchema,
} from "./schemas"
describe("request policy and boundaries", () => {
  it("converts an explicit Dhaka visit without relying on browser timezone", () => {
    expect(dhakaInstant("2030-01-02T10:30")).toBe("2030-01-02T10:30:00+06:00")
    expect(dhakaLocal("2030-01-02T04:30:00Z")).toBe("2030-01-02T10:30")
    expect(
      visitFormSchema.safeParse({
        description: "A service description",
        address: "A complete service address",
        preferredLocal: "2030-02-30T12:00",
      }).success
    ).toBe(false)
  })
  it("rejects past visits and client ownership/price fields", () => {
    const input = {
      serviceId: "00000000-0000-4000-8000-000000000001",
      description: "A service description",
      address: "A complete service address",
      preferredStart: new Date(Date.now() + 86400000).toISOString(),
    }
    expect(createRequestSchema.safeParse(input).success).toBe(true)
    expect(
      createRequestSchema.safeParse({ ...input, customerId: input.serviceId })
        .success
    ).toBe(false)
    expect(createRequestSchema.safeParse({ ...input, price: 1 }).success).toBe(
      false
    )
    expect(
      createRequestSchema.safeParse({
        ...input,
        preferredStart: "2020-01-01T00:00:00Z",
      }).success
    ).toBe(false)
  })
  it.each(["EN_ROUTE", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const)(
    "never offers cancellation after work leaves ASSIGNED: %s",
    (status) => {
      expect(
        canCancelRequest({
          status: "APPROVED",
          workOrder: {
            id: "work",
            status,
            version: 1,
            scheduledStart: "start",
            scheduledEnd: "end",
          },
        })
      ).toBe(false)
    }
  )
  it("offers cancellation only for eligible request review states", () => {
    expect(canCancelRequest({ status: "PENDING", workOrder: null })).toBe(true)
    expect(canCancelRequest({ status: "REJECTED", workOrder: null })).toBe(
      false
    )
    expect(canCancelRequest({ status: "CANCELLED", workOrder: null })).toBe(
      false
    )
  })
  it("never forwards unknown URL fields or invalid service filters", () => {
    const query = parseRequestQuery({
      status: "COMPLETED",
      serviceId: "invalid",
      customerId: "foreign",
      page: "-1",
    })
    expect(query).toEqual({
      q: "",
      sort: "newest",
      page: 1,
      limit: 20,
      status: undefined,
      serviceId: undefined,
    })
  })
})
