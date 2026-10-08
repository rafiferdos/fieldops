import { describe, expect, it } from "vitest"
import { nextWorkStatus } from "./status"
import {
  parseWorkQuery,
  completionSchema,
  progressSchema,
  workOrderSchema,
  timelineEntrySchema,
} from "./schemas"

describe("execution and tracking boundaries", () => {
  it("renders validated timeline transitions without forwarding arbitrary audit metadata", () => {
    const entry = {
      id: "00000000-0000-4000-8000-000000000001",
      action: "WORK_ORDER_STATUS_CHANGED",
      createdAt: "2035-01-02T04:00:00Z",
      metadata: {
        fromStatus: "ASSIGNED",
        toStatus: "EN_ROUTE",
        unrelated: "private value",
      },
    }
    expect(timelineEntrySchema.parse(entry).metadata).toEqual({
      fromStatus: "ASSIGNED",
      toStatus: "EN_ROUTE",
    })
    expect(
      timelineEntrySchema.safeParse({
        ...entry,
        metadata: { toStatus: "APPROVED" },
      }).success
    ).toBe(false)
  })
  it("offers only the next legal progress state, keeping completion separate", () => {
    expect(nextWorkStatus("ASSIGNED")).toBe("EN_ROUTE")
    expect(nextWorkStatus("EN_ROUTE")).toBe("IN_PROGRESS")
    for (const status of ["IN_PROGRESS", "COMPLETED", "CANCELLED"] as const)
      expect(nextWorkStatus(status)).toBeNull()
    expect(
      progressSchema.safeParse({ version: 1, status: "COMPLETED" }).success
    ).toBe(false)
  })
  it("requires a frozen-report-shaped completion without invoice or ownership input", () => {
    const input = {
      version: 3,
      report: "  Inspected and repaired the cooling unit.  ",
    }
    expect(completionSchema.parse(input).report).toBe(
      "Inspected and repaired the cooling unit."
    )
    for (const extra of [
      { invoiceId: "injected" },
      { amountMinor: 1 },
      { technicianId: "foreign" },
    ])
      expect(completionSchema.safeParse({ ...input, ...extra }).success).toBe(
        false
      )
    for (const report of ["short", "x".repeat(2001)])
      expect(completionSchema.safeParse({ ...input, report }).success).toBe(
        false
      )
  })
  it("reads the final stored version but will not overflow a write version", () => {
    expect(workOrderSchema.shape.version.safeParse(2147483647).success).toBe(
      true
    )
    expect(
      progressSchema.safeParse({ version: 2147483647, status: "EN_ROUTE" })
        .success
    ).toBe(false)
  })
  it("keeps scope out of queries and defaults technician queues to scheduled visits", () => {
    expect(
      parseWorkQuery(
        {
          customerId: "foreign",
          technicianId: "foreign",
          status: "APPROVED",
          page: "0",
          serviceId: "invalid",
        },
        "scheduled_start_asc"
      )
    ).toEqual({
      q: "",
      page: 1,
      limit: 20,
      sort: "scheduled_start_asc",
      status: undefined,
      serviceId: undefined,
    })
  })
})
