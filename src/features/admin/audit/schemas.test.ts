import { describe, expect, it } from "vitest"
import { safeReturnPath } from "@/features/auth/policy"
import { auditApiQuery, auditEventSchema, parseAuditQuery } from "./schemas"
import { safeAuditMetadata } from "./metadata"

describe("audit filters and safe event projection", () => {
  it("accepts upload events without leaking provider fields or extending API filters", () => {
    const event = auditEventSchema.parse({
      id: "11111111-1111-4111-8111-111111111111",
      actorId: null,
      entityType: "MEDIA",
      entityId: "22222222-2222-4222-8222-222222222222",
      action: "IMAGE_UPLOADED",
      createdAt: "2026-10-10T00:00:00Z",
      metadata: { purpose: "AVATAR", providerSecret: "private" },
    })
    expect(event.metadata).toEqual({ purpose: "AVATAR" })
    expect(parseAuditQuery({ entityType: "MEDIA" }).success).toBe(false)
  })
  it("converts a paired Dhaka period and forwards only supported filters", () => {
    const parsed = parseAuditQuery({
      entityType: "USER",
      action: "USER_ACCESS_UPDATED",
      from: "2026-10-01",
      to: "2026-11-01",
      page: "2",
      limit: "10",
      sort: "oldest",
      token: "never forward",
    })
    expect(parsed.success).toBe(true)
    if (!parsed.success) throw new Error("Expected valid audit query")
    expect(auditApiQuery(parsed.data)).toEqual({
      entityType: "USER",
      action: "USER_ACCESS_UPDATED",
      entityId: undefined,
      actorId: undefined,
      page: 2,
      limit: 10,
      from: "2026-10-01T00:00:00+06:00",
      to: "2026-11-01T00:00:00+06:00",
    })
  })
  it.each([
    { entityType: "SECRET" },
    { entityId: "not-a-uuid" },
    { actorId: "//evil.test" },
    { action: "work-order-completed" },
    { action: "A".repeat(81) },
    { from: "2026-10-01" },
    { from: "2026-11-01", to: "2026-10-01" },
    { from: "2026-01-01", to: "2028-01-01" },
    { page: "0" },
    { limit: "101" },
    {
      actorId: [
        "11111111-1111-4111-8111-111111111111",
        "22222222-2222-4222-8222-222222222222",
      ],
    },
  ])("rejects criteria that could misrepresent history %j", (input) => {
    expect(parseAuditQuery(input).success).toBe(false)
  })
  it("omits unrequested dates and supports future uppercase actions with empty metadata", () => {
    const parsed = parseAuditQuery({ action: "FUTURE_EVENT" })
    if (!parsed.success) throw new Error("Expected valid action syntax")
    expect(auditApiQuery(parsed.data)).not.toHaveProperty("from")
    expect(safeAuditMetadata("FUTURE_EVENT", { token: "private" })).toEqual({})
    expect(safeAuditMetadata("toString", { role: "ADMIN" })).toEqual({})
  })
  it("projects only bounded allowlisted values before serialization", () => {
    expect(
      safeAuditMetadata("USER_ACCESS_UPDATED", {
        previousRole: "CUSTOMER",
        role: "TECHNICIAN",
        status: "ACTIVE",
        previousStatus: { token: "private" },
        password: "private",
        sessions: ["private"],
      })
    ).toEqual({
      previousRole: "CUSTOMER",
      role: "TECHNICIAN",
      status: "ACTIVE",
    })
    expect(
      safeAuditMetadata("TECHNICIAN_SKILLS_UPDATED", {
        serviceIds: ["x".repeat(101)],
      })
    ).toEqual({})
    expect(
      safeAuditMetadata("TECHNICIAN_SKILLS_UPDATED", {
        serviceIds: Array.from({ length: 101 }, () => "id"),
      })
    ).toEqual({})
    expect(
      safeAuditMetadata("PAYMENT_RECEIPT_REVIEW", {
        reason: "x".repeat(101),
        providerSecret: "private",
      })
    ).toEqual({})
  })
  it("preserves legitimate scalar and list evidence without exposing extra fields", () => {
    expect(
      safeAuditMetadata("SERVICE_UPDATED", {
        updatedFields: ["basePriceMinor"],
        previousBasePriceMinor: 100,
        basePriceMinor: 200,
        passwordHash: "private",
      })
    ).toEqual({
      updatedFields: ["basePriceMinor"],
      previousBasePriceMinor: 100,
      basePriceMinor: 200,
    })
    const event = auditEventSchema.parse({
      id: "11111111-1111-4111-8111-111111111111",
      actorId: null,
      entityType: "USER",
      entityId: "22222222-2222-4222-8222-222222222222",
      action: "USER_ACCESS_UPDATED",
      createdAt: "2026-10-09T00:00:00Z",
      metadata: { role: "TECHNICIAN", refreshToken: "private" },
      secret: "private",
    })
    expect(event.metadata).toEqual({ role: "TECHNICIAN" })
    expect(event).not.toHaveProperty("secret")
  })
  it("keeps audit returns restricted to ADMIN", () => {
    expect(
      safeReturnPath("/admin/audit-logs?entityType=USER&page=2", "ADMIN")
    ).toBe("/admin/audit-logs?entityType=USER&page=2")
    expect(safeReturnPath("/admin/audit-logs", "CUSTOMER")).toBe("/customer")
    expect(safeReturnPath("/admin/audit-logs", "TECHNICIAN")).toBe(
      "/technician"
    )
  })
})
