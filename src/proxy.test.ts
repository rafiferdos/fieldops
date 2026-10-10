import { describe, expect, it } from "vitest"
import { NextRequest } from "next/server"
import { proxy } from "./proxy"

describe("protected route preflight", () => {
  it("retains the same-origin destination and query when redirecting missing sessions", () => {
    const response = proxy(
      new NextRequest(
        "https://fieldops.test/admin/audit-logs?action=IMAGE_UPLOADED&page=2"
      )
    )
    const target = new URL(response.headers.get("location") ?? "")
    expect(response.status).toBe(307)
    expect(target.origin).toBe("https://fieldops.test")
    expect(target.pathname).toBe("/login")
    expect(target.searchParams.get("returnTo")).toBe(
      "/admin/audit-logs?action=IMAGE_UPLOADED&page=2"
    )
  })
  it("never accepts the development cookie on HTTPS", () => {
    expect(
      proxy(
        new NextRequest("https://fieldops.test/admin", {
          headers: { cookie: `fieldops-session=${"a".repeat(43)}` },
        })
      ).status
    ).toBe(307)
  })
  it.each(["bad", "a".repeat(42), "a".repeat(44), "/".repeat(43)])(
    "rejects malformed opaque cookies %s",
    (cookie) => {
      expect(
        proxy(
          new NextRequest("https://fieldops.test/account", {
            headers: { cookie: `__Host-fieldops-session=${cookie}` },
          })
        ).status
      ).toBe(307)
    }
  )
  it.each(["http://localhost:3001", "https://fieldops.test"])(
    "allows only the correct shaped cookie for %s to reach server authorization",
    (origin) => {
      const cookieName = origin.startsWith("https:")
        ? "__Host-fieldops-session"
        : "fieldops-session"
      const response = proxy(
        new NextRequest(`${origin}/customer`, {
          headers: { cookie: `${cookieName}=${"a".repeat(43)}` },
        })
      )
      expect(response.headers.get("x-middleware-next")).toBe("1")
      expect(response.headers.has("location")).toBe(false)
    }
  )
})
