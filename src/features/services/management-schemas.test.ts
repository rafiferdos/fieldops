import { describe, expect, it } from "vitest"
import {
  priceFromMinor,
  priceToMinor,
  serviceInputSchema,
  serviceUpdateSchema,
} from "./management-schemas"
describe("catalog money and mutation boundaries", () => {
  it.each([
    ["0", 0],
    ["0.01", 1],
    ["10.10", 1010],
    ["10000000.00", 1000000000],
  ] as const)("parses BDT %s exactly", (price, minor) => {
    expect(priceToMinor(price)).toBe(minor)
    expect(priceToMinor(priceFromMinor(minor))).toBe(minor)
  })
  it.each([
    "-1",
    "1.001",
    "1e3",
    "Infinity",
    "10000000.01",
    "99999999",
    "01.00",
    "",
  ])("rejects unsupported price %s", (price) => {
    expect(priceToMinor(price)).toBeNull()
  })
  it("rejects empty changes, currency injection and unsafe numeric prices", () => {
    expect(serviceUpdateSchema.safeParse({}).success).toBe(false)
    expect(
      serviceInputSchema.safeParse({
        name: "New service",
        description: "A valid description.",
        basePriceMinor: 1000,
        currency: "USD",
      }).success
    ).toBe(false)
    expect(serviceUpdateSchema.safeParse({ basePriceMinor: 0.5 }).success).toBe(
      false
    )
  })
})
