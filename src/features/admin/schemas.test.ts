import { describe, expect, it } from "vitest"
import {
  formatRevenue,
  overviewApiQuery,
  overviewFilterSchema,
  parseOverviewFilters,
  overviewSchema,
} from "./schemas"
describe("report periods and exact money", () => {
  it("keeps Dhaka midnight and the exclusive end explicit", () => {
    expect(
      overviewApiQuery(
        overviewFilterSchema.parse({ from: "2026-10-01", to: "2026-11-01" })
      )
    ).toEqual({
      from: "2026-10-01T00:00:00+06:00",
      to: "2026-11-01T00:00:00+06:00",
    })
    expect(
      overviewApiQuery(overviewFilterSchema.parse({ from: "", to: "" }))
    ).toEqual({})
  })
  it.each([
    { from: "2026-10-01", to: "" },
    { from: "2026-11-01", to: "2026-10-01" },
    { from: "2026-01-01", to: "2028-01-01" },
    { from: "invalid", to: "2026-11-01" },
  ])("rejects incomplete or unsupported period %j", (filters) => {
    expect(parseOverviewFilters(filters).success).toBe(false)
  })
  it("does not lose paisa above Number's safe integer range", () => {
    expect(formatRevenue("900719925474099301")).toBe(
      "BDT 9,007,199,254,740,993.01"
    )
    expect(formatRevenue("1")).toBe("BDT 0.01")
  })
  it("rejects malformed or numeric aggregate revenue", () => {
    const base = {
      period: { from: "2026-10-01T00:00:00Z", to: "2026-11-01T00:00:00Z" },
      requests: { total: 0, byStatus: {} },
      workOrders: { total: 0, completed: 0, completionRate: 0 },
      technicians: { total: 0, active: 0 },
    }
    expect(
      overviewSchema.safeParse({
        ...base,
        invoices: { paidCount: 1, verifiedRevenueMinor: 1, currency: "BDT" },
      }).success
    ).toBe(false)
    expect(
      overviewSchema.safeParse({
        ...base,
        invoices: {
          paidCount: 1,
          verifiedRevenueMinor: "1.5",
          currency: "BDT",
        },
      }).success
    ).toBe(false)
  })
})
