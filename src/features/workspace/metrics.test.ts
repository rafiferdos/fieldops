import { describe, expect, it } from "vitest"
import { dashboardSchema } from "./schemas"
import { dashboardMetrics } from "./metrics"

const work = {
  total: 72,
  recent: [],
  byStatus: {
    ASSIGNED: 30,
    EN_ROUTE: 2,
    IN_PROGRESS: 10,
    COMPLETED: 28,
    CANCELLED: 2,
  },
}
const requests = {
  total: 82,
  recent: [],
  byStatus: { PENDING: 8, APPROVED: 72, REJECTED: 1, CANCELLED: 1 },
}
const common = {
  viewerId: "00000000-0000-4000-8000-000000000001",
  capturedAt: "2026-10-09T00:00:00Z",
  work,
}

describe("real metric semantics", () => {
  it("uses authorized totals and filtered counts instead of recent sample length", () => {
    const data = dashboardSchema.parse({
      ...common,
      role: "CUSTOMER",
      requests,
    })
    const metrics = dashboardMetrics(data)
    expect(
      metrics.find((metric) => metric.label === "My requests")?.value
    ).toBe(82)
    expect(
      metrics.find((metric) => metric.label === "Awaiting review")?.value
    ).toBe(8)
    expect(metrics.find((metric) => metric.label === "Scheduled")?.href).toBe(
      "/customer/work-orders?status=ASSIGNED"
    )
    expect(
      metrics.find((metric) => metric.label === "Total visits")?.value
    ).toBe(72)
  })
  it("keeps technician metrics in assigned-work routes", () => {
    const metrics = dashboardMetrics(
      dashboardSchema.parse({ ...common, role: "TECHNICIAN" })
    )
    expect(metrics).toHaveLength(6)
    expect(
      metrics.every((metric) =>
        metric.href?.startsWith("/technician/work-orders")
      )
    ).toBe(true)
  })
  it("separates period revenue/cohort counts from current operational queues", () => {
    const data = dashboardSchema.parse({
      ...common,
      role: "ADMIN",
      requests,
      overview: {
        period: { from: "2026-09-09T00:00:00Z", to: "2026-10-09T00:00:00Z" },
        requests: { total: 3, byStatus: { PENDING: 2, APPROVED: 1 } },
        workOrders: { total: 1, completed: 1, completionRate: 100 },
        invoices: {
          paidCount: 1,
          verifiedRevenueMinor: "10000000000000000001",
          currency: "BDT",
        },
        technicians: { total: 3, active: 2 },
      },
    })
    const metrics = dashboardMetrics(data)
    expect(
      metrics.find((metric) => metric.label === "Period requests")?.value
    ).toBe(3)
    expect(
      metrics.find((metric) => metric.label === "Awaiting review")?.value
    ).toBe(8)
    expect(
      metrics.find((metric) => metric.label === "Verified revenue")?.value
    ).toBe("BDT 100,000,000,000,000,000.01")
  })
  it("rejects negative or missing counts rather than filling them with zero", () => {
    expect(
      dashboardSchema.safeParse({
        ...common,
        role: "TECHNICIAN",
        work: { ...work, byStatus: { ASSIGNED: -1 } },
      }).success
    ).toBe(false)
  })
})
