import { describe, expect, it } from "vitest"
import { safeReturnPath } from "@/features/auth/policy"
import {
  accessUpdateSchema,
  changedAccess,
  managedUserSchema,
  parseManagedUsersQuery,
} from "./schemas"

describe("managed access boundaries", () => {
  it("allowlists directory filters and normalizes empty selections", () => {
    const parsed = parseManagedUsersQuery({
      q: "  FieldOps  ",
      role: "",
      status: "ACTIVE",
      sort: "oldest",
      page: "2",
      limit: "10",
      password: "ignored",
    })
    expect(parsed.success && parsed.data).toEqual({
      q: "FieldOps",
      role: undefined,
      status: "ACTIVE",
      sort: "oldest",
      page: 2,
      limit: 10,
    })
  })
  it.each([
    { role: "OWNER" },
    { status: "DELETED" },
    { page: "0" },
    { limit: "101" },
    { q: "x".repeat(101) },
    { role: ["ADMIN", "CUSTOMER"] },
    { q: ["Alice", "Bob"] },
  ])("does not broaden invalid directory criteria %j", (input) => {
    expect(parseManagedUsersQuery(input).success).toBe(false)
  })
  it.each([
    {},
    { role: "OWNER" },
    { status: "DELETED" },
    { role: "ADMIN", password: "secret" },
    { status: null },
  ])("rejects unsupported access writes %j", (input) => {
    expect(accessUpdateSchema.safeParse(input).success).toBe(false)
  })
  it("sends only actual changes and prevents no-op submissions", () => {
    const current = {
      role: "CUSTOMER",
      status: "ACTIVE",
      updatedAt: "2026-10-09T00:00:00Z",
    } as const
    const parsed = changedAccess(current, {
      role: "CUSTOMER",
      status: "SUSPENDED",
    })
    expect(parsed.success && parsed.data).toEqual({ status: "SUSPENDED" })
    expect(
      changedAccess(current, { role: "CUSTOMER", status: "ACTIVE" }).success
    ).toBe(false)
  })
  it("does not pass extra credential fields from a directory response to the client", () => {
    const parsed = managedUserSchema.parse({
      id: "11111111-1111-4111-8111-111111111111",
      name: "Test User",
      email: "test@example.com",
      role: "CUSTOMER",
      status: "ACTIVE",
      createdAt: "2026-10-09T00:00:00Z",
      updatedAt: "2026-10-09T00:00:00Z",
      passwordHash: "private",
      sessions: [],
    })
    expect(parsed).not.toHaveProperty("passwordHash")
    expect(parsed).not.toHaveProperty("sessions")
  })
  it("preserves the directory return only for ADMIN", () => {
    expect(safeReturnPath("/admin/users?role=CUSTOMER&page=2", "ADMIN")).toBe(
      "/admin/users?role=CUSTOMER&page=2"
    )
    expect(safeReturnPath("/admin/users?role=ADMIN", "CUSTOMER")).toBe(
      "/customer"
    )
    expect(safeReturnPath("/admin/users", "TECHNICIAN")).toBe("/technician")
  })
})
