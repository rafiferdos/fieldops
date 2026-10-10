import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { cookies } from "next/headers"
import { RequestCookiesAdapter } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import { apiRequest } from "@/infrastructure/api/server"
import { readStoredSession } from "@/infrastructure/session/store"
import { SessionStorageUnavailableError } from "@/infrastructure/session/error"
import { getViewerAvailability, requireViewer } from "./session"

vi.mock("server-only", () => ({}))
vi.mock("next/headers", () => ({ cookies: vi.fn() }))
vi.mock("@/infrastructure/api/server", () => ({ apiRequest: vi.fn() }))
vi.mock("@/infrastructure/session/store", () => ({
  readStoredSession: vi.fn(),
  createStoredSession: vi.fn(),
  deleteStoredSession: vi.fn(),
  withSessionLock: vi.fn(),
}))

// Only the cookie accessor is relevant; preserve the real Next.js return type.
const cookieJar = new Map<string, { name: string; value: string }>()
beforeEach(async () => {
  vi.stubEnv("APP_ORIGIN", "http://localhost:3001")
  vi.stubEnv("SESSION_REDIS_URL", "redis://127.0.0.1:6397")
  vi.stubEnv("SESSION_ENCRYPTION_KEY", Buffer.alloc(32, 1).toString("base64"))
  cookieJar.clear()
  const { RequestCookies } =
    await import("next/dist/compiled/@edge-runtime/cookies")
  vi.mocked(cookies).mockImplementation(() => {
    const jar = new RequestCookies(new Headers())
    for (const { name, value } of cookieJar.values()) jar.set(name, value)
    return Promise.resolve(RequestCookiesAdapter.seal(jar))
  })
})

afterEach(() => vi.unstubAllEnvs())

function savedCookie() {
  cookieJar.set("fieldops-session", {
    name: "fieldops-session",
    value: "x".repeat(43),
  })
}

it("keeps anonymous public browsing independent of session storage", async () => {
  expect(await getViewerAvailability()).toEqual({
    available: true,
    viewer: null,
  })
  expect(readStoredSession).not.toHaveBeenCalled()
  expect(apiRequest).not.toHaveBeenCalled()
})

it("shows a recoverable outage while protected reads still fail closed", async () => {
  savedCookie()
  vi.mocked(readStoredSession).mockRejectedValue(
    new SessionStorageUnavailableError()
  )
  expect(await getViewerAvailability()).toEqual({ available: false })
  await expect(requireViewer("ADMIN")).rejects.toBeInstanceOf(
    SessionStorageUnavailableError
  )
  expect(apiRequest).not.toHaveBeenCalled()
})

it("distinguishes a missing stored session from a dependency outage", async () => {
  savedCookie()
  vi.mocked(readStoredSession).mockResolvedValue(null)
  expect(await getViewerAvailability()).toEqual({
    available: true,
    viewer: null,
  })
  expect(apiRequest).not.toHaveBeenCalled()
})

it("does not hide unexpected authentication errors as an outage", async () => {
  savedCookie()
  const unexpected = new Error("Unexpected implementation failure")
  vi.mocked(readStoredSession).mockRejectedValue(unexpected)
  await expect(getViewerAvailability()).rejects.toBe(unexpected)
})
