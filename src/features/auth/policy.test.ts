import { describe, expect, it } from "vitest"
import { safeReturnPath } from "./policy"
import { loginSchema, registerSchema } from "./schemas"

describe("authentication boundaries", () => {
  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/%5cevil.example",
    "/%00customer",
    "/admin",
    "/customer/../admin",
    "/customer-does-not-exist",
    "/customer/requests/%ZZ",
  ])("rejects an unsafe or unauthorized customer return: %s", (value) => {
    expect(safeReturnPath(value, "CUSTOMER")).toBe("/customer")
  })
  it("preserves an allowed service entry without trusting other parameters", () => {
    const id = "00000000-0000-4000-8000-000000000001"
    expect(
      safeReturnPath(
        `/customer/requests/new?serviceId=${id}&role=ADMIN`,
        "CUSTOMER"
      )
    ).toBe(`/customer/requests/new?serviceId=${id}`)
    expect(safeReturnPath("/customer/requests/new", "TECHNICIAN")).toBe(
      "/technician"
    )
    expect(safeReturnPath(`/customer/requests/${id}`, "CUSTOMER")).toBe(
      `/customer/requests/${id}`
    )
  })
  it("does not accept client-selected roles or weak registration passwords", () => {
    expect(
      registerSchema.safeParse({
        name: "Test User",
        email: "user@example.com",
        password: "a".repeat(15),
        role: "ADMIN",
      }).success
    ).toBe(false)
    expect(
      registerSchema.safeParse({
        name: "Test User",
        email: "user@example.com",
        password: "short",
      }).success
    ).toBe(false)
    expect(
      loginSchema.parse({ email: " User@Example.com ", password: " secret " })
    ).toEqual({ email: "user@example.com", password: " secret " })
  })
  it("restores implemented work and dispatch routes only within the current role", () => {
    const id = "00000000-0000-4000-8000-000000000001"
    expect(safeReturnPath(`/admin/requests/${id}`, "ADMIN")).toBe(
      `/admin/requests/${id}`
    )
    expect(safeReturnPath(`/technician/work-orders/${id}`, "TECHNICIAN")).toBe(
      `/technician/work-orders/${id}`
    )
    expect(safeReturnPath(`/customer/work-orders/${id}`, "CUSTOMER")).toBe(
      `/customer/work-orders/${id}`
    )
    expect(safeReturnPath(`/admin/work-orders/${id}`, "CUSTOMER")).toBe(
      "/customer"
    )
    expect(safeReturnPath(`/customer/work-orders/${id}`, "TECHNICIAN")).toBe(
      "/technician"
    )
    expect(safeReturnPath("/admin/work-orders/invalid", "ADMIN")).toBe("/admin")
  })
})
