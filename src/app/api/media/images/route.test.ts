import { beforeEach, expect, it, vi } from "vitest"
import { getViewer } from "@/features/auth/session"
import { apiRequest } from "@/infrastructure/api/server"
import { POST } from "./route"
vi.mock("server-only", () => ({}))
vi.mock("@/features/auth/session", () => ({ getViewer: vi.fn() }))
vi.mock("@/infrastructure/api/server", () => ({ apiRequest: vi.fn() }))
vi.mock("@/infrastructure/env/auth", () => ({
  getAuthEnv: () => ({ APP_ORIGIN: "http://localhost:3001" }),
}))

const profile = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Image Test Customer",
  email: "media@example.com",
  role: "CUSTOMER",
  createdAt: "2026-10-10T00:00:00Z",
  phone: null,
  avatarUrl: null,
} satisfies NonNullable<Awaited<ReturnType<typeof getViewer>>>["profile"]
function request(
  purpose = "AVATAR",
  origin = "http://localhost:3001",
  extra = false
) {
  const body = new FormData()
  body.set("purpose", purpose)
  body.set("file", new File(["image"], "photo.png", { type: "image/png" }))
  if (extra) body.set("ownerId", "another-owner")
  return new Request("http://localhost:3001/api/media/images", {
    method: "POST",
    body,
    headers: { Origin: origin },
  })
}
beforeEach(() => {
  vi.mocked(getViewer).mockResolvedValue({
    profile,
    accessToken: "server-only-test-token",
  })
})
it("rejects a foreign origin before session access", async () => {
  expect((await POST(request("AVATAR", "https://evil.example"))).status).toBe(
    403
  )
  expect(getViewer).not.toHaveBeenCalled()
  expect(apiRequest).not.toHaveBeenCalled()
})
it("denies anonymous uploads", async () => {
  vi.mocked(getViewer).mockResolvedValue(null)
  expect((await POST(request())).status).toBe(401)
  expect(apiRequest).not.toHaveBeenCalled()
})
it("denies customer catalog uploads before forwarding", async () => {
  expect((await POST(request("SERVICE"))).status).toBe(403)
  expect(apiRequest).not.toHaveBeenCalled()
})
it("rejects client-supplied ownership fields", async () => {
  expect(
    (await POST(request("AVATAR", "http://localhost:3001", true))).status
  ).toBe(400)
  expect(apiRequest).not.toHaveBeenCalled()
})
it("keeps Bearer credentials on the server and returns only a validated image reference", async () => {
  const image = {
    id: "22222222-2222-4222-8222-222222222222",
    url: "https://res.cloudinary.com/demo/image/upload/v1/fieldops/avatar/photo.webp",
  }
  vi.mocked(apiRequest).mockResolvedValue({
    success: true,
    message: "Image uploaded",
    data: image,
  })
  const response = await POST(request())
  expect(response.status).toBe(200)
  expect(response.headers.get("cache-control")).toBe("private, no-store")
  expect(await response.json()).toEqual({ ok: true, data: image })
  const options = vi.mocked(apiRequest).mock.calls[0]?.[2]
  expect(options?.accessToken).toBe("server-only-test-token")
  expect(options?.body).toBeInstanceOf(FormData)
})
