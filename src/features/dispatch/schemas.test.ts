import { describe, expect, it } from "vitest"
import {
  windowSchema,
  assignmentSchema,
  scheduleSchema,
  reviewSchema,
  parseAvailabilitySearch,
  scheduleFormSchema,
} from "./schemas"

const start = "2035-01-02T10:00:00+06:00",
  end = "2035-01-02T18:00:00+06:00"
const technicianId = "00000000-0000-4000-8000-000000000001"
describe("dispatch contract", () => {
  it("accepts the exact eight-hour boundary without letting clients choose price or ownership", () => {
    expect(
      assignmentSchema.safeParse({ start, end, technicianId }).success
    ).toBe(true)
    for (const extra of [
      { version: 1 },
      { agreedPriceMinor: 1 },
      { customerId: technicianId },
    ])
      expect(
        assignmentSchema.safeParse({ start, end, technicianId, ...extra })
          .success
      ).toBe(false)
  })
  it.each([
    "2035-01-02T18:00:00.001+06:00",
    start,
    "2035-01-02T09:59:00+06:00",
  ])("rejects overlong, empty or reversed windows: %s", (badEnd) => {
    expect(windowSchema.safeParse({ start, end: badEnd }).success).toBe(false)
  })
  it("rejects past, offset-less and unsupported precision timestamps", () => {
    for (const badStart of [
      "2020-01-02T10:00:00Z",
      "2035-01-02T10:00:00",
      "2035-01-02T10:00:00.0001+06:00",
    ])
      expect(windowSchema.safeParse({ start: badStart, end }).success).toBe(
        false
      )
    expect(
      scheduleFormSchema.safeParse({
        startLocal: "2035-02-30T10:00",
        endLocal: "2035-02-30T11:00",
      }).success
    ).toBe(false)
  })
  it("requires an incrementable work version only for rescheduling", () => {
    expect(
      scheduleSchema.safeParse({ start, end, technicianId, version: 1 }).success
    ).toBe(true)
    for (const version of [0, 1.5, 2147483647])
      expect(
        scheduleSchema.safeParse({ start, end, technicianId, version }).success
      ).toBe(false)
  })
  it("requires a reason for rejection and does not send a hidden approval reason", () => {
    expect(
      reviewSchema.safeParse({ version: 1, decision: "APPROVE" }).success
    ).toBe(true)
    expect(
      reviewSchema.safeParse({
        version: 1,
        decision: "APPROVE",
        reason: "hidden",
      }).success
    ).toBe(false)
    expect(
      reviewSchema.safeParse({
        version: 1,
        decision: "REJECT",
        reason: "  Missing service details  ",
      }).success
    ).toBe(true)
    expect(
      reviewSchema.safeParse({ version: 1, decision: "REJECT", reason: "  " })
        .success
    ).toBe(false)
  })
  it("restores only valid availability URL state", () => {
    expect(
      parseAvailabilitySearch({
        start,
        end,
        techPage: "2",
        technicianId: "foreign",
      })
    ).toEqual({ start, end, page: 2 })
    expect(parseAvailabilitySearch({ start, end: "invalid" })).toBeNull()
  })
})
