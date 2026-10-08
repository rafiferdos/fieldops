import { describe, expect, it } from "vitest"
import { parseServiceQuery, serviceSchema } from "./schemas"
describe("catalog boundary", () => {
  it("allowlists filters and normalizes invalid URL values", () => {
    expect(
      parseServiceQuery({
        q: "  repair  ",
        sort: "price_asc",
        page: "2",
        role: "ADMIN",
        limit: "1000",
      })
    ).toEqual({ q: "repair", sort: "price_asc", page: 2, limit: 20 })
    expect(
      parseServiceQuery({
        q: ["ambiguous", "value"],
        page: "0",
        sort: "unsafe",
      })
    ).toEqual({ q: "", page: 1, limit: 20, sort: "newest" })
  })
  it("rejects unsafe money from external data", () => {
    expect(
      serviceSchema.safeParse({
        id: "00000000-0000-4000-8000-000000000001",
        name: "Service",
        description: "Description",
        currency: "BDT",
        basePriceMinor: 0.5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).success
    ).toBe(false)
  })
})
