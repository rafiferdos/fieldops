import { beforeEach, describe, expect, it, vi } from "vitest"
import { ApiError } from "@/infrastructure/api/error"

const mocks = vi.hoisted(() => ({ viewer: vi.fn(), dashboard: vi.fn() }))
vi.mock("@/features/auth/session", () => ({ getViewer: mocks.viewer }))
vi.mock("@/features/workspace/server", () => ({
  getDashboard: mocks.dashboard,
}))
import { GET } from "./route"

describe("private dashboard transport", () => {
  beforeEach(() => {
    mocks.viewer.mockResolvedValue({
      profile: { id: "00000000-0000-4000-8000-000000000001", role: "CUSTOMER" },
      accessToken: "server-only-token",
    })
    mocks.dashboard.mockResolvedValue({
      role: "CUSTOMER",
      viewerId: "00000000-0000-4000-8000-000000000001",
    })
  })
  it("denies anonymous reads without accessing metrics", async () => {
    mocks.viewer.mockResolvedValue(null)
    const response = await GET(
      new Request("https://fieldops.example/api/workspace/overview")
    )
    expect(response.status).toBe(401)
    expect(mocks.dashboard).not.toHaveBeenCalled()
    expect(response.headers.get("cache-control")).toBe("private, no-store")
  })
  it.each([
    "role=ADMIN",
    "customerId=other",
    "from=2026-01-01&from=2026-02-01",
    "from=2026-01-01&to=2026-02-01",
    "from=invalid",
  ])("rejects customer scope/filter injection: %s", async (query) => {
    const response = await GET(
      new Request(`https://fieldops.example/api/workspace/overview?${query}`)
    )
    expect(response.status).toBe(400)
    expect(mocks.dashboard).not.toHaveBeenCalled()
  })
  it("passes only the verified viewer and validated admin period", async () => {
    mocks.viewer.mockResolvedValue({
      profile: { role: "ADMIN" },
      accessToken: "private",
    })
    const response = await GET(
      new Request(
        "https://fieldops.example/api/workspace/overview?from=2026-01-01&to=2026-02-01"
      )
    )
    expect(response.status).toBe(200)
    expect(mocks.dashboard).toHaveBeenCalledWith(
      { profile: { role: "ADMIN" }, accessToken: "private" },
      { from: "2026-01-01", to: "2026-02-01" },
      expect.any(AbortSignal)
    )
    expect(response.headers.get("vary")).toBe("Cookie")
    expect(await response.text()).not.toContain("private")
  })
  it("does not disguise a failed API read as zero or disclose its cause", async () => {
    mocks.dashboard.mockRejectedValue(new Error("database password secret"))
    const response = await GET(
      new Request("https://fieldops.example/api/workspace/overview")
    )
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain("secret")
  })
  it("preserves revoked-access failures", async () => {
    mocks.viewer.mockRejectedValue(new ApiError("blocked", "http", 403))
    expect(
      (
        await GET(
          new Request("https://fieldops.example/api/workspace/overview")
        )
      ).status
    ).toBe(403)
  })
})
